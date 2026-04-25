import { http } from "./http";
import type { Client, Worker } from "../types/user";
import type { JobSummary, JobStatus } from "../types/job";
import type { PageResponse } from "../types/common";
import type { AdminOverview, PrometheusResult } from "../types/admin";

export const fetchOverview = () => http<AdminOverview>("/admin/overview");

export const fetchClients = (page = 0, size = 50) => http<PageResponse<Client>>(`/client/all`, { query: { page, size } });

export const fetchWorkers = (page = 0, size = 50) => http<PageResponse<Worker>>(`/worker/all`, { query: { page, size } });

export const fetchAdminJobs = (statuses?: JobStatus[], page = 0, size = 50) =>
    http<PageResponse<JobSummary>>("/admin/jobs", { query: { statuses, page, size } });

export const deleteClient = (clientId: number) => http(`/client/${clientId}`, { method: "DELETE" });

export const deleteWorker = (workerId: number) => http(`/worker/${workerId}`, { method: "DELETE" });

export const queryMetrics = (query: string, start?: string, end?: string, step?: string) =>
    http<PrometheusResult>("/admin/metrics/query", {
        query: { query, start, end, step },
    });
