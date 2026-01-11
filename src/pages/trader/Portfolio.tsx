import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    TrendingUp,
    TrendingDown,
    History,
    Award,
    BarChart3,
    Wallet,
    Zap,
    ArrowRight,
    AlertTriangle,
    Info,
    ChevronRight,
    Filter,
    Download,
    Search,
    CheckCircle2,
    PieChart as PieIcon,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    ReferenceDot,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    getUserAssets,
    getTraderData,
    getSwapHistory,
    type UserAssets,
    type TraderData,
} from "@/services/gameDataService";

// Mock constant for colors
const COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

// Note: All mock data removed - will be generated dynamically from database

const TraderPortfolio = () => {
    const [timeRange, setTimeRange] = useState("Tháng");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Database data
    const [assets, setAssets] = useState<UserAssets | null>(null);
    const [traderData, setTraderData] = useState<TraderData | null>(null);
    const [swapHistory, setSwapHistory] = useState<any[]>([]);

    // Load data from Supabase
    useEffect(() => {
        const loadData = async () => {
            try {
                const [userAssets, trader, history] = await Promise.all([
                    getUserAssets(),
                    getTraderData(),
                    getSwapHistory(50)
                ]);

                setAssets(userAssets);
                setTraderData(trader);
                setSwapHistory(history || []);
            } catch (error) {
                console.error('Error loading portfolio data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Calculate KPIs from database
    const performanceKPIs = useMemo(() => {
        if (!traderData || !assets) return [];

        const profitSwaps = swapHistory.filter(s => s.profit_loss > 0).length;
        const winRate = swapHistory.length > 0 ? (profitSwaps / swapHistory.length) * 100 : 0;
        const avgSlippage = swapHistory.length > 0
            ? swapHistory.reduce((acc, s) => acc + s.slippage, 0) / swapHistory.length
            : 0;
        const roi = assets.usdg_balance > 0
            ? (traderData.total_profit_loss / 100) * 100
            : 0;

        return [
            { label: "Tổng số giao dịch", value: traderData.total_trades.toString(), sub: "trades", icon: Activity, color: "primary" },
            { label: "Tổng Volume", value: `$${traderData.total_volume.toFixed(2)}`, sub: "USDG", icon: Wallet, color: "blue" },
            { label: "Tỷ lệ thắng (Win Rate)", value: `${winRate.toFixed(1)}%`, sub: `${profitSwaps}/${swapHistory.length} swaps`, icon: Zap, color: "success", status: winRate > 50 ? "good" : "warning" },
            { label: "Slippage trung bình", value: `${avgSlippage.toFixed(2)}%`, sub: avgSlippage < 0.5 ? "Thấp" : "Trung bình", icon: TrendingDown, color: "warning", status: avgSlippage < 1 ? "good" : "warning" },
            { label: "Tổng P/L", value: `${traderData.total_profit_loss >= 0 ? '+' : ''}$${traderData.total_profit_loss.toFixed(2)}`, sub: "Lợi nhuận ròng", icon: TrendingUp, color: traderData.total_profit_loss >= 0 ? "success" : "destructive", status: traderData.total_profit_loss >= 0 ? "good" : "warning" },
            { label: "ROI tổng", value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, sub: "Trên vốn gốc", icon: BarChart3, color: "primary", status: roi >= 0 ? "good" : "warning" },
        ];
    }, [traderData, assets, swapHistory]);

    // Build transaction history from swap history
    const transactionHistory = useMemo(() => {
        return swapHistory.slice(0, 10).map((swap, index) => ({
            id: index + 1,
            time: new Date(swap.created_at).toLocaleString('vi-VN'),
            action: "Swap",
            token: `${swap.from_token} → ${swap.to_token}`,
            amount: swap.from_amount,
            slippage: swap.slippage,
            result: swap.profit_loss,
            status: swap.profit_loss > 0 ? "profit" : swap.profit_loss < 0 ? "loss" : "neutral"
        }));
    }, [swapHistory]);

    // Token distribution from balances
    const tokenDistribution = useMemo(() => {
        if (!traderData?.token_balances) return [];

        const colors = { GAO: "#8b5cf6", FRUIT: "#ef4444", VEG: "#22c55e", GRAIN: "#f59e0b" };
        const total = Object.values(traderData.token_balances).reduce((acc, b) => acc + b.amount, 0);

        return Object.entries(traderData.token_balances)
            .filter(([symbol, balance]) => balance.amount > 0)
            .map(([symbol, balance]) => ({
                name: symbol,
                value: total > 0 ? Math.round((balance.amount / total) * 100) : 0,
                color: colors[symbol as keyof typeof colors] || "#888"
            }));
    }, [traderData]);

    const filteredHistory = useMemo(() => {
        return transactionHistory.filter(h =>
            h.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.action.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, transactionHistory]);

    // Reputation info
    const reputationInfo = useMemo(() => {
        if (!assets) return { points: 1000, level: "Tân thủ", nextLevel: 1500, progress: 0 };

        const points = assets.reputation_points;
        const level = assets.reputation_level;
        const nextLevel = points < 1500 ? 1500 : points < 2500 ? 2500 : 5000;
        const progress = (points / nextLevel) * 100;

        return { points, level, nextLevel, progress };
    }, [assets]);

    // Dynamic profit history from swap history
    const profitHistory = useMemo(() => {
        if (swapHistory.length === 0) {
            return [{ date: "Nay", pl: 0, event: null }];
        }

        let runningPL = 0;
        return swapHistory.slice().reverse().map(swap => {
            runningPL += swap.profit_loss || 0;
            return {
                date: new Date(swap.created_at).toLocaleDateString('vi-VN'),
                pl: runningPL,
                event: null
            };
        }).slice(-7);
    }, [swapHistory]);

    // Active pools - empty for new accounts (traders don't have liquidity pools)
    const activePools: any[] = [];

    if (isLoading) {
        return (
            <DashboardLayout mode="trader">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout mode="trader">
            <div className="space-y-6 pb-12">
                {/* Header & Reputation */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            Danh mục đầu tư
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Phân tích hiệu suất và quản trị rủi ro chuyên nghiệp
                        </p>
                    </div>

                    <Card className="glass-card flex-1 max-w-md border-l-4 border-l-primary">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="font-bold cursor-help flex items-center gap-1">
                                                        {reputationInfo.points.toLocaleString()} Điểm uy tín
                                                        <Info className="w-3 h-3 text-muted-foreground" />
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p className="text-xs">Điểm uy tín được tính dựa trên:</p>
                                                    <ul className="text-[10px] mt-1 list-disc pl-3">
                                                        <li>Tỷ lệ thắng ổn định</li>
                                                        <li>Kiểm soát slippage tốt</li>
                                                        <li>Hạn chế bán tháo sai thời điểm</li>
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <p className="text-xs text-muted-foreground font-medium">🏅 {reputationInfo.level}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Tiến trình lên Vàng</p>
                                    <p className="text-xs font-bold">{reputationInfo.points.toLocaleString()} / {reputationInfo.nextLevel.toLocaleString()}</p>
                                </div>
                            </div>
                            <Progress value={reputationInfo.progress} className="h-2 gradient-primary" />
                        </CardContent>
                    </Card>
                </div>

                {/* 1. Performance KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {performanceKPIs.map((kpi, i) => (
                        <Card key={i} className={`glass-card group hover:border-${kpi.color}/50 transition-all border-b-2 border-b-${kpi.color}`}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 bg-${kpi.color}/10 rounded-lg text-${kpi.color}`}>
                                        <kpi.icon className="w-4 h-4" />
                                    </div>
                                    {kpi.status === "good" && <ArrowUpRight className="w-3 h-3 text-success" />}
                                    {kpi.status === "warning" && <AlertTriangle className="w-3 h-3 text-warning" />}
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                                <h3 className="text-xl font-bold mt-1">{kpi.value}</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 2. Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main P/L Chart */}
                    <Card className="lg:col-span-2 glass-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Biểu đồ lợi nhuận (P/L Timeline)</CardTitle>
                                <CardDescription>Theo dõi tăng trưởng tài sản theo thời gian</CardDescription>
                            </div>
                            <div className="flex bg-muted/30 p-1 rounded-lg">
                                {["Ngày", "Tuần", "Tháng"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setTimeRange(r)}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${timeRange === r ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={profitHistory}>
                                        <defs>
                                            <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `$${v}`}
                                        />
                                        <RechartsTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="glass-card p-3 border-primary/30 shadow-2xl">
                                                            <p className="text-xs font-bold mb-1">{data.date}</p>
                                                            <p className="text-lg font-bold text-success mb-1">+${data.pl}</p>
                                                            {data.event && (
                                                                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
                                                                    <Badge className="bg-warning/20 text-warning border-warning/20 text-[9px]">Sự kiện</Badge>
                                                                    <span className="text-[10px] text-muted-foreground">{data.event}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pl"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPL)"
                                        />
                                        {profitHistory.filter(d => d.event).map((d, i) => (
                                            <ReferenceDot
                                                key={i}
                                                x={d.date}
                                                y={d.pl}
                                                r={4}
                                                fill="#f59e0b"
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Side Distribution & Alerts */}
                    <div className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <PieIcon className="w-4 h-4 text-success" /> Tỷ lệ Thắng/Thua (Win/Loss)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {swapHistory.length > 0 ? (
                                    <div className="h-[180px] w-full mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={(() => {
                                                        const wins = swapHistory.filter(s => s.profit_loss > 0).length;
                                                        const losses = swapHistory.filter(s => s.profit_loss < 0).length;
                                                        const total = wins + losses || 1;
                                                        return [
                                                            { name: "Thắng (Wins)", value: (wins / total) * 100 },
                                                            { name: "Thua (Losses)", value: (losses / total) * 100 },
                                                        ];
                                                    })()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {[0, 1].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                                                    ))}
                                                </Pie>
                                                <Legend
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    iconType="circle"
                                                    formatter={(v) => <span className="text-[10px] uppercase font-bold text-muted-foreground">{v}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[180px] w-full mt-2 flex items-center justify-center">
                                        <p className="text-sm text-muted-foreground text-center">
                                            Chưa có giao dịch nào.<br />
                                            <span className="text-xs">Thực hiện swap để xem thống kê.</span>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass-card bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" /> Gợi ý từ hệ thống AI
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {swapHistory.length > 0 ? (
                                    <>
                                        <div className="flex gap-3 items-start">
                                            <div className="p-1.5 rounded bg-primary/20 text-primary">
                                                <Info className="w-3 h-3" />
                                            </div>
                                            <p className="text-[11px] leading-relaxed">
                                                Bạn đã thực hiện <span className="text-primary font-bold">{traderData?.total_trades || 0}</span> giao dịch với volume <span className="text-primary font-bold">${(traderData?.total_volume || 0).toFixed(2)}</span>.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <div className="p-1.5 rounded bg-success/20 text-success">
                                                <TrendingUp className="w-3 h-3" />
                                            </div>
                                            <p className="text-[11px] leading-relaxed">
                                                Tổng P/L: <span className={`font-bold ${(traderData?.total_profit_loss || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>${(traderData?.total_profit_loss || 0).toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex gap-3 items-start">
                                        <div className="p-1.5 rounded bg-primary/20 text-primary">
                                            <Info className="w-3 h-3" />
                                        </div>
                                        <p className="text-[11px] leading-relaxed">
                                            Chào mừng bạn! Hãy bắt đầu giao dịch để nhận <span className="text-primary font-bold">gợi ý từ AI</span>.
                                        </p>
                                    </div>
                                )}
                                <Button variant="link" size="sm" className="w-full text-xs text-primary font-bold p-0">
                                    Xem tất cả gợi ý <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 3. Active Pools Section */}
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Hồ thanh khoản (Active Pools)</CardTitle>
                                <CardDescription>Các vị thế yield farming đang tham gia</CardDescription>
                            </div>
                            {activePools.length > 0 ? (
                                <Badge className="bg-success/20 text-success border-success/20">
                                    Lợi nhuận ổn định
                                </Badge>
                            ) : (
                                <Badge className="bg-muted/20 text-muted-foreground border-muted/20">
                                    Chưa có vị thế
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activePools.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pool</TableHead>
                                        <TableHead>Giá trị hiện tại</TableHead>
                                        <TableHead>Reward dự kiến</TableHead>
                                        <TableHead>Lệch token</TableHead>
                                        <TableHead>Rủi ro</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activePools.map((pool) => (
                                        <TableRow key={pool.pool} className="group hover:bg-muted/30">
                                            <TableCell className="font-bold">{pool.pool}</TableCell>
                                            <TableCell>${pool.value.toLocaleString()}</TableCell>
                                            <TableCell className="text-success font-medium">+${pool.reward}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={pool.divergence} className="h-1.5 w-16" />
                                                    <span className="text-[10px] font-bold">{pool.divergence}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {pool.risk === "high" ? (
                                                    <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Cao
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-success border-success/30 bg-success/5 gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Thấp
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                                            Chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg glass-card border-primary/20">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl">Chi tiết Pool {pool.pool}</DialogTitle>
                                                            <DialogDescription>Phân tích hiệu suất staking</DialogDescription>
                                                        </DialogHeader>

                                                        <div className="grid grid-cols-2 gap-4 my-4">
                                                            <Card className="bg-muted/30">
                                                                <CardContent className="p-4 text-center">
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Impermanent Loss</p>
                                                                    <p className="text-lg font-bold text-destructive">-{pool.ilEstimate}%</p>
                                                                </CardContent>
                                                            </Card>
                                                            <Card className="bg-muted/30">
                                                                <CardContent className="p-4 text-center">
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Reward thu được</p>
                                                                    <p className="text-lg font-bold text-success">+${pool.reward.toFixed(2)}</p>
                                                                </CardContent>
                                                            </Card>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">Tỷ lệ thanh khoản:</span>
                                                                <span className="font-bold">{pool.ratio}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">Tổng thanh khoản:</span>
                                                                <span className="font-bold">${pool.liquidity.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        <DialogFooter className="mt-6 flex gap-2">
                                                            <Button variant="outline" className="flex-1">Rút thanh khoản</Button>
                                                            <Button className="flex-1 gradient-primary">Tái cân bằng (Rebalance)</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                <p className="text-sm">Chưa tham gia hồ thanh khoản nào.</p>
                                <p className="text-xs mt-1">Đây là tính năng dành cho Farmer.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Transaction History Section */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Lịch sử giao dịch chi tiết</CardTitle>
                                <CardDescription>Xem lại tất cả các lệnh swap và staking</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm theo token..."
                                        className="pl-8 w-[200px]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4 mr-2" /> Bộ lọc
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" /> Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="pl-6">Thời gian</TableHead>
                                    <TableHead>Hành động</TableHead>
                                    <TableHead>Token / Pool</TableHead>
                                    <TableHead>Số lượng</TableHead>
                                    <TableHead>Slippage</TableHead>
                                    <TableHead>Kết quả (P/L)</TableHead>
                                    <TableHead className="text-right pr-6">Chi tiết</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHistory.map((h) => (
                                    <TableRow key={h.id} className="group cursor-pointer hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 text-xs text-muted-foreground">{h.time}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={h.action === "Swap" ? "bg-primary/5 text-primary border-primary/20" : "bg-secondary/5 text-secondary border-secondary/20"}>
                                                {h.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-sm tracking-tight">{h.token}</TableCell>
                                        <TableCell className="text-sm font-medium">{h.amount} đơn vị</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-bold ${h.slippage > 1 ? "text-destructive" : h.slippage > 0.5 ? "text-warning" : "text-muted-foreground"}`}>
                                                {h.slippage}%
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {h.status !== "neutral" ? (
                                                <div className={`flex items-center gap-1 font-bold text-sm ${h.status === "profit" ? "text-success" : "text-destructive"}`}>
                                                    {h.status === "profit" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    {h.status === "profit" ? "+" : ""}${h.result}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-muted-foreground group-hover:text-primary transition-colors">
                                            <ChevronRight className="w-4 h-4 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default TraderPortfolio;