'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Send, Sparkles, TrendingUp, TrendingDown,
  Minus, AlertTriangle, CheckCircle, Zap, RefreshCw,
} from 'lucide-react';
import AppLayout from '@/components/shared/AppLayout';
import {
  AgentService, MarketData, StrategyResponse, StrategyAction,
} from '@/lib/agents';

// ─── Quick-prompt chips ─────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'I have 5 ETH. How do I maximize profit?',
  'I have 2 ETH and want low risk yield',
  'Should I provide liquidity or hold?',
  'I have 10 ETH — best Uniswap v4 hook strategy?',
  'Market is overbought — what should I do with 3 ETH?',
  'How do I hedge my 8 ETH position?',
];

// ─── Risk badge ──────────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: StrategyAction['risk'] }) {
  const styles = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${styles[risk]}`}>
      {risk} risk
    </span>
  );
}

// ─── Chat message types ──────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  strategy?: StrategyResponse;
  market?: MarketData;
  loading?: boolean;
}

// ─── Strategy result card ────────────────────────────────────────────────────
function StrategyCard({ strategy, market }: { strategy: StrategyResponse; market: MarketData }) {
  const trendColor =
    market.trend === 'up' ? 'text-emerald-400' : market.trend === 'down' ? 'text-rose-400' : 'text-zinc-400';

  return (
    <div className="space-y-4 mt-2">
      {/* Market snapshot pill */}
      <div className="flex flex-wrap gap-3 text-[11px] font-mono">
        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
          ETH <span className="text-white font-bold">${market.ethPrice.toFixed(2)}</span>
        </span>
        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
          RSI <span className={market.rsi < 30 ? 'text-emerald-400 font-bold' : market.rsi > 70 ? 'text-rose-400 font-bold' : 'text-white font-bold'}>{market.rsi}</span>
        </span>
        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
          Trend <span className={`font-bold ${trendColor}`}>{market.trend.toUpperCase()}</span>
        </span>
      </div>

      {/* Market context */}
      <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl px-4 py-3">
        <p className="text-indigo-300 text-sm font-mono">{strategy.marketContext}</p>
      </div>

      {/* Summary */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">
          <Sparkles className="w-3 h-3" /> Strategy Summary
        </div>
        <p className="text-sm text-white/90 leading-relaxed">{strategy.summary}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {strategy.actions.map((action) => (
          <motion.div
            key={action.step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: action.step * 0.1 }}
            className="bg-zinc-900/40 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                  {action.step}
                </span>
                <span className="font-bold text-sm">{action.action}</span>
              </div>
              <RiskBadge risk={action.risk} />
            </div>

            <div className="ml-8 space-y-1.5">
              <div className="text-xs text-zinc-400 font-mono">
                <span className="text-zinc-500">Protocol</span>{' '}
                <span className="text-blue-400">{action.protocol}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{action.detail}</p>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-mono font-bold">{action.expectedReturn}</span>
              </div>
              {action.uniswapHook && (
                <div className="bg-indigo-950/60 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-[10px] font-mono text-indigo-300">
                  <span className="text-white font-bold">Uniswap v4 Hook:</span> {action.uniswapHook}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Total Expected Return</div>
          <div className="text-emerald-400 font-bold text-sm font-mono">{strategy.totalExpectedReturn}</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Risk Profile</div>
          <div className="text-white text-xs leading-snug">{strategy.riskProfile}</div>
        </div>
      </div>

      {/* Warnings */}
      {strategy.warnings.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 space-y-1">
          {strategy.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function StrategyPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ask me anything about your ETH portfolio strategy. I have live market data and will give you specific Uniswap v3/v4 swap plans.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: question,
    };
    const loadingMsg: Message = {
      id: `l-${Date.now()}`,
      role: 'assistant',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const { market, strategy } = await AgentService.askStrategy(question);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, loading: false, strategy, market }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, loading: false, text: `Error: ${err.message}` }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-grow text-white flex flex-col relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-bold text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Strategy Advisor
                </h1>
                <p className="text-xs text-zinc-500">Powered by Groq · live market data · Uniswap v3/v4</p>
              </div>
            </div>
            <Link href="/monitor">
              <button className="text-xs text-zinc-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                Monitor Agents
              </button>
            </Link>
          </div>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Quick prompts — show only at start */}
            {messages.length <= 1 && (
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => ask(p)}
                    className="text-left text-xs text-zinc-300 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 transition-all leading-relaxed"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="bg-white/10 border border-white/15 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ) : (
                  <div className="max-w-full w-full">
                    {/* Agent icon */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">OpenClaw Strategy</span>
                    </div>

                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-zinc-500 text-sm pl-1">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing market data and building strategy...
                      </div>
                    ) : msg.strategy && msg.market ? (
                      <StrategyCard strategy={msg.strategy} market={msg.market} />
                    ) : (
                      <p className="text-sm text-zinc-300 pl-1">{msg.text}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="sticky bottom-0 z-20 bg-black/60 backdrop-blur-xl border-t border-white/10 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-3 bg-zinc-900 border border-white/15 rounded-2xl px-4 py-3 focus-within:border-violet-500/50 transition-colors"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I have 5 ETH — what should I do to maximize profit?"
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
            <p className="text-center text-[10px] text-zinc-600 mt-2 font-mono">
              Simulation only · Base Sepolia testnet · Not financial advice
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
