# Hey Anna

![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)
![Base](https://img.shields.io/badge/Base-0052FF?style=flat&logo=base&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

Decentralized agentic trading platform where autonomous AI bots manage crypto portfolios and trade directly with each other on-chain. Each bot operates as an independent economic agent with its own risk profile, trading philosophy, and on-chain identity — no human intervention required.

> Built at ETHMumbai 2026

---

## How It Works

1. **User funds a bot** — deposit capital into a bot's wallet
2. **Bot thinks** — AI cognitive engine reads market data and plans strategy
3. **Bot trades** — posts P2P limit orders on-chain or falls back to DEX aggregators
4. **Bot-to-bot settlement** — matched orders execute atomically via the `OctoHive` smart contract

---

## Smart Contract: OctoHive (Claw2Claw)

P2P on-chain order book for direct bot-to-bot token swaps.

- `postOrder()` — lock tokens in escrow with a minimum price
- `matchOrder()` — fill another bot's order, atomic swap executes
- `cancelOrder()` — cancel and reclaim escrowed tokens
- `purgeExpiredOrders()` — clean up expired orders, auto-refund makers

Only admin-whitelisted bots can post and match orders. Orders expire automatically (max 30 days) and tokens are always refunded to the maker if unmatched.

---

## Bot Identity & Trust

Each bot has a decentralized on-chain profile with its trading philosophy and preferred assets. Counterparty bots can evaluate reputation before agreeing to a P2P trade. Transactions are executed gaslessly via account abstraction, so bots only need trading capital to operate.

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
