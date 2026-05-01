import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrandBackground } from "../brand/BrandBackground";
import { LogoMark, WordMark } from "../brand/Logo";

/**
 * Opening beat — logo lands center, wordmark slides up, tagline types
 * through. Designed to communicate "AP exam prep, AI-native" within ~3 seconds.
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo: scale-in with subtle settle bounce
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 110, mass: 0.7, stiffness: 120 },
    durationInFrames: 32,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow continuous breathe — adds life without being distracting
  const breathe = 1 + Math.sin(frame / 30) * 0.012;

  // Wordmark slides up from below, opacity in
  const wordSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 110 },
    durationInFrames: 28,
  });
  const wordY = interpolate(wordSpring, [0, 1], [32, 0]);
  const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline types through
  const tagline = "AI-powered AP exam prep.";
  const taglineChars = Math.round(
    interpolate(frame, [32, 70], [0, tagline.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const visibleTagline = tagline.slice(0, taglineChars);

  // Stat strip fades in once tagline is mostly typed — gives the marketing
  // beat a moment of "this is the real value prop".
  const statsFade = interpolate(frame, [62, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statsY = interpolate(frame, [62, 80], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle outro slide for the whole block
  const exit = interpolate(frame, [82, 100], [0, -24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [82, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BrandBackground accent="mixed" />
      <AbsoluteFill className="items-center justify-center">
        <div
          className="flex flex-col items-center gap-7"
          style={{
            transform: `translateY(${exit}px)`,
            opacity: exitOpacity,
          }}
        >
          <div
            style={{
              transform: `scale(${logoScale * breathe})`,
              opacity: logoOpacity,
            }}
          >
            <LogoMark size={200} />
          </div>
          <div
            style={{
              opacity: wordOpacity,
              transform: `translateY(${wordY}px)`,
            }}
          >
            <WordMark className="text-[104px] leading-none" />
          </div>
          <div
            className="font-body text-content-secondary text-[34px] tracking-wide"
            style={{ minHeight: 52 }}
          >
            {visibleTagline}
            <span
              className="inline-block align-middle ml-1"
              style={{
                width: 3,
                height: 30,
                background: "#5eead4",
                opacity: Math.floor(frame / 6) % 2 ? 1 : 0,
                borderRadius: 2,
              }}
            />
          </div>

          {/* Stat strip — three quick credibility badges */}
          <div
            className="flex items-center gap-4 mt-2"
            style={{
              opacity: statsFade,
              transform: `translateY(${statsY}px)`,
            }}
          >
            <StatPill label="39+ AP subjects" tone="teal" />
            <StatPill label="100% free" tone="blue" />
            <StatPill label="Built for students" tone="teal" />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StatPill: React.FC<{ label: string; tone: "teal" | "blue" }> = ({
  label,
  tone,
}) => {
  const teal = tone === "teal";
  return (
    <div
      className={`px-5 py-2 rounded-full font-display font-medium text-[20px] border ${
        teal
          ? "bg-primary-500/12 border-primary-500/30 text-primary-300"
          : "bg-accent-500/12 border-accent-500/30 text-accent-300"
      }`}
    >
      {label}
    </div>
  );
};
