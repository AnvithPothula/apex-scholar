/**
 * AP Seminar Big Idea 1: Question and Explore — study pack.
 *
 * Written against the AP Seminar CED effective Fall 2024 (the current
 * edition; EU 1.1–1.5, LO 1.1A–1.5A). AP Seminar is organized by big ideas
 * rather than units, and scored on two performance tasks and an exam, not
 * by unit. Activities: a Boolean database search over invented records, a
 * primary-vs-secondary source sort, and a research-question sort.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-seminar/unit-1',
  subject: 'AP Seminar',
  unit: 'Big Idea 1: Question and Explore',
  examWeight: 'no unit weighting (Team Project 20%, Individual Research-Based Essay and Presentation 35%, End-of-Course Exam 45%)',
  intro:
    'Inquiry starts with curiosity. This big idea covers how to place an issue in context, ask a question that captures its complexity, ' +
    'use what you already know, find sources with good search strategies, judge their credibility, and choose the information your ' +
    'question actually needs.',
  sections: [
    {
      id: '1.1',
      ced: 'EU 1.1; LO 1.1A–1.1B',
      title: 'Contextualizing an Issue and Posing Questions',
      minutes: 7,
      summary:
        'Personal interest and curiosity drive investigation. Inquiry begins by narrowing your interest, identifying a problem and its ' +
        'origins, and placing it in a larger context. Effective research questions capture the issue\'s complexity and invite multiple, ' +
        'divergent or contradictory perspectives.',
      body: String.raw`### From interest to issue
1. **Narrow** a broad interest (sleep → teen sleep → school start times).
2. **Identify a problem or issue** and **where it comes from** (early bus schedules, after-school jobs, biology of adolescent sleep).
3. **Situate it in a larger context**: health, education policy, economics, family life.

Examining **other people's perspectives** often raises questions for further investigation.

### What makes a strong research question
| Weak | Why | Stronger |
|---|---|---|
| Is sleep good? | Answer is obvious; no complexity | How do later school start times affect the academic and health outcomes of high school students? |
| What time does my school start? | A single fact | To what extent do the benefits of later start times outweigh the transportation and scheduling costs for rural districts? |
| How do we fix education? | Far too broad | How have phone bans in classrooms affected student attention in U.S. high schools? |

A strong question:
- reflects the **complexity** of the issue,
- invites **multiple, divergent or contradictory perspectives**,
- is **focused** enough to research and **open** enough to argue.

The inquiry process draws on **curiosity and imagination**; it can lead to unexpected conclusions or solutions.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Is each research question too broad, too narrow, or effective?',
            buckets: ['Too broad', 'Too narrow', 'Effective'],
            items: [
              { label: 'How can we solve climate change?', bucket: 0, why: 'No clear scope; it can\'t be researched well.' },
              { label: 'What is the population of my town?', bucket: 1, why: 'A single fact with no perspectives to weigh.' },
              { label: 'To what extent do community gardens improve food access in low-income urban neighborhoods?', bucket: 2, why: 'Focused, complex and open to competing evidence.' },
              { label: 'Is social media bad?', bucket: 0, why: 'Vague and sweeping.' },
              { label: 'When was the first smartphone sold?', bucket: 1, why: 'One factual answer.' },
              { label: 'How do phone bans in high school classrooms affect students\' attention and sense of autonomy?', bucket: 2, why: 'Specific, researchable, with multiple perspectives.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'According to the CED, effective research questions:',
        choices: [
          'Lead to an examination that accounts for the complexity of a problem or issue',
          'Have a single factual answer',
          'Avoid considering opposing perspectives',
          'Are as broad as possible',
        ],
        answer: 0,
        explanations: [
          'Correct. That is EK 1.1B1.',
          'Incorrect. A single fact leaves nothing to investigate.',
          'Incorrect. Questions should invite multiple and divergent perspectives.',
          'Incorrect. Overly broad questions can\'t be researched well.',
        ],
      },
      checkpoints: [
        {
          question: 'What is the first step of inquiry, according to the CED?',
          choices: [
            'Narrowing the scope of interest and identifying a problem and its origins',
            'Writing the conclusion',
            'Choosing a presentation template',
            'Finding one source that agrees with you',
          ],
          answer: 0,
          explanations: [
            'Correct. Then situate the issue in a larger context.',
            'Incorrect. Conclusions come from inquiry, not before it.',
            'Incorrect. That comes much later.',
            'Incorrect. Inquiry seeks multiple perspectives.',
          ],
        },
        {
          question: 'Which question best invites multiple, divergent perspectives?',
          choices: [
            'Should cities ban cars from downtown areas, and who benefits or loses?',
            'How many cars are registered in Chicago?',
            'What color are city buses?',
            'When was the first traffic light installed?',
          ],
          answer: 0,
          explanations: [
            'Correct. Stakeholders will disagree, so it requires weighing perspectives.',
            'Incorrect. A single statistic.',
            'Incorrect. A trivial fact.',
            'Incorrect. A historical fact.',
          ],
        },
      ],
      revisit:
        'Narrow your interest → identify the issue and its origins → situate it in context. Strong questions capture complexity and invite ' +
        'multiple, divergent perspectives; they are focused but arguable.',
    },
    {
      id: '1.2',
      ced: 'EU 1.2; LO 1.2A',
      title: 'Using Prior Knowledge',
      minutes: 4,
      summary:
        'Understanding comes from information plus experience, external sources, cultural context and assumptions. Brainstorming, concept ' +
        'mapping, prewriting, exploring and drafting help organize ideas. Inquiry may confirm or challenge what you already believe.',
      body: String.raw`### What you bring
Understanding doesn't come only from collecting information; it also comes from **experience, external sources, cultural context and assumptions**. Name yours before you research, so you can notice when evidence pushes against them.

### Strategies to organize and connect ideas
**Brainstorming**, **concept mapping**, **prewriting**, **exploring the space** of a topic, and **drafting**.

A quick concept map: put the issue in the center (school start times), branch out to stakeholders (students, parents, bus drivers, teachers, coaches), effects (sleep, grades, safety, budgets), and lenses (scientific, economic, ethical). Each branch can suggest a question.

### Be ready to change your mind
Inquiry can **confirm or challenge** your existing understandings, assumptions, beliefs and knowledge. A researcher who only looks for agreement isn't inquiring.`,
      blocks: [],
      precheck: {
        question: 'Which is a strategy the CED lists for organizing and connecting ideas?',
        choices: ['Concept mapping', 'Ignoring prior knowledge', 'Choosing a conclusion first', 'Copying a source\'s outline'],
        answer: 0,
        explanations: [
          'Correct. Along with brainstorming, prewriting, exploration and drafting.',
          'Incorrect. Prior knowledge is a resource to examine.',
          'Incorrect. That defeats inquiry.',
          'Incorrect. That isn\'t your own thinking, and it risks plagiarism.',
        ],
      },
      checkpoints: [
        {
          question: 'A student expects research to prove that homework is useless, but finds strong evidence it helps older students. What should happen?',
          choices: [
            'Let the evidence challenge the assumption and revise the thinking',
            'Leave out the evidence that disagrees',
            'Stop researching',
            'Change the question so the evidence doesn\'t apply',
          ],
          answer: 0,
          explanations: [
            'Correct. Inquiry can confirm or challenge existing beliefs.',
            'Incorrect. That is cherry-picking.',
            'Incorrect. The surprise is a reason to dig deeper.',
            'Incorrect. That avoids the evidence instead of engaging it.',
          ],
        },
        {
          question: 'Besides collecting information, what else shapes understanding, according to the CED?',
          choices: ['Experience, cultural context and assumptions', 'Only peer-reviewed data', 'Nothing else', 'The length of the sources'],
          answer: 0,
          explanations: [
            'Correct. EK 1.2A1 lists experience, external sources, cultural context and assumptions.',
            'Incorrect. Many factors shape understanding.',
            'Incorrect. The CED names several other factors.',
            'Incorrect. Length isn\'t a factor the CED names.',
          ],
        },
      ],
      revisit:
        'Understanding = information + experience, sources, cultural context, assumptions. Organize with brainstorming, concept maps, ' +
        'prewriting, exploration, drafting. Let inquiry confirm or challenge beliefs.',
    },
    {
      id: '1.3',
      ced: 'EU 1.3; LO 1.3A',
      title: 'Finding and Managing Information',
      minutes: 7,
      summary:
        'Information comes from secondary sources (articles, studies, analyses, reports) and primary sources (original works, material ' +
        'culture, and your own data from experiments, surveys, interviews and observations). Databases like EBSCO, ProQuest, JSTOR and Google ' +
        'Scholar catalog sources. Boolean logic, keywords and advanced filters refine searches.',
      body: String.raw`### Primary and secondary sources
| Type | What it is | Examples |
|---|---|---|
| **Primary** | Original material or data you collect | Original texts and works, material culture (artifacts), **experiments, surveys, questionnaires, interviews, observations, personal narratives** |
| **Secondary** | Interpretation or analysis of other material | **Articles, other studies, analyses, reports** |

### Where to search
Online **databases** (EBSCO, ProQuest, JSTOR, Google Scholar) and **libraries** catalog secondary sources and some primary ones.

### Searching smarter
- **Keywords**: try synonyms (teen / adolescent; school start / bell time).
- **Boolean logic**: **AND** narrows (both terms), **OR** widens (either term), **NOT** excludes.
- **Advanced filters**: date range, **peer-reviewed** status, type of publication.

Try the search below: watch how each operator and filter changes the results.`,
      blocks: [
        { type: 'sim', sim: 'boolean-search' },
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Primary or secondary source?',
            buckets: ['Primary', 'Secondary'],
            items: [
              { label: 'A survey you give to 200 students at your school', bucket: 0, why: 'Data you collected yourself.' },
              { label: 'An interview you conduct with a school nurse', bucket: 0, why: 'Firsthand data you gathered.' },
              { label: 'A journal article reviewing 30 studies of teen sleep', bucket: 1, why: 'It analyzes other research.' },
              { label: 'A government report analyzing national attendance data', bucket: 1, why: 'An analysis of others\' data.' },
              { label: 'A diary written by a student in 1918', bucket: 0, why: 'An original text from the time.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which Boolean operator would most likely increase the number of results?',
        choices: ['OR', 'AND', 'NOT', 'Adding a peer-review filter'],
        answer: 0,
        explanations: [
          'Correct. OR returns records containing either term.',
          'Incorrect. AND requires both terms, narrowing results.',
          'Incorrect. NOT excludes records, narrowing results.',
          'Incorrect. Filters narrow results.',
        ],
      },
      checkpoints: [
        {
          question: 'Which is a primary source for a project on teen sleep?',
          choices: [
            'Sleep logs you collect from classmates',
            'A news article summarizing sleep research',
            'A textbook chapter on adolescence',
            'A literature review of sleep studies',
          ],
          answer: 0,
          explanations: [
            'Correct. Personally collected data is primary.',
            'Incorrect. It summarizes others\' work.',
            'Incorrect. It is a secondary synthesis.',
            'Incorrect. It analyzes other studies.',
          ],
        },
        {
          question: 'Searching "phones AND sleep NOT college" will return records that:',
          choices: [
            'Mention both phones and sleep but not college',
            'Mention phones or sleep',
            'Mention only college',
            'Mention none of the terms',
          ],
          answer: 0,
          explanations: [
            'Correct. AND requires both; NOT removes records with "college."',
            'Incorrect. That would be OR.',
            'Incorrect. NOT excludes college.',
            'Incorrect. The records must contain the AND terms.',
          ],
        },
      ],
      revisit:
        'Primary = original works and your own data; secondary = articles, studies, analyses, reports. Databases: EBSCO, ProQuest, JSTOR, ' +
        'Google Scholar. AND narrows, OR widens, NOT excludes; filter by date, peer review, publication type.',
    },
    {
      id: '1.4',
      ced: 'EU 1.4; LO 1.4A',
      title: 'Evaluating Relevance and Credibility',
      minutes: 6,
      summary:
        'Credibility depends on how a source is used. Scope, purpose and source credibility affect how far conclusions generalize. ' +
        'Credible evidence is relevant and reliable (current, authoritative). Judge the author\'s and publisher\'s reputation and ' +
        'credentials, their perspective and methods, and how others respond; scholarly articles are often peer reviewed.',
      body: String.raw`### Relevance and credibility depend on context
Whether a source is useful depends on **your question**: a blog post might be weak evidence for a health claim but strong evidence of a student's perspective.

The **scope and purpose** of your research and the **credibility of your sources** affect how **generalizable** and **reliable** your conclusions are.

### Checking credibility
| Ask about | Questions |
|---|---|
| **Relevance** | Does it address my question directly? |
| **Reliability** | Is it **current** and **authoritative**? |
| **Author / publisher / sponsor** | What are their credentials and reputation? Who pays for it? |
| **Perspective and methods** | What is the author's point of view? How were data gathered? |
| **Reception** | How have other experts responded? Is it **peer reviewed** (checked and accepted by experts in the field)? |`,
      blocks: [],
      precheck: {
        question: 'What does "peer reviewed" mean?',
        choices: [
          'The research was reviewed and accepted by experts in the discipline',
          'Classmates read it',
          'It was published online',
          'The author reviewed it twice',
        ],
        answer: 0,
        explanations: [
          'Correct. That is how the CED defines it.',
          'Incorrect. Peers here means disciplinary experts.',
          'Incorrect. Publication format says nothing about review.',
          'Incorrect. Review must come from other experts.',
        ],
      },
      checkpoints: [
        {
          question: 'A study on the health effects of a sugary drink is funded by the company that makes it. What should a researcher do?',
          choices: [
            'Consider the sponsor\'s possible bias and look for independent studies',
            'Reject every study by a company automatically',
            'Accept it because it has data',
            'Ignore who funded it',
          ],
          answer: 0,
          explanations: [
            'Correct. Sponsors are part of judging credibility.',
            'Incorrect. Bias is a concern to weigh, not an automatic rejection.',
            'Incorrect. Data alone doesn\'t guarantee credibility.',
            'Incorrect. The CED lists sponsors as a credibility factor.',
          ],
        },
        {
          question: 'Why might a 1995 article be a weak source for a question about smartphone use today?',
          choices: [
            'It isn\'t current for this question, so its relevance and reliability are limited',
            'Older articles are always false',
            'It was not written online',
            'All sources must be from this year',
          ],
          answer: 0,
          explanations: [
            'Correct. Currency matters relative to the question.',
            'Incorrect. Older sources can be valuable for other questions.',
            'Incorrect. Format isn\'t the issue.',
            'Incorrect. Currency depends on the topic.',
          ],
        },
      ],
      revisit:
        'Credibility depends on use. Relevant + reliable (current, authoritative). Check author/publisher/sponsor credentials, perspective ' +
        'and methods, and reception; peer review = expert approval.',
    },
    {
      id: '1.5',
      ced: 'EU 1.5; LO 1.5A',
      title: 'Identifying the Information You Need',
      minutes: 4,
      summary:
        'There are many ways to investigate a question, and methods should match the purpose. The way you pose, situate and frame a ' +
        'problem guides the inquiry and determines what information you need and how to gather it.',
      body: String.raw`### Framing drives method
How you **pose, situate, frame or contextualize** a problem decides **what information you need** and **how to get it**.

| If your question is… | You probably need… |
|---|---|
| "How do students *feel* about later start times?" | Perspectives: interviews, surveys, student writing |
| "Do later start times *raise* graduation rates?" | Quantitative data comparing districts over time |
| "Is it *fair* to make younger students start earlier?" | Ethical arguments, stakeholder perspectives |
| "What did start times look like in *1950*?" | Historical sources |

Before searching, list the information your question requires. It saves hours of collecting sources you can't use.`,
      blocks: [],
      precheck: {
        question: 'What most directly determines the type of information a project needs?',
        choices: [
          'How the problem is posed, framed and contextualized',
          'Which sources are easiest to find',
          'The length of the final paper',
          'The number of team members',
        ],
        answer: 0,
        explanations: [
          'Correct. EK 1.5A1: the framing guides the inquiry.',
          'Incorrect. Convenience shouldn\'t drive method.',
          'Incorrect. Length doesn\'t determine information needs.',
          'Incorrect. Team size doesn\'t determine information needs.',
        ],
      },
      checkpoints: [
        {
          question: 'A team asks, "How do parents of young children experience remote work?" Which method fits best?',
          choices: ['Interviews or surveys of parents', 'A chemistry experiment', 'Counting office buildings', 'Reading only 19th-century novels'],
          answer: 0,
          explanations: [
            'Correct. The question is about experiences, so gather perspectives.',
            'Incorrect. Unrelated to the question.',
            'Incorrect. That doesn\'t capture experiences.',
            'Incorrect. That doesn\'t fit the question.',
          ],
        },
        {
          question: 'Why should you list the information you need before searching?',
          choices: [
            'So your search targets what the question requires',
            'Because AP requires exactly ten sources',
            'To avoid reading any sources',
            'Because lists replace research',
          ],
          answer: 0,
          explanations: [
            'Correct. Framing guides what to look for.',
            'Incorrect. There\'s no such requirement.',
            'Incorrect. Research still requires sources.',
            'Incorrect. Lists only guide research.',
          ],
        },
      ],
      revisit: 'Methods should match purpose. How you frame the question determines what information you need and how to gather it.',
    },
  ],
};

export default pack;
