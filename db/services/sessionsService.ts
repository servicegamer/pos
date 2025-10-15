import { Q } from '@nozbe/watermelondb';
import Session from '../models/sessions';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { database, sessionCollection } from '..';

export const storedSessionId$ = new BehaviorSubject<string | null>(null);

async function initFromStorage() {
    try {
        // Find the first active session in the database
        const activeSessions = await sessionCollection
            .query(Q.where('is_active', true), Q.sortBy('created_at', Q.desc))
            .fetch();

        if (activeSessions.length > 0) {
            // Use the most recent active session
            const session = activeSessions[0];
            storedSessionId$.next(session.id);
        } else {
            storedSessionId$.next(null);
        }
    } catch (e) {
        console.log('error init storage ', e);
        throw e;
    }
}

initFromStorage();

export const activeSession$: Observable<Session | null> = storedSessionId$.pipe(
    switchMap((id) => {
        if (!id) return of(null);
        return sessionCollection.findAndObserve(id).pipe(map((s) => (s && s.isActive ? s : null)));
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay(1),
);

export const isAuthenticated$: Observable<boolean> = activeSession$.pipe(
    map((s) => !!s?.isActive),
    distinctUntilChanged(),
    shareReplay(1),
);
export async function getSession(sessionId: string): Promise<Session | null> {
    try {
        return await sessionCollection.find(sessionId);
    } catch {
        return null;
    }
}

export async function createSession(userId: string): Promise<Session | null> {
    try {
        await deactivateUserSessions(userId);
        const session = await database.write(async () => {
            return await sessionCollection.create((s) => {
                s.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                s.userId = userId;
                s.isActive = true;
            });
        });
        storedSessionId$.next(session.id);
        return session;
    } catch {
        return null;
    }
}

export async function activateSession(sessionId: string): Promise<void> {
    const session = await getSession(sessionId);
    if (!session) return;
    await database.write(async () => {
        await session.update((s) => {
            s.isActive = true;
        });
    });
    storedSessionId$.next(sessionId);
}

export async function deactivateUserSessions(userId: string): Promise<void> {
    const sessions = await sessionCollection
        .query(Q.where('user_id', userId), Q.where('is_active', true))
        .fetch();

    if (sessions.length === 0) return;
    await database.write(async () => {
        for (const s of sessions) {
            await s.update((row) => {
                row.isActive = false;
            });
        }
    });
}

export async function endCurrentSession(): Promise<void> {
    const id = storedSessionId$.value;
    if (!id) return;
    const session = await getSession(id);
    if (session) {
        await database.write(async () => {
            await session.update((s) => {
                s.isActive = false;
            });
        });
    }
    storedSessionId$.next(null);
}
