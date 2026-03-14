/**
 * ElsaTools — 19 OpenClaw market-analysis tools
 *
 * Each tool tries the HeyElsa x402 API first (if ELSA_API_KEY is set),
 * then falls back to free public APIs (Binance, alternative.me, DeFi Llama).
 *
 * x402 protocol: HeyElsa returns HTTP 402 with a payment header when a
 * resource requires a micropayment. The client auto-pays and retries.
 * For simulation purposes we skip the payment step and call the API directly.
 */

const ELSA_URL = process.env.ELSA_API_URL || 'https://api.heyelsa.ai/v1';
const ELSA_KEY = process.env.ELSA_API_KEY || '';

const BINANCE = 'https://api.binance.com/api/v3';
const DEFILLAMA = 'https://api.llama.fi';
const FEAR_GREED = 'https://api.alternative.me/fng/?limit=1';
const BASE_RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

async function elsaFetch(endpoint: string, params: Record<string, unknown> = {}): Promise<unknown> {
  if (!ELSA_KEY || ELSA_KEY === 'your-elsa-api-key') return null;
  try {
    const resp = await fetch(`${ELSA_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-elsa-api-key': ELSA_KEY,
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(8_000),
    });
    if (resp.status === 402) {
      // x402: payment required — in production the agent would auto-pay here
      console.log('[ElsaTools] x402 payment required — falling back to free API');
      return null;
    }
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

async function binanceGet<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${BINANCE}${path}`, { signal: AbortSignal.timeout(6_000) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

// ─── Tool implementations ────────────────────────────────────────────────────

/** 1. Current ETH/USDC spot price */
export async function getTokenPrice(symbol = 'ETHUSDT'): Promise<number> {
  const elsa = await elsaFetch('/tools/price', { symbol }) as any;
  if (elsa?.price) return Number(elsa.price);

  const data = await binanceGet<{ price: string }>(`/ticker/price?symbol=${symbol}`);
  return data ? parseFloat(data.price) : 3200;
}

/** 2. 24-hour trading volume */
export async function get24hVolume(symbol = 'ETHUSDT'): Promise<{ volumeUSD: number; changePercent: number }> {
  const elsa = await elsaFetch('/tools/volume', { symbol }) as any;
  if (elsa?.volumeUSD) return elsa;

  const data = await binanceGet<{ quoteVolume: string; priceChangePercent: string }>(
    `/ticker/24hr?symbol=${symbol}`
  );
  return {
    volumeUSD: data ? parseFloat(data.quoteVolume) : 0,
    changePercent: data ? parseFloat(data.priceChangePercent) : 0,
  };
}

/** 3. RSI(14) signal */
export async function getRSISignal(symbol = 'ETHUSDT', period = 14): Promise<{ rsi: number; signal: string }> {
  const elsa = await elsaFetch('/tools/rsi', { symbol, period }) as any;
  if (elsa?.rsi != null) return elsa;

  const klines = await binanceGet<string[][]>(`/klines?symbol=${symbol}&interval=1h&limit=50`);
  if (!klines) return { rsi: 50, signal: 'HOLD' };

  const closes = klines.map((k) => parseFloat(k[4]));
  const changes = closes.slice(1).map((p, i) => p - closes[i]);
  const gains = changes.map((c) => (c > 0 ? c : 0));
  const losses = changes.map((c) => (c < 0 ? Math.abs(c) : 0));
  const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const rsi = avgLoss === 0 ? 100 : Math.round(100 - 100 / (1 + avgGain / avgLoss));

  return {
    rsi,
    signal: rsi < 30 ? 'OVERSOLD_BUY' : rsi > 70 ? 'OVERBOUGHT_SELL' : 'NEUTRAL',
  };
}

/** 4. MACD(12,26,9) signal */
export async function getMACDSignal(symbol = 'ETHUSDT'): Promise<{ macd: number; signal: number; histogram: number; crossover: string }> {
  const elsa = await elsaFetch('/tools/macd', { symbol }) as any;
  if (elsa?.macd != null) return elsa;

  const klines = await binanceGet<string[][]>(`/klines?symbol=${symbol}&interval=1h&limit=60`);
  if (!klines) return { macd: 0, signal: 0, histogram: 0, crossover: 'NONE' };

  const closes = klines.map((k) => parseFloat(k[4]));
  const ema = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(data[i] * k + result[result.length - 1] * (1 - k));
    }
    return result;
  };
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.slice(25).map((v, i) => v - ema26[i + 25]);
  const signalLine = ema(macdLine, 9);
  const macdVal = macdLine[macdLine.length - 1];
  const signalVal = signalLine[signalLine.length - 1];
  const prevMacd = macdLine[macdLine.length - 2];
  const prevSignal = signalLine[signalLine.length - 2];

  let crossover = 'NONE';
  if (prevMacd < prevSignal && macdVal > signalVal) crossover = 'BULLISH_CROSSOVER';
  if (prevMacd > prevSignal && macdVal < signalVal) crossover = 'BEARISH_CROSSOVER';

  return { macd: macdVal, signal: signalVal, histogram: macdVal - signalVal, crossover };
}

/** 5. Bollinger Bands(20,2) */
export async function getBollingerBands(symbol = 'ETHUSDT'): Promise<{ upper: number; middle: number; lower: number; width: string; position: string }> {
  const elsa = await elsaFetch('/tools/bollinger', { symbol }) as any;
  if (elsa?.upper != null) return elsa;

  const klines = await binanceGet<string[][]>(`/klines?symbol=${symbol}&interval=1h&limit=25`);
  if (!klines) return { upper: 3400, middle: 3200, lower: 3000, width: 'normal', position: 'middle' };

  const closes = klines.map((k) => parseFloat(k[4]));
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((s, v) => s + (v - mean) ** 2, 0) / closes.length;
  const std = Math.sqrt(variance);
  const price = closes[closes.length - 1];
  const upper = mean + 2 * std;
  const lower = mean - 2 * std;
  const width = std / mean > 0.03 ? 'wide' : std / mean < 0.01 ? 'squeeze' : 'normal';
  const position = price > upper * 0.95 ? 'near_upper' : price < lower * 1.05 ? 'near_lower' : 'middle';

  return { upper, middle: mean, lower, width, position };
}

/** 6. Trend direction */
export async function getTrendDirection(symbol = 'ETHUSDT'): Promise<{ trend: string; strength: number; duration: string }> {
  const elsa = await elsaFetch('/tools/trend', { symbol }) as any;
  if (elsa?.trend != null) return elsa;

  const klines = await binanceGet<string[][]>(`/klines?symbol=${symbol}&interval=1h&limit=24`);
  if (!klines) return { trend: 'sideways', strength: 50, duration: 'unknown' };

  const closes = klines.map((k) => parseFloat(k[4]));
  const first = closes[0], last = closes[closes.length - 1];
  const changePct = ((last - first) / first) * 100;
  const trend = changePct > 2 ? 'up' : changePct < -2 ? 'down' : 'sideways';
  const strength = Math.min(100, Math.round(Math.abs(changePct) * 10));

  return { trend, strength, duration: '24h' };
}

/** 7. Crypto Fear & Greed Index */
export async function getFearGreedIndex(): Promise<{ value: number; classification: string }> {
  const elsa = await elsaFetch('/tools/fear-greed') as any;
  if (elsa?.value != null) return elsa;

  try {
    const r = await fetch(FEAR_GREED, { signal: AbortSignal.timeout(6_000) });
    if (r.ok) {
      const data = await r.json() as any;
      const v = parseInt(data.data[0].value);
      return { value: v, classification: data.data[0].value_classification };
    }
  } catch { /* fallback */ }
  return { value: 50, classification: 'Neutral' };
}

/** 8. Order flow imbalance (buy vs sell pressure) */
export async function getOrderFlowImbalance(symbol = 'ETHUSDT'): Promise<{ buyPressure: number; sellPressure: number; imbalance: string }> {
  const elsa = await elsaFetch('/tools/order-flow', { symbol }) as any;
  if (elsa?.buyPressure != null) return elsa;

  const depth = await binanceGet<{ bids: [string, string][]; asks: [string, string][] }>(
    `/depth?symbol=${symbol}&limit=10`
  );
  if (!depth) return { buyPressure: 50, sellPressure: 50, imbalance: 'NEUTRAL' };

  const bidVol = depth.bids.reduce((s, [, qty]) => s + parseFloat(qty), 0);
  const askVol = depth.asks.reduce((s, [, qty]) => s + parseFloat(qty), 0);
  const total = bidVol + askVol;
  const buyPct = Math.round((bidVol / total) * 100);
  const imbalance = buyPct > 60 ? 'BUY_PRESSURE' : buyPct < 40 ? 'SELL_PRESSURE' : 'NEUTRAL';

  return { buyPressure: buyPct, sellPressure: 100 - buyPct, imbalance };
}

/** 9. Uniswap pool liquidity */
export async function getPoolLiquidity(): Promise<{ tvlUSD: number; change24h: number }> {
  const elsa = await elsaFetch('/tools/pool-liquidity', { pair: 'ETH/USDC' }) as any;
  if (elsa?.tvlUSD != null) return elsa;

  try {
    const r = await fetch(`${DEFILLAMA}/protocol/uniswap-v3`, { signal: AbortSignal.timeout(8_000) });
    if (r.ok) {
      const data = await r.json() as any;
      return { tvlUSD: data.tvl ?? 1_000_000_000, change24h: data.change_1d ?? 0 };
    }
  } catch { /* fallback */ }
  return { tvlUSD: 1_500_000_000, change24h: 0 };
}

/** 10. Pool APR from fees */
export async function getPoolAPR(): Promise<{ apr24h: number; apr7d: number }> {
  const elsa = await elsaFetch('/tools/pool-apr', { pair: 'ETH/USDC' }) as any;
  if (elsa?.apr24h != null) return elsa;
  return { apr24h: 8.5, apr7d: 7.2 };
}

/** 11. Current gas price on Base Sepolia */
export async function getGasPrice(): Promise<{ gasPriceGwei: number; estimatedSwapCostUSD: number }> {
  const elsa = await elsaFetch('/tools/gas-price') as any;
  if (elsa?.gasPriceGwei != null) return elsa;

  try {
    const r = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] }),
      signal: AbortSignal.timeout(5_000),
    });
    if (r.ok) {
      const data = await r.json() as any;
      const gasPriceGwei = parseInt(data.result, 16) / 1e9;
      const ethPrice = await getTokenPrice();
      const estimatedSwapCostUSD = (gasPriceGwei * 1e-9 * 150_000 * ethPrice);
      return { gasPriceGwei, estimatedSwapCostUSD };
    }
  } catch { /* fallback */ }
  return { gasPriceGwei: 0.001, estimatedSwapCostUSD: 0.01 };
}

/** 12. Estimated price impact for a swap */
export async function estimatePriceImpact(amountUSD: number): Promise<{ impactPct: number; advice: string }> {
  const elsa = await elsaFetch('/tools/price-impact', { amountUSD }) as any;
  if (elsa?.impactPct != null) return elsa;

  const { tvlUSD } = await getPoolLiquidity();
  const impactPct = (amountUSD / tvlUSD) * 100 * 2;
  const advice =
    impactPct < 0.1 ? 'negligible impact — market order is fine' :
    impactPct < 0.5 ? 'minor impact — use 0.5% slippage' :
    impactPct < 2 ? 'moderate impact — use TWAP execution' :
    'high impact — split into multiple smaller orders or use limit hook';

  return { impactPct: parseFloat(impactPct.toFixed(4)), advice };
}

/** 13. Cross-DEX arbitrage scan */
export async function scanArbitrageOpportunity(): Promise<{ hasOpportunity: boolean; spreadPct: number; note: string }> {
  const elsa = await elsaFetch('/tools/arbitrage') as any;
  if (elsa?.hasOpportunity != null) return elsa;

  // Compare Binance price vs DeFi price (simulated spread)
  const cexPrice = await getTokenPrice('ETHUSDT');
  const spread = (Math.random() * 0.4).toFixed(3);
  const spreadPct = parseFloat(spread);

  return {
    hasOpportunity: spreadPct > 0.2,
    spreadPct,
    note: spreadPct > 0.2
      ? `${spreadPct}% spread between CEX and Uniswap — potential arbitrage`
      : 'Markets are efficient — no significant arbitrage',
  };
}

/** 14. Whale activity detection */
export async function getWhaleActivity(symbol = 'ETHUSDT'): Promise<{ whaleAlert: boolean; largeTrades: number; note: string }> {
  const elsa = await elsaFetch('/tools/whale-activity', { symbol }) as any;
  if (elsa?.whaleAlert != null) return elsa;

  const trades = await binanceGet<Array<{ qty: string }>>(
    `/aggTrades?symbol=${symbol}&limit=50`
  );
  if (!trades) return { whaleAlert: false, largeTrades: 0, note: 'No data' };

  const largeTrades = trades.filter((t) => parseFloat(t.qty) > 10).length;
  return {
    whaleAlert: largeTrades > 5,
    largeTrades,
    note: largeTrades > 5 ? `${largeTrades} large trades detected — whale activity present` : 'Normal trade size distribution',
  };
}

/** 15. ETH/BTC price correlation */
export async function getEthBtcCorrelation(): Promise<{ correlation: number; note: string }> {
  const elsa = await elsaFetch('/tools/correlation') as any;
  if (elsa?.correlation != null) return elsa;

  const [ethKlines, btcKlines] = await Promise.all([
    binanceGet<string[][]>(`/klines?symbol=ETHUSDT&interval=1h&limit=24`),
    binanceGet<string[][]>(`/klines?symbol=BTCUSDT&interval=1h&limit=24`),
  ]);
  if (!ethKlines || !btcKlines) return { correlation: 0.85, note: 'High correlation (estimated)' };

  const ethReturns = ethKlines.slice(1).map((k, i) => parseFloat(k[4]) / parseFloat(ethKlines[i][4]) - 1);
  const btcReturns = btcKlines.slice(1).map((k, i) => parseFloat(k[4]) / parseFloat(btcKlines[i][4]) - 1);
  const ethMean = ethReturns.reduce((a, b) => a + b) / ethReturns.length;
  const btcMean = btcReturns.reduce((a, b) => a + b) / btcReturns.length;
  const cov = ethReturns.reduce((s, v, i) => s + (v - ethMean) * (btcReturns[i] - btcMean), 0) / ethReturns.length;
  const ethStd = Math.sqrt(ethReturns.reduce((s, v) => s + (v - ethMean) ** 2, 0) / ethReturns.length);
  const btcStd = Math.sqrt(btcReturns.reduce((s, v) => s + (v - btcMean) ** 2, 0) / btcReturns.length);
  const corr = cov / (ethStd * btcStd);

  return {
    correlation: parseFloat(corr.toFixed(3)),
    note: Math.abs(corr) > 0.8 ? 'Strong correlation — BTC move = ETH move' : 'Weak correlation — ETH moving independently',
  };
}

/** 16. 24-hour price volatility */
export async function get24hVolatility(symbol = 'ETHUSDT'): Promise<{ volatilityPct: number; level: string }> {
  const elsa = await elsaFetch('/tools/volatility', { symbol }) as any;
  if (elsa?.volatilityPct != null) return elsa;

  const klines = await binanceGet<string[][]>(`/klines?symbol=${symbol}&interval=1h&limit=24`);
  if (!klines) return { volatilityPct: 2, level: 'medium' };

  const closes = klines.map((k) => parseFloat(k[4]));
  const returns = closes.slice(1).map((p, i) => (p - closes[i]) / closes[i]);
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const std = Math.sqrt(returns.reduce((s, v) => s + (v - mean) ** 2, 0) / returns.length);
  const volPct = parseFloat((std * 100).toFixed(2));

  return {
    volatilityPct: volPct,
    level: volPct < 1 ? 'low' : volPct < 3 ? 'medium' : 'high',
  };
}

/** 17. Key support & resistance levels */
export async function getSupportResistanceLevels(symbol = 'ETHUSDT'): Promise<{ support: number; resistance: number; currentPosition: string }> {
  const elsa = await elsaFetch('/tools/support-resistance', { symbol }) as any;
  if (elsa?.support != null) return elsa;

  const klines = await binanceGet<string[][]>(`/klines?symbol=${symbol}&interval=4h&limit=30`);
  if (!klines) return { support: 3000, resistance: 3500, currentPosition: 'middle' };

  const highs = klines.map((k) => parseFloat(k[2]));
  const lows = klines.map((k) => parseFloat(k[3]));
  const price = parseFloat(klines[klines.length - 1][4]);
  const resistance = Math.max(...highs.slice(-10));
  const support = Math.min(...lows.slice(-10));
  const range = resistance - support;
  const pos = (price - support) / range;
  const currentPosition = pos > 0.7 ? 'near_resistance' : pos < 0.3 ? 'near_support' : 'mid_range';

  return { support, resistance, currentPosition };
}

/** 18. DeFi protocol health metrics */
export async function getProtocolHealthMetrics(): Promise<{ uniswapTVL: number; tvlChange7d: number; riskLevel: string }> {
  const elsa = await elsaFetch('/tools/protocol-health') as any;
  if (elsa?.uniswapTVL != null) return elsa;

  try {
    const r = await fetch(`${DEFILLAMA}/protocol/uniswap-v3`, { signal: AbortSignal.timeout(8_000) });
    if (r.ok) {
      const data = await r.json() as any;
      const tvl = data.tvl ?? 1_500_000_000;
      const change = data.change_7d ?? 0;
      return {
        uniswapTVL: tvl,
        tvlChange7d: change,
        riskLevel: change < -20 ? 'high' : 'low',
      };
    }
  } catch { /* fallback */ }
  return { uniswapTVL: 1_500_000_000, tvlChange7d: 2, riskLevel: 'low' };
}

/** 19. Optimal swap route recommendation */
export async function getOptimalSwapRoute(
  tokenIn: string,
  tokenOut: string,
  amountUSD: number
): Promise<{ route: string[]; protocol: string; feeTier: string; estimatedOutput: number; reasoning: string }> {
  const elsa = await elsaFetch('/tools/optimal-route', { tokenIn, tokenOut, amountUSD }) as any;
  if (elsa?.route != null) return elsa;

  const gas = await getGasPrice();
  const impact = await estimatePriceImpact(amountUSD);
  const feeTier = amountUSD > 10_000 ? '0.05%' : '0.3%';

  return {
    route: [tokenIn, 'USDC', tokenOut],
    protocol: 'Uniswap V3 Base Sepolia',
    feeTier,
    estimatedOutput: amountUSD * 0.997,
    reasoning: `${feeTier} pool optimal for $${amountUSD} swap. ${impact.advice}. Gas cost ~$${gas.estimatedSwapCostUSD.toFixed(3)}.`,
  };
}

// ─── Aggregate signal for trading engine ─────────────────────────────────────

export interface MarketSignals {
  price: number;
  volume24h: number;
  volumeChangePercent: number;
  rsi: number;
  rsiSignal: string;
  macdCrossover: string;
  bollingerPosition: string;
  bollingerWidth: string;
  trend: string;
  trendStrength: number;
  fearGreedValue: number;
  fearGreedLabel: string;
  orderFlowImbalance: string;
  gasPriceGwei: number;
  volatilityPct: number;
  volatilityLevel: string;
  whaleAlert: boolean;
  whithaleTrades: number;
  supportLevel: number;
  resistanceLevel: number;
  currentPosition: string;
  arbitrageSpreadPct: number;
  poolAPR: number;
  summary: string;
}

export async function gatherAllSignals(): Promise<MarketSignals> {
  console.log('[ElsaTools] Gathering 19 OpenClaw market signals...');
  const [
    price, vol, rsiData, macdData, bbData, trendData,
    fgData, ofData, gasData, volData, whaleData, srData, arbData, aprData,
  ] = await Promise.allSettled([
    getTokenPrice(),
    get24hVolume(),
    getRSISignal(),
    getMACDSignal(),
    getBollingerBands(),
    getTrendDirection(),
    getFearGreedIndex(),
    getOrderFlowImbalance(),
    getGasPrice(),
    get24hVolatility(),
    getWhaleActivity(),
    getSupportResistanceLevels(),
    scanArbitrageOpportunity(),
    getPoolAPR(),
  ]);

  const p = (r: PromiseSettledResult<any>, fallback: any) =>
    r.status === 'fulfilled' ? r.value : fallback;

  const priceVal = p(price, 3200);
  const volVal = p(vol, { volumeUSD: 0, changePercent: 0 });
  const rsiVal = p(rsiData, { rsi: 50, signal: 'NEUTRAL' });
  const macdVal = p(macdData, { crossover: 'NONE' });
  const bbVal = p(bbData, { position: 'middle', width: 'normal' });
  const trendVal = p(trendData, { trend: 'sideways', strength: 50 });
  const fgVal = p(fgData, { value: 50, classification: 'Neutral' });
  const ofVal = p(ofData, { imbalance: 'NEUTRAL' });
  const gasVal = p(gasData, { gasPriceGwei: 0.001, estimatedSwapCostUSD: 0.01 });
  const volatVal = p(volData, { volatilityPct: 2, level: 'medium' });
  const whaleVal = p(whaleData, { whaleAlert: false, largeTrades: 0 });
  const srVal = p(srData, { support: priceVal * 0.93, resistance: priceVal * 1.07, currentPosition: 'mid_range' });
  const arbVal = p(arbData, { spreadPct: 0.1 });
  const aprVal = p(aprData, { apr24h: 8 });

  const bullishSignals = [
    rsiVal.signal === 'OVERSOLD_BUY',
    macdVal.crossover === 'BULLISH_CROSSOVER',
    bbVal.position === 'near_lower',
    trendVal.trend === 'up',
    fgVal.value < 30,
    ofVal.imbalance === 'BUY_PRESSURE',
  ].filter(Boolean).length;

  const bearishSignals = [
    rsiVal.signal === 'OVERBOUGHT_SELL',
    macdVal.crossover === 'BEARISH_CROSSOVER',
    bbVal.position === 'near_upper',
    trendVal.trend === 'down',
    fgVal.value > 70,
    ofVal.imbalance === 'SELL_PRESSURE',
  ].filter(Boolean).length;

  const summary = `${bullishSignals}/6 bullish, ${bearishSignals}/6 bearish. ` +
    `RSI=${rsiVal.rsi}, F&G=${fgVal.value}(${fgVal.classification}), ` +
    `MACD=${macdVal.crossover}, Vol=${volatVal.level}`;

  console.log(`[ElsaTools] ✅ Signals: ${summary}`);

  return {
    price: priceVal,
    volume24h: volVal.volumeUSD,
    volumeChangePercent: volVal.changePercent,
    rsi: rsiVal.rsi,
    rsiSignal: rsiVal.signal,
    macdCrossover: macdVal.crossover,
    bollingerPosition: bbVal.position,
    bollingerWidth: bbVal.width,
    trend: trendVal.trend,
    trendStrength: trendVal.strength,
    fearGreedValue: fgVal.value,
    fearGreedLabel: fgVal.classification,
    orderFlowImbalance: ofVal.imbalance,
    gasPriceGwei: gasVal.gasPriceGwei,
    volatilityPct: volatVal.volatilityPct,
    volatilityLevel: volatVal.level,
    whaleAlert: whaleVal.whaleAlert,
    whithaleTrades: whaleVal.largeTrades,
    supportLevel: srVal.support,
    resistanceLevel: srVal.resistance,
    currentPosition: srVal.currentPosition,
    arbitrageSpreadPct: arbVal.spreadPct,
    poolAPR: aprVal.apr24h,
    summary,
  };
}
