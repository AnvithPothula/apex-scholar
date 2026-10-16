/**
 * AP Precalculus Unit 1: Polynomial and Rational Functions — study pack.
 *
 * Written against the AP Precalculus CED (current edition on AP Central,
 * topics 1.1–1.14). Follows its framing: rates of change first, then
 * polynomials (zeros, multiplicity, end behavior), rational functions
 * (asymptotes, holes), transformations and modeling. Respects the exclusion
 * statement: open vs closed intervals of increase/decrease aren't tested.
 * Related topics share a section. The interactive graphs are the
 * simulations: multiplicity, rational asymptotes and transformations.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-precalculus/unit-1',
  subject: 'AP Precalculus',
  unit: 'Unit 1: Polynomial and Rational Functions',
  examWeight: '30–40% of the multiple-choice section',
  intro:
    'Precalculus is about how quantities change together. This unit starts with rates of change, then uses them to read ' +
    'polynomial and rational functions: where they increase, bend, cross zero, blow up or level off. It ends with ' +
    'transformations and choosing a function to model real data.',
  sections: [
    {
      id: '1.1–1.2',
      ced: '1.1.A–1.2.B',
      title: 'Change in Tandem and Rates of Change',
      minutes: 6,
      summary:
        'A function maps each input to exactly one output. As inputs increase, a function can increase or decrease and be concave up or ' +
        'down. The average rate of change over an interval is the change in output over the change in input; the rate of change at a ' +
        'point is approximated by average rates over small intervals around it.',
      body: String.raw`### Functions
A **function** maps each input to **exactly one** output. **Domain**: the inputs; **range**: the outputs. Inputs and outputs "change in tandem" by the function's rule, which can be a graph, a table, a formula or words.

- **Increasing** on an interval: as $x$ increases, $f(x)$ increases (if $a < b$ then $f(a) < f(b)$).
- **Decreasing**: as $x$ increases, $f(x)$ decreases.
- **Concave up**: the rate of change is increasing (the graph bends upward). **Concave down**: the rate of change is decreasing.
- **Zeros**: inputs where $f(x) = 0$, where the graph meets the $x$-axis.

### Rates of change
**Average rate of change** on $[a, b]$:

$$\frac{f(b) - f(a)}{b - a}$$

the slope of the **secant line** between the two points, and the constant rate that would produce the same change in output.

The **rate of change at a point** is approximated by average rates of change over smaller and smaller intervals containing that point. A **positive** rate: both quantities move the same way; **negative**: one rises as the other falls.

${steps({
  title: 'Find the average rate of change of f(x) = x² on [1, 3].',
  steps: [
    { title: 'Outputs', body: '$f(1) = 1$, $f(3) = 9$' },
    { title: 'Divide the changes', body: '$\\dfrac{9 - 1}{3 - 1} = \\dfrac{8}{2} = 4$' },
  ],
  answer: '4',
})}`,
      blocks: [],
      precheck: {
        question: 'What is the average rate of change of $f(x) = 2x^2$ on the interval $[0, 2]$?',
        choices: ['4', '8', '2', '0'],
        answer: 0,
        explanations: [
          'Correct. $\\dfrac{f(2) - f(0)}{2 - 0} = \\dfrac{8 - 0}{2} = 4$.',
          'Incorrect. 8 is the change in output; divide by the change in input, 2.',
          'Incorrect. 2 is the length of the interval.',
          'Incorrect. The function changes from 0 to 8, so the rate isn\'t zero.',
        ],
      },
      checkpoints: [
        {
          question: 'On an interval, a function is increasing and its rate of change is decreasing. Its graph there is:',
          choices: ['Increasing and concave down', 'Increasing and concave up', 'Decreasing and concave down', 'Decreasing and concave up'],
          answer: 0,
          explanations: [
            'Correct. Rising, but rising more and more slowly: that is concave down.',
            'Incorrect. Concave up means the rate of change is increasing.',
            'Incorrect. The function is increasing, not decreasing.',
            'Incorrect. Both parts are reversed.',
          ],
        },
        {
          question: 'A table gives $f(1.9) = 7.41$, $f(2) = 8$ and $f(2.1) = 8.61$. Which is the best estimate of the rate of change of $f$ at $x = 2$?',
          choices: ['6', '8', '0.6', '4'],
          answer: 0,
          explanations: [
            'Correct. Using the small interval around 2: $\\dfrac{8.61 - 7.41}{2.1 - 1.9} = \\dfrac{1.2}{0.2} = 6$.',
            'Incorrect. 8 is the output at $x = 2$, not the rate.',
            'Incorrect. 0.6 is a change in output; divide it by the change in input.',
            'Incorrect. Check the subtraction and division: 1.2 ÷ 0.2 = 6.',
          ],
        },
      ],
      revisit:
        'Function: one output per input. Increasing/decreasing; concave up = rate of change increasing. Average rate of change ' +
        '$= \\dfrac{f(b)-f(a)}{b-a}$ (secant slope); small intervals approximate the rate at a point.',
    },
    {
      id: '1.3',
      ced: '1.3.A–1.3.B',
      title: 'Rates of Change in Linear and Quadratic Functions',
      minutes: 5,
      summary:
        'A linear function has a constant average rate of change. A quadratic function\'s average rates of change over consecutive ' +
        'equal-length intervals change at a constant rate (they form a linear pattern). Increasing average rates mean concave up.',
      body: String.raw`### Tables tell you the type
Take outputs at **equally spaced** inputs and compute differences:

| $x$ | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Linear $3x + 1$ | 1 | 4 | 7 | 10 | 13 |
| First differences | | 3 | 3 | 3 | 3 |
| Quadratic $x^2 + 2x + 1$ | 1 | 4 | 9 | 16 | 25 |
| First differences | | 3 | 5 | 7 | 9 |
| Second differences | | | 2 | 2 | 2 |

- **Linear**: average rates of change are **constant**, so they change at a rate of **zero**.
- **Quadratic**: average rates of change over consecutive equal intervals form a **linear** pattern, so they change at a **constant** rate.

### Rates of change and concavity
If the average rates of change over equal-length intervals keep **increasing**, the graph is **concave up**; if they keep **decreasing**, it's **concave down**. In the quadratic above the first differences rise (3, 5, 7, 9), so it's concave up.`,
      blocks: [],
      precheck: {
        question: 'For a linear function, the average rate of change over any interval is:',
        choices: ['The same constant', 'Increasing', 'Decreasing', 'Zero'],
        answer: 0,
        explanations: [
          'Correct. A line has one slope everywhere.',
          'Incorrect. That would make the graph concave up, not a line.',
          'Incorrect. That would make the graph concave down.',
          'Incorrect. Only a horizontal line has a rate of change of zero.',
        ],
      },
      checkpoints: [
        {
          question: 'Outputs at $x = 0, 1, 2, 3$ are 5, 8, 13, 20. Which function type fits best?',
          choices: ['Quadratic', 'Linear', 'Constant', 'It cannot be quadratic, since the outputs aren\'t symmetric'],
          answer: 0,
          explanations: [
            'Correct. First differences 3, 5, 7 change by a constant 2, so the second differences are constant.',
            'Incorrect. The first differences aren\'t constant.',
            'Incorrect. The outputs change.',
            'Incorrect. Only part of a parabola is shown; constant second differences are the test.',
          ],
        },
        {
          question: 'The average rates of change of $f$ over $[0,1]$, $[1,2]$ and $[2,3]$ are 9, 5 and 1. On $[0, 3]$ the graph is:',
          choices: ['Concave down', 'Concave up', 'Linear', 'Decreasing'],
          answer: 0,
          explanations: [
            'Correct. The rates of change are decreasing, which means concave down.',
            'Incorrect. Concave up needs increasing rates of change.',
            'Incorrect. A linear function would have equal rates.',
            'Incorrect. All three rates are positive, so the function is increasing.',
          ],
        },
      ],
      revisit:
        'Equal input steps: constant first differences → linear; constant second differences → quadratic. Rates of change increasing → ' +
        'concave up; decreasing → concave down.',
    },
    {
      id: '1.4–1.6',
      ced: '1.4.A–1.6.A',
      title: 'Polynomial Functions: Extrema, Zeros and End Behavior',
      minutes: 10,
      summary:
        'A polynomial has local maxima and minima where it switches between increasing and decreasing, and inflection points where its ' +
        'concavity changes. A degree-n polynomial has n complex zeros counting multiplicity; non-real zeros come in conjugate pairs; ' +
        'even-multiplicity zeros touch the x-axis. The leading term decides end behavior.',
      body: String.raw`### Form and features
$p(x) = a_n x^n + a_{n-1}x^{n-1} + \dots + a_1x + a_0$, with degree $n$, leading term $a_n x^n$, leading coefficient $a_n \neq 0$.
- **Local (relative) max/min**: where $p$ switches between increasing and decreasing. A local max greater than every other output is the **global (absolute)** max.
- Between any two distinct real zeros there's at least one local max or min.
- **Even degree**: the polynomial has a global max or a global min. A quadratic's is at its **vertex**.
- **Point of inflection**: where the rate of change switches from increasing to decreasing (or back), i.e. concavity changes.

### Zeros and factors
- $a$ is a real zero **if and only if** $(x - a)$ is a factor. Real zeros are $x$-intercepts.
- A factor repeated $n$ times gives a zero of **multiplicity $n$**. A degree-$n$ polynomial has **exactly $n$ complex zeros** counting multiplicity.
- If $a + bi$ is a zero, so is its **conjugate** $a - bi$.
- **Even multiplicity**: the graph **touches** the $x$-axis and turns back (same sign on both sides). **Odd**: it **crosses**.

${graph({
  title: 'p(x) = (x + 2)^m · (x − 1)^n: crossing vs touching',
  x: [-3.5, 2.5], y: [-12, 12],
  curves: [{ expr: '(x + 2)^m * (x - 1)^n', label: 'p(x)' }],
  params: {
    m: { min: 1, max: 3, value: 1, step: 1, label: 'multiplicity of x = −2' },
    n: { min: 1, max: 3, value: 2, step: 1, label: 'multiplicity of x = 1' },
  },
})}

With $n = 2$ the graph touches $x = 1$ and turns around; set it to 1 or 3 and it crosses.

### Finding the degree from a table
With equally spaced inputs, the degree is the smallest $n$ for which the **$n$th differences are constant**.

### Even and odd functions
- **Even**: $f(-x) = f(x)$, symmetric over the $y$-axis ($x^2$, $x^4$).
- **Odd**: $f(-x) = -f(x)$, symmetric about the origin ($x^3$, $x^5$).

### End behavior
For large $|x|$ the **leading term dominates**:

| Leading term | As $x \to \infty$ | As $x \to -\infty$ |
|---|---|---|
| Even degree, positive coefficient | $\infty$ | $\infty$ |
| Even degree, negative coefficient | $-\infty$ | $-\infty$ |
| Odd degree, positive coefficient | $\infty$ | $-\infty$ |
| Odd degree, negative coefficient | $-\infty$ | $\infty$ |`,
      blocks: [],
      precheck: {
        question: 'How many complex zeros, counting multiplicity, does $p(x) = 2x^5 - x^2 + 7$ have?',
        choices: ['5', '2', '3', '7'],
        answer: 0,
        explanations: [
          'Correct. A degree-5 polynomial has exactly 5 complex zeros counting multiplicity.',
          'Incorrect. 2 is the leading coefficient.',
          'Incorrect. Some zeros may be non-real, but they still count.',
          'Incorrect. 7 is the constant term.',
        ],
      },
      checkpoints: [
        {
          question: 'A polynomial with real coefficients has zeros $3$ and $2 + i$. Which must also be a zero?',
          choices: ['$2 - i$', '$-3$', '$-2 - i$', '$i$'],
          answer: 0,
          explanations: [
            'Correct. Non-real zeros come in conjugate pairs: $2 + i$ brings $2 - i$.',
            'Incorrect. Real zeros don\'t come in ± pairs.',
            'Incorrect. The conjugate keeps the real part and flips the sign of the imaginary part.',
            'Incorrect. $i$ alone isn\'t forced by $2 + i$.',
          ],
        },
        {
          question: 'The graph of $p(x) = (x - 4)^2(x + 1)$ near $x = 4$:',
          choices: [
            'Touches the x-axis and turns back',
            'Crosses the x-axis',
            'Has a vertical asymptote',
            'Doesn\'t reach the x-axis',
          ],
          answer: 0,
          explanations: [
            'Correct. $x = 4$ has multiplicity 2 (even), so the outputs keep the same sign on both sides.',
            'Incorrect. The graph crosses at $x = -1$, where the multiplicity is odd.',
            'Incorrect. Polynomials have no asymptotes.',
            'Incorrect. $p(4) = 0$, so the graph meets the axis there.',
          ],
        },
        {
          question: 'What is the end behavior of $p(x) = -3x^4 + 5x^3 - x + 2$?',
          choices: [
            'As $x \\to \\infty$ and as $x \\to -\\infty$, $p(x) \\to -\\infty$',
            'As $x \\to \\infty$, $p(x) \\to \\infty$; as $x \\to -\\infty$, $p(x) \\to -\\infty$',
            'As $x \\to \\pm\\infty$, $p(x) \\to \\infty$',
            'As $x \\to \\pm\\infty$, $p(x) \\to 2$',
          ],
          answer: 0,
          explanations: [
            'Correct. The leading term $-3x^4$ has even degree and a negative coefficient, so both ends go down.',
            'Incorrect. That is odd-degree behavior with a positive coefficient.',
            'Incorrect. The leading coefficient is negative.',
            'Incorrect. Polynomials of degree 1 or more don\'t level off.',
          ],
        },
      ],
      revisit:
        'Local extrema where increasing↔decreasing; inflection where concavity flips. Degree n → n complex zeros; conjugate pairs; ' +
        'even multiplicity touches, odd crosses. Leading term sets end behavior. Even $f(-x)=f(x)$, odd $f(-x)=-f(x)$.',
    },
    {
      id: '1.7–1.10',
      ced: '1.7.A–1.10.A',
      title: 'Rational Functions: End Behavior, Zeros, Asymptotes and Holes',
      minutes: 10,
      summary:
        'A rational function is a quotient of polynomials. Its end behavior comes from the quotient of the leading terms (horizontal or ' +
        'slant asymptote, or polynomial-like). Zeros come from the numerator; vertical asymptotes from denominator zeros that don\'t ' +
        'cancel; holes from factors that cancel.',
      body: String.raw`### End behavior: divide the leading terms
| Degrees | Quotient of leading terms | Graph |
|---|---|---|
| Numerator **bigger** | Nonconstant polynomial | Behaves like that polynomial; **slant asymptote** if it is linear |
| **Equal** | A constant $b$ | **Horizontal asymptote** $y = b$ |
| Denominator **bigger** | Constant over a polynomial | **Horizontal asymptote** $y = 0$ |

### Zeros, vertical asymptotes, holes
Factor numerator and denominator first.
- **Zeros**: zeros of the **numerator** that are in the domain.
- **Vertical asymptote** at $x = a$: $a$ is a zero of the denominator and **not** of the numerator (or has a **higher** multiplicity in the denominator). Near it, $r(x) \to \pm\infty$.
- **Hole** at $x = c$: the multiplicity of $c$ in the **numerator** is **greater than or equal to** its multiplicity in the denominator. Find its height by evaluating the simplified function: $\lim_{x \to c} r(x) = L$ gives the hole at $(c, L)$.

${steps({
  title: 'Analyze r(x) = (x² − 4)/(x² − x − 2).',
  steps: [
    { title: 'Factor', body: '$r(x) = \\dfrac{(x - 2)(x + 2)}{(x - 2)(x + 1)}$' },
    { title: 'Hole', body: '$(x - 2)$ cancels: hole at $x = 2$. Simplified $\\dfrac{x + 2}{x + 1}$ at $x = 2$ is $\\dfrac{4}{3}$, so the hole is at $\\left(2, \\tfrac{4}{3}\\right)$.' },
    { title: 'Vertical asymptote', body: '$x = -1$ (denominator zero that doesn\'t cancel)' },
    { title: 'Zero', body: '$x = -2$ (numerator zero in the domain)' },
    { title: 'Horizontal asymptote', body: 'Equal degrees: $\\dfrac{x^2}{x^2} = 1$, so $y = 1$' },
  ],
  answer: 'Hole (2, 4/3), VA x = −1, zero x = −2, HA y = 1',
})}

${graph({
  title: 'r(x) = (a·x + 1)/(x − 2)',
  x: [-6, 8], y: [-10, 10],
  curves: [
    { expr: '(a*x + 1)/(x - 2)', label: 'r(x)' },
    { expr: 'a', label: 'y = a (horizontal asymptote)' },
  ],
  params: { a: { min: -3, max: 3, value: 1, step: 0.5, label: 'leading coefficient a' } },
})}

The vertical asymptote stays at $x = 2$ (the denominator's zero) while the horizontal asymptote follows $y = a$, the ratio of leading coefficients. Set $a = -0.5$: the numerator becomes $-0.5(x - 2)$, it cancels the denominator, and the "graph" is the flat line $y = -0.5$ with a hole at $x = 2$.`,
      blocks: [],
      precheck: {
        question: 'What is the horizontal asymptote of $r(x) = \\dfrac{6x^2 + 1}{2x^2 - 5}$?',
        choices: ['$y = 3$', '$y = 0$', '$y = 6$', 'There is none'],
        answer: 0,
        explanations: [
          'Correct. Equal degrees, so divide the leading coefficients: $6/2 = 3$.',
          'Incorrect. $y = 0$ happens when the denominator has the higher degree.',
          'Incorrect. Divide by the denominator\'s leading coefficient, 2.',
          'Incorrect. Equal degrees always give a horizontal asymptote.',
        ],
      },
      checkpoints: [
        {
          question: 'Where does $r(x) = \\dfrac{x + 3}{(x + 3)(x - 5)}$ have a hole and a vertical asymptote?',
          choices: [
            'Hole at $x = -3$, vertical asymptote at $x = 5$',
            'Vertical asymptotes at $x = -3$ and $x = 5$',
            'Hole at $x = 5$, vertical asymptote at $x = -3$',
            'Zeros at $x = -3$ and $x = 5$',
          ],
          answer: 0,
          explanations: [
            'Correct. $(x + 3)$ cancels (equal multiplicity): hole. $(x - 5)$ remains in the denominator: asymptote.',
            'Incorrect. $x = -3$ is a zero of both, with equal multiplicity, so it\'s a hole.',
            'Incorrect. That swaps them.',
            'Incorrect. Neither is a zero: after cancelling, the numerator is 1.',
          ],
        },
        {
          question: 'Which describes the end behavior of $r(x) = \\dfrac{x^3 + 2}{x - 1}$?',
          choices: [
            'It behaves like $x^2$ for large $|x|$',
            'It has a horizontal asymptote at $y = 1$',
            'It has a horizontal asymptote at $y = 0$',
            'It has a slant asymptote',
          ],
          answer: 0,
          explanations: [
            'Correct. The leading terms give $x^3/x = x^2$, a nonconstant polynomial.',
            'Incorrect. The numerator\'s degree is higher, so there\'s no horizontal asymptote.',
            'Incorrect. That needs the denominator\'s degree to be higher.',
            'Incorrect. A slant asymptote needs the quotient to be linear; here it is quadratic.',
          ],
        },
      ],
      revisit:
        'Leading-term quotient: polynomial → behaves like it (slant if linear); constant b → HA y = b; constant/polynomial → HA y = 0. ' +
        'Zeros from the numerator; VA where only the denominator is zero; holes where factors cancel, at (c, simplified value).',
    },
    {
      id: '1.11',
      ced: '1.11.A–1.11.C',
      title: 'Equivalent Representations of Polynomial and Rational Expressions',
      minutes: 6,
      summary:
        'Factored form shows zeros, intercepts, asymptotes and holes; standard form shows end behavior. Polynomial long division writes ' +
        'f = g·q + r and finds slant asymptotes. The binomial theorem uses a row of Pascal\'s triangle to expand (a + b)ⁿ.',
      body: String.raw`### Pick the form for the question
- **Factored form** → zeros, $x$-intercepts, asymptotes, holes, domain and range.
- **Standard form** → end behavior (read off the leading term).

### Polynomial long division
$f(x) = g(x)\,q(x) + r(x)$, where the remainder $r$ has lower degree than $g$. Dividing a rational function this way exposes its **slant asymptote**: $y = q(x)$ when $q$ is linear.

${steps({
  title: 'Divide x² + 3x + 5 by x + 1.',
  steps: [
    { title: 'First term', body: '$x^2 \\div x = x$; $x(x + 1) = x^2 + x$; subtract: $2x + 5$' },
    { title: 'Second term', body: '$2x \\div x = 2$; $2(x + 1) = 2x + 2$; subtract: $3$' },
    { title: 'Write it', body: '$x^2 + 3x + 5 = (x + 1)(x + 2) + 3$' },
    { title: 'Slant asymptote', body: 'For $\\dfrac{x^2 + 3x + 5}{x + 1}$: $y = x + 2$' },
  ],
  answer: 'Quotient x + 2, remainder 3',
})}

### Binomial theorem
To expand $(a + b)^n$, use row $n$ of **Pascal's triangle** as the coefficients:

| $n$ | Row |
|---|---|
| 2 | 1 2 1 |
| 3 | 1 3 3 1 |
| 4 | 1 4 6 4 1 |

$(x + 2)^3 = 1\cdot x^3 + 3\cdot x^2\cdot 2 + 3\cdot x\cdot 2^2 + 1\cdot 2^3 = x^3 + 6x^2 + 12x + 8$.`,
      blocks: [],
      precheck: {
        question: 'Using Pascal\'s triangle, what is the coefficient of $x^2$ in $(x + 1)^4$?',
        choices: ['6', '4', '1', '12'],
        answer: 0,
        explanations: [
          'Correct. Row 4 is 1 4 6 4 1; the $x^2$ term is the middle one, $6x^2(1)^2$.',
          'Incorrect. 4 is the coefficient of $x^3$ (and of $x$).',
          'Incorrect. 1 is the coefficient of $x^4$ and of the constant.',
          'Incorrect. The row is 1 4 6 4 1; no entry is 12.',
        ],
      },
      checkpoints: [
        {
          question: 'What is the slant asymptote of $r(x) = \\dfrac{x^2 - x + 4}{x - 2}$?',
          choices: ['$y = x + 1$', '$y = x$', '$y = x - 3$', '$y = 1$'],
          answer: 0,
          explanations: [
            'Correct. $x^2 - x + 4 = (x - 2)(x + 1) + 6$, so the quotient is $x + 1$.',
            'Incorrect. That is just the ratio of leading terms; include the next term of the quotient.',
            'Incorrect. Check the division: $x(x - 2) = x^2 - 2x$, leaving $x + 4$, then $+1$.',
            'Incorrect. A horizontal asymptote needs equal degrees.',
          ],
        },
        {
          question: 'Which form of a polynomial most directly shows its x-intercepts?',
          choices: ['Factored form', 'Standard form', 'The leading term alone', 'The constant term alone'],
          answer: 0,
          explanations: [
            'Correct. Each linear factor $(x - a)$ shows a zero at $x = a$.',
            'Incorrect. Standard form shows end behavior more directly.',
            'Incorrect. The leading term gives end behavior.',
            'Incorrect. The constant term is the $y$-intercept.',
          ],
        },
      ],
      revisit:
        'Factored form: zeros, intercepts, asymptotes, holes. Standard form: end behavior. Long division $f = gq + r$ gives slant asymptotes. ' +
        'Pascal\'s row n gives the coefficients of $(a+b)^n$.',
    },
    {
      id: '1.12',
      ced: '1.12.A',
      title: 'Transformations of Functions',
      minutes: 7,
      summary:
        'f(x) + k shifts the graph up by k; f(x + h) shifts it left by h; a·f(x) stretches it vertically by |a| (reflecting over the x-axis ' +
        'if a < 0); f(bx) stretches it horizontally by 1/|b| (reflecting over the y-axis if b < 0).',
      body: String.raw`### Additive and multiplicative transformations
| New function | Effect on the graph of $f$ |
|---|---|
| $f(x) + k$ | Vertical translation by $k$ (up if $k > 0$) |
| $f(x + h)$ | Horizontal translation by $-h$ (**left** if $h > 0$) |
| $a\,f(x)$ | Vertical dilation by factor $\lvert a\rvert$; reflect over the $x$-axis if $a < 0$ |
| $f(bx)$ | Horizontal dilation by factor $\tfrac{1}{\lvert b\rvert}$; reflect over the $y$-axis if $b < 0$ |

Changes **inside** the function act on $x$ and do the "opposite" of what you might expect: $+h$ moves left, and multiplying by $b = 2$ **squeezes** the graph to half its width.

The original points are the **preimage**; the transformed points are the **image**. Transformations can change the domain and range.

${graph({
  title: 'g(x) = a·f(b(x + h)) + k for f(x) = x³ − 3x',
  x: [-5, 5], y: [-8, 8],
  curves: [
    { expr: 'x^3 - 3*x', label: 'f(x) (parent)' },
    { expr: 'a*((b*(x + h))^3 - 3*b*(x + h)) + k', label: 'g(x)' },
  ],
  params: {
    a: { min: -2, max: 2, value: 1, step: 0.5, label: 'a (vertical dilation)' },
    b: { min: -2, max: 2, value: 1, step: 0.5, label: 'b (horizontal dilation)' },
    h: { min: -3, max: 3, value: 0, step: 0.5, label: 'h (horizontal shift by −h)' },
    k: { min: -4, max: 4, value: 0, step: 0.5, label: 'k (vertical shift)' },
  },
})}

Try $h = 2$: the curve moves **left** 2. Try $a = -1$: it flips over the $x$-axis. Set $b = 0$ and the curve flattens to the line $y = k$, which is why the CED requires $b \neq 0$.`,
      blocks: [],
      precheck: {
        question: 'Compared with the graph of $f$, the graph of $g(x) = f(x - 3)$ is:',
        choices: ['Shifted right 3 units', 'Shifted left 3 units', 'Shifted up 3 units', 'Shifted down 3 units'],
        answer: 0,
        explanations: [
          'Correct. $f(x + h)$ shifts by $-h$; here $h = -3$, so it moves right 3.',
          'Incorrect. Subtracting inside moves the graph right, not left.',
          'Incorrect. A vertical shift adds outside: $f(x) + 3$.',
          'Incorrect. That would be $f(x) - 3$.',
        ],
      },
      checkpoints: [
        {
          question: 'How is the graph of $g(x) = -2f(x)$ related to the graph of $f$?',
          choices: [
            'Vertically stretched by a factor of 2 and reflected over the x-axis',
            'Horizontally stretched by a factor of 2 and reflected over the y-axis',
            'Shifted down 2 units',
            'Vertically compressed by a factor of 1/2',
          ],
          answer: 0,
          explanations: [
            'Correct. A multiplier outside, $a = -2$: stretch by $|a| = 2$, and $a < 0$ flips it over the x-axis.',
            'Incorrect. A horizontal change would be inside the function, $f(bx)$.',
            'Incorrect. A shift would add, not multiply.',
            'Incorrect. $|a| = 2 > 1$ is a stretch.',
          ],
        },
        {
          question: 'The point $(4, 6)$ is on the graph of $f$. Which point must be on the graph of $g(x) = f(2x) + 1$?',
          choices: ['$(2, 7)$', '$(8, 7)$', '$(2, 12)$', '$(4, 7)$'],
          answer: 0,
          explanations: [
            'Correct. Horizontal dilation by $\\tfrac12$ takes $x = 4$ to $2$ (since $g(2) = f(4) + 1$), and the $+1$ raises 6 to 7.',
            'Incorrect. $f(2x)$ compresses horizontally; it doesn\'t double the x-coordinate.',
            'Incorrect. The 2 acts on x, not on the output.',
            'Incorrect. The x-coordinate changes too.',
          ],
        },
      ],
      revisit:
        '$f(x)+k$: up k. $f(x+h)$: left h. $a f(x)$: vertical stretch |a|, flip over x-axis if a<0. $f(bx)$: horizontal stretch $1/|b|$, ' +
        'flip over y-axis if b<0. Inside changes act on x, opposite to intuition.',
    },
    {
      id: '1.13–1.14',
      ced: '1.13.A–1.14.C',
      title: 'Choosing and Building Function Models',
      minutes: 7,
      summary:
        'Linear models fit roughly constant rates of change; quadratic models fit roughly linear rates of change or symmetric data with one ' +
        'max or min; degree-n polynomials fit constant nth differences; piecewise functions fit data that behaves differently on different ' +
        'intervals; rational functions fit inverse proportion. Every model has assumptions and domain or range restrictions.',
      body: String.raw`### Which function type?
| Data or context shows | Model |
|---|---|
| Roughly **constant** rate of change | **Linear** |
| Roughly **linear** rate of change, or symmetric with one max/min; **area** (two dimensions) | **Quadratic** |
| **Volume** (three dimensions) | **Cubic** |
| Several real zeros or several maxima/minima; constant nonzero $n$th differences | **Polynomial of degree $n$** |
| Different behavior on different intervals | **Piecewise-defined** |
| **Inverse proportion** (e.g., gravitational or electric force vs. distance squared) | **Rational** |

A polynomial of degree $n$ or less can pass through any $n + 1$ points with distinct inputs.

### Assumptions and restrictions
Every model assumes something stays consistent and something about how quantities change together. Restrict the **domain** (time can't be negative; a box's side length must stay positive) and the **range** (round to whole people) from the context or the data's extremes.

### Building and using a model
Build from transformations of a parent function, from restrictions in the context, or with **regression** (linear, quadratic, cubic, quartic) on a calculator. Then use it to answer questions and predict values, average rates of change and changing rates of change, **with units** from the context.

${steps({
  title: 'Cut x-cm squares from the corners of a 20 cm × 20 cm sheet and fold up an open box. Model its volume.',
  steps: [
    { title: 'Dimensions', body: 'Base $(20 - 2x)$ by $(20 - 2x)$, height $x$' },
    { title: 'Model', body: '$V(x) = x(20 - 2x)^2$, a **cubic** (volume is three-dimensional)' },
    { title: 'Domain', body: 'Lengths must be positive: $0 < x < 10$' },
  ],
  answer: 'V(x) = x(20 − 2x)², for 0 < x < 10 (cm³)',
})}`,
      blocks: [],
      precheck: {
        question: 'A data set has first differences 4, 4, 4, 4 at equally spaced inputs. Which model fits best?',
        choices: ['Linear', 'Quadratic', 'Cubic', 'Rational'],
        answer: 0,
        explanations: [
          'Correct. Constant first differences mean a constant rate of change.',
          'Incorrect. A quadratic would have constant second differences, with changing first differences.',
          'Incorrect. A cubic would need constant third differences.',
          'Incorrect. Nothing here suggests inverse proportion.',
        ],
      },
      checkpoints: [
        {
          question: 'The intensity of light from a bulb is inversely proportional to the square of the distance from it. Which model type fits?',
          choices: ['Rational', 'Linear', 'Quadratic', 'Piecewise-defined'],
          answer: 0,
          explanations: [
            'Correct. $I = \\dfrac{k}{d^2}$ is a rational function.',
            'Incorrect. Intensity doesn\'t change at a constant rate.',
            'Incorrect. A quadratic would have intensity grow with $d^2$, not shrink.',
            'Incorrect. The same rule applies at every distance.',
          ],
        },
        {
          question: 'A model for the height of a thrown ball is $h(t) = -5t^2 + 20t + 2$ (meters, seconds). Which domain restriction makes sense?',
          choices: [
            '$t$ from 0 until the ball hits the ground',
            'All real numbers $t$',
            '$t < 0$',
            'Only whole-number values of $t$',
          ],
          answer: 0,
          explanations: [
            'Correct. Time starts at the throw and the model stops making sense once the ball lands ($h \\ge 0$).',
            'Incorrect. Negative times and times after landing aren\'t part of the situation.',
            'Incorrect. Time before the throw isn\'t modeled.',
            'Incorrect. Time is continuous; the ball has a height at every instant.',
          ],
        },
      ],
      revisit:
        'Constant rate → linear; linear rate or area → quadratic; volume → cubic; constant nth differences → degree n; different ' +
        'behavior on intervals → piecewise; inverse proportion → rational. State assumptions; restrict domain and range from context.',
    },
  ],
};

export default pack;
