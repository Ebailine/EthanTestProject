import React from 'react'
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'

export interface AlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
}) => {
  const variantConfig = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      titleColor: 'text-green-900',
      textColor: 'text-green-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-800',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      titleColor: 'text-red-900',
      textColor: 'text-red-800',
    },
  }

  const config = variantConfig[variant]

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-xl p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-bold mb-1 ${config.titleColor}`}>{title}</h4>
          )}
          <div className={`text-sm ${config.textColor}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
