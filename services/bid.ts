import { http } from "./http";

export const placeBid = async (
    jobId: number,
    workerId: number,
    bidAmount: number,
    options?: { partnerName?: string; partnerFee?: number; notes?: string }
) => {
    return http(`/jobs/${jobId}/bids`, {
        base: "bid",
        method: "POST",
        query: { workerId },
        body: { bidAmount, ...options },
    });
};
