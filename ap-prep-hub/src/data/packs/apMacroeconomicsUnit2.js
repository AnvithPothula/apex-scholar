/**
 * AP Macroeconomics Unit 2: Economic Indicators and the Business Cycle —
 * study pack.
 *
 * Written against the AP Macroeconomics CED (effective Fall 2026, topics
 * 2.1–2.7, enduring understandings MEA-1 and MEA-2). Follows its scope:
 * GDP by the circular flow and three approaches, limitations of GDP, the
 * unemployment rate and labor force participation rate, the three types of
 * unemployment and the natural rate, CPI and inflation (the PPI is excluded),
 * costs of unexpected inflation, real vs. nominal GDP and the deflator, and
 * the phases and turning points of the business cycle. All economies and
 * numbers are invented for practice and were recomputed.
 *
 * The textbook map marks Dan McCreary's Economics chapters 7–9 as strong
 * matches; they cover the same topics, but nothing here is adapted from them,
 * so no credit is given. The labor-market simulation is an Apex component.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-macroeconomics/unit-2',
  subject: 'AP Macroeconomics',
  unit: 'Unit 2: Economic Indicators and the Business Cycle',
  examWeight: '12–17% of the exam',
  intro:
    'How is the economy doing? Economists answer with three numbers: GDP, the unemployment rate and the inflation rate. This ' +
    'unit is about how each is measured, what each misses, why real and nominal values differ, and how output rises and falls ' +
    'through the business cycle.',
  sections: [
    {
      id: '2.1',
      ced: 'MEA-1.A',
      title: 'The Circular Flow and GDP',
      minutes: 9,
      summary:
        'GDP measures the market value of all final goods and services produced in a country in a year. The circular flow shows ' +
        'that spending by one sector is income for another, so GDP can be measured by expenditures, by income, or by adding up ' +
        'value added at each stage of production.',
      body: String.raw`### The circular flow
Households sell resources (labor, land, capital) to firms in **factor markets** and earn income. They spend that income buying goods and services from firms in **product markets**. Because every dollar spent is a dollar of someone's income, total spending = total income = total output.

### What counts in GDP
**Gross domestic product** is the market value of all **final** goods and services produced **within a country** in a given year.
- **Final** goods only: counting the flour and the bread would count the flour twice.
- Not counted: used goods (produced earlier), purely financial transactions (stocks, bonds), and **transfer payments** (Social Security, unemployment benefits), which buy no new output.

### Three ways to measure it
1. **Expenditures approach**:

$$\text{GDP} = C + I + G + X_n$$

consumption + gross private investment (new capital, new homes, inventory changes) + government purchases + net exports (exports − imports).

2. **Income approach**: add wages, rent, interest and profit earned producing the output.
3. **Value-added approach**: add the value each firm adds at each stage.

${steps({
  title: 'C = \\$700B, I = \\$150B, G = \\$200B, exports \\$100B, imports \\$120B. Find nominal GDP.',
  steps: [
    { title: 'Net exports', body: '\\$100B − \\$120B = −\\$20B' },
    { title: 'Add the components', body: '\\$700B + \\$150B + \\$200B − \\$20B = \\$1,030B' },
  ],
  answer: 'GDP = \\$1,030 billion',
})}

${steps({
  title: 'Wheat sells for \\$100, the flour made from it for \\$150, the bread for \\$250. What counts in GDP?',
  steps: [
    { title: 'Value added at each stage', body: '\\$100 + (\\$150 − \\$100) + (\\$250 − \\$150) = \\$100 + \\$50 + \\$100' },
    { title: 'Compare with the final good', body: 'Total value added = \\$250 = the price of the final bread' },
  ],
  answer: '\\$250, not \\$500',
})}`,
      blocks: [],
      precheck: {
        question: 'Which is counted in this year\'s GDP?',
        choices: [
          'A new car produced and sold this year',
          'A used car bought from a neighbor',
          'Shares of stock bought on the stock market',
          'A Social Security check paid to a retiree',
        ],
        answer: 0,
        explanations: [
          'Correct. It is a final good produced this year.',
          'Incorrect. The car was counted in the year it was produced.',
          'Incorrect. Buying stock is a financial transaction, not production.',
          'Incorrect. Transfer payments aren\'t purchases of new output.',
        ],
      },
      checkpoints: [
        {
          question: 'C = \\$500B, I = \\$100B, G = \\$150B, exports = \\$60B and imports = \\$80B. What is GDP?',
          choices: ['\\$730B', '\\$890B', '\\$750B', '\\$770B'],
          answer: 0,
          explanations: [
            'Correct. 500 + 100 + 150 + (60 − 80) = 730.',
            'Incorrect. That adds imports instead of subtracting them.',
            'Incorrect. That leaves out net exports.',
            'Incorrect. That adds the net exports as +20 instead of −20.',
          ],
        },
        {
          question: 'Why does GDP count only final goods and services?',
          choices: [
            'To avoid counting intermediate goods more than once',
            'Because intermediate goods have no market value',
            'Because final goods are always produced domestically',
            'To exclude government purchases',
          ],
          answer: 0,
          explanations: [
            'Correct. The value of intermediate goods is already in the price of the final good.',
            'Incorrect. Intermediate goods are sold at market prices too.',
            'Incorrect. Where a good is made is a separate question.',
            'Incorrect. Government purchases are part of GDP.',
          ],
        },
      ],
      revisit:
        'GDP = market value of final goods and services produced within a country in a year. Circular flow: spending = income. ' +
        'GDP = C + I + G + Xn; also income and value-added approaches. Excludes used goods, financial transactions, transfers.',
    },
    {
      id: '2.2',
      ced: 'MEA-1.B',
      title: 'Limitations of GDP',
      minutes: 4,
      summary:
        'GDP is a useful measure of economic performance, but it leaves out nonmarket transactions and says little about ' +
        'well-being, how income is shared, leisure or the environment.',
      body: String.raw`### What GDP misses
- **Nonmarket transactions**: work done without a market price, like a parent cooking at home, volunteering or fixing your own car. Hire a cook and GDP rises, even though the same meals get made.
- **The underground economy**: unreported cash work and illegal activity.
- **Leisure**: working longer hours raises GDP even if people are worse off.
- **Distribution**: GDP per person says nothing about how income is shared.
- **Quality and variety**: a phone that costs the same but does far more isn't fully captured.
- **Environmental costs**: pollution and resource depletion aren't subtracted. Cleaning up a disaster even adds to GDP.

### On the exam
Questions often describe a change and ask how measured GDP responds. If a service moves from the household into the market (paid child care replacing a parent at home), measured GDP rises even if total production of care barely changes.`,
      blocks: [],
      precheck: {
        question: 'Which activity is NOT included in GDP?',
        choices: [
          'A parent cooking dinner for their family at home',
          'A restaurant selling a dinner',
          'A government building a new highway',
          'A firm buying new machinery',
        ],
        answer: 0,
        explanations: [
          'Correct. Household production is a nonmarket transaction.',
          'Incorrect. A restaurant meal is a market sale of a final service.',
          'Incorrect. That is a government purchase.',
          'Incorrect. That is investment.',
        ],
      },
      checkpoints: [
        {
          question: 'A family that used to clean its own home hires a cleaning service. What happens to measured GDP?',
          choices: [
            'It rises, because a nonmarket activity became a market transaction',
            'It stays the same, because the same cleaning is done',
            'It falls, because the family spends less time working',
            'It falls, because services aren\'t counted in GDP',
          ],
          answer: 0,
          explanations: [
            'Correct. Only the paid service shows up in GDP.',
            'Incorrect. The work was invisible to GDP before and is counted now.',
            'Incorrect. The family\'s own time was never in GDP.',
            'Incorrect. Services are a large part of GDP.',
          ],
        },
        {
          question: 'Which is the strongest reason GDP per person may overstate how well off a country\'s typical resident is?',
          choices: [
            'Income may be concentrated among a small share of the population',
            'GDP counts too many nonmarket transactions',
            'GDP includes transfer payments',
            'GDP ignores investment spending',
          ],
          answer: 0,
          explanations: [
            'Correct. An average says nothing about distribution.',
            'Incorrect. GDP leaves nonmarket transactions out.',
            'Incorrect. Transfer payments aren\'t in GDP.',
            'Incorrect. Investment is one of GDP\'s components.',
          ],
        },
      ],
      revisit:
        'GDP misses nonmarket transactions (household work, volunteering), the underground economy, leisure, distribution, quality ' +
        'and environmental costs. Moving work into the market raises measured GDP.',
    },
    {
      id: '2.3',
      ced: 'MEA-1.C–E',
      title: 'Unemployment',
      minutes: 11,
      summary:
        'The unemployment rate is the share of the labor force out of work; the labor force participation rate is the share of ' +
        'adults in the labor force. The rate understates joblessness because it leaves out discouraged and underemployed workers. ' +
        'Unemployment is frictional, structural or cyclical; the natural rate is frictional plus structural.',
      body: String.raw`### Who counts
UR is the unemployment rate and LFPR the labor force participation rate.
- **Labor force** = employed + unemployed. You're **unemployed** only if you don't have a job and are **actively looking**.
- People not working and not looking (retirees, full-time students, discouraged workers) are **not in the labor force**.

$$\text{UR} = \frac{\text{unemployed}}{\text{labor force}} \times 100$$

$$\text{LFPR} = \frac{\text{labor force}}{\text{adults}} \times 100$$

${steps({
  title: 'Adult population 200M, employed 120M, unemployed 8M. Find both rates.',
  steps: [
    { title: 'Labor force', body: '120M + 8M = 128M' },
    { title: 'Unemployment rate', body: '8 ÷ 128 = 0.0625, so 6.25%' },
    { title: 'Participation rate', body: '128 ÷ 200 = 0.64, so 64%' },
  ],
  answer: 'Unemployment 6.25%, participation 64%',
})}

### Limitations
The measured rate **understates** joblessness:
- **Discouraged workers**, who want work but stopped looking, drop out of the labor force, so the rate *falls* even though nobody found a job.
- **Part-time workers** who want full-time jobs count as employed (underemployment).

Try it in the simulation.

### Three types of unemployment
| Type | Cause | Example |
|---|---|---|
| **Frictional** | Time spent searching between jobs | A graduate interviewing for a first job |
| **Structural** | Skills or location don't match available jobs | A factory worker replaced by automation |
| **Cyclical** | A downturn in the business cycle | Layoffs during a recession |

- **Natural rate** = frictional + structural. It's the rate when the economy produces **full-employment output**.
- **Cyclical** unemployment = actual rate − natural rate (it can be negative in a boom).
- The natural rate can **change over time** as the labor force changes (demographics, skills, job-search technology).`,
      blocks: [
        { type: 'sim', sim: 'labor-market' },
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which type of unemployment?',
            buckets: ['Frictional', 'Structural', 'Cyclical'],
            items: [
              { label: 'A nurse quits to move closer to family and is searching for a new hospital job', bucket: 0, why: 'Searching between jobs is frictional.' },
              { label: 'A new college graduate is interviewing for a first job', bucket: 0, why: 'Entering the labor force and searching is frictional.' },
              { label: 'Coal miners lose jobs as power plants switch to natural gas, and lack skills for other work', bucket: 1, why: 'A lasting mismatch between skills and jobs is structural.' },
              { label: 'Travel agents replaced by booking websites', bucket: 1, why: 'Technology changed which skills are needed.' },
              { label: 'Construction workers laid off when a recession cuts home building', bucket: 2, why: 'Job losses from a downturn are cyclical.' },
              { label: 'Retail workers laid off as spending falls across the whole economy', bucket: 2, why: 'Falling aggregate spending causes cyclical unemployment.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'An adult who wants a job but has stopped looking is classified as',
        choices: ['not in the labor force', 'unemployed', 'employed', 'cyclically unemployed'],
        answer: 0,
        explanations: [
          'Correct. Discouraged workers aren\'t actively looking, so they leave the labor force.',
          'Incorrect. Unemployed people must be actively looking for work.',
          'Incorrect. They don\'t have a job.',
          'Incorrect. They aren\'t counted as unemployed at all.',
        ],
      },
      checkpoints: [
        {
          question: 'An economy has 150M adults, 95M employed and 5M unemployed. What is the unemployment rate?',
          choices: ['5%', '5.26%', '3.33%', '66.7%'],
          answer: 0,
          explanations: [
            'Correct. The labor force is 100M, and 5 ÷ 100 = 5%.',
            'Incorrect. That divides by the employed (95M) instead of the labor force.',
            'Incorrect. That divides by the adult population instead of the labor force.',
            'Incorrect. That is the participation rate.',
          ],
        },
        {
          question: 'The actual unemployment rate is 7% and the natural rate is 4.5%. What is the cyclical unemployment rate?',
          choices: ['2.5%', '4.5%', '11.5%', '7%'],
          answer: 0,
          explanations: [
            'Correct. Cyclical = actual − natural = 7 − 4.5.',
            'Incorrect. That is the natural rate (frictional + structural).',
            'Incorrect. The rates are subtracted, not added.',
            'Incorrect. That is the total measured rate.',
          ],
        },
      ],
      revisit:
        'Labor force = employed + unemployed (actively looking). UR = unemployed ÷ labor force; LFPR = labor force ÷ adults. ' +
        'Understates joblessness (discouraged, part-time). Frictional, structural, cyclical; natural = frictional + structural; cyclical = actual − natural.',
    },
    {
      id: '2.4',
      ced: 'MEA-1.F–G',
      title: 'Price Indices and Inflation',
      minutes: 9,
      summary:
        'The CPI compares the cost of a fixed basket of goods with its cost in a base year. The inflation rate is the percentage ' +
        'change in a price index. Real values remove the effect of prices. The CPI tends to overstate inflation, partly because ' +
        'of substitution bias.',
      body: String.raw`### The consumer price index
$$\text{CPI} = \frac{\text{basket cost now}}{\text{base-year cost}} \times 100$$

The base year's CPI is always 100. The CPI measures how much more income a consumer would need to keep the same standard of living at the new prices.

### Inflation and its relatives
- **Inflation rate**: the percentage change in a price index (the CPI or the GDP deflator) from the old value to the new one:

$$\text{inflation} = \frac{\text{new} - \text{old}}{\text{old}} \times 100$$

- **Deflation**: the price level falls (negative inflation).
- **Disinflation**: inflation slows but stays positive (from 6% to 3%).

### Real values
A **real** variable is a nominal one deflated by the price level. Real wage = nominal wage ÷ (price index ÷ 100).

${steps({
  title: 'A basket cost \\$200 in the base year and \\$220 now; a wage is \\$22 an hour. Find the CPI and real wage.',
  steps: [
    { title: 'CPI', body: '\\$220 ÷ \\$200 × 100 = 110' },
    { title: 'Real wage in base-year dollars', body: '\\$22 ÷ 1.10 = \\$20 an hour' },
    { title: 'If next year\'s CPI is 115.5', body: 'Inflation = (115.5 − 110) ÷ 110 × 100 = 5%' },
  ],
  answer: 'CPI = 110; real wage = \\$20 an hour; inflation next year 5%',
})}

### Why the CPI overstates inflation
- **Substitution bias**: the basket is fixed, so it misses consumers switching to cheaper substitutes when prices rise.
- **Quality changes**: higher prices sometimes buy better products.
- **New goods** enter the basket late.

(The producer price index exists but calculating it is beyond the scope of the course.)`,
      blocks: [],
      precheck: {
        question: 'The CPI rises from 120 to 126. What is the inflation rate?',
        choices: ['5%', '6%', '4.8%', '26%'],
        answer: 0,
        explanations: [
          'Correct. (126 − 120) ÷ 120 × 100 = 5%.',
          'Incorrect. That is the point change, not the percentage change.',
          'Incorrect. That divides by the new index instead of the old one.',
          'Incorrect. That compares with a base of 100, not with last year.',
        ],
      },
      checkpoints: [
        {
          question: 'Inflation falls from 5% to 2%. This is an example of',
          choices: ['disinflation', 'deflation', 'hyperinflation', 'stagflation'],
          answer: 0,
          explanations: [
            'Correct. Prices still rise, just more slowly.',
            'Incorrect. Deflation means prices fall.',
            'Incorrect. Hyperinflation is extremely rapid inflation.',
            'Incorrect. Stagflation combines inflation with high unemployment.',
          ],
        },
        {
          question: 'Why does a fixed-basket CPI tend to overstate the rise in the cost of living?',
          choices: [
            'It ignores consumers switching to cheaper substitutes',
            'It includes too many services',
            'It leaves out food and energy',
            'It counts used goods',
          ],
          answer: 0,
          explanations: [
            'Correct. That is substitution bias.',
            'Incorrect. Services are part of what consumers buy.',
            'Incorrect. The CPI includes food and energy.',
            'Incorrect. That isn\'t the source of the bias.',
          ],
        },
      ],
      revisit:
        'CPI = basket cost now ÷ base-year cost × 100. Inflation = % change in a price index. Deflation = falling prices; ' +
        'disinflation = slower inflation. Real = nominal ÷ (index ÷ 100). CPI overstates (substitution, quality, new goods).',
    },
    {
      id: '2.5',
      ced: 'MEA-1.H',
      title: 'Costs of Inflation',
      minutes: 6,
      summary:
        'Unexpected inflation redistributes wealth arbitrarily. Borrowers repay loans with dollars worth less than expected, so ' +
        'they gain and lenders lose. People on fixed incomes and savers also lose. Unexpected deflation does the reverse.',
      body: String.raw`### Who wins and who loses from unexpected inflation
| Hurt | Helped |
|---|---|
| **Lenders**: repaid in dollars worth less | **Borrowers**: repay with cheaper dollars |
| **Savers** whose interest doesn't keep up | People with fixed-rate debts such as mortgages |
| People on **fixed incomes** (fixed pensions, fixed wages) | |

**Unexpected deflation** reverses this: lenders gain and borrowers lose.

### Why "unexpected" matters
When inflation is **expected**, lenders build it into the nominal interest rate. A useful link (the Fisher relationship):

$$\text{real rate} \approx \text{nominal rate} - \text{inflation}$$

${steps({
  title: 'A bank lends at 6% expecting 2% inflation. Inflation turns out to be 5%. Who gains?',
  steps: [
    { title: 'Expected real rate', body: '6% − 2% = 4%' },
    { title: 'Actual real rate', body: '6% − 5% = 1%' },
    { title: 'Conclusion', body: 'The bank earns far less in real terms than planned; the borrower pays less. The borrower gains.' },
  ],
  answer: 'The borrower gains; the lender loses',
})}

### Other costs of inflation
- **Menu costs**: businesses must keep changing prices.
- **Shoe-leather costs**: time and effort spent minimizing cash holdings.
- **Uncertainty** that makes long-term planning harder.`,
      blocks: [],
      precheck: {
        question: 'Inflation turns out much higher than expected. Who is most likely to gain?',
        choices: [
          'A homeowner with a fixed-rate mortgage',
          'A bank that made fixed-rate loans',
          'A retiree with a fixed pension',
          'A saver with a fixed-interest savings account',
        ],
        answer: 0,
        explanations: [
          'Correct. The borrower repays with dollars worth less than expected.',
          'Incorrect. Lenders are repaid in cheaper dollars, so they lose.',
          'Incorrect. A fixed pension buys less as prices rise.',
          'Incorrect. The fixed interest falls behind inflation.',
        ],
      },
      checkpoints: [
        {
          question: 'A loan carries a 7% nominal interest rate and inflation is 3%. What is the approximate real interest rate?',
          choices: ['4%', '10%', '2.3%', '21%'],
          answer: 0,
          explanations: [
            'Correct. Real ≈ nominal − inflation = 7 − 3.',
            'Incorrect. That adds the rates.',
            'Incorrect. That divides instead of subtracting.',
            'Incorrect. That multiplies the rates.',
          ],
        },
        {
          question: 'Prices fall unexpectedly by 3% this year. Who is hurt?',
          choices: ['Borrowers', 'Lenders', 'People on fixed incomes', 'Savers'],
          answer: 0,
          explanations: [
            'Correct. Borrowers must repay with dollars worth more than they expected.',
            'Incorrect. Lenders gain from unexpected deflation.',
            'Incorrect. Fixed incomes buy more when prices fall.',
            'Incorrect. Savers\' money buys more.',
          ],
        },
      ],
      revisit:
        'Unexpected inflation: lenders, savers and fixed-income earners lose; borrowers gain. Unexpected deflation reverses it. ' +
        'Real rate ≈ nominal − inflation. Also menu costs, shoe-leather costs, uncertainty.',
    },
    {
      id: '2.6',
      ced: 'MEA-1.I–J',
      title: 'Real vs. Nominal GDP',
      minutes: 8,
      summary:
        'Nominal GDP values output at current prices and measures spending; real GDP uses constant base-year prices and measures ' +
        'production. The GDP deflator converts one to the other.',
      body: String.raw`### The difference
- **Nominal GDP** uses **current** prices. It rises if prices rise, even if output doesn't.
- **Real GDP** uses **constant** (base-year) prices, removing the effect of the price level. It measures how much is actually produced.

### The GDP deflator
$$\text{GDP deflator} = \frac{\text{nominal GDP}}{\text{real GDP}} \times 100$$

so real GDP = nominal GDP ÷ (deflator ÷ 100). In the base year the deflator is 100.

${steps({
  title: '2024: 100 pizzas at \\$12, 50 books at \\$25. Base-year (2020) prices \\$10 and \\$20. Find nominal, real GDP, deflator.',
  steps: [
    { title: 'Nominal GDP (2024 prices)', body: '100 × \\$12 + 50 × \\$25 = \\$1,200 + \\$1,250 = \\$2,450' },
    { title: 'Real GDP (2020 prices)', body: '100 × \\$10 + 50 × \\$20 = \\$1,000 + \\$1,000 = \\$2,000' },
    { title: 'Deflator', body: '\\$2,450 ÷ \\$2,000 × 100 = 122.5' },
  ],
  answer: 'Nominal \\$2,450; real \\$2,000; deflator 122.5',
})}

Weighting output by fixed base-year prices can overstate real growth, so statistical agencies actually use other methods (chain weighting). You still need the base-year method for the exam.`,
      blocks: [],
      precheck: {
        question: 'Nominal GDP rose 6% while the price level rose 4%. About how much did real GDP change?',
        choices: ['Rose about 2%', 'Rose about 10%', 'Rose about 6%', 'Fell about 2%'],
        answer: 0,
        explanations: [
          'Correct. Real growth ≈ nominal growth − inflation.',
          'Incorrect. That adds inflation to nominal growth.',
          'Incorrect. That ignores the price increase.',
          'Incorrect. Nominal growth outpaced inflation, so output rose.',
        ],
      },
      checkpoints: [
        {
          question: 'Nominal GDP is \\$12 trillion and the GDP deflator is 120. What is real GDP?',
          choices: ['\\$10 trillion', '\\$14.4 trillion', '\\$12 trillion', '\\$1.2 trillion'],
          answer: 0,
          explanations: [
            'Correct. 12 ÷ (120 ÷ 100) = 10.',
            'Incorrect. That multiplies by 1.2 instead of dividing.',
            'Incorrect. That ignores the deflator.',
            'Incorrect. That divides by 10 instead of by 1.2.',
          ],
        },
        {
          question: 'Which statement about real GDP is correct?',
          choices: [
            'It measures output using constant prices, so it reflects how much is produced',
            'It always exceeds nominal GDP',
            'It measures total spending at current prices',
            'It includes the effect of inflation',
          ],
          answer: 0,
          explanations: [
            'Correct. Constant prices remove changes in the price level.',
            'Incorrect. Real GDP is below nominal GDP whenever prices are above base-year levels.',
            'Incorrect. That describes nominal GDP.',
            'Incorrect. Real GDP removes the effect of inflation.',
          ],
        },
      ],
      revisit:
        'Nominal GDP = current prices (spending); real GDP = base-year prices (production). Deflator = nominal ÷ real × 100; ' +
        'real = nominal ÷ (deflator ÷ 100). Real growth ≈ nominal growth − inflation.',
    },
    {
      id: '2.7',
      ced: 'MEA-2.A',
      title: 'Business Cycles',
      minutes: 7,
      summary:
        'Business cycles are fluctuations in output and employment caused by changes in aggregate demand or aggregate supply. ' +
        'The phases are expansion and recession; the turning points are peak and trough. The output gap is actual output minus ' +
        'potential (full-employment) output.',
      body: String.raw`### Phases and turning points
- **Expansion**: real GDP rises and unemployment falls.
- **Peak**: the high point, where expansion turns to recession.
- **Recession**: real GDP falls and unemployment rises.
- **Trough**: the low point, where recession turns to recovery.

Over the long run, the trend of real GDP rises: that is **economic growth**.

### Potential output and the output gap
- **Potential output** (full-employment output) is the real GDP produced when unemployment equals the **natural rate**.
- **Output gap** = actual output − potential output.
  - **Negative (recessionary) gap**: actual below potential; cyclical unemployment is positive.
  - **Positive (inflationary) gap**: actual above potential; unemployment is below the natural rate and inflation pressure builds.

Business cycles come from changes in **aggregate demand** or **aggregate supply**, the model you'll build in Unit 3.

${graph({
  title: 'Real GDP fluctuating around potential output',
  x: [0, 20], y: [90, 150], xLabel: 'years', yLabel: 'real GDP',
  curves: [
    { expr: '100 + 2 * x', label: 'potential output' },
    { expr: '100 + 2 * x + A * sin(2 * pi * x / P)', label: 'actual real GDP' },
  ],
  params: {
    A: { min: 0, max: 8, value: 5, step: 0.5, label: 'size of swings' },
    P: { min: 4, max: 12, value: 8, step: 1, label: 'years per cycle' },
  },
})}

Where the actual line is above the potential line, the output gap is positive; below, it is negative. Each top is a peak and each bottom a trough. (Real cycles are irregular; this smooth one is for reading the parts.)`,
      blocks: [],
      precheck: {
        question: 'The turning point at which a recession ends and an expansion begins is the',
        choices: ['trough', 'peak', 'output gap', 'natural rate'],
        answer: 0,
        explanations: [
          'Correct. The trough is the low point of the cycle.',
          'Incorrect. The peak is where an expansion ends.',
          'Incorrect. The output gap is a difference, not a turning point.',
          'Incorrect. The natural rate is a rate of unemployment.',
        ],
      },
      checkpoints: [
        {
          question: 'Real GDP is \\$18 trillion and potential output is \\$19 trillion. Which describes the economy?',
          choices: [
            'A negative output gap, with unemployment above the natural rate',
            'A positive output gap, with unemployment below the natural rate',
            'Full employment with no output gap',
            'A peak in the business cycle',
          ],
          answer: 0,
          explanations: [
            'Correct. Output is below potential, so there is cyclical unemployment.',
            'Incorrect. A positive gap needs actual output above potential.',
            'Incorrect. Output is \\$1 trillion below potential.',
            'Incorrect. Output below potential describes a downturn, not a peak.',
          ],
        },
        {
          question: 'Potential output is the level of real GDP at which',
          choices: [
            'unemployment equals the natural rate',
            'unemployment is zero',
            'inflation is zero',
            'nominal GDP equals real GDP',
          ],
          answer: 0,
          explanations: [
            'Correct. Full-employment output still has frictional and structural unemployment.',
            'Incorrect. Some unemployment always exists.',
            'Incorrect. Potential output is defined by employment, not by inflation.',
            'Incorrect. That only happens in the base year.',
          ],
        },
      ],
      revisit:
        'Phases: expansion, recession; turning points: peak, trough. Potential (full-employment) output is where unemployment = ' +
        'natural rate. Output gap = actual − potential: negative = recessionary, positive = inflationary.',
    },
  ],
};

export default pack;
