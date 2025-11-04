import axios, { AxiosInstance } from 'axios'
import { logger } from '../lib/logger'

interface GreenhouseJob {
  id: number
  title: string
  absolute_url: string
  location: {
    name: string
  }
  departments?: Array<{
    name: string
  }>
  offices?: Array<{
    name: string
    location: string
  }>
  content?: string
  updated_at: string
  created_at: string
  metadata?: Array<{
    name: string
    value?: string | number | boolean
  }>
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[]
}

export class GreenhouseConnector {
  public readonly name = 'Greenhouse'
  private baseURL = 'https://boards.greenhouse.io'
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
    logger.info('Fetching jobs from Greenhouse boards...')

    // List of known Greenhouse boards to crawl
    const boards = [
      'https://boards.greenhouse.io/airbnb',
      'https://boards.greenhouse.io/spotify',
      'https://boards.greenhouse.io/instacart',
      'https://boards.greenhouse.io/duolingo',
      'https://boards.greenhouse.io/robinhood',
      'https://boards.greenhouse.io/stripe',
      'https://boards.greenhouse.io/coinbase',
      'https://boards.greenhouse.io/figma',
      'https://boards.greenhouse.io/notion',
      'https://boards.greenhouse.io/coda',
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
      const response = await this.http.get<GreenhouseResponse>(`${boardUrl}/jobs.json`)
      const jobs = response.data.jobs

      // Filter for internships and entry-level positions
      const relevantJobs = jobs.filter(job =>
        this.isInternshipOrEntryLevel(job.title, job.content)
      )

      logger.debug(`Found ${relevantJobs.length} relevant jobs out of ${jobs.length} total`)

      return relevantJobs.map(job => this.transformJob(job, boardUrl))

    } catch (error) {
      logger.error(`Error fetching from ${boardUrl}:`, error)
      throw error
    }
  }

  private isInternshipOrEntryLevel(title: string, content?: string): boolean {
    const title = title.toLowerCase()
    const content = content?.toLowerCase() || ''

    const internshipKeywords = [
      'internship', 'intern', 'co-op', 'co op', 'cooperative education',
      'summer intern', 'fall intern', 'spring intern', 'winter intern'
    ]

    const entryLevelKeywords = [
      'entry level', 'entry-level', 'junior', 'associate', 'recent graduate',
      'new grad', 'recent grad', 'grad', 'early career', 'early career'
    ]

    const hasInternshipKeyword = internshipKeywords.some(keyword =>
      title.includes(keyword) || content.includes(keyword)
    )

    const hasEntryLevelKeyword = entryLevelKeywords.some(keyword =>
      title.includes(keyword) || content.includes(keyword)
    )

    return hasInternshipKeyword || hasEntryLevelKeyword
  }

  private transformJob(job: GreenhouseJob, boardUrl: string): any {
    const companyName = this.extractCompanyNameFromUrl(boardUrl)

    return {
      title: job.title,
      company: companyName,
      location: job.location.name,
      remoteFlag: this.extractRemoteStatus(job.location.name),
      function: this.mapDepartmentToFunction(job.departments),
      sourceUrl: job.absolute_url,
      sourceName: 'Greenhouse',
      atsType: 'greenhouse',
      postedAt: new Date(job.created_at),
      lastVerifiedAt: new Date(job.updated_at),
      content: job.content,
      departments: job.departments?.map(d => d.name) || [],
      offices: job.offices?.map(o => o.name) || [],
      metadata: job.metadata || [],
    }
  }

  private extractCompanyNameFromUrl(boardUrl: string): string {
    // Extract company name from URL like "https://boards.greenhouse.io/airbnb"
    const match = boardUrl.match(/\/([^\/]+)$/)
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'Unknown Company'
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

  private mapDepartmentToFunction(departments?: Array<{ name: string }>): string {
    if (!departments || departments.length === 0) {
      return 'other'
    }

    const departmentName = departments[0].name.toLowerCase()

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
    }

    for (const [key, value] of Object.entries(functionMapping)) {
      if (departmentName.includes(key)) {
        return value
      }
    }

    return 'other'
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}