import axios, { AxiosInstance } from 'axios'
import { logger } from '../lib/logger'

interface LeverJob {
  id: string
  title: string
  text: string
  hostedUrl: string
  applyUrl: string
  location: string
  department: string
  team: string
  description: string
  descriptionHtml: string
  lists: Array<{
    text: string
    content: string
  }>
  tags: string[]
  categories: {
    commit: string
    department: string
    location: string
    team: string
  }
  createdAt: number
  postedAt: number
  closingAt: number | null
}

interface LeverResponse {
  data: LeverJob[]
}

export class LeverConnector {
  public readonly name = 'Lever'
  private baseURL = 'https://jobs.lever.co'
  private http: AxiosInstance

  constructor() {
    this.http = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Pathfinder-Bot/1.0 ( Educational Job Aggregator )',
      },
    })
  }

  async fetchJobs(): Promise<any[]> {
    logger.info('Fetching jobs from Lever boards...')

    // List of known Lever boards to crawl
    const boards = [
      'https://jobs.lever.co/uber',
      'https://jobs.lever.co/coursera',
      'https://jobs.lever.co/lyft',
      'https://jobs.lever.co/doordash',
      'https://jobs.lever.co/walmartlabs',
      'https://jobs.lever.co/segment',
      'https://jobs.lever.co/databricks',
      'https://jobs.lever.co/miro',
      'https://jobs.lever.co/asana',
      'https://jobs.lever.co/slack',
    ]

    const allJobs = []

    for (const boardUrl of boards) {
      try {
        const jobs = await this.fetchFromBoard(boardUrl)
        allJobs.push(...jobs)

        // Rate limiting: wait 1 second between requests
        await this.sleep(1000)
      } catch (error) {
        logger.warn(`Failed to fetch from ${boardUrl}:`, error)
        continue
      }
    }

    return allJobs
  }

  private async fetchFromBoard(boardUrl: string): Promise<any[]> {
    logger.debug(`Fetching from board: ${boardUrl}`)

    try {
      const response = await this.http.get<LeverResponse>(`${boardUrl}.json`)
      const jobs = response.data.data

      // Filter for internships and entry-level positions
      const relevantJobs = jobs.filter(job =>
        this.isInternshipOrEntryLevel(job.title, job.text)
      )

      logger.debug(`Found ${relevantJobs.length} relevant jobs out of ${jobs.length} total`)

      return relevantJobs.map(job => this.transformJob(job, boardUrl))

    } catch (error) {
      logger.error(`Error fetching from ${boardUrl}:`, error)
      throw error
    }
  }

  private isInternshipOrEntryLevel(title: string, content?: string): boolean {
    const normalizedTitle = title.toLowerCase()
    const normalizedContent = (content ?? '').toLowerCase()

    const internshipKeywords = [
      'internship', 'intern', 'co-op', 'co op', 'cooperative education',
      'summer intern', 'fall intern', 'spring intern', 'winter intern'
    ]

    const entryLevelKeywords = [
      'entry level', 'entry-level', 'junior', 'associate', 'recent graduate',
      'new grad', 'recent grad', 'grad', 'early career', 'early career'
    ]

    const hasInternshipKeyword = internshipKeywords.some(keyword =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
    )

    const hasEntryLevelKeyword = entryLevelKeywords.some(keyword =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
    )

    return hasInternshipKeyword || hasEntryLevelKeyword
  }

  private transformJob(job: LeverJob, boardUrl: string): any {
    const companyName = this.extractCompanyNameFromUrl(boardUrl)

    return {
      title: job.title,
      company: companyName,
      location: job.location,
      remoteFlag: this.extractRemoteStatus(job.location),
      function: this.mapDepartmentToFunction(job.categories.department),
      sourceUrl: job.hostedUrl,
      sourceName: 'Lever',
      atsType: 'lever',
      postedAt: new Date(job.postedAt),
      lastVerifiedAt: new Date(job.createdAt),
      content: job.description,
      team: job.team,
      department: job.categories.department,
      tags: job.tags || [],
      closingAt: job.closingAt ? new Date(job.closingAt) : null,
    }
  }

  private extractCompanyNameFromUrl(boardUrl: string): string {
    // Extract company name from URL like "https://jobs.lever.co/uber"
    const segments = boardUrl.split('/').filter(Boolean)
    const slug = segments[segments.length - 1]
    return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Unknown Company'
  }

  private extractRemoteStatus(location: string): boolean {
    const remoteKeywords = [
      'remote', 'work from home', 'wfh', 'distributed',
      'anywhere', 'global', 'usa remote', 'us remote'
    ]

    return remoteKeywords.some(keyword =>
      location.toLowerCase().includes(keyword)
    )
  }

  private mapDepartmentToFunction(department: string): string {
    if (!department) {
      return 'other'
    }

    const deptName = department.toLowerCase()

    const functionMapping: { [key: string]: string } = {
      'engineering': 'engineering',
      'product': 'product',
      'design': 'design',
      'marketing': 'marketing',
      'sales': 'sales',
      'operations': 'operations',
      'finance': 'finance',
      'hr': 'other',
      'people': 'other',
      'legal': 'other',
      'customer support': 'other',
      'data': 'engineering',
      'research': 'engineering',
      'revenue': 'sales',
      'growth': 'marketing',
      'comms': 'marketing',
    }

    for (const [key, value] of Object.entries(functionMapping)) {
      if (deptName.includes(key)) {
        return value
      }
    }

    return 'other'
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}