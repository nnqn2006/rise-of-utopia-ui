import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Store,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ShoppingCart,
  Scale,
  AlertTriangle,
  Info,
  History,
  TrendingUp as DemandIcon,
  ChevronRight,
  MoreVertical,
  Loader2
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Cell
} from "recharts";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getTraderData,
  getSwapHistory,
  type TraderData,
} from "@/services/gameDataService";

// Token metadata
const tokenMetadata: Record<string, { name: string; image: string; color: string }> = {
  GAO: { name: "Gạo Token", image: "/tokens/gao_new.png", color: "#8b5cf6" },
  FRUIT: { name: "Trái cây Token", image: "/tokens/fruit.png", color: "#ef4444" },
  VEG: { name: "Rau củ Token", image: "/tokens/veg.png", color: "#22c55e" },
  GRAIN: { name: "Ngũ cốc Token", image: "/tokens/grain.png", color: "#f59e0b" },
};

// Mock current prices (in real app, fetch from pool)
const currentPrices: Record<string, number> = {
  GAO: 1.0,
  FRUIT: 1.0,
  VEG: 1.0,
  GRAIN: 1.0,
};

// Mock demand trend data
const demandData = [
  { time: "08:00", price: 3.5, demand: 45, event: null },
  { time: "10:00", price: 3.6, demand: 52, event: "Nhu cầu tăng" },
  { time: "12:00", price: 3.4, demand: 38, event: null },
  { time: "14:00", price: 3.7, demand: 65, event: "Thiên tai nhẹ" },
  { time: "16:00", price: 3.8, demand: 48, event: null },
  { time: "18:00", price: 3.6, demand: 42, event: null },
  { time: "20:00", price: 3.7, demand: 55, event: null },
];

// Mock inventory data
const inventoryItems = [
  {
    id: "gao",
    symbol: "GAO",
    name: "Gạo Token",
    amount: 150,
    avgPrice: 3.20,
    currentPrice: 3.72,
    status: "Normal",
    image: "/tokens/gao_new.png",
    color: "#8b5cf6",
    history: [
      { date: "2024-01-08", type: "Buy", amount: 100, price: 3.15 },
      { date: "2024-01-09", type: "Buy", amount: 50, price: 3.30 },
    ]
  },
  {
    id: "fruit",
    symbol: "FRUIT",
    name: "Trái cây Token",
    amount: 80,
    avgPrice: 4.50,
    currentPrice: 4.58,
    status: "Surplus",
    image: "/tokens/fruit.png",
    color: "#ef4444",
    history: [
      { date: "2024-01-07", type: "Swap", amount: 80, price: 4.50 },
    ]
  },
  {
    id: "veg",
    symbol: "VEG",
    name: "Rau củ Token",
    amount: 45,
    avgPrice: 2.30,
    currentPrice: 2.15,
    status: "Low Demand",
    image: "/tokens/veg.png",
    color: "#22c55e",
    history: [
      { date: "2024-01-05", type: "Buy", amount: 45, price: 2.30 },
    ]
  },
  {
    id: "grain",
    symbol: "GRAIN",
    name: "Ngũ cốc Token",
    amount: 200,
    avgPrice: 1.80,
    currentPrice: 1.95,
    status: "Normal",
    image: "/tokens/grain.png",
    color: "#f59e0b",
    history: [
      { date: "2024-01-04", type: "Buy", amount: 200, price: 1.80 },
    ]
  },
];

const profitTrendData = [
  { name: 'GAO', profit: 78.00 },
  { name: 'FRUIT', profit: 6.40 },
  { name: 'VEG', profit: -6.75 },
  { name: 'GRAIN', profit: 30.00 },
];

const TraderStore = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [traderData, setTraderData] = useState<TraderData | null>(null);
  const [swapHistory, setSwapHistory] = useState<any[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [trader, history] = await Promise.all([
          getTraderData(),
          getSwapHistory(20)
        ]);

        if (trader) {
          setTraderData(trader);

          // Calculate current prices from pool state
          Object.entries(trader.pool_state).forEach(([pair, state]) => {
            const symbol = pair.split('/')[0];
            if (state.token_reserve > 0) {
              currentPrices[symbol] = state.usdg_reserve / state.token_reserve;
            }
          });
        }

        setSwapHistory(history || []);
      } catch (error) {
        console.error('Error loading store data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Build inventory items from trader data
  const inventoryItems = useMemo(() => {
    if (!traderData?.token_balances) return [];

    return Object.entries(traderData.token_balances)
      .filter(([symbol]) => symbol !== 'USDG')
      .map(([symbol, balance]) => {
        const meta = tokenMetadata[symbol] || { name: symbol, image: '', color: '#888' };
        const amount = balance.amount;
        const avgPrice = amount > 0 ? balance.cost_basis / amount : 0;
        const currentPrice = currentPrices[symbol] || 1;

        // Get history for this token from swap history
        const tokenHistory = swapHistory
          .filter(h => h.to_token === symbol)
          .slice(0, 5)
          .map(h => ({
            date: new Date(h.created_at).toLocaleDateString(),
            type: 'Swap',
            amount: h.to_amount,
            price: h.from_amount / h.to_amount
          }));

        return {
          id: symbol.toLowerCase(),
          symbol,
          name: meta.name,
          amount,
          avgPrice,
          currentPrice,
          status: amount > 100 ? 'Surplus' : amount > 0 ? 'Normal' : 'Empty',
          image: meta.image,
          color: meta.color,
          history: tokenHistory
        };
      })
      .filter(item => item.amount > 0); // Only show items with balance
  }, [traderData, swapHistory]);

  const storeSummary = useMemo(() => {
    const totalValue = inventoryItems.reduce((acc, item) => acc + (item.amount * item.currentPrice), 0);
    const totalCost = inventoryItems.reduce((acc, item) => acc + (item.amount * item.avgPrice), 0);
    const totalProfit = totalValue - totalCost;
    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
      totalValue: totalValue.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      roi: roi.toFixed(1),
      isPositive: totalProfit >= 0
    };
  }, [inventoryItems]);

  const profitTrendData = useMemo(() => {
    return inventoryItems.map(item => ({
      name: item.symbol,
      profit: item.amount * (item.currentPrice - item.avgPrice)
    }));
  }, [inventoryItems]);

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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Cửa hàng của bạn
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Store className="w-4 h-4" /> Quản lý danh mục hàng hóa và tối ưu lợi nhuận
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/trader/swap")}>
              <ArrowLeftRight className="w-4 h-4 mr-2" /> Swap nhanh
            </Button>
            <Button className="gradient-primary" size="sm" onClick={() => navigate("/trader/dashboard")}>
              <ShoppingCart className="w-4 h-4 mr-2" /> Nhập thêm hàng
            </Button>
          </div>
        </div>

        {/* 1. Store Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card overflow-hidden group hover:border-primary/50 transition-all border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng giá trị cửa hàng</p>
                  <h3 className="text-2xl font-bold mt-1">${storeSummary.totalValue}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" /> +$24.50 (24h)
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden group hover:border-success/50 transition-all border-l-4 border-l-success">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng lợi nhuận</p>
                  <h3 className="text-2xl font-bold mt-1 text-success">+${storeSummary.totalProfit}</h3>
                </div>
                <div className="p-2 bg-success/10 rounded-lg text-success">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" /> +$12.20 (24h)
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden group hover:border-blue-500/50 transition-all border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ROI Tổng thể</p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-500">+{storeSummary.roi}%</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <DemandIcon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Lợi nhuận dựa trên vốn gốc
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Phân bổ lợi nhuận</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-[60px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitTrendData}>
                    <Bar dataKey="profit">
                      {profitTrendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2. Inventory / Product List - Column 1 & 2 */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Danh sách Nông sản / Inventory</CardTitle>
                  <CardDescription>Theo dõi chi tiết giá vốn và hiệu suất từng loại</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-success/5 text-success border-success/20 py-1">
                    Kinh doanh ổn định
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nông sản</TableHead>
                    <TableHead>Giá vốn</TableHead>
                    <TableHead>Giá thị trường</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => {
                    const profit = ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100;
                    const isPositive = profit >= 0;

                    return (
                      <TableRow key={item.symbol} className="group hover:bg-muted/30 transition-colors h-16">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center border-2 overflow-hidden shadow-sm"
                              style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}
                            >
                              <img src={item.image} alt={item.symbol} className="w-8 h-8 object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-none mb-1">{item.symbol}</p>
                              <p className="text-[11px] text-muted-foreground">{item.amount} đơn vị</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm text-muted-foreground">${item.avgPrice.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <p className={`font-bold text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
                            ${item.currentPrice.toFixed(2)}
                          </p>
                          <p className={`text-[10px] font-medium flex items-center gap-0.5 ${isPositive ? "text-success" : "text-destructive"}`}>
                            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {isPositive ? "+" : ""}{profit.toFixed(1)}%
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 text-success hover:bg-success/10 rounded-full">
                                    <ShoppingCart className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Bán ngay</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-8 h-8 text-primary hover:bg-primary/10 rounded-full"
                                    onClick={() => navigate("/trader/swap")}
                                  >
                                    <ArrowLeftRight className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Swap Token</TooltipContent>
                              </Tooltip>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-8 h-8 text-muted-foreground hover:bg-muted rounded-full"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] glass-card border-primary/20">
                                  <DialogHeader>
                                    <div className="flex items-center gap-4 mb-2">
                                      <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 overflow-hidden shadow-sm"
                                        style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}
                                      >
                                        <img src={item.image} alt={item.symbol} className="w-12 h-12 object-contain" />
                                      </div>
                                      <div>
                                        <DialogTitle className="text-2xl">Phân tích {item.symbol}</DialogTitle>
                                        <DialogDescription>Hiệu suất và lịch sử giao dịch chi tiết</DialogDescription>
                                      </div>
                                    </div>
                                  </DialogHeader>

                                  <div className="grid grid-cols-3 gap-4 py-4">
                                    <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold text-center">Lợi nhuận ròng</p>
                                      <p className={`text-lg font-bold text-center ${isPositive ? "text-success" : "text-destructive"}`}>
                                        {isPositive ? "+" : ""}${(item.amount * (item.currentPrice - item.avgPrice)).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold text-center">Vốn đầu tư</p>
                                      <p className="text-lg font-bold text-center">${(item.amount * item.avgPrice).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold text-center">ROI Hiện tại</p>
                                      <p className={`text-lg font-bold text-center ${isPositive ? "text-success" : "text-destructive"}`}>
                                        {isPositive ? "+" : ""}{(((item.currentPrice - item.avgPrice) / item.avgPrice) * 100).toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>

                                  <Card className="bg-muted/20 border-border/50">
                                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <History className="w-4 h-4" /> Lịch sử giao dịch
                                      </CardTitle>
                                      <Badge variant="outline" className="text-[10px]">Gần nhất</Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                      <div className="space-y-3">
                                        {item.history.map((h: any, idx: number) => (
                                          <div key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex flex-col">
                                              <span className="font-medium text-xs">Mua từ TT</span>
                                              <span className="text-[10px] text-muted-foreground">{h.date}</span>
                                            </div>
                                            <div className="text-right">
                                              <div className="font-bold text-xs">{h.amount} {item.symbol}</div>
                                              <div className="text-[10px] text-muted-foreground">@ ${h.price.toFixed(2)} / đơn vị</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <div className="mt-4 p-3 bg-background/50 rounded-xl border border-border flex flex-col items-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Biến động giá thị trường gần đây</p>
                                    <div className="h-[80px] w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={demandData}>
                                          <defs>
                                            <linearGradient id="colorPricePop" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                          </defs>
                                          <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPricePop)" />
                                        </AreaChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>

                                  <DialogFooter className="gap-2 sm:justify-between mt-4">
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm" className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10 text-xs">
                                        <Scale className="w-3 h-3 mr-1" /> Cân bằng (Rebalance)
                                      </Button>
                                      <Button variant="outline" size="sm" className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10 text-xs">
                                        <ShoppingCart className="w-3 h-3 mr-1" /> Mua thêm
                                      </Button>
                                    </div>
                                    <Button className="gradient-primary" size="sm" onClick={() => navigate("/trader/swap")}>
                                      Đi đến Swap
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 4. Risk / Notifications - Right Side Top */}
          <div className="space-y-6">
            <Card className="glass-card border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Cảnh báo rủi ro & Gợi ý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-warning/10 rounded-xl border border-warning/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-warning mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-warning">Dư thừa FRUIT</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Lượng Fruit quá cao làm Pool lệch (70:30). Rủi ro IL tăng!
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs text-warning font-bold underline mt-2">
                        Rebalance ngay
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-4 h-4 text-destructive mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-destructive">VEG Giảm giá</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Dự báo nhu cầu VEG giảm 15% trong 2h tới do sự kiện thời tiết.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs text-destructive font-bold underline mt-2"
                        onClick={() => navigate("/trader/swap")}
                      >
                        Sell/Swap sang GAO
                      </Button>
                    </div>
                  </div>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">Cơ hội mới!</p>
                      <p className="text-[11px] text-muted-foreground">Kỳ vọng GRAIN tăng 5%</p>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* 3. Demand Trend Chart - Right Side Bottom */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DemandIcon className="w-4 h-4 text-blue-500" /> Nhu cầu thị trường (Demand)
                </CardTitle>
                <CardDescription className="text-[10px]">Trend dự báo nhu cầu các loại nông sản</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[180px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={demandData}>
                      <defs>
                        <linearGradient id="gradientDemand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 8 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-card p-2 text-[10px] border-primary/30">
                                <p className="font-bold">{payload[0].payload.time}</p>
                                <p className="text-primary">Nhu cầu: {payload[0].payload.demand} đơn vị</p>
                                <p className="text-success">Giá TT: ${payload[0].payload.price}</p>
                                {payload[0].payload.event && (
                                  <p className="text-warning mt-1 font-bold">⚠️ {payload[0].payload.event}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="demand" fill="url(#gradientDemand)" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        dot={{ r: 2, fill: "hsl(var(--secondary))" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2 mb-4">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <div className="w-2 h-2 rounded bg-primary/40" /> Nhu cầu (Bar)
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <div className="w-2 h-0.5 bg-secondary" /> Giá (Line)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderStore;
