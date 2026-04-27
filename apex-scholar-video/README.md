# Apex Scholar Promo Video

A ~30-second promotional video for Apex Scholar, built with Remotion + TailwindCSS v4.

## Scenes

| # | Scene | Duration |
|---|-------|----------|
| — | Intro: logo + tagline | 3.3s |
| 1 | AI Tutors — subject-trained chat | 4s |
| 2 | Smart Scheduler — weekly grid | 4s |
| 3 | Practice Tests — MCQ + score dial | 4s |
| 4 | Flashcards — deck + flip | 4s |
| 5 | Solver — photo scan + steps | 4s |
| 6 | Diagnostics — unit mastery bars | 4s |
| — | Outro: logo + URL | 3s |

Scenes crossfade with a 10-frame overlap. A brand-colored progress bar runs along the bottom throughout.

## Brand

- **Colors:** base-950 background, teal primary (`#14b8a6`), slate-blue accent (`#3b82f6`)
- **Fonts:** Plus Jakarta Sans (display), Source Sans 3 (body) — loaded via `@remotion/google-fonts`
- **Dimensions:** 1920×1080 @ 30fps

## Commands

```bash
npm install
npm run dev        # Remotion Studio (preview)
npm run render     # Render to out/apex-scholar.mp4
```

## Structure

```
src/
  brand/           Brand primitives (BrandBackground, GlowCard, Logo, anim helpers, fonts)
  scenes/          One file per scene + shared FeatureShell
  ApexScholarPromo.tsx   Composition (sequence orchestration)
  Root.tsx         Remotion root + composition registration
  index.ts         registerRoot entrypoint
  tailwind.css     Tailwind v4 + brand design tokens
```
