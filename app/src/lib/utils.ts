/**
 * Utility functions for the Pathfinder application
 */

/**
 * Safely formats a date to a localized date string
 * Handles Date objects, ISO strings, and null/undefined values
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'N/A'

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    return dateObj.toLocaleDateString('en-US', options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

/**
 * Formats a date to a short format (MM/DD/YYYY)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

/**
 * Formats a date to relative time (e.g., "2 days ago")
 */
export function formatDateRelative(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    const now = new Date()
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  } catch (error) {
    console.error('Error formatting relative date:', error)
    return 'N/A'
  }
}

/**
 * Combines multiple class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
