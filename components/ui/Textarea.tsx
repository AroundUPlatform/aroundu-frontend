"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="label">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn("textarea min-h-[100px] resize-y", error && "border-danger focus:ring-danger/40", className)}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            </div>
        );
    },
);

Textarea.displayName = "Textarea";
