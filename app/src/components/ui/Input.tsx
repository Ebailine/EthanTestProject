import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, fullWidth, className = '', ...props }, ref) => {
    const baseClasses = 'px-4 py-3 rounded-xl border transition-all duration-200 outline-none'
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
    const widthClass = fullWidth ? 'w-full' : ''
    const iconPaddingClass = icon ? 'pl-12' : ''

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseClasses} ${stateClasses} ${widthClass} ${iconPaddingClass} ${className}`}
            {...props}
          />
          {error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
