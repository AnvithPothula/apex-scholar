/**
 * AP Cybersecurity Unit 1: Introduction to Security — study pack.
 *
 * Written against the AP Cybersecurity CED effective Fall 2026 (the course's
 * first edition; topics 1.1–1.5). The exam is weighted by skill (analyze risk,
 * mitigate risk, detect attacks), not by unit. Defensive content only: how to
 * recognize attacks and protect yourself. Activities: sorting social
 * engineering tactics and wireless attacks, and a password search-space sim.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-cybersecurity/unit-1',
  subject: 'AP Cybersecurity',
  unit: 'Unit 1: Introduction to Security',
  examWeight: 'no unit weighting (the exam is weighted by skill: analyze risk, mitigate risk, detect attacks)',
  intro:
    'Security starts with people. This unit covers how attackers manipulate people (social engineering), how password attacks work ' +
    'and how to make logins stronger, the risks of public Wi-Fi, how AI makes attacks more convincing, and how defenders use AI to fight back.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A–C',
      title: 'Understanding Social Engineering',
      minutes: 6,
      summary:
        'Social engineering uses psychological tactics to get people to reveal information (elicitation), download malicious files or ' +
        'click malicious links, by email, text, social media or in person. Intimidation threatens negative consequences; urgency ' +
        'pushes people to act fast before thinking. Victims can lose personal data, one-time codes or control of their devices.',
      body: String.raw`### What it is
**Social engineering** manipulates people rather than machines: getting a target to **reveal sensitive information** (called **elicitation**), **download a malicious file** or **click a malicious link**. It happens in person, but more often by **email, text message or social media**.

### The two tactics the CED names
| Tactic | How it works | Why it works | Example |
|---|---|---|---|
| **Intimidation** | Threatens negative consequences if you don't comply | People naturally avoid bad outcomes; fear drives action | "Your account will be closed and reported for fraud unless you verify now." |
| **Urgency** | Gives reasons you must act quickly | Time pressure stops people from checking whether a request is reasonable or safe | "Only 10 minutes left to claim your refund!" |

Many messages use **both**.

### What victims can lose
- **Personal information** (name, phone, address, workplace, pets' names, birthdate) that enables impersonation, and that often answers websites' **security challenge questions**.
- **Secure information** like a **one-time password (OTP)** or login code, letting the attacker log in as the victim.
- **Malware** from a download or link that can steal browser data, or a fake login page that **captures credentials**.

### Defend yourself
Slow down. Verify the sender through a channel you already trust. Never share a one-time code someone asks you for: real services don't ask.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which tactic does each message use?',
            buckets: ['Urgency', 'Intimidation', 'Both'],
            items: [
              { label: '"Flash sale: this gift card offer expires in 5 minutes. Click now!"', bucket: 0, why: 'Time pressure, no threat.' },
              { label: '"This is the school IT office. Ignore this and your account will be permanently deleted."', bucket: 1, why: 'A threatened consequence.' },
              { label: '"Final notice: pay the overdue fine within 1 hour or a warrant will be issued for your arrest."', bucket: 2, why: 'A deadline plus a threat.' },
              { label: '"Your package is waiting. Confirm your address today so it isn\'t returned."', bucket: 0, why: 'A mild deadline to rush you.' },
              { label: '"We detected illegal downloads on your device. Report to us or face legal action."', bucket: 1, why: 'Fear of legal consequences.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A text says, "Your bank account is locked. Reply with the code we just sent within 10 minutes or lose access permanently." Which tactics are being used?',
        choices: ['Urgency and intimidation', 'Only urgency', 'Only intimidation', 'Neither; this is a normal bank message'],
        answer: 0,
        explanations: [
          'Correct. A short deadline (urgency) plus a threatened loss (intimidation).',
          'Incorrect. "Lose access permanently" is also a threat.',
          'Incorrect. "Within 10 minutes" also creates urgency.',
          'Incorrect. Banks don\'t ask you to send them your one-time codes.',
        ],
      },
      checkpoints: [
        {
          question: 'Why is giving away your pet\'s name or birthdate to a stranger online risky?',
          choices: [
            'Such details are often answers to websites\' security challenge questions',
            'It can physically damage your device',
            'It automatically installs malware',
            'It has no security impact',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED notes these details are used to verify identity and enable impersonation.',
            'Incorrect. Sharing information doesn\'t damage hardware.',
            'Incorrect. Malware comes from files or links.',
            'Incorrect. It can enable impersonation.',
          ],
        },
        {
          question: 'Getting a target to reveal sensitive information through conversation is called:',
          choices: ['Elicitation', 'Jamming', 'War driving', 'Encryption'],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s term.',
            'Incorrect. Jamming is a wireless denial-of-service attack.',
            'Incorrect. War driving searches for wireless networks.',
            'Incorrect. Encryption protects data.',
          ],
        },
      ],
      revisit:
        'Social engineering: manipulate people into revealing info (elicitation), downloading files or clicking links. Tactics: ' +
        'intimidation (threats) and urgency (time pressure). Losses: personal info, OTPs, malware, stolen credentials.',
    },
    {
      id: '1.2',
      ced: '1.2.A–C',
      title: 'Suspicious Website Logins',
      minutes: 7,
      summary:
        'Online password attacks try common passwords, common patterns or stolen passwords. Signs: many failed logins in a short time, ' +
        'logins at unusual times, logins from unknown devices. People reuse predictable patterns (word + two-digit year + symbol, names, ' +
        'dates), so attackers build personal dictionaries. Defend with long, random, unique passwords or passphrases, a password manager, and MFA.',
      body: String.raw`### Spotting a password attack
In an **online password attack**, adversaries try logging in with **common passwords**, **common patterns** or **stolen passwords**. Warning signs:
- **Many failed login attempts** in a short time
- Login attempts at **unusual times**
- Login attempts from **unknown devices**

### Why weak passwords fall
People follow patterns:
- one or two words + a **two-digit number** (often a year) + a **special character** at the end (e.g., *Soccer24!*)
- **names of family or pets**
- **personally significant dates**

Attackers gather a target's personal details (birthday, anniversary, pets, family) and build a **custom dictionary** of likely passwords, then submit them with an **automated tool**.

### Making authentication stronger
1. **Long, random, unique** passwords, a different one for every account. A **password manager** can generate and store them; or use a long, unique **passphrase**.
2. **Avoid** names, dates and other personally meaningful words or numbers.
3. Turn on **multifactor authentication (MFA)**: an extra proof of identity, like a one-time code, on top of the password.

Try the simulation: see how length and true randomness change the number of possibilities.`,
      blocks: [{ type: 'sim', sim: 'password-space' }],
      precheck: {
        question: 'Which is a sign of an online password attack on an account?',
        choices: [
          'Dozens of failed login attempts within a few minutes',
          'One successful login from your usual laptop',
          'A password reset you requested yourself',
          'Logging in at your normal time',
        ],
        answer: 0,
        explanations: [
          'Correct. Many failed attempts in a short time is a classic sign.',
          'Incorrect. That is normal activity.',
          'Incorrect. A reset you started yourself isn\'t an attack.',
          'Incorrect. Unusual times are the warning sign, not normal ones.',
        ],
      },
      checkpoints: [
        {
          question: 'An attacker learns a target\'s dog is named Max and she was born in 2009. Which password is most at risk?',
          choices: ['Max2009!', 'correct-orbit-lantern-fig', 'q7#Lp2vX9!mR', 'A different random password for each site'],
          answer: 0,
          explanations: [
            'Correct. It follows the name + year + symbol pattern built from personal details.',
            'Incorrect. A random multi-word passphrase isn\'t based on personal details.',
            'Incorrect. A long random string resists dictionary attacks.',
            'Incorrect. Unique random passwords are the recommended defense.',
          ],
        },
        {
          question: 'How does multifactor authentication (MFA) protect an account if the password is stolen?',
          choices: [
            'The attacker still needs a second proof of identity, like a one-time code',
            'It makes the password longer automatically',
            'It hides the account from attackers',
            'It deletes the account after one failed login',
          ],
          answer: 0,
          explanations: [
            'Correct. A stolen password alone isn\'t enough.',
            'Incorrect. MFA adds a factor; it doesn\'t change the password.',
            'Incorrect. The account is still visible.',
            'Incorrect. MFA doesn\'t delete accounts.',
          ],
        },
      ],
      revisit:
        'Signs: many failed logins quickly, unusual times, unknown devices. Weak patterns: word + year + symbol, names, dates → ' +
        'personal dictionaries. Defense: long, random, unique passwords or passphrases, a password manager, MFA.',
    },
    {
      id: '1.3',
      ced: '1.3.A–C',
      title: 'Best Practices for Public Networks',
      minutes: 7,
      summary:
        'Low-skilled adversaries use purchased tools against known vulnerabilities; high-skilled ones build or adapt tools and find ' +
        'zero days. Motivations include greed, recognition, causes, revenge, politics and beliefs. Wireless attacks include evil twins, ' +
        'jamming (a denial of service) and war driving. Verify network names exactly, weigh unencrypted Wi-Fi carefully, and consider a VPN.',
      body: String.raw`### Who attacks, and why
| Skill level | What they do |
|---|---|
| **Low-skilled** | Use malicious tools others made, often bought online, that exploit **known** vulnerabilities |
| **High-skilled** | Create or modify tools to beat new defenses; can discover undocumented vulnerabilities, called **zero days** |

**Motivations**: greed, desire for recognition, dedication to a cause, revenge, politics, beliefs.

### Wireless attacks
| Attack | What happens |
|---|---|
| **Evil twin** | The adversary sets up a wireless access point (WAP) whose network name (**SSID**) is similar or identical to a real one. Victims who connect to it let the adversary capture their traffic, though **encrypted traffic like HTTPS can't be read**. |
| **Jamming** | The adversary floods the area with a strong electromagnetic signal on the network's frequencies, blocking legitimate traffic: a **denial of service (DoS)** attack. |
| **War driving** | The adversary drives or walks around a target detecting wireless beacons, learning the network type and where the signal leaks **outside the building**. |

### Protecting yourself on Wi-Fi
- Check that a network's name **exactly** matches the one you mean to join.
- Most internet traffic is encrypted, but some (like **DNS queries**) may not be; consider how sensitive your activity is before joining **unencrypted** Wi-Fi.
- A **VPN** encrypts all your traffic to the VPN operator, so the local network and service provider can't see it, **but the VPN provider can**.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Which wireless attack is described?',
            buckets: ['Evil twin', 'Jamming', 'War driving'],
            items: [
              { label: 'A café\'s Wi-Fi is "BeanCafe"; someone nearby broadcasts "BeanCafe_Free" and logs the traffic of anyone who joins', bucket: 0, why: 'A look-alike access point capturing traffic.' },
              { label: 'Nobody in an office can connect because a device is blasting a strong signal on the Wi-Fi frequencies', bucket: 1, why: 'Flooding the frequency causes a denial of service.' },
              { label: 'A person walks around a bank with a laptop mapping where its Wi-Fi signal reaches the parking lot', bucket: 2, why: 'Searching for beacons and signal leakage.' },
              { label: 'An attacker copies a hotel network\'s exact name so guests\' devices connect to the attacker instead', bucket: 0, why: 'An identical SSID on the adversary\'s access point.' },
            ],
          },
        },
      ],
      precheck: {
        question: 'A previously unknown vulnerability that the software\'s makers haven\'t documented or fixed is called a:',
        choices: ['Zero day', 'Evil twin', 'VPN', 'SSID'],
        answer: 0,
        explanations: [
          'Correct. High-skilled adversaries can discover zero days.',
          'Incorrect. That is a fake wireless access point.',
          'Incorrect. A VPN is a protective tool.',
          'Incorrect. An SSID is a network\'s name.',
        ],
      },
      checkpoints: [
        {
          question: 'You use a VPN on public Wi-Fi. Who can still see your traffic?',
          choices: [
            'The VPN provider',
            'The coffee shop\'s Wi-Fi operator',
            'Anyone on the same Wi-Fi network',
            'No one at all',
          ],
          answer: 0,
          explanations: [
            'Correct. Traffic is encrypted to the VPN operator, who can view it.',
            'Incorrect. The VPN hides your traffic from the local network.',
            'Incorrect. Encryption to the VPN protects you from others on the network.',
            'Incorrect. The VPN provider can see it.',
          ],
        },
        {
          question: 'Someone connects to an evil twin network and visits a site using HTTPS. What can the adversary read?',
          choices: [
            'Not the encrypted HTTPS content',
            'Every password typed on the HTTPS site',
            'The full text of the HTTPS pages',
            'Nothing, because evil twins can\'t capture traffic',
          ],
          answer: 0,
          explanations: [
            'Correct. The CED notes adversaries can\'t read traffic using an encrypted protocol like HTTPS.',
            'Incorrect. HTTPS encrypts what is typed on the site.',
            'Incorrect. That content is encrypted.',
            'Incorrect. Evil twins do capture traffic; they just can\'t read encrypted parts.',
          ],
        },
      ],
      revisit:
        'Low-skilled: bought tools, known vulnerabilities; high-skilled: custom tools, zero days. Motives: greed, recognition, cause, ' +
        'revenge, politics, beliefs. Evil twin, jamming (DoS), war driving. Check SSIDs exactly; weigh unencrypted Wi-Fi; VPN provider can see traffic.',
    },
    {
      id: '1.4',
      ced: '1.4.A–B',
      title: 'AI-Based Cybersecurity Attacks',
      minutes: 6,
      summary:
        'Adversaries use AI to clone voices and faces, write fluent phishing in any language, extract sensitive data from LLMs, poison ' +
        'training data with false websites, scan public posts for reconnaissance, and help write malware or find vulnerabilities. ' +
        'Defenses: shared secrets with family and friends, MFA, never entering sensitive data into AI tools, and verifying AI output with reliable sources.',
      body: String.raw`### How AI augments attacks
| Technique | What it enables |
|---|---|
| **Voice and image cloning** | A digital avatar of a real person to impersonate them on a call or video, leading to financial loss or leaked information; a growing risk as voice-based authentication spreads |
| **Generative AI phishing** | Fluent phishing in any language: unnatural wording, once a giveaway, is no longer a reliable clue |
| **Prompt-based extraction** | Crafted prompts that pull sensitive information out of an LLM, from user input or training data |
| **Data poisoning** | Publishing false information online so it ends up in LLM training sets and gets repeated |
| **AI reconnaissance** | Tools that scan social media and public websites to profile a target |
| **AI-assisted coding** | Help writing malware, modifying code to act maliciously, or finding vulnerabilities in large code bases |

### Protecting yourself
1. **Shared secrets**: agree on a secret word or phrase with close friends and family to verify identity in high-stakes moments ("Grandma, what's our word?").
2. **MFA**: if your voice is cloned to beat voice authentication, a second factor can still stop the attacker.
3. **Don't enter personal or sensitive data** into AI chatbots or assistants; some use input for further training, and adversaries might extract it.
4. **Verify AI output** with reputable, stable, non-AI sources.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Voice cloning risk', back: 'Impersonation on calls or video; worse as voice-based authentication spreads.' },
            { front: 'Why fluent phishing is dangerous', back: 'Bad grammar used to reveal phishing; AI writes like a native speaker in any language.' },
            { front: 'Data poisoning', back: 'Planting false information online so LLMs trained on it repeat it.' },
            { front: 'Shared secret', back: 'A word or phrase known only to two people, used to confirm identity in high-stakes situations.' },
          ],
        },
      ],
      precheck: {
        question: 'Your "cousin" calls in a panic asking you to wire money, and the voice sounds exactly right. What is the best defense the CED recommends?',
        choices: [
          'Ask for a shared secret word you agreed on in advance',
          'Send the money quickly before it is too late',
          'Trust the call because the voice matches',
          'Ask an AI chatbot whether the call is real',
        ],
        answer: 0,
        explanations: [
          'Correct. A pre-arranged secret verifies identity even if a voice is cloned.',
          'Incorrect. Urgency is exactly what the attacker wants.',
          'Incorrect. AI can clone voices from existing samples.',
          'Incorrect. A chatbot can\'t verify the caller\'s identity.',
        ],
      },
      checkpoints: [
        {
          question: 'Why is poor grammar no longer a reliable way to spot phishing?',
          choices: [
            'Generative AI can write fluent messages in any language',
            'Phishing emails are now illegal',
            'Email filters fix all grammar',
            'Attackers stopped using email',
          ],
          answer: 0,
          explanations: [
            'Correct. LLMs produce native-sounding text.',
            'Incorrect. Phishing was always illegal; that isn\'t the reason.',
            'Incorrect. Filters don\'t rewrite messages.',
            'Incorrect. Email phishing is still common.',
          ],
        },
        {
          question: 'An adversary publishes many fake web pages with false claims hoping AI models will learn and repeat them. This is:',
          choices: ['Poisoning training data', 'Jamming', 'Elicitation', 'War driving'],
          answer: 0,
          explanations: [
            'Correct. False information in training sets gets repeated by LLMs.',
            'Incorrect. Jamming blocks wireless signals.',
            'Incorrect. Elicitation targets people directly.',
            'Incorrect. War driving maps wireless networks.',
          ],
        },
      ],
      revisit:
        'AI attacks: voice/image cloning, fluent phishing, prompt extraction, data poisoning, recon, AI-assisted malware. Defend: ' +
        'shared secrets, MFA, keep sensitive data out of AI tools, verify AI output with reliable sources.',
    },
    {
      id: '1.5',
      ced: '1.5.A–B',
      title: 'Leveraging AI in Cyber Defense',
      minutes: 5,
      summary:
        'AI tools can review security configurations, analyze code for vulnerabilities and suggest detection rules, but a knowledgeable ' +
        'human must review every recommendation. Because networks generate millions of events a day, AI can sort likely malicious ' +
        'events from harmless ones, alert people or take corrective action, and speed up response.',
      body: String.raw`### AI as an assistant, with a human in the loop
| AI can | Before it's used |
|---|---|
| Review **security configurations** (firewall rules, access controls) and recommend safer settings | A knowledgeable **security technician** checks it |
| Analyze **application code** for vulnerabilities and recommend fixes | A knowledgeable **programmer** reviews it |
| Suggest **rules for automated detection systems** | A knowledgeable **detection engineer** reviews it |

### Faster, more accurate detection
- Networks produce **millions of digital events** a day; some are probably an adversary at work, and **humans can't examine them all**.
- AI can be **trained to sort** likely malicious events from harmless ones quickly.
- It can **alert** cybersecurity staff or take **specific corrective actions** depending on the activity.
- The result: teams catch malicious activity and **intervene quickly**, preventing loss, harm, damage and destruction.

The same theme runs through Topics 1.4 and 1.5: AI is powerful on both sides, and **human judgment** decides whether it helps or hurts.`,
      blocks: [],
      precheck: {
        question: 'An AI tool recommends changing a company\'s firewall rules. What should happen next, according to the CED?',
        choices: [
          'A knowledgeable security technician reviews the recommendation before it is applied',
          'The change is applied immediately',
          'The recommendation is ignored because AI is never useful',
          'Users vote on the change',
        ],
        answer: 0,
        explanations: [
          'Correct. Every AI recommendation should be checked by a knowledgeable human.',
          'Incorrect. Unreviewed changes could create new vulnerabilities.',
          'Incorrect. The CED describes real benefits of AI tools.',
          'Incorrect. Security changes need expert review, not a vote.',
        ],
      },
      checkpoints: [
        {
          question: 'Why are AI tools especially useful for threat detection?',
          choices: [
            'Networks generate millions of events daily, more than humans can examine',
            'AI never makes mistakes',
            'Adversaries cannot use AI',
            'AI removes the need for security staff',
          ],
          answer: 0,
          explanations: [
            'Correct. AI can sort huge volumes of events quickly.',
            'Incorrect. That is why human review matters.',
            'Incorrect. Topic 1.4 shows adversaries use AI too.',
            'Incorrect. AI alerts staff; people still respond and review.',
          ],
        },
        {
          question: 'An AI system detects a likely attack. Which actions can it be programmed to take?',
          choices: [
            'Alert human staff or take specific corrective actions',
            'Only delete all network data',
            'Nothing until the next day',
            'Publish the attack details publicly',
          ],
          answer: 0,
          explanations: [
            'Correct. That is how AI speeds up response.',
            'Incorrect. That would cause harm, not prevent it.',
            'Incorrect. Speed is the point.',
            'Incorrect. That isn\'t a corrective action.',
          ],
        },
      ],
      revisit:
        'AI reviews configurations, code and detection rules, always with expert human review. It sorts millions of events, alerts ' +
        'staff or takes corrective action, enabling fast response.',
    },
  ],
};

export default pack;
