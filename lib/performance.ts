import React from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing an operation
  startTiming(key: string): void {
    this.metrics.set(`${key}_start`, performance.now())
  }

  // End timing and return duration
  endTiming(key: string): number {
    const startTime = this.metrics.get(`${key}_start`)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.metrics.set(key, duration)
    this.metrics.delete(`${key}_start`)
    
    return duration
  }

  // Get metric value
  getMetric(key: string): number | undefined {
    return this.metrics.get(key)
  }

  // Get all metrics
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {}
    this.metrics.forEach((value, key) => {
      if (!key.endsWith('_start')) {
        result[key] = value
      }
    })
    return result
  }

  // Log performance metrics
  logMetrics(): void {
    const metrics = this.getAllMetrics()
    console.group('🚀 Performance Metrics')
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`${key}: ${value.toFixed(2)}ms`)
    })
    console.groupEnd()
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear()
  }
}

// Convenience functions
export const perf = PerformanceMonitor.getInstance()

// HOC for measuring component render time
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    React.useEffect(() => {
      perf.startTiming(`${componentName}_render`)
      return () => {
        const duration = perf.endTiming(`${componentName}_render`)
        if (duration > 100) { // Log slow renders
          console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`)
        }
      }
    })

    return React.createElement(Component, props)
  }
}

// Hook for measuring custom operations
export function usePerformanceTracking(operationName: string) {
  const startTiming = () => perf.startTiming(operationName)
  const endTiming = () => perf.endTiming(operationName)
  
  return { startTiming, endTiming }
}
