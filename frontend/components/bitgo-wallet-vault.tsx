'use client';

import { useEffect, useState } from 'react';
import { useBitGoWallet } from '@/lib/bitgo/useBitGoWallet';

interface WalletStats {
  balance: string;
  confirmedBalance: string;
  address: string;
  policies: number;
  status: 'active' | 'inactive' | 'loading';
}

export function BitgoVaultBar({
  botAddress,
  viewMode,
  walletId
}: {
  botAddress: string | null;
  viewMode: string;
  walletId?: string;
}) {
  const { wallet, loadWallet, refreshBalance, isInitialized } = useBitGoWallet();
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet data when walletId is provided
  useEffect(() => {
    if (walletId && isInitialized) {
      setIsLoading(true);
      loadWallet(walletId)
        .then((walletData) => {
          if (walletData) {
            setStats({
              balance: walletData.balance,
              confirmedBalance: walletData.confirmedBalance,
              address: walletData.receiveAddress,
              policies: 2, // This would come from BitGo policy API
              status: 'active',
            });
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [walletId, isInitialized, loadWallet]);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!wallet?.walletId) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [wallet?.walletId, refreshBalance]);

  // Format balance (convert from wei to ETH)
  const formatBalance = (balance: string) => {
    try {
      const eth = Number(balance) / 1e18;
      return eth.toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  // Global analytics view (no specific bot)
  if (!botAddress && !walletId) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-8 flex justify-between items-center bg-gray-900/40">
        <div>
          <h3 className="text-xl font-bold font-mono text-lime-400">Platform Analytics</h3>
          <p className="text-sm text-foreground/60 mt-1">
            Global P2P trades secured by Policy-Governed BitGo Wallets.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">2,451</div>
          <div className="text-sm text-foreground/50">Total AI Agents Online</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card border border-lime-500/30 rounded-lg p-6 mb-8 bg-lime-900/10">
        <div className="animate-pulse">
          <div className="h-6 bg-lime-500/20 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-lime-500/10 rounded w-20 mb-2"></div>
                <div className="h-6 bg-lime-500/20 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Wallet details view
  return (
    <div className="bg-card border border-lime-500/30 rounded-lg p-6 mb-8 bg-lime-900/10 relative overflow-hidden">
      {/* BitGo Logo Background */}
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2zm0 4.3l6.5 12.7H5.5L12 6.3z"/>
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold font-mono text-lime-400 flex items-center gap-2">
          BitGo Wallet Vault
          {viewMode === 'p2p' && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
              Stealth Mode
            </span>
          )}
          {stats?.status === 'active' && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Active
            </span>
          )}
        </h3>

        {/* Copy Address Button */}
        {stats?.address && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(stats.address);
            }}
            className="text-xs bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 px-3 py-1 rounded transition-colors"
          >
            Copy Address
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Vault Status */}
        <div>
          <div className="text-xs text-foreground/50 mb-1">Vault Status</div>
          <div className="text-sm text-emerald-400 font-mono">
            {stats?.status === 'active' ? '✅ Active & Protected' : '⏸ Initializing'}
          </div>
        </div>

        {/* Active Policies */}
        <div>
          <div className="text-xs text-foreground/50 mb-1">Active Policies</div>
          <div className="text-sm">
            {stats?.policies || 0} Enforcement Rules
          </div>
        </div>

        {/* Balance */}
        <div>
          <div className="text-xs text-foreground/50 mb-1">Confirmed Balance</div>
          <div className="text-xl font-bold font-mono text-white">
            {stats?.confirmedBalance
              ? `${formatBalance(stats.confirmedBalance)} ETH`
              : '0.0000 ETH'
            }
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      {stats?.address && (
        <div className="mt-4 pt-4 border-t border-lime-500/20">
          <div className="text-xs text-foreground/50 mb-1">Wallet Address</div>
          <div className="text-sm font-mono text-lime-400/80 break-all">
            {stats.address}
          </div>
        </div>
      )}

      {/* Network Info */}
      <div className="mt-4 pt-4 border-t border-lime-500/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground/50">Network</span>
          <span className="text-lime-400 font-mono">Base Sepolia (Chain ID: 84532)</span>
        </div>
      </div>
    </div>
  );
}
