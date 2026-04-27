import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeatureShell } from "./FeatureShell";
import { GlowCard } from "../brand/GlowCard";

const messages = [
  {
    from: "user",
    text: "Explain FRQ Part B — Calvin cycle rate limits.",
    appearAt: 0,
  },
  {
    from: "tutor",
    text: "Happy to. The rate-limiting step is RuBisCO fixing CO₂…",
    appearAt: 18,
  },
  {
    from: "user",
    text: "And how does it connect to light reactions?",
    appearAt: 46,
  },
  {
    from: "tutor",
    text: "Light reactions make ATP + NADPH — fuel for the cycle.",
    appearAt: 66,
  },
];

const subjects = [
  { label: "AP Biology", accent: "teal" },
  { label: "AP Calculus BC", accent: "blue" },
  { label: "AP US History", accent: "teal" },
  { label: "AP Physics C", accent: "blue" },
  { label: "AP Lang", accent: "teal" },
];

export const AITutorsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <FeatureShell
      index={1}
      total={6}
      label="AI Tutors"
      title={
        <>
          A tutor for every <span className="text-primary-400">AP subject</span>.
        </>
      }
      subtitle="Chat one-on-one with subject-trained AI tutors that grade FRQs, explain rubrics, and walk through full solutions."
      accent="teal"
    >
      <div className="flex gap-10 h-full">
        {/* Chat panel */}
        <GlowCard
          className="flex-1 p-8 flex flex-col gap-5"
          accent="teal"
          style={{ maxWidth: 760 }}
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
              <div className="font-display font-bold text-primary-300 text-[18px]">
                B
              </div>
            </div>
            <div>
              <div className="font-display font-semibold text-content-primary text-[22px]">
                AP Biology Tutor
              </div>
              <div className="font-body text-content-muted text-[16px]">
                online · responds in seconds
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-[14px] font-body text-primary-300">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              live
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {messages.map((m, i) => {
              const p = spring({
                frame: frame - m.appearAt,
                fps,
                config: { damping: 200, mass: 0.5, stiffness: 120 },
                durationInFrames: 20,
              });
              const op = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const y = interpolate(p, [0, 1], [18, 0]);
              const isUser = m.from === "user";
              return (
                <div
                  key={i}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  style={{ opacity: op, transform: `translateY(${y}px)` }}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-5 py-3 font-body ${
                      isUser
                        ? "bg-accent-500/20 border border-accent-500/30 text-content-primary"
                        : "bg-primary-500/15 border border-primary-500/25 text-content-primary"
                    }`}
                    style={{ fontSize: 20, lineHeight: 1.4 }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {frame > 90 && frame < 115 && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-primary-500/15 border border-primary-500/25 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary-400"
                      style={{
                        opacity:
                          Math.floor((frame + i * 4) / 6) % 2 === 0 ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlowCard>

        {/* Subject chips */}
        <div className="flex flex-col justify-center gap-4">
          <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[16px] mb-2">
            39 AP subjects
          </div>
          {subjects.map((s, i) => {
            const p = spring({
              frame: frame - (20 + i * 8),
              fps,
              config: { damping: 200, mass: 0.5, stiffness: 100 },
              durationInFrames: 22,
            });
            const op = interpolate(p, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(p, [0, 1], [40, 0]);
            return (
              <div
                key={s.label}
                className={`px-5 py-3 rounded-xl font-display font-semibold text-[22px] bg-base-850/80 border border-border flex items-center gap-3`}
                style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  minWidth: 320,
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    s.accent === "teal" ? "bg-primary-400" : "bg-accent-400"
                  }`}
                />
                <span className="text-content-primary">{s.label}</span>
              </div>
            );
          })}
          <div className="font-body text-content-muted text-[18px] mt-2">
            + Physics 1, Chem, Stats, Psych…
          </div>
        </div>
      </div>
    </FeatureShell>
  );
};
