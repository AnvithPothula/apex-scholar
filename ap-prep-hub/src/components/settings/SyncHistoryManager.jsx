/**
 * Sync History Manager Component
 * Allows users to view and manage their Schoology sync history
 * This helps debug sync issues and manage which assignments have been synced
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { assignmentSync } from '../../services/assignmentSync';

const SyncHistoryManager = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  // const [syncHistory, setSyncHistory] = useState(null); // Commented out - saved for future use
  const [syncStats, setSyncStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const loadSyncData = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [/* history */, stats] = await Promise.all([
        assignmentSync.getSyncHistory(currentUser.uid),
        assignmentSync.getSyncStatistics(currentUser.uid)
      ]);

      // setSyncHistory(history); // Commented out since not used
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading sync data:', error);
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadSyncData();
    }
  }, [currentUser, loadSyncData]);

  const clearSyncHistory = async () => {
    if (!currentUser) return;

    const confirmMessage = 'This will allow all Schoology assignments to be synced again, including ones you previously deleted. This action cannot be undone.';

    const ok = await confirm({ title: 'Clear sync history?', message: confirmMessage, confirmText: 'Clear' });
    if (ok) {
      try {
        await assignmentSync.clearSyncHistory(currentUser.uid);
        toast.success('Sync history cleared successfully. Your next sync will import all assignments from Schoology again.');
        loadSyncData();
      } catch (error) {
        console.error('Error clearing sync history:', error);
        toast.error('Error clearing sync history. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-base-850/60 border-border rounded-lg shadow-raised border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-base-750 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-base-750 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const totalSynced = syncStats?.totalSyncedAssignments || 0;

  return (
    <div className="bg-base-850/60 border-border rounded-lg shadow-raised border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-content-primary">Sync History</h3>
            <p className="text-sm text-content-secondary">
              Manage your Schoology assignment sync history
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-content-primary hover:text-content-muted text-sm font-medium"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-base-800/30 border border-border/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-content-primary">{totalSynced}</div>
            <div className="text-sm text-content-muted">Total Synced Assignments</div>
          </div>

          {syncStats?.assignmentsBySource && (
            <div className="bg-success-800/30 border border-success-600/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-success-600">
                {Object.keys(syncStats.assignmentsBySource).length}
              </div>
              <div className="text-sm text-success-400">Sources</div>
            </div>
          )}

          {syncStats?.assignmentsByCourse && (
            <div className="bg-base-800/30 border border-border/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-content-primary">
                {Object.keys(syncStats.assignmentsByCourse).length}
              </div>
              <div className="text-sm text-content-muted">Courses</div>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="bg-warning-800/30 border border-warning-600/50 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-300">How Sync History Works</h3>
              <div className="mt-2 text-sm text-warning-200">
                <p>
                  To prevent deleted assignments from reappearing, we keep a permanent record of all assignments
                  that have been synced from Schoology. Even if you delete an assignment from your scheduler,
                  it won't be synced again because it's marked as "previously synced" in this history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {expanded && syncStats && (
          <div className="space-y-6">
            {/* Sources Breakdown */}
            {syncStats.assignmentsBySource && Object.keys(syncStats.assignmentsBySource).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-content-primary mb-3">Assignments by Source</h4>
                <div className="space-y-2">
                  {Object.entries(syncStats.assignmentsBySource).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center py-2 px-3 bg-base-800/50 rounded">
                      <span className="text-sm text-content-secondary capitalize">{source}</span>
                      <span className="text-sm font-medium text-content-primary">{count} assignments</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Breakdown */}
            {syncStats.assignmentsByCourse && Object.keys(syncStats.assignmentsByCourse).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-content-primary mb-3">Assignments by Course</h4>
                <div className="space-y-2">
                  {Object.entries(syncStats.assignmentsByCourse).map(([course, count]) => (
                    <div key={course} className="flex justify-between items-center py-2 px-3 bg-base-800/50 rounded">
                      <span className="text-sm text-content-secondary">{course}</span>
                      <span className="text-sm font-medium text-content-primary">{count} assignments</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Assignments */}
            {syncStats.assignments && syncStats.assignments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-content-primary mb-3">Recent Synced Assignments</h4>
                <div className="bg-base-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {/* Clone before sort — Array.prototype.sort() mutates,
                        and `syncStats.assignments` is state that other code
                        (and React's render cycle) may rely on. */}
                    {[...syncStats.assignments]
                      .sort((a, b) => new Date(b.firstSyncedAt) - new Date(a.firstSyncedAt))
                      .slice(0, 10)
                      .map((assignment, index) => (
                        <div key={assignment.id} className="text-sm">
                          <div className="font-medium text-content-primary">{assignment.title}</div>
                          <div className="text-content-secondary">
                            {assignment.courseName} • Synced {new Date(assignment.firstSyncedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                  {syncStats.assignments.length > 10 && (
                    <div className="text-sm text-content-muted mt-2">
                      ... and {syncStats.assignments.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-content-primary">Reset Sync History</h4>
              <p className="text-sm text-content-secondary">
                Clear all sync history to allow re-syncing of all assignments
              </p>
            </div>
            <button
              onClick={clearSyncHistory}
              className="px-4 py-2 border border-error-400 text-error-300 rounded-md hover:bg-error-800/30 text-sm font-medium"
            >
              Clear History
            </button>
          </div>
        </div>

        {totalSynced === 0 && (
          <div className="text-center py-8">
            <div className="text-content-muted">
              <svg className="mx-auto h-12 w-12 text-content-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-content-primary">No sync history yet</h3>
              <p className="mt-1 text-sm text-content-muted">
                Once you sync assignments from Schoology, they'll appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncHistoryManager;
