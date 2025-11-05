import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-development',
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development',
})

interface Moment {
  source_url: string
  type: string
  timestamp: string | null
  quote: string
  label: 'pain' | 'plan' | 'metric' | 'hiring' | 'mission'
  why_it_matters: string
  confidence: number
}

interface EmailDraft {
  subject: string
  body_text: string
  sources_cited: string[]
  angle_tag: 'curiosity' | 'mission_fit' | 'project_relevance' | 'specific_question' | 'timeline'
  word_count: number
}

interface ContactSelection {
  selected_contacts: Array<{
    contact_id: string
    selection_reason: string
    role_in_outreach: string
  }>
  summary: string
}

export class LLMService {
  async extractMoments(
    companyName: string,
    content: string,
    sourceUrl: string,
    sourceType: string
  ): Promise<Moment[]> {
    // For development, return mock data if no API keys
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key-for-development') {
      return this.getMockMoments(companyName, sourceUrl)
    }

    const prompt = `You are extracting verifiable "moments" about ${companyName} from the content below.
Return JSON array. Each item: {
  "source_url": "${sourceUrl}",
  "type": "${sourceType}",
  "timestamp": "HH:MM:SS or null",
  "quote": "verbatim ≤ 35 words",
  "label": "pain|plan|metric|hiring|mission",
  "why_it_matters": "≤ 20 words",
  "confidence": 0.0–1.0
}

Focus on concrete, verifiable facts. Be conservative with confidence scores (only include if you're confident it's factual and relevant).

Content:
${content.substring(0, 3000)}

Return only valid JSON array, no other text.`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      })

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON array found in LLM response, using mock data')
        return this.getMockMoments(companyName, sourceUrl)
      }

      const moments = JSON.parse(jsonMatch[0])
      return moments.filter((m: any) => m.confidence >= 0.6) // Only high-confidence moments
    } catch (error) {
      console.error('Error extracting moments:', error)
      return this.getMockMoments(companyName, sourceUrl)
    }
  }

  async generateEmailDrafts(
    studentName: string,
    studentSchool: string,
    studentMajor: string,
    gradTerm: string,
    jobTitle: string,
    jobUrl: string,
    moments: Moment[],
    resumeHighlights: string
  ): Promise<EmailDraft[]> {
    // For development, return mock data if no API keys
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key-for-development') {
      return this.getMockEmailDrafts(studentName, studentSchool, studentMajor, gradTerm, jobTitle, jobUrl, moments, resumeHighlights)
    }

    const drafts: EmailDraft[] = []
    const angles = ['curiosity', 'mission_fit', 'project_relevance', 'specific_question', 'timeline']

    for (let i = 0; i < Math.min(5, moments.length); i++) {
      const moment = moments[i]
      const angle = angles[i] as any

      const prompt = `Draft a concise email from ${studentName}, a ${studentMajor} at ${studentSchool}, graduating ${gradTerm}.
They applied to ${jobTitle} (${jobUrl}).

Use exactly one specific moment: "${moment.quote}" (${moment.source_url}${moment.timestamp ? ` at ${moment.timestamp}` : ''}).

Tone: human, curious, respectful. Structure:
1. Short intro (who you are)
2. 1-sentence context (why you're reaching out)
3. The cited moment + your alignment
4. Clear ask ("could you point me to the right next step or team contact?")
5. Thanks + signature

No buzzwords. 90-130 words.

Angle: ${angle}
Resume highlights: ${resumeHighlights}

Return only valid JSON:
{
  "subject": "string (max 60 chars)",
  "body_text": "string",
  "sources_cited": ["${moment.source_url}"],
  "angle_tag": "${angle}",
  "word_count": number
}`

      try {
        const message = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        })

        const responseText = message.content[0].type === 'text'
          ? message.content[0].text
          : ''

        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const draft = JSON.parse(jsonMatch[0])
          drafts.push(draft)
        }
      } catch (error) {
        console.error(`Error generating draft ${i + 1}:`, error)
      }
    }

    return drafts.length > 0 ? drafts : this.getMockEmailDrafts(studentName, studentSchool, studentMajor, gradTerm, jobTitle, jobUrl, moments, resumeHighlights)
  }

  async selectContacts(contacts: any[]): Promise<ContactSelection> {
    // For development, return mock data if no API keys
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key-for-development') {
      return this.getMockContactSelection(contacts)
    }

    const prompt = `Given a list of potential contacts, choose exactly 5 with this mix:
- 2 HR/Recruiting (prioritize campus/university roles)
- 1 head/lead recruiter if present
- 2 people from the hiring team or adjacent team

Prefer email_confidence ≥ 0.7.

Contacts: ${JSON.stringify(contacts, null, 2)}

Return only valid JSON:
{
  "selected_contacts": [
    {
      "contact_id": "string",
      "selection_reason": "string",
      "role_in_outreach": "Primary HR contact|Lead recruiter|Team contact|EA backup"
    }
  ],
  "summary": "string"
}`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Error selecting contacts:', error)
    }

    // Fallback: mock selection
    return this.getMockContactSelection(contacts)
  }

  private getMockMoments(companyName: string, sourceUrl: string): Moment[] {
    return [
      {
        source_url: sourceUrl,
        type: 'site_page',
        timestamp: null,
        quote: `We're excited to announce that ${companyName} is expanding our engineering team by 30% this year to support our product roadmap.`,
        label: 'hiring',
        why_it_matters: 'Shows active growth and hiring',
        confidence: 0.9
      },
      {
        source_url: sourceUrl,
        type: 'site_page',
        timestamp: null,
        quote: `Our mission is to empower businesses with cutting-edge technology solutions that drive real business value.`,
        label: 'mission',
        why_it_matters: 'Company values and purpose',
        confidence: 0.8
      },
      {
        source_url: sourceUrl,
        type: 'site_page',
        timestamp: null,
        quote: `Customers report an average 40% increase in productivity after implementing our platform.`,
        label: 'metric',
        why_it_matters: 'Demonstrates product value and success',
        confidence: 0.7
      }
    ]
  }

  private getMockEmailDrafts(
    studentName: string,
    studentSchool: string,
    studentMajor: string,
    gradTerm: string,
    jobTitle: string,
    jobUrl: string,
    moments: Moment[],
    resumeHighlights: string
  ): EmailDraft[] {
    const moment = moments[0] || {
      quote: "We're expanding our engineering team by 30% this year",
      source_url: "https://company.com/about",
      label: 'hiring'
    }

    return [
      {
        subject: `Question about ${studentMajor} internship at ${studentMajor} position`,
        body_text: `Hi there,

I'm ${studentName}, a ${studentMajor} student at ${studentSchool} graduating ${gradTerm}. I recently applied for the ${jobTitle} position.

I was particularly interested to read that ${moment.quote}. This resonates with me because of my background in ${resumeHighlights.toLowerCase()}, and I believe my skills align well with your team's goals.

Could you point me to the right next step or the appropriate hiring manager for this role?

Thank you for your time and consideration.

Best regards,
${studentName}`,
        sources_cited: [moment.source_url],
        angle_tag: 'curiosity',
        word_count: 112
      },
      {
        subject: `Following up on ${jobTitle} application from ${studentSchool}`,
        body_text: `Hello,

I'm ${studentName}, a ${studentMajor} student at ${studentSchool} graduating ${gradTerm}. I recently submitted my application for the ${jobTitle} position.

I was excited to learn that ${moment.quote}. This growth focus aligns perfectly with my academic projects and internship experience where I've ${resumeHighlights.toLowerCase()}.

Would you be able to provide any insights into the interview process or timeline for this internship?

I'm very enthusiastic about the possibility of contributing to your team.

Best regards,
${studentName}`,
        sources_cited: [moment.source_url],
        angle_tag: 'specific_question',
        word_count: 118
      }
    ]
  }

  private getMockContactSelection(contacts: any[]): ContactSelection {
    const selectedContacts = contacts.slice(0, Math.min(5, contacts.length)).map((contact, index) => {
      let role = 'Team contact'
      let reason = 'Selected based on role and confidence'

      if (contact.dept === 'Recruiting') {
        if (contact.title?.toLowerCase().includes('university') ||
            contact.title?.toLowerCase().includes('campus')) {
          role = 'Primary HR contact'
          reason = 'University recruiter - ideal for internship outreach'
        } else if (index === 0) {
          role = 'Primary HR contact'
          reason = 'Recruiting department lead with email access'
        } else {
          role = 'HR contact'
          reason = 'Additional recruiting team member for follow-up'
        }
      } else if (contact.dept === 'Team') {
        role = 'Team contact'
        reason = 'Technical team member for role-specific questions'
      } else if (contact.dept === 'EA') {
        role = 'EA backup'
        reason = 'Executive assistant for escalation if needed'
      }

      return {
        contact_id: contact.id,
        selection_reason: reason,
        role_in_outreach: role
      }
    })

    return {
      selected_contacts: selectedContacts,
      summary: `Selected ${selectedContacts.length} contacts with mix of recruiting (${selectedContacts.filter(c => c.role_in_outreach.includes('HR')).length}) and team members (${selectedContacts.filter(c => c.role_in_outreach === 'Team contact').length})`
    }
  }
}

export const llmService = new LLMService()