import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Sprout, TrendingUp, AlertTriangle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"farmer" | "trader">("farmer");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(role === "farmer" ? "/farmer/dashboard" : "/trader/dashboard");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, always go to farmer dashboard - user can switch with toggle
    navigate("/farmer/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">R</span>
            </div>
            <CardTitle className="text-2xl gradient-text">Rise of Ledger Utopia</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="register" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              </TabsList>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Họ và tên</Label>
                      <Input id="fullname" placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="farmer_pro" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="flex gap-2">
                      <div className="w-20 flex items-center justify-center bg-muted rounded-md text-sm text-muted-foreground">
                        +84
                      </div>
                      <Input id="phone" placeholder="912345678" className="flex-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <Input id="password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label>Chọn vai trò</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value) => setRole(value as "farmer" | "trader")}
                      className="grid grid-cols-2 gap-4"
                    >
                      <Label
                        htmlFor="farmer"
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          role === "farmer"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <RadioGroupItem value="farmer" id="farmer" className="sr-only" />
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                          <Sprout className="w-5 h-5 text-success" />
                        </div>
                        <span className="font-semibold text-foreground">Nông dân</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Trồng trọt & cung cấp thanh khoản
                        </span>
                      </Label>
                      <Label
                        htmlFor="trader"
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          role === "trader"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <RadioGroupItem value="trader" id="trader" className="sr-only" />
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="font-semibold text-foreground">Thương nhân</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Giao dịch & đầu cơ nông sản
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full gradient-primary">
                    Tạo tài khoản
                  </Button>
                </form>
              </TabsContent>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginUsername">Username hoặc SĐT</Label>
                    <Input id="loginUsername" placeholder="farmer_pro hoặc 0912345678" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Mật khẩu</Label>
                    <Input id="loginPassword" type="password" placeholder="••••••••" />
                  </div>

                  <Button type="submit" className="w-full gradient-primary">
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="mt-6 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-xs text-warning">
                Đây là ứng dụng mô phỏng để học tập - Không sử dụng tiền thật
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
