import { AuthData, UserData } from '@/types';
import { Q } from '@nozbe/watermelondb';
import { Observable, firstValueFrom, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { database, userCollection } from '..';
import Session from '../models/sessions';
import User from '../models/users';
import {
    activateSession,
    activeSession$,
    createSession,
    deactivateUserSessions,
    endCurrentSession,
    storedSessionId$,
} from './sessionsService';
import { hashPassword, verifyPassword } from '@/utils/passwordHash';

export const currentUser$: Observable<User | null> = activeSession$.pipe(
    switchMap((s) => {
        if (!s?.userId) return of(null);
        return userCollection.findAndObserve(s.userId).pipe(map((u) => u ?? null));
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay(1),
);

export async function authenticateUser(data: AuthData): Promise<User | null> {
    console.log('Authenticating user with email:', data.email);
    const user = await firstValueFrom(
        userCollection
            .query(Q.where('email', data.email.trim()))
            .observe()
            .pipe(map((users) => (users.length > 0 ? users[0] : null))),
    );
    if (!user?.id) {
        throw new Error('User not found');
    }
    console.log('User found:', user.email, "password hash", user.passwordHash);
    // Verify password
    if (!data.password) {
        throw new Error('Password is required');
    }
    const isValid = await verifyPassword(data.password.trim(), user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid password');

    }   
     const existing = await database
        .get<Session>('sessions')
        .query(Q.where('user_id', user.id))
        .fetch();

    if (existing.length === 0) {
        const s = await createSession(user.id);
        if (s) return user;
        return null;
    }

    if (!existing[0].isActive) {
        await activateSession(existing[0].id);
    } else {
        storedSessionId$.next(existing[0].id);
    }

    return user;
}

export async function logout(): Promise<void> {
    const user = await firstValueFrom(currentUser$);
    if (!user?.id) {
        await endCurrentSession();
        return;
    }
    await deactivateUserSessions(user.id);
    await endCurrentSession();
}

export async function createUser(userData: UserData): Promise<User> {
    try {
        const user = await database.write(async () => {
            return await userCollection.create((u) => {
                u.externalId = `usr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                u.email = userData.email.trim();
                u.name = userData.name.trim();
                u.phone = userData.phone.trim();
                u.passwordHash = userData.password?.trim() || '';
                u.pinHash = userData.pin || '';
                u.deleted = false;
                u.isOwner = !!userData.isOwner;
            });
        });
        await createSession(user.id);
        return user;
    } catch (e) {
        throw Error(`error adding user ${e}`);
    }
}

export function observeUserById(id: string): Observable<User | null> {
    return new Observable<User | null>((observer) => {
        userCollection
            .find(id)
            .then((u) => {
                if (u) {
                    const sub = u.observe().subscribe(observer);
                    return () => sub.unsubscribe();
                } else {
                    observer.next(null);
                    observer.complete();
                }
            })
            .catch((e) => observer.error(e));
    }).pipe(shareReplay(1));
}
