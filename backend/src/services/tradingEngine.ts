import { Agent, MarketData, Personality, Trade, TradeAction } from '../types/agent';
import { fetchMarketData } from './marketData';
import { runAIReasoning } from './aiReasoning';
import { AgentStore } from '../database/agentStore';
import { gatherAllSignals } from './elsaTools';
import { executeSwap } from './chainService';
import crypto from 'crypto';

const MAX_LOSS_THRESHOLD = 0.20; // Stop trading if total loss > 20%

// Maps agent personality to Uniswap V3 fee tier (in basis points)
const FEE_TIER_MAP: Record<Personality, '500' | '3000' | '10000'> = {
  risk_taker:      '3000',  // 0.3% — higher fees, faster fills
  safe_player:     '500',   // 0.05% — low fee, minimal impact
  balanced:        '500',
  momentum_hunter: '3000',
  contrarian:      '500',
  custom:          '3000',
};

function shouldTrade(agent: Agent, tradeAmount: number): { allowed: boolean; reason: string } {
  if (agent.status !== 'active') {
    return { allowed: false, reason: 'Agent is not active' };
  }

  if (tradeAmount > agent.remainingBudget) {
    return { allowed: false, reason: 'Insufficient remaining budget' };
  }

  if (tradeAmount > agent.maxTradeSize) {
    return { allowed: false, reason: 'Trade exceeds max trade size' };
  }

  if (agent.dailyTrades >= agent.maxDailyTrades) {
    return { allowed: false, reason: 'Daily trade limit reached' };
  }

  const totalLoss = (agent.budget - agent.remainingBudget) / agent.budget;
  if (totalLoss > MAX_LOSS_THRESHOLD) {
    return { allowed: false, reason: `Total drawdown ${(totalLoss * 100).toFixed(1)}% exceeds 20% safety limit` };
  }

  return { allowed: true, reason: 'OK' };
}

function calcTradeAmount(agent: Agent, confidence: number): number {
  // Scale amount by confidence: 20-40% of maxTradeSize at low confidence, up to 100% at max
  const factor = 0.2 + (confidence / 100) * 0.8;
  let amount = Math.min(agent.maxTradeSize * factor, agent.remainingBudget);
  
  // Hardcode requested limit for default mock agents so they don't do massive trades
  if (agent.id.includes('agent-mock') || agent.name.toLowerCase().includes('degen')) {
    amount = Math.min(amount, 50); // cap to $50 max as requested
  }
  
  return amount;
}

export async function runTradingCycle(agent: Agent): Promise<{
  trade: Trade | null;
  skipped: boolean;
  reason: string;
  market: MarketData;
}> {
  console.log(`[TradingEngine] Cycle for ${agent.name} (${agent.personality})`);

  // Step 1: Fetch market data + gather all 19 OpenClaw signals in parallel
  const [market, signals] = await Promise.all([
    fetchMarketData(),
    gatherAllSignals().catch((err) => {
      console.warn('[TradingEngine] Signal gathering failed, proceeding without:', err.message);
      return undefined;
    }),
  ]);

  // Step 2+3: Run AI reasoning — enriched with 19-tool analysis if available
  const reasoning = await runAIReasoning(
    agent.personality,
    agent.remainingBudget,
    market,
    signals ?? undefined
  );

  console.log(
    `[TradingEngine] ${agent.name} → action=${reasoning.action} confidence=${reasoning.confidence} | "${reasoning.reasoning}"`
  );

  // Step 4: HOLD — skip trade
  if (reasoning.action === 'HOLD') {
    return { trade: null, skipped: true, reason: 'Agent decided to HOLD', market };
  }

  // Step 5: Budget safety checks
  const tradeAmount = calcTradeAmount(agent, reasoning.confidence);
  const { allowed, reason } = shouldTrade(agent, tradeAmount);

  if (!allowed) {
    console.warn(`[TradingEngine] ${agent.name} blocked: ${reason}`);
    return { trade: null, skipped: true, reason, market };
  }

  // Step 6: Execute on-chain swap (or simulation if key not set)
  const feeTier = FEE_TIER_MAP[agent.personality];
  const swapResult = await executeSwap(
    reasoning.action as 'BUY' | 'SELL',
    tradeAmount,
    market.ethPrice,
    feeTier
  );

  // Step 7: Build trade record
  const trade: Trade = {
    id: crypto.randomUUID(),
    agentId: agent.id,
    action: reasoning.action as TradeAction,
    amount: parseFloat(tradeAmount.toFixed(2)),
    price: market.ethPrice,
    reasoning: reasoning.reasoning,
    confidence: reasoning.confidence,
    swapStrategy: reasoning.swapStrategy,
    txHash: swapResult.txHash,
    explorerUrl: swapResult.explorerUrl,
    chainStatus: swapResult.status,
    timestamp: new Date().toISOString(),
  };

  // Step 8: Update budget and persist
  AgentStore.addTrade(agent.id, trade);

  // Track last on-chain tx on the agent itself
  if (swapResult.status !== 'failed') {
    AgentStore.update(agent.id, { lastTxHash: swapResult.txHash });
  }

  console.log(
    `[TradingEngine] ${agent.name} ✅ ${trade.action} $${trade.amount} @ $${trade.price} | ` +
    `chain=${swapResult.status} | tx=${swapResult.txHash.slice(0, 18)}... | ` +
    `${trade.swapStrategy.executionStyle} | slippage ${trade.swapStrategy.slippageTolerance}`
  );

  return { trade, skipped: false, reason: 'Trade executed', market };
}
