// AP English Literature and Composition curriculum data
const englishLiteratureAndComposition = {
  name: "AP English Literature and Composition",
  description: "Read and analyze imaginative literature from various genres, time periods, and cultures, and learn to write analytically about literary works.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 55, time: "60 minutes", weight: "45%" },
      { name: "Free Response", questions: 3, time: "120 minutes", weight: "55%" }
    ]
  },
  bigIdeas: [
    "Character: Characters in literature allow readers to study and explore a range of values, beliefs, assumptions, biases, and cultural norms",
    "Setting: Setting and the details associated with it not only depict a time and place, but also convey values associated with that setting",
    "Structure: The arrangement of the parts and sections of a text, the relationship of the parts to each other, and the sequence in which the text reveals information",
    "Narration: Narration is used strategically to control the flow of information to readers",
    "Figurative Language: Figurative language brings complexity and nuance to texts",
    "Literary Argumentation: Reading literature is an act of interpretation, and writing about literature requires making and supporting interpretive arguments"
  ],
  units: [
    {
      name: "Unit 1: Short Fiction I",
      weight: "15-18%",
      topics: [
        "Structure and literary elements in short fiction",
        "Character development and motivation",
        "Setting and its relationship to meaning",
        "Narrative perspective and point of view",
        "Theme development in short works"
      ],
      keyConcepts: [
        "Elements of fiction: plot, character, setting, point of view, theme",
        "Characterization methods: direct and indirect",
        "Conflict types: internal vs. external",
        "Setting's impact on mood and meaning",
        "First, second, and third person narration",
        "Reliable vs. unreliable narrators"
      ],
      essentialKnowledge: [
        "Short fiction uses literary elements to create meaning",
        "Character development occurs through actions, dialogue, and thoughts",
        "Setting often reflects or contrasts with character emotions",
        "Point of view affects reader access to information",
        "Themes emerge through the interaction of literary elements"
      ]
    },
    {
      name: "Unit 2: Poetry I",
      weight: "15-18%",
      topics: [
        "Structure and meaning in poetry",
        "Figurative language and imagery",
        "Sound devices and their effects",
        "Speaker and tone in poetry",
        "Poetic forms and their purposes"
      ],
      keyConcepts: [
        "Poetic structure: stanzas, line breaks, rhyme scheme",
        "Figurative language: metaphor, simile, personification, symbolism",
        "Sound devices: alliteration, assonance, consonance, onomatopoeia",
        "Speaker vs. poet distinction",
        "Tone and mood creation",
        "Traditional forms: sonnet, villanelle, ballad"
      ],
      essentialKnowledge: [
        "Poetry uses concentrated language to create meaning",
        "Figurative language creates layers of meaning beyond literal",
        "Sound devices contribute to meaning and emotional effect",
        "The speaker is not necessarily the poet",
        "Poetic forms carry traditional associations and expectations"
      ]
    },
    {
      name: "Unit 3: Longer Fiction or Drama I",
      weight: "15-18%",
      topics: [
        "Character development over extended works",
        "Conflict and plot development",
        "Theme development in longer works",
        "Setting and its evolution",
        "Dramatic elements and staging"
      ],
      keyConcepts: [
        "Character arcs and development over time",
        "Plot structure: exposition, rising action, climax, falling action, resolution",
        "Subplots and their relationship to main plot",
        "Dramatic irony and its effects",
        "Stage directions and their significance",
        "Dramatic conventions and audience expectations"
      ],
      essentialKnowledge: [
        "Longer works allow for complex character development",
        "Plot development creates tension and releases it strategically",
        "Themes develop through recurring patterns and motifs",
        "Drama relies on dialogue and action to convey meaning",
        "Staging choices affect interpretation and meaning"
      ]
    },
    {
      name: "Unit 4: Short Fiction II",
      weight: "10-13%",
      topics: [
        "Complexity in short fiction",
        "Ambiguity and multiple interpretations",
        "Symbolism and allegory",
        "Irony and its various forms",
        "Cultural and historical contexts"
      ],
      keyConcepts: [
        "Symbolic meaning vs. literal meaning",
        "Verbal, situational, and dramatic irony",
        "Allegory as extended metaphor",
        "Cultural context affecting interpretation",
        "Ambiguity as deliberate literary technique",
        "Reader response and interpretation"
      ],
      essentialKnowledge: [
        "Literary works often have multiple valid interpretations",
        "Symbols carry meaning beyond their literal representation",
        "Irony creates contrast between expectation and reality",
        "Cultural context influences both creation and interpretation",
        "Ambiguity can enhance rather than detract from meaning"
      ]
    },
    {
      name: "Unit 5: Poetry II",
      weight: "10-13%",
      topics: [
        "Complex poetic structures",
        "Extended metaphors and conceits",
        "Allusion and intertextuality",
        "Poetic movements and their characteristics",
        "Comparative analysis of poems"
      ],
      keyConcepts: [
        "Extended metaphor and controlling images",
        "Allusion to literature, history, mythology, religion",
        "Intertextuality and dialogue between texts",
        "Poetic movements: Romantic, Modernist, etc.",
        "Comparative analysis techniques",
        "Evolution of poetic forms and conventions"
      ],
      essentialKnowledge: [
        "Complex poems often use extended metaphorical structures",
        "Allusions create connections to broader cultural knowledge",
        "Poems often respond to or build upon earlier works",
        "Poetic movements reflect historical and cultural contexts",
        "Comparative analysis reveals insights about individual works"
      ]
    },
    {
      name: "Unit 6: Longer Fiction or Drama II",
      weight: "10-13%",
      topics: [
        "Complex narrative structures",
        "Multiple perspectives and voices",
        "Social and political themes",
        "Genre conventions and innovations",
        "Adaptation and interpretation"
      ],
      keyConcepts: [
        "Non-linear narrative structures",
        "Multiple narrators and perspectives",
        "Social commentary and critique",
        "Genre expectations and subversions",
        "Adaptation across media",
        "Performance and interpretation choices"
      ],
      essentialKnowledge: [
        "Complex works may use innovative narrative structures",
        "Multiple perspectives can create complex understanding",
        "Literature often reflects and critiques social conditions",
        "Genre conventions can be followed or deliberately subverted",
        "Adaptations reveal interpretive choices about source material"
      ]
    },
    {
      name: "Unit 7: Short Fiction III",
      weight: "5-10%",
      topics: [
        "Postmodern and contemporary techniques",
        "Experimental narrative forms",
        "Diverse voices and perspectives",
        "Global and multicultural literature",
        "Genre blending and innovation"
      ],
      keyConcepts: [
        "Postmodern literary techniques",
        "Experimental forms and structures",
        "Diverse cultural perspectives",
        "Global literature and translation",
        "Genre blending and hybrid forms",
        "Contemporary themes and concerns"
      ],
      essentialKnowledge: [
        "Contemporary literature often experiments with traditional forms",
        "Diverse voices bring new perspectives to universal themes",
        "Global literature expands understanding of human experience",
        "Genre boundaries are increasingly fluid",
        "Contemporary works reflect current social and cultural issues"
      ]
    },
    {
      name: "Unit 8: Poetry III",
      weight: "5-10%",
      topics: [
        "Contemporary and experimental poetry",
        "Spoken word and performance poetry",
        "Poetry and social justice",
        "Digital and multimedia poetry",
        "Global poetic traditions"
      ],
      keyConcepts: [
        "Contemporary poetic forms and innovations",
        "Performance aspects of poetry",
        "Poetry as social and political commentary",
        "Digital media and poetry",
        "Cross-cultural poetic traditions",
        "Poetry and identity formation"
      ],
      essentialKnowledge: [
        "Contemporary poetry continues to evolve and innovate",
        "Performance adds dimensions to poetic meaning",
        "Poetry serves as vehicle for social commentary",
        "Technology creates new possibilities for poetic expression",
        "Global poetry traditions offer diverse approaches to form and meaning"
      ]
    },
    {
      name: "Unit 9: Longer Fiction or Drama III",
      weight: "5-10%",
      topics: [
        "Contemporary literary movements",
        "Metafiction and self-reflexivity",
        "Postcolonial and multicultural perspectives",
        "Interdisciplinary approaches to literature",
        "Literature and technology"
      ],
      keyConcepts: [
        "Metafictional techniques and self-awareness",
        "Postcolonial literary theory and practice",
        "Multicultural and diverse perspectives",
        "Interdisciplinary literary analysis",
        "Technology's impact on literature",
        "Global literary conversations"
      ],
      essentialKnowledge: [
        "Contemporary literature often questions its own assumptions",
        "Postcolonial literature challenges traditional literary canons",
        "Multicultural perspectives enrich literary understanding",
        "Literature intersects with other disciplines",
        "Technology influences both creation and consumption of literature"
      ]
    }
  ],
  keySkills: [
    "Explain the function of character: Explain the function of a character in a text",
    "Explain the function of setting: Explain the function of setting in a text",
    "Explain the function of plot and structure: Explain the function of plot and structure in a text",
    "Explain the function of the narrator or speaker: Explain the function of the narrator or speaker in a text",
    "Explain the function of word choice, imagery, and symbols: Explain the function of specific words and phrases in a text",
    "Explain the function of comparison: Explain the function of comparison in a text",
    "Develop textually substantiated arguments: Develop a thesis statement and textually substantiated argument in response to a prompt"
  ],
  freeResponseTypes: [
    {
      name: "Poetry Analysis",
      description: "Analyze how a poet uses literary elements and techniques to convey meaning",
      timeAllocation: "40 minutes",
      weight: "1/3 of FRQ score"
    },
    {
      name: "Prose Fiction Analysis",
      description: "Analyze how an author uses literary elements and techniques to convey meaning",
      timeAllocation: "40 minutes",
      weight: "1/3 of FRQ score"
    },
    {
      name: "Literary Argument",
      description: "Create an evidence-based argument about a literary topic using a provided list of works",
      timeAllocation: "40 minutes",
      weight: "1/3 of FRQ score"
    }
  ],
  studyTips: [
    "Read widely across genres, time periods, and cultures",
    "Practice close reading techniques and textual analysis",
    "Develop a sophisticated vocabulary for discussing literary techniques",
    "Learn to identify and analyze literary devices and their effects",
    "Practice writing clear thesis statements with defendable claims",
    "Use specific textual evidence to support interpretations",
    "Understand the difference between summary and analysis",
    "Practice timed writing to develop speed and fluency",
    "Study major literary movements and their characteristics",
    "Read works from the suggested reading list for the open question"
  ],
  commonTopics: [
    "Character analysis and development across genres",
    "Setting analysis and its relationship to theme and mood",
    "Narrative perspective and point of view analysis",
    "Figurative language identification and interpretation",
    "Poetic structure and form analysis",
    "Theme development and universal human experiences",
    "Symbolism and allegory in literary works",
    "Irony and its various forms and effects",
    "Conflict analysis: internal vs. external",
    "Tone and mood creation through literary techniques",
    "Cultural and historical context in literature",
    "Comparative analysis of literary works and techniques"
  ]
};

export default englishLiteratureAndComposition;
