import errorLogger from './errorLogger';

/**
 * Pure utility functions extracted from PracticeTests component.
 * These handle question sorting, AI response parsing, rubric building,
 * LaTeX repair, and duplicate detection.
 */

// Helper function to sort questions in proper AP exam order
export const sortQuestionsForProperOrder = (questions, section) => {
  // If not a full test, return as is
  if (section !== 'full') {
    return questions;
  }

  // Define question type order priorities
  const typeOrder = {
    'mcq': 1,
    'saq': 2,
    'dbq': 3,
    'leq': 4,
    'frq': 5,
    'long-frq': 5,
    'short-frq': 6,
    'calculator-frq': 5,
    'no-calculator-frq': 6,
    'synthesis': 2,
    'rhetorical-analysis': 3,
    'argumentative': 4,
    'poetry-analysis': 2,
    'prose-analysis': 3,
    'open-question': 4,
    'essays': 5,
    'essay': 5,
    'short-answer': 2,
    'written-theory': 5,
    'dictation': 6,
    'sight-singing': 7,
    'translation': 8
  };

  // Sort questions by type priority, then by original order
  return questions.sort((a, b) => {
    const aPriority = typeOrder[a.type] || 10;
    const bPriority = typeOrder[b.type] || 10;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // If same priority, maintain original order
    return a.id - b.id;
  });
};

// Helper function to fix LaTeX in text
// Only applies Greek-letter / symbol replacements INSIDE $...$ delimiters
// to avoid corrupting plain English like "alpha particles" or "beta decay"
export const fixLaTeXInText = (text) => {
  if (typeof text !== 'string') return text;

  // Phase 0: Strip form-feed characters (ASCII 0x0C) that corrupt LaTeX
  // eslint-disable-next-line no-control-regex
  let result = text.replace(/\x0c+/g, '');

  // Phase 1: Fix malformed fraction/function stuttering (safe on all text)
  result = result
    .replace(/\\f\\f\\f\\frac/g, '\\frac')
    .replace(/\\f\\f\\frac/g, '\\frac')
    .replace(/\f\f\f\\frac/g, '\\frac')
    .replace(/\f\f\\frac/g, '\\frac')
    .replace(/f\f\f\\frac/g, '\\frac')
    .replace(/f\f\\frac/g, '\\frac')
    .replace(/\\\\\\\\frac/g, '\\frac')
    .replace(/\\\\\\frac/g, '\\frac')
    .replace(/\\\\frac/g, '\\frac')
    .replace(/\\f(frac|sqrt|sin|cos|tan|lim|int|sum|log|ln|cdot|times|div|pm|mp|leq|geq|neq|approx|infty|alpha|beta|gamma|delta|theta|pi)/g, '\\$1')
    .replace(/f+\\(frac|sqrt|sin|cos|tan|lim|int|sum)/g, '\\$1')
    .replace(/\\\\\\\\/g, '\\\\')
    .replace(/\\\\\\/g, '\\\\')
    .replace(/\\l\\l\\lim/g, '\\lim')
    .replace(/\\l\\lim/g, '\\lim')
    .replace(/\\s\\s\\sin/g, '\\sin')
    .replace(/\\s\\sin/g, '\\sin')
    .replace(/\\c\\c\\cos/g, '\\cos')
    .replace(/\\c\\cos/g, '\\cos')
    .replace(/\\t\\t\\tan/g, '\\tan')
    .replace(/\\t\\tan/g, '\\tan')
    .replace(/\\s\\sqrt/g, '\\sqrt')
    .replace(/\\sq\\sqrt/g, '\\sqrt')
    .replace(/\brac\{/g, '\\frac{');

  // Phase 2: Fix LaTeX ONLY inside $...$ delimiters
  // Split text by $ delimiters, process only the math segments
  const parts = result.split(/(\$\$?[^$]*\$\$?)/g);
  result = parts.map(part => {
    // Only process segments that are inside $...$ or $$...$$
    if (part.startsWith('$') && part.endsWith('$')) {
      return part
        .replace(/\bsin\(/g, '\\sin(')
        .replace(/\bcos\(/g, '\\cos(')
        .replace(/\btan\(/g, '\\tan(')
        .replace(/\bln\(/g, '\\ln(')
        .replace(/\blog\(/g, '\\log(')
        .replace(/\blim_/g, '\\lim_')
        .replace(/\bint\s/g, '\\int ')
        .replace(/\bsum_/g, '\\sum_')
        .replace(/\bsqrt\{/g, '\\sqrt{')
        .replace(/\bpi\b/g, '\\pi')
        .replace(/\btheta\b/g, '\\theta')
        .replace(/\balpha\b/g, '\\alpha')
        .replace(/\bbeta\b/g, '\\beta')
        .replace(/\bgamma\b/g, '\\gamma')
        .replace(/\bdelta\b/g, '\\delta')
        .replace(/\blambda\b/g, '\\lambda')
        .replace(/\bmu\b/g, '\\mu')
        .replace(/\bsigma\b/g, '\\sigma')
        .replace(/\bomega\b/g, '\\omega')
        .replace(/\binfty\b/g, '\\infty')
        .replace(/\bcdot\b/g, '\\cdot')
        .replace(/\btimes\b/g, '\\times')
        .replace(/\bdiv\b/g, '\\div')
        .replace(/\bpm\b/g, '\\pm')
        .replace(/\bleq\b/g, '\\leq')
        .replace(/\bgeq\b/g, '\\geq')
        .replace(/\bneq\b/g, '\\neq')
        .replace(/\brightarrow\b/g, '\\rightarrow')
        .replace(/\bleftarrow\b/g, '\\leftarrow')
        .replace(/\bpartial\b/g, '\\partial')
        .replace(/\bnabla\b/g, '\\nabla');
    }
    return part;
  }).join('');

  return result;
};

// Helper function to fix LaTeX in parsed questions
export const fixLaTeXInQuestions = (questions) => {
  if (!Array.isArray(questions)) return questions;

  return questions.map(question => {
    // Fix LaTeX in question text
    if (question.question) {
      question.question = fixLaTeXInText(question.question);
    }

    // Fix LaTeX in options for MCQ and handle [object Object] issues
    if (question.options && Array.isArray(question.options)) {
      question.options = question.options.map(option => {
        // Handle different option formats
        if (typeof option === 'string') {
          // Option is just a string
          return {
            letter: null, // Will be assigned later
            text: fixLaTeXInText(option)
          };
        } else if (typeof option === 'object' && option !== null) {
          // Option is an object - ensure it has proper text property
          let optionText = '';

          if (option.text) {
            optionText = option.text;
          } else if (option.option) {
            optionText = option.option;
          } else if (option.answer) {
            optionText = option.answer;
          } else if (option.choice) {
            optionText = option.choice;
          } else {
            // If we can't find text, convert the whole object to string as fallback
            optionText = JSON.stringify(option);
          }

          return {
            letter: option.letter || null,
            text: fixLaTeXInText(String(optionText))
          };
        } else {
          // Fallback for any other type
          return {
            letter: null,
            text: fixLaTeXInText(String(option))
          };
        }
      });

      // Ensure options have proper letter assignments (A, B, C, D, E)
      const letters = ['A', 'B', 'C', 'D', 'E'];
      question.options.forEach((option, index) => {
        if (index < letters.length) {
          option.letter = letters[index];
        }
      });
    }

    // Fix LaTeX in explanations
    if (question.explanation) {
      question.explanation = fixLaTeXInText(question.explanation);
    }

    // Fix LaTeX in sample answers
    if (question.sampleAnswer) {
      question.sampleAnswer = fixLaTeXInText(question.sampleAnswer);
    }

    // Ensure correct answer is properly formatted
    if (question.correctAnswer && typeof question.correctAnswer === 'object') {
      // If correctAnswer is an object, extract the text
      if (question.correctAnswer.text) {
        question.correctAnswer = question.correctAnswer.text;
      } else if (question.correctAnswer.letter) {
        question.correctAnswer = question.correctAnswer.letter;
      } else {
        question.correctAnswer = String(question.correctAnswer);
      }
    }

    return question;
  });
};

// Helper function to clean and parse JSON with error recovery
export const parseAIResponse = (text, startId = 1) => {
  errorLogger.debug('Parsing AI response, original length:', { length: text.length });

  // Remove code block markers and clean up
  let cleanedText = text
    .replace(/^```json\s*/i, '') // Remove opening ```json
    .replace(/^```\s*/i, '') // Remove opening ```
    .replace(/\s*```\s*$/i, '') // Remove closing ```
    .replace(/```json\n?|\n?```/g, '') // Remove any remaining code block markers
    .replace(/```\n?|\n?```/g, '') // Remove any remaining backticks
    .replace(/^`+|`+$/g, '') // Remove leading/trailing backticks
    .trim();

  // Remove any Unicode issues and normalize whitespace
  cleanedText = cleanedText
    .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
    .replace(/[\u201C\u201D]/g, "'") // Replace smart double quotes with safe single quotes
    .replace(/\u2013|\u2014/g, '-') // Replace em/en dashes
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n');

  // Fix common LaTeX rendering issues — ONLY for commands that won't collide
  // with English words. Greek letters (alpha, beta, delta, pi, etc.) are NOT
  // replaced here because they corrupt science text like "alpha particles".
  // They are fixed post-parse in fixLaTeXInQuestions on $ delimited text only.
  cleanedText = cleanedText
    .replace(/rac\{/g, '\\frac{') // Fix missing backslash in fractions
    .replace(/\bsqrt\{/g, '\\sqrt{'); // Fix square roots

// IMPORTANT: Do not apply fixLaTeXInText to raw JSON text; it can corrupt JSON escapes like \n
// We'll clean LaTeX fields AFTER parsing, on individual question fields.

  // Pre-process: fix invalid JSON escape sequences BEFORE any parse attempt.
  // Inside JSON strings, only \" \\ \/ \b \f \n \r \t \uXXXX are valid.
  // The AI often produces \( \) \[ \] and LaTeX like \frac which break parsing.
  // We walk through the string and fix escapes only inside JSON string literals.
  cleanedText = cleanedText.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
    // Inside each JSON string value, fix invalid escape sequences (only if not already escaped)
    return match
      .replace(/(?<!\\)\\([^"\\/bfnrtu])/g, '\\\\$1'); // Escape bare backslashes that aren't valid JSON escapes
  });

  errorLogger.debug('Cleaned text length:', { length: cleanedText.length });

  // Try direct parsing first
  try {
    const parsed = JSON.parse(cleanedText);
    errorLogger.debug('Direct JSON parse successful');
    return fixLaTeXInQuestions(parsed);
  } catch (error) {
    errorLogger.warn('Initial JSON parse failed, attempting repair:', { message: error.message });

    // Common AI response issues and fixes
    const repairs = [
      // CRITICAL: Fix invalid escape sequences that break JSON parsing
      text => {
        errorLogger.debug('Applying escape sequence repair...');
        return text
          // FIRST: Remove problematic LaTeX delimiters that break JSON
          .replace(/\\\\\\\\?\(/g, '$') // Replace \\\\( or \\( with $
          .replace(/\\\\\\\\?\)/g, '$') // Replace \\\\) or \\) with $
          // Fix LaTeX display mode delimiters
          .replace(/\\\\\[/g, '$$') // Replace \\[ with $$
          .replace(/\\\\\]/g, '$$') // Replace \\] with $$
          // Fix problematic LaTeX patterns that break JSON parsing
          .replace(/\\\\lim_\{([^}]+)\s+\\\\to\s+([^}]+)\}/g, '\\\\lim_{$1 \\\\to $2}') // Fix limit notation
          .replace(/\\\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\\\frac{$1}{$2}') // Fix fractions
          .replace(/\\\\sin\(/g, '\\\\sin(') // Fix sin functions
          .replace(/\\\\cos\(/g, '\\\\cos(') // Fix cos functions
          .replace(/\\\\tan\(/g, '\\\\tan(') // Fix tan functions
          .replace(/\\\\sqrt\{([^}]*)\}/g, '\\\\sqrt{$1}') // Fix square root
          .replace(/\\\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '\\\\int_{$1}^{$2}') // Fix definite integrals
          .replace(/\\\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '\\\\sum_{$1}^{$2}') // Fix summations
          // Fix common Greek letters and symbols
          .replace(/\\\\infty/g, '\\\\infty')
          .replace(/\\\\pi/g, '\\\\pi')
          .replace(/\\\\theta/g, '\\\\theta')
          .replace(/\\\\alpha/g, '\\\\alpha')
          .replace(/\\\\beta/g, '\\\\beta')
          .replace(/\\\\Delta/g, '\\\\Delta')
          .replace(/\\\\sigma/g, '\\\\sigma')
          .replace(/\\\\mu/g, '\\\\mu')
          .replace(/\\\\to/g, '\\\\to')
          .replace(/\\\\rightarrow/g, '\\\\rightarrow')
          .replace(/\\\\leftarrow/g, '\\\\leftarrow')
          // Fix invalid single character escapes that are not valid JSON (only if unescaped)
          .replace(/(?<!\\)\\([^"\\\/bfnrtu$])/g, '\\\\$1') // eslint-disable-line no-useless-escape
          // Fix common contractions
          .replace(/\\"s\b/g, "'s")
          .replace(/\\"t\b/g, "'t")
          .replace(/\\"re\b/g, "'re")
          .replace(/\\"ll\b/g, "'ll")
          .replace(/\\"ve\b/g, "'ve")
          .replace(/\\"d\b/g, "'d");
      },
      // Specialized DBQ repair - handle heavily truncated responses
      text => {
        if (text.includes('"type": "dbq"') && !text.endsWith(']')) {
          errorLogger.debug('Applying DBQ-specific truncation repair...');

          // Find the end of the complete DBQ object structure
          let braceCount = 0;
          let inString = false;
          let escaped = false;
          let foundDbqStart = false;

          for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (escaped) {
              escaped = false;
              continue;
            }

            if (char === '\\') {
              escaped = true;
              continue;
            }

            if (char === '"' && !escaped) {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === '{') {
                braceCount++;
                if (!foundDbqStart && text.substring(i-20, i+20).includes('"type": "dbq"')) {
                  foundDbqStart = true;
                }
              } else if (char === '}' && foundDbqStart) {
                braceCount--;
                if (braceCount === 0) {
                  // This could be the end of our DBQ object

                  // If we have a minimal DBQ structure, try to close it
                  const soFar = text.substring(0, i + 1);
                  if (soFar.includes('"question"') && soFar.includes('"documents"')) {
                    // Add minimal required fields if missing
                    let fixed = soFar;
                    if (!fixed.includes('"sampleAnswer"')) {
                      fixed = fixed.slice(0, -1) + ', "sampleAnswer": "Sample thesis and key arguments based on the documents provided."}';
                    }
                    return '[' + fixed + ']';
                  }
                }
              }
            }
          }

          // If we found a partial DBQ but it's incomplete, try to salvage it
          if (foundDbqStart && text.includes('"question"')) {
            // Try to create a minimal valid DBQ
            const hasDocuments = text.includes('"documents"');
            if (hasDocuments) {
              // Find the last complete part and try to close it properly
              let lastValidEnd = text.lastIndexOf('}');
              if (lastValidEnd > 0) {
                let attempt = text.substring(0, lastValidEnd + 1);
                if (!attempt.includes('"sampleAnswer"')) {
                  attempt = attempt.slice(0, -1) + ', "sampleAnswer": "Sample response based on document analysis."}';
                }
                return '[' + attempt + ']';
              }
            }
          }
        }
        return text;
      },
      // First, detect and handle truncated responses
      text => {
        // If text ends abruptly without proper closing, try to fix it
        if (text.includes('[') && !text.endsWith(']')) {
          errorLogger.debug('Detected truncated JSON array, attempting to fix...');
          // Remove any incomplete trailing objects/text
          let lastCompleteObjectEnd = -1;
          let braceCount = 0;
          let inString = false;
          let escaped = false;

          for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (escaped) {
              escaped = false;
              continue;
            }

            if (char === '\\') {
              escaped = true;
              continue;
            }

            if (char === '"' && !escaped) {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === '{') {
                braceCount++;
              } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                  lastCompleteObjectEnd = i;
                }
              }
            }
          }

          if (lastCompleteObjectEnd > 0) {
            const truncated = text.substring(0, lastCompleteObjectEnd + 1);
            // Check if we need a comma before closing bracket
            const afterLastObject = text.substring(lastCompleteObjectEnd + 1).trim();
            if (afterLastObject.startsWith(',')) {
              return truncated + ']';
            } else {
              return truncated + ']';
            }
          }
        }
        return text;
      },
      // Fix trailing commas
      text => text.replace(/,(\s*[}\]])/g, '$1'),
      // Fix missing quotes around keys
      text => text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
      // Escape raw control characters that appear *inside* string literals.
      // The AI sometimes drops a real newline / tab into a "string" instead of
      // emitting \n / \t — JSON.parse then throws "Bad control character in
      // string literal". This is the most common root cause when Sentry shows
      // a parseError of that shape.
      text => {
        let out = '';
        let inStr = false;
        let esc = false;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (esc) { out += ch; esc = false; continue; }
          if (ch === '\\') { out += ch; esc = true; continue; }
          if (ch === '"') { inStr = !inStr; out += ch; continue; }
          if (inStr) {
            if (ch === '\n') { out += '\\n'; continue; }
            if (ch === '\r') { out += '\\r'; continue; }
            if (ch === '\t') { out += '\\t'; continue; }
            // Drop other C0 control bytes (NUL, BEL, …) outright — they
            // never belong in JSON string content.
            if (ch.charCodeAt(0) < 0x20) continue;
          }
          out += ch;
        }
        return out;
      },
      // Fix single quotes to double quotes — but ONLY outside of "..." strings.
      // Apostrophes (e.g. "pesticide's action") are perfectly valid JSON string
      // content; the previous global regex was rewriting them into "pesticide"s
      // and corrupting otherwise-valid responses. We walk the string and only
      // convert ' when we're not currently inside a double-quoted run.
      text => {
        let out = '';
        let inDouble = false;
        let esc = false;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (esc) { out += ch; esc = false; continue; }
          if (ch === '\\') { out += ch; esc = true; continue; }
          if (ch === '"') { inDouble = !inDouble; out += ch; continue; }
          if (ch === "'" && !inDouble) { out += '"'; continue; }
          out += ch;
        }
        return out;
      },
      // Remove any explanatory text before JSON
      text => {
        const jsonStart = Math.min(
          text.indexOf('[') >= 0 ? text.indexOf('[') : Infinity,
          text.indexOf('{') >= 0 ? text.indexOf('{') : Infinity
        );
        return jsonStart < Infinity ? text.substring(jsonStart) : text;
      },
      // Remove any text after the last ] or }
      text => {
        const lastBracket = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
        return lastBracket >= 0 ? text.substring(0, lastBracket + 1) : text;
      },
      // Fix escaped quotes inside strings
      text => text.replace(/\\"/g, '"').replace(/"([^"]*)""/g, '"$1"'),
      // Fix incomplete JSON by adding missing closing brackets and braces
      text => {
        const openBrackets = (text.match(/\[/g) || []).length;
        const closeBrackets = (text.match(/\]/g) || []).length;
        const openBraces = (text.match(/\{/g) || []).length;
        const closeBraces = (text.match(/\}/g) || []).length;

        let fixed = text;

        // If there's a trailing comma at the end, remove it
        fixed = fixed.replace(/,\s*$/, '');

        // Add missing closing braces for objects first
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixed += '}';
        }
        // Then add missing closing brackets for arrays
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixed += ']';
        }
        return fixed;
      },
      // Try to handle cut-off JSON by removing the last incomplete object
      text => {
        if (text.includes('[') && !text.endsWith(']')) {
          // Find the last complete object (ending with })
          const lastCompleteObject = text.lastIndexOf('}');
          if (lastCompleteObject > 0) {
            // Check if there's a comma after it
            const afterObject = text.substring(lastCompleteObject + 1).trim();
            if (afterObject.startsWith(',')) {
              // Remove everything after the last complete object and add closing bracket
              return text.substring(0, lastCompleteObject + 1) + ']';
            } else if (afterObject === '') {
              // Just add the closing bracket
              return text + ']';
            }
          }
        }
        return text;
      },
      // Handle truncated strings and incomplete objects more aggressively
      text => {
        try {
          // Find all complete objects by scanning for balanced braces
          const objects = [];
          let depth = 0;
          let start = -1;
          let inString = false;
          let escapeNext = false;

          for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (escapeNext) {
              escapeNext = false;
              continue;
            }

            if (char === '\\') {
              escapeNext = true;
              continue;
            }

            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === '{') {
                if (depth === 0) start = i;
                depth++;
              } else if (char === '}') {
                depth--;
                if (depth === 0 && start >= 0) {
                  const objText = text.substring(start, i + 1);
                  try {
                    const obj = JSON.parse(objText);
                    objects.push(obj);
                  } catch (e) {
                    // Skip invalid objects
                  }
                  start = -1;
                }
              }
            }
          }

          return objects.length > 0 ? JSON.stringify(objects) : text;
        } catch (e) {
          return text;
        }
      },
      // Advanced repair: Attempt to reconstruct truncated objects
      text => {
        if (!text.includes('[')) return text;

        try {
          // If it starts with [ but doesn't end properly, try to fix it
          const arrayMatch = text.match(/^\s*\[\s*/);
          if (arrayMatch) {
            // Find all complete objects within the array
            const objectsText = text.substring(arrayMatch[0].length);
            const objects = [];
            let objStart = 0;
            let braceCount = 0;
            let inString = false;
            let escaped = false;

            for (let i = 0; i < objectsText.length; i++) {
              const char = objectsText[i];

              if (escaped) {
                escaped = false;
                continue;
              }

              if (char === '\\') {
                escaped = true;
                continue;
              }

              if (char === '"' && !escaped) {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (char === '{') {
                  braceCount++;
                } else if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    // Found a complete object
                    const objText = objectsText.substring(objStart, i + 1);
                    try {
                      const obj = JSON.parse(objText);
                      objects.push(obj);
                      // Move to next object start
                      objStart = i + 1;
                      // Skip commas and whitespace
                      while (objStart < objectsText.length &&
                             /[\s,]/.test(objectsText[objStart])) {
                        objStart++;
                      }
                      i = objStart - 1; // -1 because loop will increment
                    } catch (e) {
                      // Skip malformed object
                    }
                  }
                }
              }
            }

            if (objects.length > 0) {
              return JSON.stringify(objects);
            }
          }

          return text;
        } catch (e) {
          return text;
        }
      }
    ];

    // Try each repair sequentially (accumulating fixes)
    let currentText = cleanedText;
    for (let i = 0; i < repairs.length; i++) {
      try {
        currentText = repairs[i](currentText);
        const parsed = JSON.parse(currentText);
        errorLogger.debug(`JSON repair successful with repair method ${i + 1}`);
        // Ensure questions have proper sequential IDs
        if (Array.isArray(parsed)) {
          for (let j = 0; j < parsed.length; j++) {
            if (!parsed[j].id || typeof parsed[j].id !== 'number') {
              parsed[j].id = startId + j;
            }
          }
        }
        return parsed;
      } catch (repairError) {
        errorLogger.debug(`Repair method ${i + 1} failed:`, { message: repairError.message });
        // Continue with the repaired text for next iteration
      }
    }

    // If all repairs fail, log more details and throw error
    errorLogger.report('Failed to parse AI response after all repair attempts', {
      originalFirst500: text.substring(0, 500),
      repairedFirst500: currentText.substring(0, 500),
      originalLength: text.length,
      finalLength: currentText.length,
      parseError: error.message,
    });

    // Check if response was likely truncated
    const wasTruncated = !text.trim().endsWith(']') && !text.trim().endsWith('}');
    const truncationNote = wasTruncated ? ' Response appears to be truncated.' : '';

    throw new Error(`JSON parsing failed even after repair attempts: ${error.message}.${truncationNote} AI response may be malformed or incomplete.`);
  }
};

// Normalize a rubric for a given question into items with labels and points
export const buildRubricItems = (question) => {
  const items = [];
  const type = question?.type || 'frq';
  const total = question?.rubric?.totalPoints || question?.points || (
    type === 'dbq' ? 7 : type === 'leq' ? 6 : type === 'saq' ? 3 : 9
  );

  // If rubric has explicit breakdown array of labels like ["Thesis (1pt)", ...]
  if (Array.isArray(question?.rubric?.breakdown) && question.rubric.breakdown.length > 0) {
    const labels = question.rubric.breakdown;
    // Try to parse points from labels; default to equal split
    const parsed = labels.map(lbl => {
      const m = lbl.match(/(\d+)\s*pt/i);
      return { label: lbl, maxPoints: m ? parseInt(m[1], 10) : null };
    });
    let knownSum = parsed.reduce((s, i) => s + (i.maxPoints || 0), 0);
    const unknowns = parsed.filter(i => i.maxPoints == null).length;
    const equal = unknowns > 0 ? Math.max(1, Math.floor((total - knownSum) / Math.max(1, unknowns))) : 0;
    parsed.forEach((p, idx) => items.push({ id: `r${idx+1}`, label: p.label, maxPoints: p.maxPoints ?? equal }));
    return { items, totalPoints: total };
  }

  // History-specific defaults
  if (type === 'dbq') {
    return {
      items: [
        { id: 'thesis', label: 'Thesis/Claim', maxPoints: 1 },
        { id: 'context', label: 'Contextualization', maxPoints: 1 },
        { id: 'evidence-docs', label: 'Evidence from Documents', maxPoints: 2 },
        { id: 'evidence-beyond', label: 'Evidence Beyond the Documents', maxPoints: 1 },
        { id: 'analysis', label: 'Analysis and Reasoning', maxPoints: 2 }
      ],
      totalPoints: 7
    };
  }
  if (type === 'leq') {
    return {
      items: [
        { id: 'thesis', label: 'Thesis/Claim', maxPoints: 1 },
        { id: 'context', label: 'Contextualization', maxPoints: 1 },
        { id: 'evidence', label: 'Evidence', maxPoints: 2 },
        { id: 'analysis', label: 'Analysis and Reasoning', maxPoints: 2 }
      ],
      totalPoints: 6
    };
  }
  if (type === 'saq') {
    return {
      items: [
        { id: 'a', label: 'Part A', maxPoints: 1 },
        { id: 'b', label: 'Part B', maxPoints: 1 },
        { id: 'c', label: 'Part C', maxPoints: 1 }
      ],
      totalPoints: 3
    };
  }

  // AP English generic (6 pt)
  if (['synthesis','argumentative','poetry-analysis','prose-analysis','rhetorical-analysis','open-question','essays'].includes(type)) {
    return {
      items: [
        { id: 'thesis', label: 'Thesis', maxPoints: 1 },
        { id: 'evidence', label: 'Evidence and Commentary', maxPoints: 4 },
        { id: 'sophistication', label: 'Sophistication', maxPoints: 1 }
      ],
      totalPoints: 6
    };
  }

  // Generic STEM FRQ
  const parts = (question?.parts && typeof question.parts === 'object') ? Object.keys(question.parts) : ['a','b','c'];
  const per = Math.max(1, Math.floor(total / Math.max(1, parts.length)));
  parts.forEach((p, idx) => items.push({ id: p, label: `Part ${String(p).toUpperCase()}`, maxPoints: per }));
  return { items, totalPoints: total };
};

// Merge AI breakdown scores into rubric items; conservative mapping if keys differ
export const attachScoresToRubric = (rubric, breakdownObj = {}, totalScore = null) => {
  const items = rubric.items.map((it, idx) => ({ ...it, earned: 0 }));
  const entries = Object.entries(breakdownObj || {});
  if (entries.length > 0) {
    // Try direct key match first
    for (const [k, v] of entries) {
      const found = items.find(i => i.id === k || i.label.toLowerCase().includes(String(k).toLowerCase()));
      if (found) found.earned = Math.max(0, Math.min(found.maxPoints, Number(v) || 0));
    }
    // If no direct matches produced any earnings, map by index order
    const anyEarned = items.some(i => i.earned > 0);
    if (!anyEarned) {
      entries.slice(0, items.length).forEach(([_, v], i) => {
        items[i].earned = Math.max(0, Math.min(items[i].maxPoints, Number(v) || 0));
      });
    }
  } else if (typeof totalScore === 'number' && totalScore > 0) {
    // Evenly distribute totalScore across items as a fallback visualization
    const per = Math.floor(totalScore / items.length);
    items.forEach((it, i) => { it.earned = Math.max(0, Math.min(it.maxPoints, per)); });
  }
  return { ...rubric, items };
};

// Helper function to check for duplicate questions
export const isQuestionDuplicate = (newQuestion, existingQuestions) => {
  if (!existingQuestions || existingQuestions.length === 0) return false;

  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/\$[^$]*\$/g, 'LATEX') // Replace LaTeX with placeholder
      .replace(/\\[a-z]+\{[^}]*\}/g, 'LATEX') // Replace LaTeX commands
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  };

  const newQuestionText = normalizeText(newQuestion.question || '');

  return existingQuestions.some(existing => {
    const existingText = normalizeText(existing.question || '');

    // Check for exact match
    if (existingText === newQuestionText) {
      errorLogger.debug('Exact duplicate detected:', { text: newQuestionText.substring(0, 50) + '...' });
      return true;
    }

    // For math questions, check core mathematical content similarity
    if (newQuestionText.includes('latex')) {
      // Extract the main mathematical components
      const newCore = newQuestionText.replace(/latex/g, '').replace(/\s+/g, ' ').trim();
      const existingCore = existingText.replace(/latex/g, '').replace(/\s+/g, ' ').trim();

      if (newCore === existingCore && newCore.length > 10) {
        errorLogger.debug('Math content duplicate detected:', { text: newCore.substring(0, 50) + '...' });
        return true;
      }
    }

    // Check for significant word overlap (more strict for short questions)
    const newWords = new Set(newQuestionText.split(' ').filter(word => word.length > 2));
    const existingWords = new Set(existingText.split(' ').filter(word => word.length > 2));

    const intersection = new Set([...newWords].filter(word => existingWords.has(word)));
    const union = new Set([...newWords, ...existingWords]);

    if (union.size === 0) return false;

    const similarity = intersection.size / union.size;
    const overlapThreshold = newQuestionText.length < 50 ? 0.9 : 0.8; // Higher threshold for short questions

    if (similarity > overlapThreshold) {
      errorLogger.debug('High similarity duplicate detected:', { similarity: similarity.toFixed(2), text: newQuestionText.substring(0, 50) + '...' });
      return true;
    }

    return false;
  });
};
