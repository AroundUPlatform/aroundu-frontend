"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { queryMetrics } from "../../../../services/admin";
import { Spinner } from "../../../../components/ui/Spinner";
import { cn } from "../../../../lib/cn";
import type { PrometheusMetric } from "../../../../types/admin";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import {
    Activity,
    Cpu,
    HardDrive,
    Network,
    Clock,
    Server,
} from "lucide-react";

/* ── preset queries ─────────────────────────────────────── */
const PRESETS = [
    {
        label: "HTTP Request Rate",
        query: 'rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[5m])',
        icon: Network,
    },
    {
        label: "Request Latency p95",
        query: 'histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))',
        icon: Clock,
    },
    {
        label: "JVM Heap Used",
        query: "jvm_memory_used_bytes{area=\"heap\"}",
        icon: Cpu,
    },
    {
        label: "JVM Threads",
        query: "jvm_threads_live_threads",
        icon: Server,
    },
    {
        label: "DB Connection Pool",
        query: "hikaricp_connections_active",
        icon: HardDrive,
    },
    {
        label: "System CPU Usage",
        query: "system_cpu_usage",
        icon: Activity,
    },
];

const RANGES = [
    { label: "15m", seconds: 900 },
    { label: "1h", seconds: 3600 },
    { label: "6h", seconds: 21600 },
    { label: "24h", seconds: 86400 },
];

/* ── helpers ─────────────────────────────────────────────── */
function buildTimeParams(seconds: number) {
    const end = Math.floor(Date.now() / 1000);
    const start = end - seconds;
    const step = Math.max(Math.floor(seconds / 200), 15).toString();
    return { start: start.toString(), end: end.toString(), step };
}

function formatTimestamp(epoch: number) {
    return new Date(epoch * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function metricsToChartData(
    metrics: PrometheusMetric[],
): { time: string; epoch: number; [key: string]: string | number }[] {
    if (!metrics.length) return [];

    /* range vector — use values */
    if (metrics[0].values) {
        const seriesMap = new Map<number, { time: string; epoch: number; [key: string]: string | number }>();
        metrics.forEach((m, idx) => {
            const seriesName =
                m.metric.uri ?? m.metric.area ?? m.metric.__name__ ?? `series-${idx}`;
            (m.values ?? []).forEach(([ts, val]) => {
                if (!seriesMap.has(ts)) {
                    seriesMap.set(ts, { epoch: ts, time: formatTimestamp(ts) });
                }
                seriesMap.get(ts)![seriesName] = parseFloat(parseFloat(val).toFixed(4));
            });
        });
        return Array.from(seriesMap.values()).sort(
            (a, b) => (a.epoch as number) - (b.epoch as number),
        );
    }

    /* instant vector — single point per series */
    return metrics

        .filter((m) => m.value)
        .map((m, idx) => ({
            epoch: m.value![0],
            time: formatTimestamp(m.value![0]),
            [m.metric.uri ?? m.metric.__name__ ?? `s${idx}`]: parseFloat(
                parseFloat(m.value![1]).toFixed(4),
            ),
        }));
}

const CHART_COLORS = [
    "var(--color-brand)",
    "#22d3ee",
    "#a78bfa",
    "#fb923c",
    "#34d399",
    "#f472b6",
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

/* ── component ───────────────────────────────────────────── */
export default function AdminMetricsPage() {
    const [activePreset, setActivePreset] = useState(0);
    const [range, setRange] = useState(RANGES[1]); // 1h default
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState<
        { time: string; [k: string]: string | number }[]
    >([]);
    const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const run = useCallback(
        async (presetIdx: number, rangeObj: (typeof RANGES)[number]) => {
            setLoading(true);
            setError(null);
            try {
                const { start, end, step } = buildTimeParams(rangeObj.seconds);
                const res = await queryMetrics(
                    PRESETS[presetIdx].query,
                    start,
                    end,
                    step,
                );
                const metrics = res.data?.data?.result ?? [];
                const data = metricsToChartData(metrics);
                setChartData(data);
                const keys = new Set<string>();
                data.forEach((d) =>
                    Object.keys(d).forEach((k) => {
                        if (k !== "time" && k !== "epoch") keys.add(k);
                    }),
                );
                setSeriesKeys(Array.from(keys));
            } catch {
                setError("Failed to fetch metrics — is Prometheus reachable?");
                setChartData([]);
                setSeriesKeys([]);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    /* auto-fetch when preset / range changes */
    const selectPreset = (idx: number) => {
        setActivePreset(idx);
        run(idx, range);
    };
    const selectRange = (r: (typeof RANGES)[number]) => {
        setRange(r);
        run(activePreset, r);
    };

    return (
        <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold text-text">Prometheus Metrics</h1>
            </motion.div>

            {/* preset buttons */}
            <motion.div variants={stagger} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PRESETS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                        <motion.button
                            key={i}
                            variants={fadeUp}
                            onClick={() => selectPreset(i)}
                            className={cn(
                                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                                activePreset === i
                                    ? "border-brand bg-brand/10 text-brand shadow-sm"
                                    : "border-border/60 text-muted hover:border-brand/40 hover:text-text",
                            )}
                        >
                            <Icon size={18} />
                            {p.label}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* time range */}
            <motion.div variants={fadeUp} className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">Range:</span>
                {RANGES.map((r) => (
                    <button
                        key={r.label}
                        onClick={() => selectRange(r)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            range.label === r.label
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border/60 text-muted hover:border-brand/40",
                        )}
                    >
                        {r.label}
                    </button>
                ))}
            </motion.div>

            {/* chart area */}
            <motion.div variants={fadeUp} className="min-h-[340px] rounded-2xl border border-border/60 bg-surface p-4">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-2">
                        <p className="text-sm text-danger">{error}</p>
                        <button
                            onClick={() => run(activePreset, range)}
                            className="text-xs text-brand underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted">
                        <Activity size={32} />
                        <p className="text-sm">Select a metric to visualize.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                {seriesKeys.map((key, idx) => (
                                    <linearGradient
                                        key={key}
                                        id={`grad-${idx}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={
                                                CHART_COLORS[idx % CHART_COLORS.length]
                                            }
                                            stopOpacity={0.4}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={
                                                CHART_COLORS[idx % CHART_COLORS.length]
                                            }
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--color-border)"
                                opacity={0.4}
                            />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                    borderRadius: 12,
                                    fontSize: 12,
                                }}
                            />
                            {seriesKeys.length > 1 && <Legend />}
                            {seriesKeys.map((key, idx) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={
                                        CHART_COLORS[idx % CHART_COLORS.length]
                                    }
                                    fill={`url(#grad-${idx})`}
                                    strokeWidth={2}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </motion.div>

            {/* raw query display */}
            <motion.div variants={fadeUp} className="rounded-xl border border-border/40 bg-surface/50 px-4 py-3">
                <p className="text-xs text-muted">
                    <span className="font-medium text-text">PromQL: </span>
                    <code className="break-all">{PRESETS[activePreset].query}</code>
                </p>
            </motion.div>
        </motion.div>
    );
}
