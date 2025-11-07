import { prisma } from '@/lib/database'
import { apolloService } from './apollo'
import { linkedInResearch } from './linkedin-research'
import { emailGenerator } from './email-generator'

interface OrchestrationResult {
  success: boolean
  batchId: string
  contactsFound: number
  emailsDrafted: number
  errorMessage?: string
}

export class OutreachOrchestrator {
  /**
   * Main orchestration method - coordinates entire outreach flow
   */
  async executeOutreachFlow(params: {
    jobId: string
    userId?: string
    maxContacts?: number
  }): Promise<OrchestrationResult> {
    const { jobId, userId, maxContacts = 5 } = params

    console.log(`🚀 Starting outreach orchestration for job ${jobId}`)

    // Fetch job details first to get companyId
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
      },
    })

    if (!job || !job.company) {
      throw new Error('Job or company not found')
    }

    // Create outreach batch
    const batch = await prisma.outreachBatch.create({
      data: {
        jobId,
        companyId: job.company.id,
        userId: userId || null,
        status: 'pending',
        currentStep: 'Initializing...',
        progress: 0,
        startedAt: new Date(),
      },
    })

    try {
      // STEP 1: Fetch job details
      await this.updateBatchStatus(batch.id, 'finding_contacts', 'Loading job details...', 10)

      console.log(`📋 Job: ${job.title} at ${job.company.name}`)

      // STEP 2: Find hiring contacts via Apollo
      await this.updateBatchStatus(batch.id, 'finding_contacts', 'Searching for hiring managers...', 20)

      const apolloContacts = await apolloService.findHiringContacts({
        companyDomain: job.company.domain || job.company.website || '',
        companyName: job.company.name,
        limit: maxContacts * 2, // Get more than needed to filter
      })

      if (apolloContacts.length === 0) {
        throw new Error('No hiring contacts found at this company')
      }

      console.log(`✅ Found ${apolloContacts.length} potential contacts`)

      // STEP 3: Filter and rank contacts
      await this.updateBatchStatus(batch.id, 'finding_contacts', 'Filtering best contacts...', 30)

      const rankedContacts = this.rankContacts(apolloContacts).slice(0, maxContacts)

      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: { totalContactsFound: rankedContacts.length },
      })

      // STEP 4: Create contact records and enrich with LinkedIn research
      await this.updateBatchStatus(batch.id, 'researching', 'Researching contacts...', 40)

      const contactRecords = []
      for (let i = 0; i < rankedContacts.length; i++) {
        const apolloContact = rankedContacts[i]
        const progress = 40 + (i / rankedContacts.length) * 30

        await this.updateBatchStatus(
          batch.id,
          'researching',
          `Researching ${apolloContact.name} (${i + 1}/${rankedContacts.length})...`,
          Math.round(progress)
        )

        // Research via LinkedIn if URL available
        let researchSummary = `Professional at ${job.company.name}`
        let linkedinData = null

        if (apolloContact.linkedin_url) {
          try {
            linkedinData = await linkedInResearch.researchPerson(apolloContact.linkedin_url)
            if (linkedinData) {
              researchSummary = await linkedInResearch.generateResearchSummary(
                linkedinData,
                job.company.name,
                job.title
              )
            }
          } catch (error) {
            console.error(`⚠️  LinkedIn research failed for ${apolloContact.name}:`, error)
          }
        }

        // Create contact record
        const contact = await prisma.contact.create({
          data: {
            companyId: job.company.id,
            batchId: batch.id,
            fullName: apolloContact.name,
            firstName: apolloContact.first_name,
            lastName: apolloContact.last_name,
            title: apolloContact.title,
            department: apolloContact.departments?.[0] || null,
            seniority: apolloContact.seniority || null,
            email: apolloContact.email,
            emailStatus: apolloContact.email_status || 'unknown',
            emailConfidence: apolloContact.email ? 0.85 : 0.0,
            linkedinUrl: apolloContact.linkedin_url,
            photoUrl: apolloContact.photo_url,
            headline: linkedinData?.headline || apolloContact.headline,
            location:
              apolloContact.city && apolloContact.state
                ? `${apolloContact.city}, ${apolloContact.state}`
                : null,
            researchSummary,
            source: 'apollo',
            verifiedAt: new Date(),
          },
        })

        contactRecords.push(contact)
      }

      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: { totalContactsEnriched: contactRecords.length },
      })

      console.log(`✅ Created ${contactRecords.length} contact records with research`)

      // STEP 5: Generate personalized emails for each contact
      await this.updateBatchStatus(batch.id, 'drafting_emails', 'Drafting personalized emails...', 70)

      const emailRecords = []
      for (let i = 0; i < contactRecords.length; i++) {
        const contact = contactRecords[i]
        const progress = 70 + (i / contactRecords.length) * 25

        await this.updateBatchStatus(
          batch.id,
          'drafting_emails',
          `Drafting email for ${contact.fullName} (${i + 1}/${contactRecords.length})...`,
          Math.round(progress)
        )

        try {
          const generatedEmail = await emailGenerator.generateEmail({
            recipientName: contact.fullName,
            recipientTitle: contact.title,
            recipientResearch: contact.researchSummary || '',
            companyName: job.company.name,
            companyDescription: job.company.industryTags.join(', '),
            jobTitle: job.title,
            jobDescription: job.description || '',
            studentName: 'Student', // TODO: Get from user profile
            studentMajor: undefined,
            studentSchool: undefined,
          })

          const emailRecord = await prisma.outreachEmail.create({
            data: {
              contactId: contact.id,
              batchId: batch.id,
              subject: generatedEmail.subject,
              body: generatedEmail.body,
              personalizations: generatedEmail.personalizations,
              aiGeneratedBy: 'claude-3-5-sonnet-20241022',
              status: 'draft',
            },
          })

          emailRecords.push(emailRecord)
        } catch (error) {
          console.error(`⚠️  Email generation failed for ${contact.fullName}:`, error)
        }
      }

      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: { totalEmailsDrafted: emailRecords.length },
      })

      console.log(`✅ Generated ${emailRecords.length} personalized emails`)

      // STEP 6: Complete
      await this.updateBatchStatus(batch.id, 'completed', 'Outreach preparation complete!', 100)

      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: {
          completedAt: new Date(),
        },
      })

      return {
        success: true,
        batchId: batch.id,
        contactsFound: contactRecords.length,
        emailsDrafted: emailRecords.length,
      }
    } catch (error: any) {
      console.error('❌ Outreach orchestration failed:', error)

      // Update batch with error
      await prisma.outreachBatch.update({
        where: { id: batch.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          errorStep: 'orchestration',
          completedAt: new Date(),
        },
      })

      return {
        success: false,
        batchId: batch.id,
        contactsFound: 0,
        emailsDrafted: 0,
        errorMessage: error.message,
      }
    }
  }

  /**
   * Helper: Update batch status
   */
  private async updateBatchStatus(
    batchId: string,
    status: string,
    currentStep: string,
    progress: number
  ): Promise<void> {
    await prisma.outreachBatch.update({
      where: { id: batchId },
      data: {
        status,
        currentStep,
        progress,
      },
    })
  }

  /**
   * Helper: Rank contacts by relevance
   */
  private rankContacts(contacts: any[]): any[] {
    return contacts
      .map((contact) => {
        let score = 0

        // Prefer verified emails
        if (contact.email_status === 'verified') score += 10
        if (contact.email_status === 'guessed') score += 5

        // Prefer recruiting-related titles
        const title = contact.title?.toLowerCase() || ''
        if (title.includes('recruiter')) score += 8
        if (title.includes('talent')) score += 8
        if (title.includes('hr')) score += 6
        if (title.includes('hiring')) score += 7
        if (title.includes('people')) score += 5

        // Prefer senior contacts
        const seniority = contact.seniority?.toLowerCase() || ''
        if (seniority.includes('senior')) score += 4
        if (seniority.includes('lead')) score += 3
        if (seniority.includes('manager')) score += 5
        if (seniority.includes('director')) score += 6

        // Bonus for LinkedIn profile
        if (contact.linkedin_url) score += 3

        // Bonus for photo
        if (contact.photo_url) score += 2

        return { ...contact, _score: score }
      })
      .sort((a, b) => b._score - a._score)
  }
}

export const outreachOrchestrator = new OutreachOrchestrator()
