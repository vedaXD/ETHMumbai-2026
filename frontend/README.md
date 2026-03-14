# CryptoToINR Frontend

Next.js frontend for the Crypto/Forex to INR payment platform.

## Features

- 🚀 **Next.js 15** with App Router
- 💎 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🔗 **Web3 Integration** ready for Base network
- 🤖 **AI-Optimized Routes** via Heyelsa
- 🔐 **KYC Integration** with Self.xyz
- 📦 **IPFS Storage** via Fileverse
- 💳 **UPI Payments** via Razorpay

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or any Web3 wallet

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your API keys in .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── ...                # Other pages
├── components/            # React components
│   ├── payment/          # Payment flow components
│   ├── remittance/       # Remittance flow components
│   ├── shared/           # Shared components
│   └── layout/           # Layout components
├── lib/                   # Integration libraries
│   ├── heyelsa/          # Heyelsa AI optimization
│   ├── base/             # Base network integration
│   ├── ens/              # ENS name resolution
│   ├── fileverse/        # IPFS storage
│   ├── self/             # KYC/Compliance
│   └── razorpay/         # UPI payments
├── hooks/                 # Custom React hooks
├── services/              # API services
├── types/                 # TypeScript type definitions
└── constants/             # App constants
```

## Tech Stack Integration

### Base Network
L2 blockchain for fast and cheap transactions. Handles all crypto conversions and stablecoin swaps.

### Heyelsa (OpenClaw Agents)
AI agents that analyze multiple conversion routes and recommend the most profitable path with lowest fees.

### ENS
Ethereum Name Service for user-friendly addresses. Show `alice.eth` instead of `0x1234...`.

### Fileverse
IPFS storage for:
- Transaction receipts
- Encrypted KYC documents
- Compliance records
- Payment proofs

### Self.xyz
KYC and compliance platform for:
- User verification
- Transaction limits
- AML screening
- Regulatory compliance

### Razorpay
Payment gateway for final INR to UPI transfer.

## Environment Variables

See `.env.example` for all required environment variables. Key ones:

```env
# Base Network
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Heyelsa
NEXT_PUBLIC_HEYELSA_API_URL=
HEYELSA_API_KEY=

# Self.xyz
NEXT_PUBLIC_SELF_APP_ID=
SELF_API_KEY=

# Fileverse
NEXT_PUBLIC_FILEVERSE_API_URL=
FILEVERSE_API_KEY=
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check
```

## User Flows

### Flow 1: Crypto Payment
1. User connects wallet
2. Selects crypto (BTC, ETH, USDC, etc.)
3. Enters recipient UPI ID
4. Heyelsa optimizes conversion route
5. User approves transaction
6. Crypto → Stablecoin → INR → UPI
7. Receipt stored on IPFS

### Flow 2: Forex Remittance
1. User creates account and completes KYC
2. Inputs foreign currency amount
3. Heyelsa calculates best rate
4. User confirms and pays
5. Foreign Currency → Stablecoin → INR → UPI
6. Beneficiary receives INR instantly

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build
docker build -t cryptotoinr-frontend .

# Run
docker run -p 3000:3000 cryptotoinr-frontend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Hackathon

Built for **ETHMumbai 2026**

### Sponsor Technologies Used
- ✅ Heyelsa (AI Optimization)
- ✅ Base (L2 Network)
- ✅ ENS (Identity)
- ✅ Fileverse (IPFS)
- ✅ Self.xyz (KYC)
- ✅ Razorpay (not sponsor, but critical for UPI)

## Support

For issues and questions:
- Create an issue in the repository
- Contact: team@cryptotoinr.com (placeholder)

## Roadmap

See [PRODUCT_SPEC.md](../PRODUCT_SPEC.md) for detailed roadmap and features.
