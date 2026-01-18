"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../../components/layout/AuthProvider";

const nav = [
    { href: "/client/dashboard", label: "Dashboard" },
    { href: "/client/dashboard?tab=jobs", label: "Jobs" },
    { href: "/client/dashboard?tab=payments", label: "Payments" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { session, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;
        if (!session) {
            router.replace("/login?next=/client/dashboard");
            return;
        }
        if (session.role !== "CLIENT") {
            if (session.role === "ADMIN") router.replace("/admin");
            else router.replace("/worker/dashboard");
        }
    }, [session, router, loading]);

    if (!session) return <div className="card p-6">Checking session...</div>;

    return (
        <div className="layout-shell">
            <div className="grid items-start gap-4 lg:grid-cols-[240px,1fr]">
                <aside className="card sticky top-12 space-y-3 p-5">
                    <div className="text-lg font-semibold">Client workspace</div>
                    <div className="muted text-xs">Signed in as {session.email}</div>
                    <div className="grid gap-2 pt-1">
                        {nav.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                    <button className="btn ghost mt-3 w-full" onClick={logout}>
                        Logout
                    </button>
                </aside>
                <section className="card space-y-4 p-5">
                    <header className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="kicker">Client dashboard</div>
                            <h2 className="text-xl font-semibold">Jobs & payments</h2>
                        </div>
                        <div className="chip">Role: Client</div>
                    </header>
                    <div>{children}</div>
                </section>
            </div>
        </div>
    );
}
