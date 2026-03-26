/**
 * Schoology Integration Settings Component
 * Allows users to connect/disconnect their Schoology account and configure sync settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  Clock,
  BookOpen,
  AlertCircle,
  Loader
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import schoologyAPI from '../../services/schoologyAPI';
import assignmentSync from '../../services/assignmentSync';

export function SchoologyIntegration() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(1); // minutes - default to 1 minute for real-time
  const [error, setError] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isSettingCalendar, setIsSettingCalendar] = useState(false);

  // Load integration status on component mount
  const loadIntegrationStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const status = await assignmentSync.getSyncStatus(user.uid);
      setIsConnected(status.isConnected);
      setAutoSync(status.hasAutoSync);
      setSyncInterval(status.syncInterval || 1); // Use interval from Firebase
      setLastSync(status.lastSync);

      console.log('📊 Schoology integration status:', status);
    } catch (error) {
      console.error('Error loading integration status:', error);
      setError('Failed to load integration status');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadIntegrationStatus();
    }
  }, [user, loadIntegrationStatus]);

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (window.confirm('Are you sure you want to disconnect Schoology? This will stop automatic assignment syncing.')) {
        await schoologyAPI.disconnect(user.uid);
        assignmentSync.stopAutoSync(user.uid);

        // Update local state
        setIsConnected(false);
        setAutoSync(false);
        setLastSync(null);
        setSyncResults(null);
        setCalendarUrl(''); // Clear the calendar URL input

        // Reload integration status to ensure consistency
        await loadIntegrationStatus();
      }
    } catch (error) {
      console.error('Error disconnecting Schoology:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const result = await assignmentSync.manualSync(user.uid, {
        daysBack: 7,
        includeCompleted: false
      });

      if (result.success) {
        setSyncResults(result);
        setLastSync(result.lastSync);

        // Show success message with detailed breakdown
        let message = '';
        if (result.syncedCount > 0) {
          message = `Successfully synced ${result.syncedCount} new assignments!`;
        } else {
          message = 'No new assignments found to sync.';
        }

        if (result.skippedCount > 0) {
          message += `\n${result.skippedCount} assignments were skipped (already exist).`;
        }

        if (result.pastDueCount > 0) {
          message += `\n${result.pastDueCount} assignments were skipped (past due date).`;
        }

        alert(message);
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error during manual sync:', error);
      setError('Failed to sync assignments');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSyncToggle = async () => {
    try {
      const newAutoSyncState = !autoSync;

      if (newAutoSyncState) {
        // Starting auto-sync
        await assignmentSync.startAutoSync(user.uid, syncInterval);
        setAutoSync(true);
        console.log('Auto-sync enabled');
      } else {
        // Stopping auto-sync
        await assignmentSync.stopAutoSync(user.uid);
        setAutoSync(false);
        console.log('Auto-sync disabled');
      }

      // Save the auto-sync preference to prevent reset on page leave
      await assignmentSync.saveSyncSettings(user.uid, {
        isConnected,
        hasAutoSync: newAutoSyncState,
        syncInterval,
        lastSync
      });

    } catch (error) {
      console.error('Error toggling auto-sync:', error);
      setError('Failed to update auto-sync settings');
      // Revert the state if there was an error
      setAutoSync(!autoSync);
    }
  };

  const handleIntervalChange = async (newInterval) => {
    setSyncInterval(newInterval);

    // If auto-sync is enabled, restart with new interval and save to Firebase
    if (autoSync) {
      await assignmentSync.stopAutoSync(user.uid);
      await assignmentSync.startAutoSync(user.uid, newInterval);
    }
  };

  const handleSetCalendarUrl = async () => {
    try {
      setIsSettingCalendar(true);
      setError(null);

      console.log('Setting calendar URL:', calendarUrl);

      await schoologyAPI.setCalendarUrl(user.uid, calendarUrl);

      console.log('Calendar URL set, now testing sync...');

      // Test sync with calendar
      const syncResult = await assignmentSync.manualSync(user.uid, {
        daysBack: 7,
        includeCompleted: false
      });

      console.log('Sync result:', syncResult);

      setSyncResults(syncResult);
      setLastSync(new Date());
      setIsConnected(true); // Update connection status

      alert(`Calendar URL configured successfully!\n\nFound ${syncResult.totalAssignments} assignments from your calendar.\nSynced ${syncResult.syncedCount} new assignments, skipped ${syncResult.skippedCount} existing assignments.`);

    } catch (error) {
      console.error('Error setting calendar URL:', error);
      setError('Failed to configure calendar: ' + error.message);
    } finally {
      setIsSettingCalendar(false);
    }
  };

  if (isLoading && !syncResults) {
    return (
      <Card className="bg-base-850/60 border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin text-content-muted" strokeWidth={1.5} />
            <span className="ml-2 text-content-secondary">Loading Schoology integration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-base-850/60 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-content-primary">
          <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          Schoology Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success-400" strokeWidth={1.5} />
                  <span className="text-content-primary">Calendar Feed Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-error-400" strokeWidth={1.5} />
                  <span className="text-content-primary">No calendar feed configured</span>
                </>
              )}
            </div>

            {isConnected && (
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="text-error-400 border-error-400 hover:bg-error-400/10"
              >
                Disconnect
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-error-900/30 border border-error-600 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-error-400" strokeWidth={1.5} />
                <span className="text-error-300">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Feed Configuration */}
        <div className="space-y-4 border-t border-border-strong pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-content-secondary" strokeWidth={1.5} />
            <h3 className="font-medium text-content-primary">Calendar Feed Setup</h3>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-content-primary">Calendar URL</h4>
            <p className="text-sm text-content-muted">
              Add your Schoology calendar feed URL. Only calendar items with assignment links will be synced.
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                value={calendarUrl}
                onChange={(e) => setCalendarUrl(e.target.value)}
                placeholder="webcal://yourschool.schoology.com/calendar/feed/ical/..."
                className="flex-1 px-3 py-2 bg-base-800 border border-border rounded-md text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-content-muted"
              />
              <Button
                onClick={handleSetCalendarUrl}
                disabled={!calendarUrl.trim() || isSettingCalendar}
                className="bg-content-primary hover:opacity-90"
              >
                {isSettingCalendar ? (
                  <Loader className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  'Set URL'
                )}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-warning-900/30 border border-warning-600 rounded-lg">
            <h5 className="font-medium text-warning-300 mb-1">How to get your calendar URL (you have to go to the schoology website):</h5>
            <ol className="text-sm text-warning-200 space-y-1">
              <li>1. Go to Schoology → Settings</li>
              <li>2. Scroll to "Share Your Schoology Calendar"</li>
              <li>3. Click "Enable" and copy the iCal link</li>
              <li>4. Paste the URL above</li>
            </ol>
            <p className="text-xs text-warning-200 mt-2">
              URL should look like: webcal://school.yourdistrict.com/calendar/feed/ical/...
            </p>
          </div>
        </div>

        {/* Sync Settings */}
        {isConnected && (
          <div className="space-y-4 border-t border-border-strong pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-content-secondary" strokeWidth={1.5} />
              <h3 className="font-medium text-content-primary">Sync Settings</h3>
            </div>

            {/* Manual Sync */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-content-primary">Manual Sync</h4>
                <p className="text-sm text-content-muted">Sync assignments on demand</p>
              </div>
              <Button
                onClick={handleManualSync}
                disabled={isSyncing}
                variant="outline"
                className="min-w-24"
              >
                {isSyncing ? (
                  <Loader className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-content-primary">Automatic Sync</h4>
                <p className="text-sm text-content-muted">Automatically check for new assignments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={handleAutoSyncToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-base-750 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-content-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-content-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-content-primary"></div>
              </label>
            </div>

            {/* Sync Interval */}
            {autoSync && (
              <div>
                <h4 className="font-medium text-content-primary mb-2">Sync Frequency</h4>
                <div className="flex gap-2">
                  {[1, 5, 15, 30, 60].map((interval) => (
                    <Button
                      key={interval}
                      variant={syncInterval === interval ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleIntervalChange(interval)}
                      className="text-xs"
                    >
                      {interval === 1 ? '1min' : interval < 60 ? `${interval}m` : `${interval / 60}h`}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-content-muted mt-2">
                  Real-time sync (1min) recommended for immediate assignment updates
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sync Status */}
        {isConnected && lastSync && (
          <div className="space-y-4 border-t border-border-strong pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-content-secondary" strokeWidth={1.5} />
              <h3 className="font-medium text-content-primary">Sync Status</h3>
            </div>

            <div>
              <h4 className="font-medium text-content-primary">Last Sync</h4>
              <p className="text-sm text-content-muted">
                {lastSync.toLocaleString()} (Local Time)
              </p>
              <p className="text-xs text-content-muted mt-1">
                Note: Times shown in your local timezone
              </p>
            </div>
          </div>
        )}
      </CardContent>
      </Card>
    </>
  );
}
