'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  ExternalLink,
  UserPlus,
  Loader2,
  Bookmark,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  Plus,
  Briefcase,
  TrendingUp,
  Clock,
  Star,
  Mail,
  Users,
  Wand2,
  Sparkles,
  Zap,
  Target,
  Send,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Job, SearchFilters } from '@/types'
import { formatDateShort } from '@/lib/utils'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [launchingBatch, setLaunchingBatch] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const [salaryRange, setSalaryRange] = useState([0, 100])
  const [showSaveDialog, setShowSaveDialog] = useState<string | null>(null)

  // n8n feature modals
  const [showContactFinder, setShowContactFinder] = useState(false)
  const [showAutoApply, setShowAutoApply] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Saved search feature
  const [savedSearches, setSavedSearches] = useState<any[]>([
    { id: '1', name: 'Software Eng SF', filters: { function: ['engineering'], location: 'San Francisco' } },
    { id: '2', name: 'Remote Design', filters: { function: ['design'], remoteFlag: true } },
  ])

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
      setJobs(data.jobs || getMockJobs())
    } catch (error) {
      console.error('Error fetching jobs:', error)
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
    },
    {
      id: '3',
      companyId: '3',
      title: 'Marketing Intern',
      function: 'marketing',
      majorTags: ['Marketing', 'Business'],
      location: 'Austin, TX',
      remoteFlag: true,
      paidFlag: true,
      payInfo: { min: 25, max: 35, currency: 'USD', period: 'hourly' },
      internshipType: 'summer',
      sourceName: 'Workday',
      sourceUrl: 'https://marketco.wd1.myworkdayjobs.com/careers',
      atsType: 'workday',
      postedAt: new Date('2024-01-18'),
      lastVerifiedAt: new Date('2024-01-22'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: {
        id: '3',
        name: 'MarketCo',
        website: 'https://marketco.com',
        domain: 'marketco.com',
        industryTags: ['marketing', 'saas'],
        sizeBand: '201-500',
        hqCity: 'Austin',
        hqState: 'TX',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    {
      id: '4',
      companyId: '4',
      title: 'Data Science Intern',
      function: 'engineering',
      majorTags: ['Data Science', 'Machine Learning'],
      location: 'Seattle, WA',
      remoteFlag: false,
      paidFlag: true,
      payInfo: { min: 50, max: 65, currency: 'USD', period: 'hourly' },
      internshipType: 'summer',
      sourceName: 'Greenhouse',
      sourceUrl: 'https://boards.greenhouse.io/dataco/jobs/5678',
      atsType: 'greenhouse',
      postedAt: new Date('2024-01-12'),
      lastVerifiedAt: new Date('2024-01-20'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: {
        id: '4',
        name: 'DataCo',
        website: 'https://dataco.com',
        domain: 'dataco.com',
        industryTags: ['data', 'ai'],
        sizeBand: '1000+',
        hqCity: 'Seattle',
        hqState: 'WA',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
  ]

  const handleSearch = () => {
    fetchJobs()
  }

  const handleLaunchOutreach = async (jobId: string) => {
    try {
      setLaunchingBatch(jobId)

      const response = await fetch('/api/outreach/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/outreach/${data.batchId}`)
      } else {
        alert(`Failed to launch outreach: ${data.error}`)
        setLaunchingBatch(null)
      }
    } catch (error) {
      console.error('Launch error:', error)
      alert('An error occurred. Please try again.')
      setLaunchingBatch(null)
    }
  }

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs)
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId)
    } else {
      newSaved.add(jobId)
      // Show success feedback
      setTimeout(() => setShowSaveDialog(null), 2000)
    }
    setSavedJobs(newSaved)
  }

  const JobCard = ({ job }: { job: any }) => {
    const isSaved = savedJobs.has(job.id)

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 flex-1">
            {/* Company Logo Placeholder */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building className="w-8 h-8 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{job.title}</h3>
                  <p className="text-gray-600 font-semibold mb-2">{job.Company?.name || job.company?.name}</p>
                </div>
                <button
                  onClick={() => toggleSaveJob(job.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={isSaved ? 'Saved' : 'Save job'}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {job.remoteFlag && <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Remote</span>}
                {job.paidFlag && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">Paid</span>}
                {job.internshipType && <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full capitalize">{job.internshipType}</span>}
                {job.status === 'active' && <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Active</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {job.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              {job.location}
            </div>
          )}
          {job.payInfo && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
              ${job.payInfo.min}-${job.payInfo.max}/{job.payInfo.period}
            </div>
          )}
          {job.postedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              Posted {formatDateShort(job.postedAt)}
            </div>
          )}
          {job.company?.sizeBand && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4 text-gray-400" />
              {job.company.sizeBand} employees
            </div>
          )}
        </div>

        {job.majorTags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.majorTags.map((tag: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <a
            href={job.jobUrl || job.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Job
          </a>
          <button
            onClick={() => handleLaunchOutreach(job.id)}
            disabled={launchingBatch === job.id}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {launchingBatch === job.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Launch Outreach
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Modal components
  const ContactFinderModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Contact Finder</h3>
                <p className="text-blue-100 text-sm">Find hiring managers automatically</p>
              </div>
            </div>
            <button
              onClick={() => setShowContactFinder(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h4 className="text-2xl font-black text-gray-900 mb-2">Coming Soon Q1 2025</h4>
            <p className="text-gray-600 text-lg">AI-powered contact discovery for every job</p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Auto-detect hiring managers</p>
                <p className="text-sm text-gray-600">Find the right person at every company using LinkedIn and public data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Verified email addresses</p>
                <p className="text-sm text-gray-600">Get professional email addresses with 95%+ deliverability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Contact enrichment</p>
                <p className="text-sm text-gray-600">Phone numbers, LinkedIn profiles, and social media links</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Bulk discovery</p>
                <p className="text-sm text-gray-600">Find contacts for hundreds of jobs in seconds</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong className="text-gray-900">Get early access:</strong> Join the waitlist to be the first to try Contact Finder when it launches.
            </p>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const AutoApplyModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Auto-Apply</h3>
                <p className="text-purple-100 text-sm">Apply to jobs automatically</p>
              </div>
            </div>
            <button
              onClick={() => setShowAutoApply(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-purple-600" />
            </div>
            <h4 className="text-2xl font-black text-gray-900 mb-2">Coming Soon Q1 2025</h4>
            <p className="text-gray-600 text-lg">Automate your entire application process</p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Smart form filling</p>
                <p className="text-sm text-gray-600">AI fills out applications using your profile and resume</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Custom cover letters</p>
                <p className="text-sm text-gray-600">Generate tailored cover letters for each position</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">ATS compatibility</p>
                <p className="text-sm text-gray-600">Works with Greenhouse, Lever, Workday, and 50+ ATS platforms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Batch processing</p>
                <p className="text-sm text-gray-600">Apply to 100+ jobs in minutes, not hours</p>
              </div>
            </div>
          </div>

          {/* Demo steps */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h5 className="font-bold text-gray-900 mb-4">How it works:</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-sm text-gray-700">Select jobs you want to apply to</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-sm text-gray-700">AI reviews and fills applications</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-sm text-gray-700">Review and submit with one click</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong className="text-gray-900">Be the first to know:</strong> Get notified when Auto-Apply launches.
            </p>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const AdvancedFiltersModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Advanced Filters</h3>
                <p className="text-indigo-100 text-sm">Find your perfect match with precision</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sliders className="w-10 h-10 text-indigo-600" />
            </div>
            <h4 className="text-2xl font-black text-gray-900 mb-2">Coming Soon Q1 2025</h4>
            <p className="text-gray-600 text-lg">Advanced search with 50+ filter options</p>
          </div>

          {/* Feature categories */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h5 className="font-bold text-gray-900">Company Insights</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Company funding stage</li>
                <li>• Growth trajectory</li>
                <li>• Tech stack match</li>
                <li>• Diversity metrics</li>
                <li>• Work-life balance ratings</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h5 className="font-bold text-gray-900">Team & Culture</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Team size & structure</li>
                <li>• Manager experience</li>
                <li>• Conversion rate to FT</li>
                <li>• Mentorship programs</li>
                <li>• Alumni outcomes</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h5 className="font-bold text-gray-900">Compensation</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Total comp (salary + equity)</li>
                <li>• Signing bonuses</li>
                <li>• Housing stipends</li>
                <li>• Relocation packages</li>
                <li>• Return offer rates</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h5 className="font-bold text-gray-900">Requirements</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• GPA requirements</li>
                <li>• Year in school</li>
                <li>• Required skills</li>
                <li>• Visa sponsorship</li>
                <li>• Security clearance</li>
              </ul>
            </div>
          </div>

          {/* Additional features */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h5 className="font-bold text-gray-900 mb-4">Plus more advanced features:</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Boolean search operators</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Saved filter presets</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Custom field combinations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>AI-powered recommendations</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong className="text-gray-900">Want early access?</strong> Join the waitlist to be among the first to use Advanced Filters.
            </p>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Find Your Dream Internship
          </h1>
          <p className="text-lg text-gray-600">
            {jobs.length} opportunities from top companies • Updated daily
          </p>
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Saved Searches</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => {
                    setFilters(search.filters)
                    fetchJobs()
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  {search.name}
                </button>
              ))}
              <button className="px-4 py-2 bg-white border border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4 inline mr-1" />
                Save Current
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  </div>
                  <button
                    onClick={() => {
                      setFilters({})
                      setSalaryRange([0, 100])
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Function */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Function</label>
                    <div className="space-y-2">
                      {['Engineering', 'Design', 'Product', 'Marketing', 'Data Science'].map((func) => (
                        <label key={func} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.function?.includes(func.toLowerCase())}
                            onChange={(e) => {
                              const current = filters.function || []
                              if (e.target.checked) {
                                setFilters({ ...filters, function: [...current, func.toLowerCase()] })
                              } else {
                                setFilters({ ...filters, function: current.filter(f => f !== func.toLowerCase()) })
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{func}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Location Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.remoteFlag === true}
                          onChange={(e) => setFilters({ ...filters, remoteFlag: e.target.checked ? true : undefined })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">Remote</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">Hybrid</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">In-Office</span>
                      </label>
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Salary ($/hour): ${salaryRange[0]} - ${salaryRange[1]}+
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={salaryRange[0]}
                        onChange={(e) => setSalaryRange([Number(e.target.value), salaryRange[1]])}
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={salaryRange[1]}
                        onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Company Size</label>
                    <div className="space-y-2">
                      {['1-50', '51-200', '201-500', '500+'].map((size) => (
                        <label key={size} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{size} employees</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Paid */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.paidFlag === true}
                        onChange={(e) => setFilters({ ...filters, paidFlag: e.target.checked ? true : undefined })}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Paid Only</span>
                    </label>
                  </div>

                  {/* Posted Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Posted Date</label>
                    <select className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none">
                      <option>Any time</option>
                      <option>Last 24 hours</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/50 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title, company, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <button onClick={handleSearch} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md">
                  Search
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>

                {/* n8n Feature Buttons */}
                <button
                  onClick={() => setShowContactFinder(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Contact Finder
                </button>
                <button
                  onClick={() => setShowAutoApply(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Auto-Apply
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(true)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Advanced Filters
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">{jobs.length} jobs found</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="relevant">Most Relevant</option>
                  <option value="salary">Highest Salary</option>
                  <option value="deadline">Deadline Soon</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 font-semibold">Finding your perfect opportunities...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200/50">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setFilters({})
                    setSearchQuery('')
                    setSalaryRange([0, 100])
                    fetchJobs()
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {showSaveDialog && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
            <Bookmark className="w-5 h-5" />
            <span className="font-semibold">Job saved successfully!</span>
          </div>
        )}

        {/* Modals */}
        {showContactFinder && <ContactFinderModal />}
        {showAutoApply && <AutoApplyModal />}
        {showAdvancedFilters && <AdvancedFiltersModal />}
      </div>
    </div>
  )
}
