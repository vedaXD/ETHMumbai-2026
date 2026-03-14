// Core types for the Crypto-to-INR Payment Platform

export enum TransactionFlow {
  CRYPTO_TO_INR = 'CRYPTO_TO_INR',
  FOREX_TO_INR = 'FOREX_TO_INR'
}

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  CONVERTING_TO_STABLE = 'CONVERTING_TO_STABLE',
  OFFRAMPING = 'OFFRAMPING',
  PROCESSING_UPI = 'PROCESSING_UPI',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  email: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  walletAddress?: string;
  ensName?: string;
  selfId?: string; // self.xyz identity
}

export interface Transaction {
  id: string;
  userId: string;
  flow: TransactionFlow;
  status: TransactionStatus;

  // Input
  inputAmount: number;
  inputCurrency: string; // BTC, ETH, USD, EUR, etc.

  // Intermediate (Stablecoin)
  stablecoinAmount: number;
  stablecoinType: string; // USDC, USDT, etc.

  // Output
  inrAmount: number;

  // Recipient
  recipientUpiId: string;
  recipientName?: string;

  // Metadata
  conversionRate: number;
  fees: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  txHash?: string; // Blockchain transaction hash

  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: string; // e.g., 'heyelsa_agent', 'market_avg'
}

export interface PaymentRecipient {
  name: string;
  upiId: string;
  verified: boolean;
}

export interface HeyelsaOptimization {
  suggestedRoute: string[];
  estimatedFees: number;
  estimatedTime: number; // in seconds
  confidence: number; // 0-1
  reasoning: string;
}

export interface IPFSMetadata {
  cid: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}
