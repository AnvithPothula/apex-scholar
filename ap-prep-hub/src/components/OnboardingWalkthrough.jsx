import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, X, Brain, FileQuestion, Zap, Calculator,
  Calendar, Sparkles, GraduationCap, RotateCcw, Check,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firestore';
import { useAuth } from '../contexts/AuthContext';
import errorLogger from '../utils/errorLogger';
import { easeOutExpo } from '../utils/animations';
import {
  ONBOARDING_KEY, ONBOARDING_VERSION,
  shouldShowOnboarding, isReturningUser, existingSubjects, completionRecord,
} from './onboarding/onboardingState';
import SubjectStep from './onboarding/SubjectStep';

/**
 * First-run setup.
 *
 * The previous version was a seven-slide feature tour ending on "Head to
 * Settings to select your AP subjects". Measured on production: 74 of 92 users
 * completed it, 4 ended up with subjects set. It told people to do the one
 * thing that matters instead of letting them do it.
 *
 * This version asks. Subjects are step 2 of 4, they save the moment they are
 * picked rather than at the end, and the flow is versioned so the 88 users who
 * never configured anything get asked once more.
 */

/**
 * The full picture, for someone who has never seen the app. Six slides of tour
 * became one screen.
 */
const FEATURES = [
  { icon: Brain, color: 'text-accent-400', bg: 'bg-accent-500/15', name: 'AI tutors',
    blurb: 'Every AP subject, trained on the College Board frameworks.' },
  { icon: FileQuestion, color: 'text-success-400', bg: 'bg-success-500/15', name: 'Practice tests',
    blurb: 'Full-length, rubric-graded FRQs, predicted 1–5.' },
  { icon: RotateCcw, color: 'text-primary-400', bg: 'bg-primary-500/15', name: 'Review',
    blurb: 'Every question you miss comes back until it sticks.' },
  { icon: Calendar, color: 'text-info-400', bg: 'bg-info-500/15', name: 'Smart Scheduler',
    blurb: 'Study blocks around your real Schoology assignments.' },
  { icon: Zap, color: 'text-warning-400', bg: 'bg-warning-500/15', name: 'Flashcards & Solver',
    blurb: 'Spaced repetition, and a photo solver for stuck problems.' },
  { icon: Calculator, color: 'text-primary-400', bg: 'bg-primary-500/15', name: 'Score calculators',
    blurb: 'All 36 subjects, and the only one that shows you the curve.' },
];

/**
 * Only what changed, for someone who already took the v1 tour.
 *
 * Showing a returning user the same six features they were shown before is how
 * a re-onboarding gets skipped. They need the delta and the one question they
 * never answered.
 */
const WHATS_NEW = [
  { icon: RotateCcw, color: 'text-primary-400', bg: 'bg-primary-500/15', name: 'Review, rebuilt',
    blurb: 'Real spaced repetition. Miss a question and it comes back on a schedule until it sticks.' },
  { icon: Calculator, color: 'text-info-400', bg: 'bg-info-500/15', name: 'Score calculators',
    blurb: 'All 36 subjects, no account needed, and the only ones that show you the curve.' },
  { icon: Calendar, color: 'text-success-400', bg: 'bg-success-500/15', name: '2027 exam dates',
    blurb: 'May 3–14, late testing May 17–21. Your countdown knows which day you sit.' },
  { icon: Zap, color: 'text-warning-400', bg: 'bg-warning-500/15', name: 'Faster practice',
    blurb: 'Thousands of pre-written questions, so diagnostics start instantly.' },
];

const stepVariants = {
  enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: easeOutExpo } },
  exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.18 } }),
};

export default function OnboardingWalkthrough() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [returning, setReturning] = useState(false);
  const [subjects, setSubjects] = useState([]);
  // Frozen at load: the step's framing must not change as they edit.
  const [initialSubjects, setInitialSubjects] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let localVersion = 0;
    try { localVersion = Number(localStorage.getItem(ONBOARDING_KEY)) || 0; } catch (e) {
      errorLogger.debug('localStorage read failed (onboarding)', { error: e?.message });
    }
    if (localVersion >= ONBOARDING_VERSION) return undefined;

    let cancelled = false;
    let timer = null;
    (async () => {
      let remote = null;
      if (user?.uid) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          remote = snap.exists() ? snap.data() : {};
        } catch (e) {
          errorLogger.debug('Firestore onboarding check failed', { error: e?.message });
        }
      }
      if (cancelled) return;

      if (!shouldShowOnboarding({ localVersion, remote })) {
        try { localStorage.setItem(ONBOARDING_KEY, String(ONBOARDING_VERSION)); } catch (e) {
          errorLogger.debug('localStorage write failed (onboarding)', { error: e?.message });
        }
        return;
      }
      setReturning(isReturningUser(remote));
      const already = existingSubjects(remote);
      setSubjects(already);
      setInitialSubjects(already);
      // Let the page paint first so this doesn't land on a blank screen.
      timer = setTimeout(() => setVisible(true), 1200);
    })();

    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [user]);

  /**
   * Save subjects as soon as they change, not at the end.
   *
   * Someone who picks their courses and then closes the tab has still told us
   * what we needed; holding that until a final "Done" throws it away.
   */
  const persistSubjects = useCallback((next) => {
    setSubjects(next);
    if (!user?.uid) return;
    setDoc(doc(db, 'users', user.uid), { subjects: next }, { merge: true })
      .then(() => setSaved(true))
      .catch((e) => errorLogger.debug('Firestore subject write failed', { error: e?.message }));
  }, [user]);

  const finish = useCallback(() => {
    try { localStorage.setItem(ONBOARDING_KEY, String(ONBOARDING_VERSION)); } catch (e) {
      errorLogger.debug('localStorage write failed (onboarding)', { error: e?.message });
    }
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), completionRecord(), { merge: true })
        .catch((e) => errorLogger.debug('Firestore onboarding write failed', { error: e?.message }));
    }
    setVisible(false);
  }, [user]);

  // Three genuinely different flows, not one flow with swapped copy.
  //
  //   new                     welcome -> subjects -> everything it does -> done
  //   returning, no subjects  what's new -> the question they never answered -> done
  //   returning, has subjects what's new -> confirm for the new school year -> done
  //
  // A returning user shown the same six features they already sat through is a
  // returning user who hits Skip.
  const hadSubjects = useMemo(() => existingSubjects({ subjects: initialSubjects }).length > 0, [initialSubjects]);

  const steps = useMemo(() => {
    const subjectStep = {
      key: 'subjects',
      icon: GraduationCap,
      title: returning
        ? (hadSubjects ? 'Still taking these?' : 'Which APs are you taking?')
        : 'Which APs are you taking?',
      body: returning
        ? (hadSubjects
            ? "It's a new school year, so these are probably last year's. Add what you're taking now and drop what you're not."
            : "You never picked these, which is why your scheduler and exam countdown have been empty. It takes two taps.")
        : null,
    };

    const doneStep = {
      key: 'done',
      icon: Check,
      title: subjects.length ? "You're set" : 'One thing left',
      body: subjects.length
        ? `${subjects.length} subject${subjects.length === 1 ? '' : 's'} saved. Your exam countdown and study schedule are live. Start with a diagnostic if you want to know where you stand, or just open a tutor and ask something.`
        : 'Without subjects the scheduler, exam countdown and personalised practice stay off. Settings → Your AP Subjects, whenever you want them.',
    };

    if (returning) {
      return [
        {
          key: 'whatsnew',
          icon: Sparkles,
          title: 'A few things are new',
          body: 'Here is what changed since you last looked.',
        },
        subjectStep,
        doneStep,
      ];
    }

    return [
      {
        key: 'welcome',
        icon: GraduationCap,
        title: 'Welcome to Apex Scholar',
        body: 'Free AP prep, built by a student. AI tutors, practice tests, spaced repetition and a scheduler. No ads, no paywall, no trial. This takes about thirty seconds.',
      },
      subjectStep,
      {
        key: 'features',
        icon: Sparkles,
        title: "What's in here",
        body: null,
      },
      doneStep,
    ];
  }, [returning, hadSubjects, subjects.length]);

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;
  const progressPct = ((step + 1) / steps.length) * 100;

  const next = () => (isLast ? finish() : (setDirection(1), setStep((s) => s + 1)));
  const prev = () => step > 0 && (setDirection(-1), setStep((s) => s - 1));

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set up Apex Scholar"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300"
    >
      <div className="bg-base-850 rounded-md max-w-lg w-full border border-border shadow-floating overflow-hidden">
        <div className="h-1 bg-base-800">
          <motion.div
            className="h-full bg-primary-500"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          />
        </div>

        <div className="flex justify-between items-center px-6 pt-4">
          <span className="text-caption text-content-muted">{step + 1} of {steps.length}</span>
          <button
            onClick={finish}
            className="text-content-muted hover:text-content-secondary transition-colors text-caption flex items-center gap-1"
          >
            Skip <X className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={current.key} custom={direction} variants={stepVariants}
              initial="enter" animate="center" exit="exit">

              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-md bg-primary-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-h4 font-display font-bold text-content-primary">{current.title}</h2>
              </div>

              {current.body && (
                <p className="text-content-secondary text-body-sm leading-relaxed">{current.body}</p>
              )}

              {current.key === 'subjects' && (
                <SubjectStep selected={subjects} onChange={persistSubjects} returning={returning} />
              )}

              {(current.key === 'features' || current.key === 'whatsnew') && (
                <div className={`grid gap-2.5 ${current.key === 'features' ? 'sm:grid-cols-2' : ''} ${current.body ? 'mt-3' : ''}`}>
                  {(current.key === 'features' ? FEATURES : WHATS_NEW).map((f) => (
                    <div key={f.name} className="flex gap-2.5 items-start">
                      <div className={`w-8 h-8 rounded-md ${f.bg} flex items-center justify-center shrink-0`}>
                        <f.icon className={`w-4 h-4 ${f.color}`} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-content-primary leading-tight">{f.name}</p>
                        <p className="text-caption text-content-muted leading-snug">{f.blurb}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={step === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-body-sm font-medium transition-colors ${
              step === 0 ? 'text-base-750 cursor-not-allowed' : 'text-content-secondary hover:bg-base-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </button>

          <div className="flex gap-1.5 items-center">
            {steps.map((s, i) => (
              <button
                key={s.key}
                aria-label={`Go to step ${i + 1}`}
                onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-primary-500 w-4' : 'bg-base-750 hover:bg-base-700 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-body-sm font-semibold transition-all ${
              isLast || current.key === 'subjects'
                ? 'bg-primary-500 text-base-950 shadow-raised hover:bg-primary-400'
                : 'bg-base-800 text-content-primary hover:bg-base-750'
            }`}
          >
            {isLast ? 'Start studying' : 'Next'} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {saved && current.key === 'subjects' && (
          <p className="px-6 pb-4 -mt-2 text-caption text-success-400 flex items-center gap-1">
            <Check className="w-3 h-3" strokeWidth={2} /> Saved
          </p>
        )}
      </div>
    </div>
  );
}
