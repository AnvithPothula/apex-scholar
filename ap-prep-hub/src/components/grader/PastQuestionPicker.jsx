import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import { pastExamsFor, examLabel, loadGuidelines } from '../../services/pastFrq';

// The part's first line, without its marker; "…" when the sentence runs on.
const partSummary = (text) => {
  const t = text.replace(/^(\(\s*[a-h]\s*\)|part\s+[a-h]|[A-H]|row\s+[a-e])\s*/i, '').replace(/\s+([,.;:])/g, '$1').trim();
  return /[.?:)]$/.test(t) ? t : `${t}…`;
};

/**
 * Official question picker: year/set, then the question (by number), then its
 * parts, all ticked; untick a part to leave it out of the grade.
 */
export default function PastQuestionPicker({ subject, exam, setExam, questions, setQuestions, picked, setPicked, selectedParts, setSelectedParts }) {
  const exams = useMemo(() => pastExamsFor(subject), [subject]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuestions([]); setPicked(null); setError('');
    if (!exam?.sg) return undefined;
    let live = true;
    setLoading(true);
    loadGuidelines(exam.sg)
      .then((qs) => { if (live) setQuestions(qs); })
      .catch((e) => { if (live) setError(e.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [exam, setQuestions, setPicked]);

  if (!exams.length) {
    return <p className="text-sm text-content-muted">No past exams are listed for this subject yet. Choose "My own question" and paste the rubric if you have it.</p>;
  }
  return (
    <div className="space-y-3">
      <CustomDropdown
        options={exams.map((e, i) => ({ value: String(i), label: examLabel(e) }))}
        value={exam ? String(exams.indexOf(exam)) : ''}
        onChange={(v) => setExam(exams[Number(v)] || null)}
        placeholder="Exam year"
      />
      {loading && <p className="flex items-center gap-2 text-sm text-content-muted"><Loader2 className="w-4 h-4 animate-spin" /> Reading the official scoring guidelines…</p>}
      {error && <p role="alert" className="text-sm text-error-400">{error}</p>}
      {questions.length > 0 && (
        <CustomDropdown
          options={questions.map((q, i) => ({ value: String(i), label: `${q.label} (${q.points} pts)` }))}
          value={picked == null ? '' : String(picked)}
          onChange={(v) => {
            setPicked(Number(v));
            setSelectedParts?.((questions[Number(v)]?.parts || []).map((p) => p.id));
          }}
          placeholder="Question"
        />
      )}
      {picked != null && setSelectedParts && questions[picked]?.parts?.length > 0 && (
        <fieldset className="rounded-md border border-border p-3">
          <legend className="px-1 text-sm font-medium text-content-secondary">Parts to grade</legend>
          <div className="space-y-1.5">
            {questions[picked].parts.map((p) => (
              <label key={p.id} className="flex items-start gap-2 text-sm text-content-secondary cursor-pointer">
                <input
                  type="checkbox"
                  aria-label={`Grade part ${p.label}`}
                  className="mt-1 accent-primary-500"
                  checked={(selectedParts || []).includes(p.id)}
                  onChange={(e) => setSelectedParts((cur) => (e.target.checked ? [...(cur || []), p.id] : (cur || []).filter((x) => x !== p.id)))}
                />
                <span>
                  <span className="font-medium text-content-primary">{p.label}</span>
                  {p.points ? <span className="text-content-muted"> · {p.points} pt{p.points === 1 ? '' : 's'}</span> : null}
                  <span className="block text-xs text-content-muted">{partSummary(p.text)}</span>
                </span>
              </label>
            ))}
          </div>
          {(selectedParts || []).length === 0 && <p className="mt-2 text-xs text-warning-400">Pick at least one part.</p>}
        </fieldset>
      )}
      {exam && (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {exam.frq && <a href={exam.frq} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-400 hover:underline">Official questions (College Board) <ExternalLink className="w-3 h-3" /></a>}
          <a href={exam.sg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-400 hover:underline">Scoring guidelines <ExternalLink className="w-3 h-3" /></a>
        </p>
      )}
    </div>
  );
}

