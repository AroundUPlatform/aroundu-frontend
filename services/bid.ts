import { http } from "./http";
import type { Bid } from "../types/bid";

export const placeBid = async (
    jobId: number,
    workerId: number,
    bidAmount: number,
    options?: { partnerName?: string; partnerFee?: number; notes?: string },
) => {
    return http(`/jobs/${jobId}/bids`, {
        base: "bid",
        method: "POST",
        query: { workerId },
        body: { bidAmount, ...options },
    });
};

export const getJobBids = async (jobId: number) => {
    return http<Bid[]>(`/jobs/${jobId}/bids`);
};

export const acceptBid = async (jobId: number, bidId: number) => {
    return http<null>(`/jobs/${jobId}/bids/${bidId}/accept`, { method: "POST" });
};

export const rejectBid = async (jobId: number, bidId: number) => {
    return http<null>(`/jobs/${jobId}/bids/${bidId}/reject`, { method: "POST" });
};
