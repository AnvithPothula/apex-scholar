import apiKeyManager from './APIKeyManager';

// Small utility: wait for a promise with timeout
const withTimeout = (promise, ms, errMsg = 'Timed out') => {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(errMsg)), ms); })
  ]);
};

/**
 * Custom error class for rate limit situations
 */
class RateLimitError extends Error {
  constructor(message, retryAfterSeconds = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfterSeconds;
    this.isRateLimit = true;
  }
}

/**
 * Sanitize user input to prevent prompt injection attacks
 * This should be applied to any user-provided text before including it in AI prompts
 */
const sanitizeForPrompt = (input, options = {}) => {
  if (!input || typeof input !== 'string') return '';
  
  const { maxLength = 10000, allowMarkdown = true } = options;
  
  let sanitized = input;
  
  // 1. Truncate to max length to prevent token exhaustion attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '... [truncated]';
  }
  
  // 2. Remove/neutralize prompt injection patterns
  const injectionPatterns = [
    // Direct instruction overrides
    /\[?\s*ignore\s+(all\s+)?(previous\s+)?instructions?\s*\]?/gi,
    /\[?\s*disregard\s+(all\s+)?(previous\s+)?instructions?\s*\]?/gi,
    /\[?\s*forget\s+(everything|all)\s+(above|before)\s*\]?/gi,
    /\[?\s*system\s*:?\s*prompt\s*\]?/gi,
    /\[?\s*new\s+instructions?\s*:?\s*\]?/gi,
    
    // Role manipulation
    /\b(you\s+are\s+now|act\s+as(\s+if)?|pretend\s+(to\s+be|you('re|are))|roleplay\s+as|simulate\s+being|behave\s+as)\b/gi,
    /\bswitch\s+to\s+(a\s+)?different\s+(mode|persona|role)\b/gi,
    
    // System prompt extraction attempts
    /\b(reveal|show|display|print|output)\s+(your\s+)?(system\s+)?(prompt|instructions?|rules?)\b/gi,
    /what\s+(are\s+)?(your\s+)?(system\s+)?(prompt|instructions?|rules?)/gi,
    
    // Output manipulation
    /\[?\s*(begin|start)\s+(output|response)\s*\]?/gi,
    /\brespond\s+with\s+only\b/gi,
    
    // Delimiter injection
    /```\s*(system|assistant|user)\s*\n/gi,
    /<\s*\|?(system|assistant|user|im_start|im_end)\|?\s*>/gi,
    
    // SQL-like injection (in case prompts hit databases)
    /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)\s/gi,
    /'\s*OR\s+'?\d+'?\s*=\s*'?\d+/gi,
    /"\s*OR\s+"?\d+"?\s*=\s*"?\d+/gi,
    /--\s*$/gm,
    
    // Command injection patterns
    /\$\([^)]+\)/g, // $(command)
    /`[^`]+`/g, // `command` - but preserve markdown code blocks
  ];
  
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }
  
  // 3. Escape special delimiters that might confuse the model
  // But preserve legitimate markdown if allowed
  if (!allowMarkdown) {
    sanitized = sanitized
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/```/g, "'''");
  }
  
  // 4. Remove null bytes and other control characters (except newlines/tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // eslint-disable-line no-control-regex
  
  // 5. Normalize excessive whitespace
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n').replace(/[ \t]{10,}/g, '    ');
  
  return sanitized.trim();
};

/**
 * Check if an error indicates rate limiting
 */
const isRateLimitError = (error) => {
  if (!error) return false;
  const msg = String(error.message || error).toLowerCase();
  return (
    error.isRateLimit ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('quota') ||
    msg.includes('429') ||
    msg.includes('too many requests') ||
    msg.includes('resource exhausted') ||
    (msg.includes('all') && msg.includes('api keys'))
  );
};

class GeminiService {
  constructor() {
    // Default model selection (can be overridden by env or runtime discovery)
    this.modelName = (process.env.REACT_APP_GEMINI_MODEL && process.env.REACT_APP_GEMINI_MODEL.trim() !== '')
      ? process.env.REACT_APP_GEMINI_MODEL.trim()
      : 'google/gemini-2.0-flash-lite-001';
    this.debug = (process.env.REACT_APP_AI_DEBUG || '').toLowerCase() !== 'false';
    this._workingModel = null;
    this._workingModelSupportsMM = false;
    this._lastPuterFailureAt = 0; // for backoff on repeated failures
    this._rateLimitUntil = 0; // Timestamp until which we should not make requests

    // Request deduplication cache
    this._requestCache = new Map(); // hash -> {promise, timestamp}
    this._cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this._cacheCleanupInterval = null;

    // Start cache cleanup interval
    this._startCacheCleanup();
  }

  /**
   * Sanitize user input before including in prompts
   * Exported for use by other components
   */
  sanitizeInput(input, options = {}) {
    return sanitizeForPrompt(input, options);
  }

  /**
   * Check if we're currently rate limited
   */
  isRateLimited() {
    return Date.now() < this._rateLimitUntil;
  }

  /**
   * Get seconds until rate limit expires
   */
  getRateLimitSecondsRemaining() {
    const remaining = this._rateLimitUntil - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  /**
   * Handle rate limit error - set backoff and throw user-friendly error
   */
  _handleRateLimit(error, context = '') {
    const retryAfter = 60; // Default 60 seconds
    this._rateLimitUntil = Date.now() + (retryAfter * 1000);
    
    console.error(`[AI] Rate limit hit${context ? ` during ${context}` : ''}:`, error.message);
    
    throw new RateLimitError(
      `AI service is temporarily unavailable due to high demand. Please wait ${retryAfter} seconds and try again.`,
      retryAfter
    );
  }

  /**
   * Robust JSON extraction and parsing with multiple fallback strategies
   * Handles malformed JSON, code blocks, and partial responses
   */
  _extractJSON(text, expectArray = false) {
    if (!text || typeof text !== 'string') {
      return { success: false, data: null, error: 'Empty or invalid input' };
    }

    // Step 1: Clean the response
    let cleaned = text
      .replace(/^```json\s*/gi, '')
      .replace(/^```\s*/gi, '')
      .replace(/\s*```\s*$/gi, '')
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .replace(/^`+|`+$/g, '')
      .trim();

    // Normalize unicode and whitespace
    cleaned = cleaned
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, '-')
      .replace(/\u00A0/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Step 2: Try direct parsing
    try {
      const parsed = JSON.parse(cleaned);
      if (expectArray && !Array.isArray(parsed)) {
        return { success: false, data: null, error: 'Expected array but got object' };
      }
      return { success: true, data: parsed, error: null };
    } catch (e) {
      // Continue with repair strategies
    }

    // Step 3: Find JSON bounds using brace matching
    const startChar = expectArray ? '[' : '{';
    const endChar = expectArray ? ']' : '}';
    const startIdx = cleaned.indexOf(startChar);
    if (startIdx === -1) {
      return { success: false, data: null, error: `No ${startChar} found in response` };
    }

    // Count braces to find matching end
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let endIdx = -1;

    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === startChar) braceCount++;
        if (char === endChar) {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }

    if (endIdx === -1) {
      // Try to repair truncated JSON
      return this._repairTruncatedJSON(cleaned.slice(startIdx), expectArray);
    }

    const candidate = cleaned.slice(startIdx, endIdx + 1);

    // Step 4: Try parsing extracted JSON
    try {
      return { success: true, data: JSON.parse(candidate), error: null };
    } catch (e) {
      // Step 5: Apply common fixes
      return this._repairJSON(candidate, expectArray);
    }
  }

  /**
   * Attempt to repair common JSON issues
   */
  _repairJSON(text, expectArray = false) {
    const repairs = [
      // Remove trailing commas
      t => t.replace(/,\s*([}\]])/g, '$1'),
      // Fix unescaped quotes in strings (tricky - basic attempt)
      t => t.replace(/([^\\])"([^":,{}[\]]+)":/g, '$1"$2":'),
      // Remove control characters
      t => t.replace(/[\x00-\x1F\x7F]/g, ' '), // eslint-disable-line no-control-regex
      // Fix double commas
      t => t.replace(/,,+/g, ','),
      // Remove empty array elements
      t => t.replace(/\[\s*,/g, '[').replace(/,\s*\]/g, ']'),
      // Fix invalid escape sequences that aren't valid JSON
      t => t.replace(/\\([^"\\/bfnrtu])/g, '$1'),
      // Fix missing quotes on keys (basic)
      t => t.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
    ];

    let repaired = text;
    for (const repair of repairs) {
      try {
        repaired = repair(repaired);
        const parsed = JSON.parse(repaired);
        if (this.debug) console.debug('[AI] JSON repaired successfully');
        return { success: true, data: parsed, error: null };
      } catch (e) {
        // Continue trying repairs
      }
    }

    return { success: false, data: null, error: 'Could not repair JSON' };
  }

  /**
   * Attempt to repair truncated JSON by closing open structures
   */
  _repairTruncatedJSON(text, expectArray = false) {
    if (this.debug) console.debug('[AI] Attempting to repair truncated JSON');

    let repaired = text.trim();

    // Count unclosed braces/brackets
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of repaired) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    // If we're in a string, close it
    if (inString) {
      repaired += '"';
    }

    // Remove any trailing incomplete key-value pairs
    repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/g, '');
    repaired = repaired.replace(/,\s*"[^"]*"\s*$/g, '');
    repaired = repaired.replace(/,\s*$/g, '');

    // Close unclosed structures
    for (let i = 0; i < openBraces; i++) {
      repaired += '}';
    }
    for (let i = 0; i < openBrackets; i++) {
      repaired += ']';
    }

    try {
      const parsed = JSON.parse(repaired);
      if (this.debug) console.debug('[AI] Truncated JSON repaired successfully');
      return { success: true, data: parsed, error: null, wasRepaired: true };
    } catch (e) {
      return { success: false, data: null, error: 'Could not repair truncated JSON: ' + e.message };
    }
  }

  /**
   * Validate AI response for common hallucination patterns
   */
  _validateResponse(text, context = {}) {
    if (!text || typeof text !== 'string') {
      return { valid: false, reason: 'Empty response' };
    }

    // Check for common hallucination/confusion patterns
    const hallucinations = [
      /I('m| am) (an AI|a language model|unable to|not able to)/i,
      /I (don't|cannot|can't) (have access|see|view|process) (the|your|any) (image|file|upload)/i,
      /please (provide|share|upload|send) (the|your|an)/i,
      /I('d| would) be happy to help.*but/i,
      /As an AI/i,
      /I apologize.*I (cannot|can't|don't)/i,
      /Could you (please )?(provide|share|clarify)/i,
    ];

    // Only flag as hallucination if asking for something already provided
    if (context.hasImage || context.hasFile) {
      for (const pattern of hallucinations) {
        if (pattern.test(text)) {
          return { valid: false, reason: 'AI is asking for already-provided content', pattern: pattern.source };
        }
      }
    }

    // Check for empty or stub responses
    if (text.trim().length < 20) {
      return { valid: false, reason: 'Response too short' };
    }

    return { valid: true };
  }

  /**
   * Start periodic cleanup of expired cache entries
   */
  _startCacheCleanup() {
    if (this._cacheCleanupInterval) return;

    this._cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [hash, entry] of this._requestCache.entries()) {
        if (now - entry.timestamp > this._cacheExpiry) {
          this._requestCache.delete(hash);
        }
      }
    }, 60 * 1000); // Clean up every minute
  }

  /**
   * Generate a hash for request deduplication
   */
  _hashRequest(prompt, options = {}) {
    const key = `${prompt.substring(0, 100)}_${options.temperature || 0}_${options.maxTokens || 0}_${options.model || ''}`;
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Check if identical request is in cache
   */
  _getFromCache(hash) {
    const entry = this._requestCache.get(hash);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this._cacheExpiry) {
      this._requestCache.delete(hash);
      return null;
    }

    if (this.debug) console.debug('[AI] Request cache hit', { hash, age });
    return entry.promise;
  }

  /**
   * Add request to cache
   */
  _addToCache(hash, promise) {
    this._requestCache.set(hash, {
      promise,
      timestamp: Date.now()
    });

    // Auto-cleanup this entry after expiry
    setTimeout(() => {
      this._requestCache.delete(hash);
    }, this._cacheExpiry);
  }
  // Normalize payload parts to Google's expected snake_case for inline image data
  _normalizePayloadForGoogle(payload) {
    try {
      const p = JSON.parse(JSON.stringify(payload || {}));
      if (Array.isArray(p.contents)) {
        p.contents = p.contents.map(c => {
          const parts = Array.isArray(c?.parts) ? c.parts.map(part => {
            if (part && part.inlineData && !part.inline_data) {
              const id = part.inlineData;
              const nd = { inline_data: { mime_type: id.mime_type || id.mimeType, data: id.data } };
              if (part.text) nd.text = part.text;
              return nd;
            }
            // Ensure mime_type key when present under inline_data
            if (part && part.inline_data) {
              const id = part.inline_data;
              return { ...part, inline_data: { mime_type: id.mime_type || id.mimeType, data: id.data } };
            }
            return part;
          }) : [];
          return { ...c, parts };
        });
      }
      return p;
    } catch (_) {
      return payload;
    }
  }
  // Try a list of candidate models on Puter with a tiny prompt; cache the first that works
  async ensureWorkingModel(opts = {}) {
    const multimodal = !!opts.multimodal;
    const probeMs = typeof opts.probeMs === 'number' ? opts.probeMs : 3000; // slightly less aggressive
    // Basic backoff to avoid hammering Puter when it's down
    if (this._lastPuterFailureAt && Date.now() - this._lastPuterFailureAt < 15000) {
      throw new Error('Puter temporarily unavailable (backoff)');
    }

    // Check localStorage cache first
    try {
      const cacheKey = multimodal ? 'gemini_mm_model' : 'gemini_text_model';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { model, timestamp} = JSON.parse(cached);
        const age = Date.now() - timestamp;
        // Cache valid for 1 hour
        if (age < 3600000) {
          this._workingModel = model;
          this._workingModelSupportsMM = multimodal;
          if (this.debug) console.debug('[AI] Using cached working model', { model, age });
          return model;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
      if (this.debug) console.warn('[AI] localStorage cache read failed', e);
    }

    if (this._workingModel && (!multimodal || (multimodal && this._workingModelSupportsMM))) {
      return this._workingModel;
    }
    const envModel = (process.env.REACT_APP_GEMINI_MODEL || '').trim();
    // Prefer image-capable models when multimodal is requested
    // Keep candidate list short to avoid long probe chains
    const mmCandidates = [
      envModel || null,
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash-image-preview:free',
      'google/gemini-flash-1.5-8b',
      'google/gemini-flash-1.5'
    ].filter(Boolean);
    const textCandidates = [
      envModel || null,
      'google/gemini-2.0-flash-lite-001',
      'google/gemini-2.0-flash-001',
      'google/gemini-2.0-flash-exp:free'
    ].filter(Boolean);
    const candidates = Array.from(new Set(multimodal ? mmCandidates : textCandidates));

    const puter = this.getPuter();
    if (!puter) throw new Error('Puter.js is not available');

    // Try default (no model specified) first to discover a server-side default
    try {
      const t0 = Date.now();
      const resp = await withTimeout(puter.ai.chat('PING', { stream: false }), probeMs, 'Puter default probe timed out');
      const text = (resp && resp.message && typeof resp.message.content === 'string') ? resp.message.content : (typeof resp === 'string' ? resp : resp?.text || '');
      if (text) {
        this._workingModel = null; // indicates using server default is fine
        this._workingModelSupportsMM = multimodal; // unknown, but assume fine for text-only; will re-probe for MM when needed
        if (this.debug) console.debug('[AI] ensureWorkingModel selected default model', { ms: Date.now() - t0 });
        return null;
      }
    } catch (e) {
      if (this.debug) console.warn('[AI] ensureWorkingModel default probe failed', String(e));
      this._lastPuterFailureAt = Date.now();
    }

    for (const m of candidates) {
      try {
        const t0 = Date.now();
        const resp = await withTimeout(puter.ai.chat('PING', { model: m, stream: false }), probeMs, 'Puter probe timed out');
        const text = (resp && resp.message && typeof resp.message.content === 'string') ? resp.message.content : (typeof resp === 'string' ? resp : resp?.text || '');
        if (text) {
          this._workingModel = m;
          this._workingModelSupportsMM = multimodal;
          if (this.debug) console.debug('[AI] ensureWorkingModel selected', { model: m, ms: Date.now() - t0 });

          // Cache the successful model to localStorage
          try {
            const cacheKey = multimodal ? 'gemini_mm_model' : 'gemini_text_model';
            localStorage.setItem(cacheKey, JSON.stringify({
              model: m,
              timestamp: Date.now()
            }));
          } catch (e) {
            // Ignore localStorage errors
            if (this.debug) console.warn('[AI] localStorage cache write failed', e);
          }

          return m;
        }
      } catch (e) {
        if (this.debug) console.warn('[AI] ensureWorkingModel candidate failed', { model: m, error: String(e) });
        this._lastPuterFailureAt = Date.now();
      }
    }
    // If none worked, leave null and let caller fallback to Google
    throw new Error('No Puter models responded');
  }
  // Safe access to Puter SDK in browser
  getPuter() {
    try {
      if (typeof window !== 'undefined' && window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
        return window.puter;
      }
    } catch (_) { /* ignore */ }
    return null;
  }

  async generateContent(prompt, options = {}) {
    let model = options.model || this._workingModel || this.modelName;
    const t0 = Date.now();

    // Check cache for duplicate requests
    const requestHash = this._hashRequest(prompt, options);
    const cachedPromise = this._getFromCache(requestHash);
    if (cachedPromise) {
      return await cachedPromise;
    }

    // Create the actual request promise
    const requestPromise = this._doGenerateContent(prompt, options, model, t0);

    // Cache the promise for deduplication
    this._addToCache(requestHash, requestPromise);

    return await requestPromise;
  }

  async _doGenerateContent(prompt, options, model, t0) {
    // Check if we're rate limited
    if (this.isRateLimited()) {
      const seconds = this.getRateLimitSecondsRemaining();
      throw new RateLimitError(
        `AI service is temporarily unavailable. Please wait ${seconds} seconds and try again.`,
        seconds
      );
    }

    // Try Puter first with a timeout
    try {
      const puter = this.getPuter();
      if (!puter) {
        throw new Error('Puter.js is not available');
      }
      const puterOpts = model ? { model, stream: false } : { stream: false };
      if (this.debug) console.debug('[AI] Puter.generateContent start', { model: model || 'default', hasImage: false });
      const resp = await withTimeout(puter.ai.chat(prompt, puterOpts), Math.min(options.timeoutMs || 8000, 12000), 'Puter request timed out');
      if (this.debug) console.debug('[AI] Puter.generateContent success', { model, ms: Date.now() - t0, respType: typeof resp });
      if (resp && resp.message && typeof resp.message.content === 'string') return resp.message.content;
      if (typeof resp === 'string') return resp;
      // Some models may return an object with text
      if (resp && typeof resp.text === 'string') return resp.text;
      throw new Error('Unexpected response from Puter.ai.chat');
    } catch (e) {
      // Check if Puter returned a rate limit error
      if (isRateLimitError(e)) {
        this._handleRateLimit(e, 'Puter generateContent');
      }
      
      if (this.debug) console.warn('[AI] Puter.generateContent failed, falling back to Google', { error: String(e), ms: Date.now() - t0 });
      this._lastPuterFailureAt = Date.now();
      // One quick retry with a discovered model if we didn't have one yet
      try {
        const puter = this.getPuter();
        if (puter && !options.model && (!this._lastPuterFailureAt || Date.now() - this._lastPuterFailureAt > 15000)) {
          const retryModel = await this.ensureWorkingModel({ multimodal: false, probeMs: 3000 });
          const tR = Date.now();
          const resp = await withTimeout(puter.ai.chat(prompt, { model: retryModel || undefined, stream: false }), 5000, 'Puter retry timed out');
          if (this.debug) console.debug('[AI] Puter.generateContent retry success', { model: retryModel, ms: Date.now() - tR });
          if (resp && resp.message && typeof resp.message.content === 'string') return resp.message.content;
          if (typeof resp === 'string') return resp;
          if (resp && typeof resp.text === 'string') return resp.text;
        }
      } catch (er) {
        if (this.debug) console.warn('[AI] Puter.generateContent retry failed', String(er));
        if (isRateLimitError(er)) {
          this._handleRateLimit(er, 'Puter retry');
        }
      }
      // Fallback to Google Gemini v1
      return await this._googleFallback(prompt, options);
    }
  }

  /**
   * Google API fallback with proper rate limit handling
   */
  async _googleFallback(prompt, options = {}) {
    // Check if all API keys are rate limited
    const keyStatus = apiKeyManager.getKeyStatus();
    const allFailed = keyStatus.every(k => k.isFailed);
    if (allFailed) {
      this._handleRateLimit(new Error('All API keys exhausted'), 'Google fallback');
    }

    const apiUrl = apiKeyManager.getCurrentUrl();
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 4000
      }
    };
    const t1 = Date.now();
    const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      
      // Check for rate limit response (429 or quota errors)
      if (res.status === 429 || t.toLowerCase().includes('quota') || t.toLowerCase().includes('rate')) {
        apiKeyManager.markCurrentKeyFailed(300); // Mark failed for 5 minutes
        
        // Try rotating to another key
        const rotated = apiKeyManager.rotateToNextKey();
        if (!rotated) {
          // All keys are exhausted
          this._handleRateLimit(new Error(`Rate limited: ${res.status}`), 'Google API');
        }
        
        // Retry with new key (one retry only)
        const retryUrl = apiKeyManager.getCurrentUrl();
        const retryRes = await fetch(retryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!retryRes.ok) {
          const retryText = await retryRes.text().catch(() => '');
          if (retryRes.status === 429) {
            this._handleRateLimit(new Error('All API keys rate limited'), 'Google retry');
          }
          throw new Error(`Google fallback failed: ${retryRes.status} ${retryText}`);
        }
        const retryData = await retryRes.json();
        return retryData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
      
      throw new Error(`Google fallback failed: ${res.status} ${t}`);
    }
    const data = await res.json();
    if (this.debug) console.debug('[AI] Google.generateContent success', { ms: Date.now() - t1 });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Empty response from Google fallback');
    return text;
  }

  async generateWithImages(prompt, images = [], options = {}) {
    // Check if we're rate limited
    if (this.isRateLimited()) {
      const seconds = this.getRateLimitSecondsRemaining();
      throw new RateLimitError(
        `AI service is temporarily unavailable. Please wait ${seconds} seconds and try again.`,
        seconds
      );
    }

    let model = options.model || this._workingModel || this.modelName;
    const t0 = Date.now();
    // If an image is provided, pass the first as a data URL to Puter
    let imageArg = undefined;
    if (Array.isArray(images) && images.length > 0) {
      const img = images[0];
      if (img && (img.data || img.inline_data?.data)) {
        const mime = img.mimeType || img.inline_data?.mime_type || 'image/png';
        const data = img.data || img.inline_data?.data;
        imageArg = `data:${mime};base64,${data}`;
      } else if (typeof img === 'string') {
        imageArg = img; // assume URL
      }
    }
    // If we only have a data: URL, skip Puter and go straight to Google (Puter expects an http(s) URL)
    if (typeof imageArg === 'string' && imageArg.startsWith('data:')) {
      if (this.debug) console.warn('[AI] Skipping Puter for data URL image; using Google fallback');
      return await this._googleGenerateWithImages(prompt, imageArg, options);
    }
    try {
      const puter = this.getPuter();
      if (!puter) {
        throw new Error('Puter.js is not available');
      }
      const puterOptsBase = { stream: false };
      const puterOpts = model ? { ...puterOptsBase, model } : puterOptsBase;
      if (this.debug) console.debug('[AI] Puter.generateWithImages start', { model: model || 'default', hasImage: !!imageArg });
      const p = imageArg
        ? puter.ai.chat(prompt, imageArg, puterOpts)
        : puter.ai.chat(prompt, puterOpts);
      const resp = await withTimeout(p, Math.min(options.timeoutMs || 9000, 12000), 'Puter image request timed out');
      if (this.debug) console.debug('[AI] Puter.generateWithImages success', { model, ms: Date.now() - t0, respType: typeof resp });
      
      let responseText = null;
      if (resp && resp.message && typeof resp.message.content === 'string') responseText = resp.message.content;
      else if (typeof resp === 'string') responseText = resp;
      else if (resp && typeof resp.text === 'string') responseText = resp.text;
      
      if (!responseText) {
        throw new Error('Unexpected response from Puter.ai.chat (images)');
      }
      
      // Validate for hallucinations when image was provided
      const validation = this._validateResponse(responseText, { hasImage: !!imageArg });
      if (!validation.valid) {
        console.warn('[AI] Image response failed validation:', validation.reason);
        throw new Error(`Response validation failed: ${validation.reason}`);
      }
      
      return responseText;
    } catch (e) {
      if (isRateLimitError(e)) {
        this._handleRateLimit(e, 'Puter generateWithImages');
      }
      if (this.debug) console.warn('[AI] Puter.generateWithImages failed, falling back to Google', { error: String(e), ms: Date.now() - t0 });
      this._lastPuterFailureAt = Date.now();
      return await this._googleGenerateWithImages(prompt, imageArg, options);
    }
  }

  // Internal helper to call Google for image generation with rate limit handling
  async _googleGenerateWithImages(prompt, imageArg, options = {}) {
    // Check if all API keys are rate limited
    const keyStatus = apiKeyManager.getKeyStatus();
    const allFailed = keyStatus.every(k => k.isFailed);
    if (allFailed) {
      this._handleRateLimit(new Error('All API keys exhausted for image request'), 'Google image fallback');
    }

    const apiUrl = apiKeyManager.getCurrentUrl();
    const parts = [{ text: prompt }];
    if (imageArg && typeof imageArg === 'string') {
      if (imageArg.startsWith('data:')) {
        const [meta, b64] = imageArg.split(',');
        const mime = meta.substring(5, meta.indexOf(';'));
        parts.push({ inline_data: { mime_type: mime, data: b64 } });
      } else {
        // For a remote URL, include it as text; Google's v1 can accept image parts only as inline_data here
        parts.push({ text: imageArg });
      }
    }
    const body = {
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: options.temperature ?? 0.2, maxOutputTokens: options.maxTokens ?? 1000 }
    };
    const t1 = Date.now();
    const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      
      // Check for rate limit
      if (res.status === 429 || t.toLowerCase().includes('quota') || t.toLowerCase().includes('rate')) {
        apiKeyManager.markCurrentKeyFailed(300);
        const rotated = apiKeyManager.rotateToNextKey();
        if (!rotated) {
          this._handleRateLimit(new Error(`Rate limited on image request: ${res.status}`), 'Google image API');
        }
        // One retry with new key
        const retryUrl = apiKeyManager.getCurrentUrl();
        const retryRes = await fetch(retryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!retryRes.ok) {
          if (retryRes.status === 429) {
            this._handleRateLimit(new Error('All keys rate limited for images'), 'Google image retry');
          }
          throw new Error(`Google image fallback failed: ${retryRes.status}`);
        }
        const retryData = await retryRes.json();
        return retryData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
      
      throw new Error(`Google image fallback failed: ${res.status} ${t}`);
    }
    const data = await res.json();
    if (this.debug) console.debug('[AI] Google.generateWithImages success', { ms: Date.now() - t1 });
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Low-level call that accepts a complete generateContent payload (contents, generationConfig, etc.)
   * Applies the same retry, key-rotation, and model discovery logic as other methods.
   * Returns the response text (first candidate part.text) on success.
   */
  async generateFromPayload(payload) {
    console.log('[AI] generateFromPayload called');

    // Check if we're rate limited
    if (this.isRateLimited()) {
      const seconds = this.getRateLimitSecondsRemaining();
      throw new RateLimitError(
        `AI service is temporarily unavailable. Please wait ${seconds} seconds and try again.`,
        seconds
      );
    }

    // Translate payload.contents into a single prompt string for Puter
    // Flatten all contents into a single prompt string for Puter
    const contents = Array.isArray(payload?.contents) ? payload.contents : [];
    let prompt = '';
    const imageParts = [];
    let hasUserContent = false;
    
    for (const c of contents) {
      const role = (c?.role || '').toLowerCase();
      const parts = Array.isArray(c?.parts) ? c.parts : [];
      for (const p of parts) {
        if (p?.text) {
          // Add light role markers to help Puter interpret context
          const prefix = role === 'model' ? 'Assistant: ' : 'User: ';
          prompt += prefix + p.text + '\n';
          if (role === 'user') hasUserContent = true;
        }
        // Accept both snake_case and camelCase for inline data
        const idata = p?.inline_data || p?.inlineData;
        if (idata?.data) {
          const mime = idata?.mime_type || idata?.mimeType || 'image/png';
          imageParts.push(`data:${mime};base64,${idata.data}`);
        }
      }
    }
    
    // Anti-hallucination prompt suffix - be very explicit about what we need
    if (hasUserContent) {
      prompt += `\n---\nIMPORTANT INSTRUCTIONS:\n`;
      prompt += `1. Answer the user's question directly and completely.\n`;
      prompt += `2. Do NOT ask the user to provide, upload, or share anything - all needed information is already in this conversation.\n`;
      prompt += `3. Do NOT say "I cannot see" or "please provide" - process what is given.\n`;
      if (imageParts.length > 0) {
        prompt += `4. An image has been provided - analyze it directly.\n`;
      }
      prompt += `5. Provide substantive, helpful content immediately.\n`;
    }
    let model = (payload?.generationConfig?.model) || this._workingModel || this.modelName;
    const t0 = Date.now();

    console.log('[AI] Payload info:', {
      hasImages: imageParts.length > 0,
      promptLength: prompt.length,
      model: model || 'default'
    });
    // If we have only data: URLs for images, skip Puter and go straight to Google (Puter expects http(s) URLs for images)
    const hasOnlyDataUrls = imageParts.length > 0 && imageParts.every(u => typeof u === 'string' && u.startsWith('data:'));
    if (hasOnlyDataUrls) {
      if (this.debug) console.warn('[AI] Skipping Puter for data URL images in payload; using Google fallback');
      const apiUrl = apiKeyManager.getCurrentUrl();
      const normalized = this._normalizePayloadForGoogle(payload);
      const t1 = Date.now();
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(normalized) });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Google payload fallback failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      if (this.debug) console.debug('[AI] Google.generateFromPayload success', { ms: Date.now() - t1 });
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) throw new Error('Empty response from Google payload fallback');
      return text;
    }
    try {
      console.log('[AI] Attempting Puter request...');
      const puter = this.getPuter();
      if (!puter) {
        console.warn('[AI] Puter not available, will fall back to Google');
        throw new Error('Puter.js is not available');
      }
      console.log('[AI] Puter is available, preparing request...');
      const puterOptsBase = { stream: false };
      const puterOpts = model ? { ...puterOptsBase, model } : puterOptsBase;
      console.log('[AI] Puter.generateFromPayload start', { model: model || 'default', hasImage: imageParts.length > 0 });
      // If prompt is very long, use a truncated version for Puter attempt to avoid stalls
      let promptForPuter = prompt;
      if (promptForPuter.length > 12000) {
        const head = promptForPuter.slice(0, 8000);
        const tail = promptForPuter.slice(-2000);
        promptForPuter = head + '\n...\n' + tail;
      }
      // Prefer the last image supplied (likely from the latest user message)
      const selectedImage = imageParts.length > 0 ? imageParts[imageParts.length - 1] : undefined;
      const p = selectedImage
        ? puter.ai.chat(promptForPuter, selectedImage, puterOpts)
        : puter.ai.chat(promptForPuter, puterOpts);
      console.log('[AI] Waiting for Puter response...');
      const timeoutMs = Math.min(payload?.timeoutMs || 15000, 30000); // Allow up to 30s for complex prompts
      const resp = await withTimeout(p, timeoutMs, 'Puter payload request timed out');
      console.log('[AI] Puter.generateFromPayload success', { model, ms: Date.now() - t0, respType: typeof resp });
      
      let responseText = null;
      if (resp && resp.message && typeof resp.message.content === 'string') responseText = resp.message.content;
      else if (typeof resp === 'string') responseText = resp;
      else if (resp && typeof resp.text === 'string') responseText = resp.text;
      
      if (!responseText) {
        throw new Error('Unexpected response from Puter.ai.chat (payload)');
      }
      
      // Validate response for hallucinations
      const validation = this._validateResponse(responseText, { hasImage: imageParts.length > 0 });
      if (!validation.valid) {
        console.warn('[AI] Response failed validation:', validation.reason);
        // Don't throw - let it fall through to Google fallback for a potentially better response
        throw new Error(`Puter response failed validation: ${validation.reason}`);
      }
      
      return responseText;
    } catch (e) {
      console.warn('[AI] Puter.generateFromPayload failed, falling back to Google', { error: String(e), ms: Date.now() - t0 });
      const previousFailureTime = this._lastPuterFailureAt;
      this._lastPuterFailureAt = Date.now();

      // Retry once with ensured model if not already (only if enough time passed since previous failure)
      try {
        const puter = this.getPuter();
        const timeSinceLastFailure = previousFailureTime ? (Date.now() - previousFailureTime) : Infinity;
        if (puter && !payload?.generationConfig?.model && timeSinceLastFailure > 15000) {
          console.log('[AI] Attempting Puter retry with model discovery...');
          const retryModel = await this.ensureWorkingModel({ multimodal: imageParts.length > 0, probeMs: 3000 });
          const tR = Date.now();
          let promptForPuter = prompt;
          if (promptForPuter.length > 12000) {
            const head = promptForPuter.slice(0, 8000);
            const tail = promptForPuter.slice(-2000);
            promptForPuter = head + '\n...\n' + tail;
          }
          const p2 = imageParts.length > 0
            ? puter.ai.chat(promptForPuter, imageParts[0], { model: retryModel || undefined, stream: false })
            : puter.ai.chat(promptForPuter, { model: retryModel || undefined, stream: false });
          const resp2 = await withTimeout(p2, 5000, 'Puter payload retry timed out');
          console.log('[AI] Puter.generateFromPayload retry success', { model: retryModel, ms: Date.now() - tR });
          if (resp2 && resp2.message && typeof resp2.message.content === 'string') return resp2.message.content;
          if (typeof resp2 === 'string') return resp2;
          if (resp2 && typeof resp2.text === 'string') return resp2.text;
        }
      } catch (er) {
        console.warn('[AI] Puter.generateFromPayload retry failed', String(er));
      }

      // Fallback to Google
      console.log('[AI] Using Google Gemini API fallback...');
      const apiUrl = apiKeyManager.getCurrentUrl();
      console.log('[AI] Google API URL:', apiUrl.replace(/key=.*/, 'key=***'));
      const normalized = this._normalizePayloadForGoogle(payload);
      const t1 = Date.now();
      console.log('[AI] Sending request to Google API...');
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(normalized) });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        console.error('[AI] Google API error:', res.status, t);
        // Try rotating to next key on failure
        apiKeyManager.markCurrentKeyFailed();
        throw new Error(`Google payload fallback failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      console.log('[AI] Google.generateFromPayload success', { ms: Date.now() - t1 });
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        console.error('[AI] Empty response from Google', data);
        throw new Error('Empty response from Google payload fallback');
      }
      console.log('[AI] Returning response, length:', text.length);
      return text;
    }
  }

  /**
   * Discover a supported model for generateContent using ListModels
   * Preference order: env-provided -> gemini-2.5-flash -> gemini-2.0-flash -> any 'flash' with generateContent -> gemini-flash-latest
   */
  async discoverSupportedModel() {
    // With Puter, we can select from known free models; prefer fast Flash
    const candidates = Array.from(new Set([
      process.env.REACT_APP_GEMINI_MODEL,
      'google/gemini-2.0-flash-lite-001',
      'google/gemini-2.5-flash',
      'google/gemini-flash-1.5-8b'
    ].filter(Boolean)));
    // In absence of programmatic listing, return first candidate
    return candidates[0];
  }

  // Diagnostics: test Puter and fallback paths and report timings
  async diagnose(testPrompt = "Reply with PONG only.") {
    const model = this.modelName;
    const result = { ok: false, provider: null, model, latencyMs: null, text: null, error: null };
    // Try Puter
    try {
      const puter = this.getPuter();
      if (!puter) {
        throw new Error('Puter.js is not available');
      }
      const t0 = Date.now();
  const resp = await withTimeout(puter.ai.chat(testPrompt, { model, stream: false }), 9000, 'Puter diagnostics timed out');
      const text = (resp && resp.message && typeof resp.message.content === 'string') ? resp.message.content : (typeof resp === 'string' ? resp : resp?.text || '');
      result.ok = !!text;
      result.provider = 'puter';
      result.latencyMs = Date.now() - t0;
      result.text = text;
      if (this.debug) console.debug('[AI] Diagnostics via Puter', result);
      return result;
    } catch (e) {
      if (this.debug) console.warn('[AI] Diagnostics Puter failed, trying Google fallback', e);
      this._lastPuterFailureAt = Date.now();
      // Try Google fallback
      try {
        const apiUrl = apiKeyManager.getCurrentUrl();
        const body = {
          contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
          generationConfig: { temperature: 0.0, maxOutputTokens: 16 }
        };
        const t1 = Date.now();
        const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          throw new Error(`Google diagnostics failed: ${res.status} ${t}`);
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        result.ok = !!text;
        result.provider = 'google';
        result.latencyMs = Date.now() - t1;
        result.text = text;
        if (this.debug) console.debug('[AI] Diagnostics via Google', result);
        return result;
      } catch (gErr) {
        result.ok = false;
        result.provider = null;
        result.error = String(gErr);
        return result;
      }
    }
  }

  // Optional warm-up to reduce first-call latency and cold starts
  async prewarm({ multimodal = false } = {}) {
    try {
      await this.ensureWorkingModel({ multimodal, probeMs: 3500 });
    } catch (_) {
      // ignore; we'll fallback during actual calls
    }
  }

  /**
   * Public method to parse JSON from AI responses
   * Can be used by other parts of the app for consistent JSON extraction
   * @param {string} text - The AI response text
   * @param {boolean} expectArray - Whether to expect a JSON array (default: false for object)
   * @returns {{ success: boolean, data: any, error: string|null }}
   */
  parseJSON(text, expectArray = false) {
    return this._extractJSON(text, expectArray);
  }

  // Specialized methods for different features
  async generateFlashcards(subject, topic, count = 20, difficulty = 'medium') {
    const prompt = `Generate exactly ${count} flashcards for ${subject} - ${topic}.

Difficulty: ${difficulty}

RULES (FOLLOW EXACTLY):
1. Output ONLY a JSON array - no text before or after
2. Each object has exactly two fields: "question" and "answer"
3. Use LaTeX: $x^2$ for inline, $$\\frac{a}{b}$$ for block math
4. Make questions specific and answers comprehensive
5. Start with [ and end with ]

Output format:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."}]

Generate ${count} flashcards now:`;

    const response = await this.generateContent(prompt, { temperature: 0.7, maxTokens: Math.max(count * 200, 2000) });

    // Use robust JSON extraction
    const result = this._extractJSON(response, true);
    
    if (result.success && Array.isArray(result.data)) {
      // Validate flashcard structure
      const validCards = result.data.filter(card => 
        card && typeof card.question === 'string' && typeof card.answer === 'string' &&
        card.question.trim().length > 0 && card.answer.trim().length > 0
      );
      
      if (validCards.length >= Math.min(count * 0.5, 5)) {
        if (this.debug) console.debug('[AI] Generated', validCards.length, 'valid flashcards');
        return validCards;
      }
    }
    
    console.error('Error parsing flashcards:', result.error, 'Response:', response?.substring(0, 200));
    return this.createFallbackFlashcards(subject, topic, count);
  }

  async solveProblem(problemText, subject = '', imageData = null) {
    const isHumanities = /(history|government|politics|english|literature|world|u\s*s\s*history)/i.test(subject || '');
    
    const prompt = `Solve this ${subject || 'AP'} problem completely.

Problem: ${problemText}

${isHumanities ? '' : 'Use LaTeX: $x^2$ inline, $$\\frac{a}{b}$$ for block math.\n'}
RULES:
1. Output ONLY valid JSON - no markdown, no code fences, no extra text
2. Solve the problem completely - do not ask for clarification
3. Be thorough in explanations

Required JSON structure:
{
  "problemType": "type of problem",
  "steps": [{"step": 1, "title": "Step Name", "content": "what was done", "explanation": "why"}],
  "finalAnswer": "the complete final answer",
  "concepts": ["concept1", "concept2"],
  "commonMistakes": ["mistake1"],
  "difficulty": "Easy|Medium|Hard",
  "timeToSolve": "X-Y minutes"
}

Solve now:`;

    let response;
    if (imageData) {
      response = await this.generateWithImages(prompt, [imageData], { temperature: 0.3, maxTokens: 3000 });
    } else {
      response = await this.generateContent(prompt, { temperature: 0.3, maxTokens: 3000 });
    }
    
    // Try to extract JSON, but return raw text if it fails (caller can handle it)
    const result = this._extractJSON(response, false);
    if (result.success) {
      // Validate required fields
      const data = result.data;
      if (data.steps && data.finalAnswer) {
        return JSON.stringify(data); // Return as string for compatibility
      }
    }
    
    // Return raw response - caller has fallback parsing
    return response;
  }

  async generateDiagnosticQuestions(subject, topic, difficulty = 'medium', count = 10) {
    const prompt = `Generate exactly ${count} multiple-choice questions for ${subject} - ${topic}.

Difficulty: ${difficulty}

RULES (FOLLOW EXACTLY):
1. Output ONLY a JSON array - no text before or after
2. Each question has: question, choices (4 strings), correctAnswer (0-3), explanations (4 strings), concept
3. Exactly 4 choices per question
4. correctAnswer is the index (0, 1, 2, or 3) of the correct choice
5. Start with [ and end with ]

Format:
[{"question":"...","choices":["A","B","C","D"],"correctAnswer":0,"explanations":["...","...","...","..."],"concept":"..."}]

Generate ${count} questions now:`;

    const response = await this.generateContent(prompt, { temperature: 0.6, maxTokens: Math.max(count * 400, 3000) });
    
    const result = this._extractJSON(response, true);
    
    if (result.success && Array.isArray(result.data)) {
      // Validate and fix question structure
      const validQuestions = result.data.filter(q => {
        if (!q || !q.question || !Array.isArray(q.choices)) return false;
        // Ensure 4 choices
        if (q.choices.length !== 4) {
          while (q.choices.length < 4) q.choices.push(`Option ${q.choices.length + 1}`);
          q.choices = q.choices.slice(0, 4);
        }
        // Ensure valid correctAnswer
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          q.correctAnswer = 0;
        }
        // Ensure explanations array
        if (!Array.isArray(q.explanations) || q.explanations.length !== 4) {
          q.explanations = q.choices.map((_, i) => i === q.correctAnswer ? 'Correct answer' : 'Incorrect');
        }
        return true;
      });
      
      if (validQuestions.length >= Math.min(count * 0.5, 3)) {
        return validQuestions;
      }
    }
    
    console.error('Error parsing diagnostic questions:', result.error);
    return this.createFallbackDiagnosticQuestions(subject, topic, count);
  }

  async analyzeStudentProgress(subjects, activities, weakAreas = []) {
    const prompt = `Analyze student progress and provide recommendations.

Subjects: ${subjects.join(', ')}
Activities: ${JSON.stringify(activities).substring(0, 1000)}
Weak areas: ${weakAreas.join(', ') || 'None identified'}

RULES:
1. Output ONLY valid JSON - no markdown, no code fences
2. Be specific and actionable in recommendations

Required JSON format:
{
  "overallProgress": "assessment string",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"],
  "nextSteps": ["step1", "step2"],
  "timeAllocation": "allocation advice"
}

Analyze now:`;

    const response = await this.generateContent(prompt, { temperature: 0.5, maxTokens: 1500 });
    
    const result = this._extractJSON(response, false);
    
    if (result.success && result.data) {
      const data = result.data;
      // Ensure all required fields exist
      return {
        overallProgress: data.overallProgress || 'Good progress shown',
        strengths: Array.isArray(data.strengths) ? data.strengths : ['Consistent effort'],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : ['Continue practicing'],
        nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : ['Review weak areas'],
        timeAllocation: data.timeAllocation || 'Balance time across all subjects'
      };
    }
    
    console.error('Error parsing progress analysis:', result.error);
    return this.createFallbackProgressAnalysis();
  }

  // Fallback methods for when AI generation fails
  createFallbackFlashcards(subject, topic, count) {
    const flashcards = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      flashcards.push({
        question: `${subject} ${topic} - Question ${i + 1}`,
        answer: `This is a sample answer for ${topic} concept ${i + 1}. The AI generation failed, but this ensures the app continues working.`
      });
    }
    return flashcards;
  }

  createFallbackDiagnosticQuestions(subject, topic, count) {
    const questions = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      questions.push({
        question: `Sample ${subject} question about ${topic} ${i + 1}`,
        choices: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`
        ],
        correctAnswer: 0,
        explanations: [
          "This is the correct answer",
          "This is incorrect because...",
          "This is incorrect because...",
          "This is incorrect because..."
        ],
        concept: `${topic} Concept ${i + 1}`
      });
    }
    return questions;
  }

  createFallbackProgressAnalysis() {
    return {
      overallProgress: "Good progress shown across subjects",
      strengths: ["Consistent study habits", "Good problem-solving approach"],
      weaknesses: ["Need more practice in specific areas"],
      recommendations: ["Continue regular practice", "Focus on weak areas"],
      nextSteps: ["Take more practice tests", "Review challenging topics"],
      timeAllocation: "Spend 60% time on weak areas, 40% on review"
    };
  }
}

const geminiServiceInstance = new GeminiService();

// Export the instance as default and utility functions/classes as named exports
export default geminiServiceInstance;
export { RateLimitError, sanitizeForPrompt, isRateLimitError };
