const crypto = require('crypto');
const { checkApiCall, resolveMe, normalizeDomain, signature, signedFetch } = require('../../netlify/lib/schoologyGuard');

describe('Schoology proxy is read-only', () => {
  test('only GET to allow-listed read paths', () => {
    expect(checkApiCall('GET', '/users/me/sections').ok).toBe(true);
    expect(checkApiCall('get', '/sections/12/assignments?start=2026-10-01').ok).toBe(true);
    expect(checkApiCall('GET', '/sections/12/submissions/34/56').ok).toBe(true);
    for (const m of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      expect(checkApiCall(m, '/sections/12/submissions/34/56').ok).toBe(false);
    }
    expect(checkApiCall('GET', '/users/12/delete-everything').ok).toBe(false);
    expect(checkApiCall('GET', '/sections/12/../../users').ok).toBe(false);
    expect(checkApiCall('GET', 'https://evil.example/x').ok).toBe(false);
  });

  test('/users/me becomes the stored uid; left alone without one', () => {
    expect(resolveMe('/users/me/sections', '777')).toBe('/users/777/sections');
    expect(resolveMe('/users/me', '777')).toBe('/users/777');
    expect(resolveMe('/users/me/sections', null)).toBe('/users/me/sections');
    expect(resolveMe('/users/meow', '777')).toBe('/users/meow');
  });

  test('school domain: bare hosts only', () => {
    expect(normalizeDomain(' MySchool.Schoology.com ')).toBe('myschool.schoology.com');
    expect(normalizeDomain('https://lms.school.org/')).toBe('lms.school.org');
    for (const bad of ['', 'localhost', '10.0.0.1', 'https://x.schoology.com/oauth', 'a@b.com', 'x.com:8080', ['javascript', 'alert(1)'].join(':')]) {
      expect(normalizeDomain(bad)).toBeNull();
    }
  });
});

describe('OAuth 1.0a signing', () => {
  const base = { oauth_consumer_key: 'ck', oauth_nonce: 'n', oauth_signature_method: 'HMAC-SHA1', oauth_timestamp: '1', oauth_version: '1.0', oauth_token: 't' };

  test('query parameters are signed as parameters, not as part of the URL', () => {
    // Hand-built base string per RFC 5849: query param joins the sorted set.
    const expectedBase = 'GET&' + encodeURIComponent('https://api.schoology.com/v1/sections/1/assignments') + '&' +
      encodeURIComponent('oauth_consumer_key=ck&oauth_nonce=n&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1&oauth_token=t&oauth_version=1.0&start=2026-10-01');
    const expected = crypto.createHmac('sha1', 'cs&ts').update(expectedBase).digest('base64');
    expect(signature('GET', 'https://api.schoology.com/v1/sections/1/assignments?start=2026-10-01', base, 'cs', 'ts')).toBe(expected);
  });

  test('a redirect is followed with a fresh nonce, re-signed for the new URL', async () => {
    const calls = [];
    const fetchImpl = async (url, opts) => {
      calls.push({ url, auth: opts.headers.Authorization });
      return calls.length === 1
        ? { status: 303, headers: { get: () => 'https://api.schoology.com/v1/users/777' } }
        : { status: 200, headers: { get: () => null } };
    };
    const res = await signedFetch({
      method: 'GET', url: 'https://api.schoology.com/v1/users/me', oauthParams: base,
      consumerSecret: 'cs', tokenSecret: 'ts', freshParams: () => ({ ...base, oauth_nonce: 'n2' }), fetchImpl,
    });
    expect(res.status).toBe(200);
    expect(calls[1].url).toBe('https://api.schoology.com/v1/users/777');
    expect(calls[1].auth).toContain('oauth_nonce="n2"');
    expect(calls[1].auth).not.toBe(calls[0].auth);
  });
});
