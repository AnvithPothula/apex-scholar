// AP Physics 2: Algebra-Based curriculum data
const physics2 = {
  name: "AP Physics 2: Algebra-Based",
  description: "Equivalent to a second-semester introductory college course in algebra-based physics. Covers fluid statics and dynamics, thermodynamics, electricity and magnetism, optics, and atomic and nuclear physics.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 50, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 4, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Objects and systems have properties such as mass and charge. Systems may have internal structure.",
    "Fields existing in space can be used to explain interactions.",
    "The interactions of an object with other objects can be described by forces.",
    "Interactions between systems can result in changes in those systems.",
    "Changes that occur as a result of interactions are constrained by conservation laws.",
    "Waves can transfer energy and momentum from one location to another without the permanent transfer of mass.",
    "The mathematics of probability can be used to describe the behavior of complex systems."
  ],
  units: [
    {
      name: "Unit 1: Fluids",
      weight: "10-14%",
      topics: [
        "Pressure and Pascal's principle",
        "Buoyancy and Archimedes' principle",
        "Fluid dynamics and Bernoulli's equation",
        "Fluid flow and viscosity"
      ],
      keyConcepts: [
        "Pressure in fluids and atmospheric pressure",
        "Pascal's principle and hydraulic systems",
        "Buoyant force and floating conditions",
        "Archimedes' principle applications",
        "Fluid flow: laminar and turbulent",
        "Bernoulli's equation and applications",
        "Viscosity and Poiseuille's law"
      ],
      essentialKnowledge: [
        "Pressure increases with depth in fluids",
        "Buoyant force equals weight of displaced fluid",
        "Fluid speed increases where pressure decreases",
        "Viscosity causes energy loss in fluid flow",
        "Conservation laws apply to fluid systems"
      ]
    },
    {
      name: "Unit 2: Thermodynamics",
      weight: "18-22%",
      topics: [
        "Temperature and thermal equilibrium",
        "Ideal gas law",
        "Kinetic theory of gases",
        "Laws of thermodynamics",
        "Heat engines and refrigerators"
      ],
      keyConcepts: [
        "Temperature scales and thermal equilibrium",
        "Ideal gas law and gas processes",
        "Kinetic theory and molecular motion",
        "Internal energy and heat transfer",
        "First law of thermodynamics",
        "Second law and entropy",
        "Heat engines and efficiency",
        "Carnot cycle and theoretical limits"
      ],
      essentialKnowledge: [
        "Temperature is a measure of average kinetic energy",
        "Ideal gas behavior follows PV = nRT",
        "Energy is conserved in all processes",
        "Entropy of isolated systems increases",
        "Heat engines convert thermal energy to work"
      ]
    },
    {
      name: "Unit 3: Electric Force, Field, and Potential",
      weight: "18-22%",
      topics: [
        "Electric charge and Coulomb's law",
        "Electric field",
        "Electric potential and potential energy",
        "Capacitors and capacitance"
      ],
      keyConcepts: [
        "Conservation of electric charge",
        "Coulomb's law and superposition",
        "Electric field and field lines",
        "Electric potential and potential difference",
        "Relationship between field and potential",
        "Capacitance and energy storage",
        "Dielectrics and capacitor behavior"
      ],
      essentialKnowledge: [
        "Electric force follows inverse square law",
        "Electric field is force per unit charge",
        "Electric potential is potential energy per unit charge",
        "Capacitors store electrical energy",
        "Work is done moving charges in electric fields"
      ]
    },
    {
      name: "Unit 4: Electric Circuits",
      weight: "14-18%",
      topics: [
        "Current and resistance",
        "DC circuit analysis",
        "RC circuits",
        "Electrical power"
      ],
      keyConcepts: [
        "Current as charge flow",
        "Ohm's law and resistance",
        "Series and parallel circuits",
        "Kirchhoff's voltage and current laws",
        "RC circuit charging and discharging",
        "Time constants in RC circuits",
        "Power dissipation in circuits"
      ],
      essentialKnowledge: [
        "Current flows from high to low potential",
        "Resistance opposes current flow",
        "Kirchhoff's laws enable circuit analysis",
        "RC circuits exhibit exponential behavior",
        "Power equals current times voltage"
      ]
    },
    {
      name: "Unit 5: Magnetism and Electromagnetic Induction",
      weight: "14-18%",
      topics: [
        "Magnetic fields and forces",
        "Magnetic field of currents",
        "Electromagnetic induction",
        "Inductance"
      ],
      keyConcepts: [
        "Magnetic force on moving charges",
        "Magnetic force on current-carrying wires",
        "Magnetic field patterns and sources",
        "Faraday's law of electromagnetic induction",
        "Lenz's law and induced EMF",
        "Self-inductance and mutual inductance",
        "Energy stored in magnetic fields"
      ],
      essentialKnowledge: [
        "Moving charges experience magnetic forces",
        "Current-carrying wires create magnetic fields",
        "Changing magnetic flux induces EMF",
        "Induced currents oppose flux changes",
        "Inductors store magnetic energy"
      ]
    },
    {
      name: "Unit 6: Geometric and Physical Optics",
      weight: "12-16%",
      topics: [
        "Reflection and refraction",
        "Mirrors and lenses",
        "Wave nature of light",
        "Interference and diffraction"
      ],
      keyConcepts: [
        "Law of reflection and Snell's law",
        "Mirror and lens equations",
        "Image formation and ray tracing",
        "Light as electromagnetic waves",
        "Double-slit interference",
        "Single-slit diffraction",
        "Polarization of light"
      ],
      essentialKnowledge: [
        "Light follows predictable paths in reflection and refraction",
        "Mirrors and lenses form images according to geometric rules",
        "Light exhibits wave properties in interference and diffraction",
        "Light can be polarized",
        "Wave and geometric optics complement each other"
      ]
    },
    {
      name: "Unit 7: Quantum, Atomic, and Nuclear Physics",
      weight: "8-12%",
      topics: [
        "Photons and photoelectric effect",
        "Atomic structure and spectra",
        "Nuclear structure and decay",
        "Mass-energy equivalence"
      ],
      keyConcepts: [
        "Photon energy and momentum",
        "Photoelectric effect and work function",
        "Atomic energy levels and spectra",
        "Nuclear composition and binding energy",
        "Radioactive decay processes",
        "Half-life and decay constants",
        "Mass-energy equivalence (E = mc²)"
      ],
      essentialKnowledge: [
        "Light exhibits particle properties in photoelectric effect",
        "Atoms have discrete energy levels",
        "Nuclear forces bind protons and neutrons",
        "Radioactive decay is probabilistic",
        "Mass and energy are equivalent"
      ]
    }
  ],
  keySkills: [
    "Visual Representation: Create and analyze graphs, diagrams, and models",
    "Question Formulation: Formulate scientific questions and hypotheses",
    "Data Analysis: Analyze and interpret experimental data",
    "Mathematical Modeling: Use mathematics to model physical phenomena",
    "Argumentation: Make claims supported by evidence and reasoning",
    "Experimental Design: Design and conduct physics investigations"
  ],
  studyTips: [
    "Connect concepts across different units - many principles repeat",
    "Practice using calculus concepts even though course is algebra-based",
    "Master conservation laws - they appear throughout the course",
    "Understand the relationship between fields and forces",
    "Practice ray diagrams for optics problems",
    "Learn to interpret graphs of exponential processes",
    "Study the historical development of quantum mechanics",
    "Connect macroscopic and microscopic perspectives",
    "Practice dimensional analysis for complex equations",
    "Focus on conceptual understanding of abstract topics"
  ],
  commonTopics: [
    "Fluid pressure and buoyancy calculations",
    "Thermodynamic processes and efficiency",
    "Electric field and potential problems",
    "Circuit analysis with Kirchhoff's laws",
    "RC circuit time constant calculations",
    "Magnetic force and field problems",
    "Electromagnetic induction applications",
    "Optics: reflection, refraction, and image formation",
    "Wave interference and diffraction patterns",
    "Photoelectric effect calculations",
    "Nuclear decay and half-life problems",
    "Energy conservation in various systems"
  ]
};

export default physics2;
