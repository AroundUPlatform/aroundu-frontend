"use client";

import Link from "next/link";
import Image from "next/image";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useInView,
    type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LANDING_SLIDES, MOBILE_SCREENSHOTS } from "../../utils/assets";

// ── Shared Variants ──

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            delay: i * 0.1,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

// ── Reusable Section Wrapper ──

function Section({
    children,
    className = "",
    id,
}: {
    children: ReactNode;
    className?: string;
    id?: string;
}) {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.15 });
    return (
        <motion.section
            ref={ref}
            id={id}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={stagger}
            className={className}
        >
            {children}
        </motion.section>
    );
}

// ── Floating orb background element ──

function Orb({
    size,
    color,
    top,
    left,
    delay = 0,
}: {
    size: number;
    color: string;
    top: string;
    left: string;
    delay?: number;
}) {
    return (
        <motion.div
            className="orb"
            style={{
                width: size,
                height: size,
                background: color,
                top,
                left,
            }}
            animate={{
                y: [0, -20, 10, -15, 0],
                x: [0, 10, -10, 5, 0],
                scale: [1, 1.08, 0.95, 1.04, 1],
            }}
            transition={{
                duration: 10 + delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        />
    );
}

// ── Ripple rings ──

function RippleRings({ count = 3, color = "rgb(var(--color-brand))" }: { count?: number; color?: string }) {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {Array.from({ length: count }).map((_, i) => (
                <span
                    key={i}
                    className="ripple-ring absolute h-32 w-32"
                    style={{
                        borderColor: color,
                        animationDelay: `${i * 0.5}s`,
                        opacity: 0.3,
                    }}
                />
            ))}
        </div>
    );
}

// ── Parallax wrapper ──

function Parallax({
    children,
    offset = 60,
    className = "",
}: {
    children: ReactNode;
    offset?: number;
    className?: string;
}) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const y = useSpring(useTransform(scrollYProgress, [0, 1], [offset, -offset]), {
        stiffness: 80,
        damping: 20,
    });
    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}

// ── Data ──

const slides = LANDING_SLIDES;

const features = [
    {
        title: "Post a task",
        desc: "Describe what you need, set skills & budget, and publish.",
        icon: "📋",
        gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
        title: "Compare bids",
        desc: "Workers compete with transparent pricing and notes.",
        icon: "⚖️",
        gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
        title: "Verified start",
        desc: "Start codes ensure both parties are present before work begins.",
        icon: "🔐",
        gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
        title: "Secure payout",
        desc: "Release codes unlock escrow only when work is confirmed.",
        icon: "💰",
        gradient: "from-amber-500/20 to-orange-500/20",
    },
];

const steps = [
    { step: "01", title: "Post a Job", desc: "Set skills, budget, urgency, and payment mode." },
    { step: "02", title: "Receive Bids", desc: "Workers browse your listing and submit competitive offers." },
    { step: "03", title: "Start Securely", desc: "Share a start code to confirm on-site presence." },
    { step: "04", title: "Pay & Review", desc: "Release payment with a code and leave a review." },
];

// ── Main Page ──

export default function HomePage() {
    const [slide, setSlide] = useState(0);
    const heroRef = useRef(null);
    const { scrollYProgress: heroScroll } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
    const heroScale = useTransform(heroScroll, [0, 0.5], [1, 0.95]);

    useEffect(() => {
        const interval = setInterval(
            () => setSlide((p) => (p + 1) % slides.length),
            4000,
        );
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid gap-20 overflow-hidden pb-10">
            {/* ── Hero ── */}
            <motion.section
                ref={heroRef}
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface p-8 md:p-16 lg:p-20"
            >
                {/* Background orbs */}
                <Orb size={400} color="rgba(99,179,237,0.15)" top="-10%" left="-5%" delay={0} />
                <Orb size={300} color="rgba(66,153,225,0.1)" top="50%" left="70%" delay={3} />
                <Orb size={200} color="rgba(72,210,143,0.08)" top="80%" left="20%" delay={5} />

                <div className="relative z-10 grid items-center gap-12 md:grid-cols-2">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-7">
                        <motion.div variants={fadeUp} custom={0} className="kicker">
                            Hyperlocal Service Marketplace
                        </motion.div>

                        <motion.h1 variants={fadeUp} custom={1} className="hero-title">
                            Get things done{" "}
                            <br />
                            <span className="gradient-text-animated bg-gradient-to-r from-brand via-blue-400 to-brand-strong bg-[length:200%_200%]">
                                around you.
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} custom={2} className="max-w-lg text-lg leading-relaxed text-muted md:text-xl">
                            AroundU connects you with skilled workers nearby.
                            Post a job, compare bids, and pay securely — all from one place.
                        </motion.p>

                        <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 pt-3">
                            <Link
                                className="btn primary group relative overflow-hidden px-8 py-3.5 text-base font-bold shadow-brand"
                                href="/signup"
                            >
                                <span className="relative z-10">Get Started Free</span>
                                <motion.span
                                    className="absolute inset-0 bg-white/10"
                                    initial={{ x: "-100%", opacity: 0 }}
                                    whileHover={{ x: "0%", opacity: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                            </Link>
                            <Link className="btn ghost px-8 py-3.5 text-base font-bold" href="/login">
                                Sign In
                            </Link>
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div variants={fadeUp} custom={4} className="flex items-center gap-4 pt-2 text-sm text-muted">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                                Secure escrow
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                                Verified workers
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-warning" />
                                Instant bids
                            </span>
                        </motion.div>
                    </motion.div>

                    {/* Phone carousel with parallax */}
                    <Parallax offset={40} className="relative mx-auto flex h-[480px] w-[240px] items-center justify-center">
                        {/* Glow ring behind phone */}
                        <div className="absolute inset-[-20px] animate-glow-pulse rounded-[3rem] bg-gradient-to-br from-brand/20 via-transparent to-brand-strong/15 blur-3xl" />
                        <RippleRings count={3} />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, rotateY: -15 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-border/50 bg-surface-strong shadow-card"
                            style={{ perspective: "1200px" }}
                        >
                            {slides.map((s, i) => (
                                <motion.div
                                    key={s.src}
                                    initial={false}
                                    animate={{
                                        opacity: i === slide ? 1 : 0,
                                        scale: i === slide ? 1 : 1.05,
                                        filter: i === slide ? "blur(0px)" : "blur(4px)",
                                    }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={s.src}
                                        alt={s.alt}
                                        fill
                                        className="object-cover"
                                        priority={i === 0}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Animated dots */}
                        <div className="absolute -bottom-8 flex gap-2.5">
                            {slides.map((_, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setSlide(i)}
                                    className="h-2.5 rounded-full bg-muted/40"
                                    animate={{
                                        width: i === slide ? 28 : 10,
                                        backgroundColor: i === slide
                                            ? "rgb(var(--color-brand))"
                                            : "rgb(var(--color-muted) / 0.3)",
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </Parallax>
                </div>
            </motion.section>

            {/* ── Features ── */}
            <Section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        variants={scaleIn}
                        custom={i}
                        whileHover={{
                            y: -8,
                            rotateX: 2,
                            rotateY: -2,
                            transition: { type: "spring", stiffness: 300, damping: 20 },
                        }}
                        className={`hover-lift card group relative overflow-hidden p-7 ${f.gradient}`}
                    >
                        {/* Hover gradient overlay */}
                        <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                        />
                        <div className="relative z-10 space-y-3">
                            <motion.span
                                className="block text-4xl"
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                {f.icon}
                            </motion.span>
                            <h3 className="font-display text-lg font-bold text-text">{f.title}</h3>
                            <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </Section>

            {/* ── How it works ── */}
            <Section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface p-8 md:p-12">
                <Orb size={250} color="rgba(66,153,225,0.08)" top="10%" left="80%" delay={2} />

                <motion.div variants={fadeUp} custom={0} className="kicker mb-2">
                    How it works
                </motion.div>
                <motion.h2 variants={fadeUp} custom={1} className="section-title mb-10">
                    Four simple steps to get started
                </motion.h2>

                <div className="relative grid gap-6 md:grid-cols-4">
                    {/* Connecting line */}
                    <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent md:block" />

                    {steps.map((item, i) => (
                        <motion.div
                            key={item.step}
                            variants={fadeUp}
                            custom={i + 2}
                            className="relative text-center"
                        >
                            <motion.div
                                className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 font-display text-xl font-bold text-brand"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <span className="relative z-10">{item.step}</span>
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-brand/5"
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                />
                            </motion.div>
                            <h4 className="font-display text-base font-bold text-text">{item.title}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* ── For Clients / Workers ── */}
            <Section className="grid gap-6 md:grid-cols-2">
                <motion.div
                    variants={fadeUp}
                    custom={0}
                    whileHover={{ y: -4 }}
                    className="hover-lift card relative overflow-hidden space-y-5 p-8"
                >
                    <Orb size={150} color="rgba(59,130,246,0.1)" top="-20%" left="-10%" delay={1} />
                    <div className="relative z-10">
                        <div className="kicker mb-1">For Clients</div>
                        <h3 className="section-title !text-2xl">
                            Post once, attract the right talent
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-muted">
                            Share skills, urgency, and payment preferences. Track bids and release payments only when work is confirmed.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="chip">Job creation</span>
                            <span className="chip">Bid reviews</span>
                            <span className="chip">Secure payout</span>
                        </div>
                        <Link className="btn primary mt-5 px-6 py-3 text-base font-bold" href="/signup">
                            Create a client account
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    custom={1}
                    whileHover={{ y: -4 }}
                    className="hover-lift card relative overflow-hidden space-y-5 p-8"
                >
                    <Orb size={150} color="rgba(72,210,143,0.1)" top="-20%" left="80%" delay={2} />
                    <div className="relative z-10">
                        <div className="kicker mb-1">For Workers</div>
                        <h3 className="section-title !text-2xl">
                            See work that matches your skills
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-muted">
                            Filter by skills and radius, bid with confidence, and verify start codes before you begin.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="chip">Skill-based feed</span>
                            <span className="chip">Transparent payouts</span>
                            <span className="chip">Start verification</span>
                        </div>
                        <Link className="btn ghost mt-5 px-6 py-3 text-base font-bold" href="/signup">
                            Join as a worker
                        </Link>
                    </div>
                </motion.div>
            </Section>

            {/* ── Screenshots ── */}
            <Section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface p-8 text-center md:p-12">
                <Orb size={300} color="rgba(99,179,237,0.08)" top="60%" left="50%" delay={4} />

                <motion.div variants={fadeUp} custom={0} className="kicker mb-2">
                    Available on Mobile
                </motion.div>
                <motion.h3 variants={fadeUp} custom={1} className="section-title mb-8">
                    Manage everything on the go
                </motion.h3>

                <motion.div
                    variants={fadeUp}
                    custom={2}
                    className="mx-auto flex max-w-3xl items-center justify-center gap-5 overflow-x-auto py-6"
                >
                    {MOBILE_SCREENSHOTS.map((src, i) => (
                        <Parallax key={src} offset={15 + i * 10}>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -8, rotate: i % 2 === 0 ? 2 : -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="hover-lift relative h-[320px] w-[160px] flex-shrink-0 overflow-hidden rounded-2xl border border-border/50 shadow-card"
                            >
                                <Image src={src} alt="Mobile screenshot" fill className="object-cover" />
                            </motion.div>
                        </Parallax>
                    ))}
                </motion.div>
            </Section>

            {/* ── CTA ── */}
            <Section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface p-10 text-center md:p-16">
                <Orb size={350} color="rgba(99,179,237,0.12)" top="30%" left="50%" delay={0} />
                <RippleRings count={4} color="rgb(var(--color-brand) / 0.1)" />

                <div className="relative z-10">
                    <motion.div variants={fadeUp} custom={0} className="kicker mb-2">
                        Ready to begin?
                    </motion.div>
                    <motion.h3 variants={fadeUp} custom={1} className="section-title mx-auto max-w-xl">
                        Set up your account and publish your first job today.
                    </motion.h3>
                    <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link className="btn primary group relative overflow-hidden px-8 py-3.5 text-base font-bold shadow-brand" href="/signup">
                            <span className="relative z-10">Start Free</span>
                            <motion.span
                                className="absolute inset-0 bg-white/10"
                                initial={{ x: "-100%", opacity: 0 }}
                                whileHover={{ x: "0%", opacity: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </Link>
                        <Link className="btn ghost px-8 py-3.5 text-base font-bold" href="/login">
                            I already have an account
                        </Link>
                    </motion.div>
                </div>
            </Section>
        </div>
    );
}
