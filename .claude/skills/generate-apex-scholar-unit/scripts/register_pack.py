"""Register a study pack: packs/index.js entry, routeMeta (class + unit) and sitemap.

Run from ap-prep-hub/:
  python3 <skill>/scripts/register_pack.py SLUG FILE SUBJECT UNIT_TITLE META_TITLE META_DESC [CLASS_TITLE CLASS_DESC]

  SLUG        e.g. ap-chemistry/unit-3 (the class part must match catalog.js ids)
  FILE        pack module name without .js, e.g. apChemistryUnit3
  SUBJECT     exact subject string used by the app, e.g. "AP Chemistry"
  UNIT_TITLE  e.g. "Unit 3: Properties of Substances and Mixtures"
  META_TITLE  <= 65 chars, unique across routeMeta
  META_DESC   51-170 chars, unique across routeMeta (a test enforces both)
  CLASS_*     only needed the first time a class gets a pack

Idempotent: re-running skips anything already registered.
"""
import sys

if len(sys.argv) < 7:
    sys.exit(__doc__)
slug, file, subject, title, mtitle, mdesc = sys.argv[1:7]
ctitle, cdesc = (sys.argv[7:9] + [None, None])[:2]
file = file.removesuffix('.js')
cls = slug.split('/')[0]
assert len(mtitle) <= 65, f'meta title is {len(mtitle)} chars (max 65)'
assert 51 <= len(mdesc) <= 170, f'meta description is {len(mdesc)} chars (51-170)'
esc = lambda t: t.replace("'", "\\'")

p = 'src/data/packs/index.js'
s = open(p).read()
if f"'{slug}'" not in s:
    entry = f"""  '{slug}': {{
    subject: '{esc(subject)}',
    title: '{esc(title)}',
    file: '{file}',
    load: () => import('./{file}'),
  }},
"""
    marker = "};\n\n/** The first pack for a subject"
    assert s.count(marker) == 1, 'index.js layout changed; register by hand'
    open(p, 'w').write(s.replace(marker, entry + marker, 1))

p = 'src/constants/routeMeta.js'
s = open(p).read()
anchor = "  '/ai-tutors': {"
routes = [(f'/study/{slug}', mtitle, mdesc)]
if f"'/study/{cls}':" not in s:
    assert ctitle and cdesc, f'first pack for {cls}: pass CLASS_TITLE and CLASS_DESC'
    routes.insert(0, (f'/study/{cls}', ctitle, cdesc))
add = ''.join(f"""  '{r}': {{
    title: '{esc(t)}',
    description:
      '{esc(d)}',
  }},
""" for r, t, d in routes if f"'{r}':" not in s)
assert s.count(anchor) == 1, 'routeMeta.js layout changed; register by hand'
open(p, 'w').write(s.replace(anchor, add + anchor))

p = 'public/sitemap.xml'
s = open(p).read()
anchor = """  <url>
    <loc>https://apex-scholar.com/study/ap-biology/unit-1</loc>"""
add = ''.join(f"""  <url>
    <loc>https://apex-scholar.com/study/{loc}</loc>
    <changefreq>{freq}</changefreq>
    <priority>0.8</priority>
  </url>
""" for loc, freq in [(cls, 'weekly'), (slug, 'monthly')] if f'/study/{loc}</loc>' not in s)
assert s.count(anchor) == 1, 'sitemap.xml layout changed; register by hand'
open(p, 'w').write(s.replace(anchor, add + anchor, 1))
print('registered', slug)
