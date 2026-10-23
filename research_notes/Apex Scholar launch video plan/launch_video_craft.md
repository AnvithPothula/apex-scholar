# Craft of Modern Software/SaaS Launch Videos (2023-2026), Applied to Apex Scholar

Research date: 2026-10-22. Source quality note: most "best launch video" roundups are written by video agencies or tool vendors selling the service, so their stats are often unsourced. Where a number has no traceable primary source it is flagged. The strongest primary-ish data below are Wistia's 13M-video dataset, TikTok/Kantar's (platform-commissioned) sound study, and per-video view/like counts compiled by Content Cabinet (Oct 2026).

## 1. What techniques make UI launch videos feel alive (vs a slideshow of screenshots)?

### Takeaway
The craft documented in sources comes down to: real UI shown *doing something* (not static screens), camera motion with depth (3D layers, push-ins, zoom-to-cursor), motion blur on moves, kinetic type that carries the argument when there is no VO, and morph/continuity transitions instead of hard cuts between screens. Treat sources on specific editing tricks (speed ramps, match cuts, whooshes) as thin; those are well-established practitioner craft, but I found no authoritative 2023-2026 write-up for them.

### Cited Findings
- **Real UI, cropped and lit, beats full-screen captures.** Raycast's "New Raycast. Coming 2026" teaser (Dec 18 2025, 0:39) uses cropped, dark fragments of the *real* interface, a glowing search bar, an emoji tile grid with one tile highlighted, and a scrolling list of AI actions; current users recognise real details. — [Moonb, Sep 2026](https://www.moonb.io/blog/product-launch-video); video: [YouTube](https://www.youtube.com/watch?v=Mi173xGb0ZA) (113K views, 3.9% like rate, the highest like rate of any software film in the set). — [Content Cabinet, Oct 2026](https://www.contentcabinet.in/insights/product-launch-video-examples)
- **Prompt box / input as hero.** Vercel's "Introducing v0" (Oct 2023, 48 s): no VO, no people, the prompt box is the hero, and two prompts show the UI updating live. — [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples); video: [YouTube](https://www.youtube.com/watch?v=By9wCB9IZp0)
- **Show the tool's own internals on screen.** Figma's "Introducing Figma Motion" (Jun 24 2026, 1:09): flat, bright animated designs with a cursor moving among them, and the "Motion Tokens" panel that produced the easing visible in the same frame. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Motion blur on UI moves.** Subtle motion blur on dashboard zoom-ins and UI transitions makes moves read as smoother and more premium; directional blur on kinetic keywords adds speed without distraction. — [PlayPlay glossary: Motion Blur](https://playplay.com/glossary/motion-blur)
- **Depth and camera rigs.** SaaS promo case studies describe null-driven camera rigs, 3D text and layered UI elements composed in depth, cinematic camera moves, morphing transitions for continuity, and easing refined in the graph editor. — [The Rookies project write-up](https://www.therookies.co/projects/98278)
- **Tool split: After Effects for cinematic polish, Rive for in-product micro-interactions.** — [Contra: Rubik Design](https://contra.com/s/ElOAmYqW-saa-s-explainer-and-launch-video)
- **Auto zoom-to-cursor screen recordings.** Screen Studio (macOS) automatically zooms on cursor actions, enlarges and smooths the cursor, lets you adjust zooms afterwards, and exports vertical with re-framed zooms. Pricing is $29/mo, $9/mo annual, or a $229 lifetime licence. — [screen.studio](https://screen.studio/); [GTM Directory listing](https://thegtmdirectory.com/tools/screen-studio). A Remotion equivalent ("Zoom Follows the Click") exists as a community component. — [21st.dev](https://21st.dev/@21st/components/zoom-follow.md)
- **Kinetic typography carries the argument when there is no narrator.** Text cards are the device when no one is on screen. — [AutoAE, Jul 2026](https://autoae.online/blog/best-product-launch-videos). Kinetic type is defined as text whose movement, timing and scale carry the message; After Effects is the standard for per-character control and audio sync. — [Moonb kinetic typography](https://www.moonb.io/blog/kinetic-typography); see also [SVGator 50 examples](https://www.svgator.com/blog/50-kinetic-typography-examples/)
- **Make the viewer *feel* the core value through motion.** Superside's Bolt film uses 2D/3D hybrid animation with cinematic pacing so the motion language mirrors the product's value (speed, one click). — [Blare Video, 2026](https://blarevideo.com/feeds/blog/saas-product-launch-video)
- **Interface-led storytelling, music only.** Figma's "All the launches at Config 2025" is screen recordings only, no VO, with music setting the emotional tone. — [Blare Video](https://blarevideo.com/feeds/blog/saas-product-launch-video)
- **Exploded view, then real use.** Meta Quest 3 (Jun 2023, 1:18) floats components apart in an exploded view, then cuts quickly to gameplay and to a person in a living room; praised for how fast it moves from render to real use. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Webcam bubble over full-frame UI.** Linear "Introducing Linear Initiatives" (Jun 25 2024, 4:15) keeps the UI filling the frame with the presenter in a small circular webcam bubble, which is better than split screens that shrink the UI. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Don't fake the product with seeded data**: it makes the video a liability. Lock the script, then one style frame, before animating. — [AutoAE](https://autoae.online/blog/best-product-launch-videos)
- Note: a widely shared Reddit post (Oct 2026) says its author archived 720+ launch films (Linear, Figma, Raycast, Runway, OpenAI, Cursor) and broke down what works. It could not be scraped. — [r/MotionDesign](https://www.reddit.com/r/MotionDesign/comments/1x99a1v/tech_saas_product_launch_videos_broke_them_down/)

### Inferences
- For Apex Scholar, the strongest "alive" moments are moments where the product *generates* something on screen: a tutor drawing an interactive graph, a sim starting to play, a photographed FRQ getting marked up with rubric points, a calendar import filling a schedule. This is the v0/Raycast "input as hero → output assembles" pattern. Screenshots of a dashboard will read as a slideshow; generation in motion will not.
- Practical pipeline (inference): capture real flows with Screen Studio or a Playwright-driven browser at 2x DPI, then composite in After Effects/Remotion as 3D layers (slight Y-axis tilt, slow push-in, shallow depth of field on background panels, motion blur on whips). Recreate only the hero moments (sim, graph) as clean animated UI where real captures are jittery. Do not fake outputs the product can't actually produce (AutoAE's seeded-data warning applies doubly to AI grading claims).
- Speed ramps (fast-forward through AI "thinking", then real-time on the result), match cuts (e.g. a hand-written FRQ on paper → the same answer appearing in the app via photo), and beat-synced cuts with UI click/whoosh SFX are standard editing craft. I found no authoritative citation for them, so treat them as practitioner judgment.

### Gaps
- No studio post (e.g. by the makers of Linear/Raycast/Arc films) detailing their pipeline was found. Production credits for Raycast, Linear and Arc films were not discoverable in search.
- No 2023-2026 source quantifying the effect of camera moves, motion blur or SFX on retention.
- Remotion's showcase page lists launch videos but its cards weren't readable. — [remotion.dev/showcase](https://www.remotion.dev/showcase)

## 2. Best-in-class launch videos: who does what (with links)

### Takeaway
The 2023-2026 standouts share one trait: the single idea is on screen within ~3-5 seconds, the product appears almost immediately, and most run 35-90 s. Like-rate (organic enthusiasm) differs sharply from view count (often paid). Notion 3.0's 15.7M views at a 0.04% like rate vs Raycast's 113K at 3.9% suggests heavy paid distribution on one side and genuine fan excitement on the other.

### Cited Findings (all from [Content Cabinet, Oct 2026](https://www.contentcabinet.in/insights/product-launch-video-examples) unless noted)
- **Notion, "Introducing Notion 3.0: Agents"** (Sep 2025, 90 s, ~15.8M views, 0.04% like rate). No VO; the full pitch is on screen by second 3 and the product appears by second 4. — [YouTube](https://www.youtube.com/watch?v=R1cF4T4lgI4)
- **Cursor, "Introducing Cursor 2.0"** (Oct 2025, 64 s, ~9.46M views). Opens on the version number, names the new model in the next line, and shows a speed benchmark by second 5. — [YouTube](https://www.youtube.com/watch?v=An8IM-kPyms). Separately, Product Hunt notes Cursor's launches stay plain because developers resist anything that "smells like marketing". — [Product Hunt](https://www.producthunt.com/p/cursor/decoding-cursor-s-recent-product-hunt-launches)
- **Vercel, "Introducing v0: Generative UI"** (Oct 2023, 48 s, 2.0% like rate). Prompt box as hero, no VO or people, ends on a URL (waitlist). — [YouTube](https://www.youtube.com/watch?v=By9wCB9IZp0)
- **Raycast, "New Raycast. Coming 2026"** (Dec 2025, 39 s, 3.9% like rate). Search bar on screen from frame one; a teaser to build a waitlist. — [YouTube](https://www.youtube.com/watch?v=Mi173xGb0ZA)
- **The Browser Company, "Arc 1.0: Everything or nothing"** (Jul 2023, 34 s, 5.1% like rate, the highest in the set). Archive footage of failed early inventions and a version-number cycle that turns "v1.0" into an idea. No link given.
- **The Browser Company, "Dia: Never Explain Yourself Again"** (Jun 2025, 78 s). A short story instead of a feature list; the title states the benefit. No link given.
- Arc's broader video voice is creator/vlog-style (CEO Q&As, staff portraits), communicating "like influencers, not corporations". — [Rémi de Juvigny, 2023](https://remi.space/blog/5-product-lessons-from-the-success-of-the-arc-browser)
- **Cognition, "Introducing Devin"** (Mar 2024, 1:50, 1.2M views). CEO on a couch, then one real task followed start to finish, *showing the product recovering from an error*, closing on a benchmark chart and CTA. — [YouTube](https://www.youtube.com/watch?v=fjHtjT7GO1c)
- **Linear.** Feature reels run 45-90 s, one job per reel, dark-mode UI, minimal narration. — [AutoAE](https://autoae.online/blog/best-product-launch-videos). "Linear Initiatives" demo (2024) uses a webcam bubble over full-frame UI. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Figma Config.** Feature cuts run 30-120 s and take the shortest path to the feature working. — [AutoAE](https://autoae.online/blog/best-product-launch-videos). "All the launches at Config 2025" is music-only screen recordings. — [Blare Video](https://blarevideo.com/feeds/blog/saas-product-launch-video)
- **Apple, "Introducing the new iPhone 18 Pro"** (Sep 2026, 2:57, ~23.6M views). Opens on a single line, then walks through the chip one sentence at a time. No link given. — [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples)
- **Duolingo, "Introducing Duolingo Chess"** (Sep 2025, 1:52). Plush 3D puppets mixed with flat 2D characters and a split-screen gag; each scene is a self-contained joke, which makes cutdowns easy. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Google, "Introducing the Pixel 9 Pro"** (Jul 2024, 0:30). A typed Gemini prompt on a dark screen demos the headline AI feature, with one CTA. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Perplexity**: no 2023-2026 breakdown of a Perplexity launch film was found (see Gaps).

### Inferences
- For Apex Scholar, the closest analogues are **v0** (input → generated output as hero; the tutor "make me a sim of projectile motion" moment), **Notion 3.0** (pitch on screen by 3 s, product by 4 s, no VO, so it works muted), and **Duolingo Chess** (self-contained joke scenes that cut down cleanly for TikTok/Reels).
- Devin's "show it recovering from an error" is a credibility move worth borrowing for AI grading: show the grader flagging a missing rubric point and explaining why, rather than only showing 6/6 scores.

### Gaps
- No source broke down a Perplexity (e.g. Comet) launch film, Arc's "Meet Arc Search" film, or Raycast's full 2026 launch film. Links for Arc 1.0, Dia and iPhone 18 Pro weren't given in the source.
- View counts likely include paid promotion; no source separates organic from paid views.

## 3. Structure, length per platform, aspect ratios

### Takeaway
Hook (pain or payoff) in 0-3 s, product on screen by ~4-5 s, then 3-5 outcome-led feature beats, proof, and one CTA. The hero film should run 35-90 s, with 9:16 cutdowns of 15-45 s planned from the storyboard. The Product Hunt video must be on YouTube and run ~30-60 s.

### Cited Findings
- **Structure (AIDA):** attention in 0-8 s (lead with the pain, not the logo), interest 8-30 s (agitate), desire 30-60 s (show the transformed state), action in the final 5 s (a single CTA). — [Blare Video, 2026](https://blarevideo.com/feeds/blog/saas-product-launch-video)
- Get the one idea on screen in the first 5 s. Most strong launch films run 35-90 s, and longer works mainly when audiences already seek the brand out. End on a repeatable line plus a name, date or link. — [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples)
- Lead with outcome over feature list. A video with three CTAs has none. — [Flowjam](https://www.flowjam.com/blog/saas-launch-video)
- 45-120 s runtime, 90 s default; one job per video; get to "feature visibly working" fast. — [AutoAE](https://autoae.online/blog/best-product-launch-videos)
- **Wistia data (13M+ videos):** videos under 1 min average a **52% engagement rate** (viewers watch about half). 1-5 min educational/tutorial videos see >50% watched, with drop-off around the halfway point, so put the key info in the first half. Engagement drops 11% past 30 min. — [Wistia, Jul 2025](https://wistia.com/blog/optimal-video-length)
- An agency roundup claims 73% of viewers drop off before 15 s, citing "Wyzowl 2026". This is unverified secondary. — [Flowjam 30 examples](https://flowjam.com/blog/30-best-launch-video-examples-checklist)
- **Hero film + cutdowns:** plan short cutdowns inside the hero film at the storyboard stage. Samsung shipped a 4:47 hero with 10 labelled chapters for clipping, then 1:09 and 0:30 versions within 5 days. Oura shipped a 0:31 emotional film plus a 0:46 technical one the same day. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Teaser → full launch:** use a teaser to build a waitlist, but only with a fixed launch date. — [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples); [Moonb](https://www.moonb.io/blog/product-launch-video)
- **Product Hunt:** video must be a YouTube link (no direct MP4), public or unlisted. Guides converge on 30-60 s; almost none recommend >90 s. Open on the outcome in real UI, no logo intro. Captions are recommended. Gallery images are 1270x760, and many visitors skip the video and view the images. Sources conflict on whether the first gallery item becomes the thumbnail (one says there's a separate 240x240 thumbnail field). Asking for upvotes can get you banned. — [Screenhance PH guide](https://screenhance.com/blog/product-hunt-launch-video-guide); [Flowjam PH](https://www.flowjam.com/blog/product-hunt-launch-video); [Screenhance gallery sizes](https://screenhance.com/blog/product-hunt-gallery-size)
- **YouTube Shorts:** since Oct 15 2024, Shorts can run up to 3 min if square or taller. — [Engadget](https://engadget.com/entertainment/youtube/youtube-shorts-can-now-run-up-to-three-minutes-160002081.html); [PetaPixel](https://petapixel.com/2024/10/04/youtube-shorts-expands-video-length-to-three-minutes/)
- **TikTok ads:** high performers hook in the first 3 s, follow 9:16 at 5-60 s, and use captions with sound on. (Vendor blog, paraphrasing TikTok guidance.) — [Stackmatix](https://stackmatix.com/blog/tiktok-creative-best-practices-2026); [Sovran](https://sovran.ai/blog/tiktok-creative-best-practices)
- Design for mobile first: 9:16 with captions. — [Flowjam checklist](https://flowjam.com/blog/30-best-launch-video-examples-checklist). Atlassian is cited as recommending vertical 9:16. — [Moonb](https://www.moonb.io/blog/product-launch-video)

### Inferences (suggested spec for Apex Scholar)
| Placement | Length | Ratio | Audio |
|---|---|---|---|
| YouTube hero / landing page / Product Hunt | 60-90 s | 16:9 | Music + light VO or text-only, burned-in captions |
| X/Twitter | 30-60 s (hero cut) | 16:9 or 1:1 | Autoplays muted, so text-led |
| TikTok / Reels / Shorts | 15-35 s per feature, one feature each | 9:16, UI re-framed (not letterboxed) | Sound-on hook + captions |
| LinkedIn (teachers/parents/counsellors) | 30-60 s | 1:1 or 4:5 | Captions |
- Build 5-7 vertical feature cuts (tutor sim, FRQ photo grading, practice test, study pack sim, scheduler import, score calculator) from the same captured assets. That is the Samsung/Duolingo "cutdown-ready" approach.

### Gaps
- No primary LinkedIn or X spec page was retrieved, so the X/LinkedIn rows above are inference.
- No primary-source retention curve for launch films specifically (as opposed to all marketing video).

## 4. What works for a student audience (Gen Z, trends, captions) + edtech examples

### Takeaway
Edtech growth on TikTok has come from creator-led, native-feeling content built around real student pain (homework, exam prep), not from polished brand films. Polished hero films and lo-fi creator content are complements: the hero film is for the landing page, Product Hunt and press, and the creator-style cuts are for distribution. Sound matters on TikTok (88% per a platform-commissioned study), but captions are still needed for muted autoplay elsewhere.

### Cited Findings
- **Knowt** (student study app) grew 519% on TikTok H1→H2 (year not stated). It started from one Saturday organic post that unexpectedly worked, went creator-first, then scaled to six figures/month of Smart+ paid ads. Creative was built "thinking like the user rather than the brand". Results are brand-reported. — [TikTok Academy case study](https://omg.tiktokacademy.com/student/page/3649444-how-knowt-used-tiktok-to-grow-519-in-a-single-year)
- **Gauth** ran a creator-first TikTok program with student creators making videos rooted in real academic challenges (homework help, exam prep). — [Home From College case study](https://homefromcollege.com/blog/case-studies/gauth). A "Question of the Day" whiteboard format with an AI robot voice is credited with 142K+ views (third-party). — [Playkit Substack](https://playkit.substack.com/p/ai-homework-tutor-app)
- **Quizlet "Feed Your Brain"** (UK): paid TikTok/YouTube plus campus screens, all under 15 s. Study prep is framed as cooking, with stop-motion textbooks chopped and blended, riffing on the rapid quick-cut recipe trend. — [Shorty Awards](https://shortyawards.com/15th/feed-your-brain-2). Quizlet's creator posts push "add your school and courses to find classmates' sets" (16 of the last 50 sponsored posts), shot inside real student routines. — [Modash](https://www.modash.io/blog/student-influencer-marketing)
- **Duolingo**: an "unhinged" mascot-led TikTok, started in 2021 when a recent grad asked to run the dormant account. Less polished content is described as effective with Gen Z. — [HubSpot](https://blog.hubspot.com/marketing/duolingo-unhinged-content); [Brand24](https://brand24.com/blog/duolingo-social-media-strategy/). It reached 16.8M TikTok followers by 2025, with company MAU rising from 40.5M (2021) to 116.7M (not attributable to TikTok alone). — [Adweek](https://www.adweek.com/brand-marketing/duolingo-duo-owl-marketing-strategy/)
- **Sound on TikTok:** a TikTok/Kantar study found 88% of users say sound is vital to the experience, and 73% would stop and look at ads with audio. This was commissioned by TikTok. — [TikTok for Business](https://ads.tiktok.com/business/en-US/blog/evolution-of-sound-volume-1); [Social Media Today](https://www.socialmediatoday.com/news/tiktok-shares-new-insights-into-the-importance-of-sound-for-marketing-promo/601569)
- **Muted viewing:** a vendor estimate puts ~40% of TikTok first-views as sound-off autoplay (unsourced). — [Stackmatix](https://stackmatix.com/blog/tiktok-creative-best-practices-2026). A "95% of PH users watch muted" claim is unverified. — [Screenhance](https://screenhance.com/blog/product-hunt-launch-video-guide)
- Design for sound-off from the start, with captions and close-ups for small screens. — [Moonb](https://www.moonb.io/blog/product-launch-video)

### Inferences
- For AP students, the hook should be a specific, recognisable pain in their own words, with a date (AP exams are in early May), e.g. "AP Bio FRQ due tomorrow and you don't know how it's graded." Then show the payoff (a photo of the handwritten answer → the rubric-scored result) within ~3 s. "Free" is a strong differentiator and should appear early, given that competitors (Knowt/Quizlet) monetise.
- Use dual-track captions: burned-in for muted feeds, plus a sound-on hook (a voice line or trending-style audio) for TikTok, where sound is weighted heavily.
- Student-creator / founder-as-student content (the Arc vlog style, the Knowt/Gauth creator model) will likely outperform a polished brand film on TikTok. The polished film's job is credibility (landing page, Product Hunt, teachers and parents).
- Meme formats to consider (inference): "POV: it's 11pm before the AP exam", before/after split screens, and "rating study tools" reaction formats. Avoid dated memes. Trends move weekly, so check TikTok Creative Center trends at launch time.

### Gaps
- No Khanmigo launch video breakdown was found. Brainly and StudyFetch video creative was not researched within the budget.
- No reliable Gen Z-specific stat on muted vs sound-on viewing, or on attention span, from a primary source.

## 5. Voiceover vs music-only; words per second

### Takeaway
Music-only + kinetic type is the dominant 2023-2026 pattern for crisp SaaS launch films (Notion 3.0, v0, Figma Config, Raycast teaser) and is robust to muted autoplay. VO or a founder on camera wins when the story needs a human (Devin, Warp 2.0, Arc's vlogs) or for TikTok-native content. Punchy VO runs ~2.3-2.5 words/s, i.e. ~130-150 words per 60 s.

### Cited Findings
- Notion 3.0 (no VO), v0 (no VO or people), Figure 03 (no VO), and Figma Config 2025 (music only) are all text/music-led. — [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples); [Blare Video](https://blarevideo.com/feeds/blog/saas-product-launch-video)
- Founder-led examples: Warp 2.0 (Jun 2025, 2:27) has the founder to camera on a dark set with on-screen labels and timestamped chapters; Devin opens with the CEO; 1X NEO opens with the founder. — [Moonb](https://www.moonb.io/blog/product-launch-video); [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples). A founder-led film should stay narrow, with product footage as proof. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- Voice-only narration over real UI (Loom AI) and narrator tone matched to the brand (Descript Underlord) are other options. — [AutoAE](https://autoae.online/blog/best-product-launch-videos)
- **Pace:** ~150 wpm (2.5 words/s) is typical speech. 60 s explainer scripts run 130-160 words, and studios plan ~140 wpm to leave room for pauses; dense educational content benefits from slower delivery. — [Bread n Beyond](https://breadnbeyond.com/how-many-words-does-a-60-seconds-explainer-video-needs/); [Common Craft guide (PDF)](https://www.commoncraft.com/sites/default/files/speakernotes/Script%20Writing%20Guide%201.2.pdf); [CapCut](https://www.capcut.com/create/ai-voiceovers-natural-explainer-videos)
- Sendcloud's film syncs rapid-fire pains to an *accelerating* voice-over (a pacing device). — [Flowjam 30 examples](https://flowjam.com/blog/30-best-launch-video-examples-checklist)

### Inferences
- Recommended for Apex Scholar: the hero film is music-led with kinetic captions and an optional sparse VO (≤90-110 words for 60 s, leaving air for UI moments). TikTok cuts use a student voice or creator-style VO at a faster ~2.5-3 w/s. Keep on-screen text to ≤5-7 words per card so it can be read in ~1.5 s (inference, no source).

### Gaps
- No controlled study comparing VO vs music-only retention for SaaS launches was found.

## 6. Common mistakes that make launch videos feel like slideshows or skippable ads

### Takeaway
The recurring failures: a logo or loading-screen intro, a feature checklist instead of outcomes, static screenshots, several CTAs, overpromising, faked data, and a hero film that wasn't planned for cutdowns or muted viewing.

### Cited Findings
- Opening on a logo or intro instead of the pain or outcome; "no logo intro, no loading screen". — [Blare Video](https://blarevideo.com/feeds/blog/saas-product-launch-video); [Screenhance PH](https://screenhance.com/blog/product-hunt-launch-video-guide)
- Listing features instead of the outcome loses to a video anchored on a result. Multiple CTAs = no CTA. — [Flowjam](https://www.flowjam.com/blog/saas-launch-video)
- Skipping problem agitation means viewers never feel the stakes. — [Blare Video](https://blarevideo.com/feeds/blog/saas-product-launch-video)
- Faking the product with seeded data; overpromising (the Google Glass launch film set expectations the product couldn't meet). — [AutoAE](https://autoae.online/blog/best-product-launch-videos). Humane's launch film never explained the product, and reviewers' takedowns (Mrwhosetheboss 3M+ views) outran it. The company's team and software were sold to HP for $116M in Feb 2025. Address known caveats yourself before reviewers do. — [Content Cabinet](https://www.contentcabinet.in/insights/product-launch-video-examples)
- Recording a UI that is still changing. Not freezing screens/renders. No single final approver. — [Moonb](https://www.moonb.io/blog/product-launch-video)
- Split-screen layouts that shrink the UI (vs Linear's webcam bubble). Overlong founder keynotes (rabbit r1 at 25:30 is "a lot to ask"). — [Moonb](https://www.moonb.io/blog/product-launch-video)
- Marketing-speak with sceptical audiences. Developers distrust anything that "smells like marketing" (Cursor). — [Product Hunt](https://www.producthunt.com/p/cursor/decoding-cursor-s-recent-product-hunt-launches). Gen Z responds to less-polished, human content. — [HubSpot](https://blog.hubspot.com/marketing/duolingo-unhinged-content)

### Inferences
- The specific slideshow trap for Apex Scholar is a feature-tour montage of 10 features at ~6 s each. Better: one hero narrative (a student, a week before the AP exam, going from panic to schedule → tutor sim → practice FRQ graded → score calculator shows a 5), with every other feature relegated to vertical cutdowns.
- Accuracy risk: AI grading and "real AP format" claims need on-screen outputs that are reproducible in the live app at launch (see the AutoAE and Humane lessons). Don't show a College Board logo or imply affiliation (inference; trademark caution).

### Gaps
- No quantitative skip-rate data tied to specific mistakes (e.g. logo intros) from a primary source.
