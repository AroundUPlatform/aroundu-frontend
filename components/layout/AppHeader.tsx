"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const links = [
    { href: "/", label: "Home" },
    { href: "/login", label: "Login" },
    { href: "/signup", label: "Signup" },
    { href: "/client/dashboard", label: "Client" },
    { href: "/worker/dashboard", label: "Worker" },
    { href: "/admin", label: "Admin" },
];

export function AppHeader() {
    const { session, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const onLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-20 border-b border-border/70 bg-surface/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-strong text-sm font-extrabold text-slate-950">
                        AU
                    </div>
                    <div className="leading-tight">
                        <div className="text-base font-extrabold tracking-tight">AroundU</div>
                        <div className="text-xs text-muted">Local jobs that start with trust</div>
                    </div>
                </div>
                <nav className="flex flex-wrap items-center gap-2">
                    {links.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} className={`badge ${active ? "border-brand text-text" : ""}`}>
                                {link.label}
                            </Link>
                        );
                    })}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="chip border-brand/50 bg-brand/15 text-brand">
                                {session.role} · #{session.userId}
                            </span>
                            <button className="btn ghost" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn primary">
                            Get Started
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
