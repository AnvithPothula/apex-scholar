// Simple test to verify scheduling logic fixes
import { IntelligentScheduler } from './intelligentScheduler.js';
import SchedulingEngine from '../components/scheduler/SchedulingEngine.jsx';

// Test data
const testTasks = [
  {
    id: 'test1',
    name: 'AP Calculus Homework',
    subject: 'AP Calculus AB',
    estimated_time: 90,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    difficulty: 4,
    is_completed: false,
    is_scheduled: false
  },
  {
    id: 'test2',
    name: 'Physics Lab Report',
    subject: 'AP Physics',
    estimated_time: 120,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    difficulty: 3,
    is_completed: false,
    is_scheduled: false
  }
];

const testScheduler = () => {
  console.log('Testing Intelligent Scheduler...');
  
  try {
    const scheduler = new IntelligentScheduler({
      preferredStudyTimes: ['morning', 'evening'],
      maxStudyHoursPerDay: 4,
      breakDuration: 15,
      weekendStudy: true
    });

    // Test task analysis
    const analysis1 = scheduler.analyzeTask(testTasks[0]);
    console.log('Task analysis for Calculus:', analysis1);

    // Test weekly schedule generation
    const weeklySchedule = scheduler.generateWeeklySchedule(testTasks);
    console.log('Weekly schedule generated:', Object.keys(weeklySchedule).length, 'days');

    console.log('✅ Intelligent Scheduler tests passed');
  } catch (error) {
    console.error('❌ Intelligent Scheduler test failed:', error);
  }
};

const testSchedulingEngine = () => {
  console.log('Testing Scheduling Engine...');
  
  try {
    // Test slot finding
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // 1 hour from now
    
    const slot = SchedulingEngine.findNextAvailableSlot(startTime, 60, []);
    console.log('Found available slot:', slot);

    // Test smart schedule generation
    const result = SchedulingEngine.generateSmartSchedule(testTasks, []);
    console.log('Smart schedule result:', {
      scheduleItems: result.schedule.length,
      errors: result.errors.length
    });

    console.log('✅ Scheduling Engine tests passed');
  } catch (error) {
    console.error('❌ Scheduling Engine test failed:', error);
  }
};

// Run tests
export const runSchedulingTests = () => {
  console.log('🧪 Running Scheduling Logic Tests...');
  testScheduler();
  testSchedulingEngine();
  console.log('🏁 Scheduling tests completed');
};

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment - can run tests
  runSchedulingTests();
}
