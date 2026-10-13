/**
 * AP Physics 2 Unit 9: Thermodynamics — study pack.
 *
 * AP Physics 2 numbers its units on from Physics 1, so its first unit is 9.
 * Written against the AP Physics 2: Algebra-Based CED (effective Fall 2024,
 * topics 9.1–9.6) and its boundary statements: the Maxwell–Boltzmann
 * distribution is qualitative only, specific heat is independent of
 * temperature, and the second law is qualitative only. Equations use the
 * course's equation-sheet forms, with W the work done ON the system:
 * ΔU = Q + W and W = −PΔV.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-physics-2/unit-9',
  subject: 'AP Physics 2: Algebra-Based',
  unit: 'Unit 9: Thermodynamics',
  examWeight: '15–18% of the exam',
  intro:
    'Physics 2 starts with a gas: trillions of atoms colliding at random, yet described by a few numbers (pressure, volume, ' +
    'temperature). This unit connects those numbers to atomic motion, then follows energy as it moves by heating and by work ' +
    '(the first law) and as it spreads out (the second law).',
  sections: [
    {
      id: '9.1–9.2',
      ced: '9.1.A–9.2.A',
      title: 'Kinetic Theory and the Ideal Gas Law',
      minutes: 8,
      summary:
        'Gas pressure comes from atoms colliding with surfaces; temperature measures the atoms\' average kinetic energy. An ideal gas ' +
        '(random motion, tiny atoms, elastic collisions, no other forces) obeys PV = nRT = Nk_BT, and a P–T graph extrapolates to zero ' +
        'pressure at absolute zero.',
      body: String.raw`### Pressure from collisions
Atoms collide with each other and with the walls. Each collision with a wall pushes on it (momentum changes), and pressure is the total perpendicular force per area:
$$P = \frac{F_\perp}{A}$$
Pressure exists throughout the gas, not just at the walls.

### Temperature from motion
Temperature measures the **average kinetic energy** of the atoms:
$$K_{avg} = \tfrac{3}{2}k_B T = \tfrac{1}{2}m v_{rms}^2$$
At a given temperature the atoms have a **spread** of speeds (the Maxwell–Boltzmann distribution): heat the gas and the distribution shifts to higher speeds and spreads out. You need to know that shape qualitatively, not its formula.

### The ideal gas model
Assumes: random velocities, atoms' volume negligible, **elastic** collisions, and no forces except during collisions.
$$PV = nRT = Nk_BT$$
($n$ in moles with $R = 8.31$ J/(mol·K); $N$ atoms with $k_B = 1.38 \times 10^{-23}$ J/K; $T$ always in **kelvin**.)

Graph pressure against temperature at constant volume and extend the line back: it reaches **zero pressure at 0 K** (−273 °C), absolute zero.

${steps({
  title: 'A sealed, rigid tank of gas at 300 K and 200 kPa is heated to 450 K. Find the new pressure.',
  steps: [
    { title: 'What stays fixed', body: 'Rigid and sealed: $V$ and $n$ constant, so $P/T$ is constant.' },
    { title: 'Ratio', body: '$P_2 = P_1 \\dfrac{T_2}{T_1} = 200 \\times \\dfrac{450}{300}$' },
    { title: 'Answer', body: '$P_2 = 300$ kPa' },
  ],
  answer: '300 kPa',
})}`,
      blocks: [],
      precheck: {
        question: 'The temperature of an ideal gas is a measure of its atoms\':',
        choices: ['Average kinetic energy', 'Total potential energy', 'Number of collisions with the walls only', 'Mass'],
        answer: 0,
        explanations: [
          'Correct. $K_{avg} = \\tfrac32 k_B T$.',
          'Incorrect. Ideal gas atoms have no internal potential energy.',
          'Incorrect. Wall collisions explain pressure, not temperature.',
          'Incorrect. Heating a gas doesn\'t change its atoms\' mass.',
        ],
      },
      checkpoints: [
        {
          question: 'The absolute temperature of an ideal gas is doubled. By what factor does the atoms\' rms speed change?',
          choices: ['$\\sqrt{2}$', '2', '4', '$\\tfrac12$'],
          answer: 0,
          explanations: [
            'Correct. $K_{avg} \\propto T$ and $K \\propto v_{rms}^2$, so $v_{rms} \\propto \\sqrt{T}$.',
            'Incorrect. Doubling T doubles the kinetic energy, not the speed.',
            'Incorrect. Four times the speed would need 16 times the temperature.',
            'Incorrect. Heating speeds the atoms up.',
          ],
        },
        {
          question: 'Gas in a cylinder is compressed to half its volume while its temperature is held constant. The pressure:',
          choices: ['Doubles', 'Halves', 'Stays the same', 'Quadruples'],
          answer: 0,
          explanations: [
            'Correct. With $n$ and $T$ constant, $PV$ is constant, so halving $V$ doubles $P$.',
            'Incorrect. Pressure and volume change in opposite directions here.',
            'Incorrect. Atoms hit the walls more often in a smaller space.',
            'Incorrect. $P \\propto 1/V$, not $1/V^2$.',
          ],
        },
        {
          question: 'A graph of pressure vs. temperature (in °C) for a gas at constant volume is a straight line. Extended to zero pressure, it crosses the temperature axis at about:',
          choices: ['−273 °C', '0 °C', '−100 °C', '273 °C'],
          answer: 0,
          explanations: [
            'Correct. Zero pressure extrapolates to absolute zero, 0 K = −273 °C.',
            'Incorrect. Gases still have pressure at the freezing point of water.',
            'Incorrect. The extrapolation always reaches absolute zero, about −273 °C.',
            'Incorrect. That is 273 above zero; absolute zero is below.',
          ],
        },
      ],
      revisit:
        'Pressure = force per area from collisions. $K_{avg} = \\tfrac32 k_BT$, so $v_{rms} \\propto \\sqrt T$. $PV = nRT = Nk_BT$ with T in kelvin; ' +
        'P–T at constant V extrapolates to 0 at absolute zero.',
    },
    {
      id: '9.3',
      ced: '9.3.A',
      title: 'Thermal Energy Transfer and Equilibrium',
      minutes: 4,
      summary:
        'Systems in thermal contact exchange energy by conduction, convection and radiation, spontaneously from higher to lower temperature, ' +
        'until they reach thermal equilibrium: the same temperature and no net energy transfer.',
      body: String.raw`### Heating and cooling
- **Heating**: energy transferred **into** a system by thermal processes; **cooling**: energy transferred **out**.
- Three thermal processes: **conduction** (contact, atom-to-atom collisions), **convection** (bulk movement of a fluid), **radiation** (electromagnetic waves, no contact needed).

### Which way does energy go?
Spontaneously from the **higher-temperature** system to the **lower-temperature** one. In collisions between atoms of the two systems, energy usually passes from the faster (higher-energy) atoms to the slower ones. After many collisions, the most probable state has **both systems at the same temperature**.

**Thermal equilibrium**: no **net** energy transfer between systems in contact (energy still moves both ways, equally).

Temperature is not energy: a bathtub of warm water holds far more thermal energy than a cup of boiling water, but energy flows from the cup to the tub if you pour it in.`,
      blocks: [],
      precheck: {
        question: 'Two blocks in contact reach thermal equilibrium. Which must be true?',
        choices: [
          'They are at the same temperature',
          'They have the same internal energy',
          'They have the same mass',
          'No atoms are colliding at the boundary',
        ],
        answer: 0,
        explanations: [
          'Correct. Equilibrium means equal temperatures, so no net energy transfer.',
          'Incorrect. Bigger or different blocks can store different energy at the same temperature.',
          'Incorrect. Mass doesn\'t need to match.',
          'Incorrect. Collisions continue; they just transfer no net energy.',
        ],
      },
      checkpoints: [
        {
          question: 'A metal spoon placed in hot soup gets hot along its handle. The main process transferring energy along the spoon is:',
          choices: ['Conduction', 'Convection', 'Radiation', 'Evaporation'],
          answer: 0,
          explanations: [
            'Correct. Energy passes through the solid by atom-to-atom collisions.',
            'Incorrect. Convection needs bulk flow of a fluid.',
            'Incorrect. Radiation happens, but contact conduction dominates along the spoon.',
            'Incorrect. Evaporation isn\'t how energy moves through the metal.',
          ],
        },
        {
          question: 'A 1 kg block at 80 °C touches a 3 kg block of the same material at 20 °C, isolated from everything else. In which direction does net energy flow?',
          choices: [
            'From the 80 °C block to the 20 °C block',
            'From the 3 kg block to the 1 kg block, because it has more energy',
            'No net flow, because the bigger block balances the hotter one',
            'Back and forth until the masses are equal',
          ],
          answer: 0,
          explanations: [
            'Correct. Net energy always flows spontaneously from higher to lower temperature.',
            'Incorrect. Direction is set by temperature, not total energy.',
            'Incorrect. Different temperatures always mean a net flow.',
            'Incorrect. Masses don\'t change; temperatures do, until they are equal.',
          ],
        },
      ],
      revisit:
        'Conduction, convection, radiation. Net energy flows from hot to cold until temperatures match (thermal equilibrium: no net transfer). ' +
        'Temperature, not total energy, sets the direction.',
    },
    {
      id: '9.4',
      ced: '9.4.A–9.4.B',
      title: 'The First Law of Thermodynamics',
      minutes: 10,
      summary:
        'An ideal monatomic gas\'s internal energy is the atoms\' kinetic energy, U = (3/2)nRT. The first law, ΔU = Q + W, accounts for ' +
        'energy added by heating (Q) and work done on the gas (W = −PΔV). On a PV diagram, |W| is the area under the path; special processes ' +
        'are isobaric, isovolumetric, isothermal and adiabatic.',
      body: String.raw`### Internal energy
A system's internal energy is the kinetic energy of its parts plus the potential energy of their arrangement. Ideal gas atoms don't interact, so for a **monatomic** ideal gas it's all kinetic:
$$U = \tfrac32 nRT = \tfrac32 Nk_BT$$
Internal energy depends only on **temperature** (for a fixed amount of gas).

### The first law
$$\Delta U = Q + W$$
- $Q$: energy **added by heating** (negative if the gas is cooled).
- $W$: work done **on** the gas: $W = -P\Delta V$. Compressing (ΔV < 0) does positive work on it; when it expands, it does work on its surroundings and $W$ is negative.

### PV diagrams
- **Area under the path** on a P–V graph = $|W|$.
- Lines of constant temperature are **isotherms**.

| Process | Held constant | Consequence |
|---|---|---|
| **Isobaric** | Pressure | $W = -P\Delta V$ |
| **Isovolumetric** (isochoric) | Volume | $W = 0$, so $\Delta U = Q$ |
| **Isothermal** | Temperature | $\Delta U = 0$, so $Q = -W$ |
| **Adiabatic** | No heat: $Q = 0$ | $\Delta U = W$ (compress → hotter) |

${steps({
  title: 'A gas at a constant 150 kPa expands from 2.0 L to 5.0 L while absorbing 900 J of heat. Find W and ΔU.',
  steps: [
    { title: 'Work on the gas', body: '$W = -P\\Delta V = -(150 \\times 10^3\\ \\text{Pa})(3.0 \\times 10^{-3}\\ \\text{m}^3) = -450$ J' },
    { title: 'First law', body: '$\\Delta U = Q + W = 900 + (-450) = 450$ J' },
    { title: 'Interpret', body: 'Half the heat went into raising the temperature; half left as work the gas did pushing outward.' },
  ],
  answer: 'W = −450 J, ΔU = +450 J',
})}`,
      blocks: [{ type: 'sim', sim: 'pv-process' }],
      precheck: {
        question: 'Using ΔU = Q + W (W is work done on the gas), a gas absorbs 300 J of heat and does 100 J of work on its surroundings. Find ΔU.',
        choices: ['+200 J', '+400 J', '−200 J', '+300 J'],
        answer: 0,
        explanations: [
          'Correct. Q = +300 J; the gas does 100 J of work, so W on it is −100 J; ΔU = 300 − 100 = 200 J.',
          'Incorrect. Work done BY the gas is negative W in this sign convention.',
          'Incorrect. More energy came in than went out.',
          'Incorrect. That ignores the work.',
        ],
      },
      checkpoints: [
        {
          question: 'In an isothermal expansion of an ideal gas, which is true?',
          choices: [
            'ΔU = 0, and the heat added equals the work done by the gas',
            'Q = 0, so the gas cools',
            'W = 0, because the temperature doesn\'t change',
            'ΔU equals the heat added',
          ],
          answer: 0,
          explanations: [
            'Correct. Constant temperature means constant U, so Q = −W: heat in equals work out.',
            'Incorrect. That is adiabatic.',
            'Incorrect. The volume changes, so work is done.',
            'Incorrect. ΔU = Q only when no work is done (isovolumetric).',
          ],
        },
        {
          question: 'A gas is compressed adiabatically. What happens to its temperature?',
          choices: [
            'It increases, because work is done on the gas with no heat leaving',
            'It decreases, because the volume decreases',
            'It stays the same, because Q = 0',
            'It depends on the pressure, not on the process',
          ],
          answer: 0,
          explanations: [
            'Correct. Q = 0 and W > 0, so ΔU > 0: the gas heats up (as in a bike pump).',
            'Incorrect. Compression does positive work on the gas.',
            'Incorrect. Q = 0 means ΔU = W, not ΔU = 0.',
            'Incorrect. The first law fixes the sign of ΔU here.',
          ],
        },
        {
          question: 'On a PV diagram, a gas expands at constant pressure 200 kPa from 1.0 L to 3.0 L. What is the magnitude of the work done?',
          choices: ['400 J', '600 J', '200 J', '0.4 J'],
          answer: 0,
          explanations: [
            'Correct. Area = PΔV = (200 × 10³ Pa)(2.0 × 10⁻³ m³) = 400 J.',
            'Incorrect. Use the change in volume, 2.0 L, not the final volume.',
            'Incorrect. Check the units: 1 kPa × 1 L = 1 J, and 200 × 2 = 400.',
            'Incorrect. 1 L = 10⁻³ m³ and 1 kPa = 10³ Pa, so the factors cancel.',
          ],
        },
      ],
      revisit:
        '$U = \\tfrac32 nRT$ (monatomic). $\\Delta U = Q + W$, $W = -P\\Delta V$ (work on the gas). |W| = area under the PV path. Isobaric P const; ' +
        'isovolumetric W = 0; isothermal ΔU = 0; adiabatic Q = 0.',
    },
    {
      id: '9.5',
      ced: '9.5.A–9.5.B',
      title: 'Specific Heat and Thermal Conductivity',
      minutes: 6,
      summary:
        'Q = mcΔT gives the energy to change a material\'s temperature, with specific heat c a property of the material. Conduction ' +
        'rate Q/Δt = kAΔT/L depends on the material\'s conductivity k, its area and thickness, and the temperature difference.',
      body: String.raw`### Specific heat
$$Q = mc\Delta T$$
The **specific heat** $c$ (J/(kg·K)) is a property of the material that depends on how its atoms are arranged and interact. Water's is unusually high (about 4,190 J/(kg·K)), so it heats and cools slowly. On the exam, $c$ does not depend on temperature.

${steps({
  title: 'How much energy raises 2.0 kg of water from 20 °C to 70 °C? (c = 4,190 J/(kg·K))',
  steps: [
    { title: 'Temperature change', body: '$\\Delta T = 50$ K (a change in °C equals a change in K)' },
    { title: 'Q = mcΔT', body: '$Q = (2.0)(4190)(50) = 4.19 \\times 10^5$ J' },
  ],
  answer: 'About 419,000 J',
})}

### Conduction rate
$$\frac{Q}{\Delta t} = \frac{kA\,\Delta T}{L}$$
The rate grows with the **thermal conductivity** $k$ (a material property), the **area** $A$ and the **temperature difference** $\Delta T$, and falls with the **thickness** $L$. That's why thick, low-$k$ insulation keeps a house warm.`,
      blocks: [],
      precheck: {
        question: 'Equal masses of water and sand absorb the same energy from the sun. Water has the higher specific heat. Which warms more?',
        choices: ['The sand', 'The water', 'They warm equally', 'It depends on their volumes'],
        answer: 0,
        explanations: [
          'Correct. $\\Delta T = Q/(mc)$: smaller c means a bigger temperature change.',
          'Incorrect. High specific heat means a smaller temperature change for the same energy.',
          'Incorrect. Different specific heats give different temperature changes.',
          'Incorrect. Mass and specific heat set the change; the masses are equal here.',
        ],
      },
      checkpoints: [
        {
          question: 'A window\'s glass is replaced with glass of the same kind but twice as thick. The rate of energy conduction through it (same temperatures) becomes:',
          choices: ['Half as large', 'Twice as large', 'Four times as large', 'Unchanged'],
          answer: 0,
          explanations: [
            'Correct. Rate ∝ 1/L, so doubling the thickness halves it.',
            'Incorrect. Thicker material conducts more slowly.',
            'Incorrect. The rate depends on L to the first power.',
            'Incorrect. Thickness appears in the conduction equation.',
          ],
        },
        {
          question: 'A 0.50 kg block absorbs 9,000 J and warms by 20 K. What is its specific heat?',
          choices: ['900 J/(kg·K)', '450 J/(kg·K)', '1,800 J/(kg·K)', '90,000 J/(kg·K)'],
          answer: 0,
          explanations: [
            'Correct. $c = \\dfrac{Q}{m\\Delta T} = \\dfrac{9000}{(0.50)(20)} = 900$ J/(kg·K), close to aluminum.',
            'Incorrect. That multiplies by 0.5 instead of dividing by it.',
            'Incorrect. Divide by both the mass and the temperature change.',
            'Incorrect. Check the arithmetic: (0.50)(20) = 10.',
          ],
        },
      ],
      revisit:
        '$Q = mc\\Delta T$; c is a material property (temperature-independent on the exam). Conduction: $Q/\\Delta t = kA\\Delta T/L$, more with ' +
        'larger k, A, ΔT; less with thickness L.',
    },
    {
      id: '9.6',
      ced: '9.6.A',
      title: 'Entropy and the Second Law of Thermodynamics',
      minutes: 4,
      summary:
        'Entropy describes how spread out energy is and how much is unavailable to do work. The total entropy of an isolated system never ' +
        'decreases, and isolated systems move toward equilibrium, where entropy is maximum. A closed system\'s entropy can decrease if energy ' +
        'leaves it. Qualitative only.',
      body: String.raw`### Energy spreads out
**Entropy** can be described as the tendency of energy to **spread out**, or the part of a system's energy that is **unavailable to do work**. Localized energy (a hot spot, a compressed gas) tends to disperse.

### The second law
- The total entropy of an **isolated** system **never decreases**. It stays constant only if every process is **reversible** (an ideal that real processes never reach).
- Isolated systems move **spontaneously toward thermodynamic equilibrium**, where entropy is **maximum**.
- Entropy is a **state function**: it depends only on the current state, not on how the system got there.
- A **closed** system (energy can cross its boundary) **can** decrease in entropy, as long as energy leaves it, raising the entropy of the surroundings by at least as much. A refrigerator's inside gets more ordered; the kitchen pays for it.

This is the deeper reason heat flows from hot to cold on its own and never the reverse.

The exam treats the second law **qualitatively** only.`,
      blocks: [],
      precheck: {
        question: 'For an isolated system, the second law of thermodynamics says the total entropy:',
        choices: ['Never decreases', 'Always stays constant', 'Always decreases', 'Depends only on the temperature'],
        answer: 0,
        explanations: [
          'Correct. It increases, or stays constant for an ideal reversible process.',
          'Incorrect. Constant only in the reversible ideal; real processes increase it.',
          'Incorrect. Decreasing entropy in an isolated system would violate the second law.',
          'Incorrect. Entropy depends on the whole state, not only temperature.',
        ],
      },
      checkpoints: [
        {
          question: 'Water in a freezer turns to ice, a more ordered state. How is this consistent with the second law?',
          choices: [
            'The water is not isolated: the freezer moves energy out of it, increasing the entropy of the surroundings by more',
            'The second law doesn\'t apply to water',
            'Freezing happens spontaneously in isolated systems at room temperature',
            'Entropy depends on how the ice was made',
          ],
          answer: 0,
          explanations: [
            'Correct. A closed system can lose entropy if energy leaves; the total for water plus surroundings still increases.',
            'Incorrect. The second law applies to all systems.',
            'Incorrect. Isolated water at room temperature doesn\'t freeze on its own.',
            'Incorrect. Entropy is a state function, independent of the path.',
          ],
        },
        {
          question: 'A drop of food coloring spreads evenly through a glass of still water. This is an example of:',
          choices: [
            'An isolated system moving toward equilibrium and higher entropy',
            'Entropy decreasing spontaneously',
            'The first law being violated',
            'A reversible process',
          ],
          answer: 0,
          explanations: [
            'Correct. Concentrated stuff spreads out on its own; the reverse never happens spontaneously.',
            'Incorrect. Spreading out increases entropy.',
            'Incorrect. Energy is conserved; nothing here breaks the first law.',
            'Incorrect. The dye never un-mixes on its own, so it is irreversible.',
          ],
        },
      ],
      revisit:
        'Entropy: energy spreading out, unavailable for work; a state function. Isolated systems: entropy never decreases and heads to ' +
        'equilibrium (max entropy). Closed systems can lose entropy if energy leaves. Qualitative only.',
    },
  ],
};

export default pack;
