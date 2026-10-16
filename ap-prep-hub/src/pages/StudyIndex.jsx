import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Library, ExternalLink, GraduationCap, Clock, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PACKS } from '../data/packs';
import { COURSES, courseUnits } from '../data/packs/catalog';
import { nextUnit, joinCatalog } from '../utils/studyPack';
import { loadAllPackProgress } from '../services/packProgress';
import { TIMELINE_CATALOG } from '../data/timelines';

const NEXT_LABEL = { continue: 'Continue here', next: 'Up next', review: 'Worth a review' };

/**
 * /study ("Learn"): the interactive timelines, then every AP class (the
 * student's own first, then the ones with packs).
 * /study/:subject: that class's units, ready ones with saved progress and the
 * unit to do next, the rest marked "Coming soon".
 */
export default function StudyIndex() {
  const { subject } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});
  const classes = useMemo(() => {
    const mine = new Set(user?.subjects || []);
    return joinCatalog(COURSES, PACKS, courseUnits)
      .map((c) => ({ ...c, isMine: mine.has(c.key) }))
      .sort((a, b) => Number(b.isMine) - Number(a.isMine) || Number(b.ready > 0) - Number(a.ready > 0)
        || a.subject.localeCompare(b.subject));
  }, [user?.subjects]);

  useEffect(() => {
    let live = true;
    loadAllPackProgress(user?.uid || null, Object.keys(PACKS)).then((p) => live && setProgress(p));
    return () => { live = false; };
  }, [user?.uid]);

  const current = subject && classes.find((c) => c.id === subject);

  if (subject && (!current || !current.ready)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Clock className="w-8 h-8 text-content-muted mx-auto" aria-hidden="true" />
        <h1 className="text-h2 font-bold text-content-primary mt-3">{current ? `${current.subject}: coming soon` : 'No lessons for that class yet'}</h1>
        <p className="text-body text-content-secondary mt-2">We're writing these one unit at a time and checking each against the College Board course description.</p>
        <button type="button" onClick={() => navigate('/study')} className="mt-4 text-primary-400 underline">See every class</button>
      </div>
    );
  }

  if (current) {
    const ready = current.units.filter((u) => u.ready);
    const rec = nextUnit(ready, progress);
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate('/study')} className="text-body-sm text-content-muted hover:text-content-primary">← All classes</button>
        <h1 className="text-h1 font-bold text-content-primary mt-3">{current.subject}</h1>
        <p className="text-body text-content-secondary mt-2">Pick a unit. Your progress is saved, and each unit adapts to what you've already shown you know.</p>
        <div className="mt-6 space-y-2.5">
          {current.units.map((u) => {
            if (!u.ready) {
              return (
                <div key={u.slug} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-base-900 text-left">
                  <Clock className="w-5 h-5 text-content-disabled shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-body text-content-muted">{u.title}</span>
                    <span className="block text-caption text-content-disabled mt-0.5">Coming soon</span>
                  </span>
                </div>
              );
            }
            const sum = progress[u.slug]?.summary;
            const pct = sum?.total ? Math.round((sum.answered / sum.total) * 100) : 0;
            const flag = rec?.slug === u.slug ? NEXT_LABEL[rec.why] : null;
            return (
              <button key={u.slug} type="button" onClick={() => navigate(`/study/${u.slug}`)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border bg-base-850 hover:border-primary-500 text-left transition-colors ${flag ? 'border-primary-500/60' : 'border-border-strong'}`}>
                <BookOpen className="w-5 h-5 text-primary-400 shrink-0" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  {flag && <span className="block text-caption text-primary-400">{flag}</span>}
                  <span className="block text-body font-medium text-content-primary">{u.title}</span>
                  {sum ? (
                    <>
                      <span className="block text-caption text-content-muted mt-0.5">
                        {sum.answered} of {sum.total} checkpoints · {sum.mastered} of {sum.topicCount} topics known
                      </span>
                      <span className="block w-full bg-base-800 rounded-full h-1 mt-1.5" aria-hidden="true">
                        <span className="block bg-primary-500 h-1 rounded-full" style={{ width: `${pct}%` }} />
                      </span>
                    </>
                  ) : (
                    <span className="block text-caption text-content-muted mt-0.5">Not started</span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-content-muted shrink-0" aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <p className="text-body-sm text-content-muted mt-6">
          Each unit is written against the College Board course description and checked before it goes up.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-h1 font-bold text-content-primary">Learn</h1>
      <p className="text-body text-content-secondary mt-2">
        One unit at a time, in whatever format fits each topic: short lessons, flashcards, worked steps and simulations,
        with a checkpoint after every topic, plus interactive timelines. You choose how long to spend. Free, no account needed.
      </p>
      <h2 className="text-h3 font-semibold text-content-primary mt-8">Timelines</h2>
      <p className="text-body-sm text-content-secondary mt-1">Every key event, colour-coded by theme. Select an event for a short study note.</p>
      <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
        {TIMELINE_CATALOG.map((t) => {
          const live = t.status === 'live';
          const body = (
            <>
              <History className={`w-5 h-5 shrink-0 ${live ? 'text-primary-400' : 'text-content-disabled'}`} aria-hidden="true" />
              <span className="flex-1 min-w-0">
                <span className={`block text-body font-medium ${live ? 'text-content-primary' : 'text-content-muted'}`}>{t.title}</span>
                <span className="block text-caption text-content-muted mt-0.5">{live ? t.subtitle : 'Coming soon'}</span>
              </span>
            </>
          );
          return live ? (
            <button key={t.slug} type="button" onClick={() => navigate(t.to)}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-strong bg-base-850 hover:border-primary-500 text-left transition-colors">
              {body}
              <ChevronRight className="w-4 h-4 text-content-muted shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <div key={t.slug} className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-base-900 text-left">{body}</div>
          );
        })}
      </div>
      <h2 className="text-h3 font-semibold text-content-primary mt-8">Units by class</h2>
      <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
        {classes.map((c) => {
          const started = c.units.filter((u) => progress[u.slug]).length;
          const body = (
            <>
              <GraduationCap className={`w-5 h-5 shrink-0 ${c.ready ? 'text-primary-400' : 'text-content-disabled'}`} aria-hidden="true" />
              <span className="flex-1 min-w-0">
                {c.isMine && <span className="block text-caption text-content-muted">One of your subjects</span>}
                <span className={`block text-body font-medium ${c.ready ? 'text-content-primary' : 'text-content-muted'}`}>{c.subject}</span>
                <span className="block text-caption text-content-muted mt-0.5">
                  {c.ready
                    ? `${c.ready} ${c.ready === 1 ? 'unit' : 'units'} ready${c.units.length > c.ready ? ` of ${c.units.length}` : ''}${started ? ` · ${started} started` : ''}`
                    : 'Coming soon'}
                </span>
              </span>
            </>
          );
          return c.ready ? (
            <button key={c.id} type="button" onClick={() => navigate(`/study/${c.id}`)}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-strong bg-base-850 hover:border-primary-500 text-left transition-colors">
              {body}
              <ChevronRight className="w-4 h-4 text-content-muted shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <div key={c.id} className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-base-900 text-left">{body}</div>
          );
        })}
      </div>
      <a href="https://dmccreary.github.io/intelligent-textbooks/case-studies/" target="_blank" rel="noopener noreferrer"
        className="mt-6 flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-base-850 hover:border-content-muted transition-colors">
        <Library className="w-5 h-5 text-accent-400 shrink-0" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-body font-medium text-content-primary">Interactive textbooks for classes other than AP</span>
          <span className="block text-body-sm text-content-muted">
            Over a hundred free intelligent textbooks by Dan McCreary and others, from Algebra I to Ecology. Some of our packs build on them.
          </span>
        </span>
        <ExternalLink className="w-4 h-4 text-content-muted shrink-0" aria-hidden="true" />
      </a>
    </div>
  );
}
