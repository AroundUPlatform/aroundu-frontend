"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn("input", error && "border-danger focus:ring-danger/40", className)}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            </div>
        );
    },
);

Input.displayName = "Input";
