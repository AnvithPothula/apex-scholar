// AP English Language and Composition curriculum data
const englishLanguageAndComposition = {
  name: "AP English Language and Composition",
  description: "Learn to read, analyze, and write texts as you explore issues that matter to you and others in our complex world.",
  examFormat: {
    duration: "3 hours 15 minutes",
    sections: [
      { name: "Multiple Choice", questions: 45, time: "60 minutes", weight: "45%" },
      { name: "Free Response", questions: 3, time: "135 minutes", weight: "55%" }
    ]
  },
  bigIdeas: [
    "Rhetorical Situation: Individuals write within a particular situation and make strategic writing choices based on that situation",
    "Claims and Evidence: Writers make claims about subjects, rely on evidence that supports the reasoning that justifies the claim, and often acknowledge or respond to other, possibly opposing, arguments",
    "Reasoning and Organization: Writers guide understanding of a text's lines of reasoning and organization through that text's structure and development",
    "Style: The rhetorical situation informs the strategic stylistic choices that writers make",
    "Purpose: Writers' choices of language and structure are informed by different purposes"
  ],
  units: [
    {
      name: "Unit 1: Claims and Evidence",
      weight: "13-16%",
      topics: [
        "Identifying and explaining claims",
        "Identifying and explaining evidence",
        "Developing commentary that explains how evidence supports a line of reasoning",
        "Writing thesis statements"
      ],
      keyConcepts: [
        "Claims as debatable assertions",
        "Types of evidence: statistics, examples, expert testimony, anecdotes",
        "Commentary connecting evidence to claims",
        "Thesis statements that establish a line of reasoning",
        "Distinguishing between claims and evidence"
      ],
      essentialKnowledge: [
        "Claims require support through evidence and commentary",
        "Evidence must be relevant, sufficient, and credible",
        "Commentary explains how evidence supports the argument",
        "Thesis statements preview the line of reasoning",
        "Strong arguments address potential counterarguments"
      ]
    },
    {
      name: "Unit 2: Reasoning and Organization",
      weight: "13-16%",
      topics: [
        "Identifying and explaining methods of development",
        "Organizing an argument through line of reasoning",
        "Using transitional elements",
        "Developing introduction and conclusion paragraphs"
      ],
      keyConcepts: [
        "Methods of development: definition, cause-effect, comparison-contrast, classification",
        "Line of reasoning as logical progression",
        "Transitions connecting ideas within and between paragraphs",
        "Introduction strategies: hook, context, thesis",
        "Conclusion strategies: synthesis, call to action, broader implications"
      ],
      essentialKnowledge: [
        "Organization affects reader understanding and persuasion",
        "Methods of development support different types of arguments",
        "Transitions guide readers through the argument",
        "Introductions establish context and preview arguments",
        "Conclusions synthesize ideas and suggest implications"
      ]
    },
    {
      name: "Unit 3: Character and Context",
      weight: "13-16%",
      topics: [
        "Identifying and describing components of rhetorical situation",
        "Explaining how rhetorical situation affects writer's choices",
        "Developing an argument with awareness of audience",
        "Situating an argument within broader conversation"
      ],
      keyConcepts: [
        "Rhetorical triangle: speaker, audience, subject",
        "Context: historical, cultural, social circumstances",
        "Purpose: to inform, persuade, entertain, etc.",
        "Audience awareness and adaptation",
        "Entering ongoing conversations about issues"
      ],
      essentialKnowledge: [
        "Rhetorical situation shapes all communication choices",
        "Effective writers consider their audience's values and beliefs",
        "Context includes immediate and broader circumstances",
        "Arguments respond to and build on existing conversations",
        "Purpose influences tone, style, and organizational choices"
      ]
    },
    {
      name: "Unit 4: Perspective",
      weight: "10-13%",
      topics: [
        "Identifying and explaining perspective",
        "Analyzing how perspective is revealed through details",
        "Developing a complex thesis that acknowledges perspectives",
        "Situating a specific argument within broader themes"
      ],
      keyConcepts: [
        "Perspective as writer's view or attitude",
        "Bias and how it affects argumentation",
        "Multiple perspectives on complex issues",
        "Complexity in thesis statements",
        "Universal themes and human experiences"
      ],
      essentialKnowledge: [
        "All writers have perspectives that influence their arguments",
        "Effective arguments acknowledge multiple viewpoints",
        "Complex thesis statements show sophistication of thought",
        "Specific arguments often reflect broader themes",
        "Perspective is revealed through word choice and emphasis"
      ]
    },
    {
      name: "Unit 5: Tone and Figurative Language",
      weight: "13-16%",
      topics: [
        "Identifying and explaining tone",
        "Analyzing word choice and imagery",
        "Explaining how writers' choices affect readers",
        "Using precise word choice and imagery in writing"
      ],
      keyConcepts: [
        "Tone as writer's attitude toward subject",
        "Diction and its effects on meaning",
        "Figurative language: metaphor, simile, personification",
        "Imagery appealing to the senses",
        "Connotation vs. denotation"
      ],
      essentialKnowledge: [
        "Tone affects how readers receive arguments",
        "Word choice carries both denotative and connotative meaning",
        "Figurative language creates emotional connections",
        "Imagery makes abstract concepts concrete",
        "Precise language increases clarity and impact"
      ]
    },
    {
      name: "Unit 6: Complexity and Literary Argumentation",
      weight: "13-16%",
      topics: [
        "Identifying and explaining literary elements and techniques",
        "Developing complex literary arguments",
        "Using textual evidence in literary arguments",
        "Writing introductions and conclusions for literary arguments"
      ],
      keyConcepts: [
        "Literary elements: character, setting, plot, theme",
        "Literary techniques: symbolism, irony, paradox",
        "Close reading and textual analysis",
        "Literary arguments vs. other argument types",
        "Integration of quotations and paraphrases"
      ],
      essentialKnowledge: [
        "Literary texts use specific techniques to convey meaning",
        "Literary arguments require close textual analysis",
        "Evidence in literary arguments comes from the text itself",
        "Literary techniques work together to create overall effect",
        "Close reading reveals layers of meaning in texts"
      ]
    },
    {
      name: "Unit 7: Comparison",
      weight: "10-13%",
      topics: [
        "Comparing rhetorical choices across texts",
        "Explaining how comparisons convey meaning",
        "Developing thesis statements for comparison arguments",
        "Organizing comparison arguments effectively"
      ],
      keyConcepts: [
        "Point-by-point vs. block comparison methods",
        "Comparative thesis statements",
        "Similarities and differences in rhetorical choices",
        "Comparative analysis of effectiveness",
        "Synthesis of multiple texts"
      ],
      essentialKnowledge: [
        "Comparison reveals insights not apparent in single texts",
        "Effective comparison focuses on significant similarities and differences",
        "Comparative thesis statements should be arguable and complex",
        "Organization affects clarity in comparison essays",
        "Comparison can demonstrate evolution of ideas or techniques"
      ]
    },
    {
      name: "Unit 8: Argumentation",
      weight: "13-16%",
      topics: [
        "Developing defensible thesis statements",
        "Planning and organizing argumentative writing",
        "Using evidence and commentary effectively",
        "Writing effective introductions and conclusions for arguments"
      ],
      keyConcepts: [
        "Defensible thesis statements with clear position",
        "Multiple types of evidence and their effectiveness",
        "Counterarguments and refutation",
        "Logical fallacies to avoid",
        "Argumentative essay structure and flow"
      ],
      essentialKnowledge: [
        "Strong arguments have clear, defensible thesis statements",
        "Evidence must be relevant, credible, and sufficient",
        "Acknowledging counterarguments strengthens arguments",
        "Logical reasoning connects evidence to claims",
        "Effective arguments consider audience values and beliefs"
      ]
    },
    {
      name: "Unit 9: Synthesis",
      weight: "13-16%",
      topics: [
        "Making connections among different texts",
        "Developing thesis statements for synthesis arguments",
        "Integrating evidence from multiple sources",
        "Attributing sources and demonstrating relationships among them"
      ],
      keyConcepts: [
        "Synthesis as combination of multiple sources",
        "Source integration and attribution",
        "Relationships among sources: agreement, disagreement, extension",
        "Synthesis thesis statements",
        "Avoiding oversimplification in synthesis"
      ],
      essentialKnowledge: [
        "Synthesis requires thoughtful integration of multiple sources",
        "Sources should support and complicate the argument",
        "Proper attribution gives credit and adds credibility",
        "Synthesis goes beyond summary to create new understanding",
        "Effective synthesis shows relationships among sources"
      ]
    }
  ],
  keySkills: [
    "Rhetorical Situation: Explain how writers' choices reflect the components of the rhetorical situation",
    "Claims and Evidence: Develop paragraphs that include claims and evidence that supports a line of reasoning",
    "Reasoning and Organization: Use appropriate methods of development to advance an argument",
    "Language and Style: Use language and style appropriate to audience, purpose, and rhetorical situation",
    "Sources and Evidence: Demonstrate understanding of source material through summarizing, paraphrasing, and quoting"
  ],
  freeResponseTypes: [
    {
      name: "Synthesis Essay",
      description: "Argue a position on a topic using provided sources",
      timeAllocation: "60 minutes",
      weight: "1/3 of FRQ score"
    },
    {
      name: "Rhetorical Analysis Essay", 
      description: "Analyze rhetorical choices in a provided text",
      timeAllocation: "40 minutes",
      weight: "1/3 of FRQ score"
    },
    {
      name: "Argument Essay",
      description: "Create an evidence-based argument on a given topic",
      timeAllocation: "40 minutes", 
      weight: "1/3 of FRQ score"
    }
  ],
  studyTips: [
    "Read widely from various time periods, genres, and perspectives",
    "Practice identifying and analyzing rhetorical devices and their effects",
    "Develop a sophisticated vocabulary for discussing rhetoric and style",
    "Practice writing under time constraints regularly",
    "Learn to quickly identify thesis statements and lines of reasoning",
    "Study model essays and understand what makes them effective",
    "Practice integrating quotations smoothly into your writing",
    "Develop complex thesis statements that acknowledge nuance",
    "Read current events and practice analyzing contemporary arguments",
    "Work on varying sentence structure and improving style"
  ],
  commonTopics: [
    "Rhetorical analysis of speeches, essays, and articles",
    "Argument construction and thesis development",
    "Synthesis of multiple sources on contemporary issues",
    "Tone and diction analysis in various texts",
    "Comparison of rhetorical strategies across texts",
    "Evidence evaluation and commentary development",
    "Organization and methods of development",
    "Audience awareness and adaptation",
    "Counterargument acknowledgment and refutation",
    "Style analysis and imitation",
    "Current events and contemporary debates",
    "Historical and cultural context in argumentation"
  ]
};

export default englishLanguageAndComposition;
