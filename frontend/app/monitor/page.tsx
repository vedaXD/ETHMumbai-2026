'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Zap, Shield, Target, Plus, Minus, Settings2, Activity, Wallet, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/shared/AppLayout';

const MOCK_AGENTS = [
  {
    id: 'agent-1',
    name: 'omega-prime.claw2claw.eth',
    personality: 'Aggressive Degen',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/50',
    balance: 1420.50,
    apy: '+142%',
    winRate: '68%',
    status: 'Farming MEME/WETH',
  },
  {
    id: 'agent-2',
    name: 'vault-guardian.claw2claw.eth',
    personality: 'Conservative Yield',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/50',
    balance: 50000.00,
    apy: '+8.4%',
    winRate: '99%',
    status: 'Staking USDC',
  }
];

export default function MonitorAgents() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'fund' | 'withdraw' | 'personality' | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (selectedAgent && amount) {
        setAgents(agents.map(a => {
          if (a.id === selectedAgent) {
            const val = parseFloat(amount);
            return {
              ...a,
              balance: activeModal === 'fund' ? a.balance + (isNaN(val) ? 0 : val) : (activeModal === 'withdraw' ? a.balance - (isNaN(val) ? 0 : val) : a.balance),
              personality: activeModal === 'personality' ? amount : a.personality
            };
          }
          return a;
        }));
      }
      setIsProcessing(false);
      setActiveModal(null);
      setAmount('');
    }, 1500);
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
                Manage BitGo wallet balances and adjust live AI trading protocols.
              </p>
            </div>
            <Link href="/create">
              <button className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center text-sm border border-white/10 relative z-20">
                <Plus className="w-4 h-4 mr-2" /> New Agent
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${agent.bg} rounded-full blur-[80px] -z-10 opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${agent.bg} ${agent.border} border`}>
                      <agent.icon className={`w-6 h-6 ${agent.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg font-mono truncate max-w-[200px]" title={agent.name}>{agent.name}</h3>
                      <div className="flex items-center text-xs text-zinc-400 mt-1">
                        <Settings2 className="w-3 h-3 mr-1" /> {agent.personality}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-zinc-400 mb-1">Vault Balance</div>
                    <div className="text-xl font-bold font-mono text-white">${agent.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/50 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center"><Activity className="w-3 h-3 mr-1" /> 30d APY</div>
                    <div className="font-bold text-emerald-400">{agent.apy}</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center"><Target className="w-3 h-3 mr-1" /> Win Rate</div>
                    <div className="font-bold text-white">{agent.winRate}</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> Status</div>
                    <div className="text-xs font-medium text-white/80 truncate" title={agent.status}>{agent.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-20">
                  <button 
                    onClick={() => { setSelectedAgent(agent.id); setActiveModal('fund'); }}
                    className="flex items-center justify-center text-sm py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Deposit
                  </button>
                  <button 
                    onClick={() => { setSelectedAgent(agent.id); setActiveModal('withdraw'); }}
                    className="flex items-center justify-center text-sm py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                  >
                    <Minus className="w-4 h-4 mr-1.5" /> Withdraw
                  </button>
                  <button 
                    onClick={() => { setSelectedAgent(agent.id); setActiveModal('personality'); }}
                    className="flex items-center justify-center text-sm py-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                  >
                    <Settings2 className="w-4 h-4 mr-1.5" /> Adjust
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Modal Implementation */}
        <AnimatePresence>
          {activeModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-2 capitalize">
                  {activeModal === 'fund' ? 'Deposit Funds' : activeModal === 'withdraw' ? 'Withdraw Funds' : 'Alter Personality'}
                </h2>
                <p className="text-zinc-400 mb-6 text-sm">
                  {activeModal === 'personality' 
                    ? 'Update the ENS metadata to change the decision-making logic of HeyElsa.' 
                    : 'Interact with the underlying BitGo policy vault securely.'}
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
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAction}
                    disabled={!amount || isProcessing}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center ${
                      !amount || isProcessing 
                        ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    }`}
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
