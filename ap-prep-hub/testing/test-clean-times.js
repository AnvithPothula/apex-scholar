import IntelligentScheduler from '../src/utils/intelligentScheduler.js';

console.log('🧪 Testing Enhanced Scheduler with Clean Time Slots');
console.log('='.repeat(60));

const scheduler = new IntelligentScheduler({}, {});

const testTasks = [
  {
    id: 'test-clean-time-1',
    name: 'AP Calculus Review',
    type: 'practice',
    difficulty: 'medium',
    estimatedDuration: 42, // Should round to 40 or 45
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    priority: 'high',
    subjects: ['calculus']
  },
  {
    id: 'test-clean-time-2',
    name: 'Physics Problem Set',
    type: 'homework',
    difficulty: 'hard',
    estimatedDuration: 37, // Should round to a clean increment
    deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
    priority: 'medium',
    subjects: ['physics']
  }
];

try {
  console.log('📅 Generating schedule with cleaned time slots...');
  const schedule = scheduler.generateWeeklySchedule(testTasks, new Date(), [], {});
  
  if (schedule && typeof schedule === 'object') {
    console.log('✅ Schedule generated successfully!');
    
    // Check the first few schedule items for clean times
    const scheduleKeys = Object.keys(schedule);
    let itemCount = 0;
    
    for (const dateKey of scheduleKeys.slice(0, 3)) {
      const daySchedule = schedule[dateKey];
      if (Array.isArray(daySchedule) && daySchedule.length > 0) {
        console.log(`\n📋 ${dateKey}:`);
        
        daySchedule.slice(0, 2).forEach(item => {
          if (itemCount >= 4) return; // Early exit from forEach
          
          const startTime = new Date(item.startTime);
          const endTime = new Date(item.endTime);
          const duration = item.duration;
          
          console.log(`  📝 ${item.taskName}`);
          console.log(`     ⏰ ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
          console.log(`     ⏱️  Duration: ${duration} minutes`);
          console.log(`     🎯 Time slot alignment: ${duration % 5 === 0 ? '✅ Clean (5min)' : duration % 15 === 0 ? '✅ Clean (15min)' : '⚠️ Irregular'}`);
          
          itemCount++;
        });
        
        if (itemCount >= 4) break;
      }
    }
    
    if (itemCount === 0) {
      console.log('⚠️ No schedule items found to analyze');
    }
  } else {
    console.log('❌ Schedule generation failed or returned invalid format');
  }
} catch (error) {
  console.error('❌ Error during schedule generation:', error.message);
}

console.log('\n🔍 Time Slot Cleanup Test Complete');
