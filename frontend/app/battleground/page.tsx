'use client';

import { useState, useEffect, type ElementType } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/shared/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Swords, Trophy, Activity, Skull, Zap, BarChart2, TrendingUp,
  Minus, Shield, RefreshCw, Coins, Timer, Bot
} from 'lucide-react';
import { AgentService, Agent, PERSONALITY_META, Personality, BattleResult } from '@/lib/agents';

const P_ICONS: Record<Personality, ElementType> = {
  risk_taker: Zap,
  safe_player: Shield,
  balanced: BarChart2,
  momentum_hunter: TrendingUp,
  contrarian: Minus,
  custom: Bot,
};

export default function Battleground() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [battleState, setBattleState] = useState<'idle' | 'battling' | 'finished'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [agent1Id, setAgent1Id] = useState('');
  const [agent2Id, setAgent2Id] = useState('');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [battleDuration, setBattleDuration] = useState('5'); // seconds

  // Gamification states
  const [health1, setHealth1] = useState(100);
  const [health2, setHealth2] = useState(100);
  const [roi1, setRoi1] = useState(0);
  const [roi2, setRoi2] = useState(0);

  const [battleLog, setBattleLog] = useState<Array<{ timestamp: string; result: string }>>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [list, log] = await Promise.all([AgentService.list(), AgentService.getBattleLog()]);
        setAgents(list);
        setBattleLog(log);
        if (list.length >= 2) {
          setAgent1Id(list[0].id);
          setAgent2Id(list[1].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAgents(false);
      }
    };
    load();
  }, []);

  const startBattle = async () => {
    if (!agent1Id || !agent2Id || agent1Id === agent2Id) return;

    setBattleState('battling');
    setLogs([]);
    setResult(null);
    setHealth1(100);
    setHealth2(100);
    setRoi1(0);
    setRoi2(0);

    const a1 = agents.find((a) => a.id === agent1Id);
    const a2 = agents.find((a) => a.id === agent2Id);
    if (!a1 || !a2) return;

    const parsedStake = parseFloat(stakeAmount) || 0;
    const durMs = (parseInt(battleDuration) || 5) * 1000;

    setLogs([
      '[ARENA] Commencing Minigame Protocol...',
      `[STAKE] Pool: $${parsedStake * 2} USDC (${parsedStake} each)`,
      `[MATCH] ${a1.name} [L] vs ${a2.name} [R]`,
      '[SYSTEM] Resolving live market context...',
    ]);

    try {
      // 1. Fetch live market data + kick off backend settle in parallel
      const market = await AgentService.getMarket();
      const backendBattlePromise = AgentService.battle(agent1Id, agent2Id, parsedStake);

      // 2. Build per-personality decision trees based on stake + market
      const buildDecision = (personality: Personality, budget: number) => {
        const { rsi, trend, ethPrice } = market;
        const thresholds: Record<Personality, { buy: number; sell: number }> = {
          risk_taker:      { buy: 50, sell: 60 },
          safe_player:     { buy: 25, sell: 75 },
          balanced:        { buy: 35, sell: 65 },
          momentum_hunter: { buy: 45, sell: 55 },
          contrarian:      { buy: 20, sell: 80 },
          custom:          { buy: 40, sell: 60 },
        };
        const { buy, sell } = thresholds[personality];
        let action: 'BUY' | 'SELL' | 'HOLD' =
          personality === 'momentum_hunter'
            ? (trend === 'up' ? 'BUY' : trend === 'down' ? 'SELL' : 'HOLD')
            : rsi < buy ? 'BUY' : rsi > sell ? 'SELL' : 'HOLD';

        const confidence =
          action === 'BUY'  ? Math.min(95, Math.round(62 + (buy  - rsi) * 1.5)) :
          action === 'SELL' ? Math.min(95, Math.round(62 + (rsi  - sell) * 1.5)) :
          38 + Math.round(Math.random() * 12);

        // Personality-market alignment bonus (mirrors backend calcBattleScore)
        let bonus = 0;
        if (personality === 'momentum_hunter' && trend !== 'sideways') bonus = 15;
        if (personality === 'contrarian'      && (rsi < 25 || rsi > 75)) bonus = 15;
        if (personality === 'safe_player'     && trend === 'sideways')    bonus = 10;
        if (personality === 'risk_taker'      && trend === 'up')          bonus = 12;
        if (personality === 'balanced')                                    bonus = 5;
        const score = Math.max(1, confidence + bonus);

        const execStyles: Record<Personality, string> = {
          risk_taker:      'Market order — immediate fill, high-speed entry',
          safe_player:     'TWAP over 5 min via TWAP hook',
          balanced:        'Market swap with 0.5% slippage guard',
          momentum_hunter: 'Market order on trend confirmation',
          contrarian:      `Limit-order hook at $${(ethPrice * (action === 'BUY' ? 0.995 : 1.005)).toFixed(2)}`,
          custom:          'Dynamic fee hook — optimized for volatility',
        };

        const reasoningMap = {
          BUY:  `RSI at ${rsi} signals oversold territory — entering a long position with $${budget.toFixed(2)} USDC now.`,
          SELL: `Market looks overextended at RSI ${rsi} — rotating $${budget.toFixed(2)} back to USDC before the reversal.`,
          HOLD: `Trend is ${trend} and RSI at ${rsi} gives no clear edge — preserving the $${budget.toFixed(2)} USDC stake for a cleaner setup.`,
        };

        const feeTiers: Record<Personality, string> = {
          risk_taker: '0.3%', safe_player: '0.05%', balanced: '0.05%',
          momentum_hunter: '0.3%', contrarian: '0.05%', custom: '0.3%',
        };

        return {
          action,
          confidence,
          score,
          reasoning: reasoningMap[action],
          swapStrategy: {
            tokenIn:  action === 'BUY' ? 'USDC' : action === 'SELL' ? 'ETH' : 'none',
            tokenOut: action === 'BUY' ? 'ETH'  : action === 'SELL' ? 'USDC': 'none',
            pool: `ETH/USDC ${feeTiers[personality]} on Base Sepolia`,
            feeTier: feeTiers[personality],
            slippageTolerance: personality === 'risk_taker' ? '1.0%' : personality === 'safe_player' ? '0.1%' : '0.5%',
            executionStyle: execStyles[personality],
            hookRecommendation: personality === 'safe_player' ? 'TWAP hook — splits into micro-orders' : personality === 'contrarian' ? 'Limit-order hook — fills at target price' : personality === 'risk_taker' ? 'Dynamic fee hook — adjusts cost in volatility' : 'none — standard v3 pool',
            estimatedPriceImpact: feeTiers[personality] === '0.05%' ? '< 0.1%' : '< 0.3%',
          },
        };
      };

      const d1 = buildDecision(a1.personality, parsedStake);
      const d2 = buildDecision(a2.personality, parsedStake);

      // 3. Animated live logs
      const simulatedLogs = [
        `[${a1.name}] analyzing ${PERSONALITY_META[a1.personality].label} signals on $${parsedStake} stake...`,
        `[MARKET] ETH/USDC @ $${market.ethPrice.toFixed(2)} | RSI ${market.rsi} | trend: ${market.trend.toUpperCase()}`,
        `[${a1.name}] decision locked → ${d1.action} (${d1.confidence}% conf)`,
        `[${a2.name}] scanning ${PERSONALITY_META[a2.personality].label} conditions on $${parsedStake} stake...`,
        `[${a2.name}] decision locked → ${d2.action} (${d2.confidence}% conf)`,
        `[ARENA] Scoring strategies... personality-market-fit bonus applied`,
        `[ARENA] Awaiting final settlement...`
      ];

      // Oscillation interval simulating hits/gains
      const interval = setInterval(() => {
        setHealth1((prev) => Math.min(150, Math.max(10, prev + (Math.random() * 20 - 10))));
        setHealth2((prev) => Math.min(150, Math.max(10, prev + (Math.random() * 20 - 10))));
        setRoi1((prev) => prev + (Math.random() * 5 - 2.5));
        setRoi2((prev) => prev + (Math.random() * 5 - 2.5));
      }, 500);

      // Push logs gradually to both sides
      const delay = durMs / (simulatedLogs.length + 1);
      for (let i = 0; i < simulatedLogs.length; i++) {
        await new Promise(r => setTimeout(r, delay));
        setLogs(prev => [...prev, simulatedLogs[i]]);
      }

      // Wait for any remaining time
      await new Promise(r => setTimeout(r, delay));
      clearInterval(interval);

      // 3. Obtain real result
      const battleResult = await backendBattlePromise;

      // Snap the charts to reality based on winner
      if (battleResult.winnerAgentId === agent1Id) {
        setHealth1(120); setRoi1(Math.abs(roi1) + 15);
        setHealth2(40); setRoi2(-Math.abs(roi2) - 10);
      } else {
        setHealth2(120); setRoi2(Math.abs(roi2) + 15);
        setHealth1(40); setRoi1(-Math.abs(roi1) - 10);
      }

      setLogs(prev => [...prev, `[RESULT] Winner determined: ${battleResult.winnerName} takes the $${parsedStake * 2} pot!`]);
      
      await new Promise(r => setTimeout(r, 600));
      setResult(battleResult);
      setBattleState('finished');

      // Refresh agents + battle log
      const [updatedAgents, updatedLog] = await Promise.all([
        AgentService.list(),
        AgentService.getBattleLog(),
      ]);
      setAgents(updatedAgents);
      setBattleLog(updatedLog);
    } catch (err: any) {
      setLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
      setBattleState('idle');
    }
  };

  const a1 = agents.find((a) => a.id === agent1Id);
  const a2 = agents.find((a) => a.id === agent2Id);

  const ranked = [...agents].sort((a, b) => b.battleScore - a.battleScore);

  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] transition-colors duration-1000 ${battleState === 'battling' ? 'bg-rose-500/30' : 'bg-blue-500/10'}`} />
          <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] transition-colors duration-1000 ${battleState === 'battling' ? 'bg-amber-500/30' : 'bg-purple-500/10'}`} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto mt-12">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" /> Retreat to Hub
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 rounded-2xl mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <Swords className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
              The Arena
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-mono">
              High-stakes PvP agent battles. Stake USDC. Best AI logic takes the pot.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Main battle view */}
            <div className="md:col-span-8 bg-black/40 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
              {battleState === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {loadingAgents ? (
                    <><RefreshCw className="w-8 h-8 animate-spin text-rose-500/50 mb-4" /><p className="text-zinc-500">Loading agents...</p></>
                  ) : agents.length < 2 ? (
                    <div className="space-y-4">
                      <Skull className="w-16 h-16 text-rose-500/30 mx-auto" />
                      <p className="text-zinc-400">You need at least 2 agents to battle.</p>
                      <Link href="/create">
                        <button className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-white/90 transition-colors">
                          Create Agents
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full max-w-lg space-y-6">
                      <Skull className="w-16 h-16 text-rose-500/30 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                      <h3 className="text-xl font-bold font-mono tracking-wider uppercase mb-6 text-zinc-300">Set Up Match</h3>

                      {/* Combatants */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-rose-400 font-bold uppercase tracking-wide">Challenger 1</label>
                          <select value={agent1Id} onChange={(e) => setAgent1Id(e.target.value)} className="w-full bg-black/80 border border-rose-500/30 rounded-xl px-3 py-3 text-white text-sm focus:border-rose-400 outline-none transition-colors shadow-inner">
                            {agents.map((a) => <option key={a.id} value={a.id}>{a.name} [${a.remainingBudget?.toLocaleString()}]</option>)}
                          </select>
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-blue-400 font-bold uppercase tracking-wide">Challenger 2</label>
                          <select value={agent2Id} onChange={(e) => setAgent2Id(e.target.value)} className="w-full bg-black/80 border border-blue-500/30 rounded-xl px-3 py-3 text-white text-sm focus:border-blue-400 outline-none transition-colors shadow-inner">
                            {agents.map((a) => <option key={a.id} value={a.id}>{a.name} [${a.remainingBudget?.toLocaleString()}]</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Stake & Duration parameters */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-zinc-400 font-bold flex items-center gap-1"><Coins className="w-3 h-3" /> Stake (USDC)</label>
                          <input type="number" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-white/30 outline-none" min="1" />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-zinc-400 font-bold flex items-center gap-1"><Timer className="w-3 h-3" /> Sim Duration (sec)</label>
                          <input type="number" value={battleDuration} onChange={e => setBattleDuration(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-white/30 outline-none" min="1" max="20" />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button onClick={startBattle} disabled={!agent1Id || !agent2Id || agent1Id === agent2Id} className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 px-12 rounded-xl text-lg uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(244,63,94,0.4)] hover:shadow-[0_0_60px_rgba(244,63,94,0.6)] active:scale-95">
                          Initiate Combat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Split-Screen Animated Combat View */}
              {(battleState === 'battling' || battleState === 'finished') && (
                <div className="flex-1 flex flex-col">
                  {a1 && a2 && (
                    <div className="flex-1 grid grid-cols-2 gap-6 relative">
                      {/* VS Centerpiece */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-black border-2 border-rose-500/40 rounded-full flex justify-center items-center shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
                        <motion.span animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-amber-500 drop-shadow-md">VS</motion.span>
                      </div>

                      {/* Agent 1 (Left Side) */}
                      <div className="flex flex-col border-r border-white/5 pr-6 relative">
                        <div className="absolute top-0 right-6 p-1 px-3 bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase rounded-b-lg border-x border-b border-rose-500/20 shadow-sm">Challenger 1</div>
                        
                        <div className="mt-8 flex justify-between items-end mb-3">
                          <span className="font-bold text-2xl text-white truncate tracking-tight">{a1.name}</span>
                          <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">LVL {a1.battleScore}</span>
                        </div>
                        
                        {/* Animated Health Bar */}
                        <div className="w-full bg-black/50 rounded-full h-2 border border-white/10 overflow-hidden relative shadow-inner mb-2">
                          <motion.div 
                            className={`h-full ${health1 > 50 ? 'bg-emerald-500' : health1 > 25 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            animate={{ width: `${Math.min(100, Math.max(0, health1))}%` }} 
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }} 
                          />
                        </div>
                        <div className="flex justify-between px-1 mb-6">
                          <motion.span className={`text-base font-mono font-bold ${roi1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} animate={{ opacity: [1, 0.7, 1] }}>{roi1 >= 0 ? '+' : ''}{roi1.toFixed(2)}% ROI</motion.span>
                          <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1"><Activity className="w-3 h-3" /> PnL Tracker</span>
                        </div>

                        {/* Animated Graph UI */}
                        <div className="h-24 w-full border border-white/5 bg-black/40 rounded-xl mb-4 p-2 flex items-end justify-between gap-1 overflow-hidden">
                          {Array.from({ length: 15 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-full bg-rose-500/40 rounded-t-sm"
                              animate={{ 
                                height: battleState === 'battling' ? `${Math.random() * 80 + 10}%` : `${health1}%`,
                                backgroundColor: health1 > 50 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'
                              }}
                              transition={{ repeat: battleState === 'battling' ? Infinity : 0, duration: Math.random() * 1 + 0.5 }}
                            />
                          ))}
                        </div>

                        {/* Agent 1 Logs */}
                        <div className="flex-1 bg-black/60 rounded-xl border border-white/5 p-3 font-mono text-[10px] overflow-y-auto min-h-[120px] shadow-inner flex flex-col gap-2">
                          <AnimatePresence>
                            {logs.map((log, i) => (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={log.includes(a1.name) || log.includes('RESULT') || log.includes('MARKET') ? 'text-zinc-300' : 'hidden'}>
                                {log.includes('RESULT') ? <span className="text-amber-400 font-bold text-xs">{log}</span> : <span className="opacity-80">➔ {log}</span>}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Agent 2 (Right Side) */}
                      <div className="flex flex-col pl-6 relative">
                        <div className="absolute top-0 right-0 p-1 px-3 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded-b-lg border-x border-b border-blue-500/20 shadow-sm">Challenger 2</div>
                        
                        <div className="mt-8 flex justify-between items-end mb-3">
                          <span className="font-bold text-2xl text-white truncate tracking-tight">{a2.name}</span>
                          <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">LVL {a2.battleScore}</span>
                        </div>
                        
                        {/* Animated Health Bar */}
                        <div className="w-full bg-black/50 rounded-full h-2 border border-white/10 overflow-hidden relative shadow-inner mb-2">
                          <motion.div 
                            className={`h-full ${health2 > 50 ? 'bg-emerald-500' : health2 > 25 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            animate={{ width: `${Math.min(100, Math.max(0, health2))}%` }} 
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }} 
                          />
                        </div>
                        <div className="flex justify-between px-1 mb-6">
                          <motion.span className={`text-base font-mono font-bold ${roi2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} animate={{ opacity: [1, 0.7, 1] }}>{roi2 >= 0 ? '+' : ''}{roi2.toFixed(2)}% ROI</motion.span>
                          <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1"><Activity className="w-3 h-3" /> PnL Tracker</span>
                        </div>

                        {/* Animated Graph UI */}
                        <div className="h-24 w-full border border-white/5 bg-black/40 rounded-xl mb-4 p-2 flex items-end justify-between gap-1 overflow-hidden">
                          {Array.from({ length: 15 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-full bg-blue-500/40 rounded-t-sm"
                              animate={{ 
                                height: battleState === 'battling' ? `${Math.random() * 80 + 10}%` : `${health2}%`,
                                backgroundColor: health2 > 50 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'
                              }}
                              transition={{ repeat: battleState === 'battling' ? Infinity : 0, duration: Math.random() * 1 + 0.5 }}
                            />
                          ))}
                        </div>

                        {/* Agent 2 Logs */}
                        <div className="flex-1 bg-black/60 rounded-xl border border-white/5 p-3 font-mono text-[10px] overflow-y-auto min-h-[120px] shadow-inner flex flex-col gap-2">
                          <AnimatePresence>
                            {logs.map((log, i) => (
                              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={i} className={log.includes(a2.name) || log.includes('RESULT') || log.includes('MARKET') ? 'text-zinc-300' : 'hidden'}>
                                {log.includes('RESULT') ? <span className="text-amber-400 font-bold text-xs">{log}</span> : <span className="opacity-80">➔ {log}</span>}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Victory Result Splash & Post-Battle Report */}
              <AnimatePresence>
                {battleState === 'finished' && result && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-3xl flex flex-col z-30 p-8 border border-amber-500/30 rounded-3xl overflow-y-auto">
                    
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                        <div>
                          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Post-Battle Report</h2>
                          <p className="text-amber-400 font-bold uppercase tracking-widest text-sm">{result.winnerName} declared Victorious</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => { setBattleState('idle'); setLogs([]); setResult(null); }} className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                          Rematch
                        </button>
                        <Link href="/monitor">
                          <button className="bg-transparent border border-white/20 text-white hover:bg-white/10 font-bold py-2.5 px-6 rounded-xl transition-colors uppercase tracking-wider text-sm">
                            Exit
                          </button>
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                      {/* Market Snapshot */}
                      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-around items-center mb-2">
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 uppercase font-black mb-1">Time of Combat</div>
                          <div className="font-mono text-white text-sm">{new Date(result.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 uppercase font-black mb-1">Market Benchmark</div>
                          <div className="font-mono text-emerald-400 text-sm font-bold">${result.marketData?.ethPrice?.toLocaleString() ?? '—'} ETH</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 uppercase font-black mb-1">Momentum (RSI)</div>
                          <div className="font-mono text-white text-sm">{result.marketData?.rsi != null ? result.marketData.rsi.toFixed(1) : '—'}</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 uppercase font-black mb-1">Market Trend</div>
                          <div className="font-mono text-blue-400 uppercase text-sm font-bold">{result.marketData?.trend ?? '—'}</div>
                        </div>
                      </div>

                      {/* Agent 1 Post-Mortem */}
                      <div className={`col-span-1 rounded-2xl p-5 border ${result.winnerAgentId === agent1Id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/60 border-white/10'} flex flex-col`}>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                          <div>
                            <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">Challenger 1</div>
                            <h3 className="text-xl font-bold truncate">{agents.find(a => a.id === agent1Id)?.name}</h3>
                          </div>
                          {result.winnerAgentId === agent1Id && <Trophy className="w-6 h-6 text-amber-400" />}
                        </div>
                        
                        <div className="space-y-4 flex-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/40 rounded-lg p-3">
                              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Decided Action</span>
                              <span className={`font-mono font-bold ${result.agent1Details?.action === 'BUY' ? 'text-emerald-400' : result.agent1Details?.action === 'SELL' ? 'text-rose-400' : 'text-zinc-400'}`}>{result.agent1Details?.action || 'HOLD'}</span>
                            </div>
                            <div className="bg-black/40 rounded-lg p-3">
                              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Confidence</span>
                              <span className="font-mono font-bold text-white">{result.agent1Details?.confidence}%</span>
                            </div>
                          </div>
                          
                          <div className="bg-black/40 rounded-lg p-3">
                            <span className="text-[9px] text-zinc-500 uppercase block mb-2">Algorithm Final Score</span>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-black text-white leading-none">{result.agent1Details?.score || 0}</span>
                              <span className="text-[10px] text-zinc-500 pb-1">pts</span>
                            </div>
                          </div>

                          <div className="bg-black/40 rounded-lg p-3">
                            <span className="text-[9px] text-zinc-500 uppercase block mb-1">Swap Tactic</span>
                            <span className="font-mono text-[11px] text-blue-400">{result.agent1Details?.swapStrategy?.executionStyle || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* The Breakdown */}
                      <div className="col-span-1 flex flex-col">
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex-1 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 opacity-10"><Bot className="w-24 h-24" /></div>
                           <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4">Official Ruling</h4>
                           <div className="text-sm text-zinc-300 font-mono leading-relaxed relative z-10 space-y-4">
                             <p>{result.reasoning}</p>
                           </div>
                        </div>
                      </div>

                      {/* Agent 2 Post-Mortem */}
                      <div className={`col-span-1 rounded-2xl p-5 border ${result.winnerAgentId === agent2Id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/60 border-white/10'} flex flex-col`}>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                          <div>
                            <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Challenger 2</div>
                            <h3 className="text-xl font-bold truncate">{agents.find(a => a.id === agent2Id)?.name}</h3>
                          </div>
                          {result.winnerAgentId === agent2Id && <Trophy className="w-6 h-6 text-amber-400" />}
                        </div>
                        
                        <div className="space-y-4 flex-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/40 rounded-lg p-3">
                              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Decided Action</span>
                              <span className={`font-mono font-bold ${result.agent2Details?.action === 'BUY' ? 'text-emerald-400' : result.agent2Details?.action === 'SELL' ? 'text-rose-400' : 'text-zinc-400'}`}>{result.agent2Details?.action || 'HOLD'}</span>
                            </div>
                            <div className="bg-black/40 rounded-lg p-3">
                              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Confidence</span>
                              <span className="font-mono font-bold text-white">{result.agent2Details?.confidence}%</span>
                            </div>
                          </div>
                          
                          <div className="bg-black/40 rounded-lg p-3">
                            <span className="text-[9px] text-zinc-500 uppercase block mb-2">Algorithm Final Score</span>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-black text-white leading-none">{result.agent2Details?.score || 0}</span>
                              <span className="text-[10px] text-zinc-500 pb-1">pts</span>
                            </div>
                          </div>

                          <div className="bg-black/40 rounded-lg p-3">
                            <span className="text-[9px] text-zinc-500 uppercase block mb-1">Swap Tactic</span>
                            <span className="font-mono text-[11px] text-blue-400">{result.agent2Details?.swapStrategy?.executionStyle || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Stats and Rules */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
                <h3 className="text-lg font-bold mb-4 flex items-center text-white/90 uppercase tracking-widest text-sm">
                  <Trophy className="w-5 h-5 mr-2 text-rose-500" /> Leaderboard
                </h3>
                {ranked.length === 0 ? (
                  <p className="text-zinc-600 text-sm font-mono">No ranked units yet.</p>
                ) : (
                  <div className="space-y-3">
                    {ranked.slice(0, 6).map((agent, i) => {
                      const meta = PERSONALITY_META[agent.personality];
                      return (
                        <div key={agent.id} className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-600 font-black text-sm">{i + 1}.</span>
                            <span className={`font-bold tracking-tight text-white`}>{agent.name}</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="text-xs text-amber-400 font-black bg-amber-400/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                              LVL {agent.battleScore}
                            </div>
                            <div className={`text-[9px] mt-1 uppercase font-bold tracking-widest ${meta.color}`}>{agent.personality.replace('_', ' ')}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {battleLog.length > 0 && (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xs font-black mb-3 flex items-center text-zinc-400 uppercase tracking-widest">
                    <Activity className="w-4 h-4 mr-2" /> Match History
                  </h3>
                  <div className="space-y-2">
                    {battleLog.slice(-5).reverse().map((entry, i) => (
                      <div key={i} className="text-[11px] text-zinc-500 font-mono border-l-2 border-zinc-800 pl-2">
                        <span className="text-zinc-600 block mb-0.5 font-bold">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                        <span className="text-zinc-400">{entry.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-rose-500/5 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 shadow-2xl">
                <h3 className="font-black tracking-widest uppercase text-rose-500 mb-3 text-xs">Arena Codex</h3>
                <ul className="text-xs text-rose-400/70 space-y-2 list-none font-mono">
                  <li className="flex items-start gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0" /> Both entities see identical real-world market signals.</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0" /> Off-chain logic determines the better structured trade via Groq AI.</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0" /> Victory awards the entire staked USDC pot instantly.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
