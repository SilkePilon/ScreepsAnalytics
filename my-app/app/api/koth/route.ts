import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || !settings.apiUrl) {
      return NextResponse.json(
        { error: 'Missing required settings' },
        { status: 400 }
      )
    }

    const url = `${settings.apiUrl}/api/mod/koth/leaderboard`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch KOTH leaderboard: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('KOTH API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch KOTH leaderboard' },
      { status: 500 }
    )
  }
}
