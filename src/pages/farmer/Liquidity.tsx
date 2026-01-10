import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Droplets, AlertTriangle, TrendingUp, Coins, Lock, Plus, Minus } from "lucide-react";

const pools = [
  {
    pair: "GAO/USDG",
    tvl: "125,000",
    apy: "42.5%",
    userLp: "1,250.00",
    stakedLp: "800.00",
    simEarned: "125.5",
  },
  {
    pair: "FRUIT/USDG",
    tvl: "85,000",
    apy: "38.2%",
    userLp: "650.00",
    stakedLp: "650.00",
    simEarned: "78.2",
  },
  {
    pair: "VEG/USDG",
    tvl: "45,000",
    apy: "55.8%",
    userLp: "320.00",
    stakedLp: "200.00",
    simEarned: "45.3",
  },
  {
    pair: "GRAIN/USDG",
    tvl: "67,000",
    apy: "48.5%",
    userLp: "0.00",
    stakedLp: "0.00",
    simEarned: "0.00",
  },
];

const FarmerLiquidity = () => {
  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hồ thanh khoản</h1>
          <p className="text-muted-foreground">Cung cấp thanh khoản và stake LP Token để nhận phần thưởng SIM</p>
        </div>

        {/* Impermanent Loss Warning */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-warning">Cảnh báo tổn thất tạm thời (Impermanent Loss)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Khi cung cấp thanh khoản, giá trị tài sản có thể biến động so với việc giữ nguyên.
                Tìm hiểu kỹ trước khi tham gia.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pool List */}
        <div className="space-y-4">
          {pools.map((pool, index) => (
            <Card key={index} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {pool.pair}
                  </CardTitle>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    APY {pool.apy}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pool Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">TVL</p>
                    <p className="font-semibold text-foreground">${pool.tvl}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LP của bạn</p>
                    <p className="font-semibold text-foreground">{pool.userLp} LP</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Đã stake</p>
                    <p className="font-semibold text-foreground">{pool.stakedLp} LP</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SIM kiếm được</p>
                    <p className="font-semibold gradient-text">{pool.simEarned} SIM</p>
                  </div>
                </div>

                {/* Add Liquidity Widget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-success" />
                      Nạp thanh khoản
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="0.00" className="flex-1" />
                        <Button variant="outline" size="sm" className="px-3">
                          {pool.pair.split("/")[0]}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="0.00" className="flex-1" />
                        <Button variant="outline" size="sm" className="px-3">
                          USDG
                        </Button>
                      </div>
                      <Button className="w-full gradient-primary">
                        <Coins className="w-4 h-4 mr-2" />
                        Nạp & Nhận LP Token
                      </Button>
                    </div>
                  </div>

                  {/* Stake LP Widget */}
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Stake LP Token nhận SIM
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="0.00" className="flex-1" />
                        <Button variant="outline" size="sm" className="px-3">
                          LP
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 gradient-primary">
                          <Lock className="w-4 h-4 mr-2" />
                          Stake
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Minus className="w-4 h-4 mr-2" />
                          Unstake
                        </Button>
                      </div>
                      <Button variant="outline" className="w-full">
                        Thu hoạch {pool.simEarned} SIM
                      </Button>
                    </div>
                  </div>
                </div>

                {/* SIM Counter */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">SIM đang tích lũy</p>
                      <p className="text-2xl font-bold gradient-text">{pool.simEarned} SIM</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tốc độ farm</p>
                      <p className="text-lg font-semibold text-foreground">~0.05 SIM/giờ</p>
                    </div>
                  </div>
                  <Progress value={65} className="mt-3 h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerLiquidity;
