import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sprout,
  Clock,
  Package,
  ShoppingBag,
  Coins,
  Warehouse,
  Leaf,
  Check,
  X,
} from "lucide-react";

// Token data with harvest time and price
const tokenSeeds = [
  {
    symbol: "GAO",
    name: "Gạo",
    harvestTime: 120, // seconds (2 minutes for demo)
    price: 10,
    image: "/tokens/gao_new.png",
    color: "#8b5cf6",
  },
  {
    symbol: "FRUIT",
    name: "Trái cây",
    harvestTime: 180, // 3 minutes
    price: 15,
    image: "/tokens/fruit.png",
    color: "#ef4444",
  },
  {
    symbol: "VEG",
    name: "Rau củ",
    harvestTime: 150, // 2.5 minutes
    price: 12,
    image: "/tokens/veg.png",
    color: "#22c55e",
  },
  {
    symbol: "GRAIN",
    name: "Ngũ cốc",
    harvestTime: 90, // 1.5 minutes
    price: 8,
    image: "/tokens/grain.png",
    color: "#f59e0b",
  },
];

interface FarmPlot {
  id: number;
  status: "empty" | "growing" | "ready";
  seedType: string | null;
  plantedAt: number | null;
  harvestTime: number;
}

interface SeedWarehouse {
  [key: string]: number;
}

interface HarvestWarehouse {
  [key: string]: { amount: number; costBasis: number };
}

const FarmerFarm = () => {
  // User balance
  const [usdgBalance, setUsdgBalance] = useState(500);

  // Seed shop dialog
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<typeof tokenSeeds[0] | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);

  // Seed warehouse dialog
  const [plantDialogOpen, setPlantDialogOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);

  // Warehouses
  const [seedWarehouse, setSeedWarehouse] = useState<SeedWarehouse>(() => {
    const saved = localStorage.getItem("seedWarehouse");
    return saved ? JSON.parse(saved) : { GAO: 5, FRUIT: 3, VEG: 2, GRAIN: 4 };
  });

  const [harvestWarehouse, setHarvestWarehouse] = useState<HarvestWarehouse>(() => {
    const saved = localStorage.getItem("harvestWarehouse");
    return saved ? JSON.parse(saved) : {};
  });

  // Farm plots (12 cells)
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>(() => {
    const saved = localStorage.getItem("farmPlots");
    if (saved) return JSON.parse(saved);
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      status: "empty" as const,
      seedType: null,
      plantedAt: null,
      harvestTime: 0,
    }));
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("seedWarehouse", JSON.stringify(seedWarehouse));
  }, [seedWarehouse]);

  useEffect(() => {
    localStorage.setItem("harvestWarehouse", JSON.stringify(harvestWarehouse));
  }, [harvestWarehouse]);

  useEffect(() => {
    localStorage.setItem("farmPlots", JSON.stringify(farmPlots));
  }, [farmPlots]);

  // Update growing plots every second
  useEffect(() => {
    const interval = setInterval(() => {
      setFarmPlots((plots) =>
        plots.map((plot) => {
          if (plot.status === "growing" && plot.plantedAt) {
            const elapsed = (Date.now() - plot.plantedAt) / 1000;
            if (elapsed >= plot.harvestTime) {
              return { ...plot, status: "ready" as const };
            }
          }
          return plot;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Buy seeds
  const handleBuySeed = () => {
    if (!selectedSeed) return;
    const totalCost = selectedSeed.price * buyQuantity;
    if (totalCost > usdgBalance) return;

    setUsdgBalance((prev) => prev - totalCost);
    setSeedWarehouse((prev) => ({
      ...prev,
      [selectedSeed.symbol]: (prev[selectedSeed.symbol] || 0) + buyQuantity,
    }));
    setBuyDialogOpen(false);
    setBuyQuantity(1);
  };

  // Plant seed
  const handlePlantSeed = (seedSymbol: string) => {
    if (selectedPlot === null) return;
    if (!seedWarehouse[seedSymbol] || seedWarehouse[seedSymbol] <= 0) return;

    const seedData = tokenSeeds.find((s) => s.symbol === seedSymbol);
    if (!seedData) return;

    setSeedWarehouse((prev) => ({
      ...prev,
      [seedSymbol]: prev[seedSymbol] - 1,
    }));

    setFarmPlots((plots) =>
      plots.map((plot) =>
        plot.id === selectedPlot
          ? {
            ...plot,
            status: "growing" as const,
            seedType: seedSymbol,
            plantedAt: Date.now(),
            harvestTime: seedData.harvestTime,
          }
          : plot
      )
    );
    setPlantDialogOpen(false);
    setSelectedPlot(null);
  };

  // Harvest
  const handleHarvest = (plotId: number) => {
    const plot = farmPlots.find((p) => p.id === plotId);
    if (!plot || plot.status !== "ready" || !plot.seedType) return;

    const seedData = tokenSeeds.find((s) => s.symbol === plot.seedType);
    if (!seedData) return;

    // Add to harvest warehouse
    setHarvestWarehouse((prev) => ({
      ...prev,
      [plot.seedType!]: {
        amount: (prev[plot.seedType!]?.amount || 0) + 1,
        costBasis: (prev[plot.seedType!]?.costBasis || 0) + seedData.price,
      },
    }));

    // Reset plot
    setFarmPlots((plots) =>
      plots.map((p) =>
        p.id === plotId
          ? { ...p, status: "empty" as const, seedType: null, plantedAt: null, harvestTime: 0 }
          : p
      )
    );
  };

  // Get remaining time for growing plot
  const getRemainingTime = (plot: FarmPlot) => {
    if (plot.status !== "growing" || !plot.plantedAt) return "";
    const elapsed = (Date.now() - plot.plantedAt) / 1000;
    const remaining = Math.max(0, plot.harvestTime - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle plot click
  const handlePlotClick = (plot: FarmPlot) => {
    if (plot.status === "empty") {
      setSelectedPlot(plot.id);
      setPlantDialogOpen(true);
    } else if (plot.status === "ready") {
      handleHarvest(plot.id);
    }
  };

  const getPlotStyle = (status: string) => {
    switch (status) {
      case "growing":
        return "bg-green-500/20 border-green-500/50";
      case "ready":
        return "bg-yellow-500/20 border-yellow-500/50 animate-pulse cursor-pointer";
      default:
        return "bg-muted/50 border-dashed border-muted-foreground/30 hover:border-primary/50";
    }
  };

  const getSeedImage = (symbol: string | null) => {
    if (!symbol) return null;
    const seed = tokenSeeds.find((s) => s.symbol === symbol);
    return seed?.image;
  };

  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6">
        {/* Page Title + Balance */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nông trại</h1>
            <p className="text-muted-foreground">
              Quản lý đất đai và thu hoạch nông sản của bạn
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <span className="text-sm text-muted-foreground">Số dư: </span>
              <span className="font-bold text-primary">{usdgBalance} USDG</span>
            </div>
            <Button
              className="gradient-primary gap-2"
              onClick={() => setIsShopOpen(true)}
            >
              <ShoppingBag className="w-4 h-4" />
              Cửa hàng hạt giống
            </Button>
          </div>
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
                  onClick={() => handlePlotClick(plot)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getPlotStyle(
                    plot.status
                  )}`}
                >
                  {plot.status === "empty" && (
                    <>
                      <span className="text-3xl text-muted-foreground">+</span>
                      <p className="text-xs text-muted-foreground mt-1">Trống</p>
                    </>
                  )}
                  {plot.status === "growing" && plot.seedType && (
                    <>
                      <img
                        src={getSeedImage(plot.seedType)}
                        alt={plot.seedType}
                        className="w-12 h-12 object-contain"
                      />
                      <p className="text-xs font-bold text-foreground mt-1">
                        {plot.seedType}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                        <Clock className="w-3 h-3" />
                        {getRemainingTime(plot)}
                      </div>
                    </>
                  )}
                  {plot.status === "ready" && plot.seedType && (
                    <>
                      <img
                        src={getSeedImage(plot.seedType)}
                        alt={plot.seedType}
                        className="w-12 h-12 object-contain"
                      />
                      <p className="text-xs font-bold text-foreground mt-1">
                        {plot.seedType}
                      </p>
                      <p className="text-xs text-yellow-500 font-bold mt-1">
                        Thu hoạch!
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warehouses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seed Warehouse */}
          <Card className="glass-card border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader className="border-b border-green-500/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-green-400">Kho hạt giống</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {tokenSeeds.map((seed) => (
                  <div
                    key={seed.symbol}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${seed.color}20` }}
                      >
                        <img
                          src={seed.image}
                          alt={seed.symbol}
                          className="w-7 h-7 object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{seed.symbol}</p>
                        <p className="text-xs text-muted-foreground">{seed.name}</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {seedWarehouse[seed.symbol] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Harvest Warehouse */}
          <Card className="glass-card border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader className="border-b border-amber-500/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Warehouse className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-amber-400">Kho nông sản</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {tokenSeeds.map((seed) => {
                  const harvest = harvestWarehouse[seed.symbol];
                  return (
                    <div
                      key={seed.symbol}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${seed.color}20` }}
                        >
                          <img
                            src={seed.image}
                            alt={seed.symbol}
                            className="w-7 h-7 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{seed.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            Số lượng: {harvest?.amount || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {harvest?.costBasis || 0} USDG
                        </p>
                        <p className="text-xs text-muted-foreground">Giá vốn</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seed Shop Dialog */}
        <Dialog open={isShopOpen} onOpenChange={setIsShopOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Cửa hàng hạt giống
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {tokenSeeds.map((seed) => (
                <div
                  key={seed.symbol}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${seed.color}20` }}
                    >
                      <img
                        src={seed.image}
                        alt={seed.symbol}
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">{seed.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        ⏱️ {Math.floor(seed.harvestTime / 60)}:{(seed.harvestTime % 60)
                          .toString()
                          .padStart(2, "0")}{" "}
                        thu hoạch
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2 font-bold"
                    onClick={() => {
                      setSelectedSeed(seed);
                      setBuyDialogOpen(true);
                    }}
                  >
                    <Coins className="w-4 h-4" />
                    {seed.price} USDG
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Buy Seed Dialog */}
        <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Mua hạt giống {selectedSeed?.symbol}</DialogTitle>
            </DialogHeader>
            {selectedSeed && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <img
                    src={selectedSeed.image}
                    alt={selectedSeed.symbol}
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <p className="font-bold text-xl">{selectedSeed.symbol}</p>
                    <p className="text-sm text-muted-foreground">{selectedSeed.name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    min={1}
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span className="font-bold text-xl text-primary">
                      {selectedSeed.price * buyQuantity} USDG
                    </span>
                  </div>
                  {selectedSeed.price * buyQuantity > usdgBalance && (
                    <p className="text-destructive text-sm mt-2">Số dư không đủ!</p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
                <X className="w-4 h-4 mr-1" />
                Thoát
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleBuySeed}
                disabled={!selectedSeed || selectedSeed.price * buyQuantity > usdgBalance}
              >
                <Check className="w-4 h-4 mr-1" />
                Mua
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Plant Seed Dialog */}
        <Dialog open={plantDialogOpen} onOpenChange={setPlantDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                Kho hạt giống - Chọn để trồng
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {tokenSeeds.map((seed) => {
                const quantity = seedWarehouse[seed.symbol] || 0;
                return (
                  <div
                    key={seed.symbol}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${quantity > 0
                      ? "bg-muted/50 hover:bg-muted cursor-pointer"
                      : "bg-muted/20 opacity-50"
                      }`}
                    onClick={() => quantity > 0 && handlePlantSeed(seed.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${seed.color}20` }}
                      >
                        <img
                          src={seed.image}
                          alt={seed.symbol}
                          className="w-9 h-9 object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{seed.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          Số lượng: {quantity}
                        </p>
                      </div>
                    </div>
                    {quantity > 0 && (
                      <Button size="sm" className="gradient-primary">
                        Trồng
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlantDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FarmerFarm;
