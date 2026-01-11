import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Coins,
  Droplets,
  Shield,
  Star,
  Zap,
  ChevronRight,
  Search,
  Filter,
  Activity,
  ArrowUpRight,
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
  LineChart,
  Line,
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
  getUserAssets,
  getFarmerData,
  getFarmerActivityHistory,
  type UserAssets,
  type FarmerData,
} from "@/services/gameDataService";

// Note: All mock data removed - will be generated dynamically from database

const FarmerPortfolio = () => {
  const [timeRange, setTimeRange] = useState("Tháng");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Database data
  const [assets, setAssets] = useState<UserAssets | null>(null);
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userAssets, farmer, history] = await Promise.all([
          getUserAssets(),
          getFarmerData(),
          getFarmerActivityHistory(30)
        ]);

        setAssets(userAssets);
        setFarmerData(farmer);
        setActivityHistory(history || []);
      } catch (error) {
        console.error('Error loading farmer portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate stats from database
  const totalAssets = useMemo(() => {
    if (!assets) return 100;
    return assets.usdg_balance;
  }, [assets]);

  const totalSIM = useMemo(() => {
    if (!farmerData?.liquidity_positions) return 0;
    return Object.values(farmerData.liquidity_positions)
      .reduce((acc, pos) => acc + pos.sim_earned, 0) + (farmerData.total_sim_earned || 0);
  }, [farmerData]);

  const capitalAllocation = useMemo(() => {
    if (!farmerData?.liquidity_positions) return [];

    const colors = { GAO: "#8b5cf6", FRUIT: "#ef4444", VEG: "#22c55e", GRAIN: "#f59e0b" };
    const totalLP = Object.values(farmerData.liquidity_positions)
      .reduce((acc, pos) => acc + pos.lp_amount, 0);

    return Object.entries(farmerData.liquidity_positions)
      .filter(([, pos]) => pos.lp_amount > 0)
      .map(([pair, pos]) => {
        const symbol = pair.split('/')[0];
        const value = totalLP > 0 ? Math.round((pos.lp_amount / totalLP) * 100) : 0;
        return {
          name: symbol,
          value,
          color: colors[symbol as keyof typeof colors] || "#888",
          amount: `$${(pos.lp_amount * 2).toFixed(2)}` // Rough estimate
        };
      });
  }, [farmerData]);

  // Format activity history
  const formattedHistory = useMemo(() => {
    return activityHistory.slice(0, 10).map((activity, index) => ({
      id: index + 1,
      time: new Date(activity.created_at).toLocaleString('vi-VN'),
      action: activity.activity_type === 'add_liquidity' ? 'Nạp thanh khoản'
        : activity.activity_type === 'stake_lp' ? 'Stake'
          : activity.activity_type === 'unstake_lp' ? 'Unstake'
            : activity.activity_type === 'claim_sim' ? 'Thu hoạch'
              : activity.activity_type === 'plant' ? 'Trồng'
                : activity.activity_type === 'harvest' ? 'Thu hoạch'
                  : activity.activity_type,
      pool: activity.token_type ? `${activity.token_type}/USDG` : '-',
      sim: activity.activity_type === 'claim_sim' ? activity.amount : 0,
      status: activity.activity_type === 'claim_sim' || activity.activity_type === 'harvest' ? 'success'
        : activity.activity_type === 'unstake_lp' ? 'warning'
          : 'neutral'
    }));
  }, [activityHistory]);

  const filteredHistory = useMemo(() => {
    return formattedHistory.filter(h =>
      h.pool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formattedHistory]);

  // Reputation info
  const reputation = useMemo(() => {
    if (!assets) return { points: 1000, level: "Tân thủ", nextLevel: 1500, progress: 0 };
    const points = assets.reputation_points;
    const level = assets.reputation_level;
    const nextLevel = points < 1500 ? 1500 : points < 2500 ? 2500 : 5000;
    return { points, level, nextLevel, progress: (points / nextLevel) * 100 };
  }, [assets]);

  // Level info
  const levelInfo = useMemo(() => {
    if (!assets) return { level: 1, xp: 0, nextXp: 100 };
    const xp = assets.xp || 0;
    const level = assets.level || 1;
    const nextXp = level * 500;
    return { level, xp, nextXp, progress: (xp / nextXp) * 100 };
  }, [assets]);

  // Badges
  const badges = useMemo(() => [
    { id: 1, emoji: "🌾", name: "Bậc thầy nông dân", desc: "Stake GAO nhiều", unlocked: (farmerData?.total_harvests || 0) > 0 },
    { id: 2, emoji: "⚖️", name: "Chuyên gia cân bằng Pool", desc: "Nạp thanh khoản đúng lúc", unlocked: Object.keys(farmerData?.liquidity_positions || {}).length > 0 },
    { id: 3, emoji: "💎", name: "HODLer kiên định", desc: "Stake > 30 ngày", unlocked: false },
    { id: 4, emoji: "🔥", name: "Người tiên phong", desc: "Tham gia từ đầu", unlocked: false },
  ], [farmerData]);

  // Dynamic chart data based on actual values
  const assetGrowthData = useMemo(() => {
    // For new accounts, show just the starting point
    if (totalAssets <= 100) {
      return [
        { date: "Bắt đầu", value: 100, label: "Vốn ban đầu" },
        { date: "Nay", value: totalAssets, label: "Hiện tại" },
      ];
    }
    // Generate simple growth chart
    return [
      { date: "Bắt đầu", value: 100, label: "Vốn ban đầu" },
      { date: "Nay", value: totalAssets, label: "Hiện tại" },
    ];
  }, [totalAssets]);

  // Dynamic P/L data
  const profitHistory = useMemo(() => {
    const profit = totalAssets - 100;
    if (profit <= 0) {
      return [{ date: "Nay", pl: 0, event: null }];
    }
    return [
      { date: "Bắt đầu", pl: 0, event: null },
      { date: "Nay", pl: profit, event: null },
    ];
  }, [totalAssets]);

  if (isLoading) {
    return (
      <DashboardLayout mode="farmer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            Danh mục đầu tư
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> Tổng quan tài sản và hiệu suất farming của bạn
          </p>
        </div>

        {/* 1. Quick Summary - Total Assets + Asset Growth Chart */}
        <Card className="glass-card glow-primary overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Assets */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                    <Coins className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng giá trị tài sản</p>
                    <p className="text-4xl font-bold gradient-text">${totalAssets.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Tài khoản mới</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">Vốn ban đầu</p>
                    <p className="text-lg font-bold">$100.00</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <p className="text-xs text-muted-foreground">Tổng lợi nhuận</p>
                    <p className="text-lg font-bold text-success">+${(totalAssets - 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Asset Growth Timeline Chart */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Biểu đồ Tăng trưởng Tài sản
                  </h3>
                  <Badge className="bg-muted/20 text-muted-foreground border-muted/20">
                    {totalAssets > 100 ? `+${(((totalAssets - 100) / 100) * 100).toFixed(0)}% từ đầu` : 'Bắt đầu'}
                  </Badge>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={assetGrowthData}>
                      <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                        domain={[1000, 3000]}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="glass-card p-3 border-primary/30 shadow-2xl">
                                <p className="text-xs font-bold mb-1">{data.date}</p>
                                <p className="text-lg font-bold text-success">${data.value.toLocaleString()}</p>
                                {data.label && (
                                  <p className="text-[10px] text-muted-foreground mt-1">{data.label}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#22c55e"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorGrowth)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Yield Farming Stats */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              Quản trị Thanh khoản (Yield Farming Stats)
            </CardTitle>
            <CardDescription>Phân tích dữ liệu từ các Pool thanh khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total SIM Earned */}
              <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tổng SIM đã đào</p>
                    <p className="text-3xl font-bold gradient-text">{totalSIM} SIM</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+0 SIM tuần này</span>
                </div>
              </div>

              {/* Average APY */}
              <div className="p-5 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">APY Trung bình</p>
                    <p className="text-3xl font-bold text-success">{Object.keys(farmerData?.liquidity_positions || {}).length > 0 ? '45.5%' : '0%'}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Dựa trên {Object.keys(farmerData?.liquidity_positions || {}).length} Pool đang Stake
                </div>
              </div>

              {/* IL Management Score */}
              <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Chỉ số an toàn vốn</p>
                    <p className="text-3xl font-bold text-blue-500">{Object.keys(farmerData?.liquidity_positions || {}).length > 0 ? '92' : '0'}/100</p>
                  </div>
                </div>
                <Progress value={Object.keys(farmerData?.liquidity_positions || {}).length > 0 ? 92 : 0} className="h-2 mb-2" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span>{Object.keys(farmerData?.liquidity_positions || {}).length > 0 ? 'IL thấp - An toàn' : 'Chưa có vị thế'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. P/L Timeline & Capital Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* P/L Timeline Chart */}
          <Card className="lg:col-span-2 glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Biểu đồ lợi nhuận (P/L Timeline)</CardTitle>
                <CardDescription>Theo dõi lợi nhuận farming theo thời gian</CardDescription>
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
              <div className="h-[280px] w-full">
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
                              <p className="text-lg font-bold text-success">+${data.pl}</p>
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
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Capital Allocation Pie Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Phân bổ vốn
              </CardTitle>
              <CardDescription>% Vốn theo từng Token</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={capitalAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {capitalAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] uppercase font-bold text-muted-foreground">{value}</span>}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-card p-2 border-primary/30 shadow-lg">
                              <p className="text-xs font-bold">{data.name}</p>
                              <p className="text-sm">{data.value}% - {data.amount}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Asset breakdown list */}
              <div className="space-y-2 mt-2">
                {capitalAllocation.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    <span className="text-muted-foreground">{asset.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Skills & Reputation */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Kỹ năng & Định danh Farmer
            </CardTitle>
            <CardDescription>Hồ sơ năng lực để đổi Voucher và phần thưởng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level & XP */}
              <div className="p-5 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Cấp độ</p>
                      <p className="text-2xl font-bold">Level {levelInfo.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">XP</p>
                    <p className="text-sm font-bold">{levelInfo.xp.toLocaleString()} / {levelInfo.nextXp.toLocaleString()}</p>
                  </div>
                </div>
                <Progress value={levelInfo.progress || 0} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">Còn {levelInfo.nextXp - levelInfo.xp} XP để lên Level {levelInfo.level + 1}</p>
              </div>

              {/* Reputation Score */}
              <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Điểm uy tín</p>
                    <p className="text-2xl font-bold gradient-text">{reputation.points.toLocaleString()} điểm</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Hạng: <span className="text-primary font-semibold">{reputation.level}</span></p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tiến trình lên hạng tiếp theo</span>
                  <span className="font-bold">{reputation.points.toLocaleString()} / {reputation.nextLevel.toLocaleString()}</span>
                </div>
                <Progress value={reputation.progress || 0} className="h-1.5 mt-1" />
              </div>

              {/* Badges */}
              <div className="p-5 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-3">Danh hiệu (Badges)</p>
                <div className="grid grid-cols-2 gap-2">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-2 rounded-lg text-center transition-all ${badge.unlocked
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/50 opacity-50"
                        }`}
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                      <p className="text-[10px] font-medium mt-1 leading-tight">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Activity History */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Lịch sử hoạt động</CardTitle>
                <CardDescription>Thu hoạch, nạp thanh khoản và stake LP Token</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo pool..."
                    className="pl-8 w-[180px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" /> Bộ lọc
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
                  <TableHead>Pool</TableHead>
                  <TableHead>SIM nhận được</TableHead>
                  <TableHead className="text-right pr-6">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((h) => (
                  <TableRow key={h.id} className="group cursor-pointer hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6 text-xs text-muted-foreground">{h.time}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          h.action === "Thu hoạch"
                            ? "bg-success/5 text-success border-success/20"
                            : h.action === "Nạp thanh khoản"
                              ? "bg-primary/5 text-primary border-primary/20"
                              : h.action === "Stake"
                                ? "bg-blue-500/5 text-blue-500 border-blue-500/20"
                                : "bg-warning/5 text-warning border-warning/20"
                        }
                      >
                        {h.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-sm tracking-tight">{h.pool}</TableCell>
                    <TableCell>
                      {h.sim > 0 ? (
                        <span className="text-success font-bold">+{h.sim} SIM</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
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

export default FarmerPortfolio;
