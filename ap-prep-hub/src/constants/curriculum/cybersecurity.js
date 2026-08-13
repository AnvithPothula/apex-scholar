// AP Cybersecurity curriculum data
//
// Units, topics and pacing from the 2026 Course and Exam Description
// (public/ced/ap-cybersecurity-course-and-exam-description.pdf), "Course at a
// Glance", pp. 18-19. Exam format from the AP Central exam page.
//
// College Board does not publish per-unit exam weightings for this course, so
// none are claimed here — class-period pacing is given instead, which is what
// the CED actually states.
const cybersecurity = {
  name: "AP Cybersecurity",
  description: "An introductory college-level cybersecurity course: how attacks work and how to stop them, across physical spaces, networks, devices, applications and data. Part of AP Career Kickstart, taught through hands-on risk analysis rather than memorization.",
  examFormat: {
    duration: "2 hours",
    sections: [
      { name: "Multiple Choice", questions: 60, time: "80 minutes", weight: "70%" },
      { name: "Free Response (Device Security Analysis)", questions: 1, time: "40 minutes", weight: "30%" }
    ]
  },
  bigIdeas: [
    "Analyze Risk: identify vulnerabilities and judge how serious they are",
    "Mitigate Risk: choose and apply controls that actually reduce exposure",
    "Detect Attacks: read logs and signals to spot an intrusion",
    "Collaborate: work with others to secure a system"
  ],
  units: [
    {
      name: "Unit 1: Introduction to Security",
      weight: "Not published by College Board",
      classPeriods: 10,
      topics: ["Understanding Social Engineering", "Suspicious Website Logins", "Best Practices for Public Networks", "AI-Based Cybersecurity Attacks", "Leveraging AI in Cyber Defense"]
    },
    {
      name: "Unit 2: Securing Spaces",
      weight: "Not published by College Board",
      classPeriods: 21,
      topics: ["Cyber Foundations", "Physical Vulnerabilities and Attacks", "Protecting Physical Spaces", "Detecting Physical Attacks"]
    },
    {
      name: "Unit 3: Securing Networks",
      weight: "Not published by College Board",
      classPeriods: 26,
      topics: ["Network Vulnerabilities and Attacks", "Protecting Networks: Managerial Controls and Wireless Security", "Protecting Networks: Segmentation", "Protecting Networks: Firewalls", "Detecting Network Attacks"]
    },
    {
      name: "Unit 4: Securing Devices",
      weight: "Not published by College Board",
      classPeriods: 23,
      topics: ["Device Vulnerabilities and Attacks", "Authentication", "Protecting Devices", "Detecting Attacks on Devices"]
    },
    {
      name: "Unit 5: Securing Applications and Data",
      weight: "Not published by College Board",
      classPeriods: 30,
      topics: ["Application and Data Vulnerabilities and Attacks", "Protecting Stored Data with Cryptography", "Asymmetric Cryptography", "Protecting Applications", "Detecting Attacks on Data and Applications"]
    }
  ],
  studyTips: [
    "The exam is scenario-based — practise reading a situation and naming the vulnerability, not reciting definitions",
    "The single free-response question is a Device Security Analysis: be fluent reading logs and policies for what is wrong",
    "Learn the four skills as a cycle: analyze risk, mitigate it, detect the attack, then collaborate on the response",
    "Cryptography (Unit 5) carries the most class periods — symmetric vs asymmetric is worth real practice",
    "Know how AI shows up on both sides: as an attack tool and as a defensive one (Unit 1)"
  ]
};

export default cybersecurity;
