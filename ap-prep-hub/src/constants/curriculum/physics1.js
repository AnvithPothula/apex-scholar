// AP Physics 1: Algebra-Based curriculum data
const physics1 = {
  name: "AP Physics 1: Algebra-Based",
  description: "Equivalent to a first-semester introductory college course in algebra-based physics. Covers Newtonian mechanics, work, energy, power, mechanical waves, and sound.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 50, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 5, time: "90 minutes", weight: "50%" }
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
      name: "Unit 1: Kinematics",
      weight: "10-16%",
      topics: [
        "Position, velocity, and acceleration",
        "Representations of motion",
        "Motion in one dimension",
        "Motion in two dimensions"
      ],
      keyConcepts: [
        "Position, displacement, velocity, and acceleration",
        "Kinematic equations for constant acceleration",
        "Graphical analysis of motion",
        "Vector components and projectile motion",
        "Relative motion",
        "Free fall and vertical motion"
      ],
      essentialKnowledge: [
        "Motion can be described using position, velocity, and acceleration",
        "Graphs provide useful representations of motion",
        "Kinematic equations apply to constant acceleration",
        "Projectile motion combines horizontal and vertical components",
        "Vectors are essential for describing motion in multiple dimensions"
      ]
    },
    {
      name: "Unit 2: Dynamics",
      weight: "12-18%",
      topics: [
        "Newton's first law and equilibrium",
        "Newton's second law",
        "Newton's third law",
        "Free body diagrams",
        "Applications of Newton's laws"
      ],
      keyConcepts: [
        "Newton's three laws of motion",
        "Free body diagrams and force analysis",
        "Net force and acceleration relationship",
        "Action-reaction pairs",
        "Static and kinetic friction",
        "Normal force and weight",
        "Tension and contact forces"
      ],
      essentialKnowledge: [
        "Forces cause changes in motion according to Newton's laws",
        "Free body diagrams help analyze force situations",
        "Net force determines acceleration direction and magnitude",
        "Forces always occur in action-reaction pairs",
        "Friction opposes relative motion between surfaces"
      ]
    },
    {
      name: "Unit 3: Circular Motion and Gravitation",
      weight: "6-14%",
      topics: [
        "Uniform circular motion",
        "Centripetal acceleration and force",
        "Newton's law of universal gravitation",
        "Gravitational field and acceleration"
      ],
      keyConcepts: [
        "Centripetal acceleration and force",
        "Period, frequency, and angular velocity",
        "Universal gravitation law",
        "Gravitational field strength",
        "Orbital motion principles",
        "Apparent weight and weightlessness"
      ],
      essentialKnowledge: [
        "Circular motion requires centripetal force toward the center",
        "Gravitational force follows an inverse square law",
        "Gravitational field describes gravitational interactions",
        "Orbital motion results from gravitational centripetal force",
        "Apparent weight depends on reference frame"
      ]
    },
    {
      name: "Unit 4: Energy",
      weight: "16-24%",
      topics: [
        "Work and kinetic energy",
        "Potential energy",
        "Conservation of energy",
        "Power",
        "Conservative and non-conservative forces"
      ],
      keyConcepts: [
        "Work-energy theorem",
        "Kinetic energy and its relationship to speed",
        "Gravitational and elastic potential energy",
        "Conservation of mechanical energy",
        "Power as rate of energy transfer",
        "Energy dissipation by friction",
        "Energy bar charts and representations"
      ],
      essentialKnowledge: [
        "Work changes the kinetic energy of objects",
        "Potential energy is stored energy due to position or configuration",
        "Total mechanical energy is conserved in absence of friction",
        "Power measures the rate of energy transfer",
        "Non-conservative forces dissipate mechanical energy"
      ]
    },
    {
      name: "Unit 5: Momentum",
      weight: "10-16%",
      topics: [
        "Momentum and impulse",
        "Conservation of momentum",
        "Collisions",
        "Center of mass"
      ],
      keyConcepts: [
        "Momentum as mass times velocity",
        "Impulse-momentum theorem",
        "Conservation of momentum in isolated systems",
        "Elastic and inelastic collisions",
        "Center of mass motion",
        "Explosion and separation problems"
      ],
      essentialKnowledge: [
        "Momentum is conserved in isolated systems",
        "Impulse equals change in momentum",
        "Collisions can be analyzed using conservation laws",
        "Center of mass moves as if all mass were concentrated there",
        "Internal forces don't change total momentum"
      ]
    },
    {
      name: "Unit 6: Simple Harmonic Motion",
      weight: "2-8%",
      topics: [
        "Simple harmonic motion",
        "Energy in simple harmonic motion",
        "Mass-spring systems",
        "Pendulum motion"
      ],
      keyConcepts: [
        "Restoring force proportional to displacement",
        "Period and frequency of oscillation",
        "Energy transformations in SHM",
        "Simple pendulum and mass-spring systems",
        "Amplitude, period, and frequency relationships"
      ],
      essentialKnowledge: [
        "Simple harmonic motion occurs when restoring force is proportional to displacement",
        "Energy oscillates between kinetic and potential forms",
        "Period depends on system properties, not amplitude",
        "Both pendulums and springs can exhibit SHM",
        "SHM can be described mathematically using sine and cosine functions"
      ]
    },
    {
      name: "Unit 7: Torque and Rotational Motion",
      weight: "10-16%",
      topics: [
        "Rotational kinematics",
        "Torque",
        "Rotational dynamics",
        "Angular momentum",
        "Rotational energy"
      ],
      keyConcepts: [
        "Angular position, velocity, and acceleration",
        "Torque as rotational force",
        "Moment of inertia",
        "Newton's second law for rotation",
        "Angular momentum and its conservation",
        "Rotational kinetic energy",
        "Rolling motion"
      ],
      essentialKnowledge: [
        "Rotational motion has analogies to linear motion",
        "Torque causes angular acceleration",
        "Moment of inertia depends on mass distribution",
        "Angular momentum is conserved in isolated systems",
        "Rolling combines translational and rotational motion"
      ]
    },
    {
      name: "Unit 8: Electric Charge and Electric Force",
      weight: "4-8%",
      topics: [
        "Electric charge",
        "Coulomb's law",
        "Electric field",
        "Electric field due to point charges"
      ],
      keyConcepts: [
        "Conservation of electric charge",
        "Coulomb's law for electric force",
        "Electric field as force per unit charge",
        "Superposition of electric fields",
        "Electric field lines and representations"
      ],
      essentialKnowledge: [
        "Electric charge is conserved and quantized",
        "Electric force follows an inverse square law",
        "Electric field describes the influence of charges on space",
        "Multiple charges create fields that superpose",
        "Field lines provide visual representations of electric fields"
      ]
    },
    {
      name: "Unit 9: DC Circuits",
      weight: "6-10%",
      topics: [
        "Electric current",
        "Resistance and Ohm's law",
        "Series and parallel circuits",
        "Circuit analysis"
      ],
      keyConcepts: [
        "Current as flow of charge",
        "Voltage, current, and resistance relationships",
        "Ohm's law applications",
        "Series and parallel circuit rules",
        "Power in electric circuits",
        "Kirchhoff's rules for circuit analysis"
      ],
      essentialKnowledge: [
        "Current flows from high to low electric potential",
        "Resistance opposes current flow",
        "Series circuits have same current; parallel circuits have same voltage",
        "Power dissipation depends on voltage and current",
        "Kirchhoff's rules enable analysis of complex circuits"
      ]
    },
    {
      name: "Unit 10: Mechanical Waves and Sound",
      weight: "12-16%",
      topics: [
        "Wave properties",
        "Wave equations",
        "Sound waves",
        "Interference and superposition",
        "Standing waves"
      ],
      keyConcepts: [
        "Wave speed, frequency, and wavelength relationship",
        "Transverse and longitudinal waves",
        "Wave interference and superposition",
        "Standing wave patterns and resonance",
        "Sound as pressure waves",
        "Doppler effect basics"
      ],
      essentialKnowledge: [
        "Waves transfer energy without transferring matter",
        "Wave speed depends on medium properties",
        "Interference can be constructive or destructive",
        "Standing waves form from interference of traveling waves",
        "Sound waves are longitudinal pressure waves"
      ]
    }
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
