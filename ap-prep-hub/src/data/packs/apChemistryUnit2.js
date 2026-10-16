/**
 * AP Chemistry Unit 2: Compound Structure and Properties — study pack.
 *
 * Written against the AP Chemistry CED (effective Fall 2024, topics 2.1–2.7).
 * Follows its exclusion statements: no specific crystal structures, no
 * derivation or drawing of hybrid orbitals, no d-orbital hybridization (shape
 * only for more than four electron domains), no molecular orbital diagrams.
 * The VSEPR simulation is an Apex component modeled on the VSEPR geometry
 * builder MicroSim in Dan McCreary's "Chemistry" (CC BY-NC-SA 4.0); see
 * `credits`. Bond lengths and energies are typical textbook averages.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-chemistry/unit-2',
  subject: 'AP Chemistry',
  unit: 'Unit 2: Compound Structure and Properties',
  examWeight: '7–9% of the exam',
  intro:
    'Why does salt shatter while copper bends? Why is water bent and carbon dioxide straight? This unit connects how atoms ' +
    'bond (ionic, covalent, metallic) to the structures they form, then uses Lewis diagrams and VSEPR to predict a molecule\'s ' +
    'shape, bond angles and polarity.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Chemistry',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/chemistry/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'The VSEPR simulation is rebuilt from its VSEPR geometry builder MicroSim.',
    },
  ],
  sections: [
    {
      id: '2.1',
      ced: '2.1.A',
      title: 'Types of Chemical Bonds',
      minutes: 8,
      summary:
        'Electronegativity rises across a period and falls down a group. Atoms with similar electronegativity share electrons ' +
        'equally (nonpolar covalent); unequal sharing makes a polar covalent bond, and ionic and covalent bonding form a ' +
        'continuum. Metal–nonmetal bonds are usually ionic, nonmetal–nonmetal bonds covalent, and metals share a sea of electrons.',
      body: String.raw`### Electronegativity
**Electronegativity** is how strongly an atom attracts shared electrons. It **increases left to right** across a period and **decreases down** a group, for the same Coulomb's-law reasons as Unit 1's trends: more protons pulling on the same shell, or valence electrons farther away and more shielded.

### A continuum of bonds
| Bond | Electrons | Example |
|---|---|---|
| **Nonpolar covalent** | Shared equally (similar electronegativity) | Cl–Cl; C–H is effectively nonpolar |
| **Polar covalent** | Shared unequally; the more electronegative atom gets a partial negative charge $\delta^-$ | H–Cl, O–H |
| **Ionic** | Transferred, making cations and anions | Na⁺Cl⁻, Mg²⁺O²⁻ |
| **Metallic** | Valence electrons delocalized over all the metal atoms | Cu, Fe |

- Bigger electronegativity differences make bigger **bond dipoles**.
- Every polar bond has some ionic character: ionic and covalent are ends of a **continuum**, not separate boxes.
- Rule of thumb: **metal + nonmetal → ionic**, **two nonmetals → covalent**. But the best evidence of bond type is the compound's **properties** (melting point, conductivity, brittleness).

Sort the bonds below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'What kind of bonding?',
            buckets: ['Ionic', 'Polar covalent', 'Nonpolar covalent', 'Metallic'],
            items: [
              { label: 'Sodium chloride, NaCl', bucket: 0, why: 'A metal and a nonmetal: electrons transfer to make Na⁺ and Cl⁻.' },
              { label: 'Magnesium oxide, MgO', bucket: 0, why: 'Metal + nonmetal, with 2+ and 2− ions.' },
              { label: 'The H–Cl bond', bucket: 1, why: 'Chlorine is much more electronegative, so it pulls the shared electrons toward itself.' },
              { label: 'An O–H bond in water', bucket: 1, why: 'Oxygen is far more electronegative than hydrogen.' },
              { label: 'The Cl–Cl bond', bucket: 2, why: 'Identical atoms share electrons equally.' },
              { label: 'A C–H bond in methane', bucket: 2, why: 'Carbon is only slightly more electronegative, so the CED treats it as effectively nonpolar.' },
              { label: 'Copper wire', bucket: 3, why: 'Copper atoms share delocalized valence electrons.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which bond is the most polar?',
        choices: ['H–F', 'H–Cl', 'H–Br', 'H–I'],
        answer: 0,
        explanations: [
          'Correct. Fluorine is the most electronegative element, so H–F has the largest electronegativity difference.',
          'Incorrect. Chlorine is less electronegative than fluorine.',
          'Incorrect. Electronegativity falls down the group, so H–Br is less polar.',
          'Incorrect. Iodine is the least electronegative of the four halogens here.',
        ],
      },
      checkpoints: [
        {
          question: 'In a polar O–H bond, where is the partial negative charge?',
          choices: [
            'On the oxygen atom, which is more electronegative',
            'On the hydrogen atom, which is smaller',
            'Shared equally between the atoms',
            'There is no partial charge in a covalent bond',
          ],
          answer: 0,
          explanations: [
            'Correct. The more electronegative atom pulls the shared electrons closer and becomes δ⁻.',
            'Incorrect. Size doesn\'t decide it; electronegativity does.',
            'Incorrect. Unequal sharing is what makes the bond polar.',
            'Incorrect. Polar covalent bonds have partial charges.',
          ],
        },
        {
          question: 'A solid melts at 801 °C, doesn\'t conduct electricity as a solid, and conducts when melted. What kind of bonding does it most likely have?',
          choices: ['Ionic', 'Metallic', 'Nonpolar covalent molecules', 'Polar covalent molecules'],
          answer: 0,
          explanations: [
            'Correct. High melting point and conduction only when ions are free to move are signs of an ionic solid (this is NaCl).',
            'Incorrect. Metals conduct as solids too.',
            'Incorrect. Molecular solids have low melting points and don\'t conduct when melted.',
            'Incorrect. Molecular solids have low melting points and don\'t conduct when melted.',
          ],
        },
      ],
      revisit:
        'Electronegativity: up across a period, down a group. Nonpolar (equal sharing, C–H effectively) → polar (unequal, δ⁻ on ' +
        'the more electronegative atom) → ionic is a continuum. Metal + nonmetal ionic; nonmetals covalent; metals delocalized.',
    },
    {
      id: '2.2',
      ced: '2.2.A',
      title: 'Intramolecular Force and Potential Energy',
      minutes: 8,
      summary:
        'A potential energy vs. internuclear distance graph shows the bond length (the distance at the energy minimum) and the ' +
        'bond energy (the depth of the well). Higher bond order means shorter, stronger bonds. Coulomb\'s law ranks ionic ' +
        'attractions: bigger charges and smaller ions attract more strongly.',
      body: String.raw`### Reading the potential energy curve
As two atoms approach, attraction lowers the energy. Too close, and the nuclei repel, so energy shoots up. The minimum is the bond.
- **Bond length**: the distance where potential energy is **lowest**.
- **Bond energy**: how deep the well is, the energy needed to pull the atoms apart.

${graph({
  title: 'Potential energy vs. internuclear distance',
  x: [50, 350], y: [-1000, 800], xLabel: 'distance (pm)', yLabel: 'energy (kJ/mol)',
  curves: [{ expr: 'D * ((r0 / x)^12 - 2 * (r0 / x)^6)', label: 'E (kJ/mol)' }],
  params: {
    D: { min: 150, max: 900, value: 430, step: 10, label: 'bond energy D (kJ/mol)' },
    r0: { min: 70, max: 200, value: 75, step: 5, label: 'bond length r₀ (pm)' },
  },
})}

The horizontal axis is distance in picometers. The well's lowest point sits at $r_0$ with energy $-D$. (The curve's exact shape is a model; what the exam asks about is the minimum and its depth.) The starting values are close to H₂: about 74 pm and 436 kJ/mol.

### Bond order
| Bond | Order | Typical length | Typical energy |
|---|---|---|---|
| C–C | 1 | about 154 pm | about 347 kJ/mol |
| C=C | 2 | about 134 pm | about 614 kJ/mol |
| C≡C | 3 | about 120 pm | about 839 kJ/mol |

**Higher order → shorter and stronger.** Bond length also depends on atom size: bonds to bigger atoms are longer.

### Coulomb's law for ions

$$F \propto \frac{q_1 q_2}{r^2}$$

- **Larger charges** → stronger attraction: MgO (2+, 2−) melts near 2,850 °C; NaCl (1+, 1−) melts at 801 °C.
- **Smaller ions** (shorter distance between nuclei) → stronger attraction: NaF melts higher than NaCl because F⁻ is smaller than Cl⁻.`,
      blocks: [],
      precheck: {
        question: 'On a graph of potential energy vs. internuclear distance, what does the distance at the lowest point represent?',
        choices: ['The bond length', 'The bond energy', 'The atomic radius of each atom', 'The distance where the atoms repel most'],
        answer: 0,
        explanations: [
          'Correct. Atoms settle where the energy is lowest; that separation is the bond length.',
          'Incorrect. Bond energy is the depth of the minimum, read on the energy axis.',
          'Incorrect. The bond length involves both atoms, not one radius.',
          'Incorrect. Repulsion dominates at distances shorter than the minimum.',
        ],
      },
      checkpoints: [
        {
          question: 'Which bond is shortest and strongest?',
          choices: ['N≡N', 'N=N', 'N–N', 'They are all the same'],
          answer: 0,
          explanations: [
            'Correct. A triple bond has the highest bond order, so it is shortest and strongest.',
            'Incorrect. A double bond has a lower order than a triple bond.',
            'Incorrect. A single bond is the longest and weakest of the three.',
            'Incorrect. Bond order changes both length and strength.',
          ],
        },
        {
          question: 'Which compound has the strongest attraction between its ions?',
          choices: ['MgO', 'NaCl', 'KCl', 'NaBr'],
          answer: 0,
          explanations: [
            'Correct. Mg²⁺ and O²⁻ have double charges and are small, giving the largest Coulombic attraction.',
            'Incorrect. Its ions carry only single charges.',
            'Incorrect. Single charges, and K⁺ is larger than Na⁺.',
            'Incorrect. Single charges, and Br⁻ is larger than Cl⁻.',
          ],
        },
      ],
      revisit:
        'PE curve: bond length at the minimum, bond energy = depth. Higher bond order → shorter, stronger. Coulomb: larger ' +
        'charges and smaller ions → stronger ionic attraction (MgO > NaCl).',
    },
    {
      id: '2.3',
      ced: '2.3.A',
      title: 'Structure of Ionic Solids',
      minutes: 5,
      summary:
        'An ionic solid is a repeating 3-D array of cations and anions arranged to maximize attractions and minimize repulsions. ' +
        'That structure explains why ionic solids are hard, brittle and conduct only when melted or dissolved.',
      body: String.raw`### The particulate model
Cations and anions alternate in a **systematic, repeating 3-D array**. Each ion is surrounded by ions of the **opposite** charge, which **maximizes attraction** and keeps like charges apart to **minimize repulsion**.

### Properties that follow
| Property | Why |
|---|---|
| **High melting point** | Many strong Coulombic attractions must be overcome |
| **Brittle** | A blow shifts one layer so like charges line up; they repel and the crystal cracks |
| **Doesn't conduct as a solid** | Ions are locked in place |
| **Conducts when melted or dissolved** | Ions are free to move and carry charge |

When you draw a particle diagram, alternate the ions and draw the **cations smaller** than the anions when that matches the real sizes (Na⁺ is smaller than Cl⁻). You don't need to know specific crystal structures.`,
      blocks: [],
      precheck: {
        question: 'Why does an ionic crystal shatter when struck?',
        choices: [
          'Shifting a layer lines up ions of the same charge, which repel each other',
          'The sea of electrons flows out of the crystal',
          'Covalent bonds inside each ion break',
          'The crystal contains no attractive forces',
        ],
        answer: 0,
        explanations: [
          'Correct. Like charges forced next to each other push the layers apart.',
          'Incorrect. That describes metals, and metals bend instead of shattering.',
          'Incorrect. Simple ions like Na⁺ and Cl⁻ don\'t contain covalent bonds.',
          'Incorrect. Strong attractions are what make the crystal hard in the first place.',
        ],
      },
      checkpoints: [
        {
          question: 'Solid KBr doesn\'t conduct electricity, but KBr dissolved in water does. Why?',
          choices: [
            'Dissolving frees the ions to move and carry charge',
            'Water molecules carry the electric current',
            'Dissolving turns the ions into neutral atoms',
            'Solid KBr has no ions',
          ],
          answer: 0,
          explanations: [
            'Correct. In the solid the ions are fixed in the lattice; in solution they can move.',
            'Incorrect. Pure water is a very poor conductor; the free ions carry the current.',
            'Incorrect. The ions stay ions in solution.',
            'Incorrect. Solid KBr is made of K⁺ and Br⁻ ions; they just can\'t move.',
          ],
        },
        {
          question: 'Which feature of a particle diagram of solid NaCl is most important to get right?',
          choices: [
            'Each ion is surrounded by ions of the opposite charge',
            'All ions are drawn the same size',
            'The ions are scattered randomly',
            'Pairs of Na and Cl atoms are drawn as separate molecules',
          ],
          answer: 0,
          explanations: [
            'Correct. Alternating charges maximize attraction and minimize repulsion.',
            'Incorrect. Na⁺ is smaller than Cl⁻, so they shouldn\'t look the same.',
            'Incorrect. Ionic solids are ordered, repeating arrays.',
            'Incorrect. Ionic solids don\'t contain discrete molecules.',
          ],
        },
      ],
      revisit:
        'Ionic solid: repeating 3-D array, each ion surrounded by opposite charges. High melting point, brittle (like charges ' +
        'line up), conducts only when melted or dissolved.',
    },
    {
      id: '2.4',
      ced: '2.4.A',
      title: 'Structure of Metals and Alloys',
      minutes: 5,
      summary:
        'A metal is a lattice of positive ions in a sea of delocalized electrons, which explains conductivity and malleability. ' +
        'Interstitial alloys put small atoms in the gaps between large ones (steel); substitutional alloys swap in atoms of similar size (brass).',
      body: String.raw`### Sea of electrons
Metallic bonding: an array of **positive metal ions** surrounded by **delocalized valence electrons**.
- **Conducts** electricity and heat: the electrons are free to move.
- **Malleable and ductile**: layers of ions can slide past each other while the electron sea keeps holding them together.

### Alloys
- **Interstitial alloy**: atoms of **very different** sizes. Small atoms fill the **gaps** between large ones, as carbon does in iron to make **steel**. The small atoms block layers from sliding, so the alloy is **harder, stronger and less malleable**.
- **Substitutional alloy**: atoms of **similar** size. One atom **replaces** another in the lattice, as zinc replaces some copper in **brass**. The lattice stays similar, so the alloy stays fairly malleable while other properties change.`,
      blocks: [],
      precheck: {
        question: 'Why can metals be hammered into sheets without shattering?',
        choices: [
          'Layers of metal ions slide past each other while the delocalized electrons keep holding them together',
          'Metals contain no attractive forces',
          'Metal atoms share electrons in fixed pairs between neighbors',
          'Like charges in metals attract each other',
        ],
        answer: 0,
        explanations: [
          'Correct. The electron sea isn\'t tied to particular atoms, so bonding survives when layers shift.',
          'Incorrect. Metallic bonding is a strong attraction.',
          'Incorrect. That describes localized covalent bonds.',
          'Incorrect. Like charges repel; the electron sea holds the positive ions together.',
        ],
      },
      checkpoints: [
        {
          question: 'Carbon atoms are much smaller than iron atoms. What kind of alloy is steel, and how does carbon change iron?',
          choices: [
            'Interstitial; carbon fills gaps and makes the metal harder and less malleable',
            'Substitutional; carbon replaces iron and makes it softer',
            'Interstitial; carbon makes the metal more malleable',
            'Substitutional; carbon has no effect on hardness',
          ],
          answer: 0,
          explanations: [
            'Correct. Small atoms in the gaps block layers from sliding.',
            'Incorrect. Substitution needs atoms of similar size.',
            'Incorrect. Interstitial atoms make the metal less malleable.',
            'Incorrect. Steel is an interstitial alloy, and it is harder than iron.',
          ],
        },
        {
          question: 'Zinc and copper atoms have similar radii. Brass is best described as',
          choices: ['a substitutional alloy', 'an interstitial alloy', 'an ionic compound', 'a covalent network solid'],
          answer: 0,
          explanations: [
            'Correct. Atoms of similar size substitute for each other in the lattice.',
            'Incorrect. Interstitial alloys need very different atom sizes.',
            'Incorrect. Brass is a mixture of metals, held together by metallic bonding.',
            'Incorrect. Brass has metallic, not covalent network, bonding.',
          ],
        },
      ],
      revisit:
        'Metallic bonding: positive ions in a sea of delocalized electrons → conductive, malleable. Interstitial alloy: small ' +
        'atoms in gaps (steel), harder. Substitutional alloy: similar-size swap (brass).',
    },
    {
      id: '2.5',
      ced: '2.5.A',
      title: 'Lewis Diagrams',
      minutes: 8,
      summary:
        'A Lewis diagram shows how valence electrons are arranged in a molecule: shared pairs as bonds and unshared pairs as ' +
        'lone pairs. Count valence electrons, connect the atoms, complete octets on outer atoms, and use multiple bonds when the ' +
        'central atom falls short.',
      body: String.raw`### The procedure
1. **Count valence electrons** for every atom. Add one per negative charge; subtract one per positive charge.
2. **Build a skeleton.** The least electronegative atom is usually central. Hydrogen is never central.
3. **Connect** atoms with single bonds (2 electrons each).
4. **Complete octets on the outer atoms** with lone pairs (hydrogen gets only 2 electrons).
5. Put any **leftover electrons on the central atom**.
6. If the central atom has fewer than 8, **move lone pairs into double or triple bonds**.

${steps({
  title: 'Draw the Lewis diagram for CO₂.',
  steps: [
    { title: 'Count', body: 'C has 4, each O has 6: $4 + 2(6) = 16$ valence electrons' },
    { title: 'Skeleton and single bonds', body: 'O–C–O uses 4 electrons, leaving 12' },
    { title: 'Complete the outer octets', body: 'Six on each O uses all 12. Now C has only 4 electrons around it.' },
    { title: 'Make double bonds', body: 'Move one lone pair from each O into a bond: **O=C=O**, each O with 2 lone pairs. Every atom has an octet.' },
  ],
  answer: 'O=C=O, two lone pairs on each oxygen',
})}

### Exceptions to know
- **Incomplete octets**: boron in BF₃ has only 6 electrons.
- **Expanded octets**: atoms in period 3 and below (S, P, Xe) can hold more than 8, as in SF₆.
- **Odd numbers of electrons** (NO has 11): no structure can give every atom an octet. That is a limit of the Lewis model.`,
      blocks: [],
      precheck: {
        question: 'How many valence electrons does a Lewis diagram of NH₃ show?',
        choices: ['8', '10', '6', '4'],
        answer: 0,
        explanations: [
          'Correct. N has 5 and each H has 1: 5 + 3 = 8.',
          'Incorrect. That counts N\'s 7 total electrons, not its 5 valence electrons.',
          'Incorrect. That leaves out N\'s lone pair.',
          'Incorrect. That counts only one electron per atom.',
        ],
      },
      checkpoints: [
        {
          question: 'How many lone pairs are on the central atom in the Lewis diagram of H₂O?',
          choices: ['2', '0', '1', '4'],
          answer: 0,
          explanations: [
            'Correct. O has 6 valence electrons: 2 are used in bonds with H, leaving 4 as two lone pairs.',
            'Incorrect. Oxygen keeps 4 nonbonding electrons.',
            'Incorrect. That leaves oxygen with only 6 electrons around it.',
            'Incorrect. Four pairs would be 8 nonbonding electrons, too many.',
          ],
        },
        {
          question: 'Which molecule cannot have an octet on every atom in any Lewis diagram?',
          choices: ['NO', 'CH₄', 'N₂', 'HCl'],
          answer: 0,
          explanations: [
            'Correct. NO has 11 valence electrons, an odd number, so one electron is always unpaired.',
            'Incorrect. Carbon gets an octet and each H gets two.',
            'Incorrect. A triple bond gives each N an octet.',
            'Incorrect. Cl gets an octet and H gets two.',
          ],
        },
      ],
      revisit:
        'Count valence electrons (± charge), skeleton (least electronegative central, never H), single bonds, outer octets, ' +
        'leftovers on center, multiple bonds if short. Exceptions: BF₃ (6), SF₆ (expanded), odd-electron molecules like NO.',
    },
    {
      id: '2.6',
      ced: '2.6.A',
      title: 'Resonance and Formal Charge',
      minutes: 8,
      summary:
        'When several equivalent Lewis diagrams can be drawn, the real molecule is a resonance hybrid of them, with bond orders ' +
        'and lengths in between. When the diagrams aren\'t equivalent, the one with formal charges closest to zero (and any ' +
        'negative charge on the most electronegative atom) is the best model.',
      body: String.raw`### Resonance
Nitrate, NO₃⁻, can be drawn with the double bond on any of its three oxygens. None of those drawings is right alone: the real ion is the **average** (resonance hybrid).
- All three N–O bonds are **identical**: same length, same strength.
- Each has a bond order of $\tfrac{4}{3} \approx 1.33$ (4 bonding pairs shared over 3 bonds).
- So the bonds are shorter than an N–O single bond and longer than an N=O double bond.

Resonance is needed to predict structure correctly. Ozone (O₃) and carbonate (CO₃²⁻) are other classic examples.

### Formal charge

$$\begin{aligned} \text{FC} = {} &(\text{valence } e^-) - (\text{nonbonding } e^-) \\ &- \tfrac{1}{2}(\text{bonding } e^-) \end{aligned}$$

To choose among **nonequivalent** diagrams, prefer the one where:
1. formal charges are **as close to zero** as possible;
2. any negative formal charge sits on the **more electronegative** atom.

${steps({
  title: 'Which is better for CO₂: O=C=O or O≡C–O?',
  steps: [
    { title: 'O=C=O', body: 'Each O: $6 - 4 - 2 = 0$. C: $4 - 0 - 4 = 0$. All zero.' },
    { title: 'O≡C–O', body: 'Triple-bonded O: $6 - 2 - 3 = +1$. C: $4 - 0 - 4 = 0$. Single-bonded O: $6 - 6 - 1 = -1$.' },
    { title: 'Compare', body: 'O=C=O has all formal charges zero, so it is the better model.' },
  ],
  answer: 'O=C=O',
})}

### Limits of the model
Lewis diagrams can't fully describe odd-electron molecules, and resonance shows that one drawing isn't always enough.`,
      blocks: [],
      precheck: {
        question: 'What is the formal charge on nitrogen in the ammonium ion, NH₄⁺?',
        choices: ['+1', '0', '−1', '+4'],
        answer: 0,
        explanations: [
          'Correct. FC = 5 − 0 − ½(8) = +1.',
          'Incorrect. Nitrogen has 4 bonds and no lone pairs, one more bond than in neutral NH₃.',
          'Incorrect. Nitrogen has given up its lone pair to a fourth bond.',
          'Incorrect. Formal charge counts half the bonding electrons, not each bond as a charge.',
        ],
      },
      checkpoints: [
        {
          question: 'How do the three N–O bonds in the nitrate ion compare?',
          choices: [
            'All three are the same length, between a single and a double bond',
            'One is a short double bond and two are long single bonds',
            'They switch rapidly between single and double bonds',
            'All three are double bonds',
          ],
          answer: 0,
          explanations: [
            'Correct. The resonance hybrid has three identical bonds with bond order 4/3.',
            'Incorrect. That describes a single resonance drawing, not the real ion.',
            'Incorrect. Resonance doesn\'t mean flipping; the hybrid is one real structure.',
            'Incorrect. Three double bonds would give nitrogen 12 electrons.',
          ],
        },
        {
          question: 'Two valid Lewis diagrams for a molecule differ only in formal charges. Which should be chosen?',
          choices: [
            'The one with formal charges closest to zero, with any negative charge on the more electronegative atom',
            'The one with the most double bonds',
            'The one with the largest formal charges',
            'The one with negative charge on the least electronegative atom',
          ],
          answer: 0,
          explanations: [
            'Correct. Those are the formal-charge criteria in the CED.',
            'Incorrect. Counting double bonds isn\'t the criterion.',
            'Incorrect. Large formal charges make a structure less likely.',
            'Incorrect. Negative charge belongs on the more electronegative atom.',
          ],
        },
      ],
      revisit:
        'Equivalent diagrams → resonance hybrid with averaged bonds (nitrate: bond order 4/3). FC = valence − nonbonding − ½ ' +
        'bonding. Best structure: formal charges near zero, negative on the more electronegative atom.',
    },
    {
      id: '2.7',
      ced: '2.7.A',
      title: 'VSEPR and Hybridization',
      minutes: 10,
      summary:
        'Electron domains around a central atom repel each other and spread as far apart as possible. Counting domains and ' +
        'lone pairs gives the shape, bond angles and polarity. sp, sp² and sp³ atoms have ideal angles of 180°, 120° and 109.5°. ' +
        'Multiple bonds contain sigma and pi bonds, and pi bonds block rotation.',
      body: String.raw`### VSEPR
**Valence shell electron pair repulsion**: electron domains (bonds or lone pairs) around a central atom repel each other through Coulombic repulsion, so they spread out as far as possible.
- A single, double or triple bond each counts as **one** domain.
- **Electron geometry** includes lone pairs; **molecular shape** describes only the atoms.
- Lone pairs repel more than bonding pairs, so they **squeeze** bond angles: CH₄ 109.5°, NH₃ about 107°, H₂O about 104.5°.

Use the explorer to see every shape the exam names.

### Polarity of the whole molecule
A molecule has a **dipole moment** if its bond dipoles don't cancel. CO₂ has polar bonds but is **nonpolar** (linear and symmetric). H₂O is **polar** (bent).

### Hybridization
| Electron domains | Hybridization | Ideal angle |
|---|---|---|
| 2 | sp | 180° |
| 3 | sp² | 120° |
| 4 | sp³ | 109.5° |

For 5 or 6 domains you only need the shape; d-orbital hybridization isn't tested.

### Sigma and pi bonds
| Bond | Contains |
|---|---|
| Single | 1 σ |
| Double | 1 σ + 1 π |
| Triple | 1 σ + 2 π |

- Sigma overlap is stronger, so σ bonds have greater bond energy than π bonds.
- A π bond **prevents rotation** around the bond, which is why molecules with C=C can have **geometric (cis/trans) isomers**.`,
      blocks: [{ type: 'sim', sim: 'vsepr-explorer' }],
      precheck: {
        question: 'What is the molecular shape of NH₃?',
        choices: ['Trigonal pyramidal', 'Trigonal planar', 'Tetrahedral', 'Bent'],
        answer: 0,
        explanations: [
          'Correct. Four electron domains (three bonds, one lone pair) give a trigonal pyramid.',
          'Incorrect. Trigonal planar needs three domains and no lone pairs, like BF₃.',
          'Incorrect. The electron geometry is tetrahedral, but the shape describes only the atoms.',
          'Incorrect. Bent would need two lone pairs, like H₂O.',
        ],
      },
      checkpoints: [
        {
          question: 'How many sigma and pi bonds are in ethene, H₂C=CH₂?',
          choices: ['5 σ and 1 π', '6 σ and 0 π', '4 σ and 2 π', '5 σ and 2 π'],
          answer: 0,
          explanations: [
            'Correct. Four C–H single bonds plus the σ part of C=C make 5 σ; the double bond adds 1 π.',
            'Incorrect. The double bond contains a π bond.',
            'Incorrect. A double bond has only one π bond, and the C–H bonds are σ.',
            'Incorrect. A double bond has one π bond, not two.',
          ],
        },
        {
          question: 'CO₂ has two polar C=O bonds. Why is the molecule nonpolar?',
          choices: [
            'It is linear, so the two bond dipoles point in opposite directions and cancel',
            'Carbon and oxygen have the same electronegativity',
            'Double bonds are never polar',
            'It has lone pairs on the carbon atom',
          ],
          answer: 0,
          explanations: [
            'Correct. Symmetric geometry cancels equal and opposite bond dipoles.',
            'Incorrect. Oxygen is more electronegative, so each bond is polar.',
            'Incorrect. Polarity depends on electronegativity, not bond order.',
            'Incorrect. Carbon in CO₂ has no lone pairs.',
          ],
        },
      ],
      revisit:
        'VSEPR: domains spread out; lone pairs squeeze angles. Polarity needs uncanceled bond dipoles (CO₂ nonpolar, H₂O polar). ' +
        'sp 180°, sp² 120°, sp³ 109.5°. Single = σ; double = σ + π; triple = σ + 2π; π blocks rotation (cis/trans).',
    },
  ],
};

export default pack;
