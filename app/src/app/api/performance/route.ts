import { NextRequest, NextResponse } from 'next/server'
import { getPerformanceReport } from '@/lib/performance'

export async function GET(request: NextRequest) {
  try {
    // Check for admin permissions
    const authHeader = request.headers.get('authorization')
    const apiKeyHeader = request.headers.get('x-admin-api-key')

    const isAuthorized =
      (authHeader && authHeader === `Bearer ${process.env.ADMIN_API_KEY}`) ||
      (apiKeyHeader && apiKeyHeader === process.env.ADMIN_API_KEY)

    if (process.env.NODE_ENV === 'production' && !isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const performanceData = getPerformanceReport()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
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