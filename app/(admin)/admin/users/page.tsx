"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchClients, fetchWorkers, deleteClient, deleteWorker } from "../../../../services/admin";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { Spinner } from "../../../../components/ui/Spinner";
import { Tabs } from "../../../../components/ui/Tabs";
import { toast } from "sonner";
import type { Client, Worker } from "../../../../types/user";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

export default function AdminUsersPage() {
    const [tab, setTab] = useState("clients");
    const [clients, setClients] = useState<Client[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [c, w] = await Promise.all([fetchClients(0, 100), fetchWorkers(0, 100)]);
            setClients(c.data?.content ?? []);
            setWorkers(w.data?.content ?? []);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleDeleteClient = async (id: number) => {
        if (!confirm("Delete this client?")) return;
        try {
            await deleteClient(id);
            setClients((prev) => prev.filter((c) => c.id !== id));
            toast.success("Client deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleDeleteWorker = async (id: number) => {
        if (!confirm("Delete this worker?")) return;
        try {
            await deleteWorker(id);
            setWorkers((prev) => prev.filter((w) => w.id !== id));
            toast.success("Worker deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
    }

    return (
        <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text">User Management</h1>
                <Button variant="ghost" onClick={loadData}>Refresh</Button>
            </motion.div>

            <motion.div variants={fadeUp}>
            <Tabs
                tabs={[
                    { key: "clients", label: "Clients", count: clients.length },
                    { key: "workers", label: "Workers", count: workers.length },
                ]}
                active={tab}
                onChange={setTab}
            />
            </motion.div>

            {tab === "clients" && (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                    {clients.length === 0 ? (
                        <p className="py-8 text-center text-muted">No clients.</p>
                    ) : (
                        clients.map((c) => (
                            <motion.div key={c.id} variants={fadeUp} className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-4">
                                <Avatar fallback={c.name ?? "C"} src={c.profileImageUrl} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-text">{c.name ?? `Client #${c.id}`}</div>
                                    <div className="text-xs text-muted">{c.email} · {c.phoneNumber ?? "—"}</div>
                                </div>
                                <Button variant="danger" onClick={() => handleDeleteClient(c.id)}>Delete</Button>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}

            {tab === "workers" && (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                    {workers.length === 0 ? (
                        <p className="py-8 text-center text-muted">No workers.</p>
                    ) : (
                        workers.map((w) => (
                            <motion.div key={w.id} variants={fadeUp} className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-4">
                                <Avatar fallback={w.name ?? "W"} src={w.profileImageUrl} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-text">{w.name ?? `Worker #${w.id}`}</div>
                                    <div className="text-xs text-muted">
                                        {w.email} · {w.onDuty ? "🟢 On duty" : "⚪ Off duty"}
                                        {w.averageRating != null && ` · ★ ${w.averageRating.toFixed(1)}`}
                                    </div>
                                </div>
                                <Button variant="danger" onClick={() => handleDeleteWorker(w.id)}>Delete</Button>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
