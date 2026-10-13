/**
 * AP Calculus AB Unit 2: Differentiation: Definition and Fundamental
 * Properties — study pack.
 *
 * Written against the AP Calculus AB and BC CED (topics 2.1–2.10, CHA-2.A–2.D,
 * FUN-2.A, FUN-3.A–3.B, LIM-3.A) and checked by hand; every derivative and
 * estimate below was recomputed. Dan McCreary's "Calculus" (CC BY-NC-SA 4.0)
 * was used as a reference for the differentiability and estimation sections;
 * see `credits`. Import-free for scripts/prerender.mjs.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-calculus-ab/unit-2',
  subject: 'AP Calculus AB',
  unit: 'Unit 2: Differentiation: Definition and Fundamental Properties',
  examWeight: '10–15% of the AB exam',
  intro:
    'The derivative is the limit from Unit 1 put to work: the instantaneous rate of change, the slope of the tangent line. This unit ' +
    'defines it, says when it exists, and builds the rules that make finding it fast.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Calculus',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/calculus/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'Used as a reference for differentiability and estimating derivatives.',
    },
  ],
  sections: [
    {
      id: '2.1',
      ced: 'CHA-2.A, CHA-2.B.1',
      title: 'Average and Instantaneous Rates of Change',
      minutes: 5,
      summary: String.raw`The difference quotient $\frac{f(a+h) - f(a)}{h}$ (or $\frac{f(x) - f(a)}{x - a}$) is an average rate of change over an interval. Its limit as $h \to 0$ is the instantaneous rate of change at $a$, written $f'(a)$, when that limit exists.`,
      body: String.raw`### Average rate of change
Over an interval, the average rate of change is the slope of the **secant line**:
$$\frac{f(a+h) - f(a)}{h} \quad\text{or}\quad \frac{f(x) - f(a)}{x - a}.$$
Both are **difference quotients**: change in output over change in input.

### Instantaneous rate of change
Shrink the interval to zero and take the limit:
$$f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h} = \lim_{x \to a} \frac{f(x) - f(a)}{x - a},$$
provided the limit exists. The two forms are equivalent definitions of the **derivative at $a$**.

**Units:** a rate of change carries "output units per input unit": meters per second, liters per minute, dollars per item.`,
      blocks: [],
      precheck: {
        question: String.raw`What is the average rate of change of $f(x) = x^2$ on $[1, 3]$?`,
        choices: ['4', '8', '2', '6'],
        answer: 0,
        explanations: [
          String.raw`Correct. $\frac{f(3) - f(1)}{3 - 1} = \frac{9 - 1}{2} = 4$.`,
          'Incorrect. 8 is the change in f; divide by the change in x (2).',
          'Incorrect. 2 is the change in x; the rate is change in f over change in x.',
          String.raw`Incorrect. 6 is the instantaneous rate at $x = 3$ ($2x$), not the average over $[1, 3]$.`,
        ],
      },
      checkpoints: [
        {
          question: String.raw`Which expression gives the instantaneous rate of change of $f$ at $x = 3$?`,
          choices: [
            String.raw`$\lim_{h \to 0} \frac{f(3+h) - f(3)}{h}$`,
            String.raw`$\frac{f(3+h) - f(3)}{h}$`,
            String.raw`$\frac{f(3) - f(0)}{3}$`,
            String.raw`$\lim_{h \to 0} \left(f(3+h) - f(3)\right)$`,
          ],
          answer: 0,
          explanations: [
            'Correct. The limit of the difference quotient as h → 0 is the derivative at 3.',
            'Incorrect. Without the limit this is an average rate over [3, 3 + h].',
            'Incorrect. That is the average rate of change over [0, 3].',
            'Incorrect. Without dividing by h this is just a change in f, which goes to 0 for a continuous f.',
          ],
        },
        {
          question: String.raw`A ball's height is $h(t) = 20t - 5t^2$ meters at $t$ seconds. What is its average velocity on $[1, 2]$?`,
          choices: ['5 m/s', '10 m/s', '20 m/s', '15 m/s'],
          answer: 0,
          explanations: [
            String.raw`Correct. $h(1) = 15$, $h(2) = 20$, so $\frac{20 - 15}{2 - 1} = 5$ m/s.`,
            String.raw`Incorrect. 10 m/s is the instantaneous velocity at $t = 1$ ($h'(t) = 20 - 10t$), not the average on $[1, 2]$.`,
            'Incorrect. 20 is the height at t = 2, not a velocity.',
            'Incorrect. 15 is the height at t = 1, not a velocity.',
          ],
        },
      ],
      revisit: String.raw`Average rate = slope of the secant = $\frac{\Delta f}{\Delta x}$. Instantaneous rate = the limit of that as the interval shrinks to 0 = $f'(a)$. Units: output per input.`,
    },
    {
      id: '2.2',
      ced: 'CHA-2.B.2–2.B.4, CHA-2.C',
      title: 'The Derivative Function, Notation, and Tangent Lines',
      minutes: 7,
      summary: String.raw`The derivative function is $f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$, also written $\frac{dy}{dx}$ or $y'$. Its value at a point is the slope of the tangent line there, so the tangent line at $x = a$ is $y = f(a) + f'(a)(x - a)$.`,
      body: String.raw`### From a number to a function
Find the derivative at **every** $x$ and you get a new function:
$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}.$$
Notations: $f'(x)$, $y'$, $\frac{dy}{dx}$, $\frac{d}{dx}f(x)$. The derivative can be shown as a graph, a table, a formula or in words.

${steps({
  title: 'Use the definition to differentiate f(x) = x²',
  steps: [
    { title: 'Set up', body: '$\\frac{(x+h)^2 - x^2}{h} = \\frac{x^2 + 2xh + h^2 - x^2}{h} = \\frac{2xh + h^2}{h}$' },
    { title: 'Simplify', body: 'For $h \\neq 0$: $2x + h$.' },
    { title: 'Take the limit', body: 'As $h \\to 0$: $2x$.' },
  ],
  answer: "f'(x) = 2x",
})}

### Tangent lines
$f'(a)$ is the **slope of the tangent line** at $x = a$. The tangent line goes through $(a, f(a))$, so in point-slope form:
$$y = f(a) + f'(a)(x - a).$$

${graph({
  title: 'f(x) = x³ − 3x and its tangent line at x = a',
  x: [-3, 3], y: [-6, 6],
  curves: [
    { expr: 'x^3 - 3*x', label: 'f(x)' },
    { expr: '(a^3 - 3*a) + (3*a^2 - 3)*(x - a)', label: 'tangent at a' },
  ],
  params: { a: { min: -2.5, max: 2.5, value: 1.5, step: 0.05, label: 'point of tangency a' } },
})}

Here $f'(x) = 3x^2 - 3$. Drag **a** to $\pm 1$ and the tangent line is flat: the slope there is $0$.`,
      blocks: [],
      precheck: {
        question: String.raw`$f'(a)$ is the slope of:`,
        choices: [
          String.raw`The tangent line to the graph of $f$ at $x = a$`,
          String.raw`The secant line from $x = 0$ to $x = a$`,
          String.raw`The graph of $f$ everywhere`,
          String.raw`The line through the origin and $(a, f(a))$`,
        ],
        answer: 0,
        explanations: [
          'Correct. The derivative at a point is the tangent line\'s slope there.',
          'Incorrect. That is an average rate of change, not the derivative.',
          'Incorrect. A curve\'s slope changes from point to point; f\'(a) is the slope at x = a only.',
          'Incorrect. That is a secant line from the origin, not the tangent.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`Using the definition of the derivative, $f(x) = x^2$ gives $f'(x) =$`,
          choices: [String.raw`$2x$`, String.raw`$x^2$`, String.raw`$2x + h$`, '$2$'],
          answer: 0,
          explanations: [
            String.raw`Correct. $\lim_{h \to 0} \frac{2xh + h^2}{h} = \lim_{h \to 0}(2x + h) = 2x$.`,
            'Incorrect. That is f itself, not its derivative.',
            'Incorrect. That is the difference quotient before taking the limit; h still has to go to 0.',
            'Incorrect. The slope of x² changes with x; it is 2x, not the constant 2.',
          ],
        },
        {
          question: String.raw`What is the equation of the line tangent to $f(x) = x^3$ at $x = 1$?`,
          choices: [String.raw`$y = 3x - 2$`, String.raw`$y = 3x + 1$`, String.raw`$y = 3x$`, String.raw`$y = x$`],
          answer: 0,
          explanations: [
            String.raw`Correct. $f(1) = 1$ and $f'(x) = 3x^2$ so $f'(1) = 3$: $y = 1 + 3(x - 1) = 3x - 2$.`,
            String.raw`Incorrect. That line passes through $(1, 4)$, not the point of tangency $(1, 1)$.`,
            String.raw`Incorrect. That line passes through $(1, 3)$; the tangent must go through $(1, 1)$.`,
            String.raw`Incorrect. Its slope is 1, but $f'(1) = 3$.`,
          ],
        },
      ],
      revisit: String.raw`$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$. Tangent line at $a$: point $(a, f(a))$, slope $f'(a)$, so $y = f(a) + f'(a)(x - a)$.`,
    },
    {
      id: '2.3',
      ced: 'CHA-2.D',
      title: 'Estimating Derivatives from Tables and Graphs',
      minutes: 5,
      summary: String.raw`From a table, estimate $f'(a)$ with the slope between nearby points; for an interior point, the symmetric difference quotient $\frac{f(a+h) - f(a-h)}{2h}$ is usually best. From a graph, estimate the slope of the tangent line. Always attach units.`,
      body: String.raw`### From a table
You can't take a limit with three data points, so estimate with the closest secant slope.
- **One side:** $\frac{f(b) - f(a)}{b - a}$ using the nearest point.
- **Both sides (symmetric):** if there are points equally spaced on each side of $a$, use $\frac{f(a+h) - f(a-h)}{2h}$. It usually balances out the error from each side.

${steps({
  title: 'Estimate f\'(3) from f(1) = 3, f(3) = 7, f(5) = 15',
  steps: [
    { title: 'Use the points on both sides', body: '$\\frac{f(5) - f(1)}{5 - 1} = \\frac{15 - 3}{4} = 3$' },
    { title: 'Compare the one-sided estimates', body: 'Left: $\\frac{7 - 3}{2} = 2$. Right: $\\frac{15 - 7}{2} = 4$. The symmetric estimate sits between them.' },
  ],
  answer: "f'(3) ≈ 3",
})}

### From a graph
Picture the tangent line at the point and estimate its rise over run from two points on it. A horizontal tangent means $f' = 0$; steeper means bigger.

### With units
If $V(t)$ is liters at minute $t$, then $V'(t)$ is in **liters per minute**. Free-response questions take a point if the units are missing.

Calculators can find numerical derivatives too; the exam lets you use them where a calculator is allowed.`,
      blocks: [],
      precheck: {
        question: String.raw`A table gives $f(2) = 5$ and $f(2.1) = 5.4$. The best estimate of $f'(2)$ from these values is:`,
        choices: ['4', '0.4', '5.4', '40'],
        answer: 0,
        explanations: [
          String.raw`Correct. $\frac{5.4 - 5}{2.1 - 2} = \frac{0.4}{0.1} = 4$.`,
          'Incorrect. 0.4 is the change in f; divide by the change in x (0.1).',
          'Incorrect. 5.4 is a function value, not a slope.',
          'Incorrect. Check the division: 0.4 ÷ 0.1 = 4.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$f(1) = 3$, $f(3) = 7$ and $f(5) = 15$. Which is the best estimate of $f'(3)$?`,
          choices: ['3', '2', '4', '7'],
          answer: 0,
          explanations: [
            String.raw`Correct. The symmetric estimate $\frac{15 - 3}{5 - 1} = 3$ uses data on both sides of 3.`,
            'Incorrect. That uses only the left side: (7 − 3)/2.',
            'Incorrect. That uses only the right side: (15 − 7)/2.',
            'Incorrect. 7 is f(3), the value, not the rate of change.',
          ],
        },
        {
          question: String.raw`The volume of water in a tank is $V(4) = 120$ liters and $V(6) = 150$ liters, with $t$ in minutes. Which is the best estimate of $V'(5)$?`,
          choices: ['15 liters per minute', '15 liters', '135 liters per minute', '30 liters per minute'],
          answer: 0,
          explanations: [
            String.raw`Correct. $\frac{150 - 120}{6 - 4} = 15$, and the units are liters per minute.`,
            'Incorrect. A rate of change needs per-minute units, not just liters.',
            'Incorrect. 135 is the average of the volumes, not a rate.',
            'Incorrect. 30 liters is the change in volume; divide by the 2 minutes.',
          ],
        },
      ],
      revisit: String.raw`Table: slope between the closest points, symmetric $\frac{f(a+h) - f(a-h)}{2h}$ when you can. Graph: slope of the tangent you picture. Units: output per input.`,
    },
    {
      id: '2.4',
      ced: 'FUN-2.A',
      title: 'Differentiability and Continuity',
      minutes: 6,
      summary: String.raw`If $f$ is differentiable at $a$, it is continuous at $a$. The reverse is false: a continuous function can fail to be differentiable at a corner (like $|x|$ at $0$), a cusp, or a vertical tangent (like $\sqrt[3]{x}$ at $0$). A discontinuity always means no derivative.`,
      body: String.raw`### One direction only
**Differentiable ⟹ continuous.** If $f'(a)$ exists, then $f$ is continuous at $a$. So if $a$ isn't in the domain of $f$, it isn't in the domain of $f'$, and any **discontinuity** means no derivative.

**Continuous ⟹ differentiable? No.** A continuous function can still fail to have a derivative:

| Where it fails | Example | Why |
|---|---|---|
| **Corner** | $\lvert x \rvert$ at $0$ | Left-hand slope $-1$, right-hand slope $1$: the one-sided limits of the difference quotient disagree |
| **Cusp** | $x^{2/3}$ at $0$ | Slopes run to $-\infty$ on one side and $+\infty$ on the other |
| **Vertical tangent** | $\sqrt[3]{x}$ at $0$ | The tangent line is vertical; its slope is undefined |

${graph({
  title: 'y = |x − a| has a corner at x = a',
  x: [-4, 4], y: [-1, 4],
  curves: [{ expr: 'abs(x - a)', label: '|x − a|' }],
  params: { a: { min: -2, max: 2, value: 0, step: 0.5, label: 'corner at a' } },
})}

At the corner, no single tangent line fits: slope $-1$ just to the left, $1$ just to the right.

**Local linearity.** Where $f$ is differentiable, zooming in makes the graph look like a straight line (its tangent). Zoom in on a corner and it stays a corner.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Differentiable at a ⇒ ?', back: 'Continuous at a' },
            { front: 'Continuous at a ⇒ differentiable?', back: 'Not necessarily (corners, cusps, vertical tangents)' },
            { front: 'Three ways a continuous function can fail to be differentiable', back: 'Corner, cusp, vertical tangent' },
            { front: 'Local linearity', back: 'Zoomed in near a point where f is differentiable, the graph looks like its tangent line' },
          ],
        },
      ],
      precheck: {
        question: String.raw`If $f$ is differentiable at $x = a$, then $f$ must be:`,
        choices: [String.raw`Continuous at $a$`, String.raw`Equal to $0$ at $a$`, 'Increasing near a', 'A polynomial'],
        answer: 0,
        explanations: [
          'Correct. Differentiability implies continuity.',
          'Incorrect. Differentiability says nothing about the function\'s value.',
          'Incorrect. A differentiable function can be increasing, decreasing or flat.',
          'Incorrect. Many non-polynomials are differentiable, like sin x and eˣ.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`At $x = 2$, the function $f(x) = |x - 2|$ is:`,
          choices: [
            'Continuous but not differentiable',
            'Differentiable but not continuous',
            'Both continuous and differentiable',
            'Neither continuous nor differentiable',
          ],
          answer: 0,
          explanations: [
            'Correct. No break, but a corner: slope −1 on the left and 1 on the right.',
            'Incorrect. This combination is impossible: differentiable always implies continuous.',
            'Incorrect. The one-sided slopes disagree at the corner, so there is no derivative.',
            'Incorrect. The graph has no break at x = 2, so it is continuous.',
          ],
        },
        {
          question: 'Which statement is true?',
          choices: [
            'A function can be continuous at a point but not differentiable there',
            'If a function is continuous at a point, it is differentiable there',
            'If a function is not differentiable at a point, it is not continuous there',
            'A function with a vertical tangent at x = a is differentiable at a',
          ],
          answer: 0,
          explanations: [
            'Correct. |x| at 0 is the standard example.',
            'Incorrect. Corners, cusps and vertical tangents are continuous but not differentiable.',
            'Incorrect. |x| is not differentiable at 0 but is continuous there.',
            'Incorrect. A vertical tangent has undefined slope, so the derivative does not exist.',
          ],
        },
      ],
      revisit: 'Differentiable ⇒ continuous, never the other way around. Continuous but not differentiable: corner, cusp, vertical tangent. A break means no derivative.',
    },
    {
      id: '2.5–2.6',
      ced: 'FUN-3.A.1–3.A.3',
      title: 'The Power Rule and Basic Derivative Rules',
      minutes: 6,
      summary: String.raw`Power rule: $\frac{d}{dx}x^n = nx^{n-1}$ for any real $n$. Constants differentiate to $0$, constant multiples come along for the ride, and sums and differences differentiate term by term, which together handle every polynomial.`,
      body: String.raw`### The rules
| Rule | In symbols |
|---|---|
| Constant | $\frac{d}{dx}c = 0$ |
| Power | $\frac{d}{dx}x^n = nx^{n-1}$ |
| Constant multiple | $\frac{d}{dx}[c\,f(x)] = c\,f'(x)$ |
| Sum and difference | $\frac{d}{dx}[f(x) \pm g(x)] = f'(x) \pm g'(x)$ |

The power rule works for **any real exponent**, so rewrite roots and fractions as powers first.

${steps({
  title: 'Differentiate y = 4x³ − 2√x + 3/x² − 7',
  steps: [
    { title: 'Rewrite as powers', body: '$y = 4x^3 - 2x^{1/2} + 3x^{-2} - 7$' },
    { title: 'Power rule term by term', body: '$12x^2 - 2 \\cdot \\tfrac{1}{2}x^{-1/2} + 3(-2)x^{-3} - 0$' },
    { title: 'Simplify', body: '$12x^2 - x^{-1/2} - 6x^{-3} = 12x^2 - \\frac{1}{\\sqrt{x}} - \\frac{6}{x^3}$' },
  ],
  answer: "y' = 12x² − 1/√x − 6/x³",
})}`,
      blocks: [],
      precheck: {
        question: String.raw`$\frac{d}{dx}x^5 =$`,
        choices: [String.raw`$5x^4$`, String.raw`$x^4$`, String.raw`$5x^5$`, String.raw`$\frac{x^6}{6}$`],
        answer: 0,
        explanations: [
          'Correct. Bring the 5 down and subtract 1 from the exponent.',
          'Incorrect. The exponent comes down as a factor: 5x⁴.',
          'Incorrect. The exponent also drops by 1.',
          'Incorrect. That is an antiderivative, the reverse process.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$\frac{d}{dx}\left(4x^3 - 2x + 7\right) =$`,
          choices: [String.raw`$12x^2 - 2$`, String.raw`$12x^2 - 2x$`, String.raw`$4x^2 - 2$`, String.raw`$12x^2 - 2 + 7$`],
          answer: 0,
          explanations: [
            'Correct. 4·3x² − 2 + 0.',
            'Incorrect. The derivative of 2x is 2, not 2x.',
            'Incorrect. Multiply by the exponent: 4·3 = 12.',
            'Incorrect. The derivative of the constant 7 is 0.',
          ],
        },
        {
          question: String.raw`$\frac{d}{dx}\sqrt{x} =$`,
          choices: [String.raw`$\frac{1}{2\sqrt{x}}$`, String.raw`$\frac{\sqrt{x}}{2}$`, String.raw`$2\sqrt{x}$`, String.raw`$\frac{1}{\sqrt{x}}$`],
          answer: 0,
          explanations: [
            String.raw`Correct. $x^{1/2} \to \tfrac{1}{2}x^{-1/2} = \frac{1}{2\sqrt{x}}$.`,
            'Incorrect. The exponent must drop by 1, to −1/2.',
            'Incorrect. That is closer to an antiderivative-style mistake; use the power rule on x^(1/2).',
            'Incorrect. The coefficient 1/2 from the exponent is missing.',
          ],
        },
      ],
      revisit: String.raw`Rewrite as powers, then $\frac{d}{dx}x^n = nx^{n-1}$ term by term. Constants vanish; constant multiples stay.`,
    },
    {
      id: '2.7',
      ced: 'FUN-3.A.4, LIM-3.A',
      title: 'Derivatives of sin x, cos x, eˣ and ln x',
      minutes: 6,
      summary: String.raw`$\frac{d}{dx}\sin x = \cos x$, $\frac{d}{dx}\cos x = -\sin x$, $\frac{d}{dx}e^x = e^x$, $\frac{d}{dx}\ln x = \frac{1}{x}$. A limit that looks like a difference quotient can sometimes be read as one of these derivatives.`,
      body: String.raw`### Four derivatives to know cold
| $f(x)$ | $f'(x)$ |
|---|---|
| $\sin x$ | $\cos x$ |
| $\cos x$ | $-\sin x$ |
| $e^x$ | $e^x$ |
| $\ln x$ | $\frac{1}{x}$ |

${graph({
  title: 'The slope of sin x at x = a is cos a',
  x: [-6.3, 6.3], y: [-2, 2],
  curves: [
    { expr: 'sin(x)', label: 'sin x' },
    { expr: 'cos(x)', label: 'cos x' },
    { expr: 'sin(a) + cos(a)*(x - a)', label: 'tangent to sin at a' },
  ],
  params: { a: { min: -6, max: 6, value: 0.8, step: 0.05, label: 'a' } },
})}

Wherever the tangent to $\sin x$ is flat, $\cos x$ crosses zero; where $\sin x$ climbs steepest, $\cos x$ is at its peak.

### Limits that are secretly derivatives
A limit shaped like $\lim_{h \to 0} \frac{f(a+h) - f(a)}{h}$ **is** $f'(a)$. Recognize $f$ and $a$ and you're done:
$$\lim_{h \to 0} \frac{e^{2+h} - e^2}{h} = \frac{d}{dx}e^x\Big|_{x=2} = e^2.$$`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'd/dx sin x', back: 'cos x' },
            { front: 'd/dx cos x', back: '−sin x' },
            { front: 'd/dx eˣ', back: 'eˣ' },
            { front: 'd/dx ln x', back: '1/x' },
          ],
        },
      ],
      precheck: {
        question: String.raw`$\frac{d}{dx}\sin x =$`,
        choices: [String.raw`$\cos x$`, String.raw`$-\cos x$`, String.raw`$-\sin x$`, String.raw`$\sin x$`],
        answer: 0,
        explanations: [
          'Correct. The derivative of sine is cosine.',
          'Incorrect. There is no negative for the derivative of sine.',
          'Incorrect. That is the derivative of cosine.',
          'Incorrect. Only eˣ is its own derivative.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$\frac{d}{dx}\left(e^x + \ln x\right) =$`,
          choices: [String.raw`$e^x + \frac{1}{x}$`, String.raw`$xe^{x-1} + \frac{1}{x}$`, String.raw`$e^x + \ln x$`, String.raw`$e^x - \frac{1}{x}$`],
          answer: 0,
          explanations: [
            'Correct. eˣ is its own derivative, and the derivative of ln x is 1/x.',
            'Incorrect. The power rule does not apply to eˣ; the variable is in the exponent.',
            'Incorrect. ln x is not its own derivative; its derivative is 1/x.',
            'Incorrect. The derivative of ln x is +1/x.',
          ],
        },
        {
          question: String.raw`$\lim_{h \to 0} \frac{\sin\left(\frac{\pi}{2} + h\right) - \sin\left(\frac{\pi}{2}\right)}{h} =$`,
          choices: ['0', '1', 'It does not exist', '−1'],
          answer: 0,
          explanations: [
            String.raw`Correct. This is the derivative of $\sin x$ at $\frac{\pi}{2}$: $\cos\frac{\pi}{2} = 0$.`,
            String.raw`Incorrect. 1 is $\sin\frac{\pi}{2}$, the function value, not the derivative.`,
            'Incorrect. sin x is differentiable everywhere, so this limit exists.',
            String.raw`Incorrect. $\cos\frac{\pi}{2} = 0$, not $-1$.`,
          ],
        },
      ],
      revisit: String.raw`sin → cos, cos → −sin, $e^x$ → $e^x$, $\ln x$ → $\frac{1}{x}$. A limit of the form $\frac{f(a+h) - f(a)}{h}$ is just $f'(a)$.`,
    },
    {
      id: '2.8–2.10',
      ced: 'FUN-3.B',
      title: 'Product Rule, Quotient Rule, and the Other Trig Functions',
      minutes: 8,
      summary: String.raw`Product rule: $(fg)' = f'g + fg'$. Quotient rule: $\left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}$. With them: $\frac{d}{dx}\tan x = \sec^2 x$, $\frac{d}{dx}\cot x = -\csc^2 x$, $\frac{d}{dx}\sec x = \sec x\tan x$, $\frac{d}{dx}\csc x = -\csc x\cot x$.`,
      body: String.raw`### Product rule
$$\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x).$$
The derivative of a product is **not** the product of the derivatives.

### Quotient rule
$$\frac{d}{dx}\left[\frac{f(x)}{g(x)}\right] = \frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}.$$
Memory aid: "low d-high minus high d-low, over the square of what's below." The order matters because of the minus sign.

${steps({
  title: 'Show that d/dx tan x = sec² x',
  steps: [
    { title: 'Write as a quotient', body: '$\\tan x = \\frac{\\sin x}{\\cos x}$' },
    { title: 'Quotient rule', body: '$\\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x}$' },
    { title: 'Pythagorean identity', body: '$\\frac{1}{\\cos^2 x} = \\sec^2 x$' },
  ],
  answer: 'd/dx tan x = sec² x',
})}

### All six trig derivatives
| $f(x)$ | $f'(x)$ |
|---|---|
| $\tan x$ | $\sec^2 x$ |
| $\cot x$ | $-\csc^2 x$ |
| $\sec x$ | $\sec x \tan x$ |
| $\csc x$ | $-\csc x \cot x$ |

The "co-" functions (cos, cot, csc) all have a minus sign.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Product rule', back: "(fg)' = f'g + fg'" },
            { front: 'Quotient rule', back: "(f/g)' = (f'g − fg') / g²" },
            { front: 'd/dx tan x', back: 'sec² x' },
            { front: 'd/dx sec x', back: 'sec x tan x' },
            { front: 'd/dx cot x and d/dx csc x', back: '−csc² x and −csc x cot x' },
          ],
        },
      ],
      precheck: {
        question: String.raw`The product rule says $\frac{d}{dx}[f(x)g(x)] =$`,
        choices: [String.raw`$f'(x)g(x) + f(x)g'(x)$`, String.raw`$f'(x)g'(x)$`, String.raw`$f'(x)g(x) - f(x)g'(x)$`, String.raw`$\frac{f'(x)}{g'(x)}$`],
        answer: 0,
        explanations: [
          'Correct. Derivative of the first times the second, plus the first times the derivative of the second.',
          'Incorrect. The derivative of a product is not the product of the derivatives.',
          'Incorrect. The minus sign belongs in the quotient rule\'s numerator.',
          'Incorrect. That is not any derivative rule.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$\frac{d}{dx}\left(x^2 \sin x\right) =$`,
          choices: [
            String.raw`$2x\sin x + x^2\cos x$`,
            String.raw`$2x\cos x$`,
            String.raw`$2x\sin x - x^2\cos x$`,
            String.raw`$x^2\cos x$`,
          ],
          answer: 0,
          explanations: [
            String.raw`Correct. $(x^2)' \sin x + x^2 (\sin x)' = 2x\sin x + x^2\cos x$.`,
            'Incorrect. That multiplies the two derivatives; use the product rule.',
            'Incorrect. The product rule adds the two terms.',
            'Incorrect. The term from differentiating x² is missing.',
          ],
        },
        {
          question: String.raw`$\frac{d}{dx}\left(\frac{x}{x+1}\right) =$`,
          choices: [String.raw`$\frac{1}{(x+1)^2}$`, String.raw`$\frac{-1}{(x+1)^2}$`, '$1$', String.raw`$\frac{2x+1}{(x+1)^2}$`],
          answer: 0,
          explanations: [
            String.raw`Correct. $\frac{1 \cdot (x+1) - x \cdot 1}{(x+1)^2} = \frac{1}{(x+1)^2}$.`,
            'Incorrect. The numerator is (low)(d high) − (high)(d low) = (x + 1) − x = 1, which is positive.',
            'Incorrect. That divides the derivatives (1/1); use the quotient rule.',
            'Incorrect. The numerator is a difference, (x + 1) − x, not a sum.',
          ],
        },
      ],
      revisit: String.raw`Product: $f'g + fg'$. Quotient: $\frac{f'g - fg'}{g^2}$ (order matters). Trig: tan → $\sec^2$, sec → sec tan, and the co- functions get a minus sign.`,
    },
  ],
};

export default pack;
