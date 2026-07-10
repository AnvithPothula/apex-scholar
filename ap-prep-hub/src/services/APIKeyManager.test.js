import apiKeyManager from './APIKeyManager';

describe('APIKeyManager model normalization', () => {
  const originalModel = apiKeyManager.defaultModel;

  afterEach(() => {
    apiKeyManager.setDefaultModel(originalModel);
  });

  it('falls back to the free-tier workhorse for non-Google model names', () => {
    apiKeyManager.setDefaultModel('claude-sonnet-4');

    const url = apiKeyManager.getCurrentUrl();

    expect(url).toContain('/v1beta/models/gemini-3.1-flash-lite:generateContent');
  });

  it('accepts Gemma ids (including HF-style google/ prefix) on v1beta', () => {
    apiKeyManager.setDefaultModel('google/gemma-4-31b-it');

    const url = apiKeyManager.getCurrentUrl();

    expect(url).toContain('/v1beta/models/gemma-4-31b-it:generateContent');
  });

  it('keeps explicit Gemini model and matching API version', () => {
    apiKeyManager.setDefaultModel('models/gemini-2.0-flash');

    const url = apiKeyManager.getCurrentUrl();

    expect(url).toContain('/v1/models/gemini-2.0-flash:generateContent');
  });

  it('uses v1beta for gemini-2.5 models', () => {
    apiKeyManager.setDefaultModel('gemini-2.5-flash');

    const url = apiKeyManager.getCurrentUrl();

    expect(url).toContain('/v1beta/models/gemini-2.5-flash:generateContent');
  });
});
