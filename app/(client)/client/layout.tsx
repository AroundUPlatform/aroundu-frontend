"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../components/layout/AuthProvider";
import { useTheme } from "../../../components/layout/ThemeProvider";
import { cn } from "../../../lib/cn";
import { logoForTheme } from "../../../utils/assets";

const nav = [
    { href: "/client/dashboard", label: "My Tasks", icon: "📋" },
    { href: "/client/create", label: "Post Task", icon: "➕" },
    { href: "/client/conversations", label: "Conversations", icon: "💬" },
    { href: "/client/profile", label: "Profile", icon: "👤" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { session, logout, loading } = useAuth();
    const { resolved, setTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-pulse text-muted">Checking session…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-surface/90 backdrop-blur-xl px-4 py-3 lg:hidden">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-xl"
                >
                    ☰
                </motion.button>
                <Image
                    src={logoForTheme(resolved)}
                    alt="AroundU"
                    width={100}
                    height={28}
                    className="h-7 w-auto"
                />
                <motion.button
                    whileTap={{ scale: 0.85, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                    className="text-lg"
                >
                    {resolved === "dark" ? "☀️" : "🌙"}
                </motion.button>
            </header>

            <div className="mx-auto flex max-w-7xl gap-0 lg:gap-6 lg:px-6 lg:py-6">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border/60 bg-surface transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100vh-3rem)] lg:translate-x-0 lg:rounded-2xl lg:border",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                >
                    <div className="flex h-full flex-col p-5">
                        {/* Logo – desktop */}
                        <div className="mb-6 hidden lg:block">
                            <Image
                                src={logoForTheme(resolved)}
                                alt="AroundU"
                                width={120}
                                height={32}
                                className="h-8 w-auto"
                            />
                        </div>

                        {/* User badge */}
                        <div className="mb-5 rounded-xl bg-brand/5 p-3">
                            <div className="text-sm font-semibold text-text">{session.email?.split("@")[0]}</div>
                            <div className="text-xs text-muted">{session.email}</div>
                        </div>

                        {/* Nav links */}
                        <nav className="flex-1 space-y-1">
                            {nav.map((item) => {
                                const active = pathname === item.href || (item.href !== "/client/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                                            "transition-all duration-200 ease-out",
                                            active
                                                ? "bg-brand/10 text-brand shadow-sm"
                                                : "text-muted hover:bg-surface-strong hover:text-text hover:translate-x-1",
                                        )}
                                    >
                                        <span className="text-base">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Bottom actions */}
                        <div className="space-y-2 border-t border-border/60 pt-4">
                            <button
                                onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                                className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-all duration-200 hover:bg-surface-strong hover:text-text hover:translate-x-1 lg:flex"
                            >
                                <motion.span
                                    key={resolved}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="text-base"
                                >
                                    {resolved === "dark" ? "☀️" : "🌙"}
                                </motion.span>
                                {resolved === "dark" ? "Light mode" : "Dark mode"}
                            </button>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger transition-all duration-200 hover:bg-danger/10 hover:translate-x-1"
                            >
                                <span className="text-base">🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Main content */}
                <main className="min-w-0 flex-1 p-4 lg:p-0">{children}</main>
            </div>
        </div>
    );
}
