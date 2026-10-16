/**
 * AP Physics 1 Unit 2: Force and Translational Dynamics — study pack.
 *
 * Written against the AP Physics 1: Algebra-Based CED (effective Fall 2024,
 * topics 2.1–2.9). Follows its boundary statements: g = 10 N/kg in every
 * number; free-body diagrams show whole forces from the center of mass, never
 * components; center of mass for five or fewer particles; tension in massive
 * ropes only qualitatively; banked curves quantitatively only when no
 * friction is needed; Kepler's third law only. The incline simulation is an
 * Apex component modeled on MicroSims in Dan McCreary's "Introduction to
 * Physics" (CC BY-NC-SA 4.0); see `credits`. Every number was recomputed.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-physics-1/unit-2',
  subject: 'AP Physics 1: Algebra-Based',
  unit: 'Unit 2: Force and Translational Dynamics',
  examWeight: '18–23% of the exam',
  intro:
    'Unit 1 described motion. This unit explains it: forces are interactions, the net force sets the acceleration, and ' +
    'every push comes with an equal push back. You will draw free-body diagrams, apply Newton\'s three laws to systems, and ' +
    'work with gravity, friction, springs and circular motion.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Introduction to Physics',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/intro-to-physics-course/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'The incline simulation is rebuilt from its inclined-plane and static friction MicroSims.',
    },
  ],
  sections: [
    {
      id: '2.1',
      ced: '2.1.A–B',
      title: 'Systems and Center of Mass',
      minutes: 6,
      summary:
        'A system\'s behavior comes from the interactions of its parts, and when the internal details don\'t matter, the ' +
        'whole system can be treated as one object located at its center of mass. For symmetric objects the center of mass ' +
        'lies on the lines of symmetry.',
      body: String.raw`### Choosing a system
You decide what counts as "the system": one block, two blocks tied together, a person plus a skateboard.
- If the internal structure doesn't matter, treat the system as **one object** at its **center of mass**.
- Objects inside a system can move differently from each other and from the system as a whole.
- A system can exchange **energy or mass** with its environment.

### Center of mass
For symmetric objects, the center of mass is on the **lines of symmetry** (the center of a uniform ball or rod). For a few particles along an axis:

$$x_{cm} = \frac{\sum m_i x_i}{\sum m_i}$$

${steps({
  title: 'A 2 kg ball sits at x = 0 and a 3 kg ball at x = 5 m. Where is the center of mass?',
  steps: [
    { title: 'Weight each position by its mass', body: '$\\sum m_i x_i = (2)(0) + (3)(5) = 15\\ \\text{kg}\\cdot\\text{m}$' },
    { title: 'Divide by total mass', body: '$x_{cm} = \\dfrac{15}{2 + 3} = 3\\ \\text{m}$' },
  ],
  answer: 'x = 3 m, closer to the heavier ball',
})}

The center of mass always sits **closer to the heavier** object.`,
      blocks: [],
      precheck: {
        question: 'Where is the center of mass of a uniform meter stick?',
        choices: ['At the 50 cm mark', 'At the 0 cm end', 'At the 100 cm end', 'It depends on how fast the stick moves'],
        answer: 0,
        explanations: [
          'Correct. A uniform stick is symmetric, so its center of mass is at its midpoint.',
          'Incorrect. The mass is spread evenly, not concentrated at one end.',
          'Incorrect. The mass is spread evenly, not concentrated at one end.',
          'Incorrect. The center of mass depends on how mass is distributed, not on speed.',
        ],
      },
      checkpoints: [
        {
          question: 'Masses of 1 kg at x = 0, 1 kg at x = 4 m and 2 kg at x = 10 m lie on a line. Where is the center of mass?',
          choices: ['6 m', '4.7 m', '5 m', '7 m'],
          answer: 0,
          explanations: [
            'Correct. (1·0 + 1·4 + 2·10)/(1 + 1 + 2) = 24/4 = 6 m.',
            'Incorrect. That averages the three positions without weighting by mass.',
            'Incorrect. That is the midpoint of the ends, ignoring the masses.',
            'Incorrect. Recheck the weighted sum: it is 24 kg·m over 4 kg.',
          ],
        },
        {
          question: 'When can a car be modeled as a single object at its center of mass?',
          choices: [
            'When its internal parts (wheels, engine) don\'t matter for the question being asked',
            'Only when it is at rest',
            'Never, because cars have many parts',
            'Only when its center of mass is inside the car',
          ],
          answer: 0,
          explanations: [
            'Correct. If internal interactions don\'t affect the behavior you\'re modeling, treat the system as one object.',
            'Incorrect. Moving systems can be modeled as single objects too.',
            'Incorrect. Most systems have many parts; the model works when those details don\'t matter.',
            'Incorrect. A center of mass can even lie outside an object, like a ring\'s; that doesn\'t prevent modeling.',
          ],
        },
      ],
      revisit:
        'A system can be treated as one object at its center of mass when internal details don\'t matter. Symmetric objects: ' +
        'CM on symmetry lines. x_cm = Σmx/Σm, closer to the heavier mass.',
    },
    {
      id: '2.2',
      ced: '2.2.A–B',
      title: 'Forces and Free-Body Diagrams',
      minutes: 7,
      summary:
        'A force is an interaction between two objects; nothing can exert a net force on itself. Contact forces come from ' +
        'electric forces between atoms. A free-body diagram shows every force on one object or system as an arrow from a dot.',
      body: String.raw`### Forces are interactions
- A force is a **vector** that describes an interaction between **two** objects or systems.
- Every force on an object comes from **another** object. An object can't exert a net force on itself.
- **Contact forces** (normal, friction, tension, spring) are the large-scale result of **electric forces between atoms**. In AP Physics 1 the only force at a distance is **gravity**.

### Drawing a free-body diagram (FBD)
1. Draw a **dot** for the object or system (its center of mass).
2. Draw each force exerted **on** it by the environment as a straight arrow **starting at the dot**, pointing in the force's direction.
3. Label each force with what exerts it: $F_g$ (Earth), $F_n$ (surface), $T$ (rope), $f$ (friction).
4. Draw forces in the same direction **side by side**, not overlapping.
5. On the exam, **don't draw components** on the FBD itself.

### Choosing axes
Line up one axis with the **acceleration**. On an incline, use axes parallel and perpendicular to the slope; then only gravity needs splitting into components (in your equations, not on the diagram).

| Force | Exerted by | Direction |
|---|---|---|
| Gravity $F_g = mg$ | Earth | Down |
| Normal $F_n$ | A surface | Perpendicular to the surface, away from it |
| Friction $f$ | A surface | Along the surface, opposing sliding or the tendency to slide |
| Tension $T$ | A rope or string | Along the rope, pulling away from the object |`,
      blocks: [],
      precheck: {
        question: 'A book rests on a table. Which forces belong on the book\'s free-body diagram?',
        choices: [
          'Gravity from Earth (down) and the normal force from the table (up)',
          'Gravity (down) and the force of the book on the table (down)',
          'Only gravity, because the book isn\'t moving',
          'The normal force (up) and the book\'s inertia (down)',
        ],
        answer: 0,
        explanations: [
          'Correct. Only forces exerted on the book appear: Earth pulls it down and the table pushes it up.',
          'Incorrect. The book\'s push on the table acts on the table, so it isn\'t on the book\'s diagram.',
          'Incorrect. At rest means the forces balance, not that only one acts.',
          'Incorrect. Inertia is a property, not a force.',
        ],
      },
      checkpoints: [
        {
          question: 'Which statement about forces is correct?',
          choices: [
            'Every force on an object is exerted by some other object',
            'A moving object carries a "force of motion" with it',
            'An object can push itself forward with a net force',
            'Contact forces have nothing to do with electric forces',
          ],
          answer: 0,
          explanations: [
            'Correct. Forces are interactions between two objects or systems.',
            'Incorrect. There is no force of motion; a moving object needs no force to keep moving.',
            'Incorrect. An object can\'t exert a net force on itself.',
            'Incorrect. Contact forces are the macroscopic effect of electric forces between atoms.',
          ],
        },
        {
          question: 'For a block sliding down an incline, why are axes parallel and perpendicular to the slope useful?',
          choices: [
            'The acceleration lies along one axis, so only gravity needs splitting into components',
            'It makes gravity disappear from the problem',
            'It makes the normal force vertical',
            'The exam requires drawing components on the free-body diagram',
          ],
          answer: 0,
          explanations: [
            'Correct. Aligning an axis with the acceleration simplifies the equations.',
            'Incorrect. Gravity still acts; it just gets split into two components.',
            'Incorrect. The normal force is perpendicular to the slope, not vertical.',
            'Incorrect. The exam says not to draw components on the diagram.',
          ],
        },
      ],
      revisit:
        'Forces are interactions between two objects. FBD: dot, whole forces on the object as arrows from the dot, no ' +
        'components, same-direction forces side by side. Choose an axis along the acceleration.',
    },
    {
      id: '2.3',
      ced: '2.3.A',
      title: 'Newton\'s Third Law',
      minutes: 7,
      summary:
        'When A pushes on B, B pushes back on A with a force equal in size and opposite in direction. The two forces act on ' +
        'different objects, so they never cancel each other. Internal forces don\'t move a system\'s center of mass. Ideal strings ' +
        'have the same tension everywhere.',
      body: String.raw`### Paired forces

$$\vec F_{A\text{ on }B} = -\vec F_{B\text{ on }A}$$

- Same **size**, opposite **direction**, same **type** of force, acting on **different objects**.
- Because they act on different objects, a third-law pair **never cancels** on one FBD.
- A truck hitting a mosquito: both feel the **same size** force. The mosquito's tiny mass gives it a huge acceleration.

### Internal forces
Forces between objects **inside** a system come in third-law pairs that cancel for the system as a whole, so they **don't change the motion of its center of mass**. Only external forces do.

### Tension
Tension is the net result of segments of a string pulling on each other.
- An **ideal string** has negligible mass and doesn't stretch; its tension is the **same everywhere**.
- A string with mass can have different tension at different points: a hanging chain is tenser near the top, which supports more chain below it. (AP Physics 1 treats this qualitatively.)
- An **ideal pulley** has negligible mass and frictionless rotation; it changes the direction of the tension without changing its size.

Sort the situations below by the law they show.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which of Newton\'s laws does each situation show best?',
            buckets: ['First law', 'Second law', 'Third law'],
            items: [
              { label: 'A hockey puck glides across ice at nearly constant velocity', bucket: 0, why: 'With almost no net force, its velocity stays constant.' },
              { label: 'A passenger lurches forward when the bus brakes suddenly', bucket: 0, why: 'The passenger tends to keep moving at the old velocity: inertia.' },
              { label: 'The same push accelerates an empty cart more than a full one', bucket: 1, why: 'a = F/m: more mass, less acceleration for the same net force.' },
              { label: 'Doubling the net force on a sled doubles its acceleration', bucket: 1, why: 'Acceleration is proportional to net force.' },
              { label: 'A swimmer pushes the wall backward and the wall pushes her forward', bucket: 2, why: 'The wall\'s push on her pairs with her push on the wall.' },
              { label: 'A rocket\'s exhaust is pushed down and the gas pushes the rocket up', bucket: 2, why: 'The rocket and gas exert equal and opposite forces on each other.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A truck collides with a mosquito. How do the forces they exert on each other compare?',
        choices: [
          'They are equal in size and opposite in direction',
          'The truck exerts a much larger force on the mosquito',
          'The mosquito exerts a larger force because it accelerates more',
          'Only the truck exerts a force',
        ],
        answer: 0,
        explanations: [
          'Correct. Third-law pairs are always equal in magnitude; the accelerations differ because the masses differ.',
          'Incorrect. The effects differ, not the forces.',
          'Incorrect. A larger acceleration comes from a smaller mass, not a larger force.',
          'Incorrect. Every force has a partner force on the other object.',
        ],
      },
      checkpoints: [
        {
          question: 'A book rests on a table. What is the third-law partner of the gravitational force Earth exerts on the book?',
          choices: [
            'The gravitational force the book exerts on Earth',
            'The normal force the table exerts on the book',
            'The normal force the book exerts on the table',
            'The book\'s weight pressing on the floor',
          ],
          answer: 0,
          explanations: [
            'Correct. Partners involve the same two objects and the same type of force: gravity between book and Earth.',
            'Incorrect. That force is also on the book; it balances gravity but isn\'t its partner.',
            'Incorrect. That is a contact force between book and table, the partner of the table\'s normal force.',
            'Incorrect. The book isn\'t touching the floor.',
          ],
        },
        {
          question: 'Two people on frictionless ice push off each other. What happens to the center of mass of the two-person system, which started at rest?',
          choices: [
            'It stays at rest, because the pushes are internal forces',
            'It moves toward the heavier person',
            'It moves toward the lighter person',
            'It accelerates in the direction of the larger push',
          ],
          answer: 0,
          explanations: [
            'Correct. Internal forces can\'t change the motion of a system\'s center of mass.',
            'Incorrect. The people move apart, but the center of mass stays put.',
            'Incorrect. The people move apart, but the center of mass stays put.',
            'Incorrect. The pushes are an equal third-law pair; neither is larger.',
          ],
        },
      ],
      revisit:
        'F(A on B) = −F(B on A): equal size, opposite direction, different objects, never cancel each other. Internal forces don\'t ' +
        'move the CM. Ideal string: same tension throughout; ideal pulley redirects it.',
    },
    {
      id: '2.4',
      ced: '2.4.A',
      title: 'Newton\'s First Law',
      minutes: 5,
      summary:
        'The net force is the vector sum of all forces. If it is zero (translational equilibrium), velocity stays constant, ' +
        'whether that is at rest or moving steadily. Forces can balance in one direction and not another.',
      body: String.raw`### Net force and equilibrium
- **Net force** $\sum \vec F$ is the **vector sum** of every force on the system.
- **Translational equilibrium**: $\sum \vec F = 0$.
- **Newton's first law**: if the net force is zero, the system's **velocity stays constant**. That includes staying at rest **and** moving in a straight line at constant speed.

### One direction at a time
Forces can balance vertically but not horizontally. A hockey puck sliding on ice has gravity and the normal force balanced, so its vertical velocity stays zero; any horizontal friction changes only its horizontal velocity.

### Constant velocity is not "no forces"
An elevator rising at **constant speed** has tension exactly equal to its weight. A car cruising at constant speed has a driving force equal to the drag and friction against it. Zero net force, not zero force.

### Inertial reference frames
An **inertial frame** is one in which Newton's first law holds. A frame that is accelerating (a braking bus) is not inertial, which is why objects in it seem to lurch with no force pushing them.`,
      blocks: [],
      precheck: {
        question: 'An elevator rises at constant speed. How does the cable tension compare with the elevator\'s weight?',
        choices: ['Equal to the weight', 'Greater than the weight', 'Less than the weight', 'Zero'],
        answer: 0,
        explanations: [
          'Correct. Constant velocity means zero net force, so tension balances gravity.',
          'Incorrect. Tension exceeds weight only while the elevator speeds up going up (or slows going down).',
          'Incorrect. Less tension would make it accelerate downward.',
          'Incorrect. Without tension the elevator would be in free fall.',
        ],
      },
      checkpoints: [
        {
          question: 'Which object is in translational equilibrium?',
          choices: [
            'A parachutist falling at a constant terminal speed',
            'A ball at the top of its flight, momentarily at rest',
            'A car speeding up on a straight road',
            'A satellite in a circular orbit',
          ],
          answer: 0,
          explanations: [
            'Correct. Constant velocity means the drag force balances gravity.',
            'Incorrect. At the top, gravity is the only force, so the net force isn\'t zero.',
            'Incorrect. Speeding up requires a net force.',
            'Incorrect. Its direction keeps changing, which requires a net (centripetal) force.',
          ],
        },
        {
          question: 'A box slides across a floor and slows down. Which statement is correct?',
          choices: [
            'The vertical forces balance, but friction makes the horizontal net force nonzero',
            'All forces balance, so the box is in equilibrium',
            'The box needs a forward force to keep moving',
            'The normal force is causing it to slow down',
          ],
          answer: 0,
          explanations: [
            'Correct. Forces can balance in one dimension and not in another.',
            'Incorrect. A slowing box is accelerating, so the net force isn\'t zero.',
            'Incorrect. Without friction it would keep moving with no forward force at all.',
            'Incorrect. The normal force is vertical; friction slows it.',
          ],
        },
      ],
      revisit:
        'Net force = vector sum. ΣF = 0 → constant velocity (rest or steady motion). Forces can balance in one direction only. ' +
        'Constant velocity means zero net force, not zero forces. Inertial frames are where the first law holds.',
    },
    {
      id: '2.5',
      ced: '2.5.A',
      title: 'Newton\'s Second Law',
      minutes: 8,
      summary:
        'The acceleration of a system\'s center of mass is the net external force divided by the system\'s mass, in the ' +
        'direction of the net force. Only external forces change the system\'s velocity.',
      body: String.raw`### The law

$$\vec a_{sys} = \frac{\sum \vec F}{m_{sys}} = \frac{\vec F_{net}}{m_{sys}}$$

- The acceleration points in the **same direction as the net force**.
- Double the net force → double the acceleration. Double the mass → half the acceleration.
- Only a **nonzero net external force** changes the velocity of the system's center of mass.

### A method that always works
1. Choose the system and draw its FBD.
2. Pick axes with one along the acceleration.
3. Write $\sum F = ma$ along each axis.
4. Solve.

${steps({
  title: 'A 4 kg box is pushed with 20 N across a floor where friction is 8 N. Find its acceleration.',
  steps: [
    { title: 'Net force along the motion', body: '$F_{net} = 20 - 8 = 12\\ \\text{N}$' },
    { title: 'Apply the second law', body: '$a = \\dfrac{12\\ \\text{N}}{4\\ \\text{kg}} = 3\\ \\text{m/s}^2$' },
  ],
  answer: '3 m/s² in the direction of the push',
})}

${steps({
  title: 'On a frictionless floor, 15 N pushes a 3 kg block into a 2 kg block. Find a and the force between the blocks.',
  steps: [
    { title: 'Treat both blocks as one system', body: '$a = \\dfrac{15}{3 + 2} = 3\\ \\text{m/s}^2$ (the contact forces between them are internal)' },
    { title: 'Now look at the front block alone', body: 'The only horizontal force on the 2 kg block is the push from the 3 kg block: $F = (2)(3) = 6\\ \\text{N}$' },
  ],
  answer: 'a = 3 m/s²; the blocks push on each other with 6 N',
})}`,
      blocks: [],
      precheck: {
        question: 'The net force on a cart doubles while its mass stays the same. What happens to its acceleration?',
        choices: ['It doubles', 'It halves', 'It stays the same', 'It quadruples'],
        answer: 0,
        explanations: [
          'Correct. a = F/m, so acceleration is proportional to net force.',
          'Incorrect. That would happen if the mass doubled.',
          'Incorrect. Changing the net force changes the acceleration.',
          'Incorrect. The relationship is linear, not squared.',
        ],
      },
      checkpoints: [
        {
          question: 'A 1,000 kg car speeds up from rest to 20 m/s in 10 s on a straight road. What net force acts on it?',
          choices: ['2,000 N', '200 N', '20,000 N', '10,000 N'],
          answer: 0,
          explanations: [
            'Correct. a = 20/10 = 2 m/s², so F = 1000 × 2 = 2,000 N.',
            'Incorrect. That divides the speed by the time and then by 10 again.',
            'Incorrect. That multiplies mass by the final speed instead of the acceleration.',
            'Incorrect. That uses an acceleration of 10 m/s², which is g, not this car\'s acceleration.',
          ],
        },
        {
          question: 'In the two-block example, the push is moved to the 2 kg block (pushing the 3 kg block ahead of it). How does the force between the blocks change?',
          choices: ['It increases to 9 N', 'It stays 6 N', 'It decreases to 3 N', 'It becomes 15 N'],
          answer: 0,
          explanations: [
            'Correct. The acceleration is still 3 m/s², but now the contact force must accelerate the 3 kg block: 3 × 3 = 9 N.',
            'Incorrect. The front block is now the heavier one, so it needs more force.',
            'Incorrect. More mass ahead needs more force, not less.',
            'Incorrect. Part of the push accelerates the rear block itself.',
          ],
        },
      ],
      revisit:
        'a = F_net / m, in the direction of F_net. Only external forces change the CM\'s velocity. Method: system, FBD, axes ' +
        'along a, ΣF = ma. For connected objects, solve the whole system first, then one part.',
    },
    {
      id: '2.6',
      ced: '2.6.A–D',
      title: 'Gravitational Force',
      minutes: 8,
      summary:
        'Gravity attracts any two masses with a force proportional to each mass and inversely proportional to the square of ' +
        'the distance between centers. Near Earth\'s surface, g = 10 N/kg and weight is mg. Apparent weight is the normal force, ' +
        'which differs from mg when you accelerate.',
      body: String.raw`### Universal gravitation

$$F_g = G\frac{m_1 m_2}{r^2}$$

- Always **attractive**, along the line between the **centers of mass**.
- Double one mass → double the force. Double the distance → **one quarter** of the force.

### Gravitational field
The field strength at a point is the force per unit mass on a test object:

$$g = \frac{F_g}{m} = G\frac{M}{r^2}$$

If gravity is the only force on an object, its acceleration in m/s² equals the field strength in N/kg. Near Earth's surface, $g = 10$ N/kg, and the **weight** is $F_g = mg$. Over small height changes, $g$ is effectively constant.

### Apparent weight
Your **apparent weight** is the **normal force** a scale or floor exerts on you.

${steps({
  title: 'A 60 kg person stands in an elevator accelerating upward at 2 m/s². What does the scale read?',
  steps: [
    { title: 'Second law, up positive', body: '$F_n - mg = ma$' },
    { title: 'Solve', body: '$F_n = m(g + a) = 60(10 + 2) = 720\\ \\text{N}$' },
  ],
  answer: '720 N, more than the true weight of 600 N',
})}

- Accelerating **up** (or slowing while moving down): feel **heavier**.
- Accelerating **down**: feel **lighter**.
- In **free fall**, gravity is the only force, the normal force is zero, and you feel **weightless**, even though gravity is still pulling.
- The **equivalence principle**: from inside an accelerating frame, you can't tell apparent weight from a real gravitational force.

### Two kinds of mass
**Inertial mass** measures resistance to acceleration; **gravitational mass** measures the strength of gravitational attraction. Experiments show they are **equivalent**.`,
      blocks: [],
      precheck: {
        question: 'The distance between two moons doubles. What happens to the gravitational force between them?',
        choices: ['It becomes one quarter as large', 'It halves', 'It doubles', 'It stays the same'],
        answer: 0,
        explanations: [
          'Correct. Gravity follows an inverse square law: (1/2)² = 1/4.',
          'Incorrect. The distance is squared, so halving isn\'t enough.',
          'Incorrect. Greater distance weakens gravity.',
          'Incorrect. Gravitational force depends on distance.',
        ],
      },
      checkpoints: [
        {
          question: 'A 50 kg student rides an elevator that is slowing down while moving upward at 2 m/s². What does a scale under the student read?',
          choices: ['400 N', '500 N', '600 N', '0 N'],
          answer: 0,
          explanations: [
            'Correct. Slowing while moving up means the acceleration points down: F_n = m(g − a) = 50 × 8 = 400 N.',
            'Incorrect. That is the true weight; the scale reads differently while accelerating.',
            'Incorrect. That would be accelerating upward, not slowing down while rising.',
            'Incorrect. Zero would mean free fall.',
          ],
        },
        {
          question: 'Astronauts on the International Space Station float. Why?',
          choices: [
            'They and the station are in free fall together, so the normal force on them is zero',
            'There is no gravity in orbit',
            'Earth\'s gravity is balanced by the Moon\'s gravity',
            'Their inertial mass becomes zero in space',
          ],
          answer: 0,
          explanations: [
            'Correct. Gravity is still about 90% as strong there, but with gravity as the only force they feel weightless.',
            'Incorrect. Gravity is what keeps the station in orbit.',
            'Incorrect. The Moon\'s pull on them is tiny compared with Earth\'s.',
            'Incorrect. Mass doesn\'t change in space.',
          ],
        },
      ],
      revisit:
        'F = Gm₁m₂/r²: attractive, inverse square. g = GM/r²; near Earth g = 10 N/kg, weight = mg. Apparent weight = normal force; ' +
        'up-accelerating feels heavier, free fall feels weightless. Inertial and gravitational mass are equivalent.',
    },
    {
      id: '2.7',
      ced: '2.7.A–B',
      title: 'Kinetic and Static Friction',
      minutes: 9,
      summary:
        'Kinetic friction acts on sliding surfaces with size μk·Fn, opposite the relative motion, and doesn\'t depend on contact ' +
        'area. Static friction takes whatever value prevents slipping, up to a maximum μs·Fn. μs is usually larger than μk.',
      body: String.raw`### Kinetic friction (sliding)

$$f_k = \mu_k F_n$$

- Acts when surfaces **slide** relative to each other, **opposite** the relative motion.
- **Doesn't depend on contact area.**
- $\mu_k$ depends on the two materials. The **normal force** is the perpendicular push of the surface, directed away from it; it isn't always equal to $mg$.

### Static friction (not sliding)
- Takes **whatever value and direction** are needed to prevent slipping.
- Has a maximum: $f_{s,max} = \mu_s F_n$.
- Usually $\mu_s > \mu_k$: it takes more force to start something sliding than to keep it sliding.

${steps({
  title: 'A 5 kg box on a floor has μs = 0.5 and μk = 0.4. What happens with a 20 N push? With a 30 N push?',
  steps: [
    { title: 'Normal force and max static friction', body: '$F_n = mg = 50\\ \\text{N}$, so $f_{s,max} = 0.5 \\times 50 = 25\\ \\text{N}$' },
    { title: '20 N push', body: '$20 < 25$, so the box stays put. Static friction is **20 N**, not 25.' },
    { title: '30 N push', body: '$30 > 25$, so it slides. $f_k = 0.4 \\times 50 = 20\\ \\text{N}$, and $a = \\dfrac{30 - 20}{5} = 2\\ \\text{m/s}^2$' },
  ],
  answer: '20 N: at rest with 20 N of static friction. 30 N: slides at 2 m/s².',
})}

### Try it on an incline
Tilt the incline until the block slips. On a slope, $F_n = mg\cos\theta$ and the pull down the slope is $mg\sin\theta$, so the block slips when $\tan\theta > \mu_s$, whatever its mass.`,
      blocks: [{ type: 'sim', sim: 'incline-lab' }],
      precheck: {
        question: 'A 10 kg crate rests on a floor with μs = 0.6. You push horizontally with 40 N and it doesn\'t move. How big is the static friction force?',
        choices: ['40 N', '60 N', '100 N', '0 N'],
        answer: 0,
        explanations: [
          'Correct. Static friction matches the push exactly (up to its 60 N maximum) to keep the crate still.',
          'Incorrect. 60 N is the maximum static friction, not the amount needed here.',
          'Incorrect. 100 N is the crate\'s weight.',
          'Incorrect. Without friction the 40 N push would accelerate it.',
        ],
      },
      checkpoints: [
        {
          question: 'A 2 kg block slides across a floor with μk = 0.25. If you double the block\'s contact area by turning it on its side, what happens to the kinetic friction force?',
          choices: ['It stays 5 N', 'It doubles to 10 N', 'It halves to 2.5 N', 'It drops to zero'],
          answer: 0,
          explanations: [
            'Correct. f_k = μk·Fn = 0.25 × 20 = 5 N, and friction doesn\'t depend on contact area.',
            'Incorrect. Contact area doesn\'t affect friction in this model.',
            'Incorrect. Contact area doesn\'t affect friction in this model.',
            'Incorrect. The surfaces still slide against each other.',
          ],
        },
        {
          question: 'A block rests on an incline with μs = 0.5. Approximately at what angle does it begin to slip?',
          choices: ['About 27°', 'About 45°', 'About 30°', 'About 60°'],
          answer: 0,
          explanations: [
            'Correct. It slips when tan θ > μs: tan⁻¹(0.5) ≈ 26.6°.',
            'Incorrect. 45° would need μs = 1.',
            'Incorrect. tan 30° ≈ 0.58, which is past the slip point.',
            'Incorrect. tan 60° ≈ 1.73, far past μs = 0.5.',
          ],
        },
      ],
      revisit:
        'Kinetic: f_k = μk·Fn, opposite sliding, independent of area. Static: whatever is needed, up to μs·Fn. μs > μk usually. ' +
        'Incline: Fn = mg cos θ; slips when tan θ > μs.',
    },
    {
      id: '2.8',
      ced: '2.8.A',
      title: 'Spring Forces',
      minutes: 5,
      summary:
        'An ideal spring exerts a force proportional to how far it is stretched or compressed from its relaxed length (Hooke\'s ' +
        'law), always directed back toward equilibrium.',
      body: String.raw`### Hooke's law

$$|\vec F_s| = k|\Delta \vec x|$$

- $k$ is the **spring constant** (N/m): how stiff the spring is.
- $\Delta x$ is the stretch or compression from the **relaxed length**.
- The force always points **toward the equilibrium position** (a restoring force).
- An **ideal spring** has negligible mass.

On a graph of force vs. stretch, the points fall on a straight line through the origin, and the **slope is $k$**.

${steps({
  title: 'A 2 kg mass hangs at rest from a spring, stretching it 0.10 m. Find k.',
  steps: [
    { title: 'At rest, forces balance', body: '$k\\Delta x = mg = (2)(10) = 20\\ \\text{N}$' },
    { title: 'Solve', body: '$k = \\dfrac{20\\ \\text{N}}{0.10\\ \\text{m}} = 200\\ \\text{N/m}$' },
  ],
  answer: 'k = 200 N/m',
})}`,
      blocks: [],
      precheck: {
        question: 'A spring with k = 200 N/m is stretched 0.05 m. How much force does it exert?',
        choices: ['10 N', '4,000 N', '0.25 N', '200 N'],
        answer: 0,
        explanations: [
          'Correct. F = kΔx = 200 × 0.05 = 10 N.',
          'Incorrect. That divides k by Δx instead of multiplying.',
          'Incorrect. That divides Δx by k.',
          'Incorrect. That is the spring constant, not the force.',
        ],
      },
      checkpoints: [
        {
          question: 'A spring stretches 3 cm when a force of 6 N is applied. How far does it stretch under 10 N?',
          choices: ['5 cm', '6 cm', '4 cm', '3 cm'],
          answer: 0,
          explanations: [
            'Correct. Stretch is proportional to force: 3 cm × (10/6) = 5 cm.',
            'Incorrect. That doubles the stretch, but 10 N isn\'t double 6 N.',
            'Incorrect. That adds 1 cm instead of scaling.',
            'Incorrect. More force means more stretch.',
          ],
        },
        {
          question: 'A block attached to a spring is pushed 4 cm to the left of equilibrium (compressing the spring). Which way does the spring push the block?',
          choices: ['To the right, toward equilibrium', 'To the left, away from equilibrium', 'Upward', 'There is no spring force when compressed'],
          answer: 0,
          explanations: [
            'Correct. Spring forces always point back toward equilibrium.',
            'Incorrect. A spring force is a restoring force.',
            'Incorrect. The spring acts along its own length, horizontally here.',
            'Incorrect. A compressed spring pushes just as a stretched one pulls.',
          ],
        },
      ],
      revisit:
        'Hooke\'s law: F = kΔx, toward equilibrium. k in N/m is the slope of force vs. stretch. Hanging at rest: kΔx = mg.',
    },
    {
      id: '2.9',
      ced: '2.9.A–B',
      title: 'Circular Motion',
      minutes: 10,
      summary:
        'Moving in a circle requires centripetal acceleration v²/r toward the center, supplied by real forces: gravity, ' +
        'tension, friction, the normal force, or components of them. Tangential acceleration changes speed. Period and ' +
        'frequency describe uniform circular motion, and Kepler\'s third law relates an orbit\'s period to its radius.',
      body: String.raw`### Centripetal acceleration

$$a_c = \frac{v^2}{r} \quad \text{toward the center}$$

- Even at **constant speed**, the **direction** of velocity changes, so the object accelerates.
- Centripetal force isn't a new force. It is the **net inward force** from forces you already know: tension, gravity, friction, the normal force, or their components.

${steps({
  title: 'A 1,000 kg car rounds a flat curve of radius 50 m at 20 m/s. What force keeps it on the curve?',
  steps: [
    { title: 'Centripetal acceleration', body: '$a_c = \\dfrac{v^2}{r} = \\dfrac{20^2}{50} = 8\\ \\text{m/s}^2$' },
    { title: 'Net inward force', body: '$F = ma_c = 1000 \\times 8 = 8000\\ \\text{N}$, supplied by static friction from the road' },
  ],
  answer: '8,000 N of static friction toward the center',
})}

### Special cases
- **Top of a vertical loop at minimum speed**: gravity alone supplies the centripetal force, so $mg = mv^2/r$ and $v = \sqrt{gr}$. For $r = 10$ m, $v_{min} = 10$ m/s.
- **Bottom of a swing**: tension minus weight supplies the centripetal force, so $T = mg + mv^2/r$, **more** than the weight.
- **Banked curve**: components of the normal force (and friction, if needed) point toward the center. AP Physics 1 calculates only the case where **no friction** is needed.
- **Conical pendulum**: the horizontal component of tension supplies the centripetal force.

### Changing speed too
**Tangential acceleration** changes the speed and points along the path. The **net acceleration** is the vector sum of the centripetal and tangential accelerations.

### Period and frequency
- **Period** $T$: time for one revolution. **Frequency** $f$: revolutions per second. $T = 1/f$.
- At constant speed: $T = \dfrac{2\pi r}{v}$.

### Orbits and Kepler's third law
For a satellite in a circular orbit, gravity alone provides the centripetal acceleration. That gives

$$T^2 = \frac{4\pi^2}{GM}\,r^3$$

where $M$ is the central body's mass. Quadruple the orbit radius and the period grows by $4^{3/2} = 8$.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'What supplies the centripetal force?',
            buckets: ['Gravity', 'Tension', 'Friction', 'Normal force'],
            items: [
              { label: 'The Moon orbiting Earth', bucket: 0, why: 'Earth\'s gravity is the only force pulling the Moon toward the center.' },
              { label: 'A roller coaster car at the top of a loop at exactly the minimum speed', bucket: 0, why: 'At minimum speed the track pushes with zero force; gravity alone does it.' },
              { label: 'A ball whirled on a string in a horizontal circle', bucket: 1, why: 'The string pulls the ball toward the center.' },
              { label: 'A car rounding a flat, unbanked curve', bucket: 2, why: 'Static friction from the road points toward the center.' },
              { label: 'A coin riding on a spinning turntable', bucket: 2, why: 'Static friction keeps the coin from sliding outward.' },
              { label: 'A rider pressed against the wall of a spinning carnival rotor', bucket: 3, why: 'The wall pushes inward on the rider.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A ball moves in a horizontal circle at constant speed. Which statement is correct?',
        choices: [
          'It is accelerating toward the center of the circle',
          'It is not accelerating because its speed is constant',
          'It is accelerating outward, away from the center',
          'The net force on it is zero',
        ],
        answer: 0,
        explanations: [
          'Correct. Its velocity\'s direction changes, which requires centripetal acceleration toward the center.',
          'Incorrect. Acceleration includes changes in direction, not just speed.',
          'Incorrect. There is no outward force; the "pull outward" is inertia.',
          'Incorrect. A net inward force is needed to curve the path.',
        ],
      },
      checkpoints: [
        {
          question: 'A 0.5 kg ball on a 1.0 m string swings through the bottom of its arc at 4 m/s. What is the tension there?',
          choices: ['13 N', '5 N', '8 N', '3 N'],
          answer: 0,
          explanations: [
            'Correct. T − mg = mv²/r, so T = 5 + 0.5 × 16 / 1 = 13 N.',
            'Incorrect. That is just the weight; the string must also supply the centripetal force.',
            'Incorrect. That is only the centripetal force; the string must also hold up the weight.',
            'Incorrect. That subtracts the centripetal term from the weight instead of adding it.',
          ],
        },
        {
          question: 'Satellite B orbits a planet at 4 times the radius of satellite A. How do their periods compare?',
          choices: ['B\'s period is 8 times A\'s', 'B\'s period is 4 times A\'s', 'B\'s period is 16 times A\'s', 'B\'s period is 2 times A\'s'],
          answer: 0,
          explanations: [
            'Correct. T² ∝ r³, so T ∝ r^(3/2) = 4^(3/2) = 8.',
            'Incorrect. Period isn\'t proportional to radius.',
            'Incorrect. That would be T ∝ r².',
            'Incorrect. That would be T ∝ √r.',
          ],
        },
      ],
      revisit:
        'a_c = v²/r toward the center, supplied by real forces. Top of loop at minimum speed: v = √(gr). Bottom of a swing: ' +
        'T > mg. T = 1/f = 2πr/v. Orbits: T² = (4π²/GM)r³.',
    },
  ],
};

export default pack;
