import React from 'react'
import { Check } from 'lucide-react'

export interface CheckboxProps {
  id?: string
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  error?: string
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '',
}) => {
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div className={className}>
      <label
        className={`flex items-center gap-2 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              checked
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent'
                : 'bg-white border-gray-300 hover:border-gray-400'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={handleChange}
          >
            {checked && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        {label && (
          <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </span>
        )}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
