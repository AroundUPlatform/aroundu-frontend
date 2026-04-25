import type { Price } from "./common";

export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type Bid = {
    id: number;
    jobId: number;
    workerId: number;
    workerName?: string;
    amount: Price;
    notes?: string;
    partnerName?: string;
    partnerFee?: Price;
    bidStatus: BidStatus;
    createdAt?: string;
};

export type PlaceBidRequest = {
    amount: number;
    currency: string;
    notes?: string;
    partnerName?: string;
    partnerFee?: number;
};
