/**
 * Performance Monitoring Utilities
 * Track page load times, API calls, and render performance
 */

/**
 * Track page load performance
 * @param {string} pageName - Name of the page being loaded
 */
export const trackPageLoad = (pageName) => {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  try {
    const loadTime = performance.now();

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
    }

    // Send to analytics if available (Google Analytics, Amplitude, etc.)
    if (window.gtag) {
      window.gtag('event', 'page_load', {
        page_name: pageName,
        load_time_ms: Math.round(loadTime),
        environment: process.env.NODE_ENV
      });
    }

    // Store in sessionStorage for debugging
    const perfData = JSON.parse(sessionStorage.getItem('perf_data') || '{}');
    perfData[pageName] = {
      loadTime: loadTime.toFixed(2),
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('perf_data', JSON.stringify(perfData));
  } catch (error) {
    // Silently fail - don't break the app for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PERF] Failed to track page load:', error);
    }
  }
};

/**
 * Track API call performance
 * @param {string} endpoint - API endpoint or service name
 * @param {number} duration - Duration in milliseconds
 * @param {boolean} success - Whether the call succeeded
 */
export const trackAPICall = (endpoint, duration, success = true) => {
  if (typeof window === 'undefined') return;

  try {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = success ? '✅' : '❌';
      console.log(`[API] ${emoji} ${endpoint} took ${duration.toFixed(2)}ms`);
    }

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'api_call', {
        endpoint,
        duration_ms: Math.round(duration),
        success,
        environment: process.env.NODE_ENV
      });
    }

    // Track API statistics
    const apiStats = JSON.parse(sessionStorage.getItem('api_stats') || '{}');
    if (!apiStats[endpoint]) {
      apiStats[endpoint] = {
        count: 0,
        totalDuration: 0,
        failures: 0,
        avgDuration: 0
      };
    }

    apiStats[endpoint].count += 1;
    apiStats[endpoint].totalDuration += duration;
    apiStats[endpoint].avgDuration = apiStats[endpoint].totalDuration / apiStats[endpoint].count;
    if (!success) {
      apiStats[endpoint].failures += 1;
    }

    sessionStorage.setItem('api_stats', JSON.stringify(apiStats));
  } catch (error) {
    // Silently fail
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PERF] Failed to track API call:', error);
    }
  }
};

/**
 * Track component render performance
 * @param {string} componentName - Name of the component
 * @param {number} renderTime - Render time in milliseconds
 */
export const trackComponentRender = (componentName, renderTime) => {
  if (typeof window === 'undefined') return;

  try {
    // Only log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 100) {
      console.warn(`[RENDER] ⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    // Track render statistics
    const renderStats = JSON.parse(sessionStorage.getItem('render_stats') || '{}');
    if (!renderStats[componentName]) {
      renderStats[componentName] = {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        avgTime: 0
      };
    }

    renderStats[componentName].count += 1;
    renderStats[componentName].totalTime += renderTime;
    renderStats[componentName].avgTime = renderStats[componentName].totalTime / renderStats[componentName].count;
    renderStats[componentName].maxTime = Math.max(renderStats[componentName].maxTime, renderTime);

    sessionStorage.setItem('render_stats', JSON.stringify(renderStats));
  } catch (error) {
    // Silently fail
  }
};

/**
 * Measure function execution time
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {Promise|any} - Result of the function
 */
export const measureAsync = async (fn, label) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${label} completed in ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.error(`[PERF] ${label} failed after ${duration.toFixed(2)}ms:`, error);
    }

    throw error;
  }
};

/**
 * Measure synchronous function execution time
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {any} - Result of the function
 */
export const measure = (fn, label) => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === 'development' && duration > 10) {
      console.log(`[PERF] ${label} completed in ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.error(`[PERF] ${label} failed after ${duration.toFixed(2)}ms:`, error);
    }

    throw error;
  }
};

/**
 * Get all performance statistics
 * @returns {Object} - Performance statistics
 */
export const getPerformanceStats = () => {
  try {
    return {
      pageLoad: JSON.parse(sessionStorage.getItem('perf_data') || '{}'),
      apiCalls: JSON.parse(sessionStorage.getItem('api_stats') || '{}'),
      renders: JSON.parse(sessionStorage.getItem('render_stats') || '{}')
    };
  } catch (error) {
    return { pageLoad: {}, apiCalls: {}, renders: {} };
  }
};

/**
 * Clear all performance statistics
 */
export const clearPerformanceStats = () => {
  try {
    sessionStorage.removeItem('perf_data');
    sessionStorage.removeItem('api_stats');
    sessionStorage.removeItem('render_stats');

    if (process.env.NODE_ENV === 'development') {
      console.log('[PERF] Cleared all performance statistics');
    }
  } catch (error) {
    // Silently fail
  }
};

/**
 * Log performance summary to console (development only)
 */
export const logPerformanceSummary = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const stats = getPerformanceStats();

  console.group('📊 Performance Summary');

  console.group('Page Loads');
  Object.entries(stats.pageLoad).forEach(([page, data]) => {
    console.log(`${page}: ${data.loadTime}ms`);
  });
  console.groupEnd();

  console.group('API Calls');
  Object.entries(stats.apiCalls).forEach(([endpoint, data]) => {
    const successRate = ((data.count - data.failures) / data.count * 100).toFixed(1);
    console.log(`${endpoint}: ${data.count} calls, avg ${data.avgDuration.toFixed(2)}ms, ${successRate}% success`);
  });
  console.groupEnd();

  console.group('Component Renders');
  Object.entries(stats.renders).forEach(([component, data]) => {
    console.log(`${component}: ${data.count} renders, avg ${data.avgTime.toFixed(2)}ms, max ${data.maxTime.toFixed(2)}ms`);
  });
  console.groupEnd();

  console.groupEnd();
};

// Export all monitoring functions
const performanceMonitor = {
  trackPageLoad,
  trackAPICall,
  trackComponentRender,
  measureAsync,
  measure,
  getPerformanceStats,
  clearPerformanceStats,
  logPerformanceSummary
};

export default performanceMonitor;
