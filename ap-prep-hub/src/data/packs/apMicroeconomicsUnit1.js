/**
 * AP Microeconomics Unit 1: Basic Economic Concepts — study pack.
 *
 * Written against the AP Microeconomics CED (effective Fall 2026, topics
 * 1.1–1.6): scarcity, resource allocation and economic systems, the PPC,
 * comparative advantage and trade, cost-benefit analysis, and marginal
 * analysis and consumer choice. Follows the exclusion statement: indifference
 * curves are out of scope, MU/P comparisons are in.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-microeconomics/unit-1',
  subject: 'AP Microeconomics',
  unit: 'Unit 1: Basic Economic Concepts',
  examWeight: '12–15% of the exam',
  intro:
    'Microeconomics studies choices by individuals and firms under scarcity. This unit sets up the tools: how societies allocate ' +
    'resources, the production possibilities curve, comparative advantage, and the habit that runs through the whole course, ' +
    'thinking at the margin.',
  sections: [
    {
      id: '1.1',
      ced: 'MKT-1.A',
      title: 'Scarcity',
      minutes: 3,
      summary:
        'Trade-offs exist because resources (land, labor, capital) are too scarce to meet all wants. Some factors, such as established ' +
        'knowledge, may not be scarce because they are non-rival: one person\'s use doesn\'t reduce another\'s.',
      body: String.raw`### Why trade-offs exist
**Scarcity**: there aren't enough resources to satisfy all of society's wants and needs, so every use of a resource means giving up another.

### Factors of production
**Land** (natural resources), **labor** (human effort), **capital** (tools, machines, buildings used to produce) and **entrepreneurship** (organizing production and taking risk).

### Not everything is scarce
Some factors, like **established knowledge** (a formula, a published recipe), may **not** be scarce, because they are **non-rival**: one person using the idea doesn't leave less of it for anyone else.`,
      blocks: [],
      precheck: {
        question: 'Why might established knowledge, such as the Pythagorean theorem, not be scarce?',
        choices: [
          'It is non-rival: one person using it doesn\'t reduce anyone else\'s ability to use it',
          'It is free to produce new knowledge',
          'Governments own all knowledge',
          'Knowledge is a form of land',
        ],
        answer: 0,
        explanations: [
          'Correct. Non-rival resources can be used by everyone at once.',
          'Incorrect. Creating new knowledge takes scarce resources; the point is that using existing knowledge doesn\'t use it up.',
          'Incorrect. Ownership isn\'t what makes it non-scarce.',
          'Incorrect. Land means natural resources.',
        ],
      },
      checkpoints: [
        {
          question: 'Which best explains why economic trade-offs exist?',
          choices: [
            'Resources are insufficient to meet all of society\'s wants',
            'Prices are too high',
            'Some goods are non-rival',
            'People prefer some goods to others',
          ],
          answer: 0,
          explanations: [
            'Correct. Scarcity forces choosing one use of a resource over another.',
            'Incorrect. Prices reflect scarcity; they don\'t cause trade-offs.',
            'Incorrect. Non-rival goods are the exception, not the reason.',
            'Incorrect. Preferences matter only because resources are limited.',
          ],
        },
        {
          question: 'A bakery\'s ovens are an example of which factor of production?',
          choices: ['Capital', 'Land', 'Labor', 'Entrepreneurship'],
          answer: 0,
          explanations: [
            'Correct. Ovens are man-made tools used to produce goods.',
            'Incorrect. Land is natural resources.',
            'Incorrect. Labor is the bakers\' work.',
            'Incorrect. Entrepreneurship is starting and running the bakery.',
          ],
        },
      ],
      revisit: 'Scarcity → trade-offs. Land, labor, capital, entrepreneurship. Non-rival resources (established knowledge) may not be scarce.',
    },
    {
      id: '1.2',
      ced: 'MKT-1.B',
      title: 'Resource Allocation and Economic Systems',
      minutes: 4,
      summary:
        'Every society answers three questions: what to produce, how to produce it, and who gets it. Command, market and mixed economies ' +
        'answer them with different institutions and coordinating mechanisms.',
      body: String.raw`### Three basic questions
1. **What** goods and services to produce?
2. **How** to produce them?
3. **Who** consumes them (for whom)?

### Economic systems
| System | Who decides | Coordinating mechanism |
|---|---|---|
| **Command** | Central government | Plans and directives |
| **Market** | Individuals and firms | Prices, self-interest, competition |
| **Mixed** | Both | Markets with government rules, taxes, public goods |

Every real economy is mixed; they differ in how much each mechanism is used. The U.S. leans market; North Korea leans command.`,
      blocks: [],
      precheck: {
        question: 'In a market economy, resources are allocated mainly by:',
        choices: ['Prices and voluntary exchange', 'A central planning agency', 'Tradition', 'Random lottery'],
        answer: 0,
        explanations: [
          'Correct. Prices signal what to produce and coordinate buyers and sellers.',
          'Incorrect. That describes a command economy.',
          'Incorrect. Tradition-based systems exist but aren\'t the market mechanism.',
          'Incorrect. Allocation follows prices, not chance.',
        ],
      },
      checkpoints: [
        {
          question: 'A government decides how many tractors each factory must build and sets their prices. This is characteristic of:',
          choices: ['A command economy', 'A market economy', 'A mixed economy with minimal regulation', 'Comparative advantage'],
          answer: 0,
          explanations: [
            'Correct. Central planners answer what, how and for whom.',
            'Incorrect. In a market economy, firms decide output in response to prices.',
            'Incorrect. Setting output and prices directly is command, not light regulation.',
            'Incorrect. Comparative advantage is about opportunity cost, not systems.',
          ],
        },
        {
          question: 'Which question is about "how to produce"?',
          choices: [
            'Should the factory use robots or more workers?',
            'Should the country make more cars or more food?',
            'Should cars go to people who can pay the most?',
            'Should the country trade with its neighbor?',
          ],
          answer: 0,
          explanations: [
            'Correct. Choosing the combination of inputs is "how".',
            'Incorrect. That is "what".',
            'Incorrect. That is "for whom".',
            'Incorrect. Trade is a separate decision, not one of the three questions.',
          ],
        },
      ],
      revisit: 'What, how, for whom. Command: government plans. Market: prices. Mixed: both. Every real economy is mixed.',
    },
    {
      id: '1.3',
      ced: 'MKT-1.C',
      title: 'Production Possibilities Curve',
      minutes: 8,
      summary:
        'The PPC shows the trade-offs of allocating resources. On it is efficient, inside is inefficient (idle resources), outside is ' +
        'unattainable. Its shape shows constant or increasing opportunity cost, and better factors or technology shift it out.',
      body: String.raw`### Reading a PPC
| Point | Meaning |
|---|---|
| **On** the curve | Efficient: resources fully employed |
| **Inside** | Inefficient: unemployed or underused resources |
| **Outside** | Unattainable now |

- **Bowed out**: increasing opportunity cost (resources are specialized). **Straight**: constant opportunity cost.
- **Shifts out** with more or better factors of production or improved productivity/technology (economic growth); **in** when resources are lost.
- A technology that helps only one good pivots the curve out along that good's axis only.

${steps({
  title: 'On a PPC, moving from (40 corn, 10 tools) to (30 corn, 14 tools): what is the opportunity cost of each tool?',
  steps: [
    { title: 'Given up', body: '40 − 30 = 10 corn' },
    { title: 'Gained', body: '14 − 10 = 4 tools' },
    { title: 'Per tool', body: '10 ÷ 4 = 2.5 corn per tool' },
  ],
  answer: '2.5 corn per tool',
})}`,
      blocks: [{ type: 'sim', sim: 'ppc-explorer' }],
      precheck: {
        question: 'Which describes a point outside a country\'s current PPC?',
        choices: ['Unattainable with current resources and technology', 'Inefficient', 'Efficient', 'Showing unemployment'],
        answer: 0,
        explanations: [
          'Correct. The economy can\'t reach it without growth or trade.',
          'Incorrect. Inefficient points are inside the curve.',
          'Incorrect. Efficient points are on the curve.',
          'Incorrect. Unemployment puts the economy inside the curve.',
        ],
      },
      checkpoints: [
        {
          question: 'A breakthrough makes wheat farming much more productive but doesn\'t affect car making. The PPC (wheat on the x-axis, cars on the y-axis):',
          choices: [
            'Pivots outward along the wheat axis only',
            'Shifts outward on both axes equally',
            'Shifts inward',
            'Doesn\'t move; the economy moves along it',
          ],
          answer: 0,
          explanations: [
            'Correct. Maximum car output is unchanged; maximum wheat output rises.',
            'Incorrect. Only wheat production improved.',
            'Incorrect. Better technology expands, not shrinks, possibilities.',
            'Incorrect. A change in productivity moves the curve itself.',
          ],
        },
        {
          question: 'Each additional robot produced requires giving up more and more wheat. This PPC is:',
          choices: ['Bowed outward, with increasing opportunity cost', 'A straight line', 'Bowed inward, with decreasing opportunity cost', 'Shifting outward'],
          answer: 0,
          explanations: [
            'Correct. Rising opportunity cost bows the curve out.',
            'Incorrect. A straight line means constant opportunity cost.',
            'Incorrect. That would mean each robot costs less wheat.',
            'Incorrect. This is about the slope along the curve, not a shift.',
          ],
        },
      ],
      revisit: 'On = efficient, inside = idle resources, outside = unattainable. Bowed = increasing OC, straight = constant. OC per unit = given up ÷ gained.',
    },
    {
      id: '1.4',
      ced: 'MKT-2.A–MKT-2.B',
      title: 'Comparative Advantage and Trade',
      minutes: 9,
      summary:
        'Absolute advantage is producing more with the same resources; comparative advantage is producing at lower opportunity cost. ' +
        'Specializing by comparative advantage, not absolute advantage, and trading at terms between the two opportunity costs lets both ' +
        'parties consume beyond their PPCs.',
      body: String.raw`### Advantages
- **Absolute advantage**: more output from the same resources.
- **Comparative advantage**: a **lower opportunity cost**. This, **not** absolute advantage, decides who should specialize in what.

### Input problems (time or resources per unit)
When a table shows **hours needed per unit**, opportunity cost of A = (hours for A) ÷ (hours for B).

${steps({
  title: 'Ana needs 2 h per shirt and 4 h per jacket; Ben needs 3 h per shirt and 9 h per jacket. Who should make jackets?',
  steps: [
    { title: 'Ana\'s cost of 1 jacket', body: '4 h could make 4 ÷ 2 = **2 shirts**' },
    { title: 'Ben\'s cost of 1 jacket', body: '9 h could make 9 ÷ 3 = **3 shirts**' },
    { title: 'Decide', body: 'Ana gives up fewer shirts per jacket, so Ana has the comparative advantage in jackets; Ben in shirts (his shirt costs ⅓ jacket vs. Ana\'s ½).' },
    { title: 'Terms of trade', body: 'Any price between **2 and 3 shirts per jacket** benefits both.' },
  ],
  answer: 'Ana makes jackets, Ben makes shirts; trade at 2–3 shirts per jacket',
})}

Note Ana has the **absolute** advantage in both (she's faster at each), yet both gain by trading.`,
      blocks: [],
      precheck: {
        question: 'Specialization and trade should be based on:',
        choices: ['Comparative advantage', 'Absolute advantage', 'Which country is larger', 'Which good is more expensive'],
        answer: 0,
        explanations: [
          'Correct. Producing where your opportunity cost is lower creates the gains from trade.',
          'Incorrect. A producer can have the absolute advantage in everything yet still gain by specializing.',
          'Incorrect. Size doesn\'t determine opportunity cost.',
          'Incorrect. Money prices aren\'t the basis; opportunity costs are.',
        ],
      },
      checkpoints: [
        {
          question: 'Country X can make 100 tons of rice or 50 computers; Country Y can make 60 tons of rice or 40 computers. Who has the comparative advantage in computers?',
          choices: ['Country Y', 'Country X', 'Both equally', 'Neither'],
          answer: 0,
          explanations: [
            'Correct. One computer costs Y 60 ÷ 40 = 1.5 rice, but costs X 100 ÷ 50 = 2 rice.',
            'Incorrect. X has the absolute advantage in computers, but a higher opportunity cost.',
            'Incorrect. Their opportunity costs differ.',
            'Incorrect. Whoever has the lower opportunity cost has the comparative advantage.',
          ],
        },
        {
          question: 'For X and Y above, which terms of trade benefit both countries?',
          choices: ['1 computer for 1.75 tons of rice', '1 computer for 1 ton of rice', '1 computer for 2.5 tons of rice', '1 computer for 3 tons of rice'],
          answer: 0,
          explanations: [
            'Correct. Mutually beneficial terms lie between 1.5 and 2 tons of rice per computer.',
            'Incorrect. Y would receive less than its 1.5-ton cost of making a computer.',
            'Incorrect. X would pay more than the 2 tons a computer costs it to make.',
            'Incorrect. X would pay well above its own cost.',
          ],
        },
      ],
      revisit:
        'Comparative advantage (lower OC) decides specialization, not absolute advantage. Output tables: OC of A = B ÷ A; input tables: hours ' +
        'for A ÷ hours for B. Terms of trade between the two OCs.',
    },
    {
      id: '1.5',
      ced: 'CBA-1.A–CBA-1.B',
      title: 'Cost-Benefit Analysis',
      minutes: 7,
      summary:
        'Rational agents count opportunity costs, explicit and implicit, as economic costs. Total benefit is utility for consumers and total ' +
        'revenue for firms. The optimal choice maximizes total net benefit (total benefit − total cost). Some decisions can be made at the ' +
        'margin; others need totals.',
      body: String.raw`### Explicit and implicit costs
- **Explicit costs**: actual payments (tuition, rent, wages paid).
- **Implicit costs**: the value of what you give up without paying money (the salary you forgo while in school, the interest your savings could have earned).
- **Economic cost** = explicit + implicit. **Accounting cost** counts explicit only.

### Total benefits and the best choice
Total benefit is **utility** for a consumer and **total revenue** for a firm.
$$\text{Total net benefit} = \text{Total benefit} - \text{Total cost}$$
The optimal choice **maximizes total net benefit**. Some decisions can be broken into increments and decided at the margin (next section); others are all-or-nothing and must be compared in totals.

${steps({
  title: 'Maria passes up a \\$40,000 job to run a business: \\$90,000 revenue, \\$45,000 expenses. Economic profit?',
  steps: [
    { title: 'Explicit costs', body: '\\$45,000 in expenses' },
    { title: 'Implicit cost', body: 'The \\$40,000 salary she gives up' },
    { title: 'Economic profit', body: '\\$90,000 − \\$45,000 − \\$40,000 = **\\$5,000**' },
    { title: 'Compare', body: 'Accounting profit is \\$45,000, but she is only \\$5,000 better off than taking the job.' },
  ],
  answer: '\\$5,000 economic profit',
})}`,
      blocks: [],
      precheck: {
        question: 'Which is an implicit cost of going to college full-time?',
        choices: ['The wages you could have earned working instead', 'Tuition', 'Textbooks', 'Dorm fees'],
        answer: 0,
        explanations: [
          'Correct. Forgone earnings are an opportunity cost with no payment involved.',
          'Incorrect. Tuition is a payment, so it is explicit.',
          'Incorrect. Books are an explicit payment.',
          'Incorrect. Dorm fees are paid, so explicit.',
        ],
      },
      checkpoints: [
        {
          question: 'A firm\'s total revenue is \\$200,000, its explicit costs are \\$150,000, and the owner gave up a \\$60,000 salary elsewhere. Its economic profit is:',
          choices: ['−\\$10,000', '\\$50,000', '\\$110,000', '\\$10,000'],
          answer: 0,
          explanations: [
            'Correct. 200,000 − 150,000 − 60,000 = −10,000: the owner would be better off in the other job.',
            'Incorrect. \\$50,000 is accounting profit; it ignores the implicit cost.',
            'Incorrect. That subtracts only the implicit cost.',
            'Incorrect. Check the sign: costs exceed revenue by \\$10,000.',
          ],
        },
        {
          question: 'A rational decision maker chooses the option that:',
          choices: ['Maximizes total benefit minus total cost', 'Maximizes total benefit', 'Minimizes total cost', 'Has the lowest explicit cost'],
          answer: 0,
          explanations: [
            'Correct. The goal is the largest net benefit.',
            'Incorrect. Maximum benefit could come at an even larger cost.',
            'Incorrect. Doing nothing minimizes cost but gives no benefit.',
            'Incorrect. Implicit costs matter too.',
          ],
        },
      ],
      revisit:
        'Economic cost = explicit + implicit (forgone alternatives). Total benefit = utility (consumers) or revenue (firms). Choose to ' +
        'maximize total net benefit; decide at the margin when choices come in increments.',
    },
    {
      id: '1.6',
      ced: 'CBA-2.A–CBA-2.B',
      title: 'Marginal Analysis and Consumer Choice',
      minutes: 9,
      summary:
        'Consumers maximize total utility under a budget constraint. Marginal utility diminishes, and the best bundle equalizes marginal ' +
        'utility per dollar across goods. In general, do more of an activity while MB > MC and stop where MB = MC; sunk costs don\'t matter.',
      body: String.raw`### Thinking at the margin
Compare the **marginal benefit (MB)** of one more unit with its **marginal cost (MC)**:
- MB > MC → do more. MB < MC → do less. The **optimal quantity** is where **MB = MC** (equivalently, where total net benefit is largest).
- **Sunk costs** (already paid, unrecoverable) and fixed benefits don't affect the optimal choice: they're the same whatever you do next.

### Consumer choice
- Consumers try to **maximize total utility** with limited income.
- **Diminishing marginal utility**: each extra unit adds less satisfaction than the one before.
- **Utility-maximizing rule**: spend so the marginal utility per dollar is equal across goods:
$$\frac{MU_A}{P_A} = \frac{MU_B}{P_B}$$
If $\dfrac{MU_A}{P_A} > \dfrac{MU_B}{P_B}$, buy more A and less B.

${steps({
  title: 'Pizza slices cost \\$2 and tacos \\$1. The next slice adds 10 utils; the next taco adds 8. What should you buy next?',
  steps: [
    { title: 'Per dollar, pizza', body: '$10 \\div 2 = 5$ utils per dollar' },
    { title: 'Per dollar, taco', body: '$8 \\div 1 = 8$ utils per dollar' },
    { title: 'Choose', body: 'The taco gives more satisfaction per dollar, even though its total MU is lower.' },
  ],
  answer: 'Buy the taco (8 utils/$ > 5 utils/$)',
})}

Indifference curves are **not** on the AP exam; the MU-per-dollar rule is.`,
      blocks: [],
      precheck: {
        question: 'You already paid a non-refundable \\$15 for a movie ticket and feel sick before the show. In deciding whether to go, the \\$15 should:',
        choices: ['Be ignored, because it is a sunk cost', 'Push you to go so it isn\'t wasted', 'Be added to the cost of staying home', 'Be compared with the price of popcorn'],
        answer: 0,
        explanations: [
          'Correct. You can\'t get it back either way, so only future benefits and costs matter.',
          'Incorrect. That is the sunk cost fallacy.',
          'Incorrect. Staying home doesn\'t cost the \\$15; it\'s gone either way.',
          'Incorrect. Popcorn is irrelevant to whether going is worth it now.',
        ],
      },
      checkpoints: [
        {
          question: 'For a consumer, $\\frac{MU_{apples}}{P_{apples}} = 6$ and $\\frac{MU_{bananas}}{P_{bananas}} = 3$. To raise total utility with the same budget, she should:',
          choices: ['Buy more apples and fewer bananas', 'Buy more bananas and fewer apples', 'Keep her purchases the same', 'Spend all her money on bananas'],
          answer: 0,
          explanations: [
            'Correct. A dollar moved from bananas to apples adds more utility than it loses; diminishing MU will bring the ratios together.',
            'Incorrect. Bananas give less utility per dollar.',
            'Incorrect. Unequal ratios mean utility isn\'t maximized yet.',
            'Incorrect. That moves in the wrong direction entirely.',
          ],
        },
        {
          question: 'A student studying for a test finds the 4th hour has a marginal benefit of 8 points\' worth of value and a marginal cost of 5; the 5th hour has MB 4 and MC 6. How many hours should she study?',
          choices: ['4 hours', '5 hours', '3 hours', 'As many as possible'],
          answer: 0,
          explanations: [
            'Correct. The 4th hour has MB > MC; the 5th has MB < MC, so she stops after 4.',
            'Incorrect. The 5th hour costs more than it\'s worth.',
            'Incorrect. The 4th hour is still worth it (8 > 5).',
            'Incorrect. Once MC exceeds MB, more study lowers net benefit.',
          ],
        },
        {
          question: 'Why does each additional slice of pizza usually give less satisfaction than the one before?',
          choices: ['Diminishing marginal utility', 'Increasing opportunity cost', 'The law of supply', 'Sunk costs'],
          answer: 0,
          explanations: [
            'Correct. Each extra unit of the same good adds less utility.',
            'Incorrect. That describes production trade-offs on a PPC.',
            'Incorrect. Supply is about sellers.',
            'Incorrect. Sunk costs are past payments.',
          ],
        },
      ],
      revisit:
        'Do more while MB > MC; stop at MB = MC; ignore sunk costs. Diminishing marginal utility. Utility max: equalize MU/P across goods; buy ' +
        'more of the good with the higher MU/P. No indifference curves.',
    },
  ],
};

export default pack;
