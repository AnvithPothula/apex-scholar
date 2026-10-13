/**
 * AP Macroeconomics Unit 1: Basic Economic Concepts — study pack.
 *
 * Written against the AP Macroeconomics CED (effective Fall 2026, topics
 * 1.1–1.6): scarcity, the PPC and opportunity cost, comparative advantage and
 * terms of trade, demand, supply, and market equilibrium. Graph-heavy by
 * design: the exam asks for accurately labeled PPC and supply-and-demand
 * graphs, so the unit leans on the PPC simulation and a supply/demand graph.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);
const graph = (spec) => fence('apex-graph', spec);

const pack = {
  slug: 'ap-macroeconomics/unit-1',
  subject: 'AP Macroeconomics',
  unit: 'Unit 1: Basic Economic Concepts',
  examWeight: '5–10% of the exam',
  intro:
    'Economics starts from one fact: resources are scarce, so every choice gives something up. This unit turns that into the ' +
    'production possibilities curve, shows why countries gain by specializing and trading, and builds the supply-and-demand model ' +
    'you will use for the rest of the course.',
  sections: [
    {
      id: '1.1',
      ced: 'MOD-1.A',
      title: 'Scarcity',
      minutes: 3,
      summary:
        'Most resources are scarce: there aren\'t enough to satisfy every want. So individuals and societies must make choices, and every ' +
        'choice has a cost.',
      body: String.raw`### Unlimited wants, limited resources
**Scarcity** means wants exceed the resources available to satisfy them. It isn't the same as a shortage: even a rich country faces scarcity, because time, labor and materials are finite.

### Economic resources (factors of production)
| Factor | Examples | Payment |
|---|---|---|
| **Land** | Natural resources: soil, oil, water | Rent |
| **Labor** | Human effort | Wages |
| **Capital** | Tools, machines, factories (things made to make other things) | Interest |
| **Entrepreneurship** | Organizing the other three and taking risks | Profit |

Money is **not** capital in economics: capital means physical tools of production.

Because resources are scarce, every society must decide **what** to produce, **how**, and **for whom**.`,
      blocks: [],
      precheck: {
        question: 'Which is an example of capital as a factor of production?',
        choices: ['A delivery truck owned by a bakery', 'The money in a company\'s bank account', 'A worker\'s skills', 'Farmland'],
        answer: 0,
        explanations: [
          'Correct. Capital is a man-made tool used to produce other goods or services.',
          'Incorrect. Money (financial capital) isn\'t a factor of production; it buys factors.',
          'Incorrect. Skills belong to labor (human capital is sometimes discussed, but the factor is labor).',
          'Incorrect. Farmland is land.',
        ],
      },
      checkpoints: [
        {
          question: 'Why does scarcity exist even in very wealthy countries?',
          choices: [
            'Resources are limited while human wants are effectively unlimited',
            'Prices are set too high',
            'Wealthy countries waste most of their resources',
            'Governments restrict production',
          ],
          answer: 0,
          explanations: [
            'Correct. Scarcity is about wants versus resources, so it affects everyone.',
            'Incorrect. Prices are a way of rationing scarce goods, not the cause of scarcity.',
            'Incorrect. Even with zero waste, resources are finite.',
            'Incorrect. Scarcity would exist without any government.',
          ],
        },
        {
          question: 'A chef\'s time spent cooking is an example of which factor of production?',
          choices: ['Labor', 'Capital', 'Land', 'Entrepreneurship'],
          answer: 0,
          explanations: [
            'Correct. Human effort used in production is labor.',
            'Incorrect. Capital is the stove and knives, not the chef\'s work.',
            'Incorrect. Land is natural resources.',
            'Incorrect. Entrepreneurship is organizing a business and bearing its risk.',
          ],
        },
      ],
      revisit: 'Scarcity: limited resources, unlimited wants, so choices. Factors: land, labor, capital (tools, not money), entrepreneurship.',
    },
    {
      id: '1.2',
      ced: 'MOD-1.B',
      title: 'Opportunity Cost and the Production Possibilities Curve',
      minutes: 9,
      summary:
        'The PPC shows the combinations of two goods an economy can make with its resources fully used. Points on it are efficient, ' +
        'inside are inefficient, outside are unattainable. Its shape reflects constant or increasing opportunity cost, and growth shifts it outward.',
      body: String.raw`### Opportunity cost
The **opportunity cost** of a choice is the value of the **next best alternative** given up.

### Reading a PPC
| Point | Meaning |
|---|---|
| **On** the curve | Efficient: all resources fully employed |
| **Inside** | Inefficient: unemployed or underused resources |
| **Outside** | Unattainable with current resources and technology |

- **Bowed out** (concave): **increasing** opportunity cost, because resources aren't equally good at making both goods.
- **Straight line**: **constant** opportunity cost (resources are equally suited to both).
- **Shifts outward** (economic growth): more or better resources, or better technology. **Inward**: losing resources (war, disaster).
- Moving **along** the curve is a trade-off; moving from inside **to** the curve is putting idle resources to work, not growth.

${steps({
  title: 'A country can make 10 cars or 5 trucks (constant cost). What is the opportunity cost of 1 truck?',
  steps: [
    { title: 'Compare the extremes', body: 'Giving up all 10 cars yields 5 trucks.' },
    { title: 'Per truck', body: '$10 \\div 5 = 2$ cars per truck' },
    { title: 'And the other way', body: '1 car costs $5 \\div 10 = 0.5$ truck' },
  ],
  answer: '1 truck costs 2 cars (and 1 car costs ½ truck)',
})}`,
      blocks: [{ type: 'sim', sim: 'ppc-explorer' }],
      precheck: {
        question: 'A point inside a country\'s PPC indicates:',
        choices: ['Unemployed or underused resources', 'Economic growth', 'An unattainable combination', 'The most efficient combination'],
        answer: 0,
        explanations: [
          'Correct. The economy could make more of both goods by using idle resources.',
          'Incorrect. Growth is an outward shift of the whole curve.',
          'Incorrect. Unattainable points lie outside the curve.',
          'Incorrect. Efficient points lie on the curve.',
        ],
      },
      checkpoints: [
        {
          question: 'Why is a typical PPC bowed outward (concave to the origin)?',
          choices: [
            'Resources are not equally suited to producing both goods, so opportunity cost increases',
            'Opportunity cost is constant',
            'The economy is using its resources inefficiently',
            'Technology improves as more of one good is produced',
          ],
          answer: 0,
          explanations: [
            'Correct. As production shifts, less suitable resources are moved, so each extra unit costs more of the other good.',
            'Incorrect. Constant opportunity cost gives a straight-line PPC.',
            'Incorrect. Inefficiency is a point inside the curve, not the curve\'s shape.',
            'Incorrect. Technology changes shift the curve rather than bend it.',
          ],
        },
        {
          question: 'Which event would shift a country\'s PPC outward?',
          choices: [
            'A new technology that raises productivity in both industries',
            'A decrease in unemployment',
            'A natural disaster that destroys factories',
            'A decision to produce more of one good and less of the other',
          ],
          answer: 0,
          explanations: [
            'Correct. Better technology lets the same resources produce more: economic growth.',
            'Incorrect. Lower unemployment moves a point from inside toward the curve; the curve itself doesn\'t move.',
            'Incorrect. Losing capital shifts the PPC inward.',
            'Incorrect. That is a movement along the curve.',
          ],
        },
        {
          question: 'Moving along a straight-line PPC from (20 shirts, 0 hats) to (0 shirts, 40 hats), the opportunity cost of 1 hat is:',
          choices: ['0.5 shirt', '2 shirts', '20 shirts', '40 shirts'],
          answer: 0,
          explanations: [
            'Correct. 20 shirts are given up for 40 hats: 20 ÷ 40 = 0.5 shirt per hat.',
            'Incorrect. That is the cost of 1 shirt in hats.',
            'Incorrect. That is the total given up, not per hat.',
            'Incorrect. That is the total hats gained.',
          ],
        },
      ],
      revisit:
        'On PPC = efficient; inside = idle resources; outside = unattainable. Bowed = increasing opportunity cost; straight = constant. ' +
        'Growth shifts it out. Opportunity cost per unit = amount given up ÷ amount gained.',
    },
    {
      id: '1.3',
      ced: 'MKT-1.A–MKT-1.B',
      title: 'Comparative Advantage and Gains from Trade',
      minutes: 9,
      summary:
        'Absolute advantage: producing more with the same resources. Comparative advantage: producing at a lower opportunity cost. ' +
        'Specializing by comparative advantage and trading at terms between the two opportunity costs lets both sides consume beyond their own PPCs.',
      body: String.raw`### Two kinds of advantage
- **Absolute advantage**: can produce **more** of a good with the same resources.
- **Comparative advantage**: can produce a good at a **lower opportunity cost**.

A country can have the absolute advantage in both goods but never the comparative advantage in both. **Trade follows comparative advantage.**

### Output table method
| | Wheat (tons) | Cloth (bolts) |
|---|---|---|
| **Alpha** (all resources) | 40 | 20 |
| **Beta** (all resources) | 30 | 10 |

${steps({
  title: 'Who has the comparative advantage in each good, and what terms of trade help both?',
  steps: [
    { title: 'Opportunity cost of 1 cloth', body: 'Alpha: 40 ÷ 20 = **2 wheat**. Beta: 30 ÷ 10 = **3 wheat**.' },
    { title: 'Opportunity cost of 1 wheat', body: 'Alpha: 20 ÷ 40 = **½ cloth**. Beta: 10 ÷ 30 = **⅓ cloth**.' },
    { title: 'Comparative advantage', body: 'Alpha in **cloth** (2 < 3 wheat); Beta in **wheat** (⅓ < ½ cloth). Alpha has the absolute advantage in both.' },
    { title: 'Terms of trade', body: 'Any price for 1 cloth **between 2 and 3 wheat** benefits both, e.g. 1 cloth = 2.5 wheat.' },
  ],
  answer: 'Alpha → cloth, Beta → wheat; trade at 2 to 3 wheat per cloth',
})}

Quick rule for **output** tables: opportunity cost of A = (amount of B) ÷ (amount of A). ("Other over.") For **input** tables (hours or workers per unit), it flips.`,
      blocks: [],
      precheck: {
        question: 'Comparative advantage means producing a good:',
        choices: [
          'At a lower opportunity cost than another producer',
          'In greater quantity than another producer',
          'With more advanced technology',
          'At a lower money price',
        ],
        answer: 0,
        explanations: [
          'Correct. Comparative advantage is about opportunity cost.',
          'Incorrect. That is absolute advantage.',
          'Incorrect. Technology may cause an advantage, but the definition is about opportunity cost.',
          'Incorrect. It is defined by what is given up, not by money prices.',
        ],
      },
      checkpoints: [
        {
          question: 'In one day, Sam can make 6 cakes or 3 pies; Jo can make 4 cakes or 4 pies. Who has the comparative advantage in pies?',
          choices: ['Jo, because each pie costs her 1 cake while it costs Sam 2', 'Sam, because he makes more cakes', 'Sam, because he has the absolute advantage', 'Neither, because Jo makes fewer cakes'],
          answer: 0,
          explanations: [
            'Correct. Opportunity cost of 1 pie: Sam 6 ÷ 3 = 2 cakes; Jo 4 ÷ 4 = 1 cake. Jo\'s is lower.',
            'Incorrect. Making more cakes doesn\'t determine who should make pies.',
            'Incorrect. Absolute advantage doesn\'t decide trade; comparative advantage does.',
            'Incorrect. Someone always has the comparative advantage unless costs are equal.',
          ],
        },
        {
          question: 'Using Sam and Jo above, which terms of trade would benefit both?',
          choices: ['1 pie for 1.5 cakes', '1 pie for 0.5 cake', '1 pie for 3 cakes', '1 pie for 2.5 cakes'],
          answer: 0,
          explanations: [
            'Correct. Mutually beneficial terms lie between the two opportunity costs, 1 and 2 cakes per pie.',
            'Incorrect. Jo would get less than the 1 cake a pie costs her to make.',
            'Incorrect. Sam would pay more than the 2 cakes a pie costs him to make himself.',
            'Incorrect. Sam would pay more than his own 2-cake cost.',
          ],
        },
      ],
      revisit:
        'Absolute: more output. Comparative: lower opportunity cost (output table: other ÷ own). Specialize by comparative advantage; ' +
        'terms of trade between the two opportunity costs make both better off.',
    },
    {
      id: '1.4',
      ced: 'MKT-2.A–MKT-2.B',
      title: 'Demand',
      minutes: 7,
      summary:
        'The law of demand: price and quantity demanded move in opposite directions, so the demand curve slopes down. A price change ' +
        'moves along the curve; other factors (income, tastes, prices of related goods, expectations, number of buyers) shift it.',
      body: String.raw`### The law of demand
As price **rises**, quantity demanded **falls** (an **inverse** relationship), so the demand curve slopes **downward**.

### Movement along vs. shift
- A change in the good's **own price** → change in **quantity demanded** (move **along** the curve).
- A change in a **determinant** → change in **demand** (the whole curve **shifts**).

| Determinant | Shifts demand right when… |
|---|---|
| **Income** | Income rises for a **normal** good (falls for an **inferior** good) |
| **Tastes** | The good becomes more popular |
| **Prices of related goods** | The price of a **substitute** rises, or the price of a **complement** falls |
| **Expectations** | Buyers expect the price to rise later |
| **Number of buyers** | More buyers enter the market |

Memory aid: **TRIBE** (Tastes, Related goods, Income, Buyers, Expectations).`,
      blocks: [],
      precheck: {
        question: 'The price of coffee rises. What happens in the market for tea (a substitute)?',
        choices: ['Demand for tea increases', 'Demand for tea decreases', 'Quantity demanded of tea decreases', 'Nothing changes for tea'],
        answer: 0,
        explanations: [
          'Correct. Pricier coffee sends buyers to tea: tea\'s demand curve shifts right.',
          'Incorrect. That would happen if tea were a complement.',
          'Incorrect. Tea\'s own price didn\'t change, so this is a shift, not a movement along the curve.',
          'Incorrect. Substitute prices are a determinant of demand.',
        ],
      },
      checkpoints: [
        {
          question: 'Which causes a movement along the demand curve for pizza rather than a shift?',
          choices: ['A fall in the price of pizza', 'A rise in consumers\' incomes', 'A fall in the price of soda, a complement', 'A news story praising pizza'],
          answer: 0,
          explanations: [
            'Correct. Only the good\'s own price moves you along its demand curve.',
            'Incorrect. Income is a determinant; it shifts the curve.',
            'Incorrect. A complement\'s price shifts demand.',
            'Incorrect. Tastes shift demand.',
          ],
        },
        {
          question: 'When incomes rise, demand for bus rides falls. Bus rides are:',
          choices: ['An inferior good', 'A normal good', 'A complement to income', 'A substitute good'],
          answer: 0,
          explanations: [
            'Correct. Demand falling as income rises is what defines an inferior good.',
            'Incorrect. Demand for a normal good rises with income.',
            'Incorrect. Complements are pairs of goods used together.',
            'Incorrect. "Substitute" describes a relationship between two goods.',
          ],
        },
      ],
      revisit:
        'Law of demand: price ↑, quantity demanded ↓ (downward slope). Own price → movement along. TRIBE determinants shift demand. ' +
        'Normal: income ↑ demand ↑; inferior: income ↑ demand ↓.',
    },
    {
      id: '1.5',
      ced: 'MKT-2.C–MKT-2.D',
      title: 'Supply',
      minutes: 6,
      summary:
        'The law of supply: price and quantity supplied move together, so the supply curve slopes up. Own price moves along it; input ' +
        'prices, technology, taxes and subsidies, expectations, number of sellers and related-good prices shift it.',
      body: String.raw`### The law of supply
As price **rises**, quantity supplied **rises** (a **direct** relationship): higher prices make producing more worthwhile. The supply curve slopes **upward**.

### Determinants of supply
| Determinant | Shifts supply right (increase) when… |
|---|---|
| **Input prices** | Inputs (wages, materials) get **cheaper** |
| **Technology** | Production gets more efficient |
| **Taxes and subsidies** | A per-unit **subsidy** is given (a tax shifts supply left) |
| **Number of sellers** | More firms enter |
| **Expectations** | Sellers expect **lower** prices later (they sell more now) |
| **Prices of other goods** | Another good the firm could make gets **less** profitable |

A change in the good's **own price** is a movement **along** supply (quantity supplied), not a shift.`,
      blocks: [],
      precheck: {
        question: 'Wages for factory workers rise. What happens to the supply of the goods they make?',
        choices: ['Supply decreases (shifts left)', 'Supply increases (shifts right)', 'Quantity supplied increases', 'Demand decreases'],
        answer: 0,
        explanations: [
          'Correct. Higher input costs make each unit costlier to produce.',
          'Incorrect. Cheaper inputs would increase supply.',
          'Incorrect. A change in input costs shifts the whole curve; it isn\'t a movement along it.',
          'Incorrect. Wages paid by producers affect supply, not demand.',
        ],
      },
      checkpoints: [
        {
          question: 'A new robot cuts the cost of making bicycles. On a graph of the bicycle market:',
          choices: ['Supply shifts right', 'Supply shifts left', 'Demand shifts right', 'There is a movement up along the supply curve'],
          answer: 0,
          explanations: [
            'Correct. Better technology increases supply.',
            'Incorrect. Lower costs increase, not decrease, supply.',
            'Incorrect. Production costs affect sellers, not buyers.',
            'Incorrect. Only a change in the bicycles\' price moves along the curve.',
          ],
        },
        {
          question: 'Why does the supply curve slope upward?',
          choices: [
            'Higher prices make it profitable for producers to make more',
            'Consumers buy more at higher prices',
            'Costs fall as output rises',
            'Producers expect prices to drop',
          ],
          answer: 0,
          explanations: [
            'Correct. A higher price covers the higher cost of producing extra units.',
            'Incorrect. That contradicts the law of demand, and it is about buyers.',
            'Incorrect. Rising, not falling, marginal costs are why a higher price is needed.',
            'Incorrect. That is an expectation that shifts supply.',
          ],
        },
      ],
      revisit:
        'Law of supply: price ↑, quantity supplied ↑ (upward slope). Own price → movement along. Input prices, technology, taxes/subsidies, ' +
        'sellers, expectations, other goods\' prices shift supply.',
    },
    {
      id: '1.6',
      ced: 'MKT-2.E–MKT-2.G',
      title: 'Market Equilibrium, Disequilibrium, and Changes in Equilibrium',
      minutes: 9,
      summary:
        'Equilibrium is where quantity demanded equals quantity supplied. Above it there\'s a surplus and the price falls; below it a ' +
        'shortage and the price rises. Shifts in demand or supply create a new equilibrium price and quantity.',
      body: String.raw`### Equilibrium
At the **equilibrium price**, quantity demanded = quantity supplied, and the market clears.

| Price is… | Then… | So the price… |
|---|---|---|
| **Above** equilibrium | $Q_s > Q_d$: **surplus** | falls |
| **Below** equilibrium | $Q_d > Q_s$: **shortage** | rises |

Surplus or shortage size = $|Q_s - Q_d|$ **at that price**.

### Shifts and the new equilibrium
| Change | Price | Quantity |
|---|---|---|
| Demand ↑ | ↑ | ↑ |
| Demand ↓ | ↓ | ↓ |
| Supply ↑ | ↓ | ↑ |
| Supply ↓ | ↑ | ↓ |

**Both curves shift:** one variable is clear and the other is **indeterminate** (it depends on which shift is bigger). Demand ↑ and supply ↑: quantity rises for sure; price is indeterminate.

${graph({
  title: 'Supply and demand: shift the curves',
  x: [0, 12], y: [0, 14],
  xLabel: 'Quantity', yLabel: 'Price ($)',
  curves: [
    { expr: 'd - x', label: 'Demand: P = d − Q' },
    { expr: 'x + s', label: 'Supply: P = Q + s' },
  ],
  params: {
    d: { min: 6, max: 14, value: 10, step: 1, label: 'demand shifter d' },
    s: { min: 0, max: 6, value: 2, step: 1, label: 'supply shifter s' },
  },
})}

The curves cross at $Q^* = \tfrac{d - s}{2}$ and $P^* = \tfrac{d + s}{2}$. With $d = 10$, $s = 2$: $Q^* = 4$, $P^* = 6$. Raise $d$ (demand ↑): both rise. Raise $s$ (supply ↓, the curve moves up): price rises, quantity falls.`,
      blocks: [],
      precheck: {
        question: 'At a price above equilibrium, the market has:',
        choices: ['A surplus, and the price tends to fall', 'A shortage, and the price tends to rise', 'A surplus, and the price tends to rise', 'Equal quantities supplied and demanded'],
        answer: 0,
        explanations: [
          'Correct. Sellers offer more than buyers want, so they cut prices.',
          'Incorrect. Shortages happen below equilibrium.',
          'Incorrect. Unsold goods push the price down, not up.',
          'Incorrect. That only happens at equilibrium.',
        ],
      },
      checkpoints: [
        {
          question: 'At a price of \\$8, quantity demanded is 20 and quantity supplied is 50. What is the market condition?',
          choices: ['A surplus of 30', 'A shortage of 30', 'A surplus of 70', 'Equilibrium'],
          answer: 0,
          explanations: [
            'Correct. Qs − Qd = 50 − 20 = 30 more offered than bought.',
            'Incorrect. A shortage needs Qd > Qs.',
            'Incorrect. Subtract the quantities, don\'t add them.',
            'Incorrect. The quantities differ.',
          ],
        },
        {
          question: 'A frost destroys much of the orange crop while a study makes orange juice more popular. In the orange juice market:',
          choices: [
            'Price rises; the change in quantity is indeterminate',
            'Price falls; quantity rises',
            'Price and quantity both rise',
            'Quantity falls; the change in price is indeterminate',
          ],
          answer: 0,
          explanations: [
            'Correct. Supply ↓ and demand ↑ both push price up; they push quantity in opposite directions.',
            'Incorrect. Both shifts raise the price.',
            'Incorrect. Quantity depends on which shift is larger.',
            'Incorrect. Price is the certain one here.',
          ],
        },
        {
          question: 'Demand is P = 12 − Q and supply is P = Q + 4. What is the equilibrium?',
          choices: ['Q = 4, P = 8', 'Q = 8, P = 4', 'Q = 6, P = 6', 'Q = 16, P = −4'],
          answer: 0,
          explanations: [
            'Correct. 12 − Q = Q + 4 ⇒ Q = 4, and P = 12 − 4 = 8.',
            'Incorrect. That swaps price and quantity.',
            'Incorrect. Check: 12 − 6 = 6 but 6 + 4 = 10, so the curves don\'t meet there.',
            'Incorrect. A negative price isn\'t the solution; set the two prices equal.',
          ],
        },
      ],
      revisit:
        'Equilibrium: Qd = Qs. Above it: surplus, price falls; below: shortage, price rises. D↑: P↑ Q↑. S↑: P↓ Q↑. Two shifts: one variable ' +
        'certain, the other indeterminate.',
    },
  ],
};

export default pack;
