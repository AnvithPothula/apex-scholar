import { useState, useEffect } from 'react';

/**
 * useMobile — Reactive viewport width hook for responsive layouts.
 *
 * @param {number} breakpoint — Width threshold in px (default 768 = Tailwind md)
 * @returns {boolean} — true when viewport is below the breakpoint
 *
 * Usage:
 *   const isMobile = useMobile();        // true when < 768px
 *   const isSmall = useMobile(640);      // true when < 640px (Tailwind sm)
 */
export default function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);

    // Set initial value from media query (more reliable than innerWidth)
    setIsMobile(mql.matches);

    // Modern API — addEventListener works in all modern browsers
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
