'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  User,
  MapPin,
  Linkedin,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  ArrowLeft,
} from 'lucide-react'

export default function OutreachStatusPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.id as string

  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()

    // Poll every 2 seconds while pending
    const interval = setInterval(() => {
      if (
        batch?.status === 'pending' ||
        batch?.status === 'finding_contacts' ||
        batch?.status === 'researching' ||
        batch?.status === 'drafting_emails'
      ) {
        fetchStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [batchId, batch?.status])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/outreach/${batchId}/status`)
      const data = await response.json()

      if (data.success) {
        setBatch(data.batch)
        setError(null)
      } else {
        setError(data.error)
      }
      setLoading(false)
    } catch (err) {
      setError('Failed to load outreach status')
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Email copied to clipboard!')
  }

  if (loading && !batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading outreach campaign...</p>
        </div>
      </div>
    )
  }

  if (error && !batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Campaign</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/jobs" className="btn-primary inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const isComplete = batch?.status === 'completed'
  const isFailed = batch?.status === 'failed'
  const isRunning = !isComplete && !isFailed

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/jobs"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Outreach Campaign: {batch?.job.title}
          </h1>
          <p className="text-gray-600">{batch?.job.company.name}</p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isFailed
                  ? 'Campaign Failed'
                  : isComplete
                  ? 'Campaign Complete!'
                  : 'Processing...'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{batch?.currentStep || 'Initializing...'}</p>
            </div>

            <div className="text-right">
              {isComplete && <CheckCircle className="w-8 h-8 text-green-600" />}
              {isFailed && <XCircle className="w-8 h-8 text-red-600" />}
              {isRunning && <Loader2 className="w-8 h-8 animate-spin text-primary-600" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isFailed ? 'bg-red-600' : isComplete ? 'bg-green-600' : 'bg-primary-600'
              }`}
              style={{ width: `${batch?.progress || 0}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {batch?.totalContactsFound || 0}
              </div>
              <div className="text-sm text-gray-600">Contacts Found</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {batch?.totalContactsEnriched || 0}
              </div>
              <div className="text-sm text-gray-600">Profiles Researched</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {batch?.totalEmailsDrafted || 0}
              </div>
              <div className="text-sm text-gray-600">Emails Drafted</div>
            </div>
          </div>

          {isFailed && batch?.errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error: {batch.errorMessage}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {batch?.results && batch.results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Found Contacts & Personalized Emails
            </h2>

            {batch.results.map((result: any, index: number) => (
              <div key={result.contact.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Contact Card */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {result.contact.photoUrl ? (
                        <img
                          src={result.contact.photoUrl}
                          alt={result.contact.fullName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-primary-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {result.contact.fullName}
                      </h3>
                      <p className="text-gray-600 mb-2">{result.contact.title}</p>

                      <div className="flex flex-wrap gap-3 text-sm">
                        {result.contact.email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{result.contact.email}</span>
                            {result.contact.emailConfidence && (
                              <span
                                className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                  result.contact.emailConfidence > 0.8
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {Math.round(result.contact.emailConfidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                        )}

                        {result.contact.location && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{result.contact.location}</span>
                          </div>
                        )}

                        {result.contact.linkedinUrl && (
                          <a
                            href={result.contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                          >
                            <Linkedin className="w-4 h-4" />
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Research Summary */}
                      {result.contact.researchSummary && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                            View Research Summary
                          </summary>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-line">
                            {result.contact.researchSummary}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Draft */}
                {result.email && (
                  <div className="p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Personalized Email Draft
                      </h4>
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        AI Generated
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-4 space-y-4">
                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject:
                        </label>
                        <input
                          type="text"
                          value={result.email.subject}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Body:
                        </label>
                        <textarea
                          value={result.email.body}
                          readOnly
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                        />
                      </div>

                      {/* Personalizations */}
                      {result.email.personalizations && (
                        <details>
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                            View Personalization Details
                          </summary>
                          <div className="mt-2 p-4 bg-primary-50 rounded-lg space-y-2 text-sm">
                            {Object.entries(result.email.personalizations).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium text-primary-900">{key}:</span>{' '}
                                <span className="text-primary-700">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => copyToClipboard(result.email.body)}
                          className="btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Email
                        </button>
                        <button
                          onClick={() => alert('Email sending will be available in Phase 2')}
                          className="btn-primary flex-1"
                          disabled
                        >
                          Send Email (Coming Soon)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {isComplete && (
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/jobs" className="btn-secondary">
              Find More Jobs
            </Link>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Run Another Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
