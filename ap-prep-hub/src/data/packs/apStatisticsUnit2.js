/**
 * AP Statistics Unit 2: Probability, Random Variables, and Probability
 * Distributions — study pack.
 *
 * Written against the revised AP Statistics CED (effective Fall 2026, topics
 * 2.1–2.12). The 2026 framework moved two-way tables into this unit and ends
 * it with sampling distributions and the central limit theorem described by
 * simulation; the formula for the spread of a sampling distribution waits for
 * Unit 3, so this pack only describes it. Notation follows the CED:
 * P(A ∩ B), P(A ∪ B), P(A | B), μ_X, σ_X, the binomial probability function
 * and the 68–95–99.7 rule. All data sets are invented for practice.
 *
 * The law-of-large-numbers and central-limit-theorem simulations are Apex
 * components modeled on MicroSims in Dan McCreary's "Statistics"
 * (CC BY-NC-SA 4.0); see `credits`. Every number was recomputed.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-statistics/unit-2',
  subject: 'AP Statistics',
  unit: 'Unit 2: Probability, Random Variables, and Probability Distributions',
  examWeight: '15–25% of the exam',
  intro:
    'Chance looks messy one trial at a time and orderly over thousands. This unit starts with two-way tables, builds the rules ' +
    'of probability, turns outcomes into random variables with means and standard deviations, and meets the two distributions ' +
    'the rest of the course runs on: the binomial and the normal. It ends with why sample means behave so predictably.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Statistics',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/statistics-course/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'The law-of-large-numbers and central-limit-theorem simulations are rebuilt from its MicroSims.',
    },
  ],
  sections: [
    {
      id: '2.1–2.2',
      ced: '2.1.A–2.2.C',
      title: 'Two Categorical Variables',
      minutes: 9,
      summary:
        'A two-way table counts two categorical variables at once. Joint, marginal and conditional relative frequencies answer ' +
        'different questions, and comparing conditional relative frequencies across groups (often with a segmented bar chart) ' +
        'shows whether the variables are associated.',
      body: String.raw`### Two-way tables
A **two-way (contingency) table** shows counts or proportions for two categorical variables. Suppose 200 students (100 in 9th grade, 100 in 12th) were asked whether they prefer online or in-person classes:

| Grade | Online | In person |
|---|---|---|
| 9th | 30 | 70 |
| 12th | 55 | 45 |
| Total | 85 | 115 |

### Three kinds of relative frequency
- **Joint**: a cell divided by the table total. $P(\text{online and 12th}) = 55/200 = 0.275$.
- **Marginal**: a row or column total divided by the table total. $P(\text{online}) = 85/200 = 0.425$.
- **Conditional**: a cell divided by the total of its row or column. $P(\text{online} \mid \text{12th}) = 55/100 = 0.55$.

### Association
Two variables are **associated** if the conditional distributions differ across groups. Here 30% of 9th graders but 55% of 12th graders prefer online classes, so preference and grade are associated in this sample.

### Graphs
**Side-by-side bar charts**, **segmented bar charts** and **mosaic plots** show one variable's distribution within each level of the other. In a segmented bar chart, each bar is 100% of one group, so the segments compare conditional relative frequencies directly. If the segments line up across bars, there's no association.

${steps({
  title: 'Is preference associated with grade? Use the table above.',
  steps: [
    { title: 'Pick the comparison', body: 'Compare the proportion preferring online **within** each grade (conditional relative frequencies).' },
    { title: 'Compute', body: '9th: $30/100 = 0.30$. 12th: $55/100 = 0.55$.' },
    { title: 'Conclude in context', body: 'Since 0.55 is much larger than 0.30, 12th graders in this sample were more likely to prefer online classes: the variables are associated.' },
  ],
  answer: 'Yes: 55% of 12th graders vs. 30% of 9th graders prefer online',
})}`,
      blocks: [],
      precheck: {
        question: 'In the table above, what proportion of all 200 students are 9th graders who prefer in-person classes?',
        choices: ['0.35', '0.70', '0.61', '0.50'],
        answer: 0,
        explanations: [
          'Correct. That is a joint relative frequency: 70/200 = 0.35.',
          'Incorrect. 70/100 = 0.70 is the conditional proportion among 9th graders, not of all students.',
          'Incorrect. 70/115 ≈ 0.61 is the proportion of in-person fans who are 9th graders.',
          'Incorrect. 100/200 = 0.50 is the marginal proportion of 9th graders.',
        ],
      },
      checkpoints: [
        {
          question: 'Which value from the table is a conditional relative frequency?',
          choices: ['45/100 = 0.45', '45/200 = 0.225', '115/200 = 0.575', '100/200 = 0.50'],
          answer: 0,
          explanations: [
            'Correct. It restricts to the 12th graders (row total 100): P(in person | 12th).',
            'Incorrect. Dividing a cell by the table total gives a joint relative frequency.',
            'Incorrect. A column total over the table total is a marginal relative frequency.',
            'Incorrect. A row total over the table total is a marginal relative frequency.',
          ],
        },
        {
          question: 'A segmented bar chart shows that 40% of dog owners and 40% of cat owners exercise daily. What does this suggest?',
          choices: [
            'No association between pet type and daily exercise in this data',
            'Dog owners exercise more than cat owners',
            'Owning a pet causes people to exercise',
            'The two variables are strongly associated',
          ],
          answer: 0,
          explanations: [
            'Correct. Equal conditional proportions across groups mean no association.',
            'Incorrect. The proportions are equal.',
            'Incorrect. Observational data can\'t show causation, and there\'s no difference anyway.',
            'Incorrect. Association would show up as different proportions.',
          ],
        },
      ],
      revisit:
        'Two-way table: joint (cell ÷ total), marginal (row or column total ÷ total), conditional (cell ÷ its row or column total). ' +
        'Different conditional distributions across groups = association.',
    },
    {
      id: '2.3',
      ced: '2.3.A',
      title: 'Estimating Probabilities Using Simulation',
      minutes: 6,
      summary:
        'A random process has outcomes decided by chance. The probability of an event is its long-run relative frequency, and the ' +
        'law of large numbers says that with more independent trials, the relative frequency gets closer to that value. ' +
        'Simulation estimates probabilities by modeling the random process.',
      body: String.raw`### Vocabulary
- **Random process**: generates results determined by chance.
- **Outcome**: the result of one trial. **Event**: a collection of outcomes.
- **Probability**: the **long-run relative frequency** of an outcome or event.

### The law of large numbers
For independent trials, as the number of trials grows, the relative frequency of an event gets closer and closer to a single value: its probability. It says nothing about the **next** trial. After five heads in a row, the next flip is still 50–50 (believing otherwise is the gambler's fallacy).

### Simulating
1. **Model** each outcome with a chance device whose probabilities match the real process (random digits, a coin, a random number generator).
2. **Run** many trials.
3. **Record** the count of the event and the total number of trials.
4. **Estimate** the probability as count ÷ trials.

Example: to estimate how often a 70% free-throw shooter makes at least 4 of 5 shots, let digits 0–6 be a make and 7–9 a miss, read 5 random digits per trial, and count the trials with 4 or 5 makes.

Try it below: run a handful of trials, then thousands.`,
      blocks: [{ type: 'sim', sim: 'law-large-numbers' }],
      precheck: {
        question: 'A fair coin lands heads 7 times in the first 10 flips. What does the law of large numbers predict?',
        choices: [
          'Over many more flips, the proportion of heads will get closer to 0.5',
          'The next flips will be mostly tails to balance things out',
          'The coin will keep landing heads 70% of the time',
          'After 20 flips there will be exactly 10 heads',
        ],
        answer: 0,
        explanations: [
          'Correct. The long-run proportion settles near the true probability; early streaks get diluted, not corrected.',
          'Incorrect. That is the gambler\'s fallacy; each flip is independent.',
          'Incorrect. Ten flips is too few to reveal the long-run proportion.',
          'Incorrect. The law describes the long run, not an exact count at any point.',
        ],
      },
      checkpoints: [
        {
          question: 'A simulation of 500 trials finds the event occurred 140 times. What is the estimated probability?',
          choices: ['0.28', '0.14', '0.72', '3.57'],
          answer: 0,
          explanations: [
            'Correct. 140 ÷ 500 = 0.28.',
            'Incorrect. That divides by 1,000 instead of 500.',
            'Incorrect. That is the estimated probability the event does not occur.',
            'Incorrect. That divides trials by successes; a probability can\'t exceed 1.',
          ],
        },
        {
          question: 'To simulate a spinner that lands on red 30% of the time, which assignment of random digits works?',
          choices: [
            'Digits 0–2 = red, 3–9 = not red',
            'Digits 0–3 = red, 4–9 = not red',
            'Digit 3 = red, all others = not red',
            'Even digits = red, odd digits = not red',
          ],
          answer: 0,
          explanations: [
            'Correct. Three of the ten equally likely digits give probability 0.3.',
            'Incorrect. Four digits give 0.4.',
            'Incorrect. One digit gives 0.1.',
            'Incorrect. Five digits give 0.5.',
          ],
        },
      ],
      revisit:
        'Probability = long-run relative frequency. Law of large numbers: more independent trials → relative frequency closer to the ' +
        'probability (not a correction on the next trial). Simulate: model, run, record, estimate.',
    },
    {
      id: '2.4–2.5',
      ced: '2.4.A–2.5.A',
      title: 'Probability Rules and Mutually Exclusive Events',
      minutes: 6,
      summary:
        'The sample space lists every possible outcome and has probability 1. With equally likely outcomes, P(E) is favorable ' +
        'outcomes over total outcomes. P(not E) = 1 − P(E). Events are mutually exclusive when they can\'t happen together, so ' +
        'their joint probability is 0.',
      body: String.raw`### The basics
- **Sample space**: all possible non-overlapping outcomes. $P(\text{sample space}) = 1$.
- Every probability is between 0 and 1, inclusive.
- With **equally likely** outcomes:

$$P(E) = \frac{\text{outcomes in } E}{\text{outcomes in the sample space}}$$

- **Complement**: $P(E^C) = 1 - P(E)$. "At least one" problems are often easiest through the complement.

Rolling two fair dice has 36 equally likely outcomes. A sum of 7 happens 6 ways, so $P(\text{sum} = 7) = 6/36 = 1/6$, and $P(\text{sum} \neq 7) = 5/6$.

### Joint probability and mutually exclusive events
The **joint probability** $P(A \cap B)$ is the probability that both A and B happen.

Events are **mutually exclusive (disjoint)** if they can't occur at the same time:

$$P(A \cap B) = 0$$

Rolling a 2 and rolling a 5 on one die are mutually exclusive. Rolling an even number and rolling a number greater than 3 are not: a 4 or a 6 does both.`,
      blocks: [],
      precheck: {
        question: 'The probability it rains tomorrow is 0.35. What is the probability it doesn\'t rain?',
        choices: ['0.65', '0.35', '1.35', '0.50'],
        answer: 0,
        explanations: [
          'Correct. P(not rain) = 1 − 0.35 = 0.65.',
          'Incorrect. That is the probability of rain itself.',
          'Incorrect. Probabilities can\'t exceed 1; subtract instead of adding.',
          'Incorrect. Two outcomes aren\'t automatically equally likely.',
        ],
      },
      checkpoints: [
        {
          question: 'One card is drawn from a standard 52-card deck. Which pair of events is mutually exclusive?',
          choices: [
            'Drawing a heart and drawing a club',
            'Drawing a heart and drawing a king',
            'Drawing a red card and drawing a heart',
            'Drawing a face card and drawing a spade',
          ],
          answer: 0,
          explanations: [
            'Correct. One card can\'t be both a heart and a club, so P(heart ∩ club) = 0.',
            'Incorrect. The king of hearts is both.',
            'Incorrect. Every heart is red.',
            'Incorrect. The jack, queen and king of spades are both.',
          ],
        },
        {
          question: 'Two fair dice are rolled. What is the probability the sum is 11?',
          choices: ['2/36', '1/36', '11/36', '1/11'],
          answer: 0,
          explanations: [
            'Correct. (5, 6) and (6, 5) are 2 of the 36 equally likely outcomes.',
            'Incorrect. That counts only one order; (5, 6) and (6, 5) are different outcomes.',
            'Incorrect. The sum isn\'t the number of ways to get it.',
            'Incorrect. The 11 possible sums (2–12) aren\'t equally likely.',
          ],
        },
      ],
      revisit:
        'Sample space has probability 1; 0 ≤ P ≤ 1; equally likely: favorable ÷ total; P(not E) = 1 − P(E). Mutually exclusive: ' +
        'can\'t happen together, so P(A ∩ B) = 0.',
    },
    {
      id: '2.6–2.7',
      ced: '2.6.A–2.7.A',
      title: 'Conditional Probability, Independence and Unions',
      minutes: 9,
      summary:
        'P(A | B) is the probability of A when B is known to have happened. The general multiplication rule gives P(A ∩ B). ' +
        'Events are independent when knowing one happened doesn\'t change the other\'s probability. The addition rule ' +
        'subtracts the overlap so it isn\'t counted twice.',
      body: String.raw`### Conditional probability
$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

From the two-way table in 2.1: $P(\text{online} \mid \text{12th}) = \dfrac{55/200}{100/200} = 0.55$. Restricting to the 12th-grade row gives the same answer directly.

### General multiplication rule
$$P(A \cap B) = P(A) \cdot P(B \mid A)$$

Example: 2 of 10 light bulbs are defective. Pick two without replacement. $P(\text{both defective}) = \tfrac{2}{10} \cdot \tfrac{1}{9} = \tfrac{2}{90} \approx 0.022$.

### Independence
A and B are **independent** if and only if knowing whether one occurred doesn't change the probability of the other:

$$P(A \mid B) = P(A)$$

Then $P(A \cap B) = P(A) \cdot P(B)$. In the table, $P(\text{online}) = 0.425$ but $P(\text{online} \mid \text{12th}) = 0.55$, so preference and grade are **not** independent.

Don't confuse independent with mutually exclusive: if A and B are mutually exclusive (and each has positive probability), knowing A happened makes B impossible, so they're **dependent**.

### Unions
$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

Subtract the overlap, because outcomes in both events were counted twice. From the table: $P(\text{online} \cup \text{12th}) = 0.425 + 0.50 - 0.275 = 0.65$.`,
      blocks: [],
      precheck: {
        question: 'P(A) = 0.4, P(B) = 0.5 and P(A ∩ B) = 0.2. Are A and B independent?',
        choices: [
          'Yes, because P(A) × P(B) = 0.2 = P(A ∩ B)',
          'No, because P(A ∩ B) isn\'t 0',
          'No, because P(A) ≠ P(B)',
          'Yes, because P(A) + P(B) < 1',
        ],
        answer: 0,
        explanations: [
          'Correct. Equivalently, P(A | B) = 0.2/0.5 = 0.4 = P(A).',
          'Incorrect. A nonzero overlap rules out mutually exclusive, not independent.',
          'Incorrect. Independent events can have different probabilities.',
          'Incorrect. That sum says nothing about independence.',
        ],
      },
      checkpoints: [
        {
          question: 'Using the 2.1 table, what is P(12th grade | prefers online)?',
          choices: ['55/85 ≈ 0.647', '55/100 = 0.55', '55/200 = 0.275', '85/200 = 0.425'],
          answer: 0,
          explanations: [
            'Correct. Restrict to the 85 students who prefer online; 55 of them are 12th graders.',
            'Incorrect. That is P(online | 12th): the condition is reversed.',
            'Incorrect. That is the joint probability.',
            'Incorrect. That is the marginal probability of preferring online.',
          ],
        },
        {
          question: 'P(A) = 0.3, P(B) = 0.6 and P(A ∩ B) = 0.1. What is P(A ∪ B)?',
          choices: ['0.8', '0.9', '0.18', '1.0'],
          answer: 0,
          explanations: [
            'Correct. 0.3 + 0.6 − 0.1 = 0.8.',
            'Incorrect. That forgets to subtract the overlap.',
            'Incorrect. That multiplies; the union adds.',
            'Incorrect. Only if A and B covered the sample space with no overlap counted twice.',
          ],
        },
      ],
      revisit:
        'P(A | B) = P(A ∩ B)/P(B). P(A ∩ B) = P(A)·P(B | A). Independent: P(A | B) = P(A), so P(A ∩ B) = P(A)P(B). ' +
        'P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Mutually exclusive events (with positive probability) are dependent.',
    },
    {
      id: '2.8–2.9',
      ced: '2.8.A–2.9.B',
      title: 'Random Variables and Their Parameters',
      minutes: 9,
      summary:
        'A random variable assigns a number to each outcome of a random process. Its probability distribution lists every value ' +
        'with its probability, summing to 1. The expected value is the long-run average, and the standard deviation is the typical ' +
        'distance of values from it over the long run.',
      body: String.raw`### Random variables and distributions
- A **random variable** has numerical values that come from a random process.
- A **discrete** random variable has countable values. Its **probability distribution** (a table, graph or function) gives every value's probability, and the probabilities **sum to 1**.
- A **cumulative** distribution gives $P(X \le x)$ for each value.

Example: a school-fair game pays $X$ prize tickets.

| Tickets $x$ | $P(x)$ |
|---|---|
| 0 | 0.70 |
| 2 | 0.25 |
| 10 | 0.05 |

Check: $0.70 + 0.25 + 0.05 = 1$. Cumulative: $P(X \le 2) = 0.95$.

### Parameters
A **parameter** is a fixed number describing a distribution or population.

$$\mu_X = \sum x_i \, P(x_i)$$

$$\sigma_X = \sqrt{\sum (x_i - \mu_X)^2 \, P(x_i)}$$

The variance is $\sigma_X^2$.

${steps({
  title: 'Find the mean and standard deviation of the prize tickets X.',
  steps: [
    { title: 'Expected value', body: '$\\mu_X = 0(0.70) + 2(0.25) + 10(0.05) = 0 + 0.5 + 0.5 = 1.0$' },
    { title: 'Variance', body: '$(0-1)^2(0.70) + (2-1)^2(0.25) + (10-1)^2(0.05) = 0.70 + 0.25 + 4.05 = 5.0$' },
    { title: 'Standard deviation', body: '$\\sigma_X = \\sqrt{5.0} \\approx 2.24$' },
  ],
  answer: 'μ = 1.0 ticket, σ ≈ 2.24 tickets',
})}

### Interpreting in context
"If many people play, the **average** prize will be about 1 ticket per game. Individual prizes **typically vary** from that average by about 2.24 tickets." The expected value need not be a possible outcome: no single game pays exactly 1 ticket.`,
      blocks: [],
      precheck: {
        question: 'A random variable takes the values 1, 2 and 3 with probabilities 0.2, 0.5 and k. What is k?',
        choices: ['0.3', '0.7', '0.5', '1'],
        answer: 0,
        explanations: [
          'Correct. Probabilities must sum to 1: 0.2 + 0.5 + k = 1.',
          'Incorrect. That is 0.2 + 0.5, the probability of the other values.',
          'Incorrect. The values needn\'t be equally likely.',
          'Incorrect. Then the total would be 1.7.',
        ],
      },
      checkpoints: [
        {
          question: 'X takes values 0, 1 and 2 with probabilities 0.5, 0.3 and 0.2. What is E(X)?',
          choices: ['0.7', '1.0', '0.33', '1.5'],
          answer: 0,
          explanations: [
            'Correct. 0(0.5) + 1(0.3) + 2(0.2) = 0.7.',
            'Incorrect. That averages the values without weighting by probability.',
            'Incorrect. That averages the probabilities.',
            'Incorrect. Recheck the weights: the value 2 has probability 0.2, not 0.5.',
          ],
        },
        {
          question: 'An insurance policy\'s payout has expected value 150 dollars. Which interpretation is correct?',
          choices: [
            'Over many similar policies, the average payout per policy is about 150 dollars',
            'Every policyholder receives 150 dollars',
            'The most likely payout is 150 dollars',
            'Half of policyholders receive more than 150 dollars',
          ],
          answer: 0,
          explanations: [
            'Correct. Expected value is the long-run average outcome.',
            'Incorrect. Most policies pay nothing; a few pay a lot.',
            'Incorrect. That would be the mode.',
            'Incorrect. That would be the median.',
          ],
        },
      ],
      revisit:
        'Random variable: numeric outcomes of chance; distribution probabilities sum to 1; cumulative gives P(X ≤ x). μ = Σx·P(x) ' +
        '(long-run average); σ = √Σ(x − μ)²P(x) (typical deviation). Interpret in context.',
    },
    {
      id: '2.10',
      ced: '2.10.A–E',
      title: 'The Binomial Distribution',
      minutes: 9,
      summary:
        'A binomial random variable counts successes in a fixed number of independent trials that each succeed with the same ' +
        'probability. Its mean is np and its standard deviation is √(np(1 − p)), and the binomial probability function gives ' +
        'P(X = x).',
      body: String.raw`### Is it binomial? Check all four
- **B**inary: each trial is a success or failure.
- **I**ndependent trials.
- **N**umber of trials $n$ is fixed in advance.
- **S**ame probability of success $p$ on every trial.

If any condition fails, it isn't binomial. Counting flips **until** the first head fails "fixed n".

### Formulas
$$P(X = x) = \binom{n}{x} p^x (1-p)^{n-x}$$

$$\mu_X = np$$

$$\sigma_X = \sqrt{np(1-p)}$$

${steps({
  title: 'A 70% free-throw shooter takes 10 independent shots. Find μ, σ and P(X = 8).',
  steps: [
    { title: 'Check binomial', body: 'Make or miss, independent shots, $n = 10$ fixed, $p = 0.7$ each time.' },
    { title: 'Mean and SD', body: '$\\mu = 10(0.7) = 7$; $\\sigma = \\sqrt{10(0.7)(0.3)} = \\sqrt{2.1} \\approx 1.45$' },
    { title: 'Exactly 8', body: '$\\binom{10}{8}(0.7)^8(0.3)^2 = 45(0.05765)(0.09) \\approx 0.233$' },
  ],
  answer: 'μ = 7 makes, σ ≈ 1.45 makes, P(X = 8) ≈ 0.233',
})}

Interpret: "Over many sets of 10 shots, she averages 7 makes, and the number of makes typically varies from 7 by about 1.45."

Binomial probabilities can also be estimated by simulation: simulate many sets of $n$ trials and record the proportion with the outcome you want.

Sort the situations below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Binomial or not?',
            buckets: ['Binomial', 'Not binomial'],
            items: [
              { label: 'Number of heads in 20 flips of a fair coin', bucket: 0, why: 'Binary, independent, n = 20 fixed, p = 0.5 each time.' },
              { label: 'Number of sixes in 12 rolls of a die', bucket: 0, why: 'Six or not, independent rolls, n = 12, p = 1/6.' },
              { label: 'Correct answers when guessing on 10 five-choice questions', bucket: 0, why: 'Right or wrong, independent guesses, n = 10, p = 0.2.' },
              { label: 'Number of flips until the first head', bucket: 1, why: 'The number of trials isn\'t fixed.' },
              { label: 'Total of the faces in 5 dice rolls', bucket: 1, why: 'It adds face values; it doesn\'t count successes.' },
              { label: 'Aces when dealing 5 cards from a deck with no replacement', bucket: 1, why: 'The chance of an ace changes after each card, so p isn\'t constant and trials aren\'t independent.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which condition fails for "the number of rolls of a die until a 6 appears"?',
        choices: ['The number of trials is not fixed', 'Trials are not independent', 'There are more than two outcomes per trial', 'The probability of success changes'],
        answer: 0,
        explanations: [
          'Correct. Rolling continues until a 6, so n isn\'t set in advance.',
          'Incorrect. Die rolls are independent.',
          'Incorrect. "6 or not 6" is binary.',
          'Incorrect. P(6) is 1/6 on every roll.',
        ],
      },
      checkpoints: [
        {
          question: 'X is binomial with n = 50 and p = 0.2. What are its mean and standard deviation?',
          choices: ['μ = 10, σ ≈ 2.83', 'μ = 10, σ = 8', 'μ = 0.2, σ ≈ 0.4', 'μ = 40, σ ≈ 2.83'],
          answer: 0,
          explanations: [
            'Correct. μ = 50(0.2) = 10; σ = √(50 × 0.2 × 0.8) = √8 ≈ 2.83.',
            'Incorrect. 8 is the variance; take its square root.',
            'Incorrect. Those describe a single trial, not the count over 50 trials.',
            'Incorrect. 40 is the expected number of failures.',
          ],
        },
        {
          question: 'A quiz has 4 true-false questions and you guess on each. What is P(exactly 3 correct)?',
          choices: ['0.25', '0.0625', '0.375', '0.75'],
          answer: 0,
          explanations: [
            'Correct. C(4,3)(0.5)³(0.5)¹ = 4 × 0.0625 = 0.25.',
            'Incorrect. That is one particular order; there are 4 orders with 3 correct.',
            'Incorrect. 0.375 is P(exactly 2 correct) = 6 × 0.0625.',
            'Incorrect. That isn\'t a binomial probability for this count.',
          ],
        },
      ],
      revisit:
        'Binomial = BINS: binary, independent, n fixed, same p. P(X = x) = C(n,x)pˣ(1 − p)ⁿ⁻ˣ; μ = np; σ = √(np(1 − p)). Interpret in ' +
        'context; probabilities can be estimated by simulation.',
    },
    {
      id: '2.11',
      ced: '2.11.A–F',
      title: 'The Normal Distribution',
      minutes: 10,
      summary:
        'A normal distribution is a continuous, unimodal, symmetric bell curve set by its mean μ and standard deviation σ. ' +
        'Areas under the curve are probabilities: the empirical rule gives quick estimates, and z-scores with technology or a table ' +
        'give exact areas and the boundaries for a given area.',
      body: String.raw`### Describing a normal curve
- **Continuous** random variables take any value in an interval; probabilities are **areas** under the curve, and the total area is 1.
- A normal curve is **continuous, unimodal, bell-shaped and symmetric**, set by $\mu$ (center) and $\sigma$ (spread). Smaller $\sigma$: taller and narrower. Larger $\sigma$: shorter and wider.
- The **standard normal** distribution has $\mu = 0$, $\sigma = 1$.

${graph({
  title: 'A normal curve with mean μ and standard deviation σ',
  x: [40, 90], y: [0, 0.42],
  curves: [{ expr: '1 / (s * sqrt(2 * pi)) * exp(-((x - m)^2) / (2 * s^2))', label: 'density' }],
  params: {
    m: { min: 50, max: 80, value: 64.5, step: 0.5, label: 'mean μ' },
    s: { min: 1, max: 8, value: 2.5, step: 0.5, label: 'standard deviation σ' },
  },
})}

### The empirical rule (68–95–99.7)
About **68%** of values lie within 1 SD of the mean, **95%** within 2 SD, and **99.7%** within 3 SD.

### Exact areas with z-scores
$$z = \frac{x - \mu}{\sigma}$$

Suppose adult heights in a population are approximately normal with $\mu = 64.5$ in and $\sigma = 2.5$ in.

${steps({
  title: 'What proportion are shorter than 67 in? What height marks the tallest 10%?',
  steps: [
    { title: 'Area to the left', body: '$z = \\dfrac{67 - 64.5}{2.5} = 1.0$, so $P(X < 67) \\approx 0.8413$' },
    { title: 'Boundary for the top 10%', body: 'The 90th percentile has $z \\approx 1.2816$, so $x = 64.5 + 1.2816(2.5) \\approx 67.7$ in' },
  ],
  answer: 'About 84.1% are shorter than 67 in; the tallest 10% are above about 67.7 in',
})}

### Setting up intervals
- Lowest $p\%$: $P(X < x_a) = p/100$.
- Middle $p\%$: $P(x_a < X < x_b) = p/100$.
- Highest $p\%$: $P(X > x_b) = p/100$.
- Most extreme $p\%$ on both sides: put half in each tail, $\tfrac{1}{2}\left(\tfrac{p}{100}\right)$. The middle 90% of heights runs from $64.5 \pm 1.645(2.5)$: about 60.4 to 68.6 in.

Percentiles and proportions compare positions within or across normal distributions: a value at the 84th percentile beat about 84% of its distribution.`,
      blocks: [],
      precheck: {
        question: 'Test scores are approximately normal with mean 70 and SD 8. About what percent of scores are between 54 and 86?',
        choices: ['95%', '68%', '99.7%', '47.5%'],
        answer: 0,
        explanations: [
          'Correct. 54 and 86 are 2 SD below and above the mean.',
          'Incorrect. 68% is within 1 SD (62 to 78).',
          'Incorrect. 99.7% is within 3 SD (46 to 94).',
          'Incorrect. That is only one half of the 2-SD interval.',
        ],
      },
      checkpoints: [
        {
          question: 'For the heights distribution (μ = 64.5, σ = 2.5), what proportion are taller than 62 in?',
          choices: ['About 0.84', 'About 0.16', 'About 0.68', 'About 0.50'],
          answer: 0,
          explanations: [
            'Correct. z = (62 − 64.5)/2.5 = −1, and P(Z > −1) ≈ 0.8413.',
            'Incorrect. That is the area below 62.',
            'Incorrect. That is the area within 1 SD on both sides.',
            'Incorrect. 62 is below the mean, so more than half are taller.',
          ],
        },
        {
          question: 'Two normal curves have the same mean. Curve A has σ = 2 and curve B has σ = 6. Which is true?',
          choices: [
            'A is taller and narrower than B',
            'A is shorter and wider than B',
            'A and B have the same shape',
            'A has more total area than B',
          ],
          answer: 0,
          explanations: [
            'Correct. A smaller SD concentrates the area near the mean.',
            'Incorrect. That describes the curve with the larger SD.',
            'Incorrect. Different SDs give different spreads.',
            'Incorrect. Every density curve has total area 1.',
          ],
        },
      ],
      revisit:
        'Normal: continuous, unimodal, symmetric, set by μ and σ; area = probability; total 1. Empirical rule 68–95–99.7. ' +
        'z = (x − μ)/σ for exact areas; work backward from an area to find interval boundaries.',
    },
    {
      id: '2.12',
      ced: '2.12.A',
      title: 'Sampling Distributions and the Central Limit Theorem',
      minutes: 8,
      summary:
        'A sampling distribution is the distribution of a statistic over all possible samples of a given size. Simulation ' +
        'approximates it, and a randomization distribution does the same for reassigned treatment groups. The central limit ' +
        'theorem says the sampling distribution of a sample mean is approximately normal, more so for larger samples.',
      body: String.raw`### What a sampling distribution is
A **statistic** (like a sample mean $\bar{x}$) changes from sample to sample. Its **sampling distribution** is the distribution of its values over **all possible samples** of a given size from the population.

### Simulating one
1. Assume known parameter values for the population.
2. Draw a random sample, compute the statistic, and record it.
3. Repeat many times. The collection of statistics approximates the sampling distribution.

A **randomization distribution** does the same for an experiment: repeatedly reassign the observed responses to treatment groups at random, recording the statistic (say, the difference in means) each time. It shows how big a difference chance alone tends to produce.

### The central limit theorem
The sampling distribution of a sample mean has a shape that is **approximately normal**, and the approximation improves as the sample size grows, even if the population itself is skewed or bimodal.

Try it: start with a right-skewed population and $n = 1$, then raise $n$ to 30.`,
      blocks: [{ type: 'sim', sim: 'clt-lab' }],
      precheck: {
        question: 'A population is strongly right-skewed. What does the central limit theorem say about the means of many random samples of size 50?',
        choices: [
          'Their distribution is approximately normal',
          'Their distribution is strongly right-skewed, like the population',
          'They all equal the population mean',
          'Their distribution is uniform',
        ],
        answer: 0,
        explanations: [
          'Correct. For a large enough n, sample means are approximately normal whatever the population shape.',
          'Incorrect. Averaging pulls the means into a bell shape as n grows.',
          'Incorrect. Sample means vary around the population mean.',
          'Incorrect. The CLT points to normal, not uniform.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes a sampling distribution?',
          choices: [
            'The distribution of a statistic\'s values over all possible samples of the same size',
            'The distribution of the individual values in one sample',
            'The distribution of the population',
            'A list of the people who were sampled',
          ],
          answer: 0,
          explanations: [
            'Correct. It describes how a statistic varies from sample to sample.',
            'Incorrect. That is the distribution of one sample\'s data.',
            'Incorrect. The population distribution describes individuals, not statistics.',
            'Incorrect. That is a sampling frame or roster.',
          ],
        },
        {
          question: 'Researchers shuffle the responses from their experiment between the two groups 1,000 times, recording the difference in means each time. What have they built?',
          choices: ['A randomization distribution', 'A population distribution', 'A two-way table', 'A binomial distribution'],
          answer: 0,
          explanations: [
            'Correct. Reallocating responses to treatment groups at random gives a randomization distribution.',
            'Incorrect. Nothing here describes the whole population of individuals.',
            'Incorrect. A two-way table summarizes two categorical variables.',
            'Incorrect. Differences in means aren\'t counts of successes.',
          ],
        },
      ],
      revisit:
        'Sampling distribution: a statistic over all samples of size n; simulate by repeated sampling. Randomization distribution: ' +
        'reshuffle responses across groups. CLT: sample means are approximately normal, better for larger n.',
    },
  ],
};

export default pack;
