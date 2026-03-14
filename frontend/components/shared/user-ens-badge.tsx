'use client';

import { useUserEns } from '@/hooks/useEns';
import { useWallet } from '@/lib/WalletContext';
import Image from 'next/image';
import { useState } from 'react';
import { Wallet, ChevronDown, LogOut, ExternalLink } from 'lucide-react';

interface UserEnsBadgeProps {
  address?: string | null;
}

export function UserEnsBadge({ address }: UserEnsBadgeProps) {
  const { connect, connecting, connectStep, userVault, disconnect } = useWallet();
  const { displayName, ensAvatar, isPremiumUser, isLoading } = useUserEns(address);
  const [open, setOpen] = useState(false);

  // Not connected — show connect button with live step feedback
  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="px-5 py-1.5 bg-white/10 border border-white/10 text-white text-xs font-medium rounded-full hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-70 min-w-[140px] text-center"
      >
        {connecting ? (connectStep || 'Connecting...') : 'Connect Wallet'}
      </button>
    );
  }

  if (isLoading) {
    return (
      <button className="px-5 py-1.5 bg-white/10 border border-white/10 text-white/50 text-xs font-medium rounded-full animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-white/20" />
        Loading...
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`px-4 py-1.5 bg-white/10 border text-xs font-medium rounded-full hover:bg-white/20 transition-all duration-200 flex items-center gap-2 ${isPremiumUser ? 'border-[#3888ff] text-white shadow-[0_0_10px_rgba(56,136,255,0.3)]' : 'border-white/10 text-white'}`}
      >
        {ensAvatar ? (
          <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
            <Image src={ensAvatar} alt={displayName || 'Avatar'} fill className="object-cover" />
          </div>
        ) : (
          <div className={`w-4 h-4 rounded-full flex-shrink-0 ${isPremiumUser ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/20'}`} />
        )}
        <span>{displayName}</span>
        {isPremiumUser && (
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">ENS</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
          {/* Identity */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            {ensAvatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image src={ensAvatar} alt={displayName || ''} fill className="object-cover" />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full flex-shrink-0 ${isPremiumUser ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/10'}`} />
            )}
            <div>
              <p className="text-white text-sm font-semibold">{displayName}</p>
              <p className="text-zinc-500 text-xs font-mono">{address.slice(0,8)}...{address.slice(-6)}</p>
            </div>
          </div>

          {/* BitGo Vault */}
          <div className="space-y-1">
            <p className="text-zinc-500 text-xs uppercase tracking-wide">Your BitGo Vault</p>
            {userVault ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <Wallet className="w-3 h-3" /> Base Sepolia Vault
                </div>
                <p className="font-mono text-xs text-white/70 break-all">{userVault.address}</p>
                <a
                  href={`https://sepolia.basescan.org/address/${userVault.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                >
                  View on Basescan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-400/80 text-xs">
                No vault yet. Disconnect and reconnect to create one.
              </div>
            )}
          </div>

          {/* Disconnect */}
          <button
            onClick={() => { disconnect(); setOpen(false); }}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
