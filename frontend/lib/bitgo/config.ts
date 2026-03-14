/**
 * Base Sepolia Network Configuration
 */
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://sepolia.base.org',
    'https://base-sepolia-rpc.publicnode.com',
  ],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
  testnet: true,
};

/**
 * BitGo Configuration for Base Sepolia
 */
export const BITGO_BASE_SEPOLIA_CONFIG = {
  coinType: 'teth', // Testnet Ethereum - used for Base Sepolia
  network: 'base-sepolia',
  apiUrl: process.env.NEXT_PUBLIC_BITGO_API_URL || 'https://app.bitgo-test.com/api/v2',
  env: process.env.NEXT_PUBLIC_BITGO_ENV || 'test',
};

/**
 * Common Token Addresses on Base Sepolia
 */
export const BASE_SEPOLIA_TOKENS = {
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Example - update with actual
  WETH: '0x4200000000000000000000000000000000000006',
  DAI: '0x...',  // Add actual Base Sepolia DAI address
};

/**
 * Gas Configuration
 */
export const GAS_CONFIG = {
  gasLimit: {
    simple: '21000',
    erc20Transfer: '65000',
    swap: '250000',
  },
  maxFeePerGas: '20000000000', // 20 gwei
  maxPriorityFeePerGas: '2000000000', // 2 gwei
};
