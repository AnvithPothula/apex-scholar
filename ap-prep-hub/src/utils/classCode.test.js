import {
  generateClassCode,
  normalizeClassCode,
  isValidClassCode,
  sanitizeClassName,
  sanitizeDisplayName,
  CODE_LENGTH,
  ALPHABET,
} from './classCode';

describe('generateClassCode', () => {
  it('produces a code of the right length from the safe alphabet only', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateClassCode();
      expect(c).toHaveLength(CODE_LENGTH);
      for (const ch of c) expect(ALPHABET).toContain(ch);
    }
  });

  it('never emits the characters students misread', () => {
    const joined = Array.from({ length: 200 }, () => generateClassCode()).join('');
    expect(joined).not.toMatch(/[01OIL]/);
  });

  it('does not repeat itself in a small sample', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateClassCode()));
    expect(codes.size).toBe(200);
  });
});

describe('normalizeClassCode', () => {
  const code = 'A2B3C4D5';

  it('accepts an already-canonical code', () => {
    expect(normalizeClassCode(code)).toBe(code);
  });

  it('accepts lowercase, spaces and dashes', () => {
    expect(normalizeClassCode('a2b3-c4d5')).toBe(code);
    expect(normalizeClassCode('  a2 b3 c4 d5  ')).toBe(code);
  });

  it('rejects rather than guesses when a never-issued lookalike is typed', () => {
    // 0/O/1/I/L are never in a real code, so any of them means the student
    // misread it. There is no unambiguous correction, and guessing would send
    // them into the wrong class.
    ['0BCDEFGH', '1BCDEFGH', 'OBCDEFGH', 'IBCDEFGH', 'LBCDEFGH'].forEach((v) =>
      expect(normalizeClassCode(v)).toBe('')
    );
  });

  it('accepts a pasted join link, with query and hash', () => {
    expect(normalizeClassCode(`https://apex-scholar.com/join/${code}`)).toBe(code);
    expect(normalizeClassCode(`https://apex-scholar.com/join/${code}?utm=x`)).toBe(code);
    expect(normalizeClassCode(`/join/${code}#top`)).toBe(code);
  });

  it('rejects wrong lengths and junk', () => {
    ['', '   ', 'ABC', 'A2B3C4D5E', 'A2B3C4D!', null, undefined, 42].forEach((v) =>
      expect(normalizeClassCode(v)).toBe('')
    );
  });

  it('round-trips every generated code', () => {
    for (let i = 0; i < 100; i++) {
      const c = generateClassCode();
      expect(normalizeClassCode(c)).toBe(c);
      expect(isValidClassCode(c)).toBe(true);
    }
  });
});

describe('isValidClassCode', () => {
  it('is false for non-canonical input even when normalisable', () => {
    expect(isValidClassCode('a2b3c4d5')).toBe(false);
    expect(isValidClassCode(null)).toBe(false);
  });
});

describe('sanitizeClassName', () => {
  it('collapses whitespace and trims', () => {
    expect(sanitizeClassName('  Period   3   Bio  ')).toBe('Period 3 Bio');
  });

  it('falls back when empty', () => {
    expect(sanitizeClassName('')).toBe('Untitled class');
    expect(sanitizeClassName('   ')).toBe('Untitled class');
    expect(sanitizeClassName(null)).toBe('Untitled class');
  });

  it('caps length', () => {
    expect(sanitizeClassName('x'.repeat(200))).toHaveLength(60);
  });
});

describe('sanitizeDisplayName', () => {
  it('never lets an email through — these are mostly minors', () => {
    expect(sanitizeDisplayName('student@school.edu')).toBe('Anonymous');
  });

  it('falls back on empty input', () => {
    expect(sanitizeDisplayName('')).toBe('Anonymous');
    expect(sanitizeDisplayName(undefined)).toBe('Anonymous');
  });

  it('keeps an ordinary display name', () => {
    expect(sanitizeDisplayName('  Alex  R  ')).toBe('Alex R');
  });

  it('caps length', () => {
    expect(sanitizeDisplayName('y'.repeat(100))).toHaveLength(32);
  });
});
