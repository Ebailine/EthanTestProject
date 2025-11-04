import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobDetailModal } from '@/components/jobs/JobDetailModal'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    // This is a basic implementation - in production you'd fetch the job data
    return {
      title: 'Internship Details | Pathfinder',
      description: 'View detailed information about this internship opportunity and launch personalized outreach campaigns.',
    }
  } catch (error) {
    return {
      title: 'Job Details | Pathfinder',
      description: 'Internship details and outreach opportunities.',
    }
  }
}

export default function JobDetailPage({ params }: PageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Open modal when page loads
  React.useEffect(() => {
    setIsModalOpen(true)
  }, [])

  const handleLaunchOutreach = (jobId: string) => {
    // Redirect to outreach creation page
    window.location.href = `/outreach/new?jobId=${jobId}`
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
          window.location.href = '/jobs'
        }}
        onLaunchOutreach={handleLaunchOutreach}
      />
    </>
  )
}

export async function generateStaticParams({ params }: PageProps) {
  return {
    id: params.id,
  }
}