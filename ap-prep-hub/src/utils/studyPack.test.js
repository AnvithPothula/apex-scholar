import { planSections, planMinutes, shuffleQuestion, seedFor, validatePack, topicStatus, mergeTopics, packSummary, nextUnit, joinCatalog } from './studyPack';
import { COURSES, courseUnits } from '../data/packs/catalog';
import apBiologyUnit1 from '../data/packs/apBiologyUnit1';
import { PACKS, packForSubject } from '../data/packs';

describe('authored packs', () => {
  it('every pack passes validation (structure, and explanations that agree with the key)', async () => {
    for (const [slug, p] of Object.entries(PACKS)) {
      const pack = (await p.load()).default;
      expect(pack.slug).toBe(slug);
      expect(validatePack(pack)).toEqual([]);
    }
  });

  it('covers AP Biology Unit 1 topics 1.1 to 1.7 in order', () => {
    expect(apBiologyUnit1.sections.map((s) => s.id)).toEqual(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']);
    expect(packForSubject('AP Biology').slug).toBe('ap-biology/unit-1');
    expect(packForSubject('AP Not A Real Course')).toBeNull();
    expect(packForSubject('AP Psychology').slug).toBe('ap-psychology/unit-1');
  });
});

describe('validatePack', () => {
  const good = () => ({
    sections: [{
      id: 'x', title: 't', summary: 's', body: 'b', revisit: 'r', minutes: 2, blocks: [],
      precheck: { question: 'q', choices: ['a', 'b', 'c', 'd'], answer: 0, explanations: ['Correct.', 'Incorrect.', 'Incorrect.', 'Incorrect.'] },
      checkpoints: [{ question: 'q', choices: ['a', 'b', 'c', 'd'], answer: 1, explanations: ['Incorrect.', 'Correct.', 'Incorrect.', 'Incorrect.'] }],
    }],
  });

  it('flags an explanation that contradicts the key', () => {
    const p = good();
    p.sections[0].checkpoints[0].answer = 0; // explanations still say choice 1 is right
    expect(validatePack(p).join(' ')).toMatch(/doesn't start "Correct"/);
    expect(validatePack(good())).toEqual([]);
  });
});

describe('planning a session', () => {
  const pack = { sections: [{ id: 'a', minutes: 6 }, { id: 'b', minutes: 3 }] };
  it('quick shows summaries, full shows everything, precheck expands only misses', () => {
    expect(planSections(pack, 'quick')).toEqual([{ id: 'a', full: false }, { id: 'b', full: false }]);
    expect(planSections(pack, 'full').every((p) => p.full)).toBe(true);
    expect(planSections(pack, 'precheck', { a: true, b: false })).toEqual([{ id: 'a', full: false }, { id: 'b', full: true }]);
    expect(planMinutes(pack, planSections(pack, 'full'))).toBe(9);
    expect(planMinutes(pack, planSections(pack, 'quick'))).toBe(3);
  });
});

describe('shuffleQuestion', () => {
  const q = { question: 'q', choices: ['right', 'w1', 'w2', 'w3'], answer: 0, explanations: ['Correct', 'I1', 'I2', 'I3'] };
  it('keeps the key and explanations aligned, and is stable per seed', () => {
    for (let seed = 1; seed < 40; seed++) {
      const s = shuffleQuestion(q, seed);
      expect(s.choices[s.answer]).toBe('right');
      expect(s.explanations[s.answer]).toBe('Correct');
      expect(s.choices.indexOf('w2')).toBe(s.explanations.indexOf('I2'));
    }
    expect(shuffleQuestion(q, 7)).toEqual(shuffleQuestion(q, 7));
  });

  it('moves the key off position A for most questions', () => {
    const positions = apBiologyUnit1.sections.flatMap((s) => s.checkpoints)
      .map((c) => shuffleQuestion(c, seedFor(c.question)).answer);
    expect(new Set(positions).size).toBeGreaterThan(2);
  });
});

describe('neuron firing simulation', () => {
  const { spikesFor } = require('../components/study/NeuronFiring');
  it('is all-or-nothing at threshold, and stronger stimuli fire more often', () => {
    expect(spikesFor(14)).toBe(0);   // -56 mV: just below -55
    expect(spikesFor(15)).toBe(1);   // reaches threshold
    expect(spikesFor(23)).toBe(3);
    expect(spikesFor(100)).toBe(5);  // capped
  });
});

describe('unit 2 simulations', () => {
  it('surface area to volume falls as 6/s for a cube', () => {
    const { cubeStats } = require('../components/study/SAVolume');
    expect(cubeStats(1)).toEqual({ sa: 6, v: 1, ratio: 6 });
    expect(cubeStats(3)).toEqual({ sa: 54, v: 27, ratio: 2 });
  });
  it('labels tonicity relative to the cell', () => {
    const { tonicityOf } = require('../components/study/Tonicity');
    expect(tonicityOf(0.2)).toBe('hypotonic');
    expect(tonicityOf(0.9)).toBe('isotonic');
    expect(tonicityOf(2)).toBe('hypertonic');
  });
  it('scores free recall by list position, any order and case', () => {
    const { scoreRecall, WORDS } = require('../components/study/SerialPosition');
    const hits = scoreRecall(`Lemon, APPLE river\nzebra`);
    expect(hits[0]).toBe(true);
    expect(hits[1]).toBe(true);
    expect(hits[WORDS.length - 1]).toBe(true);
    expect(hits.filter(Boolean).length).toBe(3);
  });
});

describe('adapting to what the student has shown', () => {
  const pack = { sections: [
    { id: 'a', checkpoints: [{}, {}] },
    { id: 'b', checkpoints: [{}, {}] },
    { id: 'c', checkpoints: [{}] },
    { id: 'd', checkpoints: [{}] },
  ] };

  it('rates each topic from this pass, leaving untested topics out', () => {
    expect(topicStatus(pack, {
      'a:cp0': true, 'a:cp1': true,          // all right
      'b:cp0': true, 'b:cp1': false,         // a miss
      'c:pre': true,                          // knew it at the pre-check
      'd:pre': false,                         // missed the pre-check, no checkpoints yet
    })).toEqual({ a: 'mastered', b: 'shaky', c: 'known', d: 'shaky' });
    expect(topicStatus(pack, { 'a:cp0': true })).toEqual({}); // half done: no verdict yet
    expect(topicStatus(pack, { 'c:cp0': true, 'c:more': false })).toEqual({ c: 'shaky' });
    expect(topicStatus(pack, { 'd:pre': false, 'd:cp0': true })).toEqual({ d: 'mastered' }); // learned it
  });

  it('a new pass only changes the topics it tested', () => {
    const saved = { a: 'shaky', b: 'mastered' };
    expect(mergeTopics(saved, topicStatus(pack, { 'a:cp0': true, 'a:cp1': true }))).toEqual({ a: 'mastered', b: 'mastered' });
  });

  it('a right pre-check masters a new topic but does not clear a past miss', () => {
    const pass = topicStatus(pack, { 'a:pre': true, 'c:pre': true });
    expect(mergeTopics({ a: 'shaky' }, pass)).toEqual({ a: 'shaky', c: 'mastered' });
    expect(mergeTopics({ a: 'shaky' }, topicStatus(pack, { 'a:pre': true, 'a:cp0': true, 'a:cp1': true }))).toEqual({ a: 'mastered' });
  });

  it('the adaptive plan expands everything not yet known', () => {
    expect(planSections(pack, 'adaptive', { a: true, c: true }).map((p) => p.full)).toEqual([false, true, false, true]);
  });

  it('summarises a pass for the unit list', () => {
    const plan = planSections(pack, 'full');
    expect(packSummary(pack, plan, { 'a:cp0': true, 'a:cp1': false, 'c:pre': true }, { c: 'mastered' }))
      .toEqual({ answered: 2, correct: 1, total: 6, mastered: 1, topicCount: 4 });
  });

  it('points at the unit in progress, then the next unfinished one, then the weakest', () => {
    const units = [{ slug: 'x/unit-1' }, { slug: 'x/unit-2' }, { slug: 'x/unit-3' }];
    const done = (mastered) => ({ summary: { answered: 5, total: 5, mastered, topicCount: 5 } });
    expect(nextUnit(units, {})).toEqual({ slug: 'x/unit-1', why: 'next' });
    expect(nextUnit(units, { 'x/unit-1': done(5), 'x/unit-2': { summary: { answered: 2, total: 5, mastered: 0, topicCount: 5 } } }))
      .toEqual({ slug: 'x/unit-2', why: 'continue' });
    expect(nextUnit(units, { 'x/unit-1': done(5) })).toEqual({ slug: 'x/unit-2', why: 'next' });
    expect(nextUnit(units, { 'x/unit-1': done(5), 'x/unit-2': done(2), 'x/unit-3': done(4) })).toEqual({ slug: 'x/unit-2', why: 'review' });
    expect(nextUnit([], {})).toBeNull();
  });

  it('joins the catalog with the packs that exist, in course order', () => {
    const courses = [
      { id: 'ap-x', units: ['One', 'Two', 'Three'] },
      { id: 'ap-p', first: 9, units: ['Heat'] },
      { id: 'ap-y', units: null },
    ];
    const packs = { 'ap-x/unit-2': { title: 'Unit 2: Two (pack)' }, 'ap-y/unit-1': { title: 'Unit 1: Y' }, 'ap-p/unit-9': { title: 'Unit 9: Heat' } };
    const [x, p, y] = joinCatalog(courses, packs, courseUnits);
    expect(x.units.map((u) => [u.slug, u.ready])).toEqual([['ap-x/unit-1', false], ['ap-x/unit-2', true], ['ap-x/unit-3', false]]);
    expect(x.units[1].title).toBe('Unit 2: Two (pack)');
    expect(x.ready).toBe(1);
    expect(p.units[0]).toMatchObject({ n: 9, slug: 'ap-p/unit-9', ready: true });
    expect(y.units).toEqual([{ n: 1, slug: 'ap-y/unit-1', title: 'Unit 1: Y', ready: true }]);
  });

  it('every pack belongs to a catalog course and a catalog unit when the course lists units', () => {
    const ids = new Map(COURSES.map((c) => [c.id, c]));
    Object.entries(PACKS).forEach(([slug, p]) => {
      const course = ids.get(slug.split('/')[0]);
      expect(course).toBeTruthy();
      expect(p.subject).toBe(course.subject);
      expect(course.units ? courseUnits(course).map((u) => u.slug) : [slug]).toContain(slug);
    });
    expect(new Set(COURSES.map((c) => c.id)).size).toBe(COURSES.length);
  });
});

describe('projectile launcher physics', () => {
  // eslint-disable-next-line global-require
  const { projectile } = require('../components/study/ProjectileLauncher');
  it('matches the worked examples (g = 10 m/s²)', () => {
    const kick = projectile({ v: 20, angle: 30 });
    expect(kick.t).toBeCloseTo(2, 5);
    expect(kick.range).toBeCloseTo(34.64, 1);
    expect(kick.peak).toBeCloseTo(5, 5);
    const ledge = projectile({ v: 3, angle: 0, h: 20 });
    expect(ledge.t).toBeCloseTo(2, 5);
    expect(ledge.range).toBeCloseTo(6, 5);
    const cliff = projectile({ v: 12, angle: 0, h: 45 });
    expect(cliff.range).toBeCloseTo(36, 5);
  });
  it('complementary angles give the same range from the ground', () => {
    expect(projectile({ v: 20, angle: 30 }).range).toBeCloseTo(projectile({ v: 20, angle: 60 }).range, 6);
    expect(projectile({ v: 20, angle: 60 }).peak).toBeGreaterThan(projectile({ v: 20, angle: 30 }).peak);
  });
  it('horizontal velocity is constant and vertical velocity changes by g every second', () => {
    const p = projectile({ v: 20, angle: 45, h: 10 });
    expect(p.landingVy).toBeCloseTo(p.vy - 10 * p.t, 6);
    expect(p.landingVy).toBeLessThan(-p.vy); // lands lower than it started, so faster downward
  });
});

describe('energy pyramid', () => {
  // eslint-disable-next-line global-require
  const { energyLevels } = require('../components/study/EnergyPyramid');
  it('applies the transfer efficiency once per level (the pack\'s worked examples)', () => {
    energyLevels(20000, 0.1).forEach((e, i) => expect(e).toBeCloseTo([20000, 2000, 200, 20][i], 6));
    expect(energyLevels(50000, 0.1)[2]).toBeCloseTo(500, 6);
  });
});

describe('mercator distortion', () => {
  // eslint-disable-next-line global-require
  const { mercatorScale } = require('../components/study/MercatorDistortion');
  it('is true to size at the equator and grows as sec² of latitude', () => {
    expect(mercatorScale(0).area).toBeCloseTo(1, 9);
    expect(mercatorScale(60).linear).toBeCloseTo(2, 9);
    expect(mercatorScale(60).area).toBeCloseTo(4, 9);
    expect(mercatorScale(72).area).toBeGreaterThan(10); // the Greenland claim in the sim's text
  });
});

describe('PES builder', () => {
  // eslint-disable-next-line global-require
  const { configFor, pesPeaks } = require('../components/study/PESBuilder');
  const text = (cfg) => cfg.map((c) => `${c.sub}${c.e}`).join(' ');
  it('fills subshells in Aufbau order', () => {
    expect(text(configFor(16))).toBe('1s2 2s2 2p6 3s2 3p4');
    expect(text(configFor(13))).toBe('1s2 2s2 2p6 3s2 3p1'); // the pack's 2:2:6:2:1 aluminum question
    expect(text(configFor(26))).toBe('1s2 2s2 2p6 3s2 3p6 4s2 3d6');
    expect(configFor(36).reduce((n, c) => n + c.e, 0)).toBe(36);
  });
  it('orders PES peaks by binding energy, 3d before 4s', () => {
    expect(pesPeaks(26).map((p) => p.sub)).toEqual(['1s', '2s', '2p', '3s', '3p', '3d', '4s']);
  });
});

describe('outlier pull statistics', () => {
  // eslint-disable-next-line global-require
  const { summarize } = require('../components/study/OutlierPull');
  it('matches the pack\'s worked example (median 17, Q1 15, Q3 19, fence 25)', () => {
    const st = summarize([12, 14, 15, 15, 16, 17, 18, 18, 19, 20, 31]);
    expect([st.median, st.q1, st.q3, st.iqr, st.highFence]).toEqual([17, 15, 19, 4, 25]);
    expect(st.outliers).toEqual([31]);
  });
  it('uses n − 1 for s and averages the middle pair when n is even', () => {
    const st = summarize([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(st.median).toBe(4.5);
    expect(st.q1).toBe(4); expect(st.q3).toBe(6);
    expect(st.sd).toBeCloseTo(Math.sqrt(32 / 7), 9);
  });
  it('median and IQR resist a moving maximum; mean and SD do not', () => {
    const a = summarize([12, 14, 15, 15, 16, 17, 18, 18, 19, 20, 21]);
    const b = summarize([12, 14, 15, 15, 16, 17, 18, 18, 19, 20, 60]);
    expect([a.median, a.iqr]).toEqual([b.median, b.iqr]);
    expect(b.mean - a.mean).toBeGreaterThan(3);
    expect(b.sd).toBeGreaterThan(2 * a.sd);
  });
});

describe('every widget in every pack survives the real parsers', () => {
  // eslint-disable-next-line global-require
  const { parseGraphSpec, parseStepsSpec } = require('./widgetSpec');
  it('no step title, graph label or slider is cut off or rejected', async () => {
    const problems = [];
    let seen = 0;
    for (const [slug, entry] of Object.entries(PACKS)) {
      const pack = (await entry.load()).default;
      for (const s of pack.sections) {
        for (const [, lang, json] of s.body.matchAll(/```(apex-steps|apex-graph)\n([\s\S]*?)\n```/g)) {
          const raw = JSON.parse(json);
          seen += 1;
          if (lang === 'apex-steps') {
            const spec = parseStepsSpec(raw);
            if (!spec) { problems.push(`${slug} ${s.id}: steps rejected`); continue; }
            if (spec.title !== raw.title.trim()) problems.push(`${slug} ${s.id}: steps title cut: ${raw.title}`);
            raw.steps.forEach((st, i) => { if (spec.steps[i].title !== st.title.trim()) problems.push(`${slug} ${s.id}: step title cut`); });
          } else {
            const spec = parseGraphSpec(raw);
            if (!spec) { problems.push(`${slug} ${s.id}: graph rejected`); continue; }
            if (spec.title !== (raw.title || '').trim()) problems.push(`${slug} ${s.id}: graph title cut`);
            raw.curves.forEach((c, i) => { if (spec.curves[i].label !== c.label.trim()) problems.push(`${slug} ${s.id}: curve label cut: ${c.label}`); });
            Object.entries(raw.params || {}).forEach(([name, p]) => {
              const got = spec.params.find((q) => q.name === name);
              if (!got || got.label !== p.label) problems.push(`${slug} ${s.id}: slider ${name} dropped or label cut`);
            });
          }
        }
      }
    }
    expect(problems).toEqual([]);
    expect(seen).toBeGreaterThan(30);
  });
});

describe('PV process first law', () => {
  // eslint-disable-next-line global-require
  const { processStep } = require('../components/study/PVProcess');
  it('obeys ΔU = Q + W in every process, with the right special cases', () => {
    for (const [k, x] of [['isobaric', 3.5], ['isobaric', 1.2], ['isochoric', 150], ['isothermal', 3], ['adiabatic', 1.5]]) {
      const r = processStep(k, x);
      expect(r.dU).toBeCloseTo(r.Q + r.W, 9);
    }
    expect(processStep('isobaric', 3).W).toBeCloseTo(-100, 9); // −PΔV = −100 kPa × 1 L
    expect(processStep('isochoric', 150).W).toBe(0);
    expect(processStep('isothermal', 4).dU).toBeCloseTo(0, 9);
    expect(processStep('adiabatic', 1).Q).toBeCloseTo(0, 9);
    expect(processStep('adiabatic', 1).Tratio).toBeGreaterThan(1); // compression heats
  });
});

describe('field map superposition', () => {
  // eslint-disable-next-line global-require
  const { fieldAt } = require('../components/study/FieldMap');
  it('cancels between equal like charges and adds between opposite ones', () => {
    const [ex, ey] = fieldAt(150, 100, [{ q: 1, x: 100, y: 100 }, { q: 1, x: 200, y: 100 }]);
    expect(Math.abs(ex) + Math.abs(ey)).toBeLessThan(1e-12);
    const [dx] = fieldAt(150, 100, [{ q: 1, x: 100, y: 100 }, { q: -1, x: 200, y: 100 }]);
    expect(dx).toBeCloseTo(2 / 50 ** 2, 12); // both point from + toward −, each k·q/r²
  });
  it('falls off as 1/r² from a single charge', () => {
    const [a] = fieldAt(110, 0, [{ q: 1, x: 100, y: 0 }]);
    const [b] = fieldAt(120, 0, [{ q: 1, x: 100, y: 0 }]);
    expect(a / b).toBeCloseTo(4, 9);
  });
});

describe('PPC explorer', () => {
  // eslint-disable-next-line global-require
  const { ppcY, opportunityCost } = require('../components/study/PPCExplorer');
  it('has constant opportunity cost when straight and increasing when bowed', () => {
    expect(opportunityCost(10, { bowed: false })).toBeCloseTo(1, 9);
    expect(opportunityCost(80, { bowed: false })).toBeCloseTo(1, 9);
    expect(opportunityCost(80, { bowed: true })).toBeGreaterThan(opportunityCost(20, { bowed: true }));
  });
  it('growth moves the intercepts out', () => {
    expect(ppcY(0, { growth: 1.2 })).toBeCloseTo(120, 9);
    expect(Number.isNaN(ppcY(110, { growth: 1 }))).toBe(true);
    expect(ppcY(110, { growth: 1.2 })).toBeGreaterThan(0);
  });
});

describe('timeline order', () => {
  // eslint-disable-next-line global-require
  const { checkOrder, startOrder } = require('../components/study/TimelineOrder');
  const ev = [{ year: 1, label: 'b' }, { year: 2, label: 'c' }, { year: 3, label: 'a' }];
  it('marks each position right or wrong', () => {
    expect(checkOrder(ev, [0, 1, 2])).toEqual([true, true, true]);
    expect(checkOrder(ev, [1, 0, 2])).toEqual([false, false, true]);
  });
  it('never starts in chronological order', () => {
    expect(startOrder(ev)).toEqual([2, 0, 1]);
    const sorted = [{ year: 1, label: 'a' }, { year: 2, label: 'b' }, { year: 3, label: 'c' }];
    expect(startOrder(sorted)).toEqual([2, 1, 0]);
  });
  it('rejects timeline events out of order', () => {
    const pack = { slug: 'x/unit-1', subject: 'x', unit: 'x', sections: [] };
    const sec = { id: '1', title: 't', summary: 's', body: 'b', revisit: 'r', minutes: 1, checkpoints: [], blocks: [{ type: 'sim', sim: 'timeline-order', props: { events: [ev[1], ev[0], ev[2]] } }] };
    expect(validatePack({ ...pack, sections: [sec] }).some((p) => p.includes('timeline'))).toBe(true);
  });
});

describe('sort buckets', () => {
  // eslint-disable-next-line global-require
  const { scoreSort } = require('../components/study/SortBuckets');
  const items = [{ label: 'a', bucket: 0 }, { label: 'b', bucket: 1 }, { label: 'c', bucket: 1 }];
  it('counts items in the right group', () => {
    expect(scoreSort(items, { 0: 0, 1: 1, 2: 1 })).toBe(3);
    expect(scoreSort(items, { 0: 1, 1: 1 })).toBe(1);
  });
  it('rejects an item pointing at a missing bucket', () => {
    const sec = { id: '1', title: 't', summary: 's', body: 'b', revisit: 'r', minutes: 1, checkpoints: [], blocks: [{ type: 'sim', sim: 'sort-buckets', props: { buckets: ['x', 'y'], items: [...items, { label: 'd', bucket: 2 }] } }] };
    expect(validatePack({ slug: 'x/unit-1', subject: 'x', unit: 'x', sections: [sec] }).some((p) => p.includes('sort'))).toBe(true);
  });
});

describe('Java labs', () => {
  // eslint-disable-next-line global-require
  const { javaOp, javaDouble } = require('../components/study/JavaArithmetic');
  // eslint-disable-next-line global-require
  const { javaSubstring } = require('../components/study/StringLab');
  it('follows Java int/double arithmetic and printing', () => {
    expect(javaOp(17, false, '/', 5, false)).toBe('3');
    expect(javaOp(17, false, '%', 5, false)).toBe('2');
    expect(javaOp(17, true, '/', 5, false)).toBe('3.4');
    expect(javaOp(20, false, '/', 4, true)).toBe('5.0');
    expect(javaOp(17, true, '%', 5, false)).toBe('2.0');
    expect(javaOp(3, false, '/', 0, false)).toBe('ArithmeticException');
    expect(javaDouble(0.1 + 0.2)).toBe('0.30000000000000004');
  });
  it('substring matches Java, including the exception cases', () => {
    expect(javaSubstring('computer', 3, 6)).toEqual({ value: 'put' });
    expect(javaSubstring('computer', 5)).toEqual({ value: 'ter' });
    expect(javaSubstring('computer', 8)).toEqual({ value: '' });
    expect(javaSubstring('computer', 2, 9).error).toBe('StringIndexOutOfBoundsException');
    expect(javaSubstring('computer', 5, 3).error).toBe('StringIndexOutOfBoundsException');
    expect(javaSubstring('computer', 9).error).toBe('StringIndexOutOfBoundsException');
  });
});

describe('password search space', () => {
  // eslint-disable-next-line global-require
  const { log10Space, crackTime } = require('../components/study/PasswordSpace');
  it('counts possibilities and converts them to time at 10^10 guesses per second', () => {
    expect(log10Space('chars', 8, 36)).toBeCloseTo(8 * Math.log10(36), 9);
    expect(log10Space('words', 4, 0)).toBeCloseTo(4 * Math.log10(7776), 9);
    expect(crackTime(log10Space('chars', 8, 36))).toBe('about 4.7 minutes');
    expect(crackTime(log10Space('words', 4, 0))).toBe('about 4.2 days');
    expect(crackTime(log10Space('chars', 4, 26))).toBe('under a second');
    expect(crackTime(log10Space('chars', 12, 94))).toBe('about 1.5 million years');
    expect(crackTime(log10Space('chars', 24, 94))).toBe('more than a thousand trillion years');
  });
});

describe('music theory sims', () => {
  // eslint-disable-next-line global-require
  const { majorScale, keySignature, TONICS } = require('../components/study/ScaleBuilder');
  // eslint-disable-next-line global-require
  const { meterType } = require('../components/study/MeterLab');
  it('spells all 15 major scales with each letter once and the right key signature', () => {
    expect(majorScale('D')).toEqual(['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯']);
    expect(majorScale('E♭')).toEqual(['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D']);
    expect(majorScale('C♭')).toEqual(['C♭', 'D♭', 'E♭', 'F♭', 'G♭', 'A♭', 'B♭']);
    expect(majorScale('C♯')).toEqual(['C♯', 'D♯', 'E♯', 'F♯', 'G♯', 'A♯', 'B♯']);
    const counts = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F♯': 6, 'C♯': 7, F: 1, 'B♭': 2, 'E♭': 3, 'A♭': 4, 'D♭': 5, 'G♭': 6, 'C♭': 7 };
    TONICS.forEach((t) => {
      expect(new Set(majorScale(t).map((n) => n[0])).size).toBe(7);
      expect(keySignature(t).count).toBe(counts[t]);
    });
    expect(keySignature('A').list).toEqual(['F♯', 'C♯', 'G♯']);
    expect(keySignature('A♭').list).toEqual(['B♭', 'E♭', 'A♭', 'D♭']);
  });
  it('classifies time signatures as the CED does', () => {
    expect(meterType(4, 4)).toMatchObject({ kind: 'simple', grouping: 'quadruple', beats: 4, beatValue: 'quarter note', divisionValue: 'eighth note' });
    expect(meterType(6, 8)).toMatchObject({ kind: 'compound', grouping: 'duple', beats: 2, beatValue: 'dotted quarter note', divisionValue: 'eighth note' });
    expect(meterType(9, 8)).toMatchObject({ kind: 'compound', grouping: 'triple', beats: 3 });
    expect(meterType(3, 8)).toMatchObject({ kind: 'simple', grouping: 'triple', beatValue: 'eighth note' });
    expect(meterType(12, 16)).toMatchObject({ kind: 'compound', grouping: 'quadruple', beatValue: 'dotted eighth note' });
    expect(meterType(2, 16).divisionValue).toBe('thirty-second note');
  });
});

describe('Latin case lab', () => {
  // eslint-disable-next-line global-require
  const { buildSentence, NOUNS } = require('../components/study/CaseLab');
  it('keeps the meaning when the word order changes', () => {
    const verb = { la: 'videt', en: 'sees' };
    const sov = buildSentence(NOUNS[0], NOUNS[2], verb, 'SOV');
    const osv = buildSentence(NOUNS[0], NOUNS[2], verb, 'OSV');
    expect(sov.words.map((w) => w.w).join(' ')).toBe('Puella canem videt');
    expect(osv.words.map((w) => w.w).join(' ')).toBe('Canem puella videt');
    expect(sov.english).toBe(osv.english);
    expect(buildSentence(NOUNS[3], NOUNS[1], verb, 'VSO').words.map((w) => w.w).join(' ')).toBe('Videt rex puerum');
  });
});

describe('Boolean search sandbox', () => {
  // eslint-disable-next-line global-require
  const { RECORDS, matches } = require('../components/study/BooleanSearch');
  const count = (a, op, b, f) => RECORDS.filter((r) => matches(r, a, op, b, f)).length;
  it('AND narrows, OR widens, NOT excludes, filters narrow', () => {
    const and = count('sleep', 'AND', 'start');
    const or = count('sleep', 'OR', 'start');
    const only = count('sleep', 'AND', '');
    expect(and).toBeLessThanOrEqual(only);
    expect(or).toBeGreaterThanOrEqual(only);
    expect(count('sleep', 'NOT', 'start')).toBe(only - and);
    expect(count('sleep', 'OR', 'start', { peerOnly: true })).toBeLessThan(or);
    expect(count('sleep', 'OR', 'start', { since: 2015 })).toBeLessThan(or);
    expect(and).toBe(1);
  });
});

describe('incline lab', () => {
  // eslint-disable-next-line global-require
  const { inclineForces } = require('../components/study/InclineLab');
  it('holds with exactly the static friction needed, then slides with kinetic friction', () => {
    const rest = inclineForces({ deg: 20, m: 2, mus: 0.5, muk: 0.3 });
    expect(rest.slides).toBe(false);
    expect(rest.friction).toBeCloseTo(20 * Math.sin((20 * Math.PI) / 180));
    expect(rest.a).toBe(0);
    const slide = inclineForces({ deg: 30, m: 2, mus: 0.5, muk: 0.3 });
    expect(slide.slides).toBe(true); // tan 30° ≈ 0.577 > 0.5
    expect(slide.a).toBeCloseTo(10 * (0.5 - 0.3 * Math.cos(Math.PI / 6)));
    // mass never decides slipping
    expect(inclineForces({ deg: 30, m: 9, mus: 0.5, muk: 0.3 }).a).toBeCloseTo(slide.a);
    expect(inclineForces({ deg: 0, m: 5, mus: 0, muk: 0 }).slides).toBe(false);
  });
});

describe('VSEPR explorer', () => {
  // eslint-disable-next-line global-require
  const { vsepr } = require('../components/study/VSEPRExplorer');
  it('maps domains and lone pairs to shapes, angles, hybridization and polarity', () => {
    expect(vsepr(4, 2)).toMatchObject({ shape: 'bent', example: 'H₂O', hybrid: 'sp³', polar: true, bonded: 2 });
    expect(vsepr(4, 1).shape).toBe('trigonal pyramidal');
    expect(vsepr(3, 0)).toMatchObject({ angle: '120°', hybrid: 'sp²', polar: false });
    expect(vsepr(5, 3)).toMatchObject({ shape: 'linear', polar: false, hybrid: null });
    expect(vsepr(6, 2)).toMatchObject({ shape: 'square planar', polar: false });
    expect(vsepr(2, 1)).toBeUndefined();
  });
});

describe('display maths in packs', () => {
  it('sits in its own paragraph, so it renders as a block, not inline', async () => {
    const problems = [];
    for (const [slug, entry] of Object.entries(PACKS)) {
      const { default: pack } = await entry.load();
      for (const s of pack.sections) {
        const lines = s.body.split('\n');
        lines.forEach((l, i) => {
          if (!/^\s*\$\$/.test(l)) return;
          if (i > 0 && lines[i - 1].trim() && !/^\s*#/.test(lines[i - 1])) problems.push(`${slug} ${s.id}: $$ glued to the line before`);
          if (/\$\$\s*$/.test(l.trim().slice(2)) && i + 1 < lines.length && lines[i + 1].trim()) problems.push(`${slug} ${s.id}: $$ glued to the line after`);
        });
        for (const m of s.body.matchAll(/(?<!\\)\$[^$\n]+(?<!\\)\$/g)) if (m[0].includes('·')) problems.push(`${slug} ${s.id}: middle dot inside maths renders red`);
        for (const row of lines.filter((l) => l.trim().startsWith('|'))) {
          for (const m of row.matchAll(/(?<!\\)\$[^$]+(?<!\\)\$/g)) if (m[0].includes('|')) problems.push(`${slug} ${s.id}: | inside maths splits a table cell; use \\lvert \\rvert`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('probability sims', () => {
  // eslint-disable-next-line global-require
  const { simulate, runningProportions } = require('../components/study/LargeNumbersLab');
  // eslint-disable-next-line global-require
  const { POPULATIONS, popStats, sampleMeans } = require('../components/study/CLTLab');
  // Deterministic generator so the checks don't flake.
  const lcg = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  it('running proportions settle near p', () => {
    expect(runningProportions([true, false, true, true])).toEqual([1, 0.5, 2 / 3, 0.75]);
    const props = runningProportions(simulate(0.3, 5000, lcg(7)));
    expect(Math.abs(props[4999] - 0.3)).toBeLessThan(0.03);
  });
  it('sample means center on mu and spread like sigma over root n', () => {
    const { mu, sigma } = popStats(POPULATIONS.Uniform);
    expect(mu).toBeCloseTo(4.5);
    expect(sigma).toBeCloseTo(Math.sqrt(8.25));
    const means = sampleMeans(POPULATIONS['Right-skewed'], 30, 4000, lcg(3));
    const s = popStats(POPULATIONS['Right-skewed']);
    const m = means.reduce((a, b) => a + b, 0) / means.length;
    const sd = Math.sqrt(means.reduce((a, b) => a + (b - m) ** 2, 0) / (means.length - 1));
    expect(Math.abs(m - s.mu)).toBeLessThan(0.05);
    expect(sd / (s.sigma / Math.sqrt(30))).toBeGreaterThan(0.9);
    expect(sd / (s.sigma / Math.sqrt(30))).toBeLessThan(1.1);
  });
});

describe('population pyramid lab', () => {
  // eslint-disable-next-line global-require
  const { stablePopulation } = require('../components/study/PopulationPyramidLab');
  it('moves through the demographic transition as births fall and lives lengthen', () => {
    const s1 = stablePopulation(36, 30);
    expect(s1.stage).toBe(1);
    expect(Math.abs(s1.nir)).toBeLessThan(0.5);
    const s2 = stablePopulation(40, 60);
    expect(s2.stage).toBe(2);
    expect(s2.doubling).toBeCloseTo(70 / s2.nir);
    expect(stablePopulation(22, 75).stage).toBe(3);
    expect(stablePopulation(12, 82).stage).toBe(4);
    const s5 = stablePopulation(8, 84);
    expect(s5.stage).toBe(5);
    expect(s5.old).toBeGreaterThan(s2.old);
    expect(s5.young).toBeLessThan(s2.young);
    // crude death rate is births minus growth, per 1,000
    expect(s2.cdr).toBeCloseTo(40 - s2.r * 1000);
    expect(s2.share.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
});

describe('labor market lab', () => {
  // eslint-disable-next-line global-require
  const { laborStats } = require('../components/study/LaborMarketLab');
  it('computes the unemployment and participation rates and the discouraged-worker effect', () => {
    const base = laborStats({ employed: 120, unemployed: 8, notInLaborForce: 72 });
    expect(base.unemploymentRate).toBeCloseTo(6.25);
    expect(base.participationRate).toBeCloseTo(64);
    const discouraged = laborStats({ employed: 120, unemployed: 7, notInLaborForce: 73 });
    expect(discouraged.unemploymentRate).toBeLessThan(base.unemploymentRate);
    expect(discouraged.participationRate).toBeLessThan(base.participationRate);
    expect(laborStats({ employed: 0, unemployed: 0, notInLaborForce: 0 }).unemploymentRate).toBe(0);
  });
});

describe('dollar signs in packs', () => {
  // A lone "$" (currency) is auto-closed as maths by the renderer, turning the rest
  // of the paragraph into italic run-together text. Currency must be written "\\$".
  const texts = (pack) => pack.sections.flatMap((sec) => [
    sec.title, sec.summary, sec.body, sec.revisit,
    ...[sec.precheck, ...sec.checkpoints].flatMap((q) => [q.question, ...q.choices, ...q.explanations]),
    ...(sec.blocks || []).flatMap((b) => (b.cards || []).flatMap((c) => [c.front, c.back])),
  ].map((t) => [sec.id, t]));
  it('every $ is paired and no maths span swallows prose', async () => {
    const problems = [];
    for (const [slug, entry] of Object.entries(PACKS)) {
      const pack = (await entry.load()).default;
      for (const [id, text] of texts(pack)) {
        // Widget JSON (apex-steps/graph) is checked as its own strings below.
        const parts = [String(text || '').replace(/```[\s\S]*?```/g, '')];
        for (const m of String(text || '').matchAll(/```apex-\w+\n([\s\S]*?)\n```/g)) {
          const spec = JSON.parse(m[1]);
          parts.push(spec.title || '', spec.answer || '', ...(spec.steps || []).flatMap((st) => [st.title, st.body]));
        }
        for (const part of parts) {
          for (const para of part.split('\n\n')) {
            const bare = para.replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\\\$/g, '');
            const singles = (bare.match(/\$/g) || []).length;
            if (singles % 2) problems.push(`${slug} ${id}: unpaired $ in "${para.slice(0, 70)}"`);
            for (const [, math] of bare.matchAll(/\$([^$]+)\$/g)) {
              const words = math.replace(/\\text\{[^}]*\}/g, '').match(/\b[a-z]{3,}\b(?:\s+\b[a-z]{3,}\b){1,}/i);
              if (words && !/\\[a-z]/i.test(words[0])) problems.push(`${slug} ${id}: prose inside maths: "$${math.slice(0, 50)}$"`);
            }
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('market lab', () => {
  // eslint-disable-next-line global-require
  const { market } = require('../components/study/MarketLab');
  const base = { a: 100, b: 1, c: 10, d: 1 };
  it('finds equilibrium and splits surplus', () => {
    const m = market(base);
    expect([m.qStar, m.pStar, m.cs, m.ps, m.dwl]).toEqual([45, 55, 1012.5, 1012.5, 0]);
  });
  it('prices a per-unit tax: revenue, deadweight loss and incidence', () => {
    const m = market({ ...base, policy: 'tax', level: 20 });
    expect([m.q, m.pBuyers, m.pSellers, m.revenue, m.cs, m.ps, m.dwl, m.buyerShare]).toEqual([35, 65, 45, 700, 612.5, 612.5, 100, 0.5]);
    // Flatter (more elastic) demand: buyers bear less of the tax.
    expect(market({ a: 100, b: 0.5, c: 10, d: 2, policy: 'tax', level: 20 }).buyerShare).toBeCloseTo(0.2);
  });
  it('handles binding and non-binding ceilings and floors', () => {
    const c = market({ ...base, policy: 'ceiling', level: 40 });
    expect([c.q, c.shortage, c.cs, c.ps, c.dwl]).toEqual([30, 30, 1350, 450, 225]);
    const f = market({ ...base, policy: 'floor', level: 70 });
    expect([f.q, f.surplus, f.cs, f.ps, f.dwl]).toEqual([30, 30, 450, 1350, 225]);
    expect(market({ ...base, policy: 'ceiling', level: 60 }).binding).toBe(false);
    expect(market({ ...base, policy: 'floor', level: 50 }).dwl).toBe(0);
  });
});
