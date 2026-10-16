---
name: generate-apex-scholar-unit
description: Write one unit study pack for an AP course in Apex Scholar (src/data/packs/), from the College Board CED through a verified, registered page with lessons, checkpoints and activities or simulations. Use whenever the user asks to write, add, build, continue or finish a study pack or "unit" for any AP subject (e.g. "do AP Chem Unit 3", "next chunk of Unit 2s", "continue the study packs", "add Psych Unit 4"), and when fixing or rewriting an existing pack's content. Covers checking docs/research/ap-textbook-map.md for a McCreary intelligent textbook to adapt, writing against the CED, building a sim when one fits, and verifying by physically using the page in the browser at phone, tablet and desktop widths, not just running tests.
---

# Generate an Apex Scholar unit

A study pack is what a student opens the night before a unit test, or in
April when they realize they never understood Unit 3. It has to be correct
against the College Board's Course and Exam Description (CED), readable on a
phone, and every interactive piece has to actually work. Tests catch the shape
of a pack; only looking at it and using it catches the rest. In past rounds,
equations ran together mid-sentence, a `·` rendered as red `\cdotp`, a shared
LaTeX helper ate the `$` around `\theta`, tables scrolled off phones, and a
force label was clipped off the bottom of a sim. All of these shipped past
green tests, and each was found by looking.

**Take your time on each unit.** One careful unit beats three thin ones. Read
the CED section for the whole unit before writing, recompute every number,
and verify the finished page by hand before starting the next unit. If you're
doing a "chunk" of units, finish and verify each one rather than batching the
checking at the end.

Paths below are relative to `ap-prep-hub/`. Scripts live in this skill's
`scripts/` folder.

## 1. Know what the unit is

1. **CED first.** The CEDs are in `public/ced/*.pdf`. Extract the unit:
   ```bash
   python3 <skill>/scripts/ced_unit.py public/ced/<course>-course-and-exam-description.pdf <unit> > /tmp/unit.txt
   ```
   Read all of it: topic list, learning objectives, essential knowledge,
   **exclusion and boundary statements** (these say what the exam does *not*
   test, and a pack that teaches excluded material wastes a student's time),
   required documents or cases, and the unit's exam weighting. The script's
   text is a reading aid; check anything load-bearing against the PDF.
2. **Textbook map.** Open `docs/research/ap-textbook-map.md` and find the
   course and unit. If a Dan McCreary intelligent textbook is marked
   **strong** or **partial**, look at the listed chapters
   (`https://dmccreary.github.io/<book>/chapters/NN-.../`) and their MicroSims
   (`/sims/<name>/`). Use what genuinely helps: a clearer explanation order,
   a worked example, a MicroSim idea worth rebuilding. If you adapt anything,
   the pack must carry `license: 'CC BY-NC-SA 4.0'` and a `credits` entry (see
   `references/pack-format.md`). If the chapter is general or off-level, say
   so in the file header and don't credit what you didn't use. "None" in the
   map means write from the CED alone.
3. **Look at the course's existing packs** (`src/data/packs/<course>Unit*.js`)
   to match their voice, section grouping, `examWeight` wording and header
   comment style.

## 2. Decide on activities and simulations

Every unit should have something to *do*, not just read. Prefer at least one
real simulation, and add more when the content has more than one thing worth
manipulating. But don't force one. A sim earns its place when there is a
quantity a student can change and watch something respond, or a structure
they can build and inspect (an incline's friction, a VSEPR shape, an
island-biogeography equilibrium, a Java expression's evaluation). If the unit
is about sourcing a document or the causes of a war, a forced "simulation" is
worse than a good sort or timeline.

Options, roughly from richest to lightest:
- **A new component** in `src/components/study/` when nothing existing fits.
  Look for a McCreary MicroSim to base it on first. Put the logic in an
  exported pure function and unit-test it; keep the component import-free of
  pack data. Register it in the `SIMS` map in `src/pages/StudyPack.jsx`.
- **An existing component** (`references/pack-format.md` lists them).
- **An `apex-graph`** (sliders over a function) for maths and science
  relationships. It counts as a simulation when the student is meant to drag
  the sliders and watch something happen.
- **`sort-buckets` / `timeline-order`** for classification and sequence. These
  are activities, not simulations. They're useful, but 35 of them already
  exist, so don't reach for a sort just to tick a box.
- **`apex-steps`** worked examples for any calculation the exam asks for.

## 3. Write the pack

Follow `references/pack-format.md` exactly; it lists the shape, the
validator's rules and the rendering pitfalls that have bitten before. Key
habits:
- One section per CED topic, or group closely related topics (`'2.9–2.11'`).
  The heaviest units still keep each section short.
- Every question: four distinct choices, `answer: 0` (the app shuffles), and
  explanations that start "Correct." / "Incorrect." and say *why*, naming the
  misconception behind each distractor.
- Recompute every number, including distractors (each should be a specific
  plausible mistake). Use the exam's conventions (g = 10 in AP Physics 1,
  equation-sheet constants).
- Only public-domain primary-source quotations, kept short.
- Plain prose: short sentences, no filler, no em-dash flourishes.

Register it:
```bash
python3 <skill>/scripts/register_pack.py <slug> <File> "<Subject>" "<Unit N: Title>" "<meta title ≤65>" "<meta description 51–170>"
```

## 4. Verify: tests, then your own eyes and hands

Run the tests and the build, then verify in the browser. Tests and build are
necessary but prove only that the pack has the right shape.

```bash
CI=true npx react-scripts test --watchAll=false
npm run build   # prerender must list the new route
```

Then, with the dev server (`preview_start` name `dev`):

1. **Sweep.** Edit `SLUGS` at the top of `scripts/browser_sweep.js`, paste it
   into `javascript_tool`, and poll until done. Fix every problem it reports.
   Check that `displayEquations` equals the number of `$$` lines you wrote.
2. **Look.** At 375 (`resize_window` preset mobile), open the pack, choose
   "Full lessons", and scroll through every section, taking screenshots. Read
   it like a student: equations displayed and legible, tables readable,
   nothing clipped, labels inside their SVGs. Screenshots in emulated
   viewports can lag. If one looks stale, wait a second and re-take it, or
   confirm via `read_page` or JS.
3. **Use every activity by hand.** Click real controls with `computer` and
   refs from `find`/`read_page`, not by calling handlers in JS.
   - Sorts: place every item, including one deliberate wrong answer. Confirm
     the X, the explanation, and "N of M correct". Then press "Try again" and
     get all correct. (Each item's radio refs step by bucket count + 3, so
     once you know the first ref you can batch the clicks.)
   - Timelines: order them correctly once, and with a swap once.
   - Sims and graphs: drive every control to its extremes (min, max, a
     threshold value) and check the numbers against your own arithmetic.
     Check the drawing at both extremes; that's where labels clip and arrows
     run off the SVG.
   - Answer at least one checkpoint and confirm its explanation shows.
4. **Widths.** The sweep covers 360/375/768/1280; also look at the sim at 1280
   and at 375 yourself.
5. Reset the viewport (`resize_window` preset desktop) when done.

When you find a rendering bug, fix it where all callers route through (the
shared renderer or preprocessor, if that's the cause), add a test that would
have caught it, and re-check *every* pack it could affect, not just yours.

## 5. Close out

- Update `README.md` (the study-pack row lists which units exist).
- Log the round in the plan file if one is in use.
- Run `$(cat graphify-out/.graphify_python) -m graphify update .` after code
  edits.
- Report what was built, what you found by hand and fixed, and anything you
  couldn't verify. **Don't commit, push or deploy** unless the user says so.
