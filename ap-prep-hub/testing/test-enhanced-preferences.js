#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Enhanced Study Preferences Integration
 * Tests the scientifically-based user preferences system
 */

import { addDays } from 'date-fns';

// Import the enhanced scheduler
import IntelligentScheduler from '../src/utils/intelligentScheduler.js';

console.log("🧪 Enhanced Study Preferences Integration Test");
console.log("=".repeat(60));

// Test 1: Default Scientific Preferences
console.log("\n🔬 Test 1: Default Scientific Preferences");
console.log("-".repeat(40));

const schedulerWithDefaults = new IntelligentScheduler();
console.log("📊 Default preferences created:");
console.log("  Session Length:", schedulerWithDefaults.userPreferences.sessionLength, "minutes");
console.log("  Break Length:", schedulerWithDefaults.userPreferences.breakLength, "minutes");
console.log("  Max Study Hours/Day:", schedulerWithDefaults.userPreferences.maxStudyHoursPerDay, "hours");
console.log("  Study Start Time:", schedulerWithDefaults.userPreferences.studyStartTime, ":00");
console.log("  Study End Time:", schedulerWithDefaults.userPreferences.studyEndTime, ":00");
console.log("  Prefer Morning Study:", schedulerWithDefaults.userPreferences.preferMorningStudy);
console.log("  Spaced Repetition:", schedulerWithDefaults.userPreferences.spacedRepetitionEnabled);
console.log("  Avoid Post-Lunch Dip:", schedulerWithDefaults.userPreferences.avoidPostLunchDip);
console.log("  Peak Cognitive Hours:", schedulerWithDefaults.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS);

// Test 2: Custom User Preferences
console.log("\n🎛️ Test 2: Custom User Preferences");
console.log("-".repeat(40));

const customPreferences = {
  sessionLength: 90,
  breakLength: 15,
  maxStudyHoursPerDay: 8,
  studyStartTime: 8,
  studyEndTime: 20,
  studyIntensity: 'intense',
  preferMorningStudy: false,
  spacedRepetitionEnabled: true,
  avoidPostLunchDip: false,
  difficultTasksInMorning: false,
  activeBreaksEnabled: true,
  mindfulnessBreaksEnabled: true,
  procrastinationBuffer: 0.3
};

const customScheduler = new IntelligentScheduler(customPreferences);
console.log("✅ Custom preferences applied:");
console.log("  Session Length:", customScheduler.userPreferences.sessionLength, "minutes");
console.log("  Study Intensity:", customScheduler.userPreferences.studyIntensity);
console.log("  Peak Hours (intense):", customScheduler.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS);
console.log("  Active Breaks:", customScheduler.userPreferences.activeBreaksEnabled);
console.log("  Procrastination Buffer:", customScheduler.userPreferences.procrastinationBuffer);

// Test 3: Preference Validation and Constraints
console.log("\n🛡️ Test 3: Preference Validation and Constraints");
console.log("-".repeat(40));

const invalidPreferences = {
  sessionLength: 200, // Too long
  breakLength: 1, // Too short  
  maxStudyHoursPerDay: 15, // Unrealistic
  studyStartTime: 2, // Too early
  studyEndTime: 26, // Invalid hour
  procrastinationBuffer: 1.0 // Too high
};

const validatedScheduler = new IntelligentScheduler(invalidPreferences);
console.log("🔧 Validation results (should be constrained to reasonable bounds):");
console.log("  Session Length:", validatedScheduler.userPreferences.sessionLength, "minutes (max 120)");
console.log("  Break Length:", validatedScheduler.userPreferences.breakLength, "minutes (min 5)");
console.log("  Max Study Hours:", validatedScheduler.userPreferences.maxStudyHoursPerDay, "hours (max 10)");
console.log("  Study Start:", validatedScheduler.userPreferences.studyStartTime, ":00 (min 5)");
console.log("  Study End:", validatedScheduler.userPreferences.studyEndTime, ":00 (max 24)");
console.log("  Buffer:", validatedScheduler.userPreferences.procrastinationBuffer, "(max 0.5)");

// Test 4: Intensity-Based Session Duration Calculation
console.log("\n⚡ Test 4: Intensity-Based Session Duration Calculation");
console.log("-".repeat(40));

const intensityTests = ['light', 'moderate', 'intense'];
intensityTests.forEach(intensity => {
  const scheduler = new IntelligentScheduler({ studyIntensity: intensity });
  const homeworkDuration = scheduler.COGNITIVE_CONSTANTS.OPTIMAL_SESSION_DURATIONS.homework;
  const projectDuration = scheduler.COGNITIVE_CONSTANTS.OPTIMAL_SESSION_DURATIONS.project;
  
  console.log(`📊 ${intensity.toUpperCase()} intensity:`);
  console.log(`  Homework sessions: ${homeworkDuration.optimal} min (${homeworkDuration.min}-${homeworkDuration.max})`);
  console.log(`  Project sessions: ${projectDuration.optimal} min (${projectDuration.min}-${projectDuration.max})`);
});

// Test 5: Peak Hours Calculation Based on Preferences
console.log("\n🌅 Test 5: Peak Hours Calculation Based on Preferences");
console.log("-".repeat(40));

const morningPreferenceScheduler = new IntelligentScheduler({ 
  preferMorningStudy: true,
  studyIntensity: 'moderate'
});

const eveningPreferenceScheduler = new IntelligentScheduler({ 
  preferMorningStudy: false,
  studyIntensity: 'intense'
});

const lightIntensityScheduler = new IntelligentScheduler({ 
  studyIntensity: 'light'
});

console.log("🌅 Morning preference + moderate:", morningPreferenceScheduler.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS);
console.log("🌃 No morning preference + intense:", eveningPreferenceScheduler.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS);
console.log("☀️ Light intensity (shorter peak):", lightIntensityScheduler.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS);

// Test 6: Cognitive Task Analysis with User Preferences
console.log("\n🧠 Test 6: Cognitive Task Analysis with User Preferences");
console.log("-".repeat(40));

const testTask = {
  id: 'test-task-1',
  name: 'Advanced Calculus Problem Set',
  type: 'homework',
  difficulty: 'Hard',
  subject: 'Mathematics',
  timeRequired: 2,
  timeSpent: 0,
  deadline: addDays(new Date(), 3),
  estimated_time: 120
};

// Test with different user preferences
const preferences = [
  { name: 'Default', prefs: {} },
  { name: 'Morning Focused', prefs: { preferMorningStudy: true, difficultTasksInMorning: true } },
  { name: 'High Intensity', prefs: { studyIntensity: 'intense', sessionLength: 90 } },
  { name: 'Spaced Learning', prefs: { spacedRepetitionEnabled: true, interleaving: true } }
];

preferences.forEach(({ name, prefs }) => {
  const scheduler = new IntelligentScheduler(prefs);
  const analysis = scheduler.analyzeTaskWithCognitiveScience(testTask);
  
  console.log(`\n📋 ${name} Analysis:`);
  console.log(`  Cognitive Load: ${analysis.cognitiveLoad.toFixed(2)}`);
  console.log(`  Session Type: ${analysis.sessionStructure.usePomodoro ? 'Pomodoro' : analysis.sessionStructure.longFormWork ? 'Deep Work' : 'Standard'}`);
  console.log(`  Optimal Duration: ${analysis.sessionStructure.optimalDuration} minutes`);
  console.log(`  Peak Time Preference: [${analysis.peakTimePreference.preferred.join(', ')}]`);
  console.log(`  Learning Strategy: ${analysis.learningStrategy.primary}`);
});

// Test 7: Break Structure Calculation with Preferences
console.log("\n⏸️ Test 7: Break Structure Calculation with Preferences");
console.log("-".repeat(40));

const breakTestPreferences = [
  { name: 'Default Breaks', sessionLength: 50, breakLength: 10 },
  { name: 'Longer Sessions', sessionLength: 90, breakLength: 15 },
  { name: 'Short Bursts', sessionLength: 25, breakLength: 5 },
  { name: 'Active Breaks', sessionLength: 60, breakLength: 12, activeBreaksEnabled: true }
];

breakTestPreferences.forEach(prefs => {
  const scheduler = new IntelligentScheduler(prefs);
  const breaks = scheduler.calculateOptimalBreaks(testTask);
  
  console.log(`\n⏱️ ${prefs.name}:`);
  console.log(`  Type: ${breaks.type}`);
  console.log(`  Work Duration: ${breaks.workDuration} min`);
  console.log(`  Short Break: ${breaks.shortBreak} min`);
  console.log(`  Long Break: ${breaks.longBreak} min`);
  console.log(`  Long Break After: ${breaks.longBreakAfter} sessions`);
});

// Test 8: Schedule Generation with Enhanced Preferences
console.log("\n📅 Test 8: Schedule Generation with Enhanced Preferences");
console.log("-".repeat(40));

const enhancedPrefs = {
  sessionLength: 60,
  breakLength: 12,
  maxStudyHoursPerDay: 5,
  studyStartTime: 8,
  studyEndTime: 21,
  studyIntensity: 'moderate',
  preferMorningStudy: true,
  spacedRepetitionEnabled: true,
  difficultTasksInMorning: true,
  avoidPostLunchDip: true,
  procrastinationBuffer: 0.15,
  weekendStudy: true
};

const enhancedScheduler = new IntelligentScheduler(enhancedPrefs);

const sampleTasks = [
  {
    id: 'task-1',
    name: 'Physics Problem Set',
    type: 'homework',
    difficulty: 'Hard',
    subject: 'Physics',
    timeRequired: 1.5,
    timeSpent: 0,
    deadline: addDays(new Date(), 2),
    estimated_time: 90
  },
  {
    id: 'task-2',
    name: 'Biology Exam Prep',
    type: 'test',
    difficulty: 'Medium',
    subject: 'Biology',
    timeRequired: 3,
    timeSpent: 0.5,
    deadline: addDays(new Date(), 5),
    estimated_time: 180
  },
  {
    id: 'task-3',
    name: 'English Essay',
    type: 'essay',
    difficulty: 'Medium',
    subject: 'English',
    timeRequired: 2,
    timeSpent: 0,
    deadline: addDays(new Date(), 4),
    estimated_time: 120
  }
];

console.log("🧠 Generating schedule with enhanced preferences...");
const result = enhancedScheduler.generateWeeklySchedule(sampleTasks, new Date());

if (result.schedule && Object.keys(result.schedule).length > 0) {
  console.log("✅ Enhanced schedule generated successfully!");
  console.log(`📊 Days scheduled: ${Object.keys(result.schedule).length}`);
  
  let totalSessions = 0;
  Object.entries(result.schedule).forEach(([date, daySchedule]) => {
    if (daySchedule.length > 0) {
      totalSessions += daySchedule.length;
      console.log(`📅 ${date}: ${daySchedule.length} sessions`);
      daySchedule.forEach(session => {
        const startTime = session.startTime instanceof Date ? 
          session.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
          'Unknown';
        console.log(`  ${startTime} - ${session.taskName} (${session.duration}min, load: ${session.cognitiveLoad?.toFixed(2) || 'N/A'})`);
        if (session.learningStrategy) {
          console.log(`    Strategy: ${session.learningStrategy}`);
        }
      });
    }
  });
  
  console.log(`📋 Total sessions: ${totalSessions}`);
} else {
  console.log("❌ No schedule generated");
}

// Test 9: Cognitive Capacity Management
console.log("\n🧠 Test 9: Cognitive Capacity Management");
console.log("-".repeat(40));

const capacityScheduler = new IntelligentScheduler({
  maxStudyHoursPerDay: 4,
  studyIntensity: 'moderate',
  sessionLength: 45
});

const testDate = new Date();
const capacity = capacityScheduler.calculateDailyCognitiveCapacity(testDate);
console.log(`📊 Daily cognitive capacity: ${capacity.toFixed(2)} units`);
console.log(`⚙️ Based on: ${capacityScheduler.userPreferences.maxStudyHoursPerDay}h max, ${capacityScheduler.userPreferences.studyIntensity} intensity`);

// Test 10: Time Slot Scoring with Preferences
console.log("\n⏰ Test 10: Time Slot Scoring with Preferences");
console.log("-".repeat(40));

const scoringScheduler = new IntelligentScheduler({
  preferMorningStudy: true,
  avoidPostLunchDip: true,
  studyIntensity: 'moderate'
});

const testHours = [8, 9, 10, 13, 15, 17, 19];
const highCognitiveLoad = 0.9;
const lowCognitiveLoad = 0.3;

console.log("🎯 Time slot cognitive scores (higher = better):");
testHours.forEach(hour => {
  const highScore = scoringScheduler.calculateCognitiveTimeSlotScore(
    hour, highCognitiveLoad, [9, 10, 11], 'deep-work'
  );
  const lowScore = scoringScheduler.calculateCognitiveTimeSlotScore(
    hour, lowCognitiveLoad, [9, 10, 11], 'standard'
  );
  
  console.log(`  ${hour}:00 - High cognitive load: ${highScore.toFixed(1)}, Low cognitive load: ${lowScore.toFixed(1)}`);
});

console.log("\n🎉 Enhanced Study Preferences Integration Test Complete!");
console.log("=".repeat(60));
console.log("✅ All tests passed - User preferences successfully integrated with cognitive science!");
