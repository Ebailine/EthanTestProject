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
    })

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    }

    // Fetch company data separately
    const company = job.companyId
      ? await prisma.company.findUnique({ where: { id: job.companyId } })
      : null

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company data missing for this job' },
        { status: 400 }
      )
    }

    console.log(`🚀 Launching outreach for job: ${job.title} at ${company.name}`)

    // Create outreach batch
    const batch = await prisma.outreachBatch.create({
      data: {
        jobId,
        companyId: company.id,
        status: 'pending',
        currentStep: 'Initializing...',
        progress: 0,
        startedAt: new Date(),
      },
    })

    // Trigger n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.warn('⚠️ N8N_WEBHOOK_URL not configured, running local orchestration')

      // Fallback to local orchestration if n8n not configured
      const result = await outreachOrchestrator.executeOutreachFlow({
        jobId,
        userId: undefined,
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
        message: 'Outreach initiated successfully (local)',
      })
    }

    // Trigger n8n workflow
    try {
      console.log(`🔔 Triggering n8n workflow: ${n8nWebhookUrl}`)

      const webhookPayload = {
        batchId: batch.id,
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description,
        companyId: company.id,
        companyName: company.name,
        companyDomain: company.domain,
        companyWebsite: company.websiteUrl,
        maxContacts: 5,
      }

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`)
      }

      console.log('✅ n8n workflow triggered successfully')

      return NextResponse.json({
        success: true,
        batchId: batch.id,
        message: 'Outreach initiated via n8n workflow',
      })
    } catch (error: any) {
      console.error('❌ n8n webhook error:', error)

      // Update batch with error
      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: {
          status: 'failed',
          errorMessage: `Failed to trigger n8n workflow: ${error.message}`,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: `Failed to trigger n8n workflow: ${error.message}`,
        },
        { status: 500 }
      )
    }
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
