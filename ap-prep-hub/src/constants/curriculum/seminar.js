// AP Seminar curriculum data
const seminar = {
  name: "AP Seminar",
  description: "Students investigate real-world issues from multiple perspectives, gathering and analyzing information from various sources in order to develop credible and valid evidence-based arguments.",
  examFormat: {
    duration: "Year-long Course",
    sections: [
      { name: "Team Project and Presentation", weight: "20%", description: "Team multimedia presentation on a chosen theme" },
      { name: "Individual Research Report", weight: "35%", description: "2,000-word research report on team project topic" },
      { name: "Individual Written Argument", weight: "35%", description: "2,000-word argument essay on exam day" },
      { name: "Individual Presentation", weight: "10%", description: "6-minute oral defense of individual research report" }
    ]
  },
  bigIdeas: [
    "Question and Explore: How do we develop questions and explore complex issues?",
    "Understand and Analyze: How do we understand and analyze arguments and sources of information?",
    "Evaluate Multiple Perspectives: How do we evaluate and select credible sources and perspectives?",
    "Synthesize Ideas: How do we synthesize ideas from multiple sources?",
    "Team, Transform, and Transmit: How do we collaborate and communicate our understanding?"
  ],
  courseStructure: {
    part1: {
      name: "Team Project and Presentation",
      timeline: "First semester",
      description: "Students work in teams of 3-5 to investigate a real-world problem or issue",
      components: [
        "Research a complex, real-world problem",
        "Examine the problem from multiple perspectives",
        "Propose and evaluate potential solutions",
        "Create multimedia presentation (15-20 minutes)",
        "Present findings to audience including Q&A"
      ]
    },
    part2: {
      name: "Individual Research Report",
      timeline: "Second semester",
      description: "Students write individual research reports based on team project topic",
      components: [
        "2,000-word research report",
        "Focus on specific aspect of team topic",
        "Use credible sources and evidence",
        "Present clear argument with support",
        "Include proper citations and references"
      ]
    },
    part3: {
      name: "End-of-Course Exam",
      timeline: "May exam period",
      description: "Individual written argument and oral presentation",
      components: [
        "2,000-word written argument on exam stimulus",
        "6-minute oral defense of research report",
        "Responses to examiner questions"
      ]
    }
  },
  teamProject: {
    requirements: [
      "Address a real-world problem or issue",
      "Examine multiple perspectives on the issue",
      "Use variety of credible sources",
      "Propose potential solutions or responses",
      "Create engaging multimedia presentation",
      "Demonstrate effective teamwork"
    ],
    presentation: [
      "15-20 minutes total presentation time",
      "All team members must participate substantially",
      "Use of multimedia elements encouraged",
      "Clear structure with introduction and conclusion",
      "Professional delivery and appearance",
      "Effective response to audience questions"
    ]
  },
  individualResearchReport: {
    structure: [
      "Introduction with clear thesis",
      "Context and background information",
      "Multiple perspectives on the issue", 
      "Analysis of evidence and sources",
      "Synthesis and argument development",
      "Conclusion with implications",
      "References in proper format"
    ],
    requirements: [
      "2,000 words (±10%)",
      "Minimum 6 credible sources",
      "Focus on specific aspect of team topic",
      "Clear thesis and argument",
      "Multiple perspectives addressed",
      "Proper academic citations"
    ]
  },
  writtenArgument: {
    description: "Timed essay written during end-of-course exam based on provided stimulus materials",
    requirements: [
      "2,000 words (±10%)",
      "Develop argument in response to stimulus",
      "Use provided sources effectively",
      "Address multiple perspectives",
      "Clear thesis and logical organization",
      "Written in approximately 2 hours"
    ],
    skills: [
      "Quickly analyze stimulus materials",
      "Identify key perspectives and arguments",
      "Develop coherent thesis statement",
      "Organize argument logically",
      "Use evidence effectively",
      "Write clearly under time pressure"
    ]
  },
  oralPresentation: {
    description: "6-minute defense of individual research report followed by examiner questions",
    components: [
      "2-minute opening presentation summary",
      "4-minute response to examiner questions",
      "Clear communication of research findings",
      "Defense of methodology and conclusions",
      "Professional presentation skills"
    ],
    preparation: [
      "Review research report thoroughly",
      "Prepare concise summary of key points",
      "Anticipate potential questions",
      "Practice clear, confident delivery",
      "Be ready to defend methodology",
      "Prepare to discuss limitations"
    ]
  },
  keySkills: [
    "Research Skills: Locate, evaluate, and use credible sources",
    "Critical Thinking: Analyze arguments and evaluate evidence",
    "Synthesis: Combine information from multiple sources",
    "Argumentation: Develop and support logical arguments",
    "Communication: Present ideas clearly in writing and speech",
    "Collaboration: Work effectively in teams"
  ],
  studyTips: [
    "Choose team project topics you find genuinely interesting",
    "Start research early and use diverse, credible sources",
    "Practice evaluating source credibility and bias",
    "Learn to synthesize information from multiple perspectives",
    "Develop strong thesis statements for all arguments",
    "Practice timed writing to prepare for written argument",
    "Work on public speaking skills for presentations",
    "Keep detailed notes throughout the research process",
    "Practice defending your arguments and methodology",
    "Learn proper academic citation format early"
  ],
  sourceEvaluation: {
    criteria: [
      "Credibility: Author expertise and publication reputation",
      "Accuracy: Factual correctness and supporting evidence",
      "Objectivity: Bias, perspective, and potential conflicts of interest",
      "Currency: Timeliness and relevance of information",
      "Coverage: Scope and depth of information provided"
    ],
    sourceTypes: [
      "Scholarly articles and academic journals",
      "Government documents and reports",
      "Professional organization publications",
      "News articles from reputable sources",
      "Books by recognized experts",
      "Statistical databases and surveys"
    ]
  },
  commonChallenges: [
    "Narrowing broad topics to manageable scope",
    "Finding credible sources on current issues",
    "Balancing multiple perspectives fairly",
    "Managing team dynamics and coordination",
    "Writing clear, coherent arguments under time pressure",
    "Presenting confidently to unfamiliar audiences",
    "Synthesizing complex information effectively",
    "Meeting word count requirements precisely",
    "Proper citation and avoiding plagiarism",
    "Defending arguments against challenging questions"
  ],
  assessmentCriteria: {
    teamProject: [
      "Understanding: Demonstrates understanding of chosen issue",
      "Perspective: Considers multiple relevant perspectives",
      "Sources: Uses variety of appropriate credible sources",
      "Argument: Develops coherent position on the issue",
      "Communication: Presents effectively to audience"
    ],
    individualReport: [
      "Understanding: Shows deep understanding of the issue",
      "Perspective: Analyzes multiple perspectives thoroughly",
      "Sources: Uses credible sources effectively",
      "Argument: Develops sophisticated, supported argument",
      "Communication: Writes clearly and persuasively"
    ],
    writtenArgument: [
      "Understanding: Understands the issue and stimulus materials",
      "Perspective: Considers relevant perspectives",
      "Argument: Develops clear, logical argument",
      "Sources: Uses provided sources effectively",
      "Communication: Writes clearly and coherently"
    ]
  }
};

export default seminar;
