export type Personality =
  | 'risk_taker'
  | 'safe_player'
  | 'balanced'
  | 'momentum_hunter'
  | 'contrarian'
  | 'custom';

export type AgentStatus = 'active' | 'paused' | 'stopped';
export type TradeAction = 'BUY' | 'SELL' | 'HOLD';
export type Trend = 'up' | 'down' | 'sideways';

export interface MarketData {
  ethPrice: number;
  rsi: number;
  trend: Trend;
  timestamp: string;
}

export interface SwapStrategy {
  tokenIn: string;          // e.g. "USDC" or "ETH"
  tokenOut: string;         // e.g. "ETH" or "USDC"
  pool: string;             // Uniswap pool description e.g. "ETH/USDC 0.05%"
  feeTier: '0.01%' | '0.05%' | '0.3%' | '1%';
  slippageTolerance: string; // e.g. "0.5%"
  executionStyle: string;   // e.g. "market", "TWAP over 5 min", "limit at $X"
  hookRecommendation: string; // Uniswap v4 hook advice
  estimatedPriceImpact: string; // e.g. "< 0.1%"
}

export interface AIReasoning {
  action: TradeAction;
  confidence: number;
  reasoning: string;
  swapStrategy: SwapStrategy;
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
  txHash?: string;          // on-chain tx hash (Base Sepolia)
  explorerUrl?: string;     // basescan link
  chainStatus?: 'success' | 'simulated' | 'failed';
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
  tagline?: string;         // Descriptive tagline for ENS
  avatar?: string;          // URL to image/avatar for ENS
  allowedCryptos?: string[];// Currencies the agent is permitted to swap
  walletAddress?: string;   // linked on-chain address (Base Sepolia)
  currentStealthAddress?: string; // stealth address for demo
  lastTxHash?: string;      // most recent on-chain tx
  createdAt: string;
  tradeHistory: Trade[];
}

export interface BattleAgentDetails {
  action: TradeAction;
  confidence: number;
  score: number;
  reasoning: string;
  swapStrategy: SwapStrategy;
}

export interface BattleResult {
  winnerAgentId: string;
  loserAgentId: string;
  winnerName: string;
  loserName: string;
  reasoning: string;
  timestamp: string;
  marketData: MarketData;
  agent1Details: BattleAgentDetails;
  agent2Details: BattleAgentDetails;
}

export interface CollaborationRequest {
  consultingAgentId: string;
  consultedAgentId: string;
  marketData: MarketData;
}

export interface CollaborationResponse {
  advice: string;
  suggestedAction: TradeAction;
  confidence: number;
}
