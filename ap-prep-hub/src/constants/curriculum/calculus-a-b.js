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
      topics: ["Introducing Calculus: Can Change Occur at an Instant?", "Defining Limits and Using Limit Notation", "Estimating Limit Values from Graphs", "Estimating Limit Values from Tables", "Determining Limits Using Algebraic Properties of Limits", "Selecting Procedures for Determining Limits", "Determining Limits Using the Squeeze Theorem", "Defining Continuity at a Point", "Confirming Continuity over an Interval", "Removing Discontinuities", "Connecting Infinite Limits and Vertical Asymptotes", "Connecting Limits at Infinity and Horizontal Asymptotes", "Working with the Intermediate Value Theorem (IVT)"],
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
      topics: ["Defining Average and Instantaneous Rates of Change at a Point", "Defining the Derivative of a Function and Using Derivative Notation", "Estimating Derivatives of a Function at a Point", "Applying the Power Rule", "Derivative Rules: Constant, Sum, Difference, and Constant Multiple", "Derivatives of cos x, sin x, e x, and ln x", "The Product Rule", "The Quotient Rule"],
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
      topics: ["The Chain Rule", "Implicit Differentiation", "Differentiating Inverse Functions", "Differentiating Inverse Trigonometric Functions", "Calculating Higher Order Derivatives"],
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
      topics: ["Interpreting the Meaning of the Derivative in Context", "Straight-Line Motion: Connecting Position, Velocity, and Acceleration", "Rates of Change in Applied Contexts Other Than Motion", "Introduction to Related Rates", "Solving Related Rates Problems", "Using L\u2019Hospital\u2019s Rule for Determining Limits of Indeterminate Forms"],
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
      topics: ["Using the Mean Value Theorem", "Determining Intervals on Which a Function Is Increasing or Decreasing", "Using the First Derivative Test to Determine Relative (Local) Extrema", "Using the Candidates Test to Determine Absolute (Global) Extrema", "Determining Concavity of Functions over Their Domains", "Using the Second Derivative Test to Determine Extrema", "Sketching Graphs of Functions and Their Derivatives", "Connecting a Function, Its First Derivative, and Its Second Derivative", "Introduction to Optimization Problems", "Solving Optimization Problems", "Implementing Mathematical Processes"],
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
      topics: ["Exploring Accumulations of Change", "Approximating Areas with Riemann Sums", "Riemann Sums, Summation Notation, and Definite Integral Notation", "The Fundamental Theorem of Calculus and Accumulation Functions", "Interpreting the Behavior of Accumulation Functions Involving Area", "Applying Properties of Definite Integrals", "The Fundamental Theorem of Calculus and Definite Integrals", "Integrating Using Substitution", "Integrating Functions Using Long Division and Completing the Square", "Integrating Using Integration by Parts bc only", "Integrating Using Linear Partial Fractions bc only", "Evaluating Improper Integrals bc only", "Selecting Techniques for Antidifferentiation"],
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
      topics: ["Modeling Situations with Differential Equations", "Verifying Solutions for Differential Equations", "Sketching Slope Fields", "Reasoning Using Slope Fields", "Finding General Solutions Using Separation of Variables", "Exponential Models with Differential Equations", "Logistic Models with Differential Equations bc only"],
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
      topics: ["Finding the Average Value of a Function on an Interval", "Finding the Area Between Curves Expressed as Functions of x", "Finding the Area Between Curves Expressed as Functions of y", "Finding the Area Between Curves That Intersect at More Than Two Points", "Volumes with Cross Sections: Squares and Rectangles", "Volumes with Cross Sections: Triangles and Semicircles", "Volume with Disc Method: Revolving Around the x- or y-Axis", "Volume with Disc Method: Revolving Around Other Axes", "Volume with Washer Method: Revolving Around the x- or y-Axis", "Volume with Washer Method: Revolving Around Other Axes", "The Arc Length of a Smooth, Planar Curve and Distance Traveled bc only"],
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
