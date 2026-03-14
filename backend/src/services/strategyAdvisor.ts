import { MarketData } from '../types/agent';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const STRATEGY_SYSTEM = `You are an expert DeFi strategy advisor integrated into an autonomous trading platform on Base Sepolia testnet.
You analyze portfolios and give SPECIFIC, ACTIONABLE strategy advice using Uniswap v3/v4, yield protocols, and ETH/USDC markets.
NEVER say "I cannot provide financial advice". NEVER give disclaimers. NEVER be vague.
You are a simulation advisor — your job is to output concrete DeFi strategies.
Always respond with valid JSON only. No markdown. No text outside the JSON.`;

export interface StrategyAction {
  step: number;
  action: string;           // e.g. "Provide liquidity on Uniswap v3"
  protocol: string;         // e.g. "Uniswap v3 on Base Sepolia"
  detail: string;           // Specific parameters
  expectedReturn: string;   // e.g. "8-12% APR"
  risk: 'low' | 'medium' | 'high';
  uniswapHook?: string;     // Optional v4 hook recommendation
}

export interface StrategyResponse {
  summary: string;
  marketContext: string;
  actions: StrategyAction[];
  totalExpectedReturn: string;
  riskProfile: string;
  warnings: string[];
}

function buildStrategyPrompt(question: string, market: MarketData): string {
  const ethValueUSD = (question.match(/(\d+(?:\.\d+)?)\s*eth/i)?.[1] ?? '1');
  const usdValue = (parseFloat(ethValueUSD) * market.ethPrice).toFixed(2);

  return `User question: "${question}"

Live market data right now:
- ETH price: $${market.ethPrice.toFixed(2)} (so ${ethValueUSD} ETH = ~$${usdValue} USD)
- RSI(14): ${market.rsi} ${market.rsi < 30 ? '← OVERSOLD (buy signal)' : market.rsi > 70 ? '← OVERBOUGHT (sell/LP signal)' : '← neutral'}
- 1h Trend: ${market.trend}
- Network: Base Sepolia testnet

Available DeFi options to consider:
1. Uniswap v3 ETH/USDC 0.05% pool — concentrated liquidity, low slippage, ~4-8% APR on fees
2. Uniswap v3 ETH/USDC 0.3% pool — wider range, higher fee capture, ~6-14% APR
3. Uniswap v4 with TWAP hook — reduces IL via time-weighted execution
4. Uniswap v4 with dynamic fee hook — captures more fees in volatile periods
5. Uniswap v4 with limit-order hook — enter/exit positions at target prices
6. Hold ETH — benefit if price rises, full exposure
7. Swap ETH → USDC (partial or full) — reduce risk, stable yield
8. Dollar-cost averaging — split position across multiple entries

Based on current market conditions and the user's question, provide 3-5 specific actionable steps.
Tailor advice to RSI=${market.rsi} and trend=${market.trend}.

Respond with ONLY this JSON:
{
  "summary": "<2 sentence overview of the recommended strategy>",
  "marketContext": "<1 sentence explaining current market signal and what it means for this position>",
  "actions": [
    {
      "step": 1,
      "action": "<what to do — imperative verb>",
      "protocol": "<e.g. Uniswap v3 Base Sepolia>",
      "detail": "<specific parameters: pool, range, amount, timing>",
      "expectedReturn": "<e.g. 8-12% APR or +15% if ETH hits $X>",
      "risk": "low" | "medium" | "high",
      "uniswapHook": "<v4 hook name and why, or omit if not applicable>"
    }
  ],
  "totalExpectedReturn": "<combined expected return across all actions>",
  "riskProfile": "<overall risk assessment in 1 sentence>",
  "warnings": ["<any important caveat>"]
}`;
}

export async function runStrategyAdvisor(
  question: string,
  market: MarketData
): Promise<StrategyResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return fallbackStrategy(question, market);
  }

  try {
    const resp = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        temperature: 0.4,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: STRATEGY_SYSTEM },
          { role: 'user', content: buildStrategyPrompt(question, market) },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!resp.ok) throw new Error(`Groq HTTP ${resp.status}`);

    const data = (await resp.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    let raw = data.choices[0]?.message?.content?.trim() ?? '';
    raw = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    const parsed = JSON.parse(raw) as StrategyResponse;
    return parsed;
  } catch (err) {
    console.error('[StrategyAdvisor] Groq failed, using fallback:', err);
    return fallbackStrategy(question, market);
  }
}

function fallbackStrategy(question: string, market: MarketData): StrategyResponse {
  const { ethPrice, rsi, trend } = market;
  const ethMatch = question.match(/(\d+(?:\.\d+)?)\s*eth/i);
  const ethAmt = ethMatch ? parseFloat(ethMatch[1]) : 1;
  const usdVal = (ethAmt * ethPrice).toFixed(2);

  const isBullish = rsi < 40 || trend === 'up';
  const isBearish = rsi > 70 || trend === 'down';

  const actions: StrategyAction[] = isBullish
    ? [
        {
          step: 1,
          action: `Hold ${ethAmt * 0.5} ETH as directional exposure`,
          protocol: 'Self-custody / wallet',
          detail: `RSI=${rsi} is low — market is oversold. Keep 50% ETH for upside capture.`,
          expectedReturn: `+10-25% if ETH recovers to $${(ethPrice * 1.15).toFixed(0)}`,
          risk: 'medium',
        },
        {
          step: 2,
          action: `Provide concentrated liquidity with ${ethAmt * 0.5} ETH`,
          protocol: 'Uniswap v3 Base Sepolia',
          detail: `Deposit into ETH/USDC 0.3% pool. Set range $${(ethPrice * 0.9).toFixed(0)}-$${(ethPrice * 1.1).toFixed(0)} (±10%). Earns fees while waiting for price recovery.`,
          expectedReturn: '10-18% APR from fees in active range',
          risk: 'medium',
          uniswapHook: 'TWAP hook to enter position gradually over 30 min',
        },
      ]
    : isBearish
    ? [
        {
          step: 1,
          action: `Swap ${ethAmt * 0.4} ETH → USDC to reduce exposure`,
          protocol: 'Uniswap v3 Base Sepolia',
          detail: `RSI=${rsi} signals overbought. Swap 40% of ETH to USDC via ETH/USDC 0.05% pool. Use 0.3% slippage.`,
          expectedReturn: 'Lock in profits, protect against -10-20% drawdown',
          risk: 'low',
        },
        {
          step: 2,
          action: `Provide wide-range liquidity with remaining ${ethAmt * 0.6} ETH`,
          protocol: 'Uniswap v3 Base Sepolia',
          detail: `ETH/USDC 0.05% pool. Wide range $${(ethPrice * 0.7).toFixed(0)}-$${(ethPrice * 1.3).toFixed(0)} to survive volatility.`,
          expectedReturn: '5-9% APR',
          risk: 'low',
          uniswapHook: 'dynamic fee hook to capture elevated fees during volatility',
        },
      ]
    : [
        {
          step: 1,
          action: `Split ${ethAmt} ETH across two strategies`,
          protocol: 'Uniswap v3 Base Sepolia',
          detail: `50% into tight ETH/USDC 0.05% range ($${(ethPrice * 0.95).toFixed(0)}-$${(ethPrice * 1.05).toFixed(0)}) for max fee APR. 50% held for directional upside.`,
          expectedReturn: '8-15% APR blended',
          risk: 'medium',
        },
      ];

  return {
    summary: `With ${ethAmt} ETH (~$${usdVal}) and current RSI of ${rsi} (${trend} trend), a split strategy of liquidity provision + directional hold is recommended.`,
    marketContext: `ETH is at $${ethPrice.toFixed(2)} with RSI=${rsi} indicating ${rsi < 40 ? 'oversold conditions — accumulation opportunity' : rsi > 70 ? 'overbought — consider reducing exposure' : 'neutral momentum — balanced approach optimal'}.`,
    actions,
    totalExpectedReturn: isBullish ? '15-35% blended (fees + price appreciation)' : isBearish ? '5-10% downside-protected APR' : '8-15% APR',
    riskProfile: `Medium risk. Assumes ETH stays within ±30% of current price over 30 days.`,
    warnings: [
      'Impermanent loss risk when providing concentrated liquidity.',
      'Base Sepolia is a testnet — all values are simulated.',
      rsi > 70 ? 'Overbought RSI suggests short-term pullback risk.' : rsi < 30 ? 'Oversold RSI may mean continued downside before recovery.' : '',
    ].filter(Boolean),
  };
}
