import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Coins, Wallet, Package, Award, CloudSun, TrendingUp, TrendingDown } from "lucide-react";

const FarmerDashboard = () => {
  const stats = [
    { label: "Tổng giá trị USDG", value: "1,250.00", change: "+5.2%", icon: Coins, positive: true },
    { label: "Số dư khả dụng", value: "350.00", change: "-2.1%", icon: Wallet, positive: false },
    { label: "Nông sản trong kho", value: "42", unit: "sản phẩm", icon: Package },
  ];

  const marketNews = [
    "🌾 Giá GAO tăng 3.2% trong 24h qua",
    "🍎 FRUIT đạt mức cao nhất tuần",
    "☀️ Thời tiết thuận lợi cho vụ mùa mới",
    "📈 Thanh khoản GAO/USDG đạt 50,000 USDG",
    "🌧️ Dự báo mưa lớn cuối tuần - Ảnh hưởng năng suất",
  ];

  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển</h1>
          <p className="text-muted-foreground">Xin chào, Farmer! Đây là tổng quan tài sản của bạn.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                      {stat.unit && <span className="text-sm ml-1 text-muted-foreground">{stat.unit}</span>}
                    </p>
                    {stat.change && (
                      <div className={`flex items-center gap-1 mt-2 text-sm ${stat.positive ? "text-success" : "text-destructive"}`}>
                        {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Level & Reputation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Cấp độ & Uy tín
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Cấp độ 5</span>
                  <span className="text-foreground">2,450 / 3,000 XP</span>
                </div>
                <Progress value={82} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Điểm uy tín</span>
                  <span className="text-primary font-semibold">1,850 điểm</span>
                </div>
                <Progress value={62} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-warning" />
                Thời tiết hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl">☀️</div>
                <div>
                  <p className="text-2xl font-bold text-foreground">28°C</p>
                  <p className="text-muted-foreground">Nắng nhẹ, độ ẩm 65%</p>
                  <p className="text-sm text-success mt-1">Thuận lợi cho canh tác</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market News Ticker */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-primary whitespace-nowrap">📰 Tin thị trường</span>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  {marketNews.map((news, index) => (
                    <span key={index} className="mx-8 text-sm text-muted-foreground">
                      {news}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
