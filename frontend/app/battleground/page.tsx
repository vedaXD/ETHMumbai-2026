'use client';

import { useState, useEffect, type ElementType } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/shared/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Swords, Trophy, Activity, Skull, Zap, BarChart2, TrendingUp,
  Minus, Shield, RefreshCw,
} from 'lucide-react';
import { AgentService, Agent, PERSONALITY_META, Personality, BattleResult } from '@/lib/agents';

const P_ICONS: Record<Personality, ElementType> = {
  risk_taker: Zap,
  safe_player: Shield,
  balanced: BarChart2,
  momentum_hunter: TrendingUp,
  contrarian: Minus,
};

export default function Battleground() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [battleState, setBattleState] = useState<'idle' | 'battling' | 'finished'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [agent1Id, setAgent1Id] = useState('');
  const [agent2Id, setAgent2Id] = useState('');
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

    const a1 = agents.find((a) => a.id === agent1Id);
    const a2 = agents.find((a) => a.id === agent2Id);
    if (!a1 || !a2) return;

    setLogs([
      '[SYSTEM] Initializing Battle Protocol...',
      `[MATCH] ${a1.name} [${PERSONALITY_META[a1.personality].label}] vs ${a2.name} [${PERSONALITY_META[a2.personality].label}]`,
      '[SYSTEM] Fetching live market data...',
      '[SYSTEM] Running AI reasoning for both agents...',
    ]);

    try {
      const battleResult = await AgentService.battle(agent1Id, agent2Id);

      // Animate logs
      const extraLogs = [
        `[${a1.name.toUpperCase()}] Evaluating market with ${PERSONALITY_META[a1.personality].label} strategy...`,
        `[${a2.name.toUpperCase()}] Evaluating market with ${PERSONALITY_META[a2.personality].label} strategy...`,
        `[ARENA] Simulating trade outcomes...`,
        `[RESULT] Winner determined: ${battleResult.winnerName}`,
      ];

      let delay = 800;
      for (const log of extraLogs) {
        await new Promise((res) => setTimeout(res, delay));
        setLogs((prev) => [...prev, log]);
        delay = 900;
      }

      await new Promise((res) => setTimeout(res, 500));
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

  // Top battle scoreboard
  const ranked = [...agents].sort((a, b) => b.battleScore - a.battleScore);

  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] transition-colors duration-1000 ${
              battleState === 'battling' ? 'bg-red-500/20' : 'bg-rose-500/10'
            }`}
          />
          <div
            className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] transition-colors duration-1000 ${
              battleState === 'battling' ? 'bg-amber-500/20' : 'bg-purple-500/10'
            }`}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retreat to Hub
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 rounded-2xl mb-6 border border-rose-500/20">
              <Swords className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
              The Arena
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-mono">
              PvP agent battles. Same market. Best AI wins.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Main battle area */}
            <div className="md:col-span-8 bg-zinc-900/50 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 min-h-[500px] flex flex-col relative overflow-hidden">
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
                      <Skull className="w-16 h-16 text-rose-500/30 mx-auto" />
                      <h3 className="text-xl font-bold">Select Combatants</h3>

                      {/* Agent selectors */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-500 uppercase tracking-wide">Agent 1</label>
                          <select
                            value={agent1Id}
                            onChange={(e) => setAgent1Id(e.target.value)}
                            className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                          >
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} [{PERSONALITY_META[a.personality].label}]
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-500 uppercase tracking-wide">Agent 2</label>
                          <select
                            value={agent2Id}
                            onChange={(e) => setAgent2Id(e.target.value)}
                            className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                          >
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} [{PERSONALITY_META[a.personality].label}]
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={startBattle}
                        disabled={!agent1Id || !agent2Id || agent1Id === agent2Id}
                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl text-lg uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] active:scale-95"
                      >
                        Begin Battle
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(battleState === 'battling' || battleState === 'finished') && (
                <div className="flex-1 flex flex-col">
                  {/* Fighter display */}
                  {a1 && a2 && (
                    <div className="flex justify-between items-center mb-6 bg-black/50 p-5 rounded-2xl border border-white/5">
                      {[a1, a2].map((agent, idx) => {
                        const meta = PERSONALITY_META[agent.personality];
                        const Icon = P_ICONS[agent.personality] ?? Zap;
                        return (
                          <div key={agent.id} className={`text-center w-5/12 ${idx === 1 ? '' : ''}`}>
                            <div
                              className={`w-14 h-14 ${meta.bg} rounded-xl mx-auto mb-2 flex items-center justify-center border ${meta.border}`}
                            >
                              <Icon className={`w-7 h-7 ${meta.color}`} />
                            </div>
                            <div className={`font-mono font-bold truncate ${meta.color}`}>{agent.name}</div>
                            <div className="text-xs text-zinc-500">{meta.label}</div>
                            <div className="text-xs text-zinc-500">Score: {agent.battleScore}</div>
                          </div>
                        );
                      })}
                      <div className="w-2/12 text-center">
                        <div className="text-3xl font-black text-rose-500">VS</div>
                      </div>
                    </div>
                  )}

                  {/* Battle log terminal */}
                  <div className="flex-1 bg-black/80 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-y-auto max-h-[200px] flex flex-col gap-1.5">
                    <AnimatePresence>
                      {logs.map((log, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i}
                          className={`py-0.5 ${
                            log.includes('SYSTEM') || log.includes('ERROR')
                              ? 'text-zinc-500'
                              : log.includes('RESULT')
                              ? 'text-amber-400 font-bold'
                              : log.includes('ARENA')
                              ? 'text-rose-400'
                              : 'text-zinc-300'
                          }`}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Victory overlay */}
              <AnimatePresence>
                {battleState === 'finished' && result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20 p-8"
                  >
                    <Trophy className="w-20 h-20 text-amber-400 mb-4" />
                    <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
                      Victory
                    </h2>
                    <p className="text-xl text-amber-400 font-mono mb-4">{result.winnerName} wins!</p>
                    <p className="text-xs text-zinc-400 font-mono text-center max-w-md leading-relaxed mb-8">
                      {result.reasoning.slice(0, 200)}...
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setBattleState('idle');
                          setLogs([]);
                          setResult(null);
                        }}
                        className="bg-white hover:bg-zinc-200 text-black font-bold py-3 px-8 rounded-xl transition-colors"
                      >
                        New Match
                      </button>
                      <Link href="/monitor">
                        <button className="bg-transparent border border-white/20 text-white hover:bg-white/10 font-bold py-3 px-8 rounded-xl transition-colors">
                          View Stats
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-4 space-y-6">
              {/* Rankings */}
              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center text-white/90">
                  <Trophy className="w-5 h-5 mr-2 text-rose-500" /> Battle Rankings
                </h3>
                {ranked.length === 0 ? (
                  <p className="text-zinc-600 text-sm">No battles yet.</p>
                ) : (
                  <div className="space-y-3">
                    {ranked.slice(0, 6).map((agent, i) => {
                      const meta = PERSONALITY_META[agent.personality];
                      return (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 font-bold w-5 text-sm">{i + 1}.</span>
                            <span className={`font-mono text-xs ${meta.color}`}>{agent.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-amber-400 font-bold">
                              {agent.battleScore} W
                            </div>
                            <div className={`text-[10px] ${meta.color}`}>{meta.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent battle log */}
              {battleLog.length > 0 && (
                <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold mb-3 flex items-center text-zinc-400 uppercase tracking-wide">
                    <Activity className="w-4 h-4 mr-2" /> Recent Battles
                  </h3>
                  <div className="space-y-2">
                    {battleLog.slice(-5).reverse().map((entry, i) => (
                      <div key={i} className="text-xs text-zinc-500 font-mono">
                        <span className="text-zinc-600">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>{' '}
                        {entry.result}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6">
                <h3 className="font-bold text-rose-400 mb-2">Arena Rules</h3>
                <ul className="text-sm text-rose-400/80 space-y-2 list-disc pl-4">
                  <li>Both agents see identical live market data.</li>
                  <li>Each agent reasons with their personality via Groq AI.</li>
                  <li>Winner scored by confidence + personality-market fit.</li>
                  <li>Battle scores persist across sessions.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
