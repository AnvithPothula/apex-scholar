// AP Computer Science A curriculum data
const computerScienceA = {
  name: "AP Computer Science A",
  description: "Learn to design and implement computer programs that solve problems relevant to today's society, including the development of algorithms and data structures.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 40, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 4, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Modularity: Dividing a computer program into separate sub-programs promotes program readability and code reuse",
    "Variables: Variables and control structures are used to represent and organize data",
    "Control: Doing things in order, making decisions, and doing things repeatedly are represented in code by using control structures",
    "Impact of Computing: Computers and computing have revolutionized our lives, and computing innovations continue to fuel our economy"
  ],
  // REVISED framework (CED, fall 2025). TEN units became FOUR, and the ordering
  // changed substantially — objects come first now, and inheritance/recursion
  // are folded into Class Creation and Data Collections rather than standing
  // alone. The old ten-unit list no longer matches the course or the exam.
  // REVISED framework (CED, fall 2025). TEN units became FOUR, and the ordering
  // changed substantially — objects come first now, and inheritance/recursion
  // are folded into Class Creation and Data Collections rather than standing
  // alone. The old ten-unit list no longer matches the course or the exam.
  // REVISED framework (CED, fall 2025). TEN units became FOUR, and the ordering
  // changed substantially — objects come first now, and inheritance/recursion
  // are folded into Class Creation and Data Collections rather than standing
  // alone. The old ten-unit list no longer matches the course or the exam.
  units: [
    { name: "Unit 1: Using Objects and Methods", weight: "15-25%", topics: ["Variables and Data Types", "Introduction to Algorithms, Programming, and Compilers", "Assignment Statements and Input", "Casting and Range of Variables", "Compound Assignment Operators", "Application Program Interface (API) and Libraries", "Documentation with Comments", "3.C", "Calling Class Methods", "Math Class", "Objects: Instances of Classes", "Object Creation and Storage (Instantiation)", "Calling Instance Methods", "String Manipulation"] },
    { name: "Unit 2: Selection and Iteration", weight: "25-35%", topics: ["Algorithms with Selection and Repetition", "Boolean Expressions", "Nested if Statements", "Compound Boolean Expressions", "Comparing Boolean Expressions", "Implementing Selection and Iteration Algorithms", "Implementing String Algorithms", "Nested Iteration", "Informal Run-Time Analysis"] },
    { name: "Unit 3: Class Creation", weight: "10-18%", topics: ["Abstraction and Program Design", "Impact of Program Design", "Anatomy of a Class", "Constructors", "2.C", "Methods: Passing and Returning References of an Object", "Class Variables and Methods", "Scope and Access"] },
    { name: "Unit 4: Data Collections", weight: "30-40%", topics: ["Ethical and Social Issues Around Data Collection", "Introduction to Using Data Sets", "Array Creation and Access", "Array Traversals", "Implementing Array Algorithms", "2.C", "Wrapper Classes", "ArrayList Methods", "ArrayList Traversals", "Implementing ArrayList Algorithms", "2D Array Creation and Access", "2D Array Traversals", "Implementing 2D Array Algorithms", "Searching Algorithms", "Sorting Algorithms", "Recursion", "Recursive Searching and Sorting"] }
  ],
  keySkills: [
    "Program Design and Algorithm Development: Determine required code segments to produce a given output",
    "Code Logic: Determine the output, value, or result of given program code given initial values",
    "Code Implementation: Write program code to create objects of a class and call methods",
    "Code Testing: Identify errors in program code",
    "Documentation: Describe the behavior and explain the purpose of program code"
  ],
  studyTips: [
    "Practice coding every day to build programming fluency",
    "Understand the difference between primitive types and objects clearly",
    "Trace through code on paper to understand execution flow",
    "Master array and string processing algorithms thoroughly",
    "Practice recursion with simple problems before complex ones",
    "Learn to read and interpret code written by others",
    "Understand inheritance and polymorphism with concrete examples",
    "Practice debugging techniques and error identification",
    "Write clear, well-documented code with meaningful variable names",
    "Work through past AP exam questions under timed conditions"
  ],
  commonTopics: [
    "Variable declaration and primitive type operations",
    "Object instantiation and method calls",
    "Boolean logic and conditional statements",
    "Loop structures and iteration patterns",
    "Array creation, traversal, and manipulation",
    "ArrayList operations and dynamic arrays",
    "2D array processing with nested loops",
    "Class design with constructors and methods",
    "Inheritance hierarchies and method overriding",
    "Recursive algorithms and base cases",
    "String processing and manipulation",
    "Algorithm analysis and efficiency considerations"
  ]
};

export default computerScienceA;
