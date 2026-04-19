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
  units: [
    {
      name: "Unit 1: Electrostatics",
      weight: "25-30%",
      topics: [
        "Coulomb's law",
        "Electric field and electric field lines",
        "Gauss's law",
        "Electric potential and potential energy",
        "Equipotential surfaces"
      ],
      keyConcepts: [
        "Coulomb's law with superposition",
        "Electric field as vector field: E⃗ = F⃗/q",
        "Gauss's law: ∮E⃗·dA⃗ = Q_enclosed/ε₀",
        "Electric potential: V = U/q and E⃗ = -∇V",
        "Work and potential energy in electric fields",
        "Field lines and equipotential surfaces",
        "Continuous charge distributions"
      ],
      essentialKnowledge: [
        "Electric force follows Coulomb's law with superposition",
        "Electric field is force per unit charge",
        "Gauss's law relates field to enclosed charge",
        "Electric potential is potential energy per unit charge",
        "Field points from high to low potential"
      ]
    },
    {
      name: "Unit 2: Conductors, Capacitors, and Dielectrics",
      weight: "15-20%",
      topics: [
        "Electrostatic properties of conductors",
        "Capacitors and capacitance",
        "Energy stored in capacitors",
        "Dielectrics",
        "Capacitor combinations"
      ],
      keyConcepts: [
        "Conductors in electrostatic equilibrium",
        "Electric field inside and outside conductors",
        "Capacitance: C = Q/V",
        "Energy stored: U = ½CV² = ½QV = ½Q²/C",
        "Dielectric constant and polarization",
        "Series and parallel capacitor combinations",
        "Energy density in electric fields"
      ],
      essentialKnowledge: [
        "Electric field inside conductors is zero",
        "Capacitance depends on geometry and dielectric",
        "Capacitors store electrical energy",
        "Dielectrics increase capacitance",
        "Energy is stored in electric fields"
      ]
    },
    {
      name: "Unit 3: Electric Circuits",
      weight: "20-25%",
      topics: [
        "Current, resistance, and EMF",
        "Kirchhoff's rules",
        "RC circuits",
        "Electrical power and energy"
      ],
      keyConcepts: [
        "Current density and microscopic view: J⃗ = nqv⃗",
        "Resistance and Ohm's law: R = ρL/A",
        "Kirchhoff's voltage and current laws",
        "RC circuit transients: exponential charging/discharging",
        "Time constants: τ = RC",
        "Power dissipation: P = I²R = V²/R",
        "EMF and terminal voltage"
      ],
      essentialKnowledge: [
        "Current is related to charge carrier motion",
        "Resistance depends on material properties",
        "Kirchhoff's laws enable circuit analysis",
        "RC circuits exhibit exponential behavior",
        "Power equals energy per unit time"
      ]
    },
    {
      name: "Unit 4: Magnetic Fields",
      weight: "15-20%",
      topics: [
        "Forces on moving charges and currents",
        "Fields due to currents",
        "Biot-Savart law",
        "Ampère's law"
      ],
      keyConcepts: [
        "Magnetic force: F⃗ = q(v⃗ × B⃗) and F⃗ = IL⃗ × B⃗",
        "Cyclotron motion and radius",
        "Biot-Savart law: dB⃗ = (μ₀/4π) × (Idl⃗ × r̂)/r²",
        "Ampère's law: ∮B⃗·dl⃗ = μ₀I_enclosed",
        "Magnetic fields of wires, loops, and solenoids",
        "Force between current-carrying wires"
      ],
      essentialKnowledge: [
        "Moving charges experience magnetic forces",
        "Magnetic force is perpendicular to velocity and field",
        "Currents create magnetic fields",
        "Ampère's law relates field to current",
        "Magnetic fields have no monopoles"
      ]
    },
    {
      name: "Unit 5: Electromagnetic Induction",
      weight: "20-25%",
      topics: [
        "Motional EMF",
        "Faraday's law and Lenz's law",
        "Inductance",
        "RL circuits",
        "Energy in magnetic fields"
      ],
      keyConcepts: [
        "Motional EMF: ε = BLv",
        "Faraday's law: ε = -dΦ_B/dt",
        "Magnetic flux: Φ_B = ∫B⃗·dA⃗",
        "Lenz's law and energy conservation",
        "Self-inductance: L = Φ/I",
        "RL circuit transients: I(t) = (ε/R)(1 - e^(-Rt/L))",
        "Energy stored in inductors: U = ½LI²"
      ],
      essentialKnowledge: [
        "Changing magnetic flux induces EMF",
        "Induced currents oppose flux changes (Lenz's law)",
        "Inductors store energy in magnetic fields",
        "RL circuits have exponential current growth/decay",
        "Electromagnetic induction enables generators and transformers"
      ]
    }
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
