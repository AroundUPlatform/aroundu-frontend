import type { Address, Price } from "./common";
import type { Role } from "./auth";

export type JobUrgency = "SUPER_URGENT" | "URGENT" | "MEDIUM" | "NORMAL";
export type PaymentMode = "ESCROW" | "OFFLINE";
export type JobStatus =
    | "CREATED"
    | "OPEN_FOR_BIDS"
    | "BID_SELECTED_AWAITING_HANDSHAKE"
    | "READY_TO_START"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "COMPLETED_PENDING_PAYMENT"
    | "PAYMENT_RELEASED"
    | "JOB_CLOSED_DUE_TO_EXPIRATION"
    | "CANCELLED";

export type Skill = {
    id: number;
    name?: string;
};

export type JobSummary = {
    id: number;
    title: string;
    shortDescription?: string;
    jobStatus?: JobStatus;
    jobUrgency?: JobUrgency;
    paymentMode?: PaymentMode;
    price?: Price;
    createdAt?: string;
};

export type JobDetail = {
    id: number;
    title: string;
    shortDescription?: string;
    longDescription?: string;
    price?: Price;
    jobLocation?: Address;
    jobStatus?: JobStatus;
    jobUrgency?: JobUrgency;
    paymentMode?: PaymentMode;
    requiredSkills?: Skill[];
    createdBy?: UserSummary;
    assignedTo?: WorkerBrief;
    createdAt?: string;
    updatedAt?: string;
};

export type JobCreateRequest = {
    title: string;
    shortDescription?: string;
    longDescription: string;
    price: Price;
    jobLocationId: number;
    jobUrgency: JobUrgency;
    requiredSkillIds: number[];
    paymentMode: PaymentMode;
};

export type JobFilterRequest = {
    statuses?: JobStatus[];
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
};

export type WorkerJobFeedRequest = {
    skillIds?: number[];
    radiusKm?: number;
    page?: number;
    size?: number;
};

export type UserSummary = {
    id: number;
    name?: string;
    email?: string;
    role?: Role;
};

export type WorkerBrief = {
    id: number;
    name?: string;
};
