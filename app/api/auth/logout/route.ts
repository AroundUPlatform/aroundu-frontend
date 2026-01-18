import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set({ name: "au_jwt", value: "", path: "/", httpOnly: true, expires: new Date(0) });
    res.cookies.set({ name: "au_session", value: "", path: "/", httpOnly: false, expires: new Date(0) });
    return res;
}
