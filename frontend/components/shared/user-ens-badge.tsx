'use client';

import { useUserEns } from '@/hooks/useEns';
import { useWallet } from '@/lib/WalletContext';
import Image from 'next/image';

interface UserEnsBadgeProps {
  address?: string | null;
}

export function UserEnsBadge({ address }: UserEnsBadgeProps) {
  const { connect, connecting } = useWallet();
  const { displayName, ensAvatar, isPremiumUser, isLoading } = useUserEns(address);

  // Not connected — show connect button
  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="px-5 py-1.5 bg-white/10 border border-white/10 text-white text-xs font-medium rounded-full hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
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
    <button className={`px-5 py-1.5 bg-white/10 border text-xs font-medium rounded-full hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2 ${isPremiumUser ? 'border-[#3888ff] text-white shadow-[0_0_10px_rgba(56,136,255,0.3)]' : 'border-white/10 text-white'}`}>
      {ensAvatar && (
        <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
          <Image 
            src={ensAvatar} 
            alt={displayName || 'Avatar'} 
            fill
            className="object-cover"
          />
        </div>
      )}
      {!ensAvatar && isPremiumUser && (
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0" />
      )}
      <span>{displayName}</span>
      {isPremiumUser && (
        <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">ENS</span>
      )}
    </button>
  );
}
