// AP Exam Dates and Review Schedules
// Updated annually based on College Board's official exam schedule
// All times are listed in local time - system will default to Central Time if user timezone cannot be detected

import { getTimezoneDisplayString } from '../utils/timezone';

// Note: AP exams are administered at the same local time in each timezone
// Morning exams: 8:00 AM local time
// Afternoon exams: 12:00 PM (noon) local time
// All dates and times will be converted to user's timezone (defaulting to Central Time)

// Mapping from curriculum subject keys to AP exam date keys
export const SUBJECT_KEY_TO_EXAM_NAME = {
  "artHistory": "AP Art History",
  "biology": "AP Biology", 
  "calculusAB": "AP Calculus AB",
  "calculusBC": "AP Calculus BC",
  "chemistry": "AP Chemistry",
  "chineseLanguage": "AP Chinese Language and Culture",
  "computerScienceA": "AP Computer Science A",
  "computerSciencePrinciples": "AP Computer Science Principles",
  "englishLanguageAndComposition": "AP English Language and Composition",
  "englishLiteratureAndComposition": "AP English Literature and Composition",
  "environmentalScience": "AP Environmental Science",
  "europeanHistory": "AP European History",
  "frenchLanguage": "AP French Language and Culture",
  "germanLanguage": "AP German Language and Culture",
  "comparativeGovernment": "AP Government and Politics: Comparative",
  "usGovernmentPolitics": "AP U.S. Government and Politics",
  "humanGeography": "AP Human Geography",
  "italianLanguage": "AP Italian Language and Culture",
  "japaneseLanguage": "AP Japanese Language and Culture",
  "latin": "AP Latin",
  "macroeconomics": "AP Macroeconomics",
  "microeconomics": "AP Microeconomics",
  "musicTheory": "AP Music Theory",
  "physics1": "AP Physics 1: Algebra-Based",
  "physics2": "AP Physics 2: Algebra-Based",
  "physicsC_Mechanics": "AP Physics C: Mechanics",
  "physicsC_ElectricityAndMagnetism": "AP Physics C: Electricity and Magnetism",
  "precalculus": "AP Precalculus",
  "psychology": "AP Psychology",
  "research": "AP Research",
  "seminar": "AP Seminar",
  "spanishLanguage": "AP Spanish Language and Culture",
  "spanishLiterature": "AP Spanish Literature and Culture",
  "statistics": "AP Statistics",
  "studioArt2D": "AP Studio Art: 2-D Design",
  "studioArt3D": "AP Studio Art: 3-D Design",
  "studioArtDrawing": "AP Studio Art: Drawing",
  "usHistory": "AP U.S. History",
  "worldHistory": "AP World History: Modern"
};

// 2025 AP Exam Dates (Based on College Board schedule)
// AP Exam Dates for 2025
// All times are in local time (8:00 AM and 12:00 PM in each timezone)
// System defaults to Central Time if user timezone cannot be detected
export const AP_EXAM_DATES_2025 = {
  // Week 1: May 5-9, 2025
  "AP Art History": { date: "2025-05-06", time: "8:00 AM" },
  "AP Biology": { date: "2025-05-05", time: "8:00 AM" },
  "AP Computer Science A": { date: "2025-05-08", time: "8:00 AM" },
  "AP English Literature and Composition": { date: "2025-05-07", time: "8:00 AM" },
  "AP Environmental Science": { date: "2025-05-05", time: "8:00 AM" },
  "AP Physics 1: Algebra-Based": { date: "2025-05-06", time: "12:00 PM" },
  "AP Psychology": { date: "2025-05-05", time: "12:00 PM" },
  "AP Spanish Language and Culture": { date: "2025-05-07", time: "12:00 PM" },
  "AP U.S. History": { date: "2025-05-08", time: "12:00 PM" },
  "AP World History: Modern": { date: "2025-05-09", time: "12:00 PM" },

  // Week 2: May 12-16, 2025
  "AP Calculus AB": { date: "2025-05-13", time: "8:00 AM" },
  "AP Calculus BC": { date: "2025-05-13", time: "8:00 AM" },
  "AP Chemistry": { date: "2025-05-12", time: "8:00 AM" },
  "AP Chinese Language and Culture": { date: "2025-05-14", time: "8:00 AM" },
  "AP Computer Science Principles": { date: "2025-05-15", time: "8:00 AM" },
  "AP English Language and Composition": { date: "2025-05-14", time: "12:00 PM" },
  "AP European History": { date: "2025-05-15", time: "12:00 PM" },
  "AP Human Geography": { date: "2025-05-13", time: "12:00 PM" },
  "AP Macroeconomics": { date: "2025-05-16", time: "8:00 AM" },
  "AP Physics 2: Algebra-Based": { date: "2025-05-12", time: "12:00 PM" },
  "AP Physics C: Mechanics": { date: "2025-05-14", time: "8:00 AM" },
  "AP Physics C: Electricity and Magnetism": { date: "2025-05-14", time: "12:00 PM" },
  "AP Precalculus": { date: "2025-05-16", time: "12:00 PM" },
  "AP Statistics": { date: "2025-05-16", time: "12:00 PM" },
  "AP U.S. Government and Politics": { date: "2025-05-12", time: "12:00 PM" },

  // Additional subjects (Late testing periods)
  "AP French Language and Culture": { date: "2025-05-20", time: "8:00 AM" },
  "AP German Language and Culture": { date: "2025-05-21", time: "8:00 AM" },
  "AP Italian Language and Culture": { date: "2025-05-22", time: "8:00 AM" },
  "AP Japanese Language and Culture": { date: "2025-05-23", time: "8:00 AM" },
  "AP Latin": { date: "2025-05-20", time: "12:00 PM" },
  "AP Microeconomics": { date: "2025-05-21", time: "12:00 PM" },
  "AP Music Theory": { date: "2025-05-22", time: "12:00 PM" },
  "AP Spanish Literature and Culture": { date: "2025-05-23", time: "12:00 PM" },
  "AP Government and Politics: Comparative": { date: "2025-05-20", time: "8:00 AM" },

  // Portfolio Submission Deadlines (Studio Art subjects)
  "AP Studio Art: 2-D Design": { date: "2025-05-08", time: "8:00 PM", type: "portfolio" },
  "AP Studio Art: 3-D Design": { date: "2025-05-08", time: "8:00 PM", type: "portfolio" },
  "AP Studio Art: Drawing": { date: "2025-05-08", time: "8:00 PM", type: "portfolio" },

  // Capstone Programs
  "AP Research": { date: "2025-04-30", time: "8:00 PM", type: "presentation" },
  "AP Seminar": { date: "2025-04-30", time: "8:00 PM", type: "presentation" }
};

// Get current year's exam dates (auto-updates based on current year)
export const getCurrentYearExamDates = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // If we're past May (month 4), use next year's dates
  const targetYear = today.getMonth() >= 5 ? currentYear + 1 : currentYear;
  
  console.log('📅 getCurrentYearExamDates:', {
    today: today.toISOString().split('T')[0],
    currentYear,
    targetYear,
    currentMonth: today.getMonth()
  });
  
  // Calculate the first Monday in May for the target year
  const firstOfMay = new Date(targetYear, 4, 1); // May 1st
  const dayOfWeek = firstOfMay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Find the first Monday of May
  let firstMonday = new Date(targetYear, 4, 1);
  if (dayOfWeek === 0) { // Sunday
    firstMonday.setDate(1 + 1); // Next day (Monday)
  } else if (dayOfWeek === 1) { // Already Monday
    firstMonday.setDate(1);
  } else { // Tuesday through Saturday
    firstMonday.setDate(1 + (8 - dayOfWeek)); // Days until next Monday
  }
  
  // Dynamic exam schedule based on AP College Board pattern
  // Week 1: First full week of May
  const week1Monday = new Date(firstMonday);
  const week1Tuesday = new Date(firstMonday); week1Tuesday.setDate(week1Monday.getDate() + 1);
  const week1Wednesday = new Date(firstMonday); week1Wednesday.setDate(week1Monday.getDate() + 2);
  const week1Thursday = new Date(firstMonday); week1Thursday.setDate(week1Monday.getDate() + 3);
  const week1Friday = new Date(firstMonday); week1Friday.setDate(week1Monday.getDate() + 4);
  
  // Week 2: Second week of May
  const week2Monday = new Date(firstMonday); week2Monday.setDate(week1Monday.getDate() + 7);
  const week2Tuesday = new Date(firstMonday); week2Tuesday.setDate(week1Monday.getDate() + 8);
  const week2Wednesday = new Date(firstMonday); week2Wednesday.setDate(week1Monday.getDate() + 9);
  const week2Thursday = new Date(firstMonday); week2Thursday.setDate(week1Monday.getDate() + 10);
  const week2Friday = new Date(firstMonday); week2Friday.setDate(week1Monday.getDate() + 11);
  
  // Format date helper
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Dynamic exam schedule following AP College Board pattern
  const examDates = {
    // Week 1 - Morning Exams (8:00 AM)
    "AP Computer Science A": { date: formatDate(week1Thursday), time: "8:00 AM" },
    "AP English Literature and Composition": { date: formatDate(week1Wednesday), time: "8:00 AM" },
    "AP Environmental Science": { date: formatDate(week1Monday), time: "8:00 AM" },
    "AP Physics 1: Algebra-Based": { date: formatDate(week1Tuesday), time: "8:00 AM" },
    "AP Spanish Language and Culture": { date: formatDate(week1Wednesday), time: "8:00 AM" },
    "AP World History: Modern": { date: formatDate(week1Friday), time: "8:00 AM" },
    
    // Week 1 - Afternoon Exams (12:00 PM)
    "AP Psychology": { date: formatDate(week1Monday), time: "12:00 PM" },
    "AP U.S. History": { date: formatDate(week1Thursday), time: "12:00 PM" },
    
    // Week 2 - Morning Exams (8:00 AM)
    "AP Calculus AB": { date: formatDate(week2Tuesday), time: "8:00 AM" },
    "AP Calculus BC": { date: formatDate(week2Tuesday), time: "8:00 AM" },
    "AP Chemistry": { date: formatDate(week2Monday), time: "8:00 AM" },
    "AP Chinese Language and Culture": { date: formatDate(week2Wednesday), time: "8:00 AM" },
    "AP Computer Science Principles": { date: formatDate(week2Thursday), time: "8:00 AM" },
    "AP Macroeconomics": { date: formatDate(week2Friday), time: "8:00 AM" },
    "AP Physics C: Mechanics": { date: formatDate(week2Wednesday), time: "8:00 AM" },
    "AP Statistics": { date: formatDate(week2Thursday), time: "8:00 AM" },
    
    // Week 2 - Afternoon Exams (12:00 PM)
    "AP English Language and Composition": { date: formatDate(week2Wednesday), time: "12:00 PM" },
    "AP European History": { date: formatDate(week2Thursday), time: "12:00 PM" },
    "AP Human Geography": { date: formatDate(week2Tuesday), time: "12:00 PM" },
    "AP Physics 2: Algebra-Based": { date: formatDate(week2Monday), time: "12:00 PM" },
    "AP Physics C: Electricity and Magnetism": { date: formatDate(week2Thursday), time: "12:00 PM" },
    
    // Additional subjects (distributed across both weeks)
    "AP Biology": { date: formatDate(week1Tuesday), time: "8:00 AM" },
    "AP Art History": { date: formatDate(week1Friday), time: "12:00 PM" },
    "AP French Language and Culture": { date: formatDate(week2Friday), time: "12:00 PM" },
    "AP German Language and Culture": { date: formatDate(week2Friday), time: "12:00 PM" },
    "AP Italian Language and Culture": { date: formatDate(week2Friday), time: "12:00 PM" },
    "AP Japanese Language and Culture": { date: formatDate(week2Friday), time: "12:00 PM" },
    "AP Latin": { date: formatDate(week1Friday), time: "12:00 PM" },
    "AP Microeconomics": { date: formatDate(week2Friday), time: "12:00 PM" },
    "AP Music Theory": { date: formatDate(week1Thursday), time: "12:00 PM" },
    "AP Precalculus": { date: formatDate(week2Tuesday), time: "12:00 PM" },
    "AP Spanish Literature and Culture": { date: formatDate(week1Wednesday), time: "12:00 PM" },
    "AP U.S. Government and Politics": { date: formatDate(week1Monday), time: "12:00 PM" },
    "AP Comparative Government and Politics": { date: formatDate(week1Tuesday), time: "12:00 PM" },
    "AP African American Studies": { date: formatDate(week1Wednesday), time: "12:00 PM" }
  };
  
  return examDates;
};

// Review schedule recommendations (when to start reviewing each unit)
export const getReviewSchedule = async (subject, examDate) => {
  const exam = new Date(examDate);
  const reviewSchedule = [];
  
  try {
    // Dynamic import to avoid circular dependency
    const { getCurriculumData } = await import('./comprehensiveCurriculum.js');
    const curriculum = getCurriculumData(subject);
    const units = curriculum?.units || [];
    
    if (units.length === 0) {
      // Default schedule for subjects without unit data
      const defaultUnits = ['Unit 1-2', 'Unit 3-4', 'Unit 5-6', 'Final Review'];
      defaultUnits.forEach((unitName, index) => {
        const weeksBeforeExam = (defaultUnits.length - index) * 3;
        const reviewDate = new Date(exam);
        reviewDate.setDate(exam.getDate() - (weeksBeforeExam * 7));
        
        reviewSchedule.push({
          unit: unitName,
          startDate: reviewDate.toISOString().split('T')[0],
          description: `Begin comprehensive review of ${unitName}`
        });
      });
    } else {
      // Create schedule based on actual curriculum units
      units.forEach((unit, index) => {
        // Start reviewing in reverse order (last unit first for review)
        const reviewIndex = units.length - 1 - index;
        const weeksBeforeExam = (reviewIndex + 1) * 2; // 2 weeks per unit review
        const reviewDate = new Date(exam);
        reviewDate.setDate(exam.getDate() - (weeksBeforeExam * 7));
        
        reviewSchedule.push({
          unit: unit.name,
          startDate: reviewDate.toISOString().split('T')[0],
          description: `Begin reviewing ${unit.name}`,
          topics: unit.topics?.slice(0, 3) || [] // First 3 topics as preview
        });
      });
      
      // Add final comprehensive review
      const finalReviewDate = new Date(exam);
      finalReviewDate.setDate(exam.getDate() - 14); // 2 weeks before exam
      
      reviewSchedule.push({
        unit: 'Final Review',
        startDate: finalReviewDate.toISOString().split('T')[0],
        description: 'Final comprehensive review and practice tests',
        topics: ['Practice tests', 'Review difficult concepts', 'Time management']
      });
    }
  } catch (error) {
    console.error('Error generating review schedule:', error);
    // Fallback schedule
    const defaultUnits = ['Units 1-3', 'Units 4-6', 'Final Review'];
    defaultUnits.forEach((unitName, index) => {
      const weeksBeforeExam = (defaultUnits.length - index) * 3;
      const reviewDate = new Date(exam);
      reviewDate.setDate(exam.getDate() - (weeksBeforeExam * 7));
      
      reviewSchedule.push({
        unit: unitName,
        startDate: reviewDate.toISOString().split('T')[0],
        description: `Begin comprehensive review of ${unitName}`
      });
    });
  }
  
  return reviewSchedule;
};

// Utility function to get exam info for a subject
export const getExamInfo = async (subject) => {
  const currentExamDates = getCurrentYearExamDates();
  const examInfo = currentExamDates[subject];
  
  if (!examInfo) {
    console.warn(`No exam date found for subject: ${subject}`);
    return null;
  }
  
  const examDate = new Date(examInfo.date);
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  
  const reviewSchedule = await getReviewSchedule(subject, examInfo.date);
  
  return {
    ...examInfo,
    examDate,
    daysUntilExam,
    reviewSchedule
  };
};

// Get all subjects with upcoming exams (next 365 days)
export const getUpcomingExams = async (userSubjects = []) => {
  const currentExamDates = getCurrentYearExamDates();
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  // Convert user subject keys to exam names and filter
  const userExamNames = userSubjects.map(subjectKey => SUBJECT_KEY_TO_EXAM_NAME[subjectKey]).filter(Boolean);
  
  // Only show exams if user has subjects selected AND we can map them to exam names
  if (userSubjects.length === 0 || userExamNames.length === 0) {
    return [];
  }
  
  const examPromises = Object.entries(currentExamDates)
    .filter(([examName]) => userExamNames.includes(examName))
    .map(async ([subject, examInfo]) => {
      const fullExamInfo = await getExamInfo(subject);
      return fullExamInfo ? { subject, ...fullExamInfo } : null;
    });
  
  const exams = await Promise.all(examPromises);
  
  return exams
    .filter(exam => exam && exam.examDate >= today && exam.examDate <= oneYearFromNow)
    .sort((a, b) => a.examDate - b.examDate);
};

// Synchronous version for immediate use (with simplified review schedule)
export const getUpcomingExamsSync = (userSubjects = []) => {
  const currentExamDates = getCurrentYearExamDates();
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  // Convert user subject keys to exam names and filter
  const userExamNames = userSubjects.map(subjectKey => SUBJECT_KEY_TO_EXAM_NAME[subjectKey]).filter(Boolean);
  
  console.log('🔍 Debug exam mapping:', {
    userSubjects,
    userExamNames,
    availableExams: Object.keys(currentExamDates)
  });
  
  // Only show exams if user has subjects selected AND we can map them to exam names
  if (userSubjects.length === 0 || userExamNames.length === 0) {
    console.log('❌ No subjects selected or no mappings found');
    return [];
  }
  
  return Object.entries(currentExamDates)
    .filter(([examName]) => userExamNames.includes(examName))
    .map(([examName, examInfo]) => {
      const examDate = new Date(examInfo.date);
      const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      
      // Simple review schedule without async curriculum lookup
      const reviewSchedule = [
        {
          unit: 'Unit Review 1',
          startDate: new Date(examDate.getTime() - (6 * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          description: 'Begin reviewing early units'
        },
        {
          unit: 'Unit Review 2', 
          startDate: new Date(examDate.getTime() - (4 * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          description: 'Review middle units'
        },
        {
          unit: 'Final Review',
          startDate: new Date(examDate.getTime() - (2 * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          description: 'Final comprehensive review and practice tests'
        }
      ];
      
      return {
        subject: examName,
        ...examInfo,
        examDate,
        daysUntilExam,
        reviewSchedule
      };
    })
    .filter(exam => exam.examDate >= today && exam.examDate <= oneYearFromNow)
    .sort((a, b) => a.examDate - b.examDate);
};

/**
 * Get exam information with timezone-aware formatting
 * @param {string} examName - Name of the AP exam
 * @returns {Object} Exam info with timezone-aware time display
 */
export const getExamWithTimezone = (examName) => {
  const examInfo = AP_EXAM_DATES_2025[examName];
  if (!examInfo) return null;
  
  const timezoneDisplay = getTimezoneDisplayString();
  
  return {
    ...examInfo,
    timeWithTimezone: `${examInfo.time} ${timezoneDisplay}`,
    timezone: timezoneDisplay
  };
};

/**
 * Get all exams with timezone-aware formatting
 * @returns {Object} All exam dates with timezone information
 */
export const getAllExamsWithTimezone = () => {
  const timezoneDisplay = getTimezoneDisplayString();
  const examsWithTimezone = {};
  
  Object.entries(AP_EXAM_DATES_2025).forEach(([examName, examInfo]) => {
    examsWithTimezone[examName] = {
      ...examInfo,
      timeWithTimezone: `${examInfo.time} ${timezoneDisplay}`,
      timezone: timezoneDisplay
    };
  });
  
  return examsWithTimezone;
};

export default AP_EXAM_DATES_2025;
