/**
 * AP Human Geography Unit 1: Thinking Geographically — study pack.
 *
 * Written against the AP Human Geography CED (effective Fall 2020, the
 * current edition on AP Central; topics 1.1–1.7). The essential knowledge is
 * mostly vocabulary used to read maps and data, so this unit leans on
 * flashcards and scenario checkpoints, with one simulation for the CED's
 * statement that every map projection distorts shape, area, distance or
 * direction.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-human-geography/unit-1',
  subject: 'AP Human Geography',
  unit: 'Unit 1: Thinking Geographically',
  examWeight: '8–10% of the exam',
  intro:
    'Geographers ask where things are and why there. This unit is the toolkit for the rest of the course: the kinds of maps and ' +
    'what they distort, where geographic data comes from and how it\'s used, spatial concepts like distance decay, how people ' +
    'and environments shape each other, and how scale and regions change what you see.',
  sections: [
    {
      id: '1.1',
      ced: 'IMP-1.A',
      title: 'Introduction to Maps',
      minutes: 6,
      summary:
        'Reference maps show where things are; thematic maps show patterns in data. Maps show absolute and relative distance and ' +
        'direction, clustering, dispersal and elevation. Every map is selective, and every projection distorts shape, area, distance ' +
        'or direction.',
      body: String.raw`### Two kinds of maps
- **Reference maps** show locations: political maps (borders), physical maps (landforms), road maps, plat maps (property lines).
- **Thematic maps** show the spatial pattern of a topic:

| Thematic map | How it shows data | Good for |
|---|---|---|
| **Choropleth** | Shades or colors whole areas | Rates by state or country (e.g., literacy rate) |
| **Dot distribution** | One dot = a set number of things | Where things cluster or disperse |
| **Graduated symbol** | Bigger symbol = bigger value | Totals at points (city populations) |
| **Isoline** | Lines connecting equal values | Elevation, temperature |
| **Cartogram** | Distorts the size of places by a value | Comparing populations or GDP |

### Patterns maps show
**Absolute** distance and direction (measured: 50 km, due north) and **relative** distance and direction (in time, cost, or "near/far," "up the coast"), **clustering**, **dispersal** and **elevation**.

### Every map lies a little
Maps are **selective**: the mapmaker chooses what to show and leave out. And turning a round Earth into a flat map always distorts something: **shape, area, distance or direction**.

| Projection | Keeps | Distorts |
|---|---|---|
| **Mercator** | Shape and compass direction (good for navigation) | Area, badly, near the poles |
| **Gall–Peters** | Area (equal-area) | Shape |
| **Robinson** | A compromise | A bit of everything, nothing badly |`,
      blocks: [{ type: 'sim', sim: 'mercator-distortion' }],
      precheck: {
        question: 'A map shades each U.S. state by its median household income. What type of map is this?',
        choices: ['Choropleth map', 'Reference map', 'Isoline map', 'Dot distribution map'],
        answer: 0,
        explanations: [
          'Correct. A choropleth map shades whole areas by a data value.',
          'Incorrect. A reference map shows locations, not a data pattern.',
          'Incorrect. Isolines connect points of equal value, like elevation contours.',
          'Incorrect. A dot map places one dot per set number of things.',
        ],
      },
      checkpoints: [
        {
          question: 'On a Mercator projection, Greenland appears about as large as Africa. What explains this?',
          choices: [
            'Mercator greatly enlarges areas far from the equator',
            'Mercator shrinks areas near the equator to keep shapes correct',
            'Greenland and Africa really are about the same size',
            'Mercator is an equal-area projection',
          ],
          answer: 0,
          explanations: [
            'Correct. Mercator stretches lengths more and more toward the poles, so high-latitude places look far too big. Africa is about 14 times larger.',
            'Incorrect. Areas near the equator are close to true size; it\'s the high latitudes that are enlarged.',
            'Incorrect. Africa is roughly 14 times larger than Greenland.',
            'Incorrect. Mercator keeps shape and direction, not area; Gall–Peters is equal-area.',
          ],
        },
        {
          question: 'A map shows each country drawn at a size proportional to its population rather than its land area. This is a:',
          choices: ['Cartogram', 'Choropleth map', 'Reference map', 'Graduated symbol map'],
          answer: 0,
          explanations: [
            'Correct. Cartograms resize places according to a data value.',
            'Incorrect. A choropleth shades areas but keeps their real shapes and sizes.',
            'Incorrect. A reference map shows locations, not data.',
            'Incorrect. A graduated symbol map scales a symbol on top of the place, not the place itself.',
          ],
        },
      ],
      revisit:
        'Reference maps show where; thematic maps (choropleth, dot, graduated symbol, isoline, cartogram) show patterns. All maps are ' +
        'selective and every projection distorts shape, area, distance or direction; Mercator keeps shape/direction but blows up area near the poles.',
    },
    {
      id: '1.2',
      ced: 'IMP-1.B',
      title: 'Geographic Data',
      minutes: 4,
      summary:
        'Geographic data is collected in the field by organizations and individuals, by geospatial technologies (GIS, satellite navigation, ' +
        'remote sensing, online mapping), and from written and visual sources like field observations, media reports, travel narratives, ' +
        'policy documents, interviews, landscapes and photos.',
      body: String.raw`### Ways to collect it
- **Field data**: gathered on site by organizations (a census bureau) or individuals (a researcher counting pedestrians).
- **Geospatial technologies**:

| Technology | What it does |
|---|---|
| **GIS** (geographic information systems) | Layers different data on the same map to analyze relationships |
| **Satellite navigation** (GPS) | Pinpoints absolute location |
| **Remote sensing** | Collects data from a distance, usually satellites or aircraft (e.g., imagery of deforestation) |
| **Online mapping and visualization** | Web maps and tools anyone can use and share |

- **Written and qualitative sources**: field observations, media reports, travel narratives, policy documents, personal interviews, landscape analysis and photographic interpretation.

Quantitative data (numbers: census counts) and qualitative data (descriptions: interviews) answer different questions, and geographers use both.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'GIS', back: 'Software that layers different spatial data on one map to analyze relationships between them.' },
            { front: 'Remote sensing', back: 'Gathering data from a distance, usually with satellites or aircraft.' },
            { front: 'GPS (satellite navigation)', back: 'Uses satellites to pinpoint an absolute location.' },
            { front: 'Qualitative geographic data', back: 'Descriptions rather than numbers: interviews, travel narratives, field notes, photos, landscape analysis.' },
          ],
        },
      ],
      precheck: {
        question: 'Satellite images used to measure how much rainforest was cleared in a year are an example of:',
        choices: ['Remote sensing', 'A personal interview', 'A travel narrative', 'A plat map'],
        answer: 0,
        explanations: [
          'Correct. Remote sensing collects data from a distance, such as from satellites.',
          'Incorrect. An interview is qualitative data from a person.',
          'Incorrect. A travel narrative is a written account of a journey.',
          'Incorrect. A plat map shows property boundaries.',
        ],
      },
      checkpoints: [
        {
          question: 'A city planner overlays maps of flood zones, school locations, and population density to decide where to build a new school. Which tool is this?',
          choices: ['A geographic information system (GIS)', 'Remote sensing alone', 'A travel narrative', 'A cartogram'],
          answer: 0,
          explanations: [
            'Correct. Layering several data sets on one map to analyze them together is what a GIS does.',
            'Incorrect. Remote sensing gathers imagery; it doesn\'t combine data layers by itself.',
            'Incorrect. A travel narrative is a written account, not an analysis tool.',
            'Incorrect. A cartogram resizes places by one variable.',
          ],
        },
        {
          question: 'Which is an example of qualitative geographic data?',
          choices: [
            'Interviews with residents about how safe their neighborhood feels',
            'The number of people living in each census tract',
            'Average annual rainfall by county',
            'GPS coordinates of every bus stop',
          ],
          answer: 0,
          explanations: [
            'Correct. Interviews capture perceptions and descriptions rather than counts.',
            'Incorrect. Population counts are quantitative.',
            'Incorrect. Rainfall measurements are quantitative.',
            'Incorrect. Coordinates are precise numerical locations.',
          ],
        },
      ],
      revisit:
        'Data comes from the field, from geospatial tech (GIS layers data, GPS locates, remote sensing images from afar, online maps) ' +
        'and from qualitative sources (interviews, narratives, photos, landscapes).',
    },
    {
      id: '1.3',
      ced: 'IMP-1.C',
      title: 'The Power of Geographic Data',
      minutes: 3,
      summary:
        'Census data, satellite imagery and other geospatial data guide decisions at every scale: personal, business, organizational and ' +
        'governmental. Those decisions have geographic effects.',
      body: String.raw`### Data drives decisions at every scale
| Who | Example decision | Data used |
|---|---|---|
| **Individual** | Picking the fastest route to work | Online maps, live traffic |
| **Business** | Choosing where to open a new store | Census income and population data |
| **Organization** | Sending relief supplies after a hurricane | Satellite imagery of the damage |
| **Government** | Redrawing voting districts, funding schools and roads | The census (every 10 years in the U.S.) |

### Decisions have geographic effects
Because these decisions change **where** things happen, they reshape places: a new highway built from traffic data moves businesses and people; census counts shift congressional seats between states; an undercount can mean less funding for a neighborhood.`,
      blocks: [],
      precheck: {
        question: 'The U.S. Census is used to:',
        choices: [
          'Decide how many seats in the House of Representatives each state gets',
          'Measure rainfall in each state',
          'Map the ocean floor',
          'Track individual phone locations',
        ],
        answer: 0,
        explanations: [
          'Correct. Census population counts apportion House seats among the states.',
          'Incorrect. Weather agencies measure rainfall.',
          'Incorrect. That uses sonar and remote sensing, not the census.',
          'Incorrect. The census counts people where they live; it doesn\'t track devices.',
        ],
      },
      checkpoints: [
        {
          question: 'A grocery chain studies census data on income and population density to choose new store locations. This shows geographic data used at which level?',
          choices: ['Business', 'Personal', 'Governmental', 'Global only'],
          answer: 0,
          explanations: [
            'Correct. A company is using the data for its own business decision.',
            'Incorrect. A personal decision would be one person\'s choice, like a route home.',
            'Incorrect. No government decision is being made here.',
            'Incorrect. Choosing store sites is a local or regional decision.',
          ],
        },
        {
          question: 'If a city\'s population is undercounted in the census, what geographic effect is most likely?',
          choices: [
            'The city may receive less federal funding and political representation than it should',
            'The city\'s land area will shrink',
            'The city will receive more funding than it needs',
            'There will be no effect, because census data is not used for decisions',
          ],
          answer: 0,
          explanations: [
            'Correct. Funding formulas and district lines depend on census counts, so an undercount costs the place resources and voice.',
            'Incorrect. The census counts people; it doesn\'t change boundaries on the ground.',
            'Incorrect. An undercount lowers, not raises, the funding tied to population.',
            'Incorrect. Census data is used for many government decisions.',
          ],
        },
      ],
      revisit:
        'Census data and satellite imagery guide personal, business, organizational and government decisions, and those decisions ' +
        'reshape places (funding, districts, store and road locations).',
    },
    {
      id: '1.4',
      ced: 'PSO-1.A',
      title: 'Spatial Concepts',
      minutes: 6,
      summary:
        'Key spatial concepts are absolute and relative location, space, place, flows, distance decay, time-space compression and pattern.',
      body: String.raw`### The vocabulary of where
| Concept | Meaning | Example |
|---|---|---|
| **Absolute location** | Exact position, usually latitude and longitude | 38.9° N, 77.0° W |
| **Relative location** | Position compared with other places | "Two blocks north of the stadium" |
| **Space** | The area between and around things | The spacing of towns across a plain |
| **Place** | A location with its own human and physical characteristics that give it meaning | Your hometown and what makes it distinct |
| **Flows** | Movement of people, goods, money or ideas between places | Migration, trade, the internet |
| **Distance decay** | Interaction declines as distance increases | You visit the closer of two equal parks more often |
| **Time-space compression** | Places feel closer because travel and communication got faster | Video calls across continents in real time |
| **Pattern** | The arrangement of things in space | Clustered, dispersed, linear |

**Distance decay vs time-space compression:** distance decay says far things interact less; time-space compression says technology is **weakening** that effect.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Absolute location', back: 'Exact position on Earth, such as latitude and longitude.' },
            { front: 'Relative location', back: 'Position described in relation to other places.' },
            { front: 'Distance decay', back: 'The farther apart two places are, the less they interact.' },
            { front: 'Time-space compression', back: 'Faster transport and communication make distant places feel closer, reducing distance decay.' },
            { front: 'Place', back: 'A specific location with human and physical characteristics that give it meaning.' },
          ],
        },
      ],
      precheck: {
        question: '"The library is across the street from the high school" describes:',
        choices: ['Relative location', 'Absolute location', 'Distance decay', 'Time-space compression'],
        answer: 0,
        explanations: [
          'Correct. It locates the library by its relationship to another place.',
          'Incorrect. Absolute location uses exact coordinates or an address grid.',
          'Incorrect. Distance decay is about interaction declining with distance.',
          'Incorrect. Time-space compression is about places feeling closer because of technology.',
        ],
      },
      checkpoints: [
        {
          question: 'Customers are much more likely to shop at a store 2 km from home than an identical store 20 km away. This illustrates:',
          choices: ['Distance decay', 'Time-space compression', 'Absolute location', 'Environmental determinism'],
          answer: 0,
          explanations: [
            'Correct. Interaction falls off as distance increases.',
            'Incorrect. That would be technology making the far store feel closer.',
            'Incorrect. Absolute location is a precise position, not a behavior.',
            'Incorrect. Environmental determinism is a theory about nature controlling societies.',
          ],
        },
        {
          question: 'A family can now video-chat daily with relatives on another continent, something that took weeks by letter a century ago. This best illustrates:',
          choices: ['Time-space compression', 'Distance decay', 'Relative location', 'A formal region'],
          answer: 0,
          explanations: [
            'Correct. Technology has shrunk the effective distance between places.',
            'Incorrect. Distance decay predicts less interaction; here interaction increased despite distance.',
            'Incorrect. Relative location describes where something is compared with other places.',
            'Incorrect. A formal region is an area sharing a common trait.',
          ],
        },
      ],
      revisit:
        'Absolute (coordinates) vs relative (compared with other places) location. Place = location with meaning. Flows = movement. ' +
        'Distance decay: far = less interaction; time-space compression: technology shrinks that distance.',
    },
    {
      id: '1.5',
      ced: 'PSO-1.B',
      title: 'Human–Environmental Interaction',
      minutes: 4,
      summary:
        'Nature and society meet through sustainability, natural resources and land use. Thinking about that relationship moved from ' +
        'environmental determinism (environment controls culture) to possibilism (environment limits, people choose).',
      body: String.raw`### Concepts of nature and society
- **Natural resources**: materials from the environment people use (water, soil, timber, minerals). Renewable or nonrenewable.
- **Land use**: how people use land (farming, housing, industry, conservation).
- **Sustainability**: using resources to meet today's needs without compromising future generations' ability to meet theirs.

### Two theories
| Theory | Claim | Status |
|---|---|---|
| **Environmental determinism** | The physical environment (especially climate) **determines** a society's culture and development | Rejected; was used to justify racism and colonialism |
| **Possibilism** | The environment sets **limits and opportunities**, but people **choose** how to respond, using culture and technology | The accepted view |

**Example:** Desert cities like Phoenix exist because people built irrigation and air conditioning: the desert set limits, people chose a response. That's possibilism.`,
      blocks: [],
      precheck: {
        question: 'Possibilism argues that:',
        choices: [
          'The environment sets limits, but people choose how to adapt using culture and technology',
          'Climate determines a society\'s level of development',
          'Humans have no effect on the environment',
          'All resources are unlimited',
        ],
        answer: 0,
        explanations: [
          'Correct. Possibilism stresses human choice within environmental constraints.',
          'Incorrect. That is environmental determinism.',
          'Incorrect. Human–environment interaction runs both ways.',
          'Incorrect. Nonrenewable resources are limited, which is why sustainability matters.',
        ],
      },
      checkpoints: [
        {
          question: 'An early 20th-century writer argued that people in temperate climates were naturally more industrious than people in tropical climates. This reflects:',
          choices: ['Environmental determinism', 'Possibilism', 'Sustainability', 'Time-space compression'],
          answer: 0,
          explanations: [
            'Correct. Claiming climate determines a people\'s character is environmental determinism, a discredited idea.',
            'Incorrect. Possibilism emphasizes human choice, not climate control of behavior.',
            'Incorrect. Sustainability is about long-term resource use.',
            'Incorrect. That concept is about travel and communication technology.',
          ],
        },
        {
          question: 'Farmers in the Andes build terraces on steep slopes to grow crops. This best supports:',
          choices: ['Possibilism', 'Environmental determinism', 'Distance decay', 'A perceptual region'],
          answer: 0,
          explanations: [
            'Correct. The mountains limit farming, but people chose a technology to work within that limit.',
            'Incorrect. The environment didn\'t determine the outcome; people adapted it.',
            'Incorrect. Distance decay concerns interaction over distance.',
            'Incorrect. A perceptual region is defined by people\'s feelings about an area.',
          ],
        },
      ],
      revisit:
        'Natural resources, land use, sustainability. Environmental determinism (environment controls culture, rejected) gave way to ' +
        'possibilism (environment limits, people choose).',
    },
    {
      id: '1.6',
      ced: 'PSO-1.C–PSO-1.D',
      title: 'Scales of Analysis',
      minutes: 4,
      summary:
        'Geographers analyze at global, regional, national and local scales, and the same data can show different patterns, and support ' +
        'different interpretations, at different scales.',
      body: String.raw`### Scale of analysis vs map scale
- **Scale of analysis**: the **level** you study: **global, regional, national, local**.
- **Map scale**: the ratio between distance on the map and on the ground (1:24,000). Different idea; don't mix them up.

### Changing the scale changes the story
A country's average income may look high at the **national** scale, while **local** data reveals poor neighborhoods next to wealthy ones. Life expectancy may be rising **globally** while falling in one **region**.

Exam questions often ask what a pattern looks like "at a different scale of analysis." The answer is usually: **more variation appears** as you zoom in, and **local differences get hidden** as you zoom out.`,
      blocks: [],
      precheck: {
        question: 'Which list gives the scales of analysis the AP Human Geography course uses?',
        choices: ['Global, regional, national, local', 'Large, medium, small', '1:24,000 and 1:1,000,000', 'Urban and rural'],
        answer: 0,
        explanations: [
          'Correct. These four levels are the scales of analysis.',
          'Incorrect. Those words describe map scale loosely, not scales of analysis.',
          'Incorrect. Those are map scales (ratios).',
          'Incorrect. Those are kinds of places, not scales.',
        ],
      },
      checkpoints: [
        {
          question: 'National data show a country\'s literacy rate is 95%. A county-level map reveals some rural counties below 70%. What does this demonstrate?',
          choices: [
            'Patterns can differ at different scales of analysis',
            'The national data must be wrong',
            'Map projections distort literacy rates',
            'Literacy has no spatial pattern',
          ],
          answer: 0,
          explanations: [
            'Correct. The national average hides local variation that appears at a finer scale.',
            'Incorrect. Both can be accurate; they describe different scales.',
            'Incorrect. Projections distort shape and area, not data values.',
            'Incorrect. The county map shows a clear spatial pattern.',
          ],
        },
        {
          question: 'A researcher studies migration between countries in South America. Which scale of analysis is this?',
          choices: ['Regional', 'Local', 'Global', 'Map scale 1:50,000'],
          answer: 0,
          explanations: [
            'Correct. A group of countries in one part of the world is the regional scale.',
            'Incorrect. Local would be a city or neighborhood.',
            'Incorrect. Global would cover the whole world.',
            'Incorrect. That is a map scale ratio, not a scale of analysis.',
          ],
        },
      ],
      revisit:
        'Scales of analysis: global, regional, national, local (not the same as a map scale ratio). Zooming in reveals variation that ' +
        'averages at larger scales hide.',
    },
    {
      id: '1.7',
      ced: 'SPS-1.A',
      title: 'Regional Analysis',
      minutes: 4,
      summary:
        'Regions are areas unified by one or more characteristics or by a pattern of activity. They are formal, functional or ' +
        'perceptual/vernacular, with boundaries that are transitional, often contested and overlapping, at local, national and global scales.',
      body: String.raw`### Three types of regions
| Type | Defined by | Example |
|---|---|---|
| **Formal** (uniform) | A shared trait, measurable and present throughout | A state; the area where Spanish is the main language; the Corn Belt |
| **Functional** (nodal) | Activity organized around a central **node** | A newspaper's delivery area; a cell tower's coverage; a metro commuting area |
| **Perceptual / vernacular** | What people **believe** or feel about an area | "The South," "the Midwest," "downtown" |

### Boundaries are messy
Regional boundaries are often **transitional** (one region fades into another), **contested** (people disagree about where they are), and **overlapping** (a place can be in several regions at once). Geographers apply regional analysis at **local, national and global** scales.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Formal region', back: 'An area sharing a uniform, measurable trait (language, climate, political borders).' },
            { front: 'Functional region', back: 'An area organized around a node by an activity (delivery area, broadcast range, commuter zone).' },
            { front: 'Perceptual (vernacular) region', back: 'An area defined by people\'s shared sense or image of it ("the South").' },
          ],
        },
      ],
      precheck: {
        question: 'The area served by a city\'s airport, where travelers come from surrounding towns, is best described as a:',
        choices: ['Functional region', 'Formal region', 'Perceptual region', 'Scale of analysis'],
        answer: 0,
        explanations: [
          'Correct. It is organized around a central node (the airport) by an activity (travel).',
          'Incorrect. A formal region shares a uniform trait throughout.',
          'Incorrect. A perceptual region exists in people\'s minds.',
          'Incorrect. Scales of analysis are levels of study, not regions.',
        ],
      },
      checkpoints: [
        {
          question: 'People disagree about whether their state belongs to "the Midwest." "The Midwest" is a:',
          choices: ['Perceptual/vernacular region', 'Functional region', 'Formal region', 'Map projection'],
          answer: 0,
          explanations: [
            'Correct. Its boundaries come from people\'s perceptions, which is why they are disputed.',
            'Incorrect. It isn\'t organized around a central node.',
            'Incorrect. There\'s no single measurable trait that defines it uniformly.',
            'Incorrect. A projection is a way of flattening the globe onto a map.',
          ],
        },
        {
          question: 'The area where more than 50% of residents speak French at home is an example of a:',
          choices: ['Formal region', 'Functional region', 'Perceptual region', 'Time-space compression'],
          answer: 0,
          explanations: [
            'Correct. It is defined by a measurable shared characteristic.',
            'Incorrect. It isn\'t defined by connections to a central node.',
            'Incorrect. It is based on data, not on people\'s feelings.',
            'Incorrect. That concept is about technology shrinking distance.',
          ],
        },
      ],
      revisit:
        'Formal = shared measurable trait; functional = organized around a node; perceptual/vernacular = how people imagine it. ' +
        'Boundaries are transitional, contested and overlapping.',
    },
  ],
};

export default pack;
