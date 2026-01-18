import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseFallback, bidBaseFallback } from "../../../utils/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || apiBaseFallback;
const BID_BASE = process.env.NEXT_PUBLIC_BID_BASE || bidBaseFallback;

type ProxyBody = {
    path: string;
    method?: string;
    base?: "api" | "bid";
    body?: any;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>;
};

const buildUrl = (path: string, base: "api" | "bid", query?: ProxyBody["query"]) => {
    const root = base === "bid" ? BID_BASE : API_BASE;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(normalizedPath, root.endsWith("/") ? root : `${root}/`);
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)));
            else url.searchParams.append(key, String(value));
        });
    }
    return url.toString();
};

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as ProxyBody | null;
    if (!body?.path) return NextResponse.json({ message: "Path is required" }, { status: 400 });

    const { path, method = "GET", base = "api", headers = {}, query, body: payload } = body;

    const url = buildUrl(path, base, query);
    const cookieStore = await cookies();
    const token = cookieStore.get("au_jwt")?.value;

    const backendHeaders: Record<string, string> = {
        Accept: "application/json",
        ...headers,
    };
    if (payload !== undefined && payload !== null && method !== "GET") {
        if (!(payload instanceof FormData)) {
            backendHeaders["Content-Type"] = backendHeaders["Content-Type"] || "application/json";
        }
    }
    if (token) backendHeaders.Authorization = `Bearer ${decodeURIComponent(token)}`;

    let backendResponse: Response;
    try {
        backendResponse = await fetch(url, {
            method,
            headers: backendHeaders,
            body: method === "GET" ? undefined : payload instanceof FormData ? payload : JSON.stringify(payload),
        });
    } catch (err) {
        return NextResponse.json({ message: "Service is temporarily unavailable. Please try again soon." }, { status: 503 });
    }

    const contentType = backendResponse.headers.get("content-type");
    const asJson = contentType?.includes("application/json");
    const data = asJson ? await backendResponse.json().catch(() => null) : null;

    if (!backendResponse.ok) {
        const unavailable = backendResponse.status === 502 || backendResponse.status === 503;
        const message = unavailable
            ? "Service is temporarily unavailable. Please try again soon."
            : (data as any)?.message || backendResponse.statusText || "Request failed";
        return NextResponse.json({ message }, { status: unavailable ? 503 : backendResponse.status });
    }

    return NextResponse.json(data ?? { success: true });
}
