import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const LANGUAGE_NAMES = {
  js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', typescript: 'TypeScript',
  py: 'Python', python: 'Python', java: 'Java', c: 'C', cpp: 'C++', 'c++': 'C++', cs: 'C#', csharp: 'C#',
  html: 'HTML', css: 'CSS', json: 'JSON', sql: 'SQL', bash: 'Shell', sh: 'Shell', shell: 'Shell',
  r: 'R', text: 'Text', txt: 'Text', pseudocode: 'Pseudocode', plaintext: 'Text',
};

/** Copy with a textarea fallback for insecure origins (plain-http localhost). */
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

/**
 * A fenced code block with a language label and a copy button. CS A students
 * paste these straight into an editor, and selecting a long block by hand on a
 * phone is miserable.
 */
export default function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  const label = LANGUAGE_NAMES[String(language || '').toLowerCase()] || language || 'Code';
  const onCopy = async () => {
    try {
      await copyText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the text is still selectable */
    }
  };
  return (
    <div className="not-prose my-3 rounded-lg border border-border bg-base-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-base-850">
        <span className="text-xs font-medium text-content-muted">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="inline-flex items-center gap-1 text-xs text-content-muted hover:text-content-primary transition-colors min-h-[24px]"
        >
          {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-content-primary">{code}</code>
      </pre>
    </div>
  );
}
