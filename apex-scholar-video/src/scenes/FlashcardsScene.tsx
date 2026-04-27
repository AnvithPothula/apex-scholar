import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeatureShell } from "./FeatureShell";
import { GlowCard } from "../brand/GlowCard";

const cards = [
  {
    id: 0,
    front: "What is a derivative at a point?",
    back: "Instantaneous rate of change — slope of the tangent line.",
    accent: "teal" as const,
  },
  {
    id: 1,
    front: "Define homeostasis.",
    back: "Maintenance of stable internal conditions despite external change.",
    accent: "blue" as const,
  },
  {
    id: 2,
    front: "Treaty of Versailles — year and significance?",
    back: "1919 — ended WWI, imposed heavy reparations on Germany.",
    accent: "teal" as const,
  },
];

// Per-card timeline: enter → show front → flip to back → hold → exit
const CARD_CYCLE = 38; // frames per card

export const FlashcardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <FeatureShell
      index={4}
      total={6}
      label="Flashcards"
      title={
        <>
          Build, study,{" "}
          <span className="text-primary-400">and share</span> decks.
        </>
      }
      subtitle="Generate decks from your notes, study with spaced repetition, and publish public decks for friends."
      accent="teal"
    >
      <div className="flex gap-14 h-full items-center">
        {/* Card carousel */}
        <div
          className="relative"
          style={{ width: 540, height: 340 }}
        >
          {cards.map((card, i) => {
            const start = i * CARD_CYCLE;
            const local = frame - start;

            // Entry animation (0 → 14)
            const entry = spring({
              frame: local,
              fps,
              config: { damping: 200, mass: 0.5, stiffness: 110 },
              durationInFrames: 20,
            });
            const entryX = interpolate(entry, [0, 1], [520, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const entryOp = interpolate(entry, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            // Exit animation (CARD_CYCLE → CARD_CYCLE+14) unless last card
            const isLast = i === cards.length - 1;
            const exit = isLast
              ? 0
              : spring({
                  frame: local - CARD_CYCLE,
                  fps,
                  config: { damping: 200, mass: 0.5, stiffness: 100 },
                  durationInFrames: 18,
                });
            const exitX = interpolate(exit, [0, 1], [0, -520], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const exitOp = interpolate(exit, [0, 1], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            // Flip progress (20 → 30): crossfade front → back
            const flip = interpolate(local, [20, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            // Card is considered "present" during its own window
            const present = local > -6 && local < CARD_CYCLE + 18;
            if (!present) return null;

            const x = entryX + exitX;
            const opacity = Math.min(entryOp, exitOp);

            return (
              <div
                key={card.id}
                className="absolute inset-0"
                style={{
                  transform: `translateX(${x}px)`,
                  opacity,
                }}
              >
                {/* Front */}
                <GlowCard
                  accent={card.accent}
                  className="absolute inset-0 p-8 flex flex-col justify-between"
                  style={{ opacity: 1 - flip }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[14px]">
                      question · {i + 1} / {cards.length}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-md font-display font-semibold text-[14px] border ${
                        card.accent === "teal"
                          ? "bg-primary-500/20 border-primary-500/40 text-primary-300"
                          : "bg-accent-500/20 border-accent-500/40 text-accent-300"
                      }`}
                    >
                      FRONT
                    </div>
                  </div>
                  <div
                    className="font-display font-bold text-content-primary"
                    style={{ fontSize: 40, lineHeight: 1.15 }}
                  >
                    {card.front}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-body text-content-muted text-[18px]">
                      tap to flip
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-[22px] ${
                        card.accent === "teal"
                          ? "bg-primary-500/25 text-primary-300 border border-primary-500/40"
                          : "bg-accent-500/25 text-accent-300 border border-accent-500/40"
                      }`}
                    >
                      ↻
                    </div>
                  </div>
                </GlowCard>

                {/* Back */}
                <GlowCard
                  accent={card.accent}
                  className="absolute inset-0 p-8 flex flex-col justify-between"
                  style={{ opacity: flip }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[14px]">
                      answer
                    </div>
                    <div
                      className={`px-3 py-1 rounded-md font-display font-semibold text-[14px] border ${
                        card.accent === "teal"
                          ? "bg-primary-500/30 border-primary-500/60 text-primary-200"
                          : "bg-accent-500/30 border-accent-500/60 text-accent-200"
                      }`}
                    >
                      BACK
                    </div>
                  </div>
                  <div
                    className={`font-display font-semibold ${
                      card.accent === "teal"
                        ? "text-primary-300"
                        : "text-accent-300"
                    }`}
                    style={{ fontSize: 32, lineHeight: 1.2 }}
                  >
                    {card.back}
                  </div>
                  <div className="flex gap-2">
                    <Pill label="Again" tone="error" />
                    <Pill label="Hard" tone="warning" />
                    <Pill label="Good" tone="success" />
                    <Pill label="Easy" tone="info" />
                  </div>
                </GlowCard>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4 flex-1">
          <StatRow
            delay={8}
            left="Cards due today"
            right="42"
            accent="teal"
          />
          <StatRow delay={16} left="Streak" right="11 days" accent="blue" />
          <StatRow delay={24} left="Public decks" right="128" accent="teal" />
          <StatRow delay={32} left="Retention" right="94%" accent="blue" />
        </div>
      </div>
    </FeatureShell>
  );
};

const Pill: React.FC<{
  label: string;
  tone: "error" | "warning" | "success" | "info";
}> = ({ label, tone }) => {
  const map = {
    error: "bg-error-400/15 text-error-400 border-error-400/30",
    warning: "bg-warning-400/15 text-warning-400 border-warning-400/30",
    success: "bg-success-400/15 text-success-400 border-success-400/30",
    info: "bg-info-400/15 text-info-400 border-info-400/30",
  } as const;
  return (
    <div
      className={`px-3 py-1.5 rounded-lg font-body text-[16px] border ${map[tone]}`}
    >
      {label}
    </div>
  );
};

const StatRow: React.FC<{
  left: string;
  right: string;
  delay: number;
  accent: "teal" | "blue";
}> = ({ left, right, delay, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 100 },
    durationInFrames: 22,
  });
  const op = interpolate(p, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(p, [0, 1], [30, 0]);
  return (
    <GlowCard
      accent={accent}
      className="px-6 py-5 flex items-center justify-between"
      style={{ opacity: op, transform: `translateX(${x}px)` }}
    >
      <div className="font-body text-content-secondary text-[22px]">{left}</div>
      <div
        className={`font-display font-bold text-[32px] ${
          accent === "teal" ? "text-primary-300" : "text-accent-300"
        }`}
      >
        {right}
      </div>
    </GlowCard>
  );
};
