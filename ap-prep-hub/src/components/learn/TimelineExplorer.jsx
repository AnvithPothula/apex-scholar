import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, X, MessageCircle, BookOpen, Shuffle, Search } from 'lucide-react';
import geminiService, { RateLimitError } from '../../services/geminiService';
import { cedSearch } from '../../services/cedSearch';
import { loadHighlights, saveHighlights } from '../../services/packHighlights';
import { useAuth } from '../../contexts/AuthContext';
import useMobile from '../../hooks/useMobile';
import { subjectSlug } from '../../constants/subjects';
import { PACKS } from '../../data/packs';
import { pickQuizEvents } from '../../utils/timelineQuiz';
import MarkdownRenderer from '../MarkdownRenderer.jsx';
import TimelineOrder from '../study/TimelineOrder';

/**
 * Data-driven timeline for Learn: a decade grid on desktop, one scrolling
 * column on phones (the 6,400px grid was unusable there). Clicking an event
 * opens its AI study note beside the grid or right under the event; it used
 * to land below the tallest column, ~2,000px out of sight on a phone.
 *
 * Props: timeline = { id, title, subjectName, unitLabel?, cats, periods, unitRanges, unitColors, events }
 * AI notes go through geminiService (the proxy, or the student's Puter
 * model), grounded with CED snippets when available.
 */

// Per-session cache, keyed by timeline id so AP World/Euro can't collide.
const descCache = {};
const keyOf = (e) => `${e.period}|${e.text}`;
// Theme colours as tints of the theme's accent, so chips read in light and dark mode
// (the old fixed pastel backgrounds glared on the dark theme).
const tint = (ac, pct) => `color-mix(in srgb, ${ac} ${pct}%, transparent)`;
const chipCls = (on) => `px-2.5 py-1 rounded-md text-caption border transition-colors ${on
  ? 'bg-content-primary text-base-950 border-content-primary'
  : 'border-border-strong text-content-secondary hover:text-content-primary hover:border-content-muted'}`;

function EventChip({ event, cat, open, saved, onOpen, onToggleSave }) {
  return (
    <div className="flex items-start rounded-md border" style={{ borderColor: cat.ac, background: open ? tint(cat.ac, 38) : tint(cat.ac, 14) }}>
      <button type="button" onClick={onOpen} aria-expanded={open}
        className="flex-1 min-w-0 text-left px-2 py-1.5 text-body-sm leading-snug text-content-primary">
        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: cat.ac }} aria-hidden="true" />
        {event.text}
      </button>
      <button type="button" onClick={onToggleSave} aria-pressed={saved} aria-label={saved ? `Remove "${event.text}" from saved` : `Save "${event.text}"`}
        className="shrink-0 p-1.5 text-content-muted hover:text-content-primary">
        <Star className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} style={saved ? { color: cat.ac } : undefined} />
      </button>
    </div>
  );
}

export default function TimelineExplorer({ timeline }) {
  const { id: tlId, title, subjectName, unitLabel = 'Unit', cats: CATS, periods: PERIODS, unitRanges: UNIT_RANGES, unitColors: UNIT_COLORS, events: EVENTS } = timeline;
  const isMobile = useMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeUnit, setActiveUnit] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null); // { unit, events } | null
  const reqIdRef = useRef(0);

  const courseSlug = subjectSlug(subjectName);
  const unitName = (u) => `${unitLabel} ${u}`;
  const lessonFor = (u) => (courseSlug && PACKS[`${courseSlug}/unit-${u}`] ? `/study/${courseSlug}/unit-${u}` : null);
  const saveSlug = `timeline-${tlId}`;

  // Saved events use the same per-account store as Learn highlights.
  useEffect(() => {
    let live = true;
    loadHighlights(user?.uid, saveSlug).then((items) => { if (live) setSaved(new Set(items)); });
    return () => { live = false; };
  }, [user?.uid, saveSlug]);

  const toggleSave = (e) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(keyOf(e))) next.delete(keyOf(e)); else next.add(keyOf(e));
      saveHighlights(user?.uid, saveSlug, [...next]);
      return next;
    });
  };

  const catById = useMemo(() => Object.fromEntries(CATS.map((c) => [c.id, c])), [CATS]);
  const periodById = useMemo(() => Object.fromEntries(PERIODS.map((p) => [p.id, p])), [PERIODS]);
  const units = useMemo(() => Array.from(new Set(PERIODS.map((p) => p.unit))).sort((a, b) => a - b), [PERIODS]);

  const filtered = useMemo(() => EVENTS.filter((e) => {
    if (activeUnit && e.unit !== activeUnit) return false;
    if (activeCat && e.cat !== activeCat) return false;
    if (savedOnly && !saved.has(keyOf(e))) return false;
    if (search && !e.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [EVENTS, search, activeUnit, activeCat, savedOnly, saved]);

  const byPeriod = useMemo(() => {
    const m = {};
    for (const e of filtered) (m[e.period] = m[e.period] || []).push(e);
    return m;
  }, [filtered]);

  async function fetchDesc(event) {
    const cacheKey = `${tlId}||${event.text}||${event.cat}`;
    if (descCache[cacheKey]) { setDesc(descCache[cacheKey]); setLoading(false); return; }

    const myReq = ++reqIdRef.current;
    setDesc(''); setLoading(true);
    const cat = catById[event.cat];
    const period = periodById[event.period];

    // Best-effort CED grounding (non-blocking; cedSearch self-times-out).
    let cedBlock = '';
    try {
      const hits = await cedSearch(subjectName, event.text, { maxSnippets: 2 });
      if (hits && hits.length) {
        cedBlock = `\n\nCollege Board CED reference snippets (ground your answer in these; cite page numbers):\n${hits.map((h) => `- p.${h.page}: ${h.snippet}`).join('\n')}`;
      }
    } catch (_) { /* CED is optional */ }
    if (myReq !== reqIdRef.current) return; // a newer click superseded this one

    const prompt = `You are an expert ${subjectName} teacher. A student clicked this event on a study timeline:

Event: "${event.text}"
Time period: ${period?.label}
${unitName(event.unit)}: ${UNIT_RANGES[event.unit]}
Course theme: ${cat?.label} (${cat?.short})${cedBlock}

Write a concise study note (~150 words) as flowing prose — no headers, no bullet lists. Cover: what happened and key context, why it matters causally, how it connects to the theme above, and one AP exam angle (causation, continuity/change, comparison, or argumentation). Be direct and exam-focused.`;

    try {
      const resp = await geminiService.generateContent(prompt, { maxOutputTokens: 600, temperature: 0.6, task: 'tutorChat', usageCategory: 'timelineNote' });
      if (myReq !== reqIdRef.current) return;
      const text = String(resp || '').trim();
      setLoading(false);
      if (text) { setDesc(text); descCache[cacheKey] = text; } else setDesc('Could not load a study note. Please try again.');
    } catch (err) {
      if (myReq !== reqIdRef.current) return;
      setLoading(false);
      setDesc(err?.code === 'ai_usage_limit' ? err.message
        : err instanceof RateLimitError
        ? 'The AI is busy right now. Wait a moment and open the event again.'
        : 'Could not load a study note. Please try again.');
    }
  }

  function open(event) {
    if (selected === event) { close(); return; }
    setSelected(event);
    fetchDesc(event);
  }
  function close() {
    reqIdRef.current++; // invalidate any in-flight request
    setSelected(null); setDesc(''); setLoading(false);
  }
  const askTutor = (event) => navigate(courseSlug ? `/ai-tutors/${courseSlug}` : '/ai-tutors', {
    state: { prefill: `Tell me more about "${event.text}" (${periodById[event.period]?.label}) for ${subjectName}: the causes, the effects, and how it could come up on the exam.` },
  });
  const startQuiz = (u) => setQuiz({ unit: u, seed: Date.now(), events: pickQuizEvents(EVENTS, PERIODS, u) });

  function Note({ event }) {
    const cat = catById[event.cat];
    const lesson = lessonFor(event.unit);
    const isSaved = saved.has(keyOf(event));
    return (
      <div className="rounded-lg border bg-base-850 shadow-floating" style={{ borderColor: cat.ac }}>
        <div className="flex items-start gap-3 p-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-body font-semibold text-content-primary leading-snug">{event.text}</p>
            <p className="mt-1 text-caption text-content-muted">
              <span className="inline-block px-1.5 rounded-sm mr-1.5" style={{ background: tint(cat.ac, 22), color: 'var(--color-content-primary)' }}>{cat.label}</span>
              {unitName(event.unit)} · {periodById[event.period]?.label}
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close study note" className="shrink-0 p-1 text-content-muted hover:text-content-primary">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-3 text-body-sm leading-relaxed text-content-primary min-h-[3rem]" aria-live="polite">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-content-muted">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: cat.ac, borderTopColor: 'transparent' }} />
              Writing a study note…
            </span>
          ) : <MarkdownRenderer content={desc} />}
        </div>
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          <button type="button" onClick={() => toggleSave(event)} aria-pressed={isSaved} className={chipCls(isSaved)}>
            <Star className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.5} />{isSaved ? 'Saved' : 'Save'}
          </button>
          <button type="button" onClick={() => askTutor(event)} className={chipCls(false)}>
            <MessageCircle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={1.5} />Ask the tutor
          </button>
          {lesson && (
            <Link to={lesson} className={chipCls(false)}>
              <BookOpen className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={1.5} />{unitName(event.unit)} lessons
            </Link>
          )}
        </div>
      </div>
    );
  }

  const chip = (e) => (
    <EventChip key={keyOf(e)} event={e} cat={catById[e.cat]} open={selected === e} saved={saved.has(keyOf(e))}
      onOpen={() => open(e)} onToggleSave={() => toggleSave(e)} />
  );

  // A search, theme or Saved filter leaves most decades empty; show only the
  // ones with events instead of 46 mostly blank columns.
  const narrowed = !!(search || activeCat || savedOnly);
  const gridPeriods = narrowed ? PERIODS.filter((p) => byPeriod[p.id]) : PERIODS;
  // Consecutive decades sharing a unit, for the grid's unit band.
  const unitBands = [];
  gridPeriods.forEach((p, i) => {
    const last = unitBands[unitBands.length - 1];
    if (last && last.unit === p.unit) last.count++; else unitBands.push({ unit: p.unit, start: i, count: 1 });
  });
  const visibleUnits = activeUnit ? [activeUnit] : units;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 text-content-primary">
      {/* Controls */}
      <div className="space-y-2.5 pb-3 border-b border-border">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-h4 font-semibold">{title} Timeline</h1>
          <span className="text-caption text-content-muted">Open any event for an AI study note</span>
          <div className="flex-1" />
          <label className="relative">
            <span className="sr-only">Search events</span>
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" strokeWidth={1.5} aria-hidden="true" />
            <input type="search" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-7 pr-2 py-1.5 rounded-md bg-base-800 border border-border-strong text-body-sm text-content-primary placeholder:text-content-disabled" />
          </label>
          <span className="text-caption text-content-muted whitespace-nowrap" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'event' : 'events'}</span>
        </div>

        {isMobile ? (
          /* Phones: the 9 + 8 filter chips filled the first screen, so they're dropdowns here. */
          <div className="grid grid-cols-2 gap-2">
            <label className="text-caption text-content-muted">{unitLabel}
              <select value={activeUnit} onChange={(e) => { setActiveUnit(Number(e.target.value)); setQuiz(null); }}
                className="mt-1 w-full px-2 py-1.5 rounded-md bg-base-800 border border-border-strong text-body-sm text-content-primary">
                <option value={0}>All</option>
                {units.map((u) => <option key={u} value={u}>{unitName(u)} · {UNIT_RANGES[u]}</option>)}
              </select>
            </label>
            <label className="text-caption text-content-muted">Theme
              <select value={activeCat || ''} onChange={(e) => setActiveCat(e.target.value || null)}
                className="mt-1 w-full px-2 py-1.5 rounded-md bg-base-800 border border-border-strong text-body-sm text-content-primary">
                <option value="">All themes</option>
                {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <div className="col-span-2"><button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)} className={chipCls(savedOnly)}>
            <Star className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill={savedOnly ? 'currentColor' : 'none'} strokeWidth={1.5} />Saved ({saved.size})
          </button></div>
          </div>
        ) : (
          <>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Filter by ${unitLabel.toLowerCase()}`}>
          {[0, ...units].map((u) => (
            <button key={u} type="button" aria-pressed={activeUnit === u} onClick={() => { setActiveUnit(u); setQuiz(null); }} className={chipCls(activeUnit === u)}
              style={activeUnit === u && u ? { background: UNIT_COLORS[u], borderColor: UNIT_COLORS[u], color: '#fff' } : undefined}>
              {u === 0 ? 'All' : <>{unitName(u)} <span className="opacity-75">· {UNIT_RANGES[u]}</span></>}
            </button>
          ))}
        </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by theme">
          <button type="button" aria-pressed={activeCat === null} onClick={() => setActiveCat(null)} className={chipCls(activeCat === null)}>All themes</button>
          {CATS.map((c) => (
            <button key={c.id} type="button" aria-pressed={activeCat === c.id} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)} className={chipCls(activeCat === c.id)}
              style={activeCat === c.id ? { background: c.ac, borderColor: c.ac, color: '#fff' } : undefined}>
              <span className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ background: c.ac }} aria-hidden="true" />{c.label}
            </button>
          ))}
          <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)} className={chipCls(savedOnly)}>
            <Star className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill={savedOnly ? 'currentColor' : 'none'} strokeWidth={1.5} />Saved ({saved.size})
          </button>
        </div>
          </>
        )}

        {/* Study actions for the chosen unit */}
        <div className="flex flex-wrap items-center gap-2 text-body-sm">
          {activeUnit ? (
            <>
              <button type="button" onClick={() => startQuiz(activeUnit)} className="px-3 py-1.5 rounded-md bg-content-primary text-base-950 font-medium">
                Quiz me on {unitName(activeUnit)}
              </button>
              {lessonFor(activeUnit)
                ? <Link to={lessonFor(activeUnit)} className="underline text-primary-400">{unitName(activeUnit)} lessons in Learn</Link>
                : <span className="text-content-muted">{unitName(activeUnit)} lessons are coming soon</span>}
            </>
          ) : (
            <span className="text-caption text-content-muted">Pick a {unitLabel.toLowerCase()} to quiz yourself on its order of events.</span>
          )}
        </div>
      </div>

      {quiz && (
        <div className="mt-3">
          <TimelineOrder key={quiz.seed} title={`${unitName(quiz.unit)}: ${UNIT_RANGES[quiz.unit]}`} events={quiz.events}
            instruction="tap the events from earliest to latest (each is from a different decade)" />
          <div className="flex gap-2 -mt-2">
            <button type="button" onClick={() => startQuiz(quiz.unit)} className={chipCls(false)}><Shuffle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={1.5} />New set</button>
            <button type="button" onClick={() => setQuiz(null)} className={chipCls(false)}>Close quiz</button>
          </div>
        </div>
      )}

      {savedOnly && saved.size === 0 && (
        <p className="mt-4 text-body-sm text-content-muted">Nothing saved yet. Tap the star on any event to keep it here for review.</p>
      )}

      {isMobile ? (
        /* Phones: one column, unit then decade, each note opening right under its event. */
        <div className="mt-3 space-y-5">
          {visibleUnits.map((u) => {
            const ps = PERIODS.filter((p) => p.unit === u && byPeriod[p.id]);
            if (!ps.length) return null;
            return (
              <section key={u} aria-label={`${unitName(u)}, ${UNIT_RANGES[u]}`}>
                <div className="flex items-baseline justify-between gap-2 px-2 py-1.5 rounded-md text-white" style={{ background: UNIT_COLORS[u] }}>
                  <h2 className="text-body-sm font-semibold">{unitName(u)} · {UNIT_RANGES[u]}</h2>
                  {lessonFor(u) && <Link to={lessonFor(u)} className="text-caption underline text-white">Lessons</Link>}
                </div>
                {ps.map((p) => (
                  <div key={p.id} className="mt-2">
                    <h3 className="text-caption font-semibold text-content-secondary mb-1">{p.label}</h3>
                    <div className="space-y-1.5">
                      {byPeriod[p.id].map((e) => (
                        <React.Fragment key={keyOf(e)}>
                          {chip(e)}
                          {selected === e && <Note event={e} />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        /* Desktop: decade grid, with the note in a panel that stays in view. */
        <div className="mt-3 overflow-x-auto">
          <table className="border-collapse table-fixed" style={{ width: 168 * gridPeriods.length }}>
            <colgroup>{gridPeriods.map((p) => <col key={p.id} style={{ width: 168 }} />)}</colgroup>
            <thead>
              <tr>
                {unitBands.map((band) => {
                  const on = !activeUnit || activeUnit === band.unit;
                  return (
                    <th key={band.unit} colSpan={band.count} className="px-2 py-1 text-caption font-semibold text-left border-r border-border"
                      style={{ background: on ? UNIT_COLORS[band.unit] : 'var(--color-base-850)', color: on ? '#fff' : 'var(--color-content-muted)', opacity: on ? 1 : 0.5 }}>
                      {unitName(band.unit)} · {UNIT_RANGES[band.unit]}
                      {lessonFor(band.unit) && <Link to={lessonFor(band.unit)} className="ml-2 font-normal underline" style={{ color: 'inherit' }}>Lessons</Link>}
                    </th>
                  );
                })}
              </tr>
              <tr>
                {gridPeriods.map((p) => {
                  const on = !activeUnit || p.unit === activeUnit;
                  return (
                    <th key={p.id} className="px-1 py-1 text-caption font-medium text-center border-r border-b border-border whitespace-nowrap"
                      style={{ color: on ? 'var(--color-content-primary)' : 'var(--color-content-muted)', opacity: on ? 1 : 0.5 }}>{p.label}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {gridPeriods.map((p) => {
                  const on = !activeUnit || p.unit === activeUnit;
                  return (
                    <td key={p.id} className="align-top p-1 border-r border-border" style={{ opacity: on ? 1 : 0.3 }}>
                      <div className="space-y-1">{(byPeriod[p.id] || []).map(chip)}</div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!isMobile && selected && (
        <aside aria-label="Study note" className="fixed z-40 right-4 bottom-4 w-[min(30rem,calc(100vw-2rem))] max-h-[60vh] overflow-y-auto">
          <Note event={selected} />
        </aside>
      )}
    </div>
  );
}
