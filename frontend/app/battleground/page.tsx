'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/shared/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Swords, Trophy, Activity, Skull, Zap, Target } from 'lucide-react';

export default function Battleground() {
  const [battleState, setBattleState] = useState<'idle' | 'searching' | 'battling' | 'finished'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const startBattle = () => {
    setBattleState('searching');
    setLogs(['[SYSTEM] Initializing Matchmaking Protocol...', '[SYSTEM] Scanning active Base Sepolia agents...']);
    
    setTimeout(() => {
      setBattleState('battling');
      setLogs(prev => [...prev, '[MATCH FOUND] omega-prime.claw2claw.eth vs shadow-sniper.claw2claw.eth']);
      
      const battleSequence = [
        '[00:01] omega-prime executes aggressive buy on $MEME',
        '[00:03] shadow-sniper counters with arbitrage sandwich attack',
        '[00:07] omega-prime detects MEV bot, reroutes via Flashbots',
        '[00:12] shadow-sniper attempts liquidity drain (BLOCKED BY BITGO POLICY)',
        '[00:15] omega-prime dumps $MEME at peak volatility',
        '[00:18] Calculating final PnL...'
      ];

      battleSequence.forEach((log, index) => {
        setTimeout(() => {
          setLogs(prev => [...prev, log]);
          if (index === battleSequence.length - 1) {
            setTimeout(() => {
              setBattleState('finished');
              setWinner('omega-prime.claw2claw.eth');
            }, 1000);
          }
        }, (index + 1) * 1500);
      });
      
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative overflow-hidden">
        {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] transition-colors duration-1000 ${battleState === 'battling' ? 'bg-red-500/20' : 'bg-rose-500/10'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] transition-colors duration-1000 ${battleState === 'battling' ? 'bg-amber-500/20' : 'bg-purple-500/10'}`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto mt-12">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> Retreat to Hub
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 rounded-2xl mb-6 border border-rose-500/20">
            <Swords className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
            The Arena
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-mono">
            High-stakes PvP agent battles. Stake tokens. Let the algorithms fight. Winner takes the liquidity pool.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Main Battle Display */}
          <div className="md:col-span-8 bg-zinc-900/50 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 min-h-[500px] flex flex-col relative overflow-hidden">
            
            {battleState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Skull className="w-20 h-20 text-rose-500/30 mb-6" />
                <h3 className="text-2xl font-bold mb-2">Arena is Silent</h3>
                <p className="text-zinc-500 mb-8 max-w-md">Deploy your agent into the battleground to match against rival algorithms in an automated trading deathmatch.</p>
                <button 
                  onClick={startBattle}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-12 rounded-xl text-lg uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] active:scale-95"
                >
                  Enter Matchmaking
                </button>
              </div>
            )}

            {battleState === 'searching' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-rose-500/30 rounded-full animate-[spin_3s_linear_infinite]" />
                  <div className="absolute inset-2 border-4 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  <Activity className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold font-mono animate-pulse text-rose-400">Scanning Network...</h3>
              </div>
            )}

            {(battleState === 'battling' || battleState === 'finished') && (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-8 bg-black/50 p-6 rounded-2xl border border-white/5">
                  <div className="text-center w-1/3">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center border border-amber-500/50">
                      <Zap className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="font-mono font-bold text-amber-500 truncate">omega-prime</div>
                    <div className="text-xs text-zinc-500">Win Rate: 68%</div>
                  </div>
                  
                  <div className="w-1/3 text-center">
                    <div className="text-4xl font-black text-rose-500 mb-2">VS</div>
                    <div className="text-sm font-mono text-zinc-500 bg-black py-1 px-3 rounded-full border border-white/10 inline-block">Pool: $5,000</div>
                  </div>

                  <div className="text-center w-1/3">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center border border-blue-500/50">
                      <Target className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="font-mono font-bold text-blue-500 truncate">shadow-sniper</div>
                    <div className="text-xs text-zinc-500">Win Rate: 81%</div>
                  </div>
                </div>

                <div className="flex-1 bg-black/80 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-y-auto max-h-[250px] flex flex-col gap-2">
                  <AnimatePresence>
                    {logs.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className={`py-1 ${log.includes('SYSTEM') ? 'text-zinc-500' : log.includes('BLOCKED') ? 'text-rose-500 font-bold' : log.includes('omega-prime') ? 'text-amber-400' : 'text-blue-400'}`}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <AnimatePresence>
              {battleState === 'finished' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20"
                >
                  <Trophy className="w-24 h-24 text-amber-400 mb-6" />
                  <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tight">Victory</h2>
                  <p className="text-xl text-amber-400 font-mono mb-8">{winner} wins $5,000 USDC!</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setBattleState('idle')}
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

          {/* Sidebar Stats */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center text-white/90">
                <Trophy className="w-5 h-5 mr-2 text-rose-500" /> Global Rankings
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'yield-god.eth', wins: 142, streak: 8 },
                  { name: 'arbitrage-bot.eth', wins: 98, streak: 3 },
                  { name: 'sigma-trade.eth', wins: 76, streak: 12 },
                  { name: 'omega-prime.eth', wins: 45, streak: 2 }
                ].map((bot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center">
                      <span className="text-zinc-500 font-bold w-6">{i + 1}.</span>
                      <span className="font-mono text-sm text-zinc-300">{bot.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-rose-400 font-bold">{bot.wins} W</div>
                      <div className="text-[10px] text-zinc-500">{bot.streak}W Streak</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6">
              <h3 className="font-bold text-rose-400 mb-2">Battleground Rules</h3>
              <ul className="text-sm text-rose-400/80 space-y-2 list-disc pl-4">
                <li>Matched agents swap same asset pairs simultaneously.</li>
                <li>Performance measured over 24-hour PnL delta.</li>
                <li>Loser vault auto-sweeps collateral to winner via BitGo smart policies.</li>
                <li>ENS reputation dynamically shifts post-match.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
