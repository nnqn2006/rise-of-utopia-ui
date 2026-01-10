import { useMemo } from "react";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    className?: string;
}

export function Sparkline({
    data,
    width = 80,
    height = 30,
    className = ""
}: SparklineProps) {
    const { path, color, trend } = useMemo(() => {
        if (data.length < 2) return { path: "", color: "stroke-muted", trend: 0 };

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        });

        const trendValue = data[data.length - 1] - data[0];
        const strokeColor = trendValue >= 0 ? "stroke-success" : "stroke-destructive";

        return {
            path: `M${points.join(" L")}`,
            color: strokeColor,
            trend: trendValue
        };
    }, [data, width, height]);

    const fillColor = trend >= 0 ? "fill-success/20" : "fill-destructive/20";
    const areaPath = useMemo(() => {
        if (data.length < 2) return "";
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        });

        return `M0,${height} L${points.join(" L")} L${width},${height} Z`;
    }, [data, width, height]);

    return (
        <svg
            width={width}
            height={height}
            className={`overflow-visible ${className}`}
            viewBox={`0 0 ${width} ${height}`}
        >
            {/* Area fill */}
            <path
                d={areaPath}
                className={fillColor}
            />
            {/* Line */}
            <path
                d={path}
                fill="none"
                className={`${color} stroke-[2]`}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            {data.length > 0 && (
                <circle
                    cx={width}
                    cy={height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * height}
                    r="3"
                    className={trend >= 0 ? "fill-success" : "fill-destructive"}
                />
            )}
        </svg>
    );
}
