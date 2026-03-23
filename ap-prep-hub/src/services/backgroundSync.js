/**
 * Background Sync Manager
 * Manages automatic background synchronization of assignments
 */

import assignmentSync from './assignmentSync';
import schoologyAPI from './schoologyAPI';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

class BackgroundSyncManager {
  constructor() {
    this.isInitialized = false;
    this.activeUsers = new Set();
    this._unsubAuth = null;
  }

  /**
   * Initialize the background sync manager
   * Call this explicitly — no side effects on import.
   */
  initialize() {
    if (this.isInitialized) return;

    console.log('🔄 Initializing Background Sync Manager');
    this.isInitialized = true;

    this.setupAuthListener();
  }

  /**
   * Setup authentication listener to manage user sessions
   */
  setupAuthListener() {
    // Clean up previous listener if any
    if (this._unsubAuth) this._unsubAuth();

    this._unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        this.startSyncForUser(user.uid);
      } else {
        this.stopAllSync();
      }
    });
  }

  /**
   * Start background sync for a specific user
   */
  async startSyncForUser(userId) {
    try {
      console.log(`🔄 Starting background sync for user: ${userId}`);

      // Check if user has Schoology connected
      const isConnected = await schoologyAPI.isConnected(userId);
      if (!isConnected) {
        console.log(`❌ User ${userId} does not have Schoology connected`);
        return;
      }

      // Add to active users
      this.activeUsers.add(userId);

      // Check if auto-sync is enabled in user settings before starting
      const syncStatus = await assignmentSync.getSyncStatus(userId);
      if (syncStatus.hasAutoSync) {
        assignmentSync.startAutoSync(userId, 30);
        console.log(`✅ Background auto-sync started for user: ${userId}`);
      } else {
        console.log(`⏸️ Auto-sync disabled for user: ${userId}, skipping`);
      }

      // Perform initial sync if needed (one-time, not recurring)
      this.performInitialSyncIfNeeded(userId);
    } catch (error) {
      console.error(`❌ Error starting background sync for user ${userId}:`, error);
    }
  }

  /**
   * Perform initial sync if user hasn't synced recently
   */
  async performInitialSyncIfNeeded(userId) {
    try {
      const syncStatus = await assignmentSync.getSyncStatus(userId);
      
      // If never synced or last sync was more than 4 hours ago
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      
      if (!syncStatus.lastSync || syncStatus.lastSync < fourHoursAgo) {
        console.log(`🚀 Performing initial sync for user: ${userId}`);
        
        // Delay initial sync by 5 seconds to avoid blocking app startup
        setTimeout(async () => {
          try {
            await assignmentSync.manualSync(userId, { daysBack: 3 });
            console.log(`✅ Initial sync completed for user: ${userId}`);
          } catch (error) {
            console.error(`❌ Initial sync failed for user ${userId}:`, error);
          }
        }, 5000);
      }
    } catch (error) {
      console.error(`❌ Error checking sync status for user ${userId}:`, error);
    }
  }

  /**
   * Stop sync for a specific user
   */
  stopSyncForUser(userId) {
    console.log(`⏹️ Stopping background sync for user: ${userId}`);
    
    this.activeUsers.delete(userId);
    assignmentSync.stopAutoSync(userId);
  }

  /**
   * Stop all sync processes and clean up listeners
   */
  stopAllSync() {
    console.log('⏹️ Stopping all background sync processes');
    
    for (const userId of this.activeUsers) {
      assignmentSync.stopAutoSync(userId);
    }
    
    this.activeUsers.clear();

    if (this._unsubAuth) {
      this._unsubAuth();
      this._unsubAuth = null;
    }
    this.isInitialized = false;
  }

  /**
   * Get active sync status
   */
  getActiveSyncStatus() {
    return {
      activeUsers: Array.from(this.activeUsers),
      totalActiveUsers: this.activeUsers.size,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Manually trigger sync for all active users
   */
  async triggerSyncForAllUsers() {
    console.log('🔄 Manually triggering sync for all active users');
    
    const results = [];
    
    for (const userId of this.activeUsers) {
      try {
        const result = await assignmentSync.manualSync(userId);
        results.push({ userId, ...result });
      } catch (error) {
        console.error(`❌ Manual sync failed for user ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Update sync interval for a user
   */
  updateSyncInterval(userId, intervalMinutes) {
    if (this.activeUsers.has(userId)) {
      console.log(`⚙️ Updating sync interval for user ${userId} to ${intervalMinutes} minutes`);
      assignmentSync.stopAutoSync(userId);
      assignmentSync.startAutoSync(userId, intervalMinutes);
    }
  }

  /**
   * Check if sync is active for a user
   */
  isSyncActiveForUser(userId) {
    return this.activeUsers.has(userId);
  }
}

// Export singleton instance
export const backgroundSyncManager = new BackgroundSyncManager();

// Auto-initialize when imported
export const initializeBackgroundSync = () => {
  backgroundSyncManager.initialize();
};

export default backgroundSyncManager;
