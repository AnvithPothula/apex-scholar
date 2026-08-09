/**
 * Practice — the hub for everything that drills you.
 *
 * Tests, Flashcards and Review were three separate top-level tabs, which is
 * what pushed the nav to 7 items (Apple HIG collapses iPhone tab bars past 5;
 * Material Design specifies 3-5). They're one job — "quiz myself" — so they
 * live together here and the nav keeps a single Practice entry.
 *
 * This is deliberately a hub, not a rewrite: it links to the existing
 * /practice-tests, /flashcards and /review routes, which all still work
 * directly so old links and bookmarks keep resolving.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Zap, RotateCcw, ChevronRight, Target, Users } from 'lucide-react';
import { Card, Badge } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { createPageUrl } from '../utils/helpers';
import srs, { dueCards } from '../services/srs';
import dataService from '../services/dataService';
import { masteryBySubject, weakestArea } from '../services/mastery';

export default function Practice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState(0);
  const [deckCount, setDeckCount] = useState(null);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [queue, decks, tests] = await Promise.all([
        srs.getQueue(user.uid),
        dataService.getUserFlashcardDecks(user.uid).catch(() => []),
        dataService.getUserPracticeTests(user.uid).catch(() => []),
      ]);
      if (cancelled) return;
      setDueCount(dueCards(queue, Date.now(), 999).length);
      setDeckCount(decks.length);
      setFocus(weakestArea(masteryBySubject(tests)));
    })();
    return () => { cancelled = true; };
  }, [user]);

  const tiles = [
    {
      key: 'tests',
      icon: FileQuestion,
      title: 'Practice Tests',
      body: 'Full-length, exam-format tests with AI scoring and FRQ grading.',
      to: createPageUrl('PracticeTests'),
      meta: null,
    },
    {
      key: 'review',
      icon: RotateCcw,
      title: 'Review',
      body: 'Questions you missed, resurfaced on a spaced schedule until they stick.',
      to: createPageUrl('Review'),
      meta: dueCount > 0 ? `${dueCount} due` : null,
    },
    {
      key: 'cards',
      icon: Zap,
      title: 'Flashcards',
      body: 'Build a deck, study it, or grab a public one.',
      to: createPageUrl('Flashcards'),
      meta: deckCount ? `${deckCount} ${deckCount === 1 ? 'deck' : 'decks'}` : null,
    },
    {
      key: 'classes',
      icon: Users,
      title: 'Classes',
      body: 'Join your class or club with a link and compare progress on a shared leaderboard.',
      to: createPageUrl('Classes'),
      meta: null,
    },
  ];

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-content-primary mb-2">
            Practice
          </h1>
          <p className="text-sm sm:text-base text-content-secondary">
            Don&apos;t read about it. Get graded on it.
          </p>
        </motion.div>

        {focus && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                  <span className="text-caption text-content-muted uppercase tracking-wider">Weakest area</span>
                </div>
                <p className="text-h4 font-display text-content-primary">{focus.label}</p>
                <p className="text-body-sm text-content-secondary mt-0.5">
                  {focus.subject} — {focus.accuracy}% correct across {focus.count}{' '}
                  {focus.count === 1 ? 'question' : 'questions'}.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t, i) => (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <button
                type="button"
                onClick={() => navigate(t.to)}
                className="w-full h-full text-left rounded-md border border-border bg-base-850 hover:bg-base-800 hover:border-border-strong transition-colors p-5 focus:outline-none focus:ring-2 focus:ring-content-muted"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-sm bg-base-800">
                    <t.icon className="w-5 h-5 text-content-primary" strokeWidth={1.5} />
                  </div>
                  {t.meta && <Badge variant="secondary" className="text-xs">{t.meta}</Badge>}
                </div>
                <h2 className="text-h4 font-display text-content-primary mb-1 flex items-center gap-1">
                  {t.title}
                  <ChevronRight className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                </h2>
                <p className="text-body-sm text-content-secondary">{t.body}</p>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
