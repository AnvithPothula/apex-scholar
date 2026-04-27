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
 * Opening beat — logo mark lands, wordmark slides in, tagline types through.
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 120, mass: 0.6, stiffness: 110 },
    durationInFrames: 35,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoRotate = interpolate(logoSpring, [0, 1], [-12, 0]);

  const wordSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 100 },
    durationInFrames: 30,
  });
  const wordX = interpolate(wordSpring, [0, 1], [40, 0]);
  const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagline = "AI-powered AP exam prep.";
  const taglineChars = Math.round(
    interpolate(frame, [30, 70], [0, tagline.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const visibleTagline = tagline.slice(0, taglineChars);

  // Subtle outro slide for the whole block
  const exit = interpolate(frame, [80, 95], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [80, 95], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BrandBackground accent="teal" />
      <AbsoluteFill className="items-center justify-center">
        <div
          className="flex flex-col items-center gap-8"
          style={{
            transform: `translateY(${exit}px)`,
            opacity: exitOpacity,
          }}
        >
          <div
            style={{
              transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
              opacity: logoOpacity,
            }}
          >
            <LogoMark size={180} />
          </div>
          <div
            style={{
              opacity: wordOpacity,
              transform: `translateX(${wordX}px)`,
            }}
          >
            <WordMark className="text-[96px] leading-none" />
          </div>
          <div
            className="font-body text-content-secondary text-[32px] tracking-wide mt-2"
            style={{ minHeight: 48 }}
          >
            {visibleTagline}
            <span
              className="inline-block align-middle ml-1"
              style={{
                width: 3,
                height: 28,
                background: "#5eead4",
                opacity: Math.floor(frame / 6) % 2 ? 1 : 0,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
