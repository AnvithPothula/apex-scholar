import JSONParser from './jsonParser';

const parser = new JSONParser({ debug: false });

describe('JSONParser', () => {
  describe('parse — clean JSON', () => {
    it('parses a plain JSON object', () => {
      const result = parser.parse('{"name": "test"}');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'test' });
    });

    it('parses a plain JSON array', () => {
      const result = parser.parse('[1, 2, 3]', true);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });
  });

  describe('parse — markdown-wrapped JSON', () => {
    it('extracts JSON from ```json fences', () => {
      const input = '```json\n{"key": "value"}\n```';
      const result = parser.parse(input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('extracts JSON from ``` fences without language tag', () => {
      const input = '```\n[{"id": 1}]\n```';
      const result = parser.parse(input, true);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ id: 1 }]);
    });
  });

  describe('parse — repair capabilities', () => {
    it('handles trailing commas', () => {
      const input = '{"a": 1, "b": 2,}';
      const result = parser.parse(input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ a: 1, b: 2 });
    });

    it('handles trailing commas in arrays', () => {
      const input = '[1, 2, 3,]';
      const result = parser.parse(input, true);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });
  });

  describe('parse — truncated JSON', () => {
    it('repairs truncated object', () => {
      const input = '{"question": "What is"';
      const result = parser.parse(input);
      expect(result.success).toBe(true);
      expect(result.data.question).toBe('What is');
    });

    it('repairs truncated array of objects', () => {
      const input = '[{"q": "Q1"}, {"q": "Q2"';
      const result = parser.parse(input, true);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    // Regression: an object truncated INSIDE a nested array must close in
    // reverse order (`]` then `}`), not all `}` then all `]`. This is the
    // real MCQ "raw/cut-off JSON" bug — the model stopped mid-explanations.
    it('repairs an object truncated inside its last array value (MCQ shape)', () => {
      const input = '{"question": "Which was a consequence of the Civil Rights Act of 1964?", "choices": ["End of all voting discrimination", "Mandatory affirmative action", "Banned discrimination in public accommodations and employment", "Immediate school desegregation"], "correctIndex": 2, "explanations": ["That was the Voting Rights Act of 1965, which followed';
      const result = parser.parse(input, false);
      expect(result.success).toBe(true);
      expect(result.data.question).toMatch(/Civil Rights Act of 1964/);
      expect(Array.isArray(result.data.choices)).toBe(true);
      expect(result.data.choices).toHaveLength(4);
      expect(result.data.correctIndex).toBe(2);
    });
  });

  describe('parse — failure cases', () => {
    it('returns failure for completely non-JSON text', () => {
      const result = parser.parse('Hello world, no JSON here');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('returns failure for empty string', () => {
      const result = parser.parse('');
      expect(result.success).toBe(false);
    });
  });
});
