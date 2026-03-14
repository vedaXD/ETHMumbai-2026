'use client'

import { type ReactNode, useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/lib/WalletContext'

const config = createConfig({
  chains: [sepolia],
  transports: {
    // Same RPC used in NoCap-Lottery where ENS works
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
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
