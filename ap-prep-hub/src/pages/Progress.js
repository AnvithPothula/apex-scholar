import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Calendar, TrendingUp, Award, Target, BookOpen, Brain, Calculator, Zap, Clock, BarChart3, Medal, Crown, Flame, CheckCircle, AlertCircle, ChevronRight, Filter, Download } from 'lucide-react';
import { Card, Button, Badge, Progress, Select } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AP_SUBJECTS } from '../constants/subjects';
import achievementsService from '../services/achievementsService';
import dataService from '../services/dataService';
import geminiService from '../services/geminiService';

const ProgressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Planned filter state — wired up in a future update
  // eslint-disable-next-line no-unused-vars
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  // eslint-disable-next-line no-unused-vars
  const [selectedSubject, setSelectedSubject] = useState('all');
  // eslint-disable-next-line no-unused-vars
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [progressData, setProgressData] = useState(null);
  const [userAchievements, setUserAchievements] = useState(null);
  const [achievementsByCategory, setAchievementsByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserProgress = async () => {
    try {
      setIsLoading(true);
      
      // Load achievements data
      const achievements = await achievementsService.getUserAchievements(user.uid);
      setUserAchievements(achievements);
      
      const categorized = achievementsService.getAchievementsByCategory();
      setAchievementsByCategory(categorized);
      
      // Load all user data
      const [
        overallProgress,
        studySessions,
        flashcardDecks,
        solverHistory,
        stats
      ] = await Promise.all([
        dataService.getUserProgress(user.uid),
        dataService.getUserStudySessions(user.uid, 30),
        dataService.getUserFlashcardDecks(user.uid),
        dataService.getUserSolverHistory(user.uid),
        dataService.getUserStats(user.uid)
      ]);

      // Process and organize data
      const processedData = {
        overall: {
          studyStreak: achievements.studyStreaks?.current || 0,
          totalStudyTime: formatStudyTime(stats.totalStudyTime || 0),
          questionsAnswered: calculateTotalQuestions(studySessions, flashcardDecks),
          accuracy: calculateOverallAccuracy(studySessions, flashcardDecks),
          improvement: calculateImprovement(studySessions),
          rank: getRankInfo(achievements.totalPoints || 0).rank,
          totalPoints: achievements.totalPoints || 0
        },
        subjects: processSubjectProgress(overallProgress, studySessions),
        weeklyActivity: processWeeklyActivity(studySessions),
        achievements: processAchievements(achievements),
        recommendations: await generateRecommendations(overallProgress, studySessions)
      };

      setProgressData(processedData);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Set default data on error
      setProgressData(getDefaultProgressData());
    } finally {
      setIsLoading(false);
    }
  };

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}.${Math.round(mins/6)} hours` : `${mins} minutes`;
  };

  const getRankInfo = (totalPoints) => {
    if (totalPoints >= 1000) return { rank: 'Master', icon: Crown, color: 'text-warning-400', bgColor: 'bg-warning-400/20' };
    if (totalPoints >= 500) return { rank: 'Expert', icon: Medal, color: 'text-primary-400', bgColor: 'bg-primary-400/20' };
    if (totalPoints >= 200) return { rank: 'Advanced', icon: Trophy, color: 'text-primary-400', bgColor: 'bg-primary-400/20' };
    if (totalPoints >= 50) return { rank: 'Intermediate', icon: Award, color: 'text-success-400', bgColor: 'bg-success-400/20' };
    return { rank: 'Beginner', icon: Star, color: 'text-content-muted', bgColor: 'bg-base-750/20' };
  };

  const calculateTotalQuestions = (studySessions, flashcardDecks) => {
    const sessionQuestions = studySessions.reduce((total, session) => {
      return total + (session.questionsAnswered || session.cardsStudied || 0);
    }, 0);
    
    const flashcardQuestions = flashcardDecks.reduce((total, deck) => {
      return total + (deck.totalCards || 0);
    }, 0);

    return sessionQuestions + flashcardQuestions;
  };

  const calculateOverallAccuracy = (studySessions, flashcardDecks) => {
    const allSessions = [...studySessions];
    if (allSessions.length === 0) return 0;
    
    const totalAccuracy = allSessions.reduce((sum, session) => {
      return sum + (session.accuracy || 0);
    }, 0);
    
    return Math.round(totalAccuracy / allSessions.length);
  };

  const calculateImprovement = (studySessions) => {
    if (studySessions.length < 2) return '+0%';
    
    const recent = studySessions.slice(0, Math.floor(studySessions.length / 2));
    const older = studySessions.slice(Math.floor(studySessions.length / 2));
    
    const recentAvg = recent.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.accuracy || 0), 0) / older.length;
    
    const improvement = recentAvg - olderAvg;
    return improvement > 0 ? `+${Math.round(improvement)}%` : `${Math.round(improvement)}%`;
  };

  const calculateRank = (totalMinutes, streak) => {
    const totalHours = totalMinutes / 60;
    if (totalHours >= 50 && streak >= 20) return 'Expert';
    if (totalHours >= 20 && streak >= 10) return 'Advanced';
    if (totalHours >= 10 && streak >= 5) return 'Intermediate';
    return 'Beginner';
  };

  const processSubjectProgress = (progressData, studySessions) => {
    const subjectMap = new Map();
    
    // Process study sessions
    studySessions.forEach(session => {
      if (!session.subject) return;
      
      if (!subjectMap.has(session.subject)) {
        subjectMap.set(session.subject, {
          name: session.subject,
          sessions: []
        });
      }
      subjectMap.get(session.subject).sessions.push(session);
    });

    // Convert to array and calculate metrics
    return Array.from(subjectMap.values()).map((subject, index) => {
      const allSessions = subject.sessions;
      const totalTime = subject.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const avgAccuracy = allSessions.length > 0 
        ? allSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / allSessions.length 
        : 0;
      
      const colors = [
        'bg-primary-500',
        'bg-success-500',
        'bg-primary-500',
        'bg-error-500',
        'bg-warning-500'
      ];

      return {
        name: subject.name,
        progress: Math.min(100, Math.round((allSessions.length / 10) * 100)),
        accuracy: Math.round(avgAccuracy),
        timeSpent: formatStudyTime(totalTime),
        questionsAnswered: allSessions.reduce((sum, s) => sum + (s.questionsAnswered || 0), 0),
        strongTopics: ['Advanced Concepts', 'Problem Solving'], // Mock data
        weakTopics: ['Basic Fundamentals', 'Time Management'], // Mock data
        lastStudied: allSessions.length > 0 ? 'Recently' : 'Never',
        streak: Math.min(10, allSessions.length),
        color: colors[index % colors.length]
      };
    }).slice(0, 5); // Limit to 5 subjects for display
  };

  const processWeeklyActivity = (studySessions) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = days.map(day => ({ day, questions: 0, time: 0 }));
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    studySessions.forEach(session => {
      const sessionDate = session.timestamp?.toDate() || new Date();
      if (sessionDate >= oneWeekAgo) {
        const dayIndex = sessionDate.getDay();
        weekData[dayIndex].questions += session.questionsAnswered || session.cardsStudied || 0;
        weekData[dayIndex].time += session.duration || 0;
      }
    });
    
    return weekData;
  };

  const processAchievements = (achievements) => {
    // Get all achievement definitions
    const allAchievements = achievementsService.getAllAchievements();
    const unlockedAchievements = achievements.unlockedAchievements || [];
    
    // Create achievement display array for overview tab
    const achievementDisplayList = Object.values(allAchievements).slice(0, 4).map(achievement => {
      const isUnlocked = unlockedAchievements.includes(achievement.id);
      const progress = achievementsService.getAchievementProgress(
        user?.uid,
        achievement.id,
        achievements.activityCounters || {},
        achievements.studyStreaks || {}
      );
      
      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        earned: isUnlocked,
        earnedDate: isUnlocked ? new Date().toLocaleDateString() : null,
        progress: progress ? progress.current : 0,
        target: progress ? progress.target : 100
      };
    });

    return {
      // Object structure for achievements tab
      unlocked: unlockedAchievements,
      totalPoints: achievements.totalPoints || 0,
      activityCounters: achievements.activityCounters || {},
      studyStreaks: achievements.studyStreaks || {},
      // Array structure for overview tab
      displayList: achievementDisplayList
    };
  };

  const generateRecommendations = async (progressData, studySessions) => {
    if (!progressData || studySessions.length === 0) {
      return [
        {
          type: 'start',
          subject: 'General',
          topic: 'Getting Started',
          action: 'Begin your learning journey by exploring subjects',
          priority: 'high'
        }
      ];
    }

    // Generate AI-powered recommendations
    try {
      const analysis = await geminiService.analyzeStudentProgress(
        progressData.map(p => p.subject || 'Unknown'),
        studySessions,
        ['Time Management', 'Consistency'] // Mock weak areas
      );

      return analysis.recommendations?.map((rec, index) => ({
        type: index % 3 === 0 ? 'weakness' : index % 3 === 1 ? 'review' : 'strengthen',
        subject: 'General',
        topic: rec,
        action: rec,
        priority: index < 2 ? 'high' : 'medium'
      })) || [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [
        {
          type: 'review',
          subject: 'General',
          topic: 'Study Habits',
          action: 'Maintain consistent daily study schedule',
          priority: 'medium'
        }
      ];
    }
  };

  const getDefaultProgressData = () => ({
    overall: {
      studyStreak: 0,
      totalStudyTime: '0 minutes',
      questionsAnswered: 0,
      accuracy: 0,
      improvement: '+0%',
      rank: 'Beginner'
    },
    subjects: [],
    weeklyActivity: [
      { day: 'Mon', questions: 0, time: 0 },
      { day: 'Tue', questions: 0, time: 0 },
      { day: 'Wed', questions: 0, time: 0 },
      { day: 'Thu', questions: 0, time: 0 },
      { day: 'Fri', questions: 0, time: 0 },
      { day: 'Sat', questions: 0, time: 0 },
      { day: 'Sun', questions: 0, time: 0 }
    ],
    achievements: [],
    recommendations: []
  });

  const StatCard = ({ title, value, change, icon: Icon, color = "text-primary-400" }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-content-muted mb-1">{title}</p>
          <p className="text-2xl font-bold text-content-primary">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-success-400' : 'text-error-400'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 bg-base-850 rounded-sm ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );

  const ProgressChart = ({ data }) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-content-primary mb-4">Weekly Activity</h3>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full bg-base-800 rounded-t-lg overflow-hidden mb-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.questions / 30) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-primary-500 w-full"
                style={{ minHeight: '4px' }}
              />
            </div>
            <span className="text-xs text-content-muted">{day.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-content-muted">
        <span>Questions per day</span>
        <span>Max: 30</span>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 md:p-4 bg-primary-500 rounded-sm md:rounded-md shadow-raised">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-base-950" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary font-display">
                Progress Analytics
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-content-secondary">
              Track your learning journey with detailed insights and achievements.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="hidden md:flex">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-base-850 p-1 rounded-xl mb-8 w-fit mx-auto"
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-base-750 text-content-primary shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-base-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'achievements'
                ? 'bg-base-750 text-content-primary shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-base-800'
            }`}
          >
            Achievements
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-content-muted">Loading your progress data...</p>
            </div>
          </div>
        ) : user && progressData ? (
          <>
            {activeTab === 'achievements' && (
              <>
                {/* User Rank & Points */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <Card className="p-6 bg-primary-900 border-primary-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 ${getRankInfo(progressData.overall.totalPoints).bgColor} rounded-2xl`}>
                          {React.createElement(getRankInfo(progressData.overall.totalPoints).icon, {
                            className: `w-8 h-8 ${getRankInfo(progressData.overall.totalPoints).color}`
                          })}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-content-primary">{getRankInfo(progressData.overall.totalPoints).rank}</h2>
                          <p className="text-content-muted">Rank</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary-400">{progressData.overall.totalPoints}</div>
                        <p className="text-content-muted">Total Points</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Achievement Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-8"
                >
                  {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                    <div key={category}>
                      <h2 className="text-2xl font-bold text-content-primary mb-6">{category}</h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((achievement) => {
                          const isUnlocked = progressData.achievements.unlocked.includes(achievement.id);
                          const progress = achievementsService.getAchievementProgress(
                            user.uid,
                            achievement.id,
                            progressData.achievements.activityCounters,
                            progressData.achievements.studyStreaks
                          );

                          return (
                            <motion.div
                              key={achievement.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Card className={`p-6 transition-all hover:scale-105 ${
                                isUnlocked
                                  ? 'bg-success-500/10 border-success-500/30 shadow-raised'
                                  : 'bg-base-850/50 border-border hover:border-border-strong'
                              }`}>
                                <div className="text-center">
                                  <div className={`text-5xl mb-4 ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                                    {achievement.icon}
                                  </div>
                                  <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-success-300' : 'text-content-secondary'}`}>
                                    {achievement.title}
                                  </h3>
                                  <p className="text-sm text-content-muted mb-4">{achievement.description}</p>
                                  
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge variant={isUnlocked ? 'default' : 'secondary'} className="text-xs">
                                      {achievement.points} pts
                                    </Badge>
                                    {isUnlocked && (
                                      <div className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4 text-success-400" />
                                        <span className="text-xs text-success-400 font-medium">Unlocked!</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  {!isUnlocked && progress && (
                                    <div>
                                      <div className="flex justify-between text-xs text-content-muted mb-2">
                                        <span>Progress</span>
                                        <span>{progress.current} / {progress.target}</span>
                                      </div>
                                      <Progress 
                                        value={progress.percentage} 
                                        className="h-2"
                                      />
                                    </div>
                                  )}
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </>
            )}

            {activeTab === 'overview' && (
              <>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard
                title="Study Streak"
                value={`${progressData.overall.studyStreak} days`}
                icon={Zap}
                color="text-accent-400"
              />
              <StatCard
                title="Total Study Time"
                value={progressData.overall.totalStudyTime}
                change={progressData.overall.improvement}
                icon={Clock}
                color="text-primary-400"
              />
              <StatCard
                title="Questions Answered"
                value={progressData.overall.questionsAnswered}
                icon={Target}
                color="text-success-400"
              />
              <StatCard
                title="Overall Accuracy"
                value={`${progressData.overall.accuracy}%`}
                change={progressData.overall.improvement}
                icon={TrendingUp}
                color="text-primary-400"
              />
            </motion.div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              {/* Weekly Activity Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ProgressChart data={progressData.weeklyActivity} />
              </motion.div>

              {/* Performance Overview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-content-primary mb-4">Performance Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-content-secondary">Current Rank</span>
                      <Badge variant="default" className="bg-primary-500">
                        {progressData.overall.rank}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-content-secondary">Questions Answered</span>
                      <span className="text-content-primary">{progressData.overall.questionsAnswered}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-content-secondary">Average Accuracy</span>
                      <span className="text-success-400">{progressData.overall.accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-content-secondary">Study Streak</span>
                      <span className="text-accent-400">{progressData.overall.studyStreak} days</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Subject Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-content-primary mb-6">Subject Progress</h2>
              <div className="space-y-6">
                {progressData.subjects.map((subject, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-content-primary mb-2">{subject.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-content-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {subject.timeSpent}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {subject.questionsAnswered} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {subject.streak} day streak
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-content-primary">{subject.progress}%</div>
                        <div className="text-sm text-content-muted">Complete</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-base-800 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                          className={`${subject.color} h-3 rounded-full`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Strong Topics */}
                      <div>
                        <h4 className="text-sm font-medium text-success-400 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Strong Topics
                        </h4>
                        <div className="space-y-1">
                          {subject.strongTopics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-success-400 border-success-400">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Weak Topics */}
                      <div>
                        <h4 className="text-sm font-medium text-accent-400 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Needs Work
                        </h4>
                        <div className="space-y-1">
                          {subject.weakTopics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-accent-400 border-accent-400">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-content-muted">
                        Last studied: {subject.lastStudied}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-content-primary mb-6">Recent Achievements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {progressData.achievements.displayList.map((achievement) => (
                  <Card key={achievement.id} className={`p-6 ${achievement.earned ? 'border-warning-500/50 bg-warning-500/10' : 'border-border'}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold text-content-primary mb-2">{achievement.title}</h3>
                      <p className="text-sm text-content-muted mb-3">{achievement.description}</p>
                      {achievement.earned ? (
                        <Badge variant="default" className="bg-warning-600">
                          Earned {achievement.earnedDate}
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-full bg-base-800 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-content-muted">
                            {achievement.progress}/{achievement.target}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-content-primary mb-6">AI Recommendations</h2>
              <div className="space-y-4">
                {progressData.recommendations.map((rec, index) => (
                  <Card key={index} className="p-6 hover:bg-base-850/50 cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          rec.priority === 'high' ? 'bg-error-500/20 text-error-400' :
                          rec.priority === 'medium' ? 'bg-warning-500/20 text-warning-400' :
                          'bg-success-500/20 text-success-400'
                        }`}>
                          {rec.type === 'weakness' ? <AlertCircle className="w-5 h-5" /> :
                           rec.type === 'review' ? <BookOpen className="w-5 h-5" /> :
                           <Star className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-content-primary">{rec.subject} - {rec.topic}</h3>
                          <p className="text-content-muted">{rec.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.priority} priority
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-content-muted" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
              </>
            )}
          </>
        ) : (
          /* Not Logged In State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="p-12 max-w-2xl mx-auto">
              <BarChart3 className="w-24 h-24 text-content-muted mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-content-primary mb-4">
                Track Your Learning Progress
              </h2>
              <p className="text-content-muted text-lg mb-8">
                Sign up for a free account to access detailed analytics, personalized insights, 
                and AI-powered recommendations to accelerate your AP exam preparation.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="p-4 bg-primary-900 rounded-lg w-fit mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-content-primary mb-2">Performance Tracking</h3>
                  <p className="text-sm text-content-muted">
                    Monitor your accuracy and improvement over time
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-primary-500/20 rounded-lg w-fit mx-auto mb-3">
                    <Brain className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-content-primary mb-2">AI Insights</h3>
                  <p className="text-sm text-content-muted">
                    Get personalized recommendations and study plans
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-success-500/20 rounded-lg w-fit mx-auto mb-3">
                    <Award className="w-8 h-8 text-success-400" />
                  </div>
                  <h3 className="font-semibold text-content-primary mb-2">Achievements</h3>
                  <p className="text-sm text-content-muted">
                    Earn badges and celebrate your learning milestones
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-3"
              >
                Get Started Free
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
