/**
 * AP Art History Unit 1: Global Prehistory, 30,000–500 BCE — study pack.
 *
 * Written against the AP Art History CED effective Fall 2020 (the current
 * edition; topics 1.1–1.3 and required works 1–11). No photographs are
 * embedded (image rights); each required work is described and identified
 * with the CED's place, date and medium so students can match it to the
 * image set. Activities: a region sort and a chronological timeline of all
 * eleven works.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-art-history/unit-1',
  subject: 'AP Art History',
  unit: 'Unit 1: Global Prehistory, 30,000–500 BCE',
  examWeight: 'about 4% of the exam',
  intro:
    'Art before writing, on every inhabited continent: why prehistoric people made images and objects, what they made them from, ' +
    'and how archaeologists and art historians piece together their meaning. Covers all eleven required works, from the Apollo 11 ' +
    'stones to Stonehenge.',
  sections: [
    {
      id: '1.1',
      ced: 'CUL-1.A',
      title: 'Cultural Influences on Prehistoric Art',
      minutes: 7,
      summary:
        'Art existed worldwide before writing and shares a concern with the natural world and people\'s place in it. Prehistory is ' +
        'divided into the Paleolithic, Mesolithic and Neolithic, shaped by ice ages, a drying Sahara and land bridges. Early art ' +
        'accompanied survival: food, settlement, status and burial. Many cultures tracked stable phenomena from solstices to local stone, clay and jade.',
      body: String.raw`### Before the written record
Prehistoric art isn't just European cave painting: **very early art appears worldwide**, and it shares a concern with **the natural world and humans' place in it**.

| Period | Meaning | Changes in the environment |
|---|---|---|
| **Paleolithic** | "Old Stone Age" | Ice ages in Europe |
| **Mesolithic** | "Middle Stone Age" | The Sahara's grasslands turning to desert |
| **Neolithic** | "New Stone Age" (farming, settlement) | Land bridges in Southeast Asia, letting people reach Pacific islands |

### Art and survival
The first people were small groups of **hunter-gatherers** focused on survival, so most objects were **practical tools**. But from the earliest times there were also objects of **unknown purpose**: **ritual and symbolic works**, perhaps meant to encourage plentiful plants and animals. Art making was tied to **food production, settlement, displays of status and burial**.

Across regions with no contact, art shows awareness of **stable phenomena**: from the **macrocosmic** (astronomical cycles like solstices and equinoxes) to the **microcosmic** (durable local materials like stone, hardened clay and jade).

### Required works for this topic
- **1. Apollo 11 stones**: Namibia, c. 25,500–25,300 BCE, charcoal on stone. Animal figures drawn on stone slabs, among the oldest figurative art in Africa. The cave was named for the Apollo 11 Moon landing, which happened while it was being excavated in 1969.
- **9. The Ambum stone**: Ambum Valley, Enga Province, Papua New Guinea, c. 1500 BCE, greywacke. A carved creature with a long snout and folded limbs, possibly a ritual object; its exact meaning is unknown.
- **10. Tlatilco female figurine**: central Mexico, site of Tlatilco, 1200–900 BCE, ceramic. Small clay figures, many found in burials, often with exaggerated hips and some with two faces or heads, suggesting ideas of duality or the supernatural.`,
      blocks: [],
      precheck: {
        question: 'Which statement about prehistoric art does the CED emphasize?',
        choices: [
          'Very early art is found worldwide and shares a concern with the natural world',
          'Prehistoric art was made only in Europe',
          'Prehistoric people made no practical objects',
          'All prehistoric art was made for decoration only',
        ],
        answer: 0,
        explanations: [
          'Correct. Art appears across the globe, focused on nature and humans\' place in it.',
          'Incorrect. Europe is often over-emphasized; early art is global.',
          'Incorrect. Most early objects were practical tools.',
          'Incorrect. Many works had ritual or symbolic purposes.',
        ],
      },
      checkpoints: [
        {
          question: 'Why might the Tlatilco female figurines have been placed in burials?',
          choices: [
            'They likely had ritual or symbolic meaning tied to death or the afterlife',
            'They were used as everyday cooking tools',
            'They were made to be sold at markets',
            'They are maps of the Tlatilco settlement',
          ],
          answer: 0,
          explanations: [
            'Correct. Art making was associated with burial and ritual.',
            'Incorrect. Their form suggests symbolic, not practical, use.',
            'Incorrect. There\'s no evidence of that.',
            'Incorrect. They are figures, not maps.',
          ],
        },
        {
          question: 'Which pair best illustrates the CED\'s idea of "macrocosmic" and "microcosmic" awareness?',
          choices: [
            'Aligning monuments to solstices, and using durable local stone or jade',
            'Painting portraits, and writing poems',
            'Trading with distant cities, and minting coins',
            'Building roads, and forging iron weapons',
          ],
          answer: 0,
          explanations: [
            'Correct. Astronomical cycles (macro) and permanent local materials (micro).',
            'Incorrect. Neither reflects the CED\'s examples.',
            'Incorrect. Those belong to later societies.',
            'Incorrect. Iron working comes much later.',
          ],
        },
      ],
      revisit:
        'Art is global before writing, focused on nature. Paleolithic, Mesolithic, Neolithic shaped by environmental change. Practical ' +
        'tools plus ritual objects; art tied to food, settlement, status, burial. Works: Apollo 11 stones, Ambum stone, Tlatilco figurine.',
    },
    {
      id: '1.2',
      ced: 'MPT-1.A',
      title: 'Materials, Processes, and Techniques in Prehistoric Art',
      minutes: 8,
      summary:
        'Major media first appeared on different continents, with Africa and Asia leading: ceramics, painting and incised designs on rock, ' +
        'figurines and megalithic architecture. The first art (about 77,000 years ago) was rock painting and carved ocher. Asia gave jade ' +
        'working and the earliest ceramics; Lapita potters carried incised designs across the Pacific; Europe and the Americas made figures, cave paintings and monuments.',
      body: String.raw`### Firsts around the world
Important media appeared on different continents, **with Africa and Asia first**: fired **ceramics**, **painting** and **incised designs** (mostly on rock), **sculpture** (especially female and animal figurines), and **architecture** (megalithic stone installations). The first "art," about **77,000 years ago**, was rock painting and carved natural materials such as **ocher**.

| Region | Contributions |
|---|---|
| **Asia** | Cave painting across Central Asia, Iran and India; **jade** ritual objects in China (a 5,000-year tradition); **the earliest ceramics** (Jōmon Japan, c. 10,500 BCE, and earlier in China); Iranian pottery refined by the **potter's wheel** (4th millennium BCE) |
| **Pacific** | Migration over land bridges about 45,000 years ago; **Lapita** potters (from about 4,000 years ago) spread **incised geometric designs** from Melanesia to Polynesia |
| **Europe** | Small figurines, **cave paintings** (France, Spain), outdoor **stone monuments** (British Isles); a mix of naturalism and abstraction |
| **Americas** | Sculpture first in **animal bone**, later **clay**; animals and sacred humans; figures fitted to the material's natural shape |

### Required works for this topic
- **3. Camelid sacrum in the shape of a canine**: Tequixquiac, central Mexico, 14,000–7000 BCE, bone. The pelvic bone of an extinct camelid, carved so its natural shape becomes a dog-like head: the artist worked **with** the material.
- **4. Running horned woman**: Tassili n'Ajjer, Algeria, 6000–4000 BCE, pigment on rock. A horned figure in motion with body decoration, painted when the Sahara was still green grassland.
- **5. Beaker with ibex motifs**: Susa, Iran, 4200–3500 BCE, painted terra cotta. Thin-walled pottery from a cemetery; an ibex reduced to geometry, its huge curved horns forming a circle, with running dogs and long-necked birds in bands above.
- **6. Anthropomorphic stele**: Arabian Peninsula, fourth millennium BCE, sandstone. An upright stone carved as a human figure with a belt and a double-bladed knife, probably a memorial to an individual.
- **7. Jade cong**: Liangzhu, China, 3300–2200 BCE, carved jade. A square tube around a circular core, decorated with faces at the corners. Jade is too hard to carve with a knife; it was **ground with abrasive sand**, an enormous investment of labor that signaled status. Found in elite burials.
- **11. Terra cotta fragment**: Lapita, Reef Islands, Solomon Islands, 1000 BCE, incised terra cotta. Fine geometric patterns pressed and incised into pottery; similar designs survive today in Pacific **tattoo** and **barkcloth**.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Where was each required work made?',
            buckets: ['Africa', 'Europe', 'Americas', 'Asia', 'Pacific'],
            items: [
              { label: 'Apollo 11 stones', bucket: 0, why: 'Namibia.' },
              { label: 'Running horned woman', bucket: 0, why: 'Tassili n\'Ajjer, Algeria.' },
              { label: 'Great Hall of the Bulls', bucket: 1, why: 'Lascaux, France.' },
              { label: 'Stonehenge', bucket: 1, why: 'Wiltshire, United Kingdom.' },
              { label: 'Camelid sacrum in the shape of a canine', bucket: 2, why: 'Tequixquiac, central Mexico.' },
              { label: 'Tlatilco female figurine', bucket: 2, why: 'Central Mexico.' },
              { label: 'Beaker with ibex motifs', bucket: 3, why: 'Susa, Iran.' },
              { label: 'Jade cong', bucket: 3, why: 'Liangzhu, China.' },
              { label: 'Anthropomorphic stele', bucket: 3, why: 'The Arabian Peninsula, in West Asia.' },
              { label: 'The Ambum stone', bucket: 4, why: 'Papua New Guinea.' },
              { label: 'Lapita terra cotta fragment', bucket: 4, why: 'Reef Islands, Solomon Islands.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'How was the Liangzhu jade cong shaped?',
        choices: [
          'By grinding the hard stone with abrasive sand',
          'By carving it easily with a stone knife',
          'By melting and casting it in a mold',
          'By modeling it from wet clay',
        ],
        answer: 0,
        explanations: [
          'Correct. Jade is too hard to carve directly, so it was ground with abrasives.',
          'Incorrect. Jade is harder than most stone tools.',
          'Incorrect. Jade isn\'t melted and cast.',
          'Incorrect. It is stone, not ceramic.',
        ],
      },
      checkpoints: [
        {
          question: 'The camelid sacrum carved to resemble a canine head best demonstrates:',
          choices: [
            'An artist adapting an image to the natural form of the material',
            'The use of the potter\'s wheel',
            'Megalithic architecture',
            'Incised Lapita designs',
          ],
          answer: 0,
          explanations: [
            'Correct. The bone\'s existing shape suggested the animal.',
            'Incorrect. It is carved bone, not pottery.',
            'Incorrect. It is a small object, not a stone monument.',
            'Incorrect. Lapita work is Pacific pottery.',
          ],
        },
        {
          question: 'What does the Running horned woman suggest about the Sahara in 6000–4000 BCE?',
          choices: [
            'It was a fertile grassland that supported people and animals',
            'It was already the desert it is today',
            'It was covered by an ice sheet',
            'It was uninhabited',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED notes the Sahara\'s grassland later became desert.',
            'Incorrect. The desert came later.',
            'Incorrect. Ice ages affected Europe, not the Sahara.',
            'Incorrect. The paintings show people lived there.',
          ],
        },
      ],
      revisit:
        'First art ~77,000 years ago (rock painting, carved ocher). Africa and Asia led: ceramics (Jōmon), jade (Liangzhu), potter\'s ' +
        'wheel (Iran). Lapita incised pottery across the Pacific. Europe: figures, caves, megaliths. Americas: bone, then clay.',
    },
    {
      id: '1.3',
      ced: 'THR-1.A',
      title: 'Theories and Interpretations of Prehistoric Art',
      minutes: 7,
      summary:
        'Knowledge of prehistoric art comes from collaboration with scientists. Excavation and carbon-14 dating reveal connections, but ' +
        'few works survive, so explanations stay partly conjecture. Ethnographic analogy and the history of religion (shamanism) support ' +
        'theories. Stratigraphic archaeology (since about 1900) records exactly where everything is found; function is inferred from tools, food and survival.',
      body: String.raw`### How we know what we know
Art historians understand prehistoric art through **collaboration with social and physical scientists**.
| Method | What it contributes |
|---|---|
| **Excavation** and **carbon-14 dating** | Dates and connections between works across the world |
| **Stratigraphic archaeology** (since about 1900) | Records each layer and the exact location of every object, showing how people and art spread |
| **Ethnographic analogy** | Uses modern traditional cultures' practices as models for ancient ones |
| **History of religion** | Notes **shamanism** as the earliest, most widespread spiritual approach |

Because so **few works survive**, reasons for similarities and differences remain **largely conjecture**. Function is **inferred** from evidence of technology, tools, food sources and survival strategies.

### Required works for this topic
**2. Great Hall of the Bulls**, Lascaux, France, 15,000–13,000 BCE, rock painting.
- Huge aurochs (wild cattle), horses and deer painted with mineral pigments deep inside a cave, far from daylight, discovered in 1940.
- Animals are shown in profile but with horns turned toward the viewer (**twisted perspective**).
- **Interpretations**: hunting magic (to ensure a successful hunt), shamanic ritual (trance journeys into the spirit world), or records of seasons and animals. The cave's location away from living areas suggests ritual use. Archaeologists found it; art historians then interpreted it.

**8. Stonehenge**, Wiltshire, UK, c. 2500–1600 BCE, sandstone.
- A ring of huge sarsen stones capped with lintels (**post-and-lintel** construction, with joints like woodworking), plus smaller bluestones brought from Wales, built in phases.
- Aligned with the **summer solstice sunrise** and **winter solstice sunset**.
- **Interpretations**: a ceremonial site, a calendar or observatory, a place of burial and healing. Excavated human remains and the solar alignment support ritual and astronomical readings; no single theory is proven.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Put the eleven required works in order by date',
            events: [
              { year: -25500, when: 'c. 25,500 BCE', label: 'Apollo 11 stones' },
              { year: -15000, when: '15,000 BCE', label: 'Great Hall of the Bulls' },
              { year: -14000, when: '14,000 BCE', label: 'Camelid sacrum' },
              { year: -6000, when: '6000 BCE', label: 'Running horned woman' },
              { year: -4200, when: '4200 BCE', label: 'Beaker with ibex motifs' },
              { year: -4000, when: '4th millennium BCE', label: 'Anthropomorphic stele' },
              { year: -3300, when: '3300 BCE', label: 'Jade cong' },
              { year: -2500, when: 'c. 2500 BCE', label: 'Stonehenge' },
              { year: -1500, when: 'c. 1500 BCE', label: 'The Ambum stone' },
              { year: -1200, when: '1200 BCE', label: 'Tlatilco female figurine' },
              { year: -1000, when: '1000 BCE', label: 'Lapita terra cotta fragment' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Using modern traditional cultures\' practices as models for interpreting ancient ones is called:',
        choices: ['Ethnographic analogy', 'Carbon-14 dating', 'Stratigraphy', 'Twisted perspective'],
        answer: 0,
        explanations: [
          'Correct. That is the CED\'s term.',
          'Incorrect. Carbon-14 dating measures age.',
          'Incorrect. Stratigraphy records the layers where objects are found.',
          'Incorrect. That is a way of depicting animals.',
        ],
      },
      checkpoints: [
        {
          question: 'Why do interpretations of works like the Lascaux paintings remain partly conjecture?',
          choices: [
            'Few works survive and there are no written records from the people who made them',
            'Carbon-14 dating doesn\'t work on any materials',
            'The paintings were made in the 1940s',
            'Art historians refuse to work with archaeologists',
          ],
          answer: 0,
          explanations: [
            'Correct. Limited evidence means theories can\'t be confirmed directly.',
            'Incorrect. Carbon dating is a key tool.',
            'Incorrect. They were discovered in 1940, made about 15,000 years earlier.',
            'Incorrect. The CED stresses that the disciplines work together.',
          ],
        },
        {
          question: 'Which evidence best supports the theory that Stonehenge had an astronomical function?',
          choices: [
            'Its alignment with the summer solstice sunrise and winter solstice sunset',
            'The use of sandstone',
            'Its location in Wiltshire',
            'The size of the bluestones alone',
          ],
          answer: 0,
          explanations: [
            'Correct. The solar alignment ties the monument to the calendar.',
            'Incorrect. The material doesn\'t indicate astronomy.',
            'Incorrect. Location alone doesn\'t show function.',
            'Incorrect. Size says nothing about astronomy.',
          ],
        },
      ],
      revisit:
        'Interdisciplinary: excavation, carbon-14, stratigraphy (c. 1900), ethnographic analogy, shamanism. Few survivals → conjecture. ' +
        'Lascaux: twisted perspective, hunting magic/shamanism theories. Stonehenge: post-and-lintel, solstice alignment, ritual/astronomy theories.',
    },
  ],
};

export default pack;
