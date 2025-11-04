import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'

const launchSchema = z.object({
  jobId: z.string().uuid(),
  studentProfile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    school: z.string().min(1, 'School is required'),
    major: z.string().min(1, 'Major is required'),
    gradDate: z.string().min(1, 'Graduation date is required'),
    resumeUrl: z.string().url().optional().nullable(),
    skills: z.array(z.string()).optional(),
    linkedinUrl: z.string().url().optional().nullable(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const { jobId, studentProfile } = launchSchema.parse(body)

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
            website: true,
            linkedinUrl: true
          }
        }
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get or update user profile
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: studentProfile.email,
        firstName: studentProfile.firstName,
        lastName: studentProfile.lastName,
        school: studentProfile.school,
        major: studentProfile.major,
        gradDate: new Date(studentProfile.gradDate),
        resumeUrl: studentProfile.resumeUrl,
        linkedinUrl: studentProfile.linkedinUrl,
        updatedAt: new Date(),
      },
      create: {
        clerkId: userId,
        email: studentProfile.email,
        firstName: studentProfile.firstName,
        lastName: studentProfile.lastName,
        school: studentProfile.school,
        major: studentProfile.major,
        gradDate: new Date(studentProfile.gradDate),
        resumeUrl: studentProfile.resumeUrl,
        linkedinUrl: studentProfile.linkedinUrl,
      },
    })

    // Check if user already has an outreach batch for this job
    const existingBatch = await prisma.outreachBatch.findFirst({
      where: {
        userId: user.id,
        jobId: job.id,
        companyId: job.companyId
      }
    })

    if (existingBatch) {
      return NextResponse.json({
        success: false,
        error: 'You have already launched outreach for this job',
        existingBatchId: existingBatch.id,
        status: existingBatch.status
      })
    }

    // Create outreach batch
    const batch = await prisma.outreachBatch.create({
      data: {
        userId: user.id,
        jobId: job.id,
        companyId: job.companyId,
        status: 'researching',
      },
    })

    // Prepare workflow data
    const workflowData = {
      workflowId: batch.id,
      jobId: job.id,
      companyId: job.companyId,
      studentProfile: {
        name: `${studentProfile.firstName} ${studentProfile.lastName}`,
        email: studentProfile.email,
        school: studentProfile.school,
        major: studentProfile.major,
        gradDate: studentProfile.gradDate,
        resumeUrl: studentProfile.resumeUrl,
        skills: studentProfile.skills || []
      },
      companyInfo: {
        name: job.company.name,
        domain: job.company.domain,
        website: job.company.website,
        linkedinUrl: job.company.linkedinUrl
      },
      jobInfo: {
        title: job.title,
        function: job.function,
        location: job.location,
        remoteFlag: job.remoteFlag,
        paidFlag: job.paidFlag,
        sourceUrl: job.sourceUrl,
        atsType: job.atsType
      }
    }

    // Trigger n8n research workflow
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'

      const researchResponse = await fetch(`${n8nWebhookUrl}/company-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      })

      if (!researchResponse.ok) {
        console.warn('Failed to trigger n8n workflow:', researchResponse.statusText)
        // Don't fail the request, just log the warning
      }
    } catch (error) {
      console.warn('Error triggering research workflow:', error)
      // Don't fail the request, just log the warning
    }

    return NextResponse.json({
      success: true,
      workflowId: batch.id,
      status: 'researching',
      estimatedCompletion: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes from now
      message: 'Research workflow initiated. You\'ll receive updates as we find contacts and generate emails.',
      nextSteps: [
        'Researching company information',
        'Finding verified contacts',
        'Generating personalized emails',
        'Ready for your review'
      ]
    })

  } catch (error) {
    console.error('Error launching outreach:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to launch outreach' },
      { status: 500 }
    )
  }
}