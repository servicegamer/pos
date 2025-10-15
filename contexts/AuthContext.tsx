import { authenticateUser, logout as authLogout, currentUser$ } from '@/db/services/userService';
import type Session from '@/db/models/sessions';
import type User from '@/db/models/users';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Subscription } from 'rxjs';
import { activeSession$, isAuthenticated$ } from '@/db/services/sessionsService';

export type AuthState = {
    isAuthenticated: boolean;
    activeSession: Session | null;
    user: User | null;
    isLoading: boolean; // initial auth check (e.g. restoring session)
    isUpdating: boolean; // when login/logout is in progress
};

export type AuthContextValue = AuthState & {
    login: (email: string, password?: string) => Promise<User | null>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // subscribe to observables (reactive updates from DB/session)
    useEffect(() => {
        const subs: Subscription[] = [];
        // The `activeSession$`, `currentUser$` and `isAuthenticated$` observables are
        // defined in `services/userService.ts` and are backed by WatermelonDB
        // reactive queries. Subscribing to them keeps this React context in sync with
        // database changes (for example: sessions created/updated elsewhere in the app).
        //
        // We intentionally use direct subscription here (not `useObservable`) because
        // we want explicit control over lifecycle and multiple subscriptions.
        subs.push(activeSession$.subscribe(setActiveSession));
        subs.push(currentUser$.subscribe(setUser));
        subs.push(
            isAuthenticated$.subscribe((val) => {
                // update the boolean auth flag and mark the initial loading as finished
                // once we have a concrete auth state from the DB.
                setIsAuthenticated(val);
                setIsLoading(false); // once we know auth state, we’re done loading
            }),
        );

        return () => subs.forEach((s) => s.unsubscribe());
    }, []);

    const value: AuthContextValue = useMemo(
        () => ({
            isAuthenticated,
            activeSession,
            user,
            isLoading,
            isUpdating,
            login: async (email: string, password?: string) => {
                try {
                    setIsUpdating(true);
                    // `authenticateUser` uses WatermelonDB queries and will create or
                    // activate a session for the provided user. It returns the `User` model
                    // if authentication succeeded, or `null` otherwise.
                    //
                    // Note: password validation is kept simple in the current service; if
                    // you add hashing/checks, ensure `authenticateUser` performs them.
                    return await authenticateUser({ email, password });
                } finally {
                    setIsUpdating(false);
                }
            },
            logout: async () => {
                try {
                    setIsUpdating(true);
                    // `authLogout` deactivates sessions and clears current session state
                    // in the DB. The subscriptions above will react to those DB changes
                    // and update `isAuthenticated`, `activeSession`, and `user`.
                    await authLogout();
                } finally {
                    setIsUpdating(false);
                }
            },
        }),
        [isAuthenticated, activeSession, user, isLoading, isUpdating],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
