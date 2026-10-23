/**
 * Prompt text that teaches the tutor to use the chat's interactive blocks.
 *
 * Each block is a fenced code block the app renders as a live widget
 * (MarkdownRenderer → GraphWidget / StepReveal / the rubric table). Kept here,
 * not inline in AITutors, so the wording is testable and shared by every mode.
 *
 * Pure — no React, no firebase.
 */

const JSON_RULES = 'the block body must be ONE valid JSON object. Inside JSON strings, write every LaTeX backslash doubled ("$\\\\frac{a}{b}$").';

const GRAPH = `apex-graph — an interactive plot with sliders. Use it when seeing a curve change genuinely helps: a function and its derivative, motion graphs, exponential/logistic growth, supply and demand, a normal distribution, a titration curve. Not for every answer.
\`\`\`apex-graph
{"title": "y = a·sin(bx)", "x": [-6.3, 6.3], "curves": [{"expr": "a*sin(b*x)", "label": "y"}], "params": {"a": {"min": 0.5, "max": 3, "value": 1, "step": 0.1, "label": "amplitude a"}, "b": {"min": 0.5, "max": 3, "value": 1, "step": 0.1, "label": "frequency b"}}}
\`\`\`
Keys: "curves" (1-4, each {"expr", "label"}), optional "x" [min,max], "y" [min,max], "xLabel", "yLabel", "params" (0-4 sliders). "expr" is plain math in x and the param names: + - * / ^, sin cos tan exp ln log sqrt abs, pi, e. No LaTeX and no other variables in "expr". Explain in words what to try ("drag b and watch the period shrink").`;

const STEPS = `apex-steps — a worked solution revealed one step at a time, so the student can attempt each step before seeing it.
\`\`\`apex-steps
{"title": "Differentiate $y = \\\\sin(3x^2)$", "steps": [{"title": "Spot the chain rule", "body": "Outer $\\\\sin(u)$, inner $u = 3x^2$."}, {"title": "Differentiate each part", "body": "$\\\\frac{d}{du}\\\\sin u = \\\\cos u$ and $u' = 6x$."}], "answer": "$y' = 6x\\\\cos(3x^2)$"}
\`\`\`
"steps": 2-8 items, each {"title", "body"}, bodies may use Markdown and $LaTeX$. Optional "answer".`;

const SIM = `apex-sim — a playable simulation: the student makes decisions in a realistic scenario, meters move, and each choice explains what happened. ALWAYS use it when the student asks for a sim, simulation, role-play, or "let me try it". Also use it for processes where choices have consequences (checks and balances, how a bill becomes law, a court case, a central bank responding to inflation, a firm choosing output, an ecosystem disturbance). For a relationship between quantities, use apex-graph instead. Introduce it in one or two sentences, then put the whole sim in ONE block; never describe a "simulation" in prose without the block.
\`\`\`apex-sim
{"title": "Checks and balances", "intro": "You are the President.", "meters": [{"id": "power", "label": "Presidential power", "value": 50}, {"id": "approval", "label": "Public approval", "value": 60}], "start": "bill", "scenes": {"bill": {"text": "Congress passes a bill you oppose.", "choices": [{"label": "Veto it", "next": "override", "effects": {"power": 10, "approval": -5}, "feedback": "A veto is the President's check on Congress (Article I, Section 7)."}, {"label": "Sign it", "next": "signed", "effects": {"approval": 5}, "feedback": "The bill becomes law."}]}, "override": {"text": "Congress gathers a two-thirds vote in both chambers and overrides you. The law stands."}, "signed": {"text": "The law takes effect."}}}
\`\`\`
Keys: "meters" (0-3, each {"id", "label", "value", optional "min"/"max", default 0-100}); "scenes" (4-10) keyed by id, each {"text", "choices": [2-3 {"label", "next", "effects": {meterId: change}, "feedback"}]}; a scene with no "choices" is an ending, and every path must reach one. "feedback" names the real concept, case, or rule behind the outcome so the sim teaches it. Keep every scene accurate to the course.`;

const RUBRIC = 'RUBRICS: when you present an AP scoring rubric, use a Markdown table with a "Points" column (e.g. "0–1", "0–4") and one row per scoring row. The app turns it into an interactive rubric the student can score their own work against.';

/**
 * @param {{mode?: string}} opts  the tutor mode ('Explain', 'Walkthrough', ...)
 * @returns {string} prompt block, or '' where widgets make no sense
 */
export function widgetDirective({ mode = 'Explain' } = {}) {
  // MCQ mode must answer with bare JSON; any fenced block breaks the parser.
  if (mode === 'Practice MCQ') return '';
  return `INTERACTIVE BLOCKS (the app renders these fenced blocks as live widgets; ${JSON_RULES}):
${GRAPH}

${STEPS}

${SIM}

${RUBRIC}`;
}

/** Walkthrough mode leans on the step-reveal block instead of a static list. */
export const WALKTHROUGH_DIRECTIVE = `MODE: Step-by-step walkthrough.
Give a one-sentence setup (what we're solving and the key idea), then put the solution in ONE \`\`\`apex-steps block: one key action per step, each step saying what you do and why, math in $LaTeX$. Put the final answer in "answer". After the block, add one sentence on the general approach and one follow-up question. If the problem is not step-shaped (a definition, a quick fact), just answer normally.`;

export default widgetDirective;
