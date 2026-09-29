import { widgetDirective, WALKTHROUGH_DIRECTIVE } from './tutorWidgets';
import { parseGraphSpec, parseStepsSpec } from '../utils/widgetSpec';

const fenced = (text, lang) => {
  const m = new RegExp('```' + lang + '\\n([\\s\\S]*?)\\n```').exec(text);
  return m ? m[1] : null;
};

describe('widgetDirective', () => {
  it('is empty in MCQ mode, where the reply must be bare JSON', () => {
    expect(widgetDirective({ mode: 'Practice MCQ' })).toBe('');
  });

  it("teaches examples that the app's own parsers accept", () => {
    // If the prompt's example ever stops parsing, the model learns a format
    // the renderer rejects.
    const text = widgetDirective({ mode: 'Explain' });
    expect(parseGraphSpec(fenced(text, 'apex-graph'))).not.toBeNull();
    const steps = parseStepsSpec(fenced(text, 'apex-steps'));
    expect(steps.steps).toHaveLength(2);
    expect(steps.answer).toBe("$y' = 6x\\cos(3x^2)$");
  });

  it('tells walkthroughs to use the step-reveal block', () => {
    expect(WALKTHROUGH_DIRECTIVE).toMatch(/apex-steps/);
  });
});
