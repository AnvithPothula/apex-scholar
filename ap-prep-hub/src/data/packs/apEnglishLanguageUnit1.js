/**
 * AP English Language and Composition Unit 1 — study pack.
 *
 * Written against the AP English Language and Composition CED effective Fall
 * 2024 (the current edition). The CED doesn't name or number topics inside its
 * units, so sections follow Unit 1's essential knowledge codes: the rhetorical
 * situation (RHS-1.A–E) and claims and evidence (CLE-1.A–E), for skills 1.A,
 * 3.A and 4.A. Example passages are public domain (Douglass 1852, Lincoln
 * 1863). Two sorting activities.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-english-language-and-composition/unit-1',
  subject: 'AP English Language and Composition',
  unit: 'Unit 1: Rhetorical Situation, Claims, and Evidence',
  examWeight: 'no unit weighting (these skills appear across the whole exam)',
  intro:
    'Every piece of writing comes from a situation: something prompted it, someone wrote it, for an audience, at a time and place, ' +
    'to do something. This unit is about reading that situation, telling a real claim from a plain fact, and building a paragraph ' +
    'that defends a claim with evidence woven into your own sentences.',
  sections: [
    {
      id: 'RHS-1.A–C',
      ced: 'RHS-1.A–C (skill 1.A)',
      title: 'The Rhetorical Situation: Exigence and Purpose',
      minutes: 6,
      summary:
        'The rhetorical situation is the exigence, purpose, audience, writer, context and message of a text. The exigence is what ' +
        'prompts the writer to write. The purpose is what the writer hopes to accomplish, and a text can have more than one purpose.',
      body: String.raw`### The six parts
| Part | Question it answers |
|---|---|
| **Exigence** | What **prompted** the writer to write? (an event, a problem, an invitation) |
| **Purpose** | What does the writer **hope to accomplish**? (persuade, inform, inspire, call to action) |
| **Audience** | **Who** is the text for? |
| **Writer** | Who is writing, and what do they bring (experience, authority, identity)? |
| **Context** | **When, where and on what occasion**? |
| **Message** | What is the main idea the writer wants the audience to take away? |

### Exigence vs. purpose
They're easy to mix up:
- **Exigence** looks **backward**: the spark. *Frederick Douglass was invited to speak at a Fourth of July celebration in Rochester, New York, in 1852, while slavery was legal.*
- **Purpose** looks **forward**: the goal. *To make a mostly white, antislavery audience feel the hypocrisy of celebrating liberty while millions were enslaved, and to push them to act.*

A text can have **several purposes**: Lincoln's Gettysburg Address (1863) honored the dead **and** redefined the war as a fight for "a new birth of freedom."

### On the exam
Multiple-choice questions often ask what a passage's purpose is, or how a choice serves the writer's purpose in this situation. The answer always depends on the situation, never on the topic alone.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Rhetorical situation', back: 'Exigence, purpose, audience, writer, context and message, taken together.' },
            { front: 'Exigence', back: 'What prompts or provokes a writer to create the text.' },
            { front: 'Purpose', back: 'What the writer hopes to accomplish; a text may have more than one.' },
            { front: 'Message', back: 'The main idea the writer wants the audience to take away.' },
          ],
        },
      ],
      precheck: {
        question: 'A city council announces it will close the town\'s only library, and a librarian writes a letter to the local paper urging residents to attend the next council meeting. What is the exigence?',
        choices: [
          'The council\'s announcement that the library will close',
          'Persuading residents to attend the meeting',
          'The residents who read the local paper',
          'The librarian\'s years of experience',
        ],
        answer: 0,
        explanations: [
          'Correct. The announcement is what prompted the letter.',
          'Incorrect. That is the purpose: what the letter hopes to accomplish.',
          'Incorrect. That is the audience.',
          'Incorrect. That describes the writer.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best describes the purpose of a speech given at a cemetery dedication that honors fallen soldiers and asks listeners to finish the cause they died for?',
          choices: [
            'To honor the dead and to commit the audience to continuing their cause',
            'To describe the cemetery\'s location',
            'To list the battle\'s casualties',
            'The dedication ceremony itself',
          ],
          answer: 0,
          explanations: [
            'Correct. The speech has two purposes, as Lincoln\'s did.',
            'Incorrect. That isn\'t what the speech is trying to do.',
            'Incorrect. The speech isn\'t a report.',
            'Incorrect. The ceremony is the occasion (exigence/context), not the purpose.',
          ],
        },
        {
          question: 'Which statement about purpose is accurate?',
          choices: [
            'A text can have more than one purpose',
            'Every text has exactly one purpose',
            'Purpose and exigence mean the same thing',
            'Purpose is determined only by the audience',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED says writers may have more than one purpose.',
            'Incorrect. Many texts do several things at once.',
            'Incorrect. Exigence prompts the text; purpose is its goal.',
            'Incorrect. The writer chooses the purpose, shaped by the whole situation.',
          ],
        },
      ],
      revisit:
        'Rhetorical situation: exigence (what prompted it), purpose (the goal, possibly several), audience, writer, context, message. ' +
        'Exigence looks back; purpose looks forward.',
    },
    {
      id: 'RHS-1.D–E',
      ced: 'RHS-1.D–E (skill 1.A)',
      title: 'Audience and Context',
      minutes: 6,
      summary:
        'An audience has shared and individual beliefs, values, needs and backgrounds. Writers create texts in a context: a time, ' +
        'place and occasion. Reading those two well explains why a writer makes the choices they do.',
      body: String.raw`### Audience
An audience isn't a blank slate. Its members share some **beliefs, values, needs and backgrounds** and differ on others. Ask:
- What do they already believe or value?
- What do they need or fear?
- What might make them resist the message?

### Context
**Time, place and occasion.** The same words mean something different in a different setting.

### A worked example: Douglass, 1852
| Part | In "What to the Slave Is the Fourth of July?" |
|---|---|
| **Writer** | Frederick Douglass, who had escaped slavery and become a famous abolitionist speaker |
| **Audience** | Members and supporters of the Rochester Ladies' Anti-Slavery Society: mostly white Northerners who opposed slavery but were celebrating the nation |
| **Context** | July 5, 1852, Rochester, New York; a Fourth of July event while slavery was legal and the Fugitive Slave Act (1850) forced Northerners to help return escapees |
| **Exigence** | The invitation to speak at a celebration of American liberty |
| **Purpose** | To expose the hypocrisy of celebrating freedom amid slavery and move the audience to stronger action |
| **Message** | The Fourth of July is a mockery to enslaved people until the nation lives up to its founding ideals |

Notice how the context sharpens the message: Douglass asks, "What, to the American slave, is your 4th of July?" Spoken on the holiday, to people celebrating it, the question lands far harder than it would in a pamphlet.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'A student writes to the school board asking for later start times after a new study links early classes to teen sleep loss. Label each detail.',
            buckets: ['Exigence', 'Purpose', 'Audience', 'Context'],
            items: [
              { label: 'A new study linking early classes to teen sleep loss', bucket: 0, why: 'The study prompted the letter.' },
              { label: 'To get the start time moved later', bucket: 1, why: 'What the letter hopes to accomplish.' },
              { label: 'School board members who must balance bus budgets and parents\' schedules', bucket: 2, why: 'The readers, with their own values and needs.' },
              { label: 'The board\'s budget meeting next month, when schedules are set', bucket: 3, why: 'The time and occasion of the letter.' },
              { label: 'To show the board that students have studied the issue seriously', bucket: 1, why: 'A second purpose: building credibility.' },
              { label: 'Parents and teachers who will read the letter in the board\'s public minutes', bucket: 2, why: 'A secondary audience.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which element of the rhetorical situation includes the time, place and occasion of a text?',
        choices: ['Context', 'Audience', 'Purpose', 'Message'],
        answer: 0,
        explanations: [
          'Correct. That is the CED\'s definition of context.',
          'Incorrect. Audience is who the text is for.',
          'Incorrect. Purpose is what the writer hopes to accomplish.',
          'Incorrect. Message is the main idea.',
        ],
      },
      checkpoints: [
        {
          question: 'A writer arguing for a new park in a town that values low taxes would most likely:',
          choices: [
            'Address cost concerns, for example by showing how the park could raise property values',
            'Ignore the audience\'s values and focus only on the beauty of parks',
            'Argue that taxes should be much higher',
            'Write the argument for a different town',
          ],
          answer: 0,
          explanations: [
            'Correct. Effective writers account for the audience\'s values and needs.',
            'Incorrect. Ignoring the audience\'s main concern weakens the argument.',
            'Incorrect. That would alienate this audience.',
            'Incorrect. The audience is this town.',
          ],
        },
        {
          question: 'Why does Douglass\'s question "What, to the American slave, is your 4th of July?" gain force from its context?',
          choices: [
            'It was asked at a Fourth of July event to people celebrating American liberty',
            'It was written long after slavery ended',
            'It was addressed to enslaved people in the South',
            'It was part of a scientific report',
          ],
          answer: 0,
          explanations: [
            'Correct. The occasion makes the hypocrisy impossible to ignore.',
            'Incorrect. It was delivered in 1852, while slavery was legal.',
            'Incorrect. The audience was Northern abolitionist supporters.',
            'Incorrect. It was a speech.',
          ],
        },
      ],
      revisit:
        'Audience: shared and individual beliefs, values, needs, backgrounds. Context: time, place, occasion. Together they explain ' +
        'a writer\'s choices (Douglass, July 5, 1852).',
    },
    {
      id: 'CLE-1.A–D',
      ced: 'CLE-1.A–D (skill 3.A)',
      title: 'Claims and Evidence',
      minutes: 7,
      summary:
        'Writers convey positions through claims that require a defense, and defend them with evidence and reasoning. Evidence can be ' +
        'facts, anecdotes, analogies, statistics, examples, details, illustrations, expert opinions, personal observations or ' +
        'experiences, testimonies or experiments. An effective claim provokes interest and needs defending; a known fact doesn\'t.',
      body: String.raw`### Claim vs. fact
| | Needs a defense? | Example |
|---|---|---|
| **Fact** | No: anyone can check it | "Many high schools start before 8 a.m." |
| **Claim** | Yes: a reasonable person could disagree | "Starting high school before 8 a.m. does more harm than good." |

An **effective claim** provokes interest and **requires a defense**. If no one could disagree, it isn't really an argument.

### Defending a claim
Writers defend claims with **evidence** and **reasoning** (the explanation of *how* the evidence supports the claim).

Types of evidence: **facts, anecdotes, analogies, statistics, examples, details, illustrations, expert opinions, personal observations, personal experiences, testimonies, experiments.**

### Finding claims and evidence in a text
1. Ask: *what is the writer trying to get me to believe or do?* That's the claim.
2. Ask: *what do they offer to make me believe it?* That's the evidence.
3. Name the **type** of evidence and think about why it suits this audience.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Does each statement need a defense?',
            buckets: ['Claim (needs defense)', 'Fact (no defense needed)'],
            items: [
              { label: 'Social media does more to isolate teenagers than to connect them.', bucket: 0, why: 'Reasonable people disagree, so it must be argued.' },
              { label: 'The Declaration of Independence was adopted in 1776.', bucket: 1, why: 'A checkable fact.' },
              { label: 'Schools should replace letter grades with written feedback.', bucket: 0, why: 'A position that requires defense.' },
              { label: 'Water boils at 100°C at sea level.', bucket: 1, why: 'An established fact.' },
              { label: 'Public libraries matter more in the internet age than ever before.', bucket: 0, why: 'Arguable, and interesting because of it.' },
              { label: 'Many people use smartphones.', bucket: 1, why: 'True and obvious; nobody needs convincing.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which is the most effective claim for an argument?',
        choices: [
          'Cities should ban cars from downtown streets on weekends.',
          'Many cities have downtown areas.',
          'Cars produce exhaust.',
          'Some people walk to work.',
        ],
        answer: 0,
        explanations: [
          'Correct. It takes a position someone could dispute, so it requires defense.',
          'Incorrect. That is an obvious fact.',
          'Incorrect. That is a known fact.',
          'Incorrect. That is an observation no one disputes.',
        ],
      },
      checkpoints: [
        {
          question: 'A writer supports a claim about school lunches by describing what she saw in her own cafeteria last week. What type of evidence is this?',
          choices: ['Personal observation', 'Statistics', 'Expert opinion', 'Experiment'],
          answer: 0,
          explanations: [
            'Correct. She reports what she personally observed.',
            'Incorrect. No numbers are given.',
            'Incorrect. She isn\'t citing an expert.',
            'Incorrect. Nothing was tested under controlled conditions.',
          ],
        },
        {
          question: 'Why is "Exercise is good for you" a weak claim for an argumentative essay?',
          choices: [
            'It states a widely accepted fact that requires no defense',
            'It is too specific',
            'It uses too much evidence',
            'It is a statistic',
          ],
          answer: 0,
          explanations: [
            'Correct. Effective claims provoke interest and require defense.',
            'Incorrect. It is actually too general.',
            'Incorrect. It contains no evidence.',
            'Incorrect. It contains no numbers.',
          ],
        },
      ],
      revisit:
        'Claim = a position requiring defense; fact = no defense needed. Defend with evidence + reasoning. Evidence types: facts, ' +
        'anecdotes, analogies, statistics, examples, details, illustrations, expert opinions, observations, experiences, testimonies, experiments.',
    },
    {
      id: 'CLE-1.E',
      ced: 'CLE-1.E (skill 4.A)',
      title: 'Writing a Claim-and-Evidence Paragraph',
      minutes: 7,
      summary:
        'Writers relate source material to their own argument by embedding quoted, paraphrased or summarized information into their ' +
        'own sentences. A strong paragraph states a claim that needs defending, brings in evidence smoothly, and explains how the evidence supports the claim.',
      body: String.raw`### Three ways to use a source
| Method | What it is | When to use it |
|---|---|---|
| **Quote** | The source's exact words, in quotation marks | The wording itself matters |
| **Paraphrase** | One idea in your own words, about the same length | The idea matters more than the words |
| **Summary** | The main points of a longer passage, shortened, in your own words | You need the big picture |

### Embed, don't drop
**Dropped quote** (weak): *Douglass criticized America. "What, to the American slave, is your 4th of July?"*

**Embedded quote** (strong): *Douglass turns the holiday against his audience when he asks, "What, to the American slave, is your 4th of July?", forcing listeners who came to celebrate liberty to see the day through the eyes of the enslaved.*

The embedded version joins the quote to the writer's own sentence **and** explains its effect.

### A paragraph's moves
1. **Claim**: a sentence that takes a defensible position.
2. **Evidence**: quoted, paraphrased or summarized, embedded in your sentences.
3. **Commentary**: explain how the evidence proves the claim (the part most students skip).

### Example
> Lincoln's Gettysburg Address works because it turns a funeral into a mission. Rather than dwelling on grief, he insists that "the world will little note, nor long remember what we say here, but it can never forget what they did here," shifting attention from the speakers to the soldiers. By making the living responsible for "the unfinished work," Lincoln converts mourning into a commitment to keep fighting.

Claim (first sentence) → embedded evidence → commentary explaining why it matters.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Quote', back: 'The source\'s exact words in quotation marks; use when the wording matters.' },
            { front: 'Paraphrase', back: 'One idea restated in your own words, about the same length.' },
            { front: 'Summary', back: 'The main points of a longer passage, shortened, in your own words.' },
            { front: 'Commentary', back: 'Your explanation of how the evidence supports your claim.' },
          ],
        },
      ],
      precheck: {
        question: 'A student restates a whole three-page article\'s main points in four sentences of their own words. This is:',
        choices: ['A summary', 'A direct quotation', 'A paraphrase of one sentence', 'A claim'],
        answer: 0,
        explanations: [
          'Correct. Summaries condense main points.',
          'Incorrect. A quote uses the source\'s exact words.',
          'Incorrect. A paraphrase restates one idea at about the same length.',
          'Incorrect. A claim is the writer\'s own position.',
        ],
      },
      checkpoints: [
        {
          question: 'Which sentence best embeds evidence into a writer\'s own argument?',
          choices: [
            'Lincoln reframes the war when he calls for "a new birth of freedom," suggesting the nation must become freer than before.',
            '"A new birth of freedom." Lincoln said this.',
            'Lincoln gave a speech. It was short.',
            'Here is a quote: "a new birth of freedom."',
          ],
          answer: 0,
          explanations: [
            'Correct. The quote is woven into the sentence and followed by commentary.',
            'Incorrect. The quote is dropped in with no connection to an argument.',
            'Incorrect. There is no evidence or claim.',
            'Incorrect. The quote is announced, not embedded or explained.',
          ],
        },
        {
          question: 'What is usually missing from a paragraph that has a claim and a quotation but still feels weak?',
          choices: [
            'Commentary explaining how the evidence supports the claim',
            'A second claim on a different topic',
            'More quotation marks',
            'A summary of the whole source',
          ],
          answer: 0,
          explanations: [
            'Correct. Evidence needs reasoning to connect it to the claim.',
            'Incorrect. A paragraph should develop one claim.',
            'Incorrect. Punctuation isn\'t the problem.',
            'Incorrect. More source material doesn\'t replace analysis.',
          ],
        },
      ],
      revisit:
        'Quote (exact words), paraphrase (one idea, your words), summary (main points, shorter). Embed evidence in your own ' +
        'sentences. Paragraph: claim → embedded evidence → commentary.',
    },
  ],
};

export default pack;
