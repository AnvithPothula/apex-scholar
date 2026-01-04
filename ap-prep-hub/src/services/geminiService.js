import apiKeyManager from './APIKeyManager';

// Small utility: wait for a promise with timeout
const withTimeout = (promise, ms, errMsg = 'Timed out') => {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(errMsg)), ms); })
  ]);
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

    // Request deduplication cache
    this._requestCache = new Map(); // hash -> {promise, timestamp}
    this._cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this._cacheCleanupInterval = null;

    // Start cache cleanup interval
    this._startCacheCleanup();
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
      }
      // Fallback to Google Gemini v1
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
        throw new Error(`Google fallback failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      if (this.debug) console.debug('[AI] Google.generateContent success', { ms: Date.now() - t1 });
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) throw new Error('Empty response from Google fallback');
      return text;
    }
  }

  async generateWithImages(prompt, images = [], options = {}) {
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
      if (resp && resp.message && typeof resp.message.content === 'string') return resp.message.content;
      if (typeof resp === 'string') return resp;
      if (resp && typeof resp.text === 'string') return resp.text;
      throw new Error('Unexpected response from Puter.ai.chat (images)');
    } catch (e) {
  if (this.debug) console.warn('[AI] Puter.generateWithImages failed, falling back to Google', { error: String(e), ms: Date.now() - t0 });
      this._lastPuterFailureAt = Date.now();
      return await this._googleGenerateWithImages(prompt, imageArg, options);
    }
  }

  // Internal helper to call Google for image generation
  async _googleGenerateWithImages(prompt, imageArg, options = {}) {
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

    // Translate payload.contents into a single prompt string for Puter
    // Flatten all contents into a single prompt string for Puter
    const contents = Array.isArray(payload?.contents) ? payload.contents : [];
    let prompt = '';
    const imageParts = [];
    for (const c of contents) {
      const role = (c?.role || '').toLowerCase();
      const parts = Array.isArray(c?.parts) ? c.parts : [];
      for (const p of parts) {
        if (p?.text) {
          // Add light role markers to help Puter interpret context
          const prefix = role === 'model' ? 'Assistant: ' : 'User: ';
          prompt += prefix + p.text + '\n';
        }
        // Accept both snake_case and camelCase for inline data
        const idata = p?.inline_data || p?.inlineData;
        if (idata?.data) {
          const mime = idata?.mime_type || idata?.mimeType || 'image/png';
          imageParts.push(`data:${mime};base64,${idata.data}`);
        }
      }
    }
    // Nudge the model to answer directly instead of posting readiness statements
    if (contents.length > 0) {
      prompt += '\nAnswer the user\'s latest question directly. Do not ask for uploads or restatements. Provide the answer immediately.\n';
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
      if (resp && resp.message && typeof resp.message.content === 'string') return resp.message.content;
      if (typeof resp === 'string') return resp;
      if (resp && typeof resp.text === 'string') return resp.text;
      throw new Error('Unexpected response from Puter.ai.chat (payload)');
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

  // Specialized methods for different features
  async generateFlashcards(subject, topic, count = 20, difficulty = 'medium') {
    const prompt = `Create ${count} high-quality flashcards for ${subject} - ${topic}.

Requirements:
- Difficulty level: ${difficulty}
- Focus on key concepts, formulas, and important facts
- Each card should have a clear, concise question and comprehensive answer
- Include relevant examples where appropriate
- Use LaTeX notation for mathematical expressions (e.g., $x^2$ for inline math, $$\\frac{a}{b}$$ for block math)
- Format as JSON array with objects containing "question" and "answer" fields

IMPORTANT: Return ONLY the JSON array. No code blocks, no markdown, no explanation - just the raw JSON array starting with [ and ending with ].

Example format:
[{"question": "What is X?", "answer": "X is Y"}, {"question": "Define Z", "answer": "Z means..."}]`;

    const response = await this.generateContent(prompt, { temperature: 0.8 });

    try {
      // Clean the response and extract JSON
      let cleaned = response
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Try to find JSON array in the response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        // Try to parse the matched JSON
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          // Try to fix common JSON issues
          let fixedJson = jsonMatch[0]
            .replace(/,\s*]/g, ']') // Remove trailing commas
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/(\w+):/g, '"$1":') // Add quotes to unquoted keys
            .replace(/""+/g, '"'); // Fix double quotes
          return JSON.parse(fixedJson);
        }
      }

      // If response starts with [ try to parse directly
      if (cleaned.startsWith('[')) {
        return JSON.parse(cleaned);
      }

      throw new Error('No valid JSON array found in response');
    } catch (error) {
      console.error('Error parsing flashcards JSON:', error, 'Response:', response?.substring(0, 200));
      // Fallback: create basic flashcards
      return this.createFallbackFlashcards(subject, topic, count);
    }
  }

  async solveProblem(problemText, subject = '', imageData = null) {
    const isHumanities = /(history|government|politics|english|literature|world|u\s*s\s*history)/i.test(subject || '');
    let prompt = `Solve this ${subject || 'AP'} problem step by step:

${problemText}

${isHumanities ? `Formatting:
- Use clear, concise academic writing.
- Organize with short sections (analysis, evidence, reasoning, conclusion) as needed.
- No LaTeX is required unless math appears.
` : `IMPORTANT: Use LaTeX formatting for all mathematical expressions. Wrap inline math with single dollar signs $...$ and block math with double dollar signs $$...$$.
`}
Provide:
1. Problem identification and type
2. Step-by-step solution with explanations${isHumanities ? '' : ' (use LaTeX for all math)'}
3. Final answer or thesis/summary
4. Key concepts used
5. Common mistakes to avoid

Return ONLY valid JSON (no code fences, no preamble, no trailing commentary) with fields:
problemType (string),
steps (array of { step (number), title (string), content (string), explanation (string) }),
finalAnswer (string),
concepts (array of strings),
commonMistakes (array of strings),
difficulty ("Easy"|"Medium"|"Hard"),
timeToSolve (string like "5-10 minutes").`;

    if (imageData) {
      return await this.generateWithImages(prompt, [imageData]);
    } else {
      return await this.generateContent(prompt, { temperature: 0.3 });
    }
  }

  async generateDiagnosticQuestions(subject, topic, difficulty = 'medium', count = 10) {
    const prompt = `Generate ${count} diagnostic multiple-choice questions for ${subject} - ${topic}.

Requirements:
- Difficulty: ${difficulty}
- Focus on identifying student understanding and common misconceptions
- Each question should test different aspects of the topic
- Include 4 answer choices with one correct answer
- Provide explanations for why each choice is correct or incorrect

Format as JSON array with objects containing:
- question: the question text
- choices: array of 4 answer choices
- correctAnswer: index of correct choice (0-3)
- explanations: array of explanations for each choice
- concept: main concept being tested

Return ONLY the JSON array.`;

    const response = await this.generateContent(prompt, { temperature: 0.7 });
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing diagnostic questions JSON:', error);
      return this.createFallbackDiagnosticQuestions(subject, topic, count);
    }
  }

  async analyzeStudentProgress(subjects, activities, weakAreas = []) {
    const prompt = `Analyze this student's learning progress and provide personalized recommendations:

Subjects studied: ${subjects.join(', ')}
Recent activities: ${JSON.stringify(activities)}
Identified weak areas: ${weakAreas.join(', ')}

Provide analysis with:
1. Overall progress assessment
2. Strengths and areas for improvement
3. Specific study recommendations
4. Suggested next steps
5. Time allocation advice

Format as JSON with fields: overallProgress, strengths, weaknesses, recommendations, nextSteps, timeAllocation`;

    const response = await this.generateContent(prompt, { temperature: 0.6 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing progress analysis JSON:', error);
      return this.createFallbackProgressAnalysis();
    }
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
export default geminiServiceInstance;
