import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Clock, Play, ArrowRight, Search, Filter, CheckCircle, BarChart3, Users, Award, Zap, X, AlertCircle, Lightbulb } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { AP_SUBJECTS } from '../constants/subjects';
import geminiService, { RateLimitError } from '../services/geminiService';
import dataService from '../services/dataService';

// Subjects to exclude from diagnostics (no standard exam format or not suitable for practice tests)
const EXCLUDED_SUBJECTS = [
  'AP Music Theory',
  'AP Research', 
  'AP Seminar',
  'AP Studio Art: 2-D Design',
  'AP Studio Art: 3-D Design', 
  'AP Studio Art: Drawing'
];

// Filtered subjects for diagnostics
const DIAGNOSTIC_SUBJECTS = Object.fromEntries(
  Object.entries(AP_SUBJECTS).filter(([key]) => !EXCLUDED_SUBJECTS.includes(key))
);

// Subject categories for better organization
const SUBJECT_CATEGORIES = {
  'Math & Sciences': [
    'AP Biology', 'AP Chemistry', 'AP Physics 1: Algebra-Based', 'AP Physics 2: Algebra-Based',
    'AP Physics C: Mechanics', 'AP Physics C: Electricity and Magnetism', 'AP Environmental Science',
    'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP Precalculus',
    'AP Computer Science A', 'AP Computer Science Principles'
  ],
  'History & Social Sciences': [
    'AP U.S. History', 'AP World History: Modern', 'AP European History',
    'AP U.S. Government and Politics', 'AP Government and Politics: Comparative',
    'AP Human Geography', 'AP Psychology', 'AP Macroeconomics', 'AP Microeconomics'
  ],
  'English & Literature': [
    'AP English Language and Composition', 'AP English Literature and Composition'
  ],
  'World Languages': [
    'AP Chinese Language and Culture', 'AP French Language and Culture',
    'AP German Language and Culture', 'AP Spanish Language and Culture',
    'AP Spanish Literature and Culture', 'AP Italian Language and Culture',
    'AP Japanese Language and Culture', 'AP Latin'
  ],
  'Arts & Other': [
    'AP Art History', 'AP African American Studies'
  ]
};

const DiagnosticTypes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subject } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredSubjects, setFilteredSubjects] = useState(Object.entries(DIAGNOSTIC_SUBJECTS));
  const [takingDiagnostic, setTakingDiagnostic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [userHistory, setUserHistory] = useState([]);

  // Load user's diagnostic history on component mount
  useEffect(() => {
    if (user) {
      loadDiagnosticHistory();
    }
  }, [user]);

  const loadDiagnosticHistory = async () => {
    try {
      const history = await dataService.getUserDiagnosticResults(user.uid);
      setUserHistory(history.map(item => ({
        ...item,
        timestamp: item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown'
      })));
    } catch (error) {
      console.error('Error loading diagnostic history:', error);
    }
  };

  const startDiagnostic = async (subjectKey, subjectName) => {
    if (!user) {
      alert('Please sign in to take diagnostic assessments');
      return;
    }

    setIsGeneratingQuestions(true);
    setTakingDiagnostic({ key: subjectKey, name: subjectName });

    try {
      // Generate diagnostic questions using Gemini AI
      const generatedQuestions = await geminiService.generateDiagnosticQuestions(
        subjectName,
        'General Assessment', // We could make this more specific based on subject
        'medium',
        15 // Number of questions
      );

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
    } catch (error) {
      console.error('Error generating questions:', error);
      if (error instanceof RateLimitError || error?.isRateLimit) {
        const waitTime = error.retryAfter || 60;
        alert(`AI service is temporarily busy. Please wait ${waitTime} seconds and try again.`);
      } else {
        alert('Failed to generate diagnostic questions. Please try again.');
      }
      setTakingDiagnostic(null);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishDiagnostic();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishDiagnostic = async () => {
    try {
      // Calculate results
      let correctAnswers = 0;
      let topicScores = {};
      
      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        // Track by concept/topic
        const concept = question.concept || 'General';
        if (!topicScores[concept]) {
          topicScores[concept] = { correct: 0, total: 0 };
        }
        topicScores[concept].total++;
        if (isCorrect) topicScores[concept].correct++;
      });

      const accuracy = Math.round((correctAnswers / questions.length) * 100);
      
      // Determine strengths and weaknesses
      const strengths = [];
      const weaknesses = [];
      
      Object.entries(topicScores).forEach(([concept, score]) => {
        const percentage = (score.correct / score.total) * 100;
        if (percentage >= 70) {
          strengths.push(concept);
        } else if (percentage < 50) {
          weaknesses.push(concept);
        }
      });

      const result = {
        subject: takingDiagnostic.name,
        accuracy,
        totalQuestions: questions.length,
        correctAnswers,
        strengths,
        weaknesses,
        topicScores,
        recommendations: generateRecommendations(accuracy, weaknesses)
      };

      setDiagnosticResult(result);

      // Save to Firebase
      await dataService.saveDiagnosticResult(user.uid, {
        subject: takingDiagnostic.key,
        subjectName: takingDiagnostic.name,
        ...result,
        questions: questions.length,
        completedAt: new Date()
      });

      // Update local history
      setUserHistory(prev => [{
        id: Date.now(),
        subject: takingDiagnostic.name,
        accuracy,
        timestamp: 'Just now'
      }, ...prev]);

    } catch (error) {
      console.error('Error finishing diagnostic:', error);
      alert('Failed to save diagnostic results. Please try again.');
    }
  };

  const generateRecommendations = (accuracy, weaknesses) => {
    const recommendations = [];
    
    if (accuracy < 50) {
      recommendations.push('Review fundamental concepts before moving to advanced topics');
      recommendations.push('Consider taking practice tests to identify specific knowledge gaps');
    } else if (accuracy < 70) {
      recommendations.push('Focus on practicing problems in your weak areas');
      recommendations.push('Review explanations for missed questions');
    } else {
      recommendations.push('Great job! Continue practicing to maintain your strong performance');
      recommendations.push('Consider taking more challenging practice materials');
    }

    weaknesses.forEach(weakness => {
      recommendations.push(`Spend extra time studying ${weakness}`);
    });

    return recommendations;
  };

  // If a specific subject is provided in URL, navigate to that diagnostic
  useEffect(() => {
    if (subject && DIAGNOSTIC_SUBJECTS[subject]) {
      // Navigate to specific subject diagnostic
      navigate(`/diagnostics/${subject}/start`);
    }
  }, [subject, navigate]);

  // Filter subjects based on search and category
  useEffect(() => {
    let subjects = Object.entries(DIAGNOSTIC_SUBJECTS);

    // Filter by category
    if (selectedCategory !== 'All') {
      const categorySubjects = SUBJECT_CATEGORIES[selectedCategory] || [];
      subjects = subjects.filter(([key]) => categorySubjects.includes(key));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      subjects = subjects.filter(([key, subject]) => 
        key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubjects(subjects);
  }, [searchQuery, selectedCategory]);

  const handleStartDiagnostic = (subjectKey) => {
    navigate(`/diagnostics/${encodeURIComponent(subjectKey)}/start`);
  };

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      {takingDiagnostic ? (
        // Diagnostic Test Interface
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {isGeneratingQuestions ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-content-primary mb-4">Generating Diagnostic Questions</h2>
              <p className="text-content-muted">AI is creating personalized questions for {takingDiagnostic.name}...</p>
            </Card>
          ) : diagnosticResult ? (
            // Results Display
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mb-2">Diagnostic Complete!</h1>
                <p className="text-lg text-content-muted">{takingDiagnostic.name} Assessment Results</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-content-primary mb-4">Overall Performance</h3>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-400 mb-2">{diagnosticResult.accuracy}%</div>
                    <p className="text-content-muted">{diagnosticResult.correctAnswers} out of {diagnosticResult.totalQuestions} correct</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-base-800 rounded-full h-3">
                      <div 
                        className="bg-primary-500 h-3 rounded-full transition-all duration-1000" 
                        style={{ width: `${diagnosticResult.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-content-primary mb-4">Topic Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(diagnosticResult.topicScores).map(([topic, score]) => (
                      <div key={topic}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-content-secondary">{topic}</span>
                          <span className="text-sm text-content-muted">
                            {score.correct}/{score.total}
                          </span>
                        </div>
                        <div className="w-full bg-base-800 rounded-full h-2">
                          <div 
                            className="bg-success-500 h-2 rounded-full" 
                            style={{ width: `${(score.correct / score.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-success-400 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Strengths
                  </h3>
                  {diagnosticResult.strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {diagnosticResult.strengths.map((strength, index) => (
                        <li key={index} className="text-content-secondary flex items-center">
                          <CheckCircle className="w-4 h-4 text-success-400 mr-2" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-content-muted">Focus on building fundamental knowledge</p>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-accent-400 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Areas for Improvement
                  </h3>
                  {diagnosticResult.weaknesses.length > 0 ? (
                    <ul className="space-y-2">
                      {diagnosticResult.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-content-secondary flex items-center">
                          <AlertCircle className="w-4 h-4 text-accent-400 mr-2" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-content-muted">Great job! No major weak areas identified</p>
                  )}
                </Card>
              </div>

              <Card className="p-6 mb-8">
                <h3 className="text-xl font-bold text-content-primary mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {diagnosticResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-content-secondary flex items-center">
                      <ArrowRight className="w-4 h-4 text-primary-400 mr-2" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setTakingDiagnostic(null);
                    setDiagnosticResult(null);
                    setQuestions([]);
                    setAnswers({});
                  }}
                  variant="outline"
                >
                  Take Another Diagnostic
                </Button>
                <Button
                  onClick={() => navigate('/practice-tests')}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  Start Practice Tests
                </Button>
              </div>
            </div>
          ) : (
            // Question Interface
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-content-primary">{takingDiagnostic.name} Diagnostic</h1>
                  <p className="text-content-muted">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setTakingDiagnostic(null);
                    setQuestions([]);
                    setAnswers({});
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </div>

              <div className="mb-6">
                <div className="w-full bg-base-800 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {questions[currentQuestionIndex] && (
                <Card className="p-8 mb-6">
                  <h2 className="text-xl font-bold text-content-primary mb-6">
                    {questions[currentQuestionIndex].question}
                  </h2>
                  <div className="space-y-3">
                    {questions[currentQuestionIndex].choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                        className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                          answers[currentQuestionIndex] === index
                            ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                            : 'border-border-strong bg-base-850 text-content-secondary hover:border-border'
                        }`}
                      >
                        <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                        {choice}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={answers[currentQuestionIndex] === undefined}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Diagnostic' : 'Next Question'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Main Diagnostics Page
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="p-2 sm:p-3 md:p-4 bg-primary-500 rounded-sm md:rounded-md shadow-raised">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-base-950" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary font-display">
              AI Diagnostics
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-content-secondary max-w-3xl mx-auto px-2">
            Get an instant diagnostic assessment in hundreds of AP subjects. Discover your 
            strengths and identify areas for improvement with our AI-powered diagnostic tests.
          </p>
        </motion.div>

        {/* Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-primary-900 border-primary-500/30">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-primary-500/20 rounded-lg w-fit mx-auto mb-3">
                  <Target className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Adaptive Assessment</h3>
                <p className="text-sm text-content-muted">
                  Questions adapt to your skill level in real-time
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary-900 rounded-lg w-fit mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Detailed Analysis</h3>
                <p className="text-sm text-content-muted">
                  Comprehensive breakdown of strengths and weaknesses
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-success-500/20 rounded-lg w-fit mx-auto mb-3">
                  <Clock className="w-6 h-6 text-success-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Quick Results</h3>
                <p className="text-sm text-content-muted">
                  Get instant feedback and personalized recommendations
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-warning-500/20 rounded-lg w-fit mx-auto mb-3">
                  <Zap className="w-6 h-6 text-warning-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Study Plan</h3>
                <p className="text-sm text-content-muted">
                  Receive a customized study plan based on results
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-content-primary mb-6 text-center">How AI Diagnostics Work</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-base-950 font-bold text-lg mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Take Assessment</h3>
                <p className="text-sm text-content-muted">
                  Answer 15-25 adaptive questions that adjust to your skill level
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-base-950 font-bold text-lg mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-content-primary mb-2">AI Analysis</h3>
                <p className="text-sm text-content-muted">
                  Our AI analyzes your responses and identifies knowledge gaps
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success-600 rounded-full flex items-center justify-center text-base-950 font-bold text-lg mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Get Results</h3>
                <p className="text-sm text-content-muted">
                  Receive detailed insights and personalized study recommendations
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-content-muted" />
                <Input
                  placeholder="Search AP subjects for diagnostic assessment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {['All', ...Object.keys(SUBJECT_CATEGORIES)].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-primary-500 hover:bg-primary-600' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-content-muted">
              {filteredSubjects.length} diagnostic{filteredSubjects.length !== 1 ? 's' : ''} available
            </div>
          </Card>
        </motion.div>

        {/* Popular Diagnostics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-content-primary mb-4">Popular Diagnostics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['AP Calculus AB', 'AP Biology', 'AP U.S. History', 'AP Chemistry'].map((subjectName) => {
              const subjectEntry = Object.entries(DIAGNOSTIC_SUBJECTS).find(([key]) => key === subjectName);
              if (!subjectEntry) return null;
              const [key, subject] = subjectEntry;

              return (
                <Card key={key} className="p-4 hover:bg-base-850 transition-colors cursor-pointer group"
                      onClick={() => handleStartDiagnostic(key)}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                    <div className="flex items-center gap-1 text-content-muted text-xs">
                      <Users className="w-3 h-3" />
                      <span>1.2k+ taken</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-content-primary mb-2 group-hover:text-primary-400 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-content-muted mb-4">
                    Comprehensive diagnostic covering all major concepts and skills.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-content-muted text-sm">
                      <Clock className="w-4 h-4" />
                      <span>15-20 min</span>
                    </div>
                    <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* All Diagnostics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-content-primary mb-6">All Diagnostic Assessments</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map(([key, subject], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 6) }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="p-6 h-full hover:bg-base-850 transition-all duration-200 group border-border hover:border-border-strong">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-content-primary group-hover:text-primary-400 transition-colors">
                          {subject.name}
                        </h3>
                      </div>
                      <p className="text-sm text-content-muted leading-relaxed mb-4">
                        {subject.description || `Comprehensive diagnostic covering fundamental concepts, skills, and real-world applications for ${subject.name}.`}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-content-muted">
                      <Clock className="w-4 h-4" />
                      <span>15-25 questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-content-muted">
                      <BarChart3 className="w-4 h-4" />
                      <span>Adaptive difficulty</span>
                    </div>
                    <div className="flex items-center gap-2 text-content-muted">
                      <Target className="w-4 h-4" />
                      <span>Skill assessment</span>
                    </div>
                    <div className="flex items-center gap-2 text-content-muted">
                      <TrendingUp className="w-4 h-4" />
                      <span>Study plan</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartDiagnostic(key);
                    }}
                    className="w-full bg-primary-500 hover:bg-primary-600"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Start Diagnostic
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-content-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-content-secondary mb-2">No diagnostics found</h3>
              <p className="text-content-muted mb-6">
                Try adjusting your search query or category filter.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="p-8 bg-primary-900 border-primary-500/30">
            <h2 className="text-2xl font-bold text-content-primary mb-6 text-center">
              Why Take AI Diagnostic Assessments?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-success-500/20 rounded-lg w-fit mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-success-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Identify Knowledge Gaps</h3>
                <p className="text-sm text-content-muted">
                  Quickly discover which topics you've mastered and which need more attention
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary-500/20 rounded-lg w-fit mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Track Progress</h3>
                <p className="text-sm text-content-muted">
                  Monitor your improvement over time with detailed analytics and insights
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary-900 rounded-lg w-fit mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold text-content-primary mb-2">Optimize Study Time</h3>
                <p className="text-sm text-content-muted">
                  Focus your efforts on areas where you'll see the biggest improvement
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Call to Action */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 text-center"
          >
            <Card className="p-8 bg-primary-900 border-primary-500/30">
              <h2 className="text-2xl font-bold text-content-primary mb-4">
                Sign Up to Save Your Results
              </h2>
              <p className="text-lg text-content-secondary mb-6 max-w-2xl mx-auto">
                Create a free account to track your diagnostic results over time, 
                get personalized study recommendations, and access detailed analytics.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-primary-500 hover:bg-primary-600 px-8 py-3 text-lg"
              >
                Get Started Free
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
      )}
    </div>
  );
};

export default DiagnosticTypes;
