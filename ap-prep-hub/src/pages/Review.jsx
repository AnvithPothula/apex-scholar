/**
 * Review — the spaced-repetition queue of questions you got wrong.
 *
 * Fed automatically by PracticeTests (every miss becomes a card). Scheduling
 * lives in services/srs.js; this page is the study loop.
 *
 * The card is re-presented as a *question*, not as an answer key: you pick an
 * option and find out whether you got it right this time, and only then do you
 * see what you originally put. Showing the answer immediately (the old
 * behaviour) meant a card could never actually test you.
 *
 * Legacy cards saved before options were stored have no `options` array; those
 * fall back to the old reveal-only flow rather than breaking.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, CheckCircle, RotateCcw, Eye, CalendarClock, Sparkles, Loader2, XCircle } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/UIComponents';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { createPageUrl } from '../utils/helpers';
import srs, { GRADE, dueCards } from '../services/srs';
import { buildWhyWrongPrompt, buildExplainAllPrompt } from '../utils/whyWrong';
import geminiService from '../services/geminiService';
import { recordReviewSession } from '../services/activityTracker';

const GRADE_BUTTONS = [
  { key: 'again', label: 'Again', help: 'Got it wrong', variant: 'destructive' },
  { key: 'hard', label: 'Hard', help: 'Barely got it', variant: 'outline' },
  { key: 'good', label: 'Good', help: 'Got it', variant: 'secondary' },
  { key: 'easy', label: 'Easy', help: 'Too easy', variant: 'primary' },
];

const ALL = '__all__';

const formatDue = (due) => {
  const days = Math.round((due - Date.now()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

const letter = (i) => String.fromCharCode(65 + i);

/** Cards saved before options were stored can't be re-answered interactively. */
const isInteractive = (card) =>
  Array.isArray(card?.options) && card.options.length > 0 && Number.isInteger(card?.correctIndex);

export default function Review() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState(ALL);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [lastInterval, setLastInterval] = useState(null);
  const [why, setWhy] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    let cancelled = false;
    (async () => {
      const queue = await srs.getQueue(user.uid);
      if (cancelled) return;
      setCards(queue);
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Subjects that actually have something due, with counts, so the picker only
  // ever offers work that exists.
  const dueBySubject = useMemo(() => {
    const counts = new Map();
    for (const c of dueCards(cards, Date.now(), 9999)) {
      const key = c.subject || 'Practice';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [cards]);

  const totalDue = useMemo(() => dueBySubject.reduce((n, [, c]) => n + c, 0), [dueBySubject]);

  const session = useMemo(() => {
    const due = dueCards(cards, Date.now(), 30);
    return subject === ALL ? due : due.filter((c) => (c.subject || 'Practice') === subject);
  }, [cards, subject]);

  const card = session[index];

  const resetCardState = useCallback(() => {
    setPicked(null);
    setRevealed(false);
    setWhy(null);
    setWhyLoading(false);
  }, []);

  const grade = useCallback(async (key) => {
    if (!card || !user) return;
    const updated = await srs.gradeCard(user.uid, card.id, GRADE[key]);
    setLastInterval(updated ? updated.due : null);
    // Reviewing is studying — it has to count toward the streak. Fire-and-forget
    // so a logging hiccup never blocks the next card.
    recordReviewSession(user.uid, { cardsReviewed: 1, subject: card.subject || '' });
    setCompleted((n) => n + 1);
    setIndex((i) => i + 1);
    resetCardState();
  }, [card, user, resetCardState]);

  const choose = (i) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
  };

  // Answers inline instead of navigating to the tutor. Navigating meant leaving
  // the card mid-review, and the chat handoff had its own delivery bug.
  const askWhy = useCallback(async () => {
    if (!card || whyLoading) return;
    setWhyLoading(true);
    try {
      // With answer choices, explain all of them — knowing why B is wrong is
      // what stops you picking B next time, and that's worth having even when
      // you got this one right. Without choices, fall back to diagnosing the
      // single mistake.
      const prompt = isInteractive(card)
        ? buildExplainAllPrompt(card)
        : buildWhyWrongPrompt(card);
      if (!prompt) return;
      const text = await geminiService.generateContent(prompt, {
        temperature: 0.4,
        maxTokens: 700,
        task: 'explain',
      });
      setWhy(String(text || '').trim() || 'No explanation came back. Try again in a moment.');
    } catch (e) {
      console.error('[review] why-was-I-wrong failed', e);
      setWhy('The tutor is temporarily unavailable — try again in a minute.');
    } finally {
      setWhyLoading(false);
    }
  }, [card, whyLoading]);

  if (isLoading) return <Shell><p className="text-content-secondary">Loading…</p></Shell>;

  if (!totalDue) {
    const next = cards.map((c) => c.due).filter(Boolean).sort((a, b) => a - b)[0];
    return (
      <Shell>
        {completed > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-success-400" strokeWidth={1.5} />
              <span className="text-body text-content-primary">
                Done — {completed} {completed === 1 ? 'card' : 'cards'} reviewed.
              </span>
            </div>
            <p className="text-content-secondary flex items-center gap-2">
              <CalendarClock className="w-4 h-4" strokeWidth={1.5} />
              {next ? `Next card is due ${formatDue(next)}.` : 'Nothing scheduled.'}
            </p>
          </>
        ) : (
          <>
            <p className="text-body text-content-primary mb-2">Nothing to review yet.</p>
            <p className="text-body-sm text-content-secondary mb-4">
              Every question you miss on a practice test lands here automatically, then comes back on a
              schedule until it sticks.
            </p>
            <Link to={createPageUrl('PracticeTests')}>
              <Button variant="primary">Take a practice test</Button>
            </Link>
          </>
        )}
      </Shell>
    );
  }

  // Picked a subject and cleared it, but other subjects still have work.
  if (!card) {
    return (
      <Shell>
        <SubjectPicker subjects={dueBySubject} total={totalDue} value={subject} onChange={(s) => { setSubject(s); setIndex(0); resetCardState(); }} />
        <Card className="p-5 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-success-400" strokeWidth={1.5} />
            <span className="text-body text-content-primary">
              {completed > 0 ? `Done — ${completed} reviewed.` : 'Nothing due in this subject.'}
            </span>
          </div>
          <p className="text-body-sm text-content-secondary">Pick another subject above, or switch to Mixed.</p>
        </Card>
      </Shell>
    );
  }

  const interactive = isInteractive(card);
  const gotItRight = interactive && picked === card.correctIndex;

  return (
    <Shell>
      <SubjectPicker
        subjects={dueBySubject}
        total={totalDue}
        value={subject}
        onChange={(s) => { setSubject(s); setIndex(0); resetCardState(); }}
      />

      <div className="flex items-center justify-between mb-4 mt-4">
        <Badge variant="secondary">{card.subject || 'Practice'}</Badge>
        <span className="text-caption text-content-muted">{index + 1} of {session.length} due</span>
      </div>

      {/* The source has to come with the question — a card asking about "the
          stimulus" with no stimulus shown is unanswerable. */}
      {card.stimulus && (
        <Card className="p-4 mb-3 bg-base-800">
          <p className="text-label text-content-muted mb-2">Stimulus</p>
          <div className="border-l-4 border-success-500 pl-3">
            <p className="text-body-sm text-content-secondary whitespace-pre-wrap italic">{card.stimulus}</p>
          </div>
        </Card>
      )}

      <Card className="p-5 mb-4">
        <p className="text-body text-content-primary whitespace-pre-wrap">{card.question}</p>
      </Card>

      {interactive && (
        <div className="space-y-2 mb-4">
          {card.options.map((opt, i) => {
            const isCorrect = i === card.correctIndex;
            const isPicked = i === picked;
            let cls = 'border-border-strong bg-base-850 hover:bg-base-800';
            if (revealed && isCorrect) cls = 'border-success-500 bg-success-900/30';
            else if (revealed && isPicked) cls = 'border-error-500 bg-error-900/30';
            else if (revealed) cls = 'border-border-subtle bg-base-850 opacity-60';
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={revealed}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${cls} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="flex items-start gap-2">
                  <span className="font-bold text-content-secondary shrink-0">{letter(i)}.</span>
                  <span className="text-body-sm text-content-primary flex-1">{opt}</span>
                  {revealed && isCorrect && <CheckCircle className="w-4 h-4 text-success-400 shrink-0" strokeWidth={1.5} />}
                  {revealed && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-error-400 shrink-0" strokeWidth={1.5} />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.div key="answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {interactive && (
              <Card className={`p-4 mb-4 border ${gotItRight ? 'border-success-500/40' : 'border-error-500/40'}`}>
                <p className="text-body text-content-primary mb-1">
                  {gotItRight ? 'Correct this time.' : 'Still not right.'}
                </p>
                {/* Showing the original answer is the point of a review card:
                    it tells you whether you repeated the same mistake. */}
                {card.userAnswer && (
                  <p className="text-body-sm text-content-secondary">
                    {gotItRight
                      ? `Last time you put ${card.userAnswer}.`
                      : picked !== null && card.userAnswer.startsWith(letter(picked))
                        ? `Same answer you gave last time (${card.userAnswer}) — this is the one to nail down.`
                        : `Last time you put ${card.userAnswer}, so it's a different mistake this time.`}
                  </p>
                )}
              </Card>
            )}

            <Card className="p-5 mb-4 space-y-3">
              {!interactive && card.userAnswer && (
                <div>
                  <p className="text-label text-content-muted mb-1">You answered</p>
                  <p className="text-body-sm text-error-400">{card.userAnswer}</p>
                </div>
              )}
              {!interactive && (
                <div>
                  <p className="text-label text-content-muted mb-1">Correct answer</p>
                  <p className="text-body-sm text-success-400">{card.correctAnswer || '—'}</p>
                </div>
              )}
              {card.explanation && (
                <div>
                  <p className="text-label text-content-muted mb-1">Why</p>
                  <p className="text-body-sm text-content-secondary whitespace-pre-wrap">{card.explanation}</p>
                </div>
              )}
            </Card>

            {why ? (
              <Card className="p-4 mb-4">
                <p className="text-label text-content-muted mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} /> Tutor
                </p>
                <div className="text-body-sm text-content-secondary">
                  <MarkdownRenderer content={why} />
                </div>
              </Card>
            ) : (
              <Button variant="outline" onClick={askWhy} disabled={whyLoading} className="w-full mb-4">
                {whyLoading
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
                  : <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />}
                {whyLoading
                  ? 'Thinking…'
                  : interactive
                    ? 'Explain every answer choice'
                    : 'Why was I wrong?'}
              </Button>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADE_BUTTONS.map((g) => (
                <Button key={g.key} variant={g.variant} onClick={() => grade(g.key)} title={g.help}>
                  {g.label}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : (
          !interactive && (
            <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button variant="primary" onClick={() => setRevealed(true)} className="w-full">
                <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Show answer
              </Button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {lastInterval && (
        <p className="text-caption text-content-muted mt-4 flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          Last card scheduled for {formatDue(lastInterval)}.
        </p>
      )}
    </Shell>
  );
}

/** Mixed by default; per-subject when you want to drill one thing. */
function SubjectPicker({ subjects, total, value, onChange }) {
  if (subjects.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(ALL)}
        className={`px-3 py-1.5 rounded-full text-body-sm border transition-colors ${
          value === ALL
            ? 'bg-content-primary text-base-950 border-content-primary'
            : 'border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
        }`}
      >
        Mixed ({total})
      </button>
      {subjects.map(([name, count]) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          className={`px-3 py-1.5 rounded-full text-body-sm border transition-colors ${
            value === name
              ? 'bg-content-primary text-base-950 border-content-primary'
              : 'border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
          }`}
        >
          {name} ({count})
        </button>
      ))}
    </div>
  );
}

// Matches the shell every other page uses (Diagnostics, Flashcards, Progress):
// full-bleed base-950 canvas, then a centred max-width column.
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-6 h-6 text-content-primary" strokeWidth={1.5} />
          <h1 className="text-h2 font-display text-content-primary">Review</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
