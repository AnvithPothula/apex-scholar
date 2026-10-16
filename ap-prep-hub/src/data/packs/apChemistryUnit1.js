/**
 * AP Chemistry Unit 1: Atomic Structure and Properties — study pack.
 *
 * Written against the AP Chemistry CED (effective Fall 2024, topics 1.1–1.8).
 * Follows its exclusion statements: no quantum numbers, no electron
 * configurations for the Aufbau exceptions (Cr, Cu), and mass spectra of
 * single elements only. Avogadro's number is 6.022 × 10²³ mol⁻¹, as on the
 * exam's equation sheet.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-chemistry/unit-1',
  subject: 'AP Chemistry',
  unit: 'Unit 1: Atomic Structure and Properties',
  examWeight: '7–9% of the exam',
  intro:
    'Chemistry counts particles you can\'t see by weighing them. This unit builds that bridge (the mole), shows how to read ' +
    'what atoms are made of from mass spectra and photoelectron spectra, and explains the periodic table\'s trends with one ' +
    'idea: Coulomb\'s law between the nucleus and its electrons.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A',
      title: 'Moles and Molar Mass',
      minutes: 6,
      summary:
        'You can\'t count particles directly, so chemists use the mole: 6.022 × 10²³ particles. The average mass of one particle in amu ' +
        'equals the molar mass in grams per mole, so n = m/M connects mass to number of particles.',
      body: String.raw`### Why the mole
In the lab you can weigh a sample, but you can't count its atoms. The **mole** links the two:
- **Avogadro's number:** $N_A = 6.022 \times 10^{23}\ \text{mol}^{-1}$ particles (atoms, molecules or formula units) per mole.
- The mass of **one** particle in **amu** equals the mass of **one mole** in **grams**: one H₂O molecule is about 18.02 amu, so one mole of water is 18.02 g.

$$\begin{aligned} n &= \frac{m}{M} \\ \text{moles} &= \frac{\text{mass}}{\text{molar mass}} \end{aligned}$$

### Dimensional analysis
Chain conversion factors so units cancel: grams → moles (÷ molar mass) → particles (× $N_A$).

${steps({
  title: 'How many molecules are in 36.0 g of water (M = 18.02 g/mol)?',
  steps: [
    { title: 'Grams to moles', body: '$n = \\dfrac{36.0\\ \\text{g}}{18.02\\ \\text{g/mol}} = 2.00$ mol' },
    { title: 'Moles to molecules', body: '$2.00\\ \\text{mol} \\times 6.022\\times10^{23}\\ \\text{mol}^{-1} = 1.20\\times10^{24}$ molecules' },
  ],
  answer: '1.20 × 10²⁴ molecules',
})}`,
      blocks: [],
      precheck: {
        question: 'How many moles are in 10.0 g of calcium (molar mass 40.08 g/mol)?',
        choices: ['0.250 mol', '4.01 mol', '401 mol', '0.0250 mol'],
        answer: 0,
        explanations: [
          'Correct. $n = m/M = 10.0/40.08 \\approx 0.250$ mol.',
          'Incorrect. That divides molar mass by mass; it should be mass ÷ molar mass.',
          'Incorrect. That multiplies the mass by the molar mass.',
          'Incorrect. Check the decimal: 10.0 ÷ 40.08 is about 0.25, not 0.025.',
        ],
      },
      checkpoints: [
        {
          question: 'A sample contains 3.011 × 10²³ atoms of carbon (molar mass 12.01 g/mol). What is its mass?',
          choices: ['6.01 g', '12.0 g', '24.0 g', '3.01 g'],
          answer: 0,
          explanations: [
            'Correct. 3.011 × 10²³ atoms is 0.500 mol, and 0.500 mol × 12.01 g/mol = 6.01 g.',
            'Incorrect. 12.0 g is a full mole, 6.022 × 10²³ atoms.',
            'Incorrect. That doubles the moles instead of halving them.',
            'Incorrect. That reuses the number 3.011 from the particle count, not a mass.',
          ],
        },
        {
          question: 'One molecule of a compound has a mass of 44.01 amu. What is the mass of 1 mole of the compound?',
          choices: ['44.01 g', '44.01 amu', '6.022 × 10²³ g', '44.01 × 6.022 × 10²³ g'],
          answer: 0,
          explanations: [
            'Correct. The average mass of one particle in amu equals the molar mass in grams.',
            'Incorrect. That is the mass of one molecule, not a mole of them.',
            'Incorrect. Avogadro\'s number is a count of particles, not a mass.',
            'Incorrect. That would be the mass of 6.022 × 10²³ moles. A molecule of 44.01 amu already means 44.01 g per mole.',
          ],
        },
      ],
      revisit:
        '$n = m/M$. One mole = 6.022 × 10²³ particles. Mass of one particle in amu = molar mass in g/mol. Grams → ÷M → moles → ×N_A → particles.',
    },
    {
      id: '1.2',
      ced: '1.2.A',
      title: 'Mass Spectra of Elements',
      minutes: 5,
      summary:
        'A mass spectrum of one element shows its isotopes (by mass) and their relative abundance (by peak height). The average atomic ' +
        'mass is the abundance-weighted average of the isotope masses.',
      body: String.raw`### Reading a mass spectrum
For a sample of **one element**, each peak is an **isotope**:
- **Position** on the x-axis: the isotope's mass.
- **Height**: its **relative abundance**.

### Average atomic mass

$$\begin{aligned} &\text{average atomic mass} \\ &\quad = \sum (\text{isotope mass}) \\ &\qquad \times (\text{fractional abundance}) \end{aligned}$$

The average lands **closest to the most abundant isotope**. That's why chlorine's 35.45 is nearer 35 than 37.

${steps({
  title: 'Chlorine is 75.76% ³⁵Cl (34.969 amu) and 24.24% ³⁷Cl (36.966 amu). Find its average atomic mass.',
  steps: [
    { title: 'Weight each isotope', body: '$0.7576 \\times 34.969 = 26.49$ and $0.2424 \\times 36.966 = 8.96$' },
    { title: 'Add', body: '$26.49 + 8.96 = 35.45$ amu' },
    { title: 'Check', body: 'It is between 35 and 37 and closer to 35, the more abundant isotope.' },
  ],
  answer: '35.45 amu',
})}

The exam only uses spectra of **single elements** with singly charged ions.`,
      blocks: [],
      precheck: {
        question: 'In the mass spectrum of a pure element, the height of each peak shows:',
        choices: ['The relative abundance of that isotope', 'The number of protons in the isotope', 'The isotope\'s ionization energy', 'The number of electrons in the isotope'],
        answer: 0,
        explanations: [
          'Correct. Taller peaks are more common isotopes; the x-position gives the mass.',
          'Incorrect. All isotopes of one element have the same number of protons.',
          'Incorrect. Ionization energies come from photoelectron spectroscopy, not mass spectra.',
          'Incorrect. Peak height is about how common an isotope is, not its electrons.',
        ],
      },
      checkpoints: [
        {
          question: 'An element has two isotopes: 80% has mass 10.0 amu and 20% has mass 11.0 amu. What is its average atomic mass?',
          choices: ['10.2 amu', '10.5 amu', '10.8 amu', '11.0 amu'],
          answer: 0,
          explanations: [
            'Correct. $0.80(10.0) + 0.20(11.0) = 8.0 + 2.2 = 10.2$ amu.',
            'Incorrect. 10.5 is the unweighted midpoint; the more abundant isotope pulls the average toward 10.',
            'Incorrect. That swaps the abundances.',
            'Incorrect. That is just the heavier isotope\'s mass.',
          ],
        },
        {
          question: 'Gallium\'s average atomic mass is 69.72 amu, and its two isotopes have masses of about 69 and 71 amu. Which is more abundant?',
          choices: ['The 69 amu isotope', 'The 71 amu isotope', 'They are equally abundant', 'It can\'t be determined without a spectrum'],
          answer: 0,
          explanations: [
            'Correct. 69.72 is closer to 69 than to 71, so the lighter isotope is more abundant.',
            'Incorrect. If the heavier isotope dominated, the average would be above 70.',
            'Incorrect. Equal abundance would give an average of exactly 70.',
            'Incorrect. The average\'s position between the two masses tells you which dominates.',
          ],
        },
      ],
      revisit:
        'Peak position = isotope mass; height = abundance. Average atomic mass = Σ(mass × fraction), closest to the most abundant isotope.',
    },
    {
      id: '1.3',
      ced: '1.3.A',
      title: 'Elemental Composition of Pure Substances',
      minutes: 6,
      summary:
        'A pure compound always has the same ratio of element masses (law of definite proportions). The empirical formula is the lowest ' +
        'whole-number ratio of atoms, found by converting mass percentages to moles.',
      body: String.raw`### Molecules and formula units
Some pure substances are made of **molecules** (H₂O, CO₂); others, like ionic compounds, are atoms or ions in fixed proportions described by a **formula unit** (NaCl).

### Law of definite proportions
Every pure sample of a compound has the **same mass ratio** of its elements. Water is always about 11.2% hydrogen and 88.8% oxygen by mass, whether it came from a glacier or a lab.

### Empirical formula
The **lowest whole-number ratio** of atoms. Glucose, C₆H₁₂O₆, has the empirical formula CH₂O.

${steps({
  title: 'A compound is 40.0% C, 6.7% H and 53.3% O by mass. Find its empirical formula.',
  steps: [
    { title: 'Assume 100 g', body: '40.0 g C, 6.7 g H, 53.3 g O' },
    { title: 'Convert to moles', body: 'C: $40.0/12.01 = 3.33$; H: $6.7/1.008 = 6.6$; O: $53.3/16.00 = 3.33$' },
    { title: 'Divide by the smallest', body: 'C: 1.00; H: 2.0; O: 1.00' },
    { title: 'Write the ratio', body: 'CH₂O' },
  ],
  answer: 'CH₂O',
})}

If dividing gives something like 1.5, multiply everything by 2 to reach whole numbers.`,
      blocks: [],
      precheck: {
        question: 'What is the empirical formula of C₆H₆ (benzene)?',
        choices: ['CH', 'C₆H₆', 'C₂H₂', 'CH₆'],
        answer: 0,
        explanations: [
          'Correct. 6:6 reduces to 1:1.',
          'Incorrect. That is the molecular formula; the empirical formula is the lowest ratio.',
          'Incorrect. 2:2 isn\'t the lowest ratio; it reduces to 1:1.',
          'Incorrect. That changes the ratio of atoms.',
        ],
      },
      checkpoints: [
        {
          question: 'A 10.0 g sample of pure water from a lake and a 50.0 g sample of pure water from a lab are analyzed. Which is true?',
          choices: [
            'Both have the same percentage of hydrogen by mass',
            'The larger sample has a higher percentage of oxygen',
            'The percentages depend on where the water came from',
            'The lab sample must contain molecules other than H₂O',
          ],
          answer: 0,
          explanations: [
            'Correct. The law of definite proportions: a pure compound always has the same mass ratio of its elements.',
            'Incorrect. Sample size changes the masses, not the percentages.',
            'Incorrect. A pure compound has a fixed composition regardless of its source.',
            'Incorrect. Both are pure water, so both are only H₂O.',
          ],
        },
        {
          question: 'A compound contains 0.50 mol of iron and 0.75 mol of oxygen. What is its empirical formula?',
          choices: ['Fe₂O₃', 'FeO', 'Fe₃O₂', 'FeO₂'],
          answer: 0,
          explanations: [
            'Correct. Dividing by 0.50 gives 1 : 1.5; multiplying by 2 gives 2 : 3.',
            'Incorrect. That would need equal moles of iron and oxygen.',
            'Incorrect. That reverses the ratio.',
            'Incorrect. That would need twice as many moles of oxygen as iron.',
          ],
        },
      ],
      revisit:
        'Definite proportions: same mass ratio in every pure sample. Empirical formula: assume 100 g → grams to moles → divide by the ' +
        'smallest → scale to whole numbers.',
    },
    {
      id: '1.4',
      ced: '1.4.A',
      title: 'Composition of Mixtures',
      minutes: 4,
      summary:
        'Pure substances contain one type of particle; mixtures contain two or more in proportions that can vary. Elemental analysis ' +
        'shows the relative numbers of atoms and can reveal whether a sample is pure.',
      body: String.raw`### Pure substance vs mixture
- **Pure substance**: atoms, molecules or formula units of **one type**, with a fixed composition.
- **Mixture**: **two or more** types whose **proportions can vary** (salt water can be a little salty or very salty).

### Using elemental analysis to check purity
Measure the mass percent of an element and compare it with the pure compound's value. If they disagree, the sample isn't pure, and the direction of the difference hints at the contaminant.

**Example:** Pure NaCl is 39.3% sodium by mass. A sample that is only 35% sodium must contain something with less sodium (or none), such as KCl or sand.`,
      blocks: [],
      precheck: {
        question: 'Which statement describes a mixture?',
        choices: [
          'Its components can be present in varying proportions',
          'It always has a fixed mass ratio of elements',
          'It contains only one type of molecule',
          'It can be described by a single empirical formula',
        ],
        answer: 0,
        explanations: [
          'Correct. A mixture\'s composition can vary from sample to sample.',
          'Incorrect. A fixed ratio describes a pure compound (definite proportions).',
          'Incorrect. One type of particle means a pure substance.',
          'Incorrect. Empirical formulas describe pure compounds.',
        ],
      },
      checkpoints: [
        {
          question: 'Pure NaCl is 39.3% sodium by mass. A white powder labeled NaCl is found to be 30.0% sodium. What is the best conclusion?',
          choices: [
            'The sample is a mixture containing a substance with a lower percentage of sodium',
            'The sample is pure NaCl, since mass percentages vary',
            'The sample contains a substance with more sodium by mass than NaCl',
            'The sample must be pure sodium',
          ],
          answer: 0,
          explanations: [
            'Correct. Something with less (or no) sodium diluted it.',
            'Incorrect. A pure compound has a fixed composition, so 30.0% means it isn\'t pure.',
            'Incorrect. A sodium-richer contaminant would raise the percentage above 39.3%.',
            'Incorrect. Pure sodium would be 100% sodium.',
          ],
        },
        {
          question: 'Elemental analysis is most useful for:',
          choices: [
            'Determining the relative numbers of atoms in a substance and checking its purity',
            'Measuring the speed of a reaction',
            'Finding the boiling point of a liquid',
            'Counting individual atoms one at a time',
          ],
          answer: 0,
          explanations: [
            'Correct. Composition by mass gives atom ratios and reveals contamination.',
            'Incorrect. That is kinetics, a later unit.',
            'Incorrect. Boiling points depend on intermolecular forces, not elemental analysis.',
            'Incorrect. Atoms can\'t be counted directly; analysis works through mass.',
          ],
        },
      ],
      revisit:
        'Pure: one type of particle, fixed composition. Mixture: two or more, variable proportions. Compare measured mass % with the pure ' +
        'value to test purity.',
    },
    {
      id: '1.5',
      ced: '1.5.A',
      title: 'Atomic Structure and Electron Configuration',
      minutes: 7,
      summary:
        'An atom has a positive nucleus of protons and neutrons and negative electrons in shells and subshells, written as a ground-state ' +
        'electron configuration using the Aufbau principle. Coulomb\'s law explains how strongly the nucleus holds each electron.',
      body: String.raw`### Coulomb's law

$$F \propto \frac{q_1 q_2}{r^2}$$

The attraction between the nucleus and an electron is **stronger** with **more nuclear charge** and **weaker** at **greater distance**. Almost every trend in this unit comes from this.

### Electron configurations (Aufbau)
Fill subshells from lowest energy up: 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p.

| Subshell | Holds |
|---|---|
| s | 2 |
| p | 6 |
| d | 10 |

**Example:** sulfur (16 electrons): 1s² 2s² 2p⁶ 3s² 3p⁴.
- **Core electrons**: inner shells (1s² 2s² 2p⁶).
- **Valence electrons**: outermost shell (3s² 3p⁴: six valence electrons).

**Ions:** add electrons for anions (S²⁻: 1s² 2s² 2p⁶ 3s² 3p⁶). For cations, remove from the highest **n** first: Fe is [Ar] 4s² 3d⁶, and Fe²⁺ is [Ar] 3d⁶ (the 4s electrons go first).

### Ionization energy, qualitatively
Electrons closer to the nucleus, or feeling more effective nuclear charge (less shielding), take **more energy** to remove.

Not on the exam: assigning quantum numbers, and the exception configurations like Cr and Cu.`,
      blocks: [],
      precheck: {
        question: 'What is the ground-state electron configuration of oxygen (8 electrons)?',
        choices: ['1s² 2s² 2p⁴', '1s² 2s² 2p⁶', '1s² 2s⁶', '1s² 2p⁶'],
        answer: 0,
        explanations: [
          'Correct. 2 + 2 + 4 = 8 electrons, filling 1s, then 2s, then 2p.',
          'Incorrect. That has 10 electrons (neon, or O²⁻).',
          'Incorrect. An s subshell holds only 2 electrons.',
          'Incorrect. 2s fills before 2p.',
        ],
      },
      checkpoints: [
        {
          question: 'Which electron configuration is correct for the Ca²⁺ ion?',
          choices: ['1s² 2s² 2p⁶ 3s² 3p⁶', '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²', '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d²', '1s² 2s² 2p⁶ 3s² 3p⁴'],
          answer: 0,
          explanations: [
            'Correct. Ca is [Ar] 4s²; losing two electrons removes the 4s², leaving the argon configuration.',
            'Incorrect. That is neutral calcium.',
            'Incorrect. A 2+ ion has fewer electrons than the atom, not more.',
            'Incorrect. That removes electrons from 3p instead of 4s, and removes too many.',
          ],
        },
        {
          question: 'Using Coulomb\'s law, why does a 1s electron in sodium require far more energy to remove than the 3s electron?',
          choices: [
            'The 1s electron is much closer to the nucleus and is not shielded by other shells',
            'The 1s electron has a larger charge',
            'The nucleus has fewer protons near the 1s orbital',
            'The 3s electron is attracted more strongly to the nucleus',
          ],
          answer: 0,
          explanations: [
            'Correct. Smaller distance and almost no shielding mean a much stronger attraction.',
            'Incorrect. All electrons have the same charge.',
            'Incorrect. The nuclear charge is the same for every electron in the atom.',
            'Incorrect. The 3s electron is farther away and shielded, so it is held more weakly.',
          ],
        },
      ],
      revisit:
        'Coulomb: more charge, stronger pull; more distance, weaker. Aufbau: 1s 2s 2p 3s 3p 4s 3d 4p; s holds 2, p 6, d 10. Cations lose ' +
        'their highest-n electrons first (4s before 3d).',
    },
    {
      id: '1.6',
      ced: '1.6.A',
      title: 'Photoelectron Spectroscopy',
      minutes: 6,
      summary:
        'Photoelectron spectroscopy (PES) measures how much energy it takes to remove electrons from each subshell. Each peak is a ' +
        'subshell; its position is the binding energy and its height is (ideally) proportional to the number of electrons in it.',
      body: String.raw`### Reading a PES spectrum
- **One peak per subshell.**
- **Position** = binding energy (energy to remove an electron from that subshell). Spectra are usually drawn with **higher energy on the left**, so 1s is the leftmost peak.
- **Height** ∝ **number of electrons** in that subshell (2 for a full s, 6 for a full p).

### What it tells you
- The **configuration**: count peaks and read heights. Peaks of heights 2, 2, 6, 2, 4 mean 1s² 2s² 2p⁶ 3s² 3p⁴, which is sulfur.
- The **nuclear attraction**: for the same subshell, an element with **more protons** shows that peak at **higher binding energy** (the 1s peak of Ne is farther left than the 1s peak of O).

Try it: move through the elements and watch new peaks appear on the right as shells fill, while the existing peaks stay.`,
      blocks: [{ type: 'sim', sim: 'pes-builder' }],
      precheck: {
        question: 'In a photoelectron spectrum, the relative height of a peak indicates:',
        choices: [
          'The number of electrons in that subshell',
          'The energy needed to remove an electron from that subshell',
          'The number of neutrons in the nucleus',
          'The mass of the atom',
        ],
        answer: 0,
        explanations: [
          'Correct. Height is proportional to how many electrons the subshell holds.',
          'Incorrect. That is shown by the peak\'s position (binding energy), not its height.',
          'Incorrect. PES measures electrons, not neutrons.',
          'Incorrect. Mass comes from mass spectrometry.',
        ],
      },
      checkpoints: [
        {
          question: 'A PES spectrum has five peaks with relative heights 2 : 2 : 6 : 2 : 1 (from highest to lowest binding energy). Which element is it?',
          choices: ['Aluminum', 'Magnesium', 'Silicon', 'Sodium'],
          answer: 0,
          explanations: [
            'Correct. 1s² 2s² 2p⁶ 3s² 3p¹ is 13 electrons: aluminum.',
            'Incorrect. Magnesium (1s² 2s² 2p⁶ 3s²) has only four peaks.',
            'Incorrect. Silicon\'s 3p peak would have height 2.',
            'Incorrect. Sodium has four peaks, the last with height 1.',
          ],
        },
        {
          question: 'Compared with the 1s peak in the PES spectrum of oxygen, the 1s peak of fluorine is:',
          choices: [
            'At a higher binding energy, because fluorine has more protons',
            'At a lower binding energy, because fluorine has more electrons',
            'At the same binding energy, because both are 1s electrons',
            'Twice as tall, because fluorine has more 1s electrons',
          ],
          answer: 0,
          explanations: [
            'Correct. One more proton pulls the 1s electrons harder (Coulomb\'s law), so they take more energy to remove.',
            'Incorrect. The extra electron is in 2p and barely shields the 1s electrons; the extra proton dominates.',
            'Incorrect. The same subshell feels a different nuclear charge in different elements.',
            'Incorrect. Both have exactly two 1s electrons, so the peaks have the same height.',
          ],
        },
      ],
      revisit:
        'PES: one peak per subshell; leftmost (highest binding energy) is 1s; height ∝ electrons. More protons shift the same subshell\'s ' +
        'peak to higher energy.',
    },
    {
      id: '1.7',
      ced: '1.7.A',
      title: 'Periodic Trends',
      minutes: 7,
      summary:
        'Ionization energy, atomic and ionic radius, electron affinity and electronegativity follow periodic trends that come from ' +
        'Coulomb\'s law, the shell model, shielding and effective nuclear charge. Use them to predict values you don\'t have.',
      body: String.raw`### The two ideas behind every trend
- **Across a period (left → right):** more protons, same shell, similar shielding → **higher effective nuclear charge** → electrons pulled in closer and held tighter.
- **Down a group:** electrons in **higher shells**, farther away and more shielded → held less tightly.

| Property | Across a period → | Down a group ↓ |
|---|---|---|
| **Atomic radius** | decreases | increases |
| **Ionization energy** | increases | decreases |
| **Electronegativity** | increases | decreases |
| **Electron affinity** (energy released on gaining an electron) | generally more energy released | generally less |

### Ionic radius
- **Cations are smaller** than their atoms (lost electrons, often a whole shell).
- **Anions are larger** than their atoms (extra electron–electron repulsion, same nuclear charge).
- For ions with the **same number of electrons** (isoelectronic: O²⁻, F⁻, Na⁺, Mg²⁺), **more protons → smaller ion**.

### Use trends to estimate
Without data, place an element between its neighbors: Ge's first ionization energy should fall between those of Si (above it) and Sn (below it).

On a free-response question, explain trends with **Coulomb's law** (charge and distance), not with "atoms want a full octet."`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Effective nuclear charge', back: 'The net positive charge a valence electron feels: nuclear charge minus shielding by core electrons. Rises across a period.' },
            { front: 'Ionization energy trend', back: 'Increases across a period, decreases down a group.' },
            { front: 'Atomic radius trend', back: 'Decreases across a period, increases down a group.' },
            { front: 'Cation vs anion size', back: 'Cations are smaller than their atoms; anions are larger.' },
            { front: 'Isoelectronic ions', back: 'Same number of electrons: the one with more protons is smaller.' },
          ],
        },
      ],
      precheck: {
        question: 'Which atom has the largest atomic radius?',
        choices: ['K', 'Na', 'Mg', 'Cl'],
        answer: 0,
        explanations: [
          'Correct. K is farthest down and to the left: its valence electron is in the 4th shell.',
          'Incorrect. Na is above K, so its valence electron is one shell closer.',
          'Incorrect. Mg is to the right of Na, with a higher effective nuclear charge.',
          'Incorrect. Cl is at the right of period 3, the smallest of these.',
        ],
      },
      checkpoints: [
        {
          question: 'Which explanation best accounts for the first ionization energy of Mg being greater than that of Na?',
          choices: [
            'Mg has one more proton, so its 3s electrons feel a greater effective nuclear charge at a similar distance',
            'Mg has more electron shells than Na',
            'Na has a full valence shell',
            'Mg electrons are farther from the nucleus',
          ],
          answer: 0,
          explanations: [
            'Correct. Same shell, more nuclear charge, little extra shielding: stronger attraction (Coulomb\'s law).',
            'Incorrect. Both have electrons in three shells.',
            'Incorrect. Na has one valence electron; it doesn\'t have a full shell.',
            'Incorrect. Mg\'s 3s electrons are slightly closer, not farther.',
          ],
        },
        {
          question: 'Arrange the isoelectronic species O²⁻, F⁻ and Na⁺ from largest to smallest.',
          choices: ['O²⁻ > F⁻ > Na⁺', 'Na⁺ > F⁻ > O²⁻', 'F⁻ > O²⁻ > Na⁺', 'They are the same size'],
          answer: 0,
          explanations: [
            'Correct. All have 10 electrons; Na⁺ has the most protons (11) and pulls them closest, O²⁻ the fewest (8).',
            'Incorrect. That reverses the trend: more protons make a smaller ion.',
            'Incorrect. O²⁻ has fewer protons than F⁻, so it is larger.',
            'Incorrect. Same electrons, but different nuclear charges give different sizes.',
          ],
        },
        {
          question: 'Which element is the most electronegative?',
          choices: ['F', 'O', 'Cl', 'N'],
          answer: 0,
          explanations: [
            'Correct. Fluorine is at the top right (excluding noble gases), so it attracts bonding electrons most strongly.',
            'Incorrect. O is to the left of F.',
            'Incorrect. Cl is below F, with electrons farther from the nucleus.',
            'Incorrect. N is two places left of F.',
          ],
        },
      ],
      revisit:
        'Across: higher effective nuclear charge → smaller radius, higher IE and electronegativity. Down: more shells → bigger, lower IE. ' +
        'Cations smaller, anions larger; isoelectronic: more protons = smaller. Explain with Coulomb\'s law.',
    },
    {
      id: '1.8',
      ced: '1.8.A',
      title: 'Valence Electrons and Ionic Compounds',
      minutes: 4,
      summary:
        'Whether two elements bond depends on their valence electrons and nuclei. Elements in the same group form analogous compounds, ' +
        'and an element\'s typical ionic charge is predicted by its valence electrons and place on the periodic table.',
      body: String.raw`### Valence electrons decide reactivity
The likelihood two elements form a bond depends on how their **valence electrons** interact with the **nuclei**. Metals with few valence electrons and low ionization energies lose them; nonmetals with high electron affinity gain them.

### Same group, analogous compounds
Elements in a column have the same number of valence electrons, so they form **analogous compounds**: NaCl, KCl and LiCl; MgO, CaO and SrO.

### Predicting ionic charges
| Group | Valence electrons | Typical ion |
|---|---|---|
| 1 | 1 | +1 (Na⁺) |
| 2 | 2 | +2 (Mg²⁺) |
| 13 | 3 | +3 (Al³⁺) |
| 15 | 5 | −3 (N³⁻) |
| 16 | 6 | −2 (O²⁻) |
| 17 | 7 | −1 (Cl⁻) |

Combine ions so the charges cancel: Al³⁺ and O²⁻ → Al₂O₃.`,
      blocks: [],
      precheck: {
        question: 'Potassium forms KCl with chlorine. Which formula is most likely for the compound of rubidium and bromine?',
        choices: ['RbBr', 'RbBr₂', 'Rb₂Br', 'Rb₂Br₃'],
        answer: 0,
        explanations: [
          'Correct. Rb is in K\'s group and Br in Cl\'s, so they form the analogous 1:1 compound.',
          'Incorrect. That would need Rb²⁺, but group 1 forms +1 ions.',
          'Incorrect. That would need Br²⁻, but group 17 forms −1 ions.',
          'Incorrect. Neither element takes charges that give this ratio.',
        ],
      },
      checkpoints: [
        {
          question: 'What is the formula of the ionic compound formed by calcium and nitrogen?',
          choices: ['Ca₃N₂', 'CaN', 'Ca₂N₃', 'CaN₂'],
          answer: 0,
          explanations: [
            'Correct. Ca²⁺ and N³⁻: three Ca²⁺ (+6) balance two N³⁻ (−6).',
            'Incorrect. +2 and −3 don\'t cancel one-to-one.',
            'Incorrect. That gives +4 and −9.',
            'Incorrect. That gives +2 and −6.',
          ],
        },
        {
          question: 'Why do elements in the same group form compounds with similar formulas?',
          choices: [
            'They have the same number of valence electrons',
            'They have the same atomic radius',
            'They have the same number of protons',
            'They have the same molar mass',
          ],
          answer: 0,
          explanations: [
            'Correct. Equal valence electrons lead to the same typical ionic charge and bonding pattern.',
            'Incorrect. Radius increases down a group.',
            'Incorrect. Each element has a different number of protons.',
            'Incorrect. Molar mass increases down a group.',
          ],
        },
      ],
      revisit:
        'Valence electrons drive bonding. Same group → analogous compounds. Typical charges: group 1 +1, 2 +2, 13 +3, 15 −3, 16 −2, 17 −1; ' +
        'balance charges to write formulas.',
    },
  ],
};

export default pack;
