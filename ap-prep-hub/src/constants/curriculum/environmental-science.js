// AP Environmental Science curriculum data
const environmentalScience = {
  name: "AP Environmental Science",
  description: "Explore and investigate the interrelationships of the natural world and analyze environmental problems, both natural and human-made.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 80, time: "90 minutes", weight: "60%" },
      { name: "Free Response", questions: 3, time: "90 minutes", weight: "40%" }
    ]
  },
  bigIdeas: [
    "Energy Transfer: Energy conversions underlie all ecological processes and human activities",
    "Interactions Between Earth Systems: The Earth is one interconnected system where changes in one component can affect other components",
    "Interactions Between Different Species and the Environment: Humans impact the environment in ways that affect other organisms and future generations",
    "Sustainability: Human survival depends on developing practices that will achieve sustainable systems"
  ],
  units: [
    {
      name: "Unit 1: The Living World: Ecosystems",
      weight: "6-8%",
      topics: [
        "Introduction to ecosystems",
        "Terrestrial biomes",
        "Aquatic biomes",
        "The carbon cycle",
        "The nitrogen cycle",
        "The phosphorus cycle",
        "The hydrologic (water) cycle"
      ],
      keyConcepts: [
        "Ecosystem structure and function",
        "Biotic and abiotic factors",
        "Biome characteristics and distribution",
        "Biogeochemical cycles",
        "Primary productivity",
        "Trophic levels and energy flow",
        "Food webs and food chains"
      ],
      essentialKnowledge: [
        "Ecosystems are composed of living and nonliving components",
        "Biomes are characterized by climate patterns and dominant vegetation",
        "Biogeochemical cycles move elements through ecosystems",
        "Energy flows through ecosystems while matter cycles",
        "Human activities can disrupt natural cycles"
      ]
    },
    {
      name: "Unit 2: The Living World: Biodiversity",
      weight: "6-8%",
      topics: [
        "Introduction to biodiversity",
        "Ecosystem services",
        "Island biogeography",
        "Ecological tolerance",
        "Natural disruptions to ecosystems"
      ],
      keyConcepts: [
        "Levels of biodiversity: genetic, species, ecosystem",
        "Ecosystem services: provisioning, regulating, cultural, supporting",
        "Species-area relationship",
        "Range of tolerance and limiting factors",
        "Natural disturbances and succession",
        "Keystone species and indicator species"
      ],
      essentialKnowledge: [
        "Biodiversity provides ecosystem stability and services",
        "Island biogeography explains species distribution patterns",
        "Organisms have ranges of tolerance for environmental factors",
        "Natural disturbances are part of ecosystem dynamics",
        "Some species have disproportionate effects on ecosystem structure"
      ]
    },
    {
      name: "Unit 3: Populations",
      weight: "10-15%",
      topics: [
        "Generalist and specialist species",
        "K-selected and r-selected species",
        "Survivorship curves",
        "Carrying capacity",
        "Population growth and resource availability",
        "Age structure diagrams",
        "Total fertility rate",
        "Human population dynamics",
        "Demographic transition"
      ],
      keyConcepts: [
        "Population growth models: exponential and logistic",
        "Reproductive strategies and life history patterns",
        "Survivorship curve types",
        "Demographic transition model",
        "Population pyramids and age structure",
        "Factors affecting human population growth",
        "Carrying capacity and overshoot"
      ],
      essentialKnowledge: [
        "Population growth is limited by environmental resistance",
        "Different species have different reproductive strategies",
        "Human population growth follows predictable patterns",
        "Age structure affects future population growth",
        "Demographic transition correlates with economic development"
      ]
    },
    {
      name: "Unit 4: Earth Systems and Resources",
      weight: "10-15%",
      topics: [
        "Plate tectonics",
        "Soil formation and erosion",
        "Soil composition and properties",
        "Earth's atmosphere",
        "Global wind patterns",
        "Watersheds",
        "Solar radiation and Earth's seasons"
      ],
      keyConcepts: [
        "Earth's internal structure and plate movements",
        "Soil horizons and formation processes",
        "Atmospheric composition and layers",
        "Coriolis effect and global circulation patterns",
        "Watershed structure and function",
        "Solar radiation distribution and seasons",
        "Weather vs. climate"
      ],
      essentialKnowledge: [
        "Plate tectonics shapes Earth's surface and affects natural hazards",
        "Soil formation is a slow process affected by multiple factors",
        "Atmospheric circulation patterns affect global climate",
        "Watersheds connect terrestrial and aquatic systems",
        "Solar radiation drives weather and climate patterns"
      ]
    },
    {
      name: "Unit 5: Land and Water Use",
      weight: "10-15%",
      topics: [
        "The tragedy of the commons",
        "Clearcutting",
        "The green revolution",
        "Impacts of agricultural practices",
        "Controlling pests",
        "Meat production methods",
        "Impacts of overfishing",
        "Impacts of mining",
        "Impacts of urbanization",
        "Ecological footprints",
        "Introduction to sustainability"
      ],
      keyConcepts: [
        "Common pool resources and management challenges",
        "Forest management practices and impacts",
        "Industrial agriculture and its consequences",
        "Integrated pest management",
        "Sustainable vs. unsustainable practices",
        "Urban sprawl and smart growth",
        "Resource depletion and conservation",
        "Environmental justice issues"
      ],
      essentialKnowledge: [
        "Common resources are often overexploited without regulation",
        "Modern agriculture has increased yields but created environmental problems",
        "Different land use practices have varying environmental impacts",
        "Urbanization creates both challenges and opportunities",
        "Sustainability requires balancing human needs with environmental protection"
      ]
    },
    {
      name: "Unit 6: Energy Resources and Consumption",
      weight: "10-15%",
      topics: [
        "Renewable and nonrenewable resources",
        "Global energy consumption",
        "Fossil fuels",
        "Nuclear power",
        "Energy from biomass",
        "Solar energy",
        "Hydroelectric power",
        "Geothermal energy",
        "Hydrogen fuel cells",
        "Wind energy",
        "Energy conservation"
      ],
      keyConcepts: [
        "Energy types and sources",
        "Fossil fuel formation and extraction",
        "Nuclear fission and fusion",
        "Renewable energy technologies",
        "Energy efficiency and conservation",
        "Environmental impacts of energy sources",
        "Energy policy and economics",
        "Net energy and EROI concepts"
      ],
      essentialKnowledge: [
        "Energy sources have different environmental and economic impacts",
        "Fossil fuels provide most global energy but cause environmental problems",
        "Renewable energy sources are becoming more economically viable",
        "Energy conservation is often more cost-effective than new production",
        "Energy transitions require considering multiple factors"
      ]
    },
    {
      name: "Unit 7: Atmospheric Pollution",
      weight: "7-10%",
      topics: [
        "Introduction to air pollution",
        "Photochemical smog",
        "Thermal inversion",
        "Atmospheric CO2 and particulates",
        "Indoor air pollutants",
        "Reduction of air pollutants",
        "Acid rain",
        "Noise pollution"
      ],
      keyConcepts: [
        "Primary and secondary air pollutants",
        "Smog formation and health impacts",
        "Atmospheric conditions affecting pollution",
        "Sources of air pollution",
        "Clean Air Act and pollution control",
        "Acid deposition causes and effects",
        "Indoor vs. outdoor air quality"
      ],
      essentialKnowledge: [
        "Air pollution comes from natural and anthropogenic sources",
        "Atmospheric conditions affect pollution concentration and transport",
        "Air pollution has local and regional health and environmental impacts",
        "Pollution control technologies can reduce emissions",
        "Indoor air quality can be worse than outdoor air quality"
      ]
    },
    {
      name: "Unit 8: Aquatic and Terrestrial Pollution",
      weight: "7-10%",
      topics: [
        "Sources of pollution",
        "Human impacts on ecosystems",
        "Endocrine disruptors",
        "Human impacts on wetlands and mangroves",
        "Eutrophication",
        "Thermal pollution",
        "Persistent organic pollutants (POPs)",
        "Bioaccumulation and biomagnification",
        "Solid waste disposal",
        "Waste reduction methods",
        "Sewage treatment"
      ],
      keyConcepts: [
        "Point and nonpoint source pollution",
        "Chemical pollution and toxicology",
        "Bioaccumulation and biomagnification",
        "Eutrophication process and impacts",
        "Waste management hierarchy",
        "Wastewater treatment processes",
        "Persistent organic pollutants",
        "Environmental remediation techniques"
      ],
      essentialKnowledge: [
        "Pollution can come from discrete sources or diffuse sources",
        "Some chemicals accumulate in organisms and food webs",
        "Nutrient pollution can cause eutrophication in aquatic systems",
        "Waste management follows a hierarchy of preferred options",
        "Pollution prevention is more effective than cleanup"
      ]
    },
    {
      name: "Unit 9: Global Change",
      weight: "15-20%",
      topics: [
        "Stratospheric ozone depletion",
        "The greenhouse effect",
        "Increases in greenhouse gases",
        "Global climate change",
        "Ocean warming and ocean acidification",
        "Invasive species",
        "Endangered species",
        "Human impacts on biodiversity"
      ],
      keyConcepts: [
        "Ozone depletion causes and consequences",
        "Greenhouse effect and enhanced greenhouse effect",
        "Climate change causes and impacts",
        "Ocean acidification process",
        "Invasive species characteristics and impacts",
        "Biodiversity loss and extinction rates",
        "Conservation strategies",
        "International environmental agreements"
      ],
      essentialKnowledge: [
        "Human activities have altered atmospheric chemistry",
        "Climate change has multiple causes and far-reaching impacts",
        "Ocean chemistry is changing due to increased CO2",
        "Human activities are increasing species extinction rates",
        "Global environmental problems require international cooperation"
      ]
    }
  ],
  keySkills: [
    "Concept Explanation: Explain environmental concepts, processes, and models presented in written format",
    "Visual Representations: Analyze visual representations of environmental concepts and processes",
    "Text Analysis: Analyze provided text about environmental issues",
    "Scientific Experiments: Analyze research studies and understand experimental design",
    "Data Analysis: Analyze environmental data and identify patterns and relationships",
    "Mathematical Routines: Apply quantitative methods to address environmental concepts",
    "Environmental Solutions: Propose and justify solutions to environmental problems"
  ],
  studyTips: [
    "Focus on understanding processes and connections between environmental systems",
    "Practice interpreting graphs, charts, and data tables regularly",
    "Learn to calculate and interpret environmental data and statistics",
    "Study current environmental issues and policy developments",
    "Practice mathematical problem-solving with environmental applications",
    "Understand the relationships between human activities and environmental impacts",
    "Learn to propose and evaluate solutions to environmental problems",
    "Study real-world case studies and examples",
    "Practice writing clear explanations of environmental processes",
    "Connect local environmental issues to global patterns and processes"
  ],
  commonTopics: [
    "Ecosystem structure, function, and energy flow",
    "Biogeochemical cycles and their disruption",
    "Population growth models and human demographics",
    "Natural resource extraction and management",
    "Renewable and nonrenewable energy sources",
    "Air pollution sources, impacts, and control",
    "Water pollution and wastewater treatment",
    "Climate change causes, impacts, and mitigation",
    "Biodiversity loss and conservation strategies",
    "Environmental policy and regulations",
    "Sustainability concepts and practices",
    "Environmental justice and equity issues"
  ]
};

export default environmentalScience;
