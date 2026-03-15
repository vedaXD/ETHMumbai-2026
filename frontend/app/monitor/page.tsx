'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Zap, Shield, Target, Plus, Minus, Settings2, Activity, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSendTransaction } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { parseEther } from 'viem';
import AppLayout from '@/components/shared/AppLayout';
import { BotMessageSquare, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useWallet } from '@/lib/WalletContext';

type ModalType = 'fund' | 'withdraw' | 'personality' | 'trades' | null;

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
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [inputValue, setInputValue] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();

  useEffect(() => {
    if (!address) { setLoading(false); return; }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backendUrl}/api/users/${address}/agents`)
      .then(r => r.json())
      .then(data => { if (data.success) setAgents(data.agents); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      if (!selectedAgent) return;
      
      const numAmount = parseFloat(amount);
      if (activeModal !== 'personality' && (isNaN(numAmount) || numAmount <= 0)) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      // We only handled fund and withdraw in this demo script update
      if (activeModal === 'fund') {
        const targetAgent = agents.find(a => a.id === selectedAgent);
        if (!targetAgent?.walletAddress) {
          alert('No vault address found for this agent!');
          return;
        }

        // Trigger metamask transaction
        const txHash = await sendTransactionAsync({
          to: targetAgent.walletAddress as `0x${string}`,
          value: parseEther(numAmount.toString()),
          chainId: baseSepolia.id,
        });
        
        console.log('Funding TX Sent:', txHash);

        const res = await fetch(`${backendUrl}/api/agents/${selectedAgent}/${activeModal}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numAmount }),
        });
        const data = await res.json();
        if (data.success) {
          setAgents((prev) => prev.map((a) => (a.id === selectedAgent ? data.agent : a)));
        } else {
          alert('Error: ' + data.error);
        }
      } else if (activeModal === 'withdraw') {
        const res = await fetch(`${backendUrl}/api/agents/${selectedAgent}/${activeModal}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numAmount }),
        });
        const data = await res.json();
        if (data.success) {
          setAgents((prev) => prev.map((a) => (a.id === selectedAgent ? data.agent : a)));
        } else {
          alert('Error: ' + data.error);
        }
      } else {
        // Mock personality change
        await new Promise(r => setTimeout(r, 800));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setActiveModal(null);
      setAmount('');
    }
  };

  const handleFaucet = async () => {
    setIsProcessing(true);
    try {
      if (!selectedAgent) return;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/agents/${selectedAgent}/faucet`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) => prev.map((a) => (a.id === selectedAgent ? data.agent : a)));
        setActiveModal(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
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

        <div className="max-w-6xl mx-auto mt-20 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
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
                        {agent.tagline && (
                          <p className="text-[10px] text-zinc-300 italic mt-0.5 truncate max-w-[220px]">
                            "{agent.tagline}"
                          </p>
                        )}
                        <div className="flex items-center text-xs text-zinc-400 mt-1">
                          <Settings2 className="w-3 h-3 mr-1" /> {agent.personality}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400 mb-1">Vault Balance</div>
                      <div className="text-xl font-bold font-mono text-white">${agent.budget?.toLocaleString() || '0'}</div>
                    </div>
                  </div>

                  {/* Wallet info */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 mb-5 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                        <Wallet className="w-3 h-3" /> BitGo Enterprise Vault
                      </div>
                      <p className="font-mono text-[10px] text-white/60 break-all">{agent.walletAddress || 'Provisioning...'}</p>
                    </div>
                    
                    {agent.currentStealthAddress && (
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
                          <Activity className="w-3 h-3" /> Active Stealth Proxy
                          <span className="bg-rose-500/20 text-rose-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ml-1">Privacy On</span>
                        </div>
                        <p className="font-mono text-[10px] text-white/60 break-all">{agent.currentStealthAddress}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-tight">All downstream trades are routed through this one-time address.</p>
                      </div>
                    )}

                    {/* ENS Text Records: Allowed Cryptos */}
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold mb-1.5">
                        <TrendingUp className="w-3 h-3" /> Permitted Assets
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!agent.allowedCryptos || agent.allowedCryptos.length === 0) ? (
                          <span className="bg-white/10 text-white/60 text-[10px] font-mono px-2 py-0.5 rounded">ANY</span>
                        ) : (
                          agent.allowedCryptos.map((crypto: string) => (
                            <span key={crypto} className="bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/20">
                              {crypto}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-20">
                    <button
                      onClick={() => { setSelectedAgent(agent.id); setActiveModal('trades'); }}
                      className="flex items-center justify-center text-xs py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors font-bold col-span-2 sm:col-span-1"
                    >
                      <Activity className="w-3.5 h-3.5 mr-1" /> View Trades
                    </button>
                    <button
                      onClick={() => { setSelectedAgent(agent.agentId); setActiveModal('fund'); }}
                      className="flex items-center justify-center text-xs py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Deposit
                    </button>
                    <button
                      onClick={() => { setSelectedAgent(agent.agentId); setActiveModal('withdraw'); }}
                      className="flex items-center justify-center text-xs py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                    >
                      <Minus className="w-3.5 h-3.5 mr-1" /> Withdraw
                    </button>
                    <button
                      onClick={() => { setSelectedAgent(agent.id); setActiveModal('personality'); }}
                      className="flex items-center justify-center text-xs py-2 bg-white/5 hover:bg-zinc-500/20 hover:text-white border border-white/10 rounded-lg transition-colors text-zinc-300"
                    >
                      <Settings2 className="w-3.5 h-3.5 mr-1" /> Adjust
                    </button>
                  </div>

                  {/* Trades moved to modal view */}
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
                className={`bg-zinc-900 border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto w-full shadow-2xl ${activeModal === 'trades' ? 'max-w-2xl' : 'max-w-md'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold capitalize">
                    {activeModal === 'fund'
                      ? 'Deposit Funds'
                      : activeModal === 'withdraw'
                      ? 'Withdraw Funds'
                      : activeModal === 'trades'
                      ? `Trade Inference Log`
                      : 'Change Personality'}
                  </h2>
                  <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white"><Minus className="w-6 h-6" /></button>
                </div>
                <p className="text-zinc-400 mb-6 text-sm">
                  {activeModal === 'personality'
                    ? 'Update the decision-making logic of this agent.'
                    : activeModal === 'trades'
                    ? 'Review the reasoning behind recent agent transactions.'
                    : 'Interact with the BitGo vault securely.'}
                </p>

                {activeModal === 'trades' ? (
                  <div className="space-y-4 mb-4">
                    {(() => {
                      const agent = agents.find(a => a.id === selectedAgent);
                      if (!agent || !agent.tradeHistory || agent.tradeHistory.length === 0) {
                        return <div className="text-center text-zinc-500 py-10 font-mono">No trades executed yet.</div>;
                      }
                      return agent.tradeHistory.map((trade: any) => (
                        <div key={trade.id} className="bg-black/60 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-black px-3 py-1 rounded uppercase ${
                                trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 
                                trade.action === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-500/20 text-zinc-400'
                              }`}>
                                {trade.action}
                              </span>
                              <span className="text-sm font-mono text-zinc-300 font-bold">${trade.amount}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-zinc-500 font-mono">{new Date(trade.timestamp).toLocaleString()}</span>
                              {trade.explorerUrl && (
                                <a href={trade.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 transition-colors bg-blue-500/10 px-2 py-1 rounded">
                                  View TX on Basescan <ExternalLink className="w-3 h-3 ml-1.5" />
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-black/40 rounded-lg p-4 border-l-2 border-blue-500/50 mb-3">
                            <h4 className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1.5 flex items-center"><Activity className="w-3 h-3 mr-1" /> Agent Reasoning</h4>
                            <p className="text-sm text-zinc-200 leading-relaxed font-mono">
                              "{trade.reasoning}"
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs font-mono">
                            <span className="bg-white/5 border border-white/10 px-2 py-1.5 rounded text-zinc-400">Pool: <span className="text-white">{trade.swapStrategy?.pool || 'N/A'}</span></span>
                            <span className="bg-white/5 border border-white/10 px-2 py-1.5 rounded text-zinc-400">Slippage: <span className="text-white">{trade.swapStrategy?.slippageTolerance || 'N/A'}</span></span>
                            <span className="bg-white/5 border border-white/10 px-2 py-1.5 rounded text-zinc-400">Exec: <span className="text-white">{trade.swapStrategy?.executionStyle || 'N/A'}</span></span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <>
                    {activeModal === 'fund' && (
                      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <p className="text-xs text-emerald-400 mb-2 font-medium">Out of testnet gas?</p>
                        <button
                          onClick={handleFaucet}
                          disabled={isProcessing}
                          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                          Claim $10,000 Testnet Faucet
                        </button>
                      </div>
                    )}
                    <div className="space-y-4 mb-8">
                      <label className="block text-sm font-medium text-zinc-300">
                        {activeModal === 'personality' ? 'New Behavior Profile' : activeModal === 'fund' ? 'Amount (Testnet ETH)' : 'Amount (USDC)'}
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
                        {isProcessing ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          activeModal === 'fund' ? 'Send from Wallet' : 'Confirm'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

