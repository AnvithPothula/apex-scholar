/**
 * AP Psychology Unit 2: Cognition — study pack.
 *
 * Written against the AP Psychology CED (2024, topics 2.1–2.8), using only the
 * depth cues the CED lists (its exclusion statement) and leaving out labels for
 * cognitive abilities and disabilities (also excluded). The memory sections
 * adapt the "AP Exam Focus Points" contrasts from Dan McCreary's Psychology
 * textbook (CC BY-NC-SA 4.0); see `credits`. Import-free for prerender.
 */

const steps = (spec) => '```apex-steps\n' + JSON.stringify(spec) + '\n```';

const pack = {
  slug: 'ap-psychology/unit-2',
  subject: 'AP Psychology',
  unit: 'Unit 2: Cognition',
  examWeight: '15–25% of the exam',
  intro:
    'How the mind takes in, organizes, stores and uses information: perception, thinking and decisions, memory from encoding to forgetting, ' +
    'and how intelligence is defined and measured. Expect scenario questions that hinge on telling two similar terms apart.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Psychology',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/psychology/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'The memory sections adapt its chapter 6 and 7 "AP Exam Focus Points".',
    },
  ],
  sections: [
    {
      id: '2.1',
      ced: '2.1.A, 2.1.B',
      title: 'Perception',
      minutes: 8,
      summary:
        'Perception mixes bottom-up processing (building from sensory input) with top-down processing (expectations, schemas, perceptual set, ' +
        'context and culture). Gestalt principles organize what we see; attention is selective, and inattention causes change blindness. Binocular ' +
        'and monocular cues give depth, constancies keep objects stable, and apparent movement can be seen where there is none.',
      body: `### Bottom-up and top-down
- **Bottom-up processing**: starts from the raw sensory input and builds up.
- **Top-down processing**: uses what you already know and expect to interpret the input.

Internal filters: **schemas** (mental frameworks) and **perceptual set** (being primed to see something a certain way). External filters: **context**, **experience** and **cultural expectations**.

### Gestalt principles
| Principle | We tend to… |
|---|---|
| **Closure** | Fill gaps to see a complete figure |
| **Figure and ground** | Separate an object from its background |
| **Proximity** | Group things that are close together |
| **Similarity** | Group things that look alike |

### Attention
- **Selective attention**: the **cocktail party effect**, hearing your own name across a noisy room.
- **Inattention** can make you blind to things: **change blindness** is missing a change in the scene because your attention was elsewhere.

### Depth and motion
- **Binocular cues** (need both eyes): **retinal disparity** (each eye's image differs slightly) and **convergence** (the eyes turn inward for near objects).
- **Monocular cues** (one eye, also how flat pictures show depth): **relative clarity** (hazy = far), **relative size** (smaller = far), **texture gradient** (finer texture = far), **linear perspective** (parallel lines meet in the distance), **interposition** (the object in front blocks the one behind). These five are the ones the exam uses.
- **Perceptual constancies** keep an object's perceived size, shape and color stable as its image on the retina changes.
- **Apparent movement**: seeing motion where there is none (flipbooks, movies, blinking lights).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Bottom-up vs top-down processing', back: 'Bottom-up: from sensory data. Top-down: from expectations and knowledge.' },
            { front: 'Perceptual set', back: 'A mental readiness to perceive something in a particular way' },
            { front: 'Closure', back: 'Filling in gaps to see a whole figure' },
            { front: 'Change blindness', back: 'Failing to notice a change because attention was elsewhere' },
            { front: 'Binocular depth cues', back: 'Retinal disparity and convergence' },
            { front: 'Interposition', back: 'An object blocking another looks closer' },
          ],
        },
      ],
      precheck: {
        question: 'You read a messy handwritten word correctly because the sentence around it makes the meaning obvious. This is:',
        choices: ['Top-down processing', 'Bottom-up processing', 'Sensory adaptation', 'Retinal disparity'],
        answer: 0,
        explanations: [
          'Correct. Context and expectations guided your interpretation.',
          'Incorrect. Bottom-up would build the word from the marks alone, which were too messy.',
          'Incorrect. Sensory adaptation is reduced sensitivity to an unchanging stimulus.',
          'Incorrect. Retinal disparity is a binocular depth cue.',
        ],
      },
      checkpoints: [
        {
          question: 'You see a circle with a small gap in it as a complete circle. Which Gestalt principle is at work?',
          choices: ['Closure', 'Proximity', 'Similarity', 'Figure and ground'],
          answer: 0,
          explanations: [
            'Correct. Closure fills gaps to make whole figures.',
            'Incorrect. Proximity groups things that are near each other.',
            'Incorrect. Similarity groups things that look alike.',
            'Incorrect. Figure and ground separates an object from its background.',
          ],
        },
        {
          question: 'In a photograph, railroad tracks seem to meet in the distance. Which depth cue is this?',
          choices: ['Linear perspective', 'Retinal disparity', 'Interposition', 'Convergence'],
          answer: 0,
          explanations: [
            'Correct. Parallel lines appearing to converge with distance is linear perspective.',
            'Incorrect. Retinal disparity needs two eyes, but a photo is one flat image.',
            'Incorrect. Interposition is one object blocking another.',
            'Incorrect. Convergence is the eyes turning inward; it needs two eyes and a real near object.',
          ],
        },
      ],
      revisit:
        'Bottom-up = from the senses; top-down = from expectations. Gestalt: closure, figure-ground, proximity, similarity. Binocular: disparity, ' +
        'convergence. Monocular: clarity, size, texture, linear perspective, interposition.',
    },
    {
      id: '2.2',
      ced: '2.2.A',
      title: 'Thinking, Problem-Solving, Judgments, and Decision-Making',
      minutes: 8,
      summary:
        'Concepts and prototypes organize thought; schemas grow by assimilation and change by accommodation. Algorithms are slow but sure; ' +
        'heuristics are fast shortcuts that cause errors (representativeness, availability). Mental set, priming and framing sway decisions; the ' +
        'gambler\'s and sunk-cost fallacies derail them. Executive functions plan and carry out goals; creativity needs divergent thinking and is ' +
        'blocked by functional fixedness.',
      body: `### Building blocks of thought
- **Concepts** group similar things; a **prototype** is the best example (a robin for "bird").
- **Schemas** change in two ways: **assimilation** fits new information into an existing schema without changing it; **accommodation** changes the schema to fit the new information.

### Solving problems
- **Algorithm**: tries every possible solution step by step; slow but guaranteed.
- **Heuristic**: a mental shortcut; fast but error-prone.
  - **Representativeness heuristic**: judging by how well something matches a prototype or stereotype.
  - **Availability heuristic**: judging likelihood by how easily examples come to mind.

### What sways decisions
| Influence | What it is |
|---|---|
| **Mental set** | Sticking with an approach that worked before, even when a better one exists |
| **Priming** | An earlier stimulus shaping a later response without your awareness |
| **Framing** | How a choice is worded (90% survival vs 10% mortality) changes the decision |
| **Gambler's fallacy** | Believing past random events change future odds ("tails is due") |
| **Sunk-cost fallacy** | Continuing because of what you've already invested |

### Executive function and creativity
- **Executive functions** let you generate, organize, plan and carry out goal-directed behavior and think critically.
- **Creativity** involves **divergent thinking** (many possible answers) more than **convergent thinking** (one right answer). **Functional fixedness**, seeing objects only in their usual use, blocks it.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Assimilation vs accommodation', back: 'Assimilation: fit new info into a schema. Accommodation: change the schema.' },
            { front: 'Algorithm vs heuristic', back: 'Algorithm: step-by-step, guaranteed. Heuristic: shortcut, fast but error-prone.' },
            { front: 'Availability heuristic', back: 'Judging likelihood by how easily examples come to mind' },
            { front: 'Representativeness heuristic', back: 'Judging by how well something fits a prototype or stereotype' },
            { front: 'Framing', back: 'The wording of a choice changes the decision' },
            { front: 'Functional fixedness', back: 'Only seeing an object\'s usual function; blocks creative solutions' },
          ],
        },
      ],
      precheck: {
        question: 'A step-by-step procedure that is guaranteed to reach the solution is a(n):',
        choices: ['Algorithm', 'Heuristic', 'Mental set', 'Prototype'],
        answer: 0,
        explanations: [
          'Correct. Algorithms are slow but guarantee an answer.',
          'Incorrect. A heuristic is a shortcut with no guarantee.',
          'Incorrect. Mental set is sticking with a previously successful approach.',
          'Incorrect. A prototype is the best example of a concept.',
        ],
      },
      checkpoints: [
        {
          question: 'After a week of news stories about shark attacks, Sam believes swimming at the beach is very dangerous, though attacks are extremely rare. This is the:',
          choices: ['Availability heuristic', 'Representativeness heuristic', 'Sunk-cost fallacy', 'Functional fixedness'],
          answer: 0,
          explanations: [
            'Correct. Vivid, easily recalled examples make the event seem more likely than it is.',
            'Incorrect. Representativeness is judging by resemblance to a prototype.',
            'Incorrect. Sunk cost is continuing because of past investment.',
            'Incorrect. Functional fixedness is about seeing only an object\'s usual use.',
          ],
        },
        {
          question: 'After five heads in a row, Ana bets on tails because it is "due". This illustrates:',
          choices: ['The gambler\'s fallacy', 'The sunk-cost fallacy', 'Framing', 'Mental set'],
          answer: 0,
          explanations: [
            'Correct. Each flip is independent; past results don\'t change the odds.',
            'Incorrect. Sunk cost is continuing because of what you\'ve already invested.',
            'Incorrect. Framing is about how a choice is worded.',
            'Incorrect. Mental set is reusing a previously successful strategy.',
          ],
        },
      ],
      revisit:
        'Algorithm = sure but slow; heuristic = fast shortcut. Availability = easy to recall; representativeness = fits the prototype. ' +
        'Gambler\'s fallacy = "it\'s due"; sunk cost = "I\'ve already put so much in". Assimilate = fit in; accommodate = change the schema.',
    },
    {
      id: '2.3',
      ced: '2.3.A',
      title: 'Introduction to Memory',
      minutes: 7,
      summary:
        'Explicit memories can be put into words (episodic: personal events; semantic: facts); implicit memories show in performance (procedural: skills). ' +
        'Prospective memory is remembering to do things. Long-term potentiation strengthens synapses with use. The multi-store model has sensory, ' +
        'short-term and long-term stores; the working memory model adds a central executive, phonological loop and visuospatial sketchpad; levels of ' +
        'processing run from structural (shallow) to semantic (deep).',
      body: `### Kinds of memory
| Type | What it is | Example |
|---|---|---|
| **Explicit: episodic** | Personal experiences | Your tenth birthday |
| **Explicit: semantic** | Facts and general knowledge | Paris is the capital of France |
| **Implicit: procedural** | Skills and procedures | Riding a bike |
| **Prospective** | Remembering future actions | Remembering to call your friend at 5 |

Explicit memories are easy to describe; implicit ones show up in what you can do, not what you can say.

### The biology
**Long-term potentiation (LTP)**: synaptic connections get stronger with repeated activation ("neurons that fire together, wire together"), a biological basis of memory.

### Three models
- **Multi-store model**: information passes through **sensory memory** (iconic for images, echoic for sounds), **short-term memory**, then **long-term memory**. Some encoding is **automatic**; some takes **effort**.
- **Working memory model**: short-term memory is an active workspace run by a **central executive** that directs a **phonological loop** (sounds and words) and a **visuospatial sketchpad** (images and space).
- **Levels of processing**: the deeper you process, the better you remember: **structural** (what it looks like, shallowest) → **phonemic** (what it sounds like) → **semantic** (what it means, deepest).`,
      blocks: [],
      precheck: {
        question: 'Knowing how to ride a bike without being able to explain exactly how is an example of:',
        choices: ['Implicit (procedural) memory', 'Episodic memory', 'Semantic memory', 'Prospective memory'],
        answer: 0,
        explanations: [
          'Correct. Skills are procedural memory, a kind of implicit memory.',
          'Incorrect. Episodic memory is for personal events.',
          'Incorrect. Semantic memory is for facts you can state.',
          'Incorrect. Prospective memory is remembering to do something later.',
        ],
      },
      checkpoints: [
        {
          question: 'Remembering the details of your tenth birthday party is an example of:',
          choices: ['Episodic memory', 'Semantic memory', 'Procedural memory', 'Prospective memory'],
          answer: 0,
          explanations: [
            'Correct. A specific personal event is episodic memory.',
            'Incorrect. Semantic memory is general facts, not personal experiences.',
            'Incorrect. Procedural memory is for skills.',
            'Incorrect. Prospective memory is about future intentions.',
          ],
        },
        {
          question: 'According to the levels of processing model, which kind of processing produces the strongest memory?',
          choices: ['Semantic (focusing on meaning)', 'Structural (focusing on appearance)', 'Phonemic (focusing on sound)', 'Iconic (a brief visual trace)'],
          answer: 0,
          explanations: [
            'Correct. Processing meaning is the deepest level and gives the best retention.',
            'Incorrect. Structural processing is the shallowest.',
            'Incorrect. Phonemic is the middle level, deeper than structural but shallower than semantic.',
            'Incorrect. Iconic memory is a kind of sensory memory, not a level of processing.',
          ],
        },
      ],
      revisit:
        'Explicit (episodic = events, semantic = facts) vs implicit (procedural = skills). Prospective = future tasks. LTP = stronger synapses. ' +
        'Levels: structural < phonemic < semantic. Working memory: central executive + phonological loop + visuospatial sketchpad.',
    },
    {
      id: '2.4',
      ced: '2.4.A',
      title: 'Encoding Memories',
      minutes: 7,
      summary:
        'Encoding gets information into memory, and how you encode decides how well it\'s stored and retrieved. Mnemonics (like the method of loci) ' +
        'and chunking help. The spacing effect: distributed practice beats massed practice. The serial position effect: the first items (primacy) and ' +
        'last items (recency) of a list are remembered best.',
      body: `### Getting it in
How you **encode** information shapes how well it's stored and retrieved.
- **Mnemonic devices**: memory aids such as acronyms or the **method of loci** (placing items along a familiar route in your mind).
- **Chunking**: grouping information into meaningful units (1-800-555-0123 instead of eleven separate digits), categories or hierarchies.

### The spacing effect
**Distributed practice** (studying in shorter sessions spread over time) leads to better long-term memory than **massed practice** (cramming). Spreading study over the year is exactly what spaced review is built on.

### The serial position effect
In a list, you remember the **beginning** (**primacy effect**) and the **end** (**recency effect**) better than the middle.
- Primacy: the first items got the most rehearsal, so they reached long-term memory.
- Recency: the last items are still in short-term memory, so a short delay before recall wipes this effect out while primacy survives.

Try it below: it's a real memory experiment, and your results usually show the U-shaped curve.`,
      blocks: [{ type: 'sim', sim: 'serial-position' }],
      precheck: {
        question: 'Remembering the digits 18005550123 as "1-800-555-0123" uses:',
        choices: ['Chunking', 'The method of loci', 'Massed practice', 'The recency effect'],
        answer: 0,
        explanations: [
          'Correct. Grouping digits into meaningful units is chunking.',
          'Incorrect. The method of loci places items along an imagined route.',
          'Incorrect. Massed practice is cramming all at once.',
          'Incorrect. Recency is remembering the end of a list.',
        ],
      },
      checkpoints: [
        {
          question: 'Jaylen studies 20 minutes a day for six days; Priya studies for two hours the night before the test. On a test a month later, Jaylen remembers more. This demonstrates:',
          choices: ['The spacing effect', 'The serial position effect', 'Chunking', 'The method of loci'],
          answer: 0,
          explanations: [
            'Correct. Distributed practice beats massed practice for long-term retention.',
            'Incorrect. The serial position effect is about position within a list.',
            'Incorrect. Chunking is grouping information into units.',
            'Incorrect. The method of loci is an imagery-based mnemonic.',
          ],
        },
        {
          question: 'Right after hearing a list once, people best remember the first few items and the last few items. Better memory for the first items is called the:',
          choices: ['Primacy effect', 'Recency effect', 'Spacing effect', 'Misinformation effect'],
          answer: 0,
          explanations: [
            'Correct. Primacy is the advantage for the beginning of a list.',
            'Incorrect. Recency is the advantage for the end of a list.',
            'Incorrect. The spacing effect is about distributing study over time.',
            'Incorrect. The misinformation effect is about misleading information changing a memory.',
          ],
        },
      ],
      revisit:
        'Chunk it, use mnemonics, space it out (distributed beats massed). Serial position: primacy (start, reached long-term memory) and ' +
        'recency (end, still in short-term memory; a delay erases it).',
    },
    {
      id: '2.5',
      ced: '2.5.A',
      title: 'Storing Memories',
      minutes: 6,
      summary:
        'Sensory, short-term, working and long-term memory differ in duration, capacity and content. Maintenance rehearsal keeps information active; ' +
        'elaborative rehearsal (linking it to meaning) stores it better. Storage can be disrupted by anterograde amnesia (no new memories), retrograde ' +
        'amnesia (old memories lost), Alzheimer\'s disease, and infantile amnesia.',
      body: `### The stores compared
| Store | Duration | Capacity |
|---|---|---|
| **Sensory** | Under a second (iconic) to a few seconds (echoic) | Large, but fleeting |
| **Short-term / working** | About 20–30 seconds without rehearsal | Limited (roughly 7 ± 2 items, fewer by newer estimates) |
| **Long-term** | Potentially a lifetime | Essentially unlimited |

### Keeping it
- **Maintenance rehearsal**: repeating information to keep it in short-term memory (repeating a phone number until you dial it).
- **Elaborative rehearsal**: linking the information to meaning and things you already know; much better for long-term storage.

Some people have **highly superior autobiographical memory**, which hints at biological differences in storage; and information connected to **ourselves** tends to be remembered better.

### When storage fails
- **Anterograde amnesia**: can't form **new** long-term memories after the injury (implicit learning may still work).
- **Retrograde amnesia**: loses memories from **before** the injury.
- **Alzheimer's disease**: progressive loss of memory and other cognitive functions.
- **Infantile amnesia**: few or no memories from the first years of life.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Maintenance vs elaborative rehearsal', back: 'Maintenance: repeat to keep it in STM. Elaborative: link to meaning for LTM.' },
            { front: 'Anterograde amnesia', back: 'Can\'t form new memories after the injury' },
            { front: 'Retrograde amnesia', back: 'Loses memories from before the injury' },
            { front: 'Iconic vs echoic memory', back: 'Iconic: brief visual sensory memory. Echoic: brief auditory sensory memory, lasts a little longer.' },
          ],
        },
      ],
      precheck: {
        question: 'Which memory store holds information for the shortest time?',
        choices: ['Sensory memory', 'Short-term memory', 'Working memory', 'Long-term memory'],
        answer: 0,
        explanations: [
          'Correct. Sensory memory lasts from under a second to a few seconds.',
          'Incorrect. Short-term memory lasts about 20–30 seconds without rehearsal.',
          'Incorrect. Working memory is the active form of short-term memory, which lasts longer than sensory memory.',
          'Incorrect. Long-term memory can last a lifetime.',
        ],
      },
      checkpoints: [
        {
          question: 'After a head injury, Ray remembers his childhood clearly but cannot remember anyone he has met since the accident. This is:',
          choices: ['Anterograde amnesia', 'Retrograde amnesia', 'Infantile amnesia', 'Source amnesia'],
          answer: 0,
          explanations: [
            'Correct. Inability to form new memories after an injury is anterograde amnesia.',
            'Incorrect. Retrograde amnesia would erase old memories like his childhood.',
            'Incorrect. Infantile amnesia is the normal lack of memories from early childhood.',
            'Incorrect. Source amnesia is forgetting where you learned something.',
          ],
        },
        {
          question: 'To remember the word "mitochondria", Lee thinks about how it powers cells like a power plant powers a town. This is:',
          choices: ['Elaborative rehearsal', 'Maintenance rehearsal', 'Massed practice', 'Iconic memory'],
          answer: 0,
          explanations: [
            'Correct. Connecting new information to meaning is elaborative rehearsal.',
            'Incorrect. Maintenance rehearsal is simple repetition.',
            'Incorrect. Massed practice is cramming in one session.',
            'Incorrect. Iconic memory is brief visual sensory memory.',
          ],
        },
      ],
      revisit:
        'Sensory (instant) → short-term (~20–30 s, small) → long-term (lasting, huge). Repeat = maintenance; give it meaning = elaborative. ' +
        'Anterograde: no new memories. Retrograde: lost old ones.',
    },
    {
      id: '2.6',
      ced: '2.6.A',
      title: 'Retrieving Memories',
      minutes: 5,
      summary:
        'Recall retrieves without cues; recognition uses cues, so it\'s easier. Retrieval improves when you\'re in the same place (context-dependent), ' +
        'mood (mood-congruent) or physical state (state-dependent) as during encoding. Practicing retrieval itself, through the testing effect and ' +
        'metacognition, makes memories easier to get back.',
      body: `### Getting it out
- **Recall**: retrieving without cues (fill-in-the-blank, essay).
- **Recognition**: identifying the right answer when you see it (multiple choice). Easier, because the answer itself is a cue.

### Matching the conditions
Retrieval is better when conditions match those at encoding:
| Effect | What matches |
|---|---|
| **Context-dependent memory** | The physical place |
| **Mood-congruent memory** | Your mood (sad moods bring back sad memories) |
| **State-dependent memory** | Your physical or internal state |

### Retrieval practice
- **Testing effect**: retrieving information (quizzing yourself) strengthens memory more than rereading it. Every checkpoint in these packs is built on this.
- **Metacognition**: thinking about your own thinking, such as knowing which topics you actually know versus only recognize.`,
      blocks: [],
      precheck: {
        question: 'A multiple-choice question mainly tests:',
        choices: ['Recognition', 'Recall', 'Procedural memory', 'Prospective memory'],
        answer: 0,
        explanations: [
          'Correct. You pick the answer out from options, which act as cues.',
          'Incorrect. Recall means producing the answer with no options.',
          'Incorrect. Procedural memory is for skills.',
          'Incorrect. Prospective memory is remembering to do something later.',
        ],
      },
      checkpoints: [
        {
          question: 'Divers who learned a word list underwater recalled it better underwater than on land. This shows:',
          choices: ['Context-dependent memory', 'State-dependent memory', 'Mood-congruent memory', 'The testing effect'],
          answer: 0,
          explanations: [
            'Correct. Matching the physical environment of learning improved recall.',
            'Incorrect. State-dependent memory is about the internal physical state, not the location.',
            'Incorrect. Mood-congruent memory is about matching emotional state.',
            'Incorrect. The testing effect is about practicing retrieval.',
          ],
        },
        {
          question: 'Students who quiz themselves on a chapter remember more a week later than students who reread it the same number of times. This is the:',
          choices: ['Testing effect', 'Massed practice effect', 'Mood-congruent effect', 'Proactive interference'],
          answer: 0,
          explanations: [
            'Correct. Practicing retrieval strengthens memory more than rereading.',
            'Incorrect. Massed practice (cramming) is not what was compared here.',
            'Incorrect. Mood-congruent memory is about emotional state at recall.',
            'Incorrect. Proactive interference is old learning disrupting new learning.',
          ],
        },
      ],
      revisit:
        'Recall = no cues (harder); recognition = cues (easier). Match the place (context), mood (mood-congruent) or body state (state-dependent). ' +
        'Quiz yourself: the testing effect beats rereading.',
    },
    {
      id: '2.7',
      ced: '2.7.A',
      title: 'Forgetting and Other Memory Challenges',
      minutes: 6,
      summary:
        'The forgetting curve drops fast, then levels off. Forgetting comes from encoding failure, interference (proactive: old disrupts new; ' +
        'retroactive: new disrupts old) and retrieval failure such as the tip-of-the-tongue phenomenon. Psychodynamic theorists propose repression. ' +
        'Memories can be distorted by the misinformation effect, source amnesia and constructive memory, including imagination inflation.',
      body: `### The forgetting curve
Ebbinghaus found that forgetting is **fastest right after learning** and then **levels off**. That's why a quick review the next day saves so much.

### Why we forget
- **Encoding failure**: it never got stored (you can't remember the details of a penny you've seen thousands of times).
- **Interference**:
  - **Proactive**: **old** learning disrupts **new** (you keep writing last year's date).
  - **Retroactive**: **new** learning disrupts **old** (your new locker combination pushes out the old one).
  - Memory trick: *pro* acts forward (old disrupts new); *retro* acts backward (new disrupts old).
- **Retrieval failure**: it's stored but you can't get it out, as in the **tip-of-the-tongue phenomenon**.
- **Repression**: psychodynamic theorists believe distressing memories are pushed out of awareness to protect the ego. (It's a theory with weak scientific support, but you need to know it.)

### When memory changes
Memory is **reconstructed**, not replayed:
- **Misinformation effect**: misleading information after an event changes the memory of it (Loftus: "smashed" vs "hit" changed estimates of speed and made people "remember" broken glass).
- **Source amnesia**: remembering the information but not where you learned it.
- **Constructive memory**: filling in gaps during consolidation; **imagination inflation** is when imagining an event makes you more confident it happened.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Proactive interference', back: 'Old learning disrupts recall of new learning' },
            { front: 'Retroactive interference', back: 'New learning disrupts recall of old learning' },
            { front: 'Forgetting curve', back: 'Forgetting is rapid at first, then levels off (Ebbinghaus)' },
            { front: 'Misinformation effect', back: 'Misleading information after an event distorts the memory (Loftus)' },
            { front: 'Source amnesia', back: 'Remembering information but not where it came from' },
          ],
        },
      ],
      precheck: {
        question: 'Ebbinghaus\'s forgetting curve shows that forgetting is:',
        choices: ['Rapid at first, then levels off', 'Steady and constant over time', 'Slow at first, then rapid', 'Rare for information learned once'],
        answer: 0,
        explanations: [
          'Correct. Most forgetting happens soon after learning.',
          'Incorrect. The rate is not constant; it drops off quickly and then flattens.',
          'Incorrect. It is the other way around.',
          'Incorrect. Without review, much of a one-time learning is lost quickly.',
        ],
      },
      checkpoints: [
        {
          question: 'After learning her new phone number, Maya can no longer remember her old one. This is:',
          choices: ['Retroactive interference', 'Proactive interference', 'Encoding failure', 'Repression'],
          answer: 0,
          explanations: [
            'Correct. New learning (the new number) disrupts old learning (the old number).',
            'Incorrect. Proactive interference would be the old number getting in the way of the new one.',
            'Incorrect. She did encode the old number; the new one interferes with it.',
            'Incorrect. Repression is about distressing memories, not phone numbers.',
          ],
        },
        {
          question: 'Witnesses asked how fast cars were going when they "smashed" into each other later "remember" broken glass that wasn\'t there. This is the:',
          choices: ['Misinformation effect', 'Source amnesia', 'Tip-of-the-tongue phenomenon', 'Proactive interference'],
          answer: 0,
          explanations: [
            'Correct. Misleading wording after the event altered the memory of it.',
            'Incorrect. Source amnesia is forgetting where information came from.',
            'Incorrect. Tip-of-the-tongue is a temporary failure to retrieve something you know.',
            'Incorrect. Proactive interference is old learning disrupting new learning.',
          ],
        },
      ],
      revisit:
        'Forgetting curve: fast drop, then flat. Proactive = old blocks new; retroactive = new blocks old. Memories are rebuilt, so leading ' +
        'questions can plant details (misinformation effect).',
    },
    {
      id: '2.8',
      ced: '2.8.A–2.8.D',
      title: 'Intelligence and Achievement',
      minutes: 7,
      summary:
        'Psychologists still debate whether intelligence is one general ability (g) or many. Early IQ = mental age ÷ chronological age × 100. ' +
        'Good tests are standardized, valid (construct, predictive) and reliable (test-retest, split-half). The Flynn effect is rising scores over time; ' +
        'scores vary more within groups than between them, and tests have been misused. Achievement tests measure what you know, aptitude tests predict, ' +
        'and a growth mindset helps achievement.',
      body: `### What is intelligence?
There is still no consensus, and definitions have been shaped by bias. The core debate: is intelligence a single **general ability (g)**, or **multiple abilities**?

### Measuring it
Early intelligence tests gave an **intelligence quotient**:

${steps({
  title: 'Early IQ: a 10-year-old performs like a typical 12-year-old',
  steps: [
    { title: 'Formula', body: 'IQ = (mental age ÷ chronological age) × 100' },
    { title: 'Plug in', body: '(12 ÷ 10) × 100 = 120' },
  ],
  answer: 'IQ = 120. Modern tests compare scores to others of the same age instead, but this is the historical formula.',
})}

Today IQ scores are often used to identify students for educational services.

### What makes a test good
- **Standardized**: given with the same procedures and conditions every time.
- **Valid**: measures what it claims to. **Construct validity**: it measures the trait in theory. **Predictive validity**: it predicts future performance.
- **Reliable**: gives consistent results. **Test-retest**: similar scores on repeated tests. **Split-half**: both halves of the test agree.

Test makers try to make assessments **socio-culturally responsive** to reduce **stereotype threat** (anxiety about confirming a stereotype lowers performance) and inequities from **stereotype lift** (a boost from comparing favorably with a stereotyped group).

### Systemic issues
- **Flynn effect**: IQ scores have risen across much of the world over time, linked to better nutrition, health care and education, not genes changing.
- Scores **vary more within groups than between groups**. Poverty, discrimination and unequal schooling can lower scores, and IQ tests have been used to **limit access** to jobs, military ranks, schools and immigration to the US.

### Achievement and mindset
- **Achievement tests** measure what you already know; **aptitude tests** predict how you'll perform in the future.
- Believing intelligence can grow (**growth mindset**) rather than being fixed (**fixed mindset**) is linked to higher achievement.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Reliability vs validity', back: 'Reliable: consistent results. Valid: measures what it claims to.' },
            { front: 'Test-retest vs split-half reliability', back: 'Test-retest: same scores over repeated tests. Split-half: the two halves of a test agree.' },
            { front: 'Predictive validity', back: 'A test predicts future performance (e.g. grades)' },
            { front: 'Flynn effect', back: 'IQ scores rising over generations' },
            { front: 'Achievement vs aptitude test', back: 'Achievement: what you know now. Aptitude: predicts future performance.' },
          ],
        },
      ],
      precheck: {
        question: 'A test that gives a person nearly the same score each time they take it is:',
        choices: ['Reliable', 'Valid', 'Standardized', 'An aptitude test'],
        answer: 0,
        explanations: [
          'Correct. Consistency of results is reliability.',
          'Incorrect. Validity is about measuring what it claims to; a test can be consistent and still invalid.',
          'Incorrect. Standardization is about giving the test the same way each time.',
          'Incorrect. An aptitude test predicts future performance; consistency is a separate property.',
        ],
      },
      checkpoints: [
        {
          question: 'A college entrance exam whose scores accurately forecast students\' first-year grades has high:',
          choices: ['Predictive validity', 'Test-retest reliability', 'Split-half reliability', 'Standardization'],
          answer: 0,
          explanations: [
            'Correct. Forecasting a future outcome is predictive validity.',
            'Incorrect. Test-retest reliability is about consistent scores across repeated tests.',
            'Incorrect. Split-half reliability is about the two halves agreeing.',
            'Incorrect. Standardization is about consistent procedures, not prediction.',
          ],
        },
        {
          question: 'Average IQ scores across many countries have risen over several decades. This is called:',
          choices: ['The Flynn effect', 'Stereotype threat', 'A growth mindset', 'The g factor'],
          answer: 0,
          explanations: [
            'Correct. The Flynn effect is the rise in IQ scores over time.',
            'Incorrect. Stereotype threat lowers individual performance; it doesn\'t describe a population trend.',
            'Incorrect. A growth mindset is a belief about intelligence, not a trend in scores.',
            'Incorrect. g is the idea of a single general intelligence.',
          ],
        },
      ],
      revisit:
        'Reliable = consistent (test-retest, split-half). Valid = measures the right thing (construct, predictive). Flynn effect = rising scores. ' +
        'More variation within groups than between. Achievement = now; aptitude = future. Growth mindset helps.',
    },
  ],
};

export default pack;
