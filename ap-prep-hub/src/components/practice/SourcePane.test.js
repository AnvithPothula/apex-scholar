import { hasSourceMaterial } from './SourcePane';

describe('hasSourceMaterial', () => {
  it('is false for a plain question, so the layout stays single-column', () => {
    expect(hasSourceMaterial({ type: 'mcq', question: 'What is 2+2?' })).toBe(false);
  });

  it('is false for null/undefined rather than throwing', () => {
    expect(hasSourceMaterial(null)).toBe(false);
    expect(hasSourceMaterial(undefined)).toBe(false);
  });

  it('detects each kind of source material', () => {
    expect(hasSourceMaterial({ stimulus: 'A passage.' })).toBe(true);
    expect(hasSourceMaterial({ passage: 'A poem.' })).toBe(true);
    expect(hasSourceMaterial({ sources: [{ content: 'x' }] })).toBe(true);
    expect(hasSourceMaterial({ documents: [{ content: 'x' }] })).toBe(true);
  });

  it('treats empty collections as no source material', () => {
    // Empty arrays used to be truthy enough to split the layout, which would
    // put a plain question next to a blank pane.
    expect(hasSourceMaterial({ sources: [] })).toBe(false);
    expect(hasSourceMaterial({ documents: [] })).toBe(false);
    expect(hasSourceMaterial({ stimulus: '' })).toBe(false);
    expect(hasSourceMaterial({ passage: '' })).toBe(false);
  });

  it('ignores non-array sources/documents', () => {
    expect(hasSourceMaterial({ sources: 'nope' })).toBe(false);
    expect(hasSourceMaterial({ documents: {} })).toBe(false);
  });
});
