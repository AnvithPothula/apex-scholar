/**
 * AP World History: Modern Unit 2: Networks of Exchange (c. 1200–c. 1450) —
 * study pack.
 *
 * Written against the AP World History: Modern CED (2026 edition, topics
 * 2.1–2.7; key concepts KC-3.1, 3.2 and 3.3). The unit follows three trade
 * networks (the Silk Roads, the Indian Ocean and the trans-Saharan routes),
 * the Mongol Empire that tied much of Eurasia together, and what moved along
 * the routes besides goods: religions, technologies, crops and the plague.
 * A timeline and a three-network sort practice causation and comparison.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-world-history-modern/unit-2',
  subject: 'AP World History: Modern',
  unit: 'Unit 2: Networks of Exchange',
  examWeight: '8–10% of the exam',
  intro:
    'Between 1200 and 1450, trade routes across Asia, the Indian Ocean and the Sahara carried more goods farther than ever. ' +
    'The Mongols linked much of Eurasia, merchants settled in foreign ports, and travelers wrote about what they saw. Along ' +
    'with silk, spices and gold came religions, technologies, crops and the plague.',
  sections: [
    {
      id: '2.1',
      ced: 'KC-3.1.I.A.i, KC-3.1.I.C.i, KC-3.3.I.B',
      title: 'The Silk Roads',
      minutes: 7,
      summary:
        'Overland routes across Central Asia grew busier as commercial practices improved: caravanserai, credit, and money ' +
        'economies. Trade in luxury goods grew, trading cities such as Kashgar and Samarkand flourished, and Chinese, Persian ' +
        'and Indian producers made more textiles and porcelain for export.',
      body: String.raw`### Why trade grew
The Silk Roads were old, but after 1200 the **volume** of trade and the **range** of the routes grew because of better commercial practices:
- **Caravanserai**: roadside inns spaced about a day's travel apart, where merchants, animals and goods could rest safely.
- **Forms of credit**: **bills of exchange** let a merchant deposit money in one city and collect it in another, so they didn't have to carry heavy coins past bandits.
- **Banking houses** and **money economies**, including **paper money** in China.

### What moved
Mostly **luxury goods**: they were light and valuable enough to be worth the long, expensive journey by camel. Silk, porcelain, spices, precious metals and horses.

### Effects
- **Trading cities grew rich**, such as **Kashgar** and **Samarkand** in Central Asia.
- **Demand for luxury goods rose** across Afro-Eurasia, so Chinese, Persian and Indian artisans expanded production of **textiles and porcelain** for export.
- **Iron and steel manufacturing expanded in China**.

### Causation chain
Better commercial practices → more trade and longer routes → richer trading cities and more production for export.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Caravanserai', back: 'Roadside inns along trade routes where merchants and animals could rest safely.' },
            { front: 'Bills of exchange', back: 'Paper credit that let merchants deposit money in one place and collect it in another.' },
            { front: 'Kashgar and Samarkand', back: 'Central Asian cities that grew wealthy from Silk Roads trade.' },
            { front: 'Why luxury goods?', back: 'Overland transport was slow and costly, so only light, high-value goods were worth carrying.' },
          ],
        },
      ],
      precheck: {
        question: 'Why did Silk Roads merchants mostly trade luxury goods?',
        choices: [
          'Overland transport was slow and costly, so only light, valuable goods were worth carrying',
          'Governments banned trade in everyday goods',
          'Bulk goods such as grain spoiled in caravanserai',
          'Camels could not carry goods heavier than silk',
        ],
        answer: 0,
        explanations: [
          'Correct. High transport costs meant only high-value goods made a profit over such distances.',
          'Incorrect. There was no such general ban.',
          'Incorrect. Caravanserai provided shelter; they didn\'t spoil goods.',
          'Incorrect. Camels carried heavy loads; cost and distance were the issue.',
        ],
      },
      checkpoints: [
        {
          question: 'How did bills of exchange encourage trade on the Silk Roads?',
          choices: [
            'Merchants could move value between cities without carrying large amounts of coin',
            'They gave merchants the right to enter any city without paying taxes',
            'They replaced the need for caravanserai',
            'They banned the use of paper money',
          ],
          answer: 0,
          explanations: [
            'Correct. Credit made long-distance trade safer and easier.',
            'Incorrect. Bills of exchange were a credit tool, not a tax exemption.',
            'Incorrect. Merchants still needed places to rest along the routes.',
            'Incorrect. Paper money also spread, especially in China.',
          ],
        },
        {
          question: 'Which was an effect of rising demand for luxury goods in Afro-Eurasia?',
          choices: [
            'Chinese, Persian and Indian artisans expanded production of textiles and porcelain for export',
            'Trade along the Silk Roads came to a stop',
            'Central Asian trading cities lost population',
            'China stopped making iron and steel',
          ],
          answer: 0,
          explanations: [
            'Correct. Producers responded to demand by making more for export.',
            'Incorrect. Trade volume grew in this period.',
            'Incorrect. Cities such as Samarkand grew wealthy.',
            'Incorrect. Chinese iron and steel production expanded.',
          ],
        },
      ],
      revisit:
        'Caravanserai, bills of exchange, banking and paper money → more trade, longer routes → rich cities (Kashgar, Samarkand). ' +
        'Luxury goods dominate. Demand → more textiles and porcelain for export; Chinese iron and steel expand.',
    },
    {
      id: '2.2',
      ced: 'KC-3.2.I.B.iii, KC-3.1.I.E.i, KC-3.2.II.A.ii',
      title: 'The Mongol Empire and the Making of the Modern World',
      minutes: 8,
      summary:
        'The Mongols built the largest land empire in history, replacing collapsed states with khanates. By uniting much of ' +
        'Eurasia they made trade and travel safer and drew new peoples into trade networks, and they moved technologies and ideas ' +
        'between regions.',
      body: String.raw`### Rise and division
- **1206**: Temujin unites the Mongol tribes and takes the title **Genghis (Chinggis) Khan**.
- Mongol armies, using mounted archers, mobility and terror, conquered northern China, Central Asia, Persia and Russia.
- After Genghis's death the empire split into **khanates**:

| Khanate | Region |
|---|---|
| **Yuan dynasty** (Kublai Khan) | China |
| **Ilkhanate** | Persia and Mesopotamia |
| **Golden Horde** | Russia |
| **Chagatai Khanate** | Central Asia |

The CED's point: empires **collapsed** in several regions (the Abbasid Caliphate fell when the Mongols sacked **Baghdad in 1258**; the Song dynasty fell to the Yuan) and were **replaced by new imperial states**, including the khanates.

### Effects on trade and communication
The **Pax Mongolica** made Eurasian routes safer. The Mongols protected merchants, built relay stations for messengers, and issued passes (paiza) for safe travel. New peoples were drawn into the conquerors' economies and trade networks.

### Technological and cultural transfers
Contact and conflict moved knowledge across Eurasia. Illustrative examples:
- Greco-Islamic **medical knowledge** reached western Europe.
- **Numbering systems** (Hindu-Arabic numerals) spread to Europe.
- The Mongols adopted the **Uyghur script** to write their own language.

### Limits
The Mongols didn't win everywhere: the Mamluks of Egypt defeated them at **Ain Jalut** (1260), and invasions of **Japan** failed in 1274 and 1281.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Networks of exchange, 1200–1450',
            events: [
              { year: 1206, label: 'Genghis Khan unites the Mongols' },
              { year: 1258, label: 'Mongols sack Baghdad' },
              { year: 1271, label: 'Kublai Khan founds the Yuan dynasty' },
              { year: 1324, label: 'Mansa Musa\'s pilgrimage to Mecca' },
              { year: 1347, label: 'The Black Death reaches the Mediterranean' },
              { year: 1405, label: 'Zheng He\'s first voyage' },
            ],
          },
        },
      ],
      precheck: {
        question: 'How did the Mongol Empire affect trade across Eurasia?',
        choices: [
          'Unifying much of Eurasia made routes safer and drew new peoples into trade networks',
          'Mongol rulers banned long-distance trade to protect local farmers',
          'Mongol conquest permanently closed the Silk Roads',
          'The Mongols traded only by sea',
        ],
        answer: 0,
        explanations: [
          'Correct. The Pax Mongolica protected merchants and expanded trade and communication.',
          'Incorrect. The Mongols encouraged and protected trade.',
          'Incorrect. Silk Roads trade flourished under Mongol rule.',
          'Incorrect. The Mongols were a land empire that protected overland routes.',
        ],
      },
      checkpoints: [
        {
          question: 'The Mongol sack of Baghdad in 1258 best illustrates which development in this period?',
          choices: [
            'Older empires collapsed and were replaced by new imperial states such as the Mongol khanates',
            'The Abbasid Caliphate expanded into Central Asia',
            'Islam stopped spreading after 1258',
            'The Mongols converted Baghdad into their capital for the whole empire',
          ],
          answer: 0,
          explanations: [
            'Correct. It ended the Abbasid Caliphate, and the Ilkhanate ruled the region.',
            'Incorrect. The Abbasid Caliphate ended, not expanded.',
            'Incorrect. Islam kept spreading, and later Ilkhanate rulers converted.',
            'Incorrect. The empire had no single capital in Baghdad.',
          ],
        },
        {
          question: 'Which is an example of a technological or cultural transfer encouraged by Mongol-era contacts?',
          choices: [
            'Hindu-Arabic numerals and Greco-Islamic medical knowledge reaching western Europe',
            'The invention of the camel saddle in West Africa',
            'The founding of the Swahili city-states',
            'The construction of the Great Zimbabwe walls',
          ],
          answer: 0,
          explanations: [
            'Correct. These are the CED\'s examples of knowledge moving across Eurasia.',
            'Incorrect. Camel saddles relate to trans-Saharan trade.',
            'Incorrect. The Swahili city-states grew from Indian Ocean trade.',
            'Incorrect. Great Zimbabwe isn\'t connected to Mongol contacts.',
          ],
        },
      ],
      revisit:
        'Genghis Khan 1206; khanates (Yuan, Ilkhanate, Golden Horde, Chagatai) replace collapsed states (Baghdad 1258). Pax Mongolica ' +
        'boosts trade and communication; transfers of medicine, numerals, Uyghur script. Limits: Ain Jalut, Japan.',
    },
    {
      id: '2.3',
      ced: 'KC-3.1.I.A.ii–iii, KC-3.1.I.C.ii, KC-3.1.III.B, KC-3.2.II.A.iii, KC-3.1.II.A.i',
      title: 'Exchange in the Indian Ocean',
      minutes: 8,
      summary:
        'Knowledge of the monsoon winds plus the compass, astrolabe and larger ships expanded Indian Ocean trade, which built ' +
        'states such as the Swahili city-states, Gujarat and Malacca. Merchants formed diasporic communities that blended ' +
        'cultures, and Ming China\'s Zheng He sailed the ocean on huge voyages.',
      body: String.raw`### Why the Indian Ocean network grew
- **Environmental knowledge**: sailors learned the **monsoon winds**, which blow in one direction for part of the year and reverse for the rest. Timing voyages to the monsoons made trade predictable.
- **Technology**: the **compass** (from China), the **astrolabe**, and **larger ship designs** such as the Chinese junk and the Arab dhow.
- **Commercial practices** spread from other networks.

By sea, ships could carry bulk goods (rice, timber, cotton cloth) as well as luxuries, at lower cost than camels.

### States built on trade
| State | Where | Why it mattered |
|---|---|---|
| **Swahili city-states** (Kilwa, Mombasa) | East African coast | Exported gold, ivory and other goods; Muslim merchant elites |
| **Gujarat** | Western India | Major textile producer and trading hub |
| **Sultanate of Malacca** | Strait of Malacca, Southeast Asia | Controlled a key chokepoint between the Indian Ocean and the South China Sea |

### Diasporic communities
Merchants settled in foreign ports: **Arab and Persian** communities in East Africa, **Chinese** merchants in Southeast Asia, **Malay** communities across the basin. They brought their own traditions and absorbed local ones. The **Swahili language**, a Bantu language with many Arabic words, is a product of this blending.

### Zheng He
Between **1405 and 1433**, Ming Admiral **Zheng He** led seven huge voyages, with fleets of very large ships, as far as East Africa. The goal was to display Ming power and draw states into the **tribute system**, not to conquer or trade for profit. The voyages encouraged contact and exchange, then ended, and China turned inward.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Monsoon winds', back: 'Seasonal winds that reverse direction; knowing them made Indian Ocean voyages predictable.' },
            { front: 'Swahili city-states', back: 'East African trading ports such as Kilwa and Mombasa, led by Muslim merchant elites.' },
            { front: 'Sultanate of Malacca', back: 'Southeast Asian state that grew rich controlling the Strait of Malacca.' },
            { front: 'Diasporic community', back: 'Merchants who settled in a foreign port and blended their culture with local culture.' },
            { front: 'Zheng He (1405–1433)', back: 'Ming admiral whose seven voyages displayed Chinese power and expanded the tribute system.' },
          ],
        },
      ],
      precheck: {
        question: 'Which environmental knowledge was most important to Indian Ocean trade?',
        choices: [
          'The seasonal pattern of the monsoon winds',
          'The location of oases in the Sahara',
          'The routes through the Hindu Kush mountains',
          'The timing of Nile River floods',
        ],
        answer: 0,
        explanations: [
          'Correct. Sailors timed voyages to the monsoons, which reverse direction seasonally.',
          'Incorrect. Oases mattered for trans-Saharan caravans.',
          'Incorrect. Mountain passes mattered for overland routes.',
          'Incorrect. Nile floods mattered for Egyptian farming.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains the growth of the Sultanate of Malacca?',
          choices: [
            'It controlled a strategic strait on the main sea route between the Indian Ocean and the South China Sea',
            'It was the capital of the Mongol Yuan dynasty',
            'It controlled the gold mines of West Africa',
            'It was the western terminus of the Silk Roads',
          ],
          answer: 0,
          explanations: [
            'Correct. Controlling the strait let Malacca tax and host passing trade.',
            'Incorrect. The Yuan capital was in China.',
            'Incorrect. West African gold went across the Sahara.',
            'Incorrect. Malacca was a maritime port in Southeast Asia.',
          ],
        },
        {
          question: 'The Swahili language, a Bantu language with many Arabic words, best illustrates',
          choices: [
            'cultural blending in diasporic merchant communities',
            'the Mongol adoption of the Uyghur script',
            'the decline of Indian Ocean trade',
            'the spread of the bubonic plague',
          ],
          answer: 0,
          explanations: [
            'Correct. Arab merchants and East African communities influenced each other\'s cultures.',
            'Incorrect. That is a Mongol-era transfer in Central Asia.',
            'Incorrect. Swahili developed as trade grew.',
            'Incorrect. Language blending isn\'t related to disease.',
          ],
        },
      ],
      revisit:
        'Monsoon knowledge + compass, astrolabe, larger ships → more Indian Ocean trade, including bulk goods. States: Swahili ' +
        'city-states, Gujarat, Malacca. Diasporic communities blend cultures (Swahili). Zheng He 1405–1433: tribute, not conquest.',
    },
    {
      id: '2.4',
      ced: 'KC-3.1.II.A.ii, KC-3.1.I.A.iv, KC-3.1.I.E.ii',
      title: 'Trans-Saharan Trade Routes',
      minutes: 6,
      summary:
        'Camels, camel saddles and organized caravans made crossing the Sahara practical, expanding trade in gold, salt and ' +
        'enslaved people. The Mali Empire grew rich by controlling that trade, drawing West Africa into wider Afro-Eurasian networks.',
      body: String.raw`### Technology makes the desert crossable
- **Camels** can go days without water and carry heavy loads.
- The **camel saddle** let riders and loads sit securely on the animal.
- **Caravans** of hundreds or thousands of camels traveled together for safety, stopping at oases.

These improvements increased the **volume** and **range** of trans-Saharan trade.

### What moved
| South to north | North to south |
|---|---|
| **Gold**, ivory, enslaved people | **Salt**, cloth, horses, manufactured goods |

West Africa had gold but little salt, which people need to survive in a hot climate; the Sahara had salt mines but no gold. That mismatch drove the trade.

### The Mali Empire
- Founded by **Sundiata** in the 1230s, Mali controlled the gold fields and the trade routes.
- Rulers taxed trade and grew rich.
- **Mansa Musa**'s pilgrimage to Mecca (**1324**) was so lavish that his gifts of gold reportedly lowered gold's value in Cairo for years. It advertised Mali's wealth across the Islamic world.
- **Timbuktu** became a center of trade and Islamic learning.

The CED's point: the expansion of empires such as **Mali** drew new peoples into the economies and trade networks of Afro-Eurasia.`,
      blocks: [],
      precheck: {
        question: 'Which innovation most directly encouraged trans-Saharan trade?',
        choices: [
          'The camel saddle and organized camel caravans',
          'The magnetic compass on large ocean ships',
          'Paper money issued by the Song dynasty',
          'The Mongol relay system',
        ],
        answer: 0,
        explanations: [
          'Correct. Camel technology made crossing the Sahara practical at scale.',
          'Incorrect. The compass mattered for sea trade.',
          'Incorrect. Paper money was a Chinese commercial practice.',
          'Incorrect. The relay system served the Mongol Empire in Eurasia.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains the wealth of the Mali Empire?',
          choices: [
            'It controlled gold sources and taxed the trans-Saharan trade routes',
            'It controlled the Strait of Malacca',
            'It produced most of the world\'s porcelain',
            'It was part of the Mongol Empire',
          ],
          answer: 0,
          explanations: [
            'Correct. Gold and control of trade made Mali rich.',
            'Incorrect. Malacca is in Southeast Asia.',
            'Incorrect. Porcelain came mainly from China.',
            'Incorrect. The Mongols never ruled West Africa.',
          ],
        },
        {
          question: 'Mansa Musa\'s pilgrimage to Mecca in 1324 best illustrates',
          choices: [
            'how trans-Saharan trade and Islam connected West Africa to the wider Afro-Eurasian world',
            'the decline of Mali\'s economy',
            'the spread of Buddhism into Africa',
            'Mongol control of the Sahara',
          ],
          answer: 0,
          explanations: [
            'Correct. His journey displayed Mali\'s gold and its ties to the Islamic world.',
            'Incorrect. The pilgrimage showed Mali at the height of its wealth.',
            'Incorrect. Mansa Musa was Muslim.',
            'Incorrect. The Mongols never controlled the Sahara.',
          ],
        },
      ],
      revisit:
        'Camels, camel saddles and caravans → more trans-Saharan trade. Gold and enslaved people north; salt and goods south. ' +
        'Mali (Sundiata, Mansa Musa 1324, Timbuktu) grew rich by controlling the trade.',
    },
    {
      id: '2.5',
      ced: 'KC-3.1.III.D, KC-3.3.II, KC-3.1.III.C',
      title: 'Cultural Consequences of Connectivity',
      minutes: 7,
      summary:
        'Trade spread religions, literature, art, science and technology across Afro-Eurasia. Cities rose and fell with trade, ' +
        'productivity and disease. More travelers wrote about their journeys, and their accounts are sources you need to read ' +
        'with their point of view in mind.',
      body: String.raw`### What spread (illustrative examples)
| Kind of diffusion | Examples |
|---|---|
| **Religion** | Buddhism's influence in East Asia; Hinduism and Buddhism into Southeast Asia; Islam into sub-Saharan Africa and Asia |
| **Technology** | **Gunpowder** and **paper** from China |
| **Literature, art, science** | Translated texts, artistic styles, mathematics and medicine moving between regions |

### Cities rose and fell
Some cities **declined** (Baghdad after 1258; many cities during the plague). Others **grew**, supported by rising productivity and expanding trade (Hangzhou, Cairo, Venice, Malacca).

### Travelers and their accounts
| Traveler | From | Journeys |
|---|---|---|
| **Ibn Battuta** | Morocco | Across the Islamic world, from West Africa to China (1325–1354) |
| **Marco Polo** | Venice | To Yuan China and the court of Kublai Khan (late 1200s) |
| **Margery Kempe** | England | Christian pilgrimages to Jerusalem, Rome and Spain (early 1400s) |

### Sourcing (skill 2.A)
Travel accounts show **point of view**. Ibn Battuta judged places by Islamic law and was often critical where it wasn't followed. Marco Polo's book was co-written with a romance writer and was aimed at a European audience. Ask who wrote it, why, for whom, and in what situation.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Ibn Battuta', back: 'Moroccan Muslim scholar who traveled across the Islamic world, from West Africa to China.' },
            { front: 'Marco Polo', back: 'Venetian merchant whose account described Yuan China for European readers.' },
            { front: 'Margery Kempe', back: 'English Christian mystic who wrote about her pilgrimages.' },
            { front: 'Gunpowder and paper', back: 'Chinese technologies that spread west along exchange networks.' },
          ],
        },
      ],
      precheck: {
        question: 'Which technology spread from China to other parts of Afro-Eurasia in this period?',
        choices: [
          'Gunpowder',
          'The camel saddle',
          'The lateen sail',
          'The caravel',
        ],
        answer: 0,
        explanations: [
          'Correct. Gunpowder, like paper, spread from China along exchange networks.',
          'Incorrect. The camel saddle developed for desert trade, not in China.',
          'Incorrect. The lateen sail is associated with Arab and Mediterranean sailors.',
          'Incorrect. The caravel was a later Iberian ship.',
        ],
      },
      checkpoints: [
        {
          question: 'A historian uses Ibn Battuta\'s account of West Africa. Which aspect of the source should the historian consider most carefully?',
          choices: [
            'His point of view as a Muslim scholar judging places by Islamic standards',
            'Whether he traveled by camel or by ship',
            'The number of pages in the original manuscript',
            'Whether he had visited China',
          ],
          answer: 0,
          explanations: [
            'Correct. His religious and cultural perspective shaped what he praised or criticized.',
            'Incorrect. Travel method matters less than his perspective.',
            'Incorrect. Length doesn\'t affect reliability.',
            'Incorrect. That is a separate fact about his travels.',
          ],
        },
        {
          question: 'The spread of Islam into sub-Saharan Africa in this period is best explained by',
          choices: [
            'merchants and rulers connected by trans-Saharan and Indian Ocean trade',
            'Mongol conquest of West Africa',
            'Zheng He\'s voyages',
            'Spanish missionaries',
          ],
          answer: 0,
          explanations: [
            'Correct. Islam traveled with merchants, and rulers such as Mansa Musa adopted it.',
            'Incorrect. The Mongols never reached West Africa.',
            'Incorrect. Zheng He\'s voyages were Ming diplomatic missions.',
            'Incorrect. Spanish missions came later and were Christian.',
          ],
        },
      ],
      revisit:
        'Diffusion: Buddhism, Hinduism, Islam; gunpowder and paper from China; literature, art, science. Cities rose and fell. ' +
        'Travelers (Ibn Battuta, Marco Polo, Margery Kempe) wrote accounts; read them for point of view.',
    },
    {
      id: '2.6',
      ced: 'KC-3.1.IV',
      title: 'Environmental Consequences of Connectivity',
      minutes: 5,
      summary:
        'Crops spread along trade routes and changed diets and farming, while pathogens traveled too. The bubonic plague spread ' +
        'along Eurasian trade routes in the 1340s and killed a huge share of the population in Asia, the Middle East and Europe.',
      body: String.raw`### Crops on the move (illustrative examples)
- **Bananas** in Africa, spread through Indian Ocean contacts.
- **New rice varieties** in East Asia, such as fast-ripening **Champa rice**, which supported population growth in China.
- **Citrus** fruits spread around the Mediterranean.

New crops could raise food supply and population.

### Pathogens on the move
The same routes that carried goods carried disease. The **bubonic plague** (the **Black Death**):
- spread from Central Asia along Mongol-era trade routes in the 1330s–1340s,
- reached the Black Sea and Mediterranean ports around **1346–1347**, carried by merchant ships,
- killed perhaps **a third or more** of Europe's population, with heavy losses in China and the Middle East.

### The causation pattern
Connectivity → diffusion of crops (growth) **and** pathogens (decline). The networks that made societies richer also made them more vulnerable.`,
      blocks: [],
      precheck: {
        question: 'How did trade networks contribute to the spread of the bubonic plague?',
        choices: [
          'Merchants, caravans and ships carried infected fleas and rats along the routes',
          'The plague spread only through polluted rivers in Europe',
          'Trade routes were closed before the plague began',
          'The plague came from the Americas through the Columbian Exchange',
        ],
        answer: 0,
        explanations: [
          'Correct. Disease traveled the same routes as goods.',
          'Incorrect. The plague spread across Eurasia, largely through trade.',
          'Incorrect. Trade was busy when the plague spread.',
          'Incorrect. The Columbian Exchange began after 1492.',
        ],
      },
      checkpoints: [
        {
          question: 'The spread of new rice varieties in East Asia most likely led to',
          choices: [
            'larger food supplies that supported population growth',
            'the collapse of the Silk Roads',
            'the end of the Mongol Empire',
            'a decline in Chinese agriculture',
          ],
          answer: 0,
          explanations: [
            'Correct. Fast-ripening rice increased harvests and supported more people.',
            'Incorrect. Crop diffusion didn\'t close trade routes.',
            'Incorrect. The Mongol khanates declined for political and other reasons.',
            'Incorrect. New varieties strengthened agriculture.',
          ],
        },
        {
          question: 'Which statement best describes the environmental effects of networks of exchange from 1200 to 1450?',
          choices: [
            'They spread both useful crops and deadly diseases',
            'They spread crops but never diseases',
            'They had no effect on the environment',
            'They spread only American crops to Afro-Eurasia',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED pairs the diffusion of crops with the diffusion of pathogens.',
            'Incorrect. The plague is the major counterexample.',
            'Incorrect. Crops and disease both changed societies.',
            'Incorrect. American crops arrived only after 1492.',
          ],
        },
      ],
      revisit:
        'Crops spread (bananas in Africa, new rice in East Asia, citrus in the Mediterranean) → more food. Pathogens spread too: ' +
        'the Black Death moved along trade routes and reached the Mediterranean in 1346–1347.',
    },
    {
      id: '2.7',
      ced: 'KC-3.1, KC-3.3',
      title: 'Comparison of Economic Exchange',
      minutes: 5,
      summary:
        'The three networks share causes (better technology and commercial practices) and effects (rich trading cities, cultural ' +
        'and biological diffusion), but differ in geography, goods and the states they built. Strong comparisons name a category ' +
        'and support it with specific evidence.',
      body: String.raw`### Side by side
- **Silk Roads**: overland across Central Asia. Caravanserai and credit. Mostly luxury goods (silk, porcelain). Mongol khanates, Kashgar, Samarkand. Spread Buddhism, Islam and technologies.
- **Indian Ocean**: sea routes from East Africa to China. Monsoon knowledge, compass, astrolabe, larger ships. Luxury **and** bulk goods (spices, textiles, rice). Swahili city-states, Gujarat, Malacca. Spread Islam, Hinduism and Buddhism; diasporic communities.
- **Trans-Saharan**: across the Sahara Desert. Camel saddles and caravans. Gold, salt and enslaved people. Mali. Spread Islam into West Africa.

### Similarities
- All grew because of **improved transportation technologies and commercial practices**.
- All produced **wealthy trading cities** and states.
- All spread **religions** and **ideas**, especially Islam.

### Differences
- Sea trade could carry **bulk goods** cheaply; overland trade mostly carried **luxuries**.
- The **environment** shaped each network: winds, deserts or mountains.

### Writing the claim (skill 6.B)
"Both the Indian Ocean and trans-Saharan networks spread Islam, but the Indian Ocean network carried more bulk goods, because ships could move heavy cargo more cheaply than camel caravans."

Sort each feature to its network below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which network?',
            buckets: ['Silk Roads', 'Indian Ocean', 'Trans-Saharan'],
            items: [
              { label: 'Caravanserai spaced a day\'s ride apart', bucket: 0, why: 'Caravanserai served overland Silk Roads traders.' },
              { label: 'Samarkand grows rich as a crossroads city', bucket: 0, why: 'Samarkand was a Central Asian Silk Roads city.' },
              { label: 'Voyages timed to seasonal winds', bucket: 1, why: 'Monsoon winds governed Indian Ocean sailing.' },
              { label: 'Swahili city-states with Muslim merchant elites', bucket: 1, why: 'The Swahili coast grew from Indian Ocean trade.' },
              { label: 'Zheng He\'s treasure fleets', bucket: 1, why: 'Zheng He sailed the Indian Ocean.' },
              { label: 'Gold traded north, salt traded south', bucket: 2, why: 'Gold and salt were the core of trans-Saharan trade.' },
              { label: 'Mansa Musa\'s empire taxes the caravans', bucket: 2, why: 'Mali controlled trans-Saharan routes.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is a similarity among the Silk Roads, Indian Ocean and trans-Saharan networks?',
        choices: [
          'All grew because of improvements in transportation technology and commercial practices',
          'All relied mainly on camels',
          'All were controlled by the Mongol Empire',
          'All carried mostly bulk goods',
        ],
        answer: 0,
        explanations: [
          'Correct. The CED links each network\'s growth to better technology and practices.',
          'Incorrect. The Indian Ocean network relied on ships.',
          'Incorrect. The Mongols didn\'t control the Indian Ocean or the Sahara.',
          'Incorrect. Overland routes carried mostly luxury goods.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains why the Indian Ocean network carried more bulk goods than the Silk Roads?',
          choices: [
            'Ships could carry heavy cargo more cheaply than overland caravans',
            'The Silk Roads banned bulk goods',
            'Indian Ocean merchants didn\'t trade luxury goods',
            'Bulk goods were produced only in coastal areas',
          ],
          answer: 0,
          explanations: [
            'Correct. Sea transport lowered costs enough to make bulk goods profitable.',
            'Incorrect. There was no ban; cost was the issue.',
            'Incorrect. Indian Ocean merchants traded luxuries too.',
            'Incorrect. Bulk goods were produced inland as well.',
          ],
        },
        {
          question: 'Which piece of evidence best supports the claim that trade networks spread Islam?',
          choices: [
            'Mali\'s rulers adopted Islam, and Swahili ports had Muslim merchant elites',
            'Kublai Khan founded the Yuan dynasty',
            'Champa rice spread in East Asia',
            'Zheng He\'s fleets returned to China in 1433',
          ],
          answer: 0,
          explanations: [
            'Correct. It gives specific examples from two networks.',
            'Incorrect. That is about Mongol rule in China.',
            'Incorrect. That is crop diffusion, not religion.',
            'Incorrect. That ends Ming voyages and says nothing about Islam.',
          ],
        },
      ],
      revisit:
        'Similar: better technology and practices, rich cities and states, spread of religion. Different: geography, goods ' +
        '(luxury overland, bulk by sea), states (khanates, Swahili/Malacca, Mali). Support comparisons with specific evidence.',
    },
  ],
};

export default pack;
