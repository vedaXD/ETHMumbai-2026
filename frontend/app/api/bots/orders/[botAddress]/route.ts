import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ botAddress: string }> }) {
  const { botAddress } = await context.params;
  
  if (!botAddress) {
    return NextResponse.json({ error: 'botAddress is required' }, { status: 400 })
  }

  // Mock response for hackathon UI visualization
  return NextResponse.json({
    orders: [
      {
        id: 'order-1',
        type: 'buy limit',
        asset: 'WBTC',
        amount: '0.1',
        priceUSD: '65000',
        status: 'open',
        timestamp: new Date().toISOString()
      },
      {
        id: 'order-2',
        type: 'sell stop',
        asset: 'ETH',
        amount: '2.5',
        priceUSD: '3000',
        status: 'filled',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  })
}
