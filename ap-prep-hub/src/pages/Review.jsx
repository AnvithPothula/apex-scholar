/**
 * Review — the spaced-repetition queue of questions you got wrong.
 *
 * Fed automatically by PracticeTests (every miss becomes a card). Scheduling
 * lives in services/srs.js; this page is just the study loop.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, CheckCircle, RotateCcw, Eye, CalendarClock } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { createPageUrl } from '../utils/helpers';
import srs, { GRADE, dueCards } from '../services/srs';

const GRADE_BUTTONS = [
  { key: 'again', label: 'Again', help: 'Got it wrong', variant: 'destructive' },
  { key: 'hard', label: 'Hard', help: 'Barely got it', variant: 'outline' },
  { key: 'good', label: 'Good', help: 'Got it', variant: 'secondary' },
  { key: 'easy', label: 'Easy', help: 'Too easy', variant: 'primary' },
];

const formatDue = (due) => {
  const days = Math.round((due - Date.now()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

export default function Review() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [lastInterval, setLastInterval] = useState(null);

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

  // Snapshot the due set once per session so grading a card doesn't reshuffle
  // the stack under the student mid-review.
  const session = useMemo(() => dueCards(cards, Date.now(), 30), [cards]);
  const card = session[index];

  const grade = useCallback(async (key) => {
    if (!card || !user) return;
    const updated = await srs.gradeCard(user.uid, card.id, GRADE[key]);
    setLastInterval(updated ? updated.due : null);
    setCompleted((c) => c + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  }, [card, user]);

  if (!user) {
    return (
      <Shell>
        <p className="text-content-secondary">Sign in to build a review queue from the questions you miss.</p>
      </Shell>
    );
  }

  if (isLoading) {
    return <Shell><p className="text-content-muted">Loading your review queue…</p></Shell>;
  }

  if (!cards.length) {
    return (
      <Shell>
        <p className="text-content-secondary mb-4">
          Nothing to review yet. Every question you miss on a practice test lands here automatically,
          then comes back on a schedule until it sticks.
        </p>
        <Link to={createPageUrl('PracticeTests')}>
          <Button variant="primary">Take a practice test</Button>
        </Link>
      </Shell>
    );
  }

  if (!card) {
    const next = cards.map((c) => c.due).filter(Boolean).sort((a, b) => a - b)[0];
    return (
      <Shell>
        <div className="flex items-center gap-2 mb-3 text-success-400">
          <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-h4 font-display">
            {completed > 0 ? `${completed} reviewed. Queue clear.` : 'Queue clear.'}
          </span>
        </div>
        <p className="text-content-secondary flex items-center gap-2">
          <CalendarClock className="w-4 h-4" strokeWidth={1.5} />
          {next ? `Next card is due ${formatDue(next)}.` : 'Nothing scheduled.'}
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary">{card.subject || 'Practice'}</Badge>
        <span className="text-caption text-content-muted">
          {index + 1} of {session.length} due
        </span>
      </div>

      <Card className="p-5 mb-4">
        <p className="text-body text-content-primary whitespace-pre-wrap">{card.question}</p>
      </Card>

      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-5 mb-4 space-y-3">
              {card.userAnswer && (
                <div>
                  <p className="text-label text-content-muted mb-1">You answered</p>
                  <p className="text-body-sm text-error-400">{card.userAnswer}</p>
                </div>
              )}
              <div>
                <p className="text-label text-content-muted mb-1">Correct answer</p>
                <p className="text-body-sm text-success-400">{card.correctAnswer || '—'}</p>
              </div>
              {card.explanation && (
                <div>
                  <p className="text-label text-content-muted mb-1">Why</p>
                  <p className="text-body-sm text-content-secondary whitespace-pre-wrap">{card.explanation}</p>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADE_BUTTONS.map((g) => (
                <Button key={g.key} variant={g.variant} onClick={() => grade(g.key)} title={g.help}>
                  {g.label}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button variant="primary" onClick={() => setRevealed(true)} className="w-full">
              <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Show answer
            </Button>
          </motion.div>
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
