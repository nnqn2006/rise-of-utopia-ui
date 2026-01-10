import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Info } from "lucide-react";

interface ILHeatmapProps {
    entryPrice: number;
    currentPrice: number;
    className?: string;
}

export function ILHeatmap({
    entryPrice,
    currentPrice,
    className = ""
}: ILHeatmapProps) {
    const { ilPercentage, riskLevel, hue } = useMemo(() => {
        // Impermanent Loss calculation
        const priceRatio = currentPrice / entryPrice;
        const sqrtRatio = Math.sqrt(priceRatio);
        const il = 2 * sqrtRatio / (1 + priceRatio) - 1;
        const ilPercent = Math.abs(il * 100);

        // Determine risk level and color
        let level: string;
        let colorHue: number; // 120 = green, 60 = yellow, 0 = red

        if (ilPercent <= 2) {
            level = "An toàn";
            colorHue = 120; // Green
        } else if (ilPercent <= 5) {
            level = "Thấp";
            colorHue = 90;
        } else if (ilPercent <= 10) {
            level = "Trung bình";
            colorHue = 60; // Yellow
        } else if (ilPercent <= 20) {
            level = "Cao";
            colorHue = 30;
        } else {
            level = "Rất cao";
            colorHue = 0; // Red
        }

        return {
            ilPercentage: ilPercent,
            riskLevel: level,
            hue: colorHue
        };
    }, [entryPrice, currentPrice]);

    const priceChange = ((currentPrice - entryPrice) / entryPrice * 100).toFixed(1);
    const isPositive = currentPrice >= entryPrice;

    return (
        <Card className={`glass-card ${className}`}>
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="text-base">🔥</span>
                        Tổn thất tạm thời
                    </span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                                <p className="text-xs">
                                    Impermanent Loss (IL) là sự chênh lệch giữa giá trị khi nạp vào pool
                                    và giá trị khi rút ra. Màu càng đỏ = tổn thất càng lớn so với việc
                                    chỉ giữ token.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
                <div className="flex items-center gap-4">
                    {/* Circular Heatmap */}
                    <div className="relative">
                        <svg width="64" height="64" viewBox="0 0 64 64">
                            {/* Background circle */}
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="hsl(var(--muted))"
                                strokeWidth="6"
                            />
                            {/* Colored arc based on IL */}
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke={`hsl(${hue}, 70%, 50%)`}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${Math.min(ilPercentage * 5, 176)} 176`}
                                transform="rotate(-90 32 32)"
                                style={{ transition: "stroke-dasharray 0.5s ease" }}
                            />
                            {/* Center fill */}
                            <circle
                                cx="32"
                                cy="32"
                                r="20"
                                fill={`hsl(${hue}, 70%, 50%, 0.15)`}
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                className="text-sm font-bold"
                                style={{ color: `hsl(${hue}, 70%, 50%)` }}
                            >
                                {ilPercentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            {ilPercentage > 10 && (
                                <AlertTriangle className="w-4 h-4 text-warning" />
                            )}
                            <span
                                className="text-sm font-semibold"
                                style={{ color: `hsl(${hue}, 70%, 50%)` }}
                            >
                                {riskLevel}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>Giá vào: ${entryPrice.toFixed(2)}</p>
                            <p>Giá hiện tại: ${currentPrice.toFixed(2)}
                                <span className={isPositive ? "text-success ml-1" : "text-destructive ml-1"}>
                                    ({isPositive ? "+" : ""}{priceChange}%)
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
