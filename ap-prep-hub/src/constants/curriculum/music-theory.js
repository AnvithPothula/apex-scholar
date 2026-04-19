// AP Music Theory curriculum data
const musicTheory = {
  name: "AP Music Theory",
  description: "Develop skills in listening to, analyzing, and notating music. Students learn to recognize, understand, and describe the basic materials and processes of music.",
  examFormat: {
    duration: "2 hours 40 minutes",
    sections: [
      { name: "Multiple Choice", questions: 75, time: "80 minutes", weight: "45%" },
      { name: "Free Response - Written", questions: 7, time: "80 minutes", weight: "45%" },
      { name: "Free Response - Aural", questions: 2, time: "40 minutes", weight: "10%" }
    ]
  },
  bigIdeas: [
    "Pitch: How do we understand and notate pitch relationships in music?",
    "Rhythm and Meter: How do we understand and notate time in music?",
    "Form and Analysis: How do we understand musical structures and formal procedures?",
    "Musical Style: How do we understand music in its historical and cultural contexts?"
  ],
  units: [
    {
      name: "Unit 1: Music Fundamentals I - Pitch, Major Scales and Key Signatures, Rhythm, Meter, and Expressive Elements",
      weight: "20-25%",
      topics: [
        "Staff notation",
        "Clefs and ledger lines",
        "Major scales and key signatures",
        "Intervals",
        "Rhythm and note values",
        "Time signatures",
        "Dynamics and articulation"
      ],
      keyConcepts: [
        "Treble and bass clef notation",
        "Circle of fifths",
        "Major scale pattern (W-W-H-W-W-W-H)",
        "Interval quality and size",
        "Simple and compound meters",
        "Beat subdivisions",
        "Musical expression markings"
      ],
      essentialKnowledge: [
        "Staff notation represents pitch and rhythm accurately",
        "Key signatures determine the tonal center",
        "Intervals are the building blocks of harmony",
        "Time signatures organize musical time",
        "Expression markings communicate musical intent"
      ]
    },
    {
      name: "Unit 2: Music Fundamentals II - Minor Scales and Key Signatures, Melody, Timbre, and Texture",
      weight: "15-20%",
      topics: [
        "Minor scales (natural, harmonic, melodic)",
        "Relative and parallel relationships",
        "Melodic construction",
        "Phrase structure",
        "Timbre and instrumentation",
        "Musical texture types"
      ],
      keyConcepts: [
        "Three forms of minor scales",
        "Relative major/minor relationships",
        "Melodic contour and motion",
        "Antecedent and consequent phrases",
        "Monophonic, homophonic, polyphonic textures",
        "Instrumental families and characteristics"
      ],
      essentialKnowledge: [
        "Minor scales have different forms for different functions",
        "Melodies are constructed from motivic and phrasal units",
        "Texture describes how musical lines interact",
        "Timbre affects musical expression and style",
        "Phrase structure creates musical syntax"
      ]
    },
    {
      name: "Unit 3: Music Fundamentals III - Triads and Seventh Chords",
      weight: "15-20%",
      topics: [
        "Triad construction and quality",
        "Seventh chord construction",
        "Chord symbols and figured bass",
        "Inversions",
        "Voice leading principles"
      ],
      keyConcepts: [
        "Major, minor, diminished, augmented triads",
        "Seventh chord types and qualities",
        "Root position and inversions",
        "Figured bass notation",
        "Smooth voice leading",
        "Chord function in keys"
      ],
      essentialKnowledge: [
        "Triads are built from specific interval patterns",
        "Seventh chords add harmonic color and function",
        "Inversions change bass note while preserving chord quality",
        "Voice leading creates smooth harmonic progressions",
        "Chords have functional roles in tonal music"
      ]
    },
    {
      name: "Unit 4: Harmony and Voice Leading I - Chord Function, Cadences, and Phrase Harmonization",
      weight: "15-20%",
      topics: [
        "Tonic, predominant, and dominant functions",
        "Cadence types",
        "Phrase harmonization",
        "Non-chord tones",
        "Voice leading in four parts"
      ],
      keyConcepts: [
        "Functional harmony system",
        "Authentic, plagal, half, and deceptive cadences",
        "Roman numeral analysis",
        "Passing tones, neighbor tones, suspensions",
        "SATB voice leading rules",
        "Harmonic rhythm"
      ],
      essentialKnowledge: [
        "Chords function in predictable harmonic patterns",
        "Cadences provide closure and articulation",
        "Non-chord tones add melodic interest",
        "Voice leading follows established principles",
        "Harmonic rhythm affects musical flow"
      ]
    },
    {
      name: "Unit 5: Harmony and Voice Leading II - Chord Progressions and Predominant Function",
      weight: "10-15%",
      topics: [
        "Common chord progressions",
        "Predominant chords (ii, IV, vi)",
        "Secondary dominants",
        "Modulation techniques",
        "Sequence patterns"
      ],
      keyConcepts: [
        "Circle of fifths progressions",
        "Predominant chord function",
        "Secondary dominant chords (V/V, V/vi, etc.)",
        "Closely related keys",
        "Modulation vs. tonicization",
        "Sequential patterns"
      ],
      essentialKnowledge: [
        "Chord progressions follow common patterns",
        "Predominant chords prepare dominant harmony",
        "Secondary dominants temporarily tonicize other keys",
        "Modulation expands tonal resources",
        "Sequences create harmonic and melodic patterns"
      ]
    },
    {
      name: "Unit 6: Harmony and Voice Leading III - Embellishments, Motives, and Melodic Devices",
      weight: "5-10%",
      topics: [
        "Advanced non-chord tones",
        "Motivic development",
        "Melodic devices and ornamentation",
        "Texture and accompaniment patterns",
        "Style characteristics"
      ],
      keyConcepts: [
        "Appoggiaturas, escape tones, anticipations",
        "Motivic transformation techniques",
        "Sequence, inversion, fragmentation",
        "Alberti bass, arpeggiation patterns",
        "Period style characteristics",
        "Embellishment and ornamentation"
      ],
      essentialKnowledge: [
        "Non-chord tones create expressive dissonance",
        "Motives can be developed through various techniques",
        "Accompaniment patterns support melodic lines",
        "Musical style varies by historical period",
        "Ornamentation adds expressive detail"
      ]
    },
    {
      name: "Unit 7: Harmony and Voice Leading IV - Secondary Function and Modulation",
      weight: "5-10%",
      topics: [
        "Advanced secondary function",
        "Modulation types and techniques",
        "Harmonic analysis of modulation",
        "Key relationships",
        "Chromatic harmony"
      ],
      keyConcepts: [
        "Secondary leading-tone chords",
        "Common chord modulation",
        "Direct modulation",
        "Closely vs. distantly related keys",
        "Chromatic voice leading",
        "Enharmonic relationships"
      ],
      essentialKnowledge: [
        "Secondary function extends beyond dominant chords",
        "Different modulation techniques serve different purposes",
        "Key relationships affect modulatory distance",
        "Chromatic harmony expands tonal possibilities",
        "Analysis reveals structural harmonic patterns"
      ]
    },
    {
      name: "Unit 8: Modes and Form",
      weight: "5-10%",
      topics: [
        "Church modes",
        "Modal characteristics",
        "Binary and ternary forms",
        "Rondo form",
        "Theme and variations",
        "Formal analysis"
      ],
      keyConcepts: [
        "Dorian, Phrygian, Lydian, Mixolydian modes",
        "Modal scale degrees and characteristics",
        "Binary form (AB, rounded binary)",
        "Ternary form (ABA)",
        "Rondo patterns (ABACA, ABACABA)",
        "Variation techniques",
        "Phrase and period structure"
      ],
      essentialKnowledge: [
        "Modes provide alternatives to major/minor tonality",
        "Musical forms organize time and create structure",
        "Different forms serve different expressive purposes",
        "Formal analysis reveals compositional design",
        "Variation techniques transform musical material"
      ]
    }
  ],
  keySkills: [
    "Notational Skills: Read and write music notation accurately",
    "Analytical Skills: Analyze harmonic progressions and formal structures",
    "Aural Skills: Identify intervals, chords, and progressions by ear",
    "Compositional Skills: Write simple compositions following voice-leading principles",
    "Performance Skills: Understand how theory relates to musical performance",
    "Historical Understanding: Connect theoretical concepts to musical style periods"
  ],
  studyTips: [
    "Practice sight-singing to develop aural skills",
    "Play examples at the piano to hear theoretical concepts",
    "Analyze pieces from different style periods",
    "Memorize interval and chord qualities through repetition",
    "Practice part-writing with proper voice leading",
    "Use multiple clefs and key signatures regularly",
    "Connect theory to music you know and enjoy",
    "Practice identifying non-chord tones in musical examples",
    "Study scores while listening to recordings",
    "Review circle of fifths and key relationships daily"
  ],
  commonTopics: [
    "Interval identification and construction",
    "Major and minor scale construction",
    "Triad and seventh chord identification",
    "Roman numeral harmonic analysis",
    "Cadence types and recognition",
    "Non-chord tone identification",
    "Voice leading in four parts",
    "Secondary dominant recognition",
    "Modulation analysis",
    "Binary and ternary form analysis",
    "Figured bass realization",
    "Melodic and harmonic dictation"
  ]
};

export default musicTheory;
