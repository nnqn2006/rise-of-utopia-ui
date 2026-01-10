import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp } from "lucide-react";
import { AuthService } from "@/services/auth.service";

export function ModeToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const isFarmer = location.pathname.startsWith("/farmer");

  // Only show toggle if user has both roles
  const hasBothRoles = AuthService.hasBothRoles();
  if (!hasBothRoles) {
    return null;
  }

  const handleToggle = () => {
    const currentPage = location.pathname.split("/").pop() || "dashboard";
    if (isFarmer) {
      // Switch to trader
      const traderPage = currentPage === "farm" ? "swap" : currentPage === "liquidity" ? "swap" : currentPage;
      navigate(`/trader/${traderPage}`);
    } else {
      // Switch to farmer
      const farmerPage = currentPage === "swap" ? "farm" : currentPage === "store" ? "farm" : currentPage;
      navigate(`/farmer/${farmerPage}`);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      className="fixed bottom-6 right-6 z-50 gap-2 rounded-full px-4 py-2 border-primary/50 bg-card hover:bg-primary/10"
    >
      {isFarmer ? (
        <>
          <TrendingUp className="w-4 h-4 text-secondary" />
          <span>Chuyển sang Trader</span>
        </>
      ) : (
        <>
          <Sprout className="w-4 h-4 text-success" />
          <span>Chuyển sang Farmer</span>
        </>
      )}
    </Button>
  );
}

