/**
 * AP Latin Unit 1: Teacher's Choice – Latin Prose — study pack.
 *
 * Written against the AP Latin CED effective Fall 2025 (the current edition).
 * Unit 1's readings are the teacher's choice, so the required content is the
 * grammar reviewed in Readings 1.1–1.4 (GRAM essential knowledge), plus
 * vocabulary, summarizing, literal translation and citing Latin evidence. All
 * Latin examples are written for this pack. The exam is weighted by skill, not
 * unit. Activities: a case lab and a case-use sort.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-latin/unit-1',
  subject: 'AP Latin',
  unit: 'Unit 1: Teacher’s Choice – Latin Prose',
  examWeight: 'no unit weighting (the exam is weighted by skill)',
  intro:
    'Unit 1 rebuilds the grammar you need to read real Latin prose: cases and what they do, verbs in every indicative tense and both ' +
    'voices, pronouns and adjectives, the subjunctive and imperative, and participles. It ends where the exam begins: translating ' +
    'literally and citing specific Latin to support an interpretation.',
  sections: [
    {
      id: '1.1',
      ced: 'GRAM-1.A, 1.B, 1.I; GRAM-4.B',
      title: 'Reading 1.1: Nouns, Subjects, and Objects',
      minutes: 7,
      summary:
        'Latin nouns have gender, number and case, shown by endings that depend on the declension. A nominative noun can be the subject; ' +
        'an accusative noun can be the direct object. Because endings carry the meaning, word order is flexible. Prepositional phrases ' +
        'pair a preposition with a noun, usually in the accusative or ablative.',
      body: String.raw`### Gender, number, case
Every Latin noun has a **gender** (masculine, feminine, neuter), a **number** (singular, plural) and a **case** (its job in the sentence). **Endings** show number and case, and which endings a noun uses depends on its **declension** (its group). The declension sometimes, but not always, signals gender.

| Declension | Example | Nominative sg. | Accusative sg. |
|---|---|---|---|
| 1st | puella (girl) | puella | puellam |
| 2nd | servus (enslaved man) | servus | servum |
| 3rd | rex (king) | rex | regem |

### Subject and direct object
- **Nominative**: the **subject**, the one doing the action. *Puella* canem videt. (The **girl** sees the dog.)
- **Accusative**: the **direct object**, receiving the action. Puella **canem** videt. (The girl sees the **dog**.)

Since endings, not position, show who does what, *Canem puella videt* means the same thing. Latin often puts the verb **last**.

### Prepositional phrases
A **preposition** + a noun, most often in the **accusative** (often motion toward: *in villam*, into the house) or the **ablative** (often location or separation: *in villa*, in the house; *ex urbe*, out of the city).

Use the case lab: change the word order and watch the English stay the same.`,
      blocks: [{ type: 'sim', sim: 'case-lab' }],
      precheck: {
        question: 'In "Agricolam puer vocat," who is calling?',
        choices: ['The boy (puer, nominative)', 'The farmer (agricolam, accusative)', 'Both of them', 'It can\'t be told without word order'],
        answer: 0,
        explanations: [
          'Correct. Puer is nominative, so it is the subject: The boy calls the farmer.',
          'Incorrect. Agricolam is accusative, the direct object.',
          'Incorrect. The verb is singular with one subject.',
          'Incorrect. The endings show the roles regardless of order.',
        ],
      },
      checkpoints: [
        {
          question: 'Which phrase means "into the city"?',
          choices: ['in urbem', 'in urbe', 'ex urbe', 'urbs'],
          answer: 0,
          explanations: [
            'Correct. In + accusative shows motion into.',
            'Incorrect. In + ablative means "in the city" (location).',
            'Incorrect. Ex + ablative means "out of the city."',
            'Incorrect. That is just the nominative "city."',
          ],
        },
        {
          question: 'What three features does every Latin noun have?',
          choices: ['Gender, number and case', 'Tense, voice and mood', 'Person, number and tense', 'Degree, gender and voice'],
          answer: 0,
          explanations: [
            'Correct. Endings show number and case; gender is part of the noun.',
            'Incorrect. Those describe verbs.',
            'Incorrect. Those also describe verbs.',
            'Incorrect. Degree belongs to adjectives and adverbs; voice to verbs.',
          ],
        },
      ],
      revisit:
        'Nouns: gender, number, case, shown by declension endings. Nominative = subject; accusative = direct object; order is ' +
        'flexible. Prepositions + accusative (motion toward) or ablative (place, separation).',
    },
    {
      id: '1.2',
      ced: 'GRAM-1.C; GRAM-2.A–C, 2.K',
      title: 'Reading 1.2: Verbs, Tenses, and Voice',
      minutes: 8,
      summary:
        'A linking verb joins two nominatives. A verb\'s stem and ending show person, number, tense, voice and mood; its conjugation ' +
        'sets the endings, and irregular verbs like sum, esse break the pattern (and can be left out). The indicative states facts in ' +
        'six tenses. Active voice: the subject acts; passive: the subject is acted on.',
      body: String.raw`### Linking verbs
When a verb like **sum, esse** (to be) connects two ideas, **both are nominative**: *Marcus est agricola* (Marcus is a farmer). Forms of *sum* are sometimes **left out** and must be supplied from context.

### What a verb's form tells you
Stem + ending show **person** (I, you, he/she/it…), **number**, **tense**, **voice** and **mood**. The **conjugation** (group) decides the endings; **irregular** verbs such as *sum, esse* don't follow the pattern.

### The indicative: six tenses
The **indicative** mood states facts. Using *portare* (to carry), third person singular:
| Tense | Latin | English |
|---|---|---|
| **Present** | portat | carries, is carrying |
| **Imperfect** | portabat | was carrying, used to carry |
| **Future** | portabit | will carry |
| **Perfect** | portavit | carried, has carried, did carry |
| **Pluperfect** | portaverat | had carried |
| **Future perfect** | portaverit | will have carried |

The imperfect describes **ongoing or repeated** past action; the perfect describes a **completed** one.

### Active and passive voice
- **Active**: the subject **does** the action. *Puella epistulam portat.* (The girl carries the letter.)
- **Passive**: the action is **done to** the subject. *Epistula a puella portatur.* (The letter is carried by the girl.)

Each voice has its own endings (passive present: *-tur*, imperfect *-batur*, and so on).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'portabat', back: 'Imperfect: was carrying / used to carry.' },
            { front: 'portavit', back: 'Perfect: carried / has carried.' },
            { front: 'portaverat', back: 'Pluperfect: had carried.' },
            { front: 'portabit', back: 'Future: will carry.' },
            { front: 'portatur', back: 'Present passive: is (being) carried.' },
          ],
        },
      ],
      precheck: {
        question: 'Which tense is "portaverat"?',
        choices: ['Pluperfect: had carried', 'Perfect: carried', 'Imperfect: was carrying', 'Future perfect: will have carried'],
        answer: 0,
        explanations: [
          'Correct. Perfect stem portav- + -erat = pluperfect.',
          'Incorrect. The perfect is portavit.',
          'Incorrect. The imperfect is portabat.',
          'Incorrect. The future perfect is portaverit.',
        ],
      },
      checkpoints: [
        {
          question: 'In "Marcus est agricola," why is agricola nominative?',
          choices: [
            'It is linked to the subject by the verb "est"',
            'It is the direct object of "est"',
            'All first-declension nouns are always nominative',
            'It shows possession',
          ],
          answer: 0,
          explanations: [
            'Correct. A linking verb connects two nominatives.',
            'Incorrect. Sum doesn\'t take a direct object.',
            'Incorrect. First-declension nouns have every case.',
            'Incorrect. Possession is genitive.',
          ],
        },
        {
          question: 'Which sentence is in the passive voice?',
          choices: ['Canis a puero vocatur.', 'Puer canem vocat.', 'Puer canem vocabat.', 'Puer canem vocabit.'],
          answer: 0,
          explanations: [
            'Correct. "The dog is called by the boy": the subject receives the action (-tur).',
            'Incorrect. The boy (subject) is doing the calling: active.',
            'Incorrect. Active imperfect.',
            'Incorrect. Active future.',
          ],
        },
      ],
      revisit:
        'Linking verbs (sum) join two nominatives; sum can be omitted. Verb form = person, number, tense, voice, mood; conjugation ' +
        'sets endings. Indicative tenses: present, imperfect, future, perfect, pluperfect, future perfect. Active vs. passive.',
    },
    {
      id: '1.3',
      ced: 'GRAM-1.D–F, 1.J; GRAM-3.D–E',
      title: 'Reading 1.3: Genitive, Dative, and Pronouns',
      minutes: 7,
      summary:
        'The genitive usually shows possession, but also description, the whole of which something is part, and an object implied by a ' +
        'noun. The dative shows to or for whom something is done, often with verbs of speaking, giving and showing. The accusative can ' +
        'show duration of time. Pronouns have gender, number and case, and agree with their antecedents in number and gender.',
      body: String.raw`### Genitive: "of"
| Use | Example | Translation |
|---|---|---|
| **Possession** | villa amici | my friend's house |
| **Description** | femina magnae sapientiae | a woman of great wisdom |
| **Partitive** (the whole) | plus vini | more (of) wine |
| **Objective** (object implied by the noun) | cupiditas regni | desire for a kingdom |

### Dative: "to / for"
Shows the person **to whom, for whom, or to whose advantage** something is done; common with verbs of **speaking, giving and showing**.
*Puer librum magistro dat.* The boy gives the book **to the teacher**.

### Accusative of duration
The accusative can show **how long**: *multos annos*, for many years.

### Pronouns and antecedents
Pronouns have **gender, number and case**. A pronoun **agrees in number and gender** with its **antecedent** (the noun it replaces), but its **case** comes from its own job in its own clause.
*Marcus amicum videt et **eum** salutat.* Marcus sees his friend and greets **him**. (*eum* is masculine singular like *amicum*; it's accusative because it's the object of *salutat*.)`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which case expresses the quoted idea in each phrase?',
            buckets: ['Nominative', 'Genitive', 'Dative', 'Accusative', 'Ablative'],
            items: [
              { label: 'Puella cantat: "the girl" (subject)', bucket: 0, why: 'The subject of the verb.' },
              { label: 'villa amici: "of my friend"', bucket: 1, why: 'Possession.' },
              { label: 'plus vini: "of wine"', bucket: 1, why: 'Partitive genitive: the whole.' },
              { label: 'librum magistro dat: "to the teacher"', bucket: 2, why: 'Indirect object with a verb of giving.' },
              { label: 'multos annos: "for many years"', bucket: 3, why: 'Duration of time.' },
              { label: 'canem videt: "the dog" (object)', bucket: 3, why: 'Direct object.' },
              { label: 'gladio pugnat: "with a sword"', bucket: 4, why: 'Means: what the action is done with.' },
              { label: 'prima luce: "at first light"', bucket: 4, why: 'Time when.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'In "femina magnae sapientiae," what does the genitive show?',
        choices: ['A description: a woman of great wisdom', 'Possession by wisdom', 'The indirect object', 'Duration of time'],
        answer: 0,
        explanations: [
          'Correct. A genitive of description.',
          'Incorrect. Wisdom doesn\'t own the woman; the genitive describes her.',
          'Incorrect. That would be dative.',
          'Incorrect. Duration is accusative.',
        ],
      },
      checkpoints: [
        {
          question: 'In "Marcus sororem videt et eam salutat," what is the antecedent of eam?',
          choices: ['sororem (his sister)', 'Marcus', 'videt', 'salutat'],
          answer: 0,
          explanations: [
            'Correct. Eam is feminine singular, agreeing with sororem.',
            'Incorrect. Marcus is masculine; eam is feminine.',
            'Incorrect. Videt is a verb.',
            'Incorrect. Salutat is a verb.',
          ],
        },
        {
          question: 'Which phrase shows how long something lasted?',
          choices: ['tres dies (for three days)', 'tertio die (on the third day)', 'regi (to the king)', 'regis (of the king)'],
          answer: 0,
          explanations: [
            'Correct. The accusative shows duration.',
            'Incorrect. The ablative shows time when.',
            'Incorrect. That is dative.',
            'Incorrect. That is genitive.',
          ],
        },
      ],
      revisit:
        'Genitive: possession, description, partitive, objective. Dative: to/for whom (giving, speaking, showing). Accusative: duration. ' +
        'Pronouns agree with antecedents in number and gender; case from their own clause.',
    },
    {
      id: '1.4',
      ced: 'GRAM-1.K; GRAM-2.E, 2.J, 2.R; GRAM-3.A; INT-4, INT-5',
      title: 'Reading 1.4: Ablative, Moods, Participles, Adjectives, and Evidence',
      minutes: 9,
      summary:
        'The ablative shows means, agent, manner, place or time, and separation. The subjunctive in a main clause means may, might, would, ' +
        'should, let or I wish; the imperative gives commands. Participles are verbal adjectives that agree with nouns and have tense and ' +
        'voice. Adjectives agree in gender, number and case and can stand alone as nouns. Interpretations need specific Latin evidence.',
      body: String.raw`### Ablative uses
| Use | Example | Translation |
|---|---|---|
| **Means** | gladio pugnat | fights **with a sword** |
| **Agent** (with a/ab, passive verb) | a puella vocatur | is called **by the girl** |
| **Manner** | magna cura | **with great care** |
| **Place where** | in villa | **in the house** |
| **Time when** | prima luce | **at first light** |
| **Separation** | ab urbe | **away from the city** |

### Moods
- **Subjunctive** in a main clause: "may, might, would, should, let, I wish." *Eamus!* **Let us go!**
- **Imperative**: commands. *Porta!* Carry! (to one person); *Portate!* (to more than one).

### Participles
**Verbal adjectives**: like adjectives they **agree** with a noun in case, number and gender; like verbs they have **tense and voice** and can take objects.
- *puella cantans*: the **singing** girl (present active)
- *epistula scripta*: the letter **having been written** (perfect passive)

### Adjectives
Adjectives **agree in gender, number and case** with the noun they describe: *servus bonus*, *puellae bonae*. Endings come from the **first three declensions**, so an adjective's ending may **look different** from its noun's (*agricola bonus*: a good farmer). Used alone, an adjective can act as a noun (**substantive**): *boni*, good men.

### Citing evidence
Analysis questions ask you to **cite specific Latin** and **explain** how it supports an interpretation. Quote the exact words (*magna cura*), translate or paraphrase them, and say what they show (the speaker's caution, a character's emotion). A vague summary isn't evidence.`,
      blocks: [],
      precheck: {
        question: 'In "Epistula a servo portatur," what does "a servo" show?',
        choices: ['Agent: by the enslaved man', 'Means: with an enslaved man', 'Place where', 'The direct object'],
        answer: 0,
        explanations: [
          'Correct. A/ab + ablative with a passive verb names the person who does the action.',
          'Incorrect. Means uses the ablative without a preposition for things, not people.',
          'Incorrect. There is no location here.',
          'Incorrect. The direct object would be accusative.',
        ],
      },
      checkpoints: [
        {
          question: 'Why is "agricola bonus" grammatically correct even though the endings look different?',
          choices: [
            'Adjectives agree in gender, number and case, not in the shape of the ending',
            'Agricola is neuter',
            'Bonus is an adverb',
            'Adjectives never agree with nouns',
          ],
          answer: 0,
          explanations: [
            'Correct. Agricola is a masculine first-declension noun; bonus is masculine nominative singular.',
            'Incorrect. Agricola is masculine.',
            'Incorrect. Bonus is an adjective.',
            'Incorrect. Agreement is required.',
          ],
        },
        {
          question: 'A student claims a speaker is cautious. Which is the best evidence?',
          choices: [
            'Citing "magna cura" (with great care) and explaining that it shows deliberate caution',
            'Writing "the speaker seems careful" with no Latin',
            'Summarizing the whole passage in English',
            'Quoting a Latin word unrelated to the claim',
          ],
          answer: 0,
          explanations: [
            'Correct. Specific Latin plus an explanation of how it supports the claim.',
            'Incorrect. There is no Latin evidence.',
            'Incorrect. A summary is not specific evidence.',
            'Incorrect. Evidence must support the interpretation.',
          ],
        },
      ],
      revisit:
        'Ablative: means, agent (a/ab), manner, place where, time when, separation. Subjunctive (may/let/would), imperative (commands). ' +
        'Participles agree like adjectives, have tense and voice. Adjectives agree in gender, number, case; substantives. Cite specific Latin and explain.',
    },
  ],
};

export default pack;
