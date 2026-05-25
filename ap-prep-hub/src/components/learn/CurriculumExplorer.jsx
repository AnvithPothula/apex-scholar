import React, { useEffect, useState, useCallback } from 'react';
import { GraduationCap, PlayCircle, Loader2, Sparkles, CheckCircle, Circle } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../DeveloperSettings';
import LessonView from './LessonView';
import UnitReview from './UnitReview';
import { getUnitPractice, unitHasContent, generateUnit } from '../../services/curriculumContent';
import { getProgress, setTopicComplete, unitProgress } from '../../services/curriculumProgress';

const REVIEW = '__review__';

/**
 * Curriculum navigator (units → topics + unit review) with per-user progress
 * (topic checkmarks, unit progress bar, mark-complete) and an admin-only
 * "Generate Unit content" action that runs the AI pipeline.
 *
 * Props: { curriculum } — the usHistory config { title, units:[...] }.
 */
export default function CurriculumExplorer({ curriculum }) {
  const { user } = useAuth();
  const admin = isAdmin(user?.uid);
  const units = curriculum.units;

  const [unitNumber, setUnitNumber] = useState(units[0]?.number || 1);
  const [selection, setSelection] = useState(units[0]?.topics[0]?.id || REVIEW);
  const [practice, setPractice] = useState(null);
  const [hasContent, setHasContent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');
  const [progress, setProgress] = useState({ completedTopics: {}, practice: {} });

  const unit = units.find((u) => u.number === unitNumber) || units[0];

  const loadUnitMeta = useCallback(async (n) => {
    const [p, has] = await Promise.all([getUnitPractice(n), unitHasContent(n)]);
    setPractice(p);
    setHasContent(has);
  }, []);

  useEffect(() => { loadUnitMeta(unitNumber); }, [unitNumber, loadUnitMeta]);

  // Per-user progress (global across units) loaded once.
  useEffect(() => {
    if (user?.uid) getProgress(user.uid).then(setProgress);
  }, [user]);

  const pickUnit = (n) => {
    const u = units.find((x) => x.number === n);
    setUnitNumber(n);
    setSelection(u?.topics[0]?.id || REVIEW);
  };

  const topicIndex = unit.topics.findIndex((t) => t.id === selection);
  const gotoTopic = (i) => setSelection(unit.topics[i].id);

  const toggleComplete = async (topicId) => {
    const done = !progress.completedTopics[topicId];
    setProgress((p) => {
      const completedTopics = { ...p.completedTopics };
      if (done) completedTopics[topicId] = true;
      else delete completedTopics[topicId];
      return { ...p, completedTopics };
    });
    if (user?.uid) await setTopicComplete(user.uid, topicId, done);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg('Starting…');
    try {
      const res = await generateUnit(unitNumber, { onProgress: setGenMsg, regenerate: true });
      setGenMsg(
        `Done: ${res.lessons} lessons, ${res.summary ? 'summary' : 'no summary'}, ${res.practice} practice` +
          (res.errors.length ? ` — ${res.errors.length} issue(s)` : '')
      );
      await loadUnitMeta(unitNumber);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setGenMsg(`Failed: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const up = unitProgress(progress.completedTopics, unit);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-1.5">
        <div className="w-9 h-9 rounded-md bg-content-primary/10 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-content-primary">{curriculum.title}</h1>
        {hasContent && (
          <span className="inline-flex items-center gap-1 text-[11px] text-success-400">
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> Unit {unitNumber} ready
          </span>
        )}
      </div>
      <p className="text-sm text-content-secondary mb-5">
        Lessons, practice, and a full review video for every unit.
      </p>

      {/* Admin generation */}
      {admin && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-md border border-border bg-base-900 px-3 py-2">
          <Button onClick={handleGenerate} disabled={generating} size="sm">
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" strokeWidth={1.5} /> Generating…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> {hasContent ? 'Regenerate' : 'Generate'} Unit {unitNumber} content</>
            )}
          </Button>
          {genMsg && <span className="text-xs text-content-muted">{genMsg}</span>}
        </div>
      )}

      {/* Unit selector */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {units.map((u) => (
          <button
            key={u.number}
            onClick={() => pickUnit(u.number)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              u.number === unitNumber
                ? 'bg-content-primary text-base-950 border-content-primary'
                : 'bg-transparent text-content-secondary border-border hover:text-content-primary'
            }`}
          >
            Unit {u.number}
          </button>
        ))}
      </div>

      {/* Two-pane: topic list + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Topic list with progress */}
        <nav className="lg:border-r lg:border-border lg:pr-4">
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-content-muted mb-1">
              <span className="font-semibold">{unit.title}</span>
              <span>{up.completed}/{up.total} · {up.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500 transition-all duration-300" style={{ width: `${up.pct}%` }} />
            </div>
          </div>
          <ul className="space-y-0.5">
            {unit.topics.map((t) => {
              const done = !!progress.completedTopics[t.id];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setSelection(t.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-start gap-2 transition-colors ${
                      selection === t.id
                        ? 'bg-base-800 text-content-primary'
                        : 'text-content-secondary hover:bg-base-850 hover:text-content-primary'
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    ) : (
                      <Circle className="w-4 h-4 text-content-disabled flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    )}
                    <span className="min-w-0">
                      <span className="text-content-muted mr-1.5">{t.number}</span>
                      {t.title}
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="pt-1 mt-1 border-t border-border">
              <button
                onClick={() => setSelection(REVIEW)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  selection === REVIEW
                    ? 'bg-base-800 text-content-primary'
                    : 'text-content-secondary hover:bg-base-850 hover:text-content-primary'
                }`}
              >
                <PlayCircle className="w-4 h-4" strokeWidth={1.5} /> Unit Review
              </button>
            </li>
          </ul>
        </nav>

        {/* Content pane */}
        <div>
          {selection === REVIEW ? (
            <UnitReview unit={unit} practice={practice} refreshKey={refreshKey} />
          ) : (
            <LessonView
              key={selection}
              topic={unit.topics[topicIndex]}
              practice={practice}
              refreshKey={refreshKey}
              completed={!!progress.completedTopics[selection]}
              onToggleComplete={() => toggleComplete(selection)}
              hasPrev={topicIndex > 0}
              hasNext={topicIndex < unit.topics.length - 1}
              onPrev={() => gotoTopic(Math.max(0, topicIndex - 1))}
              onNext={() => {
                if (topicIndex < unit.topics.length - 1) gotoTopic(topicIndex + 1);
                else setSelection(REVIEW);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
