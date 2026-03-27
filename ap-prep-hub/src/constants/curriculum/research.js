// AP Research curriculum data
const research = {
  name: "AP Research",
  description: "Students design, plan, and conduct a year-long mentored, research-based investigation on a topic of individual interest. Students further their skills in research methodology and complete an academic thesis.",
  examFormat: {
    duration: "Year-long Project",
    sections: [
      { name: "Academic Paper", weight: "70%", description: "4,000-5,000 word academic paper reporting on an independent research investigation" },
      { name: "Presentation and Defense", weight: "30%", description: "15-20 minute presentation and oral defense of the research" }
    ]
  },
  bigIdeas: [
    "Question and Explore: How do scholars develop questions and plan inquiries?",
    "Understand and Analyze: How do scholars understand and analyze arguments and evidence?",
    "Evaluate Multiple Perspectives: How do scholars evaluate perspectives and sources of evidence?",
    "Synthesize Ideas: How do scholars synthesize ideas to communicate new understanding?",
    "Team, Transform, and Transmit: How do scholars work together to transform understanding and transmit new knowledge?"
  ],
  researchProcess: {
    phases: [
      {
        name: "Question Development",
        timeline: "Weeks 1-8",
        activities: [
          "Identify area of interest",
          "Conduct preliminary research",
          "Develop research questions",
          "Refine focus and scope",
          "Create research proposal"
        ]
      },
      {
        name: "Literature Review and Methodology",
        timeline: "Weeks 9-16", 
        activities: [
          "Conduct comprehensive literature review",
          "Select appropriate research methodology",
          "Design data collection methods",
          "Obtain necessary approvals",
          "Begin data collection"
        ]
      },
      {
        name: "Data Collection and Analysis",
        timeline: "Weeks 17-28",
        activities: [
          "Collect primary and/or secondary data",
          "Analyze data using appropriate methods",
          "Identify patterns and themes",
          "Draw preliminary conclusions",
          "Refine analysis based on findings"
        ]
      },
      {
        name: "Writing and Revision",
        timeline: "Weeks 29-34",
        activities: [
          "Draft academic paper sections",
          "Revise based on feedback",
          "Finalize citations and bibliography",
          "Prepare presentation materials",
          "Practice presentation and defense"
        ]
      }
    ]
  },
  academicPaper: {
    structure: [
      "Abstract (150-200 words)",
      "Introduction with research question",
      "Literature review and background",
      "Methodology section",
      "Results/findings section", 
      "Analysis and discussion",
      "Conclusion and implications",
      "References and bibliography"
    ],
    requirements: [
      "4,000-5,000 words (excluding references)",
      "Minimum 15 credible sources",
      "Proper academic citation format",
      "Original research contribution",
      "Clear methodology explanation",
      "Objective analysis of findings"
    ]
  },
  presentation: {
    components: [
      "Research question and rationale",
      "Methodology explanation",
      "Key findings presentation",
      "Analysis and implications",
      "Limitations and future research",
      "Response to examiner questions"
    ],
    requirements: [
      "15-20 minute presentation",
      "Visual aids encouraged",
      "Professional delivery",
      "Clear communication of research",
      "Effective defense of methodology",
      "Thoughtful responses to questions"
    ]
  },
  researchMethods: [
    {
      name: "Quantitative Methods",
      examples: ["Surveys", "Experiments", "Statistical analysis", "Data mining", "Content analysis"]
    },
    {
      name: "Qualitative Methods", 
      examples: ["Interviews", "Focus groups", "Ethnography", "Case studies", "Discourse analysis"]
    },
    {
      name: "Mixed Methods",
      examples: ["Sequential explanatory", "Concurrent triangulation", "Embedded design"]
    },
    {
      name: "Secondary Research",
      examples: ["Meta-analysis", "Systematic review", "Historical analysis", "Comparative analysis"]
    }
  ],
  keySkills: [
    "Research Design: Plan and design rigorous research investigations",
    "Source Evaluation: Critically evaluate academic sources and evidence",
    "Data Analysis: Analyze quantitative and/or qualitative data appropriately",
    "Academic Writing: Write clear, scholarly prose with proper citations",
    "Critical Thinking: Synthesize information and draw logical conclusions",
    "Presentation: Communicate research findings effectively to academic audience"
  ],
  studyTips: [
    "Choose a topic you're genuinely passionate about",
    "Start broad then narrow your focus progressively",
    "Meet regularly with your mentor for guidance",
    "Keep detailed records of your research process",
    "Use academic databases for credible sources",
    "Learn proper citation format early and use it consistently",
    "Start writing early and revise frequently",
    "Practice your presentation multiple times",
    "Prepare for potential questions about your methodology",
    "Be honest about limitations in your research"
  ],
  commonChallenges: [
    "Narrowing down a research question to manageable scope",
    "Finding sufficient credible academic sources",
    "Selecting appropriate research methodology",
    "Managing time effectively across the year",
    "Dealing with unexpected research complications",
    "Writing in academic style and voice",
    "Analyzing data objectively without bias",
    "Staying motivated throughout long research process",
    "Preparing for oral defense and questions",
    "Meeting word count and formatting requirements"
  ],
  assessmentCriteria: {
    academicPaper: [
      "Understanding: Demonstrates understanding of scholarship in chosen field",
      "Method: Uses appropriate and systematic research method",
      "Argument: Develops coherent, convincing argument",
      "Sources: Uses variety of appropriate sources effectively",
      "Evidence: Critically analyzes evidence to support conclusions"
    ],
    presentation: [
      "Understanding: Demonstrates deep understanding of research topic",
      "Method: Clearly explains and justifies research methodology", 
      "Argument: Presents coherent argument supported by evidence",
      "Evaluation: Shows ability to evaluate different perspectives",
      "Communication: Communicates effectively to academic audience"
    ]
  },
  ethicalConsiderations: [
    "Obtain informed consent from research participants",
    "Protect confidentiality and anonymity when promised",
    "Avoid harm to participants or communities",
    "Acknowledge limitations and potential bias",
    "Properly attribute all sources and ideas",
    "Follow institutional guidelines for research",
    "Consider cultural sensitivity in research design",
    "Be transparent about methodology and findings"
  ]
};

export default research;
