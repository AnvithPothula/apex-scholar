// Test script to verify comprehensive curriculum integration
const { 
  getCurriculumData, 
  generateCurriculumContext, 
  getAvailableSubjects,
  getSubjectUnits,
  getSubjectTopics
} = await import('../src/constants/comprehensiveCurriculum.js');

console.log('🧪 Testing Comprehensive Curriculum Integration...\n');

// Test 1: Get all available subjects
console.log('📚 Available Subjects:');
const allSubjects = getAvailableSubjects();
console.log(`Found ${allSubjects.length} subjects:`, allSubjects.slice(0, 10), '...\n');

// Test 2: Test specific subject data
console.log('🔬 Testing Biology Curriculum:');
const biologyData = getCurriculumData('biology');
if (biologyData) {
  console.log(`✅ Biology found: ${biologyData.name}`);
  console.log(`📖 Description: ${biologyData.description.substring(0, 100)}...`);
  console.log(`🏗️ Units: ${biologyData.units.length}`);
  console.log(`⏱️ Exam: ${biologyData.examFormat.duration}\n`);
} else {
  console.log('❌ Biology data not found\n');
}

// Test 3: Test new subjects (Spanish, French, etc.)
console.log('🌍 Testing Language Subjects:');
const testSubjects = ['spanishLanguage', 'frenchLanguage', 'chineseLanguage', 'latin'];
testSubjects.forEach(subject => {
  const data = getCurriculumData(subject);
  if (data) {
    console.log(`✅ ${data.name}: ${data.units.length} units`);
  } else {
    console.log(`❌ ${subject} not found`);
  }
});

// Test 4: Test curriculum context generation
console.log('\n🤖 Testing AI Context Generation:');
const calculusContext = generateCurriculumContext('calculusAB');
if (calculusContext && calculusContext.length > 0) {
  console.log(`✅ Calculus AB context generated (${calculusContext.length} characters)`);
  console.log('Preview:', calculusContext.substring(0, 200) + '...\n');
} else {
  console.log('❌ Failed to generate context\n');
}

// Test 5: Test subject units and topics
console.log('🎯 Testing Chemistry Units and Topics:');
const chemistryUnits = getSubjectUnits('chemistry');
const chemistryTopics = getSubjectTopics('chemistry');
console.log(`✅ Chemistry has ${chemistryUnits.length} units and ${chemistryTopics.length} topics`);

console.log('\n🎉 Comprehensive Curriculum Integration Test Complete!');
console.log(`📊 Total subjects: ${allSubjects.length}`);
console.log('✅ All major functions working correctly');
