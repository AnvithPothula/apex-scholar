// Test configuration data for AP Practice Tests
// Extracted from PracticeTests.js to serve as single source of truth
// PracticeTests.js should import TEST_CONFIGURATIONS and DEFAULT_CONFIG from this file

export const TEST_CONFIGURATIONS = {
  'AP Biology': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 60, description: 'Cellular processes, genetics, evolution, ecology' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 90,
        questions: 6,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'long-frq', name: 'Long FRQ Only', time: 60, questions: 2, description: 'Long experimental design and data analysis' },
          { id: 'short-frq', name: 'Short FRQ Only', time: 30, questions: 4, description: 'Short response questions' },
          { id: 'all-frq', name: 'All FRQs', time: 90, questions: 6, description: '2 Long + 4 Short FRQs' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 66, description: 'Complete AP Biology exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Chemistry of Life', description: 'Water, macromolecules, and origin of life' },
      { id: 'unit2', name: 'Unit 2: Cell Structure and Function', description: 'Cell components, membrane transport, organelles' },
      { id: 'unit3', name: 'Unit 3: Cellular Energetics', description: 'Enzyme function, cellular respiration, photosynthesis' },
      { id: 'unit4', name: 'Unit 4: Cell Communication and Cell Cycle', description: 'Signal transduction, cell cycle, cancer' },
      { id: 'unit5', name: 'Unit 5: Heredity', description: 'Meiosis, Mendel, inheritance patterns, biotechnology' },
      { id: 'unit6', name: 'Unit 6: Gene Expression and Regulation', description: 'DNA, RNA, protein synthesis, regulation' },
      { id: 'unit7', name: 'Unit 7: Natural Selection', description: 'Mutation, natural selection, population genetics' },
      { id: 'unit8', name: 'Unit 8: Ecology', description: 'Population ecology, community ecology, ecosystems' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Chemistry': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 60, description: 'Atomic structure, bonding, kinetics, equilibrium' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 105,
        questions: 7,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'long-frq', name: 'Long FRQ Only', time: 60, questions: 3, description: 'Long experimental design and calculations' },
          { id: 'short-frq', name: 'Short FRQ Only', time: 45, questions: 4, description: 'Short response questions' },
          { id: 'all-frq', name: 'All FRQs', time: 105, questions: 7, description: '3 Long + 4 Short FRQs' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 67, description: 'Complete AP Chemistry exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Atomic Structure and Properties', topics: ['Moles and molar mass', 'Mass spectroscopy', 'Elemental composition', 'Atomic structure', 'Photoelectron spectroscopy'] },
      { id: 'unit2', name: 'Unit 2: Molecular and Ionic Compound Structure', topics: ['Types of chemical bonds', 'Intramolecular force', 'Lewis diagrams', 'Resonance', 'VSEPR'] },
      { id: 'unit3', name: 'Unit 3: Intermolecular Forces and Properties', topics: ['Intermolecular forces', 'Properties of solids', 'Properties of liquids', 'Properties of gases', 'Kinetic molecular theory'] },
      { id: 'unit4', name: 'Unit 4: Chemical Reactions', topics: ['Introduction to reactions', 'Net ionic equations', 'Representations of reactions', 'Physical and chemical changes'] },
      { id: 'unit5', name: 'Unit 5: Kinetics', topics: ['Reaction rates', 'Introduction to rate law', 'Concentration changes', 'Elementary reactions', 'Collision model'] },
      { id: 'unit6', name: 'Unit 6: Thermodynamics', topics: ['Endothermic and exothermic processes', 'Energy diagrams', 'Heat transfer', 'Enthalpy', 'Bond enthalpies'] },
      { id: 'unit7', name: 'Unit 7: Equilibrium', topics: ['Introduction to equilibrium', 'Direction of reversible reactions', 'Reaction quotient', 'Le Chatelier\'s principle'] },
      { id: 'unit8', name: 'Unit 8: Acids and Bases', topics: ['Introduction to acids and bases', 'pH and pOH', 'Strong acids and bases', 'Weak acids and bases', 'Molecular structure'] },
      { id: 'unit9', name: 'Unit 9: Applications of Thermodynamics', topics: ['Introduction to entropy', 'Absolute entropy and entropy change', 'Gibbs free energy', 'Thermodynamic favorability'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Calculus AB': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 105, questions: 45, description: 'Part A: 30Q (60min, no calc) + Part B: 15Q (45min, calc)' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 90,
        questions: 6,
        description: 'Choose calculator vs non-calculator FRQs',
        subSections: [
          { id: 'calculator-frq', name: 'Calculator FRQ', time: 30, questions: 2, description: 'Calculator-allowed FRQs' },
          { id: 'no-calculator-frq', name: 'No Calculator FRQ', time: 60, questions: 4, description: 'No calculator FRQs' },
          { id: 'all-frq', name: 'All FRQs', time: 90, questions: 6, description: 'Complete FRQ section' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 51, description: 'Complete AP Calculus AB exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Limits and Continuity', topics: ['Limits', 'Continuity', 'Intermediate Value Theorem', 'Asymptotes'] },
      { id: 'unit2', name: 'Unit 2: Differentiation: Definition and Fundamental Properties', topics: ['Definition of derivative', 'Derivative rules', 'Higher-order derivatives'] },
      { id: 'unit3', name: 'Unit 3: Differentiation: Composite, Implicit, and Inverse Functions', topics: ['Chain rule', 'Implicit differentiation', 'Inverse functions'] },
      { id: 'unit4', name: 'Unit 4: Contextual Applications of Differentiation', topics: ['Related rates', 'Linear approximation', 'L\'Hopital\'s rule'] },
      { id: 'unit5', name: 'Unit 5: Analytical Applications of Differentiation', topics: ['Mean Value Theorem', 'Extrema', 'Curve sketching', 'Optimization'] },
      { id: 'unit6', name: 'Unit 6: Integration and Accumulation of Change', topics: ['Antiderivatives', 'Riemann sums', 'Fundamental Theorem of Calculus'] },
      { id: 'unit7', name: 'Unit 7: Differential Equations', topics: ['Slope fields', 'Separation of variables', 'Exponential growth'] },
      { id: 'unit8', name: 'Unit 8: Applications of Integration', topics: ['Area between curves', 'Volume', 'Arc length', 'Average value'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Calculus BC': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 105, questions: 45, description: 'Part A: 30Q (60min, no calc) + Part B: 15Q (45min, calc)' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 90,
        questions: 6,
        description: 'Choose calculator vs non-calculator FRQs',
        subSections: [
          { id: 'calculator-frq', name: 'Calculator FRQ', time: 30, questions: 2, description: 'Calculator-allowed FRQs' },
          { id: 'no-calculator-frq', name: 'No Calculator FRQ', time: 60, questions: 4, description: 'No calculator FRQs' },
          { id: 'all-frq', name: 'All FRQs', time: 90, questions: 6, description: 'Complete FRQ section' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 51, description: 'Complete AP Calculus BC exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Limits and Continuity', topics: ['Limits', 'Continuity', 'Intermediate Value Theorem', 'Asymptotes'] },
      { id: 'unit2', name: 'Unit 2: Differentiation: Definition and Fundamental Properties', topics: ['Definition of derivative', 'Derivative rules', 'Higher-order derivatives'] },
      { id: 'unit3', name: 'Unit 3: Differentiation: Composite, Implicit, and Inverse Functions', topics: ['Chain rule', 'Implicit differentiation', 'Inverse functions'] },
      { id: 'unit4', name: 'Unit 4: Contextual Applications of Differentiation', topics: ['Related rates', 'Linear approximation', 'L\'Hopital\'s rule'] },
      { id: 'unit5', name: 'Unit 5: Analytical Applications of Differentiation', topics: ['Mean Value Theorem', 'Extrema', 'Curve sketching', 'Optimization'] },
      { id: 'unit6', name: 'Unit 6: Integration and Accumulation of Change', topics: ['Antiderivatives', 'Riemann sums', 'Fundamental Theorem of Calculus'] },
      { id: 'unit7', name: 'Unit 7: Differential Equations', topics: ['Slope fields', 'Separation of variables', 'Exponential growth'] },
      { id: 'unit8', name: 'Unit 8: Applications of Integration', topics: ['Area between curves', 'Volume', 'Arc length', 'Average value'] },
      { id: 'unit9', name: 'Unit 9: Parametric Equations, Polar Coordinates, and Vector-Valued Functions', topics: ['Parametric equations', 'Polar coordinates', 'Vector-valued functions'] },
      { id: 'unit10', name: 'Unit 10: Infinite Sequences and Series', topics: ['Sequences', 'Series', 'Convergence tests', 'Power series', 'Taylor series'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Chinese Language and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 100, questions: 70, description: 'Listening (40min) + Reading (60min)' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 2, description: 'Writing (2 tasks), no speaking tasks' },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 72, description: 'Complete AP Chinese exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Personal and Public Identity', topics: ['Personal relationships', 'Family', 'Individual identity', 'Community values'] },
      { id: 'unit2', name: 'Unit 2: Contemporary Life', topics: ['Education', 'Travel and leisure', 'Lifestyle', 'Urban vs rural'] },
      { id: 'unit3', name: 'Unit 3: Science and Technology', topics: ['Innovation', 'Communication technology', 'Environmental issues', 'Medical advances'] },
      { id: 'unit4', name: 'Unit 4: Beauty and Aesthetics', topics: ['Arts and literature', 'Traditional and modern art', 'Cultural expressions', 'Aesthetic values'] },
      { id: 'unit5', name: 'Unit 5: Global Challenges', topics: ['Economic development', 'Globalization', 'Environmental protection', 'Social issues'] },
      { id: 'unit6', name: 'Unit 6: Families in Different Societies', topics: ['Family structure', 'Generational differences', 'Cultural traditions', 'Social changes'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Computer Science A': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 40, description: 'Code analysis, algorithms, OOP' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 4, description: 'Q1: Methods & Control Structures, Q2: Classes, Q3: Arrays/ArrayLists, Q4: 2D Arrays/Algorithms' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 44, description: 'Complete AP Computer Science A exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Primitive Types', topics: ['Variables', 'Data types', 'Expressions', 'Assignment statements'] },
      { id: 'unit2', name: 'Unit 2: Using Objects', topics: ['Objects', 'Classes', 'Methods', 'String class'] },
      { id: 'unit3', name: 'Unit 3: Boolean Expressions and if Statements', topics: ['Boolean expressions', 'if statements', 'if-else statements', 'Logical operators'] },
      { id: 'unit4', name: 'Unit 4: Iteration', topics: ['while loops', 'for loops', 'Nested loops', 'Loop analysis'] },
      { id: 'unit5', name: 'Unit 5: Writing Classes', topics: ['Class design', 'Constructors', 'Instance variables', 'Methods'] },
      { id: 'unit6', name: 'Unit 6: Array', topics: ['Array creation', 'Array traversal', 'Array algorithms', 'Array processing'] },
      { id: 'unit7', name: 'Unit 7: ArrayList', topics: ['ArrayList class', 'ArrayList methods', 'ArrayList traversal', 'ArrayList algorithms'] },
      { id: 'unit8', name: 'Unit 8: 2D Array', topics: ['2D array creation', '2D array traversal', '2D array algorithms', 'Row-major order'] },
      { id: 'unit9', name: 'Unit 9: Inheritance', topics: ['Inheritance hierarchy', 'super keyword', 'Method overriding', 'Polymorphism'] },
      { id: 'unit10', name: 'Unit 10: Recursion', topics: ['Recursive algorithms', 'Base cases', 'Recursive calls', 'Binary search'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Computer Science Principles': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 120, questions: 70, description: 'Computational thinking and programming concepts' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Physics 1': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Conceptual understanding and problem solving' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: 'Experimental Design, Quantitative/Qualitative, Short Answer' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 55, description: 'Complete AP Physics 1 exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Kinematics', topics: ['Motion in one dimension', 'Motion in two dimensions', 'Acceleration', 'Projectile motion'] },
      { id: 'unit2', name: 'Unit 2: Dynamics', topics: ['Newton\'s laws', 'Free body diagrams', 'Forces', 'Friction'] },
      { id: 'unit3', name: 'Unit 3: Circular Motion and Gravitation', topics: ['Centripetal acceleration', 'Universal gravitation', 'Orbital motion'] },
      { id: 'unit4', name: 'Unit 4: Energy', topics: ['Work', 'Kinetic energy', 'Potential energy', 'Conservation of energy'] },
      { id: 'unit5', name: 'Unit 5: Momentum', topics: ['Impulse and momentum', 'Conservation of momentum', 'Collisions'] },
      { id: 'unit6', name: 'Unit 6: Simple Harmonic Motion', topics: ['Springs', 'Pendulums', 'Wave properties'] },
      { id: 'unit7', name: 'Unit 7: Torque and Rotational Motion', topics: ['Torque', 'Angular velocity', 'Rotational inertia'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Physics 2': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Advanced physics concepts' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: 'Complex problem solving and lab analysis' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 55, description: 'Complete AP Physics 2 exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Fluids', topics: ['Fluid statics', 'Buoyancy', 'Fluid dynamics', 'Bernoulli\'s equation'] },
      { id: 'unit2', name: 'Unit 2: Thermodynamics', topics: ['Temperature', 'Heat', 'Laws of thermodynamics', 'Kinetic theory'] },
      { id: 'unit3', name: 'Unit 3: Electric Force, Field, and Potential', topics: ['Coulomb\'s law', 'Electric fields', 'Electric potential'] },
      { id: 'unit4', name: 'Unit 4: Electric Circuits', topics: ['Current', 'Resistance', 'Capacitors', 'Circuit analysis'] },
      { id: 'unit5', name: 'Unit 5: Magnetism and Electromagnetic Induction', topics: ['Magnetic fields', 'Electromagnetic induction', 'Faraday\'s law'] },
      { id: 'unit6', name: 'Unit 6: Geometric and Physical Optics', topics: ['Reflection', 'Refraction', 'Lenses', 'Interference'] },
      { id: 'unit7', name: 'Unit 7: Quantum, Atomic, and Nuclear Physics', topics: ['Photons', 'Atomic structure', 'Nuclear physics'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Physics C: Mechanics': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 45, questions: 35, description: 'Classical mechanics with calculus' },
      { id: 'frq', name: 'Free Response', time: 45, questions: 3, description: 'Calculus-based mechanics problems' },
      { id: 'full', name: 'Full Practice Test', time: 90, questions: 38, description: 'Complete AP Physics C: Mechanics exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Physics C: Electricity and Magnetism': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 45, questions: 35, description: 'Electromagnetism with calculus' },
      { id: 'frq', name: 'Free Response', time: 45, questions: 3, description: 'Calculus-based E&M problems' },
      { id: 'full', name: 'Full Practice Test', time: 90, questions: 38, description: 'Complete AP Physics C: E&M exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Statistics': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 40, description: 'Statistical concepts and analysis' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: '1 collecting data + 1 exploring data + 1 probability/sampling + 1 inference + 1 combining skills' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 45, description: 'Complete AP Statistics exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Exploring One-Variable Data', topics: ['Analyzing categorical data', 'Analyzing quantitative data', 'Comparing distributions'] },
      { id: 'unit2', name: 'Unit 2: Exploring Two-Variable Data', topics: ['Scatterplots', 'Correlation', 'Least-squares regression', 'Residuals'] },
      { id: 'unit3', name: 'Unit 3: Collecting Data', topics: ['Planning studies', 'Sampling', 'Experiments', 'Observational studies'] },
      { id: 'unit4', name: 'Unit 4: Probability, Random Variables, and Probability Distributions', topics: ['Probability', 'Conditional probability', 'Random variables', 'Probability distributions'] },
      { id: 'unit5', name: 'Unit 5: Sampling Distributions', topics: ['Sampling distribution of sample proportion', 'Sampling distribution of sample mean', 'Central Limit Theorem'] },
      { id: 'unit6', name: 'Unit 6: Inference for Categorical Data: Proportions', topics: ['Confidence intervals', 'Significance tests', 'Chi-square tests'] },
      { id: 'unit7', name: 'Unit 7: Inference for Quantitative Data: Means', topics: ['t-procedures', 'Comparing two means', 'Paired data'] },
      { id: 'unit8', name: 'Unit 8: Inference for Categorical Data: Chi-Square', topics: ['Chi-square goodness of fit', 'Chi-square test of independence'] },
      { id: 'unit9', name: 'Unit 9: Inference for Quantitative Data: Slopes', topics: ['Inference for slope of regression line', 'Transformations'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP U.S. History': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 55, questions: 55, description: 'Historical analysis and interpretation' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 140,
        questions: 5,
        description: 'Choose specific FRQ types or take all written responses',
        subSections: [
          { id: 'saq-only', name: 'SAQ Only', time: 40, questions: 3, description: 'Short Answer Questions only' },
          { id: 'dbq-only', name: 'DBQ Only', time: 60, questions: 1, description: 'Document-Based Question only' },
          { id: 'leq-only', name: 'LEQ Only', time: 40, questions: 1, description: 'Long Essay Question only' },
          { id: 'all-frq', name: 'All FRQs', time: 140, questions: 5, description: 'SAQ + DBQ + LEQ' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 60, description: 'Complete AP US History exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Interactions between Native Americans and Europeans', periods: '1491-1607' },
      { id: 'unit2', name: 'Unit 2: Colonial Society and Culture', periods: '1607-1754' },
      { id: 'unit3', name: 'Unit 3: Road to Revolution and Revolution', periods: '1754-1800' },
      { id: 'unit4', name: 'Unit 4: Early Republic', periods: '1800-1848' },
      { id: 'unit5', name: 'Unit 5: Civil War and Reconstruction', periods: '1844-1877' },
      { id: 'unit6', name: 'Unit 6: Industrial Revolution and Gilded Age', periods: '1865-1898' },
      { id: 'unit7', name: 'Unit 7: Progressive Era and World War I', periods: '1890-1945' },
      { id: 'unit8', name: 'Unit 8: World War II and Post-War', periods: '1945-1980' },
      { id: 'unit9', name: 'Unit 9: Modern America', periods: '1980-Present' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  // Keep backward compatibility
  'AP US History': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 55, questions: 55, description: 'Historical analysis and interpretation' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 140,
        questions: 5,
        description: 'Choose specific FRQ types or take all written responses',
        subSections: [
          { id: 'saq-only', name: 'SAQ Only', time: 40, questions: 3, description: 'Short Answer Questions only' },
          { id: 'dbq-only', name: 'DBQ Only', time: 60, questions: 1, description: 'Document-Based Question only' },
          { id: 'leq-only', name: 'LEQ Only', time: 40, questions: 1, description: 'Long Essay Question only' },
          { id: 'all-frq', name: 'All FRQs', time: 140, questions: 5, description: 'SAQ + DBQ + LEQ' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 60, description: 'Complete AP US History exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Interactions between Native Americans and Europeans', periods: '1491-1607' },
      { id: 'unit2', name: 'Unit 2: Colonial Society and Culture', periods: '1607-1754' },
      { id: 'unit3', name: 'Unit 3: Road to Revolution and Revolution', periods: '1754-1800' },
      { id: 'unit4', name: 'Unit 4: Early Republic', periods: '1800-1848' },
      { id: 'unit5', name: 'Unit 5: Civil War and Reconstruction', periods: '1844-1877' },
      { id: 'unit6', name: 'Unit 6: Industrial Revolution and Gilded Age', periods: '1865-1898' },
      { id: 'unit7', name: 'Unit 7: Progressive Era and World War I', periods: '1890-1945' },
      { id: 'unit8', name: 'Unit 8: World War II and Post-War', periods: '1945-1980' },
      { id: 'unit9', name: 'Unit 9: Modern America', periods: '1980-Present' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP World History': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 55, questions: 55, description: 'Global historical analysis' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 140,
        questions: 5,
        description: 'Choose specific FRQ types or take all written responses',
        subSections: [
          { id: 'saq-only', name: 'SAQ Only', time: 40, questions: 3, description: 'Short Answer Questions only' },
          { id: 'dbq-only', name: 'DBQ Only', time: 60, questions: 1, description: 'Document-Based Question only' },
          { id: 'leq-only', name: 'LEQ Only', time: 40, questions: 1, description: 'Long Essay Question only' },
          { id: 'all-frq', name: 'All FRQs', time: 140, questions: 5, description: 'SAQ + DBQ + LEQ' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 60, description: 'Complete AP World History exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: The Global Tapestry', periods: 'c. 1200-1450' },
      { id: 'unit2', name: 'Unit 2: Networks of Exchange', periods: 'c. 1200-1450' },
      { id: 'unit3', name: 'Unit 3: Land-Based Empires', periods: 'c. 1450-1750' },
      { id: 'unit4', name: 'Unit 4: Transoceanic Interconnections', periods: 'c. 1450-1750' },
      { id: 'unit5', name: 'Unit 5: Revolutions', periods: 'c. 1750-1900' },
      { id: 'unit6', name: 'Unit 6: Consequences of Industrialization', periods: 'c. 1750-1900' },
      { id: 'unit7', name: 'Unit 7: Global Conflict', periods: 'c. 1900-present' },
      { id: 'unit8', name: 'Unit 8: Cold War and Decolonization', periods: 'c. 1900-present' },
      { id: 'unit9', name: 'Unit 9: Globalization', periods: 'c. 1900-present' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP European History': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 55, questions: 55, description: 'European historical analysis' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 140,
        questions: 5,
        description: 'Choose specific FRQ types or take all written responses',
        subSections: [
          { id: 'saq-only', name: 'SAQ Only', time: 40, questions: 3, description: 'Short Answer Questions only' },
          { id: 'dbq-only', name: 'DBQ Only', time: 60, questions: 1, description: 'Document-Based Question only' },
          { id: 'leq-only', name: 'LEQ Only', time: 40, questions: 1, description: 'Long Essay Question only' },
          { id: 'all-frq', name: 'All FRQs', time: 140, questions: 5, description: 'SAQ + DBQ + LEQ' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 60, description: 'Complete AP European History exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Renaissance and Exploration', periods: 'c. 1450-1648', topics: ['Italian Renaissance', 'Northern Renaissance', 'Age of Exploration', 'Commercial Revolution'] },
      { id: 'unit2', name: 'Unit 2: Age of Reformation', periods: 'c. 1450-1648', topics: ['Protestant Reformation', 'Catholic Reformation', 'Religious Wars', 'Witchcraft Trials'] },
      { id: 'unit3', name: 'Unit 3: Absolutism and Constitutionalism', periods: 'c. 1648-1815', topics: ['Louis XIV', 'Peter the Great', 'English Civil War', 'Glorious Revolution'] },
      { id: 'unit4', name: 'Unit 4: Scientific, Philosophical, and Political Developments', periods: 'c. 1648-1815', topics: ['Scientific Revolution', 'Enlightenment', 'Enlightened Despotism'] },
      { id: 'unit5', name: 'Unit 5: Conflict, Crisis, and Reaction', periods: 'c. 1648-1815', topics: ['French Revolution', 'Napoleonic Era', 'Congress of Vienna'] },
      { id: 'unit6', name: 'Unit 6: Industrialization and Its Effects', periods: 'c. 1815-1914', topics: ['Industrial Revolution', 'Nationalism', 'Liberalism', 'Socialism'] },
      { id: 'unit7', name: 'Unit 7: 19th-Century Perspectives and Political Developments', periods: 'c. 1815-1914', topics: ['Unification of Germany', 'Unification of Italy', 'New Imperialism', 'Fin de Siecle'] },
      { id: 'unit8', name: 'Unit 8: 20th-Century Global Conflicts', periods: 'c. 1914-present', topics: ['World War I', 'Russian Revolution', 'Interwar Period', 'World War II'] },
      { id: 'unit9', name: 'Unit 9: Cold War and Contemporary Europe', periods: 'c. 1945-present', topics: ['Cold War', 'Decolonization', 'European Integration', 'Fall of Communism'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP English Literature': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 55, description: 'Reading comprehension and literary analysis' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 120,
        questions: 3,
        description: 'Choose specific essay types or take all essays',
        subSections: [
          { id: 'poetry-only', name: 'Poetry Analysis Only', time: 40, questions: 1, description: 'Poetry analysis essay' },
          { id: 'prose-only', name: 'Prose Analysis Only', time: 40, questions: 1, description: 'Prose passage analysis essay' },
          { id: 'open-only', name: 'Open Question Only', time: 40, questions: 1, description: 'Literary argument essay' },
          { id: 'all-essays', name: 'All Essays', time: 120, questions: 3, description: 'All three essay types' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 58, description: 'Complete AP Literature exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Short Fiction I', topics: ['Character', 'Setting', 'Structure', 'Narration'] },
      { id: 'unit2', name: 'Unit 2: Poetry I', topics: ['Speaker', 'Imagery', 'Figurative language', 'Sound and rhythm'] },
      { id: 'unit3', name: 'Unit 3: Longer Fiction or Drama I', topics: ['Character development', 'Plot structure', 'Conflict', 'Point of view'] },
      { id: 'unit4', name: 'Unit 4: Short Fiction II', topics: ['Complexity', 'Ambiguity', 'Irony', 'Symbolism'] },
      { id: 'unit5', name: 'Unit 5: Poetry II', topics: ['Tone', 'Mood', 'Allusion', 'Form and meter'] },
      { id: 'unit6', name: 'Unit 6: Longer Fiction or Drama II', topics: ['Theme', 'Motif', 'Literary devices', 'Historical context'] },
      { id: 'unit7', name: 'Unit 7: Short Fiction III', topics: ['Comparative analysis', 'Multiple interpretations', 'Critical perspectives'] },
      { id: 'unit8', name: 'Unit 8: Poetry III', topics: ['Complex poetry', 'Intertextuality', 'Cultural contexts'] },
      { id: 'unit9', name: 'Unit 9: Longer Fiction or Drama III', topics: ['Synthesis', 'Literary criticism', 'Reader response'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP English Language and Composition': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 45, description: 'Reading comprehension and rhetorical analysis' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 135,
        questions: 3,
        description: 'Choose specific essay types or take all essays',
        subSections: [
          { id: 'synthesis-only', name: 'Synthesis Essay Only', time: 45, questions: 1, description: 'Argument using multiple sources' },
          { id: 'rhetorical-only', name: 'Rhetorical Analysis Only', time: 45, questions: 1, description: 'Analysis of rhetorical strategies' },
          { id: 'argument-only', name: 'Argument Essay Only', time: 45, questions: 1, description: 'Evidence-based argument essay' },
          { id: 'all-essays', name: 'All Essays', time: 135, questions: 3, description: 'Complete essay section' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 48, description: 'Complete AP Language exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Claims and Evidence', topics: ['Rhetorical situation', 'Claims and evidence', 'Reasoning and organization'] },
      { id: 'unit2', name: 'Unit 2: Reasoning and Organization', topics: ['Line of reasoning', 'Commentary', 'Complexity'] },
      { id: 'unit3', name: 'Unit 3: Style', topics: ['Word choice', 'Comparisons', 'Syntax'] },
      { id: 'unit4', name: 'Unit 4: Perspectives', topics: ['Perspective', 'Bias', 'Multiple viewpoints'] },
      { id: 'unit5', name: 'Unit 5: Context', topics: ['Context', 'Exigence', 'Purpose'] },
      { id: 'unit6', name: 'Unit 6: Arguments', topics: ['Method of development', 'Intro and conclusion', 'Transitions'] },
      { id: 'unit7', name: 'Unit 7: Research', topics: ['Sources', 'Research', 'Citation'] },
      { id: 'unit8', name: 'Unit 8: Comparison', topics: ['Comparison', 'Contrast', 'Synthesis'] },
      { id: 'unit9', name: 'Unit 9: Revision', topics: ['Revision', 'Style', 'Language and tone'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP English Literature and Composition': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 55, description: 'Reading comprehension and literary analysis' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 120,
        questions: 3,
        description: 'Choose specific essay types or take all essays',
        subSections: [
          { id: 'poetry-only', name: 'Poetry Analysis Only', time: 40, questions: 1, description: 'Poetry analysis essay' },
          { id: 'prose-only', name: 'Prose Analysis Only', time: 40, questions: 1, description: 'Prose passage analysis essay' },
          { id: 'open-only', name: 'Open Question Only', time: 40, questions: 1, description: 'Literary argument essay' },
          { id: 'all-essays', name: 'All Essays', time: 120, questions: 3, description: 'All three essay types' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 58, description: 'Complete AP Literature exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Short Fiction I', topics: ['Character', 'Setting', 'Structure', 'Narration'] },
      { id: 'unit2', name: 'Unit 2: Poetry I', topics: ['Speaker', 'Imagery', 'Figurative language', 'Sound and rhythm'] },
      { id: 'unit3', name: 'Unit 3: Longer Fiction or Drama I', topics: ['Character development', 'Plot structure', 'Conflict', 'Point of view'] },
      { id: 'unit4', name: 'Unit 4: Short Fiction II', topics: ['Complexity', 'Ambiguity', 'Irony', 'Symbolism'] },
      { id: 'unit5', name: 'Unit 5: Poetry II', topics: ['Tone', 'Mood', 'Allusion', 'Form and meter'] },
      { id: 'unit6', name: 'Unit 6: Longer Fiction or Drama II', topics: ['Theme', 'Motif', 'Literary devices', 'Historical context'] },
      { id: 'unit7', name: 'Unit 7: Short Fiction III', topics: ['Comparative analysis', 'Multiple interpretations', 'Critical perspectives'] },
      { id: 'unit8', name: 'Unit 8: Poetry III', topics: ['Complex poetry', 'Intertextuality', 'Cultural contexts'] },
      { id: 'unit9', name: 'Unit 9: Longer Fiction or Drama III', topics: ['Synthesis', 'Literary criticism', 'Reader response'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Government and Politics: Comparative': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 55, description: 'Comparative political systems and concepts' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 4, description: 'Concept Application, Quantitative Analysis, Comparative Analysis, Argument Essay' },
      { id: 'full', name: 'Full Practice Test', time: 150, questions: 59, description: 'Complete AP Comparative Government exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Political Systems, Regimes, and Governments', topics: ['Democratic and authoritarian regimes', 'Parliamentary and presidential systems', 'Federal and unitary systems'] },
      { id: 'unit2', name: 'Unit 2: Political Institutions', topics: ['Legislatures', 'Executives', 'Judiciaries', 'Bureaucracies'] },
      { id: 'unit3', name: 'Unit 3: Political Culture and Participation', topics: ['Political socialization', 'Political participation', 'Political culture', 'Civil society'] },
      { id: 'unit4', name: 'Unit 4: Party and Electoral Systems', topics: ['Electoral systems', 'Political parties', 'Interest groups', 'Social movements'] },
      { id: 'unit5', name: 'Unit 5: Political and Economic Changes and Development', topics: ['Economic liberalization', 'Democratization', 'Globalization', 'Political development'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Physics 1: Algebra-Based': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Conceptual understanding and problem solving' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: 'Experimental Design, Quantitative/Qualitative, Short Answer' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 55, description: 'Complete AP Physics 1 exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Kinematics', topics: ['Motion in one dimension', 'Motion in two dimensions', 'Acceleration', 'Projectile motion'] },
      { id: 'unit2', name: 'Unit 2: Dynamics', topics: ['Newton\'s laws', 'Free body diagrams', 'Forces', 'Friction'] },
      { id: 'unit3', name: 'Unit 3: Circular Motion and Gravitation', topics: ['Centripetal acceleration', 'Universal gravitation', 'Orbital motion'] },
      { id: 'unit4', name: 'Unit 4: Energy', topics: ['Work', 'Kinetic energy', 'Potential energy', 'Conservation of energy'] },
      { id: 'unit5', name: 'Unit 5: Momentum', topics: ['Impulse and momentum', 'Conservation of momentum', 'Collisions'] },
      { id: 'unit6', name: 'Unit 6: Simple Harmonic Motion', topics: ['Springs', 'Pendulums', 'Wave properties'] },
      { id: 'unit7', name: 'Unit 7: Torque and Rotational Motion', topics: ['Torque', 'Angular velocity', 'Rotational inertia'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Physics 2: Algebra-Based': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Advanced physics concepts' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: 'Complex problem solving and lab analysis' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 55, description: 'Complete AP Physics 2 exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Fluids', topics: ['Fluid statics', 'Buoyancy', 'Fluid dynamics', 'Bernoulli\'s equation'] },
      { id: 'unit2', name: 'Unit 2: Thermodynamics', topics: ['Temperature', 'Heat', 'Laws of thermodynamics', 'Kinetic theory'] },
      { id: 'unit3', name: 'Unit 3: Electric Force, Field, and Potential', topics: ['Coulomb\'s law', 'Electric fields', 'Electric potential'] },
      { id: 'unit4', name: 'Unit 4: Electric Circuits', topics: ['Current', 'Resistance', 'Capacitors', 'Circuit analysis'] },
      { id: 'unit5', name: 'Unit 5: Magnetism and Electromagnetic Induction', topics: ['Magnetic fields', 'Electromagnetic induction', 'Faraday\'s law'] },
      { id: 'unit6', name: 'Unit 6: Geometric and Physical Optics', topics: ['Reflection', 'Refraction', 'Lenses', 'Interference'] },
      { id: 'unit7', name: 'Unit 7: Quantum, Atomic, and Nuclear Physics', topics: ['Photons', 'Atomic structure', 'Nuclear physics'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP World History: Modern': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 55, questions: 55, description: 'Global historical analysis' },
      {
        id: 'frq',
        name: 'Free Response Questions',
        time: 140,
        questions: 5,
        description: 'Choose specific FRQ types or take all written responses',
        subSections: [
          { id: 'saq-only', name: 'SAQ Only', time: 40, questions: 3, description: 'Short Answer Questions only' },
          { id: 'dbq-only', name: 'DBQ Only', time: 60, questions: 1, description: 'Document-Based Question only' },
          { id: 'leq-only', name: 'LEQ Only', time: 40, questions: 1, description: 'Long Essay Question only' },
          { id: 'all-frq', name: 'All FRQs', time: 140, questions: 5, description: 'SAQ + DBQ + LEQ' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 195, questions: 60, description: 'Complete AP World History exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: The Global Tapestry', periods: 'c. 1200-1450', topics: ['Song Dynasty', 'Dar al-Islam', 'South and Southeast Asia', 'State building in the Americas'] },
      { id: 'unit2', name: 'Unit 2: Networks of Exchange', periods: 'c. 1200-1450', topics: ['Silk Roads', 'Indian Ocean trading', 'Trans-Saharan trade', 'Cultural consequences of connectivity'] },
      { id: 'unit3', name: 'Unit 3: Land-Based Empires', periods: 'c. 1450-1750', topics: ['Empires expand', 'Administration of empires', 'Belief systems', 'Comparison of methods of imperial expansion'] },
      { id: 'unit4', name: 'Unit 4: Transoceanic Interconnections', periods: 'c. 1450-1750', topics: ['Technological innovations', 'Exploration', 'Columbian Exchange', 'Maritime empires'] },
      { id: 'unit5', name: 'Unit 5: Revolutions', periods: 'c. 1750-1900', topics: ['Enlightenment', 'Nationalism and revolutions', 'Industrial Revolution', 'Comparison of revolutions'] },
      { id: 'unit6', name: 'Unit 6: Consequences of Industrialization', periods: 'c. 1750-1900', topics: ['Rationales for imperialism', 'State expansion', 'Indigenous responses to state expansion', 'Global migration'] },
      { id: 'unit7', name: 'Unit 7: Global Conflict', periods: 'c. 1900-present', topics: ['Shifting power after 1900', 'World War I', 'Interwar period', 'World War II'] },
      { id: 'unit8', name: 'Unit 8: Cold War and Decolonization', periods: 'c. 1900-present', topics: ['Setting the stage for the Cold War', 'The Cold War', 'Decolonization after 1900', 'Newly independent states'] },
      { id: 'unit9', name: 'Unit 9: Globalization', periods: 'c. 1900-present', topics: ['Advances in technology and exchange', 'Technological advances', 'Disease and epidemics', 'Economics of globalization'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Psychology': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 70, questions: 100, description: 'Psychological concepts and research methods' },
      { id: 'frq', name: 'Free Response', time: 50, questions: 2, description: 'Application and analysis questions' },
      { id: 'full', name: 'Full Practice Test', time: 120, questions: 102, description: 'Complete AP Psychology exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Scientific Foundations of Psychology', topics: ['History and approaches', 'Research methods', 'Statistical analysis', 'Ethics in research'] },
      { id: 'unit2', name: 'Unit 2: Biological Bases of Behavior', topics: ['Interaction of heredity and environment', 'The nervous system', 'The endocrine system', 'Sleep and dreaming'] },
      { id: 'unit3', name: 'Unit 3: Sensation and Perception', topics: ['Sensation', 'Perception', 'Attention', 'Perceptual organization'] },
      { id: 'unit4', name: 'Unit 4: Learning', topics: ['Classical conditioning', 'Operant conditioning', 'Cognitive processes in learning', 'Social learning'] },
      { id: 'unit5', name: 'Unit 5: Cognitive Psychology', topics: ['Memory', 'Thinking and problem solving', 'Language', 'Intelligence'] },
      { id: 'unit6', name: 'Unit 6: Developmental Psychology', topics: ['Life-span development', 'Physical development', 'Cognitive development', 'Social development'] },
      { id: 'unit7', name: 'Unit 7: Personality', topics: ['Personality theories', 'Assessment of personality', 'Self-concept and self-esteem', 'Growth and adjustment'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Environmental Science': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 80, description: 'Environmental concepts and data analysis' },
      { id: 'frq', name: 'Free Response', time: 70, questions: 3, description: 'Design investigation, analyze problems, solve with calculations' },
      { id: 'full', name: 'Full Practice Test', time: 160, questions: 83, description: 'Complete AP Environmental Science exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: The Living World: Ecosystems', topics: ['Introduction to ecosystems', 'Terrestrial biomes', 'Aquatic biomes', 'Carbon cycle'] },
      { id: 'unit2', name: 'Unit 2: The Living World: Biodiversity', topics: ['Biodiversity', 'Ecosystem services', 'Island biogeography', 'Ecological tolerance'] },
      { id: 'unit3', name: 'Unit 3: Populations', topics: ['Population ecology', 'Human population dynamics', 'Demographic transition'] },
      { id: 'unit4', name: 'Unit 4: Earth Systems and Resources', topics: ['Plate tectonics', 'Soil formation', 'Atmosphere', 'Global wind patterns'] },
      { id: 'unit5', name: 'Unit 5: Land and Water Use', topics: ['Tragedy of the commons', 'Clearcutting', 'Green revolution', 'Impacts of irrigation'] },
      { id: 'unit6', name: 'Unit 6: Energy Resources and Consumption', topics: ['Renewable energy', 'Fossil fuels', 'Nuclear power', 'Energy conservation'] },
      { id: 'unit7', name: 'Unit 7: Atmospheric Pollution', topics: ['Air pollution', 'Photochemical smog', 'Acid rain', 'Ozone depletion'] },
      { id: 'unit8', name: 'Unit 8: Aquatic and Terrestrial Pollution', topics: ['Water pollution', 'Solid waste', 'Waste reduction methods', 'Sewage treatment'] },
      { id: 'unit9', name: 'Unit 9: Global Change', topics: ['Stratospheric ozone depletion', 'Global warming', 'Ocean warming', 'Invasive species'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Macroeconomics': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 70, questions: 60, description: 'Macroeconomic concepts and graphs' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 60,
        questions: 3,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'long-frq', name: 'Long FRQ Only', time: 25, questions: 1, description: 'Long economic analysis question' },
          { id: 'short-frq', name: 'Short FRQs Only', time: 35, questions: 2, description: 'Short response questions' },
          { id: 'all-frq', name: 'All FRQs', time: 60, questions: 3, description: '1 Long + 2 Short FRQs' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 130, questions: 63, description: 'Complete AP Macroeconomics exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Microeconomics': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 70, questions: 60, description: 'Microeconomic concepts and market analysis' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 60,
        questions: 3,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'long-frq', name: 'Long FRQ Only', time: 25, questions: 1, description: 'Long market analysis question' },
          { id: 'short-frq', name: 'Short FRQs Only', time: 35, questions: 2, description: 'Short response questions' },
          { id: 'all-frq', name: 'All FRQs', time: 60, questions: 3, description: '1 Long + 2 Short FRQs' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 130, questions: 63, description: 'Complete AP Microeconomics exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP U.S. Government and Politics': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 80, questions: 55, description: 'Political concepts and institutions' },
      { id: 'frq', name: 'Free Response', time: 100, questions: 4, description: 'Concept Application, Quantitative Analysis, Court Comparison, Argumentative Essay' },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 59, description: 'Complete AP US Government exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Comparative Government': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 55, description: 'Comparative political systems and concepts' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 4, description: 'Concept Application, Quantitative Analysis, Comparative Analysis, Argument Essay' },
      { id: 'full', name: 'Full Practice Test', time: 150, questions: 59, description: 'Complete AP Comparative Government exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Human Geography': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 60, description: 'Geographic concepts and spatial analysis' },
      { id: 'frq', name: 'Free Response', time: 75, questions: 3, description: 'Concept application, spatial analysis, data interpretation' },
      { id: 'full', name: 'Full Practice Test', time: 135, questions: 63, description: 'Complete AP Human Geography exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP French Language and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 100, questions: 70, description: 'Listening (40min) + Reading (60min)' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 2, description: 'Writing (2 tasks), no speaking tasks' },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 72, description: 'Complete AP French exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Families and Communities', topics: ['Family structure', 'Community traditions', 'Cultural values', 'Social relationships'] },
      { id: 'unit2', name: 'Unit 2: Personal and Public Identity', topics: ['Individual identity', 'Social identity', 'Cultural identity', 'Personal values'] },
      { id: 'unit3', name: 'Unit 3: Beauty and Aesthetics', topics: ['Arts and literature', 'Fashion and style', 'Architecture', 'Cultural expressions'] },
      { id: 'unit4', name: 'Unit 4: Science and Technology', topics: ['Innovation', 'Communication technology', 'Medical advances', 'Environmental technology'] },
      { id: 'unit5', name: 'Unit 5: Contemporary Life', topics: ['Education', 'Careers', 'Leisure activities', 'Urban vs rural life'] },
      { id: 'unit6', name: 'Unit 6: Global Challenges', topics: ['Environmental issues', 'Economic challenges', 'Social justice', 'Global cooperation'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP German Language and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 100, questions: 70, description: 'Listening (40min) + Reading (60min)' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 2, description: 'Writing (2 tasks), no speaking tasks' },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 72, description: 'Complete AP German exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Families and Communities', topics: ['Family dynamics', 'Community involvement', 'Social customs', 'Regional differences'] },
      { id: 'unit2', name: 'Unit 2: Personal and Public Identity', topics: ['Individual expression', 'Cultural heritage', 'National identity', 'Personal beliefs'] },
      { id: 'unit3', name: 'Unit 3: Beauty and Aesthetics', topics: ['German arts', 'Music and literature', 'Design and architecture', 'Cultural traditions'] },
      { id: 'unit4', name: 'Unit 4: Science and Technology', topics: ['German innovations', 'Engineering', 'Environmental technology', 'Digital culture'] },
      { id: 'unit5', name: 'Unit 5: Contemporary Life', topics: ['Education system', 'Work-life balance', 'Social welfare', 'Urban planning'] },
      { id: 'unit6', name: 'Unit 6: Global Challenges', topics: ['European integration', 'Immigration', 'Climate change', 'Economic cooperation'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Spanish Language and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 100, questions: 70, description: 'Listening (40min) + Reading (60min)' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 2, description: 'Writing (2 tasks), no speaking tasks' },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 72, description: 'Complete AP Spanish Language exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Families and Communities', topics: ['Family relationships', 'Community traditions', 'Social customs', 'Cultural celebrations'] },
      { id: 'unit2', name: 'Unit 2: Personal and Public Identity', topics: ['Individual identity', 'Cultural heritage', 'Social roles', 'Personal values'] },
      { id: 'unit3', name: 'Unit 3: Beauty and Aesthetics', topics: ['Hispanic arts', 'Literature and poetry', 'Music and dance', 'Visual arts'] },
      { id: 'unit4', name: 'Unit 4: Science and Technology', topics: ['Medical advances', 'Communication technology', 'Environmental science', 'Innovation'] },
      { id: 'unit5', name: 'Unit 5: Contemporary Life', topics: ['Education systems', 'Career opportunities', 'Entertainment', 'Daily routines'] },
      { id: 'unit6', name: 'Unit 6: Global Challenges', topics: ['Immigration', 'Economic development', 'Environmental issues', 'Social justice'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Spanish Literature and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Text Analysis (30min) + Reading (60min)' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 100,
        questions: 4,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'short-answer', name: 'Short Answer Only', time: 30, questions: 2, description: '2 Short Answer Questions' },
          { id: 'essays', name: 'Essays Only', time: 70, questions: 2, description: 'Text Analysis + Thematic Essay' },
          { id: 'all-frq', name: 'All FRQs', time: 100, questions: 4, description: '2 Short Answer + 2 Essays' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 54, description: 'Complete AP Spanish Literature exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Italian Language and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 100, questions: 70, description: 'Listening (40min) + Reading (60min)' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 4, description: 'Writing (2 tasks) + Speaking (2 tasks)' },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 74, description: 'Complete AP Italian exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Japanese Language and Culture': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 100, questions: 70, description: 'Listening (40min) + Reading (60min)' },
      { id: 'frq', name: 'Free Response', time: 90, questions: 4, description: 'Writing (2 tasks) + Speaking (2 tasks)' },
      { id: 'full', name: 'Full Practice Test', time: 190, questions: 74, description: 'Complete AP Japanese exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Latin': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 50, description: 'Vergil & Caesar passages' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 120,
        questions: 3,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'translation', name: 'Translation Only', time: 40, questions: 1, description: 'Translation passage' },
          { id: 'short-answer', name: 'Short Answer Only', time: 40, questions: 1, description: 'Short answer questions' },
          { id: 'essay', name: 'Essay Only', time: 40, questions: 1, description: 'Analytical essay' },
          { id: 'all-frq', name: 'All FRQs', time: 120, questions: 3, description: 'Translation + Short Answer + Essay' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 53, description: 'Complete AP Latin exam simulation' }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Art History': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 60, questions: 80, description: 'Art identification, analysis, and attribution' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 120,
        questions: 6,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'short-frq', name: 'Short FRQs Only', time: 60, questions: 4, description: '4 short FRQ questions' },
          { id: 'long-frq', name: 'Long FRQs Only', time: 60, questions: 2, description: '2 long essay questions' },
          { id: 'all-frq', name: 'All FRQs', time: 120, questions: 6, description: '4 Short + 2 Long FRQs' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 180, questions: 86, description: 'Complete AP Art History exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Global Prehistory, 30,000-500 B.C.E.', topics: ['Cave paintings', 'Megalithic architecture', 'Neolithic art', 'Stonehenge'] },
      { id: 'unit2', name: 'Unit 2: Ancient Mediterranean, 3500 B.C.E.-300 C.E.', topics: ['Egyptian art', 'Greek art', 'Roman art', 'Mesopotamian art'] },
      { id: 'unit3', name: 'Unit 3: Early Europe and Colonial Americas, 200-1750 C.E.', topics: ['Byzantine art', 'Gothic', 'Renaissance', 'Baroque'] },
      { id: 'unit4', name: 'Unit 4: Later Europe and Americas, 1750-1980 C.E.', topics: ['Neoclassicism', 'Romanticism', 'Impressionism', 'Modernism'] },
      { id: 'unit5', name: 'Unit 5: Indigenous Americas, 1000 B.C.E.-1980 C.E.', topics: ['Maya', 'Aztec', 'Inca', 'Native North American art'] },
      { id: 'unit6', name: 'Unit 6: Africa, 1100-1980 C.E.', topics: ['West African art', 'Benin bronzes', 'Kongo art', 'Ethiopian art'] },
      { id: 'unit7', name: 'Unit 7: West and Central Asia, 500 B.C.E.-1980 C.E.', topics: ['Islamic art', 'Persian art', 'Ottoman architecture', 'Mughal art'] },
      { id: 'unit8', name: 'Unit 8: South, East, and Southeast Asia, 300 B.C.E.-1980 C.E.', topics: ['Buddhist art', 'Hindu art', 'Chinese art', 'Japanese art'] },
      { id: 'unit9', name: 'Unit 9: The Pacific, 700-1980 C.E.', topics: ['Polynesian art', 'Melanesian art', 'Aboriginal Australian art'] },
      { id: 'unit10', name: 'Unit 10: Global Contemporary, 1980 C.E. to Present', topics: ['Installation art', 'Performance art', 'Digital art', 'Globalization in art'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Music Theory': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 80, questions: 75, description: 'Pitch, rhythm, harmony, and form analysis' },
      {
        id: 'frq',
        name: 'Free Response',
        time: 80,
        questions: 7,
        description: 'Choose FRQ type or take all',
        subSections: [
          { id: 'written-frq', name: 'Written FRQs Only', time: 60, questions: 5, description: 'Part-writing, harmonization, and composition' },
          { id: 'aural-frq', name: 'Aural Skills Only', time: 20, questions: 2, description: 'Sight-singing and melodic dictation' },
          { id: 'all-frq', name: 'All FRQs', time: 80, questions: 7, description: '5 Written + 2 Aural FRQs' }
        ]
      },
      { id: 'full', name: 'Full Practice Test', time: 160, questions: 82, description: 'Complete AP Music Theory exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Pitch, Scales, and Key Signatures', topics: ['Staff notation', 'Major scales', 'Key signatures', 'Intervals'] },
      { id: 'unit2', name: 'Unit 2: Minor Scales, Melody, and Timbre', topics: ['Minor scales', 'Melodic analysis', 'Instrument timbres', 'Texture'] },
      { id: 'unit3', name: 'Unit 3: Triads and Seventh Chords', topics: ['Triad types', 'Seventh chords', 'Inversions', 'Roman numeral analysis'] },
      { id: 'unit4', name: 'Unit 4: Chord Function and Cadences', topics: ['Harmonic function', 'Authentic cadences', 'Half cadences', 'Deceptive cadences'] },
      { id: 'unit5', name: 'Unit 5: Chord Progressions', topics: ['Common progressions', 'Predominant function', 'Voice leading', 'Part writing'] },
      { id: 'unit6', name: 'Unit 6: Embellishments and Melodic Devices', topics: ['Non-chord tones', 'Suspensions', 'Passing tones', 'Neighbor tones'] },
      { id: 'unit7', name: 'Unit 7: Secondary Function and Modulation', topics: ['Secondary dominants', 'Modulation', 'Tonicization', 'Pivot chords'] },
      { id: 'unit8', name: 'Unit 8: Modes and Form', topics: ['Modal scales', 'Binary form', 'Ternary form', 'Sonata form'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  },
  'AP Precalculus': {
    sections: [
      { id: 'mcq', name: 'Multiple Choice', time: 120, questions: 40, description: 'Part A: 28Q (80min, no calc) + Part B: 12Q (40min, calc)' },
      { id: 'full', name: 'Full Practice Test', time: 120, questions: 40, description: 'Complete AP Precalculus exam simulation' }
    ],
    units: [
      { id: 'unit1', name: 'Unit 1: Polynomial and Rational Functions', topics: ['Polynomial functions', 'Rates of change', 'Complex zeros', 'Rational functions'] },
      { id: 'unit2', name: 'Unit 2: Exponential and Logarithmic Functions', topics: ['Exponential functions', 'Logarithmic functions', 'Exponential models', 'Composition'] },
      { id: 'unit3', name: 'Unit 3: Trigonometric and Polar Functions', topics: ['Periodic functions', 'Trigonometric functions', 'Trigonometric identities', 'Polar coordinates'] },
      { id: 'unit4', name: 'Unit 4: Functions Involving Parameters, Vectors, and Matrices', topics: ['Parametric functions', 'Vectors', 'Matrices', 'Linear transformations'] }
    ],
    difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
  }
};

// Default configuration for subjects not specifically defined
export const DEFAULT_CONFIG = {
  sections: [
    { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Content knowledge and application' },
    { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: 'Extended written responses' },
    { id: 'full', name: 'Full Practice Test', time: 180, questions: 55, description: 'Complete AP exam simulation' }
  ],
  difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
};

// Helper to get config for a subject with fallback to default
export const getTestConfig = (subject) => {
  return TEST_CONFIGURATIONS[subject] || DEFAULT_CONFIG;
};
