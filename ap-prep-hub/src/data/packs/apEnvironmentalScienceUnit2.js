/**
 * AP Environmental Science Unit 2: The Living World: Biodiversity — study pack.
 *
 * Written against the AP Environmental Science CED (effective Fall 2026,
 * topics 2.1–2.7, enduring understanding ERT-2). Sticks to what the essential
 * knowledge names: three levels of biodiversity, four categories of
 * ecosystem services, island biogeography, ecological tolerance, periodic /
 * episodic / random disruptions, natural selection, and primary vs. secondary
 * succession with keystone and indicator species. The island biogeography
 * graph is the standard equilibrium model (MacArthur and Wilson) with
 * illustrative rates, not data.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-environmental-science/unit-2',
  subject: 'AP Environmental Science',
  unit: 'Unit 2: The Living World: Biodiversity',
  examWeight: '6–8% of the exam',
  intro:
    'Biodiversity is what lets ecosystems absorb shocks and keep supplying the food, clean water and stable climate people ' +
    'depend on. This unit covers the levels of biodiversity, the services ecosystems provide, why islands are special, how ' +
    'species tolerate and adapt to change, and how communities rebuild after disturbance.',
  sections: [
    {
      id: '2.1',
      ced: 'ERT-2.A',
      title: 'Introduction to Biodiversity',
      minutes: 6,
      summary:
        'Biodiversity includes genetic, species and habitat diversity. Genetically diverse populations handle stress better, ' +
        'and bottlenecks erase that diversity. Species-rich ecosystems recover more easily. Habitat loss removes specialists ' +
        'first, then generalists, and hits species that need large territories.',
      body: String.raw`### Three levels
| Level | What it means | Why it matters |
|---|---|---|
| **Genetic diversity** | Variety of genes within a population | More diverse populations are more likely to include individuals that survive a new disease, drought or temperature change |
| **Species diversity** | Variety of species in an ecosystem | Ecosystems with more species are more likely to **recover from disruptions** |
| **Habitat (ecosystem) diversity** | Variety of habitats in an area | More habitats support more species |

**Species richness** is the **number of different species** in an ecosystem. (Many questions also mention **evenness**: how equal the species' population sizes are. High richness and high evenness both mean higher diversity.)

### Bottlenecks
A **population bottleneck** happens when an event (hunting, disease, habitat loss) shrinks a population sharply. The survivors carry only part of the original genetic variety, so even if numbers recover, **genetic diversity stays low**. Cheetahs and northern elephant seals are classic examples.

### Habitat loss
When habitat shrinks:
1. **Specialists** (narrow diets or habitat needs) disappear first.
2. **Generalists** follow if loss continues.
3. Species that need **large territories** (big predators) decline because the remaining patches are too small.`,
      blocks: [],
      precheck: {
        question: 'Which population is most likely to survive a new disease?',
        choices: [
          'A large population with high genetic diversity',
          'A population that recently went through a bottleneck',
          'A small population descended from a few founders',
          'A population of genetically identical clones',
        ],
        answer: 0,
        explanations: [
          'Correct. Genetic variety makes it more likely some individuals resist the disease.',
          'Incorrect. A bottleneck leaves low genetic diversity.',
          'Incorrect. A few founders carry little genetic variety.',
          'Incorrect. Identical individuals share the same vulnerability.',
        ],
      },
      checkpoints: [
        {
          question: 'A forest is cleared bit by bit for farmland. Which species is likely to disappear first?',
          choices: [
            'A beetle that feeds only on one tree species',
            'Raccoons, which eat almost anything',
            'House sparrows, which thrive near people',
            'Coyotes, which live in many habitats',
          ],
          answer: 0,
          explanations: [
            'Correct. Specialists with narrow needs are lost first when habitat shrinks.',
            'Incorrect. Generalists like raccoons adapt to changing habitats.',
            'Incorrect. Sparrows are generalists that do well near people.',
            'Incorrect. Coyotes are generalists with flexible habitat needs.',
          ],
        },
        {
          question: 'What does species richness measure?',
          choices: [
            'The number of different species in an ecosystem',
            'The total number of individual organisms',
            'How evenly individuals are spread among species',
            'The genetic variety within one species',
          ],
          answer: 0,
          explanations: [
            'Correct. Richness is a count of species.',
            'Incorrect. That is abundance, not richness.',
            'Incorrect. That is evenness.',
            'Incorrect. That is genetic diversity.',
          ],
        },
      ],
      revisit:
        'Genetic, species and habitat diversity. Genetic diversity → resilience to stress; bottlenecks erase it. More species → ' +
        'better recovery. Habitat loss: specialists first, then generalists; large-territory species decline. Richness = species count.',
    },
    {
      id: '2.2',
      ced: 'ERT-2.B–C',
      title: 'Ecosystem Services',
      minutes: 6,
      summary:
        'Ecosystems provide four categories of services: provisioning, regulating, cultural and supporting. Human activities ' +
        'can disrupt them, with both economic and ecological costs.',
      body: String.raw`### Four categories
| Category | What it is | Examples |
|---|---|---|
| **Provisioning** | Goods people take directly | Food, timber, fresh water, fiber, medicines |
| **Regulating** | Natural processes that keep conditions stable | Climate regulation and carbon storage, flood control, water and air purification |
| **Cultural** | Nonmaterial benefits | Recreation, tourism, spiritual value, education and science |
| **Supporting** | Processes that make the others possible | Nutrient cycling, soil formation, primary production (photosynthesis) |

### When humans disrupt them
Disrupting a service costs money **and** ecosystem health.
- Clearing a forest: lose timber in the future (provisioning), carbon storage and flood control (regulating), and recreation (cultural).
- Draining a wetland: lose water filtration and flood protection, so towns may need to pay for treatment plants and levees.
- Overfishing: lose a food supply and the jobs that depend on it.

On the exam, name the service category, give a specific example, and explain the economic or ecological consequence.

Sort the services below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which kind of ecosystem service?',
            buckets: ['Provisioning', 'Regulating', 'Cultural', 'Supporting'],
            items: [
              { label: 'Harvesting lumber from a forest', bucket: 0, why: 'A material good taken directly from the ecosystem.' },
              { label: 'Catching fish for food', bucket: 0, why: 'Food is a provisioning service.' },
              { label: 'Wetlands absorbing floodwater', bucket: 1, why: 'Flood control regulates conditions.' },
              { label: 'Forests storing carbon', bucket: 1, why: 'Carbon storage helps regulate climate.' },
              { label: 'Hiking and birdwatching in a park', bucket: 2, why: 'Recreation is a nonmaterial, cultural benefit.' },
              { label: 'A sacred mountain in a community\'s traditions', bucket: 2, why: 'Spiritual value is cultural.' },
              { label: 'Decomposers recycling nutrients into soil', bucket: 3, why: 'Nutrient cycling supports every other service.' },
              { label: 'Weathering rock slowly building soil', bucket: 3, why: 'Soil formation is a supporting service.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A wetland filters pollutants from water flowing through it. Which category of ecosystem service is this?',
        choices: ['Regulating', 'Provisioning', 'Cultural', 'Supporting'],
        answer: 0,
        explanations: [
          'Correct. Water purification is a regulating service.',
          'Incorrect. Provisioning means goods taken directly, like food or timber.',
          'Incorrect. Cultural means nonmaterial benefits like recreation.',
          'Incorrect. Supporting means background processes like nutrient cycling.',
        ],
      },
      checkpoints: [
        {
          question: 'A town drains a wetland to build homes. Which consequence best shows an economic cost of losing an ecosystem service?',
          choices: [
            'The town must pay for levees and a water treatment plant to replace flood control and filtration',
            'Some wetland birds lose their nesting habitat',
            'The new homes increase local property taxes',
            'Residents can no longer see the wetland from the road',
          ],
          answer: 0,
          explanations: [
            'Correct. Replacing regulating services with infrastructure costs money.',
            'Incorrect. That is an ecological consequence, not an economic one.',
            'Incorrect. Higher tax revenue isn\'t a cost of losing a service.',
            'Incorrect. That is a minor cultural change, not the clearest economic cost.',
          ],
        },
        {
          question: 'Nutrient cycling, soil formation and photosynthesis are grouped as supporting services because',
          choices: [
            'they make the other services possible',
            'they are sold directly in markets',
            'they provide recreation and spiritual value',
            'they only happen in tropical rainforests',
          ],
          answer: 0,
          explanations: [
            'Correct. Supporting services, such as nutrient cycling and primary production, underlie everything else.',
            'Incorrect. Goods sold directly are provisioning services.',
            'Incorrect. Recreation and spiritual value are cultural services.',
            'Incorrect. They happen in every ecosystem.',
          ],
        },
      ],
      revisit:
        'Provisioning (goods), regulating (flood control, purification, climate), cultural (recreation, spiritual, science), ' +
        'supporting (nutrient cycling, soil formation, primary production). Disrupting them has economic and ecological costs.',
    },
    {
      id: '2.3',
      ced: 'ERT-2.D–E',
      title: 'Island Biogeography',
      minutes: 7,
      summary:
        'Island biogeography studies how species colonize and persist on islands, or habitat "islands" like isolated parks. ' +
        'Larger islands and islands closer to the mainland hold more species. Many island species evolve into specialists, ' +
        'which makes them vulnerable to invasive generalists.',
      body: String.raw`### Islands are colonized from elsewhere
Every species on an island arrived from somewhere else (by flying, swimming, rafting on debris or riding the wind) or evolved from a species that did. Island biogeography studies the relationships, distribution and community structure of organisms on islands.

### The equilibrium model
The number of species on an island settles where new species **arrive** (immigration) as fast as species **disappear** (extinction).
- **Distance**: islands **closer** to the mainland get more immigrants.
- **Size**: **larger** islands have more habitat and bigger populations, so fewer extinctions.

${graph({
  title: 'Island equilibrium: immigration vs. extinction',
  x: [0, 100], y: [0, 10], xLabel: 'number of species', yLabel: 'rate',
  curves: [
    { expr: '(10 / d) * (1 - x / 100)', label: 'immigration rate' },
    { expr: '(10 / A) * (x / 100)', label: 'extinction rate' },
  ],
  params: {
    d: { min: 1, max: 5, value: 2, step: 0.5, label: 'distance (1 near, 5 far)' },
    A: { min: 1, max: 5, value: 2, step: 0.5, label: 'island size (1 small, 5 large)' },
  },
})}

The horizontal axis is the number of species on the island. The lines cross at the equilibrium number of species. Make the island **near and large** and they cross far to the right; **far and small**, far to the left. (The rates are illustrative, not data.)

The same idea applies to "habitat islands": a forest patch surrounded by farms, or a national park surrounded by cities.

### Islands and evolution
Limited food and territory push many island species to evolve into **specialists**, such as Darwin's finches with beaks suited to particular foods. When **invasive species**, usually generalists, arrive, they can outcompete or prey on those specialists. The brown tree snake wiped out most of Guam's native forest birds after arriving around World War II.`,
      blocks: [],
      precheck: {
        question: 'Which island is predicted to have the most species?',
        choices: [
          'A large island close to the mainland',
          'A small island close to the mainland',
          'A large island far from the mainland',
          'A small island far from the mainland',
        ],
        answer: 0,
        explanations: [
          'Correct. Being close raises immigration and being large lowers extinction.',
          'Incorrect. A small island loses species faster.',
          'Incorrect. Distance lowers the number of species arriving.',
          'Incorrect. Small and far gives the fewest species.',
        ],
      },
      checkpoints: [
        {
          question: 'Why are island species especially vulnerable to invasive species?',
          choices: [
            'Many evolved as specialists and can be outcompeted by invasive generalists',
            'Islands have more predators than mainlands',
            'Island species reproduce faster than invasive species',
            'Invasive species can\'t survive on islands',
          ],
          answer: 0,
          explanations: [
            'Correct. Limited island resources favored specialists, which struggle against flexible newcomers.',
            'Incorrect. Islands often have fewer native predators, so island species may lack defenses.',
            'Incorrect. Faster reproduction would help island species, not hurt them.',
            'Incorrect. Many invasives thrive on islands.',
          ],
        },
        {
          question: 'A city builds highways around a nature preserve, cutting it off from other forests. According to island biogeography, what will likely happen?',
          choices: [
            'The preserve will lose species over time, because it is now a smaller, isolated habitat island',
            'The number of species will rise because predators can\'t enter',
            'Nothing will change, since island biogeography only applies to oceanic islands',
            'The preserve will gain species from the city',
          ],
          answer: 0,
          explanations: [
            'Correct. Isolation lowers immigration, and a small area raises extinction.',
            'Incorrect. Isolation lowers immigration of all species.',
            'Incorrect. The model also applies to habitat islands.',
            'Incorrect. A city supplies few forest species.',
          ],
        },
      ],
      revisit:
        'Islands are colonized from elsewhere. Species number balances immigration (higher when near) and extinction (lower ' +
        'when large). Island species are often specialists, vulnerable to invasive generalists. Habitat islands work the same way.',
    },
    {
      id: '2.4',
      ced: 'ERT-2.F',
      title: 'Ecological Tolerance',
      minutes: 5,
      summary:
        'Ecological tolerance is the range of conditions, such as temperature, salinity, flow rate and sunlight, that an ' +
        'organism can endure before injury or death. It applies to individuals and to whole species.',
      body: String.raw`### Ranges of tolerance
For any condition (temperature, salinity, water flow, sunlight, pH):
| Zone | What happens |
|---|---|
| **Optimal range** | Organisms grow and reproduce best; population is highest |
| **Zones of physiological stress** | Organisms survive but grow and reproduce less |
| **Zones of intolerance** | Too extreme: organisms are injured or die |

The optimum sits in the middle; stress zones are on both sides; intolerance is beyond them. Plotted as population vs. the condition, it looks like a hill.

### Individuals and species
Tolerance applies to **individuals** (one fish can handle a range of temperatures) and to **species** (the whole range the species can occupy). Genetic diversity means individuals in a species differ in tolerance, which is part of why diverse populations survive change.

### Example: coral reefs
Reef-building corals live within a narrow temperature range. When water stays too warm, they enter a stress zone and expel the algae living in their tissues (**coral bleaching**). If it stays warm long enough, they die.`,
      blocks: [],
      precheck: {
        question: 'A trout population lives in a stream that slowly warms past the fish\'s optimal range. What happens first?',
        choices: [
          'The trout survive but grow and reproduce less',
          'All the trout die immediately',
          'The trout reproduce faster',
          'The trout\'s tolerance range moves to match the new temperature within one generation',
        ],
        answer: 0,
        explanations: [
          'Correct. Just outside the optimum is a zone of physiological stress.',
          'Incorrect. Death comes in the zone of intolerance, beyond the stress zone.',
          'Incorrect. Stress reduces reproduction.',
          'Incorrect. Tolerance doesn\'t shift within one generation.',
        ],
      },
      checkpoints: [
        {
          question: 'Which list contains only conditions that ecological tolerance can refer to?',
          choices: [
            'Temperature, salinity, flow rate and sunlight',
            'Species richness, evenness and abundance',
            'Provisioning, regulating and cultural services',
            'Immigration and extinction rates',
          ],
          answer: 0,
          explanations: [
            'Correct. These are the CED\'s examples of conditions an organism tolerates.',
            'Incorrect. Those are measures of biodiversity.',
            'Incorrect. Those are categories of ecosystem services.',
            'Incorrect. Those come from island biogeography.',
          ],
        },
        {
          question: 'Corals bleach when ocean water stays warmer than usual. Which zone of tolerance are bleached corals in?',
          choices: ['A zone of physiological stress', 'The optimal range', 'Outside any tolerance range from the start', 'A zone of increased growth'],
          answer: 0,
          explanations: [
            'Correct. Bleached corals are stressed; prolonged heat can push them into intolerance and death.',
            'Incorrect. In the optimal range, corals wouldn\'t bleach.',
            'Incorrect. Bleaching is a stress response that can be survived if temperatures fall.',
            'Incorrect. Stress reduces growth.',
          ],
        },
      ],
      revisit:
        'Tolerance: the range of conditions (temperature, salinity, flow, sunlight) an organism endures. Optimal range → stress ' +
        'zones → intolerance. Applies to individuals and species. Example: coral bleaching.',
    },
    {
      id: '2.5',
      ced: 'ERT-2.G',
      title: 'Natural Disruptions to Ecosystems',
      minutes: 6,
      summary:
        'Natural disruptions can be as damaging as human ones. They happen on many timescales: periodic, episodic or random. ' +
        'Climate and sea level have changed over geological time, reshaping habitats and sending wildlife migrating.',
      body: String.raw`### Timescales
| Type | Pattern | Examples |
|---|---|---|
| **Periodic** | Regular, predictable intervals | Seasons, day and night, tides |
| **Episodic** | Occasional, somewhat regular | Droughts, El Niño events, insect outbreaks |
| **Random** | No pattern | Volcanic eruptions, earthquakes, asteroid impacts |

### Change over geological time
- **Climate** has changed for many reasons: shifts in Earth's orbit, volcanic activity, changes in ocean currents and greenhouse gases.
- **Sea level** has risen and fallen with the amount of glacial ice. At the peak of the last ice age, about 20,000 years ago, sea level was roughly 120 m lower than today.
- Major upheavals shift **large swathes of habitat**: forests become grasslands, coasts move.

### Wildlife responds
Animals migrate for many reasons, including natural disruptions. Some migrations are **short-term** (seasonal movements to find food) and some **long-term** (ranges shifting as climate changes over centuries).

A natural disruption, such as a major volcanic eruption, can be as damaging as many human-made ones for that event.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Periodic, episodic or random?',
            buckets: ['Periodic', 'Episodic', 'Random'],
            items: [
              { label: 'Ocean tides rising and falling', bucket: 0, why: 'Tides follow a regular, predictable cycle.' },
              { label: 'Winter arriving each year', bucket: 0, why: 'Seasons repeat at regular intervals.' },
              { label: 'An El Niño event every few years', bucket: 1, why: 'It recurs, but not on a fixed schedule.' },
              { label: 'A multiyear drought', bucket: 1, why: 'Droughts happen occasionally with a loose pattern.' },
              { label: 'A volcanic eruption', bucket: 2, why: 'Eruptions have no regular pattern.' },
              { label: 'An asteroid impact', bucket: 2, why: 'Impacts are unpredictable.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'How have changes in glacial ice affected Earth\'s ecosystems over geological time?',
        choices: [
          'Sea level fell when ice sheets grew and rose when they melted, reshaping coastal habitats',
          'Glacial ice has never affected sea level',
          'More glacial ice raised sea level',
          'Ice sheets only affected the poles, never coastlines elsewhere',
        ],
        answer: 0,
        explanations: [
          'Correct. Water locked in ice lowers sea level; melting raises it.',
          'Incorrect. Sea level has varied significantly with glacial ice.',
          'Incorrect. Storing water as ice lowers sea level.',
          'Incorrect. Sea-level change moved coastlines worldwide.',
        ],
      },
      checkpoints: [
        {
          question: 'Which is an example of an episodic disruption?',
          choices: ['A drought that recurs every several years', 'Day and night', 'An earthquake', 'The change of seasons'],
          answer: 0,
          explanations: [
            'Correct. Droughts recur occasionally with a loose pattern.',
            'Incorrect. Day and night is periodic.',
            'Incorrect. Earthquakes are random.',
            'Incorrect. Seasons are periodic.',
          ],
        },
        {
          question: 'Which statement best describes natural disruptions compared with human-made ones?',
          choices: [
            'A natural disruption can be as damaging as, or more damaging than, many human disruptions',
            'Natural disruptions never harm ecosystems',
            'Only human disruptions change habitats',
            'Natural disruptions happen only on short timescales',
          ],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s point, for a given event.',
            'Incorrect. Eruptions, droughts and ice ages reshape ecosystems.',
            'Incorrect. Natural upheavals change large swathes of habitat.',
            'Incorrect. They range from daily cycles to geological time.',
          ],
        },
      ],
      revisit:
        'Periodic (seasons, tides), episodic (droughts, El Niño), random (eruptions, earthquakes). Climate and sea level have ' +
        'changed over geological time with glacial ice. Disruptions shift habitats and drive short- and long-term migration.',
    },
    {
      id: '2.6',
      ced: 'ERT-2.H',
      title: 'Adaptations',
      minutes: 5,
      summary:
        'Natural selection acts on heritable traits, so populations adapt over generations through small genetic changes. ' +
        'When the environment changes, individuals must change behavior, move, or perish.',
      body: String.raw`### Natural selection
1. Individuals in a population **vary** in heritable traits.
2. Some traits help individuals **survive and reproduce** in their environment.
3. Those individuals leave more offspring, so the helpful traits become **more common** over generations.

Adaptation happens to **populations**, over **generations**, through **incremental genetic changes**. Individuals don't evolve during their lifetimes.

### Examples
- **Peppered moths** in industrial England: as soot darkened tree bark, dark moths were better camouflaged, so they became more common. When pollution was cleaned up, light moths rebounded.
- **Pesticide resistance**: a few insects survive spraying because of a resistance gene; their offspring inherit it, and the pesticide stops working.

### When change is fast
Environmental change, **sudden or gradual**, can threaten a species. Individuals can **alter behavior**, **move** (migrate to suitable conditions), or **perish**. Species with long generations, small populations or low genetic diversity are least able to adapt in time.`,
      blocks: [],
      precheck: {
        question: 'Farmers spray the same pesticide for years, and it stops working. What best explains this?',
        choices: [
          'Insects with resistance genes survived and reproduced, so resistance became common',
          'Individual insects learned to avoid the pesticide',
          'The pesticide caused each insect to develop resistance during its life',
          'The pesticide breaks down faster over time',
        ],
        answer: 0,
        explanations: [
          'Correct. Natural selection favored heritable resistance over generations.',
          'Incorrect. Learning isn\'t inherited genetically.',
          'Incorrect. Individuals don\'t evolve; populations do, over generations.',
          'Incorrect. The pesticide\'s chemistry didn\'t change.',
        ],
      },
      checkpoints: [
        {
          question: 'Natural selection acts on which kind of trait?',
          choices: ['Heritable traits', 'Traits acquired during an organism\'s life', 'Only behavioral traits', 'Only traits visible to predators'],
          answer: 0,
          explanations: [
            'Correct. Only traits passed to offspring can change a population over generations.',
            'Incorrect. Acquired traits aren\'t inherited.',
            'Incorrect. Selection acts on physical, physiological and behavioral heritable traits.',
            'Incorrect. Selection acts on any heritable trait that affects survival or reproduction.',
          ],
        },
        {
          question: 'A mountain species of pika lives in cool habitats. As temperatures rise, what are its options?',
          choices: [
            'Change behavior, move to cooler higher elevations, or perish',
            'Instantly evolve heat tolerance',
            'Nothing changes, because tolerance ranges always expand to fit the climate',
            'Become a specialist in warm habitats within one season',
          ],
          answer: 0,
          explanations: [
            'Correct. Those are the CED\'s three responses to environmental change.',
            'Incorrect. Evolution takes many generations.',
            'Incorrect. Tolerance ranges don\'t automatically expand.',
            'Incorrect. Populations don\'t become new specialists in one season.',
          ],
        },
      ],
      revisit:
        'Natural selection acts on heritable variation → populations adapt over generations by small genetic changes. ' +
        'Examples: peppered moths, pesticide resistance. When change comes, individuals change behavior, move, or perish.',
    },
    {
      id: '2.7',
      ced: 'ERT-2.I–J',
      title: 'Ecological Succession',
      minutes: 8,
      summary:
        'Primary succession builds a community on bare rock with no soil; secondary succession rebuilds where soil remains. ' +
        'Keystone species shape community structure, and indicator species reveal ecosystem conditions. Succession changes ' +
        'total biomass, species richness and net productivity over time.',
      body: String.raw`### Two types
| | Primary succession | Secondary succession |
|---|---|---|
| Starts from | Bare rock or new land with **no soil** (lava flow, retreating glacier) | A disturbed area where **soil remains** (after fire, logging, abandoned farmland) |
| Pioneer species | Lichens and mosses that break down rock and start soil | Grasses and weeds that sprout from soil and seeds |
| Speed | Very slow: centuries | Faster: decades |

A typical progression: pioneers → grasses and small plants → shrubs → fast-growing, sun-loving trees → a mature forest of shade-tolerant trees.

### What changes during succession
- **Total biomass** and **species richness** generally increase as the community develops.
- **Net productivity** is usually high in early and middle stages, when plants are growing fast, then levels off or declines as the community matures.
- Pioneer species that move into empty habitat and adapt to it over long periods may even give rise to **new species**.

### Keystone and indicator species
- A **keystone species** has an outsized role in **community structure**. Beavers build dams that create wetlands; sea otters eat sea urchins, which protects kelp forests; wolves reshaped Yellowstone's elk browsing after their return in 1995.
- An **indicator species** reveals something about ecosystem conditions through its presence, abundance, scarcity or chemistry. Lichens disappear where air is polluted; mayfly and stonefly larvae show clean, well-oxygenated streams; amphibians are sensitive to pollution.

Put the stages of primary succession in order below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Primary succession on bare rock',
            hideYears: true,
            instruction: 'tap the stages from first to last',
            events: [
              { year: 1, label: 'Bare rock left by a retreating glacier' },
              { year: 2, label: 'Lichens and mosses begin breaking down rock' },
              { year: 3, label: 'Thin soil supports grasses and small plants' },
              { year: 4, label: 'Shrubs take over' },
              { year: 5, label: 'Fast-growing, sun-loving trees' },
              { year: 6, label: 'Mature forest of shade-tolerant trees' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A forest fire burns a forest but leaves the soil intact. What kind of succession follows?',
        choices: ['Secondary succession', 'Primary succession', 'No succession, because the forest is gone', 'Island biogeography'],
        answer: 0,
        explanations: [
          'Correct. Soil remains, so recovery starts from existing soil and seeds.',
          'Incorrect. Primary succession starts on bare rock with no soil.',
          'Incorrect. Communities rebuild after fire through succession.',
          'Incorrect. That is a different concept about species on islands.',
        ],
      },
      checkpoints: [
        {
          question: 'Sea otters eat sea urchins, which eat kelp. When otters were hunted out, urchins destroyed kelp forests. Sea otters are best described as',
          choices: ['a keystone species', 'an indicator species', 'a pioneer species', 'an invasive species'],
          answer: 0,
          explanations: [
            'Correct. Their effect on community structure is far larger than their numbers suggest.',
            'Incorrect. Indicator species reveal conditions; otters shape the community.',
            'Incorrect. Pioneers colonize bare or disturbed ground first.',
            'Incorrect. Sea otters are native to these kelp forests.',
          ],
        },
        {
          question: 'A survey finds mayfly larvae are abundant in one stream but absent from another nearby. What does this most likely indicate?',
          choices: [
            'The stream with mayflies has cleaner, better-oxygenated water',
            'The stream without mayflies is more productive',
            'Mayflies are a keystone species in both streams',
            'Primary succession is happening in the stream with mayflies',
          ],
          answer: 0,
          explanations: [
            'Correct. Mayfly larvae are indicator species that need clean, oxygen-rich water.',
            'Incorrect. Their absence suggests pollution or low oxygen, not higher productivity.',
            'Incorrect. Here they reveal conditions, which is the indicator role.',
            'Incorrect. Succession isn\'t what this evidence shows.',
          ],
        },
      ],
      revisit:
        'Primary: bare rock, no soil, lichens and mosses pioneer, slow. Secondary: soil remains, faster. Biomass and richness ' +
        'increase; net productivity peaks early to mid. Keystone species shape communities; indicator species reveal conditions.',
    },
  ],
};

export default pack;
