import { applyWrap, applyLinePrefix, applyLink, applyImage } from './emailFormatting';

describe('applyWrap', () => {
  it('wraps the selection and selects the wrapped text', () => {
    const r = applyWrap('AP exams start May 4', 15, 18, '**', 'bold');
    expect(r.value).toBe('AP exams start **May** 4');
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe('May');
  });

  it('inserts a placeholder when nothing is selected', () => {
    const r = applyWrap('', 0, 0, '**', 'bold');
    expect(r.value).toBe('**bold**');
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe('bold');
  });

  it('clamps a selection past the end instead of producing junk', () => {
    const r = applyWrap('hi', 99, 200, '*', 'x');
    expect(r.value).toBe('hi*x*');
  });
});

describe('applyLinePrefix', () => {
  it('prefixes every line of a multi-line selection', () => {
    const r = applyLinePrefix('one\ntwo', 0, 7, '- ');
    expect(r.value).toBe('- one\n- two');
  });

  it('does not double-prefix a line that already has it', () => {
    const r = applyLinePrefix('- one', 0, 5, '- ');
    expect(r.value).toBe('- one');
  });

  it('prefixes only the caret line when nothing is selected', () => {
    const r = applyLinePrefix('one\ntwo', 5, 5, '# ');
    expect(r.value).toBe('one\n# two');
  });
});

describe('applyLink', () => {
  it('keeps the selection as the label and puts the caret on the URL', () => {
    const r = applyLink('take a practice test now', 7, 20);
    expect(r.value).toBe('take a [practice test](https://apex-scholar.com) now');
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe('https://apex-scholar.com');
  });

  it('uses placeholder label text with no selection', () => {
    expect(applyLink('', 0, 0).value).toBe('[link text](https://apex-scholar.com)');
  });
});

describe('email body rendering (the real renderer)', () => {
  const { bodyToHtml } = require('../../../netlify/functions/email-broadcast');

  it('renders the toolbar syntax, not literal asterisks', () => {
    // The body used to be escaped and nothing else, so a broadcast was one
    // flat wall of grey text with no way to bold a date or link a page.
    expect(bodyToHtml('AP exams start **May 4**')).toContain('<strong');
    expect(bodyToHtml('this is *important*')).toContain('<em>');
    expect(bodyToHtml('## Heads up')).toContain('<h2');
    expect(bodyToHtml('- one\n- two')).toContain('<ul');
  });

  it('links only http(s), so a javascript: URL stays inert text', () => {
    const bad = bodyToHtml('[click](javascript:alert(1))');
    expect(bad).not.toContain('<a href');
    expect(bad).not.toContain('javascript:alert(1)</a>');
  });

  it('escapes before applying markup, so raw HTML cannot inject', () => {
    const out = bodyToHtml('<script>alert(1)</script> and **bold**');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
    expect(out).toContain('<strong');
  });

  it('inlines every style, because email clients drop <style> blocks', () => {
    const out = bodyToHtml('## Head\n\n- item\n\nbody **text**');
    for (const tag of ['<h2', '<ul', '<li', '<p', '<strong']) {
      const at = out.indexOf(tag);
      expect(at).toBeGreaterThan(-1);
      expect(out.slice(at, at + 120)).toContain('style="');
    }
  });

  it('still renders a plain paragraph unchanged', () => {
    expect(bodyToHtml('just words')).toContain('>just words<');
  });
});

describe('applyImage', () => {
  it('inserts an image placeholder at the caret', () => {
    const out = applyImage('', 0, 0);
    expect(out.value).toBe('![describe the image](https://apex-scholar.com/og-image.png)');
  });

  it('uses the selection as alt text', () => {
    const out = applyImage('Score curve chart', 0, 17);
    expect(out.value).toBe('![Score curve chart](https://apex-scholar.com/og-image.png)');
  });

  it('leaves the caret on the URL', () => {
    const out = applyImage('Logo', 0, 4);
    expect(out.value.slice(out.selectionStart, out.selectionEnd))
      .toBe('https://apex-scholar.com/og-image.png');
  });
});

describe('image rendering (the real renderer)', () => {
  // eslint-disable-next-line global-require
  const { bodyToHtml } = require('../../../netlify/functions/email-broadcast');

  it('renders an image with its alt text', () => {
    const html = bodyToHtml('![Apex Scholar](https://apex-scholar.com/og-image.png)');
    expect(html).toContain('<img src="https://apex-scholar.com/og-image.png"');
    expect(html).toContain('alt="Apex Scholar"');
  });

  it('refuses a non-http scheme', () => {
    // The image rule must not become a way to smuggle javascript: into the mail.
    expect(bodyToHtml('![x](javascript:alert(1))')).not.toContain('<img');
  });

  it('does not leave a stray "!" by matching the link rule first', () => {
    const html = bodyToHtml('![Logo](https://apex-scholar.com/logo192.png)');
    expect(html).not.toContain('!<a');
    expect(html).not.toContain('<a href="https://apex-scholar.com/logo192.png"');
  });
});

describe('list rendering (the real renderer)', () => {
  // eslint-disable-next-line global-require
  const { bodyToHtml } = require('../../../netlify/functions/email-broadcast');

  it('folds a wrapped bullet into one list item', () => {
    // A bullet long enough to wrap in the compose box used to demote the whole
    // block to a paragraph with literal "-" characters showing.
    const html = bodyToHtml('- short one\n- a long bullet that wraps\n  onto a second line\n- third');
    expect(html.startsWith('<ul')).toBe(true);
    expect((html.match(/<li/g) || []).length).toBe(3);
    expect(html).toContain('a long bullet that wraps onto a second line');
  });

  it('still treats a paragraph containing a dash line as a paragraph', () => {
    const html = bodyToHtml('Not a list.\n- but has a dash line');
    expect(html.startsWith('<p')).toBe(true);
  });
});
