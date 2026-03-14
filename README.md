# CryptoToINR - ETHMumbai 2026

> Pay anyone in India with Crypto or Foreign Currency via UPI

![Status](https://img.shields.io/badge/status-hackathon-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Overview

CryptoToINR is a revolutionary payment and remittance platform that enables seamless conversion of cryptocurrency and foreign currency to Indian Rupees (INR) with instant transfer via UPI. Built for ETHMumbai 2026 hackathon.

## ✨ Key Features

- 💸 **Crypto Payments** - Pay local vendors using BTC, ETH, USDC, USDT
- 🌍 **Forex Remittance** - Send USD, EUR, GBP, AED to India instantly
- 🤖 **AI-Optimized Routes** - Heyelsa agents find the best conversion paths
- ⚡ **Instant UPI Transfer** - Money reaches recipient's UPI ID in seconds
- 🔐 **KYC Compliant** - Self.xyz integration for regulatory compliance
- 📦 **Decentralized Storage** - Transaction receipts on IPFS via Fileverse
- 🔗 **Built on Base** - Fast L2 with low fees

## 🔄 How It Works

### Flow 1: Crypto Payment
```
Crypto (BTC/ETH/USDC) → Stablecoin (on Base) → INR → UPI Transfer
```

### Flow 2: Forex Remittance
```
Foreign Currency (USD/EUR/GBP) → Stablecoin (on Base) → INR → UPI Transfer
```

## 🏗️ Architecture

```
┌─────────────────┐
│  Next.js App    │ (User Interface)
└────────┬────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
    ↓                             ↓
┌─────────┐                  ┌──────────┐
│  Base   │ ←─ Heyelsa ─→   │ Self.xyz │
│  (L2)   │                  │  (KYC)   │
└────┬────┘                  └──────────┘
     │
     ↓
┌──────────┐                ┌───────────┐
│Fileverse │                │ Razorpay  │
│  (IPFS)  │                │   (UPI)   │
└──────────┘                └───────────┘
```

## 🛠️ Tech Stack

### Hackathon Sponsor Technologies

| Technology | Purpose |
|------------|---------|
| **Base** | L2 blockchain for crypto transactions |
| **Heyelsa** | AI agents for route optimization |
| **ENS** | User-friendly addresses |
| **Fileverse** | IPFS storage for receipts & compliance |
| **Self.xyz** | KYC/AML compliance |

### Additional Technologies
- **Razorpay** - UPI payment gateway
- **Next.js 15** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
ETHMumbai-2026/
├── frontend/              # Next.js application
│   ├── app/              # Pages and routes
│   ├── components/       # React components
│   ├── lib/              # Integration libraries
│   │   ├── heyelsa/     # AI optimization
│   │   ├── base/        # Base network
│   │   ├── ens/         # ENS resolution
│   │   ├── fileverse/   # IPFS storage
│   │   ├── self/        # KYC/compliance
│   │   └── razorpay/    # UPI payments
│   ├── types/           # TypeScript types
│   └── constants/       # App constants
├── contracts/           # Smart contracts (TBD)
└── PRODUCT_SPEC.md     # Detailed specification
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or Web3 wallet
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ETHMumbai-2026.git
cd ETHMumbai-2026

# Setup frontend
cd frontend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Setup

You'll need API keys for:
- Razorpay (for UPI transfers)
- Heyelsa (for AI optimization)
- Self.xyz (for KYC)
- Fileverse (for IPFS storage)
- Base RPC URL

See `frontend/.env.example` for all required variables.

## 📖 Documentation

- [Product Specification](./PRODUCT_SPEC.md) - Detailed product requirements
- [Frontend README](./frontend/README.md) - Frontend documentation

## 💡 Use Cases

### 1. Local Vendor Payments
Alice wants to pay her local coffee shop using Bitcoin:
1. Scans QR code with UPI ID
2. Enters amount in INR
3. Pays with BTC from her wallet
4. Heyelsa finds optimal route
5. Coffee shop receives INR instantly

### 2. International Remittance
Bob in the US sends money to his family in India:
1. Creates account and completes KYC
2. Enters USD amount
3. Provides beneficiary's UPI ID
4. System converts USD → USDC → INR
5. Family receives INR in seconds

## 🎨 Screenshots

[Coming soon - Add screenshots after UI is complete]

## 📊 Competitive Advantages

| Feature | CryptoToINR | Traditional Remittance | Crypto Exchanges |
|---------|-------------|----------------------|------------------|
| Speed | ⚡ Instant | 🐌 2-5 days | ⚡ Fast |
| Fees | 💰 ~1.8% | 💸 6-8% | 💰 1-3% |
| UPI Support | ✅ Direct | ❌ No | ❌ No |
| AI Optimization | ✅ Yes | ❌ No | ❌ No |
| Compliance | ✅ Built-in | ✅ Yes | ⚠️ Manual |

## 🗺️ Roadmap

- [x] Project initialization
- [x] Frontend setup
- [x] Integration placeholders
- [ ] Smart contract development
- [ ] Complete sponsor integrations
- [ ] Alpha testing
- [ ] Beta launch
- [ ] Public launch

See [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) for detailed roadmap.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 👥 Team

Built for ETHMumbai 2026 Hackathon

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/yourusername/ETHMumbai-2026/issues)
- Email: team@cryptotoinr.com (placeholder)

## 🙏 Acknowledgments

Special thanks to ETHMumbai 2026 sponsors:
- Heyelsa for AI optimization tools
- Base for robust L2 infrastructure
- ENS for identity solutions
- Fileverse for decentralized storage
- Self.xyz for compliance solutions

---

**Built with ❤️ for ETHMumbai 2026**