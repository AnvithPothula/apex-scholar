/**
 * Shared animation variants and constants for Framer Motion.
 * Import these instead of defining inline variants per component.
 */

// Signature easing — fast start, smooth settle (ease-out-expo)
export const easeOutExpo = [0.22, 1, 0.36, 1];

// ── Page transitions ──────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOutExpo } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

// ── Staggered list containers ─────────────────────────────────
export const staggerContainer = (staggerMs = 0.06) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerMs },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOutExpo },
  },
};

// ── Answer feedback ───────────────────────────────────────────
export const shakeWrong = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const popCorrect = {
  scale: [1, 1.08, 1],
  transition: { duration: 0.3, ease: easeOutExpo },
};

// ── Modal / overlay ───────────────────────────────────────────
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: easeOutExpo } },
  exit: { opacity: 0, scale: 0.97, y: 5, transition: { duration: 0.12 } },
};

// ── Celebration / confetti ────────────────────────────────────
export const celebrationPop = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

// ── Card hover ────────────────────────────────────────────────
export const cardHover = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2, ease: easeOutExpo },
};

export const cardTap = {
  scale: 0.98,
};

// ── Inline form validation ───────────────────────────────────
export const inputShake = {
  x: [0, -6, 5, -4, 3, -2, 1, 0],
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const checkmarkPop = {
  scale: [0, 1.2, 1],
  opacity: [0, 1, 1],
  transition: { duration: 0.3, ease: easeOutExpo },
};

// ── Layout reorder ───────────────────────────────────────────
export const layoutTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};
