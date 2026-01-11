/**
 * DeFi Calculator Service
 * Implements formulas for IL, APY, staking rewards, and pool calculations
 */

import { getTokenPrice } from './priceEngine';

// =====================================================
// IMPERMANENT LOSS CALCULATIONS
// =====================================================

/**
 * Calculate Impermanent Loss (IL) based on price change
 * Formula: IL = [2 × √(price_ratio) / (1 + price_ratio)] - 1
 * 
 * @param initialPrice - Price when liquidity was added
 * @param currentPrice - Current market price
 * @returns IL as a decimal (e.g., -0.02 = 2% loss)
 */
export function calculateImpermanentLoss(initialPrice: number, currentPrice: number): number {
    if (initialPrice <= 0 || currentPrice <= 0) return 0;

    const priceRatio = currentPrice / initialPrice;
    const sqrtRatio = Math.sqrt(priceRatio);

    // IL = [2 × √(price_ratio) / (1 + price_ratio)] - 1
    const il = (2 * sqrtRatio) / (1 + priceRatio) - 1;

    return il;
}

/**
 * Calculate IL as percentage
 */
export function calculateImpermanentLossPercent(initialPrice: number, currentPrice: number): number {
    const il = calculateImpermanentLoss(initialPrice, currentPrice);
    return Math.abs(il) * 100;
}

/**
 * Determine IL risk level
 */
export type ILRiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export function getILRiskLevel(ilPercent: number): ILRiskLevel {
    if (ilPercent < 1) return 'safe';
    if (ilPercent < 3) return 'low';
    if (ilPercent < 5) return 'medium';
    if (ilPercent < 10) return 'high';
    return 'critical';
}

export function getILRiskColor(riskLevel: ILRiskLevel): string {
    switch (riskLevel) {
        case 'safe': return '#22c55e'; // green
        case 'low': return '#84cc16'; // lime
        case 'medium': return '#eab308'; // yellow
        case 'high': return '#f97316'; // orange
        case 'critical': return '#ef4444'; // red
    }
}

// =====================================================
// APY/APR CALCULATIONS
// =====================================================

/**
 * Convert APR to APY with compounding
 * Formula: APY = (1 + APR/n)^n - 1
 * 
 * @param apr - Annual Percentage Rate as decimal (e.g., 0.4 = 40%)
 * @param compoundFrequency - Number of times compounded per year (365 = daily)
 * @returns APY as decimal
 */
export function aprToApy(apr: number, compoundFrequency: number = 365): number {
    if (apr <= 0 || compoundFrequency <= 0) return 0;

    return Math.pow(1 + apr / compoundFrequency, compoundFrequency) - 1;
}

/**
 * Convert APY to APR
 */
export function apyToApr(apy: number, compoundFrequency: number = 365): number {
    if (apy <= 0 || compoundFrequency <= 0) return 0;

    return compoundFrequency * (Math.pow(1 + apy, 1 / compoundFrequency) - 1);
}

/**
 * Format APY/APR as percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

// =====================================================
// STAKING REWARDS CALCULATIONS
// =====================================================

export interface StakingRewardParams {
    stakedAmount: number;     // Amount of LP tokens staked
    poolApy: number;          // Pool APY as decimal (e.g., 0.45 = 45%)
    durationHours: number;    // Time staked in hours
    totalPoolStake: number;   // Total LP tokens in pool
}

/**
 * Calculate staking rewards (SIM tokens earned)
 * 
 * @param params - Staking parameters
 * @returns SIM tokens earned
 */
export function calculateStakingRewards(params: StakingRewardParams): number {
    const { stakedAmount, poolApy, durationHours, totalPoolStake } = params;

    if (stakedAmount <= 0 || poolApy <= 0 || durationHours <= 0) return 0;

    // Calculate share of pool
    const poolShare = totalPoolStake > 0 ? stakedAmount / totalPoolStake : 1;

    // Convert hours to years fraction
    const yearFraction = durationHours / (365 * 24);

    // Base reward rate (SIM per LP per year)
    const baseRewardRate = 100; // 100 SIM per LP per year at 100% APY

    // Calculate rewards
    const rewards = stakedAmount * poolApy * yearFraction * baseRewardRate * (1 + poolShare * 0.1);

    return Math.max(0, rewards);
}

/**
 * Calculate SIM per hour rate
 */
export function calculateSimPerHour(stakedAmount: number, poolApy: number): number {
    const yearlyRewards = stakedAmount * poolApy * 100; // 100 SIM base rate
    const hourlyRewards = yearlyRewards / (365 * 24);
    return hourlyRewards;
}

// =====================================================
// POOL VALUE CALCULATIONS
// =====================================================

export interface LiquidityPosition {
    lpAmount: number;
    stakedLp: number;
    initialTokenPrice: number;
    tokenAmount: number;
    usdgAmount: number;
    entryTimestamp: Date;
}

export interface PoolValueResult {
    currentValue: number;         // Current USD value of position
    initialValue: number;         // Value at entry
    impermanentLoss: number;      // IL in USD
    impermanentLossPercent: number;
    unrealizedPnL: number;        // Profit/Loss excluding IL
    simEarned: number;            // SIM rewards
    netPnL: number;               // Total net P/L including rewards
    holdValue: number;            // What you'd have if you just held
}

/**
 * Calculate comprehensive pool value metrics
 */
export function calculatePoolValue(
    position: LiquidityPosition,
    currentTokenPrice: number,
    poolApy: number
): PoolValueResult {
    const { lpAmount, initialTokenPrice, tokenAmount, usdgAmount, entryTimestamp } = position;

    // Initial value
    const initialValue = tokenAmount * initialTokenPrice + usdgAmount;

    // Hold value (if we just held the tokens)
    const holdValue = tokenAmount * currentTokenPrice + usdgAmount;

    // Calculate IL
    const ilDecimal = calculateImpermanentLoss(initialTokenPrice, currentTokenPrice);
    const impermanentLossPercent = Math.abs(ilDecimal) * 100;

    // Current pool value (affected by IL)
    // In AMM, value = 2 * sqrt(tokenAmount * usdgAmount * priceRatio)
    const k = tokenAmount * usdgAmount;
    const priceRatio = currentTokenPrice / initialTokenPrice;
    const currentValue = 2 * Math.sqrt(k * priceRatio);

    // IL in USD
    const impermanentLoss = holdValue - currentValue;

    // Time staked
    const hoursStaked = (Date.now() - entryTimestamp.getTime()) / (1000 * 60 * 60);

    // Calculate SIM rewards
    const simEarned = calculateStakingRewards({
        stakedAmount: position.stakedLp,
        poolApy,
        durationHours: hoursStaked,
        totalPoolStake: 1000, // Simplified
    });

    // Assume 1 SIM = $0.1 for now
    const simValueUsd = simEarned * 0.1;

    // Net P/L
    const unrealizedPnL = currentValue - initialValue;
    const netPnL = unrealizedPnL + simValueUsd;

    return {
        currentValue,
        initialValue,
        impermanentLoss,
        impermanentLossPercent,
        unrealizedPnL,
        simEarned,
        netPnL,
        holdValue,
    };
}

// =====================================================
// POOL RATIO CALCULATIONS
// =====================================================

/**
 * Calculate pool ratio (token reserve vs USDG reserve)
 */
export function calculatePoolRatio(tokenReserve: number, usdgReserve: number): number {
    const total = tokenReserve + usdgReserve;
    if (total === 0) return 50;
    return (tokenReserve / total) * 100;
}

/**
 * Determine if pool is balanced (45-55% is considered balanced)
 */
export function isPoolBalanced(ratio: number): boolean {
    return ratio >= 45 && ratio <= 55;
}

/**
 * Get pool status based on ratio
 */
export function getPoolStatus(ratio: number): { status: string; color: string } {
    if (ratio >= 45 && ratio <= 55) {
        return { status: 'Cân bằng', color: '#22c55e' };
    } else if (ratio >= 35 && ratio <= 65) {
        return { status: 'Lệch nhẹ', color: '#eab308' };
    } else {
        return { status: 'Lệch nặng', color: '#ef4444' };
    }
}

// =====================================================
// PRICE IMPACT CALCULATIONS
// =====================================================

/**
 * Calculate price impact for a trade
 * Using constant product formula: x * y = k
 * 
 * @param amountIn - Amount being swapped
 * @param reserveIn - Reserve of input token
 * @param reserveOut - Reserve of output token
 * @returns Price impact as percentage
 */
export function calculatePriceImpact(
    amountIn: number,
    reserveIn: number,
    reserveOut: number
): number {
    if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) return 0;

    // Current price
    const currentPrice = reserveOut / reserveIn;

    // Amount out using constant product
    const k = reserveIn * reserveOut;
    const newReserveIn = reserveIn + amountIn;
    const newReserveOut = k / newReserveIn;
    const amountOut = reserveOut - newReserveOut;

    // Effective price
    const effectivePrice = amountOut / amountIn;

    // Price impact
    const priceImpact = ((currentPrice - effectivePrice) / currentPrice) * 100;

    return Math.abs(priceImpact);
}

/**
 * Get amount out for a swap
 */
export function getAmountOut(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    feePercent: number = 0.3
): number {
    if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0;

    // Apply fee
    const amountInWithFee = amountIn * (1 - feePercent / 100);

    // Constant product
    const k = reserveIn * reserveOut;
    const newReserveIn = reserveIn + amountInWithFee;
    const newReserveOut = k / newReserveIn;

    return Math.max(0, reserveOut - newReserveOut);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate LP tokens received when adding liquidity
 */
export function calculateLpReceived(
    tokenAmount: number,
    usdgAmount: number,
    currentTokenPrice?: number
): number {
    // Simplified: LP = sqrt(tokenAmount * usdgAmount)
    const price = currentTokenPrice || getTokenPrice('GAO');
    const tokenValueInUsdg = tokenAmount * price;

    // LP tokens based on geometric mean
    return Math.sqrt(tokenValueInUsdg * usdgAmount);
}

/**
 * Estimate value when removing liquidity
 */
export function estimateRemoveLiquidity(
    lpAmount: number,
    totalLpSupply: number,
    tokenReserve: number,
    usdgReserve: number
): { tokenAmount: number; usdgAmount: number } {
    if (totalLpSupply <= 0 || lpAmount <= 0) {
        return { tokenAmount: 0, usdgAmount: 0 };
    }

    const share = lpAmount / totalLpSupply;

    return {
        tokenAmount: tokenReserve * share,
        usdgAmount: usdgReserve * share,
    };
}

// =====================================================
// POOL APY ESTIMATION
// =====================================================

/**
 * Estimate pool APY based on trading volume and reserves
 * Higher volume relative to reserves = higher APY from fees
 */
export function estimatePoolApy(
    dailyVolume: number,
    totalReserves: number,
    feePercent: number = 0.3
): number {
    if (totalReserves <= 0) return 0;

    // Daily fees
    const dailyFees = dailyVolume * (feePercent / 100);

    // Daily return
    const dailyReturn = dailyFees / totalReserves;

    // Annualize (compound daily)
    const apr = dailyReturn * 365;
    const apy = aprToApy(apr, 365);

    return apy;
}

/**
 * Dynamic APY for each pool based on activity
 */
export const POOL_BASE_APY: Record<string, number> = {
    'GAO/USDG': 0.425,    // 42.5%
    'FRUIT/USDG': 0.382,  // 38.2%
    'VEG/USDG': 0.558,    // 55.8%
    'GRAIN/USDG': 0.485,  // 48.5%
};

export function getPoolApy(poolPair: string): number {
    return POOL_BASE_APY[poolPair] || 0.4;
}
