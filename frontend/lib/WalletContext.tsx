'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BitGoService } from '@/lib/bitgo';

export interface UserBitGoVault {
  walletId: string;
  address: string;
}

interface WalletContextType {
  address: string | null;
  connecting: boolean;
  connectStep: string;          // live status during connect flow
  userVault: UserBitGoVault | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connecting: false,
  connectStep: '',
  userVault: null,
  connect: async () => {},
  disconnect: () => {},
});

const VAULT_KEY = 'heyanna_user_vault';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState('');
  const [userVault, setUserVault] = useState<UserBitGoVault | null>(null);

  // Restore persisted vault on mount
  useEffect(() => {
    const saved = localStorage.getItem(VAULT_KEY);
    if (saved) setUserVault(JSON.parse(saved));

    // Also restore address if MetaMask still connected
    const eth = (window as any).ethereum;
    if (eth) {
      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts[0]) setAddress(accounts[0]);
      });
      eth.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts[0] || null);
        if (!accounts[0]) {
          setUserVault(null);
          localStorage.removeItem(VAULT_KEY);
        }
      });
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (typeof window === 'undefined' || !eth) {
      alert('Please install MetaMask or another Web3 wallet to continue.');
      return;
    }
    setConnecting(true);
    try {
      // Step 1 — MetaMask connect
      setConnectStep('Connecting MetaMask...');
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      if (!userAddress) return;
      setAddress(userAddress);

      // Step 2 — Switch to Base Sepolia
      setConnectStep('Switching to Base Sepolia...');
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14A34' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14A34',
              chainName: 'Base Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
        }
      }

      // Step 3 — Create BitGo vault (skip if already exists for this address)
      const existingVault = localStorage.getItem(VAULT_KEY);
      if (!existingVault) {
        setConnectStep('Creating your BitGo vault on Base Sepolia...');
        try {
          const vault = await BitGoService.createAgentWallet(
            `user_${userAddress.slice(2, 10)}`,
            `UserVault_${userAddress.slice(0, 8)}`,
            10000,
          );
          const vaultData: UserBitGoVault = { walletId: vault.walletId, address: vault.address };
          setUserVault(vaultData);
          localStorage.setItem(VAULT_KEY, JSON.stringify(vaultData));
        } catch (vaultErr: any) {
          // Non-fatal — user can still use the app
          console.warn('BitGo vault creation failed:', vaultErr.message);
        }
      } else {
        setUserVault(JSON.parse(existingVault));
      }

    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setConnecting(false);
      setConnectStep('');
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setUserVault(null);
    localStorage.removeItem(VAULT_KEY);
  }, []);

  return (
    <WalletContext.Provider value={{ address, connecting, connectStep, userVault, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
