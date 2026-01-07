import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerFarm from "./pages/farmer/Farm";
import FarmerLiquidity from "./pages/farmer/Liquidity";
import FarmerPortfolio from "./pages/farmer/Portfolio";
import TraderDashboard from "./pages/trader/Dashboard";
import TraderSwap from "./pages/trader/Swap";
import TraderStore from "./pages/trader/Store";
import TraderPortfolio from "./pages/trader/Portfolio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/farm" element={<FarmerFarm />} />
          <Route path="/farmer/liquidity" element={<FarmerLiquidity />} />
          <Route path="/farmer/portfolio" element={<FarmerPortfolio />} />
          
          {/* Trader Routes */}
          <Route path="/trader/dashboard" element={<TraderDashboard />} />
          <Route path="/trader/swap" element={<TraderSwap />} />
          <Route path="/trader/store" element={<TraderStore />} />
          <Route path="/trader/portfolio" element={<TraderPortfolio />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
