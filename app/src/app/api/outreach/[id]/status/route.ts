import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: batchId } = params

    // Fetch batch with all related data
    const batch = await prisma.outreachBatch.findUnique({
      where: { id: batchId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        contacts: {
          orderBy: { createdAt: 'asc' },
        },
        emails: {
          include: {
            contact: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Outreach batch not found' }, { status: 404 })
    }

    // Calculate derived data
    const isComplete = batch.status === 'completed' || batch.status === 'failed'
    const hasContacts = batch.contacts.length > 0
    const hasEmails = batch.emails.length > 0

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
        totalContactsEnriched: batch.totalContactsEnriched,
        totalEmailsDrafted: batch.totalEmailsDrafted,

        // Error info
        errorMessage: batch.errorMessage,
        errorStep: batch.errorStep,

        // Job details
        job: {
          id: batch.job.id,
          title: batch.job.title,
          company: {
            name: batch.job.company.name,
            logo: batch.job.company.website,
          },
        },

        // Contacts with emails
        results: batch.contacts.map((contact) => {
          const email = batch.emails.find((e) => e.contactId === contact.id)

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
