"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchAdminJobs } from "../../../../services/admin";
import { JobCard } from "../../../../components/ui/JobCard";
import { Spinner } from "../../../../components/ui/Spinner";
import { cn } from "../../../../lib/cn";
import type { JobSummary, JobStatus } from "../../../../types/job";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

const FILTERS: { label: string; value: JobStatus | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Open", value: "OPEN_FOR_BIDS" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending Payment", value: "COMPLETED_PENDING_PAYMENT" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Expired", value: "JOB_CLOSED_DUE_TO_EXPIRATION" },
];

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<JobStatus | "ALL">("ALL");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const statuses = filter === "ALL" ? undefined : [filter];
            const res = await fetchAdminJobs(statuses, 0, 100);
            setJobs(res.data?.content ?? []);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    return (
        <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text">All Jobs</h1>
                <span className="text-sm text-muted">{jobs.length} total</span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            filter === f.value
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border/60 text-muted hover:border-brand/40 hover:text-text",
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
            ) : jobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
                    <p className="text-muted">No jobs found.</p>
                </div>
            ) : (
                <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => (
                        <motion.div key={job.id} variants={fadeUp}>
                            <JobCard job={job} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}
