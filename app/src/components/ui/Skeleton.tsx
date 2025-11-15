import React from 'react'

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}>
    <div className="flex items-start gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton className="mb-2" width="60%" />
        <Skeleton width="40%" />
      </div>
    </div>
    <Skeleton className="mb-2" />
    <Skeleton width="80%" />
  </div>
)
