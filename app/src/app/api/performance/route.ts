import { NextRequest, NextResponse } from 'next/server'
import { getPerformanceReport } from '@/lib/performance'

export async function GET(request: NextRequest) {
  try {
    // Check for admin permissions (simplified for MVP)
    const authHeader = request.headers.get('authorization')

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const performanceData = getPerformanceReport()

    return NextResponse.json({
      success: true,
      data: performanceData
    })

  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}