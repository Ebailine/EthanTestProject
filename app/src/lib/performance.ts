import { performance } from 'perf_hooks'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure execution time of a function
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    PerformanceMonitor.getInstance().recordMetric(name, duration)

    return { result, duration }
  }

  // Measure sync function execution time
  static measure<T>(name: string, fn: () => T): { result: T; duration: number } {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start

    PerformanceMonitor.getInstance().recordMetric(name, duration)

    return { result, duration }
  }

  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const durations = this.metrics.get(name)!
    durations.push(duration)

    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift()
    }
  }

  getMetrics(name: string) {
    const durations = this.metrics.get(name) || []
    if (durations.length === 0) {
      return null
    }

    const sorted = [...durations].sort((a, b) => a - b)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      count: durations.length,
      average: sum / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  getAllMetrics() {
    const result: Record<string, any> = {}

    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name)
    }

    return result
  }

  reset(): void {
    this.metrics.clear()
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  static getUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return {
        rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
        percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100 * 100) / 100
      }
    }
    return null
  }

  static getHeapUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return {
        used: usage.heapUsed,
        total: usage.heapTotal,
        limit: usage.heapTotal * 2, // Estimated limit
        percentage: (usage.heapUsed / usage.heapTotal) * 100
      }
    }
    return null
  }
}

// React component performance hook
export function useRenderTracker(componentName: string) {
  if (typeof window === 'undefined') return

  const start = performance.now()

  // Track render in production
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      const duration = performance.now() - start
      if (duration > 16) { // More than one frame
        console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
      }
    }, 0)
  }
}

// API performance tracking
export class APIPerformanceTracker {
  private static pendingRequests = new Map<string, number>()

  static startRequest(id: string): void {
    this.pendingRequests.set(id, performance.now())
  }

  static endRequest(id: string, url: string, status: number): void {
    const startTime = this.pendingRequests.get(id)
    if (startTime) {
      const duration = performance.now() - startTime
      this.pendingRequests.delete(id)

      // Log slow requests
      if (duration > 5000) { // More than 5 seconds
        console.warn(`Slow API request: ${url} took ${duration.toFixed(2)}ms (${status})`)
      }

      // Record metrics
      PerformanceMonitor.getInstance().recordMetric(`api_${url}`, duration)
      PerformanceMonitor.getInstance().recordMetric(`api_${status}`, duration)
    }
  }

  static getPendingRequests(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  static getPendingRequestsCount(): number {
    return this.pendingRequests.size
  }
}

// Database query performance tracking
export class DatabasePerformanceTracker {
  static trackQuery(query: string, duration: number): void {
    const queryType = query.split(' ')[0].toLowerCase()

    PerformanceMonitor.getInstance().recordMetric(`db_${queryType}`, duration)

    if (duration > 1000) { // More than 1 second
      console.warn(`Slow database query: ${queryType} took ${duration.toFixed(2)}ms`)
    }
  }
}

// Performance-optimized debounce function
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Performance-optimized throttle function
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)

    // Limit cache size
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return result
  }) as T
}

// Lazy loading utility
export function lazyLoad<T>(
  loader: () => Promise<T>
): () => Promise<T> {
  let instance: T | null = null
  let loading: Promise<T> | null = null

  return () => {
    if (instance) {
      return Promise.resolve(instance)
    }

    if (!loading) {
      loading = loader()
        .then(result => {
          instance = result
          return result
        })
        .catch(error => {
          loading = null
          throw error
        })
    }

    return loading
  }
}

// Performance monitoring middleware for API routes
export function withPerformanceTracking(handler: Function) {
  return async (...args: any[]) => {
    const start = performance.now()
    const result = await handler(...args)
    const duration = performance.now() - start

    // Add performance headers
    if (result && typeof result === 'object' && 'headers' in result) {
      result.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
    }

    return result
  }
}

// Export performance metrics endpoint data
export function getPerformanceReport() {
  const monitor = PerformanceMonitor.getInstance()
  const memoryUsage = MemoryMonitor.getUsage()
  const pendingRequests = APIPerformanceTracker.getPendingRequestsCount()

  return {
    timestamp: new Date().toISOString(),
    metrics: monitor.getAllMetrics(),
    memory: memoryUsage,
    pendingRequests,
    uptime: process.uptime ? process.uptime() : 0
  }
}