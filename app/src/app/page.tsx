import Link from 'next/link'
import { ArrowRight, Search, Mail, TrendingUp, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Find Internships & Land the Job with
              <span className="text-primary-600"> Evidence-Based Outreach</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Pathfinder aggregates thousands of internship opportunities and helps you stand out with
              personalized, research-backed outreach to hiring contacts. No more black hole applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs" className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
                Browse Internships
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/how-it-works" className="btn-secondary text-lg px-8 py-3">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Internship
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Two powerful modules that work together to make your internship search effective and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Discovery Module */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Smart Internship Discovery
              </h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Aggregate from 50+ sources including Greenhouse, Lever, and government portals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Advanced filters: major, location, pay, remote work, visa sponsorship</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Freshness indicators and verification status</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Deduplicate and normalize across all sources</span>
                </li>
              </ul>
            </div>

            {/* Outreach Module */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Evidence-Based Outreach
              </h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Research companies and find 5 verified contacts per job</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Generate 5 personalized emails with concrete, verifiable facts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Diversified contact mix: HR, recruiters, and team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success-500 mt-1">✓</span>
                  <span>Send from your own email with full approval control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Privacy-First
              </h3>
              <p className="text-gray-600">
                Your data is encrypted and emails are sent from your account. You're always in control.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3x Higher Response Rates
              </h3>
              <p className="text-gray-600">
                Evidence-based outreach performs significantly better than generic applications.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Save 10+ Hours Per Week
              </h3>
              <p className="text-gray-600">
                Automate the research and outreach process while maintaining quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Internship Search?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students using Pathfinder to land internships at top companies.
          </p>
          <Link href="/jobs" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}