import errorLogger from '../../utils/errorLogger';

/**
 * JSONParser — Robust JSON extraction and repair pipeline for AI responses.
 *
 * AI models frequently return JSON wrapped in markdown code fences, with
 * trailing commas, unescaped quotes, truncated output, or other issues.
 * This class implements a multi-strategy pipeline that:
 *   1. Cleans markdown/unicode artifacts
 *   2. Attempts direct JSON.parse
 *   3. Finds JSON bounds via brace-matching
 *   4. Applies incremental repairs (trailing commas, control chars, etc.)
 *   5. Repairs truncated JSON by closing open structures
 */
class JSONParser {
  /**
   * @param {object} [options]
   * @param {boolean} [options.debug] — log repair steps to errorLogger.debug
   */
  constructor(options = {}) {
    this.debug = options.debug ?? false;
  }

  // ── Public API ─────────────────────────────────────────────────────

  /**
   * Parse JSON from an AI response string.
   * @param {string} text — raw AI response (may include markdown fences, prose, etc.)
   * @param {boolean} [expectArray=false] — true if the top-level value should be an array
   * @returns {{ success: boolean, data: any, error: string|null, wasRepaired?: boolean }}
   */
  parse(text, expectArray = false) {
    return this._extractJSON(text, expectArray);
  }

  // ── Internal pipeline ──────────────────────────────────────────────

  /**
   * Robust JSON extraction and parsing with multiple fallback strategies.
   * Handles malformed JSON, code blocks, and partial responses.
   */
  _extractJSON(text, expectArray = false) {
    if (!text || typeof text !== 'string') {
      return { success: false, data: null, error: 'Empty or invalid input' };
    }

    // Step 1: Clean the response
    let cleaned = text
      .replace(/^```json\s*/gi, '')
      .replace(/^```\s*/gi, '')
      .replace(/\s*```\s*$/gi, '')
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .replace(/^`+|`+$/g, '')
      .trim();

    // Normalize unicode and whitespace
    cleaned = cleaned
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, "'")
      .replace(/\u2013|\u2014/g, '-')
      .replace(/\u00A0/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Step 2: Try direct parsing
    try {
      const parsed = JSON.parse(cleaned);
      if (expectArray && !Array.isArray(parsed)) {
        return { success: false, data: null, error: 'Expected array but got object' };
      }
      return { success: true, data: parsed, error: null };
    } catch (e) {
      // Continue with repair strategies
    }

    // Step 3: Find JSON bounds using brace matching
    const startChar = expectArray ? '[' : '{';
    const endChar = expectArray ? ']' : '}';
    const startIdx = cleaned.indexOf(startChar);
    if (startIdx === -1) {
      return { success: false, data: null, error: `No ${startChar} found in response` };
    }

    // Count braces to find matching end
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let endIdx = -1;

    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === startChar) braceCount++;
        if (char === endChar) {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }

    if (endIdx === -1) {
      // Try to repair truncated JSON
      return this._repairTruncatedJSON(cleaned.slice(startIdx), expectArray);
    }

    const candidate = cleaned.slice(startIdx, endIdx + 1);

    // Step 4: Try parsing extracted JSON
    try {
      return { success: true, data: JSON.parse(candidate), error: null };
    } catch (e) {
      // Step 5: Apply common fixes
      return this._repairJSON(candidate, expectArray);
    }
  }

  /**
   * Attempt to repair common JSON issues.
   */
  _repairJSON(text, expectArray = false) {
    const repairs = [
      // Remove trailing commas
      t => t.replace(/,\s*([}\]])/g, '$1'),
      // Fix unescaped quotes in strings (tricky - basic attempt)
      t => t.replace(/([^\\])"([^":,{}[\]]+)":/g, '$1"$2":'),
      // Remove control characters
      t => t.replace(/[\x00-\x1F\x7F]/g, ' '), // eslint-disable-line no-control-regex
      // Fix double commas
      t => t.replace(/,,+/g, ','),
      // Fix empty array elements
      t => t.replace(/\[\s*,/g, '[').replace(/,\s*\]/g, ']'),
      // Fix invalid escape sequences that aren't valid JSON (only if not already escaped)
      t => t.replace(/(?<!\\)\\([^"\\/bfnrtu])/g, '\\\\$1'),
      // Fix missing quotes on keys (basic)
      t => t.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
    ];

    let repaired = text;
    for (const repair of repairs) {
      try {
        repaired = repair(repaired);
        const parsed = JSON.parse(repaired);
        if (this.debug) errorLogger.debug('JSON repaired successfully', { source: 'JSONParser' });
        return { success: true, data: parsed, error: null };
      } catch (e) {
        // Continue trying repairs
      }
    }

    return { success: false, data: null, error: 'Could not repair JSON' };
  }

  /**
   * Attempt to repair truncated JSON by closing open structures.
   */
  _repairTruncatedJSON(text, expectArray = false) {
    if (this.debug) errorLogger.debug('Attempting to repair truncated JSON', { source: 'JSONParser' });

    let repaired = text.trim();

    // Track the ORDER of unclosed structures, not just counts. Closing all
    // '}' then all ']' is wrong when an array is the innermost open structure
    // (e.g. a JSON object truncated inside its last array value produces
    // `..."x"}]` instead of `..."x"]}`, which fails JSON.parse). We push each
    // opener onto a stack and close in reverse order.
    const stack = [];
    let inString = false;
    let escapeNext = false;

    for (const char of repaired) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char);
        } else if (char === '}' || char === ']') {
          stack.pop();
        }
      }
    }

    // If we're in a string, close it
    if (inString) {
      repaired += '"';
    }

    // Remove any trailing incomplete key-value pairs
    repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/g, '');
    repaired = repaired.replace(/,\s*"[^"]*"\s*$/g, '');
    repaired = repaired.replace(/,\s*$/g, '');

    // Close unclosed structures in reverse (innermost first)
    for (let i = stack.length - 1; i >= 0; i--) {
      repaired += stack[i] === '{' ? '}' : ']';
    }

    try {
      const parsed = JSON.parse(repaired);
      if (this.debug) errorLogger.debug('Truncated JSON repaired successfully', { source: 'JSONParser' });
      return { success: true, data: parsed, error: null, wasRepaired: true };
    } catch (e) {
      return { success: false, data: null, error: 'Could not repair truncated JSON: ' + e.message };
    }
  }
}

export default JSONParser;
