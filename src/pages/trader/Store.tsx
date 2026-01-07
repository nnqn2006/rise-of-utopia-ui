import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Store, TrendingUp, TrendingDown } from "lucide-react";

const inventory = [
  { name: "GAO", amount: "150", avgPrice: "3.20", currentPrice: "3.72", pl: "+16.3%", positive: true },
  { name: "FRUIT", amount: "80", avgPrice: "4.50", currentPrice: "4.58", pl: "+1.8%", positive: true },
  { name: "VEG", amount: "45", avgPrice: "2.30", currentPrice: "2.15", pl: "-6.5%", positive: false },
];

const TraderStore = () => (
  <DashboardLayout mode="trader">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cửa hàng của bạn</h1>
        <p className="text-muted-foreground">Quản lý nông sản và theo dõi lợi nhuận</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card"><CardContent className="p-6 text-center"><p className="text-muted-foreground text-sm">Tổng giá trị</p><p className="text-3xl font-bold gradient-text">$1,245.00</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6 text-center"><p className="text-muted-foreground text-sm">Tổng lợi nhuận</p><p className="text-3xl font-bold text-success">+$156.50</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6 text-center"><p className="text-muted-foreground text-sm">ROI</p><p className="text-3xl font-bold text-success">+14.4%</p></CardContent></Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" />Nông sản đang giữ</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-bold text-primary-foreground">{item.name[0]}</div>
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.amount} đơn vị</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Giá vốn</p>
                  <p className="font-medium">${item.avgPrice}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Giá hiện tại</p>
                  <p className="font-medium">${item.currentPrice}</p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${item.positive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                  {item.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {item.pl}
                </div>
                <Button variant="outline">Bán</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default TraderStore;
