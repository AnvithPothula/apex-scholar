// Rendering sweep for study packs. Paste the whole file into the Browser
// pane's javascript_tool on any page of the dev server (http://localhost:3000),
// after editing SLUGS and WIDTHS. It runs in the background (the tool times out
// after ~45 s, a sweep takes ~5 s per page per width), so poll with:
//   JSON.stringify([window.__sweepDone, window.__sweep.filter((r) => r.problems.length)])
//
// It loads each pack in an iframe at each width (+6 px for the scrollbar),
// opens "Full lessons" so every section renders, and reports per page:
//   - KaTeX errors and red KaTeX (unknown commands render in #cc0000)
//   - raw markdown or LaTeX that leaked into the text (**, ###, $$, \frac, $x^2$)
//   - horizontal page overflow, tables that scroll sideways, SVGs wider than
//     the page, display equations too wide for the column (they scroll)
//   - the ErrorBoundary message
//   - how many display equations rendered (compare with the $$ lines you wrote)
// A clean sweep is necessary, not sufficient: it can't see a cramped layout, a
// sim that renders but does the wrong thing, or a stale screenshot. Still look
// at the page and use every activity by hand.

{ // block scope, so the snippet can be pasted again without "already declared" errors
const SLUGS = ['ap-chemistry/unit-3'];
const WIDTHS = [360, 375, 768, 1280];

window.__sweep = [];
window.__sweepDone = false;
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const w of WIDTHS) {
    for (const slug of SLUGS) {
      const f = document.createElement('iframe');
      f.style.cssText = `width:${w + 6}px;height:900px;position:fixed;top:0;left:0;z-index:99999;background:#fff`;
      f.src = `/study/${slug}`;
      document.body.appendChild(f);
      let d;
      for (let i = 0; i < 80; i++) {
        await sleep(250);
        d = f.contentDocument;
        if (d && [...d.querySelectorAll('button')].some((b) => /Full lessons/.test(b.textContent))) break;
      }
      const problems = [];
      const full = d && [...d.querySelectorAll('button')].find((b) => /Full lessons/.test(b.textContent));
      if (!full) {
        window.__sweep.push({ w, slug, problems: ['pack did not load (no "Full lessons" button)'] });
        f.remove();
        continue;
      }
      full.click();
      await sleep(2500);
      const main = d.querySelector('main');
      const vw = d.documentElement.clientWidth;
      const errors = main.querySelectorAll('.katex-error').length;
      const red = [...main.querySelectorAll('.katex [style*="color"]')].filter((e) => /cc0000/i.test(e.getAttribute('style'))).length;
      if (errors || red) problems.push(`KaTeX errors: ${errors}, red KaTeX: ${red}`);
      const bare = main.cloneNode(true);
      bare.querySelectorAll('code, pre, .katex').forEach((e) => e.remove());
      const leaks = bare.textContent.match(/.{0,20}(\*\*|^#{1,4} |\$\$|```|\\[a-zA-Z]{2,}|\$[^\s$]*[\\^_{}][^\s$]*\$).{0,10}/gm) || [];
      if (leaks.length) problems.push(`raw markdown/LaTeX: ${leaks.slice(0, 3).join(' | ')}`);
      if (d.documentElement.scrollWidth > vw) problems.push('page scrolls sideways');
      const wideTables = [...main.querySelectorAll('table')].filter((t) => t.parentElement.scrollWidth > t.parentElement.clientWidth + 1);
      if (wideTables.length) problems.push(`tables scroll: ${wideTables.map((t) => t.querySelector('tr').innerText.slice(0, 40)).join(' | ')}`);
      const wide = [...main.querySelectorAll('svg, .katex-display')].filter((e) => e.getBoundingClientRect().right > vw + 1);
      if (wide.length) problems.push(`${wide.length} SVG/equation(s) wider than the page`);
      const scrolling = [...main.querySelectorAll('.katex-display')].filter((k) => k.scrollWidth > k.clientWidth + 1);
      if (scrolling.length) problems.push(`equations too wide, scroll sideways: ${scrolling.map((k) => (k.querySelector('annotation')?.textContent || '').slice(0, 40)).join(' | ')}`);
      if (/Something went wrong/i.test(main.innerText)) problems.push('ErrorBoundary shown');
      window.__sweep.push({ w, slug, displayEquations: main.querySelectorAll('.katex-display').length, problems });
      f.remove();
    }
  }
  window.__sweepDone = true;
})();
'started';
}
