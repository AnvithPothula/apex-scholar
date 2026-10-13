/**
 * AP Statistics Unit 1: Exploring One-Variable Data and Collecting Data —
 * study pack.
 *
 * Written against the revised AP Statistics CED (effective Fall 2026, topics
 * 1.1–1.13). The 2026 framework moved data collection (sampling, bias,
 * experimental design) into Unit 1 and frames studies around an
 * "investigative question", so this pack does too. Uses the CED's own
 * definitions: Q1/Q3 as medians of the halves, s with n − 1, both outlier
 * rules (1.5 × IQR and 2 standard deviations), z = (x − μ)/σ.
 *
 * Related topics share a section (ids like "1.3–1.4"), as in the other packs.
 * Import-free so scripts/prerender.mjs can load it.
 */

const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);

const pack = {
  slug: 'ap-statistics/unit-1',
  subject: 'AP Statistics',
  unit: 'Unit 1: Exploring One-Variable Data and Collecting Data',
  examWeight: '20–30% of the multiple-choice section',
  intro:
    'Statistics answers questions about a population using data from a sample. This unit covers both halves of that: describing ' +
    'one variable with tables, graphs and summary statistics, and collecting data well, through random sampling and well-designed ' +
    'experiments, so the conclusions mean something. It is the largest unit on the exam.',
  sections: [
    {
      id: '1.1–1.2',
      ced: '1.1.A–1.2.C',
      title: 'Statistical Studies and Variables',
      minutes: 6,
      summary:
        'A statistical study collects data from a sample to answer an investigative question about a population. Observational units ' +
        'carry variables, categorical or quantitative (discrete or continuous). A parameter describes a population; a statistic describes a sample.',
      body: String.raw`### The pieces of a study
- **Population** (size $N$): all items or individuals of interest. **Sample** (size $n$): the subset you actually collect data from.
- An **investigative question** has a defined purpose, is set **before** looking at the data, and is posed so the needed data can be collected.
- **In context** means tying every number to what it describes ("the mean commute of the 50 surveyed employees was 23 minutes").

### Units, variables, parameters, statistics
| Term | Meaning |
|---|---|
| **Observational unit** | The item or individual a datum comes from |
| **Variable** | A characteristic that can change from unit to unit |
| **Parameter** | A numerical summary of a **population** (usually unknown) |
| **Statistic** | A numerical summary of a **sample** (used to estimate the parameter) |

Memory trick: **p**arameter ↔ **p**opulation, **s**tatistic ↔ **s**ample.

### Types of variables
- **Categorical** (qualitative): category names or labels, such as eye color or zip code.
- **Quantitative** (numerical): measured or counted amounts, usually with units.
  - **Discrete**: countable values (number of siblings).
  - **Continuous**: any value in an interval (height, time).

Zip codes are numbers but **categorical**: averaging them is meaningless.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Parameter', back: 'A number describing a population (usually unknown).' },
            { front: 'Statistic', back: 'A number describing a sample; used to estimate a parameter.' },
            { front: 'Discrete vs continuous', back: 'Discrete: countable values. Continuous: any value in an interval.' },
            { front: 'Observational unit', back: 'The item or individual a piece of data is collected from.' },
          ],
        },
      ],
      precheck: {
        question: 'A survey of 200 students at a school finds that 62% own a pet. The 62% is a:',
        choices: ['Statistic', 'Parameter', 'Population', 'Variable'],
        answer: 0,
        explanations: [
          'Correct. It summarizes the sample of 200 students.',
          'Incorrect. A parameter would describe every student at the school.',
          'Incorrect. The population is all the students, not a percentage.',
          'Incorrect. The variable is pet ownership; 62% is a summary of it.',
        ],
      },
      checkpoints: [
        {
          question: 'Which variable is quantitative and continuous?',
          choices: ['The time it takes a student to finish a test', 'The number of books a student read last year', 'A student\'s favorite subject', 'A student\'s ID number'],
          answer: 0,
          explanations: [
            'Correct. Time is measured and can take any value in an interval.',
            'Incorrect. A count of books is quantitative but discrete.',
            'Incorrect. Favorite subject is categorical.',
            'Incorrect. ID numbers are labels, so they are categorical.',
          ],
        },
        {
          question: 'A researcher records the length, in centimeters, of 40 fish caught in a lake. What is the observational unit?',
          choices: ['Each fish', 'The length of a fish', 'The lake', 'The 40 lengths'],
          answer: 0,
          explanations: [
            'Correct. Each fish is the individual a measurement comes from.',
            'Incorrect. Length is the variable.',
            'Incorrect. The lake is where the population lives, not the unit measured.',
            'Incorrect. The 40 lengths are the data set.',
          ],
        },
      ],
      revisit:
        'Population vs sample; parameter (population) vs statistic (sample). Variables: categorical (labels) or quantitative (discrete ' +
        'counts, continuous measurements). Set the investigative question before analyzing.',
    },
    {
      id: '1.3–1.4',
      ced: '1.3.A–1.4.C',
      title: 'Representing One Categorical Variable',
      minutes: 5,
      summary:
        'Frequency tables give counts per category; relative frequency tables give proportions. Bar charts and pie charts display them, ' +
        'and both can be used to compare data sets on the same categorical variable.',
      body: String.raw`### Tables
- **Frequency table**: the **count** in each category.
- **Relative frequency table**: the **proportion** in each category (count ÷ total). Percentages, relative frequencies and ratios carry the same information as proportions.

| Transportation to school | Frequency | Relative frequency |
|---|---|---|
| Bus | 45 | 0.45 |
| Car | 30 | 0.30 |
| Walk/bike | 25 | 0.25 |
| **Total** | **100** | **1.00** |

### Graphs
- **Bar chart**: one bar per category; height = frequency or relative frequency. Bars don't touch, and their order doesn't matter.
- **Pie chart**: each slice's share of the circle = its relative frequency; slices add to 100%.

### Comparing groups
To compare two schools of different sizes, use **relative** frequencies: 120 bus riders out of 600 (20%) is a smaller share than 45 out of 100 (45%).`,
      blocks: [],
      precheck: {
        question: 'In a relative frequency table, the relative frequencies of all categories should add to:',
        choices: ['1 (or 100%)', 'The sample size', '0', 'The number of categories'],
        answer: 0,
        explanations: [
          'Correct. Each is a proportion of the total, so together they make the whole.',
          'Incorrect. That is what the counts in a frequency table add to.',
          'Incorrect. Proportions are nonnegative and cover every unit.',
          'Incorrect. The number of categories has nothing to do with the total proportion.',
        ],
      },
      checkpoints: [
        {
          question: 'School A has 90 of 300 students in band; School B has 60 of 150. Which statement is correct?',
          choices: [
            'School B has a greater proportion of students in band',
            'School A has a greater proportion of students in band',
            'The proportions are equal',
            'They can\'t be compared because the schools are different sizes',
          ],
          answer: 0,
          explanations: [
            'Correct. A: 90/300 = 0.30; B: 60/150 = 0.40.',
            'Incorrect. A has more band students in count, but a smaller share.',
            'Incorrect. 0.30 and 0.40 are not equal.',
            'Incorrect. Relative frequencies are exactly how to compare groups of different sizes.',
          ],
        },
        {
          question: 'Which graph is appropriate for displaying the distribution of a categorical variable?',
          choices: ['Bar chart', 'Histogram', 'Dotplot', 'Boxplot'],
          answer: 0,
          explanations: [
            'Correct. Bar charts (and pie charts) display categorical data.',
            'Incorrect. Histograms show quantitative data in ordered bins.',
            'Incorrect. Dotplots place quantitative values on a number line.',
            'Incorrect. Boxplots summarize quantitative data.',
          ],
        },
      ],
      revisit:
        'Frequency = count; relative frequency = count ÷ total (sums to 1). Bar and pie charts for categorical data. Compare groups of ' +
        'different sizes with proportions, not counts.',
    },
    {
      id: '1.5–1.6',
      ced: '1.5.A–1.6.B',
      title: 'Graphing and Describing One Quantitative Variable',
      minutes: 7,
      summary:
        'Histograms, stem-and-leaf plots and dotplots show quantitative distributions in order. Describe a distribution by shape, center ' +
        'and variability, plus unusual features (outliers, gaps, clusters), always in context.',
      body: String.raw`### Graphs that keep the numbers in order
- **Dotplot**: one dot per value above a number line; repeated values stack.
- **Stem-and-leaf plot**: stem = leading digit(s), leaf = the next digit (47 → stem 4, leaf 7). Keeps every data value.
- **Histogram**: values grouped into **bins** (intervals); bar height = frequency or relative frequency. Changing the bin width can change how the histogram looks. Bars touch, because the bins are consecutive.

### Describe: shape, center, variability, unusual features (in context)
**Shape**
- **Skewed right**: long tail toward **larger** values (incomes).
- **Skewed left**: long tail toward **smaller** values (scores on an easy test).
- **Approximately symmetric**: left half ≈ mirror of right half.
- **Unimodal** (one peak), **bimodal** (two), **approximately uniform** (no prominent peaks).

**Unusual features**
- **Outliers**: values unusually small or large relative to the rest.
- **Gaps**: stretches with no data. **Clusters**: groups of values separated by gaps.

A complete answer names all four **and** the context: "The distribution of commute times for these 30 employees is skewed right, centered near 22 minutes, with most between 10 and 40 minutes and a possible outlier at 95 minutes."`,
      blocks: [],
      precheck: {
        question: 'A distribution of household incomes has a long tail stretching toward high incomes. Its shape is:',
        choices: ['Skewed right', 'Skewed left', 'Symmetric', 'Uniform'],
        answer: 0,
        explanations: [
          'Correct. The direction of the long tail names the skew; here it points to larger values.',
          'Incorrect. Skewed left has its long tail toward smaller values.',
          'Incorrect. A long one-sided tail rules out symmetry.',
          'Incorrect. A uniform distribution has no peak and no tail.',
        ],
      },
      checkpoints: [
        {
          question: 'Which description of a quantitative distribution is most complete?',
          choices: [
            'Shape, center, variability and any outliers, gaps or clusters, all in context',
            'Only the mean and standard deviation',
            'The largest and smallest values',
            'The number of bins in the histogram',
          ],
          answer: 0,
          explanations: [
            'Correct. That is what the CED asks for, tied to the variable and units.',
            'Incorrect. That leaves out shape and unusual features.',
            'Incorrect. The extremes alone say little about the shape or center.',
            'Incorrect. Bin choice affects appearance but isn\'t a description of the data.',
          ],
        },
        {
          question: 'A dotplot of 25 test scores shows one group of scores from 60 to 72 and another from 85 to 98, with no scores between 73 and 84. This distribution is best described as:',
          choices: ['Bimodal, with a gap', 'Unimodal and symmetric', 'Skewed left with one outlier', 'Approximately uniform'],
          answer: 0,
          explanations: [
            'Correct. Two clusters with an empty stretch between them: two peaks and a gap.',
            'Incorrect. There are two separate groups, not one peak.',
            'Incorrect. Two clusters aren\'t a single tail and an outlier.',
            'Incorrect. Uniform would spread values evenly with no gap.',
          ],
        },
      ],
      revisit:
        'Dotplots, stem-and-leaf plots and histograms keep values in order. Describe shape (skew named by the tail; uni/bimodal/uniform), ' +
        'center, variability, and outliers, gaps, clusters, in context.',
    },
    {
      id: '1.7',
      ced: '1.7.A–1.7.F',
      title: 'Summary Statistics for One Quantitative Variable',
      minutes: 9,
      summary:
        'Center: mean and median. Position: quartiles and percentiles. Variability: range, IQR and standard deviation. Outliers lie more ' +
        'than 1.5 × IQR beyond a quartile (or more than 2 standard deviations from the mean). Median and IQR are resistant to outliers; ' +
        'mean, range and standard deviation are not.',
      body: String.raw`### Center and position
- **Mean** $\bar{x} = \dfrac{\sum x_i}{n}$. **Median**: the middle value of the ordered data (average the two middle values if $n$ is even).
- **Q1** = median of the lower half; **Q3** = median of the upper half (leave the median out of both halves when $n$ is odd). Q1 and Q3 bound the middle 50%.
- The **pth percentile** has p% of the data at or below it; Q1 and Q3 are the 25th and 75th percentiles.

### Variability
| Measure | Formula |
|---|---|
| **Range** | max − min |
| **IQR** | Q3 − Q1 |
| **Standard deviation** | $s = \sqrt{\dfrac{\sum (x_i - \bar{x})^2}{n-1}}$, a typical distance from the mean ($s^2$ is the variance) |

Changing units changes the statistics (minutes → seconds multiplies the mean and SD by 60).

### Outliers: two common rules
- More than $1.5 \times \text{IQR}$ below Q1 or above Q3.
- More than 2 standard deviations from the mean.

${steps({
  title: 'Data: 12, 14, 15, 15, 16, 17, 18, 18, 19, 20, 31. Is 31 an outlier by the 1.5 × IQR rule?',
  steps: [
    { title: 'Median', body: '11 values, so the 6th: **17**' },
    { title: 'Quartiles', body: 'Lower half 12, 14, 15, 15, 16 → Q1 = **15**. Upper half 18, 18, 19, 20, 31 → Q3 = **19**' },
    { title: 'IQR and fence', body: 'IQR = 19 − 15 = 4. Upper fence = 19 + 1.5(4) = **25**' },
    { title: 'Decide', body: '31 > 25, so 31 is an outlier.' },
  ],
  answer: 'Yes: 31 is above the upper fence of 25',
})}

### Resistant or not
- **Resistant** (barely moved by outliers): **median, IQR**.
- **Nonresistant**: **mean, standard deviation, range**.

So for skewed data or data with outliers, report the **median and IQR**; for roughly symmetric data without outliers, the **mean and SD** work well. Try it below.`,
      blocks: [{ type: 'sim', sim: 'outlier-pull' }],
      precheck: {
        question: 'Which pair of statistics is resistant to outliers?',
        choices: ['Median and IQR', 'Mean and standard deviation', 'Mean and IQR', 'Range and median'],
        answer: 0,
        explanations: [
          'Correct. Both depend on the middle of the ordered data, which one extreme value barely changes.',
          'Incorrect. Both use every value\'s size, so an outlier pulls them.',
          'Incorrect. The mean is not resistant.',
          'Incorrect. The range depends entirely on the extremes.',
        ],
      },
      checkpoints: [
        {
          question: 'For a data set, Q1 = 40 and Q3 = 60. Which value is an outlier by the 1.5 × IQR rule?',
          choices: ['95', '85', '20', '75'],
          answer: 0,
          explanations: [
            'Correct. IQR = 20, so the fences are 40 − 30 = 10 and 60 + 30 = 90; 95 is above 90.',
            'Incorrect. 85 is below the upper fence of 90.',
            'Incorrect. 20 is above the lower fence of 10.',
            'Incorrect. 75 is within the fences.',
          ],
        },
        {
          question: 'A small company\'s salaries are strongly skewed right because of the CEO\'s pay. Which measures best describe a typical salary and its spread?',
          choices: ['Median and IQR', 'Mean and standard deviation', 'Mean and range', 'Maximum and minimum'],
          answer: 0,
          explanations: [
            'Correct. They resist the CEO\'s extreme salary.',
            'Incorrect. The CEO\'s pay pulls both upward.',
            'Incorrect. Both are strongly affected by the extreme value.',
            'Incorrect. The extremes describe the edges, not a typical salary.',
          ],
        },
        {
          question: 'A data set of times in minutes has mean 12 and standard deviation 3. If every time is converted to seconds, the new mean and standard deviation are:',
          choices: ['720 s and 180 s', '720 s and 3 s', '12 s and 3 s', '720 s and 60 s'],
          answer: 0,
          explanations: [
            'Correct. Multiplying every value by 60 multiplies both the mean and the standard deviation by 60.',
            'Incorrect. Rescaling also stretches the spread.',
            'Incorrect. The values in seconds are 60 times larger.',
            'Incorrect. The SD is 3 × 60 = 180 s.',
          ],
        },
      ],
      revisit:
        'Q1/Q3 = medians of the halves; IQR = Q3 − Q1; outliers beyond 1.5 × IQR from the quartiles (or 2 SDs from the mean). ' +
        'Median and IQR are resistant; mean, SD and range are not. Use median/IQR for skewed data.',
    },
    {
      id: '1.8–1.9',
      ced: '1.8.A–1.9.D',
      title: 'Boxplots, Comparing Distributions, and z-Scores',
      minutes: 7,
      summary:
        'A boxplot shows the five-number summary, with outliers marked separately. Skewed right usually means mean > median. Compare ' +
        'distributions by center, variability, shape and outliers. A z-score, (x − μ)/σ, gives a value\'s position in standard deviations from the mean.',
      body: String.raw`### Five-number summary and boxplots
**Min, Q1, median, Q3, max.** A **boxplot** draws the box from Q1 to Q3 (the middle 50%) with a line at the median, and whiskers out to the most extreme values that **aren't outliers**; outliers are marked separately (often with an asterisk).

### Mean vs median tells you the shape
- Roughly **symmetric**: mean ≈ median.
- **Skewed right**: mean usually **>** median (the tail pulls the mean).
- **Skewed left**: mean usually **<** median.

### Comparing distributions
Compare **center, variability, shape and outliers** (and gaps/clusters on dotplots and histograms), **using comparative words** ("greater," "less") and context. Boxplots compare center, spread, outliers and skew, but they hide gaps and clusters.

### z-scores
$$z = \frac{x_i - \mu}{\sigma}$$
How many standard deviations a value is above (+) or below (−) the mean. Use the sample mean and SD if the population values are unknown.

${steps({
  title: 'Ana: 82 on a test with mean 70, SD 8. Ben: 88 on a test with mean 80, SD 4. Who did better relative to their class?',
  steps: [
    { title: 'Ana', body: '$z = \\dfrac{82 - 70}{8} = 1.5$' },
    { title: 'Ben', body: '$z = \\dfrac{88 - 80}{4} = 2.0$' },
    { title: 'Compare', body: 'Ben is 2.0 SDs above his mean, Ana 1.5 above hers: Ben did relatively better.' },
  ],
  answer: 'Ben (z = 2.0 vs 1.5)',
})}`,
      blocks: [],
      precheck: {
        question: 'A boxplot\'s box stretches from:',
        choices: ['Q1 to Q3', 'The minimum to the maximum', 'The mean minus one SD to the mean plus one SD', 'The median to the maximum'],
        answer: 0,
        explanations: [
          'Correct. The box holds the middle 50% of the data.',
          'Incorrect. The whiskers reach toward the extremes; the box doesn\'t.',
          'Incorrect. Boxplots use quartiles, not the mean and SD.',
          'Incorrect. That would be only the upper half.',
        ],
      },
      checkpoints: [
        {
          question: 'A distribution has mean 54 and median 47. Its shape is most likely:',
          choices: ['Skewed right', 'Skewed left', 'Symmetric', 'Uniform'],
          answer: 0,
          explanations: [
            'Correct. A mean well above the median suggests a tail of large values pulling it up.',
            'Incorrect. Left skew usually puts the mean below the median.',
            'Incorrect. Symmetric distributions have mean ≈ median.',
            'Incorrect. A uniform distribution is symmetric, so mean ≈ median.',
          ],
        },
        {
          question: 'A value has a z-score of −1.5. This means the value is:',
          choices: [
            '1.5 standard deviations below the mean',
            '1.5 units below the mean',
            'Below the minimum',
            'An outlier by definition',
          ],
          answer: 0,
          explanations: [
            'Correct. Negative z means below the mean; the size counts standard deviations.',
            'Incorrect. A z-score counts standard deviations, not the original units.',
            'Incorrect. A z-score compares a value with the mean, not with the minimum; other values can lie even further below.',
            'Incorrect. The 2-SD rule would need |z| > 2.',
          ],
        },
      ],
      revisit:
        'Boxplot = five-number summary, whiskers to the most extreme non-outliers. Mean > median suggests right skew. Compare center, ' +
        'spread, shape, outliers in context. $z = (x - \\mu)/\\sigma$.',
    },
    {
      id: '1.10',
      ced: '1.10.A–1.10.E',
      title: 'The Investigative Question and Data Collection',
      minutes: 7,
      summary:
        'An investigative question names the variable(s), the analysis (with the parameter and direction for a test or estimate), and the ' +
        'conclusions allowed. A census records everyone; an experiment imposes treatments; an observational study doesn\'t. Random ' +
        'selection allows generalizing to the population; random assignment allows cause-and-effect conclusions.',
      body: String.raw`### Three parts of an investigative question
1. The **variable(s)** of interest, which guide data collection.
2. The **analysis**: for a hypothesis test, the parameter and the direction of the alternative (≠, >, <, association); for a confidence interval, the parameter to estimate.
3. The **conclusions** it allows: which population they apply to, and, for an experiment with random assignment, cause and effect.

### Ways to collect data
| Method | What happens |
|---|---|
| **Census** | Data from **every** member of the population |
| **Experiment** | The researcher **assigns treatments** to experimental units and measures a response |
| **Observational study** | The researcher **records** variables **without imposing** treatments (survey, prospective, retrospective) |

In an experiment: the **explanatory variable** (factor) has levels imposed as **treatments**; the **response variable** is measured afterward; people receiving treatments are **subjects** or **participants**.

- **Prospective** study: select units now and follow them into the future.
- **Retrospective** study: select units now and look at data from their past.

### Confounding
A **confounding variable** is associated with **both** the explanatory and response variables, offering another explanation for the relationship. That's why observational studies usually can't show causation.

### What you're allowed to conclude
| | Random **assignment** | No random assignment |
|---|---|---|
| **Random selection** | Cause and effect, generalize to the population | Association only, generalize to the population |
| **No random selection** | Cause and effect, for units like those studied | Association only, for units like those studied |`,
      blocks: [],
      precheck: {
        question: 'Researchers compare the health records of people who chose to drink green tea with those who didn\'t, without assigning anyone to drink it. This is:',
        choices: ['An observational study', 'An experiment', 'A census', 'A matched pairs experiment'],
        answer: 0,
        explanations: [
          'Correct. No treatment was imposed; people chose for themselves.',
          'Incorrect. An experiment would assign who drinks green tea.',
          'Incorrect. A census measures the entire population.',
          'Incorrect. Matched pairs is a kind of experiment, with assigned treatments.',
        ],
      },
      checkpoints: [
        {
          question: 'An observational study finds that people who own more books tend to earn more. Which is the best reason this doesn\'t show that owning books raises income?',
          choices: [
            'A variable such as education level could be associated with both book ownership and income',
            'The sample size must have been too small',
            'Income is a categorical variable',
            'Observational studies can never find any association',
          ],
          answer: 0,
          explanations: [
            'Correct. Education is a possible confounding variable linked to both, an alternative explanation.',
            'Incorrect. Even a huge observational study can\'t rule out confounding.',
            'Incorrect. Income is quantitative.',
            'Incorrect. They find associations; they just can\'t establish cause.',
          ],
        },
        {
          question: 'Volunteers are randomly assigned to two study methods, and the method with higher average scores wins. To which group can a cause-and-effect conclusion be generalized?',
          choices: [
            'People similar to the volunteers in the study',
            'All students everywhere',
            'No one, because the subjects were volunteers',
            'Only the single best-performing volunteer',
          ],
          answer: 0,
          explanations: [
            'Correct. Random assignment supports cause and effect; without random selection, it applies to people like those studied.',
            'Incorrect. Generalizing to a whole population needs random selection from it.',
            'Incorrect. Random assignment still supports cause and effect for this kind of group.',
            'Incorrect. Conclusions are about the treatment groups, not one person.',
          ],
        },
      ],
      revisit:
        'Investigative question: variable(s), analysis (parameter + direction), conclusions. Census = everyone; experiment = imposed ' +
        'treatments; observational = no treatments. Confounders block causation. Random selection → generalize; random assignment → cause and effect.',
    },
    {
      id: '1.11–1.12',
      ced: '1.11.A–1.12.A',
      title: 'Random Sampling and Problems with Sampling',
      minutes: 7,
      summary:
        'Random sampling methods are simple random, stratified, cluster and systematic, with or without replacement. Bias is a systematic ' +
        'error that pushes a statistic consistently too high or too low: voluntary response, undercoverage, nonresponse and response bias.',
      body: String.raw`### Random sampling methods
| Method | How it works | Good when |
|---|---|---|
| **Simple random sample (SRS)** | Every sample of size $n$ is equally likely (random number generator, names from a hat) | You have a list of the whole population |
| **Stratified** | Split into **homogeneous** groups (strata), take an SRS **within each** | Groups differ on the response; ensures each is represented |
| **Cluster** | Split into **heterogeneous** groups (clusters, each like a mini-population), randomly pick **whole clusters** and survey everyone in them | Saving time and travel |
| **Systematic** | Random start, then every $k$th unit | Units come in a line or list |

**Without replacement**: once chosen, a unit can't be chosen again (the usual case). **With replacement**: it's returned and could be picked again.

Stratified vs cluster: **strata are alike inside** and you sample from **every** stratum; **clusters are mixed inside** and you take **all** of a **few** clusters.

### Bias: systematic error
| Bias | Cause |
|---|---|
| **Voluntary response** | Sample made entirely of volunteers (people with strong opinions respond) |
| **Undercoverage** | Part of the population is left out or less likely to be chosen |
| **Nonresponse** | Chosen individuals don't respond, and they differ from those who do |
| **Response** | Answers tend to be off in one direction: leading or confusing wording, self-reports |

**Convenience** and **voluntary response** samples don't use chance, so they invite bias. A bigger biased sample is still biased.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Stratified random sample', back: 'Divide into similar groups (strata), take an SRS from each.' },
            { front: 'Cluster random sample', back: 'Divide into mixed groups (clusters), randomly choose whole clusters, survey everyone in them.' },
            { front: 'Undercoverage', back: 'Some of the population is left out of, or less likely to get into, the sample.' },
            { front: 'Nonresponse bias', back: 'Selected individuals don\'t respond, and they differ from those who do.' },
            { front: 'Response bias', back: 'Answers are systematically off: leading questions, self-reporting.' },
          ],
        },
      ],
      precheck: {
        question: 'A principal randomly selects 3 homerooms and surveys every student in them. This is a:',
        choices: ['Cluster random sample', 'Stratified random sample', 'Simple random sample', 'Systematic random sample'],
        answer: 0,
        explanations: [
          'Correct. Whole groups (homerooms) are chosen at random and everyone in them is surveyed.',
          'Incorrect. Stratified would sample some students from every homeroom.',
          'Incorrect. An SRS chooses individual students directly.',
          'Incorrect. Systematic picks every kth unit from a list.',
        ],
      },
      checkpoints: [
        {
          question: 'A school wants to estimate average study time and makes sure each grade (9–12) is represented by randomly selecting 25 students from each grade. This is a:',
          choices: ['Stratified random sample', 'Cluster random sample', 'Convenience sample', 'Systematic random sample'],
          answer: 0,
          explanations: [
            'Correct. The grades are strata, and an SRS is taken within each.',
            'Incorrect. A cluster sample would survey entire randomly chosen groups.',
            'Incorrect. The students are chosen at random, not by convenience.',
            'Incorrect. There is no every-kth selection.',
          ],
        },
        {
          question: 'A survey asks, "Don\'t you agree that the unfair parking fee should be removed?" What kind of bias is most likely?',
          choices: ['Response bias from question wording', 'Undercoverage', 'Nonresponse bias', 'Voluntary response bias'],
          answer: 0,
          explanations: [
            'Correct. The leading wording pushes answers in one direction.',
            'Incorrect. Nothing suggests part of the population was left out.',
            'Incorrect. The problem is how people answer, not whether they do.',
            'Incorrect. Nothing says the respondents volunteered.',
          ],
        },
        {
          question: 'An online poll on a news site gets 50,000 responses. Why are its results likely biased?',
          choices: [
            'Respondents chose themselves, so people with strong opinions are overrepresented',
            'The sample is too large to be accurate',
            'Online polls always use stratified sampling',
            'Large samples cause response bias',
          ],
          answer: 0,
          explanations: [
            'Correct. Voluntary response samples don\'t use chance; a large size doesn\'t fix that.',
            'Incorrect. Size doesn\'t cause bias; the selection method does.',
            'Incorrect. Nothing here is stratified, or random.',
            'Incorrect. Response bias comes from wording or self-reporting, not size.',
          ],
        },
      ],
      revisit:
        'SRS, stratified (SRS within similar strata), cluster (all of a few mixed clusters), systematic (every kth). Bias: voluntary ' +
        'response, undercoverage, nonresponse, response. Bigger doesn\'t fix biased.',
    },
    {
      id: '1.13',
      ced: '1.13.A–1.13.D',
      title: 'Experimental Design',
      minutes: 8,
      summary:
        'A well-designed experiment compares at least two treatments (one may be a control), randomly assigns treatments, uses replication ' +
        'and controls extraneous variables. Blinding and placebos limit bias. Designs include completely randomized, randomized block and ' +
        'matched pairs. Random assignment allows cause-and-effect conclusions.',
      body: String.raw`### Four principles
1. **Comparison** of at least two treatment groups (one can be a **control group**, perhaps given a **placebo**).
2. **Random assignment** of treatments to units, making groups as similar as possible on extraneous variables.
3. **Replication**: more than one experimental unit per treatment.
4. **Direct control**: keep potential extraneous variables the same for every unit.

### Blinding and placebos
- **Placebo effect**: the difference between the average response to a placebo and to no treatment.
- **Single-blind**: participants don't know their treatment (or the researchers interacting with them don't).
- **Double-blind**: **neither** the participants **nor** the researchers who interact with them know.

### Designs
| Design | How |
|---|---|
| **Completely randomized** | Assign treatments to all units completely at random |
| **Randomized block** | Group units into **blocks** by a variable that affects the response, then randomly assign treatments **within each block** |
| **Matched pairs** | A block design with **two** treatments: pairs of similar units get one treatment each at random, or each unit gets both in random order |

**Why block?** It separates the variation caused by the blocking variable from the rest, so treatment comparisons are more precise.

### Conclusions
Random assignment reduces confounding, which allows **cause-and-effect** conclusions. If participants are volunteers (common, for ethical reasons), results apply to people **like those in the study**.`,
      blocks: [],
      precheck: {
        question: 'In a double-blind experiment:',
        choices: [
          'Neither the subjects nor the researchers who interact with them know who gets which treatment',
          'Only the subjects don\'t know their treatment',
          'There are two treatment groups',
          'Each subject gets both treatments',
        ],
        answer: 0,
        explanations: [
          'Correct. Both sides are kept unaware, so expectations can\'t affect the response or how it is measured.',
          'Incorrect. That is single-blind.',
          'Incorrect. The number of groups isn\'t what "double" means here.',
          'Incorrect. That describes one version of a matched pairs design.',
        ],
      },
      checkpoints: [
        {
          question: 'A researcher tests two fertilizers on 40 plants: 20 are in a sunny greenhouse and 20 in a shady one. She randomly assigns each fertilizer to 10 plants within each greenhouse. This is a:',
          choices: ['Randomized block design', 'Completely randomized design', 'Matched pairs design', 'Observational study'],
          answer: 0,
          explanations: [
            'Correct. The greenhouses are blocks (sunlight affects growth), and treatments are randomized within each block.',
            'Incorrect. A completely randomized design would ignore the greenhouses when assigning.',
            'Incorrect. Matched pairs uses pairs of units, not two blocks of 20.',
            'Incorrect. Treatments are imposed, so it\'s an experiment.',
          ],
        },
        {
          question: 'What is the main purpose of random assignment in an experiment?',
          choices: [
            'To make the treatment groups roughly equivalent on extraneous variables, so differences can be attributed to the treatments',
            'To allow the results to be generalized to the whole population',
            'To increase the sample size',
            'To make the experiment double-blind',
          ],
          answer: 0,
          explanations: [
            'Correct. Balancing extraneous variables across groups is what allows cause-and-effect conclusions.',
            'Incorrect. Generalizing to a population comes from random selection, not random assignment.',
            'Incorrect. Assignment doesn\'t change how many units there are.',
            'Incorrect. Blinding is a separate step.',
          ],
        },
        {
          question: 'To compare two running shoes, each of 30 runners runs once in each shoe, with the order decided by a coin flip. This is a:',
          choices: ['Matched pairs design', 'Completely randomized design', 'Randomized block design with 30 treatments', 'Census'],
          answer: 0,
          explanations: [
            'Correct. Each runner gets both treatments in random order, a form of matched pairs.',
            'Incorrect. In a completely randomized design each runner would get only one shoe.',
            'Incorrect. There are two treatments; each runner is effectively a block of size two.',
            'Incorrect. A census records an entire population; this is an experiment.',
          ],
        },
      ],
      revisit:
        'Comparison, random assignment, replication, control. Placebo, single- and double-blind. Completely randomized; randomized block ' +
        '(randomize within blocks); matched pairs (two treatments). Random assignment → cause and effect.',
    },
  ],
};

export default pack;
