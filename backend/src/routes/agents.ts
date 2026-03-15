import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { AgentStore } from '../database/agentStore';
import { Agent, Personality } from '../types/agent';
import { fetchMarketData } from '../services/marketData';
import { runBattle, runCollaboration } from '../services/battleArena';
import { runTradingCycle } from '../services/tradingEngine';
import { runStrategyAdvisor } from '../services/strategyAdvisor';

const router = Router();

const VALID_PERSONALITIES: Personality[] = [
  'risk_taker',
  'safe_player',
  'balanced',
  'momentum_hunter',
  'contrarian',
];

// ─── GET /api/agents ─────────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  res.json(AgentStore.list());
});

// ─── GET /api/agents/market ───────────────────────────────────────────────────
router.get('/market', async (_req: Request, res: Response) => {
  try {
    const data = await fetchMarketData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/agents/battle-log ───────────────────────────────────────────────
router.get('/battle-log', (_req: Request, res: Response) => {
  res.json(AgentStore.getBattleLog());
});

// ─── GET /api/agents/:id ─────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  return res.json(agent);
});

// ─── POST /api/agents ────────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  const { userId = 'anonymous', name, personality, budget, maxTradeSize, maxDailyTrades } = req.body as {
    userId?: string;
    name: string;
    personality: Personality;
    budget: number;
    maxTradeSize?: number;
    maxDailyTrades?: number;
  };

  if (!name || !personality || !budget) {
    return res.status(400).json({ error: 'name, personality, and budget are required' });
  }

  if (!VALID_PERSONALITIES.includes(personality)) {
    return res.status(400).json({
      error: `Invalid personality. Choose one of: ${VALID_PERSONALITIES.join(', ')}`,
    });
  }

  const safeBudget = Number(budget);
  if (isNaN(safeBudget) || safeBudget <= 0) {
    return res.status(400).json({ error: 'budget must be a positive number' });
  }

  // Generate a mock stealth address for the demo
  const mockStealthAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

  const agent: Agent = {
    id: crypto.randomUUID(),
    userId,
    name: String(name).slice(0, 64),
    personality,
    budget: safeBudget,
    remainingBudget: safeBudget,
    maxTradeSize: Number(maxTradeSize) || safeBudget * 0.1,
    dailyTrades: 0,
    maxDailyTrades: Number(maxDailyTrades) || 10,
    status: 'active',
    battleScore: 0,
    currentStealthAddress: mockStealthAddress,
    createdAt: new Date().toISOString(),
    tradeHistory: [],
  };

  AgentStore.create(agent);
  console.log(`[Agents] Created agent: ${agent.name} (${agent.personality})`);
  return res.status(201).json(agent);
});

// ─── PATCH /api/agents/:id ───────────────────────────────────────────────────
router.patch('/:id', (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const allowedFields: (keyof Agent)[] = [
    'name',
    'personality',
    'status',
    'maxTradeSize',
    'maxDailyTrades',
    'remainingBudget',
    'walletAddress',
  ];

  const patch: Partial<Agent> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      (patch as any)[field] = req.body[field];
    }
  }

  const updated = AgentStore.update(req.params.id, patch);
  return res.json(updated);
});

// ─── DELETE /api/agents/:id ──────────────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = AgentStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Agent not found' });
  return res.json({ message: 'Agent deleted' });
});

// ─── POST /api/agents/battle ─────────────────────────────────────────────────
router.post('/battle', async (req: Request, res: Response) => {
  const { agentId1, agentId2, stakeAmount } = req.body as { agentId1: string; agentId2: string; stakeAmount?: number };

  if (!agentId1 || !agentId2) {
    return res.status(400).json({ error: 'agentId1 and agentId2 are required' });
  }

  const agent1 = AgentStore.get(agentId1);
  const agent2 = AgentStore.get(agentId2);

  if (!agent1) return res.status(404).json({ error: `Agent ${agentId1} not found` });
  if (!agent2) return res.status(404).json({ error: `Agent ${agentId2} not found` });

  // Optional: Verify agents have enough balance to stake
  const stake = Number(stakeAmount) || 0;
  if (stake > 0 && (agent1.remainingBudget < stake || agent2.remainingBudget < stake)) {
    return res.status(400).json({ error: 'One or both agents have insufficient USDC to stake this amount.' });
  }

  try {
    const result = await runBattle(agent1, agent2, stake);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/agents/collaborate ────────────────────────────────────────────
router.post('/collaborate', async (req: Request, res: Response) => {
  const { consultingAgentId, consultedAgentId } = req.body as {
    consultingAgentId: string;
    consultedAgentId: string;
  };

  if (!consultingAgentId || !consultedAgentId) {
    return res.status(400).json({ error: 'consultingAgentId and consultedAgentId are required' });
  }

  const consulting = AgentStore.get(consultingAgentId);
  const consulted = AgentStore.get(consultedAgentId);

  if (!consulting) return res.status(404).json({ error: `Agent ${consultingAgentId} not found` });
  if (!consulted) return res.status(404).json({ error: `Agent ${consultedAgentId} not found` });

  try {
    const market = await fetchMarketData();
    const response = await runCollaboration(consulting, consulted, market);
    return res.json({ market, ...response });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/agents/strategy ───────────────────────────────────────────────
// Natural language DeFi strategy advisor — "I have 5 ETH, what should I do?"
router.post('/strategy', async (req: Request, res: Response) => {
  const { question } = req.body as { question?: string };

  if (!question || question.trim().length < 5) {
    return res.status(400).json({ error: 'question is required (min 5 chars)' });
  }

  try {
    const market = await fetchMarketData();
    const strategy = await runStrategyAdvisor(question.trim(), market);
    return res.json({ market, strategy });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/agents/:id/link-wallet ────────────────────────────────────────
// Associate an on-chain wallet address with an agent
router.post('/:id/link-wallet', (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const { walletAddress } = req.body as { walletAddress?: string };
  if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: 'walletAddress must be a valid 0x-prefixed Ethereum address' });
  }

  const updated = AgentStore.update(req.params.id, { walletAddress });
  console.log(`[Agents] Linked wallet ${walletAddress} to agent ${agent.name}`);
  return res.json({ agentId: req.params.id, walletAddress: updated?.walletAddress });
});

// ─── POST /api/agents/:id/cycle ──────────────────────────────────────────────
// Manually trigger one trading cycle for an agent (useful for testing)
router.post('/:id/cycle', async (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  try {
    const result = await runTradingCycle(agent);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/agents/:id/fund ───────────────────────────────────────────────
router.post('/:id/fund', (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const updated = AgentStore.update(req.params.id, {
    budget: agent.budget + Number(amount),
    remainingBudget: agent.remainingBudget + Number(amount),
  });
  return res.json({ success: true, agent: updated });
});

// ─── POST /api/agents/:id/withdraw ───────────────────────────────────────────
router.post('/:id/withdraw', (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  if (agent.remainingBudget < Number(amount)) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  const updated = AgentStore.update(req.params.id, {
    budget: agent.budget - Number(amount),
    remainingBudget: agent.remainingBudget - Number(amount),
  });
  return res.json({ success: true, agent: updated });
});

// ─── POST /api/agents/:id/faucet ─────────────────────────────────────────────
router.post('/:id/faucet', (req: Request, res: Response) => {
  const agent = AgentStore.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  // Add a flat $10,000 mock faucet amount
  const FAUCET_AMOUNT = 10000;
  
  const updated = AgentStore.update(req.params.id, {
    budget: agent.budget + FAUCET_AMOUNT,
    remainingBudget: agent.remainingBudget + FAUCET_AMOUNT,
  });
  return res.json({ success: true, agent: updated, faucetAmount: FAUCET_AMOUNT });
});

export default router;
