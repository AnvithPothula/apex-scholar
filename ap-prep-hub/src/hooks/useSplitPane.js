import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Draggable split ratio for a two-pane layout.
 *
 * Returns the left pane's width as a percentage plus the handlers for a divider.
 * The ratio persists in localStorage, because a student who widens the passage
 * pane means it for the whole test, not just one question.
 *
 * Pointer events (not mouse events) so a trackpad, a mouse and a stylus all
 * work identically, and setPointerCapture keeps the drag alive when the cursor
 * outruns the 6px handle — without it the divider drops the moment you move
 * fast, which feels broken.
 */
const MIN_PCT = 25;
const MAX_PCT = 75;

export default function useSplitPane(storageKey = 'apex_split_pct', defaultPct = 50) {
  const [pct, setPct] = useState(() => {
    try {
      const saved = parseFloat(localStorage.getItem(storageKey));
      return Number.isFinite(saved) && saved >= MIN_PCT && saved <= MAX_PCT ? saved : defaultPct;
    } catch {
      return defaultPct;
    }
  });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(storageKey, String(pct)); } catch { /* private mode */ }
  }, [pct, storageKey]);

  const applyFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(MAX_PCT, Math.max(MIN_PCT, next)));
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    applyFromClientX(e.clientX);
  }, [dragging, applyFromClientX]);

  const onPointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  }, []);

  // Keyboard access: the divider is a real separator control, so arrows move it
  // and Home/End snap. A mouse-only divider is unusable with a keyboard.
  const onKeyDown = useCallback((e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPct((p) => Math.max(MIN_PCT, p - step)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setPct((p) => Math.min(MAX_PCT, p + step)); }
    else if (e.key === 'Home') { e.preventDefault(); setPct(MIN_PCT); }
    else if (e.key === 'End') { e.preventDefault(); setPct(MAX_PCT); }
    else if (e.key === 'Enter') { e.preventDefault(); setPct(defaultPct); }
  }, [defaultPct]);

  const reset = useCallback(() => setPct(defaultPct), [defaultPct]);

  return {
    pct,
    dragging,
    containerRef,
    reset,
    dividerProps: {
      role: 'separator',
      'aria-orientation': 'vertical',
      'aria-valuenow': Math.round(pct),
      'aria-valuemin': MIN_PCT,
      'aria-valuemax': MAX_PCT,
      'aria-label': 'Resize source and question panes',
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
      onDoubleClick: reset,
    },
  };
}

export { MIN_PCT, MAX_PCT };
