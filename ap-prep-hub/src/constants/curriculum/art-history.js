// AP Art History curriculum data
const artHistory = {
  name: "AP Art History",
  description: "Explore art across history and cultures, analyzing major forms of artistic expression from various cultures and examining how art reflects and shapes human experience.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 80, time: "60 minutes", weight: "50%" },
      { name: "Free Response", questions: 6, time: "120 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Artists manipulate materials and ideas to create an aesthetic object, act, or event",
    "Art making is shaped by tradition and change",
    "Interpretations of art are variable",
    "Art has been created to serve many different functions",
    "Art making and art history are important expressions of human experience",
    "Global contemporary art-making continues to evolve in a changing cultural landscape"
  ],
  units: [
    {
      name: "Unit 1: Global Prehistory, 30,000–500 B.C.E.",
      weight: "4-6%",
      topics: ["Cultural Influences on Prehistoric Art", "Materials, Processes, and Techniques in Prehistoric Art", "Theories and Interpretations of Prehistoric Art"],
      keyConcepts: [
        "Hunter-gatherer societies and art-making",
        "Ritual and ceremony in prehistoric art",
        "Early architectural techniques",
        "Cave painting traditions",
        "Megalithic structures",
        "Portable art objects",
        "Religious and spiritual symbolism"
      ],
      essentialKnowledge: [
        "Prehistoric art emerges during the Paleolithic period",
        "Art serves spiritual, ritual, and communicative functions",
        "Materials include stone, bone, clay, and pigments",
        "Geographic distribution spans multiple continents",
        "Symbolic representation develops over time"
      ]
    },
    {
      name: "Unit 2: Ancient Mediterranean, 3500 B.C.E.–300 C.E.",
      weight: "22-25%",
      topics: ["Interactions Within and Across Cultures in Ancient Mediterranean Art", "Purpose and Audience in Ancient Mediterranean Art", "Theories and Interpretations of Ancient Mediterranean Art"],
      keyConcepts: [
        "Development of urban civilizations",
        "Religious architecture and sculpture",
        "Political propaganda in art",
        "Idealism vs. realism in representation",
        "Classical orders in architecture",
        "Mythology and narrative in art",
        "Imperial patronage and public art",
        "Technological innovations in construction"
      ],
      essentialKnowledge: [
        "Ancient Mediterranean cultures develop distinct artistic traditions",
        "Art serves religious, political, and commemorative functions",
        "Classical Greek art establishes ideals of beauty and proportion",
        "Roman art adapts and transforms Greek models",
        "Architecture reflects engineering innovations and political power",
        "Sculpture evolves from stylized to naturalistic representation"
      ]
    },
    {
      name: "Unit 3: Early Europe and Colonial Americas, 200–1750 C.E.",
      weight: "23-25%",
      topics: ["Purpose and Audience in Early European and Colonial American Art"],
      keyConcepts: [
        "Early Christian and Byzantine art traditions",
        "Islamic artistic influence in Europe",
        "Medieval manuscript illumination",
        "Romanesque and Gothic architectural innovations",
        "Renaissance humanism and classical revival",
        "Protestant Reformation and Catholic Counter-Reformation",
        "Baroque dramatic expression and movement",
        "Colonial art in the Americas",
        "Cross-cultural artistic exchange"
      ],
      essentialKnowledge: [
        "Christian art develops distinctive iconographic traditions",
        "Islamic art influences European decorative arts",
        "Gothic architecture achieves new heights and light",
        "Renaissance art revives classical ideals with Christian themes",
        "Reformation challenges religious art traditions",
        "Baroque art serves Counter-Reformation goals",
        "Colonial American art blends European and indigenous traditions"
      ]
    },
    {
      name: "Unit 4: Later Europe and Americas, 1750–1980 C.E.",
      weight: "23-25%",
      topics: ["2.C", "Purpose and Audience in Later European and American Art", "Theories and Interpretations of Later European and American Art"],
      keyConcepts: [
        "Neoclassicism and Enlightenment ideals",
        "Romanticism and emotional expression",
        "Realism and social commentary",
        "Impressionism and modern life",
        "Post-Impressionism and symbolic expression",
        "Modernist movements and abstraction",
        "Avant-garde experimentation",
        "International style architecture",
        "Pop art and consumer culture",
        "Minimalism and conceptual art"
      ],
      essentialKnowledge: [
        "Art movements respond to social and political changes",
        "Photography challenges traditional art forms",
        "Modern art breaks from academic traditions",
        "Abstract art explores pure form and color",
        "Architecture embraces new materials and functions",
        "Art addresses contemporary social issues"
      ]
    },
    {
      name: "Unit 5: Indigenous Americas, 1000 B.C.E.–1980 C.E.",
      weight: "8-10%",
      topics: ["Interactions Within and Across Cultures in Indigenous American Art", "Materials, Processes, and Techniques in Indigenous American Art", "Purpose and Audience in Indigenous American Art", "Theories and Interpretations of Indigenous American Art"],
      keyConcepts: [
        "Indigenous architectural traditions",
        "Ritual and ceremonial art",
        "Connection to natural environment",
        "Symbolic representation systems",
        "Material culture and craftsmanship",
        "Cultural continuity and change",
        "Impact of European colonization"
      ],
      essentialKnowledge: [
        "Indigenous American cultures develop distinct artistic traditions",
        "Art serves spiritual and ceremonial functions",
        "Architecture reflects environmental adaptation",
        "Artistic traditions continue despite colonial pressures",
        "Materials include stone, textiles, metals, and organic materials"
      ]
    },
    {
      name: "Unit 6: Africa, 1100–1980 C.E.",
      weight: "8-10%",
      topics: ["Cultural Contexts of African Art", "Purpose and Audience in African Art", "Theories and Interpretations of African Art"],
      keyConcepts: [
        "African architectural traditions",
        "Royal and ceremonial art",
        "Masking traditions and performance",
        "Ancestral veneration",
        "Material culture and symbolism",
        "Cultural identity and power",
        "Trade and cultural exchange"
      ],
      essentialKnowledge: [
        "African art serves multiple social and spiritual functions",
        "Masking traditions connect to spiritual practices",
        "Royal art demonstrates political authority",
        "Materials include wood, metal, textile, and clay",
        "Art traditions vary across diverse African cultures"
      ]
    },
    {
      name: "Unit 7: West and Central Asia, 500 B.C.E.–1980 C.E.",
      weight: "8-10%",
      topics: ["Materials, Processes, and Techniques in West and Central Asian Art", "Purpose and Audience in West and Central Asian Art", "Interactions Within and Across Cultures in West and Central Asian Art"],
      keyConcepts: [
        "Islamic architectural principles",
        "Calligraphy as sacred art",
        "Geometric and vegetal decoration",
        "Luxury arts and craftsmanship",
        "Religious architecture and function",
        "Cultural synthesis and exchange",
        "Persian artistic traditions"
      ],
      essentialKnowledge: [
        "Islamic art emphasizes geometric and calligraphic decoration",
        "Religious architecture serves community functions",
        "Luxury objects demonstrate technical mastery",
        "Artistic traditions span diverse cultures and regions",
        "Art reflects theological and philosophical principles"
      ]
    },
    {
      name: "Unit 8: South, East, and Southeast Asia, 300 B.C.E.–1980 C.E.",
      weight: "8-10%",
      topics: ["Purpose and Audience in South, East, and Southeast Asian Art", "Theories and Interpretations of South, East, and Southeast Asian Art"],
      keyConcepts: [
        "Buddhist and Hindu artistic traditions",
        "Temple architecture and sculpture",
        "Narrative art and religious storytelling",
        "Court art and patronage",
        "Landscape painting traditions",
        "Cultural exchange along trade routes",
        "Colonial period artistic synthesis"
      ],
      essentialKnowledge: [
        "Religious art serves devotional and didactic purposes",
        "Temple complexes integrate architecture and sculpture",
        "Court patronage supports luxury art production",
        "Landscape art reflects philosophical traditions",
        "Artistic exchange occurs through trade and pilgrimage"
      ]
    },
    {
      name: "Unit 9: The Pacific, 700–1980 C.E.",
      weight: "4-6%",
      topics: ["Materials, Processes, and Techniques in Pacific Art", "Interactions Within and Across Cultures in Pacific Art", "Theories and Interpretations of Pacific Art"],
      keyConcepts: [
        "Pacific Islander artistic traditions",
        "Ceremonial and ritual objects",
        "Navigation and seafaring culture",
        "Material culture and natural resources",
        "Cultural identity and status",
        "Colonial impact and cultural preservation",
        "Performance and ceremonial art"
      ],
      essentialKnowledge: [
        "Pacific art reflects island environments and resources",
        "Ceremonial objects connect to spiritual practices",
        "Navigation tools demonstrate cultural knowledge",
        "Artistic traditions vary across Pacific cultures",
        "Colonial contact brings cultural change and adaptation"
      ]
    },
    {
      name: "Unit 10: Global Contemporary, 1980 C.E. to Present",
      weight: "8-15%",
      topics: ["Materials, Processes, and Techniques in Global Contemporary Art", "Purpose and Audience in Global Contemporary Art", "Interactions Within and Across Cultures in Global Contemporary Art", "Theories and Interpretations of Global Contemporary Art"],
      keyConcepts: [
        "Postmodernism and deconstruction",
        "Identity politics and representation",
        "Globalization and cultural hybridity",
        "New media and technology",
        "Environmental and social commentary",
        "Institutional critique",
        "Cultural appropriation and authenticity",
        "Art market and commercialization"
      ],
      essentialKnowledge: [
        "Contemporary art addresses current social issues",
        "Artists work across diverse media and methods",
        "Global art market influences production and reception",
        "Technology transforms artistic possibilities",
        "Art engages with politics, identity, and social justice"
      ]
    }
  ],
  keySkills: [
    "Visual Analysis: Analyze visual elements and design principles",
    "Contextual Analysis: Analyze how context influences artistic decisions",
    "Comparison: Compare works of art from different cultures and time periods",
    "Attribution: Analyze how attribution is established",
    "Interpretation: Interpret works of art using art historical methods",
    "Argumentation: Construct persuasive arguments about works of art"
  ],
  studyTips: [
    "Create visual timelines connecting art to historical events",
    "Use flashcards for identifying key artworks with titles, dates, and cultures",
    "Practice comparative analyses between different time periods and cultures",
    "Visit local museums to see artworks in person when possible",
    "Focus on understanding cultural context behind each artwork",
    "Learn to identify artistic techniques and materials",
    "Practice describing artworks using proper art historical terminology",
    "Study the functions and meanings of art in different societies",
    "Connect artistic movements to broader historical and cultural changes",
    "Practice timed writing to develop speed in exam responses"
  ],
  commonTopics: [
    "Religious and ceremonial art across cultures",
    "Political propaganda and power in art",
    "Artistic techniques and materials",
    "Cultural exchange and artistic influence",
    "Patronage systems and art production",
    "Representation of the human figure",
    "Architecture and urban planning",
    "Art and identity formation",
    "Colonialism and cultural impact",
    "Modern and contemporary art movements"
  ]
};

export default artHistory;
