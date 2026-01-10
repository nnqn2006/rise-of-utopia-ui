import { useState, useMemo } from "react";
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

// Mock constant for colors
const COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

// 1. Performance KPI Data
const performanceKPIs = [
  { label: "Tổng số giao dịch", value: "248", sub: "trades", icon: Activity, color: "primary" },
  { label: "Tổng Volume", value: "$48,250", sub: "USDG", icon: Wallet, color: "blue" },
  { label: "Tỷ lệ thắng (Win Rate)", value: "62.4%", sub: "+2.1% từ tuần trước", icon: Zap, color: "success", status: "good" },
  { label: "Slippage trung bình", value: "0.42%", sub: "Thấp hơn 0.1% TB", icon: TrendingDown, color: "warning", status: "medium" },
  { label: "Tổng P/L", value: "+$1,356", sub: "Lợi nhuận ròng", icon: TrendingUp, color: "success", status: "good" },
  { label: "ROI tổng", value: "+18.6%", sub: "Trên vốn gốc", icon: BarChart3, color: "primary", status: "good" },
];

// 2. Profit/Loss Timeline Data
const profitHistory = [
  { date: "01/03", pl: 120, event: null },
  { date: "05/03", pl: 340, event: "Dịch bệnh (GAO ↑)" },
  { date: "10/03", pl: 280, event: null },
  { date: "15/03", pl: 560, event: "Thiên tai (FRUIT ↑)" },
  { date: "20/03", pl: 490, event: null },
  { date: "25/03", pl: 850, event: "Chính sách mới" },
  { date: "30/03", pl: 1356, event: null },
];

// 3. Distribution Data
const tokenDistribution = [
  { name: "GAO", value: 45, color: "#8b5cf6" },
  { name: "FRUIT", value: 25, color: "#ef4444" },
  { name: "VEG", value: 15, color: "#22c55e" },
  { name: "GRAIN", value: 15, color: "#f59e0b" },
];

// 4. Active Pools Data
const activePools = [
  {
    pool: "GAO / USDG",
    value: 1200,
    reward: 85,
    divergence: 12,
    risk: "high",
    ratio: "44:56",
    liquidity: 125000,
    ilEstimate: 1.2,
  },
  {
    pool: "FRUIT / USDG",
    value: 850,
    reward: 40,
    divergence: 4,
    risk: "safe",
    ratio: "50:50",
    liquidity: 98000,
    ilEstimate: 0.15,
  },
];

// 5. Transaction History Data
const transactionHistory = [
  { id: 1, time: "2024-03-12 14:20", action: "Swap", token: "USDG → GAO", amount: 100, slippage: 0.3, result: 8.5, status: "profit" },
  { id: 2, time: "2024-03-13 09:15", action: "Swap", token: "GAO → USDG", amount: 80, slippage: 0.7, result: -4.2, status: "loss" },
  { id: 3, time: "2024-03-14 16:45", action: "Stake", token: "GAO/USDG", amount: 200, slippage: 0.1, result: 0, status: "neutral" },
  { id: 4, time: "2024-03-15 11:30", action: "Swap", token: "USDG → FRT", amount: 150, slippage: 1.2, result: 15.0, status: "profit" },
];

const TraderPortfolio = () => {
  const [timeRange, setTimeRange] = useState("Tháng");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    return transactionHistory.filter(h =>
      h.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
                            2,150 Điểm uy tín
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
                    <p className="text-xs text-muted-foreground font-medium">🏅 Thương nhân Bạc</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Tiến trình lên Vàng</p>
                  <p className="text-xs font-bold">2,150 / 3,000</p>
                </div>
              </div>
              <Progress value={72} className="h-2 gradient-primary" />
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
                <div className="h-[180px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Thắng (Wins)", value: 62.4, color: "hsl(var(--success))" },
                          { name: "Thua (Losses)", value: 37.6, color: "hsl(var(--destructive))" },
                        ]}
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
              </CardContent>
            </Card>

            <Card className="glass-card bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Gợi ý từ hệ thống AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="p-1.5 rounded bg-primary/20 text-primary">
                    <Info className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Bạn đang giao dịch tốt với <span className="text-primary font-bold">GAO</span>, hãy tiếp tục tối ưu lợi nhuận tại đây.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="p-1.5 rounded bg-warning/20 text-warning">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Slippage của bạn đang tăng nhẹ. Hãy <span className="text-warning font-bold">giảm khối lượng mỗi lệnh</span> để kiểm soát tốt hơn.
                  </p>
                </div>
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
              <Badge className="bg-success/20 text-success border-success/20">
                Lợi nhuận ổn định
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
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
