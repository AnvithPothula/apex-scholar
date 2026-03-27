// AP United States History curriculum data
const usHistory = {
  name: "AP United States History",
  description: "Study the political, diplomatic, intellectual, cultural, economic, and social history of the United States from 1491 to the present.",
  examFormat: {
    duration: "3 hours 15 minutes",
    sections: [
      { name: "Multiple Choice", questions: 55, time: "55 minutes", weight: "40%" },
      { name: "Short Answer", questions: 3, time: "40 minutes", weight: "20%" },
      { name: "Document-Based Question", questions: 1, time: "60 minutes", weight: "25%" },
      { name: "Long Essay", questions: 1, time: "40 minutes", weight: "15%" }
    ]
  },
  bigIdeas: [
    "American and National Identity: How have American ideals of individualism, equality, and democracy been shaped by cultural values and constitutional principles?",
    "Work, Exchange, and Technology: How have changes in technology and economic systems affected American society?",
    "Geography and the Environment: How has geography influenced the development of American society?",
    "Migration and Settlement: How have various groups migrated to and within America, and how have they adapted?",
    "Politics and Power: How have competing ideas about democracy and citizenship shaped American political institutions?",
    "America in the World: How have various world events influenced America's political, economic, and social development?",
    "American and Regional Culture: How have changes in demographics, social structures, and cultural values shaped American identity?"
  ],
  units: [
    {
      name: "Period 1: 1491-1607",
      weight: "4-6%",
      topics: [
        "Native American societies before European contact",
        "European exploration and conquest",
        "Columbian Exchange and its effects",
        "Labor systems in the Americas"
      ],
      keyConcepts: [
        "Diverse Native American societies and cultures",
        "European motivations for exploration",
        "Spanish colonization patterns",
        "Biological and cultural exchanges",
        "Impact of disease on Native populations",
        "Introduction of slavery and indentured servitude"
      ],
      essentialKnowledge: [
        "Native American societies were diverse and complex",
        "European contact transformed both worlds",
        "Disease devastated Native American populations",
        "Economic motives drove European colonization",
        "Labor systems varied by region and economy"
      ]
    },
    {
      name: "Period 2: 1607-1754",
      weight: "6-8%",
      topics: [
        "European colonization",
        "Colonial society and culture",
        "Transatlantic trade",
        "Interactions between Europeans, Africans, and Native Americans"
      ],
      keyConcepts: [
        "Different colonial models: Spanish, French, Dutch, English",
        "Regional differences in colonial development",
        "Atlantic slave trade and plantation economy",
        "Colonial resistance to British policies",
        "Great Awakening and Enlightenment influences",
        "Bacon's Rebellion and other conflicts"
      ],
      essentialKnowledge: [
        "Colonies developed distinct regional characteristics",
        "Slavery became central to southern economy",
        "Religious and intellectual movements shaped culture",
        "Conflicts arose over land and authority",
        "Colonial identity began to emerge"
      ]
    },
    {
      name: "Period 3: 1754-1800",
      weight: "10-17%",
      topics: [
        "Seven Years' War and its aftermath",
        "Causes of the American Revolution",
        "Revolutionary War",
        "Articles of Confederation",
        "Constitutional Convention",
        "Early republic"
      ],
      keyConcepts: [
        "British policies after Seven Years' War",
        "Colonial resistance and revolutionary ideology",
        "Declaration of Independence principles",
        "Revolutionary War strategies and outcomes",
        "Weaknesses of Articles of Confederation",
        "Constitutional compromises",
        "Federalist vs. Democratic-Republican parties",
        "Washington's presidency and precedents"
      ],
      essentialKnowledge: [
        "Economic and political tensions led to revolution",
        "Revolutionary ideals challenged existing hierarchies",
        "New government structures were experimental",
        "Political parties emerged despite founders' intentions",
        "Early presidents established important precedents"
      ]
    },
    {
      name: "Period 4: 1800-1848",
      weight: "10-17%",
      topics: [
        "Jefferson's presidency",
        "War of 1812",
        "Market Revolution",
        "Jacksonian democracy",
        "Second Great Awakening",
        "Reform movements",
        "Westward expansion"
      ],
      keyConcepts: [
        "Louisiana Purchase and Lewis and Clark",
        "Industrial Revolution impacts",
        "Transportation revolution",
        "Democratic participation expansion",
        "Indian Removal Act and Trail of Tears",
        "Abolitionist movement",
        "Women's rights movement",
        "Manifest Destiny ideology"
      ],
      essentialKnowledge: [
        "Economic changes transformed American society",
        "Democracy expanded for white men",
        "Reform movements addressed social problems",
        "Westward expansion displaced Native Americans",
        "Sectional tensions increased over slavery"
      ]
    },
    {
      name: "Period 5: 1844-1877",
      weight: "10-17%",
      topics: [
        "Manifest Destiny and Mexican-American War",
        "Compromise of 1850",
        "Civil War causes",
        "Civil War",
        "Reconstruction"
      ],
      keyConcepts: [
        "Mexican-American War and territorial acquisition",
        "Kansas-Nebraska Act and popular sovereignty",
        "Republican Party formation",
        "Lincoln's election and secession",
        "Civil War strategies and turning points",
        "Emancipation Proclamation",
        "Reconstruction plans and policies",
        "Black Codes and Jim Crow laws",
        "End of Reconstruction"
      ],
      essentialKnowledge: [
        "Territorial expansion intensified slavery debate",
        "Political realignment preceded Civil War",
        "Civil War preserved Union and ended slavery",
        "Reconstruction attempted to remake the South",
        "Reconstruction's end abandoned African Americans"
      ]
    },
    {
      name: "Period 6: 1865-1898",
      weight: "10-17%",
      topics: [
        "Industrial capitalism",
        "Labor and immigration",
        "Politics of the Gilded Age",
        "Populism",
        "Western development"
      ],
      keyConcepts: [
        "Second Industrial Revolution",
        "Corporate consolidation and monopolies",
        "Immigration from southern and eastern Europe",
        "Labor unions and strikes",
        "Political machines and corruption",
        "Populist movement and free silver",
        "Closing of the frontier",
        "Indian Wars and reservation system"
      ],
      essentialKnowledge: [
        "Industrialization transformed economy and society",
        "Immigration provided labor but created tensions",
        "Political system struggled with new challenges",
        "Farmers organized to address economic problems",
        "Western development displaced Native Americans"
      ]
    },
    {
      name: "Period 7: 1890-1945",
      weight: "10-17%",
      topics: [
        "Progressive Era reforms",
        "World War I",
        "1920s culture and economy",
        "Great Depression",
        "New Deal",
        "World War II"
      ],
      keyConcepts: [
        "Progressive reforms in government and society",
        "American imperialism and overseas expansion",
        "World War I and its domestic impact",
        "Red Scare and nativism",
        "Consumer culture and mass media",
        "Stock market crash and economic collapse",
        "New Deal programs and expansion of federal power",
        "World War II mobilization and home front",
        "Holocaust and war crimes"
      ],
      essentialKnowledge: [
        "Progressives addressed problems of industrial society",
        "America emerged as world power",
        "1920s brought cultural tensions and prosperity",
        "Great Depression required government intervention",
        "World War II transformed American society"
      ]
    },
    {
      name: "Period 8: 1945-1980",
      weight: "10-17%",
      topics: [
        "Cold War beginnings",
        "Postwar prosperity",
        "Civil Rights Movement",
        "Great Society",
        "Vietnam War",
        "Counterculture and social movements"
      ],
      keyConcepts: [
        "Containment policy and Marshall Plan",
        "Suburban growth and consumer culture",
        "Brown v. Board and school desegregation",
        "Montgomery Bus Boycott and nonviolent resistance",
        "Kennedy's New Frontier and Johnson's Great Society",
        "Vietnam War escalation and opposition",
        "Women's liberation movement",
        "Environmental movement",
        "Watergate scandal"
      ],
      essentialKnowledge: [
        "Cold War shaped foreign and domestic policy",
        "Economic prosperity created suburban middle class",
        "Civil rights movement challenged racial inequality",
        "Liberal reforms expanded federal government",
        "Social movements demanded equality and justice"
      ]
    },
    {
      name: "Period 9: 1980-Present",
      weight: "4-6%",
      topics: [
        "Conservative resurgence",
        "End of Cold War",
        "Technology and globalization",
        "9/11 and War on Terror",
        "Economic challenges"
      ],
      keyConcepts: [
        "Reagan Revolution and conservative policies",
        "Fall of Berlin Wall and Soviet collapse",
        "Internet and information technology",
        "Immigration and demographic changes",
        "September 11 attacks and homeland security",
        "Iraq and Afghanistan wars",
        "2008 financial crisis",
        "Obama presidency and healthcare reform"
      ],
      essentialKnowledge: [
        "Conservative movement gained political power",
        "Cold War ended with American victory",
        "Technology transformed economy and society",
        "Terrorism posed new security challenges",
        "Economic inequality and political polarization increased"
      ]
    }
  ],
  keySkills: [
    "Chronological Reasoning: Analyze patterns of continuity and change",
    "Comparison and Contextualization: Compare historical developments across time and place",
    "Crafting Historical Arguments: Develop arguments using historical evidence",
    "Historical Interpretation and Synthesis: Interpret diverse historical sources",
    "Analyzing Evidence: Analyze written, quantitative, and visual materials",
    "Argumentation: Construct persuasive historical arguments"
  ],
  studyTips: [
    "Focus on themes and patterns rather than just memorizing facts",
    "Practice analyzing primary sources and documents",
    "Learn to contextualize events within broader historical trends",
    "Master essay writing skills: thesis, evidence, analysis",
    "Study cause-and-effect relationships throughout history",
    "Practice comparing different time periods and regions",
    "Use timelines to understand chronological development",
    "Connect economic, political, and social changes",
    "Read historians' interpretations of major events",
    "Practice document-based question (DBQ) format regularly"
  ],
  commonTopics: [
    "Colonial development and regional differences",
    "Causes and consequences of the American Revolution",
    "Constitutional Convention and early republic",
    "Market Revolution and social changes",
    "Westward expansion and Native American displacement",
    "Causes and effects of the Civil War",
    "Reconstruction policies and outcomes",
    "Industrial Revolution and labor conflicts",
    "Progressive Era reforms and their limitations",
    "World War impacts on American society",
    "New Deal responses to Great Depression",
    "Civil Rights Movement strategies and achievements",
    "Cold War foreign policy and domestic effects",
    "Social movements of the 1960s and 1970s"
  ]
};

export default usHistory;
