import { useEffect, useRef } from 'react';

/**
 * Jump to the top when a step changes inside one page (next review card, next
 * diagnostic question, entering study mode). Route changes are handled by
 * AnimatedOutlet; these aren't route changes, so the old scroll offset hid the
 * new step's header. Skips the first render.
 */
export default function useScrollTopOn(...deps) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
