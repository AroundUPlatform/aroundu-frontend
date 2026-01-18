import Link from "next/link";

export default function NotFound() {
    return (
        <div className="layout-shell">
            <div className="card space-y-4 p-8 text-center">
                <div className="kicker">Page not found</div>
                <h1 className="hero-title">We couldn&apos;t find that page.</h1>
                <p className="muted text-sm md:text-base">Check the URL or return to the homepage to continue.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/" className="btn primary">
                        Go home
                    </Link>
                    <Link href="/login" className="btn ghost">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
