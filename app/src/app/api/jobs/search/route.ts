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

    if (filters?.location) {
      where.AND.push({
        location: { contains: filters.location, mode: 'insensitive' }
      })
    }

    // Execute the query
    const jobs = await prisma.job.findMany({
      where: where.AND.length > 0 ? where : { status: 'active' },
      orderBy: [
        { postedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50, // Limit results for MVP
    })

    // Manually fetch company data for each job
    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = job.companyId
          ? await prisma.company.findUnique({ where: { id: job.companyId } })
          : null
        return { ...job, Company: company }
      })
    )

    return NextResponse.json({
      success: true,
      jobs: jobsWithCompany,
      total: jobsWithCompany.length,
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
      orderBy: [
        { postedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20,
    })

    // Manually fetch company data for each job
    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = job.companyId
          ? await prisma.company.findUnique({ where: { id: job.companyId } })
          : null
        return { ...job, Company: company }
      })
    )

    return NextResponse.json({
      success: true,
      jobs: jobsWithCompany,
      total: jobsWithCompany.length,
    })

  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
