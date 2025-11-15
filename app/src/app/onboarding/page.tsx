'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, ArrowRight, User, Mail, Briefcase, GraduationCap } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface OnboardingData {
  firstName: string
  lastName: string
  school: string
  major: string
  gradDate: string
  resumeUrl?: string
  linkedinUrl?: string
  interests: string[]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    school: '',
    major: '',
    gradDate: '',
    interests: []
  })

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      icon: User,
      component: PersonalInfoStep
    },
    {
      id: 'academic',
      title: 'Academic Background',
      description: 'Your education details',
      icon: GraduationCap,
      component: AcademicStep
    },
    {
      id: 'interests',
      title: 'Career Interests',
      description: 'What roles interest you?',
      icon: Briefcase,
      component: InterestsStep
    },
    {
      id: 'review',
      title: 'Review & Complete',
      description: 'Review your information',
      icon: CheckCircle2,
      component: ReviewStep
    }
  ]

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Save to backend
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Pathfinder</h1>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${isActive
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : isCompleted
                      ? 'border-success-600 bg-success-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 mr-6">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ${
                      isCompleted ? 'bg-success-600' : 'bg-gray-300'
                    }`} style={{ marginLeft: '3rem', marginRight: '1.5rem' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <CurrentStepComponent
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
            isLastStep={currentStep === steps.length - 1}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}

// Step Components
interface StepComponentProps {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrev: () => void
  isLastStep: boolean
  isSubmitting: boolean
  onSubmit: () => void
}

function PersonalInfoStep({ data, updateData, onNext, onPrev, isLastStep, isSubmitting, onSubmit }: StepComponentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!data.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!data.school.trim()) newErrors.school = 'School is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School *
          </label>
          <input
            type="text"
            value={data.school}
            onChange={(e) => updateData({ school: e.target.value })}
            className={`input-field ${errors.school ? 'border-red-500' : ''}`}
            placeholder="Stanford University"
          />
          {errors.school && (
            <p className="text-red-500 text-sm mt-1">{errors.school}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major
          </label>
          <input
            type="text"
            value={data.major}
            onChange={(e) => updateData({ major: e.target.value })}
            className="input-field"
            placeholder="Computer Science"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile (Optional)
          </label>
          <input
            type="url"
            value={data.linkedinUrl || ''}
            onChange={(e) => updateData({ linkedinUrl: e.target.value })}
            className="input-field"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="btn-secondary"
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AcademicStep({ data, updateData, onNext, onPrev, isLastStep, isSubmitting, onSubmit }: StepComponentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.gradDate) {
      newErrors.gradDate = 'Graduation date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Background</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Graduation Date *
          </label>
          <input
            type="month"
            value={data.gradDate}
            onChange={(e) => updateData({ gradDate: e.target.value })}
            className={`input-field ${errors.gradDate ? 'border-red-500' : ''}`}
            min="2024-01"
            max="2030-12"
          />
          {errors.gradDate && (
            <p className="text-red-500 text-sm mt-1">{errors.gradDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resume (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload your resume (PDF, DOC, DOCX)</p>
            <p className="text-sm text-gray-500">Max file size: 5MB</p>
            <button type="button" className="btn-secondary mt-4">
              Choose File
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onPrev} className="btn-secondary">
          Previous
        </button>
        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function InterestsStep({ data, updateData, onNext, onPrev, isLastStep, isSubmitting, onSubmit }: StepComponentProps) {
  const interests = [
    'Software Engineering',
    'Product Management',
    'Data Science',
    'UX/UI Design',
    'Marketing',
    'Sales',
    'Operations',
    'Finance',
    'Consulting',
    'Research'
  ]

  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest]

    updateData({ interests: newInterests })
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Career Interests</h2>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Select the types of roles you're interested in. This helps us find the most relevant opportunities for you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {interests.map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`
              p-3 rounded-lg border-2 text-sm font-medium transition-colors
              ${data.interests.includes(interest)
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }
            `}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          Previous
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ReviewStep({ data, onNext, onPrev, isLastStep, isSubmitting, onSubmit }: StepComponentProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Information</h2>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
            <p><strong>School:</strong> {data.school}</p>
            <p><strong>Major:</strong> {data.major || 'Not specified'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Academic Background</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Graduation Date:</strong> {data.gradDate ? formatDate(data.gradDate, { year: 'numeric', month: 'long' }) : 'Not specified'}</p>
            {data.resumeUrl && <p><strong>Resume:</strong> Uploaded</p>}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Career Interests</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {data.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.interests.map(interest => (
                  <span key={interest} className="badge-primary">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No interests selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8">
        <h4 className="font-medium text-primary-900 mb-2">Ready to get started!</h4>
        <p className="text-primary-700 text-sm">
          Your profile is complete. You can now search for internships and launch outreach campaigns to hiring contacts.
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          Previous
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-primary flex items-center gap-2"
        >
          {isSubmitting ? 'Saving...' : 'Complete Setup'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}