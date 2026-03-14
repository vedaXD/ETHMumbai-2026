'use client';

import { useState } from 'react';
import { useBitGoWallet } from '@/lib/bitgo/useBitGoWallet';
import { BASE_SEPOLIA_TOKENS } from '@/lib/bitgo/config';

/**
 * Example Agent Component
 * Demonstrates how to integrate BitGo wallet with your trading agents
 */
export function TradingAgentWithBitGo({ agentId }: { agentId: string }) {
  const {
    wallet,
    loading,
    error,
    isInitialized,
    createWallet,
    executeTrade,
    refreshBalance,
    getTransactions,
  } = useBitGoWallet(agentId);

  const [agentName, setAgentName] = useState(`Agent_${agentId}`);
  const [maxSpendLimit, setMaxSpendLimit] = useState(100);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Step 1: Create wallet for agent
  const handleCreateWallet = async () => {
    const result = await createWallet(agentName, maxSpendLimit);
    if (result) {
      console.log('✅ Wallet created:', result);
    }
  };

  // Step 2: Execute a trade (example: swap USDC to ETH)
  const handleExecuteTrade = async () => {
    if (!wallet) return;

    try {
      const tradeIntent = {
        to: BASE_SEPOLIA_TOKENS.USDC, // Example: sending to USDC contract
        amount: '1000000', // 1 USDC (6 decimals)
        data: '0x', // Add swap data here from your DEX
        gasLimit: '250000',
      };

      const result = await executeTrade(tradeIntent);

      if (result.status === 'success') {
        console.log('✅ Trade executed:', result.txHash);
        // You can now track this trade in your database
      } else if (result.status === 'policy_violation') {
        console.error('❌ Policy violation:', result.error);
        // Handle policy violations (e.g., exceeded spending limit)
      }
    } catch (err) {
      console.error('Trade failed:', err);
    }
  };

  // Step 3: Get transaction history
  const handleGetHistory = async () => {
    const history = await getTransactions(20);
    if (history) {
      setTransactions(history.transactions);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h2 className="text-xl font-bold mb-4">Trading Agent: {agentId}</h2>

      {/* Initialization Status */}
      {!isInitialized && (
        <div className="text-yellow-500 mb-4">
          ⚠️ BitGo SDK not initialized. Check your environment variables.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 mb-4 text-red-400">
          Error: {error}
        </div>
      )}

      {/* Step 1: Create Wallet */}
      {!wallet && isInitialized && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Step 1: Create Agent Wallet</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Max Spend Limit (USDC)</label>
              <input
                type="number"
                value={maxSpendLimit}
                onChange={(e) => setMaxSpendLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded"
              />
            </div>
            <button
              onClick={handleCreateWallet}
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Wallet'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Wallet Created - Show Details */}
      {wallet && (
        <div className="space-y-4">
          <div className="bg-lime-500/10 border border-lime-500/30 rounded p-4">
            <h3 className="text-lg font-semibold text-lime-400 mb-2">
              ✅ Wallet Active
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-foreground/60">Wallet ID:</span>
                <span className="ml-2 font-mono">{wallet.walletId}</span>
              </div>
              <div>
                <span className="text-foreground/60">Address:</span>
                <span className="ml-2 font-mono text-xs break-all">{wallet.address}</span>
              </div>
              <div>
                <span className="text-foreground/60">Balance:</span>
                <span className="ml-2 font-mono">
                  {wallet.balance ? (Number(wallet.balance) / 1e18).toFixed(4) : '0.0000'} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={refreshBalance}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Refresh Balance
            </button>

            <button
              onClick={handleExecuteTrade}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute Trade'}
            </button>

            <button
              onClick={handleGetHistory}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Get Transaction History
            </button>
          </div>

          {/* Transaction History */}
          {transactions.length > 0 && (
            <div className="mt-4 border border-border rounded p-4">
              <h4 className="font-semibold mb-2">Recent Transactions</h4>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx, i) => (
                  <div key={i} className="text-sm flex justify-between border-b border-border pb-2">
                    <span className="font-mono">{tx.txid?.substring(0, 10)}...</span>
                    <span>{tx.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
