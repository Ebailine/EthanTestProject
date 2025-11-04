import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { TypesenseService } from '@/lib/typesense'
import { auth } from '@clerk/nextjs'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin (simplified for MVP)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { clerkId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // In production, you'd check admin role here
    // For MVP, allow any authenticated user to trigger reindex

    const typesenseService = new TypesenseService()

    // Initialize collection if not exists
    await typesenseService.initializeCollection()

    // Fetch all active jobs
    const jobs = await prisma.job.findMany({
      where: { status: 'active' },
      include: {
        company: {
          select: {
            name: true,
            domain: true,
            website: true,
            industryTags: true,
            sizeBand: true
          }
        }
      },
      orderBy: { postedAt: 'desc' },
      take: 10000 // Limit to prevent overload
    })

    // Index jobs in Typesense
    const indexResult = await typesenseService.indexJobs(jobs)

    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${indexResult.indexed} jobs`,
      stats: {
        totalJobs: jobs.length,
        indexedJobs: indexResult.indexed,
        errors: jobs.length - indexResult.indexed,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error reindexing jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reindex jobs' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const typesenseService = new TypesenseService()
    const stats = await typesenseService.getCollectionStats()

    return NextResponse.json({
      success: true,
      stats,
      message: 'Search index statistics retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching search stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search statistics' },
      { status: 500 }
    )
  }
}