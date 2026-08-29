import { useEffect, useState } from 'react';

/**
 * Live "how long until my AI request runs" for the current tab.
 *
 * Subscribes to the shared queue rather than counting down from a number
 * captured at render time — the wait moves in both directions: it grows when
 * another 429 extends the cooldown, and drops to zero the moment a call
 * succeeds. A one-way countdown would keep ticking toward a moment that had
 * already passed, or sit at zero while the queue was still parked.
 *
 * Returns seconds, or 0 when nothing is waiting.
 */
export default function useAIWait() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let off = () => {};
    let tick;
    let cancelled = false;

    // Dynamic import keeps the queue out of the eager bundle, matching how the
    // rest of the AI layer is loaded.
    import('../services/aiQueue').then((queue) => {
      if (cancelled) return;
      const read = () => setSeconds(queue.estimatedWaitSeconds());
      off = queue.subscribe(read);
      // The queue only publishes on state changes; this ticks the number down
      // between them so it visibly moves.
      tick = setInterval(read, 1000);
      read();
    });

    return () => {
      cancelled = true;
      off();
      clearInterval(tick);
    };
  }, []);

  return seconds;
}
