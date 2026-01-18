import { http } from "./http";
import type { WorkerSignupRequest } from "../types/user";
import type { JobSummary, WorkerJobFeedRequest } from "../types/job";
import type { PageResponse } from "../types/common";

export const registerWorker = async (payload: WorkerSignupRequest) => {
    return http<null>("/worker/register", { method: "POST", body: payload });
};

export const getWorkerFeed = async (workerId: number, filters: WorkerJobFeedRequest) => {
    return http<PageResponse<JobSummary>>(`/jobs/worker/${workerId}/feed`, {
        query: {
            skillIds: filters.skillIds,
            radiusKm: filters.radiusKm,
            page: filters.page ?? 0,
            size: filters.size ?? 20,
        },
    });
};

export const verifyStartCode = async (jobId: number, workerId: number, code: string) => {
    return http(`/jobs/${jobId}/codes/start`, {
        method: "POST",
        query: { workerId },
        body: { code },
    });
};
