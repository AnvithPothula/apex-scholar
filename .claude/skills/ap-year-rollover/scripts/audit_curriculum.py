#!/usr/bin/env python3
"""Diff every CED on disk against the app's curriculum data.

Run from ap-prep-hub/.  Reports, per subject, whether the unit list in
src/constants/curriculum/*.js still matches the CED's "Course at a Glance".

Known limitation, deliberately not "fixed": a few curriculum files omit the
"Unit N:" prefix (AP United States History uses "Period N:", AP Comparative
Government uses bare titles). Those are reported as UNREADABLE rather than as
drift — the data is fine, the regex simply cannot see it. Treating them as drift
once led to a wrong conclusion, so they are called out separately.
"""
import re, os, sys, json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ced_units import ced_units

CUR = 'src/constants/curriculum/'
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())


def load_maps():
    ced_src = open('src/services/cedSearch.js').read()
    subj_pdf = dict(re.findall(r"'([^']+)':\s*'([^']+\.pdf)'", ced_src))
    idx = open(CUR + 'index.js').read()
    key_file = dict(re.findall(r"(\w+):\s*\(\)\s*=>\s*import\('\./([^']+)'\)", idx))
    key_name = dict(re.findall(r'(\w+):\s*"(AP [^"]+)"', idx))
    return subj_pdf, key_file, key_name


def main():
    subj_pdf, key_file, key_name = load_maps()
    drift, unreadable, ok, no_units = [], [], [], []

    for key, fname in sorted(key_file.items()):
        name = key_name.get(key)
        pdf = subj_pdf.get(name or '')
        jsp = f'{CUR}{fname}.js'
        if not (name and pdf and os.path.exists('public/ced/' + pdf) and os.path.exists(jsp)):
            continue

        cu = ced_units('public/ced/' + pdf)
        app = re.findall(r'name:\s*"(Unit [^"]+)"', open(jsp).read())

        if not cu:
            no_units.append(name)          # CED has no weighted unit table
        elif not app:
            unreadable.append((name, fname, len(cu)))
        else:
            ced_titles = [f'Unit {n}: {t}' for n, (t, w) in sorted(cu.items())]
            # pdftotext truncates long titles mid-phrase ("Differentiation:
            # Definition and" for "...and Fundamental Properties") and sometimes
            # glues on trailing words. Compare by prefix in either direction, or
            # every long unit name reads as drift.
            def same(a, b):
                a, b = norm(a), norm(b)
                return a.startswith(b[:24]) or b.startswith(a[:24])
            # A CED shared by two courses (Calculus AB *and* BC) lists every unit
            # of both. The shorter course legitimately has a prefix of that list.
            shared_prefix = (len(app) < len(ced_titles)
                             and all(same(x, y) for x, y in zip(app, ced_titles)))
            if len(app) == len(ced_titles) and all(same(x, y) for x, y in zip(app, ced_titles)):
                ok.append(name)
            elif shared_prefix:
                ok.append(name + ' (subset of a shared CED)')
            elif len(ced_titles) < len(app) and all(
                    any(same(c, a) for a in app) for c in ced_titles):
                ok.append(name + ' (CED table partly unextractable; all found)')
            else:
                drift.append({'subject': name, 'file': fname,
                              'app': app, 'ced': ced_titles})

    print(f'OK ({len(ok)}): ' + ', '.join(ok) or 'OK: none')
    print()
    if no_units:
        print(f'CED publishes no weighted unit table ({len(no_units)}) — verify by hand:')
        print('  ' + ', '.join(no_units) + '\n')
    if unreadable:
        print(f'UNREADABLE by this script ({len(unreadable)}) — different unit naming, NOT drift:')
        for n, f, c in unreadable:
            print(f'  {n} ({f}.js) — CED has {c} units')
        print()
    if drift:
        print(f'DRIFT ({len(drift)}) — app does not match the CED:')
        for d in drift:
            print(f"\n  {d['subject']}  ({len(d['app'])} app / {len(d['ced'])} CED)")
            print('    APP: ' + ' | '.join(x[:44] for x in d['app'][:10]))
            print('    CED: ' + ' | '.join(x[:44] for x in d['ced'][:10]))
        json.dump(drift, open('/tmp/ap_drift.json', 'w'), indent=1)
        print('\n  -> /tmp/ap_drift.json')
    else:
        print('No drift detected.')
    return 1 if drift else 0


if __name__ == '__main__':
    sys.exit(main())
