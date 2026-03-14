import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { ensName } = await request.json()

    if (!ensName) {
      return NextResponse.json({ error: 'ensName is required' }, { status: 400 })
    }

    // Mock response for the hackathon MVP to avoid viem/wagmi dependencies
    console.log(`[ENS Resolution Mock] Resolving ${ensName}`)
    
    // Simulate a successful resolution for any .hey-anna.eth subdomain
    // In a real implementation, this would use the ENS Public Resolver on Sepolia
    return NextResponse.json({
      success: true,
      address: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      name: ensName,
      textRecords: {
        strategy: 'Aggressive APY farming',
        risk: 'High',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + ensName
      }
    })

  } catch (error) {
    console.error('Failed to resolve ENS name:', error)
    return NextResponse.json(
      { error: 'Failed to resolve ENS name' },
      { status: 500 }
    )
  }
}
