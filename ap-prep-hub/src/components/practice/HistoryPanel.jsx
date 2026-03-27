import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button, Card, Badge } from '../ui/UIComponents';

const HistoryPanel = ({
  testHistory,
  setCurrentView,
  setTestResults,
  setQuestions,
  setUserAnswers,
  setSelectedSubject,
  setSelectedSection,
  sanitizeResultsData,
  emergencyCleanResults,
}) => {
  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('setup')}
              className="text-content-secondary hover:text-content-primary"
            >
              <ArrowLeft strokeWidth={1.5} className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Setup</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-content-primary">Test History</h1>
              <p className="text-sm text-content-muted hidden sm:block">Review your past practice tests</p>
            </div>
          </div>
        </motion.div>

        {/* Test History Grid */}
        <motion.div
          className="grid gap-4"
          variants={staggerContainer()}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock strokeWidth={1.5} className="w-16 h-16 text-content-disabled mx-auto mb-4" />
              <h3 className="text-xl font-bold text-content-secondary mb-2">No Tests Yet</h3>
              <p className="text-content-muted mb-6">Take your first practice test to see your history here.</p>
              <Button onClick={() => setCurrentView('setup')}>
                Start Practice Test
              </Button>
            </Card>
          ) : (
            testHistory.map((test) => (
              <motion.div
                key={test.id}
                layout
                variants={staggerItem}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
                className="cursor-pointer"
                onClick={() => {
                  console.log('HISTORY: Loading test results:', test.results);
                  const sanitizedResults = sanitizeResultsData(test.results);
                  console.log('HISTORY: Sanitized test results:', sanitizedResults);
                  const emergencyCleanedResults = emergencyCleanResults(sanitizedResults);
                  console.log('HISTORY: Emergency cleaned test results:', emergencyCleanedResults);
                  setTestResults(emergencyCleanedResults);
                  setQuestions(test.questions || []);
                  setUserAnswers(test.userAnswers || {});
                  setSelectedSubject(test.subject);
                  setSelectedSection(test.section);
                  setCurrentView('results');
                }}
              >
                <Card className="p-6 hover:bg-base-850/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-content-primary">{test.subject}</h3>
                        <Badge variant="secondary">
                          {test.section === 'mcq' ? 'Multiple Choice' :
                           test.section === 'frq' ? 'Free Response' :
                           test.section === 'saq' ? 'Short Answer' :
                           test.section === 'dbq' ? 'Document-Based Question' :
                           test.section === 'leq' ? 'Long Essay Question' :
                           'Full Test'}
                        </Badge>
                        {test.difficulty && (
                          <Badge variant="outline">
                            {test.difficulty}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-content-muted">Score: </span>
                          <span className="text-content-primary">{test.results?.percentage || 0}%</span>
                        </div>
                        <div>
                          <span className="text-content-muted">AP Score: </span>
                          <span className="text-content-primary font-bold">{test.results?.apScore || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-content-muted">Questions: </span>
                          <span className="text-content-primary">{test.questions?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-content-muted">Date: </span>
                          <span className="text-content-primary">
                            {test.createdAt instanceof Date
                              ? test.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                              : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center ml-6">
                      <div className="text-3xl font-bold text-content-primary mb-1">
                        {test.results?.apScore || 'N/A'}
                      </div>
                      <p className="text-xs text-content-muted">AP Score</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryPanel;
