/**
 * BitGo Types for Base Sepolia Integration
 */

// Wallet Types
export interface BitGoWallet {
  walletId: string;
  address: string;
  coin: string;
  policies: string[];
  agentId: string;
  agentName: string;
  backupKeycard?: any;
}

export interface WalletBalance {
  balance: string;
  confirmedBalance: string;
  spendableBalance: string;
}

export interface WalletDetails {
  id: string;
  label: string;
  coin: string;
  balance: string;
  confirmedBalance: string;
  spendableBalance: string;
  receiveAddress: string;
}

// Transaction Types
export interface TradeIntent {
  to: string;
  amount: string;
  data?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionResult {
  status: 'success' | 'failure' | 'policy_violation';
  txHash: string | null;
  transfer?: any;
  txid?: string;
  error?: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  count: number;
}

export interface Transaction {
  txid: string;
  date: string;
  state: 'confirmed' | 'pending' | 'failed';
  value: string;
  valueString: string;
  feeString: string;
  payGoFeeString: string;
  usd: number;
  usdRate: number;
  type: string;
  creator: string;
  comment?: string;
}

// Policy Types
export interface PolicyRule {
  id: string;
  type: 'velocityLimit' | 'transactionLimit' | 'whitelist';
  condition: PolicyCondition;
  action: PolicyAction;
}

export interface PolicyCondition {
  type: 'velocity' | 'amount' | 'address';
  amount?: string;
  timeWindow?: number;
  groupTags?: string[];
  addresses?: string[];
}

export interface PolicyAction {
  type: 'deny' | 'approve' | 'review';
}

// Agent Types
export interface TradingAgent {
  id: string;
  name: string;
  walletId: string;
  walletAddress: string;
  personality: 'conservative' | 'aggressive' | 'balanced' | 'momentum' | 'contrarian';
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  limits: {
    maxTradeSize: number;
    maxDailyTrades: number;
    dailySpendLimit: string; // in wei
  };
  stats: {
    totalTrades: number;
    todayTrades: number;
    pnl: number;
    pnlPercent: number;
  };
  status: 'active' | 'paused' | 'stopped';
  createdAt: string;
  lastTradeAt?: string;
}

// Network Types
export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet: boolean;
}

// BitGo Configuration Types
export interface BitGoConfig {
  accessToken: string;
  env: 'test' | 'prod';
  apiUrl?: string;
  stellarFederationServerUrl?: string;
}

export interface BitGoWalletParams {
  label: string;
  passphrase: string;
  enterprise?: string;
  tags?: string[];
  backup?: {
    provider: string;
    passphrase: string;
  };
}

// Gas Estimation Types
export interface GasEstimation {
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

// React Hook Types
export interface UseBitGoWalletReturn {
  wallet: BitGoWallet | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  createWallet: (agentName: string, maxSpendLimit?: number) => Promise<BitGoWallet | null>;
  loadWallet: (walletId: string) => Promise<WalletDetails | null>;
  refreshBalance: () => Promise<WalletBalance | null>;
  executeTrade: (tradeIntent: TradeIntent) => Promise<TransactionResult>;
  getTransactions: (limit?: number) => Promise<TransactionHistory | null>;
  setSpendingLimits: (dailyLimit: string) => Promise<{ success: boolean; policy: PolicyRule }>;
}

// Error Types
export interface BitGoError {
  name: string;
  message: string;
  requestId?: string;
  status?: number;
}

// Webhook Types (for future integration)
export interface BitGoWebhook {
  type: 'transaction' | 'transfer' | 'pendingapproval';
  walletId: string;
  hash?: string;
  transfer?: any;
}
