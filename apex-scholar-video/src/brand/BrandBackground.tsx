import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Ambient dark-teal background with slow-drifting glows and subtle grid.
 * Used as the base layer for every scene.
 */
export const BrandBackground: React.FC<{
  accent?: "teal" | "blue" | "mixed";
}> = ({ accent = "mixed" }) => {
  const frame = useCurrentFrame();

  const drift1X = 50 + Math.sin(frame / 90) * 10;
  const drift1Y = 30 + Math.cos(frame / 120) * 8;
  const drift2X = 70 + Math.cos(frame / 110) * 12;
  const drift2Y = 75 + Math.sin(frame / 100) * 10;

  const glow1 =
    accent === "blue"
      ? "rgba(59, 130, 246, 0.35)"
      : "rgba(20, 184, 166, 0.38)";
  const glow2 =
    accent === "teal"
      ? "rgba(20, 184, 166, 0.22)"
      : "rgba(96, 165, 250, 0.28)";

  return (
    <AbsoluteFill className="bg-base-950 overflow-hidden">
      {/* Radial glows */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 60% at ${drift1X}% ${drift1Y}%, ${glow1} 0%, transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 55% at ${drift2X}% ${drift2Y}%, ${glow2} 0%, transparent 60%)`,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Fine grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(70% 70% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(70% 70% at 50% 50%, black 40%, transparent 100%)",
          opacity: 0.55,
        }}
      />
      {/* Soft top/bottom gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,8,13,0.85) 0%, transparent 18%, transparent 82%, rgba(5,8,13,0.95) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
