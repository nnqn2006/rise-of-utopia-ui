import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy-loaded Pages for code-splitting
const Landing = React.lazy(() => import("./pages/Landing"));
const Auth = React.lazy(() => import("./pages/Auth"));
const FarmerDashboard = React.lazy(() => import("./pages/farmer/Dashboard"));
const FarmerFarm = React.lazy(() => import("./pages/farmer/Farm"));
const FarmerLiquidity = React.lazy(() => import("./pages/farmer/Liquidity"));
const FarmerPortfolio = React.lazy(() => import("./pages/farmer/Portfolio"));
const TraderDashboard = React.lazy(() => import("./pages/trader/Dashboard"));
const TraderSwap = React.lazy(() => import("./pages/trader/Swap"));
const TraderStore = React.lazy(() => import("./pages/trader/Store"));
const TraderPortfolio = React.lazy(() => import("./pages/trader/Portfolio"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
