"use client";

import { useState } from "react";
import { cn } from "../../lib/cn";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    side?: "top" | "bottom";
    className?: string;
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
    const [show, setShow] = useState(false);

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onFocus={() => setShow(true)}
            onBlur={() => setShow(false)}
        >
            {children}
            {show && (
                <span
                    role="tooltip"
                    className={cn(
                        "absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-surface-strong px-2.5 py-1 text-xs font-medium text-text shadow-card animate-fade-in",
                        side === "top" ? "bottom-full mb-2" : "top-full mt-2",
                        className,
                    )}
                >
                    {content}
                </span>
            )}
        </span>
    );
}
