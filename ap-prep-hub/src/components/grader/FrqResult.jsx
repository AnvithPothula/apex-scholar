import React from 'react';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Card } from '../ui/UIComponents';
import MarkdownRenderer from '../MarkdownRenderer';

/** A graded free-response answer: score, criterion-by-criterion points, feedback. */
export default function FrqResult({ result, rubricLabel }) {
  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-h3 font-display font-semibold text-content-primary">
          {result.score} / {result.maxPoints} points
        </h2>
        <span className="text-xs text-content-muted">Graded with {rubricLabel}</span>
      </div>
      {result.criteria.length > 0 && (
        <ul className="divide-y divide-border-subtle rounded-md border border-border">
          {result.criteria.map((c, i) => (
            <li key={i} className="p-3 flex gap-3">
              {c.earned >= c.possible ? <CheckCircle2 className="w-5 h-5 text-success-400 shrink-0" />
                : c.earned > 0 ? <MinusCircle className="w-5 h-5 text-warning-400 shrink-0" />
                  : <XCircle className="w-5 h-5 text-error-400 shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-medium text-content-primary">{c.name}</span>
                  <span className="tabular-nums text-content-secondary shrink-0">{c.earned}/{c.possible}</span>
                </div>
                <div className="text-sm text-content-secondary mt-1"><MarkdownRenderer content={c.reason} /></div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {result.feedback && <div className="text-sm text-content-secondary"><MarkdownRenderer content={result.feedback} /></div>}
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        {result.strengths.length > 0 && (
          <div><div className="font-medium text-success-400 mb-1">Strengths</div><ul className="list-disc pl-5 space-y-1 text-content-secondary">{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        )}
        {result.improvements.length > 0 && (
          <div><div className="font-medium text-warning-400 mb-1">To earn more points</div><ul className="list-disc pl-5 space-y-1 text-content-secondary">{result.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        )}
      </div>
      {result.transcript && (
        <details className="text-sm">
          <summary className="cursor-pointer text-content-muted">What the grader read from your photos</summary>
          <div className="mt-2 text-content-secondary"><MarkdownRenderer content={result.transcript} /></div>
        </details>
      )}
      <p className="text-xs text-content-muted">AI grading is an estimate. A real AP reader may score differently.</p>
    </Card>
  );
}

