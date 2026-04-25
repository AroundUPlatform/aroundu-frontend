import { cn } from "../../lib/cn";

type BadgeVariant = "default" | "brand" | "danger" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
    default: "badge",
    brand: "badge border-brand/40 bg-brand/10 text-brand",
    danger: "badge border-danger/40 bg-danger/10 text-danger",
    success: "badge border-success/40 bg-success/10 text-success",
    warning: "badge border-warning/40 bg-warning/10 text-warning",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
    return (
        <span className={cn(variantClasses[variant], className)} {...props}>
            {children}
        </span>
    );
}
