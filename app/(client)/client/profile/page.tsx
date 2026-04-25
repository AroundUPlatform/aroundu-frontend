"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../../components/layout/AuthProvider";
import { getClientProfile, updateClientProfile } from "../../../../services/client";
import { uploadProfileImage } from "../../../../services/profile";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Spinner } from "../../../../components/ui/Spinner";
import { currencyOptions } from "../../../../utils/constants";
import { toast } from "sonner";
import type { Client } from "../../../../types/user";

export default function ClientProfilePage() {
    const { session } = useAuth();
    const [profile, setProfile] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", phoneNumber: "", currency: "USD" });

    useEffect(() => {
        getClientProfile()
            .then((res) => {
                const p = res.data;
                if (p) {
                    setProfile(p);
                    setForm({ name: p.name ?? "", phoneNumber: p.phoneNumber ?? "", currency: p.currency ?? "USD" });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateClientProfile({ name: form.name, phoneNumber: form.phoneNumber, currency: form.currency });
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
            <h1 className="text-2xl font-bold text-text">My Profile</h1>

            {/* Avatar */}
            <div className="flex items-center gap-4">
                <Avatar src={profile?.profileImageUrl} fallback={profile?.name ?? session?.email ?? "?"} size="lg" />
                <div>
                    <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
                        Change photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <p className="text-xs text-muted">{profile?.email}</p>
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
                <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>

            {/* Info */}
            {profile?.currentAddress && (
                <div className="rounded-2xl border border-border/60 bg-surface p-5">
                    <h3 className="mb-2 font-semibold text-text">Current Address</h3>
                    <p className="text-sm text-muted">
                        {[profile.currentAddress.area, profile.currentAddress.city, profile.currentAddress.postalCode, profile.currentAddress.country]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-surface p-5">
                <div className="text-xs text-muted">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                </div>
            </div>
        </motion.div>
    );
}
