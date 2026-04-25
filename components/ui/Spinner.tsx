import { cn } from "../../lib/cn";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClass = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <span
            role="status"
            className={cn(
                "inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-brand",
                sizeClass[size],
                className,
            )}
        >
            <span className="sr-only">Loading…</span>
        </span>
    );
}
