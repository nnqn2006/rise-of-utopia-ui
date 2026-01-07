import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { History, Award, BarChart3 } from "lucide-react";

const history = [
  { type: "Mua", pair: "GAO/USDG", amount: "50 GAO", price: "$3.20", time: "2 giờ trước" },
  { type: "Bán", pair: "FRUIT/USDG", amount: "30 FRUIT", price: "$4.65", time: "5 giờ trước" },
  { type: "Mua", pair: "VEG/USDG", amount: "25 VEG", price: "$2.30", time: "1 ngày trước" },
];

const TraderPortfolio = () => (
  <DashboardLayout mode="trader">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Danh mục đầu tư</h1>
        <p className="text-muted-foreground">Lịch sử và hiệu suất giao dịch</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card"><CardContent className="p-6"><p className="text-muted-foreground text-sm">Tổng giao dịch</p><p className="text-3xl font-bold text-foreground">47</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-muted-foreground text-sm">Tỷ lệ thắng</p><p className="text-3xl font-bold text-success">68%</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-muted-foreground text-sm">Slippage TB</p><p className="text-3xl font-bold text-foreground">0.28%</p></CardContent></Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" />Điểm uy tín</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2"><span className="text-foreground font-semibold">2,150 điểm</span><span className="text-muted-foreground">Thương nhân Bạc</span></div>
          <Progress value={72} className="h-3" />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5" />Lịch sử giao dịch</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${h.type === "Mua" ? "bg-success/20 text-success" : "bg-secondary/20 text-secondary"}`}>{h.type}</div>
                <p className="font-medium text-foreground">{h.pair}</p>
                <p className="text-foreground">{h.amount}</p>
                <p className="text-foreground">{h.price}</p>
                <p className="text-muted-foreground text-sm">{h.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default TraderPortfolio;
