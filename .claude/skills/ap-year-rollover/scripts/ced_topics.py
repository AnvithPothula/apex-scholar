import re, subprocess

STOP = re.compile(r'^(SUGGESTED SKILL|Required Course Content|LEARNING OBJECTIVE|ESSENTIAL KNOWLEDGE|ILLUSTRATIVE|AP |UNIT|Course Framework|Return to|TOPIC|\d+$|©)', re.I)

def topics(pdf, maxpage=400):
    """Each topic has its own page whose heading is the FULL title, wrapped over
    a few lines at full width. Course at a Glance puts the same titles in narrow
    columns, where pdftotext truncates them mid-phrase — which is why the
    column-based extractor produced fragments like "Introduction to"."""
    txt = subprocess.run(['pdftotext','-f','1','-l',str(maxpage),pdf,'-'],
                         capture_output=True, text=True).stdout
    lines = [l.strip() for l in txt.split('\n')]
    out, seen = {}, set()
    for i, l in enumerate(lines):
        m = re.match(r'^TOPIC\s+(\d{1,2})\.(\d{1,2})$', l)
        if not m: continue
        unit, num = int(m.group(1)), int(m.group(2))
        if (unit, num) in seen: continue
        parts = []
        for nxt in lines[i+1:i+9]:
            if not nxt: 
                if parts: break
                continue
            if STOP.match(nxt): 
                if parts: break
                continue
            if len(parts) >= 4: break
            parts.append(nxt)
            if nxt.endswith(('.', '?')): break
        title = re.sub(r'\s+', ' ', ' '.join(parts)).strip(' .·—-')
        # Some CEDs give course SKILLS their own TOPIC-numbered pages, and a few
        # leak learning objectives. Neither is a topic: skills are verb-led
        # instructions ("Identify and describe...") and run long.
        if len(title) < 3 or title[0].islower(): continue
        if len(title) > 70: continue
        if re.match(r'^(Identify|Describe|Explain|Analyze|Analyse|Compare|Evaluate|Develop|Apply|Determine|Justify|Calculate|Represent|Support|Make|Use|Create|Argumentation|Mathematical Routines|Concept Explanation|Data Analysis|Visual Analysis|Source Analysis|Claims and Evidence|Question and Method)\b', title): continue
        seen.add((unit, num))
        out.setdefault(unit, []).append(title)
    return out
