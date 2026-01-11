import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Repeat, TrendingUp, Gift, Coins, Map, Award } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Repeat,
      title: "Giao dịch DEX",
      description: "Mua bán nông sản trên sàn phi tập trung với thanh khoản tức thì",
    },
    {
      icon: TrendingUp,
      title: "Đầu tư & Canh tác lợi nhuận",
      description: "Cung cấp thanh khoản, nhận LP Token và stake để kiếm phần thưởng SIM",
    },
    {
      icon: Gift,
      title: "Đổi thưởng thực",
      description: "Tích lũy điểm uy tín để đổi lấy phần thưởng và quyền lợi đặc biệt",
    },
  ];

  const starterAssets = [
    { icon: Coins, value: "100", unit: "USDG", label: "Số dư khởi điểm" },
    { icon: Map, value: "100", unit: "m²", label: "Diện tích đất" },
    { icon: Award, value: "1,000", unit: "điểm", label: "Uy tín ban đầu" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-xl font-bold gradient-text">Rise of Ledger</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo & Title */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <span className="text-5xl font-bold text-primary-foreground">R</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Rise of Ledger</span>
              <br />
              <span className="text-foreground">Utopia</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trải nghiệm thế giới GameFi – nơi nông nghiệp truyền thống được tái định hình bởi tài chính phi tập trung.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Starter Assets */}
          <Card className="glass-card mb-8 max-w-2xl mx-auto glow-primary">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center text-foreground">
                🎁 Tài sản tân thủ
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {starterAssets.map((asset, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                      <asset.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold gradient-text">
                      {asset.value}
                      <span className="text-sm ml-1 text-muted-foreground">{asset.unit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{asset.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <Button
            size="lg"
            className="gradient-primary text-lg px-8 py-6 rounded-xl glow-primary hover:opacity-90 transition-opacity"
            onClick={() => navigate("/auth")}
          >
            Bắt đầu chơi
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>© 2024 Rise of Ledger Utopia. Ứng dụng mô phỏng để học tập.</p>
      </footer>
    </div>
  );
};

export default Landing;
