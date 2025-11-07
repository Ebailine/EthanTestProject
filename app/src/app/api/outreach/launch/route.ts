import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { outreachOrchestrator } from '@/lib/services/outreach-orchestrator'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max execution

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 })
    }

    // Validate job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    })

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    }

    if (!job.company) {
      return NextResponse.json(
        { success: false, error: 'Company data missing for this job' },
        { status: 400 }
      )
    }

    console.log(`🚀 Launching outreach for job: ${job.title} at ${job.company.name}`)

    // Start orchestration (runs async)
    const result = await outreachOrchestrator.executeOutreachFlow({
      jobId,
      userId: undefined, // TODO: Get from auth when enabled
      maxContacts: 5,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.errorMessage,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      message: 'Outreach initiated successfully',
    })
  } catch (error: any) {
    console.error('❌ Launch outreach error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to launch outreach',
      },
      { status: 500 }
    )
  }
}
