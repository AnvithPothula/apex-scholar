/**
 * Background Sync Manager
 * Manages automatic background synchronization of assignments
 */

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Loaded on demand, not at module scope. App.js imports this file eagerly, and
// both of these statically pull config/firestore -> the whole Firestore SDK into
// the initial bundle. Nothing here runs before auth resolves, so a dynamic
// import costs nothing and keeps ~35 KB gzipped off the critical path.
let _mods = null;
async function syncMods() {
  if (!_mods) {
    const [a, s] = await Promise.all([
      import('./assignmentSync'),
      import('./schoologyAPI'),
    ]);
    _mods = { assignmentSync: a.default, schoologyAPI: s.default };
  }
  return _mods;
}


class BackgroundSyncManager {
  constructor() {
    this.isInitialized = false;
    this.activeUsers = new Set();
    this._unsubAuth = null;
    this._syncInProgress = new Map(); // userId -> Promise (prevents concurrent syncs)
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
      const { schoologyAPI, assignmentSync } = await syncMods();
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
    // Prevent concurrent syncs for the same user
    if (this._syncInProgress.has(userId)) {
      console.log(`⏳ Sync already in progress for user: ${userId}, skipping`);
      return;
    }

    try {
      const { assignmentSync } = await syncMods();
      const syncStatus = await assignmentSync.getSyncStatus(userId);

      // If never synced or last sync was more than 4 hours ago
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

      if (!syncStatus.lastSync || syncStatus.lastSync < fourHoursAgo) {
        console.log(`🚀 Performing initial sync for user: ${userId}`);

        // Delay initial sync by 5 seconds to avoid blocking app startup
        const syncPromise = new Promise((resolve) => {
          setTimeout(async () => {
            try {
              const { assignmentSync: as } = await syncMods();
              await as.manualSync(userId, { daysBack: 3 });
              console.log(`✅ Initial sync completed for user: ${userId}`);
            } catch (error) {
              console.error(`❌ Initial sync failed for user ${userId}:`, error);
            } finally {
              this._syncInProgress.delete(userId);
              resolve();
            }
          }, 5000);
        });

        this._syncInProgress.set(userId, syncPromise);
      }
    } catch (error) {
      console.error(`❌ Error checking sync status for user ${userId}:`, error);
      this._syncInProgress.delete(userId);
    }
  }

  /**
   * Stop sync for a specific user
   */
  stopSyncForUser(userId) {
    console.log(`⏹️ Stopping background sync for user: ${userId}`);
    
    this.activeUsers.delete(userId);
    // If the module was never loaded, no sync was ever started -> nothing to stop.
    _mods?.assignmentSync.stopAutoSync(userId);
  }

  /**
   * Stop all sync processes and clean up listeners
   */
  stopAllSync() {
    console.log('⏹️ Stopping all background sync processes');
    
    for (const userId of this.activeUsers) {
      _mods?.assignmentSync.stopAutoSync(userId);
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
        const { assignmentSync } = await syncMods();
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
      // Only reachable once sync is active, so _mods is already resolved.
      _mods?.assignmentSync.stopAutoSync(userId);
      _mods?.assignmentSync.startAutoSync(userId, intervalMinutes);
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
