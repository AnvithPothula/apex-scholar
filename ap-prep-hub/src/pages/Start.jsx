import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X, RotateCcw, Brain, Calculator, FileQuestion, Search } from 'lucide-react';
import { Button, Card } from '../components/ui/UIComponents';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { getBankQuestions } from '../services/questionBank';
import { logResponses } from '../services/responseLog';
import srs from '../services/srs';
import { recordPracticeTest } from '../services/activityTracker';
import { completionRecord } from '../components/onboarding/onboardingState';
import { calculatorUrl } from '../utils/testToScore';
import { trackEvent } from '../utils/analytics';
import errorLogger from '../utils/errorLogger';
import {
  FIRST_RUN_QUESTIONS, FIRST_RUN_MIN_QUESTIONS, FIRST_RUN_SUBJECTS,
  FIRST_RUN_DONE_KEY, FIRST_RUN_PENDING_KEY,
  subjectKeyFor, defaultSubject, daysToExam, predictFromCheck, missedConcepts,
} from '../utils/firstRun';

/**
 * First-run check (playbook: "the first session is the diagnostic").
 *
 * Pick a subject, answer ten banked questions with feedback after each one,
 * and leave with a predicted score, the range ten answers can honestly
 * support, and what to do today. Banked questions only: no AI call, so it
 * starts instantly and costs no quota, for guests too.
 *
 * Guests see their result immediately. It's parked in localStorage so that
 * signing in from the result screen saves their misses instead of losing them.
 */

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private window */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* private window */ } },
};

// Only what the result screen and the saved misses need.
const slim = (q) => ({
  id: q.id || null, question: q.question, choices: q.choices,
  correctAnswer: q.correctAnswer, explanations: q.explanations, concept: q.concept || null,
});

export default function Start() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('pick');          // pick | loading | quiz | result
  const [subject, setSubject] = useState(null);
  const [filter, setFilter] = useState('');
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [times, setTimes] = useState({});
  const [error, setError] = useState('');
  const shownAt = useRef(Date.now());
  const saved = useRef(false);

  // Pre-select the first of their saved subjects once the profile arrives.
  useEffect(() => {
    if (!subject && user?.subjects) setSubject(defaultSubject(user.subjects));
  }, [user, subject]);

  // Persist a finished check for a signed-in student. Runs at most once.
  const persist = async (run) => {
    if (!user?.uid || saved.current) return;
    saved.current = true;
    const { subject: name, questions: qs, answers: ans, times: ms } = run;
    const correct = qs.filter((q, i) => ans[i] === q.correctAnswer).length;
    try {
      logResponses(user.uid, qs.map((q, i) => ({
        itemId: q.id || `${name}:first-run:${i}`,
        subject: name,
        unit: q.concept,
        source: 'diagnostic',
        chosen: Number.isInteger(ans[i]) ? ans[i] : null,
        correct: ans[i] === q.correctAnswer,
        msToAnswer: ms[i],
      })));
      const misses = qs
        .map((q, i) => ({ q, i }))
        .filter(({ q, i }) => ans[i] !== q.correctAnswer)
        .map(({ q, i }) => ({
          question: q.question,
          subject: name,
          unit: q.concept,
          options: q.choices,
          correctIndex: q.correctAnswer,
          userAnswer: q.choices[ans[i]] ?? '',
          correctAnswer: q.choices[q.correctAnswer],
          explanation: q.explanations?.[ans[i]] || q.explanations?.[q.correctAnswer] || '',
        }));
      if (misses.length) await srs.addMisses(user.uid, misses);
      await recordPracticeTest(user.uid, {
        subject: name,
        questionsAnswered: qs.length,
        correctAnswers: correct,
        scorePercent: Math.round((correct / qs.length) * 100),
      });
      const key = subjectKeyFor(name);
      const subjects = key ? [...new Set([...(user.subjects || []), key])] : user.subjects || [];
      await updateUserProfile({
        firstRunAt: new Date().toISOString(),
        subjects,
        // They chose a subject here, which is all onboarding asks for.
        ...completionRecord(),
      });
    } catch (e) {
      errorLogger.warn('First-run save failed', e);
    }
  };

  // A guest who signed in from the result screen comes back here: restore and save.
  useEffect(() => {
    if (!user?.uid) return;
    const pending = store.get(FIRST_RUN_PENDING_KEY);
    if (!pending?.questions?.length) return;
    store.del(FIRST_RUN_PENDING_KEY);
    setSubject(pending.subject);
    setQuestions(pending.questions);
    setAnswers(pending.answers);
    setTimes(pending.times || {});
    setStep('result');
    persist(pending);
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = async (name) => {
    setSubject(name);
    setError('');
    setStep('loading');
    const qs = await getBankQuestions(name, { count: FIRST_RUN_QUESTIONS });
    if (qs.length < FIRST_RUN_MIN_QUESTIONS) {
      setError(`${name} doesn't have enough checked questions yet. Pick another subject, or ask the ${name} tutor instead.`);
      setStep('pick');
      return;
    }
    setQuestions(qs.map(slim));
    setIndex(0);
    setAnswers({});
    setTimes({});
    shownAt.current = Date.now();
    setStep('quiz');
  };

  const choose = (choice) => {
    if (answers[index] !== undefined) return;
    setAnswers((a) => ({ ...a, [index]: choice }));
    setTimes((t) => ({ ...t, [index]: Date.now() - shownAt.current }));
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      shownAt.current = Date.now();
      return;
    }
    const run = { subject, questions, answers, times };
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    store.set(FIRST_RUN_DONE_KEY, true);
    trackEvent('first_run_complete', { subject, correct, total: questions.length });
    if (user?.uid) persist(run);
    else store.set(FIRST_RUN_PENDING_KEY, run);
    setStep('result');
  };

  const skip = async () => {
    store.set(FIRST_RUN_DONE_KEY, true);
    if (user?.uid) {
      try { await updateUserProfile({ firstRunSkippedAt: new Date().toISOString() }); }
      catch (e) { errorLogger.warn('First-run skip not saved', e); }
    }
    navigate('/ai-tutors', { replace: true });
  };

  const subjects = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? FIRST_RUN_SUBJECTS.filter((s) => s.toLowerCase().includes(f)) : FIRST_RUN_SUBJECTS;
  }, [filter]);

  if (step === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-content-muted" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-content-muted border-t-transparent mx-auto mb-4" />
        Getting your {subject} questions…
      </div>
    );
  }

  if (step === 'quiz') {
    const q = questions[index];
    const picked = answers[index];
    const answered = picked !== undefined;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-3 text-body-sm text-content-muted">
          <span>{subject}</span>
          <span>Question {index + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-base-800 rounded-full h-1.5 mb-6" aria-hidden="true">
          <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <Card className="p-6">
          <MarkdownRenderer content={q.question} className="text-body text-content-primary mb-5" />
          <div className="space-y-2.5" role="radiogroup" aria-label="Answer choices">
            {q.choices.map((c, i) => {
              const isRight = i === q.correctAnswer;
              const tone = !answered
                ? 'border-border-strong bg-base-850 hover:border-content-muted'
                : isRight
                  ? 'border-success-500 bg-success-900/40'
                  : i === picked ? 'border-error-500 bg-error-900/40' : 'border-border-subtle bg-base-850 opacity-70';
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={picked === i}
                  disabled={answered}
                  onClick={() => choose(i)}
                  className={`w-full flex items-start gap-3 p-3.5 text-left rounded-lg border transition-colors ${tone}`}
                >
                  <span className="font-semibold text-content-secondary mt-0.5">{String.fromCharCode(65 + i)}.</span>
                  <MarkdownRenderer content={c} className="flex-1 text-content-primary" />
                  {answered && isRight && <Check className="w-5 h-5 text-success-400 shrink-0" aria-label="Correct answer" />}
                  {answered && !isRight && i === picked && <X className="w-5 h-5 text-error-400 shrink-0" aria-label="Your answer" />}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-5 p-4 rounded-lg bg-base-800 text-body-sm" aria-live="polite">
              <p className="font-semibold text-content-primary mb-1">
                {picked === q.correctAnswer ? 'Correct.' : `Not quite — the answer is ${String.fromCharCode(65 + q.correctAnswer)}.`}
              </p>
              <MarkdownRenderer content={q.explanations?.[picked] || ''} className="text-content-secondary" />
              {picked !== q.correctAnswer && q.explanations?.[q.correctAnswer] && (
                <MarkdownRenderer content={q.explanations[q.correctAnswer]} className="text-content-secondary mt-2" />
              )}
            </div>
          )}
        </Card>
        <div className="flex justify-end mt-5">
          <Button onClick={next} disabled={!answered}>
            {index < questions.length - 1 ? 'Next question' : 'See my score'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const missed = questions.length - correct;
    const prediction = predictFromCheck(subject, correct, questions.length);
    const days = daysToExam(subject);
    const concepts = missedConcepts(questions, answers);
    const key = subjectKeyFor(subject);
    const tutorPath = key ? `/ai-tutors/${key}` : '/ai-tutors';
    const askAbout = concepts[0]
      ? `I just missed questions on ${concepts[0]} in ${subject}. Can you explain it simply, then give me one practice question?`
      : `I just took a 10-question ${subject} check. What should I focus on first?`;
    const curve = prediction && calculatorUrl(subject, prediction.estimate);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-label text-content-muted uppercase tracking-wide">{subject} · predicted AP score</p>
          <p className="text-display font-bold text-content-primary my-2">{prediction ? prediction.estimate.score : '—'}</p>
          {prediction && prediction.low !== prediction.high && (
            <p className="text-body-sm text-content-secondary">
              Realistically anywhere from <strong>{prediction.low}</strong> to <strong>{prediction.high}</strong>. Ten questions can't pin it down closer than that.
            </p>
          )}
          <p className="text-body-sm text-content-muted mt-3">
            {correct} of {questions.length} correct
            {days != null && <> · {days} day{days === 1 ? '' : 's'} until the exam</>}
          </p>
          <p className="text-caption text-content-muted mt-1">
            Free response is predicted at your multiple-choice rate. A full practice test gives a tighter number.
          </p>
        </Card>

        <h2 className="text-h4 font-semibold text-content-primary mt-8 mb-3">What to do today</h2>
        <div className="space-y-2.5">
          {missed > 0 && (user ? (
            <PlanRow icon={RotateCcw} title={`Review the ${missed} you missed`} body="They're in your review queue and will come back until they stick." onClick={() => navigate('/review')} />
          ) : (
            <PlanRow
              icon={RotateCcw}
              title={`Sign in to save the ${missed} you missed`}
              body="They'll come back for review on a schedule, and you can opt in to a weekly email with what's due."
              onClick={() => navigate('/login', { state: { from: { pathname: '/start' } } })}
            />
          ))}
          <PlanRow
            icon={Brain}
            title={concepts[0] ? `Ask the tutor about ${concepts[0]}` : `Ask the ${subject} tutor what to focus on`}
            body="It starts with the question already written; edit it or just send."
            onClick={() => navigate(tutorPath, { state: { prefill: askAbout } })}
          />
          {user && (
            <PlanRow icon={FileQuestion} title="Take a practice test" body="Longer, timed, with free response, for a tighter score estimate." onClick={() => navigate('/practice-tests')} />
          )}
          {curve && (
            <PlanRow icon={Calculator} title="See how this score was worked out" body="Opens the score calculator with your sections filled in." onClick={() => navigate(curve)} />
          )}
        </div>
        <div className="flex justify-between items-center mt-8">
          <button type="button" className="text-body-sm text-content-muted hover:text-content-secondary underline" onClick={() => { saved.current = false; setStep('pick'); }}>
            Check another subject
          </button>
          <Button variant="secondary" onClick={() => navigate('/ai-tutors')}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-h1 font-bold text-content-primary">Where do you stand?</h1>
      <p className="text-body text-content-secondary mt-2 mb-6">
        10 AP-style questions, about 8 minutes. You'll get a predicted score, the range it could really be,
        and what to do today. No account needed.
      </p>
      {error && <p className="mb-4 p-3 rounded-lg bg-warning-900/40 text-warning-400 text-body-sm" role="alert">{error}</p>}
      <label className="relative block mb-4">
        <span className="sr-only">Find your subject</span>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Find your subject"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-base-800 border border-border text-content-primary placeholder:text-content-muted"
        />
      </label>
      <div className="grid sm:grid-cols-2 gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => begin(s)}
            className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${s === subject ? 'border-primary-500 bg-base-800' : 'border-border-strong bg-base-850 hover:border-content-muted'}`}
          >
            <span className="text-body-sm text-content-primary">{s}</span>
            <ArrowRight className="w-4 h-4 text-content-muted" aria-hidden="true" />
          </button>
        ))}
        {!subjects.length && <p className="text-body-sm text-content-muted">No subject matches "{filter}".</p>}
      </div>
      <button type="button" onClick={skip} className="mt-8 text-body-sm text-content-muted hover:text-content-secondary underline">
        Skip, take me to the tutors
      </button>
    </div>
  );
}

function PlanRow({ icon: Icon, title, body, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-strong bg-base-850 hover:border-content-muted text-left transition-colors"
    >
      <Icon className="w-5 h-5 text-primary-400 shrink-0" aria-hidden="true" />
      <span className="flex-1">
        <span className="block text-body font-medium text-content-primary">{title}</span>
        <span className="block text-body-sm text-content-muted">{body}</span>
      </span>
      <ArrowRight className="w-4 h-4 text-content-muted shrink-0" aria-hidden="true" />
    </button>
  );
}
