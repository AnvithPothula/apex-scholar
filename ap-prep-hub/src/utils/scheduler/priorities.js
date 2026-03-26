/**
 * Priority calculation, cognitive science weighting, and task analysis
 * for IntelligentScheduler.
 *
 * Each export is a method that will be mixed into the IntelligentScheduler
 * prototype, so `this` refers to the scheduler instance.
 */

import { differenceInDays, startOfDay, addDays } from 'date-fns';
import {
  getUserTimezone,
  formatDateTimeInUserTimezone
} from '../timezone';

// Gate debug logging behind development mode
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

// ---------------------------------------------------------------------------
// Peak / low cognitive hours
// ---------------------------------------------------------------------------

export function calculatePeakHours() {
  const baseHours = [9, 10, 11];

  if (this.userPreferences.preferMorningStudy) {
    return [8, 9, 10, 11];
  }

  if (this.userPreferences.studyIntensity === 'light') {
    return [9, 10];
  }

  if (this.userPreferences.studyIntensity === 'intense') {
    return [8, 9, 10, 11, 14, 15, 16];
  }

  return baseHours;
}

export function calculateLowCognitiveHours() {
  const baseLowHours = [13, 17, 18, 19];

  if (this.userPreferences.avoidPostLunchDip) {
    return [13, 14, 17, 18, 19, 20];
  }

  return baseLowHours;
}

export function calculateOptimalDurations() {
  const intensityMultiplier = {
    'light': 0.8,
    'moderate': 1.0,
    'intense': 1.2
  }[this.userPreferences.studyIntensity] || 1.0;

  const baseDurations = {
    project: { min: 90, max: 120, optimal: 90 },
    essay: { min: 60, max: 90, optimal: 75 },
    homework: { min: 25, max: 50, optimal: this.userPreferences.sessionLength || 50 },
    test: { min: 30, max: 60, optimal: 45 },
    reading: { min: 30, max: 60, optimal: 45 },
    lab: { min: 90, max: 180, optimal: 120 }
  };

  Object.keys(baseDurations).forEach(taskType => {
    const duration = baseDurations[taskType];
    duration.optimal = this.roundToStandardIncrement(Math.round(duration.optimal * intensityMultiplier));
    duration.min = this.roundToStandardIncrement(Math.round(duration.min * intensityMultiplier));
    duration.max = this.roundToStandardIncrement(Math.round(duration.max * intensityMultiplier));
  });

  return baseDurations;
}

// ---------------------------------------------------------------------------
// Cognitive science task analysis
// ---------------------------------------------------------------------------

export function analyzeTaskWithCognitiveScience(task) {
  const baseCognitiveLoad = this.calculateCognitiveLoad(task);
  const sessionStructure = this.determineOptimalSessionStructure(task);
  const retentionAnalysis = this.analyzeRetentionRequirements(task);
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

export function calculateCognitiveLoad(task) {
  const baseLoad = {
    'Easy': 0.3,
    'Medium': 0.6,
    'Hard': 0.9
  }[task.difficulty || 'Medium'];

  const typeMultiplier = {
    'homework': 1.0,
    'test': 1.3,
    'project': 1.5,
    'reading': 0.8,
    'lab': 1.2,
    'essay': 1.4
  }[task.type || 'homework'];

  const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
  const complexityFactor = Math.min(1.5, 1 + (timeRequired - 1) * 0.1);

  return baseLoad * typeMultiplier * complexityFactor;
}

export function determineOptimalSessionStructure(task) {
  const taskType = task.type || 'homework';
  const difficulty = task.difficulty || 'Medium';
  const sessionConfig = this.COGNITIVE_CONSTANTS.OPTIMAL_SESSION_DURATIONS[taskType] ||
                       this.COGNITIVE_CONSTANTS.OPTIMAL_SESSION_DURATIONS.homework;

  const difficultyKey = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  const modifier = this.COGNITIVE_CONSTANTS.DIFFICULTY_MODIFIERS[difficultyKey] ||
                   this.COGNITIVE_CONSTANTS.DIFFICULTY_MODIFIERS.Medium;
  const optimalDuration = Math.round(sessionConfig.optimal * modifier.sessionMultiplier);

  return {
    optimalDuration: this.roundToStandardIncrement(optimalDuration),
    minDuration: this.roundToStandardIncrement(Math.round(sessionConfig.min * modifier.sessionMultiplier)),
    maxDuration: this.roundToStandardIncrement(Math.round(sessionConfig.max * modifier.sessionMultiplier)),
    usePomodoro: optimalDuration <= 30,
    longFormWork: optimalDuration >= 90
  };
}

export function analyzeRetentionRequirements(task) {
  const taskType = task.type || 'homework';
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

export function calculateOptimalBreaks(task) {
  const cognitiveLoad = this.calculateCognitiveLoad(task);
  const sessionStructure = this.determineOptimalSessionStructure(task);

  if (sessionStructure.usePomodoro) {
    return {
      type: 'pomodoro',
      workDuration: 25,
      shortBreak: 5,
      longBreak: 30,
      longBreakAfter: 4
    };
  } else if (sessionStructure.longFormWork) {
    return {
      type: 'deep-work',
      workDuration: sessionStructure.optimalDuration,
      shortBreak: Math.round(sessionStructure.optimalDuration * 0.1),
      longBreak: Math.round(sessionStructure.optimalDuration * 0.3),
      longBreakAfter: 2
    };
  } else {
    return {
      type: 'standard',
      workDuration: sessionStructure.optimalDuration,
      shortBreak: Math.round(cognitiveLoad * 10 + 5),
      longBreak: 20,
      longBreakAfter: 3
    };
  }
}

export function determineOptimalTimeOfDay(task) {
  const taskType = task.type || 'homework';
  const difficulty = task.difficulty || 'Medium';
  const cognitiveLoad = this.calculateCognitiveLoad(task);

  if (cognitiveLoad > 0.8 || difficulty.toLowerCase() === 'hard') {
    return {
      preferred: [9, 10, 11],
      acceptable: [14, 15, 16],
      avoid: [13, 17, 18, 19, 20, 21]
    };
  } else if (taskType === 'reading' || taskType === 'homework') {
    return {
      preferred: [9, 10, 11, 14, 15, 16],
      acceptable: [8, 12, 17],
      avoid: [13, 18, 19, 20, 21]
    };
  } else {
    return {
      preferred: [8, 9, 10, 11, 14, 15, 16, 17],
      acceptable: [12, 18],
      avoid: [13, 19, 20, 21]
    };
  }
}

export function assessCognitiveFactors(task) {
  const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
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
    estimatedSessions: Math.ceil(timeRequired / 1.5),
    needsSpacedRepetition: task.type === 'test' || task.type === 'exam',
    needsDeepWork: task.type === 'project' || task.type === 'essay',
    allowsDistractedWork: task.type === 'reading'
  };
}

export function selectOptimalLearningStrategy(task) {
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

// ---------------------------------------------------------------------------
// Priority & urgency calculations
// ---------------------------------------------------------------------------

export function calculateScientificPriority(task) {
  const urgency = this.calculateUrgency(task);
  const cognitiveLoad = task.analysis?.cognitiveLoad || this.calculateCognitiveLoad(task);
  const retentionPriority = task.analysis?.retentionAnalysis?.priority || 'medium';

  const urgencyWeight = 0.4;
  const cognitiveWeight = 0.3;
  const retentionWeight = 0.2;
  const completionWeight = 0.1;

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

export function calculateSpacedRepetitionSchedule(task) {
  const retentionAnalysis = this.analyzeRetentionRequirements(task);
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
        estimatedDuration: Math.max(0.25, Math.round((task.timeRequired || 1) * 0.3 * 10) / 10),
        priority: retentionAnalysis.priority
      });
    }
  });

  return schedule;
}

export function createOptimalSessionPlan(task) {
  const sessionStructure = this.determineOptimalSessionStructure(task);
  const timeRequired = task.timeRequired || (task.estimated_time ? task.estimated_time / 60 : 1);
  const timeSpent = task.timeSpent || 0;
  const remainingTime = Math.max(0, timeRequired - timeSpent);

  const sessions = [];
  let remainingMinutes = remainingTime * 60;
  let sessionNumber = 1;

  while (remainingMinutes > 15) {
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

    if (sessionNumber > 10) break;
  }

  return {
    totalSessions: sessions.length,
    sessions: sessions,
    estimatedCompletionDays: Math.ceil(sessions.length / 2),
    recommendedSessionsPerDay: sessions.length > 4 ? 2 : 1
  };
}

export function calculateUrgency(task) {
  const taskDeadline = task.deadline || task.dueDate;
  if (!taskDeadline) return 0.1;

  const now = new Date();
  let deadline;
  if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
    deadline = taskDeadline.toDate();
  } else {
    deadline = new Date(taskDeadline);
  }

  if (isNaN(deadline.getTime())) {
    console.warn(`⚠️ Invalid deadline for task "${task.name}":`, taskDeadline);
    return 0.1;
  }

  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

  debugLog(`⏰ Task "${task.name}": Current time in ${getUserTimezone()}: ${formatDateTimeInUserTimezone(now)}, Deadline: ${formatDateTimeInUserTimezone(deadline)}, Hours until deadline: ${hoursUntilDeadline.toFixed(2)}`);

  if (hoursUntilDeadline < 0) return 1.0;
  if (hoursUntilDeadline <= 6) return 0.95;
  if (hoursUntilDeadline <= 24) return 0.8;
  if (hoursUntilDeadline <= 48) return 0.6;
  if (hoursUntilDeadline <= 168) return 0.4;
  return 0.2;
}

// ---------------------------------------------------------------------------
// Task analysis helpers
// ---------------------------------------------------------------------------

export function analyzeTask(task) {
  const taskType = task.type || 'homework';
  const difficulty = task.difficulty || 'Medium';

  const difficultyMap = {
    Easy: 0.3,
    Medium: 0.6,
    Hard: 0.9
  };

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

export function generateStudyNotes(task) {
  const taskType = task.type || 'homework';
  const difficulty = task.difficulty || 'Medium';

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

export function generateCognitiveStudyNotes(task) {
  const taskType = task.type || 'homework';
  const sessionType = task.sessionType || 'standard';
  const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);

  const baseNotes = this.generateStudyNotes(task);

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

// ---------------------------------------------------------------------------
// Cognitive scoring helpers
// ---------------------------------------------------------------------------

export function getSessionTypePriority(sessionType) {
  const priorities = {
    'deep-work': 0.9,
    'peak-cognitive': 0.8,
    'initial-learning': 0.7,
    'spaced-repetition-initial': 0.6,
    'pomodoro': 0.5,
    'standard': 0.4,
    'spaced-repetition-review': 0.3,
    'optimal-distribution': 0.2,
    'fallback-session': 0.1
  };

  return priorities[sessionType] || 0.4;
}

export function calculateCognitiveTimeSlotScore(hour, cognitiveLoad, preferredHours, sessionType) {
  let score = 0;

  if (this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hour)) {
    score += 3;
  } else if (this.COGNITIVE_CONSTANTS.LOW_COGNITIVE_HOURS.includes(hour)) {
    score -= 1;
  } else {
    score += 1;
  }

  if (preferredHours.includes(hour)) {
    score += 2;
  }

  if (cognitiveLoad > 0.8 && this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(hour)) {
    score += 2;
  } else if (cognitiveLoad < 0.4 && this.COGNITIVE_CONSTANTS.LOW_COGNITIVE_HOURS.includes(hour)) {
    score += 1;
  }

  if (sessionType === 'deep-work' && hour >= 9 && hour <= 11) {
    score += 2;
  } else if (sessionType === 'spaced-repetition-review' && hour >= 16 && hour <= 18) {
    score += 1;
  }

  if (hour === 13 && cognitiveLoad > 0.6) {
    score -= 2;
  }

  return Math.max(0, score);
}

export function calculateDailyCognitiveCapacity(date) {
  const dayOfWeek = date.getDay();
  const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

  let baseCapacity = this.userPreferences.maxStudyHoursPerDay;

  if (isWeekendDay && this.userPreferences.weekendStudy) {
    baseCapacity *= 0.8;
  }

  const peakHours = this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.length;
  const totalAvailableHours = 14;
  const peakCapacityRatio = 1.2;
  const regularCapacityRatio = 0.9;

  const peakCapacity = (peakHours * peakCapacityRatio);
  const regularCapacity = ((totalAvailableHours - peakHours) * regularCapacityRatio);

  return Math.min(baseCapacity, (peakCapacity + regularCapacity) * 0.8);
}

export function sortTasksByCognitiveFactors(tasks, date) {
  return [...tasks].sort((a, b) => {
    const loadA = a.cognitiveLoad || this.calculateCognitiveLoad(a);
    const loadB = b.cognitiveLoad || this.calculateCognitiveLoad(b);

    const prefA = a.preferredTimeSlots || [];
    const prefB = b.preferredTimeSlots || [];
    const peakPreferenceA = prefA.some(h => this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(h));
    const peakPreferenceB = prefB.some(h => this.COGNITIVE_CONSTANTS.PEAK_COGNITIVE_HOURS.includes(h));

    const sessionPriorityA = this.getSessionTypePriority(a.sessionType);
    const sessionPriorityB = this.getSessionTypePriority(b.sessionType);

    const urgencyA = this.calculateUrgency(a);
    const urgencyB = this.calculateUrgency(b);

    const scoreA = (loadA * 0.3) + (peakPreferenceA ? 0.25 : 0) + (sessionPriorityA * 0.2) + (urgencyA * 0.25);
    const scoreB = (loadB * 0.3) + (peakPreferenceB ? 0.25 : 0) + (sessionPriorityB * 0.2) + (urgencyB * 0.25);

    return scoreB - scoreA;
  });
}

export function calculateCognitiveSessionDuration(task, remainingCapacity) {
  const allocatedTime = task.allocatedTime || 1;
  const allocatedMinutes = allocatedTime * 60;
  const cognitiveLoad = task.cognitiveLoad || this.calculateCognitiveLoad(task);
  const sessionType = task.sessionType;

  let baseDuration = allocatedMinutes;

  const capacityFactor = Math.min(1.0, remainingCapacity / 2);
  let adjustedDuration = baseDuration * capacityFactor;

  switch (sessionType) {
    case 'deep-work':
      adjustedDuration = Math.max(60, Math.min(120, adjustedDuration));
      break;
    case 'pomodoro':
      adjustedDuration = 25;
      break;
    case 'peak-cognitive':
      adjustedDuration = Math.max(45, Math.min(90, adjustedDuration));
      break;
    case 'spaced-repetition-review':
      adjustedDuration = Math.max(15, Math.min(30, adjustedDuration));
      break;
    default:
      adjustedDuration = Math.max(20, Math.min(60, adjustedDuration));
  }

  if (cognitiveLoad > 0.8) {
    adjustedDuration = Math.min(adjustedDuration, 45);
  }

  const roundedDuration = this.roundToStandardIncrement(adjustedDuration);

  return roundedDuration;
}

export function roundToStandardIncrement(duration) {
  if (duration <= 30) {
    return Math.round(duration / 5) * 5;
  } else if (duration <= 60) {
    return Math.round(duration / 10) * 10;
  } else {
    return Math.round(duration / 15) * 15;
  }
}
