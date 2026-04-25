"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    loading?: boolean;
}

const variantClass: Record<Variant, string> = {
    primary: "btn primary",
    ghost: "btn ghost",
    danger: "btn danger",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", loading, disabled, children, className, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(variantClass[variant], className)}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    ),
);

Button.displayName = "Button";
