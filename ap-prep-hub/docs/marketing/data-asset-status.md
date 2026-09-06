# The original-data post — measured, and blocked

Plan §5.4 calls this the highest-value asset available: *"We AI-graded N
thousand AP free-response answers. Here are the 10 mistakes students make
most."* It is simultaneously a linkable asset, a journalist pitch, a
Reddit-legal post, listicle bait, and something an LLM can cite as fact.

It is also not writable yet. Measured against production on 2026-09-04,
aggregate counts only:

| | count |
|---|---|
| users | 92 |
| users who have ever taken a practice test | **7** |
| practice tests completed | 47 |
| questions answered across all tests | 1,432 |
| **free-response answers among them** | **227** |
| subjects with ≥5 tests | 3 |
| diagnostics completed | 3 |

## Why this blocks it

**The headline would be false.** "N thousand FRQs" is 227, and they come from
seven people — most of them almost certainly you and your testers. Publishing
that as a finding about AP students is not a stretch of the truth, it is a
different claim entirely.

**The privacy gate fails at this n.** §5.4 requires aggregate-only with minimum
cell sizes. At 7 contributors and 3 subjects with meaningful volume, a
per-subject breakdown is 1–3 students per cell. Anyone who knows the user base
could de-anonymise it, and the finding would be noise regardless — three
students scoring badly on a unit is not evidence about that unit.

**It also can't be the growth lever.** The asset needs users to exist, so it
cannot be the thing that produces them. The plan had it at item 7 of 9 for
exactly this reason.

## Threshold to revisit

Roughly **100× the current free-response volume**, and specifically:

- ≥ 500 distinct students who have completed at least one test
- ≥ 20,000 free-response answers graded
- ≥ 30 students per subject in any subject you report on, and report **no
  subject below that line**

At that point the headline is true, the cells are large enough to be honest,
and nobody can be identified.

## What is publishable right now instead

Data about the **exams**, which you already have and which carries zero privacy
risk, rather than data about students, which you don't.

**The composite curves for all 36 subjects.** You researched section weights
from each CED and estimated cut points from released exams. Nobody publishes
the full curve — that is already the score calculator's stated differentiator,
and it is currently buried behind a "Show the curve used" toggle. As a standing
reference page it is linkable, citable, and quotable by an LLM as a fact.

The honesty that makes it credible is the same honesty already in the product:
College Board does not publish cut points, these are estimates, here is the
range and here is the confidence for each subject. That framing is the story —
every competitor presents an estimate as a result.
