// Base Network Integration

import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

/**
 * Base Network Configuration and Utilities
 * Handles blockchain interactions on Base L2
 */

export const basePublicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
});

export const getWalletClient = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }

  return createWalletClient({
    chain: base,
    transport: custom(window.ethereum),
  });
};

export class BaseService {
  async getBalance(address: string) {
    const balance = await basePublicClient.getBalance({
      address: address as `0x${string}`,
    });
    return balance;
  }

  async getTransaction(hash: string) {
    const transaction = await basePublicClient.getTransaction({
      hash: hash as `0x${string}`,
    });
    return transaction;
  }

  async waitForTransaction(hash: string) {
    const receipt = await basePublicClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });
    return receipt;
  }

  // TODO: Add stablecoin contract interactions
  // TODO: Add swap functionality
}

export const baseService = new BaseService();
