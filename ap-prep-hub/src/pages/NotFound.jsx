import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Home, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';

// AP-themed wrong answers for the 404
const WRONG_ANSWERS = [
  { question: "What is the derivative of 404?", answer: "0. Just like this page.", icon: "∫" },
  { question: "In APUSH, what happened on page 404?", answer: "Nothing. It was ripped out.", icon: "🦅" },
  { question: "Which element has atomic number 404?", answer: "Pagenotfoundium (Pn). Highly unstable.", icon: "🧪" },
  { question: "In AP CSA, what does HTTP 404 mean?", answer: "The server ghosted your request.", icon: "💻" },
  { question: "AP Psychology, what causes a 404?", answer: "Digital separation anxiety.", icon: "🧠" },
  { question: "AP Physics, calculate the momentum of this page.", answer: "p = mv = 0 × 0 = absolutely nothing.", icon: "⚛️" },
  { question: "AP English, analyze the symbolism of 404.", answer: "It represents the futility of clicking unknown links.", icon: "📚" },
  { question: "AP Stats, what's the probability this page exists?", answer: "P(page) = 0. Confidence interval: [0, 0].", icon: "📊" },
  { question: "AP Bio, what kingdom does a 404 belong to?", answer: "Erroraceae. Phylum: Brokenlinkia.", icon: "🔬" },
  { question: "AP Econ, what's the opportunity cost of this 404?", answer: "The studying you could've been doing.", icon: "📈" },
];

// Floating formula particles
const FORMULAS = [
  "E=mc²", "∫f(x)dx", "F=ma", "ΔG=ΔH-TΔS", "PV=nRT",
  "a²+b²=c²", "∑F=0", "λ=h/p", "pH=-log[H⁺]", "V=IR",
  "dy/dx", "∇×E", "σ=F/A", "μ=Σx/n", "lim x→∞",
];

function FloatingFormula({ formula, index }) {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 8;
  const randomDuration = 12 + Math.random() * 10;
  const randomSize = 10 + Math.random() * 8;

  return (
    <motion.div
      className="absolute text-slate-700/30 font-mono pointer-events-none select-none"
      style={{ fontSize: randomSize, left: `${randomX}%` }}
      initial={{ y: '110vh', opacity: 0, rotate: -15 + Math.random() * 30 }}
      animate={{
        y: '-10vh',
        opacity: [0, 0.4, 0.4, 0],
        rotate: -15 + Math.random() * 30,
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {formula}
    </motion.div>
  );
}

export default function NotFound() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(() => Math.floor(Math.random() * WRONG_ANSWERS.length));
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [bubbleScore, setBubbleScore] = useState([false, false, false, false, false]);
  const [shakeKey, setShakeKey] = useState(0);

  const qa = WRONG_ANSWERS[currentQ];

  const nextQuestion = useCallback(() => {
    setShowAnswer(false);
    let next;
    do { next = Math.floor(Math.random() * WRONG_ANSWERS.length); } while (next === currentQ && WRONG_ANSWERS.length > 1);
    setCurrentQ(next);
  }, [currentQ]);

  // Bubble sheet fill animation
  useEffect(() => {
    if (score > 0) {
      const idx = Math.min(score - 1, 4);
      setBubbleScore(prev => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
    }
  }, [score]);

  const handleReveal = () => {
    setShowAnswer(true);
    setScore(s => s + 1);
    setShakeKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating formula background */}
      {FORMULAS.map((f, i) => (
        <FloatingFormula key={i} formula={f} index={i} />
      ))}

      {/* Scantron-style decorative border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full"
      >
        {/* The "exam paper" card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header — like an exam header */}
          <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">Apex Scholar</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">EXAM: 404-NOT-FOUND</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">Section II: Free Response (Navigation)</span>
              <span className="text-xs text-slate-500">Time: ∞ minutes</span>
            </div>
          </div>

          {/* Score — bubble sheet style */}
          <div className="px-6 pt-4 flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">SCORE:</span>
            {bubbleScore.map((filled, i) => (
              <motion.div
                key={i}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                  filled
                    ? 'bg-red-500/80 border-red-400 text-white'
                    : 'border-slate-600 text-slate-600'
                }`}
                animate={filled ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {filled ? '✗' : String.fromCharCode(65 + i)}
              </motion.div>
            ))}
            {score > 5 && (
              <span className="text-xs text-red-400 ml-2">+{score - 5} more wrong</span>
            )}
          </div>

          {/* Big 404 */}
          <div className="px-6 pt-6 pb-2 text-center">
            <motion.div
              key={shakeKey}
              animate={shakeKey > 0 ? { x: [0, -8, 8, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-300 to-slate-600 leading-none select-none">
                404
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 mt-2 text-sm"
            >
              This page scored a 1 on the AP exam.
            </motion.p>
          </div>

          {/* Question card */}
          <div className="px-6 py-4">
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{qa.icon}</span>
                <div className="min-w-0">
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">{qa.question}</p>
                  <AnimatePresence mode="wait">
                    {showAnswer ? (
                      <motion.p
                        key="answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-blue-400 text-sm mt-2 italic"
                      >
                        {qa.answer}
                      </motion.p>
                    ) : (
                      <motion.button
                        key="reveal"
                        onClick={handleReveal}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors group"
                      >
                        <Sparkles className="w-3 h-3 group-hover:text-blue-400" />
                        Reveal Answer
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {showAnswer && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={nextQuestion}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Next wrong answer
              </motion.button>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Home className="w-4 h-4" />
              Study Instead
            </motion.button>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-slate-600 text-xs mt-4">
          Pro tip: There's no AP exam for finding missing pages.
        </p>
      </motion.div>
    </div>
  );
}
