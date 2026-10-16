/**
 * netlify/lib/feedback.js validates what the feedback function stores. Lives
 * under src/ because CRA's jest only scans src/ (same as classScore.test.js).
 */
const { normalizeFeedback } = require('../../netlify/lib/feedback');

describe('normalizeFeedback', () => {
  it('requires a type and a message', () => {
    expect(normalizeFeedback({ message: 'hi' }).error).toMatch(/kind/);
    expect(normalizeFeedback({ type: 'praise', message: '   ' }).error).toMatch(/message/);
  });

  it('keeps known values, drops unknown ones, caps lengths, and takes uid only from the caller', () => {
    const { doc } = normalizeFeedback({
      type: 'feature', message: 'x'.repeat(5000), rating: 6, area: 'learn', role: 'principal',
      grade: '11', email: 'not-an-email', contactOk: 'yes', uid: 'forged', device: { browser: 'b'.repeat(400) },
    }, 'real-uid');
    expect(doc.message).toHaveLength(4000);
    expect(doc.rating).toBeNull();
    expect(doc.area).toBe('learn');
    expect(doc.role).toBeNull();
    expect(doc.grade).toBe('11');
    expect(doc.email).toBeNull();
    expect(doc.contactOk).toBe(false);
    expect(doc.uid).toBe('real-uid');
    expect(doc.device.browser).toHaveLength(300);
  });

  it('accepts a guest with a valid email and rating', () => {
    const { doc } = normalizeFeedback({ type: 'suggestion', message: 'More units', rating: 4, email: 'a@b.co', contactOk: true });
    expect(doc).toMatchObject({ uid: null, rating: 4, email: 'a@b.co', contactOk: true });
  });
});
