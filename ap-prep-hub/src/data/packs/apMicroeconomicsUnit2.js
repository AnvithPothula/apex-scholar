/**
 * AP Microeconomics Unit 2: Supply and Demand — study pack.
 *
 * Written against the AP Microeconomics CED (effective Fall 2026, topics
 * 2.1–2.9): demand, supply, price elasticity of demand and supply, income and
 * cross-price elasticity, equilibrium with consumer and producer surplus,
 * changes in equilibrium, government intervention (price controls, taxes,
 * subsidies, quantity controls) and international trade. Follows the
 * exclusion statement: quotas are explained by their effect on quantities
 * and prices but never graphed.
 *
 * The market simulation is an Apex component modeled on the surplus,
 * price-ceiling, price-floor and tax-incidence MicroSims in Dan McCreary's
 * "Economics" (CC BY-NC-SA 4.0); see `credits`. Every number was recomputed.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-microeconomics/unit-2',
  subject: 'AP Microeconomics',
  unit: 'Unit 2: Supply and Demand',
  examWeight: '20–25% of the exam',
  intro:
    'Supply and demand is the model the rest of the course is built on. This unit covers what moves each curve, how strongly ' +
    'buyers and sellers respond to price (elasticity), how equilibrium splits the gains between consumers and producers, and ' +
    'what happens when governments step in with price controls, taxes, subsidies and trade policy.',
  license: 'CC BY-NC-SA 4.0',
  credits: [
    {
      title: 'Economics',
      author: 'Dan McCreary',
      url: 'https://dmccreary.github.io/economics-course/',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      note: 'The market simulation is rebuilt from its surplus, price-control and tax-incidence MicroSims.',
    },
  ],
  sections: [
    {
      id: '2.1',
      ced: 'MKT-3.A–3.B',
      title: 'Demand',
      minutes: 5,
      summary:
        'The law of demand: a higher price lowers quantity demanded, a movement along the curve. Anything else that changes what ' +
        'buyers want (income, tastes, related prices, expectations, number of buyers) shifts the whole curve.',
      body: String.raw`### The law of demand
When a good's **own price** rises, **quantity demanded** falls, and when it falls, quantity demanded rises. That's a **movement along** the demand curve, which slopes downward. Three reasons:
- **Substitution effect**: the good is now pricier than its alternatives, so buyers switch.
- **Income effect**: a higher price shrinks what your income can buy.
- **Diminishing marginal utility**: each extra unit adds less satisfaction, so buyers only take more at a lower price. The demand curve is a **marginal benefit** curve.

Markets also need **well-defined property rights**: people only trade what they can own and keep.

### Market demand
Add up every buyer's quantity at each price (a horizontal sum). If at \$4 Ana buys 3 and Ben buys 5, market quantity demanded at \$4 is 8.

### Shifting demand
A change in anything **other than the good's own price** shifts the whole curve. Right = **increase in demand** (more wanted at every price); left = **decrease**.

| Determinant | Shifts demand right when... |
|---|---|
| Tastes | the good becomes more popular |
| Number of buyers | more buyers enter the market |
| Income | income rises (**normal** good) or falls (**inferior** good) |
| Price of a **substitute** | the substitute gets more expensive |
| Price of a **complement** | the complement gets cheaper |
| Expectations | buyers expect the price to rise later |

"Demand" means the whole curve; "quantity demanded" means one point on it. Exam answers lose points for mixing them up.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'The market for coffee: shift or movement?',
            buckets: ['Demand shifts right', 'Demand shifts left', 'Movement along demand'],
            items: [
              { label: 'The price of tea, a substitute, rises', bucket: 0, why: 'A pricier substitute sends buyers to coffee at every price.' },
              { label: 'Consumers\' incomes rise (coffee is a normal good)', bucket: 0, why: 'More income raises demand for a normal good.' },
              { label: 'Buyers expect coffee prices to jump next month', bucket: 0, why: 'Expecting a higher price later raises demand now.' },
              { label: 'A widely reported study links coffee to health problems', bucket: 1, why: 'A change in tastes lowers demand at every price.' },
              { label: 'The price of cream, a complement, rises', bucket: 1, why: 'A pricier complement makes the pair costlier, lowering coffee demand.' },
              { label: 'The price of coffee falls', bucket: 2, why: 'A change in coffee\'s own price changes quantity demanded, not demand.' },
              { label: 'The price of coffee rises', bucket: 2, why: 'Own-price changes move buyers along the existing curve.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'The price of concert tickets rises. According to the law of demand,',
        choices: [
          'quantity demanded falls: a movement along the demand curve',
          'demand decreases: the curve shifts left',
          'demand increases because tickets are now more valuable',
          'supply decreases',
        ],
        answer: 0,
        explanations: [
          'Correct. A change in the good\'s own price moves buyers along the curve.',
          'Incorrect. Only a change in a determinant other than own price shifts the curve.',
          'Incorrect. A higher price lowers the quantity buyers want.',
          'Incorrect. The law of demand is about buyers, and own price doesn\'t shift supply either.',
        ],
      },
      checkpoints: [
        {
          question: 'At a price of \\$4, Ana would buy 3 sandwiches and Ben would buy 5. If they are the only buyers, market quantity demanded at \\$4 is',
          choices: ['8', '4', '15', '2'],
          answer: 0,
          explanations: [
            'Correct. Market demand is the horizontal sum: 3 + 5.',
            'Incorrect. That\'s the average, not the market total.',
            'Incorrect. Quantities are added, not multiplied.',
            'Incorrect. That\'s the difference between them.',
          ],
        },
        {
          question: 'When incomes rise, the demand for used cars falls. Used cars are',
          choices: ['an inferior good', 'a normal good', 'a complement to income', 'a good with elastic supply'],
          answer: 0,
          explanations: [
            'Correct. Demand for an inferior good moves opposite to income.',
            'Incorrect. Demand for a normal good rises with income.',
            'Incorrect. Complements are pairs of goods, not a good and income.',
            'Incorrect. This is about demand responding to income, not supply.',
          ],
        },
      ],
      revisit:
        'Own price → quantity demanded (movement along). Tastes, buyers, income, related prices, expectations → demand shifts. ' +
        'Downward slope: substitution effect, income effect, diminishing marginal utility. Market demand = horizontal sum.',
    },
    {
      id: '2.2',
      ced: 'MKT-3.C–3.D',
      title: 'Supply',
      minutes: 4,
      summary:
        'The law of supply: a higher price raises quantity supplied, a movement along an upward-sloping curve. Input prices, ' +
        'technology, the number of sellers, expectations, taxes and subsidies shift the whole curve.',
      body: String.raw`### The law of supply
When a good's **own price** rises, **quantity supplied** rises: producing more becomes worth the extra cost. That's a **movement along** an upward-sloping supply curve. **Market supply** is the horizontal sum of every seller's supply.

### Shifting supply
| Determinant | Shifts supply right when... |
|---|---|
| Input prices | wages, materials or energy get cheaper |
| Technology | a new method lowers the cost of producing |
| Number of sellers | more firms enter the market |
| Taxes and subsidies | a per-unit tax is cut or a subsidy is added |
| Prices of other goods the firm could make | those goods get cheaper, so making this one pays more |
| Expectations | sellers expect lower prices later, so they sell more now |

A supply **increase** shifts the curve **right** (down: each unit can be offered at a lower price). A **decrease** shifts it **left** (up).`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'The market for pizza: what moves?',
            buckets: ['Shifts demand', 'Shifts supply', 'Movement along a curve'],
            items: [
              { label: 'The price of cheese rises', bucket: 1, why: 'A pricier input raises cost, so supply decreases.' },
              { label: 'A new oven halves baking time', bucket: 1, why: 'Better technology lowers cost, so supply increases.' },
              { label: 'Ten new pizzerias open in town', bucket: 1, why: 'More sellers increase market supply.' },
              { label: 'The city pays pizzerias \\$1 for every pizza sold', bucket: 1, why: 'A per-unit subsidy lowers sellers\' costs, so supply increases.' },
              { label: 'The price of burgers, a substitute, falls', bucket: 0, why: 'A cheaper substitute pulls buyers away, so pizza demand decreases.' },
              { label: 'Students\' incomes rise', bucket: 0, why: 'Income is a demand determinant.' },
              { label: 'The price of pizza rises', bucket: 2, why: 'Own price moves sellers and buyers along their curves.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A new technology lowers the cost of making phones. The supply of phones',
        choices: ['increases: the curve shifts right', 'decreases: the curve shifts left', 'is unchanged, but quantity supplied rises', 'is unchanged, but demand rises'],
        answer: 0,
        explanations: [
          'Correct. Lower costs let sellers offer more at every price.',
          'Incorrect. Lower costs increase supply.',
          'Incorrect. Technology is a supply determinant, so the whole curve shifts.',
          'Incorrect. Production technology affects sellers, not buyers.',
        ],
      },
      checkpoints: [
        {
          question: 'A farmer can grow wheat or corn on the same land. The price of corn rises. The supply of wheat',
          choices: ['decreases', 'increases', 'doesn\'t change; quantity supplied of wheat moves along the curve', 'doesn\'t change; demand for wheat rises'],
          answer: 0,
          explanations: [
            'Correct. Corn now pays more, so farmers shift land away from wheat at every wheat price.',
            'Incorrect. The farmer moves toward corn, not wheat.',
            'Incorrect. Wheat\'s own price didn\'t change; another good\'s price did, so wheat supply shifts.',
            'Incorrect. The price of an alternative product affects sellers, not wheat buyers.',
          ],
        },
        {
          question: 'Which causes a movement along the supply curve for apples rather than a shift?',
          choices: ['A change in the price of apples', 'A change in the price of fertilizer', 'More orchards opening', 'A frost that damages the crop'],
          answer: 0,
          explanations: [
            'Correct. Only the good\'s own price moves along the curve.',
            'Incorrect. Input prices shift supply.',
            'Incorrect. More sellers shift supply.',
            'Incorrect. Weather shocks shift supply.',
          ],
        },
      ],
      revisit:
        'Own price → quantity supplied (movement along, upward slope). Input prices, technology, number of sellers, taxes and ' +
        'subsidies, prices of other goods the firm could make, expectations → supply shifts. Increase = right.',
    },
    {
      id: '2.3',
      ced: 'MKT-3.E',
      title: 'Price Elasticity of Demand',
      minutes: 7,
      summary:
        'Price elasticity of demand measures how strongly quantity demanded responds to price. Above 1 is elastic, below 1 ' +
        'inelastic. It decides whether a price rise raises or lowers total revenue, and it changes along a straight-line demand curve.',
      body: String.raw`### Measuring it

$$E_d = \frac{\%\Delta Q_d}{\%\Delta P}$$

The law of demand makes the result negative; economists compare its **absolute value** with 1.

| Absolute value | Demand is | Meaning |
|---|---|---|
| Greater than 1 | **Elastic** | quantity changes by a bigger percentage than price |
| Less than 1 | **Inelastic** | quantity changes by a smaller percentage than price |
| Equal to 1 | **Unit elastic** | the two percentages are equal |

Extremes: **perfectly inelastic** demand (0) is a vertical curve; **perfectly elastic** demand (infinite) is horizontal.

${steps({
  title: 'A theater raises tickets from \\$10 to \\$11. Sales fall from 1,000 to 950. Elasticity and revenue?',
  steps: [
    { title: 'Percent change in price', body: '(11 − 10) ÷ 10 = +10%' },
    { title: 'Percent change in quantity', body: '(950 − 1,000) ÷ 1,000 = −5%' },
    { title: 'Elasticity', body: '−5% ÷ 10% = −0.5, absolute value 0.5 < 1: inelastic' },
    { title: 'Total revenue', body: 'Before: \\$10 × 1,000 = \\$10,000. After: \\$11 × 950 = \\$10,450' },
  ],
  answer: 'Inelastic (0.5), so the price rise increases revenue by \\$450',
})}

Some textbooks use the **midpoint method** (divide each change by the average of the two values) so the answer is the same in both directions. Use whatever method the question gives you.

### The total revenue test
Total revenue = price × quantity. Which way it moves tells you the elasticity:

| Demand | Price rises → revenue | Price falls → revenue |
|---|---|---|
| Elastic | falls | rises |
| Inelastic | rises | falls |
| Unit elastic | unchanged | unchanged |

### Slope is not elasticity
Along the straight-line demand curve $P = 10 - Q$ the slope never changes, but elasticity does:

| Price | Quantity | Total revenue |
|---|---|---|
| \$8 | 2 | \$16 |
| \$6 | 4 | \$24 |
| \$5 | 5 | \$25 (maximum) |
| \$4 | 6 | \$24 |
| \$2 | 8 | \$16 |

Above the midpoint, cutting price raises revenue, so demand is **elastic**. Below it, cutting price lowers revenue: **inelastic**. At the midpoint demand is **unit elastic** and revenue peaks.

### What makes demand more elastic
- More or closer **substitutes** (one brand of water, not water in general)
- A **luxury** rather than a necessity
- A **large share of the budget**
- **More time** to adjust`,
      blocks: [],
      precheck: {
        question: 'Price rises 10% and quantity demanded falls 20%. Demand is',
        choices: ['elastic', 'inelastic', 'unit elastic', 'perfectly inelastic'],
        answer: 0,
        explanations: [
          'Correct. 20% ÷ 10% = 2, which is greater than 1.',
          'Incorrect. Inelastic would need quantity to change by less than 10%.',
          'Incorrect. Unit elastic would need a 10% quantity change.',
          'Incorrect. Perfectly inelastic means quantity doesn\'t change at all.',
        ],
      },
      checkpoints: [
        {
          question: 'A movie theater raises ticket prices and its total revenue falls. Over this price range, demand for tickets is',
          choices: ['elastic', 'inelastic', 'unit elastic', 'perfectly inelastic'],
          answer: 0,
          explanations: [
            'Correct. Revenue moving opposite to price means the quantity response outweighed the price change.',
            'Incorrect. With inelastic demand, a price rise increases revenue.',
            'Incorrect. Unit elastic demand leaves revenue unchanged.',
            'Incorrect. With perfectly inelastic demand, a price rise would raise revenue.',
          ],
        },
        {
          question: 'Along a straight-line, downward-sloping demand curve,',
          choices: [
            'the slope is constant, but demand is elastic at high prices and inelastic at low prices',
            'elasticity is constant because the slope is constant',
            'demand is inelastic at high prices and elastic at low prices',
            'demand is unit elastic everywhere',
          ],
          answer: 0,
          explanations: [
            'Correct. Elasticity compares percentage changes, and those shift along the line even though the slope doesn\'t.',
            'Incorrect. This is exactly the "slope is not elasticity" mistake.',
            'Incorrect. It\'s the other way round: at high prices a \\$1 change is a small percentage of price but a big percentage of a small quantity.',
            'Incorrect. Only the midpoint is unit elastic.',
          ],
        },
        {
          question: 'Which good probably has the most inelastic demand?',
          choices: ['Insulin for people with diabetes', 'One particular brand of bottled water', 'Restaurant meals', 'Vacation airline tickets'],
          answer: 0,
          explanations: [
            'Correct. It\'s a necessity with no close substitute.',
            'Incorrect. Narrowly defined goods have many close substitutes (other brands).',
            'Incorrect. Cooking at home is a ready substitute.',
            'Incorrect. Vacations are postponable luxuries with substitutes.',
          ],
        },
      ],
      revisit:
        'Elasticity of demand = %ΔQd ÷ %ΔP; compare the absolute value with 1. Total revenue test: elastic → price and revenue move opposite; ' +
        'inelastic → same direction; unit → unchanged. Linear demand: elastic above the midpoint, inelastic below. ' +
        'Substitutes, luxuries, big budget share and time make demand more elastic.',
    },
    {
      id: '2.4',
      ced: 'MKT-3.E',
      title: 'Price Elasticity of Supply',
      minutes: 4,
      summary:
        'Price elasticity of supply measures how strongly quantity supplied responds to price, with the same benchmark of 1. ' +
        'Supply is more elastic when producers have time, spare capacity and inputs they can easily get or switch.',
      body: String.raw`### Measuring it

$$E_s = \frac{\%\Delta Q_s}{\%\Delta P}$$

Supply slopes upward, so the result is positive. Greater than 1 is **elastic**, less than 1 is **inelastic**, equal to 1 is **unit elastic**.

${steps({
  title: 'Tomatoes rise from \\$2.00 to \\$2.20 a pound; growers offer 600 tons instead of 500. Elasticity?',
  steps: [
    { title: 'Percent change in price', body: '0.20 ÷ 2.00 = +10%' },
    { title: 'Percent change in quantity supplied', body: '100 ÷ 500 = +20%' },
    { title: 'Elasticity', body: '20% ÷ 10% = 2' },
  ],
  answer: 'Elasticity of supply = 2: supply is elastic',
})}

### What makes supply more elastic
- **Time**: in the long run firms can build plants and hire, so supply is more elastic than in the short run.
- **Inputs**: if inputs are easy to get, or cheap alternative inputs exist, output can expand quickly.
- **Spare capacity** and goods that can be **stored**.

**Perfectly inelastic** supply is vertical: the seats in a stadium for tonight's game, or paintings by an artist who has died. **Perfectly elastic** supply is horizontal.`,
      blocks: [],
      precheck: {
        question: 'Supply tends to be more elastic',
        choices: [
          'over a longer period of time',
          'when inputs are hard to get',
          'when the good can\'t be stored',
          'for one-of-a-kind items such as original paintings',
        ],
        answer: 0,
        explanations: [
          'Correct. Given time, producers can add capacity and respond more to price.',
          'Incorrect. Scarce inputs make it harder to raise output, so supply is less elastic.',
          'Incorrect. Goods that can\'t be stored can\'t be held back or released, making supply less responsive.',
          'Incorrect. Unique items have perfectly inelastic supply.',
        ],
      },
      checkpoints: [
        {
          question: 'The price of lumber rises 20% and the quantity supplied rises 5%. The price elasticity of supply is',
          choices: ['0.25, inelastic', '4, elastic', '0.25, elastic', '1, unit elastic'],
          answer: 0,
          explanations: [
            'Correct. 5% ÷ 20% = 0.25, which is less than 1.',
            'Incorrect. That divides price change by quantity change; the formula is the other way round.',
            'Incorrect. 0.25 is below 1, so supply is inelastic.',
            'Incorrect. The percentages aren\'t equal.',
          ],
        },
        {
          question: 'A stadium has exactly 50,000 seats for tonight\'s game. The supply of seats is',
          choices: ['perfectly inelastic (vertical)', 'perfectly elastic (horizontal)', 'unit elastic', 'elastic, because ticket prices can change'],
          answer: 0,
          explanations: [
            'Correct. The quantity can\'t respond to price at all.',
            'Incorrect. Perfectly elastic supply means any quantity at one price.',
            'Incorrect. Quantity doesn\'t change, so elasticity is 0, not 1.',
            'Incorrect. Elasticity measures the quantity response, and quantity is fixed.',
          ],
        },
      ],
      revisit:
        'Elasticity of supply = %ΔQs ÷ %ΔP (positive). More elastic with more time, available or substitutable inputs, spare capacity, storable ' +
        'goods. Fixed quantity → perfectly inelastic (vertical).',
    },
    {
      id: '2.5',
      ced: 'MKT-3.E',
      title: 'Other Elasticities',
      minutes: 5,
      summary:
        'Income elasticity tells you whether a good is normal (positive) or inferior (negative). Cross-price elasticity tells you ' +
        'whether two goods are substitutes (positive), complements (negative) or unrelated (zero).',
      body: String.raw`### Income elasticity of demand

$$E_I = \frac{\%\Delta Q_d}{\%\Delta \text{income}}$$

- **Positive** → **normal good** (buy more as income rises).
- **Negative** → **inferior good** (buy less as income rises: instant noodles, bus rides for some buyers).

### Cross-price elasticity of demand

$$E_{xy} = \frac{\%\Delta Q_d \text{ of } X}{\%\Delta P \text{ of } Y}$$

- **Positive** → **substitutes**: Y gets pricier, so people buy more X.
- **Negative** → **complements**: Y gets pricier, so people buy less X.
- **Zero** → **unrelated**.

${steps({
  title: 'Coffee rises 20% in price and tea purchases rise 10%. Cross-price elasticity?',
  steps: [
    { title: 'Divide', body: '+10% ÷ +20% = +0.5' },
    { title: 'Read the sign', body: 'Positive: when coffee gets pricier, people buy more tea' },
  ],
  answer: 'E = +0.5: coffee and tea are substitutes',
})}

The **sign** answers "what kind of good?"; the **size** says how strong the link is. Always check which good's quantity is on top.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Classify by the sign of the elasticity',
            buckets: ['Normal good', 'Inferior good', 'Substitutes', 'Complements'],
            items: [
              { label: 'Income elasticity of restaurant meals = 1.5', bucket: 0, why: 'Positive income elasticity means a normal good.' },
              { label: 'Incomes rise 5%; new cars bought rise 4%', bucket: 0, why: '+4% ÷ +5% = +0.8, positive: normal.' },
              { label: 'Incomes rise 10%; ramen noodle purchases fall 6%', bucket: 1, why: '−6% ÷ +10% = −0.6, negative: inferior.' },
              { label: 'Income elasticity of bus rides = −0.4', bucket: 1, why: 'Negative income elasticity means an inferior good.' },
              { label: 'Butter rises 10% in price; margarine bought rises 8%', bucket: 2, why: '+8% ÷ +10% = +0.8, positive cross-price: substitutes.' },
              { label: 'Cross-price elasticity of Coke with respect to Pepsi = +0.7', bucket: 2, why: 'Positive cross-price elasticity means substitutes.' },
              { label: 'Printers rise 20% in price; ink cartridges bought fall 15%', bucket: 3, why: '−15% ÷ +20% = −0.75, negative: complements.' },
              { label: 'Cross-price elasticity of hot dog buns with respect to hot dogs = −0.6', bucket: 3, why: 'Negative cross-price elasticity means complements.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'The income elasticity of demand for a good is −0.8. The good is',
        choices: ['inferior', 'normal', 'a complement', 'normal, because 0.8 is less than 1'],
        answer: 0,
        explanations: [
          'Correct. A negative income elasticity means buyers want less as income rises.',
          'Incorrect. Normal goods have positive income elasticity.',
          'Incorrect. Complements are identified by cross-price elasticity, not income elasticity.',
          'Incorrect. For income elasticity the sign matters, and this one is negative.',
        ],
      },
      checkpoints: [
        {
          question: 'Gasoline rises 25% in price and the quantity of large SUVs demanded falls 10%. The cross-price elasticity, and the relationship, is',
          choices: ['−0.4: complements', '+0.4: substitutes', '−2.5: complements', '−0.4: SUVs are inferior'],
          answer: 0,
          explanations: [
            'Correct. −10% ÷ +25% = −0.4, and a negative cross-price elasticity means complements.',
            'Incorrect. The quantity fell while the other price rose, so the sign is negative.',
            'Incorrect. That divides the price change by the quantity change.',
            'Incorrect. Inferior goods are defined by income elasticity, not cross-price elasticity.',
          ],
        },
        {
          question: 'Incomes rise 4% and the quantity of organic produce demanded rises 10%. The income elasticity is',
          choices: ['2.5: a normal good', '0.4: a normal good', '2.5: an inferior good', '−2.5: an inferior good'],
          answer: 0,
          explanations: [
            'Correct. +10% ÷ +4% = +2.5, positive: normal.',
            'Incorrect. That divides income change by quantity change.',
            'Incorrect. A positive income elasticity means normal, not inferior.',
            'Incorrect. Both changes are increases, so the sign is positive.',
          ],
        },
      ],
      revisit:
        'Income elasticity: + normal, − inferior. Cross-price: + substitutes, − complements, 0 unrelated. Quantity change goes on top.',
    },
    {
      id: '2.6',
      ced: 'MKT-4.A',
      title: 'Market Equilibrium and Consumer and Producer Surplus',
      minutes: 6,
      summary:
        'Equilibrium is where quantity demanded equals quantity supplied. Consumer surplus is the area under demand and above the ' +
        'price; producer surplus is the area above supply and below the price. With no market failure, equilibrium maximizes their sum.',
      body: String.raw`### Equilibrium
The market **clears** at the price where **quantity demanded = quantity supplied**: buyers want exactly what sellers offer, with no shortage or surplus. The equilibrium price is a signal that guides where resources go.

### Surplus
- **Consumer surplus (CS)**: the most a buyer was willing to pay minus what they paid. On a graph, the area **below demand and above the price**.
- **Producer surplus (PS)**: the price received minus the lowest price the seller would have accepted. The area **above supply and below the price**.
- **Total surplus** = CS + PS. A competitive market with no market failure reaches the **largest possible total surplus**: it is **efficient**.

With straight-line curves both areas are triangles:

$$\text{area} = \tfrac{1}{2} \times \text{base} \times \text{height}$$

${steps({
  title: 'Demand: P = 100 − Q. Supply: P = 10 + Q. Find equilibrium, CS and PS.',
  steps: [
    { title: 'Set demand price = supply price', body: '100 − Q = 10 + Q, so 2Q = 90 and Q = 45' },
    { title: 'Equilibrium price', body: 'P = 100 − 45 = \\$55' },
    { title: 'Consumer surplus', body: 'Triangle from the demand intercept (\\$100) down to \\$55: ½ × 45 × 45 = \\$1,012.50' },
    { title: 'Producer surplus', body: 'Triangle from \\$55 down to the supply intercept (\\$10): ½ × 45 × 45 = \\$1,012.50' },
  ],
  answer: 'P = \\$55, Q = 45, CS = PS = \\$1,012.50, total surplus \\$2,025',
})}

The simulation starts with exactly this market. Shift the curves and change their steepness to see how the two triangles change.`,
      blocks: [{ type: 'sim', sim: 'market-lab' }],
      precheck: {
        question: 'Consumer surplus is',
        choices: [
          'the difference between what buyers are willing to pay and what they actually pay',
          'the difference between the price and the seller\'s cost',
          'total spending by consumers',
          'the quantity bought at equilibrium',
        ],
        answer: 0,
        explanations: [
          'Correct. It\'s the gain buyers get from trading at the market price.',
          'Incorrect. That describes producer surplus.',
          'Incorrect. Spending is price × quantity, which is sellers\' revenue.',
          'Incorrect. Surplus is measured in dollars of benefit, not units.',
        ],
      },
      checkpoints: [
        {
          question: 'Jordan would pay up to \\$30 for a hoodie and buys it for \\$18. Jordan\'s consumer surplus is',
          choices: ['\\$12', '\\$48', '\\$18', '\\$30'],
          answer: 0,
          explanations: [
            'Correct. \\$30 willing to pay − \\$18 paid = \\$12.',
            'Incorrect. Surplus is the difference, not the sum.',
            'Incorrect. That\'s the price paid.',
            'Incorrect. That\'s the maximum willingness to pay.',
          ],
        },
        {
          question: 'Demand meets the price axis at \\$20. Equilibrium is P = \\$12, Q = 40. Consumer surplus is',
          choices: ['\\$160', '\\$320', '\\$240', '\\$480'],
          answer: 0,
          explanations: [
            'Correct. ½ × 40 × (\\$20 − \\$12) = \\$160.',
            'Incorrect. That forgets the ½ for a triangle.',
            'Incorrect. The height is \\$20 − \\$12, not the price \\$12.',
            'Incorrect. That\'s total spending, 40 × \\$12.',
          ],
        },
        {
          question: 'In a competitive market with no market failures, total surplus at equilibrium is',
          choices: ['as large as possible', 'as small as possible', 'zero, because buyers and sellers gain equally', 'equal to consumer surplus'],
          answer: 0,
          explanations: [
            'Correct. Every trade worth more to the buyer than it costs the seller happens, and no others.',
            'Incorrect. Equilibrium maximizes, not minimizes, total surplus.',
            'Incorrect. Both sides gain, so the total is positive.',
            'Incorrect. Total surplus includes producer surplus too.',
          ],
        },
      ],
      revisit:
        'Equilibrium: Qd = Qs, market clears. CS = area under demand above price; PS = area above supply below price. ' +
        'Triangle area = ½ × base × height. Competitive equilibrium maximizes total surplus (efficient).',
    },
    {
      id: '2.7',
      ced: 'MKT-4.B',
      title: 'Market Disequilibrium and Changes in Equilibrium',
      minutes: 6,
      summary:
        'A price below equilibrium creates a shortage and a price above it creates a surplus; market forces push price back. ' +
        'Shifts in demand or supply move the equilibrium, and when both shift, either price or quantity is indeterminate.',
      body: String.raw`### Disequilibrium
- **Shortage** (price below equilibrium): quantity demanded > quantity supplied. Buyers bid the price **up**.
- **Surplus** (price above equilibrium): quantity supplied > quantity demanded. Sellers cut the price **down**.

At \$8, if buyers want 120 and sellers offer 80, there's a shortage of 40 and the price will rise.

### One curve shifts
| Change | Price | Quantity |
|---|---|---|
| Demand increases | rises | rises |
| Demand decreases | falls | falls |
| Supply increases | falls | rises |
| Supply decreases | rises | falls |

Each shift also changes CS, PS and total surplus. How much price versus quantity moves depends on elasticity: if supply falls and demand is **inelastic**, price jumps a lot and quantity barely moves.

${steps({
  title: 'In the 2.6 market (P = 100 − Q, P = 10 + Q), demand rises to P = 120 − Q. What changes?',
  steps: [
    { title: 'New equilibrium', body: '120 − Q = 10 + Q, so Q = 55 and P = \\$65' },
    { title: 'Changes', body: 'Price \\$55 → \\$65; quantity 45 → 55' },
    { title: 'New surplus', body: 'CS = ½ × 55 × (120 − 65) = \\$1,512.50; PS = ½ × 55 × (65 − 10) = \\$1,512.50' },
  ],
  answer: 'P and Q both rise by 10; CS and PS each rise by \\$500',
})}

### Both curves shift
You can sign only one of price and quantity; the other depends on which shift is bigger.

| Shifts | Certain | Indeterminate |
|---|---|---|
| Demand ↑, supply ↑ | quantity rises | price |
| Demand ↓, supply ↓ | quantity falls | price |
| Demand ↑, supply ↓ | price rises | quantity |
| Demand ↓, supply ↑ | price falls | quantity |

Try it in the 2.6 simulation: move both shift sliders at once.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Two shifts at once: what can\'t you predict?',
            buckets: ['Price is indeterminate', 'Quantity is indeterminate'],
            items: [
              { label: 'Incomes rise (normal good) and a new technology cuts production costs', bucket: 0, why: 'Demand up and supply up both raise quantity, but push price in opposite directions.' },
              { label: 'A health scare cuts demand while a drought cuts supply', bucket: 0, why: 'Both shifts lower quantity; price depends on which is bigger.' },
              { label: 'The population grows while input prices rise', bucket: 1, why: 'Demand up and supply down both raise price; quantity is pulled both ways.' },
              { label: 'A substitute gets cheaper while new firms enter the market', bucket: 1, why: 'Demand down and supply up both lower price; quantity is pulled both ways.' },
              { label: 'Buyers and sellers both expect higher prices next month', bucket: 1, why: 'Buyers buy now (demand up) and sellers hold back (supply down): price rises, quantity is unclear.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'At a price below equilibrium there is',
        choices: ['a shortage, and the price tends to rise', 'a surplus, and the price tends to fall', 'a shortage, and the price tends to fall', 'a surplus, and the price tends to rise'],
        answer: 0,
        explanations: [
          'Correct. Buyers want more than sellers offer, so competition among buyers raises the price.',
          'Incorrect. A surplus happens above equilibrium.',
          'Incorrect. A shortage pushes the price up, not down.',
          'Incorrect. Below equilibrium is a shortage, not a surplus.',
        ],
      },
      checkpoints: [
        {
          question: 'Demand for tacos decreases while the supply of tacos increases. What happens to equilibrium?',
          choices: [
            'Price falls; quantity is indeterminate',
            'Price rises; quantity is indeterminate',
            'Price falls and quantity rises',
            'Both price and quantity are indeterminate',
          ],
          answer: 0,
          explanations: [
            'Correct. Both shifts lower price; demand pulls quantity down while supply pushes it up.',
            'Incorrect. Both shifts push the price down.',
            'Incorrect. Quantity rises only if the supply shift is bigger, which we don\'t know.',
            'Incorrect. Price is certain here: both shifts lower it.',
          ],
        },
        {
          question: 'Supply decreases. The equilibrium price rises the most when demand is',
          choices: ['inelastic', 'elastic', 'perfectly elastic', 'unit elastic'],
          answer: 0,
          explanations: [
            'Correct. Buyers barely cut back, so the price has to rise a lot to clear the market.',
            'Incorrect. Elastic demand absorbs the shift mostly through quantity.',
            'Incorrect. With perfectly elastic demand the price can\'t change at all.',
            'Incorrect. Unit elastic demand is in between; inelastic demand gives a bigger price rise.',
          ],
        },
        {
          question: 'At a price of \\$8, quantity demanded is 120 and quantity supplied is 80. The market has',
          choices: ['a shortage of 40, so the price will rise', 'a surplus of 40, so the price will fall', 'a shortage of 200', 'equilibrium, because both quantities are positive'],
          answer: 0,
          explanations: [
            'Correct. 120 − 80 = 40 more wanted than offered.',
            'Incorrect. A surplus would need quantity supplied above quantity demanded.',
            'Incorrect. A shortage is the difference, not the sum.',
            'Incorrect. Equilibrium needs the two quantities to be equal.',
          ],
        },
      ],
      revisit:
        'Below equilibrium → shortage → price rises; above → surplus → price falls. D↑: P↑ Q↑; S↑: P↓ Q↑. Two shifts: same ' +
        'direction → price indeterminate; opposite directions → quantity indeterminate. Inelastic demand → bigger price swings.',
    },
    {
      id: '2.8',
      ced: 'POL-1.A',
      title: 'The Effects of Government Intervention in Markets',
      minutes: 8,
      summary:
        'Binding price ceilings cause shortages and binding price floors cause surpluses. Taxes and subsidies shift supply or ' +
        'demand. Every one of these, applied to an efficient market, creates deadweight loss. Tax incidence falls more on the less elastic side.',
      body: String.raw`### Price controls
- **Price ceiling** (a legal maximum, such as rent control): binds only if set **below** equilibrium. Quantity traded falls to quantity supplied, leaving a **shortage**.
- **Price floor** (a legal minimum, such as a minimum wage or a crop price support): binds only if set **above** equilibrium. Quantity traded falls to quantity demanded, leaving a **surplus**.
- A ceiling set above equilibrium, or a floor set below it, does nothing.
- **Quantity controls** (a cap on how many units can be sold) also shrink trade below equilibrium.

### Taxes and subsidies
- A **per-unit tax** on sellers shifts supply **up by the tax**. Buyers pay more, sellers keep less, quantity falls. **Tax revenue = tax × new quantity**.
- A **per-unit subsidy** shifts supply **down by the subsidy**. Buyers pay less, sellers receive more, quantity rises above the efficient level. **Government cost = subsidy × new quantity**.

### Deadweight loss
In a market that was already efficient, any of these interventions can only **reduce** total surplus. The lost surplus is **deadweight loss (DWL)**: trades worth more to buyers than they cost sellers that no longer happen (or, with a subsidy, trades that cost more than they're worth).

$$\text{DWL} = \tfrac{1}{2} \times \text{tax} \times \text{drop in quantity}$$

### Who really pays a tax (incidence)
The legal target doesn't matter. The side that is **less elastic** (less able to walk away) bears **more** of the tax. Cigarette buyers have very inelastic demand, so most of a cigarette tax shows up in the price they pay.

${steps({
  title: 'Demand: P = 100 − Q. Supply: P = 10 + Q. A \\$20 per-unit tax is placed on sellers.',
  steps: [
    { title: 'Shift supply up by \\$20', body: 'P = 30 + Q. Set 100 − Q = 30 + Q, so Q = 35' },
    { title: 'Prices', body: 'Buyers pay 100 − 35 = \\$65; sellers keep \\$65 − \\$20 = \\$45 (was \\$55)' },
    { title: 'Incidence', body: 'Buyers pay \\$10 more and sellers keep \\$10 less: each side bears half' },
    { title: 'Revenue', body: '\\$20 × 35 = \\$700' },
    { title: 'Deadweight loss', body: '½ × \\$20 × (45 − 35) = \\$100' },
  ],
  answer: 'Q falls to 35; revenue \\$700; DWL \\$100',
})}

${steps({
  title: 'Same market, with a \\$10 per-unit subsidy to sellers instead.',
  steps: [
    { title: 'Shift supply down by \\$10', body: 'P = Q. Set 100 − Q = Q, so Q = 50' },
    { title: 'Prices', body: 'Buyers pay \\$50; sellers receive \\$50 + \\$10 = \\$60' },
    { title: 'Government cost', body: '\\$10 × 50 = \\$500' },
    { title: 'Deadweight loss', body: '½ × \\$10 × (50 − 45) = \\$25: five units cost more to make than buyers value them' },
  ],
  answer: 'Q rises to 50; cost \\$500; DWL \\$25',
})}

In the simulation, pick a policy and drag its slider. Make demand steeper (less elastic) with a tax on and watch buyers' share of the tax rise.`,
      blocks: [{ type: 'sim', sim: 'market-lab' }],
      precheck: {
        question: 'A price ceiling set below the equilibrium price causes',
        choices: ['a shortage', 'a surplus', 'no change', 'an increase in quantity supplied'],
        answer: 0,
        explanations: [
          'Correct. At the lower legal price, buyers want more and sellers offer less.',
          'Incorrect. Surpluses come from binding floors.',
          'Incorrect. A ceiling below equilibrium binds.',
          'Incorrect. A lower price reduces quantity supplied.',
        ],
      },
      checkpoints: [
        {
          question: 'A minimum wage is set above the equilibrium wage in a labor market. The result is',
          choices: [
            'a surplus of labor (unemployment)',
            'a shortage of labor',
            'no change, because wages are already at equilibrium',
            'an increase in the quantity of labor demanded',
          ],
          answer: 0,
          explanations: [
            'Correct. A binding floor makes quantity supplied (workers) exceed quantity demanded (jobs).',
            'Incorrect. Shortages come from prices held below equilibrium.',
            'Incorrect. A floor above equilibrium binds.',
            'Incorrect. A higher wage lowers the quantity of labor firms demand.',
          ],
        },
        {
          question: 'A per-unit tax is placed on cigarettes. Demand is very inelastic and supply is relatively elastic. Who bears most of the tax?',
          choices: ['Buyers', 'Sellers', 'Buyers and sellers split it equally', 'Whoever the law says must pay it'],
          answer: 0,
          explanations: [
            'Correct. The less elastic side bears more, and here that\'s buyers.',
            'Incorrect. Sellers bear more only when supply is the less elastic side.',
            'Incorrect. An equal split needs equal elasticities.',
            'Incorrect. Incidence depends on elasticities, not on who writes the check.',
          ],
        },
        {
          question: 'A \\$3 per-unit tax lowers the quantity traded from 100 to 80. Tax revenue and deadweight loss are',
          choices: ['\\$240 and \\$30', '\\$300 and \\$30', '\\$240 and \\$60', '\\$300 and \\$60'],
          answer: 0,
          explanations: [
            'Correct. Revenue = \\$3 × 80 = \\$240; DWL = ½ × \\$3 × 20 = \\$30.',
            'Incorrect. Revenue uses the quantity after the tax, 80, not 100.',
            'Incorrect. The DWL triangle needs the ½.',
            'Incorrect. Both mistakes: the old quantity and no ½.',
          ],
        },
        {
          question: 'A price ceiling is set above the equilibrium price. What happens?',
          choices: ['Nothing: the ceiling doesn\'t bind', 'A shortage', 'A surplus', 'Deadweight loss'],
          answer: 0,
          explanations: [
            'Correct. The market price is already below the legal maximum.',
            'Incorrect. Shortages need the ceiling below equilibrium.',
            'Incorrect. A ceiling never forces the price up to create a surplus.',
            'Incorrect. A non-binding ceiling leaves the efficient outcome alone.',
          ],
        },
      ],
      revisit:
        'Binding ceiling (below eq.) → shortage; binding floor (above eq.) → surplus. Tax shifts supply up by the tax: ' +
        'revenue = tax × new quantity; DWL = ½ × t × ΔQ. Subsidy shifts supply down, overproduction DWL, cost = s × Q. Less elastic side bears more of a tax.',
    },
    {
      id: '2.9',
      ced: 'POL-1.B',
      title: 'International Trade and Public Policy',
      minutes: 6,
      summary:
        'Opening to trade moves the domestic price to the world price. Importers gain consumer surplus and lose producer ' +
        'surplus, with a net gain. Tariffs and quotas raise the domestic price, shrink imports and cut total surplus.',
      body: String.raw`### Autarky versus trade
Under **autarky** (no trade), price is set by domestic supply and demand. With free trade, the domestic price moves to the **world price**, and trade fills the gap between domestic quantity demanded and supplied.
- **World price below** the autarky price: the country **imports** (quantity demanded − quantity supplied). **CS rises, PS falls, total surplus rises.**
- **World price above** the autarky price: the country **exports** (quantity supplied − quantity demanded). **PS rises, CS falls, total surplus rises.**

### Tariffs
A **tariff** is a tax on imports. It raises the domestic price to world price + tariff. Domestic producers sell more, consumers buy less, imports shrink, and the government collects **tariff revenue = tariff × imports**. Consumer surplus and total surplus fall; the deadweight loss is two triangles (too much costly domestic production and too little consumption).

${steps({
  title: 'Domestic demand P = 100 − Q, supply P = 10 + Q, world price \\$25. Then a \\$10 tariff is added.',
  steps: [
    { title: 'Free trade at \\$25', body: 'Qd = 75, Qs = 15, so imports = 60 (autarky would be P = \\$55, Q = 45)' },
    { title: 'Tariff raises the price to \\$35', body: 'Qd = 65, Qs = 25, so imports = 40' },
    { title: 'Tariff revenue', body: '\\$10 × 40 = \\$400' },
    { title: 'Deadweight loss', body: '½ × \\$10 × (25 − 15) + ½ × \\$10 × (75 − 65) = \\$50 + \\$50 = \\$100' },
  ],
  answer: 'Imports fall from 60 to 40; revenue \\$400; DWL \\$100',
})}

### Quotas
An **import quota** caps the quantity that can be imported. With fewer imports the domestic price rises, domestic producers sell more, consumers buy less, and consumer surplus and total surplus fall. Unlike a tariff, the government collects **no revenue** unless it sells import licenses; the gain from the higher price goes to whoever holds the right to import. (You won't be asked to graph quotas, but you should know how they change quantities.)`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'A tariff on imported steel: who gains, who loses?',
            buckets: ['Gains', 'Loses'],
            items: [
              { label: 'Domestic steel producers', bucket: 0, why: 'They sell more at a higher price, so producer surplus rises.' },
              { label: 'Workers at domestic steel mills', bucket: 0, why: 'More domestic output means more steel jobs.' },
              { label: 'The government', bucket: 0, why: 'It collects tariff × imports in revenue.' },
              { label: 'Domestic carmakers that buy steel', bucket: 1, why: 'Their input costs rise.' },
              { label: 'Foreign steel exporters', bucket: 1, why: 'They sell fewer units into the market.' },
              { label: 'Society as a whole', bucket: 1, why: 'Consumers lose more than producers and the government gain: deadweight loss.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A country opens to trade and the world price is below its autarky price. The country',
        choices: [
          'imports, and consumer surplus rises while producer surplus falls',
          'exports, and producer surplus rises',
          'imports, and producer surplus rises',
          'doesn\'t trade, because domestic firms can\'t compete',
        ],
        answer: 0,
        explanations: [
          'Correct. The lower price lets consumers buy more and squeezes domestic producers.',
          'Incorrect. Exports happen when the world price is above the domestic price.',
          'Incorrect. Domestic producers sell less at the lower price.',
          'Incorrect. A lower world price means imports fill the gap.',
        ],
      },
      checkpoints: [
        {
          question: 'At a world price of \\$25, a country buys 75 units and produces 15. A \\$10 tariff raises the price to \\$35, where it buys 65 and produces 25. Imports and tariff revenue after the tariff are',
          choices: ['40 units and \\$400', '40 units and \\$600', '60 units and \\$600', '25 units and \\$250'],
          answer: 0,
          explanations: [
            'Correct. Imports = 65 − 25 = 40; revenue = \\$10 × 40.',
            'Incorrect. Revenue uses imports after the tariff (40), not before (60).',
            'Incorrect. 60 was the import level before the tariff.',
            'Incorrect. 25 is domestic production, not imports.',
          ],
        },
        {
          question: 'Unlike a tariff, an import quota',
          choices: [
            'raises no government revenue unless import licenses are sold',
            'leaves the domestic price unchanged',
            'increases imports',
            'increases consumer surplus',
          ],
          answer: 0,
          explanations: [
            'Correct. The gain from the higher price goes to whoever holds the right to import.',
            'Incorrect. Limiting imports raises the domestic price.',
            'Incorrect. A quota caps imports.',
            'Incorrect. A higher price lowers consumer surplus.',
          ],
        },
        {
          question: 'When an importing country moves from autarky to free trade, total surplus',
          choices: [
            'rises, because consumers gain more than producers lose',
            'falls, because domestic producers lose',
            'is unchanged, because one group\'s gain is another\'s loss',
            'rises, because producer surplus rises',
          ],
          answer: 0,
          explanations: [
            'Correct. Part of the consumer gain is a transfer from producers, and the rest is new surplus.',
            'Incorrect. Producers lose, but consumers gain more.',
            'Incorrect. The extra trade creates new surplus, so it isn\'t a pure transfer.',
            'Incorrect. In an importing country, producer surplus falls.',
          ],
        },
      ],
      revisit:
        'World price below autarky → imports, CS↑ PS↓ total↑; above → exports, PS↑ CS↓ total↑. Tariff: price = world + tariff, ' +
        'imports↓, revenue = tariff × imports, two DWL triangles. Quota: caps imports, price↑, no revenue unless licenses are sold; not graphed.',
    },
  ],
};

export default pack;
