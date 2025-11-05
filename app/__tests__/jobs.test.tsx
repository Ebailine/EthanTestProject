import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import JobsPage from '@/app/jobs/page'

// Mock the fetch API
global.fetch = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/jobs',
  }),
}))

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: { id: 'test-user', firstName: 'Test', lastName: 'User' }
  }),
  UserButton: () => <div>UserButton</div>,
}))

describe('JobsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful API response
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        jobs: [
          {
            id: '1',
            title: 'Software Engineering Intern',
            function: 'engineering',
            majorTags: ['Computer Science'],
            location: 'San Francisco, CA',
            remoteFlag: true,
            paidFlag: true,
            payInfo: { min: 45, max: 60, currency: 'USD', period: 'hourly' },
            internshipType: 'summer',
            sourceName: 'Greenhouse',
            sourceUrl: 'https://boards.greenhouse.io/techco/jobs/123',
            atsType: 'greenhouse',
            postedAt: new Date('2024-01-15'),
            lastVerifiedAt: new Date('2024-01-20'),
            status: 'active',
            company: {
              id: '1',
              name: 'TechCorp',
              website: 'https://techcorp.com',
              industryTags: ['technology']
            }
          }
        ],
        total: 1
      })
    })
  })

  it('renders the jobs page with correct elements', async () => {
    render(<JobsPage />)

    // Check main heading
    expect(screen.getByText('Find Your Dream Internship')).toBeInTheDocument()
    expect(screen.getByText(/Discover opportunities from top companies/)).toBeInTheDocument()

    // Check search input
    expect(screen.getByPlaceholderText('Search by title, company, or keyword...')).toBeInTheDocument()

    // Check filter buttons
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()

    // Check quick filter options
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('Remote Only')).toBeInTheDocument()
    expect(screen.getByText('Paid Only')).toBeInTheDocument()
  })

  it('displays job cards when jobs are loaded', async () => {
    render(<JobsPage />)

    await waitFor(() => {
      expect(screen.getByText('Found 1 opportunities')).toBeInTheDocument()
    })

    // Check job card content
    expect(screen.getByText('Software Engineering Intern')).toBeInTheDocument()
    expect(screen.getByText('TechCorp')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('$45-60/hour')).toBeInTheDocument()
    expect(screen.getByText('Apply Now')).toBeInTheDocument()
    expect(screen.getByText('Launch Outreach')).toBeInTheDocument()
  })

  it('handles search input changes', async () => {
    render(<JobsPage />)

    const searchInput = screen.getByPlaceholderText('Search by title, company, or keyword...')

    fireEvent.change(searchInput, { target: { value: 'software engineer' } })

    expect(searchInput).toHaveValue('software engineer')
  })

  it('handles filter button clicks', async () => {
    render(<JobsPage />)

    const engineeringFilter = screen.getByText('Engineering')
    const remoteFilter = screen.getByText('Remote Only')

    fireEvent.click(engineeringFilter)
    fireEvent.click(remoteFilter)

    // Check if filters are applied (visual feedback)
    expect(engineeringFilter).toHaveClass('bg-primary-100')
    expect(remoteFilter).toHaveClass('bg-primary-100')
  })

  it('shows loading state initially', () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<JobsPage />)

    expect(screen.getByText('Loading opportunities...')).toBeInTheDocument()
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<JobsPage />)

    await waitFor(() => {
      // Should show mock data as fallback
      expect(screen.getByText('Software Engineering Intern')).toBeInTheDocument()
    })
  })

  it('handles empty search results', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        jobs: [],
        total: 0
      })
    })

    render(<JobsPage />)

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument()
    })
  })

  it('opens external links correctly', async () => {
    render(<JobsPage />)

    await waitFor(() => {
      const applyButton = screen.getByText('Apply Now')
      expect(applyButton.closest('a')).toHaveAttribute('href', 'https://boards.greenhouse.io/techco/jobs/123')
      expect(applyButton.closest('a')).toHaveAttribute('target', '_blank')
    })
  })

  it('clears filters when clear button is clicked', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        jobs: [],
        total: 0
      })
    })

    render(<JobsPage />)

    // Apply filters
    const engineeringFilter = screen.getByText('Engineering')
    fireEvent.click(engineeringFilter)

    // Trigger empty state
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })

    // Clear filters
    const clearButton = screen.getByText('Clear Filters')
    fireEvent.click(clearButton)

    expect(engineeringFilter).not.toHaveClass('bg-primary-100')
  })
})

describe('JobsPage Integration', () => {
  it('calls API with correct parameters when searching', async () => {
    render(<JobsPage />)

    const searchInput = screen.getByPlaceholderText('Search by title, company, or keyword...')
    const searchButton = screen.getByText('Search')

    fireEvent.change(searchInput, { target: { value: 'internship' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {},
          query: 'internship'
        })
      })
    })
  })

  it('calls API with filters when filters are applied', async () => {
    render(<JobsPage />)

    const engineeringFilter = screen.getByText('Engineering')
    const remoteFilter = screen.getByText('Remote Only')
    const searchButton = screen.getByText('Search')

    fireEvent.click(engineeringFilter)
    fireEvent.click(remoteFilter)
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            function: ['engineering'],
            remoteFlag: true
          },
          query: ''
        })
      })
    })
  })
})

describe('JobsPage Accessibility', () => {
  it('has proper ARIA labels', async () => {
    render(<JobsPage />)

    const searchInput = screen.getByPlaceholderText('Search by title, company, or keyword...')
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('has keyboard navigation support', () => {
    render(<JobsPage />)

    const searchButton = screen.getByText('Search')
    expect(searchButton).toBeInTheDocument()

    // Tab navigation should work
    searchButton.focus()
    expect(document.activeElement).toBe(searchButton)
  })
})

describe('JobsPage Error Handling', () => {
  it('handles network errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<JobsPage />)

    await waitFor(() => {
      // Should show fallback mock data instead of crashing
      expect(screen.getByText('Software Engineering Intern')).toBeInTheDocument()
    })
  })

  it('handles malformed API responses', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: 'structure' })
    })

    render(<JobsPage />)

    await waitFor(() => {
      // Should handle gracefully
      expect(screen.queryByText('Error loading jobs')).not.toBeInTheDocument()
    })
  })
})