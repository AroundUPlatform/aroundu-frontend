"use client";

import { createContext, useContext, useState } from "react";
import type { Session } from "../../types/auth";
import { clearSessionCookie, persistSessionCookie, readSessionFromCookie } from "../../utils/cookies";
import { logout as apiLogout } from "../../services/auth";

interface AuthContextValue {
    session: Session | null;
    loading: boolean;
    setSession: (session: Session) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSessionState] = useState<Session | null>(() => readSessionFromCookie() ?? null);
    const [loading, setLoading] = useState(false);

    const setSession = (next: Session) => {
        setSessionState(next);
        persistSessionCookie(next);
    };

    const logout = async () => {
        clearSessionCookie();
        setSessionState(null);
        await apiLogout();
    };

    return <AuthContext.Provider value={{ session, loading, setSession, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
