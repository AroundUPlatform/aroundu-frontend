import Cookies from "js-cookie";
import type { Session } from "../types/auth";

const SESSION_COOKIE = "au_session";

export const readSessionFromCookie = (): Session | null => {
    const raw = Cookies.get(SESSION_COOKIE);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as Session;
        if (!parsed?.role || !parsed?.email) return null;
        return parsed;
    } catch (err) {
        console.error("Invalid session cookie", err);
        return null;
    }
};

export const persistSessionCookie = (session: Session) => {
    Cookies.set(SESSION_COOKIE, JSON.stringify(session), {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: 3,
        path: "/",
    });
};

export const clearSessionCookie = () => {
    Cookies.remove(SESSION_COOKIE, { path: "/" });
};
