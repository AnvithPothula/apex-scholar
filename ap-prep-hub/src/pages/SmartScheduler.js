import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Calendar, Brain } from "lucide-react";
import { format } from "date-fns";
import { addDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import errorLogger from "../utils/errorLogger";
import { db } from "../config/firebase";
import { TaskCard } from "../components/scheduler/TaskCard.jsx";
import { TaskModal } from "../components/scheduler/TaskModal.jsx";
import APExamDashboard from "../components/scheduler/APExamDashboard.jsx";
import CalendarGrid from "../components/scheduler/CalendarGrid.jsx";
import CalendarHeader from "../components/scheduler/CalendarHeader.jsx";
import BlackoutConflictDialog from "../components/scheduler/BlackoutConflictDialog.jsx";
import SchedulePreviewDialog from "../components/scheduler/SchedulePreviewDialog.jsx";
import OverdueTasksBanner from "../components/scheduler/OverdueTasksBanner.jsx";
import { Button, ScrollArea, Badge } from "../components/ui/UIComponents.jsx";
import IntelligentScheduler from "../utils/intelligentScheduler";
import useScheduleGeneration from "../hooks/useScheduleGeneration";

// Gate debug logging behind development mode
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

export default function SmartScheduler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [aiSchedule, setAiSchedule] = useState([]);
  const [scheduler, setScheduler] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [scheduleViewMode, setScheduleViewMode] = useState('list'); // 'list' | 'week' | 'month'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [userPreferences, setUserPreferences] = useState({
    preferredStudyTimes: ['morning', 'evening'],
    maxStudyHoursPerDay: 8, // Increased from 4 to 8 hours
    breakDuration: 15,
    weekendStudy: true,
    blackoutSchedule: {},
    learningHistory: []
  });

  // Initialize the IntelligentScheduler when preferences are loaded
  useEffect(() => {
    if (userPreferences && !isLoadingPreferences) {
      try {
        const newScheduler = new IntelligentScheduler(userPreferences);
        // Load any saved learning history
        if (userPreferences.learningHistory && userPreferences.learningHistory.length > 0) {
          newScheduler.loadLearningHistory(userPreferences.learningHistory);
        }
        setScheduler(newScheduler);
        debugLog("✅ Scheduler initialized with preferences");
      } catch (error) {
        console.error("❌ Error initializing scheduler:", error);
        // Fallback with default preferences
        setUserPreferences({
          preferredStudyTimes: ['morning', 'evening'],
          maxStudyHoursPerDay: 8,
          breakDuration: 15,
          weekendStudy: true,
          blackoutSchedule: {},
          learningHistory: []
        });
      }
    }
  }, [userPreferences, isLoadingPreferences]);



  // Deep sanitize function to clean undefined values
  const deepSanitize = useCallback((obj) => {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedValue = deepSanitize(value);
        if (sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      }
      return sanitized;
    }
    
    return obj;
  }, []);

  // Save user preferences to Firebase
  const saveUserPreferencesToFirebase = useCallback(async (preferences) => {
    if (!user) {
      console.error("Cannot save preferences: No user authenticated");
      return;
    }
    
    debugLog("Attempting to save preferences to Firebase for user:", user.uid);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const dataToSave = {
        studyPreferences: {
          sessionLength: (preferences.maxStudyHoursPerDay * 60).toString(),
          breakLength: preferences.breakDuration.toString(),
          weekendStudy: preferences.weekendStudy,
          studyIntensity: 'moderate'
        },
        blackoutDates: preferences.blackoutSchedule || {},
        preferencesLastUpdated: serverTimestamp()
      };
      
      // Sanitize the data to prevent undefined values
      const sanitizedData = deepSanitize(dataToSave);
      
      debugLog("Data being saved (sanitized):", sanitizedData);
      await setDoc(userDocRef, sanitizedData, { merge: true });
      
      debugLog("✅ User preferences saved to Firebase successfully");
    } catch (error) {
      console.error("❌ Error saving user preferences to Firebase:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  }, [user, deepSanitize]);

  // Load user preferences and schedule from Firebase
  useEffect(() => {
    if (!user) {
      setIsLoadingPreferences(false);
      debugLog("No user found, skipping preference loading");
      return;
    }
    
    debugLog("Starting to load user preferences for:", user.uid);
    
    const loadUserData = async () => {
      try {
        setIsLoadingPreferences(true);
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        debugLog("User document exists:", userDocSnap.exists());
        
        // Default preferences for new users or missing data
        const defaultPrefs = {
          preferredStudyTimes: ['morning', 'evening'],
          maxStudyHoursPerDay: 8, // Increased from 4 to 8 hours
          breakDuration: 15,
          weekendStudy: true,
          blackoutSchedule: {},
          learningHistory: []
        };
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          debugLog("User data loaded:", userData);
          
          // Load study preferences (merge with defaults)
          if (userData.studyPreferences) {
            const prefs = {
              ...defaultPrefs,
              maxStudyHoursPerDay: parseInt(userData.studyPreferences.sessionLength) ? 
                Math.min(8, Math.max(2, Math.round(parseInt(userData.studyPreferences.sessionLength) / 60))) : 8,
              breakDuration: parseInt(userData.studyPreferences.breakLength) || 15,
              weekendStudy: userData.studyPreferences.weekendStudy !== false,
              blackoutSchedule: userData.blackoutDates || {},
              learningHistory: userData.learningHistory || []
            };
            setUserPreferences(prefs);
            debugLog("User preferences set:", prefs);
          } else {
            // No preferences saved yet, use defaults and save them
            setUserPreferences(defaultPrefs);
            await saveUserPreferencesToFirebase(defaultPrefs);
            debugLog("No saved preferences, using and saving defaults:", defaultPrefs);
          }
          
          // Load saved AI schedule
          if (userData.aiSchedule && Array.isArray(userData.aiSchedule)) {
            // Convert saved schedule back to proper Date objects
            const restoredSchedule = userData.aiSchedule.map(item => ({
              ...item,
              startTime: item.startTime ? new Date(item.startTime) : null,
              endTime: item.endTime ? new Date(item.endTime) : null
            })).filter(item => {
              // Only keep future schedule items
              return item.startTime && item.startTime > new Date();
            });
            setAiSchedule(restoredSchedule);
            debugLog("Restored AI schedule:", restoredSchedule.length, "items");
          }
        } else {
          // New user with no document, use defaults and save them
          setUserPreferences(defaultPrefs);
          await saveUserPreferencesToFirebase(defaultPrefs);
          debugLog("New user detected, using and saving default preferences:", defaultPrefs);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // On error, still set defaults to prevent infinite loading
        const defaultPrefs = {
          preferredStudyTimes: ['morning', 'evening'],
          maxStudyHoursPerDay: 8, // Increased from 4 to 8 hours
          breakDuration: 15,
          weekendStudy: true,
          blackoutSchedule: {},
          learningHistory: []
        };
        setUserPreferences(defaultPrefs);
        // Try to save defaults even on error
        try {
          await saveUserPreferencesToFirebase(defaultPrefs);
        } catch (saveError) {
          console.error("Failed to save default preferences:", saveError);
        }
      } finally {
        setIsLoadingPreferences(false);
        debugLog("Finished loading preferences");
      }
    };
    
    loadUserData();
  }, [user, saveUserPreferencesToFirebase]);

  // Load tasks from Firebase
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
    }, (error) => {
      console.error("❌ Error loading tasks:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Save AI schedule to Firebase
  const saveAiScheduleToFirebase = useCallback(async (schedule) => {
    if (!user || !scheduler) {
      console.error("Cannot save schedule: Missing user or scheduler");
      return;
    }
    
    if (!Array.isArray(schedule)) {
      console.error("Cannot save schedule: Schedule is not an array", schedule);
      return;
    }
    
    debugLog("Attempting to save AI schedule to Firebase for user:", user.uid);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const dataToSave = {
        aiSchedule: schedule.map(item => ({
          ...item,
          startTime: item.startTime ? item.startTime.toISOString() : null,
          endTime: item.endTime ? item.endTime.toISOString() : null
        })),
        learningHistory: scheduler.getLearningHistoryForSave ? scheduler.getLearningHistoryForSave() : [],
        lastScheduleGenerated: serverTimestamp()
      };
      
      // Sanitize the data to prevent undefined values
      const sanitizedData = deepSanitize(dataToSave);
      
      debugLog("Schedule data being saved (sanitized):", sanitizedData);
      await setDoc(userDocRef, sanitizedData, { merge: true });
      
      debugLog("✅ AI schedule and learning history saved to Firebase successfully");
    } catch (error) {
      console.error("❌ Error saving AI schedule to Firebase:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  }, [user, scheduler, deepSanitize]); // Fix: Add proper dependencies

  // Schedule generation hook — encapsulates generation, conflicts, overdue handling, auto-trigger
  const {
    isGenerating,
    blackoutConflicts,
    showBlackoutDialog,
    overdueTasksDialog,
    newAssignmentsAvailable,
    setNewAssignmentsAvailable,
    generateIntelligentSchedule,
    handleBlackoutOverride,
    processOverdueTaskAction,
    proceedWithSchedule,
    deletingTaskRef,
    scheduleRegenerateRef,
    setShowBlackoutDialog,
    setBlackoutConflicts,
    setBlackoutOverrides,
    setOverdueTasksDialog,
    updateIsGenerating,
    schedulePreview,
    confirmSchedulePreview,
    cancelSchedulePreview,
  } = useScheduleGeneration({
    tasks,
    setTasks,
    scheduler,
    userPreferences,
    aiSchedule,
    setAiSchedule,
    user,
    isModalOpen,
    isLoadingPreferences,
    saveAiScheduleToFirebase,
  });

  // Remove completed items from schedule and tasks
  const removeCompletedItems = async () => {
    if (!user) {
      console.error("Cannot remove completed items: No user authenticated");
      return;
    }
    
    try {
      // Get completed task IDs
      const completedTaskIds = tasks
        .filter(task => task && task.is_completed)
        .map(task => task.id)
        .filter(Boolean);
      
      // Remove completed tasks from Firebase
      for (const taskId of completedTaskIds) {
        try {
          await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
        } catch (error) {
          console.error(`Error deleting task ${taskId}:`, error);
        }
      }
      
      // Remove schedule items for completed tasks
      const safeAiSchedule = Array.isArray(aiSchedule) ? aiSchedule : [];
      const validItems = safeAiSchedule.filter(item => {
        // Keep items that are not completed AND don't belong to completed tasks
        return item && !item.completed && !completedTaskIds.includes(item.taskId);
      });
      
      setAiSchedule(validItems);
      await saveAiScheduleToFirebase(validItems);
      debugLog("✅ Completed tasks and their schedule items removed");
    } catch (error) {
      console.error("Error removing completed items:", error);
    }
  };

  // Refresh entire schedule
  const refreshSchedule = async () => {
    if (window.confirm("Are you sure you want to refresh the entire schedule?")) {
      try {
        setAiSchedule([]);
        await saveAiScheduleToFirebase([]);
        debugLog("✅ Schedule refreshed and saved to Firebase");
      } catch (error) {
        console.error("Error refreshing schedule:", error);
      }
    }
  };

  const handleToggleTaskComplete = async (task) => {
    try {
      const taskRef = doc(db, "users", user.uid, "tasks", task.id);
      await updateDoc(taskRef, { is_completed: !task.is_completed });
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Prevent double execution in StrictMode
    if (deletingTaskRef.current === taskId) return;
    
    if (window.confirm("Are you sure you want to delete this task?")) {
      deletingTaskRef.current = taskId;
      try {
        await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
        
        // Trigger schedule regeneration after deletion
        debugLog("🔄 Task deleted, regenerating schedule...");
        setTimeout(() => {
          if (scheduleRegenerateRef.current) {
            scheduleRegenerateRef.current(false);
          }
        }, 500);
        
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        // Reset the flag after a short delay
        setTimeout(() => {
          deletingTaskRef.current = null;
        }, 1000);
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateDoc(doc(db, "users", user.uid, "tasks", editingTask.id), taskData);
      } else {
        await addDoc(collection(db, "users", user.uid, "tasks"), {
          ...taskData,
          created_at: serverTimestamp(),
          is_completed: false
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task. Please try again.");
    }
  };

  // Pre-group schedule items by day to avoid per-day .filter() on every render
  const scheduleByDay = useMemo(() => {
    const safeSchedule = Array.isArray(aiSchedule) ? aiSchedule : [];
    const grouped = {};
    safeSchedule.forEach(item => {
      if (!item || !item.startTime) return;
      const itemDate = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
      const key = format(itemDate, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [aiSchedule]);

  // Adapter for CalendarGrid: returns schedule items for a given date
  const getTasksForDate = useCallback((date) => {
    const key = format(date, 'yyyy-MM-dd');
    return (scheduleByDay[key] || []).map(item => ({
      id: item.taskId || item.id || `${item.task}-${key}`,
      name: item.task || item.taskName || 'Unnamed Task',
      subject: item.subject || '',
      startTime: item.startTime instanceof Date ? item.startTime.toISOString() : item.startTime,
      endTime: item.endTime instanceof Date ? item.endTime.toISOString() : item.endTime,
      duration: item.duration,
      difficulty: item.difficulty || 'medium',
      completed: item.completed || false,
    }));
  }, [scheduleByDay]);

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-base-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-content-primary mb-4">Please Log In</h2>
          <p className="text-content-secondary">You need to be logged in to access the scheduler.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-base-950">
      {/* Mobile/Tablet optimized sidebar */}
      <div className="w-full md:w-72 lg:w-80 border-r border-border flex flex-col bg-base-850 order-2 md:order-1 max-h-[40vh] md:max-h-none">
        <div className="p-4 sm:p-6 border-b border-border bg-base-850">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-content-primary">Scheduler</h2>
            <Button size="sm" onClick={handleCreateTask} className="bg-content-primary text-base-950 hover:opacity-90 text-xs sm:text-sm">
              <Plus strokeWidth={1.5} size={14} className="mr-1"/>
              Task
            </Button>
          </div>
          <p className="text-content-secondary text-xs sm:text-sm">Manage your AP study schedule and deadlines</p>
        </div>
        
        <div className="p-3 sm:p-4">
          {/* New assignments notification */}
          {newAssignmentsAvailable && (
            <div className="mb-3 p-3 bg-base-800 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-content-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-content-primary">
                      New assignments have been synced from Schoology!
                      <span className="block text-xs text-content-secondary mt-1">
                        Click "Generate Smart Schedule" to include them in your schedule.
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNewAssignmentsAvailable(false)}
                  className="flex-shrink-0 ml-3 text-content-muted hover:text-content-secondary"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full mb-2 bg-content-primary text-base-950 hover:opacity-90 text-xs sm:text-sm py-2 sm:py-3" 
            onClick={() => generateIntelligentSchedule(false)}
            disabled={isLoadingPreferences || !scheduler || isGenerating}
          >
            <Brain strokeWidth={1.5} size={14} className="mr-2"/>
            <span className="truncate">
              {isLoadingPreferences ? 'Loading...' : isGenerating ? 'Generating...' : 'Generate Smart Schedule'}
            </span>
          </Button>
          
          {Array.isArray(aiSchedule) && aiSchedule.length > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs" 
                onClick={removeCompletedItems}
              >
                Remove Completed
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs text-error-400 border-error-500 hover:bg-error-900" 
                onClick={refreshSchedule}
              >
                Refresh Schedule
              </Button>
            </div>
          )}
        </div>

        {/* AP Exam Dashboard */}
        <div className="px-3 sm:px-4 pb-4">
          <APExamDashboard />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-3 sm:px-4">
            <div className="space-y-1 sm:space-y-2 pb-4">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onComplete={() => handleToggleTaskComplete(task)}
                />
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-content-muted">
                  <Calendar strokeWidth={1.5} size={40} className="sm:w-12 sm:h-12 mx-auto mb-2 opacity-50"/>
                  <p className="text-xs sm:text-sm font-medium">No tasks yet</p>
                  <p className="text-xs mb-3">Create tasks with deadlines to generate your smart schedule</p>
                  <Button 
                    size="sm" 
                    onClick={handleCreateTask}
                    className="text-xs bg-content-primary text-base-950 hover:opacity-90"
                  >
                    <Plus strokeWidth={1.5} size={12} className="mr-1"/>
                    Add Your First Task
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main schedule view - responsive */}
      <div className="flex-1 bg-base-950 order-1 md:order-2 min-h-0">
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold font-display text-content-primary">AI Study Schedule</h3>
            <div className="flex items-center gap-2">
              {Array.isArray(aiSchedule) && aiSchedule.length > 0 && (
                <>
                  <span className="text-xs sm:text-sm text-content-muted mr-2">
                    {aiSchedule.filter(item => !item.completed).length} sessions
                  </span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {['list', 'week', 'month'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setScheduleViewMode(mode)}
                        className={`px-2 py-1 text-xs capitalize transition-colors ${
                          scheduleViewMode === mode
                            ? 'bg-content-primary text-base-950'
                            : 'bg-base-800 text-content-muted hover:text-content-secondary'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Non-blocking overdue tasks banner */}
          {overdueTasksDialog.show && overdueTasksDialog.tasks.length > 0 && (
            <OverdueTasksBanner
              tasks={overdueTasksDialog.tasks}
              onReschedule={(task, newDeadline) => processOverdueTaskAction(task, 'reschedule', newDeadline)}
              onDelete={(task) => processOverdueTaskAction(task, 'delete')}
              onDismiss={() => setOverdueTasksDialog({ show: false, tasks: [] })}
              deletingTaskRef={deletingTaskRef}
            />
          )}

          {isLoadingPreferences ? (
            <div className="flex items-center justify-center h-40 sm:h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-content-muted mx-auto mb-2"></div>
                <p className="text-content-muted text-sm">Loading your preferences...</p>
              </div>
            </div>
          ) : !Array.isArray(aiSchedule) || aiSchedule.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Brain strokeWidth={1.5} size={48} className="sm:w-16 sm:h-16 mx-auto mb-4 text-content-disabled"/>
              <h4 className="text-base sm:text-lg font-medium text-content-secondary mb-2">No schedule yet</h4>
              {tasks.length === 0 ? (
                <div>
                  <p className="text-content-muted text-sm mb-4">Add tasks with deadlines, then generate a study schedule.</p>
                  <Button
                    onClick={handleCreateTask}
                    className="bg-content-primary text-base-950 hover:opacity-90"
                  >
                    <Plus strokeWidth={1.5} size={16} className="mr-2"/>
                    Create Your First Task
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-content-muted text-sm mb-4">You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} ready to schedule</p>
                  <Button
                    onClick={() => generateIntelligentSchedule(false)}
                    disabled={isLoadingPreferences || !scheduler}
                    className="bg-content-primary text-base-950 hover:opacity-90"
                  >
                    <Brain strokeWidth={1.5} size={16} className="mr-2"/>
                    Generate Smart Schedule
                  </Button>
                </div>
              )}
            </div>
          ) : scheduleViewMode === 'list' ? (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 14 }, (_, dayIndex) => {
                  const date = new Date();
                  date.setDate(date.getDate() + dayIndex);

                  const dateKey = format(date, 'yyyy-MM-dd');
                  const daySchedule = scheduleByDay[dateKey] || [];

                  const showEmptyDays = dayIndex < 3;
                  if (daySchedule.length === 0 && !showEmptyDays) return null;

                  return (
                    <div key={dayIndex} className="bg-base-850 rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium text-content-primary mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                        <Calendar strokeWidth={1.5} size={14} className="sm:w-4 sm:h-4 mr-2"/>
                        {format(date, 'EEEE, MMM d')}
                        <span className="ml-2 text-xs text-content-muted">({daySchedule.length} sessions)</span>
                      </h4>

                      {daySchedule.length === 0 ? (
                        <div className="text-center py-4 text-content-muted text-sm">
                          No sessions scheduled for this day
                        </div>
                      ) : (
                        <div className="space-y-1 sm:space-y-2">
                          {daySchedule.map((item, index) => {
                            if (!item) return null;

                            const safeSchedule = Array.isArray(aiSchedule) ? aiSchedule : [];
                            const scheduleIndex = safeSchedule.findIndex(s => s === item);
                            const uniqueKey = scheduleIndex >= 0 ? scheduleIndex : `item-${dayIndex}-${index}`;

                            return (
                              <div
                                key={uniqueKey}
                                className={`p-2 sm:p-3 rounded border-l-4 ${
                                  item.completed
                                    ? 'bg-success-900 border-success-500 opacity-60'
                                    : 'bg-base-800 border-content-muted'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-content-primary text-sm sm:text-base truncate">{item.task || item.taskName || 'Unnamed Task'}</p>
                                    <p className="text-xs sm:text-sm text-content-muted">
                                      {(() => {
                                        try {
                                          const start = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
                                          const end = item.endTime instanceof Date ? item.endTime : new Date(item.endTime);
                                          const startStr = item.startTime && !isNaN(start) ? format(start, 'h:mm a') : '';
                                          const endStr = item.endTime && !isNaN(end) ? format(end, 'h:mm a') : '';
                                          return `${startStr}${startStr && endStr ? ' - ' : ''}${endStr}`;
                                        } catch (e) { errorLogger.debug('Date format failed', { error: e?.message }); return ''; }
                                      })()}
                                      {item.duration && ` (${item.duration} min)`}
                                    </p>
                                    {item.subject && <p className="text-xs text-content-secondary truncate">{item.subject}</p>}
                                    {item.blackoutOverride && (
                                      <Badge variant="outline" className="text-xs text-warning-400 border-warning-400 mt-1">
                                        Override: {item.overriddenBlackout?.name || 'Unknown Blackout'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            /* Week / Month calendar view */
            <div className="flex-1 min-h-0 flex flex-col">
              <CalendarHeader
                currentDate={calendarDate}
                onDateChange={setCalendarDate}
                viewMode={scheduleViewMode}
                onViewModeChange={setScheduleViewMode}
              />
              <div className="flex-1 min-h-0 overflow-auto">
                <CalendarGrid
                  currentDate={calendarDate}
                  viewMode={scheduleViewMode}
                  tasks={tasks}
                  onTaskClick={(task) => { setEditingTask(task); setIsModalOpen(true); }}
                  onDateClick={(date) => { setCalendarDate(date); setScheduleViewMode('week'); }}
                  getTasksForDate={getTasksForDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blackout Override Dialog */}
      {showBlackoutDialog && (
        <BlackoutConflictDialog
          conflicts={blackoutConflicts}
          onOverride={handleBlackoutOverride}
          onOverrideAll={() => blackoutConflicts.forEach(c => handleBlackoutOverride(c, true))}
          onKeepBlackouts={() => {
            setShowBlackoutDialog(false);
            setBlackoutConflicts([]);
            setBlackoutOverrides([]);
            updateIsGenerating(false);
          }}
          onProceed={proceedWithSchedule}
        />
      )}

      {/* Schedule Preview/Diff Dialog */}
      {schedulePreview && (
        <SchedulePreviewDialog
          currentSchedule={aiSchedule}
          newSchedule={schedulePreview.newSchedule}
          onConfirm={confirmSchedulePreview}
          onCancel={cancelSchedulePreview}
        />
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}
