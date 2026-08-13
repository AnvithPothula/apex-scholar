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
      topics: ["2.B", "Rates of Change", "Rates of Change in Linear and Quadratic Functions", "Polynomial Functions and Rates of Change", "Polynomial Functions and Complex Zeros", "Polynomial Functions and End Behavior", "Rational Functions and End Behavior", "Rational Functions and Zeros", "Rational Functions and Vertical Asymptotes", "Rational Functions and Holes", "Equivalent Representations of Polynomial and Rational Expressions", "1.C", "Function Model Selection and Assumption Articulation", "Function Model Construction and Application"]
    },
    {
      name: "Unit 2: Exponential and Logarithmic Functions",
      weight: "27-40%",
      topics: ["Change in Arithmetic and Geometric Sequences", "Change in Linear and Exponential Functions", "Exponential Functions", "Exponential Function Manipulation", "1.C", "Competing Function Model Validation", "Composition of Functions", "Inverse Functions", "Logarithmic Expressions", "Inverses of Exponential Functions", "Logarithmic Functions", "Logarithmic Function Manipulation", "Exponential and Logarithmic Equations and Inequalities", "Logarithmic Function Context and Data Modeling", "Semi-log Plots"]
    },
    {
      name: "Unit 3: Trigonometric and Polar Functions",
      weight: "15-20%",
      topics: ["Periodic Phenomena", "Sine and Cosine Function Graphs", "Sinusoidal Functions", "Sinusoidal Function Transformations", "Sinusoidal Function Context and Data Modeling", "The Tangent Function", "1.C", "Trigonometric Equations and Inequalities", "The Secant, Cosecant, and Cotangent Functions", "Equivalent Representations of Trigonometric Functions", "Trigonometry and Polar Coordinates", "Polar Function Graphs", "Rates of Change in Polar Functions"]
    },
    {
      name: "Unit 4: Functions Involving Parameters, Vectors, and Matrices",
      weight: "10-15%",
      topics: ["Parametric Functions", "Parametric Functions and Rates of Change", "Parametrically Defined Circles and Lines", "Implicitly Defined Functions", "Conic Sections", "Parametrization of Implicitly Defined Functions", "Vectors", "Vector-Valued Functions Additional Topic Available to Schools", "1.B", "1.B", "Matrices as Functions", "Matrices Modeling Contexts"]
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
