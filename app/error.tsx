"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const message = error?.message || "Something went wrong";
    const isUnavailable = /temporarily unavailable/i.test(message) || /unavailable/i.test(message);

    return (
        <html lang="en">
            <body className="layout-shell">
                <div className="card space-y-4 p-8 text-center">
                    <div className="kicker">We hit a snag</div>
                    <h1 className="hero-title">Service is currently unavailable.</h1>
                    <p className="muted text-sm md:text-base">
                        {isUnavailable
                            ? "Our backend looks offline. Please wait a moment and try again."
                            : "An unexpected error occurred. If this continues, please retry later."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button className="btn primary" onClick={reset}>
                            Try again
                        </button>
                        <Link href="/" className="btn ghost">
                            Go home
                        </Link>
                    </div>
                    <p className="muted text-xs">Details: {message}</p>
                </div>
            </body>
        </html>
    );
}
