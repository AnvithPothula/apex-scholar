import React, { useState, useRef, useCallback, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

const PANEL_W = 256; // w-64
const GAP = 8;       // breathing room from the trigger and the viewport edge

/**
 * Small "?" affordance that reveals a short explanation.
 *
 * Positioned with `fixed` and a measured, clamped left offset rather than a
 * static `absolute left-6`. The old version pinned a 256px panel 24px to the
 * right of the trigger, so on a phone (triggers sit around x=200 on a 375px
 * screen) the panel ran ~100px past the right edge and the text was simply
 * unreadable. Clamping to the viewport is the only placement that holds at
 * every width, and there are 13 of these on the Settings page alone.
 */
const HelpTooltip = ({ content, className = "" }) => {
  const [pos, setPos] = useState(null); // null = hidden
  const btnRef = useRef(null);

  const show = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(PANEL_W, window.innerWidth - GAP * 2);
    const left = Math.max(GAP, Math.min(r.left, window.innerWidth - width - GAP));
    // Flip above the trigger when there is no room below it.
    const below = r.bottom + GAP;
    const flipUp = below + 120 > window.innerHeight && r.top > 120;
    setPos({ left, width, top: flipUp ? undefined : below, bottom: flipUp ? window.innerHeight - r.top + GAP : undefined });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  // Escape closes it, and any scroll invalidates the measured position — a
  // fixed panel would otherwise hang in place while the page moved under it.
  useEffect(() => {
    if (!pos) return;
    const onKey = (e) => { if (e.key === 'Escape') hide(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [pos, hide]);

  return (
    <span className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        // p-1 -m-1 lifts the hit area from 16px to 24px (WCAG 2.5.8 minimum)
        // without moving anything around it.
        className={`p-1 -m-1 rounded text-content-muted hover:text-content-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-content-muted ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => (pos ? hide() : show())}
        aria-label="Help"
        aria-expanded={!!pos}
      >
        <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {pos && (
        <span
          role="tooltip"
          className="fixed z-50 p-3 bg-base-900 border border-border rounded-lg shadow-floating text-sm text-content-secondary block"
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width }}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default HelpTooltip;
