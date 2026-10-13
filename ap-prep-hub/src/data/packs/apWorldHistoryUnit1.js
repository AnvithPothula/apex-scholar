/**
 * AP World History: Modern Unit 1: The Global Tapestry (c. 1200–c. 1450) — study pack.
 *
 * Written against the AP World History: Modern CED effective Fall 2026
 * (topics 1.1–1.7). The unit is a tour of the world's states and belief
 * systems around 1200, so each topic gets a comparison table, flashcards for
 * the illustrative examples the CED names, and checkpoints that ask the
 * "why" behind each state. Topic 1.7 practices comparison, with a timeline
 * activity.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-world-history-modern/unit-1',
  subject: 'AP World History: Modern',
  unit: 'Unit 1: The Global Tapestry',
  examWeight: '8–10% of the exam',
  intro:
    'A snapshot of the world from about 1200 to 1450, region by region: Song China, the fragmenting Islamic world, the Hindu, ' +
    'Buddhist and Muslim states of South and Southeast Asia, the Mexica and Inca, African kingdoms, and feudal Europe. The thread ' +
    'through all of it is how states gained and kept power, and how belief systems shaped societies.',
  sections: [
    {
      id: '1.1',
      ced: 'KC-3.2.I.A, KC-3.1.III.D, KC-3.3.III.A',
      title: 'Developments in East Asia',
      minutes: 8,
      summary:
        'The Song Dynasty ruled through Confucianism and a merit-based imperial bureaucracy. Neo-Confucianism, filial piety and ' +
        'Buddhism shaped East Asia, and Chinese traditions spread to Japan and Korea. Champa rice, the Grand Canal and booming iron, ' +
        'porcelain and textile production made the Song economy the most commercialized in the world, still built on free peasant and artisan labor.',
      body: String.raw`### How the Song ruled (960–1279)
- **Confucianism** justified the emperor's rule and set the ideal: a moral ruler, loyal officials, and an ordered society.
- An **imperial bureaucracy** of scholar-officials ran the state. They were chosen through **civil service exams** on the Confucian classics, which the Song expanded, so talent (in theory) mattered more than birth.
- Weakness: a huge bureaucracy was expensive, and a civilian-led state struggled militarily. The Song lost the north to the Jurchen in 1127 and fell to the Mongols in 1279.

### Belief systems in East Asia
- **Neo-Confucianism** blended Confucian ethics with Buddhist and Daoist ideas about the universe. It became the official philosophy and stressed **filial piety** (duty to parents and ancestors) and hierarchy.
- **Women**: Confucian ideals demanded deference to fathers, husbands and sons, while honoring mothers. Footbinding spread among elite families in the Song.
- **Chinese influence** spread to neighbors: Heian Japan adopted Chinese writing, Buddhism and court styles; Korea used Confucian civil service exams.
- **Buddhism** kept shaping Asia in several branches:

| Branch | Where | Key idea |
|---|---|---|
| **Theravada** | Sri Lanka, mainland Southeast Asia | Closest to the Buddha's early teachings; monks seek enlightenment |
| **Mahayana** | China, Korea, Japan, Vietnam | **Bodhisattvas** help others reach enlightenment |
| **Tibetan** | Tibet, Mongolia | Rituals and teachers (lamas) |

### The Song economy
| Innovation | Effect |
|---|---|
| **Champa rice** (from Vietnam) | Fast-ripening and drought-resistant: two harvests a year → food surplus → population growth |
| **Grand Canal expansion** | Cheap transport between the rice-growing south and the north → internal trade |
| **Iron and steel production** | Tools, weapons, construction |
| **Porcelain and silk textiles** | Made for export across Asia and the Indian Ocean |

The economy became **commercialized** (paper money, markets, cities), but it still ran on **free peasants and artisans**, not slaves or serfs.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Civil service exams', back: 'Exams on the Confucian classics used to choose Song officials, expanding merit-based government.' },
            { front: 'Neo-Confucianism', back: 'Confucian ethics blended with Buddhist and Daoist ideas; stressed filial piety and hierarchy.' },
            { front: 'Filial piety', back: 'Duty and respect owed to parents and ancestors; central to Confucian family life.' },
            { front: 'Champa rice', back: 'Fast-ripening, drought-resistant rice from Vietnam; allowed two harvests a year and fed Song population growth.' },
            { front: 'Mahayana vs. Theravada', back: 'Mahayana (East Asia): bodhisattvas help others. Theravada (Southeast Asia, Sri Lanka): monks follow early teachings.' },
          ],
        },
      ],
      precheck: {
        question: 'The Song Dynasty mainly used which method to staff its government?',
        choices: [
          'Civil service exams based on Confucian texts',
          'Hereditary positions for noble families only',
          'Election by local assemblies',
          'Appointments of Buddhist monks',
        ],
        answer: 0,
        explanations: [
          'Correct. Scholar-officials were selected by exams on the Confucian classics.',
          'Incorrect. The exam system was meant to reduce dependence on hereditary nobles.',
          'Incorrect. China had no elected assemblies.',
          'Incorrect. The bureaucracy was Confucian, not Buddhist.',
        ],
      },
      checkpoints: [
        {
          question: 'The spread of Champa rice in Song China most directly led to:',
          choices: [
            'Population growth from larger food surpluses',
            'The end of the civil service exams',
            'A shift to coerced labor in agriculture',
            'The decline of trade along the Grand Canal',
          ],
          answer: 0,
          explanations: [
            'Correct. Faster-ripening rice allowed more harvests and supported more people.',
            'Incorrect. Rice had no effect on the exam system.',
            'Incorrect. The CED stresses that Song agriculture used free peasant labor.',
            'Incorrect. Surpluses increased trade along the canal.',
          ],
        },
        {
          question: 'Heian Japan\'s adoption of Chinese writing and Buddhism is best used as evidence of:',
          choices: [
            'The influence of Chinese cultural traditions on neighboring regions',
            'Japan\'s conquest by the Song Dynasty',
            'The spread of Theravada Buddhism to East Asia',
            'Japan rejecting outside influences',
          ],
          answer: 0,
          explanations: [
            'Correct. Chinese literary, scholarly and religious traditions spread to Japan and Korea.',
            'Incorrect. Japan was never conquered by the Song.',
            'Incorrect. East Asia followed Mahayana Buddhism.',
            'Incorrect. It shows the opposite: Japan adopted outside ideas.',
          ],
        },
      ],
      revisit:
        'Song: Confucianism + bureaucracy chosen by civil service exams. Neo-Confucianism, filial piety, Buddhism (Mahayana in East Asia) ' +
        'shaped society; Chinese culture spread to Japan and Korea. Champa rice, Grand Canal, iron, porcelain, textiles → commercial economy on free labor.',
    },
    {
      id: '1.2',
      ced: 'KC-3.1.III.D.iii, KC-3.2.I, KC-3.1.III.A, KC-3.2.II.A.i',
      title: 'Developments in Dar al-Islam',
      minutes: 7,
      summary:
        'As the Abbasid Caliphate fragmented, new Islamic states arose, most led by Turkic peoples: the Seljuks, the Mamluks of Egypt ' +
        'and the Delhi Sultanate. Islam spread first by conquest and then through merchants, missionaries and Sufis. Muslim states ' +
        'fostered advances in math, medicine and literature, preserved Greek philosophy, and passed learning to Europe through Spain.',
      body: String.raw`**Dar al-Islam** ("the house of Islam") means the lands under Muslim rule, from Spain to India.

### A caliphate breaks apart
The **Abbasid Caliphate** (capital Baghdad) had been losing real power for centuries. Its caliphs became figureheads while others ruled, and the Mongols destroyed Baghdad and ended the caliphate in **1258**. New states took over, most dominated by **Turkic** peoples:

| State | Who and where | Notable |
|---|---|---|
| **Seljuk Empire** | Turkic; Persia, Iraq, Anatolia | Sultans held military power while the Abbasid caliph kept religious authority |
| **Mamluk Sultanate** | Egypt and Syria; rulers were former **slave-soldiers** | Stopped the Mongols at Ain Jalut (1260) |
| **Delhi Sultanate** (1206–1526) | Turkic Muslims ruling much of north India | Muslim minority ruling a Hindu majority |

### How Islam spread
1. **Military expansion** brought territory under Muslim rule.
2. Then Islam spread peacefully through **merchants** (Indian Ocean, Saharan routes), **missionaries** and **Sufis**, mystics who sought a personal experience of God and adapted Islam to local customs, which made conversion easier.

Jews and Christians under Muslim rule were usually protected as "people of the book" but paid a special tax (**jizya**).

### Intellectual innovation and transfer
- **Preserving and building on Greek thought**: Muslim scholars translated and wrote commentaries on Greek philosophy and science. Baghdad's **House of Wisdom** was a center of translation until 1258.
- **Mathematics and astronomy**: **Nasir al-Din al-Tusi** advanced trigonometry and astronomy.
- **Literature**: **'A'ishah al-Ba'uniyyah** of Damascus wrote Sufi poetry and scholarship.
- **Medicine**: hospitals and medical texts, such as Ibn Sina's *Canon of Medicine*, used for centuries in Europe.
- **Transfers through Spain**: in Muslim and Christian Spain, scholars of all three faiths translated Arabic works (including commentaries on Aristotle by Ibn Rushd) into Latin, carrying this learning into Europe.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Abbasid Caliphate (by 1200)', back: 'Fragmented; caliphs were figureheads. The Mongols destroyed Baghdad in 1258.' },
            { front: 'Mamluk Sultanate', back: 'Egypt and Syria, ruled by former slave-soldiers; defeated the Mongols at Ain Jalut (1260).' },
            { front: 'Delhi Sultanate', back: 'Turkic Muslim state ruling north India from 1206; a Muslim minority over a Hindu majority.' },
            { front: 'Sufis', back: 'Muslim mystics whose personal, flexible approach helped spread Islam to new peoples.' },
            { front: 'House of Wisdom', back: 'Abbasid center in Baghdad for translating and studying Greek, Persian and Indian works.' },
          ],
        },
      ],
      precheck: {
        question: 'Most of the new Islamic states that emerged as the Abbasid Caliphate fragmented were dominated by:',
        choices: ['Turkic peoples', 'Arab tribes from Mecca', 'Mongol khans who converted', 'Byzantine Greeks'],
        answer: 0,
        explanations: [
          'Correct. The Seljuks, Mamluks and Delhi Sultanate were all dominated by Turkic peoples.',
          'Incorrect. Arab dynasties had ruled earlier; the new states were mostly Turkic.',
          'Incorrect. The Mongols destroyed Baghdad but most successor states the CED names were Turkic.',
          'Incorrect. The Byzantines were Christian rivals, not rulers of Islamic states.',
        ],
      },
      checkpoints: [
        {
          question: 'After initial military conquests, which group did the most to spread Islam to new regions of Afro-Eurasia?',
          choices: [
            'Merchants, missionaries and Sufis',
            'Byzantine emperors',
            'Mongol armies that rejected Islam',
            'European crusaders',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED lists merchants, missionaries and Sufis as the main agents after conquest.',
            'Incorrect. Byzantine emperors were Christian rivals.',
            'Incorrect. Armies that rejected Islam wouldn\'t spread it.',
            'Incorrect. Crusaders fought Muslim states.',
          ],
        },
        {
          question: 'Translations of Arabic texts into Latin in 12th-century Spain are best used as evidence of:',
          choices: [
            'Intellectual transfers from Dar al-Islam to Europe',
            'The Mamluks\' conquest of Spain',
            'The decline of learning in Muslim states',
            'The spread of Buddhism along trade routes',
          ],
          answer: 0,
          explanations: [
            'Correct. Spain was a key bridge carrying Muslim and preserved Greek learning into Europe.',
            'Incorrect. The Mamluks ruled Egypt and Syria, not Spain.',
            'Incorrect. It shows Muslim learning was valued enough to translate.',
            'Incorrect. These were Arabic and Greek works, not Buddhist texts.',
          ],
        },
      ],
      revisit:
        'Abbasid fragmentation → Turkic-led states (Seljuks, Mamluks, Delhi Sultanate). Islam spread by conquest, then merchants, ' +
        'missionaries and Sufis. Advances in math (al-Tusi), literature, medicine; Greek learning preserved and passed to Europe via Spain.',
    },
    {
      id: '1.3',
      ced: 'KC-3.1.III.D.iv, KC-3.2.I.B.i',
      title: 'Developments in South and Southeast Asia',
      minutes: 6,
      summary:
        'Hinduism, Islam and Buddhism shaped South and Southeast Asia: the bhakti movement, Sufism and Buddhist monasticism all ' +
        'reached ordinary people. New Hindu and Buddhist states rose: Vijayanagara and the Rajputs in India, sea-trading Srivijaya and ' +
        'Majapahit, the Khmer Empire of Angkor, Sukhothai, and the Sinhala kingdoms of Sri Lanka.',
      body: String.raw`### Three religions, shaping societies
| Belief system | Development | Effect |
|---|---|---|
| **Hinduism** | **Bhakti movement**: devotion to a single god (often Vishnu or Shiva) through song and poetry | Open to all castes and to women; made religion personal and helped Hinduism compete with Islam and Buddhism |
| **Islam** | Arrived through the Delhi Sultanate and Indian Ocean merchants; **Sufism** blended with local traditions | Conversions in north India, Bengal and island Southeast Asia |
| **Buddhism** | **Monasticism**: monasteries as centers of learning and worship | Declined in India but thrived in Sri Lanka and mainland Southeast Asia (Theravada) |

### New Hindu and Buddhist states
| State | Where | Power base |
|---|---|---|
| **Vijayanagara Empire** (founded 1336) | South India | Hindu kingdom that resisted the Delhi Sultanate |
| **Rajput kingdoms** | Northwest India | Hindu warrior clans who resisted Muslim rule |
| **Srivijaya Empire** | Sumatra | Buddhist; controlled the **Strait of Malacca** and taxed sea trade |
| **Majapahit** (from 1293) | Java | Hindu-Buddhist sea-trading empire |
| **Khmer Empire** | Cambodia | Hindu, then Buddhist; built **Angkor Wat**; huge irrigation systems |
| **Sukhothai kingdom** | Thailand | Theravada Buddhist |
| **Sinhala dynasties** | Sri Lanka | Theravada Buddhist kingdoms |

### Pattern to notice
**Sea-based** states (Srivijaya, Majapahit) grew rich by controlling trade chokepoints; **land-based** states (Khmer, Vijayanagara) relied on agriculture, irrigation and armies. Rulers in both used religion, building temples and supporting monks or Brahmins, to legitimize their rule.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Bhakti movement', back: 'Hindu devotion to one god through song and poetry, open to all castes and to women.' },
            { front: 'Srivijaya', back: 'Buddhist maritime empire on Sumatra that controlled and taxed trade through the Strait of Malacca.' },
            { front: 'Vijayanagara', back: 'Hindu empire in south India (founded 1336) that resisted the Delhi Sultanate.' },
            { front: 'Khmer Empire', back: 'Hindu-then-Buddhist empire in Cambodia; built Angkor Wat and large irrigation works.' },
          ],
        },
      ],
      precheck: {
        question: 'The bhakti movement appealed to many people in South Asia mainly because it:',
        choices: [
          'Emphasized personal devotion open to all castes and to women',
          'Required strict observance of caste rules',
          'Was led by the Delhi Sultanate',
          'Rejected the idea of gods entirely',
        ],
        answer: 0,
        explanations: [
          'Correct. Bhakti made worship personal and accessible regardless of caste or gender.',
          'Incorrect. Bhakti downplayed caste distinctions in worship.',
          'Incorrect. Bhakti was a Hindu movement; the Delhi Sultanate was Muslim.',
          'Incorrect. Bhakti centered on devotion to a god.',
        ],
      },
      checkpoints: [
        {
          question: 'Srivijaya\'s power came mainly from:',
          choices: [
            'Controlling sea trade through the Strait of Malacca',
            'Large irrigated rice fields around Angkor',
            'Conquering the Delhi Sultanate',
            'Mining gold for trans-Saharan trade',
          ],
          answer: 0,
          explanations: [
            'Correct. It taxed and protected shipping through a key chokepoint.',
            'Incorrect. That describes the Khmer Empire.',
            'Incorrect. Srivijaya was in Sumatra, far from north India.',
            'Incorrect. Trans-Saharan trade was in Africa.',
          ],
        },
        {
          question: 'Which pair shows a Hindu state resisting Muslim rule in South Asia?',
          choices: [
            'Vijayanagara and the Rajput kingdoms',
            'Srivijaya and Majapahit',
            'The Mamluks and the Seljuks',
            'Sukhothai and the Sinhala dynasties',
          ],
          answer: 0,
          explanations: [
            'Correct. Both were Hindu powers in India that resisted the Delhi Sultanate.',
            'Incorrect. These were maritime Southeast Asian states, not Indian ones.',
            'Incorrect. These were Muslim states.',
            'Incorrect. These were Theravada Buddhist kingdoms.',
          ],
        },
      ],
      revisit:
        'Bhakti (Hindu devotion), Sufism (Islam), monasticism (Buddhism) shaped society. Hindu/Buddhist states: Vijayanagara, Rajputs ' +
        '(resisted Delhi), Srivijaya and Majapahit (sea trade), Khmer (Angkor, irrigation), Sukhothai, Sinhala. Rulers used religion to legitimize power.',
    },
    {
      id: '1.4',
      ced: 'KC-3.2.I.D.i',
      title: 'State Building in the Americas',
      minutes: 6,
      summary:
        'States in the Americas grew in scope and reach. The Maya ruled through rival city-states; the Mexica built a tribute empire ' +
        'from Tenochtitlan; the Inca built a centralized empire using mit\'a labor and roads. In North America, Chaco, Mesa Verde and ' +
        'Cahokia were major centers.',
      body: String.raw`### The big three
| | **Maya** | **Mexica (Aztec)** | **Inca** |
|---|---|---|---|
| Where | Yucatán, Central America | Central Mexico; capital **Tenochtitlan** (founded c. 1325) | Andes; capital **Cusco** |
| Structure | Competing **city-states**, each with its own king | **Tribute empire**: conquered peoples kept local rulers but paid goods and captives | **Centralized empire** with appointed governors |
| How they ruled | Kings claimed divine links; warfare between cities | Military power, tribute, human sacrifice tied to religion | **Mit'a**: required public labor; **roads** (about 40,000 km); **quipu** knotted-cord records |
| Farming | Raised fields, terraces | **Chinampas** (floating gardens) | Terrace farming on mountain slopes |

The Mexica grew through the Triple Alliance (1428); the Inca expanded fast under **Pachacuti** from 1438.

### North America
- **Chaco Canyon** and **Mesa Verde** (Ancestral Puebloans, Southwest): large stone and cliff dwellings, roads and trade networks, supported by maize farming in a dry climate. Both declined by around 1300, likely from drought.
- **Cahokia** (Mississippian, near St. Louis): a city of perhaps 10,000–20,000 people with huge earthen mounds, at its peak around 1050–1150.

### Compare
The Mexica **collected tribute** and left conquered peoples mostly self-governing, which bred resentment (later useful to the Spanish). The Inca **reorganized** conquered peoples, moving populations and demanding labor, which tied the empire together more tightly.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Mit\'a', back: 'Inca system of required public labor (roads, farming, mines, military) owed by subjects to the state.' },
            { front: 'Tribute system (Mexica)', back: 'Conquered city-states kept local rulers but had to send goods, labor and captives to Tenochtitlan.' },
            { front: 'Chinampas', back: 'Mexica "floating gardens": farm plots built in shallow lakes around Tenochtitlan.' },
            { front: 'Quipu', back: 'Inca knotted cords used to keep records and census data.' },
          ],
        },
      ],
      precheck: {
        question: 'The Inca government organized labor for roads, farms and mines through:',
        choices: ['The mit\'a system', 'The encomienda system', 'Chinampas', 'The civil service exams'],
        answer: 0,
        explanations: [
          'Correct. Mit\'a required subjects to work for the state for set periods.',
          'Incorrect. The encomienda was a later Spanish colonial system.',
          'Incorrect. Chinampas were Mexica farm plots.',
          'Incorrect. Civil service exams were Chinese.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes a key difference between Mexica and Inca rule?',
          choices: [
            'The Mexica mostly collected tribute from conquered peoples, while the Inca centralized control and required labor',
            'The Mexica ruled the Andes, while the Inca ruled central Mexico',
            'Only the Inca practiced agriculture',
            'The Mexica had a single centralized bureaucracy, while the Inca had independent city-states',
          ],
          answer: 0,
          explanations: [
            'Correct. Tribute with local autonomy vs. centralized, labor-based control.',
            'Incorrect. That reverses their locations.',
            'Incorrect. Both relied on farming (chinampas and terraces).',
            'Incorrect. That reverses their structures, and city-states describe the Maya.',
          ],
        },
        {
          question: 'Cahokia is best described as:',
          choices: [
            'A large Mississippian city with earthen mounds',
            'The capital of the Inca Empire',
            'A Maya city-state in the Yucatán',
            'A cliff dwelling in the Southwest',
          ],
          answer: 0,
          explanations: [
            'Correct. It was the largest Mississippian center, near present-day St. Louis.',
            'Incorrect. The Inca capital was Cusco.',
            'Incorrect. Cahokia was in North America\'s Mississippi Valley.',
            'Incorrect. That describes Mesa Verde.',
          ],
        },
      ],
      revisit:
        'Maya: rival city-states. Mexica: tribute empire from Tenochtitlan, chinampas. Inca: centralized, mit\'a labor, roads, quipu, ' +
        'terraces. North America: Chaco, Mesa Verde (Southwest), Cahokia (Mississippian mounds).',
    },
    {
      id: '1.5',
      ced: 'KC-3.2.I.D.ii',
      title: 'State Building in Africa',
      minutes: 5,
      summary:
        'African states grew in scope and reach. Great Zimbabwe grew rich from gold and ivory trade to the Swahili coast. Ethiopia ' +
        'was a Christian kingdom with rock-cut churches and a dynasty claiming descent from Solomon. The Hausa kingdoms were walled ' +
        'city-states tied into trans-Saharan trade, whose rulers adopted Islam.',
      body: String.raw`| State | Where | Power base | Religion |
|---|---|---|---|
| **Great Zimbabwe** (c. 1100–1450) | Southern Africa | Cattle, and **gold and ivory** traded to Swahili coast cities and on into the Indian Ocean | Local Shona beliefs |
| **Ethiopia** | East African highlands | Farming and Red Sea trade; strong monarchy | **Christian** (since the 300s); rock-cut churches of **Lalibela**; Solomonic dynasty from 1270 claimed descent from King Solomon |
| **Hausa kingdoms** (e.g., Kano) | Northern Nigeria | Walled **city-states**; crafts and **trans-Saharan trade** | Rulers adopted **Islam**, often blended with local traditions |

### What they show
- **Continuity**: kinship, local religions and farming stayed the base of most African societies.
- **Innovation**: monumental building (Great Zimbabwe's stone walls built without mortar, Lalibela's churches carved from solid rock).
- **Diversity**: centralized kingdoms (Ethiopia), trade-based states (Great Zimbabwe), and networks of city-states (Hausa).
- **Trade + religion**: long-distance trade brought wealth and, in the Hausa case, Islam.

(Mali and the Swahili city-states come up in Unit 2, Networks of Exchange.)`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Great Zimbabwe', back: 'Southern African state whose stone city grew rich from gold and ivory trade to the Swahili coast.' },
            { front: 'Ethiopia (c. 1200–1450)', back: 'Christian kingdom; rock-cut churches at Lalibela; Solomonic dynasty from 1270.' },
            { front: 'Hausa kingdoms', back: 'Walled city-states in northern Nigeria tied into trans-Saharan trade; rulers adopted Islam.' },
          ],
        },
      ],
      precheck: {
        question: 'Great Zimbabwe\'s wealth came mainly from:',
        choices: [
          'Trading gold and ivory with Swahili coast cities',
          'Taxing Christian pilgrims',
          'Controlling the Strait of Malacca',
          'Exporting porcelain to China',
        ],
        answer: 0,
        explanations: [
          'Correct. Gold and ivory moved to the coast and into Indian Ocean trade.',
          'Incorrect. That doesn\'t describe Great Zimbabwe, which was not Christian.',
          'Incorrect. That was Srivijaya in Southeast Asia.',
          'Incorrect. China exported porcelain; it didn\'t import it from Africa.',
        ],
      },
      checkpoints: [
        {
          question: 'The rock-cut churches of Lalibela are best used as evidence of:',
          choices: [
            'The importance of Christianity to the Ethiopian state',
            'The spread of Islam in East Africa',
            'Great Zimbabwe\'s gold trade',
            'Hausa city-states\' links to the Sahara',
          ],
          answer: 0,
          explanations: [
            'Correct. They show royal sponsorship of Christianity in Ethiopia.',
            'Incorrect. Lalibela\'s churches are Christian.',
            'Incorrect. Great Zimbabwe was in southern Africa.',
            'Incorrect. The Hausa kingdoms were in West Africa.',
          ],
        },
        {
          question: 'Which describes the Hausa kingdoms?',
          choices: [
            'Walled city-states in West Africa linked to trans-Saharan trade',
            'A Christian empire in the Ethiopian highlands',
            'A single centralized empire ruling all of southern Africa',
            'Buddhist kingdoms that traded with Srivijaya',
          ],
          answer: 0,
          explanations: [
            'Correct. They were separate city-states like Kano, enriched by Saharan trade.',
            'Incorrect. That describes Ethiopia.',
            'Incorrect. They were in West Africa and were not one empire.',
            'Incorrect. Their rulers adopted Islam, not Buddhism.',
          ],
        },
      ],
      revisit:
        'Great Zimbabwe: gold and ivory trade to the Swahili coast, stone walls. Ethiopia: Christian kingdom, Lalibela churches. ' +
        'Hausa: West African city-states in trans-Saharan trade, rulers adopted Islam.',
    },
    {
      id: '1.6',
      ced: 'KC-3.1.III.D.v, KC-3.2.I.B.ii, KC-3.3.III.C',
      title: 'Developments in Europe',
      minutes: 6,
      summary:
        'Christianity, especially the Roman Catholic Church, dominated European life, alongside Jewish communities that faced ' +
        'persecution and Muslim rule in parts of Spain. Europe was politically fragmented, with weak monarchies, feudalism and ' +
        'manorialism. It was mostly agricultural, worked by free peasants and coerced serfs.',
      body: String.raw`### Religion
- **Roman Catholic Church**: the most powerful institution in western Europe. The pope claimed authority over kings; the Church owned huge lands, ran schools and called the **Crusades** (1095–1291).
- **Eastern Orthodox Christianity** in the Byzantine Empire and Russia.
- **Judaism**: Jewish communities were important in trade and finance but faced persecution and expulsions (England 1290, France 1306).
- **Islam**: Muslim states ruled parts of Spain until the Christian **Reconquista** finished in 1492.

### Politics: decentralized
| System | How it worked |
|---|---|
| **Feudalism** | Lords granted land (fiefs) to **vassals** (knights) in return for military service and loyalty |
| **Manorialism** | The economic system: a lord's self-sufficient estate (manor) worked by **serfs** |
| **Decentralized monarchies** | Kings depended on nobles for armies and money, so power was spread out |

Signs of change: **Magna Carta** (1215) limited the English king's power; the Hundred Years' War (1337–1453) pushed France and England toward stronger central monarchies.

### Society: agricultural, free and coerced labor
- Most Europeans farmed. **Serfs** were bound to the land: they couldn't leave and owed labor and crops to the lord, but weren't slaves (they couldn't be sold apart from the land). Free peasants rented land.
- The **Black Death** (1347–1351) killed about a third of Europe's people. Labor became scarce, so surviving peasants demanded better terms, which helped weaken serfdom in western Europe.

### Compare
Europe's power was **decentralized** (lords, church, king), while Song China was **centralized** under an emperor and a trained bureaucracy. That contrast is a classic comparison prompt.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Feudalism', back: 'Political-military system: lords give land to vassals in exchange for military service and loyalty.' },
            { front: 'Manorialism', back: 'Economic system of self-sufficient estates worked by serfs bound to the land.' },
            { front: 'Serfdom', back: 'Coerced labor: peasants bound to the land, owing labor and crops to a lord.' },
            { front: 'Black Death\'s effect on serfdom', back: 'Killed about a third of Europeans; labor shortages let peasants demand more, weakening serfdom in the west.' },
          ],
        },
      ],
      precheck: {
        question: 'Political power in Europe from c. 1200 to c. 1450 is best described as:',
        choices: [
          'Decentralized among monarchs, nobles and the Church',
          'Centralized under a single emperor with a trained bureaucracy',
          'Held by elected parliaments in most countries',
          'Controlled by Muslim caliphs',
        ],
        answer: 0,
        explanations: [
          'Correct. Feudalism spread power among kings, lords and the Church.',
          'Incorrect. That describes Song China.',
          'Incorrect. Parliaments existed in places but had limited power.',
          'Incorrect. Muslim rule in Europe was limited to parts of Spain.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best describes serfdom in medieval Europe?',
          choices: [
            'Peasants were bound to the land and owed labor and crops to a lord',
            'Workers were free to move and paid wages in cash',
            'People were bought and sold as property at markets',
            'Knights received land in exchange for military service',
          ],
          answer: 0,
          explanations: [
            'Correct. Serfs were coerced laborers tied to the manor.',
            'Incorrect. That describes free wage labor.',
            'Incorrect. That is chattel slavery; serfs couldn\'t be sold apart from the land.',
            'Incorrect. That describes feudal vassals, not serfs.',
          ],
        },
        {
          question: 'A historian comparing Europe and Song China around 1200 would most likely note that:',
          choices: [
            'China was more politically centralized than Europe',
            'Europe had a larger merit-based bureaucracy',
            'Both were ruled by a single emperor',
            'Neither depended on agriculture',
          ],
          answer: 0,
          explanations: [
            'Correct. Song China had an emperor and bureaucracy; Europe was fragmented under feudalism.',
            'Incorrect. That describes China, not Europe.',
            'Incorrect. Europe had many monarchs and lords.',
            'Incorrect. Both were overwhelmingly agricultural.',
          ],
        },
      ],
      revisit:
        'Catholic Church dominant; Jews persecuted; Muslims in Spain. Politically fragmented: feudalism, manorialism, weak monarchies. ' +
        'Agricultural society of free peasants and serfs; the Black Death weakened serfdom.',
    },
    {
      id: '1.7',
      ced: 'KC-3.2',
      title: 'Comparison in the Period from c. 1200 to c. 1450',
      minutes: 5,
      summary:
        'Comparison means explaining similarities and differences, and why they exist. Across the world, states showed continuity, ' +
        'innovation and diversity. They differed in how centralized they were, how they got labor and revenue, and how religion ' +
        'legitimized rulers.',
      body: String.raw`### Comparison, the skill
A strong comparison:
1. Names a specific **similarity** or **difference** (not "they were different").
2. **Explains why** it exists.
3. Ties it to a **historically defensible claim**: an argument evidence can support.

### State building around the world
| State | Centralized? | How it got labor or revenue | How rulers were legitimized |
|---|---|---|---|
| **Song China** | Highly | Taxes on free peasants; commerce | Confucianism, Mandate of Heaven |
| **Delhi Sultanate** | Fairly | Taxes on a mostly Hindu population | Islam |
| **Europe** | No: feudal | Serf labor on manors | Christianity, Church support |
| **Mexica** | Loosely | **Tribute** from conquered peoples | Religion, human sacrifice |
| **Inca** | Highly | **Mit'a** labor | Ruler as son of the sun god |
| **Srivijaya** | Moderately | Taxes on sea trade | Buddhism |
| **Great Zimbabwe** | Moderately | Gold and ivory trade | Local religion, wealth |

### Sample claims
- **Similarity**: "Both the Song and the Inca governed through centralized systems, but the Song relied on exam-trained officials while the Inca relied on labor obligations and roads."
- **Difference**: "Political power in Europe was more fragmented than in Song China because European kings depended on feudal lords for armies, while Song emperors commanded a salaried bureaucracy."
- **Religion as a common thread**: almost every state used religion (Confucianism, Islam, Christianity, Hinduism, Buddhism, Inca sun worship) to justify rulers' power.

Use the timeline below to place the unit's events in order before you compare them.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'The global tapestry',
            events: [
              { year: 1206, label: 'Delhi Sultanate founded' },
              { year: 1215, label: 'Magna Carta limits the English king' },
              { year: 1258, label: 'Mongols destroy Abbasid Baghdad' },
              { year: 1279, label: 'Song Dynasty falls to the Mongols' },
              { year: 1325, label: 'Mexica found Tenochtitlan' },
              { year: 1347, label: 'Black Death reaches Europe' },
              { year: 1438, label: 'Pachacuti begins Inca expansion' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is a historically defensible comparison of the Mexica and the Inca?',
        choices: [
          'The Mexica relied on tribute from conquered peoples, while the Inca relied on required labor',
          'Neither state had an organized government',
          'The Inca were a Muslim state, while the Mexica were Christian',
          'Both were maritime empires based on sea trade',
        ],
        answer: 0,
        explanations: [
          'Correct. Tribute vs. mit\'a is a real, supportable difference.',
          'Incorrect. Both had complex governments.',
          'Incorrect. Neither was Muslim or Christian before European contact.',
          'Incorrect. Both were land-based empires.',
        ],
      },
      checkpoints: [
        {
          question: 'Which claim best explains a similarity among states from c. 1200 to c. 1450?',
          choices: [
            'Rulers in many regions used religion to legitimize their power',
            'All states were governed by elected officials',
            'Every state depended mainly on sea trade',
            'No state collected taxes or tribute',
          ],
          answer: 0,
          explanations: [
            'Correct. From Song Confucianism to Inca sun worship, religion justified rule.',
            'Incorrect. Elected government was very rare.',
            'Incorrect. Many were land-based and agricultural.',
            'Incorrect. Nearly all collected taxes, tribute or labor.',
          ],
        },
        {
          question: 'A student claims that Europe was more decentralized than Song China. Which evidence best supports this?',
          choices: [
            'European kings depended on vassals for armies, while Song emperors used salaried officials chosen by exams',
            'Both Europe and China were mainly agricultural',
            'The Black Death reached Europe in 1347',
            'Champa rice spread through southern China',
          ],
          answer: 0,
          explanations: [
            'Correct. It contrasts how each state actually exercised power.',
            'Incorrect. That is a similarity and says nothing about centralization.',
            'Incorrect. That is about disease, not government structure.',
            'Incorrect. That is about agriculture, not centralization.',
          ],
        },
      ],
      revisit:
        'Comparison: name a specific similarity or difference, explain why, and make a defensible claim. Compare states by ' +
        'centralization, labor and revenue (taxes, tribute, mit\'a, serfdom) and religious legitimacy.',
    },
  ],
};

export default pack;
