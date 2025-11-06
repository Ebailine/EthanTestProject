import axios, { AxiosInstance } from 'axios'
import { logger } from '../lib/logger'

interface USAJobsPosition {
  PositionID: string
  PositionTitle: string
  PositionURI: string
  OrganizationName: string
  DepartmentName: string
  JobGrade: string
  PositionSchedule: Array<{
    Name: string
  }>
  PositionOfferingType: Array<{
    Name: string
  }>
  PositionLocation: Array<{
    CityName: string
    StateCode: string
    CountryCode: string
  }>
  PositionRemuneration: Array<{
    MinimumRange: number
    MaximumRange: number
      RateIntervalCode: string
  }>
  QualificationSummary: string
  PublicationStartDate: string
  ApplicationCloseDate: string
}

interface USAJobsResponse {
  SearchResult: {
    SearchResultCount: number
    SearchResultItems: Array<{
      MatchedObjectId: string
      MatchedObjectDescriptor: USAJobsPosition
    }>
  }
}

export class GovPortalConnector {
  public readonly name = 'Government Portal'
  private http: AxiosInstance
  private apiKey: string

  constructor() {
    this.apiKey = process.env.USAJOBS_API_KEY || ''

    this.http = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Pathfinder-Bot/1.0 ( Educational Job Aggregator )',
        'Authorization-Key': this.apiKey,
      },
    })
  }

  async fetchJobs(): Promise<any[]> {
    logger.info('Fetching jobs from government portals...')

    const allJobs = []

    try {
      // Fetch from USAJOBS
      const usaJobs = await this.fetchFromUSAJobs()
      allJobs.push(...usaJobs)

      // Fetch from other government sources
      const nasaJobs = await this.fetchFromNASA()
      allJobs.push(...nasaJobs)

      const doeJobs = await this.fetchFromDOE()
      allJobs.push(...doeJobs)

    } catch (error) {
      logger.error('Error in government portal fetch:', error)
    }

    return allJobs
  }

  private async fetchFromUSAJobs(): Promise<any[]> {
    if (!this.apiKey) {
      logger.warn('USAJOBS API key not configured, skipping')
      return []
    }

    logger.info('Fetching from USAJOBS...')

    const searchTerms = [
      'internship',
      'student trainee',
      'recent graduate',
      'pathways program',
      'temporary student'
    ]

    const allJobs = []

    for (const term of searchTerms) {
      try {
        const response = await this.http.get<USAJobsResponse>(
          'https://data.usajobs.gov/api/Search',
          {
            params: {
              Keyword: term,
              PositionScheduleCode: [1, 2, 7], // Full-time, Part-time, Intermittent
              HiringPath: ['ST', 'RPL'], // Student, Recent Graduate
              ResultsPerPage: 500,
              Page: 1,
            }
          }
        )

        const jobs = response.data.SearchResult.SearchResultItems
        logger.info(`Found ${jobs.length} jobs for term: ${term}`)

        allJobs.push(...jobs.map(item => this.transformUSAJobsJob(item.MatchedObjectDescriptor)))

        // Rate limiting
        await this.sleep(1000)

      } catch (error) {
        logger.warn(`Error fetching USAJOBS for term ${term}:`, error)
        continue
      }
    }

    return allJobs
  }

  private async fetchFromNASA(): Promise<any[]> {
    logger.info('Fetching from NASA internship portal...')

    try {
      const response = await this.http.get('https://intern.nasa.gov/api/opportunities/')

      // Note: This is a placeholder - actual NASA API would need to be researched
      const opportunities = response.data || []

      return opportunities.filter((opp: any) =>
        opp.title?.toLowerCase().includes('internship') ||
        opp.type?.toLowerCase().includes('internship')
      ).map((opp: any) => this.transformGenericGovJob(opp, 'NASA'))

    } catch (error) {
      logger.warn('Error fetching from NASA:', error)
      return []
    }
  }

  private async fetchFromDOE(): Promise<any[]> {
    logger.info('Fetching from DOE opportunities...')

    try {
      // Note: This is a placeholder - actual DOE API would need to be researched
      const response = await this.http.get('https://www.energy.gov/careers/student-programs/api')

      const opportunities = response.data || []

      return opportunities.filter((opp: any) =>
        opp.title?.toLowerCase().includes('internship') ||
        opp.title?.toLowerCase().includes('student')
      ).map((opp: any) => this.transformGenericGovJob(opp, 'Department of Energy'))

    } catch (error) {
      logger.warn('Error fetching from DOE:', error)
      return []
    }
  }

  private transformUSAJobsJob(job: USAJobsPosition): any {
    const locations = job.PositionLocation.map(loc =>
      `${loc.CityName}, ${loc.StateCode}`.trim()
    ).filter(Boolean).join('; ')

    const isPaid = job.PositionRemuneration.some(rem => rem.MinimumRange > 0)

    return {
      title: job.PositionTitle,
      company: job.OrganizationName,
      location: locations,
      remoteFlag: false, // Government jobs are typically not fully remote
      function: this.mapGovDepartmentToFunction(job.DepartmentName),
      sourceUrl: job.PositionURI,
      sourceName: 'USAJOBS',
      atsType: 'government',
      postedAt: new Date(job.PublicationStartDate),
      lastVerifiedAt: new Date(),
      applicationDeadline: job.ApplicationCloseDate ? new Date(job.ApplicationCloseDate) : null,
      payInfo: isPaid ? {
        min: Math.min(...job.PositionRemuneration.map(r => r.MinimumRange)),
        max: Math.max(...job.PositionRemuneration.map(r => r.MaximumRange || r.MinimumRange)),
        currency: 'USD',
        period: 'annual'
      } : null,
      grade: job.JobGrade,
      department: job.DepartmentName,
      organization: job.OrganizationName,
      schedule: job.PositionSchedule.map(s => s.Name),
      offeringType: job.PositionOfferingType.map(t => t.Name),
      summary: job.QualificationSummary,
      isPaid,
    }
  }

  private transformGenericGovJob(job: any, agency: string): any {
    return {
      title: job.title || job.positionTitle,
      company: agency,
      location: job.location || job.locations?.join('; ') || 'Multiple locations',
      remoteFlag: false,
      function: this.mapGovDepartmentToFunction(job.department || agency),
      sourceUrl: job.url || job.link,
      sourceName: agency,
      atsType: 'government',
      postedAt: job.postedAt ? new Date(job.postedAt) : new Date(),
      lastVerifiedAt: new Date(),
      applicationDeadline: job.deadline ? new Date(job.deadline) : null,
      summary: job.description || job.summary,
      isPaid: job.isPaid !== false, // Default to paid unless specified
    }
  }

  private mapGovDepartmentToFunction(department: string): string {
    const deptName = department.toLowerCase()

    const functionMapping: { [key: string]: string } = {
      'engineering': 'engineering',
      'technology': 'engineering',
      'science': 'engineering',
      'research': 'engineering',
      'it': 'engineering',
      'communications': 'marketing',
      'public affairs': 'marketing',
      'operations': 'operations',
      'administration': 'operations',
      'finance': 'finance',
      'budget': 'finance',
      'human resources': 'other',
      'legal': 'other',
      'policy': 'other',
      'management': 'operations',
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