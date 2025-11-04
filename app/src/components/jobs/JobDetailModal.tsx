'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, DollarSign, Calendar, Building, ExternalLink, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface JobDetailModalProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
  onLaunchOutreach: (jobId: string) => void
}

interface Job {
  id: string
  title: string
  function: string
  majorTags: string[]
  location: string
  remoteFlag: boolean
  paidFlag: boolean
  payInfo?: {
    min: number
    max: number
    currency: string
    period: string
  }
  internshipType?: string
  postedAt: Date
  lastVerifiedAt: Date
  status: string
  company: {
    id: string
    name: string
    website: string
    domain: string
    industryTags: string[]
    sizeBand?: string
    hqCity?: string
    hqState?: string
    sources?: Array<{
      id: string
      type: string
      url: string
      title: string
      publishedAt: Date
    }>
    moments?: Array<{
      id: string
      sourceUrl: string
      quote: string
      label: string
      confidence: number
      summary: string
    }>
    contacts?: Array<{
      id: string
      fullName: string
      title: string
      dept: string
      email: string
      emailConfidence: number
    }>
  }
  hasResearch?: boolean
  hasContacts?: boolean
  researchQuality?: number
  contactCount?: number
  momentCount?: number
  sourceCount?: number
}

interface WorkflowStep {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  description: string
  estimatedTime?: string
}

export function JobDetailModal({ jobId, isOpen, onClose, onLaunchOutreach }: JobDetailModalProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'contacts'>('overview')
  const [showOutreachModal, setShowOutreachModal] = useState(false)

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails()
    }
  }, [isOpen, jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()

      if (data.success) {
        setJob(data.job)
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
              <div className="flex-1">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{job?.title}</h2>
                    <p className="text-lg text-gray-600">{job?.company.name}</p>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex space-x-8">
                {['overview', 'research', 'contacts'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="space-y-6">
                  {/* Loading skeleton for overview tab */}
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && <OverviewTab job={job!} />}
                  {activeTab === 'research' && (
                    <ResearchTab
                      moments={job?.company.moments || []}
                      sources={job?.company.sources || []}
                      researchQuality={job?.researchQuality || 0}
                    />
                  )}
                  {activeTab === 'contacts' && (
                    <ContactsTab
                      contacts={job?.company.contacts || []}
                      hasContacts={job?.hasContacts || false}
                    />
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {job?.hasResearch && (
                  <div className="flex items-center gap-2 text-sm text-success-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Research Quality: {job.researchQuality}%</span>
                  </div>
                )}
                {job?.hasContacts && (
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <Users className="w-4 h-4" />
                    <span>{job.contactCount} contacts found</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <a
                  href={job?.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply on {job?.atsType === 'greenhouse' ? 'Greenhouse' : 'Lever'}
                </a>
                <button
                  onClick={() => {
                    if (job) {
                      if (job.hasResearch && job.hasContacts) {
                        setShowOutreachModal(true)
                      } else {
                        onLaunchOutreach(job.id)
                      }
                    }
                  }}
                  className="btn-primary"
                  disabled={!job?.hasResearch || !job?.hasContacts}
                >
                  Launch Outreach
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Preparation Modal */}
      {showOutreachModal && job && (
        <OutreachPreparationModal
          job={job}
          isOpen={showOutreachModal}
          onClose={() => setShowOutreachModal(false)}
          onLaunch={() => onLaunchOutreach(job.id)}
        />
      )}
    </>
  )
}

function OverviewTab({ job }: { job: Job }) {
  return (
    <div className="space-y-6">
      {/* Key Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{job.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Compensation</p>
            <p className="font-medium">
              {job.payInfo
                ? `$${job.payInfo.min}-${job.payInfo.max}/${job.payInfo.period}`
                : 'Not disclosed'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium capitalize">{job.internshipType || 'Internship'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Function</p>
            <p className="font-medium capitalize">{job.function}</p>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Relevant Majors</h3>
        <div className="flex flex-wrap gap-2">
          {job.majorTags.map((tag) => (
            <span key={tag} className="badge-primary">{tag}</span>
          ))}
        </div>
      </div>

      {/* Remote/Paid Tags */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Position Details</h3>
        <div className="flex flex-wrap gap-2">
          {job.remoteFlag && <span className="badge-success">🌐 Remote Available</span>}
          {job.paidFlag && <span className="badge-warning">💰 Paid Position</span>
          {job.status === 'active' && <span className="badge-primary">✅ Accepting Applications</span>}
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">About {job.company.name}</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {job.company.website && (
            <p className="text-sm text-gray-600">
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {job.company.website}
              </a>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {job.company.industryTags.map((tag) => (
              <span key={tag} className="badge-secondary">{tag}</span>
            ))}
          </div>

          {job.company.sizeBand && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Company Size:</span>
              <span className="font-medium">{job.company.sizeBand}</span>
            </div>
          )}

          {job.company.hqCity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Headquarters:</span>
              <span className="font-medium">{job.company.hqCity}, {job.company.hqState}</span>
            </div>
          )}
        </div>
      </div>

      {/* Posted Information */}
      <div className="text-sm text-gray-500">
        Posted {new Date(job.postedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} • Last verified {new Date(job.lastVerifiedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  )
}

function ResearchTab({ moments, sources, researchQuality }: {
  moments: any[];
  sources: any[];
  researchQuality: number
}) {
  return (
    <div className="space-y-6">
      {/* Research Quality Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Research Quality</h4>
            <p className="text-sm text-blue-700">Based on data quality and confidence scores</p>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {researchQuality}%
          </div>
        </div>
      </div>

      {/* Key Moments */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Key Company Insights</h3>
        {moments.length > 0 ? (
          <div className="space-y-4">
            {moments.map((moment, index) => (
              <div key={moment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className={`badge ${
                    moment.label === 'hiring' ? 'badge-success' :
                    moment.label === 'mission' ? 'badge-primary' :
                    moment.label === 'metric' ? 'badge-warning' :
                    moment.label === 'plan' ? 'badge-info' :
                    'badge-secondary'
                  }`}>
                    {moment.label}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Confidence: {Math.round(Number(moment.confidence) * 100)}%</span>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic mb-2 border-l-2 border-gray-300 pl-4">
                  "{moment.quote}"
                </blockquote>

                <p className="text-sm text-gray-600 mb-2">{moment.summary}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Why it matters:</span>
                  <span className="text-xs text-gray-600 font-medium">{moment.why_it_matters}</span>
                </div>

                {moment.sourceUrl && (
                  <a
                    href={moment.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                  >
                    View source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Research Available</h4>
            <p className="text-gray-500 mb-4">Research will be available when you launch an outreach campaign</p>
            <p className="text-sm text-gray-600">This helps us find concrete facts for personalized outreach emails</p>
          </div>
        )}
      </div>

      {/* Research Sources */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Data Sources</h3>
        {sources.length > 0 ? (
          <div className="space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{source.title || 'Untitled'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="capitalize">{source.type}</span>
                    {source.publishedAt && (
                      <span>{new Date(source.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No sources processed yet</p>
        )}
      </div>
    </div>
  )
}

function ContactsTab({ contacts, hasContacts }: { contacts: any[]; hasContacts: boolean }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Contact Information</h4>
            <p className="text-sm text-blue-700">
              {hasContacts
                ? `We found ${contacts.length} verified contacts for targeted outreach`
                : `Contact research will be available when you launch an outreach campaign`
              }
            </p>
          </div>
          {hasContacts && (
            <div className="text-2xl font-bold text-blue-900">{contacts.length}</div>
          )}
        </div>
      </div>

      {hasContacts && contacts.length > 0 ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            We'll select 5 contacts with the optimal mix: HR/recruiting, team members, and verified email addresses.
          </p>

          <div className="space-y-3">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{contact.fullName}</p>
                    <p className="text-sm text-gray-600">{contact.title}</p>
                    <span className={`badge mt-2 ${
                      contact.dept === 'Recruiting' ? 'badge-primary' :
                      contact.dept === 'Team' ? 'badge-success' :
                      'badge-secondary'
                    }`}>
                      {contact.dept}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Email confidence</p>
                    <p className="text-sm font-medium text-gray-900">
                      {Math.round(Number(contact.emailConfidence) * 100)}%
                    </p>
                  </div>
                </div>

                {contact.email && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Email (masked for privacy):</p>
                    <p className="text-sm font-mono text-gray-700">
                      {contact.email.substring(0, 2)}***@{contact.email.split('@')[1]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {contacts.length > 5 && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">
                +{contacts.length - 5} more contacts available for outreach
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Contacts Available</h4>
          <p className="text-gray-500 mb-4">Contact research will begin when you launch outreach</p>
          <p className="text-sm text-gray-600">This ensures you reach the right people with verified contact information</p>
        </div>
      )}

      {/* Contact Selection Strategy */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Contact Strategy</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-600">2x</span>
            <span>HR/Recruiting contacts (prioritize university roles)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">1x</span>
            <span>Lead recruiter or hiring manager if available</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">2x</span>
            <span>Team members or adjacent team members</span>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          All contacts require email confidence ≥ 70% for selection
        </p>
      </div>
    </div>
  )
}

function OutreachPreparationModal({
  job,
  isOpen,
  onClose,
  onLaunch
}: {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onLaunch: () => void
}) {
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLaunch = async () => {
    try {
      setLaunching(true)
      setError(null)
      await onLaunch()
      onClose()
    } catch (error) {
      setError('Failed to launch outreach. Please try again.')
    } finally {
      setLaunching(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="text-lg font-bold text-primary-900">Ready to Launch Outreach</h3>
                <p className="text-sm text-primary-700">
                  Your research and contact information is ready!
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">{job.title}</h4>
              <p className="text-sm text-gray-600">{job.company.name}</p>
              <p className="text-xs text-gray-500">{job.location}</p>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-sm text-error-600">{error}</p>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Research completed with {job.researchQuality}% quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{job.contactCount} verified contacts found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Email templates ready for review</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={launching}
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              className="btn-primary"
              disabled={launching}
            >
              {launching ? 'Launching...' : 'Launch Outreach'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}