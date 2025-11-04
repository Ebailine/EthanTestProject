'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, DollarSign, Calendar, Building, ExternalLink, UserPlus } from 'lucide-react'
import { Job, SearchFilters } from '@/types'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters, query: searchQuery }),
      })

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      // For demo purposes, show some mock data
      setJobs(getMockJobs())
    } finally {
      setLoading(false)
    }
  }

  const getMockJobs = (): Job[] => [
    {
      id: '1',
      companyId: '1',
      title: 'Software Engineering Intern',
      function: 'engineering',
      majorTags: ['Computer Science', 'Software Engineering'],
      location: 'San Francisco, CA',
      remoteFlag: true,
      paidFlag: true,
      payInfo: { min: 45, max: 60, currency: 'USD', period: 'hourly' },
      internshipType: 'summer',
      sourceName: 'Greenhouse',
      sourceUrl: 'https://boards.greenhouse.io/techco/jobs/1234',
      atsType: 'greenhouse',
      postedAt: new Date('2024-01-15'),
      lastVerifiedAt: new Date('2024-01-20'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: {
        id: '1',
        name: 'TechCorp',
        website: 'https://techcorp.com',
        domain: 'techcorp.com',
        industryTags: ['technology', 'software'],
        sizeBand: '500+',
        hqCity: 'San Francisco',
        hqState: 'CA',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    {
      id: '2',
      companyId: '2',
      title: 'Product Design Intern',
      function: 'design',
      majorTags: ['Design', 'UX/UI'],
      location: 'New York, NY',
      remoteFlag: false,
      paidFlag: true,
      payInfo: { min: 35, max: 50, currency: 'USD', period: 'hourly' },
      internshipType: 'summer',
      sourceName: 'Lever',
      sourceUrl: 'https://jobs.lever.co/designco/5678',
      atsType: 'lever',
      postedAt: new Date('2024-01-10'),
      lastVerifiedAt: new Date('2024-01-18'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: {
        id: '2',
        name: 'DesignCo',
        website: 'https://designco.com',
        domain: 'designco.com',
        industryTags: ['design', 'creative'],
        sizeBand: '51-200',
        hqCity: 'New York',
        hqState: 'NY',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  ]

  const handleSearch = () => {
    fetchJobs()
  }

  const JobCard = ({ job }: { job: Job }) => (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-gray-600 mb-2">{job.company?.name}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {job.function && <span className="badge-secondary">{job.function}</span>}
            {job.internshipType && <span className="badge-primary">{job.internshipType}</span>}
            {job.remoteFlag && <span className="badge-success">Remote</span>}
            {job.paidFlag && <span className="badge-warning">💰 Paid</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Posted {job.postedAt?.toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Verified {job.lastVerifiedAt?.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        {job.payInfo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            {job.payInfo.currency} {job.payInfo.min}-{job.payInfo.max}/{job.payInfo.period}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {job.majorTags.join(', ')}
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Apply Now
        </a>
        <button className="btn-primary text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Launch Outreach
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Dream Internship
          </h1>
          <p className="text-lg text-gray-600">
            Discover opportunities from top companies with smart filtering and research-backed outreach.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, company, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button onClick={handleSearch} className="btn-primary">
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            {['Engineering', 'Design', 'Product', 'Marketing'].map((func) => (
              <button
                key={func}
                onClick={() => setFilters({ ...filters, function: [func.toLowerCase()] })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.function?.includes(func.toLowerCase())
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {func}
              </button>
            ))}
            <button
              onClick={() => setFilters({ ...filters, remoteFlag: !filters.remoteFlag })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.remoteFlag
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Remote Only
            </button>
            <button
              onClick={() => setFilters({ ...filters, paidFlag: !filters.paidFlag })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.paidFlag
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paid Only
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading opportunities...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Found {jobs.length} opportunities
                </h2>
                <select className="input-field max-w-xs">
                  <option>Most Recent</option>
                  <option>Most Relevant</option>
                  <option>Deadline Soon</option>
                </select>
              </div>

              <div className="grid gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setFilters({})
                  setSearchQuery('')
                  fetchJobs()
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}