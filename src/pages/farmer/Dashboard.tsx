import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Wallet,
  Award,
  CloudSun,
  Sprout,
  Zap,
  BarChart3,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Sparkline, AnimatedCounter } from "@/components/dashboard";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend,
  Line,
} from "recharts";
import {
  getUserAssets,
  getFarmerData,
} from "@/services/gameDataService";
import {
  getCurrentPrices,
  subscribeToPriceUpdates,
  startPriceEngine,
  getChartData,
  type PriceData,
} from "@/services/priceEngine";
import {
  calculateImpermanentLossPercent,
  getILRiskLevel,
  getILRiskColor,
  getPoolApy,
  calculateSimPerHour,
  calculatePoolRatio,
  getPoolStatus,
} from "@/services/defiCalculator";

const FarmerDashboard = () => {
  const [selectedPool, setSelectedPool] = useState("GAO/USDG");
  const [isLoading, setIsLoading] = useState(true);

  // Real-time price data
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [priceChartData, setPriceChartData] = useState<Array<{
    time: string;
    GAO: number;
    FRUIT: number;
    VEG: number;
    GRAIN: number;
    volume: number;
  }>>([]);
  const [ilWarning, setIlWarning] = useState<{ show: boolean; level: string; percent: number }>({
    show: false,
    level: 'safe',
    percent: 0,
  });

  // Stats from database
  const [stats, setStats] = useState({
    totalAssets: 100,
    workingCapital: 100,
    reputationScore: 1000,
    level: 1,
    xp: 0,
    nextXp: 500,
    totalStakedLp: 0,
  });

  const [poolData, setPoolData] = useState<Record<string, { ratio: number; emoji: string; name: string; status: string }>>({
    "GAO/USDG": { ratio: 50.0, emoji: "🌾", name: "GAO", status: "Cân bằng" },
    "FRUIT/USDG": { ratio: 50.0, emoji: "🍎", name: "FRUIT", status: "Cân bằng" },
    "VEG/USDG": { ratio: 50.0, emoji: "🥬", name: "VEG", status: "Cân bằng" },
    "GRAIN/USDG": { ratio: 50.0, emoji: "🌽", name: "GRAIN", status: "Cân bằng" },
  });

  // Entry prices for IL calculation
  const [entryPrices, setEntryPrices] = useState<Record<string, number>>({
    GAO: 3.5,
    FRUIT: 4.2,
    VEG: 2.2,
    GRAIN: 1.85,
  });

  // Initialize price engine and subscribe to updates
  useEffect(() => {
    // Start the price engine
    startPriceEngine();

    // Get initial prices
    const initialPrices = getCurrentPrices();
    setPrices(initialPrices);

    // Get chart data from history, or create simulated initial data
    const chartData = getChartData(24);

    // Always create chart data with at least 7 points
    const now = new Date();
    const baseGao = initialPrices.GAO?.price || 3.5;
    const baseFruit = initialPrices.FRUIT?.price || 4.2;
    const baseVeg = initialPrices.VEG?.price || 2.2;
    const baseGrain = initialPrices.GRAIN?.price || 1.85;

    // Generate 7 hours of simulated price data with realistic fluctuations
    const initialChartData = [];
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      // Add small random variations (±5%)
      const variation = (i: number, base: number) => {
        const noise = (Math.random() - 0.5) * 0.1; // ±5%
        const trend = (6 - i) * 0.01; // slight upward trend
        return Math.round((base * (1 + noise + trend)) * 100) / 100;
      };

      initialChartData.push({
        time: time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        GAO: variation(i, baseGao),
        FRUIT: variation(i, baseFruit),
        VEG: variation(i, baseVeg),
        GRAIN: variation(i, baseGrain),
        volume: Math.floor(Math.random() * 20000) + 10000,
      });
    }

    // Use existing chart data if available, otherwise use simulated data
    if (chartData.length >= 5) {
      setPriceChartData(chartData);
    } else {
      setPriceChartData(initialChartData);
    }

    // Subscribe to price updates
    const unsubscribe = subscribeToPriceUpdates((newPrices) => {
      setPrices(newPrices);

      // Update chart data
      const newChartData = getChartData(24);
      if (newChartData.length >= 5) {
        setPriceChartData(newChartData);
      }

      // Check IL for selected pool
      const tokenSymbol = selectedPool.split('/')[0];
      const entryPrice = entryPrices[tokenSymbol] || 3.5;
      const currentPrice = newPrices[tokenSymbol]?.price || entryPrice;
      const ilPercent = calculateImpermanentLossPercent(entryPrice, currentPrice);
      const riskLevel = getILRiskLevel(ilPercent);

      setIlWarning({
        show: ilPercent > 2,
        level: riskLevel,
        percent: ilPercent,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [selectedPool, entryPrices]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [assets, farmer] = await Promise.all([
          getUserAssets(),
          getFarmerData()
        ]);

        if (assets) {
          const level = assets.level || 1;
          const xp = assets.xp || 0;
          const nextXp = level * 500;

          setStats(prev => ({
            ...prev,
            totalAssets: assets.usdg_balance,
            workingCapital: assets.usdg_balance,
            reputationScore: assets.reputation_points,
            level,
            xp,
            nextXp,
          }));
        }

        if (farmer?.pool_state) {
          const newPoolData: Record<string, { ratio: number; emoji: string; name: string; status: string }> = {};

          Object.entries(farmer.pool_state).forEach(([pair, state]) => {
            const tokenSymbol = pair.split('/')[0];
            const ratio = calculatePoolRatio(state.token_reserve, state.usdg_reserve);
            const emoji = tokenSymbol === 'GAO' ? '🌾' : tokenSymbol === 'FRUIT' ? '🍎' : tokenSymbol === 'VEG' ? '🥬' : '🌽';
            const poolStatus = getPoolStatus(ratio);

            newPoolData[pair] = {
              ratio,
              emoji,
              name: tokenSymbol,
              status: poolStatus.status
            };
          });

          setPoolData(newPoolData);
        }

        if (farmer?.liquidity_positions) {
          const totalStaked = Object.values(farmer.liquidity_positions)
            .reduce((acc, pos) => acc + pos.staked_lp, 0);
          setStats(prev => ({ ...prev, totalStakedLp: totalStaked }));
        }
      } catch (error) {
        console.error('Error loading farmer dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate dynamic trading signals based on price data
  const tradingSignals = useCallback(() => {
    const signals: string[] = [];

    Object.entries(prices).forEach(([symbol, data]) => {
      if (data.change24h > 5) {
        signals.push(`🔥 ${symbol}/USDG +${data.change24h.toFixed(1)}%`);
      } else if (data.change24h < -5) {
        signals.push(`📉 ${symbol}/USDG ${data.change24h.toFixed(1)}%`);
      }
    });

    // Add IL warning if exists
    if (ilWarning.show) {
      signals.push(`⚠️ IL ${selectedPool}: ${ilWarning.percent.toFixed(2)}%`);
    }

    // Add APY info
    const apy = getPoolApy(selectedPool) * 100;
    signals.push(`💰 APY ${selectedPool.split('/')[0]}: ${apy.toFixed(1)}%`);

    // Add SIM rate
    if (stats.totalStakedLp > 0) {
      const simPerHour = calculateSimPerHour(stats.totalStakedLp, getPoolApy(selectedPool));
      signals.push(`⚡ +${simPerHour.toFixed(4)} SIM/giờ`);
    }

    return signals.length > 0 ? signals : ["📊 Đang cập nhật..."];
  }, [prices, ilWarning, selectedPool, stats.totalStakedLp]);

  const netWorthTrend = [stats.totalAssets * 0.94, stats.totalAssets * 0.97, stats.totalAssets * 0.96, stats.totalAssets * 0.99, stats.totalAssets * 0.98, stats.totalAssets * 0.99, stats.totalAssets];

  const currentPool = poolData[selectedPool] || poolData["GAO/USDG"];
  const poolRatio = currentPool.ratio;

  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-3 w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
          <p className="text-muted-foreground text-sm">Xin chào, Farmer!</p>
        </div>

        {/* Row 1: 3 Square Cards - Tổng tài sản, Vốn lưu động, Hiệu suất */}
        <div className="grid grid-cols-3 gap-3">
          {/* Tổng tài sản */}
          <Card className="glass-card aspect-square">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center text-center">
              <div className="p-3 rounded-lg bg-primary/20 mb-3">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Tổng tài sản</p>
              <p className="text-3xl font-bold">${stats.totalAssets.toLocaleString()}</p>
              <Sparkline data={netWorthTrend} width={70} height={24} className="mt-2" />
              <p className="text-sm text-success mt-1">+5.9% (7d)</p>
            </CardContent>
          </Card>

          {/* Vốn lưu động */}
          <Card className="glass-card aspect-square">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center text-center">
              <div className="p-3 rounded-lg bg-secondary/20 mb-3">
                <Wallet className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Vốn lưu động</p>
              <p className="text-3xl font-bold">${stats.workingCapital.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-3">USDG</p>
            </CardContent>
          </Card>

          {/* Hiệu suất */}
          <Card className="glass-card aspect-square">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center text-center">
              <div className="p-3 rounded-lg bg-success/20 mb-3">
                <Sprout className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Hiệu suất</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-success font-bold text-xl">+</span>
                <AnimatedCounter
                  baseValue={0}
                  incrementPerSecond={0.0012}
                  decimals={4}
                  className="text-3xl font-bold text-success"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">SIM/giây</p>
            </CardContent>
          </Card>
        </div>

        {/* Marquee - Full width */}
        <Card className="glass-card border-primary/30 bg-primary/5">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">Tín hiệu</span>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  {tradingSignals().map((s, i) => (
                    <span key={i} className="mx-3 text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Badge - Full width */}
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl border-2 border-yellow-500">
                🌾
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">NFT</span>
                  <span className="text-xs text-muted-foreground">#003296</span>
                </div>
                <p className="text-sm font-semibold">Nông dân thành đạt</p>
                <div className="mt-1">
                  <Progress value={92} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-0.5">{stats.reputationScore} / 2001 điểm</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pool + IL Heatmap - 2 cols */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Tỷ lệ Pool</span>
                </div>
                <Select value={selectedPool} onValueChange={setSelectedPool}>
                  <SelectTrigger className="w-[130px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GAO/USDG">🌾 GAO/USDG</SelectItem>
                    <SelectItem value="FRUIT/USDG">🍎 FRUIT/USDG</SelectItem>
                    <SelectItem value="VEG/USDG">🥬 VEG/USDG</SelectItem>
                    <SelectItem value="GRAIN/USDG">🌽 GRAIN/USDG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span>{currentPool.emoji} {currentPool.name}</span>
                <span>USDG 💵</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                <div
                  className={`h-full ${poolRatio >= 45 && poolRatio <= 55 ? 'bg-success' : 'bg-warning'}`}
                  style={{ width: `${poolRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{poolRatio}%</span>
                <span className={`text-xs ${poolRatio >= 45 && poolRatio <= 55 ? 'text-success' : 'text-warning'}`}>
                  {currentPool.status}
                </span>
                <span>{(100 - poolRatio).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">IL Heatmap</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-success bg-success/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-success">0.1%</span>
                </div>
                <div>
                  <p className="text-success text-sm font-medium">An toàn</p>
                  <p className="text-xs text-muted-foreground">$0.85 → $0.92</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level + Weather - 2 cols */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Cấp độ {stats.level}</span>
                <span className="text-xs text-muted-foreground ml-auto">{stats.xp.toLocaleString()}/{stats.nextXp.toLocaleString()} XP</span>
              </div>
              <Progress value={stats.nextXp > 0 ? (stats.xp / stats.nextXp) * 100 : 0} className="h-1.5 mb-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Uy tín</span>
                <span className="text-primary font-medium">{stats.reputationScore} điểm</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☀️</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">28°C</p>
                    <span className="text-xs text-success flex items-center gap-1">
                      <CloudSun className="w-3 h-3" /> Thuận lợi
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Độ ẩm 65% • +12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart - Full width */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Biểu đồ biến động giá</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                  <span className="text-muted-foreground text-xs">GAO</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-muted-foreground text-xs">FRUIT</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="text-muted-foreground text-xs">VEG</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-muted-foreground text-xs">GRAIN</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={priceChartData}>
                <XAxis dataKey="time" stroke="#888" fontSize={12} />
                <YAxis yAxisId="left" stroke="#888" domain={[1, 5]} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} />
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
            <div className="grid grid-cols-4 gap-2 mt-3">
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
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
