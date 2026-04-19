// AP Precalculus curriculum data
const precalculus = {
  name: "AP Precalculus",
  description: "Enhance students' understanding of functions and their properties. Covers polynomial, rational, exponential, logarithmic, and trigonometric functions, preparing students for calculus and other college-level mathematics.",
  examFormat: {
    duration: "2 hours",
    sections: [
      { name: "Multiple Choice Part A (No Calculator)", questions: 28, time: "80 minutes", weight: "62.5%" },
      { name: "Multiple Choice Part B (Calculator)", questions: 12, time: "40 minutes", weight: "37.5%" }
    ]
  },
  bigIdeas: [
    "Change (CHA): Changing quantities can be modeled and predicted",
    "Equivalence (EQU): Relationships between quantities can be expressed in equivalent ways",
    "Covariation (COV): How one quantity changes relative to another"
  ],
  units: [
    {
      name: "Unit 1: Polynomial and Rational Functions",
      weight: "30-40%",
      topics: [
        "Change in tandem",
        "Rates of change",
        "Polynomial functions and rates of change",
        "Polynomial functions and end behavior",
        "Polynomial functions and zeros",
        "Rational functions",
        "Vertical asymptotes and holes",
        "End behavior of rational functions",
        "Transformations of functions"
      ]
    },
    {
      name: "Unit 2: Exponential and Logarithmic Functions",
      weight: "27-40%",
      topics: [
        "Arithmetic and geometric sequences",
        "Exponential functions",
        "Exponential function manipulation",
        "Exponential function context and data modeling",
        "Composition of functions",
        "Inverse functions",
        "Logarithmic functions",
        "Logarithmic function manipulation",
        "Semi-log plots"
      ]
    },
    {
      name: "Unit 3: Trigonometric and Polar Functions",
      weight: "15-20%",
      topics: [
        "Periodic phenomena",
        "Sine, cosine, and tangent",
        "Sinusoidal functions",
        "Sinusoidal function context and data modeling",
        "Trigonometric function transformations",
        "Trigonometric identities and solving equations",
        "Polar function graphs",
        "Rates of change in polar functions"
      ]
    },
    {
      name: "Unit 4: Functions Involving Parameters, Vectors, and Matrices",
      weight: "10-15%",
      topics: [
        "Parametric functions",
        "Parametric functions modeling planar motion",
        "Vectors",
        "Vector-valued functions",
        "Matrices",
        "Matrices as transformations of the plane"
      ]
    }
  ],
  keySkills: [
    "Analyze and interpret mathematical models",
    "Determine function behavior and properties",
    "Apply transformations to functions",
    "Model real-world phenomena with appropriate function types",
    "Use technology strategically for exploration and verification"
  ],
  studyTips: [
    "Focus on understanding function behavior rather than memorizing formulas",
    "Practice graphing by hand before using a calculator",
    "Connect algebraic representations to graphical and verbal descriptions",
    "Work with real-world data to understand modeling applications",
    "Build fluency with function transformations across all types"
  ]
};

export default precalculus;
