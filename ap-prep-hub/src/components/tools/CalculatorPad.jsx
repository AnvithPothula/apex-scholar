import React, { useState } from 'react';

// Minimal calculator: supports + - * / ^ and parentheses
function safeEval(expr) {
  // Shunting-yard to RPN then evaluate
  const ops = { '+':1, '-':1, '*':2, '/':2, '^':3 };
  const assoc = { '^': 'right' };
  const output = [];
  const stack = [];
  const tokens = expr.replace(/\s+/g,'').match(/\d*\.?\d+|[()+\-*/^]/g) || [];
  for (const t of tokens) {
    if (/^\d*\.?\d+$/.test(t)) output.push(parseFloat(t));
    else if (t in ops) {
      while (stack.length) {
        const o2 = stack[stack.length - 1];
        if ((o2 in ops) && ((assoc[t] !== 'right' && ops[t] <= ops[o2]) || (assoc[t] === 'right' && ops[t] < ops[o2]))) {
          output.push(stack.pop());
        } else break;
      }
      stack.push(t);
    } else if (t === '(') stack.push(t);
    else if (t === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') output.push(stack.pop());
      if (stack.pop() !== '(') throw new Error('Mismatched parentheses');
    } else {
      throw new Error('Invalid token');
    }
  }
  while (stack.length) {
    const s = stack.pop();
    if (s === '(' || s === ')') throw new Error('Mismatched parentheses');
    output.push(s);
  }
  const evalStack = [];
  for (const t of output) {
    if (typeof t === 'number') evalStack.push(t);
    else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      let r = NaN;
      switch (t) {
        case '+': r = a + b; break;
        case '-': r = a - b; break;
        case '*': r = a * b; break;
        case '/': r = a / b; break;
        case '^': r = Math.pow(a, b); break;
        default: throw new Error('Unknown operator');
      }
      evalStack.push(r);
    }
  }
  if (evalStack.length !== 1) throw new Error('Invalid expression');
  return evalStack[0];
}

const CalculatorPad = ({ onClose }) => {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const calculate = () => {
    try {
      setError('');
      const val = safeEval(expr);
      setResult(String(val));
    } catch (e) {
      setError(e.message || 'Invalid expression');
      setResult('');
    }
  };

  return (
    <div role="dialog" aria-label="Calculator" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-850 border border-border rounded-sm p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-content-primary font-semibold">Calculator</h2>
          <button onClick={onClose} className="text-content-secondary hover:text-content-primary" aria-label="Close calculator">✕</button>
        </div>
        <input
          aria-label="Expression"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') calculate(); }}
          placeholder="e.g., (2+3)*4^2 / 8"
          className="w-full mb-3 px-3 py-2 rounded-md bg-base-800 border border-border text-content-primary"
        />
        <div className="flex gap-2">
          <button onClick={calculate} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-base-950" aria-label="Calculate">
            Calculate
          </button>
          <button onClick={() => { setExpr(''); setResult(''); setError(''); }} className="px-4 py-2 bg-base-800 hover:bg-base-750 rounded-md text-content-primary" aria-label="Clear">
            Clear
          </button>
        </div>
        {result && (
          <div className="mt-3 p-2 bg-success-900/20 text-success-200 border border-success-700 rounded">Result: {result}</div>
        )}
        {error && (
          <div className="mt-3 p-2 bg-error-900/20 text-error-200 border border-error-700 rounded">{error}</div>
        )}
        <p className="mt-3 text-xs text-content-muted">Supports + - * / ^ and parentheses. Press Enter to evaluate.</p>
      </div>
    </div>
  );
};

export default CalculatorPad;
