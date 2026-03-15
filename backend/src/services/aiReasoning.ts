import { AIReasoning, MarketData, Personality, SwapStrategy, TradeAction } from '../types/agent';
import type { MarketSignals } from './elsaTools';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SYSTEM_MESSAGE = `You are an expert human-like DeFi trader running a strategy on Base Sepolia.
Analyze the market data and provide a believable, realistic, and easy-to-understand reason for your trade.
NEVER say "I cannot provide financial advice" or act like an AI. 
Keep the reasoning to ONE natural-sounding sentence explaining why you are buying, selling, or holding.
Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.`;

const PERSONALITY_DESCRIPTIONS: Record<Personality, string> = {
  risk_taker:
    'Aggressive: enter early, tolerate higher slippage, prefer market swaps for speed.',
  safe_player:
    'Conservative: only swap at extreme RSI levels, use tight slippage (0.1%), prefer TWAP execution.',
  balanced:
    'Moderate: systematic entries at mild RSI extremes, 0.3% slippage, standard market swap.',
  momentum_hunter:
    'Trend-follower: swap immediately when trend is confirmed up or down, market execution.',
  contrarian:
    'Contrary: swap against the crowd only at extreme RSI (<20 buy, >80 sell), use limit-style via hook.',
  custom:
    'Free-thinking AI agent: You have no set constraints. Analyze the market dynamically and make the smartest risk-adjusted move.',
};

const FEE_TIER_BY_PERSONALITY: Record<Personality, string> = {
  risk_taker: '0.3%',
  safe_player: '0.05%',
  balanced: '0.05%',
  momentum_hunter: '0.3%',
  contrarian: '0.05%',
  custom: '0.3%',
};

const SLIPPAGE_BY_PERSONALITY: Record<Personality, string> = {
  risk_taker: '1.0%',
  safe_player: '0.1%',
  balanced: '0.5%',
  momentum_hunter: '0.8%',
  contrarian: '0.3%',
  custom: '0.8%',
};

type FeeTier = '0.01%' | '0.05%' | '0.3%' | '1%';

function buildPrompt(personality: Personality, remainingBudget: number, market: MarketData, signals?: MarketSignals): string {
  const signalsBlock = signals ? `
Additional OpenClaw market signals (19-tool analysis):
- MACD crossover: ${signals.macdCrossover}
- Bollinger position: ${signals.bollingerPosition} (${signals.bollingerWidth})
- Fear & Greed: ${signals.fearGreedValue} (${signals.fearGreedLabel})
- Order flow: ${signals.orderFlowImbalance}
- 24h volatility: ${signals.volatilityLevel} (${signals.volatilityPct}%)
- Whale activity: ${signals.whaleAlert ? `YES — ${signals.whithaleTrades} large trades` : 'none'}
- Support/Resistance: $${signals.supportLevel.toFixed(0)} / $${signals.resistanceLevel.toFixed(0)} (currently ${signals.currentPosition})
- Arbitrage spread: ${signals.arbitrageSpreadPct}%
- Pool APR: ${signals.poolAPR}%
- Signal summary: ${signals.summary}` : '';

  return `You are a ${personality} DeFi trader.
Strategy: ${PERSONALITY_DESCRIPTIONS[personality]}

Live market snapshot:
- ETH/USDC: $${market.ethPrice.toFixed(2)}
- RSI(14): ${market.rsi} (30 is oversold, 70 is overbought)
- 1h trend: ${market.trend}
- USDC Budget: $${remainingBudget.toFixed(2)}
${signalsBlock}
Pool context (Uniswap v3 on Base Sepolia):
- ETH/USDC 0.05% pool — best for large, low-impact swaps
- ETH/USDC 0.3% pool — better for smaller/faster swaps
- Uniswap v4 hooks available: TWAP hook, dynamic fee hook, limit-order hook

Based on the market data and your personality, decide: BUY (swap USDC→ETH), SELL (swap ETH→USDC), or HOLD.
Then provide the exact Uniswap swap parameters.

Respond ONLY with this JSON — no other text:
{
  "action": "BUY" or "SELL" or "HOLD",
  "confidence": <integer 0-100>,
  "reasoning": "<one concise, realistic human-like sentence explaining why this is a good trade setup right now>",
  "swapStrategy": {
    "tokenIn": "<USDC or ETH or none>",
    "tokenOut": "<ETH or USDC or none>",
    "pool": "<e.g. ETH/USDC 0.05% on Base Sepolia>",
    "feeTier": "<0.01% or 0.05% or 0.3% or 1%>",
    "slippageTolerance": "<e.g. 0.5%>",
    "executionStyle": "<market | TWAP over Xmin | dynamic fee hook | limit-order hook at $X>",
    "hookRecommendation": "<specific Uniswap v4 hook to use and why, or 'none' for v3>",
    "estimatedPriceImpact": "<e.g. < 0.1%>"
  }
}`;
}

export async function runAIReasoning(
  personality: Personality,
  remainingBudget: number,
  market: MarketData,
  signals?: MarketSignals
): Promise<AIReasoning> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Try Groq first
  if (groqKey) {
    try {
      const resp = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          temperature: 0.2,
          max_tokens: 400,
          messages: [
            { role: 'system', content: SYSTEM_MESSAGE },
            { role: 'user', content: buildPrompt(personality, remainingBudget, market, signals) },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!resp.ok) throw new Error(`Groq HTTP ${resp.status}`);

      const data = (await resp.json()) as {
        choices: Array<{ message: { content: string } }>;
      };

      let raw = data.choices[0]?.message?.content?.trim() ?? '';
      raw = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

      const parsed = JSON.parse(raw) as AIReasoning;
      const action: TradeAction = ['BUY', 'SELL', 'HOLD'].includes(parsed.action)
        ? parsed.action
        : 'HOLD';

      return {
        action,
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
        reasoning: String(parsed.reasoning || '').slice(0, 300),
        swapStrategy: parsed.swapStrategy ?? buildFallbackSwapStrategy(personality, action, market),
      };
    } catch (err) {
      console.warn('[AIReasoning] Groq failed, trying Gemini:', (err as Error).message);
    }
  }

  // Try Gemini as second option
  if (geminiKey) {
    try {
      const prompt = `${SYSTEM_MESSAGE}\n\n${buildPrompt(personality, remainingBudget, market, signals)}`;
      const resp = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!resp.ok) throw new Error(`Gemini HTTP ${resp.status}`);

      const data = (await resp.json()) as {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      };

      let raw = data.candidates[0]?.content?.parts[0]?.text?.trim() ?? '';
      raw = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

      const parsed = JSON.parse(raw) as AIReasoning;
      const action: TradeAction = ['BUY', 'SELL', 'HOLD'].includes(parsed.action)
        ? parsed.action
        : 'HOLD';

      console.log('[AIReasoning] ✅ Gemini responded successfully');
      return {
        action,
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
        reasoning: String(parsed.reasoning || '').slice(0, 300),
        swapStrategy: parsed.swapStrategy ?? buildFallbackSwapStrategy(personality, action, market),
      };
    } catch (err) {
      console.error('[AIReasoning] Gemini also failed, using rule-based fallback:', (err as Error).message);
    }
  }

  if (!groqKey && !geminiKey) {
    console.warn('[AIReasoning] No AI API keys set — using rule-based fallback. Set GROQ_API_KEY or GEMINI_API_KEY.');
  }

  return fallbackReasoning(personality, remainingBudget, market);
}

// ─── Rule-based fallback ─────────────────────────────────────────────────────

function fallbackReasoning(
  personality: Personality,
  remainingBudget: number,
  market: MarketData
): AIReasoning {
  const { rsi, trend } = market;

  const thresholds: Record<Personality, { buyBelow: number; sellAbove: number }> = {
    risk_taker: { buyBelow: 50, sellAbove: 60 },
    safe_player: { buyBelow: 25, sellAbove: 75 },
    balanced: { buyBelow: 35, sellAbove: 65 },
    momentum_hunter: { buyBelow: 45, sellAbove: 55 },
    contrarian: { buyBelow: 20, sellAbove: 80 },
    custom: { buyBelow: 40, sellAbove: 60 },
  };

  const { buyBelow, sellAbove } = thresholds[personality];
  let action: TradeAction = 'HOLD';

  if (personality === 'momentum_hunter') {
    action = trend === 'up' ? 'BUY' : trend === 'down' ? 'SELL' : 'HOLD';
  } else if (rsi < buyBelow) {
    action = 'BUY';
  } else if (rsi > sellAbove) {
    action = 'SELL';
  }

  const confidence =
    action === 'BUY'
      ? Math.min(95, Math.round(60 + (buyBelow - rsi) * 1.5))
      : action === 'SELL'
      ? Math.min(95, Math.round(60 + (rsi - sellAbove) * 1.5))
      : 40;

  const reasoningMap = {
    BUY: `RSI is low at ${rsi} and the setup looks solid; I'm entering a long position here.`,
    SELL: `Market looks overextended with RSI at ${rsi}, taking profits now before a reversal.`,
    HOLD: `Trend is too choppy (${trend}) right now. Better to sit on our hands and wait for a clear setup.`
  };

  const reasoning = reasoningMap[action];

  return {
    action,
    confidence: Math.max(20, confidence),
    reasoning,
    swapStrategy: buildFallbackSwapStrategy(personality, action, market),
  };
}

function buildFallbackSwapStrategy(
  personality: Personality,
  action: TradeAction,
  market: MarketData
): SwapStrategy {
  const feeTier = FEE_TIER_BY_PERSONALITY[personality] as FeeTier;
  const slippage = SLIPPAGE_BY_PERSONALITY[personality];

  if (action === 'HOLD') {
    return {
      tokenIn: 'none',
      tokenOut: 'none',
      pool: 'ETH/USDC 0.05% on Base Sepolia',
      feeTier: '0.05%',
      slippageTolerance: '0%',
      executionStyle: 'no swap — hold current position',
      hookRecommendation: 'none',
      estimatedPriceImpact: '0%',
    };
  }

  const isBuy = action === 'BUY';
  const executionStyle =
    personality === 'safe_player'
      ? 'TWAP over 5 min via TWAP hook'
      : personality === 'contrarian'
      ? `limit-order hook at $${(market.ethPrice * (isBuy ? 0.995 : 1.005)).toFixed(2)}`
      : 'market swap';

  const hookRecommendation =
    personality === 'safe_player'
      ? 'TWAP execution hook — splits swap into multiple smaller orders to reduce price impact'
      : personality === 'contrarian'
      ? 'Limit-order hook — queues the swap at a target price, cancels if not filled in 10 min'
      : personality === 'risk_taker'
      ? 'Dynamic fee hook — adjusts fee based on volatility to minimize cost at high-volume moments'
      : 'none — standard Uniswap v3 market swap is sufficient';

  return {
    tokenIn: isBuy ? 'USDC' : 'ETH',
    tokenOut: isBuy ? 'ETH' : 'USDC',
    pool: `ETH/USDC ${feeTier} on Base Sepolia`,
    feeTier,
    slippageTolerance: slippage,
    executionStyle,
    hookRecommendation,
    estimatedPriceImpact: feeTier === '0.05%' ? '< 0.1%' : '< 0.3%',
  };
}
