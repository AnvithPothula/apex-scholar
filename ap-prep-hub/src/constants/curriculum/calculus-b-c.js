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
  units: [
    {
      name: "Unit 1-8: All Calculus AB Topics",
      weight: "60-70%",
      topics: [
        "All topics from AP Calculus AB Units 1-8",
        "Limits and Continuity",
        "Differentiation: Definition and Fundamental Properties", 
        "Differentiation: Composite, Implicit, and Inverse Functions",
        "Contextual Applications of Differentiation",
        "Analytical Applications of Differentiation",
        "Integration and Accumulation of Change",
        "Differential Equations",
        "Applications of Integration"
      ],
      keyConcepts: [
        "All key concepts from Calculus AB",
        "Enhanced depth in integration techniques",
        "Advanced applications of derivatives and integrals",
        "More complex differential equations"
      ],
      essentialKnowledge: [
        "All essential knowledge from AP Calculus AB",
        "Students must master AB topics to succeed in BC extensions",
        "BC topics build directly on AB foundations"
      ]
    },
    {
      name: "Unit 9: Parametric Equations, Polar Coordinates, and Vector-Valued Functions",
      weight: "11-12%",
      topics: [
        "Defining and differentiating parametric equations",
        "Second derivatives of parametric equations", 
        "Finding the length of a parametric curve",
        "Finding the area bounded by a parametric curve",
        "Defining and differentiating vector-valued functions",
        "Velocity and acceleration vectors for motion in a plane",
        "Speed and distance traveled for motion in a plane",
        "Defining polar coordinates and curves",
        "Differentiating polar functions",
        "Finding the area of a polar region",
        "Finding the length of a polar curve"
      ],
      keyConcepts: [
        "Parametric representation of curves",
        "Vector-valued functions and motion analysis",
        "Polar coordinate system and curves",
        "Arc length calculations in parametric and polar forms",
        "Area calculations with parametric and polar curves",
        "Velocity and acceleration vectors in plane motion"
      ],
      essentialKnowledge: [
        "Parametric equations provide alternative representations of curves",
        "Vector-valued functions model motion in multiple dimensions",
        "Polar coordinates offer natural representations for certain curves", 
        "Calculus operations extend naturally to parametric and polar contexts",
        "Motion analysis uses vector concepts for velocity and acceleration"
      ]
    },
    {
      name: "Unit 10: Infinite Sequences and Series",
      weight: "17-18%",
      topics: [
        "Defining convergent and divergent infinite sequences",
        "Defining convergent and divergent infinite series",
        "The nth Term Test for Divergence",
        "Integral Test for convergence and divergence",
        "Comparison tests for convergence and divergence",
        "Alternating Series Test and error bound",
        "Ratio Test for convergence and divergence",
        "Determining absolute or conditional convergence",
        "Finding Taylor polynomial approximations of functions",
        "Lagrange error bound for Taylor polynomials",
        "Finding a power series function representation",
        "Finding Taylor or Maclaurin series for a function",
        "Representing functions as power series using geometric series",
        "Determining the radius and interval of convergence",
        "Working with Taylor series for composite functions"
      ],
      keyConcepts: [
        "Sequence convergence and limits",
        "Series convergence tests and criteria",
        "Taylor and Maclaurin polynomial approximations",
        "Power series representations of functions",
        "Radius and interval of convergence",
        "Error bounds and approximation accuracy",
        "Geometric series and ratio test applications"
      ],
      essentialKnowledge: [
        "Infinite series extend the concept of finite sums",
        "Convergence tests determine if series have finite sums",
        "Taylor series provide polynomial approximations to functions",
        "Power series represent functions as infinite polynomials",
        "Convergence intervals define domains for power series",
        "Error bounds quantify approximation accuracy"
      ]
    }
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
