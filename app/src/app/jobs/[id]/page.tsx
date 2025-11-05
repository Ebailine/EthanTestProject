'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobDetailModal } from '@/components/jobs/JobDetailModal'

interface PageProps {
  params: {
    id: string
  }
}

export default function JobDetailPage({ params }: PageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Open modal when page loads
  useEffect(() => {
    setIsModalOpen(true)
  }, [])

  const handleLaunchOutreach = (jobId: string) => {
    // Redirect to outreach creation page
    if (typeof window !== 'undefined') {
      window.location.href = `/outreach/new?jobId=${jobId}`
    }
  }

  return (
    <>
      {/* Main content - could show a simplified job view */}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Loading Job Details...
            </h1>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        jobId={params.id}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // Optionally redirect back to jobs list
          if (typeof window !== 'undefined') {
            window.location.href = '/jobs'
          }
        }}
        onLaunchOutreach={handleLaunchOutreach}
      />
    </>
  )
}