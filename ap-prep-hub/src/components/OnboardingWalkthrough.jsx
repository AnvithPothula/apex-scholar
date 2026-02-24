import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, X, Brain, FileQuestion, Zap, Calculator, Calendar, Settings, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'apex.onboarding.completed';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to Apex Scholar!',
    description: 'Your AI-powered AP exam prep platform. Let\'s take a quick tour of the key features.',
    color: 'from-blue-500 to-purple-500'
  },
  {
    icon: Brain,
    title: 'AI Tutors',
    description: 'Chat with expert AI tutors for any AP subject. Choose modes like Explain, Practice MCQ, Walkthrough, or upload files for analysis.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileQuestion,
    title: 'Practice Tests',
    description: 'Generate full-length AP practice tests with real exam format, timed sections, and detailed scoring analysis.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Zap,
    title: 'Flashcards',
    description: 'AI-generated flashcards with spaced repetition to help you memorize key concepts efficiently.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Calculator,
    title: 'Problem Solver',
    description: 'Upload or type any problem — get step-by-step solutions with LaTeX-rendered math.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    description: 'AI creates an optimized study schedule based on your subjects, deadlines, and study preferences.',
    color: 'from-rose-500 to-red-500'
  },
  {
    icon: Settings,
    title: 'Personalize Your Experience',
    description: 'Head to Settings to select your AP subjects, customize your AI tutor\'s style, and set study preferences. You\'re all set — let\'s get that 5!',
    color: 'from-slate-500 to-slate-600'
  }
];

export default function OnboardingWalkthrough() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_KEY) === 'true') return;
    } catch {}
    // Show after a short delay to let the page render first
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch {}
    setVisible(false);
  }, []);

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className={`h-full bg-gradient-to-r ${current.color} transition-all duration-500`}
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header with skip */}
        <div className="flex justify-between items-center px-6 pt-4">
          <span className="text-xs text-slate-400">{step + 1} of {STEPS.length}</span>
          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs flex items-center gap-1"
          >
            Skip tour <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-4 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{current.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{current.description}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              step === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-blue-400 w-4' : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isLast
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            {isLast ? 'Get Started' : 'Next'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
