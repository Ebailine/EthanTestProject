import axios, { AxiosInstance } from 'axios'

interface ApolloContact {
  id: string
  first_name: string
  last_name: string
  name: string
  title: string
  email: string | null
  email_status: 'verified' | 'guessed' | 'unavailable' | null
  linkedin_url: string | null
  photo_url: string | null
  organization: {
    name: string
    website_url: string
  } | null
  headline: string | null
  city: string | null
  state: string | null
  country: string | null
  seniority: string | null
  departments: string[]
}

interface ApolloSearchParams {
  companyDomain: string
  companyName: string
  titles?: string[]
  seniorityLevels?: string[]
  limit?: number
}

export class ApolloService {
  private client: AxiosInstance
  private readonly MAX_RETRIES = 3
  private readonly TIMEOUT = 30000

  constructor() {
    const apiKey = process.env.APOLLO_API_KEY
    if (!apiKey) {
      throw new Error('APOLLO_API_KEY not configured in environment')
    }

    this.client = axios.create({
      baseURL: 'https://api.apollo.io/v1',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: this.TIMEOUT,
    })
  }

  async findHiringContacts(params: ApolloSearchParams): Promise<ApolloContact[]> {
    const {
      companyDomain,
      companyName,
      titles = [
        'recruiter',
        'talent acquisition',
        'hiring manager',
        'hr manager',
        'people operations',
        'talent partner',
        'sourcer',
        'recruitment coordinator',
      ],
      seniorityLevels = ['senior', 'manager', 'director', 'vp', 'c_suite'],
      limit = 10,
    } = params

    console.log(`🔍 Searching Apollo for hiring contacts at ${companyName}...`)

    try {
      const response = await this.client.post(
        '/mixed_people/search',
        {
          organization_domains: [companyDomain],
          person_titles: titles,
          person_seniorities: seniorityLevels,
          contact_email_status: ['verified', 'guessed'],
          page: 1,
          per_page: limit,
          reveal_personal_emails: true,
        },
        {
          timeout: this.TIMEOUT,
        }
      )

      const contacts = response.data.people || []
      console.log(`✅ Found ${contacts.length} contacts from Apollo`)

      return contacts
    } catch (error: any) {
      console.error('❌ Apollo API error:', error.response?.data || error.message)

      if (error.response?.status === 429) {
        throw new Error('Apollo API rate limit exceeded. Please wait and try again.')
      }

      if (error.response?.status === 401) {
        throw new Error('Invalid Apollo API key. Please check your configuration.')
      }

      throw new Error(`Failed to fetch contacts from Apollo: ${error.message}`)
    }
  }

  async enrichContact(params: {
    firstName: string
    lastName: string
    companyDomain: string
  }): Promise<ApolloContact | null> {
    console.log(`🔍 Enriching contact: ${params.firstName} ${params.lastName}...`)

    try {
      const response = await this.client.post('/people/match', {
        first_name: params.firstName,
        last_name: params.lastName,
        organization_name: params.companyDomain,
        reveal_personal_emails: true,
      })

      return response.data.person || null
    } catch (error: any) {
      console.error('❌ Apollo enrichment error:', error.response?.data || error.message)
      return null
    }
  }

  async verifyEmail(email: string): Promise<{
    status: 'valid' | 'invalid' | 'unknown'
    confidence: number
  }> {
    try {
      const response = await this.client.post('/emailer_campaigns/email_status', {
        email,
      })

      const data = response.data
      return {
        status: data.email_status === 'verified' ? 'valid' : data.email_status === 'invalid' ? 'invalid' : 'unknown',
        confidence: data.email_status === 'verified' ? 0.95 : data.email_status === 'guessed' ? 0.70 : 0.30,
      }
    } catch (error) {
      return { status: 'unknown', confidence: 0.5 }
    }
  }
}

export const apolloService = new ApolloService()
