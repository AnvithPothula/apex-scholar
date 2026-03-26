import apiKeyManager from './APIKeyManager';
import errorLogger from '../utils/errorLogger';
import JSONParser from './ai/jsonParser';

// Small utility: wait for a promise with timeout
const withTimeout = (promise, ms, errMsg = 'Timed out') => {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(errMsg)), ms); })
  ]);
};

/**
 * Extract text from a Puter AI response.
 * Different models return different formats:
 *  - OpenAI / Gemini: resp.message.content is a string
 *  - Claude / Anthropic: resp.message.content is an array [{type:"text", text:"..."}]
 *  - Some models: resp is a plain string
 *  - Some models: resp.text is a string
 * This helper normalizes all of these to a single string.
 */
const extractPuterText = (resp) => {
  if (!resp) return null;
  // Direct string
  if (typeof resp === 'string') return resp;
  // resp.text shortcut
  if (typeof resp.text === 'string') return resp.text;
  // resp.message.content cases
  const content = resp?.message?.content;
  if (typeof content === 'string') return content;
  // Claude-style array: [{type:"text", text:"..."}, ...]
  if (Array.isArray(content)) {
    const parts = content
      .map(p => (typeof p === 'string') ? p : (p?.text ?? ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join('') : null;
  }
  return null;
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
    
    // Command injection patterns — only match shell-like execution, not math/markdown
    /\$\(\s*(curl|wget|bash|sh|rm|cat|eval|exec|sudo|chmod|chown|kill|nc|ncat|python|node|ruby|perl)\b[^)]*\)/gi, // $(command) — only dangerous shell commands
    // Note: single backticks (inline code) are preserved for markdown; triple backticks
    // handled below when allowMarkdown=false
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
    // Default model selection — prefer Claude Sonnet 4 for education quality
    this.modelName = (process.env.REACT_APP_GEMINI_MODEL && process.env.REACT_APP_GEMINI_MODEL.trim() !== '')
      ? process.env.REACT_APP_GEMINI_MODEL.trim()
      : 'claude-sonnet-4';
    this.debug = (process.env.REACT_APP_AI_DEBUG || '').toLowerCase() !== 'false';
    this._jsonParser = new JSONParser({ debug: this.debug });
    this._workingModel = null;
    this._workingModelSupportsMM = false;
    // User-selected model (from ModelSelector UI) — takes priority over everything
    this._userModel = null;
    try { this._userModel = localStorage.getItem('apex.ai.userModel') || null; } catch (e) { errorLogger.debug('localStorage read failed (userModel)', { error: e?.message }); }
    this._lastPuterFailureAt = 0; // for backoff on repeated failures
    this._rateLimitUntil = 0; // Timestamp until which we should not make requests
    this._puterAuthBroken = false; // Track if Puter auth is in a broken/stuck state
    this._puterAuthResetCount = 0; // How many times we've reset Puter auth this session

    // Request deduplication cache
    this._requestCache = new Map(); // hash -> {promise, timestamp}
    this._cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this._cacheCleanupInterval = null;

    // Start cache cleanup interval
    this._startCacheCleanup();

    // Check for stuck Puter auth state on load and clean it up
    this._cleanupStuckPuterAuth();

    // Also clean up when the page becomes visible again (e.g. after returning
    // from a Puter auth popup that showed "Forbidden" on Safari/iOS)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this._cleanupStuckPuterAuth();
        }
      });
    }
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
   * Handle rate limit error - set backoff and throw user-friendly error.
   * With 11 API keys this should rarely trigger — it's the last resort
   * after all keys have been tried.
   */
  _handleRateLimit(error, context = '') {
    const retryAfter = 30; // 30 seconds — shorter because 11 keys absorb most load
    this._rateLimitUntil = Date.now() + (retryAfter * 1000);
    
    console.error(`[AI] Rate limit hit${context ? ` during ${context}` : ''}:`, error.message);
    
    throw new RateLimitError(
      `AI service is temporarily unavailable due to high demand. Please wait ${retryAfter} seconds and try again.`,
      retryAfter
    );
  }

  /**
   * Delegate JSON extraction to the shared JSONParser instance.
   * @see {JSONParser} in ./ai/jsonParser.js for the full pipeline.
   */
  _extractJSON(text, expectArray = false) {
    return this._jsonParser.parse(text, expectArray);
  }

  /**
   * Validate AI response for common hallucination patterns
   */
  _validateResponse(text, context = {}) {
    if (!text || typeof text !== 'string') {
      return { valid: false, reason: 'Empty response' };
    }

    // Only flag as hallucination when an image/file was provided but the AI
    // claims it cannot see or access it.  Keep patterns narrow to avoid
    // false-positives with Claude/GPT which naturally use phrases like
    // "I apologize" or "As an AI" in otherwise valid answers.
    if (context.hasImage || context.hasFile) {
      const cannotSeePatterns = [
        /I (don't|cannot|can't) (have access to|see|view|process|read|open) (the|your|any|this) (image|file|upload|photo|picture|attachment|document)/i,
        /please (provide|share|upload|send|attach) (the|your|an) (image|file|photo|picture|document)/i,
        /no (image|file|attachment|photo|picture) (was |has been )?(provided|uploaded|shared|attached|included|found)/i,
        /I('m| am) unable to (view|see|access|read|open|process) (the |any )?(image|file|attachment|upload)/i,
      ];
      for (const pattern of cannotSeePatterns) {
        if (pattern.test(text)) {
          return { valid: false, reason: 'AI claims it cannot see provided content', pattern: pattern.source };
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
    const key = `${prompt}_${options.temperature || 0}_${options.maxTokens || 0}_${options.model || ''}`;
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
    const probeMs = typeof opts.probeMs === 'number' ? opts.probeMs : 8000; // generous probe timeout
    // Basic backoff to avoid hammering Puter when it's down
    if (this._lastPuterFailureAt && Date.now() - this._lastPuterFailureAt < 15000) {
      throw new Error('Puter temporarily unavailable (backoff)');
    }

    // Check localStorage cache first
    try {
      const cacheKey = multimodal ? 'apex.ai.mm_model' : 'apex.ai.text_model';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { model, timestamp} = JSON.parse(cached);
        const age = Date.now() - timestamp;
        // Cache valid for 30 minutes — re-discover periodically for best model
        if (age < 1800000) {
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
    // Best free Puter models for education — ordered by quality/speed balance
    // Multimodal candidates (support image analysis)
    const mmCandidates = [
      envModel || null,
      'claude-sonnet-4',           // Best for education + vision
      'gpt-4.1',                   // Excellent vision model
      'gpt-4o',                    // Strong multimodal
      'google/gemini-2.5-flash',   // Fast + good vision
      'claude-haiku-4-5',          // Fast vision fallback
      'gpt-4.1-mini',             // Lightweight vision
    ].filter(Boolean);
    // Text-only candidates (fast, high-quality reasoning)
    const textCandidates = [
      envModel || null,
      'claude-sonnet-4',           // Best reasoning for tutoring
      'gpt-4.1',                   // Excellent quality
      'google/gemini-2.5-flash',   // Fast + reliable
      'claude-haiku-4-5',          // Very fast
      'gpt-4.1-mini',             // Fast fallback
      'google/gemini-2.0-flash',   // Reliable fallback
    ].filter(Boolean);
    const candidates = Array.from(new Set(multimodal ? mmCandidates : textCandidates));

    const puter = this.getPuter();
    if (!puter) throw new Error('Puter.js is not available');

    // Helper: detect CORS / network-level failures that will affect ALL models
    const isCorsOrNetworkError = (e) => {
      const s = String(e);
      return s.includes('access control') || s.includes('XMLHttpRequest') ||
             s.includes('NetworkError') || s.includes('Failed to fetch') ||
             s.includes('Load failed') || s.includes('CORS');
    };

    // Try default (no model specified) first to discover a server-side default
    try {
      const t0 = Date.now();
      const resp = await withTimeout(puter.ai.chat('PING', { stream: false }), probeMs, 'Puter default probe timed out');
      const text = extractPuterText(resp) || '';
      if (text) {
        this._workingModel = null; // indicates using server default is fine
        this._workingModelSupportsMM = multimodal; // unknown, but assume fine for text-only; will re-probe for MM when needed
        if (this.debug) console.debug('[AI] ensureWorkingModel selected default model', { ms: Date.now() - t0 });
        return null;
      }
    } catch (e) {
      if (this.debug) console.warn('[AI] ensureWorkingModel default probe failed', String(e));
      this._lastPuterFailureAt = Date.now();
      // If CORS/network error, no point trying individual models — they'll all fail
      if (isCorsOrNetworkError(e)) {
        throw new Error('Puter API blocked by CORS/network — skipping all candidates');
      }
    }

    for (const m of candidates) {
      try {
        const t0 = Date.now();
        const resp = await withTimeout(puter.ai.chat('PING', { model: m, stream: false }), probeMs, 'Puter probe timed out');
        const text = extractPuterText(resp) || '';
        if (text) {
          this._workingModel = m;
          this._workingModelSupportsMM = multimodal;
          if (this.debug) console.debug('[AI] ensureWorkingModel selected', { model: m, ms: Date.now() - t0 });

          // Cache the successful model to localStorage
          try {
            const cacheKey = multimodal ? 'apex.ai.mm_model' : 'apex.ai.text_model';
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
        // If CORS/network error, bail — all subsequent candidates will fail too
        if (isCorsOrNetworkError(e)) {
          throw new Error(`Puter API blocked by CORS/network (detected at ${m})`);
        }
      }
    }
    // If none worked, leave null and let caller fallback to Google
    throw new Error('No Puter models responded');
  }
  /**
   * Detect if Puter SDK auth is in a stuck state (e.g. auth popup showed
   * "Forbidden" on Safari/iOS and never completed, leaving isPromptOpen=true
   * with no auth token). This causes the "Continue" button to become
   * unclickable and the user can only "Cancel", breaking AI entirely.
   */
  _isPuterAuthStuck() {
    try {
      if (typeof window === 'undefined' || !window.puter) return false;
      const puter = window.puter;
      // The SDK sets puterAuthState.isPromptOpen = true when the auth dialog
      // is shown, but never resets it if the popup fails with "Forbidden"
      const authState = puter.puterAuthState;
      if (authState && authState.isPromptOpen === true && !puter.authToken) {
        return true;
      }
      // Also check if a <puter-dialog> element exists in the DOM but auth
      // was never completed (stale dialog from a failed attempt)
      if (!puter.authToken && document.querySelector && document.querySelector('puter-dialog')) {
        return true;
      }
    } catch (e) { errorLogger.debug('isPuterAuthStuck check failed', { error: e?.message }); }
    return false;
  }

  /**
   * Reset Puter SDK auth state when it's stuck. This clears the broken
   * dialog, resets internal state, and removes stale localStorage tokens
   * so the next AI call can either re-trigger auth cleanly or fall back
   * to Google API without hanging.
   */
  _resetPuterAuth() {
    try {
      if (typeof window === 'undefined' || !window.puter) return;
      const puter = window.puter;

      // 1. Reset the in-memory auth state that prevents new auth dialogs
      if (puter.puterAuthState) {
        puter.puterAuthState.isPromptOpen = false;
        puter.puterAuthState.authGranted = null;
        if (puter.puterAuthState.resolver) {
          // Reject any pending auth promise so callers don't hang forever
          try { puter.puterAuthState.resolver.reject?.(new Error('Auth reset due to stuck state')); } catch (e) { errorLogger.debug('Failed to reject stuck auth resolver', { error: e?.message }); }
        }
        puter.puterAuthState.resolver = null;
      }

      // 2. Remove stale <puter-dialog> elements from the DOM
      if (document.querySelectorAll) {
        document.querySelectorAll('puter-dialog').forEach(el => {
          try { el.remove(); } catch (e) { errorLogger.debug('Failed to remove puter-dialog element', { error: e?.message }); }
        });
      }

      // 3. Clear stale app ID but keep the auth token in localStorage
      //    so the user doesn't lose their Puter session on next page load.
      //    Only the in-memory stuck state needs resetting here.
      try {
        localStorage.removeItem('puter.app.id');
      } catch (e) { errorLogger.debug('localStorage remove failed (puter.app.id)', { error: e?.message }); }

      // 4. Use the SDK's built-in reset if available
      if (typeof puter.resetAuthToken === 'function') {
        try { puter.resetAuthToken(); } catch (e) { errorLogger.debug('puter.resetAuthToken() failed', { error: e?.message }); }
      } else {
        puter.authToken = null;
      }

      // Clear our own auth flag so we don't keep trying Puter with stale auth
      try { localStorage.removeItem('apex.puter.authenticated'); } catch (e) { errorLogger.debug('localStorage remove failed (apex.puter.authenticated)', { error: e?.message }); }

      this._puterAuthResetCount++;
      console.warn('[AI] Reset stuck Puter auth state (reset #' + this._puterAuthResetCount + ')');
    } catch (e) {
      console.warn('[AI] Error resetting Puter auth:', e);
    }
  }

  /**
   * Check if a Puter error is auth-related (Forbidden, user cancelled,
   * auth window closed, etc.). If so, clean up the stuck state immediately
   * so subsequent calls fall through to Google instead of hanging.
   */
  _handlePuterAuthError(error) {
    const msg = String(error?.message || error || '').toLowerCase();
    const isAuthError = (
      msg.includes('forbidden') ||
      msg.includes('user cancelled') ||
      msg.includes('auth') ||
      msg.includes('authentication') ||
      msg.includes('auth_window_closed') ||
      msg.includes('not logged in') ||
      msg.includes('login required')
    );
    if (isAuthError || this._isPuterAuthStuck()) {
      console.warn('[AI] Puter auth error detected, cleaning up:', msg);
      this._resetPuterAuth();
    }
  }

  /**
   * Check for and clean up stuck Puter auth state. Called on construction,
   * on page visibility change (returning from failed popup), and before
   * each Puter API call.
   */
  _cleanupStuckPuterAuth() {
    if (this._isPuterAuthStuck()) {
      console.warn('[AI] Detected stuck Puter auth state, resetting...');
      this._resetPuterAuth();
      // After resetting multiple times in one session, mark Puter as broken
      // so we skip it entirely and go straight to Google fallback
      if (this._puterAuthResetCount >= 3) {
        this._puterAuthBroken = true;
        console.warn('[AI] Puter auth has been reset too many times, marking as broken for this session');
      }
    }
  }

  /**
   * Set the user-selected model (from the ModelSelector UI).
   * Takes priority over auto-discovered models.
   */
  setUserModel(modelValue) {
    this._userModel = modelValue || null;
    try { localStorage.setItem('apex.ai.userModel', modelValue || ''); } catch (e) { errorLogger.debug('localStorage write failed (userModel)', { error: e?.message }); }
    if (this.debug) console.debug('[AI] User model set to:', modelValue);
  }

  /** Get the currently selected user model */
  getUserModel() {
    return this._userModel;
  }

  /** Resolve effective model: user choice > working model > env default */
  _resolveModel(optionsModel) {
    return optionsModel || this._userModel || this._workingModel || this.modelName;
  }

  // Safe access to Puter SDK in browser.
  // IMPORTANT: Only returns the Puter SDK if the user is ALREADY authenticated.
  // This prevents Puter from showing its auth popup/dialog (which requires users
  // to create a Puter account, do CAPTCHAs, etc.). Unauthenticated users go
  // straight to the Google Gemini API fallback — completely seamless, no popups.
  // Also returns null immediately if the Puter SDK was blocked by a network filter
  // (e.g. Lightspeed Filter on school networks which redirects to about:blank).
  getPuter() {
    try {
      // If Puter auth has repeatedly failed this session, skip it entirely
      if (this._puterAuthBroken) {
        if (this.debug) console.debug('[AI] Skipping Puter (auth marked broken for this session)');
        return null;
      }

      if (typeof window !== 'undefined' && window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
        // Before returning, check if auth is stuck and clean it up
        if (this._isPuterAuthStuck()) {
          console.warn('[AI] Puter auth stuck at getPuter() call, resetting...');
          this._resetPuterAuth();
          if (this._puterAuthResetCount >= 3) {
            this._puterAuthBroken = true;
            return null;
          }
        }

        // Check if the user is authenticated with Puter.
        // We check multiple signals because the SDK's internal state can be
        // unreliable (e.g. WebSocket failures can clear authToken from memory
        // even though the user previously authenticated successfully).
        let hasAuth = !!(window.puter.authToken || window.puter.auth?.isSignedIn?.());

        // Signal 2: Check localStorage for a persisted Puter auth token
        if (!hasAuth) {
          try {
            const lsToken = localStorage.getItem('puter.auth.token');
            if (lsToken && lsToken.length > 10) {
              // Restore the token to the SDK so puter.ai calls include it
              if (typeof window.puter.setAuthToken === 'function') {
                window.puter.setAuthToken(lsToken);
              } else {
                window.puter.authToken = lsToken;
              }
              if (window.puter.auth && typeof window.puter.auth.setAuthToken === 'function') {
                window.puter.auth.setAuthToken(lsToken);
              }
              hasAuth = true;
              if (this.debug) console.debug('[AI] Restored Puter auth token from localStorage');
            }
          } catch (e) { errorLogger.debug('localStorage access blocked', { error: e?.message }); }
        }

        // Signal 3: Our own flag from a previous successful Puter call.
        // The SDK's WebSocket failures can wipe auth state from memory, but
        // if we previously authenticated and used Puter successfully, trust that.
        if (!hasAuth) {
          try {
            const prevAuth = localStorage.getItem('apex.puter.authenticated');
            if (prevAuth === 'true') {
              hasAuth = true;
              if (this.debug) console.debug('[AI] Puter previously authenticated (apex.puter.authenticated flag)');
            }
          } catch (e) { errorLogger.debug('localStorage access blocked', { error: e?.message }); }
        }

        if (!hasAuth) {
          if (this.debug) console.debug('[AI] Puter SDK loaded but user not authenticated — skipping to avoid auth popup');
          return null;
        }

        // Mark as permanently authenticated so we remember for next time
        try { localStorage.setItem('apex.puter.authenticated', 'true'); } catch (e) { errorLogger.debug('localStorage write failed (puter auth flag)', { error: e?.message }); }

        return window.puter;
      }
    } catch (e) { errorLogger.debug('getPuter() failed', { error: e?.message }); }
    return null;
  }

  async generateContent(prompt, options = {}) {
    let model = this._resolveModel(options.model);
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
      const resp = await withTimeout(puter.ai.chat(prompt, puterOpts), options.timeoutMs || 45000, 'Puter request timed out');
      if (this.debug) console.debug('[AI] Puter.generateContent success', { model, ms: Date.now() - t0, respType: typeof resp });
      const text = extractPuterText(resp);
      if (text) return text;
      throw new Error('Unexpected response from Puter.ai.chat');
    } catch (e) {
      // Check if Puter returned a rate limit error
      if (isRateLimitError(e)) {
        this._handleRateLimit(e, 'Puter generateContent');
      }
      // Check if this is a Puter auth error (Forbidden, cancelled, etc.)
      this._handlePuterAuthError(e);
      
      if (this.debug) console.warn('[AI] Puter.generateContent failed, falling back to Google', { error: String(e), ms: Date.now() - t0 });
      const previousFailureAt = this._lastPuterFailureAt;
      this._lastPuterFailureAt = Date.now();
      // One quick retry with a discovered model if we didn't have one yet
      try {
        const puter = this.getPuter();
        const timeSinceLastFailure = previousFailureAt ? (Date.now() - previousFailureAt) : Infinity;
        if (puter && !options.model && timeSinceLastFailure > 15000) {
          const retryModel = await this.ensureWorkingModel({ multimodal: false, probeMs: 8000 });
          const tR = Date.now();
          const resp = await withTimeout(puter.ai.chat(prompt, { model: retryModel || undefined, stream: false }), 30000, 'Puter retry timed out');
          if (this.debug) console.debug('[AI] Puter.generateContent retry success', { model: retryModel, ms: Date.now() - tR });
          const retryText = extractPuterText(resp);
          if (retryText) return retryText;
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
    // Bail early if no Google API keys are configured at all
    if (apiKeyManager.getTotalKeys() === 0) {
      throw new Error('No Google API keys configured. AI requires Puter authentication or REACT_APP_GEMINI_API_KEY env vars.');
    }
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
        maxOutputTokens: options.maxTokens ?? 8192
      }
    };
    const t1 = Date.now();
    const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      
      // Check for rate limit response (429 or quota errors)
      if (res.status === 429 || t.toLowerCase().includes('quota') || t.toLowerCase().includes('rate')) {
        // Mark this key with a short cooldown (90s) so it recovers quickly.
        // With 11 keys we can rotate through them and circle back.
        apiKeyManager.markCurrentKeyFailed(90);
        
        // Try up to 3 more keys before giving up — with 11 keys, one 429
        // shouldn't kill the whole service.
        const maxRetries = Math.min(3, apiKeyManager.getTotalKeys() - 1);
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const rotated = apiKeyManager.rotateToNextKey();
          if (!rotated) break; // all keys exhausted
          
          try {
            const retryUrl = apiKeyManager.getCurrentUrl();
            const retryRes = await fetch(retryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              const retryText = retryData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (retryText) {
                if (this.debug) console.debug(`[AI] Google retry #${attempt + 1} succeeded with key ${apiKeyManager.getCurrentKeyIndex() + 1}`);
                return retryText;
              }
            } else if (retryRes.status === 429) {
              // This key is also rate limited — mark it with a short cooldown and try next
              apiKeyManager.markCurrentKeyFailed(90);
              if (this.debug) console.debug(`[AI] Google retry #${attempt + 1} also 429, trying next key...`);
              continue;
            } else {
              // Non-rate-limit error — don't retry, just throw
              const errText = await retryRes.text().catch(() => '');
              throw new Error(`Google fallback failed: ${retryRes.status} ${errText}`);
            }
          } catch (retryErr) {
            if (retryErr instanceof RateLimitError) throw retryErr;
            if (attempt === maxRetries - 1) throw retryErr;
            // Otherwise try next key
          }
        }
        
        // All retries exhausted — global lockout as last resort
        this._handleRateLimit(new Error('All attempted API keys rate limited'), 'Google API');
      }
      
      throw new Error(`Google fallback failed: ${res.status} ${t}`);
    }
    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const usageMeta = data?.usageMetadata;
    if (this.debug) console.debug('[AI] Google.generateContent success', {
      ms: Date.now() - t1,
      finishReason,
      promptTokens: usageMeta?.promptTokenCount,
      outputTokens: usageMeta?.candidatesTokenCount,
      totalTokens: usageMeta?.totalTokenCount
    });
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'END_TURN') {
      console.warn(`[AI] Google response finishReason: ${finishReason} — response may be truncated or blocked`);
    }
    const text = candidate?.content?.parts?.[0]?.text || '';
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

    let model = this._resolveModel(options.model);
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
    // Puter.ai.chat() accepts both HTTP URLs and data: URLs for images\n    // so we always try Puter first for the best free model experience
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
      const resp = await withTimeout(p, options.timeoutMs || 45000, 'Puter image request timed out');
      if (this.debug) console.debug('[AI] Puter.generateWithImages success', { model, ms: Date.now() - t0, respType: typeof resp });
      
      const responseText = extractPuterText(resp);
      
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
      // Check if this is a Puter auth error (Forbidden, cancelled, etc.)
      this._handlePuterAuthError(e);
      if (this.debug) console.warn('[AI] Puter.generateWithImages failed, falling back to Google', { error: String(e), ms: Date.now() - t0 });
      this._lastPuterFailureAt = Date.now();
      return await this._googleGenerateWithImages(prompt, imageArg, options);
    }
  }

  // Internal helper to call Google for image generation with rate limit handling
  async _googleGenerateWithImages(prompt, imageArg, options = {}) {
    // Bail early if no Google API keys are configured at all
    if (apiKeyManager.getTotalKeys() === 0) {
      throw new Error('No Google API keys configured. Image analysis requires Puter authentication or REACT_APP_GEMINI_API_KEY env vars.');
    }
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
      generationConfig: { temperature: options.temperature ?? 0.2, maxOutputTokens: options.maxTokens ?? 2048 }
    };
    const t1 = Date.now();
    const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      
      // Check for rate limit
      if (res.status === 429 || t.toLowerCase().includes('quota') || t.toLowerCase().includes('rate')) {
        apiKeyManager.markCurrentKeyFailed(90);
        
        // Try up to 3 more keys before giving up
        const maxRetries = Math.min(3, apiKeyManager.getTotalKeys() - 1);
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const rotated = apiKeyManager.rotateToNextKey();
          if (!rotated) break;
          
          try {
            const retryUrl = apiKeyManager.getCurrentUrl();
            const retryRes = await fetch(retryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              const retryImgText = retryData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (retryImgText) return retryImgText;
            } else if (retryRes.status === 429) {
              apiKeyManager.markCurrentKeyFailed(90);
              continue;
            } else {
              throw new Error(`Google image fallback failed: ${retryRes.status}`);
            }
          } catch (retryErr) {
            if (retryErr instanceof RateLimitError) throw retryErr;
            if (attempt === maxRetries - 1) throw retryErr;
          }
        }
        this._handleRateLimit(new Error('All attempted keys rate limited for images'), 'Google image API');
      }
      
      throw new Error(`Google image fallback failed: ${res.status} ${t}`);
    }
    const data = await res.json();
    if (this.debug) console.debug('[AI] Google.generateWithImages success', { ms: Date.now() - t1 });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Empty response from Google image fallback');
    return text;
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
    let model = this._resolveModel(payload?.generationConfig?.model);
    const t0 = Date.now();

    console.log('[AI] Payload info:', {
      hasImages: imageParts.length > 0,
      promptLength: prompt.length,
      model: model || 'default'
    });
    // Puter.ai.chat() accepts data: URLs, so always try Puter first for free model access
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
      if (promptForPuter.length > 10000) {
        const head = promptForPuter.slice(0, 7000);
        const tail = promptForPuter.slice(-2000);
        promptForPuter = head + '\n...\n' + tail;
      }
      // Prefer the last image supplied (likely from the latest user message)
      const selectedImage = imageParts.length > 0 ? imageParts[imageParts.length - 1] : undefined;
      const p = selectedImage
        ? puter.ai.chat(promptForPuter, selectedImage, puterOpts)
        : puter.ai.chat(promptForPuter, puterOpts);
      console.log('[AI] Waiting for Puter response...');
      const timeoutMs = payload?.timeoutMs || 45000; // Allow up to 45s for complex prompts
      const resp = await withTimeout(p, timeoutMs, 'Puter payload request timed out');
      console.log('[AI] Puter.generateFromPayload success', { model, ms: Date.now() - t0, respType: typeof resp });
      
      const responseText = extractPuterText(resp);
      
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
      // Check if this is a Puter auth error (Forbidden, cancelled, etc.)
      this._handlePuterAuthError(e);
      const previousFailureTime = this._lastPuterFailureAt;
      this._lastPuterFailureAt = Date.now();

      // Retry once with ensured model if not already (only if enough time passed since previous failure)
      try {
        const puter = this.getPuter();
        const timeSinceLastFailure = previousFailureTime ? (Date.now() - previousFailureTime) : Infinity;
        if (puter && !payload?.generationConfig?.model && timeSinceLastFailure > 15000) {
          console.log('[AI] Attempting Puter retry with model discovery...');
          const retryModel = await this.ensureWorkingModel({ multimodal: imageParts.length > 0, probeMs: 8000 });
          const tR = Date.now();
          let promptForPuter = prompt;
          if (promptForPuter.length > 10000) {
            const head = promptForPuter.slice(0, 7000);
            const tail = promptForPuter.slice(-2000);
            promptForPuter = head + '\n...\n' + tail;
          }
          const p2 = imageParts.length > 0
            ? puter.ai.chat(promptForPuter, imageParts[0], { model: retryModel || undefined, stream: false })
            : puter.ai.chat(promptForPuter, { model: retryModel || undefined, stream: false });
          const resp2 = await withTimeout(p2, 30000, 'Puter payload retry timed out');
          console.log('[AI] Puter.generateFromPayload retry success', { model: retryModel, ms: Date.now() - tR });
          const retryText = extractPuterText(resp2);
          if (retryText) return retryText;
        }
      } catch (er) {
        console.warn('[AI] Puter.generateFromPayload retry failed', String(er));
      }

      // Fallback to Google
      if (apiKeyManager.getTotalKeys() === 0) {
        throw new Error('No Google API keys configured. AI requires Puter authentication or REACT_APP_GEMINI_API_KEY env vars.');
      }
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
        apiKeyManager.markCurrentKeyFailed(90);
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
   * Discover a supported model for generateContent
   * Preference: Claude Sonnet 4 > GPT-4.1 > Gemini 2.5 Flash
   */
  async discoverSupportedModel() {
    const candidates = Array.from(new Set([
      process.env.REACT_APP_GEMINI_MODEL,
      'claude-sonnet-4',
      'gpt-4.1',
      'google/gemini-2.5-flash',
      'claude-haiku-4-5'
    ].filter(Boolean)));
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
  const resp = await withTimeout(puter.ai.chat(testPrompt, { model, stream: false }), 20000, 'Puter diagnostics timed out');
      const text = extractPuterText(resp) || '';
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
    const prompt = `Generate ${count} ${difficulty} flashcards for ${subject} — ${topic}.
Output ONLY a JSON array. Each object: {"question":"...","answer":"..."}. Use $LaTeX$ for math.
[{"question":"...","answer":"..."}]`;

    const response = await this.generateContent(prompt, { temperature: 0.7, maxTokens: Math.max(count * 150, 1500) });

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
    
    const prompt = `Solve this ${subject || 'AP'} problem. ${isHumanities ? '' : 'Use $LaTeX$ for math.'}
Problem: ${problemText}

Output ONLY JSON:
{"problemType":"...","steps":[{"step":1,"title":"...","content":"...","explanation":"..."}],"finalAnswer":"...","concepts":["..."],"commonMistakes":["..."],"difficulty":"Easy|Medium|Hard","timeToSolve":"X-Y minutes"}`;

    let response;
    if (imageData) {
      response = await this.generateWithImages(prompt, [imageData], { temperature: 0.3, maxTokens: 2048 });
    } else {
      response = await this.generateContent(prompt, { temperature: 0.3, maxTokens: 2048 });
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
    const prompt = `Generate ${count} ${difficulty} MCQs for ${subject} — ${topic}.
Output ONLY a JSON array. Each object: {"question":"...","choices":["A","B","C","D"],"correctAnswer":0,"explanations":["...","...","...","..."],"concept":"..."}
correctAnswer is the index (0-3) of the correct choice. Exactly 4 choices and 4 explanations per question.`;

    const response = await this.generateContent(prompt, { temperature: 0.6, maxTokens: Math.max(count * 300, 2000) });
    
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
    const prompt = `Analyze student progress. Subjects: ${subjects.join(', ')}. Activities: ${JSON.stringify(activities).substring(0, 800)}. Weak areas: ${weakAreas.join(', ') || 'None'}.

Output ONLY JSON:
{"overallProgress":"...","strengths":["..."],"weaknesses":["..."],"recommendations":["..."],"nextSteps":["..."],"timeAllocation":"..."}`;

    const response = await this.generateContent(prompt, { temperature: 0.5, maxTokens: 1000 });
    
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
