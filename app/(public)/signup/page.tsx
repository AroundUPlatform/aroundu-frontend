"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { currencyOptions, countryOptions } from "../../../utils/constants";
import { registerClient } from "../../../services/client";
import { registerWorker } from "../../../services/worker";
import type { Role } from "../../../types/auth";

const initialAddress = {
    country: "US",
    postalCode: "",
    city: "",
    area: "",
    fullAddress: "",
};

export default function SignupPage() {
    const [role, setRole] = useState<Role>("CLIENT");
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

    const submit = async () => {
        setBusy(true);
        setMessage(null);
        try {
            if (role === "ADMIN") {
                setMessage("Admin signup is not available; use admin login.");
                setBusy(false);
                return;
            }
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
            setMessage("Signup successful. Please login.");
            router.push("/login?email=" + encodeURIComponent(form.email));
        } catch (err: any) {
            setMessage(err?.message ?? "Signup failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid items-start gap-6 md:grid-cols-2">
            <div className="card space-y-4 p-7">
                <div className="kicker">Create account</div>
                <h2 className="text-2xl font-semibold">Choose your role</h2>
                <p className="muted">Client accounts can post jobs. Worker accounts see matching feeds and place bids.</p>
                <div className="grid gap-4 pt-2">
                    <div>
                        <div className="label">Registering as</div>
                        <div className="flex flex-wrap gap-2">
                            {["CLIENT", "WORKER", "ADMIN"].map((option) => (
                                <button
                                    key={option}
                                    className={`btn ${role === option ? "primary" : "ghost"}`}
                                    type="button"
                                    disabled={option === "ADMIN"}
                                    onClick={() => setRole(option as Role)}
                                >
                                    {option === "ADMIN" ? "Admin (login only)" : option}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Full name</div>
                            <input className="input" value={form.name} onChange={(e) => update({ name: e.target.value })} />
                        </div>
                        <div>
                            <div className="label">Phone</div>
                            <input className="input" value={form.phoneNumber} onChange={(e) => update({ phoneNumber: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Email</div>
                            <input className="input" value={form.email} onChange={(e) => update({ email: e.target.value })} />
                        </div>
                        <div>
                            <div className="label">Password</div>
                            <input className="input" type="password" value={form.password} onChange={(e) => update({ password: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Currency</div>
                            <select className="select" value={form.currency} onChange={(e) => update({ currency: e.target.value })}>
                                {currencyOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="label">Country</div>
                            <select className="select" value={form.currentAddress.country} onChange={(e) => updateAddress({ country: e.target.value })}>
                                {countryOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">City</div>
                            <input className="input" value={form.currentAddress.city} onChange={(e) => updateAddress({ city: e.target.value })} />
                        </div>
                        <div>
                            <div className="label">Area</div>
                            <input className="input" value={form.currentAddress.area} onChange={(e) => updateAddress({ area: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <div className="label">Postal code</div>
                            <input className="input" value={form.currentAddress.postalCode} onChange={(e) => updateAddress({ postalCode: e.target.value })} />
                        </div>
                        <div>
                            <div className="label">Full address</div>
                            <input className="input" value={form.currentAddress.fullAddress} onChange={(e) => updateAddress({ fullAddress: e.target.value })} />
                        </div>
                    </div>
                    {role === "WORKER" && (
                        <div>
                            <div className="label">Skill IDs (CSV)</div>
                            <input
                                className="input"
                                placeholder="e.g. 1,2,3"
                                value={form.skillIds}
                                onChange={(e) => update({ skillIds: e.target.value })}
                            />
                            <p className="muted mt-2 text-sm">Enter known skill IDs; catalog browsing is coming soon.</p>
                        </div>
                    )}
                    {message && (
                        <div
                            className={`badge ${message.includes("successful") ? "border-brand bg-brand/10 text-text" : "border-danger/80 bg-danger/10 text-red-100"
                                }`}
                        >
                            {message}
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button className="btn primary" disabled={busy} onClick={submit}>
                            {busy ? "Creating..." : "Create account"}
                        </button>
                        <Link href="/login" className="btn ghost">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="card space-y-3 p-6">
                <div className="kicker">Get ready</div>
                <ul className="muted list-disc space-y-2 pl-5 text-sm">
                    <li>Admin signup is disabled; use provided admin credentials to log in.</li>
                    <li>Addresses can be added later; have a location ID handy when posting jobs.</li>
                    <li>Workers can list skills now; richer skill browsing arrives soon.</li>
                </ul>
            </div>
        </div>
    );
}
