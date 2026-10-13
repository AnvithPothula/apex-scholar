/**
 * AP Calculus AB Unit 1: Limits and Continuity — study pack.
 *
 * Written against the AP Calculus AB and BC CED (Course Framework, topics
 * 1.1–1.16, learning objectives LIM-1.A–LIM-2.D and FUN-1.A). Topics are grouped
 * into seven sections the way they're taught; 1.7 (selecting procedures) and 1.9
 * (connecting representations) are skills folded into the sections around them.
 * The epsilon-delta definition is excluded by the CED and isn't used.
 *
 * Every numeric answer below was worked twice (in the explanation and by hand).
 * Same shape as apBiologyUnit1.js; checked by utils/studyPack.validatePack.
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-calculus-ab/unit-1',
  subject: 'AP Calculus AB',
  unit: 'Unit 1: Limits and Continuity',
  examWeight: '10–15% of the AB exam',
  intro:
    'A limit asks what a function is heading toward, not where it lands. That one idea defines the derivative in Unit 2 ' +
    'and the integral in Unit 6, and it is how calculus handles change "at an instant".',
  sections: [
    {
      id: '1.1–1.2',
      ced: 'LIM-1.A, LIM-1.B',
      title: 'What a Limit Is',
      minutes: 6,
      summary: String.raw`An average rate of change needs an interval; at a single instant it would be $\frac{0}{0}$. A limit fixes that: $\lim_{x \to c} f(x) = L$ means $f(x)$ can be made as close to $L$ as you like by taking $x$ close enough to $c$, **but not equal to** $c$. What happens exactly at $c$ doesn't matter.`,
      body: String.raw`### Change at an instant
Average velocity over an interval is $\frac{\Delta s}{\Delta t}$. Shrink the interval to a single instant and $\Delta t = 0$, so the formula breaks. Calculus looks instead at what the average rates **approach** as the interval shrinks.

For $s(t) = t^2$, the average velocity on $[2,\ 2+h]$ is
$$\frac{(2+h)^2 - 4}{h} = \frac{4h + h^2}{h} = 4 + h \quad (h \neq 0).$$
As $h$ gets close to $0$ this gets close to $4$, so the instantaneous velocity at $t = 2$ is $4$.

${graph({
  title: 'Secant line to y = x² through x = 2 and x = 2 + h',
  x: [-1, 5], y: [-2, 20],
  curves: [{ expr: 'x^2', label: 'y = x²' }, { expr: '4 + (4 + h)*(x - 2)', label: 'secant line' }],
  params: { h: { min: 0.05, max: 2.5, value: 2, step: 0.05, label: 'h (interval width)' } },
})}

Drag **h** toward 0: the secant line turns into the tangent line, and its slope $4 + h$ turns into $4$.

### Limit notation
$$\lim_{x \to c} f(x) = L$$
reads "the limit of $f(x)$ as $x$ approaches $c$ is $L$". Three things it does **not** say:
- that $f(c) = L$ ($f(c)$ might be different or not exist at all);
- that $f(x)$ ever equals $L$;
- anything about $x$ far from $c$.

A limit can be given graphically, in a table, or by a formula; the exam moves between all three.`,
      blocks: [],
      precheck: {
        question: String.raw`What does $\lim_{x \to 3} f(x) = 5$ mean?`,
        choices: [
          String.raw`$f(x)$ gets arbitrarily close to $5$ as $x$ gets close to $3$ (with $x \neq 3$)`,
          String.raw`$f(3) = 5$`,
          String.raw`$f(x) = 5$ for every $x$ near $3$`,
          String.raw`$f(x)$ can never equal $5$`,
        ],
        answer: 0,
        explanations: [
          'Correct. A limit describes where the values are heading near 3, ignoring x = 3 itself.',
          'Incorrect. The value at 3 can be anything, or undefined; the limit ignores it.',
          'Incorrect. The values only need to approach 5, not equal it.',
          'Incorrect. The limit says nothing against f(x) equaling 5; it often does.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`A function $g$ has $g(2) = 7$, but as $x$ approaches $2$ from either side, $g(x)$ approaches $3$. What is $\lim_{x \to 2} g(x)$?`,
          choices: ['3', '7', 'It does not exist', '5'],
          answer: 0,
          explanations: [
            'Correct. Both sides approach 3, and the value at x = 2 is irrelevant to the limit.',
            'Incorrect. 7 is the function value at 2; the limit only depends on values near 2.',
            'Incorrect. The two one-sided limits agree (both 3), so the limit exists.',
            'Incorrect. Averaging 3 and 7 has no meaning here; the limit is 3.',
          ],
        },
        {
          question: String.raw`For $s(t) = t^2$, what is the average velocity on the interval $[2,\ 2.1]$?`,
          choices: ['4.1', '4', '0.41', '4.41'],
          answer: 0,
          explanations: [
            String.raw`Correct. $\frac{2.1^2 - 2^2}{0.1} = \frac{4.41 - 4}{0.1} = 4.1$, which is $4 + h$ with $h = 0.1$.`,
            'Incorrect. 4 is the instantaneous velocity at t = 2, the limit of these averages, not the average on this interval.',
            'Incorrect. 0.41 is the change in position; divide by the change in time (0.1).',
            'Incorrect. 4.41 is the position at t = 2.1, not a velocity.',
          ],
        },
      ],
      revisit: String.raw`A limit is about the approach, not the arrival: $\lim_{x \to c} f(x)$ looks at $x$ near $c$ and ignores $f(c)$. Instantaneous rate = the limit of average rates as the interval shrinks to 0.`,
    },
    {
      id: '1.3–1.4',
      ced: 'LIM-1.C',
      title: 'Estimating Limits from Graphs and Tables',
      minutes: 6,
      summary: String.raw`Read a limit from a graph or table by checking where the values head from **both** sides. One-sided limits $\lim_{x \to c^-}$ and $\lim_{x \to c^+}$ must agree for the limit to exist. A limit fails to exist if the function is unbounded, oscillates, or has different left and right limits.`,
      body: String.raw`### One-sided limits
- $\lim_{x \to c^-} f(x)$: approach $c$ from the **left** (values smaller than $c$).
- $\lim_{x \to c^+} f(x)$: approach $c$ from the **right**.

$\lim_{x \to c} f(x)$ exists exactly when both one-sided limits exist and are **equal**.

### Three ways a limit fails to exist
| Behavior near $c$ | Example | Why |
|---|---|---|
| Left ≠ right (a jump) | $\frac{\lvert x \rvert}{x}$ at $0$: left $-1$, right $1$ | The two sides disagree |
| Unbounded | $\frac{1}{x^2}$ at $0$ | Values grow without bound |
| Oscillating | $\sin\left(\frac{1}{x}\right)$ at $0$ | Values never settle |

${graph({
  title: 'y = sin(1/x) never settles near x = 0',
  x: [-0.6, 0.6], y: [-1.5, 1.5],
  curves: [{ expr: 'sin(1/x)', label: 'sin(1/x)' }],
})}

### Reading a table
Look at the outputs as $x$ closes in from each side. For $f(x) = \frac{x^2 - 4}{x - 2}$:

| $x$ | 1.9 | 1.99 | 1.999 | 2.001 | 2.01 | 2.1 |
|---|---|---|---|---|---|---|
| $f(x)$ | 3.9 | 3.99 | 3.999 | 4.001 | 4.01 | 4.1 |

Both sides head to $4$, so $\lim_{x \to 2} f(x) = 4$, even though $f(2)$ is undefined.

**Watch the scale.** A graph or a table only samples the function. A zoomed-out graph can hide a hole or a spike, so back estimates up with algebra when you can.`,
      blocks: [],
      precheck: {
        question: String.raw`If $\lim_{x \to 2^-} f(x) = 1$ and $\lim_{x \to 2^+} f(x) = 3$, then $\lim_{x \to 2} f(x)$:`,
        choices: ['does not exist', 'equals 2', 'equals 1', 'equals 3'],
        answer: 0,
        explanations: [
          'Correct. The one-sided limits disagree, so the two-sided limit does not exist.',
          'Incorrect. Limits are not averaged; disagreeing sides mean no limit.',
          'Incorrect. That is only the left-hand limit.',
          'Incorrect. That is only the right-hand limit.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`A table gives $f(0.9) = 2.81,\ f(0.99) = 2.9801,\ f(0.999) = 2.998,\ f(1.001) = 3.002,\ f(1.01) = 3.0201,\ f(1.1) = 3.21$. The best estimate of $\lim_{x \to 1} f(x)$ is:`,
          choices: ['3', 'It does not exist', '2.998', '3.002'],
          answer: 0,
          explanations: [
            'Correct. Values approach 3 from both sides.',
            'Incorrect. Both sides head to the same value, so the limit exists.',
            'Incorrect. That is one sample from the left; the values are still moving toward 3.',
            'Incorrect. That is one sample from the right; the values are still moving toward 3.',
          ],
        },
        {
          question: String.raw`Why does $\lim_{x \to 0} \frac{1}{x^2}$ not exist as a real number?`,
          choices: [
            'The function is unbounded near 0',
            'The function oscillates near 0',
            'The left- and right-hand limits are different',
            'Because 1/0² is undefined, and an undefined value always means no limit',
          ],
          answer: 0,
          explanations: [
            'Correct. Both sides grow without bound (toward +∞), so there is no real-number limit.',
            'Incorrect. 1/x² is positive and grows steadily; it does not oscillate.',
            'Incorrect. Both sides go to +∞; they agree, they are just not finite.',
            'Incorrect. An undefined value at c does not rule out a limit; (x² − 4)/(x − 2) is undefined at 2 but has limit 4.',
          ],
        },
      ],
      revisit: 'Check both sides. Same finite value from both sides = the limit. Different sides, unbounded, or oscillating = no limit. The value at c never decides it.',
    },
    {
      id: '1.5–1.7',
      ced: 'LIM-1.D, LIM-1.E',
      title: 'Finding Limits Algebraically',
      minutes: 8,
      summary: String.raw`Try direct substitution first. If you get a number, that's the limit (for continuous functions). If you get $\frac{0}{0}$, the limit may still exist: factor and cancel, multiply by a conjugate, or use a trig identity, then substitute again.`,
      body: String.raw`### Limit laws
If $\lim_{x \to c} f(x)$ and $\lim_{x \to c} g(x)$ exist, then the limit of a sum, difference, product or constant multiple is the sum, difference, product or multiple of the limits. A quotient works too, **as long as the denominator's limit isn't 0**. Polynomials, rational functions (where defined), roots, exponentials, logs and trig functions can be evaluated by substitution at points in their domain.

### When substitution gives $\frac{0}{0}$
$\frac{0}{0}$ is **indeterminate**: it tells you to do more work, not that the limit fails. Pick a procedure from the expression's form:

| You see | Try |
|---|---|
| Polynomials on top and bottom | Factor, cancel the common factor |
| A square root plus or minus a number | Multiply top and bottom by the conjugate |
| Trig functions | Rewrite with an identity, or use $\lim_{x \to 0} \frac{\sin x}{x} = 1$ |
| A nonzero number over 0 | Not indeterminate: the function is unbounded there; check each side |

${steps({
  title: 'Find lim (x² − 9)/(x − 3) as x → 3',
  steps: [
    { title: 'Substitute', body: '$\\frac{9 - 9}{3 - 3} = \\frac{0}{0}$: indeterminate, keep going.' },
    { title: 'Factor', body: '$\\frac{(x-3)(x+3)}{x-3}$' },
    { title: 'Cancel', body: 'For $x \\neq 3$ this equals $x + 3$. The limit ignores $x = 3$ itself, so cancelling is allowed.' },
    { title: 'Substitute again', body: '$3 + 3 = 6$' },
  ],
  answer: '6',
})}

${steps({
  title: 'Find lim (√(x + 4) − 2)/x as x → 0',
  steps: [
    { title: 'Substitute', body: '$\\frac{2 - 2}{0} = \\frac{0}{0}$.' },
    { title: 'Multiply by the conjugate', body: '$\\frac{\\sqrt{x+4} - 2}{x} \\cdot \\frac{\\sqrt{x+4} + 2}{\\sqrt{x+4} + 2} = \\frac{(x + 4) - 4}{x(\\sqrt{x+4} + 2)} = \\frac{x}{x(\\sqrt{x+4} + 2)}$' },
    { title: 'Cancel and substitute', body: '$\\frac{1}{\\sqrt{x+4} + 2} \\to \\frac{1}{2 + 2} = \\frac{1}{4}$' },
  ],
  answer: '1/4',
})}`,
      blocks: [],
      precheck: {
        question: String.raw`Direct substitution into a limit gives $\frac{0}{0}$. What does that tell you?`,
        choices: [
          'Nothing yet: rewrite the expression and try again; the limit may well exist',
          'The limit is 0',
          'The limit does not exist',
          'The limit is 1',
        ],
        answer: 0,
        explanations: [
          'Correct. 0/0 is indeterminate; algebra (factoring, conjugates, identities) usually reveals the limit.',
          'Incorrect. 0/0 is not 0; the limit could be any number or not exist.',
          'Incorrect. Many limits that start as 0/0 exist, like (x² − 9)/(x − 3) → 6.',
          'Incorrect. 0/0 is not 1; it is indeterminate.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`Find $\lim_{x \to -2} \frac{x^2 + 5x + 6}{x + 2}$.`,
          choices: ['1', '0', 'It does not exist', '-1'],
          answer: 0,
          explanations: [
            String.raw`Correct. $\frac{(x+2)(x+3)}{x+2} = x + 3$ for $x \neq -2$, and $-2 + 3 = 1$.`,
            'Incorrect. Substitution gives 0/0, which is indeterminate, not 0.',
            'Incorrect. After factoring and cancelling, the limit exists.',
            'Incorrect. Check the factor: x² + 5x + 6 = (x + 2)(x + 3), so the result is −2 + 3 = 1.',
          ],
        },
        {
          question: String.raw`Find $\lim_{x \to 0} \frac{\sqrt{x+9} - 3}{x}$.`,
          choices: ['1/6', '0', '1/3', 'It does not exist'],
          answer: 0,
          explanations: [
            String.raw`Correct. Multiply by the conjugate: $\frac{x}{x(\sqrt{x+9} + 3)} = \frac{1}{\sqrt{x+9}+3} \to \frac{1}{6}$.`,
            'Incorrect. Substitution gives 0/0, which is indeterminate, not 0.',
            String.raw`Incorrect. The denominator after the conjugate is $\sqrt{9} + 3 = 6$, not 3.`,
            'Incorrect. The conjugate removes the 0/0, and the limit exists.',
          ],
        },
      ],
      revisit: String.raw`Substitute first. A number? Done. $\frac{0}{0}$? Factor, use a conjugate, or a trig identity, cancel the troublemaker, then substitute again.`,
    },
    {
      id: '1.8',
      ced: 'LIM-1.E.2',
      title: 'The Squeeze Theorem',
      minutes: 5,
      summary: String.raw`If $g(x) \le f(x) \le h(x)$ near $c$ and $\lim_{x \to c} g(x) = \lim_{x \to c} h(x) = L$, then $\lim_{x \to c} f(x) = L$. It handles limits algebra can't, like $x^2 \sin\left(\frac{1}{x}\right)$ at $0$.`,
      body: String.raw`### The idea
Trap $f$ between two functions that meet at the same height at $c$. With nowhere else to go, $f$ has to approach that height too.

**Squeeze theorem.** If $g(x) \le f(x) \le h(x)$ for $x$ near $c$ (except possibly at $c$), and $\lim_{x \to c} g(x) = \lim_{x \to c} h(x) = L$, then $\lim_{x \to c} f(x) = L$.

### Classic example
$\sin\left(\frac{1}{x}\right)$ oscillates wildly near $0$, but it is always between $-1$ and $1$. Multiplying by $x^2 \ge 0$:
$$-x^2 \le x^2 \sin\left(\tfrac{1}{x}\right) \le x^2.$$
Both $-x^2$ and $x^2$ go to $0$, so $\lim_{x \to 0} x^2 \sin\left(\frac{1}{x}\right) = 0$.

${graph({
  title: 'x²·sin(1/x) squeezed between −x² and x²',
  x: [-0.5, 0.5], y: [-0.3, 0.3],
  curves: [
    { expr: 'x^2*sin(1/x)', label: 'x²·sin(1/x)' },
    { expr: 'x^2', label: 'x²' },
    { expr: '-x^2', label: '−x²' },
  ],
})}

The squeeze theorem is also how $\lim_{x \to 0} \frac{\sin x}{x} = 1$ is proved, a result you'll use directly.

**On the exam,** state all three pieces: the inequality, the two outside limits, and the conclusion.`,
      blocks: [],
      precheck: {
        question: 'What do you need to use the squeeze theorem at x = c?',
        choices: [
          'Two functions that bound f near c and have the same limit at c',
          'f must be continuous at c',
          'f(c) must exist',
          'f must be a polynomial',
        ],
        answer: 0,
        explanations: [
          'Correct. Lower bound, upper bound, both approaching the same L.',
          'Incorrect. If f were continuous you could just substitute; the theorem is for when you can\'t.',
          'Incorrect. The theorem ignores f(c), like every limit.',
          'Incorrect. It is usually used for functions that are not polynomials, like x²·sin(1/x).',
        ],
      },
      checkpoints: [
        {
          question: String.raw`If $2 - x^2 \le f(x) \le 2 + x^2$ for all $x$ near $0$, what is $\lim_{x \to 0} f(x)$?`,
          choices: ['2', '0', 'It cannot be determined', '4'],
          answer: 0,
          explanations: [
            'Correct. Both bounds approach 2 as x → 0, so f is squeezed to 2.',
            'Incorrect. The bounds approach 2, not 0.',
            'Incorrect. Matching bounds are exactly what the squeeze theorem needs.',
            'Incorrect. 2 + x² approaches 2, not 4.',
          ],
        },
        {
          question: String.raw`$\lim_{x \to 0} \frac{\sin x}{x} =$`,
          choices: ['1', '0', 'It does not exist', '∞'],
          answer: 0,
          explanations: [
            'Correct. This standard limit (proved with the squeeze theorem) equals 1.',
            'Incorrect. sin x and x shrink at the same rate near 0, so their ratio approaches 1.',
            'Incorrect. Both one-sided limits equal 1.',
            'Incorrect. The ratio stays near 1; it is bounded.',
          ],
        },
      ],
      revisit: 'Squeeze: bound f below and above by functions with the same limit L at c. Then f has limit L. Write out the inequality and both outer limits.',
    },
    {
      id: '1.10–1.13',
      ced: 'LIM-2.A, LIM-2.B, LIM-2.C',
      title: 'Continuity and Discontinuities',
      minutes: 8,
      summary: String.raw`$f$ is continuous at $c$ when $f(c)$ exists, $\lim_{x \to c} f(x)$ exists, and they're equal. Discontinuities are removable (a hole), jump, or infinite (a vertical asymptote). A removable one can be fixed by redefining one value; a piecewise function is continuous at a boundary when both pieces and the function agree there.`,
      body: String.raw`### The definition (memorize all three)
$f$ is continuous at $x = c$ if
1. $f(c)$ exists,
2. $\lim_{x \to c} f(x)$ exists, and
3. $\lim_{x \to c} f(x) = f(c)$.

A function is continuous on an interval if it's continuous at every point in it. Polynomial, rational, power, exponential, logarithmic and trig functions are continuous **everywhere in their domains**.

### Types of discontinuity
| Type | What fails | Picture |
|---|---|---|
| **Removable** | The limit exists but $f(c)$ is missing or wrong | A hole |
| **Jump** | Left and right limits are different finite numbers | A step |
| **Infinite** | The function is unbounded near $c$ | A vertical asymptote |

### Removing a discontinuity
If the limit exists at a hole, redefine $f(c)$ to equal the limit. For a piecewise function, set the two pieces equal at the boundary.

${steps({
  title: 'Find k so f(x) = x² + k (x < 2), 3x − 1 (x ≥ 2) is continuous',
  steps: [
    { title: 'Left side at the boundary', body: 'As $x \\to 2^-$: $x^2 + k \\to 4 + k$.' },
    { title: 'Right side and the value', body: 'As $x \\to 2^+$ and at $x = 2$: $3(2) - 1 = 5$.' },
    { title: 'Make them match', body: '$4 + k = 5$, so $k = 1$.' },
  ],
  answer: 'k = 1. Then the limit from both sides and f(2) are all 5.',
})}`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Three conditions for continuity at x = c', back: 'f(c) exists; the limit as x → c exists; the limit equals f(c).' },
            { front: 'Removable discontinuity', back: 'A hole: the limit exists but f(c) is missing or different. Fix by redefining f(c).' },
            { front: 'Jump discontinuity', back: 'Left and right limits are different finite numbers.' },
            { front: 'Infinite discontinuity', back: 'The function is unbounded near c: a vertical asymptote.' },
          ],
        },
      ],
      precheck: {
        question: String.raw`$f$ is continuous at $x = c$ when:`,
        choices: [
          String.raw`$f(c)$ exists, $\lim_{x \to c} f(x)$ exists, and they are equal`,
          String.raw`$f(c)$ exists`,
          String.raw`$\lim_{x \to c} f(x)$ exists`,
          String.raw`$f$ is defined everywhere except $c$`,
        ],
        answer: 0,
        explanations: [
          'Correct. All three conditions are required.',
          'Incorrect. A value at c alone is not enough; the limit must exist and match it.',
          'Incorrect. The limit can exist at a hole, where the function is not continuous.',
          'Incorrect. A function undefined at c cannot be continuous there.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$f(x) = \frac{x^2 - 16}{x - 4}$ for $x \neq 4$, and $f(4) = 5$. What kind of discontinuity is at $x = 4$, and how is it removed?`,
          choices: [
            'Removable; redefine f(4) = 8',
            'Jump; it cannot be removed',
            'Infinite; it cannot be removed',
            'Removable; redefine f(4) = 0',
          ],
          answer: 0,
          explanations: [
            String.raw`Correct. $\frac{(x-4)(x+4)}{x-4} = x + 4 \to 8$, so the limit is 8; setting $f(4) = 8$ removes it.`,
            'Incorrect. Both sides approach 8, so there is no jump.',
            'Incorrect. The function stays bounded near 4 (it approaches 8).',
            'Incorrect. The limit is 8, not 0; f(4) must equal the limit.',
          ],
        },
        {
          question: String.raw`$f(x) = kx + 1$ for $x \le 3$ and $f(x) = x^2 - 2$ for $x > 3$. What value of $k$ makes $f$ continuous?`,
          choices: ['2', '3', '7', '1/2'],
          answer: 0,
          explanations: [
            String.raw`Correct. Match at $x = 3$: $3k + 1 = 9 - 2 = 7$, so $k = 2$.`,
            'Incorrect. With k = 3 the left piece gives 10 at x = 3, but the right side approaches 7.',
            'Incorrect. 7 is the value both sides must reach, not k.',
            'Incorrect. Solve 3k + 1 = 7: k = 2.',
          ],
        },
      ],
      revisit: 'Continuity = value exists + limit exists + they match. Hole: redefine the value to the limit. Piecewise: set the pieces equal at the boundary and solve.',
    },
    {
      id: '1.14–1.15',
      ced: 'LIM-2.D',
      title: 'Infinite Limits and Limits at Infinity',
      minutes: 7,
      summary: String.raw`If $f$ grows without bound as $x \to c$, write $\lim_{x \to c} f(x) = \infty$ and there's a vertical asymptote at $x = c$. If $f(x) \to L$ as $x \to \pm\infty$, there's a horizontal asymptote $y = L$. For rational functions, compare degrees; for growth, exponentials beat polynomials, which beat logarithms.`,
      body: String.raw`### Infinite limits → vertical asymptotes
$\lim_{x \to c^+} f(x) = \infty$ means $f(x)$ grows without bound as $x$ approaches $c$ from the right. If either one-sided limit at $c$ is $\pm\infty$, the line $x = c$ is a **vertical asymptote**. (Writing $= \infty$ describes *how* the limit fails to exist; it is not a number.)

A nonzero number divided by something approaching 0 is the signal: check the sign on each side.

### Limits at infinity → horizontal asymptotes
$\lim_{x \to \infty} f(x) = L$ describes **end behavior**: $y = L$ is a horizontal asymptote.

For a rational function, compare the degrees of top and bottom:
| Degrees | Limit as x → ±∞ |
|---|---|
| Top < bottom | $0$ |
| Top = bottom | ratio of leading coefficients |
| Top > bottom | unbounded (no horizontal asymptote) |

${graph({
  title: 'f(x) = (a·x² + 1)/(x² + 3) levels off at y = a',
  x: [-20, 20], y: [-4, 4],
  curves: [{ expr: '(a*x^2 + 1)/(x^2 + 3)', label: 'f(x)' }, { expr: 'a', label: 'y = a' }],
  params: { a: { min: -3, max: 3, value: 2, step: 0.1, label: 'leading coefficient a' } },
})}

Same degree on top and bottom, so the end behavior is the ratio of leading coefficients, $\frac{a}{1}$. Drag **a** and the curve follows.

### Comparing growth
As $x \to \infty$: $\ln x \ll x^n \ll e^x$. So $\lim_{x \to \infty} \frac{x^5}{e^x} = 0$ and $\lim_{x \to \infty} \frac{\ln x}{x} = 0$.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Rational function, top degree < bottom degree, as x → ∞', back: 'Limit is 0 (horizontal asymptote y = 0).' },
            { front: 'Rational function, equal degrees, as x → ∞', back: 'Limit is the ratio of the leading coefficients.' },
            { front: 'Order of growth as x → ∞', back: 'ln x grows slowest, then powers of x, then e^x fastest.' },
            { front: 'Vertical asymptote at x = c', back: 'At least one one-sided limit at c is +∞ or −∞.' },
          ],
        },
      ],
      precheck: {
        question: String.raw`$\lim_{x \to \infty} f(x) = 4$ tells you that:`,
        choices: [
          'The graph has a horizontal asymptote y = 4 (end behavior)',
          'There is a vertical asymptote at x = 4',
          'f(4) is infinite',
          'f(x) = 4 for large x',
        ],
        answer: 0,
        explanations: [
          'Correct. A limit at infinity describes end behavior: y = 4 is a horizontal asymptote.',
          'Incorrect. Vertical asymptotes come from infinite limits at a finite x.',
          'Incorrect. This says nothing about x = 4.',
          'Incorrect. f approaches 4; it need not equal it.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$\lim_{x \to \infty} \frac{2x^3 + x}{7x^3 - 4} =$`,
          choices: ['2/7', '0', '∞', '2'],
          answer: 0,
          explanations: [
            'Correct. Equal degrees (3 and 3), so the limit is the ratio of leading coefficients, 2/7.',
            'Incorrect. That happens when the bottom has the higher degree; here the degrees are equal.',
            'Incorrect. That happens when the top has the higher degree.',
            'Incorrect. Divide by the leading coefficient of the bottom too: 2/7.',
          ],
        },
        {
          question: String.raw`$\lim_{x \to 3^+} \frac{1}{x - 3} =$`,
          choices: ['∞ (increases without bound)', '−∞ (decreases without bound)', '0', '1/3'],
          answer: 0,
          explanations: [
            'Correct. For x slightly more than 3, x − 3 is a small positive number, so 1/(x − 3) is a large positive number.',
            'Incorrect. That is the left-hand limit, where x − 3 is small and negative.',
            'Incorrect. The denominator approaches 0, so the fraction gets large, not small.',
            'Incorrect. Substituting gives 1/0, not 1/3.',
          ],
        },
      ],
      revisit: 'x → c and f blows up: vertical asymptote; check the sign from each side. x → ∞: compare degrees (smaller top → 0, equal → leading-coefficient ratio, bigger top → unbounded).',
    },
    {
      id: '1.16',
      ced: 'FUN-1.A',
      title: 'The Intermediate Value Theorem',
      minutes: 5,
      summary: String.raw`If $f$ is continuous on $[a, b]$ and $d$ is between $f(a)$ and $f(b)$, then $f(c) = d$ for some $c$ in $[a, b]$. It guarantees that a value is hit (often a root), but not where, and it says nothing without continuity.`,
      body: String.raw`### The theorem
**IVT.** If $f$ is **continuous on the closed interval** $[a, b]$ and $d$ is any number between $f(a)$ and $f(b)$, then there is at least one $c$ in $[a, b]$ with $f(c) = d$.

A continuous function can't skip values: to get from $f(a)$ to $f(b)$ it has to pass through everything in between.

### What it doesn't say
- It doesn't tell you **where** $c$ is or how many there are.
- Without continuity it guarantees **nothing**: a jump can skip right over $d$.

${steps({
  title: 'Show x³ − x − 1 = 0 has a solution between 1 and 2',
  steps: [
    { title: 'Continuity', body: '$f(x) = x^3 - x - 1$ is a polynomial, so it is continuous on $[1, 2]$.' },
    { title: 'Endpoint values', body: '$f(1) = 1 - 1 - 1 = -1$ and $f(2) = 8 - 2 - 1 = 5$.' },
    { title: 'Apply the IVT', body: '$0$ is between $-1$ and $5$, so by the Intermediate Value Theorem there is a $c$ in $[1, 2]$ with $f(c) = 0$.' },
  ],
  answer: 'A root exists in [1, 2]. On an FRQ, name continuity, the endpoint values, and the theorem.',
})}`,
      blocks: [],
      precheck: {
        question: 'What must be true of f to apply the Intermediate Value Theorem on [a, b]?',
        choices: [
          'f is continuous on [a, b]',
          'f is increasing on [a, b]',
          'f(a) = f(b)',
          'f is differentiable at a and b only',
        ],
        answer: 0,
        explanations: [
          'Correct. Continuity on the closed interval is the hypothesis the IVT needs.',
          'Incorrect. The IVT works for any continuous function, increasing or not.',
          'Incorrect. That is the setup for Rolle\'s theorem (Unit 5), not the IVT.',
          'Incorrect. Differentiability at two points is neither needed nor enough.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`$f$ is continuous on $[0, 4]$, $f(0) = 2$ and $f(4) = -3$. Which must be true?`,
          choices: [
            'f(c) = 0 for some c in (0, 4)',
            'f(c) = 3 for some c in (0, 4)',
            'f is decreasing on [0, 4]',
            'f(2) = −0.5',
          ],
          answer: 0,
          explanations: [
            'Correct. 0 is between 2 and −3, and f is continuous, so the IVT guarantees a c with f(c) = 0.',
            'Incorrect. 3 is not between f(0) = 2 and f(4) = −3, so the IVT says nothing about it.',
            'Incorrect. f could go up and down; only the endpoint values are known.',
            'Incorrect. The IVT gives existence, not specific values; f(2) could be anything.',
          ],
        },
        {
          question: String.raw`$g(1) = 5$ and $g(3) = 1$, but $g$ is **not** continuous on $[1, 3]$. Must there be a $c$ in $[1, 3]$ with $g(c) = 2$?`,
          choices: [
            'Not necessarily: the IVT does not apply',
            'Yes, by the Intermediate Value Theorem',
            'No, it is impossible',
            'Only if g is decreasing',
          ],
          answer: 0,
          explanations: [
            'Correct. Without continuity, g could jump past 2. It might hit 2 or might not.',
            'Incorrect. The IVT requires continuity, which is missing.',
            'Incorrect. A discontinuous g could still pass through 2; it just isn\'t guaranteed.',
            'Incorrect. A decreasing function can still jump over 2; continuity is what matters.',
          ],
        },
      ],
      revisit: 'IVT = continuous on [a, b] + d between f(a) and f(b) ⇒ some c in [a, b] with f(c) = d. No continuity, no guarantee. Always state continuity first.',
    },
  ],
};

export default pack;
