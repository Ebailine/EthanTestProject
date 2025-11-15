import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: batchId } = params

    // Fetch batch
    const batch = await prisma.outreachBatch.findUnique({
      where: { id: batchId },
    })

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Outreach batch not found' }, { status: 404 })
    }

    // Fetch related data manually
    const job = batch.jobId
      ? await prisma.job.findUnique({ where: { id: batch.jobId } })
      : null

    const company = job?.companyId
      ? await prisma.company.findUnique({ where: { id: job.companyId } })
      : null

    const contacts = await prisma.contact.findMany({
      where: { batchId },
      orderBy: { createdAt: 'asc' },
    })

    const emails = await prisma.outreachEmail.findMany({
      where: { batchId },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate derived data
    const isComplete = batch.status === 'completed' || batch.status === 'failed'
    const hasContacts = contacts.length > 0
    const hasEmails = emails.length > 0

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        status: batch.status,
        currentStep: batch.currentStep,
        progress: batch.progress,
        isComplete,

        // Timestamps
        startedAt: batch.startedAt,
        completedAt: batch.completedAt,
        duration:
          batch.completedAt && batch.startedAt
            ? Math.round((batch.completedAt.getTime() - batch.startedAt.getTime()) / 1000)
            : null,

        // Counts
        totalContactsFound: batch.totalContactsFound,
        totalEmailsDrafted: batch.totalEmailsDrafted,

        // Error info
        errorMessage: batch.errorMessage,

        // Job details
        job: job && company ? {
          id: job.id,
          title: job.title,
          company: {
            name: company.name,
            logo: company.websiteUrl,
          },
        } : null,

        // Contacts with emails
        results: contacts.map((contact) => {
          const email = emails.find((e) => e.contactId === contact.id)

          return {
            contact: {
              id: contact.id,
              fullName: contact.fullName,
              title: contact.title,
              email: contact.email,
              emailConfidence: contact.emailConfidence ? Number(contact.emailConfidence) : null,
              linkedinUrl: contact.linkedinUrl,
              photoUrl: contact.photoUrl,
              headline: contact.headline,
              location: contact.location,
              researchSummary: contact.researchSummary,
            },
            email: email
              ? {
                  id: email.id,
                  subject: email.subject,
                  body: email.body,
                  personalizations: email.personalizations,
                  status: email.status,
                }
              : null,
          }
        }),
      },
    })
  } catch (error: any) {
    console.error('❌ Status fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch outreach status',
      },
      { status: 500 }
    )
  }
}
