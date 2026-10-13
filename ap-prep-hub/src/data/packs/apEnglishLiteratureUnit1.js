/**
 * AP English Literature and Composition Unit 1: Short Fiction I — study pack.
 *
 * Written against the AP English Literature and Composition CED effective
 * Fall 2024 (the current edition). The CED doesn't number topics, so sections
 * follow Unit 1's essential knowledge codes: character (CHR-1), setting
 * (SET-1), plot and structure (STR-1), narration (NAR-1) and literary
 * argumentation (LAN-1). Examples come from public-domain stories: Kate
 * Chopin's "The Story of an Hour" (1894) and Edgar Allan Poe's "The
 * Tell-Tale Heart" (1843). Two sorting activities.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-english-literature-and-composition/unit-1',
  subject: 'AP English Literature and Composition',
  unit: 'Unit 1: Short Fiction I',
  examWeight: 'no unit weighting (these skills appear across the whole exam)',
  intro:
    'The fundamentals of reading fiction closely: what details reveal about a character, how setting carries values, how plot ' +
    'orders events and builds conflict, who is telling the story and from where, and how to turn those observations into a claim ' +
    'you can defend with evidence. Examples come from Kate Chopin\'s "The Story of an Hour" and Poe\'s "The Tell-Tale Heart."',
  sections: [
    {
      id: 'CHR-1.A–D',
      ced: 'CHR-1.A–D (skill 1.A)',
      title: 'Character and Perspective',
      minutes: 7,
      summary:
        'Description, dialogue and behavior reveal characters. Descriptions can come from a narrator, other characters or the characters ' +
        'themselves. Perspective is how a character understands their circumstances, informed by background, personality, biases and ' +
        'relationships, and it is shaped and revealed by relationships, setting, events and ideas.',
      body: String.raw`### Three windows into a character
| Window | Ask | "The Story of an Hour" |
|---|---|---|
| **Description** | What are we told about them, and by whom? | Mrs. Mallard is "afflicted with a heart trouble," so the family breaks the news of her husband's death gently |
| **Dialogue** | What do they say, and how? | Alone, she whispers "free, free, free!" |
| **Behavior** | What do they do? | She weeps at once, then locks herself in her room rather than collapsing in shock |

Descriptions can come from a **narrator**, **other characters** or the **character herself**, and each source has its own angle.

### Perspective
**Perspective** is how a character (or narrator) understands their circumstances. It's shaped by **background, personality traits, biases and relationships**, and both **shaped and revealed** by:
- relationships with other characters,
- the environment (setting),
- events of the plot,
- the ideas the text explores.

Mrs. Mallard's perspective on her husband's death is revealed slowly: what the others assume is grief turns out to be something more complicated, as she realizes she will "live for herself."

### Moving from detail to insight
Don't stop at *what* a detail shows ("she cries"). Ask what it reveals about her **values, motives or perspective** ("her first tears are sincere, which makes her later joy more striking, not cruel").`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'How characters are revealed', back: 'Through description, dialogue and behavior.' },
            { front: 'Perspective', back: 'How a narrator or character understands their circumstances, informed by background, personality, biases and relationships.' },
            { front: 'Sources of character description', back: 'A speaker or narrator, other characters, or the characters themselves.' },
          ],
        },
      ],
      precheck: {
        question: 'Which three things does the CED name as revealing characters to readers?',
        choices: [
          'Description, dialogue and behavior',
          'Setting, plot and theme',
          'Rhyme, meter and stanza',
          'Title, length and genre',
        ],
        answer: 0,
        explanations: [
          'Correct. Those are the CED\'s three ways characters are revealed.',
          'Incorrect. Those are other elements of fiction.',
          'Incorrect. Those are features of poetry.',
          'Incorrect. Those don\'t reveal a character.',
        ],
      },
      checkpoints: [
        {
          question: 'A character is described as generous by her neighbors but is shown secretly refusing to lend money to her sister. What should a careful reader conclude?',
          choices: [
            'Her behavior complicates the neighbors\' description, so the neighbors\' perspective may be limited',
            'She is definitely generous because the neighbors say so',
            'The neighbors\' description is the narrator\'s opinion',
            'Behavior never reveals character',
          ],
          answer: 0,
          explanations: [
            'Correct. Descriptions come from someone with a perspective, and behavior can contradict them.',
            'Incorrect. Other characters\' descriptions aren\'t automatically reliable.',
            'Incorrect. This description comes from other characters.',
            'Incorrect. Behavior is one of the three main windows into character.',
          ],
        },
        {
          question: 'Which most directly shapes a character\'s perspective, according to the CED?',
          choices: [
            'Background, personality traits, biases and relationships',
            'The length of the story',
            'The author\'s date of birth',
            'The number of characters in the story',
          ],
          answer: 0,
          explanations: [
            'Correct. Those inform how a character understands circumstances.',
            'Incorrect. Length doesn\'t shape a character\'s outlook.',
            'Incorrect. The author isn\'t the character.',
            'Incorrect. That doesn\'t determine perspective.',
          ],
        },
      ],
      revisit:
        'Characters are revealed by description, dialogue, behavior; descriptions come from narrators, others or the character. ' +
        'Perspective = how they understand their circumstances, shaped by background, traits, biases, relationships.',
    },
    {
      id: 'SET-1.A',
      ced: 'SET-1.A (skill 2.A)',
      title: 'Setting',
      minutes: 5,
      summary:
        'Setting is the time and place in which a story\'s events occur. Setting details don\'t just depict where and when; they ' +
        'convey values associated with that setting and often mirror or contrast with a character\'s inner life.',
      body: String.raw`### More than a backdrop
**Setting = time + place.** But setting details also **convey values**: what a place, time or society treats as normal, desirable or forbidden.

### Setting in "The Story of an Hour"
- **Time**: the 1890s, when a married woman's life was largely bound to her husband's.
- **Place**: mostly one room in the Mallard house.
- Through her window, Mrs. Mallard sees "the tops of trees that were all aquiver with the new spring life," hears a peddler, a distant song and twittering sparrows, and patches of "blue sky."

Spring, open sky and new life outside the window **mirror** the new freedom she feels inside, while the closed house and the **marriage** of the era suggest what she felt confined by.

### Questions to ask about setting
1. What time and place?
2. Which details does the writer **choose** to show?
3. What **values** does the setting carry (class, gender roles, religion, freedom)?
4. Does the setting **reflect** or **contrast** with a character's state of mind?`,
      blocks: [],
      precheck: {
        question: 'According to the CED, setting includes:',
        choices: [
          'The time and place during which events occur',
          'Only the country where a story happens',
          'The order of events in the plot',
          'The narrator\'s point of view',
        ],
        answer: 0,
        explanations: [
          'Correct. Time and place together.',
          'Incorrect. Setting includes time as well as place, at any scale.',
          'Incorrect. That is plot.',
          'Incorrect. That is narration.',
        ],
      },
      checkpoints: [
        {
          question: 'In "The Story of an Hour," the spring scene outside Mrs. Mallard\'s window most likely functions to:',
          choices: [
            'Mirror the sense of new life and freedom she begins to feel',
            'Show that the story takes place in a city in winter',
            'Explain how her husband\'s accident happened',
            'Introduce a new main character',
          ],
          answer: 0,
          explanations: [
            'Correct. The renewal outside parallels her inner awakening.',
            'Incorrect. The scene is full of spring life.',
            'Incorrect. The accident is reported, not shown through the window.',
            'Incorrect. The window scene adds no new main character.',
          ],
        },
        {
          question: 'Which statement best reflects the CED\'s view of setting?',
          choices: [
            'Setting details can convey values associated with a time and place',
            'Setting matters only in historical fiction',
            'Setting is unrelated to character',
            'Setting is always described in the first paragraph',
          ],
          answer: 0,
          explanations: [
            'Correct. Setting carries values, not just location.',
            'Incorrect. Every story has a setting that can carry meaning.',
            'Incorrect. Setting often reflects or shapes characters.',
            'Incorrect. Setting can be revealed anywhere.',
          ],
        },
      ],
      revisit:
        'Setting = time + place; details convey values and can mirror or contrast with a character (Mrs. Mallard\'s spring window).',
    },
    {
      id: 'STR-1.A–C',
      ced: 'STR-1.A–C (skills 3.A, 3.B)',
      title: 'Plot and Dramatic Situation',
      minutes: 6,
      summary:
        'Plot is the sequence of events, each building on the others, often by cause and effect. The dramatic situation is the setting ' +
        'and action that place characters in conflict, often with rising or falling fortunes. Plot and exposition direct attention to ' +
        'what matters most: characters, relationships and setting.',
      body: String.raw`### Plot
**Plot** is the sequence of events in a narrative. Events are **connected**: each builds on the last, often by **cause and effect**.

### Dramatic situation
The **dramatic situation** combines the **setting** and the **action** of the plot to put characters into **conflict**, often with the **rising or falling fortunes** of a main character.

In "The Story of an Hour":
1. News arrives that Brently Mallard has died in a railroad disaster (**exposition** and **inciting event**).
2. Mrs. Mallard grieves, then, alone, realizes she is free (**rising action**: an internal conflict between what she's expected to feel and what she does feel).
3. She emerges triumphant: her fortunes have **risen**.
4. Her husband walks in alive; he had been nowhere near the accident (**reversal**).
5. She dies; the doctors say "of the joy that kills" (**ending**, loaded with irony).

### Why the order matters
Writers choose **what to reveal and when**. Chopin keeps the reader inside Mrs. Mallard's room for most of the story, so we know what the doctors never learn. That **sequence** creates the ironic ending: the reader understands her death differently than the other characters do.

**Exposition** (background information) focuses attention on what matters: here, her heart trouble, planted in the first sentence, which pays off at the end.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Order the events of "The Story of an Hour"',
            events: [
              { year: 1, label: 'Josephine gently tells her sister of Brently\'s death' },
              { year: 2, label: 'Mrs. Mallard goes alone to her room' },
              { year: 3, label: 'She whispers "free, free, free!"' },
              { year: 4, label: 'She comes downstairs with her sister' },
              { year: 5, label: 'Brently Mallard opens the front door, unharmed' },
              { year: 6, label: 'The doctors blame "the joy that kills"' },
            ],
            hideYears: true,
          },
        },
      ],
      precheck: {
        question: 'Plot is best defined as:',
        choices: [
          'The sequence of connected events in a narrative',
          'The time and place of a story',
          'The narrator\'s attitude',
          'The story\'s main theme',
        ],
        answer: 0,
        explanations: [
          'Correct. Events build on each other, often by cause and effect.',
          'Incorrect. That is setting.',
          'Incorrect. That relates to narration and tone.',
          'Incorrect. Theme is a larger idea.',
        ],
      },
      checkpoints: [
        {
          question: 'Why does the information that Mrs. Mallard has heart trouble appear in the story\'s first sentence?',
          choices: [
            'It is exposition that sets up the ending',
            'It is the story\'s main conflict',
            'It reveals the narrator is a doctor',
            'It has no connection to later events',
          ],
          answer: 0,
          explanations: [
            'Correct. Early exposition focuses attention on a detail that pays off at the end.',
            'Incorrect. The main conflict is her internal struggle over freedom.',
            'Incorrect. The narrator is not a character.',
            'Incorrect. It directly connects to her death.',
          ],
        },
        {
          question: 'Which best describes the dramatic situation for most of "The Story of an Hour"?',
          choices: [
            'A woman alone in her room in conflict between expected grief and a growing sense of freedom',
            'A railroad crash described in detail',
            'A courtroom trial',
            'A journey across the country',
          ],
          answer: 0,
          explanations: [
            'Correct. Setting plus action places her in an internal conflict.',
            'Incorrect. The crash is only reported.',
            'Incorrect. There is no trial.',
            'Incorrect. She stays in the house.',
          ],
        },
      ],
      revisit:
        'Plot = connected sequence of events (cause and effect). Dramatic situation = setting + action creating conflict, rising/falling ' +
        'fortunes. Sequence and exposition direct attention (heart trouble → ending).',
    },
    {
      id: 'NAR-1.A–I',
      ced: 'NAR-1.A–I (skills 4.A, 4.B)',
      title: 'Narrator and Point of View',
      minutes: 7,
      summary:
        'Narrators relate the story and establish a relationship with the reader. Perspective is how someone sees their circumstances; ' +
        'point of view is the position from which the story is told. The narrator isn\'t necessarily the author. First-person narrators ' +
        'are involved in events; third-person narrators are outside observers whose knowledge ranges from observational to all-knowing.',
      body: String.raw`### Perspective vs. point of view
- **Perspective**: how narrators, characters or speakers **see their circumstances**.
- **Point of view**: the **position** from which a narrator relates the events.

**The narrator is not necessarily the author.** Poe did not murder an old man; his narrator did.

### Points of view
| Point of view | Narrator is | Effect |
|---|---|---|
| **First person** ("I") | **Involved** in the story; may be a character | Intimate, but limited and possibly **biased** by their role |
| **Third person, observational** ("he/she/they") | An **outside observer** reporting only what can be seen and heard | Objective feel; the reader infers thoughts |
| **Third person, all-knowing** | An outside observer who can enter **any** character's mind | Wide understanding; can reveal what characters hide |

Third-person narrators' outside position means they **may not be affected** by events.

### Two examples
- **"The Tell-Tale Heart"** (first person): the narrator insists, "why will you say that I am mad?" His involvement and his obsession shape everything he reports, so the reader learns not to trust his claims of calm.
- **"The Story of an Hour"** (third person): the narrator follows Mrs. Mallard's thoughts closely, giving us access the other characters never have. That gap creates the ending's irony.

Point of view controls **what the narrator can and cannot tell us**, based on their involvement and closeness to events.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Identify the point of view of each opening line.',
            buckets: ['First person', 'Third person, observational', 'Third person, all-knowing'],
            items: [
              { label: '"I never meant to keep the letter, but by the time I found it, it was too late to give it back."', bucket: 0, why: 'The narrator says "I" and is part of the events.' },
              { label: '"She set the cup down hard and left the room. He did not look up."', bucket: 1, why: 'Only actions are reported; no one\'s thoughts.' },
              { label: '"Marta smiled, though she was furious; across the table, her father wondered if she would ever forgive him."', bucket: 2, why: 'The narrator enters two characters\' minds.' },
              { label: '"We moved to the coast the summer my brother stopped speaking."', bucket: 0, why: 'A first-person plural narrator involved in the story.' },
              { label: '"The bus arrived at 6:10. Two passengers stepped off; one carried a cello case."', bucket: 1, why: 'An outside observer describing only what can be seen.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'What is the difference between perspective and point of view?',
        choices: [
          'Perspective is how someone sees their circumstances; point of view is the position from which a story is told',
          'They mean the same thing',
          'Point of view is the author\'s opinion; perspective is the setting',
          'Perspective applies only to first-person narrators',
        ],
        answer: 0,
        explanations: [
          'Correct. That is how the CED distinguishes them.',
          'Incorrect. The CED defines them differently.',
          'Incorrect. Neither term means the author\'s opinion or setting.',
          'Incorrect. Any narrator, character or speaker has a perspective.',
        ],
      },
      checkpoints: [
        {
          question: 'A first-person narrator repeatedly insists he is perfectly calm while describing a crime in feverish detail. The most likely effect is that readers:',
          choices: [
            'Distrust the narrator, because his involvement shapes and distorts his account',
            'Accept everything he says as objective fact',
            'Assume the author committed the crime',
            'Learn the thoughts of every other character',
          ],
          answer: 0,
          explanations: [
            'Correct. First-person narrators\' involvement shapes their perspective, as in "The Tell-Tale Heart."',
            'Incorrect. The gap between his claims and his telling invites doubt.',
            'Incorrect. The narrator is not necessarily the author.',
            'Incorrect. A first-person narrator can\'t enter others\' minds.',
          ],
        },
        {
          question: 'Which statement about third-person narrators is consistent with the CED?',
          choices: [
            'Their knowledge can range from observational to all-knowing',
            'They are always characters in the story',
            'They can never reveal a character\'s thoughts',
            'They are always the author speaking directly',
          ],
          answer: 0,
          explanations: [
            'Correct. That range shapes their perspective.',
            'Incorrect. They are outside observers.',
            'Incorrect. All-knowing narrators can.',
            'Incorrect. The narrator isn\'t necessarily the author.',
          ],
        },
      ],
      revisit:
        'Perspective = how one sees circumstances; point of view = narrating position. Narrator ≠ author. First person: involved, ' +
        'perspective shaped by role. Third person: outside observer, observational to all-knowing.',
    },
    {
      id: 'LAN-1.A–C',
      ced: 'LAN-1.A–C (skill 7.A)',
      title: 'Claims and Evidence in Literary Analysis',
      minutes: 6,
      summary:
        'Literary analysis starts with close reading for details that, together, support a claim about the text. A claim is a statement ' +
        'that requires defense with textual evidence. A paragraph\'s first components are the claim and the evidence that defends it, ' +
        'cited briefly rather than summarized.',
      body: String.raw`### Claim vs. observation
| Observation (no defense needed) | Claim (needs defense) |
|---|---|
| Mrs. Mallard locks herself in her room. | Mrs. Mallard's grief for her husband is real, but her joy at escaping her marriage is stronger. |
| The story is about an hour long. | Chopin compresses the story into an hour to show how quickly a lifetime of restraint can come undone. |
| The narrator of "The Tell-Tale Heart" says he is not mad. | Poe's narrator undermines his own sanity in the very act of defending it. |

A claim is an **interpretation**: a reasonable reader could disagree, so you have to prove it.

### From details to a claim
1. Read closely and **collect details** about character, setting, plot or narration.
2. Look for a **pattern or tension** among them.
3. State a **claim** about what the pattern means.

### The paragraph
**Claim + textual evidence** are the starting components.
> Chopin suggests that Mrs. Mallard's awakening is natural rather than wicked. The scene she watches is full of "the new spring life," with "patches of blue sky" breaking through the clouds, so the language of renewal surrounds her as she whispers "free, free, free!"

Cite **brief, specific** words from the text instead of summarizing the plot. Summary instead of evidence is one of the most common weaknesses on the exam.`,
      blocks: [],
      precheck: {
        question: 'Which is a defensible claim about "The Story of an Hour" rather than a plot observation?',
        choices: [
          'Chopin uses the ironic ending to expose how little others understood Mrs. Mallard\'s inner life.',
          'Mrs. Mallard has heart trouble.',
          'Brently Mallard returns home at the end.',
          'The story takes place in a house.',
        ],
        answer: 0,
        explanations: [
          'Correct. It is an interpretation that needs textual support.',
          'Incorrect. That is a stated fact.',
          'Incorrect. That is a plot event.',
          'Incorrect. That is an observation about setting.',
        ],
      },
      checkpoints: [
        {
          question: 'What are the initial components of a literary analysis paragraph, according to the CED?',
          choices: [
            'A claim and the textual evidence that defends it',
            'A plot summary and a biography of the author',
            'A thesis and a counterargument',
            'A quotation and a dictionary definition',
          ],
          answer: 0,
          explanations: [
            'Correct. Claim plus evidence comes first.',
            'Incorrect. Summary and biography aren\'t analysis.',
            'Incorrect. Those come later in full essays.',
            'Incorrect. A definition isn\'t a claim.',
          ],
        },
        {
          question: 'A student writes three sentences retelling what happens in the story after stating a claim. What is the main problem?',
          choices: [
            'Summary is replacing brief, specific textual evidence',
            'The claim is too interesting',
            'There are too many quotations',
            'Literary analysis should not include claims',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED warns summary is a common weakness.',
            'Incorrect. Interesting claims are good.',
            'Incorrect. There are no quotations at all.',
            'Incorrect. Claims are the core of analysis.',
          ],
        },
      ],
      revisit:
        'Claim = interpretation that needs textual defense; observations don\'t. Collect details → find a pattern → claim. ' +
        'Paragraph starts with claim + brief, specific evidence, not summary.',
    },
  ],
};

export default pack;
