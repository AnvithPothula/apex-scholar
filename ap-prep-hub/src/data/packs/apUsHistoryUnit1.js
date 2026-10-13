/**
 * AP U.S. History Unit 1: Period 1, 1491–1607 — study pack.
 *
 * Written against the AP U.S. History CED effective Fall 2026 (topics
 * 1.1–1.7, key concepts KC-1.1 and KC-1.2). Period 1 is a small slice of the
 * exam, so the pack stays tight: what native societies looked like before
 * contact, why Europeans sailed, what the Columbian Exchange and the Spanish
 * Empire changed, and how each side made sense of the other. The last topic
 * practices causation with a timeline activity.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-us-history/unit-1',
  subject: 'AP U.S. History',
  unit: 'Unit 1: Period 1, 1491–1607',
  examWeight: '4–6% of the exam',
  intro:
    'Before 1492, North America held hundreds of societies shaped by their environments. Then European voyages connected two ' +
    'worlds that had developed apart for thousands of years. This unit covers who lived here, why Europeans came, what the ' +
    'Columbian Exchange and the Spanish Empire changed, and how Europeans, Native Americans and Africans saw each other.',
  sections: [
    {
      id: '1.1',
      ced: 'KC-1.1, KC-1.2',
      title: 'Contextualizing Period 1',
      minutes: 4,
      summary:
        'Native societies across North America adapted to very different environments. In Europe, the end of the Reconquista, ' +
        'rivalry for Asian trade, new ships and navigation tools, and Christian missionary zeal pushed explorers across the Atlantic. ' +
        'Contact set off the Columbian Exchange and remade both sides of the ocean.',
      body: String.raw`### Two worlds before 1492
- **The Americas**: millions of people in societies ranging from mobile hunting bands to cities. Cahokia, near present-day St. Louis, may have held 10,000–20,000 people around 1100. Ways of life followed the environment: farming where water and soil allowed, mobility where resources were scarce.
- **Europe**: competing monarchies. Spain and Portugal wanted a sea route to Asian spices and silk that avoided the Ottoman and Italian middlemen who controlled the overland and Mediterranean routes.

### Why the 1490s?
| Push | What it means |
|---|---|
| **Reconquista ends (1492)** | Spain's Catholic monarchs finish conquering Muslim Granada and have soldiers, crusading zeal and money to spare |
| **Competition** | Portugal is already sailing around Africa toward India; Spain wants its own route |
| **Technology** | Caravels, the magnetic compass and the astrolabe make long ocean voyages possible |
| **Religion** | Spreading Christianity is a stated goal and a justification |

### Contextualization on the exam
The essays reward **contextualization**: describing the broader situation before or around your topic, not just a sentence of background. For Period 1, that usually means the state of native societies before contact, or the European rivalries and technology behind exploration.`,
      blocks: [],
      precheck: {
        question: 'Which development in Europe most directly encouraged Spain to sponsor Columbus\'s 1492 voyage?',
        choices: [
          'Competition with Portugal for a sea route to Asian trade',
          'The founding of English colonies in Virginia',
          'A shortage of farmland caused by the Columbian Exchange',
          'The Protestant Reformation in Spain',
        ],
        answer: 0,
        explanations: [
          'Correct. Portugal was already pushing around Africa toward Asia; Spain wanted its own route to spices and silk.',
          'Incorrect. Jamestown wasn\'t founded until 1607, more than a century later.',
          'Incorrect. The Columbian Exchange began after 1492, so it couldn\'t cause the voyage.',
          'Incorrect. The Reformation began in 1517, and Spain stayed firmly Catholic.',
        ],
      },
      checkpoints: [
        {
          question: 'A student is writing an essay on Spanish conquest in the Americas. Which sentence provides the strongest contextualization?',
          choices: [
            'Spain had just completed the Reconquista in 1492, leaving a crusading, militarized nobility eager for new lands and converts.',
            'Hernán Cortés was a Spanish conquistador.',
            'The Spanish conquest was very important.',
            'Many years later, the United States declared independence.',
          ],
          answer: 0,
          explanations: [
            'Correct. It describes the broader situation in Spain that helps explain the conquest.',
            'Incorrect. That is an identifying fact, not context.',
            'Incorrect. It is a vague claim with no historical situation described.',
            'Incorrect. Context is about the situation before or during the topic, not an unrelated later event.',
          ],
        },
        {
          question: 'Which best describes North America before European contact?',
          choices: [
            'Many distinct societies whose economies and settlements fit their environments',
            'A sparsely populated wilderness with few organized societies',
            'A single empire ruled from the Mississippi River Valley',
            'Societies that all relied on large-scale maize farming',
          ],
          answer: 0,
          explanations: [
            'Correct. Native societies were diverse and shaped by their environments.',
            'Incorrect. Millions of people lived in organized societies, some with large towns.',
            'Incorrect. No single state controlled North America; Cahokia was a regional center.',
            'Incorrect. Some depended on maize, while others hunted, gathered or fished.',
          ],
        },
      ],
      revisit:
        'Before 1492: diverse native societies adapted to their environments. Europe: Reconquista ends, Spain and Portugal compete for ' +
        'Asian trade, new sailing technology, and missionary goals. Contextualization means describing that broader situation.',
    },
    {
      id: '1.2',
      ced: 'KC-1.1.I',
      title: 'Native American Societies Before European Contact',
      minutes: 7,
      summary:
        'Maize spread north from Mexico into the Southwest, supporting irrigation, settled towns and more complex societies. Scarce ' +
        'resources in the Great Basin and Great Plains favored mobile hunting and gathering. The Northeast, Mississippi Valley and ' +
        'Atlantic seaboard mixed farming and hunting in permanent villages. The Northwest and California fished and gathered in settled communities.',
      body: String.raw`The pattern to remember: **environment shaped economy, and economy shaped settlement and social structure.**

### Maize changes the Southwest
Maize was domesticated in present-day Mexico and spread north. In the dry Southwest, the **Pueblo** peoples (and their ancestors) built **irrigation** systems, multistory adobe and stone towns, and more complex, socially diverse societies. Farming surplus = settled life + specialized roles.

### Region by region
| Region | Environment | Economy | Settlement |
|---|---|---|---|
| **Southwest** (Pueblo) | Arid | Maize farming with irrigation | Permanent towns |
| **Great Basin** and **Great Plains** | Dry, scarce resources | Hunting (bison on the Plains) and gathering | **Mobile**, small bands |
| **Northeast** (e.g., Haudenosaunee/Iroquois) | Forests, rivers | **Mixed**: "Three Sisters" (maize, beans, squash) plus hunting | Permanent villages (longhouses) |
| **Mississippi River Valley** (Mississippian, e.g., Cahokia) | Fertile floodplain | Mixed, maize-heavy | Large permanent towns with earthen mounds |
| **Atlantic seaboard** | Coastal, forested | Mixed farming, hunting, fishing | Permanent villages |
| **Northwest** (e.g., Chinook) and **California** | Rich rivers and coast | **Hunting, gathering and fishing** (salmon, acorns, shellfish) | **Settled**, sometimes dense, without much farming |

### The exam trap
Settled life didn't require farming. Northwest coast peoples lived in permanent villages with ranked societies because the ocean and rivers supplied so much food. And mobile Plains life was a response to scarce resources, not a lack of sophistication.

(Horses came later: Plains peoples adopted Spanish horses mainly in the 1600s–1700s, which transformed bison hunting.)`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Maize cultivation (Southwest)', back: 'Spread north from Mexico; supported irrigation, permanent Pueblo towns and social diversification.' },
            { front: 'Great Basin / Great Plains', back: 'Scarce resources → mobile societies that hunted (bison on the Plains) and gathered.' },
            { front: 'Three Sisters', back: 'Maize, beans and squash grown together; the core of Northeastern and Mississippian mixed agriculture.' },
            { front: 'Cahokia', back: 'Largest Mississippian center (near St. Louis), peaking around 1050–1150, with huge earthen mounds.' },
            { front: 'Northwest coast societies', back: 'Settled villages supported by salmon and ocean resources rather than farming.' },
          ],
        },
      ],
      precheck: {
        question: 'Which factor best explains why many societies of the Great Plains and Great Basin were mobile before contact?',
        choices: [
          'Scarce natural resources required moving to hunt and gather',
          'European settlers had pushed them off their farmland',
          'Horses allowed them to travel long distances',
          'Maize farming exhausted the soil every year',
        ],
        answer: 0,
        explanations: [
          'Correct. Dry land and scattered resources favored mobile hunting and gathering.',
          'Incorrect. This describes life before contact, so European settlers aren\'t the cause.',
          'Incorrect. Horses came from Europeans and spread to the Plains later.',
          'Incorrect. These regions relied little on maize farming.',
        ],
      },
      checkpoints: [
        {
          question: 'Native peoples of the Pacific Northwest lived in large, permanent villages with little agriculture. What made this possible?',
          choices: [
            'Abundant fish and ocean resources',
            'Irrigation systems copied from the Pueblo peoples',
            'Maize surpluses traded from the Mississippi Valley',
            'Livestock introduced in the Columbian Exchange',
          ],
          answer: 0,
          explanations: [
            'Correct. Rich salmon runs and ocean resources supported settled communities without farming.',
            'Incorrect. Northwest societies didn\'t depend on irrigated agriculture.',
            'Incorrect. Their food came from local rivers and the ocean, not long-distance maize trade.',
            'Incorrect. That came after contact; the CED describes pre-contact societies.',
          ],
        },
        {
          question: 'The spread of maize cultivation into the present-day American Southwest most directly led to:',
          choices: [
            'Irrigation, permanent towns and more complex social structures',
            'A shift to mobile bison hunting',
            'The decline of trade between native societies',
            'The adoption of European-style private property',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED ties maize to economic development, settlement, advanced irrigation and social diversification.',
            'Incorrect. Farming encouraged settling down, not mobility.',
            'Incorrect. Agricultural surplus tends to support trade, not end it.',
            'Incorrect. This was a native development with no European involvement.',
          ],
        },
      ],
      revisit:
        'Southwest: maize + irrigation → permanent Pueblo towns. Great Basin/Plains: scarce resources → mobile. Northeast, Mississippi ' +
        'Valley, Atlantic: mixed farming and hunting → permanent villages. Northwest/California: fishing and gathering → settled villages.',
    },
    {
      id: '1.3',
      ced: 'KC-1.2.I.A',
      title: 'European Exploration in the Americas',
      minutes: 4,
      summary:
        'European nations explored and colonized for new sources of wealth, economic and military advantage over rivals, and to ' +
        'spread Christianity: "God, gold and glory." Portugal led the way down the African coast; Spain sponsored Columbus in 1492.',
      body: String.raw`### Motives: God, gold and glory
| Motive | Example |
|---|---|
| **Wealth** (gold) | A direct sea route to Asian spices; later, American gold and silver |
| **Competition** (glory) | Spain vs. Portugal, then England and France, each racing for power and prestige |
| **Religion** (God) | Converting Native peoples to Catholicism; after 1517, Catholic–Protestant rivalry too |

### Key voyages
- **Portugal**: Bartolomeu Dias rounds Africa's Cape of Good Hope (1488); Vasco da Gama reaches India (1498). Portugal builds a trading empire along Africa's coast.
- **Spain**: Columbus, sponsored by Ferdinand and Isabella, reaches the Caribbean in **1492**, thinking he has reached Asia.
- **Treaty of Tordesillas (1494)**: Spain and Portugal split the non-European world along a line in the Atlantic, which is why Brazil speaks Portuguese.
- England and France explored North America's coast in the 1500s (Cabot, Cartier) but didn't build lasting colonies until the 1600s.`,
      blocks: [],
      precheck: {
        question: 'Which was NOT a major motive for European exploration in the 1400s–1500s?',
        choices: [
          'Escaping religious persecution under Native American rule',
          'Finding new sources of wealth',
          'Gaining advantage over rival nations',
          'Spreading Christianity',
        ],
        answer: 0,
        explanations: [
          'Correct. That makes no sense historically; the other three are the classic "gold, glory and God."',
          'Incorrect. Wealth was a central motive.',
          'Incorrect. Economic and military competition drove exploration.',
          'Incorrect. Spreading Christianity was a stated goal.',
        ],
      },
      checkpoints: [
        {
          question: 'The Treaty of Tordesillas (1494) is best understood as evidence of:',
          choices: [
            'Competition between Spain and Portugal for overseas empire',
            'Cooperation between Europeans and Native Americans',
            'England\'s early lead in colonization',
            'The Protestant Reformation\'s effect on exploration',
          ],
          answer: 0,
          explanations: [
            'Correct. It divided newly claimed lands between the two leading rivals.',
            'Incorrect. Native peoples weren\'t parties to it; it divided their lands without them.',
            'Incorrect. England had no lasting colonies until 1607.',
            'Incorrect. It came 23 years before the Reformation began.',
          ],
        },
        {
          question: 'Portugal\'s voyages along the coast of Africa in the 1400s were mainly aimed at:',
          choices: [
            'Reaching Asian trade by sea',
            'Founding colonies in North America',
            'Finding the Northwest Passage',
            'Converting the Aztecs',
          ],
          answer: 0,
          explanations: [
            'Correct. Portugal sought a sea route around Africa to Asian spices, reached by da Gama in 1498.',
            'Incorrect. Portugal focused on Africa, Asia and later Brazil.',
            'Incorrect. That search was by the English and French in North America.',
            'Incorrect. The Aztecs were unknown to Europeans until 1519.',
          ],
        },
      ],
      revisit:
        'Motives: wealth, competition with rivals, spreading Christianity. Portugal around Africa (Dias 1488, da Gama 1498); Spain ' +
        'sponsored Columbus (1492); Tordesillas (1494) split claims between them.',
    },
    {
      id: '1.4',
      ced: 'KC-1.2.I.B, KC-1.2.I.C, KC-1.2.II.A',
      title: 'Columbian Exchange, Spanish Exploration, and Conquest',
      minutes: 8,
      summary:
        'The Columbian Exchange moved crops, animals and diseases across the Atlantic. American crops fed European population growth; ' +
        'American silver and gold shifted Europe from feudalism toward capitalism. New sailing technology and joint-stock companies ' +
        'made it possible. In the Americas, epidemics killed most Native people, and the Spanish conquered the Aztec and Inca empires.',
      body: String.raw`### The Columbian Exchange
| Americas → Europe, Africa, Asia | Europe, Africa, Asia → Americas |
|---|---|
| **Maize, potatoes**, tomatoes, cacao, tobacco | **Horses, cattle, pigs**, wheat, sugarcane, rice |
| | **Smallpox**, measles, influenza |

### Effects in Europe
- **Population growth**: high-calorie American crops like potatoes and maize fed more people.
- **Feudalism → capitalism**: huge flows of American silver (e.g., Potosí in Bolivia, discovered 1545) and gold enriched merchants and states, fueled inflation, and helped shift wealth from land-based feudal lords to trade and money.
- **Enabling tools**: the **caravel** (a nimble ship), the **magnetic compass** and the **astrolabe**, plus **joint-stock companies**, where many investors pooled money and shared the risk of voyages.

### Effects in the Americas
- **Epidemics**: Native peoples had no immunity to Old World diseases. Many populations fell by well over half, some by 90%, within a century. Disease, not just guns, was the deadliest force.
- **New crops and animals** changed landscapes and ways of life. European livestock trampled Native fields; horses would later transform Plains life.
- **Conquest**: Hernán Cortés toppled the Aztec Empire (1519–1521) with the help of Native allies like the **Tlaxcalans**, who resented Aztec rule, and a smallpox epidemic. Francisco Pizarro conquered the Inca (1532–1533).

### Big-picture effect
Spain became Europe's richest power for a time, and the Atlantic replaced the Mediterranean as the center of European trade.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Columbian Exchange', back: 'Transfer of plants, animals, people and diseases between the Eastern and Western Hemispheres after 1492.' },
            { front: 'Effect of American crops on Europe', back: 'Potatoes and maize supported European population growth.' },
            { front: 'Effect of American silver on Europe', back: 'Enriched states and merchants, caused inflation, and helped shift Europe from feudalism toward capitalism.' },
            { front: 'Joint-stock company', back: 'Many investors pool money for a venture and share profits and risk.' },
            { front: 'Why the Aztecs fell so fast', back: 'Smallpox epidemics, Native allies (Tlaxcalans) who fought with Cortés, and Spanish steel, guns and horses.' },
          ],
        },
      ],
      precheck: {
        question: 'Which was the most significant cause of the decline of Native American populations after 1492?',
        choices: [
          'Epidemic diseases such as smallpox',
          'Warfare with European armies',
          'Famine caused by the end of maize farming',
          'Migration to Europe',
        ],
        answer: 0,
        explanations: [
          'Correct. Old World diseases, to which Native peoples had no immunity, killed far more than warfare did.',
          'Incorrect. Warfare was brutal but killed far fewer people than disease.',
          'Incorrect. Maize farming continued; it even spread worldwide.',
          'Incorrect. Very few Native people went to Europe.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes an effect of the Columbian Exchange on Europe?',
          choices: [
            'American crops such as potatoes contributed to population growth',
            'Smallpox from the Americas killed most Europeans',
            'Horses from the Americas transformed European farming',
            'European wealth declined because silver left for the Americas',
          ],
          answer: 0,
          explanations: [
            'Correct. High-calorie American crops helped European populations grow.',
            'Incorrect. Smallpox traveled from Europe to the Americas, not the reverse.',
            'Incorrect. Horses went from Europe to the Americas.',
            'Incorrect. Silver flowed from the Americas to Europe.',
          ],
        },
        {
          question: 'The influx of American silver into Europe in the 1500s most directly contributed to:',
          choices: [
            'A shift from feudalism toward capitalism',
            'The end of the Atlantic slave trade',
            'The collapse of European trade with Asia',
            'A return to self-sufficient manorial farming',
          ],
          answer: 0,
          explanations: [
            'Correct. New wealth strengthened merchants, money and markets at the expense of feudal landholding.',
            'Incorrect. The slave trade grew as American mines and plantations expanded.',
            'Incorrect. Much American silver flowed on to Asia, expanding that trade.',
            'Incorrect. Silver pushed Europe toward markets, away from self-sufficient manors.',
          ],
        },
      ],
      revisit:
        'Exchange: American crops → Europe (population growth); Old World animals, crops and diseases → Americas. Silver → feudalism to ' +
        'capitalism. Caravels, compass, astrolabe and joint-stock companies made it possible. Epidemics devastated Native peoples; Cortés ' +
        'beat the Aztecs with Native allies and disease.',
    },
    {
      id: '1.5',
      ced: 'KC-1.2.II.B, KC-1.2.II.C, KC-1.2.II.D',
      title: 'Labor, Slavery, and Caste in the Spanish Colonial System',
      minutes: 6,
      summary:
        'Through the encomienda system, the Spanish forced Native Americans to work on plantations and in mines. As Native populations ' +
        'collapsed, European traders worked with some West African groups who practiced slavery to buy enslaved Africans for the ' +
        'Americas. Spain sorted its diverse colonial population into a caste system based on ancestry.',
      body: String.raw`### Encomienda
The Spanish Crown granted colonists (**encomenderos**) the right to demand **labor and tribute** from Native people in an area, in exchange for supposedly protecting them and teaching them Christianity. In practice it was forced labor on plantations and in mines, and abuse was widespread. The **New Laws of 1542** tried to phase it out, partly in response to critics like Bartolomé de las Casas (Topic 1.6), but forced Native labor continued under other names.

### The Atlantic slave trade begins
- Native populations collapsed from disease and overwork, and colonists wanted more labor.
- **European traders partnered with some West African groups who already practiced slavery**, buying captives (often taken in war) to ship across the Atlantic.
- The Spanish imported enslaved Africans to work in **plantation agriculture** (especially sugar in the Caribbean) and in **mining**.

### The caste system (sistema de castas)
Spain's colonies mixed Europeans, Africans and Native Americans. The Spanish responded with a hierarchy that defined each person's status by ancestry:

| Rank (roughly) | Group |
|---|---|
| Top | **Peninsulares**: born in Spain |
| | **Criollos**: Spanish ancestry, born in the Americas |
| | **Mestizos**: Spanish and Native ancestry |
| | **Mulattoes**: Spanish and African ancestry; **zambos**: African and Native ancestry |
| Bottom | Native Americans and enslaved Africans |

Status shaped taxes, jobs, legal rights and marriage. Notice the contrast with later English colonies, which drew a much harder line between "white" and everyone else and recognized fewer mixed categories.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Encomienda system', back: 'Spanish colonists got the right to Native labor and tribute in return for "protection" and Christian instruction; in practice, forced labor.' },
            { front: 'New Laws of 1542', back: 'Spanish laws limiting the encomienda and Native enslavement, after protests by reformers like las Casas.' },
            { front: 'How the Atlantic slave trade got its captives', back: 'European traders partnered with West African groups who practiced slavery, buying people to ship to the Americas.' },
            { front: 'Spanish caste system', back: 'A hierarchy that defined status by ancestry: peninsulares, criollos, mestizos, mulattoes, zambos, Native Americans, enslaved Africans.' },
          ],
        },
      ],
      precheck: {
        question: 'The encomienda system was primarily a way to:',
        choices: [
          'Use Native American labor for Spanish plantations and mines',
          'Give land to formerly enslaved Africans',
          'Govern English colonies in North America',
          'Protect Native land rights from colonists',
        ],
        answer: 0,
        explanations: [
          'Correct. It marshaled Native labor for agriculture and extracting precious metals.',
          'Incorrect. It had nothing to do with freeing or rewarding enslaved Africans.',
          'Incorrect. It was a Spanish institution.',
          'Incorrect. Whatever its stated purpose, it took Native labor rather than protecting Native rights.',
        ],
      },
      checkpoints: [
        {
          question: 'Which most directly led the Spanish to import enslaved Africans to their American colonies?',
          choices: [
            'The collapse of Native populations and the demand for labor in mines and plantations',
            'A Spanish law banning all forced labor',
            'The success of English tobacco plantations',
            'A surplus of European workers willing to migrate',
          ],
          answer: 0,
          explanations: [
            'Correct. Disease and overwork shrank the Native labor supply while mining and sugar demanded more workers.',
            'Incorrect. Spain never banned all forced labor; the New Laws limited the encomienda.',
            'Incorrect. English tobacco plantations came after 1607.',
            'Incorrect. Labor was scarce, not surplus.',
          ],
        },
        {
          question: 'The Spanish caste system is best described as:',
          choices: [
            'A hierarchy that defined people\'s status by their European, African and Native ancestry',
            'A system that treated all colonists as legal equals',
            'A religious order that ran Spanish missions',
            'A labor system that replaced slavery with wage work',
          ],
          answer: 0,
          explanations: [
            'Correct. It carefully defined status for people of every mix of ancestry.',
            'Incorrect. It was explicitly unequal.',
            'Incorrect. Missions were run by religious orders like the Franciscans; castes were social ranks.',
            'Incorrect. Slavery continued alongside it.',
          ],
        },
      ],
      revisit:
        'Encomienda = forced Native labor for mines and plantations. Native collapse → Europeans partnered with West African slave-trading ' +
        'groups → enslaved Africans for plantations and mines. Caste system ranked people by ancestry, peninsulares at the top.',
    },
    {
      id: '1.6',
      ced: 'KC-1.2.III',
      title: 'Cultural Interactions Between Europeans, Native Americans, and Africans',
      minutes: 7,
      summary:
        'Europeans and Native Americans held divergent worldviews on religion, gender roles, family, land use and power. Early contact ' +
        'was full of misunderstanding, though each side adopted useful parts of the other\'s culture. Native peoples resisted ' +
        'encroachment through diplomacy and war. Europeans debated how non-Europeans should be treated, while building religious, ' +
        'cultural and racial justifications for subjugating them.',
      body: String.raw`### Divergent worldviews
| Issue | Many Native American societies | Europeans |
|---|---|---|
| **Land** | Communal use rights; land couldn't really be "owned" or sold forever | Private property, fenced and bought or sold |
| **Religion** | Spiritual forces in nature, many local traditions | Christian monotheism, a duty to convert others |
| **Gender and family** | Women often farmed and could hold real power (Haudenosaunee clan mothers chose chiefs; many societies were matrilineal) | Patriarchal: men farmed, owned property and ruled |
| **Power** | Often consensus-based and kinship-based | Monarchs, written law, conquest by right of discovery |

So when a Native leader "sold" land, they often thought they were granting the right to share it, while the Europeans believed they had bought it outright.

### Misunderstanding, then borrowing
Each side tried to make sense of the other through its own beliefs. Over time they adopted useful pieces of each other's culture: Europeans took up maize, canoes and Native trails and trapping methods; Native peoples adopted metal tools, guns, cloth and, later, horses.

### Native resistance
As Europeans took more land and demanded more labor, Native peoples defended their sovereignty, economies, religions and gender roles through **diplomacy** (alliances, playing Europeans against each other, as the Tlaxcalans allied with Cortés against the Aztecs) and **military resistance** (the Mixtón War against the Spanish in 1540–1542, and later the Pueblo Revolt of 1680).

### Europeans debate
- **Bartolomé de las Casas**, a Dominican friar and former encomendero, condemned Spanish cruelty (*A Short Account of the Destruction of the Indies*) and argued Native people were fully human and should be converted peacefully.
- **Juan Ginés de Sepúlveda** argued Native people were "natural slaves" who could be conquered.
- They faced off at the **Valladolid debate (1550–1551)**, and reformers' pressure helped produce the New Laws of 1542.
- Meanwhile, Europeans built religious, cultural and **racial** justifications for subjugation. Las Casas himself first suggested using African labor to spare Native people, a view he later regretted, showing how protection for one group could rest on the enslavement of another.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Native vs. European views of land', back: 'Native: communal use rights. European: private ownership that could be bought and sold.' },
            { front: 'Bartolomé de las Casas', back: 'Spanish friar who exposed abuses of Native people and argued for their humane treatment.' },
            { front: 'Juan Ginés de Sepúlveda', back: 'Argued Native peoples were "natural slaves," justifying conquest; opposed las Casas at Valladolid (1550–1551).' },
            { front: 'Two forms of Native resistance', back: 'Diplomatic negotiation (alliances, treaties) and military resistance.' },
          ],
        },
      ],
      precheck: {
        question: 'Bartolomé de las Casas is best known for:',
        choices: [
          'Criticizing Spanish mistreatment of Native Americans',
          'Leading the conquest of the Inca Empire',
          'Founding the first English colony',
          'Arguing that Native peoples were natural slaves',
        ],
        answer: 0,
        explanations: [
          'Correct. He documented and condemned Spanish abuses.',
          'Incorrect. That was Francisco Pizarro.',
          'Incorrect. He was a Spanish friar, not an English colonizer.',
          'Incorrect. That was his opponent, Juan Ginés de Sepúlveda.',
        ],
      },
      checkpoints: [
        {
          question: 'Conflicts over land between Europeans and Native Americans were often worsened by:',
          choices: [
            'Different ideas about whether land could be owned and sold',
            'Native Americans\' refusal to trade with Europeans',
            'Europeans\' belief that land should be held communally',
            'Shared religious beliefs about land',
          ],
          answer: 0,
          explanations: [
            'Correct. Many Native peoples saw land as shared use; Europeans saw it as private property.',
            'Incorrect. Trade between them was widespread.',
            'Incorrect. That reverses the two views.',
            'Incorrect. Their religious beliefs differed sharply.',
          ],
        },
        {
          question: 'The Valladolid debate (1550–1551) is best used as evidence of:',
          choices: [
            'European disagreement over how non-Europeans should be treated',
            'Native American military resistance to Spain',
            'The Columbian Exchange\'s effect on European diets',
            'Agreement among Europeans that conquest was wrong',
          ],
          answer: 0,
          explanations: [
            'Correct. Las Casas and Sepúlveda argued opposite positions on the treatment of Native peoples.',
            'Incorrect. It was a debate among Europeans, not a Native uprising.',
            'Incorrect. It was about the treatment of people, not food.',
            'Incorrect. The debate shows they disagreed; Sepúlveda defended conquest.',
          ],
        },
      ],
      revisit:
        'Divergent worldviews on land (communal vs. private), religion, gender and power. Early misunderstanding, then mutual borrowing. ' +
        'Natives resisted by diplomacy and war. Europeans debated treatment (las Casas vs. Sepúlveda) while justifying subjugation.',
    },
    {
      id: '1.7',
      ced: 'KC-1.1, KC-1.2',
      title: 'Causation in Period 1',
      minutes: 5,
      summary:
        'Causation means explaining why something happened and what it led to, and judging which causes or effects mattered most. ' +
        'In Period 1, the main chains run from European motives and technology to exploration, from contact to the Columbian Exchange ' +
        'and Native population collapse, and from labor shortages to the encomienda and the Atlantic slave trade.',
      body: String.raw`### Causation, the skill
A strong causation argument does three things:
1. Names **specific causes or effects**, not vague ones ("disease," not "bad things happened").
2. Explains **how** the cause produced the effect.
3. Ranks them: which mattered **most**, and is a cause **short-term** or **long-term**?

### Period 1 cause-and-effect chains
| Cause | → | Effect |
|---|---|---|
| Competition for Asian trade, Reconquista, new ship and navigation technology | → | European voyages across the Atlantic |
| Contact between hemispheres | → | Columbian Exchange |
| Old World diseases | → | Native population collapse |
| Native population collapse + demand for mine and plantation labor | → | Expansion of the Atlantic slave trade |
| American crops | → | European population growth |
| American silver | → | Shift from feudalism toward capitalism |
| Spanish colonies with diverse populations | → | The caste system |
| Divergent worldviews + encroachment | → | Native resistance and European debates over treatment |

### Sample claim
"The most significant effect of European contact on Native Americans was epidemic disease, because it killed far more people than warfare and left survivors less able to resist conquest and forced labor."

Try the timeline below. Getting the order right is the first step: a cause has to come before its effect.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Period 1 events',
            events: [
              { year: 1488, label: 'Dias rounds the Cape of Good Hope' },
              { year: 1492, label: 'Columbus reaches the Caribbean' },
              { year: 1494, label: 'Treaty of Tordesillas' },
              { year: 1521, label: 'Cortés and the Tlaxcalans take Tenochtitlan' },
              { year: 1542, label: 'Spain\'s New Laws limit the encomienda' },
              { year: 1550, label: 'Valladolid debate begins' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is a long-term effect of the Columbian Exchange?',
        choices: [
          'Worldwide spread of American crops such as maize and potatoes',
          'Columbus\'s first landing in the Caribbean',
          'Portugal\'s voyages around Africa',
          'The end of the Reconquista',
        ],
        answer: 0,
        explanations: [
          'Correct. American crops spread across the world and fed growing populations for centuries.',
          'Incorrect. That started the exchange; it wasn\'t an effect of it.',
          'Incorrect. Those voyages came before the exchange.',
          'Incorrect. The Reconquista ended in 1492, before the exchange had any effect.',
        ],
      },
      checkpoints: [
        {
          question: 'Which pair shows a cause followed by its effect?',
          choices: [
            'Native population collapse → expansion of the African slave trade to Spanish America',
            'Spanish caste system → Spanish conquest of the Aztecs',
            'New Laws of 1542 → Columbus\'s first voyage',
            'Valladolid debate → Treaty of Tordesillas',
          ],
          answer: 0,
          explanations: [
            'Correct. Losing Native labor pushed the Spanish to import enslaved Africans.',
            'Incorrect. The caste system developed after the conquest, not before it.',
            'Incorrect. The New Laws came 50 years after Columbus.',
            'Incorrect. Tordesillas (1494) came long before Valladolid (1550).',
          ],
        },
        {
          question: 'A historian argues that disease mattered more than military technology in the Spanish conquest of the Aztecs. Which evidence best supports this?',
          choices: [
            'A smallpox epidemic killed a large share of Tenochtitlan\'s people during the siege',
            'Spanish soldiers had steel swords and some firearms',
            'Spain had just completed the Reconquista',
            'Cortés had only a few hundred Spanish soldiers',
          ],
          answer: 0,
          explanations: [
            'Correct. It shows disease directly weakening Aztec resistance at the decisive moment.',
            'Incorrect. That supports the military-technology side of the argument.',
            'Incorrect. That is context, not evidence about disease.',
            'Incorrect. A small force raises the question but doesn\'t show disease was the reason.',
          ],
        },
      ],
      revisit:
        'Causation: name specific causes and effects, explain how, and rank them. Key chains: motives + technology → voyages; contact → ' +
        'Columbian Exchange; disease → Native collapse → African slave trade; silver → capitalism.',
    },
  ],
};

export default pack;
