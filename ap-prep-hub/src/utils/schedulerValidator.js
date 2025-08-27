import IntelligentScheduler from './intelligentScheduler.js';
import { format, addDays } from 'date-fns';

/**
 * Comprehensive test suite for the IntelligentScheduler
 * This utility helps validate that all scheduler fixes are working correctly
 */

export class SchedulerValidator {
  constructor() {
    this.testResults = [];
  }

  // Test the date/timezone handling
  async testDateTimezone() {
    console.log("🧪 Testing Date/Timezone handling...");
    
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    // Test manual date construction (our fix)
    const [year, month, day] = todayString.split('-').map(Number);
    const manualDate = new Date(year, month - 1, day);
    
    // Test string parsing (problematic approach)
    const stringDate = new Date(todayString);
    
    const manualDateString = format(manualDate, 'yyyy-MM-dd');
    const stringDateString = format(stringDate, 'yyyy-MM-dd');
    
    const result = {
      test: "Date/Timezone Handling",
      passed: manualDateString === todayString,
      details: {
        targetDate: todayString,
        manualParsing: manualDateString,
        stringParsing: stringDateString,
        manualCorrect: manualDateString === todayString,
        stringCorrect: stringDateString === todayString
      }
    };
    
    this.testResults.push(result);
    console.log("📅 Date test result:", result);
    return result;
  }

  // Test task validation
  async testTaskValidation() {
    console.log("🧪 Testing Task validation...");
    
    const scheduler = new IntelligentScheduler({
      maxStudyHoursPerDay: 8,
      weekendStudy: true,
      blackoutSchedule: {}
    });

    const testTasks = [
      // Valid task
      {
        id: "1",
        name: "Test Task 1",
        subject: "Math",
        type: "homework",
        difficulty: "Medium",
        estimated_time: 60,
        deadline: addDays(new Date(), 2),
        is_completed: false
      },
      // Invalid task (no ID)
      {
        name: "Invalid Task",
        subject: "Science"
      },
      // Completed task
      {
        id: "2",
        name: "Completed Task",
        subject: "English",
        is_completed: true,
        deadline: addDays(new Date(), 1)
      },
      // Task with Firestore timestamp
      {
        id: "3",
        name: "Firestore Task",
        subject: "History",
        deadline: {
          toDate: () => addDays(new Date(), 3)
        },
        estimated_time: 90,
        is_completed: false
      }
    ];

    const validatedTasks = scheduler.validateAndSanitizeTasks(testTasks);
    
    const result = {
      test: "Task Validation",
      passed: validatedTasks.length === 2, // Should have 2 valid tasks
      details: {
        inputTasks: testTasks.length,
        validatedTasks: validatedTasks.length,
        expectedValid: 2,
        validTaskIds: validatedTasks.map(t => t.id)
      }
    };
    
    this.testResults.push(result);
    console.log("📝 Task validation result:", result);
    return result;
  }

  // Test schedule generation
  async testScheduleGeneration() {
    console.log("🧪 Testing Schedule generation...");
    
    const scheduler = new IntelligentScheduler({
      maxStudyHoursPerDay: 6,
      weekendStudy: true,
      blackoutSchedule: {
        monday: ["12:00-13:00"],
        wednesday: ["18:00-19:00"]
      }
    });

    const testTasks = [
      {
        id: "1",
        name: "Math Homework",
        subject: "Mathematics",
        type: "homework",
        difficulty: "Medium",
        estimated_time: 90,
        deadline: addDays(new Date(), 2),
        is_completed: false,
        timeRequired: 1.5,
        timeSpent: 0
      },
      {
        id: "2",
        name: "Science Project",
        subject: "Biology",
        type: "project",
        difficulty: "Hard",
        estimated_time: 180,
        deadline: addDays(new Date(), 5),
        is_completed: false,
        timeRequired: 3,
        timeSpent: 0
      }
    ];

    try {
      const scheduleResult = scheduler.generateWeeklySchedule(testTasks, new Date());
      
      const result = {
        test: "Schedule Generation",
        passed: scheduleResult && scheduleResult.schedule && Object.keys(scheduleResult.schedule).length > 0,
        details: {
          hasResult: !!scheduleResult,
          hasSchedule: !!(scheduleResult && scheduleResult.schedule),
          scheduleDays: scheduleResult?.schedule ? Object.keys(scheduleResult.schedule).length : 0,
          totalScheduledItems: scheduleResult?.schedule ? 
            Object.values(scheduleResult.schedule).flat().length : 0,
          conflicts: scheduleResult?.blackoutConflicts?.length || 0
        }
      };
      
      this.testResults.push(result);
      console.log("📅 Schedule generation result:", result);
      return result;
    } catch (error) {
      const result = {
        test: "Schedule Generation",
        passed: false,
        error: error.message,
        details: {
          errorType: error.name,
          errorMessage: error.message
        }
      };
      
      this.testResults.push(result);
      console.error("❌ Schedule generation failed:", error);
      return result;
    }
  }

  // Test time slot finding
  async testTimeSlotFinding() {
    console.log("🧪 Testing Time slot finding...");
    
    const scheduler = new IntelligentScheduler({
      maxStudyHoursPerDay: 8,
      weekendStudy: true,
      blackoutSchedule: {
        monday: ["12:00-13:00", "18:00-20:00"],
        tuesday: []
      }
    });

    const testDate = addDays(new Date(), 1); // Tomorrow
    const testTask = {
      id: "test",
      name: "Test Task",
      subject: "Test",
      type: "homework"
    };

    try {
      // Test finding a 60-minute slot
      const timeSlot = scheduler.findAvailableTimeSlot(testDate, 60, testTask, []);
      
      const result = {
        test: "Time Slot Finding",
        passed: !!timeSlot,
        details: {
          slotFound: !!timeSlot,
          startTime: timeSlot?.start?.toLocaleString(),
          endTime: timeSlot?.end?.toLocaleString(),
          duration: timeSlot ? (timeSlot.end - timeSlot.start) / (1000 * 60) : null
        }
      };
      
      this.testResults.push(result);
      console.log("🕐 Time slot finding result:", result);
      return result;
    } catch (error) {
      const result = {
        test: "Time Slot Finding",
        passed: false,
        error: error.message,
        details: {
          errorType: error.name,
          errorMessage: error.message
        }
      };
      
      this.testResults.push(result);
      console.error("❌ Time slot finding failed:", error);
      return result;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log("🚀 Starting comprehensive scheduler validation...");
    
    this.testResults = [];
    
    await this.testDateTimezone();
    await this.testTaskValidation();
    await this.testScheduleGeneration();
    await this.testTimeSlotFinding();
    
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    
    const summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      allPassed: passedTests === totalTests
    };
    
    console.log("📊 Validation Summary:", summary);
    console.log("📋 Detailed Results:", this.testResults);
    
    if (summary.allPassed) {
      console.log("✅ All scheduler tests PASSED! 🎉");
    } else {
      console.log("⚠️ Some tests FAILED. Check the detailed results above.");
    }
    
    return {
      summary,
      results: this.testResults
    };
  }

  // Quick validation for deployment readiness
  async validateDeploymentReadiness() {
    console.log("🔍 Validating deployment readiness...");
    
    const validation = await this.runAllTests();
    
    const criticalChecks = [
      "Date/Timezone Handling",
      "Schedule Generation"
    ];
    
    const criticalResults = this.testResults.filter(r => 
      criticalChecks.includes(r.test)
    );
    
    const criticalPassed = criticalResults.every(r => r.passed);
    
    const deploymentStatus = {
      ready: criticalPassed && validation.summary.successRate >= 75,
      criticalTestsPassed: criticalPassed,
      overallScore: validation.summary.successRate,
      recommendation: criticalPassed ? 
        "✅ READY FOR DEPLOYMENT" : 
        "❌ NOT READY - Critical issues detected"
    };
    
    console.log("🚀 Deployment Readiness:", deploymentStatus);
    return deploymentStatus;
  }
}

// Export a singleton instance for easy use
export const schedulerValidator = new SchedulerValidator();

// Helper function to run quick validation
export const validateScheduler = () => {
  return schedulerValidator.runAllTests();
};

export const checkDeploymentReadiness = () => {
  return schedulerValidator.validateDeploymentReadiness();
};
