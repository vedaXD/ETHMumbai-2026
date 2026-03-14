import { NextRequest, NextResponse } from 'next/server';
import { BitGoServerService } from '@/lib/bitgo/server';

/**
 * GET /api/bitgo/wallets/[walletId]/balance
 * Get wallet balance
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

    const balance = await BitGoServerService.getWalletBalance(walletId);

    return NextResponse.json({ success: true, balance });
  } catch (error: any) {
    console.error('Get balance API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get balance' },
      { status: 500 }
    );
  }
}
