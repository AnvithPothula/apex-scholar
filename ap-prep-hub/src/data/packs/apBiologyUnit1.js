/**
 * AP Biology Unit 1: Chemistry of Life — study pack.
 *
 * Written against the AP Biology CED (2025, Course Framework V.1, topics 1.1–1.7)
 * and checked by hand: every learning objective and essential-knowledge
 * statement is covered, nothing excluded by the CED's exclusion statements is
 * tested (molecular structures of specific carbohydrate polymers, nucleotides
 * and amino acids). Answer keys are reasoned out in the explanations, and the
 * numeric ones were recomputed.
 *
 * Shape (validated by utils/studyPack.validatePack, run in tests):
 *   sections[]: { id, ced, title, minutes, summary, body, blocks[], precheck, checkpoints[], revisit }
 *   blocks: { type: 'flashcards', cards: [{front, back}] } | { type: 'sim', sim: '<id>' }
 *   questions: { question, choices[4], answer (0-3), explanations[4] }
 *     explanations[answer] starts "Correct"; the others start "Incorrect".
 *
 * `body` is markdown rendered by MarkdownRenderer, so ```apex-steps blocks are
 * live step-by-step widgets.
 *
 * Import-free so scripts/prerender.mjs can load it for the crawler copy.
 */

const steps = (spec) => '```apex-steps\n' + JSON.stringify(spec) + '\n```';

const pack = {
  slug: 'ap-biology/unit-1',
  subject: 'AP Biology',
  unit: 'Unit 1: Chemistry of Life',
  examWeight: '8–11% of the multiple-choice section',
  intro:
    'Everything in AP Biology is built from a handful of elements arranged into four kinds of large molecules, ' +
    'held together and shaped by the chemistry of water. This unit is short on the exam but everything later leans on it.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A',
      title: 'Structure of Water and Hydrogen Bonding',
      minutes: 5,
      summary:
        'Water is polar: oxygen pulls the shared electrons harder than hydrogen does, so the oxygen end is partly negative and each ' +
        'hydrogen partly positive. Neighbouring water molecules attract through hydrogen bonds, and those bonds explain cohesion, ' +
        'adhesion, surface tension, high specific heat and high heat of vaporization.',
      body: `### Why water is polar
The O–H bonds in water are **polar covalent**: oxygen is more electronegative than hydrogen, so the shared electrons spend more time near the oxygen. The oxygen carries a partial negative charge (δ−) and each hydrogen a partial positive charge (δ+). Because the molecule is bent, those charges don't cancel out, so the whole molecule is polar.

### Hydrogen bonds
A **hydrogen bond** is the attraction between a δ+ hydrogen on one molecule and a δ− atom (usually O or N) on another molecule or another part of the same large molecule. Each one is weak and is *not* a covalent bond, but there are enormous numbers of them. They also matter inside biological molecules: they hold the two strands of DNA together and fold proteins into helices and sheets.

### The properties that follow
| Property | What causes it | Why it matters to living things |
|---|---|---|
| **Cohesion** | Water molecules hydrogen-bond to each other | Water moves up a plant's xylem as one continuous column |
| **Adhesion** | Water hydrogen-bonds to other polar surfaces | Water clings to the walls of narrow plant vessels (capillary action) |
| **Surface tension** | Cohesion at the surface | Some insects can stand on water |
| **High specific heat** | Heat goes into breaking hydrogen bonds before molecules speed up | Organisms and oceans resist temperature swings, which supports homeostasis |
| **High heat of vaporization** | Evaporating requires breaking many hydrogen bonds | Sweating and transpiration carry heat away (evaporative cooling) |

**Exam habit:** name all three links: *property → caused by polarity and hydrogen bonding → what it does for the organism*. Answers that stop at the property lose the point.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Why is a water molecule polar?', back: 'Polar covalent O–H bonds (oxygen is more electronegative) plus a bent shape, so the partial charges don\'t cancel.' },
            { front: 'Cohesion', back: 'Water sticking to water through hydrogen bonds. Lets water travel up xylem as a column; causes surface tension.' },
            { front: 'Adhesion', back: 'Water sticking to other polar surfaces. Helps water climb narrow tubes (capillary action).' },
            { front: 'High specific heat', back: 'Water absorbs a lot of heat before its temperature rises, because energy first breaks hydrogen bonds. Stabilizes body and ocean temperatures.' },
            { front: 'High heat of vaporization', back: 'Evaporating water absorbs a lot of energy, so evaporation (sweating, transpiration) cools the surface it leaves.' },
          ],
        },
      ],
      precheck: {
        question: 'Why does water have a high specific heat?',
        choices: [
          'Much of the heat it absorbs goes into breaking hydrogen bonds before the molecules move faster',
          'The covalent bonds inside each water molecule absorb heat and break',
          'Water is nonpolar, so it resists changes in temperature',
          'Water molecules are much larger than most other molecules',
        ],
        answer: 0,
        explanations: [
          'Correct. Energy is spent breaking hydrogen bonds between molecules, so temperature rises slowly.',
          'Incorrect. Heating water does not break its O–H covalent bonds; it breaks the weaker hydrogen bonds between molecules.',
          'Incorrect. Water is polar, and its polarity is exactly what makes hydrogen bonding possible.',
          'Incorrect. Water is a small molecule; its behavior comes from hydrogen bonding, not size.',
        ],
      },
      checkpoints: [
        {
          question: 'Water travels from a tall tree\'s roots to its leaves as an unbroken column inside narrow xylem vessels. Which two properties make this possible?',
          choices: [
            'Cohesion and adhesion',
            'High specific heat and high heat of vaporization',
            'Nonpolarity and hydrophobic interactions',
            'Ionic bonding between water molecules',
          ],
          answer: 0,
          explanations: [
            'Correct. Cohesion keeps the column of water molecules together; adhesion to the polar vessel walls helps it climb.',
            'Incorrect. These are thermal properties: they control how water absorbs heat, not how it moves up a plant.',
            'Incorrect. Water is polar; hydrophobic interactions describe nonpolar molecules avoiding water.',
            'Incorrect. Water molecules attract each other through hydrogen bonds, not ionic bonds.',
          ],
        },
        {
          question: 'A student writes: "Sweating cools you down because water has a high specific heat." What is the best correction?',
          choices: [
            'The cooling comes from water\'s high heat of vaporization: evaporating sweat absorbs a lot of energy from the skin',
            'The cooling comes from cohesion, which pulls heat out of the skin',
            'The cooling comes from adhesion of sweat to the skin',
            'No correction is needed; the student is right',
          ],
          answer: 0,
          explanations: [
            'Correct. Evaporative cooling depends on heat of vaporization: each gram of water that evaporates carries a large amount of heat away.',
            'Incorrect. Cohesion is water sticking to water; it doesn\'t transfer heat out of the body.',
            'Incorrect. Adhesion keeps sweat on the skin, but the cooling happens when it evaporates.',
            'Incorrect. Specific heat is about resisting temperature change; the cooling of sweat is evaporation, which is heat of vaporization.',
          ],
        },
      ],
      revisit:
        'Tie each property to hydrogen bonds: cohesion is water holding water, adhesion is water holding other polar surfaces, ' +
        'specific heat is resisting temperature change, and heat of vaporization is evaporation carrying heat away.',
    },
    {
      id: '1.2',
      ced: '1.2.A',
      title: 'Elements of Life',
      minutes: 4,
      summary:
        'Carbon, hydrogen and oxygen are in all four kinds of biological macromolecule. Nitrogen is in proteins and nucleic acids, ' +
        'phosphorus in nucleic acids and phospholipids, and sulfur in proteins. Organisms take these atoms from their environment.',
      body: `### What living things are built from
Organisms take atoms from their environment (food, water, air, soil) and rebuild them into their own molecules. **Carbon, hydrogen and oxygen** are the most common elements in all four kinds of biological macromolecule. A few others mark specific molecules:

| Macromolecule | Elements | The extra element is in… |
|---|---|---|
| Carbohydrates | C, H, O | — |
| Lipids (fats, steroids) | C, H, O | — |
| Phospholipids | C, H, O, **P** | the phosphate head |
| Proteins | C, H, O, **N**, some **S** | N in every amino acid; S in some amino acids |
| Nucleic acids (DNA, RNA) | C, H, O, **N**, **P** | N in the bases; P in the phosphates |

### Using elements as labels
Because phosphorus is in DNA but not in protein, and sulfur is in protein but not in DNA, radioactive ³²P and ³⁵S can tag one without the other. This is how Hershey and Chase showed that DNA, not protein, is the genetic material. The same reasoning ("which molecules contain this element?") answers most tracer questions on the exam.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Elements in carbohydrates', back: 'C, H, O' },
            { front: 'Elements in proteins', back: 'C, H, O, N, and sulfur in some amino acids' },
            { front: 'Elements in nucleic acids', back: 'C, H, O, N, P' },
            { front: 'Which lipids contain phosphorus?', back: 'Phospholipids, in their phosphate head' },
            { front: 'A tracer that labels protein but not DNA', back: 'Sulfur (³⁵S): proteins contain S, DNA does not' },
          ],
        },
      ],
      precheck: {
        question: 'Which element is found in nucleic acids but not in carbohydrates or proteins?',
        choices: ['Phosphorus', 'Sulfur', 'Nitrogen', 'Carbon'],
        answer: 0,
        explanations: [
          'Correct. Phosphorus is in the phosphate of every nucleotide; carbohydrates and proteins have none.',
          'Incorrect. Sulfur is in some amino acids (proteins), not in nucleic acids.',
          'Incorrect. Nitrogen is in nucleic acids but also in every protein.',
          'Incorrect. Carbon is in all biological macromolecules.',
        ],
      },
      checkpoints: [
        {
          question: 'Bacteria are grown where their only nitrogen source contains heavy nitrogen (¹⁵N). Which of their molecules will contain ¹⁵N?',
          choices: [
            'Proteins and nucleic acids',
            'Carbohydrates and fats',
            'Nucleic acids only',
            'Carbohydrates only',
          ],
          answer: 0,
          explanations: [
            'Correct. Every amino acid contains nitrogen, and so does every nucleotide base.',
            'Incorrect. Carbohydrates and fats are made of C, H and O only.',
            'Incorrect. Nucleic acids will be labeled, but so will proteins, since every amino acid has nitrogen.',
            'Incorrect. Carbohydrates contain no nitrogen.',
          ],
        },
        {
          question: 'A researcher wants to label a virus\'s protein coat without labeling its DNA. Which radioactive isotope should be used?',
          choices: ['³⁵S', '³²P', '¹⁴C', '³H'],
          answer: 0,
          explanations: [
            'Correct. Sulfur is in some amino acids but not in DNA.',
            'Incorrect. Phosphorus is in DNA\'s backbone, so ³²P labels DNA, not protein.',
            'Incorrect. Carbon is in both protein and DNA.',
            'Incorrect. Hydrogen is in both protein and DNA.',
          ],
        },
      ],
      revisit:
        'Memorize the table by its exceptions: N marks proteins and nucleic acids, P marks nucleic acids and phospholipids, ' +
        'S marks proteins. C, H and O are everywhere, so they never distinguish anything.',
    },
    {
      id: '1.3',
      ced: '1.3.A',
      title: 'Introduction to Macromolecules',
      minutes: 5,
      summary:
        'Monomers join into polymers by dehydration synthesis, which removes the equivalent of a water molecule and forms a covalent bond. ' +
        'Hydrolysis breaks that bond by adding water back. A chain of n monomers has n − 1 bonds.',
      body: `### Building: dehydration synthesis
Two monomers join when a **hydrogen** is removed from one and a **hydroxyl group (–OH)** from the other. Those leave together as the equivalent of one **water molecule**, and the two monomers are joined by a new **covalent bond**. Linking many monomers this way is **polymerization**.

### Breaking: hydrolysis
*Hydro* (water) + *lysis* (split). Water is added across the bond between two monomers: the hydrogen goes to one monomer, the hydroxyl to the other, and the covalent bond breaks. Digestion is mostly hydrolysis.

### Counting water
Each bond in a linear chain costs one water molecule to make and one to break. A chain of **n** monomers has **n − 1** bonds.

${steps({
  title: 'How many water molecules are released making a 150-amino-acid polypeptide?',
  steps: [
    { title: 'Count the bonds', body: 'A linear chain of 150 monomers has one bond between each neighbouring pair: 150 − 1 = 149 peptide bonds.' },
    { title: 'One water per bond', body: 'Each bond formed by dehydration synthesis releases the equivalent of one water molecule.' },
  ],
  answer: '149 water molecules. Breaking the whole chain back into amino acids by hydrolysis would use 149.',
})}`,
      blocks: [{ type: 'sim', sim: 'polymer-builder' }],
      precheck: {
        question: 'In dehydration synthesis, the water molecule that is released is formed from:',
        choices: [
          'A hydrogen from one monomer and a hydroxyl group from the other',
          'Two hydrogens from the same monomer',
          'A water molecule taken in from the surroundings',
          'The oxygen of a phosphate group',
        ],
        answer: 0,
        explanations: [
          'Correct. One monomer gives up H, the other gives up OH, and together they leave as H₂O.',
          'Incorrect. Each monomer contributes part of the water: H from one, OH from the other.',
          'Incorrect. That describes hydrolysis, which uses water. Dehydration synthesis releases it.',
          'Incorrect. Phosphates are not involved in joining monomers in general.',
        ],
      },
      checkpoints: [
        {
          question: 'Digestive enzymes break starch down into glucose. Which statement describes this reaction?',
          choices: [
            'Hydrolysis: water is used and covalent bonds between monomers are broken',
            'Dehydration synthesis: water is released and covalent bonds are broken',
            'Hydrolysis: water is released and covalent bonds are formed',
            'Dehydration synthesis: water is used and covalent bonds are formed',
          ],
          answer: 0,
          explanations: [
            'Correct. Breaking a polymer into monomers is hydrolysis, which consumes water.',
            'Incorrect. Dehydration synthesis forms bonds; it does not break them.',
            'Incorrect. Hydrolysis uses water and breaks bonds; it does the opposite of both parts of this statement.',
            'Incorrect. Dehydration synthesis releases water and builds polymers, so it can\'t be digestion.',
          ],
        },
        {
          question: 'How many water molecules are released when 6 monosaccharides are joined into one linear chain?',
          choices: ['5', '6', '7', '12'],
          answer: 0,
          explanations: [
            'Correct. Six monomers in a line have 5 bonds between them, and each bond releases one water.',
            'Incorrect. That counts monomers, not bonds. A chain of 6 has only 5 bonds.',
            'Incorrect. There are fewer bonds than monomers in a linear chain, not more.',
            'Incorrect. That is two waters per monomer; each bond releases one.',
          ],
        },
      ],
      revisit:
        'Dehydration synthesis builds and releases water; hydrolysis breaks and uses water. For a straight chain, count the bonds ' +
        '(monomers minus one): that is the number of waters.',
    },
    {
      id: '1.4',
      ced: '1.4.A',
      title: 'Carbohydrates',
      minutes: 4,
      summary:
        'Monosaccharides (simple sugars) are the monomers of polysaccharides. Starch stores energy in plants, glycogen in animals, ' +
        'and cellulose builds plant cell walls. The way the sugars are linked and branched determines what each polymer does.',
      body: `### Monomers and polymers
**Monosaccharides** (simple sugars such as glucose and fructose) are the monomers. They are joined by covalent bonds through dehydration synthesis into **polysaccharides** (complex carbohydrates), which can be **linear or branched**.

### Same monomer, different jobs
Starch, glycogen and cellulose are all polymers of glucose. They differ in how the glucose units are linked and how much the chain branches, and that changes their properties:

| Polysaccharide | Found in | Job | Shape that fits the job |
|---|---|---|---|
| **Starch** | Plants | Energy storage | Coiled chains, some branched |
| **Glycogen** | Animals (liver, muscle) | Energy storage | Highly branched: many chain ends, so enzymes can release glucose quickly |
| **Cellulose** | Plant cell walls | Structure | Straight chains that hydrogen-bond side by side into strong fibers |

Most animals can't digest cellulose because their enzymes can't break the type of linkage it uses. The exact molecular structures are outside the AP exam; the structure-to-function link is what's tested.`,
      blocks: [],
      precheck: {
        question: 'What are the monomers of polysaccharides?',
        choices: ['Monosaccharides', 'Amino acids', 'Fatty acids', 'Nucleotides'],
        answer: 0,
        explanations: [
          'Correct. Simple sugars join into complex carbohydrates.',
          'Incorrect. Amino acids are the monomers of proteins.',
          'Incorrect. Fatty acids are parts of many lipids, not carbohydrates.',
          'Incorrect. Nucleotides are the monomers of nucleic acids.',
        ],
      },
      checkpoints: [
        {
          question: 'Glycogen is more highly branched than plant starch. What advantage does this give an animal?',
          choices: [
            'More chain ends, so enzymes can release many glucose molecules at once when energy is needed quickly',
            'Branching makes glycogen a structural molecule like cellulose',
            'Branching lets each glucose unit store more energy',
            'Branching makes glycogen contain nitrogen for building proteins',
          ],
          answer: 0,
          explanations: [
            'Correct. Glucose is removed from chain ends, so more branches mean faster release.',
            'Incorrect. Glycogen stores energy; it isn\'t structural.',
            'Incorrect. The energy in each glucose doesn\'t change with branching; only how fast it can be released.',
            'Incorrect. Carbohydrates contain only C, H and O.',
          ],
        },
        {
          question: 'Cellulose and starch are both made of glucose, yet one is structural and one stores energy. What best explains the difference?',
          choices: [
            'The glucose units are linked differently, giving the polymers different shapes and properties',
            'Cellulose contains nitrogen and starch does not',
            'Starch is a protein and cellulose is a carbohydrate',
            'Cellulose is built from fructose instead of glucose',
          ],
          answer: 0,
          explanations: [
            'Correct. Same monomer, different linkage and arrangement: that is the structure-function idea the exam tests.',
            'Incorrect. Both are carbohydrates made only of C, H and O.',
            'Incorrect. Both are polysaccharides.',
            'Incorrect. Both are polymers of glucose.',
          ],
        },
      ],
      revisit:
        'Carbohydrates: simple sugars are the monomers. Starch (plants) and glycogen (animals, highly branched for fast release) store energy; ' +
        'cellulose (straight, fiber-forming chains) builds plant cell walls. Different linkages and branching give different jobs.',
    },
    {
      id: '1.5',
      ced: '1.5.A',
      title: 'Lipids',
      minutes: 6,
      summary:
        'Lipids are mostly nonpolar and hydrophobic. Saturated fatty acids have only single C–C bonds and pack tightly (solid at room temperature); ' +
        'each double bond adds a kink, so more unsaturated fats are more liquid. Fats store energy, steroids act as hormones, cholesterol stabilizes ' +
        'animal membranes, and phospholipids form bilayers.',
      body: `### Nonpolar on purpose
Lipids are typically **nonpolar and hydrophobic**: they don't mix with water. Their function comes from how their parts are put together. Many fats are built from fatty acids attached to glycerol by dehydration synthesis.

### Saturated vs unsaturated
- **Saturated** fatty acids have only **single bonds** between carbons. Their tails are straight and pack tightly, so saturated fats (like butter) are **solid** at room temperature.
- **Unsaturated** fatty acids have **at least one double bond**, which puts a **kink** in the chain. Kinked tails can't pack tightly, so unsaturated fats (like olive oil) are **liquid**.
- More double bonds → more unsaturated → more liquid.

Try it in the simulation below: add double bonds and watch the tails stop packing.

### What lipids do
| Lipid | Function |
|---|---|
| **Fats** | Long-term energy storage; insulation in some mammals |
| **Steroids** | Hormones that regulate growth, development, energy metabolism and homeostasis |
| **Cholesterol** (a steroid) | Structural stability in animal cell membranes |
| **Phospholipids** | Form the lipid bilayer of cell membranes: hydrophilic phosphate heads face water, hydrophobic tails face each other inside |`,
      blocks: [{ type: 'sim', sim: 'saturation-slider' }],
      precheck: {
        question: 'Which lipid gives structural stability to animal cell membranes?',
        choices: ['Cholesterol', 'Triglyceride fat', 'Cellulose', 'Glycogen'],
        answer: 0,
        explanations: [
          'Correct. Cholesterol sits among the phospholipids and stabilizes animal cell membranes.',
          'Incorrect. Triglyceride fats store energy; they are not a structural part of membranes.',
          'Incorrect. Cellulose is a carbohydrate in plant cell walls.',
          'Incorrect. Glycogen is a carbohydrate used for energy storage in animals.',
        ],
      },
      checkpoints: [
        {
          question: 'Fatty acid A has no carbon–carbon double bonds; fatty acid B has three. At room temperature, which is more likely to be solid, and why?',
          choices: [
            'A, because its straight tails pack tightly together',
            'B, because double bonds are stronger and hold the molecules together',
            'Both, because all fatty acids are solid at room temperature',
            'Neither, because single bonds make lipids liquid',
          ],
          answer: 0,
          explanations: [
            'Correct. A is saturated: no kinks, so the tails pack closely and the fat is solid.',
            'Incorrect. Double bonds put kinks in the chain, which stops tight packing and makes the fat more liquid.',
            'Incorrect. Unsaturated fats such as oils are liquid at room temperature.',
            'Incorrect. Single bonds keep the tail straight, which favors a solid.',
          ],
        },
        {
          question: 'Phospholipids added to water arrange themselves into a bilayer. Why?',
          choices: [
            'The hydrophobic tails avoid water by facing each other, while the hydrophilic heads face the water',
            'The heads are hydrophobic and cluster in the middle',
            'Covalent bonds form between the tails of neighbouring phospholipids',
            'The fatty acid tails are polar and dissolve in the water',
          ],
          answer: 0,
          explanations: [
            'Correct. Heads face water on both sides; nonpolar tails are tucked inside, away from water.',
            'Incorrect. The phosphate heads are the hydrophilic part; they face the water.',
            'Incorrect. The bilayer is held by hydrophobic interactions, not covalent bonds between molecules.',
            'Incorrect. The tails are nonpolar; that is why they hide from water.',
          ],
        },
      ],
      revisit:
        'Saturated = only single bonds = straight tails = packs tightly = solid. Unsaturated = double bonds = kinks = liquid. ' +
        'Phospholipid heads love water, tails avoid it, so they form a bilayer.',
    },
    {
      id: '1.6',
      ced: '1.6.A',
      title: 'Nucleic Acids',
      minutes: 6,
      summary:
        'Nucleotides (five-carbon sugar + phosphate + nitrogenous base) are the monomers of DNA and RNA. Strands have a 5′ phosphate end and a ' +
        '3′ hydroxyl end, and grow at the 3′ end. DNA is an antiparallel double helix paired A–T and C–G by hydrogen bonds; RNA uses ribose and uracil ' +
        'and is usually single-stranded.',
      body: `### The monomer: a nucleotide
Each nucleotide has three parts: a **five-carbon sugar** (deoxyribose in DNA, ribose in RNA), a **phosphate**, and a **nitrogenous base** (adenine, thymine, guanine, cytosine, or uracil). Genetic information is stored in the *sequence* of bases.

### Direction matters
A strand has two different ends: the **5′ (five prime) end** has a free phosphate and the **3′ end** has a free hydroxyl. New nucleotides are always added to the **3′ end**, forming covalent bonds between nucleotides, so strands grow 5′ → 3′.

### DNA vs RNA
| | DNA | RNA |
|---|---|---|
| Sugar | Deoxyribose | Ribose |
| Bases | A, T, G, C | A, **U**, G, C |
| Strands | Usually double (a helix) | Usually single |
| Pairing | A–T, C–G | A–U (where it pairs) |

The two DNA strands run in **opposite** directions (antiparallel) and are held together by **hydrogen bonds** between paired bases.

${steps({
  title: 'Write the complementary strand of 5′-ATGCCA-3′, 5′ to 3′',
  steps: [
    { title: 'Pair each base', body: 'A↔T, T↔A, G↔C, C↔G, C↔G, A↔T gives TACGGT.' },
    { title: 'Mind the direction', body: 'The new strand is antiparallel, so lined up underneath it reads 3′-TACGGT-5′.' },
    { title: 'Flip it to read 5′ to 3′', body: 'Reverse the order: 5′-TGGCAT-3′.' },
  ],
  answer: '5′-TGGCAT-3′. The common trap is 5′-TACGGT-3′, which has the right pairs but the wrong direction.',
})}`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Three parts of a nucleotide', back: 'Five-carbon sugar, phosphate, nitrogenous base' },
            { front: 'Sugar in DNA vs RNA', back: 'DNA: deoxyribose. RNA: ribose.' },
            { front: 'Base only in RNA', back: 'Uracil (replaces thymine)' },
            { front: 'Which end do new nucleotides join?', back: 'The 3′ (hydroxyl) end, so strands grow 5′ → 3′' },
            { front: 'What holds the two DNA strands together?', back: 'Hydrogen bonds between paired bases (A–T, C–G)' },
          ],
        },
      ],
      precheck: {
        question: 'New nucleotides are added to which end of a growing DNA or RNA strand?',
        choices: ['The 3′ end', 'The 5′ end', 'Either end', 'The middle of the strand'],
        answer: 0,
        explanations: [
          'Correct. Nucleotides attach to the free 3′ hydroxyl, so strands grow 5′ to 3′.',
          'Incorrect. The 5′ end has the phosphate; growth happens at the 3′ end.',
          'Incorrect. Synthesis only ever extends the 3′ end.',
          'Incorrect. Nucleotides are added at an end, not inserted into the middle.',
        ],
      },
      checkpoints: [
        {
          question: 'One DNA strand reads 5′-GATTC-3′. What is its complementary strand, written 5′ to 3′?',
          choices: ['5′-GAATC-3′', '5′-CTAAG-3′', '5′-GATTC-3′', '5′-CUAAG-3′'],
          answer: 0,
          explanations: [
            'Correct. The pairs give 3′-CTAAG-5′ underneath; read 5′ to 3′ that is GAATC.',
            'Incorrect. Right pairs, wrong direction: this is the complement written 3′ to 5′ but labeled 5′ to 3′.',
            'Incorrect. That is the original strand, not its complement.',
            'Incorrect. Uracil is in RNA, not DNA, and the direction is also wrong.',
          ],
        },
        {
          question: 'A molecule is single-stranded and contains ribose and uracil. It is most likely:',
          choices: ['RNA', 'DNA', 'A protein', 'A phospholipid'],
          answer: 0,
          explanations: [
            'Correct. Ribose, uracil and a single strand are all features of RNA.',
            'Incorrect. DNA has deoxyribose and thymine, and is usually double-stranded.',
            'Incorrect. Proteins are made of amino acids, not sugars and bases.',
            'Incorrect. Phospholipids have no nitrogenous bases.',
          ],
        },
      ],
      revisit:
        'Nucleotide = sugar + phosphate + base. Grow at 3′. DNA: deoxyribose, thymine, double, A–T and C–G. RNA: ribose, uracil, single. ' +
        'For complementary strands, pair the bases, then reverse the order to write it 5′ to 3′.',
    },
    {
      id: '1.7',
      ced: '1.7.A',
      title: 'Proteins',
      minutes: 7,
      summary:
        'Amino acids join by peptide bonds into polypeptides. The sequence (primary structure) and the chemistry of the R groups determine folding: ' +
        'hydrogen bonds in the backbone make helices and sheets (secondary), R-group interactions make the 3D shape (tertiary), and several ' +
        'polypeptides can combine (quaternary). Shape determines function.',
      body: `### Amino acids and peptide bonds
Every amino acid has a central carbon bonded to a hydrogen, a **carboxyl group (–COOH)**, an **amine group (–NH₂)**, and a variable **R group**. A **peptide bond** (covalent) forms between the carboxyl of one amino acid and the amine of the next by dehydration synthesis, building a polypeptide chain.

R groups come in three chemical types: **nonpolar / hydrophobic**, **polar / hydrophilic**, and **ionic (charged)**. How they interact decides how that region of the protein folds.

### Four levels of structure
| Level | What it is | Held by |
|---|---|---|
| **Primary** | The amino acid sequence | Peptide bonds (covalent) |
| **Secondary** | Local folding into α-helices and β-pleated sheets | Hydrogen bonds between backbone atoms |
| **Tertiary** | The overall 3D shape of one polypeptide | R-group interactions: hydrogen bonds, hydrophobic interactions, ionic bonds, disulfide bridges |
| **Quaternary** | Several polypeptides fitted together | Interactions between the polypeptides |

All four levels determine the protein's function. Change the sequence and you can change the shape; change the shape and you can change the function.

${steps({
  title: 'A mutation swaps a nonpolar amino acid buried inside a protein for a charged one. Predict the effect.',
  steps: [
    { title: 'Where was it?', body: 'Nonpolar R groups usually cluster in the protein\'s interior, away from water (hydrophobic interactions).' },
    { title: 'What changes?', body: 'A charged R group is hydrophilic: it is drawn toward water and can no longer sit comfortably in the hydrophobic core.' },
    { title: 'Follow it through the levels', body: 'Primary structure changed (one amino acid), so tertiary folding can change, which can change the active site or binding surface.' },
  ],
  answer: 'The protein may fold differently and lose or change its function. Primary change → shape change → function change.',
})}`,
      blocks: [],
      precheck: {
        question: 'A peptide bond forms between:',
        choices: [
          'The carboxyl group of one amino acid and the amine group of the next',
          'The R groups of two neighbouring amino acids',
          'The amine groups of two amino acids',
          'A sugar and a phosphate',
        ],
        answer: 0,
        explanations: [
          'Correct. Carboxyl of one, amine of the next, joined by dehydration synthesis.',
          'Incorrect. R groups interact in tertiary structure; they don\'t form the backbone\'s peptide bonds.',
          'Incorrect. A peptide bond links a carboxyl group to an amine group, not two amines.',
          'Incorrect. Sugar–phosphate bonds make the backbone of nucleic acids.',
        ],
      },
      checkpoints: [
        {
          question: 'A treatment disrupts hydrogen bonds and ionic interactions but leaves covalent bonds intact. Which level of protein structure is certain to remain unchanged?',
          choices: ['Primary', 'Secondary', 'Tertiary', 'Quaternary'],
          answer: 0,
          explanations: [
            'Correct. The sequence is held by covalent peptide bonds, which this treatment doesn\'t break.',
            'Incorrect. Secondary structure is held by hydrogen bonds, which are disrupted.',
            'Incorrect. Tertiary structure depends partly on hydrogen bonds and ionic interactions, so it can change.',
            'Incorrect. Quaternary structure depends on non-covalent interactions between polypeptides, which are disrupted.',
          ],
        },
        {
          question: 'Which bonds or interactions shape a protein\'s tertiary structure?',
          choices: [
            'Hydrogen bonds, hydrophobic interactions, ionic interactions and disulfide bridges between R groups',
            'Only the peptide bonds between amino acids',
            'Only hydrogen bonds between backbone atoms',
            'Phosphodiester bonds between nucleotides',
          ],
          answer: 0,
          explanations: [
            'Correct. Tertiary structure comes from all of these R-group interactions.',
            'Incorrect. Peptide bonds set the primary structure (the sequence).',
            'Incorrect. Backbone hydrogen bonds make secondary structure (helices and sheets).',
            'Incorrect. Those bonds link nucleotides in DNA and RNA, not amino acids.',
          ],
        },
      ],
      revisit:
        'Primary = sequence (covalent peptide bonds). Secondary = backbone hydrogen bonds (helices, sheets). Tertiary = R-group interactions ' +
        '(H bonds, hydrophobic, ionic, disulfide). Quaternary = several chains. Heat or pH breaks the weak ones; the sequence survives.',
    },
  ],
};

export default pack;
