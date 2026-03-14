import { NextRequest, NextResponse } from 'next/server';
import { BitGoServerService } from '@/lib/bitgo/server';

/**
 * GET /api/bitgo/wallets/[walletId]/transactions
 * Get transaction history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { walletId: string } }
) {
  try {
    const walletId = params.walletId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!walletId) {
      return NextResponse.json(
        { error: 'walletId is required' },
        { status: 400 }
      );
    }

    const history = await BitGoServerService.getTransactionHistory(walletId, limit);

    return NextResponse.json({ success: true, ...history });
  } catch (error: any) {
    console.error('Get transactions API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
