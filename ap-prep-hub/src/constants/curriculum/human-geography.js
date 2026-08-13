// AP Human Geography curriculum data
const humanGeography = {
  name: "AP Human Geography",
  description: "Study the systematic patterns and processes that have shaped human understanding, use, and alteration of Earth's surface.",
  examFormat: {
    duration: "2 hours 15 minutes",
    sections: [
      { name: "Multiple Choice", questions: 60, time: "60 minutes", weight: "50%" },
      { name: "Free Response", questions: 3, time: "75 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Patterns and Spatial Organization: How do historical and current events influence political structures around the world?",
    "Impacts and Interactions: How are balances of power being shifted and challenged?",
    "Spatial Processes and Societal Change: How can political, economic, cultural, or technological changes challenge state sovereignty?"
  ],
  units: [
    {
      name: "Unit 1: Thinking Geographically",
      weight: "8-10%",
      topics: ["Introduction to Maps", "Geographic Data", "The Power of Geographic Data", "Human\u2013Environmental Interaction", "Scale Analysis", "Regional Analysis"],
      keyConcepts: [
        "Types of maps and projections",
        "Geographic Information Systems (GIS)",
        "Spatial relationships and patterns",
        "Scale: local, regional, national, global",
        "Environmental determinism vs. possibilism",
        "Absolute vs. relative location"
      ],
      essentialKnowledge: [
        "Maps are powerful tools for displaying geographic information",
        "Different types of data require different mapping techniques",
        "Scale affects the way geographic phenomena appear",
        "Geographic concepts help explain spatial relationships",
        "Human-environment interactions vary across space and time"
      ]
    },
    {
      name: "Unit 2: Population and Migration Patterns and Processes",
      weight: "12-17%",
      topics: ["Population Distribution", "Consequences of Population Distribution", "Population Composition", "The Demographic Transition Model", "Malthusian Theory", "Population Policies", "Women and Demographic Change", "Aging Populations", "Spatial Relationships", "Forced and Voluntary Migration", "Spatial Relationships"],
      keyConcepts: [
        "Population density and distribution patterns",
        "Demographic transition model",
        "Population pyramids and dependency ratios",
        "Push and pull factors in migration",
        "Types of migration: voluntary, forced, internal, international",
        "Brain drain and chain migration",
        "Demographic momentum"
      ],
      essentialKnowledge: [
        "Population is unevenly distributed across Earth's surface",
        "Population growth rates vary by development level",
        "Migration occurs for economic, political, and environmental reasons",
        "Population policies can influence demographic trends",
        "Aging populations create economic and social challenges"
      ]
    },
    {
      name: "Unit 3: Cultural Patterns and Processes",
      weight: "12-17%",
      topics: ["Introduction to Culture", "Cultural Landscapes", "Cultural Patterns", "Concepts and Processes", "Historical Causes of Diffusion", "Contemporary Causes of Diffusion", "Diffusion of Religion and Language", "Spatial Relationships"],
      keyConcepts: [
        "Cultural traits, complexes, and regions",
        "Cultural diffusion: relocation, expansion, hierarchical, contagious",
        "Cultural hearths and innovation centers",
        "Language families and linguistic diversity",
        "Religious patterns and sacred spaces",
        "Ethnic enclaves and cultural assimilation",
        "Globalization and cultural homogenization"
      ],
      essentialKnowledge: [
        "Culture varies across space and is transmitted through diffusion",
        "Cultural landscapes reflect the values and practices of inhabitants",
        "Language and religion are key components of cultural identity",
        "Globalization both spreads and threatens local cultures",
        "Cultural boundaries may or may not align with political boundaries"
      ]
    },
    {
      name: "Unit 4: Political Patterns and Processes",
      weight: "12-17%",
      topics: ["Introduction to Political Geography", "Political Power and Territoriality", "Defining Political Boundaries", "The Function of Political Boundaries", "Internal Boundaries", "Forms of Governance", "Defining Devolutionary Factors", "Challenges to Sovereignty", "Consequences of Centrifugal and Centripetal Forces"],
      keyConcepts: [
        "State, nation, nation-state concepts",
        "Sovereignty and territorial integrity",
        "Centripetal and centrifugal forces",
        "Federal vs. unitary government systems",
        "Gerrymandering and electoral districts",
        "Supranational organizations",
        "Devolution and independence movements"
      ],
      essentialKnowledge: [
        "Political entities range from local to international scales",
        "States exercise sovereignty over defined territories",
        "Internal political boundaries organize space within countries",
        "Globalization challenges traditional concepts of sovereignty",
        "Electoral systems affect political representation"
      ]
    },
    {
      name: "Unit 5: Agriculture and Rural Land-Use Patterns and Processes",
      weight: "12-17%",
      topics: ["Introduction to Agriculture", "Settlement Patterns and Survey Methods", "Agricultural Origins and Diffusions", "The Second Agricultural Revolution", "The Green Revolution", "Agricultural Production Regions", "Spatial Organization of Agriculture", "Von Th\u00fcnen Model", "The Global System of Agriculture", "Consequences of Agricultural Practices", "Challenges of Contemporary Agriculture", "Women in Agriculture"],
      keyConcepts: [
        "First, Second, and Third Agricultural Revolutions",
        "Subsistence vs. commercial agriculture",
        "Von Thünen's model of agricultural land use",
        "Green Revolution technologies and impacts",
        "Fair trade and organic agriculture",
        "Food security and food deserts",
        "Environmental impacts of agriculture"
      ],
      essentialKnowledge: [
        "Agriculture developed independently in multiple hearths",
        "Agricultural revolutions increased productivity and population",
        "Agricultural practices vary by climate, market access, and development",
        "Modern agriculture faces sustainability challenges",
        "Global food systems connect producers and consumers worldwide"
      ]
    },
    {
      name: "Unit 6: Cities and Urban Land-Use Patterns and Processes",
      weight: "12-17%",
      topics: ["The Origin and Influences of Urbanization", "Cities Across the World", "Cities and Globalization", "The Size and Distribution of Cities", "The Internal Structure of Cities", "Density and Land Use", "Infrastructure", "Urban Sustainability", "Urban Data", "Challenges of Urban Changes", "Challenges of Urban Sustainability"],
      keyConcepts: [
        "Urban hearths and early cities",
        "Central place theory and urban hierarchy",
        "Gravity model and spatial interaction",
        "Urban morphology models: Burgess, Hoyt, multiple nuclei",
        "Suburbanization and urban sprawl",
        "Gentrification and urban renewal",
        "Smart growth and sustainable cities"
      ],
      essentialKnowledge: [
        "Cities developed to serve economic and defensive functions",
        "Urban systems are organized hierarchically",
        "Cities show predictable internal spatial patterns",
        "Urbanization creates both opportunities and challenges",
        "Sustainable urban development is increasingly important"
      ]
    },
    {
      name: "Unit 7: Industrial and Economic Development Patterns and Processes",
      weight: "12-17%",
      topics: ["The Industrial Revolution", "Economic Sectors", "Measures of Development", "Women", "Theories of Development", "Changes as a Result of the World Economy", "Sustainable"],
      keyConcepts: [
        "Primary, secondary, tertiary, quaternary economic sectors",
        "Development indicators: GDP, HDI, GII",
        "Core-periphery model and world systems theory",
        "Rostow's modernization theory",
        "Dependency theory and neocolonialism",
        "Multinational corporations and globalization",
        "Sustainable development goals"
      ],
      essentialKnowledge: [
        "Industrial Revolution created modern economic patterns",
        "Economic development varies globally and can be measured",
        "Different theories explain development and underdevelopment",
        "Globalization has restructured the world economy",
        "Sustainable development balances growth with environmental protection"
      ]
    }
  ],
  keySkills: [
    "Concepts and Processes: Analyze geographic concepts, processes, models, and theories",
    "Spatial Relationships: Analyze geographic patterns, relationships, and outcomes in applied contexts",
    "Data Analysis: Analyze and interpret quantitative geographic data",
    "Source Analysis: Analyze and interpret qualitative geographic information",
    "Scale Analysis: Analyze geographic patterns and processes at different scales",
    "Argumentation: Develop and support an argument with evidence and reasoning"
  ],
  studyTips: [
    "Study maps regularly and practice map reading skills",
    "Learn geographic models and theories thoroughly",
    "Practice analyzing different types of geographic data",
    "Understand scale and how it affects geographic analysis",
    "Connect local examples to global patterns and processes",
    "Practice free response questions with clear organization",
    "Study current events through a geographic lens",
    "Use geographic vocabulary precisely and accurately",
    "Practice drawing and interpreting diagrams and sketches",
    "Understand the connections between different geographic topics"
  ],
  commonTopics: [
    "Population density patterns and demographic transition",
    "Migration types, causes, and consequences",
    "Cultural diffusion processes and patterns",
    "Language families and religious distributions",
    "Nation-state formation and sovereignty challenges",
    "Agricultural revolutions and land use models",
    "Urban hierarchy and central place theory",
    "Industrial location factors and economic sectors",
    "Development theories and global inequalities",
    "Globalization impacts on space and place",
    "Environmental challenges and sustainability",
    "Geographic Information Systems and spatial analysis"
  ]
};

export default humanGeography;
