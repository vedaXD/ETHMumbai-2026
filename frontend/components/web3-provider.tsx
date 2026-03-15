'use client'

import { type ReactNode, useState } from 'react'
import { WagmiProvider, createConfig, http, fallback } from 'wagmi'
import { sepolia, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/lib/WalletContext'

const config = createConfig({
  chains: [sepolia, baseSepolia],
  transports: {
    // Redundant RPCs for Ethereum Sepolia (ENS Resolution)
    [sepolia.id]: fallback([
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://rpc.sepolia.org'),
      http('https://1rpc.io/sepolia'),
    ]),
    // Redundant RPCs for Base Sepolia (Agent Transactions)
    [baseSepolia.id]: fallback([
      http('https://sepolia.base.org'),
      http('https://rpc.ankr.com/base_sepolia'),
      http('https://base-sepolia-rpc.publicnode.com'),
    ]),
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
