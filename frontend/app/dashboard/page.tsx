"use client";

import Link from "next/link";

export default function DashboardPage() {
  const transactions = [
    {
      id: "1",
      type: "Payment",
      from: "0.5 ETH",
      to: "user@paytm",
      amount: "₹41,750",
      status: "Completed",
      date: "2 hours ago"
    },
    {
      id: "2",
      type: "Buy",
      from: "₹10,000",
      to: "119.76 USDC",
      amount: "₹10,100",
      status: "Completed",
      date: "1 day ago"
    },
    {
      id: "3",
      type: "Remittance",
      from: "$500 USD",
      to: "family@icici",
      amount: "₹41,625",
      status: "Processing",
      date: "2 days ago"
    },
  ];

  const portfolio = [
    { symbol: "USDC", amount: "1,245.50", value: "₹1,03,999", change: "+0.1%" },
    { symbol: "ETH", amount: "0.5234", value: "₹1,28,560", change: "+5.2%" },
    { symbol: "BTC", amount: "0.0123", value: "₹82,450", change: "+3.8%" },
    { symbol: "PAXG", amount: "0.0500", value: "₹25,623", change: "+1.2%" },
  ];

  const totalValue = portfolio.reduce((acc, asset) => {
    return acc + parseFloat(asset.value.replace(/,|₹/g, ''));
  }, 0);

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
              <div className="px-4 py-2 font-bold border-b-4 border-black">
                DASHBOARD
              </div>
              <button className="w-10 h-10 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                ⚙
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">DASHBOARD</h1>
          <p className="font-bold text-lg">Welcome back! Here's your portfolio.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/payment"
            className="p-6 bg-black text-white border-4 border-black font-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
          >
            <div className="text-4xl mb-2">💸</div>
            <div className="text-xl">PAY</div>
          </Link>
          <Link
            href="/remittance"
            className="p-6 bg-white text-black border-4 border-black font-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
          >
            <div className="text-4xl mb-2">🌍</div>
            <div className="text-xl">REMIT</div>
          </Link>
          <Link
            href="/invest"
            className="p-6 bg-white text-black border-4 border-black font-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all"
          >
            <div className="text-4xl mb-2">📈</div>
            <div className="text-xl">INVEST</div>
          </Link>
        </div>

        {/* Portfolio Value */}
        <div className="mb-12">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold mb-2">TOTAL PORTFOLIO VALUE</div>
            <div className="text-6xl font-black mb-4">₹{totalValue.toLocaleString()}</div>
            <div className="font-bold text-lg">+₹12,450 (3.8%) this month</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Holdings */}
          <div>
            <h2 className="text-3xl font-black mb-6">YOUR HOLDINGS</h2>
            <div className="space-y-4">
              {portfolio.map((asset) => (
                <div
                  key={asset.symbol}
                  className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-black">{asset.symbol}</div>
                      <div className="font-bold text-sm">{asset.amount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black">{asset.value}</div>
                      <div className="font-bold text-sm">{asset.change}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-3xl font-black mb-6">RECENT ACTIVITY</h2>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-black text-xl">{tx.type}</div>
                      <div className="font-bold text-sm">{tx.date}</div>
                    </div>
                    <div className={`px-3 py-1 border-4 border-black font-black text-xs ${
                      tx.status === "Completed" ? "bg-white" : "bg-black text-white"
                    }`}>
                      {tx.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-1 font-bold">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span>{tx.from}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span>{tx.to}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black border-t-4 border-black pt-2 mt-2">
                      <span>Amount:</span>
                      <span>{tx.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/transactions"
              className="block mt-6 p-4 bg-white border-4 border-black font-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
            >
              VIEW ALL TRANSACTIONS →
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-3xl font-black mb-2">12</div>
            <div className="font-bold">Total Transactions</div>
          </div>
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-3xl font-black mb-2">₹1.8L</div>
            <div className="font-bold">Volume (30 days)</div>
          </div>
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-3xl font-black mb-2">₹450</div>
            <div className="font-bold">Fees Saved</div>
          </div>
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-3xl font-black mb-2">45s</div>
            <div className="font-bold">Avg. Tx Time</div>
          </div>
        </div>
      </main>
    </div>
  );
}