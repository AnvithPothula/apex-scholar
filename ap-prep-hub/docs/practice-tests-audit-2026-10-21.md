# Practice tests audit (2026-10-21)

Scope: `/practice-tests` end to end. Code read in full (`PracticeTests.js`, `SetupPanel`, `TestPanel`,
`FrqAnswerBox`, `ResultsPanel`, `HistoryPanel`, `SourcePane`, `ScoringScreen`, relevant `testUtils`,
`testToScore`, `testConfigurations`) and used by hand in the browser at 1280 and 375 on the test
account: a generated 6-question Macroeconomics MCQ test, every test-panel tool, exit/resume, submit,
results, History, Recent Tests, the FRQ tutor, and a crafted history entry for the crash.

**How each was confirmed:** **[B]** reproduced in the browser, **[C]** from the code (path traced, not
reproduced).

**Fix status** (each chunk verified with lint, tests and build, then by hand in the browser at 1280 and 375):
- Chunk 1, results: fixed 1, 2, 9, 11, 16, 17, 25, 27, 28, 29, 37, 38, 39. Skipped questions are "Not answered", never wrong or queued.
- Chunk 2, setup and test flow: fixed 3, 6, 7, 12, 13, 14, 15, 19, 20, and 21 for section tests.
- Chunk 3, rendering and tutor: fixed 4 (plus bare "$100" in AI prose), 5, 24, 26.
- Chunk 4, exam formats and generation: fixed 8, 10, 18, 21 (full tests), 22, 23, 30. One config-driven
  full-test builder replaced the eight hand-written ones; African American Studies added to the subject list.
  Audio-only parts (language listening and speaking, Music Theory aural and sight-singing) are left out
  and say so.
- Chunk 5, accessibility and polish: fixed 31–36, 40. Also found and fixed: every non-destructive confirm
  dialog in the app had an unstyled confirm button (`variant="default"` doesn't exist).
- All 40 fixed.
- Follow-up (found while verifying): a reload lost the last answer (now saved 3 s after each change);
  code blocks in generated questions were stripped (JSON cleaners removed every ```) and stems ignored line
  breaks; "a)"-style parts weren't split; language/CSP/Music/Latin FRQs had no real format or JSON shape (fields
  the app couldn't show, a type nothing could score); the FRQ key check also ran on essays and used the wrong
  token option; reopened tests said misses were "added" to Review; LaTeXRenderer crashed after a hot reload.

## High: wrong results, crashes, lost or changed answers

1. **[B] "Section Performance" is always empty, for every test.** `sanitizeResultsData` runs
   `results.breakdown` through `cleanBreakdownObject`, which turns each `{correct, total, percentage}`
   into `Number(value.score || value.points || value.value || 0)` = 0. The card renders with nothing
   in it (Macro test: breakdown read `{mcq: 0, frq: 0, …}`). History results go through the same
   sanitizer. (Saved docs keep the real numbers; only the display is broken.)
2. **[B] Results crash when a result has no `questionResults`.** `ResultsPanel` calls
   `safeTestResults.questionResults.find(...)` and reads `result.userAnswer` / `result.breakdown`
   without guards. A history entry without `questionResults` (older or trimmed docs) crashed to
   "Oops! Something went wrong" (`Cannot read properties of undefined (reading 'find')`). The
   scoring-failure fallback in `handleSubmitTest` builds `questionResults: []`, so a scoring error on
   submit hits the same path for any question.
3. **[C] Duplicate question IDs.** `generateQuestionBatch` numbers questions `startId + index`
   *before* the answer-key check (`verifyOptionMcqs`) and de-duplication drop some; callers then
   advance their counter by the number kept. Example: batch 1 ids 1–6, #3 dropped → 5 kept → next
   batch starts at 6 → two questions with id 6. Answers, marks, photos and results are all keyed by
   id, so answering one answers the other and results pair answers with the wrong question. Any
   multi-batch test where the checker drops a question is exposed (the 6-question test was one batch,
   so it didn't trigger).
4. **[B] Dollar amounts are garbled.** The AI correctly writes money as `$\$50$`, but
   `LaTeXRenderer` (`/\$[^$\n]*?\$/`) pairs the `$` of `\$` with the opening delimiter. Macro Q2
   rendered "spending by \50billionwhilesimultaneouslyincreasinglump − sumtaxesby\50 billion" in math
   italics with a red error backslash; options read "\50$ billion". Same in the results review
   (`MarkdownRenderer`). Affects Macro, Micro, Personal Finance, any money question.
5. **[B] "Ask Tutor About This Question" is broken for FRQs.** `getTutorResponse` is MCQ-only: FRQs
   have no options and `correctAnswer` 0, so the prompt says "CORRECT ANSWER: A)" and insists it is
   "DEFINITELY" right. On a 9/9 Calculus FRQ the tutor answered "let's be completely clear: A)
   undefined is the correct answer", told the student not to worry about "missing it", and guessed
   what part (c) "typically asks" because the parts are never sent.
6. **[B] Keystrokes change hidden answers.** The page-level shortcuts (arrows, 1–4) stay active on
   the "Check Your Work" page and while menus are open. On the review page, the left arrow silently
   moved from Q2 to Q1, and pressing 3 changed Q1's answer from B to C without the student seeing it.
7. **[B] A typed custom time of 0 or less freezes the test.** `min="1"` doesn't stop typing; `-1`
   started the test at **−1:00**, which never counts down and never auto-submits (the time-up check is
   `=== 0`). No clamp in `handleStartTest`.
8. **[C + CED] Exam formats are wrong for several courses** (`testConfigurations.js` and the
   hard-coded full-test builders), checked against the CEDs in `public/ced`:

   | Course | Current CED | Config | Full-test builder |
   |---|---|---|---|
   | Psychology | 75 MCQ / 90 min + 2 FRQ / 70 min | 100 / 70 + 2 / 50 | 100 + 2 |
   | Physics C: Mechanics, E&M | 42 MCQ / 85 + 4 FRQ / 95 | 35 / 45 + 3 / 45 | 50 + 5 |
   | Physics 2 | 42 / 85 + 4 / 95 | 50 / 90 + 5 / 90 | 50 + 5 |
   | Physics 1 | 42 / 85 + 4 / 95 | correct | 50 + 5 |
   | Computer Science A | 42 MCQ | 40 | generic |
   | Business with Personal Finance | 4 FRQ / 90 min | 3 / 65 | generic |
   | Precalculus | 29 + 13 MCQ (105 min) + 4 FRQ (70 min) | 40 MCQ / 120, **no FRQ section** | MCQ only |
   | Latin | 52 MCQ / 65 + 5 FRQ / 115 | 50 / 60 + 3 / 120 | generic |
   | French, German, Italian, Spanish Lang | 3 FRQ (65–70) + 55 MCQ (80) | 70 / 100 + 2 or 4 / 90 | generic |
   | Chinese, Japanese | 4 FRQ (40–45) + 55 MCQ (65) | 70 / 100 + 2 or 4 / 90 | generic |
   | Spanish Literature | 65 MCQ (80) + 4 FRQ | 50 / 90 + 4 / 100 | generic |
   | African American Studies | 60 MCQ (70) + FRQ section | **missing from the config** | — |

   Also: Computer Science Principles has its written-response section missing (MCQ only).
   Listening sections (languages), dictation and sight-singing (Music Theory) are offered but can't
   work without audio.
9. **[B] Results don't show FRQ parts or source material.** The review renders only `question.question`
   (the stem). Parts (a)–(d) never appear, so feedback about "part (c)" can't be matched to what was
   asked. MCQ/SAQ stimuli are not shown either.
10. **[C] One failing full-test batch can cost ~80 AI calls.** In every full-test builder, "skip failed
    batch" only breaks the inner retry loop; the outer loop asks for the same batch again (up to 20
    batches × 4 attempts with 2/4/8 s backoff) before moving on.
11. **[B] Skipped questions are counted as "missed" and queued for Review.** 2 of 6 answered →
    "6 questions added to your review queue". The app elsewhere treats skipping as not answering
    wrong (class boards, streak), but `missedCount` and `srs.addMisses` use `!correct && !ungraded`.
12. **[B] "Exit the Test" says answers will be lost, then offers to resume them.** `resetTest` doesn't
    delete the auto-saved `testProgress` doc, so the setup page immediately showed "You have an
    unfinished AP Macroeconomics test", and resuming restored the answers. The exit did clear the
    device's FRQ photos, so a resumed FRQ test comes back without them.
13. **[C/B] Resume is rarely available, and loses settings.**
    - Auto-save defaults to **off** (`aptest_autosync` → `false`), so most students never get a
      resume point.
    - It also waits for a typed answer, so a test answered only with photos is never saved.
    - It saves every 30 s with no save on tab close, so up to 30 s is lost on reload.
    - Resume doesn't restore a custom time limit: after resuming, "Minutes Used" read **71** for a
      few minutes of work (computed against the default 70 min).
    - A save taken at 0 s left submits immediately on resume.
14. **[C] Grading from History uses this session's photos.** "Grade it now" on an old test reads the
    current session's in-memory `answerImages` by question id, which may belong to a different test.
15. **[C] Tests opened from Recent Tests can't save a regrade.** `openHistoricTest` (SetupPanel)
    doesn't set `docId` (HistoryPanel does), so "Grade it now" updates the screen but not the saved
    test, history or class boards.
16. **[C] Partial credit is shown as wrong.** An FRQ scoring 8/9 gets a red X and the "wrong" shake,
    counts as "missed", and is queued for Review, because `correct` is only true for full marks.
17. **[C] STEM FRQ types are grouped as "writing".** `calculator-frq`, `no-calculator-frq`,
    `long-frq` and `short-frq` aren't breakdown keys, so they fall into `writing` (a Calculus FRQ
    test saved "writing 28%"). Hidden today by #1.
18. **[C] FRQ answer keys are still generated with wrong numbers.** Grading now re-derives values,
    but the keys themselves aren't checked at generation (MCQs get a second-model check; FRQ rubrics
    don't), so the rubric box and sample answer still show wrong values to students.

## Medium

19. **[B]** A custom count over 100 is silently replaced by the official count, but the button still
    says "Generate & Start Test (150 questions)".
20. **[C]** Subject, section and units stay editable while a test generates; the finished test then
    shows and saves under whatever is selected at the end.
21. **[C]** A custom question count keeps the full section time (6 MCQs → 70 min). Full tests ignore
    the custom count entirely, and their builders never trim a batch that returns extra questions.
22. **[C]** Full tests can come out short with no notice (failed batches skipped, 20-batch cap
    reached when the checker drops questions).
23. **[C]** Every SAQ must have a stimulus, but on the real APUSH, World and Euro exams one SAQ has none.
24. **[C]** The LaTeX clean-up isn't applied to FRQ `parts`, `stimulus` or `rubric`, so doubled
    backslashes from JSON can break math there (it only runs on stem, options, explanation, sample).
25. **[C]** `SourcePane` shows a standalone stimulus only when the question has no `documents` key.
    Saved questions get `documents: []`, which hides the stimulus and leaves an empty left pane.
26. **[C]** Source text is plain pre-wrap: no math rendering, and markdown tables in stimuli
    (common in Statistics) show as raw pipes.
27. **[B]** The rubric box prints `scoringGuidelines` raw, so LaTeX like `$\frac{h(7) - h(2)}{7 - 2}$`
    shows literally.
28. **[B]** MCQ explanations are never shown in results. They're stored as `result.feedback` but
    only the FRQ block displays it, so the only route to an explanation is the "Why was I wrong?" AI call.
29. **[B]** A skipped MCQ shows only "0 / 1" with no "not answered" label.
30. **[B]** 11 subjects have no unit picker (no `units` in the config): CS Principles, Physics C
    Mechanics, Physics C E&M, Macro, Micro, US Gov, Human Geography, Spanish Literature, Italian,
    Japanese, Latin.
31. **[B]** The submit confirmation doesn't mention unanswered questions (4 of 6 were blank).
32. **[C]** The History listener (`onSnapshot`) has no error handler; a failed query shows an empty
    history with no message.

## Low: accessibility, copy, polish

33. **[B]** A selected unit's checkbox is a solid white square: the tick is drawn in
    `text-content-primary` on a `bg-content-primary` box, so it's invisible.
34. **[C]** Not keyboard-operable: unit cards, the Time Limit and Number of Questions option cards,
    and History cards (Recent Tests and section cards are fine).
35. **[C]** The in-test Settings popup is `role="dialog"` on a div: no Escape, no focus trap.
36. **[B]** The setup page promises "Adaptive Questions… tailored to your difficulty level"; difficulty
    selection was removed.
37. **[C]** "Why was I wrong?" also appears on ungraded answers.
38. **[C]** "Save Results" downloads a raw JSON file, which isn't useful to a student.
39. **[B]** FRQ parts are labelled "A.", "B." while the question, rubric and grader say "(a)", "(b)".
40. **[B]** The exit/submit confirm dialogs use the dark app style over the white exam screen.

## Left on the test account

The 6-question Macro test (0/6), plus the 6 Review cards it queued. The crash probe history entry was
deleted after the check.
