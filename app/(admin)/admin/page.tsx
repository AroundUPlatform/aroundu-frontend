"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchOverview } from "../../../services/admin";
import { Spinner } from "../../../components/ui/Spinner";
import type { AdminOverview } from "../../../types/admin";
import { cn } from "../../../lib/cn";

export default function AdminOverviewPage() {
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview()
            .then((res) => setOverview(res.data ?? null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
    }

    const stats = overview
        ? [
              { label: "Total Clients", value: overview.totalClients, icon: "👤", accent: "text-brand" },
              { label: "Total Workers", value: overview.totalWorkers, icon: "🔧", accent: "text-brand" },
              { label: "Active Jobs", value: overview.activeJobs, icon: "⚡", accent: "text-warning" },
              { label: "Open Jobs", value: overview.openJobs, icon: "📋", accent: "text-brand" },
              { label: "Created Today", value: overview.jobsCreatedToday, icon: "🆕", accent: "text-success" },
              { label: "Completed Today", value: overview.jobsCompletedToday, icon: "✅", accent: "text-success" },
          ]
        : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text">Platform Overview</h1>
                <p className="text-sm text-muted">Real-time platform statistics.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-border/60 bg-surface p-5"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{s.icon}</span>
                            <span className="text-xs text-muted">{s.label}</span>
                        </div>
                        <div className={cn("mt-2 text-3xl font-bold", s.accent)}>{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {!overview && (
                <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center">
                    <p className="text-muted">Could not load overview data. Make sure the backend is running.</p>
                </div>
            )}
        </div>
    );
}
