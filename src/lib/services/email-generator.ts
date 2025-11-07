import Anthropic from '@anthropic-ai/sdk'

interface EmailGenerationParams {
  // Recipient info
  recipientName: string
  recipientTitle: string
  recipientResearch: string

  // Company info
  companyName: string
  companyDescription: string

  // Job info
  jobTitle: string
  jobDescription: string

  // Student info (sender)
  studentName: string
  studentMajor?: string
  studentSchool?: string
  studentSkills?: string[]
}

interface GeneratedEmail {
  subject: string
  body: string
  personalizations: {
    specificMention: string
    relevantSkill: string
    companyConnection: string
  }
}

export class EmailGeneratorService {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    this.client = new Anthropic({ apiKey })
  }

  /**
   * Generate a personalized outreach email using Claude
   */
  async generateEmail(params: EmailGenerationParams): Promise<GeneratedEmail> {
    console.log(`📝 Generating personalized email for ${params.recipientName}...`)

    const prompt = `You are an expert at writing compelling cold outreach emails for college students seeking internships.

CONTEXT:
- Student: ${params.studentName}${params.studentMajor ? `, studying ${params.studentMajor}` : ''}${params.studentSchool ? ` at ${params.studentSchool}` : ''}
- Applying to: ${params.jobTitle} at ${params.companyName}
- Recipient: ${params.recipientName}, ${params.recipientTitle}
- Company: ${params.companyDescription}

RESEARCH ON RECIPIENT:
${params.recipientResearch}

JOB DESCRIPTION:
${params.jobDescription.substring(0, 500)}

TASK:
Write a highly personalized cold email that:
1. References something specific about the recipient (their role, recent work, or background)
2. Shows genuine interest in ${params.companyName}'s work
3. Briefly mentions 1-2 relevant skills/experiences
4. Asks for a brief conversation or advice (not directly for a job)
5. Is 150-200 words max
6. Professional but warm and authentic tone
7. NO generic phrases like "I hope this email finds you well"
8. NO obvious templates - must feel personally written

FORMAT YOUR RESPONSE AS JSON:
{
  "subject": "Subject line (50 chars max, no 'Re:' or 'Fwd:')",
  "body": "Email body with proper paragraphs",
  "personalizations": {
    "specificMention": "What specific thing about recipient was mentioned",
    "relevantSkill": "What skill/experience was highlighted",
    "companyConnection": "What about the company was referenced"
  }
}

WRITE THE EMAIL NOW:`

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude')
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Claude response')
      }

      const email: GeneratedEmail = JSON.parse(jsonMatch[0])

      console.log(`✅ Email generated successfully`)
      console.log(`   Subject: ${email.subject}`)
      console.log(`   Length: ${email.body.length} chars`)

      return email
    } catch (error: any) {
      console.error('❌ Email generation failed:', error.message)

      // Fallback to template-based email
      return this.generateFallbackEmail(params)
    }
  }

  /**
   * Fallback email if AI generation fails
   */
  private generateFallbackEmail(params: EmailGenerationParams): GeneratedEmail {
    return {
      subject: `Interest in ${params.jobTitle} at ${params.companyName}`,
      body: `Hi ${params.recipientName.split(' ')[0]},

I'm ${params.studentName}, currently ${params.studentMajor ? `studying ${params.studentMajor}` : 'a student'} and very interested in the ${params.jobTitle} position at ${params.companyName}.

I've been following ${params.companyName}'s work and am particularly impressed by your approach. Given your role as ${params.recipientTitle}, I'd love to learn more about the team and the kind of projects interns work on.

Would you have 15 minutes for a quick call to discuss the role and share advice on breaking into the industry?

Thank you for considering!

Best regards,
${params.studentName}`,
      personalizations: {
        specificMention: params.recipientTitle,
        relevantSkill: 'General interest',
        companyConnection: params.companyName,
      },
    }
  }

  /**
   * Batch generate emails for multiple contacts
   */
  async generateMultipleEmails(
    contacts: Array<{
      name: string
      title: string
      research: string
    }>,
    commonParams: Omit<EmailGenerationParams, 'recipientName' | 'recipientTitle' | 'recipientResearch'>
  ): Promise<GeneratedEmail[]> {
    console.log(`📝 Generating ${contacts.length} personalized emails...`)

    const emails = await Promise.all(
      contacts.map((contact) =>
        this.generateEmail({
          ...commonParams,
          recipientName: contact.name,
          recipientTitle: contact.title,
          recipientResearch: contact.research,
        })
      )
    )

    return emails
  }
}

export const emailGenerator = new EmailGeneratorService()
