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
 * Final beat — logo + wordmark + URL-style tag.
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 150, mass: 0.6, stiffness: 110 },
    durationInFrames: 30,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wordOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordY = interpolate(frame, [14, 28], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [28, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [28, 44], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        <div className="flex flex-col items-center gap-8">
          <div
            style={{
              transform: `scale(${logoScale})`,
              opacity: logoOpacity,
            }}
          >
            <LogoMark size={160} />
          </div>

          <div
            style={{
              opacity: wordOpacity,
              transform: `translateY(${wordY}px)`,
            }}
          >
            <WordMark className="text-[88px] leading-none" />
          </div>

          <div
            className="flex flex-col items-center gap-4"
            style={{
              opacity: ctaOpacity,
              transform: `translateY(${ctaY}px)`,
            }}
          >
            <div className="font-body text-content-secondary text-[30px]">
              Your full AP season, on autopilot.
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary-500/15 border border-primary-500/30">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              <span className="font-display font-semibold text-primary-300 tracking-wide text-[24px]">
                apex-scholar.com
              </span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
