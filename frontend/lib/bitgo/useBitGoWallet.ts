'use client';

import { useState, useEffect, useCallback } from 'react';
import { BitGoService } from './index';

interface BitGoWallet {
  walletId: string;
  address: string;
  coin: string;
  balance?: string;
  confirmedBalance?: string;
  agentId?: string;
  agentName?: string;
}

interface TradeIntent {
  to: string;
  amount: string;
  data?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export function useBitGoWallet(agentId?: string) {
  const [wallet, setWallet] = useState<BitGoWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize BitGo SDK
  useEffect(() => {
    try {
      BitGoService.initialize();
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize BitGo');
      console.error('BitGo initialization error:', err);
    }
  }, []);

  // Create new wallet for agent
  const createWallet = useCallback(async (
    agentName: string,
    maxSpendLimit: number = 100
  ) => {
    if (!agentId) {
      setError('Agent ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newWallet = await BitGoService.createAgentWallet(
        agentId,
        agentName,
        maxSpendLimit
      );

      setWallet({
        walletId: newWallet.walletId,
        address: newWallet.address,
        coin: newWallet.coin,
        agentId: newWallet.agentId,
        agentName: newWallet.agentName,
      });

      return newWallet;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMsg);
      console.error('Wallet creation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  // Load existing wallet
  const loadWallet = useCallback(async (walletId: string) => {
    setLoading(true);
    setError(null);

    try {
      const walletDetails = await BitGoService.getWalletDetails(walletId);

      setWallet({
        walletId: walletDetails.id,
        address: walletDetails.receiveAddress,
        coin: walletDetails.coin,
        balance: walletDetails.balance,
        confirmedBalance: walletDetails.confirmedBalance,
      });

      return walletDetails;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load wallet';
      setError(errorMsg);
      console.error('Wallet load error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wallet balance
  const refreshBalance = useCallback(async () => {
    if (!wallet?.walletId) return null;

    try {
      const balance = await BitGoService.getWalletBalance(wallet.walletId);

      setWallet((prev) => prev ? {
        ...prev,
        balance: balance.balance,
        confirmedBalance: balance.confirmedBalance,
      } : null);

      return balance;
    } catch (err) {
      console.error('Balance refresh error:', err);
      return null;
    }
  }, [wallet?.walletId]);

  // Execute trade transaction
  const executeTrade = useCallback(async (tradeIntent: TradeIntent) => {
    if (!wallet?.walletId) {
      throw new Error('No wallet connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await BitGoService.signAndBroadcastTrade(
        wallet.walletId,
        tradeIntent
      );

      // Refresh balance after successful trade
      if (result.status === 'success') {
        await refreshBalance();
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wallet?.walletId, refreshBalance]);

  // Get transaction history
  const getTransactions = useCallback(async (limit: number = 10) => {
    if (!wallet?.walletId) return null;

    try {
      return await BitGoService.getTransactionHistory(wallet.walletId, limit);
    } catch (err) {
      console.error('Transaction history error:', err);
      return null;
    }
  }, [wallet?.walletId]);

  // Set spending limits
  const setSpendingLimits = useCallback(async (dailyLimit: string) => {
    if (!wallet?.walletId) {
      throw new Error('No wallet connected');
    }

    try {
      return await BitGoService.setSpendingLimits(wallet.walletId, dailyLimit);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to set spending limits';
      setError(errorMsg);
      throw err;
    }
  }, [wallet?.walletId]);

  return {
    wallet,
    loading,
    error,
    isInitialized,
    createWallet,
    loadWallet,
    refreshBalance,
    executeTrade,
    getTransactions,
    setSpendingLimits,
  };
}
