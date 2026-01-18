import type { ApiResponse } from "../types/common";

type BaseSelector = "api" | "bid";

type RequestConfig = {
    method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
    body?: any;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>;
    base?: BaseSelector;
};

export async function http<T = unknown>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, query, base = "api" } = config;

    let response: Response;
    try {
        response = await fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, method, headers, query, base, body }),
            credentials: "include",
        });
    } catch (err) {
        throw new Error("Service is temporarily unavailable. Please try again soon.");
    }

    const parsed = await response.json().catch(() => null);
    if (!response.ok) {
        const message = (parsed as any)?.message || response.statusText || "Request failed";
        throw new Error(message);
    }

    return parsed as ApiResponse<T>;
}
