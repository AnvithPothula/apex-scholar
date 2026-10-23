/**
 * Parsers for the interactive blocks a tutor answer can contain.
 *
 * The tutor emits fenced blocks (```apex-graph, ```apex-steps) whose bodies are
 * JSON written by a language model. Everything here is defensive: a spec that
 * does not validate returns null, and the renderer shows a quiet fallback
 * instead of a half-drawn widget that looks authoritative.
 */

import JSONParser from '../services/ai/jsonParser';
import { compileExpression } from './mathExpr';

const repairParser = new JSONParser();

/**
 * LaTeX commands that begin with a letter JSON also uses as an escape
 * (\n \r \t \b \f). "\theta" must become "\\theta", but "\nNext step" is
 * a real newline before a word — so these are matched as whole command names.
 */
const ESCAPE_LETTER_COMMANDS = /^(n|nabla|ne|neq|neg|nu|ni|not|nleq|ngeq|nmid|newline|nearrow|nwarrow|r|rho|rm|rangle|rceil|rfloor|rbrace|rightarrow|rightleftharpoons|right|rbrack|t|tau|theta|times|tan|tanh|to|top|tilde|text|textbf|textit|textrm|texttt|therefore|triangle|triangleq|b|beta|bar|bf|binom|boxed|begin|bullet|because|bot|breve|big|bigg|bigl|bigr|bigcup|bigcap|f|frac|forall|flat|frown|frak)$/;

/**
 * Parse a model-written JSON object.
 *
 * The common failure is LaTeX inside a JSON string with ONE backslash:
 * "\frac{a}{b}" is a valid JSON escape (\f = form feed) that silently eats the
 * backslash, and "\theta" becomes a tab plus "heta". Lone backslashes that
 * start a LaTeX command are doubled before parsing; real JSON escapes ("\n"
 * before ordinary text) are left alone.
 */
export function parseModelJson(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const fixed = text.replace(/(?<!\\)\\([A-Za-z]+)/g, (m, word) => {
    if (!'nrtbf'.includes(word[0])) return `\\\\${word}`;
    return ESCAPE_LETTER_COMMANDS.test(word) && word.length > 1 ? `\\\\${word}` : m;
  });
  try {
    const v = JSON.parse(fixed);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    const res = repairParser.parse(fixed, false);
    return res.success && res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null;
  }
}

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const num = (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v);
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function range(value, fallback) {
  if (!Array.isArray(value) || value.length !== 2) return fallback;
  const lo = num(value[0]);
  const hi = num(value[1]);
  if (!finite(lo) || !finite(hi) || !(hi > lo)) return fallback;
  return [lo, hi];
}

const PARAM_NAME = /^[A-Za-z][A-Za-z0-9_]{0,11}$/;
const RESERVED = new Set(['x', 'pi', 'e']);

/**
 * ```apex-graph
 * {"title": "...", "x": [-5, 5], "y": [-2, 10],
 *  "xLabel": "t (s)", "yLabel": "v (m/s)",
 *  "curves": [{"expr": "a*x^2 + b", "label": "f(x)"}],
 *  "params": {"a": {"min": -3, "max": 3, "value": 1, "step": 0.1, "label": "a"}}}
 * ```
 * @returns {null | {title, xRange, yRange, xLabel, yLabel, curves, params}}
 */
export function parseGraphSpec(raw) {
  const spec = typeof raw === 'string' ? parseModelJson(raw) : raw;
  if (!spec || typeof spec !== 'object') return null;

  const params = [];
  const rawParams = spec.params && typeof spec.params === 'object' && !Array.isArray(spec.params) ? spec.params : {};
  for (const [name, p] of Object.entries(rawParams).slice(0, 4)) {
    if (!PARAM_NAME.test(name) || RESERVED.has(name) || !p || typeof p !== 'object') return null;
    const min = num(p.min);
    const max = num(p.max);
    if (!finite(min) || !finite(max) || !(max > min)) return null;
    let value = num(p.value);
    if (!finite(value)) value = (min + max) / 2;
    value = Math.min(max, Math.max(min, value));
    let step = num(p.step);
    if (!finite(step) || step <= 0 || step > max - min) step = (max - min) / 100;
    params.push({ name, min, max, value, step, label: str(p.label, 40) || name });
  }

  const names = ['x', ...params.map((p) => p.name)];
  const rawCurves = Array.isArray(spec.curves)
    ? spec.curves
    : typeof spec.expr === 'string' ? [{ expr: spec.expr, label: spec.label }] : [];
  const curves = [];
  for (const c of rawCurves.slice(0, 4)) {
    const expr = typeof c === 'string' ? c : c && c.expr;
    if (typeof expr !== 'string') return null;
    let fn;
    try {
      fn = compileExpression(expr, names);
    } catch {
      return null;
    }
    curves.push({ expr: expr.trim(), label: str(c && c.label, 40) || expr.trim(), fn });
  }
  if (!curves.length) return null;

  const xRange = range(spec.x, [-10, 10]);
  const yRange = range(spec.y, null); // null = fit to the curves
  return {
    title: str(spec.title, 80),
    xRange,
    yRange,
    xLabel: str(spec.xLabel, 30),
    yLabel: str(spec.yLabel, 30),
    curves,
    params,
  };
}

/**
 * ```apex-steps
 * {"title": "Find the derivative", "steps": [{"title": "...", "body": "markdown"}], "answer": "..."}
 * ```
 * @returns {null | {title, steps: Array<{title, body}>, answer}}
 */
export function parseStepsSpec(raw) {
  const spec = typeof raw === 'string' ? parseModelJson(raw) : raw;
  if (!spec || typeof spec !== 'object' || !Array.isArray(spec.steps)) return null;
  const steps = spec.steps
    .slice(0, 12)
    .map((s) => (typeof s === 'string'
      ? { title: '', body: s.trim().slice(0, 2000) }
      : { title: str(s && s.title, 120), body: str(s && s.body, 2000) }))
    .filter((s) => s.title || s.body);
  if (steps.length < 1) return null;
  return { title: str(spec.title, 120), steps, answer: str(spec.answer, 600) };
}

/**
 * ```apex-sim: a branching scenario. Each scene offers choices; a choice moves
 * the meters, explains what happened, and leads to another scene. A scene with
 * no choices is an ending. Choices pointing at a missing scene are dropped, so
 * a sloppy spec still plays instead of dead-ending.
 */
export function parseSimSpec(raw) {
  const spec = typeof raw === 'string' ? parseModelJson(raw) : raw;
  if (!spec || typeof spec !== 'object' || !spec.scenes || typeof spec.scenes !== 'object') return null;
  // Accept scenes as an object keyed by id, or an array of {id, ...}.
  const entries = Array.isArray(spec.scenes)
    ? spec.scenes.map((s, i) => [str(s && s.id, 40) || `s${i + 1}`, s])
    : Object.entries(spec.scenes);
  const ids = new Set(entries.slice(0, 16).map(([id]) => String(id)));
  const meters = (Array.isArray(spec.meters) ? spec.meters : []).slice(0, 3)
    .map((m) => {
      const min = finite(num(m && m.min)) ? num(m.min) : 0;
      const max = finite(num(m && m.max)) && num(m.max) > min ? num(m.max) : 100;
      const value = finite(num(m && m.value)) ? Math.min(max, Math.max(min, num(m.value))) : (min + max) / 2;
      return { id: str(m && m.id, 30), label: str(m && m.label, 40) || str(m && m.id, 30), min, max, value };
    })
    .filter((m) => m.id);
  const meterIds = new Set(meters.map((m) => m.id));
  const scenes = {};
  for (const [id, s] of entries.slice(0, 16)) {
    if (!s || typeof s !== 'object') continue;
    const choices = (Array.isArray(s.choices) ? s.choices : []).slice(0, 4)
      .map((c) => ({
        label: str(c && c.label, 140),
        next: String((c && c.next) ?? ''),
        feedback: str(c && c.feedback, 800),
        effects: Object.fromEntries(Object.entries((c && c.effects) || {})
          .filter(([k, v]) => meterIds.has(k) && finite(num(v)))
          .map(([k, v]) => [k, num(v)])),
      }))
      .filter((c) => c.label && ids.has(c.next));
    scenes[String(id)] = { text: str(s.text, 1500), choices };
  }
  const start = ids.has(String(spec.start)) ? String(spec.start) : entries[0] && String(entries[0][0]);
  if (Object.keys(scenes).length < 2 || !scenes[start] || !scenes[start].choices.length) return null;
  return { title: str(spec.title, 120), intro: str(spec.intro, 800), meters, start, scenes };
}
