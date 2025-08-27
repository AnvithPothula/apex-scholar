// Test script to verify new curriculum data  
import { getCurriculumData, getAvailableSubjects } from '../src/constants/comprehensiveCurriculum.js';

console.log('=== TESTING NEW CURRICULUM DATA ===\n');

// Test newly added subjects
const newSubjects = [
  'comparativeGovernment',
  'spanishLiterature', 
  'studioArt2D',
  'studioArt3D',
  'studioArtDrawing'
];

console.log(`Total available subjects: ${getAvailableSubjects().length}`);
console.log(`Available subjects: ${getAvailableSubjects().sort().join(', ')}\n`);

console.log('Testing newly added curriculum data:\n');

newSubjects.forEach(subject => {
  const curriculum = getCurriculumData(subject);
  if (curriculum) {
    console.log(`✅ ${subject}: ${curriculum.name}`);
    console.log(`   Description: ${curriculum.description.substring(0, 100)}...`);
    console.log(`   Units: ${curriculum.units.length}`);
    console.log(`   Exam Format: ${curriculum.examFormat.duration}\n`);
  } else {
    console.log(`❌ ${subject}: NOT FOUND\n`);
  }
});

// Test that physics1 and physics2 still work (they already existed)
console.log('Testing existing physics subjects:');
['physics1', 'physics2'].forEach(subject => {
  const curriculum = getCurriculumData(subject);
  if (curriculum) {
    console.log(`✅ ${subject}: ${curriculum.name}`);
  } else {
    console.log(`❌ ${subject}: NOT FOUND`);
  }
});

console.log('\n=== TEST COMPLETE ===');
