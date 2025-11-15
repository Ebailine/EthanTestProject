'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { formatDateRelative } from '@/lib/utils'

interface DashboardStats {
  totalOutreach: number
  emailsSent: number
  repliesReceived: number
  meetingsBooked: number
  responseRate: number
  meetingRate: number
  timeSaved: number
}

interface RecentActivity {
  id: string
  type: 'outreach_sent' | 'reply_received' | 'meeting_booked'
  company: string
  title: string
  timestamp: Date
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOutreach: 0,
    emailsSent: 0,
    repliesReceived: 0,
    meetingsBooked: 0,
    responseRate: 0,
    meetingRate: 0,
    timeSaved: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // For MVP, use mock data
      const mockStats: DashboardStats = {
        totalOutreach: 12,
        emailsSent: 60,
        repliesReceived: 18,
        meetingsBooked: 7,
        responseRate: 30,
        meetingRate: 39,
        timeSaved: 8.5
      }

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'outreach_sent',
          company: 'TechCorp',
          title: 'Software Engineering Intern',
          timestamp: new Date('2024-01-20T10:30:00Z'),
          status: 'sent'
        },
        {
          id: '2',
          type: 'reply_received',
          company: 'DesignCo',
          title: 'Product Design Intern',
          timestamp: new Date('2024-01-19T14:15:00Z'),
          status: 'replied'
        },
        {
          id: '3',
          type: 'meeting_booked',
          company: 'DataScience Inc',
          title: 'Data Science Intern',
          timestamp: new Date('2024-01-18T09:00:00Z'),
          status: 'meeting_scheduled'
        }
      ]

      setStats(mockStats)
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, subtitle, trend }: {
    title: string
    value: string | number
    icon: any
    subtitle?: string
    trend?: number
  }) => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-success-600' : 'text-error-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  )

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'outreach_sent':
          return <Mail className="w-5 h-5 text-blue-600" />
        case 'reply_received':
          return <CheckCircle className="w-5 h-5 text-green-600" />
        case 'meeting_booked':
          return <Calendar className="w-5 h-5 text-purple-600" />
        default:
          return <AlertCircle className="w-5 h-5 text-gray-600" />
      }
    }

    const getStatusText = () => {
      switch (activity.status) {
        case 'sent':
          return 'Emails sent successfully'
        case 'replied':
          return 'Received response from hiring team'
        case 'meeting_scheduled':
          return 'Interview scheduled'
        default:
          return 'Activity completed'
      }
    }

    return (
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="mt-1">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">
            {activity.company} - {activity.title}
          </div>
          <div className="text-sm text-gray-600 mb-1">
            {getStatusText()}
          </div>
          <div className="text-xs text-gray-500">
            {formatDateRelative(activity.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your internship search progress and outreach performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Outreach"
            value={stats.totalOutreach}
            icon={Target}
            subtitle="Companies contacted"
            trend={12}
          />
          <StatCard
            title="Emails Sent"
            value={stats.emailsSent}
            icon={Mail}
            subtitle="Personalized outreach"
          />
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            icon={BarChart3}
            subtitle="Above industry average"
            trend={8}
          />
          <StatCard
            title="Time Saved"
            value={`${stats.timeSaved}h`}
            icon={Clock}
            subtitle="This week"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-gray-600">Replies Received</div>
                  <div className="font-semibold text-gray-900">
                    {stats.repliesReceived} / {stats.emailsSent}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: `${stats.responseRate}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-gray-600">Meetings Booked</div>
                  <div className="font-semibold text-gray-900">
                    {stats.meetingsBooked} / {stats.repliesReceived}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${stats.meetingRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a href="/jobs" className="btn-primary w-full justify-center">
                Find More Internships
              </a>
              <a href="/profile" className="btn-secondary w-full justify-center">
                Update Profile
              </a>
              <button className="btn-secondary w-full justify-center">
                Export Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <a href="/analytics" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Target className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start your outreach campaign to see activity here
              </p>
              <a href="/jobs" className="btn-primary">
                Find Internships
              </a>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-primary-900 mb-2">
                Pro Tip: Improve Your Response Rate
              </h4>
              <p className="text-primary-700 text-sm">
                Personalize your email content by referencing specific company initiatives or recent news.
                Our research shows that emails with concrete evidence get 3x higher response rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}