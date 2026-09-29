/**
 * A small, safe math-expression compiler for the tutor's interactive graphs.
 *
 * The tutor writes expressions like "a*sin(b*x) + c" inside an ```apex-graph
 * block. That text comes from a language model, so it is never handed to eval
 * or `new Function`: it is tokenized and parsed here into a tree of closures
 * that can only do arithmetic on numbers. Anything outside the grammar throws,
 * and the widget shows nothing rather than guessing.
 *
 * Grammar (standard precedence, ^ is right-associative, -x^2 = -(x^2)):
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/') unary | <implicit> unary)*
 *   unary   := ('+' | '-') unary | power
 *   power   := primary ('^' unary)?
 *   primary := number | name | name '(' args ')' | '(' expr ')' | '|' expr '|'
 * Implicit multiplication covers what models actually write: 2x, 3(x+1), (x+1)(x-1), 2pi.
 */

const MAX_LENGTH = 300;
const MAX_DEPTH = 60;

const FUNCTIONS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  exp: Math.exp, ln: Math.log, log: Math.log10, log10: Math.log10, log2: Math.log2,
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sign: Math.sign,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
  min: Math.min, max: Math.max, pow: Math.pow,
};

const CONSTANTS = { pi: Math.PI, e: Math.E };

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i += 1; continue; }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) { tokens.push({ t: 'num', v: parseFloat(num[0]) }); i += num[0].length; continue; }
    const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
    if (name) { tokens.push({ t: 'name', v: name[0] }); i += name[0].length; continue; }
    if (ch === 'π') { tokens.push({ t: 'name', v: 'pi' }); i += 1; continue; }
    if (ch === '*' && src[i + 1] === '*') { tokens.push({ t: 'op', v: '^' }); i += 2; continue; }
    if ('+-*/^(),|'.includes(ch)) { tokens.push({ t: 'op', v: ch }); i += 1; continue; }
    if (ch === '·' || ch === '×') { tokens.push({ t: 'op', v: '*' }); i += 1; continue; }
    if (ch === '−') { tokens.push({ t: 'op', v: '-' }); i += 1; continue; }
    throw new Error(`Unexpected character "${ch}"`);
  }
  return tokens;
}

/**
 * Compile an expression.
 * @param {string} source
 * @param {string[]} variables  names the expression may reference (e.g. ['x', 'a'])
 * @returns {(scope: Record<string, number>) => number}
 * @throws on anything that is not a valid expression over those variables
 */
export function compileExpression(source, variables = ['x']) {
  const src = String(source ?? '').trim();
  if (!src) throw new Error('Empty expression');
  if (src.length > MAX_LENGTH) throw new Error('Expression too long');
  const allowed = new Set(variables);
  const tokens = tokenize(src);
  let pos = 0;
  let depth = 0;

  const peek = () => tokens[pos];
  const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
  const expectOp = (v) => {
    if (!isOp(v)) throw new Error(`Expected "${v}"`);
    pos += 1;
  };
  const enter = () => { depth += 1; if (depth > MAX_DEPTH) throw new Error('Expression too deeply nested'); };
  const leave = () => { depth -= 1; };

  // A token that can START a primary — used to detect implicit multiplication.
  // `|` is excluded: after an operand it is always a closing bar.
  const startsPrimary = () => {
    const tk = peek();
    return tk && (tk.t === 'num' || tk.t === 'name' || (tk.t === 'op' && tk.v === '('));
  };

  function parseExpr() {
    enter();
    let left = parseTerm();
    while (isOp('+') || isOp('-')) {
      const op = peek().v; pos += 1;
      const l = left; const r = parseTerm();
      left = op === '+' ? (s) => l(s) + r(s) : (s) => l(s) - r(s);
    }
    leave();
    return left;
  }

  function parseTerm() {
    let left = parseUnary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = peek().v; pos += 1;
        const l = left; const r = parseUnary();
        left = op === '*' ? (s) => l(s) * r(s) : (s) => l(s) / r(s);
      } else if (startsPrimary()) {
        const l = left; const r = parseUnary();
        left = (s) => l(s) * r(s);
      } else {
        return left;
      }
    }
  }

  function parseUnary() {
    if (isOp('-')) { pos += 1; enter(); const v = parseUnary(); leave(); return (s) => -v(s); }
    if (isOp('+')) { pos += 1; enter(); const v = parseUnary(); leave(); return v; }
    return parsePower();
  }

  function parsePower() {
    const base = parsePrimary();
    if (isOp('^')) {
      pos += 1;
      enter();
      const exp = parseUnary();
      leave();
      return (s) => Math.pow(base(s), exp(s));
    }
    return base;
  }

  function parsePrimary() {
    const tk = peek();
    if (!tk) throw new Error('Unexpected end of expression');
    if (tk.t === 'num') { pos += 1; const v = tk.v; return () => v; }
    if (tk.t === 'op' && tk.v === '(') {
      pos += 1;
      const inner = parseExpr();
      expectOp(')');
      return inner;
    }
    if (tk.t === 'op' && tk.v === '|') {
      pos += 1;
      const inner = parseExpr();
      expectOp('|');
      return (s) => Math.abs(inner(s));
    }
    if (tk.t === 'name') {
      pos += 1;
      const name = tk.v;
      const lower = name.toLowerCase();
      if (isOp('(') && Object.prototype.hasOwnProperty.call(FUNCTIONS, lower)) {
        pos += 1;
        const args = [parseExpr()];
        while (isOp(',')) { pos += 1; args.push(parseExpr()); }
        expectOp(')');
        const fn = FUNCTIONS[lower];
        if (args.length === 1) { const a = args[0]; return (s) => fn(a(s)); }
        return (s) => fn(...args.map((a) => a(s)));
      }
      if (allowed.has(name)) return (s) => s[name];
      if (Object.prototype.hasOwnProperty.call(CONSTANTS, lower)) { const v = CONSTANTS[lower]; return () => v; }
      throw new Error(`Unknown name "${name}"`);
    }
    throw new Error(`Unexpected "${tk.v}"`);
  }

  const fn = parseExpr();
  if (pos !== tokens.length) throw new Error(`Unexpected "${tokens[pos].v}"`);
  return (scope) => {
    const v = fn(scope || {});
    return typeof v === 'number' ? v : NaN;
  };
}

/** True when `source` compiles over `variables`. */
export function isValidExpression(source, variables = ['x']) {
  try {
    compileExpression(source, variables);
    return true;
  } catch {
    return false;
  }
}
