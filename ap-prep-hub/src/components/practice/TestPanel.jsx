import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Flag, X, ChevronDown, ChevronUp, Clock, MoreVertical, Coffee, Settings, LogOut, Bookmark, MapPin } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import LaTeXRenderer from '../LaTeXRenderer';
import MarkdownRenderer from '../MarkdownRenderer';
import SourcePane, { hasSourceMaterial } from './SourcePane';
import FrqAnswerBox from './FrqAnswerBox';
import useSplitPane from '../../hooks/useSplitPane';
import { useConfirm } from '../../contexts/ConfirmContext';
import { wasSkipped } from '../../utils/whyWrong';

// Bluebook shows the clock as M:SS (no leading zero on minutes).
const formatTimeFromSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SECTION_TITLES = { mcq: 'Section I: Multiple Choice', frq: 'Section II: Free Response' };

const TYPE_LABELS = {
  frq: 'Free Response', saq: 'Short Answer', dbq: 'Document-Based Question', leq: 'Long Essay Question',
  synthesis: 'Synthesis Essay', 'rhetorical-analysis': 'Rhetorical Analysis', argumentative: 'Argumentative Essay',
  'poetry-analysis': 'Poetry Analysis', 'prose-analysis': 'Prose Analysis', 'open-question': 'Open Question',
  'long-frq': 'Long FRQ', 'short-frq': 'Short FRQ', 'calculator-frq': 'Calculator FRQ',
  'no-calculator-frq': 'No Calculator FRQ', 'short-answer': 'Short Answer', essays: 'Essay',
};

const optionText = (option) => {
  const raw = typeof option === 'string' ? option : option?.text ?? String(option ?? '');
  return raw.replace(/^[A-E]\)\s*/, '');
};

const letter = (i) => String.fromCharCode(65 + i);

/** The ABC-with-a-slash icon Bluebook uses for its answer eliminator. */
const CrossOutIcon = ({ on }) => (
  <span className={`relative inline-flex items-center justify-center w-10 h-8 rounded border-2 text-xs font-bold tracking-tight ${
    on ? 'border-[var(--bb-blue)] bg-[var(--bb-blue)] text-white' : 'border-[var(--bb-ink)] text-[var(--bb-ink)]'
  }`}>
    ABC
    <span aria-hidden="true" className={`absolute left-1 right-1 top-1/2 h-0.5 -rotate-[25deg] ${on ? 'bg-white' : 'bg-[var(--bb-ink)]'}`} />
  </span>
);

/**
 * The test-taking view, laid out like College Board's Bluebook app so a
 * practice test feels like exam day: white canvas, chrome header with the
 * section, timer and tools, a black-dashed rule, the question band (number
 * box, Mark for Review, answer eliminator), and a footer with the question
 * navigator and Back/Next. "Apex Scholar" sits bottom-left where Bluebook
 * shows the student's name.
 *
 * Covers the app's own header and tab bar (fixed, z-[70]) the way the exam
 * app owns the whole screen. Phase 2 tools (highlights, calculator, reference
 * sheets, line reader) are logged in the plan, not built.
 */
const TestPanel = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  testMarks = { marked: {}, crossed: {} },
  setTestMarks,
  handleAnswerSelect,
  answerImages = {},
  setQuestionImages,
  timeRemaining,
  testPaused,
  setTestPaused,
  selectedSubject,
  selectedSection,
  isMobile,
  showSettings,
  setShowSettings,
  autoSyncEnabled,
  setAutoSyncEnabled,
  forceMobile,
  setForceMobile,
  handlePreviousQuestion,
  handleNextQuestion,
  handleSubmitTest,
  resetTest,
  renderSafeValue,
}) => {
  const confirm = useConfirm();
  const { marked = {}, crossed = {} } = testMarks;
  const setMarked = (fn) => setTestMarks((t) => ({ ...t, marked: fn(t.marked || {}) }));
  const setCrossed = (fn) => setTestMarks((t) => ({ ...t, crossed: fn(t.crossed || {}) }));
  const [crossOutMode, setCrossOutMode] = useState(false);
  const [timerHidden, setTimerHidden] = useState(false);
  const [menu, setMenu] = useState(null); // 'directions' | 'more' | 'nav' | null
  const [reviewing, setReviewing] = useState(false);
  const settingsRef = useRef(null);
  useEffect(() => {
    const d = settingsRef.current;
    if (showSettings && d && !d.open && d.showModal) d.showModal();
  }, [showSettings]);
  const currentQuestion = questions?.[currentQuestionIndex];

  // Arrows move between questions and 1–4 pick an answer, but only while the
  // question is on screen: on Check Your Work or with a menu or dialog open,
  // they changed answers the student couldn't see.
  useEffect(() => {
    if (reviewing || menu || showSettings || testPaused) return undefined;
    const onKey = (e) => {
      const el = e.target;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      // Never hijack typing: arrows in an FRQ answer move the caret.
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
      else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
      else if (/^[1-4]$/.test(e.key) && currentQuestion?.type === 'mcq' && Number(e.key) <= (currentQuestion.options?.length || 0)) {
        handleAnswerSelect(currentQuestion.id, Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reviewing, menu, showSettings, testPaused, currentQuestionIndex, questions, currentQuestion, setCurrentQuestionIndex, handleAnswerSelect]);
  // Only split when there's source material; a lone question beside an empty
  // column looks broken. Bluebook centres single-column questions the same way.
  const splitLayout = hasSourceMaterial(currentQuestion);
  // Hooks must run unconditionally, so this is called whether or not the layout splits.
  const {
    pct: splitPct,
    dragging: splitDragging,
    containerRef: splitContainerRef,
    dividerProps,
  } = useSplitPane('apex_test_split_pct', 50);
  // The test covers the app's header and tab bar; make them inert too, so Tab
  // can't wander into navigation the student can't see.
  const showingTest = Boolean(currentQuestion);
  useEffect(() => {
    if (!showingTest) return undefined;
    const hidden = [...document.querySelectorAll('header, nav, a[href="#main-content"]')].filter((e) => !e.closest('.bluebook'));
    hidden.forEach((e) => e.setAttribute('inert', ''));
    return () => hidden.forEach((e) => e.removeAttribute('inert'));
  }, [showingTest]);

  if (!questions || questions.length === 0 || !currentQuestion) {
    const none = !questions || questions.length === 0;
    return (
      <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          {none
            ? <X strokeWidth={1.5} className="w-16 h-16 text-error-400 mx-auto mb-4" />
            : <Flag strokeWidth={1.5} className="w-16 h-16 text-warning-400 mx-auto mb-4" />}
          <h2 className="text-2xl font-bold text-content-primary mb-4">{none ? 'No Questions Available' : 'Question Not Found'}</h2>
          <p className="text-lg text-content-secondary mb-6">
            {none
              ? 'There was an issue generating questions for this test.'
              : `Question ${currentQuestionIndex + 1} of ${questions.length} could not be loaded.`}
          </p>
          <div className="flex gap-4 justify-center">
            {!none && <Button onClick={() => setCurrentQuestionIndex(0)} variant="outline">Go to First Question</Button>}
            <Button onClick={resetTest}>
              <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
              {none ? 'Try Again' : 'Restart Test'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const qid = currentQuestion.id;
  const isMcq = currentQuestion.type === 'mcq' && Array.isArray(currentQuestion.options);
  const isAnswered = (q) => {
    const v = userAnswers[q.id];
    return (v !== undefined && v !== null && v !== '') || (answerImages[q.id] || []).length > 0;
  };
  const crossedHere = crossed[qid] || [];
  const isLast = currentQuestionIndex === questions.length - 1;
  // A full test spans both sections; label by the question on screen (it read "FULL").
  const sectionTitle = SECTION_TITLES[selectedSection === 'full' ? (currentQuestion?.type === 'mcq' ? 'mcq' : 'frq') : selectedSection]
    || String(selectedSection || '').toUpperCase();
  const lowTime = timeRemaining < 300;

  const toggleCross = (i) => {
    const on = crossedHere.includes(i);
    setCrossed((c) => ({ ...c, [qid]: on ? crossedHere.filter((x) => x !== i) : [...crossedHere, i] }));
    // Eliminating the chosen answer clears it, as in Bluebook.
    if (!on && userAnswers[qid] === i) handleAnswerSelect(qid, undefined);
  };
  const choose = (i) => {
    if (crossedHere.includes(i)) setCrossed((c) => ({ ...c, [qid]: crossedHere.filter((x) => x !== i) }));
    handleAnswerSelect(qid, i);
  };
  const goTo = (i) => { setReviewing(false); setMenu(null); setCurrentQuestionIndex(i); };
  const submit = async () => {
    // Say how many are blank (4 of 6 were, unmentioned). Photos count as answers.
    const blank = (questions || []).filter((q) => wasSkipped(userAnswers[q.id]) && !answerImages[q.id]?.length).length;
    const message = `${blank ? `${blank} of ${questions.length} questions ${blank === 1 ? 'is' : 'are'} unanswered. ` : ''}You won't be able to change your answers after this.`;
    if (await confirm({ title: 'Submit test?', message, confirmText: 'Submit', destructive: false, theme: 'light' })) {
      handleSubmitTest();
    }
  };
  const exit = async () => {
    setMenu(null);
    if (await confirm({ title: 'Exit the test?', message: 'Your answers on this test will be lost.', confirmText: 'Exit', theme: 'light' })) resetTest();
  };

  const pill = 'h-8 sm:h-9 px-3.5 sm:px-5 rounded-full text-sm sm:text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bb-blue)]';
  const bluePill = `${pill} bg-[var(--bb-blue)] text-white hover:brightness-110`;

  /* The question grid, shared by the footer pop-up and the Check Your Work page. */
  const questionGrid = (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 py-2 border-y border-[#d0d0d0] text-sm">
        <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" strokeWidth={2} />Current</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-3.5 border border-dashed border-[var(--bb-ink)]" />Unanswered</span>
        <span className="inline-flex items-center gap-1.5"><Bookmark className="w-4 h-4 fill-[var(--bb-red)] text-[var(--bb-red)]" strokeWidth={2} />For Review</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-4 justify-center pt-5 pb-2" role="list">
        {questions.map((q, i) => {
          const answered = isAnswered(q);
          const current = i === currentQuestionIndex && !reviewing;
          return (
            <div key={q.id ?? i} role="listitem" className="relative">
              {current && <MapPin aria-hidden="true" className="absolute -top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5" strokeWidth={2.5} />}
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Question ${i + 1}${answered ? ', answered' : ', unanswered'}${marked[q.id] ? ', marked for review' : ''}${current ? ', current' : ''}`}
                className={`w-8 h-8 text-base font-bold flex items-center justify-center ${current ? 'underline underline-offset-2' : ''} ${
                  answered ? 'bg-[var(--bb-blue)] text-white' : 'border border-dashed border-[var(--bb-ink)] text-[var(--bb-blue)] bg-white'
                }`}
              >
                {i + 1}
              </button>
              {marked[q.id] && <Bookmark aria-hidden="true" className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 fill-[var(--bb-red)] text-[var(--bb-red)]" strokeWidth={2} />}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div data-theme="light" className="bluebook fixed inset-0 z-[70] flex flex-col">
      {/* Settings (from the More menu) */}
      {showSettings && (
        // Native modal <dialog>: traps focus, closes on Escape, page behind is inert.
        <dialog
          ref={settingsRef}
          aria-label="Settings"
          onCancel={(e) => { e.preventDefault(); setShowSettings(false); }}
          className="bg-transparent p-4 w-full max-w-md backdrop:bg-black/50 text-[var(--bb-ink)]"
        >
          <div className="bg-white rounded-lg border border-[#d0d0d0] w-full shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-[#d0d0d0]">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button type="button" onClick={() => setShowSettings(false)} aria-label="Close settings"><X strokeWidth={1.5} className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5 text-sm">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={autoSyncEnabled} onChange={(e) => setAutoSyncEnabled(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[var(--bb-blue)]" />
                <span><span className="font-medium">Auto-save progress</span><br /><span className="text-[#555]">Save your test so you can resume it later.</span></span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={forceMobile} onChange={(e) => setForceMobile(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[var(--bb-blue)]" />
                <span><span className="font-medium">Force mobile layout</span><br /><span className="text-[#555]">Override automatic mobile detection.</span></span>
              </label>
            </div>
            <div className="p-5 border-t border-[#d0d0d0] flex justify-end">
              <button type="button" onClick={() => setShowSettings(false)} className={bluePill}>Done</button>
            </div>
          </div>
        </dialog>
      )}

      {/* Click-away layer for open pop-ups */}
      {menu && <button type="button" aria-label="Close menu" tabIndex={-1} className="fixed inset-0 z-[71] cursor-default" onClick={() => setMenu(null)} />}

      {/* Header */}
      <header className="shrink-0 bg-[var(--bb-chrome)] relative z-[72]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 min-h-[60px]">
          <div className="min-w-0 relative">
            <h1 className="text-sm sm:text-lg font-bold truncate" title={`${selectedSubject}: ${sectionTitle}`}>
              <span className="hidden md:inline">{selectedSubject}: </span>
              <span className="sm:hidden">{sectionTitle.split(':')[0]}</span>
              <span className="hidden sm:inline">{sectionTitle}</span>
            </h1>
            <button type="button" onClick={() => setMenu(menu === 'directions' ? null : 'directions')} aria-expanded={menu === 'directions'}
              className="inline-flex items-center gap-0.5 text-sm font-medium mt-0.5 hover:underline">
              Directions {menu === 'directions' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {menu === 'directions' && (
              <div className="absolute left-0 top-full mt-3 w-[min(92vw,640px)] bg-white rounded-lg shadow-2xl border border-[#d0d0d0] p-5 sm:p-6 text-[15px] leading-relaxed">
                <div className="bb-serif space-y-3">
                  {isMcq || selectedSection === 'mcq' ? (
                    <p>Each of the questions or incomplete statements below is followed by four suggested answers or completions. Select the one that is best in each case.</p>
                  ) : (
                    <p>Read each question carefully and write your response in the space provided. Answer every part of the question, and support your answer with specific evidence.</p>
                  )}
                  <p>You can go back to any question in this section before you submit. Use Mark for Review to flag questions you want to check again.</p>
                </div>
                <div className="flex justify-end mt-5">
                  <button type="button" onClick={() => setMenu(null)} className={`${pill} bg-[#fedb00] text-[var(--bb-ink)] hover:brightness-95`}>Close</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            {timerHidden ? (
              <Clock aria-label="Timer hidden" className="w-6 h-6 my-0.5" strokeWidth={2} />
            ) : (
              <span role="timer" aria-live="off" className={`text-lg sm:text-xl font-bold tabular-nums ${lowTime ? 'text-[var(--bb-red)]' : ''}`}>
                {formatTimeFromSeconds(timeRemaining)}
              </span>
            )}
            <button type="button" onClick={() => setTimerHidden((h) => !h)}
              className="mt-0.5 px-3 h-6 rounded-full border border-[var(--bb-ink)] text-xs font-semibold hover:bg-white">
              {timerHidden ? 'Show' : 'Hide'}
            </button>
          </div>

          <div className="flex justify-end relative">
            <button type="button" onClick={() => setMenu(menu === 'more' ? null : 'more')} aria-expanded={menu === 'more'} aria-haspopup="menu" aria-label="More"
              className="flex flex-col items-center px-2 py-1 text-xs font-medium">
              <MoreVertical className="w-5 h-5" strokeWidth={2} />
              <span className={menu === 'more' ? 'underline underline-offset-4 decoration-2' : ''}>More</span>
            </button>
            {menu === 'more' && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-2xl border border-[#d0d0d0] py-2 text-[15px]">
                <button role="menuitem" type="button" onClick={() => { setMenu(null); setTestPaused(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bb-band)]">
                  <Coffee className="w-5 h-5" strokeWidth={1.75} />Unscheduled Break
                </button>
                <button role="menuitem" type="button" onClick={() => { setMenu(null); setShowSettings(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bb-band)]">
                  <Settings className="w-5 h-5" strokeWidth={1.75} />Settings
                </button>
                <button role="menuitem" type="button" onClick={exit} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bb-band)]">
                  <LogOut className="w-5 h-5" strokeWidth={1.75} />Exit the Test
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="bb-dash" />
      </header>

      {/* Body */}
      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden bg-white">
        {testPaused ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Coffee className="w-12 h-12 mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold mb-2">You're on a break</h2>
            <p className="text-[#555] mb-6 max-w-sm">The timer is paused. On the real exam it keeps running during an unscheduled break.</p>
            <button type="button" onClick={() => setTestPaused(false)} className={bluePill}>Resume Testing</button>
          </div>
        ) : reviewing ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:h-full lg:overflow-y-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">Check Your Work</h2>
            <p className="text-center mt-3 text-[15px] text-[#333]">
              On test day, you won't be able to move on to the next section until time expires. For this practice test,
              select <strong>Submit</strong> when you're ready.
            </p>
            <div className="mt-6 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.15)] p-5 sm:p-6">
              <h3 className="text-lg font-bold mb-3">{sectionTitle} Questions</h3>
              {questionGrid}
            </div>
          </div>
        ) : (
          <div
            key={currentQuestionIndex}
            ref={splitLayout ? splitContainerRef : undefined}
            className={splitLayout ? 'lg:flex lg:h-full' : 'lg:h-full lg:overflow-y-auto'}
          >
            {splitLayout && (
              <div className="bb-serif px-4 sm:px-8 py-6 lg:overflow-y-auto lg:h-full text-[17px] leading-relaxed"
                style={isMobile ? undefined : { flexBasis: `${splitPct}%`, flexGrow: 0, flexShrink: 0 }}>
                <SourcePane currentQuestion={currentQuestion} />
              </div>
            )}

            {/* Bluebook's divider: a solid black rule with a grab handle. Desktop only. */}
            {splitLayout && (
              <div {...dividerProps} title="Drag to resize · double-click to reset"
                className="hidden lg:flex relative shrink-0 w-[3px] bg-[var(--bb-ink)] cursor-col-resize items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bb-blue)]">
                <span className={`absolute w-4 h-9 rounded-md border-2 border-[var(--bb-ink)] ${splitDragging ? 'bg-[var(--bb-band)]' : 'bg-white'}`} />
              </div>
            )}
            {splitLayout && <div className="lg:hidden bb-dash mx-4" />}

            {/* Question + answers */}
            <div className={`px-4 sm:px-8 py-6 ${splitLayout ? 'lg:flex-1 lg:min-w-0 lg:overflow-y-auto lg:h-full' : 'max-w-3xl mx-auto'}`}>
              <div className="flex items-stretch bg-[var(--bb-band)]">
                <span className="bg-[var(--bb-ink)] text-white font-bold text-lg min-w-[2.25rem] flex items-center justify-center">
                  {currentQuestionIndex + 1}
                </span>
                <button type="button" onClick={() => setMarked((m) => ({ ...m, [qid]: !m[qid] }))} aria-pressed={!!marked[qid]}
                  className="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium hover:underline">
                  <Bookmark className={`w-5 h-5 ${marked[qid] ? 'fill-[var(--bb-red)] text-[var(--bb-red)]' : ''}`} strokeWidth={2} />
                  Mark for Review
                </button>
                {isMcq && (
                  <button type="button" onClick={() => setCrossOutMode((v) => !v)} aria-pressed={crossOutMode}
                    aria-label="Answer eliminator: cross out choices" title="Cross out answer choices"
                    className="ml-auto mr-2 my-1">
                    <CrossOutIcon on={crossOutMode} />
                  </button>
                )}
              </div>
              <div className="bb-dash mb-5" />

              {/* Keep the stem's line breaks; a stem with a code block (CS) goes
                  through the markdown renderer, which lays the program out. */}
              <div className="bb-serif text-[17px] leading-relaxed whitespace-pre-line">
                {/```/.test(currentQuestion.question || '')
                  ? <div className="whitespace-normal"><MarkdownRenderer content={currentQuestion.question} /></div>
                  : <LaTeXRenderer content={currentQuestion.question || ''} />}
              </div>

              {currentQuestion.worksList?.length > 0 && (
                <div className="bb-serif mt-4 text-[15px]">
                  <p className="font-semibold mb-2">Suggested works:</p>
                  <ul className="list-disc pl-6 space-y-0.5">{currentQuestion.worksList.map((w, i) => <li key={i}>{w}</li>)}</ul>
                  <p className="mt-2 italic">Or another work of comparable literary merit.</p>
                </div>
              )}

              {currentQuestion.promptOptions?.length > 0 && (
                <div className="bb-serif mt-4 space-y-3 text-[15px]">
                  <p className="font-semibold">Choose ONE of the following prompts:</p>
                  {currentQuestion.promptOptions.map((p, i) => (
                    <div key={i} className="border-l-4 border-[var(--bb-ink)] pl-3"><strong>Prompt {i + 1}.</strong> {p}</div>
                  ))}
                </div>
              )}

              {currentQuestion.parts?.length > 0 && (
                <ol className="bb-serif mt-4 space-y-3 text-[16px]">
                  {currentQuestion.parts.map((part, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold shrink-0">({letter(i).toLowerCase()})</span>
                      <div className="flex-1 min-w-0"><LaTeXRenderer content={part} /></div>
                    </li>
                  ))}
                </ol>
              )}

              {isMcq && (
                <div role="radiogroup" aria-label={`Answer choices for question ${currentQuestionIndex + 1}`} className="mt-6 space-y-3">
                  {currentQuestion.options.map((option, i) => {
                    const selected = userAnswers[qid] === i;
                    const out = crossedHere.includes(i);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`Answer ${letter(i)}${out ? ', crossed out' : ''}`}
                          onClick={() => choose(i)}
                          className={`relative flex-1 min-w-0 text-left flex items-start gap-3 rounded-lg px-3 py-2.5 bg-white transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bb-blue)] focus-visible:ring-offset-1 ${
                            selected ? 'border-[3px] border-[var(--bb-blue)] -m-px' : 'border border-[var(--bb-ink)] hover:shadow-[0_0_0_1px_var(--bb-ink)]'
                          } ${out ? 'opacity-50' : ''}`}
                        >
                          <span className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                            selected ? 'bg-[var(--bb-blue)] border-[var(--bb-blue)] text-white' : 'border-[var(--bb-ink)]'
                          }`}>{letter(i)}</span>
                          <span className="bb-serif flex-1 min-w-0 pt-0.5 text-[16px] leading-relaxed">
                            <LaTeXRenderer content={optionText(option)} />
                          </span>
                          {out && <span aria-hidden="true" className="absolute -left-1 -right-1 top-1/2 h-0.5 bg-[var(--bb-ink)]" />}
                        </button>
                        {crossOutMode && (
                          out ? (
                            <button type="button" onClick={() => toggleCross(i)} className="w-11 text-sm font-semibold underline">Undo</button>
                          ) : (
                            <button type="button" onClick={() => toggleCross(i)} aria-label={`Cross out answer ${letter(i)}`}
                              className="w-11 flex justify-center">
                              <span className="relative w-6 h-6 rounded-full border-2 border-[var(--bb-ink)] text-xs font-bold flex items-center justify-center">
                                {letter(i)}
                                <span className="absolute -left-1 -right-1 top-1/2 h-0.5 bg-[var(--bb-ink)]" />
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isMcq && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-semibold">{TYPE_LABELS[currentQuestion.type] || 'Written Response'}</span>
                    {currentQuestion.timeframe && <span className="text-[#555]">Suggested time: {currentQuestion.timeframe}</span>}
                  </div>
                  <FrqAnswerBox
                    key={qid}
                    value={renderSafeValue(userAnswers[qid])}
                    onChange={(text) => handleAnswerSelect(qid, text)}
                    images={answerImages[qid] || []}
                    onImagesChange={(imgs) => setQuestionImages?.(qid, imgs)}
                    ariaLabel={`Response to question ${currentQuestionIndex + 1}`}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="shrink-0 bg-[var(--bb-chrome)] relative z-[72]">
        <div className="bb-dash" />
        <div className="flex sm:grid sm:grid-cols-[1fr_auto_1fr] items-center justify-between gap-2 px-3 sm:px-6 h-[60px]">
          <span className="font-bold text-sm sm:text-base whitespace-nowrap">Apex Scholar</span>

          <div className="relative flex justify-center">
            {!reviewing && !testPaused && (
              <button type="button" onClick={() => setMenu(menu === 'nav' ? null : 'nav')} aria-expanded={menu === 'nav'}
                className="inline-flex items-center gap-1 h-8 px-3 sm:px-4 rounded-md bg-[var(--bb-ink)] text-white text-sm font-semibold whitespace-nowrap">
                <span className="hidden sm:inline">Question&nbsp;</span>{currentQuestionIndex + 1} of {questions.length}
                {menu === 'nav' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            )}
            {menu === 'nav' && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto bottom-[68px] sm:bottom-full sm:mb-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[560px] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.25)] p-5">
                <div className="flex items-center justify-center relative mb-3">
                  <h3 className="px-8 text-base sm:text-lg font-bold text-center">{sectionTitle} Questions</h3>
                  <button type="button" onClick={() => setMenu(null)} aria-label="Close question list" className="absolute right-0"><X className="w-5 h-5" /></button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto">{questionGrid}</div>
                <div className="flex justify-center mt-4">
                  <button type="button" onClick={() => { setMenu(null); setReviewing(true); }}
                    className={`${pill} border-2 border-[var(--bb-blue)] text-[var(--bb-blue)] hover:bg-[var(--bb-chrome)]`}>
                    Go to Review Page
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {testPaused ? null : reviewing ? (
              <>
                <button type="button" onClick={() => setReviewing(false)} className={bluePill}>Back</button>
                <button type="button" onClick={submit} className={bluePill}>Submit</button>
              </>
            ) : (
              <>
                {currentQuestionIndex > 0 && <button type="button" onClick={handlePreviousQuestion} className={bluePill}>Back</button>}
                <button type="button" onClick={isLast ? () => setReviewing(true) : handleNextQuestion} className={bluePill}>Next</button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestPanel;
