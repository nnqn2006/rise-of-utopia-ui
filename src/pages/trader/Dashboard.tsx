import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const priceData = [
  { time: "09:00", GAO: 3.2, FRUIT: 4.1 },
  { time: "10:00", GAO: 3.4, FRUIT: 4.0 },
  { time: "11:00", GAO: 3.3, FRUIT: 4.3 },
  { time: "12:00", GAO: 3.6, FRUIT: 4.2 },
  { time: "13:00", GAO: 3.5, FRUIT: 4.5 },
  { time: "14:00", GAO: 3.8, FRUIT: 4.4 },
  { time: "15:00", GAO: 3.7, FRUIT: 4.6 },
];

const volumeData = [
  { time: "09:00", volume: 12000 },
  { time: "10:00", volume: 15000 },
  { time: "11:00", volume: 18000 },
  { time: "12:00", volume: 22000 },
  { time: "13:00", volume: 19000 },
  { time: "14:00", volume: 25000 },
  { time: "15:00", volume: 28000 },
];

const tickers = [
  { symbol: "GAO", price: "3.72", change: "+5.2%", positive: true },
  { symbol: "FRUIT", price: "4.58", change: "+3.8%", positive: true },
  { symbol: "VEG", price: "2.15", change: "-1.2%", positive: false },
  { symbol: "GRAIN", price: "1.85", change: "+0.5%", positive: true },
];

const news = [
  { title: "Giá GAO tăng mạnh do nhu cầu cao", time: "10 phút trước" },
  { title: "Thị trường FRUIT biến động nhẹ", time: "25 phút trước" },
  { title: "Khối lượng giao dịch đạt kỷ lục", time: "1 giờ trước" },
];

const TraderDashboard = () => {
  return (
    <DashboardLayout mode="trader">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển</h1>
          <p className="text-muted-foreground">Theo dõi thị trường và đưa ra quyết định giao dịch</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {tickers.map((t, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t.symbol}/USDG</p>
                <p className="text-2xl font-bold text-foreground">${t.price}</p>
                <div className={`flex items-center gap-1 text-sm ${t.positive ? "text-success" : "text-destructive"}`}>
                  {t.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {t.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-card col-span-2">
            <CardHeader><CardTitle>Biểu đồ giá</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceData}>
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }} />
                  <Line type="monotone" dataKey="GAO" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="FRUIT" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Newspaper className="w-5 h-5" />Tin tức</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {news.map((n, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderDashboard;
