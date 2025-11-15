import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options?: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth, options, className = '', children, ...props }, ref) => {
    const baseClasses = 'px-4 py-3 pr-10 rounded-xl border transition-all duration-200 outline-none appearance-none bg-white cursor-pointer'
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`${baseClasses} ${stateClasses} ${widthClass} ${className}`}
            {...props}
          >
            {children ||
              options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
