/**
 * Seeds public flashcard decks for AP subjects.
 * Contains pre-written deck data + AI generation fallback.
 */
import { getCurriculumData } from '../constants/curriculum/index';
import geminiService from '../services/geminiService';
import dataService from '../services/dataService';

const SYSTEM_USER_ID = 'apex-scholar-official';
const CREATOR_NAME = 'Apex Scholar';

// ── Pre-built deck data for top AP subjects ──────────────────
const STATIC_DECKS = [
  // ── AP Biology ──
  { subject: 'AP Biology', title: 'AP Biology — Unit 1: Chemistry of Life', topic: 'Unit 1: Chemistry of Life', difficulty: 'Medium',
    description: 'Water properties, macromolecules, and the chemical foundations of life.',
    cards: [
      { question: 'Why is water considered a polar molecule?', answer: 'Oxygen is more electronegative than hydrogen, creating an uneven charge distribution — partial negative on O, partial positive on H.' },
      { question: 'What are the four types of biological macromolecules?', answer: 'Carbohydrates, lipids, proteins, and nucleic acids.' },
      { question: 'What is a dehydration synthesis reaction?', answer: 'A reaction that joins two monomers by removing a water molecule, forming a covalent bond.' },
      { question: 'What bond holds water molecules together?', answer: 'Hydrogen bonds — weak individually but collectively give water its unique properties (cohesion, high specific heat, etc.).' },
      { question: 'What is the monomer of a protein?', answer: 'Amino acids, linked by peptide bonds.' },
      { question: 'How does pH affect enzyme activity?', answer: 'Each enzyme has an optimal pH; deviations denature the enzyme by altering its active site shape.' },
      { question: 'What is the difference between saturated and unsaturated fats?', answer: 'Saturated fats have no C=C double bonds (solid at room temp); unsaturated have one or more (liquid at room temp).' },
      { question: 'What functional group makes a molecule acidic?', answer: 'Carboxyl group (–COOH) — donates H⁺ ions.' },
      { question: 'What are the levels of protein structure?', answer: 'Primary (amino acid sequence), secondary (α-helices/β-sheets), tertiary (3D folding), quaternary (multiple polypeptide subunits).' },
      { question: 'What is hydrolysis?', answer: 'The breaking of a polymer into monomers by adding water.' },
    ]},
  { subject: 'AP Biology', title: 'AP Biology — Unit 2: Cell Structure and Function', topic: 'Unit 2: Cell Structure and Function', difficulty: 'Medium',
    description: 'Cell organelles, membrane transport, and compartmentalization.',
    cards: [
      { question: 'What is the fluid mosaic model?', answer: 'The cell membrane is a dynamic structure of a phospholipid bilayer with embedded proteins that can move laterally.' },
      { question: 'What is the difference between prokaryotic and eukaryotic cells?', answer: 'Prokaryotes lack a nucleus and membrane-bound organelles; eukaryotes have both.' },
      { question: 'What is the function of the rough endoplasmic reticulum?', answer: 'Synthesizes proteins (via ribosomes on its surface) and packages them for transport.' },
      { question: 'What is osmosis?', answer: 'The diffusion of water across a selectively permeable membrane from high to low water concentration.' },
      { question: 'What happens to an animal cell in a hypotonic solution?', answer: 'Water enters the cell by osmosis, causing it to swell and potentially lyse (burst).' },
      { question: 'What is the function of mitochondria?', answer: 'Cellular respiration — converting glucose and O₂ into ATP through oxidative phosphorylation.' },
      { question: 'What is active transport?', answer: 'Movement of molecules against their concentration gradient, requiring ATP energy.' },
      { question: 'What is the endomembrane system?', answer: 'A network including the nuclear envelope, ER, Golgi apparatus, lysosomes, and vesicles that work together in synthesis/transport.' },
      { question: 'What is the role of the Golgi apparatus?', answer: 'Modifies, sorts, and packages proteins and lipids for secretion or delivery to other organelles.' },
      { question: 'What is facilitated diffusion?', answer: 'Passive transport of molecules across a membrane through channel or carrier proteins, down the concentration gradient.' },
    ]},
  { subject: 'AP Biology', title: 'AP Biology — Unit 3: Cellular Energetics', topic: 'Unit 3: Cellular Energetics', difficulty: 'Medium',
    description: 'Photosynthesis, cellular respiration, and energy transfer.',
    cards: [
      { question: 'What is the overall equation for photosynthesis?', answer: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂' },
      { question: 'Where do the light reactions of photosynthesis occur?', answer: 'In the thylakoid membranes of the chloroplast.' },
      { question: 'What is the net ATP yield of cellular respiration?', answer: 'Approximately 30–32 ATP per glucose molecule (glycolysis + Krebs cycle + oxidative phosphorylation).' },
      { question: 'What is the role of NAD⁺ in cellular respiration?', answer: 'NAD⁺ is an electron carrier; it accepts electrons to become NADH, which delivers them to the electron transport chain.' },
      { question: 'What happens during glycolysis?', answer: 'Glucose (6C) is split into two pyruvate (3C) molecules, producing 2 ATP and 2 NADH. Occurs in the cytoplasm.' },
      { question: 'What is chemiosmosis?', answer: 'The flow of H⁺ ions through ATP synthase down their concentration gradient, driving ATP production.' },
      { question: 'What is the Calvin cycle?', answer: 'The light-independent reactions that fix CO₂ into G3P using ATP and NADPH. Occurs in the stroma.' },
      { question: 'What is fermentation?', answer: 'Anaerobic pathway that regenerates NAD⁺ from NADH so glycolysis can continue. Produces ethanol or lactate.' },
      { question: 'What is the role of oxygen in aerobic respiration?', answer: 'Oxygen is the final electron acceptor in the electron transport chain, forming water.' },
      { question: 'What connects glycolysis to the Krebs cycle?', answer: 'Pyruvate oxidation — pyruvate is converted to acetyl-CoA in the mitochondrial matrix, releasing CO₂ and producing NADH.' },
    ]},

  // ── AP Chemistry ──
  { subject: 'AP Chemistry', title: 'AP Chemistry — Unit 1: Atomic Structure', topic: 'Unit 1: Atomic Structure and Properties', difficulty: 'Medium',
    description: 'Atomic models, electron configurations, and periodic trends.',
    cards: [
      { question: 'What is the Aufbau principle?', answer: 'Electrons fill orbitals starting from the lowest energy level (1s) before moving to higher ones.' },
      { question: 'What is Hund\'s rule?', answer: 'Electrons fill degenerate (same-energy) orbitals singly before pairing, all with the same spin.' },
      { question: 'How does atomic radius change across a period?', answer: 'Decreases left to right — more protons pull electrons closer (higher effective nuclear charge).' },
      { question: 'What is ionization energy?', answer: 'The energy required to remove the outermost electron from a gaseous atom.' },
      { question: 'What is electron configuration of Fe (Z=26)?', answer: '1s²2s²2p⁶3s²3p⁶4s²3d⁶ — note 4s fills before 3d.' },
      { question: 'What is electronegativity?', answer: 'An atom\'s ability to attract shared electrons in a chemical bond. Increases up and to the right on the periodic table.' },
      { question: 'What are the quantum numbers?', answer: 'n (principal), l (angular momentum), mₗ (magnetic), mₛ (spin) — together they describe an electron\'s state.' },
      { question: 'Why do transition metals have variable oxidation states?', answer: 'Their d-orbitals are close in energy to the s-orbital, allowing loss of different numbers of electrons.' },
      { question: 'What is the photoelectric effect?', answer: 'Light above a threshold frequency ejects electrons from metal — evidence that light has particle nature (photons).' },
      { question: 'What is effective nuclear charge (Zeff)?', answer: 'The net positive charge experienced by valence electrons: Zeff ≈ Z − core electrons. Increases across a period.' },
    ]},
  { subject: 'AP Chemistry', title: 'AP Chemistry — Unit 3: Intermolecular Forces', topic: 'Unit 3: Intermolecular Forces and Properties', difficulty: 'Medium',
    description: 'IMFs, phase changes, and properties of solutions.',
    cards: [
      { question: 'What are the three types of intermolecular forces (strongest to weakest)?', answer: 'Hydrogen bonding > dipole-dipole > London dispersion forces (LDFs).' },
      { question: 'When do hydrogen bonds occur?', answer: 'When H is bonded to N, O, or F — highly electronegative atoms with lone pairs.' },
      { question: 'Why does ice float?', answer: 'Ice has a crystalline structure with hydrogen bonds holding molecules apart, making it less dense than liquid water.' },
      { question: 'What determines boiling point?', answer: 'Strength of intermolecular forces — stronger IMFs require more energy to overcome, raising the boiling point.' },
      { question: 'What are London dispersion forces?', answer: 'Temporary dipoles caused by random electron movement. Present in ALL molecules; strength increases with molar mass.' },
      { question: 'What is vapor pressure?', answer: 'The pressure exerted by a vapor in equilibrium with its liquid. Higher vapor pressure = weaker IMFs = more volatile.' },
      { question: 'What is the difference between adhesion and cohesion?', answer: 'Cohesion: attraction between molecules of the same substance. Adhesion: attraction between different substances.' },
      { question: 'How does polarity affect solubility?', answer: '"Like dissolves like" — polar solutes dissolve in polar solvents; nonpolar in nonpolar.' },
      { question: 'What is a phase diagram?', answer: 'A graph showing the stable phase of a substance at various temperatures and pressures, with lines at phase boundaries.' },
      { question: 'What is surface tension?', answer: 'The tendency of a liquid\'s surface to resist disruption, caused by cohesive forces pulling surface molecules inward.' },
    ]},

  // ── AP U.S. History ──
  { subject: 'AP U.S. History', title: 'AP US History — Period 1-2: Colonial America', topic: 'Period 1-2: Colonial America (1491–1754)', difficulty: 'Medium',
    description: 'European colonization, colonial society, and interactions with Native Americans.',
    cards: [
      { question: 'What was the Columbian Exchange?', answer: 'The widespread transfer of plants, animals, diseases, and technology between the Americas and the Old World after 1492.' },
      { question: 'What was the primary purpose of the Jamestown colony?', answer: 'Economic profit — established 1607 by the Virginia Company as a joint-stock venture seeking gold and trade routes.' },
      { question: 'What was the significance of the Mayflower Compact (1620)?', answer: 'First governing document of Plymouth Colony — established self-governance and majority rule, a precedent for democracy.' },
      { question: 'What was the encomienda system?', answer: 'Spanish colonial system granting colonists control over indigenous laborers in exchange for "Christianizing" them — effectively forced labor.' },
      { question: 'What was mercantilism?', answer: 'Economic theory that a nation\'s wealth is measured by gold/silver — colonies existed to enrich the mother country through favorable trade balance.' },
      { question: 'What was the Great Awakening (1730s–1740s)?', answer: 'A religious revival emphasizing personal faith and emotional preaching, challenging established churches and uniting colonists across regions.' },
      { question: 'What were the Navigation Acts?', answer: 'British laws requiring colonial trade to be conducted on British ships and certain goods (tobacco, sugar) shipped only to Britain.' },
      { question: 'What was Bacon\'s Rebellion (1676)?', answer: 'Virginia frontier farmers led by Nathaniel Bacon attacked Native Americans and burned Jamestown, protesting Governor Berkeley\'s policies. Led planters to shift from indentured servants to enslaved Africans.' },
      { question: 'What was the Middle Passage?', answer: 'The forced Atlantic voyage of enslaved Africans from West Africa to the Americas — horrific conditions with ~15% mortality rate.' },
      { question: 'How did Puritan and Chesapeake colonies differ?', answer: 'Puritans (New England): religious community, families, town meetings. Chesapeake: profit-driven, young single men, plantation economy, high mortality.' },
    ]},
  { subject: 'AP U.S. History', title: 'AP US History — Period 3: Revolution & Republic', topic: 'Period 3: Revolution and the New Republic (1754–1800)', difficulty: 'Medium',
    description: 'American Revolution, Constitution, and early republic.',
    cards: [
      { question: 'What was "no taxation without representation"?', answer: 'Colonial argument that Parliament couldn\'t tax them because they had no elected members in Parliament — central grievance leading to revolution.' },
      { question: 'What were the Articles of Confederation\'s main weaknesses?', answer: 'No power to tax, no executive branch, no national judiciary, unanimous consent to amend, each state had one vote regardless of size.' },
      { question: 'What was the Great Compromise at the Constitutional Convention?', answer: 'Created a bicameral legislature — House (proportional representation) and Senate (equal representation, 2 per state).' },
      { question: 'What was the 3/5 Compromise?', answer: 'Enslaved persons counted as 3/5 of a person for taxation and representation — gave Southern states more House seats.' },
      { question: 'What were the Federalist Papers?', answer: 'Essays by Hamilton, Madison, and Jay arguing for ratification of the Constitution. Federalist No. 10 (factions) and No. 51 (checks/balances) are most famous.' },
      { question: 'What was the significance of Shays\' Rebellion (1786)?', answer: 'Farmers\' uprising in Massachusetts exposed weakness of Articles of Confederation, catalyzing support for a stronger national government.' },
      { question: 'What was the Stamp Act (1765)?', answer: 'First direct tax on colonists — taxed printed materials. Prompted widespread protests and the Stamp Act Congress ("no taxation without representation").' },
      { question: 'What was Hamilton\'s financial plan?', answer: 'Federal assumption of state debts, creation of a national bank, and protective tariffs to strengthen the national economy. Opposed by Jefferson.' },
      { question: 'What established judicial review?', answer: 'Marbury v. Madison (1803) — Supreme Court can declare laws unconstitutional, establishing the judiciary as a co-equal branch.' },
      { question: 'What was the Whiskey Rebellion (1794)?', answer: 'Western PA farmers protested excise tax on whiskey. Washington sent militia to suppress it — demonstrated federal authority under the new Constitution.' },
    ]},

  // ── AP Psychology ──
  { subject: 'AP Psychology', title: 'AP Psychology — Unit 1: Scientific Foundations', topic: 'Unit 1: Scientific Foundations of Psychology', difficulty: 'Medium',
    description: 'Research methods, perspectives, and the history of psychology.',
    cards: [
      { question: 'What is the difference between an experiment and a correlational study?', answer: 'Experiments manipulate an independent variable to measure its effect (causation). Correlational studies measure relationships but cannot prove causation.' },
      { question: 'What is the independent variable (IV)?', answer: 'The variable the researcher manipulates/changes to test its effect on the dependent variable.' },
      { question: 'What is a double-blind study?', answer: 'Neither the participants nor the researchers know who is in the experimental vs. control group — reduces bias.' },
      { question: 'What is the difference between reliability and validity?', answer: 'Reliability: consistency of results over time. Validity: whether the test measures what it claims to measure.' },
      { question: 'What are the major psychological perspectives?', answer: 'Biological, behavioral, cognitive, humanistic, psychodynamic, sociocultural, and evolutionary.' },
      { question: 'What is a confounding variable?', answer: 'An uncontrolled variable that may influence the dependent variable, making it hard to determine if the IV caused the effect.' },
      { question: 'What is random assignment?', answer: 'Assigning participants to experimental or control groups by chance — ensures groups are equivalent at the start.' },
      { question: 'What is the placebo effect?', answer: 'Participants improve simply because they believe they are receiving treatment, not because of the treatment itself.' },
      { question: 'What is the difference between a case study and a survey?', answer: 'Case study: in-depth analysis of one individual. Survey: broad data collection from many people via questionnaires.' },
      { question: 'What did Sigmund Freud contribute to psychology?', answer: 'Founded psychoanalysis — emphasized unconscious mind, defense mechanisms, dream analysis, and psychosexual development stages.' },
    ]},
  { subject: 'AP Psychology', title: 'AP Psychology — Unit 2: Biological Bases of Behavior', topic: 'Unit 2: Biological Bases of Behavior', difficulty: 'Medium',
    description: 'Neurons, brain structure, neurotransmitters, and the nervous system.',
    cards: [
      { question: 'What is a neuron?', answer: 'A nerve cell that transmits electrical and chemical signals. Parts: dendrites (receive), soma (cell body), axon (transmit), terminal buttons (release neurotransmitters).' },
      { question: 'What is an action potential?', answer: 'A brief electrical charge that travels down an axon when the neuron fires — follows the all-or-none principle.' },
      { question: 'What does the amygdala do?', answer: 'Processes emotions, especially fear and aggression. Part of the limbic system.' },
      { question: 'What is the function of the hippocampus?', answer: 'Critical for forming new explicit/declarative memories. Damage causes anterograde amnesia.' },
      { question: 'What does serotonin regulate?', answer: 'Mood, sleep, appetite, and impulse control. Low levels linked to depression.' },
      { question: 'What is the difference between the sympathetic and parasympathetic nervous systems?', answer: 'Sympathetic: "fight or flight" (arousal). Parasympathetic: "rest and digest" (calming).' },
      { question: 'What is neuroplasticity?', answer: 'The brain\'s ability to reorganize by forming new neural connections — especially after injury or during learning.' },
      { question: 'What does dopamine do?', answer: 'Involved in reward, motivation, movement, and pleasure. Excess linked to schizophrenia; deficit linked to Parkinson\'s.' },
      { question: 'What is Broca\'s area responsible for?', answer: 'Speech production. Damage causes Broca\'s aphasia — can understand language but struggles to produce fluent speech.' },
      { question: 'What does the cerebellum do?', answer: 'Coordinates voluntary movement, balance, and motor learning. Located at the back/base of the brain.' },
    ]},

  // ── AP Calculus AB ──
  { subject: 'AP Calculus AB', title: 'AP Calculus AB — Unit 1-2: Limits & Differentiation', topic: 'Units 1-2: Limits and Differentiation', difficulty: 'Medium',
    description: 'Limits, continuity, and the basics of derivatives.',
    cards: [
      { question: 'What is the limit definition of a derivative?', answer: '$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$' },
      { question: 'What is the power rule?', answer: '$\\frac{d}{dx}[x^n] = nx^{n-1}$' },
      { question: 'What is the chain rule?', answer: '$\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)$' },
      { question: 'What are the conditions for continuity at x = a?', answer: '1) $f(a)$ exists, 2) $\\lim_{x \\to a} f(x)$ exists, 3) $\\lim_{x \\to a} f(x) = f(a)$' },
      { question: 'What is the product rule?', answer: '$\\frac{d}{dx}[f \\cdot g] = f\'g + fg\'$' },
      { question: 'What is the quotient rule?', answer: '$\\frac{d}{dx}\\left[\\frac{f}{g}\\right] = \\frac{f\'g - fg\'}{g^2}$' },
      { question: 'What does it mean if a limit equals infinity?', answer: 'The function grows without bound as x approaches that value — there is a vertical asymptote.' },
      { question: 'What is the derivative of $\\sin(x)$?', answer: '$\\cos(x)$' },
      { question: 'What is the derivative of $e^x$?', answer: '$e^x$ — the only function that is its own derivative.' },
      { question: 'What does the Intermediate Value Theorem state?', answer: 'If $f$ is continuous on $[a,b]$ and $N$ is between $f(a)$ and $f(b)$, then there exists $c \\in (a,b)$ where $f(c) = N$.' },
    ]},
  { subject: 'AP Calculus AB', title: 'AP Calculus AB — Unit 5-6: Integration', topic: 'Units 5-6: Integration and Accumulation', difficulty: 'Medium',
    description: 'Definite/indefinite integrals, FTC, and u-substitution.',
    cards: [
      { question: 'What is the Fundamental Theorem of Calculus (Part 1)?', answer: 'If $F\'(x) = f(x)$, then $\\int_a^b f(x)\\,dx = F(b) - F(a)$' },
      { question: 'What is the power rule for integration?', answer: '$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$ (where $n \\neq -1$)' },
      { question: 'What is u-substitution?', answer: 'A technique for integrating composite functions: let $u = g(x)$, then $du = g\'(x)\\,dx$, and substitute to simplify.' },
      { question: 'What does a definite integral represent geometrically?', answer: 'The net signed area between the curve $f(x)$ and the x-axis over $[a,b]$.' },
      { question: 'What is $\\int \\frac{1}{x}\\,dx$?', answer: '$\\ln|x| + C$' },
      { question: 'What is the average value of a function on [a,b]?', answer: '$f_{avg} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx$' },
      { question: 'What is the Fundamental Theorem of Calculus (Part 2)?', answer: '$\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$' },
      { question: 'What is $\\int e^x\\,dx$?', answer: '$e^x + C$' },
      { question: 'What is a Riemann sum?', answer: 'An approximation of area under a curve using rectangles. Can be left, right, or midpoint. $\\sum f(x_i)\\Delta x$' },
      { question: 'How do you find displacement vs. total distance from velocity?', answer: 'Displacement: $\\int_a^b v(t)\\,dt$. Total distance: $\\int_a^b |v(t)|\\,dt$.' },
    ]},

  // ── AP World History ──
  { subject: 'AP World History: Modern', title: 'AP World History — Unit 1-2: Global Interactions', topic: 'Units 1-2: The Global Tapestry & Networks of Exchange', difficulty: 'Medium',
    description: 'Pre-1450 civilizations, trade networks, and cultural exchanges.',
    cards: [
      { question: 'What was the Silk Road?', answer: 'A network of overland trade routes connecting China to the Mediterranean, facilitating exchange of goods (silk, spices), ideas, and diseases.' },
      { question: 'What was the Mongol Empire\'s impact on trade?', answer: 'Pax Mongolica created safe trade corridors across Eurasia, boosting Silk Road commerce and cultural exchange (13th-14th century).' },
      { question: 'What was the Indian Ocean trade network?', answer: 'Maritime trade connecting East Africa, Arabia, India, and Southeast Asia using monsoon winds — exchanged spices, textiles, and ideas.' },
      { question: 'What was the Song Dynasty known for?', answer: 'Economic revolution in China (960-1279): paper money, gunpowder, compass, movable type printing, rice cultivation, urbanization.' },
      { question: 'What was the Mali Empire?', answer: 'West African empire (13th-16th century) controlling gold-salt trade. Mansa Musa\'s hajj (1324) displayed its immense wealth to the world.' },
      { question: 'What was the Abbasid Caliphate\'s Golden Age?', answer: 'Period of scientific, cultural, and intellectual achievements in the Islamic world — algebra, optics, medicine, House of Wisdom in Baghdad.' },
      { question: 'What was the Byzantine Empire?', answer: 'Eastern continuation of Rome centered on Constantinople — preserved Greco-Roman culture, Orthodox Christianity, Justinian\'s Code.' },
      { question: 'What was feudalism?', answer: 'Medieval European political system: lords granted land (fiefs) to vassals in exchange for military service. Peasants/serfs worked the land.' },
      { question: 'What was the Swahili Coast?', answer: 'East African trading cities blending Bantu and Arab cultures — Kiswahili language, Islam, and Indian Ocean trade connections.' },
      { question: 'What was the Aztec tribute system?', answer: 'Aztecs (Mexica) demanded tribute from conquered peoples — goods, labor, and human sacrifice victims — maintaining empire through fear and trade.' },
    ]},

  // ── AP Computer Science A ──
  { subject: 'AP Computer Science A', title: 'AP CS A — Unit 1-3: Fundamentals & Conditionals', topic: 'Units 1-3: Primitives, Objects, and Conditionals', difficulty: 'Medium',
    description: 'Java basics, variables, methods, boolean logic, and control flow.',
    cards: [
      { question: 'What is the difference between int and double?', answer: 'int stores whole numbers (32-bit); double stores decimal numbers (64-bit floating point). int division truncates: 5/2 = 2.' },
      { question: 'What is the difference between == and .equals()?', answer: '== compares references (memory addresses) for objects, values for primitives. .equals() compares the content/value of objects (like Strings).' },
      { question: 'What is a constructor?', answer: 'A special method called when creating an object with "new". Has the same name as the class and no return type.' },
      { question: 'What is the difference between static and instance methods?', answer: 'Static methods belong to the class (called with ClassName.method()). Instance methods belong to objects (called with object.method()).' },
      { question: 'What are the logical operators in Java?', answer: '&& (AND), || (OR), ! (NOT). Short-circuit: && stops if first is false; || stops if first is true.' },
      { question: 'What is autoboxing/unboxing?', answer: 'Autoboxing: automatic conversion of primitive to wrapper (int → Integer). Unboxing: wrapper to primitive (Integer → int).' },
      { question: 'What is String immutability?', answer: 'Strings cannot be changed after creation. Methods like substring() and concat() return NEW strings.' },
      { question: 'What is the scope of a variable?', answer: 'The region of code where the variable can be accessed. Local variables exist only within their method/block.' },
      { question: 'What does Math.random() return?', answer: 'A double in range [0.0, 1.0). For random int in [min, max]: (int)(Math.random() * (max - min + 1)) + min.' },
      { question: 'What is a NullPointerException?', answer: 'Thrown when calling a method on a reference variable that is null (doesn\'t point to any object).' },
    ]},

  // ── AP Statistics ──
  { subject: 'AP Statistics', title: 'AP Statistics — Unit 1-2: Exploring Data', topic: 'Units 1-2: Exploring One and Two Variable Data', difficulty: 'Medium',
    description: 'Distributions, summary statistics, and scatterplots.',
    cards: [
      { question: 'What is the difference between mean and median?', answer: 'Mean: arithmetic average (sensitive to outliers). Median: middle value when ordered (resistant to outliers).' },
      { question: 'What does standard deviation measure?', answer: 'The average distance of data points from the mean — measures spread/variability.' },
      { question: 'What is a normal distribution?', answer: 'Bell-shaped, symmetric distribution. ~68% within 1 SD, ~95% within 2 SD, ~99.7% within 3 SD of the mean (empirical rule).' },
      { question: 'What is the IQR?', answer: 'Interquartile Range = Q3 − Q1. Measures spread of the middle 50% of data. Outlier rule: < Q1 − 1.5·IQR or > Q3 + 1.5·IQR.' },
      { question: 'What is a z-score?', answer: '$z = \\frac{x - \\mu}{\\sigma}$ — number of standard deviations a value is from the mean.' },
      { question: 'What does correlation (r) measure?', answer: 'Strength and direction of the LINEAR relationship between two quantitative variables. Range: −1 to +1.' },
      { question: 'What is the coefficient of determination (r²)?', answer: 'The proportion of variability in y that is explained by the linear regression on x. r² = 0.81 means 81% of variation explained.' },
      { question: 'What is a residual?', answer: 'Residual = observed y − predicted ŷ. Positive = above the line, negative = below.' },
      { question: 'What makes a distribution skewed right?', answer: 'The tail extends to the right (toward larger values). Mean > Median in right-skewed distributions.' },
      { question: 'What is the least-squares regression line (LSRL)?', answer: '$\\hat{y} = a + bx$ where $b = r \\cdot \\frac{s_y}{s_x}$ and $a = \\bar{y} - b\\bar{x}$. Minimizes sum of squared residuals.' },
    ]},

  // ── AP Physics 1 ──
  { subject: 'AP Physics 1: Algebra-Based', title: 'AP Physics 1 — Unit 1-2: Kinematics & Dynamics', topic: 'Units 1-2: Kinematics and Dynamics', difficulty: 'Medium',
    description: 'Motion, forces, Newton\'s laws, and free-body diagrams.',
    cards: [
      { question: 'What are Newton\'s three laws of motion?', answer: '1st: Object stays at rest or constant velocity unless acted on by net force. 2nd: F = ma. 3rd: Every action has an equal and opposite reaction.' },
      { question: 'What is the difference between speed and velocity?', answer: 'Speed is scalar (magnitude only). Velocity is a vector (magnitude + direction).' },
      { question: 'What are the kinematic equations?', answer: '$v = v_0 + at$, $x = x_0 + v_0t + \\frac{1}{2}at^2$, $v^2 = v_0^2 + 2a\\Delta x$' },
      { question: 'What is free fall?', answer: 'Motion under gravity alone. Acceleration = g ≈ 9.8 m/s² downward (air resistance neglected).' },
      { question: 'What is friction?', answer: 'Force opposing relative motion between surfaces. Static friction ($f_s \\leq \\mu_s N$) prevents motion; kinetic ($f_k = \\mu_k N$) opposes sliding.' },
      { question: 'What is a free-body diagram?', answer: 'A diagram showing all forces acting on an object as vectors from its center — essential for applying Newton\'s 2nd law.' },
      { question: 'What is the normal force?', answer: 'The contact force perpendicular to a surface that prevents objects from passing through each other.' },
      { question: 'What is projectile motion?', answer: 'Motion with constant horizontal velocity and constant vertical acceleration (g). Horizontal and vertical components are independent.' },
      { question: 'What does "net force = 0" mean?', answer: 'The object is in equilibrium — either at rest or moving at constant velocity (Newton\'s 1st law).' },
      { question: 'What is the weight of an object?', answer: '$W = mg$ where m is mass and g is gravitational acceleration. Weight is a force measured in Newtons.' },
    ]},

  // ── AP Human Geography ──
  { subject: 'AP Human Geography', title: 'AP Human Geography — Unit 1-2: Thinking Geographically', topic: 'Units 1-2: Thinking Geographically & Population', difficulty: 'Medium',
    description: 'Geographic concepts, population patterns, and migration.',
    cards: [
      { question: 'What is the difference between site and situation?', answer: 'Site: physical characteristics of a place (terrain, climate). Situation: location relative to other places (accessibility, connectivity).' },
      { question: 'What is the Demographic Transition Model (DTM)?', answer: '4 stages: 1) High birth/death rates, 2) Death rate drops (medical advances), 3) Birth rate drops (urbanization), 4) Low birth/death rates.' },
      { question: 'What are push and pull factors?', answer: 'Push: reasons to leave (war, poverty, disaster). Pull: reasons to move somewhere (jobs, safety, freedom).' },
      { question: 'What is Ravenstein\'s "Laws of Migration"?', answer: 'Most migrants move short distances; long-distance migrants go to cities; every migration produces a counter-migration; rural residents migrate more.' },
      { question: 'What is the difference between arithmetic and physiological density?', answer: 'Arithmetic: total pop ÷ total land area. Physiological: total pop ÷ arable land. Physiological better indicates food pressure.' },
      { question: 'What is Zelinsky\'s mobility transition model?', answer: 'Migration patterns change with DTM stage: Stage 1 = little migration; Stage 2 = rural-to-urban; Stage 3-4 = urban-to-suburban, international.' },
      { question: 'What is the dependency ratio?', answer: 'Ratio of non-working-age (0-14 + 65+) to working-age (15-64) population. High ratio = economic burden on workers.' },
      { question: 'What is a population pyramid?', answer: 'Age-sex graph showing population distribution. Expansive (wide base) = growing; constrictive (narrow base) = aging/declining.' },
      { question: 'What is the rate of natural increase (RNI)?', answer: 'Birth rate minus death rate (excluding migration). Expressed as a percentage. Global RNI is ~1.1%.' },
      { question: 'What is the difference between forced and voluntary migration?', answer: 'Forced: refugees, slavery, ethnic cleansing (no choice). Voluntary: economic migrants, students (personal decision).' },
    ]},

  // ── AP Macroeconomics ──
  { subject: 'AP Macroeconomics', title: 'AP Macroeconomics — Core Concepts', topic: 'Core Macroeconomic Concepts', difficulty: 'Medium',
    description: 'GDP, fiscal policy, monetary policy, and aggregate demand/supply.',
    cards: [
      { question: 'What is GDP?', answer: 'Gross Domestic Product — the total market value of all final goods and services produced within a country in a given period.' },
      { question: 'What is the GDP formula (expenditure approach)?', answer: 'GDP = C + I + G + (X − M) — Consumption + Investment + Government spending + Net exports.' },
      { question: 'What is the difference between fiscal and monetary policy?', answer: 'Fiscal: government spending and taxation (Congress). Monetary: money supply and interest rates (Federal Reserve).' },
      { question: 'What is inflation?', answer: 'A sustained increase in the general price level. Measured by CPI (Consumer Price Index). Reduces purchasing power of money.' },
      { question: 'What is the Phillips Curve?', answer: 'Shows the short-run inverse relationship between inflation and unemployment. Low unemployment → high inflation and vice versa.' },
      { question: 'What shifts aggregate demand right?', answer: 'Increased consumption, investment, government spending, or net exports. Also: tax cuts, increased money supply, consumer confidence.' },
      { question: 'What are the Fed\'s three monetary policy tools?', answer: '1) Open market operations (buy/sell bonds), 2) Federal funds rate (discount rate), 3) Reserve requirements.' },
      { question: 'What is the money multiplier?', answer: 'Money multiplier = 1 / reserve ratio. If RR = 10%, multiplier = 10. Initial deposit of $100 creates up to $1000 in total money supply.' },
      { question: 'What is the difference between real and nominal GDP?', answer: 'Nominal: measured in current prices. Real: adjusted for inflation (constant prices). Real GDP better measures actual economic growth.' },
      { question: 'What causes stagflation?', answer: 'Simultaneous high inflation and high unemployment — typically from negative supply shock (e.g., oil crisis). Shifts AS left.' },
    ]},

  // ── AP Environmental Science ──
  { subject: 'AP Environmental Science', title: 'AP Environmental Science — Core Concepts', topic: 'Ecosystems, Biodiversity, and Human Impact', difficulty: 'Medium',
    description: 'Ecosystems, biogeochemical cycles, and environmental challenges.',
    cards: [
      { question: 'What is biodiversity?', answer: 'The variety of life at all levels: genetic diversity, species diversity, and ecosystem diversity.' },
      { question: 'What is the difference between weather and climate?', answer: 'Weather: short-term atmospheric conditions. Climate: long-term average weather patterns over 30+ years in a region.' },
      { question: 'What is the greenhouse effect?', answer: 'CO₂, CH₄, and other gases trap infrared radiation in the atmosphere, warming Earth\'s surface. Enhanced by human emissions.' },
      { question: 'What is an ecological footprint?', answer: 'The amount of biologically productive land/water needed to support a person\'s resource consumption and waste absorption.' },
      { question: 'What is eutrophication?', answer: 'Excess nutrients (N, P) in water cause algal blooms → decomposition depletes O₂ → dead zones. Often from agricultural runoff.' },
      { question: 'What is the 10% rule?', answer: 'Only ~10% of energy is transferred between trophic levels. The rest is lost as heat through cellular respiration.' },
      { question: 'What is the difference between primary and secondary succession?', answer: 'Primary: colonization of bare rock/new land (no soil). Secondary: recovery after disturbance where soil remains (fire, farming).' },
      { question: 'What is the carbon cycle?', answer: 'Carbon moves through atmosphere (CO₂), organisms (photosynthesis/respiration), oceans (dissolution), and lithosphere (fossil fuels, limestone).' },
      { question: 'What is an invasive species?', answer: 'A non-native species that disrupts ecosystems — lacks natural predators, outcompetes natives. Examples: kudzu, zebra mussels.' },
      { question: 'What is the Clean Air Act?', answer: 'U.S. law regulating air emissions and setting National Ambient Air Quality Standards (NAAQS) for six criteria pollutants.' },
    ]},

  // ── AP English Language ──
  { subject: 'AP English Language and Composition', title: 'AP English Language — Rhetorical Analysis', topic: 'Rhetorical Analysis and Argumentation', difficulty: 'Medium',
    description: 'Rhetorical strategies, logical fallacies, and argumentative techniques.',
    cards: [
      { question: 'What are ethos, pathos, and logos?', answer: 'Ethos: credibility/authority of speaker. Pathos: emotional appeal. Logos: logical reasoning and evidence.' },
      { question: 'What is a rhetorical situation?', answer: 'The context of communication: speaker, audience, subject, purpose, and occasion (SOAPS).' },
      { question: 'What is a straw man fallacy?', answer: 'Misrepresenting someone\'s argument to make it easier to attack — arguing against a weaker version of the actual claim.' },
      { question: 'What is the difference between a claim and a thesis?', answer: 'Claim: any arguable statement. Thesis: the central claim of an essay — the main argument the writer defends throughout.' },
      { question: 'What is juxtaposition?', answer: 'Placing two contrasting ideas/images side by side to highlight their differences. Example: wealth next to poverty.' },
      { question: 'What is an ad hominem fallacy?', answer: 'Attacking the person making the argument rather than the argument itself.' },
      { question: 'What is a concession and rebuttal?', answer: 'Concession: acknowledging the opposing view\'s valid points. Rebuttal: explaining why your argument is still stronger.' },
      { question: 'What is tone vs. mood?', answer: 'Tone: the author\'s attitude toward the subject (sarcastic, earnest). Mood: the emotional atmosphere experienced by the reader.' },
      { question: 'What is anaphora?', answer: 'Repetition of a word/phrase at the beginning of successive clauses. Example: MLK\'s "I have a dream..."' },
      { question: 'What is the difference between deductive and inductive reasoning?', answer: 'Deductive: general principle → specific conclusion (if premises true, conclusion certain). Inductive: specific observations → general conclusion (probable, not certain).' },
    ]},

  // ── AP U.S. Government ──
  { subject: 'AP U.S. Government and Politics', title: 'AP US Government — Foundations & Federalism', topic: 'Foundations of American Democracy & Federalism', difficulty: 'Medium',
    description: 'Constitutional principles, federalism, and the structure of government.',
    cards: [
      { question: 'What are the six principles of the Constitution?', answer: 'Popular sovereignty, limited government, separation of powers, checks and balances, judicial review, and federalism.' },
      { question: 'What is federalism?', answer: 'Division of power between national and state governments. Enumerated powers (federal), reserved powers (states), concurrent powers (shared).' },
      { question: 'What is the Supremacy Clause?', answer: 'Article VI: federal law is the "supreme law of the land" — when state and federal laws conflict, federal law wins.' },
      { question: 'What is the elastic clause?', answer: 'Article I, Section 8: Congress can make laws "necessary and proper" for executing its powers — basis for implied powers.' },
      { question: 'What is the Commerce Clause?', answer: 'Gives Congress power to regulate interstate commerce — broadly interpreted to expand federal authority (Gibbons v. Ogden).' },
      { question: 'What are checks and balances?', answer: 'Each branch can limit the others: president vetoes laws, Congress overrides vetoes (2/3), courts declare laws unconstitutional.' },
      { question: 'What is the Bill of Rights?', answer: 'First 10 amendments protecting individual liberties: speech, religion, press, assembly, arms, due process, etc.' },
      { question: 'What is the difference between civil liberties and civil rights?', answer: 'Civil liberties: freedoms FROM government action (1st Amendment). Civil rights: protections FROM discrimination (14th Amendment equal protection).' },
      { question: 'What did McCulloch v. Maryland (1819) establish?', answer: 'Federal supremacy over states + implied powers. Maryland couldn\'t tax the national bank. "Power to tax is the power to destroy."' },
      { question: 'What is selective incorporation?', answer: 'The process by which the Supreme Court applies Bill of Rights protections to state governments through the 14th Amendment\'s Due Process Clause.' },
    ]},

  // ── AP Microeconomics ──
  { subject: 'AP Microeconomics', title: 'AP Microeconomics — Supply, Demand, & Market Structures', topic: 'Supply, Demand, and Market Structures', difficulty: 'Medium',
    description: 'Market equilibrium, elasticity, and types of competition.',
    cards: [
      { question: 'What is the law of demand?', answer: 'As price increases, quantity demanded decreases (inverse relationship), ceteris paribus.' },
      { question: 'What shifts the demand curve?', answer: 'Changes in income, tastes, prices of related goods, expectations, and number of buyers (not price changes — those move along the curve).' },
      { question: 'What is price elasticity of demand?', answer: '$E_d = \\frac{\\% \\Delta Q_d}{\\% \\Delta P}$. |Ed| > 1 = elastic, |Ed| < 1 = inelastic, |Ed| = 1 = unit elastic.' },
      { question: 'What is consumer surplus?', answer: 'The difference between what consumers are willing to pay and what they actually pay. Area above price, below demand curve.' },
      { question: 'What is marginal cost?', answer: 'The additional cost of producing one more unit. MC curve is U-shaped due to diminishing marginal returns.' },
      { question: 'What is the profit-maximizing rule?', answer: 'Produce where MR = MC (marginal revenue equals marginal cost).' },
      { question: 'What defines perfect competition?', answer: 'Many firms, identical products, easy entry/exit, price takers. Long-run: zero economic profit, P = MC = min ATC.' },
      { question: 'What defines a monopoly?', answer: 'Single seller, unique product, high barriers to entry. Price maker. Produces where MR = MC, charges on demand curve above.' },
      { question: 'What is a price ceiling?', answer: 'Maximum legal price set below equilibrium → creates shortage (Qd > Qs). Example: rent control.' },
      { question: 'What is an externality?', answer: 'A cost or benefit to a third party not involved in the transaction. Negative: pollution. Positive: education.' },
    ]},
];

/**
 * Seed pre-built public flashcard decks into Firestore.
 * @param {string} userId - The authenticated user's UID (required by Firestore rules)
 * @param {function} onProgress - callback(message, current, total)
 * @returns {Promise<{created: number, failed: number}>}
 */
export async function seedAllPublicDecks(userId, onProgress) {
  if (!userId) throw new Error('userId is required — must be logged-in admin');
  let created = 0;
  let failed = 0;
  const total = STATIC_DECKS.length;

  for (let i = 0; i < STATIC_DECKS.length; i++) {
    const deck = STATIC_DECKS[i];
    onProgress?.(`Saving: ${deck.title}`, i + 1, total);

    try {
      await dataService.saveFlashcardDeck(userId, {
        title: deck.title,
        subject: deck.subject,
        topic: deck.topic,
        cards: deck.cards,
        cardCount: deck.cards.length,
        difficulty: deck.difficulty,
        description: deck.description,
        isPublic: true,
        creatorName: CREATOR_NAME,
        isManual: false,
      });
      created++;
    } catch (err) {
      console.error(`Failed to seed: ${deck.title}`, err);
      failed++;
    }
  }

  return { created, failed };
}

/**
 * AI-powered generation: generates additional decks for subjects not in STATIC_DECKS.
 * Requires a working AI service (Puter or Gemini API key).
 */
export async function seedAIDecks(onProgress) {
  let created = 0;
  let failed = 0;

  const staticSubjects = new Set(STATIC_DECKS.map(d => `${d.subject}|${d.topic}`));

  const EXTRA_SUBJECTS = [
    'AP Calculus BC', 'AP Physics 2: Algebra-Based',
    'AP European History', 'AP Computer Science Principles',
  ];

  for (const subject of EXTRA_SUBJECTS) {
    let curriculum;
    try {
      curriculum = await getCurriculumData(subject);
    } catch { continue; }
    if (!curriculum?.units?.length) continue;

    for (let i = 0; i < Math.min(curriculum.units.length, 3); i++) {
      const unit = curriculum.units[i];
      const unitName = unit.name || `Unit ${i + 1}`;
      const key = `${subject}|${unitName}`;
      if (staticSubjects.has(key)) continue;

      const topics = (unit.topics || []).slice(0, 5).join(', ');
      onProgress?.(`Generating: ${subject} — ${unitName}`, created, -1);

      try {
        const cards = await geminiService.generateFlashcards(subject, topics || unitName, 12, 'Medium');
        if (!cards || cards.length < 3) { failed++; continue; }

        await dataService.saveFlashcardDeck(SYSTEM_USER_ID, {
          title: `${curriculum.name || subject} — ${unitName}`,
          subject, topic: unitName, cards, cardCount: cards.length,
          difficulty: 'Medium',
          description: `Study deck covering ${unitName}. Topics: ${topics || 'Core concepts'}.`,
          isPublic: true, creatorName: CREATOR_NAME, isManual: false,
        });
        created++;
        await new Promise(r => setTimeout(r, 2000));
      } catch {
        failed++;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  return { created, failed };
}

export { SYSTEM_USER_ID, CREATOR_NAME, STATIC_DECKS };
