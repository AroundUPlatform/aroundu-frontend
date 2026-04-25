import type { JobUrgency, PaymentMode, JobStatus } from "../types/job";

export const apiBaseFallback = "/api/v1";
export const bidBaseFallback = "/api/v1/bid";

export const currencyOptions = ["USD", "EUR", "INR", "GBP", "AED", "AUD"] as const;

export const countryOptions = ["US", "GB", "IN", "AE", "DE", "SG", "AU"] as const;

export const jobUrgencyOptions: JobUrgency[] = ["SUPER_URGENT", "URGENT", "MEDIUM", "NORMAL"];

export const paymentModeOptions: PaymentMode[] = ["ESCROW", "OFFLINE"];

/* ── API Paths ── */

export const API = {
    /* Auth */
    AUTH_LOGIN: "/api/v1/auth/login",
    AUTH_LOGOUT: "/api/v1/auth/logout",

    /* Client */
    CLIENT_REGISTER: "/api/v1/client/register",
    CLIENT_ME: "/api/v1/client/me",
    CLIENT_JOBS: "/api/v1/client/me/jobs",
    CLIENT_ADDRESSES: "/api/v1/client/me/addresses",
    CLIENT_ADDRESS_CREATE: "/api/v1/client/me/addresses",

    /* Worker */
    WORKER_REGISTER: "/api/v1/worker/register",
    WORKER_ME: "/api/v1/worker/me",
    WORKER_FEED: "/api/v1/worker/me/feed",
    WORKER_JOBS: "/api/v1/worker/me/jobs",
    WORKER_DUTY: "/api/v1/worker/me/duty-status",
    WORKER_SKILLS: "/api/v1/worker/me/skills",

    /* Jobs */
    JOBS: "/api/v1/jobs",
    JOB_DETAIL: (id: number) => `/api/v1/jobs/${id}`,
    JOB_STATUS: (id: number) => `/api/v1/jobs/${id}/status`,
    JOB_CANCEL: (id: number) => `/api/v1/jobs/${id}/cancel`,
    JOB_START_CODE: (id: number) => `/api/v1/jobs/${id}/codes/start`,
    JOB_RELEASE_CODE: (id: number) => `/api/v1/jobs/${id}/codes/release`,

    /* Bids */
    JOB_BIDS: (jobId: number) => `/api/v1/jobs/${jobId}/bids`,
    BID_PLACE: (jobId: number) => `/api/v1/bid/${jobId}`,
    BID_ACCEPT: (jobId: number, bidId: number) => `/api/v1/jobs/${jobId}/bids/${bidId}/accept`,
    BID_REJECT: (jobId: number, bidId: number) => `/api/v1/jobs/${jobId}/bids/${bidId}/reject`,

    /* Skills */
    SKILLS_SUGGEST: "/api/v1/skills/suggest",

    /* Chat */
    CONVERSATIONS: "/api/v1/conversations",
    CONVERSATION_MESSAGES: (id: number) => `/api/v1/conversations/${id}/messages`,
    CONVERSATION_READ: (id: number) => `/api/v1/conversations/${id}/read`,

    /* Reviews */
    JOB_REVIEWS: (jobId: number) => `/api/v1/jobs/${jobId}/reviews`,
    USER_REVIEWS: (userId: number) => `/api/v1/users/${userId}/reviews`,

    /* Profile */
    PUBLIC_PROFILE: (userId: number) => `/api/v1/users/${userId}/profile`,
    PROFILE_IMAGE: (userId: number) => `/api/v1/users/${userId}/profile-image`,

    /* Admin */
    ADMIN_OVERVIEW: "/api/v1/admin/overview",
    ADMIN_CLIENTS: "/api/v1/admin/clients",
    ADMIN_WORKERS: "/api/v1/admin/workers",
    ADMIN_JOBS: "/api/v1/admin/jobs",
    ADMIN_METRICS: "/api/v1/admin/metrics/query",
    ADMIN_DELETE_CLIENT: (id: number) => `/api/v1/admin/clients/${id}`,
    ADMIN_DELETE_WORKER: (id: number) => `/api/v1/admin/workers/${id}`,
} as const;

/* ── Job status UI helpers ── */

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
    CREATED: "Created",
    OPEN_FOR_BIDS: "Open for Bids",
    BID_SELECTED_AWAITING_HANDSHAKE: "Bid Selected",
    READY_TO_START: "Ready to Start",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    COMPLETED_PENDING_PAYMENT: "Pending Payment",
    PAYMENT_RELEASED: "Payment Released",
    JOB_CLOSED_DUE_TO_EXPIRATION: "Expired",
    CANCELLED: "Cancelled",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
    CREATED: "bg-muted/20 text-muted",
    OPEN_FOR_BIDS: "bg-brand/10 text-brand",
    BID_SELECTED_AWAITING_HANDSHAKE: "bg-warning/10 text-warning",
    READY_TO_START: "bg-brand/10 text-brand",
    IN_PROGRESS: "bg-brand/20 text-brand",
    COMPLETED: "bg-success/10 text-success",
    COMPLETED_PENDING_PAYMENT: "bg-warning/10 text-warning",
    PAYMENT_RELEASED: "bg-success/10 text-success",
    JOB_CLOSED_DUE_TO_EXPIRATION: "bg-muted/20 text-muted",
    CANCELLED: "bg-danger/10 text-danger",
};
