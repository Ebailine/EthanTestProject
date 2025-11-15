import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST() {
  try {
    const testData = [
      {
        company: {
          name: 'Google',
          domain: 'google.com',
          description: 'A global technology company specializing in Internet-related services and products.',
          industry: 'Technology',
          size: '100,000+',
          location: 'Mountain View, CA',
          linkedinUrl: 'https://linkedin.com/company/google',
          websiteUrl: 'https://google.com',
        },
        jobs: [
          {
            title: 'Software Engineering Intern',
            description: 'Join Google as a Software Engineering Intern for Summer 2025. Work on real products used by billions of users worldwide. Collaborate with world-class engineers on challenging projects involving distributed systems, machine learning, and web technologies.',
            jobUrl: 'https://careers.google.com/jobs/software-engineering-intern',
            location: 'Mountain View, CA',
            type: 'Internship',
            salary: '$8,000-$10,000/month',
            requirements: 'Currently pursuing a BS/MS in Computer Science or related field. Strong coding skills in C++, Java, or Python. Understanding of data structures and algorithms.',
            status: 'active',
          },
        ],
      },
      {
        company: {
          name: 'Stripe',
          domain: 'stripe.com',
          description: 'Financial infrastructure for the internet.',
          industry: 'Financial Technology',
          size: '5,000-10,000',
          location: 'San Francisco, CA',
          linkedinUrl: 'https://linkedin.com/company/stripe',
          websiteUrl: 'https://stripe.com',
        },
        jobs: [
          {
            title: 'Software Engineering Intern',
            description: 'Build the future of payments at Stripe. Summer 2025 internship.',
            jobUrl: 'https://stripe.com/jobs/software-engineering-intern',
            location: 'San Francisco, CA',
            type: 'Internship',
            salary: '$9,000-$11,000/month',
            requirements: 'Strong programming skills. Experience with web technologies.',
            status: 'active',
          },
        ],
      },
      {
        company: {
          name: 'Meta',
          domain: 'meta.com',
          description: 'Technology company focused on building the future of human connection.',
          industry: 'Technology',
          size: '50,000+',
          location: 'Menlo Park, CA',
          linkedinUrl: 'https://linkedin.com/company/meta',
          websiteUrl: 'https://meta.com',
        },
        jobs: [
          {
            title: 'Software Engineering Intern',
            description: 'Work on products used by billions at Meta. Summer 2025.',
            jobUrl: 'https://metacareers.com/jobs/software-engineering-intern',
            location: 'Menlo Park, CA',
            type: 'Internship',
            salary: '$9,000-$11,000/month',
            requirements: 'Strong programming fundamentals. CS degree in progress.',
            status: 'active',
          },
        ],
      },
    ]

    let companiesCreated = 0
    let jobsCreated = 0

    for (const item of testData) {
      // Check if company exists
      let company = await prisma.company.findUnique({
        where: { domain: item.company.domain },
      })

      if (!company) {
        company = await prisma.company.create({
          data: item.company,
        })
        companiesCreated++
      }

      // Insert jobs
      for (const jobData of item.jobs) {
        await prisma.job.create({
          data: {
            ...jobData,
            companyId: company.id,
            postedAt: new Date(),
          },
        })
        jobsCreated++
      }
    }

    return NextResponse.json({
      success: true,
      companiesCreated,
      jobsCreated,
      message: `Created ${companiesCreated} companies and ${jobsCreated} jobs`,
    })
  } catch (error: any) {
    console.error('Error inserting test data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
