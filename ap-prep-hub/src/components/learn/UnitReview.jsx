import React, { useEffect, useState } from 'react';
import { Loader2, PlayCircle } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer.jsx';
import MCQCard from '../tutors/MCQCard.jsx';
import { getUnitSummary } from '../../services/curriculumContent';

/**
 * Unit review: the review video + an AI summary of the unit + the full
 * practice question set (the unit's MCQ bank).
 *
 * Props: { unit (config from usHistory), practice (MCQ[]|null), refreshKey }
 */
export default function UnitReview({ unit, practice, refreshKey }) {
  const [summary, setSummary] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setSummary(undefined);
    getUnitSummary(unit.number).then((d) => { if (!cancelled) setSummary(d); });
    return () => { cancelled = true; };
  }, [unit.number, refreshKey]);

  return (
    <div className="min-w-0">
      <h2 className="text-lg sm:text-xl font-display font-semibold text-content-primary mb-1">
        Unit {unit.number} Review
      </h2>
      <p className="text-xs text-content-muted mb-4">{unit.title} · {unit.examWeight} of the exam</p>

      {/* Review video */}
      <div className="rounded-md overflow-hidden border border-border bg-black mb-6">
        {unit.videoUrl ? (
          <video
            key={unit.videoUrl}
            controls
            preload="metadata"
            className="w-full max-h-[60vh] bg-black"
          >
            <source src={unit.videoUrl} type="video/mp4" />
            Your browser can't play this video.
          </video>
        ) : (
          <div className="flex items-center justify-center gap-2 text-content-muted text-sm py-16">
            <PlayCircle className="w-5 h-5" strokeWidth={1.5} /> Review video coming soon
          </div>
        )}
      </div>

      {/* Summary */}
      <h3 className="text-base font-display font-semibold text-content-primary mb-2">Summary</h3>
      {summary === undefined && (
        <div className="flex items-center gap-2 text-content-muted text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> Loading summary…
        </div>
      )}
      {summary === null && (
        <p className="text-sm text-content-secondary mb-4">
          Summary not generated yet — use <span className="font-medium text-content-primary">Generate Unit content</span> above.
        </p>
      )}
      {summary && (
        <div className="text-sm leading-relaxed text-content-primary mb-6">
          <MarkdownRenderer content={summary.summaryMarkdown} />
        </div>
      )}

      {/* Full practice set */}
      <div className="border-t border-border-strong pt-5">
        <h3 className="text-base font-display font-semibold text-content-primary mb-3">
          Unit practice {Array.isArray(practice) && practice.length ? `(${practice.length})` : ''}
        </h3>
        {Array.isArray(practice) && practice.length > 0 ? (
          <div className="space-y-3">
            {practice.map((mcq, i) => (
              <MCQCard key={`u${unit.number}-${i}`} mcq={mcq} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-secondary">
            Practice questions not generated yet.
          </p>
        )}
      </div>
    </div>
  );
}
