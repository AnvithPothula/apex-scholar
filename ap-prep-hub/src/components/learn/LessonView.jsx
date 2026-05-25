import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, FileText, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import MarkdownRenderer from '../MarkdownRenderer.jsx';
import MCQCard from '../tutors/MCQCard.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { getLesson } from '../../services/curriculumContent';
import { recordPractice } from '../../services/curriculumProgress';

/**
 * One topic's lesson (cached teaching Markdown) + a prominent practice block +
 * a mark-complete toggle + prev/next nav.
 *
 * Props: { topic, practice (MCQ[]|null), completed, onToggleComplete,
 *          onPrev, onNext, hasPrev, hasNext, refreshKey }
 */
export default function LessonView({
  topic, practice, completed, onToggleComplete, onPrev, onNext, hasPrev, hasNext, refreshKey,
}) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState(undefined); // undefined=loading, null=none, {}=loaded
  const [answered, setAnswered] = useState({}); // index -> wasCorrect

  useEffect(() => {
    let cancelled = false;
    setLesson(undefined);
    setAnswered({});
    getLesson(topic.id).then((d) => { if (!cancelled) setLesson(d); });
    return () => { cancelled = true; };
  }, [topic.id, refreshKey]);

  // Practice is unit-level (MCQ bank is per-unit), rotated by topic so each
  // topic surfaces a different slice. Full set lives in the Unit Review.
  const slice = Array.isArray(practice) && practice.length
    ? (() => {
        const n = practice.length;
        const idx = Math.max(0, parseInt(String(topic.number).split('.')[1] || '1', 10) - 1);
        const start = (idx * 3) % n;
        return [practice[start % n], practice[(start + 1) % n], practice[(start + 2) % n]].filter(Boolean);
      })()
    : [];

  const handleAnswer = (i, choiceIdx, mcq) => {
    const isCorrect = typeof mcq.correctIndex === 'number' && choiceIdx === mcq.correctIndex;
    setAnswered((prev) => {
      const next = { ...prev, [i]: isCorrect };
      const correct = Object.values(next).filter(Boolean).length;
      if (user?.uid) recordPractice(user.uid, topic.id, correct, slice.length);
      return next;
    });
  };

  const answeredCount = Object.keys(answered).length;

  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-content-muted">{topic.number}</span>
          <h2 className="text-lg sm:text-xl font-display font-semibold text-content-primary">
            {topic.title}
          </h2>
        </div>
        <Button
          variant={completed ? 'outline' : 'default'}
          size="sm"
          onClick={onToggleComplete}
          className={`flex-shrink-0 ${completed ? 'text-success-400 border-success-500/40' : ''}`}
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
          {completed ? 'Completed' : 'Mark complete'}
        </Button>
      </div>

      {lesson === undefined && (
        <div className="flex items-center gap-2 text-content-muted text-sm py-8">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> Loading lesson…
        </div>
      )}

      {lesson === null && (
        <div className="rounded-md border border-border bg-base-900 p-6 text-center">
          <FileText className="w-6 h-6 text-content-muted mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-content-secondary">
            This lesson hasn't been generated yet. Use <span className="font-medium text-content-primary">Generate Unit content</span> above.
          </p>
        </div>
      )}

      {lesson && (
        <article className="text-[15px] leading-relaxed text-content-primary">
          <MarkdownRenderer content={lesson.markdown} />
        </article>
      )}

      {/* Prominent practice block */}
      {slice.length > 0 && (
        <section className="mt-8 rounded-lg border border-primary-700/40 bg-primary-900/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="flex items-center gap-2 text-base font-display font-semibold text-content-primary">
              <Pencil className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
              Practice
            </h3>
            <span className="text-xs text-content-muted">{answeredCount}/{slice.length} answered</span>
          </div>
          <p className="text-xs text-content-secondary mb-4">
            Check your understanding before moving on. (The full unit set is in the Unit Review.)
          </p>
          <div className="space-y-3">
            {slice.map((mcq, i) => (
              <MCQCard key={`${topic.id}-${i}`} mcq={mcq} onSelect={(ci) => handleAnswer(i, ci, mcq)} />
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev}>
          <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.5} /> Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
          Next <ChevronRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
