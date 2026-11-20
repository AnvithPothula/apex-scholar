// AP Latin curriculum data
const latin = {
  name: "AP Latin",
  description: "Develop proficiency in reading and understanding Latin literature while exploring the cultural and historical contexts of ancient Rome.",
  // Current CED (2026 exam on): Pliny the Younger and Vergil; Caesar was dropped. Six units.
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 52, time: "65 minutes", weight: "50%" },
      { name: "Free Response", questions: 5, time: "115 minutes", weight: "50% (short answer, translation, short essay, two course-project passage essays)" }
    ]
  },
  bigIdeas: [
    "Language and Text: Latin texts reveal linguistic patterns and literary techniques",
    "Cultural Context: Roman culture, history, and values shape literary expression",
    "Interpretation: Multiple perspectives enhance understanding of Latin literature",
    "Connections: Latin literature connects to modern culture and literature"
  ],
  units: [
    {
      name: "Unit 1: Teacher's Choice: Latin Prose",
      topics: ["Sight reading of Latin prose", "Grammar and syntax in context", "Vocabulary in context"],
      keyConcepts: ["Reading unfamiliar prose accurately", "Identifying constructions (ablative absolute, indirect statement, subjunctive uses)"],
      essentialKnowledge: ["About 1,650 words of teacher's choice prose are read across the course"]
    },
    {
      name: "Unit 2: Pliny's Letters: Eruption of Mt. Vesuvius",
      topics: ["Letter 6.16: the eruption and Pliny the Elder", "Letter 6.20: the eruption and Pliny the Younger"],
      keyConcepts: ["Pliny's narrative and descriptive techniques", "Characterization of Pliny the Elder", "Roman values in a crisis"],
      essentialKnowledge: ["Pliny wrote these letters to Tacitus for his histories, decades after 79 CE"]
    },
    {
      name: "Unit 3: Pliny's Letters: Ghosts, Calpurnia, and Trajan",
      topics: ["Letter 7.27: ghosts and apparitions", "Letters 10.37 and 10.90: aqueducts", "Letters 10.5–10.7: citizenship for Pliny's doctor", "Letters 6.4 and 6.7: to Calpurnia"],
      keyConcepts: ["Epistolary style and self-presentation", "Roman provincial administration", "Roman marriage and private life"],
      essentialKnowledge: ["Book 10 is Pliny's correspondence with Trajan as governor of Bithynia-Pontus"]
    },
    {
      name: "Unit 4: Teacher's Choice: Latin Poetry and Vergil's Aeneid",
      topics: ["Sight reading of Latin poetry", "Aeneid 1.1–33, 1.88–107, 1.496–508", "Aeneid 2.40–56, 2.201–249 (Laocoön)"],
      keyConcepts: ["Dactylic hexameter and scansion", "Epic conventions", "Poetic devices and their effects"],
      essentialKnowledge: ["About 1,350 words of teacher's choice poetry are read across the course"]
    },
    {
      name: "Unit 5: Vergil's Aeneid, Books 4, 6, 7, 11, and 12",
      topics: ["4.74–89, 4.165–197, 4.305–361 (Dido)", "6.450–476, 6.788–800, 6.847–853 (Underworld, Anchises)", "7.45–58, 7.783–792, 7.803–817 (Latinus, Turnus)", "11.532–594 (Camilla)", "12.791–796, 12.803–812, 12.818–828, 12.919–952 (the final battle)"],
      keyConcepts: ["Fate, the gods and pietas", "Characterization of Dido, Turnus and Camilla", "Rome's destiny and the cost of empire"],
      essentialKnowledge: ["The Aeneid connects Augustus's Rome to Troy and frames Roman identity"]
    },
    {
      name: "Unit 6: Course Project and Teacher's Choice: Latin Poetry",
      topics: ["Course project passages (prose and poetry)", "In-class checkpoints", "Short essays on project passages"],
      keyConcepts: ["Analyzing an unfamiliar passage with evidence from the Latin"],
      essentialKnowledge: ["Free-response questions 4 and 5 are short essays on project passages"]
    }
  ],
  keySkills: [
    "Reading Comprehension: Understand Latin texts accurately",
    "Translation: Render Latin into idiomatic English",
    "Literary Analysis: Analyze literary techniques and themes",
    "Cultural Analysis: Understand texts within historical context",
    "Comparison: Connect Latin literature to other works and cultures"
  ],
  studyTips: [
    "Master Latin grammar and syntax thoroughly",
    "Read extensively in both prose and poetry",
    "Study Roman history and cultural context",
    "Practice sight-reading unfamiliar passages",
    "Analyze literary devices and their effects",
    "Compare Roman values with contemporary values",
    "Use commentaries and scholarly resources",
    "Practice timed translation exercises",
    "Study meter and poetic techniques for Vergil",
    "Connect Latin literature to modern works"
  ],
  commonTopics: [
    "Pliny's letters: Vesuvius, ghosts, Trajan and Calpurnia",
    "Roman provincial administration under Trajan",
    "Epic heroism and character development",
    "Divine intervention and human destiny",
    "Foundation myths and national identity",
    "Literary techniques in prose and poetry",
    "Roman values and social expectations",
    "Historical context of literary works",
    "Influence of Latin literature on later writers"
  ]
};

export default latin;
