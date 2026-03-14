import { Agent, Trade } from '../types/agent';

// In-memory store — no database required for this hackathon build
// In-memory store — no database required for this hackathon build
const agents = new Map<string, Agent>();
const battleLog: Array<{ timestamp: string; result: string }> = [];

// Inject mock data for demo purposes
const MOCK_AGENT_1: Agent = {
  id: 'agent-mock-1',
  userId: 'anonymous',
  name: 'Vitalik.eth',
  personality: 'contrarian',
  budget: 10000,
  remainingBudget: 9450,
  maxTradeSize: 1000,
  dailyTrades: 3,
  maxDailyTrades: 10,
  status: 'active',
  battleScore: 12,
  walletAddress: '0x1234567890123456789012345678901234567890',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  tradeHistory: [
    {
      id: 'trade-1',
      agentId: 'agent-mock-1',
      action: 'BUY',
      amount: 550,
      price: 3100,
      reasoning: 'RSI dropped below 20 on the 1H chart. Market sentiment is overly fearful.',
      confidence: 0.85,
      swapStrategy: {
        tokenIn: 'USDC',
        tokenOut: 'WETH',
        pool: 'WETH/USDC 0.05%',
        feeTier: '0.05%',
        slippageTolerance: '0.5%',
        executionStyle: 'TWAP over 5 min',
        hookRecommendation: 'Use stop-loss hook if price drops 2%',
        estimatedPriceImpact: '< 0.1%',
      },
      txHash: '0xabc123...',
      chainStatus: 'success',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'trade-2',
      agentId: 'agent-mock-1',
      action: 'SELL',
      amount: 200,
      price: 3350,
      reasoning: 'Taking profit on a sharp sudden relief bounce, crowd shifting to greed.',
      confidence: 0.72,
      swapStrategy: {
        tokenIn: 'WETH',
        tokenOut: 'USDC',
        pool: 'WETH/USDC 0.05%',
        feeTier: '0.05%',
        slippageTolerance: '0.3%',
        executionStyle: 'market',
        hookRecommendation: 'None',
        estimatedPriceImpact: '< 0.05%',
      },
      txHash: '0xdef456...',
      chainStatus: 'success',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ]
};

const MOCK_AGENT_2: Agent = {
  id: 'agent-mock-2',
  userId: 'anonymous',
  name: 'Degen Sniper',
  personality: 'risk_taker',
  budget: 5000,
  remainingBudget: 1500,
  maxTradeSize: 2000,
  dailyTrades: 8,
  maxDailyTrades: 20,
  status: 'active',
  battleScore: 8,
  walletAddress: '0x9876543210987654321098765432109876543210',
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  tradeHistory: [
    {
      id: 'trade-3',
      agentId: 'agent-mock-2',
      action: 'BUY',
      amount: 3500,
      price: 0.005,
      reasoning: 'New meme token detected with high volume and social sentiment spike.',
      confidence: 0.65,
      swapStrategy: {
        tokenIn: 'WETH',
        tokenOut: 'MEME',
        pool: 'MEME/WETH 1%',
        feeTier: '1%',
        slippageTolerance: '5%',
        executionStyle: 'market',
        hookRecommendation: 'Use MEV protection hook',
        estimatedPriceImpact: '~ 2%',
      },
      txHash: '0x111222...',
      chainStatus: 'success',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    }
  ]
};

agents.set(MOCK_AGENT_1.id, MOCK_AGENT_1);
agents.set(MOCK_AGENT_2.id, MOCK_AGENT_2);

export const AgentStore = {
  list(): Agent[] {
    return Array.from(agents.values());
  },

  listActive(): Agent[] {
    return Array.from(agents.values()).filter((a) => a.status === 'active');
  },

  get(id: string): Agent | undefined {
    return agents.get(id);
  },

  create(agent: Agent): Agent {
    agents.set(agent.id, agent);
    return agent;
  },

  update(id: string, patch: Partial<Agent>): Agent | undefined {
    const existing = agents.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    agents.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return agents.delete(id);
  },

  addTrade(agentId: string, trade: Trade): Agent | undefined {
    const agent = agents.get(agentId);
    if (!agent) return undefined;

    const updated: Agent = {
      ...agent,
      remainingBudget:
        trade.action === 'BUY'
          ? agent.remainingBudget - trade.amount
          : trade.action === 'SELL'
          ? agent.remainingBudget + trade.amount
          : agent.remainingBudget,
      dailyTrades: agent.dailyTrades + 1,
      tradeHistory: [trade, ...agent.tradeHistory].slice(0, 50), // Keep last 50
    };
    agents.set(agentId, updated);
    return updated;
  },

  resetDailyTrades(): void {
    for (const [id, agent] of agents.entries()) {
      agents.set(id, { ...agent, dailyTrades: 0 });
    }
  },

  addBattleLog(entry: string): void {
    battleLog.push({ timestamp: new Date().toISOString(), result: entry });
    if (battleLog.length > 100) battleLog.shift();
  },

  getBattleLog(): Array<{ timestamp: string; result: string }> {
    return [...battleLog];
  },
};
