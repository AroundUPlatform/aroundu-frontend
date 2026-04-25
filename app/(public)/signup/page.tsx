"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { currencyOptions, countryOptions } from "../../../utils/constants";
import { registerClient } from "../../../services/client";
import { registerWorker } from "../../../services/worker";
import type { Role } from "../../../types/auth";
import { IMG_SIGNUP } from "../../../utils/assets";

const initialAddress = {
    country: "US",
    postalCode: "",
    city: "",
    area: "",
    fullAddress: "",
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function SignupPage() {
    const [role, setRole] = useState<"CLIENT" | "WORKER">("CLIENT");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        currency: "USD",
        currentAddress: initialAddress,
        skillIds: "",
    });
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const update = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));
    const updateAddress = (patch: Partial<typeof form.currentAddress>) =>
        setForm((prev) => ({ ...prev, currentAddress: { ...prev.currentAddress, ...patch } }));

    const detectLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            updateAddress({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            } as any);
        });
    };

    const submit = async () => {
        setBusy(true);
        setMessage(null);
        try {
            if (!form.name || !form.email || !form.password) {
                setMessage("Name, email, and password are required.");
                setBusy(false);
                return;
            }
            if (role === "CLIENT") {
                await registerClient({
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phoneNumber,
                    password: form.password,
                    currency: form.currency,
                    currentAddress: form.currentAddress,
                });
            } else {
                const skills = form.skillIds
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                await registerWorker({
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phoneNumber,
                    password: form.password,
                    currency: form.currency,
                    currentAddress: form.currentAddress,
                    skillIds: skills,
                });
            }
            setMessage("Account created! Redirecting to login…");
            setTimeout(() => router.push("/login?email=" + encodeURIComponent(form.email)), 1200);
        } catch (err: any) {
            setMessage(err?.message ?? "Signup failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Illustration */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative mx-auto hidden h-[500px] w-full max-w-sm md:block"
            >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand/15 to-transparent blur-2xl" />
                <Image
                    src={IMG_SIGNUP}
                    alt="Registration illustration"
                    fill
                    className="rounded-3xl object-contain"
                    priority
                />
            </motion.div>

            {/* Form */}
            <motion.div initial="hidden" animate="visible" className="card space-y-5 p-7">
                <motion.div variants={fadeUp} custom={0} className="space-y-1">
                    <div className="kicker">Join AroundU</div>
                    <h2 className="text-2xl font-semibold">Create your account</h2>
                </motion.div>

                {/* Role tabs */}
                <motion.div variants={fadeUp} custom={1} className="flex gap-1 rounded-xl bg-surface-strong p-1">
                    {(["CLIENT", "WORKER"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                                role === r ? "bg-brand text-white shadow-sm" : "text-muted hover:text-text"
                            }`}
                        >
                            {r === "CLIENT" ? "I need help" : "I offer services"}
                        </button>
                    ))}
                </motion.div>

                <motion.div variants={fadeUp} custom={2} className="grid gap-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Full name</div>
                            <input className="input" value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="John Doe" />
                        </div>
                        <div>
                            <div className="label">Phone</div>
                            <input className="input" value={form.phoneNumber} onChange={(e) => update({ phoneNumber: e.target.value })} placeholder="+1 234 567 890" />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Email</div>
                            <input className="input" value={form.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
                        </div>
                        <div>
                            <div className="label">Password</div>
                            <input className="input" type="password" value={form.password} onChange={(e) => update({ password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Currency</div>
                            <select className="select" value={form.currency} onChange={(e) => update({ currency: e.target.value })}>
                                {currencyOptions.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="label">Country</div>
                            <select className="select" value={form.currentAddress.country} onChange={(e) => updateAddress({ country: e.target.value })}>
                                {countryOptions.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">City</div>
                            <input className="input" value={form.currentAddress.city} onChange={(e) => updateAddress({ city: e.target.value })} placeholder="San Francisco" />
                        </div>
                        <div>
                            <div className="label">
                                Postal code
                                <button type="button" onClick={detectLocation} className="text-xs text-brand hover:underline">
                                    📍 Detect
                                </button>
                            </div>
                            <input className="input" value={form.currentAddress.postalCode} onChange={(e) => updateAddress({ postalCode: e.target.value })} placeholder="94103" />
                        </div>
                    </div>

                    {role === "WORKER" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="label">Your skills (comma-separated IDs)</div>
                            <input
                                className="input"
                                placeholder="e.g. 1, 2, 3"
                                value={form.skillIds}
                                onChange={(e) => update({ skillIds: e.target.value })}
                            />
                            <p className="mt-1 text-xs text-muted">Skill catalog browsing coming soon.</p>
                        </motion.div>
                    )}

                    {message && (
                        <div
                            className={`rounded-xl border px-3 py-2 text-sm ${
                                message.includes("created")
                                    ? "border-success/60 bg-success/10 text-success"
                                    : "border-danger/60 bg-danger/10 text-danger"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <button className="btn primary w-full py-3" disabled={busy} onClick={submit}>
                        {busy ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Creating…
                            </span>
                        ) : (
                            `Create ${role === "CLIENT" ? "Client" : "Worker"} Account`
                        )}
                    </button>
                    <p className="text-center text-sm text-muted">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-brand hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
