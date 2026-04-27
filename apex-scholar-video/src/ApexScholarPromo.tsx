import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "./tailwind.css";

import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { AITutorsScene } from "./scenes/AITutorsScene";
import { SmartSchedulerScene } from "./scenes/SmartSchedulerScene";
import { PracticeTestsScene } from "./scenes/PracticeTestsScene";
import { FlashcardsScene } from "./scenes/FlashcardsScene";
import { SolverScene } from "./scenes/SolverScene";
import { DiagnosticsScene } from "./scenes/DiagnosticsScene";

// Scene durations (in frames at 30fps)
const INTRO = 100;
const FEATURE = 120;
const OUTRO = 90;
const OVERLAP = 10;

// Absolute start frames (each feature overlaps the previous by OVERLAP frames)
const starts = {
  intro: 0,
  ai: INTRO - OVERLAP,
  scheduler: INTRO - OVERLAP + (FEATURE - OVERLAP) * 1,
  tests: INTRO - OVERLAP + (FEATURE - OVERLAP) * 2,
  flashcards: INTRO - OVERLAP + (FEATURE - OVERLAP) * 3,
  solver: INTRO - OVERLAP + (FEATURE - OVERLAP) * 4,
  diagnostics: INTRO - OVERLAP + (FEATURE - OVERLAP) * 5,
  outro: INTRO - OVERLAP + (FEATURE - OVERLAP) * 6,
};

export const TOTAL_DURATION = starts.outro + OUTRO;

export const ApexScholarPromo: React.FC = () => {
  return (
    <AbsoluteFill className="bg-base-950">
      <Sequence from={starts.intro} durationInFrames={INTRO} name="Intro">
        <IntroScene />
      </Sequence>

      <Sequence from={starts.ai} durationInFrames={FEATURE} name="AI Tutors">
        <AITutorsScene />
      </Sequence>

      <Sequence
        from={starts.scheduler}
        durationInFrames={FEATURE}
        name="Smart Scheduler"
      >
        <SmartSchedulerScene />
      </Sequence>

      <Sequence
        from={starts.tests}
        durationInFrames={FEATURE}
        name="Practice Tests"
      >
        <PracticeTestsScene />
      </Sequence>

      <Sequence
        from={starts.flashcards}
        durationInFrames={FEATURE}
        name="Flashcards"
      >
        <FlashcardsScene />
      </Sequence>

      <Sequence from={starts.solver} durationInFrames={FEATURE} name="Solver">
        <SolverScene />
      </Sequence>

      <Sequence
        from={starts.diagnostics}
        durationInFrames={FEATURE}
        name="Diagnostics"
      >
        <DiagnosticsScene />
      </Sequence>

      <Sequence from={starts.outro} durationInFrames={OUTRO} name="Outro">
        <OutroScene />
      </Sequence>

      {/* Persistent progress bar across the whole video */}
      <ProgressBar />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      className="absolute left-0 right-0 bottom-0 h-1"
      style={{ pointerEvents: "none" }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background:
            "linear-gradient(90deg, rgba(94,234,212,0.9), rgba(45,212,191,1), rgba(96,165,250,0.9))",
          boxShadow: "0 0 12px rgba(45,212,191,0.6)",
        }}
      />
    </div>
  );
};
