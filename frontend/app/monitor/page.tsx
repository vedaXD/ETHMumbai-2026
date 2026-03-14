'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Zap, Shield, Target, Plus, Minus, Settings2, Activity, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/shared/AppLayout';
import { BotMessageSquare, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useWallet } from '@/lib/WalletContext';

const PERSONALITY_STYLES: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  aggressive: { icon: Zap,    color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/50' },
  conservative: { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/50' },
  arbitrage: { icon: Target,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/50' },
};

function getStyle(personality: string) {
  const key = personality?.toLowerCase();
  return PERSONALITY_STYLES[key] || PERSONALITY_STYLES['conservative'];
}

export default function MonitorAgents() {
  const { address } = useWallet();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'fund' | 'withdraw' | 'personality' | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!address) { setLoading(false); return; }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backendUrl}/api/users/${address}/agents`)
      .then(r => r.json())
      .then(data => { if (data.success) setAgents(data.agents); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setActiveModal(null); setAmount(''); }, 1500);
  };

  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative">
        <Link href="/dashboard" className="absolute top-6 left-6 flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors z-20">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Hub
        </Link>

        <div className="max-w-5xl mx-auto mt-20 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Active Fleet Monitoring
              </h1>
              <p className="text-zinc-400 text-lg">
                Your agents — each with a dedicated BitGo wallet on Base Sepolia.
              </p>
            </div>
            <Link href="/create">
              <button className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center text-sm border border-white/10 relative z-20">
                <Plus className="w-4 h-4 mr-2" /> New Agent
              </button>
            </Link>
          </div>

          {!address && (
            <div className="text-center py-20 text-zinc-500">
              Connect your wallet to see your agents.
            </div>
          )}

          {address && loading && (
            <div className="text-center py-20 text-zinc-500 animate-pulse">Loading your agents...</div>
          )}

          {address && !loading && agents.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 mb-4">No agents yet.</p>
              <Link href="/create">
                <button className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors">
                  Initialize Your First Agent
                </button>
              </Link>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent) => {
              const style = getStyle(agent.personality);
              const Icon = style.icon;
              return (
                <div key={agent.agentId} className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-64 h-64 ${style.bg} rounded-full blur-[80px] -z-10 opacity-50 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.bg} ${style.border} border`}>
                        <Icon className={`w-6 h-6 ${style.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg font-mono truncate max-w-[220px]" title={agent.ensName || agent.name}>
                          {agent.ensName || agent.name}
                        </h3>
                        <div className="flex items-center text-xs text-zinc-400 mt-1">
                          <Settings2 className="w-3 h-3 mr-1" /> {agent.personality}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400 mb-1">Vault Balance</div>
                      <div className="text-xl font-bold font-mono text-white">—</div>
                    </div>
                  </div>

                  {/* Wallet info */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 mb-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <Wallet className="w-3 h-3" /> BitGo Wallet
                    </div>
                    <p className="font-mono text-xs text-white/60 break-all">{agent.walletAddress}</p>
                    <a
                      href={`https://base-sepolia.blockscout.com/address/${agent.walletAddress}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                    >
                      View on Blockscout <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-3 relative z-20">
                    <button
                      onClick={() => { setSelectedAgent(agent.agentId); setActiveModal('fund'); }}
                      className="flex items-center justify-center text-sm py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Deposit
                    </button>
                    <button
                      onClick={() => { setSelectedAgent(agent.agentId); setActiveModal('withdraw'); }}
                      className="flex items-center justify-center text-sm py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                    >
                      <Minus className="w-4 h-4 mr-1.5" /> Withdraw
                    </button>
                    <button
                      onClick={() => { setSelectedAgent(agent.agentId); setActiveModal('personality'); }}
                      className="flex items-center justify-center text-sm py-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                    >
                      <Settings2 className="w-4 h-4 mr-1.5" /> Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {activeModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-2 capitalize">
                  {activeModal === 'fund' ? 'Deposit Funds' : activeModal === 'withdraw' ? 'Withdraw Funds' : 'Alter Personality'}
                </h2>
                <p className="text-zinc-400 mb-6 text-sm">
                  {activeModal === 'personality'
                    ? 'Update the decision-making logic of this agent.'
                    : 'Interact with the BitGo wallet securely.'}
                </p>
                <div className="space-y-4 mb-8">
                  <label className="block text-sm font-medium text-zinc-300">
                    {activeModal === 'personality' ? 'New Behavior Profile' : 'Amount (USDC)'}
                  </label>
                  <input
                    type={activeModal === 'personality' ? 'text' : 'number'}
                    placeholder={activeModal === 'personality' ? 'e.g., Arbitrage Sniper' : '0.00'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={!amount || isProcessing}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center ${!amount || isProcessing ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90'}`}
                  >
                    {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

