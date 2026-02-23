/**
 * Netlify serverless function — acts as a first-party CORS proxy so the
 * browser can fetch Schoology iCal calendar feeds (which don't set CORS
 * headers).  Requests go to /.netlify/functions/cors-proxy?url=<encoded URL>.
 *
 * Only whitelisted domains are proxied to prevent open-relay abuse.
 */

const ALLOWED_HOSTS = [
  'school.district196.org',
  // Add other Schoology district domains here as needed
  /\.schoology\.com$/,
];

function isAllowed(hostname) {
  return ALLOWED_HOSTS.some((h) =>
    h instanceof RegExp ? h.test(hostname) : hostname === h
  );
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing "url" query parameter' }),
    };
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid URL' }),
    };
  }

  if (!isAllowed(parsed.hostname)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: `Domain not allowed: ${parsed.hostname}` }),
    };
  }

  try {
    const resp = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/calendar, application/calendar, text/plain, */*',
        // Use a browser-like UA — some school servers block bot-like agents
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    const body = await resp.text();

    // If upstream returned a non-2xx status, relay it as an error so the
    // client doesn't silently parse an HTML error page as iCal data.
    if (!resp.ok) {
      console.error(
        `CORS proxy: upstream returned ${resp.status} for ${parsed.hostname}`
      );
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `Upstream returned HTTP ${resp.status}`,
          preview: body.substring(0, 300),
        }),
      };
    }

    return {
      statusCode: resp.status,
      headers: {
        ...headers,
        'Content-Type': resp.headers.get('content-type') || 'text/plain',
        'Cache-Control': 'no-store',
      },
      body,
    };
  } catch (err) {
    console.error('CORS proxy fetch error:', err);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: `Upstream fetch failed: ${err.message}` }),
    };
  }
};
