/**
 * BitGo server proxy — calls the backend Express API instead of using the SDK directly.
 * This keeps all BitGo credentials (access token, passphrase) on the backend only.
 */
const BACKEND = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export class BitGoServerService {
  static async createAgentWallet(agentId: string, agentName: string, maxSpendLimit = 100) {
    const res = await fetch(`${BACKEND}/api/bitgo/wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, agentName, maxSpendLimit }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create wallet');
    return data.wallet;
  }

  static async getWalletDetails(walletId: string) {
    const res = await fetch(`${BACKEND}/api/bitgo/wallets/${walletId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get wallet');
    return data.wallet;
  }

  static async getWalletBalance(walletId: string) {
    const res = await fetch(`${BACKEND}/api/bitgo/wallets/${walletId}/balance`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get balance');
    return data.balance;
  }

  static async getTransactionHistory(walletId: string, limit = 10) {
    const res = await fetch(
      `${BACKEND}/api/bitgo/wallets/${walletId}/transactions?limit=${limit}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get transactions');
    return { transactions: data.transactions, count: data.count };
  }

  static async signAndBroadcastTrade(
    walletId: string,
    tradeIntent: { to: string; amount: string; data?: string; gasLimit?: string }
  ) {
    const res = await fetch(`${BACKEND}/api/bitgo/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId, tradeIntent }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to execute transaction');
    return data.result;
  }
}
