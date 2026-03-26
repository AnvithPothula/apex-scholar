import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, X, Brain, FileQuestion, Zap, Calculator, Calendar, Settings, Sparkles } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import errorLogger from '../utils/errorLogger';

const ONBOARDING_KEY = 'apex.onboarding.completed';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to Apex Scholar!',
    description: 'Your AI-powered AP exam prep platform. Let\'s take a quick tour of the key features.',
    color: 'bg-base-750'
  },
  {
    icon: Brain,
    title: 'AI Tutors',
    description: 'Chat with expert AI tutors for any AP subject. Choose modes like Explain, Practice MCQ, Walkthrough, or upload files for analysis.',
    color: 'bg-base-750'
  },
  {
    icon: FileQuestion,
    title: 'Practice Tests',
    description: 'Generate full-length AP practice tests with real exam format, timed sections, and detailed scoring analysis.',
    color: 'bg-base-750'
  },
  {
    icon: Zap,
    title: 'Flashcards',
    description: 'AI-generated flashcards with spaced repetition to help you memorize key concepts efficiently.',
    color: 'bg-base-750'
  },
  {
    icon: Calculator,
    title: 'Problem Solver',
    description: 'Upload or type any problem — get step-by-step solutions with LaTeX-rendered math.',
    color: 'bg-base-750'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    description: 'AI creates an optimized study schedule based on your subjects, deadlines, and study preferences.',
    color: 'bg-base-750'
  },
  {
    icon: Settings,
    title: 'Personalize Your Experience',
    description: 'Head to Settings to select your AP subjects, customize your AI tutor\'s style, and set study preferences. You\'re all set — let\'s get that 5!',
    color: 'bg-base-750'
  }
];

export default function OnboardingWalkthrough() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check localStorage first (fast)
    try {
      if (localStorage.getItem(ONBOARDING_KEY) === 'true') return;
    } catch (e) { errorLogger.debug('localStorage read failed (onboarding)', { error: e?.message }); }

    // Also check Firestore (persistent across devices/clears)
    let cancelled = false;
    let timer = null;
    const checkFirestore = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().onboardingCompleted) {
            // Sync to localStorage so future checks are fast
            try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch (e) { /* ignore */ }
            return;
          }
        } catch (e) { errorLogger.debug('Firestore onboarding check failed', { error: e?.message }); }
      }
      // Show after a short delay to let the page render first
      if (!cancelled) {
        timer = setTimeout(() => setVisible(true), 2000);
      }
    };
    checkFirestore();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [user]);

  const handleDismiss = useCallback(() => {
    // Persist to localStorage
    try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch (e) { errorLogger.debug('localStorage write failed (onboarding)', { error: e?.message }); }
    // Persist to Firestore (survives localStorage clears and works across devices)
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { onboardingCompleted: true }, { merge: true })
        .catch(e => errorLogger.debug('Firestore onboarding write failed', { error: e?.message }));
    }
    setVisible(false);
  }, [user]);

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      handleDismiss();
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
      <div className="bg-base-850 rounded-md max-w-md w-full border border-border shadow-floating overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-base-800">
          <div
            className={`h-full ${current.color} transition-all duration-500`}
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header with skip */}
        <div className="flex justify-between items-center px-6 pt-4">
          <span className="text-xs text-content-muted">{step + 1} of {STEPS.length}</span>
          <button
            onClick={handleDismiss}
            className="text-content-muted hover:text-content-secondary transition-colors text-xs flex items-center gap-1"
          >
            Skip tour <X className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-md ${current.color} flex items-center justify-center mb-4 shadow-raised`}>
            <Icon className="w-8 h-8 text-base-950" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-content-primary mb-2">{current.title}</h2>
          <p className="text-content-secondary text-sm leading-relaxed">{current.description}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              step === 0 ? 'text-base-750 cursor-not-allowed' : 'text-content-secondary hover:bg-base-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to step ${i + 1}`}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-content-primary w-4' : 'bg-base-750 hover:bg-base-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isLast
                ? 'bg-content-primary text-base-950 shadow-raised'
                : 'bg-base-800 text-content-primary hover:bg-base-750'
            }`}
          >
            {isLast ? 'Get Started' : 'Next'} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
