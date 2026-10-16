"""Pull one unit's required content out of an AP Course and Exam Description PDF.

Run from ap-prep-hub/:
  python3 <skill>/scripts/ced_unit.py public/ced/ap-chemistry-course-and-exam-description.pdf 3 > /tmp/u3.txt

Prints, as compact text: the unit-at-a-glance (topic list), every topic's
required content (learning objectives, essential knowledge, boundary and
exclusion statements, illustrative examples), and the exam-weighting lines so
you can find this unit's weight. "Optional sources" / sample activities are
dropped; they aren't required content. CEDs without numbered topics (English
Language, English Literature, Seminar, Research) fall back to the unit overview
between "UNIT n" and "UNIT n+1".

This is a reading aid, not the source of truth: page furniture leaks in, words
sometimes run together, and tables flatten. When something matters (a number,
a required case, an exclusion), check it against the PDF itself.
"""
import re
import subprocess
import sys

if len(sys.argv) != 3:
    sys.exit(__doc__)
pdf, unit = sys.argv[1], int(sys.argv[2])
text = subprocess.run(['pdftotext', pdf, '-'], capture_output=True, text=True, check=True).stdout
NOISE = re.compile(r'Course and Exam Description|Return to Table of Contents|Return to contents|© 20\d\d College Board|Course Framework V\.\d|^\d+$|^UNIT$')
lines = [l.strip() for l in text.split('\n') if l.strip() and not NOISE.search(l.strip())]
flat = ' '.join(lines)


def cut_optional(chunk):
    # Optional sources, sample activities and teacher-resource blurbs aren't required content.
    return re.split(r'OPTIONAL SOURCES|OPTIONAL ACTIVITY|SAMPLE INSTRUCTIONAL ACTIVITIES|Unit Planning Notes', chunk)[0]


print('=== exam weighting lines (find this unit\'s) ===')
for m in re.finditer(r'UNIT\s+(\d+)\b[^%]{0,200}?(\d+[–-]\d+%)\s*AP EXAM\s*WEIGHTING', flat):
    print(f'Unit {m.group(1)}: {m.group(2)}')

first = flat.find(f'TOPIC {unit}.1 ')
if first < 0:
    first = flat.find(f'TOPIC {unit}.1')
if first >= 0:
    prev_unit_end = flat.rfind(f'TOPIC {unit - 1}.', 0, first) if unit > 1 else 0
    glances = [m.start() for m in re.finditer('UNIT AT A GLANCE', flat[:first]) if m.start() > prev_unit_end]
    for g in glances:  # the table often spans two pages
        print('\n=== unit at a glance ===')
        print(cut_optional(flat[g:g + 2500]))
    nxt = flat.find(f'TOPIC {unit + 1}.1', first)
    body = flat[first:nxt if nxt > 0 else len(flat)]
    print('\n=== topics (required content) ===')
    seen = set()
    for part in re.split(r'(?=TOPIC \d+\.\d+)', body):
        m = re.match(r'TOPIC (\d+\.\d+)', part)
        if not m:
            continue
        key = (m.group(1), part[:120])
        if key in seen:
            continue
        seen.add(key)
        print('\n' + cut_optional(part).strip()[:6000])
else:
    start = flat.find(f'UNIT {unit}:')
    end = flat.find(f'UNIT {unit + 1}:', start + 10)
    print('\n=== unit overview (no numbered topics in this CED) ===')
    print(flat[start:end if end > 0 else start + 15000] if start >= 0 else 'Unit heading not found; read the PDF.')
