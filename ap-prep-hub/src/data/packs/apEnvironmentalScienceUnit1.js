/**
 * AP Environmental Science Unit 1: The Living World: Ecosystems — study pack.
 *
 * Written against the AP Environmental Science CED (effective Fall 2026,
 * topics 1.1–1.11, enduring understandings ERT-1 and ENG-1). Sticks to what
 * the essential knowledge names: the three symbioses, the nine terrestrial
 * biomes it lists, the five nitrogen-cycle steps, "about 10%" for energy
 * transfer, and productivity in kcal/m²/yr. The exam leans on reading cycle
 * diagrams and doing the 10% arithmetic, so those get the worked examples.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-environmental-science/unit-1',
  subject: 'AP Environmental Science',
  unit: 'Unit 1: The Living World: Ecosystems',
  examWeight: '6–8% of the exam',
  intro:
    'Ecosystems run on two things: matter that cycles (carbon, nitrogen, phosphorus, water) and energy that flows one way, ' +
    'from the sun through producers to consumers, losing most of itself as heat at every step. This unit is about how species ' +
    'interact, where the biomes are, and how to read and calculate those cycles and flows.',
  sections: [
    {
      id: '1.1',
      ced: 'ERT-1.A',
      title: 'Introduction to Ecosystems',
      minutes: 4,
      summary:
        'Species interact as predator and prey, through symbiosis (mutualism, commensalism, parasitism), and through competition ' +
        'for limited resources. Resource partitioning, using a resource in different ways, places or times, reduces competition.',
      body: String.raw`### How species interact
| Interaction | Who benefits? | Example |
|---|---|---|
| **Predator–prey** | Predator +, prey − | Wolves eating elk |
| **Mutualism** (symbiosis) | Both + | Bees and flowers; coral and the algae living in it |
| **Commensalism** (symbiosis) | One +, other unaffected | Barnacles riding on a whale |
| **Parasitism** (symbiosis) | Parasite +, host − | Ticks on a deer |
| **Competition** | Both − | Two plant species competing for the same light and water |

**Symbiosis** means a close, long-term interaction between two species: mutualism, commensalism and parasitism are its three types.

### Competition and resource partitioning
Competition happens **within** a species or **between** species whenever resources are limited. Species reduce it by **resource partitioning**:
- **Temporal**: using the resource at different **times** (hawks hunt by day, owls by night).
- **Spatial**: using it in different **places** (warblers feeding on different parts of the same tree).
- **Morphological**: using it in different **ways**, thanks to different body features (birds with different beak sizes eating different seeds).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Mutualism', back: 'Both species benefit (+/+).' },
            { front: 'Commensalism', back: 'One benefits, the other is unaffected (+/0).' },
            { front: 'Parasitism', back: 'One benefits at the host\'s expense (+/−), usually without killing it quickly.' },
            { front: 'Resource partitioning', back: 'Using a shared resource at different times, in different places, or in different ways, so competition drops.' },
          ],
        },
      ],
      precheck: {
        question: 'Oxpecker birds eat ticks off a rhinoceros. The birds get food and the rhino loses its parasites. This relationship is:',
        choices: ['Mutualism', 'Commensalism', 'Parasitism', 'Competition'],
        answer: 0,
        explanations: [
          'Correct. Both species benefit.',
          'Incorrect. In commensalism one species is unaffected, but the rhino benefits here.',
          'Incorrect. Neither species is harmed (the ticks are the parasites, and they are not part of this pair).',
          'Incorrect. They are not competing for a shared, limited resource.',
        ],
      },
      checkpoints: [
        {
          question: 'Two species of warbler feed in the same spruce trees, but one feeds near the top and the other near the trunk. This is an example of:',
          choices: ['Resource partitioning', 'Mutualism', 'Predation', 'Commensalism'],
          answer: 0,
          explanations: [
            'Correct. They split a shared resource by place (spatial partitioning), which reduces competition.',
            'Incorrect. The warblers aren\'t helping each other; they are avoiding competing.',
            'Incorrect. Neither species eats the other.',
            'Incorrect. Commensalism is one species benefiting while the other is unaffected; this is about sharing a resource.',
          ],
        },
        {
          question: 'A tapeworm lives in a dog\'s intestine and absorbs nutrients the dog has digested. This is:',
          choices: ['Parasitism', 'Mutualism', 'Commensalism', 'Resource partitioning'],
          answer: 0,
          explanations: [
            'Correct. The tapeworm benefits and the dog, the host, is harmed.',
            'Incorrect. The dog gets nothing from the tapeworm.',
            'Incorrect. The dog is harmed, not unaffected.',
            'Incorrect. Resource partitioning is how competing species share a resource.',
          ],
        },
      ],
      revisit:
        'Mutualism +/+, commensalism +/0, parasitism +/− (all three are symbiosis). Competition −/−, reduced by partitioning the resource ' +
        'by time, place or way of use.',
    },
    {
      id: '1.2',
      ced: 'ERT-1.B',
      title: 'Terrestrial Biomes',
      minutes: 5,
      summary:
        'A biome is a set of plant and animal communities adapted to a particular climate. The major terrestrial biomes are taiga, ' +
        'temperate rainforest, temperate seasonal forest, tropical rainforest, shrubland, temperate grassland, savanna, desert and tundra. ' +
        'Climate, latitude, altitude, soil and nutrients shape where they are, and their distribution shifts as the climate changes.',
      body: String.raw`### Climate sets the biome
Temperature and precipitation decide which plants can grow, and the plants decide the rest of the community.

| Biome | Climate | Plants and soil |
|---|---|---|
| **Tundra** | Very cold, little precipitation | Low shrubs, mosses; permafrost below |
| **Taiga** (boreal forest) | Cold, moderate precipitation | Conifers; acidic, nutrient-poor soil |
| **Temperate rainforest** | Mild, very wet (coastal) | Huge conifers, mosses |
| **Temperate seasonal forest** | Warm summers, cold winters | Deciduous trees; fertile soil |
| **Tropical rainforest** | Hot and wet all year | Highest biodiversity; nutrient-poor soil (nutrients are held in the plants) |
| **Shrubland** (chaparral) | Hot, dry summers; mild, rainy winters | Fire-adapted shrubs |
| **Temperate grassland** | Hot summers, cold winters, moderate rain | Grasses, few trees; very fertile soil |
| **Savanna** | Warm all year, wet and dry seasons | Grasses with scattered trees |
| **Desert** | Very little precipitation | Drought-adapted plants like cacti |

### What else shapes the map
Resources such as water and lumber are unevenly spread because of **climate, geography, latitude and altitude, nutrient availability and soil**. Biome boundaries aren't fixed: they have moved before and may shift again as the global climate changes.`,
      blocks: [],
      precheck: {
        question: 'Which biome has cold temperatures, coniferous forests, and acidic, nutrient-poor soil?',
        choices: ['Taiga', 'Tropical rainforest', 'Savanna', 'Temperate grassland'],
        answer: 0,
        explanations: [
          'Correct. The taiga (boreal forest) is cold and dominated by conifers, whose needles make the soil acidic.',
          'Incorrect. Tropical rainforests are hot and wet with broadleaf trees.',
          'Incorrect. Savannas are warm grasslands with scattered trees.',
          'Incorrect. Temperate grasslands have few trees and very fertile soil.',
        ],
      },
      checkpoints: [
        {
          question: 'Tropical rainforests have the highest biodiversity on land, yet their soils are often poor for farming once cleared. Why?',
          choices: [
            'Most nutrients are held in the living plants, and heavy rain leaches nutrients from the thin soil',
            'The soil is frozen most of the year',
            'Low precipitation prevents decomposition',
            'Frequent fires burn away the organic matter',
          ],
          answer: 0,
          explanations: [
            'Correct. Decomposition and uptake are fast, so nutrients sit in the vegetation, and constant rain washes the rest out.',
            'Incorrect. That describes permafrost in the tundra.',
            'Incorrect. Tropical rainforests are among the wettest biomes.',
            'Incorrect. Frequent fire is typical of shrubland, not rainforest.',
          ],
        },
        {
          question: 'Which factor would most directly cause a biome\'s boundary to shift over decades?',
          choices: ['A change in regional temperature and precipitation', 'A change in the number of species named there', 'A new political border', 'The time of day measurements are taken'],
          answer: 0,
          explanations: [
            'Correct. Biomes are defined by climate, so a lasting climate change moves where each biome\'s plants can grow.',
            'Incorrect. Naming species doesn\'t change the climate or the community.',
            'Incorrect. Political borders don\'t change which plants can grow.',
            'Incorrect. Daily cycles don\'t move biome boundaries.',
          ],
        },
      ],
      revisit:
        'Biomes follow climate (temperature + precipitation). Taiga: cold conifers, acidic soil. Tropical rainforest: hot, wet, poor soil. ' +
        'Grassland: fertile soil. Shrubland: fire-adapted. Desert: very dry. Tundra: permafrost. Distributions shift with climate.',
    },
    {
      id: '1.3',
      ced: 'ERT-1.C',
      title: 'Aquatic Biomes',
      minutes: 4,
      summary:
        'Freshwater biomes (streams, rivers, ponds, lakes) supply drinking water. Marine biomes (oceans, coral reefs, marshland, ' +
        'estuaries) include algae that produce much of Earth\'s oxygen and absorb CO₂. Salinity, depth, turbidity, nutrients and ' +
        'temperature decide which organisms live where.',
      body: String.raw`### Freshwater and marine
- **Freshwater**: streams, rivers, ponds and lakes. A vital source of **drinking water**.
- **Marine**: oceans, coral reefs, marshland and estuaries. **Algae** in marine biomes supply a large share of Earth's **oxygen** and take in **carbon dioxide** from the atmosphere.

| Biome | What to know |
|---|---|
| **Estuary** | Where a river meets the sea: fresh and salt water mix; very productive nursery habitat |
| **Salt marsh** | Coastal wetland in estuaries; filters runoff, buffers storms |
| **Coral reef** | Warm, shallow, clear water; very high biodiversity built on coral–algae mutualism |
| **Open ocean** | Low productivity per area (few nutrients), but huge in total |

### What sets the distribution of marine life
**Salinity, depth, turbidity** (cloudiness, which blocks light), **nutrient availability** and **temperature**.`,
      blocks: [],
      precheck: {
        question: 'An estuary is best described as:',
        choices: [
          'An area where a river meets the ocean and fresh and salt water mix',
          'A deep, cold region of the open ocean',
          'A freshwater lake with no outlet',
          'A coral reef in shallow tropical water',
        ],
        answer: 0,
        explanations: [
          'Correct. That mixing zone is what defines an estuary.',
          'Incorrect. Estuaries are shallow coastal areas.',
          'Incorrect. An estuary connects a river to the sea.',
          'Incorrect. Coral reefs are a separate marine biome.',
        ],
      },
      checkpoints: [
        {
          question: 'Runoff from construction makes a coastal bay much more turbid. What is the most direct effect on producers in the bay?',
          choices: [
            'Less light reaches them, so photosynthesis decreases',
            'The water becomes saltier, so photosynthesis increases',
            'More oxygen dissolves, so producers grow faster',
            'Water temperature drops sharply, freezing the producers',
          ],
          answer: 0,
          explanations: [
            'Correct. Turbidity is cloudiness; suspended sediment blocks sunlight that algae and seagrass need.',
            'Incorrect. Sediment changes clarity, not salinity.',
            'Incorrect. Cloudier water doesn\'t add oxygen; less photosynthesis usually means less.',
            'Incorrect. Sediment doesn\'t freeze the water.',
          ],
        },
        {
          question: 'Why are marine algae important to the global atmosphere?',
          choices: [
            'They produce a large portion of Earth\'s oxygen and take in carbon dioxide',
            'They release most of the nitrogen in the atmosphere',
            'They are the largest reservoir of phosphorus',
            'They remove water vapor from the air',
          ],
          answer: 0,
          explanations: [
            'Correct. Through photosynthesis, marine algae are a major oxygen source and carbon dioxide sink.',
            'Incorrect. Atmospheric nitrogen is returned mainly by denitrifying bacteria.',
            'Incorrect. Phosphorus is stored mostly in rock and ocean sediments.',
            'Incorrect. Algae don\'t control atmospheric water vapor.',
          ],
        },
      ],
      revisit:
        'Freshwater = drinking water. Marine algae = much of Earth\'s O₂ and a CO₂ sink. Estuaries mix fresh and salt water. ' +
        'Salinity, depth, turbidity, nutrients and temperature decide where marine life is.',
    },
    {
      id: '1.4',
      ced: 'ERT-1.D',
      title: 'The Carbon Cycle',
      minutes: 5,
      summary:
        'Carbon moves between sources and sinks. Some reservoirs (sedimentary rock, fossil fuels, deep ocean) hold it for millions of ' +
        'years; others (atmosphere, living things) for short times. Photosynthesis and respiration cycle it through life, and burning ' +
        'fossil fuels moves long-stored carbon quickly into the atmosphere as CO₂.',
      body: String.raw`### Sources, sinks and reservoirs
- A **source** releases carbon (to the atmosphere); a **sink** takes more in than it releases.
- Some **reservoirs** hold carbon for a **long time**: sedimentary rock (the largest), fossil fuels, the deep ocean.
- Others hold it **briefly**: the atmosphere, plants and animals, soil.

### The main moves
| Process | Direction |
|---|---|
| **Photosynthesis** | CO₂ from air/water → sugars in producers (a sink) |
| **Cellular respiration** | Sugars → CO₂ back to air/water (a source) |
| **Decomposition** | Dead matter → CO₂, or, buried without decay over millions of years, **fossil fuels** |
| **Ocean exchange** | The ocean absorbs CO₂ from the air and releases it |
| **Combustion of fossil fuels** | Moves carbon stored for millions of years into the atmosphere **in decades** |

That last row is the key exam idea: burning fossil fuels moves carbon from a slow, long-term reservoir into the atmosphere far faster than natural processes move it back.`,
      blocks: [],
      precheck: {
        question: 'Which process removes carbon dioxide from the atmosphere?',
        choices: ['Photosynthesis', 'Cellular respiration', 'Combustion of fossil fuels', 'Decomposition'],
        answer: 0,
        explanations: [
          'Correct. Producers take in CO₂ and store the carbon in sugars.',
          'Incorrect. Respiration releases CO₂.',
          'Incorrect. Burning releases CO₂.',
          'Incorrect. Decomposers release CO₂ as they respire.',
        ],
      },
      checkpoints: [
        {
          question: 'Why does burning fossil fuels raise atmospheric CO₂ even though carbon is "just cycling"?',
          choices: [
            'It moves carbon from a long-term reservoir into the atmosphere much faster than it is removed',
            'It creates new carbon atoms',
            'It stops photosynthesis everywhere on Earth',
            'It converts nitrogen gas into carbon dioxide',
          ],
          answer: 0,
          explanations: [
            'Correct. Fossil carbon took millions of years to store; combustion releases it in decades, faster than sinks absorb it.',
            'Incorrect. Matter is conserved; no carbon is created.',
            'Incorrect. Photosynthesis continues; it just can\'t keep up.',
            'Incorrect. Combustion doesn\'t turn nitrogen into carbon.',
          ],
        },
        {
          question: 'Which of these holds carbon for the LONGEST time?',
          choices: ['Sedimentary rock such as limestone', 'The atmosphere', 'Leaves on a tree', 'A grazing animal'],
          answer: 0,
          explanations: [
            'Correct. Sedimentary rock is the largest and slowest carbon reservoir, holding carbon for millions of years.',
            'Incorrect. Atmospheric carbon is exchanged within years.',
            'Incorrect. Leaves hold carbon only until they decompose or are eaten.',
            'Incorrect. Animals release carbon through respiration and decay quickly.',
          ],
        },
      ],
      revisit:
        'Photosynthesis takes CO₂ in; respiration, decomposition and combustion put it out. Long-term reservoirs: sedimentary rock, ' +
        'fossil fuels, deep ocean. Burning fossil fuels moves old carbon into the air faster than it returns.',
    },
    {
      id: '1.5',
      ced: 'ERT-1.E',
      title: 'The Nitrogen Cycle',
      minutes: 6,
      summary:
        'The atmosphere is the largest nitrogen reservoir, but most organisms can\'t use N₂. Soil bacteria fix it into ammonia, which ' +
        'becomes ammonium; then come assimilation, ammonification, nitrification and denitrification. Fixation is slow, so nitrogen ' +
        'often limits plant growth.',
      body: String.raw`### Five steps (bacteria do most of the work)
| Step | What happens |
|---|---|
| **Nitrogen fixation** | Certain soil bacteria convert atmospheric **N₂ → ammonia (NH₃)**, which quickly becomes **ammonium (NH₄⁺)** in soil, usable by plants. Some bacteria live in root nodules of legumes. Lightning fixes a little too. |
| **Assimilation** | Plants take up ammonium or nitrate and build it into proteins and nucleic acids; animals get it by eating plants. |
| **Ammonification** | Decomposers convert nitrogen in dead organisms and wastes back into **ammonia/ammonium**. |
| **Nitrification** | Bacteria convert **ammonium → nitrite (NO₂⁻) → nitrate (NO₃⁻)**. |
| **Denitrification** | Bacteria convert **nitrate → N₂ gas** (and some N₂O), returning it to the atmosphere. |

### Why it matters
- The **atmosphere is the largest reservoir** (about 78% N₂), but most organisms can't use N₂ directly.
- Usable nitrogen in soil is **limited by the rate of fixation**, so nitrogen often **limits primary production**. That's why farmers add nitrogen fertilizer.
- Most other nitrogen reservoirs (soil, living things) hold it only **briefly**.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Nitrogen fixation', back: 'N₂ → NH₃/NH₄⁺, by soil bacteria (and lightning).' },
            { front: 'Nitrification', back: 'NH₄⁺ → NO₂⁻ → NO₃⁻, by bacteria.' },
            { front: 'Denitrification', back: 'NO₃⁻ → N₂ gas back to the atmosphere, by bacteria.' },
            { front: 'Ammonification', back: 'Decomposers turn organic nitrogen in waste and dead matter into NH₃/NH₄⁺.' },
            { front: 'Assimilation', back: 'Plants absorb NH₄⁺ or NO₃⁻ and build it into proteins and DNA.' },
          ],
        },
      ],
      precheck: {
        question: 'Which step converts atmospheric N₂ into a form plants can use?',
        choices: ['Nitrogen fixation', 'Denitrification', 'Ammonification', 'Assimilation'],
        answer: 0,
        explanations: [
          'Correct. Fixation turns N₂ into ammonia, which becomes ammonium in soil.',
          'Incorrect. Denitrification does the reverse: nitrate back to N₂.',
          'Incorrect. Ammonification starts from dead organic matter, not from N₂.',
          'Incorrect. Assimilation is plants taking in nitrogen that has already been fixed.',
        ],
      },
      checkpoints: [
        {
          question: 'In waterlogged, oxygen-poor soil, bacteria convert nitrate into nitrogen gas that escapes to the air. This process is:',
          choices: ['Denitrification', 'Nitrification', 'Nitrogen fixation', 'Ammonification'],
          answer: 0,
          explanations: [
            'Correct. Nitrate → N₂ is denitrification, and it happens mostly where oxygen is scarce.',
            'Incorrect. Nitrification makes nitrate from ammonium.',
            'Incorrect. Fixation takes N₂ out of the air.',
            'Incorrect. Ammonification makes ammonia from organic matter.',
          ],
        },
        {
          question: 'Farmers plant legumes such as soybeans to improve soil for the next crop. Why does this work?',
          choices: [
            'Bacteria in legume root nodules fix atmospheric nitrogen into ammonium',
            'Legumes add phosphorus from the atmosphere to the soil',
            'Legumes denitrify the soil, adding nitrate',
            'Legumes speed up the weathering of rock',
          ],
          answer: 0,
          explanations: [
            'Correct. Nitrogen-fixing bacteria in the nodules add usable nitrogen, the nutrient that most often limits growth.',
            'Incorrect. Phosphorus has no significant atmospheric component.',
            'Incorrect. Denitrification removes usable nitrogen from soil.',
            'Incorrect. Weathering releases phosphorus, and legumes aren\'t known for speeding it up.',
          ],
        },
      ],
      revisit:
        'Fixation N₂→NH₃/NH₄⁺; assimilation into plants; ammonification from dead matter; nitrification NH₄⁺→NO₂⁻→NO₃⁻; ' +
        'denitrification NO₃⁻→N₂. Atmosphere = biggest reservoir; fixation is slow, so N limits production.',
    },
    {
      id: '1.6',
      ced: 'ERT-1.F',
      title: 'The Phosphorus Cycle',
      minutes: 4,
      summary:
        'Phosphorus is stored mainly in rock and ocean sediments and has no significant atmospheric component. Rocks weather slowly, ' +
        'so phosphorus is scarce and often limits producers, especially in freshwater.',
      body: String.raw`### A cycle without an atmosphere step
- **Major reservoirs**: rock and **ocean sediments** containing phosphorus-bearing minerals.
- **No significant atmospheric component**: unlike carbon and nitrogen, phosphorus doesn't cycle through the air as a gas.
- **Weathering** of rock slowly releases phosphate into soil and water, where producers take it up and pass it along food chains.
- Phosphate washes into rivers and oceans, settles into **sediments**, and over geologic time can be **uplifted** into rock again.

### A limiting nutrient
Because rock weathers **slowly**, phosphorus is relatively **scarce**, and it often **limits producers**, especially in **freshwater** and some terrestrial ecosystems. When fertilizer or detergent runoff adds phosphate to a lake, algae can grow explosively (you'll see this as eutrophication later in the course).`,
      blocks: [],
      precheck: {
        question: 'How does the phosphorus cycle differ from the carbon and nitrogen cycles?',
        choices: [
          'It has no significant atmospheric component',
          'It has no reservoirs in rock',
          'It moves much faster',
          'It does not involve living things',
        ],
        answer: 0,
        explanations: [
          'Correct. Phosphorus cycles through rock, soil, water and organisms, but not through the air as a gas.',
          'Incorrect. Rock and sediment are its main reservoirs.',
          'Incorrect. It is slow, because it depends on rock weathering.',
          'Incorrect. Producers absorb phosphate and pass it through food chains.',
        ],
      },
      checkpoints: [
        {
          question: 'Why is phosphorus often a limiting nutrient in freshwater lakes?',
          choices: [
            'Rock weathers slowly, so little phosphate becomes available',
            'Phosphorus escapes to the atmosphere too quickly',
            'Bacteria convert phosphorus to a gas',
            'Phosphorus is the most abundant element in water',
          ],
          answer: 0,
          explanations: [
            'Correct. The main natural source is slow weathering of phosphate-bearing rock.',
            'Incorrect. Phosphorus has no significant gas phase.',
            'Incorrect. There is no common bacterial process that makes a phosphorus gas.',
            'Incorrect. If it were abundant it wouldn\'t limit growth.',
          ],
        },
        {
          question: 'Phosphate-rich fertilizer runs off into a lake. What is the most likely immediate result?',
          choices: ['A rapid increase in algae growth', 'A drop in algae growth', 'More phosphorus in the atmosphere', 'Faster rock weathering around the lake'],
          answer: 0,
          explanations: [
            'Correct. Adding the limiting nutrient removes the cap on producer growth.',
            'Incorrect. Removing a limit increases growth.',
            'Incorrect. Phosphorus doesn\'t move into the air.',
            'Incorrect. Runoff doesn\'t change the rate of rock weathering.',
          ],
        },
      ],
      revisit:
        'Phosphorus: rock and ocean sediments are the reservoirs, no atmospheric step, released by slow weathering, so it\'s scarce ' +
        'and often limits producers, especially in freshwater.',
    },
    {
      id: '1.7',
      ced: 'ERT-1.G',
      title: 'The Hydrologic (Water) Cycle',
      minutes: 3,
      summary:
        'Powered by the sun, water moves as ice, liquid and vapor between sources and sinks. The oceans are by far the main surface ' +
        'reservoir; ice caps and groundwater are much smaller.',
      body: String.raw`### Powered by the sun
The **sun's energy** drives the water cycle by evaporating water. Water moves through all three phases:
- **Evaporation** (liquid → vapor) from oceans and lakes, and **transpiration** from plant leaves (together, evapotranspiration).
- **Condensation** into clouds, then **precipitation** as rain or snow.
- **Infiltration** into soil and **groundwater** (aquifers), or **runoff** over land back to rivers and oceans.

### Reservoirs
- **Oceans**: the primary reservoir, about 97% of Earth's surface water.
- **Ice caps and glaciers** and **groundwater**: much smaller, and most of the fresh water.

Paving land with impervious surfaces (roads, parking lots) cuts infiltration and increases runoff.`,
      blocks: [],
      precheck: {
        question: 'What is the primary reservoir of water at Earth\'s surface?',
        choices: ['The oceans', 'Ice caps', 'Groundwater', 'The atmosphere'],
        answer: 0,
        explanations: [
          'Correct. The oceans hold about 97% of it.',
          'Incorrect. Ice caps are a much smaller reservoir, though they hold most fresh water.',
          'Incorrect. Groundwater is a much smaller reservoir.',
          'Incorrect. The atmosphere holds very little water at any moment.',
        ],
      },
      checkpoints: [
        {
          question: 'Water moving from plant leaves into the atmosphere as vapor is called:',
          choices: ['Transpiration', 'Infiltration', 'Condensation', 'Runoff'],
          answer: 0,
          explanations: [
            'Correct. Transpiration is evaporation from plants.',
            'Incorrect. Infiltration is water soaking into the ground.',
            'Incorrect. Condensation is vapor becoming liquid, forming clouds.',
            'Incorrect. Runoff is water flowing over land.',
          ],
        },
        {
          question: 'A forest is replaced by a shopping center and parking lots. How does this change the local water cycle?',
          choices: ['Less infiltration and more runoff', 'More infiltration and less runoff', 'More transpiration', 'No change, because rainfall is the same'],
          answer: 0,
          explanations: [
            'Correct. Pavement is impervious, so rain can\'t soak in and runs off instead.',
            'Incorrect. Pavement blocks water from entering the soil.',
            'Incorrect. Removing trees reduces transpiration.',
            'Incorrect. The same rain takes a different path once it lands.',
          ],
        },
      ],
      revisit:
        'Sun-powered. Evaporation + transpiration → condensation → precipitation → infiltration or runoff. Oceans are the main reservoir; ' +
        'ice and groundwater are smaller.',
    },
    {
      id: '1.8',
      ced: 'ENG-1.A',
      title: 'Primary Productivity',
      minutes: 5,
      summary:
        'Primary productivity is the rate at which producers turn sunlight into organic compounds. Gross primary productivity is the ' +
        'total; net primary productivity is what\'s left after the producers\' own respiration. It\'s measured in energy per area per ' +
        'time, like kcal/m²/yr. In water, light quality with depth limits photosynthesis.',
      body: String.raw`### GPP, NPP and respiration
- **Primary productivity**: the rate at which solar energy is converted into organic compounds by photosynthesis.
- **Gross primary productivity (GPP)**: the **total** rate of photosynthesis in an area.
- **Net primary productivity (NPP)**: the rate of energy **storage** by producers after subtracting what they use in **respiration (R)**:
$$\text{NPP} = \text{GPP} - R$$

NPP is the energy actually available to consumers. Units: energy per unit area per unit time, e.g. **kcal/m²/yr**.

${steps({
  title: 'A grassland has a GPP of 12,000 kcal/m²/yr, and the grasses use 4,500 kcal/m²/yr in respiration. Find NPP.',
  steps: [
    { title: 'Use the definition', body: 'NPP = GPP − R' },
    { title: 'Substitute', body: '12,000 − 4,500 = 7,500 kcal/m²/yr' },
    { title: 'Interpret', body: '7,500 kcal/m²/yr is stored as biomass and available to primary consumers.' },
  ],
  answer: '7,500 kcal/m²/yr',
})}

### Light in water
Most **red** light is absorbed in the **top 1 m** of water; **blue** light penetrates past **100 m** only in the clearest water. Aquatic producers have adaptations (such as extra pigments) for the dimmer light at depth.`,
      blocks: [],
      precheck: {
        question: 'Net primary productivity (NPP) is equal to:',
        choices: [
          'Gross primary productivity minus the energy producers use in respiration',
          'Gross primary productivity plus respiration',
          'The energy consumers lose as heat',
          'The total sunlight reaching an area',
        ],
        answer: 0,
        explanations: [
          'Correct. NPP = GPP − R: what producers store after running their own cells.',
          'Incorrect. Respiration is subtracted, not added.',
          'Incorrect. That describes losses between trophic levels, not productivity.',
          'Incorrect. Producers capture only a small part of incoming sunlight.',
        ],
      },
      checkpoints: [
        {
          question: 'A forest has a GPP of 20,000 kcal/m²/yr and an NPP of 9,000 kcal/m²/yr. How much energy do the producers use in respiration?',
          choices: ['11,000 kcal/m²/yr', '29,000 kcal/m²/yr', '9,000 kcal/m²/yr', '2,000 kcal/m²/yr'],
          answer: 0,
          explanations: [
            'Correct. R = GPP − NPP = 20,000 − 9,000 = 11,000.',
            'Incorrect. That adds GPP and NPP.',
            'Incorrect. 9,000 is the NPP, the amount stored.',
            'Incorrect. That applies the 10% rule, which is about transfer between trophic levels.',
          ],
        },
        {
          question: 'Which units are appropriate for primary productivity?',
          choices: ['kcal/m²/yr', 'kcal', 'm²/yr', 'kg/m³'],
          answer: 0,
          explanations: [
            'Correct. Productivity is energy per unit area per unit time.',
            'Incorrect. Energy alone is missing the area and the time.',
            'Incorrect. That has no energy (or mass) in it.',
            'Incorrect. That is a density, not a rate.',
          ],
        },
      ],
      revisit:
        'NPP = GPP − respiration; it\'s what consumers can eat. Units: energy/area/time (kcal/m²/yr). Red light dies out in the top metre ' +
        'of water; blue goes deepest.',
    },
    {
      id: '1.9',
      ced: 'ENG-1.B',
      title: 'Trophic Levels',
      minutes: 3,
      summary:
        'Ecosystems need a continuous inflow of high-quality energy, almost always from the sun. Energy flows one way, from producers up ' +
        'to higher trophic levels, while matter cycles through biogeochemical cycles and is conserved.',
      body: String.raw`### Energy flows, matter cycles
- **Energy flows one way**: sun → producers → primary consumers → secondary consumers → tertiary consumers, lost as heat along the way. Ecosystems need a **continuous inflow** of high-quality energy.
- **Matter cycles**: carbon, nitrogen, phosphorus and water atoms are reused again and again. Each biogeochemical cycle shows the **conservation of matter**.

### The levels
| Trophic level | Who | Example |
|---|---|---|
| Producers (autotrophs) | Make their own food by photosynthesis | Grass, phytoplankton |
| Primary consumers | Herbivores | Grasshopper, zooplankton |
| Secondary consumers | Eat herbivores | Frog, small fish |
| Tertiary consumers | Eat secondary consumers | Snake, large fish |

In land and near-surface ocean communities, energy enters with the sun and moves **upward** through these levels.`,
      blocks: [],
      precheck: {
        question: 'Which statement correctly contrasts energy and matter in ecosystems?',
        choices: [
          'Energy flows one way through ecosystems, while matter is recycled',
          'Matter flows one way, while energy is recycled',
          'Both energy and matter are recycled',
          'Both energy and matter flow one way and are used up',
        ],
        answer: 0,
        explanations: [
          'Correct. Energy enters from the sun and leaves as heat; atoms are reused.',
          'Incorrect. That reverses them.',
          'Incorrect. Energy lost as heat can\'t be reused by organisms, so ecosystems need a constant inflow.',
          'Incorrect. Matter is conserved and keeps cycling.',
        ],
      },
      checkpoints: [
        {
          question: 'A frog eats grasshoppers that eat grass. The frog is a:',
          choices: ['Secondary consumer', 'Primary consumer', 'Producer', 'Tertiary consumer'],
          answer: 0,
          explanations: [
            'Correct. It eats a primary consumer (the grasshopper), so it is on the third trophic level.',
            'Incorrect. Primary consumers eat producers directly.',
            'Incorrect. Producers make their own food.',
            'Incorrect. A tertiary consumer would eat the frog.',
          ],
        },
        {
          question: 'Why must every ecosystem have a continuous input of energy?',
          choices: [
            'Energy is lost as heat at each transfer and can\'t be cycled back',
            'Matter is destroyed as it moves between organisms',
            'Producers store all incoming energy permanently',
            'Decomposers create new energy from dead matter',
          ],
          answer: 0,
          explanations: [
            'Correct. Without a steady supply from the sun, the energy in the system would run down.',
            'Incorrect. Matter is conserved.',
            'Incorrect. Producers use and lose much of what they capture.',
            'Incorrect. Decomposers release energy as heat; they can\'t create it.',
          ],
        },
      ],
      revisit:
        'Energy: one-way flow, sun → producers → consumers, lost as heat, needs constant input. Matter: cycles, conserved. ' +
        'Producers → primary (herbivores) → secondary → tertiary consumers.',
    },
    {
      id: '1.10',
      ced: 'ENG-1.C',
      title: 'Energy Flow and the 10% Rule',
      minutes: 5,
      summary:
        'Only about 10% of the energy in one trophic level is passed to the next. The rest is used for life processes and lost as heat, ' +
        'as the laws of thermodynamics predict. So each level up has about a tenth of the energy below it.',
      body: String.raw`### About 10% makes it up
From one trophic level to the next, roughly **10%** of the energy is passed on. To go **up one level**, multiply by 0.1; to go **up two levels**, multiply by 0.01; and so on.

${steps({
  title: 'Producers in a meadow store 20,000 kcal/m²/yr. About how much energy reaches the tertiary consumers?',
  steps: [
    { title: 'Count the steps', body: 'Producers → primary → secondary → tertiary: **three** transfers.' },
    { title: 'Apply 10% each time', body: '20,000 → 2,000 → 200 → 20' },
    { title: 'Or in one line', body: '20,000 × 0.1³ = 20 kcal/m²/yr' },
  ],
  answer: 'About 20 kcal/m²/yr',
})}

### Why so much is lost: thermodynamics
- **First law**: energy is not created or destroyed, only transformed.
- **Second law**: every transformation turns some energy into **heat**, which organisms can't use.

At each level, organisms use most of the energy they take in for movement, growth and keeping warm (respiration), and much of what they eat isn't digested. That's why top predators are few and food chains rarely go past four or five levels.`,
      blocks: [{ type: 'sim', sim: 'energy-pyramid' }],
      precheck: {
        question: 'About what percentage of energy is transferred from one trophic level to the next?',
        choices: ['10%', '50%', '90%', '1%'],
        answer: 0,
        explanations: [
          'Correct. The 10% rule approximates the transfer between levels.',
          'Incorrect. Far less than half is passed on.',
          'Incorrect. About 90% is lost, not passed on.',
          'Incorrect. 1% is what reaches two levels up (10% of 10%).',
        ],
      },
      checkpoints: [
        {
          question: 'Phytoplankton in a lake store 50,000 kcal/m²/yr. Using the 10% rule, how much energy is available to the secondary consumers?',
          choices: ['500 kcal/m²/yr', '5,000 kcal/m²/yr', '50 kcal/m²/yr', '45,000 kcal/m²/yr'],
          answer: 0,
          explanations: [
            'Correct. Two transfers: 50,000 × 0.1 × 0.1 = 500.',
            'Incorrect. That is the energy for primary consumers, one step up.',
            'Incorrect. That is three steps up, the tertiary consumers.',
            'Incorrect. That is the energy lost in the first transfer.',
          ],
        },
        {
          question: 'Which law explains why energy decreases at each trophic level?',
          choices: [
            'The second law of thermodynamics: each energy transformation releases some energy as unusable heat',
            'The law of conservation of matter',
            'The first law of thermodynamics: energy is destroyed at each level',
            'The law of supply and demand',
          ],
          answer: 0,
          explanations: [
            'Correct. Each transfer is inefficient, and the lost energy leaves as heat.',
            'Incorrect. That is about matter, which is recycled.',
            'Incorrect. The first law says energy is never destroyed; it is converted, mostly to heat.',
            'Incorrect. That is an economics principle.',
          ],
        },
      ],
      revisit:
        'Multiply by 0.1 for each step up: 20,000 → 2,000 → 200 → 20. The rest is lost as heat (second law of thermodynamics), ' +
        'so food chains are short.',
    },
    {
      id: '1.11',
      ced: 'ENG-1.D',
      title: 'Food Chains and Food Webs',
      minutes: 4,
      summary:
        'A food chain shows energy and matter moving from producers to herbivores to carnivores and omnivores. Decomposers and detritivores ' +
        'return nutrients to the soil. A food web links many food chains, and adding or removing one species affects the rest, through ' +
        'positive and negative feedback.',
      body: String.raw`### Chains and webs
- **Food chain**: one path of energy and matter, from **producers (autotrophs)** to **primary consumers (herbivores)** to **secondary and tertiary consumers (omnivores and carnivores)**.
- **Detritivores** (earthworms, millipedes) eat dead organic matter; **decomposers** (bacteria, fungi) break it down chemically. Both **return nutrients to the soil**.
- **Food web**: many interlocking food chains. It is a more realistic model, since most organisms eat, and are eaten by, more than one species.

### Change one species, change the web
Removing or adding a species ripples through the web:
- Remove wolves → elk increase → elk overgraze young trees → fewer trees along rivers → more erosion.
- **Negative feedback** keeps things stable (more prey → more predators → fewer prey → fewer predators).
- **Positive feedback** amplifies a change (fewer trees → more erosion → harder for trees to regrow).`,
      blocks: [],
      precheck: {
        question: 'What role do decomposers play in a food web?',
        choices: [
          'They break down dead organic matter and return nutrients to the soil',
          'They make their own food by photosynthesis',
          'They are always the top predators',
          'They add energy to the ecosystem',
        ],
        answer: 0,
        explanations: [
          'Correct. Decomposers recycle nutrients so producers can reuse them.',
          'Incorrect. That describes producers.',
          'Incorrect. Decomposers work at every level, breaking down all dead matter.',
          'Incorrect. Only the sun adds energy; decomposers release it as heat.',
        ],
      },
      checkpoints: [
        {
          question: 'Sea otters eat sea urchins, which eat kelp. If sea otters are removed, what is the most likely result?',
          choices: [
            'Urchin populations grow and kelp forests decline',
            'Urchin populations decline and kelp forests grow',
            'Kelp is unaffected because otters don\'t eat it',
            'Urchins switch to eating otters',
          ],
          answer: 0,
          explanations: [
            'Correct. Without their predator, urchins increase and overgraze the kelp.',
            'Incorrect. Removing urchins\' predator lets them increase.',
            'Incorrect. Effects pass through the web even to species the otters don\'t eat.',
            'Incorrect. The otters have been removed, and urchins are grazers.',
          ],
        },
        {
          question: 'Why is a food web a more accurate model than a single food chain?',
          choices: [
            'Most organisms eat, and are eaten by, more than one species',
            'Food webs ignore decomposers',
            'Food chains show energy flow but food webs don\'t',
            'Food webs include only producers',
          ],
          answer: 0,
          explanations: [
            'Correct. A web links many chains, showing the multiple feeding relationships real organisms have.',
            'Incorrect. Decomposers belong in both.',
            'Incorrect. Both show energy and matter flow.',
            'Incorrect. Webs include producers and all consumers.',
          ],
        },
      ],
      revisit:
        'Chain: one path producer → herbivore → carnivore/omnivore. Web: many linked chains. Decomposers and detritivores return nutrients. ' +
        'Removing or adding a species ripples through the web via feedback loops.',
    },
  ],
};

export default pack;
