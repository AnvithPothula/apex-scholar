/**
 * AP Precalculus Unit 2: Exponential and Logarithmic Functions — study pack.
 *
 * Written against the AP Precalculus CED (current edition on AP Central,
 * topics 2.1–2.15). Follows its framing: sequences first, then linear vs
 * exponential change, exponential functions and models, composition and
 * inverses, logarithms as inverses of exponentials, and semi-log plots.
 * Related topics share a section, as in Unit 1. The interactive graphs and a
 * model-choice sort are the simulations. Every worked number was recomputed.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-precalculus/unit-2',
  subject: 'AP Precalculus',
  unit: 'Unit 2: Exponential and Logarithmic Functions',
  examWeight: '25–40% of the multiple-choice section',
  intro:
    'Linear change adds the same amount each step; exponential change multiplies by the same factor. This unit builds from ' +
    'sequences to exponential functions and models, then turns them around: composition, inverses, and logarithms, the ' +
    'inverse of exponentials. It ends with semi-log plots, which straighten exponential data into a line.',
  sections: [
    {
      id: '2.1–2.2',
      ced: '2.1.A–2.2.B',
      title: 'Sequences, and Linear vs. Exponential Change',
      minutes: 9,
      summary:
        'Arithmetic sequences add a common difference; geometric sequences multiply by a common ratio. Linear functions are ' +
        'the continuous version of arithmetic sequences and exponential functions the continuous version of geometric ones. ' +
        'Equal differences over equal intervals mean linear; equal ratios mean exponential.',
      body: String.raw`### Sequences are functions
A **sequence** is a function from the whole numbers to the real numbers, so its graph is **separate points**, not a curve.

| | Arithmetic | Geometric |
|---|---|---|
| Change between terms | Common **difference** $d$ (add) | Common **ratio** $r$ (multiply) |
| From the initial term | $a_n = a_0 + dn$ | $g_n = g_0 r^n$ |
| From the $k$th term | $a_n = a_k + d(n - k)$ | $g_n = g_k r^{\,n-k}$ |

An increasing arithmetic sequence rises by the **same amount** each step; an increasing geometric sequence of positive values rises by a **larger amount** each step.

### The function versions
| Sequence | Function on the real numbers | Point-based form |
|---|---|---|
| $a_n = a_0 + dn$ | Linear: $f(x) = b + mx$ | $f(x) = y_i + m(x - x_i)$ |
| $g_n = g_0 r^n$ | Exponential: $f(x) = ab^x$ | $f(x) = y_i\, b^{\,x - x_i}$ |

### Telling them apart from data
Over **equal-length input intervals**:
- outputs change by a **constant difference** → **linear** (addition);
- outputs change by a **constant ratio** → **exponential** (multiplication). The ratio can't be $0$ or $1$.

All four (arithmetic, geometric, linear, exponential) are determined by **two** values.

${steps({
  title: 'A geometric sequence has g₂ = 12 and g₅ = 96. Find gₙ.',
  steps: [
    { title: 'Divide to isolate the ratio', body: '$\\dfrac{g_5}{g_2} = r^{5-2} = r^3 = \\dfrac{96}{12} = 8$, so $r = 2$' },
    { title: 'Back up to the initial term', body: '$g_2 = g_0 r^2 \\Rightarrow 12 = g_0 \\cdot 4 \\Rightarrow g_0 = 3$' },
    { title: 'Check', body: '$g_5 = 3 \\cdot 2^5 = 96$ ✓' },
  ],
  answer: 'gₙ = 3 · 2ⁿ',
})}`,
      blocks: [],
      precheck: {
        question: 'The table gives f(0) = 5, f(1) = 15, f(2) = 45, f(3) = 135. Which kind of function fits?',
        choices: [
          'Exponential, because each output is 3 times the one before',
          'Linear, because the outputs increase',
          'Linear, because the inputs are equally spaced',
          'Exponential, because the differences are constant',
        ],
        answer: 0,
        explanations: [
          'Correct. Equal ratios (×3) over equal input steps mean exponential: f(x) = 5 · 3ˣ.',
          'Incorrect. Exponential functions increase too; check differences (10, 30, 90), which aren\'t constant.',
          'Incorrect. Equal spacing of inputs is needed to compare, but it doesn\'t decide the type.',
          'Incorrect. The differences are 10, 30 and 90, not constant. Constant ratios mean exponential.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`An arithmetic sequence has $a_3 = 11$ and $a_7 = 27$. What is $a_{10}$?`,
          choices: ['39', '43', '35', '30'],
          answer: 0,
          explanations: [
            'Correct. d = (27 − 11)/(7 − 3) = 4, so a₁₀ = a₇ + 4·3 = 39.',
            'Incorrect. That adds four steps of 4 to 27; from a₇ to a₁₀ is three steps.',
            'Incorrect. That adds only two steps from a₇.',
            'Incorrect. That uses a common difference of 1 from a₇.',
          ],
        },
        {
          question: 'Which statement best describes the difference between linear and exponential functions?',
          choices: [
            'Linear functions change by adding a constant; exponential functions change by multiplying by a constant',
            'Linear functions always increase; exponential functions always decrease',
            'Linear functions need three points to determine them; exponential functions need two',
            'Exponential functions have a constant rate of change',
          ],
          answer: 0,
          explanations: [
            'Correct. Linear is repeated addition of the slope; exponential is repeated multiplication by the base.',
            'Incorrect. Either kind can increase or decrease.',
            'Incorrect. Both are determined by two distinct values.',
            'Incorrect. A constant rate of change describes linear functions.',
          ],
        },
      ],
      revisit:
        'Arithmetic: aₙ = a₀ + dn (add). Geometric: gₙ = g₀rⁿ (multiply). Linear ↔ arithmetic, exponential ↔ geometric. ' +
        'Equal differences → linear; equal ratios → exponential. Two values determine each.',
    },
    {
      id: '2.3–2.4',
      ced: '2.3.A–2.4.A',
      title: 'Exponential Functions and Their Equivalent Forms',
      minutes: 9,
      summary:
        'f(x) = abˣ with a ≠ 0, b > 0, b ≠ 1. With a > 0 it shows growth when b > 1 and decay when 0 < b < 1. It is always ' +
        'increasing or always decreasing, with one concavity and no extrema or inflection points. Exponent rules turn horizontal ' +
        'shifts into vertical dilations and horizontal dilations into a change of base.',
      body: String.raw`### Key characteristics of $f(x) = ab^x$
- $a \neq 0$ is the **initial value**; $b > 0$, $b \neq 1$ is the **base**.
- $a > 0,\ b > 1$: **exponential growth**. $a > 0,\ 0 < b < 1$: **exponential decay**.
- Domain: **all real numbers**.
- Always increasing or always decreasing; always concave up or always concave down. So **no extrema** (except on a closed interval) and **no inflection points**.
- End behavior: as $x \to \pm\infty$, $ab^x$ goes to $\infty$, to $-\infty$, or gets arbitrarily close to $0$. The graph has a **horizontal asymptote** at $y = 0$.
- If $f(x)$ isn't proportional over equal intervals but $f(x) - k$ is, then $f$ is a **vertically shifted** exponential.

${graph({
  title: 'f(x) = a · bˣ',
  x: [-4, 4], y: [-10, 10],
  curves: [{ expr: 'a * b^x', label: 'f(x)' }],
  params: {
    a: { min: -3, max: 3, value: 1, step: 0.5, label: 'initial value a' },
    b: { min: 0.2, max: 3, value: 2, step: 0.1, label: 'base b' },
  },
})}

Drag **b** below 1 to see decay, and make **a** negative to reflect the graph over the $x$-axis. The curve never crosses $y = 0$.

### Rewriting exponential expressions
| Property | Rule | What it means for graphs |
|---|---|---|
| Product | $b^m b^n = b^{m+n}$ | $b^{x+k} = b^k \cdot b^x$: a **horizontal shift is a vertical dilation** by $b^k$ |
| Power | $(b^m)^n = b^{mn}$ | $b^{cx} = (b^c)^x$: a **horizontal dilation is a change of base** |
| Negative exponent | $b^{-n} = \dfrac{1}{b^n}$ | |
| Unit-fraction exponent | $b^{1/k} = \sqrt[k]{b}$ | |

Examples: $3^{x+2} = 9 \cdot 3^x$, and $8^{x/3} = (8^{1/3})^x = 2^x$.`,
      blocks: [],
      precheck: {
        question: 'Which function shows exponential decay?',
        choices: [
          String.raw`$f(x) = 4(0.7)^x$`,
          String.raw`$f(x) = 0.7(4)^x$`,
          String.raw`$f(x) = 4 - 0.7x$`,
          String.raw`$f(x) = 4(1.7)^x$`,
        ],
        answer: 0,
        explanations: [
          'Correct. a > 0 and 0 < b < 1, so outputs shrink by a factor of 0.7 each step.',
          'Incorrect. The base is 4 > 1, so this is growth.',
          'Incorrect. This is linear, not exponential.',
          'Incorrect. The base 1.7 > 1 means growth.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`Which expression is equivalent to $16^{x/2}$?`,
          choices: [String.raw`$4^x$`, String.raw`$8^x$`, String.raw`$16^x \div 2$`, String.raw`$2^{x/2}$`],
          answer: 0,
          explanations: [
            'Correct. 16^(x/2) = (16^(1/2))^x = 4^x.',
            'Incorrect. That divides the base by 2 instead of taking a square root.',
            'Incorrect. Dividing the exponent by 2 doesn\'t divide the whole power by 2.',
            'Incorrect. That changes the base from 16 to 2 without adjusting the exponent.',
          ],
        },
        {
          question: String.raw`Which is true of $f(x) = -2(3)^x$?`,
          choices: [
            'It is always decreasing and always concave down',
            'It has a maximum at x = 0',
            'It has a point of inflection at x = 0',
            'Its domain is x > 0',
          ],
          answer: 0,
          explanations: [
            'Correct. Multiplying 3ˣ (increasing, concave up) by −2 flips it: always decreasing and concave down.',
            'Incorrect. Exponential functions have no extrema on their full domain.',
            'Incorrect. Exponential functions have no inflection points.',
            'Incorrect. The domain is all real numbers.',
          ],
        },
      ],
      revisit:
        'f(x) = abˣ: growth b > 1, decay 0 < b < 1; domain all reals; monotonic, one concavity, no extrema or inflection; asymptote ' +
        'y = 0. b^(x+k) = bᵏ·bˣ; b^(cx) = (bᶜ)ˣ; b^(−n) = 1/bⁿ; b^(1/k) = kth root.',
    },
    {
      id: '2.5–2.6',
      ced: '2.5.A–2.6.B',
      title: 'Exponential Models and Choosing a Model',
      minutes: 10,
      summary:
        'Build an exponential model from an initial value and a ratio, or from two points. The base is the growth factor, ' +
        'tied to a percent change. Compare linear, quadratic and exponential models using context, and check a model with ' +
        'residuals: a residual plot with no pattern supports the model.',
      body: String.raw`### Building exponential models
- From an **initial value and a ratio**: a quantity of 1,200 growing 3% per year is $P(t) = 1200(1.03)^t$.
- From **two input-output pairs**: solve the system for $a$ and $b$.
- From **data**: exponential regression with technology.
- Sometimes you must **add a constant** to the outputs before a proportional pattern appears.
- The base $b$ is the **growth factor**: $b = 1 + r$ for a percent change $r$. Growth of 3% means $b = 1.03$; decay of 15% means $b = 0.85$.
- The natural base $e \approx 2.718$ is common in models.
- **Equivalent forms** reveal different facts: $f(d) = 2^{d/7}$ and $f(d) = (2^{1/7})^d$ are the same function. The first shows doubling **every 7 days** (every week); the second shows the daily factor.

${steps({
  title: 'An exponential function has f(1) = 6 and f(3) = 54. Find f(x) = abˣ.',
  steps: [
    { title: 'Divide the equations', body: '$\\dfrac{ab^3}{ab^1} = b^2 = \\dfrac{54}{6} = 9$, so $b = 3$ (the base must be positive)' },
    { title: 'Solve for a', body: '$a \\cdot 3 = 6 \\Rightarrow a = 2$' },
    { title: 'Check', body: '$f(3) = 2 \\cdot 27 = 54$ ✓' },
  ],
  answer: 'f(x) = 2 · 3ˣ',
})}

### Which model fits?
Data with a slightly changing rate of change could be fit by **linear, quadratic or exponential** models. Use the **context**: compound interest and population growth suggest exponential; a constant rate suggests linear; something that rises then falls (a thrown ball) suggests quadratic.

### Validating a model with residuals
- **Residual** = actual value − predicted value.
- A **residual plot** puts residuals on the vertical axis and the input on the horizontal axis. If it shows **no pattern**, the model is appropriate.
- A **positive** residual means the model **underestimated**; a **negative** one means it **overestimated**. Context can tell you which error is worse (for a bridge's load, underestimating is dangerous).

Try sorting the scenarios below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which model fits each situation best?',
            buckets: ['Linear', 'Quadratic', 'Exponential'],
            items: [
              { label: 'A taxi charges 3 dollars plus 2 dollars per mile', bucket: 0, why: 'A fixed amount is added for each mile: constant rate of change.' },
              { label: 'Distance traveled at a steady 60 miles per hour', bucket: 0, why: 'Equal time intervals add equal distances.' },
              { label: 'Height of a ball thrown straight up, over time', bucket: 1, why: 'It rises, peaks and falls: a parabola.' },
              { label: 'Area of a square as its side length grows', bucket: 1, why: 'A = s², a quadratic.' },
              { label: 'Bacteria that double every hour', bucket: 2, why: 'Repeated multiplication by 2.' },
              { label: 'A car that loses 15% of its value each year', bucket: 2, why: 'Multiplying by 0.85 each year is exponential decay.' },
              { label: 'Savings earning 4% interest compounded yearly', bucket: 2, why: 'Multiplying by 1.04 each year.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A town of 1,200 people grows 3% per year. Which model gives the population after t years?',
        choices: [
          String.raw`$P(t) = 1200(1.03)^t$`,
          String.raw`$P(t) = 1200(0.03)^t$`,
          String.raw`$P(t) = 1200 + 0.03t$`,
          String.raw`$P(t) = 1200(3)^t$`,
        ],
        answer: 0,
        explanations: [
          'Correct. Growth of 3% means multiplying by 1 + 0.03 = 1.03 each year.',
          'Incorrect. A base of 0.03 would shrink the town by 97% each year.',
          'Incorrect. That adds 0.03 people per year; percent growth is multiplicative.',
          'Incorrect. A base of 3 triples the population every year.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`Using $P(t) = 1200(1.03)^t$, what is the population after 10 years, to the nearest person?`,
          choices: ['1,613', '1,560', '1,236', '1,512'],
          answer: 0,
          explanations: [
            'Correct. 1.03¹⁰ ≈ 1.3439, and 1200 × 1.3439 ≈ 1,612.7, so about 1,613.',
            'Incorrect. That is simple growth: 1200 + 10 × 36. Exponential growth compounds.',
            'Incorrect. That is one year of growth.',
            'Incorrect. Recheck: 1.03¹⁰ is about 1.344, not 1.26.',
          ],
        },
        {
          question: 'A model predicts 47 visitors on a day when 50 actually came. What is the residual, and what does it mean?',
          choices: [
            '3; the model underestimated',
            '−3; the model underestimated',
            '3; the model overestimated',
            '−3; the model overestimated',
          ],
          answer: 0,
          explanations: [
            'Correct. Residual = actual − predicted = 50 − 47 = 3. Positive means the prediction was too low.',
            'Incorrect. The residual is actual minus predicted, which is +3.',
            'Incorrect. A positive residual means the model predicted too little, an underestimate.',
            'Incorrect. Both the sign and the interpretation are reversed.',
          ],
        },
      ],
      revisit:
        'Model from initial value and ratio (b = 1 + r) or two points. Equivalent forms show different rates. Choose linear, ' +
        'quadratic or exponential by context. Residual = actual − predicted; no pattern in the residual plot supports the model.',
    },
    {
      id: '2.7',
      ced: '2.7.A–C',
      title: 'Composition of Functions',
      minutes: 7,
      summary:
        'In f(g(x)), the outputs of g become the inputs of f. Composition is usually not commutative, the identity function ' +
        'x leaves a function unchanged, and complicated functions can be split into simpler pieces.',
      body: String.raw`### Inside out
$(f \circ g)(x) = f(g(x))$: evaluate $g$ first, then feed its output into $f$.
- The domain of $f \circ g$ includes only inputs of $g$ whose outputs are in the domain of $f$.
- Values can come from formulas, tables or graphs: find $g(x)$, then look up $f$ at that value.
- **Not commutative**: $f(g(x))$ and $g(f(x))$ are usually different.
- The **identity function** $I(x) = x$ works like $0$ for addition or $1$ for multiplication: $f(I(x)) = I(f(x)) = f(x)$.

### An example
Let $f(x) = x^2$ and $g(x) = x + 3$.
- $f(g(x)) = (x+3)^2$, so $f(g(2)) = 25$.
- $g(f(x)) = x^2 + 3$, so $g(f(2)) = 7$.

### Building and splitting compositions
- **Build**: substitute $g(x)$ for every $x$ in $f$. Composition can relate two quantities with no direct formula: if area depends on radius and radius depends on time, $A(r(t))$ gives area as a function of time.
- **Decompose**: $h(x) = \sqrt{2x + 1}$ is $f(g(x))$ with $f(x) = \sqrt{x}$ and $g(x) = 2x + 1$.
- Sums and products of functions can be split the same way: $h(x) = x^2 + e^x$ is the sum of $x^2$ and $e^x$.`,
      blocks: [],
      precheck: {
        question: String.raw`If $f(x) = x^2$ and $g(x) = x + 3$, what is $f(g(2))$?`,
        choices: ['25', '7', '10', '13'],
        answer: 0,
        explanations: [
          'Correct. g(2) = 5, then f(5) = 25.',
          'Incorrect. That is g(f(2)) = 4 + 3; the order is reversed.',
          'Incorrect. That multiplies g(2) by 2 instead of squaring it.',
          'Incorrect. That adds f(2) and g(2) instead of composing.',
        ],
      },
      checkpoints: [
        {
          question: 'A table gives g(1) = 4 and f(4) = −2, f(1) = 3, g(4) = 0. What is f(g(1))?',
          choices: ['−2', '3', '0', '4'],
          answer: 0,
          explanations: [
            'Correct. g(1) = 4, and f(4) = −2.',
            'Incorrect. That is f(1); evaluate g first.',
            'Incorrect. That is g(4), which is g(g(1)).',
            'Incorrect. That is only g(1), the inside step.',
          ],
        },
        {
          question: String.raw`Which pair gives $h(x) = (3x - 1)^5$ as $f(g(x))$?`,
          choices: [
            String.raw`$f(x) = x^5,\ g(x) = 3x - 1$`,
            String.raw`$f(x) = 3x - 1,\ g(x) = x^5$`,
            String.raw`$f(x) = x^5,\ g(x) = 3x$`,
            String.raw`$f(x) = 3x^5,\ g(x) = x - 1$`,
          ],
          answer: 0,
          explanations: [
            'Correct. The inner function 3x − 1 goes inside the outer fifth power.',
            'Incorrect. That gives 3x⁵ − 1, the reverse composition.',
            'Incorrect. That gives (3x)⁵, missing the −1.',
            'Incorrect. That gives 3(x − 1)⁵.',
          ],
        },
      ],
      revisit:
        'f(g(x)): evaluate g, then f. Domain limited by both. Not commutative. Identity x changes nothing. Build by ' +
        'substituting; decompose into inner and outer functions.',
    },
    {
      id: '2.8',
      ced: '2.8.A–B',
      title: 'Inverse Functions',
      minutes: 7,
      summary:
        'A function has an inverse on a domain where each output comes from exactly one input. The inverse swaps input-output ' +
        'pairs, swaps domain and range, reflects the graph over y = x, and undoes the function: f(f⁻¹(x)) = x.',
      body: String.raw`### When an inverse exists
$f$ is **invertible** on a domain if each output comes from a **unique** input. You can often **restrict the domain** to make it invertible: $f(x) = x^2$ is invertible on $x \ge 0$.

### What the inverse does
- Reverses the mapping: if $f(a) = b$, then $f^{-1}(b) = a$. Pairs $(a, b)$ become $(b, a)$.
- $f(f^{-1}(x)) = f^{-1}(f(x)) = x$: composing gives the identity.
- The domain of $f$ is the range of $f^{-1}$, and vice versa.
- Graph: **reflect over $y = x$**.
- Context may limit where an inverse makes sense (negative times, for instance).

${steps({
  title: 'Find the inverse of f(x) = (x − 5)/2.',
  steps: [
    { title: 'Write y = f(x) and swap x and y', body: '$x = \\dfrac{y - 5}{2}$' },
    { title: 'Solve for y', body: '$2x = y - 5 \\Rightarrow y = 2x + 5$' },
    { title: 'Check by composing', body: '$f(f^{-1}(x)) = \\dfrac{(2x + 5) - 5}{2} = x$ ✓' },
  ],
  answer: 'f⁻¹(x) = 2x + 5',
})}`,
      blocks: [],
      precheck: {
        question: String.raw`If $f(2) = 7$, what must be true about $f^{-1}$?`,
        choices: [
          String.raw`$f^{-1}(7) = 2$`,
          String.raw`$f^{-1}(2) = 7$`,
          String.raw`$f^{-1}(7) = \tfrac{1}{7}$`,
          String.raw`$f^{-1}(2) = \tfrac{1}{2}$`,
        ],
        answer: 0,
        explanations: [
          'Correct. The inverse sends the output 7 back to the input 2.',
          'Incorrect. That keeps the pair in the same order instead of swapping it.',
          'Incorrect. An inverse function isn\'t a reciprocal.',
          'Incorrect. That confuses the inverse with a reciprocal and uses the wrong input.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`What is the inverse of $f(x) = 3x - 4$?`,
          choices: [
            String.raw`$f^{-1}(x) = \dfrac{x + 4}{3}$`,
            String.raw`$f^{-1}(x) = \dfrac{x - 4}{3}$`,
            String.raw`$f^{-1}(x) = 3x + 4$`,
            String.raw`$f^{-1}(x) = \dfrac{1}{3x - 4}$`,
          ],
          answer: 0,
          explanations: [
            'Correct. Swap: x = 3y − 4, so y = (x + 4)/3.',
            'Incorrect. Undoing "subtract 4" means adding 4.',
            'Incorrect. That reverses the subtraction but not the multiplication.',
            'Incorrect. That is the reciprocal, not the inverse.',
          ],
        },
        {
          question: String.raw`Why is $f(x) = x^2$ not invertible on all real numbers?`,
          choices: [
            'Different inputs, such as 3 and −3, give the same output',
            'Its range is all real numbers',
            'It is not a function',
            'Its graph passes through the origin',
          ],
          answer: 0,
          explanations: [
            'Correct. 9 comes from both 3 and −3, so the inverse couldn\'t choose. Restrict to x ≥ 0 to fix it.',
            'Incorrect. Its range is y ≥ 0.',
            'Incorrect. It is a function; it just isn\'t one-to-one.',
            'Incorrect. Passing through the origin doesn\'t affect invertibility.',
          ],
        },
      ],
      revisit:
        'Invertible where each output has one input (restrict the domain if needed). Inverse swaps pairs, domain and range; ' +
        'reflects over y = x; f(f⁻¹(x)) = x. Swap x and y, then solve.',
    },
    {
      id: '2.9–2.11',
      ced: '2.9.A–2.11.A',
      title: 'Logarithms: Expressions, Inverses and Functions',
      minutes: 10,
      summary:
        'log_b c is the exponent you put on b to get c. Logarithmic functions are inverses of exponential functions, so their ' +
        'graphs reflect over y = x. A log function has domain x > 0, range all reals, a vertical asymptote at x = 0, and no ' +
        'extrema or inflection points.',
      body: String.raw`### What a logarithm means

$$\log_b c = a \iff b^a = c$$

Here $b > 0$ and $b \neq 1$.

- No base written means base 10: $\log 1000 = 3$.
- $\ln x$ means base $e$.
- Some values are easy: $\log_2 32 = 5$ because $2^5 = 32$; $\log 0.001 = -3$. Others need technology.
- On a **logarithmic scale** each unit is a **multiplication** by the base: $10^0, 10^1, 10^2, \dots$

### Logs undo exponentials
- $f(x) = \log_b x$ and $g(x) = b^x$ are **inverses**: $f(g(x)) = g(f(x)) = x$.
- If $(s, t)$ is on $y = b^x$, then $(t, s)$ is on $y = \log_b x$. The graphs reflect over $y = x$.
- Exponential: inputs **add**, outputs **multiply**. Logarithmic: inputs **multiply**, outputs **add**.
- General form: $f(x) = a\log_b x$, with $a \neq 0$.

${graph({
  title: 'y = bˣ and its inverse y = log_b x',
  x: [-4, 6], y: [-4, 6],
  curves: [
    { expr: 'b^x', label: 'bˣ' },
    { expr: 'ln(x) / ln(b)', label: 'log_b x' },
    { expr: 'x', label: 'y = x' },
  ],
  params: { b: { min: 1.2, max: 5, value: 2, step: 0.1, label: 'base b' } },
})}

### Characteristics of $f(x) = a\log_b x$
- Domain: $x > 0$. Range: all real numbers.
- Always increasing or always decreasing; one concavity; no extrema (except on a closed interval) and no inflection points.
- **Vertical asymptote** at $x = 0$; unbounded as $x \to \infty$.`,
      blocks: [],
      precheck: {
        question: String.raw`What is $\log_2 32$?`,
        choices: ['5', '16', '6', '1/5'],
        answer: 0,
        explanations: [
          'Correct. 2⁵ = 32, so the exponent is 5.',
          'Incorrect. That divides 32 by 2; a log asks for an exponent.',
          'Incorrect. 2⁶ = 64, not 32.',
          'Incorrect. The exponent is 5, not its reciprocal.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`What is the domain of $f(x) = \log(x - 3)$?`,
          choices: [String.raw`$x > 3$`, String.raw`$x > 0$`, 'All real numbers', String.raw`$x \geq 3$`],
          answer: 0,
          explanations: [
            'Correct. The argument must be positive: x − 3 > 0.',
            'Incorrect. The shift moves the boundary to x = 3.',
            'Incorrect. Logs aren\'t defined for zero or negative arguments.',
            'Incorrect. log 0 is undefined, so 3 itself is excluded.',
          ],
        },
        {
          question: String.raw`The point $(2, 9)$ is on the graph of $y = 3^x$. Which point must be on $y = \log_3 x$?`,
          choices: [String.raw`$(9, 2)$`, String.raw`$(2, 9)$`, String.raw`$(-2, 9)$`, String.raw`$(9, -2)$`],
          answer: 0,
          explanations: [
            'Correct. Inverse functions swap coordinates: log₃ 9 = 2.',
            'Incorrect. That point is on the exponential, not its inverse.',
            'Incorrect. Negating x reflects over the y-axis, not y = x.',
            'Incorrect. log₃ 9 is +2, not −2.',
          ],
        },
      ],
      revisit:
        'log_b c = a ⇔ bᵃ = c; log = base 10, ln = base e. Logs and exponentials are inverses: swap points, reflect over y = x. ' +
        'Log functions: domain x > 0, range all reals, asymptote x = 0, no extrema or inflection.',
    },
    {
      id: '2.12–2.13',
      ced: '2.12.A–2.13.B',
      title: 'Log Properties, Equations and Inequalities',
      minutes: 10,
      summary:
        'The product, power and change-of-base properties rewrite logs and explain their graphs. Use them, plus the inverse ' +
        'relationship with exponentials, to solve equations. Check for extraneous solutions, since log arguments must be positive.',
      body: String.raw`### Properties
| Property | Rule | Graph meaning |
|---|---|---|
| Product | $\log_b(xy) = \log_b x + \log_b y$ | $\log_b(kx) = \log_b k + \log_b x$: a **horizontal dilation is a vertical translation** |
| Power | $\log_b x^n = n\log_b x$ | $\log_b x^k = k\log_b x$: a **vertical dilation** |
| Change of base | $\log_b x = \dfrac{\log_a x}{\log_a b}$ | Every log function is a **vertical dilation** of every other |

The product and power properties together give the quotient rule: $\log_b \dfrac{x}{y} = \log_b x - \log_b y$. And $\ln x = \log_e x$.

### Solving equations
Use exponent and log properties and the inverse relationship. Then **check** each answer against the domain or context.

${steps({
  title: 'Solve 3ˣ = 20.',
  steps: [
    { title: 'Take a log of both sides', body: '$\\ln 3^x = \\ln 20 \\Rightarrow x\\ln 3 = \\ln 20$' },
    { title: 'Divide', body: '$x = \\dfrac{\\ln 20}{\\ln 3} \\approx \\dfrac{2.9957}{1.0986} \\approx 2.727$' },
  ],
  answer: 'x ≈ 2.727',
})}

${steps({
  title: 'Solve log x + log(x − 3) = 1.',
  steps: [
    { title: 'Combine with the product property', body: '$\\log\\big(x(x-3)\\big) = 1$' },
    { title: 'Rewrite as an exponential', body: '$x^2 - 3x = 10^1 \\Rightarrow x^2 - 3x - 10 = 0$' },
    { title: 'Factor', body: '$(x - 5)(x + 2) = 0 \\Rightarrow x = 5$ or $x = -2$' },
    { title: 'Check the domain', body: '$x = -2$ makes $\\log x$ undefined, so it is **extraneous**' },
  ],
  answer: 'x = 5',
})}

### Rewriting with logs
Any exponential can be rewritten in another base: $b^x = c^{(\log_c b)x}$. For example, $2^x = e^{(\ln 2)x}$.

### Inverses of transformed functions
Undo the operations in reverse order. For $f(x) = 2 \cdot 3^{x-1} + 4$:
$x = 2 \cdot 3^{y-1} + 4 \Rightarrow \dfrac{x - 4}{2} = 3^{y-1} \Rightarrow f^{-1}(x) = \log_3\!\left(\dfrac{x-4}{2}\right) + 1$.`,
      blocks: [],
      precheck: {
        question: String.raw`Which expression is equal to $\log_2 8 + \log_2 4$?`,
        choices: [String.raw`$\log_2 32$`, String.raw`$\log_2 12$`, String.raw`$\log_2 2$`, String.raw`$\log_4 32$`],
        answer: 0,
        explanations: [
          'Correct. Adding logs multiplies the arguments: 8 × 4 = 32 (and 3 + 2 = 5 = log₂ 32).',
          'Incorrect. Adding logs multiplies the arguments; it doesn\'t add them.',
          'Incorrect. That divides the arguments, which is subtraction of logs.',
          'Incorrect. The base stays 2.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`Solve $5^{2x} = 125$.`,
          choices: [String.raw`$x = \tfrac{3}{2}$`, String.raw`$x = 3$`, String.raw`$x = \tfrac{2}{3}$`, String.raw`$x = 25$`],
          answer: 0,
          explanations: [
            'Correct. 125 = 5³, so 2x = 3 and x = 3/2.',
            'Incorrect. That solves 5ˣ = 125; the exponent is 2x.',
            'Incorrect. That inverts the fraction.',
            'Incorrect. That divides 125 by 5 instead of finding an exponent.',
          ],
        },
        {
          question: String.raw`Which is equivalent to $\log(1000x)$?`,
          choices: [String.raw`$3 + \log x$`, String.raw`$3\log x$`, String.raw`$1000\log x$`, String.raw`$\log x^{1000}$`],
          answer: 0,
          explanations: [
            'Correct. log(1000x) = log 1000 + log x = 3 + log x: a horizontal dilation becomes a vertical translation.',
            'Incorrect. A product inside becomes a sum outside, not a multiple.',
            'Incorrect. The power property needs an exponent, not a factor.',
            'Incorrect. That would be 1000 log x, not log(1000x).',
          ],
        },
      ],
      revisit:
        'Product: log(xy) = log x + log y. Power: log xⁿ = n log x. Change of base: log_b x = log x / log b. Solve with logs ' +
        'or by rewriting as exponentials; reject extraneous answers that make a log argument ≤ 0.',
    },
    {
      id: '2.14–2.15',
      ced: '2.14.A–2.15.B',
      title: 'Logarithmic Models and Semi-log Plots',
      minutes: 8,
      summary:
        'Logarithmic models fit situations where inputs change proportionally over equal output intervals, like sound levels. ' +
        'On a semi-log plot (log-scaled y-axis), exponential data look linear, and the line\'s slope and intercept give the ' +
        'base and initial value.',
      body: String.raw`### Logarithmic models
Logs model situations where the **input multiplies** while the **output adds**: equal output steps correspond to proportional input steps.
- Build one from a proportion and a real zero, from two points, by transforming $a\log_b x$, or with logarithmic regression.
- The natural log is common in real-world models.
- Example: decibels. Sound level is $L = 10\log\!\left(\dfrac{I}{I_0}\right)$. A sound 1,000 times as intense is $10\log 1000 = 30$ dB louder.

### Semi-log plots
On a **semi-log plot** the $y$-axis is logarithmically scaled. **Exponential data appear linear.** That gives a quick test for whether an exponential model fits, without first shifting the data.

### Linearizing $y = ab^x$
Take the log of both sides:

$$\log_n y = (\log_n b)\,x + \log_n a$$

So on the semi-log plot the **slope** is $\log_n b$ and the **intercept** is $\log_n a$.

Example: a semi-log line $\log y = 0.3x + 1$ means $a = 10^1 = 10$ and $b = 10^{0.3} \approx 2.0$, so $y \approx 10 \cdot 2^x$.

${graph({
  title: 'log(y) for y = a · bˣ: a straight line',
  x: [0, 8], y: [-2, 6],
  curves: [{ expr: 'log(a * b^x)', label: 'log y' }],
  params: {
    a: { min: 0.5, max: 50, value: 10, step: 0.5, label: 'initial value a' },
    b: { min: 0.5, max: 4, value: 2, step: 0.1, label: 'base b' },
  },
})}

Change **b** and only the slope changes (it equals $\log b$); change **a** and only the intercept moves (it equals $\log a$).`,
      blocks: [],
      precheck: {
        question: 'Data plotted on a semi-log plot (log-scaled y-axis) fall along a straight line. Which model is most appropriate?',
        choices: ['Exponential', 'Linear', 'Quadratic', 'Logarithmic'],
        answer: 0,
        explanations: [
          'Correct. Taking the log of exponential data makes it linear.',
          'Incorrect. Linear data would look linear on ordinary axes; on a semi-log plot they curve.',
          'Incorrect. Quadratic data don\'t become linear on a semi-log plot.',
          'Incorrect. Logarithmic data become linear when the x-axis, not the y-axis, is log-scaled.',
        ],
      },
      checkpoints: [
        {
          question: String.raw`A semi-log plot (base 10) of a data set is fit by $\log y = 0.3x + 1$. Which exponential model matches?`,
          choices: [
            String.raw`$y \approx 10(2)^x$`,
            String.raw`$y \approx 1(0.3)^x$`,
            String.raw`$y \approx 0.3(10)^x$`,
            String.raw`$y \approx 2(10)^x$`,
          ],
          answer: 0,
          explanations: [
            'Correct. a = 10¹ = 10 and b = 10^0.3 ≈ 2.',
            'Incorrect. The slope and intercept are logs; undo them with powers of 10.',
            'Incorrect. That swaps the roles of the slope and the base.',
            'Incorrect. That reverses a and b.',
          ],
        },
        {
          question: String.raw`Using $L = 10\log\!\left(\tfrac{I}{I_0}\right)$, how much louder in decibels is a sound 100 times as intense as another?`,
          choices: ['20 dB', '100 dB', '10 dB', '2 dB'],
          answer: 0,
          explanations: [
            'Correct. 10 log 100 = 10 × 2 = 20 dB.',
            'Incorrect. Decibels grow with the log of intensity, not intensity itself.',
            'Incorrect. 10 dB is 10 times the intensity.',
            'Incorrect. Remember the factor of 10 in front of the log.',
          ],
        },
      ],
      revisit:
        'Log models: inputs multiply while outputs add (decibels). Semi-log plot: exponential data look linear. For y = abˣ, ' +
        'log y = (log b)x + log a: slope gives b, intercept gives a.',
    },
  ],
};

export default pack;
