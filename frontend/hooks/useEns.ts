import { useEnsName, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { sepolia } from 'wagmi/chains';

export function useEns(address?: string | null) {
  const isValidAddress = !!(address && address.startsWith('0x') && address.length === 42);

  const { data: ensName, isLoading: isLoadingName } = useEnsName({
    address: isValidAddress ? (address as `0x${string}`) : undefined,
    chainId: sepolia.id,
    query: { enabled: isValidAddress },
  });

  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: sepolia.id,
    query: { enabled: !!ensName },
  });

  const formatAddress = (addr?: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const displayName = ensName || formatAddress(address);

  return {
    ensName,
    ensAvatar,
    displayName,
    hasEnsName: !!ensName,
    isLoading: isLoadingName || isLoadingAvatar,
    formattedAddress: formatAddress(address),
  };
}

export function useUserEns(address?: string | null) {
  const ens = useEns(address);
  return {
    ...ens,
    hasEns: !!ens.ensName,
    isPremiumUser: !!ens.ensName,
  };
}
