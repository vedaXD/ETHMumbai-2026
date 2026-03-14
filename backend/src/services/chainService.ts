/**
 * chainService.ts — On-chain swap execution on Base Sepolia testnet
 *
 * Uses viem to:
 *  1. Approve token spending
 *  2. Execute Uniswap V3 exactInputSingle swap
 *  3. Return the on-chain txHash
 *
 * MAINNET ADDRESSES are hardcoded below (commented) — DO NOT use on mainnet
 * without authorization and a funded execution wallet.
 *
 * Run `npm install viem` in backend/ before starting.
 */

// Graceful import — engine still works if viem not installed yet
let createWalletClient: any, createPublicClient: any, http: any,
  parseUnits: any, encodeFunctionData: any, defineChain: any;

try {
  const viem = require('viem');
  const viemChains = require('viem/chains');
  createWalletClient = viem.createWalletClient;
  createPublicClient = viem.createPublicClient;
  http = viem.http;
  parseUnits = viem.parseUnits;
  encodeFunctionData = viem.encodeFunctionData;
  defineChain = viem.defineChain;
} catch {
  console.warn('[ChainService] viem not installed — on-chain execution disabled. Run: npm install viem');
}

// ─── Chain definitions ────────────────────────────────────────────────────────

const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

const baseSepolia = createWalletClient ? defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [BASE_SEPOLIA_RPC] } },
  blockExplorers: { default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' } },
  testnet: true,
}) : null;

// ─── Token addresses — Base Sepolia ──────────────────────────────────────────
const TOKENS = {
  WETH:  '0x4200000000000000000000000000000000000006' as `0x${string}`, // Base Sepolia WETH
  USDC:  '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`, // Circle test USDC (Base Sepolia)
};

// Uniswap V3 on Base Sepolia
const SWAP_ROUTER = '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4' as `0x${string}`;

/*
 * MAINNET (Base mainnet — hardcoded reference only, DO NOT enable):
 *   WETH:        0x4200000000000000000000000000000000000006
 *   USDC:        0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 *   SwapRouter02: 0x2626664c2603336E57B271c5C0b26F421741e481
 */

// ─── ABIs (minimal) ──────────────────────────────────────────────────────────

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

const SWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMinimum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

// ─── Execution helpers ────────────────────────────────────────────────────────

function makeClients(privateKey: `0x${string}`) {
  if (!createWalletClient) throw new Error('viem not installed');
  const { privateKeyToAccount } = require('viem/accounts');
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(BASE_SEPOLIA_RPC) });
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(BASE_SEPOLIA_RPC) });
  return { account, walletClient, publicClient };
}

export interface SwapResult {
  txHash: string;
  status: 'success' | 'simulated' | 'failed';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  chain: string;
  explorerUrl: string;
}

/**
 * Execute a Uniswap V3 exactInputSingle swap on Base Sepolia.
 * If AGENT_PRIVATE_KEY is not set, falls back to simulation mode.
 */
export async function executeSwap(
  action: 'BUY' | 'SELL',
  amountUSD: number,
  ethPrice: number,
  feeTier: '500' | '3000' | '10000' = '3000'  // 0.05%, 0.3%, 1%
): Promise<SwapResult> {
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined;

  if (!privateKey || !createWalletClient) {
    console.log(`[ChainService] 🔵 SIMULATED ${action} $${amountUSD} — set AGENT_PRIVATE_KEY to go live`);
    return simulatedSwap(action, amountUSD, ethPrice);
  }

  try {
    const { account, walletClient, publicClient } = makeClients(privateKey);
    const isBuy = action === 'BUY'; // BUY = swap USDC → WETH

    const tokenIn  = isBuy ? TOKENS.USDC  : TOKENS.WETH;
    const tokenOut = isBuy ? TOKENS.WETH  : TOKENS.USDC;
    const usdcDecimals = 6;
    const wethDecimals = 18;
    const amountIn = isBuy
      ? parseUnits(amountUSD.toFixed(6), usdcDecimals)       // USDC has 6 decimals
      : parseUnits((amountUSD / ethPrice).toFixed(18), wethDecimals); // ETH amount

    console.log(`[ChainService] Preparing ${action}: ${amountIn} ${isBuy ? 'USDC' : 'WETH'} on Base Sepolia`);

    // Step 1: Check/set approval
    const currentAllowance = await publicClient.readContract({
      address: tokenIn,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account.address, SWAP_ROUTER],
    });

    if (currentAllowance < amountIn) {
      console.log(`[ChainService] Approving ${tokenIn} for Uniswap router...`);
      const approveTx = await walletClient.writeContract({
        address: tokenIn,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SWAP_ROUTER, amountIn * 10n], // approve 10x to reduce future gas
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      console.log(`[ChainService] ✅ Approval tx: ${approveTx}`);
    }

    // Step 2: Execute swap
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 min deadline
    const swapTx = await walletClient.writeContract({
      address: SWAP_ROUTER,
      abi: SWAP_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn,
        tokenOut,
        fee: parseInt(feeTier),
        recipient: account.address,
        deadline,
        amountIn,
        amountOutMinimum: 0n, // For testnet — production should set proper slippage
        sqrtPriceLimitX96: 0n,
      }],
    });

    console.log(`[ChainService] ✅ Swap submitted: ${swapTx}`);

    return {
      txHash: swapTx,
      status: 'success',
      tokenIn: isBuy ? 'USDC' : 'WETH',
      tokenOut: isBuy ? 'WETH' : 'USDC',
      amountIn: isBuy ? `$${amountUSD}` : `${(amountUSD / ethPrice).toFixed(6)} ETH`,
      chain: 'Base Sepolia',
      explorerUrl: `https://sepolia.basescan.org/tx/${swapTx}`,
    };

  } catch (err: any) {
    console.error('[ChainService] Swap failed:', err.message);
    return simulatedSwap(action, amountUSD, ethPrice, 'failed');
  }
}

function simulatedSwap(
  action: 'BUY' | 'SELL',
  amountUSD: number,
  ethPrice: number,
  status: 'simulated' | 'failed' = 'simulated'
): SwapResult {
  const fakeTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const isBuy = action === 'BUY';
  return {
    txHash: fakeTx,
    status,
    tokenIn: isBuy ? 'USDC' : 'WETH',
    tokenOut: isBuy ? 'WETH' : 'USDC',
    amountIn: isBuy ? `$${amountUSD}` : `${(amountUSD / ethPrice).toFixed(6)} ETH`,
    chain: 'Base Sepolia (simulated)',
    explorerUrl: `https://sepolia.basescan.org/tx/${fakeTx}`,
  };
}
