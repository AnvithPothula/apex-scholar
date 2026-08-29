/**
 * Public AP score calculator — no account required.
 *
 * Deliberately outside GuestGate: this is the highest-intent free query students
 * search every May ("AP Biology score calculator"), and a sign-in wall would
 * defeat the point of having it.
 *
 * The differentiator is honesty. Every competitor presents a predicted score as
 * if the College Board published its cut points; it does not. This one shows the
 * whole curve, labels the estimate as an estimate, and says plainly when a
 * subject has no researched model.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { scoreCalculatorTitle, scoreCalculatorDescription, canonicalFor } from '../utils/pageMeta';
import { Calculator, Info, ChevronDown, Share2 } from 'lucide-react';
import ScoreCard from '../components/ui/ScoreCard';
import { Card, Button } from '../components/ui/UIComponents';
import { createPageUrl } from '../utils/helpers';
import { MODELLED_SUBJECTS, getScoreModel, SUBJECT_BY_SLUG, slugFor } from '../constants/apScoreModels';
import { scoreFor, curveRows, clampRawsForModel } from '../utils/apScore';

const SCORE_COLOR = {
  5: 'text-success-400',
  4: 'text-success-400',
  3: 'text-warning-400',
  2: 'text-error-400',
  1: 'text-error-400',
};

export default function ScoreCalculator() {
  // The slug drives the subject so "AP Bio score calculator" can land directly on
  // /ap-score-calculator/ap-biology instead of a generic picker.
  const { slug } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(
    () => SUBJECT_BY_SLUG[slug || ''] || MODELLED_SUBJECTS[0]
  );

  useEffect(() => {
    const fromSlug = SUBJECT_BY_SLUG[slug || ''];
    if (fromSlug && fromSlug !== subject) setSubject(fromSlug);
  }, [slug, subject]);

  // Per-subject title/description/canonical. Without these every calculator
  // shared the site's generic <title>, so "ap bio score calculator" matched
  // nothing even though the page was public and in the sitemap.
  useDocumentMeta({
    title: scoreCalculatorTitle(subject),
    description: scoreCalculatorDescription(subject),
    canonical: canonicalFor(`/ap-score-calculator/${slugFor(subject)}`),
  });

  const chooseSubject = (next) => {
    setSubject(next);
    setRaws({});
    // Keep the URL shareable and indexable for the chosen subject.
    navigate(`/ap-score-calculator/${slugFor(next)}`, { replace: true });
  };
  // Seed from the URL so "See the curve" after a practice test lands on the
  // student's own numbers instead of an empty form. Values are clamped through
  // the same helper the tutor's inline widget uses, because a query string is
  // just as untrusted as AI output.
  const [showShare, setShowShare] = useState(false);
  const [searchParams] = useSearchParams();
  const seededFromTest = searchParams.get('from') === 'test';
  const [raws, setRaws] = useState(() =>
    clampRawsForModel(getScoreModel(SUBJECT_BY_SLUG[slug || ''] || MODELLED_SUBJECTS[0]),
      Object.fromEntries(searchParams.entries()))
  );
  const [showCurve, setShowCurve] = useState(false);

  const model = useMemo(() => getScoreModel(subject), [subject]);
  const result = useMemo(() => scoreFor(subject, raws), [subject, raws]);
  const rows = useMemo(() => curveRows(model), [model]);

  const setRaw = (id, value) => setRaws((prev) => ({ ...prev, [id]: value }));
  const anyEntered = model.sections.some((s) => raws[s.id] !== undefined && raws[s.id] !== '');

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-6 h-6 text-content-primary" strokeWidth={1.5} />
          <h1 className="text-h2 font-display text-content-primary">AP Score Calculator</h1>
        </div>
        <p className="text-body-sm text-content-secondary mb-6">
          Enter your raw section scores to estimate a 1–5.
        </p>

        <Card className="p-5 mb-4">
          <label htmlFor="sc-subject" className="block text-sm font-medium text-content-secondary mb-2">
            Subject
          </label>
          <select
            id="sc-subject"
            value={subject}
            onChange={(e) => chooseSubject(e.target.value)}
            className="w-full bg-base-800 border border-border-strong rounded-lg p-2.5 text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-content-muted"
          >
            {MODELLED_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {model.note && (
            <p className="text-caption text-content-muted mt-2">{model.note}</p>
          )}
          {/* A practice test is usually shorter than the real section, so these
              raw numbers were scaled up from the percentage scored, not copied.
              Saying so stops "40 / 60" reading as "you answered 60 questions". */}
          {seededFromTest && (
            <p className="text-caption text-primary-400 mt-2">
              Filled in from your practice test, scaled to the full exam's section sizes. Adjust freely.
            </p>
          )}
        </Card>

        <Card className="p-5 mb-4 space-y-4">
          {model.sections.map((s) => (
            <div key={s.id}>
              <label htmlFor={`sc-${s.id}`} className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium text-content-secondary">{s.label}</span>
                <span className="text-caption text-content-muted">out of {s.maxRaw}</span>
              </label>
              <div className="flex items-center gap-3">
                {/* Slider and box are two views of one value — drag to explore,
                    type when you know the exact number. */}
                <input
                  type="range"
                  min="0"
                  max={s.maxRaw}
                  step="1"
                  aria-label={`${s.label} slider`}
                  value={Number(raws[s.id]) || 0}
                  onChange={(e) => setRaw(s.id, e.target.value)}
                  className="flex-1 accent-primary-400 cursor-pointer"
                />
                <input
                  id={`sc-${s.id}`}
                  type="number"
                  min="0"
                  max={s.maxRaw}
                  inputMode="numeric"
                  value={raws[s.id] ?? ''}
                  onChange={(e) => setRaw(s.id, e.target.value)}
                  placeholder="0"
                  className="w-20 shrink-0 bg-base-800 border border-border-strong rounded-lg p-2 text-body-sm text-content-primary text-right focus:outline-none focus:ring-2 focus:ring-content-muted"
                />
              </div>
            </div>
          ))}
          {anyEntered && (
            <Button variant="ghost" size="sm" onClick={() => setRaws({})} className="text-content-muted">
              Clear
            </Button>
          )}
        </Card>

        <Card className="p-6 mb-4 text-center">
          <p className="text-label text-content-muted mb-1">Estimated AP Score</p>
          <p className={`text-6xl font-display font-bold ${SCORE_COLOR[result.score]}`}>
            {result.score}
          </p>
          <p className="text-body-sm text-content-secondary mt-2">
            Composite {result.composite} / {result.compositeMax} ({result.percent}%)
          </p>
          {result.next && (
            <p className="text-body-sm text-content-muted mt-1">
              {result.next.pointsNeeded} more composite point{result.next.pointsNeeded === 1 ? '' : 's'} for a {result.next.nextScore}.
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-border-subtle text-left space-y-1">
            {result.sections.map((s) => (
              <div key={s.id} className="flex justify-between text-caption text-content-secondary">
                <span>{s.label}</span>
                <span>{s.raw} / {s.maxRaw} → {s.earned} pts</span>
              </div>
            ))}
          </div>

          {/* Students screenshot this and post it. A cropped screenshot loses
              the "estimated" caveat, so offer a card that carries the caveat
              inside the image. */}
          <button
            type="button"
            onClick={() => setShowShare((v) => !v)}
            aria-expanded={showShare}
            className="mt-4 inline-flex items-center gap-1.5 text-body-sm rounded-md border border-border px-3 py-1.5 text-content-primary hover:bg-base-800"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            {showShare ? 'Hide share card' : 'Share this score'}
          </button>
        </Card>

        {showShare && (
          <div className="mb-4">
            <ScoreCard subject={subject} result={result} onClose={() => setShowShare(false)} />
          </div>
        )}

        {/* The curve. No competitor shows this — which is exactly why it's here. */}
        <Card className="p-0 mb-4 overflow-hidden">
          <button
            onClick={() => setShowCurve((v) => !v)}
            className="w-full flex items-center justify-between p-4 hover:bg-base-800 transition-colors"
          >
            <span className="text-body-sm text-content-primary">Show the curve used</span>
            <ChevronDown className={`w-4 h-4 text-content-muted transition-transform ${showCurve ? 'rotate-180' : ''}`} strokeWidth={1.5} />
          </button>
          {showCurve && (
            <div className="px-4 pb-4">
              <div className="divide-y divide-border-subtle">
                {rows.map((r) => (
                  <div key={r.score} className="flex items-center justify-between py-2">
                    <span className={`font-display font-bold ${SCORE_COLOR[r.score]}`}>{r.score}</span>
                    <span className="text-body-sm text-content-secondary">
                      {r.min}–{r.max} composite
                    </span>
                    <span className="text-caption text-content-muted w-14 text-right">{r.percentMin}%+</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 mb-6 border border-warning-500/30 bg-warning-900/10">
          <p className="text-body-sm text-content-secondary flex gap-2">
            <Info className="w-4 h-4 text-warning-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>
              <strong className="text-content-primary">This is an estimate, not a College Board score.</strong>{' '}
              The College Board does not publish its cut points, and they shift a few points each year
              with exam difficulty. The section structure and weights above are official; the cut
              points are estimated from recent released exams and score distributions.
              {result.isGeneric && ' This subject has no researched model yet, so a generic 50/50 curve is being used — treat it as rough.'}
              {/* Not all modelled subjects are equally well grounded. Batch 1
                  cut points came from released exams for that subject; later
                  batches were extrapolated from those. Saying which is which
                  costs one sentence and is the whole point of this page. */}
              {!result.isGeneric && model.cutoffConfidence === 'extrapolated' &&
                ' For this subject the cut points are extrapolated from other AP exams rather than from its own released scoring data, so treat them as looser than the section weights.'}
            </span>
          </p>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Link to={createPageUrl('PracticeTests')}>
            <Button variant="primary">Take a free practice test</Button>
          </Link>
          <Link to={createPageUrl('AITutors')}>
            <Button variant="outline">Ask a free AI tutor</Button>
          </Link>
        </div>
        <p className="text-caption text-content-muted mt-6">
          AP® is a trademark registered by the College Board, which is not affiliated with, and does
          not endorse, Apex Scholar.
        </p>
      </div>
    </div>
  );
}
