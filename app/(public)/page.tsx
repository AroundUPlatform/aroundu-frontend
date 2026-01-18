import Link from "next/link";

export default function HomePage() {
    return (
        <div className="grid gap-8">
            <section className="card space-y-4 p-8 md:p-10">
                <div className="kicker">Local work, handled</div>
                <h1 className="hero-title">A trusted bridge between clients and workers.</h1>
                <p className="muted max-w-3xl">
                    AroundU lets clients post jobs with clear requirements, workers discover matching opportunities, and admins keep everything compliant. Simple, secure, and built for fast, verified hand-offs.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                    <Link className="btn primary" href="/signup">
                        Get started
                    </Link>
                    <Link className="btn ghost" href="/login">
                        Login
                    </Link>
                    <Link className="btn ghost" href="/admin">
                        Admin login
                    </Link>
                </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2">
                <div className="card space-y-4 p-6 md:p-7">
                    <div className="kicker">How it works</div>
                    <div className="grid gap-3 pt-1">
                        {["Post a job with skills and budget.", "Workers see a filtered feed and place bids.", "Start codes protect kick-off; release codes unlock payout.", "Admins oversee users and resolve issues."].map((text, idx) => (
                            <div key={idx} className="badge flex items-center justify-between">
                                <span>{text}</span>
                                <span className="font-semibold text-brand">{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card space-y-4 p-6 md:p-7">
                    <div className="kicker">Why teams choose AroundU</div>
                    <div className="grid gap-3 pt-1">
                        <div className="badge">Role-based dashboards for clients, workers, and admins.</div>
                        <div className="badge">Secure code-based start and release to prevent disputes.</div>
                        <div className="badge">Clear job briefs with required skills and payment mode.</div>
                        <div className="badge">Escrow-ready flow for confident payouts.</div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2">
                <div className="card space-y-3 p-6 md:p-7">
                    <div className="kicker">For Clients</div>
                    <h3 className="text-xl font-semibold">Post once, attract the right talent</h3>
                    <p className="muted">Share skills, urgency, and payment preferences. Track bids and release payments only when work is confirmed.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <span className="chip">Job creation</span>
                        <span className="chip">Bid reviews</span>
                        <span className="chip">Secure payout</span>
                    </div>
                    <Link className="btn primary" href="/signup">
                        Create a client account
                    </Link>
                </div>
                <div className="card space-y-3 p-6 md:p-7">
                    <div className="kicker">For Workers</div>
                    <h3 className="text-xl font-semibold">See work that matches your skills</h3>
                    <p className="muted">Filter by skills and radius, bid with confidence, and verify start codes before you begin.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <span className="chip">Skill-based feed</span>
                        <span className="chip">Transparent payouts</span>
                        <span className="chip">Start verification</span>
                    </div>
                    <Link className="btn ghost" href="/signup">
                        Join as a worker
                    </Link>
                </div>
            </section>

            <section className="card space-y-4 p-8 text-center">
                <div className="kicker">Ready to begin?</div>
                <h3 className="text-2xl font-semibold">Set up your account and publish your first job today.</h3>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link className="btn primary" href="/signup">
                        Start free
                    </Link>
                    <Link className="btn ghost" href="/login">
                        I already have an account
                    </Link>
                </div>
            </section>
        </div>
    );
}
