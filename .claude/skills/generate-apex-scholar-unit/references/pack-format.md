# Pack format and rendering rules

Read this before writing a pack. Everything here comes from the validator
(`utils/studyPack.validatePack`, run over every registered pack by
`utils/studyPack.test.js`), the renderer, or a bug that shipped once.

## Contents
1. File shape
2. Sections and questions
3. Blocks: flashcards and simulations
4. Fenced widgets inside a body (steps, graphs)
5. Maths and markdown pitfalls
6. Credits for adapted McCreary material
7. Existing simulation components

## 1. File shape

`src/data/packs/ap<Course>Unit<N>.js`, **import-free** (scripts/prerender.mjs
loads it directly). Header comment: which CED edition and topics it follows,
which exclusion/boundary statements it honours, what the sims are, and where
anything adapted came from.

```js
const fence = (lang, spec) => '```' + lang + '\n' + JSON.stringify(spec) + '\n```';
const steps = (spec) => fence('apex-steps', spec);   // only if used
const graph = (spec) => fence('apex-graph', spec);   // only if used

const pack = {
  slug: 'ap-chemistry/unit-2',              // class id from catalog.js + /unit-N
  subject: 'AP Chemistry',                  // exact subject string
  unit: 'Unit 2: Compound Structure and Properties',
  examWeight: '7–9% of the exam',           // from the CED; courses without unit weights say so
  intro: '…two or three sentences…',
  license: 'CC BY-NC-SA 4.0',               // only with credits
  credits: [ /* see §6 */ ],
  sections: [ /* see §2 */ ],
};

export default pack;
```

## 2. Sections and questions

```js
{
  id: '2.3',                       // CED topic number, or a range '2.9–2.11'; unique
  ced: 'LO 2.3.A; Baker v. Carr',  // what it covers, for the reader of the file
  title: 'Congressional Behavior',
  minutes: 8,                      // > 0; realistic reading + activity time
  summary: '2–3 sentences: the takeaway',
  body: String.raw`### Markdown…`, // String.raw so LaTeX backslashes survive
  blocks: [],                      // optional flashcards / sims (§3)
  precheck: Question,              // asked first in "Skip what I know", reused as the retry
  checkpoints: [Question, Question],
  revisit: 'One dense recap line shown after a miss.',
}
```

Question: `{ question, choices: [4 strings], answer: 0, explanations: [4] }`.
- Exactly four choices, no duplicates (case-insensitive). Put the key first
  (`answer: 0`); the app shuffles per question.
- `explanations[answer]` must start with "Correct", every other with
  "Incorrect". Each explanation says why, naming the specific mistake.
- Maths in a question or choice needs `String.raw` and `$…$`; plain strings
  need doubled backslashes (`'$\\frac{a}{b}$'`).
- Currency inside markdown is `\\$5` in plain strings (`\$5` in String.raw);
  a bare `$` starts maths. Sort and timeline labels are plain text, so write
  "5 dollars" there.

## 3. Blocks

```js
{ type: 'flashcards', cards: [{ front, back }, …] }
{ type: 'sim', sim: 'sort-buckets', props: { title, buckets: [2–6 names], items: [{ label, bucket, why }] } }
{ type: 'sim', sim: 'timeline-order', props: { title, events: [{ year, label, when? }], hideYears?, instruction? } }
{ type: 'sim', sim: 'incline-lab' }      // components that take no props
```
- sort-buckets: 2–6 buckets, at least 3 items, unique labels, valid bucket
  indexes. With ≤3 buckets they wrap; 4 → 2×2 on phones; 5–6 → 2×3.
- timeline-order: at least 3 events, `year` numeric and ascending. Use
  `hideYears: true` with step numbers for processes (how a bill becomes law,
  succession stages), plus an `instruction` such as "tap the steps in the
  order they happen". `when` shows a display date like "c. 2500 BCE".

## 4. Fenced widgets in a body

**Steps** (worked example, revealed one step at a time):
```js
${steps({
  title: '…',          // ≤ 120 chars or it is cut (test enforces)
  steps: [{ title: '…', body: '$…$ with \\\\ doubled backslashes' }],
  answer: '…',
})}
```
**Graph** (sliders over a function; expressions compiled by utils/mathExpr,
which knows `exp ln log(=log10) log2 sqrt abs sin cos tan …` and `^`):
```js
${graph({
  title: '…',                      // ≤ 80 chars
  x: [x0, x1], y: [y0, y1],        // y optional (auto-fit)
  xLabel: '…', yLabel: '…',        // ≤ 30 chars, optional
  curves: [{ expr: 'a * b^x', label: '…' }],          // ≤ 4 curves, label ≤ 40
  params: { a: { min, max, value, step, label } },    // ≤ 4 sliders, label ≤ 40
})}
```
Log base b is `ln(x) / ln(b)`. A test fails if any title or label would be
cut, so keep them short.

## 5. Maths and markdown pitfalls

All of these rendered wrong at least once; most are now enforced by tests,
but check the page anyway.
- **Display equations** go on their own line, `$$…$$`, with a blank line
  before and after. The preprocessor turns that line into real display maths.
  Glued to a neighbouring line, it renders inline mid-sentence.
- **Phone width.** A display equation must fit about 328 px (a 360 px phone).
  Don't join several formulas with `\qquad` on one line; give each its own
  `$$` line, or use `\begin{aligned} … \\ … \end{aligned}` for a long chain.
  Keep prose annotations out of the maths.
- **No `·` (middle dot) inside maths.** Inside `\text{}` it renders as red
  `\cdotp`. Write `\text{N}\cdot\text{m}`.
- **No `|` inside maths in a table row.** It splits the cell. Use
  `\lvert x \rvert`.
- **Tables:** at most 3 columns, or they scroll sideways on phones. Turn wider
  comparisons into a list per item. Inline maths can't wrap, so a cell with a
  long formula forces the table wide even at 3 columns; put formulas in a list.
- Headings start at `###`. Bold sparingly. Keep paragraphs short; this is
  read on phones.

## 6. Credits for adapted McCreary material

The intelligent textbooks are CC BY-NC-SA 4.0. If you adapt text, examples,
or rebuild a MicroSim, add both fields; StudyPack renders the attribution.
```js
license: 'CC BY-NC-SA 4.0',
credits: [{
  title: 'Introduction to Physics',
  author: 'Dan McCreary',
  url: 'https://dmccreary.github.io/intro-to-physics-course/',
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  note: 'The incline simulation is rebuilt from its inclined-plane and static friction MicroSims.',
}],
```
Also name the source in the component's doc comment ("Modeled on … MicroSim in
Dan McCreary's …, rebuilt as an Apex component"). Don't credit a book you
only glanced at.

## 7. Existing simulation components

Register new ones in `SIMS` in `src/pages/StudyPack.jsx`. The key is the `sim:` name.

| sim | What it does |
|---|---|
| `polymer-builder` | Dehydration synthesis vs hydrolysis, join and split monomers |
| `saturation-slider` | Double bonds in fatty-acid tails vs packing |
| `neuron-firing` | Threshold, all-or-nothing, firing rate |
| `sa-volume` | Surface-area-to-volume ratio of a growing cell (McCreary Biology) |
| `tonicity` | Osmosis in animal and plant cells (McCreary Biology) |
| `serial-position` | A real serial-position memory experiment |
| `projectile-launcher` | Horizontal vs vertical velocity in projectile motion |
| `energy-pyramid` | The 10% rule across trophic levels |
| `mercator-distortion` | Map projection area distortion by latitude |
| `pes-builder` | Electron configuration → photoelectron spectrum |
| `outlier-pull` | Mean/SD vs median/IQR resistance to an outlier |
| `pv-process` | Thermodynamic processes, W, Q, ΔU on a PV diagram |
| `field-map` | Electric field of two point charges |
| `ppc-explorer` | Production possibilities and opportunity cost |
| `java-arithmetic` | int vs double, `/`, `%` and casts in Java |
| `string-lab` | Java String methods, substring indices and exceptions |
| `password-space` | Password search space and crack time |
| `scale-builder` | Major scales, key signatures, audio playback |
| `meter-lab` | Simple and compound meter with an audible click track |
| `case-lab` | Latin cases: word order doesn't change meaning |
| `boolean-search` | AND / OR / NOT database searching |
| `incline-lab` | Static vs kinetic friction on an incline, FBD (McCreary Physics) |
| `vsepr-explorer` | VSEPR shapes, angles, hybridization, polarity (McCreary Chemistry) |
| `sort-buckets` | Classification activity (props) |
| `timeline-order` | Ordering activity (props) |
