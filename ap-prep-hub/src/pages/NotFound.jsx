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
    <div className="floating-symbol absolute text-base-800/20 font-mono pointer-events-none select-none" style={style}>
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
    if (pct === 1) return { score: "5", msg: "Perfect score! Too bad this page still doesn't exist.", color: "text-success-400" };
    if (pct >= 0.8) return { score: "4", msg: "Impressive! You clearly study too much.", color: "text-primary-400" };
    if (pct >= 0.6) return { score: "3", msg: "Passing! Most colleges will accept this 404.", color: "text-warning-400" };
    if (pct >= 0.4) return { score: "2", msg: "Not quite. Maybe study the 404 curriculum.", color: "text-accent-400" };
    return { score: "1", msg: "This page scored better than you.", color: "text-error-400" };
  };

  const choiceLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4 overflow-hidden relative">
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
        backgroundSize: '40px 40px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Main card */}
        <div className="bg-base-850 border border-border rounded-md shadow-floating overflow-hidden">
          
          {/* Exam header */}
          <div className="bg-base-800 px-5 py-3.5 border-b border-border-strong">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-900 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-xs font-bold text-content-secondary tracking-wider uppercase block leading-tight">Apex Scholar</span>
                  <span className="text-[10px] text-content-muted">Advanced Placement 404 Exam</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-content-muted font-mono block">EXAM CODE</span>
                <span className="text-xs text-content-muted font-mono font-bold">404-NF</span>
              </div>
            </div>
          </div>

          {/* Big 404 */}
          <div className="pt-6 pb-3 text-center relative">
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-content-primary via-content-muted to-base-800 leading-none select-none tracking-tight"
            >
              404
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-content-muted text-xs mt-1.5 font-medium">
                Page not found — but here's a pop quiz
              </p>
              {location.pathname !== '/' && (
                <p className="text-content-muted text-[10px] mt-1 font-mono truncate px-8">
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
                  <div className="flex-1 h-1 bg-base-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      initial={{ width: `${((qIndex) / totalQuestions) * 100}%` }}
                      animate={{ width: `${((qIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-content-muted font-mono whitespace-nowrap">{questionNum}/{totalQuestions}</span>
                </div>

                {/* Question */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{currentQuestion.icon}</span>
                    <span className="text-[10px] font-bold text-primary-400/80 uppercase tracking-wider">{currentQuestion.subject}</span>
                  </div>
                  <p className="text-content-primary text-sm font-medium leading-relaxed">{currentQuestion.question}</p>
                </div>

                {/* Choices */}
                <div className="space-y-2">
                  {currentQuestion.choices.map((choice, i) => {
                    const isCorrect = i === currentQuestion.correct;
                    const isSelected = i === selected;
                    let style = 'border-border bg-base-900/40 hover:bg-base-800/40 hover:border-border-strong text-content-secondary';
                    let labelStyle = 'bg-base-800 text-content-muted';

                    if (answered) {
                      if (isCorrect) {
                        style = 'border-success-500/50 bg-success-500/10 text-success-300';
                        labelStyle = 'bg-success-500/30 text-success-300';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-error-500/50 bg-error-500/10 text-error-300';
                        labelStyle = 'bg-error-500/30 text-error-300';
                      } else {
                        style = 'border-border/30 bg-base-900/20 text-content-muted';
                        labelStyle = 'bg-base-800/30 text-content-muted';
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
                      className="mt-3 w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 rounded-lg text-base-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {questionNum >= totalQuestions ? 'See Results' : 'Next Question'}
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
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
                      <div className="w-16 h-16 rounded-md bg-primary-900 border border-primary-500/30 flex items-center justify-center mx-auto mb-3">
                        <Trophy className="w-8 h-8 text-primary-400" strokeWidth={1.5} />
                      </div>
                      <div className="mb-1">
                        <span className="text-xs text-content-muted uppercase tracking-wider font-bold">Your AP 404 Score</span>
                      </div>
                      <div className={`text-5xl font-black ${result.color} mb-2`}>{result.score}</div>
                      <p className="text-content-muted text-sm mb-1">{correctCount}/{totalQuestions} correct</p>
                      <p className="text-content-muted text-xs italic px-4">{result.msg}</p>

                      {/* Score bubbles */}
                      <div className="flex justify-center gap-1.5 mt-4 mb-4">
                        {Array.from({ length: totalQuestions }).map((_, i) => (
                          <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            i < correctCount
                              ? 'bg-success-500/20 border-success-500/50 text-success-400'
                              : 'bg-error-500/20 border-error-500/50 text-error-400'
                          }`}>
                            {i < correctCount ? '✓' : '✗'}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleRestart}
                        className="text-xs text-content-muted hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" strokeWidth={1.5} />
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
              className="flex-1 py-2.5 px-3 bg-base-800/40 hover:bg-base-800/70 border border-border-strong rounded-sm text-content-muted hover:text-content-primary text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              Go Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/AITutors')}
              className="flex-1 py-2.5 px-3 bg-primary-500 hover:bg-primary-600 rounded-sm text-base-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-raised"
            >
              <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
              Back to Studying
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-content-muted text-[10px] mt-3 font-medium">
          There is no AP exam for finding missing pages. Yet.
        </p>
      </motion.div>
    </div>
  );
}
