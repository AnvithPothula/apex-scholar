import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircleQuestion, Sparkles, Copy, Check, X, Send, Eraser } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HL_COLORS, textMap, anchorFromRange, rangeFromAnchor, loadHighlights, saveHighlights } from '../../services/packHighlights';
import MarkdownRenderer from '../MarkdownRenderer';
import { buildSelectionPrompt, usableQuote, snapToWords, EXPLAIN_QUESTION } from '../../utils/askSelection';
import { looksLikeReasoningLeak } from '../../utils/whyWrong';
import { retryAfterFrom, formatWait } from '../../services/aiRetry';
import { trackEvent } from '../../utils/analytics';

const HL = 'apex-ask';
// Swatch colours match the ::highlight(apex-hl-*) rules in index.css.
const SWATCH = { yellow: 'rgb(250 204 21)', blue: 'rgb(96 165 250)', green: 'rgb(74 222 128)', red: 'rgb(248 113 113)' };
const canHighlight = () => typeof window !== 'undefined' && window.CSS && CSS.highlights && typeof window.Highlight === 'function';

/**
 * Highlight anything in a study pack and ask about it, answered in place.
 *
 * Replaces the device's own selection menu: when a selection ends inside the
 * pack, the range is re-drawn with the CSS Custom Highlight API and the native
 * selection is cleared, which dismisses the system copy/look-up bar, and our
 * menu (Ask, Explain, Copy) appears instead. Right-click and long-press
 * context menus are suppressed inside the pack. Browsers without the Highlight
 * API keep the native selection, so the passage stays visible either way.
 *
 * Answers come back in a side panel (a bottom sheet on phones) that keeps the
 * thread for follow-ups. It never navigates to the tutor.
 *
 * The same menu saves highlights in four colours (services/packHighlights).
 * Tapping a saved highlight reopens the menu to recolour or remove it.
 */
export default function SelectionAsk({ slug, subject, unit, children }) {
  const { user } = useAuth();
  const uid = user?.uid || null;
  const [marks, setMarks] = useState([]); // saved highlights: { id, color, quote, prefix, suffix }
  const painted = useRef([]); // { id, range } for what's on the page now
  const zone = useRef(null);
  const input = useRef(null);
  const thread = useRef(null);
  const [menu, setMenu] = useState(null);   // { quote, context, section, x, y }
  const [chat, setChat] = useState(null);   // { quote, context, section, turns: [{ question, answer, error, loading }] }
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const lastPointer = useRef('mouse');
  const openedAt = useRef(0);

  // Keep the newest question and answer in view.
  useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [chat]);

  const clearHighlight = useCallback(() => { if (canHighlight()) CSS.highlights.delete(HL); }, []);

  const openAt = useCallback((range, extra) => {
    openedAt.current = Date.now();
    const rect = range.getBoundingClientRect();
    const el = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    // The menu is two rows on phones, so it always opens below there.
    const above = lastPointer.current !== 'touch' && rect.top > 150 && window.innerWidth >= 640;
    setCopied(false);
    setMenu({
      quote: range.toString().trim(),
      context: el?.closest('p, li, td, th, blockquote, div')?.textContent || '',
      section: el?.closest('section')?.querySelector('h2')?.textContent || '',
      x: rect.left + rect.width / 2 + window.scrollX,
      y: above ? rect.top + window.scrollY - 46 : rect.bottom + window.scrollY + 8,
      ...extra,
    });
  }, []);

  // A tap with no selection: if it lands on a saved highlight, offer recolour/remove.
  const hitTest = useCallback((pt) => {
    if (!pt || pt.target?.closest?.('button, a, input, select, textarea, label, [role="button"]')) return;
    let node; let offset;
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(pt.x, pt.y);
      if (!p) return;
      node = p.offsetNode; offset = p.offset;
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(pt.x, pt.y);
      if (!r) return;
      node = r.startContainer; offset = r.startOffset;
    } else return;
    const hit = painted.current.find((p) => { try { return p.range.isPointInRange(node, offset); } catch { return false; } });
    if (hit) openAt(hit.range, { hlId: hit.id });
  }, [openAt]);

  const capture = useCallback((pt) => {
    const s = window.getSelection();
    if (!zone.current) return;
    if (!s || s.isCollapsed || !s.rangeCount) {
      // A double or triple click sends more mouse-ups after the menu opened
      // (and the selection was cleared); those aren't taps on a highlight.
      if (Date.now() - openedAt.current > 400) hitTest(pt);
      return;
    }
    const range = snapToWords(s.getRangeAt(0).cloneRange());
    if (!zone.current.contains(range.commonAncestorContainer)) return;
    if (!usableQuote(range.toString())) return;
    if (canHighlight()) {
      CSS.highlights.set(HL, new window.Highlight(range.cloneRange()));
      s.removeAllRanges(); // dismisses the device's own selection menu
    }
    // openAt puts the menu above the selection with a mouse (so it doesn't
    // cover the next lines you might select) and below it on touch, where the
    // system bar, if any, sits above; below as well when there's no room above.
    // Selecting inside a saved highlight edits that highlight instead of stacking a new one.
    const inside = painted.current.find((p) => {
      try {
        return p.range.compareBoundaryPoints(Range.START_TO_START, range) <= 0
          && p.range.compareBoundaryPoints(Range.END_TO_END, range) >= 0;
      } catch { return false; }
    });
    openAt(range, inside ? { hlId: inside.id } : { range: range.cloneRange() });
  }, [hitTest, openAt]);

  useEffect(() => {
    let live = true;
    loadHighlights(uid, slug).then((m) => { if (live) setMarks(m); });
    return () => { live = false; };
  }, [uid, slug]);

  // Paint saved highlights, and repaint whenever the unit's content changes
  // (sections opening, answers revealed): anchors are re-found in the text.
  const paint = useCallback(() => {
    if (!canHighlight() || !zone.current) return;
    const map = textMap(zone.current);
    const byColor = Object.fromEntries(HL_COLORS.map((c) => [c, []]));
    painted.current = [];
    marks.forEach((m) => {
      const r = rangeFromAnchor(zone.current, m, map);
      if (r && byColor[m.color]) { byColor[m.color].push(r); painted.current.push({ id: m.id, range: r }); }
    });
    HL_COLORS.forEach((c) => CSS.highlights.set(`apex-hl-${c}`, new window.Highlight(...byColor[c])));
  }, [marks]);

  useEffect(() => {
    paint();
    if (!zone.current) return undefined;
    let t;
    const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(paint, 120); });
    obs.observe(zone.current, { childList: true, subtree: true, characterData: true });
    return () => { obs.disconnect(); clearTimeout(t); };
  }, [paint]);

  useEffect(() => () => { if (canHighlight()) HL_COLORS.forEach((c) => CSS.highlights.delete(`apex-hl-${c}`)); }, []);

  useEffect(() => {
    const inZone = (t) => zone.current && t instanceof Node && zone.current.contains(t);
    const onPointer = (e) => { lastPointer.current = e.pointerType || 'mouse'; };
    const onMouseUp = (e) => { if (inZone(e.target)) setTimeout(() => capture({ x: e.clientX, y: e.clientY, target: e.target }), 0); };
    // iOS and Android settle the selection a moment after the finger lifts.
    const onTouchEnd = (e) => {
      const t = e.changedTouches?.[0];
      if (inZone(e.target)) setTimeout(() => capture(t && { x: t.clientX, y: t.clientY, target: e.target }), 350);
    };
    const onKeyUp = (e) => { if (e.shiftKey && inZone(document.activeElement || e.target)) capture(); if (e.key === 'Escape') { setMenu(null); setChat(null); clearHighlight(); } };
    const onContext = (e) => {
      if (!inZone(e.target)) return;
      e.preventDefault(); // no device/browser context menu inside the pack
      capture();
    };
    const onSelChange = () => {
      const s = window.getSelection();
      // A new selection is starting: drop the old menu and highlight.
      if (s && !s.isCollapsed && zone.current?.contains(s.anchorNode)) { setMenu(null); clearHighlight(); }
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('selectionchange', onSelChange);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('selectionchange', onSelChange);
      clearHighlight();
    };
  }, [capture, clearHighlight]);

  // Clicking anywhere else closes the menu (and the highlight, unless a chat is open about it).
  useEffect(() => {
    if (!menu) return undefined;
    const onDown = (e) => {
      if (e.target.closest?.('[data-ask-menu]')) return;
      setMenu(null);
      if (!chat) clearHighlight();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menu, chat, clearHighlight]);

  const ask = async (question, base) => {
    const thread = base || chat;
    if (!thread || !question.trim()) return;
    const turns = [...thread.turns, { question: question.trim(), loading: true }];
    const next = { ...thread, turns };
    setChat(next);
    setDraft('');
    trackEvent('pack_ask', { subject, kind: question === EXPLAIN_QUESTION ? 'explain' : 'ask' });
    let answer = null; let error = null;
    try {
      const { default: geminiService } = await import('../../services/geminiService');
      const prompt = buildSelectionPrompt({
        subject, unit, section: thread.section, quote: thread.quote, context: thread.context, question,
        history: thread.turns.filter((t) => t.answer).map((t) => ({ question: t.question, answer: t.answer })),
      });
      // tutorChat: the one task the AI proxy allows for signed-out students too.
      const text = String(await geminiService.generateContent(prompt, { temperature: 0.4, maxTokens: 900, task: 'tutorChat', usageCategory: 'ask' }) || '').trim();
      if (!text || looksLikeReasoningLeak(text)) error = 'That answer came back garbled. Ask again; it usually works on the second try.';
      else answer = text;
    } catch (e) {
      const wait = retryAfterFrom(e);
      error = e?.code === 'ai_usage_limit' ? e.message
        : wait !== null ? `The AI is busy (everyone shares the same free capacity). Try again in ${formatWait(wait)}.`
          : 'Couldn\'t reach the AI just now. Try again in a moment.';
    }
    setChat((c) => (c && c.quote === thread.quote
      ? { ...c, turns: c.turns.map((t, i) => (i === turns.length - 1 ? { question: t.question, answer, error } : t)) }
      : c));
  };

  const open = (explain) => {
    const thread = { quote: menu.quote, context: menu.context, section: menu.section, turns: [] };
    setChat(thread);
    setMenu(null);
    if (explain) ask(EXPLAIN_QUESTION, thread);
    else setTimeout(() => input.current?.focus(), 50);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(menu.quote); setCopied(true); setTimeout(() => setMenu(null), 700); } catch { setCopied(false); }
  };

  const persist = (next) => { setMarks(next); saveHighlights(uid, slug, next); };
  const mark = (color) => {
    if (menu.hlId) persist(marks.map((m) => (m.id === menu.hlId ? { ...m, color } : m)));
    else if (menu.range && zone.current) {
      const anchor = anchorFromRange(zone.current, menu.range);
      if (anchor.quote.trim()) persist([...marks, { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, color, ...anchor }]);
    }
    trackEvent('pack_highlight', { subject, color });
    setMenu(null);
    if (!chat) clearHighlight();
  };
  const unmark = () => { persist(marks.filter((m) => m.id !== menu.hlId)); setMenu(null); };

  const close = () => { setChat(null); clearHighlight(); };
  const busy = chat?.turns.some((t) => t.loading);
  const menuW = Math.min(500, window.innerWidth - 16);
  const menuLeft = menu ? Math.min(Math.max(menu.x - menuW / 2, window.scrollX + 8), window.scrollX + window.innerWidth - menuW - 8) : 0;

  return (
    <div ref={zone} className="apex-ask-zone">
      {children}
      {menu && createPortal(
        <div data-ask-menu role="toolbar" aria-label="Selected text"
          className="absolute z-[60] flex flex-wrap items-center gap-1 p-1 rounded-lg border border-border-strong bg-base-800 shadow-floating"
          style={{ top: menu.y, left: menuLeft, maxWidth: menuW }}
          onMouseDown={(e) => e.preventDefault()}>
          <button type="button" onClick={() => open(false)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-body-sm text-content-primary hover:bg-base-750">
            <MessageCircleQuestion className="w-4 h-4 text-primary-400" aria-hidden="true" />Ask
          </button>
          <button type="button" onClick={() => open(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-body-sm text-content-primary hover:bg-base-750">
            <Sparkles className="w-4 h-4 text-primary-400" aria-hidden="true" />Explain
          </button>
          <button type="button" onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-body-sm text-content-primary hover:bg-base-750">
            {copied ? <Check className="w-4 h-4 text-success-400" aria-hidden="true" /> : <Copy className="w-4 h-4 text-content-muted" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <span className="hidden sm:block w-px h-6 bg-border-strong mx-0.5" aria-hidden="true" />
          <div className="flex items-center gap-1 basis-full sm:basis-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
          {HL_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => mark(c)} aria-label={`Highlight ${c}`} title={`Highlight ${c}`}
              className="p-1.5 rounded-md hover:bg-base-750">
              <span className="block w-4 h-4 rounded-full ring-1 ring-black/20" style={{ background: SWATCH[c] }} />
            </button>
          ))}
          {menu.hlId && (
            <button type="button" onClick={unmark} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-body-sm text-content-primary hover:bg-base-750">
              <Eraser className="w-4 h-4 text-content-muted" aria-hidden="true" />Remove
            </button>
          )}
          </div>
        </div>,
        document.body,
      )}
      {chat && createPortal(
        <div data-ask-menu role="dialog" aria-label="Ask about the highlighted text"
          className="fixed z-[60] inset-x-0 bottom-16 md:bottom-4 md:left-auto md:right-4 md:w-[26rem] max-h-[70vh] flex flex-col rounded-t-xl md:rounded-xl border border-border-strong bg-base-850 shadow-floating">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border-subtle">
            <span className="text-body-sm font-semibold text-content-primary">Ask about this</span>
            <button type="button" onClick={close} aria-label="Close" className="text-content-muted hover:text-content-primary"><X className="w-4 h-4" /></button>
          </div>
          <div ref={thread} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
            <blockquote className="border-l-2 border-primary-500 pl-3 text-body-sm text-content-secondary line-clamp-4">{chat.quote}</blockquote>
            {chat.turns.map((t, i) => (
              <div key={i} className="space-y-2">
                <p className="ml-auto max-w-[85%] w-fit px-3 py-2 rounded-lg bg-base-750 text-body-sm text-content-primary">{t.question}</p>
                {t.loading && <p className="text-body-sm text-content-muted animate-pulse">Thinking…</p>}
                {t.answer && <MarkdownRenderer content={t.answer} className="text-body-sm text-content-secondary" />}
                {t.error && <p className="text-body-sm text-warning-400">{t.error}</p>}
              </div>
            ))}
            {!chat.turns.length && <p className="text-caption text-content-muted">Ask anything about the highlighted text. Your answer appears right here.</p>}
          </div>
          <form className="flex items-end gap-2 p-3 border-t border-border-subtle" onSubmit={(e) => { e.preventDefault(); if (!busy) ask(draft); }}>
            <textarea ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} rows={1}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!busy) ask(draft); } }}
              placeholder={chat.turns.length ? 'Ask a follow-up…' : 'What do you want to know?'} aria-label="Your question"
              className="flex-1 resize-none max-h-24 p-2 rounded-md bg-base-800 border border-border text-body-sm text-content-primary placeholder:text-content-disabled" />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Send"
              className="p-2 rounded-md bg-primary-500 text-base-950 disabled:opacity-40"><Send className="w-4 h-4" /></button>
          </form>
        </div>,
        document.body,
      )}
    </div>
  );
}
