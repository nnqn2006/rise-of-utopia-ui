import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  Newspaper,
  Wallet,
  Award,
  Package,
  AlertTriangle,
  ArrowRight,
  Info,
  Zap,
  CloudRain,
  Bug,
  Calculator,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Price data for all 4 tokens
const priceData = [
  { time: "09:00", GAO: 3.2, FRUIT: 4.1, VEG: 2.3, GRAIN: 1.9, volume: 12000 },
  { time: "10:00", GAO: 3.4, FRUIT: 4.0, VEG: 2.25, GRAIN: 1.85, volume: 15000 },
  { time: "11:00", GAO: 3.3, FRUIT: 4.3, VEG: 2.2, GRAIN: 1.82, volume: 18000 },
  { time: "12:00", GAO: 3.6, FRUIT: 4.2, VEG: 2.18, GRAIN: 1.88, volume: 22000 },
  { time: "13:00", GAO: 3.5, FRUIT: 4.5, VEG: 2.15, GRAIN: 1.85, volume: 19000 },
  { time: "14:00", GAO: 3.8, FRUIT: 4.4, VEG: 2.12, GRAIN: 1.83, volume: 25000 },
  { time: "15:00", GAO: 3.7, FRUIT: 4.6, VEG: 2.15, GRAIN: 1.85, volume: 28000 },
];

// Token data with pool liquidity
const tokens = [
  {
    symbol: "GAO",
    name: "Gạo Token",
    price: 3.72,
    change: 5.2,
    positive: true,
    poolLiquidity: 125000,
    poolRatio: "48:52",
    image: "/tokens/gao_new.png",
    color: "#8b5cf6"
  },
  {
    symbol: "FRUIT",
    name: "Trái cây Token",
    price: 4.58,
    change: 3.8,
    positive: true,
    poolLiquidity: 98000,
    poolRatio: "50:50",
    image: "/tokens/fruit.png",
    color: "#ef4444"
  },
  {
    symbol: "VEG",
    name: "Rau củ Token",
    price: 2.15,
    change: -1.2,
    positive: false,
    poolLiquidity: 45000,
    poolRatio: "35:65",
    image: "/tokens/veg.png",
    color: "#22c55e"
  },
  {
    symbol: "GRAIN",
    name: "Ngũ cốc Token",
    price: 1.85,
    change: 0.5,
    positive: true,
    poolLiquidity: 67000,
    poolRatio: "52:48",
    image: "/tokens/grain.png",
    color: "#f59e0b"
  },
];

// All news/events from Excel - will rotate every 5 minutes
const allNewsEvents = [
  { id: 1, type: "Thị trường", product: "GAO", content: "Giá GAO tăng 5% do nhu cầu xuất khẩu tăng", difficulty: "Dễ", action: "Theo dõi pool GAO, cân nhắc swap" },
  { id: 2, type: "Sự kiện", product: "FRUIT", content: "Dịch bệnh làm giảm nguồn cung FRUIT", difficulty: "Trung bình", action: "Xem xét swap FRUIT để tận dụng nhu cầu tăng" },
  { id: 3, type: "Thị trường", product: "VEG", content: "Giá VEG giảm 3% do lượng hàng tồn kho cao", difficulty: "Dễ", action: "Không mua vào ngay, quan sát trend" },
  { id: 4, type: "Pool", product: "GRAIN", content: "Pool GRAIN lệch giá → impermanent loss cao", difficulty: "Khó", action: "Rebalance pool hoặc rút token" },
  { id: 5, type: "Tin vĩ mô", product: "GAO", content: "Thời tiết xấu → GAO thiếu hụt", difficulty: "Trung bình", action: "Chuẩn bị swap token GAO trước khi giá tăng mạnh" },
  { id: 6, type: "Sự kiện", product: "SUA", content: "Thị trường sữa biến động nhẹ", difficulty: "Dễ", action: "Theo dõi pool SUA, chưa cần hành động" },
  { id: 7, type: "Thị trường", product: "FRT", content: "Giá FRT tăng do dịch bệnh ở vùng sản xuất", difficulty: "Trung bình", action: "Xem xét mua FRT, chú ý slippage" },
  { id: 8, type: "Pool", product: "GAO", content: "Khối lượng pool GAO thấp → swap dễ trượt giá", difficulty: "Khó", action: "Giảm số lượng swap hoặc chờ pool cân bằng" },
  { id: 9, type: "Tin vĩ mô", product: "VEG", content: "Xu hướng thị trường cho thấy nhu cầu tăng VEG", difficulty: "Dễ", action: "Mua VEG hoặc stake vào pool VEG" },
  { id: 10, type: "Thị trường", product: "GRAIN", content: "Giá GRAIN giảm do dư thừa cung", difficulty: "Dễ", action: "Không mua vào ngay, chờ cơ hội" },
  { id: 11, type: "Pool", product: "FRT", content: "Tỷ lệ token FRT/USDG lệch 20%", difficulty: "Khó", action: "Rebalance pool hoặc swap ít một" },
  { id: 12, type: "Thị trường", product: "VEG", content: "Giá VEG tăng 7% do hạn hán", difficulty: "Trung bình", action: "Mua VEG để bán lời hoặc stake" },
  { id: 13, type: "Sự kiện", product: "SUA", content: "Pool SUA quá đông → impermanent loss cao", difficulty: "Khó", action: "Giảm số lượng stake / swap" },
  { id: 14, type: "Tin vĩ mô", product: "FRT", content: "Khối lượng giao dịch FRT đạt kỷ lục", difficulty: "Dễ", action: "Xem xét swap, theo dõi slippage" },
  { id: 15, type: "Thị trường", product: "GAO", content: "Nông dân kêu gọi hỗ trợ → GAO khan hiếm", difficulty: "Trung bình", action: "Theo dõi pool GAO, chuẩn bị swap" },
  { id: 16, type: "Sự kiện", product: "GRAIN", content: "Pool GRAIN thanh khoản thấp", difficulty: "Khó", action: "Giảm swap, chờ pool ổn định" },
  { id: 17, type: "Pool", product: "VEG", content: "Pool VEG lệch giá 25%", difficulty: "Khó", action: "Cân bằng lại pool VEG để tránh lỗ" },
  { id: 18, type: "Thị trường", product: "FRUIT", content: "Giá FRUIT tăng do nhập khẩu hạn chế", difficulty: "Trung bình", action: "Xem xét swap FRUIT" },
  { id: 19, type: "Tin vĩ mô", product: "SUA", content: "Xu hướng thị trường tăng nhu cầu sữa", difficulty: "Dễ", action: "Mua / stake SUA" },
  { id: 20, type: "Sự kiện", product: "GAO", content: "Dịch bệnh khiến GAO khan hiếm", difficulty: "Trung bình", action: "Theo dõi pool GAO, chuẩn bị swap" },
  { id: 21, type: "Thị trường", product: "VEG", content: "Giá VEG giảm 4% do tồn kho lớn", difficulty: "Trung bình", action: "Chờ cơ hội hoặc bán VEG" },
  { id: 22, type: "Pool", product: "FRT", content: "Khối lượng pool FRT thấp → trượt giá cao", difficulty: "Khó", action: "Giảm swap, chờ pool ổn định" },
  { id: 23, type: "Thị trường", product: "GAO", content: "Giá GAO biến động mạnh do xuất khẩu", difficulty: "Trung bình", action: "Theo dõi pool GAO, chuẩn bị swap" },
  { id: 24, type: "Sự kiện", product: "SUA", content: "Pool SUA lệch 30% → impermanent loss", difficulty: "Khó", action: "Rebalance pool SUA" },
  { id: 25, type: "Pool", product: "FRUIT", content: "Giá FRUIT giảm nhẹ do dư thừa cung", difficulty: "Dễ", action: "Không mua, quan sát trend" },
  { id: 26, type: "Tin vĩ mô", product: "GRAIN", content: "Thuế xuất khẩu GRAIN mới được áp dụng", difficulty: "Trung bình", action: "Theo dõi pool GRAIN" },
  { id: 27, type: "Thị trường", product: "VEG", content: "Giá VEG tăng do nhu cầu tại siêu thị lớn", difficulty: "Dễ", action: "Mua VEG để tối ưu lợi nhuận" },
  { id: 28, type: "Pool", product: "SUA", content: "Pool SUA thanh khoản thấp", difficulty: "Khó", action: "Giảm swap, chờ pool ổn định" },
  { id: 29, type: "Sự kiện", product: "GAO", content: "Dịch bệnh ảnh hưởng tới GAO", difficulty: "Trung bình", action: "Theo dõi pool GAO" },
  { id: 30, type: "Thị trường", product: "FRT", content: "Giá FRT biến động mạnh do trend thị trường", difficulty: "Khó", action: "Quan sát trend, chuẩn bị swap FRT" },
];

// Trader stats
const traderStats = {
  cashBalance: 1250.0,
  reputation: 2150,
  reputationMax: 3000,
  reputationLevel: "Thương nhân Bạc",
  profitLoss: 156.5,
  profitLossPercent: 14.4,
  totalInventory: 275,
};

const TraderDashboard = () => {
  const navigate = useNavigate();
  const [currentNews, setCurrentNews] = useState<typeof allNewsEvents>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Rotate news every 5 minutes
  useEffect(() => {
    const getRandomNews = () => {
      const shuffled = [...allNewsEvents].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 4);
    };

    setCurrentNews(getRandomNews());

    const interval = setInterval(() => {
      setCurrentNews(getRandomNews());
      setLastUpdate(new Date());
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getNewsIcon = (type: string) => {
    switch (type) {
      case "Thị trường":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "Sự kiện":
        return <Bug className="w-4 h-4 text-warning" />;
      case "Pool":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "Tin vĩ mô":
        return <CloudRain className="w-4 h-4 text-secondary" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Dễ":
        return "text-success bg-success/20";
      case "Trung bình":
        return "text-warning bg-warning/20";
      case "Khó":
        return "text-destructive bg-destructive/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getLiquidityStatus = (liquidity: number) => {
    if (liquidity >= 100000) return { text: "Cao", color: "text-success" };
    if (liquidity >= 60000) return { text: "Trung bình", color: "text-warning" };
    return { text: "Thấp ⚠️", color: "text-destructive" };
  };

  return (
    <DashboardLayout mode="trader">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển</h1>
          <p className="text-muted-foreground">
            Theo dõi thị trường và đưa ra quyết định giao dịch
          </p>
        </div>

        {/* Trader Overview Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số dư tiền</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${traderStats.cashBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">USDG</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Award className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Điểm uy tín</p>
                  <p className="text-2xl font-bold text-foreground">
                    {traderStats.reputation.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      value={(traderStats.reputation / traderStats.reputationMax) * 100}
                      className="h-1.5 flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {traderStats.reputationLevel}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lợi nhuận/Lỗ</p>
                  <p className="text-2xl font-bold text-success">
                    +${traderStats.profitLoss.toFixed(2)}
                  </p>
                  <p className="text-xs text-success">
                    +{traderStats.profitLossPercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Package className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng Inventory</p>
                  <p className="text-2xl font-bold text-foreground">
                    {traderStats.totalInventory}
                  </p>
                  <p className="text-xs text-muted-foreground">đơn vị</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slippage Formula Card */}
        <Card className="glass-card border-2 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  Công thức tính Slippage (Trượt giá)
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Slippage là sự trượt giá - chênh lệch giữa giá bạn kỳ vọng và giá thực tế khi giao dịch.
                </p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <p className="text-center font-mono text-lg font-bold text-foreground">
                    Slippage (%) = |Giá thực tế - Giá kỳ vọng| / Giá kỳ vọng × 100%
                  </p>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-sm text-warning flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span><strong>Lưu ý:</strong> Swap vào pool có thanh khoản thấp → dễ bị lỗ do slippage cao!</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Price Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Bảng giá Token / Sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Giá hiện tại</TableHead>
                  <TableHead>Thay đổi</TableHead>
                  <TableHead>Khối lượng thanh khoản Pool</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => {
                  const liquidityStatus = getLiquidityStatus(token.poolLiquidity);
                  return (
                    <TableRow
                      key={token.symbol}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border-2 overflow-hidden shadow-sm"
                            style={{ backgroundColor: `${token.color}15`, borderColor: `${token.color}30` }}
                          >
                            <img src={token.image} alt={token.symbol} className="w-8 h-8 object-contain" />
                          </div>
                          <div>
                            <p className="font-semibold">{token.symbol}/USDG</p>
                            <p className="text-xs text-muted-foreground">
                              {token.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-lg">${token.price.toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${token.positive ? "text-success" : "text-destructive"
                            }`}
                        >
                          {token.positive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {token.positive ? "+" : ""}
                            {token.change}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            ${token.poolLiquidity.toLocaleString()}
                          </p>
                          <p className={`text-xs ${liquidityStatus.color}`}>
                            {liquidityStatus.text}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Zap className="w-4 h-4 mr-1" />
                              Swap
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center border-2 overflow-hidden shadow-sm"
                                  style={{ backgroundColor: `${token.color}15`, borderColor: `${token.color}30` }}
                                >
                                  <img src={token.image} alt={token.symbol} className="w-8 h-8 object-contain" />
                                </div>
                                <span>{token.symbol}/USDG</span>
                              </DialogTitle>
                              <DialogDescription>
                                Thông tin chi tiết và swap nhanh
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* Price Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground">
                                    Giá hiện tại
                                  </p>
                                  <p className="text-xl font-bold">
                                    ${token.price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground">
                                    Thay đổi 24h
                                  </p>
                                  <p
                                    className={`text-xl font-bold ${token.positive ? "text-success" : "text-destructive"
                                      }`}
                                  >
                                    {token.positive ? "+" : ""}
                                    {token.change}%
                                  </p>
                                </div>
                              </div>

                              {/* Pool Info */}
                              <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                                <p className="font-medium">Thông tin Pool</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ratio:</span>
                                    <span>{token.poolRatio}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Thanh khoản:</span>
                                    <span className={liquidityStatus.color}>
                                      ${token.poolLiquidity.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Low Liquidity Warning */}
                              {token.poolLiquidity < 60000 && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 space-y-1">
                                  <div className="flex items-center gap-2 text-destructive font-medium">
                                    <AlertTriangle className="w-4 h-4" />
                                    Cảnh báo rủi ro
                                  </div>
                                  <p className="text-sm text-destructive/80">
                                    • Thanh khoản pool thấp - Slippage có thể cao!
                                  </p>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              <Button
                                className="w-full gradient-primary"
                                onClick={() => navigate("/trader/swap")}
                              >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Swap nhanh {token.symbol}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts and News */}
        <div className="grid grid-cols-3 gap-4">
          {/* Price Chart with all 4 tokens */}
          <Card className="glass-card col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Biểu đồ biến động giá</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                    <span className="text-muted-foreground">GAO</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                    <span className="text-muted-foreground">FRUIT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    <span className="text-muted-foreground">VEG</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <span className="text-muted-foreground">GRAIN</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={priceData}>
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis yAxisId="left" stroke="#888" domain={[1, 5]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {/* Volume bars */}
                  <Bar
                    yAxisId="right"
                    dataKey="volume"
                    fill="rgba(139, 92, 246, 0.2)"
                    name="Khối lượng"
                  />
                  {/* All 4 token price lines */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="GAO"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="GAO"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="FRUIT"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="FRUIT"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="VEG"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="VEG"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="GRAIN"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="GRAIN"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              {/* Trend Indicators */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/30">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs font-medium">GAO ↑</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/30">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs font-medium">FRUIT ↑</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/30">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-medium">VEG ↓</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/30">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">GRAIN →</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News / Event Feed */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Tin tức & Sự kiện
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="w-3 h-3" />
                  Cập nhật: {lastUpdate.toLocaleTimeString("vi-VN")}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentNews.map((news) => (
                <div
                  key={news.id}
                  className={`p-3 rounded-lg transition-colors ${news.difficulty === "Khó"
                    ? "bg-destructive/10 border border-destructive/30"
                    : "bg-muted/50 hover:bg-muted/70"
                    }`}
                >
                  <div className="flex items-start gap-2">
                    {getNewsIcon(news.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {news.product}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(
                            news.difficulty
                          )}`}
                        >
                          {news.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {news.content}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs text-primary mt-1"
                        onClick={() => navigate("/trader/swap")}
                      >
                        → {news.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-center text-muted-foreground pt-2">
                Tin tức tự động cập nhật mỗi 5 phút
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderDashboard;
