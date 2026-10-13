/**
 * AP Psychology Unit 1: Biological Bases of Behavior — study pack.
 *
 * Written against the AP Psychology CED (2024 course, topics 1.1–1.6). Only the
 * neurotransmitters, hormones and sleep disorders the CED lists are used,
 * because its exclusion statements say the exam tests only those; specific
 * genetics, the sodium-potassium pump, endocrine glands other than the
 * pituitary, and psychoanalytic dream theory are left out for the same reason.
 *
 * This unit is mostly vocabulary applied to scenarios, so it leans on
 * flashcards and scenario checkpoints. Same shape as apBiologyUnit1.js.
 * Import-free so scripts/prerender.mjs can load it.
 */

const steps = (spec) => '```apex-steps\n' + JSON.stringify(spec) + '\n```';

const pack = {
  slug: 'ap-psychology/unit-1',
  subject: 'AP Psychology',
  unit: 'Unit 1: Biological Bases of Behavior',
  examWeight: '15–25% of the exam',
  intro:
    'Every thought, feeling and behavior runs on biology: genes and environment, a nervous system built from neurons, a brain ' +
    'with specialized parts, a daily sleep cycle, and senses that turn the world into signals. Most exam questions here give ' +
    'you a scenario and ask you to name the structure, chemical or process at work.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A',
      title: 'Interaction of Heredity and Environment',
      minutes: 5,
      summary:
        'Heredity ("nature") and environment ("nurture") interact to shape behavior. The evolutionary perspective asks how natural selection ' +
        'favored behaviors that helped survival and reproduction. Twin, family and adoption studies separate the effects of genes and environment.',
      body: `### Nature and nurture, together
- **Heredity ("nature")**: genetic or predisposed characteristics that influence physical, behavioral and mental traits.
- **Environment ("nurture")**: external factors a person experiences, such as family interactions or education.

They **interact**: genes set ranges and tendencies, and experience shapes how they show up. Exam answers that pick only one side usually miss the point.

### The evolutionary perspective
Explains behaviors by how **natural selection** favored traits that increased **survival and reproductive success**, such as fear of heights or a preference for sweet, high-calorie food. Its principles have also been misused to justify discrimination (**eugenics**); the CED expects you to know that history.

### How researchers separate genes from environment
| Design | Logic |
|---|---|
| **Twin studies** | Identical twins share all their genes, fraternal twins about half. If identical twins are more alike on a trait, genes likely matter. |
| **Family studies** | Traits that run in families more closely with closer relatives point to genetic influence (though families also share environments). |
| **Adoption studies** | Compare adoptees with biological parents (shared genes) and adoptive parents (shared environment). |

Identical twins **raised apart** are the strongest case: same genes, different environments.`,
      blocks: [],
      precheck: {
        question: 'In the nature–nurture debate, "nurture" refers to:',
        choices: [
          'External, environmental factors such as family and education',
          'Genetic predispositions inherited from parents',
          'The process of natural selection',
          'Biological changes caused by aging',
        ],
        answer: 0,
        explanations: [
          'Correct. Nurture is the environment a person experiences.',
          'Incorrect. That is nature (heredity).',
          'Incorrect. Natural selection is the mechanism behind the evolutionary perspective, not "nurture".',
          'Incorrect. Aging is biological maturation, not environmental influence.',
        ],
      },
      checkpoints: [
        {
          question: 'Identical twins raised in different homes turn out more similar in anxiety levels than fraternal twins raised together. This finding most directly supports:',
          choices: [
            'A genetic influence on anxiety',
            'An environmental influence on anxiety',
            'The idea that anxiety is learned only in childhood',
            'The idea that twins cannot be studied scientifically',
          ],
          answer: 0,
          explanations: [
            'Correct. Shared genes outweighed a shared environment, which points to heredity.',
            'Incorrect. The twins who shared an environment (fraternal, raised together) were less similar.',
            'Incorrect. The study design compares genes and environment; it says nothing about when anxiety is learned.',
            'Incorrect. Twin studies are a standard research design for exactly this question.',
          ],
        },
        {
          question: 'A researcher wants to know whether a trait is more like a child\'s biological parents or their adoptive parents. Which design is this?',
          choices: ['Adoption study', 'Case study', 'Family study', 'Experiment'],
          answer: 0,
          explanations: [
            'Correct. Comparing adoptees with biological vs adoptive parents separates genes from environment.',
            'Incorrect. A case study looks in depth at one person or group.',
            'Incorrect. A family study compares relatives who usually share both genes and environment.',
            'Incorrect. Nobody is randomly assigned to be adopted, so this cannot be an experiment.',
          ],
        },
      ],
      revisit:
        'Twins raised apart: same genes, different homes. Adoption studies: biological parents = genes, adoptive parents = environment. ' +
        'Nature and nurture interact; the evolutionary perspective explains behavior through survival and reproduction.',
    },
    {
      id: '1.2',
      ced: '1.2.A',
      title: 'Overview of the Nervous System',
      minutes: 4,
      summary:
        'The central nervous system is the brain and spinal cord. The peripheral nervous system connects it to the body: the somatic system ' +
        'handles voluntary movement, and the autonomic system handles involuntary processes, split into the arousing sympathetic and calming ' +
        'parasympathetic divisions.',
      body: `### The map
- **Central nervous system (CNS)**: brain and spinal cord.
- **Peripheral nervous system (PNS)**: everything else; relays messages between the CNS and the body.
  - **Somatic**: **voluntary** control of skeletal muscles (raising your hand).
  - **Autonomic**: **involuntary** processes (heartbeat, digestion, pupil size).
    - **Sympathetic**: arouses the body for action, "fight or flight": faster heart rate, dilated pupils, digestion slowed.
    - **Parasympathetic**: calms the body back down, "rest and digest".

**Memory trick:** **s**ympathetic = **s**tress; **p**arasympathetic = **p**eace.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Central nervous system', back: 'Brain and spinal cord' },
            { front: 'Somatic nervous system', back: 'Voluntary control of skeletal muscles' },
            { front: 'Autonomic nervous system', back: 'Involuntary processes like heart rate and digestion' },
            { front: 'Sympathetic division', back: 'Arousal, "fight or flight": heart speeds up, pupils dilate, digestion slows' },
            { front: 'Parasympathetic division', back: 'Calming, "rest and digest": returns the body to baseline' },
          ],
        },
      ],
      precheck: {
        question: 'Which division calms the body after a stressful event?',
        choices: ['Parasympathetic', 'Sympathetic', 'Somatic', 'Central'],
        answer: 0,
        explanations: [
          'Correct. The parasympathetic division returns the body to rest.',
          'Incorrect. The sympathetic division arouses the body; it is what the calming reverses.',
          'Incorrect. The somatic system controls voluntary movement.',
          'Incorrect. The central nervous system is the brain and spinal cord, not a calming division.',
        ],
      },
      checkpoints: [
        {
          question: 'Just before giving a speech, Mia\'s heart races, her pupils dilate and her stomach feels "frozen". Which part of her nervous system is most active?',
          choices: ['Sympathetic nervous system', 'Parasympathetic nervous system', 'Somatic nervous system', 'Spinal cord reflexes only'],
          answer: 0,
          explanations: [
            'Correct. Racing heart, dilated pupils and slowed digestion are sympathetic "fight or flight" arousal.',
            'Incorrect. The parasympathetic system would slow her heart and restart digestion.',
            'Incorrect. These are involuntary changes; the somatic system handles voluntary movement.',
            'Incorrect. This is whole-body arousal, not a reflex arc.',
          ],
        },
        {
          question: 'Deciding to raise your hand to answer a question uses which system?',
          choices: ['Somatic nervous system', 'Autonomic nervous system', 'Sympathetic nervous system', 'Parasympathetic nervous system'],
          answer: 0,
          explanations: [
            'Correct. Voluntary movement of skeletal muscles is somatic.',
            'Incorrect. The autonomic system handles involuntary processes.',
            'Incorrect. The sympathetic division is part of the autonomic (involuntary) system.',
            'Incorrect. The parasympathetic division is part of the autonomic (involuntary) system.',
          ],
        },
      ],
      revisit:
        'CNS = brain + spinal cord. PNS = somatic (voluntary) + autonomic (involuntary). Autonomic = sympathetic (stress, arouse) + parasympathetic (peace, calm).',
    },
    {
      id: '1.3',
      ced: '1.3.A–1.3.C',
      title: 'The Neuron and Neural Firing',
      minutes: 9,
      summary:
        'Neurons transmit information; glial cells support them. A neuron fires when stimulation reaches threshold, and the action potential is ' +
        'all-or-nothing. Neurotransmitters are excitatory or inhibitory; hormones act similarly from outside the nervous system. Drugs work as ' +
        'agonists, antagonists or reuptake inhibitors.',
      body: `### Cells of the nervous system
- **Neurons** transmit information. A typical neuron receives signals on its **dendrites**, sends them down the **axon** (often insulated by a **myelin sheath**) to the **terminal buttons**, which release neurotransmitters into the **synapse**.
- **Glial cells** provide structure, insulation, communication and waste transport.

**Reflex arc:** a **sensory neuron** carries the signal to the spinal cord, an **interneuron** passes it on, and a **motor neuron** moves the muscle, before the brain is involved (pulling your hand off a hot stove).

### How a neuron fires
1. At **resting potential** the inside of the neuron is negative relative to the outside.
2. Incoming signals push it toward **threshold**. If threshold is reached, **depolarization** sweeps down the axon: an **action potential**.
3. **All-or-nothing:** it fires completely or not at all. A stronger stimulus makes a neuron fire **more often**, not harder.
4. During the **refractory period** it can't fire again.
5. Neurotransmitters cross the synapse; leftovers are reabsorbed by the sending neuron (**reuptake**).

Problems in this process cause disorders such as **multiple sclerosis** (damaged myelin slows signals) and **myasthenia gravis** (acetylcholine signals to muscles are blocked).

### Neurotransmitters the exam uses
| Neurotransmitter | Linked to |
|---|---|
| **Acetylcholine** | Muscle movement; learning and memory |
| **Dopamine** | Reward, motivation, movement |
| **Serotonin** | Mood, sleep, appetite |
| **Norepinephrine** | Alertness and arousal |
| **Glutamate** | The main **excitatory** neurotransmitter; memory |
| **GABA** | The main **inhibitory** neurotransmitter |
| **Endorphins** | Pain relief, pleasure |
| **Substance P** | Pain perception |

### Hormones the exam uses
**Adrenaline** (fight or flight), **leptin** (fullness, "stop eating"), **ghrelin** (hunger, "go eat"), **melatonin** (sleepiness), **oxytocin** (bonding, social connection).

### Psychoactive drugs
- **Agonists** mimic or boost a neurotransmitter (encourage firing). **Antagonists** block it (discourage firing). **Reuptake inhibitors** keep it in the synapse longer.
- **Stimulants** (caffeine, cocaine) increase neural activity; **depressants** (alcohol) decrease it; **hallucinogens** (marijuana) distort perception; **opioids** (heroin) relieve pain.
- Repeated use builds **tolerance** (more is needed for the same effect) and can lead to **addiction**, with **withdrawal** symptoms when use stops.`,
      blocks: [
        { type: 'sim', sim: 'neuron-firing' },
        {
          type: 'flashcards',
          cards: [
            { front: 'Main excitatory neurotransmitter', back: 'Glutamate' },
            { front: 'Main inhibitory neurotransmitter', back: 'GABA' },
            { front: 'Hunger hormone vs fullness hormone', back: 'Ghrelin makes you hungry; leptin signals you are full.' },
            { front: 'Agonist vs antagonist', back: 'Agonist mimics or boosts a neurotransmitter; antagonist blocks it.' },
            { front: 'Reuptake inhibitor', back: 'Blocks reabsorption, so the neurotransmitter stays in the synapse longer (SSRIs do this for serotonin).' },
            { front: 'All-or-nothing principle', back: 'A neuron fires completely or not at all; stimulus strength changes how often, not how strongly.' },
          ],
        },
      ],
      precheck: {
        question: 'The all-or-nothing principle says that:',
        choices: [
          'A neuron either fires completely or not at all; a stronger stimulus doesn\'t make a bigger action potential',
          'Neurons fire more strongly when the stimulus is stronger',
          'Every neuron in the brain fires at once or none do',
          'A neurotransmitter is either excitatory or inhibitory, never both',
        ],
        answer: 0,
        explanations: [
          'Correct. Once threshold is reached the action potential is the same size every time.',
          'Incorrect. A stronger stimulus changes how often a neuron fires, not the size of each firing.',
          'Incorrect. The principle is about a single neuron\'s firing.',
          'Incorrect. That is a different idea; the principle describes action potentials.',
        ],
      },
      checkpoints: [
        {
          question: 'A medication blocks the sending neuron from reabsorbing serotonin, so more serotonin stays in the synapse. This medication is a(n):',
          choices: ['Reuptake inhibitor', 'Antagonist', 'Depressant', 'Hormone'],
          answer: 0,
          explanations: [
            'Correct. Blocking reabsorption is what a reuptake inhibitor (like an SSRI) does.',
            'Incorrect. An antagonist blocks the receptor, reducing the neurotransmitter\'s effect.',
            'Incorrect. Depressants decrease overall neural activity; this targets reuptake of one neurotransmitter.',
            'Incorrect. Hormones are chemical messengers from outside the nervous system, not a drug action.',
          ],
        },
        {
          question: 'A drug that increases the activity of GABA would most likely:',
          choices: [
            'Calm the person by making neurons less likely to fire',
            'Make the person more alert and energetic',
            'Increase feelings of hunger',
            'Strengthen voluntary muscle movement',
          ],
          answer: 0,
          explanations: [
            'Correct. GABA is the main inhibitory neurotransmitter, so boosting it reduces firing (this is how many anti-anxiety drugs work).',
            'Incorrect. That describes increased excitation, the opposite of GABA\'s effect.',
            'Incorrect. Hunger is signaled by the hormone ghrelin.',
            'Incorrect. Muscle movement is linked to acetylcholine.',
          ],
        },
      ],
      revisit:
        'Threshold reached → full action potential (all-or-nothing) → refractory period → neurotransmitters cross the synapse → reuptake. ' +
        'GABA inhibits, glutamate excites. Agonist boosts, antagonist blocks, reuptake inhibitor keeps it in the synapse.',
    },
    {
      id: '1.4',
      ced: '1.4.A',
      title: 'The Brain',
      minutes: 9,
      summary:
        'The brainstem runs basic life functions, the cerebellum coordinates movement and balance, and the cerebral cortex is divided into two ' +
        'hemispheres and four lobes. The limbic system handles memory and emotion. Language sits mostly in the left hemisphere (Broca: production; ' +
        'Wernicke: comprehension). The brain can rewire itself (plasticity), and is studied with EEG, fMRI, case studies and lesioning.',
      body: `### From the bottom up
| Structure | Generally controls |
|---|---|
| **Brainstem** (including the **medulla**) | Breathing, heart rate |
| **Reticular activating system**, **reward center** | Arousal; some voluntary and eye movement; some learning, cognition and emotion |
| **Cerebellum** | Coordination, balance, some procedural learning |
| **Thalamus** | Relays sensory information (every sense except smell) |
| **Hypothalamus** | Hunger, thirst, body temperature; directs the pituitary |
| **Pituitary gland** | The "master gland" of the endocrine system |
| **Hippocampus** | Forming new memories |
| **Amygdala** | Emotion, especially fear and aggression |
| **Corpus callosum** | Connects the two hemispheres |

### The four lobes of the cortex
- **Frontal** (behind the forehead): higher-order thinking, planning, executive function (**prefrontal cortex**), language; the **motor cortex** at its rear controls voluntary movement.
- **Parietal** (top back): the **somatosensory cortex** (touch) and association areas.
- **Temporal** (sides): hearing and language.
- **Occipital** (rear): vision.

### Two hemispheres
Each hemisphere mostly controls the **opposite** side of the body and receives the **opposite** visual field (contralateral). Language is usually in the **left** hemisphere: **Broca's area** (speech production) and **Wernicke's area** (comprehension); damage to either causes **aphasia**.

**Split-brain** patients have a severed corpus callosum (a treatment for severe epilepsy), so the hemispheres can't share information. Researchers flash images to one visual field to see what each hemisphere can do.

${steps({
  title: 'A split-brain patient sees "KEY" flashed only to her left visual field. What can she do?',
  steps: [
    { title: 'Which hemisphere gets it?', body: 'The left visual field goes to the **right** hemisphere.' },
    { title: 'Can she say it?', body: 'Speech is usually in the **left** hemisphere, and the severed corpus callosum stops the word from crossing over, so she **can\'t name it**.' },
    { title: 'Can she show it?', body: 'The right hemisphere controls the **left hand**, so she can pick out a key by touch with her left hand.' },
  ],
  answer: 'She says she saw nothing, but her left hand picks up the key.',
})}

### Plasticity and research tools
**Plasticity**: the brain can rewire itself and form new connections, so other areas can sometimes take over a damaged area's job (more so in childhood). Researchers study the brain with **EEG** (electrical activity, great timing), **fMRI** (blood flow, shows which areas are active), **case studies** of people with brain damage, and **lesioning** (deliberately damaging tissue in animal research).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Medulla', back: 'Brainstem structure controlling breathing and heart rate' },
            { front: 'Cerebellum', back: 'Coordination, balance, procedural learning' },
            { front: 'Hippocampus', back: 'Forming new memories' },
            { front: 'Amygdala', back: 'Emotion, especially fear and aggression' },
            { front: 'Hypothalamus', back: 'Hunger, thirst, body temperature; controls the pituitary' },
            { front: 'Broca\'s vs Wernicke\'s area', back: 'Broca: speech production. Wernicke: speech comprehension.' },
            { front: 'Occipital lobe', back: 'Vision (back of the brain)' },
            { front: 'Motor cortex', back: 'Voluntary movement; rear of the frontal lobe' },
          ],
        },
      ],
      precheck: {
        question: 'Damage to the cerebellum would most likely impair:',
        choices: ['Coordination and balance', 'Breathing and heart rate', 'Forming new memories', 'Recognizing faces'],
        answer: 0,
        explanations: [
          'Correct. The cerebellum coordinates movement and balance.',
          'Incorrect. Breathing and heart rate are the medulla\'s job (brainstem).',
          'Incorrect. Forming new memories depends on the hippocampus.',
          'Incorrect. Face recognition depends on visual areas of the cortex; damage there causes prosopagnosia.',
        ],
      },
      checkpoints: [
        {
          question: 'After a stroke, a man understands everything said to him but speaks slowly in broken, effortful phrases. The damage is most likely in:',
          choices: ['Broca\'s area', 'Wernicke\'s area', 'The occipital lobe', 'The cerebellum'],
          answer: 0,
          explanations: [
            'Correct. Intact comprehension with impaired speech production points to Broca\'s area.',
            'Incorrect. Wernicke\'s damage impairs comprehension; speech is fluent but makes little sense.',
            'Incorrect. The occipital lobe processes vision.',
            'Incorrect. The cerebellum coordinates movement and balance, not language.',
          ],
        },
        {
          question: 'A split-brain patient is shown a picture of a key in her left visual field only. She will most likely:',
          choices: [
            'Be unable to name it but pick out a key with her left hand',
            'Name it easily but be unable to pick it out',
            'Name it and pick it out with her right hand',
            'Neither name it nor pick it out',
          ],
          answer: 0,
          explanations: [
            'Correct. The image goes to the right hemisphere, which lacks speech but controls the left hand.',
            'Incorrect. That would happen with the right visual field, which goes to the speaking left hemisphere.',
            'Incorrect. The right hand is controlled by the left hemisphere, which never received the image.',
            'Incorrect. The right hemisphere did see it and can guide the left hand.',
          ],
        },
      ],
      revisit:
        'Brainstem: life support. Cerebellum: coordination. Hippocampus: new memories. Amygdala: fear. Lobes: frontal (thinking, motor), parietal (touch), ' +
        'temporal (hearing), occipital (vision). Left visual field → right hemisphere → left hand; speech lives on the left.',
    },
    {
      id: '1.5',
      ced: '1.5.A',
      title: 'Sleep',
      minutes: 7,
      summary:
        'Sleep follows a roughly 24-hour circadian rhythm. A night cycles through NREM stages 1–3 and REM sleep; deep NREM gets shorter and REM ' +
        'gets longer as the night goes on. REM is "paradoxical": brain waves look awake but the body is most relaxed, and it is when most dreaming ' +
        'happens. Sleep is thought to consolidate memories and restore the body.',
      body: `### Consciousness and rhythm
**Consciousness** is awareness of your inner and outer world; sleep and wakefulness are two states of it. The sleep/wake cycle is a **circadian rhythm** of about 24 hours. **Jet lag** and **shift work** throw it off.

### The stages (identified by EEG patterns)
- **NREM 1**: light sleep; **hypnagogic sensations** (falling, flashes) as you drift off.
- **NREM 2**: deeper; most of the night is spent here.
- **NREM 3**: deep, slow-wave sleep; hardest to wake from. **Shorter** as the night goes on.
- **REM**: rapid eye movement. **Paradoxical**: brain waves resemble being awake, but the body's muscles are at their most relaxed. Most dreaming. REM periods get **longer** as the night goes on.

Miss REM sleep and you get **REM rebound**: more REM the next time you sleep.

### Why we sleep and dream
- Sleep: **memory consolidation** (organizing and storing the day's memories) and **restoration** (replenishing resources used during the day).
- Dreams: **activation-synthesis** (the brain making a story from random neural activity) and **consolidation theory** (dreams help process and store memories).

### Sleep disorders the exam uses
| Disorder | What happens |
|---|---|
| **Insomnia** | Persistent trouble falling or staying asleep |
| **Narcolepsy** | Sudden, uncontrollable sleep attacks during the day, sometimes straight into REM |
| **REM sleep behavior disorder** | The normal REM paralysis fails, so people act out their dreams |
| **Sleep apnea** | Breathing repeatedly stops during sleep, causing brief awakenings |
| **Somnambulism** | Sleepwalking, usually during deep NREM sleep |`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Circadian rhythm', back: 'The roughly 24-hour sleep/wake cycle' },
            { front: 'Why REM is "paradoxical"', back: 'Brain waves look awake, but the body\'s muscles are most relaxed' },
            { front: 'Across one night', back: 'Deep NREM 3 gets shorter; REM periods get longer' },
            { front: 'REM rebound', back: 'Extra REM after being deprived of it' },
            { front: 'Activation-synthesis theory', back: 'Dreams are the brain\'s attempt to make sense of random neural activity' },
          ],
        },
      ],
      precheck: {
        question: 'REM sleep is called "paradoxical" because:',
        choices: [
          'Brain waves look like wakefulness while the body is at its most relaxed',
          'It happens only at the beginning of the night',
          'People can\'t dream during REM',
          'The heart stops during REM',
        ],
        answer: 0,
        explanations: [
          'Correct. An active, awake-looking brain in a deeply relaxed body is the paradox.',
          'Incorrect. REM periods get longer as the night goes on.',
          'Incorrect. Most dreaming happens in REM.',
          'Incorrect. The heart keeps beating; muscles relax.',
        ],
      },
      checkpoints: [
        {
          question: 'After a week of short nights, Jordan sleeps 11 hours on Saturday and spends far more of it in REM than usual. This is:',
          choices: ['REM rebound', 'Narcolepsy', 'Insomnia', 'A disrupted circadian rhythm from jet lag'],
          answer: 0,
          explanations: [
            'Correct. Making up for lost REM with extra REM is REM rebound.',
            'Incorrect. Narcolepsy is sudden sleep attacks during the day.',
            'Incorrect. Insomnia is trouble falling or staying asleep; Jordan slept easily.',
            'Incorrect. Jordan wasn\'t traveling; this is recovery from REM deprivation.',
          ],
        },
        {
          question: 'A man repeatedly stops breathing during the night and wakes briefly each time, leaving him exhausted during the day. The most likely disorder is:',
          choices: ['Sleep apnea', 'Somnambulism', 'Narcolepsy', 'REM sleep behavior disorder'],
          answer: 0,
          explanations: [
            'Correct. Repeated pauses in breathing with brief awakenings define sleep apnea.',
            'Incorrect. Somnambulism is sleepwalking.',
            'Incorrect. Narcolepsy is sudden sleep attacks, not breathing pauses.',
            'Incorrect. That disorder is acting out dreams because REM paralysis fails.',
          ],
        },
      ],
      revisit:
        'About 24-hour circadian rhythm. NREM 1–3 then REM, repeating; deep sleep shrinks and REM grows through the night. REM = paradoxical, dreams, rebound if missed. ' +
        'Match the disorder to its symptom: breathing pauses = apnea, sleep attacks = narcolepsy, sleepwalking = somnambulism.',
    },
    {
      id: '1.6',
      ced: '1.6.A–1.6.G',
      title: 'Sensation',
      minutes: 10,
      summary:
        'Sensation detects stimuli and transduces them into neural signals. The absolute threshold is the weakest stimulus detected 50% of the time; ' +
        'Weber\'s law says the just-noticeable difference is a constant proportion. Vision runs on rods and cones and two color theories; hearing on pitch ' +
        'and loudness; and the chemical, touch, pain, vestibular and kinesthetic senses each have their own structures and theories.',
      body: `### Detecting the world
**Sensation** detects information from the environment and **transduces** it into neural messages; **perception** is the brain interpreting them.
- **Absolute threshold**: the weakest stimulus detected **at least 50% of the time**.
- **Just-noticeable difference (JND)**: the smallest change you can detect. **Weber's law**: the JND is a constant **proportion** of the original stimulus.
- **Sensory adaptation**: diminished sensitivity to an unchanging stimulus (you stop noticing your watch).
- **Sensory interaction**: senses work together. In **synesthesia**, one sense is experienced through another (seeing colors when hearing music).

${steps({
  title: 'Weber\'s law: if you can just tell 100 g from 102 g, what difference can you notice at 500 g?',
  steps: [
    { title: 'Find the proportion', body: 'JND / weight = 2 g / 100 g = 0.02, so you notice a 2% change.' },
    { title: 'Apply it to the new weight', body: '0.02 × 500 g = 10 g.' },
  ],
  answer: 'About 10 g: the noticeable difference grows with the stimulus.',
})}

### Vision
- The **lens** focuses light on the **retina** (**accommodation**); problems cause **nearsightedness** or **farsightedness**.
- **Rods**: in the periphery, detect shape and movement but **not color**, work in **low light**, drive dark adaptation.
- **Cones**: in the **fovea**, detect **color and detail**; blue (short), green (medium) and red (long wavelength) types.
- **Blind spot**: where the optic nerve leaves the eye; the brain fills in the gap.
- **Trichromatic theory**: three kinds of cones combine to make all colors.
- **Opponent-process theory**: ganglion cells work in pairs (red/green, blue/yellow, black/white); it explains **afterimages**.
- **Color vision deficiency**: dichromatism (one cone type missing) or monochromatism. Damage to visual brain areas can cause **prosopagnosia** (face blindness) or **blindsight**.

### Hearing
**Pitch** comes from the sound wave's wavelength (frequency), **loudness** from its amplitude. Pitch is explained by **place theory** (where the basilar membrane vibrates, high pitches), **frequency theory** (the firing rate matches the frequency, low pitches) and **volley theory** (neurons fire in alternation for mid-range pitches). **Sound localization** uses differences between the two ears. **Conduction deafness** is damage to the mechanical parts (eardrum, bones of the middle ear); **sensorineural deafness** is damage to the cochlea's hair cells or the auditory nerve.

### Chemical senses
- **Smell** is the only sense **not routed first through the thalamus**. **Pheromones** send chemical messages through it.
- **Taste**: sweet, sour, salty, bitter, umami and oleogustus (fat). More taste receptors make a **supertaster**; fewer, a nontaster.
- Smell and taste interact: with a blocked nose, food tastes bland.

### Body senses
- **Touch**: receptors in the skin. "Hot" comes from warm and cold receptors firing together.
- **Pain**: processed in body and brain. **Gate control theory**: the spinal cord can "close a gate" to pain signals. **Phantom limb** sensations come from a limb that's gone.
- **Vestibular sense**: balance, from the **semicircular canals** in the inner ear.
- **Kinesthesis**: the sense of your body's position and movement, so you can move without watching your limbs.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Absolute threshold', back: 'The weakest stimulus detected at least 50% of the time' },
            { front: 'Weber\'s law', back: 'The just-noticeable difference is a constant proportion of the stimulus' },
            { front: 'Rods vs cones', back: 'Rods: periphery, low light, no color. Cones: fovea, color and detail.' },
            { front: 'Opponent-process theory explains…', back: 'Afterimages (red/green, blue/yellow, black/white pairs)' },
            { front: 'The one sense not sent first to the thalamus', back: 'Smell' },
            { front: 'Vestibular sense vs kinesthesis', back: 'Vestibular: balance (semicircular canals). Kinesthesis: body position and movement.' },
          ],
        },
      ],
      precheck: {
        question: 'The absolute threshold is the minimum stimulation needed to detect a stimulus:',
        choices: ['At least 50% of the time', '100% of the time', 'At least once', 'At least 75% of the time'],
        answer: 0,
        explanations: [
          'Correct. The CED defines it as detection at least 50% of the time.',
          'Incorrect. Perfect detection is far above threshold.',
          'Incorrect. A single detection could be a guess.',
          'Incorrect. The standard is 50%.',
        ],
      },
      checkpoints: [
        {
          question: 'You can just notice the difference between 100 and 105 candles burning. By Weber\'s law, how many candles must be added to 200 to notice a difference?',
          choices: ['10', '5', '20', '105'],
          answer: 0,
          explanations: [
            'Correct. 5/100 = 5%, and 5% of 200 is 10.',
            'Incorrect. The JND is a proportion, not a fixed amount: it doubles when the stimulus doubles.',
            'Incorrect. 20 would be a 10% change; the JND is 5%.',
            'Incorrect. That confuses the original comparison with the new one.',
          ],
        },
        {
          question: 'After staring at a red square for a minute, Leo looks at a white wall and sees a green square. Which theory best explains this?',
          choices: ['Opponent-process theory', 'Trichromatic theory', 'Place theory', 'Gate control theory'],
          answer: 0,
          explanations: [
            'Correct. Red and green are an opponent pair; when the red side tires, green shows up as an afterimage.',
            'Incorrect. Trichromatic theory explains color mixing by three cone types, not afterimages.',
            'Incorrect. Place theory explains pitch perception in hearing.',
            'Incorrect. Gate control theory explains pain.',
          ],
        },
      ],
      revisit:
        'Thresholds: absolute = detected 50% of the time; JND follows Weber\'s proportion. Rods: dim light, no color; cones: color in the fovea. ' +
        'Afterimages = opponent-process. Smell skips the thalamus. Vestibular = balance; kinesthesis = body position.',
    },
  ],
};

export default pack;
