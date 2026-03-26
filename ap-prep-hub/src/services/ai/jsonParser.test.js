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
