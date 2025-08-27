// Test to verify all subjects are being displayed
import { getAvailableSubjects, getCurriculumData } from '../src/constants/comprehensiveCurriculum.js';

console.log('=== SUBJECT DISPLAY TEST ===\n');

const comprehensiveSubjects = getAvailableSubjects();
console.log(`Total subjects in comprehensive curriculum: ${comprehensiveSubjects.length}`);
console.log('Subjects:', comprehensiveSubjects.sort().join(', '));

console.log('\n=== TESTING SUBJECT DATA AVAILABILITY ===');
let validSubjects = 0;
let invalidSubjects = 0;

comprehensiveSubjects.forEach(subjectKey => {
  const curriculumData = getCurriculumData(subjectKey);
  if (curriculumData && curriculumData.name) {
    validSubjects++;
    console.log(`✅ ${subjectKey}: ${curriculumData.name}`);
  } else {
    invalidSubjects++;
    console.log(`❌ ${subjectKey}: No curriculum data found`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Valid subjects with data: ${validSubjects}`);
console.log(`Invalid subjects: ${invalidSubjects}`);
console.log(`Total: ${validSubjects + invalidSubjects}`);

if (invalidSubjects === 0) {
  console.log('\n🎉 SUCCESS: All subjects should now display in the app!');
} else {
  console.log('\n⚠️ WARNING: Some subjects may not display properly');
}
