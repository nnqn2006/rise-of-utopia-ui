import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ArrowDownUp,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  RotateCcw,
  X,
  Sparkles,
  BarChart3,
  Calculator,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Token data
const tokensData = [
  { symbol: "USDG", name: "USD Game", balance: 350.0, color: "#3b82f6", image: "/tokens/usdg.png" },
  { symbol: "GAO", name: "Gạo Token", balance: 45.0, trend: "up", color: "#8b5cf6", image: "/tokens/gao_new.png" },
  { symbol: "FRUIT", name: "Trái cây Token", balance: 30.0, trend: "up", color: "#ef4444", image: "/tokens/fruit.png" },
  { symbol: "VEG", name: "Rau củ Token", balance: 25.0, trend: "down", color: "#22c55e", image: "/tokens/veg.png" },
  { symbol: "GRAIN", name: "Ngũ cốc Token", balance: 20.0, trend: "stable", color: "#f59e0b", image: "/tokens/grain.png" },
];

// Pool data with reserves for AMM calculation
const poolsData: Record<string, {
  reserveIn: number; // USDG reserve (x)
  reserveOut: number; // Token reserve (y)
  volume: number;
  isImbalanced: boolean;
  trend: string;
}> = {
  "GAO": { reserveIn: 1000, reserveOut: 1000, volume: 125000, isImbalanced: false, trend: "up" },
  "FRUIT": { reserveIn: 1200, reserveOut: 1000, volume: 98000, isImbalanced: false, trend: "up" },
  "VEG": { reserveIn: 800, reserveOut: 1200, volume: 45000, isImbalanced: true, trend: "down" },
  "GRAIN": { reserveIn: 1100, reserveOut: 1000, volume: 67000, isImbalanced: false, trend: "stable" },
};

// Mini chart data
const priceHistory = [
  { time: "09:00", price: 3.2, volume: 1200 },
  { time: "10:00", price: 3.4, volume: 1500 },
  { time: "11:00", price: 3.3, volume: 1800 },
  { time: "12:00", price: 3.6, volume: 2200 },
  { time: "13:00", price: 3.5, volume: 1900 },
  { time: "14:00", price: 3.8, volume: 2500 },
  { time: "15:00", price: 3.72, volume: 2800 },
];

const TraderSwap = () => {
  const navigate = useNavigate();

  // Form state
  const [fromToken, setFromToken] = useState("USDG");
  const [toToken, setToToken] = useState("GAO");
  const [amount, setAmount] = useState("100");
  const [slippageLimit, setSlippageLimit] = useState([0.5]);

  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [showPoolDetails, setShowPoolDetails] = useState(false);
  const [showFormulaDialog, setShowFormulaDialog] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Get token info
  const fromTokenInfo = tokensData.find(t => t.symbol === fromToken)!;
  const toTokenInfo = tokensData.find(t => t.symbol === toToken)!;
  const poolInfo = poolsData[toToken] || poolsData["GAO"];

  // AMM Formula: x * y = k
  // dy = (y * dx) / (x + dx)
  const swapDetails = useMemo(() => {
    const dx = parseFloat(amount) || 0; // amount_in (USDG trader swap)
    const x = poolInfo.reserveIn; // reserve_in (USDG in pool)
    const y = poolInfo.reserveOut; // reserve_out (Token in pool)
    const k = x * y; // constant product

    // Calculate output using AMM formula
    // dy = (y * dx) / (x + dx)
    const dy = (y * dx) / (x + dx);

    // Fee calculation (0.3%)
    const feePercent = 0.3;
    const feeAmount = dy * (feePercent / 100);
    const outputAfterFee = dy - feeAmount;

    // Slippage calculation
    const slippageAmount = outputAfterFee * (slippageLimit[0] / 100);
    const minOutput = outputAfterFee - slippageAmount;

    // Price calculations
    const spotPrice = y / x; // Current price (tokens per USDG)
    const executionPrice = dx > 0 ? dy / dx : spotPrice; // Actual price you get
    const priceImpact = dx > 0 ? ((spotPrice - executionPrice) / spotPrice) * 100 : 0;
    const avgPrice = dx > 0 ? dx / dy : 0; // USDG per token

    // New pool state after swap
    const newReserveIn = x + dx;
    const newReserveOut = y - dy;
    const newRatio = `${Math.round((newReserveIn / (newReserveIn + newReserveOut)) * 100)}:${Math.round((newReserveOut / (newReserveIn + newReserveOut)) * 100)}`;

    return {
      dx, // Amount in
      dy, // Amount out (before fee)
      outputAfterFee,
      minOutput,
      feePercent,
      feeAmount,
      spotPrice,
      executionPrice,
      avgPrice,
      priceImpact,
      k,
      x,
      y,
      newReserveIn,
      newReserveOut,
      newRatio,
    };
  }, [amount, poolInfo, slippageLimit]);

  // Swap tokens
  const handleSwapTokens = () => {
    if (fromToken !== "USDG") {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
    }
  };

  // Execute swap
  const handleExecuteSwap = () => {
    setIsSwapping(true);
    setShowConfirmDialog(false);

    setTimeout(() => {
      setIsSwapping(false);
      if (Math.random() > 0.2) {
        setShowSuccessDialog(true);
      } else {
        setShowFailDialog(true);
      }
    }, 2000);
  };

  // Get warning messages
  const getWarnings = () => {
    const warnings: { type: "error" | "warning"; message: string }[] = [];

    if (poolInfo.isImbalanced) {
      warnings.push({ type: "error", message: "Pool lệch giá → nguy cơ impermanent loss cao" });
    }
    if (swapDetails.priceImpact > 1) {
      warnings.push({ type: "warning", message: `Price impact cao: ${swapDetails.priceImpact.toFixed(2)}%` });
    }
    if (slippageLimit[0] > 1) {
      warnings.push({ type: "warning", message: "Slippage cao hơn 1% - cân nhắc giảm số lượng" });
    }
    if (swapDetails.dx > fromTokenInfo.balance) {
      warnings.push({ type: "error", message: "Số dư không đủ!" });
    }

    return warnings;
  };

  const warnings = getWarnings();
  const currentRatio = `${Math.round((poolInfo.reserveIn / (poolInfo.reserveIn + poolInfo.reserveOut)) * 100)}:${Math.round((poolInfo.reserveOut / (poolInfo.reserveIn + poolInfo.reserveOut)) * 100)}`;

  return (
    <DashboardLayout mode="trader">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Swap Token</h1>
          <p className="text-muted-foreground">Giao dịch nông sản tức thì với công thức AMM</p>
        </div>

        {/* AMM Formula Card */}
        <Card className="glass-card border-none bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">
                    Công thức Swap (AMM - Automated Market Maker)
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowFormulaDialog(true)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Xem ví dụ
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Swap = Đổi token này sang token khác trong pool theo công thức hằng số tích.
                </p>

                {/* Main Formula */}
                <div className="max-w-md mx-auto p-6 rounded-3xl bg-background/50 border border-primary/20 shadow-xl">
                  <p className="text-center font-mono text-3xl font-bold text-primary mb-6">
                    x × y = k
                  </p>
                  <div className="grid grid-cols-3 gap-6 text-sm text-center">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">x</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Token A (USDG)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">y</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Token B (GAO,...)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">k</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hằng số</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main 3-section layout */}
        <div className="grid grid-cols-3 gap-6">

          {/* Section 1: Token Selection & Amount */}
          <Card className="glass-card col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Chọn token & Số lượng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    Từ token (x)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Token bạn muốn đổi đi</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Số dư: {fromTokenInfo.balance.toFixed(2)} {fromToken}
                  </span>
                </div>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tokensData.map(token => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center border-2 overflow-hidden"
                            style={{ backgroundColor: `${token.color}15`, borderColor: `${token.color}30` }}
                          >
                            <img src={token.image} alt={token.symbol} className="w-6 h-6 object-contain" />
                          </div>
                          <span className="font-bold">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">{token.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input (dx) */}
              <div className="space-y-2">
                <Label>Số lượng swap (dx)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-xl font-bold pr-16"
                    placeholder="0.00"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                    onClick={() => setAmount(fromTokenInfo.balance.toString())}
                  >
                    MAX
                  </Button>
                </div>
                <Slider
                  value={[parseFloat(amount) || 0]}
                  max={fromTokenInfo.balance}
                  step={1}
                  onValueChange={(v) => setAmount(v[0].toString())}
                  className="mt-2"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleSwapTokens}
                >
                  <ArrowDownUp className="w-4 h-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    Đến token (y)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Token bạn muốn nhận</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Số dư: {toTokenInfo.balance.toFixed(2)} {toToken}
                  </span>
                </div>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tokensData.filter(t => t.symbol !== "USDG").map(token => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center border-2 overflow-hidden"
                            style={{ backgroundColor: `${token.color}15`, borderColor: `${token.color}30` }}
                          >
                            <img src={token.image} alt={token.symbol} className="w-6 h-6 object-contain" />
                          </div>
                          <span className="font-bold">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">{token.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Output (dy) */}
              <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Bạn nhận được (dy)</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>dy = (y × dx) / (x + dx)</p>
                      <p>= ({swapDetails.y} × {swapDetails.dx}) / ({swapDetails.x} + {swapDetails.dx})</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-2xl font-bold text-success">
                  {swapDetails.outputAfterFee.toFixed(4)} {toToken}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trước phí: {swapDetails.dy.toFixed(4)} {toToken}
                </p>
              </div>

              {/* Slippage Limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    Slippage limit
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Giới hạn trượt giá tối đa</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className={`text-sm font-medium ${slippageLimit[0] > 1 ? "text-warning" : ""}`}>
                    {slippageLimit[0]}%
                  </span>
                </div>
                <Slider
                  value={slippageLimit}
                  onValueChange={setSlippageLimit}
                  max={5}
                  step={0.1}
                  min={0.1}
                  className={slippageLimit[0] > 1 ? "[&_[role=slider]]:bg-warning" : ""}
                />
              </div>

              {/* Transaction Details */}
              <div className="p-4 rounded-xl bg-muted/30 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spot Price</span>
                  <span>1 USDG = {swapDetails.spotPrice.toFixed(4)} {toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Execution Price</span>
                  <span>1 USDG = {swapDetails.executionPrice.toFixed(4)} {toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá trung bình</span>
                  <span className="font-medium">{swapDetails.avgPrice.toFixed(4)} USDG/{toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={swapDetails.priceImpact > 1 ? "text-warning" : ""}>
                    {swapDetails.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí ({swapDetails.feePercent}%)</span>
                  <span>{swapDetails.feeAmount.toFixed(4)} {toToken}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Nhận tối thiểu</span>
                  <span className="font-bold">{swapDetails.minOutput.toFixed(4)} {toToken}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pool Info & AMM Details */}
          <Card className="glass-card col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Thông tin Pool & AMM
                <Button variant="ghost" size="sm" onClick={() => setShowPoolDetails(true)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Chi tiết
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Pool State */}
              <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pool {toToken}/USDG</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${poolInfo.isImbalanced
                    ? "bg-destructive/20 text-destructive"
                    : "bg-success/20 text-success"
                    }`}>
                    {poolInfo.isImbalanced ? (
                      <><AlertTriangle className="w-3 h-3" /> Lệch</>
                    ) : (
                      <><CheckCircle className="w-3 h-3" /> Cân bằng</>
                    )}
                  </div>
                </div>

                {/* AMM Values */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">x (USDG)</p>
                    <p className="font-bold">{poolInfo.reserveIn.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">y ({toToken})</p>
                    <p className="font-bold">{poolInfo.reserveOut.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 col-span-2">
                    <p className="text-xs text-muted-foreground">k = x × y (Hằng số)</p>
                    <p className="font-bold text-primary">{swapDetails.k.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ratio hiện tại</p>
                    <p className="font-medium">{currentRatio}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume 24h</p>
                    <p className="font-medium">${poolInfo.volume.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* After Swap Preview */}
              {swapDetails.dx > 0 && (
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 space-y-3">
                  <p className="font-medium text-secondary flex items-center gap-2">
                    <ArrowDownUp className="w-4 h-4" />
                    Sau khi swap
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">x (USDG mới)</p>
                      <p className="font-medium">{swapDetails.newReserveIn.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">y ({toToken} mới)</p>
                      <p className="font-medium">{swapDetails.newReserveOut.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Ratio mới</p>
                      <p className="font-medium">{swapDetails.newRatio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((warning, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg flex items-start gap-2 ${warning.type === "error"
                        ? "bg-destructive/10 border border-destructive/30"
                        : "bg-warning/10 border border-warning/30"
                        }`}
                    >
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${warning.type === "error" ? "text-destructive" : "text-warning"
                        }`} />
                      <p className={`text-sm ${warning.type === "error" ? "text-destructive" : "text-warning"
                        }`}>
                        {warning.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Smart Suggestion */}
              {swapDetails.priceImpact > 0.5 && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Gợi ý</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Swap số lượng lớn gây price impact cao. Cân nhắc chia nhỏ giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Mini Chart + Actions */}
          <Card className="glass-card col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Biểu đồ & Hành động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini Chart */}
              <div className="p-2 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{toToken}/USDG</span>
                  <div className={`flex items-center gap-1 text-sm ${poolInfo.trend === "up" ? "text-success" : "text-destructive"
                    }`}>
                    {poolInfo.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {poolInfo.trend === "up" ? "+5.2%" : "-1.2%"}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <ComposedChart data={priceHistory}>
                    <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#888" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <RechartsTooltip
                      contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="volume" fill="rgba(139, 92, 246, 0.2)" />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <ReferenceLine
                      y={3.5}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: "MA", fontSize: 10, fill: "#f59e0b" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-2 mt-2 p-2 rounded-lg bg-muted/50">
                  {poolInfo.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${poolInfo.trend === "up" ? "text-success" : "text-destructive"
                    }`}>
                    Xu hướng {poolInfo.trend === "up" ? "tăng" : "giảm"}
                  </span>
                </div>
              </div>

              {/* AMM Calculation Preview */}
              <div className="p-3 rounded-lg bg-muted/30 text-xs font-mono">
                <p className="text-muted-foreground mb-1">Phép tính AMM:</p>
                <p>dy = ({swapDetails.y} × {swapDetails.dx}) / ({swapDetails.x} + {swapDetails.dx})</p>
                <p className="text-primary font-bold">dy = {swapDetails.dy.toFixed(4)} {toToken}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full gradient-primary text-lg py-6"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={warnings.some(w => w.type === "error" && w.message.includes("Số dư")) || isSwapping || swapDetails.dx <= 0}
                >
                  {isSwapping ? (
                    <>
                      <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Swap {swapDetails.outputAfterFee.toFixed(2)} {toToken}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPoolDetails(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem chi tiết Pool
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formula Example Dialog */}
        <Dialog open={showFormulaDialog} onOpenChange={setShowFormulaDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Ví dụ tính toán Swap
              </DialogTitle>
              <DialogDescription>
                Minh họa công thức AMM với số liệu cụ thể
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Example Setup */}
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="font-medium mb-2">Pool ban đầu:</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 rounded bg-muted/50 text-center">
                    <p className="text-muted-foreground">x (USDG)</p>
                    <p className="font-bold">1,000</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50 text-center">
                    <p className="text-muted-foreground">y (GAO)</p>
                    <p className="font-bold">1,000</p>
                  </div>
                  <div className="p-2 rounded bg-primary/20 text-center">
                    <p className="text-muted-foreground">k</p>
                    <p className="font-bold text-primary">1,000,000</p>
                  </div>
                </div>
              </div>

              {/* Swap Action */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                <p className="font-medium mb-2">Trader swap:</p>
                <p className="text-lg">dx = <span className="font-bold text-secondary">100 USDG</span></p>
              </div>

              {/* Calculation */}
              <div className="p-4 rounded-xl bg-muted/30 font-mono text-sm">
                <p className="text-muted-foreground mb-2">Áp dụng công thức:</p>
                <p className="mb-1">dy = (y × dx) / (x + dx)</p>
                <p className="mb-1">dy = (1000 × 100) / (1000 + 100)</p>
                <p className="mb-1">dy = 100,000 / 1,100</p>
                <p className="text-lg font-bold text-success">dy ≈ 90.91 GAO</p>
              </div>

              {/* Result */}
              <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                <p className="font-medium mb-2">Kết quả:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nhận được</p>
                    <p className="font-bold text-success">≈ 90.91 GAO</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Giá trung bình</p>
                    <p className="font-bold">100 / 90.91 ≈ 1.1 USDG/GAO</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Giá tăng từ 1.0 lên 1.1 USDG/GAO do price impact
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowFormulaDialog(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận Swap</DialogTitle>
              <DialogDescription>
                Kiểm tra lại thông tin trước khi xác nhận
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Từ</span>
                  <span className="font-bold">{swapDetails.dx} {fromToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đến</span>
                  <span className="font-bold text-success">{swapDetails.outputAfterFee.toFixed(4)} {toToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giá thực tế</span>
                  <span>{swapDetails.avgPrice.toFixed(4)} USDG/{toToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={swapDetails.priceImpact > 1 ? "text-warning" : ""}>
                    {swapDetails.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí</span>
                  <span>{swapDetails.feeAmount.toFixed(4)} {toToken}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Nhận tối thiểu</span>
                  <span className="font-bold text-primary">{swapDetails.minOutput.toFixed(4)} {toToken}</span>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-sm text-warning font-medium mb-1">⚠️ Lưu ý</p>
                  {warnings.map((w, i) => (
                    <p key={i} className="text-xs text-warning/80">• {w.message}</p>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Hủy
              </Button>
              <Button className="gradient-primary" onClick={handleExecuteSwap}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Xác nhận Swap
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2 text-success">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-success">Swap thành công!</DialogTitle>
                  <DialogDescription>Giao dịch đã hoàn tất</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã nhận</span>
                  <span className="font-bold text-success text-lg">
                    +{swapDetails.outputAfterFee.toFixed(4)} {toToken}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giá thực tế</span>
                  <span>{swapDetails.avgPrice.toFixed(4)} USDG/{toToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Đã thêm vào inventory</span>
                  <span className="text-success">✓</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={() => {
                setShowSuccessDialog(false);
                setAmount("100");
              }}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fail Dialog */}
        <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-destructive">Swap thất bại</DialogTitle>
                  <DialogDescription>Giao dịch không thể hoàn tất</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive font-medium mb-2">Lý do có thể:</p>
                <ul className="text-xs text-destructive/80 space-y-1">
                  <li>• Slippage vượt mức cho phép</li>
                  <li>• Pool thay đổi trong quá trình xử lý</li>
                  <li>• Giá thay đổi quá nhanh</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  💡 Gợi ý: Tăng slippage limit hoặc giảm số lượng swap
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowFailDialog(false)}>
                Hủy
              </Button>
              <Button onClick={() => {
                setShowFailDialog(false);
                setShowConfirmDialog(true);
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pool Details Dialog */}
        <Dialog open={showPoolDetails} onOpenChange={setShowPoolDetails}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chi tiết Pool {toToken}/USDG</DialogTitle>
              <DialogDescription>
                Thông tin AMM và lịch sử giao dịch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* AMM Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">x (USDG Reserve)</p>
                  <p className="text-lg font-bold">{poolInfo.reserveIn.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">y ({toToken} Reserve)</p>
                  <p className="text-lg font-bold">{poolInfo.reserveOut.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/20 col-span-2">
                  <p className="text-xs text-muted-foreground">k = x × y</p>
                  <p className="text-lg font-bold text-primary">{swapDetails.k.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Ratio</p>
                  <p className="text-lg font-bold">{currentRatio}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Spot Price</p>
                  <p className="text-lg font-bold">{swapDetails.spotPrice.toFixed(4)}</p>
                </div>
              </div>

              {poolInfo.isImbalanced && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Pool lệch</p>
                      <p className="text-xs text-destructive/80 mt-1">
                        Swap số lượng lớn có thể gây price impact cao và impermanent loss.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Swaps */}
              <div>
                <p className="text-sm font-medium mb-2">Giao dịch gần đây</p>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {[
                    { type: "Mua", amount: "50 GAO", price: "1.05", time: "2 phút trước" },
                    { type: "Bán", amount: "30 GAO", price: "0.98", time: "5 phút trước" },
                    { type: "Mua", amount: "100 GAO", price: "1.10", time: "12 phút trước" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                      <span className={tx.type === "Mua" ? "text-success" : "text-secondary"}>
                        {tx.type}
                      </span>
                      <span>{tx.amount}</span>
                      <span className="text-muted-foreground">{tx.price} USDG</span>
                      <span className="text-muted-foreground text-xs">{tx.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="w-full" onClick={() => setShowPoolDetails(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TraderSwap;
