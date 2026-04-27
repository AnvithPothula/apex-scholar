import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeatureShell } from "./FeatureShell";
import { GlowCard } from "../brand/GlowCard";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Simulated study blocks — (dayIndex, hourStart, durationHours, subject, accent)
const blocks: Array<{
  day: number;
  start: number;
  dur: number;
  subject: string;
  accent: "teal" | "blue";
  appearAt: number;
}> = [
  { day: 0, start: 1, dur: 1.5, subject: "AP Calc", accent: "teal", appearAt: 0 },
  { day: 0, start: 3.5, dur: 1, subject: "AP Bio", accent: "blue", appearAt: 4 },
  { day: 1, start: 2, dur: 2, subject: "AP Lang", accent: "teal", appearAt: 8 },
  { day: 2, start: 1, dur: 1, subject: "AP Bio", accent: "blue", appearAt: 12 },
  { day: 2, start: 4, dur: 1.5, subject: "AP Calc", accent: "teal", appearAt: 16 },
  { day: 3, start: 2.5, dur: 1.5, subject: "AP Gov", accent: "blue", appearAt: 20 },
  { day: 4, start: 1, dur: 2, subject: "AP Calc", accent: "teal", appearAt: 24 },
  { day: 5, start: 2, dur: 2.5, subject: "AP Bio", accent: "blue", appearAt: 28 },
  { day: 6, start: 3, dur: 1.5, subject: "AP Lang", accent: "teal", appearAt: 32 },
];

export const SmartSchedulerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gridRowHeight = 58; // px per hour
  const hoursVisible = 6;
  const dayColWidth = 150;

  return (
    <FeatureShell
      index={2}
      total={6}
      label="Smart Scheduler"
      title={
        <>
          Your week,{" "}
          <span className="text-accent-400">auto-scheduled</span> around real life.
        </>
      }
      subtitle="Pulls assignments from Schoology and generates focused study blocks that respect your free time and exam dates."
      accent="blue"
    >
      <div className="flex gap-8 h-full">
        <GlowCard className="flex-1 p-8" accent="blue">
          {/* Day header */}
          <div
            className="grid border-b border-border-subtle pb-3 mb-3"
            style={{
              gridTemplateColumns: `80px repeat(7, ${dayColWidth}px)`,
            }}
          >
            <div />
            {days.map((d) => (
              <div
                key={d}
                className="font-display font-semibold text-content-secondary text-[20px] tracking-wide"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `80px repeat(7, ${dayColWidth}px)`,
              gridAutoRows: `${gridRowHeight}px`,
            }}
          >
            {/* Hour labels */}
            {Array.from({ length: hoursVisible }).map((_, h) => (
              <React.Fragment key={h}>
                <div
                  className="font-body text-content-muted text-[16px] pt-1"
                  style={{ gridRow: h + 1, gridColumn: 1 }}
                >
                  {4 + h}:00 PM
                </div>
                {days.map((_, d) => (
                  <div
                    key={`${h}-${d}`}
                    className="border-t border-border-subtle"
                    style={{ gridRow: h + 1, gridColumn: d + 2 }}
                  />
                ))}
              </React.Fragment>
            ))}

            {/* Study blocks */}
            {blocks.map((b, i) => {
              const p = spring({
                frame: frame - b.appearAt,
                fps,
                config: { damping: 200, mass: 0.5, stiffness: 110 },
                durationInFrames: 24,
              });
              const op = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const scaleY = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              const top = b.start * gridRowHeight + 2;
              const left = 80 + b.day * dayColWidth + 4;
              const height = b.dur * gridRowHeight - 6;
              const width = dayColWidth - 8;
              const teal = b.accent === "teal";

              return (
                <div
                  key={i}
                  className="absolute rounded-xl px-3 py-2 font-display font-semibold text-[18px] flex flex-col justify-between"
                  style={{
                    top,
                    left,
                    height,
                    width,
                    transformOrigin: "top",
                    transform: `scaleY(${scaleY})`,
                    opacity: op,
                    background: teal
                      ? "linear-gradient(135deg, rgba(20,184,166,0.35), rgba(13,148,136,0.2))"
                      : "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(37,99,235,0.2))",
                    border: teal
                      ? "1px solid rgba(45,212,191,0.45)"
                      : "1px solid rgba(96,165,250,0.45)",
                    color: "#f1f5ff",
                    boxShadow: teal
                      ? "0 8px 24px -10px rgba(20,184,166,0.6)"
                      : "0 8px 24px -10px rgba(59,130,246,0.6)",
                  }}
                >
                  <div className="text-[16px] leading-tight">{b.subject}</div>
                  <div className="text-[13px] font-body opacity-80">
                    {b.dur}h focus
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        {/* Side callouts */}
        <div className="flex flex-col justify-center gap-5 w-[320px]">
          <SideStat
            delay={6}
            value="Schoology"
            label="synced assignments"
            accent="blue"
          />
          <SideStat
            delay={14}
            value="12 hrs"
            label="planned this week"
            accent="teal"
          />
          <SideStat
            delay={22}
            value="May 12"
            label="next AP exam"
            accent="blue"
          />
        </div>
      </div>
    </FeatureShell>
  );
};

const SideStat: React.FC<{
  value: string;
  label: string;
  delay: number;
  accent: "teal" | "blue";
}> = ({ value, label, delay, accent }) => {
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
      accent={accent}
      className="px-6 py-5"
      style={{ opacity: op, transform: `translateX(${x}px)` }}
    >
      <div
        className={`font-display font-bold text-[36px] leading-none ${
          accent === "teal" ? "text-primary-300" : "text-accent-300"
        }`}
      >
        {value}
      </div>
      <div className="font-body text-content-muted text-[18px] mt-1">
        {label}
      </div>
    </GlowCard>
  );
};
