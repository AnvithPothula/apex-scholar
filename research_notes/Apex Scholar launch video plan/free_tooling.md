# Free Tooling and Assets for an Apex Scholar Launch Video (as of 2026-10-22)

> Two cross-cutting flags for the report writer, which apply to several sections below:
> 1. **Age gates.** The Gemini API terms say "You must be 18 years of age or older to use the APIs" ([Gemini API Additional Terms, updated 2026-04-28](https://ai.google.dev/gemini-api/terms)). ElevenLabs terms say "If you are under 18 years of age (or the age of legal majority where you live), you may not use our Services", with no parental-consent route ([ElevenLabs ToS, updated 09 Oct 2026](https://elevenlabs.io/terms-of-use)). Suno allows under-18 users only "with the express consent of your parent or guardian" and bars under-13s ([Suno Terms, rev. Aug 10 2026](https://suno.com/terms)). If the developer is under 18, Gemini TTS through his own key and ElevenLabs are not permitted by their terms. Local open-source models, his own voice, and asset libraries without such gates are the clean options.
> 2. **"Commercial" vs. "free product".** Apex Scholar is free, but a launch or promo video for a product is plausibly "commercial/promotional" use under most vendor terms. Several free tiers ban that outright: ElevenLabs Free ("cannot be used for any commercial purpose"), Cap Free ("personal use only"), Suno/Udio Free ("personal and non-commercial"). The conservative reading is to treat the launch video as commercial use.

---

## 1. Programmatic / motion video (Remotion, Motion Canvas, Revideo, Theatre.js)

### Takeaway
Remotion is free for this user. Its v5.0 terms give a Free License to any individual "for personal or commercial use" and to teams of up to 3 people, with no revenue cap. Local rendering needs no paid Renders. Because it is React, it is the most natural fit for recreating Apex Scholar's React 18 + Tailwind UI as animated scenes. Motion Canvas and Revideo are MIT-licensed alternatives, but they use their own generator or canvas APIs rather than React DOM.

### Cited Findings
- Remotion Free License covers: "an individual using the Remotion Software for personal or commercial use; an organization or team of individuals with up to 3 people; a non-profit…; or evaluating…" — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- The terms page states no revenue limit. The only threshold is headcount (4+ people need a Company License). — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- Company License prices: Creators $25 per seat per month (no minimum); Automators $0.01 per render with a $100/month minimum spend; Enterprise $500/month minimum. — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- "The deployment of Remotion Software in a purely local setting, without using server rendering, does not require the purchase of Renders." — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- The terms "take effect upon the release of Remotion 5.0 and will apply to version 5.0 and all subsequent versions". Older versions had different wording. — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- The Remotion repo shows license "other" (source-available, not OSI) and was actively updated on 2026-10-22. — `gh repo view remotion-dev/remotion` (GitHub API, checked 2026-10-22)
- Example from the terms: a three-person studio that renders in-house and delivers MP4s qualifies for the Free License. The client's headcount doesn't count. — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- Motion Canvas: MIT license, not archived, last push 2026-07-02. — [github.com/motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas) (GitHub API)
- Revideo ("Create Videos with Code"): MIT license, not archived, last push 2026-07-15. — [github.com/redotvideo/revideo](https://github.com/redotvideo/revideo) (GitHub API)
- Theatre.js: `@theatre/core` is Apache-2.0 and `@theatre/studio` (the editor) is AGPL-3.0. "Your project's final bundle only includes @theatre/core, so only the Apache License applies." — [Theatre.js README](https://github.com/theatre-js/theatre)
- Theatre.js README: "We have _temporarily_ moved development to a private repo… Terms and license will remain OSS." The public repo's last push was 2024-08-14. — [Theatre.js README](https://github.com/theatre-js/theatre); GitHub API
- A Remotion agent skill (`remotion-best-practices`) is already installed in this user's Claude Code environment. — local skills listing

### Inferences
- For a solo high-schooler, Remotion costs $0 for both license and local rendering. Recreated UI components can reuse the app's own Tailwind classes, because Remotion renders real React/DOM in headless Chrome.
- Motion Canvas and Revideo draw to canvas with their own component model, so the UI would have to be rebuilt rather than reused. They are a weaker fit for "animate our actual React UI".
- Theatre.js looks stalled in public (no public push in over 2 years). Its core is a keyframe and timeline library rather than a video renderer, so it would still need a capture or render pipeline. It is not recommended as the primary tool.
- Revideo's public activity slowed (last push July 2026). The repo isn't archived, but long-term maintenance is uncertain.

### Gaps
- I found no reliable 2025–2026 source on genuinely new code-to-video tools beyond these (for example, HyperFrames-style HTML-to-video or AI "prompt-to-Remotion" tools). Not researched due to tool budget.
- I didn't verify Motion Canvas or Revideo current feature status (audio sync, rendering speed) beyond license and repo activity.

---

## 2. Editors (DaVinci Resolve, CapCut, Kdenlive, Shotcut, Blender, Canva)

### Takeaway
DaVinci Resolve (free) is the strongest free editor for a 1080p/4K launch video. Its limits are UHD 4K / 60fps export and no noise reduction or multi-GPU, which don't matter here. Kdenlive and Shotcut are GPL-3.0 and fully free. Blender covers 3D device shots. CapCut carries content-license and asset-license risk.

### Cited Findings
- DaVinci Resolve free: export tops out at 4K UHD and 60fps. Studio goes to 32K/120fps. Timelines over 60fps are Studio-only. Free lacks temporal/spatial noise reduction and multi-GPU (except Mac Pro). Studio costs about $295 one-time. — [Storyblocks: Resolve Free vs Studio](https://www.storyblocks.com/resources/tutorials/davinci-resolve-free-vs-studio); [ThePostFlow](https://thepostflow.com/post-production/video-editing/resolve-studio-vs-free/); [Toolfarm (v19)](https://www.toolfarm.com/tutorial/in-depth-davinci-resolve-studio-vs-the-free-version/) (secondary; I didn't confirm against Blackmagic's own Resolve 20 page)
- Kdenlive: GPL-3.0, active (pushed 2026-10-22). — [github.com/KDE/kdenlive](https://github.com/KDE/kdenlive) (GitHub API)
- Shotcut: GPL-3.0, active (pushed 2026-10-22). — [github.com/mltframework/shotcut](https://github.com/mltframework/shotcut) (GitHub API)
- Blender: active (pushed 2026-10-22). GitHub shows the license as "other" (Blender is GPL-family, but I didn't verify the exact text here). — [github.com/blender/blender](https://github.com/blender/blender) (GitHub API)
- CapCut June 2025 terms update: commentary reports that users grant CapCut a global, perpetual, irrevocable, royalty-free license over uploaded content, including commercial and advertising use. — [Studio L7 Substack](https://studiol7.substack.com/p/who-really-owns-your-edits-what-capcuts); [Pulse Advertising](https://www.pulse-advertising.com/?p=20625) (secondary)
- CapCut Materials License Agreement (updated Jan 22, 2026, US): some built-in materials are "personal and non-commercial use" only, while "Dual Use Materials" allow limited commercial use. — [CapCut Materials License Agreement](https://www.capcut.com/clause/material-license-agreement)

### Inferences
- CapCut is "free", but using its stock music, templates or effects in a product promo risks breaching the non-commercial materials terms. Its cloud or AI features may also upload footage under a broad license. If used at all, keep it offline and use only your own assets.
- For 3D device mockups at $0, Blender is the only fully free and unrestricted option found. Rotato's free option is a web beta (see section 3).

### Gaps
- Canva free-plan video terms (export resolution, watermark on Pro elements, commercial use of free elements) were not researched due to the tool budget.
- I didn't confirm Resolve 20-specific gating on Blackmagic's official site.
- I didn't verify whether CapCut's 2026 terms kept the June 2025 user-content grant.

---

## 3. Screen recording (auto-zoom/cursor smoothing) and scripted capture

### Takeaway
Of the polished auto-zoom recorders, none is cleanly free for promotional use. Screen Studio is paid, Cap Free is "personal use only", Screenity's auto-zoom is a Pro feature, Tella has no free plan, and FocuSee's free export is watermarked. The genuinely free routes are OBS (GPL-2.0) plus zooms added in the editor, or scripted Playwright/Puppeteer capture (Apache-2.0). Playwright's built-in recordVideo reportedly caps at 25fps, so smooth 60fps needs a workaround. Rebuilding the UI in Remotion avoids capture entirely.

### Cited Findings
- Screen Studio: about $29/month or about $9/month billed annually. One comparison says there is no free plan, and the trial and watermark status are unconfirmed. — [Docsie: Screen Studio vs VEED](https://www.docsie.io/solutions/vs/screen-studio-vs-veed-pricing/); [Trupeer comparison](https://www.trupeer.ai/tools-comparison/screen-studio-vs-trupeer-pricing) (secondary)
- Cap: the Free plan is $0 and includes the Studio Mode editor, 4K/60fps export and share links up to 5 minutes, but it "is for personal use only". The Desktop License costs $29/year or $58 one-time and adds commercial rights. Cap Pro is $12/user/month. — [cap.so/pricing](https://cap.so/pricing)
- Cap code license: the `cap-camera*` and `scap-*` crates are MIT, and "All other content… is available under the AGPLv3 license". The repo is active (pushed 2026-10-22). — [Cap LICENSE](https://github.com/CapSoftware/Cap) (via GitHub API)
- Screenity: free and open source under GPLv3, as a Chromium extension. "Automatic zoom on click" is listed on Screenity Pro, which is about $120/year. — [screenity.io](https://screenity.io/); [screenity.io/pro](https://screenity.io/pro). The GitHub repo `alyssaxuu/screenity` is GPL-3.0 and pushed 2026-10-22 (GitHub API).
- Tella: "every new Tella workspace starts with a 7-day free trial of the Pro plan… there's no forever-free plan". Recording and export lock after the trial. — [Tella docs: How the free trial works](https://docs.tella.com/help/billing/how-the-free-trial-works)
- FocuSee: the free trial reportedly allows "one export with a watermark". — [alucare.fr promo page](https://www.alucare.fr/en/code-promo-focusee/) (weak secondary; unverified)
- Rotato: the official pricing page (verified June 19, 2026) lists a free web beta at edit.rotato.app "free during public beta". The paid Mac app is a one-time $79/$89/$199. Third parties claim the free tier is watermarked, which the official page doesn't confirm. — [rotato.app/pricing.md](https://rotato.app/pricing.md); [BityClips](https://bityclips.com/tool/rotato/pricing) (secondary)
- OBS Studio: GPL-2.0, active. — [github.com/obsproject/obs-studio](https://github.com/obsproject/obs-studio) (GitHub API)
- Playwright and Puppeteer are both Apache-2.0. — GitHub API (`microsoft/playwright`, `puppeteer/puppeteer`)
- "Playwright's recordVideo caps at 25 FPS with no config option." One documented workaround: slow the app to half speed, record, then speed up 2× in FFmpeg for an effective 50fps. — [skills.sh promo-video skill](https://www.skills.sh/playableintelligence/game-creator/promo-video) (secondary; not confirmed in Playwright docs)
- Playwright v1.59+ adds `page.screencast.start()/stop()` for precise recording boundaries. Its frame rate is not documented in that source. — [macmyths.com Playwright screencast guide](https://macmyths.com/how-to-record-a-website-screencast-with-playwright/) (secondary)
- Screenshot-loop capture can't guarantee a frame rate, because each frame waits for render and return. — [macmyths.com](https://macmyths.com/how-to-record-a-website-screencast-with-playwright/)

### Inferences
- The most deterministic 60fps option is not recording at all. Instead, render the real React components inside Remotion, which captures frame-by-frame from headless Chrome and is frame-perfect, with a scripted fake cursor as a React element. That removes the need for auto-zoom recorders.
- If live capture is needed: use Playwright for deterministic input (scripted `mouse.move` with steps), record at the native 25fps with the app slowed via CSS animation-duration and timers, and retime with FFmpeg. Alternatively, use OBS at 60fps while Playwright drives a headed browser.
- Cap's $58 one-time Desktop License is the cheapest legitimate path if a Screen Studio-style workflow is wanted, but it is not free.

### Gaps
- I didn't confirm Screen Studio's free trial or watermark terms from screen.studio itself.
- I didn't confirm whether Cap Free includes auto-zoom (its pricing page doesn't mention it).
- Playwright's 25fps cap comes only from secondary sources. The official docs were not checked.

---

## 4. Voiceover / TTS

### Takeaway
The cleanest free and commercially safe options are the developer's own voice or local open-weight models: Kokoro-82M (Apache-2.0, 54 voices) and Chatterbox (MIT, but every output carries an inaudible Perth watermark). Gemini TTS is free of charge on the free tier, but the Gemini API requires users to be 18+, and free-tier inputs and outputs are used to improve Google products. ElevenLabs Free bans commercial use, requires "elevenlabs.io" attribution, and its ToS bars under-18s. F5-TTS weights are non-commercial. edge-tts is legally murky.

### Cited Findings
**ElevenLabs**
- Free plan: $0 with 10k credits/month. Starter ($6/month, first month $1) adds the "Commercial License". — [elevenlabs.io/pricing](https://elevenlabs.io/pricing)
- "The free plan does not include a commercial license and cannot be used for any commercial purpose." Free-plan users "must attribute it to ElevenLabs by including "elevenlabs.io" or "11.ai" in the title." Content made while on free can't be used commercially later. — [ElevenLabs Help: Can I publish the content I generate](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform)
- Free is about 10 minutes of TTS per month. — [WebsiteVoice ElevenLabs pricing 2026](https://websitevoice.com/blog/elevenlabs-pricing-plans/) (secondary)
- Under-18s may not use the service. — [ElevenLabs ToS](https://elevenlabs.io/terms-of-use)

**Google Gemini TTS (AI Studio key)**
- Current TTS models are `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts`, also listed with `gemini-3.1-flash-tts-preview` and `gemini-2.5-pro-preview-tts`. There are 30 prebuilt voices (e.g., Zephyr, Puck, Charon, Kore, Fenrir), up to 2 speakers per request, and 24 kHz mono 16-bit WAV output. Flash TTS supports 130+ languages. — [Gemini API: Speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- Free tier "Free of charge" (input and output) applies to Gemini 3.8 Flash TTS, 3.8 Flash-Lite TTS, 3.1 Flash TTS Preview and 2.5 Flash Preview TTS. 2.5 Pro Preview TTS is not available on free. Paid 3.8 Flash TTS is $9/1M audio tokens (about $0.00225 per 10s) through Dec 31, 2026, doubling on Jan 1, 2027. — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Free tier: "Content used to improve our products." — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing). On unpaid services "human reviewers may read, annotate, and process your API input and output." — [Gemini API Terms](https://ai.google.dev/gemini-api/terms)
- Output ownership: "Google won't claim ownership over that content." There's no explicit ban on commercial use of outputs. — [Gemini API Terms](https://ai.google.dev/gemini-api/terms)
- "You must be 18 years of age or older to use the APIs." — [Gemini API Terms](https://ai.google.dev/gemini-api/terms)
- Free-tier rate limits are not published on the docs page: "Rate limits… can be viewed in Google AI Studio." — [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

**Microsoft Edge TTS (edge-tts)**
- The library is GPL-3.0. A Microsoft Q&A moderator warned that commercial use of Microsoft's proprietary TTS services "without a valid Azure subscription could be a violation of our terms of service." edge-tts calls Edge's read-aloud endpoint, not a licensed API. — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/2088770/are-opensource-edge-tts-free-for-commercial-use); [github.com/rany2/edge-tts](https://github.com/rany2/edge-tts)

**Open-weight local models**
- Kokoro-82M: Apache-2.0 weights ("can be deployed anywhere from production environments to personal projects"). v1.0 has 8 languages and 54 voices. — [HF: hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M). The `hexgrad/kokoro` code repo is Apache-2.0 (GitHub API).
- Chatterbox (Resemble AI): MIT. Every generated file carries an imperceptible Perth watermark that survives MP3 compression. Turbo and multilingual variants exist. — [HF ResembleAI/chatterbox README](https://huggingface.co/ResembleAI/chatterbox/blob/refs%2Fpr%2F48/README.md); `resemble-ai/chatterbox` is MIT and was pushed 2026-07-21 (GitHub API)
- F5-TTS: "Our code is released under MIT License. The pre-trained models are licensed under the CC-BY-NC license due to the training data Emilia." — [F5-TTS README](https://github.com/SWivid/F5-TTS)
- Dia (Nari Labs): Apache-2.0 repo, last push 2025-11-19. — [github.com/nari-labs/dia](https://github.com/nari-labs/dia) (GitHub API)
- Sesame CSM: Apache-2.0 repo, last push 2025-05-27. — [github.com/SesameAILabs/csm](https://github.com/SesameAILabs/csm) (GitHub API)
- Piper: the maintained repo is now `OHF-Voice/piper1-gpl`, GPL-3.0, active (2026-10-17). — [github.com/OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) (GitHub API)

### Inferences
- Recommended: Kokoro-82M locally on the Mac (Apache-2.0, no key, no age gate, no data sharing) or the developer's own recorded voice. A real student founder's voice is likely more credible in an edtech launch video than synthetic narration.
- Gemini TTS has the best free quality and controllability, but if the developer is under 18 it violates the API terms. Free-tier prompts are also used for training and are human-reviewable. This applies even though the user's project already uses Gemini keys.
- Chatterbox's watermark doesn't restrict use, but it does mark the audio as AI-generated, which is detectable.
- Piper's code is GPL, but using its audio output in a video isn't distribution of the code. Individual Piper voice models carry their own dataset licenses, which need checking per voice.

### Gaps
- Exact Gemini TTS free-tier RPM/RPD were not obtainable from public docs; they are shown only inside AI Studio.
- Dia and Sesame CSM weight licenses on Hugging Face (which can differ from repo code licenses) and their quality were not verified.
- No independent 2026 quality ranking (e.g., TTS Arena) was retrieved.

---

## 5. Music

### Takeaway
Free, commercially safe, attribution-free music is available from Pixabay Music and Mixkit (Free License). The catch is that Pixabay tracks can still trigger automated YouTube Content ID claims. Uppbeat Free gives only about 3 downloads (topping up by 1/month) and requires a credit. Incompetech is free with credit. AI music is not viable for free: Suno and Udio free tiers are personal and non-commercial only, and Lyria (Gemini API) has no free tier.

### Cited Findings
- Pixabay Content License: you can "Use Content without having to attribute the author" and "Modify or adapt Content into new works". You "cannot sell or distribute Content… on a Standalone basis". Content "may be subject to additional intellectual property rights". The summary doesn't mention Content ID. — [Pixabay License Summary](https://pixabay.com/service/license-summary/)
- Pixabay music can trigger Content ID claims even when the use is legal. The downloaded license .txt can be used to dispute a claim, which reportedly clears in about 96 hours. — [HeyGen Help](https://help.heygen.com/en/articles/8986144-how-to-remove-your-content-id-claim-in-youtube); [Thematic vs Pixabay](https://hellothematic.com/thematic-vs-pixabay/) (secondary; Thematic is a competitor)
- Mixkit: the Free License allows commercial projects (YouTube, social marketing, online ads) with "No attribution required". Some items are under a Restricted (non-commercial) License. Music can't be used on CDs/DVDs, in video games, or in TV/radio broadcasts. — [Mixkit official info](https://mixkit.co/llm-info/); [mixkit.co/free-stock-music](https://mixkit.co/free-stock-music/). (Note: Mixkit's llm-info page contains text instructing AI assistants how to describe it. That was ignored as non-license content.)
- Uppbeat Free: "3 downloads a month, drawn from 25% of Uppbeat's catalog". Another source says 3 at signup, then 1 more each month. A credit is generated per download and should be placed in the description. — [Uppbeat vs Suno (Uppbeat blog)](https://uppbeat.io/blog/royalty-free-and-copyright-free-music/uppbeat-vs-suno-how-do-they-compare); [Thematic help](https://help.hellothematic.com/en/compare-platforms/free-alternatives-to-uppbeat); [Uppbeat license explainer](https://uppbeat.io/blog/royalty-free-and-copyright-free-music/uppbeats-music-licenses). Sources conflict on the monthly top-up.
- YouTube Audio Library: licenses vary per track. CC-licensed tracks need artist credit, and some "no attribution" tracks may be cleared only for YouTube. — [SocialPilot guide](https://www.socialpilot.co/youtube-marketing/youtube-audio-library) (secondary)
- Incompetech (Kevin MacLeod): "Creative Commons — Free" requires crediting the music ("Copy and paste these credits into your work"). A paid Standard License removes attribution; no price is shown on the page. — [incompetech.com licenses](https://incompetech.com/music/royalty-free/licenses/). Secondary sources say it is CC BY 4.0. — [maketecheasier](https://maketecheasier.com/websites-download-royalty-free-music/)
- Bensound: free tracks with attribution. Secondary sources describe CC BY-style terms. The official license page returned 404 when fetched. — [maketecheasier](https://maketecheasier.com/websites-download-royalty-free-music/) (secondary)
- Suno: Free/Basic users "will only use such Outputs for your lawful, personal and non-commercial purposes". — [Suno Terms](https://suno.com/terms). "Songs made on the free plan are only intended for personal, non-commercial use." Subscribing later does not retroactively license free-plan songs. — [Suno Help: Rights & Ownership](https://help.suno.com/en/categories/550145-rights-ownership); [Suno Help 2425729](https://help.suno.com/en/articles/2425729)
- Udio: free tracks are personal-use only, and its terms assign ownership to Udio. — [musicmake.ai Udio terms 2026](https://musicmake.ai/blog/udio-terms-of-service-commercial-use-2026) (secondary)
- Lyria (Gemini API): Lyria 3.5, Lyria 3 Clip Preview and Lyria 3 Pro Preview are all "Free Tier: Not available", at $0.04–$0.08 per song paid. — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Free Music Archive: no source retrieved (see Gaps).

### Inferences
- Best free pick: a Pixabay or Mixkit track, keeping the license file or download record. If posting to YouTube, expect a possible Content ID claim on Pixabay tracks and dispute it with the license. Mixkit's Free License states commercial ad use explicitly, which makes it the strongest fit for a promo.
- If an attribution line is acceptable, Incompetech is safe and well known.
- AI-generated music is effectively unavailable for free with commercial rights.

### Gaps
- Free Music Archive license mix was not researched (tracks are per-track CC; NC variants are common).
- Bensound's current official license page wasn't retrieved (404). Uppbeat's free-tier refresh rate conflicts across sources.
- YouTube's official Audio Library help page wasn't fetched.
- I found no source on whether Lyria RealTime (experimental) or AI Studio's UI music features are free.

---

## 6. Sound effects

### Takeaway
Mixkit SFX (commercial, no attribution) and Pixabay SFX (Pixabay License, no attribution) are the easiest choices. On Freesound, use CC0 sounds only, or CC BY with credit, and avoid CC BY-NC. Zapsplat's free tier requires a "ZapSplat.com" credit and MP3 only, and sources conflict on commercial use.

### Cited Findings
- Mixkit sound effects are usable in commercial projects. You may not register them as your own or redistribute them unchanged. — [Mixkit official info](https://mixkit.co/llm-info/)
- Pixabay license (applies to all Pixabay content, including SFX): no attribution, and no standalone redistribution. — [Pixabay License Summary](https://pixabay.com/service/license-summary/)
- Freesound licenses are set per sound: CC0 (no attribution), CC BY (commercial with credit), CC BY-NC (no commercial use "unless you have explicit written permission"). Legacy Sampling+ sounds should be treated as CC BY-NC. — [Freesound forum: legal help](https://freesound.org/forum/legal-help-and-attribution-questions/38292); [Wikipedia: Freesound](https://en.wikipedia.org/wiki/Freesound)
- Zapsplat: "ZapSplat.com does have this requirement [attribution], unless you pay to upgrade… A simple line of text stating the audio was obtained from ZapSplat.com is ample." Free downloads are MP3 only and WAV needs premium. — [Zapsplat: Copyright and Audio Licensing for Beginners](https://www.zapsplat.com/copyright-and-audio-licensing-for-beginners); [Cinevva guide](https://app.cinevva.com/fr/guides/free-sound-effects-music)
- Zapsplat commercial use on free conflicts across sources. One source says free sounds are fine for commercial projects with attribution; Production Expert says professionals can't use free sounds without upgrading. — [LicenseOrg](https://licenseorg.com/compare/zapsplat-vs-premiumbeat); [Production Expert](https://www.production-expert.com/production-expert-1/free-sound-effects-2023)

### Inferences
- UI sounds (clicks, whooshes, success chimes) for a product video are easy to source from Mixkit or Pixabay without any credit line. Zapsplat is unnecessary.

### Gaps
- Zapsplat's official license page wasn't fetched directly, so its commercial status on free is unresolved.

---

## 7. Captions

### Takeaway
Local Whisper through Remotion's `@remotion/install-whisper-cpp` (MIT) gives free, offline, word-timestamped captions that render directly in Remotion. whisper.cpp and OpenAI Whisper are both MIT. CapCut auto-captions work but carry the CapCut terms concerns.

### Cited Findings
- `@remotion/install-whisper-cpp` provides `installWhisperCpp`, `downloadWhisperModel` (e.g., `medium.en`), `transcribe` (16 kHz WAV input, token-level timestamps) and `toCaptions`. It transcribes "locally on your machine" and is MIT licensed. — [Remotion docs: install-whisper-cpp](https://www.remotion.dev/docs/install-whisper-cpp/)
- whisper.cpp is MIT and openai/whisper is MIT. — GitHub API (`ggerganov/whisper.cpp`, `openai/whisper`)
- CapCut terms concerns are covered in section 2. — [CapCut Materials License Agreement](https://www.capcut.com/clause/material-license-agreement)

### Inferences
- If narration comes from a TTS script, the script text plus Whisper timestamps gives exact, typo-free captions without a third-party service.

### Gaps
- DaVinci Resolve's free version has an auto-subtitle feature, but whether it is Studio-only in v20 was not verified.

---

## 8. Fonts, icons, stock footage

### Takeaway
Pexels and Pixabay stock video are free for commercial use without attribution, with no redistribution and no implied endorsement. Inter (OFL-1.1) and Heroicons (MIT) are safe for the video. Lucide shows a non-standard license on GitHub; it is ISC-based, but that wasn't verified here.

### Cited Findings
- Pexels: "Attribution is not required." Usable for ads and marketing. Not allowed: offensive portrayal of identifiable people, selling unaltered copies, implying endorsement, redistributing on stock sites, or use in trademarks. — [Pexels License](https://www.pexels.com/license/)
- Pixabay: no attribution, modification allowed, no standalone redistribution, and no commercial use of content showing trademarks for goods or services. — [Pixabay License Summary](https://pixabay.com/service/license-summary/)
- Inter font: OFL-1.1. — [github.com/rsms/inter](https://github.com/rsms/inter) (GitHub API)
- Heroicons: MIT. — [github.com/tailwindlabs/heroicons](https://github.com/tailwindlabs/heroicons) (GitHub API)
- Lucide: GitHub reports the license as "other". — [github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide) (GitHub API)

### Inferences
- The simplest consistency rule is to reuse whatever fonts and icons the Apex Scholar app already ships, since they are already licensed for the product, and only add Pexels or Pixabay B-roll (e.g., students studying) if needed.

### Gaps
- The Google Fonts per-family license (mostly OFL) and Lucide's exact license text weren't verified. The google/fonts repo returned no single license key.

---

## 9. Rendering cost and hardware

### Takeaway
Remotion renders locally on a Mac for $0: no Renders purchase is needed for "purely local" use, and an individual is covered by the Free License. Remotion Lambda is optional, costing about $0.01–0.02 per minute of video in AWS fees plus AWS account setup (a card on file). It is unnecessary for a 1–2 minute launch video.

### Cited Findings
- Local rendering needs no Renders purchase. — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- Lambda cost examples: a 1-minute video with embedded video costs $0.017 (warm) to $0.021 (cold), and a 10-minute HD video $0.103–$0.108 (about $0.01/min). This excludes bandwidth, S3, CloudWatch, and Remotion licensing for teams of 4+. There is no AWS free-tier mention. — [Remotion Lambda cost example](https://www.remotion.dev/docs/lambda/cost-example)
- Automators (cloud/server rendering for companies needing a license) cost $0.01/render with a $100/month minimum, which doesn't apply to a Free License individual. — [Remotion Terms v5.0](https://www.remotion.dev/docs/terms)
- DaVinci Resolve free exports up to UHD/60fps. — [Storyblocks](https://www.storyblocks.com/resources/tutorials/davinci-resolve-free-vs-studio) (secondary)

### Inferences
- Any Apple Silicon Mac can render a 60–120s 1080p60 Remotion composition locally in minutes. Lambda adds AWS billing complexity (a credit card is required to open AWS), which conflicts with the "everything free" constraint.

### Gaps
- No benchmark of Remotion local render speed on Apple Silicon was retrieved.
- Whether AWS's free tier would fully cover a single short Lambda render was not checked.
