/**
 * Assignment Sync Service
 * Handles syncing assignments from Schoology to the scheduler
 */

import { collection, doc, addDoc, getDocs, query, where, serverTimestamp, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { schoologyAPI } from './schoologyAPI';

class AssignmentSyncService {
  constructor() {
    this.syncIntervals = new Map(); // Track sync intervals for users
  }

  /**
   * Convert Schoology assignment to scheduler task format
   */
  convertAssignmentToTask(assignment) {
    // Validate assignment data first
    if (!assignment || !assignment.title || assignment.title.trim() === '') {
      console.error('❌ Invalid assignment data - missing or empty title:', assignment);
      throw new Error('Assignment must have a valid title');
    }

    // Parse due date with proper time handling
    let deadline = new Date();
    let dueSource = 'defaulted to current time';
    
    // First check if there's a pre-calculated dueDate object (from calendar)
    if (assignment.dueDate && assignment.dueDate instanceof Date && !isNaN(assignment.dueDate.getTime())) {
      deadline = assignment.dueDate;
      dueSource = `from calendar (${assignment.dueDateSource || 'calendar processing'})`;
    } else if (assignment.due) {
      // Schoology due dates come in various formats
      if (typeof assignment.due === 'number') {
        // Unix timestamp (in seconds)
        deadline = new Date(assignment.due * 1000);
        dueSource = 'from assignment timestamp';
      } else if (typeof assignment.due === 'string') {
        // Try to parse string date
        const parsedDate = new Date(assignment.due);
        if (!isNaN(parsedDate.getTime())) {
          deadline = parsedDate;
          dueSource = 'from assignment string date';
        } else {
          // Try parsing as timestamp
          const timestamp = parseInt(assignment.due) * 1000;
          if (!isNaN(timestamp)) {
            deadline = new Date(timestamp);
            dueSource = 'from assignment string timestamp';
          }
        }
      } else if (assignment.due instanceof Date) {
        deadline = assignment.due;
        dueSource = 'from assignment Date object';
      }
    } else {
      // If no due date provided, default to 11:59 PM today
      deadline = new Date();
      deadline.setHours(23, 59, 59, 999);
      dueSource = 'defaulted to 11:59 PM today (no due date found)';
    }

    // Validate the deadline and ensure it has a time component
    if (isNaN(deadline.getTime())) {
      deadline = new Date();
      deadline.setHours(23, 59, 59, 999);
      dueSource = 'defaulted to 11:59 PM today (invalid due date)';
    } else {
      // If the deadline only has date (time is 00:00:00), default to 11:59 PM
      if (deadline.getHours() === 0 && deadline.getMinutes() === 0 && deadline.getSeconds() === 0) {
        deadline.setHours(23, 59, 59, 999);
        dueSource += ' (time defaulted to 11:59 PM)';
      }
    }

    // Estimate time based on assignment type and description
    const estimatedTime = this.estimateAssignmentTime(assignment);

    // Determine difficulty based on assignment details
    const difficulty = this.determineDifficulty(assignment);

    // Determine task type
    const taskType = this.determineTaskType(assignment);

    // Check if this is an assignment based on content (for validation)
    const isAssignment = this.isAssignmentContent(assignment);
    if (!isAssignment) {
      console.log(`⚠️ Content analysis suggests "${assignment.title}" may not be an assignment`);
    }

    // Log assignment details for debugging
    console.log(`📝 ASSIGNMENT SYNC: "${assignment.title}" due ${deadline.toLocaleString()}`);

    return {
      name: assignment.title.trim(),
      subject: assignment.courseName || 'Schoology Assignment',
      type: taskType,
      difficulty: difficulty,
      estimated_time: estimatedTime,
      timeRequired: estimatedTime / 60, // Convert minutes to hours
      timeSpent: 0,
      deadline: deadline,
      description: assignment.description || '',
      pages: 0,
      priority: this.determinePriority(assignment, deadline),
      source: 'schoology',
      schoologyId: assignment.id || `temp_${Date.now()}`,
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      courseCode: assignment.courseCode,
      is_completed: false,
      syncedAt: new Date(),
      lastModified: assignment.last_updated ? new Date(parseInt(assignment.last_updated) * 1000) : new Date(),
      dueSource: dueSource // For debugging purposes
    };
  }

  /**
   * Check if content indicates this is an assignment (not just an event)
   */
  isAssignmentContent(assignment) {
    const title = (assignment.title || '').toLowerCase();
    const description = (assignment.description || '').toLowerCase();
    const text = title + ' ' + description;

    // Assignment keywords
    const assignmentKeywords = [
      'assignment', 'homework', 'hw', 'due', 'submit', 'turn in', 'essay', 'paper', 
      'project', 'lab', 'quiz', 'test', 'exam', 'study', 'read', 'chapter', 'page'
    ];

    // Event keywords (things that are NOT assignments)
    const eventKeywords = [
      'meeting', 'conference', 'assembly', 'break', 'holiday', 'vacation', 
      'no school', 'early release', 'field trip', 'spirit week'
    ];

    const hasAssignmentKeywords = assignmentKeywords.some(keyword => text.includes(keyword));
    const hasEventKeywords = eventKeywords.some(keyword => text.includes(keyword));

    // If it has assignment keywords and no event keywords, it's likely an assignment
    if (hasAssignmentKeywords && !hasEventKeywords) {
      return true;
    }

    // If it has event keywords, it's likely not an assignment
    if (hasEventKeywords) {
      return false;
    }

    // Default to true if uncertain (better to have false positives than miss assignments)
    return true;
  }

  /**
   * Estimate time required for assignment
   */
  estimateAssignmentTime(assignment) {
    const title = (assignment.title || '').toLowerCase();
    const description = (assignment.description || '').toLowerCase();
    const text = title + ' ' + description;

    // Base time estimates in minutes
    let estimatedTime = 60; // Default 1 hour

    // Assignment type keywords
    if (text.includes('essay') || text.includes('paper') || text.includes('report')) {
      estimatedTime = 180; // 3 hours for essays
    } else if (text.includes('project') || text.includes('presentation')) {
      estimatedTime = 240; // 4 hours for projects
    } else if (text.includes('quiz') || text.includes('test') || text.includes('exam')) {
      estimatedTime = 120; // 2 hours for test prep
    } else if (text.includes('reading') || text.includes('chapter')) {
      // Try to extract page numbers
      const pageMatch = text.match(/(\d+)\s*pages?/i);
      if (pageMatch) {
        estimatedTime = parseInt(pageMatch[1]) * 2; // 2 minutes per page
      } else {
        estimatedTime = 90; // Default reading time
      }
    } else if (text.includes('homework') || text.includes('assignment')) {
      estimatedTime = 45; // Standard homework time
    } else if (text.includes('lab') || text.includes('laboratory')) {
      estimatedTime = 150; // Lab work
    }

    // Adjust based on course level indicators
    if (text.includes('ap ') || text.includes('advanced placement')) {
      estimatedTime *= 1.5; // 50% more time for AP courses
    }

    // Minimum 15 minutes, maximum 8 hours
    return Math.max(15, Math.min(480, Math.round(estimatedTime)));
  }

  /**
   * Determine assignment difficulty
   */
  determineDifficulty(assignment) {
    const title = (assignment.title || '').toLowerCase();
    const description = (assignment.description || '').toLowerCase();
    const text = title + ' ' + description;

    // Check for difficulty indicators
    if (text.includes('final') || text.includes('midterm') || text.includes('major') || 
        text.includes('research') || text.includes('thesis') || text.includes('ap ')) {
      return 'Hard';
    } else if (text.includes('quiz') || text.includes('practice') || text.includes('review')) {
      return 'Easy';
    }

    return 'Medium'; // Default
  }

  /**
   * Determine task type from assignment
   */
  determineTaskType(assignment) {
    const title = (assignment.title || '').toLowerCase();
    const description = (assignment.description || '').toLowerCase();
    const text = title + ' ' + description;

    if (text.includes('test') || text.includes('quiz') || text.includes('exam') || text.includes('midterm') || text.includes('final')) {
      return 'test';
    } else if (text.includes('project') || text.includes('presentation')) {
      return 'project';
    } else if (text.includes('reading') || text.includes('chapter') || text.includes('book')) {
      return 'reading';
    } else if (text.includes('essay') || text.includes('paper') || text.includes('report')) {
      return 'essay';
    } else if (text.includes('lab') || text.includes('laboratory')) {
      return 'lab';
    }

    return 'homework'; // Default
  }

  /**
   * Determine priority based on due date and assignment type
   */
  determinePriority(assignment, deadline) {
    const now = new Date();
    const hoursUntilDue = (deadline - now) / (1000 * 60 * 60);

    const title = (assignment.title || '').toLowerCase();
    const isHighStakes = title.includes('test') || title.includes('exam') || 
                        title.includes('final') || title.includes('midterm') ||
                        title.includes('project');

    if (hoursUntilDue <= 24) {
      return 'urgent';
    } else if (hoursUntilDue <= 72) {
      return isHighStakes ? 'urgent' : 'high';
    } else if (hoursUntilDue <= 168) { // 1 week
      return isHighStakes ? 'high' : 'medium';
    }

    return 'medium';
  }

  /**
   * Check if assignment has been synced before (even if later deleted)
   * This prevents re-syncing assignments that users have manually deleted
   */
  async hasBeenSyncedBefore(userId, schoologyId) {
    try {
      // Validate inputs
      if (!userId || !schoologyId || schoologyId === 'undefined') {
        console.error('❌ Invalid parameters for hasBeenSyncedBefore:', { userId, schoologyId });
        return false;
      }

      // Check the persistent sync history
      const syncHistoryRef = doc(db, 'users', userId, 'syncHistory', 'schoology');
      const historyDoc = await getDoc(syncHistoryRef);
      
      if (historyDoc.exists()) {
        const syncedAssignments = historyDoc.data().syncedAssignments || {};
        return !!syncedAssignments[schoologyId];
      }
      
      return false;
    } catch (error) {
      console.error('Error checking sync history:', error);
      return false;
    }
  }

  /**
   * Record that an assignment has been synced
   * This creates a permanent record even if the assignment is later deleted
   */
  async recordAssignmentSynced(userId, schoologyId, assignmentTitle, assignmentData = {}) {
    try {
      if (!userId || !schoologyId || schoologyId === 'undefined') {
        console.error('❌ Invalid parameters for recordAssignmentSynced:', { userId, schoologyId });
        return;
      }

      const syncHistoryRef = doc(db, 'users', userId, 'syncHistory', 'schoology');
      
      // Get existing sync history or create new one
      const historyDoc = await getDoc(syncHistoryRef);
      let syncedAssignments = {};
      
      if (historyDoc.exists()) {
        syncedAssignments = historyDoc.data().syncedAssignments || {};
      }
      
      // Add this assignment to the sync history
      syncedAssignments[schoologyId] = {
        title: assignmentTitle,
        firstSyncedAt: new Date(),
        lastSeenAt: new Date(),
        dueDate: assignmentData.deadline || assignmentData.dueDate,
        courseId: assignmentData.courseId,
        courseName: assignmentData.courseName,
        source: assignmentData.source || 'schoology',
        url: assignmentData.url
      };
      
      // Update the document
      await setDoc(syncHistoryRef, {
        syncedAssignments,
        lastUpdated: new Date()
      }, { merge: true });
      
      console.log(`📝 Recorded assignment "${assignmentTitle}" (${schoologyId}) in sync history`);
    } catch (error) {
      console.error('Error recording assignment sync:', error);
    }
  }

  /**
   * Update the last seen date for an assignment (for assignments that are still coming from Schoology)
   */
  async updateAssignmentLastSeen(userId, schoologyId) {
    try {
      if (!userId || !schoologyId || schoologyId === 'undefined') {
        return;
      }

      const syncHistoryRef = doc(db, 'users', userId, 'syncHistory', 'schoology');
      const historyDoc = await getDoc(syncHistoryRef);
      
      if (historyDoc.exists()) {
        const syncedAssignments = historyDoc.data().syncedAssignments || {};
        
        if (syncedAssignments[schoologyId]) {
          syncedAssignments[schoologyId].lastSeenAt = new Date();
          
          await updateDoc(syncHistoryRef, {
            syncedAssignments,
            lastUpdated: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error updating assignment last seen:', error);
    }
  }

  /**
   * Get sync history for debugging/admin purposes
   */
  async getSyncHistory(userId) {
    try {
      const syncHistoryRef = doc(db, 'users', userId, 'syncHistory', 'schoology');
      const historyDoc = await getDoc(syncHistoryRef);
      
      if (historyDoc.exists()) {
        return historyDoc.data();
      }
      
      return { syncedAssignments: {}, lastUpdated: null };
    } catch (error) {
      console.error('Error getting sync history:', error);
      return { syncedAssignments: {}, lastUpdated: null };
    }
  }

  /**
   * Clear sync history (admin function - use with caution)
   */
  async clearSyncHistory(userId) {
    try {
      const syncHistoryRef = doc(db, 'users', userId, 'syncHistory', 'schoology');
      await setDoc(syncHistoryRef, {
        syncedAssignments: {},
        lastUpdated: new Date(),
        clearedAt: new Date()
      });
      
      console.log(`🗑️ Cleared sync history for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error clearing sync history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if assignment already exists in user's tasks
   */
  async assignmentExists(userId, schoologyId) {
    try {
      // Validate inputs
      if (!userId || !schoologyId || schoologyId === 'undefined') {
        console.error('❌ Invalid parameters for assignmentExists:', { userId, schoologyId });
        return false;
      }

      const tasksRef = collection(db, 'users', userId, 'tasks');
      const q = query(tasksRef, where('schoologyId', '==', schoologyId));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if assignment exists:', error);
      return false;
    }
  }

  /**
   * Sync assignments from Schoology to scheduler
   */
  async syncAssignments(userId, options = {}) {
    try {
      console.log('🔄 Starting Schoology assignment sync for user:', userId);

      // Check if user has Schoology connected
      const isConnected = await schoologyAPI.isConnected(userId);
      if (!isConnected) {
        console.log('❌ User does not have Schoology connected');
        return { success: false, error: 'Schoology not connected' };
      }

      // Get assignments from Schoology using both API and calendar
      const daysBack = options.daysBack || 1; // Only sync recent assignments by default
      const assignments = await schoologyAPI.getCombinedAssignments(userId, daysBack);

      console.log(`📚 Found ${assignments.length} assignments from Schoology`);

      let syncedCount = 0;
      let skippedCount = 0;
      let pastDueCount = 0;
      let errorCount = 0;

      for (const assignment of assignments) {
        try {
          console.log(`🔄 Processing assignment: "${assignment.title || 'UNNAMED'}"`);
          
          // Validate assignment data before processing
          if (!assignment || !assignment.title || assignment.title.trim() === '') {
            console.warn(`⏭️ Skipping invalid assignment (missing title)`);
            errorCount++;
            continue;
          }

          const assignmentId = assignment.id || `temp_${Date.now()}`;

          // FIXED: Check if this assignment has been synced before (even if deleted)
          const hasBeenSynced = await this.hasBeenSyncedBefore(userId, assignmentId);
          if (hasBeenSynced) {
            console.log(`⏭️ Skipping previously synced assignment: "${assignment.title}" (ID: ${assignmentId})`);
            // Update the last seen date to track that this assignment is still active in Schoology
            await this.updateAssignmentLastSeen(userId, assignmentId);
            skippedCount++;
            continue;
          }

          // Check if assignment currently exists in user's tasks (backup check)
          const exists = await this.assignmentExists(userId, assignmentId);
          if (exists) {
            console.log(`⏭️ Skipping existing assignment: "${assignment.title}"`);
            // Record it in sync history if not already there
            await this.recordAssignmentSynced(userId, assignmentId, assignment.title, assignment);
            skippedCount++;
            continue;
          }

          // Skip completed assignments unless forced
          if (assignment.completed && !options.includeCompleted) {
            console.log(`⏭️ Skipping completed assignment: "${assignment.title}"`);
            skippedCount++;
            continue;
          }

          // Convert to task format
          const task = this.convertAssignmentToTask(assignment);

          // Skip assignments that are already past due
          const now = new Date();
          if (task.deadline < now) {
            console.log(`⏭️ Skipping past due assignment: "${assignment.title}"`);
            pastDueCount++;
            continue;
          }

          // Save to Firebase
          const tasksRef = collection(db, 'users', userId, 'tasks');
          await addDoc(tasksRef, {
            ...task,
            created_at: serverTimestamp(),
            synced_from_schoology: true
          });

          // FIXED: Record this assignment in sync history to prevent future re-syncing
          await this.recordAssignmentSynced(userId, assignmentId, assignment.title, assignment);

          syncedCount++;
          console.log(`✅ Synced: "${assignment.title}" (ID: ${assignmentId})`);

        } catch (error) {
          console.error(`❌ Error syncing assignment "${assignment?.title || 'UNNAMED'}":`, error.message);
          errorCount++;
        }
      }

      // Update last sync timestamp
      await schoologyAPI.updateLastSync(userId);

      const result = {
        success: true,
        totalAssignments: assignments.length,
        syncedCount,
        skippedCount,
        pastDueCount,
        errorCount,
        lastSync: new Date()
      };

      console.log('🎉 Schoology sync completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Error during Schoology sync:', error);
      return {
        success: false,
        error: error.message,
        syncedCount: 0,
        skippedCount: 0,
        pastDueCount: 0,
        errorCount: 0
      };
    }
  }

  /**
   * Start automatic sync for a user
   */
  async startAutoSync(userId, intervalMinutes = 60) {
    // Clear existing interval if any
    this.stopAutoSync(userId);

    console.log(`🔄 Starting auto-sync for user ${userId} every ${intervalMinutes} minutes`);

    const intervalId = setInterval(async () => {
      try {
        console.log(`⏰ Running scheduled sync for user ${userId}`);
        await this.syncAssignments(userId, { daysBack: 1 });
      } catch (error) {
        console.error('Error in scheduled sync:', error);
      }
    }, intervalMinutes * 60 * 1000);

    this.syncIntervals.set(userId, intervalId);

    // Save auto-sync settings to Firebase for persistence
    try {
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      await updateDoc(userTokensRef, {
        autoSync: true,
        syncInterval: intervalMinutes,
        autoSyncStarted: new Date()
      });
      console.log(`✅ Auto-sync settings saved to Firebase for user ${userId}`);
    } catch (error) {
      console.error('Error saving auto-sync settings:', error);
      // Don't fail the entire operation if Firebase save fails
    }
  }

  /**
   * Stop automatic sync for a user
   */
  async stopAutoSync(userId) {
    const intervalId = this.syncIntervals.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.syncIntervals.delete(userId);
      console.log(`⏹️ Stopped auto-sync for user ${userId}`);
    }

    // Save auto-sync settings to Firebase for persistence
    try {
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      const tokenDoc = await getDoc(userTokensRef);
      if (tokenDoc.exists()) {
        await updateDoc(userTokensRef, {
          autoSync: false,
          autoSyncStopped: new Date()
        });
        console.log(`✅ Auto-sync disabled state saved to Firebase for user ${userId}`);
      }
    } catch (error) {
      console.error('Error saving auto-sync disabled state:', error);
      // Don't fail the entire operation if Firebase save fails
    }
  }

  /**
   * Manual sync trigger
   */
  async manualSync(userId, options = {}) {
    console.log('🔄 Manual sync triggered for user:', userId);
    
    const result = await this.syncAssignments(userId, {
      daysBack: options.daysBack || 7, // Sync more history for manual sync
      includeCompleted: options.includeCompleted || false
    });

    return result;
  }

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId) {
    try {
      const isConnected = await schoologyAPI.isConnected(userId);
      
      // Check both in-memory state and Firebase state for auto-sync
      const hasAutoSyncInMemory = this.syncIntervals.has(userId);
      
      // Get last sync time and auto-sync settings from Firebase
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      const tokenDoc = await getDoc(userTokensRef);
      const lastSync = tokenDoc.exists() ? tokenDoc.data().lastSync?.toDate() : null;
      const autoSyncFromFirebase = tokenDoc.exists() ? tokenDoc.data().autoSync === true : false;
      const syncInterval = tokenDoc.exists() ? tokenDoc.data().syncInterval || 1 : 1;

      // If Firebase says auto-sync should be on but it's not running in memory, restart it
      if (autoSyncFromFirebase && !hasAutoSyncInMemory && isConnected) {
        console.log(`🔄 Restarting auto-sync from Firebase settings for user ${userId}`);
        this.startAutoSync(userId, syncInterval);
      }

      // Use Firebase state as the source of truth for auto-sync status
      const hasAutoSync = autoSyncFromFirebase;

      // Get sync history stats
      const syncHistory = await this.getSyncHistory(userId);
      const totalSyncedAssignments = Object.keys(syncHistory.syncedAssignments || {}).length;

      return {
        isConnected,
        hasAutoSync,
        syncInterval,
        lastSync,
        totalSyncedAssignments,
        syncHistoryLastUpdated: syncHistory.lastUpdated
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isConnected: false,
        hasAutoSync: false,
        syncInterval: 1,
        lastSync: null,
        totalSyncedAssignments: 0,
        syncHistoryLastUpdated: null
      };
    }
  }

  /**
   * Save sync settings for a user
   */
  async saveSyncSettings(userId, settings) {
    try {
      if (!userId) {
        console.error('❌ Invalid userId for saveSyncSettings');
        return { success: false, error: 'Invalid user ID' };
      }

      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      
      const settingsToSave = {
        ...settings,
        lastUpdated: serverTimestamp()
      };

      await setDoc(userTokensRef, settingsToSave, { merge: true });
      
      console.log(`✅ Sync settings saved for user ${userId}:`, settings);
      return { success: true };
    } catch (error) {
      console.error('Error saving sync settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ADMIN/DEBUG: Get detailed sync statistics
   */
  async getSyncStatistics(userId) {
    try {
      const syncHistory = await this.getSyncHistory(userId);
      const syncedAssignments = syncHistory.syncedAssignments || {};
      
      const stats = {
        totalSyncedAssignments: Object.keys(syncedAssignments).length,
        assignmentsBySource: {},
        assignmentsByCourse: {},
        oldestSync: null,
        newestSync: null,
        assignments: Object.entries(syncedAssignments).map(([id, data]) => ({
          id,
          title: data.title,
          firstSyncedAt: data.firstSyncedAt,
          lastSeenAt: data.lastSeenAt,
          courseName: data.courseName,
          source: data.source
        }))
      };
      
      // Calculate statistics
      Object.values(syncedAssignments).forEach(assignment => {
        // By source
        const source = assignment.source || 'unknown';
        stats.assignmentsBySource[source] = (stats.assignmentsBySource[source] || 0) + 1;
        
        // By course
        const course = assignment.courseName || 'Unknown Course';
        stats.assignmentsByCourse[course] = (stats.assignmentsByCourse[course] || 0) + 1;
        
        // Date ranges
        const syncDate = assignment.firstSyncedAt;
        if (syncDate) {
          if (!stats.oldestSync || syncDate < stats.oldestSync) {
            stats.oldestSync = syncDate;
          }
          if (!stats.newestSync || syncDate > stats.newestSync) {
            stats.newestSync = syncDate;
          }
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting sync statistics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const assignmentSync = new AssignmentSyncService();
export default assignmentSync;
