/**
 * AP Business with Personal Finance Unit 1: Businesses, Competition, and New
 * Ideas — study pack.
 *
 * Written against the AP Business with Personal Finance CED effective Fall
 * 2026 (the course's first edition; topics 1.1–1.8). Follows the CED's
 * exclusion: no supply-and-demand graphing. Activities: a PESTEL sort and a
 * business-organization sort.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-business-with-personal-finance/unit-1',
  subject: 'AP Business with Personal Finance',
  unit: 'Unit 1: Businesses, Competition, and New Ideas',
  examWeight: '20–30% of the exam',
  intro:
    'What a business is and how it creates and captures value, how markets and competition work, the PESTEL forces that make a ' +
    'business viable or not, where new ideas come from and how entrepreneurs test them, vision and ethics, how businesses are ' +
    'organized, and how supply chains get products to customers.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A–B',
      title: 'What Is a Business?',
      minutes: 5,
      summary:
        'A business produces and distributes goods and/or services, at any size, in person or online. Customers buy; consumers use. ' +
        'Businesses find customer problems, needs and wants (market opportunities) and build products for them, choosing which ' +
        'customers to serve. Value creation means solving those problems; value capture means charging more than the product cost to make.',
      body: String.raw`### Key terms
- A **business** is an organization that **produces and distributes products** (goods and/or services). It can be any size, by reach, employees or revenue, and serve customers face to face or online.
- A **customer** buys a good or service; a **consumer** uses it, whether or not they bought it. (A parent buying cereal is the customer; the child eating it is a consumer.)
- **Market opportunities** are customer **problems, needs and wants**. Building a product that addresses one achieves **problem-solution fit**.
- No business can satisfy everyone: it must **choose** which problems to solve and which customers to serve.

### Value creation vs. value capture
| | Meaning | Example: a bike-repair shop |
|---|---|---|
| **Value** | The worth or benefit of a product to customers | A working bike again |
| **Value creation** | Providing a product that responds to customers' problems, needs and wants | Fixing flats quickly so riders can commute |
| **Value capture** | Charging customers a **higher price than it cost to produce** | Charging \$25 for a repair that costs \$9 in parts and labor |

A business can create value without capturing it (a free app nobody pays for), and it can't survive long that way.`,
      blocks: [],
      precheck: {
        question: 'A grandparent buys a video game as a gift for a grandchild who plays it. Who is the consumer?',
        choices: ['The grandchild', 'The grandparent', 'The game store', 'The game developer'],
        answer: 0,
        explanations: [
          'Correct. The consumer uses the product, whether or not they bought it.',
          'Incorrect. The grandparent is the customer (the buyer).',
          'Incorrect. The store is a seller.',
          'Incorrect. The developer is the producer.',
        ],
      },
      checkpoints: [
        {
          question: 'A bakery sells cakes for \\$30 that cost \\$12 to make. This difference is an example of:',
          choices: ['Value capture', 'Value creation', 'A market opportunity', 'Problem-solution fit'],
          answer: 0,
          explanations: [
            'Correct. Charging more than the cost to produce is value capture.',
            'Incorrect. Value creation is solving the customer\'s problem; this is about price vs. cost.',
            'Incorrect. A market opportunity is a customer problem, need or want.',
            'Incorrect. That is when a product addresses a customer problem.',
          ],
        },
        {
          question: 'Why must a business choose which customers to serve?',
          choices: [
            'No business can satisfy all potential customers\' problems, needs and wants',
            'Laws require businesses to serve only one type of customer',
            'Customers and consumers are always the same people',
            'Value capture is impossible otherwise',
          ],
          answer: 0,
          explanations: [
            'Correct. Resources are limited, so businesses focus.',
            'Incorrect. No such law exists.',
            'Incorrect. They are often different people.',
            'Incorrect. Focus is about meeting needs well, not a rule about capture.',
          ],
        },
      ],
      revisit:
        'Business = produces and distributes goods/services. Customer buys; consumer uses. Market opportunity = problem, need, want; ' +
        'problem-solution fit. Value creation = solving the problem; value capture = price above cost.',
    },
    {
      id: '1.2',
      ced: '1.2.A–B',
      title: 'Markets and Competitive Advantage',
      minutes: 7,
      summary:
        'A market is any space where sellers and buyers interact. Voluntary exchange earns revenue for sellers and value for buyers; ' +
        'sellers push prices up, buyers push them down, and competition settles on a market price. Competitive advantage is outperforming ' +
        'rivals, through low prices, differentiation or barriers to entry. A monopoly has no competition.',
      body: String.raw`### Markets
A **market** is any physical or virtual space where **sellers** (businesses) and **buyers** (customers) interact: local, regional or global.
- **Voluntary exchange** generates **revenue** for sellers and **value** for buyers.
- Sellers want **higher prices** (profit); buyers want **lower prices** (savings). In a competitive market, that tug-of-war tends to set a **prevailing market price**.

(Supply and demand graphs aren't tested in this course; they're in AP Economics.)

### Competitive advantage
**Competitive advantage** = the ability to **outperform rivals** in the same market, gaining **market share** and potentially profit. How competitive a market is depends on the number of rivals, how **differentiated** products are, and whether rivals can offer the same thing cheaper.

| Market | Strategy for competitive advantage |
|---|---|
| **Commodities** (wheat, oil): nearly identical products | Produce as **efficiently** as possible to charge the **lowest price** |
| **Differentiated products** (phones, restaurants) | Show customers why yours is **better**: quality, unique features, service, lower prices or better marketing |
| Any competitive market | Build **barriers to entry**: patents and other intellectual property, regulations that limit rivals, control of suppliers, high startup costs, low prices from large scale |
| **Monopoly**: one business, unique product, no competition | Protect the position by **maintaining barriers to entry** |`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Market', back: 'Any physical or virtual space where sellers and buyers interact.' },
            { front: 'Competitive advantage', back: 'The ability to outperform rivals in the same market, increasing market share and potentially profit.' },
            { front: 'Differentiated product', back: 'A product with distinguishing features that set it apart from rivals\'.' },
            { front: 'Barriers to entry', back: 'Obstacles that make it hard for new firms to compete: patents, regulations, supplier control, high startup costs, low prices from scale.' },
            { front: 'Monopoly', back: 'A market with one business producing a unique product and no competition.' },
          ],
        },
      ],
      precheck: {
        question: 'A corn farmer sells a product almost identical to every other farmer\'s. The most likely path to competitive advantage is:',
        choices: [
          'Producing as efficiently as possible to charge the lowest price',
          'Adding unique features to the corn',
          'Becoming a monopoly overnight',
          'Raising prices above every rival',
        ],
        answer: 0,
        explanations: [
          'Correct. In commodity markets, efficiency and low prices win.',
          'Incorrect. Commodities are hard to differentiate.',
          'Incorrect. A highly competitive market has many sellers.',
          'Incorrect. Buyers would switch to cheaper identical corn.',
        ],
      },
      checkpoints: [
        {
          question: 'A drug company holds a patent that stops rivals from selling the same medicine. The patent is an example of:',
          choices: ['A barrier to entry', 'A commodity', 'Value creation', 'A consumer'],
          answer: 0,
          explanations: [
            'Correct. Intellectual property rights keep new competitors out.',
            'Incorrect. A patented medicine is the opposite of an interchangeable commodity.',
            'Incorrect. Creating the medicine creates value; the patent protects the market position.',
            'Incorrect. A consumer uses a product.',
          ],
        },
        {
          question: 'In a competitive market, what tends to establish the prevailing market price?',
          choices: [
            'Sellers seeking higher prices interacting with buyers seeking lower prices',
            'The government setting every price',
            'The single largest seller alone',
            'The cost of advertising',
          ],
          answer: 0,
          explanations: [
            'Correct. The interaction of both sides sets the price.',
            'Incorrect. Prices in a competitive market aren\'t set by decree.',
            'Incorrect. In a competitive market no one seller sets the price.',
            'Incorrect. Advertising cost doesn\'t determine market price.',
          ],
        },
      ],
      revisit:
        'Market: sellers + buyers; voluntary exchange; price settles between higher-seeking sellers and lower-seeking buyers. ' +
        'Competitive advantage: low cost (commodities), differentiation, barriers to entry. Monopoly protects barriers.',
    },
    {
      id: '1.3',
      ced: '1.3.A–C',
      title: 'PESTEL Factors and the Business Environment',
      minutes: 8,
      summary:
        'PESTEL factors (political, economic, social, technological, environmental, legal) shape which businesses are viable in a market ' +
        'and what careers exist there. Businesses use the PESTEL framework to judge a market\'s attractiveness and risks, and enter ' +
        'markets whose factors fit their model. Changes in any factor can change viability and jobs.',
      body: String.raw`### The six factors
| Factor | Examples | Why it affects viability |
|---|---|---|
| **Political** | Trade policy, taxes, **subsidies**, **mandates**, **bans**, political stability | Subsidies and mandates support some activities; bans limit others; taxes can discourage activities |
| **Economic** | Economic stability, household income, inflation, unemployment, interest rates | A strong economy raises spending, though some businesses thrive in downturns (discount stores, repair shops) |
| **Social** | Demographics, cultural norms, lifestyle trends, population growth | Consumer needs and wants follow these trends |
| **Technological** | Internet access, automation, pace of innovation | Production, distribution and communication depend on available technology |
| **Environmental** | Geography, renewable and nonrenewable resources, waste policies, consumers' environmental views | Climate, resources and disasters constrain production; green preferences shift purchases |
| **Legal** | Employment, consumer protection, health and safety, environmental, intellectual property and antitrust laws | Laws affect operating costs and what's allowed |

### Using the framework
1. Identify which PESTEL factors are **relevant** to the product.
2. Assess how each affects the market's **attractiveness** and **risks**.
3. Enter markets where factors **fit the business model**: a tech company wants cheap high-speed internet and electricity; a farm-to-table restaurant wants customers who value local food.

### Careers too
PESTEL factors determine which businesses are viable in a place, and so which **jobs** exist there. Changes (like an economic downturn) can bring layoffs.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'A company plans to open electric-scooter rentals in a city. Which PESTEL factor is each?',
            buckets: ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal'],
            items: [
              { label: 'The city offers a subsidy for zero-emission transportation', bucket: 0, why: 'A government policy that encourages the activity.' },
              { label: 'Unemployment is rising and household incomes are falling', bucket: 1, why: 'Conditions in the economy affecting spending.' },
              { label: 'Young adults increasingly prefer not to own cars', bucket: 2, why: 'A lifestyle trend among consumers.' },
              { label: 'Cheap GPS chips let scooters be tracked and unlocked by phone', bucket: 3, why: 'Available technology enabling the service.' },
              { label: 'The city is hilly and gets heavy snow for four months a year', bucket: 4, why: 'Geography and climate constrain operations.' },
              { label: 'A new law requires riders to wear helmets and be at least 16', bucket: 5, why: 'A specific law affecting operations and costs.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Rising interest rates that make it more expensive to borrow are which PESTEL factor?',
        choices: ['Economic', 'Political', 'Social', 'Legal'],
        answer: 0,
        explanations: [
          'Correct. Interest rates are an economic factor.',
          'Incorrect. Political factors are policies like taxes and bans.',
          'Incorrect. Social factors are cultural and demographic trends.',
          'Incorrect. Legal factors are specific laws and regulations.',
        ],
      },
      checkpoints: [
        {
          question: 'Why would a farm-to-table restaurant choose a town where many residents prioritize locally grown food?',
          choices: [
            'Social factors there fit its business model',
            'Legal factors require it',
            'Technological factors are irrelevant to restaurants',
            'Economic factors never matter',
          ],
          answer: 0,
          explanations: [
            'Correct. Customer values (a social factor) align with its model.',
            'Incorrect. No law requires that location.',
            'Incorrect. That isn\'t the reason, and technology does matter to restaurants.',
            'Incorrect. Economic factors always matter.',
          ],
        },
        {
          question: 'A national ban on single-use plastic bags hurts a bag manufacturer. This is mainly a:',
          choices: ['Political factor', 'Social factor', 'Technological factor', 'Environmental factor'],
          answer: 0,
          explanations: [
            'Correct. Bans are political factors in the CED.',
            'Incorrect. It is a government policy, not a cultural trend.',
            'Incorrect. Technology isn\'t the cause.',
            'Incorrect. The ban may have environmental motives, but bans are classed as political.',
          ],
        },
      ],
      revisit:
        'PESTEL: political (policy: taxes, subsidies, mandates, bans), economic (income, inflation, unemployment, rates), social ' +
        '(demographics, trends), technological, environmental (geography, resources), legal (specific laws). Use to judge market fit, risks and jobs.',
    },
    {
      id: '1.4',
      ced: '1.4.A–C',
      title: 'How Do Business Ideas Originate?',
      minutes: 6,
      summary:
        'Entrepreneurs develop new businesses and take on the risk and reward. Ideas come from observing, interviewing and surveying ' +
        'customers, market and technical research, and experimentation. New products are risky because they cost resources with no ' +
        'guaranteed revenue; people bear that risk for profit, problem-solving or passion. Design thinking: validate the problem, develop a solution, test an MVP.',
      body: String.raw`An **entrepreneur** develops a new business and **assumes its risks and potential rewards**.

### Where ideas come from
- **Observing, interviewing and surveying** potential customers to find needs
- **Market and technical research** to find gaps
- **Experimentation** that builds new capabilities

### Why take the risk?
Bringing a product to market costs **financial, physical and human resources**, with **no guarantee** of enough revenue to cover them. Entrepreneurs do it for **potential profit**, the **satisfaction of solving a problem**, or to **pursue a passion**.

### Entrepreneurial design thinking
| Step | What happens |
|---|---|
| 1. **Identify and validate** the problem | Observe, interview or survey; gather evidence the problem **exists**, can be **clearly defined**, and is shared by **multiple** potential customers |
| 2. **Develop a solution** | Brainstorm, sketch, prototype a product idea |
| 3. **Validate the idea** | Get feedback on a **minimum viable product (MVP)**: the simplest version with only core features, which can be a sketch, a description or a model |

Validating early means you don't spend a fortune building something nobody wants.`,
      blocks: [],
      precheck: {
        question: 'A minimum viable product (MVP) is:',
        choices: [
          'The simplest version of a product idea, with only core features, used to get feedback',
          'The finished product with every feature',
          'The cheapest product in the market',
          'A government-approved product standard',
        ],
        answer: 0,
        explanations: [
          'Correct. It can even be a sketch, description or model.',
          'Incorrect. An MVP comes early, before full development.',
          'Incorrect. It is about features, not price.',
          'Incorrect. It has nothing to do with regulation.',
        ],
      },
      checkpoints: [
        {
          question: 'A student interviews 20 classmates and finds that 15 struggle to find quiet study spaces. What step of design thinking is this?',
          choices: [
            'Validating that the problem exists and is shared',
            'Testing the MVP',
            'Prototyping the solution',
            'Capturing value',
          ],
          answer: 0,
          explanations: [
            'Correct. The evidence shows the problem is real and shared by many.',
            'Incorrect. There is no product yet to test.',
            'Incorrect. No solution has been built.',
            'Incorrect. Nothing is being sold.',
          ],
        },
        {
          question: 'Why is bringing a new product to market risky?',
          choices: [
            'It costs resources with no guarantee that revenue will cover the costs',
            'Products are illegal until they earn a profit',
            'Entrepreneurs never earn rewards',
            'Customers must pay before the product exists',
          ],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s description of the risk.',
            'Incorrect. No such rule exists.',
            'Incorrect. Potential reward is why they take the risk.',
            'Incorrect. That isn\'t how markets generally work.',
          ],
        },
      ],
      revisit:
        'Entrepreneur = develops a business, bears risk and reward. Ideas: observe/interview/survey, research, experiment. Risk: costs ' +
        'without guaranteed revenue. Design thinking: validate problem → develop solution → test an MVP.',
    },
    {
      id: '1.5',
      ced: '1.5.A–C',
      title: 'Vision',
      minutes: 6,
      summary:
        'Core values are beliefs that guide actions; core competencies are capabilities that help outperform rivals. Both guide ' +
        'business and personal choices. A vision statement states core values and aspirations; a mission statement says what the ' +
        'business does and how it will reach its goals. Businesses seek profit; social enterprises add social goals; nonprofits reinvest surpluses.',
      body: String.raw`### Core values vs. core competencies
| | Meaning | Examples |
|---|---|---|
| **Core values** | Beliefs and principles that guide actions | Creativity, excellence, transparency, empathy, reliability |
| **Core competencies** | Capabilities, skills and expertise that help outperform rivals | Innovation, customer service, communication, ethical behavior, efficiency |

Businesses communicate **values** so employees share a purpose and decisions stay consistent; they use **competencies** to choose opportunities and allocate resources. **You** do the same with education and career choices.

### Vision vs. mission
- **Vision statement**: a concise description of **core values and aspirations** (where we want to be).
- **Mission statement**: **what the business does** and **how** it will reach its long-term goals.

Both guide insiders and tell customers and investors what the business stands for.

### Three kinds of organizations
| Type | Main goal | Note |
|---|---|---|
| **Business** | Profit, fulfilling its mission, long-term viability | Raise profit by **increasing revenue** and/or **cutting costs** |
| **Social enterprise** | Profit **and** social objectives | Impact through products, operations or financial model |
| **Nonprofit** | Serve the public good | Surplus must be **reinvested** by law; often relies on grants and donations |`,
      blocks: [],
      precheck: {
        question: 'Which statement describes what a business does and how it will reach its long-term goals?',
        choices: ['A mission statement', 'A vision statement', 'A core value', 'A code of conduct'],
        answer: 0,
        explanations: [
          'Correct. That is the CED\'s definition of a mission statement.',
          'Incorrect. A vision statement describes values and aspirations.',
          'Incorrect. A core value is a guiding belief.',
          'Incorrect. That sets ethical rules for behavior.',
        ],
      },
      checkpoints: [
        {
          question: 'A shoe company sells shoes for profit and donates a pair for every pair sold. It is best described as a:',
          choices: ['Social enterprise', 'Nonprofit organization', 'Monopoly', 'Sole proprietorship by definition'],
          answer: 0,
          explanations: [
            'Correct. It seeks profit while pursuing a social objective.',
            'Incorrect. Nonprofits don\'t generate profit for owners.',
            'Incorrect. Many companies sell shoes.',
            'Incorrect. Its social mission says nothing about its legal form.',
          ],
        },
        {
          question: 'A company known for outstanding customer service decides to expand into home repair, where service quality matters most. It is using its:',
          choices: ['Core competencies', 'Vision statement', 'Barriers to entry', 'PESTEL factors'],
          answer: 0,
          explanations: [
            'Correct. It chooses opportunities that fit what it does best.',
            'Incorrect. The decision is based on a capability, not a statement.',
            'Incorrect. Nothing here blocks rivals.',
            'Incorrect. The choice is about its own strengths.',
          ],
        },
      ],
      revisit:
        'Core values = guiding beliefs; core competencies = capabilities to outperform rivals. Vision = values and aspirations; ' +
        'mission = what we do and how. Business (profit), social enterprise (profit + social goal), nonprofit (public good, reinvest surplus).',
    },
    {
      id: '1.6',
      ced: '1.6.A–B',
      title: 'Business Ethics',
      minutes: 5,
      summary:
        'Unethical behavior (falsifying or hiding information, misusing property, harming employees or customers) can happen at any ' +
        'level, often pushed by incentives. Businesses encourage ethics with codes of conduct, training, consequences and modeling, which ' +
        'also builds loyalty. Ethical dilemmas pit values against each other or against goals; leaders weigh effects on internal and external stakeholders.',
      body: String.raw`### Encouraging ethical behavior
Unethical behavior includes **falsifying or concealing information**, **misusing company property**, and **harming employees or customers**. It can happen at every level, and **incentive structures** (like bonuses tied only to sales) can tempt people.

Businesses encourage ethics through **codes of conduct**, **training**, **internal consequences** for violations, and leaders **modeling** good behavior. Ethics also **attracts customers and employees** and builds brand loyalty; how a business responds to wrongdoing affects relationships, reputation and profit.

### Ethical dilemmas
A dilemma exists when a **core value** (transparency, fairness, empathy) **conflicts** with another value or with business goals.

| Stakeholders | Who |
|---|---|
| **Internal** | Directly involved: owners, managers, employees |
| **External** | Not employed but affected: customers, government agencies, community members |

Leaders respond by either:
- weighing the **benefits and costs for each stakeholder group** and choosing the **greatest total benefit or least total harm**, or
- choosing the action **most consistent with the business's vision and goals**.`,
      blocks: [],
      precheck: {
        question: 'Which is an external stakeholder of a grocery chain?',
        choices: ['A customer who shops there', 'A store manager', 'An employee', 'An owner'],
        answer: 0,
        explanations: [
          'Correct. Customers aren\'t employed by the business but are affected by it.',
          'Incorrect. Managers are internal stakeholders.',
          'Incorrect. Employees are internal stakeholders.',
          'Incorrect. Owners are internal stakeholders.',
        ],
      },
      checkpoints: [
        {
          question: 'A company discovers a minor defect. Telling customers (transparency) would hurt quarterly profits. This is:',
          choices: ['An ethical dilemma', 'A barrier to entry', 'Value capture', 'A PESTEL factor'],
          answer: 0,
          explanations: [
            'Correct. A core value conflicts with a business goal.',
            'Incorrect. Nothing blocks competitors.',
            'Incorrect. That is about price vs. cost.',
            'Incorrect. It is an internal choice, not an external factor.',
          ],
        },
        {
          question: 'Which practice most directly encourages ethical behavior in employees?',
          choices: [
            'A code of conduct with training and consequences for violations',
            'Bonuses based only on hitting sales targets',
            'Keeping ethics policies secret',
            'Avoiding any discussion of mistakes',
          ],
          answer: 0,
          explanations: [
            'Correct. These are the CED\'s listed methods.',
            'Incorrect. Incentives like this can push people toward unethical shortcuts.',
            'Incorrect. Policies only work if people know them.',
            'Incorrect. Open discussion supports ethical culture.',
          ],
        },
      ],
      revisit:
        'Unethical: falsifying/concealing, misusing property, harming people; incentives can drive it. Encourage ethics: codes, ' +
        'training, consequences, modeling. Dilemma = value vs. value or goal. Weigh internal and external stakeholders.',
    },
    {
      id: '1.7',
      ced: '1.7.A–D',
      title: 'Organization, Roles, and Responsibilities',
      minutes: 7,
      summary:
        'Business types: sole proprietorship, partnership, LLC, corporation. The first three keep owners in control and keep profits, ' +
        'but have less access to funding; sole proprietors and partners are personally liable, LLC owners are not. Corporations have more ' +
        'funding and growth but owners cede control to shareholders and a board. Growing businesses add specialized departments and may outsource.',
      body: String.raw`### Four types of business organization
| Type | Control and profits | Personal liability for business debts | Access to funding |
|---|---|---|---|
| **Sole proprietorship** | One owner keeps both | **Yes** | Limited |
| **Partnership** | Partners share both | **Yes** | Limited |
| **LLC** (limited liability company) | Owners keep both | **No** | Limited |
| **Corporation** | Shareholders and an elected **board of directors**; the company controls profits | **No**: the company is liable | **Greater**: more ability to grow |

### Who does what
- **Sole proprietors** handle everything and play many roles: CEO, marketer, product developer, financial manager, operations manager.
- **Partners** divide roles by strengths and interests.
- As businesses grow, they organize into **specialized departments** led by managers who report to **executive leaders** (like a CEO); in a corporation, executives report to the board and shareholders.
- **Outsourcing**: hiring another business to do a function when that's more efficient or cheaper (e.g., lacking skilled staff, or high labor costs).

### Departments
| Department | Responsibilities |
|---|---|
| **Sales and marketing** | Market research, sales strategy, brands, customer relationships |
| **Research and development** | Innovate new and existing goods, services and processes |
| **Operations** | Manufacture goods or develop services and get them to customers |
| **Accounting** | Track spending and earnings; prepare financial statements |
| **Finance** | Secure and manage funds; use data to recommend strategy |
| **Human resources** | Recruit, train and evaluate employees |`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which type of business organization fits each description?',
            buckets: ['Sole proprietorship', 'Partnership', 'LLC', 'Corporation'],
            items: [
              { label: 'One owner runs a food truck and is personally responsible for all its debts', bucket: 0, why: 'A single owner with personal liability.' },
              { label: 'Two friends co-own a design studio, split the work, and are both personally liable', bucket: 1, why: 'Shared ownership with personal liability.' },
              { label: 'A family keeps full control of its bakery but protects its home and savings from business debts', bucket: 2, why: 'An LLC keeps control while avoiding personal liability.' },
              { label: 'A company sells shares to raise money and is overseen by an elected board of directors', bucket: 3, why: 'Shareholders and a board; greater access to funding.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which type of business lets the owner keep control while avoiding personal liability for business debts?',
        choices: ['Limited liability company (LLC)', 'Sole proprietorship', 'Partnership', 'Corporation'],
        answer: 0,
        explanations: [
          'Correct. LLC owners keep control without personal liability.',
          'Incorrect. Sole proprietors are personally liable.',
          'Incorrect. Partners are personally liable.',
          'Incorrect. Corporations shield owners, but owners cede control to shareholders and a board.',
        ],
      },
      checkpoints: [
        {
          question: 'Which department would most likely run a survey to learn what customers want in a new product?',
          choices: ['Sales and marketing', 'Accounting', 'Human resources', 'Finance'],
          answer: 0,
          explanations: [
            'Correct. Market research is a sales and marketing responsibility.',
            'Incorrect. Accounting tracks spending and earnings.',
            'Incorrect. HR handles employees.',
            'Incorrect. Finance manages funds.',
          ],
        },
        {
          question: 'A startup without a skilled payroll team hires an outside firm to run payroll. This is:',
          choices: ['Outsourcing', 'A barrier to entry', 'Value creation', 'Incorporation'],
          answer: 0,
          explanations: [
            'Correct. Another business performs the function more efficiently.',
            'Incorrect. Nothing blocks rivals.',
            'Incorrect. This is about internal operations.',
            'Incorrect. Its legal form hasn\'t changed.',
          ],
        },
      ],
      revisit:
        'Sole prop and partnership: control, profits, personal liability, less funding. LLC: control, no personal liability. ' +
        'Corporation: board and shareholders, company liable, more funding. Departments: sales/marketing, R&D, operations, accounting, finance, HR. Outsource for efficiency.',
    },
    {
      id: '1.8',
      ced: '1.8.A–C',
      title: 'Supply Chains',
      minutes: 6,
      summary:
        'Businesses choose artisan or mass-production processes based on customer priorities, core competencies and competition. Supply ' +
        'chains connect everyone from raw materials to delivery, and differ for goods and services. Businesses weigh cost, quality, ' +
        'efficiency, convenience and risk in choosing suppliers, and shape supply chains around their competitive-advantage strategy.',
      body: String.raw`### Production processes
| Process | Uses | Fits |
|---|---|---|
| **Artisan** | Skilled labor, attention to detail | Customization, high quality |
| **Mass production** | Technology, assembly lines, machinery | Large quantities, low prices |

Choices depend on **customer priorities** (quality, price, customization), the business's **core competencies**, and the **competitive landscape**.

### Supply chains
A **supply chain** links everyone involved from **raw materials to final delivery**, locally, regionally or globally.
- **Goods**: raw materials and components (like computer chips) → manufacturing → storage (warehouse) → distribution center or store → customer.
- **Services**: acquire the employees, resources and delivery systems needed to serve customers in person or online.

Choosing suppliers means weighing **cost, quality, efficiency, convenience and risk**. Risks (natural disasters, political instability, shortages, production errors, supplier reputation) can delay delivery or raise costs.

### Supply chains follow strategy
| Competitive-advantage strategy | Supply chain choices |
|---|---|
| **Low prices** | Mass production; cheaper resources; efficient processes; scaling up so revenue grows faster than costs |
| **High quality** | High-quality resources and production methods (artisan or mass production) |
| **Barriers to entry** | Exclusive or restrictive deals with suppliers or distributors that lock out rivals |`,
      blocks: [],
      precheck: {
        question: 'A business competing on the lowest price would most likely build a supply chain focused on:',
        choices: [
          'Reducing costs through cheaper resources and efficient production',
          'Hand-crafting each item with premium materials',
          'Limiting production to a few custom orders',
          'Choosing the most expensive suppliers',
        ],
        answer: 0,
        explanations: [
          'Correct. Low-price strategies need low costs.',
          'Incorrect. That fits a high-quality strategy.',
          'Incorrect. That raises cost per unit.',
          'Incorrect. That conflicts with low prices.',
        ],
      },
      checkpoints: [
        {
          question: 'A guitar maker builds each instrument by hand with skilled luthiers. This is:',
          choices: ['An artisan process', 'Mass production', 'Outsourcing', 'A monopoly'],
          answer: 0,
          explanations: [
            'Correct. Skilled labor and attention to detail define artisan production.',
            'Incorrect. Mass production uses assembly lines and machinery.',
            'Incorrect. The work is done in-house.',
            'Incorrect. Many guitar makers exist.',
          ],
        },
        {
          question: 'A headphone company signs a deal stopping its chip supplier from selling to rivals. Which strategy does this support?',
          choices: ['Barriers to entry', 'Low prices', 'Value capture through discounts', 'A nonprofit mission'],
          answer: 0,
          explanations: [
            'Correct. Exclusive supplier agreements keep rivals out.',
            'Incorrect. The deal is about limiting rivals, not lowering cost.',
            'Incorrect. Discounts aren\'t involved.',
            'Incorrect. It is a for-profit competitive move.',
          ],
        },
      ],
      revisit:
        'Artisan vs. mass production (customer priorities, competencies, competition). Supply chain: raw materials → delivery; goods ' +
        'vs. services. Supplier choice: cost, quality, efficiency, convenience, risk. Strategy shapes supply chain: low price, quality, barriers.',
    },
  ],
};

export default pack;
