# Apex Scholar launch film

A 93-second, music-only launch film (16:9, 60 fps) built with Remotion from real footage of the app.

## Commands

```bash
npm install
npm run dev          # Remotion Studio
npm run render       # out/launch-film-1080p.mp4
npm run render:4k    # out/launch-film-2160p.mp4
```

## Footage

`capture/` records the running app (`npm start` in `ap-prep-hub`) with Playwright:

```bash
node capture/seed-demo.mjs          # seed the capture account with made-up demo data
node capture/record.mjs --login     # sign in once
node capture/record.mjs --all       # record every shot in shots.mjs
```

Each shot lands in `public/clips/<shot>.mp4` with a `.json` click log that the film uses to draw the cursor.

## Structure

```
src/film/beats.ts       on-screen text and timing, one entry per beat
src/film/LaunchFilm.tsx the composition
src/brand/              logo and fonts
public/                 clips, music, sound effects, photos
```
