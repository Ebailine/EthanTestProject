import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

/**
 * API endpoint for n8n to update batch status
 * Called by n8n workflow to report progress
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: batchId } = params
    const body = await request.json()

    console.log(`📥 Received batch update for ${batchId}:`, body)

    const {
      status,
      currentStep,
      progress,
      totalContactsFound,
      totalEmailsDrafted,
      errorMessage,
      contacts,
      emails,
    } = body

    // Update batch
    const batch = await prisma.outreachBatch.update({
      where: { id: batchId },
      data: {
        status: status || undefined,
        currentStep: currentStep || undefined,
        progress: progress !== undefined ? progress : undefined,
        totalContactsFound: totalContactsFound || undefined,
        totalEmailsDrafted: totalEmailsDrafted || undefined,
        errorMessage: errorMessage || undefined,
        completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
      },
    })

    // If contacts data is provided, create/update contacts
    if (contacts && Array.isArray(contacts)) {
      for (const contactData of contacts) {
        await prisma.contact.upsert({
          where: {
            email_companyId: {
              email: contactData.email,
              companyId: batch.companyId!,
            },
          },
          update: {
            fullName: contactData.fullName,
            title: contactData.title,
            linkedinUrl: contactData.linkedinUrl,
            researchSummary: contactData.researchSummary,
          },
          create: {
            companyId: batch.companyId!,
            batchId: batch.id,
            fullName: contactData.fullName,
            email: contactData.email,
            title: contactData.title,
            linkedinUrl: contactData.linkedinUrl,
            researchSummary: contactData.researchSummary,
          },
        })
      }
    }

    // If email data is provided, create emails
    if (emails && Array.isArray(emails)) {
      for (const emailData of emails) {
        // Find contact by email
        const contact = await prisma.contact.findFirst({
          where: {
            email: emailData.recipientEmail,
            batchId: batch.id,
          },
        })

        if (contact) {
          await prisma.outreachEmail.create({
            data: {
              contactId: contact.id,
              batchId: batch.id,
              subject: emailData.subject,
              body: emailData.body,
              status: 'draft',
            },
          })
        }
      }
    }

    console.log(`✅ Batch ${batchId} updated successfully`)

    return NextResponse.json({
      success: true,
      message: 'Batch updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Batch update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update batch',
      },
      { status: 500 }
    )
  }
}
