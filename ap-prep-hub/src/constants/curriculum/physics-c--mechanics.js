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
  units: [
    {
      name: "Unit 1: Kinematics",
      weight: "10-18%",
      topics: [
        "Motion in one dimension",
        "Motion in two dimensions",
        "Parametric equations",
        "Vector calculus"
      ],
      keyConcepts: [
        "Position, velocity, and acceleration vectors",
        "Derivatives and integrals in kinematics",
        "Parametric representation of motion",
        "Projectile motion with calculus",
        "Relative motion in multiple dimensions",
        "Curvilinear motion and path-dependent quantities"
      ],
      essentialKnowledge: [
        "Velocity is the derivative of position with respect to time",
        "Acceleration is the derivative of velocity with respect to time",
        "Calculus enables analysis of complex motion patterns",
        "Vector components must be treated independently",
        "Integration allows determination of motion from acceleration"
      ]
    },
    {
      name: "Unit 2: Newton's Laws of Motion",
      weight: "10-18%",
      topics: [
        "Newton's first law and inertial frames",
        "Newton's second law with calculus",
        "Newton's third law",
        "Applications with variable forces",
        "Drag forces and terminal velocity"
      ],
      keyConcepts: [
        "Inertial reference frames",
        "F = ma with time-dependent forces",
        "F = dp/dt for variable mass systems",
        "Action-reaction pairs in complex systems",
        "Differential equations of motion",
        "Air resistance and drag coefficients"
      ],
      essentialKnowledge: [
        "Newton's laws apply in inertial reference frames",
        "Calculus is essential for variable force problems",
        "Momentum formulation handles variable mass",
        "Drag forces depend on velocity and create differential equations",
        "Complex force analysis requires vector methods"
      ]
    },
    {
      name: "Unit 3: Work, Energy, and Power",
      weight: "14-20%",
      topics: [
        "Work done by variable forces",
        "Kinetic energy and work-energy theorem",
        "Potential energy and conservative forces",
        "Conservation of energy",
        "Power calculations"
      ],
      keyConcepts: [
        "Work as line integral: W = ∫F⃗·dr⃗",
        "Work-energy theorem with calculus",
        "Conservative forces and path independence",
        "Potential energy functions U(x)",
        "Mechanical energy conservation",
        "Power as P = F⃗·v⃗",
        "Energy methods for solving dynamics problems"
      ],
      essentialKnowledge: [
        "Work requires integration for variable forces",
        "Conservative forces have associated potential energies",
        "Total mechanical energy is conserved for conservative systems",
        "Energy methods often simplify dynamics problems",
        "Power relates force, velocity, and energy transfer rate"
      ]
    },
    {
      name: "Unit 4: Systems of Particles and Linear Momentum",
      weight: "12-20%",
      topics: [
        "Center of mass",
        "Impulse and momentum",
        "Conservation of momentum",
        "Collisions and explosions",
        "Variable mass systems"
      ],
      keyConcepts: [
        "Center of mass calculations with calculus",
        "Impulse-momentum theorem: J⃗ = ∫F⃗dt = Δp⃗",
        "Conservation of momentum in isolated systems",
        "Elastic and inelastic collision analysis",
        "Rocket propulsion and variable mass",
        "Internal forces and external forces"
      ],
      essentialKnowledge: [
        "Center of mass motion follows Newton's second law",
        "Momentum is conserved when net external force is zero",
        "Impulse equals change in momentum",
        "Collision analysis uses conservation laws",
        "Variable mass systems require careful force analysis"
      ]
    },
    {
      name: "Unit 5: Rotation",
      weight: "12-20%",
      topics: [
        "Rotational kinematics",
        "Rotational dynamics and torque",
        "Angular momentum",
        "Rolling motion",
        "Rotational energy"
      ],
      keyConcepts: [
        "Angular position, velocity, and acceleration",
        "Moment of inertia calculations",
        "Torque and angular acceleration: τ = Iα",
        "Angular momentum: L⃗ = Iω⃗ or L⃗ = r⃗ × p⃗",
        "Conservation of angular momentum",
        "Rolling without slipping conditions",
        "Parallel axis theorem"
      ],
      essentialKnowledge: [
        "Rotational kinematics parallels linear kinematics",
        "Moment of inertia depends on mass distribution",
        "Torque causes angular acceleration",
        "Angular momentum is conserved in isolated systems",
        "Rolling motion combines translation and rotation"
      ]
    },
    {
      name: "Unit 6: Oscillations",
      weight: "8-16%",
      topics: [
        "Simple harmonic motion",
        "Energy in oscillatory motion",
        "Pendulums",
        "Damped and driven oscillations"
      ],
      keyConcepts: [
        "Differential equation of SHM: d²x/dt² = -ω²x",
        "Solutions: x(t) = A cos(ωt + φ)",
        "Energy conservation in SHM",
        "Simple and physical pendulums",
        "Small angle approximations",
        "Damping and quality factor",
        "Resonance in driven systems"
      ],
      essentialKnowledge: [
        "SHM arises from restoring forces proportional to displacement",
        "Differential equations describe oscillatory motion",
        "Energy oscillates between kinetic and potential forms",
        "Period depends on system parameters, not amplitude",
        "Damping reduces amplitude over time"
      ]
    },
    {
      name: "Unit 7: Gravitation",
      weight: "6-14%",
      topics: [
        "Newton's law of universal gravitation",
        "Gravitational potential energy",
        "Gravitational field",
        "Orbital mechanics",
        "Kepler's laws"
      ],
      keyConcepts: [
        "Universal gravitation: F = Gm₁m₂/r²",
        "Gravitational potential energy: U = -Gm₁m₂/r",
        "Gravitational field and field lines",
        "Orbital velocity and escape velocity",
        "Kepler's three laws of planetary motion",
        "Conservation laws in orbital motion"
      ],
      essentialKnowledge: [
        "Gravitational force follows inverse square law",
        "Gravitational potential energy is negative",
        "Orbital motion results from gravitational centripetal force",
        "Kepler's laws describe planetary motion",
        "Energy and angular momentum are conserved in orbits"
      ]
    }
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
