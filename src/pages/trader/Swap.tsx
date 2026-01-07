import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowDownUp, Settings, AlertCircle } from "lucide-react";

const TraderSwap = () => (
  <DashboardLayout mode="trader">
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Swap</h1>
        <p className="text-muted-foreground">Giao dịch nông sản tức thì</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Swap Token</CardTitle>
          <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Từ</p>
            <div className="flex gap-3">
              <Input placeholder="0.00" className="text-2xl font-bold border-0 bg-transparent p-0" />
              <Button variant="outline" className="px-4">USDG</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Số dư: 350.00 USDG</p>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="icon" className="rounded-full"><ArrowDownUp className="w-4 h-4" /></Button>
          </div>

          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Đến</p>
            <div className="flex gap-3">
              <Input placeholder="0.00" className="text-2xl font-bold border-0 bg-transparent p-0" />
              <Button variant="outline" className="px-4">GAO</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Số dư: 45.00 GAO</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Tỷ lệ</span><span>1 USDG = 0.268 GAO</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phí giao dịch</span><span>0.3%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Trượt giá tối đa</span><span>0.5%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nhận tối thiểu</span><span>26.6 GAO</span></div>
          </div>

          <Button className="w-full gradient-primary text-lg py-6">Swap</Button>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
            <p className="text-xs text-warning">Giá có thể thay đổi. Kiểm tra tỷ lệ trước khi xác nhận.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default TraderSwap;
