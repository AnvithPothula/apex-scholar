// AP Physics 1: Algebra-Based curriculum data
const physics1 = {
  name: "AP Physics 1: Algebra-Based",
  description: "Equivalent to a first-semester introductory college course in algebra-based physics. Covers Newtonian mechanics, work, energy, power, mechanical waves, and sound.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 42, time: "85 minutes", weight: "50%" },
      { name: "Free Response", questions: 4, time: "95 minutes", weight: "50%" }
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
  // REVISED framework (CED, fall 2024 onward). The old ten-unit list this
  // replaced still contained Electric Charge and Electric Force, DC Circuits and
  // Mechanical Waves and Sound — all REMOVED from AP Physics 1. Students were
  // being pointed at three units of material that is no longer on the exam,
  // while Fluids and the rotational-energy unit were missing entirely.
  // Weightings are the CED's published ranges.
  units: [
    { name: "Unit 1: Kinematics", weight: "10-15%", topics: ["Scalars and Vectors in One Dimension", "Displacement, Velocity, and Acceleration", "Representing Motion", "Reference Frames and Relative Motion", "1.B"] },
    { name: "Unit 2: Force and Translational Dynamics", weight: "18-23%", topics: ["Systems and Center of Mass", "Forces and Free-Body Diagrams", "Newton\u2019s Third Law", "Newton\u2019s First Law", "Newton\u2019s Second Law", "Gravitational Force", "1.C", "Spring Forces", "Circular Motion"] },
    { name: "Unit 3: Work, Energy, and Power", weight: "18-23%", topics: ["Translational Kinetic Energy", "Work", "1.C", "1.B"] },
    { name: "Unit 4: Linear Momentum", weight: "10-15%", topics: ["Linear Momentum", "1.B", "1.B"] },
    { name: "Unit 5: Torque and Rotational Dynamics", weight: "10-15%", topics: ["Rotational Kinematics", "Connecting Linear and Rotational Motion", "Torque", "1.B", "Rotational Equilibrium and Newton\u2019s First Law in Rotational Form", "Newton\u2019s Second Law in Rotational Form"] },
    { name: "Unit 6: Energy and Momentum of Rotating Systems", weight: "5-8%", topics: ["Rotational Kinetic Energy", "Torque and Work", "1.B", "Conservation of Angular Momentum", "Rolling", "Motion of Orbiting Satellites"] },
    { name: "Unit 7: Oscillations", weight: "5-8%", topics: ["Defining Simple Harmonic Motion (SHM)", "1.B", "Representing and Analyzing SHM", "Energy of Simple Harmonic Oscillators"] },
    { name: "Unit 8: Fluids", weight: "10-15%", topics: ["Internal Structure and Density", "1.C", "Fluids and Newton\u2019s Laws", "1.B"] }
  ],
  keySkills: [
    "Visual Representation: Create and analyze graphs, diagrams, and models",
    "Question Formulation: Formulate scientific questions and hypotheses",
    "Data Analysis: Analyze and interpret data from experiments",
    "Mathematical Modeling: Use mathematics to model physical phenomena",
    "Argumentation: Make claims supported by evidence and reasoning",
    "Experimental Design: Design and conduct physics investigations"
  ],
  studyTips: [
    "Master free body diagrams - they're essential for force problems",
    "Practice drawing and interpreting graphs of motion",
    "Learn to identify the physics principles in word problems",
    "Work on dimensional analysis and unit conversions",
    "Practice setting up and solving systems of equations",
    "Understand energy and momentum conservation deeply",
    "Connect mathematical relationships to physical concepts",
    "Practice laboratory skills and data analysis",
    "Use vector components for two-dimensional problems",
    "Focus on conceptual understanding, not just memorization"
  ],
  commonTopics: [
    "Kinematic equations and motion graphs",
    "Free body diagrams and Newton's laws",
    "Circular motion and centripetal force",
    "Work-energy theorem applications",
    "Conservation of momentum in collisions",
    "Simple harmonic motion analysis",
    "Torque and rotational equilibrium",
    "Electric force and field calculations",
    "Circuit analysis using Ohm's law",
    "Wave properties and interference",
    "Energy conservation in various systems",
    "Force analysis in complex situations"
  ]
};

export default physics1;
