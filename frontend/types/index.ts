// Core types for the OctoHive Platform

export interface User {
  id: string;
  email: string;
  walletAddress?: string;
  ensName?: string;
}

export interface IPFSMetadata {
  cid: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  personality: string;
  budget?: number;
  walletAddress?: string;
  ensName?: string;
  // ENS Rich Profile fields
  tagline?: string;
  avatar?: string;
  allowedCryptos?: string[];
  tradeHistory?: any[];
  [key: string]: any;
}

export interface HeyelsaOptimization {
  suggestedRoute: string[];
  estimatedFees: number;
  estimatedTime: number; // in seconds
  confidence: number; // 0-1
  reasoning: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
