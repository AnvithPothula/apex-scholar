/**
 * AP Biology Unit 2: Cells — study pack.
 *
 * Written against the AP Biology CED (2025, topics 2.1–2.10) and checked by
 * hand. The two simulations are Apex Scholar components modeled on MicroSims in
 * Dan McCreary's "Biology: An Interactive Course" (CC BY-NC-SA 4.0), which was
 * also used as a reference for this unit; see `credits`.
 *
 * Numeric answers (SA:V ratios, solute potential) were recomputed by hand.
 * Same shape as apBiologyUnit1.js. Import-free for scripts/prerender.mjs.
 */

const steps = (spec) => '```apex-steps\n' + JSON.stringify(spec) + '\n```';

const pack = {
  slug: 'ap-biology/unit-2',
  subject: 'AP Biology',
  unit: 'Unit 2: Cells',
  examWeight: '10–13% of the multiple-choice section',
  intro:
    'A cell is a set of compartments with a selective border. This unit is about what each compartment does, why cells ' +
    'stay small, and how the membrane decides what gets in and out: the ideas behind every later unit on energy, signaling and genes.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Biology: An Interactive Course',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/biology/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'Used as a reference; the surface-area-to-volume and osmosis simulations are rebuilt from its MicroSims.',
    },
  ],
  sections: [
    {
      id: '2.1',
      ced: '2.1.A',
      title: 'Cell Structure and Function',
      minutes: 7,
      summary:
        'Ribosomes make proteins in every cell. In eukaryotes the endomembrane system (ER, Golgi, lysosomes, vacuoles, vesicles, ' +
        'nuclear envelope, plasma membrane) builds, modifies and ships molecules. Mitochondria (folded inner membrane) make ATP; ' +
        'chloroplasts run photosynthesis; lysosomes digest; vacuoles store, and in plants keep cells firm.',
      body: `### Found in every cell: ribosomes
**Ribosomes** are made of ribosomal RNA (rRNA) and protein and have **no membrane**. They build proteins from mRNA instructions. Every known organism has them, which is evidence of **common ancestry**.

### The endomembrane system
A group of membrane-bound parts that **modify, package and transport** lipids, proteins and polysaccharides: the **endoplasmic reticulum**, **Golgi complex**, **lysosomes**, **vacuoles**, **transport vesicles**, the **nuclear envelope** and the **plasma membrane**.

| Organelle | What it does |
|---|---|
| **Rough ER** | Studded with ribosomes; makes proteins (especially ones to be secreted or put in membranes); compartmentalizes the cell |
| **Smooth ER** | Makes lipids; detoxifies |
| **Golgi complex** | Stacked sacs that fold and chemically modify new products and package proteins for shipping |
| **Lysosomes** | Sacs of hydrolytic enzymes that digest material; help with programmed cell death (apoptosis) |
| **Vacuoles** | Storage. Plants have one large central vacuole that holds water and keeps turgor pressure; animal cells have many small ones |

The ER also gives mechanical support and helps move things inside the cell.

### The energy organelles
- **Mitochondria** have a **double membrane**. The inner membrane is **folded**, giving more surface area for the reactions that make ATP in aerobic respiration.
- **Chloroplasts** (plants and photosynthetic algae) also have a double membrane and are where **photosynthesis** happens.

### Following a secreted protein
Ribosome on the rough ER → into the ER → transport vesicle → Golgi (modified, packaged) → vesicle → fuses with the plasma membrane → released outside (exocytosis).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Ribosome', back: 'rRNA + protein, no membrane; makes proteins; found in all cells' },
            { front: 'Rough ER', back: 'Ribosome-studded; makes proteins for secretion or membranes' },
            { front: 'Smooth ER', back: 'Lipid synthesis and detoxification' },
            { front: 'Golgi complex', back: 'Modifies, folds and packages proteins for shipping' },
            { front: 'Lysosome', back: 'Hydrolytic enzymes that digest material; role in apoptosis' },
            { front: 'Why is the inner mitochondrial membrane folded?', back: 'More surface area for the reactions that make ATP' },
          ],
        },
      ],
      precheck: {
        question: 'Which structure is found in all cells, both prokaryotic and eukaryotic?',
        choices: ['Ribosomes', 'Mitochondria', 'Nucleus', 'Golgi complex'],
        answer: 0,
        explanations: [
          'Correct. Every cell makes proteins on ribosomes, which reflects common ancestry.',
          'Incorrect. Mitochondria are eukaryotic organelles; prokaryotes do not have them.',
          'Incorrect. Prokaryotes have no nucleus.',
          'Incorrect. The Golgi is part of the eukaryotic endomembrane system.',
        ],
      },
      checkpoints: [
        {
          question: 'Pancreatic cells secrete large amounts of digestive enzymes, which are proteins. Which structure would you expect them to have in unusually large amounts?',
          choices: ['Rough endoplasmic reticulum', 'Smooth endoplasmic reticulum', 'Chloroplasts', 'A large central vacuole'],
          answer: 0,
          explanations: [
            'Correct. Proteins made for secretion are built by ribosomes on the rough ER.',
            'Incorrect. Smooth ER makes lipids and detoxifies; it has no ribosomes.',
            'Incorrect. Chloroplasts are for photosynthesis and are not found in animal cells.',
            'Incorrect. A large central vacuole is a plant-cell feature for storage and turgor.',
          ],
        },
        {
          question: 'Which path does a protein that will be secreted from the cell follow?',
          choices: [
            'Rough ER → vesicle → Golgi → vesicle → plasma membrane',
            'Golgi → rough ER → lysosome → plasma membrane',
            'Smooth ER → nucleus → Golgi → plasma membrane',
            'Ribosome in the cytoplasm → mitochondrion → plasma membrane',
          ],
          answer: 0,
          explanations: [
            'Correct. Made at the rough ER, modified and packaged in the Golgi, then shipped in a vesicle to the membrane.',
            'Incorrect. The Golgi comes after the ER, and lysosomes digest material rather than ship it out.',
            'Incorrect. Secreted proteins are made on rough ER, and they do not go into the nucleus.',
            'Incorrect. Mitochondria make ATP; they are not part of the secretory pathway.',
          ],
        },
      ],
      revisit:
        'Proteins for export: rough ER → Golgi → vesicle → membrane. Smooth ER makes lipids. Lysosomes digest. Mitochondria make ATP ' +
        '(folded inner membrane = more surface area). Ribosomes are everywhere because all life shares an ancestor.',
    },
    {
      id: '2.2',
      ced: '2.2.A',
      title: 'Cell Size',
      minutes: 6,
      summary:
        'Exchange happens across the surface, but demand comes from the volume. As a cell grows, its volume rises faster than its surface ' +
        'area, so the surface-area-to-volume ratio falls and exchange gets less efficient. That is why cells stay small, why some cells fold ' +
        'their membranes, and why small animals lose heat faster and run hotter metabolisms per gram.',
      body: `### Why size matters
A cell takes in nutrients, gets rid of waste and exchanges heat **across its surface**, but how much it needs depends on its **volume**.

For a cube with side $s$: surface area $= 6s^2$, volume $= s^3$, so
$$\\frac{SA}{V} = \\frac{6s^2}{s^3} = \\frac{6}{s}.$$
Double the side and the ratio halves. Small cells have a **higher** ratio, so they exchange materials more efficiently.

${steps({
  title: 'Compare SA:V for cube-shaped cells with sides 1 μm and 3 μm',
  steps: [
    { title: '1 μm cube', body: 'SA = 6(1²) = 6 μm². V = 1³ = 1 μm³. Ratio 6 : 1.' },
    { title: '3 μm cube', body: 'SA = 6(3²) = 54 μm². V = 3³ = 27 μm³. Ratio 54/27 = 2 : 1.' },
    { title: 'Compare', body: 'The bigger cell has 27× the volume to supply but only 9× the surface to supply it through.' },
  ],
  answer: 'The 3 μm cell has a third of the SA:V ratio (2 vs 6), so it exchanges materials less efficiently per unit volume.',
})}

### How cells and organisms cope
- Cells stay small, or change **shape** (long, thin, flattened) to keep the ratio up.
- **Membrane folds** add surface without adding much volume: root hairs, microvilli in the gut, the folded inner membrane of mitochondria.
- In whole organisms, a smaller animal has a higher SA:V, so it **loses heat faster** and has a **higher metabolic rate per gram** (a shrew vs an elephant).

The CED gives the formulas for spheres, cubes, rectangular solids and cylinders on the exam's equation sheet; the reasoning is what's tested.`,
      blocks: [{ type: 'sim', sim: 'sa-volume' }],
      precheck: {
        question: 'As a cell grows larger without changing shape, its surface-area-to-volume ratio:',
        choices: ['Decreases', 'Increases', 'Stays the same', 'Doubles each time the volume doubles'],
        answer: 0,
        explanations: [
          'Correct. Volume grows with the cube of size, surface area only with the square, so the ratio falls.',
          'Incorrect. Small cells have the higher ratio; growing lowers it.',
          'Incorrect. The ratio depends on size (6/s for a cube), so it changes as the cell grows.',
          'Incorrect. Volume grows faster than surface area, so the ratio drops.',
        ],
      },
      checkpoints: [
        {
          question: 'A cube-shaped cell has sides of 2 μm. What is its surface-area-to-volume ratio?',
          choices: ['3 : 1', '1 : 3', '6 : 1', '12 : 1'],
          answer: 0,
          explanations: [
            'Correct. SA = 6 × 2² = 24 μm², V = 2³ = 8 μm³, and 24/8 = 3.',
            'Incorrect. That is volume over surface area; the ratio is SA divided by V.',
            'Incorrect. 6 : 1 is the ratio for a 1 μm cube.',
            'Incorrect. Check the volume: 2³ = 8, not 2.',
          ],
        },
        {
          question: 'A shrew has a much higher metabolic rate per gram of body mass than an elephant. Which explanation fits?',
          choices: [
            'Its higher surface-area-to-volume ratio makes it lose heat faster, so it must produce more heat per gram',
            'Its cells are a different type from elephant cells',
            'It has a lower surface-area-to-volume ratio, so it traps heat',
            'Smaller animals contain more mitochondria in total than larger ones',
          ],
          answer: 0,
          explanations: [
            'Correct. Small bodies exchange proportionally more heat with the environment, so they burn more energy per gram to stay warm.',
            'Incorrect. Mammal cells are similar in type; the difference comes from body size and SA:V.',
            'Incorrect. A small animal has a higher ratio, not a lower one.',
            'Incorrect. A larger animal has more cells and mitochondria in total; the question is about rate per gram.',
          ],
        },
      ],
      revisit:
        'Exchange is through the surface; demand comes from the volume. Bigger → lower SA:V → slower exchange per unit volume. ' +
        'Fixes: stay small, flatten or elongate, fold the membrane. Small animals lose heat faster and burn more per gram.',
    },
    {
      id: '2.3–2.4',
      ced: '2.3.A, 2.3.B, 2.4.A, 2.4.B',
      title: 'The Plasma Membrane and Selective Permeability',
      minutes: 7,
      summary:
        'The membrane is a fluid mosaic: a phospholipid bilayer with proteins, cholesterol, glycoproteins and glycolipids that can drift ' +
        'around. Its hydrophobic interior lets small nonpolar molecules (O₂, CO₂, N₂) through, lets small polar ones like water through ' +
        'only slowly, and blocks ions and large polar molecules, which need transport proteins. Cell walls add structure and protect against bursting.',
      body: `### The fluid mosaic model
- **Phospholipids** form a bilayer: hydrophilic phosphate heads face the watery inside and outside of the cell; hydrophobic fatty-acid tails face each other in the middle.
- **Embedded proteins** have **hydrophobic** surfaces where they touch the tails and **hydrophilic** parts that face the cytosol or the outside.
- **Cholesterol** (in vertebrate animal cells), **glycoproteins** and **glycolipids** are scattered through it.
- It's **fluid**: these parts move around within the membrane. It's a **mosaic**: many kinds of molecule fitted together.

### What gets through
The **hydrophobic interior** is what makes the membrane **selectively permeable**.

| Molecule | Crosses the bilayer? |
|---|---|
| Small nonpolar (O₂, CO₂, N₂) | Freely |
| Small polar, uncharged (H₂O, NH₃) | In small amounts |
| Large polar (glucose) | No, needs a transport protein |
| Ions (Na⁺, K⁺, Cl⁻) | No, needs a channel or transport protein |

### Cell walls
Bacteria, archaea, fungi and plants have a **cell wall** outside the membrane. It gives structure, acts as a barrier to some substances, and stops the cell from **bursting** when water rushes in (osmotic lysis).`,
      blocks: [],
      precheck: {
        question: 'Which molecule can pass most easily through a phospholipid bilayer without help from a protein?',
        choices: ['O₂', 'Na⁺', 'Glucose', 'A protein hormone'],
        answer: 0,
        explanations: [
          'Correct. Small nonpolar molecules dissolve through the hydrophobic interior.',
          'Incorrect. Ions are charged and are blocked by the hydrophobic interior.',
          'Incorrect. Glucose is large and polar; it needs a transport protein.',
          'Incorrect. A protein is far too large and polar; it would need vesicles.',
        ],
      },
      checkpoints: [
        {
          question: 'The part of a transmembrane protein that sits within the middle of the bilayer most likely has R groups that are:',
          choices: ['Nonpolar (hydrophobic)', 'Charged (ionic)', 'Polar (hydrophilic)', 'Covalently bonded to the phospholipid tails'],
          answer: 0,
          explanations: [
            'Correct. That region touches the fatty-acid tails, so it is hydrophobic.',
            'Incorrect. Charged groups would be repelled by the hydrophobic interior; they face the watery sides.',
            'Incorrect. Polar groups face water on either side of the membrane.',
            'Incorrect. Proteins associate with lipids through hydrophobic interactions, not covalent bonds.',
          ],
        },
        {
          question: 'Why can\'t sodium ions diffuse directly through the phospholipid bilayer?',
          choices: [
            'They are charged, and the hydrophobic interior of the bilayer blocks charged particles',
            'They are too large to fit between phospholipids',
            'They are nonpolar',
            'The bilayer is completely impermeable to everything',
          ],
          answer: 0,
          explanations: [
            'Correct. Ions need channel or transport proteins because the nonpolar tails repel charge.',
            'Incorrect. Na⁺ is tiny; its charge, not its size, keeps it out.',
            'Incorrect. Ions are charged, the opposite of nonpolar.',
            'Incorrect. Small nonpolar molecules like O₂ cross freely.',
          ],
        },
      ],
      revisit:
        'Fluid mosaic: bilayer + proteins + cholesterol + glycoproteins, all able to move. Hydrophobic middle: small nonpolar passes freely, ' +
        'water slowly, ions and big polar molecules need proteins. Cell walls prevent bursting.',
    },
    {
      id: '2.5–2.6',
      ced: '2.5.A, 2.5.B, 2.6.A',
      title: 'Membrane Transport and Facilitated Diffusion',
      minutes: 6,
      summary:
        'Passive transport moves molecules down their concentration gradient with no energy input; facilitated diffusion is passive transport ' +
        'through channel or carrier proteins (ions, large polar molecules, water through aquaporins). Active transport uses energy and can ' +
        'move molecules up their gradient. Endocytosis and exocytosis move large amounts in vesicles and also use energy.',
      body: `### Gradients
Because the membrane is selective, cells can build **concentration gradients**: more of a substance on one side than the other.

### Passive transport: no energy needed
Net movement **from high to low concentration**, down the gradient.
- **Simple diffusion**: straight through the bilayer (O₂, CO₂).
- **Facilitated diffusion**: through **channel** or **carrier proteins**, still down the gradient and still free. It's how **ions** such as Na⁺ and K⁺ and **large polar molecules** like glucose cross. **Aquaporins** let large amounts of water through quickly. Ions crossing can **polarize** the membrane (a charge difference across it).

### Active transport: energy required
Uses metabolic energy (usually ATP) and a membrane protein, and **can move molecules from low to high concentration**, against the gradient.

### Bulk transport: vesicles, energy required
- **Endocytosis**: the membrane folds inward and pinches off a vesicle around material from outside.
- **Exocytosis**: a vesicle fuses with the membrane and releases its contents outside (how hormones and digestive enzymes are secreted).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Passive transport', back: 'High → low concentration, no energy input' },
            { front: 'Facilitated diffusion', back: 'Passive transport through channel or carrier proteins (ions, glucose, water via aquaporins)' },
            { front: 'Active transport', back: 'Uses energy (ATP) and a protein; can move substances low → high' },
            { front: 'Endocytosis vs exocytosis', back: 'Endo: membrane folds in to bring material in. Exo: vesicle fuses to release material out. Both use energy.' },
          ],
        },
      ],
      precheck: {
        question: 'Net movement of molecules from high to low concentration without any energy input is called:',
        choices: ['Passive transport', 'Active transport', 'Endocytosis', 'Exocytosis'],
        answer: 0,
        explanations: [
          'Correct. Moving down the gradient needs no energy.',
          'Incorrect. Active transport requires energy and can go against the gradient.',
          'Incorrect. Endocytosis uses energy to bring material in by vesicles.',
          'Incorrect. Exocytosis uses energy to release material by vesicles.',
        ],
      },
      checkpoints: [
        {
          question: 'Glucose enters a cell down its concentration gradient through a carrier protein, without using ATP. This is:',
          choices: ['Facilitated diffusion', 'Active transport', 'Simple diffusion', 'Endocytosis'],
          answer: 0,
          explanations: [
            'Correct. Passive (down the gradient, no ATP) but through a protein: facilitated diffusion.',
            'Incorrect. No ATP is used and it moves down the gradient, so it is not active transport.',
            'Incorrect. Glucose is large and polar, so it cannot pass straight through the bilayer.',
            'Incorrect. Endocytosis takes in material by folding the membrane into vesicles and needs energy.',
          ],
        },
        {
          question: 'A cell moves an ion from where it is less concentrated to where it is more concentrated. Which must be true?',
          choices: [
            'Energy is used and a membrane protein is involved',
            'The ion moves through an aquaporin',
            'This is facilitated diffusion',
            'No energy is needed because ions are small',
          ],
          answer: 0,
          explanations: [
            'Correct. Moving against a gradient is active transport: energy plus a transport protein.',
            'Incorrect. Aquaporins carry water, and only passively.',
            'Incorrect. Facilitated diffusion only moves substances down their gradient.',
            'Incorrect. Size doesn\'t matter here; going against the gradient always costs energy.',
          ],
        },
      ],
      revisit:
        'Down the gradient = passive (simple or facilitated, free). Up the gradient = active (ATP + protein). Big loads in or out = endocytosis ' +
        'or exocytosis (vesicles, energy). Ions and big polar molecules always need a protein.',
    },
    {
      id: '2.7',
      ced: '2.7.A, 2.7.B',
      title: 'Tonicity and Osmoregulation',
      minutes: 8,
      summary:
        'Water moves by osmosis from hypotonic to hypertonic: from lower solute concentration (higher water potential) to higher solute ' +
        'concentration (lower water potential). Animal cells swell or shrivel; plant cells are held firm by their walls when water comes in. ' +
        'Water potential Ψ = Ψp + Ψs, with solute potential Ψs = −iCRT.',
      body: `### Comparing two solutions
Compared with the inside of a cell, the outside solution can be:
- **Hypotonic**: lower solute concentration → water moves **into** the cell.
- **Hypertonic**: higher solute concentration → water moves **out of** the cell.
- **Isotonic**: equal → no net movement.

**Water follows solute**: it moves toward the side with more dissolved solute, from hypotonic to hypertonic.

| Outside solution | Animal cell | Plant cell |
|---|---|---|
| Hypotonic | Swells, may burst (lysis) | **Turgid** (firm, healthy): the wall pushes back |
| Isotonic | Normal | **Flaccid** (limp) |
| Hypertonic | Shrivels (crenation) | **Plasmolyzed**: membrane pulls away from the wall |

### Water potential
Water moves from **higher** water potential (Ψ) to **lower**. On the AP equation sheet:
$$\\Psi = \\Psi_P + \\Psi_S \\qquad \\Psi_S = -iCRT$$
- $\\Psi_P$: pressure potential (0 in an open beaker; positive inside a turgid plant cell).
- $i$: ionization constant (1 for sucrose, 2 for NaCl).
- $C$: molar concentration. $R = 0.0831$ L·bar/(mol·K). $T$: temperature in kelvin (°C + 273).

Adding solute makes $\\Psi_S$ **more negative**, which lowers water potential, so water moves toward it.

${steps({
  title: 'Find the solute potential of 0.1 M sucrose at 22 °C',
  steps: [
    { title: 'List the values', body: 'i = 1 (sucrose doesn\'t ionize), C = 0.1 mol/L, R = 0.0831 L·bar/(mol·K), T = 22 + 273 = 295 K.' },
    { title: 'Multiply', body: 'Ψs = −(1)(0.1)(0.0831)(295) = −2.45 bars (to 3 significant figures).' },
  ],
  answer: 'Ψs ≈ −2.45 bars. The same concentration of NaCl (i = 2) would be about −4.90 bars.',
})}

### Osmoregulation
Organisms constantly move water and solutes to keep their internal balance: freshwater protists pump out excess water with contractile vacuoles, and plant cells use their central vacuole and wall to stay turgid.`,
      blocks: [{ type: 'sim', sim: 'tonicity' }],
      precheck: {
        question: 'A red blood cell is placed in a hypertonic solution. What happens?',
        choices: ['It loses water and shrivels', 'It gains water and swells', 'Nothing; water can\'t cross its membrane', 'It gains salt and bursts'],
        answer: 0,
        explanations: [
          'Correct. Hypertonic outside means more solute outside, so water leaves the cell.',
          'Incorrect. That happens in a hypotonic solution.',
          'Incorrect. Water crosses membranes, especially through aquaporins.',
          'Incorrect. The question is about water movement by osmosis; the cell shrinks.',
        ],
      },
      checkpoints: [
        {
          question: 'A plant cell with a water potential of −0.5 MPa is placed in a solution with a water potential of −0.8 MPa. What happens?',
          choices: [
            'Water moves out of the cell',
            'Water moves into the cell',
            'There is no net movement of water',
            'Solute moves into the cell until the potentials match',
          ],
          answer: 0,
          explanations: [
            'Correct. Water moves from higher Ψ (−0.5) to lower Ψ (−0.8), so it leaves the cell.',
            'Incorrect. −0.8 is lower than −0.5; water moves toward the lower value, outside.',
            'Incorrect. The potentials differ, so there is net movement.',
            'Incorrect. Osmosis is the movement of water across the membrane, not solute.',
          ],
        },
        {
          question: 'What is the solute potential of 0.2 M NaCl (i = 2) at 27 °C? Use R = 0.0831 L·bar/(mol·K).',
          choices: ['−9.97 bars', '−4.99 bars', '+9.97 bars', '−0.449 bars'],
          answer: 0,
          explanations: [
            'Correct. Ψs = −(2)(0.2)(0.0831)(300) = −9.97 bars.',
            'Incorrect. That uses i = 1; NaCl splits into two ions, so i = 2.',
            'Incorrect. Solute potential is always negative or zero (note the minus sign in −iCRT).',
            'Incorrect. That uses 27 °C instead of converting to kelvin (27 + 273 = 300 K).',
          ],
        },
      ],
      revisit:
        'Water follows solute: hypotonic → hypertonic, higher Ψ → lower Ψ. Animal cells burst or shrivel; plant cells go turgid or plasmolyzed. ' +
        'Ψs = −iCRT with T in kelvin; more solute = more negative Ψ.',
    },
    {
      id: '2.8',
      ced: '2.8.A',
      title: 'Mechanisms of Transport',
      minutes: 4,
      summary:
        'Active transport uses metabolic energy, usually ATP, and membrane proteins to build and maintain electrochemical gradients. ' +
        'The Na⁺/K⁺ pump (an ATPase) pumps 3 Na⁺ out and 2 K⁺ in for each ATP, which helps maintain the membrane potential.',
      body: `### Paying to go uphill
Holding a gradient steady takes constant work, because ions leak back down through channels. **Active transport** uses **metabolic energy (ATP)** and **membrane proteins** to keep pumping them back.

### The sodium-potassium pump
The **Na⁺/K⁺ pump** is an **ATPase**: it splits ATP and uses the energy to change shape.
1. It binds **3 Na⁺** from inside the cell.
2. ATP transfers a phosphate to the pump, which changes shape and releases the Na⁺ **outside**.
3. It binds **2 K⁺** from outside, changes back, and releases them **inside**.

Net effect: more Na⁺ outside, more K⁺ inside, and a charge difference across the membrane (**membrane potential**), because more positive charge leaves than enters. Nerve and muscle cells depend on this gradient.

If ATP runs out, the pump stops and the gradients slowly run down as ions leak through channels.`,
      blocks: [],
      precheck: {
        question: 'For each ATP it uses, the sodium-potassium pump moves:',
        choices: ['3 Na⁺ out and 2 K⁺ in', '2 Na⁺ out and 3 K⁺ in', '3 Na⁺ in and 2 K⁺ out', '1 Na⁺ out and 1 K⁺ in'],
        answer: 0,
        explanations: [
          'Correct. Three sodium out, two potassium in, which leaves the inside more negative.',
          'Incorrect. The numbers are reversed.',
          'Incorrect. Sodium is pumped out and potassium in, not the other way around.',
          'Incorrect. The pump moves 3 Na⁺ and 2 K⁺ per cycle.',
        ],
      },
      checkpoints: [
        {
          question: 'A poison stops a cell from making ATP. What happens to its Na⁺ and K⁺ gradients?',
          choices: [
            'The pump stops, and the gradients gradually run down as ions leak through channels',
            'The gradients become steeper',
            'Nothing changes, because the gradients are maintained by diffusion',
            'Water stops moving by osmosis',
          ],
          answer: 0,
          explanations: [
            'Correct. Without ATP the active pump stops, and passive leakage slowly erases the gradients.',
            'Incorrect. Building a gradient needs energy; without ATP it can only shrink.',
            'Incorrect. Diffusion erases gradients; maintaining them takes active transport.',
            'Incorrect. Osmosis is passive and doesn\'t need ATP.',
          ],
        },
        {
          question: 'Which of these requires the cell to spend metabolic energy?',
          choices: [
            'Releasing a hormone by exocytosis',
            'O₂ diffusing into the cell',
            'Water entering through aquaporins',
            'K⁺ leaking out through an open channel',
          ],
          answer: 0,
          explanations: [
            'Correct. Exocytosis moves material in vesicles and requires energy.',
            'Incorrect. O₂ diffuses passively through the bilayer.',
            'Incorrect. Water moves through aquaporins passively, by osmosis.',
            'Incorrect. Moving down its gradient through a channel is facilitated diffusion, which is passive.',
          ],
        },
      ],
      revisit:
        'Gradients leak, so cells keep paying ATP to maintain them. Na⁺/K⁺ ATPase: 3 Na⁺ out, 2 K⁺ in per ATP → membrane potential. ' +
        'No ATP → pump stops → gradients run down.',
    },
    {
      id: '2.9–2.10',
      ced: '2.9.A, 2.9.B, 2.10.A',
      title: 'Compartmentalization and Its Origins',
      minutes: 5,
      summary:
        'Internal membranes split eukaryotic cells into compartments, which keeps competing reactions apart and adds surface area for reactions. ' +
        'Mitochondria and chloroplasts evolved from free-living prokaryotes by endosymbiosis. Prokaryotes lack membrane-bound organelles but ' +
        'still have specialized regions.',
      body: `### Why compartments help
Membranes and membrane-bound organelles **compartmentalize** eukaryotic cells:
- They **separate reactions that would interfere** with each other: digestive enzymes stay inside lysosomes instead of digesting the cell.
- They **increase surface area** where membrane-bound reactions happen (the folded inner membrane of mitochondria, the ER's huge membrane network).

### Prokaryotes vs eukaryotes
- **Prokaryotes** (bacteria, archaea) usually lack internal membrane-bound organelles, but still have **specialized regions**, such as the nucleoid where DNA sits.
- **Eukaryotes** keep internal membranes that partition the cell into specialized regions.

### Endosymbiosis
**Mitochondria and chloroplasts evolved from once free-living prokaryotes** that were engulfed by an ancestral cell and became permanent partners. Evidence the exam expects you to use:
- Both have **double membranes** (the inner from the original prokaryote).
- Both have their own **circular DNA**, like bacteria.
- Both have **ribosomes** that resemble bacterial ribosomes.
- Both **divide on their own** by a process like binary fission.`,
      blocks: [],
      precheck: {
        question: 'According to endosymbiotic theory, mitochondria and chloroplasts came from:',
        choices: [
          'Free-living prokaryotes that were engulfed by an ancestral cell',
          'Folds of the plasma membrane that pinched off',
          'Pieces of the nucleus',
          'Viruses that infected early cells',
        ],
        answer: 0,
        explanations: [
          'Correct. They were once independent prokaryotes living inside a host cell.',
          'Incorrect. That idea is used for the origin of the endomembrane system, not mitochondria and chloroplasts.',
          'Incorrect. They have their own DNA, separate from the nucleus.',
          'Incorrect. Viruses are not cells and cannot become organelles that make ATP.',
        ],
      },
      checkpoints: [
        {
          question: 'Which observation best supports the endosymbiotic origin of mitochondria?',
          choices: [
            'Mitochondria have their own circular DNA and ribosomes similar to those of bacteria',
            'Mitochondria are found in nearly all eukaryotic cells',
            'Mitochondria produce ATP',
            'Mitochondria are surrounded by cytoplasm',
          ],
          answer: 0,
          explanations: [
            'Correct. Bacterial-style DNA and ribosomes point to a bacterial ancestor.',
            'Incorrect. Being widespread does not show where they came from.',
            'Incorrect. Making ATP is their function, not evidence of their origin.',
            'Incorrect. Every organelle is surrounded by cytoplasm.',
          ],
        },
        {
          question: 'How does compartmentalization benefit eukaryotic cells?',
          choices: [
            'It keeps incompatible reactions apart and increases membrane surface area for reactions',
            'It makes eukaryotic cells smaller than prokaryotic cells',
            'It removes the need for enzymes',
            'It allows eukaryotes to live without ribosomes',
          ],
          answer: 0,
          explanations: [
            'Correct. Those are the two benefits the CED names.',
            'Incorrect. Eukaryotic cells are usually larger than prokaryotic cells.',
            'Incorrect. Compartments hold enzymes; they don\'t replace them.',
            'Incorrect. All cells need ribosomes to make proteins.',
          ],
        },
      ],
      revisit:
        'Compartments: separate competing reactions + add membrane surface. Endosymbiosis: mitochondria and chloroplasts were prokaryotes ' +
        '(double membrane, circular DNA, bacteria-like ribosomes, divide on their own). Prokaryotes: no membrane-bound organelles, but specialized regions.',
    },
  ],
};

export default pack;
