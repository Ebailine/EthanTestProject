import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Sample data for realistic testing
const companies = [
  {
    name: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    domain: 'techcorp.com',
    linkedinUrl: 'https://linkedin.com/company/techcorp',
    industryTags: ['technology', 'software', 'enterprise'],
    sizeBand: '500+',
    hqCity: 'San Francisco',
    hqState: 'CA',
  },
  {
    name: 'DesignHub',
    website: 'https://designhub.io',
    domain: 'designhub.io',
    linkedinUrl: 'https://linkedin.com/company/designhub',
    industryTags: ['design', 'creative', 'saas'],
    sizeBand: '51-200',
    hqCity: 'New York',
    hqState: 'NY',
  },
  {
    name: 'DataScience Inc',
    website: 'https://datascience.com',
    domain: 'datascience.com',
    linkedinUrl: 'https://linkedin.com/company/datascience',
    industryTags: ['data', 'analytics', 'ai'],
    sizeBand: '201-500',
    hqCity: 'Boston',
    hqState: 'MA',
  },
  {
    name: 'FinTech Startup',
    website: 'https://fintech.com',
    domain: 'fintech.com',
    linkedinUrl: 'https://linkedin.com/company/fintech',
    industryTags: ['finance', 'fintech', 'banking'],
    sizeBand: '11-50',
    hqCity: 'Austin',
    hqState: 'TX',
  },
  {
    name: 'MarketingPro',
    website: 'https://marketingpro.com',
    domain: 'marketingpro.com',
    linkedinUrl: 'https://linkedin.com/company/marketingpro',
    industryTags: ['marketing', 'advertising', 'media'],
    sizeBand: '201-500',
    hqCity: 'Chicago',
    hqState: 'IL',
  },
  {
    name: 'EcoTech',
    website: 'https://ecotech.com',
    domain: 'ecotech.com',
    linkedinUrl: 'https://linkedin.com/company/ecotech',
    industryTags: ['sustainability', 'green-tech', 'environmental'],
    sizeBand: '51-200',
    hqCity: 'Seattle',
    hqState: 'WA',
  },
  {
    name: 'HealthTech Solutions',
    website: 'https://healthtech.com',
    domain: 'healthtech.com',
    linkedinUrl: 'https://linkedin.com/company/healthtech',
    industryTags: ['healthcare', 'medical', 'biotech'],
    sizeBand: '500+',
    hqCity: 'Boston',
    hqState: 'MA',
  },
  {
    name: 'EduTech Platform',
    website: 'https://edutech.com',
    domain: 'edutech.com',
    linkedinUrl: 'https://linkedin.com/company/edutech',
    industryTags: ['education', 'edtech', 'learning'],
    sizeBand: '51-200',
    hqCity: 'Denver',
    hqState: 'CO',
  },
  {
    name: 'RetailGenius',
    website: 'https://retailgenius.com',
    domain: 'retailgenius.com',
    linkedinUrl: 'https://linkedin.com/company/retailgenius',
    industryTags: ['retail', 'ecommerce', 'consumer'],
    sizeBand: '500+',
    hqCity: 'Los Angeles',
    hqState: 'CA',
  },
  {
    name: 'Government Solutions',
    website: 'https://govsolutions.gov',
    domain: 'govsolutions.gov',
    linkedinUrl: 'https://linkedin.com/company/govsolutions',
    industryTags: ['government', 'public-sector', 'consulting'],
    sizeBand: '500+',
    hqCity: 'Washington',
    hqState: 'DC',
  }
]

const jobs = [
  // TechCorp Solutions jobs
  {
    title: 'Software Engineering Intern',
    function: 'engineering',
    majorTags: ['Computer Science', 'Software Engineering', 'Computer Engineering'],
    location: 'San Francisco, CA',
    remoteFlag: true,
    paidFlag: true,
    payInfo: { min: 45, max: 60, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Greenhouse',
    sourceUrl: 'https://boards.greenhouse.io/techcorp/jobs/1234',
    atsType: 'greenhouse',
    status: 'active'
  },
  {
    title: 'Product Management Intern',
    function: 'product',
    majorTags: ['Business', 'Product Management', 'Marketing'],
    location: 'San Francisco, CA',
    remoteFlag: true,
    paidFlag: true,
    payInfo: { min: 50, max: 65, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Lever',
    sourceUrl: 'https://jobs.lever.co/techcorp/5678',
    atsType: 'lever',
    status: 'active'
  },
  {
    title: 'UX Design Intern',
    function: 'design',
    majorTags: ['Design', 'UX/UI Design', 'Human-Computer Interaction'],
    location: 'San Francisco, CA',
    remoteFlag: true,
    paidFlag: true,
    payInfo: { min: 40, max: 55, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Greenhouse',
    sourceUrl: 'https://boards.greenhouse.io/techcorp/jobs/2345',
    atsType: 'greenhouse',
    status: 'active'
  },
  // DesignHub jobs
  {
    title: 'Product Design Intern',
    function: 'design',
    majorTags: ['Design', 'Product Design', 'Visual Design'],
    location: 'New York, NY',
    remoteFlag: false,
    paidFlag: true,
    payInfo: { min: 35, max: 50, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Lever',
    sourceUrl: 'https://jobs.lever.co/designhub/3456',
    atsType: 'lever',
    status: 'active'
  },
  {
    title: 'Visual Design Intern',
    function: 'design',
    majorTags: ['Design', 'Graphic Design', 'Visual Arts'],
    location: 'New York, NY',
    remoteFlag: true,
    paidFlag: true,
    payInfo: { min: 30, max: 45, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Greenhouse',
    sourceUrl: 'https://boards.greenhouse.io/designhub/jobs/4567',
    atsType: 'greenhouse',
    status: 'active'
  },
  // DataScience Inc jobs
  {
    title: 'Data Science Intern',
    function: 'engineering',
    majorTags: ['Data Science', 'Computer Science', 'Statistics'],
    location: 'Boston, MA',
    remoteFlag: true,
    paidFlag: true,
    payInfo: { min: 55, max: 70, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Lever',
    sourceUrl: 'https://jobs.lever.co/datascience/5678',
    atsType: 'lever',
    status: 'active'
  },
  {
    title: 'Machine Learning Engineering Intern',
    function: 'engineering',
    majorTags: ['Computer Science', 'Machine Learning', 'Artificial Intelligence'],
    location: 'Boston, MA',
    remoteFlag: true,
    paidFlag: true,
    payInfo: { min: 60, max: 80, currency: 'USD', period: 'hourly' },
    internshipType: 'summer',
    sourceName: 'Greenhouse',
    sourceUrl: 'https://boards.greenhouse.io/datascience/jobs/6789',
    atsType: 'greenhouse',
    status: 'active'
  }
]

const contacts = [
  // TechCorp Solutions contacts
  {
    fullName: 'Sarah Johnson',
    title: 'University Recruiter',
    dept: 'Recruiting',
    email: 'sarah.johnson@techcorp.com',
    emailConfidence: 0.9,
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    isRoleAccount: false
  },
  {
    fullName: 'Michael Chen',
    title: 'Technical Recruiter',
    dept: 'Recruiting',
    email: 'michael.chen@techcorp.com',
    emailConfidence: 0.85,
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    isRoleAccount: false
  },
  {
    fullName: 'Emily Davis',
    title: 'Engineering Manager',
    dept: 'Team',
    email: 'emily.davis@techcorp.com',
    emailConfidence: 0.8,
    linkedinUrl: 'https://linkedin.com/in/emilydavis',
    isRoleAccount: false
  },
  {
    fullName: 'Alex Rodriguez',
    title: 'Senior Software Engineer',
    dept: 'Team',
    email: 'alex.rodriguez@techcorp.com',
    emailConfidence: 0.75,
    linkedinUrl: 'https://linkedin.com/in/alexrodriguez',
    isRoleAccount: false
  },
  {
    fullName: 'Jennifer Wilson',
    title: 'Talent Acquisition Lead',
    dept: 'Recruiting',
    email: 'jennifer.wilson@techcorp.com',
    emailConfidence: 0.95,
    linkedinUrl: 'https://linkedin.com/in/jenniferwilson',
    isRoleAccount: false
  },
  // DesignHub contacts
  {
    fullName: 'Lisa Wang',
    title: 'Campus Recruiter',
    dept: 'Recruiting',
    email: 'lisa.wang@designhub.io',
    emailConfidence: 0.88,
    linkedinUrl: 'https://linkedin.com/in/lisawang',
    isRoleAccount: false
  },
  {
    fullName: 'David Martinez',
    title: 'Product Designer',
    dept: 'Team',
    email: 'david.martinez@designhub.io',
    emailConfidence: 0.7,
    linkedinUrl: 'https://linkedin.com/in/davidmartinez',
    isRoleAccount: false
  },
  {
    fullName: 'Sophie Turner',
    title: 'Design Director',
    dept: 'Team',
    email: 'sophie.turner@designhub.io',
    emailConfidence: 0.92,
    linkedinUrl: 'https://linkedin.com/in/sophieturner',
    isRoleAccount: false
  }
]

const sources = [
  {
    type: 'site_page',
    url: 'https://techcorp.com/about',
    title: 'About TechCorp',
    publishedAt: new Date('2024-01-15')
  },
  {
    type: 'blog',
    url: 'https://techcorp.com/blog/engineering-growth',
    title: 'Engineering Team Expansion',
    publishedAt: new Date('2024-01-10')
  },
  {
    type: 'press',
    url: 'https://techcrunch.com/2024/01/techcorp-series-b',
    title: 'TechCorp Announces Series B',
    publishedAt: new Date('2024-01-05')
  }
]

const moments = [
  {
    quote: "We're excited to announce that TechCorp is expanding our engineering team by 30% this year to support our product roadmap.",
    label: 'hiring',
    why_it_matters: 'Shows active growth and hiring opportunities',
    confidence: 0.9
  },
  {
    quote: "Our mission is to empower businesses with cutting-edge technology solutions that drive real business value.",
    label: 'mission',
    why_it_matters: 'Company values and purpose',
    confidence: 0.8
  },
  {
    quote: "Customers report an average 40% increase in productivity after implementing our platform.",
    label: 'metric',
    why_it_matters: 'Demonstrates product value and customer success',
    confidence: 0.7
  },
  {
    quote: "We're hiring interns who are passionate about solving complex problems and building innovative solutions.",
    label: 'hiring',
    why_it_matters: 'Specific recruitment focus',
    confidence: 0.8
  }
]

async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Create companies
    console.log('📁 Creating companies...')
    const createdCompanies = []

    for (const companyData of companies) {
      const company = await prisma.company.create({
        data: {
          ...companyData,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        skipDuplicates: true
      })
      createdCompanies.push(company)
    }

    console.log(`✅ Created ${createdCompanies.length} companies`)

    // 2. Create jobs
    console.log('💼 Creating jobs...')
    const createdJobs = []

    for (const jobData of jobs) {
      const company = createdCompanies[Math.floor(Math.random() * createdCompanies.length)]

      const job = await prisma.job.create({
        data: {
          ...jobData,
          companyId: company.id,
          postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          lastVerifiedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
          createdAt: new Date(),
          updatedAt: new Date()
        },
      })
      createdJobs.push(job)
    }

    console.log(`✅ Created ${createdJobs.length} jobs`)

    // 3. Create sources for each company
    console.log('📰 Creating research sources...')
    for (const company of createdCompanies) {
      for (const sourceData of sources) {
        await prisma.source.create({
          data: {
            companyId: company.id,
            ...sourceData,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }
    }

    console.log(`✅ Created ${sources.length} sources per company`)

    // 4. Create moments for each company
    console.log('💡 Creating research moments...')
    for (const company of createdCompanies) {
      for (const momentData of moments) {
        await prisma.moment.create({
          data: {
            companyId: company.id,
            sourceId: (await prisma.source.findFirst({
              where: { companyId: company.id }
            }))!.id,
            ...momentData,
            createdAt: new Date()
          }
        })
      }
    }

    console.log(`✅ Created ${moments.length} moments per company`)

    // 5. Create contacts
    console.log('👥 Creating contacts...')
    const createdContacts = []

    for (const contactData of contacts) {
      const company = createdContacts[Math.floor(Math.random() * 3)] // First 3 companies get contacts

      await prisma.contact.create({
        data: {
          companyId: company.id,
          ...contactData,
          lastVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        skipDuplicates: true
      })
    }

    console.log(`✅ Created ${contacts.length} contacts`)

    // 6. Create a test user
    console.log('👤 Creating test user...')
    const testUser = await prisma.user.create({
      data: {
        clerkId: 'user_clerk_12345',
        email: 'test@pathfinder.com',
        firstName: 'Test',
        lastName: 'User',
        school: 'Test University',
        major: 'Computer Science',
        gradDate: new Date('2025-05-01'),
        resumeUrl: 'https://example.com/resume.pdf',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`✅ Created test user: ${testUser.firstName} ${testUser.lastName}`)

    // 7. Create sample outreach batch
    console.log('📧 Creating sample outreach batch...')
    const sampleJob = createdJobs[0]

    if (sampleJob) {
      await prisma.outreachBatch.create({
        data: {
          userId: testUser.id,
          jobId: sampleJob.id,
          companyId: sampleJob.companyId,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log('✅ Created sample outreach batch')

    // 8. Index jobs in Typesense (if configured)
    if (process.env.TYPESENSE_API_KEY && process.env.TYPESENSE_API_KEY !== 'dummy-key-for-development') {
      console.log('🔍 Indexing jobs in Typesense...')
      try {
        const response = await fetch('http://localhost:8108/collections/jobs/documents/import', {
          method: 'POST',
          headers: {
            'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            docs: createdJobs.map(job => ({
              id: job.id,
              title: job.title,
              company_name: createdCompanies.find(c => c.id === job.companyId)?.name || '',
              function: job.function,
              major_tags: job.majorTags,
              location: job.location,
              remote_flag: job.remoteFlag,
              paid_flag: job.paidFlag,
              internship_type: job.internshipType,
              ats_type: job.atsType,
              posted_at: new Date(job.postedAt!).getTime(),
              last_verified_at: new Date(job.lastVerifiedAt!).getTime(),
              source_name: job.sourceName,
              company_size_band: createdCompanies.find(c => c.id === job.companyId)?.sizeBand || '',
              industry_tags: createdCompanies.find(c => c.id === job.companyId)?.industryTags || []
            }))
          })
        })

        if (response.ok) {
          console.log('✅ Jobs indexed in Typesense successfully')
        } else {
          console.log('⚠️ Typesense indexing failed, but continuing...')
        }
      } catch (error) {
        console.log('⚠️ Typesense not available, skipping indexing')
      }
    }

    console.log('')
    console.log('🎉 Database seeding completed successfully!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`- Companies: ${createdCompanies.length}`)
    console.log(`- Jobs: ${createdJobs.length}`)
    console.log(`- Sources: ${createdCompanies.length * sources.length}`)
    console.log(`- Moments: ${createdCompanies.length * moments.length}`)
    console.log(`- Contacts: ${contacts.length}`)
    console.log(`- Users: 1`)
    console.log('')
    console.log('🌐 You can now start the application with: npm run dev')
    console.log('🔍 Visit: http://localhost:3000 to test the platform')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run the seeding function
seed()
  .catch((error) => {
    console.error('Fatal error during seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })