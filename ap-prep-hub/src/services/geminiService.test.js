import geminiService, { modelFromGoogleUrl, DEFAULT_PUTER_MODEL } from './geminiService';

describe('GeminiService payload normalization', () => {
  it('removes transport-only fields before Google fallback', () => {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: {
        model: 'google/gemini-2.5-flash',
        temperature: 0.4,
        maxOutputTokens: 256
      },
      timeoutMs: 45000
    };

    const normalized = geminiService._normalizePayloadForGoogle(payload);

    expect(normalized.timeoutMs).toBeUndefined();
    expect(normalized.generationConfig.model).toBeUndefined();
    expect(normalized.generationConfig.temperature).toBe(0.4);
    expect(normalized.generationConfig.maxOutputTokens).toBe(256);

    // Ensure caller payload is not mutated.
    expect(payload.timeoutMs).toBe(45000);
    expect(payload.generationConfig.model).toBe('google/gemini-2.5-flash');
  });

  it('converts inlineData to Google inline_data format', () => {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: 'abc123'
              }
            }
          ]
        }
      ]
    };

    const normalized = geminiService._normalizePayloadForGoogle(payload);

    expect(normalized.contents[0].parts[0]).toEqual({
      inline_data: {
        mime_type: 'image/png',
        data: 'abc123'
      }
    });
  });
});

describe('GeminiService Puter error formatting', () => {
  it('extracts a useful summary from nested plain-object errors', () => {
    const formatted = geminiService._formatErrorForLog({
      status: 403,
      error: {
        message: 'Forbidden from Puter proxy',
        code: 'PERMISSION_DENIED'
      }
    });

    expect(formatted.summary).toBe('Forbidden from Puter proxy');
    expect(formatted.details.status).toBe(403);
    expect(formatted.details.code).toBe('PERMISSION_DENIED');
  });

  it('never falls back to [object Object] for unknown objects', () => {
    const formatted = geminiService._formatErrorForLog({ foo: 'bar' });

    expect(formatted.summary).not.toBe('[object Object]');
    expect(formatted.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(formatted.details.keys)).toBe(true);
  });
});

describe('GeminiService Google error classification', () => {
  it('treats 429 as rate limit and retryable', () => {
    const classification = geminiService._classifyGoogleError(429, 'Too many requests');

    expect(classification.isRateLimit).toBe(true);
    expect(classification.shouldRetry).toBe(true);
  });

  it('treats server errors as retryable but not rate-limit', () => {
    const classification = geminiService._classifyGoogleError(503, 'backend unavailable');

    expect(classification.isRateLimit).toBe(false);
    expect(classification.shouldRetry).toBe(true);
  });

  it('does not retry invalid request errors', () => {
    const classification = geminiService._classifyGoogleError(400, 'invalid argument');

    expect(classification.isRateLimit).toBe(false);
    expect(classification.shouldRetry).toBe(false);
  });
});

describe('GeminiService resolved-model tracking', () => {
  it('reports what actually answered, not what was requested', () => {
    // The picker's value is a *request*. Puter falls through to Google and the
    // proxy substitutes models on 429, so anything user-facing must read the
    // resolved model or it will confidently display the wrong one.
    geminiService.setUserModel('claude-sonnet-4');
    geminiService._noteResolvedModel('Google', 'gemini-2.5-flash-lite');

    expect(geminiService.getUserModel()).toBe('claude-sonnet-4');
    expect(geminiService.getLastResolvedModel()).toEqual({
      provider: 'Google',
      model: 'gemini-2.5-flash-lite'
    });
  });

  it('records a null model rather than inventing one', () => {
    // An older proxy without the X-Apex-Model header yields null. Callers must
    // get null (and render nothing) instead of a fabricated name.
    geminiService._noteResolvedModel('Google', null);
    expect(geminiService.getLastResolvedModel().model).toBeNull();
  });
});

describe('modelFromGoogleUrl', () => {
  it('reads the real model out of a generateContent URL', () => {
    // The direct-key path has no other record of which model it hit, and
    // the picker's value can be a Puter id — using that
    // labelled Gemini answers as Claude in the tutor UI.
    expect(modelFromGoogleUrl(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=abc'
    )).toBe('gemini-2.5-flash');
  });

  it('returns null rather than guessing when there is no model segment', () => {
    expect(modelFromGoogleUrl('https://example.com/nope')).toBeNull();
    expect(modelFromGoogleUrl(null)).toBeNull();
  });
});

describe('Puter routing', () => {
  afterEach(() => { delete window.puter; geminiService.setUserModel(null); });

  it('sends only Puter-picked (or unpicked) requests to Puter', () => {
    geminiService.setUserModel('gemini-2.0-flash');
    expect(geminiService._puterModelFor()).toBeNull();
    geminiService.setUserModel('openai/gpt-5.5');
    expect(geminiService._puterModelFor()).toBe('openai/gpt-5.5');
    geminiService.setUserModel(null);
    expect(geminiService._puterModelFor()).toBe(DEFAULT_PUTER_MODEL);
    geminiService.setUserModel('claude-sonnet-4');
    expect(geminiService._puterModelFor()).toBe(DEFAULT_PUTER_MODEL);
  });

  it('retries a retired model on Puter\'s default, and never rate-limits the proxy', async () => {
    const chat = jest.fn()
      .mockRejectedValueOnce(new Error('Model not found: anthropic/claude-sonnet-4'))
      .mockResolvedValueOnce({ message: { content: 'ok' } });
    window.puter = { ai: { chat }, authToken: 'x'.repeat(24) };
    await expect(geminiService._askPuter('hi', null, { model: 'anthropic/claude-sonnet-4' })).resolves.toBe('ok');
    expect(chat.mock.calls[1][1].model).toBeUndefined();

    window.puter.ai.chat = jest.fn().mockRejectedValue(Object.assign(new Error('429 Too Many Requests'), { status: 429 }));
    await expect(geminiService._askPuter('hi', null, {})).resolves.toBeNull();
    expect(geminiService.isRateLimited()).toBe(false);
  });

  it('skips Puter when the student is not connected', async () => {
    await expect(geminiService._askPuter('hi', null, {})).resolves.toBeNull();
  });
});
