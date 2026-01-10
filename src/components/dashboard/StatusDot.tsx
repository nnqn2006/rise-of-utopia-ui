import { cn } from "@/lib/utils";

type StatusLevel = "safe" | "warning" | "danger";

interface StatusDotProps {
    level: StatusLevel;
    size?: "sm" | "md" | "lg";
    className?: string;
    showPulse?: boolean;
}

const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
};

const colorClasses = {
    safe: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive"
};

export function StatusDot({
    level,
    size = "md",
    className = "",
    showPulse = true
}: StatusDotProps) {
    return (
        <span
            className={cn(
                "inline-block rounded-full",
                sizeClasses[size],
                colorClasses[level],
                showPulse && "animate-pulse",
                className
            )}
            title={
                level === "safe" ? "An toàn" :
                    level === "warning" ? "Cảnh báo" :
                        "Nguy hiểm"
            }
        />
    );
}

// Utility function to determine status level based on percentage
export function getStatusLevel(value: number, thresholds = { warning: 50, danger: 20 }): StatusLevel {
    if (value >= thresholds.warning) return "safe";
    if (value >= thresholds.danger) return "warning";
    return "danger";
}
