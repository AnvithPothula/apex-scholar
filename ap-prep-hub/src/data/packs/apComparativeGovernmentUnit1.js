/**
 * AP Comparative Government and Politics Unit 1: Political Systems, Regimes,
 * and Governments — study pack.
 *
 * Written against the AP Comparative Government and Politics CED effective
 * Fall 2026 (topics 1.1–1.10). Uses the six course countries (China, Iran,
 * Mexico, Nigeria, Russia, the United Kingdom) for every concept, since the
 * exam asks students to apply ideas to them. Two sorting activities: state /
 * nation / regime / government, and federal vs. unitary systems.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-comparative-government-and-politics/unit-1',
  subject: 'AP Government and Politics: Comparative',
  unit: 'Unit 1: Political Systems, Regimes, and Governments',
  examWeight: '18–27% of the exam',
  intro:
    'The vocabulary and tools of comparative politics, applied to the six course countries: China, Iran, Mexico, Nigeria, Russia ' +
    'and the United Kingdom. How political scientists use data, what separates a state from a nation or a regime from a government, ' +
    'democracy vs. authoritarianism, how regimes democratize, where power and legitimacy come from, and what keeps a state stable.',
  sections: [
    {
      id: '1.1',
      ced: 'MPA-1.A',
      title: 'The Practice of Political Scientists',
      minutes: 6,
      summary:
        'Political scientists compare countries using quantitative and qualitative evidence. Causation is hard to prove because many ' +
        'variables interact, so they separate correlation from causation and empirical from normative statements. Common data sources ' +
        'include the HDI, GDP and GDP per capita, GDP growth, the Gini index, Freedom House, Transparency International and the Failed States Index.',
      body: String.raw`### How knowledge is built
- **Quantitative** data (numbers in charts, tables, graphs) and **qualitative** data (speeches, documents, cartoons, maps, commentary) both support comparisons.
- **Correlation**: two variables move together. **Causation**: one actually produces the other. In comparative politics causation is hard to prove, because many variables affect stability or policy at once and you can't run a controlled experiment on a country.
- **Empirical** statement: factual, testable ("Nigeria has 36 states"). **Normative** statement: a value judgment ("Nigeria should have fewer states"). The exam expects you to tell them apart and argue from empirical evidence.

### The data sources
| Measure | What it tells you | Reading it |
|---|---|---|
| **Human Development Index (HDI)** | Combines life expectancy, education and income | 0–1; **higher** = more developed |
| **GDP** | Total value of goods and services | Size of the economy |
| **GDP per capita** | GDP ÷ population | Average income level; better for comparing living standards |
| **GDP growth rate** | % change in GDP per year | How fast the economy is growing |
| **Gini index** | Income inequality | 0 = perfect equality, 1 (or 100) = one person has everything; **higher = more unequal** |
| **Freedom House** | Political rights and civil liberties | Free / Partly Free / Not Free |
| **Transparency International** (Corruption Perceptions Index) | Perceived public-sector corruption | 0–100; **higher = cleaner** |
| **Failed States Index** (now the Fragile States Index) | Risk of state collapse | **Higher = more fragile** |

Watch the directions: a high Gini score is bad for equality, but a high Transparency score is good.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Empirical vs. normative', back: 'Empirical: factual and testable. Normative: a value judgment about what should be.' },
            { front: 'Correlation vs. causation', back: 'Correlation: variables move together. Causation: one produces the other; hard to prove in comparative politics.' },
            { front: 'Gini index', back: 'Measures income inequality; higher means more unequal.' },
            { front: 'Human Development Index', back: 'Combines life expectancy, education and income; higher means more developed.' },
            { front: 'Transparency International', back: 'Corruption Perceptions Index, 0–100; higher means less perceived corruption.' },
          ],
        },
      ],
      precheck: {
        question: 'Which is a normative statement?',
        choices: [
          'Russia should allow more opposition parties to compete in elections.',
          'Russia\'s president serves a six-year term.',
          'Russia\'s GDP growth rate fell last year.',
          'Russia is a federal system.',
        ],
        answer: 0,
        explanations: [
          'Correct. "Should" signals a value judgment.',
          'Incorrect. That is a checkable fact, so it\'s empirical.',
          'Incorrect. That is a measurable fact.',
          'Incorrect. That is a factual description of its structure.',
        ],
      },
      checkpoints: [
        {
          question: 'Country A has a Gini index of 0.45 and Country B has 0.30. What can you conclude?',
          choices: [
            'Income is more unequally distributed in Country A',
            'Country A is more democratic',
            'Country A has a larger economy',
            'Country B is more corrupt',
          ],
          answer: 0,
          explanations: [
            'Correct. A higher Gini means more inequality.',
            'Incorrect. The Gini index doesn\'t measure democracy.',
            'Incorrect. It measures distribution, not size.',
            'Incorrect. It says nothing about corruption.',
          ],
        },
        {
          question: 'Why is causation especially hard to establish in comparative politics?',
          choices: [
            'Many variables influence political outcomes at once and can\'t be isolated',
            'Political scientists don\'t use data',
            'Correlation never exists between political variables',
            'All countries have identical political systems',
          ],
          answer: 0,
          explanations: [
            'Correct. You can\'t run controlled experiments on whole countries.',
            'Incorrect. They rely heavily on data.',
            'Incorrect. Correlations are common; proving causation is the hard part.',
            'Incorrect. Countries differ, which is why we compare them.',
          ],
        },
      ],
      revisit:
        'Use quantitative and qualitative data. Correlation ≠ causation (hard to prove). Empirical = fact, normative = value. HDI, GDP, ' +
        'GDP per capita, growth, Gini (higher = less equal), Freedom House, Transparency International (higher = cleaner), Failed States Index.',
    },
    {
      id: '1.2',
      ced: 'PAU-1.A',
      title: 'Defining Political Organizations',
      minutes: 5,
      summary:
        'A state combines a permanent population, governing institutions and a defined territory with international recognition. A ' +
        'regime is the fundamental rules for gaining and using power, and usually outlasts governments. A government is the people and ' +
        'institutions making binding decisions now. A nation is a people with shared identity. Sovereignty is a state\'s right to govern itself.',
      body: String.raw`### The four terms
| Term | Definition | Example |
|---|---|---|
| **State** | Permanent population + governing institutions + defined territory + **international recognition** | Nigeria, the UK |
| **Nation** | A group with shared identity: language, religion, ethnicity, history, political aspirations | The Scots, the Yoruba, the Kurds |
| **Regime** | The **fundamental rules** controlling access to and use of power; usually lasts through many governments | Iran's Islamic Republic since 1979; the UK's parliamentary democracy |
| **Government** | The specific **people and institutions** with legal power to make binding decisions right now | The current UK prime minister and cabinet |

### Key distinctions
- **States vs. nations**: they rarely match perfectly. The UK is one state with several nations (English, Scottish, Welsh, Northern Irish). Nigeria contains hundreds of ethnic groups. The Kurds are a nation without a state, spread across Iran, Iraq, Turkey and Syria.
- **Regimes vs. governments**: governments change often (an election replaces the ruling party); regimes change rarely (a revolution replaces the whole system).
- **Political system**: the laws, ideas and procedures that decide who rules and how much the government shapes people's lives and the economy.
- **Sovereignty**: a state's independent legal authority over its people and territory, free from outside interference.
- **Regimes** are classed as **democratic** or **authoritarian** by how they set rules and make decisions.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'State, nation, regime or government?',
            buckets: ['State', 'Nation', 'Regime', 'Government'],
            items: [
              { label: 'Nigeria: its territory, population, institutions and recognition by other countries', bucket: 0, why: 'All four parts of statehood together.' },
              { label: 'The Kurds, who share a language and identity across four countries', bucket: 1, why: 'A people with shared identity but no state of their own.' },
              { label: 'The Scots within the United Kingdom', bucket: 1, why: 'A nation inside a larger, multinational state.' },
              { label: 'Iran\'s system of clerical rule established after 1979', bucket: 2, why: 'The fundamental rules for power, lasting across many governments.' },
              { label: 'The UK prime minister and cabinet currently in office', bucket: 3, why: 'The specific people making decisions now; they change with elections.' },
              { label: 'Mexico\'s current president and administration', bucket: 3, why: 'An officeholder and team who will be replaced after a term.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which best describes a regime?',
        choices: [
          'The fundamental rules that control access to and the use of power',
          'The officials currently running the country',
          'A group of people with a shared language and culture',
          'A territory recognized by other countries',
        ],
        answer: 0,
        explanations: [
          'Correct. Regimes are the basic rules of the political game.',
          'Incorrect. That is a government.',
          'Incorrect. That is a nation.',
          'Incorrect. Recognition is part of statehood.',
        ],
      },
      checkpoints: [
        {
          question: 'The UK\'s Conservative Party lost power to the Labour Party in a general election. This is a change in:',
          choices: ['Government', 'Regime', 'State', 'Nation'],
          answer: 0,
          explanations: [
            'Correct. The people in power changed; the rules of the system did not.',
            'Incorrect. The UK\'s parliamentary democracy stayed the same.',
            'Incorrect. The UK\'s territory and recognition didn\'t change.',
            'Incorrect. National identities didn\'t change.',
          ],
        },
        {
          question: 'The Kurds are best described as:',
          choices: ['A nation without a state', 'A state without a nation', 'A regime', 'A government'],
          answer: 0,
          explanations: [
            'Correct. They share an identity but have no sovereign state.',
            'Incorrect. That reverses the terms.',
            'Incorrect. A regime is a set of rules for power.',
            'Incorrect. A government is the people in power in a state.',
          ],
        },
      ],
      revisit:
        'State = population + institutions + territory + recognition. Nation = shared identity. Regime = basic rules for power (lasts). ' +
        'Government = people in power now (changes). Sovereignty = independent authority over a territory.',
    },
    {
      id: '1.3',
      ced: 'PAU-1.B',
      title: 'Democracy vs. Authoritarianism',
      minutes: 5,
      summary:
        'How democratic or authoritarian a state is depends on rule of law, state control of the media, free and fair elections, ' +
        'transparency and citizen participation. Democratic branches tend to be independent of one another. Authoritarian regimes ' +
        'include illiberal or hybrid regimes, one-party states, theocracies, totalitarian governments and military regimes.',
      body: String.raw`### Five indicators (rule of law)
| Indicator | More democratic | More authoritarian |
|---|---|---|
| **Rule of law** | Laws apply to everyone, including leaders | Officials make arbitrary decisions |
| **Media** | Independent press | State controls or censors media |
| **Elections** | Free, fair, competitive | Rigged, uncompetitive or absent |
| **Transparency** | Decisions made in the open | Secret decision making |
| **Citizen participation** | Voluntary and meaningful | Restricted or mobilized by the state |

**Independent branches** are more likely in democracies, which keeps any one branch from controlling all power.

### Types of authoritarian regime
| Type | Description | Course example |
|---|---|---|
| **Illiberal democracy / hybrid** | Elections happen, but civil liberties and fair competition are limited | Russia (in the 2000s); Nigeria is often called hybrid |
| **One-party state** | A single party monopolizes power | China (Chinese Communist Party) |
| **Theocracy** | Religious leaders rule by religious law | Iran (Supreme Leader, Islamic law) |
| **Totalitarian** | The state seeks total control of public and private life | Not a course country today (e.g., North Korea) |
| **Military regime** | The armed forces rule | Nigeria for most of 1966–1999 |

### Where the course countries fall (Freedom House)
**Free**: the United Kingdom. **Partly Free**: Mexico, Nigeria. **Not Free**: Russia, Iran, China. Ratings change over time, so cite them as evidence, not permanent facts.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Rule of law', back: 'A state governed by laws that apply to everyone, not by the arbitrary decisions of officials.' },
            { front: 'Illiberal (hybrid) democracy', back: 'Holds elections but restricts civil liberties and fair competition.' },
            { front: 'Theocracy', back: 'Rule by religious leaders according to religious law (e.g., Iran).' },
            { front: 'One-party state', back: 'One party monopolizes political power (e.g., China).' },
          ],
        },
      ],
      precheck: {
        question: 'Which characteristic most clearly indicates an authoritarian regime?',
        choices: [
          'The state controls most media outlets',
          'Courts can rule against the executive',
          'Multiple parties compete in fair elections',
          'Government budgets are published openly',
        ],
        answer: 0,
        explanations: [
          'Correct. State control of the media limits accountability.',
          'Incorrect. Independent courts are a democratic feature.',
          'Incorrect. Fair, competitive elections are democratic.',
          'Incorrect. Transparency is a democratic feature.',
        ],
      },
      checkpoints: [
        {
          question: 'Iran is best classified as which type of authoritarian regime?',
          choices: ['Theocracy', 'Military regime', 'Totalitarian government', 'Consolidated democracy'],
          answer: 0,
          explanations: [
            'Correct. Clerics led by the Supreme Leader hold ultimate authority under Islamic law.',
            'Incorrect. Iran is ruled by clerics, not the military (though the military is powerful).',
            'Incorrect. Iran is not usually classed as totalitarian.',
            'Incorrect. Iran is authoritarian.',
          ],
        },
        {
          question: 'A country holds regular elections, but opposition candidates are often barred and the media favor the ruling party. This best describes:',
          choices: ['An illiberal (hybrid) democracy', 'A consolidated democracy', 'A theocracy', 'A military regime'],
          answer: 0,
          explanations: [
            'Correct. Elections exist but aren\'t fully free or fair.',
            'Incorrect. Consolidated democracies have fair competition and a free press.',
            'Incorrect. Nothing suggests rule by religious leaders.',
            'Incorrect. Nothing suggests the army is in charge.',
          ],
        },
      ],
      revisit:
        'Indicators: rule of law, media freedom, free and fair elections, transparency, citizen participation; independent branches in ' +
        'democracies. Authoritarian types: illiberal/hybrid, one-party (China), theocracy (Iran), totalitarian, military (past Nigeria).',
    },
    {
      id: '1.4',
      ced: 'PAU-1.C',
      title: 'Democratization',
      minutes: 6,
      summary:
        'Democratization is a transition from authoritarian to democratic rule, aiming at fair elections, participation, universal ' +
        'suffrage, transparency, protected rights, equal treatment and the rule of law. Electoral rules can include more groups, ' +
        'corruption holds it back, it can stall or reverse, and consolidation makes reversal unlikely.',
      body: String.raw`### Goals of democratization
More **competitive, fair and transparent elections** · more **citizen participation** · **universal adult suffrage** · **government transparency** · protected **civil rights and liberties** · **equal treatment** · the **rule of law**.

### Tools that help
- **Electoral rule changes** can include more groups and increase multiparty competition: **gender or cultural quotas** (Mexico requires gender parity in candidate lists), **proportional representation**, and changes to **vote thresholds** and **district boundaries**.
- **Independent judiciaries** reduce corruption and protect rights. **Corruption** holds democratization back.
- **Consensus** among competing groups on democratic and economic policies makes the process last.

### It can stall or reverse
Changes to election rules or civil liberties can push either way. **Russia** democratized in the 1990s, then backslid under Putin as elections became less competitive and the media came under state control.

### Course country examples
- **Mexico**: the PRI ruled for 71 years; an independent electoral institute (created 1990) helped make elections competitive, and the PAN's Vicente Fox won the presidency in **2000**.
- **Nigeria**: civilian rule returned in **1999**; in **2015** an opposition candidate (Buhari) defeated a sitting president (Jonathan), the first peaceful transfer between parties.

### Democratic consolidation
A democracy is **consolidated** when its election rules, separation of powers and civil liberties are so established that reverting to authoritarianism is unlikely without an outside shock. The **UK** is the course's consolidated democracy.`,
      blocks: [],
      precheck: {
        question: 'Democratic consolidation refers to:',
        choices: [
          'A democracy maturing so that reverting to authoritarianism is unlikely',
          'A military takeover that restores order',
          'Combining several states into one',
          'A single party winning every election',
        ],
        answer: 0,
        explanations: [
          'Correct. Established rules, separation of powers and protected liberties make democracy durable.',
          'Incorrect. A coup ends democracy.',
          'Incorrect. That isn\'t what the term means.',
          'Incorrect. One-party dominance suggests the opposite.',
        ],
      },
      checkpoints: [
        {
          question: 'Mexico\'s 2000 presidential election is significant because:',
          choices: [
            'The PRI lost the presidency after 71 years in power',
            'The military took control of the government',
            'Mexico became a theocracy',
            'Mexico switched to a unitary system',
          ],
          answer: 0,
          explanations: [
            'Correct. Vicente Fox of the PAN won, a key step in democratization.',
            'Incorrect. It was a peaceful election, not a coup.',
            'Incorrect. Mexico is a secular republic.',
            'Incorrect. Mexico remains federal.',
          ],
        },
        {
          question: 'Which change would most likely increase multiparty competition in a democracy?',
          choices: [
            'Adopting proportional representation',
            'Banning opposition parties',
            'Raising the vote threshold to win any seats to 25%',
            'Placing the media under state control',
          ],
          answer: 0,
          explanations: [
            'Correct. PR gives smaller parties seats in proportion to their votes.',
            'Incorrect. That eliminates competition.',
            'Incorrect. A high threshold shuts out smaller parties.',
            'Incorrect. State media control weakens competition.',
          ],
        },
      ],
      revisit:
        'Goals: fair elections, participation, suffrage, transparency, rights, equality, rule of law. Helped by electoral rules (quotas, ' +
        'PR), independent courts, consensus; hurt by corruption; can reverse (Russia). Mexico 2000, Nigeria 1999/2015. Consolidation: UK.',
    },
    {
      id: '1.5',
      ced: 'PAU-1.D.1',
      title: 'Sources of Power and Authority',
      minutes: 5,
      summary:
        'Power and authority come from constitutions, religion, the military, political parties, legislatures and popular support. In ' +
        'China the Party controls the military; Iran became a theocracy in 1979; Nigeria and Mexico became multiparty republics; Russia ' +
        'is a managed democracy; the UK devolved power to keep stability.',
      body: String.raw`### Sources of power
Constitutions · religion · military force · political parties · legislatures · popular support.

### How each course country shows it
| Country | Source of power | What happened |
|---|---|---|
| **China** | **Party** control of the **military** | The Chinese Communist Party commands the People's Liberation Army, which keeps the regime stable |
| **Iran** | **Religion** | The **1979 Revolution** replaced the Shah's dictatorship with a **theocracy** based on Islamic (Sharia) law |
| **Nigeria** | Constitution, elections | Moved from **military rule** to a **multiparty republic** (1999) |
| **Mexico** | Constitution, elections | Moved from **single-party dominance** (the PRI) to a **multiparty republic** |
| **Russia** | Elite backing of a strong president | A **managed democracy**: elections happen, but rules favor one party (United Russia) |
| **UK** | Constitutional reform, parliament | **Devolution** (1998–99) created parliaments or assemblies for Scotland, Wales and Northern Ireland, easing pressure and keeping the regime stable |`,
      blocks: [],
      precheck: {
        question: 'After the 1979 Revolution, Iran\'s main source of political authority became:',
        choices: ['Islamic religious law and clerics', 'The British monarchy', 'A military junta', 'A communist party'],
        answer: 0,
        explanations: [
          'Correct. Iran became a theocracy based on Sharia law.',
          'Incorrect. That is unrelated to Iran.',
          'Incorrect. Clerics, not generals, took power.',
          'Incorrect. That describes China.',
        ],
      },
      checkpoints: [
        {
          question: 'The Chinese Communist Party\'s control over the People\'s Liberation Army is best used as evidence of:',
          choices: [
            'Military force as a source of power that maintains regime stability',
            'Democratic consolidation in China',
            'Federalism in China',
            'Religious authority in China',
          ],
          answer: 0,
          explanations: [
            'Correct. Party control of the army helps keep the regime in power.',
            'Incorrect. China is an authoritarian one-party state.',
            'Incorrect. China is unitary.',
            'Incorrect. The Party is officially atheist.',
          ],
        },
        {
          question: 'Why did the UK devolve power to Scotland, Wales and Northern Ireland?',
          choices: [
            'To ease regional demands for self-rule and keep the regime stable',
            'To abolish the UK Parliament',
            'To become a federal system with a written constitution',
            'To end the monarchy',
          ],
          answer: 0,
          explanations: [
            'Correct. Devolution gave regions some self-government while Parliament stayed sovereign.',
            'Incorrect. Parliament remains sovereign.',
            'Incorrect. The UK is still unitary and has an uncodified constitution.',
            'Incorrect. The monarchy remains.',
          ],
        },
      ],
      revisit:
        'Sources: constitutions, religion, military, parties, legislatures, popular support. China: Party controls army. Iran: 1979 ' +
        'theocracy. Nigeria/Mexico: to multiparty republics. Russia: managed democracy. UK: devolution for stability.',
    },
    {
      id: '1.6',
      ced: 'PAU-1.D.2–4',
      title: 'Change in Power and Authority',
      minutes: 4,
      summary:
        'Democracies can keep sovereignty using less force than authoritarian regimes. Regimes change when rules and institutions are ' +
        'replaced, slowly or suddenly, through elections, coups or revolutions. Governments change more often and more easily, usually ' +
        'through elections, appointments and succession, but sometimes violently, as in Iran and Nigeria.',
      body: String.raw`### Using power
**Democratic** regimes can maintain sovereignty with **less coercion**, because people accept their authority. **Authoritarian** regimes rely more on force, surveillance and control.

### Regime change vs. government change
| | **Regime change** | **Government change** |
|---|---|---|
| What changes | The fundamental rules and institutions | The people in office |
| How often | Rarely | Often |
| How | Gradual reform or sudden break: elections, **coups**, or **revolutions** with broad popular support | Usually peaceful: **elections, appointments, lines of succession**; sometimes violent |
| Example | Iran 1979 (monarchy → theocracy) | A new UK prime minister after an election |

### Violent transitions in course countries
- **Iran**: the **1979 Revolution** overthrew the Shah.
- **Nigeria**: repeated **military coups** (1966, 1975, 1983, 1985, 1993) before civilian rule returned in 1999.

### Incremental change
**Mexico** changed regime gradually: electoral reforms over the 1990s made elections competitive without a revolution.`,
      blocks: [],
      precheck: {
        question: 'Which is the best example of a change in regime rather than a change in government?',
        choices: [
          'Iran\'s 1979 Revolution replacing the monarchy with a theocracy',
          'A new prime minister taking office in the UK after an election',
          'Mexico electing a new president for a six-year term',
          'A Nigerian governor being replaced after an election',
        ],
        answer: 0,
        explanations: [
          'Correct. The fundamental rules of the political system changed.',
          'Incorrect. The UK\'s rules stayed the same; only the government changed.',
          'Incorrect. That is a routine change of government.',
          'Incorrect. That is a change of officeholder.',
        ],
      },
      checkpoints: [
        {
          question: 'Nigeria\'s history of coups d\'état is best used as evidence that:',
          choices: [
            'Governments can change through violent means',
            'Nigeria has always been a consolidated democracy',
            'Regimes never change',
            'Elections are the only way governments change',
          ],
          answer: 0,
          explanations: [
            'Correct. Military takeovers repeatedly replaced Nigerian governments.',
            'Incorrect. Nigeria was under military rule for decades.',
            'Incorrect. Nigeria\'s regime changed several times.',
            'Incorrect. Coups are a non-electoral route.',
          ],
        },
        {
          question: 'Why can democratic regimes generally maintain sovereignty using less power than authoritarian regimes?',
          choices: [
            'Citizens accept their authority as legitimate, so less coercion is needed',
            'Democracies have no militaries',
            'Democracies never face internal threats',
            'Authoritarian regimes have weaker armies',
          ],
          answer: 0,
          explanations: [
            'Correct. Consent reduces the need for force.',
            'Incorrect. Democracies have militaries.',
            'Incorrect. They do face threats.',
            'Incorrect. Army strength isn\'t the reason.',
          ],
        },
      ],
      revisit:
        'Democracies need less coercion. Regime change (rules) is rare: elections, coups, revolutions. Government change (people) is ' +
        'frequent: elections, appointments, succession, sometimes violence (Iran 1979, Nigeria\'s coups).',
    },
    {
      id: '1.7',
      ced: 'PAU-2.A',
      title: 'Federal and Unitary Systems',
      minutes: 5,
      summary:
        'Federal states (Mexico, Nigeria, Russia) divide power among levels of government, giving regions some autonomy over services ' +
        'like education. Unitary states (China, Iran, the UK) concentrate power nationally for uniform, potentially more efficient ' +
        'policy. The degree of centralization changes over time in response to ethnic divisions, supranational organizations and other countries.',
      body: String.raw`| | **Federal** | **Unitary** |
|---|---|---|
| Power | **Divided** between national and regional governments, protected by the constitution | **Concentrated** in the national government; local units exist at its discretion |
| Course countries | **Mexico, Nigeria, Russia** | **China, Iran, United Kingdom** |
| Why adopt it | Large size, **ethnic or regional diversity**, local autonomy over services like education | **Uniform** policies, potentially **more efficient** policymaking, national unity |

### Centralization changes over time
- **Russia**: federal on paper, but Putin recentralized power, for example by replacing elected regional governors with presidential appointees from 2004 to 2012.
- **UK**: unitary, but **devolution** gave Scotland, Wales and Northern Ireland their own legislatures (asymmetric devolution).
- **Nigeria**: grew from 3 regions to **36 states** largely to manage ethnic and regional cleavages.
- **Supranational organizations** matter too: the UK shared some sovereignty with the **European Union** until **Brexit** (left in 2020).`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Federal or unitary?',
            buckets: ['Federal', 'Unitary'],
            items: [
              { label: 'Mexico', bucket: 0, why: '31 states plus Mexico City share power with the national government.' },
              { label: 'Nigeria', bucket: 0, why: '36 states and a federal capital territory.' },
              { label: 'Russia', bucket: 0, why: 'Federal in its constitution, though power has been recentralized.' },
              { label: 'China', bucket: 1, why: 'Power is concentrated in the national government and the Party.' },
              { label: 'Iran', bucket: 1, why: 'Provinces carry out national policy.' },
              { label: 'United Kingdom', bucket: 1, why: 'Unitary with devolution: Parliament remains sovereign.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which course country is a unitary state that has devolved some power to regional legislatures?',
        choices: ['The United Kingdom', 'Nigeria', 'Mexico', 'Russia'],
        answer: 0,
        explanations: [
          'Correct. Scotland, Wales and Northern Ireland have devolved legislatures, but Parliament stays sovereign.',
          'Incorrect. Nigeria is federal.',
          'Incorrect. Mexico is federal.',
          'Incorrect. Russia is federal.',
        ],
      },
      checkpoints: [
        {
          question: 'A country with deep ethnic and regional divisions is most likely to adopt federalism in order to:',
          choices: [
            'Give regions autonomy and reduce conflict',
            'Make all policies identical nationwide',
            'Eliminate regional governments',
            'Concentrate all power in the capital',
          ],
          answer: 0,
          explanations: [
            'Correct. Local autonomy can accommodate diverse groups, as in Nigeria.',
            'Incorrect. Uniform policy is a unitary advantage.',
            'Incorrect. Federalism protects regional governments.',
            'Incorrect. That is the unitary approach.',
          ],
        },
        {
          question: 'Putin\'s appointment of regional governors (2004–2012) is best used as evidence that:',
          choices: [
            'The degree of centralization can change over time in a federal state',
            'Russia became a unitary state by law',
            'Russia devolved more power to its regions',
            'Russia joined the European Union',
          ],
          answer: 0,
          explanations: [
            'Correct. Russia stayed federal on paper but centralized power in practice.',
            'Incorrect. Russia\'s constitution still describes a federation.',
            'Incorrect. It did the opposite.',
            'Incorrect. Russia isn\'t an EU member.',
          ],
        },
      ],
      revisit:
        'Federal: Mexico, Nigeria, Russia (divided power, regional autonomy). Unitary: China, Iran, UK (concentrated, uniform). ' +
        'Centralization shifts: Russia recentralized, UK devolved, Nigeria\'s 36 states, Brexit.',
    },
    {
      id: '1.8',
      ced: 'LEG-1.A',
      title: 'Political Legitimacy',
      minutes: 4,
      summary:
        'Legitimacy is citizens\' belief that the government has the right to use power as it does; it gives a regime authority and ' +
        'can increase its power. Sources include elections and constitutions, plus nationalism, tradition, effectiveness, economic ' +
        'growth, ideology, religion and the ruling party\'s endorsement.',
      body: String.raw`**Legitimacy** = whether people believe their government has the **right** to rule and use power the way it does. Legitimacy turns raw power into **authority**: people obey because they accept the rules, not just from fear.

### Sources, with course examples
| Source | Example |
|---|---|
| **Popular elections** | UK general elections; Mexican presidential elections |
| **Constitutional provisions** | Nigeria's 1999 constitution; Mexico's 1917 constitution |
| **Nationalism** | Russia's leaders appealing to national pride and great-power status |
| **Tradition** | The UK monarchy |
| **Governmental effectiveness** | Delivering services and security |
| **Economic growth** | China's rapid growth since the 1980s ("performance legitimacy") |
| **Ideology** | China's official socialist ideology |
| **Religious heritage and organizations** | Iran's Islamic Republic and the Supreme Leader |
| **Dominant party's endorsement** | Candidates backed by the CCP in China or United Russia |

Both democratic **and** authoritarian regimes can draw on elections and constitutions. Authoritarian regimes often lean harder on growth, nationalism, ideology or religion.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Legitimacy', back: 'Citizens\' belief that the government has the right to rule and use power as it does.' },
            { front: 'Performance legitimacy', back: 'Legitimacy earned by delivering results such as economic growth (e.g., China).' },
            { front: 'Traditional legitimacy', back: 'Authority rooted in long-standing customs and institutions (e.g., the UK monarchy).' },
          ],
        },
      ],
      precheck: {
        question: 'China\'s leaders point to decades of rapid economic growth to justify their rule. This is an example of legitimacy based on:',
        choices: ['Economic growth', 'Tradition', 'Religious heritage', 'Free and fair elections'],
        answer: 0,
        explanations: [
          'Correct. Performance, especially growth, is a key source of the CCP\'s legitimacy.',
          'Incorrect. Tradition would mean long-standing customs like a monarchy.',
          'Incorrect. The CCP is officially atheist.',
          'Incorrect. China doesn\'t hold competitive national elections.',
        ],
      },
      checkpoints: [
        {
          question: 'Which source of legitimacy is most central to Iran\'s regime?',
          choices: ['Religious heritage and organizations', 'A hereditary monarchy', 'Communist ideology', 'Military rule'],
          answer: 0,
          explanations: [
            'Correct. The Islamic Republic grounds its authority in Shia Islam and clerical leadership.',
            'Incorrect. The monarchy was overthrown in 1979.',
            'Incorrect. That fits China.',
            'Incorrect. Iran is ruled by clerics, not the army.',
          ],
        },
        {
          question: 'Which statement about legitimacy is accurate?',
          choices: [
            'Both democratic and authoritarian regimes can draw legitimacy from elections and constitutions',
            'Only democracies can have legitimacy',
            'Legitimacy means a government uses more force',
            'Legitimacy can only come from religion',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED names these sources for both regime types.',
            'Incorrect. Authoritarian regimes can be seen as legitimate too.',
            'Incorrect. Legitimacy reduces the need for force.',
            'Incorrect. There are many sources.',
          ],
        },
      ],
      revisit:
        'Legitimacy = belief in the right to rule; gives authority. Sources: elections, constitutions, nationalism, tradition, ' +
        'effectiveness, economic growth, ideology, religion, party endorsement.',
    },
    {
      id: '1.9',
      ced: 'LEG-1.B',
      title: 'Sustaining Legitimacy',
      minutes: 5,
      summary:
        'Governments keep legitimacy through policy effectiveness, political efficacy, tradition, charismatic leadership and ' +
        'institutionalized laws. Peaceful conflict resolution and transfers of power, less corruption and economic development reinforce ' +
        'it; corruption, less electoral competition and serious problems undermine it. Devolution can help or hurt, and disputed elections can spark protests.',
      body: String.raw`### Ways to maintain legitimacy
**Policy effectiveness** · **political efficacy** (citizens' belief that they can influence government) · **tradition** · **charismatic leadership** · **institutionalized laws** (rules that are followed predictably).

| Reinforces legitimacy | Undermines legitimacy |
|---|---|
| Peaceful resolution of conflicts | Rising corruption |
| Peaceful transfers of power | Less electoral competition |
| Reduced corruption | A poor economy |
| Economic development | Social conflict |

### Devolution: a double-edged tool
| Can **enhance** legitimacy by | Can **weaken** legitimacy by |
|---|---|
| Policy innovation and matching policy to local needs | Contradictory policies across regions |
| Competition that improves policy | Complicated, inefficient implementation |
| More participation and a check on central power | Inequality between regions |
| Better representation of religious, ethnic and minority groups | More competition for resources; worse ethnic tensions |

Nigeria shows both: states let different groups govern themselves (some northern states use Sharia criminal law), but that also sharpens religious and regional tensions.

### Disputed elections
Questions about election integrity can trigger **protests** that weaken legitimacy and democratization: **Iran's 2009** Green Movement after the disputed presidential result; **Russia's 2011–12** protests over parliamentary elections; Mexico's contested **2006** presidential race.`,
      blocks: [],
      precheck: {
        question: 'Which would most likely undermine a government\'s legitimacy?',
        choices: [
          'A major corruption scandal involving top officials',
          'A peaceful transfer of power after an election',
          'Steady economic growth',
          'Courts resolving a dispute peacefully',
        ],
        answer: 0,
        explanations: [
          'Correct. Corruption erodes trust in the government\'s right to rule.',
          'Incorrect. Peaceful transfers reinforce legitimacy.',
          'Incorrect. Growth tends to reinforce it.',
          'Incorrect. Peaceful conflict resolution reinforces it.',
        ],
      },
      checkpoints: [
        {
          question: 'Which is a way devolution can weaken legitimacy?',
          choices: [
            'Creating inequality and contradictory policies between regions',
            'Allowing better representation of minority groups',
            'Matching policies to local needs',
            'Increasing political participation',
          ],
          answer: 0,
          explanations: [
            'Correct. Uneven outcomes and conflicting rules can breed resentment.',
            'Incorrect. That is a way devolution can enhance legitimacy.',
            'Incorrect. That is a benefit.',
            'Incorrect. That is a benefit.',
          ],
        },
        {
          question: 'Iran\'s 2009 protests after the disputed presidential election are best used as evidence that:',
          choices: [
            'Questions about election integrity can weaken legitimacy',
            'Iran is a consolidated democracy',
            'Devolution strengthened Iran\'s regime',
            'Elections always strengthen authoritarian regimes',
          ],
          answer: 0,
          explanations: [
            'Correct. Mass protests challenged the regime\'s claim to a fair mandate.',
            'Incorrect. Iran is an authoritarian theocracy.',
            'Incorrect. Iran is unitary; devolution wasn\'t involved.',
            'Incorrect. Disputed elections can do the opposite.',
          ],
        },
      ],
      revisit:
        'Maintain: effectiveness, efficacy, tradition, charisma, institutionalized laws. Reinforce: peace, peaceful transfers, less ' +
        'corruption, growth. Undermine: corruption, less competition, crises. Devolution cuts both ways. Disputed elections → protests.',
    },
    {
      id: '1.10',
      ced: 'LEG-1.C',
      title: 'Political Stability',
      minutes: 5,
      summary:
        'Internal actors can strengthen or threaten stability and the rule of law. Course countries fight corruption, separatist ' +
        'violence, drug trafficking and discrimination in different ways, and respond differently to mass protests. States limit violent ' +
        'actors partly to attract investment, and pressure from protesters and civil society can produce reforms.',
      body: String.raw`### Fighting corruption
| Country | Approach |
|---|---|
| **China** | Xi Jinping's anti-corruption campaign (since 2012), which also removed political rivals |
| **Mexico** | National Anticorruption System (2016) |
| **Nigeria** | Economic and Financial Crimes Commission (EFCC) |
| **UK** | Independent courts, a free press, the Bribery Act (2010) |
| **Russia, Iran** | Campaigns that are often selective or politically targeted |

### Violence, crime and discrimination
- **Nigeria**: **Boko Haram**'s Islamist insurgency in the northeast; separatist pressure from Biafra activists in the southeast.
- **Mexico**: **drug cartels**; the government deployed the military from 2006 and created a National Guard in 2019.
- **Iran**: discrimination based on gender and religion; mass protests after Mahsa Amini died in morality police custody in **2022**.

### Responding to mass protests
| Response | Example |
|---|---|
| **Repression** | China's crackdown at Tiananmen Square (1989); Iran's response in 2009 and 2022 |
| **Concession** | Nigeria disbanded the SARS police unit after the 2020 #EndSARS protests |
| **Tolerance** | Large protests are generally allowed in the UK |

### Why stability matters
Every regime type tries to limit divisive and violent actors partly to attract **private capital** and **foreign direct investment (FDI)** and grow the economy.

### Reform from below
Protest groups and **civil society** can push governments to create new institutions or policies that protect civil liberties, improve transparency, make elections fairer, limit corruption and ensure equality under law, as in Mexico's independent electoral institute.`,
      blocks: [],
      precheck: {
        question: 'Nigeria disbanding the SARS police unit after the 2020 #EndSARS protests shows:',
        choices: [
          'Citizen protest leading to a policy change',
          'A military coup',
          'The creation of a theocracy',
          'Devolution to Scotland',
        ],
        answer: 0,
        explanations: [
          'Correct. Mass protest pressured the government into reform.',
          'Incorrect. No coup occurred.',
          'Incorrect. Nigeria\'s regime didn\'t change.',
          'Incorrect. That is the UK.',
        ],
      },
      checkpoints: [
        {
          question: 'Why might an authoritarian state crack down on violent groups even without democratic pressure?',
          choices: [
            'To attract foreign direct investment and promote economic growth',
            'To prepare for democratic consolidation',
            'Because international law requires elections',
            'To reduce its own legitimacy',
          ],
          answer: 0,
          explanations: [
            'Correct. Stability reassures investors, and growth supports the regime.',
            'Incorrect. Authoritarian regimes aren\'t trying to democratize.',
            'Incorrect. That isn\'t the motive.',
            'Incorrect. Regimes seek to raise legitimacy.',
          ],
        },
        {
          question: 'Which pair best contrasts state responses to mass protest?',
          choices: [
            'China repressed the Tiananmen protests, while the UK generally allows large protests',
            'Both China and the UK banned all protests',
            'Both Iran and Nigeria ignored protests completely',
            'Mexico and the UK both responded with military coups',
          ],
          answer: 0,
          explanations: [
            'Correct. Repression vs. tolerance.',
            'Incorrect. The UK permits protest.',
            'Incorrect. Iran repressed protests; Nigeria made a concession on SARS.',
            'Incorrect. Neither had a coup.',
          ],
        },
      ],
      revisit:
        'Internal actors can help or threaten stability. Anti-corruption efforts differ (China, Mexico, Nigeria, UK). Threats: Boko ' +
        'Haram, cartels, discrimination. Protest responses: repression, concession, tolerance. Stability attracts FDI. Civil society drives reform.',
    },
  ],
};

export default pack;
