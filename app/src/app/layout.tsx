import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pathfinder - Internship Discovery & Outreach',
  description: 'Find internships and make effective outreach to hiring contacts with evidence-based emails',
  keywords: ['internships', 'students', 'jobs', 'career', 'outreach', 'hiring'],
  authors: [{ name: 'Pathfinder Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const disableAuth = process.env.DISABLE_AUTH === '1'
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY

  if (!disableAuth && !publishableKey) {
    throw new Error(
      '@clerk/nextjs: Missing publishableKey. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or enable DISABLE_AUTH=1 for local development.'
    )
  }

  const appShell = (
    <div className="flex flex-col min-h-screen">
      <Navbar disableAuth={disableAuth} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )

  const layoutContent = disableAuth ? (
    appShell
  ) : (
    <ClerkProvider publishableKey={publishableKey}>
      {appShell}
    </ClerkProvider>
  )

  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        {layoutContent}
      </body>
    </html>
  )
}
