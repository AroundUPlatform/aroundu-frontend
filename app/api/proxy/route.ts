import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseFallback, bidBaseFallback } from "../../../utils/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || apiBaseFallback;
const BID_BASE = process.env.NEXT_PUBLIC_BID_BASE || bidBaseFallback;
const ENCRYPTION_KEY = process.env.PAYLOAD_ENCRYPTION_KEY; // 32-byte hex string

type ProxyBody = {
    path: string;
    method?: string;
    base?: "api" | "bid";
    body?: any;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>;
};

/* ── Encryption helpers (ChaCha20-Poly1305 via @noble/ciphers) ── */

let _cipherMod: typeof import("@noble/ciphers/chacha.js") | null = null;
let _utilsMod: typeof import("@noble/ciphers/utils.js") | null = null;

async function getCipherModules() {
    if (!_cipherMod || !_utilsMod) {
        _cipherMod = await import("@noble/ciphers/chacha.js");
        _utilsMod = await import("@noble/ciphers/utils.js");
    }
    return { cipher: _cipherMod, utils: _utilsMod };
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

async function encryptPayload(plaintext: string): Promise<{ ciphertext: string; nonce: string } | null> {
    if (!ENCRYPTION_KEY) return null;
    try {
        const { cipher, utils } = await getCipherModules();
        const key = hexToBytes(ENCRYPTION_KEY);
        const nonce = utils.randomBytes(12);
        const encoded = new TextEncoder().encode(plaintext);
        const chacha = cipher.chacha20poly1305(key, nonce);
        const sealed = chacha.encrypt(encoded);
        return {
            ciphertext: Buffer.from(sealed).toString("base64"),
            nonce: Buffer.from(nonce).toString("base64"),
        };
    } catch {
        return null;
    }
}

async function decryptPayload(ciphertext: string, nonce: string): Promise<string | null> {
    if (!ENCRYPTION_KEY) return null;
    try {
        const { cipher } = await getCipherModules();
        const key = hexToBytes(ENCRYPTION_KEY);
        const nonceBytes = Uint8Array.from(Buffer.from(nonce, "base64"));
        const sealed = Uint8Array.from(Buffer.from(ciphertext, "base64"));
        const chacha = cipher.chacha20poly1305(key, nonceBytes);
        const plainBytes = chacha.decrypt(sealed);
        return new TextDecoder().decode(plainBytes);
    } catch {
        return null;
    }
}

/* ── URL builder ── */

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

/* ── Route handler ── */

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

    /* Determine if we should encrypt the outgoing payload */
    const shouldEncrypt = ENCRYPTION_KEY && method !== "GET" && payload != null && !(payload instanceof FormData);
    let finalBody: string | FormData | undefined;

    if (method === "GET") {
        finalBody = undefined;
    } else if (payload instanceof FormData) {
        finalBody = payload;
    } else if (shouldEncrypt) {
        const encrypted = await encryptPayload(JSON.stringify(payload));
        if (encrypted) {
            finalBody = JSON.stringify(encrypted);
            backendHeaders["Content-Type"] = "application/json";
            backendHeaders["X-Encrypted"] = "chacha20-poly1305";
        } else {
            /* Encryption failed — fall back to plaintext */
            backendHeaders["Content-Type"] = backendHeaders["Content-Type"] || "application/json";
            finalBody = JSON.stringify(payload);
        }
    } else if (payload !== undefined && payload !== null) {
        backendHeaders["Content-Type"] = backendHeaders["Content-Type"] || "application/json";
        finalBody = JSON.stringify(payload);
    }

    if (token) backendHeaders.Authorization = `Bearer ${decodeURIComponent(token)}`;

    let backendResponse: Response;
    try {
        backendResponse = await fetch(url, {
            method,
            headers: backendHeaders,
            body: finalBody,
        });
    } catch (err) {
        return NextResponse.json({ message: "Service is temporarily unavailable. Please try again soon." }, { status: 503 });
    }

    const contentType = backendResponse.headers.get("content-type");
    const encrypted = backendResponse.headers.get("x-encrypted");
    const asJson = contentType?.includes("application/json");

    let data: any = null;

    if (asJson) {
        const raw = await backendResponse.json().catch(() => null);

        /* If backend returned encrypted payload, decrypt before forwarding to client */
        if (encrypted && raw?.ciphertext && raw?.nonce) {
            const decrypted = await decryptPayload(raw.ciphertext, raw.nonce);
            data = decrypted ? JSON.parse(decrypted) : raw;
        } else {
            data = raw;
        }
    }

    if (!backendResponse.ok) {
        const unavailable = backendResponse.status === 502 || backendResponse.status === 503;
        const message = unavailable
            ? "Service is temporarily unavailable. Please try again soon."
            : (data as any)?.message || backendResponse.statusText || "Request failed";
        return NextResponse.json({ message }, { status: unavailable ? 503 : backendResponse.status });
    }

    return NextResponse.json(data ?? { success: true });
}
