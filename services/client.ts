import { http } from "./http";
import type { Client, ClientRegisterRequest } from "../types/user";
import type { JobCreateRequest, JobDetail, JobSummary, JobFilterRequest } from "../types/job";
import type { PageResponse } from "../types/common";
import type { Address } from "../types/common";

export const registerClient = async (payload: ClientRegisterRequest) => {
    return http<null>("/client/register", { method: "POST", body: payload });
};

export const getClientProfile = async () => {
    return http<Client>("/client/me");
};

export const updateClientProfile = async (payload: Partial<Client>) => {
    return http<Client>("/client/me", { method: "PATCH", body: payload });
};

export const getClientJobs = async (clientId: number, page = 0, size = 20) => {
    return http<PageResponse<JobSummary>>(`/jobs/client/${clientId}`, {
        query: { page, size },
    });
};

export const getClientJobsFiltered = async (clientId: number, filters: JobFilterRequest) => {
    return http<PageResponse<JobSummary>>(`/jobs/client/${clientId}`, {
        query: {
            statuses: filters.statuses,
            startDate: filters.startDate,
            endDate: filters.endDate,
            page: filters.page ?? 0,
            size: filters.size ?? 20,
        },
    });
};

export const createJob = async (clientId: number, payload: JobCreateRequest) => {
    return http<JobDetail>(`/jobs`, {
        method: "POST",
        query: { clientId },
        body: payload,
    });
};

export const getJobDetail = async (jobId: number) => {
    return http<JobDetail>(`/jobs/${jobId}`);
};

export const cancelJob = async (jobId: number, clientId: number) => {
    return http<null>(`/jobs/${jobId}/cancel`, { method: "POST", query: { clientId } });
};

export const deleteJob = async (jobId: number, clientId: number) => {
    return http<null>(`/jobs/${jobId}`, { method: "DELETE", query: { clientId } });
};

export const verifyReleaseCode = async (jobId: number, workerId: number, code: string) => {
    return http(`/jobs/${jobId}/codes/release`, {
        method: "POST",
        query: { workerId },
        body: { code },
    });
};

export const getClientAddresses = async () => {
    return http<Address[]>("/client/me/addresses");
};

export const createAddress = async (address: Address) => {
    return http<Address>("/client/me/addresses", { method: "POST", body: address });
};
