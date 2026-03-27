// AP Statistics curriculum data
const statistics = {
  name: "AP Statistics",
  description: "Equivalent to a one-semester, introductory, non-calculus-based college course in statistics. Students develop strategies for collecting, organizing, analyzing, and drawing conclusions from data.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 40, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 6, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Variation and Distribution: How can we describe patterns in data?",
    "Patterns and Uncertainty: How can probability help us make decisions when we don't know what will happen?",
    "Data-based Predictions: How can we use data to make predictions?",
    "Statistical Inference: How confident can we be about our conclusions?"
  ],
  units: [
    {
      name: "Unit 1: Exploring One-Variable Data",
      weight: "15-23%",
      topics: [
        "Introduction to data",
        "Graphical representations of data",
        "Describing distributions numerically",
        "Summary statistics",
        "Comparing and contrasting data displays"
      ],
      keyConcepts: [
        "Types of data: categorical vs. quantitative",
        "Graphical displays: histograms, boxplots, dot plots",
        "Shape, center, spread, and outliers",
        "Measures of center: mean, median, mode",
        "Measures of spread: range, IQR, standard deviation",
        "Percentiles and quartiles",
        "Empirical rule and z-scores"
      ],
      essentialKnowledge: [
        "Different types of data require different analysis methods",
        "Graphical displays reveal patterns in data",
        "Distributions have shape, center, and spread",
        "Outliers can significantly affect summary statistics",
        "Standard deviation measures typical deviation from mean"
      ]
    },
    {
      name: "Unit 2: Exploring Two-Variable Data",
      weight: "5-7%",
      topics: [
        "Scatterplots and correlation",
        "Least-squares regression",
        "Assessing the fit of a line",
        "Residuals"
      ],
      keyConcepts: [
        "Scatterplots and association patterns",
        "Correlation coefficient and its properties",
        "Least-squares regression line",
        "Slope and y-intercept interpretation",
        "Coefficient of determination (r²)",
        "Residual analysis and patterns",
        "Influential points and outliers"
      ],
      essentialKnowledge: [
        "Correlation measures strength of linear association",
        "Regression line minimizes sum of squared residuals",
        "Residuals help assess model fit",
        "Correlation does not imply causation",
        "Outliers and influential points affect regression"
      ]
    },
    {
      name: "Unit 3: Collecting Data",
      weight: "12-15%",
      topics: [
        "Planning a study",
        "Sampling and surveys",
        "Experiments",
        "Observational studies vs. experiments"
      ],
      keyConcepts: [
        "Population vs. sample",
        "Sampling methods: simple random, stratified, cluster",
        "Sampling bias and non-response bias",
        "Experimental design principles",
        "Randomization, control, and replication",
        "Confounding variables",
        "Types of studies: observational vs. experimental",
        "Scope of conclusions: causation vs. association"
      ],
      essentialKnowledge: [
        "Good sampling methods reduce bias",
        "Random sampling allows generalization to population",
        "Random assignment allows causal conclusions",
        "Confounding variables threaten validity",
        "Study design determines scope of conclusions"
      ]
    },
    {
      name: "Unit 4: Probability, Random Variables, and Probability Distributions",
      weight: "10-20%",
      topics: [
        "Introduction to probability",
        "Combining probabilities",
        "Random variables and probability distributions",
        "Binomial distributions",
        "Geometric distributions"
      ],
      keyConcepts: [
        "Basic probability rules and notation",
        "Addition and multiplication rules",
        "Conditional probability and independence",
        "Discrete random variables",
        "Expected value and variance",
        "Binomial distribution and its properties",
        "Geometric distribution and its properties",
        "Normal distribution as approximation"
      ],
      essentialKnowledge: [
        "Probability quantifies uncertainty",
        "Probability rules enable complex calculations",
        "Random variables describe numerical outcomes",
        "Binomial distribution models fixed number of trials",
        "Expected value is long-run average"
      ]
    },
    {
      name: "Unit 5: Sampling Distributions",
      weight: "7-12%",
      topics: [
        "Introduction to sampling distributions",
        "Sampling distribution of a sample proportion",
        "Sampling distribution of a sample mean"
      ],
      keyConcepts: [
        "Sampling distribution concept",
        "Distribution of sample proportions",
        "Distribution of sample means",
        "Central Limit Theorem",
        "Standard error calculations",
        "Normal approximation conditions",
        "Sampling distribution properties"
      ],
      essentialKnowledge: [
        "Sampling distributions describe variability of statistics",
        "Central Limit Theorem enables normal approximations",
        "Sample size affects sampling distribution spread",
        "Sampling distributions are fundamental to inference",
        "Standard error measures typical sampling variability"
      ]
    },
    {
      name: "Unit 6: Inference for Categorical Data: Proportions",
      weight: "12-15%",
      topics: [
        "Confidence intervals for proportions",
        "Hypothesis tests for proportions",
        "Inference for difference of proportions"
      ],
      keyConcepts: [
        "Confidence interval construction and interpretation",
        "Margin of error and confidence level",
        "Hypothesis test steps and components",
        "Type I and Type II errors",
        "P-values and statistical significance",
        "One-sample and two-sample proportion tests",
        "Conditions for inference procedures"
      ],
      essentialKnowledge: [
        "Confidence intervals estimate population parameters",
        "Hypothesis tests evaluate claims about parameters",
        "P-values measure evidence against null hypothesis",
        "Conditions must be met for valid inference",
        "Statistical significance differs from practical significance"
      ]
    },
    {
      name: "Unit 7: Inference for Quantitative Data: Means",
      weight: "12-15%",
      topics: [
        "Confidence intervals for means",
        "Hypothesis tests for means",
        "Inference for difference of means",
        "Paired data"
      ],
      keyConcepts: [
        "t-distribution and its properties",
        "One-sample t-procedures",
        "Two-sample t-procedures",
        "Paired t-procedures",
        "Degrees of freedom",
        "Pooled vs. unpooled procedures",
        "Assumptions and conditions for t-procedures"
      ],
      essentialKnowledge: [
        "t-distribution is used when σ is unknown",
        "Degrees of freedom affect t-distribution shape",
        "Paired data requires different analysis",
        "Two-sample procedures compare groups",
        "Assumptions must be checked before inference"
      ]
    },
    {
      name: "Unit 8: Inference for Categorical Data: Chi-Square",
      weight: "2-5%",
      topics: [
        "Chi-square goodness of fit test",
        "Chi-square test of independence/homogeneity"
      ],
      keyConcepts: [
        "Chi-square distribution",
        "Goodness of fit test procedures",
        "Test of independence procedures",
        "Test of homogeneity procedures",
        "Expected counts and degrees of freedom",
        "Conditions for chi-square tests"
      ],
      essentialKnowledge: [
        "Chi-square tests work with categorical data",
        "Expected counts must be sufficiently large",
        "Independence and homogeneity tests similar but different",
        "Chi-square statistic measures deviation from expected",
        "Degrees of freedom depend on table dimensions"
      ]
    },
    {
      name: "Unit 9: Inference for Quantitative Data: Slopes",
      weight: "2-5%",
      topics: [
        "Confidence intervals for slope",
        "Hypothesis tests for slope"
      ],
      keyConcepts: [
        "Linear regression model assumptions",
        "Standard error of slope",
        "t-procedures for slope",
        "Confidence intervals for slope",
        "Hypothesis tests about slope",
        "Regression conditions: LINEAR, independent, normal, equal variance, random"
      ],
      essentialKnowledge: [
        "Regression inference requires specific conditions",
        "Slope inference uses t-distribution",
        "Confidence intervals estimate true slope",
        "Hypothesis tests can test for no linear relationship",
        "Residual analysis helps check conditions"
      ]
    }
  ],
  keySkills: [
    "Statistical Analysis: Analyze patterns in data using appropriate methods",
    "Probability: Calculate and interpret probabilities",
    "Simulation: Use simulation to explore statistical concepts",
    "Inference: Construct and interpret confidence intervals and hypothesis tests",
    "Communication: Interpret statistical results in context",
    "Technology: Use statistical software and calculators effectively"
  ],
  studyTips: [
    "Master the interpretation of statistical results in context",
    "Practice identifying when to use different procedures",
    "Understand the logic behind confidence intervals and hypothesis tests",
    "Learn to check conditions for statistical procedures",
    "Practice reading and interpreting statistical output",
    "Understand the difference between statistical and practical significance",
    "Master probability rules and their applications",
    "Practice designing studies and identifying potential sources of bias",
    "Learn to communicate statistical findings clearly",
    "Understand the relationship between sample size and margin of error"
  ],
  commonTopics: [
    "Describing distributions with shape, center, and spread",
    "Correlation and regression analysis",
    "Experimental design vs. observational studies",
    "Probability calculations and rules",
    "Binomial and normal distribution applications",
    "Central Limit Theorem applications",
    "Confidence interval construction and interpretation",
    "Hypothesis test procedures and p-value interpretation",
    "Two-sample procedures for means and proportions",
    "Chi-square tests for categorical data",
    "Linear regression inference",
    "Type I and Type II error concepts"
  ]
};

export default statistics;
