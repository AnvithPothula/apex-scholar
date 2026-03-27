import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Animated number counter that counts up when it enters the viewport.
 *
 * Props:
 *   value     — target number
 *   duration  — animation duration in ms (default 800)
 *   prefix    — string before the number (e.g. "$")
 *   suffix    — string after the number (e.g. "%", "/100")
 *   decimals  — decimal places (default 0)
 *   className — text styling
 */
export default function AnimatedCounter({
  value = 0,
  duration = 800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const start = 0;
    const end = Number(value);
    if (start === end) { setDisplay(end); return; }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}
