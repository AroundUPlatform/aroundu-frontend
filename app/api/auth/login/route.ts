import { NextResponse } from "next/server";
import { apiBaseFallback } from "../../../../utils/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || apiBaseFallback;
const SECURE = process.env.NODE_ENV === "production";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 3; // 3 days

const normalizeRole = (role: string): "ADMIN" | "CLIENT" | "WORKER" => {
    const clean = role?.replace("ROLE_", "")?.toUpperCase();
    if (clean === "ADMIN" || clean === "CLIENT" || clean === "WORKER") return clean;
    return "CLIENT";
};

export async function POST(request: Request) {
    const { email, password } = await request.json();
    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, password }),
        });
    } catch (err) {
        return NextResponse.json({ message: "Service is temporarily unavailable. Please try again soon." }, { status: 503 });
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const unavailable = response.status === 502 || response.status === 503;
        const message = unavailable
            ? "Service is temporarily unavailable. Please try again soon."
            : (payload as any)?.message || response.statusText || "Login failed";
        return NextResponse.json({ message }, { status: unavailable ? 503 : response.status });
    }

    const { token, userId, role, email: payloadEmail } = payload as { token: string; userId: number; role: string; email: string };
    if (!token || !userId || !role) {
        return NextResponse.json({ message: "Malformed login response" }, { status: 500 });
    }

    const normalizedRole = normalizeRole(role);
    const res = NextResponse.json({ userId, email: payloadEmail, role: normalizedRole });

    res.cookies.set({
        name: "au_jwt",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: SECURE,
        path: "/",
        maxAge: MAX_AGE_SECONDS,
    });

    res.cookies.set({
        name: "au_session",
        value: JSON.stringify({ userId, email: payloadEmail, role: normalizedRole }),
        httpOnly: false,
        sameSite: "lax",
        secure: SECURE,
        path: "/",
        maxAge: MAX_AGE_SECONDS,
    });

    return res;
}
