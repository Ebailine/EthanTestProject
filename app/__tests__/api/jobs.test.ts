import { POST, GET } from '@/app/api/jobs/search/route'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/database', () => ({
  prisma: {
    job: {
      findMany: jest.fn()
    }
  }
}))

describe('/api/jobs/search', () => {
  it('returns jobs successfully', async () => {
    const mockJobs = [
      {
        id: '1',
        title: 'Test Job',
        company: { name: 'Test Co' }
      }
    ]

    const { prisma } = require('@/lib/database')
    prisma.job.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs/search', {
      method: 'POST',
      body: JSON.stringify({ filters: {} })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.jobs).toHaveLength(1)
  })

  it('validates input correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/jobs/search', {
      method: 'POST',
      body: JSON.stringify({ query: 123 }) // Invalid: should be string
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})
