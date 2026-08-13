import { getModelLabel } from './ModelSelector';

describe('getModelLabel', () => {
  it('gives the friendly name for a listed model', () => {
    expect(getModelLabel('claude-sonnet-4')).toBe('Claude Sonnet 4');
  });

  it('falls back to the bare id for models the picker never lists', () => {
    // The proxy's fallback chain serves models that are not in the dropdown.
    // Showing the true id beats showing a wrong friendly name.
    expect(getModelLabel('models/gemini-2.5-flash-lite')).toBe('gemini-2.5-flash-lite');
    expect(getModelLabel('google/gemini-2.0-flash-exp')).toBe('gemini-2.0-flash-exp');
  });

  it('returns null for no model so callers render nothing', () => {
    expect(getModelLabel(null)).toBeNull();
    expect(getModelLabel('')).toBeNull();
  });
});
