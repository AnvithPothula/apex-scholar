// Simple test to verify question types and sections work
const TEST_CONFIGURATIONS = {
  'AP English Literature': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 55, description: 'Reading comprehension and literary analysis' },
      { 
        id: 'frq', 
        name: 'Free Response Questions', 
        time: 120, 
        questions: 3, 
        description: 'Choose specific essay types or take all essays',
        subSections: [
          { id: 'poetry-only', name: 'Poetry Analysis Only', time: 40, questions: 1, description: 'Poetry analysis essay' },
          { id: 'prose-only', name: 'Prose Analysis Only', time: 40, questions: 1, description: 'Prose passage analysis essay' },
          { id: 'open-only', name: 'Open Question Only', time: 40, questions: 1, description: 'Literary argument essay' },
          { id: 'all-essays', name: 'All Essays', time: 120, questions: 3, description: 'All three essay types' }
        ]
      }
    ]
  },
  'AP English Language': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 45, description: 'Reading comprehension and rhetorical analysis' },
      { 
        id: 'frq', 
        name: 'Free Response Questions', 
        time: 135, 
        questions: 3, 
        description: 'Choose specific essay types or take all essays',
        subSections: [
          { id: 'synthesis-only', name: 'Synthesis Essay Only', time: 45, questions: 1, description: 'Argument using multiple sources' },
          { id: 'rhetorical-only', name: 'Rhetorical Analysis Only', time: 45, questions: 1, description: 'Analysis of rhetorical strategies' },
          { id: 'argument-only', name: 'Argument Essay Only', time: 45, questions: 1, description: 'Evidence-based argument essay' },
          { id: 'all-essays', name: 'All Essays', time: 135, questions: 3, description: 'Complete essay section' }
        ]
      }
    ]
  }
};

console.log('Testing English Literature sections:');
console.log(TEST_CONFIGURATIONS['AP English Literature'].sections[1].subSections);

console.log('\nTesting English Language sections:');
console.log(TEST_CONFIGURATIONS['AP English Language'].sections[1].subSections);

console.log('\nAll essay types should be supported:');
const allTypes = [
  'poetry-only', 'prose-only', 'open-only', 
  'synthesis-only', 'rhetorical-only', 'argument-only',
  'saq-only', 'dbq-only', 'leq-only',
  'long-frq', 'short-frq', 'calculator-frq', 'no-calculator-frq'
];
console.log(allTypes);
