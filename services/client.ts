import { http } from "./http";
import type { ClientRegisterRequest } from "../types/user";
import type { JobCreateRequest, JobDetail, JobSummary } from "../types/job";
import type { PageResponse } from "../types/common";

export const registerClient = async (payload: ClientRegisterRequest) => {
    return http<null>("/client/register", { method: "POST", body: payload });
};

export const getClientJobs = async (clientId: number, page = 0, size = 20) => {
    return http<PageResponse<JobSummary>>(`/jobs/client/${clientId}`, {
        query: { page, size },
    });
};

export const createJob = async (clientId: number, payload: JobCreateRequest) => {
    return http<JobDetail>(`/jobs`, {
        method: "POST",
        query: { clientId },
        body: payload,
    });
};

export const deleteJob = async (jobId: number, clientId: number) => {
    return http<null>(`/jobs/${jobId}`, { method: "DELETE", query: { clientId } });
};

export const verifyReleaseCode = async (jobId: number, clientId: number, code: string) => {
    return http(`/jobs/${jobId}/codes/release`, {
        method: "POST",
        query: { clientId },
        body: { code },
    });
};
