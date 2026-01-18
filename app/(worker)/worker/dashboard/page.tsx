"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../components/layout/AuthProvider";
import { getWorkerFeed, verifyStartCode } from "../../../../services/worker";
import { placeBid } from "../../../../services/bid";
import type { JobSummary } from "../../../../types/job";

const parseSkillIds = (value: string) =>
    value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => !Number.isNaN(n));

export default function WorkerDashboardPage() {
    const { session } = useAuth();
    const router = useRouter();
    const [feed, setFeed] = useState<JobSummary[]>([]);
    const [filters, setFilters] = useState({ radiusKm: 15, skillIds: "" });
    const [bidAmount, setBidAmount] = useState("0");
    const [start, setStart] = useState({ jobId: "", code: "" });
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isWorker = session?.role === "WORKER";

    useEffect(() => {
        if (session && !isWorker) router.replace("/login");
    }, [session, isWorker, router]);

    useEffect(() => {
        if (!session || !isWorker) return;
        loadFeed();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.userId]);

    const loadFeed = async () => {
        if (!session) return;
        setLoading(true);
        setStatus("Loading feed...");
        try {
            const res = await getWorkerFeed(session.userId, {
                radiusKm: filters.radiusKm,
                skillIds: parseSkillIds(filters.skillIds),
                page: 0,
                size: 20,
            });
            setFeed(res.data?.content ?? []);
            setStatus(res.message ?? "Feed updated");
        } catch (err: any) {
            setStatus(err?.message ?? "Failed to load feed");
        } finally {
            setLoading(false);
        }
    };

    const bid = async (jobId: number) => {
        if (!session) return;
        const value = Number(bidAmount);
        if (!value || Number.isNaN(value)) {
            setStatus("Enter a bid amount");
            return;
        }
        setLoading(true);
        setStatus("Placing bid...");
        try {
            await placeBid(jobId, session.userId, value);
            setStatus("Bid placed");
        } catch (err: any) {
            setStatus(err?.message ?? "Bid failed");
        } finally {
            setLoading(false);
        }
    };

    const confirmStart = async () => {
        if (!session) return;
        const jobId = Number(start.jobId);
        if (!jobId) {
            setStatus("Job id required for start verification");
            return;
        }
        setLoading(true);
        setStatus("Verifying start code...");
        try {
            await verifyStartCode(jobId, session.userId, start.code);
            setStatus("Start confirmed");
        } catch (err: any) {
            setStatus(err?.message ?? "Start verification failed");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="card space-y-2 p-6">
                <h2 className="text-xl font-semibold">Login required</h2>
                <p className="muted">Please login as a worker to view your feed.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <p className="muted text-sm">{status ?? "Review your feed, bid, and verify start codes."}</p>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="card space-y-4 p-5">
                    <h3 className="text-lg font-semibold">Job feed</h3>
                    <p className="muted text-sm">Filter by radius and known skill ids.</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <div className="label">Radius (km)</div>
                            <input
                                className="input"
                                type="number"
                                value={filters.radiusKm}
                                onChange={(e) => setFilters({ ...filters, radiusKm: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <div className="label">Skill ids (CSV)</div>
                            <input className="input" value={filters.skillIds} onChange={(e) => setFilters({ ...filters, skillIds: e.target.value })} />
                            <p className="muted mt-2 text-sm">Skill catalog endpoint not published.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="btn primary" onClick={loadFeed} disabled={loading}>
                            Refresh feed
                        </button>
                        <button className="btn ghost" disabled title="Not Implemented">
                            Manage skills (Coming soon)
                        </button>
                    </div>
                </div>
                <div className="card space-y-4 p-5">
                    <h3 className="text-lg font-semibold">Matching jobs</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            className="input w-40"
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                        />
                        <span className="muted text-sm">Bid amount</span>
                    </div>
                    <div className="space-y-3">
                        {feed.length === 0 && <div className="muted">No jobs in your feed yet.</div>}
                        <div className="grid gap-3">
                            {feed.map((job) => (
                                <div key={job.id} className="card space-y-1 bg-white/5 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{job.title}</div>
                                            <div className="muted text-sm">{job.shortDescription ?? "No summary"}</div>
                                            <div className="muted text-sm">Urgency: {job.jobUrgency ?? "-"} · Payment: {job.paymentMode ?? "-"}</div>
                                        </div>
                                        <button className="btn primary" onClick={() => bid(job.id)} disabled={loading}>
                                            Place bid
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card space-y-4 p-5">
                <h3 className="text-lg font-semibold">Start code verification</h3>
                <p className="muted text-sm">Confirm the start code provided by the client before beginning work.</p>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="label">Job id</div>
                        <input className="input" value={start.jobId} onChange={(e) => setStart({ ...start, jobId: e.target.value })} />
                    </div>
                    <div>
                        <div className="label">Start code</div>
                        <input className="input" value={start.code} onChange={(e) => setStart({ ...start, code: e.target.value })} />
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="btn primary" onClick={confirmStart} disabled={loading}>
                        Verify start
                    </button>
                    <button className="btn ghost" disabled title="Release handled by client">
                        Release (client side)
                    </button>
                </div>
            </div>
        </div>
    );
}
