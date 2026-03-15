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
  budget: 100,
  remainingBudget: 99,
  maxTradeSize: 50,
  dailyTrades: 1,
  maxDailyTrades: 10,
  status: 'active',
  battleScore: 12,
  walletAddress: '0x1234567890123456789012345678901234567890',
  currentStealthAddress: '0xab27f...c4e9',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  tradeHistory: [
    {
      id: 'trade-1',
      agentId: 'agent-mock-1',
      action: 'BUY',
      amount: 1, // 1 USDC testnet trade
      price: 3100,
      reasoning: 'AI Logic: RSI dropped below 20 on the 1H chart and market sentiment shifted to extreme fear. The order book shows heavy accumulation at this level. Executing a 1 USDC test buy to validate the stealth routing mechanism before scaling up.',
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
      txHash: '0x17aa9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd95',
      chainStatus: 'success',
      explorerUrl: 'https://sepolia.basescan.org/tx/0x17aa9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd95',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    }
  ]
};

const MOCK_AGENT_2: Agent = {
  id: 'agent-mock-2',
  userId: 'anonymous',
  name: 'Degen Sniper',
  personality: 'risk_taker',
  budget: 200,
  remainingBudget: 202,
  maxTradeSize: 50,
  dailyTrades: 1,
  maxDailyTrades: 20,
  status: 'active',
  battleScore: 8,
  walletAddress: '0x9876543210987654321098765432109876543210',
  currentStealthAddress: '0xfe31d...b8a2',
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  tradeHistory: [
    {
      id: 'trade-2',
      agentId: 'agent-mock-2',
      action: 'SELL',
      amount: 2, // 2 USDC testnet trade
      price: 0.005,
      reasoning: 'AI Logic: Detected a sudden spike in social velocity and on-chain whale distributions indicating a local top. Liquidating 2 USDC worth of the position into strength right at resistance to lock in secured PnL.',
      confidence: 0.92,
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
      txHash: '0x94bb9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd22',
      chainStatus: 'success',
      explorerUrl: 'https://sepolia.basescan.org/tx/0x94bb9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd22',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
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
