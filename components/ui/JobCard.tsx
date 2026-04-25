"use client";

import { cn } from "../../lib/cn";
import { Badge } from "../ui/Badge";
import type { JobSummary, JobStatus } from "../../types/job";
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "../../utils/constants";

const URGENCY_COLORS: Record<string, string> = {
    SUPER_URGENT: "bg-danger/10 text-danger",
    URGENT: "bg-warning/10 text-warning",
    MEDIUM: "bg-brand/10 text-brand",
    NORMAL: "bg-muted/10 text-muted",
};

const STATUS_BAND_COLORS: Record<string, string> = {
    CREATED: "bg-muted/40",
    OPEN_FOR_BIDS: "bg-brand",
    BID_SELECTED_AWAITING_HANDSHAKE: "bg-warning",
    READY_TO_START: "bg-brand",
    IN_PROGRESS: "bg-brand",
    COMPLETED: "bg-success",
    COMPLETED_PENDING_PAYMENT: "bg-warning",
    PAYMENT_RELEASED: "bg-success",
    JOB_CLOSED_DUE_TO_EXPIRATION: "bg-muted/40",
    CANCELLED: "bg-danger",
};

interface JobCardProps {
    job: JobSummary;
    onClick?: () => void;
    className?: string;
}

export function JobCard({ job, onClick, className }: JobCardProps) {
    const status = job.jobStatus ?? "CREATED";
    const bandColor = STATUS_BAND_COLORS[status] ?? "bg-muted/40";

    return (
        <button
            onClick={onClick}
            className={cn(
                "card hover-lift relative w-full overflow-hidden text-left",
                className,
            )}
        >
            {/* Status color band */}
            <div className={cn("absolute left-0 top-0 h-1.5 w-full", bandColor)} />

            <div className="p-4 pt-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-text">{job.title}</h4>
                        {job.shortDescription && (
                            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{job.shortDescription}</p>
                        )}
                    </div>
                    {job.price && (
                        <div className="flex-shrink-0 text-right">
                            <div className="font-semibold text-brand">
                                {job.price.currency} {job.price.amount}
                            </div>
                            {job.paymentMode && (
                                <div className="text-xs text-muted">{job.paymentMode}</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", JOB_STATUS_COLORS[status])}>
                        {JOB_STATUS_LABELS[status]}
                    </span>
                    {job.jobUrgency && (
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", URGENCY_COLORS[job.jobUrgency])}>
                            {job.jobUrgency.replace(/_/g, " ")}
                        </span>
                    )}
                    {job.createdAt && (
                        <span className="text-xs text-muted">
                            {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
