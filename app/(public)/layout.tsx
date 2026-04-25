"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../components/layout/AuthProvider";
import { useTheme } from "../../components/layout/ThemeProvider";
import { logoForTheme } from "../../utils/assets";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();
    const { resolved, setTheme } = useTheme();
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
        { href: "/login", label: "Sign In" },
        { href: "/signup", label: "Sign Up" },
    ];

    return (
        <div>
            <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src={logoForTheme(resolved)}
                            alt="AroundU"
                            width={36}
                            height={36}
                            className="rounded-lg"
                        />
                        <div>
                            <div className="text-base font-extrabold leading-tight">AroundU</div>
                            <div className="text-[0.65rem] text-muted">Hyperlocal Services</div>
                        </div>
                    </Link>
                    <nav className="flex items-center gap-2">
                        {publicLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`nav-link ${active ? "active" : ""}`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <motion.button
                            whileTap={{ scale: 0.85, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                            className="ml-2 rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-white/10 hover:text-text"
                            aria-label="Toggle theme"
                        >
                            <motion.span
                                key={resolved}
                                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                {resolved === "dark" ? "☀️" : "🌙"}
                            </motion.span>
                        </motion.button>
                    </nav>
                </div>
            </header>
            <main className="layout-shell pt-8">{children}</main>
        </div>
    );
}
