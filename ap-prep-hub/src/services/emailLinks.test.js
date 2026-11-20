const { tagLinks } = require('../../netlify/lib/emailLinks');
const { wants } = require('../../netlify/lib/emailPrefs');

test('site links in an email get UTM tags; unsubscribe links do not', () => {
  const html = '<a href="https://apex-scholar.com/grader">Try</a> <a href="https://apex-scholar.com/review?x=1">R</a> '
    + '<a href="https://apex-scholar.com/.netlify/functions/email-unsubscribe?t=abc">Unsubscribe</a> <a href="https://apex-scholar.com">Home</a>';
  const out = tagLinks(html, 'weekly');
  expect(out).toContain('href="https://apex-scholar.com/grader?utm_source=email&amp;utm_medium=email&amp;utm_campaign=weekly&amp;utm_content=grader"');
  expect(out).toContain('/review?x=1&amp;utm_source=email');
  expect(out).toContain('utm_content=home');
  expect(out).toContain('email-unsubscribe?t=abc"');
  expect(tagLinks(out, 'weekly')).toBe(out); // never tagged twice
  const text = tagLinks('Try the Grader: https://apex-scholar.com/grader\nUnsubscribe: https://apex-scholar.com/.netlify/functions/email-unsubscribe?t=x', 'weekly');
  expect(text).toContain('https://apex-scholar.com/grader?utm_source=email&utm_medium=email&utm_campaign=weekly&utm_content=grader\n');
  expect(text).toContain('email-unsubscribe?t=x');
});

test('a hard-bounced address gets no email of any kind', () => {
  expect(wants({ email: 'a@b.c' }, 'weekly')).toBe(true);
  expect(wants({ email: 'a@b.c', emailBounced: true }, 'weekly')).toBe(false);
  expect(wants({ email: 'a@b.c', emailBounced: true }, 'announcements')).toBe(false);
});
