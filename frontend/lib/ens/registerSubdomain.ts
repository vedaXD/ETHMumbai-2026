/**
 * Real on-chain ENS subdomain registration.
 * Registers agentLabel.parentEnsName (e.g. mybot.xoham.eth) on Sepolia
 * and points it to the agent's BitGo wallet address.
 *
 * Requires two MetaMask transactions:
 *   1. ENS Registry.setSubnodeRecord — creates the subdomain
 *   2. Public Resolver.setAddr — points subdomain → BitGo wallet address
 */
import { namehash, labelhash } from 'viem/ens'
import { encodeFunctionData } from 'viem'

// Same address on all networks (mainnet, sepolia, etc.)
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const
// ENS Public Resolver on Sepolia
const PUBLIC_RESOLVER = '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD' as const

const setSubnodeRecordAbi = [
  {
    name: 'setSubnodeRecord',
    type: 'function' as const,
    inputs: [
      { name: 'node',     type: 'bytes32' },
      { name: 'label',    type: 'bytes32' },
      { name: 'owner',    type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'ttl',      type: 'uint64'  },
    ],
    outputs: [],
    stateMutability: 'nonpayable' as const,
  },
]

const setAddrAbi = [
  {
    name: 'setAddr',
    type: 'function' as const,
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'addr', type: 'address'  },
    ],
    outputs: [],
    stateMutability: 'nonpayable' as const,
  },
]

export interface SubdomainResult {
  ensName: string
  txHash1: string
  txHash2: string
}

/**
 * Register agentLabel.parentEnsName and point it to agentAddress.
 * @param parentEnsName  e.g. "xoham.eth"
 * @param agentLabel     e.g. "mybot" (no dots)
 * @param ownerAddress   user's connected wallet (must own parentEnsName)
 * @param agentAddress   BitGo wallet address to set as the addr record
 */
export async function registerAgentSubdomain(
  parentEnsName: string,
  agentLabel: string,
  ownerAddress: string,
  agentAddress: string,
): Promise<SubdomainResult> {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('No Web3 wallet found')

  const parentNode = namehash(parentEnsName)
  const label = labelhash(agentLabel)
  const subdomainNode = namehash(`${agentLabel}.${parentEnsName}`)

  // --- Tx 1: Create the subdomain in ENS Registry ---
  const registryData = encodeFunctionData({
    abi: setSubnodeRecordAbi,
    functionName: 'setSubnodeRecord',
    args: [
      parentNode,
      label,
      ownerAddress as `0x${string}`,
      PUBLIC_RESOLVER,
      BigInt(0),
    ],
  })

  const txHash1: string = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [{ from: ownerAddress, to: ENS_REGISTRY, data: registryData }],
  })

  // Wait for Tx 1 to be mined before setting the addr record
  await waitForReceipt(txHash1)

  // --- Tx 2: Set addr record → BitGo wallet address ---
  const resolverData = encodeFunctionData({
    abi: setAddrAbi,
    functionName: 'setAddr',
    args: [subdomainNode, agentAddress as `0x${string}`],
  })

  const txHash2: string = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [{ from: ownerAddress, to: PUBLIC_RESOLVER, data: resolverData }],
  })

  return {
    ensName: `${agentLabel}.${parentEnsName}`,
    txHash1,
    txHash2,
  }
}

/** Poll for a transaction receipt (max ~60s) */
async function waitForReceipt(txHash: string, maxAttempts = 30): Promise<void> {
  const ethereum = (window as any).ethereum
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })
    if (receipt) return
    await new Promise(r => setTimeout(r, 2000))
  }
  // Don't throw — if tx is slow just continue anyway
}
