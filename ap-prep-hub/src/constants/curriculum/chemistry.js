// AP Chemistry curriculum data
const chemistry = {
  name: "AP Chemistry",
  description: "Learn about the fundamental concepts of chemistry including atomic theory, chemical bonding, states of matter, intermolecular forces, chemical reactions, kinetics, thermodynamics, and equilibrium.",
  examFormat: {
    duration: "3 hours 15 minutes",
    sections: [
      { name: "Multiple Choice", questions: 60, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 7, time: "105 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Scale, Proportion, and Quantity: The mole allows chemists to count atoms and molecules via measurable quantities",
    "Structure and Properties: Properties of materials can be explained by the structure of atoms and molecules and the forces between them",
    "Transformations: Chemical and physical processes are driven by energetic factors and result in the formation of new products",
    "Energy: Changes in matter are accompanied by changes in energy, and energy changes can be used to understand and predict chemical behavior",
    "Kinetics: Rates of chemical reactions are determined by details of the molecular collisions and the pathway taken by the reaction",
    "Equilibrium: When a system is at equilibrium, all macroscopic properties are constant as a result of opposing processes occurring at equal rates"
  ],
  // REVISED framework (CED, fall 2024). Nine units became eight: Unit 2 is now
  // "Compound Structure and Properties", Unit 3 "Properties of Substances and
  // Mixtures", Unit 6 "Thermochemistry", and the old Unit 9 "Applications of
  // Thermodynamics" became "Thermodynamics and Electrochemistry".
  //
  // NOTE: an earlier pass deleted Unit 9 entirely, because the weighted
  // Course-at-a-Glance table only yielded eight units. The CED does list a
  // ninth. Restored from its topic pages.
  // REVISED framework (CED, fall 2024). Nine units became eight: Unit 2 is now
  // "Compound Structure and Properties", Unit 3 "Properties of Substances and
  // Mixtures", Unit 6 "Thermochemistry", and the old Unit 9 "Applications of
  // Thermodynamics" became "Thermodynamics and Electrochemistry".
  //
  // NOTE: an earlier pass deleted Unit 9 entirely, because the weighted
  // Course-at-a-Glance table only yielded eight units. The CED does list a
  // ninth. Restored from its topic pages.
  // REVISED framework (CED, fall 2024). Nine units became eight: Unit 2 is now
  // "Compound Structure and Properties", Unit 3 "Properties of Substances and
  // Mixtures", Unit 6 "Thermochemistry", and the old Unit 9 "Applications of
  // Thermodynamics" became "Thermodynamics and Electrochemistry".
  //
  // NOTE: an earlier pass deleted Unit 9 entirely, because the weighted
  // Course-at-a-Glance table only yielded eight units. The CED does list a
  // ninth. Restored from its topic pages.
  units: [
    { name: "Unit 1: Atomic Structure and Properties", weight: "7-9%", topics: ["Moles and molar mass", "Mass spectroscopy", "Electron configuration", "Photoelectron spectroscopy", "Periodic trends"] },
    { name: "Unit 2: Compound Structure and Properties", weight: "7-9%", topics: ["Types of chemical bonds", "Lewis diagrams and formal charge", "VSEPR and hybridization", "Resonance", "Bond polarity"] },
    { name: "Unit 3: Properties of Substances and Mixtures", weight: "7-9%", topics: ["Intermolecular forces", "Solids, liquids, and gases", "Ideal gas law and deviations", "Solutions and concentration", "Spectroscopy and photoelectric effect"] },
    { name: "Unit 4: Chemical Reactions", weight: "7-9%", topics: ["Net ionic equations", "Physical and chemical change", "Stoichiometry", "Titrations", "Types of reactions and redox"] },
    { name: "Unit 5: Kinetics", weight: "7-9%", topics: ["Reaction rates and rate laws", "Elementary reactions and collision model", "Reaction mechanisms", "Catalysis", "Arrhenius equation"] },
    { name: "Unit 6: Thermochemistry", weight: "7-9%", topics: ["Endothermic and exothermic processes", "Heat capacity and calorimetry", "Enthalpy of reaction", "Hess's law", "Bond enthalpies"] },
    { name: "Unit 7: Equilibrium", weight: "7-9%", topics: ["Reaction quotient and equilibrium constant", "ICE tables", "Le Chatelier's principle", "Solubility and Ksp", "Free energy and equilibrium"] },
    { name: "Unit 8: Acids and Bases", weight: "7-9%", topics: ["pH and pOH", "Strong and weak acids and bases", "Buffers and buffer capacity", "Acid-base titration curves", "Molecular structure and acid strength"] },
    { name: "Unit 9: Thermodynamics and Electrochemistry", weight: "7-9%", topics: ["Introduction to Entropy", "Absolute Entropy and Entropy Change", "Thermodynamic and Kinetic Control", "Free Energy and Equilibrium", "Free Energy of Dissolution", "Coupled Reactions", "Galvanic (Voltaic) and Electrolytic Cells", "Cell Potential and Free Energy", "Cell Potential Under Nonstandard Conditions", "Electrolysis and Faraday\u2019s Law"] }
  ],
  keySkills: [
    "Represent chemical phenomena using appropriate representations (particulate diagrams, equations, graphs)",
    "Use mathematics appropriately including significant figures, unit analysis, and algebraic manipulation",
    "Engage in scientific questioning to extend thinking or guide investigations",
    "Plan and implement data collection strategies appropriate to a particular scientific question",
    "Perform data analysis and evaluation of evidence including uncertainty and error",
    "Work with scientific explanations and theories",
    "Connect knowledge across scales, concepts and representations in and across domains"
  ],
  studyTips: [
    "Master stoichiometry early - it's fundamental to all quantitative chemistry",
    "Practice dimensional analysis and unit conversions systematically",
    "Understand the particulate nature of matter and draw molecular-level diagrams",
    "Connect macroscopic observations to molecular behavior and explanations",
    "Use multiple representations (graphs, equations, diagrams) for the same concept",
    "Practice laboratory calculations and error analysis regularly",
    "Memorize key formulas, constants, and polyatomic ions",
    "Work through equilibrium problems using ICE tables",
    "Practice free response questions with clear explanations and proper units",
    "Use dimensional analysis to check the reasonableness of calculated answers"
  ],
  commonTopics: [
    "Stoichiometry and limiting reagent calculations",
    "Atomic structure and periodic trends",
    "Chemical bonding and molecular geometry",
    "Intermolecular forces and phase behavior",
    "Gas laws and kinetic molecular theory",
    "Solution chemistry and colligative properties",
    "Chemical kinetics and rate laws",
    "Thermodynamics and enthalpy calculations",
    "Chemical equilibrium and Le Chatelier's principle",
    "Acid-base chemistry and buffer systems",
    "Electrochemistry and redox reactions"
  ]
};

export default chemistry;
