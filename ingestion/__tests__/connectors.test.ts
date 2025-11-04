import { GreenhouseConnector } from '../src/connectors/greenhouse'
import { LeverConnector } from '../src/connectors/lever'
import { GovPortalConnector } from '../src/connectors/gov-portal'

// Mock axios
jest.mock('axios')
import axios from 'axios'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Job Connectors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GreenhouseConnector', () => {
    let connector: GreenhouseConnector

    beforeEach(() => {
      connector = new GreenhouseConnector()
    })

    it('initializes with correct configuration', () => {
      expect(connector['name']).toBe('Greenhouse')
    })

    it('filters internships correctly', () => {
      const mockJobs = [
        {
          id: 123,
          title: 'Software Engineering Intern',
          absolute_url: 'https://boards.greenhouse.io/techco/jobs/123',
          location: { name: 'San Francisco, CA' },
          departments: [{ name: 'Engineering' }],
          updated_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: 456,
          title: 'Senior Software Engineer',
          absolute_url: 'https://boards.greenhouse.io/techco/jobs/456',
          location: { name: 'San Francisco, CA' },
          departments: [{ name: 'Engineering' }],
          updated_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-10T10:00:00Z'
        }
      ]

      const mockResponse = { jobs: mockJobs }
      ;(mockedAxios.get as jest.Mock).mockResolvedValue({ data: mockResponse })

      const result = connector['isInternshipOrEntryLevel']('Software Engineering Intern', '')
      const result2 = connector['isInternshipOrEntryLevel']('Senior Software Engineer', '')

      expect(result).toBe(true)
      expect(result2).toBe(false)
    })

    it('extracts remote status correctly', () => {
      expect(connector['extractRemoteStatus']('Remote')).toBe(true)
      expect(connector['extractRemoteStatus']('San Francisco, CA')).toBe(false)
      expect(connector['extractRemoteStatus']('Work from Home')).toBe(true)
      expect(connector['extractRemoteStatus']('Hybrid (2 days in office)')).toBe(true)
    })

    it('maps departments to functions correctly', () => {
      expect(connector['mapDepartmentToFunction']([{ name: 'Engineering' }])).toBe('engineering')
      expect(connector['mapDepartmentToFunction']([{ name: 'Product' }])).toBe('product')
      expect(connector['mapDepartmentToFunction']([{ name: 'Design' }])).toBe('design')
      expect(connector['mapDepartmentToFunction']([{ name: 'Unknown' }])).toBe('other')
    })

    it('transforms job data correctly', () => {
      const mockJob = {
        id: 123,
        title: 'Software Engineering Intern',
        absolute_url: 'https://boards.greenhouse.io/techco/jobs/123',
        location: { name: 'San Francisco, CA' },
        departments: [{ name: 'Engineering' }],
        updated_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-10T10:00:00Z',
        content: 'We are looking for interns...'
      }

      const result = connector['transformJob'](mockJob, 'https://boards.greenhouse.io/techco')

      expect(result.title).toBe('Software Engineering Intern')
      expect(result.company).toBe('Techco')
      expect(result.sourceName).toBe('Greenhouse')
      expect(result.atsType).toBe('greenhouse')
      expect(result.function).toBe('engineering')
    })
  })

  describe('LeverConnector', () => {
    let connector: LeverConnector

    beforeEach(() => {
      connector = new LeverConnector()
    })

    it('initializes with correct configuration', () => {
      expect(connector['name']).toBe('Lever')
    })

    it('filters internships correctly', () => {
      const result1 = connector['isInternshipOrEntryLevel']('Product Design Intern', '')
      const result2 = connector['isInternshipOrEntryLevel']('Senior Product Manager', '')

      expect(result1).toBe(true)
      expect(result2).toBe(false)
    })

    it('maps departments to functions correctly', () => {
      expect(connector['mapDepartmentToFunction']('engineering')).toBe('engineering')
      expect(connector['mapDepartmentToFunction']('product')).toBe('product')
      expect(connector['mapDepartmentToFunction']('data science')).toBe('engineering')
      expect(connector['mapDepartmentToFunction']('unknown')).toBe('other')
    })
  })

  describe('GovPortalConnector', () => {
    let connector: GovPortalConnector

    beforeEach(() => {
      connector = new GovPortalConnector()
    })

    it('initializes with correct configuration', () => {
      expect(connector['name']).toBe('Government Portal')
    })

    it('maps government departments to functions correctly', () => {
      expect(connector['mapGovDepartmentToFunction']('Engineering and Technology')).toBe('engineering')
      expect(connector['mapGovDepartmentToFunction']('Communications and Public Affairs')).toBe('marketing')
      expect(connector['mapGovDepartmentToFunction']('Budget and Finance')).toBe('finance')
      expect(connector['mapGovDepartmentToFunction']('Unknown Department')).toBe('other')
    })

    it('transforms USAJobs data correctly', () => {
      const mockJob = {
        PositionID: '123456',
        PositionTitle: 'Student Trainee (Engineering)',
        PositionURI: 'https://www.usajobs.gov/GetJob/ViewDetails/123456',
        OrganizationName: 'Department of Technology',
        DepartmentName: 'Technology Services',
        PositionLocation: [{ CityName: 'Washington', StateCode: 'DC' }],
        PositionRemuneration: [{ MinimumRange: 15, MaximumRange: 20, RateIntervalCode: 'PH' }],
        QualificationSummary: 'Student internship position...',
        PublicationStartDate: '2024-01-15',
        ApplicationCloseDate: '2024-02-15'
      }

      const result = connector['transformUSAJobsJob'](mockJob)

      expect(result.title).toBe('Student Trainee (Engineering)')
      expect(result.company).toBe('Department of Technology')
      expect(result.sourceName).toBe('USAJOBS')
      expect(result.atsType).toBe('government')
      expect(result.payInfo?.min).toBe(15)
      expect(result.payInfo?.max).toBe(20)
      expect(result.payInfo?.period).toBe('hourly')
    })
  })

  describe('Connector Integration', () => {
    it('handles API errors gracefully', async () => {
      const connector = new GreenhouseConnector()
      ;(mockedAxios.get as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(connector.fetchJobs()).rejects.toThrow()
    })

    it('processes multiple boards', async () => {
      const connector = new GreenhouseConnector()

      const mockResponse = { data: { jobs: [] } }
      ;(mockedAxios.get as jest.Mock).mockResolvedValue(mockResponse)

      await connector.fetchJobs()

      // Should call multiple board URLs
      expect(mockedAxios.get).toHaveBeenCalledTimes(expect.any(Number))
    })
  })
})