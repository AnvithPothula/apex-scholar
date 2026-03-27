import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCw, Flag, X, CheckCircle, Clock, ArrowLeft, Settings, ArrowRight } from 'lucide-react';
import { Button, Card, Badge } from '../ui/UIComponents';
import LaTeXRenderer from '../LaTeXRenderer';

const formatTimeFromSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TestPanel = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  handleAnswerSelect,
  timeRemaining,
  testPaused,
  setTestPaused,
  selectedSubject,
  selectedSection,
  selectedDBQDocument,
  setSelectedDBQDocument,
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
  const currentQuestion = questions[currentQuestionIndex];

  // Show error if no questions are available
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <X strokeWidth={1.5} className="w-16 h-16 text-error-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-content-primary mb-4">No Questions Available</h2>
          <p className="text-lg text-content-secondary mb-6">
            There was an issue generating questions for this test.
          </p>
          <Button onClick={resetTest}>
            <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Show error if current question is not available
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Flag strokeWidth={1.5} className="w-16 h-16 text-warning-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-content-primary mb-4">Question Not Found</h2>
          <p className="text-lg text-content-secondary mb-6">
            Question {currentQuestionIndex + 1} of {questions.length} could not be loaded.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setCurrentQuestionIndex(0)}
              variant="outline"
            >
              Go to First Question
            </Button>
            <Button onClick={resetTest}>
              <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
              Restart Test
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className={`bg-base-850 rounded-lg border border-border ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'}`}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-content-primary">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-content-muted hover:text-content-primary transition-colors"
              >
                <X strokeWidth={1.5} className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Auto-save Settings */}
              <div>
                <h4 className="text-sm font-medium text-content-primary mb-3">Auto-save</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setAutoSyncEnabled(newValue);
                      }}
                      className="w-4 h-4 rounded border-border-strong bg-base-800 text-content-primary focus:ring-content-muted focus:ring-2"
                    />
                    <span className="text-sm text-content-secondary">Auto-save progress</span>
                  </label>
                  <p className="text-xs text-content-muted ml-7">
                    Automatically save your test progress and settings so you can resume later
                  </p>
                </div>
              </div>

              {/* Mobile Settings */}
              <div>
                <h4 className="text-sm font-medium text-content-primary mb-3">Mobile Experience</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isMobile}
                      onChange={(e) => setForceMobile(e.target.checked)}
                      className="w-4 h-4 rounded border-border-strong bg-base-800 text-content-primary focus:ring-content-muted focus:ring-2"
                    />
                    <span className="text-sm text-content-secondary">Force mobile layout</span>
                  </label>
                  <p className="text-xs text-content-muted ml-7">
                    Override automatic mobile detection
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-content-primary hover:opacity-90 text-base-950 py-2 px-4 rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Header */}
      <div className="bg-base-850 border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-content-primary truncate">
                {selectedSubject} - {selectedSection.toUpperCase()}
              </h1>
              <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                <span className="hidden sm:inline">Question </span>{currentQuestionIndex + 1} / {questions.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-content-secondary">
                <Clock strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className={`font-mono text-sm sm:text-lg ${timeRemaining < 300 ? 'text-error-400' : ''}`}>
                  {formatTimeFromSeconds(timeRemaining)}
                </span>
              </div>

              <Button
                variant="ghost"
                onClick={() => setTestPaused(!testPaused)}
                className="text-content-secondary"
              >
                {testPaused ? <Play strokeWidth={1.5} className="w-5 h-5" /> : <Pause strokeWidth={1.5} className="w-5 h-5" />}
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
                    handleSubmitTest();
                  }
                }}
              >
                Submit Test
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-base-800 rounded-full h-2">
            <div
              className="bg-content-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            ></div>
          </div>

          {/* Answered Questions Indicator */}
          <div className="flex items-center justify-between mt-2 text-sm text-content-muted">
            <span>
              {Object.keys(userAnswers).length} answered • {questions.length - Object.keys(userAnswers).length} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 ${isMobile ? 'min-h-screen' : ''}`}>
        {testPaused ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Pause strokeWidth={1.5} className="w-16 h-16 text-warning-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-content-primary mb-2">Test Paused</h2>
            <p className="text-content-muted mb-6">Click the play button to resume your test</p>
            <Button
              onClick={() => setTestPaused(false)}
              className="bg-success-500 hover:bg-success-500"
            >
              <Play strokeWidth={1.5} className="w-5 h-5 mr-2" />
              Resume Test
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              {/* Question */}
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-base-750 rounded-lg text-content-primary font-bold text-lg min-w-[3rem] text-center">
                    {currentQuestionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary">
                        {currentQuestion?.topic || 'AP Content'}
                      </Badge>
                      <Badge variant={currentQuestion?.type === 'mcq' ? 'primary' : 'purple'}>
                        {currentQuestion?.type === 'mcq' ? 'Multiple Choice' :
                         currentQuestion?.type === 'frq' ? 'Free Response' :
                         currentQuestion?.type === 'saq' ? 'Short Answer' :
                         currentQuestion?.type === 'dbq' ? 'Document-Based Question' :
                         currentQuestion?.type === 'leq' ? 'Long Essay Question' :
                         currentQuestion?.type === 'synthesis' ? 'Synthesis Essay' :
                         currentQuestion?.type === 'rhetorical-analysis' ? 'Rhetorical Analysis' :
                         currentQuestion?.type === 'argumentative' ? 'Argumentative Essay' :
                         currentQuestion?.type === 'poetry-analysis' ? 'Poetry Analysis' :
                         currentQuestion?.type === 'prose-analysis' ? 'Prose Analysis' :
                         currentQuestion?.type === 'open-question' ? 'Open Question' :
                         currentQuestion?.type === 'long-frq' ? 'Long FRQ' :
                         currentQuestion?.type === 'short-frq' ? 'Short FRQ' :
                         currentQuestion?.type === 'calculator-frq' ? 'Calculator FRQ' :
                         currentQuestion?.type === 'no-calculator-frq' ? 'No Calculator FRQ' :
                         currentQuestion?.type === 'short-answer' ? 'Short Answer' :
                         currentQuestion?.type === 'essays' ? 'Essay' :
                         'Written Response'}
                      </Badge>
                    </div>
                    <div className="text-lg text-content-primary leading-relaxed">
                      <LaTeXRenderer content={currentQuestion?.question || ''} />
                    </div>

                    {/* Display sources for Synthesis questions */}
                    {currentQuestion?.sources && currentQuestion.sources.length > 0 && (
                      <div className="mt-6 p-6 bg-base-800 rounded-lg">
                        <h4 className="font-medium text-content-secondary mb-4 text-xl">Sources:</h4>
                        <div className="space-y-6">
                          {currentQuestion.sources.map((source, index) => (
                            <div key={index} className="border-l-4 border-success-500 pl-4">
                              <div className="mb-2">
                                <span className="font-bold text-success-400">Source {String.fromCharCode(65 + index)}</span>
                                {source.title && (
                                  <div className="text-sm text-content-secondary mt-1 font-medium">
                                    {source.title}
                                  </div>
                                )}
                                {source.source && (
                                  <div className="text-sm text-content-muted mt-1">
                                    Source: {source.source}
                                  </div>
                                )}
                                {source.type && (
                                  <div className="text-sm text-content-muted">
                                    Type: {source.type}
                                  </div>
                                )}
                              </div>
                              <div className="text-content-secondary leading-relaxed bg-base-850/50 p-4 rounded">
                                {source.content || source.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display passage for rhetorical analysis, poetry, or prose questions */}
                    {currentQuestion?.passage && (
                      <div className="mt-6 p-6 bg-base-800 rounded-lg">
                        <h4 className="font-medium text-content-secondary mb-4 text-xl">
                          {currentQuestion.type === 'poetry-analysis' ? 'Poem:' :
                           currentQuestion.type === 'prose-analysis' ? 'Passage:' :
                           currentQuestion.type === 'rhetorical-analysis' ? 'Text:' :
                           'Reading:'}
                        </h4>
                        {currentQuestion.passageInfo && (
                          <div className="mb-4 text-sm text-content-muted">
                            {currentQuestion.passageInfo}
                          </div>
                        )}
                        <div className="text-content-secondary leading-relaxed bg-base-850/50 p-4 rounded font-serif">
                          <pre className="whitespace-pre-wrap font-serif">
                            {currentQuestion.passage}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Display work list for open questions */}
                    {currentQuestion?.worksList && currentQuestion.worksList.length > 0 && (
                      <div className="mt-6 p-6 bg-base-800 rounded-lg">
                        <h4 className="font-medium text-content-secondary mb-4 text-xl">Suggested Works:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {currentQuestion.worksList.map((work, index) => (
                            <div key={index} className="text-content-secondary text-sm p-2 bg-base-850/50 rounded">
                              {work}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-content-muted">
                          Or another work of comparable literary merit
                        </div>
                      </div>
                    )}

                    {/* Display documents - Different UI for DBQ vs other question types */}
                    {currentQuestion?.documents && currentQuestion.documents.length > 0 && (
                      <div className="mt-6">
                        {currentQuestion.type === 'dbq' ? (
                          // DBQ: Show document buttons and selected document
                          <div className="space-y-4">
                            <div className="p-4 bg-base-800 rounded-lg">
                              <h4 className="font-medium text-content-secondary mb-4 text-lg">Historical Documents:</h4>
                              <div className="flex flex-wrap gap-3 mb-4">
                                {currentQuestion.documents.map((doc, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setSelectedDBQDocument(selectedDBQDocument === index ? null : index)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                      selectedDBQDocument === index
                                        ? 'bg-content-primary text-base-950 ring-2 ring-content-primary'
                                        : 'bg-base-800 text-content-secondary hover:bg-base-750 border border-border-strong'
                                    }`}
                                  >
                                    Document {String.fromCharCode(65 + index)}
                                  </button>
                                ))}
                              </div>

                              {selectedDBQDocument !== null && (
                                <div className="border-l-4 border-content-muted pl-4 bg-base-850/50 p-4 rounded">
                                  <div className="mb-3">
                                    <span className="font-bold text-content-primary">
                                      Document {String.fromCharCode(65 + selectedDBQDocument)}
                                    </span>
                                    {currentQuestion.documents[selectedDBQDocument].source && (
                                      <div className="text-sm text-content-muted mt-1">
                                        Source: {currentQuestion.documents[selectedDBQDocument].source}
                                      </div>
                                    )}
                                    {currentQuestion.documents[selectedDBQDocument].date && (
                                      <div className="text-sm text-content-muted">
                                        Date: {currentQuestion.documents[selectedDBQDocument].date}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-content-secondary italic leading-relaxed">
                                    "{currentQuestion.documents[selectedDBQDocument].content}"
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Non-DBQ: Show documents/stimulus in separate box under question
                          <div className="p-6 bg-base-800 rounded-lg">
                            <h4 className="font-medium text-content-secondary mb-4 text-lg">Supporting Documents:</h4>
                            <div className="space-y-4">
                              {currentQuestion.documents.map((doc, index) => (
                                <div key={index} className="border-l-4 border-success-500 pl-4 bg-base-850/50 p-4 rounded">
                                  {doc.source && (
                                    <div className="text-sm text-content-muted mb-2">
                                      Source: {doc.source}
                                      {doc.date && `, ${doc.date}`}
                                    </div>
                                  )}
                                  <div className="text-content-secondary leading-relaxed">
                                    {doc.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Display SAQ stimulus separately if not in documents array */}
                    {currentQuestion?.stimulus && !currentQuestion?.documents && (() => {
                      const stim = String(currentQuestion.stimulus || '');
                      const sourceMatch = stim.match(/^\s*Source:\s*(.+?)\s*(?:\n|$)/i);
                      const sourceLine = sourceMatch ? sourceMatch[1].trim() : null;
                      const content = sourceMatch ? stim.replace(sourceMatch[0], '').trim() : stim;
                      return (
                        <div className="mt-6 p-6 bg-base-800 rounded-lg">
                          <h4 className="font-medium text-content-secondary mb-4 text-lg">Stimulus:</h4>
                          {sourceLine && (
                            <div className="text-sm text-content-muted mb-2">Source: {sourceLine}</div>
                          )}
                          <div className="border-l-4 border-success-500 pl-4 bg-base-850/50 p-4 rounded">
                            <div className="text-content-secondary leading-relaxed italic">
                              {content}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Display LEQ prompt options */}
                    {currentQuestion?.promptOptions && currentQuestion.promptOptions.length > 0 && (
                      <div className="mt-6 p-6 bg-base-800 rounded-lg">
                        <h4 className="font-medium text-content-secondary mb-4 text-xl">Choose ONE of the following prompts:</h4>
                        <div className="space-y-4">
                          {currentQuestion.promptOptions.map((prompt, index) => (
                            <div key={index} className="p-4 bg-base-850/50 rounded border-l-4 border-content-muted">
                              <div className="mb-2">
                                <span className="font-bold text-content-primary">Prompt {index + 1}:</span>
                              </div>
                              <div className="text-content-secondary leading-relaxed">
                                {prompt}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display question parts if they exist */}
                    {currentQuestion?.parts && currentQuestion.parts.length > 0 && (
                      <div className="mt-4 p-4 bg-base-800 rounded-lg">
                        <h4 className="font-medium text-content-secondary mb-2">Question Parts:</h4>
                        <div className="space-y-4">
                          {currentQuestion.parts.map((part, index) => (
                            <div key={index} className="text-content-secondary text-sm flex">
                              <span className="font-semibold mr-2 text-content-primary flex-shrink-0">({String.fromCharCode(97 + index)})</span>
                              <div className="flex-1"><LaTeXRenderer content={part} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Interface */}
              <div className="mt-8">
                {/* MCQ Options */}
                {currentQuestion?.type === 'mcq' && currentQuestion?.options && (
                  <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
                    <h3 className={`text-lg font-medium text-content-primary mb-4 ${isMobile ? 'text-base mb-3' : ''}`}>Choose the best answer:</h3>
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = userAnswers[currentQuestion.id] === index;

                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: isMobile ? 1 : 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                          className={`w-full text-left ${isMobile ? 'p-3' : 'p-4'} rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-content-muted bg-base-800 text-content-primary'
                              : 'border-border-strong bg-base-800 text-content-secondary hover:border-border-strong hover:bg-base-800'
                          }`}
                        >
                          <div className={`flex items-start ${isMobile ? 'gap-2' : 'gap-3'}`}>
                            <span className={`font-bold ${isMobile ? 'text-base' : 'text-lg'} min-w-[1.5rem] ${
                              isSelected ? 'text-content-primary' : 'text-content-muted'
                            }`}>
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className={`flex-1 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                              <LaTeXRenderer content={
                                typeof option === 'string'
                                  ? option.replace(/^[A-D]\)\s*/, '')
                                  : typeof option === 'object' && option?.text
                                    ? option.text.replace(/^[A-D]\)\s*/, '')
                                    : (option?.text || String(option || ''))
                              } />
                            </span>
                            {isSelected && (
                              <CheckCircle strokeWidth={1.5} className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-content-primary flex-shrink-0 mt-0.5`} />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* FRQ/Written Response Input */}
                {currentQuestion?.type !== 'mcq' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-content-primary">Your Response:</h3>
                      {currentQuestion?.timeframe && (
                        <Badge variant="secondary">
                          Suggested Time: {currentQuestion.timeframe}
                        </Badge>
                      )}
                    </div>

                    <div className="relative">
                      <textarea
                        value={renderSafeValue(userAnswers[currentQuestion.id])}
                        onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                        placeholder={
                          currentQuestion?.type === 'frq' ? 'Write your detailed response here. Be sure to address all parts of the question...' :
                          currentQuestion?.type === 'saq' ? 'Write a clear, concise response. Use specific examples...' :
                          currentQuestion?.type === 'dbq' ? 'Develop an argument using the documents and your knowledge of history...' :
                          currentQuestion?.type === 'leq' ? 'Develop an argument with a clear thesis statement...' :
                          'Write your response here...'
                        }
                        className={`w-full bg-base-800 border border-border-strong rounded-lg text-content-primary placeholder:text-content-muted focus:border-content-muted focus:ring-2 focus:ring-content-muted resize-none ${
                          isMobile ? 'h-48 p-3 text-sm' : 'h-64 p-4'
                        }`}
                        style={{ minHeight: isMobile ? '12rem' : '16rem' }}
                      />

                      {/* Character count */}
                      <div className="absolute bottom-3 right-3 text-xs text-content-muted">
                        {renderSafeValue(userAnswers[currentQuestion.id]).length} characters
                      </div>
                    </div>

                    {/* Quick formatting tips */}
                    <div className="text-sm text-content-muted bg-base-850/50 p-3 rounded-lg">
                      <strong className="text-content-secondary">Tips:</strong>
                      {currentQuestion?.type === 'dbq' && ' Use specific evidence from the documents. Reference at least 6 documents.'}
                      {currentQuestion?.type === 'frq' && ' Structure your response with clear topic sentences and supporting evidence.'}
                      {currentQuestion?.type === 'saq' && ' Be concise but thorough. Include specific historical examples.'}
                      {currentQuestion?.type === 'leq' && ' Include a clear thesis, contextualization, and evidence.'}
                      {!['dbq', 'frq', 'saq', 'leq'].includes(currentQuestion?.type) && ' Be thorough and use specific examples to support your points.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="pt-6 border-t border-border">
                {/* Top Row: Previous, Settings, Next */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
                    Previous
                  </Button>

                  {/* Settings Button */}
                  <Button
                    variant="ghost"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 text-content-muted hover:text-content-primary"
                    title="Settings"
                  >
                    <Settings strokeWidth={1.5} className="w-4 h-4" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={currentQuestionIndex === questions.length - 1 ? () => {
                      if (window.confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
                        handleSubmitTest();
                      }
                    } : handleNextQuestion}
                    className="flex items-center gap-2"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
                    {currentQuestionIndex === questions.length - 1 ?
                      <CheckCircle strokeWidth={1.5} className="w-4 h-4" /> :
                      <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                    }
                  </Button>
                </div>

                {/* Bottom Row: Question Numbers */}
                <div className="w-full">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-base-750 scrollbar-track-base-850">
                    <div className="flex items-center gap-2 min-w-fit px-2 pb-2 justify-center">
                      {questions.map((_, index) => {
                        const isAnswered = userAnswers[questions[index].id] !== undefined;
                        const isCurrent = index === currentQuestionIndex;

                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-10 h-10 rounded-full text-sm font-medium transition-all relative flex-shrink-0 ${
                              isCurrent
                                ? 'bg-content-primary text-base-950 ring-2 ring-content-primary ring-offset-2 ring-offset-base-850'
                                : isAnswered
                                ? 'bg-success-500 text-base-950 hover:bg-success-500'
                                : 'bg-base-800 text-content-secondary hover:bg-base-750 border border-border-strong'
                            }`}
                            title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
                          >
                            {index + 1}
                            {isAnswered && !isCurrent && (
                              <CheckCircle strokeWidth={1.5} className="w-3 h-3 absolute -top-1 -right-1 text-success-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestPanel;
