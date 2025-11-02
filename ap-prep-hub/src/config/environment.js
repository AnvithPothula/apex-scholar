/**
 * Production Environment Configuration
 * Manages different settings for development vs production
 */

const ENV_CONFIG = {
  development: {
    apiManager: {
      userRateLimit: {
        requestsPerMinute: 20,  // Higher limits for development
        tokensPerMinute: 100000,
        burstLimit: 5
      },
      globalRateLimit: {
        requestsPerMinute: 1000,
        maxConcurrent: 50,
        queueSize: 2000
      },
      batching: {
        maxBatchSize: 10,
        delayBetweenBatches: 2000 // 2 seconds
      },
      showSystemStatus: true,
      verboseLogging: true
    }
  },
  
  production: {
    apiManager: {
      userRateLimit: {
        requestsPerMinute: 10,  // Conservative limits for production
        tokensPerMinute: 50000,
        burstLimit: 3
      },
      globalRateLimit: {
        requestsPerMinute: 600,
        maxConcurrent: 20,
        queueSize: 1000
      },
      batching: {
        maxBatchSize: 5,
        delayBetweenBatches: 6000 // 6 seconds
      },
      showSystemStatus: false, // Hide from regular users in production
      verboseLogging: false
    }
  },
  
  enterprise: {
    apiManager: {
      userRateLimit: {
        requestsPerMinute: 50,  // Higher limits for enterprise
        tokensPerMinute: 200000,
        burstLimit: 10
      },
      globalRateLimit: {
        requestsPerMinute: 2000,
        maxConcurrent: 100,
        queueSize: 5000
      },
      batching: {
        maxBatchSize: 15,
        delayBetweenBatches: 1000 // 1 second
      },
      showSystemStatus: true,
      verboseLogging: true
    }
  }
};

// Determine current environment
const getCurrentEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    // Check if this is an enterprise deployment
    if (process.env.REACT_APP_DEPLOYMENT_TYPE === 'enterprise') {
      return 'enterprise';
    }
    return 'production';
  }
  return 'development';
};

// Get current configuration
export const getConfig = () => {
  const env = getCurrentEnvironment();
  return ENV_CONFIG[env];
};

// Helper functions for feature flags
export const isFeatureEnabled = (feature) => {
  const config = getConfig();
  return config.apiManager[feature] || false;
};

export const getBatchingConfig = () => {
  return getConfig().apiManager.batching;
};

export const getRateLimitConfig = () => {
  return {
    user: getConfig().apiManager.userRateLimit,
    global: getConfig().apiManager.globalRateLimit
  };
};

const environment = {
  getConfig,
  isFeatureEnabled,
  getBatchingConfig,
  getRateLimitConfig,
  getCurrentEnvironment
};

export default environment;
