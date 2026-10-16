/**
 * AP U.S. Government and Politics Unit 2: Interactions Among Branches of
 * Government — study pack.
 *
 * Written against the AP U.S. Government and Politics CED (2026 edition,
 * topics 2.1–2.15). This is the heaviest unit on the exam, so every topic gets
 * its own section, but each one stays short: the essential knowledge, the
 * required documents (Federalist No. 70 and No. 78, Article III) and cases
 * (Marbury v. Madison, Baker v. Carr, Shaw v. Reno), and the scenario
 * reasoning the free-response questions ask for. Activities: put a bill's path
 * in order, and sort powers, representative roles and agencies.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-us-government-and-politics/unit-2',
  subject: 'AP U.S. Government and Politics',
  unit: 'Unit 2: Interactions Among Branches of Government',
  examWeight: '25–36% of the exam',
  intro:
    'Congress, the president, the courts and the bureaucracy share power, and most of American policymaking is the story of ' +
    'how they push against each other. This unit covers what each branch can do, the rules that shape how it does it, and the ' +
    'checks the others hold. It is the largest unit on the exam.',
  sections: [
    {
      id: '2.1',
      ced: 'LO 2.1.A',
      title: 'Congress: The Senate and the House of Representatives',
      minutes: 6,
      summary:
        'Congress is bicameral: the Senate represents states equally and the House represents people by population. Size and ' +
        'term length make the chambers behave differently. The Constitution gives Congress enumerated powers, plus implied ' +
        'powers through the necessary and proper clause.',
      body: String.raw`### Two chambers by design
| | House | Senate |
|---|---|---|
| Represents | The people (seats by population) | The states equally (2 each) |
| Members | 435 | 100 |
| Term | 2 years, all elected at once | 6 years, one-third elected every 2 years |
| Debate | More formal, tightly limited | Less formal, looser rules |

Bicameralism reflects **republicanism**: the will of the people is expressed through elected representatives. Because only a third of the Senate faces voters at once, the Senate is a **continuous body**.

### Powers of Congress
**Enumerated** powers (listed in Article I) include:
- passing a budget, taxing, borrowing and coining money
- declaring war and funding the armed forces
- setting rules for **naturalization**
- regulating **interstate commerce**
- creating lower federal courts

**Implied** powers come from the **necessary and proper clause**, which lets Congress pass laws needed to carry out its listed powers. Congress also conducts **oversight** of the executive branch and the bureaucracy.`,
      blocks: [],
      precheck: {
        question: 'Which feature of Congress was designed to represent the states equally?',
        choices: [
          'Each state having two senators',
          'House seats apportioned by population',
          'Two-year terms for representatives',
          'The House Rules Committee',
        ],
        answer: 0,
        explanations: [
          'Correct. Every state has two senators regardless of population.',
          'Incorrect. Apportioning by population represents people, not states equally.',
          'Incorrect. Term length is about accountability, not equal state representation.',
          'Incorrect. The Rules Committee sets House debate rules.',
        ],
      },
      checkpoints: [
        {
          question: 'Why is debate in the House more formal than debate in the Senate?',
          choices: [
            'The House has 435 members, so it needs stricter rules to manage debate',
            'The House has six-year terms that encourage longer speeches',
            'The Senate has more members than the House',
            'The Constitution bans debate rules in the Senate',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED ties formality to size: 435 members need tighter rules than 100.',
            'Incorrect. House terms are two years.',
            'Incorrect. The Senate has 100 members, far fewer than the House.',
            'Incorrect. The Senate has rules; they are simply looser.',
          ],
        },
        {
          question: 'Congress creates a national bank to help carry out its taxing and borrowing powers, though a bank isn\'t listed in the Constitution. Which provision justifies this?',
          choices: [
            'The necessary and proper clause',
            'The Twenty-Second Amendment',
            'The naturalization power',
            'Article III',
          ],
          answer: 0,
          explanations: [
            'Correct. It grants implied powers needed to carry out enumerated ones (upheld in McCulloch v. Maryland).',
            'Incorrect. That amendment sets presidential term limits.',
            'Incorrect. Naturalization covers becoming a citizen.',
            'Incorrect. Article III creates the judicial branch.',
          ],
        },
      ],
      revisit:
        'House: 435, 2-year terms, by population, formal debate. Senate: 100, 6-year staggered terms, equal by state, looser debate. ' +
        'Enumerated powers (tax, war, commerce, naturalization, courts) plus implied powers via necessary and proper; oversight.',
    },
    {
      id: '2.2',
      ced: 'LO 2.2.A',
      title: 'Structures, Powers, and Functions of Congress',
      minutes: 8,
      summary:
        'Both chambers send bills to committees run by the majority party, but each has its own rules: the Speaker and Rules ' +
        'Committee in the House, holds, filibusters and cloture in the Senate. A conference committee reconciles different ' +
        'versions. Congress also writes a budget split between mandatory and discretionary spending.',
      body: String.raw`### Committees do most of the work
Both chambers refer bills to **committees**, which hold hearings, debate and **mark up** (revise) them. The **majority party** controls committee leadership, so it controls which bills move.

### Chamber rules
| House | Senate |
|---|---|
| **Speaker**, elected by a majority of members, presides | Bills usually reach the floor by **unanimous consent** |
| **All revenue bills must start here** | A senator can place a **hold** to keep a bill off the floor |
| The **Rules Committee** sets debate rules for each bill | A senator can **filibuster** to delay or block a vote |
| **Committee of the Whole** speeds debate | **Cloture** ends debate (it takes 60 votes) |
| A **discharge petition** can force a bill out of committee (rare) | |

If the House and Senate pass different versions, a **conference committee** reconciles them, and both chambers vote again.

### The budget
- **Mandatory spending**: required by existing law for **entitlements** such as Social Security, Medicare and Medicaid.
- **Discretionary spending**: approved each year, such as defense, education and infrastructure.

As entitlement costs grow, there is less room for discretionary spending unless taxes rise or the deficit grows.

### Deal-making
- **Pork-barrel legislation**: money for a local project tucked into a larger spending bill.
- **Logrolling**: trading votes or favors ("you back my bill, I'll back yours").

Put a bill's path in order below.`,
      blocks: [
        {
          type: 'sim',
          sim: 'timeline-order',
          props: {
            title: 'How a House bill becomes law',
            hideYears: true,
            instruction: 'tap the steps in the order they happen',
            events: [
              { year: 1, label: 'A representative introduces the bill' },
              { year: 2, label: 'Committee holds hearings and marks it up' },
              { year: 3, label: 'Rules Committee sets the terms of debate' },
              { year: 4, label: 'The full House passes it' },
              { year: 5, label: 'The Senate passes its own version' },
              { year: 6, label: 'Conference committee reconciles the versions' },
              { year: 7, label: 'The president signs or vetoes it' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A senator wants to delay a vote on a bill by refusing to end debate. Which tactic is this?',
        choices: [
          'Filibuster',
          'Discharge petition',
          'Pork-barrel spending',
          'Committee of the Whole',
        ],
        answer: 0,
        explanations: [
          'Correct. A filibuster prolongs debate to delay or block a vote.',
          'Incorrect. A discharge petition is a House tool to force a bill out of committee.',
          'Incorrect. Pork is local spending added to a larger bill.',
          'Incorrect. That is a House procedure to speed up debate.',
        ],
      },
      checkpoints: [
        {
          question: 'Which spending category is most difficult for Congress to cut in a single year\'s budget?',
          choices: [
            'Mandatory spending on programs such as Social Security and Medicare',
            'Discretionary spending on education',
            'Discretionary spending on infrastructure',
            'Pork-barrel projects added to appropriations bills',
          ],
          answer: 0,
          explanations: [
            'Correct. Mandatory spending is required by existing law, so it continues unless Congress changes the law itself.',
            'Incorrect. Discretionary spending is decided each year.',
            'Incorrect. Infrastructure is discretionary.',
            'Incorrect. Pork is part of annual appropriations and can be dropped.',
          ],
        },
        {
          question: 'The House and Senate pass different versions of a farm bill. What happens next?',
          choices: [
            'A conference committee reconciles the differences, then both chambers vote on the final version',
            'The president chooses which version becomes law',
            'The Supreme Court decides which version is constitutional',
            'The Senate version automatically becomes law',
          ],
          answer: 0,
          explanations: [
            'Correct. Both chambers must pass identical text, so a conference committee works out one version.',
            'Incorrect. The president signs or vetoes only one identical bill.',
            'Incorrect. Courts don\'t pick between versions of pending bills.',
            'Incorrect. Neither chamber\'s version wins automatically.',
          ],
        },
      ],
      revisit:
        'Committees (majority party) mark up bills. House: Speaker, revenue bills, Rules Committee, discharge petition. Senate: ' +
        'unanimous consent, holds, filibuster, cloture (60). Conference committee. Mandatory vs. discretionary; pork, logrolling.',
    },
    {
      id: '2.3',
      ced: 'LO 2.3.A; Baker v. Carr, Shaw v. Reno',
      title: 'Congressional Behavior',
      minutes: 8,
      summary:
        'Partisanship, polarization and divided government shape how Congress acts and can produce gridlock. Gerrymandering ' +
        'has been partly checked by Baker v. Carr and Shaw v. Reno. Members see their role as trustee, delegate or politico.',
      body: String.raw`### Parties and gridlock
- **Partisan voting**: members vote with their party.
- **Polarization**: the parties' views move toward ideological extremes.
- **Gridlock**: no action because there's no consensus.
- **Divided government**: one party holds the presidency and the other controls at least one chamber. It tends to intensify partisanship: Congress votes down the president's initiatives and nominees, especially those of a **lame duck** president near the end of a term.

### Redistricting and the Court
After each census, states redraw House district lines. **Gerrymandering** is drawing them to favor a party or group.

**Baker v. Carr (1962)**
- *Facts*: Tennessee hadn't redrawn its legislative districts since 1901, so rural districts with few people had the same representation as crowded urban ones.
- *Issue*: Can federal courts hear challenges to how districts are drawn?
- *Holding*: Yes. Redistricting is not a "political question" off-limits to courts, so voters can challenge unequal districts under the Fourteenth Amendment's **Equal Protection Clause**. This opened the door to the "one person, one vote" principle.

**Shaw v. Reno (1993)**
- *Facts*: North Carolina drew a long, snaking majority-Black district to comply with the Voting Rights Act.
- *Holding*: A district drawn using race as the **only** factor can be challenged under the Equal Protection Clause.

### How members see their role
| Role | Votes based on |
|---|---|
| **Trustee** | Their own knowledge and judgment |
| **Delegate** | What their constituents want |
| **Politico** | A mix, depending on the issue |`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Trustee, delegate or politico?',
            buckets: ['Trustee', 'Delegate', 'Politico'],
            items: [
              { label: 'Votes for a trade deal her farm district opposes because she believes it helps the country', bucket: 0, why: 'She follows her own judgment over constituent opinion.' },
              { label: 'Studies a technical bill and votes on his own expert reading of it', bucket: 0, why: 'Relying on personal judgment is the trustee model.' },
              { label: 'Polls her district and votes the way most voters there prefer', bucket: 1, why: 'Acting as the agent of constituents is the delegate model.' },
              { label: 'Opposes a bill he likes because his district strongly opposes it', bucket: 1, why: 'He sets aside his view to follow constituents.' },
              { label: 'Follows the district on local issues but her own judgment on foreign policy', bucket: 2, why: 'Switching between the two is the politico model.' },
              { label: 'Votes his conscience on low-profile bills but follows voters on headline issues', bucket: 2, why: 'A mix of trustee and delegate is a politico.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'What did the Supreme Court decide in Baker v. Carr (1962)?',
        choices: [
          'Federal courts can hear challenges to legislative redistricting under the Equal Protection Clause',
          'Districts drawn using race as the only factor are always constitutional',
          'States may never redraw legislative districts',
          'Redistricting is a political question that courts cannot review',
        ],
        answer: 0,
        explanations: [
          'Correct. Redistricting became justiciable, opening the way to "one person, one vote."',
          'Incorrect. Shaw v. Reno held that such districts can be challenged.',
          'Incorrect. States redraw districts after every census.',
          'Incorrect. That is the position the Court rejected.',
        ],
      },
      checkpoints: [
        {
          question: 'A president from one party faces a Senate controlled by the other party in her last year in office. Which outcome is most likely?',
          choices: [
            'The Senate delays or rejects many of her judicial nominees',
            'The Senate confirms all of her nominees quickly',
            'Gridlock decreases because the parties share power',
            'The president gains new formal powers over Congress',
          ],
          answer: 0,
          explanations: [
            'Correct. Divided government and lame-duck status intensify partisan opposition to appointments.',
            'Incorrect. Divided government makes quick confirmation less likely.',
            'Incorrect. Divided government tends to increase gridlock.',
            'Incorrect. Formal powers don\'t change with control of Congress.',
          ],
        },
        {
          question: 'How is Shaw v. Reno (1993) similar to Baker v. Carr (1962)?',
          choices: [
            'Both allow voters to challenge district maps under the Equal Protection Clause',
            'Both banned all majority-minority districts',
            'Both concerned the president\'s veto power',
            'Both held that courts may not review redistricting',
          ],
          answer: 0,
          explanations: [
            'Correct. Both opened redistricting to Fourteenth Amendment equal protection challenges.',
            'Incorrect. Shaw held only that race-only districts can be challenged, not that all are banned.',
            'Incorrect. Neither case involved the veto.',
            'Incorrect. Both held the opposite.',
          ],
        },
      ],
      revisit:
        'Partisanship + polarization → gridlock; divided government and lame ducks intensify it. Baker v. Carr: courts can hear ' +
        'redistricting cases (equal protection). Shaw v. Reno: race-only districts can be challenged. Trustee, delegate, politico.',
    },
    {
      id: '2.4',
      ced: 'LO 2.4.A',
      title: 'Roles and Powers of the President',
      minutes: 7,
      summary:
        'Presidents pursue a policy agenda with help from the vice president, Cabinet and Executive Office of the President. ' +
        'Their powers are formal (written in the Constitution) and informal (developed through practice), from vetoes and ' +
        'treaties to executive orders, executive agreements and persuasion.',
      body: String.raw`### Formal vs. informal powers
**Formal** powers are written in the Constitution. **Informal** powers aren't listed but have developed through practice.

| Power | Formal or informal | Notes |
|---|---|---|
| **Veto** | Formal | Congress can override with a two-thirds vote in both chambers |
| **Pocket veto** | Formal | If Congress adjourns within 10 days of sending a bill and the president doesn't sign, it dies; it **can't be overridden** |
| **Commander in chief** | Formal | Directs the armed forces |
| **Treaties** | Formal | Need two-thirds approval in the Senate |
| **Executive agreements** | Informal | Deals with foreign leaders that don't need Senate approval |
| **Bargaining and persuasion** | Informal | Getting Congress to act |
| **Executive orders** | Informal | Directives managing the federal government; implied by the vested executive power or delegated by Congress |
| **Signing statements** | Informal | Tell Congress and the public how the president interprets a law being signed |

### The president's team
- **Vice President**
- **Cabinet**: heads of the executive departments
- **Executive Office of the President (EOP)**: close advisers and offices such as the Office of Management and Budget`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Formal or informal power?',
            buckets: ['Formal', 'Informal'],
            items: [
              { label: 'Vetoing a bill passed by Congress', bucket: 0, why: 'The veto is written into Article I.' },
              { label: 'Commanding the armed forces', bucket: 0, why: 'Article II makes the president commander in chief.' },
              { label: 'Negotiating a treaty for Senate approval', bucket: 0, why: 'Treaty-making is a constitutional power shared with the Senate.' },
              { label: 'Making an executive agreement with another country', bucket: 1, why: 'Executive agreements aren\'t in the Constitution and skip Senate approval.' },
              { label: 'Issuing a signing statement', bucket: 1, why: 'Signing statements developed through practice.' },
              { label: 'Phoning senators to win votes for a bill', bucket: 1, why: 'Bargaining and persuasion are informal powers.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Which presidential action can Congress NOT override with a two-thirds vote?',
        choices: [
          'A pocket veto',
          'A regular veto',
          'A signing statement',
          'A State of the Union address',
        ],
        answer: 0,
        explanations: [
          'Correct. A pocket veto happens when Congress has adjourned, so there is nothing to override.',
          'Incorrect. A regular veto can be overridden by two-thirds of both chambers.',
          'Incorrect. A signing statement isn\'t a veto and doesn\'t block a law.',
          'Incorrect. A speech isn\'t something Congress overrides.',
        ],
      },
      checkpoints: [
        {
          question: 'A president wants an arms-control deal with another country but expects the Senate to reject a treaty. Which tool lets the president act without Senate approval?',
          choices: [
            'An executive agreement',
            'A pocket veto',
            'A discharge petition',
            'Cloture',
          ],
          answer: 0,
          explanations: [
            'Correct. Executive agreements are informal foreign-policy tools that don\'t need two-thirds of the Senate.',
            'Incorrect. A pocket veto kills a bill; it doesn\'t make agreements.',
            'Incorrect. A discharge petition is a House procedure.',
            'Incorrect. Cloture ends Senate debate.',
          ],
        },
        {
          question: 'Executive orders allow the president to',
          choices: [
            'manage how the federal government carries out its work',
            'pass new taxes without Congress',
            'overturn Supreme Court decisions',
            'amend the Constitution',
          ],
          answer: 0,
          explanations: [
            'Correct. They direct the executive branch, based on vested executive power or authority Congress delegated.',
            'Incorrect. Taxing is a power of Congress.',
            'Incorrect. Executive orders can\'t overturn court rulings.',
            'Incorrect. Amendments require Congress and the states.',
          ],
        },
      ],
      revisit:
        'Formal: veto (override 2/3), pocket veto (no override), commander in chief, treaties (2/3 Senate). Informal: executive ' +
        'agreements, executive orders, signing statements, bargaining and persuasion. Team: VP, Cabinet, EOP.',
    },
    {
      id: '2.5',
      ced: 'LO 2.5.A',
      title: 'Checks on the Presidency',
      minutes: 4,
      summary:
        'The Senate confirms the president\'s major appointments, which can spark conflict over who is chosen. The president\'s ' +
        'longest-lasting influence comes from life-tenured judges.',
      body: String.raw`### Senate confirmation
The Senate must confirm many of the president's appointments, including:
- **Cabinet** members
- **Ambassadors**
- some positions in the **Executive Office of the President**
- **federal judges**: Supreme Court justices, courts of appeals and district courts

Confirmation is a check that can produce conflict when the Senate opposes the president's choice. Examples (not required): Robert Bork's Supreme Court nomination failed in 1987; John Tower's nomination as defense secretary failed in 1989.

### The longest legacy
A president serves at most eight years, but federal judges serve **for life** ("during good behavior"). Judicial appointments are therefore the president's most lasting influence on policy.`,
      blocks: [],
      precheck: {
        question: 'Why are judicial appointments often called a president\'s most lasting legacy?',
        choices: [
          'Federal judges have life tenure and can serve for decades after the president leaves office',
          'Judges must resign when a new president takes office',
          'Judicial appointments don\'t need Senate confirmation',
          'Judges are elected every four years with the president',
        ],
        answer: 0,
        explanations: [
          'Correct. Life tenure lets judges shape law long after the appointing president is gone.',
          'Incorrect. Judges serve during good behavior, not at the president\'s pleasure.',
          'Incorrect. Federal judges require Senate confirmation.',
          'Incorrect. Federal judges are appointed, not elected.',
        ],
      },
      checkpoints: [
        {
          question: 'Which appointment requires Senate confirmation?',
          choices: [
            'An ambassador to Japan',
            'A White House press intern',
            'A state governor',
            'A member of the House of Representatives',
          ],
          answer: 0,
          explanations: [
            'Correct. Ambassadors are among the appointments the Senate confirms.',
            'Incorrect. Junior staff don\'t require confirmation.',
            'Incorrect. Governors are elected by state voters.',
            'Incorrect. Representatives are elected.',
          ],
        },
        {
          question: 'The Senate rejects a president\'s Supreme Court nominee. This best illustrates',
          choices: [
            'a check by the legislative branch on the executive\'s appointment power',
            'judicial review',
            'the president\'s pocket veto',
            'federalism',
          ],
          answer: 0,
          explanations: [
            'Correct. Confirmation lets the Senate check presidential appointments.',
            'Incorrect. Judicial review is the courts striking down laws or actions.',
            'Incorrect. A pocket veto is the president\'s check on Congress.',
            'Incorrect. Federalism divides power between national and state governments.',
          ],
        },
      ],
      revisit:
        'The Senate confirms Cabinet members, ambassadors, some EOP officials and federal judges, which can cause conflict. ' +
        'Life-tenured judges are the president\'s longest-lasting influence.',
    },
    {
      id: '2.6',
      ced: 'LO 2.6.A; Federalist No. 70',
      title: 'Expansion of Presidential Power',
      minutes: 6,
      summary:
        'Federalist No. 70 argues for a single, energetic executive. Presidents have used and justified expanding power, and ' +
        'the Twenty-Second Amendment shows the worry it causes. Debate continues between limited and expansive views of the office.',
      body: String.raw`### Federalist No. 70 (Alexander Hamilton)
Hamilton argued that **"energy in the executive"** is essential to good government. A **single** president, rather than a council, can act with "decision, activity, secrecy, and dispatch," and is easier to hold responsible. He wrote that energy is "essential to the protection of the community against foreign attacks" and just as essential to "the steady administration of the laws," the protection of property, and "the security of liberty."

### Concern about expansion
The **Twenty-Second Amendment** (1951) limits presidents to two elected terms. It came after Franklin Roosevelt won four elections, and it reflects concern about presidential power growing too large.

### Limited vs. expansive views
| Limited (restrained) view | Expansive view |
|---|---|
| The president may do only what the Constitution or laws specifically allow | The president may do anything not forbidden, especially in emergencies |
| Congress leads on policy | The president leads, using executive orders, agreements and military action |

These views are still debated whenever presidents use executive orders, send troops without a declaration of war, or claim emergency powers.`,
      blocks: [],
      precheck: {
        question: 'What is the main argument of Federalist No. 70?',
        choices: [
          'A single, energetic executive is essential to good government',
          'The judiciary is the least dangerous branch',
          'Large republics control factions best',
          'Power should be divided among several co-presidents',
        ],
        answer: 0,
        explanations: [
          'Correct. Hamilton argued for "energy in the executive" from a single president.',
          'Incorrect. That is Federalist No. 78.',
          'Incorrect. That is Federalist No. 10.',
          'Incorrect. Hamilton argued against a plural executive.',
        ],
      },
      checkpoints: [
        {
          question: 'The ratification of the Twenty-Second Amendment best reflects',
          choices: [
            'concern that presidential power could grow too large',
            'a desire to give presidents more power in wartime',
            'support for a plural executive',
            'the Supreme Court\'s power of judicial review',
          ],
          answer: 0,
          explanations: [
            'Correct. Term limits followed FDR\'s four elections and aimed to prevent one person holding the office too long.',
            'Incorrect. It limits presidential power rather than expanding it.',
            'Incorrect. It keeps a single president but limits terms.',
            'Incorrect. Amendments are a separate process from judicial review.',
          ],
        },
        {
          question: 'A president sends troops abroad without a declaration of war, arguing that the commander-in-chief power allows it. Which view of presidential power does this reflect?',
          choices: [
            'An expansive view',
            'A limited view',
            'The trustee model',
            'Judicial restraint',
          ],
          answer: 0,
          explanations: [
            'Correct. It reads the president\'s powers broadly.',
            'Incorrect. A limited view would wait for congressional authorization.',
            'Incorrect. The trustee model describes legislators.',
            'Incorrect. Judicial restraint describes courts.',
          ],
        },
      ],
      revisit:
        'Federalist 70: a single, energetic executive. 22nd Amendment (two terms) shows concern about expansion. Limited vs. ' +
        'expansive views of the presidency are still debated.',
    },
    {
      id: '2.7',
      ced: 'LO 2.7.A',
      title: 'Presidential Communication',
      minutes: 4,
      summary:
        'New communication technology has increased the president\'s reach. Social media allows rapid responses, and the ' +
        'televised State of the Union and the bully pulpit let presidents set the agenda by shaping what the public thinks matters most.',
      body: String.raw`### Going over Congress's head
As technology advanced (radio, television, the internet, social media), presidents could speak directly to the national public. That lets them pressure Congress by building public support.

- **Social media** allows **rapid responses** to political events, without waiting for press coverage.
- The **State of the Union**, broadcast nationally, lays out the president's priorities.
- The **bully pulpit**, Theodore Roosevelt's phrase, is the president's platform to persuade the public.

### Agenda setting
Both tools are about **agenda setting**: using media attention to shape which issues the public sees as most important, which in turn pressures Congress. An illustrative example: President Reagan's televised 1981 address urging the public to support his tax cuts.`,
      blocks: [],
      precheck: {
        question: 'The president\'s use of the bully pulpit is mainly a tool for',
        choices: [
          'setting the policy agenda by persuading the public',
          'vetoing legislation',
          'appointing federal judges',
          'conducting congressional oversight',
        ],
        answer: 0,
        explanations: [
          'Correct. The bully pulpit uses the president\'s visibility to shape public priorities.',
          'Incorrect. The veto is a formal power exercised on bills.',
          'Incorrect. Appointments are a formal power checked by the Senate.',
          'Incorrect. Oversight is a congressional power.',
        ],
      },
      checkpoints: [
        {
          question: 'How has social media changed presidential communication?',
          choices: [
            'It lets presidents respond to events rapidly and speak directly to the public',
            'It replaced the State of the Union, which is no longer delivered',
            'It gave presidents new formal powers over Congress',
            'It prevented presidents from influencing public opinion',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED stresses rapid responses and a direct connection to the national constituency.',
            'Incorrect. The State of the Union is still delivered.',
            'Incorrect. Communication is an informal tool, not a formal power.',
            'Incorrect. It increased presidential influence.',
          ],
        },
        {
          question: 'A president gives a primetime address urging viewers to call their senators about a stalled bill. This is an example of',
          choices: [
            'going public to pressure Congress through agenda setting',
            'a pocket veto',
            'an executive agreement',
            'senatorial courtesy',
          ],
          answer: 0,
          explanations: [
            'Correct. The president uses media to raise the issue\'s priority and push Congress.',
            'Incorrect. A pocket veto involves not signing a bill after adjournment.',
            'Incorrect. Executive agreements are with foreign governments.',
            'Incorrect. Senatorial courtesy concerns appointments.',
          ],
        },
      ],
      revisit:
        'Technology increased presidential reach. Social media: rapid response. State of the Union and bully pulpit: agenda ' +
        'setting by shaping what the public sees as important, which pressures Congress.',
    },
    {
      id: '2.8',
      ced: 'LO 2.8.A; Article III, Federalist No. 78, Marbury v. Madison',
      title: 'The Judicial Branch',
      minutes: 7,
      summary:
        'Article III creates the federal judiciary, and Federalist No. 78 argues that an independent judiciary with life tenure ' +
        'checks the other branches. Marbury v. Madison established judicial review, the power to strike down unconstitutional ' +
        'laws and actions.',
      body: String.raw`### Article III
Article III creates the **Supreme Court** and lets Congress create lower federal courts. Judges serve "during good behavior," which in practice means **for life**, and their pay can't be cut.

### Federalist No. 78 (Alexander Hamilton)
- The judiciary is the **"least dangerous"** branch: it has "neither force nor will, but merely judgment." It can't command the army or spend money.
- Because of that weakness, it needs **independence**, which life tenure provides.
- Courts must be able to declare laws contrary to the Constitution void. That is an argument for judicial review before Marbury.

### Marbury v. Madison (1803)
- *Facts*: Outgoing President John Adams appointed William Marbury as a justice of the peace, but the commission wasn't delivered. The new secretary of state, James Madison, refused to deliver it. Marbury asked the Supreme Court to order delivery, as a section of the Judiciary Act of 1789 allowed.
- *Issue*: Can the Court enforce a law that expands its own jurisdiction beyond what the Constitution allows?
- *Holding*: No. That section of the Judiciary Act was **unconstitutional**, so Marbury lost.
- *Significance*: Chief Justice John Marshall established **judicial review**, the Court's power to declare acts of Congress or the executive unconstitutional.

### How judicial review checks the branches
It lets courts strike down **laws** (checking Congress) and **executive actions** (checking the president).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Article III', back: 'Creates the Supreme Court, lets Congress create lower courts, and gives judges tenure during good behavior.' },
            { front: 'Federalist No. 78', back: 'Hamilton: the judiciary is the "least dangerous" branch and needs independence through life tenure.' },
            { front: 'Marbury v. Madison (1803)', back: 'Established judicial review by striking down part of the Judiciary Act of 1789.' },
            { front: 'Judicial review', back: 'The courts\' power to declare laws or executive actions unconstitutional.' },
          ],
        },
      ],
      precheck: {
        question: 'Which case established the principle of judicial review?',
        choices: [
          'Marbury v. Madison (1803)',
          'McCulloch v. Maryland (1819)',
          'Baker v. Carr (1962)',
          'Shaw v. Reno (1993)',
        ],
        answer: 0,
        explanations: [
          'Correct. Marbury held part of the Judiciary Act of 1789 unconstitutional, establishing judicial review.',
          'Incorrect. McCulloch concerned federal supremacy and implied powers.',
          'Incorrect. Baker concerned whether courts could hear redistricting cases.',
          'Incorrect. Shaw concerned race-based districts.',
        ],
      },
      checkpoints: [
        {
          question: 'In Federalist No. 78, why does Hamilton call the judiciary the "least dangerous" branch?',
          choices: [
            'It has neither the power of the sword nor the purse, only judgment',
            'Judges are elected every two years',
            'It controls the military',
            'It can raise taxes',
          ],
          answer: 0,
          explanations: [
            'Correct. Without force or money, courts depend on judgment and the other branches to enforce rulings.',
            'Incorrect. Federal judges have life tenure, not elections.',
            'Incorrect. The president commands the military.',
            'Incorrect. Taxing belongs to Congress.',
          ],
        },
        {
          question: 'Which is an example of judicial review checking the legislative branch?',
          choices: [
            'The Supreme Court strikes down a federal law as unconstitutional',
            'The Senate rejects a judicial nominee',
            'The president vetoes a bill',
            'Congress overrides a veto',
          ],
          answer: 0,
          explanations: [
            'Correct. Declaring a law unconstitutional is judicial review checking Congress.',
            'Incorrect. That is the Senate checking the president.',
            'Incorrect. That is the president checking Congress.',
            'Incorrect. That is Congress checking the president.',
          ],
        },
      ],
      revisit:
        'Article III: Supreme Court, lower courts, life tenure. Federalist 78: "least dangerous" branch, needs independence. ' +
        'Marbury v. Madison (1803): judicial review, checking Congress and the executive.',
    },
    {
      id: '2.9',
      ced: 'LO 2.9.A',
      title: 'The Role of the Judicial Branch',
      minutes: 4,
      summary:
        'Courts usually follow precedent (stare decisis). But as presidents appoint justices, the Court\'s ideology shifts, ' +
        'and a new majority can set new precedents or overturn old ones.',
      body: String.raw`### Stare decisis
**Stare decisis** ("let the decision stand") means courts follow **precedent**, earlier rulings in cases with similar facts. It makes the law stable and predictable.

### When precedent changes
Presidential appointments change the Court's ideological makeup. A new majority may establish new precedents or reject old ones.

Classic example (outside the required list): **Plessy v. Ferguson** (1896) allowed "separate but equal." **Brown v. Board of Education** (1954), a required case for Unit 3, rejected it.`,
      blocks: [],
      precheck: {
        question: 'What does stare decisis mean for judicial decision making?',
        choices: [
          'Courts generally follow precedent from earlier cases with similar facts',
          'Courts must follow the president\'s instructions',
          'Courts may hear only cases about the Constitution\'s text',
          'Courts decide each case without reference to earlier rulings',
        ],
        answer: 0,
        explanations: [
          'Correct. Following precedent keeps the law stable.',
          'Incorrect. Courts are independent of the president.',
          'Incorrect. Courts hear many kinds of legal cases.',
          'Incorrect. That is the opposite of stare decisis.',
        ],
      },
      checkpoints: [
        {
          question: 'Which change is most likely to lead the Supreme Court to overturn an existing precedent?',
          choices: [
            'Several new justices appointed by presidents with a different judicial philosophy',
            'A new Speaker of the House',
            'A State of the Union address criticizing the ruling',
            'An increase in discretionary spending',
          ],
          answer: 0,
          explanations: [
            'Correct. Shifts in the Court\'s ideological composition can lead it to reject past precedents.',
            'Incorrect. The Speaker doesn\'t decide cases.',
            'Incorrect. Speeches can\'t change rulings.',
            'Incorrect. Spending decisions don\'t change precedent.',
          ],
        },
        {
          question: 'Brown v. Board of Education (1954) overturning Plessy v. Ferguson (1896) shows that',
          choices: [
            'the Court can reject an existing precedent',
            'stare decisis never applies to the Supreme Court',
            'Congress must approve changes in precedent',
            'precedents last only as long as the president who appointed the justices',
          ],
          answer: 0,
          explanations: [
            'Correct. Precedent is strong but can be overturned.',
            'Incorrect. The Court usually does follow precedent.',
            'Incorrect. Congress doesn\'t approve court rulings.',
            'Incorrect. Precedents often last for generations.',
          ],
        },
      ],
      revisit:
        'Stare decisis: follow precedent. New appointments shift the Court\'s ideology, so a new majority can set new precedents ' +
        'or overturn old ones (Brown overturning Plessy).',
    },
    {
      id: '2.10',
      ced: 'LO 2.10.A',
      title: 'The Court in Action',
      minutes: 3,
      summary:
        'Life tenure frees justices from the current political climate, so they can make unpopular decisions. That ' +
        'independence is also why people argue about how much power the Court should have.',
      body: String.raw`### Independence cuts both ways
Because justices serve for life, they don't have to win elections or keep a president happy. That means the Court can:
- protect unpopular minorities and rights against majority pressure, but also
- issue controversial rulings that most of the public dislikes.

Either way, the result fuels debate about the Court's power: is it a needed check, or an unelected body making policy?

### Exam move
If a question asks how life tenure affects the Court, link **life tenure → independence from the political climate → ability to issue unpopular rulings → debate over the Court's power**.`,
      blocks: [],
      precheck: {
        question: 'How does life tenure affect the Supreme Court?',
        choices: [
          'It lets justices decide cases independent of the current political climate',
          'It forces justices to follow public opinion polls',
          'It lets the president remove justices who disagree with him',
          'It requires justices to run for reelection every six years',
        ],
        answer: 0,
        explanations: [
          'Correct. Justices don\'t face elections or removal for unpopular rulings.',
          'Incorrect. Independence frees them from following polls.',
          'Incorrect. Justices can only be removed by impeachment.',
          'Incorrect. Federal judges aren\'t elected.',
        ],
      },
      checkpoints: [
        {
          question: 'The Court issues a ruling that most Americans oppose. Which feature of the judiciary most directly made this possible?',
          choices: [
            'Life tenure',
            'Senate confirmation',
            'Stare decisis',
            'The power of the purse',
          ],
          answer: 0,
          explanations: [
            'Correct. Justices serving for life don\'t need public approval to keep their jobs.',
            'Incorrect. Confirmation happens once, before a justice serves.',
            'Incorrect. Precedent concerns past rulings, not public opinion.',
            'Incorrect. The power of the purse belongs to Congress.',
          ],
        },
        {
          question: 'Critics argue that unelected justices with life tenure make policy that should be left to elected officials. This argument is about',
          choices: [
            'the extent of the Supreme Court\'s power',
            'the president\'s veto',
            'congressional redistricting',
            'executive agreements',
          ],
          answer: 0,
          explanations: [
            'Correct. Independence from elections is the root of the debate over judicial power.',
            'Incorrect. The veto is a presidential power.',
            'Incorrect. Redistricting concerns House districts.',
            'Incorrect. Executive agreements are presidential foreign-policy tools.',
          ],
        },
      ],
      revisit:
        'Life tenure → independence from the political climate → unpopular rulings possible → debate over the Court\'s power.',
    },
    {
      id: '2.11',
      ced: 'LO 2.11.A–B',
      title: 'Checks on the Judicial Branch',
      minutes: 6,
      summary:
        'People disagree about how judicial review should be used: judicial activism versus judicial restraint. The other ' +
        'branches can limit the Court through new laws, amendments, appointments, slow implementation and jurisdiction limits.',
      body: String.raw`### Activism vs. restraint
| Judicial activism | Judicial restraint |
|---|---|
| Judicial review lets courts overturn precedent or strike down laws and executive acts | Courts should stick to existing constitutional and case precedent |
| Courts actively correct injustice | Courts defer to elected branches |

Neither label belongs to one party: a court can be "activist" in a liberal or a conservative direction.

### How other branches limit the Court
1. **Congress passes new legislation** to change a decision's effect (for example, rewriting a statute the Court interpreted).
2. **A constitutional amendment** overrides a ruling. The Sixteenth Amendment (1913) allowed a federal income tax after the Court had struck one down.
3. **Appointments and confirmations** shift the Court's ideological balance.
4. **The president or states delay implementation**, since the Court can't enforce its own rulings. Many Southern states stalled school desegregation for years after Brown.
5. **Congress limits jurisdiction**, removing the Court's power to hear certain appeals.

Franklin Roosevelt's 1937 **court-packing plan** to add justices failed, but it shows the pressure presidents can apply.`,
      blocks: [],
      precheck: {
        question: 'Which describes judicial restraint?',
        choices: [
          'Courts should defer to elected branches and follow existing precedent',
          'Courts should actively overturn laws they consider unjust',
          'Courts should refuse to hear any constitutional cases',
          'Courts should follow the president\'s policy goals',
        ],
        answer: 0,
        explanations: [
          'Correct. Restraint means sticking to precedent and deferring to the elected branches.',
          'Incorrect. That is judicial activism.',
          'Incorrect. Restraint still involves deciding cases.',
          'Incorrect. Neither philosophy means following the president.',
        ],
      },
      checkpoints: [
        {
          question: 'After the Supreme Court interprets a federal statute narrowly, Congress passes a new law clarifying that the statute applies more broadly. This is an example of',
          choices: [
            'Congress using legislation to modify the impact of a Supreme Court decision',
            'judicial review',
            'a pocket veto',
            'stare decisis',
          ],
          answer: 0,
          explanations: [
            'Correct. Legislation can change the effect of a ruling based on statutory interpretation.',
            'Incorrect. Judicial review is the courts striking down laws.',
            'Incorrect. A pocket veto is a presidential action.',
            'Incorrect. Stare decisis is courts following precedent.',
          ],
        },
        {
          question: 'Which is the strongest way to overturn a Supreme Court ruling based on the Constitution?',
          choices: [
            'Ratifying a constitutional amendment',
            'Passing an ordinary federal law',
            'Issuing an executive order',
            'Holding a congressional hearing',
          ],
          answer: 0,
          explanations: [
            'Correct. A constitutional ruling can be overridden only by changing the Constitution, as the Sixteenth Amendment did.',
            'Incorrect. An ordinary law can\'t override a constitutional interpretation.',
            'Incorrect. Executive orders can\'t override the Constitution.',
            'Incorrect. A hearing has no legal force over rulings.',
          ],
        },
      ],
      revisit:
        'Activism vs. restraint. Checks on the Court: new legislation, amendments (16th), appointments, delayed implementation, ' +
        'jurisdiction limits. FDR\'s court-packing plan failed but shows the pressure.',
    },
    {
      id: '2.12',
      ced: 'LO 2.12.A',
      title: 'The Bureaucracy',
      minutes: 6,
      summary:
        'The federal bureaucracy (departments, agencies, commissions and government corporations) carries out policy by writing ' +
        'and enforcing regulations, issuing fines, testifying before Congress, and working in iron triangles and issue networks. ' +
        'Most civil servants are hired on merit rather than patronage.',
      body: String.raw`### What the bureaucracy is
- **Departments**: the 15 Cabinet departments, such as State, Defense and Education.
- **Agencies**: such as the Environmental Protection Agency.
- **Commissions**: independent regulatory bodies such as the Securities and Exchange Commission.
- **Government corporations**: businesses run by the government, such as the U.S. Postal Service and Amtrak.

### How it carries out policy
1. **Writing and enforcing regulations**
2. **Issuing fines** to those who break rules
3. **Testifying before Congress**
4. **Iron triangles**: lasting alliances of a congressional committee, an agency and an interest group in one policy area (for example, the armed services committees, the Defense Department and defense contractors)
5. **Issue networks**: temporary coalitions around a common issue

### Merit vs. patronage
The modern civil service mostly uses a **merit system**: hiring and promotion based on professionalism, specialization and neutrality. The alternative is **patronage** (the "spoils system"), in which jobs go to political supporters. The Pendleton Act of 1883 began the shift to merit.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Iron triangle', back: 'Lasting alliance of a congressional committee, an agency and an interest group in one policy area.' },
            { front: 'Issue network', back: 'Temporary coalition of groups, experts and officials around a common issue.' },
            { front: 'Merit system', back: 'Hiring and promotion by professionalism, specialization and neutrality.' },
            { front: 'Patronage', back: 'Government jobs given as rewards to political supporters.' },
            { front: 'Government corporation', back: 'Government-run business, such as the U.S. Postal Service or Amtrak.' },
          ],
        },
      ],
      precheck: {
        question: 'An alliance of the House Agriculture Committee, the Department of Agriculture and a farm lobby is an example of',
        choices: [
          'an iron triangle',
          'an issue network',
          'patronage',
          'a conference committee',
        ],
        answer: 0,
        explanations: [
          'Correct. A committee, an agency and an interest group in one policy area form an iron triangle.',
          'Incorrect. Issue networks are looser, temporary coalitions.',
          'Incorrect. Patronage is giving jobs to political supporters.',
          'Incorrect. A conference committee reconciles House and Senate bills.',
        ],
      },
      checkpoints: [
        {
          question: 'Which describes the merit system in the federal civil service?',
          choices: [
            'Hiring and promotion based on professional qualifications and neutrality',
            'Giving jobs to the president\'s campaign supporters',
            'Electing bureaucrats every four years',
            'Letting interest groups choose agency heads',
          ],
          answer: 0,
          explanations: [
            'Correct. The merit system prioritizes professionalism, specialization and neutrality.',
            'Incorrect. That describes patronage.',
            'Incorrect. Career civil servants are hired, not elected.',
            'Incorrect. Interest groups don\'t appoint officials.',
          ],
        },
        {
          question: 'An agency fines a company for violating air-quality rules. Which bureaucratic function is this?',
          choices: [
            'Enforcing regulations',
            'Testifying before Congress',
            'Forming an issue network',
            'Patronage',
          ],
          answer: 0,
          explanations: [
            'Correct. Issuing fines is part of enforcing regulations.',
            'Incorrect. Testimony happens at congressional hearings.',
            'Incorrect. Issue networks are coalitions, not enforcement.',
            'Incorrect. Patronage concerns hiring.',
          ],
        },
      ],
      revisit:
        'Departments, agencies, commissions, government corporations. Functions: regulations, fines, testimony, iron triangles, ' +
        'issue networks. Merit system (Pendleton Act) vs. patronage.',
    },
    {
      id: '2.13',
      ced: 'LO 2.13.A',
      title: 'Discretionary and Rulemaking Authority',
      minutes: 5,
      summary:
        'Congress often writes laws in general terms and delegates discretion to agencies, which use rulemaking authority to ' +
        'write and enforce detailed regulations. Know what the agencies named in the CED do.',
      body: String.raw`### Delegated discretion
Congress can't write every technical detail into law, so it delegates **discretionary authority** to agencies. Using **rulemaking authority**, agencies interpret the law and create binding **regulations**.

Example: Congress passes a clean air law; the EPA decides the specific pollution limits.

### Agencies named in the CED
| Agency | Main job |
|---|---|
| **Department of Homeland Security** | Border security, immigration enforcement, disaster response |
| **Department of Transportation** | Highways, aviation and auto safety rules |
| **Department of Veterans Affairs** | Health care and benefits for veterans |
| **Department of Education** | Federal school funding and student aid |
| **Environmental Protection Agency (EPA)** | Pollution and environmental rules |
| **Federal Election Commission (FEC)** | Campaign finance law |
| **Securities and Exchange Commission (SEC)** | Stock markets and investor protection |

Sort the tasks below to the agency that handles them.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which agency handles it?',
            buckets: ['EPA', 'FEC', 'SEC', 'Transportation', 'Homeland Security', 'Veterans Affairs'],
            items: [
              { label: 'Setting limits on power-plant emissions', bucket: 0, why: 'The EPA writes and enforces pollution rules.' },
              { label: 'Auditing a campaign\'s donation reports', bucket: 1, why: 'The FEC enforces campaign finance law.' },
              { label: 'Investigating insider trading in stocks', bucket: 2, why: 'The SEC regulates securities markets.' },
              { label: 'Setting airline and auto safety standards', bucket: 3, why: 'The Department of Transportation oversees transportation safety.' },
              { label: 'Screening cargo at border crossings', bucket: 4, why: 'Homeland Security handles border security.' },
              { label: 'Running hospitals for former service members', bucket: 5, why: 'Veterans Affairs provides veterans\' health care.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'Congress passes a law directing safer cars, and an agency then writes detailed crash-test standards. This shows',
        choices: [
          'delegated discretionary and rulemaking authority',
          'judicial review',
          'a pocket veto',
          'logrolling',
        ],
        answer: 0,
        explanations: [
          'Correct. Congress set a broad goal and the agency used delegated authority to write specific rules.',
          'Incorrect. Judicial review is done by courts.',
          'Incorrect. A pocket veto is presidential.',
          'Incorrect. Logrolling is vote trading in Congress.',
        ],
      },
      checkpoints: [
        {
          question: 'Why does Congress delegate rulemaking authority to agencies?',
          choices: [
            'Agencies have the technical expertise to write detailed rules that Congress lacks time and knowledge to write',
            'The Constitution forbids Congress from writing laws',
            'Agencies are elected and more accountable than Congress',
            'Courts require Congress to delegate all decisions',
          ],
          answer: 0,
          explanations: [
            'Correct. Delegation lets experts fill in the details of broad laws.',
            'Incorrect. Lawmaking is Congress\'s core power.',
            'Incorrect. Agency staff are appointed or hired, not elected.',
            'Incorrect. Courts don\'t require delegation.',
          ],
        },
        {
          question: 'Which agency would enforce limits on campaign contributions to candidates?',
          choices: [
            'Federal Election Commission',
            'Securities and Exchange Commission',
            'Environmental Protection Agency',
            'Department of Veterans Affairs',
          ],
          answer: 0,
          explanations: [
            'Correct. The FEC administers federal campaign finance law.',
            'Incorrect. The SEC regulates securities markets.',
            'Incorrect. The EPA handles environmental rules.',
            'Incorrect. Veterans Affairs serves veterans.',
          ],
        },
      ],
      revisit:
        'Congress delegates discretion; agencies use rulemaking to write and enforce regulations. DHS, Transportation, VA, ' +
        'Education, EPA, FEC (campaign finance), SEC (stock markets).',
    },
    {
      id: '2.14',
      ced: 'LO 2.14.A–B',
      title: 'Holding the Bureaucracy Accountable',
      minutes: 5,
      summary:
        'Congress oversees the bureaucracy through reviews, investigations, hearings and the power of the purse, which also ' +
        'checks the president. Presidents steer agencies through appointments and influence, and compliance monitoring checks ' +
        'that rules are followed.',
      body: String.raw`### Congressional oversight
To make sure laws are carried out as intended, Congress uses:
1. **Review, monitoring and supervision** of agencies
2. **Investigations and committee hearings**
3. **The power of the purse**: appropriating or withholding money

Oversight also checks the president, since the agencies are part of the executive branch.

### Presidential control
Presidents appoint agency heads who share their goals, and use their authority and influence to steer how agencies carry out policy. A new president's ideology can shift an agency's priorities without any new law.

### Compliance monitoring
Agencies check that **funds are used properly** and **regulations are followed**. Monitoring can be hard in practice, which can slow or weaken policy implementation.`,
      blocks: [],
      precheck: {
        question: 'Congress cuts an agency\'s budget after hearings reveal misuse of funds. Which tool is Congress using?',
        choices: [
          'The power of the purse',
          'Judicial review',
          'An executive order',
          'A signing statement',
        ],
        answer: 0,
        explanations: [
          'Correct. Controlling funding is Congress\'s strongest check on agencies.',
          'Incorrect. Judicial review is used by courts.',
          'Incorrect. Executive orders come from the president.',
          'Incorrect. Signing statements come from the president.',
        ],
      },
      checkpoints: [
        {
          question: 'How can a new president most directly change an agency\'s priorities?',
          choices: [
            'By appointing agency leaders who share the administration\'s goals',
            'By passing a new budget without Congress',
            'By overturning the agency\'s enabling law',
            'By electing new civil servants',
          ],
          answer: 0,
          explanations: [
            'Correct. Appointments let presidents steer agencies toward their goals.',
            'Incorrect. Budgets require Congress.',
            'Incorrect. Only Congress can repeal a law.',
            'Incorrect. Civil servants are hired, not elected.',
          ],
        },
        {
          question: 'A Senate committee holds hearings into an agency\'s handling of a disaster. This is an example of',
          choices: [
            'congressional oversight',
            'stare decisis',
            'patronage',
            'judicial activism',
          ],
          answer: 0,
          explanations: [
            'Correct. Investigations and hearings are core oversight tools.',
            'Incorrect. Stare decisis is a judicial doctrine.',
            'Incorrect. Patronage concerns hiring supporters.',
            'Incorrect. Judicial activism describes courts.',
          ],
        },
      ],
      revisit:
        'Congress: review and supervision, investigations and hearings, power of the purse (also checks the president). ' +
        'President: appointments and influence. Compliance monitoring checks funds and rules but can be hard.',
    },
    {
      id: '2.15',
      ced: 'LO 2.15.A–B',
      title: 'Policy and the Branches of Government',
      minutes: 4,
      summary:
        'Congress, the president and the courts all have formal and informal ways to hold the bureaucracy accountable. Sharing ' +
        'power among three branches creates many access points for influencing policy, but it also constrains national policymaking.',
      body: String.raw`### Who checks the bureaucracy
| Branch | How |
|---|---|
| **Congress** | Oversight hearings, the power of the purse, writing or rewriting laws |
| **President** | Appointing and removing agency heads, executive orders, budget proposals |
| **Courts** | Ruling that an agency exceeded its legal authority or broke the law |

These branches often want different things, so accountability is real but messy.

### Shared power: access and constraint
- **Multiple access points**: groups that lose in Congress can try the president, an agency or the courts. Interest groups and states use every door.
- **Constraint**: because policy needs cooperation from several branches, national policymaking is slow, and big changes are hard to pass.

### The big takeaway for the unit
Separation of powers and checks and balances mean no branch makes policy alone. Most free-response questions in this unit ask you to explain how one branch can check or influence another in a scenario.`,
      blocks: [],
      precheck: {
        question: 'An interest group loses a fight in Congress and then sues in federal court. This illustrates',
        choices: [
          'multiple access points created by separation of powers',
          'the pocket veto',
          'a conference committee',
          'the merit system',
        ],
        answer: 0,
        explanations: [
          'Correct. Shared power gives groups several places to influence policy.',
          'Incorrect. A pocket veto is a presidential action on bills.',
          'Incorrect. Conference committees reconcile House and Senate bills.',
          'Incorrect. The merit system concerns hiring civil servants.',
        ],
      },
      checkpoints: [
        {
          question: 'Which explains why national policymaking is often slow?',
          choices: [
            'Policy requires cooperation from branches that share and check each other\'s powers',
            'The president can pass laws alone',
            'Courts must approve every bill before it is debated',
            'Agencies are forbidden to write regulations',
          ],
          answer: 0,
          explanations: [
            'Correct. Shared powers constrain policymaking because several actors must agree.',
            'Incorrect. Laws require Congress.',
            'Incorrect. Courts review laws only after cases are brought.',
            'Incorrect. Agencies write regulations through rulemaking.',
          ],
        },
        {
          question: 'A federal court rules that an agency\'s new regulation goes beyond what Congress authorized. Which branch is holding the bureaucracy accountable?',
          choices: [
            'The judicial branch',
            'The legislative branch',
            'The executive branch',
            'State governments',
          ],
          answer: 0,
          explanations: [
            'Correct. Courts check agencies that exceed their legal authority.',
            'Incorrect. Congress isn\'t acting in this scenario.',
            'Incorrect. The agency itself is part of the executive branch.',
            'Incorrect. State governments aren\'t involved here.',
          ],
        },
      ],
      revisit:
        'Congress (oversight, purse, laws), president (appointments, orders) and courts (rulings) hold agencies accountable. ' +
        'Shared power = multiple access points, and constrained, slower policymaking.',
    },
  ],
};

export default pack;
