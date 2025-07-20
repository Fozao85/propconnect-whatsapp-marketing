/**
 * Performance Monitoring Middleware
 * Tracks API response times and system metrics
 */

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now()
  
  // Track memory usage
  const memoryUsage = process.memoryUsage()
  
  // Override res.end to capture response time
  const originalEnd = res.end
  res.end = function(...args) {
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // Log performance metrics
    console.log(`📊 ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`)
    
    // Add performance headers
    res.set({
      'X-Response-Time': `${responseTime}ms`,
      'X-Memory-Usage': `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    })
    
    // Store metrics for analytics
    if (global.performanceMetrics) {
      global.performanceMetrics.push({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime,
        timestamp: new Date().toISOString(),
        memoryUsage: memoryUsage.heapUsed
      })
      
      // Keep only last 1000 metrics
      if (global.performanceMetrics.length > 1000) {
        global.performanceMetrics = global.performanceMetrics.slice(-1000)
      }
    } else {
      global.performanceMetrics = []
    }
    
    originalEnd.apply(this, args)
  }
  
  next()
}

// Get performance analytics
const getPerformanceAnalytics = () => {
  const metrics = global.performanceMetrics || []
  
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowestEndpoint: null,
      fastestEndpoint: null,
      errorRate: 0
    }
  }
  
  const totalRequests = metrics.length
  const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
  const errors = metrics.filter(m => m.statusCode >= 400).length
  const errorRate = (errors / totalRequests) * 100
  
  // Find slowest and fastest endpoints
  const sortedByTime = [...metrics].sort((a, b) => b.responseTime - a.responseTime)
  const slowestEndpoint = sortedByTime[0]
  const fastestEndpoint = sortedByTime[sortedByTime.length - 1]
  
  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    slowestEndpoint: slowestEndpoint ? {
      path: slowestEndpoint.path,
      responseTime: slowestEndpoint.responseTime
    } : null,
    fastestEndpoint: fastestEndpoint ? {
      path: fastestEndpoint.path,
      responseTime: fastestEndpoint.responseTime
    } : null,
    errorRate: Math.round(errorRate * 100) / 100,
    memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  }
}

module.exports = {
  performanceMonitor,
  getPerformanceAnalytics
}
