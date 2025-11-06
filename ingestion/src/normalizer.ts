import { logger } from './lib/logger'
import crypto from 'crypto'

interface RawJob {
  title: string
  company: string
  location: string
  remoteFlag: boolean
  function: string
  sourceUrl: string
  sourceName: string
  atsType: string
  postedAt: Date
  lastVerifiedAt: Date
  content?: string
  department?: string
  team?: string
  tags?: string[]
  payInfo?: any
  applicationDeadline?: Date
  summary?: string
  [key: string]: any
}

interface NormalizedJob {
  id: string
  title: string
  function: string
  majorTags: string[]
  location: string
  remoteFlag: boolean
  paidFlag: boolean
  payInfo?: {
    min?: number
    max?: number
    currency?: string
    period?: 'hourly' | 'monthly' | 'stipend' | 'annual'
  }
  internshipType?: string
  startDate?: Date
  endDate?: Date
  sourceName: string
  sourceUrl: string
  atsType: string
  postedAt: Date
  lastVerifiedAt: Date
  status: 'active' | 'expired' | 'closed' | 'draft'
  company: {
    name: string
    website?: string
    domain?: string
    industryTags: string[]
    sizeBand?: string
  }
}

export class JobNormalizer {
  private seenJobs = new Map<string, string>() // Hash to original job mapping

  async normalize(jobs: RawJob[]): Promise<NormalizedJob[]> {
    logger.info(`Normalizing ${jobs.length} raw jobs...`)

    const normalizedJobs: NormalizedJob[] = []
    const duplicates = new Set<string>()

    for (const rawJob of jobs) {
      try {
        const normalizedJob = await this.normalizeJob(rawJob)

        // Check for duplicates
        const jobHash = this.generateJobHash(normalizedJob)

        if (this.seenJobs.has(jobHash)) {
          duplicates.add(jobHash)
          logger.debug(`Duplicate found: ${normalizedJob.title} at ${normalizedJob.company.name}`)
          continue
        }

        this.seenJobs.set(jobHash, normalizedJob.id)
        normalizedJobs.push(normalizedJob)

      } catch (error) {
        logger.warn(`Error normalizing job ${rawJob.title} at ${rawJob.company}:`, error)
        continue
      }
    }

    logger.info(`Normalized to ${normalizedJobs.length} unique jobs (${duplicates.size} duplicates removed)`)
    return normalizedJobs
  }

  private async normalizeJob(rawJob: RawJob): Promise<NormalizedJob> {
    const company = await this.normalizeCompany(rawJob)
    const majorTags = this.extractMajorTags(rawJob.title, rawJob.content)
    const internshipType = this.extractInternshipType(rawJob.title, rawJob.content)
    const payInfo = this.normalizePayInfo(rawJob.payInfo, rawJob.content)

    return {
      id: this.generateId(),
      title: this.cleanTitle(rawJob.title),
      function: this.normalizeFunction(rawJob.function, rawJob.title),
      majorTags,
      location: this.normalizeLocation(rawJob.location),
      remoteFlag: this.normalizeRemoteFlag(rawJob.remoteFlag, rawJob.location),
      paidFlag: this.normalizePaidFlag(payInfo, rawJob.content),
      payInfo,
      internshipType,
      startDate: this.extractStartDate(rawJob.content),
      endDate: this.extractEndDate(rawJob.content),
      sourceName: rawJob.sourceName,
      sourceUrl: rawJob.sourceUrl,
      atsType: rawJob.atsType as any,
      postedAt: rawJob.postedAt,
      lastVerifiedAt: rawJob.lastVerifiedAt,
      status: this.determineStatus(rawJob.postedAt, rawJob.applicationDeadline),
      company,
    }
  }

  private async normalizeCompany(rawJob: RawJob): Promise<NormalizedJob['company']> {
    const name = this.cleanCompanyName(rawJob.company)
    const domain = this.extractDomain(rawJob.company, rawJob.sourceUrl)
    const website = this.extractWebsite(domain)
    const industryTags = this.extractIndustryTags(rawJob.title, rawJob.content, rawJob.function)

    return {
      name,
      website,
      domain,
      industryTags,
      sizeBand: undefined, // Would require external API lookup
    }
  }

  private generateJobHash(job: NormalizedJob): string {
    const content = `${job.company.name.toLowerCase()}-${job.title.toLowerCase()}-${job.location.toLowerCase()}`
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 12)
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/^[^a-zA-Z0-9]+/, '')
      .replace(/[^a-zA-Z0-9]+$/, '')
  }

  private cleanCompanyName(name: string): string {
    return name
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/^(the |a |an )/i, '')
  }

  private normalizeFunction(functionType: string, title: string): string {
    const normalizedFunction = functionType.toLowerCase()
    const titleLower = title.toLowerCase()

    const functionMapping: { [key: string]: string } = {
      'engineering': 'engineering',
      'product': 'product',
      'design': 'design',
      'marketing': 'marketing',
      'sales': 'sales',
      'operations': 'operations',
      'finance': 'finance',
      'data': 'engineering',
      'research': 'engineering',
      'development': 'engineering',
      'software': 'engineering',
      'product management': 'product',
      'product marketing': 'marketing',
      'business development': 'sales',
      'revenue': 'sales',
      'growth': 'marketing',
      'comms': 'marketing',
    }

    // Check function type first
    for (const [key, value] of Object.entries(functionMapping)) {
      if (normalizedFunction.includes(key)) {
        return value
      }
    }

    // Fall back to title analysis
    for (const [key, value] of Object.entries(functionMapping)) {
      if (titleLower.includes(key)) {
        return value
      }
    }

    return 'other'
  }

  private extractMajorTags(title: string, content?: string): string[] {
    const normalizedTitle = title.toLowerCase()
    const normalizedContent = (content ?? '').toLowerCase()
    const combined = `${normalizedTitle} ${normalizedContent}`

    const majorMappings: { [key: string]: string[] } = {
      'computer science': ['computer science', 'computer engineering', 'software engineering'],
      'engineering': ['mechanical engineering', 'electrical engineering', 'civil engineering', 'chemical engineering'],
      'business': ['business administration', 'finance', 'marketing', 'accounting'],
      'design': ['graphic design', 'ui design', 'ux design', 'industrial design'],
      'data science': ['data science', 'machine learning', 'artificial intelligence', 'analytics'],
      'marketing': ['marketing', 'communications', 'advertising', 'public relations'],
      'sales': ['sales', 'business development', 'revenue'],
      'product': ['product management', 'product design'],
      'operations': ['operations', 'supply chain', 'logistics'],
    }

    const majorTags: string[] = []

    for (const [major, keywords] of Object.entries(majorMappings)) {
      if (keywords.some(keyword => combined.includes(keyword))) {
        majorTags.push(major)
      }
    }

    return majorTags.length > 0 ? majorTags : ['other']
  }

  private normalizeLocation(location: string): string {
    return location
      .split(';')
      .map(loc => loc.trim())
      .filter(Boolean)
      .join('; ')
  }

  private normalizeRemoteFlag(remoteFlag: boolean, location: string): boolean {
    if (remoteFlag) return true

    const remoteKeywords = [
      'remote', 'work from home', 'wfh', 'distributed',
      'anywhere', 'global', 'usa remote', 'us remote'
    ]

    return remoteKeywords.some(keyword =>
      location.toLowerCase().includes(keyword)
    )
  }

  private normalizePaidFlag(payInfo: any, content?: string): boolean {
    if (payInfo && (payInfo.min > 0 || payInfo.max > 0)) {
      return true
    }

    const normalizedContent = (content ?? '').toLowerCase()
    const paidKeywords = [
      'paid', 'stipend', 'salary', 'compensation', '$', 'usd',
      'hourly rate', 'monthly stipend', 'weekly stipend'
    ]

    const unpaidKeywords = [
      'unpaid', 'volunteer', 'for credit', 'academic credit',
      'no compensation', 'uncompensated'
    ]

    const hasPaidKeywords = paidKeywords.some(keyword => normalizedContent.includes(keyword))
    const hasUnpaidKeywords = unpaidKeywords.some(keyword => normalizedContent.includes(keyword))

    return hasPaidKeywords || !hasUnpaidKeywords // Default to paid if no clear indicators
  }

  private normalizePayInfo(payInfo: any, content?: string): any {
    if (payInfo) {
      return {
        min: payInfo.min,
        max: payInfo.max,
        currency: payInfo.currency || 'USD',
        period: payInfo.period || 'unknown',
      }
    }

    // Try to extract pay info from content
    const normalizedContent = (content ?? '').toLowerCase()
    const payRegex = /\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per\s*)?(hour|hr|month|year|annually|weekly)/i

    const match = normalizedContent.match(payRegex)
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      const period = match[2].toLowerCase()

      let periodStandardized: 'hourly' | 'monthly' | 'annual' = 'hourly'
      if (period.includes('year') || period.includes('annually')) {
        periodStandardized = 'annual'
      } else if (period.includes('month')) {
        periodStandardized = 'monthly'
      }

      return {
        min: amount,
        max: amount,
        currency: 'USD',
        period: periodStandardized,
      }
    }

    return null
  }

  private extractInternshipType(title: string, content?: string): string {
    const combined = `${title} ${content || ''}`.toLowerCase()

    if (combined.includes('summer')) return 'summer'
    if (combined.includes('fall')) return 'semester'
    if (combined.includes('spring')) return 'semester'
    if (combined.includes('co-op') || combined.includes('co op')) return 'co-op'
    if (combined.includes('year-round') || combined.includes('year round')) return 'year-round'

    return 'other'
  }

  private extractStartDate(content?: string): Date | undefined {
    if (!content) return undefined

    const dateRegex = /(?:start|begin|commence)\s+(?:date|time)?[:\s]*(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/i
    const match = content.match(dateRegex)

    if (match) {
      const date = new Date(match[1])
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    return undefined
  }

  private extractEndDate(content?: string): Date | undefined {
    if (!content) return undefined

    const dateRegex = /(?:end|finish|complete)\s+(?:date|time)?[:\s]*(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/i
    const match = content.match(dateRegex)

    if (match) {
      const date = new Date(match[1])
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    return undefined
  }

  private determineStatus(postedAt: Date, applicationDeadline?: Date): NormalizedJob['status'] {
    const now = new Date()

    if (applicationDeadline && applicationDeadline < now) {
      return 'closed'
    }

    const daysSincePosted = Math.floor((now.getTime() - postedAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSincePosted > 90) {
      return 'expired'
    }

    return 'active'
  }

  private extractDomain(companyName: string, sourceUrl: string): string | undefined {
    // Try to extract domain from source URL first
    try {
      const url = new URL(sourceUrl)
      const hostname = url.hostname

      // Remove subdomains like 'boards.greenhouse.io' -> 'greenhouse.io'
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        return parts.slice(-2).join('.')
      }
    } catch (error) {
      // URL parsing failed, try company name
    }

    // Fallback: guess domain from company name
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')

    return `${cleanName}.com`
  }

  private extractWebsite(domain?: string): string | undefined {
    return domain ? `https://${domain}` : undefined
  }

  private extractIndustryTags(title: string, content?: string, functionType?: string): string[] {
    const combined = `${title} ${content || ''}`.toLowerCase()

    const industryMappings: { [key: string]: string[] } = {
      'technology': ['software', 'technology', 'tech', 'saas', 'fintech'],
      'healthcare': ['healthcare', 'medical', 'health', 'pharmaceutical'],
      'finance': ['finance', 'banking', 'financial', 'investment'],
      'education': ['education', 'learning', 'academic', 'university'],
      'retail': ['retail', 'ecommerce', 'e-commerce', 'shopping'],
      'media': ['media', 'entertainment', 'publishing', 'news'],
      'manufacturing': ['manufacturing', 'industrial', 'production'],
      'consulting': ['consulting', 'advisory', 'professional services'],
      'nonprofit': ['nonprofit', 'non-profit', 'charity', 'foundation'],
      'government': ['government', 'federal', 'state', 'public sector'],
    }

    const industryTags: string[] = []

    for (const [industry, keywords] of Object.entries(industryMappings)) {
      if (keywords.some(keyword => combined.includes(keyword))) {
        industryTags.push(industry)
      }
    }

    // Add function-based industry tags
    if (functionType === 'engineering') {
      industryTags.push('technology')
    }

    return industryTags.length > 0 ? industryTags : ['other']
  }
}