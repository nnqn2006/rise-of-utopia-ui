import { useState, useMemo } from "react";
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

// Asset Growth Timeline Data (từ 1,250 USDG ban đầu)
const assetGrowthData = [
  { date: "01/01", value: 1250, label: "Bắt đầu" },
  { date: "15/01", value: 1380, label: null },
  { date: "01/02", value: 1520, label: null },
  { date: "15/02", value: 1680, label: "Thu hoạch lớn" },
  { date: "01/03", value: 1850, label: null },
  { date: "15/03", value: 2150, label: null },
  { date: "01/04", value: 2450, label: "Nạp thêm LP" },
  { date: "15/04", value: 2650, label: null },
  { date: "Nay", value: 2850, label: "Hiện tại" },
];

// P/L Timeline Data
const profitHistory = [
  { date: "01/03", pl: 120, event: null },
  { date: "05/03", pl: 280, event: "Thu hoạch GAO" },
  { date: "10/03", pl: 380, event: null },
  { date: "15/03", pl: 560, event: "Stake thêm FRUIT" },
  { date: "20/03", pl: 720, event: null },
  { date: "25/03", pl: 950, event: "Thu hoạch VEG" },
  { date: "30/03", pl: 1200, event: null },
  { date: "05/04", pl: 1450, event: "Compound rewards" },
];

// Capital Allocation Data
const capitalAllocation = [
  { name: "GAO", value: 45, color: "#8b5cf6", amount: "$1,282.50" },
  { name: "FRUIT", value: 25, color: "#ef4444", amount: "$712.50" },
  { name: "VEG", value: 15, color: "#22c55e", amount: "$427.50" },
  { name: "GRAIN", value: 15, color: "#f59e0b", amount: "$427.50" },
];

// Activity History Data
const activityHistory = [
  { id: 1, time: "2024-04-15 14:20", action: "Thu hoạch", pool: "GAO/USDG", sim: 45.5, status: "success" },
  { id: 2, time: "2024-04-14 09:15", action: "Nạp thanh khoản", pool: "FRUIT/USDG", sim: 0, status: "neutral" },
  { id: 3, time: "2024-04-13 16:45", action: "Stake", pool: "VEG/USDG", sim: 0, status: "neutral" },
  { id: 4, time: "2024-04-12 11:30", action: "Thu hoạch", pool: "FRUIT/USDG", sim: 32.2, status: "success" },
  { id: 5, time: "2024-04-10 08:45", action: "Unstake", pool: "GRAIN/USDG", sim: 0, status: "warning" },
  { id: 6, time: "2024-04-08 15:20", action: "Thu hoạch", pool: "GAO/USDG", sim: 126.0, status: "success" },
];

// Badges data
const badges = [
  { id: 1, emoji: "🌾", name: "Bậc thầy nông dân", desc: "Stake GAO nhiều", unlocked: true },
  { id: 2, emoji: "⚖️", name: "Chuyên gia cân bằng Pool", desc: "Nạp thanh khoản đúng lúc", unlocked: true },
  { id: 3, emoji: "💎", name: "HODLer kiên định", desc: "Stake > 30 ngày", unlocked: true },
  { id: 4, emoji: "🔥", name: "Người tiên phong", desc: "Tham gia từ đầu", unlocked: false },
];

const FarmerPortfolio = () => {
  const [timeRange, setTimeRange] = useState("Tháng");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    return activityHistory.filter(h =>
      h.pool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate stats
  const totalSIM = 203.7;
  const avgAPY = 45.5;
  const ilScore = 92; // IL Management score (0-100)

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
                    <p className="text-4xl font-bold gradient-text">$2,850.00</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-success mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12.5% so với tuần trước</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">Vốn ban đầu</p>
                    <p className="text-lg font-bold">$1,250.00</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <p className="text-xs text-muted-foreground">Tổng lợi nhuận</p>
                    <p className="text-lg font-bold text-success">+$1,600.00</p>
                  </div>
                </div>
              </div>

              {/* Asset Growth Timeline Chart */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Biểu đồ Tăng trưởng Tài sản
                  </h3>
                  <Badge className="bg-success/20 text-success border-success/20">
                    +128% từ đầu
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
                <div className="flex items-center gap-2 text-success text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+15.2 SIM tuần này</span>
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
                    <p className="text-3xl font-bold text-success">{avgAPY}%</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Dựa trên 3 Pool đang Stake
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
                    <p className="text-3xl font-bold text-blue-500">{ilScore}/100</p>
                  </div>
                </div>
                <Progress value={ilScore} className="h-2 mb-2" />
                <div className="flex items-center gap-1 text-sm text-success">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>IL thấp - An toàn</span>
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
                      <p className="text-2xl font-bold">Level 5</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">XP</p>
                    <p className="text-sm font-bold">2,450 / 3,000</p>
                  </div>
                </div>
                <Progress value={82} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">Còn 550 XP để lên Level 6</p>
              </div>

              {/* Reputation Score */}
              <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Điểm uy tín</p>
                    <p className="text-2xl font-bold gradient-text">1,850 điểm</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Hạng: <span className="text-primary font-semibold">Nông dân Bạc</span></p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tiến trình lên Vàng</span>
                  <span className="font-bold">1,850 / 2,500</span>
                </div>
                <Progress value={74} className="h-1.5 mt-1" />
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
