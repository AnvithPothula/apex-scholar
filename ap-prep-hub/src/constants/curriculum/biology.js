// AP Biology curriculum data
const biology = {
  name: "AP Biology",
  description: "Study the core scientific principles, theories, and processes that govern living organisms and biological systems through inquiry-based investigations.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 60, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 6, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Evolution: The process of evolution drives the diversity and unity of life",
    "Cellular Processes: Biological systems utilize free energy and molecular building blocks to grow, reproduce, and maintain dynamic homeostasis",
    "Genetics and Information Transfer: Living systems store, retrieve, transmit, and respond to information essential to life processes",
    "Interactions: Biological systems interact, and these systems and their interactions possess complex properties"
  ],
  units: [
    {
      name: "Unit 1: Chemistry of Life",
      weight: "8-11%",
      topics: [
        "Structure of water and hydrogen bonding",
        "Elements of life",
        "Introduction to biological macromolecules",
        "Properties of biological macromolecules"
      ],
      keyConcepts: [
        "Water's polarity and hydrogen bonding properties",
        "Carbon as the backbone of organic molecules",
        "Functional groups and their properties",
        "Dehydration synthesis and hydrolysis reactions",
        "Structure-function relationships in macromolecules"
      ],
      essentialKnowledge: [
        "Water has many properties that are critical to maintaining life",
        "Organic molecules are composed of carbon and other elements",
        "The structure and function of polymers are derived from the way their monomers are assembled",
        "Biological macromolecules are composed of repeating subunits"
      ]
    },
    {
      name: "Unit 2: Cell Structure and Function",
      weight: "10-13%",
      topics: [
        "Cell structures and subcellular components",
        "Cell size and scale",
        "Compartmentalization",
        "Cell surface area-to-volume ratio",
        "Plasma membranes",
        "Membrane permeability",
        "Tonicity and osmoregulation"
      ],
      keyConcepts: [
        "Prokaryotic vs eukaryotic cell organization",
        "Organelle structure and function",
        "Membrane composition and properties",
        "Transport mechanisms across membranes",
        "Cell compartmentalization benefits"
      ],
      essentialKnowledge: [
        "Cell structures and their functions are highly conserved across organisms",
        "Cell membranes are selectively permeable barriers",
        "Membrane proteins facilitate transport and communication",
        "Cell size is limited by surface area to volume ratio"
      ]
    },
    {
      name: "Unit 3: Cellular Energetics",
      weight: "12-16%",
      topics: [
        "Enzyme structure and catalysis",
        "Environmental impacts on enzyme function",
        "Cellular energy",
        "Photosynthesis",
        "Cellular respiration",
        "Molecular diversity and cellular response to environmental changes"
      ],
      keyConcepts: [
        "ATP as the universal energy currency",
        "Enzyme kinetics and regulation",
        "Light-dependent and light-independent reactions",
        "Glycolysis, Krebs cycle, and electron transport",
        "Chemiosmosis and ATP synthesis",
        "Metabolic pathways and regulation"
      ],
      essentialKnowledge: [
        "Enzymes facilitate chemical reactions by lowering activation energy",
        "Energy-related pathways in biological systems are sequential and may be entered at multiple points",
        "Photosynthesis transforms light energy into chemical energy",
        "Cellular respiration harvests free energy from glucose"
      ]
    },
    {
      name: "Unit 4: Cell Communication and Cell Cycle",
      weight: "10-15%",
      topics: [
        "Cell communication",
        "Introduction to signal transduction",
        "Signal transduction pathways",
        "Cellular responses",
        "Feedback",
        "Cell cycle",
        "Regulation of cell cycle"
      ],
      keyConcepts: [
        "Reception, transduction, and response in signaling",
        "Second messenger systems",
        "Positive and negative feedback mechanisms",
        "Cell cycle checkpoints and regulation",
        "Mitosis and cytokinesis",
        "Cancer as cell cycle dysregulation"
      ],
      essentialKnowledge: [
        "Cell communication processes share common features",
        "Signal transduction pathways link signal reception with cellular response",
        "Cell cycle is a highly regulated process",
        "Disruptions to cell cycle regulation can result in cancer"
      ]
    },
    {
      name: "Unit 5: Heredity",
      weight: "8-11%",
      topics: [
        "Meiosis",
        "Mating systems and sexual selection",
        "Mendelian genetics",
        "Non-Mendelian genetics"
      ],
      keyConcepts: [
        "Sexual reproduction and genetic diversity",
        "Independent assortment and crossing over",
        "Inheritance patterns and probability",
        "Sex-linked traits and chromosomal inheritance",
        "Environmental effects on phenotype"
      ],
      essentialKnowledge: [
        "Meiosis ensures the transmission of traits from one generation to the next",
        "The chromosomal basis of inheritance provides an understanding of heredity",
        "The pattern of inheritance depends on how the trait is passed from parent to offspring",
        "Many traits are the product of environmental influences"
      ]
    },
    {
      name: "Unit 6: Gene Expression and Regulation",
      weight: "12-16%",
      topics: [
        "DNA and RNA structure",
        "Replication",
        "Transcription",
        "Translation",
        "Regulation of gene expression",
        "Gene expression and cell specialization",
        "Mutations"
      ],
      keyConcepts: [
        "Central dogma of molecular biology",
        "DNA replication mechanisms",
        "Transcription and RNA processing",
        "Translation and protein synthesis",
        "Gene regulation in prokaryotes and eukaryotes",
        "Epigenetic modifications",
        "Types and effects of mutations"
      ],
      essentialKnowledge: [
        "Gene expression is a regulated process",
        "A variety of intercellular and intracellular signal transmissions mediate gene expression",
        "The phenotype of an organism is determined by the interaction of the environment and the genotype",
        "Biological systems have multiple processes that increase genetic variation"
      ]
    },
    {
      name: "Unit 7: Natural Selection",
      weight: "13-20%",
      topics: [
        "Introduction to natural selection",
        "Natural selection",
        "Artificial selection",
        "Population genetics",
        "Hardy-Weinberg equilibrium",
        "Evidence of evolution"
      ],
      keyConcepts: [
        "Mechanisms of evolutionary change",
        "Genetic drift and gene flow",
        "Selection types and fitness",
        "Speciation and reproductive isolation",
        "Phylogenetic relationships",
        "Evidence from multiple sources"
      ],
      essentialKnowledge: [
        "Natural selection is a major mechanism of evolution",
        "Natural selection acts on phenotypic variations in populations",
        "Evolutionary change is also driven by random processes",
        "Biological evolution is supported by scientific evidence from many disciplines"
      ]
    },
    {
      name: "Unit 8: Ecology",
      weight: "10-15%",
      topics: [
        "Responses to the environment",
        "Energy flow through ecosystems",
        "Population ecology",
        "Community ecology",
        "Biodiversity"
      ],
      keyConcepts: [
        "Behavioral and physiological responses",
        "Trophic levels and energy transfer",
        "Population growth models",
        "Species interactions and community structure",
        "Succession and stability",
        "Human impact on ecosystems"
      ],
      essentialKnowledge: [
        "Interactions between organisms affect their survival and reproduction",
        "Organisms respond to changes in their environment through behavioral and physiological mechanisms",
        "Naturally occurring diversity among and between populations affects patterns of survival",
        "Distribution of ecosystems changes over time by both natural and human factors"
      ]
    }
  ],
  keySkills: [
    "Concept Explanation: Explain biological concepts, processes, and models presented in written format",
    "Visual Representations: Analyze visual representations of biological concepts and processes",
    "Questions and Methods: Determine scientific questions and methods",
    "Data Analysis: Represent and describe data",
    "Statistical Tests and Data Analysis: Perform statistical tests and mathematical calculations",
    "Argumentation: Develop and justify scientific arguments using evidence"
  ],
  studyTips: [
    "Focus on understanding processes rather than memorizing facts",
    "Practice drawing and interpreting biological diagrams and models",
    "Connect molecular processes to larger biological systems and themes",
    "Use data analysis and graphing skills regularly in practice",
    "Practice free response questions with clear, detailed explanations",
    "Review experimental design and scientific method principles",
    "Create concept maps to show relationships between topics",
    "Use active recall techniques and spaced repetition for vocabulary",
    "Practice with real AP exam questions and scoring guidelines",
    "Form study groups to discuss and explain concepts to others"
  ],
  commonTopics: [
    "Cell membrane structure and transport mechanisms",
    "Enzyme kinetics and metabolic regulation",
    "Photosynthesis and cellular respiration pathways",
    "DNA replication, transcription, and translation processes",
    "Cell division: mitosis and meiosis",
    "Mendelian and molecular genetics principles",
    "Population genetics and Hardy-Weinberg equilibrium",
    "Natural selection and evolutionary mechanisms",
    "Ecology and environmental interactions",
    "Signal transduction and cellular communication"
  ]
};

export default biology;
