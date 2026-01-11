import { supabase } from '@/lib/supabase';

// ====== DEMO MODE - Sử dụng localStorage thay vì Supabase ======
export const DEMO_MODE = true; // Bật mode demo

const DEMO_STORAGE_KEY = 'utopia_demo_data';

// Default demo data
const getDefaultDemoData = () => ({
    user_assets: {
        usdg_balance: 1000,
        reputation_points: 1500,
        level: 5,
        xp: 2250,
        total_profit_loss: 250,
    },
    farmer_data: {
        seed_warehouse: { GAO: 10, FRUIT: 5, VEG: 8, GRAIN: 12 },
        harvest_warehouse: {
            GAO: { amount: 25, cost_basis: 50 },
            FRUIT: { amount: 15, cost_basis: 45 },
            VEG: { amount: 20, cost_basis: 30 },
            GRAIN: { amount: 30, cost_basis: 35 },
        },
        farm_plots: [
            { id: 1, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 2, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 3, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 4, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 5, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 6, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 7, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
            { id: 8, status: 'empty', seedType: null, plantedAt: null, harvestTime: 120 },
        ],
        pool_state: {
            'GAO/USDG': { token_reserve: 10000, usdg_reserve: 10000 },
            'FRUIT/USDG': { token_reserve: 8500, usdg_reserve: 10000 },
            'VEG/USDG': { token_reserve: 12000, usdg_reserve: 10000 },
            'GRAIN/USDG': { token_reserve: 9500, usdg_reserve: 10000 },
        },
        liquidity_positions: {
            'GAO/USDG': { lp_amount: 50, staked_lp: 30, sim_earned: 12.5 },
            'FRUIT/USDG': { lp_amount: 25, staked_lp: 20, sim_earned: 8.3 },
            'VEG/USDG': { lp_amount: 40, staked_lp: 35, sim_earned: 15.7 },
            'GRAIN/USDG': { lp_amount: 30, staked_lp: 25, sim_earned: 10.2 },
        },
        total_sim_earned: 46.7,
    },
    activity_history: [
        { activity_type: 'harvest', token_type: 'GAO', amount: 5, created_at: new Date().toISOString() },
        { activity_type: 'stake_lp', token_type: 'GAO', amount: 10, created_at: new Date(Date.now() - 3600000).toISOString() },
        { activity_type: 'add_liquidity', token_type: 'FRUIT', amount: 25, created_at: new Date(Date.now() - 7200000).toISOString() },
        { activity_type: 'claim_sim', token_type: 'VEG', amount: 5.5, created_at: new Date(Date.now() - 10800000).toISOString() },
    ],
});

// Demo data helper functions
function getDemoData() {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading demo data:', e);
    }
    // Initialize with default data
    const defaultData = getDefaultDemoData();
    saveDemoData(defaultData);
    return defaultData;
}

function saveDemoData(data: ReturnType<typeof getDefaultDemoData>) {
    try {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving demo data:', e);
    }
}

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
    // DEMO MODE: Use localStorage
    if (DEMO_MODE) {
        const demoData = getDemoData();
        return demoData.user_assets as UserAssets;
    }

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
    // DEMO MODE: Use localStorage
    if (DEMO_MODE) {
        const demoData = getDemoData();
        demoData.user_assets = { ...demoData.user_assets, ...updates };
        saveDemoData(demoData);
        console.log('DEMO: updateUserAssets saved:', updates);
        return true;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('updateUserAssets: No user logged in!');
        return false;
    }

    console.log('updateUserAssets: Saving for user', user.id, 'with updates:', updates);

    const { error } = await supabase
        .from('user_assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating user assets:', error);
        return false;
    }

    console.log('updateUserAssets: Success!');
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
    // DEMO MODE: Use localStorage
    if (DEMO_MODE) {
        const demoData = getDemoData();
        return demoData.farmer_data as unknown as FarmerData;
    }

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
    // DEMO MODE: Use localStorage
    if (DEMO_MODE) {
        const demoData = getDemoData();
        demoData.farmer_data = { ...demoData.farmer_data, ...updates };
        saveDemoData(demoData);
        console.log('DEMO: updateFarmerData saved:', updates);
        return true;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('updateFarmerData: No user logged in!');
        return false;
    }

    console.log('updateFarmerData: Saving for user', user.id, 'with updates:', updates);

    const { error } = await supabase
        .from('farmer_data')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating farmer data:', error);
        return false;
    }

    console.log('updateFarmerData: Success!');
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
    // DEMO MODE: Use localStorage
    if (DEMO_MODE) {
        const demoData = getDemoData();
        demoData.activity_history.unshift({
            activity_type: activityType,
            token_type: tokenType || '',
            amount: amount || 0,
            created_at: new Date().toISOString(),
        });
        // Keep only last 20 activities
        demoData.activity_history = demoData.activity_history.slice(0, 20);
        saveDemoData(demoData);
        console.log('DEMO: recordFarmerActivity:', activityType, tokenType, amount);
        return true;
    }

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
    // DEMO MODE: Use localStorage
    if (DEMO_MODE) {
        const demoData = getDemoData();
        return demoData.activity_history.slice(0, limit);
    }

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

// =====================================================
// PRICE HISTORY & REAL-TIME TRACKING
// =====================================================

export interface PriceSnapshot {
    timestamp: string;
    prices: Record<string, number>;
}

export async function savePriceSnapshot(prices: Record<string, number>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('price_history')
        .insert({
            user_id: user.id,
            prices,
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error saving price snapshot:', error);
        return false;
    }

    return true;
}

export async function getPriceHistory(limit = 100): Promise<PriceSnapshot[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching price history:', error);
        return [];
    }

    return (data || []).map(row => ({
        timestamp: row.created_at,
        prices: row.prices
    }));
}

// =====================================================
// SIM REWARDS ACCUMULATION
// =====================================================

export async function accumulateSimRewards(simAmount: number, poolPair: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const farmer = await getFarmerData();
    if (!farmer) return false;

    const currentPosition = farmer.liquidity_positions[poolPair];
    if (!currentPosition) return false;

    const updatedPosition = {
        ...currentPosition,
        sim_earned: currentPosition.sim_earned + simAmount
    };

    const updatedPositions = {
        ...farmer.liquidity_positions,
        [poolPair]: updatedPosition
    };

    return updateFarmerData({ liquidity_positions: updatedPositions });
}

export async function batchAccumulateSimRewards(
    rewards: Array<{ poolPair: string; simAmount: number }>
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const farmer = await getFarmerData();
    if (!farmer) return false;

    const updatedPositions = { ...farmer.liquidity_positions };

    rewards.forEach(({ poolPair, simAmount }) => {
        if (updatedPositions[poolPair]) {
            updatedPositions[poolPair] = {
                ...updatedPositions[poolPair],
                sim_earned: updatedPositions[poolPair].sim_earned + simAmount
            };
        }
    });

    return updateFarmerData({ liquidity_positions: updatedPositions });
}

// =====================================================
// POSITION TRACKING WITH ENTRY PRICES
// =====================================================

export interface PositionEntry {
    poolPair: string;
    entryPrice: number;
    entryTimestamp: string;
    tokenAmount: number;
    usdgAmount: number;
}

export async function savePositionEntry(entry: PositionEntry): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const farmer = await getFarmerData();
    if (!farmer) return false;

    // Store entry info in farmer_data metadata
    const currentMetadata: Record<string, PositionEntry> = (farmer as unknown as { position_entries?: Record<string, PositionEntry> }).position_entries || {};
    currentMetadata[entry.poolPair] = entry;

    const { error } = await supabase
        .from('farmer_data')
        .update({
            position_entries: currentMetadata,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error saving position entry:', error);
        return false;
    }

    return true;
}

export async function getPositionEntries(): Promise<Record<string, PositionEntry>> {
    const farmer = await getFarmerData();
    if (!farmer) return {};

    return (farmer as never)['position_entries'] || {};
}

// =====================================================
// XP AND LEVEL SYSTEM
// =====================================================

const XP_REWARDS: Record<string, number> = {
    'buy_seed': 5,
    'plant': 10,
    'harvest': 20,
    'add_liquidity': 30,
    'stake_lp': 15,
    'claim_sim': 25,
};

export async function addXpForAction(actionType: string): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
    const assets = await getUserAssets();
    if (!assets) return { newXp: 0, newLevel: 1, leveledUp: false };

    const xpGain = XP_REWARDS[actionType] || 5;
    const newXp = (assets.xp || 0) + xpGain;

    // Calculate level (500 XP per level)
    const currentLevel = assets.level || 1;
    const newLevel = Math.floor(newXp / 500) + 1;
    const leveledUp = newLevel > currentLevel;

    await updateUserAssets({
        xp: newXp,
        level: newLevel,
        reputation_points: assets.reputation_points + (leveledUp ? 100 : 10)
    });

    return { newXp, newLevel, leveledUp };
}

// =====================================================
// REAL-TIME SYNC UTILITIES
// =====================================================

export async function syncFarmerDataToDatabase(): Promise<boolean> {
    const farmer = await getFarmerData();
    if (!farmer) return false;

    // Just touch the updated_at to trigger sync
    return updateFarmerData({});
}
