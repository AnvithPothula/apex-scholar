#!/usr/bin/env node

/**
 * Test script for the enhanced cognitive-optimized intelligent scheduler
 * Tests all the new scientific features and improvements
 */

import IntelligentScheduler from '../src/utils/intelligentScheduler.js';

// Test configuration
const userPreferences = {
  maxStudyHoursPerDay: 6,
  weekendStudy: true,
  blackoutSchedule: {
    monday: ['12:00-13:00'],
    tuesday: ['18:00-19:00'],
    wednesday: [],
    thursday: ['12:00-13:00'],
    friday: ['17:00-18:00'],
    saturday: [],
    sunday: []
  }
};

// Sample tasks with various characteristics for testing
const testTasks = [
  {
    id: 'task1',
    name: 'AP Chemistry Practice Problems',
    subject: 'Chemistry',
    type: 'homework',
    difficulty: 'Hard',
    timeRequired: 2.5,
    timeSpent: 0,
    estimated_time: 150, // minutes
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    is_completed: false
  },
  {
    id: 'task2',
    name: 'Biology Exam Preparation',
    subject: 'Biology',
    type: 'test',
    difficulty: 'Medium',
    timeRequired: 4,
    timeSpent: 1,
    estimated_time: 240,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    is_completed: false
  },
  {
    id: 'task3',
    name: 'English Literature Essay',
    subject: 'English',
    type: 'essay',
    difficulty: 'Hard',
    timeRequired: 3,
    timeSpent: 0.5,
    estimated_time: 180,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    is_completed: false
  },
  {
    id: 'task4',
    name: 'Physics Lab Report',
    subject: 'Physics',
    type: 'lab',
    difficulty: 'Medium',
    timeRequired: 2,
    timeSpent: 0,
    estimated_time: 120,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    is_completed: false
  },
  {
    id: 'task5',
    name: 'History Reading Assignment',
    subject: 'History',
    type: 'reading',
    difficulty: 'Easy',
    timeRequired: 1.5,
    timeSpent: 0,
    estimated_time: 90,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    is_completed: false
  },
  {
    id: 'task6',
    name: 'Computer Science Project',
    subject: 'Computer Science',
    type: 'project',
    difficulty: 'Hard',
    timeRequired: 6,
    timeSpent: 2,
    estimated_time: 360,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    is_completed: false
  }
];

function runEnhancedSchedulerTests() {
  console.log('🧠 Testing Enhanced Cognitive-Optimized Intelligent Scheduler');
  console.log('='.repeat(60));
  
  const scheduler = new IntelligentScheduler(userPreferences);
  
  // Test 1: Cognitive Task Analysis
  console.log('\n📊 Test 1: Cognitive Task Analysis');
  console.log('-'.repeat(40));
  
  testTasks.forEach(task => {
    console.log(`\n🔍 Analyzing: ${task.name}`);
    const analysis = scheduler.analyzeTaskWithCognitiveScience(task);
    console.log(`  Cognitive Load: ${analysis.cognitiveLoad.toFixed(2)}`);
    console.log(`  Session Structure: ${analysis.sessionStructure.optimalDuration}min sessions`);
    console.log(`  Learning Strategy: ${analysis.learningStrategy.primary}`);
    console.log(`  Peak Time Preference: ${analysis.peakTimePreference.preferred.join(', ')}`);
    console.log(`  Break Type: ${analysis.recommendedBreaks.type}`);
    
    if (analysis.retentionAnalysis.repetitions > 0) {
      console.log(`  Spaced Repetition: ${analysis.retentionAnalysis.repetitions} reviews needed`);
    }
  });
  
  // Test 2: Scientific Priority Calculation
  console.log('\n🎯 Test 2: Scientific Priority Calculation');
  console.log('-'.repeat(40));
  
  testTasks.forEach(task => {
    const enhancedTask = {
      ...task,
      analysis: scheduler.analyzeTaskWithCognitiveScience(task)
    };
    const priority = scheduler.calculateScientificPriority(enhancedTask);
    console.log(`${task.name}: Priority ${priority.toFixed(3)} (${task.type}, ${task.difficulty})`);
  });
  
  // Test 3: Spaced Repetition Scheduling
  console.log('\n🔄 Test 3: Spaced Repetition Scheduling');
  console.log('-'.repeat(40));
  
  const testTask = testTasks.find(t => t.type === 'test');
  const spacedSchedule = scheduler.calculateSpacedRepetitionSchedule(testTask);
  console.log(`${testTask.name} spaced repetition schedule:`);
  spacedSchedule.forEach((session, i) => {
    console.log(`  Review ${i + 1}: ${session.date.toDateString()} (${session.reviewType})`);
  });
  
  // Test 4: Optimal Session Planning
  console.log('\n⏰ Test 4: Optimal Session Planning');
  console.log('-'.repeat(40));
  
  testTasks.forEach(task => {
    const sessionPlan = scheduler.createOptimalSessionPlan(task);
    console.log(`\n${task.name}:`);
    console.log(`  Total Sessions: ${sessionPlan.totalSessions}`);
    console.log(`  Recommended Sessions/Day: ${sessionPlan.recommendedSessionsPerDay}`);
    console.log(`  Estimated Completion: ${sessionPlan.estimatedCompletionDays} days`);
    
    sessionPlan.sessions.slice(0, 3).forEach((session, i) => {
      console.log(`  Session ${i + 1}: ${session.duration}min (${session.type})`);
    });
  });
  
  // Test 5: Cognitive Load Calculation
  console.log('\n🧠 Test 5: Cognitive Load Analysis');
  console.log('-'.repeat(40));
  
  testTasks.forEach(task => {
    const cognitiveLoad = scheduler.calculateCognitiveLoad(task);
    const dailyCapacity = scheduler.calculateDailyCognitiveCapacity(new Date());
    const percentageOfCapacity = (cognitiveLoad / dailyCapacity * 100);
    
    console.log(`${task.name}: Load ${cognitiveLoad.toFixed(2)} (${percentageOfCapacity.toFixed(1)}% of daily capacity)`);
  });
  
  // Test 6: Time Slot Cognitive Scoring
  console.log('\n🕐 Test 6: Cognitive Time Slot Scoring');
  console.log('-'.repeat(40));
  
  const highCognitiveTask = testTasks.find(t => t.difficulty === 'Hard');
  console.log(`\nScoring time slots for high cognitive load task: ${highCognitiveTask.name}`);
  
  for (let hour = 8; hour <= 20; hour++) {
    const cognitiveLoad = scheduler.calculateCognitiveLoad(highCognitiveTask);
    const timePreference = scheduler.determineOptimalTimeOfDay(highCognitiveTask);
    const score = scheduler.calculateCognitiveTimeSlotScore(hour, cognitiveLoad, timePreference.preferred, 'peak-cognitive');
    console.log(`  ${hour}:00 - Score: ${score} ${score >= 5 ? '✅ Optimal' : score >= 3 ? '🔸 Good' : '⭕ Poor'}`);
  }
  
  // Test 7: Full Schedule Generation
  console.log('\n📅 Test 7: Full Cognitive-Optimized Schedule Generation');
  console.log('-'.repeat(40));
  
  try {
    const result = scheduler.generateWeeklySchedule(testTasks, new Date(), [], {}, false);
    
    if (result.blackoutConflicts && result.blackoutConflicts.length > 0) {
      console.log('⚠️ Blackout conflicts detected:');
      result.blackoutConflicts.forEach(conflict => {
        console.log(`  ${conflict.taskName}: needs ${conflict.shortfallHours.toFixed(1)}h more time`);
      });
    } else {
      console.log('✅ Schedule generated successfully!');
      console.log(`📊 Schedule covers ${Object.keys(result.schedule).length} days`);
      
      let totalScheduledItems = 0;
      let totalCognitiveLoad = 0;
      
      Object.entries(result.schedule).forEach(([date, items]) => {
        if (items.length > 0) {
          const dayLoad = items.reduce((sum, item) => sum + (item.cognitiveLoad || 0), 0);
          totalScheduledItems += items.length;
          totalCognitiveLoad += dayLoad;
          
          console.log(`\n📅 ${date}:`);
          items.forEach(item => {
            const time = item.startTime instanceof Date ? 
              item.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
              'Unknown time';
            console.log(`  ${time} - ${item.taskName} (${item.duration}min, Load: ${(item.cognitiveLoad || 0).toFixed(2)})`);
            if (item.learningStrategy) {
              console.log(`    Strategy: ${item.learningStrategy}`);
            }
            if (item.sessionType && item.sessionType !== 'standard') {
              console.log(`    Session Type: ${item.sessionType}`);
            }
          });
          console.log(`  Day Total Cognitive Load: ${dayLoad.toFixed(2)}`);
        }
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`  Total scheduled items: ${totalScheduledItems}`);
      console.log(`  Total cognitive load: ${totalCognitiveLoad.toFixed(2)}`);
      console.log(`  Average load per item: ${(totalCognitiveLoad / totalScheduledItems).toFixed(2)}`);
    }
  } catch (error) {
    console.error('❌ Error during schedule generation:', error);
    console.error(error.stack);
  }
  
  // Test 8: Learning Strategy Selection
  console.log('\n🎓 Test 8: Learning Strategy Selection');
  console.log('-'.repeat(40));
  
  testTasks.forEach(task => {
    const strategy = scheduler.selectOptimalLearningStrategy(task);
    console.log(`\n${task.name} (${task.type}):`);
    console.log(`  Primary Strategy: ${strategy.primary}`);
    console.log(`  Evidence: ${strategy.evidence}`);
    console.log(`  Key Techniques: ${strategy.techniques.slice(0, 2).join(', ')}`);
  });
  
  console.log('\n🎉 Enhanced Scheduler Testing Complete!');
  console.log('=' .repeat(60));
}

// Run the tests
try {
  runEnhancedSchedulerTests();
} catch (error) {
  console.error('💥 Test execution failed:', error);
  console.error(error.stack);
  process.exit(1);
}
