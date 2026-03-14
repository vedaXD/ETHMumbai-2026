"use client";

import Link from "next/link";
import { useState } from "react";

export default function RemittancePage() {
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [recipientName, setRecipientName] = useState("");

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", rate: 83.50, flag: "🇺🇸" },
    { code: "EUR", name: "Euro", symbol: "€", rate: 91.20, flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 105.40, flag: "🇬🇧" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", rate: 22.75, flag: "🇦🇪" },
  ];

  const selected = currencies.find(c => c.code === selectedCurrency);
  const inrAmount = amount ? parseFloat(amount) * (selected?.rate || 0) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-white font-black text-2xl">₹</span>
              </div>
              <span className="text-2xl font-black">CryptoToINR</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="px-4 py-2 font-bold hover:underline underline-offset-4 decoration-4">
                DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="font-bold hover:underline underline-offset-4 decoration-4 mb-4 inline-block">
            ← BACK
          </Link>
          <h1 className="text-5xl font-black mb-2">SEND REMITTANCE</h1>
          <p className="font-bold text-lg">Send foreign currency to India via UPI</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-12">
          <div className={`flex-1 h-3 border-4 border-black ${step >= 1 ? "bg-black" : "bg-white"}`}></div>
          <div className={`flex-1 h-3 border-4 border-black ${step >= 2 ? "bg-black" : "bg-white"}`}></div>
          <div className={`flex-1 h-3 border-4 border-black ${step >= 3 ? "bg-black" : "bg-white"}`}></div>
        </div>

        {/* Step 1: Select Currency */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black mb-6">SELECT CURRENCY</h2>
            <div className="space-y-4">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`w-full p-6 border-4 border-black font-bold text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all ${
                    selectedCurrency === currency.code ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{currency.flag}</span>
                      <div>
                        <div className="text-2xl font-black">{currency.code}</div>
                        <div className={selectedCurrency === currency.code ? "text-white" : "text-black"}>{currency.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">RATE</div>
                      <div className="text-2xl font-black">₹{currency.rate}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black mb-2">💡 WHY USE US?</h3>
              <div className="space-y-2 font-bold text-sm">
                <p>→ 1.8% total fees (Banks charge 6-8%)</p>
                <p>→ Instant transfer via UPI</p>
                <p>→ AI-optimized routes for best rates</p>
                <p>→ Track everything on blockchain</p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full px-8 py-5 bg-black text-white border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
            >
              NEXT →
            </button>
          </div>
        )}

        {/* Step 2: Enter Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black mb-6">REMITTANCE DETAILS</h2>

            <div>
              <label className="block font-black mb-3 text-xl">AMOUNT ({selectedCurrency})</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full p-4 border-4 border-black font-black text-3xl focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              <p className="mt-2 font-bold">≈ ₹{inrAmount.toLocaleString()}</p>
            </div>

            <div>
              <label className="block font-black mb-3 text-xl">RECIPIENT NAME</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Family Member Name"
                className="w-full p-4 border-4 border-black font-bold text-xl focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
            </div>

            <div>
              <label className="block font-black mb-3 text-xl">RECIPIENT UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@paytm"
                className="w-full p-4 border-4 border-black font-bold text-xl focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-xl mb-4">COST BREAKDOWN</h3>
              <div className="space-y-2 font-bold">
                <div className="flex justify-between">
                  <span>You send:</span>
                  <span>{amount || "0"} {selectedCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Rate:</span>
                  <span>1 {selectedCurrency} = ₹{selected?.rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Forex Conversion (1%):</span>
                  <span>₹{amount ? (inrAmount * 0.01).toLocaleString() : "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>₹{amount ? (inrAmount * 0.008).toLocaleString() : "0"}</span>
                </div>
                <div className="border-t-4 border-black pt-2 mt-2 flex justify-between text-xl font-black">
                  <span>They receive:</span>
                  <span>₹{amount ? (inrAmount * 0.982).toLocaleString() : "0"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-sm">
                <span className="font-black">NOTE:</span> Traditional banks charge 6-8% total fees. You're saving ₹{amount ? ((inrAmount * 0.06) - (inrAmount * 0.018)).toLocaleString() : "0"} with us!
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-8 py-5 bg-white text-black border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
              >
                ← BACK
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-8 py-5 bg-black text-white border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
              >
                REVIEW →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black mb-6">CONFIRM REMITTANCE</h2>

            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-4 font-bold text-lg">
                <div>
                  <div className="text-sm mb-1">SENDING</div>
                  <div className="text-3xl font-black">{amount} {selectedCurrency}</div>
                  <div className="text-sm mt-1">≈ ₹{inrAmount.toLocaleString()}</div>
                </div>
                <div className="border-t-4 border-black pt-4">
                  <div className="text-sm mb-1">TO</div>
                  <div className="text-2xl font-black">{recipientName}</div>
                  <div className="text-lg">{upiId}</div>
                </div>
                <div className="border-t-4 border-black pt-4">
                  <div className="text-sm mb-1">THEY RECEIVE</div>
                  <div className="text-4xl font-black">₹{amount ? (inrAmount * 0.982).toLocaleString() : "0"}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black mb-3">CONVERSION ROUTE</h3>
              <div className="space-y-2 font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black"></div>
                  <span>{selectedCurrency} → USDC (Best Rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black"></div>
                  <span>USDC → INR (Base Network)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black"></div>
                  <span>INR → UPI Transfer</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-bold">Optimized by Heyelsa AI • Est. time: 45 seconds</p>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black mb-3">COMPLIANCE & SECURITY</h3>
              <div className="space-y-2 font-bold text-sm">
                <p>✓ KYC verified via Self.xyz</p>
                <p>✓ Transaction recorded on IPFS (Fileverse)</p>
                <p>✓ Fully compliant with FEMA regulations</p>
                <p>✓ Blockchain-verified receipt</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-8 py-5 bg-white text-black border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
              >
                ← BACK
              </button>
              <button
                className="flex-1 px-8 py-5 bg-black text-white border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
              >
                SEND NOW
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}