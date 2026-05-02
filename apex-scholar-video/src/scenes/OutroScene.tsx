import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrandBackground } from "../brand/BrandBackground";
import { LogoMark, WordMark } from "../brand/Logo";

/**
 * Final beat — logo + wordmark + tagline + URL pill.
 *
 * Marketing intent: "this is real, this is free, this is where to go."
 * Logo lands first, name confirms it, then tagline, then URL — each beat
 * about 0.4s apart so the eye has time to read each level.
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Logo: scale-in with subtle bounce
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 130, mass: 0.6, stiffness: 110 },
    durationInFrames: 32,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Continuous gentle breathe — keeps the still frame feeling alive
  const breathe = 1 + Math.sin(frame / 30) * 0.012;

  const wordOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordY = interpolate(frame, [14, 28], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [28, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [28, 44], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [40, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlY = interpolate(frame, [40, 56], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlPulse =
    1 + (frame > 56 ? Math.sin((frame - 56) / 8) * 0.018 : 0);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <BrandBackground accent="mixed" />
      <AbsoluteFill className="items-center justify-center">
        <div className="flex flex-col items-center gap-7">
          <div
            style={{
              transform: `scale(${logoScale * breathe})`,
              opacity: logoOpacity,
            }}
          >
            <LogoMark size={180} />
          </div>

          <div
            style={{
              opacity: wordOpacity,
              transform: `translateY(${wordY}px)`,
            }}
          >
            <WordMark className="text-[96px] leading-none" />
          </div>

          <div
            className="font-body text-content-secondary text-[32px]"
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineY}px)`,
            }}
          >
            Your full AP season, on autopilot.
          </div>

          <div
            className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-primary-500/15 border border-primary-500/35"
            style={{
              opacity: urlOpacity,
              transform: `translateY(${urlY}px) scale(${urlPulse})`,
              boxShadow: "0 0 32px rgba(45, 212, 191, 0.25)",
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary-400" />
            <span className="font-display font-semibold text-primary-300 tracking-wide text-[26px]">
              apex-scholar.com
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
