/**
 * AP Human Geography Unit 2: Population and Migration Patterns and Processes —
 * study pack.
 *
 * Written against the AP Human Geography CED (effective Fall 2020, the
 * current edition on AP Central; topics 2.1–2.12, enduring understandings
 * PSO-2, IMP-2 and SPS-2). Sticks to the models and terms the essential
 * knowledge names: three density methods, carrying capacity, population
 * pyramids, rate of natural increase and doubling time, the demographic and
 * epidemiological transitions, Malthus and his critics, pro- and antinatalist
 * and immigration policies, Ravenstein's laws, the dependency ratio, push and
 * pull factors, and the CED's list of forced and voluntary migration types.
 *
 * The textbook map lists only partial matches (US geography and public
 * health chapters at a different level), so this is written from the CED.
 * The population-pyramid simulation is a simplified stable-population model,
 * labelled as such. Country figures are rounded and described as approximate.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-human-geography/unit-2',
  subject: 'AP Human Geography',
  unit: 'Unit 2: Population and Migration Patterns and Processes',
  examWeight: '12–17% of the exam',
  intro:
    'Where people live, how fast their numbers change, and why they move shape everything else in human geography. This unit ' +
    'covers population density and distribution, population pyramids, the demographic transition, theories and policies about ' +
    'growth, aging, and the causes and effects of migration.',
  sections: [
    {
      id: '2.1–2.2',
      ced: 'PSO-2.A–D',
      title: 'Population Distribution and Density',
      minutes: 8,
      summary:
        'Physical and human factors shape where people live, and the pattern depends on the scale you look at. Arithmetic, ' +
        'physiological and agricultural density each measure a different kind of pressure on the land. Distribution and density ' +
        'affect services, politics and the environment, including carrying capacity.',
      body: String.raw`### What shapes distribution
- **Physical factors**: climate, landforms, water bodies. People cluster in mild climates, on fertile plains and along coasts and rivers.
- **Human factors**: culture, economics, history and politics (jobs in cities, historic settlement, government policy).
- **Scale matters**: a country can look evenly settled at the global scale but be packed into a few cities at the national scale.

### Three ways to measure density
| Method | Formula | What it shows |
|---|---|---|
| **Arithmetic** | people ÷ total land area | General crowding; easy but crude |
| **Physiological** | people ÷ arable land | Pressure on the land that can grow food |
| **Agricultural** | farmers ÷ arable land | How efficient farming is; high values suggest small farms and less mechanization |

${steps({
  title: 'Country X: 100 million people, 5 million farmers, 1,000,000 km² of land, 40,000 km² arable. Find each density.',
  steps: [
    { title: 'Arithmetic', body: '100,000,000 ÷ 1,000,000 km² = 100 people per km²' },
    { title: 'Physiological', body: '100,000,000 ÷ 40,000 km² = 2,500 people per km² of arable land' },
    { title: 'Agricultural', body: '5,000,000 ÷ 40,000 km² = 125 farmers per km² of arable land' },
  ],
  answer: 'Arithmetic 100, physiological 2,500, agricultural 125',
})}

The gap between 100 and 2,500 is the story: most of Country X can't grow food, so its farmland is under heavy pressure. Egypt, with nearly everyone along the Nile, is the classic real example.

### Consequences
- **Society and politics**: dense areas are easier to serve with hospitals, schools and transit; sparse areas struggle to provide services. Population shifts change political representation.
- **Environment**: **carrying capacity** is the number of people an area can support without degrading it. Dense populations strain water, soil and other resources.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Arithmetic density', back: 'Total population ÷ total land area.' },
            { front: 'Physiological density', back: 'Total population ÷ arable land. Shows pressure on farmland.' },
            { front: 'Agricultural density', back: 'Number of farmers ÷ arable land. Higher values suggest less mechanized farming.' },
            { front: 'Carrying capacity', back: 'The population an area can support without environmental degradation.' },
          ],
        },
      ],
      precheck: {
        question: 'Which density measure best shows the pressure a population puts on land that can grow food?',
        choices: ['Physiological density', 'Arithmetic density', 'Agricultural density', 'Population distribution'],
        answer: 0,
        explanations: [
          'Correct. It divides the whole population by arable land.',
          'Incorrect. Arithmetic density uses all land, including deserts and mountains.',
          'Incorrect. Agricultural density counts only farmers, so it measures farming efficiency.',
          'Incorrect. Distribution describes where people are, not a ratio.',
        ],
      },
      checkpoints: [
        {
          question: 'Country A and Country B have the same physiological density, but A\'s agricultural density is much higher. What is the best inference?',
          choices: [
            'Farming in A is less mechanized, with more farmers working each unit of farmland',
            'A has much more arable land than B',
            'A has a smaller total population than B',
            'A\'s farms produce more food per farmer',
          ],
          answer: 0,
          explanations: [
            'Correct. More farmers per km² of farmland usually means smaller, less mechanized farms.',
            'Incorrect. Equal physiological densities don\'t tell us A has more arable land.',
            'Incorrect. Agricultural density says nothing about total population size.',
            'Incorrect. More farmers per area usually means less output per farmer.',
          ],
        },
        {
          question: 'Why might a sparsely populated rural region struggle to provide medical care?',
          choices: [
            'Low density means too few patients near any one hospital to support it',
            'Rural areas exceed their carrying capacity',
            'Physiological density is always zero in rural areas',
            'Rural people don\'t need medical care',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED notes distribution and density affect the provision of services such as medical care.',
            'Incorrect. Sparse areas are usually well under carrying capacity.',
            'Incorrect. Rural areas have people and farmland, so the ratio isn\'t zero.',
            'Incorrect. Everyone needs care; providing it is the problem.',
          ],
        },
      ],
      revisit:
        'Physical and human factors shape distribution; patterns change with scale. Arithmetic = people ÷ land; physiological = ' +
        'people ÷ arable land; agricultural = farmers ÷ arable land. Density affects services, politics and carrying capacity.',
    },
    {
      id: '2.3',
      ced: 'PSO-2.E–F',
      title: 'Population Composition',
      minutes: 6,
      summary:
        'Age structure and sex ratio vary between places and can be mapped at different scales. Population pyramids show both at ' +
        'once and help predict growth or decline and future demand for goods and services.',
      body: String.raw`### Reading a population pyramid
A **population pyramid** is a pair of horizontal bar charts: males on one side, females on the other, with age groups (usually 5-year cohorts) stacked from youngest at the bottom to oldest at the top.

| Shape | What it suggests |
|---|---|
| **Wide base, narrow top** | High birth rates, rapid growth, short life expectancy |
| **Straighter sides, narrowing at the top** | Falling birth rates, slowing growth |
| **Column or narrow base** | Low birth rates; little growth or decline |

### What else pyramids reveal
- **Sex ratio**: males per 100 females. Women live longer, so the top of most pyramids is wider on the female side. Male-dominated labor migration (for example, construction workers in Gulf states) bulges the male side in working ages.
- **Bumps and notches**: a baby boom, a war or a famine leaves a bulge or a gap that moves up the pyramid over time.
- **Markets**: a wide base means demand for schools, diapers and pediatric care; a wide top means demand for health care, retirement housing and pensions.

Patterns differ by scale. A retirement community or a college town has a very different pyramid from its country.`,
      blocks: [],
      precheck: {
        question: 'A population pyramid has a very wide base and narrows quickly toward the top. What does this suggest?',
        choices: [
          'High birth rates and rapid population growth',
          'An aging population with low birth rates',
          'A population that is shrinking',
          'Equal numbers of people in every age group',
        ],
        answer: 0,
        explanations: [
          'Correct. Many young people relative to older ones indicates high fertility and growth.',
          'Incorrect. An aging population has a narrow base and a wide top.',
          'Incorrect. A shrinking population has fewer children than adults.',
          'Incorrect. That would be a column shape.',
        ],
      },
      checkpoints: [
        {
          question: 'A country\'s pyramid shows many more males than females aged 20–40. What is the most likely cause?',
          choices: [
            'Large numbers of male labor migrants moving in for work',
            'High female life expectancy',
            'A recent baby boom',
            'A war that killed many young men',
          ],
          answer: 0,
          explanations: [
            'Correct. Male-dominated labor migration bulges the male side in working ages.',
            'Incorrect. Longer female lives widen the female side at older ages.',
            'Incorrect. A baby boom widens both sides at young ages.',
            'Incorrect. A war killing men would leave fewer men, not more.',
          ],
        },
        {
          question: 'A company sees that a country\'s pyramid has a wide top and a narrow base. Which product market is most likely to grow there?',
          choices: ['Home health care for older adults', 'Infant formula', 'School construction', 'Toy stores'],
          answer: 0,
          explanations: [
            'Correct. Pyramids predict markets; a large elderly population means demand for elder care.',
            'Incorrect. A narrow base means few infants.',
            'Incorrect. Few children means less need for new schools.',
            'Incorrect. Toys depend on the small number of children.',
          ],
        },
      ],
      revisit:
        'Pyramids show age structure and sex ratio. Wide base = high births, rapid growth; column = low growth. Bumps record booms ' +
        'and wars. Pyramids predict markets for goods and services. Patterns change with scale.',
    },
    {
      id: '2.4–2.5',
      ced: 'IMP-2.A–B',
      title: 'Population Dynamics and the Demographic Transition',
      minutes: 11,
      summary:
        'Fertility, mortality and migration drive population change. The rate of natural increase and doubling time measure growth. ' +
        'The demographic transition model describes how birth and death rates fall as countries develop, and the epidemiological ' +
        'transition explains why death rates change.',
      body: String.raw`### Measuring change
- **Crude birth rate (CBR)** and **crude death rate (CDR)**: births and deaths per 1,000 people per year.
- **Rate of natural increase (NIR)**: $\text{NIR} = \dfrac{\text{CBR} - \text{CDR}}{10}$, as a percent. CBR 30 and CDR 10 give NIR = 2%.
- **Doubling time**: about $70 \div \text{NIR}$ years (the rule of 70). At 2%, about 35 years.
- **Total fertility rate (TFR)**: average children per woman. About 2.1 is replacement level.
- Social, cultural, political and economic factors (education, religion, health care, policy) shape fertility, mortality and migration.

### The demographic transition model (DTM)
| Stage | Births and deaths | Growth |
|---|---|---|
| **1** | Both high | Little growth; no country today |
| **2** | Deaths fall (food, sanitation, medicine); births stay high | Rapid growth |
| **3** | Births fall (urbanization, education, contraception, women's work) | Growth slows |
| **4** | Both low | Little or no growth |
| **5** (sometimes added) | Births fall below deaths | Decline (Japan, Italy) |

The model is based on European history. Critics note that not every country follows it, and the speed of change varies.

### The epidemiological transition
It explains **why death rates change**, and roughly matches the DTM:
1. **Pestilence and famine**: infectious disease, high deaths.
2. **Receding pandemics**: sanitation and medicine cut infectious deaths (DTM stage 2).
3. **Degenerative and human-created diseases**: heart disease and cancer dominate (stage 3–4).
4. **Delayed degenerative diseases**: medicine extends life with chronic disease.
5. Some add a stage of **reemerging infectious diseases** (antibiotic resistance, pandemics).

Try the model below: start at stage 1, then raise life expectancy, then lower the birth rate.`,
      blocks: [{ type: 'sim', sim: 'population-pyramid' }],
      precheck: {
        question: 'A country has a crude birth rate of 25 and a crude death rate of 7. What is its rate of natural increase?',
        choices: ['1.8%', '18%', '3.2%', '0.32%'],
        answer: 0,
        explanations: [
          'Correct. (25 − 7) ÷ 10 = 1.8%.',
          'Incorrect. The rates are per 1,000, so divide the difference by 10 to get a percent.',
          'Incorrect. That adds the rates instead of subtracting.',
          'Incorrect. That divides by 100 instead of 10.',
        ],
      },
      checkpoints: [
        {
          question: 'A country\'s death rate has dropped sharply because of vaccines and clean water, but its birth rate is still high. Which DTM stage is it in?',
          choices: ['Stage 2', 'Stage 1', 'Stage 3', 'Stage 4'],
          answer: 0,
          explanations: [
            'Correct. Falling deaths with high births produce rapid growth.',
            'Incorrect. In stage 1 both rates are high.',
            'Incorrect. Stage 3 is when birth rates start falling.',
            'Incorrect. In stage 4 both rates are low.',
          ],
        },
        {
          question: 'At a natural increase of 3.5% per year, about how long does it take a population to double?',
          choices: ['20 years', '35 years', '245 years', '3.5 years'],
          answer: 0,
          explanations: [
            'Correct. 70 ÷ 3.5 = 20 years.',
            'Incorrect. That would be the doubling time at 2%.',
            'Incorrect. That multiplies instead of dividing.',
            'Incorrect. That confuses the growth rate with the time.',
          ],
        },
      ],
      revisit:
        'NIR = (CBR − CDR) ÷ 10 %; doubling time ≈ 70 ÷ NIR. DTM: 1 both high; 2 deaths fall → rapid growth; 3 births fall; 4 both ' +
        'low; 5 births < deaths. Epidemiological transition explains falling deaths and changing causes of death.',
    },
    {
      id: '2.6',
      ced: 'IMP-2.B.3',
      title: 'Malthusian Theory',
      minutes: 5,
      summary:
        'Thomas Malthus argued in 1798 that population grows faster than food supply, so famine, disease and war would check growth. ' +
        'Critics point to technology that raised food output; neo-Malthusians warn that resource limits still matter.',
      body: String.raw`### Malthus's argument
In *An Essay on the Principle of Population* (1798), Thomas Malthus argued:
- Population grows **geometrically** (1, 2, 4, 8…).
- Food supply grows **arithmetically** (1, 2, 3, 4…).
- So population would outrun food, and "checks" such as famine, disease and war would push it back down, unless people limited births.

### Critiques
- **Technology and innovation**: the Industrial Revolution and the **Green Revolution** (high-yield seeds, fertilizer, irrigation) raised food production faster than Malthus thought possible.
- **Ester Boserup** argued that population pressure **drives** agricultural innovation.
- **Distribution, not supply**: modern famines usually come from war, poverty and politics, not a global shortage of food.
- Birth rates fell as countries developed, which Malthus didn't foresee.

### Neo-Malthusians
Writers such as Paul Ehrlich (*The Population Bomb*, 1968) argue Malthus's core warning still applies to resources like water, fuel and farmland, and to environmental damage.`,
      blocks: [],
      precheck: {
        question: 'According to Malthus, why would population growth eventually be checked?',
        choices: [
          'Population grows faster than food supply',
          'Birth rates fall as countries industrialize',
          'Technology increases food production without limit',
          'Migration spreads people evenly across the world',
        ],
        answer: 0,
        explanations: [
          'Correct. He argued geometric population growth outruns arithmetic food growth.',
          'Incorrect. Falling birth rates with development are a later observation that undercuts Malthus.',
          'Incorrect. That is the critics\' point, not Malthus\'s.',
          'Incorrect. Malthus\'s argument was about food, not migration.',
        ],
      },
      checkpoints: [
        {
          question: 'Which development most directly challenges Malthusian theory?',
          choices: [
            'The Green Revolution\'s high-yield crops sharply increasing food production',
            'A famine caused by drought',
            'Rapid population growth in stage 2 countries',
            'Overuse of groundwater for irrigation',
          ],
          answer: 0,
          explanations: [
            'Correct. Food output grew faster than Malthus predicted it could.',
            'Incorrect. A famine seems to support Malthus.',
            'Incorrect. Rapid growth is consistent with his concern.',
            'Incorrect. That supports the neo-Malthusian worry about resources.',
          ],
        },
        {
          question: 'A neo-Malthusian would most likely argue that',
          choices: [
            'population growth threatens limited resources such as water and the environment',
            'population growth always causes agricultural innovation',
            'food supply grows geometrically',
            'population size has no effect on resources',
          ],
          answer: 0,
          explanations: [
            'Correct. Neo-Malthusians extend Malthus\'s warning to resources and the environment.',
            'Incorrect. That is Boserup\'s view.',
            'Incorrect. Malthus said food grows arithmetically.',
            'Incorrect. That contradicts the whole school of thought.',
          ],
        },
      ],
      revisit:
        'Malthus (1798): population grows geometrically, food arithmetically → famine, disease, war. Critics: technology, Green ' +
        'Revolution, Boserup, falling birth rates. Neo-Malthusians: resource and environmental limits.',
    },
    {
      id: '2.7',
      ced: 'SPS-2.A',
      title: 'Population Policies',
      minutes: 5,
      summary:
        'Governments try to change population size and composition. Pronatalist policies encourage births, antinatalist policies ' +
        'discourage them, and immigration policies control who can move in.',
      body: String.raw`### Three kinds of policy
| Policy | Goal | Examples |
|---|---|---|
| **Pronatalist** | Encourage births | Paid parental leave, child payments and cheap child care (France, Nordic countries); cash incentives in Russia and Hungary |
| **Antinatalist** | Discourage births | China's one-child policy (about 1980–2015); family-planning and sterilization campaigns in India in the 1970s |
| **Immigration** | Control who enters | Canada's points system favors skilled workers; quotas, guest-worker programs, refugee admissions |

### Effects and side effects
- China's one-child policy slowed growth, but combined with a preference for sons it skewed the **sex ratio** and sped up **aging**. China moved to a two-child limit in 2016 and a three-child policy in 2021.
- Pronatalist incentives often raise birth rates only slightly; costs of housing and child care matter more.
- Immigration policies change both size and **composition** (age, skills, ethnicity) of a population, and can offset low birth rates.`,
      blocks: [],
      precheck: {
        question: 'A country with a shrinking population offers families cash payments for each child born. What kind of policy is this?',
        choices: ['Pronatalist', 'Antinatalist', 'Immigration', 'Malthusian'],
        answer: 0,
        explanations: [
          'Correct. It encourages births.',
          'Incorrect. Antinatalist policies discourage births.',
          'Incorrect. Immigration policies control who moves in.',
          'Incorrect. Malthusian is a theory, not a policy type.',
        ],
      },
      checkpoints: [
        {
          question: 'Which was an unintended effect of China\'s one-child policy?',
          choices: [
            'An imbalanced sex ratio with more males than females',
            'A rapidly rising birth rate',
            'A younger population',
            'Large-scale immigration to China',
          ],
          answer: 0,
          explanations: [
            'Correct. Combined with son preference, the policy skewed the sex ratio.',
            'Incorrect. The policy lowered births.',
            'Incorrect. Fewer births made the population older.',
            'Incorrect. The policy didn\'t cause immigration.',
          ],
        },
        {
          question: 'How can immigration policy help a country with a low birth rate and an aging workforce?',
          choices: [
            'Admitting working-age migrants adds workers and taxpayers',
            'Restricting immigration raises the birth rate',
            'Immigration policies only affect total population, not age structure',
            'Antinatalist rules for migrants reduce the dependency ratio',
          ],
          answer: 0,
          explanations: [
            'Correct. Immigration changes composition as well as size.',
            'Incorrect. Restricting immigration doesn\'t raise births.',
            'Incorrect. Migrants are mostly working age, so they shift the age structure.',
            'Incorrect. That doesn\'t follow; fewer births would worsen aging.',
          ],
        },
      ],
      revisit:
        'Pronatalist (encourage births: France, Russia), antinatalist (discourage: China\'s one-child policy, India in the 1970s), ' +
        'immigration (Canada\'s points system). Policies change size and composition, often with side effects.',
    },
    {
      id: '2.8–2.9',
      ced: 'SPS-2.B–C',
      title: 'Women, Demographic Change and Aging Populations',
      minutes: 8,
      summary:
        'More access to education, jobs, health care and contraception has lowered fertility in most of the world, and changing ' +
        'roles for women shape migration too, as Ravenstein noted. Low births and longer lives create aging populations, with ' +
        'political, social and economic consequences measured by the dependency ratio.',
      body: String.raw`### Women and demographic change
When women gain access to **education, employment, health care and contraception**, fertility usually falls: they marry later, have more choices, and children are more likely to survive. That is a main driver of DTM stage 3.

Changing roles also affect **mortality** (better maternal and child health) and **migration**.

### Ravenstein's laws of migration (1880s)
Among them:
- Most migrants move **short distances**; long-distance migrants usually head for **major cities**.
- Every migration flow produces a **counterflow**.
- Most migration is economic and moves **step by step**.
- Women were more likely to migrate **within** their country, men more likely to move **internationally**. Today women make up about half of international migrants.

### Aging populations
**Causes**: low birth rates plus rising life expectancy.

**Consequences**:
- **Economic**: fewer workers paying for pensions and health care; labor shortages.
- **Political**: older voters influence policy; debates over retirement age and immigration.
- **Social**: more need for elder care; changing family roles.

### The dependency ratio
$$\text{dependency ratio} = \frac{D}{W} \times 100$$

where $D$ is the number of people aged 0–14 plus those 65 and over (the dependents), and $W$ is the number aged 15–64 (working age).

${steps({
  title: 'A country has 20 million people aged 0–14, 15 million aged 65+, and 65 million aged 15–64. Find the dependency ratio.',
  steps: [
    { title: 'Add the dependents', body: '20 + 15 = 35 million' },
    { title: 'Divide by the working-age population', body: '35 ÷ 65 ≈ 0.538' },
    { title: 'Per 100 workers', body: '0.538 × 100 ≈ 54' },
  ],
  answer: 'About 54 dependents per 100 working-age people',
})}

A high ratio from many children (stage 2) and a high ratio from many elderly (stage 4–5) cause different problems: schools versus pensions.`,
      blocks: [],
      precheck: {
        question: 'Which change most consistently lowers fertility rates?',
        choices: [
          'Greater access to education and jobs for women',
          'Falling life expectancy',
          'More agricultural employment',
          'Larger family farms that need child labor',
        ],
        answer: 0,
        explanations: [
          'Correct. The CED names education, employment, health care and contraception as drivers of lower fertility.',
          'Incorrect. Falling life expectancy doesn\'t reduce births.',
          'Incorrect. Farm economies tend to have higher fertility.',
          'Incorrect. Needing child labor raises the value of more children.',
        ],
      },
      checkpoints: [
        {
          question: 'Japan has one of the world\'s oldest populations. Which consequence is most likely?',
          choices: [
            'Rising pension and health-care costs paid by a shrinking workforce',
            'A shortage of schools for a growing number of children',
            'A rapidly rising crude birth rate',
            'A falling dependency ratio',
          ],
          answer: 0,
          explanations: [
            'Correct. More retirees and fewer workers strain pensions and health care.',
            'Incorrect. An aging country has fewer children.',
            'Incorrect. Aging comes with low birth rates.',
            'Incorrect. More elderly dependents raise the dependency ratio.',
          ],
        },
        {
          question: 'Which statement matches Ravenstein\'s laws of migration?',
          choices: [
            'Most migrants travel only a short distance',
            'Most migrants travel very long distances',
            'Migration flows never produce counterflows',
            'Migrants avoid large cities',
          ],
          answer: 0,
          explanations: [
            'Correct. Short-distance moves are the most common.',
            'Incorrect. Ravenstein found the opposite.',
            'Incorrect. Every flow produces a counterflow.',
            'Incorrect. Long-distance migrants tend to move to major cities.',
          ],
        },
      ],
      revisit:
        'Women\'s access to education, jobs, health care and contraception lowers fertility. Ravenstein: short moves, counterflows, ' +
        'big-city destinations, gender differences. Aging = low births + long lives; dependency ratio = (0–14 + 65+) ÷ (15–64) × 100.',
    },
    {
      id: '2.10–2.11',
      ced: 'IMP-2.C–D',
      title: 'Causes and Types of Migration',
      minutes: 8,
      summary:
        'Push factors drive people out of a place; pull factors draw them in. Intervening obstacles and opportunities shape the ' +
        'journey. Factors can be cultural, demographic, economic, environmental or political. Migration is forced (slavery, ' +
        'refugees, internally displaced persons, asylum seekers) or voluntary, and voluntary migration takes several forms.',
      body: String.raw`### Push and pull
- **Push factors** make people leave: war, persecution, unemployment, drought.
- **Pull factors** attract them: jobs, safety, family, good schools.
- **Intervening obstacles** get in the way (mountains, borders, cost, immigration laws); **intervening opportunities** stop migrants along the way (a job in a city they pass through).
- Factors can be **cultural, demographic, economic, environmental or political**.

### Forced migration
- **Slavery**: the Atlantic slave trade moved millions of Africans by force.
- **Refugees**: people who cross an international border fleeing persecution, war or violence.
- **Internally displaced persons (IDPs)**: forced from home but still inside their own country.
- **Asylum seekers**: people who have applied for protection in another country and are waiting for a decision.

### Voluntary migration
| Type | Meaning |
|---|---|
| **Transnational** | Moving between countries |
| **Internal** | Moving within one country |
| **Rural-to-urban** | From countryside to cities, the largest flow in developing countries |
| **Chain** | Following family or community members who moved earlier |
| **Step** | Moving in stages, such as village → town → city |
| **Guest worker** | Temporary, legal work abroad (Turkish workers in Germany from the 1960s) |
| **Transhumance** | Seasonal movement of herders with livestock |

Sort the examples below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Forced or voluntary migration?',
            buckets: ['Forced', 'Voluntary'],
            items: [
              { label: 'Families fleeing a civil war across the border into a neighboring country', bucket: 0, why: 'They are refugees: forced across an international border.' },
              { label: 'Villagers displaced by a dam project, resettled elsewhere in their own country', bucket: 0, why: 'They are internally displaced persons.' },
              { label: 'A journalist who fled threats applies for protection in another country', bucket: 0, why: 'An asylum seeker is fleeing persecution.' },
              { label: 'Herders moving their goats to mountain pastures every summer', bucket: 1, why: 'Transhumance is seasonal and voluntary.' },
              { label: 'A cousin moves to the same neighborhood where relatives already live', bucket: 1, why: 'Chain migration follows earlier migrants.' },
              { label: 'A farmer moves to the capital city for factory work', bucket: 1, why: 'Rural-to-urban migration for jobs is voluntary.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A family moves from a rural village to a small town, then later to a large city. What type of migration is this?',
        choices: ['Step migration', 'Chain migration', 'Transhumance', 'Forced migration'],
        answer: 0,
        explanations: [
          'Correct. Moving in stages toward larger places is step migration.',
          'Incorrect. Chain migration means following earlier migrants.',
          'Incorrect. Transhumance is seasonal herding.',
          'Incorrect. Nothing forced this move.',
        ],
      },
      checkpoints: [
        {
          question: 'People forced from their homes by violence who remain inside their own country are called',
          choices: ['internally displaced persons', 'refugees', 'guest workers', 'asylum seekers'],
          answer: 0,
          explanations: [
            'Correct. IDPs haven\'t crossed an international border.',
            'Incorrect. Refugees have crossed an international border.',
            'Incorrect. Guest workers migrate voluntarily for temporary work.',
            'Incorrect. Asylum seekers apply for protection in another country.',
          ],
        },
        {
          question: 'A migrant headed to a big city stops in a mid-sized town after finding a good job there. This is an example of',
          choices: ['an intervening opportunity', 'an intervening obstacle', 'a push factor', 'transhumance'],
          answer: 0,
          explanations: [
            'Correct. An opportunity along the way ended the journey early.',
            'Incorrect. An obstacle would block or slow the move.',
            'Incorrect. Push factors drive people away from the origin.',
            'Incorrect. Transhumance is seasonal movement with livestock.',
          ],
        },
      ],
      revisit:
        'Push vs. pull; intervening obstacles and opportunities; cultural, demographic, economic, environmental, political factors. ' +
        'Forced: slavery, refugees, IDPs, asylum seekers. Voluntary: transnational, internal, rural-to-urban, chain, step, guest worker, transhumance.',
    },
    {
      id: '2.12',
      ced: 'IMP-2.E',
      title: 'Effects of Migration',
      minutes: 5,
      summary:
        'Migration has political, economic and cultural effects on both the places people leave and the places they go: ' +
        'remittances and brain drain, labor supply, ethnic neighborhoods, cultural diffusion, and debates over immigration policy.',
      body: String.raw`### Effects on the sending region
- **Remittances**: money migrants send home. In some countries remittances are a large share of the economy.
- **Brain drain**: loss of educated, skilled workers (doctors, engineers). The reverse, **brain gain**, benefits the receiving country.
- **Demographic change**: fewer young adults, often more men leaving than women, so communities age and gender roles shift.

### Effects on the receiving region
- **Economic**: fills labor shortages in farming, construction, health care and tech; adds taxpayers and consumers.
- **Cultural**: **ethnic enclaves** (Chinatowns, Little Havana), new foods, languages and religions; cultural diffusion in both directions.
- **Political**: debates over immigration policy, border control and citizenship; shifts in voting patterns.

### Historical and contemporary examples
- The **Great Migration** (about 1910–1970) moved millions of Black Americans from the rural South to Northern and Western cities, reshaping politics and culture.
- **Syrian refugees** after 2011 changed the populations and politics of Turkey, Lebanon, Jordan and Germany.

On the exam, name the effect, say whether it falls on the sending or receiving place, and explain it with a specific example.`,
      blocks: [],
      precheck: {
        question: 'Money that migrants send back to family in their home country is called',
        choices: ['remittances', 'brain drain', 'chain migration', 'counterflow'],
        answer: 0,
        explanations: [
          'Correct. Remittances can be a major source of income for sending countries.',
          'Incorrect. Brain drain is the loss of skilled workers.',
          'Incorrect. Chain migration is following earlier migrants.',
          'Incorrect. A counterflow is migration in the opposite direction.',
        ],
      },
      checkpoints: [
        {
          question: 'Many doctors trained in a lower-income country emigrate to higher-income countries. What is the effect on the sending country?',
          choices: ['Brain drain', 'Brain gain', 'An ethnic enclave', 'Transhumance'],
          answer: 0,
          explanations: [
            'Correct. The sending country loses skilled workers it trained.',
            'Incorrect. The receiving countries gain; the sending country loses.',
            'Incorrect. Enclaves form in receiving places.',
            'Incorrect. Transhumance is seasonal herding.',
          ],
        },
        {
          question: 'Which is a cultural effect of migration on a receiving city?',
          choices: [
            'New ethnic neighborhoods with their own restaurants, languages and places of worship',
            'Remittances sent abroad',
            'A smaller labor force',
            'A higher dependency ratio in the sending country',
          ],
          answer: 0,
          explanations: [
            'Correct. Ethnic enclaves and cultural diffusion are cultural effects.',
            'Incorrect. Remittances are an economic effect, mainly for the sending country.',
            'Incorrect. Immigration usually enlarges the labor force.',
            'Incorrect. That affects the sending country and is demographic.',
          ],
        },
      ],
      revisit:
        'Sending places: remittances, brain drain, aging, gender shifts. Receiving places: labor, ethnic enclaves, cultural diffusion, ' +
        'immigration politics. Examples: Great Migration, Syrian refugees. Name the effect, the place and an example.',
    },
  ],
};

export default pack;
