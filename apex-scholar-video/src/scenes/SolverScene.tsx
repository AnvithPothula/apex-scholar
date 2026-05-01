import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeatureShell } from "./FeatureShell";
import { GlowCard } from "../brand/GlowCard";

const solutionSteps = [
  {
    label: "Step 1",
    body: "Identify this as an integration by parts problem.",
    appearAt: 24,
  },
  {
    label: "Step 2",
    body: "Let u = x and dv = eˣ dx → du = dx, v = eˣ.",
    appearAt: 42,
  },
  {
    label: "Step 3",
    body: "∫x·eˣ dx = x·eˣ − ∫eˣ dx = x·eˣ − eˣ + C",
    appearAt: 60,
    highlight: true,
  },
];

export const SolverScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scanner line over the photo
  const scanP = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const scanY = interpolate(scanP, [0, 1], [0, 100]);

  return (
    <FeatureShell
      index={5}
      total={6}
      label="Solver"
      title={
        <>
          Snap it.{" "}
          <span className="text-primary-400">Understand it.</span>
        </>
      }
      subtitle="Photo or text — the Solver shows every step, not just the answer. Because the AP exam doesn't care if you got 42; it cares if you can show your work."
      accent="teal"
    >
      <div className="flex gap-10 h-full">
        {/* Photo preview */}
        <GlowCard className="w-[440px] p-6 flex flex-col" accent="teal">
          <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[14px] mb-3">
            captured · camera
          </div>
          <div className="relative flex-1 rounded-xl overflow-hidden bg-base-900 border border-border">
            {/* Simulated paper */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f5f0e6] to-[#e9dfc9]">
              <div className="absolute inset-6 flex flex-col items-center justify-center">
                <div
                  className="font-display text-[#1f2937]"
                  style={{ fontSize: 44, fontWeight: 600 }}
                >
                  ∫ x · eˣ dx
                </div>
                <div
                  className="font-body text-[#4b5563] mt-4"
                  style={{ fontSize: 18 }}
                >
                  problem 17 · calc practice set
                </div>
              </div>
              {/* Paper lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-[#cfc6b0]"
                  style={{ top: `${15 + i * 10}%` }}
                />
              ))}
            </div>

            {/* Scanner line */}
            <div
              className="absolute left-0 right-0 h-[3px]"
              style={{
                top: `${scanY}%`,
                background:
                  "linear-gradient(90deg, transparent, rgba(94,234,212,1), transparent)",
                boxShadow: "0 0 18px 4px rgba(94,234,212,0.6)",
                opacity: scanP < 1 ? 1 : 0,
              }}
            />

            {/* Detection frame corners */}
            {scanP >= 0.3 && (
              <>
                {[
                  { top: "15%", left: "15%", rot: 0 },
                  { top: "15%", right: "15%", rot: 90 },
                  { bottom: "15%", left: "15%", rot: 270 },
                  { bottom: "15%", right: "15%", rot: 180 },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 border-l-2 border-t-2 border-primary-300"
                    style={
                      {
                        ...c,
                        transform: `rotate(${c.rot}deg)`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <div className="font-body text-primary-300 text-[18px]">
                {scanP < 1 ? "scanning…" : "solved"}
              </div>
            </div>
            <div className="font-body text-content-muted text-[16px]">
              AP Calc BC
            </div>
          </div>
        </GlowCard>

        {/* Solution steps */}
        <GlowCard className="flex-1 p-8" accent="teal">
          <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[14px]">
            step-by-step solution
          </div>
          <div className="mt-5 flex flex-col gap-4">
            {solutionSteps.map((s, i) => {
              const p = spring({
                frame: frame - s.appearAt,
                fps,
                config: { damping: 200, mass: 0.5, stiffness: 110 },
                durationInFrames: 22,
              });
              const op = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const y = interpolate(p, [0, 1], [20, 0]);
              return (
                <div
                  key={i}
                  className={`rounded-xl px-5 py-4 border flex gap-5 ${
                    s.highlight
                      ? "bg-primary-500/15 border-primary-500/40"
                      : "bg-base-800/70 border-border"
                  }`}
                  style={{ opacity: op, transform: `translateY(${y}px)` }}
                >
                  <div
                    className={`font-display font-bold text-[20px] px-3 py-1 rounded-lg ${
                      s.highlight
                        ? "bg-primary-500/30 text-primary-200 border border-primary-500/50"
                        : "bg-base-750 text-content-secondary border border-border"
                    }`}
                  >
                    {s.label}
                  </div>
                  <div
                    className={`font-body text-[24px] leading-snug ${
                      s.highlight
                        ? "text-primary-200 font-display font-semibold"
                        : "text-content-primary"
                    }`}
                  >
                    {s.body}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature chips */}
          <div className="mt-8 flex gap-3">
            {[
              "Photo input",
              "Text input",
              "LaTeX rendering",
              "Saved history",
            ].map((label, i) => {
              const p = spring({
                frame: frame - (70 + i * 4),
                fps,
                config: { damping: 200, mass: 0.5, stiffness: 100 },
                durationInFrames: 18,
              });
              const op = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const y = interpolate(p, [0, 1], [10, 0]);
              return (
                <div
                  key={label}
                  className="px-4 py-2 rounded-full bg-base-800 border border-border font-body text-content-secondary text-[18px]"
                  style={{ opacity: op, transform: `translateY(${y}px)` }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </GlowCard>
      </div>
    </FeatureShell>
  );
};
