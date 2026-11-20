/**
 * Tag every link to the site in an email with UTM parameters, so Google
 * Analytics shows which email and which link brought someone in (SMTP2GO
 * counts clicks but doesn't record which link). Unsubscribe and other
 * function links are left alone.
 *
 *   utm_source=email  utm_medium=email  utm_campaign=<weekly|announcement>
 *   utm_content=<first path segment, e.g. grader, review, home>
 */
const SITE_LINK = /https:\/\/(?:www\.)?apex-scholar\.com(\/[^\s"'<>)]*)?/g;

function tagUrl(url, campaign) {
  let u;
  try { u = new URL(url); } catch { return url; }
  if (u.pathname.startsWith('/.netlify/') || u.searchParams.has('utm_source')) return url;
  const content = u.pathname.split('/').filter(Boolean)[0] || 'home';
  u.searchParams.set('utm_source', 'email');
  u.searchParams.set('utm_medium', 'email');
  u.searchParams.set('utm_campaign', campaign);
  u.searchParams.set('utm_content', content);
  return u.toString();
}

/** Tag the site links in an HTML or plain-text email body. */
function tagLinks(body, campaign) {
  if (!campaign || !body) return body;
  // In HTML an href's `&` is written `&amp;`; decode, tag, re-encode.
  return String(body).replace(SITE_LINK, (m) => {
    const tagged = tagUrl(m.replace(/&amp;/g, '&'), campaign);
    return m.includes('&amp;') || /<[a-z]/i.test(body) ? tagged.replace(/&/g, '&amp;') : tagged;
  });
}

module.exports = { tagLinks, tagUrl };
