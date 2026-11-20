import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Card, Textarea } from '../components/ui/UIComponents';
import CustomDropdown from '../components/ui/CustomDropdown';
import FrqAnswerBox from '../components/practice/FrqAnswerBox';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AP_SUBJECTS } from '../constants/subjects';
import { examLabel, loadQuestionBooklet } from '../services/pastFrq';
import PastQuestionPicker from '../components/grader/PastQuestionPicker';
import FrqResult from '../components/grader/FrqResult';
import { gradeFrq, gradeMcq } from '../services/grader';
import { recordGrade } from '../services/activityTracker';
import errorLogger from '../utils/errorLogger';
import 'katex/dist/katex.min.css';

const SUBJECT_OPTIONS = Object.values(AP_SUBJECTS).map((s) => ({ value: s.name, label: s.name }));

const tabClass = (on) => `px-4 py-2 rounded-md text-sm font-medium transition-colors ${on ? 'bg-base-750 text-content-primary' : 'text-content-muted hover:text-content-secondary'}`;
const Label = ({ children, hint }) => (
  <div className="mb-2">
    <div className="text-sm font-medium text-content-secondary">{children}</div>
    {hint && <div className="text-xs text-content-muted mt-0.5">{hint}</div>}
  </div>
);

function McqResult({ result }) {
  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <h2 className="text-h3 font-display font-semibold text-content-primary">{result.score} / {result.total} correct</h2>
      <ul className="divide-y divide-border-subtle rounded-md border border-border">
        {result.items.map((it, i) => (
          <li key={i} className="p-3 flex gap-3">
            {it.correct ? <CheckCircle2 className="w-5 h-5 text-success-400 shrink-0" /> : <XCircle className="w-5 h-5 text-error-400 shrink-0" />}
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium text-content-primary">
                Question {it.number}: you chose {it.studentAnswer || 'nothing'}{it.correct ? '' : `, answer ${it.correctAnswer}`}
              </div>
              {it.explanation && <div className="text-content-secondary mt-1"><MarkdownRenderer content={it.explanation} /></div>}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-content-muted">Without an answer key the grader works out each answer itself, so check any surprises.</p>
    </Card>
  );
}

export default function Grader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('frq');
  const [subject, setSubject] = useState('');
  const [busy, setBusy] = useState(false);

  // FRQ
  const [source, setSource] = useState('past'); // 'past' | 'own'
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [picked, setPicked] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [question, setQuestion] = useState('');
  const [questionPhotos, setQuestionPhotos] = useState([]);
  const [rubric, setRubric] = useState('');
  const [rubricPhotos, setRubricPhotos] = useState([]);
  const [answer, setAnswer] = useState('');
  const [answerPhotos, setAnswerPhotos] = useState([]);
  const [frqResult, setFrqResult] = useState(null);

  // MCQ
  const [mcqQuestions, setMcqQuestions] = useState('');
  const [mcqPhotos, setMcqPhotos] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState('');
  const [mcqKey, setMcqKey] = useState('');
  const [mcqResult, setMcqResult] = useState(null);

  useEffect(() => { setExam(null); }, [subject]);

  const official = source === 'past' && picked != null ? questions[picked] : null;
  const ownRubric = rubric.trim() || rubricPhotos.length;
  const rubricLabel = ownRubric ? 'your rubric'
    : official ? `the official ${examLabel(exam)} scoring guidelines`
      : 'an AP-style rubric the AI wrote';

  const canGradeFrq = subject && (answer.trim() || answerPhotos.length)
    && (source === 'own' ? (question.trim() || questionPhotos.length || ownRubric) : official || ownRubric)
    && !(official && !ownRubric && official.parts?.length && !selectedParts.length);
  const canGradeMcq = subject && (mcqQuestions.trim() || mcqPhotos.length) && (mcqAnswers.trim() || mcqPhotos.length);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
      recordGrade(user?.uid).catch(() => {});
    } catch (e) {
      errorLogger.warn('Grader failed', { error: e?.message });
      toast.error(e?.message || 'Grading failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onGradeFrq = () => run(async () => {
    setFrqResult(null);
    const r = await gradeFrq({
      subject,
      question: source === 'own' ? question : '',
      questionPhotos: source === 'own' ? questionPhotos : [],
      rubric: ownRubric ? { source: 'student', text: rubric }
        : official ? { source: 'official', text: official.text, title: official.label, points: official.points, exam: `${subject} ${examLabel(exam)}`, parts: official.parts, selected: selectedParts }
          : { source: 'ai' },
      rubricPhotos: ownRubric ? rubricPhotos : [],
      // The official booklet carries the question itself, with any documents and sources.
      booklet: official && exam?.frq ? await loadQuestionBooklet(exam.frq) : '',
      bookletTitle: official?.label,
      answer,
      answerPhotos,
    });
    setFrqResult({ ...r, rubricLabel });
  });

  const onGradeMcq = () => run(async () => {
    setMcqResult(null);
    setMcqResult(await gradeMcq({ subject, questions: mcqQuestions, answers: mcqAnswers, key: mcqKey, photos: mcqPhotos }));
  });

  return (
    <div className="min-h-screen bg-base-950">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <header>
          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-display font-bold text-content-primary">
            <ClipboardCheck className="w-7 h-7 text-primary-400" strokeWidth={1.5} /> Grader
          </h1>
          <p className="mt-2 text-content-muted">
            Grade a free-response answer against the official College Board scoring guidelines or your own rubric, or check multiple-choice answers. Type your work or add photos of it.
          </p>
        </header>

        <div role="tablist" aria-label="What to grade" className="inline-flex rounded-lg border border-border bg-base-850 p-1">
          <button type="button" role="tab" aria-selected={tab === 'frq'} onClick={() => setTab('frq')} className={tabClass(tab === 'frq')}>Free response</button>
          <button type="button" role="tab" aria-selected={tab === 'mcq'} onClick={() => setTab('mcq')} className={tabClass(tab === 'mcq')}>Multiple choice</button>
        </div>

        <Card className="p-4 sm:p-6 space-y-6">
          <div>
            <Label>Subject</Label>
            <CustomDropdown options={SUBJECT_OPTIONS} value={subject} onChange={setSubject} placeholder="Choose your AP class" />
          </div>

          {tab === 'frq' ? (
            <>
              <div>
                <Label>Question</Label>
                <div role="radiogroup" aria-label="Question source" className="flex flex-wrap gap-2 mb-3">
                  {[['past', 'Past AP exam question'], ['own', 'My own question']].map(([v, l]) => (
                    <button key={v} type="button" role="radio" aria-checked={source === v} onClick={() => setSource(v)}
                      className={`px-3 py-1.5 rounded-md border text-sm ${source === v ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-border-strong text-content-secondary hover:bg-base-750'}`}>{l}</button>
                  ))}
                </div>
                {source === 'past' ? (
                  subject
                    ? <PastQuestionPicker subject={subject} exam={exam} setExam={setExam} questions={questions} setQuestions={setQuestions} picked={picked} setPicked={setPicked} selectedParts={selectedParts} setSelectedParts={setSelectedParts} />
                    : <p className="text-sm text-content-muted">Choose a subject to see its past exams.</p>
                ) : (
                  <FrqAnswerBox tone="app" value={question} onChange={setQuestion} images={questionPhotos} onImagesChange={setQuestionPhotos}
                    ariaLabel="The question" placeholder="Paste or type the question, or add a photo of it." minHeight="min-h-[7rem]" photoLabel="Add photo of question" />
                )}
              </div>

              <div>
                <Label hint={official ? 'Optional. Leave empty to use the official scoring guidelines.' : 'Optional. Without one, the AI writes an AP-style rubric first and grades against it.'}>
                  Your own rubric
                </Label>
                <FrqAnswerBox tone="app" value={rubric} onChange={setRubric} images={rubricPhotos} onImagesChange={setRubricPhotos}
                  ariaLabel="Your rubric" placeholder="Paste a rubric or scoring guideline from your teacher, or add a photo." minHeight="min-h-[5rem]" photoLabel="Add photo of rubric" />
              </div>

              <div>
                <Label>Your answer</Label>
                <FrqAnswerBox tone="app" value={answer} onChange={setAnswer} images={answerPhotos} onImagesChange={setAnswerPhotos} ariaLabel="Your answer" />
              </div>

              <Button variant="primary" className="w-full" onClick={onGradeFrq} disabled={!canGradeFrq || busy}>
                {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Grading…</> : `Grade with ${rubricLabel}`}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label hint="Paste them, or add photos of the questions (and of your marked answer sheet).">Questions</Label>
                <FrqAnswerBox tone="app" value={mcqQuestions} onChange={setMcqQuestions} images={mcqPhotos} onImagesChange={setMcqPhotos}
                  ariaLabel="The multiple-choice questions" placeholder="1. Which of the following…  (A) …  (B) …" minHeight="min-h-[8rem]" photoLabel="Add photo" />
              </div>
              <div>
                <Label hint='For example "1 B, 2 C, 3 A". Leave empty if your answers are marked in the photos.'>Your answers</Label>
                <Textarea value={mcqAnswers} onChange={(e) => setMcqAnswers(e.target.value)} rows={2} aria-label="Your answers" />
              </div>
              <div>
                <Label hint="Optional. Without a key the grader solves each question itself.">Answer key</Label>
                <Textarea value={mcqKey} onChange={(e) => setMcqKey(e.target.value)} rows={2} aria-label="Answer key" />
              </div>
              <Button variant="primary" className="w-full" onClick={onGradeMcq} disabled={!canGradeMcq || busy}>
                {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking…</> : 'Check my answers'}
              </Button>
            </>
          )}
        </Card>

        {tab === 'frq' && frqResult && <FrqResult result={frqResult} rubricLabel={frqResult.rubricLabel} />}
        {tab === 'mcq' && mcqResult && <McqResult result={mcqResult} />}
      </div>
    </div>
  );
}
