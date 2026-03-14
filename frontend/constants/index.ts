// Application constants

export const SUPPORTED_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', decimals: 6 },
] as const;

export const STABLECOINS = [
  { symbol: 'USDC', name: 'USD Coin', address: '0x...' },
  { symbol: 'USDT', name: 'Tether', address: '0x...' },
] as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  PROFILE: '/profile',
} as const;

export const BASE_NETWORK = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
} as const;
