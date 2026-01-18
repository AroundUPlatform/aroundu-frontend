import { http } from "./http";
import type { Client, Worker } from "../types/user";
import type { PageResponse } from "../types/common";

export const fetchClients = (page = 0, size = 50) => http<PageResponse<Client>>(`/client/all`, { query: { page, size } });

export const fetchWorkers = (page = 0, size = 50) => http<PageResponse<Worker>>(`/worker/all`, { query: { page, size } });

export const deleteClient = (clientId: number) => http(`/client/${clientId}`, { method: "DELETE" });

export const deleteWorker = (workerId: number) => http(`/worker/${workerId}`, { method: "DELETE" });
