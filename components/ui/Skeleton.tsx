import { cn } from "../../lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Width — Tailwind class like "w-full" or "w-32" */
    w?: string;
    /** Height — Tailwind class like "h-4" or "h-10" */
    h?: string;
    circle?: boolean;
}

export function Skeleton({ w = "w-full", h = "h-4", circle, className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-shimmer bg-gradient-to-r from-surface-strong via-surface to-surface-strong bg-[length:200%_100%]",
                circle ? "rounded-full" : "rounded-xl",
                w,
                h,
                className,
            )}
            {...props}
        />
    );
}
