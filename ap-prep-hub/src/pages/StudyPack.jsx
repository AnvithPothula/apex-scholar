import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Gauge, ListChecks, Brain, FileQuestion, RotateCcw, Target } from 'lucide-react';
import { Button, Card } from '../components/ui/UIComponents';
import MarkdownRenderer from '../components/MarkdownRenderer';
import FlipCards from '../components/study/FlipCards';
import PolymerBuilder from '../components/study/PolymerBuilder';
import SaturationSlider from '../components/study/SaturationSlider';
import NeuronFiring from '../components/study/NeuronFiring';
import SAVolume from '../components/study/SAVolume';
import Tonicity from '../components/study/Tonicity';
import SerialPosition from '../components/study/SerialPosition';
import ProjectileLauncher from '../components/study/ProjectileLauncher';
import EnergyPyramid from '../components/study/EnergyPyramid';
import MercatorDistortion from '../components/study/MercatorDistortion';
import PESBuilder from '../components/study/PESBuilder';
import OutlierPull from '../components/study/OutlierPull';
import PVProcess from '../components/study/PVProcess';
import FieldMap from '../components/study/FieldMap';
import PPCExplorer from '../components/study/PPCExplorer';
import TimelineOrder from '../components/study/TimelineOrder';
import SortBuckets from '../components/study/SortBuckets';
import JavaArithmetic from '../components/study/JavaArithmetic';
import StringLab from '../components/study/StringLab';
import PasswordSpace from '../components/study/PasswordSpace';
import ScaleBuilder from '../components/study/ScaleBuilder';
import MeterLab from '../components/study/MeterLab';
import CaseLab from '../components/study/CaseLab';
import BooleanSearch from '../components/study/BooleanSearch';
import InclineLab from '../components/study/InclineLab';
import { shortSubjectName, subjectSlug } from '../constants/subjects';
import VSEPRExplorer from '../components/study/VSEPRExplorer';
import LargeNumbersLab from '../components/study/LargeNumbersLab';
import CLTLab from '../components/study/CLTLab';
import PopulationPyramidLab from '../components/study/PopulationPyramidLab';
import LaborMarketLab from '../components/study/LaborMarketLab';
import MarketLab from '../components/study/MarketLab';
import PackQuestion from '../components/study/PackQuestion';
import SelectionAsk from '../components/study/SelectionAsk';
import { useAuth } from '../contexts/AuthContext';
import { logResponses } from '../services/responseLog';
import srs from '../services/srs';
import { trackEvent } from '../utils/analytics';
import { PACKS } from '../data/packs';
import { COURSES, courseUnits } from '../data/packs/catalog';
import { MODES, planSections, planMinutes, shuffleQuestion, seedFor, topicStatus, mergeTopics, packSummary } from '../utils/studyPack';
import { loadPackProgress, saveLocal, saveRemote } from '../services/packProgress';
import { subjectKeyFor } from '../utils/firstRun';

/**
 * A study pack: one unit, taught in whatever format suits each topic (text,
 * flashcards, worked steps, simulations), with checkpoints after every topic.
 *
 * The student chooses how long to spend. "Skip what I know" runs one question
 * per topic first and only expands the topics they miss. A missed checkpoint
 * shows a short recap and one more question on that topic, and the missed one
 * comes back at the end. Answers go to the response log (Progress topics) and
 * misses to the review queue. Progress and per-topic status are saved
 * (services/packProgress), so a pack resumes and the next pass adapts.
 */

const SIMS = { 'polymer-builder': PolymerBuilder, 'saturation-slider': SaturationSlider, 'neuron-firing': NeuronFiring,
  'sa-volume': SAVolume, tonicity: Tonicity, 'serial-position': SerialPosition, 'projectile-launcher': ProjectileLauncher,
  'energy-pyramid': EnergyPyramid, 'mercator-distortion': MercatorDistortion,
  'pes-builder': PESBuilder, 'outlier-pull': OutlierPull,
  'pv-process': PVProcess, 'field-map': FieldMap,
  'ppc-explorer': PPCExplorer, 'timeline-order': TimelineOrder,
  'sort-buckets': SortBuckets, 'java-arithmetic': JavaArithmetic, 'string-lab': StringLab,
  'password-space': PasswordSpace, 'scale-builder': ScaleBuilder, 'meter-lab': MeterLab,
  'case-lab': CaseLab, 'boolean-search': BooleanSearch, 'incline-lab': InclineLab, 'vsepr-explorer': VSEPRExplorer,
  'law-large-numbers': LargeNumbersLab, 'clt-lab': CLTLab,
  'population-pyramid': PopulationPyramidLab, 'labor-market': LaborMarketLab, 'market-lab': MarketLab };
const MODE_ICONS = { quick: Gauge, full: BookOpen, precheck: ListChecks, adaptive: Target };
const STATUS_CHIP = {
  mastered: { label: 'Known', className: 'text-success-400 border-success-500/40' },
  shaky: { label: 'Review', className: 'text-warning-400 border-warning-500/40' },
};

/**
 * Keyed by pack and account so moving between packs (same route, new params)
 * or signing in starts fresh. Without the key React reused the component and
 * carried the previous pack's mode and answers over (packs share topic ids
 * like "1.1"). Waits for auth so progress loads for the right account.
 */
export default function StudyPack() {
  const { subject, unit } = useParams();
  const { user, loading } = useAuth();
  const slug = `${subject}/${unit}`;
  if (loading && PACKS[slug]) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-content-muted" role="status">Loading {PACKS[slug].title}…</div>;
  }
  // Highlight anything in the pack to ask about it, answered in place.
  return (
    <SelectionAsk key={slug} slug={slug} subject={PACKS[slug]?.subject} unit={PACKS[slug]?.title}>
      <StudyPackView key={`${slug}:${user?.uid || ''}`} slug={slug} uid={user?.uid || null} />
    </SelectionAsk>
  );
}

function StudyPackView({ slug, uid }) {
  const entry = PACKS[slug];
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [topics, setTopics] = useState({});      // topic id -> 'mastered' | 'shaky', as of the start of this pass
  const [resume, setResume] = useState(null);    // { pass, summary } of an unfinished pass, offered on the choose screen
  const [mode, setMode] = useState(null);
  const [stage, setStage] = useState('choose');  // choose | precheck | study
  const [preIndex, setPreIndex] = useState(0);
  const [answers, setAnswers] = useState({});    // question key -> the choice text picked
  const [expanded, setExpanded] = useState({});
  const pending = useRef(null);
  const learnLogged = useRef(false); // once per visit: this counts as a study session

  useEffect(() => {
    if (!entry) return undefined;
    let live = true;
    Promise.all([entry.load(), loadPackProgress(uid, slug)]).then(([m, saved]) => {
      if (!live) return;
      setPack(m.default);
      setTopics(saved?.topics || {});
      const p = saved?.pass;
      if (p && p.stage !== 'choose' && Object.keys(p.answers || {}).length) setResume({ pass: p, summary: saved.summary });
    });
    return () => { live = false; };
  }, [entry, uid, slug]);

  // Shuffled once per question, stable for this student and page.
  const shuffled = useMemo(() => {
    if (!pack) return {};
    const out = {};
    pack.sections.forEach((s) => {
      out[`${s.id}:pre`] = shuffleQuestion(s.precheck, seedFor(s.precheck.question));
      out[`${s.id}:more`] = shuffleQuestion(s.precheck, seedFor(s.precheck.question) + 2);
      s.checkpoints.forEach((q, i) => {
        out[`${s.id}:cp${i}`] = shuffleQuestion(q, seedFor(q.question));
        out[`${s.id}:retry${i}`] = shuffleQuestion(q, seedFor(q.question) + 1);
      });
    });
    return out;
  }, [pack]);

  // Answers are saved as the choice text, so an edited pack can't turn a saved
  // pick into a different option; a pick that no longer exists counts as unanswered.
  const pickOf = useCallback((k) => {
    const i = shuffled[k] ? shuffled[k].choices.indexOf(answers[k]) : -1;
    return i >= 0 ? i : null;
  }, [shuffled, answers]);
  const results = useMemo(() => {
    const r = {};
    Object.keys(answers).forEach((k) => {
      const i = pickOf(k);
      if (i !== null) r[k] = i === shuffled[k].answer;
    });
    return r;
  }, [answers, pickOf, shuffled]);

  const liveTopics = useMemo(() => (pack ? mergeTopics(topics, topicStatus(pack, results)) : topics), [pack, topics, results]);
  const known = useMemo(() => {
    const k = {};
    pack?.sections.forEach((s) => {
      if (topics[s.id] === 'mastered' || (mode === 'precheck' && results[`${s.id}:pre`] === true)) k[s.id] = true;
    });
    return k;
  }, [pack, topics, mode, results]);
  const plan = useMemo(() => (pack && mode ? planSections(pack, mode, known) : []), [pack, mode, known]);

  // Save every change locally at once and to the account a moment later
  // (answers come in bursts). A save still pending on unmount is flushed.
  useEffect(() => {
    if (!pack || !mode) return undefined;
    const data = {
      v: 1,
      updatedAt: Date.now(),
      topics: liveTopics,
      pass: { mode, stage, preIndex, answers, expanded, base: topics },
      summary: packSummary(pack, plan, results, liveTopics),
    };
    saveLocal(uid, slug, data);
    pending.current = data;
    const t = setTimeout(() => { saveRemote(uid, slug, data); pending.current = null; }, 1200);
    return () => clearTimeout(t);
  }, [pack, mode, stage, preIndex, answers, expanded, topics, liveTopics, plan, results, uid, slug]);
  useEffect(() => () => { if (pending.current) saveRemote(uid, slug, pending.current); }, [uid, slug]);

  if (!entry) {
    const course = COURSES.find((c) => slug.startsWith(`${c.id}/`));
    const planned = course && courseUnits(course).find((u) => u.slug === slug);
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-h2 font-bold text-content-primary">
          {planned ? `${course.subject} ${planned.title}: coming soon` : "That unit doesn't exist yet"}
        </h1>
        <p className="text-body text-content-secondary mt-2">
          We're writing these one unit at a time and checking each against the College Board course description.
        </p>
        <Button className="mt-6" onClick={() => navigate(course ? `/study/${course.id}` : '/study')}>
          {course ? `${course.subject} units` : 'Back to Learn'}
        </Button>
      </div>
    );
  }
  if (!pack) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-content-muted" role="status">Loading {entry.title}…</div>;
  }

  const byId = new Map(pack.sections.map((s) => [s.id, s]));
  const preQueue = pack.sections.filter((s) => topics[s.id] !== 'mastered');

  // One answer: remember it, log it, and queue a miss for review.
  const record = (s, kind, i, q, { correct, chosen, ms }) => {
    setAnswers((a) => ({ ...a, [`${s.id}:${kind}${i ?? ''}`]: q.choices[chosen] }));
    if (!uid) return;
    if (!learnLogged.current) {
      learnLogged.current = true;
      import('../services/activityTracker').then((m) => m.recordLearnSession(uid, pack.subject));
    }
    const original = kind === 'pre' || kind === 'more' ? s.precheck : s.checkpoints[i];
    logResponses(uid, [{
      itemId: `${pack.slug}#${s.id}#${kind}${i ?? ''}`,
      subject: pack.subject,
      unit: s.title,
      source: 'lesson',
      chosen: original.choices.indexOf(q.choices[chosen]), // authored order, so distractors line up across students
      correct,
      msToAnswer: ms,
    }]);
    if (!correct && kind !== 'pre') {
      srs.addMisses(uid, [{
        question: q.question,
        subject: pack.subject,
        unit: s.title,
        options: q.choices,
        correctIndex: q.answer,
        userAnswer: q.choices[chosen],
        correctAnswer: q.choices[q.answer],
        explanation: q.explanations[chosen] || q.explanations[q.answer],
      }]);
    }
  };

  // A new pass starts clean but keeps everything learned about each topic.
  const begin = (m) => {
    setTopics(liveTopics);
    setAnswers({});
    setExpanded({});
    setPreIndex(0);
    setResume(null);
    setMode(m);
    const toCheck = pack.sections.filter((s) => liveTopics[s.id] !== 'mastered');
    setStage(m === 'precheck' && toCheck.length ? 'precheck' : 'study');
    trackEvent('pack_start', { pack: pack.slug, mode: m });
  };
  const continuePass = () => {
    const p = resume.pass;
    setTopics(p.base || topics);
    setAnswers(p.answers || {});
    setExpanded(p.expanded || {});
    setPreIndex(p.preIndex || 0);
    setMode(p.mode);
    setStage(p.stage);
    setResume(null);
    trackEvent('pack_resume', { pack: pack.slug, mode: p.mode });
  };

  // ---- choose ----------------------------------------------------------
  if (stage === 'choose') {
    const mastered = Object.fromEntries(Object.entries(topics).filter(([, v]) => v === 'mastered').map(([id]) => [id, true]));
    // Until some topic is known the personal plan would just be "Full lessons".
    const hasHistory = Object.keys(mastered).length > 0;
    const modes = Object.keys(MODES).filter((k) => k !== 'adaptive' || hasHistory);
    if (hasHistory) modes.unshift(modes.pop()); // the personal plan goes first
    const minutes = {
      quick: planMinutes(pack, planSections(pack, 'quick')),
      full: planMinutes(pack, planSections(pack, 'full')),
      adaptive: planMinutes(pack, planSections(pack, 'adaptive', mastered)),
      precheck: null,
    };
    const shaky = pack.sections.filter((s) => topics[s.id] === 'shaky');
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate(`/study/${slug.split('/')[0]}`)}
          className="text-body-sm text-content-muted hover:text-content-primary">← {pack.subject} units</button>
        <p className="text-label text-content-muted uppercase tracking-wide mt-4">{pack.subject} · Learn</p>
        <h1 className="text-h1 font-bold text-content-primary mt-1">{pack.unit}</h1>
        <p className="text-body text-content-secondary mt-3">{pack.intro}</p>
        <p className="text-body-sm text-content-muted mt-2">On the exam: {pack.examWeight}. {pack.sections.length} topics.</p>
        {!uid && (
          <p className="text-body-sm text-content-muted mt-2">
            Your progress is saved on this device. <button type="button" onClick={() => navigate('/login')} className="underline text-primary-400">Sign in</button> to keep it on every device.
          </p>
        )}

        {resume && (
          <Card className="mt-6 p-4 border-primary-500/60 flex flex-wrap items-center justify-between gap-3">
            <span>
              <span className="block text-body font-medium text-content-primary">Pick up where you left off</span>
              <span className="block text-body-sm text-content-muted">
                {MODES[resume.pass.mode]?.label}
                {resume.summary ? ` · ${resume.summary.answered} of ${resume.summary.total} checkpoints` : ''}
              </span>
            </span>
            <Button onClick={continuePass}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Card>
        )}

        <h2 className="text-h4 font-semibold text-content-primary mt-8 mb-3">{resume ? 'Or start a new pass' : 'How much time do you have?'}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {modes.map((key) => {
            const m = MODES[key];
            const Icon = MODE_ICONS[key];
            return (
              <button key={key} type="button" onClick={() => begin(key)}
                className={`p-4 rounded-lg border bg-base-850 hover:border-primary-500 text-left transition-colors ${key === 'adaptive' ? 'border-primary-500/60' : 'border-border-strong'}`}>
                <Icon className="w-5 h-5 text-primary-400 mb-2" aria-hidden="true" />
                <span className="block text-body font-medium text-content-primary">
                  {m.label}{key === 'adaptive' && <span className="ml-2 text-caption text-primary-400">Recommended</span>}
                </span>
                <span className="block text-body-sm text-content-muted mt-1">
                  {key !== 'adaptive' ? m.hint
                    : Object.keys(mastered).length === pack.sections.length
                      ? 'You know every topic here: summaries and checkpoints to keep it fresh.'
                      : `Full lessons for the ${pack.sections.length - Object.keys(mastered).length} topics you missed or haven't done; summaries for the ${Object.keys(mastered).length} you know.`}
                </span>
                <span className="flex items-center gap-1 text-caption text-content-muted mt-2">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {minutes[key] ? `about ${minutes[key]} min` : 'depends on you'}
                </span>
              </button>
            );
          })}
        </div>
        {shaky.length > 0 && (
          <p className="text-body-sm text-content-secondary mt-4">
            To work on: {shaky.map((s) => s.title).join(', ')}.
          </p>
        )}
        <ul className="mt-8 space-y-1.5 text-body-sm text-content-secondary">
          {pack.sections.map((s) => {
            const chip = STATUS_CHIP[topics[s.id]];
            return (
              <li key={s.id} className="flex items-start gap-2">
                <span className="flex-1"><span className="text-content-muted">{s.id}</span> {s.title}</span>
                {chip && <span className={`shrink-0 text-caption px-1.5 rounded border ${chip.className}`}>{chip.label}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // ---- pre-check -------------------------------------------------------
  if (stage === 'precheck') {
    // Topics already shown as known (an earlier pass) aren't checked again.
    const s = preQueue[Math.min(preIndex, preQueue.length - 1)];
    const key = `${s.id}:pre`;
    const answered = results[key] !== undefined;
    const last = preIndex >= preQueue.length - 1;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-body-sm text-content-muted">
          Pre-check {preIndex + 1} of {preQueue.length} · {s.title}
          {preQueue.length < pack.sections.length && ` (skipping ${pack.sections.length - preQueue.length} you already know)`}
        </p>
        <PackQuestion key={key} q={shuffled[key]} answered={pickOf(key)} onAnswer={(o) => record(s, 'pre', null, shuffled[key], o)} />
        <div className="flex justify-between items-center">
          <button type="button" className="text-body-sm text-content-muted underline" onClick={() => setStage('study')}>
            Skip the rest of the pre-check
          </button>
          <Button disabled={!answered} onClick={() => (last ? setStage('study') : setPreIndex(preIndex + 1))}>
            {last ? 'Start studying' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ---- study -----------------------------------------------------------
  const cpKeys = plan.flatMap((p) => byId.get(p.id).checkpoints.map((_, i) => `${p.id}:cp${i}`));
  const answeredCount = cpKeys.filter((k) => results[k] !== undefined).length;
  const missedKeys = cpKeys.filter((k) => results[k] === false);
  const allDone = answeredCount === cpKeys.length;
  const correctCount = cpKeys.filter((k) => results[k] === true).length;
  const knownCount = Object.keys(known).length;
  const tutorKey = subjectKeyFor(pack.subject);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="sticky top-14 z-10 -mx-4 px-4 py-2 bg-base-900/95 backdrop-blur border-b border-border-subtle mb-6">
        <div className="flex items-center justify-between text-body-sm">
          <span className="text-content-primary font-medium truncate min-w-0">{pack.unit}</span>
          <span className="text-content-muted shrink-0 whitespace-nowrap ml-3">{answeredCount} of {cpKeys.length} checkpoints</span>
        </div>
        <div className="w-full bg-base-800 rounded-full h-1 mt-1.5" aria-hidden="true">
          <div className="bg-primary-500 h-1 rounded-full transition-all" style={{ width: `${cpKeys.length ? (answeredCount / cpKeys.length) * 100 : 0}%` }} />
        </div>
      </div>

      {(mode === 'precheck' || mode === 'adaptive') && (
        <p className="text-body-sm text-content-secondary mb-6">
          {knownCount === 0
            ? 'Every topic is a full lesson this time.'
            : `You've shown you know ${knownCount} of ${pack.sections.length} topics, so ${knownCount === 1 ? 'that one is' : 'those are'} shown as a summary. Open any of them for the full lesson.`}
        </p>
      )}

      {plan.map(({ id, full }) => {
        const s = byId.get(id);
        const open = full || expanded[id];
        const missedHere = s.checkpoints.some((_, i) => results[`${id}:cp${i}`] === false);
        return (
          <section key={id} id={`topic-${id}`} className="mb-12 scroll-mt-28">
            <p className="text-label text-content-muted uppercase tracking-wide">Topic {s.id} · {s.minutes} min</p>
            <h2 className="text-h2 font-bold text-content-primary mt-1 mb-3">{s.title}</h2>
            {open ? (
              <>
                <MarkdownRenderer content={s.body} className="text-content-secondary" />
                {s.blocks.map((b, bi) => {
                  if (b.type === 'flashcards') return <FlipCards key={bi} cards={b.cards} subject={pack.subject} deckName={`${shortSubjectName(pack.subject)} ${s.id}: ${s.title}`} />;
                  const Sim = SIMS[b.sim];
                  return Sim ? <Sim key={bi} {...b.props} /> : null;
                })}
              </>
            ) : (
              <>
                <MarkdownRenderer content={s.summary} className="text-content-secondary" />
                <button type="button" onClick={() => setExpanded((e) => ({ ...e, [id]: true }))}
                  className="mt-2 text-body-sm text-primary-400 hover:text-primary-500 underline">
                  Show the full lesson
                </button>
              </>
            )}
            {s.checkpoints.map((q, i) => {
              const k = `${id}:cp${i}`;
              return <PackQuestion key={k} q={shuffled[k]} label={`Checkpoint ${i + 1} of ${s.checkpoints.length}`}
                answered={pickOf(k)} onAnswer={(o) => record(s, 'cp', i, shuffled[k], o)} />;
            })}
            {missedHere && (
              <Card className="p-4 border-warning-500/60">
                <p className="text-body-sm font-semibold text-content-primary mb-1">Quick recap</p>
                <MarkdownRenderer content={s.revisit} className="text-body-sm text-content-secondary" />
                <p className="text-caption text-content-muted mt-2">The question you missed comes back at the end.</p>
              </Card>
            )}
            {/* A miss earns one more question on the same topic right away,
                unless this pass already showed it as the pre-check. */}
            {missedHere && results[`${id}:pre`] === undefined && (
              <PackQuestion key={`${id}:more`} q={shuffled[`${id}:more`]} label="One more on this topic"
                answered={pickOf(`${id}:more`)} onAnswer={(o) => record(s, 'more', null, shuffled[`${id}:more`], o)} />
            )}
          </section>
        );
      })}

      {allDone && missedKeys.length > 0 && (
        <section className="mb-10">
          <h2 className="text-h3 font-bold text-content-primary mb-1">Try these again</h2>
          <p className="text-body-sm text-content-muted mb-2">Same questions, answers reshuffled. Getting one right now is what makes it stick.</p>
          {missedKeys.map((k) => {
            const [id, cp] = k.split(':');
            const i = Number(cp.replace('cp', ''));
            const rk = `${id}:retry${i}`;
            return <PackQuestion key={rk} q={shuffled[rk]} label={`From ${byId.get(id).title}`}
              answered={pickOf(rk)} onAnswer={(o) => record(byId.get(id), 'retry', i, shuffled[rk], o)} />;
          })}
        </section>
      )}

      {allDone && (
        <Card className="p-6 text-center">
          <p className="text-h3 font-bold text-content-primary">{correctCount} of {cpKeys.length} checkpoints right</p>
          <p className="text-body-sm text-content-secondary mt-1">
            {missedKeys.length
              ? uid ? 'The ones you missed are in your review queue.' : 'Sign in to keep the ones you missed in a review queue.'
              : 'Clean sweep. Test it under exam conditions next.'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {missedKeys.length > 0 && uid && (
              <Button variant="secondary" onClick={() => navigate('/review')}><RotateCcw className="w-4 h-4 mr-2" />Review</Button>
            )}
            <Button variant="secondary" onClick={() => navigate(tutorKey ? `/ai-tutors/${subjectSlug(tutorKey)}` : '/ai-tutors', {
              state: { prefill: `I just studied ${pack.subject} ${pack.unit}. Quiz me on the parts students usually get wrong.` },
            })}><Brain className="w-4 h-4 mr-2" />Ask the tutor</Button>
            <Button onClick={() => navigate('/practice-tests')}><FileQuestion className="w-4 h-4 mr-2" />Practice test</Button>
          </div>
        </Card>
      )}

      <p className="text-caption text-content-muted mt-8">
        Written against the College Board {pack.subject} Course and Exam Description
        (topics {pack.sections[0].id.split('–')[0]}–{pack.sections[pack.sections.length - 1].id.split('–').pop()}).
        Spotted a mistake? <a href="mailto:help@apex-scholar.com?subject=Study%20pack%20mistake" className="underline">Tell us</a>.
      </p>
      {/* CC BY-NC-SA requires credit, a license link, a note of changes, and
          sharing the adaptation under the same license. */}
      {pack.credits?.map((c) => (
        <p key={c.url} className="text-caption text-content-muted mt-2">
          Adapted in part from <a href={c.url} className="underline" target="_blank" rel="noopener noreferrer">{c.title}</a> by {c.author},
          licensed <a href={c.licenseUrl} className="underline" target="_blank" rel="noopener noreferrer">{c.license}</a>. {c.note}{' '}
          Rewritten for the AP course description and rebuilt as Apex Scholar lessons; this pack is shared under the same license.
        </p>
      ))}
    </div>
  );
}
