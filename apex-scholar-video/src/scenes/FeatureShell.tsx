import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrandBackground } from "../brand/BrandBackground";
import { SceneLabel } from "../brand/GlowCard";

export const FeatureShell: React.FC<{
  index: number;
  total: number;
  label: string;
  title: React.ReactNode;
  subtitle: string;
  accent?: "teal" | "blue" | "mixed";
  children: React.ReactNode;
}> = ({
  index,
  total,
  label,
  title,
  subtitle,
  accent = "mixed",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const headSpring = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 100 },
    durationInFrames: 25,
  });
  const headY = interpolate(headSpring, [0, 1], [32, 0]);
  const headOpacity = interpolate(headSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 100 },
    durationInFrames: 25,
  });
  const subY = interpolate(subSpring, [0, 1], [24, 0]);
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene cross-fade
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <BrandBackground accent={accent} />
      <AbsoluteFill className="px-24 py-20 flex flex-col">
        <div
          style={{
            opacity: headOpacity,
            transform: `translateY(${headY}px)`,
          }}
        >
          <SceneLabel index={index} total={total} title={label} />
        </div>
        <div
          className="mt-6 max-w-[1200px]"
          style={{
            opacity: headOpacity,
            transform: `translateY(${headY}px)`,
          }}
        >
          <h1
            className="font-display font-bold tracking-tight text-content-primary"
            style={{
              fontSize: 92,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
        </div>
        <div
          className="mt-5 max-w-[920px] font-body text-content-secondary"
          style={{
            fontSize: 30,
            lineHeight: 1.35,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
          }}
        >
          {subtitle}
        </div>
        <div className="mt-10 flex-1 relative">{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
