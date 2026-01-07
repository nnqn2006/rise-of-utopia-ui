import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Briefcase, Award, Droplets, TrendingUp, Coins, CheckCircle } from "lucide-react";

const poolPositions = [
  { pair: "GAO/USDG", lpAmount: "1,250.00", stakedPercent: 64, apy: "42.5%", status: "active" },
  { pair: "FRUIT/USDG", lpAmount: "650.00", stakedPercent: 100, apy: "38.2%", status: "active" },
  { pair: "VEG/USDG", lpAmount: "0.00", stakedPercent: 0, apy: "55.8%", status: "inactive" },
];

const FarmerPortfolio = () => {
  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh mục đầu tư</h1>
          <p className="text-muted-foreground">Tổng quan tài sản và vị thế của bạn trong hệ thống</p>
        </div>

        {/* Total Assets Card */}
        <Card className="glass-card glow-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng giá trị tài sản</p>
                <p className="text-4xl font-bold gradient-text mt-1">$2,850.00</p>
                <div className="flex items-center gap-2 mt-2 text-success">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+12.5% so với tuần trước</span>
                </div>
              </div>
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">USDG khả dụng</p>
                  <p className="text-xl font-bold text-foreground">350.00 USDG</p>
                </div>
              </div>
              <Progress value={35} className="h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá trị LP Token</p>
                  <p className="text-xl font-bold text-foreground">1,900.00 USDG</p>
                </div>
              </div>
              <Progress value={67} className="h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SIM tích lũy</p>
                  <p className="text-xl font-bold text-foreground">203.7 SIM</p>
                </div>
              </div>
              <Progress value={41} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Reputation Progress */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Tiến trình điểm uy tín
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">1,850 điểm</p>
                  <p className="text-sm text-muted-foreground">Hạng: Nông dân Bạc</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Mục tiêu tiếp theo</p>
                  <p className="font-semibold gradient-text">Nông dân Vàng (2,500 điểm)</p>
                </div>
              </div>
              <Progress value={74} className="h-4" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Bạc (1,000)</span>
                <span>Vàng (2,500)</span>
                <span>Kim cương (5,000)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pool Positions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              Trạng thái các cặp Pool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {poolPositions.map((pool, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pool.status === "active" ? "gradient-primary" : "bg-muted"}`}>
                      <Droplets className={`w-5 h-5 ${pool.status === "active" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{pool.pair}</p>
                      <p className="text-sm text-muted-foreground">{pool.lpAmount} LP Token</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Đã stake</p>
                      <p className="font-semibold text-foreground">{pool.stakedPercent}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">APY</p>
                      <p className="font-semibold text-success">{pool.apy}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${pool.status === "active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {pool.status === "active" && <CheckCircle className="w-3 h-3" />}
                      {pool.status === "active" ? "Đang hoạt động" : "Chưa tham gia"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerPortfolio;
