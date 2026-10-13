/**
 * AP Research Big Idea 1: Question and Explore — study pack.
 *
 * Written against the AP Research CED effective Fall 2024 (the current
 * edition; EU 1.1–1.5 with LO 1.1A–1.1E, 1.2A, 1.3A, 1.4A, 1.5A–1.5D).
 * AP Research is scored on the Academic Paper (75%) and Presentation and Oral
 * Defense (25%), not by unit. Builds on AP Seminar's version of this big idea
 * with the research-specific parts: purpose, scholarly conversation, scope,
 * methods, sampling, coding, perseverance and research ethics (IRB).
 * Activities: a Boolean database search and a methods sort.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-research/unit-1',
  subject: 'AP Research',
  unit: 'Big Idea 1: Question and Explore',
  examWeight: 'no unit weighting (Academic Paper 75%, Presentation and Oral Defense 25%)',
  intro:
    'A year-long inquiry begins here: choosing a topic, defining the purpose of your research and its place in the scholarly ' +
    'conversation, refining a focused question, finding and judging sources, choosing methods that fit, planning for setbacks, and ' +
    'conducting research ethically.',
  sections: [
    {
      id: '1.1',
      ced: 'EU 1.1; LO 1.1A–1.1E',
      title: 'Topic, Purpose, and Research Question',
      minutes: 8,
      summary:
        'Topics come from personal interest, passion for a field, wanting to understand something, or wanting to address a problem. ' +
        'Explore the existing knowledge and adjust scope to your resources. Scholars explore, explain and create, addressing practical, ' +
        'theoretical, interpretive or aesthetic problems, and situate their work in the scholarly conversation. A focused question ' +
        'emerges from that purpose and needs several revisions for scope and feasibility.',
      body: String.raw`### Where topics come from
Personal interest, passion for a discipline, a desire to understand something better, or a desire to **address an issue in the world**. Then:
- explore the **existing knowledge base**, including a variety of perspectives;
- **adjust the scope** to the project's parameters, requirements and resources;
- follow the **connections** you discover; they spark new questions.

### Purpose: explore, explain, create
| Scholars… | Example question or goal |
|---|---|
| **Explore** | How do first-generation students describe the transition to college? |
| **Explain** | What is the relationship between sleep duration and reaction time in teen athletes? |
| **Create** | Design and test a low-cost water filter for rural households |

Inquiry addresses different **kinds of problems**: **practical**, **theoretical**, **interpretive**, **aesthetic**. It can **corroborate, challenge or extend** an existing idea.

### Joining the scholarly conversation
Your research should be situated within what the **scholarly community** already knows and should matter to that community. That is why you read existing studies first: to find the **gap** your work addresses.

### Revising the question
A research question or project goal **emerges from your purpose** and usually needs **multiple revisions** for **scope and feasibility** (time, resources):
1. Draft: *How does social media affect teens?* (far too broad)
2. Revision: *How does Instagram use affect self-esteem in teenage girls?* (narrower)
3. Feasible: *What is the relationship between daily Instagram use and self-reported self-esteem among 11th-grade girls at two suburban high schools?*`,
      blocks: [],
      precheck: {
        question: 'According to the AP Research CED, scholars:',
        choices: ['Explore, explain and create', 'Only summarize existing studies', 'Only conduct experiments', 'Avoid revising their questions'],
        answer: 0,
        explanations: [
          'Correct. Those are the three purposes of scholarly inquiry (EK 1.1D1).',
          'Incorrect. Summary alone isn\'t research.',
          'Incorrect. Experiments are only one method.',
          'Incorrect. Questions often need multiple revisions.',
        ],
      },
      checkpoints: [
        {
          question: 'Why should a research question usually be revised several times?',
          choices: [
            'To make it appropriate in scope and feasible with the available time and resources',
            'To make it longer',
            'Because the first draft must always be discarded',
            'To avoid having to read sources',
          ],
          answer: 0,
          explanations: [
            'Correct. That is EK 1.1E2.',
            'Incorrect. Length isn\'t the goal; focus is.',
            'Incorrect. Revision refines; it doesn\'t require starting over.',
            'Incorrect. Reading sources informs revision.',
          ],
        },
        {
          question: 'Why do researchers review existing studies before finalizing a question?',
          choices: [
            'To situate their inquiry in the scholarly conversation and find a gap',
            'To copy a previous study\'s conclusion',
            'Because the CED requires 50 sources',
            'To avoid any connection to other research',
          ],
          answer: 0,
          explanations: [
            'Correct. Inquiry should be relevant to the scholarly community (EK 1.1D3).',
            'Incorrect. That isn\'t new inquiry.',
            'Incorrect. There is no such number.',
            'Incorrect. Connection to existing work is the point.',
          ],
        },
      ],
      revisit:
        'Topics from interest, discipline, curiosity, real problems. Adjust scope to resources. Purpose: explore, explain, create; ' +
        'practical, theoretical, interpretive, aesthetic problems; join the scholarly conversation. Revise the question for scope and feasibility.',
    },
    {
      id: '1.2–1.3',
      ced: 'EU 1.2–1.3; LO 1.2A, 1.3A',
      title: 'Prior Knowledge and Managing Information',
      minutes: 6,
      summary:
        'Use and question what you already know; inquiry can confirm or challenge it. Sources may be secondary or primary (including ' +
        'your own data). Search databases and libraries with keywords, Boolean logic and filters; mine bibliographies; use social media ' +
        'carefully; manage citations with software and analyze surveys and large data sets with tools.',
      body: String.raw`### Prior knowledge
Understanding comes from **experience, sources, cultural context and assumptions**. Map what you know (brainstorming, concept maps, prewriting) and be ready for inquiry to **confirm or challenge** it.

### Finding sources
- **Primary**: original texts and works, artifacts, and **your own data** (experiments, surveys, interviews, observations).
- **Secondary**: articles, studies, analyses, reports.
- **Databases and libraries**: EBSCO, ProQuest, JSTOR, Google Scholar.
- **Search technique**: keywords, **Boolean logic** (AND, OR, NOT), advanced filters (date, peer review, type).
- **Bibliographies** of good sources point you to more sources.
- **Social media** can be a source, but understand its **limits** to stay credible.

### Managing it all
- Citation and reference tools (e.g., Word, EndNote, citation generators, WorldCat) to catalog sources and build bibliographies.
- Survey and statistics tools (e.g., SurveyMonkey, SPSS) to collect responses and analyze large data sets.`,
      blocks: [{ type: 'sim', sim: 'boolean-search' }],
      precheck: {
        question: 'A researcher finds a highly relevant journal article. What is a quick way to find more good sources?',
        choices: [
          'Check the article\'s bibliography',
          'Search only social media',
          'Use the article\'s title as their research question',
          'Stop searching',
        ],
        answer: 0,
        explanations: [
          'Correct. Bibliographies point to related scholarship (EK 1.3A4).',
          'Incorrect. Social media has limits as a source.',
          'Incorrect. Their question should come from their own purpose.',
          'Incorrect. One source isn\'t enough.',
        ],
      },
      checkpoints: [
        {
          question: 'Which statement about social media as a source is consistent with the CED?',
          choices: [
            'It can be used, but its limitations must be understood to keep credibility',
            'It is never allowed',
            'It is always as credible as peer-reviewed research',
            'It replaces the need for databases',
          ],
          answer: 0,
          explanations: [
            'Correct. That is EK 1.3A5.',
            'Incorrect. The CED allows it with caution.',
            'Incorrect. Credibility varies widely.',
            'Incorrect. Databases remain essential.',
          ],
        },
        {
          question: 'Which tool would a researcher most likely use to analyze responses from 400 survey participants?',
          choices: ['Statistical software such as SPSS', 'A citation generator', 'A word processor\'s spell check', 'WorldCat'],
          answer: 0,
          explanations: [
            'Correct. The CED names tools like SPSS for large data sets.',
            'Incorrect. That formats citations.',
            'Incorrect. That doesn\'t analyze data.',
            'Incorrect. WorldCat catalogs library holdings.',
          ],
        },
      ],
      revisit:
        'Use and question prior knowledge. Primary (incl. your data) vs. secondary sources. Databases, Boolean logic, filters, ' +
        'bibliographies; social media with caution. Citation managers; survey and statistics tools.',
    },
    {
      id: '1.4',
      ced: 'EU 1.4; LO 1.4A',
      title: 'Credibility, Generalizability, and Self-Reported Data',
      minutes: 5,
      summary:
        'Scope, purpose and source credibility shape how far conclusions generalize. Credible evidence is relevant and reliable. Judge ' +
        'authors, publishers and sponsors, their perspective and methods, and how others respond; peer review is a strong signal. Data on ' +
        'behaviors and attitudes depend on respondents\' honesty and memory and on the instrument\'s design.',
      body: String.raw`### Credibility checklist
**Relevant**, **current**, **authoritative**; the author's, publisher's or sponsor's **credentials and reputation**; their **perspective and methods**; how **other scholars respond**; **peer review** by experts.

### How far can you generalize?
Your **scope and purpose** and your **sources' credibility** limit how widely your conclusions apply. A survey of one school's seniors can't speak for all U.S. teenagers.

### Data about people
When you gather data on **behaviors, attitudes and preferences**, accuracy depends on:
- respondents' and observers' **honesty**, **memory** and **reliability**, and
- the **design of your instrument** (question wording, order, scales).

Example: asking "How many hours did you spend on your phone last week?" relies on memory; screen-time logs are more reliable. Leading wording ("Don't you agree phones are harmful?") biases answers.`,
      blocks: [],
      precheck: {
        question: 'Why might students\' self-reported hours of sleep be inaccurate?',
        choices: [
          'Self-reports depend on respondents\' memory and honesty',
          'Sleep can\'t be measured at all',
          'Surveys always produce perfect data',
          'Only adults can answer surveys',
        ],
        answer: 0,
        explanations: [
          'Correct. EK 1.4A4 names honesty, memory and reliability.',
          'Incorrect. Sleep can be measured, e.g., with trackers.',
          'Incorrect. Survey data has known limits.',
          'Incorrect. Students can be surveyed with proper approval.',
        ],
      },
      checkpoints: [
        {
          question: 'A researcher surveys 30 students in one robotics club. What is the main limit on the conclusions?',
          choices: [
            'They can\'t be generalized to all high school students',
            'They are automatically invalid',
            'They prove a cause-and-effect relationship',
            'They apply to every country',
          ],
          answer: 0,
          explanations: [
            'Correct. The sample\'s scope limits generalizability.',
            'Incorrect. They can be valid for that group.',
            'Incorrect. A survey alone rarely shows causation.',
            'Incorrect. That is a massive overgeneralization.',
          ],
        },
        {
          question: 'Which survey question is best designed?',
          choices: [
            'On average, how many hours do you sleep on school nights? (0–4, 5–6, 7–8, 9+)',
            'Don\'t you agree teens need more sleep?',
            'Why is your sleep so bad?',
            'Do you sleep and eat well?',
          ],
          answer: 0,
          explanations: [
            'Correct. Neutral wording with clear categories.',
            'Incorrect. It is a leading question.',
            'Incorrect. It assumes a negative answer.',
            'Incorrect. It asks two things at once.',
          ],
        },
      ],
      revisit:
        'Credibility: relevant, current, authoritative; credentials, perspective, methods, reception, peer review. Scope limits ' +
        'generalizability. Self-reported data depends on honesty, memory and instrument design.',
    },
    {
      id: '1.5',
      ced: 'EU 1.5; LO 1.5A–1.5D',
      title: 'Methods, Perseverance, and Ethics',
      minutes: 9,
      summary:
        'Framing determines what information you need. Methods must align with the question: qualitative, quantitative, mixed, or ' +
        'artistic processes. Justify your sample and know its limits; analyze with descriptive or inferential statistics; code data for ' +
        'themes; triangulate. Plan for deadlines and setbacks, seek expert advice while staying self-sufficient, and follow ethics: IRB approval for human subjects, copyright and patent rules.',
      body: String.raw`### Choosing a method
Methods for collecting and analyzing data must **align with your question or goal**.
| Approach | Examples |
|---|---|
| **Qualitative** | Open-ended survey questions, interviews, observational notes, interpretation of texts |
| **Quantitative** | Precise measurements, modeling, structured and validated instruments |
| **Mixed** | Both, combined to **triangulate** (corroborate patterns from more than one kind of data) |
| **Artistic process** | Workshopping, storyboarding, composing, choreographing, staging, model-making, plus research elements |

### Analyzing
- Explain **why** you chose your **sample** (people, information or artifacts) and the **limits** of what you can infer from it.
- Use **descriptive** statistics (means, percentages, graphs) or **inferential** statistics (tests that generalize from a sample).
- **Code** qualitative data: organize and categorize it to find patterns or themes.
- Adjust tools, methods or course of inquiry as you learn about **scope and feasibility**.

### Perseverance
Plan carefully around **deadlines, priorities, risks, setbacks** and **other people's availability**. Setbacks are **inevitable**: focus on the essential goals and be ready to try another approach or discipline. **Experts** can advise you, but you must remain **self-sufficient**.

### Ethics
- Researchers have **ethical and moral responsibilities**.
- Research with **humans** (or animals) follows laws and guidelines: get approval from an **Institutional Review Board (IRB)** before collecting data from people.
- **Copyright and patent** law governs using others' instruments, work, personal information and intellectual property.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which approach is each research plan?',
            buckets: ['Qualitative', 'Quantitative', 'Mixed methods'],
            items: [
              { label: 'Interview 12 nurses about burnout and code the transcripts for themes', bucket: 0, why: 'Open-ended interviews analyzed for themes.' },
              { label: 'Measure reaction times of 60 athletes after different hours of sleep', bucket: 1, why: 'Precise measurements analyzed numerically.' },
              { label: 'Survey 300 students on screen time, then interview 10 of them about why', bucket: 2, why: 'Numbers plus interviews to triangulate.' },
              { label: 'Analyze themes of exile in five novels', bucket: 0, why: 'Interpretation of texts.' },
              { label: 'Compare graduation rates across 40 districts before and after a policy', bucket: 1, why: 'Structured numerical data.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Before surveying classmates for a research project, a student must:',
        choices: [
          'Get approval from an Institutional Review Board (IRB)',
          'Publish the results',
          'Ask only friends',
          'Collect data first and seek approval later',
        ],
        answer: 0,
        explanations: [
          'Correct. Research with humans requires IRB approval (EK 1.5D2).',
          'Incorrect. Publishing comes after the research.',
          'Incorrect. That biases the sample and doesn\'t address ethics.',
          'Incorrect. Approval must come before data collection.',
        ],
      },
      checkpoints: [
        {
          question: 'A researcher combines survey statistics with interview themes to check whether they point the same way. This is:',
          choices: ['Triangulation', 'Plagiarism', 'Peer review', 'An artistic process'],
          answer: 0,
          explanations: [
            'Correct. Combining data types to corroborate patterns (EK 1.5B10).',
            'Incorrect. Nothing is copied.',
            'Incorrect. Peer review is expert evaluation of published work.',
            'Incorrect. This is a research method.',
          ],
        },
        {
          question: 'Halfway through, a researcher\'s planned participants drop out. What does the CED advise?',
          choices: [
            'Expect setbacks, focus on the essential goals, and try an alternate approach',
            'Abandon the project immediately',
            'Invent the missing data',
            'Change the question to something unrelated',
          ],
          answer: 0,
          explanations: [
            'Correct. That is EK 1.5C2.',
            'Incorrect. Perseverance is part of the inquiry.',
            'Incorrect. That is research misconduct.',
            'Incorrect. Adjust methods, not the essential goal.',
          ],
        },
      ],
      revisit:
        'Align methods with the question: qualitative, quantitative, mixed (triangulate), artistic. Justify the sample; descriptive or ' +
        'inferential statistics; code data. Plan for setbacks; seek advice but stay self-sufficient. IRB for human subjects; copyright and patents.',
    },
  ],
};

export default pack;
