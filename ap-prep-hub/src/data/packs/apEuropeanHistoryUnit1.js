/**
 * AP European History Unit 1: Renaissance and Exploration — study pack.
 *
 * Written against the AP European History CED effective Fall 2026 (topics
 * 1.1–1.11, c. 1450–1648). Eleven short topics: the Italian and Northern
 * Renaissance, printing, the new monarchies, the technology and motives of
 * exploration, colonial rivalries, the Columbian Exchange, the slave trade,
 * and the Commercial Revolution. Topic 1.11 practices causation with a
 * timeline activity.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-european-history/unit-1',
  subject: 'AP European History',
  unit: 'Unit 1: Renaissance and Exploration',
  examWeight: '10–15% of the exam',
  intro:
    'From about 1450 to 1648, Europeans rediscovered ancient Greece and Rome, printed books by the thousands, built stronger ' +
    'monarchies, sailed around the world and began a commercial economy. This unit covers how those changes reshaped ideas, art, ' +
    'politics and everyday life, while most people still lived by the seasons on farms.',
  sections: [
    {
      id: '1.1',
      ced: 'KC-1.1, KC-1.3, KC-1.4, KC-1.5',
      title: 'Contextualizing Renaissance and Discovery',
      minutes: 3,
      summary:
        'Around 1450, Europe was recovering from the Black Death and the Hundred Years\' War. Wealthy Italian city-states, a revival ' +
        'of classical texts, the printing press, stronger monarchies and the search for Asian trade set the stage for the Renaissance ' +
        'and the Age of Discovery, while most people still farmed under medieval structures.',
      body: String.raw`### What came before
- **The Black Death** (1347–1351) killed about a third of Europeans. Labor shortages weakened serfdom in the west and left survivors with more land and higher wages.
- **The Church** dominated learning, but the papacy had been weakened by the Avignon papacy and the Great Schism (1378–1417).
- **Italy** was a patchwork of rich, independent **city-states** (Florence, Venice, Milan, the Papal States) grown wealthy from Mediterranean trade and banking.
- The **Ottoman** conquest of Constantinople (1453) sent Greek scholars and manuscripts west and pushed Europeans to find new routes to Asian goods.

### Continuity to keep in mind
The unit is full of change, but **most Europeans still lived on farms**, oriented around the seasons, the village and the manor, and society stayed hierarchical. On the exam, a strong contextualization shows both: what was new, and what didn't change.`,
      blocks: [],
      precheck: {
        question: 'Which development most directly helped bring Greek scholars and manuscripts to Italy in the 1400s?',
        choices: [
          'The Ottoman conquest of Constantinople',
          'The Protestant Reformation',
          'The founding of the Dutch East India Company',
          'The Peace of Augsburg',
        ],
        answer: 0,
        explanations: [
          'Correct. Byzantine scholars fled west with Greek texts, feeding the Renaissance.',
          'Incorrect. The Reformation began in 1517, after this movement of scholars.',
          'Incorrect. The Dutch East India Company was founded in 1602.',
          'Incorrect. The Peace of Augsburg was in 1555.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes a continuity in European society from 1450 to 1648?',
          choices: [
            'Most people made their living from agriculture',
            'Most people lived in large industrial cities',
            'The Catholic Church remained the only Christian church in western Europe',
            'Serfdom grew stronger in western Europe',
          ],
          answer: 0,
          explanations: [
            'Correct. Agriculture stayed the livelihood of most Europeans throughout.',
            'Incorrect. Industrial cities came much later.',
            'Incorrect. The Reformation split western Christianity after 1517.',
            'Incorrect. Serfdom weakened in the west after the Black Death.',
          ],
        },
        {
          question: 'Why did the Renaissance begin in Italy?',
          choices: [
            'Wealthy city-states had patrons and access to classical ruins and texts',
            'Italy was united under one powerful king',
            'Italy had no contact with the Mediterranean world',
            'The printing press was invented in Rome',
          ],
          answer: 0,
          explanations: [
            'Correct. Trade and banking wealth, plus Roman heritage, made Italy fertile ground.',
            'Incorrect. Italy was politically fragmented into city-states.',
            'Incorrect. Italy was at the center of Mediterranean trade.',
            'Incorrect. Gutenberg\'s press was developed in Mainz, Germany.',
          ],
        },
      ],
      revisit:
        'Context: post-Black Death recovery, a weakened papacy, rich Italian city-states, Greek scholars fleeing Constantinople (1453), ' +
        'and the search for Asian trade. Continuity: most people still farmed in a hierarchical society.',
    },
    {
      id: '1.2',
      ced: 'KC-1.1.I.A–C, KC-1.1.III.A',
      title: 'Italian Renaissance',
      minutes: 6,
      summary:
        'Italian humanists like Petrarch revived classical literature and developed new methods for studying ancient texts. Some ' +
        'promoted secularism and individualism. Printed classical texts challenged the Church and universities. Admiration for Greek ' +
        'and Roman politics revived civic humanism. Popes and princes commissioned naturalistic art using geometric perspective.',
      body: String.raw`### Humanism
**Humanism** = studying classical Greek and Roman texts (grammar, rhetoric, history, poetry, moral philosophy) to live well and serve the community.

| Humanist | Contribution |
|---|---|
| **Petrarch** (1300s) | "Father of humanism"; collected and revived classical Latin texts |
| **Lorenzo Valla** | **Philology** (studying the history of language) proved the *Donation of Constantine*, a document supporting papal power, was a forgery |
| **Marsilio Ficino** | Translated Plato; led Florence's Platonic Academy |
| **Pico della Mirandola** | *Oration on the Dignity of Man* (1486): humans can shape their own nature, a statement of **individualism** |
| **Leonardo Bruni** | **Civic humanism**: citizens should serve their republic, as in ancient Rome |
| **Niccolò Machiavelli** | *The Prince* (1513): a **secular** guide to power; a ruler should be judged by results, not Christian morality |
| **Baldassare Castiglione** | *The Book of the Courtier*: the well-rounded "Renaissance man" |

### Why it mattered
- **Secularism** (focus on this world) and **individualism** (human achievement and fame) grew alongside, not instead of, Christian faith.
- Humanist education shifted schools from **theology** toward **classical texts** and new inquiry, challenging the authority of the **Church** and **universities**.

### Art
Rulers and popes paid for art to show off their **prestige**: the **Medici** in Florence; Pope Julius II hired Michelangelo for the Sistine Chapel ceiling.
- **Naturalism**: realistic human bodies and emotion (Donatello's *David*, Michelangelo).
- **Geometric (linear) perspective**: Brunelleschi worked it out; Alberti wrote it down; it made flat paintings look three-dimensional.
- **Classical styles**: Raphael's *School of Athens*; Palladio's and Brunelleschi's architecture based on Roman columns and domes.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Humanism', back: 'Study of classical Greek and Roman texts to live well and serve the community.' },
            { front: 'Lorenzo Valla', back: 'Used philology to prove the Donation of Constantine was a forgery.' },
            { front: 'Machiavelli\'s The Prince', back: 'Secular guide to political power: judge rulers by results, not Christian morality.' },
            { front: 'Civic humanism', back: 'Citizens should actively serve their city-state, modeled on the Roman republic.' },
            { front: 'Geometric perspective', back: 'Technique (Brunelleschi, Alberti) that made paintings look three-dimensional.' },
          ],
        },
      ],
      precheck: {
        question: 'Lorenzo Valla\'s exposure of the Donation of Constantine as a forgery is an example of:',
        choices: [
          'Humanist philology challenging Church authority',
          'Northern Renaissance artistic naturalism',
          'A new monarch controlling religion',
          'Mercantilist economic policy',
        ],
        answer: 0,
        explanations: [
          'Correct. Studying the document\'s language showed it couldn\'t date from Constantine\'s time.',
          'Incorrect. Valla was a scholar, not a painter.',
          'Incorrect. Valla wasn\'t a ruler.',
          'Incorrect. This was textual scholarship, not economics.',
        ],
      },
      checkpoints: [
        {
          question: 'Machiavelli\'s The Prince is best understood as an example of:',
          choices: [
            'A secular model for political behavior',
            'Christian humanism in the service of church reform',
            'A defense of papal authority over kings',
            'Northern Renaissance religious art',
          ],
          answer: 0,
          explanations: [
            'Correct. It analyzed power on its own terms rather than by religious rules.',
            'Incorrect. That describes Erasmus.',
            'Incorrect. Machiavelli wrote about how rulers gain and keep power, not about papal supremacy.',
            'Incorrect. It is a political treatise, not art.',
          ],
        },
        {
          question: 'Why did popes and princes commission Renaissance art?',
          choices: [
            'To enhance their prestige and promote their goals',
            'Because the Church banned religious images',
            'To spread Protestant ideas',
            'Because artists worked for free',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED stresses art used for personal, political and religious goals.',
            'Incorrect. The Church was a major sponsor of religious art.',
            'Incorrect. Italian patrons were Catholic, and this was before the Reformation.',
            'Incorrect. Patronage paid artists.',
          ],
        },
      ],
      revisit:
        'Humanists (Petrarch, Valla, Ficino, Pico, Bruni) revived classics; secularism and individualism grew; challenge to Church and ' +
        'universities; civic humanism; Machiavelli\'s secular politics. Art: patrons\' prestige, naturalism, geometric perspective.',
    },
    {
      id: '1.3',
      ced: 'KC-1.1.III.B, KC-1.2.I.A',
      title: 'Northern Renaissance',
      minutes: 4,
      summary:
        'North of the Alps, the Renaissance kept a stronger religious focus. Christian humanists like Erasmus used Renaissance learning ' +
        'to reform the Church. Northern artists painted ordinary people and everyday life in naturalistic detail.',
      body: String.raw`### Christian humanism
Northern scholars applied humanist methods to the **Bible and early Christian writers** to purify the Church.
- **Desiderius Erasmus**: *In Praise of Folly* (1511) mocked corrupt clergy and empty rituals; his Greek New Testament (1516) went back to the original text. He wanted reform **within** the Catholic Church.
- **Thomas More**: *Utopia* (1516) imagined an ideal society to criticize his own.

### Northern art
| Italian Renaissance | Northern Renaissance |
|---|---|
| Classical myths, idealized bodies | **Everyday life**, ordinary people, detailed realism |
| Patrons: popes, princes | Patrons: also wealthy merchants and townspeople |
| Grand frescoes | Oil paintings, detailed portraits, prints |

- **Pieter Bruegel the Elder**: peasant weddings, harvests, village life.
- **Rembrandt** (1600s): portraits showing individual character and emotion.
- Also Jan van Eyck (oil painting detail) and Albrecht Dürer (woodcuts and engravings, spread by printing).`,
      blocks: [],
      precheck: {
        question: 'How did the Northern Renaissance differ from the Italian Renaissance?',
        choices: [
          'It kept a stronger religious focus',
          'It ignored humanist learning',
          'It focused mostly on Greek mythology',
          'It was sponsored mainly by popes',
        ],
        answer: 0,
        explanations: [
          'Correct. Northern humanists applied learning to religious reform.',
          'Incorrect. Christian humanists used humanist methods.',
          'Incorrect. That fits Italian art better.',
          'Incorrect. Merchants and townspeople were important northern patrons.',
        ],
      },
      checkpoints: [
        {
          question: 'Erasmus is best described as a:',
          choices: [
            'Christian humanist who used Renaissance learning to reform the Church',
            'Protestant reformer who broke with Rome',
            'Italian painter of classical myths',
            'Political theorist of state sovereignty',
          ],
          answer: 0,
          explanations: [
            'Correct. He criticized abuses but stayed Catholic.',
            'Incorrect. Erasmus never left the Catholic Church.',
            'Incorrect. He was a Dutch scholar.',
            'Incorrect. That describes Jean Bodin.',
          ],
        },
        {
          question: 'A painting of peasants celebrating a village wedding is most typical of:',
          choices: [
            'Northern Renaissance art such as Bruegel\'s',
            'Papal commissions in Rome',
            'Medieval Byzantine icons',
            'Italian paintings of classical gods',
          ],
          answer: 0,
          explanations: [
            'Correct. Northern artists treated everyday people as worthy subjects.',
            'Incorrect. Popes commissioned religious and classical works.',
            'Incorrect. Icons were stylized religious images.',
            'Incorrect. That is a different subject altogether.',
          ],
        },
      ],
      revisit:
        'Northern Renaissance: more religious; Christian humanism (Erasmus, More) aimed to reform the Church; art showed everyday ' +
        'life and ordinary people (Bruegel, Rembrandt).',
    },
    {
      id: '1.4',
      ced: 'KC-1.1.II',
      title: 'Printing',
      minutes: 3,
      summary:
        'Gutenberg\'s printing press of the 1450s spread new ideas quickly and cheaply. It carried the Renaissance beyond Italy and ' +
        'encouraged literature in vernacular languages, which eventually helped build national cultures.',
      body: String.raw`### Gutenberg's press
Johannes **Gutenberg** of Mainz combined **movable metal type**, oil-based ink and a modified wine press in the **1450s**. His Bible appeared around 1455. By 1500, presses ran in over 200 European cities and millions of books were in print.

### Effects
| Effect | Why |
|---|---|
| **Ideas spread fast** | Books became cheaper and identical copies traveled widely |
| **Renaissance spreads north** | Humanist and classical texts reached scholars across Europe |
| **Vernacular literature grows** | Printers sold books in local languages (German, French, English), not just Latin |
| **National cultures** | Standardized vernacular languages helped people see themselves as one nation |
| **Literacy rises** | More books → more readers, especially in towns |
| **Authority challenged** | Later, printing spread Luther's ideas fast (Unit 2) |`,
      blocks: [],
      precheck: {
        question: 'The printing press most directly encouraged the growth of:',
        choices: [
          'Vernacular literature',
          'Manorialism',
          'Oral storytelling over written texts',
          'Latin as the only written language',
        ],
        answer: 0,
        explanations: [
          'Correct. Printers sold books in local languages to a wider public.',
          'Incorrect. Manorialism was an agricultural system, unrelated.',
          'Incorrect. Printing made written texts more common.',
          'Incorrect. It boosted vernaculars at Latin\'s expense.',
        ],
      },
      checkpoints: [
        {
          question: 'How did the printing press help spread the Renaissance beyond Italy?',
          choices: [
            'It made humanist and classical texts cheaper and widely available',
            'It required scholars to travel to Italy to read books',
            'It banned the circulation of classical texts',
            'It was used only to print royal decrees',
          ],
          answer: 0,
          explanations: [
            'Correct. Printed books carried new ideas across Europe.',
            'Incorrect. Printing made travel less necessary.',
            'Incorrect. Classical texts were among the most printed.',
            'Incorrect. Presses printed many kinds of books.',
          ],
        },
        {
          question: 'Printing in vernacular languages contributed in the long run to:',
          choices: [
            'The development of national cultures',
            'A single shared European language',
            'The revival of feudalism',
            'The decline of literacy',
          ],
          answer: 0,
          explanations: [
            'Correct. Standardized local languages helped form national identities.',
            'Incorrect. Vernaculars divided Europe by language.',
            'Incorrect. Printing had nothing to do with reviving feudalism.',
            'Incorrect. Literacy rose.',
          ],
        },
      ],
      revisit:
        'Gutenberg\'s press (1450s) spread ideas fast, carried the Renaissance north, grew vernacular literature, and helped build national cultures.',
    },
    {
      id: '1.5',
      ced: 'KC-1.2.II.A, KC-1.5.I.A, KC-1.5.I.C, KC-1.5.I.D',
      title: 'New Monarchies',
      minutes: 6,
      summary:
        'New monarchs built centralized states by monopolizing taxes, armies and justice, and by controlling religion. Rulers like ' +
        'Henry VIII and Elizabeth I reformed religion from the top down. Merchants, financiers and officials gained political power. ' +
        'Italy\'s fragmentation inspired new ideas of the secular state.',
      body: String.raw`### What made a monarchy "new"
New monarchs laid the foundation of the modern state by gaining monopolies on:

| Power | Example |
|---|---|
| **Taxes** | Royal taxes collected without asking nobles each time |
| **Military force** | Ferdinand and Isabella of Spain brought the military orders and nobles under royal control |
| **Justice** | England's **Star Chamber**, a royal court that could punish powerful nobles |
| **Religion** | The **Spanish Inquisition** (1478) enforced Catholic orthodoxy; France's **Concordat of Bologna** (1516) let the king appoint French bishops |

### Religion from the top down
- **Henry VIII** broke with Rome and made himself head of the Church of England (1534), largely to control the church and its wealth.
- **Elizabeth I** imposed a moderate Protestant settlement with the **Book of Common Prayer**.
- Later settlements let rulers decide their subjects' religion: the **Peace of Augsburg** (1555) and the **Edict of Nantes** (1598) (details in Unit 2).

### New groups gain power
- **Merchants and financiers** (the Medici in Florence, the Fuggers in Germany) lent money to kings and popes.
- **Nobles of the robe** in France: commoners who bought government offices and became nobles through service.

### Secular political theory
Italy stayed fragmented and fought over by France and Spain, a background for new ideas about the **secular state**:
- **Machiavelli**: power as its own end.
- **Jean Bodin**: **sovereignty**, the state's supreme and undivided power.
- **Hugo Grotius**: international law between sovereign states.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'New monarchies', back: 'Monarchies (France, Spain, England) that centralized power by monopolizing taxes, military, justice and religion.' },
            { front: 'Star Chamber', back: 'English royal court used to punish nobles who threatened the crown.' },
            { front: 'Concordat of Bologna (1516)', back: 'Agreement letting the French king appoint bishops, increasing royal control of the church.' },
            { front: 'Nobles of the robe', back: 'French commoners who gained noble status by buying and holding government offices.' },
            { front: 'Jean Bodin', back: 'Political theorist of sovereignty: the state\'s supreme, undivided power.' },
          ],
        },
      ],
      precheck: {
        question: 'Which was a key way new monarchs centralized power?',
        choices: [
          'Monopolizing tax collection and military force',
          'Giving nobles independent armies',
          'Letting the pope appoint all royal officials',
          'Abolishing royal courts',
        ],
        answer: 0,
        explanations: [
          'Correct. Control of taxes and armies was the base of the centralized state.',
          'Incorrect. New monarchs reduced nobles\' independent power.',
          'Incorrect. They took control of church appointments from the pope.',
          'Incorrect. They used royal courts such as the Star Chamber.',
        ],
      },
      checkpoints: [
        {
          question: 'The Concordat of Bologna (1516) is best used as evidence of:',
          choices: [
            'A monarch gaining greater control over the church in his kingdom',
            'The spread of Protestantism in France',
            'The decline of royal power in France',
            'Humanist criticism of the papacy',
          ],
          answer: 0,
          explanations: [
            'Correct. The French king won the right to appoint bishops.',
            'Incorrect. It was an agreement with the pope within Catholicism.',
            'Incorrect. It strengthened royal power.',
            'Incorrect. It was a diplomatic agreement, not humanist writing.',
          ],
        },
        {
          question: 'Henry VIII\'s break with Rome is best understood as an example of:',
          choices: [
            'Religious reform imposed from the top down by a monarch',
            'A popular uprising against royal authority',
            'Christian humanism as Erasmus defined it',
            'Mercantilist policy',
          ],
          answer: 0,
          explanations: [
            'Correct. The king himself took control of the church.',
            'Incorrect. It was the king acting, not a revolt against him.',
            'Incorrect. Erasmus sought reform within the Catholic Church.',
            'Incorrect. It was a religious and political act.',
          ],
        },
      ],
      revisit:
        'New monarchs monopolized taxes, military, justice and religion (Star Chamber, Spanish Inquisition, Concordat of Bologna). ' +
        'Henry VIII and Elizabeth I reformed religion from the top down. Merchants, financiers, nobles of the robe gained power. ' +
        'Secular theory: Machiavelli, Bodin, Grotius.',
    },
    {
      id: '1.6',
      ced: 'KC-1.3.II, KC-1.3.I.A–C',
      title: 'Technological Advances and the Age of Exploration',
      minutes: 5,
      summary:
        'Advances in navigation, cartography and military technology let Europeans build overseas empires. They were motivated by ' +
        'gold, spices and luxury goods, by mercantilist states promoting trade and colonies, and by Christianity, which some used to ' +
        'justify conquering indigenous peoples.',
      body: String.raw`### The technology
| Tool | What it did |
|---|---|
| **Compass** | Showed direction at sea, even out of sight of land |
| **Astrolabe** and **quadrant** | Measured the angle of the sun or stars to find **latitude** |
| **Sternpost rudder** | Better steering for large ships |
| **Lateen rig** (triangular sail) | Let ships sail **into the wind** |
| **Portolani** (portolan charts) | Detailed charts of coastlines and harbors |
| **Guns and gunpowder** | Cannons on ships and firearms gave Europeans a military edge |

Many of these came from other cultures (the compass from China, the astrolabe and lateen sail through the Islamic world); Europeans combined them on ships like the caravel.

### The motives
1. **Wealth**: direct access to **gold, spices and luxury goods**, cutting out Ottoman and Venetian middlemen: the **Spanish** in the Americas, the **Portuguese** in the Indian Ocean, the **Dutch** in the East Indies.
2. **Mercantilism**: the state's job is to build national wealth (gold and silver) through a favorable balance of trade, using colonies as sources of raw materials and markets. (Later, **Jean-Baptiste Colbert** made it France's official policy.)
3. **Religion**: spreading Christianity, led by orders like the **Jesuits**; for some, a justification for conquering indigenous civilizations.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Lateen sail', back: 'Triangular sail that let ships sail against the wind.' },
            { front: 'Astrolabe', back: 'Instrument measuring the angle of the sun or stars to find latitude.' },
            { front: 'Mercantilism', back: 'Policy: build state wealth (bullion) through a favorable trade balance and colonies.' },
            { front: 'Jesuits', back: 'Catholic religious order (founded 1540) that led missions in Asia and the Americas.' },
          ],
        },
      ],
      precheck: {
        question: 'Which technology let European ships sail against the wind?',
        choices: ['The lateen sail', 'The printing press', 'The astrolabe', 'Double-entry bookkeeping'],
        answer: 0,
        explanations: [
          'Correct. Triangular lateen sails could tack into the wind.',
          'Incorrect. The printing press had nothing to do with sailing.',
          'Incorrect. The astrolabe found latitude, not wind direction.',
          'Incorrect. That is an accounting method.',
        ],
      },
      checkpoints: [
        {
          question: 'Under mercantilism, colonies were valued mainly as:',
          choices: [
            'Sources of raw materials and markets that enriched the home country',
            'Independent states with their own trade policies',
            'Places to settle religious minorities only',
            'Burdens to be abandoned as soon as possible',
          ],
          answer: 0,
          explanations: [
            'Correct. Colonies served the mother country\'s balance of trade.',
            'Incorrect. Mercantilism kept colonies under the home country\'s control.',
            'Incorrect. Some colonies did this, but it wasn\'t the mercantilist purpose.',
            'Incorrect. Mercantilists saw colonies as essential.',
          ],
        },
        {
          question: 'Which best describes the role of Christianity in European exploration?',
          choices: [
            'It motivated missions and was used by some to justify subjugating indigenous peoples',
            'It discouraged all overseas travel',
            'It had no connection to exploration',
            'It required Europeans to adopt indigenous religions',
          ],
          answer: 0,
          explanations: [
            'Correct. Faith was both a motive and, for some, a justification for conquest.',
            'Incorrect. Religious authorities supported exploration.',
            'Incorrect. Spreading Christianity was a stated goal.',
            'Incorrect. Europeans tried to convert indigenous peoples, not the reverse.',
          ],
        },
      ],
      revisit:
        'Tech: compass, astrolabe/quadrant, sternpost rudder, lateen sail, portolani, guns. Motives: gold, spices and luxury goods; ' +
        'mercantilism; spreading Christianity (Jesuits), sometimes justifying conquest.',
    },
    {
      id: '1.7',
      ced: 'KC-1.3.III.B–D',
      title: 'Rivals on the World Stage',
      minutes: 4,
      summary:
        'Europeans built empires and trade networks through coercion and negotiation. Spain\'s colonies across the Americas, the ' +
        'Caribbean and the Pacific made it Europe\'s dominant state in the 1500s. France, England and the Netherlands followed in ' +
        'the 1600s, and competition for trade led to conflicts in the 1600s and 1700s.',
      body: String.raw`### Phase 1: Spain and Portugal
- **Treaty of Tordesillas** (1494): divided the non-European world between Spain and Portugal.
- **Spain** colonized the Americas, the Caribbean and the Pacific (Manila in the Philippines, 1571). American silver made Spain **Europe's dominant power** in the 1500s.

### Phase 2: the Atlantic challengers (1600s)
| Power | Colonies and trade |
|---|---|
| **Netherlands** | Dutch East India Company (1602) took over much of the Asian spice trade; New Amsterdam |
| **England** | Jamestown (1607), the Caribbean, the British East India Company (1600) |
| **France** | Quebec (1608), fur trade in North America, Caribbean sugar islands |

### Phase 3: competition becomes war
Trade rivalry led to conflicts into the 1700s:
- **War of the Spanish Succession** (1701–1714): ended with Britain winning the **asiento**, the right to supply enslaved Africans to Spanish colonies.
- **Seven Years' War** (1756–1763): a global war that left Britain the leading colonial power.

Empires were built by **coercion** (conquest, forced labor) and **negotiation** (treaties and alliances with local rulers, trading posts on others' terms in Asia).`,
      blocks: [],
      precheck: {
        question: 'Which country dominated Europe in the 16th century thanks largely to its American colonies?',
        choices: ['Spain', 'The Netherlands', 'England', 'Prussia'],
        answer: 0,
        explanations: [
          'Correct. American silver made Spain dominant in the 1500s.',
          'Incorrect. The Dutch rose in the 1600s.',
          'Incorrect. England\'s colonial empire grew mainly after 1600.',
          'Incorrect. Prussia had no major colonies.',
        ],
      },
      checkpoints: [
        {
          question: 'In the 17th century, France, England and the Netherlands established colonies mainly to:',
          choices: [
            'Compete with Portuguese and Spanish dominance in trade',
            'Help Spain defend its empire',
            'Escape the Columbian Exchange',
            'End the Atlantic slave trade',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED frames them as challengers to Iberian dominance.',
            'Incorrect. They were rivals of Spain.',
            'Incorrect. They took part in the exchange.',
            'Incorrect. They expanded the slave trade.',
          ],
        },
        {
          question: 'The asiento is best described as:',
          choices: [
            'A license to supply enslaved Africans to Spanish colonies',
            'A Dutch banking institution',
            'A Portuguese navigation instrument',
            'A treaty dividing the world between Spain and Portugal',
          ],
          answer: 0,
          explanations: [
            'Correct. Britain won it in 1713, a prize of colonial rivalry.',
            'Incorrect. That would be the Bank of Amsterdam.',
            'Incorrect. Navigation tools include the astrolabe and compass.',
            'Incorrect. That is the Treaty of Tordesillas.',
          ],
        },
      ],
      revisit:
        'Coercion and negotiation built empires. Spain dominant in the 1500s; France, England, the Netherlands challenge in the 1600s; ' +
        'rivalry → wars (Spanish Succession, Seven Years\' War) and prizes like the asiento.',
    },
    {
      id: '1.8',
      ced: 'KC-1.3.III.A, KC-1.3.IV.A–B',
      title: 'Colonial Expansion and Columbian Exchange',
      minutes: 5,
      summary:
        'Portugal built a commercial network along Africa, in Asia and in Brazil. Overseas trade shifted Europe\'s economic center ' +
        'from the Mediterranean to the Atlantic. The Columbian Exchange of plants, animals and diseases created opportunities for ' +
        'Europeans and helped them subjugate and destroy indigenous peoples, especially in the Americas.',
      body: String.raw`### Portugal's trading-post empire
Rather than conquer large territories in Asia, Portugal built **fortified trading posts** along the African coast and in South and East Asia (Goa, Malacca, Macau), plus the colony of **Brazil** in South America.

### From the Mediterranean to the Atlantic
Ocean trade moved Europe's economic center from Venice and Genoa to **Atlantic ports**: **Lisbon, Seville, Antwerp, Amsterdam, London, Bristol**. These states were drawn into an expanding **world economy**.

### The Columbian Exchange
| Europe → Americas | Americas → Europe |
|---|---|
| Wheat, cattle, horses, pigs, sheep | Tomatoes, potatoes, squash, corn (maize), tobacco, turkeys |
| Smallpox, measles | |

### Effects
- **Economic opportunity for Europeans**: new crops (potatoes and maize fed growing populations), new cash crops (tobacco, sugar), land for ranching.
- **Destruction of indigenous peoples**: epidemics killed most of the Native population in many regions, which made conquest easier and left survivors less able to resist.
- **A shift toward European dominance** in global trade, and the **expansion of the slave trade** (Topic 1.9).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Portuguese commercial network', back: 'Fortified trading posts along Africa and in Asia (Goa, Malacca, Macau), plus Brazil.' },
            { front: 'Shift of Europe\'s economic center', back: 'From the Mediterranean (Venice, Genoa) to Atlantic ports (Antwerp, Amsterdam, London).' },
            { front: 'Columbian Exchange: Americas → Europe', back: 'Tomatoes, potatoes, squash, corn, tobacco, turkeys.' },
            { front: 'Columbian Exchange: Europe → Americas', back: 'Wheat, cattle, horses, pigs, sheep, smallpox, measles.' },
          ],
        },
      ],
      precheck: {
        question: 'Overseas trade after 1500 shifted Europe\'s economic center toward:',
        choices: ['Atlantic port cities', 'The eastern Mediterranean', 'Inland German towns', 'The Baltic Sea only'],
        answer: 0,
        explanations: [
          'Correct. Antwerp, Amsterdam and London rose as Atlantic trade grew.',
          'Incorrect. The Mediterranean declined in relative importance.',
          'Incorrect. Ports facing the Atlantic gained most.',
          'Incorrect. Baltic trade mattered, but the major shift was to the Atlantic.',
        ],
      },
      checkpoints: [
        {
          question: 'How did the Columbian Exchange help Europeans subjugate indigenous peoples in the Americas?',
          choices: [
            'Epidemic diseases devastated Native populations',
            'Native peoples adopted European crops and stopped farming',
            'Europeans brought immunity to Native diseases',
            'Horses replaced European soldiers',
          ],
          answer: 0,
          explanations: [
            'Correct. Smallpox and measles killed huge numbers, weakening resistance.',
            'Incorrect. Native farming continued; this didn\'t cause subjugation.',
            'Incorrect. The point is that Native peoples lacked immunity to European diseases.',
            'Incorrect. Horses helped but didn\'t replace soldiers.',
          ],
        },
        {
          question: 'Which pair shows items moving from the Americas to Europe?',
          choices: ['Potatoes and tobacco', 'Wheat and cattle', 'Horses and pigs', 'Smallpox and measles'],
          answer: 0,
          explanations: [
            'Correct. Both originated in the Americas.',
            'Incorrect. These went from Europe to the Americas.',
            'Incorrect. These went from Europe to the Americas.',
            'Incorrect. These diseases went from Europe to the Americas.',
          ],
        },
      ],
      revisit:
        'Portugal: trading posts in Africa and Asia, plus Brazil. Center of power shifted to Atlantic ports. Columbian Exchange created ' +
        'opportunities for Europeans and, through disease, helped destroy indigenous societies.',
    },
    {
      id: '1.9',
      ced: 'KC-1.3.IV.C',
      title: 'The Slave Trade',
      minutes: 4,
      summary:
        'Europeans expanded the trade in enslaved Africans because plantation economies in the Americas demanded labor and ' +
        'indigenous populations had collapsed. Captives endured the Middle Passage, and planter societies built on slavery took shape.',
      body: String.raw`### Causes
1. **Plantation economy**: sugar (and later tobacco, cotton, coffee) grown for European markets required huge, cheap labor forces.
2. **Demographic catastrophe**: disease and forced labor had destroyed much of the indigenous population that colonists first exploited.
3. **Existing African slave trade**: European traders bought captives from African rulers and merchants on the coast.

### The system
- **Triangular trade**: European manufactured goods → Africa; enslaved Africans → the Americas (the **Middle Passage**); sugar, tobacco and other raw materials → Europe.
- **Middle Passage**: the brutal Atlantic crossing, packed below deck; a large share of captives died on the way.
- **Planter society**: a small, wealthy planter elite ruling over an enslaved majority in places like Brazil and the Caribbean. Over 12 million Africans were shipped across the Atlantic between the 1500s and the 1800s.

### Who led it
Portugal first (Brazil), then the Dutch, English and French as they built Caribbean plantation colonies.`,
      blocks: [],
      precheck: {
        question: 'Which two factors most directly caused Europeans to expand the trade in enslaved Africans?',
        choices: [
          'Plantation labor demand and the collapse of indigenous populations',
          'The printing press and the Northern Renaissance',
          'The Concordat of Bologna and the Star Chamber',
          'A surplus of free European laborers and falling sugar prices',
        ],
        answer: 0,
        explanations: [
          'Correct. These are the two causes the CED names.',
          'Incorrect. These are cultural developments, not causes of the slave trade.',
          'Incorrect. These involved royal power in Europe.',
          'Incorrect. Labor was scarce in the colonies, and sugar was profitable.',
        ],
      },
      checkpoints: [
        {
          question: 'The Middle Passage refers to:',
          choices: [
            'The forced voyage of enslaved Africans across the Atlantic',
            'A trade route through the Mediterranean',
            'A Portuguese route around Africa to India',
            'An overland route across Siberia',
          ],
          answer: 0,
          explanations: [
            'Correct. It was the deadly middle leg of the triangular trade.',
            'Incorrect. It was an Atlantic crossing.',
            'Incorrect. That was da Gama\'s route to Asia.',
            'Incorrect. It was a sea crossing.',
          ],
        },
        {
          question: 'A "planter society" in the Caribbean was characterized by:',
          choices: [
            'A small wealthy elite ruling over an enslaved majority',
            'Mostly free small farmers growing food',
            'Equal rights for all residents',
            'An economy based on manufacturing',
          ],
          answer: 0,
          explanations: [
            'Correct. Plantation colonies had tiny elites and large enslaved populations.',
            'Incorrect. That describes a different kind of colony.',
            'Incorrect. These societies were extremely unequal.',
            'Incorrect. Their economies were based on export crops.',
          ],
        },
      ],
      revisit:
        'Causes: plantation labor demand + collapse of indigenous populations. Triangular trade, Middle Passage, planter societies; ' +
        'Portugal first, then the Dutch, English and French.',
    },
    {
      id: '1.10',
      ced: 'KC-1.4.I–IV',
      title: 'The Commercial Revolution',
      minutes: 7,
      summary:
        'Banking and finance grew urban financial centers and a money economy. Most people still farmed, but the price revolution and ' +
        'commercial agriculture enriched large western landowners, while serfdom was codified in the east. Population recovered, food ' +
        'prices outpaced wages, peasants revolted, migrants strained cities, and the Little Ice Age encouraged later marriage.',
      body: String.raw`### Money and finance
| Innovation | Effect |
|---|---|
| **Double-entry bookkeeping** | Accurate accounts for large businesses |
| **Banking families** (Medici, Fuggers) | Lent to kings and popes; grew financial centers |
| **Bank of Amsterdam** (1609) | Stable currency exchange; made Amsterdam Europe's financial hub |
| **Joint-stock companies** (British East India Company, 1600; Dutch East India Company, 1602) | Investors pooled money and shared risk |

A **new economic elite** (Italian merchant princes, French nobles of the robe) related to the old landed nobility differently in different regions, sometimes marrying in, sometimes competing.

### Agriculture: still the base
- **Subsistence farming** was the rule: a **three-field rotation** in the north and a **two-field** rotation in the Mediterranean; many farmers paid rent and labor services.
- **Price revolution**: American silver plus population growth pushed prices up. This built capital and spread **commercial agriculture**, which benefited **large landowners** in the west.
- **Enclosure**: landlords fenced off **village common** land for sheep or market crops, pushing poor peasants off.
- **West vs. east**: the west moved toward a **free peasantry**, while in the east (Prussia, Poland, Russia) nobles **codified serfdom** to work huge grain estates for export.

### Social strain
- **Population** recovered to its pre-plague level in the 1500s. Food prices rose faster than **wages**, lowering living standards for many.
- Landlords who cut peasants' traditional rights faced **revolts** (e.g., the German Peasants' War, 1524–1525).
- **Migrants to cities** strained housing and sanitation and brought poverty and crime, challenging merchant elites and **guilds**.
- **Little Ice Age**: colder weather and bad harvests. Europeans responded by **marrying and having children later** (the European marriage pattern), which slowed population growth and eventually improved families' economic condition.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Price revolution', back: 'Long inflation (American silver + population growth) that built capital and helped large landowners.' },
            { front: 'Enclosure', back: 'Landlords fencing off common land for sheep or market farming, displacing poor peasants.' },
            { front: 'Serfdom in eastern Europe', back: 'Codified and strengthened as nobles ran large export grain estates, while the west moved to a free peasantry.' },
            { front: 'European marriage pattern', back: 'Late marriage and childbearing in response to hardship like the Little Ice Age; slowed population growth.' },
            { front: 'Bank of Amsterdam', back: 'Founded 1609; made Amsterdam Europe\'s financial center.' },
          ],
        },
      ],
      precheck: {
        question: 'During the 16th century, serfdom in eastern Europe:',
        choices: [
          'Was codified and strengthened as nobles ran large estates',
          'Was abolished, as in the west',
          'Spread to England through enclosure',
          'Ended because of the price revolution',
        ],
        answer: 0,
        explanations: [
          'Correct. Eastern nobles tied peasants to export grain estates.',
          'Incorrect. The west moved toward a free peasantry; the east went the other way.',
          'Incorrect. Enclosure displaced peasants but didn\'t create serfdom.',
          'Incorrect. Rising grain prices encouraged eastern lords to tighten serfdom.',
        ],
      },
      checkpoints: [
        {
          question: 'Which group benefited most from the price revolution and the commercialization of agriculture in western Europe?',
          choices: [
            'Large landowners',
            'Wage laborers',
            'Peasants who relied on the village common',
            'Eastern European serfs',
          ],
          answer: 0,
          explanations: [
            'Correct. Rising food prices raised the value of land and its output.',
            'Incorrect. Prices rose faster than wages.',
            'Incorrect. Enclosure took away common land.',
            'Incorrect. Serfdom tightened in the east.',
          ],
        },
        {
          question: 'The European marriage pattern of delayed marriage and childbearing was in part a response to:',
          choices: [
            'Economic and environmental challenges such as the Little Ice Age',
            'A government ban on early marriage',
            'Rapidly rising wages',
            'The end of the Columbian Exchange',
          ],
          answer: 0,
          explanations: [
            'Correct. Hard times led families to delay marriage, restraining population growth.',
            'Incorrect. It was a social pattern, not a law.',
            'Incorrect. Wages lagged behind prices.',
            'Incorrect. The exchange continued.',
          ],
        },
      ],
      revisit:
        'Banking, double-entry bookkeeping, Bank of Amsterdam, joint-stock companies → money economy and new elites. Farming still ' +
        'dominant; price revolution and enclosure helped big landowners; serfdom codified in the east; food prices beat wages; ' +
        'peasant revolts; crowded cities; Little Ice Age → later marriage.',
    },
    {
      id: '1.11',
      ced: 'KC-1.1, KC-1.3, KC-1.4, KC-1.5',
      title: 'Causation in the Renaissance and Age of Discovery',
      minutes: 4,
      summary:
        'Causation means explaining why things happened and what they led to, and ranking which causes mattered most. Key chains ' +
        'link classical revival and printing to new ideas, technology and motives to exploration, and exploration to the Columbian ' +
        'Exchange, the slave trade and the Commercial Revolution.',
      body: String.raw`### Causation, the skill
Make a **historically defensible claim**: an argument evidence can support. Then explain **how** each cause produced its effect, and which mattered **most**.

### Unit 1 cause-and-effect chains
| Cause | → | Effect |
|---|---|---|
| Revival of classical texts + Greek scholars arriving in Italy | → | Humanism, secularism, individualism |
| Printing press | → | Renaissance spreads north; vernacular literature; national cultures |
| Navigation and military technology + desire for wealth + religion | → | Overseas empires |
| Colonies and the Columbian Exchange | → | Atlantic states rise; indigenous societies destroyed |
| Plantations + indigenous population collapse | → | Expansion of the slave trade |
| American silver + population growth | → | Price revolution → commercial agriculture, new elites, eastern serfdom |

### Sample claim
"The printing press was the most important cause of the Renaissance spreading beyond Italy, because it made humanist texts cheap and widely available, letting scholars like Erasmus build on Italian ideas without traveling to Italy."

Put the unit's events in order first: a cause has to come before its effect.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Renaissance and exploration',
            events: [
              { year: 1455, label: 'Gutenberg Bible printed' },
              { year: 1478, label: 'Spanish Inquisition established' },
              { year: 1492, label: 'Columbus reaches the Americas' },
              { year: 1513, label: 'Machiavelli writes The Prince' },
              { year: 1555, label: 'Peace of Augsburg' },
              { year: 1602, label: 'Dutch East India Company founded' },
              { year: 1609, label: 'Bank of Amsterdam opens' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is the best example of a cause leading to its effect in this period?',
        choices: [
          'The printing press → the spread of Renaissance ideas beyond Italy',
          'The Bank of Amsterdam → the invention of the printing press',
          'The Seven Years\' War → the Treaty of Tordesillas',
          'The Peace of Augsburg → the Italian Renaissance',
        ],
        answer: 0,
        explanations: [
          'Correct. Printed books carried humanist ideas across Europe.',
          'Incorrect. The press (1450s) came long before the bank (1609).',
          'Incorrect. Tordesillas (1494) came long before the Seven Years\' War.',
          'Incorrect. The Italian Renaissance began before 1555.',
        ],
      },
      checkpoints: [
        {
          question: 'Which claim best explains why serfdom grew stronger in eastern Europe in the 16th century?',
          choices: [
            'Rising grain prices encouraged eastern nobles to tie peasants to large export estates',
            'The printing press spread ideas that favored serfdom',
            'The Black Death created a labor surplus in the east',
            'Eastern monarchs abolished noble privileges',
          ],
          answer: 0,
          explanations: [
            'Correct. It links an economic cause (western demand and prices) to the effect.',
            'Incorrect. Printing isn\'t the cause here.',
            'Incorrect. Plague caused labor shortages, not surpluses.',
            'Incorrect. Eastern nobles kept and expanded their power.',
          ],
        },
        {
          question: 'A historian argues that economic motives were more important than religious motives in European exploration. Which evidence best supports this?',
          choices: [
            'States sought direct access to spices and gold to bypass Ottoman and Venetian middlemen',
            'Jesuit missionaries traveled to Asia and the Americas',
            'Some Europeans used Christianity to justify conquest',
            'Erasmus criticized corrupt clergy',
          ],
          answer: 0,
          explanations: [
            'Correct. It shows a concrete economic motive driving voyages.',
            'Incorrect. That supports the religious side.',
            'Incorrect. That also points to religion.',
            'Incorrect. Erasmus is unrelated to exploration motives.',
          ],
        },
      ],
      revisit:
        'Causation: defensible claim, explain how, rank causes. Chains: classics → humanism; printing → spread of ideas; technology ' +
        '+ motives → empires; Columbian Exchange → Atlantic dominance; plantations → slave trade; silver → price revolution.',
    },
  ],
};

export default pack;
