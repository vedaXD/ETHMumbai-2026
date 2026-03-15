/**
 * Mocked Wagmi Configuration for OctoHive due to environment constraints.
 * We'll use ethers providers directly or mock connections where needed.
 */
const IS_MAINNET = process.env.NEXT_PUBLIC_ENS_MAINNET === 'true'

export const ensChainId = IS_MAINNET ? 1 : 11155111

export const wagmiConfig = {
  chains: [{ id: 11155111 }, { id: 1 }],
  transports: {},
  ssr: true,
} as any
