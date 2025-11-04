import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { auth } from '@clerk/nextjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: {
          include: {
            sources: {
              orderBy: { fetchedAt: 'desc' },
              take: 5,
            },
            moments: {
              orderBy: { confidence: 'desc' },
              take: 10,
            },
            contacts: {
              where: { emailConfidence: { gte: 0.7 } },
              orderBy: { emailConfidence: 'desc' },
              take: 15,
            },
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Calculate research quality score
    const researchQuality = calculateResearchQuality(job.company.moments || [])

    // Determine if job has sufficient research and contacts
    const hasResearch = researchQuality >= 50
    const hasContacts = (job.company.contacts || []).length >= 3

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        hasResearch,
        hasContacts,
        researchQuality,
        contactCount: job.company.contacts?.length || 0,
        momentCount: job.company.moments?.length || 0,
        sourceCount: job.company.sources?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching job details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job details' },
      { status: 500 }
    )
  }
}

function calculateResearchQuality(moments: any[]): number {
  if (moments.length === 0) return 0

  // Calculate average confidence
  const avgConfidence = moments.reduce((sum, m) => sum + Number(m.confidence), 0) / moments.length

  // Calculate diversity score (different moment types)
  const uniqueLabels = new Set(moments.map(m => m.label))
  const diversityScore = uniqueLabels.size / 5 // 5 possible labels

  // Weighted score: 70% confidence, 30% diversity
  const quality = (avgConfidence * 0.7 + diversityScore * 0.3) * 100

  return Math.min(Math.round(quality), 100)
}