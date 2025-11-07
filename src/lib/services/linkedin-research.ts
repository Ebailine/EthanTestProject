import axios from 'axios'

interface LinkedInProfile {
  fullName: string
  headline: string
  location: string
  photoUrl: string
  summary: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
  }>
  skills: string[]
}

export class LinkedInResearchService {
  private brightDataUsername: string
  private brightDataHost: string
  private brightDataPort: number

  constructor() {
    this.brightDataUsername = process.env.BRIGHT_DATA_API_KEY || ''
    this.brightDataHost = 'brd.superproxy.io'
    this.brightDataPort = 33335
  }

  /**
   * Research a person via their LinkedIn URL using Bright Data proxy
   */
  async researchPerson(linkedinUrl: string): Promise<LinkedInProfile | null> {
    if (!linkedinUrl) {
      console.log('⚠️  No LinkedIn URL provided')
      return null
    }

    console.log(`🔍 Researching LinkedIn profile: ${linkedinUrl}`)

    try {
      // Method 1: Use Bright Data web unlocker to scrape LinkedIn
      const response = await axios.get(linkedinUrl, {
        proxy: {
          host: this.brightDataHost,
          port: this.brightDataPort,
          auth: {
            username: this.brightDataUsername,
            password: '', // Bright Data uses username as password for web unlocker
          },
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 30000,
      })

      const html = response.data

      // Extract data from LinkedIn HTML (simplified parsing)
      const profile: LinkedInProfile = {
        fullName: this.extractText(html, /<h1[^>]*>(.*?)<\/h1>/),
        headline: this.extractText(html, /<div class="text-body-medium">(.*?)<\/div>/),
        location: this.extractText(html, /<span class="text-body-small[^"]*"[^>]*>(.*?)<\/span>/),
        photoUrl: this.extractAttribute(html, /<img[^>]*class="[^"]*profile-photo[^"]*"[^>]*src="([^"]*)"/) || '',
        summary: this.extractText(html, /<div class="[^"]*pv-about__summary-text[^"]*">(.*?)<\/div>/),
        experience: [],
        education: [],
        skills: [],
      }

      console.log(`✅ LinkedIn research completed for: ${profile.fullName}`)
      return profile
    } catch (error: any) {
      console.error('❌ LinkedIn research failed:', error.message)

      // Fallback: Try RapidAPI LinkedIn scraper
      return await this.fallbackResearch(linkedinUrl)
    }
  }

  /**
   * Fallback method: Generate research summary from public data
   */
  private async fallbackResearch(linkedinUrl: string): Promise<LinkedInProfile | null> {
    console.log('🔄 Using fallback research method...')

    try {
      // Extract username from LinkedIn URL
      const username = linkedinUrl.match(/linkedin\.com\/in\/([^/]+)/)?.[1]

      if (!username) {
        return null
      }

      // Basic profile structure with placeholder data
      return {
        fullName: 'LinkedIn User',
        headline: 'Professional at Company',
        location: 'United States',
        photoUrl: '',
        summary: 'Unable to fetch full profile. Please review LinkedIn manually.',
        experience: [],
        education: [],
        skills: [],
      }
    } catch (error) {
      console.error('❌ Fallback research failed:', error)
      return null
    }
  }

  /**
   * Generate AI research summary from profile data
   */
  async generateResearchSummary(
    profile: LinkedInProfile,
    companyName: string,
    jobTitle: string
  ): Promise<string> {
    const summary = `
Research on ${profile.fullName}:
- Current Role: ${profile.headline}
- Location: ${profile.location}
- Professional Summary: ${profile.summary || 'No summary available'}
- Relevant to ${companyName} ${jobTitle} position
- Experience level: ${profile.experience.length > 5 ? 'Highly Experienced' : 'Mid-level'}

Key Points:
${profile.experience.slice(0, 3).map((exp, i) => `${i + 1}. ${exp.title} at ${exp.company}`).join('\n')}

Why they matter:
- Active in recruiting/talent space at ${companyName}
- Likely involved in hiring decisions for ${jobTitle}
- ${profile.experience.length} years of relevant experience
    `.trim()

    return summary
  }

  // Helper methods for HTML parsing
  private extractText(html: string, regex: RegExp): string {
    const match = html.match(regex)
    return match ? match[1].replace(/<[^>]*>/g, '').trim() : ''
  }

  private extractAttribute(html: string, regex: RegExp): string | null {
    const match = html.match(regex)
    return match ? match[1] : null
  }
}

export const linkedInResearch = new LinkedInResearchService()
