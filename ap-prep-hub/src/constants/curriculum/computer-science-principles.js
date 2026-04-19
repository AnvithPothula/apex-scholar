// AP Computer Science Principles curriculum data
const computerSciencePrinciples = {
  name: "AP Computer Science Principles",
  description: "Explore the foundational principles of computer science and learn how computing and technology influence the world around us.",
  examFormat: {
    duration: "2 hours",
    sections: [
      { name: "Multiple Choice", questions: 70, time: "120 minutes", weight: "70%" },
      { name: "Create Performance Task", questions: 1, time: "Completed during course", weight: "30%" }
    ]
  },
  bigIdeas: [
    "Creative Development: Computing can help people express their creativity and develop new ways of thinking",
    "Data: Data and information facilitate the creation of knowledge",
    "Algorithms and Programming: Algorithms are used to develop and express solutions to computational problems",
    "Computer Systems and Networks: Computer systems and networks facilitate the transfer of data",
    "Impact of Computing: Computing has global impacts and raises legal and ethical concerns"
  ],
  units: [
    {
      name: "Unit 1: Creative Development",
      weight: "10-13%",
      topics: [
        "Collaboration",
        "Program function and purpose",
        "Program design and development",
        "Identifying and correcting errors"
      ],
      keyConcepts: [
        "Collaborative programming practices",
        "Design thinking and problem decomposition",
        "Iterative development process",
        "Testing and debugging strategies",
        "Documentation and commenting",
        "User interface design principles"
      ],
      essentialKnowledge: [
        "Collaboration improves the outcomes of software development",
        "Programs are developed with a specific purpose in mind",
        "Program development is an iterative process",
        "Errors in programs are called bugs and the process of finding them is debugging",
        "Documentation helps others understand the purpose and functionality of code"
      ]
    },
    {
      name: "Unit 2: Data",
      weight: "17-22%",
      topics: [
        "Binary numbers",
        "Data compression",
        "Extracting information from data",
        "Using programs to process data"
      ],
      keyConcepts: [
        "Binary representation of data",
        "Lossless vs. lossy compression",
        "Data analysis and visualization",
        "Metadata and data collection",
        "Privacy and data security",
        "Digital divide and access issues"
      ],
      essentialKnowledge: [
        "Data can be represented using bits and binary numbers",
        "Data compression reduces file size but may lose information",
        "Large datasets can reveal patterns and trends",
        "Programs can process data to gain insight and knowledge",
        "Privacy concerns arise from data collection and use"
      ]
    },
    {
      name: "Unit 3: Algorithms and Programming",
      weight: "30-35%",
      topics: [
        "Variables and assignments",
        "Data abstraction",
        "Mathematical expressions",
        "Strings",
        "Boolean expressions",
        "Conditionals",
        "Nested conditionals",
        "Iteration",
        "Developing algorithms",
        "Lists",
        "Binary search",
        "Calling procedures",
        "Developing procedures",
        "Libraries",
        "Random values",
        "Simulations"
      ],
      keyConcepts: [
        "Variables store and manipulate data",
        "Abstraction simplifies complex problems",
        "Algorithms solve computational problems",
        "Control structures direct program flow",
        "Procedures promote code reuse",
        "Libraries extend programming capabilities",
        "Simulations model real-world phenomena"
      ],
      essentialKnowledge: [
        "Variables allow programs to store and use data",
        "Mathematical and logical expressions produce values",
        "Control structures change the sequential flow of control",
        "Lists are ordered sequences of elements",
        "Procedures are reusable programming abstractions",
        "Libraries contain procedures that can be used by programs",
        "Simulations are abstractions that mimic real-world phenomena"
      ]
    },
    {
      name: "Unit 4: Computer Systems and Networks",
      weight: "11-15%",
      topics: [
        "The Internet",
        "Fault tolerance",
        "Parallel and distributed computing",
        "Packet switching"
      ],
      keyConcepts: [
        "Internet protocols and structure",
        "Redundancy and fault tolerance",
        "Scalability of systems",
        "Parallel processing advantages",
        "Network security and protocols",
        "World Wide Web vs. Internet"
      ],
      essentialKnowledge: [
        "The Internet is a network of interconnected networks",
        "Fault tolerance makes systems reliable",
        "Parallel and distributed computing leverage multiple processors",
        "Packet switching enables efficient data transmission",
        "Protocols govern how devices communicate over networks"
      ]
    },
    {
      name: "Unit 5: Impact of Computing",
      weight: "21-26%",
      topics: [
        "Beneficial and harmful effects",
        "Digital divide",
        "Computing bias",
        "Crowdsourcing",
        "Legal and ethical concerns",
        "Safe computing"
      ],
      keyConcepts: [
        "Computing innovations have global impacts",
        "Digital divide affects access to technology",
        "Bias exists in computing systems",
        "Intellectual property and copyright",
        "Privacy and security concerns",
        "Ethical responsibility in computing"
      ],
      essentialKnowledge: [
        "Computing innovations can have beneficial and harmful effects",
        "Not everyone has equal access to computing resources",
        "Computing systems can perpetuate bias",
        "Legal frameworks protect intellectual property",
        "Privacy and security are ongoing concerns",
        "Computing professionals have ethical responsibilities"
      ]
    }
  ],
  keySkills: [
    "Computational Solution Design: Design and evaluate computational solutions for a purpose",
    "Algorithms and Program Development: Develop and implement algorithms",
    "Abstraction in Program Development: Develop programs that incorporate learned abstractions",
    "Code Analysis: Evaluate expressions and statements",
    "Computing Innovations: Investigate computing innovations",
    "Responsible Computing Practices: Contribute to an inclusive, safe, collaborative computing culture"
  ],
  performanceTask: {
    name: "Create Performance Task",
    description: "Students create a computational artifact that demonstrates understanding of programming concepts",
    requirements: [
      "Program code implementing an algorithm",
      "Video demonstrating program functionality",
      "Written responses explaining program purpose, development process, and algorithm implementation"
    ],
    timeAllocation: "Minimum 12 hours of class time",
    weight: "30% of AP score"
  },
  studyTips: [
    "Focus on understanding concepts rather than memorizing syntax",
    "Practice with multiple programming languages to see common patterns",
    "Stay current with computing innovations and their impacts",
    "Understand the difference between the Internet and World Wide Web",
    "Practice analyzing algorithms for efficiency and correctness",
    "Learn about computing ethics and responsible practices",
    "Work on collaborative projects to understand team development",
    "Study real-world examples of computing bias and solutions",
    "Practice explaining technical concepts to non-technical audiences",
    "Start the Create Performance Task early and iterate on your design"
  ],
  commonTopics: [
    "Binary number systems and data representation",
    "Algorithm design and implementation",
    "Programming constructs: variables, conditionals, loops",
    "Data structures: lists and basic operations",
    "Internet structure and protocols",
    "Computing impacts on society and individuals",
    "Privacy and security in digital systems",
    "Intellectual property and copyright in computing",
    "Digital divide and equity in technology access",
    "Bias in algorithms and computing systems",
    "Collaborative software development practices",
    "Simulation and modeling with programs"
  ]
};

export default computerSciencePrinciples;
