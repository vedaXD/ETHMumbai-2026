/**
 * BitGo Client Service
 * Calls API routes that handle server-side BitGo operations
 */
export class BitGoService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bitgo`
    : '/api/bitgo';

  /**
   * Initialize BitGo SDK (no-op on client side)
   */
  static initialize() {
    console.log('✅ BitGo client service ready');
    return true;
  }

  /**
   * Get client instance (no-op on client side)
   */
  static getClient() {
    return this;
  }

  /**
   * Create a new agent wallet with policy governance
   */
  static async createAgentWallet(
    agentId: string,
    agentName: string,
    maxSpendLimit: number = 100
  ) {
    try {
      console.log(`[BitGo] Creating policy-governed wallet for agent ${agentId}`);

      const response = await fetch(`${this.baseUrl}/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName, maxSpendLimit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wallet');
      }

      console.log(`✅ Wallet created: ${data.wallet.walletId}`);
      return data.wallet;

    } catch (error) {
      console.error('[BitGo] Wallet creation failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance for an agent
   */
  static async getWalletBalance(walletId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/balance`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get balance');
      }

      return data.balance;
    } catch (error) {
      console.error('[BitGo] Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Sign and broadcast a trade transaction
   */
  static async signAndBroadcastTrade(
    walletId: string,
    tradeIntent: {
      to: string;
      amount: string;
      data?: string;
      gasLimit?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
    }
  ) {
    try {
      console.log(`[BitGo] Enforcing policies for wallet ${walletId}...`);

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, tradeIntent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transaction failed');
      }

      console.log(`✅ Transaction signed and broadcast`);
      return data.result;

    } catch (error) {
      console.error('[BitGo] Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   */
  static async getTransactionHistory(walletId: string, limit: number = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/wallets/${walletId}/transactions?limit=${limit}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get transaction history');
      }

      return {
        transactions: data.transactions,
        count: data.count,
      };
    } catch (error) {
      console.error('[BitGo] Failed to get transaction history:', error);
      throw error;
    }
  }

  /**
   * Set spending limits policy on wallet (not implemented via API yet)
   */
  static async setSpendingLimits(walletId: string, dailyLimit: string) {
    console.warn('[BitGo] setSpendingLimits not yet implemented');
    return { success: false, message: 'Not implemented' };
  }

  /**
   * Estimate gas for a transaction (placeholder)
   */
  static async estimateGas(from: string, to: string, amount: string, data?: string) {
    return {
      gasLimit: '21000',
      maxFeePerGas: '20000000000',
      maxPriorityFeePerGas: '2000000000',
    };
  }

  /**
   * Get agent wallet details
   */
  static async getWalletDetails(walletId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get wallet details');
      }

      return data.wallet;
    } catch (error) {
      console.error('[BitGo] Failed to get wallet details:', error);
      throw error;
    }
  }
}
