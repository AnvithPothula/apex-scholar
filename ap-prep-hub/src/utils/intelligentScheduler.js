import { format, isWeekend, addDays, differenceInDays, startOfDay } from 'date-fns';
import { 
  getUserTimezone, 
  formatDateTimeInUserTimezone, 
  getCurrentTimeInUserTimezone
} from './timezone';

// Gate debug logging behind development mode to avoid console spam in production
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

class IntelligentScheduler {
  constructor(userPreferences, blackoutSchedule) {
    // Enhanced default preferences based on cognitive science research
    const scientificDefaults = {
      // Study session parameters (based on attention span research)
      maxStudyHoursPerDay: 6, // Optimal for maintaining focus without cognitive overload
      sessionLength: 50, // Minutes - based on attention span studies (Bradbury, 2016)
      breakLength: 10, // Minutes - optimal for cognitive recovery (Pomodoro research)
      longBreakLength: 30, // Minutes - after 3-4 sessions (Ultradian rhythm research)
      
      // Scheduling preferences
      weekendStudy: true,
      studyStartTime: 7, // 7 AM - optimal cognitive performance time
      studyEndTime: 22, // 10 PM - avoid late-night study impacting sleep
      
      // Learning optimization (evidence-based)
      preferMorningStudy: true, // Peak cognitive performance 9-11 AM
      studyIntensity: 'moderate', // Balanced approach for sustainability
      spacedRepetitionEnabled: true, // Ebbinghaus forgetting curve
      interleaving: true, // Mixed practice for better retention
      
      // Cognitive load management
      maxConcurrentSubjects: 3, // Limit to prevent cognitive overload
      difficultTasksInMorning: true, // Use peak cognitive hours
      
      // Break and recovery preferences
      activeBreaksEnabled: false, // Light physical activity during breaks
      mindfulnessBreaksEnabled: false, // Meditation/breathing exercises
      
      // Advanced scheduling options
      adaptiveScheduling: true, // Adjust based on performance
      procrastinationBuffer: 0.2, // 20% time buffer for deadline pressure
      energyLevelConsideration: true, // Match tasks to energy levels
      
      // Research-backed timing preferences
      avoidPostLunchDip: true, // Avoid 1-3 PM for difficult tasks
      respectCircadianRhythm: true, // Honor natural energy cycles
      
      blackoutSchedule: {}
    };
    
    this.userPreferences = this.mergeWithDefaults(userPreferences, scientificDefaults);
    this.blackoutSchedule = blackoutSchedule || this.userPreferences.blackoutSchedule || {};
    this.learningHistory = [];
    this.temporaryBlackoutOverrides = [];
    
    // Scientific constants based on cognitive research
    this.COGNITIVE_CONSTANTS = {
      // Forgetting curve parameters (Ebbinghaus, 1885; Bahrick, 1979)
      FORGETTING_CURVE_DECAY: 0.5, // 50% retention after 1 day without review
      OPTIMAL_REVIEW_INTERVALS: [1, 3, 7, 14, 30], // Days between reviews for spaced repetition
      
      // Cognitive load theory (Sweller, 1988)
      MAX_COGNITIVE_LOAD_MINUTES: this.userPreferences.sessionLength || 50, // User preference or research default
      OPTIMAL_BREAK_MINUTES: this.userPreferences.breakLength || 10, // User preference or research default
      LONG_BREAK_MINUTES: this.userPreferences.longBreakLength || 30, // After 3-4 sessions
      
      // Peak performance times (Itzek-Greulich et al., 2015) - adjusted by user preferences
      PEAK_COGNITIVE_HOURS: this.calculatePeakHours(),
      LOW_COGNITIVE_HOURS: this.calculateLowCognitiveHours(),
      
      // Task-specific optimal durations (research-backed, adjusted by user intensity)
      OPTIMAL_SESSION_DURATIONS: this.calculateOptimalDurations(),
      
      // Difficulty-based adjustments (Bjork, 1994 - desirable difficulties)
      DIFFICULTY_MODIFIERS: {
        Easy: { sessionMultiplier: 1.2, breakMultiplier: 0.8 },
        Medium: { sessionMultiplier: 1.0, breakMultiplier: 1.0 },
        Hard: { sessionMultiplier: 0.8, breakMultiplier: 1.3 }
      }
    };
  }

  /**
   * Merge user preferences with scientifically-based defaults
   */
  mergeWithDefaults(userPrefs, scientificDefaults) {
    if (!userPrefs || typeof userPrefs !== 'object') {
      debugLog("🧠 Using scientific defaults - no user preferences provided");
      return scientificDefaults;
    }

    const merged = { ...scientificDefaults, ...userPrefs };
    
    // Validate and constrain user preferences within scientifically reasonable bounds
    merged.maxStudyHoursPerDay = Math.max(2, Math.min(10, merged.maxStudyHoursPerDay || scientificDefaults.maxStudyHoursPerDay));
    merged.sessionLength = Math.max(15, Math.min(120, merged.sessionLength || scientificDefaults.sessionLength));
    merged.breakLength = Math.max(5, Math.min(30, merged.breakLength || scientificDefaults.breakLength));
    merged.studyStartTime = Math.max(5, Math.min(12, merged.studyStartTime || scientificDefaults.studyStartTime)); // Allow up to noon (12)
    merged.studyEndTime = Math.max(18, Math.min(24, merged.studyEndTime || scientificDefaults.studyEndTime));
    
    debugLog("🧠 Merged user preferences with scientific defaults:", merged);
    return merged;
  }

  /**
   * Calculate peak cognitive hours based on user preferences and research
   */
  calculatePeakHours() {
    const baseHours = [9, 10, 11]; // Research-backed peak hours
    
    if (this.userPreferences.preferMorningStudy) {
      return [8, 9, 10, 11]; // Extended morning peak
    }
    
    if (this.userPreferences.studyIntensity === 'light') {
      return [9, 10]; // Shorter peak period for light intensity
    }
    
    if (this.userPreferences.studyIntensity === 'intense') {
      return [8, 9, 10, 11, 14, 15, 16]; // Extended peak hours for intense study
    }
    
    return baseHours; // Default moderate intensity
  }

  /**
   * Calculate low cognitive hours based on research and user preferences
   */
  calculateLowCognitiveHours() {
    const baseLowHours = [13, 17, 18, 19]; // Post-lunch dip and evening fatigue
    
    if (this.userPreferences.avoidPostLunchDip) {
      return [13, 14, 17, 18, 19, 20]; // Extended post-lunch avoidance
    }
    
    return baseLowHours;
  }

  /**
   * Calculate optimal session durations based on research and user intensity
   */
  calculateOptimalDurations() {
    const intensityMultiplier = {
      'light': 0.8,
      'moderate': 1.0,
      'intense': 1.2
    }[this.userPreferences.studyIntensity] || 1.0;

    const baseDurations = {
      // Deep work sessions (Newport, 2016)
      project: { min: 90, max: 120, optimal: 90 },
      essay: { min: 60, max: 90, optimal: 75 },
      
      // Spaced repetition optimal (Cepeda et al., 2006)
      homework: { min: 25, max: 50, optimal: this.userPreferences.sessionLength || 50 },
      test: { min: 30, max: 60, optimal: 45 },
      
      // Reading comprehension research (Rayner et al., 2016)
      reading: { min: 30, max: 60, optimal: 45 },
      
      // Laboratory learning (Kirschner et al., 2006)
      lab: { min: 90, max: 180, optimal: 120 }
    };

    // Apply user intensity multiplier
    Object.keys(baseDurations).forEach(taskType => {
      const duration = baseDurations[taskType];
      duration.optimal = this.roundToStandardIncrement(Math.round(duration.optimal * intensityMultiplier));
      duration.min = this.roundToStandardIncrement(Math.round(duration.min * intensityMultiplier));
      duration.max = this.roundToStandardIncrement(Math.round(duration.max * intensityMultiplier));
    });

    return baseDurations;
  }

  updatePreferences(newPreferences) {
    this.userPreferences = { ...this.userPreferences, ...newPreferences };
    if (newPreferences.blackoutSchedule) {
      this.blackoutSchedule = newPreferences.blackoutSchedule;
    }
  }

  /**
   * Enhanced task analysis using cognitive science principles
   * Based on Cognitive Load Theory, Spaced Repetition, and Peak Performance research
   */
  analyzeTaskWithCognitiveScience(task) {
    
    // Calculate cognitive load based on task complexity (Sweller, 1988)
    const baseCognitiveLoad = this.calculateCognitiveLoad(task);
    
    // Determine optimal session structure based on task type
    const sessionStructure = this.determineOptimalSessionStructure(task);
    
    // Calculate retention factors for spaced repetition
    const retentionAnalysis = this.analyzeRetentionRequirements(task);
    
    // Assess priority using multiple cognitive factors
    const cognitiveFactors = this.assessCognitiveFactors(task);
    
    return {
      cognitiveLoad: baseCognitiveLoad,
      sessionStructure: sessionStructure,
      retentionAnalysis: retentionAnalysis,
      cognitiveFactors: cognitiveFactors,
      recommendedBreaks: this.calculateOptimalBreaks(task),
      peakTimePreference: this.determineOptimalTimeOfDay(task),
      learningStrategy: this.selectOptimalLearningStrategy(task)
    };
  }

  /**
   * Calculate cognitive load based on task characteristics
   * Uses Cognitive Load Theory principles (Sweller, 1988)
   */
  calculateCognitiveLoad(task) {
    const baseLoad = {
      'Easy': 0.3,
      'Medium': 0.6,
      'Hard': 0.9
    }[task.difficulty || 'Medium'];

    const typeMultiplier = {
      'homework': 1.0,     // Standard practice
      'test': 1.3,         // Higher cognitive demand
      'project': 1.5,      // Complex, multi-faceted
      'reading': 0.8,      // Lower active cognitive load
      'lab': 1.2,          // Procedural + conceptual
      'essay': 1.4         // High creative + analytical load
    }[task.type || 'homework'];

    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const complexityFactor = Math.min(1.5, 1 + (timeRequired - 1) * 0.1); // Longer tasks = more complex

    return baseLoad * typeMultiplier * complexityFactor;
  }

  /**
   * Determine optimal session structure using research-backed durations
   */
  determineOptimalSessionStructure(task) {
    const taskType = task.type || 'homework';
    const difficulty = task.difficulty || 'Medium';
    const sessionConfig = this.COGNITIVE_CONSTANTS.OPTIMAL_SESSION_DURATIONS[taskType] || 
                         this.COGNITIVE_CONSTANTS.OPTIMAL_SESSION_DURATIONS.homework;
    
    // Apply difficulty modifier  
    const difficultyKey = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    const modifier = this.COGNITIVE_CONSTANTS.DIFFICULTY_MODIFIERS[difficultyKey] || 
                     this.COGNITIVE_CONSTANTS.DIFFICULTY_MODIFIERS.Medium;
    const optimalDuration = Math.round(sessionConfig.optimal * modifier.sessionMultiplier);
    
    return {
      optimalDuration: this.roundToStandardIncrement(optimalDuration),
      minDuration: this.roundToStandardIncrement(Math.round(sessionConfig.min * modifier.sessionMultiplier)),
      maxDuration: this.roundToStandardIncrement(Math.round(sessionConfig.max * modifier.sessionMultiplier)),
      usePomodoro: optimalDuration <= 30, // Use Pomodoro for shorter tasks
      longFormWork: optimalDuration >= 90  // Deep work sessions
    };
  }

  /**
   * Analyze retention requirements for spaced repetition scheduling
   * Based on Ebbinghaus forgetting curve and modern spaced repetition research
   */
  analyzeRetentionRequirements(task) {
    const taskType = task.type || 'homework';
    // FIXED: Consistent deadline parsing
    const taskDeadline = task.deadline || task.dueDate;
    let deadline;
    if (taskDeadline) {
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadline = taskDeadline.toDate();
      } else {
        deadline = new Date(taskDeadline);
      }
    } else {
      deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    const daysUntilDeadline = Math.max(1, differenceInDays(deadline, new Date()));
    
    // Different retention needs based on task type
    const retentionNeeds = {
      'test': { 
        repetitions: Math.min(4, Math.floor(daysUntilDeadline / 2)),
        intervals: [1, 3, 7, 14].slice(0, Math.floor(daysUntilDeadline / 2)),
        priority: 'high'
      },
      'project': { 
        repetitions: Math.min(3, Math.floor(daysUntilDeadline / 3)),
        intervals: [2, 7, 14].slice(0, Math.floor(daysUntilDeadline / 3)),
        priority: 'medium'
      },
      'homework': { 
        repetitions: Math.min(2, Math.floor(daysUntilDeadline / 3)),
        intervals: [1, 3].slice(0, Math.floor(daysUntilDeadline / 3)),
        priority: 'medium'
      },
      'reading': { 
        repetitions: Math.min(2, Math.floor(daysUntilDeadline / 4)),
        intervals: [3, 7].slice(0, Math.floor(daysUntilDeadline / 4)),
        priority: 'low'
      }
    };

    return retentionNeeds[taskType] || retentionNeeds['homework'];
  }

  /**
   * Calculate optimal breaks based on cognitive research
   */
  calculateOptimalBreaks(task) {
    const cognitiveLoad = this.calculateCognitiveLoad(task);
    const sessionStructure = this.determineOptimalSessionStructure(task);
    
    if (sessionStructure.usePomodoro) {
      return {
        type: 'pomodoro',
        workDuration: 25,
        shortBreak: 5,
        longBreak: 30,
        longBreakAfter: 4 // sessions
      };
    } else if (sessionStructure.longFormWork) {
      return {
        type: 'deep-work',
        workDuration: sessionStructure.optimalDuration,
        shortBreak: Math.round(sessionStructure.optimalDuration * 0.1), // 10% of work time
        longBreak: Math.round(sessionStructure.optimalDuration * 0.3),  // 30% of work time
        longBreakAfter: 2
      };
    } else {
      return {
        type: 'standard',
        workDuration: sessionStructure.optimalDuration,
        shortBreak: Math.round(cognitiveLoad * 10 + 5), // 5-15 minute breaks
        longBreak: 20,
        longBreakAfter: 3
      };
    }
  }

  /**
   * Determine optimal time of day based on task characteristics and circadian research
   */
  determineOptimalTimeOfDay(task) {
    const taskType = task.type || 'homework';
    const difficulty = task.difficulty || 'Medium';
    const cognitiveLoad = this.calculateCognitiveLoad(task);
    
    // Research-based optimal times for different cognitive activities
    if (cognitiveLoad > 0.8 || difficulty.toLowerCase() === 'hard') {
      // High cognitive load tasks during peak hours (morning cognitive peak)
      return {
        preferred: [9, 10, 11],
        acceptable: [14, 15, 16],
        avoid: [13, 17, 18, 19, 20, 21]
      };
    } else if (taskType === 'reading' || taskType === 'homework') {
      // Medium cognitive load - flexible timing
      return {
        preferred: [9, 10, 11, 14, 15, 16],
        acceptable: [8, 12, 17],
        avoid: [13, 18, 19, 20, 21]
      };
    } else {
      // Lower cognitive load tasks can be done anytime
      return {
        preferred: [8, 9, 10, 11, 14, 15, 16, 17],
        acceptable: [12, 18],
        avoid: [13, 19, 20, 21]
      };
    }
  }

  /**
   * Assess cognitive factors for task optimization
   */
  assessCognitiveFactors(task) {
    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    // FIXED: Consistent deadline parsing
    const taskDeadline = task.deadline || task.dueDate;
    let deadline;
    if (taskDeadline) {
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadline = taskDeadline.toDate();
      } else {
        deadline = new Date(taskDeadline);
      }
    } else {
      deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    const daysUntilDeadline = Math.max(1, differenceInDays(deadline, new Date()));
    const urgency = this.calculateUrgency(task);
    const cognitiveLoad = this.calculateCognitiveLoad(task);
    
    return {
      timeComplexity: timeRequired > 2 ? 'high' : timeRequired > 1 ? 'medium' : 'low',
      deadlinePressure: daysUntilDeadline <= 1 ? 'critical' : daysUntilDeadline <= 3 ? 'high' : daysUntilDeadline <= 7 ? 'medium' : 'low',
      cognitiveComplexity: cognitiveLoad > 0.8 ? 'high' : cognitiveLoad > 0.5 ? 'medium' : 'low',
      priorityScore: urgency,
      estimatedSessions: Math.ceil(timeRequired / 1.5), // Assuming 1.5h average sessions
      needsSpacedRepetition: task.type === 'test' || task.type === 'exam',
      needsDeepWork: task.type === 'project' || task.type === 'essay',
      allowsDistractedWork: task.type === 'reading'
    };
  }

  /**
   * Select optimal learning strategy based on task characteristics and research
   */
  selectOptimalLearningStrategy(task) {
    const taskType = task.type || 'homework';
    
    const strategies = {
      homework: {
        primary: 'Active Recall',
        techniques: [
          'Practice testing without looking at answers',
          'Explain concepts aloud before checking',
          'Use flashcards for key concepts',
          'Apply the Feynman Technique'
        ],
        evidence: 'Testing Effect (Roediger & Karpicke, 2006)'
      },
      test: {
        primary: 'Distributed Practice',
        techniques: [
          'Space practice sessions over multiple days',
          'Mix different problem types in each session',
          'Practice under timed conditions',
          'Review mistakes immediately after practice'
        ],
        evidence: 'Spacing Effect (Cepeda et al., 2006)'
      },
      project: {
        primary: 'Elaborative Interrogation',
        techniques: [
          'Ask "why" and "how" questions frequently',
          'Connect new information to existing knowledge',
          'Create concept maps and visual representations',
          'Break complex problems into sub-problems'
        ],
        evidence: 'Transfer and Problem Solving (Bransford et al., 2000)'
      },
      reading: {
        primary: 'SQ3R Method',
        techniques: [
          'Survey the material first',
          'Generate questions before reading',
          'Read actively with purpose',
          'Recite key points after each section',
          'Review and summarize regularly'
        ],
        evidence: 'Reading Comprehension Research (Pressley, 2000)'
      },
      lab: {
        primary: 'Reflective Practice',
        techniques: [
          'Predict outcomes before observations',
          'Document observations immediately',
          'Connect observations to theoretical concepts',
          'Analyze discrepancies between prediction and result'
        ],
        evidence: 'Experiential Learning (Kolb, 1984)'
      },
      essay: {
        primary: 'Process Writing',
        techniques: [
          'Use structured brainstorming techniques',
          'Create detailed outlines before writing',
          'Write in focused, timed sessions',
          'Revise with specific focus areas'
        ],
        evidence: 'Writing Process Research (Hayes & Flower, 1986)'
      }
    };

    return strategies[taskType] || strategies.homework;
  }

  /**
   * Calculate scientific priority using multiple cognitive factors
   */
  calculateScientificPriority(task) {
    const urgency = this.calculateUrgency(task);
    const cognitiveLoad = task.analysis?.cognitiveLoad || this.calculateCognitiveLoad(task);
    const retentionPriority = task.analysis?.retentionAnalysis?.priority || 'medium';
    
    // Weight factors based on cognitive science research
    const urgencyWeight = 0.4;      // Deadline pressure (stress affects performance)
    const cognitiveWeight = 0.3;    // Cognitive load (schedule difficult tasks at peak times)
    const retentionWeight = 0.2;    // Retention requirements (test prep needs more repetition)
    const completionWeight = 0.1;   // Completion status
    
    const retentionScore = {
      'low': 0.3,
      'medium': 0.6,
      'high': 0.9
    }[retentionPriority];
    
    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const timeSpent = task.timeSpent || 0;
    const completionScore = Math.max(0, 1 - (timeSpent / timeRequired));
    
    return (urgency * urgencyWeight) + 
           (cognitiveLoad * cognitiveWeight) + 
           (retentionScore * retentionWeight) + 
           (completionScore * completionWeight);
  }

  /**
   * Calculate spaced repetition schedule based on forgetting curve research
   */
  calculateSpacedRepetitionSchedule(task) {
    const retentionAnalysis = this.analyzeRetentionRequirements(task);
    // FIXED: Consistent deadline parsing
    const taskDeadline = task.deadline || task.dueDate;
    let deadline;
    if (taskDeadline) {
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadline = taskDeadline.toDate();
      } else {
        deadline = new Date(taskDeadline);
      }
    } else {
      deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    const schedule = [];
    const today = startOfDay(new Date());
    
    retentionAnalysis.intervals.forEach((interval, index) => {
      const reviewDate = addDays(today, interval);
      if (reviewDate < deadline) {
        schedule.push({
          date: reviewDate,
          sessionNumber: index + 1,
          reviewType: index === 0 ? 'initial-review' : 'spaced-review',
          estimatedDuration: Math.round((task.timeRequired || 1) * 0.3), // 30% of original time for review
          priority: retentionAnalysis.priority
        });
      }
    });
    
    return schedule;
  }

  /**
   * Create optimal session plan using cognitive research
   */
  createOptimalSessionPlan(task) {
    const sessionStructure = this.determineOptimalSessionStructure(task);
    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const timeSpent = task.timeSpent || 0;
    const remainingTime = Math.max(0, timeRequired - timeSpent);
    
    const sessions = [];
    let remainingMinutes = remainingTime * 60;
    let sessionNumber = 1;
    
    while (remainingMinutes > 15) { // Minimum 15-minute sessions
      const sessionDuration = Math.min(
        sessionStructure.optimalDuration,
        sessionStructure.maxDuration,
        remainingMinutes
      );
      
      sessions.push({
        sessionNumber: sessionNumber,
        duration: sessionDuration,
        type: sessionStructure.usePomodoro ? 'pomodoro' : 
              sessionStructure.longFormWork ? 'deep-work' : 'standard',
        cognitiveLoad: this.calculateCognitiveLoad(task),
        learningStrategy: this.selectOptimalLearningStrategy(task).primary,
        breaks: this.calculateOptimalBreaks(task)
      });
      
      remainingMinutes -= sessionDuration;
      sessionNumber++;
      
      // Prevent infinite loops
      if (sessionNumber > 10) break;
    }
    
    return {
      totalSessions: sessions.length,
      sessions: sessions,
      estimatedCompletionDays: Math.ceil(sessions.length / 2), // Assuming 2 sessions per day max
      recommendedSessionsPerDay: sessions.length > 4 ? 2 : 1
    };
  }

  generateWeeklySchedule(tasks, startDate = new Date(), blackoutOverrides = [], existingSchedule = {}, preserveCurrentDay = false) {
    debugLog("🧠 Enhanced IntelligentScheduler.generateWeeklySchedule called");
    debugLog("📝 Input tasks:", tasks);
    debugLog("📅 Start date:", startDate);
    debugLog("🚫 Blackout overrides (type):", typeof blackoutOverrides, blackoutOverrides);
    debugLog("📋 Existing schedule provided:", Object.keys(existingSchedule).length > 0);
    debugLog("🔒 Preserve current day schedule:", preserveCurrentDay);
    debugLog("⚙️ User preferences:", this.userPreferences);
    debugLog("🕒 Blackout schedule:", this.userPreferences?.blackoutSchedule);

    // Enhanced input validation
    if (!tasks || !Array.isArray(tasks)) {
      console.error("❌ Invalid tasks input:", tasks);
      return { schedule: existingSchedule, blackoutConflicts: [] };
    }

    if (tasks.length === 0) {
      debugLog("📭 No tasks provided, returning existing schedule or empty");
      return { schedule: existingSchedule, blackoutConflicts: [] };
    }

    // Validate user preferences
    if (!this.userPreferences || typeof this.userPreferences !== 'object') {
      console.error("❌ Invalid user preferences:", this.userPreferences);
      return { schedule: existingSchedule, blackoutConflicts: [] };
    }

    // Validate start date
    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      console.error("❌ Invalid start date:", startDate);
      startDate = new Date(); // Fallback to current date
    }
    
    try {
      debugLog("🧠 Starting enhanced scientific schedule generation...");
      debugLog("Tasks received:", tasks.length);
      
      // Validate and sanitize tasks
      const validTasks = this.validateAndSanitizeTasks(tasks);
      debugLog("Valid tasks after validation:", validTasks.length);
      
      if (validTasks.length === 0) {
        debugLog("📭 No valid tasks after validation");
        return { schedule: existingSchedule, blackoutConflicts: [] };
      }
      
      this.temporaryBlackoutOverrides = blackoutOverrides || [];
      
      // Detect critical conflicts that require immediate attention
      const urgentConflicts = this.detectBlackoutConflicts(validTasks);
      debugLog("⚠️ Urgent conflicts detected:", urgentConflicts.length);
      
      if (urgentConflicts.length > 0) {
        debugLog("🛑 Returning due to blackout conflicts");
        return { schedule: {}, blackoutConflicts: urgentConflicts };
      }
      
      debugLog("✅ No conflicts, proceeding with enhanced schedule generation");
      
      // Enhanced task analysis with cognitive science principles
      const analyzedTasks = validTasks.map(task => ({
        ...task,
        analysis: this.analyzeTaskWithCognitiveScience(task),
        spaceRepetitionSchedule: this.calculateSpacedRepetitionSchedule(task),
        optimalSessionPlan: this.createOptimalSessionPlan(task)
      }));
      
      debugLog("🧠 Enhanced analyzed tasks:", analyzedTasks);
      
      // Scientific priority sorting based on multiple factors
      analyzedTasks.sort((a, b) => {
        return this.calculateScientificPriority(b) - this.calculateScientificPriority(a);
      });
      
      debugLog("📊 Scientifically sorted tasks by priority:", analyzedTasks.map(t => ({ 
        id: t.id, 
        priority: this.calculateScientificPriority(t),
        urgency: this.calculateUrgency(t),
        cognitiveLoad: t.analysis?.cognitiveLoad || 0
      })));
      
      // Enhanced task allocation using cognitive optimization
      const taskAllocation = this.allocateTasksWithCognitiveOptimization(analyzedTasks, existingSchedule, preserveCurrentDay);
      debugLog("🧠 Cognitive-optimized task allocation:", taskAllocation);
      
      // Merge with existing schedule using enhanced merging strategy
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

  detectBlackoutConflicts(tasks) {
    debugLog("🔍 Detecting blackout conflicts...");
    const conflicts = [];
    const now = new Date();
    
    // Get urgent tasks that need to be scheduled soon
    const urgentTasks = tasks.filter(task => {
      const urgency = this.calculateUrgency(task);
      // FIXED: Use consistent deadline parsing
      const taskDeadline = task.deadline || task.dueDate;
      let deadline;
      if (taskDeadline) {
        if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
          deadline = taskDeadline.toDate();
        } else {
          deadline = new Date(taskDeadline);
        }
      } else {
        return false; // No deadline, not urgent
      }
      
      const daysUntilDue = (deadline - now) / (1000 * 60 * 60 * 24);
      
      // Consider tasks urgent if:
      // 1. Overdue (urgency = 1.0)
      // 2. Due within 2 days and high urgency (> 0.7)
      // 3. Due within 1 day regardless of urgency
      return urgency === 1.0 || (daysUntilDue <= 2 && urgency > 0.7) || daysUntilDue <= 1;
    });
    
    debugLog(`📋 Found ${urgentTasks.length} urgent tasks to check for conflicts`);
    
    for (const task of urgentTasks) {
      const taskConflicts = this.findTaskBlackoutConflicts(task);
      conflicts.push(...taskConflicts);
    }
    
    debugLog(`⚠️ Total blackout conflicts found: ${conflicts.length}`);
    return conflicts;
  }
  
  findTaskBlackoutConflicts(task) {
    const conflicts = [];
    const now = new Date();
    // FIXED: Use consistent deadline parsing
    const taskDeadline = task.deadline || task.dueDate;
    let dueDate;
    if (taskDeadline) {
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        dueDate = taskDeadline.toDate();
      } else {
        dueDate = new Date(taskDeadline);
      }
    } else {
      console.warn(`⚠️ Task ${task.name} has no deadline, skipping conflict check`);
      return conflicts;
    }
    
    const daysToCheck = Math.max(1, Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));
    
    let availableHours = 0;
    const conflictingBlackouts = [];
    
    // Check each day from now until due date
    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      
      const dayStart = new Date(checkDate);
      dayStart.setHours(this.userPreferences.studyStartTime || 7, 0, 0, 0);
      
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(this.userPreferences.studyEndTime || 23, 0, 0, 0);
      
      // Calculate available hours for this day
      const dayAvailableHours = this.calculateAvailableHours(checkDate, dayStart, dayEnd, conflictingBlackouts);
      availableHours += dayAvailableHours;
    }
    
    const remainingTime = task.timeRequired - (task.timeSpent || 0);
    const requiredHours = remainingTime; // timeRequired is already in hours
    
    debugLog(`📊 Task "${task.name}": needs ${requiredHours.toFixed(1)}h, available: ${availableHours.toFixed(1)}h`);
    
    // If there's not enough time due to blackouts, create conflict
    if (availableHours < requiredHours && conflictingBlackouts.length > 0) {
      const shortfall = requiredHours - availableHours;
      
      // Find the most restrictive blackout
      const primaryConflict = conflictingBlackouts.reduce((worst, current) => {
        return current.blockedHours > worst.blockedHours ? current : worst;
      });
      
        conflicts.push({
          taskId: task.id,
          taskName: task.name,
          // FIXED: Use consistent deadline property
          dueDate: taskDeadline,
          requiredHours: requiredHours,
          availableHours: availableHours,
          shortfallHours: shortfall,
          conflictingBlackout: primaryConflict,
          allConflictingBlackouts: conflictingBlackouts
        });      debugLog(`⚠️ Conflict detected for "${task.name}": need ${shortfall.toFixed(1)}h more time`);
    }
    
    return conflicts;
  }
  
  calculateAvailableHours(date, dayStart, dayEnd, conflictingBlackouts) {
    const dayOfWeek = date.getDay();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    
    let totalMinutes = (dayEnd - dayStart) / (1000 * 60);
    let blockedMinutes = 0;
    
    // Check blackout schedule for this day
    const blackoutSchedule = this.userPreferences?.blackoutSchedule || {};
    const dayBlackouts = blackoutSchedule[dayName] || [];
    
    for (const blackout of dayBlackouts) {
      let startTime, endTime, blackoutName;
      
      // Handle different blackout formats
      if (typeof blackout === 'string') {
        const [start, end] = blackout.split('-');
        startTime = start;
        endTime = end;
        blackoutName = 'Blackout Period';
      } else if (blackout.range) {
        const [start, end] = blackout.range.split('-');
        startTime = start;
        endTime = end;
        blackoutName = blackout.name || 'Blackout Period';
      } else if (blackout.startTime && blackout.endTime) {
        startTime = blackout.startTime;
        endTime = blackout.endTime;
        blackoutName = blackout.name || 'Blackout Period';
      } else {
        continue;
      }
      
      if (!startTime || !endTime) continue;
      
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const blackoutStart = new Date(date);
      blackoutStart.setHours(startHour, startMin, 0, 0);
      
      const blackoutEnd = new Date(date);
      blackoutEnd.setHours(endHour, endMin, 0, 0);
      
      // Handle overnight blackouts
      if (endHour < startHour) {
        blackoutEnd.setDate(blackoutEnd.getDate() + 1);
      }
      
      // Check if blackout overlaps with study time
      const overlapStart = Math.max(dayStart.getTime(), blackoutStart.getTime());
      const overlapEnd = Math.min(dayEnd.getTime(), blackoutEnd.getTime());
      
      if (overlapStart < overlapEnd) {
        const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
        blockedMinutes += overlapMinutes;
        
        // Track this blackout as conflicting
        const existingConflict = conflictingBlackouts.find(c => 
          c.name === blackoutName && c.day === dayName
        );
        
        if (!existingConflict) {
          conflictingBlackouts.push({
            name: blackoutName,
            day: dayName,
            timeRange: `${startTime} - ${endTime}`,
            blockedHours: overlapMinutes / 60,
            startTime: startTime,
            endTime: endTime
          });
        } else {
          existingConflict.blockedHours += overlapMinutes / 60;
        }
      }
    }
    
    const availableMinutes = Math.max(0, totalMinutes - blockedMinutes);
    return availableMinutes / 60; // Return hours
  }

  generateDaySchedule(tasks, date) {
    debugLog(`🧠 generateDaySchedule called (backward compatibility) for ${format(date, 'yyyy-MM-dd')}`);
    debugLog(`📝 Input tasks count: ${tasks?.length || 0}`);
    
    if (!tasks || tasks.length === 0) {
      debugLog(`📭 No tasks provided for ${format(date, 'yyyy-MM-dd')}`);
      return [];
    }
    
    // Convert tasks to allocated format for cognitive optimization
    const allocatedTasks = tasks.map(task => {
      const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
      const timeSpent = task.timeSpent || 0;
      const remainingTime = Math.max(0, timeRequired - timeSpent);
      
      // Create optimal session plan
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
    
    // Use cognitive-optimized day schedule generation
    return this.generateCognitiveOptimizedDaySchedule(allocatedTasks, date, []);
  }

  findAvailableTimeSlot(date, durationMinutes, task, existingSchedule = []) {
    debugLog(`🔍 Finding time slot for ${task.name} on ${format(date, 'yyyy-MM-dd')} (${durationMinutes}min)`);
    debugLog(`📋 Existing schedule items to avoid:`, existingSchedule.map(item => ({ 
      name: item.taskName, 
      start: item.startTime?.toLocaleTimeString?.() || item.startTime, 
      end: item.endTime?.toLocaleTimeString?.() || item.endTime 
    })));
    
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const blackoutSchedule = this.userPreferences.blackoutSchedule || {};
    const dayBlackouts = blackoutSchedule[dayOfWeek] || [];
    
    debugLog(`📅 Day: ${dayOfWeek}, Blackouts:`, dayBlackouts);
    
    // Get current time in user's timezone
    const now = getCurrentTimeInUserTimezone();
    const userTimezone = getUserTimezone();
    
    // ENHANCED: Better timezone-safe date comparison
    const targetDateStr = format(date, 'yyyy-MM-dd');
    const todayDateStr = format(now, 'yyyy-MM-dd');
    const isToday = targetDateStr === todayDateStr;
    
    debugLog(`🕐 Current time in ${userTimezone}: ${formatDateTimeInUserTimezone(now)}`);
    
    // Time window boundaries
    let startHour = 7;  // Default start
    let endHour = 23;   // Default end
    
    if (isToday) {
      // For today, start from current time (rounded to next 15 minutes) but not before 7 AM
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      if (currentHour >= 7) {
        startHour = currentHour;
        // Round up to next 15-minute interval
        const roundedMinutes = Math.ceil(currentMinute / 15) * 15;
        if (roundedMinutes >= 60) {
          startHour += 1;
        }
      }
      
      debugLog(`🕐 Today's scheduling: starting from ${startHour}:${currentMinute >= 45 ? '00' : String(Math.ceil(currentMinute / 15) * 15).padStart(2, '0')} (current time in ${userTimezone}: ${formatDateTimeInUserTimezone(now, { hour: '2-digit', minute: '2-digit' })})`);
    }

    // Check if task deadline allows for this timing
    const taskDeadline = task.deadline || task.dueDate;
    if (taskDeadline) {
      // FIXED: Consistent deadline parsing
      let deadline;
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadline = taskDeadline.toDate();
      } else {
        deadline = new Date(taskDeadline);
      }
      
      if (!isNaN(deadline.getTime())) {
        const deadlineHour = deadline.getHours();
        
        if (isToday && deadline.getDate() === now.getDate()) {
          // Task is due today - make sure we don't schedule past the deadline
          endHour = Math.min(endHour, deadlineHour);
          debugLog(`⏰ Task due today at ${formatDateTimeInUserTimezone(deadline, { hour: '2-digit', minute: '2-digit' })}, adjusting end time to ${endHour}:00`);
        }
      }
    }    
    // Try every 15 minutes from start time
    for (let hour = startHour; hour < endHour; hour++) {
      const startMinute = (hour === startHour && isToday) ? Math.ceil(now.getMinutes() / 15) * 15 : 0;
      
      for (let minute = startMinute; minute < 60; minute += 15) {
        // ENHANCED: Create date in local timezone consistently
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
        
        // Check if slot goes past end time
        if (slotEnd.getHours() >= endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
          continue;
        }
        
        const slotStartTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const slotEndTime = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;
        
        debugLog(`🕐 Checking slot: ${slotStartTime}-${slotEndTime}`);
        
        // Check for blackout conflicts
        const hasBlackoutConflict = this.checkBlackoutConflict(slotStartTime, slotEndTime, dayBlackouts);
        
        // Check for existing schedule conflicts
        const hasScheduleConflict = this.checkScheduleConflict(slotStart, slotEnd, existingSchedule);
        
        if (!hasBlackoutConflict && !hasScheduleConflict) {
          debugLog(`✅ Found available slot: ${slotStartTime}-${slotEndTime}`);
          return {
            start: slotStart,
            end: slotEnd,
            isOverride: false
          };
        } else {
          if (hasBlackoutConflict) {
            debugLog(`❌ Slot conflicts with blackout: ${slotStartTime}-${slotEndTime}`);
          }
          if (hasScheduleConflict) {
            debugLog(`❌ Slot conflicts with existing schedule: ${slotStartTime}-${slotEndTime}`);
          }
        }
      }
    }
    
    debugLog(`❌ No available time slot found for ${task.name} on ${format(date, 'yyyy-MM-dd')}`);
    debugLog(`🔍 Debugging info - Start hour: ${startHour}, End hour: ${endHour}, Is today: ${isToday}`);
    debugLog(`🔍 Duration needed: ${durationMinutes} minutes`);
    debugLog(`🔍 Day blackouts:`, dayBlackouts);
    
    return null;
  }

  checkBlackoutConflict(startTime, endTime, dayBlackouts) {
    debugLog(`🔍 Checking blackout conflict: ${startTime}-${endTime}`);
    debugLog(`🚫 Day blackouts:`, dayBlackouts);
    
    if (!dayBlackouts || dayBlackouts.length === 0) {
      debugLog(`✅ No blackouts for this day`);
      return false;
    }
    
    for (const blackout of dayBlackouts) {
      let blackoutStart, blackoutEnd;
      
      if (typeof blackout === 'string') {
        const [start, end] = blackout.split('-');
        blackoutStart = start;
        blackoutEnd = end;
      } else if (blackout.range) {
        // Handle object format with range property (new format from BlackoutScheduleManager)
        const [start, end] = blackout.range.split('-');
        blackoutStart = start;
        blackoutEnd = end;
      } else if (blackout.start && blackout.end) {
        blackoutStart = blackout.start;
        blackoutEnd = blackout.end;
      } else if (blackout.startTime && blackout.endTime) {
        blackoutStart = blackout.startTime;
        blackoutEnd = blackout.endTime;
      } else {
        debugLog(`⚠️ Invalid blackout format:`, blackout);
        continue;
      }
      
      debugLog(`🔍 Checking against blackout: ${blackoutStart}-${blackoutEnd}`);
      
      // FIXED: Better time comparison - handle overnight ranges properly
      const isOvernightRange = this.isOvernightTimeRange(blackoutStart, blackoutEnd);
      
      if (isOvernightRange) {
        // FIXED: Handle overnight ranges like 22:00-07:00 by splitting into two periods
        // Period 1: 22:00-23:59 (same day)
        // Period 2: 00:00-07:00 (next day)
        
        const period1Start = blackoutStart;
        const period1End = "23:59";
        const period2Start = "00:00";
        const period2End = blackoutEnd;
        
        // Check conflict with period 1 (evening part)
        if (this.hasTimeOverlap(startTime, endTime, period1Start, period1End)) {
          debugLog(`❌ Conflict found with overnight blackout period 1: ${period1Start}-${period1End}`);
          return true;
        }
        
        // Check conflict with period 2 (early morning part)
        if (this.hasTimeOverlap(startTime, endTime, period2Start, period2End)) {
          debugLog(`❌ Conflict found with overnight blackout period 2: ${period2Start}-${period2End}`);
          return true;
        }
      } else {
        // Normal range within same day
        if (this.hasTimeOverlap(startTime, endTime, blackoutStart, blackoutEnd)) {
          debugLog(`❌ Conflict found with blackout: ${blackoutStart}-${blackoutEnd}`);
          return true;
        }
      }
    }
    
    debugLog(`✅ No conflicts found`);
    return false;
  }

  /**
   * FIXED: Helper method to determine if a time range spans overnight
   */
  isOvernightTimeRange(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    // If start time is later than end time, it's an overnight range
    return startHour > endHour || (startHour === endHour && startMin > endMin);
  }

  /**
   * FIXED: Helper method to check if two time ranges overlap
   */
  hasTimeOverlap(startTime1, endTime1, startTime2, endTime2) {
    const [start1Hour, start1Min] = startTime1.split(':').map(Number);
    const [end1Hour, end1Min] = endTime1.split(':').map(Number);
    const [start2Hour, start2Min] = startTime2.split(':').map(Number);
    const [end2Hour, end2Min] = endTime2.split(':').map(Number);
    
    // Convert times to minutes for easier comparison
    const start1Minutes = start1Hour * 60 + start1Min;
    const end1Minutes = end1Hour * 60 + end1Min;
    const start2Minutes = start2Hour * 60 + start2Min;
    const end2Minutes = end2Hour * 60 + end2Min;
    
    // Two time ranges overlap if one starts before the other ends AND one ends after the other starts
    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }

  checkScheduleConflict(slotStart, slotEnd, existingSchedule) {
    debugLog(`🔍 Checking schedule conflict: ${formatDateTimeInUserTimezone(slotStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(slotEnd, { hour: '2-digit', minute: '2-digit' })} (${getUserTimezone()})`);
    debugLog(`📋 Existing schedule items to check:`, existingSchedule?.length || 0);
    
    if (!existingSchedule || existingSchedule.length === 0) {
      debugLog(`✅ No existing schedule items to check`);
      return false;
    }
    
    for (const scheduled of existingSchedule) {
      if (!scheduled || !scheduled.startTime || !scheduled.endTime) {
        debugLog(`⚠️ Skipping invalid schedule item:`, scheduled);
        continue;
      }
      
      let scheduledStart, scheduledEnd;
      
      // Handle different date formats
      if (scheduled.startTime instanceof Date) {
        scheduledStart = scheduled.startTime;
        scheduledEnd = scheduled.endTime;
      } else {
        // Convert string times to Date objects for comparison
        scheduledStart = new Date(scheduled.startTime);
        scheduledEnd = new Date(scheduled.endTime);
      }
      
      debugLog(`🔍 Checking against: ${scheduled.taskName || scheduled.task} (${formatDateTimeInUserTimezone(scheduledStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(scheduledEnd, { hour: '2-digit', minute: '2-digit' })})`);
      
      // FIXED: More robust overlap detection with better edge case handling
      // Two time slots overlap if one starts before the other ends AND one ends after the other starts
      const slotStartTime = slotStart.getTime();
      const slotEndTime = slotEnd.getTime();
      const scheduledStartTime = scheduledStart.getTime();
      const scheduledEndTime = scheduledEnd.getTime();
      
      // Check for any time overlap
      const overlaps = (slotStartTime < scheduledEndTime && slotEndTime > scheduledStartTime);
      
      if (overlaps) {
        debugLog(`❌ Schedule conflict found with: ${scheduled.taskName || scheduled.task}`);
        debugLog(`   New slot: ${formatDateTimeInUserTimezone(slotStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(slotEnd, { hour: '2-digit', minute: '2-digit' })} (${slotStartTime}-${slotEndTime})`);
        debugLog(`   Existing: ${formatDateTimeInUserTimezone(scheduledStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(scheduledEnd, { hour: '2-digit', minute: '2-digit' })} (${scheduledStartTime}-${scheduledEndTime})`);
        return true;
      }
    }
    
    debugLog(`✅ No schedule conflicts found`);
    return false;
  }

  generateStudyNotes(task) {
    const taskType = task.type || 'homework';
    const difficulty = task.difficulty || 'Medium';
    
    // Evidence-based learning strategies based on cognitive science
    const strategies = {
      homework: [
        "Use active recall: Test yourself before looking at answers",
        "Apply the Pomodoro Technique: 25min work, 5min break",
        "Practice spaced repetition for better retention"
      ],
      test: [
        "Create practice questions and answer them without notes",
        "Use the testing effect: Frequent low-stakes testing",
        "Review past mistakes and understand why they occurred",
        "Practice under timed conditions to simulate exam pressure"
      ],
      project: [
        "Break down into smaller, manageable milestones",
        "Use the Feynman Technique: Explain concepts simply",
        "Create visual aids like mind maps or flowcharts",
        "Plan regular progress reviews"
      ],
      reading: [
        "Use SQ3R method: Survey, Question, Read, Recite, Review",
        "Take notes using the Cornell note-taking system",
        "Summarize key points in your own words",
        "Connect new information to prior knowledge"
      ],
      lab: [
        "Review procedures before starting",
        "Document observations immediately",
        "Connect theory to practical application",
        "Analyze results and identify sources of error"
      ],
      essay: [
        "Create an outline before writing",
        "Use topic sentences for each paragraph",
        "Support arguments with evidence",
        "Edit for clarity and coherence"
      ]
    };
    
    const difficultyAdjustments = {
      Hard: ["Take frequent breaks to prevent cognitive overload", "Seek help if stuck for more than 15 minutes"],
      Medium: ["Stay focused and minimize distractions"],
      Easy: ["Use this as a warm-up for harder tasks", "Complete efficiently to save time"]
    };
    
    const baseStrategies = strategies[taskType] || strategies.homework;
    const difficultyTips = difficultyAdjustments[difficulty] || [];
    
    return [...baseStrategies, ...difficultyTips];
  }

  findTasksForDay(tasks, date) {
    debugLog(`🔍 Finding tasks for ${format(date, 'yyyy-MM-dd')}`);
    
    const targetDate = new Date(date);
    const now = new Date();
    
    // If the target date is today, don't schedule tasks that are due before now
    const isToday = format(targetDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    const relevantTasks = tasks.filter(task => {
      // FIXED: Use consistent deadline parsing
      const taskDeadline = task.deadline || task.dueDate;
      if (!taskDeadline) {
        debugLog(`⚠️ Task ${task.name} has no deadline, including anyway`);
        return true; // Include tasks without deadlines
      }
      
      // Convert estimated_time (minutes) to timeRequired (hours) correctly
      const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
      const timeSpent = task.timeSpent || 0;
      
      if (timeSpent >= timeRequired) {
        debugLog(`✅ Task ${task.name} already completed (${timeSpent}h >= ${timeRequired}h)`);
        return false;
      }
      
      // FIXED: Consistent deadline parsing
      let deadlineDate;
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadlineDate = taskDeadline.toDate();
      } else {
        deadlineDate = new Date(taskDeadline);
      }
      
      // Validate deadline
      if (isNaN(deadlineDate.getTime())) {
        console.warn(`⚠️ Task ${task.name} has invalid deadline:`, taskDeadline);
        return false;
      }
      
      // Don't schedule tasks that are already past their deadline
      if (deadlineDate < targetDate) {
        debugLog(`⏰ Task ${task.name} deadline (${deadlineDate.toLocaleString()}) is before target date (${targetDate.toLocaleString()}), skipping`);
        return false;
      }
      
      // For today, don't schedule tasks due before current time
      if (isToday && deadlineDate < now) {
        debugLog(`⏰ Task ${task.name} deadline (${deadlineDate.toLocaleString()}) is before current time (${now.toLocaleString()}), skipping`);
        return false;
      }
      
      const hoursUntilDeadline = (deadlineDate - targetDate) / (1000 * 60 * 60);
      
      debugLog(`📋 Task ${task.name}: ${hoursUntilDeadline.toFixed(2)} hours until deadline from target date (estimated: ${task.estimated_time}min, required: ${timeRequired.toFixed(2)}h)`);
      
      // Include tasks that are due within the next 14 days from the target date
      return hoursUntilDeadline >= 0 && hoursUntilDeadline <= (14 * 24);
    });
    
    debugLog(`📊 Found ${relevantTasks.length} relevant tasks for ${format(date, 'yyyy-MM-dd')}`);
    return relevantTasks.map(task => ({
      ...task,
      // Ensure required fields exist and are properly converted
      timeRequired: task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1),
      timeSpent: task.timeSpent || 0
    }));
  }

  analyzeTask(task) {
    const taskType = task.type || 'homework';
    const difficulty = task.difficulty || 'Medium';
    
    // Evidence-based difficulty ratings
    const difficultyMap = {
      Easy: 0.3,
      Medium: 0.6,
      Hard: 0.9
    };
    
    // Task type analysis with appropriate icons and strategies
    const taskTypeInfo = {
      homework: { 
        name: 'Homework Practice', 
        icon: '📝',
        strategy: 'Active Practice',
        description: 'Reinforce learning through deliberate practice'
      },
      test: { 
        name: 'Test Preparation', 
        icon: '📊',
        strategy: 'Retrieval Practice',
        description: 'Strengthen memory through testing effect'
      },
      project: { 
        name: 'Project Work', 
        icon: '🛠️',
        strategy: 'Applied Learning',
        description: 'Build understanding through creation and application'
      },
      reading: { 
        name: 'Reading Assignment', 
        icon: '📖',
        strategy: 'Active Reading',
        description: 'Comprehend and retain through structured reading'
      },
      lab: { 
        name: 'Laboratory Work', 
        icon: '🔬',
        strategy: 'Experiential Learning',
        description: 'Learn through hands-on experimentation and observation'
      },
      essay: { 
        name: 'Writing Assignment', 
        icon: '✍️',
        strategy: 'Constructive Learning',
        description: 'Develop understanding through structured writing'
      }
    };
    
    const typeInfo = taskTypeInfo[taskType] || taskTypeInfo.homework;
    
    return {
      difficulty: difficultyMap[difficulty],
      timeRequired: task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1),
      urgency: this.calculateUrgency(task),
      taskType: typeInfo,
      learningStrategy: { 
        name: typeInfo.strategy, 
        description: typeInfo.description 
      }
    };
  }

  calculateUrgency(task) {
    // FIXED: Check both deadline and dueDate properties for consistency
    const taskDeadline = task.deadline || task.dueDate;
    if (!taskDeadline) return 0.1;
    
    const now = new Date();
    // FIXED: Consistent date parsing logic - handle both Firestore timestamps and regular dates
    let deadline;
    if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
      deadline = taskDeadline.toDate();
    } else {
      deadline = new Date(taskDeadline);
    }
    
    // FIXED: Validate parsed deadline
    if (isNaN(deadline.getTime())) {
      console.warn(`⚠️ Invalid deadline for task "${task.name}":`, taskDeadline);
      return 0.1;
    }
    
    const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
    
    debugLog(`⏰ Task "${task.name}": Current time in ${getUserTimezone()}: ${formatDateTimeInUserTimezone(now)}, Deadline: ${formatDateTimeInUserTimezone(deadline)}, Hours until deadline: ${hoursUntilDeadline.toFixed(2)}`);
    
    // Overdue tasks get maximum urgency
    if (hoursUntilDeadline < 0) return 1.0;
    
    // Very urgent (less than 6 hours) - needs immediate attention
    if (hoursUntilDeadline <= 6) return 0.95;
    
    // Urgent (less than 24 hours)
    if (hoursUntilDeadline <= 24) return 0.8;
    
    // Moderately urgent (less than 48 hours)  
    if (hoursUntilDeadline <= 48) return 0.6;
    
    // Less urgent (less than a week)
    if (hoursUntilDeadline <= 168) return 0.4;
    
    return 0.2;
  }

  // Load learning history from saved data
  loadLearningHistory(history) {
    this.learningHistory = history || [];
    debugLog("📚 Loaded learning history:", this.learningHistory.length, "entries");
  }

  // Get learning history in a format suitable for saving
  getLearningHistoryForSave() {
    return this.learningHistory;
  }

  // Add a learning event to the history
  addLearningEvent(event) {
    this.learningHistory.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the last 100 events to prevent unlimited growth
    if (this.learningHistory.length > 100) {
      this.learningHistory = this.learningHistory.slice(-100);
    }
  }

  /**
   * Enhanced task allocation using cognitive optimization principles
   * Considers circadian rhythms, cognitive load, and spaced repetition
   */
  allocateTasksWithCognitiveOptimization(tasks, existingSchedule = {}, preserveCurrentDay = false) {
    debugLog("🧠 Starting cognitive-optimized task allocation...");
    debugLog("📋 Existing schedule to consider:", Object.keys(existingSchedule).length > 0 ? Object.keys(existingSchedule) : "none");
    debugLog("🔒 Preserve current day:", preserveCurrentDay);
    
    const now = new Date();
    const allocation = {};
    const allocatedTasks = new Set();
    
    // Get task IDs that already have valid schedule items
    const alreadyScheduledTaskIds = this.getScheduledTaskIds(existingSchedule, tasks, preserveCurrentDay);
    debugLog("📅 Tasks already scheduled:", Array.from(alreadyScheduledTaskIds));
    
    // Initialize allocation for the next 14 days (extended for better spaced repetition)
    for (let i = 0; i < 14; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      
      // Skip weekends if user preference is set
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
    
    // Sort tasks using scientific priority
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
      
      // Skip tasks that already have valid schedule items
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
      
      // Use cognitive optimization strategies
      const allocationSuccess = this.allocateTaskWithCognitiveStrategy(task, allocation, allocatedTasks);
      
      if (allocationSuccess) {
        allocatedCount++;
        debugLog(`✅ Successfully allocated ${task.name} using cognitive strategy`);
      } else {
        debugLog(`❌ Failed to allocate ${task.name} even with cognitive optimization`);
      }
      
      debugLog(`📊 Task ${task.name} allocation result: ${allocationSuccess ? 'SUCCESS' : 'FAILED'}`);
    }
    
    debugLog(`\n� Cognitive Allocation Summary:`);
    debugLog(`   Total tasks: ${sortedTasks.length}`);
    debugLog(`   Processed: ${processedCount}`);
    debugLog(`   Successfully allocated: ${allocatedCount}`);
    debugLog(`   Failed to allocate: ${processedCount - allocatedCount}`);
    
    // Convert allocation format back to simple task arrays
    const simpleAllocation = {};
    Object.entries(allocation).forEach(([date, dayData]) => {
      simpleAllocation[date] = dayData.tasks;
      debugLog(`  ${date}: ${dayData.tasks.length} tasks (cognitive load: ${dayData.totalCognitiveLoad.toFixed(2)}, sessions: ${dayData.sessionCount})`);
    });
    
    return simpleAllocation;
  }

  /**
   * Allocate a single task using cognitive optimization strategies
   */
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
    
    // Strategy 1: High cognitive load tasks during peak hours
    if (cognitiveLoad > 0.7) {
      return this.allocateHighCognitiveLoadTask(task, allocation, allocatedTasks, optimalSessionPlan);
    }
    
    // Strategy 2: Test preparation with spaced repetition
    if (task.type === 'test') {
      return this.allocateTestPrepWithSpacedRepetition(task, allocation, allocatedTasks);
    }
    
    // Strategy 3: Long-form work (projects, essays) in deep work blocks
    if (task.type === 'project' || task.type === 'essay') {
      return this.allocateDeepWorkTask(task, allocation, allocatedTasks, optimalSessionPlan);
    }
    
    // Strategy 4: Regular homework with optimal session distribution
    return this.allocateRegularTaskOptimally(task, allocation, allocatedTasks, optimalSessionPlan);
  }

  /**
   * Allocate high cognitive load tasks during peak performance hours
   */
  allocateHighCognitiveLoadTask(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`🧠 High cognitive load allocation for ${task.name}`);
    
    const availableDays = Object.keys(allocation);
    const timePreference = this.determineOptimalTimeOfDay(task);
    const cognitiveLoad = this.calculateCognitiveLoad(task);
    
    // Find days with available peak hours and low cognitive load
    const suitableDays = availableDays.filter(dateKey => {
      const dayData = allocation[dateKey];
      return dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.6 && // Less than 60% cognitive capacity
             dayData.peakHoursUsed < timePreference.preferred.length * 0.5; // Less than 50% peak hours used
    });
    
    if (suitableDays.length === 0) {
      debugLog(`⚠️ No suitable peak-hour days found for ${task.name}`);
      return this.allocateRegularTaskOptimally(task, allocation, allocatedTasks, sessionPlan);
    }
    
    // Distribute sessions across suitable days
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

  /**
   * Allocate test preparation using spaced repetition principles
   */
  allocateTestPrepWithSpacedRepetition(task, allocation, allocatedTasks) {
    debugLog(`📚 Spaced repetition allocation for test prep: ${task.name}`);
    
    const spacedSchedule = task.spaceRepetitionSchedule || this.calculateSpacedRepetitionSchedule(task);
    const sessionPlan = task.optimalSessionPlan || this.createOptimalSessionPlan(task);
    const availableDays = Object.keys(allocation);
    
    debugLog(`📅 Spaced repetition schedule:`, spacedSchedule);
    
    // Initial learning sessions
    let initialSessionsAllocated = 0;
    const initialSessions = Math.ceil(sessionPlan.totalSessions * 0.7); // 70% for initial learning
    
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
    
    // Spaced review sessions
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
          
          dayData.totalCognitiveLoad += this.calculateCognitiveLoad(task) * 0.5; // Reviews have lower cognitive load
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

  /**
   * Allocate deep work tasks (projects, essays) in focused blocks
   */
  allocateDeepWorkTask(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`�️ Deep work allocation for ${task.name}`);
    
    const availableDays = Object.keys(allocation);
    const sessionsNeeded = sessionPlan.totalSessions;
    const timePreference = this.determineOptimalTimeOfDay(task);
    
    // Find days with enough consecutive time for deep work
    const deepWorkDays = availableDays.filter(dateKey => {
      const dayData = allocation[dateKey];
      return dayData.sessionCount < 2 && // Low session count for focused work
             dayData.totalCognitiveLoad < this.userPreferences.maxStudyHoursPerDay * 0.7;
    });
    
    if (deepWorkDays.length === 0) {
      debugLog(`⚠️ No suitable deep work days found for ${task.name}`);
      return this.allocateRegularTaskOptimally(task, allocation, allocatedTasks, sessionPlan);
    }
    
    // Allocate sessions with preference for fewer, longer sessions
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
          preferredTimeSlots: timePreference.preferred.slice(0, 3) // Morning peak hours
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

  /**
   * Allocate regular tasks with optimal distribution
   */
  allocateRegularTaskOptimally(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`📝 Optimal regular allocation for ${task.name}`);
    
    const availableDays = Object.keys(allocation);
    const sessionsNeeded = sessionPlan.totalSessions;
    const cognitiveLoad = this.calculateCognitiveLoad(task);
    
    // FIXED: Distribute sessions more evenly, considering both urgency and available capacity
    const urgency = this.calculateUrgency(task);
    debugLog(`📊 Task details: sessions=${sessionsNeeded}, cognitiveLoad=${cognitiveLoad.toFixed(2)}, urgency=${urgency.toFixed(2)}`);
    
    // FIXED: For urgent tasks (due soon), prioritize getting scheduled regardless of day load
    if (urgency >= 0.6) {
      debugLog(`🚨 High urgency task - using priority allocation`);
      return this.allocateUrgentTask(task, allocation, allocatedTasks, sessionPlan);
    }
    
    // FIXED: Better distribution algorithm for regular tasks
    // Find days with capacity and distribute sessions more intelligently
    const suitableDays = availableDays.filter(dateKey => {
      const dayData = allocation[dateKey];
      // FIXED: Use a more flexible capacity check - allow up to 90% of max capacity instead of hard limits
      const currentLoad = dayData.totalCognitiveLoad || 0;
      const maxLoad = this.userPreferences.maxStudyHoursPerDay * 0.9; // 90% capacity
      
      return currentLoad < maxLoad;
    });
    
    if (suitableDays.length === 0) {
      debugLog(`⚠️ No suitable days with capacity found for ${task.name}, trying fallback`);
      return this.fallbackTaskAllocation(task, allocation, task.timeRequired - (task.timeSpent || 0), allocatedTasks);
    }
    
    debugLog(`📅 Found ${suitableDays.length} suitable days for distribution`);
    
    // Distribute sessions evenly across available days
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
          
          debugLog(`� Allocated regular session ${session.sessionNumber} of ${task.name} to ${dateKey}`);
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

  /**
   * FIXED: New method to handle urgent tasks with priority scheduling
   */
  allocateUrgentTask(task, allocation, allocatedTasks, sessionPlan) {
    debugLog(`🚨 Priority allocation for urgent task: ${task.name}`);
    
    const availableDays = Object.keys(allocation);
    const sessionsNeeded = sessionPlan.totalSessions;
    const cognitiveLoad = this.calculateCognitiveLoad(task);
    
    // For urgent tasks, try to fit them in even if it means higher daily loads
    let sessionsAllocated = 0;
    
    for (const dateKey of availableDays) {
      if (sessionsAllocated >= sessionsNeeded) break;
      
      const dayData = allocation[dateKey];
      const currentLoad = dayData.totalCognitiveLoad || 0;
      
      // FIXED: Allow higher loads for urgent tasks but still respect absolute maximum
      const maxLoad = this.userPreferences.maxStudyHoursPerDay; // Full capacity for urgent tasks
      const remainingCapacity = maxLoad - currentLoad;
      
      if (remainingCapacity <= 0.25) { // Minimum 15 minutes needed
        debugLog(`⏭️ Skipping ${dateKey} - no capacity remaining (${remainingCapacity.toFixed(2)}h)`);
        continue;
      }
      
      // Schedule as many sessions as possible on this day
      const maxSessionsThisDay = Math.min(
        3, // Maximum 3 sessions per day even for urgent tasks
        sessionsNeeded - sessionsAllocated,
        Math.floor(remainingCapacity / (cognitiveLoad * 0.5)) || 1 // Allow lighter cognitive loading for urgent tasks
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
        
        dayData.totalCognitiveLoad += cognitiveLoad * 0.8; // Slightly reduced cognitive load impact for urgent tasks
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

  /**
   * Enhanced merge strategy that considers cognitive factors
   */
  mergeScheduleWithCognitiveStrategy(existingSchedule, newAllocations) {
    debugLog("🧠 Merging schedule with cognitive optimization...");
    
    const mergedSchedule = { ...existingSchedule };
    
    // Process each day's new allocations
    Object.entries(newAllocations).forEach(([dateKey, newTasks]) => {
      if (newTasks.length === 0) {
        // No new tasks for this day, keep existing schedule
        if (!mergedSchedule[dateKey]) {
          mergedSchedule[dateKey] = [];
        }
        return;
      }
      
      // Get existing schedule for this day
      const existingDaySchedule = existingSchedule[dateKey] || [];
      
      // Generate schedule for new tasks with cognitive optimization
      const [year, month, day] = dateKey.split('-').map(Number);
      const currentDay = new Date(year, month - 1, day);
      const newDaySchedule = this.generateCognitiveOptimizedDaySchedule(newTasks, currentDay, existingDaySchedule);
      
      // Combine existing and new schedule items
      const combinedSchedule = [...existingDaySchedule, ...newDaySchedule];
      
      // Sort by cognitive optimization factors
      combinedSchedule.sort((a, b) => {
        const timeA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
        const timeB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
        
        // First by preferred time slots (peak hours first)
        const hourA = timeA.getHours();
        const hourB = timeB.getHours();
        
        const isPeakA = this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hourA);
        const isPeakB = this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hourB);
        
        if (isPeakA && !isPeakB) return -1;
        if (isPeakB && !isPeakA) return 1;
        
        // Then by time
        return timeA - timeB;
      });
      
      mergedSchedule[dateKey] = combinedSchedule;
      
      debugLog(`🧠 ${dateKey}: ${existingDaySchedule.length} existing + ${newDaySchedule.length} new = ${combinedSchedule.length} total (cognitive optimized)`);
    });
    
    return mergedSchedule;
  }

  /**
   * Generate cognitive-optimized day schedule
   * Uses circadian rhythms, cognitive load theory, and optimal session timing
   */
  generateCognitiveOptimizedDaySchedule(tasks, date, existingDaySchedule = []) {
    debugLog(`🧠 generateCognitiveOptimizedDaySchedule called for ${format(date, 'yyyy-MM-dd')}`);
    debugLog(`📝 Allocated tasks count: ${tasks?.length || 0}`);
    debugLog(`📋 Existing day schedule items: ${existingDaySchedule?.length || 0}`);
    
    if (!tasks || tasks.length === 0) {
      debugLog(`📭 No allocated tasks for ${format(date, 'yyyy-MM-dd')}`);
      return [];
    }
    
    const daySchedule = [];
    
    // Calculate total available cognitive capacity for the day
    let remainingCognitiveCapacity = this.calculateDailyCognitiveCapacity(date);
    debugLog(`🧠 Available cognitive capacity for ${format(date, 'yyyy-MM-dd')}: ${remainingCognitiveCapacity.toFixed(2)}`);
    
    // Sort tasks by cognitive optimization factors
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
      
      // Calculate session duration based on cognitive factors
      const sessionDuration = this.calculateCognitiveSessionDuration(task, remainingCognitiveCapacity);
      
      if (sessionDuration < 15) {
        debugLog(`⏭️ Skipping task ${task.taskName || task.name} - session too short (${sessionDuration}min < 15min)`);
        continue;
      }
      
      // Find optimal time slot based on cognitive factors
      const timeSlot = this.findCognitiveOptimalTimeSlot(task, date, sessionDuration, [...existingDaySchedule, ...daySchedule]);
      
      if (timeSlot) {
        const scheduleItem = this.createCognitiveScheduleItem(task, timeSlot, sessionDuration, date);
        daySchedule.push(scheduleItem);
        
        // Reduce remaining cognitive capacity
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

  /**
   * Calculate daily cognitive capacity based on circadian rhythms and user factors
   */
  calculateDailyCognitiveCapacity(date) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base capacity adjusted for day type
    let baseCapacity = this.userPreferences.maxStudyHoursPerDay;
    
    // Weekend adjustment (typically lower cognitive capacity due to relaxation)
    if (isWeekend && this.userPreferences.weekendStudy) {
      baseCapacity *= 0.8;
    }
    
    // Convert to cognitive load units (considering peak vs non-peak hours)
    const peakHours = this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.length;
    const totalAvailableHours = 14; // 7 AM to 9 PM
    const peakCapacityRatio = 1.2; // Peak hours have 20% more capacity
    const regularCapacityRatio = 0.9; // Regular hours have 10% less capacity
    
    const peakCapacity = (peakHours * peakCapacityRatio);
    const regularCapacity = ((totalAvailableHours - peakHours) * regularCapacityRatio);
    
    return Math.min(baseCapacity, (peakCapacity + regularCapacity) * 0.8); // 80% utilization factor
  }

  /**
   * Sort tasks by cognitive optimization factors
   */
  sortTasksByCognitiveFactors(tasks, date) {
    return [...tasks].sort((a, b) => {
      // Factor 1: Cognitive load (high load tasks in peak hours)
      const loadA = a.cognitiveLoad || this.calculateCognitiveLoad(a);
      const loadB = b.cognitiveLoad || this.calculateCognitiveLoad(b);
      
      // Factor 2: Time preference (peak hours first)
      const prefA = a.preferredTimeSlots || [];
      const prefB = b.preferredTimeSlots || [];
      const peakPreferenceA = prefA.some(h => this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(h));
      const peakPreferenceB = prefB.some(h => this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(h));
      
      // Factor 3: Session type priority
      const sessionPriorityA = this.getSessionTypePriority(a.sessionType);
      const sessionPriorityB = this.getSessionTypePriority(b.sessionType);
      
      // Factor 4: Urgency
      const urgencyA = this.calculateUrgency(a);
      const urgencyB = this.calculateUrgency(b);
      
      // Combine factors with weights
      const scoreA = (loadA * 0.3) + (peakPreferenceA ? 0.25 : 0) + (sessionPriorityA * 0.2) + (urgencyA * 0.25);
      const scoreB = (loadB * 0.3) + (peakPreferenceB ? 0.25 : 0) + (sessionPriorityB * 0.2) + (urgencyB * 0.25);
      
      return scoreB - scoreA; // Higher scores first
    });
  }

  /**
   * Get session type priority for cognitive optimization
   */
  getSessionTypePriority(sessionType) {
    const priorities = {
      'deep-work': 0.9,           // Highest priority - needs optimal conditions
      'peak-cognitive': 0.8,      // High cognitive load tasks
      'initial-learning': 0.7,    // Learning new material
      'spaced-repetition-initial': 0.6,
      'pomodoro': 0.5,            // Standard focused work
      'standard': 0.4,
      'spaced-repetition-review': 0.3, // Reviews can be done anytime
      'optimal-distribution': 0.2,
      'fallback-session': 0.1     // Lowest priority
    };
    
    return priorities[sessionType] || 0.4;
  }

  /**
   * Calculate cognitive-optimized session duration
   */
  calculateCognitiveSessionDuration(task, remainingCapacity) {
    const allocatedTime = task.allocatedTime || 1; // hours
    const allocatedMinutes = allocatedTime * 60;
    const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
    const sessionType = task.sessionType;
    
    // Base duration from task allocation
    let baseDuration = allocatedMinutes;
    
    // Adjust based on cognitive capacity remaining
    const capacityFactor = Math.min(1.0, remainingCapacity / 2); // Don't use more than half remaining capacity
    let adjustedDuration = baseDuration * capacityFactor;
    
    // Session type specific adjustments
    switch (sessionType) {
      case 'deep-work':
        adjustedDuration = Math.max(60, Math.min(120, adjustedDuration)); // 1-2 hours
        break;
      case 'pomodoro':
        adjustedDuration = 25; // Fixed Pomodoro duration
        break;
      case 'peak-cognitive':
        adjustedDuration = Math.max(45, Math.min(90, adjustedDuration)); // 45-90 minutes
        break;
      case 'spaced-repetition-review':
        adjustedDuration = Math.max(15, Math.min(30, adjustedDuration)); // 15-30 minutes
        break;
      default:
        adjustedDuration = Math.max(20, Math.min(60, adjustedDuration)); // 20-60 minutes
    }
    
    // Cognitive load adjustment
    if (cognitiveLoad > 0.8) {
      adjustedDuration = Math.min(adjustedDuration, 45); // Limit high cognitive load sessions
    }
    
    // Round to standard time increments (5-minute intervals for shorter sessions, 15-minute for longer)
    const roundedDuration = this.roundToStandardIncrement(adjustedDuration);
    
    return roundedDuration;
  }

  /**
   * Round duration to standard time increments for cleaner scheduling
   */
  roundToStandardIncrement(duration) {
    // For shorter sessions (≤30 min), round to 5-minute increments
    if (duration <= 30) {
      return Math.round(duration / 5) * 5;
    }
    // For medium sessions (≤60 min), round to 10-minute increments  
    else if (duration <= 60) {
      return Math.round(duration / 10) * 10;
    }
    // For longer sessions (>60 min), round to 15-minute increments
    else {
      return Math.round(duration / 15) * 15;
    }
  }

  /**
   * Find cognitive-optimal time slot considering circadian rhythms and cognitive load
   */
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
    
    // Time window boundaries
    let startHour = 7;
    let endHour = 21; // Extended evening hours
    
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      if (currentHour >= 7) {
        startHour = currentHour;
        // Round up to next 15-minute interval
        const roundedMinutes = Math.ceil(currentMinute / 15) * 15;
        if (roundedMinutes >= 60) {
          startHour += 1;
        }
      }
    }
    
    // Generate candidate time slots with cognitive scoring
    const candidateSlots = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startMinute = (hour === startHour && isToday) ? Math.ceil(now.getMinutes() / 15) * 15 : 0;
      
      for (let minute = startMinute; minute < 60; minute += 15) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
        
        // Ensure end time is also aligned to 5-minute increments for cleaner display
        const endMinutes = slotEnd.getMinutes();
        const alignedEndMinutes = Math.round(endMinutes / 5) * 5;
        slotEnd.setMinutes(alignedEndMinutes);
        
        // Recalculate actual duration based on aligned times
        const actualDuration = Math.round((slotEnd - slotStart) / (1000 * 60));
        
        // Check if slot goes past end time
        if (slotEnd.getHours() >= endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
          continue;
        }
        
        const slotStartTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const slotEndTime = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;
        
        // Check for conflicts
        const hasBlackoutConflict = this.checkBlackoutConflict(slotStartTime, slotEndTime, dayBlackouts);
        const hasScheduleConflict = this.checkScheduleConflict(slotStart, slotEnd, existingSchedule);
        
        if (!hasBlackoutConflict && !hasScheduleConflict) {
          // Calculate cognitive optimization score
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
    
    // Sort by cognitive optimization score (highest first)
    candidateSlots.sort((a, b) => b.cognitiveScore - a.cognitiveScore);
    
    const bestSlot = candidateSlots[0];
    debugLog(`✅ Found cognitive-optimal slot: ${bestSlot.timeStr} (score: ${bestSlot.cognitiveScore.toFixed(2)})`);
    
    return {
      start: bestSlot.start,
      end: bestSlot.end,
      cognitiveScore: bestSlot.cognitiveScore
    };
  }

  /**
   * Calculate cognitive optimization score for a time slot
   */
  calculateCognitiveTimeSlotScore(hour, cognitiveLoad, preferredHours, sessionType) {
    let score = 0;
    
    // Base score for time of day
    if (this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hour)) {
      score += 3; // Peak cognitive hours
    } else if (this.COGNITIVE_CONSTANTS.LOW_COGNITIVE_HOURS.includes(hour)) {
      score -= 1; // Low cognitive hours
    } else {
      score += 1; // Neutral hours
    }
    
    // Preferred time bonus
    if (preferredHours.includes(hour)) {
      score += 2;
    }
    
    // Cognitive load matching
    if (cognitiveLoad > 0.8 && this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hour)) {
      score += 2; // High cognitive load during peak hours
    } else if (cognitiveLoad < 0.4 && this.COGNITIVE_CONSTANTS.LOW_COGNITIVE_HOURS.includes(hour)) {
      score += 1; // Low cognitive load during low hours is acceptable
    }
    
    // Session type bonuses
    if (sessionType === 'deep-work' && hour >= 9 && hour <= 11) {
      score += 2; // Deep work in morning peak
    } else if (sessionType === 'spaced-repetition-review' && hour >= 16 && hour <= 18) {
      score += 1; // Reviews in afternoon
    }
    
    // Avoid post-lunch dip for high cognitive load tasks
    if (hour === 13 && cognitiveLoad > 0.6) {
      score -= 2;
    }
    
    return Math.max(0, score);
  }

  /**
   * Create cognitive-optimized schedule item
   */
  createCognitiveScheduleItem(task, timeSlot, sessionDuration, date) {
    const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
    const breaks = task.breaks || this.calculateOptimalBreaks(task);
    const learningStrategy = task.learningStrategy || this.selectOptimalLearningStrategy(task);
    
    // Use actual duration from time slot if available, otherwise use calculated duration
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
      
      // Cognitive optimization metadata
      cognitiveLoad: cognitiveLoad,
      sessionType: task.sessionType || 'standard',
      completionStrategy: task.completionStrategy || 'cognitive-optimized',
      cognitiveScore: timeSlot.cognitiveScore,
      
      // Learning optimization
      learningStrategy: learningStrategy.primary,
      studyTechniques: learningStrategy.techniques,
      evidence: learningStrategy.evidence,
      
      // Break structure
      breakStructure: breaks,
      
      // Performance tracking
      urgency: this.calculateUrgency(task),
      difficulty: task.difficulty || 'Medium',
      sessionProgress: sessionDuration / 60,
      remainingAfterSession: Math.max(0, (task.allocatedTime || 1) - (sessionDuration / 60)),
      
      // Enhanced study notes with cognitive science
      notes: this.generateCognitiveStudyNotes(task),
      
      // Session metadata
      sessionNumber: task.sessionNumber || 1,
      learningPhase: task.learningPhase || 'acquisition',
      flowStateOptimized: task.flowStateOptimized || false,
      adaptiveScheduling: true
    };
  }

  /**
   * Generate enhanced study notes with cognitive science principles
   */
  generateCognitiveStudyNotes(task) {
    const taskType = task.type || 'homework';
    const sessionType = task.sessionType || 'standard';
    const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
    
    const baseNotes = this.generateStudyNotes(task);
    
    // Add cognitive-specific enhancements
    const cognitiveEnhancements = [];
    
    if (cognitiveLoad > 0.8) {
      cognitiveEnhancements.push("🧠 High cognitive load: Take breaks every 25 minutes");
      cognitiveEnhancements.push("💡 Use chunking to break complex information into smaller parts");
      cognitiveEnhancements.push("🔄 Apply dual coding: use both visual and verbal processing");
    }
    
    if (sessionType === 'deep-work') {
      cognitiveEnhancements.push("🌊 Enter flow state: Minimize distractions and interruptions");
      cognitiveEnhancements.push("⏰ Use time-boxing: Commit to working for the full session");
      cognitiveEnhancements.push("🎯 Single-tasking: Focus on one task completely");
    }
    
    if (sessionType === 'spaced-repetition-review') {
      cognitiveEnhancements.push("🔄 Active retrieval: Test yourself before reviewing notes");
      cognitiveEnhancements.push("🧩 Interleaving: Mix different types of problems");
      cognitiveEnhancements.push("💭 Elaborative rehearsal: Connect to existing knowledge");
    }
    
    if (taskType === 'test') {
      cognitiveEnhancements.push("📝 Testing effect: Practice retrieving information from memory");
      cognitiveEnhancements.push("⚡ Desirable difficulties: Study at appropriate challenge level");
      cognitiveEnhancements.push("🎯 Transfer practice: Apply knowledge to new situations");
    }
    
    return [...baseNotes, ...cognitiveEnhancements];
  }

  // Fallback allocation method when primary strategies fail
  fallbackTaskAllocation(task, allocation, remainingTime, allocatedTasks) {
    debugLog(`🔄 Attempting fallback allocation for ${task.name} (${remainingTime.toFixed(2)}h needed)`);
    
    const availableDays = Object.keys(allocation);
    let timeToAllocate = remainingTime;
    
    // Try to distribute the task across any available days with capacity
    for (const day of availableDays) {
      if (timeToAllocate <= 0) break;
      
      const dayTasks = allocation[day]?.tasks || allocation[day] || [];
      const currentDayTime = (Array.isArray(dayTasks) ? dayTasks : []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
      const availableTime = Math.max(0, this.userPreferences.maxStudyHoursPerDay - currentDayTime);
      
      if (availableTime > 0) {
        const sessionTime = Math.min(timeToAllocate, availableTime, 2); // Max 2 hours per session
        
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
    
    // If we allocated at least some time, mark task as processed
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

  // Helper methods for task allocation
  findBestDayForSmallTask(task, allocation, urgency) {
    const availableDays = Object.keys(allocation);
    
    // Calculate remaining time for this task
    const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
    const timeSpent = task.timeSpent || 0;
    const remainingTime = Math.max(0, timeRequired - timeSpent);
    
    debugLog(`🔍 Finding best day for small task ${task.name}: ${remainingTime.toFixed(2)}h needed`);
    
    // For urgent small tasks, prefer today/tomorrow
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
    
    // For regular small tasks, find the day with least load
    const result = availableDays.reduce((best, day) => {
      const dayTasks = allocation[day]?.tasks || allocation[day] || [];
      const totalTime = (Array.isArray(dayTasks) ? dayTasks : []).reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
      
      if (totalTime + remainingTime > this.userPreferences.maxStudyHoursPerDay) {
        debugLog(`   Skipping day ${day}: ${totalTime.toFixed(2)}h + ${remainingTime.toFixed(2)}h = ${(totalTime + remainingTime).toFixed(2)}h > ${this.userPreferences.maxStudyHoursPerDay}h max`);
        return best; // Skip days that would exceed capacity
      }
      
      if (!best) {
        debugLog(`   First viable day: ${day} (${totalTime.toFixed(2)}h used)`);
        return day;
      }
      
      const bestTotalTime = allocation[best].reduce((sum, t) => sum + (t.allocatedTime || 0), 0);
      const isBetter = totalTime < bestTotalTime;
      debugLog(`   Comparing ${day} (${totalTime.toFixed(2)}h) vs ${best} (${bestTotalTime.toFixed(2)}h): ${isBetter ? day : best} is better`);
      return isBetter ? day : best;
    }, null);
    
    debugLog(`🎯 Regular task best day result: ${result || 'none found'}`);
    return result;
  }

  findEarliestAvailableDay(allocation) {
    return Object.keys(allocation)[0]; // First available day
  }

  findBalancedStartDay(allocation, urgency) {
    const availableDays = Object.keys(allocation);
    
    // More urgent tasks start earlier
    if (urgency >= 0.5) {
      return availableDays[0] || availableDays[1]; // Today or tomorrow
    }
    
    // Less urgent tasks can start later for better balance
    return availableDays[1] || availableDays[2] || availableDays[0]; // Tomorrow, day after, or today
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

  // Get task IDs that already have valid schedule items
  getScheduledTaskIds(existingSchedule, tasks, preserveCurrentDay = false) {
    const scheduledTaskIds = new Set();
    const taskIds = new Set(tasks.map(t => t.id));
    
    // FIXED: Preserve current day schedule items when preserveCurrentDay is true
    // This prevents automatic re-scheduling when the page reloads
    const now = new Date();
    const todayDateString = format(now, 'yyyy-MM-dd');
    
    Object.values(existingSchedule).forEach(daySchedule => {
      if (Array.isArray(daySchedule)) {
        daySchedule.forEach(item => {
          // Only consider it scheduled if:
          // 1. Task still exists and isn't completed
          // 2. Schedule item itself isn't marked as completed
          if (item.taskId && taskIds.has(item.taskId) && !item.completed) {
            const task = tasks.find(t => t.id === item.taskId);
            if (task && !task.is_completed) {
              // Check if the schedule item is in the future OR if it's today and we want to preserve it
              const itemStartTime = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
              const itemDateString = item.date || format(itemStartTime, 'yyyy-MM-dd');
              
              let shouldPreserve = false;
              
              if (preserveCurrentDay && itemDateString === todayDateString) {
                // Preserve all items for today when preserveCurrentDay is true (page reload scenario)
                shouldPreserve = true;
                debugLog(`🔒 Preserving current day item: ${item.taskName} at ${itemStartTime.toLocaleTimeString()}`);
              } else if (!preserveCurrentDay && itemStartTime > now) {
                // Only preserve future items when preserveCurrentDay is false (manual regeneration)
                shouldPreserve = true;
              }
              
              if (shouldPreserve) {
                const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
                const timeSpent = task.timeSpent || 0;
                
                // Only preserve schedule if task still has remaining work
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

  // Merge existing schedule with new task allocations
  mergeScheduleWithExisting(existingSchedule, newAllocations) {
    return this.mergeScheduleWithCognitiveStrategy(existingSchedule, newAllocations);
  }

  // Enhanced task validation and sanitization
  validateAndSanitizeTasks(tasks) {
    if (!Array.isArray(tasks)) {
      console.error("❌ Tasks is not an array:", tasks);
      return [];
    }

    const validTasks = [];

    for (const task of tasks) {
      try {
        // Basic validation
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

        // Skip completed tasks
        if (task.is_completed === true) {
          debugLog(`✅ Skipping completed task: ${task.name}`);
          continue;
        }

        // Sanitize and validate required fields
        const sanitizedTask = {
          ...task,
          // Ensure required fields exist with defaults
          name: task.name.trim(),
          subject: task.subject || 'General',
          type: task.type || 'homework',
          difficulty: task.difficulty || 'Medium',
          timeRequired: this.sanitizeTimeRequired(task),
          timeSpent: this.sanitizeTimeSpent(task),
          deadline: this.sanitizeDeadline(task),
          estimated_time: task.estimated_time || 60, // minutes
          is_completed: task.is_completed === true
        };

        // Validate deadline
        if (!sanitizedTask.deadline || isNaN(sanitizedTask.deadline.getTime())) {
          console.warn("⚠️ Skipping task with invalid deadline:", task.name);
          continue;
        }

        // Check if task is past deadline and not completed
        const now = new Date();
        if (sanitizedTask.deadline < now && !sanitizedTask.is_completed) {
          console.warn("⚠️ Task is past deadline:", task.name, sanitizedTask.deadline);
          // Don't skip overdue tasks, let the system handle them
        }

        // Validate time requirements
        if (sanitizedTask.timeRequired <= 0) {
          console.warn("⚠️ Task has invalid time requirement:", task.name, sanitizedTask.timeRequired);
          sanitizedTask.timeRequired = 1; // Default to 1 hour minimum
        }

        if (sanitizedTask.timeSpent < 0) {
          console.warn("⚠️ Task has negative time spent:", task.name, sanitizedTask.timeSpent);
          sanitizedTask.timeSpent = 0;
        }

        // Skip if already completed (time spent >= time required)
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
    // Try multiple sources for time required
    if (typeof task.timeRequired === 'number' && task.timeRequired > 0) {
      return task.timeRequired;
    }
    
    if (typeof task.estimated_time === 'number' && task.estimated_time > 0) {
      return task.estimated_time / 60; // Convert minutes to hours
    }
    
    // Default based on task type
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
    // FIXED: Check both deadline and dueDate properties
    const taskDeadline = task.deadline || task.dueDate;
    if (!taskDeadline) {
      // Default to 1 week from now if no deadline
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);
      return defaultDeadline;
    }

    // Handle Firestore timestamps
    if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
      return taskDeadline.toDate();
    }

    // Handle regular dates
    const date = new Date(taskDeadline);
    if (isNaN(date.getTime())) {
      // Invalid date, default to 1 week from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);
      return defaultDeadline;
    }

    return date;
  }
}

export default IntelligentScheduler;