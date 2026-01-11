/**
 * Price Engine Service
 * Manages token prices with random fluctuations and database sync
 */

// Token price configuration
export interface TokenPriceConfig {
    symbol: string;
    basePrice: number;
    volatility: number; // Standard deviation as percentage (e.g., 0.05 = 5%)
    minPrice: number;
    maxPrice: number;
}

export interface PriceData {
    symbol: string;
    price: number;
    previousPrice: number;
    change24h: number;
    volume24h: number;
    timestamp: Date;
}

// Default token configurations
const TOKEN_CONFIGS: TokenPriceConfig[] = [
    { symbol: 'GAO', basePrice: 3.5, volatility: 0.08, minPrice: 1.0, maxPrice: 10.0 },
    { symbol: 'FRUIT', basePrice: 4.2, volatility: 0.10, minPrice: 1.5, maxPrice: 12.0 },
    { symbol: 'VEG', basePrice: 2.2, volatility: 0.06, minPrice: 0.8, maxPrice: 6.0 },
    { symbol: 'GRAIN', basePrice: 1.85, volatility: 0.05, minPrice: 0.5, maxPrice: 5.0 },
];

// Storage keys for localStorage
const PRICE_STORAGE_KEY = 'utopia_token_prices';
const PRICE_HISTORY_KEY = 'utopia_price_history';
const LAST_UPDATE_KEY = 'utopia_last_price_update';

// Update interval (5 minutes in milliseconds)
export const PRICE_UPDATE_INTERVAL = 5 * 60 * 1000;

// Event system for price updates
type PriceUpdateCallback = (prices: Record<string, PriceData>) => void;
const priceUpdateListeners: PriceUpdateCallback[] = [];

/**
 * Generate a random price change using random walk algorithm
 * Uses Box-Muller transform for normal distribution
 */
function generateRandomPriceChange(currentPrice: number, config: TokenPriceConfig): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Calculate price change
    const changePercent = z * config.volatility;
    let newPrice = currentPrice * (1 + changePercent);

    // Clamp to min/max bounds
    newPrice = Math.max(config.minPrice, Math.min(config.maxPrice, newPrice));

    // Round to 2 decimal places
    return Math.round(newPrice * 100) / 100;
}

/**
 * Get current prices from localStorage or initialize with defaults
 */
export function getCurrentPrices(): Record<string, PriceData> {
    try {
        const stored = localStorage.getItem(PRICE_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert timestamp strings back to Date objects
            Object.keys(parsed).forEach(key => {
                parsed[key].timestamp = new Date(parsed[key].timestamp);
            });
            return parsed;
        }
    } catch (error) {
        console.error('Error reading prices from storage:', error);
    }

    // Initialize with default prices
    return initializePrices();
}

/**
 * Initialize prices with default values
 */
function initializePrices(): Record<string, PriceData> {
    const prices: Record<string, PriceData> = {};

    TOKEN_CONFIGS.forEach(config => {
        prices[config.symbol] = {
            symbol: config.symbol,
            price: config.basePrice,
            previousPrice: config.basePrice,
            change24h: 0,
            volume24h: Math.floor(Math.random() * 50000) + 10000,
            timestamp: new Date(),
        };
    });

    savePrices(prices);
    return prices;
}

/**
 * Save prices to localStorage
 */
function savePrices(prices: Record<string, PriceData>): void {
    try {
        localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(prices));
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
    } catch (error) {
        console.error('Error saving prices to storage:', error);
    }
}

/**
 * Add price data to history
 */
function addToHistory(prices: Record<string, PriceData>): void {
    try {
        const historyStr = localStorage.getItem(PRICE_HISTORY_KEY);
        let history: Array<{ timestamp: string; prices: Record<string, number> }> = [];

        if (historyStr) {
            history = JSON.parse(historyStr);
        }

        // Add new entry
        const entry = {
            timestamp: new Date().toISOString(),
            prices: {} as Record<string, number>,
        };

        Object.keys(prices).forEach(symbol => {
            entry.prices[symbol] = prices[symbol].price;
        });

        history.push(entry);

        // Keep only last 288 entries (24 hours at 5-minute intervals)
        if (history.length > 288) {
            history = history.slice(-288);
        }

        localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving price history:', error);
    }
}

/**
 * Get price history for charts
 */
export function getPriceHistory(): Array<{ timestamp: string; prices: Record<string, number> }> {
    try {
        const historyStr = localStorage.getItem(PRICE_HISTORY_KEY);
        if (historyStr) {
            return JSON.parse(historyStr);
        }
    } catch (error) {
        console.error('Error reading price history:', error);
    }
    return [];
}

/**
 * Get last update timestamp
 */
export function getLastUpdateTime(): Date | null {
    try {
        const stored = localStorage.getItem(LAST_UPDATE_KEY);
        if (stored) {
            return new Date(stored);
        }
    } catch (error) {
        console.error('Error reading last update time:', error);
    }
    return null;
}

/**
 * Check if prices need to be updated (every 5 minutes)
 */
export function shouldUpdatePrices(): boolean {
    const lastUpdate = getLastUpdateTime();
    if (!lastUpdate) return true;

    const now = new Date();
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();

    return timeSinceUpdate >= PRICE_UPDATE_INTERVAL;
}

/**
 * Update all token prices with random fluctuations
 */
export function updatePrices(): Record<string, PriceData> {
    const currentPrices = getCurrentPrices();
    const newPrices: Record<string, PriceData> = {};

    TOKEN_CONFIGS.forEach(config => {
        const currentData = currentPrices[config.symbol];
        const currentPrice = currentData?.price || config.basePrice;
        const previousPrice = currentData?.previousPrice || currentPrice;

        // Generate new price with random walk
        const newPrice = generateRandomPriceChange(currentPrice, config);

        // Calculate 24h change (simplified - compare to previous update)
        const change24h = previousPrice > 0
            ? ((newPrice - previousPrice) / previousPrice) * 100
            : 0;

        // Generate random volume change
        const currentVolume = currentData?.volume24h || 20000;
        const volumeChange = (Math.random() - 0.5) * 0.2; // ±10% change
        const newVolume = Math.floor(currentVolume * (1 + volumeChange));

        newPrices[config.symbol] = {
            symbol: config.symbol,
            price: newPrice,
            previousPrice: currentPrice,
            change24h: Math.round(change24h * 100) / 100,
            volume24h: Math.max(5000, newVolume),
            timestamp: new Date(),
        };
    });

    savePrices(newPrices);
    addToHistory(newPrices);

    // Notify all listeners
    priceUpdateListeners.forEach(callback => {
        try {
            callback(newPrices);
        } catch (error) {
            console.error('Error in price update callback:', error);
        }
    });

    return newPrices;
}

/**
 * Subscribe to price updates
 */
export function subscribeToPriceUpdates(callback: PriceUpdateCallback): () => void {
    priceUpdateListeners.push(callback);

    // Return unsubscribe function
    return () => {
        const index = priceUpdateListeners.indexOf(callback);
        if (index > -1) {
            priceUpdateListeners.splice(index, 1);
        }
    };
}

/**
 * Get price for a specific token
 */
export function getTokenPrice(symbol: string): number {
    const prices = getCurrentPrices();
    return prices[symbol]?.price || 1;
}

/**
 * Get price change percentage for a token
 */
export function getPriceChange(symbol: string): number {
    const prices = getCurrentPrices();
    return prices[symbol]?.change24h || 0;
}

/**
 * Format price data for chart display
 */
export function getChartData(hours: number = 24): Array<{
    time: string;
    GAO: number;
    FRUIT: number;
    VEG: number;
    GRAIN: number;
    volume: number;
}> {
    const history = getPriceHistory();
    const pointsToShow = Math.min(history.length, (hours * 60) / 5); // 5-minute intervals
    const recentHistory = history.slice(-pointsToShow);

    return recentHistory.map(entry => ({
        time: new Date(entry.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        GAO: entry.prices.GAO || 3.5,
        FRUIT: entry.prices.FRUIT || 4.2,
        VEG: entry.prices.VEG || 2.2,
        GRAIN: entry.prices.GRAIN || 1.85,
        volume: Math.floor(Math.random() * 30000) + 10000,
    }));
}

/**
 * Price Engine Singleton - starts automatic price updates
 */
let priceEngineInterval: ReturnType<typeof setInterval> | null = null;

export function startPriceEngine(): void {
    if (priceEngineInterval) {
        console.log('Price engine already running');
        return;
    }

    console.log('Starting price engine...');

    // Check if we need an immediate update
    if (shouldUpdatePrices()) {
        console.log('Performing initial price update');
        updatePrices();
    }

    // Set up interval for automatic updates
    priceEngineInterval = setInterval(() => {
        console.log('Price engine: updating prices');
        updatePrices();
    }, PRICE_UPDATE_INTERVAL);
}

export function stopPriceEngine(): void {
    if (priceEngineInterval) {
        clearInterval(priceEngineInterval);
        priceEngineInterval = null;
        console.log('Price engine stopped');
    }
}

/**
 * Force an immediate price update (for testing)
 */
export function forceUpdatePrices(): Record<string, PriceData> {
    return updatePrices();
}

/**
 * Get token config
 */
export function getTokenConfig(symbol: string): TokenPriceConfig | undefined {
    return TOKEN_CONFIGS.find(c => c.symbol === symbol);
}

/**
 * Get all token configs
 */
export function getAllTokenConfigs(): TokenPriceConfig[] {
    return [...TOKEN_CONFIGS];
}
