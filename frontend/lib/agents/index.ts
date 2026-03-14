import { api } from '@/lib/api';

export type Personality =
  | 'risk_taker'
  | 'safe_player'
  | 'balanced'
  | 'momentum_hunter'
  | 'contrarian';

export type AgentStatus = 'active' | 'paused' | 'stopped';
export type TradeAction = 'BUY' | 'SELL' | 'HOLD';

export interface SwapStrategy {
  tokenIn: string;
  tokenOut: string;
  pool: string;
  feeTier: string;
  slippageTolerance: string;
  executionStyle: string;
  hookRecommendation: string;
  estimatedPriceImpact: string;
}

export interface Trade {
  id: string;
  agentId: string;
  action: TradeAction;
  amount: number;
  price: number;
  reasoning: string;
  confidence: number;
  swapStrategy: SwapStrategy;
  timestamp: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  personality: Personality;
  budget: number;
  remainingBudget: number;
  maxTradeSize: number;
  dailyTrades: number;
  maxDailyTrades: number;
  status: AgentStatus;
  battleScore: number;
  createdAt: string;
  tradeHistory: Trade[];
}

export interface MarketData {
  ethPrice: number;
  rsi: number;
  trend: 'up' | 'down' | 'sideways';
  timestamp: string;
}

export interface BattleResult {
  winnerAgentId: string;
  loserAgentId: string;
  winnerName: string;
  loserName: string;
  reasoning: string;
  timestamp: string;
}

export const PERSONALITY_META: Record<
  Personality,
  { label: string; description: string; color: string; border: string; bg: string }
> = {
  risk_taker: {
    label: 'Risk Taker',
    description: 'Buys RSI < 50, sells RSI > 60. High frequency, aggressive entries.',
    color: 'text-amber-400',
    border: 'border-amber-400/50',
    bg: 'bg-amber-400/10',
  },
  safe_player: {
    label: 'Safe Player',
    description: 'Buys RSI < 25, sells RSI > 75. Waits for extreme levels.',
    color: 'text-emerald-400',
    border: 'border-emerald-400/50',
    bg: 'bg-emerald-400/10',
  },
  balanced: {
    label: 'Balanced',
    description: 'Buys RSI < 35, sells RSI > 65. Systematic, moderate risk.',
    color: 'text-blue-400',
    border: 'border-blue-400/50',
    bg: 'bg-blue-400/10',
  },
  momentum_hunter: {
    label: 'Momentum Hunter',
    description: 'Buys on uptrend, sells on reversal. Pure trend-following.',
    color: 'text-violet-400',
    border: 'border-violet-400/50',
    bg: 'bg-violet-400/10',
  },
  contrarian: {
    label: 'Contrarian',
    description: 'Buys RSI < 20, sells RSI > 80. Fades the crowd.',
    color: 'text-rose-400',
    border: 'border-rose-400/50',
    bg: 'bg-rose-400/10',
  },
};

export interface StrategyAction {
  step: number;
  action: string;
  protocol: string;
  detail: string;
  expectedReturn: string;
  risk: 'low' | 'medium' | 'high';
  uniswapHook?: string;
}

export interface StrategyResponse {
  summary: string;
  marketContext: string;
  actions: StrategyAction[];
  totalExpectedReturn: string;
  riskProfile: string;
  warnings: string[];
}

export const AgentService = {
  async list(): Promise<Agent[]> {
    const res = await api.get('/api/agents');
    return res.data as Agent[];
  },

  async get(id: string): Promise<Agent> {
    const res = await api.get(`/api/agents/${id}`);
    return res.data as Agent;
  },

  async create(payload: {
    name: string;
    personality: Personality;
    budget: number;
    maxTradeSize?: number;
    maxDailyTrades?: number;
    userId?: string;
  }): Promise<Agent> {
    const res = await api.post('/api/agents', payload);
    return res.data as Agent;
  },

  async update(id: string, patch: Partial<Agent>): Promise<Agent> {
    const res = await api.patch(`/api/agents/${id}`, patch);
    return res.data as Agent;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/agents/${id}`);
  },

  async getMarket(): Promise<MarketData> {
    const res = await api.get('/api/agents/market');
    return res.data as MarketData;
  },

  async battle(agentId1: string, agentId2: string): Promise<BattleResult> {
    const res = await api.post('/api/agents/battle', { agentId1, agentId2 });
    return res.data as BattleResult;
  },

  async collaborate(
    consultingAgentId: string,
    consultedAgentId: string
  ): Promise<{ advice: string; suggestedAction: string; confidence: number; market: MarketData }> {
    const res = await api.post('/api/agents/collaborate', {
      consultingAgentId,
      consultedAgentId,
    });
    return res.data;
  },

  async triggerCycle(agentId: string): Promise<unknown> {
    const res = await api.post(`/api/agents/${agentId}/cycle`, {});
    return res.data;
  },

  async askStrategy(
    question: string
  ): Promise<{ market: MarketData; strategy: StrategyResponse }> {
    const res = await api.post('/api/agents/strategy', { question });
    return res.data;
  },

  async getBattleLog(): Promise<Array<{ timestamp: string; result: string }>> {
    const res = await api.get('/api/agents/battle-log');
    return res.data;
  },
};
