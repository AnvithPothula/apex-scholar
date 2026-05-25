import React, { useState, useMemo, useRef } from 'react';
import geminiService, { RateLimitError } from '../../services/geminiService';
import { cedSearch } from '../../services/cedSearch';
import MarkdownRenderer from '../MarkdownRenderer.jsx';

/**
 * Generic, data-driven timeline explorer used by the Learn hub.
 *
 * Props:
 *   timeline = { id, title, subjectName, cats, periods, unitRanges, unitColors, events }
 *
 * Styling uses Apex design tokens (base / content / border CSS vars) so it
 * inherits light/dark theming. AI descriptions go through the app's geminiService
 * (Puter then Gemini fallback), grounded with CED snippets when available.
 */

const CW = 140;
// Per-session cache, keyed by timeline id so AP World/Euro can't collide.
const descCache = {};

export default function TimelineExplorer({ timeline }) {
  const { id: tlId, title, subjectName, cats: CATS, periods: PERIODS, unitRanges: UNIT_RANGES, unitColors: UNIT_COLORS, events: EVENTS } = timeline;

  const [search, setSearch] = useState('');
  const [activeUnit, setActiveUnit] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [selected, setSelected] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const reqIdRef = useRef(0);

  const catById = useMemo(() => Object.fromEntries(CATS.map(c => [c.id, c])), [CATS]);
  // Units present in this timeline's data (works for any subject's unit count).
  const units = useMemo(
    () => Array.from(new Set(PERIODS.map(p => p.unit))).sort((a, b) => a - b),
    [PERIODS]
  );

  const filtered = useMemo(() => EVENTS.filter(e => {
    if (activeUnit && e.unit !== activeUnit) return false;
    if (activeCat && e.cat !== activeCat) return false;
    if (search && !e.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [EVENTS, search, activeUnit, activeCat]);

  const byPeriod = useMemo(() => {
    const m = {};
    for (const e of filtered) {
      if (!m[e.period]) m[e.period] = [];
      m[e.period].push(e);
    }
    return m;
  }, [filtered]);

  async function fetchDesc(event) {
    const cacheKey = `${tlId}||${event.text}||${event.cat}`;
    if (descCache[cacheKey]) { setDesc(descCache[cacheKey]); setLoading(false); return; }

    const myReq = ++reqIdRef.current;
    setDesc(''); setLoading(true);

    const cat = catById[event.cat];
    const period = PERIODS.find(p => p.id === event.period);

    // Best-effort CED grounding (non-blocking; cedSearch self-times-out).
    let cedBlock = '';
    try {
      const hits = await cedSearch(subjectName, event.text, { maxSnippets: 2 });
      if (hits && hits.length) {
        cedBlock = `\n\nCollege Board CED reference snippets (ground your answer in these; cite page numbers):\n${hits.map(h => `- p.${h.page}: ${h.snippet}`).join('\n')}`;
      }
    } catch (_) { /* CED is optional */ }

    if (myReq !== reqIdRef.current) return; // a newer click superseded this one

    const prompt = `You are an expert AP ${subjectName} teacher. A student clicked this event on a study timeline:

Event: "${event.text}"
Time period: ${period?.label}
Unit ${event.unit}: ${UNIT_RANGES[event.unit]}
APUSH theme: ${cat?.label} (${cat?.short})${cedBlock}

Write a concise study note (~150 words) as flowing prose — no headers, no bullet lists. Cover: what happened and key context, why it matters causally, how it connects to the theme above, and one AP exam angle (causation, continuity/change, comparison, or argumentation). Be direct and exam-focused.`;

    try {
      const resp = await geminiService.generateContent(prompt, { maxOutputTokens: 600, temperature: 0.6 });
      if (myReq !== reqIdRef.current) return;
      const text = String(resp || '').trim();
      setLoading(false);
      if (text) {
        setDesc(text);
        descCache[cacheKey] = text;
      } else {
        setDesc('Could not load a description. Please try again.');
      }
    } catch (err) {
      if (myReq !== reqIdRef.current) return;
      setLoading(false);
      setDesc(
        err instanceof RateLimitError
          ? 'The AI is busy right now (rate limited). Wait a moment and click the event again.'
          : 'Could not load a description. Please try again.'
      );
    }
  }

  function handleSelect(event) {
    if (selected === event) { setSelected(null); setDesc(''); return; }
    setSelected(event);
    fetchDesc(event);
  }

  function handleClose() {
    reqIdRef.current++; // invalidate any in-flight request
    setSelected(null); setDesc(''); setLoading(false);
  }

  const sel = selected ? catById[selected.cat] : null;

  // Apex design tokens (theme-aware via [data-theme]).
  const bg = 'var(--color-base-950)';
  const bgSec = 'var(--color-base-850)';
  const bdr = '0.5px solid var(--color-border)';
  const bdrSec = '0.5px solid var(--color-border-strong)';
  const txPri = 'var(--color-content-primary)';
  const txSec = 'var(--color-content-secondary)';
  const txMut = 'var(--color-content-muted)';

  // Unit band spans: consecutive periods sharing a unit.
  const unitBands = [];
  let cur = null;
  for (let i = 0; i < PERIODS.length; i++) {
    const u = PERIODS[i].unit;
    if (!cur || cur.unit !== u) { cur = { unit: u, start: i, count: 1 }; unitBands.push(cur); }
    else cur.count++;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4" style={{ fontSize: 12, color: txPri }}>
      {/* Controls */}
      <div style={{ paddingBottom: 8, borderBottom: bdr }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: txPri }}>{title} Timeline</span>
          <span style={{ fontSize: 11, color: txMut }}>Click any event for an AI study note</span>
          <div style={{ flex: 1 }} />
          <input
            type="text" placeholder="Search events…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: 180, fontSize: 11, padding: '5px 8px', borderRadius: 4,
              background: 'var(--color-base-800)', color: txPri,
              border: '0.5px solid var(--color-border-strong)', outline: 'none',
            }}
          />
          <span style={{ fontSize: 11, color: txMut, whiteSpace: 'nowrap' }}>{filtered.length} events</span>
        </div>

        {/* Unit filter */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
          {[0, ...units].map(u => (
            <button key={u} onClick={() => setActiveUnit(u)} style={{
              padding: '3px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
              background: activeUnit === u ? (u === 0 ? 'var(--color-base-750)' : UNIT_COLORS[u]) : 'transparent',
              color: activeUnit === u ? '#fff' : txSec,
              border: activeUnit === u ? `0.5px solid ${u === 0 ? 'var(--color-base-750)' : UNIT_COLORS[u]}` : bdrSec,
              fontWeight: activeUnit === u ? 500 : 400,
            }}>{u === 0 ? 'All units' : `U${u}: ${UNIT_RANGES[u]}`}</button>
          ))}
        </div>

        {/* Theme filter */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveCat(null)} style={{
            padding: '3px 7px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
            background: activeCat === null ? bgSec : 'transparent', color: txSec, border: bdrSec,
          }}>All themes</button>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)} style={{
              padding: '3px 7px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
              background: activeCat === c.id ? c.ac : 'transparent',
              color: activeCat === c.id ? '#fff' : txSec,
              border: activeCat === c.id ? `0.5px solid ${c.ac}` : bdrSec,
              fontWeight: activeCat === c.id ? 500 : 400,
            }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: activeCat === c.id ? 'rgba(255,255,255,0.5)' : c.ac, marginRight: 4, verticalAlign: 'middle' }} />
              {c.short}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline grid */}
      <div style={{ overflowX: 'auto', width: '100%', marginTop: 8 }}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: CW * PERIODS.length }}>
          <colgroup>{PERIODS.map(p => <col key={p.id} style={{ width: CW }} />)}</colgroup>
          <thead>
            <tr>
              {unitBands.map(band => {
                const isActive = activeUnit === 0 || activeUnit === band.unit;
                return (
                  <th key={band.unit} colSpan={band.count} style={{
                    padding: '4px 6px', textAlign: 'center',
                    background: isActive ? UNIT_COLORS[band.unit] : bgSec,
                    color: isActive ? '#fff' : txMut,
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.03em',
                    borderRight: bdr, borderBottom: 'none', opacity: isActive ? 1 : 0.4,
                  }}>
                    Unit {band.unit} · {UNIT_RANGES[band.unit]}
                  </th>
                );
              })}
            </tr>
            <tr>
              {PERIODS.map((p, i) => {
                const isActive = activeUnit === 0 || p.unit === activeUnit;
                return (
                  <th key={p.id} style={{
                    background: isActive ? bg : bgSec,
                    borderBottom: bdrSec, borderRight: i < PERIODS.length - 1 ? bdr : 'none',
                    padding: '4px 4px', textAlign: 'center', fontSize: 10, fontWeight: 500,
                    color: isActive ? txPri : txMut, whiteSpace: 'nowrap', opacity: isActive ? 1 : 0.4,
                  }}>{p.label}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {PERIODS.map((p, i) => {
                const evs = byPeriod[p.id] || [];
                const isActive = activeUnit === 0 || p.unit === activeUnit;
                return (
                  <td key={p.id} style={{
                    verticalAlign: 'top',
                    background: isActive ? 'transparent' : bgSec,
                    borderRight: i < PERIODS.length - 1 ? bdr : 'none',
                    borderBottom: bdr, padding: '4px 3px', opacity: isActive ? 1 : 0.3,
                  }}>
                    {evs.map((e, j) => {
                      const cat = catById[e.cat];
                      const isSel = selected === e;
                      return (
                        <div key={j} onClick={() => handleSelect(e)} title={cat.label} style={{
                          background: isSel ? cat.ac : cat.bg,
                          color: isSel ? '#fff' : cat.tx,
                          border: `0.5px solid ${cat.ac}`,
                          borderRadius: 3, padding: '2px 4px', marginBottom: 3,
                          fontSize: 10, lineHeight: 1.35, cursor: 'pointer',
                          fontWeight: isSel ? 500 : 400, position: 'relative',
                        }}>
                          <span style={{
                            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                            background: isSel ? 'rgba(255,255,255,0.7)' : cat.ac,
                            marginRight: 4, verticalAlign: 'middle', flexShrink: 0,
                          }} />
                          {e.text}
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && sel && (
        <div style={{ borderTop: `3px solid ${sel.ac}`, background: bg, marginTop: 12, borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px 6px' }}>
            <div style={{ background: sel.ac, color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 600, flexShrink: 0, lineHeight: 1.5, textAlign: 'center', minWidth: 52 }}>
              {sel.short}<br /><span style={{ fontSize: 9, fontWeight: 400, opacity: 0.85 }}>Unit {selected.unit}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, lineHeight: 1.4, color: txPri }}>{selected.text}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, background: sel.bg, color: sel.tx, border: `0.5px solid ${sel.ac}`, borderRadius: 3, padding: '1px 6px' }}>{sel.label}</span>
                <span style={{ fontSize: 11, color: txSec }}>Unit {selected.unit}: {UNIT_RANGES[selected.unit]}</span>
                <span style={{ fontSize: 11, color: txSec }}>· {PERIODS.find(p => p.id === selected.period)?.label}</span>
              </div>
            </div>
            <button onClick={handleClose} style={{
              flexShrink: 0, padding: '5px 14px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
              background: 'var(--color-base-800)', color: txSec, border: bdrSec,
            }}>✕ Close</button>
          </div>
          <div style={{ padding: '6px 16px 16px', minHeight: 60 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: txMut, fontSize: 12, paddingTop: 4 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: `2px solid ${sel.ac}`, borderTopColor: 'transparent', animation: 'tl-spin 0.7s linear infinite' }} />
                Generating study note…
              </div>
            ) : (
              <div style={{ fontSize: 13, lineHeight: 1.7, color: txPri }}>
                <MarkdownRenderer content={desc} />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes tl-spin{to{transform:rotate(360deg)}}`}</style>

      {/* Legend */}
      <div style={{ padding: '10px 0 2px', borderTop: bdr, marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: txMut, fontWeight: 500 }}>Themes:</span>
        {CATS.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: txSec }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `1.5px solid ${c.ac}` }} />
            <span>{c.short} — {c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
