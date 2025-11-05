import { JobNormalizer } from '../src/normalizer'

describe('JobNormalizer', () => {
  let normalizer: JobNormalizer

  beforeEach(() => {
    normalizer = new JobNormalizer()
  })

  it('removes duplicate jobs', async () => {
    const jobs = [
      {
        title: 'Software Engineer Intern',
        company: 'TechCo',
        location: 'SF',
        remoteFlag: false,
        function: 'engineering',
        sourceUrl: 'http://example.com/1',
        sourceName: 'Test',
        atsType: 'greenhouse',
        postedAt: new Date(),
        lastVerifiedAt: new Date()
      },
      {
        title: 'Software Engineer Intern',
        company: 'TechCo',
        location: 'SF',
        remoteFlag: false,
        function: 'engineering',
        sourceUrl: 'http://example.com/2',
        sourceName: 'Test',
        atsType: 'lever',
        postedAt: new Date(),
        lastVerifiedAt: new Date()
      }
    ]

    const normalized = await normalizer.normalize(jobs)
    expect(normalized).toHaveLength(1)
  })

  it('normalizes company names correctly', async () => {
    const jobs = [
      {
        title: 'Test Job',
        company: 'The Google Inc.',
        location: 'SF',
        remoteFlag: false,
        function: 'engineering',
        sourceUrl: 'http://example.com/1',
        sourceName: 'Test',
        atsType: 'greenhouse',
        postedAt: new Date(),
        lastVerifiedAt: new Date()
      }
    ]

    const normalized = await normalizer.normalize(jobs)
    expect(normalized[0].company.name).toBe('Google Inc.')
  })
})
