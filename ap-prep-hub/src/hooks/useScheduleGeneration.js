import { useState, useCallback, useRef, useEffect } from 'react';
import { deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../config/firebase';
import { useToast } from '../contexts/ToastContext';

// Gate debug logging behind development mode
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

// Helper function to convert schedule array back to object format
const convertArrayToScheduleObject = (scheduleArray) => {
  const scheduleObject = {};
  if (!Array.isArray(scheduleArray)) return {};
  scheduleArray.forEach(item => {
    if (item.date) {
      if (!scheduleObject[item.date]) scheduleObject[item.date] = [];
      scheduleObject[item.date].push(item);
    }
  });
  return scheduleObject;
};

/**
 * Custom hook encapsulating schedule generation, blackout conflict resolution,
 * overdue task handling, and auto-trigger logic.
 */
export default function useScheduleGeneration({
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
}) {
  const { toast } = useToast();

  // --- State ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [blackoutConflicts, setBlackoutConflicts] = useState([]);
  const [showBlackoutDialog, setShowBlackoutDialog] = useState(false);
  const [blackoutOverrides, setBlackoutOverrides] = useState([]);
  const [overdueTasksDialog, setOverdueTasksDialog] = useState({ show: false, tasks: [] });
  const [newAssignmentsAvailable, setNewAssignmentsAvailable] = useState(false);
  const [schedulePreview, setSchedulePreview] = useState(null); // { newSchedule: [] } when pending confirmation

  // --- Refs ---
  const isGeneratingRef = useRef(false);
  const failedAutoTriggerRef = useRef(false);
  const lastKnownTaskCountRef = useRef(0);
  const scheduleRegenerateRef = useRef(null);
  const deletingTaskRef = useRef(null);

  // Helper to update both state and ref
  const updateIsGenerating = useCallback((value) => {
    setIsGenerating(value);
    isGeneratingRef.current = value;
  }, []);

  // --- Blackout override handler ---
  const handleBlackoutOverride = useCallback((conflict, approve) => {
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
    setBlackoutConflicts(prev => prev.filter(c => c && c.taskId !== conflict.taskId));
  }, []);

  // --- Overdue task detection ---
  const handleOverdueTasks = useCallback((tasksToCheck) => {
    if (!Array.isArray(tasksToCheck)) return false;
    const now = new Date();
    const overdueTasks = tasksToCheck.filter(task => {
      // Defensive: a null/undefined slot in the array would otherwise throw
      // on `task.deadline`, breaking the entire generation flow on a single
      // bad write. Skip them silently.
      if (!task || !task.deadline || task.is_completed) return false;
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      return !isNaN(deadline.getTime()) && deadline < now;
    });
    if (overdueTasks.length > 0) {
      setOverdueTasksDialog({ show: true, tasks: overdueTasks });
      return true;
    }
    return false;
  }, []);

  // --- Process overdue task action (reschedule / delete) ---
  const processOverdueTaskAction = useCallback(async (task, action, newDeadline = null) => {
    if (!user) return;
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, "users", user.uid, "tasks", task.id));
        setTasks(prev => prev.filter(t => t.id !== task.id));
        const nextSchedule = (Array.isArray(aiSchedule) ? aiSchedule : [])
          .filter(item => item && item.taskId !== task.id);
        setAiSchedule(nextSchedule);
        await saveAiScheduleToFirebase(nextSchedule);
        debugLog("🔄 Overdue task deleted, regenerating schedule...");
        setTimeout(() => {
          if (scheduleRegenerateRef.current) scheduleRegenerateRef.current(false);
        }, 1000);
      } else if (action === 'reschedule' && newDeadline) {
        const taskRef = doc(db, "users", user.uid, "tasks", task.id);
        await updateDoc(taskRef, { deadline: Timestamp.fromDate(new Date(newDeadline)) });
        setTasks(prev => prev.map(t =>
          t.id === task.id
            ? { ...t, deadline: Timestamp.fromDate(new Date(newDeadline)) }
            : t
        ));
        const nextSchedule = (Array.isArray(aiSchedule) ? aiSchedule : [])
          .filter(item => item && item.taskId !== task.id);
        setAiSchedule(nextSchedule);
        await saveAiScheduleToFirebase(nextSchedule);
        debugLog("🔄 Task rescheduled, regenerating schedule...");
        setTimeout(() => {
          if (scheduleRegenerateRef.current) scheduleRegenerateRef.current(false);
        }, 1000);
      }

      // Remove the processed task from the overdue dialog
      setOverdueTasksDialog(prev => {
        const remainingTasks = prev.tasks.filter(t => t.id !== task.id);
        if (remainingTasks.length === 0) {
          setTimeout(() => setOverdueTasksDialog({ show: false, tasks: [] }), 500);
        }
        return { ...prev, tasks: remainingTasks };
      });
    } catch (error) {
      console.error("Error processing overdue task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  }, [user, setTasks, aiSchedule, setAiSchedule, saveAiScheduleToFirebase, toast]);

  // --- Main schedule generation ---
  const generateIntelligentSchedule = useCallback(async (isAutoTrigger = false) => {
    if (tasks.length === 0) {
      if (!isAutoTrigger) {
        toast.warning("Please create some tasks first! Click the '+ Task' button above to add your AP study tasks.");
      }
      return;
    }

    if (!scheduler) {
      if (!isAutoTrigger) {
        toast.warning("Scheduler is not ready. Please wait for preferences to load.");
      }
      return;
    }

    if (isGeneratingRef.current) {
      debugLog("⏳ Schedule generation already in progress");
      return;
    }

    const hasExistingSchedule = Array.isArray(aiSchedule) && aiSchedule.length > 0;
    if (isAutoTrigger && hasExistingSchedule) {
      debugLog("🛡️ Auto-trigger skipped - preserving existing schedule from background sync interference");
      return;
    }

    try {
      updateIsGenerating(true);

      if (!isAutoTrigger) {
        setNewAssignmentsAvailable(false);
      }

      // Block generation if there are overdue tasks. Generating around them
      // would produce a stale plan that ignores the user's pending action,
      // and any in-flight reschedule/delete inside the OverdueTasksDialog
      // would invalidate this run anyway. Auto-triggered generation still
      // proceeds (e.g. background syncs) so we don't drop work silently
      // when the user isn't there to dismiss a dialog.
      if (!isAutoTrigger && handleOverdueTasks(tasks)) {
        debugLog("⏸ Schedule generation paused — overdue tasks need attention");
        updateIsGenerating(false);
        return;
      }

      debugLog("🧠 Generating intelligent schedule...");
      debugLog("Tasks:", tasks);
      debugLog("User preferences:", userPreferences);
      debugLog("Blackout overrides:", blackoutOverrides);

      const existingScheduleObject = convertArrayToScheduleObject(aiSchedule);
      debugLog("Current schedule to preserve:", existingScheduleObject);

      let result;
      try {
        result = scheduler.generateWeeklySchedule(tasks, new Date(), blackoutOverrides, existingScheduleObject, isAutoTrigger);
      } catch (scheduleError) {
        console.error("❌ Schedule generation failed:", scheduleError);
        if (!isAutoTrigger) {
          toast.error("Schedule generation failed. Please try again or check your task data.");
        }
        updateIsGenerating(false);
        return;
      }

      debugLog("Generated schedule result:", result);

      let scheduleObject;
      let conflicts = [];

      if (result && typeof result === 'object' && result.schedule) {
        scheduleObject = result.schedule;
        conflicts = result.blackoutConflicts || [];
      } else if (result && typeof result === 'object') {
        scheduleObject = result;
      } else {
        console.error("❌ Generated schedule is not valid:", result);
        if (result && result.blackoutConflicts && result.blackoutConflicts.length > 0) {
          setBlackoutConflicts(result.blackoutConflicts);
          setShowBlackoutDialog(true);
          updateIsGenerating(false);
          return;
        }
        if (!isAutoTrigger) {
          toast.error("Error: Generated schedule is not valid. Please try again.");
        }
        updateIsGenerating(false);
        return;
      }

      if (conflicts.length > 0) {
        debugLog("⚠️ Blackout conflicts detected, showing dialog");
        setBlackoutConflicts(conflicts);
        setShowBlackoutDialog(true);
        updateIsGenerating(false);
        return;
      }

      if (!scheduleObject || typeof scheduleObject !== 'object') {
        console.error("❌ Generated schedule is not an object:", scheduleObject);
        toast.error("Error: Generated schedule is not valid. Please try again.");
        return;
      }

      // Convert schedule object to array format
      const scheduleArray = [];
      Object.keys(scheduleObject).forEach(dateKey => {
        const daySchedule = scheduleObject[dateKey];
        debugLog(`📅 Processing schedule for ${dateKey}:`, daySchedule);

        if (Array.isArray(daySchedule)) {
          const mappedItems = daySchedule.map(item => ({
            ...item,
            task: item.taskName || item.task,
            startTime: item.startTime ? new Date(item.startTime) : null,
            endTime: item.endTime ? new Date(item.endTime) : null,
            date: dateKey
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
        let errorMessage = "Could not generate a schedule. ";
        let suggestions = [];

        if (tasks.length === 0) {
          errorMessage = "Please create some tasks first to generate a schedule!";
        } else {
          const incompleteTasks = tasks.filter(t => !t.is_completed);
          if (incompleteTasks.length === 0) {
            errorMessage = "All your tasks are completed! Create new tasks to generate a schedule.";
          } else {
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
                          problematicBlackouts.push({ day, name: blackout.name || 'Blackout Period', range, hours });
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

            errorMessage += "This might be due to:\n\u2022 " + suggestions.join("\n\u2022 ");

            debugLog("📊 Detailed scheduling failure analysis:", {
              totalTasks: tasks.length,
              incompleteTasks: tasks.filter(t => !t.is_completed).length,
              tasksWithoutDeadlines: tasks.filter(t => !t.deadline).length,
              averageBlackoutHours: totalBlackoutHours / 7,
              userPreferences
            });
          }
        }

        if (!isAutoTrigger) {
          toast.warning(errorMessage);
        }
        updateIsGenerating(false);
        return;
      }

      // If there's an existing schedule and this is a manual trigger, show preview
      const hasExisting = Array.isArray(aiSchedule) && aiSchedule.length > 0;
      if (!isAutoTrigger && hasExisting) {
        debugLog("📋 Showing schedule preview for user confirmation");
        setSchedulePreview({ newSchedule: scheduleArray });
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
        failedAutoTriggerRef.current = true;
      } else {
        toast.error("Error generating schedule. Please try again.");
      }
      if (!Array.isArray(aiSchedule) || aiSchedule.length === 0) {
        setAiSchedule([]);
      }
    } finally {
      updateIsGenerating(false);
    }
  }, [tasks, scheduler, userPreferences, blackoutOverrides, aiSchedule, setAiSchedule, saveAiScheduleToFirebase, handleOverdueTasks, updateIsGenerating, toast]);

  // Keep ref in sync
  useEffect(() => {
    scheduleRegenerateRef.current = generateIntelligentSchedule;
  }, [generateIntelligentSchedule]);

  // Reset auto-trigger flag when tasks change (only if no existing schedule)
  useEffect(() => {
    const hasExistingSchedule = Array.isArray(aiSchedule) && aiSchedule.length > 0;
    if (!hasExistingSchedule && !failedAutoTriggerRef.current) {
      setHasAutoTriggered(false);
    }

    const lastCount = lastKnownTaskCountRef.current;
    if (hasExistingSchedule && tasks.length > lastCount && lastCount > 0) {
      setNewAssignmentsAvailable(true);
      debugLog(`📬 New assignments detected: ${tasks.length - lastCount} new tasks`);
    }

    lastKnownTaskCountRef.current = tasks.length;
  }, [tasks.length, user?.uid, aiSchedule]);

  // Auto-trigger scheduling
  useEffect(() => {
    const hasExistingSchedule = Array.isArray(aiSchedule) && aiSchedule.length > 0;

    // Gate on `scheduler` AND `!isLoadingPreferences` — the previous version
    // only checked `userPreferences` (which is initialized to a default
    // object and is therefore always truthy). On a fresh page load that
    // meant auto-trigger could fire before the scheduler was constructed
    // (it's built in a separate effect after prefs load). `generateIntelligentSchedule`
    // would then bail at the `!scheduler` guard, but `hasAutoTriggered`
    // was already set to true — silently disabling auto-trigger for the
    // entire session. User had to manually click "Generate" every reload.
    if (tasks.length > 0 && scheduler && !isLoadingPreferences && !isGenerating && !showBlackoutDialog && !isModalOpen && !hasAutoTriggered && !hasExistingSchedule && !failedAutoTriggerRef.current) {
      debugLog("🔄 Auto-triggering schedule generation (no existing schedule found)");
      setHasAutoTriggered(true);
      const timer = setTimeout(() => {
        generateIntelligentSchedule(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (hasExistingSchedule && !hasAutoTriggered) {
      debugLog("📅 Existing schedule found - skipping auto-trigger to preserve scheduled times");
      setHasAutoTriggered(true);
    }
  }, [tasks.length, userPreferences, scheduler, isLoadingPreferences, isGenerating, showBlackoutDialog, isModalOpen, hasAutoTriggered, aiSchedule, generateIntelligentSchedule]);

  // Proceed with schedule after resolving conflicts
  const proceedWithSchedule = useCallback(() => {
    setShowBlackoutDialog(false);
    generateIntelligentSchedule(false);
  }, [generateIntelligentSchedule]);

  // Confirm the previewed schedule
  const confirmSchedulePreview = useCallback(async () => {
    if (!schedulePreview) return;
    const { newSchedule } = schedulePreview;
    setSchedulePreview(null);
    setAiSchedule(newSchedule);
    await saveAiScheduleToFirebase(newSchedule);
    debugLog("✅ Schedule confirmed and saved successfully!");
  }, [schedulePreview, setAiSchedule, saveAiScheduleToFirebase]);

  // Cancel the previewed schedule
  const cancelSchedulePreview = useCallback(() => {
    setSchedulePreview(null);
  }, []);

  return {
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
  };
}
