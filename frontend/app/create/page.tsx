'use client';

import { useState, type ElementType } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Upload, Wallet, Zap, Shield, BarChart2, TrendingUp, Minus,
} from 'lucide-react';
import AppLayout from '@/components/shared/AppLayout';
import { BitGoService } from '@/lib/bitgo';
import { useWallet } from '@/lib/WalletContext';
import { useEnsName } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { registerAgentSubdomain } from '@/lib/ens/registerSubdomain';
import { AgentService, PERSONALITY_META, Personality } from '@/lib/agents';

const PERSONALITY_ICONS: Record<Personality, ElementType> = {
  risk_taker: Zap,
  safe_player: Shield,
  balanced: BarChart2,
  momentum_hunter: TrendingUp,
  contrarian: Minus,
};

export default function CreateAgent() {
  const { address } = useWallet();
  const { data: ensName } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  });

  const [name, setName] = useState('');
  const [personality, setPersonality] = useState<Personality | ''>('');
  const [funding, setFunding] = useState('');
  const [maxTradeSize, setMaxTradeSize] = useState('');
  const [maxDailyTrades, setMaxDailyTrades] = useState('10');
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStep, setMintingStep] = useState('');
  const [minted, setMinted] = useState(false);
  const [agentWallet, setAgentWallet] = useState<{ walletId: string; address: string } | null>(null);
  const [agentEns, setAgentEns] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name || !personality || !funding) return;
    setIsMinting(true);
    setError(null);

    try {
      // Step 1: Register agent with trading engine
      setMintingStep('Registering agent with trading engine...');
      await AgentService.create({
        name,
        personality: personality as Personality,
        budget: Number(funding),
        maxTradeSize: maxTradeSize ? Number(maxTradeSize) : undefined,
        maxDailyTrades: maxDailyTrades ? Number(maxDailyTrades) : 10,
      });

      // Step 2: Provision BitGo wallet
      setMintingStep('Provisioning BitGo wallet on Base Sepolia...');
      const agentId = `${name}_${Date.now()}`;
      const wallet = await BitGoService.createAgentWallet(agentId, name, Number(funding));
      setAgentWallet({ walletId: wallet.walletId, address: wallet.address });

      // Step 3: Register ENS subdomain (best-effort)
      if (ensName && address) {
        try {
          setMintingStep(`Registering ${name}.${ensName} on ENS...`);
          const result = await registerAgentSubdomain(ensName, name, address, wallet.address);
          setAgentEns(result.ensName);
        } catch {
          // ENS registration is optional
        }
      }

      setMinted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize agent');
    } finally {
      setIsMinting(false);
      setMintingStep('');
    }
  };

  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative">
        <Link
          href="/dashboard"
          className="absolute top-6 left-6 flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors z-20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Hub
        </Link>

        <div className="max-w-3xl mx-auto mt-20 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Initialize Agent Protocol
          </h1>
          <p className="text-zinc-400 text-lg mb-12">
            Configure your autonomous trading agent. It will trade ETH/USDC on Base Sepolia every 30s using AI reasoning.
          </p>

          <AnimatePresence mode="wait">
            {!minted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8 bg-zinc-900/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md"
              >
                {/* Name */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                    Agent Name {ensName ? `(subdomain of ${ensName})` : '(ENS label)'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Enter agent designation..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                      }
                    />
                    <span className="absolute right-4 text-white/30 font-mono pointer-events-none">
                      {ensName ? `.${ensName}` : '.hey-anna.eth'}
                    </span>
                  </div>
                </div>

                {/* Personality — 5 options */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                    Trading Personality
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(
                      Object.entries(PERSONALITY_META) as [
                        Personality,
                        (typeof PERSONALITY_META)[Personality],
                      ][]
                    ).map(([id, meta]) => {
                      const Icon = PERSONALITY_ICONS[id];
                      return (
                        <div
                          key={id}
                          onClick={() => setPersonality(id)}
                          className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
                            personality === id
                              ? `${meta.bg} ${meta.border}`
                              : 'bg-black/30 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 mb-2 ${
                              personality === id ? meta.color : 'text-white/40'
                            }`}
                          />
                          <h3 className="font-bold text-sm mb-1">{meta.label}</h3>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {meta.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget & Limits */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                      Budget (USDC)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-white/50 font-mono">$</span>
                      <input
                        type="number"
                        placeholder="1000"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                        value={funding}
                        onChange={(e) => setFunding(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                      Max Trade $
                    </label>
                    <input
                      type="number"
                      placeholder="auto (10%)"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      value={maxTradeSize}
                      onChange={(e) => setMaxTradeSize(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                      Max Daily Trades
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      value={maxDailyTrades}
                      onChange={(e) => setMaxDailyTrades(e.target.value)}
                    />
                  </div>
                </div>

                {/* Avatar */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                    Visual Avatar (Optional)
                  </label>
                  <label className="flex items-center justify-center w-full h-[52px] bg-black/50 border border-dashed border-white/20 hover:border-white/40 rounded-xl cursor-pointer transition-colors group">
                    <Upload className="w-4 h-4 mr-2 text-white/40 group-hover:text-white/80 transition-colors" />
                    <span className="text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors">
                      Upload Avatar
                    </span>
                    <input type="file" className="hidden" />
                  </label>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    ❌ {error}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!name || !personality || !funding || isMinting}
                    className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center transition-all z-20 relative ${
                      !name || !personality || !funding || isMinting
                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isMinting ? (
                      <>
                        <Wallet className="animate-bounce w-5 h-5 mr-3" />
                        {mintingStep || 'Initializing...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Initialize Agent
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-900/20 border border-emerald-500/30 rounded-3xl p-12 text-center"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-emerald-400 mb-4">Agent Online</h2>
                <p className="text-lg text-emerald-400/60 mb-6 max-w-lg mx-auto font-mono">
                  {name} is live — trading every 30s with{' '}
                  {PERSONALITY_META[personality as Personality]?.label ?? personality} strategy.
                </p>

                {agentWallet && (
                  <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-5 mb-8 text-left max-w-lg mx-auto space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
                      <Wallet className="w-4 h-4" /> Agent Wallet
                    </div>
                    {agentEns && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">ENS</p>
                        <p className="font-mono text-xs text-blue-400">{agentEns}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Wallet ID</p>
                      <p className="font-mono text-xs text-white/80 break-all">{agentWallet.walletId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                        Base Sepolia Address
                      </p>
                      <p className="font-mono text-xs text-emerald-400 break-all">
                        {agentWallet.address}
                      </p>
                    </div>
                    <a
                      href={`https://sepolia.basescan.org/address/${agentWallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-blue-400 hover:underline mt-1"
                    >
                      View on Base Sepolia Explorer ↗
                    </a>
                  </div>
                )}

                <div className="flex justify-center gap-4 relative z-20">
                  <Link href="/monitor">
                    <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl transition-colors">
                      Monitor Agent
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-bold py-3 px-8 rounded-xl transition-colors">
                      Back to Hub
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
