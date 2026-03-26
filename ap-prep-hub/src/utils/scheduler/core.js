/**
 * Core scheduling algorithm and session generation for IntelligentScheduler.
 *
 * This module defines the IntelligentScheduler class, wires up the constructor
 * and core methods, then mixes in methods from ./conflicts.js and
 * ./priorities.js so the class keeps its full public API.
 */

import { format, isWeekend, startOfDay } from 'date-fns';
import {
  getCurrentTimeInUserTimezone,
  formatDateTimeInUserTimezone,
  getUserTimezone
} from '../timezone';

// Import method groups to mix into the prototype
import * as conflictMethods from './conflicts';
import * as priorityMethods from './priorities';

// Gate debug logging behind development mode to avoid console spam in production
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

class IntelligentScheduler {
  constructor(userPreferences, blackoutSchedule) {
    const scientificDefaults = {
      maxStudyHoursPerDay: 6,
      sessionLength: 50,
      breakLength: 10,
      longBreakLength: 30,
      weekendStudy: true,
      studyStartTime: 7,
      studyEndTime: 22,
      preferMorningStudy: true,
      studyIntensity: 'moderate',
      spacedRepetitionEnabled: true,
      interleaving: true,
      maxConcurrentSubjects: 3,
      difficultTasksInMorning: true,
      activeBreaksEnabled: false,
      mindfulnessBreaksEnabled: false,
      adaptiveScheduling: true,
      procrastinationBuffer: 0.2,
      energyLevelConsideration: true,
      avoidPostLunchDip: true,
      respectCircadianRhythm: true,
      blackoutSchedule: {}
    };

    this.userPreferences = this.mergeWithDefaults(userPreferences, scientificDefaults);
    this.blackoutSchedule = blackoutSchedule || this.userPreferences.blackoutSchedule || {};
    this.learningHistory = [];
    this.temporaryBlackoutOverrides = [];

    this.COGNITIVE_CONSTANTS = {
      FORGETTING_CURVE_DECAY: 0.5,
      OPTIMAL_REVIEW_INTERVALS: [1, 3, 7, 14, 30],
      MAX_COGNITIVE_LOAD_MINUTES: this.userPreferences.sessionLength || 50,
      OPTIMAL_BREAK_MINUTES: this.userPreferences.breakLength || 10,
      LONG_BREAK_MINUTES: this.userPreferences.longBreakLength || 30,
      PEAK_COGNITIVE_HOURS: this.calculatePeakHours(),
      LOW_COGNITIVE_HOURS: this.calculateLowCognitiveHours(),
      OPTIMAL_SESSION_DURATIONS: this.calculateOptimalDurations(),
      DIFFICULTY_MODIFIERS: {
        Easy: { sessionMultiplier: 1.2, breakMultiplier: 0.8 },
        Medium: { sessionMultiplier: 1.0, breakMultiplier: 1.0 },
        Hard: { sessionMultiplier: 0.8, breakMultiplier: 1.3 }
      }
    };
  }

  mergeWithDefaults(userPrefs, scientificDefaults) {
    if (!userPrefs || typeof userPrefs !== 'object') {
      debugLog("🧠 Using scientific defaults - no user preferences provided");
      return scientificDefaults;
    }

    const merged = { ...scientificDefaults, ...userPrefs };

    merged.maxStudyHoursPerDay = Math.max(2, Math.min(10, merged.maxStudyHoursPerDay || scientificDefaults.maxStudyHoursPerDay));
    merged.sessionLength = Math.max(15, Math.min(120, merged.sessionLength || scientificDefaults.sessionLength));
    merged.breakLength = Math.max(5, Math.min(30, merged.breakLength || scientificDefaults.breakLength));
    merged.studyStartTime = Math.max(5, Math.min(12, merged.studyStartTime || scientificDefaults.studyStartTime));
    merged.studyEndTime = Math.max(18, Math.min(24, merged.studyEndTime || scientificDefaults.studyEndTime));

    debugLog("🧠 Merged user preferences with scientific defaults:", merged);
    return merged;
  }

  updatePreferences(newPreferences) {
    this.userPreferences = { ...this.userPreferences, ...newPreferences };
    if (newPreferences.blackoutSchedule) {
      this.blackoutSchedule = newPreferences.blackoutSchedule;
    }
  }

  // -------------------------------------------------------------------------
  // Learning history
  // -------------------------------------------------------------------------

  loadLearningHistory(history) {
    this.learningHistory = history || [];
    debugLog("📚 Loaded learning history:", this.learningHistory.length, "entries");
  }

  getLearningHistoryForSave() {
    return this.learningHistory;
  }

  addLearningEvent(event) {
    this.learningHistory.push({
      ...event,
      timestamp: new Date().toISOString()
    });

    if (this.learningHistory.length > 100) {
      this.learningHistory = this.learningHistory.slice(-100);
    }
  }

  // -------------------------------------------------------------------------
  // Weekly schedule generation
  // -------------------------------------------------------------------------

  generateWeeklySchedule(tasks, startDate = new Date(), blackoutOverrides = [], existingSchedule = {}, preserveCurrentDay = false) {
    debugLog("🧠 Enhanced IntelligentScheduler.generateWeeklySchedule called");
    debugLog("📝 Input tasks:", tasks);
    debugLog("📅 Start date:", startDate);
    debugLog("🚫 Blackout overrides (type):", typeof blackoutOverrides, blackoutOverrides);
    debugLog("📋 Existing schedule provided:", Object.keys(existingSchedule).length > 0);
    debugLog("🔒 Preserve current day schedule:", preserveCurrentDay);
    debugLog("⚙️ User preferences:", this.userPreferences);
    debugLog("🕒 Blackout schedule:", this.userPreferences?.blackoutSchedule);

    if (!tasks || !Array.isArray(tasks)) {
      console.error("❌ Invalid tasks input:", tasks);
      return { schedule: existingSchedule, blackoutConflicts: [] };
    }

    if (tasks.length === 0) {
      debugLog("📭 No tasks provided, returning existing schedule or empty");
      return { schedule: existingSchedule, blackoutConflicts: [] };
    }

    if (!this.userPreferences || typeof this.userPreferences !== 'object') {
      console.error("❌ Invalid user preferences:", this.userPreferences);
      return { schedule: existingSchedule, blackoutConflicts: [] };
    }

    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      console.error("❌ Invalid start date:", startDate);
      startDate = new Date();
    }

    try {
      debugLog("🧠 Starting enhanced scientific schedule generation...");
      debugLog("Tasks received:", tasks.length);

      const validTasks = this.validateAndSanitizeTasks(tasks);
      debugLog("Valid tasks after validation:", validTasks.length);

      if (validTasks.length === 0) {
        debugLog("📭 No valid tasks after validation");
        return { schedule: existingSchedule, blackoutConflicts: [] };
      }

      this.temporaryBlackoutOverrides = blackoutOverrides || [];

      const urgentConflicts = this.detectBlackoutConflicts(validTasks);
      debugLog("⚠️ Urgent conflicts detected:", urgentConflicts.length);

      if (urgentConflicts.length > 0) {
        debugLog("🛑 Returning due to blackout conflicts");
        return { schedule: {}, blackoutConflicts: urgentConflicts };
      }

      debugLog("✅ No conflicts, proceeding with enhanced schedule generation");

      const analyzedTasks = validTasks.map(task => ({
        ...task,
        analysis: this.analyzeTaskWithCognitiveScience(task),
        spaceRepetitionSchedule: this.calculateSpacedRepetitionSchedule(task),
        optimalSessionPlan: this.createOptimalSessionPlan(task)
      }));

      debugLog("🧠 Enhanced analyzed tasks:", analyzedTasks);

      analyzedTasks.sort((a, b) => {
        return this.calculateScientificPriority(b) - this.calculateScientificPriority(a);
      });

      debugLog("📊 Scientifically sorted tasks by priority:", analyzedTasks.map(t => ({
        id: t.id,
        priority: this.calculateScientificPriority(t),
        urgency: this.calculateUrgency(t),
        cognitiveLoad: t.analysis?.cognitiveLoad || 0
      })));

      const taskAllocation = this.allocateTasksWithCognitiveOptimization(analyzedTasks, existingSchedule, preserveCurrentDay);
      debugLog("🧠 Cognitive-optimized task allocation:", taskAllocation);

      const schedule = this.mergeScheduleWithCognitiveStrategy(existingSchedule, taskAllocation);

      debugLog("🎯 Enhanced schedule generated:");
      debugLog("📊 Schedule keys:", Object.keys(schedule));
      debugLog("📈 Total days with schedule:", Object.keys(schedule).length);

      let totalScheduledTasks = 0;
      let totalCognitiveLoad = 0;
      Object.keys(schedule).forEach(key => {
        const dayItems = schedule[key].length;
        const dayLoad = schedule[key].reduce((sum, item) => sum + (item.cognitiveLoad || 0), 0);
        totalScheduledTasks += dayItems;
        totalCognitiveLoad += dayLoad;
        debugLog(`📅 ${key}: ${dayItems} items (cognitive load: ${dayLoad.toFixed(2)})`);
      });

      debugLog(`📊 Total scheduled tasks: ${totalScheduledTasks}`);
      debugLog(`🧠 Total cognitive load: ${totalCognitiveLoad.toFixed(2)}`);
      debugLog(`📋 Original tasks count: ${tasks.length}`);

      if (totalScheduledTasks === 0) {
        debugLog("⚠️ WARNING: No tasks were scheduled!");
        debugLog("🔍 This could be due to:");
        debugLog("   - All tasks completed");
        debugLog("   - No valid time slots available");
        debugLog("   - Blackout periods covering all available time");
        debugLog("   - Tasks filtered out by deadline logic");
      }

      debugLog("🧠 Enhanced schedule generation completed");
      return { schedule, blackoutConflicts: [] };
    } catch (error) {
      console.error("💥 Error in enhanced generateWeeklySchedule:", error);
      console.error("📚 Error stack:", error.stack);
      return { schedule: {}, blackoutConflicts: [] };
    }
  }

  // -------------------------------------------------------------------------
  // Day schedule generation (backward-compat wrapper)
  // -------------------------------------------------------------------------

  generateDaySchedule(tasks, date) {
    debugLog(`🧠 generateDaySchedule called (backward compatibility) for ${format(date, 'yyyy-MM-dd')}`);
    debugLog(`📝 Input tasks count: ${tasks?.length || 0}`);

    if (!tasks || tasks.length === 0) {
      debugLog(`📭 No tasks provided for ${format(date, 'yyyy-MM-dd')}`);
      return [];
    }

    const allocatedTasks = tasks.map(task => {
      const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
      const timeSpent = task.timeSpent || 0;
      const remainingTime = Math.max(0, timeRequired - timeSpent);

      const sessionPlan = this.createOptimalSessionPlan(task);

      return {
        ...task,
        taskName: task.name,
        allocatedTime: remainingTime,
        cognitiveLoad: this.calculateCognitiveLoad(task),
        analysis: this.analyzeTaskWithCognitiveScience(task),
        optimalSessionPlan: sessionPlan,
        sessionType: sessionPlan.sessions[0]?.type || 'standard',
        completionStrategy: 'backward-compatibility'
      };
    });

    debugLog(`🧠 Converted ${tasks.length} tasks to cognitive format`);

    return this.generateCognitiveOptimizedDaySchedule(allocatedTasks, date, []);
  }

  findTasksForDay(tasks, date) {
    debugLog(`🔍 Finding tasks for ${format(date, 'yyyy-MM-dd')}`);

    const targetDate = new Date(date);
    const now = new Date();

    const isToday = format(targetDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

    const relevantTasks = tasks.filter(task => {
      const taskDeadline = task.deadline || task.dueDate;
      if (!taskDeadline) {
        debugLog(`⚠️ Task ${task.name} has no deadline, including anyway`);
        return true;
      }

      const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
      const timeSpent = task.timeSpent || 0;

      if (timeSpent >= timeRequired) {
        debugLog(`✅ Task ${task.name} already completed (${timeSpent}h >= ${timeRequired}h)`);
        return false;
      }

      let deadlineDate;
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadlineDate = taskDeadline.toDate();
      } else {
        deadlineDate = new Date(taskDeadline);
      }

      if (isNaN(deadlineDate.getTime())) {
        console.warn(`⚠️ Task ${task.name} has invalid deadline:`, taskDeadline);
        return false;
      }

      if (deadlineDate < targetDate) {
        debugLog(`⏰ Task ${task.name} deadline (${deadlineDate.toLocaleString()}) is before target date (${targetDate.toLocaleString()}), skipping`);
        return false;
      }

      if (isToday && deadlineDate < now) {
        debugLog(`⏰ Task ${task.name} deadline (${deadlineDate.toLocaleString()}) is before current time (${now.toLocaleString()}), skipping`);
        return false;
      }

      const hoursUntilDeadline = (deadlineDate - targetDate) / (1000 * 60 * 60);

      debugLog(`📋 Task ${task.name}: ${hoursUntilDeadline.toFixed(2)} hours until deadline from target date (estimated: ${task.estimated_time}min, required: ${timeRequired.toFixed(2)}h)`);

      return hoursUntilDeadline >= 0 && hoursUntilDeadline <= (14 * 24);
    });

    debugLog(`📊 Found ${relevantTasks.length} relevant tasks for ${format(date, 'yyyy-MM-dd')}`);
    return relevantTasks.map(task => ({
      ...task,
      timeRequired: task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1),
      timeSpent: task.timeSpent || 0
    }));
  }

  // -------------------------------------------------------------------------
  // Cognitive-optimized task allocation
  // -------------------------------------------------------------------------

  allocateTasksWithCognitiveOptimization(tasks, existingSchedule = {}, preserveCurrentDay = false) {
    debugLog("🧠 Starting cognitive-optimized task allocation...");
    debugLog("📋 Existing schedule to consider:", Object.keys(existingSchedule).length > 0 ? Object.keys(existingSchedule) : "none");
    debugLog("🔒 Preserve current day:", preserveCurrentDay);

    const now = new Date();
    const allocation = {};
    const allocatedTasks = new Set();

    const alreadyScheduledTaskIds = this.getScheduledTaskIds(existingSchedule, tasks, preserveCurrentDay);
    debugLog("📅 Tasks already scheduled:", Array.from(alreadyScheduledTaskIds));

    for (let i = 0; i < 14; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);

      if (!this.userPreferences.weekendStudy && isWeekend(day)) {
        debugLog(`⏭️ Skipping weekend day: ${format(day, 'yyyy-MM-dd')} (weekendStudy: ${this.userPreferences.weekendStudy})`);
        continue;
      }

      const dateKey = format(day, 'yyyy-MM-dd');
      allocation[dateKey] = {
        tasks: [],
        totalCognitiveLoad: 0,
        peakHoursUsed: 0,
        sessionCount: 0
      };
      debugLog(`📅 Added day for allocation: ${dateKey} (${format(day, 'EEEE')})`);
    }

    debugLog("📅 Available days for allocation:", Object.keys(allocation));

    if (Object.keys(allocation).length === 0) {
      console.error("❌ No available days for allocation! Check weekend study preference.");
      return {};
    }

    const sortedTasks = [...tasks].sort((a, b) => {
      return this.calculateScientificPriority(b) - this.calculateScientificPriority(a);
    });

    debugLog("🧠 Tasks sorted by scientific priority:", sortedTasks.map(t => ({
      name: t.name,
      priority: this.calculateScientificPriority(t),
      cognitiveLoad: t.analysis?.cognitiveLoad || 0,
      urgency: this.calculateUrgency(t)
    })));

    let processedCount = 0;
    let allocatedCount = 0;

    for (const task of sortedTasks) {
      processedCount++;
      debugLog(`\n🔄 Processing task ${processedCount}/${sortedTasks.length}: ${task.name}`);

      if (allocatedTasks.has(task.id)) {
        debugLog(`⏭️ Task ${task.name} already in allocatedTasks set, skipping`);
        continue;
      }

      if (alreadyScheduledTaskIds.has(task.id)) {
        debugLog(`📅 Task ${task.name} already scheduled, skipping reallocation`);
        allocatedTasks.add(task.id);
        allocatedCount++;
        continue;
      }

      const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
      const timeSpent = task.timeSpent || 0;
      const remainingTime = Math.max(0, timeRequired - timeSpent);

      if (remainingTime <= 0) {
        debugLog(`✅ Task ${task.name} already completed, skipping allocation`);
        allocatedCount++;
        continue;
      }

      debugLog(`🧠 Cognitively allocating task: ${task.name} (${remainingTime.toFixed(2)}h remaining)`);

      const allocationSuccess = this.allocateTaskWithCognitiveStrategy(task, allocation, allocatedTasks);

      if (allocationSuccess) {
        allocatedCount++;
        debugLog(`✅ Successfully allocated ${task.name} using cognitive strategy`);
      } else {
        debugLog(`❌ Failed to allocate ${task.name} even with cognitive optimization`);
      }

      debugLog(`📊 Task ${task.name} allocation result: ${allocationSuccess ? 'SUCCESS' : 'FAILED'}`);
    }

    debugLog(`\n📊 Cognitive Allocation Summary:`);
    debugLog(`   Total tasks: ${sortedTasks.length}`);
    debugLog(`   Processed: ${processedCount}`);
    debugLog(`   Successfully allocated: ${allocatedCount}`);
    debugLog(`   Failed to allocate: ${processedCount - allocatedCount}`);

    const simpleAllocation = {};
    Object.entries(allocation).forEach(([date, dayData]) => {
      simpleAllocation[date] = dayData.tasks;
      debugLog(`  ${date}: ${dayData.tasks.length} tasks (cognitive load: ${dayData.totalCognitiveLoad.toFixed(2)}, sessions: ${dayData.sessionCount})`);
    });

    return simpleAllocation;
  }

  allocateTaskWithCognitiveStrategy(task, allocation, allocatedTasks) {
    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const timeSpent = task.timeSpent || 0;
    const remainingTime = Math.max(0, timeRequired - timeSpent);
    const cognitiveLoad = task.analysis?.cognitiveLoad || this.calculateCognitiveLoad(task);
    const optimalSessionPlan = task.optimalSessionPlan || this.createOptimalSessionPlan(task);
    const timePreference = task.analysis?.peakTimePreference || this.determineOptimalTimeOfDay(task);

    debugLog(`🧠 Cognitive allocation for ${task.name}:`);
    debugLog(`   Remaining time: ${remainingTime.toFixed(2)}h`);
    debugLog(`   Cognitive load: ${cognitiveLoad.toFixed(2)}`);
    debugLog(`   Sessions needed: ${optimalSessionPlan.totalSessions}`);
    debugLog(`   Time preference: peak hours ${timePreference.preferred.join(', ')}`);

    const filteredAllocation = this.filterAllocationByDeadline(task, allocation);

    if (cognitiveLoad > 0.7) {
      return this.allocateHighCognitiveLoadTask(task, filteredAllocation, allocatedTasks, optimalSessionPlan);
    }

    if (task.type === 'test') {
      return this.allocateTestPrepWithSpacedRepetition(task, filteredAllocation, allocatedTasks);
    }

    if (task.type === 'project' || task.type === 'essay') {
      return this.allocateDeepWorkTask(task, filteredAllocation, allocatedTasks, optimalSessionPlan);
    }

    return this.allocateRegularTaskOptimally(task, filteredAllocation, allocatedTasks, optimalSessionPlan);
  }

  filterAllocationByDeadline(task, allocation) {
    const taskDeadline = task.deadline || task.dueDate;
    if (!taskDeadline) return allocation;

    let deadline;
    if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
      deadline = taskDeadline.toDate();
    } else {
      deadline = new Date(taskDeadline);
    }

    if (isNaN(deadline.getTime())) return allocation;

    const deadlineDateStr = format(startOfDay(deadline), 'yyyy-MM-dd');

    const filtered = {};
    for (const [dateKey, dayData] of Object.entries(allocation)) {
      if (dateKey <= deadlineDateStr) {
        filtered[dateKey] = dayData;
      }
    }

    if (Object.keys(filtered).length === 0) return allocation;

    return filtered;
  }

  // -------------------------------------------------------------------------
  // Allocation strategies
  // -------------------------------------------------------------------------

  allocateHighCognitiveLoadTask(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`🧠 High cognitive load allocation for ${task.name}`);

    const availableDays = Object.keys(allocation);
    const timePreference = this.determineOptimalTimeOfDay(task);
    const cognitiveLoad = this.calculateCognitiveLoad(task);

    const suitableDays = availableDays.filter(dateKey => {
      const dayData = allocation[dateKey];
      return dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.6 &&
             dayData.peakHoursUsed < timePreference.preferred.length * 0.5;
    });

    if (suitableDays.length === 0) {
      debugLog(`⚠️ No suitable peak-hour days found for ${task.name}`);
      return this.allocateRegularTaskOptimally(task, allocation, allocatedTasks, sessionPlan);
    }

    const sessionsPerDay = Math.min(2, Math.ceil(sessionPlan.totalSessions / suitableDays.length));
    let sessionsAllocated = 0;

    for (const dateKey of suitableDays) {
      if (sessionsAllocated >= sessionPlan.totalSessions) break;

      const sessionsForThisDay = Math.min(sessionsPerDay, sessionPlan.totalSessions - sessionsAllocated);

      for (let i = 0; i < sessionsForThisDay; i++) {
        if (sessionsAllocated >= sessionPlan.totalSessions) break;

        const session = sessionPlan.sessions[sessionsAllocated];
        allocation[dateKey].tasks.push({
          ...task,
          allocatedTime: session.duration / 60,
          sessionNumber: session.sessionNumber,
          sessionType: session.type,
          completionStrategy: 'peak-cognitive',
          cognitiveLoad: cognitiveLoad,
          preferredTimeSlots: timePreference.preferred
        });

        allocation[dateKey].totalCognitiveLoad += cognitiveLoad;
        allocation[dateKey].sessionCount += 1;
        allocation[dateKey].peakHoursUsed += 1;
        sessionsAllocated++;

        debugLog(`🧠 Allocated session ${session.sessionNumber} of ${task.name} to ${dateKey} (peak cognitive)`);
      }
    }

    if (sessionsAllocated > 0) {
      allocatedTasks.add(task.id);
      return true;
    }

    return false;
  }

  allocateTestPrepWithSpacedRepetition(task, allocation, allocatedTasks) {
    debugLog(`📚 Spaced repetition allocation for test prep: ${task.name}`);

    const spacedSchedule = task.spaceRepetitionSchedule || this.calculateSpacedRepetitionSchedule(task);
    const sessionPlan = task.optimalSessionPlan || this.createOptimalSessionPlan(task);
    const availableDays = Object.keys(allocation);

    debugLog(`📅 Spaced repetition schedule:`, spacedSchedule);

    let initialSessionsAllocated = 0;
    const initialSessions = Math.ceil(sessionPlan.totalSessions * 0.7);

    for (let i = 0; i < Math.min(3, availableDays.length) && initialSessionsAllocated < initialSessions; i++) {
      const dateKey = availableDays[i];
      const dayData = allocation[dateKey];

      if (dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.8) {
        const session = sessionPlan.sessions[initialSessionsAllocated] || sessionPlan.sessions[0];

        dayData.tasks.push({
          ...task,
          allocatedTime: session.duration / 60,
          sessionNumber: initialSessionsAllocated + 1,
          sessionType: 'initial-learning',
          completionStrategy: 'spaced-repetition-initial',
          learningPhase: 'acquisition'
        });

        dayData.totalCognitiveLoad += this.calculateCognitiveLoad(task);
        dayData.sessionCount += 1;
        initialSessionsAllocated++;

        debugLog(`📚 Allocated initial learning session ${initialSessionsAllocated} of ${task.name} to ${dateKey}`);
      }
    }

    spacedSchedule.forEach((reviewSession, index) => {
      const reviewDateKey = format(reviewSession.date, 'yyyy-MM-dd');
      if (allocation[reviewDateKey]) {
        const dayData = allocation[reviewDateKey];

        if (dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.9) {
          dayData.tasks.push({
            ...task,
            allocatedTime: reviewSession.estimatedDuration,
            sessionNumber: initialSessionsAllocated + index + 1,
            sessionType: reviewSession.reviewType,
            completionStrategy: 'spaced-repetition-review',
            learningPhase: 'retention',
            reviewInterval: reviewSession.date
          });

          dayData.totalCognitiveLoad += this.calculateCognitiveLoad(task) * 0.5;
          dayData.sessionCount += 1;

          debugLog(`📚 Allocated review session for ${task.name} to ${reviewDateKey} (${reviewSession.reviewType})`);
        }
      }
    });

    if (initialSessionsAllocated > 0) {
      allocatedTasks.add(task.id);
      return true;
    }

    return false;
  }

  allocateDeepWorkTask(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`🛠️ Deep work allocation for ${task.name}`);

    const availableDays = Object.keys(allocation);
    const sessionsNeeded = sessionPlan.totalSessions;
    const timePreference = this.determineOptimalTimeOfDay(task);

    const deepWorkDays = availableDays.filter(dateKey => {
      const dayData = allocation[dateKey];
      return dayData.sessionCount < 2 &&
             dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.7;
    });

    if (deepWorkDays.length === 0) {
      debugLog(`⚠️ No suitable deep work days found for ${task.name}`);
      return this.allocateRegularTaskOptimally(task, allocation, allocatedTasks, sessionPlan);
    }

    const sessionsPerDay = sessionPlan.recommendedSessionsPerDay === 1 ? 1 : 2;
    let sessionsAllocated = 0;

    for (const dateKey of deepWorkDays) {
      if (sessionsAllocated >= sessionsNeeded) break;

      const dayData = allocation[dateKey];
      const sessionsForThisDay = Math.min(sessionsPerDay, sessionsNeeded - sessionsAllocated);

      for (let i = 0; i < sessionsForThisDay; i++) {
        if (sessionsAllocated >= sessionsNeeded) break;

        const session = sessionPlan.sessions[sessionsAllocated];
        dayData.tasks.push({
          ...task,
          allocatedTime: session.duration / 60,
          sessionNumber: session.sessionNumber,
          sessionType: 'deep-work',
          completionStrategy: 'deep-work-block',
          flowStateOptimized: true,
          preferredTimeSlots: timePreference.preferred.slice(0, 3)
        });

        dayData.totalCognitiveLoad += this.calculateCognitiveLoad(task);
        dayData.sessionCount += 1;
        sessionsAllocated++;

        debugLog(`🛠️ Allocated deep work session ${session.sessionNumber} of ${task.name} to ${dateKey}`);
      }
    }

    if (sessionsAllocated > 0) {
      allocatedTasks.add(task.id);
      return true;
    }

    return false;
  }

  allocateRegularTaskOptimally(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`📝 Optimal regular allocation for ${task.name}`);

    const availableDays = Object.keys(allocation);
    const sessionsNeeded = sessionPlan.totalSessions;
    const cognitiveLoad = this.calculateCognitiveLoad(task);

    const urgency = this.calculateUrgency(task);
    debugLog(`📊 Task details: sessions=${sessionsNeeded}, cognitiveLoad=${cognitiveLoad.toFixed(2)}, urgency=${urgency.toFixed(2)}`);

    if (urgency >= 0.6) {
      debugLog(`🚨 High urgency task - using priority allocation`);
      return this.allocateUrgentTask(task, allocation, allocatedTasks, sessionPlan);
    }

    const suitableDays = availableDays.filter(dateKey => {
      const dayData = allocation[dateKey];
      const currentLoad = dayData.totalCognitiveLoad || 0;
      const maxLoad = this.userPreferences.maxStudyHoursPerDay * 0.9;
      return currentLoad < maxLoad;
    });

    if (suitableDays.length === 0) {
      debugLog(`⚠️ No suitable days with capacity found for ${task.name}, trying fallback`);
      return this.fallbackTaskAllocation(task, allocation, task.timeRequired - (task.timeSpent || 0), allocatedTasks);
    }

    debugLog(`📅 Found ${suitableDays.length} suitable days for distribution`);

    const daysToUse = Math.min(availableDays.length, Math.ceil(sessionsNeeded / 2));
    const sessionsPerDay = Math.ceil(sessionsNeeded / daysToUse);

    let sessionsAllocated = 0;
    let dayIndex = 0;

    while (sessionsAllocated < sessionsNeeded && dayIndex < availableDays.length) {
      const dateKey = availableDays[dayIndex];
      const dayData = allocation[dateKey];

      if (dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.9) {
        const sessionsForThisDay = Math.min(sessionsPerDay, sessionsNeeded - sessionsAllocated);

        for (let i = 0; i < sessionsForThisDay && sessionsAllocated < sessionsNeeded; i++) {
          const session = sessionPlan.sessions[sessionsAllocated];

          dayData.tasks.push({
            ...task,
            allocatedTime: session.duration / 60,
            sessionNumber: session.sessionNumber,
            sessionType: session.type,
            completionStrategy: 'optimal-distribution',
            adaptiveScheduling: true
          });

          dayData.totalCognitiveLoad += cognitiveLoad;
          dayData.sessionCount += 1;
          sessionsAllocated++;

          debugLog(`📝 Allocated regular session ${session.sessionNumber} of ${task.name} to ${dateKey}`);
        }
      }

      dayIndex++;
    }

    if (sessionsAllocated > 0) {
      allocatedTasks.add(task.id);
      return true;
    }

    return false;
  }

  allocateUrgentTask(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`🚨 Priority allocation for urgent task: ${task.name}`);

    const availableDays = Object.keys(allocation);
    const sessionsNeeded = sessionPlan.totalSessions;
    const cognitiveLoad = this.calculateCognitiveLoad(task);

    let sessionsAllocated = 0;

    for (const dateKey of availableDays) {
      if (sessionsAllocated >= sessionsNeeded) break;

      const dayData = allocation[dateKey];
      const currentLoad = dayData.totalCognitiveLoad || 0;

      const maxLoad = this.userPreferences.maxStudyHoursPerDay;
      const remainingCapacity = maxLoad - currentLoad;

      if (remainingCapacity <= 0.25) {
        debugLog(`⏭️ Skipping ${dateKey} - no capacity remaining (${remainingCapacity.toFixed(2)}h)`);
        continue;
      }

      const maxSessionsThisDay = Math.min(
        3,
        sessionsNeeded - sessionsAllocated,
        Math.floor(remainingCapacity / (cognitiveLoad * 0.5)) || 1
      );

      for (let i = 0; i < maxSessionsThisDay; i++) {
        if (sessionsAllocated >= sessionsNeeded) break;

        const session = sessionPlan.sessions[sessionsAllocated];

        dayData.tasks.push({
          ...task,
          allocatedTime: session.duration / 60,
          sessionNumber: session.sessionNumber,
          sessionType: 'urgent-priority',
          completionStrategy: 'urgent-allocation',
          adaptiveScheduling: true,
          taskPriority: this.calculateUrgency(task),
          isUrgent: true
        });

        dayData.totalCognitiveLoad += cognitiveLoad * 0.8;
        dayData.sessionCount += 1;
        sessionsAllocated++;

        debugLog(`🚨 Allocated urgent session ${session.sessionNumber} of ${task.name} to ${dateKey}`);
      }
    }

    if (sessionsAllocated > 0) {
      allocatedTasks.add(task.id);
      debugLog(`✅ Successfully allocated ${sessionsAllocated}/${sessionsNeeded} urgent sessions for ${task.name}`);
      return true;
    }

    debugLog(`❌ Failed to allocate urgent task ${task.name} even with priority scheduling`);
    return false;
  }

  // -------------------------------------------------------------------------
  // Merge & day-schedule helpers
  // -------------------------------------------------------------------------

  mergeScheduleWithCognitiveStrategy(existingSchedule, newAllocations) {
    debugLog("🧠 Merging schedule with cognitive optimization...");

    const mergedSchedule = { ...existingSchedule };

    Object.entries(newAllocations).forEach(([dateKey, newTasks]) => {
      if (newTasks.length === 0) {
        if (!mergedSchedule[dateKey]) {
          mergedSchedule[dateKey] = [];
        }
        return;
      }

      const existingDaySchedule = existingSchedule[dateKey] || [];

      const [year, month, day] = dateKey.split('-').map(Number);
      const currentDay = new Date(year, month - 1, day);
      const newDaySchedule = this.generateCognitiveOptimizedDaySchedule(newTasks, currentDay, existingDaySchedule);

      const combinedSchedule = [...existingDaySchedule, ...newDaySchedule];

      combinedSchedule.sort((a, b) => {
        const timeA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
        const timeB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);

        const hourA = timeA.getHours();
        const hourB = timeB.getHours();

        const isPeakA = this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hourA);
        const isPeakB = this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hourB);

        if (isPeakA && !isPeakB) return -1;
        if (isPeakB && !isPeakA) return 1;

        return timeA - timeB;
      });

      mergedSchedule[dateKey] = combinedSchedule;

      debugLog(`🧠 ${dateKey}: ${existingDaySchedule.length} existing + ${newDaySchedule.length} new = ${combinedSchedule.length} total (cognitive optimized)`);
    });

    return mergedSchedule;
  }

  generateCognitiveOptimizedDaySchedule(tasks, date, existingDaySchedule = []) {
    debugLog(`🧠 generateCognitiveOptimizedDaySchedule called for ${format(date, 'yyyy-MM-dd')}`);
    debugLog(`📝 Allocated tasks count: ${tasks?.length || 0}`);
    debugLog(`📋 Existing day schedule items: ${existingDaySchedule?.length || 0}`);

    if (!tasks || tasks.length === 0) {
      debugLog(`📭 No allocated tasks for ${format(date, 'yyyy-MM-dd')}`);
      return [];
    }

    const daySchedule = [];

    let remainingCognitiveCapacity = this.calculateDailyCognitiveCapacity(date);
    debugLog(`🧠 Available cognitive capacity for ${format(date, 'yyyy-MM-dd')}: ${remainingCognitiveCapacity.toFixed(2)}`);

    const cognitiveOptimizedTasks = this.sortTasksByCognitiveFactors(tasks, date);
    debugLog(`🧠 Tasks sorted by cognitive factors:`, cognitiveOptimizedTasks.map(t => ({
      name: t.taskName || t.name,
      cognitiveLoad: t.cognitiveLoad || 0,
      sessionType: t.sessionType,
      preferredTimeSlots: t.preferredTimeSlots
    })));

    for (const task of cognitiveOptimizedTasks) {
      if (remainingCognitiveCapacity <= 0.1) {
        debugLog(`🧠 Cognitive capacity exhausted for ${format(date, 'yyyy-MM-dd')}`);
        break;
      }

      debugLog(`🧠 Processing cognitive task: ${task.taskName || task.name}`);

      const sessionDuration = this.calculateCognitiveSessionDuration(task, remainingCognitiveCapacity);

      if (sessionDuration < 15) {
        debugLog(`⏭️ Skipping task ${task.taskName || task.name} - session too short (${sessionDuration}min < 15min)`);
        continue;
      }

      const timeSlot = this.findCognitiveOptimalTimeSlot(task, date, sessionDuration, [...existingDaySchedule, ...daySchedule]);

      if (timeSlot) {
        const scheduleItem = this.createCognitiveScheduleItem(task, timeSlot, sessionDuration, date);
        daySchedule.push(scheduleItem);

        const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
        remainingCognitiveCapacity -= cognitiveLoad * (sessionDuration / 60);

        debugLog(`✅ Added cognitive schedule item: ${task.taskName || task.name} (${sessionDuration}min, load: ${cognitiveLoad.toFixed(2)})`);
        debugLog(`🧠 Remaining cognitive capacity: ${remainingCognitiveCapacity.toFixed(2)}`);
      } else {
        debugLog(`❌ No optimal time slot found for cognitive task: ${task.taskName || task.name}`);
      }
    }

    debugLog(`🧠 Generated ${daySchedule.length} cognitive-optimized schedule items from ${tasks.length} allocated tasks`);
    return daySchedule;
  }

  findCognitiveOptimalTimeSlot(task, date, durationMinutes, existingSchedule = []) {
    debugLog(`🧠 Finding cognitive-optimal time slot for ${task.taskName || task.name} on ${format(date, 'yyyy-MM-dd')} (${durationMinutes}min)`);

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const blackoutSchedule = this.userPreferences.blackoutSchedule || {};
    const dayBlackouts = blackoutSchedule[dayOfWeek] || [];

    const now = new Date();
    const targetDateStr = format(date, 'yyyy-MM-dd');
    const todayDateStr = format(now, 'yyyy-MM-dd');
    const isToday = targetDateStr === todayDateStr;

    const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
    const preferredTimeSlots = task.preferredTimeSlots || this.determineOptimalTimeOfDay(task).preferred;

    debugLog(`🧠 Task cognitive load: ${cognitiveLoad.toFixed(2)}, preferred hours: [${preferredTimeSlots.join(', ')}]`);

    let startHour = this.userPreferences.studyStartTime || 7;
    let endHour = this.userPreferences.studyEndTime || 21;

    let adjustedCogStartMinute = 0;

    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentHour >= startHour) {
        startHour = currentHour;
        adjustedCogStartMinute = Math.ceil(currentMinute / 15) * 15;
        if (adjustedCogStartMinute >= 60) {
          startHour += 1;
          adjustedCogStartMinute = 0;
        }
      }
    }

    const candidateSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const startMinute = (hour === startHour && isToday) ? adjustedCogStartMinute : 0;

      for (let minute = startMinute; minute < 60; minute += 15) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

        const endMinutes = slotEnd.getMinutes();
        const alignedEndMinutes = Math.min(55, Math.round(endMinutes / 5) * 5);
        slotEnd.setMinutes(alignedEndMinutes);

        const actualDuration = Math.round((slotEnd - slotStart) / (1000 * 60));

        if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
          continue;
        }

        const slotStartTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const slotEndTime = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;

        const hasBlackoutConflict = this.checkBlackoutConflict(slotStartTime, slotEndTime, dayBlackouts);
        const hasScheduleConflict = this.checkScheduleConflict(slotStart, slotEnd, existingSchedule);

        if (!hasBlackoutConflict && !hasScheduleConflict) {
          const cognitiveScore = this.calculateCognitiveTimeSlotScore(hour, cognitiveLoad, preferredTimeSlots, task.sessionType);

          candidateSlots.push({
            start: slotStart,
            end: slotEnd,
            hour: hour,
            cognitiveScore: cognitiveScore,
            actualDuration: actualDuration,
            timeStr: `${slotStartTime}-${slotEndTime}`
          });
        }
      }
    }

    if (candidateSlots.length === 0) {
      debugLog(`❌ No available time slots found for ${task.taskName || task.name}`);
      return null;
    }

    candidateSlots.sort((a, b) => b.cognitiveScore - a.cognitiveScore);

    const bestSlot = candidateSlots[0];
    debugLog(`✅ Found cognitive-optimal slot: ${bestSlot.timeStr} (score: ${bestSlot.cognitiveScore.toFixed(2)})`);

    return {
      start: bestSlot.start,
      end: bestSlot.end,
      cognitiveScore: bestSlot.cognitiveScore
    };
  }

  createCognitiveScheduleItem(task, timeSlot, sessionDuration, date) {
    const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
    const breaks = task.breaks || this.calculateOptimalBreaks(task);
    const learningStrategy = task.learningStrategy || this.selectOptimalLearningStrategy(task);

    const actualDuration = timeSlot.actualDuration || sessionDuration;

    return {
      id: `cognitive_schedule_${task.taskId || task.id}_${date.getTime()}_${timeSlot.start.getTime()}`,
      taskId: task.taskId || task.id,
      taskName: task.taskName || task.name,
      task: task.taskName || task.name,
      subject: task.subject,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      duration: actualDuration,
      timeSpent: 0,
      completed: false,
      date: format(date, 'yyyy-MM-dd'),

      cognitiveLoad: cognitiveLoad,
      sessionType: task.sessionType || 'standard',
      completionStrategy: task.completionStrategy || 'cognitive-optimized',
      cognitiveScore: timeSlot.cognitiveScore,

      learningStrategy: learningStrategy.primary,
      studyTechniques: learningStrategy.techniques,
      evidence: learningStrategy.evidence,

      breakStructure: breaks,

      urgency: this.calculateUrgency(task),
      difficulty: task.difficulty || 'Medium',
      sessionProgress: sessionDuration / 60,
      remainingAfterSession: Math.max(0, (task.allocatedTime || 1) - (sessionDuration / 60)),

      notes: this.generateCognitiveStudyNotes(task),

      sessionNumber: task.sessionNumber || 1,
      learningPhase: task.learningPhase || 'acquisition',
      flowStateOptimized: task.flowStateOptimized || false,
      adaptiveScheduling: true
    };
  }

  // -------------------------------------------------------------------------
  // Fallback & helper allocation methods
  // -------------------------------------------------------------------------

  fallbackTaskAllocation(task, allocation, remainingTime, allocatedTasks) {
    debugLog(`🔄 Attempting fallback allocation for ${task.name} (${remainingTime.toFixed(2)}h needed)`);

    const availableDays = Object.keys(allocation);
    let timeToAllocate = remainingTime;

    for (const day of availableDays) {
      if (timeToAllocate <= 0) break;

      const dayTasks = allocation[day]?.tasks || allocation[day] || [];
      const currentDayTime = (Array.isArray(dayTasks) ? dayTasks : []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
      const availableTime = Math.max(0, this.userPreferences.maxStudyHoursPerDay - currentDayTime);

      if (availableTime > 0) {
        const sessionTime = Math.min(timeToAllocate, availableTime, 2);

        const newItem = {
          ...task,
          allocatedTime: sessionTime,
          completionStrategy: 'fallback-session',
          sessionNote: `Fallback allocation (${sessionTime.toFixed(2)}h of ${remainingTime.toFixed(2)}h total)`
        };

        if (allocation[day]?.tasks) {
          allocation[day].tasks.push(newItem);
        } else if (Array.isArray(allocation[day])) {
          allocation[day].push(newItem);
        }

        timeToAllocate -= sessionTime;
        debugLog(`📅 Fallback: Allocated ${sessionTime.toFixed(2)}h of ${task.name} to ${day}`);
      }
    }

    if (timeToAllocate < remainingTime) {
      allocatedTasks.add(task.id);
      debugLog(`✅ Fallback allocation partially successful for ${task.name} (${(remainingTime - timeToAllocate).toFixed(2)}h allocated)`);

      if (timeToAllocate > 0) {
        debugLog(`⚠️ Could not allocate remaining ${timeToAllocate.toFixed(2)}h for ${task.name}`);
      }
      return true;
    }

    debugLog(`❌ Fallback allocation completely failed for ${task.name}`);
    return false;
  }

  findBestDayForSmallTask(task, allocation, urgency) {
    const availableDays = Object.keys(allocation);

    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const timeSpent = task.timeSpent || 0;
    const remainingTime = Math.max(0, timeRequired - timeSpent);

    debugLog(`🔍 Finding best day for small task ${task.name}: ${remainingTime.toFixed(2)}h needed`);

    if (urgency >= 0.7) {
      const result = availableDays.find(day => {
        const dayTasks = allocation[day]?.tasks || allocation[day] || [];
        const totalTime = (Array.isArray(dayTasks) ? dayTasks : []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
        const wouldFit = totalTime + remainingTime <= this.userPreferences.maxStudyHoursPerDay;
        debugLog(`   Checking urgent day ${day}: ${totalTime.toFixed(2)}h used + ${remainingTime.toFixed(2)}h needed = ${(totalTime + remainingTime).toFixed(2)}h (max: ${this.userPreferences.maxStudyHoursPerDay}h) -> ${wouldFit ? 'fits' : 'too much'}`);
        return wouldFit;
      });
      debugLog(`🎯 Urgent task best day result: ${result || 'none found'}`);
      return result;
    }

    const result = availableDays.reduce((best, day) => {
      const dayTasks = allocation[day]?.tasks || allocation[day] || [];
      const totalTime = (Array.isArray(dayTasks) ? dayTasks : []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);

      if (totalTime + remainingTime > this.userPreferences.maxStudyHoursPerDay) {
        debugLog(`   Skipping day ${day}: ${totalTime.toFixed(2)}h + ${remainingTime.toFixed(2)}h = ${(totalTime + remainingTime).toFixed(2)}h > ${this.userPreferences.maxStudyHoursPerDay}h max`);
        return best;
      }

      if (!best) {
        debugLog(`   First viable day: ${day} (${totalTime.toFixed(2)}h used)`);
        return day;
      }

      const bestTotalTime = (allocation[best]?.tasks || allocation[best] || []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
      const isBetter = totalTime < bestTotalTime;
      debugLog(`   Comparing ${day} (${totalTime.toFixed(2)}h) vs ${best} (${bestTotalTime.toFixed(2)}h): ${isBetter ? day : best} is better`);
      return isBetter ? day : best;
    }, null);

    debugLog(`🎯 Regular task best day result: ${result || 'none found'}`);
    return result;
  }

  findEarliestAvailableDay(allocation) {
    return Object.keys(allocation)[0];
  }

  findBalancedStartDay(allocation, urgency) {
    const availableDays = Object.keys(allocation);

    if (urgency >= 0.5) {
      return availableDays[0] || availableDays[1];
    }

    return availableDays[1] || availableDays[2] || availableDays[0];
  }

  calculateDaysNeeded(hours) {
    const maxHoursPerDay = this.userPreferences.maxStudyHoursPerDay;
    return Math.ceil(hours / maxHoursPerDay);
  }

  allocateTaskAcrossDays(task, allocation, startDay, daysNeeded, allocatedTasks) {
    const availableDays = Object.keys(allocation);
    const startIndex = availableDays.indexOf(startDay);

    if (startIndex === -1) return false;

    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const timeSpent = task.timeSpent || 0;
    const remainingTime = Math.max(0, timeRequired - timeSpent);

    let timeToAllocate = remainingTime;
    let dayIndex = startIndex;

    while (timeToAllocate > 0 && dayIndex < availableDays.length && dayIndex < startIndex + daysNeeded) {
      const day = availableDays[dayIndex];
      const dayTasks = allocation[day]?.tasks || allocation[day] || [];
      const currentDayTime = (Array.isArray(dayTasks) ? dayTasks : []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
      const availableTime = this.userPreferences.maxStudyHoursPerDay - currentDayTime;

      if (availableTime > 0) {
        const sessionTime = Math.min(timeToAllocate, availableTime);

        const newItem = {
          ...task,
          allocatedTime: sessionTime,
          completionStrategy: 'multi-session',
          sessionNumber: dayIndex - startIndex + 1
        };

        if (allocation[day]?.tasks) {
          allocation[day].tasks.push(newItem);
        } else if (Array.isArray(allocation[day])) {
          allocation[day].push(newItem);
        }

        timeToAllocate -= sessionTime;
        debugLog(`📅 Allocated ${sessionTime.toFixed(2)}h of ${task.name} to ${day}`);
      }

      dayIndex++;
    }

    if (timeToAllocate <= 0) {
      allocatedTasks.add(task.id);
      return true;
    }

    debugLog(`⚠️ Could not fully allocate task ${task.name}: ${(remainingTime - timeToAllocate).toFixed(2)}h allocated of ${remainingTime.toFixed(2)}h required (${timeToAllocate.toFixed(2)}h remaining)`);
    return false;
  }

  getScheduledTaskIds(existingSchedule, tasks, preserveCurrentDay = false) {
    const scheduledTaskIds = new Set();
    const taskIds = new Set(tasks.map(t => t.id));

    const now = new Date();
    const todayDateString = format(now, 'yyyy-MM-dd');

    Object.values(existingSchedule).forEach(daySchedule => {
      if (Array.isArray(daySchedule)) {
        daySchedule.forEach(item => {
          if (item.taskId && taskIds.has(item.taskId) && !item.completed) {
            const task = tasks.find(t => t.id === item.taskId);
            if (task && !task.is_completed) {
              const itemStartTime = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
              const itemDateString = item.date || format(itemStartTime, 'yyyy-MM-dd');

              let shouldPreserve = false;

              if (preserveCurrentDay && itemDateString === todayDateString) {
                shouldPreserve = true;
                debugLog(`🔒 Preserving current day item: ${item.taskName} at ${itemStartTime.toLocaleTimeString()}`);
              } else if (!preserveCurrentDay && itemStartTime > now) {
                shouldPreserve = true;
              }

              if (shouldPreserve) {
                const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
                const timeSpent = task.timeSpent || 0;

                if (timeSpent < timeRequired) {
                  scheduledTaskIds.add(item.taskId);
                }
              }
            }
          }
        });
      }
    });

    debugLog("📋 Tasks preserved from existing schedule (future items only):", Array.from(scheduledTaskIds));
    return scheduledTaskIds;
  }

  mergeScheduleWithExisting(existingSchedule, newAllocations) {
    return this.mergeScheduleWithCognitiveStrategy(existingSchedule, newAllocations);
  }

  // -------------------------------------------------------------------------
  // Task validation & sanitization
  // -------------------------------------------------------------------------

  validateAndSanitizeTasks(tasks) {
    if (!Array.isArray(tasks)) {
      console.error("❌ Tasks is not an array:", tasks);
      return [];
    }

    const validTasks = [];

    for (const task of tasks) {
      try {
        if (!task || typeof task !== 'object') {
          console.warn("⚠️ Skipping invalid task (not an object):", task);
          continue;
        }

        if (!task.id) {
          console.warn("⚠️ Skipping task without ID:", task);
          continue;
        }

        if (!task.name || typeof task.name !== 'string') {
          console.warn("⚠️ Skipping task without valid name:", task);
          continue;
        }

        if (task.is_completed === true) {
          debugLog(`✅ Skipping completed task: ${task.name}`);
          continue;
        }

        const sanitizedTask = {
          ...task,
          name: task.name.trim(),
          subject: task.subject || 'General',
          type: task.type || 'homework',
          difficulty: task.difficulty || 'Medium',
          timeRequired: this.sanitizeTimeRequired(task),
          timeSpent: this.sanitizeTimeSpent(task),
          deadline: this.sanitizeDeadline(task),
          estimated_time: task.estimated_time || 60,
          is_completed: task.is_completed === true
        };

        if (!sanitizedTask.deadline || isNaN(sanitizedTask.deadline.getTime())) {
          console.warn("⚠️ Skipping task with invalid deadline:", task.name);
          continue;
        }

        const now = new Date();
        if (sanitizedTask.deadline < now && !sanitizedTask.is_completed) {
          console.warn("⚠️ Task is past deadline:", task.name, sanitizedTask.deadline);
        }

        if (sanitizedTask.timeRequired <= 0) {
          console.warn("⚠️ Task has invalid time requirement:", task.name, sanitizedTask.timeRequired);
          sanitizedTask.timeRequired = 1;
        }

        if (sanitizedTask.timeSpent < 0) {
          console.warn("⚠️ Task has negative time spent:", task.name, sanitizedTask.timeSpent);
          sanitizedTask.timeSpent = 0;
        }

        if (sanitizedTask.timeSpent >= sanitizedTask.timeRequired) {
          debugLog(`✅ Skipping completed task (time): ${task.name} (${sanitizedTask.timeSpent}h >= ${sanitizedTask.timeRequired}h)`);
          continue;
        }

        validTasks.push(sanitizedTask);
        debugLog(`✅ Validated task: ${sanitizedTask.name} (${(sanitizedTask.timeRequired - sanitizedTask.timeSpent).toFixed(2)}h remaining)`);

      } catch (error) {
        console.error("❌ Error validating task:", task, error);
        continue;
      }
    }

    debugLog(`📊 Task validation summary: ${tasks.length} input → ${validTasks.length} valid`);
    return validTasks;
  }

  sanitizeTimeRequired(task) {
    if (typeof task.timeRequired === 'number' && task.timeRequired > 0) {
      return task.timeRequired;
    }

    if (typeof task.estimated_time === 'number' && task.estimated_time > 0) {
      return task.estimated_time / 60;
    }

    const defaults = {
      homework: 1,
      test: 2,
      project: 4,
      reading: 1.5,
      lab: 2,
      essay: 3
    };

    return defaults[task.type] || 1;
  }

  sanitizeTimeSpent(task) {
    if (typeof task.timeSpent === 'number' && task.timeSpent >= 0) {
      return task.timeSpent;
    }
    return 0;
  }

  sanitizeDeadline(task) {
    const taskDeadline = task.deadline || task.dueDate;
    if (!taskDeadline) {
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);
      return defaultDeadline;
    }

    if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
      return taskDeadline.toDate();
    }

    const date = new Date(taskDeadline);
    if (isNaN(date.getTime())) {
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);
      return defaultDeadline;
    }

    return date;
  }
}

// ---------------------------------------------------------------------------
// Mix in methods from conflicts.js and priorities.js onto the prototype
// ---------------------------------------------------------------------------

Object.entries(conflictMethods).forEach(([name, fn]) => {
  IntelligentScheduler.prototype[name] = fn;
});

Object.entries(priorityMethods).forEach(([name, fn]) => {
  IntelligentScheduler.prototype[name] = fn;
});

export default IntelligentScheduler;
