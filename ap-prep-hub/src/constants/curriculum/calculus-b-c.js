// AP Calculus BC curriculum data
const calculusBC = {
  name: "AP Calculus BC",
  description: "Explore all topics of AP Calculus AB plus additional topics in sequences, series, parametric, polar, and vector-valued functions.",
  examFormat: {
    duration: "3 hours 15 minutes",
    sections: [
      { name: "Multiple Choice", questions: 45, time: "105 minutes", weight: "50%" },
      { name: "Free Response", questions: 6, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Change: Calculus was developed to study change in functions across multiple representations",
    "Limits: Limits allow us to evaluate functions and determine convergence of infinite processes",
    "Analysis of Functions: Derivatives allow us to analyze complex functions including parametric and polar",
    "Integration and Accumulation: Integrals extend to infinite series, parametric, and polar contexts"
  ],
  // The BC units are spelled out rather than collapsed into a single
  // "Unit 1-8: All Calculus AB Topics" placeholder. BC genuinely examines all
  // ten units, and the placeholder meant a BC student could not filter practice
  // by any AB topic — the eight units they share with AB were invisible to the
  // unit picker. Weightings are the CED's published BC ranges.
  units: [
    { name: "Unit 1: Limits and Continuity", weight: "4-7%", topics: ["Introducing Calculus: Can Change Occur at an Instant?", "Defining Limits and Using Limit Notation", "Estimating Limit Values from Graphs", "Estimating Limit Values from Tables", "Determining Limits Using Algebraic Properties of Limits", "Selecting Procedures for Determining Limits", "Determining Limits Using the Squeeze Theorem", "Defining Continuity at a Point", "Confirming Continuity over an Interval", "Removing Discontinuities", "Connecting Infinite Limits and Vertical Asymptotes", "Connecting Limits at Infinity and Horizontal Asymptotes", "Working with the Intermediate Value Theorem (IVT)"] },
    { name: "Unit 2: Differentiation: Definition and Fundamental Properties", weight: "4-7%", topics: ["Defining Average and Instantaneous Rates of Change at a Point", "Defining the Derivative of a Function and Using Derivative Notation", "Estimating Derivatives of a Function at a Point", "Applying the Power Rule", "Derivative Rules: Constant, Sum, Difference, and Constant Multiple", "Derivatives of cos x, sin x, e x, and ln x", "The Product Rule", "The Quotient Rule"] },
    { name: "Unit 3: Differentiation: Composite, Implicit, and Inverse Functions", weight: "4-7%", topics: ["The Chain Rule", "Implicit Differentiation", "Differentiating Inverse Functions", "Differentiating Inverse Trigonometric Functions", "Calculating Higher Order Derivatives"] },
    { name: "Unit 4: Contextual Applications of Differentiation", weight: "6-9%", topics: ["Interpreting the Meaning of the Derivative in Context", "Straight-Line Motion: Connecting Position, Velocity, and Acceleration", "Rates of Change in Applied Contexts Other Than Motion", "Introduction to Related Rates", "Solving Related Rates Problems", "Using L\u2019Hospital\u2019s Rule for Determining Limits of Indeterminate Forms"] },
    { name: "Unit 5: Analytical Applications of Differentiation", weight: "8-11%", topics: ["Using the Mean Value Theorem", "Determining Intervals on Which a Function Is Increasing or Decreasing", "Using the First Derivative Test to Determine Relative (Local) Extrema", "Using the Candidates Test to Determine Absolute (Global) Extrema", "Determining Concavity of Functions over Their Domains", "Using the Second Derivative Test to Determine Extrema", "Sketching Graphs of Functions and Their Derivatives", "Connecting a Function, Its First Derivative, and Its Second Derivative", "Introduction to Optimization Problems", "Solving Optimization Problems", "Implementing Mathematical Processes"] },
    { name: "Unit 6: Integration and Accumulation of Change", weight: "17-20%", topics: ["Exploring Accumulations of Change", "Approximating Areas with Riemann Sums", "Riemann Sums, Summation Notation, and Definite Integral Notation", "The Fundamental Theorem of Calculus and Accumulation Functions", "Interpreting the Behavior of Accumulation Functions Involving Area", "Applying Properties of Definite Integrals", "The Fundamental Theorem of Calculus and Definite Integrals", "Integrating Using Substitution", "Integrating Functions Using Long Division and Completing the Square", "Integrating Using Integration by Parts bc only", "Integrating Using Linear Partial Fractions bc only", "Evaluating Improper Integrals bc only", "Selecting Techniques for Antidifferentiation"] },
    { name: "Unit 7: Differential Equations", weight: "6-9%", topics: ["Modeling Situations with Differential Equations", "Verifying Solutions for Differential Equations", "Sketching Slope Fields", "Reasoning Using Slope Fields", "Finding General Solutions Using Separation of Variables", "Exponential Models with Differential Equations", "Logistic Models with Differential Equations bc only"] },
    { name: "Unit 8: Applications of Integration", weight: "6-9%", topics: ["Finding the Average Value of a Function on an Interval", "Finding the Area Between Curves Expressed as Functions of x", "Finding the Area Between Curves Expressed as Functions of y", "Finding the Area Between Curves That Intersect at More Than Two Points", "Volumes with Cross Sections: Squares and Rectangles", "Volumes with Cross Sections: Triangles and Semicircles", "Volume with Disc Method: Revolving Around the x- or y-Axis", "Volume with Disc Method: Revolving Around Other Axes", "Volume with Washer Method: Revolving Around the x- or y-Axis", "Volume with Washer Method: Revolving Around Other Axes", "The Arc Length of a Smooth, Planar Curve and Distance Traveled bc only"] },
    { name: "Unit 9: Parametric Equations, Polar Coordinates, and Vector-Valued Functions", weight: "11-12%", topics: ["Defining and Differentiating Parametric Equations", "Second Derivatives of Parametric Equations", "Finding Arc Lengths of Curves Given by Parametric Equations", "Defining and Differentiating VectorValued Functions", "Integrating VectorValued Functions", "Solving Motion Problems Using Parametric and Vector-Valued Functions", "Finding the Area of the Region Bounded by Two Polar Curves"] },
    { name: "Unit 10: Infinite Sequences and Series", weight: "17-18%", topics: ["Ratio Test for Convergence", "Working with Geometric Series", "Defining Convergent and Divergent Infinite Series", "The nth Term Test for Divergence", "Integral Test for Convergence", "Harmonic Series and p-Series", "Comparison Tests for Convergence", "Alternating Series Test for Convergence", "Determining Absolute or Conditional Convergence", "Alternating Series Error Bound", "Finding Taylor Polynomial Approximations of Functions", "1.F", "Radius and Interval of Convergence of Power Series", "Finding Taylor or Maclaurin Series for a Function", "Representing Functions as Power Series"] }
  ],
  keySkills: [
    "Implementing mathematical processes: Use appropriate mathematical processes and tools across multiple representations",
    "Connecting representations: Translate between parametric, polar, Cartesian, and series representations",
    "Justification: Justify reasoning about convergence, series behavior, and advanced applications",
    "Communication and notation: Use correct notation for series, parametric, polar, and vector contexts"
  ],
  studyTips: [
    "Master all Calculus AB topics thoroughly before focusing on BC extensions",
    "Practice parametric and polar curve sketching and analysis",
    "Memorize common Taylor series (sin x, cos x, e^x, ln(1+x), etc.)",
    "Learn convergence tests systematically and know when to apply each",
    "Practice vector-valued function analysis for motion problems",
    "Understand the relationship between different coordinate systems",
    "Work with series manipulations and function representations",
    "Practice BC-specific free response question types regularly",
    "Use graphing technology to visualize parametric and polar curves",
    "Connect series concepts to previous integration and approximation work"
  ],
  commonTopics: [
    "All topics from Calculus AB curriculum",
    "Parametric curve analysis: derivatives, arc length, area",
    "Vector-valued functions and motion in a plane",
    "Polar coordinate curves and calculus applications",
    "Series convergence tests (ratio, comparison, integral, alternating)",
    "Taylor and Maclaurin series derivation and applications",
    "Power series representations and intervals of convergence",
    "Lagrange error bounds for polynomial approximations",
    "Geometric series and related convergent series",
    "Series manipulation and function approximation"
  ],
  additionalTopics: [
    "L'Hôpital's Rule extended applications",
    "Integration by parts with more complex functions",
    "Partial fraction decomposition",
    "Improper integrals and convergence",
    "Advanced differential equation techniques",
    "Euler's method with greater precision",
    "Logistic differential equations",
    "Advanced optimization in multiple contexts"
  ]
};

export default calculusBC;
