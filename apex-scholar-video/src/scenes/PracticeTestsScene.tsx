import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeatureShell } from "./FeatureShell";
import { GlowCard } from "../brand/GlowCard";

export const PracticeTestsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Score counter 0 → 5
  const scoreP = spring({
    frame: frame - 40,
    fps,
    config: { damping: 120, mass: 0.8, stiffness: 90 },
    durationInFrames: 40,
  });
  const scoreRaw = interpolate(scoreP, [0, 1], [0, 5]);
  const score = Math.min(5, scoreRaw);

  // Timer progress
  const timerProgress = interpolate(frame, [0, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const timerMinutes = Math.max(0, 45 - Math.floor(timerProgress * 45));
  const timerSeconds = Math.floor((1 - (timerProgress * 45) % 1) * 60) % 60;

  const options = [
    { letter: "A", text: "Increases activation energy", correct: false },
    { letter: "B", text: "Lowers activation energy", correct: true },
    { letter: "C", text: "Changes ΔG of the reaction", correct: false },
    { letter: "D", text: "Shifts equilibrium right", correct: false },
  ];

  const selectedFrame = 40;
  const revealFrame = 55;

  return (
    <FeatureShell
      index={3}
      total={6}
      label="Practice Tests"
      title={
        <>
          AI-generated <span className="text-primary-400">full-length</span>{" "}
          practice tests.
        </>
      }
      subtitle="Unlimited AP-style MCQs and FRQs, graded with rubric-aware feedback and a predicted 1–5 score."
      accent="teal"
    >
      <div className="flex gap-10 h-full">
        {/* Question card */}
        <GlowCard className="flex-1 p-8" accent="teal">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="font-display font-semibold text-content-primary text-[22px]">
              AP Biology · Unit 3 · Q 12 / 60
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-base-800 border border-border text-content-primary font-mono text-[20px]">
              <span className="w-2 h-2 rounded-full bg-error-400 animate-pulse" />
              {String(timerMinutes).padStart(2, "0")}:
              {String(timerSeconds).padStart(2, "0")}
            </div>
          </div>

          <div className="mt-6 font-body text-content-primary text-[28px] leading-snug">
            Which statement best describes how an enzyme accelerates a
            biochemical reaction?
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {options.map((o, i) => {
              const p = spring({
                frame: frame - (4 + i * 4),
                fps,
                config: { damping: 200, mass: 0.5, stiffness: 110 },
                durationInFrames: 22,
              });
              const op = interpolate(p, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const y = interpolate(p, [0, 1], [14, 0]);

              const isSelected = o.letter === "B" && frame >= selectedFrame;
              const isRevealed = frame >= revealFrame;

              let style: React.CSSProperties = {
                opacity: op,
                transform: `translateY(${y}px)`,
              };
              let classes =
                "border-border text-content-primary bg-base-800/60";
              if (isRevealed && o.correct) {
                classes =
                  "border-primary-500/60 bg-primary-500/20 text-content-primary";
              } else if (isSelected && !isRevealed) {
                classes =
                  "border-accent-500/60 bg-accent-500/15 text-content-primary";
              }

              return (
                <div
                  key={o.letter}
                  className={`rounded-xl px-5 py-4 border flex items-center gap-4 ${classes}`}
                  style={style}
                >
                  <div
                    className={`w-10 h-10 rounded-lg font-display font-bold text-[20px] flex items-center justify-center ${
                      isRevealed && o.correct
                        ? "bg-primary-500/30 text-primary-200 border border-primary-500/50"
                        : "bg-base-750 text-content-secondary border border-border"
                    }`}
                  >
                    {o.letter}
                  </div>
                  <div className="font-body text-[22px]">{o.text}</div>
                  {isRevealed && o.correct && (
                    <div className="ml-auto font-display font-semibold text-primary-300 text-[18px]">
                      ✓ correct
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlowCard>

        {/* Score dial */}
        <GlowCard
          className="w-[360px] p-8 flex flex-col items-center justify-center"
          accent="teal"
        >
          <div className="font-display font-medium text-content-muted tracking-[0.2em] uppercase text-[16px]">
            Predicted AP score
          </div>
          <ScoreDial value={score} />
          <div className="font-body text-content-secondary text-[20px] text-center mt-4 max-w-[260px]">
            Rubric-scored against real College Board standards.
          </div>
        </GlowCard>
      </div>
    </FeatureShell>
  );
};

const ScoreDial: React.FC<{ value: number }> = ({ value }) => {
  const size = 240;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value / 5;
  const dash = circumference * progress;

  return (
    <div
      className="relative flex items-center justify-center my-6"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#score-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <div
          className="font-display font-bold text-primary-300"
          style={{ fontSize: 96, lineHeight: 1 }}
        >
          {value.toFixed(1)}
        </div>
        <div className="font-body text-content-muted text-[18px]">out of 5</div>
      </div>
    </div>
  );
};
