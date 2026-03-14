import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 })
    }

    console.log(`[ENS Reverse Mock] Looking up ${address}`)
    
    // For demo purposes, assign a random claw2claw subdomain
    const randomName = `bot-${address.substring(2, 6)}.claw2claw.eth`

    return NextResponse.json({
      success: true,
      name: randomName,
    })

  } catch (error) {
    console.error('Failed to perform reverse ENS lookup:', error)
    return NextResponse.json(
      { error: 'Failed to perform reverse lookup' },
      { status: 500 }
    )
  }
}
