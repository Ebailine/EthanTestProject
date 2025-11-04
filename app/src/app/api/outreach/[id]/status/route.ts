import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { auth } from '@clerk/nextjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const batchId = params.id

    // Get outreach batch with related data
    const batch = await prisma.outreachBatch.findUnique({
      where: {
        id: batchId,
        userId: userId, // Ensure user can only see their own batches
      },
      include: {
        job: {
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
                  orderBy: { emailConfidence: 'desc' },
                  take: 15,
                },
              },
            },
          },
        },
        emails: {
          include: {
            contact: true
          }
        },
      },
    })

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Outreach batch not found' },
        { status: 404 }
      )
    }

    // Calculate research quality and determine progress
    const moments = batch.job.company.moments || []
    const contacts = batch.job.company.contacts || []
    const emails = batch.emails || []

    const researchQuality = calculateResearchQuality(moments)
    const hasSufficientResearch = researchQuality >= 50
    const hasSufficientContacts = contacts.length >= 3

    // Determine workflow progress
    let status = batch.status
    let progress = 0
    let currentStep = 'researching'
    let estimatedMinutesRemaining = 0

    if (moments.length > 0) {
      progress += 25
      currentStep = 'contacts'
      estimatedMinutesRemaining = 10
    }

    if (contacts.length >= 3) {
      progress += 25
      currentStep = 'drafting'
      estimatedMinutesRemaining = 5
    }

    if (emails.length >= 5) {
      progress += 50
      currentStep = 'ready'
      status = 'ready'
      estimatedMinutesRemaining = 0
    }

    return NextResponse.json({
      success: true,
      workflow: {
        id: batch.id,
        status,
        progress,
        currentStep,
        estimatedMinutesRemaining,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt
      },
      job: {
        id: batch.job.id,
        title: batch.job.title,
        company: {
          id: batch.job.company.id,
          name: batch.job.company.name,
          domain: batch.job.company.domain,
          website: batch.job.company.website
        }
      },
      research: {
        quality: researchQuality,
        hasSufficientResearch,
        momentsCount: moments.length,
        sourcesCount: (batch.job.company.sources || []).length,
        topMoments: moments.slice(0, 5).map(moment => ({
          id: moment.id,
          quote: moment.quote,
          label: moment.label,
          confidence: Number(moment.confidence),
          summary: moment.summary,
          sourceUrl: moment.source?.url
        }))
      },
      contacts: {
        hasSufficientContacts,
        count: contacts.length,
        verifiedContacts: contacts.filter(c => c.emailConfidence >= 0.7).length,
        topContacts: contacts.slice(0, 5).map(contact => ({
          id: contact.id,
          fullName: contact.fullName,
          title: contact.title,
          dept: contact.dept,
          email: contact.email ? maskEmail(contact.email) : null,
          emailConfidence: Number(contact.emailConfidence)
        }))
      },
      emails: {
        count: emails.length,
        draftsGenerated: emails.filter(e => e.status === 'draft').length,
        approved: emails.filter(e => e.status === 'approved').length,
        sent: emails.filter(e => e.status === 'sent').length
      }
    })

  } catch (error) {
    console.error('Error fetching outreach status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outreach status' },
      { status: 500 }
    )
  }
}

function calculateResearchQuality(moments: any[]): number {
  if (moments.length === 0) return 0

  const avgConfidence = moments.reduce((sum, m) => sum + Number(m.confidence), 0) / moments.length
  const uniqueLabels = new Set(moments.map(m => m.label))
  const diversityScore = uniqueLabels.size / 5 // 5 possible labels

  return Math.round((avgConfidence * 0.7 + diversityScore * 0.3) * 100)
}

function maskEmail(email: string): string {
  if (!email) return null

  const [username, domain] = email.split('@')
  if (!username || !domain) return email

  // Show first 2 characters and last character before @
  const maskedUsername = username.length <= 3
    ? username.replace(/.(?!$)/g, '*')
    : username.substring(0, 2) + '*'.repeat(username.length - 3) + username.slice(-1)

  return `${maskedUsername}@${domain}`
}