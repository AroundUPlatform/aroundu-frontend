"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../../../components/layout/AuthProvider";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Textarea } from "../../../../components/ui/Textarea";
import { createJob, getClientAddresses, createAddress } from "../../../../services/client";
import { suggestSkills } from "../../../../services/skills";
import { currencyOptions, jobUrgencyOptions, paymentModeOptions } from "../../../../utils/constants";
import type { JobCreateRequest, JobUrgency, PaymentMode, Skill } from "../../../../types/job";
import type { Address } from "../../../../types/common";
import { toast } from "sonner";
import { cn } from "../../../../lib/cn";

export default function CreateJobPage() {
    const { session } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        shortDescription: "",
        longDescription: "",
        amount: "",
        currency: "USD",
        jobUrgency: "MEDIUM" as JobUrgency,
        paymentMode: "ESCROW" as PaymentMode,
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ country: "US", postalCode: "", city: "", area: "", fullAddress: "" });
    const [skillQuery, setSkillQuery] = useState("");
    const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
    const [busy, setBusy] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    useEffect(() => {
        getClientAddresses()
            .then((res) => {
                const list = res.data ?? [];
                setAddresses(list);
                if (list.length > 0 && list[0].id) setSelectedAddressId(list[0].id);
            })
            .catch(() => {});
    }, []);

    /* Skill autocomplete */
    useEffect(() => {
        if (skillQuery.length < 2) {
            setSuggestedSkills([]);
            return;
        }
        const t = setTimeout(() => {
            suggestSkills(skillQuery).then((res) => {
                const skills = (res.data as any) ?? [];
                setSuggestedSkills(skills.filter((s: Skill) => !selectedSkills.find((sel) => sel.id === s.id)));
            }).catch(() => {});
        }, 300);
        return () => clearTimeout(t);
    }, [skillQuery, selectedSkills]);

    const addSkill = (skill: Skill) => {
        setSelectedSkills((prev) => [...prev, skill]);
        setSkillQuery("");
        setSuggestedSkills([]);
    };
    const removeSkill = (id: number) => {
        setSelectedSkills((prev) => prev.filter((s) => s.id !== id));
    };

    const detectGPS = () => {
        if (!navigator.geolocation) return;
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setNewAddress((a) => ({
                    ...a,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                } as any));
                setDetectingLocation(false);
                toast.success("Location detected");
            },
            () => {
                setDetectingLocation(false);
                toast.error("Location access denied");
            },
        );
    };

    const saveNewAddress = async () => {
        if (!newAddress.postalCode || !newAddress.country) {
            toast.error("Country and postal code required");
            return;
        }
        setBusy(true);
        try {
            const res = await createAddress(newAddress as Address);
            const saved = res.data;
            if (saved) {
                setAddresses((prev) => [...prev, saved]);
                setSelectedAddressId(saved.id ?? null);
                setShowNewAddress(false);
                toast.success("Address saved");
            }
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to save address");
        } finally {
            setBusy(false);
        }
    };

    const submit = async () => {
        if (!session) return;
        if (!form.title || !form.longDescription) {
            toast.error("Title and description are required");
            return;
        }
        if (!selectedAddressId) {
            toast.error("Please select or add a location");
            return;
        }
        const payload: JobCreateRequest = {
            title: form.title,
            shortDescription: form.shortDescription,
            longDescription: form.longDescription,
            price: { currency: form.currency, amount: Number(form.amount || 0) },
            jobLocationId: selectedAddressId,
            jobUrgency: form.jobUrgency,
            requiredSkillIds: selectedSkills.map((s) => s.id),
            paymentMode: form.paymentMode,
        };
        setBusy(true);
        try {
            await createJob(session.userId, payload);
            toast.success("Task posted!");
            router.push("/client/dashboard");
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to create task");
        } finally {
            setBusy(false);
        }
    };

    const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text">Post a Task</h1>
                <p className="mt-1 text-sm text-muted">Describe what you need done and set your budget.</p>
            </div>

            {/* Basic info */}
            <div className="space-y-4 rounded-2xl border border-border/60 bg-surface p-5">
                <Input label="Title" placeholder="e.g. Fix kitchen faucet" value={form.title} onChange={(e) => set("title", e.target.value)} />
                <Input label="Short description" placeholder="One-liner" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
                <Textarea label="Full description" placeholder="Provide all the details a worker needs…" rows={5} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} />
            </div>

            {/* Budget & urgency */}
            <div className="space-y-4 rounded-2xl border border-border/60 bg-surface p-5">
                <h3 className="font-semibold text-text">Budget & Urgency</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Amount" type="number" placeholder="0.00" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                    <Select
                        label="Currency"
                        value={form.currency}
                        onChange={(e) => set("currency", e.target.value)}
                        options={currencyOptions.map((c) => ({ label: c, value: c }))}
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Urgency"
                        value={form.jobUrgency}
                        onChange={(e) => set("jobUrgency", e.target.value)}
                        options={jobUrgencyOptions.map((u) => ({ label: u.replace(/_/g, " "), value: u }))}
                    />
                    <Select
                        label="Payment Mode"
                        value={form.paymentMode}
                        onChange={(e) => set("paymentMode", e.target.value)}
                        options={paymentModeOptions.map((p) => ({ label: p, value: p }))}
                    />
                </div>
            </div>

            {/* Skills */}
            <div className="space-y-3 rounded-2xl border border-border/60 bg-surface p-5">
                <h3 className="font-semibold text-text">Required Skills</h3>
                {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((s) => (
                            <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                                {s.name ?? `#${s.id}`}
                                <button onClick={() => removeSkill(s.id)} className="ml-0.5 text-brand/60 hover:text-brand">×</button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="relative">
                    <Input placeholder="Search skills…" value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} />
                    {suggestedSkills.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-border/60 bg-surface shadow-lg">
                            {suggestedSkills.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => addSkill(s)}
                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-strong"
                                >
                                    {s.name ?? `Skill #${s.id}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3 rounded-2xl border border-border/60 bg-surface p-5">
                <h3 className="font-semibold text-text">Location</h3>

                {addresses.length > 0 && (
                    <Select
                        label="Saved addresses"
                        value={String(selectedAddressId ?? "")}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                        options={addresses.map((a) => ({
                            label: [a.area, a.city, a.postalCode].filter(Boolean).join(", ") || `Address #${a.id}`,
                            value: String(a.id),
                        }))}
                    />
                )}

                {!showNewAddress ? (
                    <button onClick={() => setShowNewAddress(true)} className="text-sm font-medium text-brand hover:underline">
                        + Add new address
                    </button>
                ) : (
                    <div className="space-y-3 rounded-xl border border-border/40 bg-background p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Select
                                label="Country"
                                value={newAddress.country}
                                onChange={(e) => setNewAddress((a) => ({ ...a, country: e.target.value }))}
                                options={["US", "GB", "IN", "AE", "DE", "SG", "AU"].map((c) => ({ label: c, value: c }))}
                            />
                            <Input label="Postal code" value={newAddress.postalCode} onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input label="City" value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} />
                            <Input label="Area" value={newAddress.area} onChange={(e) => setNewAddress((a) => ({ ...a, area: e.target.value }))} />
                        </div>
                        <Input label="Full address" value={newAddress.fullAddress} onChange={(e) => setNewAddress((a) => ({ ...a, fullAddress: e.target.value }))} />
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={saveNewAddress} loading={busy}>Save Address</Button>
                            <Button variant="ghost" onClick={detectGPS} loading={detectingLocation}>📍 Detect GPS</Button>
                            <Button variant="ghost" onClick={() => setShowNewAddress(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pb-8">
                <Button onClick={submit} loading={busy} className="px-8">
                    Post Task
                </Button>
                <Button variant="ghost" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </motion.div>
    );
}
