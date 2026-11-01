import React from "react";
import { Composition, staticFile } from "remotion";
import { waitForFonts } from "./brand/fonts";
import { BEATS } from "./film/beats";
import { FILM_FRAMES, FPS, FilmProps, LaunchFilm } from "./film/LaunchFilm";

// Click logs and durations of the recorded clips; a clip not recorded yet is
// left out and its beat shows a placeholder card.
async function loadClips(): Promise<FilmProps["clips"]> {
  const names = [...new Set(BEATS.map((b) => b.clip).filter(Boolean))] as string[];
  const entries = await Promise.all(names.map(async (n) => {
    const res = await fetch(staticFile(`clips/${n}.json`));
    return res.ok ? [n, await res.json()] as const : null;
  }));
  return Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => !!e));
}

export const Root: React.FC = () => {
  return (
    <Composition
      id="LaunchFilm"
      component={LaunchFilm}
      durationInFrames={FILM_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ clips: {} } as FilmProps}
      calculateMetadata={async ({ props }) => {
        await waitForFonts();
        return { props: { ...props, clips: await loadClips() } };
      }}
    />
  );
};
