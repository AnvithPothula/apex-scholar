import { Easing, interpolate, spring } from "remotion";

/**
 * "Ease-out" style spring parameters — snappy but not bouncy.
 */
export const crispSpring = {
  damping: 200,
  mass: 0.5,
  stiffness: 100,
};

/**
 * Gentle spring for larger UI elements — a bit of overshoot.
 */
export const softSpring = {
  damping: 100,
  mass: 0.7,
  stiffness: 120,
};

/**
 * Fade + slide-up entrance normalized to [0,1].
 */
export const entrance = (frame: number, fps: number, delay = 0) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: crispSpring,
    durationInFrames: 25,
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, translateY, progress };
};

/**
 * Scene-level fade-in + fade-out for a clip of known duration.
 */
export const sceneFade = (
  frame: number,
  durationInFrames: number,
  fadeFrames = 10,
) => {
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );
  return Math.min(fadeIn, fadeOut);
};

/**
 * Scale-in from a slightly smaller size — great for cards.
 */
export const popIn = (frame: number, fps: number, delay = 0) => {
  const p = spring({
    frame: frame - delay,
    fps,
    config: softSpring,
    durationInFrames: 30,
  });
  return {
    opacity: interpolate(p, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    scale: interpolate(p, [0, 1], [0.9, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};
