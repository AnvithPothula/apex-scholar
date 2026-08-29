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
import { formatDue, intervalLabel, suggestedGrade, keyAction, buildSession } from '../services/reviewSession';
import { retryAfterFrom, formatWait } from '../services/aiRetry';
import { buildWhyWrongPrompt, buildExplainAllPrompt, looksLikeReasoningLeak } from '../utils/whyWrong';
import geminiService from '../services/geminiService';
import { recordReviewSession } from '../services/activityTracker';

const GRADE_BUTTONS = [
  { key: 'again', label: 'Again', help: 'Got it wrong', variant: 'destructive' },
  { key: 'hard', label: 'Hard', help: 'Barely got it', variant: 'outline' },
  { key: 'good', label: 'Good', help: 'Got it', variant: 'secondary' },
  { key: 'easy', label: 'Easy', help: 'Too easy', variant: 'primary' },
];
const GRADE_KEYS = GRADE_BUTTONS.map((g) => g.key);

const letter = (i) => String.fromCharCode(65 + i);

/** Cards saved before options were stored can't be re-answered interactively. */
const isInteractive = (card) =>
  Array.isArray(card?.options) && card.options.length > 0 && Number.isInteger(card?.correctIndex);

export default function Review() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // The session is now explicitly started, so the queue can be configured
  // before the first card appears instead of mid-review.
  const [started, setStarted] = useState(false);
  const [chosen, setChosen] = useState([]);          // empty = every subject
  const [order, setOrder] = useState('scheduled');
  const [seed, setSeed] = useState(1);
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

  const session = useMemo(
    () => buildSession(dueCards(cards, Date.now(), 9999), { subjects: chosen, order, seed, limit: 30 }),
    [cards, chosen, order, seed]
  );

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

  // Keyboard loop. Reviewing is rapid-fire — reaching for the mouse between
  // every card is what makes a queue feel like a chore. Mapping lives in
  // services/reviewSession.js so it can be tested without a DOM.
  useEffect(() => {
    if (!card) return undefined;
    const onKey = (e) => {
      // Never hijack typing, and never fight a modifier chord.
      const el = e.target;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

      const action = keyAction(e.key, {
        revealed,
        optionCount: isInteractive(card) ? card.options.length : 0,
        gradeKeys: GRADE_KEYS,
      });
      if (!action) return;
      e.preventDefault();
      if (action.type === 'choose') choose(action.index);
      else if (action.type === 'reveal') setRevealed(true);
      else if (action.type === 'grade') grade(action.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // `choose` is defined inline below and is stable enough for this handler;
    // re-binding on every card is intentional so `card` is never stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, revealed, grade]);

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
        // 700 truncated mid-sentence on a 4-choice question (finishReason
        // MAX_TOKENS at ~698 output tokens). Explaining four choices properly
        // needs roughly double that.
        maxTokens: 1400,
        task: 'explain',
      });
      const answer = String(text || '').trim();
      // Gemma sits at the tail of the chain and, when reached, restates the
      // prompt instead of answering it. Showing that to a student is worse than
      // showing nothing, so refuse it rather than render a plan as an
      // explanation.
      setWhy(
        !answer || looksLikeReasoningLeak(answer)
          ? 'That explanation came back garbled. Try again — it usually works on the second go.'
          : answer
      );
    } catch (e) {
      console.error('[review] why-was-I-wrong failed', e);
      // "try again in a minute" was a guess. When it's a rate limit the server
      // tells us the real wait, and a student deciding whether to keep going
      // needs the difference between 20 seconds and an hour.
      const retryAfter = retryAfterFrom(e);
      setWhy(
        retryAfter !== null
          ? `The AI is busy — everyone shares the same free capacity. Try again in ${formatWait(retryAfter)}.`
          : 'The tutor is temporarily unavailable. Try again in a moment.'
      );
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

  if (!started) {
    return (
      <Shell>
        <StartScreen
          subjects={dueBySubject}
          total={totalDue}
          chosen={chosen}
          order={order}
          onToggle={(name) =>
            setChosen((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))}
          onAll={() => setChosen([])}
          onOrder={setOrder}
          onStart={() => {
            // New seed per session so "Shuffle" is a different order each time
            // but stable across re-renders within the session.
            setSeed(Date.now() % 2147483647 || 1);
            setIndex(0);
            resetCardState();
            setStarted(true);
          }}
        />
      </Shell>
    );
  }

  // Worked through everything in the chosen subjects.
  if (!card) {
    return (
      <Shell>
        <Card className="p-5 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-success-400" strokeWidth={1.5} />
            <span className="text-body text-content-primary">
              {completed > 0 ? `Done — ${completed} reviewed.` : 'Nothing due in this selection.'}
            </span>
          </div>
          <p className="text-body-sm text-content-secondary mb-3">Change what you are reviewing and go again.</p>
          <Button variant="outline" onClick={() => { setStarted(false); setCompleted(0); }}>
            Choose subjects
          </Button>
        </Card>
      </Shell>
    );
  }

  const interactive = isInteractive(card);
  const gotItRight = interactive && picked === card.correctIndex;
  const suggested = suggestedGrade({ interactive, picked, correctIndex: card.correctIndex });

  return (
    <Shell>
      <div className="mt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="secondary">{card.subject || 'Practice'}</Badge>
            <button
              type="button"
              onClick={() => { setStarted(false); resetCardState(); }}
              className="text-caption text-content-muted hover:text-content-primary underline underline-offset-2"
            >
              change
            </button>
          </div>
          <span className="text-caption text-content-muted tabular-nums">
            {index + 1} of {session.length} due
          </span>
        </div>
        {/* "3 of 12" is a number; a bar is a feeling. Knowing the end is close
            is most of what keeps a queue from feeling endless. */}
        <div
          className="w-full h-1.5 bg-base-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={session.length}
          aria-label="Review progress"
        >
          <div
            className="h-full bg-primary-500 rounded-full transition-[width] duration-300"
            style={{ width: `${session.length ? (index / session.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* The source has to come with the question — a card asking about "the
          stimulus" with no stimulus shown is unanswerable. */}
      {card.stimulus && (
        <Card className="p-4 mb-3 bg-base-800">
          <p className="text-label text-content-muted mb-2">Stimulus</p>
          <div className="border-l-4 border-success-500 pl-3">
            <div className="text-body-sm text-content-secondary italic">
              <MarkdownRenderer content={card.stimulus} />
            </div>
          </div>
        </Card>
      )}

      {/* Through MarkdownRenderer, not a bare <p>: these questions come from
          practice tests and diagnostics and routinely contain LaTeX. Rendered
          as plain text a card literally read "a $V_{max}$ of $100 \\mu mol/min$". */}
      <Card className="p-5 mb-4">
        <div className="text-body text-content-primary">
          <MarkdownRenderer content={card.question} />
        </div>
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
                  <span className="text-body-sm text-content-primary flex-1 min-w-0">
                    <MarkdownRenderer content={String(opt)} />
                  </span>
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
                  <div className="text-body-sm text-content-secondary">
                    <MarkdownRenderer content={card.explanation} />
                  </div>
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

            {/* Each button shows what it actually schedules. Without it "Good"
                and "Easy" are two unlabelled doors — the number comes from the
                real scheduler, so there is no second model to drift. The grade
                the answer implies is ringed so the common case needs no
                decision. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADE_BUTTONS.map((g, i) => {
                const implied = suggested === g.key;
                return (
                  <Button
                    key={g.key}
                    variant={g.variant}
                    onClick={() => grade(g.key)}
                    title={`${g.help} · press ${i + 1}`}
                    // h-auto beats Button's fixed h-9 via twMerge, so the
                    // two-line label is not clipped.
                    className={`flex-col gap-0 h-auto py-1.5 leading-tight ${implied ? 'ring-2 ring-content-primary ring-offset-2 ring-offset-base-950' : ''}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] opacity-60 tabular-nums">{i + 1}</span>
                      {g.label}
                    </span>
                    <span className="text-[10px] opacity-70 tabular-nums">{intervalLabel(card, g.key)}</span>
                  </Button>
                );
              })}
            </div>
            <p className="text-caption text-content-muted mt-2 text-center">
              Keys: {isInteractive(card) ? 'A–D to answer · ' : 'Space to reveal · '}1–4 to grade
            </p>
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

/**
 * Start screen.
 *
 * Previously the page dropped you straight onto a card with a single-select
 * pill row above it, so choosing what to study meant changing it mid-review —
 * and with one subject the row was hidden entirely, leaving no way to see what
 * was queued before committing to it.
 */
function StartScreen({ subjects, total, chosen, onToggle, onAll, order, onOrder, onStart }) {
  const allPicked = chosen.length === 0;
  const count = allPicked
    ? total
    : subjects.filter(([n]) => chosen.includes(n)).reduce((n, [, c]) => n + c, 0);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-label text-content-muted mb-3">What do you want to review?</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAll}
            aria-pressed={allPicked}
            className={`px-3 py-1.5 rounded-full text-body-sm border transition-colors ${
              allPicked
                ? 'bg-content-primary text-base-950 border-content-primary'
                : 'border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
            }`}
          >
            Everything ({total})
          </button>
          {subjects.map(([name, n]) => {
            const on = chosen.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => onToggle(name)}
                aria-pressed={on}
                className={`px-3 py-1.5 rounded-full text-body-sm border transition-colors ${
                  on
                    ? 'bg-content-primary text-base-950 border-content-primary'
                    : 'border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
                }`}
              >
                {name} ({n})
              </button>
            );
          })}
        </div>
        <p className="text-caption text-content-muted mt-3">
          Pick as many as you like, or leave it on Everything.
        </p>
      </Card>

      <Card className="p-5">
        <p className="text-label text-content-muted mb-3">Order</p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'scheduled', label: 'Most overdue first', hint: 'What the schedule says' },
            { key: 'random', label: 'Shuffle', hint: 'Stops you memorising positions' },
          ].map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => onOrder(o.key)}
              aria-pressed={order === o.key}
              title={o.hint}
              className={`px-3 py-1.5 rounded-full text-body-sm border transition-colors ${
                order === o.key
                  ? 'bg-content-primary text-base-950 border-content-primary'
                  : 'border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      <Button variant="primary" onClick={onStart} disabled={count === 0} className="w-full">
        Start reviewing {count === 0 ? '' : `· ${Math.min(count, 30)} card${Math.min(count, 30) === 1 ? '' : 's'}`}
      </Button>
      {count > 30 && (
        <p className="text-caption text-content-muted text-center">
          {count} are due; a session is capped at 30 so it stays finishable.
        </p>
      )}
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
