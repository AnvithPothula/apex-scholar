// One entry per piece of real footage the film uses. `url` is opened first,
// `prepare` runs before recording starts, `run` is what gets recorded.
// Keep each shot short (2-6 s); the film cuts on camera moves, not long takes.
export const SHOTS = {
  // Pipeline check: a public study pack (no sign-in needed) scrolling to a sim.
  'test-study-pack': {
    url: '/study',
    async run(a) {
      await a.wait(500);
      await a.scroll(1600, 2000);
      await a.wait(800);
    },
  },
};
