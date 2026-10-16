/**
 * AP U.S. History Unit 2: Period 2, 1607–1754 — study pack.
 *
 * Written against the AP U.S. History CED effective Fall 2026 (topics
 * 2.1–2.8, key concepts KC-2.1 and KC-2.2). The unit compares how four
 * European empires colonized, how Britain's colonial regions differed, how
 * Atlantic trade and slavery tied them together, and why colonists grew both
 * more British and more resentful of British control. Two sorts and a
 * timeline practice the unit's comparison and causation skills.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-us-history/unit-2',
  subject: 'AP U.S. History',
  unit: 'Unit 2: Period 2, 1607–1754',
  examWeight: '6–8% of the exam',
  intro:
    'Spain, France, the Netherlands and Britain all colonized North America, but for different reasons and in different ways. ' +
    'This unit compares those empires, then zooms in on Britain\'s colonial regions, the Atlantic trade and slavery that ' +
    'connected them, and the ideas that made colonists both more British and more suspicious of British power.',
  sections: [
    {
      id: '2.1',
      ced: 'KC-2.1, KC-2.2',
      title: 'Contextualizing Period 2',
      minutes: 4,
      summary:
        'By 1607 Spain had a century-old empire, and England, France and the Netherlands wanted their own. Each empire had ' +
        'different goals for land and labor, and each settled a different environment. Over time Britain\'s colonies grew ' +
        'closer to Britain and to each other, and at the same time more resistant to British control.',
      body: String.raw`### Where Period 1 left off
- Spain ruled a large, wealthy empire built on conquest, silver and forced Native labor.
- The **Columbian Exchange** had already spread crops, animals and diseases. Epidemics had killed a huge share of Native people.
- The Atlantic slave trade was growing to replace lost Native labor.

### What changes in Period 2
| Before 1607 | 1607–1754 |
|---|---|
| Spain dominates | England, France and the Netherlands build rival colonies |
| Few Europeans north of Mexico | Large English migration along the Atlantic coast |
| Slavery centered on Spanish and Portuguese colonies | Slavery spreads through every British colony and dominates the South and the West Indies |
| Colonies tied tightly to the crown | British colonies govern themselves under loose imperial control |

### The two big ideas
1. **KC-2.1**: Europeans colonized in different ways because of different **imperial goals, cultures and environments**, and they competed with each other and with American Indians.
2. **KC-2.2**: The British colonies became more **tied to Britain** through trade, religion and ideas, but those same exchanges fed **resistance** to British control.

### Contextualization reminder
Context is the broader situation around your topic. For a Period 2 essay, strong context might be the century of Spanish colonization before Jamestown, or the rivalry among European powers for American land and trade.`,
      blocks: [],
      precheck: {
        question: 'Which development best explains why England, France and the Netherlands began colonizing North America in the early 1600s?',
        choices: [
          'Spain\'s wealth from its American empire encouraged rival European powers to seek colonies of their own',
          'The American Revolution had weakened British control of the colonies',
          'The Great Awakening created demand for religious missions in Europe',
          'The Columbian Exchange had not yet begun',
        ],
        answer: 0,
        explanations: [
          'Correct. Spanish silver and land showed what colonies could be worth, and rivals wanted a share.',
          'Incorrect. The Revolution came in the 1770s, well after this period began.',
          'Incorrect. The Great Awakening happened in the colonies in the 1730s–40s, not before colonization.',
          'Incorrect. The Columbian Exchange had been under way since 1492.',
        ],
      },
      checkpoints: [
        {
          question: 'Which sentence best contextualizes the founding of Jamestown in 1607?',
          choices: [
            'For a century, Spain had grown rich from American colonies, and England wanted its own source of wealth and a claim against Spanish power.',
            'Jamestown was located in Virginia.',
            'The colonists at Jamestown later grew tobacco.',
            'Jamestown was an important colony in American history.',
          ],
          answer: 0,
          explanations: [
            'Correct. It describes the broader rivalry and the Spanish example behind English colonization.',
            'Incorrect. That is a location, not historical context.',
            'Incorrect. That describes a later development, not the situation that led to the founding.',
            'Incorrect. A general claim of importance is not context.',
          ],
        },
        {
          question: 'Which pair of developments best reflects KC-2.2\'s idea that British colonists grew both closer to Britain and more resistant to it?',
          choices: [
            'Colonists bought more British goods and read British ideas, while also defending their own assemblies against royal governors',
            'Colonists abandoned English law and adopted Spanish legal codes',
            'Colonists stopped trading with Britain and traded only with France',
            'Colonists ended slavery and the Atlantic trade',
          ],
          answer: 0,
          explanations: [
            'Correct. Trade and print culture tied them to Britain, while self-government made them protective of their rights.',
            'Incorrect. The colonies became more English over time, not Spanish.',
            'Incorrect. Trade with Britain grew; Britain, not France, was the main partner.',
            'Incorrect. Slavery expanded across the British colonies in this period.',
          ],
        },
      ],
      revisit:
        'Period 2: rivals follow Spain into North America; each empire has different goals and settles different environments. ' +
        'British colonies grow more tied to Britain and more resistant to its control at the same time.',
    },
    {
      id: '2.2',
      ced: 'KC-2.1.I.A–C',
      title: 'European Colonization',
      minutes: 7,
      summary:
        'Spain built institutions to extract wealth, convert Native people and fold them into a hierarchy. France and the ' +
        'Netherlands sent few settlers and relied on fur trade, alliances and intermarriage. England sent many families who ' +
        'farmed land taken from Native peoples and lived apart from them.',
      body: String.raw`### Four empires, four approaches
| | Goals and settlers | Relations with American Indians |
|---|---|---|
| **Spain** | Extract wealth (silver, land, labor) and spread Catholicism; mostly men: soldiers, officials, missionaries | Subjugated, converted and incorporated Native people, along with enslaved and free Africans, into a hierarchical society |
| **France** | Fur trade; few Europeans | Trade alliances and intermarriage; traders often lived among Native communities |
| **Netherlands** | Fur trade and commerce; few Europeans | Trade alliances for furs; patroons (landholders) were given land to bring settlers |
| **England** | Farmland, social mobility, religious freedom; large numbers of men **and women**, often in families | Took Native land for agriculture and lived **separately** from Native peoples |

### Why the numbers matter
The fur trade needs Native hunters, so French and Dutch traders needed Native partners and had reasons to keep good relations. English farming needs land, and a growing population of families kept pushing onto Native land. That difference explains why English–Native relations so often ended in war.

### Spanish institutions
- **Missions** to convert Native people to Catholicism.
- **Encomienda** and later **repartimiento**: systems that drew on Native labor.
- A layered society by birth and ancestry, which you met as the caste system in Period 1.

### Exam phrasing
Questions often ask you to explain a **difference** between empires. A complete answer names both empires and gives a reason: "Unlike the English, the French relied on alliances with Native peoples because the fur trade depended on Native hunters."`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which empire does this describe?',
            buckets: ['Spain', 'France', 'Netherlands', 'England'],
            items: [
              { label: 'Missions to convert Native people to Catholicism, backed by forced labor', bucket: 0, why: 'Spain combined conversion with labor systems such as the encomienda.' },
              { label: 'A society ranked by ancestry that included Native, African and European people', bucket: 0, why: 'Spanish colonial society incorporated Native and African people into a hierarchy.' },
              { label: 'Traders living in Native villages and marrying into Native families', bucket: 1, why: 'Few French settlers came, so the fur trade ran on intermarriage and alliance.' },
              { label: 'A thin line of trading posts along the St. Lawrence and Great Lakes', bucket: 1, why: 'New France had few colonists and many trading partners.' },
              { label: 'Patroons granted large estates on the Hudson River to bring settlers', bucket: 2, why: 'The Dutch West India Company used patroonships to populate New Netherland.' },
              { label: 'A trading colony whose port later became New York', bucket: 2, why: 'New Amsterdam was taken by the English in 1664 and renamed New York.' },
              { label: 'Large numbers of families farming land taken from Native peoples', bucket: 3, why: 'English colonization drew many men and women who wanted farmland.' },
              { label: 'Colonists who mostly lived apart from Native communities', bucket: 3, why: 'English settlers generally separated themselves from Native peoples.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Why did French colonizers in North America generally rely on alliances with American Indians?',
        choices: [
          'The fur trade depended on Native hunters and trading partners',
          'France sent more settlers than any other European power',
          'French colonists needed Native land for large tobacco plantations',
          'The French crown banned contact between colonists and Native people',
        ],
        answer: 0,
        explanations: [
          'Correct. Furs came from Native hunters, so trade and alliance were the core of New France.',
          'Incorrect. France sent relatively few settlers, which is part of why alliances mattered.',
          'Incorrect. Tobacco plantations were an English Chesapeake development.',
          'Incorrect. The French encouraged trade and even intermarriage with Native peoples.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains a difference between English and Spanish colonization?',
          choices: [
            'English colonists generally lived apart from Native peoples, while the Spanish incorporated Native people into colonial society',
            'The Spanish sent more women and families than the English',
            'The English relied on Native labor in silver mines, while the Spanish relied on family farms',
            'The Spanish showed no interest in converting Native people',
          ],
          answer: 0,
          explanations: [
            'Correct. Spain built a hierarchy that included Native people; English settlers mostly kept separate.',
            'Incorrect. English migration included far more women and families.',
            'Incorrect. That reverses the two empires.',
            'Incorrect. Conversion was a central Spanish goal.',
          ],
        },
        {
          question: 'English colonists came to North America for all of the following reasons EXCEPT',
          choices: [
            'to work as traders living inside Native villages',
            'to gain land and economic opportunity',
            'to practice their religion freely',
            'to improve their living conditions',
          ],
          answer: 0,
          explanations: [
            'Correct. Living among Native trading partners describes French and Dutch fur traders, not most English migrants.',
            'Incorrect. Land and opportunity were major motives for English migrants.',
            'Incorrect. Religious freedom drew Puritans, Quakers and others.',
            'Incorrect. Better living conditions were a common motive.',
          ],
        },
      ],
      revisit:
        'Spain: extract wealth, convert and incorporate Native people. France and the Netherlands: few settlers, fur trade, alliances ' +
        'and intermarriage. England: many families, farming on taken land, living apart from Native peoples.',
    },
    {
      id: '2.3',
      ced: 'KC-2.1.II.A–E',
      title: 'The Regions of British Colonies',
      minutes: 8,
      summary:
        'Britain\'s colonies split into regions shaped by environment and settlers: tobacco in the Chesapeake, towns and mixed ' +
        'economies in New England, grain and diversity in the middle colonies, and slave plantations in the Lower South and the ' +
        'West Indies. Distance and lax oversight let all of them build self-governing institutions.',
      body: String.raw`### The regions
| Region | Economy and labor | Society |
|---|---|---|
| **Chesapeake** (Virginia, Maryland) and North Carolina | **Tobacco** exports; first white indentured servants (mostly male), later enslaved Africans | Scattered plantations; elite planters dominate |
| **New England** | Family farms plus fishing, shipbuilding and trade: a **mixed economy**; family labor | Puritan small towns; stable families, long lives, high literacy |
| **Middle colonies** (New York, Pennsylvania, New Jersey, Delaware) | **Cereal crops** (wheat) for export; family farms, tenants, some servants and enslaved people | The most ethnically and religiously **diverse** and tolerant region (Quakers, Dutch, Germans, Scots-Irish) |
| **Lower South and British West Indies** (Carolinas, Georgia, Barbados, Jamaica) | **Cash crops** (rice, indigo, sugar) grown by enslaved Africans, often the **majority** of the population | Plantation elites; enslaved people developed their own culture and religion |

### Self-government
Britain was far away and at first paid little attention, so colonists built their own institutions:
- Virginia's **House of Burgesses** (1619) was the first elected assembly.
- New England **town meetings** let free men decide local issues and elect members of the colonial legislature.
- In the South, **elite planters** held local power and dominated the assemblies.

These institutions were unusually democratic for the time, but only by 17th-century standards: voting was limited to free men, usually property owners.

### Why environment matters
Long growing seasons in the South made labor-hungry cash crops profitable. New England's rocky soil and short summers didn't, so families farmed for themselves and turned to the sea.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Match each feature to its region',
            buckets: ['Chesapeake', 'New England', 'Middle colonies', 'Lower South and West Indies'],
            items: [
              { label: 'Tobacco grown first by indentured servants', bucket: 0, why: 'The Chesapeake relied on servants before shifting to enslaved Africans.' },
              { label: 'First elected assembly in English America (1619)', bucket: 0, why: 'Virginia\'s House of Burgesses met in 1619.' },
              { label: 'Puritan towns run by town meetings', bucket: 1, why: 'New England towns governed themselves through town meetings.' },
              { label: 'Fishing, shipbuilding and trade alongside family farms', bucket: 1, why: 'New England\'s mixed economy combined agriculture and commerce.' },
              { label: 'Wheat exports and Quaker religious tolerance', bucket: 2, why: 'The middle colonies were the "breadbasket" and the most diverse region.' },
              { label: 'Dutch, German and Scots-Irish settlers side by side', bucket: 2, why: 'The middle colonies attracted a broad range of European migrants.' },
              { label: 'Rice and indigo plantations', bucket: 3, why: 'South Carolina and Georgia grew rice and indigo with enslaved labor.' },
              { label: 'Enslaved Africans as the majority of the population', bucket: 3, why: 'In the West Indies and parts of the Lower South, enslaved people outnumbered free people.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which region of British North America had the most religious and ethnic diversity?',
        choices: [
          'The middle colonies',
          'New England',
          'The Chesapeake',
          'The British West Indies',
        ],
        answer: 0,
        explanations: [
          'Correct. Pennsylvania, New York and their neighbors drew Quakers, Dutch, Germans and many other groups.',
          'Incorrect. New England was settled mostly by English Puritans and was fairly uniform.',
          'Incorrect. The Chesapeake was mostly English settlers and, later, enslaved Africans.',
          'Incorrect. The West Indies had an enslaved African majority, not wide European religious diversity.',
        ],
      },
      checkpoints: [
        {
          question: 'Which factor best explains why New England developed a mixed economy of farming and commerce?',
          choices: [
            'Short growing seasons and rocky soil made large cash-crop plantations unprofitable',
            'The British government banned farming in New England',
            'New England had the largest enslaved population in North America',
            'Puritans refused to trade with other colonies',
          ],
          answer: 0,
          explanations: [
            'Correct. The environment favored small family farms, so colonists turned to fishing, shipbuilding and trade.',
            'Incorrect. There was no such ban; New Englanders farmed widely.',
            'Incorrect. New England had relatively few enslaved people.',
            'Incorrect. New England merchants traded actively across the Atlantic.',
          ],
        },
        {
          question: 'Which statement best describes colonial self-government before 1754?',
          choices: [
            'Distance and lax British oversight let colonists build assemblies and town meetings that were democratic for the era',
            'Every colonist, including women and enslaved people, could vote for colonial legislatures',
            'Britain appointed every local official and banned elected assemblies',
            'Colonial governments were run by American Indian councils',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED stresses that distance and early neglect allowed unusual self-government.',
            'Incorrect. Voting was limited to free men, usually property owners.',
            'Incorrect. Assemblies such as the House of Burgesses were elected.',
            'Incorrect. British colonial governments were run by colonists and royal or proprietary officials.',
          ],
        },
      ],
      revisit:
        'Chesapeake: tobacco, servants then slaves. New England: towns, mixed economy, town meetings. Middle: wheat, diversity, ' +
        'tolerance. Lower South and West Indies: rice, indigo, sugar, enslaved majority. All built self-government under lax oversight.',
    },
    {
      id: '2.4',
      ced: 'KC-2.1.III.A–B, KC-2.2.I.C',
      title: 'Transatlantic Trade',
      minutes: 6,
      summary:
        'An Atlantic economy moved goods, enslaved Africans and enslaved American Indians between Europe, Africa and the ' +
        'Americas. Trade changed Native communities and spread disease. Britain tried to run the system for its own benefit ' +
        'through mercantilism, but enforcement was erratic.',
      body: String.raw`### The Atlantic economy
Colonies existed to produce commodities Europe valued (tobacco, sugar, rice, furs, timber) and to buy European manufactured goods. Enslaved Africans were carried across the **Middle Passage** to supply labor. Historians sometimes call the routes the **triangular trade**, though real routes were messier than a triangle.

### Effects on American Indian communities
Trade brought guns, metal tools, cloth and horses into Native communities. That changed how people hunted, fought and lived (horses transformed life on the Great Plains), and trade contact kept spreading epidemic diseases that caused **radical population losses**.

### Mercantilism
**Mercantilism** is the idea that a nation grows rich by exporting more than it imports, so colonies should supply raw materials and buy the mother country's goods.
- **Navigation Acts** (from 1651 on): colonial trade had to go in English ships, and key goods such as tobacco could be sold only to England.
- **Dominion of New England** (1686–1689): James II merged the northern colonies under one governor, Edmund Andros, and suspended their assemblies. After the **Glorious Revolution** of 1688 removed James, Bostonians overthrew Andros.
- **Salutary neglect**: for much of the early 1700s Britain enforced its trade laws loosely. Colonists smuggled freely and got used to running their own affairs.

### Why "erratic enforcement" matters
Britain wanted a tight, hierarchical empire, but conflicts with colonists and with American Indians made it hard to enforce. That gap between imperial goals and colonial reality sets up the conflict of Period 3.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Mercantilism', back: 'Economic theory: colonies supply raw materials and buy the mother country\'s goods so the nation exports more than it imports.' },
            { front: 'Navigation Acts', back: 'Laws from 1651 on requiring colonial trade to use English ships and sending key goods only to England.' },
            { front: 'Dominion of New England (1686–1689)', back: 'James II combined northern colonies under Governor Andros and suspended assemblies; overthrown after the Glorious Revolution.' },
            { front: 'Salutary neglect', back: 'Britain\'s loose enforcement of trade laws in the early 1700s; colonists smuggled and governed themselves.' },
            { front: 'Middle Passage', back: 'The voyage that carried enslaved Africans across the Atlantic to the Americas.' },
          ],
        },
      ],
      precheck: {
        question: 'Under mercantilism, what was the main purpose of colonies?',
        choices: [
          'To supply raw materials and buy manufactured goods from the mother country',
          'To compete with the mother country by building their own factories',
          'To trade freely with any nation that offered the best price',
          'To become independent nations as soon as possible',
        ],
        answer: 0,
        explanations: [
          'Correct. Colonies were meant to enrich the mother country through a favorable balance of trade.',
          'Incorrect. Colonial manufacturing that competed with Britain was discouraged.',
          'Incorrect. Free trade with any nation is the opposite of mercantilism.',
          'Incorrect. Mercantilism assumed colonies served the empire.',
        ],
      },
      checkpoints: [
        {
          question: 'Which was a direct effect of increased trade between Europeans and American Indians?',
          choices: [
            'New goods such as guns and horses changed Native economies, while trade contact spread epidemics',
            'American Indians stopped trading with Europeans after 1650',
            'European goods had little effect on Native communities',
            'Native populations grew rapidly because of new trade goods',
          ],
          answer: 0,
          explanations: [
            'Correct. Trade reshaped Native life and kept spreading disease, causing large population losses.',
            'Incorrect. Trade continued and grew throughout the period.',
            'Incorrect. Guns, metal tools and horses had major effects.',
            'Incorrect. Disease caused population decline, not rapid growth.',
          ],
        },
        {
          question: 'Colonists\' widespread smuggling in the early 1700s is best explained by',
          choices: [
            'Britain\'s loose enforcement of the Navigation Acts during salutary neglect',
            'the abolition of all British trade laws in 1700',
            'a British policy encouraging colonies to trade with Spain and France',
            'the absence of any demand for European goods in the colonies',
          ],
          answer: 0,
          explanations: [
            'Correct. Lax enforcement made smuggling easy and common.',
            'Incorrect. The Navigation Acts stayed on the books; they just weren\'t enforced tightly.',
            'Incorrect. Britain wanted trade to flow through Britain, not to its rivals.',
            'Incorrect. Colonists bought large amounts of European goods.',
          ],
        },
      ],
      revisit:
        'Atlantic economy: commodities to Europe, manufactured goods to the colonies, enslaved Africans via the Middle Passage. ' +
        'Trade changed Native life and spread disease. Mercantilism and the Navigation Acts, enforced erratically (salutary neglect).',
    },
    {
      id: '2.5',
      ced: 'KC-2.1.III.C, E, F',
      title: 'Interactions Between American Indians and Europeans',
      minutes: 7,
      summary:
        'Relations swung between accommodation and conflict. European empires armed Native allies, and Native groups used ' +
        'Europeans against their own rivals. British expansion led to wars such as Metacom\'s War, and the Pueblo Revolt forced ' +
        'Spain to accommodate parts of Pueblo culture.',
      body: String.raw`### Alliances ran both ways
French, Dutch, British and Spanish colonies allied with and armed Native groups. Native nations were not pawns: they chose alliances to gain trade goods and weapons and to fight their own rivals. The **Haudenosaunee (Iroquois) Confederacy**, for example, balanced between the French and British for decades, and renewed a long alliance with the English known as the **Covenant Chain**.

### British–Native wars over land
- **Powhatan Confederacy**: early trade and tension with Jamestown, then major attacks in 1622 and 1644 as English tobacco farms spread.
- **Metacom's War (King Philip's War), 1675–1676**: Wampanoag leader Metacom led a coalition against New England settlers pushing onto Native land. It was one of the deadliest wars in colonial history relative to population, and it broke Native power in southern New England.
- **Bacon's Rebellion (1676)** in Virginia began when frontier settlers demanded war on Native peoples and Governor Berkeley refused. (Its link to slavery comes up in 2.6.)

### The Pueblo Revolt (1680)
Spanish missionaries suppressed Pueblo religion and Spanish settlers demanded labor. In **1680**, led by **Popé**, the Pueblo people rose up, killed hundreds of Spanish colonists and priests, and drove the Spanish out of New Mexico for about twelve years. When Spain returned, it **accommodated** some Pueblo culture: it eased forced labor demands and tolerated some traditional religious practices.

### Sourcing tip (skill 2.A)
Many sources on these conflicts were written by colonists, such as John Smith's accounts of Powhatan. Ask who wrote it, for whom and why. Smith wrote his rescue story years after the events, which affects how reliable it is.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Period 2 conflicts and turning points',
            events: [
              { year: 1607, label: 'Jamestown founded among the Powhatan Confederacy' },
              { year: 1622, label: 'Powhatan attack on Virginia settlements' },
              { year: 1675, label: 'Metacom\'s War begins in New England' },
              { year: 1680, label: 'Pueblo Revolt drives the Spanish from New Mexico' },
              { year: 1739, label: 'Stono Rebellion in South Carolina' },
            ],
          },
        },
      ],
      precheck: {
        question: 'What was the main result of the Pueblo Revolt of 1680?',
        choices: [
          'Spain was driven out of New Mexico for a time and later accommodated some Pueblo culture',
          'The Pueblo people were permanently removed to the Great Plains',
          'England took control of New Mexico from Spain',
          'Spain abolished all Catholic missions in North America',
        ],
        answer: 0,
        explanations: [
          'Correct. The Pueblo expelled the Spanish for about twelve years, and Spain returned with a softer approach.',
          'Incorrect. The Pueblo remained in their homelands.',
          'Incorrect. England never controlled New Mexico.',
          'Incorrect. Missions continued after Spain returned.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains the cause of Metacom\'s War (1675–1676)?',
          choices: [
            'Expanding English settlement on Native land in New England',
            'French attempts to convert the Wampanoag to Catholicism',
            'Spanish demands for Native labor in silver mines',
            'A dispute over the Navigation Acts',
          ],
          answer: 0,
          explanations: [
            'Correct. Land pressure from growing English settlements drove the conflict.',
            'Incorrect. The war was fought between New England colonists and a Native coalition.',
            'Incorrect. Spain had no role in New England.',
            'Incorrect. The Navigation Acts concerned trade with Britain, not Native land.',
          ],
        },
        {
          question: 'Which statement best describes alliances between American Indians and Europeans in this period?',
          choices: [
            'Native nations chose alliances with Europeans to gain goods and weapons and to fight their own rivals',
            'Only the Spanish formed alliances with Native nations',
            'Native nations refused all alliances with Europeans',
            'Europeans forbade their colonists from trading weapons to Native peoples, and the ban was followed',
          ],
          answer: 0,
          explanations: [
            'Correct. Alliances served Native goals as well as European ones.',
            'Incorrect. French, Dutch and British colonies also allied with Native groups.',
            'Incorrect. Alliances such as the Covenant Chain were common.',
            'Incorrect. Europeans regularly armed their Native allies.',
          ],
        },
      ],
      revisit:
        'Accommodation and conflict: alliances served both sides (Covenant Chain). Land pressure → Powhatan wars, Metacom\'s War. ' +
        'Pueblo Revolt (1680) → Spain accommodates some Pueblo culture. Source tip: who wrote it, when and why.',
    },
    {
      id: '2.6',
      ced: 'KC-2.2.II.A–C',
      title: 'Slavery in the British Colonies',
      minutes: 7,
      summary:
        'Every British colony took part in the Atlantic slave trade, but slavery was largest on the plantations of the Chesapeake, ' +
        'the Lower South and above all the West Indies. New laws made slavery a hereditary, race-based status. Enslaved people ' +
        'resisted in open and hidden ways and kept their families, cultures and religions alive.',
      body: String.raw`### Why slavery grew
Land was abundant, European demand for tobacco, rice and sugar kept rising, and the supply of **indentured servants** shrank as conditions in England improved. **Bacon's Rebellion** (1676), in which poor white and Black Virginians joined against the colonial elite, also made planters wary of relying on servants who would one day be free.

### Where enslaved people were
| Place | Slavery's role |
|---|---|
| New England farms | Relatively few enslaved laborers |
| Port cities (Boston, New York, Charleston) | Significant minorities of enslaved people |
| Chesapeake and southern Atlantic coast | Large and growing plantation workforces |
| **West Indies** | Where the great majority of enslaved Africans brought to British America were sent |

Only a small fraction of all Africans carried across the Atlantic went to mainland North America. Most went to the Caribbean and Brazil, where sugar plantations worked people to death.

### Law creates a racial system
As **chattel slavery** (people owned as property, for life) became the main labor system in the South, colonies passed laws such as:
- Virginia, 1662: a child's status **follows the mother**, so the children of enslaved women were enslaved for life.
- Bans on interracial marriage and relationships.
- Slave codes that defined enslaved people as property and limited their movement and gatherings.

Together these laws made slavery **hereditary and based on race**.

### Resistance
- **Overt**: revolts such as the **Stono Rebellion** (South Carolina, 1739), and running away.
- **Covert**: working slowly, breaking tools, keeping African names, music, religious practices and family ties, and building communities. The **task system** in the rice country gave some enslaved people control over part of their time.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Chattel slavery', back: 'People treated as property owned for life, with the status passed to their children.' },
            { front: 'Virginia law of 1662', back: 'A child\'s status followed the mother, making slavery hereditary.' },
            { front: 'Bacon\'s Rebellion (1676)', back: 'Frontier uprising in Virginia that joined poor whites and Black servants against the elite; pushed planters toward enslaved labor.' },
            { front: 'Stono Rebellion (1739)', back: 'Uprising of enslaved people in South Carolina; led to harsher slave codes.' },
            { front: 'Covert resistance', back: 'Slowdowns, broken tools, and preserving family, culture and religion despite slavery.' },
          ],
        },
      ],
      precheck: {
        question: 'Where were the great majority of enslaved Africans brought to British America sent?',
        choices: [
          'The British West Indies',
          'New England',
          'The middle colonies',
          'Canada',
        ],
        answer: 0,
        explanations: [
          'Correct. The sugar islands of the West Indies absorbed most of the enslaved people Britain imported.',
          'Incorrect. New England farms used relatively few enslaved laborers.',
          'Incorrect. The middle colonies had enslaved people, but far fewer than the West Indies.',
          'Incorrect. Canada was French in this period, and Britain sent few enslaved people there.',
        ],
      },
      checkpoints: [
        {
          question: 'Which development best explains the shift from indentured servants to enslaved Africans in the Chesapeake in the late 1600s?',
          choices: [
            'Fewer servants were arriving, and Bacon\'s Rebellion showed planters the danger of a large class of poor, armed former servants',
            'Tobacco became less profitable, so planters needed fewer workers',
            'Britain banned the Atlantic slave trade',
            'Native peoples supplied most plantation labor in the Chesapeake',
          ],
          answer: 0,
          explanations: [
            'Correct. A shrinking servant supply and fear of unrest after 1676 pushed planters toward enslaved labor.',
            'Incorrect. Tobacco remained profitable and demand for labor grew.',
            'Incorrect. Britain did not ban the slave trade until 1807.',
            'Incorrect. Chesapeake planters relied on servants and then enslaved Africans.',
          ],
        },
        {
          question: 'Colonial laws defining the children of enslaved mothers as enslaved for life had which effect?',
          choices: [
            'They made slavery a hereditary, race-based status',
            'They gradually ended slavery in the southern colonies',
            'They gave enslaved people the right to own land',
            'They applied only to indentured servants from England',
          ],
          answer: 0,
          explanations: [
            'Correct. Status passed through the mother, locking families into slavery by race across generations.',
            'Incorrect. These laws entrenched slavery rather than ending it.',
            'Incorrect. The laws treated enslaved people as property.',
            'Incorrect. They targeted people of African descent, not English servants.',
          ],
        },
      ],
      revisit:
        'Slavery grew with land, demand for crops, fewer servants and fear after Bacon\'s Rebellion. Most enslaved Africans went to ' +
        'the West Indies. Laws (1662 Virginia) made slavery hereditary and racial. Resistance: Stono (1739), running away, culture.',
    },
    {
      id: '2.7',
      ced: 'KC-2.2.I.A–B, D; KC-2.1.III.D',
      title: 'Colonial Society and Culture',
      minutes: 7,
      summary:
        'Religious and ethnic diversity, the first Great Awakening and Enlightenment ideas made colonial culture more pluralistic. ' +
        'At the same time the colonies grew more English through trade, print and evangelical religion. Diverging interests ' +
        'between Britain and colonists bred mistrust that colonists later drew on to resist imperial control.',
      body: String.raw`### Two forces at once
| Toward pluralism and independence of mind | Toward Anglicization (becoming more English) |
|---|---|
| Many European religious and ethnic groups | English political models: assemblies, common law |
| **Great Awakening** (1730s–1740s): preachers such as **Jonathan Edwards** and **George Whitefield** stressed personal faith and challenged established ministers | Trade ties to Britain and between colonies |
| **Enlightenment** ideas: reason, natural rights, government by consent (John Locke) | A **transatlantic print culture**: newspapers, almanacs, pamphlets |
| | Shared Protestant evangelicalism across colonies |

### The Great Awakening
Revivals swept the colonies, drawing huge crowds to traveling preachers. Their effects:
- People questioned established church authority, which encouraged questioning other authority too.
- New churches split from old ones, adding to religious diversity.
- It was one of the first experiences shared across all the colonies.

### The Enlightenment
Enlightenment thinkers argued that reason could explain the world and that people have **natural rights**. Benjamin Franklin is the model colonial Enlightenment figure: printer, scientist and civic organizer.

### Growing mistrust
Colonists' interests didn't always match London's. They complained about territorial settlements, **frontier defense**, **self-rule** and **trade** rules. When resistance came, it drew on:
- local experience of self-government,
- evolving ideas of liberty and Enlightenment political thought,
- greater religious independence and diversity,
- a belief that the imperial system was corrupt.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Great Awakening (1730s–1740s)', back: 'Protestant revival stressing personal faith; weakened established church authority and spread across colonies.' },
            { front: 'Jonathan Edwards', back: 'New England minister of the Great Awakening ("Sinners in the Hands of an Angry God").' },
            { front: 'George Whitefield', back: 'English evangelist whose tours drew huge crowds across the colonies.' },
            { front: 'Enlightenment', back: 'Ideas of reason, natural rights and government by consent (John Locke).' },
            { front: 'Anglicization', back: 'Colonies becoming more English through trade, print culture, political models and Protestant evangelicalism.' },
          ],
        },
      ],
      precheck: {
        question: 'Which was an effect of the first Great Awakening?',
        choices: [
          'It weakened the authority of established churches and encouraged colonists to question authority',
          'It made the Church of England the only legal church in every colony',
          'It ended religious diversity in the middle colonies',
          'It led directly to the Pueblo Revolt',
        ],
        answer: 0,
        explanations: [
          'Correct. Revivalists challenged established ministers and churches split, fostering independence of mind.',
          'Incorrect. The Awakening increased religious diversity rather than imposing one church.',
          'Incorrect. It added new denominations and congregations.',
          'Incorrect. The Pueblo Revolt (1680) came decades earlier and in Spanish New Mexico.',
        ],
      },
      checkpoints: [
        {
          question: 'Which development most directly contributed to the Anglicization of the British colonies?',
          choices: [
            'A transatlantic print culture of British newspapers, books and pamphlets',
            'The Pueblo Revolt',
            'French fur-trade alliances with Native nations',
            'Spanish missions in Florida',
          ],
          answer: 0,
          explanations: [
            'Correct. Print culture spread British ideas and tastes across the colonies.',
            'Incorrect. That happened in Spanish New Mexico and concerned Native resistance.',
            'Incorrect. French alliances were part of a rival empire.',
            'Incorrect. Spanish missions were outside the British colonies.',
          ],
        },
        {
          question: 'Colonists\' later resistance to imperial control drew on all of the following EXCEPT',
          choices: [
            'loyalty to the Dominion of New England as a model of good government',
            'experience with local self-government',
            'Enlightenment political ideas',
            'a belief that the imperial system was corrupt',
          ],
          answer: 0,
          explanations: [
            'Correct. Colonists resented the Dominion of New England and overthrew its governor in 1689.',
            'Incorrect. Self-government was a core source of resistance.',
            'Incorrect. Enlightenment ideas of rights and consent fed resistance.',
            'Incorrect. Suspicion of corruption in the imperial system was part of colonial thinking.',
          ],
        },
      ],
      revisit:
        'Pluralism: many groups, Great Awakening (Edwards, Whitefield), Enlightenment (Locke). Anglicization: trade, print, ' +
        'English models, evangelicalism. Diverging interests → mistrust; resistance drew on self-rule, liberty, religion, anti-corruption.',
    },
    {
      id: '2.8',
      ced: 'KC-2.1, KC-2.2',
      title: 'Comparison in Period 2',
      minutes: 5,
      summary:
        'Comparison means explaining similarities and differences and why they exist. Period 2 invites comparisons between ' +
        'empires, between British regions, and between the colonies\' ties to Britain and their resistance to it. A good ' +
        'comparison argument names a category of analysis and backs it with specific evidence.',
      body: String.raw`### What a strong comparison does
1. Pick a **category of analysis**: relations with American Indians, geography and environment, economic goals, labor, religion.
2. Make a claim that states both a similarity or difference **and a reason**.
3. Support it with **specific evidence** (skill 6.B), not general statements.

### Example
**Weak:** "The French and English colonies were different."

**Strong:** "Unlike English colonists, who took Native land for farms and lived apart from Native peoples, French colonists depended on Native trading partners because New France's economy ran on furs, as shown by intermarriage and the alliances New France built with Native nations."

### Useful comparisons for Period 2
| Compare | Key difference | Why |
|---|---|---|
| Spain vs. England | Incorporation vs. separation of Native peoples | Extraction and conversion vs. family farming |
| Chesapeake vs. New England | Scattered plantations vs. compact towns | Tobacco and labor demand vs. environment and Puritan community |
| Middle colonies vs. New England | Diversity vs. relative uniformity | Quaker tolerance and wide European migration vs. Puritan settlement |
| Mainland South vs. West Indies | Large enslaved minority vs. enslaved majority | Sugar's huge labor demands |

Try the sort below: decide whether each statement describes a similarity or a difference between Spanish and English colonization.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Spain vs. England: similarity or difference?',
            buckets: ['Similarity', 'Difference'],
            items: [
              { label: 'Both used American Indian land for colonial settlement', bucket: 0, why: 'Both empires took Native land, even if they used it differently.' },
              { label: 'Both relied on enslaved Africans for plantation labor in some colonies', bucket: 0, why: 'Slavery was part of both Spanish and English colonial economies.' },
              { label: 'Both colonies fought wars with Native peoples who resisted them', bucket: 0, why: 'The Pueblo Revolt and Metacom\'s War show resistance in both empires.' },
              { label: 'One brought many families; the other mainly sent men', bucket: 1, why: 'English migration included many women and families; Spanish settlers were mostly men.' },
              { label: 'One incorporated Native people into colonial society; the other mostly lived apart from them', bucket: 1, why: 'Spain built a mixed hierarchy; English settlers generally kept separate.' },
              { label: 'One made religious conversion a central goal; for the other it was a minor one', bucket: 1, why: 'Spanish missions were central; English efforts such as John Eliot\'s "praying towns" were small by comparison.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is the best example of a historical comparison claim?',
        choices: [
          'Unlike New England, the Chesapeake developed scattered plantations because tobacco required large amounts of land and labor.',
          'The Chesapeake grew tobacco.',
          'New England was founded by Puritans in the 1600s.',
          'Both regions were important parts of colonial America.',
        ],
        answer: 0,
        explanations: [
          'Correct. It states a difference and explains why.',
          'Incorrect. That is a single fact, not a comparison.',
          'Incorrect. That describes one region only.',
          'Incorrect. It is too vague to compare anything specific.',
        ],
      },
      checkpoints: [
        {
          question: 'A student argues that French and Dutch colonies had better relations with American Indians than English colonies did. Which evidence best supports this?',
          choices: [
            'French and Dutch traders depended on Native fur suppliers and formed alliances and marriages with them, while English settlers fought wars over farmland',
            'The English founded Jamestown in 1607',
            'The Dutch colony of New Netherland was later taken by England',
            'All three empires traded with Europe',
          ],
          answer: 0,
          explanations: [
            'Correct. It gives specific evidence on both sides and explains the difference.',
            'Incorrect. A founding date says nothing about relations with Native peoples.',
            'Incorrect. That is about rivalry between European empires.',
            'Incorrect. It describes a similarity unrelated to the claim.',
          ],
        },
        {
          question: 'Which category of analysis best fits a comparison of the middle colonies and New England?',
          choices: [
            'Religious and ethnic diversity',
            'Silver mining',
            'The fur trade with the Haudenosaunee alone',
            'Sugar production',
          ],
          answer: 0,
          explanations: [
            'Correct. The middle colonies were diverse and tolerant; New England was more uniform.',
            'Incorrect. Neither region mined silver.',
            'Incorrect. That is too narrow and doesn\'t capture either region\'s main features.',
            'Incorrect. Sugar was a West Indies crop.',
          ],
        },
      ],
      revisit:
        'Comparison: pick a category, state a similarity or difference with a reason, and support it with specific evidence. ' +
        'Key contrasts: Spain vs. England, Chesapeake vs. New England, middle colonies vs. New England, mainland South vs. West Indies.',
    },
  ],
};

export default pack;
