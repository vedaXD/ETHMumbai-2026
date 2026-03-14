import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ botAddress: string }> }) {
  const { botAddress } = await context.params;
  
  if (!botAddress) {
    return NextResponse.json({ error: 'botAddress is required' }, { status: 400 })
  }

  // Mock response for hackathon UI visualization
  return NextResponse.json({
    deals: [
      {
        id: 'deal-1',
        type: 'buy',
        asset: 'WETH',
        amount: '0.5',
        priceUSD: '3200',
        totalUSD: '1600',
        timestamp: new Date().toISOString(),
        counterparty: '0x1A2b...3C4D'
      },
      {
        id: 'deal-2',
        type: 'sell',
        asset: 'USDC',
        amount: '1000',
        priceUSD: '1.00',
        totalUSD: '1000',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        counterparty: '0xDeF1...aBc2'
      }
    ]
  })
}
