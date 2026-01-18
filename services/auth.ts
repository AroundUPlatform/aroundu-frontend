import type { Role, Session } from "../types/auth";

const normalizeRole = (role: string): Role => {
    const clean = role?.replace("ROLE_", "");
    if (clean === "ADMIN" || clean === "CLIENT" || clean === "WORKER") return clean;
    return "CLIENT";
};

export async function login(email: string, password: string): Promise<Session> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error((payload as any)?.message || "Login failed");

    return {
        userId: (payload as any)?.userId,
        email: (payload as any)?.email,
        role: normalizeRole((payload as any)?.role),
    };
}

export async function logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
