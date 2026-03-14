import { MarketData, Trend } from '../types/agent';

function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;

  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const gains = changes.map((c) => (c > 0 ? c : 0));
  const losses = changes.map((c) => (c < 0 ? Math.abs(c) : 0));

  const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function determineTrend(prices: number[]): Trend {
  if (prices.length < 3) return 'sideways';
  const recent = prices.slice(-5);
  const changePct = ((recent[recent.length - 1] - recent[0]) / recent[0]) * 100;
  if (changePct > 1) return 'up';
  if (changePct < -1) return 'down';
  return 'sideways';
}

let cachedMarket: MarketData | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

// Binance public REST API — no API key required
const BINANCE_PRICE = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT';
const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&limit=50';

export async function fetchMarketData(): Promise<MarketData> {
  const now = Date.now();
  if (cachedMarket && now < cacheExpiresAt) return cachedMarket;

  try {
    const [priceResp, klinesResp] = await Promise.all([
      fetch(BINANCE_PRICE, { signal: AbortSignal.timeout(8_000) }),
      fetch(BINANCE_KLINES, { signal: AbortSignal.timeout(8_000) }),
    ]);

    if (!priceResp.ok) throw new Error(`Binance price HTTP ${priceResp.status}`);
    if (!klinesResp.ok) throw new Error(`Binance klines HTTP ${klinesResp.status}`);

    const priceData = (await priceResp.json()) as { price: string };
    // Kline row format: [openTime, open, high, low, close, volume, ...]
    const klines = (await klinesResp.json()) as string[][];
    const closePrices = klines.map((k) => parseFloat(k[4]));

    const ethPrice = parseFloat(priceData.price);
    const rsi = Math.round(calculateRSI(closePrices));
    const trend = determineTrend(closePrices);

    cachedMarket = { ethPrice, rsi, trend, timestamp: new Date().toISOString() };
    cacheExpiresAt = now + CACHE_TTL_MS;
    console.log(`[MarketData] ETH=$${ethPrice.toFixed(2)} RSI=${rsi} trend=${trend}`);
    return cachedMarket;
  } catch (err) {
    console.error('[MarketData] Binance fetch failed, using fallback:', err);
    return (
      cachedMarket ?? {
        ethPrice: 3200,
        rsi: 50,
        trend: 'sideways',
        timestamp: new Date().toISOString(),
      }
    );
  }
}
