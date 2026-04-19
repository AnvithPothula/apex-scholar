// Comprehensive AP Course and Exam Curriculum Data
// Now modularized into per-subject files with lazy loading.
// This file re-exports everything from the new modular structure for backwards compatibility.

export {
  getCurriculumData,
  getCurriculumDataSync,
  getSubjectName,
  getAvailableSubjects,
  getSubjectUnits,
  getSubjectTopics,
  generateCurriculumContext
} from './curriculum/index';
