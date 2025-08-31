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
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedSubject, setSelectedSubject] = useState('all');
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
    if (totalPoints >= 1000) return { rank: 'Master', icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' };
    if (totalPoints >= 500) return { rank: 'Expert', icon: Medal, color: 'text-purple-400', bgColor: 'bg-purple-400/20' };
    if (totalPoints >= 200) return { rank: 'Advanced', icon: Trophy, color: 'text-blue-400', bgColor: 'bg-blue-400/20' };
    if (totalPoints >= 50) return { rank: 'Intermediate', icon: Award, color: 'text-green-400', bgColor: 'bg-green-400/20' };
    return { rank: 'Beginner', icon: Star, color: 'text-slate-400', bgColor: 'bg-slate-400/20' };
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
        'from-blue-600 to-blue-800',
        'from-green-600 to-green-800',
        'from-purple-600 to-purple-800',
        'from-red-600 to-red-800',
        'from-yellow-600 to-yellow-800'
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

  const StatCard = ({ title, value, change, icon: Icon, color = "text-blue-400" }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 bg-slate-800 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );

  const ProgressChart = ({ data }) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Weekly Activity</h3>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full bg-slate-700 rounded-t-lg overflow-hidden mb-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.questions / 30) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gradient-to-t from-blue-600 to-blue-400 w-full"
                style={{ minHeight: '4px' }}
              />
            </div>
            <span className="text-xs text-slate-400">{day.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>Questions per day</span>
        <span>Max: 30</span>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Progress Analytics
              </h1>
            </div>
            <p className="text-lg text-slate-300">
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
          className="flex space-x-1 bg-slate-800 p-1 rounded-xl mb-8 w-fit mx-auto"
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'achievements'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Achievements
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading your progress data...</p>
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
                  <Card className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 ${getRankInfo(progressData.overall.totalPoints).bgColor} rounded-2xl`}>
                          {React.createElement(getRankInfo(progressData.overall.totalPoints).icon, {
                            className: `w-8 h-8 ${getRankInfo(progressData.overall.totalPoints).color}`
                          })}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-100">{getRankInfo(progressData.overall.totalPoints).rank}</h2>
                          <p className="text-slate-400">Rank</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-400">{progressData.overall.totalPoints}</div>
                        <p className="text-slate-400">Total Points</p>
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
                      <h2 className="text-2xl font-bold text-slate-100 mb-6">{category}</h2>
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
                                  ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 shadow-lg'
                                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                              }`}>
                                <div className="text-center">
                                  <div className={`text-5xl mb-4 ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                                    {achievement.icon}
                                  </div>
                                  <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-green-300' : 'text-slate-300'}`}>
                                    {achievement.title}
                                  </h3>
                                  <p className="text-sm text-slate-400 mb-4">{achievement.description}</p>
                                  
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge variant={isUnlocked ? 'default' : 'secondary'} className="text-xs">
                                      {achievement.points} pts
                                    </Badge>
                                    {isUnlocked && (
                                      <div className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-green-400 font-medium">Unlocked!</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  {!isUnlocked && progress && (
                                    <div>
                                      <div className="flex justify-between text-xs text-slate-400 mb-2">
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
                color="text-orange-400"
              />
              <StatCard
                title="Total Study Time"
                value={progressData.overall.totalStudyTime}
                change={progressData.overall.improvement}
                icon={Clock}
                color="text-blue-400"
              />
              <StatCard
                title="Questions Answered"
                value={progressData.overall.questionsAnswered}
                icon={Target}
                color="text-green-400"
              />
              <StatCard
                title="Overall Accuracy"
                value={`${progressData.overall.accuracy}%`}
                change={progressData.overall.improvement}
                icon={TrendingUp}
                color="text-purple-400"
              />
            </motion.div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">Performance Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Current Rank</span>
                      <Badge variant="default" className="bg-purple-600">
                        {progressData.overall.rank}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Questions Answered</span>
                      <span className="text-slate-100">{progressData.overall.questionsAnswered}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Average Accuracy</span>
                      <span className="text-green-400">{progressData.overall.accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Study Streak</span>
                      <span className="text-orange-400">{progressData.overall.studyStreak} days</span>
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
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Subject Progress</h2>
              <div className="space-y-6">
                {progressData.subjects.map((subject, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">{subject.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
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
                        <div className="text-2xl font-bold text-slate-100">{subject.progress}%</div>
                        <div className="text-sm text-slate-400">Complete</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                          className={`bg-gradient-to-r ${subject.color} h-3 rounded-full`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Strong Topics */}
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Strong Topics
                        </h4>
                        <div className="space-y-1">
                          {subject.strongTopics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-green-400 border-green-400">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Weak Topics */}
                      <div>
                        <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Needs Work
                        </h4>
                        <div className="space-y-1">
                          {subject.weakTopics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-orange-400 border-orange-400">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Last studied: {subject.lastStudied}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Recent Achievements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {progressData.achievements.displayList.map((achievement) => (
                  <Card key={achievement.id} className={`p-6 ${achievement.earned ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-slate-700'}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold text-slate-200 mb-2">{achievement.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{achievement.description}</p>
                      {achievement.earned ? (
                        <Badge variant="default" className="bg-yellow-600">
                          Earned {achievement.earnedDate}
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400">
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
              <h2 className="text-2xl font-bold text-slate-100 mb-6">AI Recommendations</h2>
              <div className="space-y-4">
                {progressData.recommendations.map((rec, index) => (
                  <Card key={index} className="p-6 hover:bg-slate-800/50 cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {rec.type === 'weakness' ? <AlertCircle className="w-5 h-5" /> :
                           rec.type === 'review' ? <BookOpen className="w-5 h-5" /> :
                           <Star className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-200">{rec.subject} - {rec.topic}</h3>
                          <p className="text-slate-400">{rec.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.priority} priority
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
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
              <BarChart3 className="w-24 h-24 text-slate-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-200 mb-4">
                Track Your Learning Progress
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Sign up for a free account to access detailed analytics, personalized insights, 
                and AI-powered recommendations to accelerate your AP exam preparation.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="p-4 bg-purple-500/20 rounded-lg w-fit mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">Performance Tracking</h3>
                  <p className="text-sm text-slate-400">
                    Monitor your accuracy and improvement over time
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-blue-500/20 rounded-lg w-fit mx-auto mb-3">
                    <Brain className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">AI Insights</h3>
                  <p className="text-sm text-slate-400">
                    Get personalized recommendations and study plans
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-green-500/20 rounded-lg w-fit mx-auto mb-3">
                    <Award className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">Achievements</h3>
                  <p className="text-sm text-slate-400">
                    Earn badges and celebrate your learning milestones
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"
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
