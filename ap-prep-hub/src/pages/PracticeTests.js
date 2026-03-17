import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCw, Flag, X, Brain, CheckCircle, Clock, ArrowLeft, Settings, Zap, Target, TrendingUp, Award, Trophy, FileQuestion, HelpCircle, Download, MessageSquare, ArrowRight } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui/UIComponents';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { AP_SUBJECTS } from '../constants/subjects';
import MarkdownRenderer from '../components/MarkdownRenderer';
import LaTeXRenderer from '../components/LaTeXRenderer';
import apiKeyManager from '../services/APIKeyManager';
import apiManager from '../services/apiManager';
import geminiService, { RateLimitError } from '../services/geminiService';
import ModelSelector, { getDefaultModel, saveSelectedModel } from '../components/ui/ModelSelector';

// Helper function to format time in seconds to MM:SS format
const formatTimeFromSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TEST_CONFIGURATIONS = {
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
      { id: 'unit4', name: 'Unit 4: Contextual Applications of Differentiation', topics: ['Related rates', 'Linear approximation', 'L\'Hôpital\'s rule'] },
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
      { id: 'unit4', name: 'Unit 4: Contextual Applications of Differentiation', topics: ['Related rates', 'Linear approximation', 'L\'Hôpital\'s rule'] },
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
      { id: 'unit7', name: 'Unit 7: 19th-Century Perspectives and Political Developments', periods: 'c. 1815-1914', topics: ['Unification of Germany', 'Unification of Italy', 'New Imperialism', 'Fin de Siècle'] },
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
      { id: 'unit1', name: 'Unit 1: Global Prehistory, 30,000–500 B.C.E.', topics: ['Cave paintings', 'Megalithic architecture', 'Neolithic art', 'Stonehenge'] },
      { id: 'unit2', name: 'Unit 2: Ancient Mediterranean, 3500 B.C.E.–300 C.E.', topics: ['Egyptian art', 'Greek art', 'Roman art', 'Mesopotamian art'] },
      { id: 'unit3', name: 'Unit 3: Early Europe and Colonial Americas, 200–1750 C.E.', topics: ['Byzantine art', 'Gothic', 'Renaissance', 'Baroque'] },
      { id: 'unit4', name: 'Unit 4: Later Europe and Americas, 1750–1980 C.E.', topics: ['Neoclassicism', 'Romanticism', 'Impressionism', 'Modernism'] },
      { id: 'unit5', name: 'Unit 5: Indigenous Americas, 1000 B.C.E.–1980 C.E.', topics: ['Maya', 'Aztec', 'Inca', 'Native North American art'] },
      { id: 'unit6', name: 'Unit 6: Africa, 1100–1980 C.E.', topics: ['West African art', 'Benin bronzes', 'Kongo art', 'Ethiopian art'] },
      { id: 'unit7', name: 'Unit 7: West and Central Asia, 500 B.C.E.–1980 C.E.', topics: ['Islamic art', 'Persian art', 'Ottoman architecture', 'Mughal art'] },
      { id: 'unit8', name: 'Unit 8: South, East, and Southeast Asia, 300 B.C.E.–1980 C.E.', topics: ['Buddhist art', 'Hindu art', 'Chinese art', 'Japanese art'] },
      { id: 'unit9', name: 'Unit 9: The Pacific, 700–1980 C.E.', topics: ['Polynesian art', 'Melanesian art', 'Aboriginal Australian art'] },
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
const DEFAULT_CONFIG = {
  sections: [
    { id: 'mcq', name: 'Multiple Choice', time: 90, questions: 50, description: 'Content knowledge and application' },
    { id: 'frq', name: 'Free Response', time: 90, questions: 5, description: 'Extended written responses' },
    { id: 'full', name: 'Full Practice Test', time: 180, questions: 55, description: 'Complete AP exam simulation' }
  ],
  difficulties: ['Easy', 'Medium', 'Hard', 'Standard AP Test']
};

const PracticeTests = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('setup'); // 'setup', 'test', 'scoring', 'results', 'history'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubSection, setSelectedSubSection] = useState('');
  const [selectedDifficulty] = useState('medium'); // Setter not currently used
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [customTime, setCustomTime] = useState('');
  const [useDefaultTime, setUseDefaultTime] = useState(true);
  const [useDefaultQuestionCount, setUseDefaultQuestionCount] = useState(true);
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedDBQDocument, setSelectedDBQDocument] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testPaused, setTestPaused] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [askingTutor, setAskingTutor] = useState(null);
  const [tutorProcessing, setTutorProcessing] = useState(null);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [generationProgress, setGenerationProgress] = useState({ generated: 0, total: 0 });
  const [selectedModel, setSelectedModel] = useState(getDefaultModel);
  
  // Subject name mapping for backward compatibility
  const getCanonicalSubjectName = (subjectName) => {
    const subjectMappings = {
      'AP English Language': 'AP English Language and Composition',
      'AP English Literature': 'AP English Literature and Composition',
      'AP Comparative Government': 'AP Government and Politics: Comparative',
      'AP Physics 1': 'AP Physics 1: Algebra-Based',
      'AP Physics 2': 'AP Physics 2: Algebra-Based',
      'AP World History': 'AP World History: Modern'
    };
    
    return subjectMappings[subjectName] || subjectName;
  };
  
  // Drawing canvas removed
  
  // Auto-sync settings persistence
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('aptest_autosync');
      return saved ? JSON.parse(saved) : false; // Default to false instead of true
    } catch (error) {
      console.error('Error loading autosync setting:', error);
      return false;
    }
  });
  
  // Mobile responsive settings
  const [isMobile, setIsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef(null);

  // Prepare dropdown options
  const subjectOptions = Object.keys(AP_SUBJECTS).map(key => ({
    value: key,
    label: AP_SUBJECTS[key].name
  }));

  // Helper function for AP score conversion
  const convertToAPScore = useCallback((percentage) => {
    if (percentage >= 75) return 5;
    if (percentage >= 50) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 30) return 2;
    return 1;
  }, []);

  // Helper functions first
  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Timer effect
  const getTimeSpent = useCallback(() => {
    const canonicalSubject = getCanonicalSubjectName(selectedSubject);
    const config = TEST_CONFIGURATIONS[canonicalSubject] || DEFAULT_CONFIG;
    const sectionConfig = config.sections.find(s => s.id === selectedSection);
    
    let totalTime;
    if (selectedSection === 'frq' && sectionConfig?.subSections) {
      if (selectedSubSection) {
        // Specific subsection selected
        const subSectionConfig = sectionConfig.subSections.find(sub => sub.id === selectedSubSection);
        totalTime = useDefaultTime 
          ? subSectionConfig?.time || 90
          : parseInt(customTime) || 90;
      } else {
        // No subsection selected, default to all-frq
        const allFrqConfig = sectionConfig.subSections.find(sub => sub.id === 'all-frq');
        totalTime = useDefaultTime 
          ? allFrqConfig?.time || 90
          : parseInt(customTime) || 90;
      }
    } else {
      totalTime = useDefaultTime 
        ? sectionConfig?.time || 90
        : parseInt(customTime) || 90;
    }
    
    return totalTime - Math.floor(timeRemaining / 60);
  }, [selectedSubject, selectedSection, selectedSubSection, useDefaultTime, customTime, timeRemaining]);

  // Helper function to clean breakdown objects
  const cleanBreakdownObject = useCallback((breakdown) => {
    if (!breakdown || typeof breakdown !== 'object') return {};

    const cleaned = {};
    Object.entries(breakdown).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // If value is an object, try to extract the score
        const extracted = value.score || value.points || value.value || 0;
        cleaned[key] = Number(extracted) || 0;
      } else {
        // If value is already primitive, use it
        cleaned[key] = Number(value) || 0;
      }
    });

    return cleaned;
  }, []);

  // Safe renderer for breakdown objects - handles both old and new safe formats

  // NUCLEAR SCAN: Force scan and clean testResults before any rendering
  const forceCleanTestResults = useCallback((results) => {
    if (!results) return results;
    
    const forceClean = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map((item, i) => forceClean(item, `${path}[${i}]`));
      }
      
      // Check if this is a part_* object
      if ('part_a' in obj || 'part_b' in obj || 'part_c' in obj || 'part_d' in obj) {
        console.log(`🔥 FORCE CLEAN: Converting part_* object at "${path}":`, obj);
        return `PART_SCORES: ${Object.entries(obj).map(([k, v]) => `${k}=${v}`).join(', ')}`;
      }
      
      const cleaned = {};
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        cleaned[key] = forceClean(value, currentPath);
      });
      
      return cleaned;
    };
    
    return forceClean(results, 'root');
  }, []);

  // Apply force cleaning to testResults before rendering
  const safeTestResults = useMemo(() => {
    if (!testResults) return null;
    return forceCleanTestResults(testResults);
  }, [testResults, forceCleanTestResults]);

  // EMERGENCY: Safe value renderer to prevent any object rendering as React children
  const renderSafeValue = useCallback((value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'object') {
      // If it's an array, join with commas
      if (Array.isArray(value)) {
        return value.map(renderSafeValue).join(', ');
      }
      // EMERGENCY: If it's a problematic part_* object, return safe string
      if ('part_a' in value || 'part_b' in value || 'part_c' in value || 'part_d' in value) {
        console.log('🚨 EMERGENCY renderSafeValue: Converting part_* object:', value);
        return `Parts: ${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
      }
      // Handle MCQ option objects specifically
      if (value.text !== undefined) {
        return String(value.text);
      }
      if (value.option !== undefined) {
        return String(value.option);
      }
      if (value.answer !== undefined) {
        return String(value.answer);
      }
      if (value.choice !== undefined) {
        return String(value.choice);
      }
      // For other objects, return JSON string as fallback
      try {
        return JSON.stringify(value);
      } catch (error) {
        console.error('Failed to stringify object in renderSafeValue:', error);
        return '[Object]';
      }
    }
    return String(value);
  }, []);

  const renderBreakdownSafely = useCallback((breakdown) => {
    if (!breakdown || typeof breakdown !== 'object') return null;
    
    // EMERGENCY: Check if this is still a problematic part_* object
    if ('part_a' in breakdown || 'part_b' in breakdown || 'part_c' in breakdown || 'part_d' in breakdown) {
      console.log('🚨 EMERGENCY: Detected part_* object in renderer, converting inline:', breakdown);
      // Convert inline as emergency fallback
      return Object.entries(breakdown).map(([part, score]) => (
        <div key={part} className="flex justify-between">
          <span className="text-content-secondary capitalize">{part.replace('_', ' ')}:</span>
          <span className="text-content-primary font-medium">{renderSafeValue(score)} pts</span>
        </div>
      ));
    }
    
    // Handle the new safe format
    if (breakdown.__safe_breakdown && breakdown.parts) {
      return breakdown.parts.map(({ name, score }) => (
        <div key={name} className="flex justify-between">
          <span className="text-content-secondary capitalize">{name.replace('_', ' ')}:</span>
          <span className="text-content-primary font-medium">{score} pts</span>
        </div>
      ));
    }
    
    // Handle old format (fallback safety)
    return Object.entries(breakdown).map(([part, score]) => {
      // Extra safety: ensure score is always a primitive
      let safeScore;
      if (typeof score === 'object' && score !== null) {
        safeScore = score.score || score.points || score.value || 0;
      } else {
        safeScore = score;
      }
      
      // Convert to string for absolute safety
      const scoreString = String(Number(safeScore) || 0);
      
      return (
        <div key={part} className="flex justify-between">
          <span className="text-content-secondary capitalize">{part.replace('_', ' ')}:</span>
          <span className="text-content-primary font-medium">{scoreString} pts</span>
        </div>
      );
    });
  }, [renderSafeValue]);

  // Comprehensive data sanitizer for all test results
  const sanitizeResultsData = useCallback((results) => {
    if (!results || typeof results !== 'object') return results;

    const sanitized = { ...results };

    // Clean breakdown data
    if (sanitized.breakdown) {
      sanitized.breakdown = cleanBreakdownObject(sanitized.breakdown);
    }

    // Clean questionResults
    if (sanitized.questionResults && Array.isArray(sanitized.questionResults)) {
      sanitized.questionResults = sanitized.questionResults.map((result) => {
        const cleanResult = { ...result };

        if (cleanResult.breakdown) {
          cleanResult.breakdown = cleanBreakdownObject(cleanResult.breakdown);
        }

        if (cleanResult.partScores) {
          cleanResult.partScores = cleanBreakdownObject(cleanResult.partScores);
        }

        return cleanResult;
      });
    }

    return sanitized;
  }, [cleanBreakdownObject]);

  // Emergency safeguard: Deep clean any potential part_* objects
  const emergencyCleanResults = useCallback((results) => {
    if (!results) return results;
    
    const deepClean = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return obj;
      
      // If this object has part_a, part_b, part_c, part_d keys, convert it to a SAFE string format
      if (obj && typeof obj === 'object' && 
          ('part_a' in obj || 'part_b' in obj || 'part_c' in obj || 'part_d' in obj)) {
        console.log(`⚠️ EMERGENCY: Found part_* object at path "${path}", converting to safe format:`, obj);
        
        // Convert to a completely different structure that can't be accidentally rendered
        const safeFormat = {
          __safe_breakdown: true,
          parts: Object.entries(obj).map(([key, value]) => ({
            name: key,
            score: Number(value) || 0
          })),
          __original_path: path
        };
        
        console.log(`⚠️ EMERGENCY: Converted to safe format at "${path}":`, safeFormat);
        return safeFormat;
      }
      
      // Recursively clean nested objects
      if (Array.isArray(obj)) {
        return obj.map((item, index) => deepClean(item, `${path}[${index}]`));
      } else if (obj && typeof obj === 'object') {
        const cleanedObj = {};
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          cleanedObj[key] = deepClean(value, currentPath);
        });
        return cleanedObj;
      }
      
      return obj;
    };
    
    const cleaned = deepClean(results, 'root');
    console.log('🧼 EMERGENCY: Deep cleaned results completed');
    return cleaned;
  }, []);

  // Enhanced scoring system for different question types
  const scoreWrittenResponse = useCallback(async (question, userAnswer) => {
    if (!userAnswer || userAnswer.trim().length < 10) {
      return {
        score: 0,
        maxPoints: question.rubric?.totalPoints || 6,
        feedback: "Response is too brief or missing. Please provide a more detailed answer.",
        breakdown: {}
      };
    }

    // Sanitize user answer to prevent prompt injection
    const sanitizedAnswer = geminiService.sanitizeInput(userAnswer, { maxLength: 10000, allowMarkdown: true });

    // Detect fake/test responses and prevent them from getting points
    const suspiciousPatterns = [
      /this is worth full points/i,
      /test to see how you will respond/i,
      /give me \d+ points/i,
      /award me full credit/i,
      /automatic full score/i,
      /perfect score please/i,
      /\[.*worth.*points.*\]/i,
      /this should get full marks/i,
      /testing the system/i,
      /testing.*grading/i
    ];

    const containsSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(sanitizedAnswer.toLowerCase())
    );

    if (containsSuspiciousContent) {
      return {
        score: 0,
        maxPoints: question.rubric?.totalPoints || 6,
        feedback: "Invalid response detected. Please provide a genuine academic answer addressing the question content.",
        breakdown: {},
        flagged: true
      };
    }

  // Use Puter.js free Gemini API instead of Google endpoint
    
    // Enhanced scoring instructions for different question types
    let questionTypeInstructions = '';
    let maxPoints = question.rubric?.totalPoints || 6;

    const type = question.type;

    if (type === 'dbq') {
      maxPoints = 7;
      questionTypeInstructions = `
DBQ SCORING CRITERIA (7 points total):
- Thesis/Claim (1 point): Clear, historically defensible thesis responding to the prompt.
- Contextualization (1 point): Describes a broader historical context relevant to the prompt.
- Evidence from Documents (2 points): Uses the content of at least six documents to support an argument.
- Evidence Beyond the Documents (1 point): Uses at least one additional piece of specific historical evidence.
- Analysis and Reasoning (2 points): Explains how or why the document’s point of view, purpose, historical situation, and/or audience is relevant to an argument for at least three documents. Demonstrates a complex understanding of the historical development that is the focus of the prompt.`;
    } else if (type === 'leq') {
      maxPoints = 6;
      questionTypeInstructions = `
LEQ SCORING CRITERIA (6 points total):
- Thesis/Claim (1 point): Responds to the prompt with a historically defensible thesis/claim that establishes a line of reasoning.
- Contextualization (1 point): Describes a broader historical context relevant to the prompt.
- Evidence (2 points): Provides specific examples of evidence relevant to the topic of the prompt and supports an argument in response to the prompt using specific and relevant examples of evidence.
- Analysis and Reasoning (2 points): Uses historical reasoning (e.g., comparison, causation, CCOT) to frame or structure an argument that addresses the prompt. Demonstrates a complex understanding.`;
    } else if (type === 'saq') {
      maxPoints = 3;
      questionTypeInstructions = `
SAQ SCORING CRITERIA (3 points total):
- Part A (1 point): Responds to the prompt with an accurate and specific historical claim.
- Part B (1 point): Responds to the prompt with an accurate and specific historical claim.
- Part C (1 point): Responds to the prompt with an accurate and specific historical claim.
Each point requires a direct answer to the prompt part with supporting evidence.`;
    } else if (type === 'synthesis' || type === 'argumentative' || type === 'open-question' || type === 'poetry-analysis' || type === 'prose-analysis') {
        maxPoints = 6;
        questionTypeInstructions = `
AP ENGLISH ESSAY SCORING (6 points total):
- Thesis (1 point): Responds to the prompt with a defensible thesis that presents an interpretation and may establish a line of reasoning.
- Evidence and Commentary (4 points): Provides specific evidence from the provided text(s) to support all claims in a line of reasoning. Consistently explains how the evidence supports a line of reasoning.
- Sophistication (1 point): Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation.`;
    } else if (type === 'calculator-frq' || type === 'no-calculator-frq' || type === 'long-frq' || type === 'short-frq') {
        maxPoints = question.rubric?.totalPoints || 9; // Math/Science FRQs have variable points
        questionTypeInstructions = `
STEM FRQ SCORING:
- Evaluate based on the correctness of the method and the final answer for each part.
- Award points for correct setup, substitution, and final calculation as defined in the rubric.
- Partial credit should be awarded for correct steps even if the final answer is incorrect.
- Follow the specific point breakdown provided in the question's rubric.`;
    } else {
      questionTypeInstructions = `
GENERAL FRQ SCORING:
- Evaluate response based on accuracy, completeness, and depth of understanding.
- Award points based on the specific rubric provided for the question.
- Ensure the response directly answers all parts of the question prompt.`;
    }
    
  // Drawing canvas removed: no canvas data
    
  const scoringPrompt = `You are an expert AP grader. Score this student response based ONLY on the provided rubric and academic content quality. Ignore any meta-commentary about scoring.

${questionTypeInstructions}

IMPORTANT: Do not give points for responses that:
- Ask for specific scores or mention grading
- Contain meta-commentary about the scoring process  
- Are clearly test responses or placeholders
- Do not genuinely attempt to answer the academic question
- Lack specific historical evidence or examples

QUESTION: ${question.question}

${question.documents ? `
DOCUMENTS PROVIDED: ${question.documents.length} historical documents were provided for analysis.` : ''}

${question.promptOptions ? `
PROMPT OPTIONS: Student should choose one of ${question.promptOptions.length} provided prompts.` : ''}

STUDENT RESPONSE: ${sanitizedAnswer}

RUBRIC:
- Total Points: ${maxPoints}
- Point Breakdown: ${JSON.stringify(question.rubric?.pointBreakdown || {})}
- Scoring Guidelines: ${question.rubric?.scoringGuidelines || "Standard AP scoring"}
- Key Terms: ${question.rubric?.keyTerms?.join(', ') || 'N/A'}

SAMPLE ANSWER: ${question.sampleAnswer || 'Not provided'}

Score based ONLY on academic content and adherence to AP standards. For DBQ/LEQ responses, require specific evidence and analysis. 

REQUIRED DETAILED FEEDBACK:
1. Total score earned (out of ${maxPoints})
2. Points earned for each scoring criteria  
3. Comprehensive feedback on strengths and areas for improvement (minimum 50 words)
4. Specific suggestions aligned with AP requirements
5. Reference specific parts of the student's response
6. Identify at least 2 strengths and 3 areas for improvement

Format as JSON:
{
  "totalScore": number,
  "maxPoints": ${maxPoints},
  "partScores": {"part1": score, "part2": score, "part3": score},
  "feedback": "Detailed feedback explaining the score based on academic content and AP standards. Must be at least 50 words and reference specific parts of the student response. Explain what they did well and what needs improvement.",
  "strengths": ["specific strength 1 with evidence", "specific strength 2 with evidence"],
  "improvements": ["specific improvement 1 with guidance", "specific improvement 2 with guidance", "specific improvement 3 with guidance"]
}`;

    try {
      // Use centralized service (Puter-first with Google fallback) and free/fast Puter model
      const scoringText = await geminiService.generateContent(scoringPrompt, {
        timeoutMs: 45000,
        temperature: 0.2,
        maxTokens: 1200
      });
      
      console.log('Scoring: Parsing AI response for scoring');
      
      // Use geminiService's robust JSON parsing first, fall back to parseAIResponse
      let scoring;
      const jsonResult = geminiService.parseJSON(scoringText, false);
      if (jsonResult.success) {
        scoring = jsonResult.data;
      } else {
        // Fall back to the local parsing function
        scoring = parseAIResponse(scoringText);
      }
      
      // Ensure partScores contains only numeric values
      const cleanPartScores = {};
      if (scoring.partScores && typeof scoring.partScores === 'object') {
        Object.entries(scoring.partScores).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // If value is an object, try to extract the score
            cleanPartScores[key] = value.score || value.points || 0;
          } else {
            // If value is already primitive, use it
            cleanPartScores[key] = Number(value) || 0;
          }
        });
      }
      
      return {
        score: scoring.totalScore || 0,
        maxPoints: scoring.maxPoints || maxPoints,
        feedback: scoring.feedback || "Response scored.",
        breakdown: cleanPartScores,
        strengths: scoring.strengths || [],
        improvements: scoring.improvements || []
      };
    } catch (error) {
      console.error('Error scoring response:', error);
      
      // Check for rate limit error
      if (error instanceof RateLimitError || error.isRateLimit ||
          (error.message && (error.message.includes('rate') || error.message.includes('quota') || error.message.includes('429')))) {
        const waitTime = error.retryAfter || 60;
        return {
          score: 0,
          maxPoints: maxPoints,
          feedback: `⏳ **AI Scoring Temporarily Unavailable**\n\nThe AI service is experiencing high demand. Please wait ${waitTime} seconds and try again.\n\nYour response has been saved and you can re-submit for scoring later.`,
          breakdown: {},
          strengths: [],
          improvements: ["Please retry scoring after the cooldown period"]
        };
      }
      
      // Fallback scoring - provide some points for reasonable effort
      const estimatedScore = userAnswer.length > 100 ? Math.floor(maxPoints * 0.4) : 0;
      return {
        score: estimatedScore,
        maxPoints: maxPoints,
        feedback: "This response shows some understanding of the topic. For detailed feedback, please try again.",
        breakdown: {},
        strengths: ["Shows some understanding of basic concepts"],
        improvements: ["Provide more specific examples", "Include more detailed analysis"]
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scoreQuestion = useCallback(async (question, userAnswer) => {
    if (question.type === 'mcq') {
      return {
        score: userAnswer === question.correctAnswer ? 1 : 0,
        maxPoints: 1,
        feedback: userAnswer === question.correctAnswer ? 
          "Correct! " + (question.explanation || "Good understanding of the concept.") :
          "Incorrect. " + (question.explanation || "Review this concept for better understanding.")
      };
    } else if (question.type === 'frq' || question.type === 'saq' || 
               question.type === 'dbq' || question.type === 'leq' ||
               question.type === 'synthesis' || question.type === 'rhetorical-analysis' ||
               question.type === 'argumentative' || question.type === 'poetry-analysis' ||
               question.type === 'prose-analysis' || question.type === 'open-question' ||
               question.type === 'long-frq' || question.type === 'short-frq' ||
               question.type === 'calculator-frq' || question.type === 'no-calculator-frq' ||
               question.type === 'short-answer' || question.type === 'essays') {
      // For all written response questions, use AI to score the response
      return await scoreWrittenResponse(question, userAnswer);
    }
    
    return { score: 0, maxPoints: 1, feedback: "Unable to score this question type." };
  }, [scoreWrittenResponse]);

  // Keyboard shortcuts for test navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (currentView === 'test' && !testPaused) {
        if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else if (e.key >= '1' && e.key <= '4' && questions[currentQuestionIndex]?.type === 'mcq') {
          const optionIndex = parseInt(e.key) - 1;
          if (optionIndex < questions[currentQuestionIndex].options.length) {
            handleAnswerSelect(questions[currentQuestionIndex].id, optionIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView, testPaused, currentQuestionIndex, questions]);

  // Reset selected DBQ document when question changes
  useEffect(() => {
    setSelectedDBQDocument(null);
  }, [currentQuestionIndex]);

  // Drawing canvas removed: no restore needed

  const calculateResults = useCallback(async () => {
    let score = 0;
    let totalPoints = 0;
    const questionResults = [];
    
    // Subject-specific scoring weights (based on official AP exam formats)
    const getSubjectWeights = (subject) => {
      if (subject.includes('History')) {
        return { mcq: 0.40, saq: 0.20, dbq: 0.25, leq: 0.15 };
      } else if (subject.includes('English Literature')) {
        return { mcq: 0.45, frq: 0.55, 'poetry-analysis': 0.183, 'prose-analysis': 0.183, 'open-question': 0.183 };
      } else if (subject.includes('English Language')) {
        return { mcq: 0.45, frq: 0.55, synthesis: 0.183, 'rhetorical-analysis': 0.183, argumentative: 0.183 };
      } else if (subject.includes('Calculus')) {
        return { mcq: 0.50, frq: 0.50, 'calculator-frq': 0.25, 'no-calculator-frq': 0.25 };
      } else if (subject.includes('Statistics')) {
        return { mcq: 0.50, frq: 0.50 };
      } else if (subject.includes('Biology') || subject.includes('Chemistry')) {
        return { mcq: 0.50, frq: 0.50, 'long-frq': 0.30, 'short-frq': 0.20 };
      } else if (subject.includes('Physics')) {
        return { mcq: 0.50, frq: 0.50 };
      } else if (subject.includes('Economics')) {
        return { mcq: 0.66, frq: 0.34, 'long-frq': 0.20, 'short-frq': 0.14 };
      } else if (subject.includes('Psychology')) {
        return { mcq: 0.67, frq: 0.33 };
      } else if (subject.includes('Environmental Science')) {
        return { mcq: 0.60, frq: 0.40 };
      } else if (subject.includes('Computer Science')) {
        return { mcq: 0.75, frq: 0.25 };
      } else if (subject.includes('Art History')) {
        return { mcq: 0.50, frq: 0.50, 'long-essay': 0.30, 'short-essay': 0.20 };
      } else if (subject.includes('Human Geography')) {
        return { mcq: 0.50, frq: 0.50 };
      } else if (subject.includes('Government') || subject.includes('Comparative')) {
        return { mcq: 0.50, frq: 0.50 };
      } else if (subject.includes('Spanish') || subject.includes('French') || subject.includes('German') || 
                 subject.includes('Italian') || subject.includes('Japanese') || subject.includes('Chinese')) {
        return { mcq: 0.50, frq: 0.50 };
      } else if (subject.includes('Latin')) {
        return { mcq: 0.50, frq: 0.50, translation: 0.20, 'short-answer': 0.15, essay: 0.15 };
      } else {
        // Default weights
        return { mcq: 0.50, frq: 0.50 };
      }
    };
    
    const weights = getSubjectWeights(selectedSubject);
    
    setIsGeneratingTest(true); // Show loading while scoring

    for (const question of questions) {
      const userAnswer = userAnswers[question.id];
      
      try {
  const result = await scoreQuestion(question, userAnswer);
        score += result.score;
        totalPoints += result.maxPoints;
        
        questionResults.push({
          questionId: question.id,
          correct: result.score === result.maxPoints,
          score: result.score,
          maxPoints: result.maxPoints,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer || question.sampleAnswer,
          feedback: result.feedback || question.explanation,
          breakdown: result.breakdown ? cleanBreakdownObject(result.breakdown) : {},
          strengths: result.strengths || [],
          improvements: result.improvements || []
        });
      } catch (error) {
        console.error('Error scoring question:', error);
        // Fallback scoring with proper points
        let questionScore = 0;
        let maxPoints = 1;
        const hasTextAnswer = userAnswer && String(userAnswer).trim().length > 0;

        if (question.type === 'mcq') {
          maxPoints = 1;
          questionScore = userAnswer === question.correctAnswer ? 1 : 0;
        } else if (question.type === 'saq') {
          maxPoints = 3;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        } else if (question.type === 'dbq') {
          maxPoints = 7;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        } else if (question.type === 'leq') {
          maxPoints = 6;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        } else if (
          question.type === 'frq' ||
          question.type === 'calculator-frq' ||
          question.type === 'no-calculator-frq'
        ) {
          maxPoints = 9;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        } else if (question.type === 'long-frq') {
          maxPoints = 10;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        } else if (question.type === 'short-frq') {
          maxPoints = 4;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        } else {
          maxPoints = question.points || question.rubric?.totalPoints || 6;
          questionScore = hasTextAnswer ? Math.floor(maxPoints * 0.6) : 0;
        }

        score += questionScore;
        totalPoints += maxPoints;
        
        questionResults.push({
          questionId: question.id,
          correct: questionScore === maxPoints,
          score: questionScore,
          maxPoints: maxPoints,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer || question.sampleAnswer,
          feedback: question.explanation || "Basic scoring applied.",
          breakdown: {},
          strengths: [],
          improvements: []
        });
      }
    }

    // Calculate weighted percentage for AP subjects
    const sectionScores = {};
    questionResults.forEach(result => {
      const question = questions.find(q => q.id === result.questionId);
      if (question) {
        const type = question.type;
        if (!sectionScores[type]) {
          sectionScores[type] = { score: 0, maxPoints: 0 };
        }
        sectionScores[type].score += result.score;
        sectionScores[type].maxPoints += result.maxPoints;
      }
    });

    // Calculate weighted overall percentage
    let weightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(sectionScores).forEach(([type, data]) => {
      const weight = weights[type] || (weights.frq || 0.50); // Default to FRQ weight if not found
      if (data.maxPoints > 0) {
        const sectionPercentage = (data.score / data.maxPoints);
        weightedScore += sectionPercentage * weight;
        totalWeight += weight;
      }
    });

    const weightedPercentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    const rawPercentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    
    // Use weighted percentage for AP score calculation
    const apScore = convertToAPScore(weightedPercentage);

    // Calculate breakdown by question type with weighted scores
    const breakdown = {
      mcq: { correct: 0, total: 0, percentage: 0, weight: weights.mcq || 0 },
      frq: { correct: 0, total: 0, percentage: 0, weight: weights.frq || 0 },
      saq: { correct: 0, total: 0, percentage: 0, weight: weights.saq || 0 },
      dbq: { correct: 0, total: 0, percentage: 0, weight: weights.dbq || 0 },
      leq: { correct: 0, total: 0, percentage: 0, weight: weights.leq || 0 },
      writing: { correct: 0, total: 0, percentage: 0, weight: 0 }
    };

    questionResults.forEach(result => {
      const question = questions.find(q => q.id === result.questionId);
      if (question) {
        const type = question.type;
        if (breakdown[type]) {
          breakdown[type].total += result.maxPoints;
          breakdown[type].correct += result.score;
        } else if (type !== 'mcq') {
          // Group other types under writing
          breakdown.writing.total += result.maxPoints;
          breakdown.writing.correct += result.score;
        }
      }
    });

    // Calculate percentages for each section
    Object.keys(breakdown).forEach(type => {
      if (breakdown[type].total > 0) {
        breakdown[type].percentage = Math.round((breakdown[type].correct / breakdown[type].total) * 100);
      }
    });

    setIsGeneratingTest(false);

    return {
      score,
      totalPoints,
      percentage: Math.round(rawPercentage),
      weightedPercentage: Math.round(weightedPercentage),
      apScore,
      questionResults,
      timeSpent: getTimeSpent(),
      breakdown,
      weights: weights,
      sectionScores: sectionScores
    };
  }, [questions, userAnswers, getTimeSpent, convertToAPScore, scoreQuestion, selectedSubject, cleanBreakdownObject]);

  const handleSubmitTest = useCallback(async () => {
    setTestStarted(false);
    setCurrentView('scoring'); // Show scoring screen
    
    try {
      const results = await calculateResults();
      console.log('🚨 SUBMIT: Raw results before sanitization:', results);
      
      const sanitizedResults = sanitizeResultsData(results);
      console.log('🚨 SUBMIT: Sanitized results:', sanitizedResults);
      
      const emergencyCleanedResults = emergencyCleanResults(sanitizedResults);
      console.log('🚨 SUBMIT: Emergency cleaned results:', emergencyCleanedResults);
      console.log('🔧 SUBMIT: Safe breakdown structure:', emergencyCleanedResults?.scoreBreakdown?.__safe_breakdown);
      console.log('🔧 SUBMIT: Main breakdown structure:', emergencyCleanedResults?.breakdown);
      
      setTestResults(emergencyCleanedResults);
      
      // Save test to Firebase
      if (user) {
        try {
          // Deep sanitize function to remove undefined values
          const deepSanitize = (obj) => {
            if (obj === null || obj === undefined) return null;
            if (typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(deepSanitize);
            
            const sanitized = {};
            Object.keys(obj).forEach(key => {
              const value = obj[key];
              if (value !== undefined) {
                sanitized[key] = deepSanitize(value);
              }
            });
            return sanitized;
          };

          // Sanitize data to avoid undefined values
          const sanitizedData = deepSanitize({
            userId: user.uid,
            subject: selectedSubject || '',
            section: selectedSection || '',
            // Difficulty removed from schema
            questions: (questions || []).map(q => ({
              ...q,
              // Ensure all question fields are defined
              id: q.id || 0,
              type: q.type || '',
              question: q.question || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
              explanation: q.explanation || '',
              stimulus: q.stimulus || '',
              sampleAnswer: q.sampleAnswer || '',
              prompt: q.prompt || '',
              documents: q.documents || []
            })),
            userAnswers: userAnswers || {},
            results: results || {},
            createdAt: serverTimestamp(),
            timeSpent: getTimeSpent() || 0,
            subsection: selectedSubSection || null
          });

          await addDoc(collection(db, 'practiceTests'), sanitizedData);
        } catch (error) {
          console.error('Error saving test results:', error);
        }
      }
      
      setCurrentView('results');
    } catch (error) {
      console.error('Error calculating results:', error);
      // Build fallback results so we don't end up on a blank screen
      const totalQ = questions.length || 1;
      const fallbackResults = {
        totalQuestions: totalQ,
        correctAnswers: 0,
        percentage: 0,
        apScore: 1,
        timeSpent: getTimeSpent() || 0,
        breakdown: {},
        scoreBreakdown: {},
        questionResults: [],
        error: `Scoring failed: ${error.message}. Your answers were saved.`,
      };
      const cleaned = emergencyCleanResults(fallbackResults);
      setTestResults(cleaned);
      setCurrentView('results');
    }
  }, [user, selectedSubject, selectedSection, selectedSubSection, questions, userAnswers, calculateResults, getTimeSpent, sanitizeResultsData, emergencyCleanResults]);

  const handleTimeUp = useCallback(() => {
    setTestStarted(false);
    setTestPaused(false);
    handleSubmitTest();
  }, [handleSubmitTest]);

  useEffect(() => {
    if (testStarted && !testPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [testStarted, testPaused, timeRemaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate effect for time-up detection (avoids side effects inside state updater)
  useEffect(() => {
    if (testStarted && !testPaused && timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, testStarted, testPaused, handleTimeUp]);

  // Auto-save functionality
  useEffect(() => {
    if (testStarted && user && Object.keys(userAnswers).length > 0) {
      const saveProgress = async () => {
        try {
          // Deep sanitize function to remove undefined values
          const deepSanitize = (obj) => {
            if (obj === null || obj === undefined) return null;
            if (typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(deepSanitize);
            
            const sanitized = {};
            Object.keys(obj).forEach(key => {
              const value = obj[key];
              if (value !== undefined) {
                sanitized[key] = deepSanitize(value);
              }
            });
            return sanitized;
          };

          const progressData = deepSanitize({
            userId: user.uid,
            subject: selectedSubject || '',
            section: selectedSection || '',
            // Difficulty removed from schema
            questions: questions || [],
            userAnswers: userAnswers || {},
            currentQuestionIndex: currentQuestionIndex || 0,
            timeRemaining: timeRemaining || 0,
            lastSaved: serverTimestamp()
          });

          // Use setDoc with deterministic ID to upsert instead of creating a new doc every 30s
          const progressRef = doc(db, 'testProgress', `${user.uid}_inprogress`);
          await setDoc(progressRef, progressData);
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      };

      const saveInterval = setInterval(saveProgress, 30000); // Save every 30 seconds
      return () => clearInterval(saveInterval);
    }
  }, [testStarted, user, selectedSubject, selectedSection, questions, userAnswers, currentQuestionIndex, timeRemaining]);

  // Load test history from Firebase
  useEffect(() => {
    if (user) {
      const testsRef = collection(db, 'practiceTests');
      const q = query(
        testsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tests = snapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt = new Date();
          
          // Handle Firebase Timestamp
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (typeof data.createdAt === 'string') {
              createdAt = new Date(data.createdAt);
            }
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt
          };
        });
        setTestHistory(tests);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Mobile detection and responsive setup
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-sync settings persistence
  useEffect(() => {
    localStorage.setItem('aptest_autosync', JSON.stringify(autoSyncEnabled));
  }, [autoSyncEnabled]);

  // Update Firebase auto-sync setting when changed
  useEffect(() => {
    if (user && autoSyncEnabled !== undefined) {
      const updateAutoSyncInFirebase = async () => {
        try {
          const userTokensRef = doc(db, 'users', user.uid, 'integrations', 'schoology');
          await setDoc(userTokensRef, { 
            autoSync: autoSyncEnabled,
            lastUpdated: serverTimestamp()
          }, { merge: true });
          console.log(`✅ Auto-sync disabled state saved to Firebase for user ${user.uid}`);
        } catch (error) {
          console.error('Failed to update Firebase autoSync setting:', error);
        }
      };
      
      // Only update if the value has actually changed to avoid unnecessary saves
      const timeoutId = setTimeout(updateAutoSyncInFirebase, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [autoSyncEnabled, user]);

  // Drawing canvas removed: no auto-enable
  
  // Auto-save user settings
  useEffect(() => {
    if (autoSyncEnabled && user && selectedSubject) {
      const settingsToSave = {
        selectedSubject,
        selectedUnits,
        useDefaultTime,
        customTime,
        timestamp: Date.now()
      };
      
      // Debounce the save operation
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`aptest_settings_${user.uid}`, JSON.stringify(settingsToSave));
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedSubject, selectedUnits, useDefaultTime, customTime, autoSyncEnabled, user]);

  // Load saved settings on component mount
  useEffect(() => {
    if (autoSyncEnabled && user) {
      try {
        const saved = localStorage.getItem(`aptest_settings_${user.uid}`);
        if (saved) {
          const settings = JSON.parse(saved);
          // Only auto-load if the settings are recent (within 24 hours)
          if (Date.now() - (settings.timestamp || 0) < 24 * 60 * 60 * 1000) {
            setSelectedSubject(settings.selectedSubject || '');
            // Difficulty setting removed
            setSelectedUnits(settings.selectedUnits || []);
            setUseDefaultTime(settings.useDefaultTime ?? true);
            setCustomTime(settings.customTime || '');
          }
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, [user, autoSyncEnabled]);

  const handleStartTest = async () => {
    if (!selectedSubject || !selectedSection) {
      alert('Please select a subject and section');
      return;
    }

    // Check if FRQ subsection is required (only when there are subsections available)
    const canonicalSubject = getCanonicalSubjectName(selectedSubject);
    const config = TEST_CONFIGURATIONS[canonicalSubject] || DEFAULT_CONFIG;
    const sectionConfig = config.sections.find(s => s.id === selectedSection);
    const hasSubSections = selectedSection === 'frq' && sectionConfig?.subSections && sectionConfig.subSections.length > 0;
    
    if (hasSubSections && !selectedSubSection) {
      alert('Please select an FRQ type');
      return;
    }

    setIsGeneratingTest(true);
    
    try {
      const canonicalSubject = getCanonicalSubjectName(selectedSubject);
      const config = TEST_CONFIGURATIONS[canonicalSubject] || DEFAULT_CONFIG;
      const sectionConfig = config.sections.find(s => s.id === selectedSection);
      
      // Handle subsections for FRQ
      let questionsCount = sectionConfig.questions;
      let timeLimit = sectionConfig.time;
      let actualSection = selectedSection;
      
      // Apply custom question count if set
      if (!useDefaultQuestionCount && customQuestionCount) {
        const custom = parseInt(customQuestionCount);
        if (custom > 0 && custom <= 100) {
          questionsCount = custom;
        }
      }
      
      if (selectedSection === 'frq') {
        if (sectionConfig.subSections && selectedSubSection) {
          // Has subsections and one is selected
          const subSectionConfig = sectionConfig.subSections.find(sub => sub.id === selectedSubSection);
          if (subSectionConfig) {
            questionsCount = subSectionConfig.questions;
            timeLimit = subSectionConfig.time;
            // Map subsection to actual question type
            if (selectedSubSection === 'saq-only') actualSection = 'saq';
            else if (selectedSubSection === 'dbq-only') actualSection = 'dbq';
            else if (selectedSubSection === 'leq-only') actualSection = 'leq';
            else if (selectedSubSection === 'all-frq' || selectedSubSection === 'all-essays' || selectedSubSection === 'all-writing') actualSection = 'all-frq';
            else if (selectedSubSection === 'synthesis-only') actualSection = 'synthesis';
            else if (selectedSubSection === 'rhetorical-only') actualSection = 'rhetorical-analysis';
            else if (selectedSubSection === 'argument-only') actualSection = 'argumentative';
            else if (selectedSubSection === 'poetry-only') actualSection = 'poetry-analysis';
            else if (selectedSubSection === 'prose-only') actualSection = 'prose-analysis';
            else if (selectedSubSection === 'open-only') actualSection = 'open-question';
            else if (selectedSubSection === 'long-frq') actualSection = 'long-frq';
            else if (selectedSubSection === 'short-frq') actualSection = 'short-frq';
            else if (selectedSubSection === 'calculator-frq') actualSection = 'calculator-frq';
            else if (selectedSubSection === 'no-calculator-frq') actualSection = 'no-calculator-frq';
            else if (selectedSubSection === 'short-answer') actualSection = 'short-answer';
            else if (selectedSubSection === 'essays') actualSection = 'essays';
            else if (selectedSubSection === 'translation') actualSection = 'translation';
            else if (selectedSubSection === 'essay') actualSection = 'essay';
            else if (selectedSubSection === 'written-theory') actualSection = 'written-theory';
            else if (selectedSubSection === 'dictation') actualSection = 'dictation';
            else if (selectedSubSection === 'sight-singing') actualSection = 'sight-singing';
            else actualSection = 'all-frq'; // default to all-frq for unknown subsections
          }
        } else if (sectionConfig.subSections) {
          // Has subsections but none selected, default to all-frq
          actualSection = 'all-frq';
          // Find the all-frq configuration
          const allFrqConfig = sectionConfig.subSections.find(sub => sub.id === 'all-frq' || sub.id === 'all-essays' || sub.id === 'all-writing');
          if (allFrqConfig) {
            questionsCount = allFrqConfig.questions;
            timeLimit = allFrqConfig.time;
          }
        } else {
          // No subsections available, use FRQ section directly
          actualSection = 'frq';
        }
      }
      
      // Re-apply custom question count after subsection logic (which may override questionsCount)
      if (!useDefaultQuestionCount && customQuestionCount) {
        const custom = parseInt(customQuestionCount);
        if (custom > 0 && custom <= 100) {
          questionsCount = custom;
        }
      }
      setGenerationProgress({ generated: 0, total: questionsCount });
      
      // Generate test questions using AI
  console.log('Generating test with:', { subject: selectedSubject, section: actualSection, count: questionsCount, units: selectedUnits });
      const generatedQuestions = await generateTestQuestions(
        selectedSubject,
        actualSection,
        selectedDifficulty,
        questionsCount,
        selectedUnits
      );

      console.log('Generated questions:', generatedQuestions);
      
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('No questions were generated');
      }

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      
      // Set timer
      const timeInMinutes = useDefaultTime 
        ? timeLimit 
        : parseInt(customTime) || timeLimit;
      setTimeRemaining(timeInMinutes * 60);
      
      setTestStarted(true);
      setCurrentView('test');
    } catch (error) {
      console.error('Error generating test:', error);
      
      // Check if it's a rate limiting error
      if (error.message && (error.message.includes('All') && error.message.includes('API keys are rate limited'))) {
        alert('We\'ve reached our daily usage limit for AI question generation. Please try again tomorrow or in a few hours when the limits reset.');
      } else if (error.message && error.message.includes('usage limit')) {
        alert(error.message);
      } else {
        alert('We encountered an issue generating your test. Please try again in a few moments.');
      }
    } finally {
      setIsGeneratingTest(false);
    }
  };

  // Specialized function for generating AP U.S. History full practice tests
  const generateAPUSHFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP U.S. History full test structure: 55 MCQs + 3 SAQs + 1 DBQ + 1 LEQ = 60 total
    const sections = [
      { type: 'mcq', count: 55, batchSize: 6 }, // Generate MCQs in groups of 6 (2-3 questions per stimulus)
      { type: 'saq', count: 3, batchSize: 3 },  // Generate all SAQs together
      { type: 'dbq', count: 1, batchSize: 1 },  // Generate DBQ alone
      { type: 'leq', count: 1, batchSize: 1 }   // Generate LEQ alone
    ];
    
    for (const sectionInfo of sections) {
      console.log(`Generating ${sectionInfo.count} ${sectionInfo.type.toUpperCase()} questions...`);
      
      // Generate enough questions to get the required number
      let batchNumber = 1;
      let questionsGenerated = 0;
      
      while (questionsGenerated < sectionInfo.count) {
        const questionsNeeded = sectionInfo.count - questionsGenerated;
        const questionsInBatch = Math.min(sectionInfo.batchSize, questionsNeeded);
        const startId = currentId;
        
        console.log(`Generating ${sectionInfo.type.toUpperCase()} batch ${batchNumber}: ${questionsInBatch} questions starting from ID ${startId}`);
        
        let retryCount = 0;
        const maxRetries = 3;
        let batchQuestions = null;
        
        while (retryCount <= maxRetries && !batchQuestions) {
          try {
            if (retryCount > 0) {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.log(`Waiting ${delayMs/1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
            batchQuestions = await generateQuestionBatch(
              'AP U.S. History', sectionInfo.type, difficulty, questionsInBatch, startId, 
              apiKeyManager.getCurrentKey(), apiKeyManager.getCurrentUrl(), selectedUnits
            );
            
            if (batchQuestions && batchQuestions.length > 0) {
              allQuestions.push(...batchQuestions);
              
              // Update counters after successful generation
              currentId += batchQuestions.length;
              questionsGenerated += batchQuestions.length;
              
              // Update progress
              setGenerationProgress({ generated: allQuestions.length, total: 60 });
              
              console.log(`✅ ${sectionInfo.type.toUpperCase()} batch ${batchNumber} generated: ${batchQuestions.length} questions (${questionsGenerated}/${sectionInfo.count} total)`);
              
              // Brief pause between batches
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error(`No valid ${sectionInfo.type} questions generated`);
            }
            
          } catch (error) {
            retryCount++;
            console.error(`❌ ${sectionInfo.type.toUpperCase()} batch ${batchNumber}, attempt ${retryCount} failed:`, error.message);
            
            // Check if all API keys are rate limited
            if (error.message.includes('All') && error.message.includes('API keys are rate limited')) {
              console.error('🚫 All API keys are rate limited. Stopping APUSH generation.');
              // Return what we have so far
              throw new Error('We\'ve reached our daily usage limit for AI question generation. Please try again tomorrow or in a few hours when the limits reset.');
            }
            
            if (retryCount > maxRetries) {
              // Move to next batch even if this one fails to avoid infinite loop
              console.warn(`⚠️ Skipping failed batch ${batchNumber} after ${maxRetries + 1} attempts`);
              break;
            }
          }
        }
        
        batchNumber++;
        
        // Safety check to avoid infinite loop
        if (batchNumber > 20) {
          console.warn(`⚠️ Breaking after ${batchNumber} batch attempts to avoid infinite loop`);
          break;
        }
      }
    }
    
    console.log(`✅ Full AP U.S. History test generated: ${allQuestions.length} total questions`);
    return allQuestions;
  };

  // World History full test generation (similar structure to APUSH)
  const generateWorldHistoryFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP World History full test structure: 55 MCQs + 3 SAQs + 1 DBQ + 1 LEQ = 60 total
    const sections = [
      { type: 'mcq', count: 55, batchSize: 6 }, 
      { type: 'saq', count: 3, batchSize: 3 },  
      { type: 'dbq', count: 1, batchSize: 1 },  
      { type: 'leq', count: 1, batchSize: 1 }   
    ];
    
    return generateHistoryTest('AP World History', sections, allQuestions, currentId, difficulty, selectedUnits);
  };

  // European History full test generation
  const generateEuropeanHistoryFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP European History full test structure: 55 MCQs + 3 SAQs + 1 DBQ + 1 LEQ = 60 total
    const sections = [
      { type: 'mcq', count: 55, batchSize: 6 }, 
      { type: 'saq', count: 3, batchSize: 3 },  
      { type: 'dbq', count: 1, batchSize: 1 },  
      { type: 'leq', count: 1, batchSize: 1 }   
    ];
    
    return generateHistoryTest('AP European History', sections, allQuestions, currentId, difficulty, selectedUnits);
  };

  // Generic History test generation function
  const generateHistoryTest = async (subject, sections, allQuestions, currentId, difficulty, selectedUnits) => {
    for (const sectionInfo of sections) {
      console.log(`Generating ${sectionInfo.count} ${sectionInfo.type.toUpperCase()} questions for ${subject}...`);
      
      let batchNumber = 1;
      let questionsGenerated = 0;
      
      while (questionsGenerated < sectionInfo.count) {
        const questionsNeeded = sectionInfo.count - questionsGenerated;
        const questionsInBatch = Math.min(sectionInfo.batchSize, questionsNeeded);
        const startId = currentId;
        
        console.log(`Generating ${sectionInfo.type.toUpperCase()} batch ${batchNumber}: ${questionsInBatch} questions starting from ID ${startId}`);
        
        let retryCount = 0;
        const maxRetries = 3;
        let batchQuestions = null;
        
        while (retryCount <= maxRetries && !batchQuestions) {
          try {
            if (retryCount > 0) {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.log(`Waiting ${delayMs/1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
            batchQuestions = await generateQuestionBatch(
              subject, sectionInfo.type, difficulty, questionsInBatch, startId, 
              apiKeyManager.getCurrentKey(), apiKeyManager.getCurrentUrl(), selectedUnits
            );
            
            if (batchQuestions && batchQuestions.length > 0) {
              allQuestions.push(...batchQuestions);
              currentId += batchQuestions.length;
              questionsGenerated += batchQuestions.length;
              setGenerationProgress({ generated: allQuestions.length, total: 60 });
              console.log(`✅ ${sectionInfo.type.toUpperCase()} batch ${batchNumber} generated: ${batchQuestions.length} questions`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error(`No valid ${sectionInfo.type} questions generated`);
            }
            
          } catch (error) {
            retryCount++;
            console.error(`❌ ${sectionInfo.type.toUpperCase()} batch ${batchNumber}, attempt ${retryCount} failed:`, error.message);
            
            if (error.message.includes('All') && error.message.includes('API keys are rate limited')) {
              console.error('🚫 All API keys are rate limited. Stopping generation.');
              throw new Error('We\'ve reached our daily usage limit for AI question generation. Please try again tomorrow or in a few hours when the limits reset.');
            }
            
            if (retryCount > maxRetries) {
              console.warn(`⚠️ Skipping failed batch ${batchNumber} after ${maxRetries + 1} attempts`);
              break;
            }
          }
        }
        
        batchNumber++;
        if (batchNumber > 20) {
          console.warn(`⚠️ Breaking after ${batchNumber} batch attempts to avoid infinite loop`);
          break;
        }
      }
    }
    
    console.log(`✅ Full ${subject} test generated: ${allQuestions.length} total questions`);
    return allQuestions;
  };

  // Biology full test generation
  const generateBiologyFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Biology full test structure: 60 MCQs + 6 FRQs (2 long + 4 short) = 66 total
    const sections = [
      { type: 'mcq', count: 60, batchSize: 6 },
      { type: 'long-frq', count: 2, batchSize: 1 },
      { type: 'short-frq', count: 4, batchSize: 2 }
    ];
    
    return generateSTEMTest('AP Biology', sections, allQuestions, currentId, difficulty, selectedUnits, 66);
  };

  // Chemistry full test generation
  const generateChemistryFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Chemistry full test structure: 60 MCQs + 7 FRQs (3 long + 4 short) = 67 total
    const sections = [
      { type: 'mcq', count: 60, batchSize: 6 },
      { type: 'long-frq', count: 3, batchSize: 1 },
      { type: 'short-frq', count: 4, batchSize: 2 }
    ];
    
    return generateSTEMTest('AP Chemistry', sections, allQuestions, currentId, difficulty, selectedUnits, 67);
  };

  // Physics full test generation
  const generatePhysicsFullTest = async (subject, difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Physics full test structure: 50 MCQs + 5 FRQs = 55 total
    const sections = [
      { type: 'mcq', count: 50, batchSize: 6 },
      { type: 'frq', count: 5, batchSize: 1 }
    ];
    
    return generateSTEMTest(subject, sections, allQuestions, currentId, difficulty, selectedUnits, 55);
  };

  // Calculus full test generation
  const generateCalculusFullTest = async (subject, difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Calculus full test structure: 45 MCQs + 6 FRQs (2 calculator + 4 no-calculator) = 51 total
    const sections = [
      { type: 'mcq', count: 45, batchSize: 6 },
      { type: 'calculator-frq', count: 2, batchSize: 1 },
      { type: 'no-calculator-frq', count: 4, batchSize: 2 }
    ];
    
    return generateSTEMTest(subject, sections, allQuestions, currentId, difficulty, selectedUnits, 51);
  };

  // Statistics full test generation
  const generateStatisticsFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Statistics full test structure: 40 MCQs + 6 FRQs = 46 total
    const sections = [
      { type: 'mcq', count: 40, batchSize: 6 },
      { type: 'frq', count: 6, batchSize: 2 }
    ];
    
    return generateSTEMTest('AP Statistics', sections, allQuestions, currentId, difficulty, selectedUnits, 46);
  };

  // Generic STEM test generation function
  const generateSTEMTest = async (subject, sections, allQuestions, currentId, difficulty, selectedUnits, totalQuestions) => {
    for (const sectionInfo of sections) {
      console.log(`Generating ${sectionInfo.count} ${sectionInfo.type.toUpperCase()} questions for ${subject}...`);
      
      let batchNumber = 1;
      let questionsGenerated = 0;
      
      while (questionsGenerated < sectionInfo.count) {
        const questionsNeeded = sectionInfo.count - questionsGenerated;
        const questionsInBatch = Math.min(sectionInfo.batchSize, questionsNeeded);
        const startId = currentId;
        
        console.log(`Generating ${sectionInfo.type.toUpperCase()} batch ${batchNumber}: ${questionsInBatch} questions starting from ID ${startId}`);
        
        let retryCount = 0;
        const maxRetries = 3;
        let batchQuestions = null;
        
        while (retryCount <= maxRetries && !batchQuestions) {
          try {
            if (retryCount > 0) {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.log(`Waiting ${delayMs/1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
            batchQuestions = await generateQuestionBatch(
              subject, sectionInfo.type, difficulty, questionsInBatch, startId, 
              apiKeyManager.getCurrentKey(), apiKeyManager.getCurrentUrl(), selectedUnits
            );
            
            if (batchQuestions && batchQuestions.length > 0) {
              allQuestions.push(...batchQuestions);
              currentId += batchQuestions.length;
              questionsGenerated += batchQuestions.length;
              setGenerationProgress({ generated: allQuestions.length, total: totalQuestions });
              console.log(`✅ ${sectionInfo.type.toUpperCase()} batch ${batchNumber} generated: ${batchQuestions.length} questions`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error(`No valid ${sectionInfo.type} questions generated`);
            }
            
          } catch (error) {
            retryCount++;
            console.error(`❌ ${sectionInfo.type.toUpperCase()} batch ${batchNumber}, attempt ${retryCount} failed:`, error.message);
            
            if (error.message.includes('All') && error.message.includes('API keys are rate limited')) {
              console.error('🚫 All API keys are rate limited. Stopping generation.');
              throw new Error('We\'ve reached our daily usage limit for AI question generation. Please try again tomorrow or in a few hours when the limits reset.');
            }
            
            if (retryCount > maxRetries) {
              console.warn(`⚠️ Skipping failed batch ${batchNumber} after ${maxRetries + 1} attempts`);
              break;
            }
          }
        }
        
        batchNumber++;
        if (batchNumber > 20) {
          console.warn(`⚠️ Breaking after ${batchNumber} batch attempts to avoid infinite loop`);
          break;
        }
      }
    }
    
    console.log(`✅ Full ${subject} test generated: ${allQuestions.length} total questions`);
    return allQuestions;
  };

  // English Language full test generation
  const generateEnglishLanguageFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP English Language full test structure: 45 MCQs + 3 Essays (synthesis, rhetorical analysis, argumentative) = 48 total
    const sections = [
      { type: 'mcq', count: 45, batchSize: 6 },
      { type: 'synthesis', count: 1, batchSize: 1 },
      { type: 'rhetorical-analysis', count: 1, batchSize: 1 },
      { type: 'argumentative', count: 1, batchSize: 1 }
    ];
    
    return generateEnglishTest('AP English Language and Composition', sections, allQuestions, currentId, difficulty, selectedUnits, 48);
  };

  // English Literature full test generation
  const generateEnglishLiteratureFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP English Literature full test structure: 55 MCQs + 3 Essays (poetry, prose, open question) = 58 total
    const sections = [
      { type: 'mcq', count: 55, batchSize: 6 },
      { type: 'poetry-analysis', count: 1, batchSize: 1 },
      { type: 'prose-analysis', count: 1, batchSize: 1 },
      { type: 'open-question', count: 1, batchSize: 1 }
    ];
    
    return generateEnglishTest('AP English Literature and Composition', sections, allQuestions, currentId, difficulty, selectedUnits, 58);
  };

  // Generic English test generation function
  const generateEnglishTest = async (subject, sections, allQuestions, currentId, difficulty, selectedUnits, totalQuestions) => {
    for (const sectionInfo of sections) {
      console.log(`Generating ${sectionInfo.count} ${sectionInfo.type.toUpperCase()} questions for ${subject}...`);
      
      let batchNumber = 1;
      let questionsGenerated = 0;
      
      while (questionsGenerated < sectionInfo.count) {
        const questionsNeeded = sectionInfo.count - questionsGenerated;
        const questionsInBatch = Math.min(sectionInfo.batchSize, questionsNeeded);
        const startId = currentId;
        
        console.log(`Generating ${sectionInfo.type.toUpperCase()} batch ${batchNumber}: ${questionsInBatch} questions starting from ID ${startId}`);
        
        let retryCount = 0;
        const maxRetries = 3;
        let batchQuestions = null;
        
        while (retryCount <= maxRetries && !batchQuestions) {
          try {
            if (retryCount > 0) {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.log(`Waiting ${delayMs/1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
            batchQuestions = await generateQuestionBatch(
              subject, sectionInfo.type, difficulty, questionsInBatch, startId, 
              apiKeyManager.getCurrentKey(), apiKeyManager.getCurrentUrl(), selectedUnits
            );
            
            if (batchQuestions && batchQuestions.length > 0) {
              allQuestions.push(...batchQuestions);
              currentId += batchQuestions.length;
              questionsGenerated += batchQuestions.length;
              setGenerationProgress({ generated: allQuestions.length, total: totalQuestions });
              console.log(`✅ ${sectionInfo.type.toUpperCase()} batch ${batchNumber} generated: ${batchQuestions.length} questions`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error(`No valid ${sectionInfo.type} questions generated`);
            }
            
          } catch (error) {
            retryCount++;
            console.error(`❌ ${sectionInfo.type.toUpperCase()} batch ${batchNumber}, attempt ${retryCount} failed:`, error.message);
            
            if (error.message.includes('All') && error.message.includes('API keys are rate limited')) {
              console.error('🚫 All API keys are rate limited. Stopping generation.');
              throw new Error('We\'ve reached our daily usage limit for AI question generation. Please try again tomorrow or in a few hours when the limits reset.');
            }
            
            if (retryCount > maxRetries) {
              console.warn(`⚠️ Skipping failed batch ${batchNumber} after ${maxRetries + 1} attempts`);
              break;
            }
          }
        }
        
        batchNumber++;
        if (batchNumber > 20) {
          console.warn(`⚠️ Breaking after ${batchNumber} batch attempts to avoid infinite loop`);
          break;
        }
      }
    }
    
    console.log(`✅ Full ${subject} test generated: ${allQuestions.length} total questions`);
    return allQuestions;
  };

  // Government full test generation
  const generateGovernmentFullTest = async (subject, difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Government full test structure: 55 MCQs + 4 FRQs = 59 total
    const sections = [
      { type: 'mcq', count: 55, batchSize: 6 },
      { type: 'frq', count: 4, batchSize: 2 }
    ];
    
    return generateSocialScienceTest(subject, sections, allQuestions, currentId, difficulty, selectedUnits, 59);
  };

  // Human Geography full test generation
  const generateHumanGeographyFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Human Geography full test structure: 60 MCQs + 3 FRQs = 63 total
    const sections = [
      { type: 'mcq', count: 60, batchSize: 6 },
      { type: 'frq', count: 3, batchSize: 1 }
    ];
    
    return generateSocialScienceTest('AP Human Geography', sections, allQuestions, currentId, difficulty, selectedUnits, 63);
  };

  // Psychology full test generation
  const generatePsychologyFullTest = async (difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Psychology full test structure: 100 MCQs + 2 FRQs = 102 total
    const sections = [
      { type: 'mcq', count: 100, batchSize: 6 },
      { type: 'frq', count: 2, batchSize: 1 }
    ];
    
    return generateSocialScienceTest('AP Psychology', sections, allQuestions, currentId, difficulty, selectedUnits, 102);
  };

  // Economics full test generation
  const generateEconomicsFullTest = async (subject, difficulty, selectedUnits) => {
    const allQuestions = [];
    let currentId = 1;
    
    // AP Economics full test structure: 60 MCQs + 3 FRQs = 63 total
    const sections = [
      { type: 'mcq', count: 60, batchSize: 6 },
      { type: 'frq', count: 3, batchSize: 1 }
    ];
    
    return generateSocialScienceTest(subject, sections, allQuestions, currentId, difficulty, selectedUnits, 63);
  };

  // Generic Social Science test generation function
  const generateSocialScienceTest = async (subject, sections, allQuestions, currentId, difficulty, selectedUnits, totalQuestions) => {
    for (const sectionInfo of sections) {
      console.log(`Generating ${sectionInfo.count} ${sectionInfo.type.toUpperCase()} questions for ${subject}...`);
      
      let batchNumber = 1;
      let questionsGenerated = 0;
      
      while (questionsGenerated < sectionInfo.count) {
        const questionsNeeded = sectionInfo.count - questionsGenerated;
        const questionsInBatch = Math.min(sectionInfo.batchSize, questionsNeeded);
        const startId = currentId;
        
        console.log(`Generating ${sectionInfo.type.toUpperCase()} batch ${batchNumber}: ${questionsInBatch} questions starting from ID ${startId}`);
        
        let retryCount = 0;
        const maxRetries = 3;
        let batchQuestions = null;
        
        while (retryCount <= maxRetries && !batchQuestions) {
          try {
            if (retryCount > 0) {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.log(`Waiting ${delayMs/1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
            batchQuestions = await generateQuestionBatch(
              subject, sectionInfo.type, difficulty, questionsInBatch, startId, 
              apiKeyManager.getCurrentKey(), apiKeyManager.getCurrentUrl(), selectedUnits
            );
            
            if (batchQuestions && batchQuestions.length > 0) {
              allQuestions.push(...batchQuestions);
              currentId += batchQuestions.length;
              questionsGenerated += batchQuestions.length;
              setGenerationProgress({ generated: allQuestions.length, total: totalQuestions });
              console.log(`✅ ${sectionInfo.type.toUpperCase()} batch ${batchNumber} generated: ${batchQuestions.length} questions`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error(`No valid ${sectionInfo.type} questions generated`);
            }
            
          } catch (error) {
            retryCount++;
            console.error(`❌ ${sectionInfo.type.toUpperCase()} batch ${batchNumber}, attempt ${retryCount} failed:`, error.message);
            
            if (error.message.includes('All') && error.message.includes('API keys are rate limited')) {
              console.error('🚫 All API keys are rate limited. Stopping generation.');
              throw new Error('We\'ve reached our daily usage limit for AI question generation. Please try again tomorrow or in a few hours when the limits reset.');
            }
            
            if (retryCount > maxRetries) {
              console.warn(`⚠️ Skipping failed batch ${batchNumber} after ${maxRetries + 1} attempts`);
              break;
            }
          }
        }
        
        batchNumber++;
        if (batchNumber > 20) {
          console.warn(`⚠️ Breaking after ${batchNumber} batch attempts to avoid infinite loop`);
          break;
        }
      }
    }
    
    console.log(`✅ Full ${subject} test generated: ${allQuestions.length} total questions`);
    return allQuestions;
  };

  // Generic full test generation for subjects without specific implementations
  const generateGenericFullTest = async (subject, difficulty, selectedUnits, totalQuestions) => {
    console.log(`Using generic generation for ${subject} with ${totalQuestions} questions`);
    
    const canonicalSubject = getCanonicalSubjectName(subject);
    const config = TEST_CONFIGURATIONS[canonicalSubject] || DEFAULT_CONFIG;
    const mcqSection = config.sections.find(s => s.id === 'mcq');
    const frqSection = config.sections.find(s => s.id === 'frq');
    
    const mcqCount = mcqSection ? mcqSection.questions : Math.floor(totalQuestions * 0.75);
    const frqCount = frqSection ? frqSection.questions : totalQuestions - mcqCount;
    
    const sections = [
      { type: 'mcq', count: mcqCount, batchSize: 6 },
      { type: 'frq', count: frqCount, batchSize: 2 }
    ];
    
    const allQuestions = [];
    let currentId = 1;
    
    return generateSocialScienceTest(subject, sections, allQuestions, currentId, difficulty, selectedUnits, totalQuestions);
  };

  // Enhanced test generation with proper question type distribution
  const generateFullPracticeTest = async (subject, difficulty, selectedUnits, totalQuestions) => {
    console.log(`Generating full practice test for ${subject}`);
    
    // Route to subject-specific generation functions
    switch (subject) {
      case 'AP U.S. History':
        return generateAPUSHFullTest(difficulty, selectedUnits);
      case 'AP World History: Modern':
      case 'AP World History':
        return generateWorldHistoryFullTest(difficulty, selectedUnits);
      case 'AP European History':
        return generateEuropeanHistoryFullTest(difficulty, selectedUnits);
      case 'AP Biology':
        return generateBiologyFullTest(difficulty, selectedUnits);
      case 'AP Chemistry':
        return generateChemistryFullTest(difficulty, selectedUnits);
      case 'AP Physics 1: Algebra-Based':
      case 'AP Physics 2: Algebra-Based':
      case 'AP Physics 1':
      case 'AP Physics 2':
      case 'AP Physics C: Mechanics':
      case 'AP Physics C: Electricity and Magnetism':
        return generatePhysicsFullTest(subject, difficulty, selectedUnits);
      case 'AP Calculus AB':
      case 'AP Calculus BC':
        return generateCalculusFullTest(subject, difficulty, selectedUnits);
      case 'AP Statistics':
        return generateStatisticsFullTest(difficulty, selectedUnits);
      case 'AP English Language and Composition':
        return generateEnglishLanguageFullTest(difficulty, selectedUnits);
      case 'AP English Literature and Composition':
        return generateEnglishLiteratureFullTest(difficulty, selectedUnits);
      case 'AP U.S. Government and Politics':
      case 'AP Government and Politics: Comparative':
      case 'AP Comparative Government and Politics':
        return generateGovernmentFullTest(subject, difficulty, selectedUnits);
      case 'AP Human Geography':
        return generateHumanGeographyFullTest(difficulty, selectedUnits);
      case 'AP Psychology':
        return generatePsychologyFullTest(difficulty, selectedUnits);
      case 'AP Macroeconomics':
      case 'AP Microeconomics':
        return generateEconomicsFullTest(subject, difficulty, selectedUnits);
      default:
        // For subjects without specific implementations, use the generic approach
        return generateGenericFullTest(subject, difficulty, selectedUnits, totalQuestions);
    }
  };

  // Generate questions for a specific section using batching
  const generateSectionQuestions = async (subject, section, difficulty, numQuestions, selectedUnits = [], startId = 1) => {
    console.log(`Generating ${numQuestions} ${section} questions for ${subject}`);
    
    const batchSize = section === 'dbq' ? 1 : Math.min(6, numQuestions);
    const allQuestions = [];
    let currentId = startId;
    let questionsGenerated = 0;
    let batchNumber = 1;
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 3;
    
    while (questionsGenerated < numQuestions && consecutiveFailures < maxConsecutiveFailures) {
      const questionsNeeded = numQuestions - questionsGenerated;
      const questionsInBatch = Math.min(batchSize, questionsNeeded);
      
      console.log(`Generating ${section} batch ${batchNumber}: ${questionsInBatch} questions starting from ID ${currentId}`);
      
      let batchQuestions = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries && !batchQuestions) {
        try {
          if (retryCount > 0) {
            const delayMs = Math.pow(2, retryCount) * 1000;
            console.log(`Waiting ${delayMs/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
          
          batchQuestions = await generateQuestionBatch(
            subject, section, difficulty, questionsInBatch, currentId, 
            apiKeyManager.getCurrentKey(), apiKeyManager.getCurrentUrl(), selectedUnits
          );
          
          if (batchQuestions && batchQuestions.length > 0) {
            // Limit to only what we need
            if (batchQuestions.length > questionsNeeded) {
              batchQuestions = batchQuestions.slice(0, questionsNeeded);
            }
            
            allQuestions.push(...batchQuestions);
            currentId += batchQuestions.length;
            questionsGenerated += batchQuestions.length;
            consecutiveFailures = 0;
            
            console.log(`✅ ${section} batch ${batchNumber} generated: ${batchQuestions.length} questions`);

            // Update progress - capture count to avoid closure issues
            const generatedCount = batchQuestions.length;
            setGenerationProgress(prev => ({
              generated: prev.generated + generatedCount,
              total: prev.total
            }));
            
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            throw new Error(`No valid ${section} questions generated`);
          }
          
        } catch (error) {
          retryCount++;
          console.error(`❌ ${section} batch ${batchNumber} attempt ${retryCount} failed:`, error.message);
          
          if (error.message.includes('All') && error.message.includes('API keys are rate limited')) {
            throw error; // Propagate rate limiting errors
          }
          
          if (retryCount > maxRetries) {
            consecutiveFailures++;
            console.warn(`⚠️ Skipping failed ${section} batch ${batchNumber} after ${maxRetries + 1} attempts`);
            break;
          }
        }
      }
      
      batchNumber++;
      
      // Safety check
      if (batchNumber > 10) {
        console.warn(`⚠️ Breaking after ${batchNumber} batch attempts for ${section}`);
        break;
      }
    }
    
    console.log(`Generated ${allQuestions.length} ${section} questions out of ${numQuestions} requested`);
    return allQuestions;
  };

  const generateTestQuestions = async (subject, section, difficulty, numQuestions, selectedUnits = [], preserveProgress = false) => {
    console.log('generateTestQuestions called with:', { subject, section, difficulty, numQuestions, selectedUnits });

    // Store original total for progress tracking (only on first call)
    if (!preserveProgress) {
      setGenerationProgress(prev => ({ ...prev, total: numQuestions }));
    }
    
    // Special handling for AP U.S. History full practice tests (legacy)
    if (subject === 'AP U.S. History' && section === 'full') {
      return generateAPUSHFullTest(difficulty, selectedUnits);
    }
    
    // Special handling for full practice tests with proper question type distribution
    if (section === 'full') {
      return generateFullPracticeTest(subject, difficulty, selectedUnits, numQuestions);
    }
    
    // For individual sections, use subject-specific generation
    return generateSectionQuestions(subject, section, difficulty, numQuestions, selectedUnits);
  };

  // Helper function to sort questions in proper AP exam order
  // eslint-disable-next-line no-unused-vars
  const sortQuestionsForProperOrder = (questions, section) => {
    // If not a full test, return as is
    if (section !== 'full') {
      return questions;
    }
    
    // Define question type order priorities
    const typeOrder = {
      'mcq': 1,
      'saq': 2,
      'dbq': 3, 
      'leq': 4,
      'frq': 5,
      'long-frq': 5,
      'short-frq': 6,
      'calculator-frq': 5,
      'no-calculator-frq': 6,
      'synthesis': 2,
      'rhetorical-analysis': 3,
      'argumentative': 4,
      'poetry-analysis': 2,
      'prose-analysis': 3,
      'open-question': 4,
      'essays': 5,
      'essay': 5,
      'short-answer': 2,
      'written-theory': 5,
      'dictation': 6,
      'sight-singing': 7,
      'translation': 8
    };
    
    // Sort questions by type priority, then by original order
    return questions.sort((a, b) => {
      const aPriority = typeOrder[a.type] || 10;
      const bPriority = typeOrder[b.type] || 10;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same priority, maintain original order
      return a.id - b.id;
    });
  };

  // Helper function to clean and parse JSON with error recovery
  const parseAIResponse = (text, startId = 1) => {
    console.log('Parsing AI response, original length:', text.length);
    
    // Remove code block markers and clean up
    let cleanedText = text
      .replace(/^```json\s*/i, '') // Remove opening ```json
      .replace(/^```\s*/i, '') // Remove opening ```
      .replace(/\s*```\s*$/i, '') // Remove closing ```
      .replace(/```json\n?|\n?```/g, '') // Remove any remaining code block markers
      .replace(/```\n?|\n?```/g, '') // Remove any remaining backticks
      .replace(/^`+|`+$/g, '') // Remove leading/trailing backticks
      .trim();
    
    // Remove any Unicode issues and normalize whitespace
    cleanedText = cleanedText
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
      .replace(/\u2013|\u2014/g, '-') // Replace em/en dashes
      .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n');
    
    // Fix common LaTeX rendering issues — ONLY for commands that won't collide
    // with English words. Greek letters (alpha, beta, delta, pi, etc.) are NOT
    // replaced here because they corrupt science text like "alpha particles".
    // They are fixed post-parse in fixLaTeXInQuestions on $ delimited text only.
    cleanedText = cleanedText
      .replace(/rac\{/g, '\\frac{') // Fix missing backslash in fractions
      .replace(/\bsqrt\{/g, '\\sqrt{'); // Fix square roots
    
  // IMPORTANT: Do not apply fixLaTeXInText to raw JSON text; it can corrupt JSON escapes like \n
  // We'll clean LaTeX fields AFTER parsing, on individual question fields.
    
    console.log('Cleaned text length:', cleanedText.length);
    
    // Try direct parsing first
    try {
      const parsed = JSON.parse(cleanedText);
      console.log('✅ Direct JSON parse successful');
      return fixLaTeXInQuestions(parsed);
    } catch (error) {
      console.warn('Initial JSON parse failed, attempting repair:', error.message);
      
      // Common AI response issues and fixes
      const repairs = [
        // CRITICAL: Fix invalid escape sequences that break JSON parsing
        text => {
          console.log('🔧 Applying escape sequence repair...');
          return text
            // FIRST: Remove problematic LaTeX delimiters that break JSON
            .replace(/\\\\\\\\?\(/g, '$') // Replace \\\\( or \\( with $
            .replace(/\\\\\\\\?\)/g, '$') // Replace \\\\) or \\) with $
            // Fix LaTeX display mode delimiters
            .replace(/\\\\\[/g, '$$') // Replace \\[ with $$
            .replace(/\\\\\]/g, '$$') // Replace \\] with $$
            // Fix problematic LaTeX patterns that break JSON parsing
            .replace(/\\\\lim_\{([^}]+)\s+\\\\to\s+([^}]+)\}/g, '\\\\lim_{$1 \\\\to $2}') // Fix limit notation
            .replace(/\\\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\\\frac{$1}{$2}') // Fix fractions
            .replace(/\\\\sin\(/g, '\\\\sin(') // Fix sin functions
            .replace(/\\\\cos\(/g, '\\\\cos(') // Fix cos functions
            .replace(/\\\\tan\(/g, '\\\\tan(') // Fix tan functions
            .replace(/\\\\sqrt\{([^}]*)\}/g, '\\\\sqrt{$1}') // Fix square root
            .replace(/\\\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '\\\\int_{$1}^{$2}') // Fix definite integrals
            .replace(/\\\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '\\\\sum_{$1}^{$2}') // Fix summations
            // Fix common Greek letters and symbols
            .replace(/\\\\infty/g, '\\\\infty')
            .replace(/\\\\pi/g, '\\\\pi')
            .replace(/\\\\theta/g, '\\\\theta')
            .replace(/\\\\alpha/g, '\\\\alpha')
            .replace(/\\\\beta/g, '\\\\beta')
            .replace(/\\\\Delta/g, '\\\\Delta')
            .replace(/\\\\sigma/g, '\\\\sigma')
            .replace(/\\\\mu/g, '\\\\mu')
            .replace(/\\\\to/g, '\\\\to')
            .replace(/\\\\rightarrow/g, '\\\\rightarrow')
            .replace(/\\\\leftarrow/g, '\\\\leftarrow')
            // Fix invalid single character escapes that are not valid JSON
            .replace(/\\([^"\\\/bfnrtu$])/g, '$1') // eslint-disable-line no-useless-escape
            // Fix specific problematic sequences seen in logs (only if not followed by valid LaTeX)
            .replace(/\\l(?![aitm])/g, 'l')
            .replace(/\\i(?![mn])/g, 'i')
            .replace(/\\s(?![iqu])/g, 's')
            .replace(/\\p(?![ir])/g, 'p')
            .replace(/\\m(?![au])/g, 'm')
            .replace(/\\w(?![h])/g, 'w')
            .replace(/\\d(?![e])/g, 'd')
            .replace(/\\h(?![a])/g, 'h')
            .replace(/\\c(?![do])/g, 'c')
            .replace(/\\a(?![lr])/g, 'a')
            .replace(/\\e(?![x])/g, 'e')
            .replace(/\\o(?![v])/g, 'o')
            .replace(/\\y(?![e])/g, 'y')
            .replace(/\\k(?![a])/g, 'k')
            .replace(/\\g(?![a])/g, 'g')
            .replace(/\\v(?![a])/g, 'v')
            .replace(/\\x(?![i])/g, 'x')
            .replace(/\\z(?![e])/g, 'z')
            // Fix common contractions
            .replace(/\\"s\b/g, "'s")
            .replace(/\\"t\b/g, "'t")
            .replace(/\\"re\b/g, "'re")
            .replace(/\\"ll\b/g, "'ll")
            .replace(/\\"ve\b/g, "'ve")
            .replace(/\\"d\b/g, "'d");
        },
        // Specialized DBQ repair - handle heavily truncated responses
        text => {
          if (text.includes('"type": "dbq"') && !text.endsWith(']')) {
            console.log('🔧 Applying DBQ-specific truncation repair...');
            
            // Find the end of the complete DBQ object structure
            let braceCount = 0;
            let inString = false;
            let escaped = false;
            let foundDbqStart = false;
            
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              
              if (escaped) {
                escaped = false;
                continue;
              }
              
              if (char === '\\') {
                escaped = true;
                continue;
              }
              
              if (char === '"' && !escaped) {
                inString = !inString;
                continue;
              }
              
              if (!inString) {
                if (char === '{') {
                  braceCount++;
                  if (!foundDbqStart && text.substring(i-20, i+20).includes('"type": "dbq"')) {
                    foundDbqStart = true;
                  }
                } else if (char === '}' && foundDbqStart) {
                  braceCount--;
                  if (braceCount === 0) {
                    // This could be the end of our DBQ object
                    
                    // If we have a minimal DBQ structure, try to close it
                    const soFar = text.substring(0, i + 1);
                    if (soFar.includes('"question"') && soFar.includes('"documents"')) {
                      // Add minimal required fields if missing
                      let fixed = soFar;
                      if (!fixed.includes('"sampleAnswer"')) {
                        fixed = fixed.slice(0, -1) + ', "sampleAnswer": "Sample thesis and key arguments based on the documents provided."}';
                      }
                      return '[' + fixed + ']';
                    }
                  }
                }
              }
            }
            
            // If we found a partial DBQ but it's incomplete, try to salvage it
            if (foundDbqStart && text.includes('"question"')) {
              // Try to create a minimal valid DBQ
              const hasDocuments = text.includes('"documents"');
              if (hasDocuments) {
                // Find the last complete part and try to close it properly
                let lastValidEnd = text.lastIndexOf('}');
                if (lastValidEnd > 0) {
                  let attempt = text.substring(0, lastValidEnd + 1);
                  if (!attempt.includes('"sampleAnswer"')) {
                    attempt = attempt.slice(0, -1) + ', "sampleAnswer": "Sample response based on document analysis."}';
                  }
                  return '[' + attempt + ']';
                }
              }
            }
          }
          return text;
        },
        // First, detect and handle truncated responses
        text => {
          // If text ends abruptly without proper closing, try to fix it
          if (text.includes('[') && !text.endsWith(']')) {
            console.log('🔧 Detected truncated JSON array, attempting to fix...');
            // Remove any incomplete trailing objects/text
            let lastCompleteObjectEnd = -1;
            let braceCount = 0;
            let inString = false;
            let escaped = false;
            
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              
              if (escaped) {
                escaped = false;
                continue;
              }
              
              if (char === '\\') {
                escaped = true;
                continue;
              }
              
              if (char === '"' && !escaped) {
                inString = !inString;
                continue;
              }
              
              if (!inString) {
                if (char === '{') {
                  braceCount++;
                } else if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    lastCompleteObjectEnd = i;
                  }
                }
              }
            }
            
            if (lastCompleteObjectEnd > 0) {
              const truncated = text.substring(0, lastCompleteObjectEnd + 1);
              // Check if we need a comma before closing bracket
              const afterLastObject = text.substring(lastCompleteObjectEnd + 1).trim();
              if (afterLastObject.startsWith(',')) {
                return truncated + ']';
              } else {
                return truncated + ']';
              }
            }
          }
          return text;
        },
        // Fix trailing commas
        text => text.replace(/,(\s*[}\]])/g, '$1'),
        // Fix missing quotes around keys
        text => text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
        // Fix single quotes to double quotes (but preserve escaped quotes)
        text => text.replace(/(?<!\\)'/g, '"'),
        // Remove any explanatory text before JSON
        text => {
          const jsonStart = Math.min(
            text.indexOf('[') >= 0 ? text.indexOf('[') : Infinity,
            text.indexOf('{') >= 0 ? text.indexOf('{') : Infinity
          );
          return jsonStart < Infinity ? text.substring(jsonStart) : text;
        },
        // Remove any text after the last ] or }
        text => {
          const lastBracket = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
          return lastBracket >= 0 ? text.substring(0, lastBracket + 1) : text;
        },
        // Fix escaped quotes inside strings
        text => text.replace(/\\"/g, '"').replace(/"([^"]*)""/g, '"$1"'),
        // Fix incomplete JSON by adding missing closing brackets and braces
        text => {
          const openBrackets = (text.match(/\[/g) || []).length;
          const closeBrackets = (text.match(/\]/g) || []).length;
          const openBraces = (text.match(/\{/g) || []).length;
          const closeBraces = (text.match(/\}/g) || []).length;
          
          let fixed = text;
          
          // If there's a trailing comma at the end, remove it
          fixed = fixed.replace(/,\s*$/, '');
          
          // Add missing closing braces for objects first
          for (let i = 0; i < openBraces - closeBraces; i++) {
            fixed += '}';
          }
          // Then add missing closing brackets for arrays
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            fixed += ']';
          }
          return fixed;
        },
        // Try to handle cut-off JSON by removing the last incomplete object
        text => {
          if (text.includes('[') && !text.endsWith(']')) {
            // Find the last complete object (ending with })
            const lastCompleteObject = text.lastIndexOf('}');
            if (lastCompleteObject > 0) {
              // Check if there's a comma after it
              const afterObject = text.substring(lastCompleteObject + 1).trim();
              if (afterObject.startsWith(',')) {
                // Remove everything after the last complete object and add closing bracket
                return text.substring(0, lastCompleteObject + 1) + ']';
              } else if (afterObject === '') {
                // Just add the closing bracket
                return text + ']';
              }
            }
          }
          return text;
        },
        // Handle truncated strings and incomplete objects more aggressively  
        text => {
          try {
            // Find all complete objects by scanning for balanced braces
            const objects = [];
            let depth = 0;
            let start = -1;
            let inString = false;
            let escapeNext = false;
            
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\') {
                escapeNext = true;
                continue;
              }
              
              if (char === '"' && !escapeNext) {
                inString = !inString;
                continue;
              }
              
              if (!inString) {
                if (char === '{') {
                  if (depth === 0) start = i;
                  depth++;
                } else if (char === '}') {
                  depth--;
                  if (depth === 0 && start >= 0) {
                    const objText = text.substring(start, i + 1);
                    try {
                      const obj = JSON.parse(objText);
                      objects.push(obj);
                    } catch (e) {
                      // Skip invalid objects
                    }
                    start = -1;
                  }
                }
              }
            }
            
            return objects.length > 0 ? JSON.stringify(objects) : text;
          } catch (e) {
            return text;
          }
        },
        // Advanced repair: Attempt to reconstruct truncated objects
        text => {
          if (!text.includes('[')) return text;
          
          try {
            // If it starts with [ but doesn't end properly, try to fix it
            const arrayMatch = text.match(/^\s*\[\s*/);
            if (arrayMatch) {
              // Find all complete objects within the array
              const objectsText = text.substring(arrayMatch[0].length);
              const objects = [];
              let objStart = 0;
              let braceCount = 0;
              let inString = false;
              let escaped = false;
              
              for (let i = 0; i < objectsText.length; i++) {
                const char = objectsText[i];
                
                if (escaped) {
                  escaped = false;
                  continue;
                }
                
                if (char === '\\') {
                  escaped = true;
                  continue;
                }
                
                if (char === '"' && !escaped) {
                  inString = !inString;
                  continue;
                }
                
                if (!inString) {
                  if (char === '{') {
                    braceCount++;
                  } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                      // Found a complete object
                      const objText = objectsText.substring(objStart, i + 1);
                      try {
                        const obj = JSON.parse(objText);
                        objects.push(obj);
                        // Move to next object start
                        objStart = i + 1;
                        // Skip commas and whitespace
                        while (objStart < objectsText.length && 
                               /[\s,]/.test(objectsText[objStart])) {
                          objStart++;
                        }
                        i = objStart - 1; // -1 because loop will increment
                      } catch (e) {
                        // Skip malformed object
                      }
                    }
                  }
                }
              }
              
              if (objects.length > 0) {
                return JSON.stringify(objects);
              }
            }
            
            return text;
          } catch (e) {
            return text;
          }
        }
      ];
      
      // Try each repair sequentially (accumulating fixes)
      let currentText = cleanedText;
      for (let i = 0; i < repairs.length; i++) {
        try {
          currentText = repairs[i](currentText);
          const parsed = JSON.parse(currentText);
          console.log(`✅ JSON repair successful with repair method ${i + 1}`);
          // Ensure questions have proper sequential IDs
          if (Array.isArray(parsed)) {
            for (let j = 0; j < parsed.length; j++) {
              if (!parsed[j].id || typeof parsed[j].id !== 'number') {
                parsed[j].id = startId + j;
              }
            }
          }
          return parsed;
        } catch (repairError) {
          console.log(`❌ Repair method ${i + 1} failed:`, repairError.message);
          // Continue with the repaired text for next iteration
        }
      }
      
      // If all repairs fail, log more details and throw error
      console.error('Failed to parse AI response after all repair attempts:');
      console.error('Original text (first 500 chars):', text.substring(0, 500));
      console.error('Final repaired text (first 500 chars):', currentText.substring(0, 500));
      console.error('Text length - Original:', text.length, 'Final:', currentText.length);
      console.error('Parse error:', error.message);
      
      // Check if response was likely truncated
      const wasTruncated = !text.trim().endsWith(']') && !text.trim().endsWith('}');
      const truncationNote = wasTruncated ? ' Response appears to be truncated.' : '';
      
      throw new Error(`JSON parsing failed even after repair attempts: ${error.message}.${truncationNote} AI response may be malformed or incomplete.`);
    }
  };

  // Normalize a rubric for a given question into items with labels and points
  const buildRubricItems = (question) => {
    const items = [];
    const type = question?.type || 'frq';
    const total = question?.rubric?.totalPoints || question?.points || (
      type === 'dbq' ? 7 : type === 'leq' ? 6 : type === 'saq' ? 3 : 9
    );

    // If rubric has explicit breakdown array of labels like ["Thesis (1pt)", ...]
    if (Array.isArray(question?.rubric?.breakdown) && question.rubric.breakdown.length > 0) {
      const labels = question.rubric.breakdown;
      // Try to parse points from labels; default to equal split
      const parsed = labels.map(lbl => {
        const m = lbl.match(/(\d+)\s*pt/i);
        return { label: lbl, maxPoints: m ? parseInt(m[1], 10) : null };
      });
      let knownSum = parsed.reduce((s, i) => s + (i.maxPoints || 0), 0);
      const unknowns = parsed.filter(i => i.maxPoints == null).length;
      const equal = unknowns > 0 ? Math.max(1, Math.floor((total - knownSum) / Math.max(1, unknowns))) : 0;
      parsed.forEach((p, idx) => items.push({ id: `r${idx+1}`, label: p.label, maxPoints: p.maxPoints ?? equal }));
      return { items, totalPoints: total };
    }

    // History-specific defaults
    if (type === 'dbq') {
      return {
        items: [
          { id: 'thesis', label: 'Thesis/Claim', maxPoints: 1 },
          { id: 'context', label: 'Contextualization', maxPoints: 1 },
          { id: 'evidence-docs', label: 'Evidence from Documents', maxPoints: 2 },
          { id: 'evidence-beyond', label: 'Evidence Beyond the Documents', maxPoints: 1 },
          { id: 'analysis', label: 'Analysis and Reasoning', maxPoints: 2 }
        ],
        totalPoints: 7
      };
    }
    if (type === 'leq') {
      return {
        items: [
          { id: 'thesis', label: 'Thesis/Claim', maxPoints: 1 },
          { id: 'context', label: 'Contextualization', maxPoints: 1 },
          { id: 'evidence', label: 'Evidence', maxPoints: 2 },
          { id: 'analysis', label: 'Analysis and Reasoning', maxPoints: 2 }
        ],
        totalPoints: 6
      };
    }
    if (type === 'saq') {
      return {
        items: [
          { id: 'a', label: 'Part A', maxPoints: 1 },
          { id: 'b', label: 'Part B', maxPoints: 1 },
          { id: 'c', label: 'Part C', maxPoints: 1 }
        ],
        totalPoints: 3
      };
    }

    // AP English generic (6 pt)
    if (['synthesis','argumentative','poetry-analysis','prose-analysis','rhetorical-analysis','open-question','essays'].includes(type)) {
      return {
        items: [
          { id: 'thesis', label: 'Thesis', maxPoints: 1 },
          { id: 'evidence', label: 'Evidence and Commentary', maxPoints: 4 },
          { id: 'sophistication', label: 'Sophistication', maxPoints: 1 }
        ],
        totalPoints: 6
      };
    }

    // Generic STEM FRQ
    const parts = (question?.parts && typeof question.parts === 'object') ? Object.keys(question.parts) : ['a','b','c'];
    const per = Math.max(1, Math.floor(total / Math.max(1, parts.length)));
    parts.forEach((p, idx) => items.push({ id: p, label: `Part ${String(p).toUpperCase()}`, maxPoints: per }));
    return { items, totalPoints: total };
  };

  // Merge AI breakdown scores into rubric items; conservative mapping if keys differ
  const attachScoresToRubric = (rubric, breakdownObj = {}, totalScore = null) => {
    const items = rubric.items.map((it, idx) => ({ ...it, earned: 0 }));
    const entries = Object.entries(breakdownObj || {});
    if (entries.length > 0) {
      // Try direct key match first
      for (const [k, v] of entries) {
        const found = items.find(i => i.id === k || i.label.toLowerCase().includes(String(k).toLowerCase()));
        if (found) found.earned = Math.max(0, Math.min(found.maxPoints, Number(v) || 0));
      }
      // If no direct matches produced any earnings, map by index order
      const anyEarned = items.some(i => i.earned > 0);
      if (!anyEarned) {
        entries.slice(0, items.length).forEach(([_, v], i) => {
          items[i].earned = Math.max(0, Math.min(items[i].maxPoints, Number(v) || 0));
        });
      }
    } else if (typeof totalScore === 'number' && totalScore > 0) {
      // Evenly distribute totalScore across items as a fallback visualization
      const per = Math.floor(totalScore / items.length);
      items.forEach((it, i) => { it.earned = Math.max(0, Math.min(it.maxPoints, per)); });
    }
    return { ...rubric, items };
  };

  // Helper function to fix LaTeX in parsed questions
  const fixLaTeXInQuestions = (questions) => {
    if (!Array.isArray(questions)) return questions;
    
    return questions.map(question => {
      // Fix LaTeX in question text
      if (question.question) {
        question.question = fixLaTeXInText(question.question);
      }
      
      // Fix LaTeX in options for MCQ and handle [object Object] issues
      if (question.options && Array.isArray(question.options)) {
        question.options = question.options.map(option => {
          // Handle different option formats
          if (typeof option === 'string') {
            // Option is just a string
            return {
              letter: null, // Will be assigned later
              text: fixLaTeXInText(option)
            };
          } else if (typeof option === 'object' && option !== null) {
            // Option is an object - ensure it has proper text property
            let optionText = '';
            
            if (option.text) {
              optionText = option.text;
            } else if (option.option) {
              optionText = option.option;
            } else if (option.answer) {
              optionText = option.answer;
            } else if (option.choice) {
              optionText = option.choice;
            } else {
              // If we can't find text, convert the whole object to string as fallback
              optionText = JSON.stringify(option);
            }
            
            return {
              letter: option.letter || null,
              text: fixLaTeXInText(String(optionText))
            };
          } else {
            // Fallback for any other type
            return {
              letter: null,
              text: fixLaTeXInText(String(option))
            };
          }
        });
        
        // Ensure options have proper letter assignments (A, B, C, D, E)
        const letters = ['A', 'B', 'C', 'D', 'E'];
        question.options.forEach((option, index) => {
          if (index < letters.length) {
            option.letter = letters[index];
          }
        });
      }
      
      // Fix LaTeX in explanations
      if (question.explanation) {
        question.explanation = fixLaTeXInText(question.explanation);
      }
      
      // Fix LaTeX in sample answers
      if (question.sampleAnswer) {
        question.sampleAnswer = fixLaTeXInText(question.sampleAnswer);
      }
      
      // Ensure correct answer is properly formatted
      if (question.correctAnswer && typeof question.correctAnswer === 'object') {
        // If correctAnswer is an object, extract the text
        if (question.correctAnswer.text) {
          question.correctAnswer = question.correctAnswer.text;
        } else if (question.correctAnswer.letter) {
          question.correctAnswer = question.correctAnswer.letter;
        } else {
          question.correctAnswer = String(question.correctAnswer);
        }
      }
      
      return question;
    });
  };

  // Helper function to fix LaTeX in text
  // Only applies Greek-letter / symbol replacements INSIDE $...$ delimiters
  // to avoid corrupting plain English like "alpha particles" or "beta decay"
  const fixLaTeXInText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Phase 1: Fix malformed fraction/function stuttering (safe on all text)
    let result = text
      .replace(/\\f\\f\\f\\frac/g, '\\frac')
      .replace(/\\f\\f\\frac/g, '\\frac')
      .replace(/\f\f\f\\frac/g, '\\frac')
      .replace(/\f\f\\frac/g, '\\frac')
      .replace(/f\f\f\\frac/g, '\\frac')
      .replace(/f\f\\frac/g, '\\frac')
      .replace(/\\\\\\\\frac/g, '\\frac')
      .replace(/\\\\\\frac/g, '\\frac')
      .replace(/\\\\frac/g, '\\frac')
      .replace(/f+\\(frac|sqrt|sin|cos|tan|lim|int|sum)/g, '\\$1')
      .replace(/\\\\\\\\/g, '\\\\')
      .replace(/\\\\\\/g, '\\\\')
      .replace(/\\l\\l\\lim/g, '\\lim')
      .replace(/\\l\\lim/g, '\\lim')
      .replace(/\\s\\s\\sin/g, '\\sin')
      .replace(/\\s\\sin/g, '\\sin')
      .replace(/\\c\\c\\cos/g, '\\cos')
      .replace(/\\c\\cos/g, '\\cos')
      .replace(/\\t\\t\\tan/g, '\\tan')
      .replace(/\\t\\tan/g, '\\tan')
      .replace(/\\s\\sqrt/g, '\\sqrt')
      .replace(/\\sq\\sqrt/g, '\\sqrt')
      .replace(/\brac\{/g, '\\frac{');

    // Phase 2: Fix LaTeX ONLY inside $...$ delimiters
    // Split text by $ delimiters, process only the math segments
    const parts = result.split(/(\$\$?[^$]*\$\$?)/g);
    result = parts.map(part => {
      // Only process segments that are inside $...$ or $$...$$
      if (part.startsWith('$') && part.endsWith('$')) {
        return part
          .replace(/\bsin\(/g, '\\sin(')
          .replace(/\bcos\(/g, '\\cos(')
          .replace(/\btan\(/g, '\\tan(')
          .replace(/\bln\(/g, '\\ln(')
          .replace(/\blog\(/g, '\\log(')
          .replace(/\blim_/g, '\\lim_')
          .replace(/\bint\s/g, '\\int ')
          .replace(/\bsum_/g, '\\sum_')
          .replace(/\bsqrt\{/g, '\\sqrt{')
          .replace(/\bpi\b/g, '\\pi')
          .replace(/\btheta\b/g, '\\theta')
          .replace(/\balpha\b/g, '\\alpha')
          .replace(/\bbeta\b/g, '\\beta')
          .replace(/\bgamma\b/g, '\\gamma')
          .replace(/\bdelta\b/g, '\\delta')
          .replace(/\blambda\b/g, '\\lambda')
          .replace(/\bmu\b/g, '\\mu')
          .replace(/\bsigma\b/g, '\\sigma')
          .replace(/\bomega\b/g, '\\omega')
          .replace(/\binfty\b/g, '\\infty')
          .replace(/\bcdot\b/g, '\\cdot')
          .replace(/\btimes\b/g, '\\times')
          .replace(/\bdiv\b/g, '\\div')
          .replace(/\bpm\b/g, '\\pm')
          .replace(/\bleq\b/g, '\\leq')
          .replace(/\bgeq\b/g, '\\geq')
          .replace(/\bneq\b/g, '\\neq')
          .replace(/\brightarrow\b/g, '\\rightarrow')
          .replace(/\bleftarrow\b/g, '\\leftarrow')
          .replace(/\bpartial\b/g, '\\partial')
          .replace(/\bnabla\b/g, '\\nabla');
      }
      return part;
    }).join('');
    
    return result;
  };

  // Helper function to check for duplicate questions
  const isQuestionDuplicate = (newQuestion, existingQuestions) => {
    if (!existingQuestions || existingQuestions.length === 0) return false;
    
    const normalizeText = (text) => {
      return text.toLowerCase()
        .replace(/\$[^$]*\$/g, 'LATEX') // Replace LaTeX with placeholder
        .replace(/\\[a-z]+\{[^}]*\}/g, 'LATEX') // Replace LaTeX commands
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();
    };
    
    const newQuestionText = normalizeText(newQuestion.question || '');
    
    return existingQuestions.some(existing => {
      const existingText = normalizeText(existing.question || '');
      
      // Check for exact match
      if (existingText === newQuestionText) {
        console.log('🚫 Exact duplicate detected:', newQuestionText.substring(0, 50) + '...');
        return true;
      }
      
      // For math questions, check core mathematical content similarity
      if (newQuestionText.includes('latex')) {
        // Extract the main mathematical components
        const newCore = newQuestionText.replace(/latex/g, '').replace(/\s+/g, ' ').trim();
        const existingCore = existingText.replace(/latex/g, '').replace(/\s+/g, ' ').trim();
        
        if (newCore === existingCore && newCore.length > 10) {
          console.log('🚫 Math content duplicate detected:', newCore.substring(0, 50) + '...');
          return true;
        }
      }
      
      // Check for significant word overlap (more strict for short questions)
      const newWords = new Set(newQuestionText.split(' ').filter(word => word.length > 2));
      const existingWords = new Set(existingText.split(' ').filter(word => word.length > 2));
      
      const intersection = new Set([...newWords].filter(word => existingWords.has(word)));
      const union = new Set([...newWords, ...existingWords]);
      
      if (union.size === 0) return false;
      
      const similarity = intersection.size / union.size;
      const overlapThreshold = newQuestionText.length < 50 ? 0.9 : 0.8; // Higher threshold for short questions
      
      if (similarity > overlapThreshold) {
        console.log('🚫 High similarity duplicate detected:', similarity.toFixed(2), newQuestionText.substring(0, 50) + '...');
        return true;
      }
      
      return false;
    });
  };

  // Helper function to filter out duplicate questions
  const removeDuplicateQuestions = (newQuestions, existingQuestions) => {
    // Get all questions from current session to check against
    const allExistingQuestions = [
      ...(existingQuestions || []),
      ...(questions || []) // Include questions from current test
    ];
    
    return newQuestions.filter(newQuestion => 
      !isQuestionDuplicate(newQuestion, allExistingQuestions)
    );
  };

  const generateQuestionBatch = async (subject, section, difficulty, numQuestions, startId, apiKey, apiUrl, selectedUnits = []) => {
    console.log('generateQuestionBatch called with selectedUnits:', selectedUnits);
    let sectionInstructions = '';
    let subjectContext = '';
    
    // Add unit-specific context if units are selected
    let unitContext = '';
    if (selectedUnits && selectedUnits.length > 0) {
      unitContext = `
      
Focus specifically on these units: ${selectedUnits.join(', ')}. 
Ensure all questions draw from content and concepts within these selected units only.`;
    } else {
      // If no units are selected, treat as if all units are selected
      unitContext = `
      
No specific units selected - generate questions that cover all units and topics for this subject. Ensure comprehensive coverage across the entire curriculum and all available units.`;
    }
    
    // Add subject-specific context for better questions
    switch(subject) {
      case 'AP U.S. History':
      case 'AP US History':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Include diverse perspectives, causation, comparison, and change over time within the selected unit scope.${unitContext}`;
        } else {
          subjectContext = `Focus on periods: Colonial Era, Revolution, Early Republic, Antebellum, Civil War, Reconstruction, Gilded Age, Progressive Era, WWI, 1920s, Depression, WWII, Cold War, Modern America. Include diverse perspectives, causation, comparison, and change over time.${unitContext}`;
        }
        break;
      case 'AP World History: Modern':
      case 'AP World History':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Emphasize global processes, cross-cultural interactions, technology, trade, social structures, and political systems within the selected unit scope.${unitContext}`;
        } else {
          subjectContext = `Focus on periods: 1200-1450, 1450-1750, 1750-1900, 1900-present. Emphasize global processes, cross-cultural interactions, technology, trade, social structures, and political systems across civilizations.${unitContext}`;
        }
        break;
      case 'AP European History':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Focus on Renaissance, Reformation, Absolutism, Enlightenment, French Revolution, Industrial Revolution, 19th-century politics, WWI, interwar, WWII, Cold War, modern Europe within the selected unit scope.${unitContext}`;
        } else {
          subjectContext = `Focus on periods: Renaissance, Reformation, Absolutism, Enlightenment, French Revolution, Industrial Revolution, 19th-century politics, WWI, interwar, WWII, Cold War, modern Europe.${unitContext}`;
        }
        break;
      case 'AP Government':
      case 'AP U.S. Government and Politics':
      case 'AP Government and Politics: Comparative':
      case 'AP Comparative Government and Politics':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only.${unitContext}`;
        } else {
          subjectContext = `Focus on political institutions, processes, and behavior. Include constitutional principles, civil liberties, political parties, elections, and comparative government systems.${unitContext}`;
        }
        break;
      case 'AP Human Geography':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only.${unitContext}`;
        } else {
          subjectContext = `Focus on spatial patterns and processes. Include population geography, cultural patterns, political geography, agriculture, industrialization, and cities.${unitContext}`;
        }
        break;
      case 'AP Biology':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Include experimental design, data analysis, and real biological scenarios within the selected unit scope.${unitContext}`;
        } else {
          subjectContext = `Focus on: Biochemistry, Cell Biology, Genetics, Evolution, Ecology. Include experimental design, data analysis, and real biological scenarios. Use current research examples.${unitContext}`;
        }
        break;
      case 'AP Chemistry':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Include laboratory scenarios and quantitative analysis within the selected unit scope.

IMPORTANT: Use proper LaTeX formatting with $ delimiters for chemical and mathematical expressions:
- Chemical formulas: $H_2O$, $NaCl$, $C_6H_{12}O_6$
- Chemical equations: $2H_2 + O_2 \\rightarrow 2H_2O$
- Equilibrium: $K_{eq} = \\frac{[products]}{[reactants]}$
- pH calculations: $pH = -\\log[H^+]$
- Gas laws: $PV = nRT$
- Thermodynamics: $\\Delta G = \\Delta H - T\\Delta S$

${unitContext}`;
        } else {
          subjectContext = `Focus on: Atomic structure, bonding, stoichiometry, kinetics, equilibrium, thermodynamics, electrochemistry. Include laboratory scenarios and quantitative analysis.

IMPORTANT: Use proper LaTeX formatting with $ delimiters for chemical and mathematical expressions:
- Chemical formulas: $H_2O$, $NaCl$, $C_6H_{12}O_6$
- Chemical equations: $2H_2 + O_2 \\rightarrow 2H_2O$
- Equilibrium: $K_{eq} = \\frac{[products]}{[reactants]}$
- pH calculations: $pH = -\\log[H^+]$
- Gas laws: $PV = nRT$
- Thermodynamics: $\\Delta G = \\Delta H - T\\Delta S$

${unitContext}`;
        }
        break;
      case 'AP Physics 1: Algebra-Based':
      case 'AP Physics 2: Algebra-Based':
      case 'AP Physics 1':
      case 'AP Physics 2':
      case 'AP Physics C: Mechanics':
      case 'AP Physics C: Electricity and Magnetism':
        subjectContext = `Focus on: Mechanics, waves, thermodynamics, electricity, magnetism. Include laboratory scenarios and quantitative problem-solving.

IMPORTANT: Use proper LaTeX formatting with $ delimiters for physics expressions:
- Forces: $F = ma$, $\\vec{F} = m\\vec{a}$
- Energy: $E = mc^2$, $KE = \\frac{1}{2}mv^2$
- Waves: $v = f\\lambda$, $y = A\\sin(kx - \\omega t)$
- Electric fields: $\\vec{E} = \\frac{\\vec{F}}{q}$, $V = \\frac{U}{q}$
- Magnetic fields: $\\vec{F} = q\\vec{v} \\times \\vec{B}$
- Units: Use proper notation like $m/s^2$, $kg \\cdot m/s$

${unitContext}`;
        break;
      case 'AP Calculus AB':
      case 'AP Calculus BC':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Include real-world contexts like motion, optimization, and area problems within the selected unit scope. 

IMPORTANT: Use proper LaTeX formatting with $ delimiters for all mathematical expressions:
- Functions: $f(x) = x^2 + 3x - 1$
- Derivatives: $\\frac{d}{dx}[x^3] = 3x^2$ or $f'(x)$
- Integrals: $\\int x^2 dx = \\frac{x^3}{3} + C$ or $\\int_a^b f(x) dx$
- Limits: $\\lim_{x \\to a} f(x) = L$
- Fractions: $\\frac{numerator}{denominator}$
- Square roots: $\\sqrt{x}$ or $\\sqrt[n]{x}$
- Subscripts/Superscripts: $x_1$, $x^2$, $e^{x}$
- Greek letters: $\\pi$, $\\theta$, $\\alpha$, $\\beta$
- Trigonometric: $\\sin(x)$, $\\cos(x)$, $\\tan(x)$

${unitContext}`;
        } else {
          subjectContext = `Focus on: Limits, derivatives, integrals, fundamental theorem, applications. Include real-world contexts like motion, optimization, and area problems. 

IMPORTANT: Use proper LaTeX formatting with $ delimiters for all mathematical expressions:
- Functions: $f(x) = x^2 + 3x - 1$
- Derivatives: $\\frac{d}{dx}[x^3] = 3x^2$ or $f'(x)$
- Integrals: $\\int x^2 dx = \\frac{x^3}{3} + C$ or $\\int_a^b f(x) dx$
- Limits: $\\lim_{x \\to a} f(x) = L$
- Fractions: $\\frac{numerator}{denominator}$
- Square roots: $\\sqrt{x}$ or $\\sqrt[n]{x}$
- Subscripts/Superscripts: $x_1$, $x^2$, $e^{x}$
- Greek letters: $\\pi$, $\\theta$, $\\alpha$, $\\beta$
- Trigonometric: $\\sin(x)$, $\\cos(x)$, $\\tan(x)$

${unitContext}`;
        }
        break;
      case 'AP Statistics':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Use real statistical studies and data analysis scenarios within the selected unit scope.

IMPORTANT: Use proper LaTeX formatting with $ delimiters for statistical expressions:
- Probability: $P(A) = 0.5$, $P(A|B)$
- Statistics: $\\bar{x}$, $s$, $\\sigma$, $\\mu$
- Distributions: $N(\\mu, \\sigma^2)$, $t_{df}$, $\\chi^2$
- Formulas: $z = \\frac{\\bar{x} - \\mu}{\\sigma/\\sqrt{n}}$
- Confidence intervals: $\\bar{x} \\pm t_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}}$

${unitContext}`;
        } else {
          subjectContext = `Focus on: Collecting data, exploring data, probability, sampling distributions, inference. Use real statistical studies and data analysis scenarios.

IMPORTANT: Use proper LaTeX formatting with $ delimiters for statistical expressions:
- Probability: $P(A) = 0.5$, $P(A|B)$
- Statistics: $\\bar{x}$, $s$, $\\sigma$, $\\mu$
- Distributions: $N(\\mu, \\sigma^2)$, $t_{df}$, $\\chi^2$
- Formulas: $z = \\frac{\\bar{x} - \\mu}{\\sigma/\\sqrt{n}}$
- Confidence intervals: $\\bar{x} \\pm t_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}}$

${unitContext}`;
        }
        break;
      case 'AP Computer Science A':
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Use realistic programming scenarios and debugging challenges within the selected unit scope.${unitContext}`;
        } else {
          subjectContext = `Focus on: Java programming, object-oriented design, algorithms, data structures. Use realistic programming scenarios and debugging challenges.${unitContext}`;
        }
        break;
      case 'AP English Literature and Composition':
      case 'AP English Literature':
        subjectContext = `Focus on: Poetry analysis, prose fiction, drama. Include works from diverse time periods and cultures. Emphasize literary devices, themes, and critical analysis.${unitContext}`;
        break;
      case 'AP English Language and Composition':
      case 'AP English Language':
        subjectContext = `Focus on: Rhetorical analysis, argument construction, synthesis. Use contemporary and historical texts on social, political, and cultural issues.${unitContext}`;
        break;
      default:
        if (selectedUnits && selectedUnits.length > 0) {
          subjectContext = `Focus exclusively on these selected units: ${selectedUnits.join(', ')}. Draw all questions from content within these specific units only. Create authentic, challenging questions that reflect real AP exam standards and current curriculum requirements for ${subject}.${unitContext}`;
        } else {
          subjectContext = `Create authentic, challenging questions that reflect real AP exam standards and current curriculum requirements for ${subject}.${unitContext}`;
        }
    }
    
    // Specific instructions for different question types
    if (section === 'mcq') {
      // Determine if subject requires stimulus material
      const requiresStimulus = subject.includes('History') || subject.includes('Government') || subject.includes('English') || subject.includes('Human Geography');
      
      if (requiresStimulus) {
        sectionInstructions = `Create ${numQuestions} multiple choice questions that test deep understanding of ${subject} concepts.

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
1. STIMULUS MATERIAL: Each group of 2-4 questions must have stimulus material (primary source text, graph, chart, image description, scenario, etc.)
2. EXPLANATIONS: Every question must include a detailed explanation of why the correct answer is right and why others are wrong
3. STRUCTURE: Group questions that share the same stimulus together
4. EXACTLY 4 OPTIONS: Each question MUST have exactly 4 answer options (A, B, C, D)
5. ONE CORRECT ANSWER: Mark exactly one option as correct: true, others as false

Each question must include:
- Relevant stimulus material (primary sources, documents, graphs, scenarios) - USE THE SAME STIMULUS FOR 2-4 CONSECUTIVE QUESTIONS
- A challenging question that requires analysis of the stimulus
- EXACTLY 4 options (A, B, C, D) with ONE clearly correct answer
- A detailed explanation covering the correct answer and common misconceptions
- Plausible distractors based on common student errors

${subjectContext}

VALIDATION REQUIREMENTS:
- MUST have exactly 4 options per question
- MUST have exactly one correct answer per question
- MUST include stimulus material
- MUST use proper JSON formatting

JSON FORMAT EXAMPLE:
[
  {
    "id": 1,
    "type": "mcq", 
    "stimulus": "The following excerpt from President Lincoln's Gettysburg Address (1863): 'Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.'",
    "question": "Based on the stimulus, Lincoln's reference to 'four score and seven years ago' refers to which historical event?",
    "options": [
      {"text": "The signing of the Declaration of Independence", "correct": true},
      {"text": "The ratification of the Constitution", "correct": false},
      {"text": "The end of the Revolutionary War", "correct": false},
      {"text": "The establishment of the first colony", "correct": false}
    ],
    "explanation": "Four score and seven years equals 87 years before 1863, which points to 1776 and the Declaration of Independence. This connects to Lincoln's theme of equality and the founding principles."
  }
]`;
      } else {
        // For STEM subjects (Math, Science) - NO STIMULUS REQUIRED
        sectionInstructions = `Create ${numQuestions} multiple choice questions that test deep understanding of ${subject} concepts.

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
1. NO STIMULUS REQUIRED: For STEM subjects, questions should be self-contained
2. PROPER LaTeX FORMAT: Use ONLY $ delimiters for math expressions, NOT \\( \\) or \\[ \\]:
   - CORRECT: $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$
   - WRONG: \\\\( \\\\lim_{x \\\\to 0} \\\\frac{\\\\sin(x)}{x} \\\\)
   - Use single backslashes: $\\frac{a}{b}$ not $\\\\frac{a}{b}$
   - Limits: $\\lim_{x \\to 0}$ NOT $\\lim_{x o 0}$
   - Fractions: $\\frac{numerator}{denominator}$
   - Trigonometric: $\\sin(x)$, $\\cos(x)$, $\\tan(x)$
   - Integrals: $\\int_a^b f(x) dx$
   - Derivatives: $\\frac{d}{dx}[f(x)]$ or $f'(x)$
   - Greek letters: $\\pi$, $\\theta$, $\\alpha$, $\\beta$
   - Arrows: $\\to$, $\\rightarrow$
   - Infinity: $\\infty$
3. EXPLANATIONS: Every question must include a detailed explanation
4. EXACTLY 4 OPTIONS: Each question MUST have exactly 4 answer options (A, B, C, D)
5. ONE CORRECT ANSWER: Mark exactly one option as correct: true, others as false
6. UNIQUE QUESTIONS: Ensure each question is substantially different from others

Each question must include:
- A challenging, self-contained question testing conceptual understanding
- EXACTLY 4 options with ONE clearly correct answer
- Proper LaTeX formatting for mathematical expressions using \\ prefix
- A detailed explanation covering the solution method
- Plausible distractors based on common calculation errors

${subjectContext}

VALIDATION REQUIREMENTS:
- MUST have exactly 4 options per question
- MUST have exactly one correct answer per question
- MUST use proper JSON formatting
- MUST include detailed explanations

JSON FORMAT EXAMPLE:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "Evaluate $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
    "options": [
      {"text": "0", "correct": false},
      {"text": "2", "correct": false},
      {"text": "4", "correct": true},
      {"text": "Does not exist", "correct": false}
    ],
    "explanation": "Factor the numerator: $x^2 - 4 = (x-2)(x+2)$. Cancel $(x-2)$ terms to get $\\lim_{x \\to 2}(x+2) = 4$."
  }
]`;
      }

    } else if (section === 'frq') {
      // Different FRQ requirements for different subjects
      if (subject.includes('Calculus')) {
        sectionInstructions = `Create ${numQuestions} AP Calculus FRQ questions. Each question MUST:

CRITICAL REQUIREMENTS:
1. MULTI-PART STRUCTURE: Each FRQ must have exactly 3-4 parts labeled (a), (b), (c), and optionally (d)
2. POINT VALUE: Each FRQ is worth exactly 9 points total distributed across parts
3. REALISTIC CONTEXTS: Use real-world applications (motion, rates, optimization, area/volume, etc.)
4. PROPER LaTeX FORMAT: Use ONLY $ delimiters for math expressions:
   - Functions: $f(x) = x^2 + 3x - 1$
   - Derivatives: $\\frac{d}{dx}[x^3] = 3x^2$ or $f'(x)$
   - Integrals: $\\int x^2 dx = \\frac{x^3}{3} + C$
   - Limits: $\\lim_{x \\to a} f(x) = L$
   - Fractions: $\\frac{numerator}{denominator}$
   - Trigonometric: $\\sin(x)$, $\\cos(x)$, $\\tan(x)$
5. CLEAR PART SEPARATION: Each part should be clearly marked and test different skills

${subjectContext}

PART DISTRIBUTION (9 points total):
- Part (a): 2-3 points - Setup or basic calculation
- Part (b): 2-3 points - Application or interpretation  
- Part (c): 2-3 points - Advanced analysis or extension
- Part (d): 1-2 points - Justification or conceptual understanding

JSON FORMAT:
[
  {
    "id": number,
    "type": "frq",
    "question": "Multi-part question with realistic context and proper LaTeX formatting. Part (a) [...] Part (b) [...] Part (c) [...] Part (d) [...]",
    "rubric": {
      "totalPoints": 9,
      "a": {"points": 2, "description": "Setup and calculation"},
      "b": {"points": 3, "description": "Application and interpretation"},  
      "c": {"points": 3, "description": "Advanced analysis"},
      "d": {"points": 1, "description": "Justification"}
    },
    "sampleAnswer": "Part (a): [Complete solution with work shown]\nPart (b): [Complete solution]\nPart (c): [Complete solution]\nPart (d): [Complete justification]"
  }
]`;
      } else {
        sectionInstructions = `Create ${numQuestions} free response questions with detailed, specific prompts. Each question must:
- Have clear, specific instructions
- Include multiple parts (a, b, c) that build on each other
- Test different cognitive skills (analysis, evaluation, synthesis)
- Provide realistic scenarios or authentic source material
- Include comprehensive rubrics with point breakdowns

${subjectContext}

Questions should be substantive and require extended, thoughtful responses that demonstrate mastery of course concepts.`;
      }

    } else if (section === 'saq') {
      sectionInstructions = `Create ${numQuestions} Short Answer Questions with REAL historical stimulus material. Each question must:

STIMULUS REQUIREMENTS:
- Use ACTUAL historical sources with real content (speeches, documents, data, images)
- Include real historical figures, dates, events, and places
- Provide 3-5 sentences of authentic historical content that students can analyze
- Include proper source attribution with real titles, authors, and dates

QUESTION STRUCTURE:
a) Identify and explain ONE specific [historical development/cause/effect] shown in the source
b) Explain ONE additional [cause/consequence/similarity/difference] not mentioned in the source
c) Explain ONE way the [situation/event/development] in the source [affected/was affected by] another historical development

EXAMPLE STIMULUS - USE REAL CONTENT LIKE THIS:
Source: Frederick Douglass, "What to the Slave is the Fourth of July?" July 5, 1852

"What, to the American slave, is your 4th of July? I answer: a day that reveals to him, more than all other days in the year, the gross injustice and cruelty to which he is the constant victim. To him, your celebration is a sham; your boasted liberty, an unholy license; your national greatness, swelling vanity; your sounds of rejoicing are empty and heartless..."

CONTENT REQUIREMENTS:
- NO placeholder text or generic examples
- Use real historical documents, speeches, data, charts, or images
- Each source must be substantial enough for students to extract specific evidence
- Include complete source citations with real titles and dates

${subjectContext}

Questions must test historical thinking skills with authentic sources that students can analyze for specific evidence.

JSON FORMAT FOR SAQ QUESTIONS:
[
  {
    "id": startId,
    "type": "saq",
    "stimulus": "Source: [Author Name], [Document Title], [Date]\n\n[3-5 sentences of actual historical content with real quotes and specific details]",
    "question": "a) Identify and explain ONE specific [development/cause/effect] shown in the source.\nb) Explain ONE additional [cause/consequence/similarity/difference] not mentioned in the source.\nc) Explain ONE way the [situation/event] in the source [affected/was affected by] another historical development.",
    "sampleAnswer": "a) [Specific response with evidence from source]\nb) [Additional analysis with historical context]\nc) [Connection to broader historical developments]"
  }
]

CRITICAL: Every SAQ question MUST include the "sampleAnswer" field with proper expected responses for parts a, b, and c.`;

    } else if (section === 'dbq') {
      sectionInstructions = `Create 1 comprehensive Document-Based Question with exactly 7 REAL historical documents. CRITICAL REQUIREMENTS:

DOCUMENT REQUIREMENTS:
- Use ACTUAL historical documents, not generic placeholders or template text
- Each document must be 4-8 sentences long with substantive content
- Include REAL historical figures, events, dates, and places  
- Use authentic quotes from primary sources
- Provide complete, accurate source citations with real titles and dates

DOCUMENTS REQUIRED:
Document A: Government document (law, proclamation, treaty, speech) with actual legislative/official text
Document B: Personal letter/diary from real historical figure with authentic personal content
Document C: Newspaper article or editorial from the time period with real excerpts and headlines
Document D: Economic data/business records with actual statistics, prices, or business correspondence
Document E: Opposition viewpoint with real arguments and specific criticisms from actual sources
Document F: Visual source (political cartoon, photograph, map) with detailed description of real image
Document G: Secondary source from real historian with specific analysis and interpretation

EXAMPLE FORMAT - USE REAL CONTENT LIKE THIS:
Document A:
Source: Abraham Lincoln, Emancipation Proclamation, January 1, 1863
"That on the first day of January, in the year of our Lord one thousand eight hundred and sixty-three, all persons held as slaves within any State or designated part of a State, the people whereof shall then be in rebellion against the United States, shall be then, thenceforward, and forever free; and the Executive Government of the United States, including the military and naval authority thereof, will recognize and maintain the freedom of such persons..."

SPECIFIC TIME PERIODS TO USE:
- US History: 1607-1754, 1754-1800, 1800-1848, 1844-1877, 1865-1898, 1890-1945, 1945-1980
- World History: 1200-1450, 1450-1750, 1750-1900, 1900-2001
- European History: 1450-1648, 1648-1815, 1815-1914, 1914-present

${subjectContext}

NO PLACEHOLDER TEXT ALLOWED - every document must contain real historical content with actual quotes that students can analyze for evidence, point of view, purpose, and historical context.

CRITICAL: Documents must contain ACTUAL WORDS from real historical sources, not summaries or descriptions. Students need to read and analyze the actual language used by historical figures, not modern paraphrases. Each document should be 4-8 sentences of authentic historical text that students can quote and analyze.

JSON FORMAT FOR DBQ QUESTIONS:
[
  {
    "id": startId,
    "type": "dbq", 
    "question": "Based on the documents and your knowledge of United States history, write an essay addressing: [specific historical question with actual time period and events]",
    "prompt": "[Detailed prompt text with specific historical context and requirements]",
    "documents": [
      {
        "id": "A",
        "source": "[Author Name], [Document Title], [Date]",
        "content": "[4-8 sentences of actual historical content with real quotes]"
      },
      // ... 6 more documents (B through G)
    ],
    "sampleAnswer": "STRONG THESIS EXAMPLE: [Specific thesis that directly addresses the prompt with clear argument and roadmap of main points]\\n\\nKEY ARGUMENTS WITH EVIDENCE: Document A evidence and analysis + outside knowledge connection | Document B evidence with point of view/purpose analysis + contextual knowledge | Document C evidence with historical context analysis + additional supporting facts | Continue for all 7 documents\\n\\nCOUNTER-ARGUMENT: [Acknowledge complexity and limitations of argument]\\n\\nCONCLUSION: [Synthesis connecting to broader historical themes and significance]"
  }
]

CRITICAL: Every DBQ question MUST include the "documents" array with exactly 7 documents (A-G) and a comprehensive "sampleAnswer" field that demonstrates proper thesis construction, document analysis, and historical argumentation.`;

    } else if (section === 'leq') {
      sectionInstructions = `Create 1 Long Essay Question using REAL time periods and events. NO BRACKETS OR PLACEHOLDER TEXT.

FORMAT REQUIREMENTS:
- Use specific years, not [start year] or [end year] or any brackets
- Reference actual historical developments, not generic placeholders
- Create ONE comprehensive prompt (not multiple options)
- Test historical thinking skills (causation, continuity/change, comparison)

TIME PERIODS BY SUBJECT:
- AP US History: 1607-1754, 1754-1800, 1800-1848, 1844-1877, 1865-1898, 1890-1945, 1945-1980, 1980-2001
- AP World History: c. 1200-1450, c. 1450-1750, c. 1750-1900, c. 1900-2001
- AP European History: c. 1450-1648, c. 1648-1815, c. 1815-1914, c. 1914-present

EXAMPLE FORMAT - USE REAL CONTENT LIKE THIS:
Evaluate the extent to which the Industrial Revolution was a turning point in American social development in the period from 1865 to 1920. In your response, analyze what changed and what stayed the same.

REQUIRED ELEMENTS:
- Use SPECIFIC historical events and time periods
- No placeholder text or brackets anywhere
- Clear historical thinking skills tested (causation, continuity/change, comparison)
- Allow for sophisticated argumentation with evidence

${subjectContext}

Create ONE comprehensive prompt that references actual historical developments that students can analyze with specific evidence and examples.

JSON FORMAT FOR LEQ QUESTIONS:
[
  {
    "id": startId,
    "type": "leq",
    "question": "[Complete LEQ prompt with specific time period and historical developments]",
    "prompt": "[Additional context or instructions if needed]",
    "sampleAnswer": "STRONG THESIS EXAMPLE: [Clear, defensible thesis that directly addresses the prompt and establishes a line of reasoning about extent/degree of change]\\n\\nMAIN ARGUMENTS: \\n1. CHANGES: [Specific evidence of significant changes with examples, dates, and analysis of causes/effects]\\n2. CONTINUITIES: [Specific evidence of what remained the same with examples and analysis]\\n3. CONTEXT: [Broader historical developments that influenced the topic]\\n\\nEVIDENCE EXAMPLES: [List 4-6 specific historical examples with dates and significance]\\n\\nANALYSIS: [How evidence supports thesis and demonstrates understanding of historical complexity]\\n\\nCONCLUSION: [Synthesis connecting to broader historical patterns and significance]"
  }
]

CRITICAL: Every LEQ question MUST include a comprehensive "sampleAnswer" field with thesis, evidence, and analysis examples.`;
    } else if (section === 'synthesis') {
      sectionInstructions = `Create 1 Synthesis Essay question for AP English Language. Must include:
- Clear prompt asking students to synthesize multiple sources
- 6-7 sources of different types (articles, charts, images, studies)
- Each source must have proper attribution and real content
- Prompt should address contemporary issues or debates
- Sources should present different perspectives on the topic

${subjectContext}

Example format: Using the sources provided, write an essay that synthesizes at least three of the sources and develops your position on [specific issue]. Make sure your argument is central to your essay and that you cite sources to support your reasoning.

JSON FORMAT FOR SYNTHESIS QUESTIONS:
[
  {
    "id": startId,
    "type": "synthesis",
    "question": "[Clear synthesis prompt with specific issue]",
    "sources": [
      {
        "id": "A",
        "title": "[Source Title]",
        "author": "[Author Name]",
        "content": "[Source content with real data/quotes]"
      },
      // ... 5-6 more sources
    ],
    "sampleAnswer": "[Expected synthesis approach and key arguments]"
  }
]

CRITICAL: Every synthesis question MUST include the "sources" array and "sampleAnswer" field.`;
    } else if (section === 'rhetorical-analysis') {
      sectionInstructions = `Create 1 Rhetorical Analysis essay question for AP English Language. Must include:
- Authentic speech, essay, or text from a real author/speaker
- Clear context (date, audience, occasion, purpose)
- Text that demonstrates clear rhetorical strategies
- Prompt asking students to analyze how author achieves purpose

${subjectContext}

Format: [Author's name] delivered this [speech/wrote this essay/etc.] in [year] to [audience] in order to [purpose]. Read the passage carefully. Write an essay that analyzes the rhetorical strategies [author] uses to convey [his/her] message.

JSON FORMAT FOR RHETORICAL ANALYSIS QUESTIONS:
[
  {
    "id": startId,
    "type": "rhetorical-analysis",
    "question": "Read the passage carefully. Write an essay that analyzes the rhetorical strategies [author] uses to convey [his/her] message.",
    "passage": "[Complete authentic text/speech with real content]",
    "context": "[Date, audience, occasion, purpose information]",
    "sampleAnswer": "[Expected rhetorical strategies analysis and thesis]"
  }
]

CRITICAL: Every rhetorical analysis question MUST include the "passage", "context", and "sampleAnswer" fields.`;
    } else if (section === 'argumentative') {
      sectionInstructions = `Create 1 Argumentative Essay question for AP English Language. Must include:
- Clear, debatable claim or position
- Contemporary or timeless issue relevant to students
- Prompt that requires evidence-based reasoning
- Clear call for students to develop their own argument

${subjectContext}

Format: [Present issue/scenario]. Write an essay that argues your position on [specific debatable question]. Use appropriate evidence to support your argument.

JSON FORMAT FOR ARGUMENTATIVE QUESTIONS:
[
  {
    "id": startId,
    "type": "argumentative",
    "question": "[Present issue/scenario]. Write an essay that argues your position on [specific debatable question]. Use appropriate evidence to support your argument.",
    "prompt": "[Additional context or background information]",
    "sampleAnswer": "[Expected argument structure and key evidence types]"
  }
]

CRITICAL: Every argumentative question MUST include the "sampleAnswer" field.`;
    } else if (section === 'poetry-analysis') {
      sectionInstructions = `Create 1 Poetry Analysis question for AP English Literature. Must include:
- Complete poem or substantial excerpt from recognized poet
- Clear publication information and context
- Poem with rich literary devices and themes
- Prompt focusing on literary analysis skills

${subjectContext}

Format: Read the following poem carefully. Write an essay that analyzes how [specific literary elements] contribute to the poem's meaning and effect.`;
    } else if (section === 'prose-analysis') {
      sectionInstructions = `Create 1 Prose Analysis question for AP English Literature. Must include:
- Substantial excerpt from recognized work of fiction
- Clear publication information and context
- Passage with rich literary techniques and character development
- Prompt focusing on literary analysis of prose techniques

${subjectContext}

Format: Read the following passage carefully. Write an essay that analyzes how [author] uses literary techniques to [achieve specific effect/develop character/convey theme].`;
    } else if (section === 'open-question') {
      sectionInstructions = `Create 1 Open Question for AP English Literature. Must include:
- Prompt addressing universal literary themes or techniques
- List of quality literary works students can choose from
- Clear focus on literary analysis and interpretation
- Works from different time periods and cultures

${subjectContext}

Format: Choose a novel or play in which [literary element/theme]. Write an essay analyzing how [specific aspect] contributes to the work's meaning. You may choose from the following works or another work of comparable literary merit.`;
    } else if (section === 'all-frq') {
      // Create a complete FRQ section with proper question type distribution based on subject
      if (subject.includes('History')) {
        // For AP History: 3 SAQs + 1 DBQ + 1 LEQ
        sectionInstructions = `Create exactly 5 free response questions for AP ${subject} in this EXACT order and format:

QUESTIONS 1-3: SHORT ANSWER QUESTIONS (SAQ)
Create 3 Short Answer Questions with REAL historical stimulus material. Each question must:
- Use ACTUAL historical sources with real content (speeches, documents, data, images)
- Include real historical figures, dates, events, and places
- Provide 3-5 sentences of authentic historical content
- Include proper source attribution with real titles, authors, and dates
- Follow this structure:
  a) Identify and explain ONE specific historical development/cause/effect shown in the source
  b) Explain ONE additional cause/consequence/similarity/difference not mentioned in the source  
  c) Explain ONE way the situation/event in the source affected/was affected by another development

QUESTION 4: DOCUMENT-BASED QUESTION (DBQ)
Create 1 comprehensive Document-Based Question with exactly 7 REAL historical documents:
- Use ACTUAL historical documents with authentic quotes from primary sources
- Include real historical figures, events, dates, and places
- Each document must be 4-8 sentences with substantive content
- Provide complete source citations with real titles and dates
- Cover different document types: government, personal, newspaper, economic, opposition, visual, secondary

QUESTION 5: LONG ESSAY QUESTION (LEQ)  
Create 1 Long Essay Question:
- Use specific years and actual historical developments (no brackets or placeholders)
- Test historical thinking skills (causation, continuity/change, comparison)
- Focus on periods: 1607-1754, 1754-1800, 1800-1848, 1844-1877, 1865-1898, 1890-1945, 1945-1980, 1980-2001
- Create ONE comprehensive prompt (not multiple options)

${subjectContext}

CRITICAL: Each SAQ must have actual historical stimulus content, each DBQ must have 7 complete documents with real historical text, and the LEQ must have one specific prompt without options.

Return as JSON array: [{"id": startId, "type": "saq", "stimulus": "real historical content", ...}, {"id": startId+1, "type": "saq", ...}, {"id": startId+2, "type": "saq", ...}, {"id": startId+3, "type": "dbq", "documents": [7 real documents], ...}, {"id": startId+4, "type": "leq", "question": "one specific prompt", ...}]`;
      } else if (subject.includes('English')) {
        // For AP English: Mix of essay types
        sectionInstructions = `Create exactly 3 essay questions for AP ${subject} in this order:

QUESTION 1: RHETORICAL ANALYSIS
- Include authentic speech/essay from real author with clear context
- Text demonstrating clear rhetorical strategies
- Prompt analyzing how author achieves purpose

QUESTION 2: ARGUMENTATIVE ESSAY  
- Clear, debatable claim on contemporary/timeless issue
- Require evidence-based reasoning and student's own argument

QUESTION 3: ${subject.includes('Literature') ? 'POETRY/PROSE ANALYSIS' : 'SYNTHESIS'}
${subject.includes('Literature') ? '- Complete poem or substantial prose excerpt with literary analysis prompt' : '- 6-7 sources on contemporary issue with synthesis prompt'}

${subjectContext}

Return as JSON array with appropriate types: "rhetorical-analysis", "argumentative", "${subject.includes('Literature') ? 'poetry-analysis' : 'synthesis'}".`;
      } else {
        // For other subjects: Mix of long and short FRQs
        const longCount = Math.ceil(numQuestions * 0.6);
        sectionInstructions = `Create ${numQuestions} free response questions for ${subject} with this distribution:

QUESTIONS 1-${longCount}: LONG FREE RESPONSE
- Complex problem-solving requiring 25-30 minutes
- Multiple parts building to comprehensive solution
- Experimental design, data analysis, or extended explanations

QUESTIONS ${longCount + 1}-${numQuestions}: SHORT FREE RESPONSE  
- Focused skill practice requiring 10-15 minutes
- Specific concepts with clear, direct prompts
- Application and analysis with authentic scenarios

${subjectContext}

Return as JSON array alternating between "long-frq" and "short-frq" types.

REQUIRED JSON FORMAT FOR EACH QUESTION:
{
  "id": [number],
  "type": "long-frq" or "short-frq",
  "question": "[Complete question text with all parts]"
}

Additional optional fields: "points", "topics", "rubric", "scoring_rubric" - but "id", "type", and "question" are REQUIRED.`;
      }
    } else if (section === 'long-frq') {
      sectionInstructions = `Create ${numQuestions} long-form free response questions requiring extended analysis and application. Each question must:
- Test complex problem-solving and analytical skills
- Require multiple steps or parts building to comprehensive solution
- Include realistic scenarios and authentic data/contexts
- Allow for 25-30 minutes of response time
- Test higher-order thinking and synthesis

${subjectContext}

REQUIRED JSON FORMAT FOR EACH QUESTION:
{
  "id": [number],
  "type": "long-frq",
  "question": "[Complete question text with all parts]"
}

Return as JSON array with type: "long-frq".`;
    } else if (section === 'short-frq') {
      sectionInstructions = `Create ${numQuestions} short-form free response questions for focused skill practice. Each question must:
- Test specific skills or concepts concisely
- Be answerable in 10-15 minutes
- Include clear, direct prompts
- Focus on application and analysis rather than memorization
- Use authentic scenarios and examples

${subjectContext}

REQUIRED JSON FORMAT FOR EACH QUESTION:
{
  "id": [number],
  "type": "short-frq",
  "question": "[Complete question text]"
}

Questions should be targeted and efficient while maintaining rigor.`;
    } else if (section === 'calculator-frq') {
      sectionInstructions = `Create ${numQuestions} calculator-allowed free response questions for mathematics. Each question must:
- Have 3-4 distinct parts (a, b, c, d) worth a total of 9 points
- Part structure should typically be: Part (a) 2-3 points, Part (b) 2-3 points, Part (c) 2-3 points, Part (d) 1-2 points
- Require computational tools for realistic problem-solving
- Include complex calculations or graphical analysis
- Test interpretation of calculator-generated results
- Focus on modeling and application problems
- Each part should build naturally from previous parts or test different aspects

${subjectContext}

REQUIRED JSON FORMAT for each question:
{
  "id": "[unique_id]",
  "type": "calculator-frq",
  "question": "[Complete question text with all parts a, b, c, d clearly labeled]",
  "rubric": {
    "totalPoints": 9,
    "pointBreakdown": {
      "part_a": "[points for part a]",
      "part_b": "[points for part b]", 
      "part_c": "[points for part c]",
      "part_d": "[points for part d]"
    },
    "scoringGuidelines": "[Detailed explanation of how points are awarded for each part]"
  }
}

Problems should leverage calculator capabilities while testing mathematical reasoning.`;
    } else if (section === 'no-calculator-frq') {
      sectionInstructions = `Create ${numQuestions} no-calculator free response questions for mathematics. Each question must:
- Have 3-4 distinct parts (a, b, c, d) worth a total of 9 points
- Part structure should typically be: Part (a) 2-3 points, Part (b) 2-3 points, Part (c) 2-3 points, Part (d) 1-2 points
- Focus on algebraic manipulation and analytical reasoning
- Test conceptual understanding without computational aids
- Include exact solutions and symbolic representations
- Emphasize mathematical reasoning and proof techniques
- Test fundamental skills and theoretical understanding
- Each part should build naturally from previous parts or test different aspects

${subjectContext}

REQUIRED JSON FORMAT for each question:
{
  "id": "[unique_id]",
  "type": "no-calculator-frq",
  "question": "[Complete question text with all parts a, b, c, d clearly labeled]",
  "rubric": {
    "totalPoints": 9,
    "pointBreakdown": {
      "part_a": "[points for part a]",
      "part_b": "[points for part b]", 
      "part_c": "[points for part c]",
      "part_d": "[points for part d]"
    },
    "scoringGuidelines": "[Detailed explanation of how points are awarded for each part]"
  }
}

Problems should require mathematical insight rather than computation.`;
    } else if (section === 'short-answer') {
      sectionInstructions = `Create ${numQuestions} short answer questions requiring focused, concise responses. Each question must:
- Test specific knowledge and analytical skills
- Include stimulus material when appropriate
- Require 2-3 sentence responses with specific evidence
- Focus on key concepts and applications
- Be answerable in 3-5 minutes each

${subjectContext}

Questions should be direct and test essential understanding efficiently.`;
    } else if (section === 'essays') {
      sectionInstructions = `Create ${numQuestions} essay questions appropriate for the subject. Each question must:
- Require extended written responses (400-600 words)
- Test analytical and argumentative writing skills
- Include clear prompts with specific requirements
- Allow for complex reasoning and evidence use
- Focus on synthesis and evaluation

${subjectContext}

Essays should demonstrate mastery of course content through sophisticated writing.`;
    } else if (section === 'full') {
      // For full tests, use proper question distribution based on subject configuration
      const config = TEST_CONFIGURATIONS[subject] || DEFAULT_CONFIG;
      const mcqSection = config.sections.find(s => s.id === 'mcq');
      const frqSection = config.sections.find(s => s.id === 'frq');
      
      // Use actual AP test format counts
      const mcqCount = mcqSection ? mcqSection.questions : 45;
      const frqCount = frqSection ? frqSection.questions : 6;
      
      // Determine if subject requires stimulus for MCQs
      const requiresStimulus = subject.includes('History') || subject.includes('Government') || subject.includes('English') || subject.includes('Human Geography');
      
      if (subject.includes('Calculus')) {
        sectionInstructions = `Create a complete AP ${subject} practice test with EXACTLY:
- ${mcqCount} multiple choice questions (NO stimulus required for math)
- ${frqCount} free response questions (each worth 9 points with 3-4 parts)

CRITICAL GENERATION REQUIREMENTS:
- Generate EXACTLY ${mcqCount} MCQ questions first (IDs 1 to ${mcqCount})
- Then generate EXACTLY ${frqCount} FRQ questions (IDs ${mcqCount + 1} to ${mcqCount + frqCount})
- TOTAL QUESTIONS: ${mcqCount + frqCount} (no more, no less)

CRITICAL MCQ REQUIREMENTS:
- Self-contained questions with proper LaTeX formatting
- Test conceptual understanding and problem-solving
- NO stimulus field required for mathematics
- Each MCQ must have exactly 4 options with exactly one correct answer

CRITICAL FRQ REQUIREMENTS:
- Each FRQ worth exactly 9 points total
- Each FRQ has 3-4 parts (a, b, c, d)
- Real-world applications and contexts
- Proper LaTeX formatting for all mathematical expressions

${subjectContext}

IMPORTANT: Return EXACTLY ${mcqCount + frqCount} questions total. Use this exact structure:
[
  {"id": 1, "type": "mcq", ...}, 
  {"id": 2, "type": "mcq", ...}, 
  ... (${mcqCount} MCQ questions),
  {"id": ${mcqCount + 1}, "type": "frq", ...},
  {"id": ${mcqCount + 2}, "type": "frq", ...},
  ... (${frqCount} FRQ questions)
]

Generate EXACTLY ${mcqCount + frqCount} questions - no extras!`;
      } else {
        sectionInstructions = `Create a complete AP ${subject} practice test with EXACTLY:
- ${mcqCount} multiple choice questions${requiresStimulus ? ' (with stimulus material)' : ''}
- ${frqCount} comprehensive free response questions

CRITICAL GENERATION REQUIREMENTS:
- Generate EXACTLY ${mcqCount} MCQ questions first (IDs 1 to ${mcqCount})
- Then generate EXACTLY ${frqCount} FRQ questions (IDs ${mcqCount + 1} to ${mcqCount + frqCount})
- TOTAL QUESTIONS: ${mcqCount + frqCount} (no more, no less)

${requiresStimulus ? `CRITICAL MCQ REQUIREMENTS:
- Group MCQs by stimulus: questions 1-3 share stimulus A, questions 4-6 share stimulus B, etc.
- Each MCQ must have stimulus field with primary sources, documents, or scenarios
- Questions must test analysis of the stimulus material
- Each MCQ must have exactly 4 options with exactly one correct answer` : `CRITICAL MCQ REQUIREMENTS:
- Self-contained questions appropriate for ${subject}
- NO stimulus field required
- Test conceptual understanding
- Each MCQ must have exactly 4 options with exactly one correct answer`}

CRITICAL FRQ REQUIREMENTS:
- Detailed multi-part questions with comprehensive rubrics
- Include realistic scenarios and authentic source material
- Test different cognitive skills across parts

${subjectContext}

IMPORTANT: Return EXACTLY ${mcqCount + frqCount} questions total. Use this exact structure:
[
  {"id": 1, "type": "mcq", ...}, 
  {"id": 2, "type": "mcq", ...}, 
  ... (${mcqCount} MCQ questions),
  {"id": ${mcqCount + 1}, "type": "frq", ...},
  {"id": ${mcqCount + 2}, "type": "frq", ...},
  ... (${frqCount} FRQ questions)
]

Generate EXACTLY ${mcqCount + frqCount} questions - no extras!`;
      }
    }
    
    // Use the API to generate questions based on the section instructions
    const prompt = `You are an expert ${subject} question generator. ${sectionInstructions}

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. Return ONLY valid JSON array starting with [ and ending with ]
2. Generate EXACTLY ${numQuestions} complete questions
3. Each question MUST be complete with ALL required fields
4. NO explanatory text before or after the JSON
5. Ensure all JSON objects are properly closed with }
6. End the response with ] to close the array
7. Use proper LaTeX formatting: \\frac{}{}, \\sin(), \\cos(), \\lim_{}, etc.
8. Each MCQ MUST have exactly 4 options with exactly one correct answer
9. Avoid invalid escape characters that break JSON parsing

VALIDATION CHECKLIST:
✓ Starts with [
✓ Ends with ]  
✓ Exactly ${numQuestions} question objects
✓ Each MCQ has exactly 4 options
✓ Each question has all required fields
✓ Proper LaTeX formatting
✓ Valid JSON syntax

FORMAT TEMPLATE: [{"id": ${startId}, "type": "...", "question": "...", ...}, {"id": ${startId + 1}, ...}]

Generate ${numQuestions} questions now:`;

    console.log('🔍 Sending prompt to AI:', prompt.substring(0, 200) + '...');

    // Adjust token limits based on question type complexity
    let maxTokens = 2500; // Default for MCQ and SAQ
    if (section === 'dbq') {
      maxTokens = 8000; // DBQ with documents
    } else if (section === 'leq') {
      maxTokens = 2000; // LEQ
    }

    try {
      let generatedText = '';
      try {
        // Route generation through centralized service with free Puter model
        generatedText = await geminiService.generateContent(prompt, { timeoutMs: 45000, temperature: 0.7, maxTokens });
        if (!generatedText) {
          throw new Error('No text generated by AI');
        }
      } catch (puterErr) {
        console.warn('Puter generation failed, falling back to Google Gemini via API Manager:', puterErr.message);
        // Fallback to legacy Google API via apiManager
        const requestData = { subject, section, difficulty, numQuestions, selectedUnits, startId };
        const userId = (typeof user !== 'undefined' && user && user.uid) ? user.uid : 'anon';
        const questions = await apiManager.makeRequest(userId, requestData, 'high');
        // apiManager returns parsed questions array directly
        return questions;
      }
      
      console.log(`Batch parsing: Received ${generatedText.length} characters from AI`);
      
      // Use geminiService's robust JSON parsing first, fall back to parseAIResponse
      let questions;
      const jsonResult = geminiService.parseJSON(generatedText, true);
      if (jsonResult.success && Array.isArray(jsonResult.data)) {
        questions = jsonResult.data;
        console.log('Batch parsing: Successfully parsed with geminiService.parseJSON');
      } else {
        // Fall back to the local parsing function with more repairs
        console.log('Batch parsing: Falling back to parseAIResponse', jsonResult.error);
        questions = parseAIResponse(generatedText, startId);
      }
      
      // Fix LaTeX expressions in the parsed questions
      const questionsWithFixedLaTeX = fixLaTeXInQuestions(Array.isArray(questions) ? questions : [questions]);
      
      // Ensure we have an array
      const questionArray = Array.isArray(questionsWithFixedLaTeX) ? questionsWithFixedLaTeX : [questionsWithFixedLaTeX];
      
  console.log('Batch validation: Generated questions:', questionArray.length);
      console.log('Sample question structure:', questionArray[0]);
      
      // Repair questions with minor issues before validation
      const repairedQuestions = questionArray.map(q => {
        if (!q || !q.question) return q;
        
        // Repair MCQ structure issues
        if (q.type === 'mcq' && q.options) {
          // Ensure options is an array
          if (!Array.isArray(q.options)) {
            q.options = [];
          }
          
          // If we have an answer field but malformed options, try to repair
          if (q.answer && q.options.length < 4) {
            // Try to create basic options structure
            const answerChoices = ['A', 'B', 'C', 'D'];
            q.options = answerChoices.map((choice, index) => ({
              text: q[choice.toLowerCase()] || q[choice] || `Option ${choice}`,
              correct: q.answer === choice || q.answer === choice.toLowerCase() || q.answer === index
            }));
          }
          
          // Fix options that are strings instead of objects
          q.options = q.options.map((opt, index) => {
            if (typeof opt === 'string') {
              return {
                text: opt,
                correct: q.correctAnswer === index || q.answer === index
              };
            }
            return opt;
          });
          
          // Ensure exactly one correct answer
          const correctCount = q.options.filter(opt => opt.correct === true).length;
          if (correctCount !== 1) {
            // If no correct answer, mark the first as correct
            if (correctCount === 0 && q.options.length > 0) {
              q.options[0].correct = true;
              q.correctAnswer = 0;
            }
            // If multiple correct answers, keep only the first
            else if (correctCount > 1) {
              let foundCorrect = false;
              q.options.forEach((opt, index) => {
                if (opt.correct && foundCorrect) {
                  opt.correct = false;
                } else if (opt.correct && !foundCorrect) {
                  foundCorrect = true;
                  q.correctAnswer = index;
                }
              });
            }
          }
          
          // Ensure all options have required fields
          q.options.forEach(opt => {
            if (!opt.hasOwnProperty('text')) opt.text = 'Option text';
            if (!opt.hasOwnProperty('correct')) opt.correct = false;
          });
        }
        
        return q;
      });
      
      // Validate and clean up the questions
      const validQuestions = repairedQuestions.filter(q => {
        if (!q || !q.question) {
          console.log('Invalid question detected: Missing question object or question field');
          return false;
        }
        
        // Different validation based on question type
        if (q.type === 'mcq') {
          // Check for 4 options
          const hasValidOptions = q.options && Array.isArray(q.options) && q.options.length >= 4;
          
          // Check for exactly one correct answer
          const correctAnswers = hasValidOptions ? q.options.filter(opt => opt.correct === true) : [];
          const hasOneCorrectAnswer = correctAnswers.length === 1;
          
          // Check for proper answer field structure
          const hasValidAnswerFields = hasValidOptions ? q.options.every(opt => 
            (opt.hasOwnProperty('text') || typeof opt === 'string') && opt.hasOwnProperty('correct')
          ) : false;
          
          const isValid = hasValidOptions && hasOneCorrectAnswer && hasValidAnswerFields;
          
          if (!isValid) {
            console.log('Invalid MCQ detected:', {
              hasOptions: !!q.options,
              isArray: Array.isArray(q.options),
              optionsLength: q.options ? q.options.length : 0,
              correctAnswersCount: correctAnswers.length,
              hasValidAnswerFields,
              sampleOptions: q.options ? q.options.slice(0, 2) : 'none'
            });
          }
          return isValid;
        } else if (q.type === 'saq') {
          const isValid = q.sampleAnswer && q.stimulus;
          if (!isValid) {
            console.log('Invalid SAQ detected:', {
              hasSampleAnswer: !!q.sampleAnswer,
              hasStimulus: !!q.stimulus,
              questionKeys: Object.keys(q)
            });
          }
          return isValid;
        } else if (q.type === 'dbq') {
          const isValid = q.documents && Array.isArray(q.documents) && q.documents.length === 7 && q.sampleAnswer;
          if (!isValid) {
            console.log('Invalid DBQ detected:', {
              hasDocuments: !!q.documents,
              isArray: Array.isArray(q.documents),
              documentsLength: q.documents ? q.documents.length : 0,
              hasSampleAnswer: !!q.sampleAnswer
            });
          }
          return isValid;
        } else if (q.type === 'leq') {
          const isValid = q.sampleAnswer;
          if (!isValid) {
            console.log('Invalid LEQ detected:', {
              hasSampleAnswer: !!q.sampleAnswer,
              questionKeys: Object.keys(q)
            });
          }
          return isValid;
        } else if (q.type === 'synthesis') {
          const isValid = q.sources && Array.isArray(q.sources) && q.sources.length >= 3 && q.sampleAnswer;
          if (!isValid) {
            console.log('Invalid Synthesis detected:', {
              hasSources: !!q.sources,
              isArray: Array.isArray(q.sources),
              sourcesLength: q.sources ? q.sources.length : 0,
              hasSampleAnswer: !!q.sampleAnswer
            });
          }
          return isValid;
        } else if (q.type === 'rhetorical-analysis') {
          const isValid = q.passage && q.context && q.sampleAnswer;
          if (!isValid) {
            console.log('Invalid Rhetorical Analysis detected:', {
              hasPassage: !!q.passage,
              hasContext: !!q.context,
              hasSampleAnswer: !!q.sampleAnswer,
              questionKeys: Object.keys(q)
            });
          }
          return isValid;
        } else if (q.type === 'argumentative') {
          const isValid = q.sampleAnswer;
          if (!isValid) {
            console.log('Invalid Argumentative detected:', {
              hasSampleAnswer: !!q.sampleAnswer,
              questionKeys: Object.keys(q)
            });
          }
          return isValid;
        } else if (q.type === 'long-frq' || q.type === 'short-frq' || q.type === 'frq' || q.type === 'calculator-frq' || q.type === 'no-calculator-frq') {
          // FRQ questions should have question text and for Calculus, should have proper parts structure
          let isValid = q.question && q.question.trim().length > 10;
          
          // Additional validation for AP Calculus FRQs
          if (isValid && (subject === 'AP Calculus AB' || subject === 'AP Calculus BC')) {
            const questionText = q.question.toLowerCase();
            // Check if it has proper parts structure (a), (b), (c), etc.
            const hasPartStructure = /\(a\)|part\s*a|a\)/i.test(questionText) && 
                                    /\(b\)|part\s*b|b\)/i.test(questionText);
            
            // Check if it has proper point distribution in rubric
            const hasValidRubric = q.rubric && 
                                  q.rubric.totalPoints && 
                                  (q.rubric.totalPoints === 9 || q.rubric.totalPoints === 10);
            
            if (!hasPartStructure) {
              console.log('⚠️ AP Calculus FRQ missing proper parts structure:', {
                questionPreview: q.question.substring(0, 100),
                hasPartA: /\(a\)|part\s*a|a\)/i.test(questionText),
                hasPartB: /\(b\)|part\s*b|b\)/i.test(questionText)
              });
              // Don't mark as invalid, but log warning
            }
            
            if (!hasValidRubric) {
              console.log('⚠️ AP Calculus FRQ missing valid rubric:', {
                hasRubric: !!q.rubric,
                totalPoints: q.rubric?.totalPoints,
                rubricKeys: q.rubric ? Object.keys(q.rubric) : []
              });
              // Don't mark as invalid, but log warning
            }
          }
          
          if (!isValid) {
            console.log('Invalid FRQ question detected:', {
              hasQuestion: !!q.question,
              questionLength: q.question ? q.question.length : 0,
              questionType: q.type,
              questionKeys: Object.keys(q)
            });
          }
          return isValid;
        } else {
          // Generic validation for other question types
          const isValid = q.options || q.sampleAnswer || (q.question && q.question.trim().length > 10);
          if (!isValid) {
            console.log('Invalid generic question detected:', {
              hasOptions: !!q.options,
              hasSampleAnswer: !!q.sampleAnswer,
              hasQuestion: !!q.question,
              questionType: q.type,
              questionKeys: Object.keys(q)
            });
          }
          return isValid;
        }
      }).map((q, index) => {
        // Convert letter answers (A/B/C/D) to numeric indices
        const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
        let correctAnswer;
        if (typeof q.correctAnswer === 'number') {
          correctAnswer = q.correctAnswer;
        } else if (typeof q.correct_answer === 'number') {
          correctAnswer = q.correct_answer;
        } else if (typeof q.correctAnswer === 'string' && letterToIndex[q.correctAnswer.toUpperCase()] !== undefined) {
          correctAnswer = letterToIndex[q.correctAnswer.toUpperCase()];
        } else if (typeof q.correct_answer === 'string' && letterToIndex[String(q.correct_answer).toUpperCase()] !== undefined) {
          correctAnswer = letterToIndex[String(q.correct_answer).toUpperCase()];
        } else {
          // Last resort: check which option is marked correct
          const correctIdx = (q.options || []).findIndex(opt => opt && opt.correct === true);
          correctAnswer = correctIdx >= 0 ? correctIdx : 0;
        }
        return {
          ...q,
          id: startId + index,
          correctAnswer,
        };
      });
      
      console.log(`Batch validation: ${validQuestions.length} valid questions from ${questionArray.length} generated`);
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated from AI response');
      }
      
      // For batch generation, limit to the exact number requested to prevent overshooting
      const limitedQuestions = validQuestions.slice(0, numQuestions);
      
      // Be more lenient with fewer questions - accept any positive number
      if (limitedQuestions.length < Math.max(1, numQuestions * 0.3)) {
        console.warn(`⚠️ Got ${limitedQuestions.length} questions but expected ${numQuestions}. This might be due to incomplete AI response.`);
        throw new Error(`Incomplete batch: Got only ${limitedQuestions.length} valid questions out of ${numQuestions} expected. Please retry.`);
      }
      
      // If we got more than expected, we'll use only what we need
      if (limitedQuestions.length > numQuestions) {
        console.warn(`⚠️ Got ${validQuestions.length} questions but only needed ${numQuestions}, using first ${numQuestions}.`);
      } else if (limitedQuestions.length < numQuestions) {
        console.warn(`⚠️ Got ${limitedQuestions.length} questions instead of ${numQuestions}, but this is acceptable.`);
      }
      
      // Remove duplicate questions by comparing with existing questions of the same type from same section
      const existingSameTypeQuestions = questions.filter(q => 
        q.type === section && q.section === section
      );
      const uniqueQuestions = removeDuplicateQuestions(limitedQuestions, existingSameTypeQuestions);
      
      console.log(`Batch validation: ${limitedQuestions.length} valid questions, ${uniqueQuestions.length} unique questions`);
      
      // If all questions were filtered as duplicates, return the valid questions anyway to avoid infinite loops
      if (uniqueQuestions.length === 0 && limitedQuestions.length > 0) {
        console.warn('⚠️ All questions were filtered as duplicates. Returning valid questions to prevent infinite generation loop.');
        return limitedQuestions;
      }
      
      return uniqueQuestions;
    } catch (error) {
      console.error('Error generating questions with AI:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const askTutorAboutQuestion = async (questionId, userQuestion) => {
    setTutorProcessing(questionId);
    
    try {
      const question = questions.find(q => q.id === questionId);
      const response = await getTutorResponse(selectedSubject, question, userQuestion);
      setTutorResponse(response);
    } catch (error) {
      console.error('Error getting tutor response:', error);
      setTutorResponse('Sorry, I encountered an error. Please try asking your question again.');
    } finally {
      setTutorProcessing(null);
    }
  };

  const getTutorResponse = async (subject, question, userQuestion) => {
    // Build options text with letter labels for clarity
    const optionsText = Array.isArray(question.options)
      ? question.options.map((o, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const text = typeof o === 'string' ? o : (o?.text || String(o));
          return `${letter}) ${text}`;
        }).join('\n')
      : '';
    
    // Get correct answer letter and text
    const correctAnswerIndex = question.correctAnswer;
    const correctAnswerLetter = correctAnswerIndex !== undefined ? String.fromCharCode(65 + correctAnswerIndex) : '';
    const correctAnswerText = (Array.isArray(question.options) && correctAnswerIndex !== undefined)
      ? (typeof question.options[correctAnswerIndex] === 'string'
          ? question.options[correctAnswerIndex]
          : (question.options[correctAnswerIndex]?.text || String(question.options[correctAnswerIndex])))
      : '';
    
    // Include the existing explanation if available
    const existingExplanation = question.explanation || '';

    const prompt = `You are an expert ${subject} tutor helping a student understand a practice test question they got wrong.

QUESTION: ${question.question}

${optionsText ? `ANSWER OPTIONS:\n${optionsText}` : ''}

CORRECT ANSWER: ${correctAnswerLetter}) ${correctAnswerText}
${existingExplanation ? `\nEXPLANATION: ${existingExplanation}` : ''}

STUDENT'S QUESTION: ${userQuestion}

CRITICAL INSTRUCTIONS:
1. The CORRECT answer is ${correctAnswerLetter}) ${correctAnswerText} - this is DEFINITELY the right answer
2. You MUST clearly state that ${correctAnswerLetter} is the correct answer
3. Explain WHY ${correctAnswerLetter} is correct using ${subject} principles
4. If the student seems confused about why another option is wrong, explain why that option is incorrect
5. Do NOT suggest any other answer is correct - only ${correctAnswerLetter} is correct
6. Be encouraging and help the student learn from this mistake

Provide a clear, educational response that helps the student understand why ${correctAnswerLetter}) ${correctAnswerText} is the correct answer. Keep your response under 300 words.`;

    try {
      const text = await geminiService.generateContent(prompt, { timeoutMs: 45000, temperature: 0.3, maxTokens: 600 });
      return text || 'Sorry, I could not generate a response at this time.';
    } catch (error) {
      throw new Error('Failed to get tutor response');
    }
  };

  const resetTest = () => {
    setCurrentView('setup');
    setSelectedSubject('');
    setSelectedSection('');
    setSelectedSubSection('');
    setSelectedUnits([]);
  // Difficulty setting removed
    setCustomTime('');
    setUseDefaultTime(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeRemaining(0);
    setTestStarted(false);
    setTestPaused(false);
    setTestResults(null);
    setAskingTutor(null);
    setTutorProcessing(null);
    setTutorQuestion('');
    setTutorResponse('');
    setGenerationProgress({ generated: 0, total: 0 });
  };

  // Scoring View (shown while AI grades the test)
  if (currentView === 'scoring') {
    return (
      <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-content-muted border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain strokeWidth={1.5} className="w-12 h-12 text-content-primary" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-content-primary mb-4">Grading Your Test</h2>
          <p className="text-lg text-content-secondary mb-2">
            Our AI is analyzing your responses and providing detailed feedback
          </p>
          <p className="text-sm text-content-muted">
            This may take a few moments for written responses...
          </p>
          
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-center gap-2 text-content-muted">
              <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-success-400" />
              <span>Analyzing multiple choice answers</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-content-muted">
              <div className="w-4 h-4 border-2 border-content-muted border-t-transparent rounded-full animate-spin"></div>
              <span>Scoring written responses with AI</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-content-muted">
              <Clock strokeWidth={1.5} className="w-4 h-4" />
              <span>Generating personalized feedback</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  // Test History View
  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-base-950 text-content-primary">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8"
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('setup')}
                className="text-content-secondary hover:text-content-primary"
              >
                <ArrowLeft strokeWidth={1.5} className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Setup</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-content-primary">Test History</h1>
                <p className="text-sm text-content-muted hidden sm:block">Review your past practice tests</p>
              </div>
            </div>
          </motion.div>

          {/* Test History Grid */}
          <div className="grid gap-4">
            {testHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock strokeWidth={1.5} className="w-16 h-16 text-content-disabled mx-auto mb-4" />
                <h3 className="text-xl font-bold text-content-secondary mb-2">No Tests Yet</h3>
                <p className="text-content-muted mb-6">Take your first practice test to see your history here.</p>
                <Button onClick={() => setCurrentView('setup')}>
                  Start Practice Test
                </Button>
              </Card>
            ) : (
              testHistory.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => {
                    console.log('🚨 HISTORY: Loading test results:', test.results);
                    const sanitizedResults = sanitizeResultsData(test.results);
                    console.log('🚨 HISTORY: Sanitized test results:', sanitizedResults);
                    const emergencyCleanedResults = emergencyCleanResults(sanitizedResults);
                    console.log('🚨 HISTORY: Emergency cleaned test results:', emergencyCleanedResults);
                    setTestResults(emergencyCleanedResults);
                    setQuestions(test.questions || []);
                    setUserAnswers(test.userAnswers || {});
                    setSelectedSubject(test.subject);
                    setSelectedSection(test.section);
                             // Difficulty persisted in history is ignored
                    setCurrentView('results');
                  }}
                >
                  <Card className="p-6 hover:bg-base-850/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-content-primary">{test.subject}</h3>
                          <Badge variant="secondary">
                            {test.section === 'mcq' ? 'Multiple Choice' : 
                             test.section === 'frq' ? 'Free Response' : 
                             test.section === 'saq' ? 'Short Answer' :
                             test.section === 'dbq' ? 'Document-Based Question' :
                             test.section === 'leq' ? 'Long Essay Question' :
                             'Full Test'}
                          </Badge>
                          {test.difficulty && (
                            <Badge variant="outline">
                              {test.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-content-muted">Score: </span>
                            <span className="text-content-primary">{test.results?.percentage || 0}%</span>
                          </div>
                          <div>
                            <span className="text-content-muted">AP Score: </span>
                            <span className="text-content-primary font-bold">{test.results?.apScore || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-content-muted">Questions: </span>
                            <span className="text-content-primary">{test.questions?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-content-muted">Date: </span>
                            <span className="text-content-primary">
                              {test.createdAt instanceof Date ? test.createdAt.toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center ml-6">
                        <div className="text-3xl font-bold text-content-primary mb-1">
                          {test.results?.apScore || 'N/A'}
                        </div>
                        <p className="text-xs text-content-muted">AP Score</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'setup') {
    // Get canonical subject name for configuration lookup
    const canonicalSubject = getCanonicalSubjectName(selectedSubject);
    const currentConfig = TEST_CONFIGURATIONS[canonicalSubject] || DEFAULT_CONFIG;
    
    return (
      <div className="min-h-screen bg-base-950 text-content-primary">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
              <div className="p-2 sm:p-3 md:p-4 bg-base-750 rounded-sm md:rounded-md shadow-raised">
                <Brain strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-content-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-content-primary">
                AI Practice Tests
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-content-secondary max-w-3xl mx-auto px-2">
              Generate personalized AP practice tests with AI-powered questions, real-time feedback, 
              and comprehensive score analysis. Prepare like never before!
            </p>
            <div className="mt-3 flex justify-center">
              <ModelSelector
                value={selectedModel}
                onChange={(m) => { setSelectedModel(m); saveSelectedModel(m); }}
              />
            </div>
          </motion.div>

          {/* Test Configuration */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6">
            {/* Left Column - Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-content-primary mb-6 flex items-center gap-3">
                  <Settings strokeWidth={1.5} className="w-6 h-6 text-content-primary" />
                  Test Configuration
                </h2>

                <div className="space-y-6">
                  {/* Subject Selection */}
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-3">
                      AP Subject *
                    </label>
                    <CustomDropdown
                      options={subjectOptions}
                      value={selectedSubject}
                      onChange={(value) => {
                        setSelectedSubject(value);
                        setSelectedSection('');
                        setSelectedSubSection('');
                        setSelectedUnits([]);
                      }}
                      placeholder="Select a subject..."
                    />
                  </div>

                  {/* Section Selection */}
                  {selectedSubject && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-medium text-content-secondary mb-3">
                        Test Section *
                      </label>
                      <div className="grid gap-3">
                        {(currentConfig).sections.map((section) => (
                          <div
                            key={section.id}
                            onClick={() => {
                              setSelectedSection(section.id);
                              setSelectedSubSection(''); // Reset subsection when section changes
                            }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedSection === section.id
                                ? 'border-content-muted bg-base-800'
                                : 'border-border-strong hover:border-border-strong bg-base-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-content-primary mb-3">{section.name}</h3>
                                <p className="text-sm text-content-muted">{section.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-content-secondary">{section.time} min</div>
                                <div className="text-xs text-content-muted">{section.questions} questions</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* FRQ Subsection Selection */}
                  {selectedSubject && selectedSection === 'frq' && (
                    (() => {
                      const config = currentConfig;
                      const frqSection = config.sections.find(s => s.id === 'frq');
                      const hasSubSections = frqSection?.subSections && frqSection.subSections.length > 0;
                      
                      // Only show subsection selection if there are multiple options
                      if (!hasSubSections) return null;
                      
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <label className="block text-sm font-medium text-content-secondary mb-3">
                            FRQ Type *
                          </label>
                          <div className="grid gap-3">
                            {frqSection.subSections.map((subSection) => (
                              <div
                                key={subSection.id}
                                onClick={() => setSelectedSubSection(subSection.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  selectedSubSection === subSection.id
                                    ? 'border-content-muted bg-base-800'
                                    : 'border-border-strong hover:border-border-strong bg-base-800'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-medium text-content-primary mb-3">{subSection.name}</h3>
                                    <p className="text-sm text-content-muted">{subSection.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-content-secondary">{subSection.time} min</div>
                                    <div className="text-xs text-content-muted">{subSection.questions} questions</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })()
                  )}

                  {/* Unit Selection */}
                  {selectedSubject && 
                   (currentConfig?.units || []).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium text-content-secondary mb-3">
                        Select Units (Optional - leave empty for all units)
                      </label>
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            const allUnits = currentConfig.units.map(unit => unit.name);
                            setSelectedUnits(selectedUnits.length === allUnits.length ? [] : allUnits);
                          }}
                          className="px-3 py-2 text-sm bg-base-750 hover:bg-base-750 rounded-lg text-content-primary transition-colors"
                        >
                          {selectedUnits.length === (currentConfig?.units || []).length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {(currentConfig?.units || []).map((unit) => (
                          <div
                            key={unit.name}
                            onClick={() => {
                              setSelectedUnits(prev => 
                                prev.includes(unit.name)
                                  ? prev.filter(u => u !== unit.name)
                                  : [...prev, unit.name]
                              );
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedUnits.includes(unit.name)
                                ? 'border-content-muted bg-base-800'
                                : 'border-border-strong hover:border-border-strong bg-base-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedUnits.includes(unit.name)
                                  ? 'border-content-primary bg-content-primary'
                                  : 'border-border-strong'
                              }`}>
                                {selectedUnits.includes(unit.name) && (
                                  <svg className="w-3 h-3 text-content-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-content-primary text-sm">{unit.name}</span>
                                {unit.topics && (
                                  <div className="text-xs text-content-muted mt-1">
                                    {unit.topics.slice(0, 3).join(', ')}{unit.topics.length > 3 ? '...' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Difficulty selection removed */}

                  {/* Time Configuration */}
                  {selectedSection && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-content-secondary mb-3">
                        Time Limit
                      </label>
                      <div className="space-y-3">
                        <div
                          onClick={() => setUseDefaultTime(true)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            useDefaultTime
                              ? 'border-success-500 bg-success-900'
                              : 'border-border-strong hover:border-border-strong bg-base-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-content-primary">Official AP Time</span>
                            <span className="text-success-400 font-medium">
                              {(() => {
                                const config = currentConfig;
                                const section = config.sections.find(s => s.id === selectedSection);
                                if (selectedSection === 'frq' && selectedSubSection && section?.subSections) {
                                  const subSection = section.subSections.find(sub => sub.id === selectedSubSection);
                                  return `${subSection?.time || 90} minutes`;
                                }
                                return `${section?.time || 90} minutes`;
                              })()}
                            </span>
                          </div>
                        </div>
                        <div
                          onClick={() => setUseDefaultTime(false)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            !useDefaultTime
                              ? 'border-content-muted bg-base-800'
                              : 'border-border-strong hover:border-border-strong bg-base-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-content-primary">Custom Time</span>
                            <Input
                              type="number"
                              placeholder="Minutes"
                              value={customTime}
                              onChange={(e) => setCustomTime(e.target.value)}
                              className="w-24 text-right"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Question Count Configuration */}
                  {selectedSection && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block text-sm font-medium text-content-secondary mb-3">
                        Number of Questions
                      </label>
                      <div className="space-y-3">
                        <div
                          onClick={() => setUseDefaultQuestionCount(true)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            useDefaultQuestionCount
                              ? 'border-success-500 bg-success-900'
                              : 'border-border-strong hover:border-border-strong bg-base-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-content-primary">Official AP Count</span>
                            <span className="text-success-400 font-medium">
                              {(() => {
                                const config = currentConfig;
                                const section = config.sections.find(s => s.id === selectedSection);
                                if (selectedSection === 'frq' && selectedSubSection && section?.subSections) {
                                  const subSection = section.subSections.find(sub => sub.id === selectedSubSection);
                                  return `${subSection?.questions || section?.questions || 0} questions`;
                                }
                                return `${section?.questions || 0} questions`;
                              })()}
                            </span>
                          </div>
                        </div>
                        <div
                          onClick={() => setUseDefaultQuestionCount(false)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            !useDefaultQuestionCount
                              ? 'border-content-muted bg-base-800'
                              : 'border-border-strong hover:border-border-strong bg-base-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-content-primary">Custom Count</span>
                            <Input
                              type="number"
                              placeholder="1-100"
                              min="1"
                              max="100"
                              value={customQuestionCount}
                              onChange={(e) => setCustomQuestionCount(e.target.value)}
                              className="w-24 text-right"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Start Test Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 pt-6 border-t border-border"
                >
                  <Button
                    onClick={handleStartTest}
                    disabled={(() => {
                      const config = currentConfig;
                      const sectionConfig = config.sections.find(s => s.id === selectedSection);
                      const hasSubSections = selectedSection === 'frq' && sectionConfig?.subSections && sectionConfig.subSections.length > 0;
                      
       return !selectedSubject || !selectedSection || 
                             (hasSubSections && !selectedSubSection) || isGeneratingTest;
                    })()}
                    className="w-full py-4 text-lg"
                  >
                    {isGeneratingTest ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-border border-t-transparent rounded-full animate-spin"></div>
                        Generating... {generationProgress.generated}/{generationProgress.total} questions
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Play strokeWidth={1.5} className="w-6 h-6" />
                        Generate & Start Test
                        {(() => {
                          const config = currentConfig;
                          const sectionConfig = config.sections.find(s => s.id === selectedSection);
                          let questionsCount = sectionConfig?.questions || 0;
                          
                          if (selectedSection === 'frq' && selectedSubSection && sectionConfig?.subSections) {
                            const subSectionConfig = sectionConfig.subSections.find(sub => sub.id === selectedSubSection);
                            questionsCount = subSectionConfig?.questions || questionsCount;
                          }
                          
                          return questionsCount > 0 ? ` (${questionsCount} questions)` : '';
                        })()}
                      </div>
                    )}
                  </Button>
                </motion.div>
              </Card>
            </motion.div>

            {/* Right Column - Recent Tests & Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Features */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
                  <Zap strokeWidth={1.5} className="w-5 h-5 text-warning-400" />
                  AI-Powered Features
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target strokeWidth={1.5} className="w-5 h-5 text-content-secondary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-content-primary mb-3">Adaptive Questions</h4>
                      <p className="text-sm text-content-muted">AI generates questions tailored to your difficulty level</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare strokeWidth={1.5} className="w-5 h-5 text-success-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-content-primary mb-3">Instant Tutor Help</h4>
                      <p className="text-sm text-content-muted">Ask questions about any problem during review</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp strokeWidth={1.5} className="w-5 h-5 text-content-secondary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-content-primary mb-3">Detailed Analytics</h4>
                      <p className="text-sm text-content-muted">Comprehensive score breakdown and improvement insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award strokeWidth={1.5} className="w-5 h-5 text-accent-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-content-primary mb-3">AP Score Prediction</h4>
                      <p className="text-sm text-content-muted">Get your predicted AP score based on performance</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Tests */}
              {testHistory.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-content-primary flex items-center gap-2">
                      <Clock strokeWidth={1.5} className="w-5 h-5 text-success-400" />
                      Recent Tests
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView('history')}
                      className="text-content-secondary hover:text-content-primary"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {testHistory.slice(0, 3).map((test) => (
                      <div key={test.id} className="p-3 bg-base-800 rounded-lg hover:bg-base-800 transition-colors cursor-pointer"
                           onClick={() => {
                             console.log('🚨 RECENT: Loading test results:', test.results);
                             const sanitizedResults = sanitizeResultsData(test.results);
                             console.log('🚨 RECENT: Sanitized test results:', sanitizedResults);
                             const emergencyCleanedResults = emergencyCleanResults(sanitizedResults);
                             console.log('🚨 RECENT: Emergency cleaned test results:', emergencyCleanedResults);
                             setTestResults(emergencyCleanedResults);
                             setQuestions(test.questions || []);
                             setUserAnswers(test.userAnswers || {});
                             setSelectedSubject(test.subject);
                             setSelectedSection(test.section);
                             // Difficulty persisted in history is ignored
                             setCurrentView('results');
                           }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-content-primary mb-2">{test.subject}</h4>
                            <p className="text-sm text-content-muted">
                              {test.section === 'mcq' ? 'Multiple Choice' : 
                               test.section === 'frq' ? 'Free Response' : 'Full Test'}
                            </p>
                            <p className="text-xs text-content-muted">
                              {test.createdAt instanceof Date ? test.createdAt.toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-content-primary">
                              {test.results?.apScore}
                            </div>
                            <p className="text-xs text-content-muted">AP Score</p>
                            <p className="text-xs text-content-muted">
                              {test.results?.percentage || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Test View
  if (currentView === 'test') {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Show error if no questions are available
    if (!questions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <X strokeWidth={1.5} className="w-16 h-16 text-error-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-content-primary mb-4">No Questions Available</h2>
            <p className="text-lg text-content-secondary mb-6">
              There was an issue generating questions for this test.
            </p>
            <Button
              onClick={resetTest}
            >
              <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </div>
      );
    }

    // Show error if current question is not available
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Flag strokeWidth={1.5} className="w-16 h-16 text-warning-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-content-primary mb-4">Question Not Found</h2>
            <p className="text-lg text-content-secondary mb-6">
              Question {currentQuestionIndex + 1} of {questions.length} could not be loaded.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setCurrentQuestionIndex(0)}
                variant="outline"
              >
                Go to First Question
              </Button>
              <Button
                onClick={resetTest}
              >
                <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
                Restart Test
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-base-950 text-content-primary">
        
        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <div className={`bg-base-850 rounded-lg border border-border ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'}`}>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-content-primary">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-content-muted hover:text-content-primary transition-colors"
                >
                  <X strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Auto-sync Settings */}
                <div>
                  <h4 className="text-sm font-medium text-content-primary mb-3">Auto-sync Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          setAutoSyncEnabled(newValue);
                          console.log(`✅ Auto-sync ${newValue ? 'enabled' : 'disabled'} by user`);
                        }}
                        className="w-4 h-4 rounded border-border-strong bg-base-800 text-content-primary focus:ring-content-muted focus:ring-2"
                      />
                      <span className="text-sm text-content-secondary">Enable auto-sync</span>
                    </label>
                    <p className="text-xs text-content-muted ml-7">
                      Automatically save your progress and settings
                    </p>
                  </div>
                </div>

                {/* Drawing Canvas removed: all FRQs are typed responses only */}

                {/* Mobile Settings */}
                <div>
                  <h4 className="text-sm font-medium text-content-primary mb-3">Mobile Experience</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isMobile}
                        onChange={(e) => setIsMobile(e.target.checked)}
                        className="w-4 h-4 rounded border-border-strong bg-base-800 text-content-primary focus:ring-content-muted focus:ring-2"
                      />
                      <span className="text-sm text-content-secondary">Force mobile layout</span>
                    </label>
                    <p className="text-xs text-content-muted ml-7">
                      Override automatic mobile detection
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-content-primary hover:opacity-90 text-base-950 py-2 px-4 rounded-lg transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Header */}
        <div className="bg-base-850 border-b border-border sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <h1 className="text-sm sm:text-lg md:text-xl font-bold text-content-primary truncate">
                  {selectedSubject} - {selectedSection.toUpperCase()}
                </h1>
                <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                  <span className="hidden sm:inline">Question </span>{currentQuestionIndex + 1}/{questions.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="flex items-center gap-1 sm:gap-2 text-content-secondary">
                  <Clock strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className={`font-mono text-sm sm:text-lg ${timeRemaining < 300 ? 'text-error-400' : ''}`}>
                    {formatTimeFromSeconds(timeRemaining)}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => setTestPaused(!testPaused)}
                  className="text-content-secondary"
                >
                  {testPaused ? <Play strokeWidth={1.5} className="w-5 h-5" /> : <Pause strokeWidth={1.5} className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
                      handleSubmitTest();
                    }
                  }}
                >
                  Submit Test
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-base-800 rounded-full h-2">
              <div 
                className="bg-content-primary h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                }}
              ></div>
            </div>
            
            {/* Answered Questions Indicator */}
            <div className="flex items-center justify-between mt-2 text-sm text-content-muted">
              <span>
                {Object.keys(userAnswers).length} answered • {questions.length - Object.keys(userAnswers).length} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 ${isMobile ? 'min-h-screen' : ''}`}>
          {testPaused ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Pause strokeWidth={1.5} className="w-16 h-16 text-warning-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-content-primary mb-2">Test Paused</h2>
              <p className="text-content-muted mb-6">Click the play button to resume your test</p>
              <Button
                onClick={() => setTestPaused(false)}
                className="bg-success-500 hover:bg-success-500"
              >
                <Play strokeWidth={1.5} className="w-5 h-5 mr-2" />
                Resume Test
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-base-750 rounded-lg text-content-primary font-bold text-lg min-w-[3rem] text-center">
                      {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary">
                          {currentQuestion?.topic || 'AP Content'}
                        </Badge>
                        <Badge variant={currentQuestion?.type === 'mcq' ? 'primary' : 'purple'}>
                          {currentQuestion?.type === 'mcq' ? 'Multiple Choice' : 
                           currentQuestion?.type === 'frq' ? 'Free Response' :
                           currentQuestion?.type === 'saq' ? 'Short Answer' :
                           currentQuestion?.type === 'dbq' ? 'Document-Based Question' :
                           currentQuestion?.type === 'leq' ? 'Long Essay Question' :
                           currentQuestion?.type === 'synthesis' ? 'Synthesis Essay' :
                           currentQuestion?.type === 'rhetorical-analysis' ? 'Rhetorical Analysis' :
                           currentQuestion?.type === 'argumentative' ? 'Argumentative Essay' :
                           currentQuestion?.type === 'poetry-analysis' ? 'Poetry Analysis' :
                           currentQuestion?.type === 'prose-analysis' ? 'Prose Analysis' :
                           currentQuestion?.type === 'open-question' ? 'Open Question' :
                           currentQuestion?.type === 'long-frq' ? 'Long FRQ' :
                           currentQuestion?.type === 'short-frq' ? 'Short FRQ' :
                           currentQuestion?.type === 'calculator-frq' ? 'Calculator FRQ' :
                           currentQuestion?.type === 'no-calculator-frq' ? 'No Calculator FRQ' :
                           currentQuestion?.type === 'short-answer' ? 'Short Answer' :
                           currentQuestion?.type === 'essays' ? 'Essay' :
                           'Written Response'}
                        </Badge>
                      </div>
                      <div className="text-lg text-content-primary leading-relaxed">
                        <LaTeXRenderer content={currentQuestion?.question || ''} />
                      </div>
                      
                      {/* Display sources for Synthesis questions */}
                      {currentQuestion?.sources && currentQuestion.sources.length > 0 && (
                        <div className="mt-6 p-6 bg-base-800 rounded-lg">
                          <h4 className="font-medium text-content-secondary mb-4 text-xl">Sources:</h4>
                          <div className="space-y-6">
                            {currentQuestion.sources.map((source, index) => (
                              <div key={index} className="border-l-4 border-success-500 pl-4">
                                <div className="mb-2">
                                  <span className="font-bold text-success-400">Source {String.fromCharCode(65 + index)}</span>
                                  {source.title && (
                                    <div className="text-sm text-content-secondary mt-1 font-medium">
                                      {source.title}
                                    </div>
                                  )}
                                  {source.source && (
                                    <div className="text-sm text-content-muted mt-1">
                                      Source: {source.source}
                                    </div>
                                  )}
                                  {source.type && (
                                    <div className="text-sm text-content-muted">
                                      Type: {source.type}
                                    </div>
                                  )}
                                </div>
                                <div className="text-content-secondary leading-relaxed bg-base-850/50 p-4 rounded">
                                  {source.content || source.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display passage for rhetorical analysis, poetry, or prose questions */}
                      {currentQuestion?.passage && (
                        <div className="mt-6 p-6 bg-base-800 rounded-lg">
                          <h4 className="font-medium text-content-secondary mb-4 text-xl">
                            {currentQuestion.type === 'poetry-analysis' ? 'Poem:' :
                             currentQuestion.type === 'prose-analysis' ? 'Passage:' :
                             currentQuestion.type === 'rhetorical-analysis' ? 'Text:' :
                             'Reading:'}
                          </h4>
                          {currentQuestion.passageInfo && (
                            <div className="mb-4 text-sm text-content-muted">
                              {currentQuestion.passageInfo}
                            </div>
                          )}
                          <div className="text-content-secondary leading-relaxed bg-base-850/50 p-4 rounded font-serif">
                            <pre className="whitespace-pre-wrap font-serif">
                              {currentQuestion.passage}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Display work list for open questions */}
                      {currentQuestion?.worksList && currentQuestion.worksList.length > 0 && (
                        <div className="mt-6 p-6 bg-base-800 rounded-lg">
                          <h4 className="font-medium text-content-secondary mb-4 text-xl">Suggested Works:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {currentQuestion.worksList.map((work, index) => (
                              <div key={index} className="text-content-secondary text-sm p-2 bg-base-850/50 rounded">
                                {work}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-content-muted">
                            Or another work of comparable literary merit
                          </div>
                        </div>
                      )}

                      {/* Display documents - Different UI for DBQ vs other question types */}
                      {currentQuestion?.documents && currentQuestion.documents.length > 0 && (
                        <div className="mt-6">
                          {currentQuestion.type === 'dbq' ? (
                            // DBQ: Show document buttons and selected document
                            <div className="space-y-4">
                              <div className="p-4 bg-base-800 rounded-lg">
                                <h4 className="font-medium text-content-secondary mb-4 text-lg">Historical Documents:</h4>
                                <div className="flex flex-wrap gap-3 mb-4">
                                  {currentQuestion.documents.map((doc, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setSelectedDBQDocument(selectedDBQDocument === index ? null : index)}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        selectedDBQDocument === index
                                          ? 'bg-content-primary text-base-950 ring-2 ring-content-primary'
                                          : 'bg-base-800 text-content-secondary hover:bg-base-750 border border-border-strong'
                                      }`}
                                    >
                                      Document {String.fromCharCode(65 + index)}
                                    </button>
                                  ))}
                                </div>
                                
                                {selectedDBQDocument !== null && (
                                  <div className="border-l-4 border-content-muted pl-4 bg-base-850/50 p-4 rounded">
                                    <div className="mb-3">
                                      <span className="font-bold text-content-primary">
                                        Document {String.fromCharCode(65 + selectedDBQDocument)}
                                      </span>
                                      {currentQuestion.documents[selectedDBQDocument].source && (
                                        <div className="text-sm text-content-muted mt-1">
                                          Source: {currentQuestion.documents[selectedDBQDocument].source}
                                        </div>
                                      )}
                                      {currentQuestion.documents[selectedDBQDocument].date && (
                                        <div className="text-sm text-content-muted">
                                          Date: {currentQuestion.documents[selectedDBQDocument].date}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-content-secondary italic leading-relaxed">
                                      "{currentQuestion.documents[selectedDBQDocument].content}"
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            // Non-DBQ: Show documents/stimulus in separate box under question
                            <div className="p-6 bg-base-800 rounded-lg">
                              <h4 className="font-medium text-content-secondary mb-4 text-lg">Supporting Documents:</h4>
                              <div className="space-y-4">
                                {currentQuestion.documents.map((doc, index) => (
                                  <div key={index} className="border-l-4 border-success-500 pl-4 bg-base-850/50 p-4 rounded">
                                    {doc.source && (
                                      <div className="text-sm text-content-muted mb-2">
                                        Source: {doc.source}
                                        {doc.date && `, ${doc.date}`}
                                      </div>
                                    )}
                                    <div className="text-content-secondary leading-relaxed">
                                      {doc.content}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Display SAQ stimulus separately if not in documents array */}
                      {currentQuestion?.stimulus && !currentQuestion?.documents && (() => {
                        const stim = String(currentQuestion.stimulus || '');
                        const sourceMatch = stim.match(/^\s*Source:\s*(.+?)\s*(?:\n|$)/i);
                        const sourceLine = sourceMatch ? sourceMatch[1].trim() : null;
                        const content = sourceMatch ? stim.replace(sourceMatch[0], '').trim() : stim;
                        return (
                          <div className="mt-6 p-6 bg-base-800 rounded-lg">
                            <h4 className="font-medium text-content-secondary mb-4 text-lg">Stimulus:</h4>
                            {sourceLine && (
                              <div className="text-sm text-content-muted mb-2">Source: {sourceLine}</div>
                            )}
                            <div className="border-l-4 border-success-500 pl-4 bg-base-850/50 p-4 rounded">
                              <div className="text-content-secondary leading-relaxed italic">
                                {content}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Display LEQ prompt options */}
                      {currentQuestion?.promptOptions && currentQuestion.promptOptions.length > 0 && (
                        <div className="mt-6 p-6 bg-base-800 rounded-lg">
                          <h4 className="font-medium text-content-secondary mb-4 text-xl">Choose ONE of the following prompts:</h4>
                          <div className="space-y-4">
                            {currentQuestion.promptOptions.map((prompt, index) => (
                              <div key={index} className="p-4 bg-base-850/50 rounded border-l-4 border-content-muted">
                                <div className="mb-2">
                                  <span className="font-bold text-content-primary">Prompt {index + 1}:</span>
                                </div>
                                <div className="text-content-secondary leading-relaxed">
                                  {prompt}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Display question parts if they exist */}
                      {currentQuestion?.parts && currentQuestion.parts.length > 0 && (
                        <div className="mt-4 p-4 bg-base-800 rounded-lg">
                          <h4 className="font-medium text-content-secondary mb-2">Question Parts:</h4>
                          <div className="space-y-2">
                            {currentQuestion.parts.map((part, index) => (
                              <div key={index} className="text-content-muted text-sm flex">
                                <span className="font-medium mr-2">{String.fromCharCode(97 + index)}.)</span>
                                <span>{part}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Interface */}
                <div className="mt-8">
                  {/* MCQ Options */}
                  {currentQuestion?.type === 'mcq' && currentQuestion?.options && (
                    <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
                      <h3 className={`text-lg font-medium text-content-primary mb-4 ${isMobile ? 'text-base mb-3' : ''}`}>Choose the best answer:</h3>
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = userAnswers[currentQuestion.id] === index;
                        
                        return (
                          <motion.button
                            key={index}
                            whileHover={{ scale: isMobile ? 1 : 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                            className={`w-full text-left ${isMobile ? 'p-3' : 'p-4'} rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-content-muted bg-base-800 text-content-primary'
                                : 'border-border-strong bg-base-800 text-content-secondary hover:border-border-strong hover:bg-base-800'
                            }`}
                          >
                            <div className={`flex items-start ${isMobile ? 'gap-2' : 'gap-3'}`}>
                              <span className={`font-bold ${isMobile ? 'text-base' : 'text-lg'} min-w-[1.5rem] ${
                                isSelected ? 'text-content-primary' : 'text-content-muted'
                              }`}>
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span className={`flex-1 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                                <LaTeXRenderer content={
                                  typeof option === 'string' 
                                    ? option.replace(/^[A-D]\)\s*/, '') 
                                    : typeof option === 'object' && option?.text
                                      ? option.text.replace(/^[A-D]\)\s*/, '')
                                      : (option?.text || String(option || ''))
                                } />
                              </span>
                              {isSelected && (
                                <CheckCircle strokeWidth={1.5} className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-content-primary flex-shrink-0 mt-0.5`} />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* FRQ/Written Response Input */}
                  {currentQuestion?.type !== 'mcq' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-content-primary">Your Response:</h3>
                        {currentQuestion?.timeframe && (
                          <Badge variant="secondary">
                            Suggested Time: {currentQuestion.timeframe}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="relative">
                        <textarea
                          value={renderSafeValue(userAnswers[currentQuestion.id])}
                          onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                          placeholder={
                            currentQuestion?.type === 'frq' ? 'Write your detailed response here. Be sure to address all parts of the question...' :
                            currentQuestion?.type === 'saq' ? 'Write a clear, concise response. Use specific examples...' :
                            currentQuestion?.type === 'dbq' ? 'Develop an argument using the documents and your knowledge of history...' :
                            currentQuestion?.type === 'leq' ? 'Develop an argument with a clear thesis statement...' :
                            'Write your response here...'
                          }
                          className={`w-full bg-base-800 border border-border-strong rounded-lg text-content-primary placeholder-content-muted focus:border-content-muted focus:ring-2 focus:ring-content-muted resize-none ${
                            isMobile ? 'h-48 p-3 text-sm' : 'h-64 p-4'
                          }`}
                          style={{ minHeight: isMobile ? '12rem' : '16rem' }}
                        />
                        
                        {/* Character count */}
                        <div className="absolute bottom-3 right-3 text-xs text-content-muted">
                          {renderSafeValue(userAnswers[currentQuestion.id]).length} characters
                        </div>
                      </div>
                      
                      {/* Quick formatting tips */}
                      <div className="text-sm text-content-muted bg-base-850/50 p-3 rounded-lg">
                        <strong className="text-content-secondary">Tips:</strong> 
                        {currentQuestion?.type === 'dbq' && ' Use specific evidence from the documents. Reference at least 6 documents.'}
                        {currentQuestion?.type === 'frq' && ' Structure your response with clear topic sentences and supporting evidence.'}
                        {currentQuestion?.type === 'saq' && ' Be concise but thorough. Include specific historical examples.'}
                        {currentQuestion?.type === 'leq' && ' Include a clear thesis, contextualization, and evidence.'}
                        {!['dbq', 'frq', 'saq', 'leq'].includes(currentQuestion?.type) && ' Be thorough and use specific examples to support your points.'}
                      </div>
                    </div>
                  )}

                  {/* Drawing Canvas removed */}
                </div>

                {/* Navigation */}
                <div className="pt-6 border-t border-border">
                  {/* Top Row: Previous, Settings, Next */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
                      Previous
                    </Button>

                    {/* Settings Button */}
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettings(true)}
                      className="flex items-center gap-2 text-content-muted hover:text-content-primary"
                      title="Settings"
                    >
                      <Settings strokeWidth={1.5} className="w-4 h-4" />
                      Settings
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={currentQuestionIndex === questions.length - 1 ? () => {
                        if (window.confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
                          handleSubmitTest();
                        }
                      } : handleNextQuestion}
                      className="flex items-center gap-2"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
                      {currentQuestionIndex === questions.length - 1 ? 
                        <CheckCircle strokeWidth={1.5} className="w-4 h-4" /> : 
                        <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                      }
                    </Button>
                  </div>

                  {/* Bottom Row: Question Numbers */}
                  <div className="w-full">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-base-750 scrollbar-track-base-850">
                      <div className="flex items-center gap-2 min-w-fit px-2 pb-2 justify-center">
                        {questions.map((_, index) => {
                          const isAnswered = userAnswers[questions[index].id] !== undefined;
                          const isCurrent = index === currentQuestionIndex;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => setCurrentQuestionIndex(index)}
                              className={`w-10 h-10 rounded-full text-sm font-medium transition-all relative flex-shrink-0 ${
                                isCurrent
                                  ? 'bg-content-primary text-base-950 ring-2 ring-content-primary ring-offset-2 ring-offset-base-850'
                                  : isAnswered
                                  ? 'bg-success-500 text-base-950 hover:bg-success-500'
                                  : 'bg-base-800 text-content-secondary hover:bg-base-750 border border-border-strong'
                              }`}
                              title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
                            >
                              {index + 1}
                              {isAnswered && !isCurrent && (
                                <CheckCircle strokeWidth={1.5} className="w-3 h-3 absolute -top-1 -right-1 text-success-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Results View
  if (currentView === 'results' && testResults) {
    return (
      <div className="min-h-screen bg-base-950 text-content-primary">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
              <div className="p-2 sm:p-3 md:p-4 bg-success-500 rounded-sm md:rounded-md shadow-raised">
                <Trophy strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-content-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-success-400">
                Test Results
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-content-secondary">
              {selectedSubject} • {selectedSection === 'mcq' ? 'Multiple Choice' : selectedSection === 'frq' ? 'Free Response' : 'Full Test'}
            </p>
          </motion.div>

          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-3 sm:p-4 md:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">
                  {safeTestResults.apScore}
                </div>
                <p className="text-content-secondary mb-1">Predicted AP Score</p>
                <p className="text-sm text-content-muted">
                  {safeTestResults.apScore >= 4 ? 'Likely to Pass' : 'Needs Improvement'}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-3 sm:p-4 md:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-success-400 mb-1 md:mb-2">
                  {safeTestResults.percentage}%
                </div>
                <p className="text-content-secondary mb-1">Overall Score</p>
                <p className="text-sm text-content-muted">
                  {safeTestResults.score} / {safeTestResults.totalPoints} points
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-3 sm:p-4 md:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">
                  {safeTestResults.timeSpent}
                </div>
                <p className="text-content-secondary mb-1">Minutes Used</p>
                <p className="text-sm text-content-muted">Time Management</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-3 sm:p-4 md:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-warning-400 mb-1 md:mb-2">
                  {questions.filter(q => userAnswers[q.id] !== undefined).length}
                </div>
                <p className="text-content-secondary mb-1">Questions Answered</p>
                <p className="text-sm text-content-muted">
                  of {questions.length} total
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Section Breakdown */}
          {safeTestResults.breakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-3">
                  <TrendingUp strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                  Section Performance
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(safeTestResults.breakdown).map(([section, data]) => (
                    data.total > 0 && (
                      <div key={section} className="p-4 bg-base-800 rounded-lg">
                        <h3 className="font-medium text-content-primary mb-2 capitalize">
                          {section === 'mcq' ? 'Multiple Choice' : 
                           section === 'frq' ? 'Free Response' :
                           section === 'saq' ? 'Short Answer' : 
                           section}
                        </h3>
                        <div className="text-2xl font-bold text-content-primary mb-1">
                          {data.percentage}%
                        </div>
                        <p className="text-sm text-content-muted">
                          {data.correct} / {data.total} points
                        </p>
                        <div className="w-full bg-base-750 rounded-full h-2 mt-2">
                          <div 
                            className="bg-content-primary h-2 rounded-full"
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Question Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-content-primary mb-6 flex items-center gap-3">
                <FileQuestion className="w-6 h-6 text-content-primary" />
                Question Review
              </h2>

              <div className="space-y-6">
                {questions.map((question, index) => {
                  const result = safeTestResults.questionResults.find(r => r.questionId === question.id);
                  const isCorrect = result?.correct;
                  
                  return (
                    <div key={question.id} className="border border-border rounded-lg p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-2 rounded-lg ${isCorrect ? 'bg-success-500' : 'bg-error-500'}`}>
                          {isCorrect ? (
                            <CheckCircle strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                          ) : (
                            <X strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-medium text-content-primary mb-3">Question {index + 1}</h3>
                            <Badge variant={isCorrect ? "success" : "destructive"}>
                              {result?.score || 0} / {result?.maxPoints || 1} points
                            </Badge>
                          </div>
                          <div className="text-content-secondary mb-4">
                            <MarkdownRenderer content={renderSafeValue(question.question)} />
                          </div>

                          {/* MCQ Review */}
                          {question.type === 'mcq' && (
                            <div className="space-y-2 mb-4">
                              {question.options.map((option, i) => {
                                const isUserAnswer = result.userAnswer === i;
                                const isCorrectAnswer = result.correctAnswer === i || question.correctAnswer === i;
                                
                                let borderColor = 'border-border-strong';
                                let bgColor = 'bg-base-800';
                                let textColor = 'text-content-primary';
                                let label = '';

                                if (isCorrectAnswer) {
                                  borderColor = 'border-success-500';
                                  bgColor = 'bg-success-900';
                                  textColor = 'text-success-400';
                                  label = ' ✓ Correct Answer';
                                }
                                if (isUserAnswer && !isCorrectAnswer) {
                                  borderColor = 'border-error-500';
                                  bgColor = 'bg-error-900';
                                  textColor = 'text-error-400';
                                  label = ' ✗ Your Answer';
                                }
                                if (isUserAnswer && isCorrectAnswer) {
                                  label = ' ✓ Your Correct Answer';
                                }

                                return (
                                  <div 
                                    key={i} 
                                    className={`p-3 rounded-lg border-2 ${borderColor} ${bgColor} ${textColor} relative`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                                        <div className="prose prose-sm max-w-none inline"><MarkdownRenderer content={renderSafeValue(option)} /></div>
                                      </div>
                                      {label && (
                                        <span className="text-xs font-medium ml-2 px-2 py-1 rounded bg-black/20">
                                          {label}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* FRQ Review */}
                          {(question.type === 'frq' || question.type === 'saq' || 
                           question.type === 'dbq' || question.type === 'leq' ||
                           question.type === 'synthesis' || question.type === 'rhetorical-analysis' ||
                           question.type === 'argumentative' || question.type === 'poetry-analysis' ||
                           question.type === 'prose-analysis' || question.type === 'open-question' ||
                           question.type === 'long-frq' || question.type === 'short-frq' ||
                           question.type === 'calculator-frq' || question.type === 'no-calculator-frq' ||
                           question.type === 'short-answer' || question.type === 'essays') && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-content-primary mb-2">Your Response:</h4>
                                <div className="p-4 bg-base-800 rounded-lg">
                                  <p className="text-content-secondary whitespace-pre-wrap">
                                    {renderSafeValue(result?.userAnswer) || 'No response provided'}
                                  </p>
                                  {/* Drawing canvas removed */}
                                </div>
                              </div>

                              {/* AI Scoring Breakdown */}
                              {result.breakdown && Object.keys(result.breakdown).length > 0 && (
                                <div>
                                  <h4 className="font-medium text-content-primary mb-2">Score Breakdown:</h4>
                                  <div className="p-4 bg-base-800 border border-border-strong rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      {renderBreakdownSafely(result.breakdown)}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* AI Feedback */}
                              {result.feedback && (
                                <div>
                                  <h4 className="font-medium text-content-primary mb-2">AI Feedback:</h4>
                                  <div className="p-4 bg-success-900 border border-success-500/30 rounded-lg space-y-3">
                                    <LaTeXRenderer content={renderSafeValue(result.feedback)} />
                                    
                                    {/* Strengths and Improvements */}
                                    {(result.strengths?.length > 0 || result.improvements?.length > 0) && (
                                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        {result.strengths?.length > 0 && (
                                          <div>
                                            <h5 className="font-medium text-success-400 mb-2">Strengths:</h5>
                                            <ul className="text-sm text-content-secondary space-y-1">
                                              {result.strengths.map((strength, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                  <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                                                  {renderSafeValue(strength)}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {result.improvements?.length > 0 && (
                                          <div>
                                            <h5 className="font-medium text-warning-400 mb-2">Areas for Improvement:</h5>
                                            <ul className="text-sm text-content-secondary space-y-1">
                                              {result.improvements.map((improvement, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                  <Target strokeWidth={1.5} className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
                                                  {renderSafeValue(improvement)}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {question.sampleAnswer && (
                                <div>
                                  <h4 className="font-medium text-content-primary mb-2">Sample Answer:</h4>
                                  <div className="p-4 bg-base-800 border border-border-strong rounded-lg">
                                    <MarkdownRenderer content={renderSafeValue(question.sampleAnswer)} />
                                  </div>
                                </div>
                              )}

                              {(() => {
                                // Build rubric visualization (even if question.rubric missing, we infer by type)
                                const qRubric = buildRubricItems(question);
                                const merged = attachScoresToRubric(qRubric, result.breakdown, result.score);
                                if (!merged || !merged.items || merged.items.length === 0) return null;
                                return (
                                  <div>
                                    <h4 className="font-medium text-content-primary mb-2">Scoring Rubric:</h4>
                                    <div className="p-4 bg-base-800 border border-border-strong rounded-lg space-y-2">
                                      <div className="text-content-secondary text-sm mb-1">
                                        Total Points: {merged.totalPoints}
                                      </div>
                                      {merged.items.map((it, idx) => (
                                        <div key={idx} className={`flex items-center justify-between px-3 py-2 rounded-md ${it.earned > 0 ? 'bg-success-900 border border-success-500/30' : 'bg-base-800 border border-border-strong'}`}>
                                          <div className="text-content-primary text-sm font-medium">{it.label}</div>
                                          <div className={`text-xs font-semibold ${it.earned > 0 ? 'text-success-400' : 'text-content-muted'}`}>
                                            {Math.round(it.earned)}/{it.maxPoints} pts
                                          </div>
                                        </div>
                                      ))}
                                      {question?.rubric?.scoringGuidelines && (
                                        <div className="text-content-muted text-xs mt-2">{renderSafeValue(question.rubric.scoringGuidelines)}</div>
                                      )}
                                      {Array.isArray(question?.rubric?.keyTerms) && question.rubric.keyTerms.length > 0 && (
                                        <div className="pt-2">
                                          <p className="text-content-secondary text-sm mb-1">Key Terms & Concepts:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {question.rubric.keyTerms.map((term, termIndex) => (
                                              <Badge key={termIndex} variant="secondary">
                                                {renderSafeValue(term)}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Ask Tutor */}
                          <div className="mt-4 pt-4 border-t border-border">
                            {askingTutor === question.id ? (
                              <div className="space-y-3">
                                <Input
                                  placeholder="Ask the AP tutor about this question..."
                                  value={tutorQuestion}
                                  onChange={(e) => setTutorQuestion(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => askTutorAboutQuestion(question.id, tutorQuestion)}
                                    disabled={!tutorQuestion.trim() || tutorProcessing === question.id}
                                    size="sm"
                                  >
                                    {tutorProcessing === question.id ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-border-strong border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Processing...
                                      </>
                                    ) : (
                                      'Ask Tutor'
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      setAskingTutor(null);
                                      setTutorQuestion('');
                                      setTutorResponse('');
                                      setTutorProcessing(null);
                                    }}
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                                
                                {tutorResponse && (
                                  <div className="p-4 bg-base-800 border border-border-strong rounded-lg">
                                    <h5 className="font-medium text-content-primary mb-2 flex items-center gap-2">
                                      <Brain strokeWidth={1.5} className="w-4 h-4" />
                                      AI Tutor Response:
                                    </h5>
                                    <MarkdownRenderer content={renderSafeValue(tutorResponse)} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                onClick={() => { setTutorResponse(''); setTutorQuestion(''); setAskingTutor(question.id); }}
                                size="sm"
                                className="text-content-secondary hover:text-content-primary"
                              >
                                <HelpCircle strokeWidth={1.5} className="w-4 h-4 mr-2" />
                                Ask Tutor About This Question
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <Button
              onClick={resetTest}
            >
              <RotateCw strokeWidth={1.5} className="w-5 h-5 mr-2" />
              Take Another Test
            </Button>
            
            <Button
              onClick={() => {
                // Create and download a summary of results
                const resultsSummary = {
                  subject: selectedSubject,
                  section: selectedSection,
                  score: safeTestResults.percentage,
                  apScore: safeTestResults.apScore,
                  questionsCorrect: safeTestResults.questionResults?.filter(r => r.correct).length || 0,
                  totalQuestions: safeTestResults.questionResults?.length || 0,
                  timeSpent: safeTestResults.timeSpent,
                  date: new Date().toLocaleDateString(),
                  breakdown: safeTestResults.breakdown
                };
                
                const dataStr = JSON.stringify(resultsSummary, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `AP-${selectedSubject.replace(/\s+/g, '-')}-Results-${new Date().toISOString().split('T')[0]}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
            >
              <Download strokeWidth={1.5} className="w-5 h-5 mr-2" />
              Save Results
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default PracticeTests;
