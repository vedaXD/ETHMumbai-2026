'use client';

import { useState, useEffect, useCallback, type ElementType } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Plus, Minus, Settings2, Activity, RefreshCw, BotMessageSquare,
  TrendingUp, TrendingDown, Clock, Zap, Shield, BarChart2,
  Pause, Play, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/shared/AppLayout';
import { AgentService, Agent, PERSONALITY_META, Personality, MarketData, SwapStrategy } from '@/lib/agents';

const PERSONALITY_ICONS: Record<Personality, ElementType> = {
  risk_taker: Zap,
  safe_player: Shield,
  balanced: BarChart2,
  momentum_hunter: TrendingUp,
  contrarian: Minus,
};

function MarketTicker({ market }: { market: MarketData | null }) {
  if (!market) return null;
  const trendColor =
    market.trend === 'up'
      ? 'text-emerald-400'
      : market.trend === 'down'
      ? 'text-rose-400'
      : 'text-zinc-400';
  return (
    <div className="flex items-center gap-6 text-sm font-mono bg-black/40 border border-white/10 rounded-xl px-4 py-2">
      <span className="text-zinc-400">ETH</span>
      <span className="text-white font-bold">${market.ethPrice.toFixed(2)}</span>
      <span className="text-zinc-500">RSI</span>
      <span
        className={
          market.rsi < 30 ? 'text-emerald-400' : market.rsi > 70 ? 'text-rose-400' : 'text-white'
        }
      >
        {market.rsi}
      </span>
      <span className="text-zinc-500">Trend</span>
      <span className={trendColor}>{market.trend.toUpperCase()}</span>
    </div>
  );
}

function SwapStrategyPanel({ s }: { s: SwapStrategy }) {
  if (s.tokenIn === 'none') return null;
  return (
    <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-2 mt-2 text-[10px] font-mono space-y-1">
      <div className="text-indigo-400 font-bold uppercase tracking-wide mb-1">Uniswap Swap Plan</div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-zinc-400">
        <span><span className="text-white">Route</span> {s.tokenIn} → {s.tokenOut}</span>
        <span><span className="text-white">Pool</span> {s.pool}</span>
        <span><span className="text-white">Slippage</span> {s.slippageTolerance}</span>
        <span><span className="text-white">Impact</span> {s.estimatedPriceImpact}</span>
      </div>
      <div className="text-zinc-400"><span className="text-white">Exec</span> {s.executionStyle}</div>
      {s.hookRecommendation !== 'none' && (
        <div className="text-indigo-300"><span className="text-white">Hook</span> {s.hookRecommendation}</div>
      )}
    </div>
  );
}



export default function MonitorAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [agentList, marketData] = await Promise.all([
        AgentService.list(),
        AgentService.getMarket(),
      ]);
      setAgents(agentList);
      setMarket(marketData);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15_000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleModalAction = async () => {
    if (!selectedAgent || !inputValue) return;
    setIsProcessing(true);
    try {
      if (activeModal === 'fund') {
        const agent = agents.find((a) => a.id === selectedAgent);
        if (agent) {
          await AgentService.update(selectedAgent, {
            remainingBudget: agent.remainingBudget + Number(inputValue),
          });
        }
      } else if (activeModal === 'withdraw') {
        const agent = agents.find((a) => a.id === selectedAgent);
        if (agent) {
          await AgentService.update(selectedAgent, {
            remainingBudget: Math.max(0, agent.remainingBudget - Number(inputValue)),
          });
        }
      } else if (activeModal === 'personality') {
        await AgentService.update(selectedAgent, {
          personality: inputValue as Personality,
        });
      }
      await loadData();
      setStatusMsg('Updated successfully');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setActiveModal(null);
      setInputValue('');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const toggleStatus = async (agent: Agent) => {
    const next = agent.status === 'active' ? 'paused' : 'active';
    await AgentService.update(agent.id, { status: next });
    await loadData();
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Delete this agent?')) return;
    await AgentService.delete(id);
    await loadData();
  };

  const triggerCycle = async (id: string) => {
    setStatusMsg('Triggering trade cycle...');
    try {
      await AgentService.triggerCycle(id);
      await loadData();
      setStatusMsg('Cycle complete');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setTimeout(() => setStatusMsg(null), 3000);
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
              <p className="text-zinc-400">
                {agents.length} agent{agents.length !== 1 ? 's' : ''} — auto-refreshes every 15s
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MarketTicker market={market} />
              <button
                onClick={loadData}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link href="/create">
                <button className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center text-sm border border-white/10 relative z-20">
                  <Plus className="w-4 h-4 mr-2" /> New Agent
                </button>
              </Link>
            </div>
          </div>

          {statusMsg && (
            <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2 text-blue-400 text-sm">
              {statusMsg}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24 text-zinc-500">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading agents...
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-zinc-500 text-lg mb-4">No agents deployed yet.</p>
              <Link href="/create">
                <button className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-white/90 transition-colors">
                  Create Your First Agent
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {agents.map((agent) => {
                const meta = PERSONALITY_META[agent.personality];
                const Icon = PERSONALITY_ICONS[agent.personality] ?? Zap;
                const pnl = agent.remainingBudget - agent.budget;
                const pnlPct = ((pnl / agent.budget) * 100).toFixed(1);
                const isActive = agent.status === 'active';

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-zinc-900/40 border rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group transition-colors ${
                      isActive ? meta.border : 'border-white/10'
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-64 h-64 ${meta.bg} rounded-full blur-[80px] -z-10 opacity-40 group-hover:opacity-80 transition-opacity`}
                    />

                    {/* Top row */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} border ${meta.border}`}
                        >
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-base font-mono truncate max-w-[180px]" title={agent.name}>
                            {agent.name}
                          </h3>
                          <div className="flex items-center text-xs text-zinc-400 mt-0.5 gap-2">
                            <Settings2 className="w-3 h-3" />
                            {meta.label}
                            <span
                              className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-zinc-700 text-zinc-400'
                              }`}
                            >
                              {agent.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500 mb-0.5">Remaining</div>
                        <div className="text-lg font-bold font-mono">
                          ${agent.remainingBudget.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-mono ${
                            pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {pnl >= 0 ? '+' : ''}
                          {pnlPct}% P&L
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-black/50 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1 flex items-center">
                          <Activity className="w-3 h-3 mr-1" /> Budget
                        </div>
                        <div className="font-bold text-sm">${agent.budget.toFixed(0)}</div>
                      </div>
                      <div className="bg-black/50 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">Daily Trades</div>
                        <div className="font-bold text-sm">
                          {agent.dailyTrades}/{agent.maxDailyTrades}
                        </div>
                      </div>
                      <div className="bg-black/50 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">Battle Score</div>
                        <div className="font-bold text-sm text-amber-400">{agent.battleScore}</div>
                      </div>
                    </div>

                    {/* Trade history / AI reasoning feed */}
                    {agent.tradeHistory.length > 0 && (
                      <div className="mb-5 space-y-2">
                        <div className="flex items-center text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          <BotMessageSquare className="w-3.5 h-3.5 mr-1" /> AI Reasoning Feed
                        </div>
                        {agent.tradeHistory.slice(0, 3).map((trade) => (
                          <div
                            key={trade.id}
                            className="bg-black/30 border border-white/5 rounded-xl p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1 rounded-lg ${
                                    trade.action === 'BUY'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : trade.action === 'SELL'
                                      ? 'bg-rose-500/20 text-rose-400'
                                      : 'bg-zinc-700 text-zinc-400'
                                  }`}
                                >
                                  {trade.action === 'BUY' ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : trade.action === 'SELL' ? (
                                    <TrendingDown className="w-3 h-3" />
                                  ) : (
                                    <Minus className="w-3 h-3" />
                                  )}
                                </div>
                                <span className="text-sm font-bold">
                                  {trade.action} ${trade.amount.toFixed(2)}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">
                                  @ ${trade.price.toFixed(2)}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(trade.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="bg-zinc-900/80 rounded-lg p-2 border border-white/5 border-l-2 border-l-primary/50">
                              <div className="text-[10px] font-bold text-primary mb-0.5 uppercase tracking-wider font-mono">
                                OpenClaw / conf {trade.confidence}%
                              </div>
                              <p className="text-xs text-zinc-300 font-mono italic leading-relaxed">
                                "{trade.reasoning}"
                              </p>
                            </div>
                            {trade.swapStrategy && (
                              <SwapStrategyPanel s={trade.swapStrategy} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent.id);
                          setActiveModal('fund');
                        }}
                        className="flex items-center justify-center text-xs py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Deposit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent.id);
                          setActiveModal('withdraw');
                        }}
                        className="flex items-center justify-center text-xs py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                      >
                        <Minus className="w-3 h-3 mr-1" /> Withdraw
                      </button>
                      <button
                        onClick={() => toggleStatus(agent)}
                        className={`flex items-center justify-center text-xs py-2 border rounded-lg transition-colors ${
                          isActive
                            ? 'bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 border-white/10 text-zinc-300'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isActive ? (
                          <><Pause className="w-3 h-3 mr-1" /> Pause</>
                        ) : (
                          <><Play className="w-3 h-3 mr-1" /> Resume</>
                        )}
                      </button>
                      <button
                        onClick={() => triggerCycle(agent.id)}
                        className="flex items-center justify-center text-xs py-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 border border-white/10 rounded-lg transition-colors text-zinc-300"
                        title="Trigger trade cycle now"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Cycle
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="mt-2 w-full flex items-center justify-center text-xs py-1.5 text-zinc-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove Agent
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
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
                  {activeModal === 'fund'
                    ? 'Deposit Funds'
                    : activeModal === 'withdraw'
                    ? 'Withdraw Funds'
                    : 'Change Personality'}
                </h2>
                <p className="text-zinc-400 mb-6 text-sm">
                  {activeModal === 'personality'
                    ? 'Enter the new personality ID.'
                    : 'Amount in USDC to adjust vault.'}
                </p>

                {activeModal === 'personality' ? (
                  <div className="grid grid-cols-1 gap-2 mb-6">
                    {(Object.keys(PERSONALITY_META) as Personality[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setInputValue(p)}
                        className={`text-left px-4 py-2 rounded-xl border text-sm transition-colors ${
                          inputValue === p
                            ? `${PERSONALITY_META[p].bg} ${PERSONALITY_META[p].border} ${PERSONALITY_META[p].color}`
                            : 'border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        {PERSONALITY_META[p].label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="number"
                    placeholder="0.00"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-mono mb-6"
                  />
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setInputValue('');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalAction}
                    disabled={!inputValue || isProcessing}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center ${
                      !inputValue || isProcessing
                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      'Confirm'
                    )}
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
