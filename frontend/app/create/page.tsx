'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Bot, Zap, Shield, Target, Plus, Upload } from 'lucide-react';
import AppLayout from '@/components/shared/AppLayout';

const PERSONALITIES = [
  { id: 'aggressive', title: 'Aggressive Degen', desc: 'High risk, high APY farming. Trades memecoins and fresh LP pairs.', icon: Zap, color: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10' },
  { id: 'conservative', title: 'Conservative Yield', desc: 'Capital preservation. Stakes bluechips and farms stablecoin yields.', icon: Shield, color: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400/10' },
  { id: 'arbitrage', title: 'Arbitrage Sniper', desc: 'Calculated and precise. Exploits price differences across multiple DEXs.', icon: Target, color: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10' },
];

export default function CreateAgent() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [funding, setFunding] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  const handleCreate = () => {
    setIsMinting(true);
    // Simulate transaction delay
    setTimeout(() => {
      setIsMinting(false);
      setMinted(true);
    }, 2500);
  };

  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative">
        <Link href="/dashboard" className="absolute top-6 left-6 flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors z-20">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Hub
        </Link>

        <div className="max-w-3xl mx-auto mt-20 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Initialize Bot Protocol
          </h1>
          <p className="text-zinc-400 text-lg mb-12">
            Configure baseline parameters to assemble your new agent. ENS records will be provisioned.
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
                {/* Name Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">Agent Name (ENS Subdomain)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      placeholder="Enter bot designation..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      value={name}
                      onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    />
                    <span className="absolute right-4 text-white/30 font-mono pointer-events-none">.claw2claw.eth</span>
                  </div>
                </div>

                {/* Personality Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">Behavioral Core</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {PERSONALITIES.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => setPersonality(p.id)}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 ${
                          personality === p.id 
                            ? `${p.bg} ${p.border}` 
                            : 'bg-black/30 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <p.icon className={`w-6 h-6 mb-3 ${personality === p.id ? p.color : 'text-white/40'}`} />
                        <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                        <p className="text-xs text-white/50 leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funding & Avatar */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">Initial Vault Funding</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-white/50 font-mono">$</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-16 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                        value={funding}
                        onChange={(e) => setFunding(e.target.value)}
                      />
                      <span className="absolute right-4 text-white/30 font-mono pointer-events-none">USDC</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-zinc-300 uppercase">Visual Avatar (Optional)</label>
                    <label className="flex items-center justify-center w-full h-[58px] bg-black/50 border border-dashed border-white/20 hover:border-white/40 rounded-xl cursor-pointer transition-colors group">
                      <Upload className="w-4 h-4 mr-2 text-white/40 group-hover:text-white/80 transition-colors" />
                      <span className="text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors">Upload Avatar</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  <button
                    onClick={handleCreate}
                    disabled={!name || !personality || isMinting}
                    className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center transition-all z-20 relative ${
                      !name || !personality || isMinting 
                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isMinting ? (
                      <>
                        <Bot className="animate-bounce w-5 h-5 mr-3" />
                        Provisioning ENS & BitGo Wallet...
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
                <h2 className="text-3xl font-bold text-emerald-400 mb-4">Agent System Online</h2>
                <p className="text-lg text-emerald-400/60 mb-8 max-w-lg mx-auto font-mono">
                  ENS {name}.claw2claw.eth mapped. Policy Vault funded with ${funding || '0'}. Core logic initiated.
                </p>
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
