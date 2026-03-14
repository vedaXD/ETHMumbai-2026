"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedGrid from "@/components/shared/AnimatedGrid";

export default function PaymentPage() {
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  const currencies = [
    { symbol: "USDC", name: "USD Coin", balance: "1,245.50" },
    { symbol: "USDT", name: "Tether", balance: "850.00" },
    { symbol: "ETH", name: "Ethereum", balance: "0.5234" },
    { symbol: "BTC", name: "Bitcoin", balance: "0.041" },
    { symbol: "EUR", name: "Euro", balance: "5,000.00" },
    { symbol: "USD", name: "US Dollar", balance: "2,500.00" },
  ];

  const conversionRates: Record<string, number> = {
    USDC: 83.5,
    USDT: 83.4,
    ETH: 305000,
    BTC: 8250000,
    EUR: 90.5,
    USD: 83.5,
  };

  const getInrValue = (amt: string, curr: string) => {
    if (!amt || isNaN(parseFloat(amt))) return 0;
    const rate = conversionRates[curr] || 83.5;
    return parseFloat(amt) * rate;
  };

  const inrValue = getInrValue(amount, selectedCurrency);
  const conversionFee = amount ? parseFloat(amount) * 0.005 : 0;
  const youReceiveInr = inrValue * 0.995;

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
        <main className="container mx-auto px-6 py-12 max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black mb-2 text-white">Send Currency</h1>
            <p className="text-zinc-400">Convert to INR and send via UPI instantly</p>
          </motion.div>

          {/* Progress */}
          <div className="flex gap-2 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step >= i ? "bg-red-600" : "bg-[#1a1a1a]"
                }`}
              />
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-white">Select Currency</h2>
              {currencies.map((currency) => (
                <button
                  key={currency.symbol}
                  onClick={() => setSelectedCurrency(currency.symbol)}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all card-hover ${
                    selectedCurrency === currency.symbol
                      ? "bg-[#0a0a0a] border-red-600"
                      : "bg-[#0a0a0a] border-[#1a1a1a] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xl font-bold text-white">{currency.symbol}</div>
                      <div className="text-sm text-zinc-400">{currency.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Balance</div>
                      <div className="text-lg font-bold text-white">{currency.balance}</div>
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all pulse-red"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Enter Details</h2>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                  Amount ({selectedCurrency})
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 text-2xl font-bold bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white focus:border-red-600 focus:outline-none transition-colors"
                />
                <p className="mt-2 text-zinc-400">≈ ₹{inrValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Recipient UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@paytm"
                  className="w-full p-4 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-[#0a0a0a] rounded-xl p-6 border-2 border-[#1a1a1a]">
                <h3 className="font-bold mb-3 text-white">Fee Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Conversion Fee (0.5%):</span>
                    <span className="font-semibold">{conversionFee.toLocaleString(undefined, { maximumFractionDigits: 6 })} {selectedCurrency}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 pt-1">
                    <span>Exchange Rate:</span>
                    <span className="font-semibold">1 {selectedCurrency} = ₹{conversionRates[selectedCurrency] || 83.5}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#1a1a1a] mt-2 pt-2">
                    <span className="font-bold text-white">They'll receive:</span>
                    <span className="font-bold text-red-500">₹{youReceiveInr.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-4 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl font-bold text-white hover:border-zinc-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all pulse-red"
                >
                  Review
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Confirm Payment</h2>

              <div className="bg-[#0a0a0a] rounded-2xl p-6 border-2 border-[#1a1a1a]">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">From</div>
                    <div className="text-2xl font-bold text-white">{amount} {selectedCurrency}</div>
                  </div>
                  <div className="border-t border-[#1a1a1a] pt-4">
                    <div className="text-sm text-zinc-500 mb-1">To</div>
                    <div className="text-xl font-bold text-white">{upiId || "Not specified"}</div>
                  </div>
                  <div className="border-t border-[#1a1a1a] pt-4">
                    <div className="text-sm text-zinc-500 mb-1">They Receive</div>
                    <div className="text-3xl font-black text-red-500">
                      ₹{youReceiveInr.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border-2 border-red-600/20 rounded-2xl p-6">
                <h3 className="font-bold mb-3 text-white">AI-Optimized Route</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-zinc-300">{selectedCurrency} → USDC (Best Rate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-zinc-300">USDC → INR (₹83.50)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-zinc-300">INR → UPI Transfer</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-4">Powered by Heyelsa • ~30 seconds</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-4 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl font-bold text-white hover:border-zinc-700 transition-all"
                >
                  Back
                </button>
                <button className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all pulse-red">
                  Confirm & Send
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}