"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../../components/layout/AuthProvider";
import { getWorkerProfile, updateWorkerProfile } from "../../../../services/worker";
import { uploadProfileImage } from "../../../../services/profile";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Spinner } from "../../../../components/ui/Spinner";
import { currencyOptions } from "../../../../utils/constants";
import { toast } from "sonner";
import type { Worker } from "../../../../types/user";

export default function WorkerProfilePage() {
    const { session } = useAuth();
    const [profile, setProfile] = useState<Worker | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", phoneNumber: "", currency: "USD", experience: "" });

    useEffect(() => {
        getWorkerProfile()
            .then((res) => {
                const p = res.data;
                if (p) {
                    setProfile(p);
                    setForm({
                        name: p.name ?? "",
                        phoneNumber: p.phoneNumber ?? "",
                        currency: p.currency ?? "USD",
                        experience: p.experience ?? "",
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateWorkerProfile({ name: form.name, phoneNumber: form.phoneNumber, currency: form.currency, experience: form.experience });
            toast.success("Profile updated");
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !session) return;
        try {
            const res = await uploadProfileImage(session.userId, file);
            setProfile((p) => p ? { ...p, profileImageUrl: (res.data as any)?.url } : p);
            toast.success("Photo updated");
        } catch {
            toast.error("Upload failed");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg space-y-6">
            <h1 className="text-2xl font-bold text-text">Worker Profile</h1>

            {/* Avatar + rating */}
            <div className="flex items-center gap-4">
                <Avatar src={profile?.profileImageUrl} fallback={profile?.name ?? session?.email ?? "?"} size="lg" />
                <div>
                    <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
                        Change photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <p className="text-xs text-muted">{profile?.email}</p>
                    {profile?.averageRating != null && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-warning">
                            <span>★ {profile.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted">({profile.totalReviews ?? 0} reviews)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4 rounded-2xl border border-border/60 bg-surface p-5">
                <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <Input label="Phone" value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
                <Select
                    label="Currency"
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    options={currencyOptions.map((c) => ({ label: c, value: c }))}
                />
                <Input label="Experience" placeholder="e.g. 3 years in plumbing" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} />
                <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-surface p-5">
                    <h3 className="mb-2 font-semibold text-text">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                            <span key={s.id} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                                {s.name ?? `#${s.id}`}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Duty & address */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-surface p-5">
                    <div className="text-xs text-muted">Duty Status</div>
                    <div className={`mt-1 font-semibold ${profile?.onDuty ? "text-success" : "text-muted"}`}>
                        {profile?.onDuty ? "On Duty" : "Off Duty"}
                    </div>
                </div>
                {profile?.currentAddress && (
                    <div className="rounded-2xl border border-border/60 bg-surface p-5">
                        <div className="text-xs text-muted">Location</div>
                        <div className="mt-1 text-sm text-text">
                            {[profile.currentAddress.city, profile.currentAddress.country].filter(Boolean).join(", ")}
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-border/60 bg-surface p-5">
                <div className="text-xs text-muted">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                </div>
            </div>
        </motion.div>
    );
}
