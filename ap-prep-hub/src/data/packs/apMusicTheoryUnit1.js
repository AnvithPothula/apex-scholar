/**
 * AP Music Theory Unit 1: Music Fundamentals I — study pack.
 *
 * Written against the AP Music Theory CED effective Fall 2026 (topics
 * 1.1–1.10 in six sections). The CED gives no unit weighting. Two audio sims
 * (Web Audio, no files): a major-scale builder that spells and plays any of
 * the 15 major scales, and a meter lab that clicks beats and divisions for
 * any simple or compound time signature. Tempo and dynamics terms get
 * ordering activities, following the CED's boundary statement (only the
 * listed Italian terms are tested).
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-music-theory/unit-1',
  subject: 'AP Music Theory',
  unit: 'Unit 1: Music Fundamentals I',
  examWeight: 'no unit weighting (fundamentals underpin the whole exam)',
  intro:
    'The building blocks every later unit relies on: reading pitches in treble, bass and C clefs, note and rest values, half and ' +
    'whole steps, major scales and scale degrees, key signatures and the circle of fifths, simple and compound meter, rhythmic ' +
    'patterns, and the Italian terms for tempo, dynamics and articulation.',
  sections: [
    {
      id: '1.1',
      ced: 'PIT-1.A–B, PIT-3.A',
      title: 'Pitch and Pitch Notation',
      minutes: 7,
      summary:
        'Pitches are tones with specific frequencies. A clef assigns letter names to the staff\'s lines and spaces: treble, bass, and the ' +
        'C clefs (alto, tenor). An octave spans to the next pitch with the same letter. Accidentals (sharp, flat, natural) go to the left of ' +
        'the notehead. Enharmonic equivalents sound the same but are spelled differently.',
      body: String.raw`### The staff and clefs
A **pitch** is a tone with a specific frequency. On a five-line **staff**, a **clef** assigns letter names (A–G) to lines and spaces.

| Clef | Landmark | Lines (bottom → top) | Spaces |
|---|---|---|---|
| **Treble** (G clef) | Curls around **G** (2nd line) | E G B D F | F A C E |
| **Bass** (F clef) | Dots around **F** (4th line) | G B D F A | A C E G |
| **Alto** (C clef) | **Middle C** on the 3rd (middle) line | F A C E G | G B D F |
| **Tenor** (C clef) | **Middle C** on the 4th line | D F A C E | E G B D |

Ledger lines extend the staff above or below. Middle C sits one ledger line below the treble staff and one above the bass staff.

### Octaves and accidentals
- The **octave** is the distance from one pitch to the next pitch with the **same letter name** (C to the next C).
- **Accidentals** change a pitch: **sharp ♯** (up a half step), **flat ♭** (down a half step), **natural ♮** (cancels a sharp or flat). Always write the accidental to the **left** of the notehead.
- **Enharmonic equivalents** are the same pitch spelled differently, such as **C♯ and D♭**. Which spelling is correct depends on the musical context (the key).

### On the exam
- You'll identify pitches you see and hear, and spot **discrepancies** between a score and a performance.
- Aural questions test **relative pitch**: you're always given a starting pitch.
- In **sight-singing**, partial credit comes from keeping the tonic and the melody's general contour, and from holding notes, especially the final one, for their full value.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Treble clef lines and spaces', back: 'Lines E G B D F; spaces F A C E.' },
            { front: 'Bass clef lines and spaces', back: 'Lines G B D F A; spaces A C E G.' },
            { front: 'Alto clef', back: 'A C clef with middle C on the middle (3rd) line.' },
            { front: 'Enharmonic equivalents', back: 'Same pitch, different spelling, e.g., C♯ and D♭, or E♯ and F.' },
            { front: 'Where accidentals go', back: 'To the left of the notehead.' },
          ],
        },
      ],
      precheck: {
        question: 'In treble clef, which note sits on the second line from the bottom?',
        choices: ['G', 'E', 'B', 'F'],
        answer: 0,
        explanations: [
          'Correct. The treble (G) clef curls around the G line, the second line.',
          'Incorrect. E is the bottom line.',
          'Incorrect. B is the middle line.',
          'Incorrect. F is the top line (and the bottom space).',
        ],
      },
      checkpoints: [
        {
          question: 'Which pair are enharmonic equivalents?',
          choices: ['G♯ and A♭', 'G and A', 'C♯ and C♭', 'E and E♭'],
          answer: 0,
          explanations: [
            'Correct. They are the same pitch spelled two ways.',
            'Incorrect. These are a whole step apart.',
            'Incorrect. These are a whole step apart.',
            'Incorrect. These are a half step apart.',
          ],
        },
        {
          question: 'In alto clef, which pitch is on the middle line?',
          choices: ['Middle C', 'B (in treble clef position)', 'D', 'F'],
          answer: 0,
          explanations: [
            'Correct. The alto clef points to middle C on the middle line.',
            'Incorrect. That is the treble clef\'s middle line.',
            'Incorrect. D is the bass clef\'s middle line.',
            'Incorrect. F is not on the alto middle line.',
          ],
        },
      ],
      revisit:
        'Clefs name the staff: treble (EGBDF/FACE), bass (GBDFA/ACEG), alto (middle C on line 3), tenor (middle C on line 4). Octave = ' +
        'same letter; accidentals left of the notehead; enharmonic = same pitch, different spelling.',
    },
    {
      id: '1.2',
      ced: 'RHY-1.A',
      title: 'Rhythmic Values',
      minutes: 5,
      summary:
        'Rhythmic values show how long notes and rests last. Ties and augmentation dots extend durations: a dot adds half the note\'s ' +
        'value, a double dot adds half plus a quarter. Ties join two notes of the same pitch into one sound.',
      body: String.raw`### Note and rest values
Measured with a **quarter note = 1 beat** (as in 4/4):

| Note / rest | Beats | Equals |
|---|---|---|
| **Whole** | 4 | 2 halves |
| **Half** | 2 | 2 quarters |
| **Quarter** | 1 | 2 eighths |
| **Eighth** | ½ | 2 sixteenths |
| **Sixteenth** | ¼ | |

Each rest has the same duration as its matching note.

### Extending durations
- **Augmentation dot**: adds **half** the note's value. Dotted half = 2 + 1 = **3** beats; dotted quarter = 1 + ½ = **1½** beats.
- **Double dot**: adds half **plus** a quarter of the value. Double-dotted half = 2 + 1 + ½ = **3½** beats.
- **Tie**: a curved line joining two notes of the **same pitch**; play them as one note lasting both durations (a half tied to a quarter = 3 beats). A tie can cross a bar line; a dot can't.`,
      blocks: [],
      precheck: {
        question: 'With the quarter note as one beat, how many beats does a dotted half note last?',
        choices: ['3', '2', '2½', '4'],
        answer: 0,
        explanations: [
          'Correct. 2 + half of 2 = 3.',
          'Incorrect. That ignores the dot.',
          'Incorrect. The dot adds half of 2, which is 1.',
          'Incorrect. That would be a whole note.',
        ],
      },
      checkpoints: [
        {
          question: 'A quarter note tied to an eighth note of the same pitch lasts:',
          choices: ['1½ beats', '1 beat', '2 beats', '½ beat'],
          answer: 0,
          explanations: [
            'Correct. 1 + ½ = 1½ beats (the same as a dotted quarter).',
            'Incorrect. The tie adds the eighth\'s duration.',
            'Incorrect. That would need two quarters.',
            'Incorrect. That is just the eighth.',
          ],
        },
        {
          question: 'How long is a double-dotted quarter note (quarter = 1 beat)?',
          choices: ['1¾ beats', '1½ beats', '2 beats', '1¼ beats'],
          answer: 0,
          explanations: [
            'Correct. 1 + ½ + ¼ = 1¾.',
            'Incorrect. That is a single dot.',
            'Incorrect. That overshoots.',
            'Incorrect. The first dot alone adds ½.',
          ],
        },
      ],
      revisit:
        'Whole 4, half 2, quarter 1, eighth ½, sixteenth ¼ (quarter = beat). Dot adds half; double dot adds half + quarter. Tie joins ' +
        'same-pitch notes into one sound.',
    },
    {
      id: '1.3–1.4',
      ced: 'PIT-1.C–E',
      title: 'Half Steps, Whole Steps, Major Scales, and Scale Degrees',
      minutes: 8,
      summary:
        'The half step is the smallest distance between pitches; a whole step is two half steps. A major scale follows W-W-H-W-W-W-H. ' +
        'Each pitch has a function relative to the tonic, named by scale degree: tonic, supertonic, mediant, subdominant, dominant, ' +
        'submediant, leading tone (subtonic when the seventh is a whole step below the tonic).',
      body: String.raw`### Half and whole steps
- **Half step** (semitone): the **smallest** possible distance, one key to the very next on a piano (E–F, B–C, C–C♯).
- **Whole step** (whole tone): **two** half steps (C–D, E–F♯).

On the white keys, the only natural half steps are **E–F** and **B–C**.

### The major scale
Pattern: **W – W – H – W – W – W – H**. Every major scale uses each letter once, in order, so the spelling is fixed: D major is D E F♯ G A B C♯ D, never D E G♭….

### Scale degrees
| Degree | Name | Role |
|---|---|---|
| 1 | **Tonic** | Home, the central pitch |
| 2 | **Supertonic** | Above the tonic |
| 3 | **Mediant** | Halfway between tonic and dominant |
| 4 | **Subdominant** | A fifth below the tonic |
| 5 | **Dominant** | Strongest pull back to the tonic |
| 6 | **Submediant** | Halfway between tonic and subdominant (going down) |
| 7 | **Leading tone** | A **half step** below the tonic, leading up to it |

When the seventh degree is a **whole step** below the tonic (as in natural minor), it's called the **subtonic**. Scale degrees are also written as numbers with carets (1̂, 2̂, …).

Pick a tonic below to see and hear its major scale.`,
      blocks: [{ type: 'sim', sim: 'scale-builder' }],
      precheck: {
        question: 'What is the pattern of whole (W) and half (H) steps in a major scale?',
        choices: ['W W H W W W H', 'W H W W H W W', 'H W W W H W W', 'W W W H W W H'],
        answer: 0,
        explanations: [
          'Correct. Half steps fall between degrees 3–4 and 7–8.',
          'Incorrect. That is the natural minor pattern.',
          'Incorrect. That isn\'t a major scale.',
          'Incorrect. The first half step comes between degrees 3 and 4.',
        ],
      },
      checkpoints: [
        {
          question: 'What is the dominant (scale degree 5) of A major?',
          choices: ['E', 'D', 'G♯', 'C♯'],
          answer: 0,
          explanations: [
            'Correct. A B C♯ D E: E is the fifth degree.',
            'Incorrect. D is the subdominant (4).',
            'Incorrect. G♯ is the leading tone (7).',
            'Incorrect. C♯ is the mediant (3).',
          ],
        },
        {
          question: 'Which correctly spells the E♭ major scale?',
          choices: [
            'E♭ F G A♭ B♭ C D E♭',
            'E♭ F G G♯ B♭ C D E♭',
            'E♭ F G A B♭ C D E♭',
            'E♭ F♯ G A♭ B♭ C D E♭',
          ],
          answer: 0,
          explanations: [
            'Correct. Three flats (B♭, E♭, A♭), each letter used once.',
            'Incorrect. G♯ repeats the letter G; it should be A♭.',
            'Incorrect. A–B♭ is a half step, so degree 4 must be A♭ to make G–A♭ the half step.',
            'Incorrect. E♭ to F is already a whole step; F♯ is too high.',
          ],
        },
      ],
      revisit:
        'Half step = smallest (E–F, B–C); whole step = two half steps. Major = W W H W W W H, each letter once. Degrees: tonic, ' +
        'supertonic, mediant, subdominant, dominant, submediant, leading tone (subtonic if a whole step below).',
    },
    {
      id: '1.5',
      ced: 'PIT-1.F, PIT-3.B',
      title: 'Major Keys and Key Signatures',
      minutes: 7,
      summary:
        'Music built on a scale with that scale\'s tonic as center is in that key. A key signature lists the scale\'s sharps or flats in a ' +
        'fixed order. Pitches in the key are diatonic; others are chromatic. The circle of fifths places closely related keys next to each ' +
        'other. Dictation means spelling pitches correctly in the key and the right octave.',
      body: String.raw`### Keys
A passage that uses the D major scale and treats D as home is **in D major**. Pitches in the key are **diatonic**; pitches outside it are **chromatic**.

### Key signatures
The sharps or flats always appear in a **fixed order**:
- **Sharps**: F♯ C♯ G♯ D♯ A♯ E♯ B♯ ("Father Charles Goes Down And Ends Battle")
- **Flats**: B♭ E♭ A♭ D♭ G♭ C♭ F♭ (the sharps backward: "Battle Ends And Down Goes Charles' Father")

**Finding the major key quickly**
- Sharp keys: go **up a half step** from the **last sharp**. (Last sharp C♯ → **D major**.)
- Flat keys: the **second-to-last flat** is the key. (B♭ E♭ A♭ → **E♭ major**.) One flat is **F major**; none is **C major**.

| Sharps | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| **Key** | C | G | D | A | E | B | F♯ | C♯ |

| Flats | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| **Key** | F | B♭ | E♭ | A♭ | D♭ | G♭ | C♭ |

### The circle of fifths
Arrange the keys a **perfect fifth** apart in a circle: going clockwise from C (G, D, A…) **adds a sharp**; going counterclockwise (F, B♭, E♭…) **adds a flat**. Neighbors on the circle differ by one accidental, so they're **closely related**. At the bottom, enharmonic keys overlap (B = C♭, F♯ = G♭, C♯ = D♭).

### Melodic dictation
Writing down a melody you hear depends on hearing each pitch's **relationship to the tonic**, then **spelling it correctly in the key** and in the **right octave**.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Order of sharps', back: 'F C G D A E B' },
            { front: 'Order of flats', back: 'B E A D G C F' },
            { front: 'Key with 4 sharps', back: 'E major (last sharp D♯ → up a half step to E).' },
            { front: 'Key with 2 flats', back: 'B♭ major (second-to-last flat).' },
            { front: 'Diatonic vs. chromatic', back: 'Diatonic: belongs to the key\'s scale. Chromatic: outside it.' },
          ],
        },
      ],
      precheck: {
        question: 'A key signature has three sharps. What major key is it?',
        choices: ['A major', 'D major', 'E major', 'G major'],
        answer: 0,
        explanations: [
          'Correct. F♯ C♯ G♯: up a half step from G♯ is A.',
          'Incorrect. D major has two sharps.',
          'Incorrect. E major has four sharps.',
          'Incorrect. G major has one sharp.',
        ],
      },
      checkpoints: [
        {
          question: 'Which key signature belongs to A♭ major?',
          choices: ['Four flats: B♭ E♭ A♭ D♭', 'Three flats: B♭ E♭ A♭', 'Four sharps', 'Five flats: B♭ E♭ A♭ D♭ G♭'],
          answer: 0,
          explanations: [
            'Correct. The second-to-last flat, A♭, names the key.',
            'Incorrect. That is E♭ major.',
            'Incorrect. Flat keys don\'t use sharps.',
            'Incorrect. That is D♭ major.',
          ],
        },
        {
          question: 'On the circle of fifths, the key one step clockwise from D major is:',
          choices: ['A major', 'G major', 'E major', 'B♭ major'],
          answer: 0,
          explanations: [
            'Correct. Clockwise moves up a fifth and adds a sharp (A has three).',
            'Incorrect. G is counterclockwise from D.',
            'Incorrect. E is two steps clockwise.',
            'Incorrect. B♭ is on the flat side.',
          ],
        },
      ],
      revisit:
        'Sharps F C G D A E B; flats B E A D G C F. Sharp keys: half step above last sharp; flat keys: second-to-last flat (F = 1 flat). ' +
        'Diatonic vs. chromatic. Circle of fifths: clockwise adds sharps; neighbors are closely related.',
    },
    {
      id: '1.6–1.7',
      ced: 'RHY-1.B–D',
      title: 'Beat Division, Meter, and Time Signatures',
      minutes: 8,
      summary:
        'Meter layers three pulses: beat, division and measure. Simple meter divides the beat in two; compound in three. Beats group ' +
        'into duple, triple or quadruple measures. In a time signature, upper 2/3/4 means simple and 6/9/12 compound; the lower number is ' +
        'the beat in simple meter and the division in compound. The downbeat is strongest.',
      body: String.raw`### Three layers of pulse
**Meter** organizes rhythm into interlocking pulses: the **beat**, its **division**, and the **measure**.

| | Beat divides into | Example |
|---|---|---|
| **Simple** meter | **2** | 4/4: quarter-note beat → two eighths |
| **Compound** meter | **3** | 6/8: dotted-quarter beat → three eighths |

Beats group into **duple** (2), **triple** (3) or **quadruple** (4) measures. So 4/4 is **simple quadruple**; 6/8 is **compound duple**.

### Reading time signatures
- **Upper number**: 2, 3, 4 → **simple** (duple, triple, quadruple); 6, 9, 12 → **compound** (duple, triple, quadruple).
- **Lower number**: in simple meter, the note value that gets the **beat**; in compound meter, the value of the **division**.

| Signature | Meter type | Beat | Division |
|---|---|---|---|
| 3/8 | Simple triple | Eighth | Sixteenths |
| 2/2 | Simple duple | Half | Quarters |
| 9/8 | Compound triple | Dotted quarter | Eighths (nine per measure) |
| 12/8 | Compound quadruple | Dotted quarter | Eighths |

### Strong and weak beats
The **downbeat** (beat 1) is always strongest. In 4/4, beat 3 is a lesser strong beat and beats 2 and 4 are weak. Divisions **on** the beat are strong compared with **offbeats** between them.

Try the meter lab: the tall bar is the downbeat, medium bars are beats, short bars are divisions.`,
      blocks: [{ type: 'sim', sim: 'meter-lab' }],
      precheck: {
        question: 'What meter type is 6/8?',
        choices: ['Compound duple', 'Simple triple', 'Simple duple', 'Compound triple'],
        answer: 0,
        explanations: [
          'Correct. Two dotted-quarter beats, each divided into three eighths.',
          'Incorrect. Upper 6 signals compound meter, not simple.',
          'Incorrect. The beat divides into three, so it is compound.',
          'Incorrect. Compound triple is 9/8.',
        ],
      },
      checkpoints: [
        {
          question: 'In 3/4, which beat is the strongest?',
          choices: ['Beat 1, the downbeat', 'Beat 2', 'Beat 3', 'All beats are equal'],
          answer: 0,
          explanations: [
            'Correct. The downbeat is always strongest.',
            'Incorrect. Beat 2 is weak.',
            'Incorrect. Beat 3 is weak.',
            'Incorrect. Meter creates strong and weak beats.',
          ],
        },
        {
          question: 'In 12/8, what gets the beat, and how many beats are in a measure?',
          choices: [
            'A dotted quarter; four beats',
            'An eighth note; twelve beats',
            'A quarter note; three beats',
            'A dotted half; two beats',
          ],
          answer: 0,
          explanations: [
            'Correct. Twelve eighths group into four dotted-quarter beats (compound quadruple).',
            'Incorrect. In compound meter the lower number is the division, not the beat.',
            'Incorrect. That would be 3/4.',
            'Incorrect. That would be 6/4.',
          ],
        },
      ],
      revisit:
        'Simple: beat ÷ 2; compound: beat ÷ 3. Duple/triple/quadruple = beats per measure. Upper 2/3/4 simple, 6/9/12 compound; lower = ' +
        'beat (simple) or division (compound). Downbeat strongest; on-beat divisions strong, offbeats weak.',
    },
    {
      id: '1.8',
      ced: 'RHY-2.A–B',
      title: 'Rhythmic Patterns',
      minutes: 5,
      summary:
        'Rhythmic patterns are the ways values fill a beat; compound beats allow more patterns than simple beats. Some patterns, like ' +
        'dotted rhythms, have names. Notate rhythms so the beats are visible, never beaming across the half-bar in quadruple meter. ' +
        'Performances should match the score, except in styles like swing.',
      body: String.raw`### Patterns within a beat
A **rhythmic pattern** is a way of filling a beat with notes and rests. Simple beats (split in two) have fewer possible patterns than compound beats (split in three).

| In simple meter (quarter beat) | In compound meter (dotted-quarter beat) |
|---|---|
| Quarter | Dotted quarter |
| Two eighths | Three eighths |
| Four sixteenths | Quarter + eighth |
| Dotted eighth + sixteenth (a **dotted rhythm**) | Eighth + quarter |
| Eighth + two sixteenths | Dotted eighth + sixteenth + eighth |

Learning patterns by **sight and sound** speeds up reading, dictation and sight-singing.

### Notating clearly
Group notes, rests, ties and beams so **each beat is visible**. In quadruple meter, **don't beam across the half-bar** (between beats 2 and 3). Notation that hides the beat structure is considered **wrong**, even if the durations add up.

### Score vs. performance
Performers should play the notated rhythm, except in styles that allow freedom. In **swing**, for example, offbeat notes are played **later** than written.`,
      blocks: [],
      precheck: {
        question: 'In 4/4, why is beaming four eighth notes across beats 2 and 3 considered incorrect notation?',
        choices: [
          'It hides the half-bar, obscuring the beat structure',
          'Eighth notes can never be beamed',
          'It changes the durations of the notes',
          'Beams are only used in compound meter',
        ],
        answer: 0,
        explanations: [
          'Correct. The CED says not to beam across the half-bar in quadruple meter.',
          'Incorrect. Eighths are usually beamed within a beat.',
          'Incorrect. The durations stay the same; clarity suffers.',
          'Incorrect. Beams are used in both simple and compound meter.',
        ],
      },
      checkpoints: [
        {
          question: 'A dotted eighth followed by a sixteenth in simple meter fills:',
          choices: ['One quarter-note beat', 'Half a beat', 'Two beats', 'One and a half beats'],
          answer: 0,
          explanations: [
            'Correct. ¾ + ¼ = 1 beat: a classic dotted rhythm.',
            'Incorrect. It adds up to a full beat.',
            'Incorrect. That is too long.',
            'Incorrect. That is too long.',
          ],
        },
        {
          question: 'A jazz band plays written even eighth notes with the offbeats delayed. This is:',
          choices: ['Swing, a style that allows rhythmic deviation', 'A rhythmic error in every case', 'A change of meter', 'A tempo change'],
          answer: 0,
          explanations: [
            'Correct. Swing intentionally plays offbeats later.',
            'Incorrect. In swing style this is expected.',
            'Incorrect. The meter is unchanged.',
            'Incorrect. The beat speed is the same.',
          ],
        },
      ],
      revisit:
        'Rhythmic patterns fill beats; compound beats allow more. Dotted rhythms are named patterns. Show beats in notation; no beams ' +
        'across the half-bar. Perform as written except in styles like swing.',
    },
    {
      id: '1.9–1.10',
      ced: 'DES-3.A–D',
      title: 'Tempo, Dynamics, and Articulation',
      minutes: 7,
      summary:
        'Tempo terms run from very slow (largo, larghetto, grave) through slow (lento, adagio), moderately slow (andante, andantino), ' +
        'moderate (moderato) and fast (allegretto, allegro, vivace, presto, prestissimo); metronome marks give beats per minute. Accelerando, ' +
        'ritardando, ritenuto and rubato change tempo. Dynamics run pp to ff, with crescendo, decrescendo, subito and sforzando. Articulation describes attack and connection.',
      body: String.raw`### Tempo
| Speed | Terms |
|---|---|
| Very slow | **Largo, larghetto, grave** |
| Slow | **Lento, adagio** |
| Moderately slow | **Andante, andantino** |
| Moderate | **Moderato** |
| Faster | **Allegretto, allegro, vivace, presto, prestissimo** |

A **metronome marking** names a beat note and beats per minute ("quarter note = 88"). Tempo marks usually go at the start of a movement or section.

**Changing tempo**: **accelerando** (gradually faster), **ritardando** (gradually slower), **ritenuto** (suddenly slower), **rubato** (flexible, free tempo).

### Dynamics
| Mark | Italian | Meaning |
|---|---|---|
| **pp** | pianissimo | Very soft |
| **p** | piano | Soft |
| **mp** | mezzo piano | Moderately soft |
| **mf** | mezzo forte | Moderately loud |
| **f** | forte | Loud |
| **ff** | fortissimo | Very loud |

Changes: **crescendo** (getting louder, the opening "hairpin" <), **decrescendo** (getting softer, >), **subito** (suddenly). A **dynamic accent** on one note: **sf / sfz** (sforzando). **Terraced dynamics**: sudden shifts between loud and soft sections.

### Articulation
How a sound **starts** (its attack) and **ends**, and how **connected** notes are: **staccato** dots (short, detached), **legato/tenuto** lines (smooth, held full value), **slurs** (connected), **marcato** accents (strongly accented), or words like *sempre tenuto*. A **tremolo** rapidly repeats one pitch.

### Sight-singing on the exam
Melodies carry simple markings (like forte and moderato) and only standard phrase slurs. Keep a **steady tempo**, avoid restarts, and don't change speed unless the music says so.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Order these tempo markings',
            instruction: 'tap them from slowest to fastest',
            hideYears: true,
            events: [
              { year: 1, label: 'Largo' },
              { year: 2, label: 'Adagio' },
              { year: 3, label: 'Andante' },
              { year: 4, label: 'Moderato' },
              { year: 5, label: 'Allegro' },
              { year: 6, label: 'Presto' },
              { year: 7, label: 'Prestissimo' },
            ],
          },
        },
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'Order these dynamics',
            instruction: 'tap them from softest to loudest',
            hideYears: true,
            events: [
              { year: 1, label: 'pp (pianissimo)' },
              { year: 2, label: 'p (piano)' },
              { year: 3, label: 'mp (mezzo piano)' },
              { year: 4, label: 'mf (mezzo forte)' },
              { year: 5, label: 'f (forte)' },
              { year: 6, label: 'ff (fortissimo)' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which marking tells a performer to gradually slow down?',
        choices: ['Ritardando', 'Accelerando', 'Rubato', 'Crescendo'],
        answer: 0,
        explanations: [
          'Correct. Ritardando is a gradual slowing.',
          'Incorrect. Accelerando speeds up.',
          'Incorrect. Rubato means flexible tempo, not steadily slower.',
          'Incorrect. Crescendo is about volume.',
        ],
      },
      checkpoints: [
        {
          question: 'Which is the correct order from softest to loudest?',
          choices: ['p, mp, mf, f', 'mp, p, f, mf', 'p, mf, mp, f', 'f, mf, mp, p'],
          answer: 0,
          explanations: [
            'Correct. Piano, mezzo piano, mezzo forte, forte.',
            'Incorrect. Piano is softer than mezzo piano.',
            'Incorrect. Mezzo piano is softer than mezzo forte.',
            'Incorrect. That runs loudest to softest.',
          ],
        },
        {
          question: 'Dots placed above notes most likely tell the performer to play them:',
          choices: ['Staccato: short and detached', 'Legato: smooth and connected', 'Louder', 'Faster'],
          answer: 0,
          explanations: [
            'Correct. Staccato dots shorten and separate notes.',
            'Incorrect. Legato uses lines or slurs.',
            'Incorrect. Dots are articulation, not dynamics.',
            'Incorrect. Dots don\'t change tempo.',
          ],
        },
      ],
      revisit:
        'Tempo: largo/larghetto/grave → lento/adagio → andante/andantino → moderato → allegretto/allegro/vivace/presto/prestissimo; ' +
        'accelerando, ritardando, ritenuto, rubato. Dynamics pp→ff, crescendo, decrescendo, subito, sfz, terraced. Articulation: staccato, tenuto/legato, slur, marcato.',
    },
  ],
};

export default pack;
