/**
 * AP African American Studies Unit 1: Origins of the African Diaspora — study pack.
 *
 * Written against the AP African American Studies CED effective Fall 2024
 * (the current edition; topics 1.1–1.11 in ten sections). Content follows the
 * CED's essential knowledge closely; required sources are described, not
 * reproduced. Activities: a climate-zone trade sort and a timeline of the
 * societies in the unit.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-african-american-studies/unit-1',
  subject: 'AP African American Studies',
  unit: 'Unit 1: Origins of the African Diaspora',
  examWeight: '20–25% of the exam',
  intro:
    'Where the field came from and where African American history begins: Africa\'s landscapes and peoples, the Bantu expansion, ' +
    'ancient Nubia, Aksum and Nok, the Sudanic empires of Ghana, Mali and Songhai, learning traditions and faith, Great Zimbabwe and ' +
    'the Swahili Coast, the Kingdom of Kongo, women\'s leadership, and Africans in Europe before the transatlantic slave trade.',
  sections: [
    {
      id: '1.1',
      ced: 'LO 1.1.A–C',
      title: 'What Is African American Studies?',
      minutes: 5,
      summary:
        'African American Studies is an interdisciplinary, scholarly field analyzing the history, culture and contributions of people of ' +
        'African descent in the U.S. and the diaspora. It grew out of earlier Black artistic, intellectual and political work, and entered ' +
        'colleges through the Black Campus movement (1965–1972). It corrects misconceptions of early Africa as having no knowable history.',
      body: String.raw`### The field
- **Interdisciplinary** and rigorous: it draws on history, literature, the arts, sociology, political science and more to study the **history, culture and contributions of people of African descent** in the U.S. and throughout the **African diaspora**.
- It **predates** its place in universities: it grew from Black artistic, intellectual and political work, and it offers a lens on contemporary Black freedom struggles.
- It examines ideas about **Africa's history** and Africa's ongoing relationship with diaspora communities.

### How it entered colleges
- In the 1960s–70s, near the end of the Civil Rights movement and during the **Black Power** movement, Black students entered predominantly white institutions in large numbers for the first time.
- In the **Black Campus movement (1965–1972)**, hundreds of thousands of Black students, joined by Latino, Asian and white supporters, protested at **over 1,000 colleges**, demanding courses on Black history and support for Black students, faculty and administrators.
- In **1968**, after a student strike, **San Francisco State College** created the **first Black Studies department** at a four-year college.

### Why start with early Africa?
Africa is the **birthplace of humanity** and the ancestral home of African Americans. The field documents early Africa as a **diverse continent with complex, globally connected societies** long before the transatlantic slave trade, countering the myth of an "unknowable" African past.`,
      blocks: [],
      precheck: {
        question: 'Which development most directly led to Black Studies departments in U.S. colleges?',
        choices: [
          'Student protests during the Black Campus movement (1965–1972)',
          'A federal law requiring the courses in 1950',
          'The end of the transatlantic slave trade',
          'European colonial governments in Africa',
        ],
        answer: 0,
        explanations: [
          'Correct. Students at over 1,000 campuses demanded the field.',
          'Incorrect. No such law existed.',
          'Incorrect. That was in the 1800s, long before.',
          'Incorrect. The field arose from U.S. student activism.',
        ],
      },
      checkpoints: [
        {
          question: 'Which statement best describes African American Studies as a field?',
          choices: [
            'An interdisciplinary field that predates its formal place in universities',
            'A single-discipline history course created by Congress',
            'A field that studies only events after 1865',
            'A field limited to the United States, excluding Africa',
          ],
          answer: 0,
          explanations: [
            'Correct. It combines disciplines and grew from earlier Black intellectual and artistic work.',
            'Incorrect. It is interdisciplinary and arose from activism.',
            'Incorrect. It begins with early Africa.',
            'Incorrect. It studies the whole African diaspora and Africa itself.',
          ],
        },
        {
          question: 'Where was the first Black Studies department at a four-year college established, in 1968?',
          choices: ['San Francisco State College', 'Hunter College', 'Howard University', 'Harvard University'],
          answer: 0,
          explanations: [
            'Correct. It followed the Black Student Union strike.',
            'Incorrect. Hunter\'s Black and Puerto Rican Studies program appears in a 1972 source.',
            'Incorrect. That is not the CED\'s answer.',
            'Incorrect. That is not the CED\'s answer.',
          ],
        },
      ],
      revisit:
        'Interdisciplinary study of people of African descent; predates universities; Black Campus movement (1965–1972); first department ' +
        'at San Francisco State (1968). Early Africa: complex, connected societies, not an "unknowable" past.',
    },
    {
      id: '1.2',
      ced: 'LO 1.2.A–B',
      title: 'The African Continent: A Varied Landscape',
      minutes: 6,
      summary:
        'Africa, the second-largest continent, has five climate zones (desert, semiarid Sahel, savannah, tropical rainforest, Mediterranean), ' +
        'four bordering seas and oceans, and five major rivers. Coasts fostered early global ties. The Sahel and savannah became population ' +
        'centers thanks to water routes, fertile land and their position between the Sahara and the tropics. Each climate zone traded different goods.',
      body: String.raw`### Geography
- **Second-largest continent**, with **five climate zones**: **desert** (Sahara), **semiarid** (Sahel), **savannah grasslands**, **tropical rainforests** and the **Mediterranean** zone.
- Bordered by the **Red Sea, Mediterranean Sea, Atlantic Ocean and Indian Ocean**.
- Five major rivers: **Niger, Congo, Zambezi, Orange and Nile**.

### Why people settled where they did
The Red Sea, Mediterranean and Indian Ocean connected early African societies to the wider world. Population centers grew in the **Sahel and savannah** because:
1. **Water routes** moved people and goods.
2. **Fertile land** supported farming and domesticated animals.
3. They sat **between** the Sahara (north) and the tropical regions (south), linking trade between them.

### Climate shapes trade
| Zone | Way of life and trade |
|---|---|
| **Desert and semiarid** | Often **nomadic herders** seeking food and water; some traded **salt** |
| **Sahel** | Traded **livestock** |
| **Savannah grasslands** | Grew **grain** crops |
| **Tropical rainforests** | Grew **kola** and **yams**; traded **gold** |`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Match each activity to the climate zone the CED links it to.',
            buckets: ['Desert / semiarid', 'Sahel', 'Savannah', 'Tropical rainforest'],
            items: [
              { label: 'Nomadic herders moving in search of food and water', bucket: 0, why: 'Scarce resources kept herders moving.' },
              { label: 'Trading salt', bucket: 0, why: 'Some desert peoples traded salt.' },
              { label: 'Trading livestock', bucket: 1, why: 'The CED ties livestock trade to the Sahel.' },
              { label: 'Cultivating grain crops', bucket: 2, why: 'Savannah grasslands supported grain.' },
              { label: 'Growing kola trees and yams', bucket: 3, why: 'Rainforest crops.' },
              { label: 'Trading gold', bucket: 3, why: 'Gold came from the tropical south.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Why did population centers emerge in the Sahel and savannah grasslands?',
        choices: [
          'Water routes, fertile land, and their position linking the Sahara with tropical regions',
          'They had the most rainfall on the continent',
          'They were isolated from trade',
          'They were the only regions with rivers',
        ],
        answer: 0,
        explanations: [
          'Correct. Those are the CED\'s three reasons.',
          'Incorrect. Rainforests get more rain.',
          'Incorrect. Their importance came from connecting trade.',
          'Incorrect. Rivers run through many regions.',
        ],
      },
      checkpoints: [
        {
          question: 'Which of these is NOT one of Africa\'s five major rivers named in the CED?',
          choices: ['The Amazon', 'The Niger', 'The Congo', 'The Zambezi'],
          answer: 0,
          explanations: [
            'Correct. The Amazon is in South America.',
            'Incorrect. The Niger is listed.',
            'Incorrect. The Congo is listed.',
            'Incorrect. The Zambezi is listed.',
          ],
        },
        {
          question: 'In tropical rainforest regions, people most likely:',
          choices: ['Grew kola and yams and traded gold', 'Herded camels across dunes', 'Traded livestock as their main good', 'Mined salt in the desert'],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s description of rainforest trade.',
            'Incorrect. That describes desert life.',
            'Incorrect. Livestock trade is linked to the Sahel.',
            'Incorrect. Salt is linked to desert regions.',
          ],
        },
      ],
      revisit:
        'Five climate zones; Red Sea, Mediterranean, Atlantic, Indian Ocean; Niger, Congo, Zambezi, Orange, Nile. Sahel and savannah: ' +
        'water routes, fertile land, link between Sahara and tropics. Desert: herding, salt; Sahel: livestock; savannah: grain; rainforest: kola, yams, gold.',
    },
    {
      id: '1.3',
      ced: 'LO 1.3.A–B',
      title: 'Population Growth and Ethnolinguistic Diversity',
      minutes: 5,
      summary:
        'Tools and new crops (bananas, yams, grains) drove population growth in West and Central Africa, triggering migrations of Bantu-' +
        'speaking peoples across the continent from 1500 BCE to 500 CE. Hundreds of Bantu languages are spoken today, and much of African ' +
        'Americans\' genetic ancestry comes from West and Central African communities speaking Bantu-family languages.',
      body: String.raw`### Causes of the Bantu expansion
**Technological** innovations (new tools) and **agricultural** innovations (cultivating **bananas, yams and grains**) let West and Central African populations grow. Growth set off a long series of migrations by **Bantu-speaking peoples** across the continent, from about **1500 BCE to 500 CE**: the **Bantu expansion**.

### Effects
- **Linguistic**: the Bantu family now contains **hundreds of languages** across West, Central and Southern Africa, including **Xhosa, Swahili, Kikongo and Zulu**.
- **Diversity**: Africa is home to **thousands** of ethnic groups and languages.
- **Ancestry**: a **large portion of African Americans' genetic ancestry** comes from West and Central African communities whose languages belong to the Bantu family.`,
      blocks: [],
      precheck: {
        question: 'What triggered the Bantu expansion?',
        choices: [
          'Population growth from new tools and crops',
          'The arrival of Portuguese traders',
          'The spread of Islam across the Sahara',
          'The fall of the Roman Empire',
        ],
        answer: 0,
        explanations: [
          'Correct. Technological and agricultural innovation led to growth, then migration.',
          'Incorrect. The Portuguese arrived about 2,000 years later.',
          'Incorrect. Islam came much later.',
          'Incorrect. The expansion began long before and was internal to Africa.',
        ],
      },
      checkpoints: [
        {
          question: 'Which language belongs to the Bantu family?',
          choices: ['Swahili', 'Arabic', 'Ge\'ez', 'Portuguese'],
          answer: 0,
          explanations: [
            'Correct. Swahili, Xhosa, Kikongo and Zulu are Bantu languages.',
            'Incorrect. Arabic is a Semitic language.',
            'Incorrect. Ge\'ez is a Semitic script and language of Ethiopia.',
            'Incorrect. Portuguese is European.',
          ],
        },
        {
          question: 'Why is the Bantu expansion significant to African American history?',
          choices: [
            'Much of African Americans\' genetic ancestry traces to Bantu-speaking communities in West and Central Africa',
            'It brought the first Africans to North America',
            'It ended the trans-Saharan trade',
            'It created the Swahili Coast city-states directly in 1500 BCE',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED links the expansion to African Americans\' ancestry.',
            'Incorrect. It took place within Africa.',
            'Incorrect. It didn\'t end trans-Saharan trade.',
            'Incorrect. The Swahili city-states flourished much later (11th–15th centuries).',
          ],
        },
      ],
      revisit:
        'New tools + crops (bananas, yams, grains) → population growth → Bantu expansion (1500 BCE–500 CE). Hundreds of Bantu languages ' +
        '(Xhosa, Swahili, Kikongo, Zulu). Much of African American ancestry traces to Bantu-speaking West and Central Africa.',
    },
    {
      id: '1.4',
      ced: 'LO 1.4.A–B',
      title: 'Africa’s Ancient Societies',
      minutes: 7,
      summary:
        'Egypt and Nubia arose along the Nile around 3000 BCE; Nubia supplied Egypt\'s gold and, around 750 BCE, conquered it to found the ' +
        '25th dynasty. Aksum (c. 100 BCE) grew rich on Red Sea trade with its own coins and Ge\'ez script, and adopted Christianity under ' +
        'King Ezana. The Nok (c. 500 BCE) were early ironworkers known for terracotta sculpture. Ancient Africa later fueled arguments against racism and colonialism.',
      body: String.raw`### Three ancient societies
| Society | Where and when | Notable |
|---|---|---|
| **Egypt and Nubia (Kush)** | Along the **Nile**, c. 3000 BCE | Nubia was the source of Egypt's **gold** and luxury goods, causing conflict. Around **750 BCE Nubia conquered Egypt**, founding the **25th dynasty** of "Black Pharaohs," who ruled for a century. Meroë in Nubia developed its own writing. |
| **Aksum** | Present-day Eritrea and Ethiopia, c. **100 BCE** | Strategic **Red Sea** location linked it to Mediterranean, Roman and Indian trade; had its own **currency** and **script (Ge'ez)** |
| **Nok** | Present-day **Nigeria**, c. **500 BCE** | One of West Africa's earliest **ironworking** societies; **naturalistic terracotta sculptures** with detailed hairstyles and jewelry; the oldest surviving evidence of a complex settled society in sub-Saharan Africa |

### Why they matter to Black communities
- **King Ezana** made Aksum the **first African society to adopt Christianity**; Ge'ez is still the liturgical language of the **Ethiopian Orthodox Church**. Aksum adopted Christianity **on its own terms**, not through colonialism or the slave trade.
- From the late 1700s, African American writers pointed to **ancient Africa** to counter racist claims that Africans had no government or culture. These texts are part of the field's early canon.
- In the mid-1900s, research on ancient African societies supported Africans' claims for **self-rule and independence** from European colonialism.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Nubia\'s 25th dynasty', back: 'Around 750 BCE Nubia conquered Egypt; its "Black Pharaohs" ruled for a century.' },
            { front: 'Aksum', back: 'Red Sea trading empire (c. 100 BCE) in Eritrea/Ethiopia with its own coins and Ge\'ez script.' },
            { front: 'King Ezana', back: 'Made Aksum the first African society to adopt Christianity.' },
            { front: 'Nok', back: 'Early West African ironworking society (Nigeria, c. 500 BCE) famous for terracotta sculpture.' },
          ],
        },
      ],
      precheck: {
        question: 'Which ancient African society conquered Egypt around 750 BCE?',
        choices: ['Nubia (Kush)', 'Aksum', 'Nok', 'Mali'],
        answer: 0,
        explanations: [
          'Correct. Nubia founded Egypt\'s 25th dynasty.',
          'Incorrect. Aksum rose around 100 BCE in the Horn of Africa.',
          'Incorrect. Nok was in West Africa.',
          'Incorrect. Mali flourished about 2,000 years later.',
        ],
      },
      checkpoints: [
        {
          question: 'Aksum\'s adoption of Christianity is significant because it:',
          choices: [
            'Happened on Africa\'s own terms, before colonialism or the transatlantic slave trade',
            'Was imposed by Portuguese colonizers',
            'Ended Aksum\'s trade with the Mediterranean',
            'Replaced Ge\'ez with Latin',
          ],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s point.',
            'Incorrect. It happened in the 300s, long before the Portuguese arrived.',
            'Incorrect. Aksum remained a trading power.',
            'Incorrect. Ge\'ez is still used in the Ethiopian Orthodox Church.',
          ],
        },
        {
          question: 'Why did African American writers from the late 1700s onward emphasize ancient Africa?',
          choices: [
            'To counter racist stereotypes that African societies lacked government or culture',
            'To argue for European colonization',
            'To promote the transatlantic slave trade',
            'To claim ancient Africa had no writing',
          ],
          answer: 0,
          explanations: [
            'Correct. Ancient African achievements refuted racist claims.',
            'Incorrect. They opposed such views.',
            'Incorrect. They opposed slavery.',
            'Incorrect. Aksum and Meroë had writing.',
          ],
        },
      ],
      revisit:
        'Egypt and Nubia on the Nile (c. 3000 BCE); Nubia\'s 25th dynasty (c. 750 BCE). Aksum: Red Sea trade, coins, Ge\'ez, Christianity ' +
        'under Ezana. Nok: ironworking, terracottas. Ancient Africa countered racism and supported independence claims.',
    },
    {
      id: '1.5',
      ced: 'LO 1.5.A–C',
      title: 'The Sudanic Empires: Ghana, Mali, and Songhai',
      minutes: 8,
      summary:
        'Ghana (7th–13th c.), Mali (13th–17th c.) and Songhai (15th–16th c.) grew rich from gold and their position on trans-Saharan routes, ' +
        'which also brought Islam. Mansa Musa made Mali a center of trade and learning; his 1324 hajj drew European interest. Songhai declined ' +
        'as trade shifted to the Atlantic. Most enslaved Africans brought to North America came from West and West Central Africa.',
      body: String.raw`### Three empires
| Empire | Flourished | Notes |
|---|---|---|
| **Ghana** | 7th–13th centuries | In present-day **Mauritania and Mali**, not modern Ghana (which took the name at independence in 1957) |
| **Mali** | 13th–17th centuries | Parts of present-day Mali, Mauritania, Senegal; ruled by **Mansa** ("ruler") **Musa** in the 1300s |
| **Songhai** | 15th–16th centuries | The **last and largest**; weakened when trade shifted from trans-Saharan routes to the **Atlantic** after Portuguese exploration |

Each rose as the one before declined.

### Gold, trade and Islam
- All three controlled **gold mines** and sat where routes from the **Sahara (toward Europe)** met **sub-Saharan Africa**.
- Trans-Saharan trade brought **North African traders, scholars and administrators**, who introduced **Islam** and helped it spread through West Africa.

### Mali's reach
- **Mansa Musa** made Mali a hub of **trade, learning and cultural exchange**.
- Wealth let Mali **breed North African horses** and buy **steel weapons**, extending its power over neighbors.
- His **hajj to Mecca in 1324** displayed Mali's wealth; merchants and mapmakers from the eastern Mediterranean to southern Europe took notice. The **Catalan Atlas** (1375), by a mapmaker in Spain, shows Mansa Musa with a gold crown and orb.

### Connection to African Americans
The Sudanic empires stretched from **Senegambia** to present-day **Côte d'Ivoire**, including parts of Nigeria. Most enslaved Africans transported directly to North America came from **West Africa and West Central Africa**.`,
      blocks: [],
      precheck: {
        question: 'What made Ghana, Mali and Songhai wealthy?',
        choices: [
          'Gold mines and control of trans-Saharan trade routes',
          'Silver mines in the Americas',
          'Control of the Strait of Malacca',
          'Exporting porcelain to China',
        ],
        answer: 0,
        explanations: [
          'Correct. Gold plus a strategic place on trade routes.',
          'Incorrect. That is Spain\'s source of wealth.',
          'Incorrect. That is in Southeast Asia.',
          'Incorrect. China exported porcelain.',
        ],
      },
      checkpoints: [
        {
          question: 'Why did Songhai\'s wealth decline?',
          choices: [
            'Trade shifted from trans-Saharan routes to Atlantic routes after Portuguese exploration',
            'Its gold mines were conquered by Aksum',
            'Islam was banned in West Africa',
            'Mansa Musa spent all its gold in 1324',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED ties Songhai\'s decline to the shift to Atlantic trade.',
            'Incorrect. Aksum was in East Africa and much earlier.',
            'Incorrect. Islam continued to spread.',
            'Incorrect. Mansa Musa ruled Mali, not Songhai.',
          ],
        },
        {
          question: 'The Catalan Atlas (1375) is best used as evidence of:',
          choices: [
            'European awareness of Mali\'s wealth and Mansa Musa\'s power',
            'Songhai\'s conquest of Portugal',
            'The Bantu expansion',
            'Christianity in the Kingdom of Kongo',
          ],
          answer: 0,
          explanations: [
            'Correct. A Spanish mapmaker depicted Mansa Musa with gold crown and orb.',
            'Incorrect. No such conquest occurred.',
            'Incorrect. The Bantu expansion ended around 500 CE.',
            'Incorrect. Kongo converted in 1491.',
          ],
        },
      ],
      revisit:
        'Ghana (7th–13th c.), Mali (13th–17th c.), Songhai (15th–16th c.): gold + trans-Saharan trade; Islam via traders and scholars. ' +
        'Mansa Musa\'s 1324 hajj; horses and steel; Catalan Atlas. Songhai declined as trade moved to the Atlantic.',
    },
    {
      id: '1.6–1.7',
      ced: 'LO 1.6.A, LO 1.7.A',
      title: 'Learning Traditions and Religious Syncretism',
      minutes: 6,
      summary:
        'West African trading cities were centers of learning; Timbuktu drew astronomers, mathematicians, architects and jurists. Griots, ' +
        'women and men, preserved history through story and music, like the Epic of Sundiata. Leaders\' adoption of Islam or Christianity led ' +
        'to syncretism with Indigenous beliefs, which enslaved Africans carried to the Americas, where ancestor veneration and other practices survived.',
      body: String.raw`### Learning traditions
- **Institutional**: trading cities housed centers of learning. In Mali, **Timbuktu** had a **book trade, a university and a learning community** that drew **astronomers, mathematicians, architects and jurists**.
- **Community-based**: **griots** were prestigious **historians, storytellers and musicians** who preserved a community's history and traditions. **Women and men** served as griots, keeping records of **births, deaths and marriages**.
- The **Epic of Sundiata**, performed by griots for centuries and still celebrated in Mali, tells of **Sundiata Keita**, founder of the Mali Empire (an ancestor of Mansa Musa).

### Religious syncretism
**Syncretism** = blending religious traditions.
- When leaders adopted **Islam** (Mali, Songhai) or **Christianity** (Kongo), many subjects **blended** the new faith with **Indigenous spiritual beliefs and cosmologies**.
- Enslaved Africans carried these syncretic practices to the Americas: about **one-quarter** of enslaved Africans arriving in North America came from **Christian** societies and about **one-quarter** from **Muslim** societies.
- Practices traceable to West and West Central Africa (**ancestor veneration, divination, healing, collective singing and dancing**) survive in diaspora religions such as **Louisiana Voodoo** (also Vodun in Haiti, Regla de Ocha-Ifá in Cuba, Candomblé in Brazil). Enslaved people often held such ceremonies to **strengthen themselves before revolts**.`,
      blocks: [],
      precheck: {
        question: 'Griots in West African societies were best described as:',
        choices: [
          'Historians, storytellers and musicians who preserved community history',
          'Tax collectors for the Mali Empire',
          'Portuguese missionaries',
          'Gold miners',
        ],
        answer: 0,
        explanations: [
          'Correct. Women and men griots kept history alive through performance.',
          'Incorrect. That is not their role.',
          'Incorrect. Griots were West African.',
          'Incorrect. That is not their role.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains religious syncretism in early West Africa?',
          choices: [
            'Subjects blended Islam or Christianity adopted by leaders with Indigenous beliefs',
            'All Indigenous beliefs disappeared when Islam arrived',
            'Christianity arrived only through colonial conquest',
            'Religions were kept strictly separate',
          ],
          answer: 0,
          explanations: [
            'Correct. Blending, not replacement, was common.',
            'Incorrect. Indigenous practices persisted and blended.',
            'Incorrect. Kongo\'s leaders converted voluntarily.',
            'Incorrect. That is the opposite of syncretism.',
          ],
        },
        {
          question: 'About what share of enslaved Africans arriving in North America came from Muslim societies in Africa?',
          choices: ['About one-quarter', 'Almost none', 'About three-quarters', 'All of them'],
          answer: 0,
          explanations: [
            'Correct. About a quarter came from Muslim societies and about a quarter from Christian ones.',
            'Incorrect. The CED gives about one-quarter.',
            'Incorrect. That overstates it.',
            'Incorrect. Many came from Christian or Indigenous traditions.',
          ],
        },
      ],
      revisit:
        'Timbuktu: books, university, scholars. Griots (women and men) preserved history; Epic of Sundiata. Syncretism: Islam/Christianity ' +
        'blended with Indigenous beliefs; ~¼ Christian, ~¼ Muslim origins; ancestor veneration, divination survived (Louisiana Voodoo).',
    },
    {
      id: '1.8',
      ced: 'LO 1.8.A–B',
      title: 'Culture and Trade in Southern and East Africa',
      minutes: 6,
      summary:
        'Great Zimbabwe (12th–15th c.) was the Shona capital, wealthy from gold, ivory and cattle and linked to Swahili Coast trade; its stone ' +
        'walls served defense and trade, the Great Enclosure religion and administration. Swahili Coast city-states, from Somalia to Mozambique, ' +
        'linked Africa\'s interior to Arab, Persian, Indian and Chinese traders, shared Swahili and Islam, and were invaded by the Portuguese in the 1500s.',
      body: String.raw`### Great Zimbabwe
- The **Kingdom of Zimbabwe** and its capital **Great Zimbabwe** flourished from the **12th to the 15th century**. The **Shona** people grew wealthy from **gold, ivory and cattle**, trading through the **Swahili Coast**.
- Its massive **stone architecture** provided **military defense** and a **hub for long-distance trade**. The **Great Enclosure** hosted religious and administrative activities; its **conical tower** likely served as a **granary**.
- The ruins remain a symbol of the prominence, **autonomy** and agricultural achievement of Shona kings and early African societies.

### The Swahili Coast
- Named from the Arabic **sawahil** ("coasts"), it stretches from **Somalia to Mozambique**.
- Its city-states linked Africa's interior to **Arab, Persian, Indian and Chinese** traders.
- From the **11th to the 15th century**, they were united by a shared language (**Swahili**, a Bantu lingua franca) and a shared religion (**Islam**).
- Their wealth drew the **Portuguese**, who **invaded** major city-states in the **16th century** to control Indian Ocean trade.`,
      blocks: [],
      precheck: {
        question: 'What united the Swahili Coast city-states between the 11th and 15th centuries?',
        choices: ['A shared language (Swahili) and religion (Islam)', 'A single king ruling from Great Zimbabwe', 'Portuguese colonial rule', 'Christianity'],
        answer: 0,
        explanations: [
          'Correct. Swahili and Islam were common threads.',
          'Incorrect. They were independent city-states.',
          'Incorrect. The Portuguese came later, in the 1500s.',
          'Incorrect. The city-states were Muslim.',
        ],
      },
      checkpoints: [
        {
          question: 'Great Zimbabwe\'s stone walls most likely served which purposes?',
          choices: [
            'Military defense and a hub for long-distance trade',
            'Housing Portuguese soldiers',
            'Storing salt from the Sahara',
            'Marking the border of the Mali Empire',
          ],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s description.',
            'Incorrect. Great Zimbabwe was a Shona capital.',
            'Incorrect. It is in Southern Africa, far from the Sahara.',
            'Incorrect. Mali was in West Africa.',
          ],
        },
        {
          question: 'Why did the Portuguese invade Swahili Coast city-states in the 16th century?',
          choices: ['To control Indian Ocean trade', 'To spread Islam', 'To find a route to the Americas', 'To end the gold trade'],
          answer: 0,
          explanations: [
            'Correct. The cities\' trade wealth attracted Portuguese conquest.',
            'Incorrect. The Portuguese were Christian.',
            'Incorrect. East Africa wasn\'t a route to the Americas.',
            'Incorrect. They wanted to profit from trade, not end it.',
          ],
        },
      ],
      revisit:
        'Great Zimbabwe (12th–15th c.): Shona, gold/ivory/cattle, stone walls for defense and trade, Great Enclosure, granary tower. ' +
        'Swahili Coast: Somalia–Mozambique, Indian Ocean trade, Swahili + Islam; Portuguese invasion in the 1500s.',
    },
    {
      id: '1.9',
      ced: 'LO 1.9.A–C',
      title: 'West Central Africa: The Kingdom of Kongo',
      minutes: 6,
      summary:
        'In 1491 Kongo\'s King Nzinga a Nkuwu (João I) and his son Nzinga Mbemba (Afonso I) voluntarily converted to Catholicism, ' +
        'strengthening trade with Portugal and creating a distinct African Catholicism. Portugal then demanded access to the slave trade; ' +
        'West Central Africa became its largest source. About a quarter of enslaved Africans brought to the U.S. came from the region, many already Christian.',
      body: String.raw`### A voluntary conversion
In **1491**, **King Nzinga a Nkuwu (João I)** and his son **Nzinga Mbemba (Afonso I)** **voluntarily** converted the powerful Kingdom of Kongo to **Roman Catholicism**.
- **Economic effect**: stronger trade with Portugal and greater wealth; main trade goods were **ivory, salt, copper and textiles**.
- **Religious effect**: because the nobility chose it, and the Church wasn't tied to foreign occupation, Christianity gained **mass acceptance**. A distinct **African Catholicism** emerged, blending Christianity with local aesthetic and cultural traditions.

### Kongo and the slave trade
- Tied politically to Portugal, Kongo faced Portuguese demands for **access to the trade in enslaved people** in exchange for **military assistance**.
- Kongo nobles **participated** but **couldn't limit** the number of captives sold to Europeans.
- Kongo and the wider West Central African region became the **largest source of enslaved people** in the history of the transatlantic slave trade.

### Legacy among African Americans
- About **a quarter** of enslaved Africans brought directly to what became the U.S. came from **West Central Africa**, and many were **already Christian**.
- Kongo naming practices (naming children after **saints** or the **day of the week** they were born) predated the slave trade, so Christian names among early African Americans (**Juan, João, John**) also have **African origins**.`,
      blocks: [],
      precheck: {
        question: 'How did the Kingdom of Kongo become Christian?',
        choices: [
          'Its rulers voluntarily converted in 1491',
          'Portugal conquered it and forced conversion',
          'Missionaries from Aksum converted it in the 300s',
          'Enslaved Africans returning from the Americas brought it',
        ],
        answer: 0,
        explanations: [
          'Correct. King Nzinga a Nkuwu and his son chose Catholicism.',
          'Incorrect. Conversion wasn\'t tied to foreign occupation.',
          'Incorrect. Aksum converted itself, far away and much earlier.',
          'Incorrect. Conversion came before the large-scale slave trade.',
        ],
      },
      checkpoints: [
        {
          question: 'Why could Kongo nobles not fully control the slave trade with Portugal?',
          choices: [
            'They participated but could not limit the number of captives sold to Europeans',
            'They refused to participate at all',
            'Portugal had no interest in Kongo',
            'The trade involved only gold',
          ],
          answer: 0,
          explanations: [
            'Correct. Portuguese demand overwhelmed their attempts to limit it.',
            'Incorrect. Nobles did participate.',
            'Incorrect. Portugal demanded access in exchange for military help.',
            'Incorrect. It was a trade in people.',
          ],
        },
        {
          question: 'Early African American names like John or João are best explained by:',
          choices: [
            'Kongo traditions of naming children after saints, predating the slave trade',
            'Laws requiring English names',
            'Islamic naming traditions',
            'The Epic of Sundiata',
          ],
          answer: 0,
          explanations: [
            'Correct. These names have African as well as European origins.',
            'Incorrect. The CED points to Kongo practices.',
            'Incorrect. These are saints\' names from Christian Kongo.',
            'Incorrect. That is a Mande epic about Mali\'s founder.',
          ],
        },
      ],
      revisit:
        '1491: Kongo\'s rulers voluntarily convert to Catholicism → trade with Portugal (ivory, salt, copper, textiles), African Catholicism. ' +
        'Portugal demands slave-trade access; West Central Africa becomes the largest source. ~¼ of enslaved people to the U.S., many Christian; saint names.',
    },
    {
      id: '1.10',
      ced: 'LO 1.10.A–C',
      title: 'Kinship and Political Leadership',
      minutes: 6,
      summary:
        'Many West and Central African societies were built on extended kinship, which shaped political alliances. Women served as spiritual ' +
        'leaders, advisors, traders, educators and farmers. Queen Idia, Benin\'s first iyoba, advised her son and led armies with spiritual power. ' +
        'Queen Njinga of Ndongo-Matamba fought the Portuguese for 30 years. Both became enduring symbols of Black women\'s leadership.',
      body: String.raw`### Kinship
Many early West and Central African societies were made of **family groups bound by extended kinship**, and kinship often formed the basis of **political alliances**. Women were **spiritual leaders, political advisors, market traders, educators and agriculturalists**.

### Two queens compared
| | **Queen Idia** of Benin | **Queen Njinga** of Ndongo-Matamba |
|---|---|---|
| When and where | Late 1400s, Kingdom of **Benin** (present-day Nigeria) | Early 1600s, **Ndongo and Matamba** (present-day Angola) |
| Role | First **iyoba** (queen mother); political advisor to her son, the king | Queen, ruling as people from Ndongo became the first large group of enslaved Africans brought to the American colonies |
| Military leadership | Led armies; relied on **spiritual power and medicinal knowledge** for victories | Fought **30 years of guerrilla war** against the Portuguese to keep her sovereignty |
| Complexities | | Took part in the slave trade to gain wealth and influence, while offering **sanctuary** to people escaping Portuguese enslavement who joined her army |
| Legacy | Her ivory mask became the symbol of **FESTAC** (1977), an icon of Black women's leadership | A model of political and military skill; nearly **100 more years of women rulers** in Matamba |`,
      blocks: [],
      precheck: {
        question: 'Queen Njinga of Ndongo-Matamba is best known for:',
        choices: [
          'Waging 30 years of guerrilla warfare against the Portuguese',
          'Founding the Mali Empire',
          'Becoming the first iyoba of Benin',
          'Converting Kongo to Christianity in 1491',
        ],
        answer: 0,
        explanations: [
          'Correct. She fought to maintain her kingdom\'s sovereignty.',
          'Incorrect. Sundiata Keita founded Mali.',
          'Incorrect. That was Queen Idia.',
          'Incorrect. That was King Nzinga a Nkuwu and his son.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes a similarity between Queen Idia and Queen Njinga?',
          choices: ['Both led armies into battle', 'Both ruled Benin', 'Both lived in the 1800s', 'Both refused all contact with Europeans'],
          answer: 0,
          explanations: [
            'Correct. The CED notes that both led armies.',
            'Incorrect. Njinga ruled Ndongo and Matamba.',
            'Incorrect. Idia lived in the late 1400s; Njinga in the 1600s.',
            'Incorrect. Both kingdoms dealt with the Portuguese.',
          ],
        },
        {
          question: 'Queen Idia\'s mask became an icon of Black women\'s leadership when it was:',
          choices: [
            'Adopted as the symbol of FESTAC in 1977',
            'Printed on Aksumite coins',
            'Shown in the Catalan Atlas',
            'Carried to North America in 1619',
          ],
          answer: 0,
          explanations: [
            'Correct. The Second World Black Festival of Arts and Culture used it.',
            'Incorrect. Aksumite coins show King Ezana and are much older.',
            'Incorrect. The Catalan Atlas shows Mansa Musa.',
            'Incorrect. That is not the CED\'s answer.',
          ],
        },
      ],
      revisit:
        'Kinship underpinned political alliances; women were leaders, advisors, traders, educators, farmers. Idia: first iyoba of Benin, ' +
        'spiritual power, FESTAC symbol. Njinga: 30-year war on the Portuguese, sanctuary for escapees, legacy of women rulers.',
    },
    {
      id: '1.11',
      ced: 'LO 1.11.A–B',
      title: 'Global Africans',
      minutes: 5,
      summary:
        'From the late 1400s, trade between West African kingdoms and Portugal in gold, goods and enslaved people grew, bypassing the Sahara. ' +
        'Africans lived in Lisbon and Seville in many roles, from laborers to knights, and African elites traveled to Europe. The Portuguese ' +
        'built plantations on Cabo Verde and São Tomé; by 1500 about 50,000 enslaved Africans had been taken, a model for slavery in the Americas.',
      body: String.raw`### Before the transatlantic slave trade
- In the **late 1400s**, trade between **West African kingdoms and Portugal** for **gold, goods and enslaved people** grew steadily, **bypassing the trans-Saharan routes**. African kingdoms gained wealth and power through slave trading, which was a feature of hierarchical West African societies.
- More **Europeans** lived in West Africa, and more **sub-Saharan Africans** lived in **Lisbon and Seville**: in the 1500s, Africans made up about **20 percent** of Lisbon's population.
- **African elites** (ambassadors, rulers' children) traveled to Mediterranean ports for **diplomatic, educational and religious** reasons. Free and enslaved Africans worked as domestic laborers, boatmen, guards, entertainers, vendors and even **knights**. A painting of Lisbon's **King's Fountain** (1570–1580) shows João de Sá Panasco, an African Portuguese knight, among many Africans in the city.

### A model for the Americas
- In the mid-1400s the Portuguese colonized the Atlantic islands of **Cabo Verde** and **São Tomé**, establishing **cotton, indigo and sugar plantations** worked by enslaved Africans.
- By **1500**, about **50,000** enslaved Africans had been taken from the continent to these islands and to Europe.
- These plantations became the **model** for slave-labor economies in the Americas.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Put these developments from Unit 1 in order',
            events: [
              { year: -3000, when: 'c. 3000 BCE', label: 'Egypt and Nubia emerge along the Nile' },
              { year: -1500, when: 'from 1500 BCE', label: 'Bantu expansion begins' },
              { year: -750, when: 'c. 750 BCE', label: 'Nubia conquers Egypt (25th dynasty)' },
              { year: -100, when: 'c. 100 BCE', label: 'Aksum emerges on the Red Sea' },
              { year: 1324, when: '1324', label: 'Mansa Musa\'s hajj to Mecca' },
              { year: 1491, when: '1491', label: 'Kongo\'s rulers convert to Catholicism' },
              { year: 1500, when: 'by 1500', label: '~50,000 Africans enslaved on Atlantic islands and in Europe' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Why did West African trade with Portugal grow in the late 1400s?',
        choices: [
          'It let both sides bypass the trans-Saharan routes for gold, goods and enslaved people',
          'Portugal had conquered all of West Africa',
          'The Sahara had become impassable after 1400',
          'Mali required all trade to go by sea',
        ],
        answer: 0,
        explanations: [
          'Correct. Sea trade bypassed the Saharan middlemen.',
          'Incorrect. West African kingdoms remained independent and powerful.',
          'Incorrect. Trans-Saharan trade continued.',
          'Incorrect. No such requirement existed.',
        ],
      },
      checkpoints: [
        {
          question: 'The Portuguese plantations on Cabo Verde and São Tomé are significant because they:',
          choices: [
            'Became a model for slave-labor economies in the Americas',
            'Were run entirely by free wage workers',
            'Ended the trade in enslaved people',
            'Grew only wheat for Europe',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED calls them a model for the Americas.',
            'Incorrect. They used enslaved African labor.',
            'Incorrect. They expanded it.',
            'Incorrect. They grew cotton, indigo and sugar.',
          ],
        },
        {
          question: 'The King\'s Fountain painting of Lisbon (1570–1580) is best used as evidence of:',
          choices: [
            'The large presence of Africans in varied roles in Iberian port cities',
            'The absence of Africans in Europe before 1700',
            'The founding of the Mali Empire',
            'Bantu migrations',
          ],
          answer: 0,
          explanations: [
            'Correct. It shows knights, nobles, guards and traders of African descent.',
            'Incorrect. It shows the opposite.',
            'Incorrect. Mali was founded centuries earlier in West Africa.',
            'Incorrect. That happened within Africa long before.',
          ],
        },
      ],
      revisit:
        'Late 1400s: West Africa–Portugal trade bypasses the Sahara. Africans ~20% of 1500s Lisbon, in roles up to knights; African elites ' +
        'traveled to Europe. Cabo Verde and São Tomé plantations; ~50,000 enslaved by 1500; model for the Americas.',
    },
  ],
};

export default pack;
