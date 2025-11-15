'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  StickyNote,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react'

type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'accepted' | 'rejected'

interface Application {
  id: string
  company: string
  position: string
  status: ApplicationStatus
  salary?: string
  location: string
  appliedDate: string
  nextAction?: string
  notes: string[]
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  interviewCount?: number
}

const initialApplications: Application[] = [
  {
    id: '1',
    company: 'Meta',
    position: 'Software Engineer Intern',
    status: 'interviewing',
    salary: '$55/hr',
    location: 'Menlo Park, CA',
    appliedDate: '2025-01-10',
    nextAction: 'Technical interview on Jan 20',
    notes: ['Really excited about this one', 'Met the hiring manager at career fair'],
    tags: ['Big Tech', 'High Priority'],
    priority: 'high',
    interviewCount: 2,
  },
  {
    id: '2',
    company: 'Stripe',
    position: 'Product Design Intern',
    status: 'offer',
    salary: '$50/hr',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-05',
    nextAction: 'Respond to offer by Jan 25',
    notes: ['Offer received!', '$5k signing bonus', 'Housing stipend included'],
    tags: ['Fintech', 'Design'],
    priority: 'high',
    interviewCount: 4,
  },
  {
    id: '3',
    company: 'Google',
    position: 'SWE Intern',
    status: 'applied',
    salary: '$60/hr',
    location: 'Mountain View, CA',
    appliedDate: '2025-01-12',
    notes: ['Applied through referral'],
    tags: ['Big Tech', 'Referral'],
    priority: 'high',
  },
  {
    id: '4',
    company: 'Airbnb',
    position: 'Data Science Intern',
    status: 'interviewing',
    salary: '$52/hr',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-08',
    nextAction: 'Final round on Jan 18',
    notes: ['Case study presentation required'],
    tags: ['Data Science', 'Travel'],
    priority: 'medium',
    interviewCount: 3,
  },
  {
    id: '5',
    company: 'Notion',
    position: 'Product Manager Intern',
    status: 'applied',
    salary: '$48/hr',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-14',
    notes: ['Love the product!'],
    tags: ['PM', 'SaaS'],
    priority: 'medium',
  },
  {
    id: '6',
    company: 'Databricks',
    position: 'ML Engineer Intern',
    status: 'interviewing',
    salary: '$58/hr',
    location: 'Remote',
    appliedDate: '2025-01-07',
    nextAction: 'Coding challenge due Jan 17',
    notes: ['Remote position', 'ML focus - perfect fit'],
    tags: ['Machine Learning', 'Remote'],
    priority: 'high',
    interviewCount: 1,
  },
  {
    id: '7',
    company: 'Figma',
    position: 'Design Intern',
    status: 'rejected',
    salary: '$45/hr',
    location: 'San Francisco, CA',
    appliedDate: '2024-12-20',
    notes: ['Rejected after portfolio review', 'Reapply next year'],
    tags: ['Design', 'Tools'],
    priority: 'low',
  },
  {
    id: '8',
    company: 'OpenAI',
    position: 'Research Intern',
    status: 'applied',
    salary: '$65/hr',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-15',
    notes: ['Dream position!', 'PhD students preferred but worth a shot'],
    tags: ['AI', 'Research'],
    priority: 'high',
  },
  {
    id: '9',
    company: 'Snowflake',
    position: 'Data Engineering Intern',
    status: 'interviewing',
    salary: '$50/hr',
    location: 'San Mateo, CA',
    appliedDate: '2025-01-06',
    nextAction: 'System design interview on Jan 19',
    notes: ['Interviewer was super friendly'],
    tags: ['Data', 'Cloud'],
    priority: 'medium',
    interviewCount: 2,
  },
  {
    id: '10',
    company: 'Roblox',
    position: 'Game Developer Intern',
    status: 'applied',
    salary: '$47/hr',
    location: 'San Mateo, CA',
    appliedDate: '2025-01-11',
    notes: ['Applied through university portal'],
    tags: ['Gaming', 'Engineering'],
    priority: 'low',
  },
  {
    id: '11',
    company: 'Salesforce',
    position: 'Software Engineer Intern',
    status: 'accepted',
    salary: '$48/hr',
    location: 'San Francisco, CA',
    appliedDate: '2024-12-15',
    notes: ['Accepted! Starting June 1st', 'Backup option if Stripe/Meta fall through'],
    tags: ['Enterprise', 'CRM'],
    priority: 'medium',
  },
  {
    id: '12',
    company: 'Uber',
    position: 'Product Manager Intern',
    status: 'rejected',
    salary: '$50/hr',
    location: 'San Francisco, CA',
    appliedDate: '2024-12-18',
    notes: ['No response after final round', 'Move on'],
    tags: ['PM', 'Mobility'],
    priority: 'low',
  },
]

const columns: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-purple-500' },
  { id: 'offer', title: 'Offer Received', color: 'bg-green-500' },
  { id: 'accepted', title: 'Accepted', color: 'bg-emerald-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-gray-500' },
]

function ApplicationCard({ application }: { application: Application }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColors = {
    low: 'border-l-gray-400',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${priorityColors[application.priority]} hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3`}
    >
      {/* Company header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {application.company[0]}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{application.company}</h4>
              <p className="text-xs text-gray-600">{application.position}</p>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        {application.salary && (
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <DollarSign className="w-3.5 h-3.5 text-green-600" />
            <span className="font-semibold">{application.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5" />
          <span>{application.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
        </div>
        {application.interviewCount !== undefined && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5" />
            <span>{application.interviewCount} interview{application.interviewCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Next action */}
      {application.nextAction && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900 font-medium">{application.nextAction}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {application.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {application.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {application.notes.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <StickyNote className="w-3.5 h-3.5" />
          <span>{application.notes.length} note{application.notes.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  )
}

function Column({
  column,
  applications,
}: {
  column: { id: ApplicationStatus; title: string; color: string }
  applications: Application[]
}) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Column header */}
      <div className="bg-white rounded-t-2xl p-4 border-t-4 border-t-transparent" style={{ borderTopColor: column.color.replace('bg-', '') }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <h3 className="font-bold text-gray-900">{column.title}</h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-semibold">
              {applications.length}
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column content */}
      <div className="bg-gray-50 rounded-b-2xl p-4 min-h-[600px] max-h-[calc(100vh-300px)] overflow-y-auto">
        <SortableContext items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No applications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CRMPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeApp = applications.find((app) => app.id === active.id)
    if (!activeApp) return

    // Determine which column the card was dropped in
    const overColumn = columns.find((col) =>
      applications
        .filter((app) => app.status === col.id)
        .some((app) => app.id === over.id)
    )

    if (overColumn && activeApp.status !== overColumn.id) {
      setApplications((apps) =>
        apps.map((app) =>
          app.id === active.id ? { ...app, status: overColumn.id } : app
        )
      )
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // Calculate stats
  const stats = {
    total: applications.length,
    applied: applications.filter((app) => app.status === 'applied').length,
    interviewing: applications.filter((app) => app.status === 'interviewing').length,
    offers: applications.filter((app) => app.status === 'offer').length,
    accepted: applications.filter((app) => app.status === 'accepted').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
    conversionRate: applications.length > 0
      ? Math.round(
          ((applications.filter((app) => app.status === 'offer' || app.status === 'accepted').length) /
            applications.length) *
            100
        )
      : 0,
    avgTimeToOffer: '18 days', // Mock data
  }

  // Filter applications by search
  const filteredApplications = searchQuery
    ? applications.filter(
        (app) =>
          app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.position.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : applications

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1800px] mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">Application CRM</h1>
                <p className="text-gray-600">Track and manage your internship applications</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Application
              </button>
            </div>

            {/* Search and filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies or positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats sidebar and Kanban board */}
        <div className="max-w-[1800px] mx-auto px-8 py-8">
          <div className="flex gap-8">
            {/* Stats sidebar */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Overview</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Applications</span>
                      <span className="text-2xl font-black text-gray-900">{stats.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">Applied</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats.applied}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-gray-700">Interviewing</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats.interviewing}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">Offers</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats.offers}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-gray-700">Accepted</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats.accepted}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <span className="text-sm text-gray-700">Rejected</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats.rejected}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">Success Rate</span>
                      </div>
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {stats.conversionRate}%
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Offer conversion rate</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">Avg. Time to Offer</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{stats.avgTimeToOffer}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto pb-8">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="flex gap-6 min-w-min">
                  {columns.map((column) => (
                    <Column
                      key={column.id}
                      column={column}
                      applications={filteredApplications.filter((app) => app.status === column.id)}
                    />
                  ))}
                </div>

                <DragOverlay>
                  {activeId ? (
                    <ApplicationCard
                      application={applications.find((app) => app.id === activeId)!}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
