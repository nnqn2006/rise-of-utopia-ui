import { supabase } from '@/lib/supabase';

// =====================================================
// TYPES
// =====================================================

export interface UserAssets {
    usdg_balance: number;
    land_area: number;
    reputation_points: number;
    reputation_level: string;
    xp: number;
    level: number;
}

export interface TokenBalance {
    amount: number;
    cost_basis: number;
}

export interface InventoryItem {
    amount: number;
    avg_price: number;
}

export interface PoolState {
    token_reserve: number;
    usdg_reserve: number;
    total_lp?: number;
}

export interface TraderData {
    token_balances: Record<string, TokenBalance>;
    inventory: Record<string, InventoryItem>;
    pool_state: Record<string, PoolState>;
    total_trades: number;
    total_volume: number;
    total_profit_loss: number;
}

export interface FarmPlot {
    id: number;
    status: 'empty' | 'growing' | 'ready';
    seed_type: string | null;
    planted_at: string | null;
    harvest_time: number;
}

export interface LiquidityPosition {
    lp_amount: number;
    staked_lp: number;
    sim_earned: number;
}

export interface FarmerData {
    farm_plots: FarmPlot[];
    seed_warehouse: Record<string, number>;
    harvest_warehouse: Record<string, TokenBalance>;
    pool_state: Record<string, PoolState>;
    liquidity_positions: Record<string, LiquidityPosition>;
    total_harvests: number;
    total_sim_earned: number;
}

// =====================================================
// USER ASSETS
// =====================================================

export async function getUserAssets(): Promise<UserAssets | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user assets:', error);
        return null;
    }

    return data;
}

export async function updateUserAssets(updates: Partial<UserAssets>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('user_assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating user assets:', error);
        return false;
    }

    return true;
}

export async function updateUSDGBalance(newBalance: number): Promise<boolean> {
    return updateUserAssets({ usdg_balance: newBalance });
}

// =====================================================
// TRADER DATA
// =====================================================

export async function getTraderData(): Promise<TraderData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('trader_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching trader data:', error);
        return null;
    }

    return data;
}

export async function updateTraderData(updates: Partial<TraderData>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('trader_data')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating trader data:', error);
        return false;
    }

    return true;
}

export async function recordSwap(
    fromToken: string,
    toToken: string,
    fromAmount: number,
    toAmount: number,
    slippage: number,
    profitLoss: number
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('trader_swap_history')
        .insert({
            user_id: user.id,
            from_token: fromToken,
            to_token: toToken,
            from_amount: fromAmount,
            to_amount: toAmount,
            slippage,
            profit_loss: profitLoss
        });

    if (error) {
        console.error('Error recording swap:', error);
        return false;
    }

    return true;
}

export async function getSwapHistory(limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('trader_swap_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching swap history:', error);
        return [];
    }

    return data || [];
}

// =====================================================
// FARMER DATA
// =====================================================

export async function getFarmerData(): Promise<FarmerData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('farmer_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching farmer data:', error);
        return null;
    }

    return data;
}

export async function updateFarmerData(updates: Partial<FarmerData>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('farmer_data')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating farmer data:', error);
        return false;
    }

    return true;
}

export async function updateFarmPlots(plots: FarmPlot[]): Promise<boolean> {
    return updateFarmerData({ farm_plots: plots });
}

export async function updateSeedWarehouse(seeds: Record<string, number>): Promise<boolean> {
    return updateFarmerData({ seed_warehouse: seeds });
}

export async function updateHarvestWarehouse(harvests: Record<string, TokenBalance>): Promise<boolean> {
    return updateFarmerData({ harvest_warehouse: harvests });
}

export async function updateLiquidityPositions(positions: Record<string, LiquidityPosition>): Promise<boolean> {
    return updateFarmerData({ liquidity_positions: positions });
}

export async function recordFarmerActivity(
    activityType: string,
    tokenType?: string,
    amount?: number,
    metadata?: object
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('farmer_activity_history')
        .insert({
            user_id: user.id,
            activity_type: activityType,
            token_type: tokenType,
            amount,
            metadata
        });

    if (error) {
        console.error('Error recording farmer activity:', error);
        return false;
    }

    return true;
}

export async function getFarmerActivityHistory(limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('farmer_activity_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching farmer activity history:', error);
        return [];
    }

    return data || [];
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export async function getAllUserData() {
    const [assets, trader, farmer] = await Promise.all([
        getUserAssets(),
        getTraderData(),
        getFarmerData()
    ]);

    return { assets, trader, farmer };
}
