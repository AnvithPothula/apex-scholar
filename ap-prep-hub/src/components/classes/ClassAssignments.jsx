import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Loader2, Check, X, RefreshCw, Pencil, Trash2, ChevronLeft, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Button, Card, Badge, Input, Textarea } from '../ui/UIComponents';
import CustomDropdown from '../ui/CustomDropdown';
import FrqAnswerBox from '../practice/FrqAnswerBox';
import MarkdownRenderer from '../MarkdownRenderer';
import PastQuestionPicker from '../grader/PastQuestionPicker';
import FrqResult from '../grader/FrqResult';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { AP_SUBJECTS, subjectName } from '../../constants/subjects';
import { getTestConfig } from '../../constants/testConfigurations';
import { PACKS } from '../../data/packs';
import { examLabel, loadGuidelines, loadQuestionBooklet } from '../../services/pastFrq';
import { gradeFrq } from '../../services/grader';
import * as svc from '../../services/classAssignments';
import { ownerIdsOf } from '../../services/classes';

const SUBJECTS = Object.values(AP_SUBJECTS).map((s) => ({ value: s.name, label: s.name }));
const fmtDue = (iso) => (iso ? `due ${new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` : 'no due date');
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-content-secondary">{label}</span>
    {hint && <span className="block text-xs text-content-muted mt-0.5">{hint}</span>}
    <span className="block mt-1.5">{children}</span>
  </label>
);
const statusOf = (sub) => (!sub ? 'Not started' : sub.status === 'submitted' ? 'Submitted' : sub.status === 'done' ? 'Done' : 'In progress');
const scoreText = (sub) => {
  const s = svc.scoreOf(sub);
  if (!s) return '';
  return `${s.score}${s.max ? ` / ${s.max}` : ''}${s.by === 'teacher' ? ' (teacher)' : ''}`;
};

// ---------------------------------------------------------------------------
// Teacher: one drafted question, with approve / request change / edit / delete
function ItemReview({ item, index, onChange, onRemove, onRedraft, busy }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');
  const [asking, setAsking] = useState(false);
  const approved = item.status === 'approved';
  return (
    <div className={`rounded-md border p-3 space-y-2 ${approved ? 'border-success-500/40' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-content-muted">{index + 1}. {item.type === 'mcq' ? 'Multiple choice' : `Free response · ${item.points} pts`}</span>
        <Badge variant={approved ? 'success' : 'warning'}>{approved ? 'Approved' : 'Needs review'}</Badge>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea rows={3} value={item.question} onChange={(e) => onChange({ ...item, question: e.target.value })} aria-label="Question" />
          {item.type === 'mcq' ? item.choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name={`correct-${item.id}`} checked={item.correctIndex === i} onChange={() => onChange({ ...item, correctIndex: i })} aria-label={`Choice ${String.fromCharCode(65 + i)} is correct`} className="accent-primary-500" />
              <Input value={c} onChange={(e) => onChange({ ...item, choices: item.choices.map((x, j) => (j === i ? e.target.value : x)) })} aria-label={`Choice ${String.fromCharCode(65 + i)}`} />
            </div>
          )) : (
            <>
              <Input type="number" min="1" max="20" value={item.points} onChange={(e) => onChange({ ...item, points: Number(e.target.value) || 1 })} aria-label="Points" />
              <Textarea rows={4} value={item.rubric} onChange={(e) => onChange({ ...item, rubric: e.target.value })} aria-label="Rubric" placeholder="Rubric: what earns each point" />
            </>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm text-content-primary"><MarkdownRenderer content={item.question} /></div>
          {item.type === 'mcq' ? (
            <ol className="text-sm space-y-1">
              {item.choices.map((c, i) => (
                <li key={i} className={i === item.correctIndex ? 'text-success-400 font-medium' : 'text-content-secondary'}>
                  {String.fromCharCode(65 + i)}. <MarkdownRenderer content={c} className="inline [&_p]:inline" />{i === item.correctIndex ? '  ✓' : ''}
                </li>
              ))}
            </ol>
          ) : (
            <details className="text-sm"><summary className="cursor-pointer text-content-muted">Rubric</summary><div className="mt-1 text-content-secondary"><MarkdownRenderer content={item.rubric} /></div></details>
          )}
        </>
      )}
      {asking && (
        <div className="flex gap-2">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should change? e.g. make it harder, use a graph" aria-label="Requested change" />
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => { onRedraft(note); setAsking(false); setNote(''); }}>Redo</Button>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant={approved ? 'ghost' : 'secondary'} onClick={() => onChange({ ...item, status: approved ? 'draft' : 'approved' })}>
          <Check className="w-4 h-4 mr-1" />{approved ? 'Unapprove' : 'Approve'}
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAsking((v) => !v)}><RefreshCw className="w-4 h-4 mr-1" />Request change</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing((v) => !v)}><Pencil className="w-4 h-4 mr-1" />{editing ? 'Done editing' : 'Edit'}</Button>
        <Button size="sm" variant="ghost" onClick={onRemove} className="text-error-400"><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teacher: create / edit an assignment
function Editor({ code, klass, initial, onDone }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [d, setD] = useState(() => initial || {
    type: 'practiceTest', title: '', subject: (klass.subjects || []).map(subjectName)[0] || '', dueAt: '', instructions: '',
    countsOnLeaderboard: false, config: { section: 'mcq', units: [], questionCount: '', timeMinutes: '', keepGoing: false },
    items: [], mode: 'same', perStudent: 5,
  });
  const [topic, setTopic] = useState(initial?.config?.topic || '');
  // The class doc holds questions without answers; put the private key back for editing.
  useEffect(() => {
    if (initial?.type !== 'questions') return;
    svc.getKey(code, initial.id).then((key) => setD((x) => ({
      ...x,
      items: (initial.items || []).map((it) => ({ ...it, ...(key[it.id] || {}), status: 'approved' })),
    }))).catch(() => toast.error("Couldn't load the answer key."));
  }, [code, initial, toast]);
  const [mcqCount, setMcqCount] = useState(5);
  const [frqCount, setFrqCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [exam, setExam] = useState(initial?.config?.exam || null);
  const [frqQs, setFrqQs] = useState([]);
  const [picked, setPicked] = useState(null);
  const [selectedParts, setSelectedParts] = useState(initial?.config?.selectedParts || []);
  const set = (patch) => setD((x) => ({ ...x, ...patch }));
  const setCfg = (patch) => setD((x) => ({ ...x, config: { ...x.config, ...patch } }));
  const testCfg = getTestConfig(d.subject);
  const packs = useMemo(() => Object.entries(PACKS).filter(([, p]) => p.subject === d.subject), [d.subject]);

  const draft = async () => {
    if (!d.subject || !topic.trim()) return toast.error('Choose a subject and describe the topic first.');
    setBusy(true);
    try {
      const items = await svc.draftQuestions({ subject: d.subject, topic, mcqCount: Number(mcqCount) || 0, frqCount: Number(frqCount) || 0 });
      if (!items.length) toast.error("The AI didn't return usable questions. Try again or adjust the topic.");
      set({ items: [...d.items, ...items] });
    } catch (e) { toast.error(e.message || 'Drafting failed.'); } finally { setBusy(false); }
  };
  const redraft = async (item, note) => {
    setBusy(true);
    try {
      const next = await svc.redraftQuestion({ subject: d.subject, topic, item, note });
      if (!next) return toast.error("Couldn't redo that question. Try again.");
      setD((x) => ({ ...x, items: x.items.map((it) => (it.id === item.id ? next : it)) }));
    } catch (e) { toast.error(e.message || 'Redo failed.'); } finally { setBusy(false); }
  };
  const addOwn = (type) => set({ items: [...d.items, type === 'mcq'
    ? { id: `own${Date.now()}`, type: 'mcq', status: 'approved', question: '', choices: ['', '', '', ''], correctIndex: 0, explanations: [] }
    : { id: `own${Date.now()}`, type: 'frq', status: 'approved', question: '', points: 4, rubric: '', sampleAnswer: '' }] });

  const unapproved = d.items.filter((it) => it.status !== 'approved').length;
  const blank = d.items.some((it) => !String(it.question).trim() || (it.type === 'mcq' && it.choices.some((c) => !String(c).trim())) || (it.type === 'frq' && !String(it.rubric).trim()));
  const pastQ = picked != null ? frqQs[picked] : null;
  const canSave = d.subject && (
    d.type === 'practiceTest' ? true
      : d.type === 'questions' ? d.items.length > 0 && !unapproved && !blank
        : d.type === 'studyPack' ? Boolean(d.config.pack)
          : Boolean(exam && (pastQ || d.config.questionTitle)) && !(pastQ?.parts?.length && !selectedParts.length));

  const save = async () => {
    setBusy(true);
    try {
      const config = d.type === 'questions' ? { topic }
        : d.type === 'pastFrq' ? {
          exam,
          questionTitle: pastQ?.title || d.config.questionTitle,
          questionLabel: pastQ?.label || d.config.questionLabel || d.config.questionTitle,
          points: pastQ?.points || d.config.points,
          selectedParts: pastQ ? selectedParts : (d.config.selectedParts || []),
        }
          : d.config;
      await svc.saveAssignment(code, user, { ...d, config, dueAt: d.dueAt ? new Date(d.dueAt).toISOString() : null });
      toast.success(initial ? 'Assignment updated.' : 'Assignment posted to the class.');
      onDone(true);
    } catch (e) {
      toast.error("Couldn't save the assignment. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-display">{initial ? 'Edit assignment' : 'New assignment'}</h3>
        <Button variant="ghost" size="sm" onClick={() => onDone(false)}><X className="w-4 h-4" /></Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Type">
          <CustomDropdown options={Object.entries(svc.TYPES).map(([value, label]) => ({ value, label }))} value={d.type} onChange={(v) => set({ type: v })} disabled={Boolean(initial)} />
        </Field>
        <Field label="Subject">
          <CustomDropdown options={SUBJECTS} value={d.subject} onChange={(v) => { set({ subject: v }); setExam(null); }} placeholder="Choose a subject" />
        </Field>
        <Field label="Title"><Input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder={svc.TYPES[d.type]} /></Field>
        <Field label="Due"><Input type="datetime-local" value={toLocalInput(d.dueAt) || d.dueAt} onChange={(e) => set({ dueAt: e.target.value })} /></Field>
      </div>
      <Field label="Instructions (optional)"><Textarea rows={2} value={d.instructions} onChange={(e) => set({ instructions: e.target.value })} /></Field>

      {d.type === 'practiceTest' && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Section">
              <CustomDropdown options={testCfg.sections.map((s) => ({ value: s.id, label: `${s.name} (${s.questions} q, ${s.time} min)` }))} value={d.config.section} onChange={(v) => setCfg({ section: v })} />
            </Field>
            <Field label="Questions" hint="Blank = official count"><Input type="number" min="1" max="100" value={d.config.questionCount} onChange={(e) => setCfg({ questionCount: e.target.value })} /></Field>
            <Field label="Minutes" hint="Blank = official time"><Input type="number" min="1" max="300" value={d.config.timeMinutes} onChange={(e) => setCfg({ timeMinutes: e.target.value })} /></Field>
          </div>
          {Array.isArray(testCfg.units) && testCfg.units.length > 0 && (
            <fieldset>
              <legend className="text-sm font-medium text-content-secondary mb-1">Units (none ticked = all)</legend>
              <div className="grid sm:grid-cols-2 gap-1">
                {testCfg.units.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-sm text-content-secondary">
                    <input type="checkbox" className="accent-primary-500" checked={d.config.units.includes(u.id)}
                      onChange={(e) => setCfg({ units: e.target.checked ? [...d.config.units, u.id] : d.config.units.filter((x) => x !== u.id) })} />
                    {u.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="flex items-center gap-2 text-sm text-content-secondary">
            <input type="checkbox" className="accent-primary-500" checked={d.config.keepGoing} onChange={(e) => setCfg({ keepGoing: e.target.checked })} />
            Let students keep going after time runs out
          </label>
          <label className="flex items-start gap-2 text-sm text-content-secondary">
            <input type="checkbox" className="accent-primary-500 mt-1" checked={d.countsOnLeaderboard} onChange={(e) => set({ countsOnLeaderboard: e.target.checked })} />
            <span>Count on the class leaderboard<span className="block text-xs text-content-muted">Off: only you and each student see their score.</span></span>
          </label>
        </div>
      )}

      {d.type === 'questions' && (
        <div className="space-y-3">
          <Field label="Topic or unit" hint="What the questions should cover, as specific as you like.">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Unit 3: photosynthesis and the light-dependent reactions" />
          </Field>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Multiple choice"><Input type="number" min="0" max="25" value={mcqCount} onChange={(e) => setMcqCount(e.target.value)} className="w-24" /></Field>
            <Field label="Free response"><Input type="number" min="0" max="5" value={frqCount} onChange={(e) => setFrqCount(e.target.value)} className="w-24" /></Field>
            <Button variant="secondary" onClick={draft} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Draft with AI</Button>
            <Button variant="ghost" onClick={() => addOwn('mcq')}><Plus className="w-4 h-4 mr-1" />My own MCQ</Button>
            <Button variant="ghost" onClick={() => addOwn('frq')}><Plus className="w-4 h-4 mr-1" />My own FRQ</Button>
          </div>
          {d.items.map((it, i) => (
            <ItemReview key={it.id} item={it} index={i} busy={busy}
              onChange={(next) => setD((x) => ({ ...x, items: x.items.map((y) => (y.id === it.id ? next : y)) }))}
              onRemove={() => setD((x) => ({ ...x, items: x.items.filter((y) => y.id !== it.id) }))}
              onRedraft={(note) => redraft(it, note)} />
          ))}
          {d.items.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-content-secondary">
              <label className="flex items-center gap-2"><input type="radio" className="accent-primary-500" checked={d.mode === 'same'} onChange={() => set({ mode: 'same' })} />Same questions for everyone</label>
              <label className="flex items-center gap-2"><input type="radio" className="accent-primary-500" checked={d.mode === 'bank'} onChange={() => set({ mode: 'bank' })} />Each student gets</label>
              <Input type="number" min="1" max={d.items.length} value={d.perStudent} onChange={(e) => set({ perStudent: e.target.value })} className="w-20" disabled={d.mode !== 'bank'} aria-label="Questions per student" />
              <span>random questions from this bank</span>
            </div>
          )}
          {unapproved > 0 && <p className="text-xs text-warning-400">Approve every question before posting ({unapproved} left).</p>}
        </div>
      )}

      {d.type === 'studyPack' && (
        <Field label="Unit">
          {packs.length
            ? <CustomDropdown options={packs.map(([slug, p]) => ({ value: slug, label: p.title }))} value={d.config.pack || ''} onChange={(v) => setCfg({ pack: v, packTitle: PACKS[v]?.title })} placeholder="Choose a unit" />
            : <p className="text-sm text-content-muted">No study packs for this subject yet.</p>}
        </Field>
      )}

      {d.type === 'pastFrq' && d.subject && (
        <PastQuestionPicker subject={d.subject} exam={exam} setExam={setExam} questions={frqQs} setQuestions={setFrqQs} picked={picked} setPicked={setPicked} selectedParts={selectedParts} setSelectedParts={setSelectedParts} />
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onDone(false)}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={!canSave || busy}>{initial ? 'Save changes' : 'Post to class'}</Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Results shared by student (own) and teacher (any student)
function QuestionSetResults({ a, sub, keys }) {
  const ids = sub?.itemIds || [];
  return (
    <ol className="space-y-3">
      {(a.items || []).filter((it) => ids.includes(it.id)).map((it, i) => {
        const ans = sub.answers?.[it.id];
        if (it.type === 'mcq') {
          const r = sub.mcqResults?.[it.id] || {};
          const k = keys?.[it.id] || {};
          return (
            <li key={it.id} className="rounded-md border border-border p-3 text-sm">
              <div className="flex gap-2">{r.correct ? <CheckCircle2 className="w-5 h-5 text-success-400 shrink-0" /> : <XCircle className="w-5 h-5 text-error-400 shrink-0" />}
                <div className="min-w-0"><span className="text-content-muted">{i + 1}. </span><MarkdownRenderer content={it.question} /></div></div>
              <p className="mt-1 text-content-secondary">
                Answered {r.chosen == null ? 'nothing' : String.fromCharCode(65 + r.chosen)}; correct {String.fromCharCode(65 + (r.correctIndex ?? k.correctIndex ?? 0))}.
              </p>
              {k.explanations?.[r.correctIndex ?? k.correctIndex] && <div className="mt-1 text-content-muted"><MarkdownRenderer content={k.explanations[r.correctIndex ?? k.correctIndex]} /></div>}
            </li>
          );
        }
        const g = sub.frqGrades?.[it.id];
        return (
          <li key={it.id} className="rounded-md border border-border p-3 text-sm space-y-2">
            <div><span className="text-content-muted">{i + 1}. </span><MarkdownRenderer content={it.question} /></div>
            <div className="rounded bg-base-800 p-2 text-content-secondary whitespace-pre-wrap">{ans || '(no typed answer)'}</div>
            {g ? <FrqResult result={{ criteria: [], strengths: [], improvements: [], ...g }} rubricLabel="the teacher's rubric" /> : <p className="text-content-muted">Not graded yet.</p>}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Student: do the assignment
function Work({ code, a, onBack }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sub, setSub] = useState(undefined);
  const [answers, setAnswers] = useState({});
  const [photos, setPhotos] = useState({});
  const [keys, setKeys] = useState(null);
  const [busy, setBusy] = useState(false);
  const [past, setPast] = useState(null); // official question for pastFrq
  const [pastErr, setPastErr] = useState('');

  const reload = useCallback(async () => {
    const s = await svc.getMySubmission(code, a.id, user.uid).catch(() => null);
    setSub(s);
    setAnswers(s?.answers || {});
  }, [code, a.id, user.uid]);
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (a.type !== 'pastFrq' || !a.config?.exam?.sg) return;
    loadGuidelines(a.config.exam.sg)
      .then((qs) => setPast(qs.find((q) => q.title === a.config.questionTitle) || null))
      .catch((e) => setPastErr(e.message));
  }, [a]);

  const myIds = useMemo(() => svc.pickItemIds((a.items || []).map((it) => it.id), a, user.uid, a.id), [a, user.uid]);
  const myItems = (a.items || []).filter((it) => myIds.includes(it.id));
  const done = sub && (sub.status === 'submitted' || sub.status === 'done');

  const submitSet = async () => {
    setBusy(true);
    try {
      await svc.saveMySubmission(code, a.id, user, { answers, status: 'submitting', itemIds: myIds });
      const res = await svc.submitQuestionSet(code, a.id);
      setKeys(res.keys);
      const frqs = myItems.filter((it) => it.type === 'frq');
      if (frqs.length) {
        const grades = {};
        for (const it of frqs) {
          try {
            const g = await gradeFrq({ subject: a.subject, question: it.question, rubric: { source: 'teacher', text: res.keys?.[it.id]?.rubric, points: it.points }, answer: answers[it.id] || '', answerPhotos: photos[it.id] || [] });
            grades[it.id] = { score: g.score, maxPoints: g.maxPoints, feedback: g.feedback, criteria: g.criteria, transcript: g.transcript };
          } catch (e) {
            toast.error(`Question ${myItems.indexOf(it) + 1} couldn't be graded: ${e.message}. Your teacher can still grade it.`);
          }
        }
        if (Object.keys(grades).length) await svc.saveFrqGrades(code, a.id, user.uid, grades);
      }
      toast.success('Submitted.');
      await reload();
    } catch (e) { toast.error(e.message || "Couldn't submit."); } finally { setBusy(false); }
  };

  const submitPast = async () => {
    setBusy(true);
    try {
      const sel = a.config.selectedParts?.length ? a.config.selectedParts : (past.parts || []).map((p) => p.id);
      const g = await gradeFrq({
        subject: a.subject,
        rubric: { source: 'official', text: past.text, title: past.label, points: past.points, exam: `${a.subject} ${examLabel(a.config.exam)}`, parts: past.parts, selected: sel },
        booklet: await loadQuestionBooklet(a.config.exam.frq),
        bookletTitle: past.label,
        answer: answers.response || '',
        answerPhotos: photos.response || [],
      });
      await svc.saveMySubmission(code, a.id, user, {
        status: 'submitted', answers, score: g.score, maxScore: g.maxPoints,
        grade: { score: g.score, maxPoints: g.maxPoints, feedback: g.feedback, criteria: g.criteria, strengths: g.strengths, improvements: g.improvements, transcript: g.transcript },
        submittedAt: new Date().toISOString(),
      });
      toast.success('Graded and submitted.');
      await reload();
    } catch (e) { toast.error(e.message || 'Grading failed.'); } finally { setBusy(false); }
  };

  const markDone = async () => {
    setBusy(true);
    try {
      await svc.saveMySubmission(code, a.id, user, { status: 'done', submittedAt: new Date().toISOString() });
      await reload();
    } catch { toast.error("Couldn't save. Try again."); } finally { setBusy(false); }
  };

  if (sub === undefined) return <p className="text-content-secondary">Loading…</p>;
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />All assignments</Button>
      <Card className="p-4 sm:p-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-h4 font-display">{a.title}</h3><Badge>{svc.TYPES[a.type]}</Badge></div>
        <p className="text-sm text-content-muted">{a.subject} · {fmtDue(a.dueAt)}{a.createdByName ? ` · from ${a.createdByName}` : ''}</p>
        {a.instructions && <p className="text-sm text-content-secondary whitespace-pre-wrap">{a.instructions}</p>}
        <p className="text-xs text-content-muted">Only you and your teacher see your answers and score{a.type === 'practiceTest' && a.countsOnLeaderboard ? '; this test also counts on the class leaderboard' : ''}.</p>
        {done && <p className="text-sm text-success-400">{statusOf(sub)}{scoreText(sub) ? ` · ${scoreText(sub)}` : ''}{sub.teacherNote ? ` · Teacher: ${sub.teacherNote}` : ''}</p>}
      </Card>

      {a.type === 'practiceTest' && !done && (
        <Card className="p-4 sm:p-5 space-y-3">
          <p className="text-sm text-content-secondary">
            {getTestConfig(a.subject).sections.find((s) => s.id === a.config?.section)?.name || 'Practice test'}
            {a.config?.questionCount ? `, ${a.config.questionCount} questions` : ''}{a.config?.timeMinutes ? `, ${a.config.timeMinutes} minutes` : ''}
            {a.config?.keepGoing ? ', you can keep going after time runs out' : ''}.
          </p>
          <Link to={`/practice-tests?assignment=${code}/${a.id}`}><Button variant="primary">Start the test</Button></Link>
        </Card>
      )}

      {a.type === 'studyPack' && (
        <Card className="p-4 sm:p-5 space-y-3">
          <Link to={`/study/${a.config?.pack}`} className="inline-flex items-center gap-1 text-primary-400 hover:underline">Open {a.config?.packTitle || 'the study pack'} <ExternalLink className="w-3.5 h-3.5" /></Link>
          {!done && <div><Button variant="primary" onClick={markDone} disabled={busy}>Mark as done</Button></div>}
        </Card>
      )}

      {a.type === 'pastFrq' && (
        done ? (sub.grade && <FrqResult result={{ strengths: [], improvements: [], criteria: [], ...sub.grade }} rubricLabel={`the official ${examLabel(a.config.exam)} scoring guidelines`} />) : (
          <Card className="p-4 sm:p-5 space-y-3">
            <p className="text-sm text-content-secondary">
              {a.config?.questionLabel || a.config?.questionTitle} ({a.config?.points} pts), {examLabel(a.config?.exam || {})}.
              {past?.parts?.length && a.config?.selectedParts?.length && a.config.selectedParts.length < past.parts.length
                ? ` Answer only parts ${past.parts.filter((p) => a.config.selectedParts.includes(p.id)).map((p) => p.label).join(', ')}.`
                : ''}{' '}
              {a.config?.exam?.frq && <a href={a.config.exam.frq} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Read the question (College Board)</a>}
            </p>
            {pastErr && <p className="text-sm text-error-400">{pastErr}</p>}
            <FrqAnswerBox tone="app" value={answers.response || ''} onChange={(v) => setAnswers({ ...answers, response: v })} images={photos.response || []} onImagesChange={(imgs) => setPhotos({ ...photos, response: imgs })} ariaLabel="Your answer" />
            <Button variant="primary" onClick={submitPast} disabled={busy || !past || !((answers.response || '').trim() || (photos.response || []).length)}>
              {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Grading…</> : 'Submit for grading'}
            </Button>
          </Card>
        )
      )}

      {a.type === 'questions' && (
        done ? <QuestionSetResults a={a} sub={sub} keys={keys} /> : (
          <div className="space-y-3">
            {myItems.map((it, i) => (
              <Card key={it.id} className="p-4 space-y-2">
                <div className="text-sm text-content-primary"><span className="text-content-muted">{i + 1}. </span><MarkdownRenderer content={it.question} /></div>
                {it.type === 'mcq' ? (
                  <div role="radiogroup" aria-label={`Question ${i + 1}`} className="space-y-1">
                    {it.choices.map((c, j) => (
                      <label key={j} className={`flex items-start gap-2 rounded-md border p-2 text-sm cursor-pointer ${answers[it.id] === j ? 'border-primary-500 bg-primary-500/10' : 'border-border'}`}>
                        <input type="radio" name={it.id} aria-label={`Choice ${String.fromCharCode(65 + j)}`} className="mt-1 accent-primary-500" checked={answers[it.id] === j} onChange={() => setAnswers({ ...answers, [it.id]: j })} />
                        <span className="text-content-secondary">{String.fromCharCode(65 + j)}. <MarkdownRenderer content={c} className="inline [&_p]:inline" /></span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <FrqAnswerBox tone="app" value={answers[it.id] || ''} onChange={(v) => setAnswers({ ...answers, [it.id]: v })} images={photos[it.id] || []} onImagesChange={(imgs) => setPhotos({ ...photos, [it.id]: imgs })} ariaLabel={`Answer to question ${i + 1}`} minHeight="min-h-[8rem]" />
                )}
              </Card>
            ))}
            <Button variant="primary" onClick={submitSet} disabled={busy}>{busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit'}</Button>
            <p className="text-xs text-content-muted">You can submit once. Multiple choice is marked right away; written answers are graded by AI against your teacher's rubric, and your teacher can change any score.</p>
          </div>
        )
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teacher: everyone's work on one assignment
function Review({ code, a, students, onBack, onEdit, onDeleted }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [subs, setSubs] = useState(null);
  const [keys, setKeys] = useState(null);
  const [open, setOpen] = useState(null);
  const [override, setOverride] = useState({});

  const load = useCallback(async () => {
    const [list, k] = await Promise.all([svc.listSubmissions(code, a.id), a.type === 'questions' ? svc.getKey(code, a.id) : null]);
    setSubs(Object.fromEntries(list.map((s) => [s.uid, s])));
    setKeys(k);
  }, [code, a]);
  useEffect(() => { load().catch(() => toast.error("Couldn't load submissions.")); }, [load, toast]);

  const saveOverride = async (uid) => {
    const o = override[uid] || {};
    try {
      await svc.setTeacherScore(code, a.id, uid, o.score ?? '', o.note ?? '');
      toast.success('Saved.');
      load();
    } catch { toast.error("Couldn't save the score."); }
  };
  const remove = async () => {
    if (!(await confirm({ title: `Delete "${a.title}"?`, message: "Students' submissions for it are deleted too. This can't be undone.", confirmText: 'Delete' }))) return;
    try { await svc.deleteAssignment(code, a.id); onDeleted(); } catch { toast.error("Couldn't delete."); }
  };

  const submitted = subs ? students.filter((st) => ['submitted', 'done'].includes(subs[st.uid]?.status)).length : 0;
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />All assignments</Button>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2"><h3 className="text-h4 font-display">{a.title}</h3><Badge>{svc.TYPES[a.type]}</Badge>{a.type === 'practiceTest' && <Badge variant={a.countsOnLeaderboard ? 'warning' : 'default'}>{a.countsOnLeaderboard ? 'On leaderboard' : 'Private'}</Badge>}</div>
            <p className="text-sm text-content-muted mt-1">{a.subject} · {fmtDue(a.dueAt)} · {submitted} of {students.length} turned in{a.mode === 'bank' ? ` · ${a.perStudent} of ${a.items.length} questions each` : ''}</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            <Button size="sm" variant="ghost" onClick={remove} className="text-error-400"><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
          </div>
        </div>
      </Card>
      {!subs ? <p className="text-content-secondary">Loading…</p> : (
        <Card className="divide-y divide-border-subtle">
          {students.length === 0 && <p className="p-4 text-sm text-content-muted">No students have joined yet.</p>}
          {students.map((st) => {
            const s = subs[st.uid];
            return (
              <div key={st.uid} className="p-3 sm:p-4">
                <button type="button" onClick={() => setOpen(open === st.uid ? null : st.uid)} className="w-full flex items-center justify-between gap-2 text-left" aria-expanded={open === st.uid}>
                  <span className="text-sm text-content-primary truncate">{st.displayName}</span>
                  <span className="text-sm text-content-secondary shrink-0">{statusOf(s)}{scoreText(s) ? ` · ${scoreText(s)}` : ''}</span>
                </button>
                {open === st.uid && s && (
                  <div className="mt-3 space-y-3">
                    {a.type === 'questions' && <QuestionSetResults a={a} sub={s} keys={keys} />}
                    {a.type === 'pastFrq' && (
                      <>
                        <div className="rounded bg-base-800 p-2 text-sm text-content-secondary whitespace-pre-wrap">{s.answers?.response || '(answered with photos only)'}</div>
                        {s.grade && <FrqResult result={{ strengths: [], improvements: [], criteria: [], ...s.grade }} rubricLabel="the official scoring guidelines" />}
                      </>
                    )}
                    {a.type === 'practiceTest' && s.status === 'submitted' && (
                      <p className="text-sm text-content-secondary">{s.score} / {s.maxScore} points ({s.percentage}%){s.apScore ? `, predicted AP ${s.apScore}` : ''}{s.timeSpent != null ? `, ${s.timeSpent} min` : ''}{s.overtimeMinutes ? ` (${s.overtimeMinutes} over the limit)` : ''}.</p>
                    )}
                    {a.type === 'studyPack' && <p className="text-sm text-content-secondary">Marked done {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''}.</p>}
                    <div className="flex flex-wrap items-end gap-2">
                      <Field label="Your score"><Input type="number" className="w-24" aria-label={`Score for ${st.displayName}`} value={override[st.uid]?.score ?? s.teacherScore ?? ''} onChange={(e) => setOverride({ ...override, [st.uid]: { ...override[st.uid], score: e.target.value } })} /></Field>
                      <Field label="Comment"><Input className="w-64 max-w-full" aria-label={`Comment for ${st.displayName}`} value={override[st.uid]?.note ?? s.teacherNote ?? ''} onChange={(e) => setOverride({ ...override, [st.uid]: { ...override[st.uid], note: e.target.value } })} /></Field>
                      <Button size="sm" variant="secondary" onClick={() => saveOverride(st.uid)}>Save</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function ClassAssignments({ code, klass, isOwner, members }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState(null);
  const [mine, setMine] = useState({});
  const [view, setView] = useState({ mode: 'list' });
  const owners = ownerIdsOf(klass);
  const students = (members || []).filter((m) => !owners.includes(m.uid));

  const load = useCallback(async () => {
    try {
      const items = await svc.listAssignments(code);
      setList(items);
      if (!isOwner) {
        const subs = await Promise.all(items.map((a) => svc.getMySubmission(code, a.id, user.uid).catch(() => null)));
        setMine(Object.fromEntries(items.map((a, i) => [a.id, subs[i]])));
        svc.syncAssignmentsToTasks(user.uid);
      }
    } catch {
      setList([]);
      toast.error("Couldn't load assignments.");
    }
  }, [code, isOwner, user.uid, toast]);
  useEffect(() => { load(); }, [load]);

  const current = view.id ? (list || []).find((a) => a.id === view.id) : null;
  if (view.mode === 'new' || (view.mode === 'edit' && current)) {
    return <Editor code={code} klass={klass} initial={view.mode === 'edit' ? current : null} onDone={(saved) => { setView({ mode: 'list' }); if (saved) load(); }} />;
  }
  if (view.mode === 'open' && current) {
    return isOwner
      ? <Review code={code} a={current} students={students} onBack={() => setView({ mode: 'list' })} onEdit={() => setView({ mode: 'edit', id: current.id })} onDeleted={() => { setView({ mode: 'list' }); load(); }} />
      : <Work code={code} a={current} onBack={() => { setView({ mode: 'list' }); load(); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-content-primary" strokeWidth={1.5} /><h3 className="text-h4 font-display">Assignments</h3></div>
        {isOwner && <Button size="sm" variant="primary" onClick={() => setView({ mode: 'new' })}><Plus className="w-4 h-4 mr-1" />New assignment</Button>}
      </div>
      {list === null ? <p className="text-content-secondary text-sm">Loading…</p> : list.length === 0 ? (
        <Card className="p-4 text-sm text-content-muted">{isOwner ? 'Post practice tests, question sets, study-pack units or past AP FRQs. They appear on students\' schedules.' : 'No assignments yet.'}</Card>
      ) : (
        <Card className="divide-y divide-border-subtle">
          {list.map((a) => {
            const overdue = a.dueAt && new Date(a.dueAt) < new Date() && !isOwner && !['submitted', 'done'].includes(mine[a.id]?.status);
            return (
              <button key={a.id} type="button" onClick={() => setView({ mode: 'open', id: a.id })} className="w-full text-left px-4 py-3 hover:bg-base-800 flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm text-content-primary truncate">{a.title}</span>
                  <span className={`block text-xs ${overdue ? 'text-error-400' : 'text-content-muted'}`}>{svc.TYPES[a.type]} · {fmtDue(a.dueAt)}</span>
                </span>
                {!isOwner && <span className="text-xs text-content-secondary shrink-0">{statusOf(mine[a.id])}{scoreText(mine[a.id]) ? ` · ${scoreText(mine[a.id])}` : ''}</span>}
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}
