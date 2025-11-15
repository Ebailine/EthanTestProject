import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 1 minute max (just for webhook trigger)

/**
 * GET /api/outreach?batchId=xxx
 * Check status of an outreach batch
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const batchId = searchParams.get('batchId')

    if (!batchId) {
      return NextResponse.json({ success: false, error: 'Batch ID is required' }, { status: 400 })
    }

    const batch = await prisma.outreachBatch.findUnique({
      where: { id: batchId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        _count: {
          select: {
            contacts: true,
            emails: true,
          },
        },
      },
    })

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        status: batch.status,
        currentStep: batch.currentStep,
        progress: batch.progress,
        totalContactsFound: batch.totalContactsFound,
        totalEmailsDrafted: batch.totalEmailsDrafted,
        contactsCount: batch._count.contacts,
        emailsCount: batch._count.emails,
        startedAt: batch.startedAt,
        completedAt: batch.completedAt,
        errorMessage: batch.errorMessage,
      },
    })
  } catch (error: any) {
    console.error('❌ Get batch status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get batch status',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/outreach
 * Trigger n8n workflow for automated outreach
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 })
    }

    // Validate n8n webhook URL is configured
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'N8N_WEBHOOK_URL not configured in environment variables',
        },
        { status: 500 }
      )
    }

    // Validate job exists and fetch details
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

    console.log(`🚀 Triggering n8n outreach for: ${job.title} at ${job.company.name}`)

    // Create outreach batch record first
    const batch = await prisma.outreachBatch.create({
      data: {
        jobId: job.id,
        companyId: job.company.id,
        status: 'pending',
        currentStep: 'Initializing n8n workflow...',
        progress: 0,
        startedAt: new Date(),
      },
    })

    console.log(`📦 Created batch: ${batch.id}`)

    // Prepare payload for n8n webhook
    const n8nPayload = {
      batchId: batch.id,
      jobId: job.id,
      companyName: job.company.name,
      companyDomain: job.company.domain || job.company.website || '',
      jobTitle: job.title,
      jobDescription: job.description || '',
      maxContacts: 5,
    }

    console.log(`📤 Calling n8n webhook:`, webhookUrl)

    // Call n8n webhook
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error(`❌ n8n webhook failed:`, n8nResponse.status, errorText)

      // Mark batch as failed
      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: {
          status: 'failed',
          errorMessage: `n8n webhook error: ${n8nResponse.status} - ${errorText}`,
          errorStep: 'webhook_trigger',
          completedAt: new Date(),
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: `n8n webhook returned ${n8nResponse.status}`,
          details: errorText,
        },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()
    console.log(`✅ n8n webhook triggered successfully:`, n8nResult)

    // Update batch to processing
    await prisma.outreachBatch.update({
      where: { id: batch.id },
      data: {
        status: 'processing',
        currentStep: 'n8n workflow running...',
        progress: 5,
      },
    })

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      message: 'n8n workflow triggered successfully',
      n8nResponse: n8nResult,
    })
  } catch (error: any) {
    console.error('❌ Trigger outreach error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to trigger outreach',
      },
      { status: 500 }
    )
  }
}
