import React from 'react';
import { motion } from 'framer-motion';
import { Play, Brain, Clock, Settings, Zap, Target, TrendingUp, Award, MessageSquare } from 'lucide-react';
import { Button, Card, Input } from '../ui/UIComponents';
import CustomDropdown from '../ui/CustomDropdown';
import ModelSelector, { saveSelectedModel } from '../ui/ModelSelector';
import { TEST_CONFIGURATIONS, DEFAULT_CONFIG } from '../../constants/testConfigurations';

const SetupPanel = ({
  selectedSubject,
  setSelectedSubject,
  selectedSection,
  setSelectedSection,
  selectedSubSection,
  setSelectedSubSection,
  selectedUnits,
  setSelectedUnits,
  customTime,
  setCustomTime,
  useDefaultTime,
  setUseDefaultTime,
  useDefaultQuestionCount,
  setUseDefaultQuestionCount,
  customQuestionCount,
  setCustomQuestionCount,
  selectedModel,
  setSelectedModel,
  isGeneratingTest,
  generationProgress,
  handleStartTest,
  setCurrentView,
  testHistory,
  setTestResults,
  setQuestions,
  setUserAnswers,
  setSelectedSubjectParent,
  setSelectedSectionParent,
  sanitizeResultsData,
  emergencyCleanResults,
  subjectOptions,
  getCanonicalSubjectName,
}) => {
  const canonicalSubject = getCanonicalSubjectName(selectedSubject);
  const currentConfig = TEST_CONFIGURATIONS[canonicalSubject] || DEFAULT_CONFIG;

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="p-2 sm:p-3 md:p-4 bg-base-750 rounded-sm md:rounded-md shadow-raised">
              <Brain strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-content-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-content-primary">
              AI Practice Tests
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-content-secondary max-w-3xl mx-auto px-2">
            Generate personalized AP practice tests with AI-powered questions, real-time feedback,
            and comprehensive score analysis. Prepare like never before!
          </p>
          <div className="mt-3 flex justify-center">
            <ModelSelector
              value={selectedModel}
              onChange={(m) => { setSelectedModel(m); saveSelectedModel(m); }}
            />
          </div>
        </motion.div>

        {/* Test Configuration */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6">
          {/* Left Column - Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-content-primary mb-6 flex items-center gap-3">
                <Settings strokeWidth={1.5} className="w-6 h-6 text-content-primary" />
                Test Configuration
              </h2>

              <div className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-3">
                    AP Subject *
                  </label>
                  <CustomDropdown
                    options={subjectOptions}
                    value={selectedSubject}
                    onChange={(value) => {
                      setSelectedSubject(value);
                      setSelectedSection('');
                      setSelectedSubSection('');
                      setSelectedUnits([]);
                    }}
                    placeholder="Select a subject..."
                  />
                </div>

                {/* Section Selection */}
                {selectedSubject && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-medium text-content-secondary mb-3">
                      Test Section *
                    </label>
                    <div className="grid gap-3">
                      {(currentConfig).sections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => {
                            setSelectedSection(section.id);
                            setSelectedSubSection('');
                          }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedSection === section.id
                              ? 'border-content-muted bg-base-800'
                              : 'border-border-strong hover:border-border-strong bg-base-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-content-primary mb-3">{section.name}</h3>
                              <p className="text-sm text-content-muted">{section.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-content-secondary">{section.time} min</div>
                              <div className="text-xs text-content-muted">{section.questions} questions</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* FRQ Subsection Selection */}
                {selectedSubject && selectedSection === 'frq' && (
                  (() => {
                    const frqSection = currentConfig.sections.find(s => s.id === 'frq');
                    const hasSubSections = frqSection?.subSections && frqSection.subSections.length > 0;

                    if (!hasSubSections) return null;

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-sm font-medium text-content-secondary mb-3">
                          FRQ Type *
                        </label>
                        <div className="grid gap-3">
                          {frqSection.subSections.map((subSection) => (
                            <div
                              key={subSection.id}
                              onClick={() => setSelectedSubSection(subSection.id)}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedSubSection === subSection.id
                                  ? 'border-content-muted bg-base-800'
                                  : 'border-border-strong hover:border-border-strong bg-base-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-content-primary mb-3">{subSection.name}</h3>
                                  <p className="text-sm text-content-muted">{subSection.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-content-secondary">{subSection.time} min</div>
                                  <div className="text-xs text-content-muted">{subSection.questions} questions</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()
                )}

                {/* Unit Selection */}
                {selectedSubject &&
                 (currentConfig?.units || []).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-content-secondary mb-3">
                      Select Units (Optional - leave empty for all units)
                    </label>
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const allUnits = currentConfig.units.map(unit => unit.name);
                          setSelectedUnits(selectedUnits.length === allUnits.length ? [] : allUnits);
                        }}
                        className="px-3 py-2 text-sm bg-base-750 hover:bg-base-750 rounded-lg text-content-primary transition-colors"
                      >
                        {selectedUnits.length === (currentConfig?.units || []).length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {(currentConfig?.units || []).map((unit) => (
                        <div
                          key={unit.name}
                          onClick={() => {
                            setSelectedUnits(prev =>
                              prev.includes(unit.name)
                                ? prev.filter(u => u !== unit.name)
                                : [...prev, unit.name]
                            );
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedUnits.includes(unit.name)
                              ? 'border-content-muted bg-base-800'
                              : 'border-border-strong hover:border-border-strong bg-base-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedUnits.includes(unit.name)
                                ? 'border-content-primary bg-content-primary'
                                : 'border-border-strong'
                            }`}>
                              {selectedUnits.includes(unit.name) && (
                                <svg className="w-3 h-3 text-content-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-content-primary text-sm">{unit.name}</span>
                              {unit.topics && (
                                <div className="text-xs text-content-muted mt-1">
                                  {unit.topics.slice(0, 3).join(', ')}{unit.topics.length > 3 ? '...' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Time Configuration */}
                {selectedSection && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-content-secondary mb-3">
                      Time Limit
                    </label>
                    <div className="space-y-3">
                      <div
                        onClick={() => setUseDefaultTime(true)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          useDefaultTime
                            ? 'border-success-500 bg-success-900'
                            : 'border-border-strong hover:border-border-strong bg-base-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-content-primary">Official AP Time</span>
                          <span className="text-success-400 font-medium">
                            {(() => {
                              const section = currentConfig.sections.find(s => s.id === selectedSection);
                              if (selectedSection === 'frq' && selectedSubSection && section?.subSections) {
                                const subSection = section.subSections.find(sub => sub.id === selectedSubSection);
                                return `${subSection?.time || 90} minutes`;
                              }
                              return `${section?.time || 90} minutes`;
                            })()}
                          </span>
                        </div>
                      </div>
                      <div
                        onClick={() => setUseDefaultTime(false)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          !useDefaultTime
                            ? 'border-content-muted bg-base-800'
                            : 'border-border-strong hover:border-border-strong bg-base-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-content-primary">Custom Time</span>
                          <Input
                            type="number"
                            placeholder="Minutes"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="w-24 text-right"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Question Count Configuration */}
                {selectedSection && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-content-secondary mb-3">
                      Number of Questions
                    </label>
                    <div className="space-y-3">
                      <div
                        onClick={() => setUseDefaultQuestionCount(true)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          useDefaultQuestionCount
                            ? 'border-success-500 bg-success-900'
                            : 'border-border-strong hover:border-border-strong bg-base-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-content-primary">Official AP Count</span>
                          <span className="text-success-400 font-medium">
                            {(() => {
                              const section = currentConfig.sections.find(s => s.id === selectedSection);
                              if (selectedSection === 'frq' && selectedSubSection && section?.subSections) {
                                const subSection = section.subSections.find(sub => sub.id === selectedSubSection);
                                return `${subSection?.questions || section?.questions || 0} questions`;
                              }
                              return `${section?.questions || 0} questions`;
                            })()}
                          </span>
                        </div>
                      </div>
                      <div
                        onClick={() => setUseDefaultQuestionCount(false)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          !useDefaultQuestionCount
                            ? 'border-content-muted bg-base-800'
                            : 'border-border-strong hover:border-border-strong bg-base-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-content-primary">Custom Count</span>
                          <Input
                            type="number"
                            placeholder="1-100"
                            min="1"
                            max="100"
                            value={customQuestionCount}
                            onChange={(e) => setCustomQuestionCount(e.target.value)}
                            className="w-24 text-right"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Start Test Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-6 border-t border-border"
              >
                <Button
                  onClick={handleStartTest}
                  disabled={(() => {
                    const sectionConfig = currentConfig.sections.find(s => s.id === selectedSection);
                    const hasSubSections = selectedSection === 'frq' && sectionConfig?.subSections && sectionConfig.subSections.length > 0;

                    return !selectedSubject || !selectedSection ||
                           (hasSubSections && !selectedSubSection) || isGeneratingTest;
                  })()}
                  className="w-full py-4 text-lg"
                >
                  {isGeneratingTest ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-border border-t-transparent rounded-full animate-spin"></div>
                      Generating... {generationProgress.generated}/{generationProgress.total} questions
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Play strokeWidth={1.5} className="w-6 h-6" />
                      Generate & Start Test
                      {(() => {
                        const sectionConfig = currentConfig.sections.find(s => s.id === selectedSection);
                        let questionsCount = sectionConfig?.questions || 0;

                        if (selectedSection === 'frq' && selectedSubSection && sectionConfig?.subSections) {
                          const subSectionConfig = sectionConfig.subSections.find(sub => sub.id === selectedSubSection);
                          questionsCount = subSectionConfig?.questions || questionsCount;
                        }

                        return questionsCount > 0 ? ` (${questionsCount} questions)` : '';
                      })()}
                    </div>
                  )}
                </Button>
              </motion.div>
            </Card>
          </motion.div>

          {/* Right Column - Recent Tests & Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Features */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
                <Zap strokeWidth={1.5} className="w-5 h-5 text-warning-400" />
                AI-Powered Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target strokeWidth={1.5} className="w-5 h-5 text-content-secondary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-content-primary mb-3">Adaptive Questions</h4>
                    <p className="text-sm text-content-muted">AI generates questions tailored to your difficulty level</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare strokeWidth={1.5} className="w-5 h-5 text-success-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-content-primary mb-3">Instant Tutor Help</h4>
                    <p className="text-sm text-content-muted">Ask questions about any problem during review</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp strokeWidth={1.5} className="w-5 h-5 text-content-secondary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-content-primary mb-3">Detailed Analytics</h4>
                    <p className="text-sm text-content-muted">Comprehensive score breakdown and improvement insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award strokeWidth={1.5} className="w-5 h-5 text-accent-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-content-primary mb-3">AP Score Prediction</h4>
                    <p className="text-sm text-content-muted">Get your predicted AP score based on performance</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Tests */}
            {testHistory.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-content-primary flex items-center gap-2">
                    <Clock strokeWidth={1.5} className="w-5 h-5 text-success-400" />
                    Recent Tests
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('history')}
                    className="text-content-secondary hover:text-content-primary"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {testHistory.slice(0, 3).map((test) => (
                    <div key={test.id} className="p-3 bg-base-800 rounded-lg hover:bg-base-800 transition-colors cursor-pointer"
                         onClick={() => {
                           console.log('RECENT: Loading test results:', test.results);
                           const sanitizedResults = sanitizeResultsData(test.results);
                           console.log('RECENT: Sanitized test results:', sanitizedResults);
                           const emergencyCleanedResults = emergencyCleanResults(sanitizedResults);
                           console.log('RECENT: Emergency cleaned test results:', emergencyCleanedResults);
                           setTestResults(emergencyCleanedResults);
                           setQuestions(test.questions || []);
                           setUserAnswers(test.userAnswers || {});
                           setSelectedSubjectParent(test.subject);
                           setSelectedSectionParent(test.section);
                           setCurrentView('results');
                         }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-content-primary mb-2">{test.subject}</h4>
                          <p className="text-sm text-content-muted">
                            {test.section === 'mcq' ? 'Multiple Choice' :
                             test.section === 'frq' ? 'Free Response' : 'Full Test'}
                          </p>
                          <p className="text-xs text-content-muted">
                            {test.createdAt instanceof Date ? test.createdAt.toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-content-primary">
                            {test.results?.apScore}
                          </div>
                          <p className="text-xs text-content-muted">AP Score</p>
                          <p className="text-xs text-content-muted">
                            {test.results?.percentage || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SetupPanel;
