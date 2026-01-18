"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../components/layout/AuthProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;
        if (!session) return;
        if (session.role === "ADMIN") router.replace("/admin");
        else if (session.role === "WORKER") router.replace("/worker/dashboard");
        else router.replace("/client/dashboard");
    }, [session, loading, router]);

    const publicLinks = [
        { href: "/", label: "Home" },
        { href: "/login", label: "Login" },
        { href: "/signup", label: "Signup" },
    ];

    return (
        <div>
            <header className="sticky top-0 z-10 border-b border-border/70 bg-surface/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
                    <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-strong text-xs font-extrabold text-slate-950">
                            AU
                        </div>
                        <div>
                            <div className="text-base font-extrabold">AroundU</div>
                            <div className="text-xs text-muted">Local jobs with trust</div>
                        </div>
                    </div>
                    <nav className="flex flex-wrap items-center gap-2">
                        {publicLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href} className={`badge ${active ? "border-brand text-text" : ""}`}>
                                    {link.label}
                                </Link>
                            );
                        })}
                        {session && <span className="chip">Signed in as {session.role}</span>}
                    </nav>
                </div>
            </header>
            <main className="layout-shell pt-8">
                {children}
            </main>
        </div>
    );
}
