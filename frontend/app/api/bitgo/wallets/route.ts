import { NextRequest, NextResponse } from 'next/server';
import { BitGoServerService } from '@/lib/bitgo/server';

/**
 * POST /api/bitgo/wallets
 * Create a new BitGo wallet for an agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, agentName, maxSpendLimit } = body;

    if (!agentId || !agentName) {
      return NextResponse.json(
        { error: 'agentId and agentName are required' },
        { status: 400 }
      );
    }

    const wallet = await BitGoServerService.createAgentWallet(
      agentId,
      agentName,
      maxSpendLimit || 100
    );

    return NextResponse.json({ success: true, wallet });
  } catch (error: any) {
    console.error('Wallet creation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet' },
      { status: 500 }
    );
  }
}
