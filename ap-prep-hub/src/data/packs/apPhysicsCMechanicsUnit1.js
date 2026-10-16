/**
 * AP Physics C: Mechanics Unit 1: Kinematics — study pack.
 *
 * Written against the AP Physics C: Mechanics CED (effective Fall 2024,
 * topics 1.1–1.5). Same topic list as Physics 1's kinematics, but calculus-
 * based: v = dx/dt, a = dv/dt, displacement and Δv as integrals, unit-vector
 * notation, and non-uniform acceleration handled quantitatively. Boundaries
 * followed: g = 10 m/s², frames inertial unless stated, quantitative 2-D
 * motion and qualitative 3-D motion.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-physics-c-mechanics/unit-1',
  subject: 'AP Physics C: Mechanics',
  unit: 'Unit 1: Kinematics',
  examWeight: '10–15% of the exam',
  intro:
    'Kinematics with calculus: position, velocity and acceleration are linked by derivatives and integrals, so motion with changing ' +
    'acceleration is fair game. This unit covers vectors in unit-vector notation, instantaneous rates, graphs, reference frames and ' +
    'motion in two dimensions, the language for every later unit in Physics C.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A',
      title: 'Scalars and Vectors',
      minutes: 5,
      summary:
        'Scalars have magnitude only; vectors have magnitude and direction. Vectors can be written as a magnitude and direction or in ' +
        'unit-vector notation, A = Aₓî + A_yĵ + A_zk̂, and a resultant is found by adding components.',
      body: String.raw`### Scalars and vectors
**Scalars**: distance, speed, time, mass. **Vectors**: position, displacement, velocity, acceleration (and force, momentum…). Drawn as arrows: length ∝ magnitude.

### Unit-vector notation

$$\vec{A} = A_x\hat{i} + A_y\hat{j} + A_z\hat{k}$$

$$|\vec{A}| = \sqrt{A_x^2 + A_y^2 + A_z^2}$$

$\hat{i}, \hat{j}, \hat{k}$ are unit vectors along $x$, $y$, $z$. The position vector is $\vec{r}$, and $\hat{r}$ is the unit vector pointing along it.

### Adding vectors
Add **component by component**: if $\vec{A} = 3\hat{i} - 2\hat{j}$ and $\vec{B} = \hat{i} + 5\hat{j}$, then $\vec{A} + \vec{B} = 4\hat{i} + 3\hat{j}$, with magnitude $\sqrt{4^2 + 3^2} = 5$.

In one dimension, opposite directions get opposite signs.`,
      blocks: [],
      precheck: {
        question: 'What is the magnitude of $\\vec{v} = 6\\hat{i} - 8\\hat{j}$ m/s?',
        choices: ['10 m/s', '14 m/s', '−2 m/s', '2 m/s'],
        answer: 0,
        explanations: [
          'Correct. $\\sqrt{6^2 + (-8)^2} = \\sqrt{100} = 10$ m/s.',
          'Incorrect. Components add as perpendicular legs, not directly.',
          'Incorrect. A magnitude can\'t be negative.',
          'Incorrect. That subtracts the component sizes; use the Pythagorean theorem.',
        ],
      },
      checkpoints: [
        {
          question: 'For $\\vec{A} = 2\\hat{i} + 3\\hat{j}$ and $\\vec{B} = -5\\hat{i} + \\hat{j}$, what is $\\vec{A} - \\vec{B}$?',
          choices: ['$7\\hat{i} + 2\\hat{j}$', '$-3\\hat{i} + 4\\hat{j}$', '$-7\\hat{i} - 2\\hat{j}$', '$7\\hat{i} + 4\\hat{j}$'],
          answer: 0,
          explanations: [
            'Correct. $(2 - (-5))\\hat{i} + (3 - 1)\\hat{j} = 7\\hat{i} + 2\\hat{j}$.',
            'Incorrect. That is $\\vec{A} + \\vec{B}$.',
            'Incorrect. That is $\\vec{B} - \\vec{A}$.',
            'Incorrect. Check the $\\hat{j}$ component: $3 - 1 = 2$.',
          ],
        },
        {
          question: 'Which list contains only vector quantities?',
          choices: ['Displacement, velocity, acceleration', 'Distance, speed, time', 'Speed, velocity, acceleration', 'Mass, displacement, velocity'],
          answer: 0,
          explanations: [
            'Correct. All three have a direction.',
            'Incorrect. All three are scalars.',
            'Incorrect. Speed is a scalar.',
            'Incorrect. Mass is a scalar.',
          ],
        },
      ],
      revisit:
        'Vectors: magnitude + direction, written $A_x\\hat i + A_y\\hat j + A_z\\hat k$; magnitude $\\sqrt{A_x^2 + A_y^2 + A_z^2}$. Add or subtract ' +
        'component by component.',
    },
    {
      id: '1.2',
      ced: '1.2.A–1.2.C',
      title: 'Displacement, Velocity, and Acceleration',
      minutes: 9,
      summary:
        'Displacement is change in position; average velocity and acceleration use the start and end states. As the interval shrinks to ' +
        'zero they become instantaneous: v = dx/dt and a = dv/dt. Differentiate to go from position to velocity to acceleration; integrate ' +
        'to go back.',
      body: String.raw`### Averages

$$\vec{v}_{avg} = \frac{\Delta\vec{r}}{\Delta t} \qquad \vec{a}_{avg} = \frac{\Delta\vec{v}}{\Delta t}$$

An object accelerates whenever its velocity's magnitude **or** direction changes.

### Instantaneous: derivatives
Let $\Delta t \to 0$:

$$v_x = \frac{dx}{dt} \qquad a_x = \frac{dv_x}{dt} = \frac{d^2x}{dt^2}$$

### Back again: integrals

$$\Delta x = \int_{t_1}^{t_2} v_x\,dt \qquad \Delta v_x = \int_{t_1}^{t_2} a_x\,dt$$

Add the initial value to get the function: $x(t) = x_0 + \int_0^t v_x\,dt'$.

${steps({
  title: 'A particle moves along x with x(t) = t³ − 6t² + 9t (m, s). When is it at rest, and what is its acceleration then?',
  steps: [
    { title: 'Velocity', body: '$v(t) = \\dfrac{dx}{dt} = 3t^2 - 12t + 9 = 3(t - 1)(t - 3)$' },
    { title: 'At rest', body: '$v = 0$ at $t = 1$ s and $t = 3$ s' },
    { title: 'Acceleration', body: '$a(t) = \\dfrac{dv}{dt} = 6t - 12$, so $a(1) = -6$ m/s² and $a(3) = +6$ m/s²' },
  ],
  answer: 'At rest at t = 1 s (a = −6 m/s²) and t = 3 s (a = +6 m/s²)',
})}

${steps({
  title: 'An object starts from rest at x = 0 with a(t) = 6t (m/s²). Find v(t) and x(t).',
  steps: [
    { title: 'Integrate a', body: '$v(t) = \\int_0^t 6t\\,dt = 3t^2$ (since $v(0) = 0$)' },
    { title: 'Integrate v', body: '$x(t) = \\int_0^t 3t^2\\,dt = t^3$ (since $x(0) = 0$)' },
  ],
  answer: 'v = 3t², x = t³',
})}`,
      blocks: [],
      precheck: {
        question: 'If $x(t) = 4t^2 - 2t$ (m, s), what is the velocity at $t = 2$ s?',
        choices: ['14 m/s', '12 m/s', '16 m/s', '8 m/s'],
        answer: 0,
        explanations: [
          'Correct. $v = 8t - 2$, so $v(2) = 14$ m/s.',
          'Incorrect. 12 m is the position at $t = 2$, not the velocity.',
          'Incorrect. That drops the −2 from the derivative.',
          'Incorrect. 8 m/s² is the acceleration.',
        ],
      },
      checkpoints: [
        {
          question: 'A particle\'s velocity is $v(t) = 3t^2$ m/s. What is its displacement from $t = 0$ to $t = 2$ s?',
          choices: ['8 m', '12 m', '6 m', '24 m'],
          answer: 0,
          explanations: [
            'Correct. $\\int_0^2 3t^2\\,dt = t^3\\big|_0^2 = 8$ m.',
            'Incorrect. 12 m/s is the velocity at $t = 2$ s.',
            'Incorrect. That uses $v$\'s derivative at $t = 1$; integrate instead.',
            'Incorrect. That multiplies the final velocity by the time; velocity isn\'t constant.',
          ],
        },
        {
          question: 'For $x(t) = t^3 - 6t^2 + 9t$ (m, s), is the particle speeding up or slowing down at $t = 4$ s?',
          choices: ['Speeding up', 'Slowing down', 'Neither, it is at rest', 'It is moving at constant speed'],
          answer: 0,
          explanations: [
            'Correct. $v(4) = 48 - 48 + 9 = 9$ m/s and $a(4) = 24 - 12 = 12$ m/s²: same sign, so the speed is increasing.',
            'Incorrect. Slowing down needs $v$ and $a$ with opposite signs; both are positive here.',
            'Incorrect. $v(4) = 9$ m/s, not zero; it is at rest only at $t = 1$ s and $t = 3$ s.',
            'Incorrect. $a(4) \\neq 0$, so the velocity is changing.',
          ],
        },
      ],
      revisit:
        '$v = dx/dt$, $a = dv/dt$; $\\Delta x = \\int v\\,dt$, $\\Delta v = \\int a\\,dt$. Factor $v(t)$ to find when it is at rest; compare signs of v and a ' +
        'for speeding up or slowing down.',
    },
    {
      id: '1.3',
      ced: '1.3.A',
      title: 'Representing Motion',
      minutes: 9,
      summary:
        'Motion can be shown with diagrams, graphs, equations and words. For constant acceleration, three kinematic equations apply ' +
        '(g = 10 m/s² near Earth). Slopes of x–t and v–t graphs give v and a; areas under v–t and a–t graphs give Δx and Δv.',
      body: String.raw`### Constant acceleration only

$$v_x = v_{x0} + a_x t$$

$$x = x_0 + v_{x0}t + \tfrac12 a_x t^2$$

$$v_x^2 = v_{x0}^2 + 2a_x(x - x_0)$$

They come from integrating a constant $a_x$ twice, so they **don't apply when acceleration changes**; use the calculus definitions instead. Near Earth, free-fall acceleration is $g \approx 10$ m/s² downward.

### Graphs
| Graph | Slope of the tangent | Area under the curve |
|---|---|---|
| $x$ vs $t$ | $v_x = \dfrac{dx}{dt}$ | — |
| $v_x$ vs $t$ | $a_x = \dfrac{dv_x}{dt}$ | $\Delta x = \int v_x\,dt$ |
| $a_x$ vs $t$ | — | $\Delta v_x = \int a_x\,dt$ |

Drag $a$ along the position curve: the tangent line's slope is the velocity there, and it's zero exactly where $v(t)$ crosses the axis (at $t = 1$ s and $t = 3$ s).

${graph({
  title: 'x(t) = t³ − 6t² + 9t: tangent slope = velocity',
  x: [0, 4.5], y: [-6, 10],
  xLabel: 'time t (s)', yLabel: 'x (m), v (m/s)',
  curves: [
    { expr: 'x^3 - 6*x^2 + 9*x', label: 'position x(t)' },
    { expr: '(a^3 - 6*a^2 + 9*a) + (3*a^2 - 12*a + 9)*(x - a)', label: 'tangent at t = a' },
    { expr: '3*x^2 - 12*x + 9', label: 'velocity v(t)' },
  ],
  params: { a: { min: 0, max: 4.5, value: 2, step: 0.1, label: 'time a (s)' } },
})}`,
      blocks: [],
      precheck: {
        question: 'The area under a velocity-versus-time graph over an interval equals the object\'s:',
        choices: ['Displacement', 'Acceleration', 'Average velocity', 'Speed'],
        answer: 0,
        explanations: [
          'Correct. $\\Delta x = \\int v\\,dt$, the signed area.',
          'Incorrect. Acceleration is the slope of the v–t graph.',
          'Incorrect. Average velocity is the area divided by the time interval.',
          'Incorrect. Area gives a change in position, not a speed.',
        ],
      },
      checkpoints: [
        {
          question: 'An object\'s acceleration is $a(t) = 2t$ (m/s²). Why can\'t $x = x_0 + v_0t + \\tfrac12at^2$ be used directly?',
          choices: [
            'That equation assumes constant acceleration, and here a changes with time',
            'It only works for vertical motion',
            'It only works when the object starts from rest',
            'It can be used if you plug in a at the final time',
          ],
          answer: 0,
          explanations: [
            'Correct. With non-uniform acceleration, integrate: $v = v_0 + t^2$, then $x = x_0 + v_0t + t^3/3$.',
            'Incorrect. The kinematic equations work along any single axis, when a is constant.',
            'Incorrect. Nonzero initial velocity is allowed; changing acceleration is the problem.',
            'Incorrect. Using one value of a for the whole interval gives the wrong answer.',
          ],
        },
        {
          question: 'A ball is thrown straight up at 15 m/s from the ground (g = 10 m/s²). How long until it lands?',
          choices: ['3.0 s', '1.5 s', '2.25 s', '0.67 s'],
          answer: 0,
          explanations: [
            'Correct. $0 = 15t - 5t^2 \\Rightarrow t = 3.0$ s.',
            'Incorrect. 1.5 s is the time to the top.',
            'Incorrect. That divides 22.5 by 10; set the displacement to zero instead.',
            'Incorrect. That inverts the ratio of 10 and 15.',
          ],
        },
      ],
      revisit:
        'Kinematic equations need constant a; otherwise differentiate and integrate. Slope of x–t = v, slope of v–t = a; area under v–t = Δx, ' +
        'under a–t = Δv. g = 10 m/s².',
    },
    {
      id: '1.4',
      ced: '1.4.A–1.4.B',
      title: 'Reference Frames and Relative Motion',
      minutes: 5,
      summary:
        'What an observer measures depends on their reference frame. Velocities convert between frames by vector addition; all inertial ' +
        'frames measure the same acceleration. Frames are inertial unless stated otherwise.',
      body: String.raw`### Converting between frames

$$\vec{v}_{\text{object, ground}} = \vec{v}_{\text{object, frame}} + \vec{v}_{\text{frame, ground}}$$

and the velocity of A seen from B is $\vec v_A - \vec v_B$.

${steps({
  title: 'A plane flies 200 m/s north relative to the air in a 50 m/s east wind. Find its ground velocity.',
  steps: [
    { title: 'Add the vectors', body: '$\\vec{v} = 50\\hat{i} + 200\\hat{j}$ m/s (east = $\\hat{i}$, north = $\\hat{j}$)' },
    { title: 'Magnitude', body: '$\\sqrt{50^2 + 200^2} \\approx 206$ m/s' },
    { title: 'Direction', body: '$\\tan\\theta = 50/200$, so about $14^\\circ$ east of north' },
  ],
  answer: 'About 206 m/s, 14° east of north',
})}

### Acceleration is frame-independent
Every **inertial** frame (constant velocity relative to another inertial frame) measures the **same acceleration**. Unless a problem says otherwise, assume frames are inertial.`,
      blocks: [],
      precheck: {
        question: 'Train A moves at +30 m/s and train B at +20 m/s on parallel tracks. What is A\'s velocity measured from B?',
        choices: ['+10 m/s', '+50 m/s', '−10 m/s', '+30 m/s'],
        answer: 0,
        explanations: [
          'Correct. $v_A - v_B = 30 - 20 = +10$ m/s.',
          'Incorrect. Speeds add only for opposite directions.',
          'Incorrect. That is B as seen from A.',
          'Incorrect. That is A relative to the ground.',
        ],
      },
      checkpoints: [
        {
          question: 'A boat heads directly across a river at 3 m/s relative to the water; the current is 4 m/s. Relative to the shore, the boat\'s speed is:',
          choices: ['5 m/s', '7 m/s', '1 m/s', '3 m/s'],
          answer: 0,
          explanations: [
            'Correct. Perpendicular components: $\\sqrt{3^2 + 4^2} = 5$ m/s.',
            'Incorrect. Only collinear velocities add directly.',
            'Incorrect. Subtraction is for opposite directions along one line.',
            'Incorrect. The current also moves the boat.',
          ],
        },
        {
          question: 'Two inertial observers watch the same falling ball. Which quantity must they agree on?',
          choices: ['The ball\'s acceleration', 'The ball\'s velocity', 'The ball\'s position', 'The ball\'s path shape'],
          answer: 0,
          explanations: [
            'Correct. Acceleration is the same in all inertial frames.',
            'Incorrect. Velocity depends on the observer\'s motion.',
            'Incorrect. Position depends on where each origin is.',
            'Incorrect. A straight drop in one frame can be a parabola in another.',
          ],
        },
      ],
      revisit:
        'Ground velocity = velocity in the frame + frame\'s velocity; A seen from B = $\\vec v_A - \\vec v_B$. Inertial frames agree on acceleration.',
    },
    {
      id: '1.5',
      ced: '1.5.A',
      title: 'Motion in Two or Three Dimensions',
      minutes: 9,
      summary:
        'Motion in 2-D or 3-D splits into independent 1-D components that share time; velocity and acceleration can differ by direction and ' +
        'need not be uniform. A projectile has zero horizontal acceleration and constant vertical acceleration. 2-D motion is quantitative; ' +
        '3-D is qualitative.',
      body: String.raw`### Components are independent

$$\vec{r}(t) = x(t)\hat{i} + y(t)\hat{j}$$

$$\vec{v} = \frac{d\vec{r}}{dt} \qquad \vec{a} = \frac{d\vec{v}}{dt}$$

Each component is its own 1-D problem; they share only $t$. Acceleration can differ in each direction and can be non-uniform. A change in one direction doesn't cause a change in the perpendicular direction.

${steps({
  title: 'A particle has r(t) = (2t²) î + (4t − t²) ĵ (m, s). Find its velocity and acceleration at t = 1 s.',
  steps: [
    { title: 'Differentiate each component', body: '$\\vec{v}(t) = 4t\\,\\hat{i} + (4 - 2t)\\,\\hat{j}$, so $\\vec v(1) = 4\\hat{i} + 2\\hat{j}$ m/s' },
    { title: 'Again', body: '$\\vec{a} = 4\\hat{i} - 2\\hat{j}$ m/s² (constant here)' },
    { title: 'Speed', body: '$|\\vec v(1)| = \\sqrt{16 + 4} \\approx 4.5$ m/s' },
  ],
  answer: 'v = 4î + 2ĵ m/s, a = 4î − 2ĵ m/s²',
})}

### Projectiles
No air resistance: $a_x = 0$, $a_y = -g$. Horizontal velocity is constant; vertical velocity changes by 10 m/s each second; at the top, $v_y = 0$. Launch from ground level and land at the same height: $t = \dfrac{2v_0\sin\theta}{g}$, range $R = \dfrac{v_0^2\sin 2\theta}{g}$, largest at 45°.

The exam asks for 2-D motion quantitatively and 3-D motion only qualitatively.`,
      blocks: [{ type: 'sim', sim: 'projectile-launcher' }],
      precheck: {
        question: 'For a projectile with no air resistance, which component of velocity stays constant?',
        choices: ['The horizontal component', 'The vertical component', 'Both components', 'Neither component'],
        answer: 0,
        explanations: [
          'Correct. $a_x = 0$, so $v_x$ never changes.',
          'Incorrect. Gravity changes $v_y$ by 10 m/s each second.',
          'Incorrect. Only the horizontal one.',
          'Incorrect. The horizontal component is constant.',
        ],
      },
      checkpoints: [
        {
          question: 'A projectile is launched from level ground at 20 m/s and 45°. What is its range? (g = 10 m/s²)',
          choices: ['40 m', '20 m', '28 m', '80 m'],
          answer: 0,
          explanations: [
            'Correct. $R = v_0^2\\sin 2\\theta / g = 400 \\times 1 / 10 = 40$ m.',
            'Incorrect. That is half the range; with $\\theta = 45^\\circ$, $\\sin 2\\theta = 1$.',
            'Incorrect. 28 m would come from $\\sin 45^\\circ$ instead of $\\sin 90^\\circ$.',
            'Incorrect. That doubles the range: $400 \\times 1 \\div 10 = 40$ m.',
          ],
        },
        {
          question: 'A particle\'s position is $\\vec r(t) = 3t\\,\\hat{i} + t^3\\,\\hat{j}$ (m, s). What is its acceleration at $t = 2$ s?',
          choices: ['$12\\hat{j}$ m/s²', '$3\\hat{i} + 12\\hat{j}$ m/s²', '$6\\hat{j}$ m/s²', '$3\\hat{i} + 6\\hat{j}$ m/s²'],
          answer: 0,
          explanations: [
            'Correct. $\\vec v = 3\\hat i + 3t^2\\hat j$, $\\vec a = 6t\\,\\hat j$, so at 2 s, $12\\hat j$ m/s².',
            'Incorrect. That mixes in the velocity\'s $\\hat i$ component; its derivative is zero.',
            'Incorrect. That is the acceleration at $t = 1$ s.',
            'Incorrect. The $\\hat{i}$ part of the acceleration is zero.',
          ],
        },
      ],
      revisit:
        'Split into components sharing t; differentiate each for $\\vec v$ and $\\vec a$. Projectile: $a_x = 0$, $a_y = -g$; $R = v_0^2\\sin2\\theta/g$ ' +
        'from level ground. 2-D quantitative, 3-D qualitative.',
    },
  ],
};

export default pack;
