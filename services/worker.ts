import { http } from "./http";
import type { Worker, WorkerSignupRequest } from "../types/user";
import type { JobSummary, WorkerJobFeedRequest, Skill } from "../types/job";
import type { PageResponse } from "../types/common";

export const registerWorker = async (payload: WorkerSignupRequest) => {
    return http<null>("/worker/register", { method: "POST", body: payload });
};

export const getWorkerProfile = async () => {
    return http<Worker>("/worker/me");
};

export const updateWorkerProfile = async (payload: Partial<Worker>) => {
    return http<Worker>("/worker/me", { method: "PATCH", body: payload });
};

export const toggleDutyStatus = async (onDuty: boolean) => {
    return http<null>("/worker/me/duty-status", { method: "PATCH", body: { onDuty } });
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

export const getWorkerJobs = async (workerId: number, page = 0, size = 20) => {
    return http<PageResponse<JobSummary>>(`/jobs/worker/${workerId}`, {
        query: { page, size },
    });
};

export const verifyStartCode = async (jobId: number, workerId: number, code: string) => {
    return http(`/jobs/${jobId}/codes/start`, {
        method: "POST",
        query: { workerId },
        body: { code },
    });
};

export const getWorkerSkills = async () => {
    return http<Skill[]>("/worker/me/skills");
};

export const updateWorkerSkills = async (skillIds: number[]) => {
    return http<null>("/worker/me/skills", { method: "PUT", body: { skillIds } });
};
