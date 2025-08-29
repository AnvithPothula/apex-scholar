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
import SyncHistoryManager from './SyncHistoryManager';

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
      if (autoSync) {
        assignmentSync.stopAutoSync(user.uid);
        setAutoSync(false);
      } else {
        assignmentSync.startAutoSync(user.uid, syncInterval);
        setAutoSync(true);
      }
    } catch (error) {
      console.error('Error toggling auto-sync:', error);
      setError('Failed to update auto-sync settings');
    }
  };

  const handleIntervalChange = (newInterval) => {
    setSyncInterval(newInterval);
    
    // If auto-sync is enabled, restart with new interval
    if (autoSync) {
      assignmentSync.stopAutoSync(user.uid);
      assignmentSync.startAutoSync(user.uid, newInterval);
    }
  };

  const handleSetCalendarUrl = async () => {
    try {
      setIsSettingCalendar(true);
      setError(null);

      console.log('🔗 Setting calendar URL:', calendarUrl);

      await schoologyAPI.setCalendarUrl(user.uid, calendarUrl);
      
      console.log('✅ Calendar URL set, now testing sync...');
      
      // Test sync with calendar
      const syncResult = await assignmentSync.manualSync(user.uid, {
        daysBack: 7,
        includeCompleted: false
      });

      console.log('📊 Sync result:', syncResult);

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
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-slate-300">Loading Schoology integration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/60 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BookOpen className="w-5 h-5" />
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
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-200">Calendar Feed Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-slate-200">No calendar feed configured</span>
                </>
              )}
            </div>
            
            {isConnected && (
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={isLoading}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                Disconnect
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Feed Configuration */}
        <div className="space-y-4 border-t border-slate-600 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-300" />
            <h3 className="font-medium text-slate-200">Calendar Feed Setup</h3>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-slate-200">Calendar URL</h4>
            <p className="text-sm text-slate-400">
              Add your Schoology calendar feed URL. Only calendar items with assignment links will be synced.
            </p>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={calendarUrl}
                onChange={(e) => setCalendarUrl(e.target.value)}
                placeholder="webcal://yourschool.schoology.com/calendar/feed/ical/..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleSetCalendarUrl}
                disabled={!calendarUrl.trim() || isSettingCalendar}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSettingCalendar ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  'Set URL'
                )}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <h5 className="font-medium text-yellow-300 mb-1">How to get your calendar URL (you have to go to the schoology website):</h5>
            <ol className="text-sm text-yellow-200 space-y-1">
              <li>1. Go to Schoology → Settings</li>
              <li>2. Scroll to "Share Your Schoology Calendar"</li>
              <li>3. Click "Enable" and copy the iCal link</li>
              <li>4. Paste the URL above</li>
            </ol>
            <p className="text-xs text-yellow-200 mt-2">
              URL should look like: webcal://school.yourdistrict.com/calendar/feed/ical/...
            </p>
          </div>
        </div>

        {/* Sync Settings */}
        {isConnected && (
          <div className="space-y-4 border-t border-slate-600 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-slate-300" />
              <h3 className="font-medium text-slate-200">Sync Settings</h3>
            </div>
            
            {/* Manual Sync */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-200">Manual Sync</h4>
                <p className="text-sm text-slate-400">Sync assignments on demand</p>
              </div>
              <Button 
                onClick={handleManualSync}
                disabled={isSyncing}
                variant="outline"
                className="min-w-24"
              >
                {isSyncing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-200">Automatic Sync</h4>
                <p className="text-sm text-slate-400">Automatically check for new assignments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={handleAutoSyncToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sync Interval */}
            {autoSync && (
              <div>
                <h4 className="font-medium text-slate-200 mb-2">Sync Frequency</h4>
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
                <p className="text-xs text-slate-400 mt-2">
                  Real-time sync (1min) recommended for immediate assignment updates
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sync Status */}
        {isConnected && lastSync && (
          <div className="space-y-4 border-t border-slate-600 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-300" />
              <h3 className="font-medium text-slate-200">Sync Status</h3>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-200">Last Sync</h4>
              <p className="text-sm text-slate-400">
                {lastSync.toLocaleString()} (Local Time)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Note: Times shown in your local timezone
              </p>
            </div>
          </div>
        )}
      </CardContent>
      </Card>

      {/* Sync History Manager - only show if connected */}
      {isConnected && (
        <div className="mt-6">
          <SyncHistoryManager />
        </div>
      )}
    </>
  );
}
