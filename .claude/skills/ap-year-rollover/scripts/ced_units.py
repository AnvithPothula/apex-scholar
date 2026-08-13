import re, subprocess, os, json, sys

def ced_units(pdf, maxpage=80):
    """A real unit header in 'Course at a Glance' is 'Unit N: Title' followed
    within a couple of lines by an exam-weighting percentage range. Topic
    numbering and running headers never have that, which is what made the
    naive ^Unit N: regex produce '15 units' for Physics 2."""
    txt = subprocess.run(['pdftotext','-f','1','-l',str(maxpage),pdf,'-'],
                         capture_output=True, text=True).stdout
    lines = [l.strip() for l in txt.split('\n')]
    pct = re.compile(r'^\d{1,2}\s*[–-]\s*\d{1,2}\s*%$|^~?\d{1,3}\s*%$')
    out = {}
    for i, l in enumerate(lines):
        m = re.match(r'^Unit (\d+)(?:,? Part \d)?:\s*(.+)$', l)
        if not m: continue
        nxt = [x for x in lines[i+1:i+4] if x][:2]
        w = next((x for x in nxt if pct.match(x)), None)
        if w:
            n = int(m.group(1))
            if n not in out:
                out[n] = (m.group(2).strip(), w)
    return out

if __name__ == '__main__':
    print(json.dumps({k: v for k, v in ced_units(sys.argv[1]).items()}, indent=1))
