// AP Business with Personal Finance curriculum data
//
// Units, topics, class-period pacing and exam weightings taken from the 2026
// Course and Exam Description (public/ced/ap-business-personal-finance-course-
// and-exam-description.pdf), "Course at a Glance", pp. 17-18.
//
// Unit 5 carries NO exam weighting on purpose: the CED states it "is designed
// to be taught either before or after the AP Exam ... and is not assessed on
// the AP Exam." It is included because students still take it, but anything
// that studies for the exam should treat Units 1-4 as the assessed content.
const businessPersonalFinance = {
  name: "AP Business with Personal Finance",
  description: "An introductory college-level survey of business — entrepreneurship, marketing, finance, accounting, management and strategy — taught through real business cases, alongside the personal finance skills to manage your own money. Includes the Business Canvas Project and the Financial Advisor Project.",
  examFormat: {
    duration: "3 hours",
    sections: [
      { name: "Multiple Choice", questions: 60, time: "70 minutes", weight: "60%" },
      { name: "Business Canvas Project Validation", questions: 1, time: "25 minutes", weight: "15%" },
      { name: "Free Response", questions: 3, time: "65 minutes", weight: "25%" }
    ]
  },
  bigIdeas: [
    "Concept Application: apply business concepts to authentic situations",
    "Entrepreneurship: identify opportunity and build a viable business model",
    "Decision Making: weigh evidence and trade-offs to choose a course of action",
    "Communication: explain business reasoning clearly to an audience",
    "Collaboration: work with others to reach a business goal"
  ],
  units: [
    {
      name: "Unit 1: Businesses, Competition, and New Ideas",
      weight: "20-30%",
      classPeriods: 37,
      topics: ["What Is a Business?", "Markets and Competitive Advantage BUSINESS CASE", "PESTEL Factors and the Business Environment BUSINESS CASE", "How Do Business Ideas Originate?", "Vision", "Business Ethics", "Organization, Roles, and Responsibilities PERSONAL FINANCE LINK", "Supply Chains"]
    },
    {
      name: "Unit 2: Marketing",
      weight: "20-30%",
      classPeriods: 34,
      topics: ["Marketing to Customers", "Consumer Behavior", "Market Research", "Product", "Price", "Place and Channels", "Promotion and Marketing Communications BUSINESS CASE"]
    },
    {
      name: "Unit 3: Personal Saving and Borrowing; Business Finance and Accounting",
      weight: "25-35%",
      classPeriods: 35,
      topics: ["Part 1", "Part 1", "Part 2", "Part 2", "Part 2", "Part 2", "Part 2", "The Cash Flow Statement BUSINESS CASE", "Ethics and Financial Reporting BUSINESS CASE"]
    },
    {
      name: "Unit 4: Management and Strategy",
      weight: "15-20%",
      classPeriods: 30,
      topics: ["Management and Leadership BUSINESS CASE", "Evaluating Performance Using KPIs BUSINESS CASE", "Strategy and Decision Making BUSINESS CASE"]
    },
    {
      name: "Unit 5: Personal Goals, Budgeting, and Investing",
      weight: "Not assessed on the AP Exam",
      classPeriods: 24,
      topics: ["Taxes, Net Income, and Budgeting PERSONAL FINANCE LINK", "Managing Personal Risk PERSONAL FINANCE LINK", "Saving and Investing for Education, Housing, and Retirement Goals"]
    }
  ],
  studyTips: [
    "Units 1-4 are what the exam assesses — Unit 5 is taught around the exam, not on it",
    "Learn the business cases: the exam rewards applying concepts to a real scenario, not reciting definitions",
    "Be able to read an income statement, a balance sheet, and a cash flow statement and say what each one tells you",
    "Practise the Business Canvas Project language — one whole free-response question validates your own project",
    "Use the task verbs (identify, explain, justify) literally; a 'justify' answer needs evidence and reasoning"
  ]
};

export default businessPersonalFinance;
