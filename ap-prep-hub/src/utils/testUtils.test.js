import {
  sortQuestionsForProperOrder,
  fixLaTeXInText,
  fixLaTeXInQuestions,
  parseAIResponse,
  buildRubricItems,
  attachScoresToRubric,
  isQuestionDuplicate,
} from './testUtils';

// ─── sortQuestionsForProperOrder ─────────────────────────────────

describe('sortQuestionsForProperOrder', () => {
  it('returns questions unchanged for non-full sections', () => {
    const qs = [{ id: 1, type: 'mcq' }, { id: 2, type: 'frq' }];
    expect(sortQuestionsForProperOrder(qs, 'mcq')).toEqual(qs);
  });

  it('sorts MCQ before FRQ for full tests', () => {
    const qs = [
      { id: 1, type: 'frq' },
      { id: 2, type: 'mcq' },
      { id: 3, type: 'saq' },
    ];
    const sorted = sortQuestionsForProperOrder(qs, 'full');
    expect(sorted[0].type).toBe('mcq');
    expect(sorted[1].type).toBe('saq');
    expect(sorted[2].type).toBe('frq');
  });

  it('preserves order for same-type questions', () => {
    const qs = [
      { id: 3, type: 'mcq' },
      { id: 1, type: 'mcq' },
      { id: 2, type: 'mcq' },
    ];
    const sorted = sortQuestionsForProperOrder(qs, 'full');
    expect(sorted.map(q => q.id)).toEqual([1, 2, 3]);
  });
});

// ─── fixLaTeXInText ──────────────────────────────────────────────

describe('fixLaTeXInText', () => {
  it('returns non-string inputs unchanged', () => {
    expect(fixLaTeXInText(null)).toBeNull();
    expect(fixLaTeXInText(42)).toBe(42);
  });

  it('does not alter plain text without LaTeX', () => {
    expect(fixLaTeXInText('alpha particles and beta decay')).toBe('alpha particles and beta decay');
  });

  it('fixes stuttered fractions like \\\\frac inside $...$', () => {
    const input = '$\\\\frac{1}{2}$';
    const result = fixLaTeXInText(input);
    expect(result).toContain('\\frac{1}{2}');
    expect(result).not.toContain('\\\\frac');
  });

  it('strips form-feed characters', () => {
    expect(fixLaTeXInText('hello\x0cworld')).toBe('helloworld');
  });
});

// ─── fixLaTeXInQuestions ─────────────────────────────────────────

describe('fixLaTeXInQuestions', () => {
  it('fixes LaTeX in question text and options', () => {
    const qs = [{
      id: 1,
      question: '$\\\\frac{1}{2}$ of the mass',
      options: ['$\\\\alpha$', 'beta', '$\\\\gamma$', 'delta'],
      explanation: 'The $\\\\frac{1}{2}$ comes from...',
    }];
    const fixed = fixLaTeXInQuestions(qs);
    expect(fixed[0].question).not.toContain('\\\\frac');
    expect(fixed[0].options[0]).not.toContain('\\\\alpha');
  });

  it('handles questions without options gracefully', () => {
    const qs = [{ id: 1, question: 'No options here' }];
    expect(() => fixLaTeXInQuestions(qs)).not.toThrow();
  });
});

// ─── parseAIResponse ─────────────────────────────────────────────

describe('parseAIResponse', () => {
  it('parses a valid JSON array of MCQ questions', () => {
    const json = JSON.stringify([
      {
        question: 'What is mitosis?',
        options: ['Cell division', 'Protein synthesis', 'Transcription', 'Translation'],
        correctAnswer: 'A',
        explanation: 'Mitosis is cell division.',
        type: 'mcq',
      },
    ]);
    const result = parseAIResponse(json, 1);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('What is mitosis?');
  });

  it('handles JSON wrapped in markdown code fences', () => {
    const wrapped = '```json\n[{"question": "Test?", "options": ["A","B","C","D"], "correctAnswer": "A", "type": "mcq"}]\n```';
    const result = parseAIResponse(wrapped, 1);
    expect(result).toHaveLength(1);
  });

  it('returns array for completely invalid input or throws', () => {
    // parseAIResponse throws on invalid input, but let's check behavior
    let result;
    let threw = false;
    try {
      result = parseAIResponse('this is not json at all', 1);
    } catch (e) {
      threw = true;
    }
    
    // Check that it either threw an error or returned an array
    expect(threw ? true : Array.isArray(result)).toBe(true);
  });

  it('parses multiple questions', () => {
    const json = JSON.stringify([
      { question: 'Q1', options: ['A','B','C','D'], correctAnswer: 'A', type: 'mcq' },
      { question: 'Q2', options: ['A','B','C','D'], correctAnswer: 'B', type: 'mcq' },
    ]);
    const result = parseAIResponse(json, 10);
    expect(result).toHaveLength(2);
    expect(result[0].question).toBe('Q1');
    expect(result[1].question).toBe('Q2');
  });

  // Regression: APEX-SCHOLAR Sentry issue where a real control character
  // inside a string literal triggered a chain of repairs that then turned
  // every apostrophe in valid content (e.g. "pesticide's") into a stray
  // double quote. Both sides of the fix are exercised here.
  it('preserves apostrophes inside string content (Sentry regression)', () => {
    const json = JSON.stringify([{
      question: "What is the pesticide's effect on Complex I?",
      options: ['A','B','C','D'],
      correctAnswer: 'A',
      type: 'mcq',
    }]);
    const result = parseAIResponse(json, 1);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe("What is the pesticide's effect on Complex I?");
  });

  it('recovers from raw control characters inside string literals', () => {
    // Build a payload that JSON.parse rejects with "Bad control character"
    // (a literal newline inside the question string). The control-char
    // repair should escape it as \n and let parsing succeed.
    const broken = '[{"question":"line one\nline two","options":["A","B","C","D"],"correctAnswer":"A","type":"mcq"}]';
    const result = parseAIResponse(broken, 1);
    expect(result).toHaveLength(1);
    expect(result[0].question).toContain('line one');
    expect(result[0].question).toContain('line two');
  });
});

// ─── buildRubricItems ────────────────────────────────────────────

describe('buildRubricItems', () => {
  it('returns default rubric for DBQ question', () => {
    const question = { type: 'dbq' };
    const rubric = buildRubricItems(question);
    expect(rubric.items).toBeDefined();
    expect(rubric.totalPoints).toBeDefined();
    expect(rubric.items.length).toBeGreaterThan(0);
  });

  it('returns default rubric for LEQ question', () => {
    const question = { type: 'leq' };
    const rubric = buildRubricItems(question);
    expect(rubric.items.length).toBeGreaterThan(0);
    expect(rubric.totalPoints).toBe(6);
  });

  it('extracts rubric from explicit breakdown labels', () => {
    const question = {
      type: 'frq',
      rubric: {
        totalPoints: 5,
        breakdown: ['Part A (2pt)', 'Part B (3pt)'],
      },
    };
    const rubric = buildRubricItems(question);
    expect(rubric.items).toHaveLength(2);
    expect(rubric.items[0].maxPoints).toBe(2);
    expect(rubric.items[1].maxPoints).toBe(3);
  });
});

// ─── attachScoresToRubric ────────────────────────────────────────

describe('attachScoresToRubric', () => {
  it('attaches scores to rubric items by key', () => {
    const rubric = {
      items: [
        { id: 'thesis', label: 'Thesis/Claim', maxPoints: 1 },
        { id: 'context', label: 'Contextualization', maxPoints: 1 },
      ],
      totalPoints: 2,
    };
    const breakdown = { thesis: 1, context: 0 };
    const result = attachScoresToRubric(rubric, breakdown, 1);
    expect(result.items[0].earned).toBe(1);
    expect(result.items[1].earned).toBe(0);
  });

  it('handles empty rubric', () => {
    const rubric = { items: [], totalPoints: 0 };
    const result = attachScoresToRubric(rubric, {}, 0);
    expect(result.items).toEqual([]);
  });

  it('distributes totalScore evenly when no breakdown', () => {
    const rubric = {
      items: [
        { id: 'a', label: 'Part A', maxPoints: 3 },
        { id: 'b', label: 'Part B', maxPoints: 3 },
      ],
      totalPoints: 6,
    };
    const result = attachScoresToRubric(rubric, {}, 4);
    expect(result.items[0].earned).toBeGreaterThan(0);
    expect(result.items[1].earned).toBeGreaterThan(0);
  });
});

// ─── isQuestionDuplicate ─────────────────────────────────────────

describe('isQuestionDuplicate', () => {
  it('detects identical question text as duplicate', () => {
    const newQ = { question: 'What is the powerhouse of the cell?' };
    const existing = [
      { question: 'What is the powerhouse of the cell?' },
      { question: 'Different question' },
    ];
    expect(isQuestionDuplicate(newQ, existing)).toBe(true);
  });

  it('returns false for unique questions', () => {
    const newQ = { question: 'Completely unique question about AP Biology and evolution' };
    const existing = [
      { question: 'What is mitosis and how does it work in cells?' },
      { question: 'What is meiosis and how does it differ from mitosis?' },
    ];
    expect(isQuestionDuplicate(newQ, existing)).toBe(false);
  });

  it('handles empty existing array', () => {
    const newQ = { question: 'Any question' };
    expect(isQuestionDuplicate(newQ, [])).toBe(false);
  });
});
