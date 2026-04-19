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
  units: [
    {
      name: "Unit 1: Scientific Foundations of Psychology",
      weight: "10-14%",
      topics: [
        "History and approaches",
        "Research methods and ethics",
        "Analyzing and interpreting data",
        "Statistical concepts"
      ],
      keyConcepts: [
        "Major psychological perspectives and approaches",
        "Research methods: experimental, correlational, observational",
        "Ethical guidelines for psychological research",
        "Statistical concepts: correlation, causation, significance",
        "Experimental design: variables, controls, bias",
        "Descriptive statistics and data interpretation"
      ],
      essentialKnowledge: [
        "Psychology uses scientific methods to study behavior",
        "Different approaches offer different explanations",
        "Correlation does not imply causation",
        "Ethical considerations guide psychological research",
        "Proper experimental design controls for confounding variables"
      ]
    },
    {
      name: "Unit 2: Biological Bases of Behavior",
      weight: "8-10%",
      topics: [
        "Nervous system organization",
        "Brain structure and function",
        "Neurotransmitters and hormones",
        "Genetics and behavior",
        "Brain plasticity"
      ],
      keyConcepts: [
        "Central and peripheral nervous system",
        "Brain regions and their functions",
        "Neurotransmitter systems",
        "Endocrine system and hormones",
        "Genetic influences on behavior",
        "Neuroplasticity and brain adaptation",
        "Methods of studying the brain"
      ],
      essentialKnowledge: [
        "Biological processes underlie psychological phenomena",
        "Different brain regions have specialized functions",
        "Neurotransmitters influence mood and behavior",
        "Genetics and environment interact to influence behavior",
        "The brain can adapt and reorganize throughout life"
      ]
    },
    {
      name: "Unit 3: Sensation and Perception",
      weight: "6-8%",
      topics: [
        "Sensory processes",
        "Visual perception",
        "Auditory perception",
        "Other senses",
        "Perceptual organization"
      ],
      keyConcepts: [
        "Absolute and difference thresholds",
        "Signal detection theory",
        "Visual system: eye structure, visual processing",
        "Auditory system: ear structure, sound processing",
        "Chemical senses: taste and smell",
        "Somatosensory system: touch, pain, temperature",
        "Gestalt principles of perceptual organization",
        "Depth perception and visual illusions"
      ],
      essentialKnowledge: [
        "Sensation involves detecting stimuli; perception involves interpreting them",
        "Sensory systems have limits and can be fooled",
        "The brain organizes sensory information into meaningful patterns",
        "Perception is influenced by expectations and context",
        "Different sensory systems work together to create experience"
      ]
    },
    {
      name: "Unit 4: Learning",
      weight: "7-9%",
      topics: [
        "Classical conditioning",
        "Operant conditioning",
        "Observational learning",
        "Cognitive learning"
      ],
      keyConcepts: [
        "Classical conditioning: Pavlov, acquisition, extinction",
        "Operant conditioning: Skinner, reinforcement, punishment",
        "Schedules of reinforcement",
        "Observational learning and modeling",
        "Cognitive learning and insight",
        "Biological constraints on learning",
        "Applications of learning principles"
      ],
      essentialKnowledge: [
        "Learning involves relatively permanent changes in behavior",
        "Classical conditioning links stimuli with responses",
        "Operant conditioning shapes behavior through consequences",
        "Learning can occur through observation and imitation",
        "Biological factors influence what can be learned"
      ]
    },
    {
      name: "Unit 5: Cognitive Psychology",
      weight: "13-17%",
      topics: [
        "Memory processes",
        "Memory systems",
        "Forgetting and memory construction",
        "Thinking and problem solving",
        "Language"
      ],
      keyConcepts: [
        "Encoding, storage, and retrieval processes",
        "Sensory, short-term, and long-term memory",
        "Types of long-term memory: explicit and implicit",
        "Forgetting: interference, decay, motivated forgetting",
        "Memory construction and false memories",
        "Problem-solving strategies and heuristics",
        "Language development and structure",
        "Relationship between language and thought"
      ],
      essentialKnowledge: [
        "Memory involves multiple processes and systems",
        "Memory is reconstructive, not reproductive",
        "Thinking involves mental representations and processes",
        "Language follows rules and develops systematically",
        "Cognitive processes can be studied scientifically"
      ]
    },
    {
      name: "Unit 6: Developmental Psychology",
      weight: "7-9%",
      topics: [
        "Physical development",
        "Cognitive development",
        "Social development",
        "Moral development"
      ],
      keyConcepts: [
        "Nature vs. nurture in development",
        "Prenatal development and influences",
        "Piaget's stages of cognitive development",
        "Attachment theory and styles",
        "Parenting styles and their effects",
        "Kohlberg's stages of moral development",
        "Adolescent development and identity formation",
        "Aging and late-life development"
      ],
      essentialKnowledge: [
        "Development occurs throughout the lifespan",
        "Genetic and environmental factors interact in development",
        "Development follows predictable patterns with individual variation",
        "Early experiences influence later development",
        "Different domains of development are interconnected"
      ]
    },
    {
      name: "Unit 7: Personality",
      weight: "11-15%",
      topics: [
        "Personality theories",
        "Personality assessment",
        "Self-concept and self-esteem"
      ],
      keyConcepts: [
        "Psychoanalytic theory: Freud, unconscious, defense mechanisms",
        "Humanistic theory: Rogers, self-actualization",
        "Trait theories: Big Five, factor analysis",
        "Social-cognitive theories: Bandura, reciprocal determinism",
        "Personality assessment methods",
        "Self-concept development and influences",
        "Cultural influences on personality"
      ],
      essentialKnowledge: [
        "Personality represents consistent patterns of behavior",
        "Different theories explain personality development differently",
        "Personality can be measured and assessed",
        "Culture influences personality expression",
        "Personality involves both stability and change"
      ]
    },
    {
      name: "Unit 8: Abnormal Psychology",
      weight: "13-17%",
      topics: [
        "Defining abnormality",
        "Anxiety and related disorders",
        "Mood disorders",
        "Schizophrenia spectrum disorders",
        "Other disorders"
      ],
      keyConcepts: [
        "Criteria for defining psychological disorders",
        "DSM-5 classification system",
        "Anxiety disorders: generalized anxiety, phobias, panic",
        "Mood disorders: major depression, bipolar disorder",
        "Schizophrenia spectrum and psychotic disorders",
        "Obsessive-compulsive and related disorders",
        "Trauma and stressor-related disorders",
        "Neurodevelopmental disorders"
      ],
      essentialKnowledge: [
        "Abnormality is defined by multiple criteria",
        "Psychological disorders are classified systematically",
        "Disorders have multiple causes: biological, psychological, social",
        "Disorders exist on continua of severity",
        "Cultural factors influence disorder expression and treatment"
      ]
    },
    {
      name: "Unit 9: Treatment of Abnormal Behavior",
      weight: "5-7%",
      topics: [
        "Psychotherapy approaches",
        "Biomedical treatments",
        "Treatment effectiveness"
      ],
      keyConcepts: [
        "Psychodynamic therapy approaches",
        "Humanistic therapy approaches",
        "Behavioral and cognitive-behavioral therapies",
        "Group and family therapies",
        "Psychopharmacology: antidepressants, antipsychotics",
        "Other biomedical treatments: ECT, brain stimulation",
        "Treatment outcome research",
        "Ethical issues in treatment"
      ],
      essentialKnowledge: [
        "Multiple therapeutic approaches exist",
        "Different treatments work for different disorders",
        "Treatment effectiveness can be scientifically evaluated",
        "Biological and psychological treatments can be combined",
        "Cultural factors influence treatment preferences and outcomes"
      ]
    }
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
