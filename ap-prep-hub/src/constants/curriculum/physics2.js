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
  // REVISED framework (CED, fall 2024). Units are numbered 9-15: AP Physics 1
  // now owns Units 1-8, and FLUIDS MOVED to Physics 1, so it is gone from here.
  // Optics split into Geometric Optics and Waves/Sound/Physical Optics, and
  // "Quantum, Atomic, and Nuclear Physics" became "Modern Physics". The old
  // seven-unit list starting at Fluids no longer matches either exam.
  units: [
    { name: "Unit 9: Thermodynamics", weight: "15-18%", topics: ["The Ideal Gas Law", "Thermal Energy Transfer and Equilibrium", "1.C", "Specific Heat and Thermal Conductivity", "Entropy and the Second Law of Thermodynamics"] },
    { name: "Unit 10: Electric Force, Field, and Potential", weight: "15-18%", topics: ["Conservation of Electric Charge and the Process of Charging", "Electric Potential Energy", "Electric Potential", "Capacitors", "Conservation of Electric Energy"] },
    { name: "Unit 11: Electric Circuits", weight: "15-18%", topics: ["Electric Current", "Simple Circuits", "Resistance, Resistivity, and Ohm\u2019s Law", "Electric Power", "Kirchhoff\u2019s Loop Rule", "Kirchhoff\u2019s Junction Rule", "Resistor-Capacitor (RC) Circuits"] },
    { name: "Unit 12: Magnetism and Electromagnetism", weight: "12-15%", topics: ["Magnetic Fields", "1.B", "1.C"] },
    { name: "Unit 13: Geometric Optics", weight: "12-15%", topics: ["Reflection", "Images Formed by Mirrors", "Refraction", "Images Formed by Lenses"] },
    { name: "Unit 14: Waves, Sound, and Physical Optics", weight: "12-15%", topics: ["The Doppler Effect", "Properties of Wave Pulses and Waves", "Periodic Waves", "Boundary Behavior of Waves and Polarization", "Electromagnetic Waves", "1.B", "Diffraction", "Double-Slit Interference and Diffraction Gratings", "Thin-Film Interference"] },
    { name: "Unit 15: Modern Physics", weight: "12-15%", topics: ["Quantum Theory and Wave-Particle Duality", "The Bohr Model of Atomic Structure", "Emission and Absorption Spectra", "Blackbody Radiation", "The Photoelectric Effect", "Compton Scattering", "Fission, Fusion, and Nuclear Decay", "Types of Radioactive Decay"] }
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
