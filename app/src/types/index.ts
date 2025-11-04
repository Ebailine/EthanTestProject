export interface Company {
  id: string
  name: string
  website?: string
  domain?: string
  linkedinUrl?: string
  industryTags: string[]
  sizeBand?: '1-10' | '11-50' | '51-200' | '201-500' | '500+'
  hqCity?: string
  hqState?: string
  lastResearchedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  companyId: string
  title: string
  function: 'engineering' | 'product' | 'design' | 'marketing' | 'sales' | 'operations' | 'finance' | 'other'
  majorTags: string[]
  location?: string
  remoteFlag: boolean
  paidFlag: boolean
  payInfo?: {
    min?: number
    max?: number
    currency?: string
    period?: 'hourly' | 'monthly' | 'stipend'
  }
  internshipType?: 'summer' | 'semester' | 'co-op' | 'year-round' | 'other'
  startDate?: Date
  endDate?: Date
  sourceName: string
  sourceUrl: string
  atsType: 'greenhouse' | 'lever' | 'workday' | 'other' | 'manual'
  postedAt?: Date
  lastVerifiedAt?: Date
  status: 'active' | 'expired' | 'closed' | 'draft'
  createdAt: Date
  updatedAt: Date
  company?: Company
}

export interface Source {
  id: string
  companyId: string
  type: 'site_page' | 'podcast' | 'video' | 'press' | 'award' | 'blog'
  url: string
  title?: string
  publishedAt?: Date
  transcriptText?: string
  fetchedAt: Date
  createdAt: Date
  updatedAt: Date
  company?: Company
}

export interface Moment {
  id: string
  companyId: string
  sourceId: string
  timestampStart?: string // "HH:MM:SS"
  timestampEnd?: string // "HH:MM:SS"
  quote: string
  label: 'pain' | 'plan' | 'metric' | 'hiring' | 'mission'
  confidence: number
  summary?: string
  createdAt: Date
  company?: Company
  source?: Source
}

export interface Contact {
  id: string
  companyId: string
  fullName: string
  title: string
  dept: 'HR' | 'Recruiting' | 'Team' | 'EA' | 'Other'
  email?: string
  emailConfidence?: number
  linkedinUrl?: string
  isRoleAccount: boolean
  lastVerifiedAt?: Date
  createdAt: Date
  updatedAt: Date
  company?: Company
}

export interface User {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  school?: string
  major?: string
  gradDate?: Date
  resumeUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OutreachBatch {
  id: string
  userId: string
  jobId: string
  companyId: string
  status: 'draft' | 'approved' | 'sent' | 'responded'
  createdAt: Date
  updatedAt: Date
  user?: User
  job?: Job
  company?: Company
  emails?: OutreachEmail[]
}

export interface OutreachEmail {
  id: string
  batchId: string
  contactId: string
  subject: string
  bodyText: string
  angleTag: 'curiosity' | 'mission_fit' | 'project_relevance' | 'specific_question' | 'timeline'
  sourcesCited?: string[]
  status: 'draft' | 'approved' | 'sent' | 'replied' | 'bounced'
  sentAt?: Date
  replyAt?: Date
  createdAt: Date
  updatedAt: Date
  batch?: OutreachBatch
  contact?: Contact
}

export interface SearchFilters {
  query?: string
  function?: string[]
  majorTags?: string[]
  location?: string
  remoteFlag?: boolean
  paidFlag?: boolean
  internshipType?: string[]
  atsType?: string[]
  datePosted?: string
  visaSponsorship?: boolean
}

export interface SearchResult {
  jobs: Job[]
  total: number
  page: number
  limit: number
  facets: {
    functions: { [key: string]: number }
    locations: { [key: string]: number }
    majorTags: { [key: string]: number }
    internshipTypes: { [key: string]: number }
  }
}

export interface OutreachRequest {
  jobId: string
  studentProfile: {
    name: string
    school: string
    major: string
    gradDate: string
    resumeUrl?: string
  }
}

export interface CompanyResearch {
  companyId: string
  sources: Source[]
  moments: Moment[]
  contacts: Contact[]
  researchCompletedAt: Date
}

export interface EmailDraft {
  subject: string
  bodyText: string
  angleTag: 'curiosity' | 'mission_fit' | 'project_relevance' | 'specific_question' | 'timeline'
  sourcesCited: string[]
  wordCount: number
}

export interface OutreachWorkflow {
  job: Job
  company: Company
  research: CompanyResearch
  selectedContacts: Contact[]
  emailDrafts: EmailDraft[]
  status: 'researching' | 'drafting' | 'ready' | 'sent'
}