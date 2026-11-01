// The hero film's 25 beats, worded exactly as in reports/Launch video script
// draft.md and timed to the music: every beat lasts a whole number of beats of
// "Close Up" (103.4 BPM), and each chapter starts on a bar line.
//
// Clips come from capture/record.mjs (public/clips/<name>.mp4 + .json) and always
// play at real speed. `from` is where in the clip the beat starts: seconds, or
// ev(i, lead) = `lead` seconds before the clip's i-th logged event (scrolls,
// clicks, drags...), so a re-take of a shot keeps its beat on the action.
// `cam` is the camera path over the beat.

export const BPM = 103.36;
export const BEAT = 60 / BPM;
export const OFFSET = 0.046; // first downbeat in the track, seconds

export type Cam = {
  /** 0..1 progress through the beat */
  at: number;
  /** 1 = the whole 1440-px-wide page fills the window */
  zoom: number;
  /** focus point in the page's CSS px (1440 x 900) */
  x: number;
  y: number;
};

export type From = number | { ev: number; lead: number };
const ev = (i: number, lead = 0.5): From => ({ ev: i, lead });

type BeatSpec = {
  n: number;
  len: number; // in beats of the music
  headline?: string; // "/" splits it into lines shown one after the other
  sub?: string;
  clip?: string;
  from?: From;
  cam?: Cam[];
  card?: "logo" | "plain" | "end" | "pending";
  photo?: string; // a still that drops into the footage during the first half of the beat
  chapter?: boolean; // first beat of a chapter: lands with a lift on the bar line
  note?: string; // shown on a "pending" card only
};
export type Beat = BeatSpec & { start: number };

const wide = (x = 720, y = 450, z = 1): Cam[] => [
  { at: 0, zoom: z, x, y },
  { at: 1, zoom: z * 1.08, x, y },
];

const SPECS: BeatSpec[] = [
  // Start (4 bars)
  { n: 1, len: 4, headline: "Self-studying for AP?", card: "logo" },
  { n: 2, len: 6, headline: "Answer 10 questions.", clip: "start-check", from: ev(2, 1.2),
    cam: [{ at: 0, zoom: 1.4, x: 720, y: 280 }, { at: 1, zoom: 1.6, x: 720, y: 300 }] },
  { n: 3, len: 6, headline: "Get a predicted score and a plan for today.", clip: "start-check", from: ev(31, 0.2),
    cam: [{ at: 0, zoom: 1.6, x: 720, y: 230 }, { at: 0.45, zoom: 1.6, x: 720, y: 240 }, { at: 1, zoom: 1.25, x: 720, y: 500 }] },

  // Learn (14 bars)
  { n: 4, chapter: true, len: 7, headline: "Learn every unit.", sub: "Lessons, worked steps and a checkpoint after every topic.",
    clip: "study-pack", from: ev(0, 0.4), cam: wide(720, 420, 1.15) },
  { n: 5, len: 7, headline: "Play with the ideas.", sub: "28 interactive sims.", clip: "sim-launch", from: ev(0, 0.8),
    cam: [{ at: 0, zoom: 1.5, x: 640, y: 300 }, { at: 1, zoom: 1.65, x: 640, y: 290 }] },
  { n: 6, len: 7, sub: "U.S. history from 1491 to today, on one timeline.", clip: "timeline", from: 0.3,
    cam: wide(720, 500) },
  { n: 7, len: 7, headline: "Ask your AP tutor.", clip: "tutor-sim", from: ev(1, 0.4),
    cam: [{ at: 0, zoom: 1.3, x: 780, y: 760 }, { at: 1, zoom: 1.5, x: 780, y: 800 }] },
  { n: 8, len: 6, headline: "It builds you a simulation.", clip: "tutor-sim", from: ev(2, 0.3),
    cam: [{ at: 0, zoom: 1.25, x: 810, y: 560 }, { at: 1, zoom: 1.5, x: 815, y: 500 }] },
  { n: 9, len: 8, headline: "Ring the bell. / Watch the dog learn.", clip: "tutor-sim", from: ev(6, 1.6),
    cam: [{ at: 0, zoom: 1.5, x: 800, y: 500 }, { at: 1, zoom: 1.65, x: 800, y: 480 }] },
  { n: 10, len: 7, headline: "Graphs you can drag.", clip: "tutor-graph", from: ev(3, 0.4),
    cam: [{ at: 0, zoom: 1.45, x: 780, y: 400 }, { at: 1, zoom: 1.55, x: 780, y: 420 }] },
  { n: 11, len: 7, headline: "Check your work.", sub: "The tutor goes through your steps one at a time.",
    clip: "tutor-check", from: ev(3, 2.2), cam: [{ at: 0, zoom: 1.25, x: 800, y: 400 }, { at: 1, zoom: 1.3, x: 800, y: 480 }] },

  // Practice (12 bars)
  { n: 12, chapter: true, len: 6, headline: "Generate a practice test.", sub: "Any course, any unit, in the real exam format.",
    clip: "test-setup", from: ev(0, 0.8), cam: [{ at: 0, zoom: 1.5, x: 430, y: 380 }, { at: 1, zoom: 1.55, x: 430, y: 420 }] },
  { n: 13, len: 8, headline: "Cross out. / Flag. / Watch the clock.", sub: "Laid out like the digital AP exam.",
    clip: "test-screen", from: ev(1, 0.7), cam: [{ at: 0, zoom: 1.35, x: 720, y: 280 }, { at: 1, zoom: 1.25, x: 720, y: 340 }] },
  { n: 14, len: 6, headline: "Write it on paper. / Snap a photo.", clip: "frq", from: ev(0, 0.3), photo: "photos/frq.jpg",
    cam: [{ at: 0, zoom: 1.3, x: 720, y: 520 }, { at: 1, zoom: 1.6, x: 560, y: 640 }] },
  { n: 15, len: 8, headline: "Graded against the rubric.", sub: "It shows the point you missed, and why.",
    clip: "frq-grade", from: ev(0, 0.8),
    cam: [{ at: 0, zoom: 1.25, x: 720, y: 420 }, { at: 0.85, zoom: 1.35, x: 740, y: 420 }, { at: 1, zoom: 1.75, x: 740, y: 520 }] },
  { n: 16, len: 6, headline: "Missed a question? It comes back.", sub: "Spaced repetition brings it back before you forget it.",
    clip: "review", from: ev(1, 0.6), cam: [{ at: 0, zoom: 1.4, x: 720, y: 300 }, { at: 1, zoom: 1.5, x: 720, y: 360 }] },
  { n: 17, len: 6, headline: "Flashcards, or bring yours from Quizlet.", clip: "quizlet", from: ev(2, 0.5),
    cam: wide(720, 420, 1.1) },
  { n: 18, len: 8, headline: "Stuck on homework? Take a picture.", clip: "solver", from: ev(2, 2.8), photo: "photos/homework.jpg",
    cam: [{ at: 0, zoom: 1.3, x: 720, y: 450 }, { at: 1, zoom: 1.2, x: 720, y: 620 }] },

  // Plan (4 bars)
  { n: 19, chapter: true, len: 6, headline: "Plan around what's actually due.", sub: "Imports your Schoology or Canvas calendar.",
    clip: "scheduler", from: ev(0, 0.4), cam: wide(820, 450, 1.05) },
  { n: 20, len: 5, headline: "Find your weak units.", clip: "diagnostics", from: ev(0, 0.5), cam: wide(720, 420, 1.1) },
  { n: 21, len: 5, headline: "Compete with your class.", sub: "Shared practice-test leaderboards.", clip: "leaderboard",
    from: ev(0, 0.4), cam: [{ at: 0, zoom: 1.4, x: 720, y: 420 }, { at: 1, zoom: 1.5, x: 720, y: 450 }] },

  // Score (2 bars)
  { n: 22, chapter: true, len: 8, headline: "Know your score before May.", sub: "An estimate, not an official AP score.",
    clip: "score-calc", from: ev(0, 0.6), cam: [{ at: 0, zoom: 1.35, x: 720, y: 480 }, { at: 1, zoom: 1.45, x: 720, y: 540 }] },

  // Close (4 bars; the track ends under the end card)
  { n: 23, len: 4, headline: "Free and open source.", card: "plain" },
  { n: 24, len: 4, headline: "Built by a student.", card: "plain" },
  { n: 25, len: 8, headline: "Apex Scholar", sub: "Free for everyone. apex-scholar.com", card: "end" },
];

let at = OFFSET;
export const BEATS: Beat[] = SPECS.map((b, i) => {
  const start = i === 0 ? 0 : at;
  at += b.len * BEAT;
  return { ...b, start };
});

export const FILM_SECONDS = Math.ceil(at * 10) / 10;
export const LEGAL =
  "AP is a registered trademark of College Board, which is not affiliated with and does not endorse Apex Scholar.";
