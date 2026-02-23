import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth, AVATAR_GRADIENTS } from '../contexts/AuthContext';
import { getAvailableSubjects, getCurriculumData } from '../constants/comprehensiveCurriculum';
import { setUserTimezonePreference } from '../utils/timezone';
import BlackoutScheduleManager from '../components/settings/BlackoutScheduleManager';
import { SchoologyIntegration } from '../components/settings/SchoologyIntegration';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '../components/ui/UIComponents';
import CustomDropdown from '../components/ui/CustomDropdown';
import HelpTooltip from '../components/ui/HelpTooltip';

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  
  // Define default study preferences
  const getDefaultStudyPreferences = () => ({
    // Session timing (research-backed defaults)
    sessionLength: 50, // Minutes - optimal attention span (Bradbury, 2016)
    breakLength: 10, // Minutes - cognitive recovery time
    longBreakLength: 30, // Minutes - after 3-4 sessions
    maxStudyHoursPerDay: 6, // Hours - sustainable daily limit
    
    // Schedule preferences
    studyStartTime: 7, // 7 AM - peak cognitive performance
    studyEndTime: 22, // 10 PM - maintain sleep hygiene
    weekendStudy: true,
    
    // Learning optimization (evidence-based)
    studyIntensity: 'moderate', // light, moderate, intense
    preferMorningStudy: true, // Use peak cognitive hours
    
    // Cognitive load management
    maxConcurrentSubjects: 3, // Prevent cognitive overload
    difficultTasksInMorning: true, // Peak cognitive hours
    avoidPostLunchDip: true, // Skip 1-3 PM for difficult tasks
    
    // Timezone preference (defaults to Central Time)
    timezone: 'America/Chicago', // CST/CDT timezone
    
    // Advanced features
    procrastinationBuffer: 0.2 // 20% time buffer
  });

  // Create empty default blackout schedule 
  const getDefaultBlackoutSchedule = () => {
    return {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };
  };

  const [userSubjects, setUserSubjects] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const gradientPickerRef = useRef(null);
  const [studyPreferences, setStudyPreferences] = useState(getDefaultStudyPreferences());
  const [blackoutDates, setBlackoutDates] = useState(() => getDefaultBlackoutSchedule()); // Initialize with empty schedule
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Track if initial load is complete
  const saveTimeoutRef = useRef(null); // For debouncing auto-save
  const AUTO_SAVE_DELAY = 1000; // 1 second debounce

  const fetchSettings = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fix: Remove timeout that could cause race conditions
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const defaultPrefs = getDefaultStudyPreferences();
        setUserSubjects(data.subjects || []);
        setDisplayName(data.displayName || data.fullName || '');
        // Merge user data with defaults to ensure all fields have values
        const mergedPrefs = { ...defaultPrefs, ...data.studyPreferences };
        setStudyPreferences(mergedPrefs);
        setBlackoutDates(data.blackoutDates || getDefaultBlackoutSchedule());
        
        // Set user's timezone preference
        setUserTimezonePreference(mergedPrefs.timezone || 'America/Chicago');
      } else {
        // Set empty defaults if no document exists
        const emptySchedule = getDefaultBlackoutSchedule();
        const defaultPrefs = getDefaultStudyPreferences();
        setUserSubjects([]);
        setDisplayName('');
        setStudyPreferences(defaultPrefs);
        setBlackoutDates(emptySchedule);
        
        // Set default timezone preference
        setUserTimezonePreference(defaultPrefs.timezone);
        
        // Save the defaults to Firebase so they persist
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            subjects: [],
            studyPreferences: defaultPrefs,
            blackoutDates: emptySchedule,
            settingsLastUpdated: new Date().toISOString()
          }, { merge: true });
        } catch (saveError) {
          console.error("Error saving default settings:", saveError);
        }
        console.log("New user detected in settings, using empty blackout schedule with customizable templates");
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      setMessage('Error: Could not load your settings. Using defaults.');
      setTimeout(() => setMessage(''), 5000);
      // Set defaults on error
      const defaultPrefs = getDefaultStudyPreferences();
      setUserSubjects([]);
      setStudyPreferences(defaultPrefs);
      setBlackoutDates(getDefaultBlackoutSchedule());
    } finally {
      setIsLoading(false);
      // Mark as initialized after a short delay to prevent immediate auto-save
      setTimeout(() => setIsInitialized(true), 100);
    }
  }, [user?.uid]);

  const handleSaveSettings = useCallback(async (showMessage = true) => {
    if (!user?.uid) {
      if (showMessage) {
        setMessage('You must be logged in to save settings.');
        setTimeout(() => setMessage(''), 5000);
      }
      return;
    }
    
    setIsSaving(true);
    if (showMessage) setMessage('Saving...');
    
    try {
      // Validate data before saving
      const validatedStudyPreferences = {
        ...getDefaultStudyPreferences(),
        ...studyPreferences
      };

      // Ensure all numeric values are valid
      Object.keys(validatedStudyPreferences).forEach(key => {
        const value = validatedStudyPreferences[key];
        if (typeof value === 'number' && (isNaN(value) || value < 0)) {
          validatedStudyPreferences[key] = getDefaultStudyPreferences()[key];
        }
      });

      // Validate blackout dates structure
      const validatedBlackoutDates = { ...getDefaultBlackoutSchedule() };
      DAYS.forEach(day => {
        if (blackoutDates[day]) {
          validatedBlackoutDates[day] = blackoutDates[day].filter(item => {
            if (typeof item === 'string') {
              return item.includes('-') && item.split('-').length === 2;
            } else if (typeof item === 'object' && item.range) {
              return item.range.includes('-') && item.range.split('-').length === 2;
            }
            return false;
          });
        }
      });

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        subjects: userSubjects || [],
        studyPreferences: validatedStudyPreferences,
        blackoutDates: validatedBlackoutDates,
        settingsLastUpdated: new Date().toISOString()
      }, { merge: true });
      
      if (showMessage) {
        setMessage('Settings saved!');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
      setMessage('Error: Could not save your settings. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [user?.uid, studyPreferences, blackoutDates, userSubjects]);

  // Auto-save when settings change (debounced)
  useEffect(() => {
    // Don't auto-save during initial load or if not initialized
    if (!isInitialized || isLoading) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveSettings(false); // Save without showing message
    }, AUTO_SAVE_DELAY);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userSubjects, studyPreferences, blackoutDates, isInitialized, isLoading, handleSaveSettings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleRevertToDefaults = () => {
    if (window.confirm("Are you sure you want to revert all study preferences to their default values? This cannot be undone.")) {
      setStudyPreferences(getDefaultStudyPreferences());
      setMessage('Study preferences reverted to defaults and will be saved automatically.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubjectChange = (e) => {
    const { value } = e.target;
    setUserSubjects(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleNameSave = async () => {
    if (!user?.uid) return;
    const trimmed = displayName.trim();
    if (trimmed === (user?.displayName || user?.fullName || '')) return;
    try {
      await updateUserProfile({ displayName: trimmed });
      setMessage('Name updated!');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      console.error('Failed to save name:', e);
      setMessage('Error: Could not save your name.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleGradientSelect = async (gradient) => {
    if (!user?.uid || gradient === user?.avatarGradient) {
      setShowGradientPicker(false);
      return;
    }
    try {
      await updateUserProfile({ avatarGradient: gradient });
      setShowGradientPicker(false);
      setMessage('Avatar color updated!');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      console.error('Failed to save gradient:', e);
      setMessage('Error: Could not save your avatar color.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Close gradient picker when clicking outside
  useEffect(() => {
    if (!showGradientPicker) return;
    const handleClickOutside = (e) => {
      if (gradientPickerRef.current && !gradientPickerRef.current.contains(e.target)) {
        setShowGradientPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGradientPicker]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-lg text-slate-300">Loading settings...</div>
      </div>
    );
  }

  // Get available subjects from comprehensive curriculum
  const availableSubjects = getAvailableSubjects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-3 sm:p-4 md:p-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-100">
          Settings
          {isSaving && (
            <span className="ml-3 text-sm font-normal text-blue-400">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></span>
              Saving...
            </span>
          )}
        </h1>
        {message && (
          <div className={`p-3 sm:p-4 mb-4 text-sm rounded-lg border ${
            message.startsWith('Error') 
              ? 'bg-red-900/50 text-red-300 border-red-700' 
              : message.includes('Saving')
              ? 'bg-blue-900/50 text-blue-300 border-blue-700'
              : 'bg-green-900/50 text-green-300 border-green-700'
          }`}>
            {message}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Profile Section */}
          <Card className="bg-slate-800/60 border-slate-700 md:col-span-2 overflow-visible relative z-10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-slate-100 text-lg sm:text-xl">Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 overflow-visible">
              <div className="flex items-center gap-4">
                <div className="relative" ref={gradientPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowGradientPicker(prev => !prev)}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 ring-2 ring-slate-600 hover:ring-blue-500 transition-all cursor-pointer group"
                    style={{ background: user?.avatarGradient || 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    title="Click to change avatar color"
                  >
                    {(displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </span>
                  </button>
                  {showGradientPicker && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-slate-700 border border-slate-600 rounded-xl shadow-xl z-50 w-52">
                      <p className="text-xs text-slate-300 mb-2 font-medium">Choose avatar color</p>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_GRADIENTS.map((gradient, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleGradientSelect(gradient)}
                            className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                              gradient === (user?.avatarGradient || AVATAR_GRADIENTS[0])
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-700'
                                : 'ring-1 ring-slate-500 hover:ring-slate-400'
                            }`}
                            style={{ background: gradient }}
                            title={`Gradient ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="displayName" className="text-sm font-medium text-slate-300 mb-1 block">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                    className="w-full max-w-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">Your tutor will address you by this name</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-slate-100 text-lg sm:text-xl">Your AP Subjects</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {availableSubjects.map(subjectKey => {
                  const curriculumData = getCurriculumData(subjectKey);
                  return (
                    <div key={subjectKey} className="flex items-center p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                      <input
                        type="checkbox"
                        id={subjectKey}
                        value={subjectKey}
                        checked={userSubjects.includes(subjectKey)}
                        onChange={handleSubjectChange}
                        className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                      />
                      <label htmlFor={subjectKey} className="ml-3 block text-sm text-slate-300 cursor-pointer flex-1">
                        {curriculumData?.name || subjectKey}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-slate-100 text-lg sm:text-xl">
                Study Preferences
                <span className="text-xs font-normal text-slate-400 block mt-1">
                  🧠 Scientifically-optimized defaults based on cognitive research
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-6">
                {/* Session Timing */}
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-slate-200 mb-3">Session Timing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sessionLength" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Session Length (minutes)
                        <HelpTooltip content="How long each study session should be. Research shows 45-50 minutes is optimal for maintaining focus before taking a break." />
                      </label>
                      <Input
                        id="sessionLength"
                        type="number"
                        min="15"
                        max="120"
                        value={studyPreferences.sessionLength}
                        onChange={(e) => {
                          const value = Math.max(15, Math.min(120, parseInt(e.target.value) || 15));
                          setStudyPreferences({ ...studyPreferences, sessionLength: value });
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="breakLength" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Break Length (minutes)
                        <HelpTooltip content="Short breaks between study sessions. 5-15 minutes allows your brain to rest and consolidate information." />
                      </label>
                      <Input
                        id="breakLength"
                        type="number"
                        min="5"
                        max="30"
                        value={studyPreferences.breakLength}
                        onChange={(e) => {
                          const value = Math.max(5, Math.min(30, parseInt(e.target.value) || 5));
                          setStudyPreferences({ ...studyPreferences, breakLength: value });
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="longBreakLength" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Long Break (minutes)
                        <HelpTooltip content="Longer break taken after 3-4 study sessions. Use this time for meals, exercise, or complete mental rest." />
                      </label>
                      <Input
                        id="longBreakLength"
                        type="number"
                        min="15"
                        max="60"
                        value={studyPreferences.longBreakLength}
                        onChange={(e) => {
                          const value = Math.max(15, Math.min(60, parseInt(e.target.value) || 15));
                          setStudyPreferences({ ...studyPreferences, longBreakLength: value });
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="maxStudyHours" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Max Study Hours/Day
                        <HelpTooltip content="Maximum total hours of studying per day. Helps prevent burnout and maintains sustainable study habits." />
                      </label>
                      <Input
                        id="maxStudyHours"
                        type="number"
                        min="2"
                        max="10"
                        value={studyPreferences.maxStudyHoursPerDay}
                        onChange={(e) => {
                          const value = Math.max(2, Math.min(10, parseInt(e.target.value) || 2));
                          setStudyPreferences({ ...studyPreferences, maxStudyHoursPerDay: value });
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Timing */}
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-slate-200 mb-3">Daily Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="studyStartTime" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Study Start Time (24h)
                        <HelpTooltip content="Earliest time you're available to study. Most people have peak cognitive performance in the morning." />
                      </label>
                      <Input
                        id="studyStartTime"
                        type="number"
                        min="5"
                        max="12"
                        value={studyPreferences.studyStartTime}
                        onChange={(e) => {
                          const value = Math.max(5, Math.min(12, parseInt(e.target.value) || 5));
                          setStudyPreferences({ ...studyPreferences, studyStartTime: value });
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="studyEndTime" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Study End Time (24h)
                        <HelpTooltip content="Latest time you want to study. Studying too late can interfere with sleep quality." />
                      </label>
                      <Input
                        id="studyEndTime"
                        type="number"
                        min="18"
                        max="24"
                        value={studyPreferences.studyEndTime}
                        onChange={(e) => {
                          const value = Math.max(18, Math.min(24, parseInt(e.target.value) || 18));
                          setStudyPreferences({ ...studyPreferences, studyEndTime: value });
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Learning Preferences */}
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-slate-200 mb-3">Learning Optimization</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="studyIntensity" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Study Intensity
                        <HelpTooltip content="Light: Shorter sessions with more breaks. Moderate: Balanced approach. Intense: Longer sessions with extended focus periods." />
                      </label>
                      <CustomDropdown
                        options={[
                          { value: "light", label: "Light (shorter sessions, more breaks)" },
                          { value: "moderate", label: "Moderate (balanced approach)" },
                          { value: "intense", label: "Intense (longer sessions, extended peak hours)" }
                        ]}
                        value={studyPreferences.studyIntensity}
                        onChange={(value) => setStudyPreferences({ ...studyPreferences, studyIntensity: value })}
                        placeholder="Select study intensity"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Timezone
                        <HelpTooltip content="Select your timezone for accurate scheduling and assignment due dates. This affects how times are displayed throughout the application." />
                      </label>
                      <CustomDropdown
                        options={[
                          { value: "America/New_York", label: "Eastern Time (EST/EDT)" },
                          { value: "America/Chicago", label: "Central Time (CST/CDT)" },
                          { value: "America/Denver", label: "Mountain Time (MST/MDT)" },
                          { value: "America/Phoenix", label: "Arizona Time (MST)" },
                          { value: "America/Los_Angeles", label: "Pacific Time (PST/PDT)" },
                          { value: "America/Anchorage", label: "Alaska Time (AKST/AKDT)" },
                          { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" }
                        ]}
                        value={studyPreferences.timezone}
                        onChange={(value) => {
                          setStudyPreferences({ ...studyPreferences, timezone: value });
                          setUserTimezonePreference(value);
                        }}
                        placeholder="Select your timezone"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxConcurrentSubjects" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Max Concurrent Subjects
                        <HelpTooltip content="Maximum number of different subjects to study in one day. Too many subjects can cause cognitive overload and reduce focus." />
                      </label>
                      <Input
                        id="maxConcurrentSubjects"
                        type="number"
                        min="1"
                        max="6"
                        value={studyPreferences.maxConcurrentSubjects}
                        onChange={(e) => {
                          const value = Math.max(1, Math.min(6, parseInt(e.target.value) || 1));
                          setStudyPreferences({ ...studyPreferences, maxConcurrentSubjects: value });
                        }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="procrastinationBuffer" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        Procrastination Buffer (0.0-0.5)
                        <HelpTooltip content="Extra time buffer added to deadlines. 0.2 means 20% extra time. Helps account for unexpected delays and procrastination." />
                      </label>
                      <Input
                        id="procrastinationBuffer"
                        type="number"
                        min="0"
                        max="0.5"
                        step="0.1"
                        value={studyPreferences.procrastinationBuffer}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(0.5, parseFloat(e.target.value) || 0));
                          setStudyPreferences({ ...studyPreferences, procrastinationBuffer: value });
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-slate-200 mb-3">Advanced Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'weekendStudy', label: 'Allow weekend study sessions', desc: 'Schedule tasks on weekends', default: true },
                      { key: 'preferMorningStudy', label: 'Prefer morning study', desc: 'Use peak cognitive hours (8-11 AM)', default: true, help: 'Research shows most people have better focus and memory retention in the morning hours.' },
                      { key: 'difficultTasksInMorning', label: 'Schedule hard tasks in morning', desc: 'Use peak cognitive performance', default: true, help: 'Places challenging material when your brain is most alert and capable of complex thinking.' },
                      { key: 'avoidPostLunchDip', label: 'Avoid post-lunch dip', desc: 'Skip 1-3 PM for difficult tasks', default: true, help: 'Most people experience reduced alertness after lunch. Schedules easier tasks during this time.' }
                    ].map(({ key, label, desc, default: isDefault, help }) => (
                      <div key={key} className="flex items-start p-2 rounded-lg hover:bg-slate-600/30 transition-colors">
                        <input
                          type="checkbox"
                          id={key}
                          checked={studyPreferences[key] !== undefined ? studyPreferences[key] : isDefault}
                          onChange={(e) => setStudyPreferences({ ...studyPreferences, [key]: e.target.checked })}
                          className="h-4 w-4 mt-0.5 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <label htmlFor={key} className="block text-sm text-slate-300 cursor-pointer font-medium">
                              {label}
                            </label>
                            {help && <HelpTooltip content={help} />}
                          </div>
                          <span className="text-xs text-slate-400">{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Revert to Defaults Button */}
              <div className="flex justify-end pt-4 border-t border-slate-600">
                <Button 
                  onClick={handleRevertToDefaults}
                  variant="outline"
                  className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100"
                >
                  Revert to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 sm:mt-8">
          <SchoologyIntegration />
        </div>

        <div className="mt-6 sm:mt-8">
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-slate-100 text-lg sm:text-xl">Blackout Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-sm text-slate-400 mb-4">
                Set times when you are unavailable to study. The scheduler will not create tasks during these times.
                Use the quick add templates below to easily add common time blocks like sleep time, school hours, or work hours.
              </p>
              <BlackoutScheduleManager blackoutDates={blackoutDates} setBlackoutDates={setBlackoutDates} />
            </CardContent>
          </Card>
        </div>

        {/* Auto-save indicator */}
        <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end items-center">
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Settings auto-save when changed
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
