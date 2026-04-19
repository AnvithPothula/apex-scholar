// AP Calculus AB curriculum data
const calculusAB = {
  name: "AP Calculus AB",
  description: "Learn about the fundamental concepts and methods of calculus, including limits, derivatives, integrals, and the Fundamental Theorem of Calculus.",
  examFormat: {
    duration: "3 hours 15 minutes",
    sections: [
      { name: "Multiple Choice", questions: 45, time: "105 minutes", weight: "50%" },
      { name: "Free Response", questions: 6, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Change: Calculus was developed to study change in functions",
    "Limits: Limits allow us to evaluate functions at points of discontinuity and determine end behavior",
    "Analysis of Functions: Derivatives allow us to analyze the behavior of functions and solve optimization problems",
    "Integration and Accumulation: Integrals allow us to calculate accumulation and solve area and volume problems"
  ],
  units: [
    {
      name: "Unit 1: Limits and Continuity",
      weight: "4-7%",
      topics: [
        "Introduction to limits",
        "Estimating limit values from graphs",
        "Estimating limit values from tables",
        "Determining limits using algebraic manipulation",
        "Determining limits using squeeze theorem",
        "Exploring types of discontinuities",
        "Defining continuity at a point",
        "Confirming continuity over an interval",
        "Removing discontinuities",
        "Connecting infinite limits and vertical asymptotes",
        "Connecting limits at infinity and horizontal asymptotes",
        "Working with the intermediate value theorem"
      ],
      keyConcepts: [
        "Intuitive and formal definition of limits",
        "One-sided limits and two-sided limits",
        "Squeeze theorem applications",
        "Types of discontinuities: removable, jump, infinite",
        "Continuity and differentiability relationship",
        "Intermediate Value Theorem",
        "End behavior and horizontal asymptotes"
      ],
      essentialKnowledge: [
        "A function is continuous at a point if the limit exists and equals the function value",
        "The Intermediate Value Theorem guarantees existence of solutions",
        "Limits can be evaluated using direct substitution, factoring, rationalization, or squeeze theorem",
        "Vertical asymptotes occur where limits approach infinity"
      ]
    },
    {
      name: "Unit 2: Differentiation: Definition and Fundamental Properties",
      weight: "4-7%",
      topics: [
        "Defining average and instantaneous rates of change",
        "Defining the derivative of a function at a point and as a function",
        "Estimating derivatives from graphs and tables",
        "Connecting differentiability and continuity",
        "Applying the power rule",
        "Derivative rules for constants, sums, differences, and constant multiples",
        "Derivatives of cos x, sin x, e^x, and ln x",
        "The product rule",
        "The quotient rule",
        "Finding derivatives of tangent, cotangent, secant, and cosecant functions",
        "Calculating higher-order derivatives"
      ],
      keyConcepts: [
        "Definition of derivative as a limit",
        "Geometric interpretation as slope of tangent line",
        "Physical interpretation as instantaneous rate of change",
        "Power rule and basic derivative formulas",
        "Product and quotient rules",
        "Derivatives of trigonometric functions",
        "Higher-order derivatives"
      ],
      essentialKnowledge: [
        "The derivative represents instantaneous rate of change",
        "Differentiability implies continuity, but not vice versa",
        "Basic differentiation rules form the foundation for more complex derivatives",
        "Trigonometric derivatives follow specific patterns"
      ]
    },
    {
      name: "Unit 3: Differentiation: Composite, Implicit, and Inverse Functions",
      weight: "6-10%",
      topics: [
        "The chain rule for differentiating composite functions",
        "Implicit differentiation",
        "Differentiating inverse functions",
        "Differentiating inverse trigonometric functions",
        "Selecting procedures for calculating derivatives"
      ],
      keyConcepts: [
        "Chain rule for composite functions",
        "Implicit differentiation techniques",
        "Derivatives of inverse functions",
        "Inverse trigonometric function derivatives",
        "Logarithmic differentiation"
      ],
      essentialKnowledge: [
        "The chain rule is essential for differentiating composite functions",
        "Implicit differentiation allows finding derivatives when y cannot be solved explicitly",
        "Inverse function derivatives use the reciprocal relationship",
        "Proper selection of differentiation techniques is crucial for efficiency"
      ]
    },
    {
      name: "Unit 4: Contextual Applications of Differentiation",
      weight: "6-10%",
      topics: [
        "Interpreting the meaning of the derivative in context",
        "Straight-line motion: connecting position, velocity, and acceleration",
        "Rates of change in applied contexts other than motion",
        "Introduction to related rates",
        "Solving related rates problems",
        "Approximating values using local linearity and linearization",
        "Using L'Hôpital's rule for determining limits of indeterminate forms"
      ],
      keyConcepts: [
        "Position, velocity, and acceleration relationships",
        "Related rates problem-solving strategies",
        "Linear approximation and tangent line equations",
        "L'Hôpital's rule for indeterminate forms",
        "Real-world applications of derivatives"
      ],
      essentialKnowledge: [
        "Derivatives model rates of change in various contexts",
        "Related rates problems connect multiple changing quantities",
        "Linear approximation provides estimates using tangent lines",
        "L'Hôpital's rule resolves indeterminate limit forms"
      ]
    },
    {
      name: "Unit 5: Analytical Applications of Differentiation",
      weight: "15-18%",
      topics: [
        "Using the mean value theorem",
        "Extreme value theorem and critical points",
        "Determining intervals where functions are increasing or decreasing",
        "Using the first derivative test for relative extrema",
        "Using the candidates test for absolute extrema",
        "Determining concavity using the second derivative",
        "Using the second derivative test for extrema",
        "Sketching graphs of functions and their derivatives",
        "Connecting functions with their first and second derivatives",
        "Introduction to optimization problems",
        "Solving optimization problems"
      ],
      keyConcepts: [
        "Mean Value Theorem and its applications",
        "Critical points and extreme values",
        "First derivative test for local extrema",
        "Second derivative test and concavity",
        "Curve sketching techniques",
        "Optimization problem strategies",
        "Relationship between f, f', and f''"
      ],
      essentialKnowledge: [
        "The Mean Value Theorem connects average and instantaneous rates of change",
        "Critical points occur where the derivative is zero or undefined",
        "The first derivative determines intervals of increase/decrease",
        "The second derivative determines concavity and inflection points",
        "Optimization problems require finding absolute extrema on closed intervals"
      ]
    },
    {
      name: "Unit 6: Integration and Accumulation of Change",
      weight: "17-20%",
      topics: [
        "Exploring accumulations of change",
        "Approximating areas under curves with Riemann sums",
        "Riemann sums, summation notation, and definite integral notation",
        "The fundamental theorem of calculus and accumulation functions",
        "Interpreting the behavior of accumulation functions",
        "Applying properties of definite integrals",
        "The fundamental theorem of calculus and definite integrals",
        "Finding antiderivatives and indefinite integrals",
        "Integrating using substitution",
        "Integrating functions using long division and completing the square",
        "Selecting techniques for antidifferentiation"
      ],
      keyConcepts: [
        "Riemann sums and definite integrals",
        "Fundamental Theorem of Calculus (both parts)",
        "Accumulation functions and their properties",
        "Basic integration techniques",
        "U-substitution method",
        "Properties of definite integrals"
      ],
      essentialKnowledge: [
        "Definite integrals represent accumulated change or area under curves",
        "The Fundamental Theorem of Calculus connects derivatives and integrals",
        "Accumulation functions show total change over intervals",
        "Integration techniques include substitution and algebraic manipulation"
      ]
    },
    {
      name: "Unit 7: Differential Equations",
      weight: "6-12%",
      topics: [
        "Modeling situations with differential equations",
        "Verifying solutions for differential equations",
        "Sketching slope fields",
        "Reasoning using slope fields",
        "Approximating solutions using Euler's method",
        "Finding general solutions using separation of variables",
        "Finding particular solutions using initial conditions",
        "Exponential models with differential equations"
      ],
      keyConcepts: [
        "Differential equations as mathematical models",
        "Slope fields and solution curves",
        "Euler's method for numerical solutions",
        "Separation of variables technique",
        "Initial value problems",
        "Exponential growth and decay models"
      ],
      essentialKnowledge: [
        "Differential equations model relationships between functions and their derivatives",
        "Slope fields visualize families of solutions",
        "Euler's method provides numerical approximations",
        "Separation of variables solves certain types of differential equations",
        "Initial conditions determine particular solutions"
      ]
    },
    {
      name: "Unit 8: Applications of Integration",
      weight: "6-12%",
      topics: [
        "Finding the average value of a function on an interval",
        "Connecting position, velocity, and acceleration using integrals",
        "Using accumulation functions in applied contexts",
        "Finding areas between curves expressed as functions of x",
        "Finding areas between curves expressed as functions of y",
        "Finding areas between curves that intersect at more than two points",
        "Volumes with cross sections: squares and rectangles",
        "Volumes with cross sections: triangles and semicircles",
        "Volume with disc method: revolving around x- or y-axis",
        "Volume with disc method: revolving around other axes",
        "Volume with washer method: revolving around x- or y-axis",
        "Volume with washer method: revolving around other axes"
      ],
      keyConcepts: [
        "Average value of functions",
        "Motion problems using integration",
        "Area between curves",
        "Volume of solids of revolution",
        "Disc and washer methods",
        "Cross-sectional area methods",
        "Integration in multiple contexts"
      ],
      essentialKnowledge: [
        "Integration calculates average values, areas, and volumes",
        "Area between curves requires careful setup of integrals",
        "Solids of revolution use disc and washer methods",
        "Cross-sectional methods apply to various geometric shapes",
        "Motion problems connect position, velocity, and acceleration through integration"
      ]
    }
  ],
  keySkills: [
    "Implementing mathematical processes: Use appropriate mathematical processes and tools",
    "Connecting representations: Translate between mathematical representations",
    "Justification: Justify reasoning and solutions using mathematical arguments",
    "Communication and notation: Use correct mathematical notation and communicate clearly"
  ],
  studyTips: [
    "Practice limit problems using multiple approaches (algebraic, graphical, numerical)",
    "Master the fundamental differentiation rules before moving to advanced topics",
    "Connect derivatives to graphs and real-world rate of change contexts",
    "Practice integration techniques systematically, starting with basic antiderivatives",
    "Understand both parts of the Fundamental Theorem of Calculus deeply",
    "Work on justification and clear communication of mathematical solutions",
    "Use graphing calculators effectively for analysis and verification",
    "Practice free response questions with proper mathematical notation",
    "Create concept maps linking limits, derivatives, and integrals",
    "Review trigonometric identities and algebra skills regularly"
  ],
  commonTopics: [
    "Limit evaluation using various techniques",
    "Derivative applications: tangent lines, rates of change, optimization",
    "Chain rule and implicit differentiation problems",
    "Related rates in real-world contexts",
    "Curve analysis using first and second derivatives",
    "Fundamental Theorem of Calculus applications",
    "Integration by substitution",
    "Area and volume calculations using integrals",
    "Differential equations and slope fields",
    "Motion problems connecting position, velocity, and acceleration"
  ]
};

export default calculusAB;
