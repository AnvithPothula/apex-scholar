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

const units = [
  { label: "Unit 1 · Chemistry of Life", strength: 0.88 },
  { label: "Unit 2 · Cell Structure", strength: 0.74 },
  { label: "Unit 3 · Cellular Energetics", strength: 0.42 },
  { label: "Unit 4 · Cell Communication", strength: 0.61 },
  { label: "Unit 5 · Heredity", strength: 0.82 },
  { label: "Unit 6 · Gene Expression", strength: 0.38 },
  { label: "Unit 7 · Evolution", strength: 0.79 },
  { label: "Unit 8 · Ecology", strength: 0.52 },
];

export const DiagnosticsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <FeatureShell
      index={6}
      total={6}
      label="Diagnostics"
      title={
        <>
          Know exactly{" "}
          <span className="text-accent-400">where to study</span> next.
        </>
      }
      subtitle="Short diagnostics map your strengths and weaknesses unit-by-unit — so your study time goes where it counts."
      accent="blue"
    >
      <div className="flex gap-10 h-full">
        {/* Unit bars */}
        <GlowCard className="flex-1 p-8" accent="blue">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="font-display font-semibold text-content-primary text-[22px]">
              AP Biology · unit mastery
            </div>
            <div className="flex items-center gap-4 font-body text-[16px]">
              <LegendDot color="bg-error-400" label="weak" />
              <LegendDot color="bg-warning-400" label="mid" />
              <LegendDot color="bg-primary-400" label="strong" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3.5">
            {units.map((u, i) => {
              const p = spring({
                frame: frame - (4 + i * 3),
                fps,
                config: { damping: 200, mass: 0.5, stiffness: 110 },
                durationInFrames: 26,
              });
              const op = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              // Bar width animates with its own easing
              const barP = interpolate(
                frame,
                [10 + i * 3, 45 + i * 3],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                },
              );
              const width = barP * u.strength * 100;

              const color =
                u.strength < 0.5
                  ? "from-error-400 to-warning-400"
                  : u.strength < 0.7
                  ? "from-warning-400 to-primary-400"
                  : "from-primary-400 to-accent-400";

              return (
                <div
                  key={u.label}
                  className="flex items-center gap-5"
                  style={{ opacity: op }}
                >
                  <div className="w-[300px] font-body text-content-primary text-[20px]">
                    {u.label}
                  </div>
                  <div className="flex-1 relative h-8 rounded-full bg-base-800 border border-border overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full`}
                      style={{
                        width: `${width}%`,
                        boxShadow:
                          u.strength < 0.5
                            ? "0 0 18px rgba(248,113,113,0.5)"
                            : u.strength < 0.7
                            ? "0 0 18px rgba(250,204,21,0.5)"
                            : "0 0 18px rgba(45,212,191,0.5)",
                      }}
                    />
                  </div>
                  <div
                    className={`w-[70px] text-right font-display font-semibold text-[22px] ${
                      u.strength < 0.5
                        ? "text-error-400"
                        : u.strength < 0.7
                        ? "text-warning-400"
                        : "text-primary-300"
                    }`}
                  >
                    {Math.round(u.strength * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        {/* Focus recommendations */}
        <div className="w-[360px] flex flex-col gap-5 justify-center">
          <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[16px]">
            focus next
          </div>
          <FocusCard
            delay={34}
            unit="Unit 6"
            title="Gene Expression"
            note="+12 pts projected after 3 focused sessions"
          />
          <FocusCard
            delay={44}
            unit="Unit 3"
            title="Cellular Energetics"
            note="Weakest area — start with 20 MCQs"
          />
        </div>
      </div>
    </FeatureShell>
  );
};

const LegendDot: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div className="flex items-center gap-2">
    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
    <span className="font-body text-content-muted">{label}</span>
  </div>
);

const FocusCard: React.FC<{
  unit: string;
  title: string;
  note: string;
  delay: number;
}> = ({ unit, title, note, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 100 },
    durationInFrames: 24,
  });
  const op = interpolate(p, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(p, [0, 1], [40, 0]);
  return (
    <GlowCard
      accent="blue"
      className="p-6"
      style={{ opacity: op, transform: `translateX(${x}px)` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-md bg-accent-500/20 border border-accent-500/40 font-display font-semibold text-accent-300 text-[14px] tracking-wide">
          {unit}
        </span>
      </div>
      <div className="font-display font-bold text-content-primary text-[28px] leading-tight">
        {title}
      </div>
      <div className="font-body text-content-secondary text-[18px] mt-2">
        {note}
      </div>
    </GlowCard>
  );
};
