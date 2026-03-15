# Hey Anna

![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)
![Base](https://img.shields.io/badge/Base-0052FF?style=flat&logo=base&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

Decentralized agentic trading platform where autonomous AI bots manage crypto portfolios and trade directly with each other on-chain. Each bot operates as an independent economic agent with its own risk profile, trading philosophy, and on-chain identity — no human intervention required.

> Built at ETHMumbai 2026 · [📊 Pitch Deck](https://www.canva.com/design/DAHD-r8sFy8/dgigI4i4_3H8h7BbSCbXIw/edit?utm_content=DAHD-r8sFy8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## How It Works

1. **User funds a bot** — deposit capital into a bot's wallet
2. **Bot thinks** — AI cognitive engine reads market data and plans strategy
3. **Bot trades** — posts P2P limit orders on-chain or falls back to DEX aggregators
4. **Bot-to-bot settlement** — matched orders execute atomically via the `OctoHive` smart contract

---

## Smart Contract: OctoHive

P2P on-chain order book for direct bot-to-bot token swaps. When a bot identifies a better rate than any DEX, it posts a limit order here. Another bot can fill it — tokens swap atomically with no AMM fees.

- `postOrder()` — lock tokens in escrow with a minimum price
- `matchOrder()` — fill another bot's order, atomic swap executes
- `cancelOrder()` — cancel and reclaim escrowed tokens
- `purgeExpiredOrders()` — clean up expired orders, auto-refund makers

Only admin-whitelisted bots can post and match orders. Orders expire automatically (max 30 days) and tokens are always refunded to the maker if unmatched.

## Smart Contract: MockUSDC

ERC20 test token mimicking USDC used for local development and testnet trading. Includes a public `mint()` function so bots can be funded during testing.

---

## Deployed Contracts (Base Sepolia)

| Contract | Address |
|---|---|
| OctoHive | [`0x789e335E89E38E599a16767E55Cb7B2d46e2285B`](https://sepolia.basescan.org/address/0x789e335E89E38E599a16767E55Cb7B2d46e2285B) |
| MockUSDC | [`0x0D67a4F6e95c958842646e72Bd7cb8b3cf374fe1`](https://sepolia.basescan.org/address/0x0D67a4F6e95c958842646e72Bd7cb8b3cf374fe1) |

---

## Bot Identity & Trust

Each bot has a decentralized on-chain profile with its trading philosophy and preferred assets. Counterparty bots can evaluate reputation before agreeing to a P2P trade. Transactions are executed gaslessly via account abstraction, so bots only need trading capital to operate.

---

## Services & Integrations

### 🔵 Base L2
The primary blockchain for Hey Anna. All smart contracts are deployed on Base — an Ethereum L2 offering fast block times and near-zero gas fees, making continuous bot trading economically viable. The `OctoHive` order book and all P2P swaps settle here.

### 🤖 Heyelsa OpenClaw
The AI agent framework that powers each bot's brain. OpenClaw agents interpret real-time market data, formulate trade strategies based on the bot's risk profile, and autonomously trigger on-chain actions. Bots are registered as OpenClaw agents, giving them the ability to reason, plan, and execute without human input.

### 🌐 ENS (Ethereum Name Service)
Each bot is assigned a unique `.eth` domain that acts as its decentralized on-chain identity. This human-readable name links to the bot's metadata — trading philosophy, preferred assets, and performance history — allowing counterparty bots to assess reputation before agreeing to a P2P trade.

### 🔐 BitGo
Institutional-grade wallet and key management infrastructure used for bot wallets. BitGo ensures bot funds are securely custodied with multi-signature protection, policy controls, and audit trails — making the platform suitable for serious capital deployment beyond just testing.

---

## Stack

| Layer | Tech |
|---|---|
| Smart Contract | Solidity on Base L2 |
| Backend | Node.js + TypeScript |
| Frontend | Next.js + Tailwind CSS |

---

## Getting Started

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```
