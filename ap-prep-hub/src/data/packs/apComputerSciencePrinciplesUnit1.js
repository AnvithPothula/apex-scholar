/**
 * AP Computer Science Principles Big Idea 1: Creative Development — study pack.
 *
 * Written against the AP Computer Science Principles CED effective Fall 2023
 * (the current edition; topics 1.1–1.4, CRD-1 and CRD-2). Code uses the AP
 * exam reference sheet's pseudocode (← for assignment, DISPLAY, REPEAT, lists
 * starting at index 1). Two sorting activities: inputs vs. outputs vs. events,
 * and the four kinds of errors.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const code = (text) => '\n```\n' + text + '\n```\n';

const pack = {
  slug: 'ap-computer-science-principles/unit-1',
  subject: 'AP Computer Science Principles',
  unit: 'Big Idea 1: Creative Development',
  examWeight: '10–13% of the exam',
  intro:
    'How computing innovations get made: collaborating with diverse teammates and users, what programs are for and how they take ' +
    'input and produce output, iterative and incremental development, documentation and credit, and finding and fixing errors with testing.',
  sections: [
    {
      id: '1.1',
      ced: 'CRD-1.A–C',
      title: 'Collaboration',
      minutes: 5,
      summary:
        'A computing innovation has a program as an integral part, and can be physical, software or a concept. Collaboration with ' +
        'diverse perspectives, and consultation with users, makes innovations better and helps avoid bias. Online tools and models ' +
        'like pair programming support teamwork, which depends on communication, consensus building, conflict resolution and negotiation.',
      body: String.raw`### Computing innovations
A **computing innovation** includes a **program as an integral part** of how it works. It can be:
| Kind | Example |
|---|---|
| **Physical** | A self-driving car, a fitness tracker |
| **Non-physical software** | Photo-editing software, a music app |
| **Non-physical concept** | E-commerce, social networking |

### Why collaborate?
- Teams with **diverse talents and perspectives** produce innovations that reflect that diversity.
- Diverse perspectives help **avoid bias**: a face-recognition system tested only on some faces will fail others.
- **Consulting users** (and gathering information from potential users) helps developers understand a program's purpose from many points of view.

### How teams collaborate
- **Online tools** let programmers share code and documents and give feedback (shared docs, version control, code review).
- **Pair programming**: one person types (the driver) while the other reviews and guides (the navigator), switching roles often.
- Effective teams practice **communication, consensus building, conflict resolution and negotiation**.`,
      blocks: [],
      precheck: {
        question: 'Which is the best reason to include people with diverse backgrounds on a development team?',
        choices: [
          'Diverse perspectives help avoid bias in the innovation',
          'Diverse teams always finish faster',
          'It removes the need to test the program',
          'It guarantees the program has no errors',
        ],
        answer: 0,
        explanations: [
          'Correct. The CED says diverse perspectives help avoid bias.',
          'Incorrect. Speed isn\'t the reason the CED gives.',
          'Incorrect. Testing is still needed.',
          'Incorrect. No team can guarantee error-free code.',
        ],
      },
      checkpoints: [
        {
          question: 'Which is a non-physical computing concept?',
          choices: ['E-commerce', 'A self-driving car', 'A smartwatch', 'A robot vacuum'],
          answer: 0,
          explanations: [
            'Correct. E-commerce is an idea built on programs, not a single object or app.',
            'Incorrect. That is a physical innovation.',
            'Incorrect. That is a physical device.',
            'Incorrect. That is a physical device.',
          ],
        },
        {
          question: 'In pair programming, two programmers:',
          choices: [
            'Work together at one computer, one writing code while the other reviews, switching roles',
            'Write separate programs and pick the better one',
            'Each test the other\'s finished program only at the end',
            'Divide the program and never discuss it',
          ],
          answer: 0,
          explanations: [
            'Correct. Driver and navigator work together and switch.',
            'Incorrect. They build one program together.',
            'Incorrect. Review happens continuously, not just at the end.',
            'Incorrect. Constant discussion is the point.',
          ],
        },
      ],
      revisit:
        'Computing innovation = includes a program; physical, software or concept. Diverse teams and user input improve it and avoid ' +
        'bias. Tools: online collaboration, pair programming. Skills: communication, consensus, conflict resolution, negotiation.',
    },
    {
      id: '1.2',
      ced: 'CRD-2.A–D',
      title: 'Program Function and Purpose',
      minutes: 6,
      summary:
        'Computing innovations solve problems or pursue interests through creative expression. A program is a collection of statements ' +
        'that performs a task; a code segment is part of one. Programs should work for many inputs. Inputs (from users or other programs, ' +
        'often via events) affect outputs; event-driven programs run statements when triggered.',
      body: String.raw`### Purpose
Innovations exist to **solve a problem** or **pursue an interest through creative expression** (a game, an art app). Knowing the purpose helps developers build the right thing.

### Programs and code segments
- A **program** (software) is a collection of statements that performs a task when run.
- A **code segment** is a smaller collection of statements that is part of a program.
- A program should work for a **variety of inputs and situations**.
- Describe a program **broadly** (what it does) or in **detail** (what it does and how its statements do it).

### Input, events and output
- **Input**: data sent to a program for processing: tactile, audio, visual or text, from a **user or another program**.
- An **event** is an action that supplies input: a key press, a mouse click, the program starting.
- In **event-driven programming**, statements run when an event triggers them, not just top to bottom.
- **Output**: data sent from a program to a device (screen, speaker, vibration), usually based on input or the program's **prior state**.
` + code(String.raw`score ← 0
WHEN button clicked:
    score ← score + 1
    DISPLAY(score)`) + String.raw`
The click is the **event**; ` + "`score`" + String.raw` is the program's **state**; ` + "`DISPLAY(score)`" + String.raw` is the **output**, which depends on that state. (The WHEN line is plain English; the AP reference sheet has no event syntax.)`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'In a ride-sharing app, is each of these an input, an output or an event?',
            buckets: ['Input', 'Output', 'Event'],
            items: [
              { label: 'The pickup address the rider types in', bucket: 0, why: 'Text data sent to the program for processing.' },
              { label: 'The phone\'s GPS location sent to the app', bucket: 0, why: 'Data from another program or sensor.' },
              { label: 'A map showing the driver approaching', bucket: 1, why: 'Visual data the program sends to the screen.' },
              { label: 'A vibration when the driver arrives', bucket: 1, why: 'Tactile output.' },
              { label: 'The rider taps "Request ride"', bucket: 2, why: 'An action that triggers code to run.' },
              { label: 'The app is opened', bucket: 2, why: 'Starting a program is an event.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'In event-driven programming, program statements run:',
        choices: [
          'When triggered by an event such as a click or key press',
          'Only once, from top to bottom',
          'Only when the program has no inputs',
          'In a random order',
        ],
        answer: 0,
        explanations: [
          'Correct. Events trigger the code that handles them.',
          'Incorrect. That describes purely sequential flow.',
          'Incorrect. Events supply input.',
          'Incorrect. They run in response to specific events.',
        ],
      },
      checkpoints: [
        {
          question: 'A weather app shows a different forecast each time it is opened, even though the user types nothing. What best explains the changing output?',
          choices: [
            'The app receives input from other programs, such as a weather data service',
            'Output never depends on input',
            'The app has no inputs, so its output is random',
            'Only users can provide input to a program',
          ],
          answer: 0,
          explanations: [
            'Correct. Input can come from other programs, not just users.',
            'Incorrect. Output is usually based on input or prior state.',
            'Incorrect. It does have input, from data services.',
            'Incorrect. The CED says input can come from users or other programs.',
          ],
        },
        {
          question: 'Which is a code segment?',
          choices: [
            'A few statements inside a larger program that update a score',
            'An entire app downloaded from a store',
            'A computer\'s keyboard',
            'A diagram of the user interface',
          ],
          answer: 0,
          explanations: [
            'Correct. A code segment is a collection of statements that is part of a program.',
            'Incorrect. That is a whole program.',
            'Incorrect. That is hardware for input.',
            'Incorrect. That is a design artifact, not code.',
          ],
        },
      ],
      revisit:
        'Purpose: solve problems or creative expression. Program = statements performing a task; code segment = part of one; should ' +
        'handle many inputs. Inputs (user or programs, via events) → outputs; event-driven code runs when triggered.',
    },
    {
      id: '1.3',
      ced: 'CRD-2.E–H',
      title: 'Program Design and Development',
      minutes: 7,
      summary:
        'Development can be ordered or exploratory. Common phases: investigating and reflecting, designing, prototyping, testing. ' +
        'Iterative development revisits phases based on feedback; incremental development builds and checks one piece at a time. ' +
        'Investigation (surveys, user testing, interviews, observation) finds requirements and constraints. Document as you go, and credit code from others.',
      body: String.raw`### Development processes
Common phases: **investigating and reflecting → designing → prototyping → testing** (and around again).
| Process | Meaning |
|---|---|
| **Iterative** | Refine and revise based on **feedback, testing or reflection**, revisiting earlier phases as needed |
| **Incremental** | Break the problem into **smaller pieces** and make sure each works before adding it to the whole |

A process can be **ordered and intentional** or **exploratory**.

### Investigation and design
- **Investigation** finds the program's **requirements** and **constraints**, and the concerns of the people who will use it. Methods: **surveys, user testing, interviews, direct observation**.
- **Requirements** describe how the program must function (including user interactions); the **specification** defines those requirements.
- The **design phase** plans how to meet the specification: brainstorming, planning and **storyboarding**, organizing the program into **modules**, diagrams of the **user interface**, and a **testing strategy**.

### Documentation and credit
- **Documentation** describes what a code segment, event, procedure or program does and how it was developed. **Comments** are documentation inside the code that people read and the computer ignores. Document **throughout** development, not just at the end.
- Not every environment supports comments (some block-based tools), so other documentation may be needed.
- **Acknowledge** code written by others or collaboratively, in the documentation, including the **origin or original author's name**.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Iterative development', back: 'Refining and revising based on feedback, testing or reflection, revisiting earlier phases.' },
            { front: 'Incremental development', back: 'Building in small pieces, making sure each works before adding it to the whole.' },
            { front: 'Program specification', back: 'Defines the requirements a program must meet.' },
            { front: 'Acknowledging code', back: 'Credit code from other sources in documentation, with its origin or author\'s name.' },
          ],
        },
      ],
      precheck: {
        question: 'A team builds the login screen, tests it until it works, then adds the profile page and tests that. This is:',
        choices: ['Incremental development', 'Iterative development', 'Pair programming', 'Event-driven programming'],
        answer: 0,
        explanations: [
          'Correct. Each piece is made to work before being added to the whole.',
          'Incorrect. Iterative means revisiting phases based on feedback; this example stresses building piece by piece.',
          'Incorrect. That is a collaboration model.',
          'Incorrect. That is about how code runs, not how it is developed.',
        ],
      },
      checkpoints: [
        {
          question: 'After user testing shows people can\'t find the "save" button, developers return to the design phase and change the layout. This is an example of:',
          choices: ['Iterative development', 'Incremental development', 'Acknowledging code', 'An overflow error'],
          answer: 0,
          explanations: [
            'Correct. Feedback sent them back to an earlier phase to revise.',
            'Incorrect. They are revising based on feedback, not adding a new piece.',
            'Incorrect. Nobody else\'s code is involved.',
            'Incorrect. That is a numeric range error.',
          ],
        },
        {
          question: 'A student uses a sorting procedure written by a classmate in their program. What should they do?',
          choices: [
            'Acknowledge it in the program documentation, including the classmate\'s name',
            'Rename the variables so it looks original',
            'Nothing, since the code is short',
            'Remove all comments from that part',
          ],
          answer: 0,
          explanations: [
            'Correct. Credit the origin or original author.',
            'Incorrect. That hides the source instead of acknowledging it.',
            'Incorrect. Length doesn\'t change the need to credit.',
            'Incorrect. Removing documentation makes things worse.',
          ],
        },
      ],
      revisit:
        'Phases: investigate/reflect, design, prototype, test. Iterative = revise from feedback; incremental = piece by piece. ' +
        'Investigate with surveys, user testing, interviews, observation. Document throughout; credit others\' code.',
    },
    {
      id: '1.4',
      ced: 'CRD-2.I–J',
      title: 'Identifying and Correcting Errors',
      minutes: 7,
      summary:
        'Logic errors make a program behave incorrectly; syntax errors break the language\'s rules; run-time errors happen while it runs; ' +
        'overflow errors happen when a number is outside the allowed range. Find them with test cases, hand tracing, visualizations, ' +
        'debuggers and extra output statements. Test with defined inputs, including values at and just beyond the extremes.',
      body: String.raw`### Four kinds of errors
| Error | What happens |
|---|---|
| **Logic** | The program runs but behaves incorrectly or unexpectedly |
| **Syntax** | The rules of the language aren't followed, so it won't run |
| **Run-time** | Something goes wrong **during** execution (each language defines its own) |
| **Overflow** | A number is **outside the defined range** of values the computer can handle |

### A logic error to find
This procedure should return the largest value in a list:
` + code(String.raw`PROCEDURE findMax(numList)
{
    max ← 0
    FOR EACH num IN numList
    {
        IF (num > max)
        {
            max ← num
        }
    }
    RETURN(max)
}`) + String.raw`
It works for [3, 9, 4] (returns 9) but **fails for [−5, −2, −8]**: it returns 0, which isn't even in the list. Fix: start with the first element, ` + "`max ← numList[1]`" + String.raw`. (AP lists start at index 1.)

### Finding errors
**Test cases · hand tracing · visualizations · debuggers · extra output (DISPLAY) statements.**

### Choosing test inputs
Testing uses **defined inputs** to check for **expected outputs**, and the results guide revisions. Good tests:
- cover each **different expected outcome**,
- include values **at and just beyond the extremes** (minimum and maximum),
- come from the **program requirements**.

For an age check that allows 13 to 17: test 12, 13, 17 and 18, not just 15.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which kind of error is each?',
            buckets: ['Logic', 'Syntax', 'Run-time', 'Overflow'],
            items: [
              { label: 'An average procedure adds the scores but forgets to divide by how many there are', bucket: 0, why: 'It runs but gives the wrong result.' },
              { label: 'A program uses IF without the parentheses the language requires', bucket: 1, why: 'The language\'s rules aren\'t followed.' },
              { label: 'A program crashes when it tries to divide by a user\'s input of 0', bucket: 2, why: 'The failure happens while the program is running.' },
              { label: 'A counter stored in 8 bits goes past 255 and wraps to 0', bucket: 3, why: 'The value is outside the range that can be represented.' },
              { label: 'A game awards points for a loss instead of a win', bucket: 0, why: 'The program behaves incorrectly but runs.' },
              { label: 'A program accesses list index 6 in a 5-item list and stops', bucket: 2, why: 'An error during execution.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A program runs without crashing but calculates a total that is always \\$1 too low. What type of error is this?',
        choices: ['Logic error', 'Syntax error', 'Run-time error', 'Overflow error'],
        answer: 0,
        explanations: [
          'Correct. It runs but behaves incorrectly.',
          'Incorrect. A syntax error would keep it from running.',
          'Incorrect. Nothing fails during execution.',
          'Incorrect. No value is out of range.',
        ],
      },
      checkpoints: [
        {
          question: 'A procedure should accept scores from 0 to 100. Which set of test inputs is best?',
          choices: ['−1, 0, 100, 101', '50, 51, 52, 53', '0, 0, 0, 0', '25, 50, 75'],
          answer: 0,
          explanations: [
            'Correct. It tests at and just beyond both extremes.',
            'Incorrect. These are all in the middle of the range.',
            'Incorrect. One value repeated tests only one case.',
            'Incorrect. These miss the boundaries.',
          ],
        },
        {
          question: 'Which is NOT one of the CED\'s listed ways to find and correct errors?',
          choices: ['Deleting the program\'s comments', 'Hand tracing', 'Using a debugger', 'Adding extra output statements'],
          answer: 0,
          explanations: [
            'Correct. Removing documentation doesn\'t find errors.',
            'Incorrect. Hand tracing is listed.',
            'Incorrect. Debuggers are listed.',
            'Incorrect. Extra output statements are listed.',
          ],
        },
      ],
      revisit:
        'Logic (wrong behavior), syntax (rules broken), run-time (during execution), overflow (out of range). Find with test cases, ' +
        'hand tracing, visualizations, debuggers, extra output. Test each outcome and at/just beyond the extremes.',
    },
  ],
};

export default pack;
