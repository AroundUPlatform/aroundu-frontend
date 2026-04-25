"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { getJobDetail, cancelJob, verifyReleaseCode } from "../../services/client";
import { getJobBids, acceptBid, rejectBid } from "../../services/bid";
import { createReview } from "../../services/review";
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "../../utils/constants";
import type { JobDetail } from "../../types/job";
import type { Bid } from "../../types/bid";
import { cn } from "../../lib/cn";
import { toast } from "sonner";

interface Props {
    jobId: number | null;
    clientId: number;
    onClose: () => void;
    onRefresh: () => void;
}

export function ClientJobDetailModal({ jobId, clientId, onClose, onRefresh }: Props) {
    const [job, setJob] = useState<JobDetail | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(false);
    const [releaseCode, setReleaseCode] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!jobId) return;
        setLoading(true);
        Promise.all([
            getJobDetail(jobId).then((r) => setJob(r.data ?? null)),
            getJobBids(jobId).then((r) => setBids((r.data as any) ?? [])).catch(() => {}),
        ]).finally(() => setLoading(false));
    }, [jobId]);

    const handleAcceptBid = async (bidId: number) => {
        if (!jobId) return;
        setBusy(true);
        try {
            await acceptBid(jobId, bidId);
            toast.success("Bid accepted");
            onRefresh();
            onClose();
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to accept bid");
        } finally {
            setBusy(false);
        }
    };

    const handleRejectBid = async (bidId: number) => {
        if (!jobId) return;
        setBusy(true);
        try {
            await rejectBid(jobId, bidId);
            toast.success("Bid rejected");
            setBids((prev) => prev.filter((b) => b.id !== bidId));
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to reject bid");
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = async () => {
        if (!jobId) return;
        if (!confirm("Are you sure you want to cancel this job?")) return;
        setBusy(true);
        try {
            await cancelJob(jobId, clientId);
            toast.success("Job cancelled");
            onRefresh();
            onClose();
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to cancel job");
        } finally {
            setBusy(false);
        }
    };

    const handleRelease = async () => {
        if (!jobId || !job?.assignedTo?.id) return;
        setBusy(true);
        try {
            await verifyReleaseCode(jobId, job.assignedTo.id, releaseCode);
            toast.success("Payment released!");
            onRefresh();
            onClose();
        } catch (e: any) {
            toast.error(e?.message ?? "Invalid release code");
        } finally {
            setBusy(false);
        }
    };

    const handleReview = async () => {
        if (!jobId) return;
        setBusy(true);
        try {
            await createReview(jobId, { rating: reviewRating, comment: reviewComment });
            toast.success("Review submitted!");
            onClose();
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to submit review");
        } finally {
            setBusy(false);
        }
    };

    const status = job?.jobStatus ?? "CREATED";

    return (
        <Modal open={!!jobId} onClose={onClose} title={job?.title ?? "Job Detail"} className="max-w-2xl">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : !job ? (
                <p className="py-4 text-center text-muted">Job not found</p>
            ) : (
                <div className="space-y-5">
                    {/* Status header */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", JOB_STATUS_COLORS[status])}>
                            {JOB_STATUS_LABELS[status]}
                        </span>
                        {job.jobUrgency && <Badge variant="warning">{job.jobUrgency.replace(/_/g, " ")}</Badge>}
                        {job.paymentMode && <Badge>{job.paymentMode}</Badge>}
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
                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {job.requiredSkills.map((s) => (
                                    <span key={s.id} className="chip text-xs">{s.name ?? `Skill #${s.id}`}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Status-specific actions ── */}

                    {/* OPEN_FOR_BIDS: show bis */}
                    {status === "OPEN_FOR_BIDS" && (
                        <div className="space-y-3">
                            <h4 className="font-semibold">Bids ({bids.length})</h4>
                            {bids.length === 0 ? (
                                <p className="text-sm text-muted">No bids yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {bids.map((bid) => (
                                        <div key={bid.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-surface-strong p-3">
                                            <div>
                                                <div className="font-medium text-text">{bid.workerName ?? `Worker #${bid.workerId}`}</div>
                                                <div className="text-sm text-brand">{bid.amount?.currency} {bid.amount?.amount}</div>
                                                {bid.notes && <div className="mt-0.5 text-xs text-muted">{bid.notes}</div>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="primary" loading={busy} onClick={() => handleAcceptBid(bid.id)}>
                                                    Accept
                                                </Button>
                                                <Button variant="ghost" loading={busy} onClick={() => handleRejectBid(bid.id)}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BID_ACCEPTED / READY_TO_START: show start code */}
                    {(status === "BID_SELECTED_AWAITING_HANDSHAKE" || status === "READY_TO_START") && (
                        <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-center">
                            <p className="text-sm text-muted">Share the start code with your worker so they can begin.</p>
                            <p className="mt-2 text-lg font-bold text-brand">Waiting for worker to enter start code…</p>
                        </div>
                    )}

                    {/* IN_PROGRESS */}
                    {status === "IN_PROGRESS" && (
                        <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-center">
                            <p className="font-semibold text-brand">Work in progress</p>
                            <p className="mt-1 text-sm text-muted">The worker is actively working on this job.</p>
                        </div>
                    )}

                    {/* COMPLETED_PENDING_PAYMENT: release code entry */}
                    {status === "COMPLETED_PENDING_PAYMENT" && (
                        <div className="space-y-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
                            <p className="font-semibold text-warning">Payment Pending</p>
                            <p className="text-sm text-muted">Enter the release code to unlock payment.</p>
                            <Input
                                placeholder="Release code"
                                value={releaseCode}
                                onChange={(e) => setReleaseCode(e.target.value)}
                            />
                            <Button loading={busy} onClick={handleRelease}>
                                Release Payment
                            </Button>
                        </div>
                    )}

                    {/* COMPLETED: leave review */}
                    {status === "COMPLETED" && (
                        <div className="space-y-3">
                            <h4 className="font-semibold">Leave a Review</h4>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className={`text-2xl transition ${star <= reviewRating ? "text-warning" : "text-muted/30"}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <Textarea
                                placeholder="How was the experience?"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                            />
                            <Button loading={busy} onClick={handleReview}>Submit Review</Button>
                        </div>
                    )}

                    {/* Cancel button for cancellable statuses */}
                    {["CREATED", "OPEN_FOR_BIDS", "BID_SELECTED_AWAITING_HANDSHAKE", "READY_TO_START"].includes(status) && (
                        <div className="border-t border-border/70 pt-4">
                            <Button variant="danger" loading={busy} onClick={handleCancel}>
                                Cancel Job
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
