import { cn } from "../../lib/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    size?: "sm" | "md" | "lg";
    fallback?: string;
}

const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
};

export function Avatar({ src, alt = "", size = "md", fallback, className, ...props }: AvatarProps) {
    const initials = fallback
        ? fallback
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

    return (
        <div
            className={cn(
                "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-strong font-semibold text-muted",
                sizeClass[size],
                className,
            )}
            {...props}
        >
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
