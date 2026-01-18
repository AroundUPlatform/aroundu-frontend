"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/layout/AuthProvider";
import { fetchClients, fetchWorkers, deleteClient, deleteWorker } from "../../../services/admin";
import type { Client, Worker } from "../../../types/user";

export default function AdminPage() {
    const { session } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isAdmin = session?.role === "ADMIN";

    useEffect(() => {
        if (session && !isAdmin) router.replace("/login");
    }, [session, isAdmin, router]);

    useEffect(() => {
        if (!session || !isAdmin) return;
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.userId]);

    const loadData = async () => {
        if (!session) return;
        setLoading(true);
        setStatus("Loading admin data...");
        try {
            const [c, w] = await Promise.all([fetchClients(0, 50), fetchWorkers(0, 50)]);
            setClients(c.data?.content ?? []);
            setWorkers(w.data?.content ?? []);
            setStatus("Admin data ready");
        } catch (err: any) {
            setStatus(err?.message ?? "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const removeClient = async (id: number) => {
        setLoading(true);
        setStatus("Deleting client...");
        try {
            await deleteClient(id);
            loadData();
        } catch (err: any) {
            setStatus(err?.message ?? "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    const removeWorker = async (id: number) => {
        setLoading(true);
        setStatus("Deleting worker...");
        try {
            await deleteWorker(id);
            loadData();
        } catch (err: any) {
            setStatus(err?.message ?? "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="card space-y-2 p-6">
                <h2 className="text-xl font-semibold">Login required</h2>
                <p className="muted">Please login as admin to continue.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <p className="muted text-sm">{status ?? "Review clients and workers"}</p>
            <div className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="kicker">Admin portal</div>
                        <h2 className="text-xl font-semibold">Users</h2>
                        <p className="muted text-sm">Delete operations call backend admin-protected endpoints. Search/sort/bulk delete are not implemented by backend yet.</p>
                    </div>
                    <button className="btn primary" onClick={loadData} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="card space-y-4 p-5">
                    <h3 className="text-lg font-semibold">Clients</h3>
                    {clients.length === 0 && <p className="muted">No clients loaded.</p>}
                    <div className="grid gap-3">
                        {clients.map((c) => (
                            <div key={c.id} className="badge flex w-full items-center justify-between">
                                <div>
                                    <div className="font-semibold">{c.name ?? "Client"}</div>
                                    <div className="muted text-sm">{c.email}</div>
                                </div>
                                <button className="btn danger" onClick={() => removeClient(c.id)} disabled={loading}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn ghost" disabled title="Not implemented in backend">
                        Delete all clients (Coming soon)
                    </button>
                </div>
                <div className="card space-y-4 p-5">
                    <h3 className="text-lg font-semibold">Workers</h3>
                    {workers.length === 0 && <p className="muted">No workers loaded.</p>}
                    <div className="grid gap-3">
                        {workers.map((w) => (
                            <div key={w.id} className="badge flex w-full items-center justify-between">
                                <div>
                                    <div className="font-semibold">{w.name ?? "Worker"}</div>
                                    <div className="muted text-sm">{w.email}</div>
                                </div>
                                <button className="btn danger" onClick={() => removeWorker(w.id)} disabled={loading}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn ghost" disabled title="Not implemented in backend">
                        Delete all workers (Coming soon)
                    </button>
                </div>
            </div>
            <div className="card space-y-3 p-5">
                <h3 className="text-lg font-semibold">Jobs overview</h3>
                <p className="muted text-sm">Backend does not expose an admin job listing yet. Controls below are disabled until available.</p>
                <div className="flex flex-wrap gap-3">
                    <button className="btn ghost" disabled title="Backend endpoint missing">
                        View all jobs (Coming soon)
                    </button>
                    <button className="btn ghost" disabled title="Backend endpoint missing">
                        Delete job (Coming soon)
                    </button>
                    <button className="btn ghost" disabled title="Backend endpoint missing">
                        Delete all jobs (Coming soon)
                    </button>
                </div>
            </div>
        </div>
    );
}
