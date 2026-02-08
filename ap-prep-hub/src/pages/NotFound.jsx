import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Home, ArrowLeft, ChevronRight, Trophy, XCircle, CheckCircle2, Sparkles } from 'lucide-react';

// Each question has 4 choices — one correct funny answer, three distractors
const QUESTIONS = [
  {
    icon: "∫", subject: "AP Calculus",
    question: "What is the derivative of 404?",
    choices: ["404x³", "0 — just like this page", "undefined", "404!"],
    correct: 1,
  },
  {
    icon: "🦅", subject: "AP US History",
    question: "In APUSH, what happened on page 404 of the textbook?",
    choices: ["The Boston Tea Party", "It was ripped out by a student", "The Louisiana Purchase", "Nothing — nobody reads that far"],
    correct: 1,
  },
  {
    icon: "🧪", subject: "AP Chemistry",
    question: "Which element has atomic number 404?",
    choices: ["Unobtainium (Ub)", "Pagenotfoundium (Pn)", "Brokenlinkium (Bl)", "Errordium (Er)"],
    correct: 1,
  },
  {
    icon: "💻", subject: "AP Computer Science",
    question: "In Java, what exception does a 404 page throw?",
    choices: ["NullPointerException", "ArrayIndexOutOfBoundsException", "PageNotFoundError", "ClassNotFoundException"],
    correct: 2,
  },
  {
    icon: "🧠", subject: "AP Psychology",
    question: "What cognitive bias makes you think this page should exist?",
    choices: ["Confirmation bias", "The optimism delusion of URL typing", "Dunning-Kruger effect", "Anchoring bias"],
    correct: 1,
  },
  {
    icon: "⚛️", subject: "AP Physics",
    question: "Calculate the momentum of this missing page.",
    choices: ["p = mv = 404 kg·m/s", "p = mv = 0 × 0 = absolutely nothing", "p = ħk = undefined", "Insufficient data"],
    correct: 1,
  },
  {
    icon: "📚", subject: "AP English Literature",
    question: "The 404 error is best described as which literary device?",
    choices: ["Foreshadowing", "An ironic void where content should be", "Alliteration", "Onomatopoeia"],
    correct: 1,
  },
  {
    icon: "📊", subject: "AP Statistics",
    question: "What is P(this page existing)?",
    choices: ["0.5 — it either exists or it doesn't", "P = 0, CI: [0, 0]", "Approximately 0.04", "Cannot be determined"],
    correct: 1,
  },
  {
    icon: "🔬", subject: "AP Biology",
    question: "To which taxonomic kingdom does a 404 error belong?",
    choices: ["Animalia", "Fungi", "Erroraceae, phylum Brokenlinkia", "Protista"],
    correct: 2,
  },
  {
    icon: "📈", subject: "AP Economics",
    question: "What is the opportunity cost of this 404 error?",
    choices: ["$4.04", "The studying you could've been doing", "One college credit", "A marginal utility of zero"],
    correct: 1,
  },
  {
    icon: "🌍", subject: "AP World History",
    question: "Which ancient civilization first encountered a 404?",
    choices: ["The Romans: 'Page Not CDIV'", "The Egyptians: missing hieroglyphic scroll", "The Greeks: 'Aristotle's lost chapter'", "Nobody — they had no WiFi"],
    correct: 3,
  },
  {
    icon: "🇪🇸", subject: "AP Spanish",
    question: "How do you say '404 Page Not Found' in Spanish?",
    choices: ["Cuatro cero cuatro", "Página no encontrada — como mi motivación", "Error de la web", "No lo sé, I got a 2"],
    correct: 1,
  },
];

// Floating symbols
const SYMBOLS = ["∫", "∑", "π", "∞", "√", "Δ", "∇", "θ", "λ", "Ω", "φ", "ε", "∂", "≈", "±"];

function FloatingSymbol({ symbol }) {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    fontSize: `${12 + Math.random() * 14}px`,
    animationDelay: `${Math.random() * 20}s`,
    animationDuration: `${15 + Math.random() * 15}s`,
  }), []);

  return (
    <div className="floating-symbol absolute text-slate-700/20 font-mono pointer-events-none select-none" style={style}>
      {symbol}
    </div>
  );
}

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questionOrder] = useState(() => {
    const indices = QUESTIONS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const totalQuestions = Math.min(5, QUESTIONS.length);

  const currentQuestion = QUESTIONS[questionOrder[qIndex]];
  const questionNum = qIndex + 1;

  const handleSelect = (choiceIdx) => {
    if (answered) return;
    setSelected(choiceIdx);
    setAnswered(true);
    if (choiceIdx === currentQuestion.correct) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleNext = () => {
    if (questionNum >= totalQuestions) {
      setGameOver(true);
    } else {
      setQIndex(q => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setGameOver(false);
  };

  const getScoreMessage = () => {
    const pct = correctCount / totalQuestions;
    if (pct === 1) return { score: "5", msg: "Perfect score! Too bad this page still doesn't exist.", color: "text-green-400" };
    if (pct >= 0.8) return { score: "4", msg: "Impressive! You clearly study too much.", color: "text-blue-400" };
    if (pct >= 0.6) return { score: "3", msg: "Passing! Most colleges will accept this 404.", color: "text-yellow-400" };
    if (pct >= 0.4) return { score: "2", msg: "Not quite. Maybe study the 404 curriculum.", color: "text-orange-400" };
    return { score: "1", msg: "This page scored better than you.", color: "text-red-400" };
  };

  const choiceLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* CSS for floating animation */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        .floating-symbol { animation: floatUp linear infinite; }
      `}</style>

      {/* Floating background symbols */}
      {SYMBOLS.map((s, i) => <FloatingSymbol key={i} symbol={s} />)}

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Main card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          
          {/* Exam header */}
          <div className="bg-gradient-to-r from-slate-700/80 to-slate-700/40 px-5 py-3.5 border-b border-slate-600/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 tracking-wider uppercase block leading-tight">Apex Scholar</span>
                  <span className="text-[10px] text-slate-500">Advanced Placement 404 Exam</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono block">EXAM CODE</span>
                <span className="text-xs text-slate-400 font-mono font-bold">404-NF</span>
              </div>
            </div>
          </div>

          {/* Big 404 */}
          <div className="pt-6 pb-3 text-center relative">
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 leading-none select-none tracking-tight"
            >
              404
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-slate-500 text-xs mt-1.5 font-medium">
                Page not found — but here's a pop quiz
              </p>
              {location.pathname !== '/' && (
                <p className="text-slate-600 text-[10px] mt-1 font-mono truncate px-8">
                  {location.pathname}
                </p>
              )}
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!gameOver ? (
              <motion.div
                key={`q-${qIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="px-5 pb-5"
              >
                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1 bg-slate-700/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: `${((qIndex) / totalQuestions) * 100}%` }}
                      animate={{ width: `${((qIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{questionNum}/{totalQuestions}</span>
                </div>

                {/* Question */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{currentQuestion.icon}</span>
                    <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider">{currentQuestion.subject}</span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">{currentQuestion.question}</p>
                </div>

                {/* Choices */}
                <div className="space-y-2">
                  {currentQuestion.choices.map((choice, i) => {
                    const isCorrect = i === currentQuestion.correct;
                    const isSelected = i === selected;
                    let style = 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-700/40 hover:border-slate-600/60 text-slate-300';
                    let labelStyle = 'bg-slate-700/60 text-slate-400';

                    if (answered) {
                      if (isCorrect) {
                        style = 'border-green-500/50 bg-green-500/10 text-green-300';
                        labelStyle = 'bg-green-500/30 text-green-300';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-red-500/50 bg-red-500/10 text-red-300';
                        labelStyle = 'bg-red-500/30 text-red-300';
                      } else {
                        style = 'border-slate-700/30 bg-slate-900/20 text-slate-500';
                        labelStyle = 'bg-slate-700/30 text-slate-600';
                      }
                    }

                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={answered}
                        whileHover={!answered ? { scale: 1.01 } : {}}
                        whileTap={!answered ? { scale: 0.99 } : {}}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 text-left ${style} ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-200 ${labelStyle}`}>
                          {answered && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                           answered && isSelected && !isCorrect ? <XCircle className="w-3.5 h-3.5" /> :
                           choiceLabels[i]}
                        </span>
                        <span className="text-xs leading-relaxed">{choice}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next button */}
                <AnimatePresence>
                  {answered && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleNext}
                      className="mt-3 w-full py-2 px-4 bg-blue-600/90 hover:bg-blue-500 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {questionNum >= totalQuestions ? 'See Results' : 'Next Question'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Game over / results */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-5 pb-5"
              >
                {(() => {
                  const result = getScoreMessage();
                  return (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                        <Trophy className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="mb-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Your AP 404 Score</span>
                      </div>
                      <div className={`text-5xl font-black ${result.color} mb-2`}>{result.score}</div>
                      <p className="text-slate-400 text-sm mb-1">{correctCount}/{totalQuestions} correct</p>
                      <p className="text-slate-500 text-xs italic px-4">{result.msg}</p>

                      {/* Score bubbles */}
                      <div className="flex justify-center gap-1.5 mt-4 mb-4">
                        {Array.from({ length: totalQuestions }).map((_, i) => (
                          <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            i < correctCount
                              ? 'bg-green-500/20 border-green-500/50 text-green-400'
                              : 'bg-red-500/20 border-red-500/50 text-red-400'
                          }`}>
                            {i < correctCount ? '✓' : '✗'}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleRestart}
                        className="text-xs text-slate-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Retake exam
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="px-5 pb-5 flex gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-3 bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/40 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/AITutors')}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/20"
            >
              <Home className="w-3.5 h-3.5" />
              Back to Studying
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-[10px] mt-3 font-medium">
          There is no AP exam for finding missing pages. Yet.
        </p>
      </motion.div>
    </div>
  );
}
