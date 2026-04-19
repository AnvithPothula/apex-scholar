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
  units: [
    {
      name: "Unit 1: Primitive Types",
      weight: "2.5-5%",
      topics: [
        "Variables and data types",
        "Expressions and assignment statements",
        "Compound assignment operators",
        "Casting and ranges of variables"
      ],
      keyConcepts: [
        "int, double, and boolean primitive types",
        "Variable declaration and initialization", 
        "Arithmetic operators and precedence",
        "Type casting and automatic promotion",
        "Integer overflow and floating-point precision"
      ],
      essentialKnowledge: [
        "Primitive types represent single values and have specific ranges",
        "Variables must be declared before use and follow naming conventions",
        "Arithmetic operations follow standard mathematical precedence",
        "Type casting allows conversion between compatible types",
        "Compound operators provide shorthand for common operations"
      ]
    },
    {
      name: "Unit 2: Using Objects",
      weight: "5-7.5%",
      topics: [
        "Objects: instances of classes",
        "Creating and storing objects (instantiation)",
        "Calling a void method",
        "Calling a non-void method",
        "String objects: concatenation, literals, and more",
        "String methods",
        "Wrapper classes: Integer, Double",
        "Using the Math class"
      ],
      keyConcepts: [
        "Class vs. object distinction",
        "Constructor calls and object instantiation",
        "Method calls with and without return values",
        "String immutability and string operations",
        "Wrapper classes and autoboxing/unboxing",
        "Static methods in Math class"
      ],
      essentialKnowledge: [
        "Objects are instances of classes with specific behaviors",
        "Constructors initialize object state",
        "Methods define object behaviors and may return values",
        "Strings are immutable objects with useful methods",
        "Wrapper classes allow primitive types to be treated as objects",
        "The Math class provides useful mathematical functions"
      ]
    },
    {
      name: "Unit 3: Boolean Expressions and if Statements",
      weight: "15-17.5%",
      topics: [
        "Boolean expressions",
        "if statements and control flow",
        "if-else and else-if statements",
        "Compound boolean expressions",
        "Equivalent boolean expressions",
        "Comparing objects"
      ],
      keyConcepts: [
        "Relational operators (==, !=, <, >, <=, >=)",
        "Logical operators (&&, ||, !)",
        "Short-circuit evaluation",
        "De Morgan's Laws",
        "Object comparison with .equals() method",
        "Nested conditional statements"
      ],
      essentialKnowledge: [
        "Boolean expressions evaluate to true or false",
        "Conditional statements control program flow",
        "Logical operators combine boolean expressions",
        "Short-circuit evaluation can prevent errors",
        "Object equality requires .equals() method, not =="
      ]
    },
    {
      name: "Unit 4: Iteration",
      weight: "17.5-22.5%",
      topics: [
        "while loops",
        "for loops",
        "Developing algorithms using strings",
        "Nested iteration",
        "Informal code analysis"
      ],
      keyConcepts: [
        "Loop control with while and for loops",
        "Loop termination conditions",
        "String traversal and manipulation",
        "Nested loops for 2D processing",
        "Algorithm efficiency considerations",
        "Common loop patterns and algorithms"
      ],
      essentialKnowledge: [
        "Iteration allows repetitive execution of code blocks",
        "Loop conditions must eventually become false",
        "String processing often uses character-by-character iteration",
        "Nested loops enable processing of 2D structures",
        "Algorithm efficiency matters for large datasets"
      ]
    },
    {
      name: "Unit 5: Writing Classes",
      weight: "5-7.5%",
      topics: [
        "Anatomy of a class",
        "Constructors",
        "Documentation with comments",
        "Accessor methods",
        "Mutator methods",
        "Writing methods",
        "Static variables and methods",
        "Scope and access",
        "this keyword"
      ],
      keyConcepts: [
        "Class definition with instance variables and methods",
        "Constructor overloading",
        "Encapsulation and data hiding",
        "Getter and setter methods",
        "Static vs. instance members",
        "Method signatures and overloading",
        "Scope rules and variable access"
      ],
      essentialKnowledge: [
        "Classes define the structure and behavior of objects",
        "Constructors initialize object state",
        "Encapsulation protects object data",
        "Methods provide controlled access to object state",
        "Static members belong to the class, not instances"
      ]
    },
    {
      name: "Unit 6: Array",
      weight: "10-15%",
      topics: [
        "Array creation and access",
        "Traversing arrays",
        "Enhanced for loop for arrays",
        "Developing algorithms using arrays"
      ],
      keyConcepts: [
        "Array declaration and initialization",
        "Index-based access and bounds checking",
        "Array traversal with standard and enhanced for loops",
        "Common array algorithms (search, find max/min)",
        "Array as object with length property"
      ],
      essentialKnowledge: [
        "Arrays store multiple values of the same type",
        "Array indices start at 0 and end at length-1",
        "Enhanced for loops simplify array traversal",
        "Array algorithms follow common patterns",
        "ArrayIndexOutOfBoundsException occurs with invalid indices"
      ]
    },
    {
      name: "Unit 7: ArrayList",
      weight: "2.5-7.5%",
      topics: [
        "ArrayList class",
        "ArrayList methods",
        "Traversing ArrayLists",
        "Developing algorithms using ArrayLists",
        "Searching",
        "Sorting"
      ],
      keyConcepts: [
        "Dynamic array functionality",
        "Generic types and type parameters",
        "ArrayList methods (add, remove, get, set, size)",
        "Sequential search algorithms",
        "Selection and insertion sort",
        "ArrayList vs. array comparison"
      ],
      essentialKnowledge: [
        "ArrayLists provide dynamic resizing capabilities",
        "Generic types ensure type safety",
        "ArrayList methods enable flexible data manipulation",
        "Search algorithms can be linear or more efficient",
        "Sorting algorithms arrange data in order"
      ]
    },
    {
      name: "Unit 8: 2D Array",
      weight: "7.5-10%",
      topics: [
        "2D arrays",
        "Traversing 2D arrays",
        "Developing algorithms using 2D arrays"
      ],
      keyConcepts: [
        "2D array declaration and initialization",
        "Row-major order traversal",
        "Nested loops for 2D array processing",
        "Matrix operations and algorithms",
        "Jagged arrays and irregular structures"
      ],
      essentialKnowledge: [
        "2D arrays represent tables or matrices of data",
        "Nested loops are required for complete traversal",
        "Row-major order is the standard traversal pattern",
        "2D arrays can have irregular row lengths",
        "Matrix algorithms use nested iteration patterns"
      ]
    },
    {
      name: "Unit 9: Inheritance",
      weight: "5-10%",
      topics: [
        "Creating superclasses and subclasses",
        "Writing constructors for subclasses",
        "Overriding methods",
        "super keyword",
        "Creating references using inheritance hierarchies",
        "Polymorphism",
        "Object class"
      ],
      keyConcepts: [
        "IS-A relationship and inheritance hierarchy",
        "Method overriding vs. overloading",
        "Super constructor calls",
        "Polymorphism and dynamic binding",
        "Object class as universal superclass",
        "Abstract classes and methods"
      ],
      essentialKnowledge: [
        "Inheritance creates IS-A relationships between classes",
        "Subclasses inherit and can override superclass methods",
        "Polymorphism allows objects to take multiple forms",
        "The Object class is the root of all class hierarchies",
        "Method overriding enables specialized behavior in subclasses"
      ]
    },
    {
      name: "Unit 10: Recursion",
      weight: "5-7.5%",
      topics: [
        "Recursion",
        "Recursive searching and sorting"
      ],
      keyConcepts: [
        "Recursive method structure",
        "Base case and recursive case",
        "Stack overflow and infinite recursion",
        "Binary search algorithm",
        "Merge sort algorithm",
        "Recursion vs. iteration comparison"
      ],
      essentialKnowledge: [
        "Recursive methods call themselves with modified parameters",
        "Base cases prevent infinite recursion",
        "Recursive algorithms can be elegant but may be inefficient",
        "Binary search uses divide-and-conquer approach",
        "Merge sort demonstrates recursive sorting strategy"
      ]
    }
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
