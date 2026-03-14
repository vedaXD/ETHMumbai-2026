import { NextRequest, NextResponse } from 'next/server';
import { BitGoServerService } from '@/lib/bitgo/server';

/**
 * POST /api/bitgo/transactions
 * Execute a transaction (trade)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletId, tradeIntent } = body;

    if (!walletId || !tradeIntent) {
      return NextResponse.json(
        { error: 'walletId and tradeIntent are required' },
        { status: 400 }
      );
    }

    const result = await BitGoServerService.signAndBroadcastTrade(
      walletId,
      tradeIntent
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Execute transaction API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute transaction' },
      { status: 500 }
    );
  }
}
