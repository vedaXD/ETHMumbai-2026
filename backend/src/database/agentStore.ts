import { Agent, Trade } from '../types/agent';

// In-memory store — no database required for this hackathon build
const agents = new Map<string, Agent>();
const battleLog: Array<{ timestamp: string; result: string }> = [];

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
