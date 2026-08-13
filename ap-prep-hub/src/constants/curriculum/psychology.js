// AP Psychology curriculum data
const psychology = {
  name: "AP Psychology",
  description: "Introduce students to the systematic and scientific study of human behavior and mental processes. Students examine the major core concepts and theories of psychology.",
  examFormat: {
    duration: "2 hours",
    sections: [
      { name: "Multiple Choice", questions: 100, time: "70 minutes", weight: "66.7%" },
      { name: "Free Response", questions: 2, time: "50 minutes", weight: "33.3%" }
    ]
  },
  bigIdeas: [
    "Psychological Science: How does psychology use the scientific method to study behavior and mental processes?",
    "Biopsychology: How do biological factors influence behavior and mental processes?",
    "Sensation and Perception: How do we process sensory information?",
    "Learning: How do we learn and adapt our behavior?",
    "Memory: How do we encode, store, and retrieve information?",
    "Cognition: How do we think, solve problems, and use language?",
    "Development: How do we change throughout our lifespan?"
  ],
  // REVISED framework (CED, fall 2025). Nine units became FIVE. The old list
  // still had separate Scientific Foundations, Sensation and Perception,
  // Learning, Cognitive, Developmental, Personality, Abnormal and Treatment
  // units — a structure students are no longer taught or tested against.
  // REVISED framework (CED, fall 2025). Nine units became FIVE. The old list
  // still had separate Scientific Foundations, Sensation and Perception,
  // Learning, Cognitive, Developmental, Personality, Abnormal and Treatment
  // units — a structure students are no longer taught or tested against.
  // REVISED framework (CED, fall 2025). Nine units became FIVE. The old list
  // still had separate Scientific Foundations, Sensation and Perception,
  // Learning, Cognitive, Developmental, Personality, Abnormal and Treatment
  // units — a structure students are no longer taught or tested against.
  units: [
    { name: "Unit 1: Biological Bases of Behavior", weight: "15-25%", topics: ["The suggested skill\u0007offers\u0007a\u0007possible\u0007skill\u0007to\u0007pair\u0007with\u0007the\u0007topic", "Interaction of Heredity and Environment", "The Neuron and Neural Firing", "1.B"] },
    { name: "Unit 2: Cognition", weight: "15-25%", topics: ["Perception", "Thinking, ProblemSolving, Judgments, and Decision-Making", "Introduction to Memory", "Encoding Memories", "Storing Memories", "Retrieving Memories", "Forgetting and Other Memory Challenges", "Intelligence and Achievement"] },
    { name: "Unit 3: Development and Learning", weight: "15-25%", topics: ["Themes and Methods in Developmental Psychology", "Physical Development Across the Lifespan", "Gender and Sexual Orientation", "Cognitive Development Across the Lifespan", "Communication and Language Development", "Social-Emotional Development Across the Lifespan", "Classical Conditioning", "Operant Conditioning", "Social, Cognitive, and Neurological Factors in Learning"] },
    { name: "Unit 4: Social Psychology and Personality", weight: "15-25%", topics: ["Attribution Theory and Person Perception", "Attitude Formation and Attitude Change", "1.B", "Psychodynamic and Humanistic Theories of Personality", "Social-Cognitive and Trait Theories of Personality"] },
    { name: "Unit 5: Mental and Physical Health", weight: "15-25%", topics: ["Introduction to Health Psychology", "Positive Psychology", "Explaining and Classifying Psychological Disorders", "Treatment of Psychological Disorders"] }
  ],
  keySkills: [
    "Scientific Investigation: Design and analyze psychological research",
    "Data Analysis: Interpret statistical information and research findings",
    "Theoretical Application: Apply psychological theories to explain behavior",
    "Critical Thinking: Evaluate claims and evidence in psychology",
    "Ethical Reasoning: Apply ethical principles to psychological scenarios",
    "Communication: Express psychological concepts clearly and accurately"
  ],
  studyTips: [
    "Learn key researchers and their contributions",
    "Understand research methods and be able to critique studies",
    "Practice applying theories to real-world scenarios",
    "Memorize brain structures and their functions",
    "Study the criteria for psychological disorders",
    "Learn to distinguish between different therapeutic approaches",
    "Practice interpreting graphs and statistical information",
    "Connect concepts across different units",
    "Use mnemonics for remembering lists and stages",
    "Read current psychology research and news"
  ],
  commonTopics: [
    "Research methods and experimental design",
    "Brain structure and function",
    "Classical and operant conditioning",
    "Memory processes and types",
    "Piaget's stages of cognitive development",
    "Personality theories and assessment",
    "Psychological disorder criteria and classification",
    "Therapeutic approaches and effectiveness",
    "Statistical concepts in psychology",
    "Ethical guidelines for research and practice",
    "Nature vs. nurture in development",
    "Sensation and perception processes"
  ]
};

export default psychology;
