// AP Statistics curriculum data
const statistics = {
  name: "AP Statistics",
  description: "Equivalent to a one-semester, introductory, non-calculus-based college course in statistics. Students develop strategies for collecting, organizing, analyzing, and drawing conclusions from data.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 42, time: "90 minutes", weight: "50%" },
      { name: "Free Response", questions: 4, time: "90 minutes", weight: "50%" }
    ]
  },
  bigIdeas: [
    "Variation and Distribution: How can we describe patterns in data?",
    "Patterns and Uncertainty: How can probability help us make decisions when we don't know what will happen?",
    "Data-based Predictions: How can we use data to make predictions?",
    "Statistical Inference: How confident can we be about our conclusions?"
  ],
  // REVISED for 2026-27. The framework consolidated NINE units into FIVE and the
  // exam went fully digital (42 MCQ, four 10-point FRQs). Unit weightings below
  // are the CED's published ranges. The old nine-unit list — separate units for
  // Two-Variable Data, Collecting Data, Sampling Distributions, Chi-Square and
  // Slopes — no longer matches what students are taught or tested on.
  units: [
    {
      name: "Unit 1: Exploring One-Variable Data and Collecting Data",
      weight: "20-30%",
      topics: ["Introducing Statistics: What Can We Learn from Data?", "Variables", "SKILLS", "Graphical Representations for One Quantitative Variable", "SKILLS", "SKILLS", "Graphical Representations of Summary Statistics for One Quantitative", "SKILLS", "SKILLS", "Random Sampling", "Potential Problems with Sampling", "SKILLS"]
    },
    {
      name: "Unit 2: Probability, Random Variables, and Probability Distributions",
      weight: "15-25%",
      topics: ["SKILLS", "Estimating Probabilities Using Simulation", "SKILLS", "Mutually Exclusive Events", "SKILLS", "Independent Events and Unions of Events", "SKILLS", "Parameters of Random Variables", "The Binomial Distribution", "The Normal Distribution", "SKILLS"]
    },
    {
      name: "Unit 3: Inference for Categorical Data: Proportions",
      weight: "15-25%",
      topics: ["Estimators", "SKILLS", "Constructing a Confidence Interval for a Population Proportion", "Setting Up a Test for a Population Proportion", "Carrying Out a Test for a Population Proportion", "Potential Errors When Performing Tests", "Sampling Distributions for the Difference Between Sample Proportions", "Setting Up a Chi-Square Test for Homogeneity or Independence", "Carrying Out a Chi-Square Test for Homogeneity or Independence"]
    },
    {
      name: "Unit 4: Inference for Quantitative Data: Means",
      weight: "10-20%",
      topics: ["SKILLS", "SKILLS", "Justifying a Claim Based on a Confidence Interval for a Population", "Setting Up a Test for a Population Mean or Population Mean Difference", "Sampling Distributions for the Difference Between Two Sample Means", "Setting Up a Test for the Difference Between Two Population Means", "Carrying Out a Test for the Difference Between Two Population Means"]
    },
    {
      name: "Unit 5: Regression Analysis",
      weight: "10-20%",
      topics: ["Graphical Representations Between Two Quantitative Variables", "Correlation", "SKILLS", "Residuals", "SKILLS"]
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
