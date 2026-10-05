import React, { createContext, useContext, useMemo, useState } from 'react';
import { ClipboardCheck, RotateCcw } from 'lucide-react';
import { rubricInfo } from '../../utils/rubric';

/**
 * Table renderers for MarkdownRenderer.
 *
 * Plain tables get readable styling and keep GFM column alignment. A table
 * with a points column (an AP rubric, which tutors produce constantly) becomes
 * a rubric card: point badges, the total, and an optional "Score my work"
 * column where the student marks each row against their own essay or answer.
 */

const RubricContext = createContext(null);

/** Stable identity for a hast node, since tr/table overrides receive separate objects. */
const nodeKey = (node) => {
  const p = node && node.position && node.position.start;
  return p ? `${p.line}:${p.column}:${p.offset}` : null;
};

const elementChildren = (children) => React.Children.toArray(children).filter(React.isValidElement);

function PointsStepper({ max, value, onChange, label }) {
  const whole = Number.isInteger(max) && max <= 10;
  if (!whole) {
    return (
      <input
        type="number"
        min={0}
        max={max}
        step={0.5}
        value={value ?? ''}
        onChange={(e) => {
          const n = e.target.value === '' ? null : Math.max(0, Math.min(max, Number(e.target.value)));
          onChange(Number.isFinite(n) ? n : null);
        }}
        aria-label={label}
        className="w-16 bg-base-800 border border-border-strong rounded px-2 py-1 text-sm text-content-primary"
      />
    );
  }
  return (
    <div className="flex flex-nowrap gap-1" role="group" aria-label={label}>
      {Array.from({ length: max + 1 }, (_, n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          aria-pressed={value === n}
          className={`min-w-[1.75rem] h-7 px-1.5 rounded text-xs font-semibold border transition-colors ${
            value === n
              ? 'bg-primary-500 border-primary-500 text-base-950'
              : 'bg-base-800 border-border-strong text-content-secondary hover:text-content-primary hover:border-content-muted'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function RubricTable({ node, info, children }) {
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState({});

  const tbody = (node.children || []).find((c) => c.tagName === 'tbody');
  const rowKeys = useMemo(
    () => (tbody ? tbody.children.filter((c) => c.tagName === 'tr').map(nodeKey) : []),
    [tbody]
  );

  const earned = Object.values(scores).reduce((a, b) => a + (Number(b) || 0), 0);
  const answered = Object.values(scores).filter((v) => v !== null && v !== undefined).length;
  const scorable = info.rowMax.filter((m) => m !== null).length;

  const ctx = {
    pointsCol: info.pointsCol,
    scoring,
    rowMaxFor: (tr) => info.rowMax[rowKeys.indexOf(nodeKey(tr))] ?? null,
    scoreFor: (tr) => scores[nodeKey(tr)] ?? null,
    setScore: (tr, v) => setScores((prev) => ({ ...prev, [nodeKey(tr)]: v })),
  };

  return (
    <RubricContext.Provider value={ctx}>
      <div className="not-prose my-4 rounded-lg border border-border-strong bg-base-900 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border bg-base-850">
          <div className="flex items-center gap-2 text-sm font-semibold text-content-primary">
            <ClipboardCheck className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
            Scoring rubric
            <span className="text-xs font-medium text-content-muted">· {info.total} {info.total === 1 ? 'point' : 'points'} total</span>
          </div>
          <button
            type="button"
            onClick={() => setScoring((s) => !s)}
            aria-pressed={scoring}
            className="text-xs font-medium px-2.5 py-1 rounded-md border border-border-strong text-content-secondary hover:text-content-primary hover:border-content-muted transition-colors"
          >
            {scoring ? 'Hide scoring' : 'Score my work'}
          </button>
        </div>
        {/* On a phone each row stacks into a card (category + points, then the
            requirement, then the score buttons) instead of squeezing three
            columns into 390px, which left the requirement one word per line. */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse max-sm:block">{children}</table>
        </div>
        {scoring && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border bg-base-850 text-sm">
            <span className="text-content-secondary">
              Your score:{' '}
              <span className="font-semibold text-content-primary">{earned}</span>
              <span className="text-content-muted"> / {info.total}</span>
              {answered < scorable && (
                <span className="text-xs text-content-muted"> · {scorable - answered} {scorable - answered === 1 ? 'row' : 'rows'} left</span>
              )}
            </span>
            {answered > 0 && (
              <button
                type="button"
                onClick={() => setScores({})}
                className="inline-flex items-center gap-1 text-xs text-content-muted hover:text-content-primary"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} /> Reset
              </button>
            )}
          </div>
        )}
      </div>
    </RubricContext.Provider>
  );
}

export function MarkdownTable({ node, children }) {
  const info = useMemo(() => (node ? rubricInfo(node) : null), [node]);
  if (info) return <RubricTable node={node} info={info}>{children}</RubricTable>;
  return (
    <div className="not-prose my-3 overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function MarkdownThead({ children }) {
  return <thead className="bg-base-800">{children}</thead>;
}

export function MarkdownTbody({ children }) {
  const rubric = useContext(RubricContext);
  return <tbody className={`divide-y divide-border/60 ${rubric ? 'max-sm:block' : ''}`}>{children}</tbody>;
}

export function MarkdownTr({ node, children }) {
  const rubric = useContext(RubricContext);
  if (!rubric) {
    return <tr className="even:bg-base-800/30">{children}</tr>;
  }

  const isHeader = (node?.children || []).some((c) => c.tagName === 'th');
  const cells = elementChildren(children).map((child, i) => {
    if (isHeader) return child;
    if (i === rubric.pointsCol) return React.cloneElement(child, { rubricPoints: true });
    return React.cloneElement(child, { rubricRole: i === 0 ? 'lead' : 'body' });
  });

  if (isHeader) {
    return (
      <tr className="max-sm:hidden">
        {cells}
        {rubric.scoring && (
          <th className="px-3 py-2 text-left text-xs font-semibold text-content-primary whitespace-nowrap">Your score</th>
        )}
      </tr>
    );
  }

  const max = rubric.rowMaxFor(node);
  return (
    <tr className="align-top even:bg-base-800/30 max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:gap-x-3 max-sm:gap-y-1.5 max-sm:px-3 max-sm:py-3">
      {cells}
      {rubric.scoring && (
        <td className="px-3 py-2.5 max-sm:p-0 max-sm:col-span-2 max-sm:pt-1">
          {max !== null ? (
            <PointsStepper
              max={max}
              value={rubric.scoreFor(node)}
              onChange={(v) => rubric.setScore(node, v)}
              label={`Points earned, out of ${max}`}
            />
          ) : (
            <span className="text-content-muted">—</span>
          )}
        </td>
      )}
    </tr>
  );
}

export function MarkdownTh({ style, children }) {
  return (
    <th style={style} className="px-3 py-2 text-left text-xs font-semibold text-content-primary align-bottom">
      {children}
    </th>
  );
}

const RUBRIC_CELL = {
  lead: 'max-sm:p-0 max-sm:col-start-1 max-sm:row-start-1 max-sm:text-content-primary max-sm:font-semibold',
  body: 'max-sm:p-0 max-sm:col-span-2',
};

export function MarkdownTd({ style, rubricPoints, rubricRole, children }) {
  if (rubricPoints) {
    return (
      <td style={style} className="px-3 py-2.5 whitespace-nowrap max-sm:p-0 max-sm:col-start-2 max-sm:row-start-1 max-sm:text-right">
        <span className="inline-flex items-center rounded-full border border-primary-500/40 bg-primary-900/40 px-2 py-0.5 text-xs font-semibold text-primary-400">
          {children}
        </span>
      </td>
    );
  }
  return (
    <td style={style} className={`px-3 py-2.5 text-content-secondary align-top [&_strong]:text-content-primary ${RUBRIC_CELL[rubricRole] || ''}`}>
      {children}
    </td>
  );
}
