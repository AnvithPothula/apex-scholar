import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Calendar, TrendingUp, Award, Target, BookOpen, Brain, Calculator, Zap, Clock, BarChart3, Medal, Crown, Flame, CheckCircle, AlertCircle, ChevronRight, Filter, Download } from 'lucide-react';
import { Card, Button, Badge, Progress } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AP_SUBJECTS } from '../constants/subjects';
import { cn } from '../utils/helpers';
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

  const processSubjectProgress = (progressData, studySessions) => {
    const subjectMap = new Map();

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
        strongTopics: ['Advanced Concepts', 'Problem Solving'],
        weakTopics: ['Basic Fundamentals', 'Time Management'],
        lastStudied: allSessions.length > 0 ? 'Recently' : 'Never',
        streak: Math.min(10, allSessions.length),
        color: colors[index % colors.length]
      };
    }).slice(0, 5);
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
    const allAchievements = achievementsService.getAllAchievements();
    const unlockedAchievements = achievements.unlockedAchievements || [];

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
      unlocked: unlockedAchievements,
      totalPoints: achievements.totalPoints || 0,
      activityCounters: achievements.activityCounters || {},
      studyStreaks: achievements.studyStreaks || {},
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
          action: 'Start with any AP subject to build your baseline.',
          priority: 'high'
        }
      ];
    }

    try {
      const analysis = await geminiService.analyzeStudentProgress(
        progressData.map(p => p.subject || 'Unknown'),
        studySessions,
        ['Time Management', 'Consistency']
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
          action: 'Keep a consistent daily study schedule.',
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
    achievements: { unlocked: [], totalPoints: 0, activityCounters: {}, studyStreaks: {}, displayList: [] },
    recommendations: []
  });

  // ─── Internal Components ──────────────────────────────────────────

  const colorToVar = (bgClass) => ({
    'bg-primary-500': 'var(--color-primary-400)',
    'bg-success-500': 'var(--color-success-400)',
    'bg-error-500':   'var(--color-error-400)',
    'bg-warning-500': 'var(--color-warning-400)',
  }[bgClass] || 'var(--color-primary-400)');

  const BentoStatCard = ({ icon: Icon, label, value, change, color = "text-primary-400", iconBg = "bg-base-800" }) => (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-2 rounded-sm", iconBg)}>
          <Icon className={cn("w-4 h-4", color)} strokeWidth={1.5} />
        </div>
        <span className="text-caption text-content-muted">{label}</span>
      </div>
      <div>
        <p className="text-h2 font-display text-content-primary">{value}</p>
        {change && (
          <p className={cn("text-caption mt-1", change.startsWith('+') && change !== '+0%' ? 'text-success-400' : 'text-content-muted')}>
            {change} vs. last month
          </p>
        )}
      </div>
    </Card>
  );

  const CircularProgressRing = ({ percentage, size = 72, strokeW = 5, color = "var(--color-primary-500)" }) => {
    const r = (size - strokeW) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percentage / 100) * circ;
    const c = size / 2;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-base-800)" strokeWidth={strokeW} />
        <motion.circle
          cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    );
  };

  const WeeklyActivityChart = ({ data }) => {
    const maxQ = Math.max(...data.map(d => d.questions), 1);
    const W = 100;
    const H = 60;
    const pad = { top: 8, right: 4, bottom: 2, left: 4 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const pts = data.map((d, i) => ({
      x: pad.left + (i / Math.max(data.length - 1, 1)) * cw,
      y: pad.top + ch - (d.questions / maxQ) * ch,
      ...d
    }));

    const linePath = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${pad.top + ch} L ${pts[0].x} ${pad.top + ch} Z`;

    return (
      <Card className="p-6">
        <h3 className="text-h4 font-display text-content-primary mb-4">Weekly Activity</h3>
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-400)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--color-primary-400)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Subtle grid lines */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <line
                key={frac}
                x1={pad.left} y1={pad.top + ch * (1 - frac)}
                x2={W - pad.right} y2={pad.top + ch * (1 - frac)}
                stroke="var(--color-border-subtle)" strokeWidth="0.2" strokeDasharray="1 1"
              />
            ))}

            {/* Gradient area fill */}
            <motion.path
              d={areaPath}
              fill="url(#areaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Line stroke */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--color-primary-400)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            />

            {/* Data points */}
            {pts.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x} cy={p.y} r="1"
                fill="var(--color-primary-400)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              />
            ))}
          </svg>

          {/* X-axis day labels */}
          <div className="flex justify-between mt-2 px-1">
            {data.map((d, i) => (
              <span key={i} className="chart-label text-center">{d.day}</span>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // Skeleton that mirrors the bento layout structure
  const DashboardSkeleton = () => (
    <div className="py-4 space-y-8">
      {/* Tab bar skeleton */}
      <div className="flex justify-center">
        <div className="animate-pulse flex gap-1 bg-base-850 p-1 rounded-xl">
          <div className="h-9 w-24 bg-base-800 rounded-lg" />
          <div className="h-9 w-28 bg-base-800 rounded-lg" />
        </div>
      </div>

      {/* Bento stat grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        <div className="md:col-span-1 md:row-span-2 lg:col-span-2 lg:row-span-2 bg-base-850 border border-border rounded-md p-6">
          <div className="h-4 w-24 bg-base-800 rounded mb-6" />
          <div className="h-12 w-20 bg-base-800 rounded mb-3" />
          <div className="h-4 w-32 bg-base-800 rounded" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-base-850 border border-border rounded-md p-5">
            <div className="h-3 w-16 bg-base-800 rounded mb-4" />
            <div className="h-7 w-20 bg-base-800 rounded" />
          </div>
        ))}
      </div>

      {/* Chart + performance skeleton */}
      <div className="grid md:grid-cols-2 gap-6 animate-pulse">
        <div className="bg-base-850 border border-border rounded-md p-6">
          <div className="h-4 w-32 bg-base-800 rounded mb-4" />
          <div className="h-40 bg-base-800 rounded" />
        </div>
        <div className="bg-base-850 border border-border rounded-md p-6">
          <div className="h-4 w-28 bg-base-800 rounded mb-6" />
          <div className="space-y-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-28 bg-base-800 rounded" />
                <div className="h-3 w-16 bg-base-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject card skeletons */}
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="bg-base-850 border border-border rounded-md p-6 flex gap-5">
            <div className="w-[72px] h-[72px] bg-base-800 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-40 bg-base-800 rounded mb-3" />
              <div className="h-3 w-56 bg-base-800 rounded mb-4" />
              <div className="flex gap-1.5">
                <div className="h-5 w-24 bg-base-800 rounded-sm" />
                <div className="h-5 w-20 bg-base-800 rounded-sm" />
                <div className="h-5 w-28 bg-base-800 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────

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
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-base-950" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary font-display">
                Progress
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-content-secondary">
              Your study analytics, achievements, and AI recommendations.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="hidden md:flex">
              <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
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
          <DashboardSkeleton />
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
                            className: `w-8 h-8 ${getRankInfo(progressData.overall.totalPoints).color}`,
                            strokeWidth: 1.5
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
                                        <Trophy className="w-4 h-4 text-success-400" strokeWidth={1.5} />
                                        <span className="text-xs text-success-400 font-medium">Unlocked</span>
                                      </div>
                                    )}
                                  </div>

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
                {/* ── Bento Stat Grid ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                  {/* Hero: Study Streak (spans 2×2 on lg) */}
                  <Card className="p-6 md:col-span-1 md:row-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between bg-primary-950 border-primary-700/30">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-accent-900 rounded-sm">
                          <Zap className="w-5 h-5 text-accent-400" strokeWidth={1.5} />
                        </div>
                        <span className="text-caption text-content-muted uppercase tracking-wider">Study Streak</span>
                      </div>
                      <p className="text-display font-display text-content-primary">
                        {progressData.overall.studyStreak}
                      </p>
                      <p className="text-h3 text-content-secondary font-body">days in a row</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-accent-400" strokeWidth={1.5} />
                        <span className="text-body-sm text-content-muted">Keep it going tomorrow</span>
                      </div>
                    </div>
                  </Card>

                  {/* Study Time */}
                  <BentoStatCard
                    icon={Clock}
                    label="Study Time"
                    value={progressData.overall.totalStudyTime}
                    change={progressData.overall.improvement}
                    color="text-primary-400"
                    iconBg="bg-primary-900"
                  />

                  {/* Questions */}
                  <BentoStatCard
                    icon={Target}
                    label="Questions"
                    value={progressData.overall.questionsAnswered}
                    color="text-success-400"
                    iconBg="bg-success-900"
                  />

                  {/* Accuracy */}
                  <BentoStatCard
                    icon={TrendingUp}
                    label="Accuracy"
                    value={`${progressData.overall.accuracy}%`}
                    change={progressData.overall.improvement}
                    color="text-primary-400"
                    iconBg="bg-primary-900"
                  />
                </motion.div>

                {/* ── Charts Section ── */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  {/* Weekly Activity Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <WeeklyActivityChart data={progressData.weeklyActivity} />
                  </motion.div>

                  {/* At a Glance */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="p-6">
                      <h3 className="text-h4 font-display text-content-primary mb-4">At a Glance</h3>
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

                {/* ── Subject Progress (Circular Rings + Tag Cloud) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold text-content-primary mb-6">By Subject</h2>
                  <div className="space-y-4">
                    {progressData.subjects.map((subject, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <Card className="p-6">
                          <div className="flex items-start gap-5">
                            {/* Circular Progress Ring */}
                            <div className="relative flex-shrink-0">
                              <CircularProgressRing
                                percentage={subject.progress}
                                color={colorToVar(subject.color)}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-body-sm font-semibold text-content-primary transform rotate-0"
                                  style={{ transform: 'rotate(90deg)' }}
                                >
                                  {subject.progress}%
                                </span>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="text-h4 font-display text-content-primary">{subject.name}</h3>
                                <Button size="sm" className="bg-primary-500 hover:bg-primary-600 flex-shrink-0 ml-4">
                                  Continue
                                </Button>
                              </div>
                              <div className="flex items-center gap-3 text-caption text-content-muted mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  {subject.timeSpent}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  {subject.questionsAnswered} questions
                                </span>
                              </div>

                              {/* Organic tag cloud */}
                              <div className="flex flex-wrap gap-1.5">
                                {subject.strongTopics.map((topic, idx) => (
                                  <Badge key={`s-${idx}`} variant="success" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                                {subject.weakTopics.map((topic, idx) => (
                                  <Badge key={`w-${idx}`} variant="warning" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* ── Recent Achievements ── */}
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

                {/* ── Recommended Next ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-content-primary mb-6">Recommended Next</h2>
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
                              {rec.type === 'weakness' ? <AlertCircle className="w-5 h-5" strokeWidth={1.5} /> :
                               rec.type === 'review' ? <BookOpen className="w-5 h-5" strokeWidth={1.5} /> :
                               <Star className="w-5 h-5" strokeWidth={1.5} />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-content-primary">{rec.subject} — {rec.topic}</h3>
                              <p className="text-content-muted">{rec.action}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rec.priority}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
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
          /* ── Not Logged In: Blurred Mock Dashboard ── */
          <div className="relative min-h-[60vh]">
            {/* Blurred decorative mock */}
            <div className="select-none pointer-events-none" aria-hidden="true">
              <div className="filter blur-[6px] opacity-50">
                {/* Mock bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="md:col-span-1 md:row-span-2 lg:col-span-2 lg:row-span-2 bg-base-850 border border-border rounded-md p-6">
                    <div className="h-4 w-24 bg-base-800 rounded mb-6" />
                    <div className="h-12 w-16 bg-base-800 rounded mb-3" />
                    <div className="h-4 w-32 bg-base-800 rounded" />
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-base-850 border border-border rounded-md p-5">
                      <div className="h-3 w-16 bg-base-800 rounded mb-4" />
                      <div className="h-7 w-20 bg-base-800 rounded" />
                    </div>
                  ))}
                </div>
                {/* Mock chart area */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-base-850 border border-border rounded-md p-6 h-48" />
                  <div className="bg-base-850 border border-border rounded-md p-6 h-48" />
                </div>
                {/* Mock subject cards */}
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-base-850 border border-border rounded-md p-6 flex gap-5">
                      <div className="w-[72px] h-[72px] bg-base-800 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-5 w-40 bg-base-800 rounded mb-3" />
                        <div className="h-3 w-56 bg-base-800 rounded mb-4" />
                        <div className="flex gap-1.5">
                          <div className="h-5 w-24 bg-base-800 rounded-sm" />
                          <div className="h-5 w-20 bg-base-800 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay login prompt */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative max-w-md w-full mx-4"
              >
                <div className="empty-state-pattern" />
                <Card className="relative z-10 p-8 text-center bg-base-850/95 backdrop-blur-sm border-border-strong shadow-floating">
                  <div className="p-3 bg-primary-900 rounded-md w-fit mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-primary-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-h2 font-display text-content-primary mb-2">
                    See your progress
                  </h2>
                  <p className="text-body text-content-secondary mb-6">
                    Create a free account to unlock analytics, AI study recommendations, and achievement tracking.
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-primary-500 hover:bg-primary-600 w-full"
                    size="lg"
                  >
                    Get started
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
