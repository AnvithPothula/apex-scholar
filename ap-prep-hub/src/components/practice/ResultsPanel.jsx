import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Brain, CheckCircle, X, Target, TrendingUp, Trophy, FileQuestion, HelpCircle, Download } from 'lucide-react';
import { Button, Card, Badge, Input } from '../ui/UIComponents';
import AnimatedCounter from '../ui/AnimatedCounter';
import MarkdownRenderer from '../MarkdownRenderer';
import LaTeXRenderer from '../LaTeXRenderer';
import { buildRubricItems, attachScoresToRubric } from '../../utils/testUtils';
import { staggerContainer, staggerItem, shakeWrong, popCorrect } from '../../utils/animations';

const ResultsPanel = ({
  testResults,
  safeTestResults,
  questions,
  userAnswers,
  selectedSubject,
  selectedSection,
  resetTest,
  renderSafeValue,
  renderBreakdownSafely,
  askingTutor,
  setAskingTutor,
  tutorQuestion,
  setTutorQuestion,
  tutorResponse,
  setTutorResponse,
  tutorProcessing,
  setTutorProcessing,
  askTutorAboutQuestion,
}) => {
  if (!testResults) return null;

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="p-2 sm:p-3 md:p-4 bg-success-500 rounded-sm md:rounded-md shadow-raised">
              <Trophy strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-content-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-success-400">
              Test Results
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-content-secondary">
            {selectedSubject} • {selectedSection === 'mcq' ? 'Multiple Choice' : selectedSection === 'frq' ? 'Free Response' : 'Full Test'}
          </p>
        </motion.div>

        {/* Score Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-3 sm:p-4 md:p-6 text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">
                <AnimatedCounter value={safeTestResults.apScore} duration={1000} />
              </div>
              <p className="text-content-secondary mb-1">Predicted AP Score</p>
              <p className="text-sm text-content-muted">
                {safeTestResults.apScore >= 4 ? 'Likely to Pass' : 'Needs Improvement'}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-3 sm:p-4 md:p-6 text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-success-400 mb-1 md:mb-2">
                <AnimatedCounter value={safeTestResults.percentage} duration={1200} suffix="%" />
              </div>
              <p className="text-content-secondary mb-1">Overall Score</p>
              <p className="text-sm text-content-muted">
                {safeTestResults.score} / {safeTestResults.totalPoints} points
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-3 sm:p-4 md:p-6 text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">
                {safeTestResults.timeSpent}
              </div>
              <p className="text-content-secondary mb-1">Minutes Used</p>
              <p className="text-sm text-content-muted">Time Management</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-3 sm:p-4 md:p-6 text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-warning-400 mb-1 md:mb-2">
                {questions.filter(q => userAnswers[q.id] !== undefined).length}
              </div>
              <p className="text-content-secondary mb-1">Questions Answered</p>
              <p className="text-sm text-content-muted">
                of {questions.length} total
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Section Breakdown */}
        {safeTestResults.breakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-3">
                <TrendingUp strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                Section Performance
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(safeTestResults.breakdown).map(([section, data]) => (
                  data.total > 0 && (
                    <div key={section} className="p-4 bg-base-800 rounded-lg">
                      <h3 className="font-medium text-content-primary mb-2 capitalize">
                        {section === 'mcq' ? 'Multiple Choice' :
                         section === 'frq' ? 'Free Response' :
                         section === 'saq' ? 'Short Answer' :
                         section}
                      </h3>
                      <div className="text-2xl font-bold text-content-primary mb-1">
                        {data.percentage}%
                      </div>
                      <p className="text-sm text-content-muted">
                        {data.correct} / {data.total} points
                      </p>
                      <div className="w-full bg-base-750 rounded-full h-2 mt-2">
                        <div
                          className="bg-content-primary h-2 rounded-full"
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-content-primary mb-6 flex items-center gap-3">
              <FileQuestion className="w-6 h-6 text-content-primary" />
              Question Review
            </h2>

            <motion.div
              className="space-y-6"
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {questions.map((question, index) => {
                const result = safeTestResults.questionResults.find(r => r.questionId === question.id);
                const isCorrect = result?.correct;

                return (
                  <motion.div
                    key={question.id}
                    variants={staggerItem}
                    animate={isCorrect ? popCorrect : shakeWrong}
                    className="border border-border rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-2 rounded-lg ${isCorrect ? 'bg-success-500' : 'bg-error-500'}`}>
                        {isCorrect ? (
                          <CheckCircle strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                        ) : (
                          <X strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-medium text-content-primary mb-3">Question {index + 1}</h3>
                          <Badge variant={isCorrect ? "success" : "destructive"}>
                            {result?.score || 0} / {result?.maxPoints || 1} points
                          </Badge>
                        </div>
                        <div className="text-content-secondary mb-4">
                          <MarkdownRenderer content={renderSafeValue(question.question)} />
                        </div>

                        {/* MCQ Review */}
                        {question.type === 'mcq' && (
                          <div className="space-y-2 mb-4">
                            {question.options.map((option, i) => {
                              const isUserAnswer = result.userAnswer === i;
                              const isCorrectAnswer = result.correctAnswer === i || question.correctAnswer === i;

                              let borderColor = 'border-border-strong';
                              let bgColor = 'bg-base-800';
                              let textColor = 'text-content-primary';
                              let label = '';

                              if (isCorrectAnswer) {
                                borderColor = 'border-success-500';
                                bgColor = 'bg-success-900';
                                textColor = 'text-success-400';
                                label = ' \u2713 Correct Answer';
                              }
                              if (isUserAnswer && !isCorrectAnswer) {
                                borderColor = 'border-error-500';
                                bgColor = 'bg-error-900';
                                textColor = 'text-error-400';
                                label = ' \u2717 Your Answer';
                              }
                              if (isUserAnswer && isCorrectAnswer) {
                                label = ' \u2713 Your Correct Answer';
                              }

                              return (
                                <div
                                  key={i}
                                  className={`p-3 rounded-lg border-2 ${borderColor} ${bgColor} ${textColor} relative`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                                      <div className="prose prose-sm max-w-none inline"><LaTeXRenderer content={renderSafeValue(option)} /></div>
                                    </div>
                                    {label && (
                                      <span className="text-xs font-medium ml-2 px-2 py-1 rounded bg-black/20">
                                        {label}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* FRQ Review */}
                        {(question.type === 'frq' || question.type === 'saq' ||
                         question.type === 'dbq' || question.type === 'leq' ||
                         question.type === 'synthesis' || question.type === 'rhetorical-analysis' ||
                         question.type === 'argumentative' || question.type === 'poetry-analysis' ||
                         question.type === 'prose-analysis' || question.type === 'open-question' ||
                         question.type === 'long-frq' || question.type === 'short-frq' ||
                         question.type === 'calculator-frq' || question.type === 'no-calculator-frq' ||
                         question.type === 'short-answer' || question.type === 'essays') && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-content-primary mb-2">Your Response:</h4>
                              <div className="p-4 bg-base-800 rounded-lg">
                                <p className="text-content-secondary whitespace-pre-wrap">
                                  {renderSafeValue(result?.userAnswer) || 'No response provided'}
                                </p>
                              </div>
                            </div>

                            {/* AI Scoring Breakdown */}
                            {result.breakdown && Object.keys(result.breakdown).length > 0 && (
                              <div>
                                <h4 className="font-medium text-content-primary mb-2">Score Breakdown:</h4>
                                <div className="p-4 bg-base-800 border border-border-strong rounded-lg">
                                  <div className="grid grid-cols-2 gap-4 mb-3">
                                    {renderBreakdownSafely(result.breakdown)}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* AI Feedback */}
                            {result.feedback && (
                              <div>
                                <h4 className="font-medium text-content-primary mb-2">AI Feedback:</h4>
                                <div className="p-4 bg-success-900 border border-success-500/30 rounded-lg space-y-3">
                                  <LaTeXRenderer content={renderSafeValue(result.feedback)} />

                                  {/* Strengths and Improvements */}
                                  {(result.strengths?.length > 0 || result.improvements?.length > 0) && (
                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                      {result.strengths?.length > 0 && (
                                        <div>
                                          <h5 className="font-medium text-success-400 mb-2">Strengths:</h5>
                                          <ul className="text-sm text-content-secondary space-y-1">
                                            {result.strengths.map((strength, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                                                {renderSafeValue(strength)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {result.improvements?.length > 0 && (
                                        <div>
                                          <h5 className="font-medium text-warning-400 mb-2">Areas for Improvement:</h5>
                                          <ul className="text-sm text-content-secondary space-y-1">
                                            {result.improvements.map((improvement, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <Target strokeWidth={1.5} className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
                                                {renderSafeValue(improvement)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {question.sampleAnswer && (
                              <div>
                                <h4 className="font-medium text-content-primary mb-2">Sample Answer:</h4>
                                <div className="p-4 bg-base-800 border border-border-strong rounded-lg">
                                  <MarkdownRenderer content={renderSafeValue(question.sampleAnswer)} />
                                </div>
                              </div>
                            )}

                            {(() => {
                              const qRubric = buildRubricItems(question);
                              const merged = attachScoresToRubric(qRubric, result.breakdown, result.score);
                              if (!merged || !merged.items || merged.items.length === 0) return null;
                              return (
                                <div>
                                  <h4 className="font-medium text-content-primary mb-2">Scoring Rubric:</h4>
                                  <div className="p-4 bg-base-800 border border-border-strong rounded-lg space-y-2">
                                    <div className="text-content-secondary text-sm mb-1">
                                      Total Points: {merged.totalPoints}
                                    </div>
                                    {merged.items.map((it, idx) => (
                                      <div key={idx} className={`flex items-center justify-between px-3 py-2 rounded-md ${it.earned > 0 ? 'bg-success-900 border border-success-500/30' : 'bg-base-800 border border-border-strong'}`}>
                                        <div className="text-content-primary text-sm font-medium">{it.label}</div>
                                        <div className={`text-xs font-semibold ${it.earned > 0 ? 'text-success-400' : 'text-content-muted'}`}>
                                          {Math.round(it.earned)}/{it.maxPoints} pts
                                        </div>
                                      </div>
                                    ))}
                                    {question?.rubric?.scoringGuidelines && (
                                      <div className="text-content-muted text-xs mt-2">{renderSafeValue(question.rubric.scoringGuidelines)}</div>
                                    )}
                                    {Array.isArray(question?.rubric?.keyTerms) && question.rubric.keyTerms.length > 0 && (
                                      <div className="pt-2">
                                        <p className="text-content-secondary text-sm mb-1">Key Terms & Concepts:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {question.rubric.keyTerms.map((term, termIndex) => (
                                            <Badge key={termIndex} variant="secondary">
                                              {renderSafeValue(term)}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Ask Tutor */}
                        <div className="mt-4 pt-4 border-t border-border">
                          {askingTutor === question.id ? (
                            <div className="space-y-3">
                              <Input
                                placeholder="Ask the AP tutor about this question..."
                                value={tutorQuestion}
                                onChange={(e) => setTutorQuestion(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => askTutorAboutQuestion(question.id, tutorQuestion)}
                                  disabled={!tutorQuestion.trim() || tutorProcessing === question.id}
                                  size="sm"
                                >
                                  {tutorProcessing === question.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-border-strong border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    'Ask Tutor'
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setAskingTutor(null);
                                    setTutorQuestion('');
                                    setTutorResponse('');
                                    setTutorProcessing(null);
                                  }}
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>

                              {tutorResponse && (
                                <div className="p-4 bg-base-800 border border-border-strong rounded-lg">
                                  <h5 className="font-medium text-content-primary mb-2 flex items-center gap-2">
                                    <Brain strokeWidth={1.5} className="w-4 h-4" />
                                    AI Tutor Response:
                                  </h5>
                                  <MarkdownRenderer content={renderSafeValue(tutorResponse)} />
                                </div>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => { setTutorResponse(''); setTutorQuestion(''); setAskingTutor(question.id); }}
                              size="sm"
                              className="text-content-secondary hover:text-content-primary"
                            >
                              <HelpCircle strokeWidth={1.5} className="w-4 h-4 mr-2" />
                              Ask Tutor About This Question
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          <Button onClick={resetTest}>
            <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
            Take Another Test
          </Button>

          <Button
            onClick={() => {
              const resultsSummary = {
                subject: selectedSubject,
                section: selectedSection,
                score: safeTestResults.percentage,
                apScore: safeTestResults.apScore,
                questionsCorrect: safeTestResults.questionResults?.filter(r => r.correct).length || 0,
                totalQuestions: safeTestResults.questionResults?.length || 0,
                timeSpent: safeTestResults.timeSpent,
                date: new Date().toLocaleDateString(),
                breakdown: safeTestResults.breakdown
              };

              const dataStr = JSON.stringify(resultsSummary, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

              const exportFileDefaultName = `AP-${selectedSubject.replace(/\s+/g, '-')}-Results-${new Date().toISOString().split('T')[0]}.json`;

              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
          >
            <Download strokeWidth={1.5} className="w-5 h-5 mr-2" />
            Save Results
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPanel;
