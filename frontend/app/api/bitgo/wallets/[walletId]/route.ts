import { NextRequest, NextResponse } from 'next/server';
import { BitGoServerService } from '@/lib/bitgo/server';

/**
 * GET /api/bitgo/wallets/[walletId]
 * Get wallet details including balance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletId: string }> }
) {
  try {
    const { walletId } = await params;

    if (!walletId) {
      return NextResponse.json(
        { error: 'walletId is required' },
        { status: 400 }
      );
    }

    const details = await BitGoServerService.getWalletDetails(walletId);

    return NextResponse.json({ success: true, wallet: details });
  } catch (error: any) {
    console.error('Get wallet API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wallet' },
      { status: 500 }
    );
  }
}
