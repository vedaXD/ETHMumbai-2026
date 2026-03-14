// Application constants

export const SUPPORTED_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', decimals: 6 },
] as const;

export const SUPPORTED_FOREX = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
] as const;

export const STABLECOINS = [
  { symbol: 'USDC', name: 'USD Coin', address: '0x...' },
  { symbol: 'USDT', name: 'Tether', address: '0x...' },
] as const;

export const TRANSACTION_FEES = {
  CRYPTO_CONVERSION: 0.5, // 0.5%
  FOREX_CONVERSION: 1.0, // 1%
  OFFRAMP: 0.3, // 0.3%
  UPI_TRANSFER: 0, // Free
} as const;

export const ROUTES = {
  HOME: '/',
  PAYMENT: '/payment',
  REMITTANCE: '/remittance',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  PROFILE: '/profile',
  KYC: '/kyc',
} as const;

export const BASE_NETWORK = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
} as const;
