"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { getJobDetail } from "../../services/client";
import { verifyStartCode } from "../../services/worker";
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "../../utils/constants";
import type { JobDetail } from "../../types/job";
import { cn } from "../../lib/cn";
import { toast } from "sonner";

interface Props {
    jobId: number | null;
    workerId: number;
    onClose: () => void;
    onRefresh: () => void;
}

export function WorkerJobDetailModal({ jobId, workerId, onClose, onRefresh }: Props) {
    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [startCode, setStartCode] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!jobId) return;
        setLoading(true);
        getJobDetail(jobId)
            .then((r) => setJob(r.data ?? null))
            .finally(() => setLoading(false));
    }, [jobId]);

    const handleStartCode = async () => {
        if (!jobId) return;
        setBusy(true);
        try {
            await verifyStartCode(jobId, workerId, startCode);
            toast.success("Job started!");
            onRefresh();
            onClose();
        } catch (e: any) {
            toast.error(e?.message ?? "Invalid start code");
        } finally {
            setBusy(false);
        }
    };

    const status = job?.jobStatus ?? "CREATED";

    return (
        <Modal open={!!jobId} onClose={onClose} title={job?.title ?? "Job Detail"} className="max-w-2xl">
            {loading ? (
                <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
            ) : !job ? (
                <p className="py-4 text-center text-muted">Job not found</p>
            ) : (
                <div className="space-y-5">
                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", JOB_STATUS_COLORS[status])}>
                            {JOB_STATUS_LABELS[status]}
                        </span>
                        {job.jobUrgency && <Badge variant="warning">{job.jobUrgency.replace(/_/g, " ")}</Badge>}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                        {job.longDescription && <p className="text-muted">{job.longDescription}</p>}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            {job.price && (
                                <div>
                                    <span className="text-xs text-muted">Budget</span>
                                    <div className="font-semibold text-brand">{job.price.currency} {job.price.amount}</div>
                                </div>
                            )}
                            {job.jobLocation && (
                                <div>
                                    <span className="text-xs text-muted">Location</span>
                                    <div className="text-text">{job.jobLocation.city ?? job.jobLocation.fullAddress ?? "—"}</div>
                                </div>
                            )}
                        </div>
                        {job.createdBy && (
                            <div className="pt-1">
                                <span className="text-xs text-muted">Posted by</span>
                                <div className="text-text">{job.createdBy.name ?? job.createdBy.email ?? `User #${job.createdBy.id}`}</div>
                            </div>
                        )}
                    </div>

                    {/* Status-specific sections */}

                    {/* READY_TO_START / BID_SELECTED: enter start code */}
                    {(status === "BID_SELECTED_AWAITING_HANDSHAKE" || status === "READY_TO_START") && (
                        <div className="space-y-3 rounded-xl border border-brand/40 bg-brand/5 p-4">
                            <p className="font-semibold text-brand">Enter Start Code</p>
                            <p className="text-sm text-muted">Ask the client for the start code to begin working.</p>
                            <Input placeholder="Start code" value={startCode} onChange={(e) => setStartCode(e.target.value)} />
                            <Button loading={busy} onClick={handleStartCode}>Verify & Start</Button>
                        </div>
                    )}

                    {/* IN_PROGRESS */}
                    {status === "IN_PROGRESS" && (
                        <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-center">
                            <p className="font-semibold text-brand">You're working on this job</p>
                            <p className="mt-1 text-sm text-muted">Complete the work and ask the client to release payment.</p>
                        </div>
                    )}

                    {/* COMPLETED / PAYMENT_RELEASED */}
                    {(status === "COMPLETED" || status === "PAYMENT_RELEASED" || status === "COMPLETED_PENDING_PAYMENT") && (
                        <div className="rounded-xl border border-success/40 bg-success/5 p-4 text-center">
                            <p className="font-semibold text-success">
                                {status === "PAYMENT_RELEASED" ? "Payment received!" : status === "COMPLETED" ? "Job completed" : "Awaiting payment release"}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
