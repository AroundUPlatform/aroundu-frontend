"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { login } from "../../../services/auth";
import type { Role } from "../../../types/auth";
import { useAuth } from "../../../components/layout/AuthProvider";
import { IMG_LOGIN } from "../../../utils/assets";

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};

function LoginPageInner() {
    const [role, setRole] = useState<Role>("CLIENT");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { setSession, session } = useAuth();
    const params = useSearchParams();

    useEffect(() => {
        const prefill = params.get("email");
        if (prefill) setEmail(prefill);
    }, [params]);

    useEffect(() => {
        if (!session) return;
        if (session.role === "ADMIN") router.replace("/admin");
        else if (session.role === "WORKER") router.replace("/worker/dashboard");
        else router.replace("/client/dashboard");
    }, [session, router]);

    const submit = async () => {
        setBusy(true);
        setError(null);
        try {
            const sessionPayload = await login(email, password);
            if (role !== sessionPayload.role) {
                setError(`This account is ${sessionPayload.role.toLowerCase()}. Choose the correct role to continue.`);
                setBusy(false);
                return;
            }
            setSession(sessionPayload);
            if (sessionPayload.role === "ADMIN") router.push("/admin");
            else if (sessionPayload.role === "WORKER") router.push("/worker/dashboard");
            else router.push("/client/dashboard");
        } catch (err: any) {
            setError(err?.message ?? "Login failed");
        } finally {
            setBusy(false);
        }
    };

    const unavailable = error ? /unavailable|refused|offline/i.test(error) : false;

    return (
        <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Illustration */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative mx-auto hidden h-[460px] w-full max-w-sm md:block"
            >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand/15 to-transparent blur-2xl" />
                <Image
                    src={IMG_LOGIN}
                    alt="Login illustration"
                    fill
                    className="rounded-3xl object-contain"
                    priority
                />
            </motion.div>

            {/* Form */}
            <motion.div
                initial="hidden"
                animate="visible"
                className="card space-y-5 p-7"
            >
                <motion.div variants={fadeUp} custom={0} className="space-y-1">
                    <div className="kicker">Welcome back</div>
                    <h2 className="text-2xl font-semibold">Sign in to your dashboard</h2>
                </motion.div>

                {unavailable && (
                    <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-danger/60 bg-danger/10 p-4 text-center">
                        <div className="kicker text-danger">Service unavailable</div>
                        <p className="mt-1 text-sm text-muted">We&apos;re facing an issue. Please try again later.</p>
                    </motion.div>
                )}

                <motion.div variants={fadeUp} custom={1} className="grid gap-4">
                    <div>
                        <div className="label">I am a</div>
                        <div className="flex gap-2">
                            {(["CLIENT", "WORKER", "ADMIN"] as Role[]).map((option) => (
                                <button
                                    key={option}
                                    className={`btn flex-1 ${role === option ? "primary" : "ghost"}`}
                                    type="button"
                                    onClick={() => setRole(option)}
                                >
                                    {option.charAt(0) + option.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="label">Email</div>
                        <input
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <div className="label">Password</div>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submit()}
                            autoComplete="current-password"
                        />
                    </div>
                    {error && !unavailable && (
                        <div className="rounded-xl border border-danger/60 bg-danger/10 px-3 py-2 text-sm text-danger">
                            {error}
                        </div>
                    )}
                    <button className="btn primary w-full py-3" disabled={busy} onClick={submit}>
                        {busy ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Signing in…
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                    <p className="text-center text-sm text-muted">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-brand hover:underline">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="card p-6 text-center text-muted">Loading…</div>}>
            <LoginPageInner />
        </Suspense>
    );
}
