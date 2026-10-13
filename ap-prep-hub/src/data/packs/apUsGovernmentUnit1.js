/**
 * AP U.S. Government and Politics Unit 1: Foundations of American Democracy — study pack.
 *
 * Written against the AP U.S. Government and Politics CED effective Fall 2026
 * (topics 1.1–1.9). Covers the required foundational documents (Declaration,
 * Articles, Constitution, Federalist No. 10 and 51, Brutus No. 1, the
 * Gettysburg Address) and both required Supreme Court cases for the unit,
 * McCulloch v. Maryland and United States v. Lopez. Activities: a founding-era
 * timeline and a sort of national, state and concurrent powers.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-us-government-and-politics/unit-1',
  subject: 'AP U.S. Government and Politics',
  unit: 'Unit 1: Foundations of American Democracy',
  examWeight: '15–22% of the exam',
  intro:
    'Why the government is built the way it is: the ideals in the Declaration, why the Articles of Confederation failed, the ' +
    'compromises that produced the Constitution, the Federalist vs. Anti-Federalist debate, separation of powers and checks and ' +
    'balances, and how power is split between the national government and the states.',
  sections: [
    {
      id: '1.1',
      ced: 'LO 1.1.A',
      title: 'Ideals of Democracy',
      minutes: 5,
      summary:
        'U.S. government rests on natural rights, the social contract, popular sovereignty and limited government. Limited government ' +
        'is kept by separation of powers, checks and balances, federalism and republicanism. The Declaration, the Constitution and the ' +
        'Gettysburg Address each express these ideals.',
      body: String.raw`### Four democratic ideals
| Ideal | Meaning | Where you see it |
|---|---|---|
| **Natural rights** | Everyone has rights that can't be taken away (John Locke: life, liberty, property) | Declaration: "life, liberty and the pursuit of happiness" |
| **Social contract** | People agree to give up some freedoms in exchange for order and protection | The Constitution itself |
| **Popular sovereignty** | All government power comes from the consent of the people | "We the People"; Declaration's "consent of the governed" |
| **Limited government** | Government's power can't be absolute | The Constitution's listed powers and the Bill of Rights |

### How limited government is kept
- **Separation of powers**: legislative, executive and judicial powers in different branches.
- **Checks and balances**: each branch can block the others.
- **Federalism**: power divided between national and state governments.
- **Republicanism**: the people elect representatives to govern for them.

### The founding documents
- **Declaration of Independence** (1776): drafted by **Thomas Jefferson** with help from Adams and Franklin. Restates natural rights; grounds government in popular sovereignty; when government violates rights, the people may alter or abolish it.
- **U.S. Constitution** (1787): drafted largely by **James Madison** at the Philadelphia Convention, which **George Washington** led, with Hamilton and the "Grand Committee." A **social contract** that sets up **limited government**.
- **Gettysburg Address** (1863): **Abraham Lincoln**, during the Civil War, reaffirmed **equality** ("all men are created equal") and **popular sovereignty** ("government of the people, by the people, for the people").`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Natural rights', back: 'Rights all people have that government can\'t take away (Locke: life, liberty, property).' },
            { front: 'Social contract', back: 'People give up some freedoms to government in exchange for order and protection.' },
            { front: 'Popular sovereignty', back: 'Government\'s power comes from the consent of the people.' },
            { front: 'Republicanism', back: 'The people elect representatives to make decisions for them.' },
            { front: 'Gettysburg Address', back: 'Lincoln (1863) reaffirmed equality and popular sovereignty: government "of the people, by the people, for the people."' },
          ],
        },
      ],
      precheck: {
        question: 'The phrase "We the People" at the start of the Constitution best reflects which ideal?',
        choices: ['Popular sovereignty', 'Federalism', 'Checks and balances', 'Separation of powers'],
        answer: 0,
        explanations: [
          'Correct. It locates the source of government power in the people.',
          'Incorrect. Federalism divides power between national and state governments.',
          'Incorrect. Checks and balances let branches limit each other.',
          'Incorrect. Separation of powers divides power among branches.',
        ],
      },
      checkpoints: [
        {
          question: 'The Declaration of Independence states that governments derive "their just powers from the consent of the governed." This reflects:',
          choices: ['Popular sovereignty', 'Federalism', 'Judicial review', 'The Supremacy Clause'],
          answer: 0,
          explanations: [
            'Correct. Power comes from the people\'s consent.',
            'Incorrect. The Declaration doesn\'t set up a federal division of power.',
            'Incorrect. Judicial review came later, from Marbury v. Madison.',
            'Incorrect. The Supremacy Clause is in the Constitution, not the Declaration.',
          ],
        },
        {
          question: 'Which pair are both principles that keep government limited?',
          choices: [
            'Separation of powers and federalism',
            'Natural rights and the Electoral College',
            'Popular sovereignty and the Three-Fifths Compromise',
            'Republicanism and the Articles of Confederation',
          ],
          answer: 0,
          explanations: [
            'Correct. Both divide power so no one part gets too much.',
            'Incorrect. The Electoral College is a method of choosing the president.',
            'Incorrect. The Three-Fifths Compromise was about representation.',
            'Incorrect. The Articles were a failed governing document, not a principle.',
          ],
        },
      ],
      revisit:
        'Ideals: natural rights, social contract, popular sovereignty, limited government. Limited government is kept by separation of ' +
        'powers, checks and balances, federalism, republicanism. Declaration (Jefferson), Constitution (Madison), Gettysburg Address (Lincoln).',
    },
    {
      id: '1.2',
      ced: 'LO 1.2.A',
      title: 'Types of Democracy',
      minutes: 5,
      summary:
        'Representative democracy comes in three models: participatory (broad participation), pluralist (groups competing for ' +
        'influence) and elite (limited participation by the educated and wealthy). The Constitution and the Federalist No. 10 vs. Brutus ' +
        'No. 1 debate reflect tension among them, and all three still show up today.',
      body: String.raw`### Three models
| Model | Emphasis | Examples in the U.S. |
|---|---|---|
| **Participatory** | Broad participation by ordinary citizens | Voting; state ballot initiatives and referendums; town meetings |
| **Pluralist** | **Groups** (interest groups, unions, advocacy organizations) compete to influence policy | Lobbying; the First Amendment rights to assemble and petition; Federalist No. 10's competing factions |
| **Elite** | **Limited** participation; a well-educated, wealthy few make key decisions | The Electoral College; senators originally chosen by state legislatures; appointed federal judges |

### Tension in the founding
- The **Constitution** mixes models: the **House** was directly elected (participatory), while the **Senate** (until the 17th Amendment in 1913), the **president** (via electors) and **judges** were filtered (elite).
- **Federalist No. 10** (Madison): a large republic where many factions compete and representatives filter public passions, mixing **pluralist** and **elite** ideas.
- **Brutus No. 1** (Anti-Federalist): a small, close-to-the-people republic, closer to the **participatory** model.

### Today
All three are still visible: state ballot measures (participatory), interest groups and lobbying (pluralist), and the Electoral College and Supreme Court (elite).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Participatory democracy', back: 'Broad participation by citizens in politics and civil society (e.g., ballot initiatives).' },
            { front: 'Pluralist democracy', back: 'Groups compete to influence policy (e.g., interest groups lobbying Congress).' },
            { front: 'Elite democracy', back: 'Limited participation; a well-educated, wealthy few make decisions (e.g., the Electoral College).' },
          ],
        },
      ],
      precheck: {
        question: 'Citizens in a state gather signatures to put a proposed law directly on the ballot. This best illustrates:',
        choices: ['Participatory democracy', 'Elite democracy', 'Pluralist democracy', 'Federalism'],
        answer: 0,
        explanations: [
          'Correct. Ordinary citizens are directly shaping the law.',
          'Incorrect. Elite democracy limits participation.',
          'Incorrect. Pluralism centers on organized groups, not citizens voting directly.',
          'Incorrect. Federalism is the division of power between levels of government.',
        ],
      },
      checkpoints: [
        {
          question: 'An environmental group and an industry association each lobby Congress on a pollution bill. This best illustrates:',
          choices: ['Pluralist democracy', 'Participatory democracy', 'Elite democracy', 'Popular sovereignty'],
          answer: 0,
          explanations: [
            'Correct. Organized groups compete for influence.',
            'Incorrect. Participatory democracy is about broad individual participation.',
            'Incorrect. Elite democracy is about a small, privileged few.',
            'Incorrect. Popular sovereignty is a general ideal, not a model of group competition.',
          ],
        },
        {
          question: 'The original method of choosing senators (by state legislatures) best reflects:',
          choices: ['Elite democracy', 'Participatory democracy', 'Pluralist democracy', 'Direct democracy'],
          answer: 0,
          explanations: [
            'Correct. It filtered choice through a small group of legislators.',
            'Incorrect. Voters didn\'t choose senators directly until the 17th Amendment.',
            'Incorrect. It wasn\'t about groups competing.',
            'Incorrect. It was the opposite of direct choice by voters.',
          ],
        },
      ],
      revisit:
        'Participatory (broad participation), pluralist (groups compete), elite (limited participation). The Constitution mixes them; ' +
        'Fed. 10 leans pluralist/elite, Brutus 1 participatory. All three persist today.',
    },
    {
      id: '1.3',
      ced: 'LO 1.3.A',
      title: 'Government Power and Individual Rights',
      minutes: 5,
      summary:
        'Federalists backed ratification and a strong central government. In Federalist No. 10, Madison argued that a large republic ' +
        'controls the "mischiefs of faction" best. Anti-Federalists like Brutus wanted power kept in the states, praised small ' +
        'republics, and warned that a large central government would threaten liberty.',
      body: String.raw`### Federalist No. 10 (James Madison)
- **Problem**: **factions**, groups pursuing their own interests against others' rights or the common good, are inevitable because people differ.
- You can't remove the **causes** of faction without destroying liberty, so you control its **effects**.
- **Solution**: a **large republic**.
  - **Representatives** filter and refine public opinion.
  - So many factions exist in a large republic that **no single faction can easily become a tyrannical majority**.
  - Power is also **dispersed** between the national and state governments.

### Brutus No. 1 (Anti-Federalist)
- A free republic works only when it's **small**, so representatives know and resemble the people.
- The proposed national government is too powerful: the **Necessary and Proper Clause** and the **Supremacy Clause** would let it swallow the states.
- Its power to tax and keep a **standing army** endangers liberty.
- Reflects **popular democratic theory**: decentralized power close to the people.

### Quick compare
| | Federalists | Anti-Federalists |
|---|---|---|
| Central government | Strong | Weak; more power to states |
| Ideal republic | Large | Small |
| Main fear | Factions, mob rule | Tyranny by a distant central government |
| Key writing | Federalist No. 10, No. 51 | Brutus No. 1 |
| Bill of Rights | Not needed at first | Demanded it |`,
      blocks: [],
      precheck: {
        question: 'In Federalist No. 10, Madison argues the best way to control the effects of faction is:',
        choices: [
          'A large republic with many competing factions',
          'Banning political parties and interest groups',
          'Small, independent state governments',
          'A strong monarch to keep order',
        ],
        answer: 0,
        explanations: [
          'Correct. Many factions in a large republic check each other.',
          'Incorrect. Madison said removing the causes of faction would destroy liberty.',
          'Incorrect. That is Brutus\'s position.',
          'Incorrect. Madison defended a republic, not a monarchy.',
        ],
      },
      checkpoints: [
        {
          question: 'Which statement would the author of Brutus No. 1 most likely agree with?',
          choices: [
            'A republic works best when it is small and representatives are close to the people',
            'A large republic best controls the dangers of faction',
            'The Necessary and Proper Clause safely limits national power',
            'States should give up most of their powers to the national government',
          ],
          answer: 0,
          explanations: [
            'Correct. Brutus argued for small, decentralized republics.',
            'Incorrect. That is Madison\'s argument in Federalist No. 10.',
            'Incorrect. Brutus warned that clause would expand national power.',
            'Incorrect. Brutus wanted power kept in the states.',
          ],
        },
        {
          question: 'Madison\'s definition of a faction is best summarized as:',
          choices: [
            'A group pursuing its own interests against others\' rights or the common good',
            'Any branch of the national government',
            'A state that refuses to ratify the Constitution',
            'A group of judges who interpret the Constitution',
          ],
          answer: 0,
          explanations: [
            'Correct. That is the core of his definition.',
            'Incorrect. Branches are part of the government\'s structure, not factions.',
            'Incorrect. Factions are groups of citizens.',
            'Incorrect. Judges aren\'t what Madison meant.',
          ],
        },
      ],
      revisit:
        'Fed. 10: factions are inevitable; control their effects with a large republic and representatives. Brutus 1: small republics; ' +
        'Necessary and Proper and Supremacy Clauses would crush the states; fear of tyranny.',
    },
    {
      id: '1.4',
      ced: 'LO 1.4.A',
      title: 'Challenges of the Articles of Confederation',
      minutes: 4,
      summary:
        'The Articles of Confederation created a weak national government. It had no national army to handle Shays\' Rebellion, no ' +
        'executive to enforce laws or collect taxes, no national courts, no power over interstate commerce and no exclusive power to ' +
        'coin money. These failures pushed the states to write a new Constitution.',
      body: String.raw`### Why so weak?
After fighting a king, Americans feared a strong central government. The Articles (ratified 1781) created a **confederation**: a "league of friendship" where the **states held most of the power**. Congress had one house, each state got **one vote**, laws needed **9 of 13** states, and amendments needed **all 13**.

### Five weaknesses the CED names
| Weakness | What went wrong |
|---|---|
| **No centralized military power** | **Shays' Rebellion** (1786–1787): indebted Massachusetts farmers rose up, and Congress couldn't raise an army to stop them |
| **No executive branch** | Nobody to **enforce laws**, including **taxes**: Congress could only *ask* states for money |
| **No national court system** | No way to settle disputes between states |
| **No power to regulate interstate commerce** | States taxed each other's goods and fought trade wars |
| **No exclusive power to coin money** | States printed their own currencies, causing confusion and inflation |

### The result
Shays' Rebellion convinced many leaders the national government was too weak. In 1787, delegates met in Philadelphia, officially to revise the Articles, and instead wrote a new Constitution.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Shays\' Rebellion', back: 'Armed uprising of indebted Massachusetts farmers (1786–1787) that showed the Articles\' government was too weak to keep order.' },
            { front: 'Articles: taxation', back: 'Congress couldn\'t tax; it could only request money from the states.' },
            { front: 'Articles: amendments', back: 'Required all 13 states to agree, making change nearly impossible.' },
          ],
        },
      ],
      precheck: {
        question: 'Shays\' Rebellion revealed which weakness of the Articles of Confederation?',
        choices: [
          'The lack of centralized military power to keep order',
          'A president with too much power',
          'Too many federal courts',
          'Congress\'s excessive power to tax',
        ],
        answer: 0,
        explanations: [
          'Correct. The national government couldn\'t raise an army to respond.',
          'Incorrect. There was no president under the Articles.',
          'Incorrect. There were no national courts.',
          'Incorrect. Congress couldn\'t tax at all.',
        ],
      },
      checkpoints: [
        {
          question: 'Under the Articles, why did the national government struggle to pay its debts?',
          choices: [
            'Congress could not tax and had no executive to enforce collection',
            'The national bank refused to lend money',
            'The Supreme Court struck down federal taxes',
            'The president vetoed every spending bill',
          ],
          answer: 0,
          explanations: [
            'Correct. It could only request money from states, which often didn\'t pay.',
            'Incorrect. There was no national bank under the Articles.',
            'Incorrect. There was no Supreme Court.',
            'Incorrect. There was no president.',
          ],
        },
        {
          question: 'States imposing tariffs on each other\'s goods under the Articles shows the lack of:',
          choices: [
            'National power to regulate interstate commerce',
            'A bill of rights',
            'State legislatures',
            'Popular sovereignty',
          ],
          answer: 0,
          explanations: [
            'Correct. Congress couldn\'t regulate trade between states.',
            'Incorrect. Trade wars weren\'t about individual rights.',
            'Incorrect. States had legislatures; the problem was national weakness.',
            'Incorrect. That is an ideal, not the missing power here.',
          ],
        },
      ],
      revisit:
        'Articles: weak confederation. No national army (Shays\' Rebellion), no executive to enforce laws or taxes, no national courts, ' +
        'no power over interstate commerce, no exclusive power to coin money.',
    },
    {
      id: '1.5',
      ced: 'LO 1.5.A',
      title: 'Ratification of the U.S. Constitution',
      minutes: 6,
      summary:
        'Compromises made the Constitution possible: the Great Compromise, the Electoral College, the Three-Fifths Compromise, ' +
        'postponing a ban on importing enslaved people until 1808, and a promised Bill of Rights. Article V set up a hard but possible ' +
        'amendment process. Some issues were left unresolved and are still debated.',
      body: String.raw`### The compromises
| Compromise | Conflict | Solution |
|---|---|---|
| **Great (Connecticut) Compromise** | Large states wanted representation by population (Virginia Plan); small states wanted equal votes (New Jersey Plan) | **Bicameral** Congress: **House** by population, **Senate** two per state |
| **Electoral College** | Should Congress or the people pick the president? | **Electors** from each state choose the president |
| **Three-Fifths Compromise** | How to count enslaved people | Counted as three-fifths of a person for **House representation and taxation** |
| **Importation of enslaved people** | Southern states threatened to walk out over a ban | Congress couldn't ban the importation until **1808** |
| **Bill of Rights** | Anti-Federalists feared a strong government with no listed rights | Promise to add amendments protecting rights (ratified 1791) |

### Amending the Constitution (Article V)
| Step | Method 1 (used every time) | Method 2 (never used) |
|---|---|---|
| **Propose** | **Two-thirds** vote in **both houses** of Congress | A national convention called by **two-thirds of state legislatures** |
| **Ratify** | **Three-fourths** of the states | **Three-fourths** of the states |

Hard on purpose, but possible: 27 amendments so far.

### Unresolved and still debated
The balance among **national power, state power and individual rights** is still contested:
- **Government surveillance** after the 9/11 attacks (e.g., the USA PATRIOT Act): security vs. privacy.
- **The role of government in public education**: national standards and funding vs. state and local control.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'From independence to the Bill of Rights',
            events: [
              { year: 1776, label: 'Declaration of Independence' },
              { year: 1781, label: 'Articles of Confederation ratified' },
              { year: 1786, label: 'Shays\' Rebellion begins' },
              { year: 1787, label: 'Constitutional Convention in Philadelphia' },
              { year: 1788, label: 'Ninth state ratifies the Constitution' },
              { year: 1791, label: 'Bill of Rights ratified' },
            ],
          },
        },
      ],
      precheck: {
        question: 'The Great (Connecticut) Compromise resolved a dispute over:',
        choices: [
          'Representation of large and small states in Congress',
          'How to elect the president',
          'Whether to add a bill of rights',
          'The power to coin money',
        ],
        answer: 0,
        explanations: [
          'Correct. It created a House based on population and a Senate with equal representation.',
          'Incorrect. That was settled by the Electoral College.',
          'Incorrect. That was a separate promise to the Anti-Federalists.',
          'Incorrect. That power was given to Congress without major dispute.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes the most commonly used process for amending the Constitution?',
          choices: [
            'Two-thirds of both houses of Congress propose; three-fourths of the states ratify',
            'A simple majority of Congress proposes; the president ratifies',
            'Two-thirds of the states propose; the Supreme Court ratifies',
            'A national popular vote proposes and ratifies',
          ],
          answer: 0,
          explanations: [
            'Correct. Every amendment so far was proposed by Congress this way.',
            'Incorrect. A simple majority isn\'t enough, and the president has no formal role.',
            'Incorrect. The Supreme Court doesn\'t ratify amendments.',
            'Incorrect. There is no national popular vote on amendments.',
          ],
        },
        {
          question: 'The promise to add a Bill of Rights was made mainly to:',
          choices: [
            'Address Anti-Federalist fears about a strong central government',
            'Satisfy large states in the representation debate',
            'Give the president more power',
            'End the Three-Fifths Compromise',
          ],
          answer: 0,
          explanations: [
            'Correct. Listing protected rights won over enough skeptics to ratify.',
            'Incorrect. Representation was settled by the Great Compromise.',
            'Incorrect. The Bill of Rights limits government power.',
            'Incorrect. The Three-Fifths Compromise lasted until the 14th Amendment.',
          ],
        },
      ],
      revisit:
        'Great Compromise (bicameral Congress), Electoral College, Three-Fifths Compromise, 1808 importation clause, promised Bill of ' +
        'Rights. Article V: propose by 2/3 of Congress (or a convention), ratify by 3/4 of states. Debates continue (surveillance, education).',
    },
    {
      id: '1.6',
      ced: 'LO 1.6.A, LO 1.6.B',
      title: 'Principles of American Government',
      minutes: 5,
      summary:
        'Separate powers for Congress, the president and the courts let each branch check the others, so no branch becomes too ' +
        'powerful. Federalist No. 51 explains how this controls abuse. The system creates multiple access points for influencing ' +
        'policy, and allows impeachment by the House and removal by the Senate.',
      body: String.raw`### Checks and balances
| Branch | Checks on the others |
|---|---|
| **Congress** | Passes laws; overrides vetoes (2/3 of both houses); confirms appointments and ratifies treaties (Senate); controls the budget; impeaches and removes officials |
| **President** | Vetoes bills; appoints judges; commands the military; issues executive orders |
| **Courts** | Judicial review: strike down laws and actions as unconstitutional |

### Federalist No. 51 (Madison)
- "**Ambition must be made to counteract ambition.**" Give each branch the means and motive to resist the others.
- Government must control the governed **and** control itself.
- In a large republic with power divided between national and state governments (a "double security"), it's hard for any majority to abuse power.

### Effects
- **Multiple access points**: interest groups and citizens can lobby Congress, the president, agencies or courts. If one door closes, try another.
- It also makes change **slow**, and can produce gridlock.

### Impeachment and removal
1. The **House** impeaches (formally charges) by a **simple majority**.
2. The **Senate** holds a trial; **two-thirds** must vote to convict and remove.

Andrew Johnson (1868) and Bill Clinton (1998) were impeached by the House but not removed by the Senate. Richard Nixon resigned in 1974 before the full House could vote.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Federalist No. 51', back: 'Madison: "ambition must be made to counteract ambition"; separation of powers and checks and balances control abuse.' },
            { front: 'Impeachment', back: 'The House formally charges an official (simple majority).' },
            { front: 'Removal', back: 'Senate conviction by a two-thirds vote after an impeachment trial.' },
            { front: 'Multiple access points', back: 'Divided power lets groups influence policy through many branches and levels of government.' },
          ],
        },
      ],
      precheck: {
        question: 'Which is an example of the Senate checking the president?',
        choices: [
          'Rejecting a nominee for the Supreme Court',
          'Vetoing a bill',
          'Declaring a law unconstitutional',
          'Issuing an executive order',
        ],
        answer: 0,
        explanations: [
          'Correct. The Senate confirms or rejects presidential appointments.',
          'Incorrect. The president vetoes bills; that checks Congress.',
          'Incorrect. That is judicial review by the courts.',
          'Incorrect. That is a presidential power.',
        ],
      },
      checkpoints: [
        {
          question: '"Ambition must be made to counteract ambition" comes from which document?',
          choices: ['Federalist No. 51', 'Federalist No. 10', 'Brutus No. 1', 'The Declaration of Independence'],
          answer: 0,
          explanations: [
            'Correct. Madison\'s defense of separation of powers and checks and balances.',
            'Incorrect. No. 10 is about factions and a large republic.',
            'Incorrect. Brutus opposed the Constitution.',
            'Incorrect. The Declaration is about natural rights and independence.',
          ],
        },
        {
          question: 'After losing in Congress, an advocacy group files a lawsuit to block a policy in federal court. This illustrates:',
          choices: [
            'Multiple access points created by separation of powers',
            'The Supremacy Clause',
            'Elite democracy',
            'Impeachment',
          ],
          answer: 0,
          explanations: [
            'Correct. Divided power gives groups more than one place to push.',
            'Incorrect. The Supremacy Clause concerns national vs. state law.',
            'Incorrect. An advocacy group pursuing its goals fits pluralism better.',
            'Incorrect. No official is being charged.',
          ],
        },
      ],
      revisit:
        'Each branch checks the others (veto, override, confirmation, judicial review). Fed. 51: ambition counteracts ambition. ' +
        'Effects: multiple access points, slow change. Impeachment: House majority charges; Senate 2/3 removes.',
    },
    {
      id: '1.7',
      ced: 'LO 1.7.A',
      title: 'Relationship Between the States and National Government',
      minutes: 6,
      summary:
        'Federalism shares power between national and state governments. Exclusive powers belong to one level (the national ' +
        'government\'s enumerated and implied powers), reserved powers go to the states under the Tenth Amendment, and concurrent ' +
        'powers are shared. Money (revenue sharing, block grants, categorical grants) and mandates shape the balance.',
      body: String.raw`**Federalism** = power shared between national and state governments. Federalist No. 39 argues the mix of national and state features **limits concentrated power** and creates **multiple access points** for participation.

### Kinds of power
| Kind | Held by | Examples |
|---|---|---|
| **Enumerated** (exclusive) | National: listed in the Constitution | Coin money, declare war, regulate interstate commerce, make treaties |
| **Implied** (exclusive) | National: inferred from the **Necessary and Proper Clause** | Create a national bank, draft soldiers |
| **Reserved** | States: **Tenth Amendment** (powers not given to the national government) | Run elections, set up schools, issue driver's and marriage licenses, police powers |
| **Concurrent** | Both | Collect taxes, make and enforce laws, build roads, set up courts |

### Money as a lever
| Tool | Strings attached | Who likes it |
|---|---|---|
| **Revenue sharing** | Almost none | Least used today |
| **Block grants** | Minimal: a broad purpose like "community development" | Preferred by **states** |
| **Categorical grants** | Spending restricted to specific purposes | Preferred by the **national government**; **most common** |
| **Mandates** | Requirements the states must follow, sometimes without funding (unfunded mandates) | States dislike unfunded mandates |

Example: the **National Minimum Drinking Age Act** (1984) withheld part of federal highway money from states that didn't set the drinking age at 21. Every state complied.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which level of government holds each power?',
            buckets: ['National', 'State', 'Both'],
            items: [
              { label: 'Coin money', bucket: 0, why: 'An enumerated power of Congress.' },
              { label: 'Declare war', bucket: 0, why: 'An enumerated power of Congress.' },
              { label: 'Make treaties with other countries', bucket: 0, why: 'Only the national government conducts foreign policy.' },
              { label: 'Regulate interstate commerce', bucket: 0, why: 'The Commerce Clause gives this to Congress.' },
              { label: 'Establish public schools', bucket: 1, why: 'A reserved power under the Tenth Amendment.' },
              { label: 'Issue driver\'s licenses', bucket: 1, why: 'A reserved power of the states.' },
              { label: 'Run elections', bucket: 1, why: 'States conduct elections, even for federal offices.' },
              { label: 'Collect taxes', bucket: 2, why: 'A concurrent power shared by both levels.' },
              { label: 'Build roads', bucket: 2, why: 'A concurrent power shared by both levels.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Powers not delegated to the national government are reserved to the states by:',
        choices: ['The Tenth Amendment', 'The Supremacy Clause', 'The Necessary and Proper Clause', 'The Commerce Clause'],
        answer: 0,
        explanations: [
          'Correct. The Tenth Amendment reserves undelegated powers to the states or the people.',
          'Incorrect. That makes national law supreme over state law.',
          'Incorrect. That expands national power.',
          'Incorrect. That gives Congress power over interstate trade.',
        ],
      },
      checkpoints: [
        {
          question: 'Congress gives states money that can only be spent on school lunch programs. This is a:',
          choices: ['Categorical grant', 'Block grant', 'Unfunded mandate', 'Revenue sharing'],
          answer: 0,
          explanations: [
            'Correct. The money is restricted to a specific purpose.',
            'Incorrect. Block grants have broad purposes and few restrictions.',
            'Incorrect. A mandate is a requirement, often without money.',
            'Incorrect. Revenue sharing came with almost no restrictions.',
          ],
        },
        {
          question: 'Why do states generally prefer block grants to categorical grants?',
          choices: [
            'Block grants give states more flexibility in how to spend the money',
            'Block grants come with more federal rules',
            'Block grants never have to be spent',
            'Block grants are only given to large states',
          ],
          answer: 0,
          explanations: [
            'Correct. States can fit the money to their own priorities.',
            'Incorrect. Block grants have fewer rules.',
            'Incorrect. They must be spent within a broad purpose.',
            'Incorrect. Any state can receive them.',
          ],
        },
      ],
      revisit:
        'Exclusive (enumerated + implied via Necessary and Proper) = national; reserved (10th Amendment) = states; concurrent = both. ' +
        'Revenue sharing (no strings), block grants (few strings, states prefer), categorical grants (strict, most common), mandates.',
    },
    {
      id: '1.8',
      ced: 'LO 1.8.A',
      title: 'Constitutional Interpretations of Federalism',
      minutes: 6,
      summary:
        'The Fourteenth Amendment, the Commerce Clause, the Necessary and Proper Clause and the Supremacy Clause all give the national ' +
        'government power, but Supreme Court rulings set how far that power reaches. McCulloch v. Maryland expanded national power; ' +
        'United States v. Lopez limited it.',
      body: String.raw`### The clauses
| Clause | What it gives the national government |
|---|---|
| **Fourteenth Amendment** (Due Process and Equal Protection) | Power to protect people's rights **against the states** |
| **Commerce Clause** | Power to regulate **interstate commerce** |
| **Necessary and Proper Clause** | Power to make laws needed to carry out its enumerated powers (**implied powers**) |
| **Supremacy Clause** | National laws and the Constitution take precedence over state laws |

In each case, **the Supreme Court decides how far the power reaches.**

### Required case: McCulloch v. Maryland (1819)
- **Facts**: Congress created the Second Bank of the United States. Maryland taxed the bank's Baltimore branch; cashier James McCulloch refused to pay.
- **Issues**: Can Congress create a bank, which isn't an enumerated power? Can a state tax it?
- **Holding**: Yes and no. Congress can create the bank under the **Necessary and Proper Clause** (implied powers), and Maryland can't tax it because of the **Supremacy Clause**. Chief Justice Marshall: "the power to tax involves the power to destroy."
- **Effect**: **expanded** national power.

### Required case: United States v. Lopez (1995)
- **Facts**: Alfonso Lopez, a high school senior, brought a gun to school, violating the federal Gun-Free School Zones Act of 1990.
- **Issue**: Does the **Commerce Clause** let Congress ban guns near schools?
- **Holding**: No. Carrying a gun near a school is not economic activity that substantially affects interstate commerce; that's a matter for the states' police powers.
- **Effect**: **limited** national power, the first time in decades the Court had limited the Commerce Clause. (Similarly, *United States v. Morrison*, 2000, struck down part of the Violence Against Women Act.)

### The pattern
| Expanded national power | Limited national power |
|---|---|
| *McCulloch* (implied powers, supremacy) | *Lopez* (Commerce Clause has limits) |`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'McCulloch v. Maryland (1819)', back: 'Congress may create a national bank (Necessary and Proper Clause); states can\'t tax it (Supremacy Clause). Expanded national power.' },
            { front: 'United States v. Lopez (1995)', back: 'Gun-Free School Zones Act exceeded the Commerce Clause; carrying a gun isn\'t economic activity. Limited national power.' },
            { front: 'Supremacy Clause', back: 'The Constitution and national laws take precedence over conflicting state laws.' },
            { front: 'Necessary and Proper Clause', back: 'Lets Congress make laws needed to carry out its enumerated powers; the source of implied powers.' },
          ],
        },
      ],
      precheck: {
        question: 'In McCulloch v. Maryland (1819), the Supreme Court ruled that:',
        choices: [
          'Congress could create a national bank, and states could not tax it',
          'States could tax any federal institution',
          'Congress lacked power to create a bank',
          'The Commerce Clause did not allow a ban on guns near schools',
        ],
        answer: 0,
        explanations: [
          'Correct. Implied powers plus national supremacy.',
          'Incorrect. The Court said Maryland couldn\'t tax the bank.',
          'Incorrect. The Court upheld the bank under the Necessary and Proper Clause.',
          'Incorrect. That describes United States v. Lopez.',
        ],
      },
      checkpoints: [
        {
          question: 'United States v. Lopez (1995) is significant because it:',
          choices: [
            'Limited Congress\'s power under the Commerce Clause',
            'Expanded implied powers under the Necessary and Proper Clause',
            'Allowed states to tax federal banks',
            'Ended the Electoral College',
          ],
          answer: 0,
          explanations: [
            'Correct. Carrying a gun near a school wasn\'t economic activity Congress could regulate.',
            'Incorrect. That was McCulloch.',
            'Incorrect. McCulloch said states couldn\'t tax the bank.',
            'Incorrect. Lopez had nothing to do with elections.',
          ],
        },
        {
          question: 'What do McCulloch v. Maryland and United States v. Lopez have in common?',
          choices: [
            'Both concerned the scope of national power in relation to the states',
            'Both expanded national power',
            'Both involved the First Amendment',
            'Both struck down state laws under the Commerce Clause',
          ],
          answer: 0,
          explanations: [
            'Correct. Both decided how far national power reaches.',
            'Incorrect. Lopez limited national power.',
            'Incorrect. Neither was a First Amendment case.',
            'Incorrect. Lopez struck down a federal law; McCulloch struck down a state tax under the Supremacy Clause.',
          ],
        },
      ],
      revisit:
        '14th Amendment, Commerce, Necessary and Proper and Supremacy Clauses give national power; the Court sets its limits. ' +
        'McCulloch: bank OK (implied powers), no state tax (supremacy) → expanded. Lopez: gun law exceeded Commerce Clause → limited.',
    },
    {
      id: '1.9',
      ced: 'LO 1.9.A',
      title: 'Federalism in Action',
      minutes: 4,
      summary:
        'Dividing power between national and state governments creates multiple access points for influencing policy. National ' +
        'policymaking is constrained because states share concurrent powers and can act on their own.',
      body: String.raw`### Multiple access points
If a group loses in Congress, it can try **state legislatures**, **governors**, **state courts** or **ballot measures**, and the reverse.

### Examples
- **Marijuana legalization**: Colorado and Washington legalized recreational marijuana in 2012, though it remained illegal under federal law. Many states followed, creating policy change from the bottom up.
- **Disaster response**: after Hurricanes Katrina (2005) and Sandy (2012), federal, state and local governments shared (and argued over) responsibility.
- **Education**: national laws like No Child Left Behind (2001) set testing rules tied to federal funds, while states run and mostly pay for schools.
- **"Devolution" of the 1980s**: shifting programs and money back to the states through block grants.

### Constraints on national policy
Because states share **concurrent** powers and run many programs, national policy often depends on state cooperation, and states can resist, delay or go further than Washington.

### Writing an argument
Make a **defensible claim** and back it with evidence: "Federalism promotes policy innovation because states can test new policies, such as marijuana legalization, before the national government acts."`,
      blocks: [],
      precheck: {
        question: 'States legalizing recreational marijuana while it remained illegal under federal law best illustrates:',
        choices: [
          'Federalism creating multiple access points for policy change',
          'The Great Compromise',
          'Elite democracy',
          'The Three-Fifths Compromise',
        ],
        answer: 0,
        explanations: [
          'Correct. Advocates won change at the state level.',
          'Incorrect. That compromise concerned representation in Congress.',
          'Incorrect. Many legalizations came through ballot measures, which is participatory.',
          'Incorrect. That compromise concerned counting enslaved people.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains why national policymaking is constrained by federalism?',
          choices: [
            'States share concurrent powers and run many programs, so national policy depends on their cooperation',
            'The national government has no power to tax',
            'The Supreme Court must approve every law before it passes',
            'States can veto acts of Congress',
          ],
          answer: 0,
          explanations: [
            'Correct. Shared powers mean states can resist, delay or reshape national policy.',
            'Incorrect. Congress has the power to tax.',
            'Incorrect. Courts rule only on cases brought to them.',
            'Incorrect. States have no formal veto over Congress.',
          ],
        },
        {
          question: 'Which claim about federalism is best supported by the example of states acting before the national government?',
          choices: [
            'States can serve as laboratories for new policies',
            'Federalism prevents any policy change',
            'The national government controls all policy',
            'States have no reserved powers',
          ],
          answer: 0,
          explanations: [
            'Correct. States test policies others may later adopt.',
            'Incorrect. The example shows change happening.',
            'Incorrect. The example shows states acting on their own.',
            'Incorrect. The Tenth Amendment reserves powers to states.',
          ],
        },
      ],
      revisit:
        'Federalism = multiple access points (state legislatures, courts, ballot measures). National policy is constrained because ' +
        'states share concurrent powers; states can be laboratories of policy.',
    },
  ],
};

export default pack;
