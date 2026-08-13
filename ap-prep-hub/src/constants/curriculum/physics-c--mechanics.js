// AP Physics C: Mechanics curriculum data
const physicsC_Mechanics = {
  name: "AP Physics C: Mechanics",
  description: "Equivalent to a semester of introductory calculus-based college-level physics. Covers Newtonian mechanics including kinematics, dynamics, energy, momentum, rotation, oscillations, and gravitation.",
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
  // REVISED framework (CED, fall 2024). Units were renamed and re-scoped to
  // mirror AP Physics 1: "Newton's Laws of Motion" -> "Force and Translational
  // Dynamics", "Systems of Particles and Linear Momentum" -> "Linear Momentum",
  // "Rotation" split into Torque and Rotational Dynamics plus Energy and
  // Momentum of Rotating Systems, and standalone "Gravitation" folded in.
  units: [
    { name: "Unit 1: Kinematics", weight: "10-15%", topics: ["Reference Frames and Relative Motion", "Scalars and Vectors", "Displacement, Velocity, and Acceleration", "Representing Motion", "Motion in Two or Three Dimensions"] },
    { name: "Unit 2: Force and Translational Dynamics", weight: "20-25%", topics: ["Systems and Center of Mass", "Forces and Free-Body Diagrams", "Newton\u2019s Third Law", "Newton\u2019s First Law", "Newton\u2019s Second Law", "1.C", "1.B", "Resistive Forces", "Circular Motion"] },
    { name: "Unit 3: Work, Energy, and Power", weight: "15-25%", topics: ["Translational Kinetic Energy", "Work", "1.C", "Conservation of Energy", "Power"] },
    { name: "Unit 4: Linear Momentum", weight: "10-20%", topics: ["Linear Momentum", "Change in Momentum and Impulse", "1.B", "Elastic and Inelastic Collisions"] },
    { name: "Unit 5: Torque and Rotational Dynamics", weight: "10-15%", topics: ["Rotational Kinematics", "Connecting Linear and Rotational Motion", "Torque", "Rotational Inertia", "Rotational Equilibrium and Newton\u2019s First Law in Rotational Form", "1.B"] },
    { name: "Unit 6: Energy and Momentum of Rotating Systems", weight: "10-15%", topics: ["Rotational Kinetic Energy", "Torque and Work", "Angular Momentum and Angular Impulse", "Conservation of Angular Momentum", "1.B", "Motion of Orbiting Satellites"] },
    { name: "Unit 7: Oscillations", weight: "10-15%", topics: ["Defining Simple Harmonic Motion (SHM)", "Frequency and Period of SHM", "1.C", "Energy of Simple Harmonic Oscillators", "Simple and Physical Pendulums"] }
  ],
  keySkills: [
    "Mathematical Modeling: Use calculus to model physical phenomena",
    "Problem Solving: Apply mathematical methods to solve complex physics problems",
    "Experimental Design: Design and analyze mechanics experiments",
    "Data Analysis: Interpret experimental data and uncertainties",
    "Conceptual Reasoning: Connect mathematical formalism to physical concepts",
    "Communication: Express physics concepts clearly with mathematical precision"
  ],
  studyTips: [
    "Master calculus thoroughly - derivatives and integrals are essential",
    "Practice setting up and solving differential equations",
    "Learn to recognize when to use energy vs. force methods",
    "Understand vector calculus and cross products",
    "Practice complex problem-solving with multiple concepts",
    "Connect mathematical results to physical intuition",
    "Study conservation laws deeply - they're powerful tools",
    "Practice deriving formulas from first principles",
    "Work on both analytical and numerical problem-solving",
    "Understand the relationship between calculus and physics concepts"
  ],
  commonTopics: [
    "Kinematics with calculus and parametric equations",
    "Variable force problems using F = ma",
    "Work calculations with line integrals",
    "Energy conservation in complex systems",
    "Momentum conservation in collisions",
    "Center of mass calculations",
    "Rotational dynamics with moment of inertia",
    "Angular momentum conservation",
    "Simple harmonic motion differential equations",
    "Orbital mechanics and Kepler's laws",
    "Rolling motion analysis",
    "Oscillation problems with energy methods"
  ]
};

export default physicsC_Mechanics;
