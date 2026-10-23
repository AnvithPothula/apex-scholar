# Remotion production pipeline for a cinematic Apex Scholar launch video

Research date: 2026-10-22. Remotion docs were read from the docs source in `remotion-dev/remotion` (main branch, last commit 2026-10-22, `packages/docs/docs/*.mdx`). For each claim below the live page is cited as `remotion.dev/docs/<path>`, and the GitHub source path is given where the rendered page could not be fetched. Latest `remotion` on npm at research time: **4.0.538** (`npm view remotion version`).

## Q1. Which Remotion packages and techniques apply, and how does Remotion compare with Motion Canvas and Revideo?

### Takeaway
Remotion v4 covers everything this video needs. That includes TransitionSeries with roughly 20 presentations (several new WebGL "HTML-in-canvas" ones render headlessly with no setup), camera motion blur, R3F or CSS 3D, audio visualization, local Whisper captions, `--scale=2` for 4K and a free license for an individual. Motion Canvas and Revideo draw to canvas and **cannot render the app's real React/HTML components**, so they are ruled out for a "reuse the real UI" plan.

### Cited Findings
**Transitions (`@remotion/transitions`)**
- `<TransitionSeries>` behaves like `<Series>` but adds `<TransitionSeries.Transition>` between sequences, and a transition "shortens the total duration because both scenes overlap". `<TransitionSeries.Overlay>` renders on top of the cut point without changing timing. A transition is a `presentation` plus a `timing` (`springTiming({config:{damping:200}})` or `linearTiming({durationInFrames:30})`). — [remotion.dev/docs/transitions/transitionseries](https://www.remotion.dev/docs/transitions/transitionseries) (source: [transitionseries.mdx](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/transitions/transitionseries.mdx))
- The docs list these presentations: `fade`, `slide` (directions `from-left/right/top/bottom`), `wipe`, `flip` (has a `perspective` prop, default 1000), `clockWipe`, `iris` (v4.0.316, circular mask expanding from center), `none`, `pushCut` (v4.0.500, "a hard editorial cut energized by a short punch-in on both scenes and a brief flash at the edit point"), and `cube` (**paid**, remotion.pro). — [remotion.dev/docs/transitions/presentations](https://www.remotion.dev/docs/transitions/presentations) (sources: [presentations folder](https://github.com/remotion-dev/remotion/tree/main/packages/docs/docs/transitions/presentations))
- The newer **HTML-in-canvas** presentations are `blurSlide`, `bookFlip`, `crossZoom`, `crosswarp`, `dissolve`, `dreamyZoom`, `filmBurn`, `linearBlur`, `ripple`, `swap`, `zoomBlur` and `zoomInOut`. In Studio they require Chrome with `chrome://flags/#canvas-draw-element` (Chrome v149+). Rendering needs no setup: "We compiled a version of Chrome and made it the default, and enabled the flag for you". This works from v4.0.455 via `npx remotion render`. WebGL shader effects need `--gl=angle`. — [remotion.dev/docs/html-in-canvas-guide](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/html-in-canvas-guide.mdx)
- `useTransitionProgress()` exists for scenes that react to their own enter/exit progress, and audio transitions are documented. — [transitions folder](https://github.com/remotion-dev/remotion/tree/main/packages/docs/docs/transitions)

**Motion blur (`@remotion/motion-blur`)**
- `<CameraMotionBlur>` produces "natural looking motion blur similar to what would be produced by a film camera". Children must be absolutely positioned (`<AbsoluteFill>`). `shutterAngle` defaults to 180, and `samples` sets smoothness. Caveat: "The technique is destructive to colors", so keep `samples` low. — [remotion.dev/docs/motion-blur/camera-motion-blur](https://www.remotion.dev/docs/motion-blur/camera-motion-blur)
- `<MotionBlur>` is deprecated in favour of `<Trail>` or `<CameraMotionBlur>`. Common mistake: calling `useCurrentFrame()` *outside* the blur component breaks the effect, because the blur manipulates the time context. — [motion-blur.mdx](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/motion-blur/motion-blur.mdx), [common-mistake.mdx](https://www.remotion.dev/docs/motion-blur/common-mistake)
- There is also an HTML-in-canvas motion blur variant (`motion-blur/html-in-canvas-motion-blur.mdx`). — [motion-blur folder](https://github.com/remotion-dev/remotion/tree/main/packages/docs/docs/motion-blur)

**3D**
- `@remotion/three` gives `<ThreeCanvas>` (R3F, where Remotion hooks replace `useFrame()`), `<ThreeWebGPUCanvas>`, and `useVideoTexture()` / `useOffthreadVideoTexture()` for mapping a video onto a 3D surface. The starter [template-three](https://github.com/remotion-dev/template-three) "features a 3D phone with a video inside which you can effortlessly swap out". — [remotion.dev/docs/three](https://www.remotion.dev/docs/three)

**Audio**
- `@remotion/media-utils`: `useAudioData()` / `getAudioData()` plus `visualizeAudio({fps, frame, audioData, numberOfSamples})` return a per-frame amplitude spectrum, e.g. `[0.22, 0.1, 0.01, ...]`. — [remotion.dev/docs/audio/visualization](https://www.remotion.dev/docs/audio/visualization)
- `@remotion/sfx` ships ready-made sound effects such as `whip` and `whoosh`, also on the `https://remotion.media/whoosh.wav` CDN. The docs point to freesound.org (many CC0 sounds) for more. — [remotion.dev/docs/audio/sfx](https://www.remotion.dev/docs/audio/sfx)
- I found **no beat-detection or BPM API** in the Remotion docs (grep for "beat detect|bpm" across the docs source returned nothing). — [docs source](https://github.com/remotion-dev/remotion/tree/main/packages/docs/docs)

**Captions**
- `@remotion/install-whisper-cpp` provides `installWhisperCpp({to, version:'1.5.5'})`, `downloadWhisperModel({model:'medium.en'})`, `transcribe({... tokenLevelTimestamps:true})` and `toCaptions()`, which writes a `Caption[]` JSON. Audio must first be a 16 kHz WAV (`ffmpeg -i in -ar 16000 out.wav`). — [remotion.dev/docs/install-whisper-cpp](https://www.remotion.dev/docs/install-whisper-cpp)
- `@remotion/captions` (v4.0.216) offers `Caption` type, `createTikTokStyleCaptions()` (`combineTokensWithinMilliseconds` controls word-by-word versus paged display; leading spaces in `text` are required), `parseSrt`, `serializeSrt` and `parseVtt` (v4.0.537). — [remotion.dev/docs/captions/create-tiktok-style-captions](https://www.remotion.dev/docs/captions/create-tiktok-style-captions), [captions/api](https://www.remotion.dev/docs/captions/api)

**Video, metadata and rendering**
- `<OffthreadVideo>` extracts the exact frame with FFmpeg outside the browser during render. For new code, "prefer `<Video>` from `@remotion/media`". — [remotion.dev/docs/offthreadvideo](https://www.remotion.dev/docs/offthreadvideo)
- `calculateMetadata()` makes duration, width, height and fps dynamic (e.g. from voiceover length). It runs "a single time, independently from the concurrency of the render", so it fits awaiting fonts or measuring audio. — [remotion.dev/docs/calculate-metadata](https://www.remotion.dev/docs/calculate-metadata)
- `--scale` multiplies output resolution (0 < scale ≤ 16). Vector content and fonts render "with extra details", so a 1920×1080 composition rendered with `--scale=2` gives native-quality 3840×2160. `Config.setScale(2)` also works. — [remotion.dev/docs/scaling](https://www.remotion.dev/docs/scaling), [cli/render](https://www.remotion.dev/docs/cli/render)
- Tailwind: `@remotion/tailwind` (v3) and `@remotion/tailwind-v4` are separate packages, both wired via `enableTailwind()` in the bundler config override. — [remotion.dev/docs/tailwind/overview](https://www.remotion.dev/docs/tailwind/overview)
- Agent Skills: `npx skills add remotion-dev/skills` installs `/remotion-best-practices`, `/remotion-create`, `/remotion-markup` and others for Claude Code. — [remotion.dev/docs/ai/skills](https://www.remotion.dev/docs/ai/skills)

**License**
- The Free License covers "an individual, whether for personal or commercial use", organizations "with up to 3 people", and non-profits. It has no functional restrictions, and you "can make money under the Free License". Single-person companies qualify if headcount ≤ 3. — [remotion.dev/docs/license/faq](https://www.remotion.dev/docs/license/faq)
- Conflict: a third-party guide says Remotion is "free for open-source and small companies; paid tiers above $1M ARR". That **contradicts** Remotion's own FAQ, which uses headcount, not revenue. Trust the FAQ. — [pkgpulse (Mar 2026)](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026) vs [Remotion FAQ](https://www.remotion.dev/docs/license/faq)

**Motion Canvas and Revideo**
- Motion Canvas is canvas-based and imperative. "Arbitrary HTML and CSS aren't supported", so content must use its scene graph (`Txt`, `Rect`, `Img`...). It is MIT licensed, ~8K weekly downloads. Revideo is an MIT fork of Motion Canvas that adds a Node `renderVideo()` API, ~3K weekly downloads. Remotion has ~60K weekly downloads and renders any browser CSS, SVG or font. — [pkgpulse (Mar 2026)](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026)
- One 2026 blog claims Revideo "has folded into Midrender" (a commercial editor). This is unconfirmed by a second source. — [wireflow.ai](https://www.wireflow.ai/blog/best-remotion-alternatives-in-2026)

### Inferences
- The objective is to reuse a React + Tailwind app's UI. That alone decides the tool: only Remotion renders the DOM. Motion Canvas or Revideo would mean redrawing every UI element in a canvas scene graph, which is the opposite of reuse.
- For a "non-slideshow" feel, use `pushCut`, `zoomBlur`, `crossZoom` and `linearBlur` (all render headlessly) plus continuous camera moves inside long scenes. Avoid fade or slide between every feature, which is what the current promo does.
- Beat sync will need an offline step, e.g. a one-off script with an onset/beat tracker (aubio or librosa) that writes `beats.json`. Remotion's `visualizeAudio` low-frequency bins can drive per-frame "pulse" accents but are not a beat grid.

### Gaps
- I could not fetch the rendered remotion.dev pages for the presentation index (it is JS-rendered). The presentation list comes from the docs source files, so exact rendered page slugs are unverified for the HTML-in-canvas presentations.
- I found no authoritative 2026 maintenance data (commit cadence) for Motion Canvas or Revideo.

## Q2. How do you fake cursors, clicks, typing, zoom-to-region and scrolling, and are there example repos or templates?

### Takeaway
None of these are built into Remotion. They are all small frame-driven components: `interpolate` or `spring` on a position, an SVG cursor, a `scale + translate` "camera" wrapper, a sliced string for typing, and `translateY` for scrolling. Remotion's own new **Canvas Capture** extension (HTML-in-canvas, up to 30× supersampled web recording with cursor metadata) is the first-party answer for crisp zoomed screen footage. There is no official open-source "SaaS launch video" template.

### Cited Findings
- All Remotion animation "must be driven by the value returned by the `useCurrentFrame()` hook". CSS animations can be synced only through `animation-play-state` and `animation-delay`. — [remotion.dev/docs/third-party](https://www.remotion.dev/docs/third-party)
- A published "cursor-and-clicks" rule set for Remotion product demos covers several techniques:
  - Render an SVG cursor and move it with `interpolate`.
  - A click is ~8 frames: the cursor scales down (`scale(1 - press*0.14)`), the target scales slightly (`1 + press*0.05`), and a ring pulses outward.
  - Cursor travel takes 30–40 frames for a full-screen diagonal.
  - When zooming, render the cursor **inside** the zoomed container so it stays locked to the target with no inverse-transform math.
  — [daemora cursor-and-clicks.md](https://github.com/codeandcanvaslabs/daemora/blob/982bd4a01c47eeaa314afd01e945a43640d8b3e0/crew/video-editor/rules/cursor-and-clicks.md)
- An open-source recorder's auto-zoom design records clicks and mouse at 120 fps, normalizes coordinates to 0–1, creates zoom regions centered on clicks, and smooths the camera with Catmull-Rom splines and Perlin `smootherStep`. — [openscreen PR #67](https://github.com/siddharthvaddem/openscreen/issues/67)
- Screen Studio-style polish comes from motion blur applied separately to cursor movement, zoom-in and panning, with "Focused" vs "Smooth" camera settling. — [screen.studio/guide/animations](https://screen.studio/guide/animations)
- Remotion **Canvas Capture** is described as "a high-fidelity webpage recorder which leverages HTML-in-canvas. It can record content at a higher resolution than the native display resolution. Perfect for product demos showing closeups of UI". Details:
  - Capture area can be the viewport, an element selector with padding, or a rectangle. The output box defaults to 2560×1440, scale is capped at 30×, and output is MP4 (H.264) or WebM (VP9).
  - It exposes WebMCP tools (`setup_shot` etc.) so an agent can frame the shot, while you perform the interaction yourself.
  — [remotion.dev/docs/canvas-capture](https://www.remotion.dev/docs/canvas-capture), [agentic-shot-setup](https://www.remotion.dev/docs/canvas-capture/agentic-shot-setup)
- Canvas Capture requirements: an Apple Silicon Mac and a pinned **Chrome for Testing 150.0.7842.0**. The docs warn that browser gets no security updates ("Only use it with websites you trust"). — [remotion.dev/docs/canvas-capture/installation](https://www.remotion.dev/docs/canvas-capture/installation) (via search summary)
- Remotion's announcement script for Canvas Capture says:
  - The extension "records the mouse position and embeds it as metadata in the video".
  - In Remotion Studio, "screen and cursor [are] completely independent layers, and you get editable keyframes for the type of cursor, mouse position and scale".
  - It mentions a "new 3D rotation tool and linear progressive blur".
  — [remotion-dev/remotion#10354](https://github.com/remotion-dev/remotion/issues/10354) (closed 2026-08)
- Official templates are listed on [remotion.dev/templates](https://www.remotion.dev/templates). None is a SaaS launch promo:
  - Recorder, Code Hike, Stargazer, TikTok (word-by-word captions), Audiogram, Music Visualization, 3D, Overlay.
  - Paid: Editor Starter, `<Timeline />`, Watercolor Map.
- Third-party Remotion cursor components ("Adaptive Cursor", "Cursor Spotlight Reveal", "Zoom Follows the Click") exist on 21st.dev. Installing them requires a 21st API key, and the 21st.dev MCP failed to authenticate in this session. — [21st.dev cursor-adaptive](https://21st.dev/@21st/components/cursor-adaptive), [zoom-follow](https://21st.dev/@21st/components/zoom-follow.md)
- The Google "Stitch" Remotion walkthrough skill has a `ScreenSlide.tsx` with zoom-in and fade over app screens (search summary only; not verified). — [skillselion stitch remotion](https://skillselion.com/skills/leonxlnx/stitch-skills/remotion)
- The Remotion showcase has launch videos but is not taking new submissions. — [remotion.dev/showcase](https://remotion.dev/showcase)

### Inferences
These patterns are about 150 lines total in one `camera/` folder:
- **Camera / zoom-to-region:** one `<Camera keyframes={[{f, x, y, scale}]}>` wrapper that interpolates `transform: translate(-x,-y) scale(s)` with `Easing.bezier(0.65,0,0.35,1)` or a `spring({damping:200})` between keyframes. Wrap it in `<CameraMotionBlur shutterAngle={180} samples={6}>` only for fast moves, because blur is costly and color-destructive.
- **Cursor:** an absolutely positioned SVG inside the Camera layer, with a position spring between waypoints, a slight arc (bezier midpoint offset) so moves don't look robotic, and the 8-frame press/ripple.
- **Typing:** `text.slice(0, Math.floor(interpolate(frame,[start,end],[0,text.length],{extrapolateRight:'clamp'})))` plus a blinking caret (`Math.floor(frame/15)%2`). Feed the sliced string as the *prop/value* of the real input component (e.g. tutor chat composer, `FrqAnswerBox value`).
- **Smooth scroll of a long page:** render the full-height page in a clipped viewport and animate `translateY` with an eased curve. Don't use `scrollTop`; transforms stay deterministic across Remotion's parallel tabs.
- **3D tilt hero shots:** CSS `perspective: 2000px` on a parent plus `rotateX(12deg) rotateY(-18deg)` springing to 0 is enough for "device tilt" shots of real DOM. Use `@remotion/three` only if a physical laptop or phone model is wanted, and then the UI must go in as a video texture, not live DOM.

### Gaps
- I did not verify the code inside the 21st.dev or Stitch components (an API key is needed and they are third-party).
- I could not confirm whether Canvas Capture's cursor-metadata layer is usable in a plain `remotion render` pipeline or only via Studio and remotion.dev/convert.

## Q3. How can the app's real Tailwind + design-token React components be reused inside Remotion, and what are the pitfalls?

### Takeaway
Yes, but there are several pitfalls:
- The app (React 18, Tailwind **v3** with a custom `color-mix` token function, Framer Motion 11) and the existing video project (React **19**, Tailwind **v4**) are on different major versions.
- Several target components contain time-based animation (`framer-motion`, `requestAnimationFrame`) or app-context hooks (`useAuth`, `useConfirm`, `useNavigate`).

The fix is to drive the presentational components with props and state chosen per frame, and to load the app's compiled CSS rather than re-deriving the tokens.

### Cited Findings
- Animations not driven by `useCurrentFrame()` break because Remotion renders frames in parallel tabs that "don't share state". The workaround `--concurrency=1` is "way slower and ... correct timing ... still not guaranteed". — [remotion.dev/docs/flickering](https://www.remotion.dev/docs/flickering)
- Framer Motion: "At the moment, we don't have a Framer Motion integration", tracked in [remotion#399](https://github.com/remotion-dev/remotion/issues/399). — [remotion.dev/docs/third-party](https://www.remotion.dev/docs/third-party)
- Motion's `MotionConfig skipAnimations` (and the global `MotionGlobalConfig.skipAnimations = true`) makes values "set immediately", intended for testing and visual regression. — [Motion docs mirror](https://www.mintlify.com/motiondivision/motion/api/motion-config), [motion PR #2671](https://redirect.github.com/framer/motion/pulls). Note: it is a third-party mirror; check against the installed `framer-motion@11.18.2` before relying on it.
- Asset loading: wait for fonts and use `delayRender()` for data. `background-image` and `mask-image` CSS can flicker. — [remotion.dev/docs/flickering](https://www.remotion.dev/docs/flickering)
- Tailwind v3 in Remotion uses `@remotion/tailwind` + `enableTailwind()`; v4 uses `@remotion/tailwind-v4`. — [remotion.dev/docs/tailwind/overview](https://www.remotion.dev/docs/tailwind/overview)

**Local repo facts (read-only inspection)**
- `ap-prep-hub` versions: `react@^18.3.1`, `tailwindcss@3.4.17`, `framer-motion@11.18.2`, `react-scripts@5.0.1`, `firebase@^10.14.1`, `katex`, `lucide-react`. The Tailwind config maps colors to CSS variables through a custom `tok()` function emitting `color-mix(in srgb, var(--color-x) calc(opacity*100%), transparent)`. `src/index.css` uses `@tailwind base/components/utilities` with ~110 `--` custom properties and `:root,[data-theme="dark"]` / `[data-theme="light"]` themes. (Files: `ap-prep-hub/package.json`, `tailwind.config.js`, `src/index.css`.)
- Fonts are self-hosted (`public/fonts/plus-jakarta-sans-latin.woff2`, `source-sans-3-latin.woff2`, `fonts.css`), per `public/index.html` lines 32–39.
- A compiled stylesheet exists at `ap-prep-hub/build/static/css/main.d23403ad.css` (build dated 2026-10-22).
- Component coupling, by grep:
  - **Clean, props-driven, no Firebase or motion:** `tutors/SimWidget.jsx` (props `spec, fallback, renderMarkdown`; internal `useState` for scene and meters), `tutors/GraphWidget.jsx` (`spec`), `tutors/StepReveal.jsx` (`spec, fallback, renderMarkdown`), `practice/FrqAnswerBox.jsx` (`value, onChange, images, onImagesChange`), `study/MarketLab.jsx`.
  - **Uses framer-motion:** `practice/TestPanel.jsx` (2 motion usages; also needs `useConfirm` context and `useSplitPane`) and `practice/ResultsPanel.jsx` (22 time-based hits including `AnimatedCounter`, which uses `requestAnimationFrame`, and `useNavigate`).
  - **Needs auth or Firebase:** `scheduler/CalendarGrid.jsx` (`useAuth`), `scheduler/APExamDashboard.jsx`, `tutors/SubjectSelector.jsx`.
  - `study/ProjectileLauncher.jsx` has 3 time-based hits (likely rAF physics).

### Inferences
**Recommended reuse approach (lowest effort):**
1. Keep the video as its own package. Don't import across into CRA's webpack. Add a webpack alias `@app → ../ap-prep-hub/src` in `remotion.config.ts` (`Config.overrideWebpackConfig`). Pin the video project to **React 18.3** to match the app, because one React copy is required for hooks across the boundary; currently it is React 19.
2. Styling: the cheapest correct option is to import the app's **compiled** `build/static/css/main.*.css` in the composition root. It carries every token, both themes and the `color-mix` utilities. Then set `data-theme="dark"` on the root `AbsoluteFill`. Re-running Tailwind v3 via `@remotion/tailwind` with the app's `tailwind.config.js` is the "live" alternative. The existing hand-copied v4 tokens in `apex-scholar-video/src/tailwind.css` will drift from the app.
3. Fonts: keep the existing `@remotion/google-fonts` loaders (same families), or use `@remotion/fonts` with `staticFile()` on the app's woff2 files for byte-identical glyphs.
4. Make interactive components frame-driven. For `SimWidget`, either:
   - (a) remount it with a `key` per beat and pre-baked state; or
   - (b) prefer a 5-line fork, or an optional `controlled` prop (e.g. `{sceneId, meters, last}`) so the composition picks the state from `frame`.

   `useState` in a component that is re-rendered per frame in separate tabs cannot be "clicked". The cursor click is staged visually while the state flips on a chosen frame.
5. Framer Motion components: wrap them in `<MotionConfig skipAnimations>` (or set the global flag in the Remotion entry) so they render final states. Then do all entrance motion with Remotion `spring`/`interpolate` on wrappers. Swap `AnimatedCounter` for a frame-driven counter (the existing `PracticeTestsScene` already does this with `spring` 0→5).
6. Data mocking: feed fixtures as props, e.g. a real `apex-sim` spec string or a saved test JSON. Stub contexts (`ConfirmContext`, `AuthContext`, a `MemoryRouter`) with tiny providers, and alias `firebase` to an empty module so nothing hits the network. Use `delayRender` only if KaTeX or markdown needs async.

### Gaps
- I did not verify that `skipAnimations` exists in framer-motion **11.18.2** specifically (the PR was opened May 2024, which suggests ≥11.x, but this is unconfirmed).
- I did not test-compile any app component inside Remotion (read-only constraint). CRA-specific imports (SVG-as-component, `process.env.REACT_APP_*`) may need extra aliases.

## Q4. Is Playwright screen capture a viable deterministic alternative source?

### Takeaway
Playwright's `recordVideo` is fine for scratch footage but is not a deterministic 60 fps master:
- Size defaults to fit within 800×800.
- Chromium output was historically capped at ~1 Mbit/s.
- Custom `fps` only arrived in v1.64.

For crisp, zoomable captures, use Canvas Capture or render real components in Remotion. Use Playwright as a scripted driver plus a click-coordinate logger that feeds the Remotion camera.

### Cited Findings
- `recordVideo: {dir, size}`. Size "defaults to the viewport size, scaled down to fit within 800x800". Video is finalized only when the context closes. `show.actions` can annotate actions. — [playwright.dev/docs/videos](https://playwright.dev/docs/videos)
- Playwright 1.64.0 added an `fps` option to `testOptions.video`, `recordVideo` and `screencast.start()`, and switched to VP9. "Firefox and WebKit currently capture up to 25 frames per second". — [Playwright 1.64.0 release notes](https://newreleases.io/project/npm/playwright/release/1.64.0)
- A feature request reports that Chromium's target bitrate was hardcoded at 1 Mbit/s, so 1280×720 recordings looked poor and quality was not configurable. It is unclear whether 1.64's VP9 change resolves this. — [microsoft/playwright#31424](https://github.com/microsoft/playwright/issues/31424)
- A July 2026 demo-recording recipe uses Playwright at a 1280×720 viewport with fixed demo data and timed pauses, then ffmpeg crop and transcode (VP9 `-crf 35`, H.264 `yuv420p`). It notes that you must re-record whenever the UI changes. — [flaviocopes.com](https://flaviocopes.com/record-demo-video-playwright.md)
- Recorded clips go into Remotion via `<Video>` (`@remotion/media`) or `<OffthreadVideo src={staticFile('clip.webm')}>`, which extracts exact frames with FFmpeg. — [remotion.dev/docs/offthreadvideo](https://www.remotion.dev/docs/offthreadvideo)
- Zooming into an ordinary screen recording makes "your video become ... super blurry and has visible artifacts". This is Remotion's stated motivation for Canvas Capture. — [remotion#10354](https://github.com/remotion-dev/remotion/issues/10354)

### Inferences
- **Hybrid plan:**
  - Use real components in Remotion for hero close-ups (SimWidget, GraphWidget, StepReveal, MCQ answer reveal). They are infinitely sharp at `--scale=2`.
  - Use Canvas Capture (or Playwright at `deviceScaleFactor: 2` with a 2560×1440 viewport) for flows that are hard to stage, e.g. full-page navigation or a live AI tutor streaming a response, against `localhost:3000` with seeded data.
  - Log click coordinates from the Playwright script (`page.on` + `boundingBox()`) to JSON so the Remotion camera and cursor keyframes line up with the footage.
- An alternative for true frame-exact capture is stepping virtual time and screenshotting each frame (CDP `Emulation.setVirtualTimePolicy`). That is more work than staging the component in Remotion, which already is a frame-stepped Chrome renderer.

### Gaps
- I found no primary-source confirmation of Chromium's current bitrate or default fps for `recordVideo` in Playwright ≥1.64.
- Canvas Capture platform requirements (Apple Silicon, pinned Chrome for Testing) came via search summary of the installation page, not a direct read.

## Q5. What already exists in the repo, which components make the best on-screen moments, and what are the pipeline and effort?

### Takeaway
A Remotion project **already exists** at `apex-scholar-video/` (Remotion 4.0.402, React 19, Tailwind v4, Google Fonts, 1920×1080@30). It is exactly the "slideshow" the user wants to replace:
- 8 fixed-length scenes: intro, 6 features × 4 s, outro.
- All 10-frame crossfades through a shared `FeatureShell`: index label, big headline, subtitle and a mock card.
- All UI **redrawn as mock markup** rather than real app components.
- **No audio** (the rendered MP4's AAC track measures −91 dB, i.e. silent).

Keep its brand primitives and font loading. Replace the scene architecture with a continuous-camera, real-component timeline.

### Cited Findings (local inspection, read-only)
**Existing video project**
- `find . -name package.json -not -path '*/node_modules/*' | xargs grep -l remotion` matched `./apex-scholar-video/package.json` and a copy in `.claude/worktrees/xenodochial-ellis-62d2a1/apex-scholar-video/`.
- `apex-scholar-video/package.json` pins `remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/fonts`, `@remotion/google-fonts` and `@remotion/tailwind-v4` all at **4.0.402** (latest is 4.0.538), with `react@19.0.0` and `tailwindcss@^4`. Scripts: `studio`, `render` → `out/apex-scholar.mp4`, `render:gif`. It does **not** include `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/media-utils`, `@remotion/captions` or `@remotion/three`.
- `remotion.config.ts` sets `setVideoImageFormat("jpeg")` and `enableTailwind` (v4). `Root.tsx` registers one composition, `ApexScholarPromo`, at 1920×1080, 30 fps, with `calculateMetadata` awaiting fonts.
- `ApexScholarPromo.tsx` builds the timeline from manual `<Sequence from=...>` offsets (INTRO 100, FEATURE 120, OUTRO 90, OVERLAP 10 frames) plus a bottom progress bar. Total ≈ 28.05 s (ffprobe).
- `src/brand/` holds `anim.ts` (`crispSpring`, `softSpring`, `entrance`, `sceneFade`, `popIn`), `fonts.ts` (Plus Jakarta Sans and Source Sans 3 via `@remotion/google-fonts`), `BrandBackground`, `GlowCard` and `Logo`. `src/scenes/` holds 9 files (~1,900 lines) re-implementing UI mockups. No scene imports anything from `ap-prep-hub`.
- No `<Audio>`, `staticFile` audio, or `TransitionSeries` usage was found in the sources. Rendered `out/apex-scholar.mp4` is 1920×1080 H.264 with a silent AAC track (`volumedetect` mean/max −91 dB).
- Visual check of `out/frame-400.png`: headline "AI-generated full-length practice tests.", subtitle, a mocked MCQ card and a "5.0 out of 5" ring. This is a slide layout.

**Best on-screen moments in `ap-prep-hub/src`, ranked by visual payoff ÷ integration cost**
1. `components/tutors/SimWidget.jsx` (107 lines): a branching scenario with meters that move per choice, rendered inside tutor chat. Pure props plus `useState`; no Firebase or motion. **Hero moment:** cursor picks a choice, meters animate, the feedback card appears.
2. `components/tutors/GraphWidget.jsx` (242 lines): a tutor-drawn interactive graph from a spec. No Firebase or motion. Good for a "camera push-in while the curve draws" shot (animate the spec or a clip-path per frame).
3. `components/tutors/StepReveal.jsx` (108 lines): step-by-step reveal of a worked solution. Clean props. A natural fit for beat-synced reveals.
4. `components/practice/TestPanel.jsx` (560 lines): the Bluebook-style exam screen (timer, cross-out, flag, split source pane). It is high recognition value for AP students, but needs `ConfirmContext` and has framer-motion.
5. `components/practice/FrqAnswerBox.jsx` (123 lines): photo upload of handwritten FRQ work. Pass `images=[fixture]` to show the "snap your handwriting" moment.
6. `components/practice/ResultsPanel.jsx` (667 lines): score, rubric and "why wrong". Heavily framer-motion plus `AnimatedCounter` (rAF) plus `useNavigate`. Highest integration cost; use a recording or a cropped subset.
7. `components/study/*` (33 study-pack sims): e.g. `MarketLab`, `PPCExplorer`, `ProjectileLauncher`, `VSEPRExplorer`, `NeuronFiring`, `EnergyPyramid`, `FlipCards`. These are great "breadth montage" material in a fast push-cut sequence (6–10 sims × 12–20 frames each). `ProjectileLauncher` uses time-based animation and needs a frame-driven prop.
8. `components/scheduler/CalendarGrid.jsx` and `APExamDashboard.jsx` are coupled to `useAuth` and Firebase, so use a recording. Flashcards live in `pages/Flashcards.js` (only `flashcards/QuizletImport.jsx` is a component), so use a recording or the existing mock scene.

### Inferences
**Pipeline (recommended)**
1. **Script and VO first.** Write a 45–60 s script. Generate or record the VO, then run `@remotion/install-whisper-cpp` to get `captions.json`. `calculateMetadata` sets duration from the VO length and computes beats from `beats.json`.
2. **Music:** a licensed track. Precompute the beat grid offline. Snap camera-move starts and push-cuts to beats; use `visualizeAudio` bass energy for subtle glow or scale pulses on the brand background.
3. **Scenes (non-slideshow):**
   - Cold open: tilted 3D "wall" of real study-pack sims flying past with `CameraMotionBlur`.
   - Push-in to the tutor chat; typing animation in the composer.
   - The tutor answers and a `SimWidget` appears; the cursor makes 2 choices while meters swing; `zoomBlur`.
   - `GraphWidget` curve draw; `StepReveal` on beats; `pushCut`.
   - Bluebook `TestPanel` with timer ticking, cross-out and flag; snap a photo into `FrqAnswerBox`.
   - Results score count-up (frame-driven); `crossZoom` to a logo lockup and URL.
   - Treat captions as kinetic typography, not lower-thirds.
4. **SFX:** `@remotion/sfx` whoosh on transitions, soft clicks on cursor presses, ticks on typing (low volume).
5. **Outputs:**
   - Master 1920×1080@30 or 60.
   - 4K via `npx remotion render <id> out/launch-4k.mp4 --scale=2`.
   - 9:16 as a second `<Composition>` at 1080×1920 that reuses the same scene components with a different camera keyframe set, plus TikTok-style captions via `createTikTokStyleCaptions`. Don't center-crop; most UI moments are horizontal.
6. **Upgrade the existing project:** `npx remotion upgrade` (4.0.402 → 4.0.538), then add `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/media-utils`, `@remotion/captions`, `@remotion/install-whisper-cpp`, `@remotion/sfx` and `@remotion/media`. Downgrade React to 18.3 if importing app components. Optionally run `npx skills add remotion-dev/skills`.

**Effort estimate (solo dev familiar with the codebase; inference, not sourced)**

| Task | Estimate |
|---|---|
| Setup: upgrade, aliases, app CSS import, context and Firebase stubs, React 18 pin | 0.5–1 day |
| Camera, cursor, typing and scroll primitives | ~1 day |
| 6–8 shots with real components and choreography | 3–5 days (≈0.5 day per shot, more for TestPanel/ResultsPanel) |
| VO, captions, music, beat grid and SFX | 1–2 days |
| 9:16 variant (camera re-keying) | 1 day |
| Polish and render passes | 1–2 days |
| **Total** | **~1.5–2.5 weeks** of focused work for a 45–60 s cinematic cut plus vertical cut-downs |

Fastest path at roughly half the cost: real components only for SimWidget, GraphWidget and StepReveal, and Canvas Capture or Playwright recordings for everything else.

**Risks**
- React 18/19 mismatch.
- Tailwind v3 token CSS conflicting with the video project's v4 base styles. Scope or drop the v4 preflight.
- KaTeX font loading flicker; use `delayRender` until fonts are ready.
- Rendering time with `CameraMotionBlur` (samples × frames).

### Gaps
- I did not run Remotion Studio or render anything (read-only constraint), so integration cost per component is estimated from imports and grep only.
- I could not confirm whether the `.claude/worktrees/xenodochial-ellis-62d2a1/apex-scholar-video` copy differs from the main one.
- The source files (`PracticeTestsScene.tsx` headline "Know your score. Before May.") and the saved frame PNG ("AI-generated full-length practice tests.") disagree, so `out/` renders may be stale relative to source.
