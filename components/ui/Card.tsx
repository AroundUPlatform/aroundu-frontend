import { cn } from "../../lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export function Card({ hoverable, className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "card p-5",
                hoverable && "hover-lift cursor-pointer hover:shadow-card-hover hover:border-brand/20",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("mb-3 flex items-center justify-between", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("text-lg font-semibold text-text", className)} {...props}>
            {children}
        </h3>
    );
}
