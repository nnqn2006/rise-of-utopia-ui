import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PoolSkewIndicatorProps {
    tokenA: {
        symbol: string;
        amount: number;
        emoji?: string;
    };
    tokenB: {
        symbol: string;
        amount: number;
        emoji?: string;
    };
    className?: string;
}

export function PoolSkewIndicator({
    tokenA,
    tokenB,
    className = ""
}: PoolSkewIndicatorProps) {
    const { ratio, skewLevel, skewColor } = useMemo(() => {
        const total = tokenA.amount + tokenB.amount;
        if (total === 0) return { ratio: 50, skewLevel: "balanced", skewColor: "bg-success" };

        const ratioA = (tokenA.amount / total) * 100;
        const deviation = Math.abs(ratioA - 50);

        let level: string;
        let color: string;

        if (deviation <= 10) {
            level = "Cân bằng";
            color = "bg-success";
        } else if (deviation <= 25) {
            level = "Lệch nhẹ";
            color = "bg-warning";
        } else {
            level = "Lệch nhiều";
            color = "bg-destructive";
        }

        return { ratio: ratioA, skewLevel: level, skewColor: color };
    }, [tokenA.amount, tokenB.amount]);

    const SkewIcon = ratio > 55 ? TrendingUp : ratio < 45 ? TrendingDown : Minus;

    return (
        <Card className={`glass-card ${className}`}>
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="text-base">⚖️</span>
                        Tỷ lệ Pool
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${skewColor} text-white`}>
                        {skewLevel}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
                {/* Token labels */}
                <div className="flex justify-between text-xs mb-2">
                    <span className="flex items-center gap-1">
                        <span>{tokenA.emoji || "🪙"}</span>
                        <span className="font-medium">{tokenA.symbol}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="font-medium">{tokenB.symbol}</span>
                        <span>{tokenB.emoji || "💵"}</span>
                    </span>
                </div>

                {/* Slider bar */}
                <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-success via-warning to-destructive opacity-30" />

                    {/* Token A portion */}
                    <div
                        className={`absolute left-0 top-0 h-full ${skewColor} transition-all duration-500 rounded-l-full`}
                        style={{ width: `${ratio}%` }}
                    />

                    {/* Center marker */}
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-foreground/30 -translate-x-1/2" />

                    {/* Pointer */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background shadow-lg transition-all duration-500"
                        style={{ left: `calc(${ratio}% - 6px)` }}
                    />
                </div>

                {/* Percentages */}
                <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                    <span className="font-mono">{ratio.toFixed(1)}%</span>
                    <span className="flex items-center gap-1">
                        <SkewIcon className="w-3 h-3" />
                    </span>
                    <span className="font-mono">{(100 - ratio).toFixed(1)}%</span>
                </div>
            </CardContent>
        </Card>
    );
}
