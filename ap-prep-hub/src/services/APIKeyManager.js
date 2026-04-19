/**
 * API Key Manager for Gemini API
 * Handles rotation through multiple API keys to manage rate limits
 */

class APIKeyManager {
  constructor() {
    // Load all available API keys from environment variables
    this.apiKeys = [
      process.env.REACT_APP_GEMINI_API_KEY,
      process.env.REACT_APP_GEMINI_API_KEY_2,
      process.env.REACT_APP_GEMINI_API_KEY_3,
      process.env.REACT_APP_GEMINI_API_KEY_4,
      process.env.REACT_APP_GEMINI_API_KEY_5,
      process.env.REACT_APP_GEMINI_API_KEY_6,
      process.env.REACT_APP_GEMINI_API_KEY_7,
      process.env.REACT_APP_GEMINI_API_KEY_8,
      process.env.REACT_APP_GEMINI_API_KEY_9,
      process.env.REACT_APP_GEMINI_API_KEY_10,
      process.env.REACT_APP_GEMINI_API_KEY_11
    ].filter(key => key && key.trim() !== ''); // Filter out undefined/empty keys

    this.currentKeyIndex = 0;
    // Default model can be overridden via env or at runtime
    this.defaultModel = this._normalizeGoogleModel(
      process.env.REACT_APP_GEMINI_MODEL && process.env.REACT_APP_GEMINI_MODEL.trim() !== ''
        ? process.env.REACT_APP_GEMINI_MODEL.trim()
        : 'gemini-2.5-flash'
    );
    this.failedKeys = new Set();
    this.keyRetryTimes = new Map(); // Track when keys can be retried
    this.keyFailureCounts = new Map(); // Track consecutive failures per key for exponential backoff

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 APIKeyManager: Loaded ${this.apiKeys.length} API key(s) for rotation`);
    }

    // Validate we have at least one key — in production this is expected
    // when Puter is the primary AI provider, so only warn (not error).
    if (this.apiKeys.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No Google API keys found. AI will use Puter; configure REACT_APP_GEMINI_API_KEY for fallback.');
      }
    }
  }

  /**
   * Ensure the model name is compatible with Google's Generative Language API.
   * Non-Gemini provider model names (e.g. claude-sonnet-4) are routed to a
   * safe Gemini default so fallback requests still work.
   */
  _normalizeGoogleModel(modelName) {
    const raw = (modelName || '').toString().trim().replace(/^models\//, '');
    if (!raw) return 'gemini-2.5-flash';
    if (!raw.toLowerCase().startsWith('gemini-')) return 'gemini-2.5-flash';
    return raw;
  }

  _getApiVersionForModel(modelName) {
    const model = this._normalizeGoogleModel(modelName);
    return model.startsWith('gemini-2.5') ? 'v1beta' : 'v1';
  }

  /**
   * Get the current API key
   */
  getCurrentKey() {
    if (this.apiKeys.length === 0) {
      throw new Error('No valid API keys configured. Please add REACT_APP_GEMINI_API_KEY to your environment.');
    }
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Get the current API URL with key
   */
  getCurrentUrl() {
    const key = this.apiKeys[this.currentKeyIndex];
    const model = this._normalizeGoogleModel(this.defaultModel);
    const apiVersion = this._getApiVersionForModel(model);
    return `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${key}`;
  }

  /**
   * Build a generateContent URL for a specific model name
   */
  getGenerateContentUrl(modelName) {
    const key = this.apiKeys[this.currentKeyIndex];
    const model = this._normalizeGoogleModel(modelName || this.defaultModel);
    const apiVersion = this._getApiVersionForModel(model);
    return `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${key}`;
  }

  /**
   * Build a ListModels URL for the current key
   */
  getModelsListUrl() {
    const key = this.apiKeys[this.currentKeyIndex];
    return `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
  }

  /**
   * Update default model at runtime after discovery
   */
  setDefaultModel(modelName) {
    if (modelName && typeof modelName === 'string') {
      this.defaultModel = this._normalizeGoogleModel(modelName);
    }
  }

  /**
   * Mark the current key as failed and rotate to next available key
   */
  markCurrentKeyFailed(retryAfterSeconds = 300) {
    // Track consecutive failures for exponential backoff
    const failCount = (this.keyFailureCounts.get(this.currentKeyIndex) || 0) + 1;
    this.keyFailureCounts.set(this.currentKeyIndex, failCount);

    // Exponential backoff: 300s, 600s, 1200s, ... capped at 3600s, plus jitter
    const baseDelay = retryAfterSeconds;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, failCount - 1), 3600);
    const jitter = Math.random() * 30; // 0-30s random jitter
    const actualDelay = exponentialDelay + jitter;

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Marking API key ${this.currentKeyIndex + 1} as failed (attempt ${failCount}), will retry after ${actualDelay.toFixed(0)} seconds`);
    }

    // Mark key as failed with retry time
    this.failedKeys.add(this.currentKeyIndex);
    const retryTime = Date.now() + (actualDelay * 1000);
    this.keyRetryTimes.set(this.currentKeyIndex, retryTime);

    // Remove from failed set after retry time and reset failure count
    const keyIndex = this.currentKeyIndex;
    setTimeout(() => {
      this.failedKeys.delete(keyIndex);
      this.keyRetryTimes.delete(keyIndex);
      this.keyFailureCounts.delete(keyIndex);
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API key ${keyIndex + 1} is now available for retry`);
      }
    }, actualDelay * 1000);

    // Rotate to next available key
    this.rotateToNextKey();
  }

  /**
   * Rotate to the next available API key
   */
  rotateToNextKey() {
    const startIndex = this.currentKeyIndex;
    let attempts = 0;
    
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      attempts++;
      
      // Check if current key is available (not failed or past retry time)
      if (!this.failedKeys.has(this.currentKeyIndex)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Rotated to API key ${this.currentKeyIndex + 1}`);
        }
        return true;
      }

      // Check if retry time has passed
      const retryTime = this.keyRetryTimes.get(this.currentKeyIndex);
      if (retryTime && Date.now() >= retryTime) {
        this.failedKeys.delete(this.currentKeyIndex);
        this.keyRetryTimes.delete(this.currentKeyIndex);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Rotated to API key ${this.currentKeyIndex + 1} (retry time passed)`);
        }
        return true;
      }
      
    } while (this.currentKeyIndex !== startIndex && attempts < this.apiKeys.length);
    
    // If we've tried all keys and none are available
    if (attempts >= this.apiKeys.length) {
      console.error('❌ All API keys are currently rate limited. Please wait or add more keys.');
      // Reset to first key as fallback
      this.currentKeyIndex = 0;
      return false;
    }
    
    return true;
  }

  /**
   * Get total number of available keys
   */
  getTotalKeys() {
    return this.apiKeys.length;
  }

  /**
   * Get current key index (for debugging)
   */
  getCurrentKeyIndex() {
    return this.currentKeyIndex;
  }

  /**
   * Get status of all keys
   */
  getKeyStatus() {
    return this.apiKeys.map((key, index) => ({
      index: index + 1,
      isFailed: this.failedKeys.has(index),
      retryTime: this.keyRetryTimes.get(index),
      isCurrent: index === this.currentKeyIndex
    }));
  }

  /**
   * Force rotation to next key (useful for testing)
   */
  forceRotate() {
    this.rotateToNextKey();
  }

  /**
   * Reset all failed keys (emergency recovery)
   */
  resetAllKeys() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Resetting all API keys...');
    }
    this.failedKeys.clear();
    this.keyRetryTimes.clear();
    this.keyFailureCounts.clear();
    this.currentKeyIndex = 0;
  }
}

// Export singleton instance
const apiKeyManager = new APIKeyManager();
export default apiKeyManager;
