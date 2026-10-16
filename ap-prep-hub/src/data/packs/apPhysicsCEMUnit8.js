/**
 * AP Physics C: Electricity and Magnetism Unit 8: Electric Charges, Fields,
 * and Gauss's Law — study pack.
 *
 * Physics C: E&M numbers its units on from Mechanics, so its first unit is 8.
 * Written against the AP Physics C: E&M CED (effective Fall 2024, topics
 * 8.1–8.6). Follows its boundary statements: Coulomb's-law force sums for four
 * or fewer charges (more only with high symmetry); calculus field derivations
 * only for the listed distributions (long wire or cylinder, ring on its axis,
 * semicircular arc at its center, finite line on its axis or perpendicular
 * bisector); Gauss's law for spherical, cylindrical and planar symmetry.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-physics-c-electricity-and-magnetism/unit-8',
  subject: 'AP Physics C: Electricity and Magnetism',
  unit: 'Unit 8: Electric Charges, Fields, and Gauss’s Law',
  examWeight: '15–25% of the exam',
  intro:
    'Electricity starts with charge and the forces between charges. This unit turns those forces into fields, builds the fields of ' +
    'continuous charge distributions with integrals, and then trades the integrals for symmetry using Gauss\'s law, the first of ' +
    'Maxwell\'s equations.',
  sections: [
    {
      id: '8.1',
      ced: '8.1.A–8.1.C',
      title: 'Electric Charge and Electric Force',
      minutes: 7,
      summary:
        'Charge is a scalar, positive or negative, in multiples of e. Coulomb\'s law: the force between point charges is proportional to each ' +
        'charge and to 1/r², along the line between them; like charges repel, opposites attract. Electric forces dwarf gravity between ' +
        'particles. Permittivity measures how a material polarizes; conductors let charge move, insulators don\'t.',
      body: String.raw`### Charge
- A scalar, **positive or negative**. The elementary charge $e = 1.6 \times 10^{-19}$ C is the smallest unit: electron $-e$, proton $+e$, neutron 0.
- **Point charge**: an object small enough that its size doesn't matter.

### Coulomb's law

$$|\vec{F}_E| = \frac{1}{4\pi\varepsilon_0}\frac{|q_1q_2|}{r^2} = k\frac{|q_1q_2|}{r^2}$$

$$k \approx 9.0 \times 10^9\ \text{N}\cdot\text{m}^2/\text{C}^2$$

Directed **along the line** between the charges: **like charges repel, opposite charges attract**. With several charges, add the force vectors (the exam uses up to four, or more with high symmetry).

### Electric vs gravitational
Gravity is always attractive; electric forces can attract or repel. Between two protons the electric force is about $10^{36}$ times the gravitational force, but at large scales matter is nearly neutral, so gravity wins for planets and stars. Everyday contact forces (normal, friction, tension) are electric forces between huge numbers of particles.

### Permittivity, conductors, insulators
- **Permittivity** measures how much a material **polarizes** in an electric field (its electrons shift, separating + and −). Free space has $\varepsilon_0 = 8.85 \times 10^{-12}$ C²/(N·m²); materials have different values.
- **Conductors**: charge carriers move easily. **Insulators**: they don't.

${steps({
  title: 'Charges of +2.0 μC and −3.0 μC are 0.30 m apart. Find the force on each.',
  steps: [
    { title: 'Coulomb\'s law', body: '$F = \\dfrac{(9.0\\times10^9)(2.0\\times10^{-6})(3.0\\times10^{-6})}{(0.30)^2}$' },
    { title: 'Compute', body: '$F = \\dfrac{0.054}{0.090} = 0.60$ N' },
    { title: 'Direction', body: 'Opposite signs: each is pulled toward the other (attractive), equal and opposite (Newton\'s third law).' },
  ],
  answer: '0.60 N, attractive',
})}`,
      blocks: [],
      precheck: {
        question: 'If the distance between two point charges is tripled, the electric force between them becomes:',
        choices: ['1/9 as large', '1/3 as large', '3 times as large', '9 times as large'],
        answer: 0,
        explanations: [
          'Correct. $F \\propto 1/r^2$, so tripling r divides F by 9.',
          'Incorrect. The dependence is on $r^2$, not r.',
          'Incorrect. Greater distance weakens the force.',
          'Incorrect. That would be for one-third the distance.',
        ],
      },
      checkpoints: [
        {
          question: 'A neutral object has more electrons than protons after being rubbed. What is true?',
          choices: [
            'It gained electrons and now has a negative net charge that is a whole multiple of e',
            'It gained protons',
            'Its charge can be any value, such as 0.5e',
            'It is still neutral because charge is conserved',
          ],
          answer: 0,
          explanations: [
            'Correct. Rubbing transfers electrons; net charge comes in multiples of e.',
            'Incorrect. Protons are bound in nuclei; electrons are what move.',
            'Incorrect. e is the smallest indivisible charge.',
            'Incorrect. Charge is conserved overall, but this object gained electrons from the other one.',
          ],
        },
        {
          question: 'Why does gravity, not the electric force, govern the motion of planets, even though the electric force is far stronger?',
          choices: [
            'Large objects are nearly electrically neutral, so their electric forces nearly cancel',
            'Electric forces don\'t act over large distances',
            'Gravity falls off more slowly than 1/r²',
            'Planets have no charged particles',
          ],
          answer: 0,
          explanations: [
            'Correct. Equal numbers of + and − charges leave almost no net electric force, while gravity always adds.',
            'Incorrect. Both forces have infinite range, falling as 1/r².',
            'Incorrect. Both follow 1/r².',
            'Incorrect. Planets are made of atoms full of charges; they just balance.',
          ],
        },
      ],
      revisit:
        '$F = kq_1q_2/r^2$ along the line joining them; like repel, unlike attract; add vectors for several charges. Charge comes in multiples of e. ' +
        'Gravity is weaker but dominates large neutral bodies. Permittivity = how easily a material polarizes.',
    },
    {
      id: '8.2',
      ced: '8.2.A',
      title: 'Conservation of Charge and the Process of Charging',
      minutes: 5,
      summary:
        'A system\'s net charge changes only if charge (usually electrons) is transferred in or out, by friction or contact. Nearby charges can ' +
        'polarize even a neutral object (induced charge separation). Grounding connects an object to a huge neutral reservoir like Earth.',
      body: String.raw`### Charge is conserved
A system's net charge stays constant **unless charge crosses its boundary**. Charging almost always moves **electrons**.

| Method | What happens |
|---|---|
| **Friction** | Rubbing transfers electrons from one material to the other |
| **Contact (conduction)** | Touching a charged object shares its charge |
| **Induction** | A nearby charge pushes or pulls electrons within an object, **separating** charge without touching (polarization). Can happen in a neutral object. |
| **Grounding** | Connecting to Earth, a huge nearly neutral reservoir, lets electrons flow on or off |

### Charging by induction, step by step
1. Bring a negative rod near a neutral metal sphere: electrons in the sphere are pushed to the far side.
2. Ground the far side: those electrons flow to Earth.
3. Remove the ground, **then** the rod: the sphere is left **positive**, opposite to the rod.`,
      blocks: [],
      precheck: {
        question: 'A charged balloon sticks to a neutral wall. Why?',
        choices: [
          'The balloon polarizes the wall, so the nearer opposite charges attract it more strongly than the farther like charges repel it',
          'The wall gains a net charge from the air',
          'Neutral objects attract all charged objects with no explanation needed',
          'Gravity between the balloon and the wall',
        ],
        answer: 0,
        explanations: [
          'Correct. Induced charge separation makes the closer side opposite in sign, and the 1/r² force favors the closer charges.',
          'Incorrect. The wall stays neutral overall; its charges just rearrange.',
          'Incorrect. The attraction comes from polarization.',
          'Incorrect. Gravity between them is far too weak.',
        ],
      },
      checkpoints: [
        {
          question: 'A positively charged rod is brought near a neutral metal sphere, the sphere is grounded, the ground is removed, and then the rod is removed. The sphere ends up:',
          choices: ['Negatively charged', 'Positively charged', 'Neutral', 'With a charge that disappears once the rod leaves'],
          answer: 0,
          explanations: [
            'Correct. Electrons are drawn up from the ground toward the rod; removing the ground traps them.',
            'Incorrect. Induction leaves a charge opposite to the rod\'s.',
            'Incorrect. Grounding changed the sphere\'s net charge.',
            'Incorrect. The ground was disconnected first, so the extra electrons stay.',
          ],
        },
        {
          question: 'Two identical metal spheres carry +6 μC and −2 μC. They touch and separate. What is the charge on each?',
          choices: ['+2 μC', '+4 μC', '+8 μC', '−2 μC'],
          answer: 0,
          explanations: [
            'Correct. Total +4 μC is shared equally by identical spheres: +2 μC each.',
            'Incorrect. That is the total, not each sphere\'s share.',
            'Incorrect. Charges add with their signs: 6 + (−2) = 4.',
            'Incorrect. The total is positive, so each ends up positive.',
          ],
        },
      ],
      revisit:
        'Net charge changes only by transfer (electrons): friction, contact, grounding. Induction separates charge without contact; grounding ' +
        'then lets charge leave, leaving the object opposite to the inducing charge.',
    },
    {
      id: '8.3',
      ced: '8.3.A–8.3.B',
      title: 'Electric Fields',
      minutes: 8,
      summary:
        'The electric field is force per unit test charge, E = F/q. It points away from positive and toward negative charges; fields from ' +
        'several charges add as vectors. In electrostatic equilibrium a conductor\'s excess charge sits on its surface, the field inside is ' +
        'zero, and the field at the surface is perpendicular to it.',
      body: String.raw`### Definition

$$\vec{E} = \frac{\vec{F}_E}{q} \qquad \text{point charge: } |\vec E| = k\frac{|q|}{r^2}$$

measured with a **test charge** small enough not to disturb the field. $\vec{E}$ points **away from positive** and **toward negative** charges; the force on a positive test charge is along $\vec E$, on a negative one opposite to it.

### Representing fields
- **Vector field maps**: arrows at many points (direction and strength).
- **Field line diagrams**: lines start on + and end on −; their **density** shows strength; they never cross.
- **Superposition**: the net field is the **vector sum** of each charge's field.

### Conductors and insulators in equilibrium
| | Conductor | Insulator |
|---|---|---|
| Excess charge | On the **surface** | Throughout and on the surface |
| Field inside | **Zero** | Can be nonzero |
| Field at surface | **Perpendicular** to it | — |

Outside a spherically symmetric charge distribution, the field is the same as a point charge at its center with the same net charge.`,
      blocks: [{ type: 'sim', sim: 'field-map' }],
      precheck: {
        question: 'The electric field at a point is 500 N/C east. What force acts on an electron (charge −1.6 × 10⁻¹⁹ C) placed there?',
        choices: ['8.0 × 10⁻¹⁷ N west', '8.0 × 10⁻¹⁷ N east', '3.1 × 10²¹ N east', '500 N west'],
        answer: 0,
        explanations: [
          'Correct. $F = qE = (1.6\\times10^{-19})(500) = 8.0\\times10^{-17}$ N, opposite to E because the charge is negative.',
          'Incorrect. A negative charge feels a force opposite to the field.',
          'Incorrect. That divides E by the charge instead of multiplying.',
          'Incorrect. 500 N/C is the field, not the force.',
        ],
      },
      checkpoints: [
        {
          question: 'Two charges, +q and +q, are fixed a distance d apart. What is the electric field at the midpoint?',
          choices: ['Zero', '$2kq/(d/2)^2$, toward one charge', '$kq/d^2$', 'It is undefined'],
          answer: 0,
          explanations: [
            'Correct. Equal fields point in opposite directions (each away from its charge) and cancel.',
            'Incorrect. They would add only if the charges had opposite signs.',
            'Incorrect. Each contribution uses distance d/2, and here they cancel anyway.',
            'Incorrect. The field is defined everywhere except at the charges.',
          ],
        },
        {
          question: 'A solid metal sphere carries excess charge Q in electrostatic equilibrium. Which is true?',
          choices: [
            'The charge is on the surface and the field inside the metal is zero',
            'The charge is spread evenly through the volume',
            'The field inside is $kQ/r^2$',
            'The field at the surface is parallel to the surface',
          ],
          answer: 0,
          explanations: [
            'Correct. Charges in a conductor move until the internal field is zero, ending on the surface.',
            'Incorrect. That describes a uniformly charged insulator.',
            'Incorrect. Inside the conductor E = 0; $kQ/r^2$ applies outside.',
            'Incorrect. A parallel component would push charges along the surface; in equilibrium E is perpendicular.',
          ],
        },
      ],
      revisit:
        '$\\vec E = \\vec F/q$; point charge $kq/r^2$, away from +, toward −; add fields as vectors. Conductor in equilibrium: charge on the surface, ' +
        'E = 0 inside, E ⊥ surface. Outside a spherical distribution, it acts like a point charge.',
    },
    {
      id: '8.4',
      ced: '8.4.A',
      title: 'Electric Fields of Charge Distributions',
      minutes: 9,
      summary:
        'For continuous charge, add up the fields of tiny pieces: dE = k dq/r², integrated with superposition, using symmetry to cancel ' +
        'components. The exam limits this to an infinite line or cylinder, a ring on its axis, a semicircular arc at its center and a finite ' +
        'line on its axis or perpendicular bisector.',
      body: String.raw`### Integrate the pieces

$$\vec{E} = \int d\vec{E}, \qquad |d\vec E| = k\frac{dq}{r^2}$$

1. Pick a small piece $dq$ (for a line, $dq = \lambda\,dx$; $\lambda$ = charge per length).
2. Write its $d\vec E$ at the point, with direction.
3. **Use symmetry** to cancel components before integrating.
4. Integrate over the distribution.

${steps({
  title: 'Find E on the axis of a ring of radius R and charge Q, at distance x from its center.',
  steps: [
    { title: 'One piece', body: 'Every $dq$ is the same distance $r = \\sqrt{x^2 + R^2}$ away: $dE = \\dfrac{k\\,dq}{x^2 + R^2}$' },
    { title: 'Symmetry', body: 'Components perpendicular to the axis cancel in pairs. Keep the axial part: multiply by $\\cos\\theta = \\dfrac{x}{\\sqrt{x^2 + R^2}}$' },
    { title: 'Integrate', body: 'Nothing else varies around the ring: $E = \\dfrac{kQx}{(x^2 + R^2)^{3/2}}$, along the axis' },
    { title: 'Check limits', body: 'At $x = 0$, $E = 0$ (symmetry). For $x \\gg R$, $E \\to kQ/x^2$, like a point charge.' },
  ],
  answer: 'E = kQx / (x² + R²)^{3/2}',
})}

### Results worth knowing
| Distribution | Field |
|---|---|
| Infinite line, charge density $\lambda$, distance $r$ | $E = \dfrac{2k\lambda}{r} = \dfrac{\lambda}{2\pi\varepsilon_0 r}$, radially outward |
| Ring on its axis | $E = \dfrac{kQx}{(x^2+R^2)^{3/2}}$ |
| Semicircular arc at its center (radius R, uniform λ) | $E = \dfrac{2k\lambda}{R}$, along the symmetry axis |`,
      blocks: [],
      precheck: {
        question: 'For a ring of charge, why do the field components perpendicular to its axis cancel at points on the axis?',
        choices: [
          'Each piece of charge has a matching piece on the opposite side whose perpendicular component is equal and opposite',
          'The charge on a ring is zero',
          'Perpendicular fields don\'t exist for continuous charge',
          'The axial components cancel instead',
        ],
        answer: 0,
        explanations: [
          'Correct. Symmetric pairs cancel sideways and add along the axis.',
          'Incorrect. The ring carries charge Q.',
          'Incorrect. Each piece makes a full vector field; symmetry is what cancels parts.',
          'Incorrect. The axial parts all point the same way and add.',
        ],
      },
      checkpoints: [
        {
          question: 'Far from a ring of charge (x ≫ R) on its axis, the field approaches:',
          choices: ['$kQ/x^2$', '0', '$kQ/R^2$', '$kQx/R^3$'],
          answer: 0,
          explanations: [
            'Correct. $(x^2 + R^2)^{3/2} \\approx x^3$, so $E \\to kQx/x^3 = kQ/x^2$, like a point charge.',
            'Incorrect. Zero is the field at the ring\'s center, not far away.',
            'Incorrect. Far away the relevant distance is x, not R.',
            'Incorrect. That would be the near-center behavior, for $x \\ll R$.',
          ],
        },
        {
          question: 'The field of a very long line of charge at distance r is proportional to:',
          choices: ['1/r', '1/r²', 'r', 'It is independent of r'],
          answer: 0,
          explanations: [
            'Correct. $E = 2k\\lambda/r$: it falls off more slowly than a point charge\'s field.',
            'Incorrect. 1/r² is for a point charge.',
            'Incorrect. The field weakens with distance.',
            'Incorrect. Constant field is for an infinite plane of charge.',
          ],
        },
      ],
      revisit:
        'Integrate $dE = k\\,dq/r^2$ with direction; let symmetry cancel components first. Ring on axis $kQx/(x^2+R^2)^{3/2}$; infinite line $2k\\lambda/r$; ' +
        'semicircle at center $2k\\lambda/R$. Check limits.',
    },
    {
      id: '8.5–8.6',
      ced: '8.5.A–8.6.A',
      title: 'Electric Flux and Gauss’s Law',
      minutes: 10,
      summary:
        'Electric flux measures field through an area: Φ = E·A for uniform E, or a surface integral. Gauss\'s law says the total flux through ' +
        'a closed surface equals the enclosed charge over ε₀, regardless of the surface\'s size. With spherical, cylindrical or planar symmetry ' +
        'it gives E directly. It is the first of Maxwell\'s equations.',
      body: String.raw`### Flux

$$\Phi_E = \vec{E}\cdot\vec{A} = EA\cos\theta$$

$$\Phi_E = \int \vec{E}\cdot d\vec{A}$$

The **area vector** is perpendicular to the surface (outward for a closed surface). Field passing outward gives positive flux, inward negative.

### Gauss's law

$$\oint \vec{E}\cdot d\vec{A} = \frac{q_{enc}}{\varepsilon_0}$$

- Total flux through a closed (**Gaussian**) surface depends only on the **enclosed** charge, not on the surface's size or on charges outside.
- Choose the surface so $\vec E$ is either **perpendicular** (and constant) or **parallel** to each part; then the integral is just $E \times$ area.
- If you're given a charge density, integrate it for $q_{enc}$: $q = \int \lambda\,dx$, $\int \sigma\,dA$, or $\int \rho\,dV$.

${steps({
  title: 'A uniformly charged insulating sphere (charge Q, radius R). Find E inside, at r < R.',
  steps: [
    { title: 'Gaussian surface', body: 'A sphere of radius $r < R$, concentric: E is radial and the same everywhere on it.' },
    { title: 'Enclosed charge', body: 'Uniform density, so $q_{enc} = Q\\dfrac{r^3}{R^3}$' },
    { title: 'Gauss', body: '$E(4\\pi r^2) = \\dfrac{Qr^3}{\\varepsilon_0 R^3}$' },
    { title: 'Solve', body: '$E = \\dfrac{Qr}{4\\pi\\varepsilon_0 R^3} = \\dfrac{kQr}{R^3}$: grows linearly from 0 at the center to $kQ/R^2$ at the surface' },
  ],
  answer: 'E = kQr/R³ inside (and kQ/r² outside)',
})}

| Symmetry | Gaussian surface | Result |
|---|---|---|
| Spherical | Concentric sphere | Outside: $kQ/r^2$ |
| Cylindrical (long line) | Coaxial cylinder | $\lambda/(2\pi\varepsilon_0 r)$ |
| Planar (infinite sheet, $\sigma$) | "Pillbox" through the sheet | $\sigma/(2\varepsilon_0)$, uniform |

Gauss's law is the first of **Maxwell's equations**, the four equations that fully describe electromagnetism.`,
      blocks: [],
      precheck: {
        question: 'A point charge q sits at the center of a cube. What is the total electric flux through the cube\'s surface?',
        choices: ['$q/\\varepsilon_0$', '$q/(6\\varepsilon_0)$', '0', 'It depends on the cube\'s size'],
        answer: 0,
        explanations: [
          'Correct. Total flux through any closed surface is $q_{enc}/\\varepsilon_0$.',
          'Incorrect. That is the flux through one face, by symmetry.',
          'Incorrect. The surface encloses a nonzero charge.',
          'Incorrect. Gauss\'s law makes the total independent of the surface\'s size.',
        ],
      },
      checkpoints: [
        {
          question: 'A uniform field of 200 N/C passes through a flat 0.50 m² surface at 60° to the surface\'s area vector. What is the flux?',
          choices: ['50 N·m²/C', '100 N·m²/C', '87 N·m²/C', '400 N·m²/C'],
          answer: 0,
          explanations: [
            'Correct. $\\Phi = EA\\cos60^\\circ = (200)(0.50)(0.5) = 50$ N·m²/C.',
            'Incorrect. That ignores the angle.',
            'Incorrect. That uses $\\sin60^\\circ$; the angle is to the area vector, so use cosine.',
            'Incorrect. That divides by the area instead of multiplying.',
          ],
        },
        {
          question: 'A charge +Q is outside a closed Gaussian surface. The net flux through the surface due to that charge is:',
          choices: ['Zero', '$Q/\\varepsilon_0$', '$-Q/\\varepsilon_0$', 'It depends on how far away the charge is'],
          answer: 0,
          explanations: [
            'Correct. Every field line that enters leaves again, so the net flux is zero; only enclosed charge counts.',
            'Incorrect. That would require the charge to be inside.',
            'Incorrect. Inward and outward flux cancel exactly.',
            'Incorrect. Distance changes the field on the surface but not the net flux.',
          ],
        },
        {
          question: 'Using Gauss\'s law, the field inside a uniformly charged insulating sphere at radius r < R is:',
          choices: ['Proportional to r', 'Zero', 'Proportional to 1/r²', 'Constant'],
          answer: 0,
          explanations: [
            'Correct. $q_{enc} \\propto r^3$ and the area $\\propto r^2$, so $E = kQr/R^3$.',
            'Incorrect. Zero inside is for a conductor.',
            'Incorrect. 1/r² applies outside the sphere.',
            'Incorrect. The enclosed charge grows with r, so E does too.',
          ],
        },
      ],
      revisit:
        '$\\Phi = \\vec E\\cdot\\vec A$ (area vector ⊥, outward). $\\oint\\vec E\\cdot d\\vec A = q_{enc}/\\varepsilon_0$, independent of the surface size; outside ' +
        'charges add zero. Use symmetric surfaces: sphere, cylinder, pillbox.',
    },
  ],
};

export default pack;
