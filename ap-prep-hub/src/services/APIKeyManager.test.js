import apiKeyManager from './APIKeyManager';

describe('APIKeyManager model normalization', () => {
  const originalModel = apiKeyManager.defaultModel;

  afterEach(() => {
    apiKeyManager.setDefaultModel(originalModel);
  });

  it('falls back to Gemini model for non-Gemini model names', () => {
    apiKeyManager.setDefaultModel('claude-sonnet-4');

    const url = apiKeyManager.getCurrentUrl();

    expect(url).toContain('/models/gemini-2.5-flash:generateContent');
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
