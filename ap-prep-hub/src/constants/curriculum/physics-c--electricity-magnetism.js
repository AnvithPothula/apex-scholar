// AP Physics C: Electricity and Magnetism curriculum data
const physicsC_ElectricityMagnetism = {
  name: "AP Physics C: Electricity and Magnetism",
  description: "Equivalent to a semester of introductory calculus-based college-level physics. Covers electrostatics, conductors and capacitors, electric circuits, magnetic fields, and electromagnetic induction.",
  examFormat: {
    duration: "1 hour 30 minutes",
    sections: [
      { name: "Multiple Choice", questions: 35, time: "45 minutes", weight: "50%" },
      { name: "Free Response", questions: 3, time: "45 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Change: How do interactions affect the motion of single objects and systems of objects?",
    "Force Interactions: How do force interactions affect the motion of an object or system?",
    "Fields: How do fields predict and describe interactions?",
    "Conservation: How are conservation laws used to predict the motion of objects and systems?"
  ],
  // REVISED framework (CED, fall 2024). Five units became SIX, and they are
  // numbered 8-13 because AP Physics C now numbers Mechanics 1-7 and E&M 8-13
  // as one continuous sequence. Electrostatics was split into "Electric Charges,
  // Fields, and Gauss's Law" plus a standalone "Electric Potential".
  units: [
    { name: "Unit 8: Electric Charges, Fields, and Gauss's Law", weight: "15-25%", topics: ["Electric Fields of Charge Distributions", "Electric Charge and Electric Force", "Conservation of Electric Charge and the Process of Charging", "1.B", "Electric Flux"] },
    { name: "Unit 9: Electric Potential", weight: "10-20%", topics: ["Electric Potential Energy", "1.B", "Conservation of Electric Energy"] },
    { name: "Unit 10: Conductors and Capacitors", weight: "10-15%", topics: ["Capacitors", "Dielectrics"] },
    { name: "Unit 11: Electric Circuits", weight: "15-25%", topics: ["Resistance, Resistivity, and Ohm\u2019s Law", "Electric Power", "Compound Direct Current Circuits", "Kirchhoff\u2019s Loop Rule", "Kirchhoff\u2019s Junction Rule", "1.B"] },
    { name: "Unit 12: Magnetic Fields and Electromagnetism", weight: "10-20%", topics: ["Magnetic Fields", "1.B", "Magnetic Fields of Current-Carrying Wires and the Biot-Savart Law"] },
    { name: "Unit 13: Electromagnetic Induction", weight: "10-20%", topics: ["Magnetic Flux", "Electromagnetic Induction", "Induced Currents and Magnetic Forces", "1.C", "Circuits with Resistors and Inductors (LR Circuits)", "Circuits with Capacitors and Inductors (LC Circuits)"] }
  ],
  keySkills: [
    "Mathematical Modeling: Use vector calculus and differential equations",
    "Field Analysis: Analyze electric and magnetic field patterns",
    "Circuit Analysis: Apply Kirchhoff's laws to complex circuits",
    "Symmetry Arguments: Use symmetry to simplify field calculations",
    "Graphical Analysis: Interpret field lines and potential diagrams",
    "Experimental Skills: Design and analyze E&M experiments"
  ],
  studyTips: [
    "Master vector calculus - cross products, dot products, and gradients",
    "Practice using Gauss's law with symmetry arguments",
    "Understand the relationship between electric field and potential",
    "Learn to visualize field lines and equipotential surfaces",
    "Practice RC and RL circuit analysis with exponentials",
    "Understand right-hand rules for magnetic fields and forces",
    "Practice using Ampère's law with current distributions",
    "Connect Faraday's law to energy conservation principles",
    "Study Maxwell's equations as unifying framework",
    "Practice both analytical and numerical problem-solving"
  ],
  commonTopics: [
    "Electric field calculations using Gauss's law",
    "Potential and field relationships",
    "Capacitor energy and force calculations",
    "Complex circuit analysis with Kirchhoff's laws",
    "RC circuit transient analysis",
    "Magnetic force on moving charges",
    "Magnetic field calculations using Ampère's law",
    "Electromagnetic induction and Faraday's law",
    "RL circuit analysis",
    "Energy storage in electric and magnetic fields",
    "Motional EMF problems",
    "Combined electric and magnetic field problems"
  ]
};

export default physicsC_ElectricityMagnetism;
