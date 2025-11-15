import React from 'react'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
}

export const Radio: React.FC<RadioProps> = ({
  name,
  options,
  value,
  onChange,
  error,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-2 cursor-pointer ${
              option.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="relative">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  value === option.value
                    ? 'border-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                } ${option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {value === option.value && (
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                )}
              </div>
            </div>
            <span
              className={`text-sm ${
                option.disabled ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
