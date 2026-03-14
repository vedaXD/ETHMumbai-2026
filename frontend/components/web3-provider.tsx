'use client'

import { type ReactNode, useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/lib/WalletContext'

const config = createConfig({
  chains: [sepolia],
  transports: {
    // Use a reliable public RPC so ENS name lookups work
    [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia'),
  },
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
