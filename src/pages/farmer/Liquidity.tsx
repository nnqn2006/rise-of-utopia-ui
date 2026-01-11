import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Droplets, AlertTriangle, TrendingUp, Coins, Lock, Plus, Minus, Loader2 } from "lucide-react";
import {
  getUserAssets,
  getFarmerData,
  updateFarmerData,
  updateUserAssets,
  recordFarmerActivity,
  type LiquidityPosition,
} from "@/services/gameDataService";

// Default pools data
const defaultPools = [
  { pair: "GAO/USDG", tvl: "125,000", apy: "42.5%" },
  { pair: "FRUIT/USDG", tvl: "85,000", apy: "38.2%" },
  { pair: "VEG/USDG", tvl: "45,000", apy: "55.8%" },
  { pair: "GRAIN/USDG", tvl: "67,000", apy: "48.5%" },
];

const FarmerLiquidity = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [usdgBalance, setUsdgBalance] = useState(100);
  const [liquidityPositions, setLiquidityPositions] = useState<Record<string, LiquidityPosition>>({
    "GAO/USDG": { lp_amount: 0, staked_lp: 0, sim_earned: 0 },
    "FRUIT/USDG": { lp_amount: 0, staked_lp: 0, sim_earned: 0 },
    "VEG/USDG": { lp_amount: 0, staked_lp: 0, sim_earned: 0 },
    "GRAIN/USDG": { lp_amount: 0, staked_lp: 0, sim_earned: 0 },
  });

  // Input states for each pool
  const [addAmounts, setAddAmounts] = useState<Record<string, { token: string; usdg: string }>>({});
  const [stakeAmounts, setStakeAmounts] = useState<Record<string, string>>({});

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [assets, farmer] = await Promise.all([
          getUserAssets(),
          getFarmerData()
        ]);

        if (assets) {
          setUsdgBalance(assets.usdg_balance);
        }

        if (farmer?.liquidity_positions) {
          setLiquidityPositions(farmer.liquidity_positions);
        }
      } catch (error) {
        console.error('Error loading liquidity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle add liquidity
  const handleAddLiquidity = async (poolPair: string) => {
    const amounts = addAmounts[poolPair];
    if (!amounts?.token || !amounts?.usdg) return;

    const tokenAmount = parseFloat(amounts.token);
    const usdgAmount = parseFloat(amounts.usdg);

    if (isNaN(tokenAmount) || isNaN(usdgAmount) || tokenAmount <= 0 || usdgAmount <= 0) return;
    if (usdgAmount > usdgBalance) {
      alert('Số dư USDG không đủ!');
      return;
    }

    // Calculate LP tokens received (simplified: sqrt(token * usdg))
    const lpReceived = Math.sqrt(tokenAmount * usdgAmount);

    const newPosition = {
      ...liquidityPositions[poolPair],
      lp_amount: liquidityPositions[poolPair].lp_amount + lpReceived,
    };

    const newPositions = { ...liquidityPositions, [poolPair]: newPosition };
    const newBalance = usdgBalance - usdgAmount;

    setLiquidityPositions(newPositions);
    setUsdgBalance(newBalance);
    setAddAmounts({ ...addAmounts, [poolPair]: { token: '', usdg: '' } });

    // Save to Supabase
    await updateFarmerData({ liquidity_positions: newPositions });
    await updateUserAssets({ usdg_balance: newBalance });
    await recordFarmerActivity('add_liquidity', poolPair.split('/')[0], lpReceived, {
      token_amount: tokenAmount,
      usdg_amount: usdgAmount
    });
  };

  // Handle stake LP
  const handleStake = async (poolPair: string) => {
    const amount = parseFloat(stakeAmounts[poolPair] || '0');
    if (amount <= 0) return;

    const position = liquidityPositions[poolPair];
    const availableToStake = position.lp_amount - position.staked_lp;

    if (amount > availableToStake) {
      alert('Không đủ LP để stake!');
      return;
    }

    const newPosition = {
      ...position,
      staked_lp: position.staked_lp + amount,
    };

    const newPositions = { ...liquidityPositions, [poolPair]: newPosition };
    setLiquidityPositions(newPositions);
    setStakeAmounts({ ...stakeAmounts, [poolPair]: '' });

    // Save to Supabase
    await updateFarmerData({ liquidity_positions: newPositions });
    await recordFarmerActivity('stake_lp', poolPair.split('/')[0], amount);
  };

  // Handle unstake LP
  const handleUnstake = async (poolPair: string) => {
    const position = liquidityPositions[poolPair];
    if (position.staked_lp <= 0) return;

    const newPosition = {
      ...position,
      staked_lp: 0,
    };

    const newPositions = { ...liquidityPositions, [poolPair]: newPosition };
    setLiquidityPositions(newPositions);

    // Save to Supabase
    await updateFarmerData({ liquidity_positions: newPositions });
    await recordFarmerActivity('unstake_lp', poolPair.split('/')[0], position.staked_lp);
  };

  // Handle claim SIM
  const handleClaimSim = async (poolPair: string) => {
    const position = liquidityPositions[poolPair];
    if (position.sim_earned <= 0) return;

    const simToClaim = position.sim_earned;
    const newPosition = {
      ...position,
      sim_earned: 0,
    };

    const newPositions = { ...liquidityPositions, [poolPair]: newPosition };
    setLiquidityPositions(newPositions);

    // Save to Supabase
    await updateFarmerData({
      liquidity_positions: newPositions,
      total_sim_earned: simToClaim // Add to total
    });
    await recordFarmerActivity('claim_sim', poolPair.split('/')[0], simToClaim);
  };

  if (isLoading) {
    return (
      <DashboardLayout mode="farmer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode="farmer">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hồ thanh khoản</h1>
            <p className="text-muted-foreground">Cung cấp thanh khoản và stake LP Token để nhận phần thưởng SIM</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-primary/10">
            <span className="text-sm text-muted-foreground">Số dư: </span>
            <span className="font-bold text-primary">${usdgBalance.toFixed(2)} USDG</span>
          </div>
        </div>

        {/* Impermanent Loss Warning */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-warning">Cảnh báo tổn thất tạm thời (Impermanent Loss)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Khi cung cấp thanh khoản, giá trị tài sản có thể biến động so với việc giữ nguyên.
                Tìm hiểu kỹ trước khi tham gia.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pool List */}
        <div className="space-y-4">
          {defaultPools.map((pool, index) => {
            const position = liquidityPositions[pool.pair] || { lp_amount: 0, staked_lp: 0, sim_earned: 0 };
            const amounts = addAmounts[pool.pair] || { token: '', usdg: '' };
            const stakeAmount = stakeAmounts[pool.pair] || '';

            return (
              <Card key={index} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-primary-foreground" />
                      </div>
                      {pool.pair}
                    </CardTitle>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      APY {pool.apy}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pool Stats */}
                  <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">TVL</p>
                      <p className="font-semibold text-foreground">${pool.tvl}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LP của bạn</p>
                      <p className="font-semibold text-foreground">{position.lp_amount.toFixed(2)} LP</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Đã stake</p>
                      <p className="font-semibold text-foreground">{position.staked_lp.toFixed(2)} LP</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SIM kiếm được</p>
                      <p className="font-semibold gradient-text">{position.sim_earned.toFixed(2)} SIM</p>
                    </div>
                  </div>

                  {/* Add Liquidity Widget */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border">
                      <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-success" />
                        Nạp thanh khoản
                      </p>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="0.00"
                            className="flex-1"
                            type="number"
                            value={amounts.token}
                            onChange={(e) => setAddAmounts({
                              ...addAmounts,
                              [pool.pair]: { ...amounts, token: e.target.value }
                            })}
                          />
                          <Button variant="outline" size="sm" className="px-3">
                            {pool.pair.split("/")[0]}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="0.00"
                            className="flex-1"
                            type="number"
                            value={amounts.usdg}
                            onChange={(e) => setAddAmounts({
                              ...addAmounts,
                              [pool.pair]: { ...amounts, usdg: e.target.value }
                            })}
                          />
                          <Button variant="outline" size="sm" className="px-3">
                            USDG
                          </Button>
                        </div>
                        <Button
                          className="w-full gradient-primary"
                          onClick={() => handleAddLiquidity(pool.pair)}
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Nạp & Nhận LP Token
                        </Button>
                      </div>
                    </div>

                    {/* Stake LP Widget */}
                    <div className="p-4 rounded-xl border border-border">
                      <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Stake LP Token nhận SIM
                      </p>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="0.00"
                            className="flex-1"
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmounts({
                              ...stakeAmounts,
                              [pool.pair]: e.target.value
                            })}
                          />
                          <Button variant="outline" size="sm" className="px-3">
                            LP
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 gradient-primary"
                            onClick={() => handleStake(pool.pair)}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Stake
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleUnstake(pool.pair)}
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Unstake
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleClaimSim(pool.pair)}
                          disabled={position.sim_earned <= 0}
                        >
                          Thu hoạch {position.sim_earned.toFixed(2)} SIM
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* SIM Counter */}
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">SIM đang tích lũy</p>
                        <p className="text-2xl font-bold gradient-text">{position.sim_earned.toFixed(2)} SIM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tốc độ farm</p>
                        <p className="text-lg font-semibold text-foreground">
                          ~{(position.staked_lp * 0.0001).toFixed(4)} SIM/giờ
                        </p>
                      </div>
                    </div>
                    <Progress value={position.staked_lp > 0 ? 65 : 0} className="mt-3 h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerLiquidity;
