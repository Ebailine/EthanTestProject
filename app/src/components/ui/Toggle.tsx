import React from 'react'

export interface ToggleProps {
  id?: string
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  }

  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={handleChange}
        disabled={disabled}
        className={`${sizeClasses[size].track} rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked
            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
            : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`${sizeClasses[size].thumb} block bg-white rounded-full shadow-md transform transition-transform ${
            checked ? sizeClasses[size].translate : 'translate-x-0.5'
          }`}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm ${
            disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
          }`}
          onClick={handleChange}
        >
          {label}
        </label>
      )}
    </div>
  )
}
