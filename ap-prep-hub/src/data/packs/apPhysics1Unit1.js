/**
 * AP Physics 1 Unit 1: Kinematics — study pack.
 *
 * Written against the AP Physics 1: Algebra-Based CED (effective Fall 2024,
 * topics 1.1–1.5). Follows its boundary statements: g = 10 m/s² in every
 * number (9.8 isn't marked wrong, but the exam uses 10), and non-uniform
 * acceleration is qualitative only, so every calculation here has constant
 * acceleration. Projectile motion is the CED's special case of 2-D motion:
 * no horizontal acceleration, constant downward acceleration.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-physics-1/unit-1',
  subject: 'AP Physics 1: Algebra-Based',
  unit: 'Unit 1: Kinematics',
  examWeight: '10–15% of the exam',
  intro:
    'Kinematics describes motion without asking what causes it: where an object is, how fast it moves, and how that changes. ' +
    'Everything later in the course (forces, energy, momentum) is built on reading and writing motion in words, graphs, ' +
    'equations and diagrams, and on splitting 2-D motion into two 1-D problems.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A–1.1.B',
      title: 'Scalars and Vectors in One Dimension',
      minutes: 4,
      summary:
        'Scalars have only a magnitude (distance, speed, time). Vectors have a magnitude and a direction (position, displacement, ' +
        'velocity, acceleration). In one dimension the sign of a vector component is its direction, so adding vectors means adding signed numbers.',
      body: String.raw`### Magnitude, or magnitude and direction
- **Scalar**: magnitude only. **Distance**, **speed**, time and mass are scalars.
- **Vector**: magnitude **and** direction. **Position**, **displacement**, **velocity** and **acceleration** are vectors.

A vector is drawn as an arrow: its length is proportional to the magnitude and it points in the vector's direction. In print, a vector gets an arrow over its symbol, like $\vec{v}$.

### One dimension: the sign is the direction
Pick a positive direction (say, right or up). Then a vector along that line is just a signed number: $v_x = +3\ \text{m/s}$ is 3 m/s right, $v_x = -3\ \text{m/s}$ is 3 m/s left. You don't need arrow notation for components along an axis.

**Adding vectors in 1-D:** give opposite directions opposite signs and add.

| Trip | Distance (scalar) | Displacement (vector) |
|---|---|---|
| 30 m east, then 50 m west | 80 m | $+30 + (-50) = -20$ m, so 20 m **west** |
| One lap of a 400 m track | 400 m | 0 m (you end where you started) |

Distance can never be negative or smaller than the size of the displacement; displacement can be zero after a long trip.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Scalar', back: 'Magnitude only: distance, speed, time, mass.' },
            { front: 'Vector', back: 'Magnitude and direction: position, displacement, velocity, acceleration.' },
            { front: 'Sign of a 1-D component', back: 'Its direction along the chosen axis: + one way, − the other.' },
            { front: 'Distance vs displacement', back: 'Distance is total path length (scalar); displacement is the change in position (vector).' },
          ],
        },
      ],
      precheck: {
        question: 'Which of these is a vector quantity?',
        choices: ['Displacement', 'Distance', 'Speed', 'Time'],
        answer: 0,
        explanations: [
          'Correct. Displacement has a size and a direction (for example, 20 m west).',
          'Incorrect. Distance is the total path length, a magnitude only.',
          'Incorrect. Speed is how fast, with no direction; velocity is the vector.',
          'Incorrect. Time has no direction; it is a scalar.',
        ],
      },
      checkpoints: [
        {
          question: 'A runner completes exactly one lap of a 400 m track and stops at the starting line. What are the distance traveled and the displacement?',
          choices: ['400 m and 0 m', '0 m and 400 m', '400 m and 400 m', '200 m and 0 m'],
          answer: 0,
          explanations: [
            'Correct. The path is 400 m long, but the runner ends where they started, so the change in position is zero.',
            'Incorrect. That swaps them: distance counts the whole path, displacement only the start-to-end change.',
            'Incorrect. Displacement depends only on the start and end points, which are the same.',
            'Incorrect. Distance is the full 400 m path, not half of it.',
          ],
        },
        {
          question: 'With east as positive, a car drives 30 m east and then 50 m west. What is its displacement?',
          choices: ['−20 m (20 m west)', '+80 m', '+20 m (20 m east)', '−80 m'],
          answer: 0,
          explanations: [
            'Correct. $+30 + (-50) = -20$ m: the negative sign means west.',
            'Incorrect. 80 m is the distance; displacement adds the signed parts.',
            'Incorrect. The size is right but the car ends up west of where it started, so the sign is negative.',
            'Incorrect. The 30 m east partly cancels the 50 m west; they don\'t add to 80.',
          ],
        },
      ],
      revisit:
        'Vectors (position, displacement, velocity, acceleration) have direction; scalars (distance, speed, time) don\'t. ' +
        'In 1-D, choose a positive direction, give the opposite direction a minus sign, and add.',
    },
    {
      id: '1.2',
      ced: '1.2.A–1.2.B',
      title: 'Displacement, Velocity, and Acceleration',
      minutes: 6,
      summary:
        'Displacement is the change in position. Average velocity is displacement divided by time; average acceleration is change in ' +
        'velocity divided by time. An object accelerates whenever its speed or its direction changes, and averages over a tiny interval ' +
        'are the instantaneous values.',
      body: String.raw`### The object model
Treat the object as a single point: ignore its size, shape and what's inside. (Its mass still counts later.)

### The three definitions
| Quantity | Definition | Units |
|---|---|---|
| Displacement | $\Delta x = x - x_0$ | m |
| Average velocity | $\bar{v}_x = \dfrac{\Delta x}{\Delta t}$ | m/s |
| Average acceleration | $\bar{a}_x = \dfrac{\Delta v_x}{\Delta t}$ | m/s² |

Averages only use the **initial and final** states over the interval: what happened in between doesn't enter the formula.

### When is something accelerating?
Whenever its velocity changes, in **magnitude, direction, or both**. A car rounding a curve at a steady 20 m/s is accelerating, because its direction changes.

### Speeding up or slowing down?
Compare the signs of $v$ and $a$:
- **Same sign** → speeding up.
- **Opposite signs** → slowing down. Negative acceleration does **not** always mean slowing down.

### Instantaneous values
Shrink $\Delta t$ toward zero and the average velocity (or acceleration) gets very close to the **instantaneous** value at that moment.

${steps({
  title: 'A cart moving at +6 m/s is moving at −4 m/s 2.0 s later. Find its average acceleration.',
  steps: [
    { title: 'Change in velocity', body: '$\\Delta v = v - v_0 = (-4) - (+6) = -10$ m/s' },
    { title: 'Divide by the time', body: '$\\bar{a} = \\dfrac{-10\\ \\text{m/s}}{2.0\\ \\text{s}} = -5\\ \\text{m/s}^2$' },
    { title: 'Read the sign', body: 'Negative: the acceleration points in the − direction the whole time, first slowing the cart, then speeding it up backward.' },
  ],
  answer: '−5 m/s²',
})}`,
      blocks: [],
      precheck: {
        question: 'An object moves from x = 2 m to x = 14 m in 4 s. What is its average velocity?',
        choices: ['+3 m/s', '+3.5 m/s', '+4 m/s', '+0.5 m/s'],
        answer: 0,
        explanations: [
          'Correct. $\\Delta x / \\Delta t = (14 - 2)/4 = 3$ m/s.',
          'Incorrect. That divides the final position, 14 m, by 4 s instead of the displacement, 12 m.',
          'Incorrect. Check the subtraction: the displacement is 12 m, not 16 m.',
          'Incorrect. That is 2 m ÷ 4 s; use the change in position.',
        ],
      },
      checkpoints: [
        {
          question: 'A car drives around a circular curve at a constant speed of 20 m/s. Is it accelerating?',
          choices: [
            'Yes, because the direction of its velocity is changing',
            'No, because its speed is constant',
            'No, because acceleration requires the speedometer reading to change',
            'Only if the curve is banked',
          ],
          answer: 0,
          explanations: [
            'Correct. Velocity is a vector; changing its direction is a change in velocity, so the car accelerates.',
            'Incorrect. Constant speed is not constant velocity when the direction changes.',
            'Incorrect. A change in direction alone counts as acceleration.',
            'Incorrect. Banking affects which forces act, not whether the velocity changes.',
          ],
        },
        {
          question: 'A ball is thrown straight up at +8 m/s and is caught at the same height 1.6 s later, moving at −8 m/s. What was its average acceleration?',
          choices: ['−10 m/s²', '0 m/s²', '+10 m/s²', '−5 m/s²'],
          answer: 0,
          explanations: [
            'Correct. $\\Delta v / \\Delta t = (-8 - 8)/1.6 = -10$ m/s², which is $g$ pointing down.',
            'Incorrect. The speed is the same, but the velocity reversed, so it changed by 16 m/s.',
            'Incorrect. The change in velocity is negative (from +8 to −8), so the acceleration is too.',
            'Incorrect. That uses a change of 8 m/s; going from +8 to −8 is a change of 16 m/s.',
          ],
        },
        {
          question: 'At one instant an object has velocity −6 m/s and acceleration +2 m/s². At that instant the object is:',
          choices: ['Slowing down', 'Speeding up', 'At rest', 'Moving in the + direction'],
          answer: 0,
          explanations: [
            'Correct. Velocity and acceleration have opposite signs, so the speed is decreasing.',
            'Incorrect. Speeding up needs velocity and acceleration with the same sign.',
            'Incorrect. Its velocity is −6 m/s, not zero.',
            'Incorrect. The negative velocity means it is moving in the − direction.',
          ],
        },
      ],
      revisit:
        '$\\bar v = \\Delta x/\\Delta t$ and $\\bar a = \\Delta v/\\Delta t$, using final minus initial. Any change in speed or direction is an ' +
        'acceleration. Same signs for $v$ and $a$: speeding up; opposite signs: slowing down.',
    },
    {
      id: '1.3',
      ced: '1.3.A',
      title: 'Representing Motion',
      minutes: 10,
      summary:
        'Motion can be shown in diagrams, graphs, equations and words. With constant acceleration, three kinematic equations apply, and ' +
        'near Earth g = 10 m/s² downward. On graphs: slope of x–t is velocity, slope of v–t is acceleration, area under v–t is displacement, ' +
        'and area under a–t is change in velocity.',
      body: String.raw`### Constant acceleration: three equations

$$v_x = v_{x0} + a_x t$$

$$x = x_0 + v_{x0} t + \tfrac{1}{2} a_x t^2$$

$$v_x^2 = v_{x0}^2 + 2 a_x (x - x_0)$$

Pick the one that leaves out the quantity you neither know nor need. They work along any single axis, including vertical.

**Free fall:** near Earth's surface the acceleration from gravity is downward and constant, $g \approx 10\ \text{m/s}^2$ (the exam's value). With up as positive, $a_y = -10\ \text{m/s}^2$ on the way up, at the top, and on the way down.

${steps({
  title: 'A ball is thrown straight up at 20 m/s. How high does it rise?',
  steps: [
    { title: 'Know / want', body: 'Up is +. $v_{y0} = +20$ m/s, $a_y = -10$ m/s², at the top $v_y = 0$. Want $\\Delta y$; time isn\'t given or asked.' },
    { title: 'Equation without t', body: '$v_y^2 = v_{y0}^2 + 2a_y\\Delta y \\Rightarrow 0 = 400 + 2(-10)\\Delta y$' },
    { title: 'Solve', body: '$\\Delta y = \\dfrac{400}{20} = 20$ m' },
  ],
  answer: '20 m',
})}

### Reading graphs
| Graph | Slope gives | Area under the curve gives |
|---|---|---|
| Position vs time ($x$–$t$) | velocity | — |
| Velocity vs time ($v$–$t$) | acceleration | displacement |
| Acceleration vs time ($a$–$t$) | — | change in velocity |

Instantaneous velocity is the slope of the **tangent line** to the $x$–$t$ graph at that time. Area below the time axis counts as **negative**.

Drag the sliders: with constant acceleration the velocity graph is a straight line (constant slope $a$) and the position graph is a parabola whose slope at each time equals the velocity there.

${graph({
  title: 'Constant acceleration: position and velocity vs time',
  x: [0, 4], y: [-12, 12],
  xLabel: 'time t (s)', yLabel: 'x (m) and v (m/s)',
  curves: [
    { expr: 'v0*x + 0.5*a*x^2', label: 'position x(t)' },
    { expr: 'v0 + a*x', label: 'velocity v(t)' },
  ],
  params: {
    v0: { min: -4, max: 4, value: 4, step: 1, label: 'initial velocity v₀ (m/s)' },
    a: { min: -2, max: 2, value: -2, step: 0.5, label: 'acceleration a (m/s²)' },
  },
})}

With $v_0 = 4$ m/s and $a = -2$ m/s²: the velocity line crosses zero at $t = 2$ s, and that is exactly where the position graph peaks at 4 m (its slope is zero). By $t = 4$ s the object is back at $x = 0$, moving at $-4$ m/s.

**Non-uniform acceleration** (a curved $v$–$t$ graph) only needs to be described and sketched, not calculated.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Slope of a position–time graph', back: 'Velocity (slope of the tangent line = instantaneous velocity).' },
            { front: 'Slope of a velocity–time graph', back: 'Acceleration.' },
            { front: 'Area under a velocity–time graph', back: 'Displacement (area below the axis counts negative).' },
            { front: 'Area under an acceleration–time graph', back: 'Change in velocity.' },
            { front: 'Acceleration of a ball at the top of its flight', back: '10 m/s² downward. Its velocity is momentarily zero, its acceleration is not.' },
          ],
        },
      ],
      precheck: {
        question: 'The slope of a position-versus-time graph at an instant gives the object\'s:',
        choices: ['Instantaneous velocity', 'Acceleration', 'Displacement', 'Distance traveled'],
        answer: 0,
        explanations: [
          'Correct. Slope = change in position ÷ change in time = velocity.',
          'Incorrect. Acceleration is the slope of a velocity–time graph.',
          'Incorrect. Displacement is read as a change in the position values, or as area under a v–t graph.',
          'Incorrect. Distance is not a slope; it comes from the path length.',
        ],
      },
      checkpoints: [
        {
          question: 'A velocity–time graph is a straight line from (0 s, 0 m/s) to (4 s, 12 m/s). How far does the object travel in those 4 s?',
          choices: ['24 m', '48 m', '12 m', '3 m'],
          answer: 0,
          explanations: [
            'Correct. Displacement is the area under the line: a triangle, $\\tfrac{1}{2}(4)(12) = 24$ m.',
            'Incorrect. 48 m is the full rectangle; the area under a line starting at zero is a triangle, half of that.',
            'Incorrect. 12 m/s is the final velocity, not a distance.',
            'Incorrect. 3 m/s² is the slope (the acceleration); the distance is the area.',
          ],
        },
        {
          question: 'A ball is thrown straight up at 20 m/s (use g = 10 m/s²). How long until it reaches its highest point?',
          choices: ['2 s', '4 s', '1 s', '20 s'],
          answer: 0,
          explanations: [
            'Correct. $v = v_0 + at \\Rightarrow 0 = 20 - 10t$, so $t = 2$ s.',
            'Incorrect. 4 s is the time to go up and come back down to the launch height.',
            'Incorrect. After 1 s it is still moving up at 10 m/s.',
            'Incorrect. That divides by 1 instead of by g = 10 m/s².',
          ],
        },
        {
          question: 'At the very top of its flight, a ball thrown straight up has:',
          choices: [
            'Zero velocity and an acceleration of 10 m/s² downward',
            'Zero velocity and zero acceleration',
            'A velocity of 10 m/s downward and zero acceleration',
            'Zero velocity and an acceleration of 10 m/s² upward',
          ],
          answer: 0,
          explanations: [
            'Correct. It stops for an instant, but gravity still changes its velocity by 10 m/s every second, downward.',
            'Incorrect. If the acceleration were zero there, the ball would stay at the top forever.',
            'Incorrect. Its velocity at the top is zero, and its acceleration is never zero in free fall.',
            'Incorrect. Gravity\'s acceleration always points down.',
          ],
        },
      ],
      revisit:
        'Constant $a$: $v = v_0 + at$, $x = x_0 + v_0t + \\tfrac12at^2$, $v^2 = v_0^2 + 2a\\Delta x$. Free fall: $a = 10$ m/s² down, ' +
        'even at the top. Graphs: slope of $x$–$t$ = $v$, slope of $v$–$t$ = $a$, area under $v$–$t$ = $\\Delta x$, area under $a$–$t$ = $\\Delta v$.',
    },
    {
      id: '1.4',
      ced: '1.4.A–1.4.B',
      title: 'Reference Frames and Relative Motion',
      minutes: 5,
      summary:
        'What you measure depends on your reference frame. To convert, add the object\'s velocity relative to a moving frame to that ' +
        'frame\'s velocity (as vectors). Every inertial (non-accelerating) frame measures the same acceleration.',
      body: String.raw`### Motion is measured from somewhere
A reference frame is the viewpoint (and coordinate system) an observer measures from. The **same** motion can have a different direction and size in different frames: a passenger sitting in a bus is at rest to the driver and moving at 15 m/s to someone on the sidewalk.

### Converting between frames

$$\begin{aligned} \vec{v}_{\text{object rel. ground}} &= \vec{v}_{\text{object rel. frame}} \\ &\quad + \vec{v}_{\text{frame rel. ground}} \end{aligned}$$

In 1-D that's adding signed numbers:

| You walk… on a train moving +20 m/s | Your velocity relative to the ground |
|---|---|
| toward the front at 1.5 m/s | $+1.5 + 20 = +21.5$ m/s |
| toward the back at 1.5 m/s | $-1.5 + 20 = +18.5$ m/s |

**Velocity of A as seen by B:** $\vec v_{A\text{ rel. }B} = \vec v_A - \vec v_B$. Two cars driving toward each other at 15 m/s each close in at 30 m/s.

### Acceleration doesn't depend on the frame
Every **inertial** frame (one moving at constant velocity) measures the same acceleration. Drop a ball on a smoothly moving train: you see it fall straight down, someone on the platform sees a curved path, and both measure 10 m/s² downward.`,
      blocks: [],
      precheck: {
        question: 'A passenger sits in a bus moving at 15 m/s. Relative to the bus driver, the passenger\'s speed is:',
        choices: ['0 m/s', '15 m/s', '30 m/s', 'It depends on where the passenger sits'],
        answer: 0,
        explanations: [
          'Correct. Passenger and driver move together, so in the driver\'s frame the passenger is at rest.',
          'Incorrect. 15 m/s is the passenger\'s speed relative to the ground.',
          'Incorrect. Nothing here adds the two speeds; they are moving together.',
          'Incorrect. Seat position doesn\'t change the relative velocity: both move with the bus.',
        ],
      },
      checkpoints: [
        {
          question: 'Car A drives east at 25 m/s and car B drives east at 20 m/s. What is A\'s velocity as measured by someone in car B?',
          choices: ['5 m/s east', '45 m/s east', '5 m/s west', '25 m/s east'],
          answer: 0,
          explanations: [
            'Correct. $v_{A\\text{ rel. }B} = v_A - v_B = 25 - 20 = +5$ m/s, east.',
            'Incorrect. Speeds add only when the cars move toward (or away from) each other in opposite directions.',
            'Incorrect. A is faster, so from B it pulls ahead, toward the east.',
            'Incorrect. 25 m/s is A\'s velocity relative to the ground, not to B.',
          ],
        },
        {
          question: 'A passenger on a train moving at constant velocity drops a ball. Which statement is true?',
          choices: [
            'The passenger and an observer on the platform measure the same acceleration, but see different paths',
            'The passenger sees the ball fall with a smaller acceleration than the platform observer does',
            'Both observers see the ball fall straight down',
            'The platform observer sees the ball land behind the point below where it was dropped',
          ],
          answer: 0,
          explanations: [
            'Correct. Both frames are inertial, so both measure 10 m/s² down; the passenger sees a straight drop, the platform observer a curve.',
            'Incorrect. Acceleration is the same in every inertial frame.',
            'Incorrect. The ball keeps the train\'s horizontal velocity, so from the platform its path curves.',
            'Incorrect. The ball moves forward with the train, so it lands directly below the drop point in the train.',
          ],
        },
        {
          question: 'Two cars drive straight toward each other, each at 15 m/s relative to the road. How fast does the gap between them close?',
          choices: ['30 m/s', '0 m/s', '15 m/s', '7.5 m/s'],
          answer: 0,
          explanations: [
            'Correct. With one direction positive: $v_{A\\text{ rel. }B} = 15 - (-15) = 30$ m/s.',
            'Incorrect. Their speeds are equal but their velocities are opposite, so they don\'t cancel.',
            'Incorrect. That ignores the other car\'s motion.',
            'Incorrect. Halving doesn\'t apply: the relative velocity is the difference of the two velocities.',
          ],
        },
      ],
      revisit:
        'Velocity relative to the ground = velocity relative to the moving frame + the frame\'s velocity. A as seen by B: $v_A - v_B$. ' +
        'Inertial frames disagree about velocity but agree about acceleration.',
    },
    {
      id: '1.5',
      ced: '1.5.A–1.5.B',
      title: 'Vectors and Motion in Two Dimensions',
      minutes: 10,
      summary:
        'Any vector can be split into perpendicular components with sine and cosine. Two-dimensional motion is two one-dimensional ' +
        'problems sharing the same time. A projectile has no horizontal acceleration and a constant 10 m/s² downward acceleration.',
      body: String.raw`### Components
A vector of size $A$ at angle $\theta$ above the $+x$ axis:

$$A_x = A\cos\theta \qquad A_y = A\sin\theta$$

and back again: $A = \sqrt{A_x^2 + A_y^2}$, $\tan\theta = \dfrac{A_y}{A_x}$.

Choose the coordinate system that makes the problem easiest; the physics doesn't change.

### Split the motion, share the time
Motion in 2-D can be analyzed with the 1-D equations **separately for each component**. The only thing $x$ and $y$ share is **time**.

### Projectile motion
With no air resistance:
| | Horizontal ($x$) | Vertical ($y$, up +) |
|---|---|---|
| Acceleration | $0$ | $-10$ m/s² |
| Velocity | constant, $v_0\cos\theta$ | $v_0\sin\theta - 10t$ |
| Position | $x = (v_0\cos\theta)\,t$ | $y = y_0 + (v_0\sin\theta)\,t - 5t^2$ |

At the highest point the **vertical** velocity is zero; the horizontal velocity is unchanged. A ball dropped and a ball launched horizontally from the same height land **at the same time**.

${steps({
  title: 'A ball rolls off a 20 m high ledge at 3 m/s horizontally. How far from the base does it land?',
  steps: [
    { title: 'Vertical: find the time', body: '$v_{y0} = 0$, $\\Delta y = -20$ m: $-20 = -\\tfrac12(10)t^2 \\Rightarrow t^2 = 4$, $t = 2$ s' },
    { title: 'Horizontal: use the same time', body: '$\\Delta x = v_x t = (3)(2) = 6$ m' },
  ],
  answer: '6 m from the base',
})}

${steps({
  title: 'A ball is kicked from the ground at 20 m/s, 30° above horizontal. Find its time in the air and range.',
  steps: [
    { title: 'Components', body: '$v_x = 20\\cos 30^\\circ \\approx 17.3$ m/s, $v_{y0} = 20\\sin 30^\\circ = 10$ m/s' },
    { title: 'Time in the air', body: 'It lands at the launch height: $0 = 10t - 5t^2 \\Rightarrow t = 2$ s' },
    { title: 'Range', body: '$\\Delta x = v_x t \\approx (17.3)(2) \\approx 35$ m' },
  ],
  answer: '2 s, about 35 m',
})}

Use the launcher to check it: 20 m/s at 30° lands about 35 m away after 2.0 s. Then try 60°: the same range, but a higher, longer flight.`,
      blocks: [{ type: 'sim', sim: 'projectile-launcher' }],
      precheck: {
        question: 'With no air resistance, at the highest point of a projectile\'s path its velocity is:',
        choices: [
          'Horizontal, equal to its horizontal velocity at launch',
          'Zero',
          'Vertical and downward',
          'Equal to its launch velocity',
        ],
        answer: 0,
        explanations: [
          'Correct. The vertical component is zero at the top, and the horizontal component never changed.',
          'Incorrect. Only the vertical component is zero; the projectile is still moving sideways.',
          'Incorrect. At the very top the vertical velocity is zero, not downward.',
          'Incorrect. The vertical part of the launch velocity is gone at the top, so the speed is smaller.',
        ],
      },
      checkpoints: [
        {
          question: 'From the same height at the same moment, ball A is dropped and ball B is launched horizontally at 10 m/s. Ignoring air resistance, which lands first?',
          choices: ['They land at the same time', 'Ball A', 'Ball B', 'It depends on the masses of the balls'],
          answer: 0,
          explanations: [
            'Correct. Both start with zero vertical velocity and fall with the same 10 m/s²; horizontal motion doesn\'t affect vertical motion.',
            'Incorrect. B\'s horizontal velocity doesn\'t slow its fall.',
            'Incorrect. B travels farther, but its fall takes the same time.',
            'Incorrect. Free-fall acceleration doesn\'t depend on mass.',
          ],
        },
        {
          question: 'A velocity of 10 m/s points 30° above the horizontal. What are its horizontal and vertical components?',
          choices: ['8.7 m/s and 5.0 m/s', '5.0 m/s and 8.7 m/s', '10 m/s and 10 m/s', '7.1 m/s and 7.1 m/s'],
          answer: 0,
          explanations: [
            'Correct. $10\\cos30^\\circ \\approx 8.7$ m/s horizontal and $10\\sin30^\\circ = 5.0$ m/s vertical.',
            'Incorrect. Those are swapped: cosine goes with the side next to the 30° angle, the horizontal one.',
            'Incorrect. Components are smaller than the vector itself.',
            'Incorrect. Equal components would mean a 45° angle.',
          ],
        },
        {
          question: 'A boat points straight across a river at 4 m/s relative to the water, and the current flows at 3 m/s. What is the boat\'s speed relative to the shore?',
          choices: ['5 m/s', '7 m/s', '1 m/s', '4 m/s'],
          answer: 0,
          explanations: [
            'Correct. The two velocities are perpendicular, so $\\sqrt{4^2 + 3^2} = 5$ m/s.',
            'Incorrect. Adding 4 + 3 only works for velocities along the same line.',
            'Incorrect. Subtracting would be for velocities in opposite directions.',
            'Incorrect. That ignores the current pushing the boat downstream.',
          ],
        },
        {
          question: 'A ball is launched horizontally at 12 m/s from a cliff 45 m high. How far from the base of the cliff does it land? (g = 10 m/s²)',
          choices: ['36 m', '12 m', '45 m', '108 m'],
          answer: 0,
          explanations: [
            'Correct. Falling 45 m from rest: $45 = 5t^2$, $t = 3$ s. Horizontally: $12 \\times 3 = 36$ m.',
            'Incorrect. That is the distance covered in only 1 s.',
            'Incorrect. 45 m is the height; the horizontal distance depends on the speed and the fall time.',
            'Incorrect. That uses 9 s; the fall time is $\\sqrt{2(45)/10} = 3$ s.',
          ],
        },
      ],
      revisit:
        '$A_x = A\\cos\\theta$, $A_y = A\\sin\\theta$. Solve $x$ and $y$ separately; they share only the time. Projectile: horizontal velocity ' +
        'constant, vertical acceleration 10 m/s² down, vertical velocity zero at the top.',
    },
  ],
};

export default pack;
