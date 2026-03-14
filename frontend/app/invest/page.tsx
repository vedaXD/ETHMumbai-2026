"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedGrid from "@/components/shared/AnimatedGrid";

export default function InvestPage() {
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [amount, setAmount] = useState("");

  const assets = [
    {
      symbol: "USDC",
      name: "USD Coin",
      price: "₹83.50",
      type: "Stablecoin",
      emoji: "💵",
      desc: "Always $1. Store value safely."
    },
    {
      symbol: "USDT",
      name: "Tether",
      price: "₹83.45",
      type: "Stablecoin",
      emoji: "💸",
      desc: "Most liquid stablecoin globally."
    },
    {
      symbol: "PAXG",
      name: "PAX Gold",
      price: "₹5,12,450",
      type: "Gold-Backed",
      emoji: "🏆",
      desc: "1 PAXG = 1 oz gold. Hedge inflation."
    },
  ];

  const selected = assets.find(a => a.symbol === selectedAsset);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedGrid />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-[#1a1a1a] bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg pulse-red">
                  <span className="text-white font-black text-xl">₹</span>
                </div>
                <span className="text-xl font-bold text-white">PayFlow</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12 max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-black mb-2 text-white">Buy Crypto</h1>
            <p className="text-zinc-400">Purchase stablecoins and digital gold</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Asset Selection */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Choose Asset</h2>
              <div className="space-y-4">
                {assets.map((asset) => (
                  <motion.button
                    key={asset.symbol}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAsset(asset.symbol)}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all card-hover ${
                      selectedAsset === asset.symbol
                        ? "bg-[#0a0a0a] border-red-600"
                        : "bg-[#0a0a0a] border-[#1a1a1a] hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{asset.emoji}</div>
                        <div>
                          <div className="text-xl font-bold text-white">{asset.symbol}</div>
                          <div className="text-sm text-zinc-400">{asset.name}</div>
                          <div className="text-xs text-zinc-500 mt-1">{asset.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{asset.price}</div>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mt-3">{asset.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Purchase Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Purchase</h2>

              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">
                    Amount (INR)
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10,000"
                    className="w-full p-4 text-2xl font-bold bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white focus:border-red-600 focus:outline-none transition-colors"
                  />
                  {amount && selected && (
                    <p className="mt-2 text-zinc-400">
                      ≈ {(parseFloat(amount.replace(/,/g, '')) / parseFloat(selected.price.replace(/,|₹/g, ''))).toFixed(6)} {selectedAsset}
                    </p>
                  )}
                </div>

                {/* Fee Summary */}
                <div className="bg-[#0a0a0a] rounded-xl p-6 border-2 border-[#1a1a1a]">
                  <h3 className="font-bold mb-4 text-white">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Asset:</span>
                      <span className="font-semibold text-white">{selectedAsset}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Price:</span>
                      <span className="font-semibold text-white">{selected?.price}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Amount:</span>
                      <span className="font-semibold text-white">₹{amount || "0"}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Fee (1%):</span>
                      <span className="font-semibold text-white">₹{amount ? (parseFloat(amount.replace(/,/g, '')) * 0.01).toLocaleString() : "0"}</span>
                    </div>
                    <div className="border-t border-[#1a1a1a] pt-2 flex justify-between font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-red-500">₹{amount ? (parseFloat(amount.replace(/,/g, '')) * 1.01).toLocaleString() : "0"}</span>
                    </div>
                  </div>
                </div>

                {/* Why Invest */}
                <div className="bg-[#0a0a0a] border-2 border-red-600/20 rounded-xl p-6">
                  <h3 className="font-bold mb-2 text-white">Why {selectedAsset}?</h3>
                  <p className="text-sm text-zinc-400">{selected?.desc}</p>
                </div>

                {/* Buy Button */}
                <button className="w-full px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all pulse-red">
                  Buy {selectedAsset} Now
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  Assets sent to your connected wallet
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}