import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { Job, SearchFilters } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters }: { query?: string; filters?: SearchFilters } = body

    // Validate input
    if (query && typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameter' },
        { status: 400 }
      )
    }

    if (filters && typeof filters !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid filters parameter' },
        { status: 400 }
      )
    }

    // Build the search query
    const where: any = {
      status: 'active',
      AND: [],
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } },
      ]
    }

    if (filters?.function && filters.function.length > 0) {
      where.AND.push({
        function: { in: filters.function }
      })
    }

    if (filters?.majorTags && filters.majorTags.length > 0) {
      where.AND.push({
        majorTags: { hasSome: filters.majorTags }
      })
    }

    if (filters?.location) {
      where.AND.push({
        location: { contains: filters.location, mode: 'insensitive' }
      })
    }

    if (filters?.remoteFlag !== undefined) {
      where.AND.push({
        remoteFlag: filters.remoteFlag
      })
    }

    if (filters?.paidFlag !== undefined) {
      where.AND.push({
        paidFlag: filters.paidFlag
      })
    }

    if (filters?.internshipType && filters.internshipType.length > 0) {
      where.AND.push({
        internshipType: { in: filters.internshipType }
      })
    }

    // Execute the query
    const jobs = await prisma.job.findMany({
      where: where.AND.length > 0 ? where : { status: 'active' },
      include: {
        company: true
      },
      orderBy: [
        { postedAt: 'desc' },
        { lastVerifiedAt: 'desc' }
      ],
      take: 50, // Limit results for MVP
    })

    return NextResponse.json({
      success: true,
      jobs: jobs,
      total: jobs.length,
      page: 1,
      limit: 50,
    })

  } catch (error) {
    console.error('Error searching jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search jobs' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'active' },
      include: {
        company: true
      },
      orderBy: [
        { postedAt: 'desc' },
        { lastVerifiedAt: 'desc' }
      ],
      take: 20,
    })

    return NextResponse.json({
      success: true,
      jobs: jobs,
      total: jobs.length,
    })

  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}