"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../../components/layout/AuthProvider";
import { getWorkerFeed, toggleDutyStatus, getWorkerProfile } from "../../../../services/worker";
import { placeBid } from "../../../../services/bid";
import { JobCard } from "../../../../components/ui/JobCard";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Modal } from "../../../../components/ui/Modal";
import { Spinner } from "../../../../components/ui/Spinner";
import { cn } from "../../../../lib/cn";
import { toast } from "sonner";
import type { JobSummary } from "../../../../types/job";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

export default function WorkerDashboardPage() {
    const { session } = useAuth();
    const [feed, setFeed] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [radiusKm, setRadiusKm] = useState(15);
    const [onDuty, setOnDuty] = useState(false);
    const [dutyLoading, setDutyLoading] = useState(false);

    /* Bid modal */
    const [bidJob, setBidJob] = useState<JobSummary | null>(null);
    const [bidAmount, setBidAmount] = useState("");
    const [bidNotes, setBidNotes] = useState("");
    const [bidBusy, setBidBusy] = useState(false);

    const loadFeed = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await getWorkerFeed(session.userId, { radiusKm, page: 0, size: 50 });
            setFeed(res.data?.content ?? []);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [session, radiusKm]);

    useEffect(() => {
        loadFeed();
    }, [loadFeed]);

    /* Load duty status */
    useEffect(() => {
        getWorkerProfile()
            .then((res) => setOnDuty(res.data?.onDuty ?? false))
            .catch(() => {});
    }, []);

    /* Toggle duty */
    const handleToggleDuty = async () => {
        setDutyLoading(true);
        try {
            await toggleDutyStatus(!onDuty);
            setOnDuty(!onDuty);
            toast.success(onDuty ? "You're now off duty" : "You're now on duty");
        } catch {
            toast.error("Failed to toggle duty status");
        } finally {
            setDutyLoading(false);
        }
    };

    /* Place bid */
    const handleBid = async () => {
        if (!session || !bidJob) return;
        const amount = Number(bidAmount);
        if (!amount || amount <= 0) {
            toast.error("Enter a valid bid amount");
            return;
        }
        setBidBusy(true);
        try {
            await placeBid(bidJob.id, session.userId, amount, { notes: bidNotes || undefined });
            toast.success("Bid placed!");
            setBidJob(null);
            setBidAmount("");
            setBidNotes("");
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to place bid");
        } finally {
            setBidBusy(false);
        }
    };

    return (
        <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
            {/* Hero strip */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface p-5">
                <div>
                    <h1 className="text-xl font-bold text-text">Job Feed</h1>
                    <p className="text-sm text-muted">Browse nearby tasks matching your skills.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Duty toggle */}
                    <button
                        onClick={handleToggleDuty}
                        disabled={dutyLoading}
                        className={cn(
                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                            onDuty ? "bg-success" : "bg-muted/30",
                        )}
                    >
                        <span
                            className={cn(
                                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                                onDuty ? "translate-x-6" : "translate-x-1",
                            )}
                        />
                    </button>
                    <span className="text-sm font-medium text-text">{onDuty ? "On Duty" : "Off Duty"}</span>
                </div>
            </motion.div>

            {/* Radius slider */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                <label className="text-sm text-muted">Radius: <span className="font-semibold text-text">{radiusKm} km</span></label>
                <input
                    type="range"
                    min={1}
                    max={100}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="h-2 w-48 cursor-pointer appearance-none rounded-full bg-brand/20 accent-brand"
                />
                <Button variant="ghost" onClick={loadFeed} className="ml-auto">
                    Refresh
                </Button>
            </motion.div>

            {/* Feed grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner size="lg" />
                </div>
            ) : feed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
                    <p className="text-lg font-medium text-muted">No jobs in your area</p>
                    <p className="mt-1 text-sm text-muted/70">Try increasing the radius or check back later.</p>
                </div>
            ) : (
                <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {feed.map((job) => (
                        <motion.div key={job.id} variants={fadeUp}>
                            <JobCard job={job} onClick={() => { setBidJob(job); setBidAmount(String(job.price?.amount ?? "")); }} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Bid modal */}
            <Modal open={!!bidJob} onClose={() => setBidJob(null)} title={`Bid on: ${bidJob?.title ?? ""}`}>
                <div className="space-y-4">
                    {bidJob?.shortDescription && <p className="text-sm text-muted">{bidJob.shortDescription}</p>}
                    {bidJob?.price && (
                        <p className="text-sm">
                            Client budget: <span className="font-semibold text-brand">{bidJob.price.currency} {bidJob.price.amount}</span>
                        </p>
                    )}
                    <Input label="Your bid amount" type="number" placeholder="0.00" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                    <Input label="Notes (optional)" placeholder="Anything the client should know…" value={bidNotes} onChange={(e) => setBidNotes(e.target.value)} />
                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleBid} loading={bidBusy}>Place Bid</Button>
                        <Button variant="ghost" onClick={() => setBidJob(null)}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
