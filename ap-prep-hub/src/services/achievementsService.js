import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

class AchievementsService {
  constructor() {
    this.achievements = {
      // Study Streaks
      FIRST_STUDY: {
        id: 'first_study',
        title: 'First Steps',
        description: 'Complete your first study session',
        icon: '🎯',
        category: 'Getting Started',
        points: 10,
        requirement: { type: 'count', target: 1, activity: 'study_session' }
      },
      WEEK_STREAK: {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        category: 'Consistency',
        points: 50,
        requirement: { type: 'streak', target: 7, activity: 'daily_study' }
      },
      MONTH_STREAK: {
        id: 'month_streak',
        title: 'Monthly Master',
        description: 'Study for 30 consecutive days',
        icon: '💪',
        category: 'Consistency',
        points: 200,
        requirement: { type: 'streak', target: 30, activity: 'daily_study' }
      },

      // Flashcards
      FIRST_FLASHCARD: {
        id: 'first_flashcard',
        title: 'Card Creator',
        description: 'Create your first flashcard deck',
        icon: '📚',
        category: 'Flashcards',
        points: 15,
        requirement: { type: 'count', target: 1, activity: 'create_flashcard_deck' }
      },
      FLASHCARD_MASTER: {
        id: 'flashcard_master',
        title: 'Flashcard Master',
        description: 'Study 100 flashcards',
        icon: '🧠',
        category: 'Flashcards',
        points: 75,
        requirement: { type: 'count', target: 100, activity: 'study_flashcard' }
      },
      PERFECT_DECK: {
        id: 'perfect_deck',
        title: 'Perfect Recall',
        description: 'Get 100% accuracy on a flashcard deck',
        icon: '💯',
        category: 'Flashcards',
        points: 100,
        requirement: { type: 'achievement', target: 'perfect_deck_completion' }
      },

      // Practice Tests
      FIRST_TEST: {
        id: 'first_test',
        title: 'Test Taker',
        description: 'Complete your first practice test',
        icon: '📝',
        category: 'Practice Tests',
        points: 25,
        requirement: { type: 'count', target: 1, activity: 'complete_practice_test' }
      },
      HIGH_SCORER: {
        id: 'high_scorer',
        title: 'High Scorer',
        description: 'Score 90% or higher on a practice test',
        icon: '⭐',
        category: 'Practice Tests',
        points: 100,
        requirement: { type: 'score', target: 90, activity: 'practice_test_score' }
      },
      TEST_VETERAN: {
        id: 'test_veteran',
        title: 'Test Veteran',
        description: 'Complete 10 practice tests',
        icon: '🏆',
        category: 'Practice Tests',
        points: 150,
        requirement: { type: 'count', target: 10, activity: 'complete_practice_test' }
      },

      // AI Tutors
      FIRST_CHAT: {
        id: 'first_chat',
        title: 'AI Explorer',
        description: 'Have your first conversation with an AI tutor',
        icon: '🤖',
        category: 'AI Tutors',
        points: 10,
        requirement: { type: 'count', target: 1, activity: 'ai_chat_message' }
      },
      CONVERSATIONALIST: {
        id: 'conversationalist',
        title: 'Conversationalist',
        description: 'Send 50 messages to AI tutors',
        icon: '💬',
        category: 'AI Tutors',
        points: 75,
        requirement: { type: 'count', target: 50, activity: 'ai_chat_message' }
      },

      // Problem Solver
      FIRST_SOLUTION: {
        id: 'first_solution',
        title: 'Problem Solver',
        description: 'Solve your first problem with AI Solver',
        icon: '🔧',
        category: 'Problem Solving',
        points: 20,
        requirement: { type: 'count', target: 1, activity: 'solve_problem' }
      },
      SOLVER_EXPERT: {
        id: 'solver_expert',
        title: 'Solver Expert',
        description: 'Solve 25 problems with AI Solver',
        icon: '🎓',
        category: 'Problem Solving',
        points: 125,
        requirement: { type: 'count', target: 25, activity: 'solve_problem' }
      },

      // Subject Mastery
      SUBJECT_EXPLORER: {
        id: 'subject_explorer',
        title: 'Subject Explorer',
        description: 'Study 3 different AP subjects',
        icon: '🌟',
        category: 'Subject Mastery',
        points: 50,
        requirement: { type: 'unique_count', target: 3, activity: 'study_subject' }
      },
      POLYMATH: {
        id: 'polymath',
        title: 'Polymath',
        description: 'Study 5 different AP subjects',
        icon: '🧑‍🎓',
        category: 'Subject Mastery',
        points: 150,
        requirement: { type: 'unique_count', target: 5, activity: 'study_subject' }
      },

      // Special Achievements
      EARLY_BIRD: {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Study before 8 AM',
        icon: '🌅',
        category: 'Special',
        points: 30,
        requirement: { type: 'time_based', target: 'before_8am', activity: 'study_session' }
      },
      NIGHT_OWL: {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        category: 'Special',
        points: 30,
        requirement: { type: 'time_based', target: 'after_10pm', activity: 'study_session' }
      },
      WEEKEND_WARRIOR: {
        id: 'weekend_warrior',
        title: 'Weekend Warrior',
        description: 'Study on both Saturday and Sunday',
        icon: '⚔️',
        category: 'Special',
        points: 40,
        requirement: { type: 'weekend_study', target: 'both_days' }
      }
    };
  }

  // Get user's achievements and progress
  async getUserAchievements(userId) {
    try {
      const userAchievementsRef = doc(db, 'userAchievements', userId);
      const userAchievementsDoc = await getDoc(userAchievementsRef);
      
      if (userAchievementsDoc.exists()) {
        return userAchievementsDoc.data();
      } else {
        // Initialize user achievements. userId is required by firestore.rules
        // on create (allow create: request.resource.data.userId == auth.uid);
        // omitting it made the very first write fail.
        const initialData = {
          userId,
          unlockedAchievements: [],
          progress: {},
          totalPoints: 0,
          lastUpdated: new Date(),
          activityCounters: {},
          studyStreaks: {
            current: 0,
            longest: 0,
            lastStudyDate: null
          }
        };
        
        await setDoc(userAchievementsRef, initialData);
        return initialData;
      }
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  // Track an activity and check for achievements
  async trackActivity(userId, activity, data = {}) {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      const updates = {
        lastUpdated: new Date()
      };
      
      // Update activity counters
      const activityCounters = userAchievements.activityCounters || {};
      
      switch (activity) {
        case 'study_session':
          activityCounters.study_session = (activityCounters.study_session || 0) + 1;
          updates.studyStreaks = this.updateStudyStreak(userAchievements.studyStreaks || {});
          break;
          
        case 'create_flashcard_deck':
          activityCounters.create_flashcard_deck = (activityCounters.create_flashcard_deck || 0) + 1;
          break;
          
        case 'study_flashcard':
          activityCounters.study_flashcard = (activityCounters.study_flashcard || 0) + (data.count || 1);
          break;
          
        case 'complete_practice_test':
          activityCounters.complete_practice_test = (activityCounters.complete_practice_test || 0) + 1;
          if (data.score >= 90) {
            await this.unlockAchievement(userId, 'HIGH_SCORER');
          }
          break;
          
        case 'ai_chat_message':
          activityCounters.ai_chat_message = (activityCounters.ai_chat_message || 0) + 1;
          break;
          
        case 'solve_problem':
          activityCounters.solve_problem = (activityCounters.solve_problem || 0) + 1;
          break;
          
        case 'study_subject':
          if (!activityCounters.study_subjects) {
            activityCounters.study_subjects = new Set();
          }
          if (Array.isArray(activityCounters.study_subjects)) {
            activityCounters.study_subjects = new Set(activityCounters.study_subjects);
          }
          activityCounters.study_subjects.add(data.subject);
          // Convert Set back to Array for Firestore
          activityCounters.study_subjects = Array.from(activityCounters.study_subjects);
          break;
      }
      
      updates.activityCounters = activityCounters;
      
      // Check for newly unlocked achievements
      const newAchievements = await this.checkAchievements(userId, activityCounters, updates.studyStreaks, data);
      
      if (newAchievements.length > 0) {
        updates.unlockedAchievements = [
          ...(userAchievements.unlockedAchievements || []),
          ...newAchievements
        ];
        
        // Calculate total points
        const totalPoints = updates.unlockedAchievements.reduce((sum, achievementId) => {
          return sum + (this.achievements[achievementId]?.points || 0);
        }, 0);
        updates.totalPoints = totalPoints;
      }
      
      // Update in Firestore
      const userAchievementsRef = doc(db, 'userAchievements', userId);
      await updateDoc(userAchievementsRef, updates);
      
      return newAchievements;
      
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  }

  // Update study streak
  updateStudyStreak(streaks) {
    const today = new Date().toDateString();
    const lastStudyDate = streaks.lastStudyDate ? new Date(streaks.lastStudyDate.seconds * 1000).toDateString() : null;
    
    if (lastStudyDate === today) {
      // Already studied today, no change
      return streaks;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastStudyDate === yesterdayString) {
      // Continuing streak
      streaks.current = (streaks.current || 0) + 1;
    } else {
      // Starting new streak
      streaks.current = 1;
    }
    
    // Update longest streak
    streaks.longest = Math.max(streaks.longest || 0, streaks.current);
    streaks.lastStudyDate = new Date();
    
    return streaks;
  }

  // Check which achievements should be unlocked
  async checkAchievements(userId, activityCounters, studyStreaks, activityData) {
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedIds = userAchievements.unlockedAchievements || [];
    const newAchievements = [];
    
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (unlockedIds.includes(achievement.id)) {
        continue; // Already unlocked
      }
      
      const req = achievement.requirement;
      let shouldUnlock = false;
      
      switch (req.type) {
        case 'count':
          const count = activityCounters[req.activity] || 0;
          shouldUnlock = count >= req.target;
          break;
          
        case 'streak':
          if (req.activity === 'daily_study') {
            shouldUnlock = (studyStreaks?.current || 0) >= req.target;
          }
          break;
          
        case 'unique_count':
          if (req.activity === 'study_subject') {
            const subjects = activityCounters.study_subjects || [];
            shouldUnlock = subjects.length >= req.target;
          }
          break;
          
        case 'score':
          if (req.activity === 'practice_test_score' && activityData.score) {
            shouldUnlock = activityData.score >= req.target;
          }
          break;
          
        case 'time_based':
          if (req.activity === 'study_session') {
            const hour = new Date().getHours();
            if (req.target === 'before_8am' && hour < 8) {
              shouldUnlock = true;
            } else if (req.target === 'after_10pm' && hour >= 22) {
              shouldUnlock = true;
            }
          }
          break;
          
        case 'weekend_study':
          // This would need more complex tracking - simplified for now
          const day = new Date().getDay();
          if (day === 0 || day === 6) { // Sunday or Saturday
            shouldUnlock = true;
          }
          break;
          
        case 'achievement':
          // Special achievement conditions
          if (req.target === 'perfect_deck_completion' && activityData.perfectScore) {
            shouldUnlock = true;
          }
          break;
      }
      
      if (shouldUnlock) {
        newAchievements.push(achievement.id);
      }
    }
    
    return newAchievements;
  }

  // Unlock a specific achievement
  async unlockAchievement(userId, achievementKey) {
    try {
      const achievement = this.achievements[achievementKey];
      if (!achievement) return false;
      
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = userAchievements.unlockedAchievements || [];
      
      if (unlockedIds.includes(achievement.id)) {
        return false; // Already unlocked
      }
      
      unlockedIds.push(achievement.id);
      const totalPoints = unlockedIds.reduce((sum, id) => {
        const ach = Object.values(this.achievements).find(a => a.id === id);
        return sum + (ach?.points || 0);
      }, 0);
      
      const userAchievementsRef = doc(db, 'userAchievements', userId);
      await updateDoc(userAchievementsRef, {
        unlockedAchievements: unlockedIds,
        totalPoints: totalPoints,
        lastUpdated: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Get achievement details by ID
  getAchievementById(id) {
    return Object.values(this.achievements).find(achievement => achievement.id === id);
  }

  // Get all achievements grouped by category
  getAchievementsByCategory() {
    const categories = {};
    
    Object.values(this.achievements).forEach(achievement => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = [];
      }
      categories[achievement.category].push(achievement);
    });
    
    return categories;
  }

  // Get user's progress toward specific achievement
  getAchievementProgress(userId, achievementId, activityCounters, studyStreaks) {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement) return null;
    
    const req = achievement.requirement;
    let current = 0;
    let target = req.target;
    
    switch (req.type) {
      case 'count':
        current = activityCounters[req.activity] || 0;
        break;
      case 'streak':
        if (req.activity === 'daily_study') {
          current = studyStreaks?.current || 0;
        }
        break;
      case 'unique_count':
        if (req.activity === 'study_subject') {
          current = (activityCounters.study_subjects || []).length;
        }
        break;
      default:
        return null; // Progress not trackable for this type
    }
    
    return {
      current: Math.min(current, target),
      target,
      percentage: Math.min((current / target) * 100, 100)
    };
  }

  // Get all achievements
  getAllAchievements() {
    return this.achievements;
  }

  // Track progress for achievements
  async trackProgress(userId, achievementId, metadata = {}) {
    try {
      // Get current user achievements
      const userAchievements = await this.getUserAchievements(userId);
      
      // If already unlocked, no need to track
      if (userAchievements.unlockedAchievements.includes(achievementId)) {
        return;
      }

      // Update activity counters based on achievement type
      const achievement = this.getAchievementById(achievementId);
      if (!achievement) {
        console.warn(`Achievement ${achievementId} not found`);
        return;
      }

      const activityCounters = { ...userAchievements.activityCounters };
      const studyStreaks = { ...userAchievements.studyStreaks };

      // Update counters based on achievement requirement
      const req = achievement.requirement;
      switch (req.activity) {
        case 'study_subject':
          if (!activityCounters.study_subjects) {
            activityCounters.study_subjects = [];
          }
          if (metadata.subject && !activityCounters.study_subjects.includes(metadata.subject)) {
            activityCounters.study_subjects.push(metadata.subject);
          }
          break;
        case 'study_session':
          activityCounters.study_session = (activityCounters.study_session || 0) + 1;
          break;
        case 'create_flashcard_deck':
          activityCounters.create_flashcard_deck = (activityCounters.create_flashcard_deck || 0) + 1;
          break;
        case 'solve_problem':
          activityCounters.solve_problem = (activityCounters.solve_problem || 0) + 1;
          break;
        default:
          // Generic counter increment
          activityCounters[req.activity] = (activityCounters[req.activity] || 0) + 1;
      }

      // Check if achievement should be unlocked
      const progress = this.getAchievementProgress(userId, achievementId, activityCounters, studyStreaks);
      const shouldUnlock = progress && progress.current >= progress.target;

      const updatedData = {
        activityCounters,
        studyStreaks,
        unlockedAchievements: shouldUnlock 
          ? [...userAchievements.unlockedAchievements, achievementId]
          : userAchievements.unlockedAchievements,
        totalPoints: shouldUnlock 
          ? (userAchievements.totalPoints || 0) + achievement.points
          : userAchievements.totalPoints || 0
      };

      // Save to Firebase
      const userAchievementsRef = doc(db, 'userAchievements', userId);
      await updateDoc(userAchievementsRef, {
        ...updatedData,
        lastUpdated: new Date()
      });

      // Log achievement unlock
      if (shouldUnlock) {
        console.log(`🎉 Achievement unlocked: ${achievement.title}`);
      }

    } catch (error) {
      console.error('Error tracking achievement progress:', error);
    }
  }
}

const achievementsService = new AchievementsService();
export default achievementsService;
