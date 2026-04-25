"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../../components/layout/AuthProvider";
import { getWorkerJobs } from "../../../../services/worker";
import { JobCard } from "../../../../components/ui/JobCard";
import { WorkerJobDetailModal } from "../../../../components/worker/WorkerJobDetailModal";
import { Spinner } from "../../../../components/ui/Spinner";
import { cn } from "../../../../lib/cn";
import type { JobSummary, JobStatus } from "../../../../types/job";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

const STATUS_FILTERS: { label: string; value: JobStatus | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Ready", value: "READY_TO_START" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Pending Payment", value: "COMPLETED_PENDING_PAYMENT" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Payment Released", value: "PAYMENT_RELEASED" },
];

export default function WorkerMyJobsPage() {
    const { session } = useAuth();
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<JobStatus | "ALL">("ALL");
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

    const loadJobs = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await getWorkerJobs(session.userId, 0, 50);
            setJobs(res.data?.content ?? []);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    useEffect(() => {
        const id = setInterval(loadJobs, 30_000);
        return () => clearInterval(id);
    }, [loadJobs]);

    const filtered = activeFilter === "ALL" ? jobs : jobs.filter((j) => j.jobStatus === activeFilter);

    const activeCount = jobs.filter((j) => j.jobStatus === "IN_PROGRESS").length;
    const completedCount = jobs.filter((j) => ["COMPLETED", "PAYMENT_RELEASED"].includes(j.jobStatus ?? "")).length;

    return (
        <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
            {/* Stats */}
            <motion.div variants={stagger} className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Jobs", value: jobs.length, accent: "text-text" },
                    { label: "In Progress", value: activeCount, accent: "text-brand" },
                    { label: "Completed", value: completedCount, accent: "text-success" },
                ].map((s) => (
                    <motion.div key={s.label} variants={fadeUp} className="rounded-xl border border-border/60 bg-surface p-4">
                        <div className="text-xs text-muted">{s.label}</div>
                        <div className={cn("text-2xl font-bold", s.accent)}>{s.value}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filter chips */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            activeFilter === f.value
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border/60 text-muted hover:border-brand/40 hover:text-text",
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </motion.div>

            {/* Job grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
                    <p className="text-lg font-medium text-muted">No jobs yet</p>
                    <p className="mt-1 text-sm text-muted/70">Jobs you work on will appear here.</p>
                </div>
            ) : (
                <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((job) => (
                        <motion.div key={job.id} variants={fadeUp}>
                            <JobCard job={job} onClick={() => setSelectedJobId(job.id)} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <WorkerJobDetailModal
                jobId={selectedJobId}
                workerId={session?.userId ?? 0}
                onClose={() => setSelectedJobId(null)}
                onRefresh={loadJobs}
            />
        </motion.div>
    );
}
