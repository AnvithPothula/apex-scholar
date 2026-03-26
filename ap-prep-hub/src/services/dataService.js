import { db } from '../config/firebase';
import errorLogger from '../utils/errorLogger';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

class DataService {
  constructor() {
    this.db = db;
  }

  // User Progress Management
  async saveUserProgress(userId, subject, progressData) {
    try {
      const progressRef = doc(this.db, 'userProgress', `${userId}_${subject}`);
      await updateDoc(progressRef, {
        ...progressData,
        lastUpdated: serverTimestamp(),
        subject
      });
    } catch (error) {
      // If document doesn't exist, create it
      await addDoc(collection(this.db, 'userProgress'), {
        userId,
        subject,
        ...progressData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    }
  }

  async getUserProgress(userId, subject = null) {
    try {
      if (subject) {
        const progressDoc = await getDoc(doc(this.db, 'userProgress', `${userId}_${subject}`));
        return progressDoc.exists() ? progressDoc.data() : null;
      } else {
        const q = query(
          collection(this.db, 'userProgress'),
          where('userId', '==', userId),
          orderBy('lastUpdated', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return subject ? null : [];
    }
  }

  // Flashcards Management
  async saveFlashcardDeck(userId, deckData) {
    try {
      const deckRef = await addDoc(collection(this.db, 'flashcardDecks'), {
        userId,
        ...deckData,
        creatorName: deckData.creatorName || '',
        isPublic: deckData.isPublic || false,
        createdAt: serverTimestamp(),
        lastStudied: null,
        progress: 0
      });
      return deckRef.id;
    } catch (error) {
      console.error('Error saving flashcard deck:', error);
      throw error;
    }
  }

  async getUserFlashcardDecks(userId) {
    try {
      const q = query(
        collection(this.db, 'flashcardDecks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching flashcard decks:', error);
      return [];
    }
  }

  async updateFlashcardProgress(deckId, progressData) {
    try {
      const deckRef = doc(this.db, 'flashcardDecks', deckId);
      await updateDoc(deckRef, {
        ...progressData,
        lastStudied: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating flashcard progress:', error);
      throw error;
    }
  }

  async deleteFlashcardDeck(deckId) {
    try {
      await deleteDoc(doc(this.db, 'flashcardDecks', deckId));
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      throw error;
    }
  }

  async updateFlashcardDeck(deckId, deckData) {
    try {
      const deckRef = doc(this.db, 'flashcardDecks', deckId);
      // Remove fields that shouldn't be overwritten
      const { id, originalId, createdAt, lastStudied: _ls, ...updateData } = deckData;
      await updateDoc(deckRef, {
        ...updateData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating flashcard deck:', error);
      throw error;
    }
  }

  async toggleFlashcardVisibility(deckId, isPublic) {
    try {
      const deckRef = doc(this.db, 'flashcardDecks', deckId);
      await updateDoc(deckRef, { isPublic, lastUpdated: serverTimestamp() });
    } catch (error) {
      console.error('Error toggling flashcard visibility:', error);
      throw error;
    }
  }

  async searchPublicFlashcardDecks(searchTerm = '', subjectFilter = '') {
    try {
      // Query all public decks
      const q = query(
        collection(this.db, 'flashcardDecks'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(50)
      );
      const snapshot = await getDocs(q);
      let decks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Batch-fetch creator display names for decks missing creatorName
      const missingUserIds = [...new Set(decks.filter(d => !d.creatorName && d.userId).map(d => d.userId))];
      if (missingUserIds.length > 0) {
        const nameMap = {};
        // Firestore 'in' queries support up to 30 items
        for (let i = 0; i < missingUserIds.length; i += 30) {
          const batch = missingUserIds.slice(i, i + 30);
          try {
            const usersSnapshot = await getDocs(query(collection(this.db, 'users'), where('__name__', 'in', batch)));
            usersSnapshot.docs.forEach(doc => {
              const data = doc.data();
              nameMap[doc.id] = data.displayName || data.name || 'Anonymous';
            });
          } catch (e) { errorLogger.debug('Batch user name fetch failed', { error: e?.message }); }
        }
        decks = decks.map(d => ({
          ...d,
          creatorName: d.creatorName || nameMap[d.userId] || 'Anonymous'
        }));
      }

      // Client-side filtering for search term and subject
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        decks = decks.filter(d =>
          (d.title || '').toLowerCase().includes(lower) ||
          (d.topic || '').toLowerCase().includes(lower) ||
          (d.description || '').toLowerCase().includes(lower) ||
          (d.subject || '').toLowerCase().includes(lower) ||
          (d.creatorName || '').toLowerCase().includes(lower)
        );
      }
      if (subjectFilter) {
        decks = decks.filter(d => d.subject === subjectFilter);
      }

      return decks;
    } catch (error) {
      console.error('Error searching public flashcard decks:', error);
      return [];
    }
  }

  async copyPublicDeckToUser(userId, sourceDeck) {
    try {
      const newDeck = {
        title: sourceDeck.title,
        subject: sourceDeck.subject || 'General',
        topic: sourceDeck.topic || '',
        cards: sourceDeck.cards || [],
        cardCount: sourceDeck.cardCount || (sourceDeck.cards || []).length,
        difficulty: sourceDeck.difficulty || 'Medium',
        description: sourceDeck.description || '',
        progress: 0,
        isPublic: false,
        copiedFrom: sourceDeck.id,
        copiedFromUser: sourceDeck.userId || null,
      };
      return await this.saveFlashcardDeck(userId, newDeck);
    } catch (error) {
      console.error('Error copying public deck:', error);
      throw error;
    }
  }

  // Study Sessions Management
  async saveStudySession(userId, sessionData) {
    try {
      await addDoc(collection(this.db, 'studySessions'), {
        userId,
        ...sessionData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving study session:', error);
      throw error;
    }
  }

  async getUserStudySessions(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const q = query(
        collection(this.db, 'studySessions'),
        where('userId', '==', userId),
        where('timestamp', '>=', cutoffDate),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      return [];
    }
  }

  // Diagnostic Results Management
  async saveDiagnosticResult(userId, resultData) {
    try {
      await addDoc(collection(this.db, 'diagnosticResults'), {
        userId,
        ...resultData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving diagnostic result:', error);
      throw error;
    }
  }

  async getUserDiagnosticResults(userId, subject = null) {
    try {
      let q = query(
        collection(this.db, 'diagnosticResults'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      if (subject) {
        q = query(
          collection(this.db, 'diagnosticResults'),
          where('userId', '==', userId),
          where('subject', '==', subject),
          orderBy('timestamp', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching diagnostic results:', error);
      return [];
    }
  }

  // Solver History Management
  async saveSolverHistory(userId, problemData) {
    try {
      await addDoc(collection(this.db, 'solverHistory'), {
        userId,
        ...problemData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving solver history:', error);
      throw error;
    }
  }

  async getUserSolverHistory(userId, limitCount = 20) {
    try {
      const q = query(
        collection(this.db, 'solverHistory'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching solver history:', error);
      return [];
    }
  }

  // Achievements Management
  async saveUserAchievement(userId, achievementData) {
    try {
      await addDoc(collection(this.db, 'userAchievements'), {
        userId,
        ...achievementData,
        earnedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving achievement:', error);
      throw error;
    }
  }

  async getUserAchievements(userId) {
    try {
      const q = query(
        collection(this.db, 'userAchievements'),
        where('userId', '==', userId),
        orderBy('earnedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToUserProgress(userId, callback) {
    const q = query(
      collection(this.db, 'userProgress'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const progress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(progress);
    });
  }

  subscribeToFlashcardDecks(userId, callback) {
    const q = query(
      collection(this.db, 'flashcardDecks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const decks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(decks);
    });
  }

  // Utility methods
  async getUserStats(userId) {
    try {
      const [
        progress,
        studySessions,
        flashcardDecks,
        diagnosticResults,
        achievements
      ] = await Promise.all([
        this.getUserProgress(userId),
        this.getUserStudySessions(userId),
        this.getUserFlashcardDecks(userId),
        this.getUserDiagnosticResults(userId),
        this.getUserAchievements(userId)
      ]);

      return {
        totalSubjects: progress.length,
        totalStudySessions: studySessions.length,
        totalFlashcardDecks: flashcardDecks.length,
        totalDiagnostics: diagnosticResults.length,
        totalAchievements: achievements.length,
        studyStreak: this.calculateStudyStreak(studySessions),
        totalStudyTime: this.calculateTotalStudyTime(studySessions)
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalSubjects: 0,
        totalStudySessions: 0,
        totalFlashcardDecks: 0,
        totalDiagnostics: 0,
        totalAchievements: 0,
        studyStreak: 0,
        totalStudyTime: 0
      };
    }
  }

  calculateStudyStreak(sessions) {
    if (!sessions.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = sessions[i].timestamp?.toDate() || new Date();
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  }

  calculateTotalStudyTime(sessions) {
    return sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);
  }
}

const dataServiceInstance = new DataService();
export default dataServiceInstance;
