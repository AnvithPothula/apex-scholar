import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Calendar, Brain } from "lucide-react";
import { isSameDay, format } from "date-fns";
import { addDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import { TaskCard } from "../components/scheduler/TaskCard.jsx";
import { TaskModal } from "../components/scheduler/TaskModal.jsx";
import APExamDashboard from "../components/scheduler/APExamDashboard.jsx";
import { Button, ScrollArea, Badge } from "../components/ui/UIComponents.jsx";
import IntelligentScheduler from "../utils/intelligentScheduler";

// Gate debug logging behind development mode
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

// Helper function to convert schedule array back to object format
const convertArrayToScheduleObject = (scheduleArray) => {
  const scheduleObject = {};
  
  if (!Array.isArray(scheduleArray)) {
    return {};
  }
  
  scheduleArray.forEach(item => {
    if (item.date) {
      if (!scheduleObject[item.date]) {
        scheduleObject[item.date] = [];
      }
      scheduleObject[item.date].push(item);
    }
  });
  
  return scheduleObject;
};

export default function SmartScheduler() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [aiSchedule, setAiSchedule] = useState([]);
  const [scheduler, setScheduler] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [blackoutConflicts, setBlackoutConflicts] = useState([]);
  const [showBlackoutDialog, setShowBlackoutDialog] = useState(false);
  const [blackoutOverrides, setBlackoutOverrides] = useState([]);
  const [overdueTasksDialog, setOverdueTasksDialog] = useState({ show: false, tasks: [] });
  const [newAssignmentsAvailable, setNewAssignmentsAvailable] = useState(false);
  const lastKnownTaskCountRef = useRef(0);
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

  // Add ref to prevent double confirmation in StrictMode
  const deletingTaskRef = useRef(null);
  // Add ref for tracking isGenerating state without causing re-renders
  const isGeneratingRef = useRef(false);
  const failedAutoTriggerRef = useRef(false);
  // Add ref for schedule regeneration function
  const scheduleRegenerateRef = useRef(null);

  // Helper function to update both state and ref
  const updateIsGenerating = useCallback((value) => {
    setIsGenerating(value);
    isGeneratingRef.current = value;
  }, []);

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
      alert("Failed to save task. Please try again.");
    }
  };

  const handleBlackoutOverride = (conflict, approve) => {
    if (!conflict) {
      console.error("No conflict provided to handleBlackoutOverride");
      return;
    }
    
    if (approve) {
      setBlackoutOverrides(prev => [...prev, {
        taskId: conflict.taskId,
        blackoutRange: conflict.conflictingBlackout?.timeRange || '',
        blackoutName: conflict.conflictingBlackout?.name || 'Unknown'
      }]);
    }
    
    // Remove this conflict from the list
    setBlackoutConflicts(prev => prev.filter(c => c && c.taskId !== conflict.taskId));
  };

  // Check for overdue tasks and handle them
  const handleOverdueTasks = useCallback((tasksToCheck) => {
    const now = new Date();
    const overdueTasks = tasksToCheck.filter(task => {
      if (!task.deadline || task.is_completed) return false;
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      return deadline < now;
    });

    if (overdueTasks.length > 0) {
      setOverdueTasksDialog({ show: true, tasks: overdueTasks });
      return true;
    }
    return false;
  }, []);

  // Process overdue task action
  const processOverdueTaskAction = useCallback(async (task, action, newDeadline = null) => {
    if (!user) return;
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, "users", user.uid, "tasks", task.id));
        // Remove from local state
        setTasks(prev => prev.filter(t => t.id !== task.id));
        
        // Trigger schedule regeneration after deletion
        debugLog("🔄 Overdue task deleted, regenerating schedule...");
        setTimeout(() => {
          if (scheduleRegenerateRef.current) {
            scheduleRegenerateRef.current(false);
          }
        }, 1000);
        
      } else if (action === 'reschedule' && newDeadline) {
        const taskRef = doc(db, "users", user.uid, "tasks", task.id);
        await updateDoc(taskRef, {
          deadline: Timestamp.fromDate(new Date(newDeadline))
        });
        // Update local state
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, deadline: Timestamp.fromDate(new Date(newDeadline)) }
            : t
        ));
        
        // Trigger schedule regeneration after rescheduling
        debugLog("🔄 Task rescheduled, regenerating schedule...");
        setTimeout(() => {
          if (scheduleRegenerateRef.current) {
            scheduleRegenerateRef.current(false);
          }
        }, 1000);
      }
      
      // Remove the processed task from the overdue dialog
      setOverdueTasksDialog(prev => {
        const remainingTasks = prev.tasks.filter(t => t.id !== task.id);
        
        // Auto-close dialog if no tasks left (scheduling will be triggered by useEffect)
        if (remainingTasks.length === 0) {
          setTimeout(() => {
            setOverdueTasksDialog({ show: false, tasks: [] });
          }, 500);
        }
        
        return {
          ...prev,
          tasks: remainingTasks
        };
      });
      
    } catch (error) {
      console.error("Error processing overdue task:", error);
      alert("Failed to update task. Please try again.");
    }
  }, [user?.uid]);

  // Generate intelligent schedule function
  // Reset auto-trigger flag when tasks change significantly, but only if no schedule exists
  useEffect(() => {
    // Only reset auto-trigger if we don't have an existing schedule
    // AND we haven't already failed an auto-trigger (prevents infinite loop)
    const hasExistingSchedule = Array.isArray(aiSchedule) && aiSchedule.length > 0;
    if (!hasExistingSchedule && !failedAutoTriggerRef.current) {
      setHasAutoTriggered(false);
    }

    // Track when new assignments are available but schedule is preserved
    const lastCount = lastKnownTaskCountRef.current;
    if (hasExistingSchedule && tasks.length > lastCount && lastCount > 0) {
      setNewAssignmentsAvailable(true);
      debugLog(`📬 New assignments detected: ${tasks.length - lastCount} new tasks`);
    }
    
    // Update the last known task count (ref — no re-render)
    lastKnownTaskCountRef.current = tasks.length;
  }, [tasks.length, user?.uid, aiSchedule]);

  const generateIntelligentSchedule = useCallback(async (isAutoTrigger = false) => {
    if (tasks.length === 0) {
      if (!isAutoTrigger) {
        alert("Please create some tasks first! Click the '+ Task' button above to add your AP study tasks.");
      }
      return;
    }

    if (!scheduler) {
      if (!isAutoTrigger) {
        alert("Scheduler is not ready. Please wait for preferences to load.");
      }
      return;
    }

    // Prevent multiple simultaneous generations
    if (isGeneratingRef.current) {
      debugLog("⏳ Schedule generation already in progress");
      return;
    }

    // Extra protection: If this is an auto-trigger and we have an existing schedule,
    // skip generation to preserve user's schedule from background sync interference
    const hasExistingSchedule = Array.isArray(aiSchedule) && aiSchedule.length > 0;
    if (isAutoTrigger && hasExistingSchedule) {
      debugLog("🛡️ Auto-trigger skipped - preserving existing schedule from background sync interference");
      return;
    }

    try {
      updateIsGenerating(true);
      
      // Clear new assignments notification when user manually regenerates
      if (!isAutoTrigger) {
        setNewAssignmentsAvailable(false);
      }

      // Check for overdue tasks first
      const hasOverdueTasks = handleOverdueTasks(tasks);
      if (hasOverdueTasks) {
        updateIsGenerating(false);
        return; // Wait for user to handle overdue tasks
      }

      debugLog("🧠 Generating intelligent schedule...");
      debugLog("Tasks:", tasks);
      debugLog("User preferences:", userPreferences);
      debugLog("Blackout overrides:", blackoutOverrides);
      
      // Convert aiSchedule array back to object format for the scheduler
      const existingScheduleObject = convertArrayToScheduleObject(aiSchedule);
      debugLog("Current schedule to preserve:", existingScheduleObject);
      
      // Enhanced error handling for schedule generation
      let result;
      try {
        result = scheduler.generateWeeklySchedule(tasks, new Date(), blackoutOverrides, existingScheduleObject, isAutoTrigger);
      } catch (scheduleError) {
        console.error("❌ Schedule generation failed:", scheduleError);
        if (!isAutoTrigger) {
          alert("Schedule generation failed. Please try again or check your task data.");
        }
        updateIsGenerating(false);
        return;
      }

      debugLog("Generated schedule result:", result);
      debugLog("Result type:", typeof result);
      debugLog("Is result an object?", result && typeof result === 'object');
      debugLog("Does result have schedule property?", result && result.schedule);
      debugLog("Direct result content keys:", result ? Object.keys(result) : 'No result');
      
      // Handle the new return format that includes conflicts
      let scheduleObject;
      let conflicts = [];
      
      if (result && typeof result === 'object' && result.schedule) {
        // New format with conflicts
        scheduleObject = result.schedule;
        conflicts = result.blackoutConflicts || [];
        debugLog("Using new format - schedule object:", scheduleObject);
        debugLog("Conflicts found:", conflicts);
      } else if (result && typeof result === 'object') {
        // Legacy format - direct schedule object
        scheduleObject = result;
        debugLog("Using legacy format - direct schedule object");
      } else {
        console.error("❌ Generated schedule is not valid:", result);
        
        // Check if there are blackout conflicts to show
        if (result && result.blackoutConflicts && result.blackoutConflicts.length > 0) {
          setBlackoutConflicts(result.blackoutConflicts);
          setShowBlackoutDialog(true);
          updateIsGenerating(false);
          return;
        }
        
        if (!isAutoTrigger) {
          alert("Error: Generated schedule is not valid. Please try again.");
        }
        updateIsGenerating(false);
        return;
      }
      
      // Check if there are blackout conflicts to resolve
      if (conflicts.length > 0) {
        debugLog("⚠️ Blackout conflicts detected, showing dialog");
        setBlackoutConflicts(conflicts);
        setShowBlackoutDialog(true);
        updateIsGenerating(false);
        return; // Don't proceed with schedule generation until conflicts are resolved
      }
      
      if (!scheduleObject || typeof scheduleObject !== 'object') {
        console.error("❌ Generated schedule is not an object:", scheduleObject);
        alert("Error: Generated schedule is not valid. Please try again.");
        return;
      }
      
      // Convert schedule object to array format
      const scheduleArray = [];
      Object.keys(scheduleObject).forEach(dateKey => {
        const daySchedule = scheduleObject[dateKey];
        debugLog(`📅 Processing schedule for ${dateKey}:`, daySchedule);
        
        if (Array.isArray(daySchedule)) {
          // Map the schedule items to match our component's expected format
          const mappedItems = daySchedule.map(item => ({
            ...item,
            task: item.taskName || item.task, // Map taskName to task for compatibility
            startTime: item.startTime ? new Date(item.startTime) : null,
            endTime: item.endTime ? new Date(item.endTime) : null,
            date: dateKey // Ensure date is set
          }));
          debugLog(`📋 Mapped ${mappedItems.length} items for ${dateKey}:`, mappedItems);
          scheduleArray.push(...mappedItems);
        }
      });
      
      debugLog("🔄 Final converted schedule array:", scheduleArray);
      debugLog("📊 Total schedule items:", scheduleArray.length);
      debugLog("📈 Schedule items by date:", scheduleArray.reduce((acc, item) => {
        const date = item.date || (item.startTime ? format(item.startTime, 'yyyy-MM-dd') : 'unknown');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}));
      
      if (scheduleArray.length === 0) {
        // Enhanced error messaging based on actual conditions
        let errorMessage = "Could not generate a schedule. ";
        let suggestions = [];
        
        if (tasks.length === 0) {
          errorMessage = "Please create some tasks first to generate a schedule!";
        } else {
          // Check if all tasks are completed
          const incompleteTasks = tasks.filter(t => !t.is_completed);
          if (incompleteTasks.length === 0) {
            errorMessage = "All your tasks are completed! 🎉 Create new tasks to generate a schedule.";
          } else {
            // Analyze specific issues
            const tasksWithoutDeadlines = incompleteTasks.filter(t => !t.deadline);
            const tasksWithInvalidTime = incompleteTasks.filter(t => {
              const timeRequired = t.timeRequired || (t.estimated_time ? t.estimated_time / 60 : 0);
              const timeSpent = t.timeSpent || 0;
              return timeRequired <= timeSpent;
            });
            
            if (tasksWithoutDeadlines.length === incompleteTasks.length) {
              suggestions.push("Add deadlines to your tasks");
            } else if (tasksWithoutDeadlines.length > 0) {
              suggestions.push(`${tasksWithoutDeadlines.length} tasks need deadlines`);
            }
            
            if (tasksWithInvalidTime.length > 0) {
              suggestions.push(`${tasksWithInvalidTime.length} tasks appear to be already completed`);
            }
            
            // Check blackout coverage
            const blackoutScheduleData = userPreferences?.blackoutSchedule || {};
            let totalBlackoutHours = 0;
            let problematicBlackouts = [];
            
            Object.entries(blackoutScheduleData).forEach(([day, dayBlackouts]) => {
              if (dayBlackouts && dayBlackouts.length > 0) {
                dayBlackouts.forEach(blackout => {
                  let range;
                  if (typeof blackout === 'string') {
                    range = blackout;
                  } else if (blackout.range) {
                    range = blackout.range;
                  }
                  
                  if (range) {
                    const [start, end] = range.split('-');
                    if (start && end) {
                      try {
                        const [startHour] = start.split(':').map(Number);
                        const [endHour] = end.split(':').map(Number);
                        
                        let hours;
                        if (endHour < startHour) {
                          hours = (24 - startHour) + endHour;
                        } else {
                          hours = endHour - startHour;
                        }
                        
                        totalBlackoutHours += hours;
                        
                        if (hours > 10) {
                          problematicBlackouts.push({
                            day,
                            name: blackout.name || 'Blackout Period',
                            range,
                            hours
                          });
                        }
                      } catch (e) {
                        console.warn("Error parsing blackout time:", blackout);
                      }
                    }
                  }
                });
              }
            });
            
            const averageBlackoutPerDay = totalBlackoutHours / 7;
            
            if (averageBlackoutPerDay > 16) {
              if (problematicBlackouts.length > 0) {
                errorMessage = "Your blackout periods are too restrictive for scheduling. ";
                suggestions.push(`Consider reducing: ${problematicBlackouts.map(b => `${b.name} (${b.hours}h)`).join(', ')}`);
              } else {
                suggestions.push("Reduce blackout periods in Settings");
              }
            }
            
            if (suggestions.length === 0) {
              suggestions.push("Try extending study hours or reducing blackout periods");
              suggestions.push("Check that tasks have realistic time estimates");
              suggestions.push("Ensure deadlines are in the future");
            }
            
            errorMessage += "This might be due to:\n• " + suggestions.join("\n• ");
            
            // Log detailed analysis
            debugLog("📊 Detailed scheduling failure analysis:", {
              totalTasks: tasks.length,
              incompleteTasks: tasks.filter(t => !t.is_completed).length,
              tasksWithoutDeadlines: tasks.filter(t => !t.deadline).length,
              averageBlackoutHours: totalBlackoutHours / 7,
              userPreferences: userPreferences
            });
          }
        }
        
        if (!isAutoTrigger) {
          alert(errorMessage);
        }
        updateIsGenerating(false);
        return;
      }

      debugLog("Setting aiSchedule to:", scheduleArray);
      setAiSchedule(scheduleArray);
      await saveAiScheduleToFirebase(scheduleArray);
      debugLog("✅ Schedule generated and saved successfully!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      console.error("Error stack:", error.stack);
      if (isAutoTrigger) {
        // Mark that auto-trigger failed so we don't retry in a loop
        failedAutoTriggerRef.current = true;
      } else {
        alert("Error generating schedule. Please try again.");
      }
      // Only reset schedule if we don't already have one (preserve existing on error)
      if (!Array.isArray(aiSchedule) || aiSchedule.length === 0) {
        setAiSchedule([]);
      }
    } finally {
      updateIsGenerating(false);
    }
  }, [tasks, scheduler, userPreferences, blackoutOverrides, aiSchedule, saveAiScheduleToFirebase, handleOverdueTasks, updateIsGenerating]);

  // Assign the generateIntelligentSchedule function to ref for use in deletion callbacks
  useEffect(() => {
    scheduleRegenerateRef.current = generateIntelligentSchedule;
  }, [generateIntelligentSchedule]);

  // Auto-trigger scheduling when the page loads or when relevant data changes
  useEffect(() => {
    // Only auto-generate schedule if we have tasks and user preferences, and haven't auto-triggered yet
    // AND if we don't already have an existing schedule (to prevent overwriting user's schedule)
    const hasExistingSchedule = Array.isArray(aiSchedule) && aiSchedule.length > 0;
    
    if (tasks.length > 0 && userPreferences && !isGenerating && !showBlackoutDialog && !isModalOpen && !hasAutoTriggered && !hasExistingSchedule && !failedAutoTriggerRef.current) {
      debugLog("🔄 Auto-triggering schedule generation (no existing schedule found)");
      setHasAutoTriggered(true);
      const timer = setTimeout(() => {
        generateIntelligentSchedule(true); // Pass true to indicate this is an auto-trigger
      }, 500); // Small delay to ensure UI is ready
      return () => clearTimeout(timer);
    } else if (hasExistingSchedule && !hasAutoTriggered) {
      debugLog("📅 Existing schedule found - skipping auto-trigger to preserve scheduled times");
      setHasAutoTriggered(true); // Mark as triggered to prevent future auto-triggers
    }
  }, [tasks.length, userPreferences, isGenerating, showBlackoutDialog, isModalOpen, hasAutoTriggered, aiSchedule, generateIntelligentSchedule]);

  // Proceed with schedule generation after resolving conflicts
  const proceedWithSchedule = useCallback(() => {
    setShowBlackoutDialog(false);
    // Re-run schedule generation with the approved overrides
    generateIntelligentSchedule(false);
  }, [generateIntelligentSchedule]);

  // Note: removed auto-trigger on overdue dialog close to prevent infinite loop.
  // The "Continue Scheduling" button in the overdue dialog handles re-triggering.

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
          <p className="text-slate-300">You need to be logged in to access the scheduler.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Mobile/Tablet optimized sidebar */}
      <div className="w-full md:w-72 lg:w-80 border-r border-slate-700 flex flex-col bg-slate-800/80 backdrop-blur-sm order-2 md:order-1 max-h-[40vh] md:max-h-none">
        <div className="p-4 sm:p-6 border-b border-slate-700 bg-slate-800/60">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Scheduler</h2>
            <Button size="sm" onClick={handleCreateTask} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm">
              <Plus size={14} className="mr-1"/>
              Task
            </Button>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm">Manage your AP study schedule and deadlines</p>
        </div>
        
        <div className="p-3 sm:p-4">
          {/* New assignments notification */}
          {newAssignmentsAvailable && (
            <div className="mb-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-200">
                      New assignments have been synced from Schoology! 
                      <span className="block text-xs text-blue-400 mt-1">
                        Click "Generate Smart Schedule" to include them in your schedule.
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNewAssignmentsAvailable(false)}
                  className="flex-shrink-0 ml-3 text-blue-400 hover:text-blue-300"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full mb-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-xs sm:text-sm py-2 sm:py-3" 
            onClick={() => generateIntelligentSchedule(false)}
            disabled={isLoadingPreferences || !scheduler || isGenerating}
          >
            <Brain size={14} className="mr-2"/>
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
                className="w-full text-xs text-red-400 border-red-400 hover:bg-red-400/10" 
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
                <div className="text-center py-6 sm:py-8 text-slate-400">
                  <Calendar size={40} className="sm:w-12 sm:h-12 mx-auto mb-2 opacity-50"/>
                  <p className="text-xs sm:text-sm font-medium">No AP tasks yet</p>
                  <p className="text-xs mb-3">Create tasks with deadlines to generate your smart schedule</p>
                  <Button 
                    size="sm" 
                    onClick={handleCreateTask}
                    className="text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={12} className="mr-1"/>
                    Add Your First Task
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main schedule view - responsive */}
      <div className="flex-1 bg-slate-900/50 backdrop-blur-sm order-1 md:order-2 min-h-0">
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white">AI Study Schedule</h3>
            {Array.isArray(aiSchedule) && aiSchedule.length > 0 && (
              <span className="text-xs sm:text-sm text-slate-400">
                {aiSchedule.filter(item => !item.completed).length} sessions scheduled
              </span>
            )}
          </div>

          {isLoadingPreferences ? (
            <div className="flex items-center justify-center h-40 sm:h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-slate-400 text-sm">Loading your preferences...</p>
              </div>
            </div>
          ) : !Array.isArray(aiSchedule) || aiSchedule.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Brain size={48} className="sm:w-16 sm:h-16 mx-auto mb-4 text-slate-600"/>
              <h4 className="text-base sm:text-lg font-medium text-slate-300 mb-2">No Schedule Generated Yet</h4>
              {tasks.length === 0 ? (
                <div>
                  <p className="text-slate-400 text-sm mb-4">Add your AP study tasks first, then generate your personalized schedule</p>
                  <Button 
                    onClick={handleCreateTask}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus size={16} className="mr-2"/>
                    Create Your First Task
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 text-sm mb-4">You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} ready to schedule</p>
                  <Button 
                    onClick={() => generateIntelligentSchedule(false)}
                    disabled={isLoadingPreferences || !scheduler}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Brain size={16} className="mr-2"/>
                    Generate Smart Schedule
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 14 }, (_, dayIndex) => {
                  const date = new Date();
                  date.setDate(date.getDate() + dayIndex);
                  
                  // Ensure aiSchedule is always an array
                  const safeAiSchedule = Array.isArray(aiSchedule) ? aiSchedule : [];
                  const daySchedule = safeAiSchedule.filter(item => {
                    if (!item || !item.startTime) return false;
                    
                    // Handle both Date objects and date strings
                    const itemDate = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
                    return isSameDay(itemDate, date);
                  });

                  // Always show the day if it's today/tomorrow/next few days, even if no items
                  const showEmptyDays = dayIndex < 3; // Show first 3 days even if empty
                  
                  if (daySchedule.length === 0 && !showEmptyDays) return null;

                  return (
                    <div key={dayIndex} className="bg-slate-800 rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium text-slate-200 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                        <Calendar size={14} className="sm:w-4 sm:h-4 mr-2"/>
                        {format(date, 'EEEE, MMM d')}
                        <span className="ml-2 text-xs text-slate-400">({daySchedule.length} sessions)</span>
                      </h4>
                      
                      {daySchedule.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          No sessions scheduled for this day
                        </div>
                      ) : (
                        <div className="space-y-1 sm:space-y-2">
                          {daySchedule.map((item, index) => {
                            if (!item) {
                              debugLog(`⚠️ Null item at index ${index} for day ${dayIndex}`);
                              return null;
                            }
                            
                            const safeAiSchedule = Array.isArray(aiSchedule) ? aiSchedule : [];
                            const scheduleIndex = safeAiSchedule.findIndex(scheduleItem => 
                              scheduleItem === item
                            );
                            
                            const uniqueKey = scheduleIndex >= 0 ? scheduleIndex : `item-${dayIndex}-${index}`;
                            
                            debugLog(`📋 Rendering schedule item:`, {
                              key: uniqueKey,
                              taskName: item.taskName || item.task,
                              startTime: item.startTime?.toLocaleString(),
                              endTime: item.endTime?.toLocaleString()
                            });
                            
                            return (
                              <div 
                                key={uniqueKey}
                                className={`p-2 sm:p-3 rounded border-l-4 ${
                                  item.completed 
                                    ? 'bg-green-900/20 border-green-500 opacity-60' 
                                    : 'bg-slate-700 border-blue-500'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-200 text-sm sm:text-base truncate">{item.task || item.taskName || 'Unnamed Task'}</p>
                                    <p className="text-xs sm:text-sm text-slate-400">
                                      {(() => {
                                        try {
                                          const start = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
                                          const end = item.endTime instanceof Date ? item.endTime : new Date(item.endTime);
                                          const startStr = item.startTime && !isNaN(start) ? format(start, 'h:mm a') : '';
                                          const endStr = item.endTime && !isNaN(end) ? format(end, 'h:mm a') : '';
                                          return `${startStr}${startStr && endStr ? ' - ' : ''}${endStr}`;
                                        } catch { return ''; }
                                      })()}
                                      {item.duration && ` (${item.duration} min)`}
                                    </p>
                                    {item.subject && <p className="text-xs text-blue-400 truncate">{item.subject}</p>}
                                    {item.blackoutOverride && (
                                      <Badge variant="outline" className="text-xs text-orange-400 border-orange-400 mt-1">
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
          )}
        </div>
      </div>

      {/* Blackout Override Dialog */}
      {showBlackoutDialog && blackoutConflicts.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-lg w-full mx-4 border border-slate-600 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              ⚠️ Schedule Conflicts Detected
            </h3>
            <p className="text-slate-300 mb-4">
              The following tasks have urgent deadlines that conflict with your blackout periods. 
              Would you like to override these blackouts just this once to fit in these urgent tasks?
            </p>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {blackoutConflicts.map((conflict, index) => {
                if (!conflict) return null;
                
                return (
                  <div key={index} className="p-4 bg-slate-700/50 rounded border border-slate-600">
                    <h4 className="font-medium text-slate-200 mb-2">{conflict.taskName || 'Unknown Task'}</h4>
                    <p className="text-sm text-slate-400 mb-2">
                      Due: {conflict.deadline ? new Date(conflict.deadline).toLocaleString() : 'No deadline'}
                    </p>
                    
                    <div className="mb-3">
                      <p className="text-sm text-orange-400 font-medium mb-1">Conflicting blackout periods:</p>
                      {conflict.conflictingBlackouts && conflict.conflictingBlackouts.length > 0 ? (
                        conflict.conflictingBlackouts.map((blackout, bIndex) => (
                          <div key={bIndex} className="text-sm text-orange-300 ml-2 mb-1 p-2 bg-orange-900/20 rounded">
                            <span className="font-medium">• {blackout.blackoutName || blackout.name || 'Unknown Blackout'}</span>
                            <br />
                            <span className="text-xs text-orange-400">
                              {blackout.timeRange || blackout.range || 'No time range'} on {blackout.day || 'unknown day'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-orange-300 ml-2 p-2 bg-orange-900/20 rounded">
                          <span className="font-medium">• {conflict.conflictingBlackout?.name || conflict.conflictingBlackout?.blackoutName || 'Unknown Blackout'}</span>
                          <br />
                          <span className="text-xs text-orange-400">
                            {conflict.conflictingBlackout?.timeRange || 'No time range'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBlackoutOverride(conflict, true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Override for This Task
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBlackoutOverride(conflict, false)}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        Skip This Task
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Override all conflicts
                  blackoutConflicts.forEach(conflict => handleBlackoutOverride(conflict, true));
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={blackoutConflicts.length === 0}
              >
                Override All Conflicts ({blackoutConflicts.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBlackoutDialog(false);
                  setBlackoutConflicts([]);
                  setBlackoutOverrides([]);
                  updateIsGenerating(false);
                }}
                className="flex-1"
              >
                Keep Blackouts
              </Button>
            </div>
            
            {blackoutConflicts.length === 0 && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={proceedWithSchedule}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Generate Schedule Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBlackoutDialog(false);
                    updateIsGenerating(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overdue Tasks Dialog */}
      {overdueTasksDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-lg w-full mx-4 border border-slate-600">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              ⚠️ Overdue Tasks Detected
            </h3>
            <p className="text-slate-300 mb-4">
              You have {overdueTasksDialog.tasks.length} overdue task(s). Would you like to reschedule them or remove them from your list?
            </p>
            
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {overdueTasksDialog.tasks.map((task, index) => {
                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                const daysOverdue = Math.ceil((new Date() - deadline) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={task.id} className="p-3 bg-slate-700/50 rounded border border-slate-600">
                    <h4 className="font-medium text-slate-200">{task.name}</h4>
                    <p className="text-sm text-slate-400">
                      Subject: {task.subject}
                    </p>
                    <p className="text-sm text-red-400">
                      Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} (Due: {deadline.toLocaleDateString()})
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      <input
                        type="datetime-local"
                        className="flex-1 h-8 rounded border border-slate-600 bg-slate-700 px-2 text-sm text-slate-100"
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => {
                          if (e.target.value) {
                            processOverdueTaskAction(task, 'reschedule', e.target.value);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Prevent double execution in StrictMode
                          if (deletingTaskRef.current === task.id) return;
                          
                          if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
                            deletingTaskRef.current = task.id;
                            processOverdueTaskAction(task, 'delete');
                            // Reset after a delay
                            setTimeout(() => {
                              deletingTaskRef.current = null;
                            }, 1000);
                          }
                        }}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setOverdueTasksDialog({ show: false, tasks: [] });
                  // Retry schedule generation after handling overdue tasks
                  generateIntelligentSchedule(false);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={overdueTasksDialog.tasks.length > 0}
              >
                Continue Scheduling
              </Button>
              <Button
                variant="outline"
                onClick={() => setOverdueTasksDialog({ show: false, tasks: [] })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
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
