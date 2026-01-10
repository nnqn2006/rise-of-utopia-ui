import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NFTBadgeProps {
    reputationScore: number;
    farmerName?: string;
    className?: string;
}

interface BadgeLevel {
    name: string;
    emoji: string;
    gradient: string;
    borderColor: string;
    minScore: number;
}

const BADGE_LEVELS: BadgeLevel[] = [
    {
        name: "Nông dân mới",
        emoji: "🌱",
        gradient: "from-green-400 to-green-600",
        borderColor: "border-green-500",
        minScore: 0
    },
    {
        name: "Nông dân chăm chỉ",
        emoji: "🌾",
        gradient: "from-yellow-400 to-orange-500",
        borderColor: "border-yellow-500",
        minScore: 501
    },
    {
        name: "Nông dân thành đạt",
        emoji: "🏆",
        gradient: "from-blue-400 to-purple-600",
        borderColor: "border-blue-500",
        minScore: 1001
    },
    {
        name: "Nông dân huyền thoại",
        emoji: "👑",
        gradient: "from-purple-500 via-pink-500 to-red-500",
        borderColor: "border-purple-500",
        minScore: 2001
    },
];

export function NFTBadge({
    reputationScore,
    farmerName = "Farmer",
    className = ""
}: NFTBadgeProps) {
    const currentLevel = useMemo(() => {
        for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
            if (reputationScore >= BADGE_LEVELS[i].minScore) {
                return BADGE_LEVELS[i];
            }
        }
        return BADGE_LEVELS[0];
    }, [reputationScore]);

    const nextLevel = useMemo(() => {
        const currentIndex = BADGE_LEVELS.findIndex(l => l.name === currentLevel.name);
        return currentIndex < BADGE_LEVELS.length - 1 ? BADGE_LEVELS[currentIndex + 1] : null;
    }, [currentLevel]);

    const progressToNext = useMemo(() => {
        if (!nextLevel) return 100;
        const currentMin = currentLevel.minScore;
        const nextMin = nextLevel.minScore;
        return Math.min(100, ((reputationScore - currentMin) / (nextMin - currentMin)) * 100);
    }, [reputationScore, currentLevel, nextLevel]);

    return (
        <Card className={`glass-card overflow-hidden ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {/* NFT Avatar */}
                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${currentLevel.gradient} flex items-center justify-center text-2xl shadow-lg ${currentLevel.borderColor} border-2`}>
                        <span className="drop-shadow-lg">{currentLevel.emoji}</span>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center text-xs font-bold border border-border">
                            {BADGE_LEVELS.findIndex(l => l.name === currentLevel.name) + 1}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                                NFT
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate">
                                #{Math.floor(reputationScore * 7).toString(16).toUpperCase().padStart(6, '0')}
                            </span>
                        </div>
                        <p className="font-semibold text-sm text-foreground truncate">
                            {currentLevel.name}
                        </p>
                        {nextLevel && (
                            <div className="mt-1">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${currentLevel.gradient} transition-all duration-500`}
                                        style={{ width: `${progressToNext}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {reputationScore} / {nextLevel.minScore} điểm
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
