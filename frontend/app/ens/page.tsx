'use client';

import AppLayout from '@/components/shared/AppLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ExternalLink, Globe, Shield, Zap, User, Fingerprint, Tag, Cpu,
  CheckCircle2, Copy
} from 'lucide-react';
import { useState } from 'react';

// ─── Static ENS demo data for judges ─────────────────────────────────────────
const ENS_AGENTS = [
  {
    subdomain: 'vitalik',
    fullName: 'vitalik.octohive.eth',
    avatar: '🤖',
    avatarBg: 'from-rose-600 to-violet-700',
    accentColor: 'rose',
    borderColor: 'border-rose-500/30',
    glowColor: 'shadow-[0_0_40px_rgba(244,63,94,0.15)]',
    tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    wallet: '0x1234...7890',
    registrationTx: '0x17aa9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd95',
    explorerUrl: 'https://sepolia.basescan.org/tx/0x17aa9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd95',
    ensAppUrl: 'https://app.ens.domains/vitalik.octohive.eth',
    resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    registeredAt: '2026-03-13T10:20:00Z',
    textRecords: [
      { key: 'description', label: 'Tagline', value: 'The contrarian that fades the crowd and wins quietly.', icon: Tag },
      { key: 'personality', label: 'Personality', value: 'contrarian', icon: Cpu },
      { key: 'com.twitter', label: 'Allowed Assets', value: 'ETH, USDC', icon: Shield },
      { key: 'url', label: 'Strategy URL', value: 'https://octohive.xyz/agents/vitalik', icon: Globe },
      { key: 'avatar', label: 'Avatar', value: 'ipfs://QmVitalik...avatar', icon: User },
    ],
    personality: 'Contrarian',
    budget: '100 USDC',
    trades: 1,
    winRate: '60%',
  },
  {
    subdomain: 'degen-sniper',
    fullName: 'degen-sniper.octohive.eth',
    avatar: '⚡',
    avatarBg: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    wallet: '0x9876...3210',
    registrationTx: '0x94bb9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd22',
    explorerUrl: 'https://sepolia.basescan.org/tx/0x94bb9abf8b871ed1f4f464d1f2150893081e1948db5ea325a7cc3e8113fcdd22',
    ensAppUrl: 'https://app.ens.domains/degen-sniper.octohive.eth',
    resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    registeredAt: '2026-03-10T08:15:00Z',
    textRecords: [
      { key: 'description', label: 'Tagline', value: 'Full-send or nothing. Alpha before everyone else.', icon: Tag },
      { key: 'personality', label: 'Personality', value: 'risk_taker', icon: Cpu },
      { key: 'com.twitter', label: 'Allowed Assets', value: 'ANY', icon: Shield },
      { key: 'url', label: 'Strategy URL', value: 'https://octohive.xyz/agents/degen-sniper', icon: Globe },
      { key: 'avatar', label: 'Avatar', value: 'ipfs://QmDegen...avatar', icon: User },
    ],
    personality: 'Risk Taker',
    budget: '200 USDC',
    trades: 1,
    winRate: '40%',
  },
];

const REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const PARENT_NODE = 'octohive.eth';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function ENSPage() {
  return (
    <AppLayout>
      <div className="flex-grow text-white p-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] bg-violet-500/8" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] bg-rose-500/8" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto mt-10">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Hub
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <Globe className="w-3 h-3" /> ENS Identity Layer
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Agent{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-rose-400">
                On-Chain Identity
              </span>
            </h1>
            <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
              Every agent deployed on OctoHive is registered as an{' '}
              <span className="text-white font-medium">ENS subdomain</span> under{' '}
              <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-sm">octohive.eth</code>.
              Personality, strategy, avatar, and allowed assets are stored as verifiable{' '}
              <span className="text-white font-medium">ENS Text Records</span> on-chain — giving
              each agent a persistent, trustless identity readable by any resolver.
            </p>
          </motion.div>

          {/* Architecture strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-3 mb-12"
          >
            {[
              { label: 'Parent Domain', value: 'octohive.eth', sub: 'ENS Registry' },
              { label: 'Resolver', value: '0x4976...a41', sub: 'Public Resolver v2' },
              { label: 'Network', value: 'Base Sepolia', sub: 'Chain ID 84532' },
              { label: 'Text Records', value: '5 fields/agent', sub: 'On-chain metadata' },
            ].map((item) => (
              <div key={item.label} className="bg-black/40 border border-white/8 rounded-2xl p-4">
                <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{item.label}</div>
                <div className="font-mono text-sm text-white font-bold">{item.value}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </motion.div>

          {/* Agent ENS Cards */}
          <div className="space-y-8">
            {ENS_AGENTS.map((agent, idx) => (
              <motion.div
                key={agent.subdomain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.1 }}
                className={`bg-black/50 backdrop-blur-xl border ${agent.borderColor} rounded-3xl overflow-hidden ${agent.glowColor}`}
              >
                {/* Card Header */}
                <div className="p-7 pb-5 border-b border-white/5">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${agent.avatarBg} flex items-center justify-center text-4xl shrink-0 shadow-lg`}>
                      {agent.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* ENS Name */}
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black tracking-tight">{agent.fullName}</h2>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${agent.tagColor}`}>
                          {agent.personality}
                        </span>
                      </div>

                      {/* Subdomain pill */}
                      <div className="flex items-center gap-2 font-mono text-sm text-zinc-500 mb-3">
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span className="text-violet-400">{agent.subdomain}</span>
                        <span className="text-zinc-700">.</span>
                        <span>octohive.eth</span>
                        <CopyButton text={agent.fullName} />
                      </div>

                      {/* Stats row */}
                      <div className="flex gap-4">
                        {[
                          { label: 'Budget', value: agent.budget },
                          { label: 'Trades', value: String(agent.trades) },
                          { label: 'Win Rate', value: agent.winRate },
                          { label: 'Registered', value: new Date(agent.registeredAt).toLocaleDateString() },
                        ].map((s) => (
                          <div key={s.label}>
                            <div className="text-[9px] text-zinc-600 uppercase font-bold">{s.label}</div>
                            <div className="text-sm font-bold text-white">{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <a href={agent.ensAppUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 px-3 py-2 rounded-xl transition-colors">
                        <Globe className="w-3 h-3" /> ENS App
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <a href={agent.explorerUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 px-3 py-2 rounded-xl transition-colors">
                        <ExternalLink className="w-3 h-3" /> Basescan
                      </a>
                    </div>
                  </div>
                </div>

                {/* Text Records grid */}
                <div className="p-7 pt-5">
                  <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    On-chain Text Records (ENS Public Resolver · setText)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    {agent.textRecords.map((rec) => (
                      <div key={rec.key} className="bg-black/40 border border-white/6 rounded-xl p-3 flex gap-3 items-start">
                        <div className="p-1.5 bg-white/5 rounded-lg shrink-0">
                          <rec.icon className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] text-zinc-600 uppercase font-bold mb-0.5 flex items-center gap-1">
                            <code className="text-zinc-500">{rec.key}</code>
                          </div>
                          <div className="text-sm text-zinc-300 font-mono truncate">{rec.value}</div>
                          <div className="text-[9px] text-zinc-600 mt-0.5">{rec.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Registration proof */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                    <div className="text-[9px] text-emerald-400 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> Registration Proof — Base Sepolia
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                      <div>
                        <span className="text-zinc-600">TX Hash: </span>
                        <span className="text-emerald-400">{agent.registrationTx.slice(0, 20)}...</span>
                        <CopyButton text={agent.registrationTx} />
                      </div>
                      <div>
                        <span className="text-zinc-600">Registry: </span>
                        <span className="text-zinc-400">{REGISTRY_ADDRESS.slice(0, 14)}...</span>
                      </div>
                      <div>
                        <span className="text-zinc-600">Resolver: </span>
                        <span className="text-zinc-400">{agent.resolver.slice(0, 14)}...</span>
                      </div>
                      <div>
                        <span className="text-zinc-600">Owner Wallet: </span>
                        <span className="text-zinc-400">{agent.wallet}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-12 bg-black/40 border border-white/8 rounded-3xl p-8"
          >
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 text-zinc-300">
              How Agent ENS Registration Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Agent Created', desc: 'User deploys an agent with name, personality, tagline, and optional asset limits.' },
                { step: '02', title: 'Subdomain Minted', desc: 'setSubnodeRecord() is called on the ENS Registry contract to register agent.octohive.eth on Base Sepolia.' },
                { step: '03', title: 'Resolver Linked', desc: 'The Public Resolver is set and the ETH address record is written to the agent\'s vault address.' },
                { step: '04', title: 'Profile Written', desc: 'setText() stores personality, tagline, avatar, and allowed assets as verifiable ENS text records on-chain.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-2">
                  <div className="text-3xl font-black text-zinc-800">{item.step}</div>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
