/**
 * Per-route title, description and canonical for the app's public routes.
 *
 * Every SPA route served `build/index.html`, whose head hardcodes
 * `<link rel="canonical" href="https://apex-scholar.com/">`. Nine indexed-able
 * URLs therefore told Google "I am really the homepage", so Google consolidated
 * all nine into `/` and indexed one page instead of nine. Search Console on
 * 2026-09-17: **2 indexed, 12 not**, impressions flat at ~5/day since June.
 *
 * `useDocumentMeta` already did this job correctly and had exactly one caller
 * (ScoreCalculator). This is the table that gives it the rest.
 *
 * Titles are kept at or under 65 characters, the point where Google starts
 * truncating in the SERP — same rule `pageMeta.test.js` enforces for the
 * calculator pages.
 *
 * Score-calculator paths are deliberately absent: ScoreCalculator.jsx sets its
 * own per-subject meta and must stay the single writer for those, or the two
 * would race on every navigation.
 */
export const ROUTE_META = {
  '/': {
    // Deliberately identical to the <title> in public/index.html. The homepage
    // is one of only two pages Google currently has indexed; changing its title
    // while fixing an indexing bug would confound the two changes and make the
    // recovery unreadable. It is 71 characters, past the 65-char truncation
    // point, and worth shortening — but as its own change, measured on its own.
    title: 'Apex Scholar — AI Tutors, Practice Tests & Smart Scheduler for AP Exams',
    description:
      'Free AP exam prep: subject-specific AI tutors, generated practice tests, flashcards with spaced repetition, and a study scheduler. No cost, no ads.',
  },
  '/start': {
    title: 'Free AP Score Check: 10 Questions — Apex Scholar',
    description:
      'Answer 10 AP-style questions in your subject and get a predicted AP score, the honest range around it, and what to study today. Free, no account needed.',
  },
  '/study/timelines/ap-us-history': {
    title: 'AP U.S. History Timeline, Every Key Event by Theme — Apex Scholar',
    description:
      'Free interactive APUSH timeline: every key event from before 1491 to today, colour-coded by course theme, with a short study note for any event.',
  },
  '/study': {
    title: 'Learn: Free AP Unit Lessons and Timelines — Apex Scholar',
    description:
      'Free AP unit lessons for all 39 courses: flashcards, worked steps, simulations and a checkpoint after every topic, plus an interactive APUSH timeline.',
  },
  '/study/ap-biology': {
    title: 'AP Biology Lessons by Unit — Apex Scholar',
    description:
      'Free AP Biology unit study packs: chemistry of life and cells, with lessons, simulations and checkpoints that save your progress and adapt to you.',
  },
  '/study/ap-calculus-ab': {
    title: 'AP Calculus AB Lessons by Unit — Apex Scholar',
    description:
      'Free AP Calculus AB unit study packs: limits, continuity and derivatives, with worked steps, interactive graphs and checkpoints that adapt to you.',
  },
  '/study/ap-psychology': {
    title: 'AP Psychology Lessons by Unit — Apex Scholar',
    description:
      'Free AP Psychology unit study packs: biological bases and cognition, with flashcards, live experiments and checkpoints that adapt to you.',
  },
  '/study/ap-biology/unit-1': {
    title: 'AP Biology Unit 1: Chemistry of Life — Free Study Pack',
    description:
      'Water, elements of life, macromolecules, carbohydrates, lipids, nucleic acids and proteins: short lessons, flashcards, simulations and checkpoints. Free.',
  },
  '/study/ap-calculus-ab/unit-1': {
    title: 'AP Calculus AB Unit 1: Limits and Continuity — Study Pack',
    description:
      'Limits from graphs, tables and algebra, the squeeze theorem, continuity, asymptotes and the IVT: worked steps, interactive graphs and checkpoints. Free.',
  },
  '/study/ap-psychology/unit-1': {
    title: 'AP Psychology Unit 1: Biological Bases — Study Pack',
    description:
      'Heredity, the nervous system, neurons and neurotransmitters, the brain, sleep and sensation: flashcards, a neuron simulation and scenario checkpoints. Free.',
  },
  '/study/ap-biology/unit-2': {
    title: 'AP Biology Unit 2: Cells — Free Study Pack',
    description:
      'Organelles, cell size and SA:V, the fluid mosaic membrane, transport, tonicity and water potential, and endosymbiosis: lessons, simulations and checkpoints.',
  },
  '/study/ap-calculus-ab/unit-2': {
    title: 'AP Calculus AB Unit 2: Derivatives — Study Pack',
    description:
      'The derivative definition, tangent lines, estimating from tables, differentiability, power, product and quotient rules, and trig derivatives. Free.',
  },
  '/study/ap-calculus-bc': {
    title: 'AP Calculus BC Lessons by Unit — Apex Scholar',
    description:
      'Free AP Calculus BC unit study packs: limits and continuity, with worked steps, interactive graphs and checkpoints that save your progress and adapt to you.',
  },
  '/study/ap-calculus-bc/unit-1': {
    title: 'AP Calculus BC Unit 1: Limits and Continuity — Study Pack',
    description:
      'Limits from graphs, tables and algebra, the squeeze theorem, continuity, asymptotes and the IVT for AP Calculus BC: worked steps and checkpoints. Free.',
  },
  '/study/ap-psychology/unit-2': {
    title: 'AP Psychology Unit 2: Cognition — Study Pack',
    description:
      'Perception, heuristics and decisions, memory encoding, storage, retrieval and forgetting, and intelligence testing, with a live memory experiment. Free.',
  },
  '/study/ap-physics-1': {
    title: 'AP Physics 1: Algebra-Based Lessons by Unit — Apex Scholar',
    description:
      'Free AP Physics 1 unit study packs: kinematics, with worked steps, motion graphs, a projectile simulation and checkpoints that save your progress and adapt.',
  },
  '/study/ap-physics-1/unit-1': {
    title: 'AP Physics 1: Algebra-Based Unit 1: Kinematics — Free Study Pack',
    description:
      'Vectors, displacement, velocity and acceleration, motion graphs, the kinematic equations, relative motion and projectiles, with a projectile launcher. Free.',
  },
  '/study/ap-environmental-science': {
    title: 'AP Environmental Science Lessons by Unit — Apex Scholar',
    description:
      'Free AP Environmental Science unit study packs: ecosystems, cycles and energy flow, with simulations and checkpoints that save your progress and adapt.',
  },
  '/study/ap-environmental-science/unit-1': {
    title: 'APES Unit 1: The Living World: Ecosystems — Study Pack',
    description:
      'Species interactions, biomes, the carbon, nitrogen, phosphorus and water cycles, productivity and the 10% rule, with an energy pyramid simulation. Free.',
  },
  '/study/ap-human-geography': {
    title: 'AP Human Geography Lessons by Unit — Apex Scholar',
    description:
      'Free AP Human Geography unit study packs: maps, data, spatial concepts, scale and regions, with checkpoints that save your progress and adapt to you.',
  },
  '/study/ap-human-geography/unit-1': {
    title: 'AP Human Geography Unit 1: Thinking Geographically — Study Pack',
    description:
      'Map types and projections, geographic data and GIS, spatial concepts, possibilism, scales of analysis and regions, with a map distortion simulation. Free.',
  },
  '/study/ap-chemistry': {
    title: 'AP Chemistry Lessons by Unit — Apex Scholar',
    description:
      'Free AP Chemistry unit study packs: atomic structure, PES and periodic trends, with worked steps, simulations and checkpoints that adapt to you.',
  },
  '/study/ap-chemistry/unit-1': {
    title: 'AP Chemistry Unit 1: Atomic Structure and Properties — Study Pack',
    description:
      'Moles, mass spectra, empirical formulas, electron configurations, photoelectron spectroscopy and periodic trends, with a PES simulation. Free.',
  },
  '/study/ap-statistics': {
    title: 'AP Statistics Lessons by Unit — Apex Scholar',
    description:
      'Free AP Statistics unit study packs for the revised 2026 course: data, sampling and experiments, with checkpoints that save your progress and adapt.',
  },
  '/study/ap-statistics/unit-1': {
    title: 'AP Statistics Unit 1: Exploring Data and Sampling — Study Pack',
    description:
      'Variables, graphs, summary statistics, outliers, z-scores, sampling, bias and experimental design for the 2026 AP Statistics course, with a simulation. Free.',
  },
  '/study/ap-precalculus': {
    title: 'AP Precalculus Lessons by Unit — Apex Scholar',
    description:
      'Free AP Precalculus unit study packs: polynomial and rational functions, with worked steps, interactive graphs and checkpoints that adapt to you.',
  },
  '/study/ap-precalculus/unit-1': {
    title: 'AP Precalculus Unit 1: Polynomial and Rational Functions — Pack',
    description:
      'Rates of change, polynomial zeros and end behavior, rational asymptotes and holes, transformations and modeling, with interactive graphs. Free.',
  },
  '/study/ap-physics-2': {
    title: 'AP Physics 2: Algebra-Based Lessons by Unit — Apex Scholar',
    description:
      'Free AP Physics 2: Algebra-Based unit study packs: thermodynamics, with worked steps, a PV diagram simulation and checkpoints that save your progress and adapt.',
  },
  '/study/ap-physics-2/unit-9': {
    title: 'AP Physics 2: Algebra-Based Unit 9: Thermodynamics',
    description:
      'Kinetic theory, the ideal gas law, heat transfer, the first law and PV diagrams, specific heat, conduction and entropy, with a PV simulation. Free.',
  },
  '/study/ap-physics-c-mechanics': {
    title: 'AP Physics C: Mechanics Lessons by Unit — Apex Scholar',
    description:
      'Free AP Physics C: Mechanics unit study packs: calculus-based kinematics, with worked steps, simulations and checkpoints that save progress and adapt.',
  },
  '/study/ap-physics-c-mechanics/unit-1': {
    title: 'AP Physics C: Mechanics Unit 1: Kinematics — Study Pack',
    description:
      'Calculus-based kinematics: unit vectors, derivatives and integrals of motion, graphs, relative motion and projectiles, with interactive simulations. Free.',
  },
  '/study/ap-physics-c-electricity-and-magnetism': {
    title: 'AP Physics C: Electricity and Magnetism Lessons by Unit',
    description:
      'Free AP Physics C: Electricity and Magnetism study packs: charges, fields and Gauss’s law, with worked steps, simulations and adaptive checkpoints.',
  },
  '/study/ap-physics-c-electricity-and-magnetism/unit-8': {
    title: 'AP Physics C: E&M Unit 8: Charges, Fields and Gauss’s Law — Pack',
    description:
      'Coulomb’s law, charging, electric fields, fields of charge distributions by integration, flux and Gauss’s law, with a field map simulation. Free.',
  },
  '/study/ap-macroeconomics': {
    title: 'AP Macroeconomics Lessons by Unit — Apex Scholar',
    description:
      'Free AP Macroeconomics unit study packs: basic economic concepts, with graphs, a PPC simulation and checkpoints that save your progress and adapt.',
  },
  '/study/ap-macroeconomics/unit-1': {
    title: 'AP Macroeconomics Unit 1: Basic Economic Concepts — Study Pack',
    description:
      'Scarcity, opportunity cost and the PPC, comparative advantage and terms of trade, supply, demand and equilibrium, with a PPC simulation. Free.',
  },
  '/study/ap-microeconomics': {
    title: 'AP Microeconomics Lessons by Unit — Apex Scholar',
    description:
      'Free AP Microeconomics unit study packs: basic economic concepts and marginal thinking, with a PPC simulation and checkpoints that adapt to you.',
  },
  '/study/ap-microeconomics/unit-1': {
    title: 'AP Microeconomics Unit 1: Basic Economic Concepts — Study Pack',
    description:
      'Scarcity, economic systems, the PPC, comparative advantage, cost-benefit analysis, marginal analysis and MU per dollar, with a PPC simulation. Free.',
  },
  '/study/ap-us-history': {
    title: 'AP U.S. History Study Packs by Period — Apex Scholar',
    description:
      'Free AP U.S. History study packs by period: Period 1 (1491–1607) with flashcards, a timeline activity and checkpoints that save your progress and adapt.',
  },
  '/study/ap-us-history/unit-1': {
    title: 'AP U.S. History Period 1 (1491–1607) — Study Pack',
    description:
      'Native societies before contact, European exploration, the Columbian Exchange, encomienda and caste, and cultural interactions, with a timeline activity. Free.',
  },
  '/study/ap-world-history-modern': {
    title: 'AP World History: Modern Lessons by Unit — Apex Scholar',
    description:
      'Free AP World History: Modern unit study packs: the Global Tapestry, with flashcards, a timeline activity and checkpoints that save your progress and adapt.',
  },
  '/study/ap-world-history-modern/unit-1': {
    title: 'AP World History: Modern Unit 1: The Global Tapestry — Study Pack',
    description:
      'Song China, Dar al-Islam, South and Southeast Asia, the Americas, Africa and Europe from c. 1200 to 1450, with flashcards and a timeline. Free.',
  },
  '/study/ap-european-history': {
    title: 'AP European History Lessons by Unit — Apex Scholar',
    description:
      'Free AP European History unit study packs: Renaissance and Exploration, with flashcards, a timeline activity and checkpoints that save your progress.',
  },
  '/study/ap-european-history/unit-1': {
    title: 'AP Euro Unit 1: Renaissance and Exploration — Study Pack',
    description:
      'Italian and Northern Renaissance, printing, new monarchies, exploration, the Columbian Exchange, the slave trade and the Commercial Revolution. Free.',
  },
  '/study/ap-us-government-and-politics': {
    title: 'AP U.S. Government and Politics Lessons by Unit — Apex Scholar',
    description:
      'Free AP U.S. Government and Politics unit study packs: Foundations of American Democracy, with activities and checkpoints that save your progress.',
  },
  '/study/ap-us-government-and-politics/unit-1': {
    title: 'AP Gov Unit 1: Foundations of American Democracy — Study Pack',
    description:
      'Democratic ideals, the Articles, ratification compromises, Federalist 10 and 51, Brutus 1, federalism, McCulloch and Lopez, with activities. Free.',
  },
  '/study/ap-comparative-government-and-politics': {
    title: 'AP Comparative Government and Politics Lessons by Unit',
    description:
      'Free AP Comparative Government and Politics unit study packs: political systems and regimes, with sorting activities and checkpoints that save progress.',
  },
  '/study/ap-comparative-government-and-politics/unit-1': {
    title: 'AP Comp Gov Unit 1: Political Systems and Regimes — Study Pack',
    description:
      'Data and methods, states vs. regimes, democracy vs. authoritarianism, democratization, legitimacy and stability across the six course countries. Free.',
  },
  '/study/ap-computer-science-a': {
    title: 'AP Computer Science A Lessons by Unit — Apex Scholar',
    description:
      'Free AP Computer Science A unit study packs: Using Objects and Methods, with live Java labs and checkpoints that save your progress and adapt.',
  },
  '/study/ap-computer-science-a/unit-1': {
    title: 'AP CSA Unit 1: Using Objects and Methods — Study Pack',
    description:
      'Java types, int vs. double arithmetic, casting and overflow, methods, the Math class, objects and String methods, with two live Java labs. Free.',
  },
  '/study/ap-computer-science-principles': {
    title: 'AP Computer Science Principles Study Packs — Apex Scholar',
    description:
      'Free AP Computer Science Principles study packs by Big Idea: Creative Development, with sorting activities and checkpoints that save your progress.',
  },
  '/study/ap-computer-science-principles/unit-1': {
    title: 'AP CSP Big Idea 1: Creative Development — Study Pack',
    description:
      'Collaboration, program purpose, inputs, events and outputs, iterative and incremental development, documentation, and finding errors with tests. Free.',
  },
  '/study/ap-english-language-and-composition': {
    title: 'AP English Language and Composition Lessons by Unit',
    description:
      'Free AP English Language and Composition unit study packs: the rhetorical situation, claims and evidence, with activities and saved progress.',
  },
  '/study/ap-english-language-and-composition/unit-1': {
    title: 'AP English Language and Composition Unit 1: Rhetorical Situation',
    description:
      'Exigence, purpose, audience and context, claims vs. facts, types of evidence, and embedding quotes in a claim-and-evidence paragraph. Free.',
  },
  '/study/ap-english-literature-and-composition': {
    title: 'AP English Literature and Composition Lessons by Unit',
    description:
      'Free AP English Literature and Composition unit study packs: Short Fiction I, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-english-literature-and-composition/unit-1': {
    title: 'AP English Literature and Composition Unit 1: Short Fiction I',
    description:
      'Character, setting, plot, narrator and point of view, and claim-and-evidence paragraphs, taught through Chopin and Poe, with activities. Free.',
  },
  '/study/ap-cybersecurity': {
    title: 'AP Cybersecurity Lessons by Unit — Apex Scholar',
    description:
      'Free AP Cybersecurity unit study packs: Introduction to Security, with a password simulation, sorting activities and checkpoints that save progress.',
  },
  '/study/ap-cybersecurity/unit-1': {
    title: 'AP Cybersecurity Unit 1: Introduction to Security — Study Pack',
    description:
      'Social engineering, password attacks and MFA, public Wi-Fi risks, AI-powered attacks and AI in defense, with a password search-space sim. Free.',
  },
  '/study/ap-business-with-personal-finance': {
    title: 'AP Business with Personal Finance Study Packs — Apex Scholar',
    description:
      'Free AP Business with Personal Finance unit study packs: Businesses, Competition, and New Ideas, with sorting activities and saved progress.',
  },
  '/study/ap-business-with-personal-finance/unit-1': {
    title: 'AP Business with Personal Finance Unit 1 — Study Pack',
    description:
      'Value creation and capture, markets and competitive advantage, PESTEL, design thinking and MVPs, ethics, business types and supply chains. Free.',
  },
  '/study/ap-art-history': {
    title: 'AP Art History Lessons by Unit — Apex Scholar',
    description:
      'Free AP Art History unit study packs: Global Prehistory, with every required work, a timeline and region sort, and checkpoints that save progress.',
  },
  '/study/ap-art-history/unit-1': {
    title: 'AP Art History Unit 1: Global Prehistory — Study Pack',
    description:
      'Prehistoric art worldwide: culture, materials and theories, with all eleven required works from the Apollo 11 stones to Stonehenge. Free.',
  },
  '/study/ap-music-theory': {
    title: 'AP Music Theory Lessons by Unit — Apex Scholar',
    description:
      'Free AP Music Theory unit study packs: Music Fundamentals I, with a playable scale builder, a meter lab and checkpoints that save progress.',
  },
  '/study/ap-music-theory/unit-1': {
    title: 'AP Music Theory Unit 1: Music Fundamentals I — Study Pack',
    description:
      'Clefs, rhythm values, half and whole steps, major scales, key signatures, meter and time signatures, tempo and dynamics, with audio sims. Free.',
  },
  '/study/ap-latin': {
    title: 'AP Latin Lessons by Unit — Apex Scholar',
    description:
      'Free AP Latin unit study packs: Teacher’s Choice Latin prose grammar, with a case lab, a case-use sort and checkpoints that save your progress.',
  },
  '/study/ap-latin/unit-1': {
    title: 'AP Latin Unit 1: Latin Prose Grammar Review — Study Pack',
    description:
      'Cases and their uses, verb tenses and voice, pronouns, adjectives, participles, subjunctive and imperative, and citing Latin evidence. Free.',
  },
  '/study/ap-african-american-studies': {
    title: 'AP African American Studies Study Packs — Apex Scholar',
    description:
      'Free AP African American Studies unit study packs: Origins of the African Diaspora, with activities and checkpoints that save your progress.',
  },
  '/study/ap-african-american-studies/unit-1': {
    title: 'AP African American Studies Unit 1: Origins — Study Pack',
    description:
      'The field, Africa’s geography, the Bantu expansion, Nubia, Aksum, Nok, Ghana, Mali, Songhai, Great Zimbabwe, Kongo, Queens Idia and Njinga. Free.',
  },
  '/study/ap-spanish-language-and-culture': {
    title: 'AP Spanish Language and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP Spanish Language and Culture unit study packs: Families and Communities, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-spanish-language-and-culture/unit-1': {
    title: 'AP Spanish Unit 1: Families and Communities — Study Pack',
    description:
      'Spanish family and community vocabulary, reading articles and charts, Project Presentation and Q&A strategies, and cultural practices. Free.',
  },
  '/study/ap-french-language-and-culture': {
    title: 'AP French Language and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP French Language and Culture unit study packs: Families and Communities, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-french-language-and-culture/unit-1': {
    title: 'AP French Language and Culture Unit 1: Families and Communities',
    description:
      'French family and community vocabulary, reading articles and charts, Project Presentation and Q&A strategies, and cultural practices. Free.',
  },
  '/study/ap-german-language-and-culture': {
    title: 'AP German Language and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP German Language and Culture unit study packs: Families and Communities, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-german-language-and-culture/unit-1': {
    title: 'AP German Language and Culture Unit 1: Families and Communities',
    description:
      'German family and community vocabulary, reading articles and charts, Project Presentation and Q&A strategies, and cultural practices. Free.',
  },
  '/study/ap-italian-language-and-culture': {
    title: 'AP Italian Language and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP Italian Language and Culture unit study packs: Families and Communities, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-italian-language-and-culture/unit-1': {
    title: 'AP Italian Language and Culture Unit 1: Families and Communities',
    description:
      'Italian family and community vocabulary, reading articles and charts, Project Presentation and Q&A strategies, and cultural practices. Free.',
  },
  '/study/ap-japanese-language-and-culture': {
    title: 'AP Japanese Language and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP Japanese Language and Culture unit study packs: Families and Communities, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-japanese-language-and-culture/unit-1': {
    title: 'AP Japanese Language and Culture Unit 1: Families and Communities',
    description:
      'Japanese family and community vocabulary, reading articles and charts, Project Presentation and Q&A strategies, and cultural practices. Free.',
  },
  '/study/ap-chinese-language-and-culture': {
    title: 'AP Chinese Language and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP Chinese Language and Culture unit study packs: Families and Communities, with activities and checkpoints that save your progress and adapt.',
  },
  '/study/ap-chinese-language-and-culture/unit-1': {
    title: 'AP Chinese Language and Culture Unit 1: Families and Communities',
    description:
      'Chinese family and community vocabulary, reading articles and charts, Project Presentation and Q&A strategies, and cultural practices. Free.',
  },
  '/study/ap-spanish-literature-and-culture': {
    title: 'AP Spanish Literature and Culture Lessons by Unit — Apex Scholar',
    description:
      'Free AP Spanish Literature and Culture unit study packs: La época medieval, with a literary-terms activity and checkpoints that save progress.',
  },
  '/study/ap-spanish-literature-and-culture/unit-1': {
    title: 'AP Spanish Literature and Culture Unit 1: La época medieval',
    description:
      'El conde Lucanor (Exemplo XXXV) and the Romance de la pérdida de Alhama: context, themes, literary terms and essay practice. Free.',
  },
  '/study/ap-seminar': {
    title: 'AP Seminar Study Packs by Big Idea — Apex Scholar',
    description:
      'Free AP Seminar study packs by Big Idea: Question and Explore, with a database search sandbox, sorting activities and saved progress.',
  },
  '/study/ap-seminar/unit-1': {
    title: 'AP Seminar Big Idea 1: Question and Explore — Study Pack',
    description:
      'Contextualizing issues, research questions, prior knowledge, Boolean searching, primary vs. secondary sources and source credibility. Free.',
  },
  '/study/ap-research': {
    title: 'AP Research Study Packs by Big Idea — Apex Scholar',
    description:
      'Free AP Research study packs by Big Idea: Question and Explore, with a database search sandbox, a methods sort and checkpoints that save progress.',
  },
  '/study/ap-research/unit-1': {
    title: 'AP Research Big Idea 1: Question and Explore — Study Pack',
    description:
      'Topic and purpose, refining a research question, sources and credibility, methods, sampling, coding, perseverance and IRB ethics. Free.',
  },
  '/study/ap-us-history/unit-2': {
    title: 'AP U.S. History Period 2 (1607–1754) — Study Pack',
    description:
      'European empires compared, the British colonial regions, Atlantic trade and mercantilism, Native alliances and wars, slavery, and the Great Awakening. Free.',
  },
  '/study/ap-us-government-and-politics/unit-2': {
    title: 'AP Gov Unit 2: Interactions Among Branches — Study Pack',
    description:
      'Congress, the presidency, the courts and the bureaucracy: Federalist 70 and 78, Marbury, Baker v. Carr, Shaw v. Reno, checks and oversight. Free.',
  },
  '/study/ap-world-history-modern/unit-2': {
    title: 'AP World History: Modern Unit 2: Networks of Exchange',
    description:
      'The Silk Roads, the Mongol Empire, Indian Ocean and trans-Saharan trade, travelers, and the Black Death, with a timeline and a three-network sort. Free.',
  },
  '/study/ap-english-language-and-composition/unit-2': {
    title: 'AP Lang Unit 2: Audience, Appeals, Evidence, Thesis — Study Pack',
    description:
      'Writing for an audience\'s values, ethos, pathos and logos, what evidence is for, when it\'s sufficient, and defensible thesis statements, with three sorts. Free.',
  },
  '/study/ap-precalculus/unit-2': {
    title: 'AP Precalculus Unit 2: Exponential and Log Functions — Study Pack',
    description:
      'Sequences, exponential functions and models, residuals, composition, inverses, logarithms, log equations and semi-log plots, with interactive graphs. Free.',
  },
  '/study/ap-physics-1/unit-2': {
    title: 'AP Physics 1: Algebra-Based Unit 2: Forces and Newton\'s Laws',
    description:
      'Systems, free-body diagrams, Newton\'s three laws, gravity and apparent weight, friction on an incline simulation, springs and circular motion. Free.',
  },
  '/study/ap-chemistry/unit-2': {
    title: 'AP Chemistry Unit 2: Compound Structure — Study Pack',
    description:
      'Bond types and electronegativity, potential energy curves, ionic solids, metals and alloys, Lewis diagrams, resonance, formal charge, VSEPR simulation. Free.',
  },
  '/study/ap-environmental-science/unit-2': {
    title: 'APES Unit 2: The Living World: Biodiversity — Study Pack',
    description:
      'Genetic, species and habitat diversity, ecosystem services, island biogeography with a graph, tolerance, disruptions, adaptation and succession. Free.',
  },
  '/study/ap-statistics/unit-2': {
    title: 'AP Statistics Unit 2: Probability and Distributions — Study Pack',
    description:
      'Two-way tables, probability rules, random variables, binomial and normal distributions, and the central limit theorem, with simulations. Free.',
  },
  '/study/ap-human-geography/unit-2': {
    title: 'AP Human Geography Unit 2: Population and Migration — Study Pack',
    description:
      'Density methods, population pyramids, the demographic transition with a simulation, Malthus, population policies, aging and migration. Free.',
  },
  '/study/ap-macroeconomics/unit-2': {
    title: 'AP Macroeconomics Unit 2: Indicators and Business Cycle — Pack',
    description:
      'GDP and its limits, unemployment with a labor-market simulation, CPI and inflation, real vs. nominal GDP, and the business cycle. Free.',
  },
  '/study/ap-microeconomics/unit-2': {
    title: 'AP Micro Unit 2: Supply, Demand and Elasticity Study Guide',
    description:
      'Free AP Microeconomics Unit 2 review: demand, supply, elasticity, consumer and producer surplus, price controls, taxes, tariffs, with a market simulation.',
  },
  '/ai-tutors': {
    title: 'AI Tutors for Every AP Subject — Apex Scholar',
    description:
      'Chat with an AI tutor trained on the College Board curriculum for your AP subject. Ask questions, walk through problems, and check your reasoning — free.',
  },
  '/practice-tests': {
    title: 'AP Practice Tests, Generated and Scored — Apex Scholar',
    description:
      'Generate AP practice tests by subject and unit, answer them timed, and get scored feedback with an explanation for every choice.',
  },
  '/smart-scheduler': {
    title: 'AP Study Scheduler with Schoology Sync — Apex Scholar',
    description:
      'Build a study plan around your real assignments and AP exam dates. Syncs with Schoology so your schedule reflects what is actually due.',
  },
  '/flashcards': {
    title: 'AP Flashcards with Spaced Repetition — Apex Scholar',
    description:
      'Create, study and share AP flashcard decks. Spaced repetition brings each card back exactly when you are about to forget it.',
  },
  '/solver': {
    title: 'AP Problem Solver — Photo or Text — Apex Scholar',
    description:
      'Photograph a problem or type it in and get a worked solution, step by step, for AP maths and science.',
  },
  '/practice': {
    title: 'AP Practice Hub — Tests, Flashcards, Review — Apex Scholar',
    description:
      'One place for AP practice: generated tests, flashcard decks, and a review queue built from the questions you got wrong.',
  },
  '/login': {
    // In the sitemap, so it needs its own canonical like any other URL.
    // Low search value, but a login page silently claiming to be the homepage
    // is exactly the bug this table exists to remove.
    title: 'Sign in — Apex Scholar',
    description: 'Sign in to Apex Scholar to save your progress, decks and study schedule across devices.',
  },
  '/privacy': {
    title: 'Privacy Policy — Apex Scholar',
    description: 'What Apex Scholar collects, why, and how to delete it.',
  },
  '/terms': {
    title: 'Terms of Service — Apex Scholar',
    description:
      'The terms that apply to using Apex Scholar, including acceptable use, account responsibilities and limits of liability.',
  },

  // Signed-in pages. Not in the sitemap, but useDocumentMeta never resets, so
  // without an entry a client-side hop from /flashcards to /progress left the
  // tab titled "AP Flashcards…" (and GA logged the page view under that title).
  '/progress': {
    title: 'Your Progress — Apex Scholar',
    description: 'Accuracy, streaks, weekly activity and measured weak spots across every AP subject you practise.',
  },
  '/review': {
    title: 'Review Queue — Apex Scholar',
    description: 'Spaced-repetition review of every practice question you missed, scheduled to come back before you forget it.',
  },
  '/classes': {
    title: 'Classes — Apex Scholar',
    description: 'Join a class or club with a link and compare practice-test accuracy on a shared leaderboard.',
  },
  '/diagnostics': {
    title: 'Diagnostics — Apex Scholar',
    description: 'A short diagnostic per AP subject that pinpoints which units you already know and which need work.',
  },
  '/settings': {
    title: 'Settings — Apex Scholar',
    description: 'Choose your AP subjects, personalise the AI tutor, and manage email preferences and integrations.',
  },
};

/** Meta for a path, or null when the route manages its own. */
export function metaFor(pathname) {
  if (!pathname) return null;
  // Trailing slashes are the same page; Netlify serves both.
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return ROUTE_META[p] || null;
}
