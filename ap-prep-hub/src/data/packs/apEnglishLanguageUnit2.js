/**
 * AP English Language and Composition Unit 2 — study pack.
 *
 * Written against the AP English Language and Composition CED effective Fall
 * 2024 (the current edition). Like Unit 1, sections follow the unit's
 * essential knowledge codes: audience and appeals (RHS-1.F–H, skills 1.B and
 * 2.B), strategic and sufficient evidence (CLE-1.F–H, skills 3.A and 4.A),
 * and thesis (CLE-1.I–J, skills 3.B and 4.B). Example passages are public
 * domain (Elizabeth I 1588, Patrick Henry 1775, Kennedy 1961). The CED lists
 * six purposes of evidence without defining them; the definitions here are
 * this pack's, and illustrate/exemplify share one group because they overlap.
 * Three sorting activities.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-english-language-and-composition/unit-2',
  subject: 'AP English Language and Composition',
  unit: 'Unit 2: Audience, Appeals, Evidence, and Thesis',
  examWeight: 'no unit weighting (these skills appear across the whole exam)',
  intro:
    'Unit 1 was about reading a writer\'s situation. Unit 2 is about the audience on the other end: what they value, how ' +
    'writers appeal to them, how to pick evidence that does a specific job, how much evidence is enough, and how a thesis ' +
    'holds the whole argument together.',
  sections: [
    {
      id: 'RHS-1.F–G',
      ced: 'RHS-1.F–G (skills 1.B, 2.B)',
      title: 'Writing for an Audience\'s Values and Needs',
      minutes: 6,
      summary:
        'Writers make choices based on what they believe their audience values, believes, needs and already knows. To achieve ' +
        'a purpose, they try to connect with the audience\'s emotions and values, not just state their own.',
      body: String.raw`### Start from the audience
Before choosing a single word, an effective writer asks:
- What does this audience **value**? (security, fairness, tradition, independence, faith, family)
- What do they **believe** about the issue already?
- What do they **need**? (information, reassurance, a reason to act)
- What **background** do they share? (age, profession, region, experience)

The answers drive choices about evidence, tone, examples and even word choice.

### A worked example: Elizabeth I at Tilbury, 1588
England expected the Spanish Armada to invade. Queen Elizabeth spoke to her soldiers, who might doubt that a woman could lead them in war:

> "I know I have the body of a weak and feeble woman; but I have the heart and stomach of a king, and of a king of England too."

She **anticipates the audience's doubt** (a woman leading an army), names it herself, then answers it with something they value: courage and loyalty to England. She also says she has come "to live and die amongst you all," joining their risk rather than commanding from a distance.

### On the exam
Questions ask how a writer's choice "demonstrates an understanding of the audience's beliefs, values, or needs." The right answer connects a **specific choice** to a **specific audience trait**, not to the topic in general.

### In your own writing
Name your audience's likely objection and value, then build toward them. An argument for later library hours aimed at the town council should talk about cost and safety, not just about how much students love reading.`,
      blocks: [],
      precheck: {
        question: 'Why does Elizabeth I say she has "the body of a weak and feeble woman" in a speech meant to inspire soldiers?',
        choices: [
          'To name the soldiers\' likely doubt about her and then overturn it with an appeal to courage and loyalty',
          'To admit she cannot lead the army and hand command to a general',
          'To make the soldiers feel sorry for her so they will surrender',
          'To describe her health for the historical record',
        ],
        answer: 0,
        explanations: [
          'Correct. She anticipates the audience\'s doubt and answers it with values they share.',
          'Incorrect. The sentence turns to "the heart and stomach of a king"; she claims leadership.',
          'Incorrect. Her purpose is to inspire them to fight, not surrender.',
          'Incorrect. The line is strategic, aimed at her audience.',
        ],
      },
      checkpoints: [
        {
          question: 'A student is asking the town council to keep the library open until 9 p.m. Which choice best shows an understanding of this audience\'s needs?',
          choices: [
            'Showing that the extra hours can be staffed within the current budget',
            'Describing how much the student personally loves reading',
            'Listing every book the student read last year',
            'Arguing that the council members don\'t care about young people',
          ],
          answer: 0,
          explanations: [
            'Correct. A council must answer for costs, so addressing the budget meets its need.',
            'Incorrect. Personal enthusiasm doesn\'t address what the council must decide.',
            'Incorrect. That is irrelevant to the council\'s decision.',
            'Incorrect. Insulting the audience works against the purpose.',
          ],
        },
        {
          question: 'Which question should a writer ask first when choosing evidence for an argument?',
          choices: [
            'What does my audience already believe and value about this issue?',
            'Which evidence is the longest?',
            'What evidence do I personally find most interesting?',
            'Which source has the most famous author?',
          ],
          answer: 0,
          explanations: [
            'Correct. RHS-1.F: perceptions of the audience guide a writer\'s choices.',
            'Incorrect. Length doesn\'t make evidence effective.',
            'Incorrect. The writer\'s interest matters less than the audience\'s.',
            'Incorrect. Fame alone doesn\'t make evidence fit the audience.',
          ],
        },
      ],
      revisit:
        'Audience values, beliefs, needs and background guide every choice. Effective writers anticipate doubts and connect to ' +
        'shared values (Elizabeth I at Tilbury). Link a specific choice to a specific audience trait.',
    },
    {
      id: 'RHS-1.H',
      ced: 'RHS-1.H (skill 1.B)',
      title: 'Appeals: The Modes of Persuasion',
      minutes: 7,
      summary:
        'Arguments persuade or motivate action through appeals. Ethos builds the writer\'s credibility, pathos engages the ' +
        'audience\'s emotions and values, and logos uses reasoning and evidence. Most strong arguments combine them.',
      body: String.raw`### The three classic appeals
| Appeal | Works through | Sounds like |
|---|---|---|
| **Ethos** | The writer's **credibility**: expertise, experience, good character, shared identity with the audience | "As a nurse who has worked night shifts for ten years…" |
| **Pathos** | The audience's **emotions and values** | A vivid story, charged words, an appeal to pride, fear, hope or loyalty |
| **Logos** | **Reasoning and evidence** | Statistics, cause and effect, logical steps, expert findings |

### Appeals work together
**Patrick Henry**, speaking to the Virginia Convention in 1775 as it debated whether to arm against Britain, mixes them:
- **Logos**: he reviews the past ten years of petitions and asks why Britain has sent armies and fleets if not to subdue the colonies.
- **Pathos**: "Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery?"
- **Ethos**: he presents himself as a loyal man forced to speak bluntly out of duty to God and country.

### Don't just label
The exam rarely rewards "the writer uses pathos." It rewards explaining **how** a choice appeals to **this** audience **for this purpose**: Henry's image of "chains" plays on his audience's pride as free Englishmen to make reconciliation look like surrender.

Sort the appeals below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'An argument for keeping the library open later. Which appeal does each sentence lean on most?',
            buckets: ['Ethos', 'Pathos', 'Logos'],
            items: [
              { label: 'As the head librarian for twelve years, I see who waits at the door each night.', bucket: 0, why: 'It builds credibility from experience.' },
              { label: 'I volunteer here every weekend and know the budget line by line.', bucket: 0, why: 'Knowledge and commitment establish the writer\'s authority.' },
              { label: 'Picture a ninth grader doing homework under a streetlight because the library closed.', bucket: 1, why: 'A vivid image targets the audience\'s sympathy.' },
              { label: 'Our town has always believed every child deserves a fair start.', bucket: 1, why: 'It appeals to a shared value.' },
              { label: 'Evening visits doubled in the two months the library stayed open late.', bucket: 2, why: 'Data supports the claim through reasoning.' },
              { label: 'If students lack quiet space at home, then late hours fill that gap at little extra cost.', bucket: 2, why: 'A cause-and-effect chain is logical reasoning.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A writer cites her twenty years as an emergency-room doctor before arguing for a helmet law. Which appeal is she using?',
        choices: ['Ethos', 'Pathos', 'Logos', 'Kairos'],
        answer: 0,
        explanations: [
          'Correct. Her experience builds credibility.',
          'Incorrect. Pathos targets emotions; her credentials target trust.',
          'Incorrect. Logos would be the reasoning or data itself.',
          'Incorrect. Kairos is timeliness, not credibility.',
        ],
      },
      checkpoints: [
        {
          question: 'In 1775 Patrick Henry asked, "Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery?" How does this question serve his purpose?',
          choices: [
            'It appeals to his audience\'s pride as free men so that avoiding war seems like accepting slavery',
            'It presents statistics about the British army',
            'It establishes his medical expertise',
            'It asks the audience to compromise with Britain',
          ],
          answer: 0,
          explanations: [
            'Correct. The charged image reframes peace as surrender, pushing the audience toward armed resistance.',
            'Incorrect. The question contains no data.',
            'Incorrect. Henry was a lawyer, and the line isn\'t about expertise.',
            'Incorrect. Henry argued against compromise.',
          ],
        },
        {
          question: 'Which analysis of an appeal would earn the most credit on the exam?',
          choices: [
            'The statistic about rising emergency visits appeals to logic, giving the cost-conscious board a concrete reason to fund the program.',
            'The writer uses logos.',
            'The writer uses ethos, pathos and logos throughout.',
            'The statistic is persuasive because statistics are always convincing.',
          ],
          answer: 0,
          explanations: [
            'Correct. It explains how the appeal works on this audience for this purpose.',
            'Incorrect. A label alone doesn\'t explain anything.',
            'Incorrect. Listing appeals without analysis earns little.',
            'Incorrect. It ignores the audience and situation.',
          ],
        },
      ],
      revisit:
        'Ethos: credibility. Pathos: emotions and values. Logos: reasoning and evidence. Strong arguments combine them. Explain ' +
        'how an appeal works on this audience for this purpose; don\'t just name it.',
    },
    {
      id: 'CLE-1.F',
      ced: 'CLE-1.F (skill 3.A)',
      title: 'Choosing Evidence for a Purpose',
      minutes: 7,
      summary:
        'Writers choose evidence to do a specific job: to illustrate or exemplify a point, to clarify it, to set a mood, to ' +
        'associate it with something else, or to amplify it. Asking what job a piece of evidence does is the first step in analyzing it.',
      body: String.raw`### Evidence has a job
The CED names six purposes. Here's what each does in practice:

| Purpose | What the evidence does | Example (argument for later library hours) |
|---|---|---|
| **Illustrate / exemplify** | Gives a concrete instance of a general point | "Last spring, Maya finished her science project at the library's last table at 8:55 p.m." |
| **Clarify** | Makes an abstract or confusing point easier to grasp, often by analogy or definition | "Closing at 5 is like opening a gym only during work hours." |
| **Set a mood** | Creates an emotional atmosphere through detail | "At 5:01 the lights click off and the parking lot fills with kids who have nowhere to go." |
| **Associate** | Links the subject to something the audience already values or fears | "Like the town pool in summer, the library is a public good every family shares." |
| **Amplify** | Enlarges or intensifies the point's importance | "It isn't one student, or one night: it's hundreds of students, every school night, all year." |

Illustrating and exemplifying overlap so much that this pack treats them as one group.

### Why this matters
On the multiple-choice section, a common question is "The writer includes the anecdote in paragraph 3 primarily to…" Name the job first, then match it to the writer's purpose.

Sort the examples below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'What job does each piece of evidence do?',
            buckets: ['Illustrate or exemplify', 'Clarify', 'Set a mood', 'Associate', 'Amplify'],
            items: [
              { label: 'For example, the robotics team met at the library every Tuesday until it closed early.', bucket: 0, why: 'A specific case stands for the general point.' },
              { label: 'One sophomore, Jordan, did every algebra assignment there last winter.', bucket: 0, why: 'A single real instance exemplifies the claim.' },
              { label: 'A library that closes at 5 is like a store that opens only while customers are at work.', bucket: 1, why: 'The analogy makes the problem easy to grasp.' },
              { label: '"Study space" here means a quiet, warm, lit table with free Wi-Fi.', bucket: 1, why: 'Defining the term clears up what is being asked for.' },
              { label: 'At dusk the reading room goes dark while rain streaks the locked glass doors.', bucket: 2, why: 'Sensory detail creates a bleak atmosphere.' },
              { label: 'Inside at 7 p.m., the only sounds are pages turning and a radiator ticking.', bucket: 2, why: 'Quiet detail sets a calm, inviting mood.' },
              { label: 'Keeping the library open is as basic a civic duty as keeping streetlights on.', bucket: 3, why: 'It links the proposal to something the audience already accepts.' },
              { label: 'Andrew Carnegie built libraries so working people could learn after their shifts.', bucket: 3, why: 'It ties the proposal to a respected tradition.' },
              { label: 'Multiply one lost evening by 400 students and 180 school nights.', bucket: 4, why: 'It enlarges the scale of the problem.' },
              { label: 'This is not an inconvenience; it is a door shut on an entire generation.', bucket: 4, why: 'It intensifies the stakes.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A writer compares a city\'s old water pipes to "arteries clogged after decades of neglect." What is the main purpose of this evidence?',
        choices: [
          'To clarify the problem through a familiar comparison',
          'To give a statistic about pipe failures',
          'To establish the writer\'s engineering credentials',
          'To summarize the opposing argument',
        ],
        answer: 0,
        explanations: [
          'Correct. The analogy makes an unseen problem easy to picture.',
          'Incorrect. The comparison contains no numbers.',
          'Incorrect. The writer\'s credentials aren\'t mentioned.',
          'Incorrect. Nothing here addresses an opposing view.',
        ],
      },
      checkpoints: [
        {
          question: 'In an essay against cutting a school music program, the writer adds, "Every spring concert fills the gym with grandparents, siblings, and neighbors who haven\'t seen each other all year." This detail mainly serves to',
          choices: [
            'associate the program with community connection, which the audience values',
            'present the program\'s budget',
            'define what a music program is',
            'concede that the program should be cut',
          ],
          answer: 0,
          explanations: [
            'Correct. It links the program to something the community already cares about.',
            'Incorrect. No budget figures are given.',
            'Incorrect. It describes an effect, not a definition.',
            'Incorrect. It supports keeping the program.',
          ],
        },
        {
          question: '"It isn\'t one family. It\'s every family on this street, every winter, for the past decade." What does this evidence mainly do?',
          choices: [
            'Amplify the scale and seriousness of the problem',
            'Set a peaceful mood',
            'Clarify a technical term',
            'Give a single example',
          ],
          answer: 0,
          explanations: [
            'Correct. Widening from one family to all of them, for years, amplifies the point.',
            'Incorrect. The tone is urgent, not peaceful.',
            'Incorrect. No term is defined.',
            'Incorrect. It moves beyond a single example.',
          ],
        },
      ],
      revisit:
        'Evidence has a job: illustrate or exemplify, clarify, set a mood, associate, amplify. Name the job, then connect it to ' +
        'the writer\'s purpose.',
    },
    {
      id: 'CLE-1.G–H',
      ced: 'CLE-1.G–H (skills 3.A, 4.A)',
      title: 'Strategic and Sufficient Evidence',
      minutes: 6,
      summary:
        'Strategically chosen evidence strengthens reasoning, connects with the audience and builds the writer\'s credibility. ' +
        'An argument also needs enough evidence: sufficiency depends on both the quantity and the quality of support.',
      body: String.raw`### Strategic evidence does three things
1. **Strengthens the reasoning**: it actually supports the claim, not a nearby claim.
2. **Relates to the audience's emotions and values**.
3. **Increases the writer's credibility**: accurate, relevant, well-sourced evidence makes the writer look trustworthy. Sloppy evidence does the opposite.

### Sufficient evidence
Evidence is **sufficient** when its **quantity and quality** give apt support for the claim.
- One anecdote can make a point vivid, but it can't prove a trend.
- Ten weak or irrelevant examples don't add up to strong support either.
- Bigger claims need more support. "Some students use the library at night" needs less than "Extending hours will raise graduation rates."

### Test your evidence
| Question | If the answer is no… |
|---|---|
| Does it support **this** claim? | Cut it or change the claim |
| Is it **accurate and from a credible source**? | Find a better source |
| Does it fit **this audience**? | Choose evidence they'll accept |
| Is there **enough**, given how big the claim is? | Add support or narrow the claim |

### A note on Kennedy, 1961
In his inaugural address, John F. Kennedy asked Americans to "ask not what your country can do for you; ask what you can do for your country." The line works as a call to action, but it isn't evidence for anything. Memorable phrasing is not support. On the argument essay, a quotation only counts if your commentary shows how it supports your claim.`,
      blocks: [],
      precheck: {
        question: 'When is evidence "sufficient," according to the CED?',
        choices: [
          'When its quantity and quality give apt support for the argument',
          'When there are at least three examples',
          'When it comes from a single famous source',
          'When it fills at least half the essay',
        ],
        answer: 0,
        explanations: [
          'Correct. Both how much and how good the evidence is matter.',
          'Incorrect. There is no fixed number; it depends on the claim.',
          'Incorrect. One source, however famous, may not be enough.',
          'Incorrect. Length alone doesn\'t make evidence sufficient.',
        ],
      },
      checkpoints: [
        {
          question: 'A student claims that a four-day school week would improve test scores nationwide, supported only by one friend\'s experience at another school. What is the main weakness?',
          choices: [
            'The evidence is insufficient for such a broad claim',
            'The claim is too narrow',
            'The evidence is too technical for the audience',
            'The student uses too many statistics',
          ],
          answer: 0,
          explanations: [
            'Correct. A single anecdote can\'t support a nationwide claim.',
            'Incorrect. The claim is very broad.',
            'Incorrect. A friend\'s story isn\'t technical.',
            'Incorrect. There are no statistics at all.',
          ],
        },
        {
          question: 'Which is the best way to strengthen the student\'s argument in the previous question?',
          choices: [
            'Add data from several schools that adopted four-day weeks, or narrow the claim to what the evidence shows',
            'Repeat the friend\'s story in more detail',
            'Add a famous quotation about education',
            'Remove all evidence and state the claim more forcefully',
          ],
          answer: 0,
          explanations: [
            'Correct. Either improve the quantity and quality of evidence or make the claim fit it.',
            'Incorrect. More detail doesn\'t make one case representative.',
            'Incorrect. A quotation isn\'t evidence for the claim.',
            'Incorrect. Force isn\'t a substitute for support.',
          ],
        },
      ],
      revisit:
        'Strategic evidence strengthens reasoning, connects with the audience and builds credibility. Sufficient = enough ' +
        'quantity and quality for the size of the claim. Memorable phrasing is not evidence.',
    },
    {
      id: 'CLE-1.I–J',
      ced: 'CLE-1.I–J (skills 3.B, 4.B)',
      title: 'Thesis and Thesis Statements',
      minutes: 7,
      summary:
        'A thesis is the main, overarching claim an argument defends. It isn\'t always stated in one sentence, and some texts ' +
        'imply it. When it is stated directly, it is a thesis statement. Your essays must state a thesis that needs proof and ' +
        'may preview the line of reasoning.',
      body: String.raw`### Thesis vs. thesis statement
- The **thesis** is the overarching claim the whole argument works to prove.
- A **thesis statement** is that claim **stated directly**. Some writers imply their thesis or build up to it at the end, so you may have to read the whole text to find it.

On the exam, your essay **must** state a clear thesis.

### What makes a defensible thesis
| Not a thesis | Why | Thesis |
|---|---|---|
| "The library closes at 5 p.m." | A fact; nothing to prove | "The library should stay open until 9 p.m. because it is the only free, quiet study space for many students." |
| "This essay will discuss library hours." | An announcement, not a claim | "Extending library hours is a cheaper way to support struggling students than adding tutoring programs." |
| "Libraries are good." | Too vague to defend | "Because many students lack quiet space at home, later hours would do more for achievement than any new technology purchase." |

A thesis must be **arguable**: a reasonable person could disagree, so it requires proof or defense.

### Previewing the reasoning
A thesis **may** preview the argument's structure ("because of cost, safety and access…"), but it doesn't have to list every point.

Sort the statements below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Defensible thesis, or not?',
            buckets: ['Defensible thesis', 'Not a thesis'],
            items: [
              { label: 'Schools should ban phones during class because constant notifications fragment attention more than any other distraction.', bucket: 0, why: 'It makes an arguable claim with a reason.' },
              { label: 'Free public transit would serve the city better than widening highways, because it moves more people for less money.', bucket: 0, why: 'Someone could disagree, so it needs defense.' },
              { label: 'Although homework builds habits, high schools should cap it at an hour a night to protect sleep.', bucket: 0, why: 'It acknowledges a counterpoint and still takes a position.' },
              { label: 'Many teenagers own smartphones.', bucket: 1, why: 'A fact needs no argument.' },
              { label: 'In this essay I will talk about public transit.', bucket: 1, why: 'An announcement isn\'t a claim.' },
              { label: 'Homework is an interesting topic with many sides.', bucket: 1, why: 'Too vague to defend or dispute.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is a defensible thesis?',
        choices: [
          'Cities should replace parking minimums with transit funding because they waste land that housing needs.',
          'Many cities have parking lots.',
          'This essay will discuss parking.',
          'Parking is a topic people care about.',
        ],
        answer: 0,
        explanations: [
          'Correct. It is arguable and gives a reason.',
          'Incorrect. That is a fact.',
          'Incorrect. That is an announcement.',
          'Incorrect. It is too vague to argue.',
        ],
      },
      checkpoints: [
        {
          question: 'A writer never states a thesis directly but builds a case across the essay. Which is true?',
          choices: [
            'The essay can still have a thesis, which the reader identifies from the whole text',
            'The essay has no thesis at all',
            'The thesis must be the first sentence of the essay',
            'Implied theses are not allowed in published writing',
          ],
          answer: 0,
          explanations: [
            'Correct. CLE-1.J: a thesis may be implied and require a thorough reading to identify.',
            'Incorrect. An argument always has an overarching claim, stated or not.',
            'Incorrect. Writers can place or imply a thesis anywhere.',
            'Incorrect. Many published arguments imply their thesis.',
          ],
        },
        {
          question: 'Which thesis best previews a line of reasoning?',
          choices: [
            'The city should add bike lanes because they reduce traffic deaths, cut commuting costs and bring customers to local shops.',
            'Bike lanes exist in many cities.',
            'I will now explain bike lanes.',
            'Bike lanes are good and bad.',
          ],
          answer: 0,
          explanations: [
            'Correct. It makes a claim and signals three lines of support.',
            'Incorrect. That is a fact.',
            'Incorrect. That is an announcement.',
            'Incorrect. It takes no defensible position.',
          ],
        },
      ],
      revisit:
        'Thesis = overarching claim; thesis statement = stated directly. It may be implied. Defensible = arguable and needs proof. ' +
        'It may preview the reasoning. Not a thesis: facts, announcements, vague statements.',
    },
  ],
};

export default pack;
