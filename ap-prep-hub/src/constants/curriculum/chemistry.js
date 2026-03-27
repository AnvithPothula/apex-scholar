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
  units: [
    {
      name: "Unit 1: Atomic Structure and Properties",
      weight: "7-9%",
      topics: [
        "Moles and molar mass",
        "Mass spectroscopy of elements",
        "Elemental composition of pure substances",
        "Composition of mixtures",
        "Atomic structure and electron configuration",
        "Photoelectron spectroscopy",
        "Periodic trends",
        "Valence electrons and ionic compounds"
      ],
      keyConcepts: [
        "Mole concept and Avogadro's number",
        "Atomic structure: protons, neutrons, electrons",
        "Electron configuration and orbital diagrams",
        "Periodic trends: atomic radius, ionization energy, electronegativity",
        "Mass spectrometry interpretation",
        "Photoelectron spectroscopy analysis"
      ],
      essentialKnowledge: [
        "The mole allows calculation of the number of particles in a sample",
        "Mass spectra provide information about isotopic composition and molecular structure",
        "Electrons in atoms occupy specific energy levels and sublevels",
        "Periodic trends can be explained by effective nuclear charge and electron configuration",
        "Photoelectron spectroscopy provides evidence for electron shell structure"
      ]
    },
    {
      name: "Unit 2: Molecular and Ionic Compound Structure and Properties",
      weight: "7-9%",
      topics: [
        "Types of chemical bonds",
        "Intramolecular force and potential energy",
        "Structure of ionic solids",
        "Structure of metals and alloys",
        "Lewis diagrams",
        "Resonance and formal charge",
        "VSEPR and bond hybridization"
      ],
      keyConcepts: [
        "Ionic, covalent, and metallic bonding",
        "Lewis structures and formal charge",
        "Resonance structures and electron delocalization",
        "VSEPR theory and molecular geometry",
        "Hybridization and orbital overlap",
        "Bond strength and bond length relationships"
      ],
      essentialKnowledge: [
        "Chemical bonds form to minimize the energy of the system",
        "Lewis structures represent covalent bonding in molecules",
        "VSEPR theory predicts molecular shapes based on electron pair repulsion",
        "Resonance structures show electron delocalization",
        "Hybridization explains molecular geometry and bonding"
      ]
    },
    {
      name: "Unit 3: Intermolecular Forces and Properties",
      weight: "18-22%",
      topics: [
        "Intermolecular forces",
        "Properties of solids",
        "Solids, liquids, and gases",
        "Ideal gas law",
        "Kinetic molecular theory",
        "Deviation from ideal gas law",
        "Solutions and mixtures",
        "Representations of solutions",
        "Separation of solutions and mixtures chromatography",
        "Solubility",
        "Spectroscopy and the electromagnetic spectrum",
        "Photoelectric effect",
        "Beer-Lambert law"
      ],
      keyConcepts: [
        "London dispersion forces, dipole-dipole forces, hydrogen bonding",
        "Phase diagrams and phase transitions",
        "Gas laws and kinetic molecular theory",
        "Real gas behavior and van der Waals equation",
        "Solution formation and concentration units",
        "Colligative properties",
        "Spectroscopy and molecular identification"
      ],
      essentialKnowledge: [
        "Intermolecular forces determine physical properties of substances",
        "Gas behavior can be explained by kinetic molecular theory",
        "Solutions form when intermolecular forces between solute and solvent are favorable",
        "Spectroscopy provides information about molecular structure and energy levels",
        "Phase changes involve breaking and forming intermolecular forces"
      ]
    },
    {
      name: "Unit 4: Chemical Reactions",
      weight: "7-9%",
      topics: [
        "Introduction for reactions",
        "Net ionic equations",
        "Representations of reactions",
        "Physical and chemical changes",
        "Stoichiometry",
        "Introduction to titration",
        "Types of chemical reactions",
        "Introduction to acid-base reactions",
        "Oxidation-reduction (redox) reactions"
      ],
      keyConcepts: [
        "Balancing chemical equations",
        "Stoichiometric calculations",
        "Limiting reagents and percent yield",
        "Net ionic equations",
        "Acid-base, precipitation, and redox reactions",
        "Titration procedures and calculations"
      ],
      essentialKnowledge: [
        "Chemical equations represent the rearrangement of atoms in reactions",
        "Stoichiometry allows quantitative predictions about chemical reactions",
        "Net ionic equations focus on the species that actually react",
        "Different types of reactions follow predictable patterns",
        "Titrations provide quantitative analysis of solution concentrations"
      ]
    },
    {
      name: "Unit 5: Kinetics",
      weight: "7-9%",
      topics: [
        "Reaction rates",
        "Introduction to rate law",
        "Concentration changes over time",
        "Elementary reactions",
        "Collision model",
        "Reaction energy profile",
        "Introduction to reaction mechanisms",
        "Multistep reaction energy profile",
        "Catalysis"
      ],
      keyConcepts: [
        "Rate laws and reaction order",
        "Integrated rate laws and half-life",
        "Activation energy and transition states",
        "Reaction mechanisms and elementary steps",
        "Catalysis and reaction pathways",
        "Temperature effects on reaction rates"
      ],
      essentialKnowledge: [
        "Reaction rates depend on concentration, temperature, and catalysts",
        "Rate laws must be determined experimentally",
        "Activation energy is the minimum energy required for reaction",
        "Catalysts lower activation energy without being consumed",
        "Reaction mechanisms explain how reactions occur at the molecular level"
      ]
    },
    {
      name: "Unit 6: Thermodynamics",
      weight: "7-9%",
      topics: [
        "Endothermic and exothermic processes",
        "Heat transfer and thermal equilibrium",
        "Heat capacity and calorimetry",
        "Energy of phase changes",
        "Introduction to enthalpy of reaction",
        "Enthalpy of formation",
        "Hess's law"
      ],
      keyConcepts: [
        "First law of thermodynamics",
        "Enthalpy and enthalpy changes",
        "Calorimetry and heat measurement",
        "Hess's law and enthalpy calculations",
        "Bond enthalpies and reaction energetics",
        "Phase change energetics"
      ],
      essentialKnowledge: [
        "Energy is conserved in chemical processes",
        "Enthalpy changes can be measured and calculated",
        "Hess's law allows calculation of enthalpy changes for complex reactions",
        "Bond breaking requires energy while bond forming releases energy",
        "Calorimetry allows experimental determination of enthalpy changes"
      ]
    },
    {
      name: "Unit 7: Equilibrium",
      weight: "7-9%",
      topics: [
        "Introduction to equilibrium",
        "Direction of reversible reactions",
        "Reaction quotient and equilibrium constant",
        "Calculating equilibrium concentrations",
        "Magnitude of the equilibrium constant",
        "Properties of the equilibrium constant",
        "Calculating equilibrium concentrations from the equilibrium constant",
        "Representation of equilibrium",
        "Introduction to Le Chatelier's principle",
        "Introduction to solubility equilibria",
        "pH and solubility",
        "Free energy of dissolution"
      ],
      keyConcepts: [
        "Dynamic equilibrium and equilibrium constants",
        "Reaction quotient and predicting reaction direction",
        "Le Chatelier's principle and stress effects",
        "Solubility product and precipitation",
        "Common ion effect",
        "Equilibrium calculations and ICE tables"
      ],
      essentialKnowledge: [
        "At equilibrium, forward and reverse reaction rates are equal",
        "Equilibrium constants are temperature-dependent",
        "Le Chatelier's principle predicts equilibrium shifts",
        "Solubility equilibria govern precipitation and dissolution",
        "Equilibrium calculations use ICE table methodology"
      ]
    },
    {
      name: "Unit 8: Acids and Bases",
      weight: "11-15%",
      topics: [
        "Introduction to acids and bases",
        "pH and pOH of strong acids and bases",
        "Weak acid and base equilibria",
        "Acid-base reactions and buffers",
        "Acid-base titrations",
        "Molecular structure of acids and bases",
        "pH and pKa",
        "Properties of buffers"
      ],
      keyConcepts: [
        "Arrhenius, Brønsted-Lowry, and Lewis acid-base theories",
        "pH scale and pH calculations",
        "Weak acid and base equilibria",
        "Buffer systems and Henderson-Hasselbalch equation",
        "Titration curves and indicators",
        "Polyprotic acids and stepwise ionization"
      ],
      essentialKnowledge: [
        "Acids and bases can be defined in multiple ways",
        "pH quantifies the acidity of aqueous solutions",
        "Weak acids and bases establish equilibrium in solution",
        "Buffers resist pH changes through equilibrium shifts",
        "Titration curves show pH changes during acid-base reactions"
      ]
    },
    {
      name: "Unit 9: Applications of Thermodynamics",
      weight: "7-9%",
      topics: [
        "Entropy",
        "Gibbs free energy and thermodynamic favorability",
        "Thermodynamic and kinetic control",
        "Free energy and equilibrium",
        "Coupled reactions",
        "Galvanic (voltaic) and electrolytic cells",
        "Cell potential and free energy",
        "Cell potential under nonstandard conditions",
        "Electrolysis and Faraday's law"
      ],
      keyConcepts: [
        "Entropy and the second law of thermodynamics",
        "Gibbs free energy and spontaneity",
        "Relationship between ΔG, K, and cell potential",
        "Electrochemical cells and redox reactions",
        "Nernst equation and concentration effects",
        "Electrolysis and Faraday's laws"
      ],
      essentialKnowledge: [
        "Entropy measures the dispersal of matter and energy",
        "Gibbs free energy determines reaction spontaneity",
        "Electrochemical cells convert chemical energy to electrical energy",
        "Cell potentials are related to free energy changes",
        "Electrolysis uses electrical energy to drive nonspontaneous reactions"
      ]
    }
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
