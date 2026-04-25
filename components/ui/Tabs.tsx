"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface Tab {
    key: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    active: string;
    onChange: (key: string) => void;
    className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const activeEl = container.querySelector<HTMLButtonElement>(`[data-tab="${active}"]`);
        if (activeEl) {
            setIndicatorStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
            });
        }
    }, [active, tabs]);

    return (
        <div
            ref={containerRef}
            className={cn("relative flex gap-1 overflow-x-auto rounded-xl bg-surface-strong p-1", className)}
            role="tablist"
        >
            {/* Sliding indicator */}
            <motion.div
                className="absolute top-1 bottom-1 z-0 rounded-lg bg-brand shadow-sm"
                animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    data-tab={tab.key}
                    role="tab"
                    aria-selected={active === tab.key}
                    onClick={() => onChange(tab.key)}
                    className={cn(
                        "relative z-10 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                        active === tab.key
                            ? "text-white"
                            : "text-muted hover:text-text",
                    )}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
                    )}
                </button>
            ))}
        </div>
    );
}

/** Simple uncontrolled tabs wrapper for convenience */
export function TabPanel({
    tabs,
    children,
    defaultTab,
}: {
    tabs: Tab[];
    children: (activeKey: string) => React.ReactNode;
    defaultTab?: string;
}) {
    const [active, setActive] = useState(defaultTab || tabs[0]?.key || "");
    return (
        <div>
            <Tabs tabs={tabs} active={active} onChange={setActive} />
            <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="mt-4"
            >
                {children(active)}
            </motion.div>
        </div>
    );
}
