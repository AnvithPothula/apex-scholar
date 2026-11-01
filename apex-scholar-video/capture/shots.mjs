// One entry per piece of real footage the film uses. `url` is opened first,
// `prepare` runs before recording starts, `run` is what gets recorded.
// Keep each shot short (2-6 s); the film cuts on camera moves, not long takes.
// Beat numbers refer to reports/Launch video script draft.md.

import { resetQueue, plantTest, clearTest, deleteDecks, deleteConversations } from './seed-demo.mjs';

// Smooth horizontal scroll of the first element matching `selector`.
const scrollX = (page, selector, dx, ms) => page.evaluate(({ selector, dx, ms }) => new Promise((done) => {
  const el = document.querySelector(selector);
  const start = el.scrollLeft; const t = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t) / ms);
    el.scrollLeft = start + dx * (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
    if (k < 1) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}), { selector, dx, ms });

// Puts `selector` `offset` px below the top of the viewport before recording.
const jumpTo = (page, selector, offset = 140) => page.locator(selector).first()
  .evaluate((e, off) => window.scrollBy(0, e.getBoundingClientRect().top - off), offset);

// The start check's correct answer for the question on screen, read from the
// Start component's state (the film needs a believable, mostly-right run).
const startAnswer = (page) => page.evaluate(() => {
  const el = document.querySelector('[role=radiogroup]');
  let f = el[Object.keys(el).find((k) => k.startsWith('__reactFiber'))];
  while (f && f.type?.name !== 'Start') f = f.return;
  const states = [];
  for (let h = f.memoizedState; h; h = h.next) states.push(h.memoizedState);
  const qs = states.find((s) => Array.isArray(s) && s[0]?.choices);
  const n = Number(document.body.innerText.match(/Question (\d+) of/)[1]);
  return qs[n - 1].correctAnswer;
});

// The choice on screen in the newest tutor sim that raises `meter` (matched by
// label) the most, using the effects in the SimWidget's parsed spec.
const simChoice = (page, meter) => page.evaluate((meter) => {
  const els = document.querySelectorAll('[role=meter]');
  const el = els[els.length - 1];
  let f = el[Object.keys(el).find((k) => k.startsWith('__reactFiber'))];
  while (f && f.type?.name !== 'SimWidget') f = f.return;
  const spec = f.memoizedState.memoizedState[0];
  const shown = new Set([...el.closest('.not-prose').querySelectorAll('button')].map((b) => b.innerText.trim()));
  const m = spec.meters.find((x) => new RegExp(meter, 'i').test(x.label)) || spec.meters[0];
  const choices = Object.values(spec.scenes).flatMap((sc) => sc.choices || []).filter((c) => shown.has(c.label.trim()));
  // Pairing the bell with food is the lesson; then whatever raises the meter most.
  const pairs = (c) => (/bell/i.test(c.label) && /(feed|food|meat|then|before|pair)/i.test(c.label)
    && !/(stop|only|without|alone)/i.test(c.label) ? 1 : 0);
  choices.sort((a, b) => pairs(b) - pairs(a) || (b.effects?.[m.id] || 0) - (a.effects?.[m.id] || 0));
  return choices[0]?.label || null;
}, meter);

// The diagnostic's questions (with answers), read from the Diagnostics page state.
const diagQuestions = (page) => page.evaluate(() => {
  const el = [...document.querySelectorAll('button')].find((b) => /Next Question|Finish Diagnostic/.test(b.innerText));
  let f = el[Object.keys(el).find((k) => k.startsWith('__reactFiber'))];
  while (f && f.type?.name !== 'DiagnosticTypes') f = f.return;
  for (let h = f.memoizedState; h; h = h.next) {
    const s = h.memoizedState;
    if (Array.isArray(s) && s[0]?.question && Number.isInteger(s[0]?.correctAnswer)) {
      return s.map((q) => ({ concept: q.concept || 'General', correctAnswer: q.correctAnswer }));
    }
  }
  return null;
});

// Starts a new conversation with a tutor and sends `text`.
async function ask(a, text) {
  await a.click('[title="New conversation"], [aria-label="New conversation"]');
  await a.wait(900);
  await a.type('textarea', text, 90);
  await a.wait(400);
  await a.page.keyboard.press('Enter');
}

const deckButton = (title, label) => `text=${title} >> xpath=ancestor::div[.//button[contains(., "${label}")]][1] >> button:has-text("${label}")`;

export const SHOTS = {
  // Beats 2-3: the 10-question start check, then the predicted score and today's plan.
  'start-check': {
    url: '/start',
    async run(a) {
      await a.wait(700);
      await a.type('input[placeholder="Find your subject"]', 'calc', 90);
      await a.wait(400);
      await a.click('button:has-text("AP Calculus AB")');
      await a.page.waitForSelector('[role=radiogroup]', { timeout: 30000 });
      for (let i = 0; i < 10; i++) {
        await a.wait(i === 0 ? 1400 : 700);
        const right = await startAnswer(a.page);
        const pick = i === 3 || i === 7 ? (right + 1) % 4 : right; // two misses: 8 of 10
        await a.hover(`[role=radio] >> nth=${pick}`, 350);
        await a.click(`[role=radio] >> nth=${pick}`);
        await a.wait(i === 0 ? 1600 : 800);
        await a.click(i < 9 ? 'button:has-text("Next question")' : 'button:has-text("See my score")');
      }
      await a.wait(2200);
      await a.scroll(420, 3000);
      await a.wait(1500);
    },
  },

  // Beats 14-15: the handwritten FRQ photo goes into the answer box, then the
  // rubric grade. Submitting uses up the planted test; seed-demo.mjs frq-test
  // puts it back.
  frq: {
    url: '/practice-tests',
    async prepare(page) {
      await plantTest('frq-test');
      // Photos from an earlier take live in the browser and would be restored on resume.
      await page.evaluate(() => new Promise((r) => { const q = indexedDB.deleteDatabase('apex-answer-images'); q.onsuccess = q.onerror = q.onblocked = r; }));
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2500);
      await page.locator('button:has-text("Resume")').click();
      await page.waitForTimeout(1500);
    },
    async run(a) {
      await a.wait(900);
      await a.hover('button:has-text("Add photo of work")', 500);
      await a.page.locator('input[type=file]').first().setInputFiles(new URL('./photos/frq.jpg', import.meta.url).pathname);
      await a.wait(2600);
      await a.click('button:has-text("Next")');
      await a.wait(900);
      await a.click('button:has-text("Submit")');
      await a.wait(800);
      await a.click('text=Submit test? >> xpath=ancestor::div[.//button[normalize-space()="Submit"]][1] >> button:text-is("Submit")');
      await a.page.waitForSelector('text=/\\d+\\s*\\/\\s*9|out of 9/', { timeout: 180000 });
      await a.wait(2500);
      await a.scroll(500, 3200);
      await a.wait(1200);
      await a.scroll(500, 3200);
      await a.wait(1500);
    },
  },

  // Beat 15: the graded FRQ (8/9), opened from Recent Tests so there's no wait:
  // the AI feedback on the (c) sign error, then the rubric rows. Needs a graded
  // `frq` take first; it's the newest Calc AB test.
  'frq-grade': {
    url: '/practice-tests',
    async prepare(page) {
      await page.locator('[aria-label="View results for your AP Calculus AB test"]').first().click();
      await page.waitForSelector('text=Question Review', { timeout: 30000 });
      await page.waitForTimeout(1500);
      await jumpTo(page, 'text=AI Feedback', 120);
    },
    async run(a) {
      await a.wait(1800);
      await a.scrollTo('text=Scoring Rubric', 3200, 120);
      await a.hover('text=Part C >> nth=-1', 2500);
    },
  },

  // Beat 16: a missed question coming back in the review queue.
  review: {
    url: '/review',
    async prepare() { await resetQueue(); },
    async run(a) {
      await a.wait(900);
      await a.click('button:has-text("Start reviewing")');
      await a.wait(1600);
      await a.hover('button:has-text("levy taxes")', 400);
      await a.click('button:has-text("levy taxes")');
      await a.wait(2400);
      await a.scroll(250, 2500);
      await a.wait(1200);
    },
  },

  // Beat 17a: studying a deck.
  flashcards: {
    url: '/flashcards',
    async run(a) {
      await a.wait(700);
      await a.click(deckButton('AP Psychology: Memory', 'Study'));
      await a.wait(1300);
      await a.click('button:has-text("Show Answer")');
      await a.wait(1500);
      await a.click('button:has-text("Got It Right")');
      await a.wait(1100);
      await a.click('button:has-text("Show Answer")');
      await a.wait(1600);
    },
  },

  // Beat 17b: pasting a Quizlet export into a new deck.
  quizlet: {
    url: '/flashcards',
    async prepare(page) {
      await deleteDecks('AP Calc AB: Unit 5 vocab');
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2500);
    },
    async run(a) {
      await a.wait(600);
      await a.click('button:has-text("Import from Quizlet")');
      await a.wait(900);
      await a.type('input[placeholder^="e.g. AP Biology"]', 'AP Calc AB: Unit 5 vocab', 90);
      await a.wait(300);
      await a.click('textarea');
      await a.page.locator('textarea').fill([
        'critical point\ta value of x where f\'(x) = 0 or f\'(x) is undefined',
        'relative maximum\tf\' changes from positive to negative',
        'relative minimum\tf\' changes from negative to positive',
        'concave up\tf\'\'(x) > 0',
        'point of inflection\twhere f\'\' changes sign',
        'Candidates Test\tcompare f at critical points and endpoints',
      ].join('\n'));
      await a.wait(700);
      await a.scrollTo('select', 1600, 380);
      await a.click('button:has-text("Import"):not(:has-text("Quizlet"))');
      await a.wait(2500);
    },
  },

  // Beat 4: a study pack scrolling, through a lesson into worked steps.
  'study-pack': {
    url: '/study/ap-physics-1/unit-1',
    async prepare(page) {
      await page.locator('text=Full lessons').first().click();
      await page.waitForTimeout(1500);
    },
    async run(a) {
      await a.wait(600);
      await a.scroll(1100, 3800);
      await a.wait(500);
      await a.scrollTo('button:has-text("Next step")', 3000, 420);
      await a.wait(300);
      await a.click('button:has-text("Next step")');
      await a.wait(900);
      await a.click('button:has-text("Next step")');
      await a.wait(1200);
    },
  },

  // Beat 5a: a study-pack sim driven by a slider (motion graphs).
  'sim-slider': {
    url: '/study/ap-physics-1/unit-1',
    async prepare(page) {
      await page.locator('text=Full lessons').first().click();
      await page.waitForTimeout(1500);
      await jumpTo(page, 'h3:has-text("Reading graphs")', 90);
      await page.waitForTimeout(800);
    },
    async run(a) {
      await a.wait(500);
      // Defaults are v0 = 4, a = -2: slow the start, then flip the acceleration.
      await a.drag('input[type=range] >> nth=0', -1, 2400);
      await a.wait(300);
      await a.drag('input[type=range] >> nth=1', 1.5, 2400);
      await a.wait(300);
      await a.drag('input[type=range] >> nth=0', 3, 2000);
      await a.wait(900);
    },
  },

  // Beat 5b: the projectile launcher.
  'sim-launch': {
    url: '/study/ap-physics-1/unit-1',
    async prepare(page) {
      await page.locator('text=Full lessons').first().click();
      await page.waitForTimeout(1500);
      await jumpTo(page, 'button:has-text("Launch")', 560);
      await page.waitForTimeout(800);
    },
    async run(a) {
      await a.wait(400);
      await a.click('button:has-text("Launch")');
      await a.wait(2600);
      await a.drag('input[type=range] >> nth=-2', 60, 1800);
      await a.wait(300);
      await a.click('button:has-text("Launch")');
      await a.wait(3000);
    },
  },

  // Beat 6: the APUSH timeline sweeping from 1491 toward today.
  timeline: {
    url: '/study/timelines/ap-us-history',
    async prepare(page) {
      await page.evaluate(() => window.scrollTo(0, 260));
      await page.waitForTimeout(600);
    },
    async run(a) {
      await a.wait(500);
      await scrollX(a.page, '.overflow-x-auto', 3600, 4500);
      await a.wait(600);
    },
  },

  // Beats 7-9: "Let me condition Pavlov's dog." The tutor builds a sim; ring the bell.
  'tutor-sim': {
    url: '/ai-tutors/ap-psychology',
    async prepare(page) {
      // Earlier takes pile up in the sidebar; keep only the old session.
      await deleteConversations('psychology', Date.parse('2026-10-23T00:00:00Z'));
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2500);
    },
    async run(a) {
      await a.wait(800);
      await ask(a, "Let me condition Pavlov's dog.");
      await a.page.waitForSelector('[role=meter]', { timeout: 120000 });
      await a.wait(3500);
      // The AI writes a different sim each time. The film needs the bell (not a
      // tuning fork) and a first move that pairs it with food.
      const first = await simChoice(a.page, 'saliv');
      const card = await a.page.locator('.not-prose').last().innerText();
      if (!/bell/i.test(card) || /fork|metronome|tone/i.test(card) || !/bell/i.test(first || '')) {
        throw new Error(`Unusable sim (first choice: ${first}); re-take`);
      }
      for (let i = 0; i < 3; i++) {
        const label = await simChoice(a.page, 'saliv');
        if (!label) break;
        const btn = `button:has-text(${JSON.stringify(label)}) >> nth=-1`;
        await a.scrollTo(btn, 2500, 520);
        await a.hover(btn, 500);
        await a.click(btn);
        await a.wait(2600);
      }
    },
  },

  // Beat 10: a graph you can drag (the forgetting curve).
  'tutor-graph': {
    url: '/ai-tutors/ap-psychology',
    async run(a) {
      await a.wait(800);
      await ask(a, 'Show me the forgetting curve as a graph I can drag.');
      await a.page.waitForSelector('main input[type=range], input[type=range]', { timeout: 120000 });
      await a.wait(4000);
      const slider = 'input[type=range] >> nth=0';
      await a.scrollTo(slider, 2500, 520);
      const { min, max } = await a.page.locator(slider).evaluate((i) => ({ min: +i.min, max: +i.max }));
      await a.drag(slider, min + (max - min) * 0.85, 3000);
      await a.wait(400);
      await a.drag(slider, min + (max - min) * 0.15, 3000);
      await a.wait(1200);
    },
  },

  // Beat 11: "Check my steps" on a calculus answer with a product-rule slip.
  'tutor-check': {
    url: '/ai-tutors/ap-calculus-ab',
    async run(a) {
      await a.wait(800);
      await a.click('[title="New conversation"], [aria-label="New conversation"]');
      await a.wait(700);
      await a.click('label:has-text("Check my steps")');
      await a.wait(500);
      await a.type('textarea', 'Check my work: the derivative of x² sin x is 2x cos x, since x² gives 2x and sin x gives cos x.', 70);
      await a.wait(400);
      const copies = await a.page.locator('[aria-label="Copy this answer"]').count();
      await a.page.keyboard.press('Enter');
      await a.page.waitForFunction((n) => document.querySelectorAll('[aria-label="Copy this answer"]').length > n, copies, { timeout: 120000 });
      await a.wait(3000);
      for (let i = 0; i < 3 && await a.page.locator('button:has-text("Next step")').count(); i++) {
        await a.scrollTo('button:has-text("Next step") >> nth=-1', 2500, 560);
        await a.click('button:has-text("Next step") >> nth=-1');
        await a.wait(1500);
      }
      await a.scroll(300, 2800);
      await a.wait(1500);
    },
  },

  // Beat 12: generating a practice test, picking the course, section and units.
  // Leaves no resumable test behind; run `seed-demo.mjs frq-test` afterwards.
  'test-setup': {
    url: '/practice-tests',
    async prepare(page) {
      await clearTest();
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2500);
      await jumpTo(page, 'text=Test Configuration', 110);
    },
    async run(a) {
      await a.wait(600);
      await a.click('text=Select a subject...');
      await a.wait(700);
      await a.hover('[role=option]:has-text("AP Calculus AB")', 300);
      await a.click('[role=option]:has-text("AP Calculus AB")');
      await a.wait(800);
      await a.click('text=Multiple Choice >> nth=0');
      await a.wait(600);
      await a.scrollTo('text=Select Units', 2800, 160);
      await a.click('text=Unit 4: Contextual Applications of Differentiation');
      await a.wait(400);
      await a.click('text=Unit 5: Analytical Applications of Differentiation');
      await a.wait(700);
      await a.hover('button:has-text("Generate & Start Test")', 1200);
    },
  },

  // Beat 13: the test screen, laid out like the digital exam: cross out, flag, clock.
  'test-screen': {
    url: '/practice-tests',
    async prepare(page) {
      await plantTest('mcq-test');
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2500);
      await page.locator('button:has-text("Resume")').click();
      await page.waitForTimeout(1500);
    },
    async run(a) {
      await a.wait(900);
      await a.click('[aria-label^="Answer eliminator"]');
      await a.wait(500);
      await a.click('[aria-label="Cross out answer D"]');
      await a.wait(500);
      await a.click('[aria-label="Cross out answer A"]');
      await a.wait(700);
      await a.click('[aria-label="Answer B"]');
      await a.wait(700);
      await a.click('button:has-text("Mark for Review")');
      await a.wait(900);
      await a.click('button:has-text("3 of 6")');
      await a.wait(1800);
    },
  },

  // Beat 19: the scheduler planning around imported Canvas and Schoology assignments.
  scheduler: {
    url: '/smart-scheduler',
    async run(a) {
      await a.wait(900);
      await a.scroll(700, 3800);
      await a.wait(500);
      await a.click('button:has-text("Month")');
      await a.wait(1400);
      await a.hover('text=Unit 5 Test: Analyt >> nth=-1', 1200);
    },
  },

  // Beat 20: diagnostic results by unit. The 15 questions are answered before
  // recording (all of one or two topics missed, so weak units stand out).
  diagnostics: {
    url: '/diagnostics/ap-calculus-ab/start',
    async prepare(page) {
      await page.waitForSelector('button:has-text("Next Question")', { timeout: 90000 });
      const qs = await diagQuestions(page);
      const weak = new Set([qs[1].concept, qs[4].concept]);
      for (let i = 0; i < qs.length; i++) {
        const pick = weak.has(qs[i].concept) ? (qs[i].correctAnswer + 1) % 4 : qs[i].correctAnswer;
        await page.locator('main button').filter({ hasText: /^[A-D]\./ }).nth(pick).click();
        await page.locator('button:has-text("Next Question"), button:has-text("Finish Diagnostic")').first().click();
        await page.waitForTimeout(250);
      }
      await page.waitForSelector('text=Topic Breakdown', { timeout: 60000 });
      await page.waitForTimeout(1500);
    },
    async run(a) {
      await a.wait(900);
      await a.scroll(300, 2800);
      await a.hover('text=Topic Breakdown', 1500);
      await a.scroll(420, 3000);
      await a.wait(1000);
    },
  },

  // Beat 18: a photographed homework problem, then the worked solution.
  solver: {
    url: '/solver',
    async run(a) {
      await a.wait(800);
      await a.hover('text=Upload an image', 500);
      await a.page.locator('input[type=file]').first().setInputFiles(new URL('./homework-photo.jpg', import.meta.url).pathname);
      await a.wait(1500);
      await a.click('button:has-text("Solve")');
      await a.page.waitForSelector('text=/Step 1|Answer|Final/i', { timeout: 120000 });
      await a.wait(2500);
      await a.scroll(500, 3200);
      await a.wait(1500);
    },
  },

  // Beat 21: the class leaderboard (invented classmates, seeded by seed-demo.mjs).
  leaderboard: {
    url: '/classes/MATH2AB7',
    async prepare(page) {
      // The join link is built from window.location.origin, so on the dev server
      // it reads localhost. Show it as students see it on apex-scholar.com.
      await page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) n.nodeValue = n.nodeValue.replace(/https?:\/\/localhost:\d+/g, 'https://apex-scholar.com');
        document.querySelectorAll('input').forEach((i) => { i.value = i.value.replace(/https?:\/\/localhost:\d+/g, 'https://apex-scholar.com'); });
      });
      await page.waitForTimeout(400);
    },
    async run(a) {
      await a.wait(700);
      await a.hover('text=Ava Thompson', 1400);
      await a.hover('text=Jordan Reyes', 2200);
    },
  },

  // Beat 22: the score calculator, the predicted score rolling up.
  'score-calc': {
    url: '/ap-score-calculator/ap-calculus-ab',
    async prepare(page) {
      // Multiple choice is filled in off camera; the take is one smooth drag of
      // the free-response slider, so the score climbs all the way to a 5.
      const el = page.locator('input[type=range]').first();
      const box = await el.boundingBox();
      const { min, max } = await el.evaluate((i) => ({ min: +i.min, max: +i.max }));
      const x = box.x + 8 + ((31 - min) / (max - min)) * (box.width - 16);
      await page.mouse.click(x, box.y + box.height / 2);
      await page.waitForTimeout(800);
    },
    async run(a) {
      await a.wait(900);
      await a.drag('input[type=range] >> nth=1', 42, 2600);
      await a.wait(1500);
    },
  },
};
