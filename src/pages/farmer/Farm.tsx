import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sprout, Clock, Package, ShoppingBag, Coins } from "lucide-react";

const farmPlots = [
  { id: 1, status: "growing", crop: "Lúa gạo", timeLeft: "2h 15m", progress: 75 },
  { id: 2, status: "growing", crop: "Táo", timeLeft: "5h 30m", progress: 40 },
  { id: 3, status: "ready", crop: "Cam", timeLeft: "0", progress: 100 },
  { id: 4, status: "empty", crop: null, timeLeft: null, progress: 0 },
  { id: 5, status: "growing", crop: "Dưa hấu", timeLeft: "1h 45m", progress: 85 },
  { id: 6, status: "empty", crop: null, timeLeft: null, progress: 0 },
  { id: 7, status: "ready", crop: "Cà chua", timeLeft: "0", progress: 100 },
  { id: 8, status: "growing", crop: "Ngô", timeLeft: "4h 20m", progress: 55 },
  { id: 9, status: "empty", crop: null, timeLeft: null, progress: 0 },
  { id: 10, status: "empty", crop: null, timeLeft: null, progress: 0 },
  { id: 11, status: "growing", crop: "Khoai tây", timeLeft: "3h 10m", progress: 60 },
  { id: 12, status: "empty", crop: null, timeLeft: null, progress: 0 },
];

const harvestedCrops = [
  { name: "Lúa gạo (GAO)", amount: 150, unit: "kg", value: 450 },
  { name: "Trái cây (FRUIT)", amount: 80, unit: "kg", value: 320 },
  { name: "Rau củ (VEG)", amount: 45, unit: "kg", value: 180 },
];

const seeds = [
  { name: "Hạt Lúa", price: 10, time: "4h", yield: "50 GAO" },
  { name: "Hạt Táo", price: 15, time: "6h", yield: "30 FRUIT" },
  { name: "Hạt Cam", price: 12, time: "5h", yield: "35 FRUIT" },
  { name: "Hạt Dưa", price: 20, time: "3h", yield: "25 FRUIT" },
  { name: "Hạt Ngô", price: 8, time: "4h", yield: "40 VEG" },
  { name: "Hạt Khoai", price: 6, time: "5h", yield: "60 VEG" },
];

const FarmerFarm = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);

  const getPlotStyle = (status: string) => {
    switch (status) {
      case "growing":
        return "bg-success/20 border-success/50";
      case "ready":
        return "bg-warning/20 border-warning/50 animate-pulse";
      default:
        return "bg-muted/50 border-dashed border-muted-foreground/30";
    }
  };

  const getPlotIcon = (status: string) => {
    switch (status) {
      case "growing":
        return <Sprout className="w-8 h-8 text-success" />;
      case "ready":
        return <Package className="w-8 h-8 text-warning" />;
      default:
        return <span className="text-2xl text-muted-foreground">+</span>;
    }
  };

  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nông trại</h1>
            <p className="text-muted-foreground">Quản lý đất đai và thu hoạch nông sản của bạn</p>
          </div>
          <Dialog open={isShopOpen} onOpenChange={setIsShopOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary gap-2">
                <ShoppingBag className="w-4 h-4" />
                Cửa hàng hạt giống
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Cửa hàng hạt giống
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {seeds.map((seed, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                        <Sprout className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{seed.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ⏱️ {seed.time} • 🌾 {seed.yield}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Coins className="w-3 h-3" />
                      {seed.price} USDG
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Farm Grid */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Lưới đất nông trại (100m²)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {farmPlots.map((plot) => (
                <div
                  key={plot.id}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getPlotStyle(plot.status)}`}
                >
                  {getPlotIcon(plot.status)}
                  {plot.crop && (
                    <p className="text-xs font-medium text-foreground mt-2">{plot.crop}</p>
                  )}
                  {plot.status === "growing" && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {plot.timeLeft}
                    </div>
                  )}
                  {plot.status === "ready" && (
                    <p className="text-xs text-warning font-medium mt-1">Thu hoạch!</p>
                  )}
                  {plot.status === "empty" && (
                    <p className="text-xs text-muted-foreground mt-1">Trống</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Harvested Crops */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Kho nông sản đã thu hoạch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {harvestedCrops.map((crop, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{crop.name}</p>
                    <p className="text-sm text-muted-foreground">{crop.amount} {crop.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold gradient-text">{crop.value} USDG</p>
                    <p className="text-xs text-muted-foreground">Giá trị ước tính</p>
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

export default FarmerFarm;
