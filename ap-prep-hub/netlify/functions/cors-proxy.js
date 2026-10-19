/**
 * Netlify serverless function — acts as a first-party CORS proxy so the
 * browser can fetch Schoology and Canvas iCal calendar feeds (which don't set
 * CORS headers). Requests go to /.netlify/functions/cors-proxy?url=<encoded URL>.
 *
 * Not an open relay: a URL is fetched only if its host is allow-listed OR its
 * path is a known feed path on a public host (../lib/feedUrl.js; districts use
 * their own domains). Every redirect hop is re-checked, and only iCal bodies
 * are returned.
 */
const { feedKind, resolvesPublic } = require('../lib/feedUrl');

const ALLOWED_HOSTS = [
  'school.district196.org',
  // Add other Schoology district domains here as needed
  /\.schoology\.com$/,
];

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(
  new Set([
    ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    'http://localhost:3000',
    'http://localhost:8888',
  ].filter(Boolean))
);

const REQUIRED_APP_TOKEN = process.env.CORS_PROXY_APP_TOKEN || process.env.APP_PROXY_TOKEN;
const RATE_LIMIT_WINDOW_MS = Number(process.env.CORS_PROXY_RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.CORS_PROXY_RATE_LIMIT_MAX_REQUESTS || 30);
const requestBuckets = new Map();

function isAllowed(hostname) {
  return ALLOWED_HOSTS.some((h) =>
    h instanceof RegExp ? h.test(hostname) : hostname === h
  );
}

function getHeader(event, name) {
  const headers = event?.headers || {};
  const target = name.toLowerCase();
  const match = Object.keys(headers).find((key) => key.toLowerCase() === target);
  return match ? headers[match] : undefined;
}

function getClientId(event) {
  const forwardedFor = getHeader(event, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return getHeader(event, 'x-nf-client-connection-ip') || 'anonymous';
}

function getAllowedOrigin(event) {
  const origin = getHeader(event, 'origin');
  if (!origin) {
    return ALLOWED_ORIGINS[0] || null;
  }
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function buildCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-App-Token',
    Vary: 'Origin',
  };
}

function cleanupRequestBuckets(now = Date.now()) {
  if (requestBuckets.size < 1000) return;
  for (const [clientId, bucket] of requestBuckets.entries()) {
    if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
      requestBuckets.delete(clientId);
    }
  }
}

function isRateLimited(clientId) {
  const now = Date.now();
  cleanupRequestBuckets(now);

  const bucket = requestBuckets.get(clientId);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(clientId, { count: 1, windowStart: now });
    return { limited: false, retryAfter: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.windowStart)) / 1000);
    return { limited: true, retryAfter };
  }

  bucket.count += 1;
  return { limited: false, retryAfter: 0 };
}

function isAuthorized(event) {
  if (!REQUIRED_APP_TOKEN) return true;
  const appToken = getHeader(event, 'x-app-token');
  const authHeader = getHeader(event, 'authorization') || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;
  return appToken === REQUIRED_APP_TOKEN || bearerToken === REQUIRED_APP_TOKEN;
}

exports.handler = async (event) => {
  const allowedOrigin = getAllowedOrigin(event);
  if (!allowedOrigin) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origin is not allowed' }),
    };
  }

  const headers = buildCorsHeaders(allowedOrigin);

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!isAuthorized(event)) {
    return {
      statusCode: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const clientId = getClientId(event);
  const rateLimit = isRateLimited(clientId);
  if (rateLimit.limited) {
    return {
      statusCode: 429,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfter),
      },
      body: JSON.stringify({ error: 'Rate limit exceeded' }),
    };
  }

  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing "url" query parameter' }),
    };
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid URL' }),
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Only HTTPS upstream URLs are allowed' }),
    };
  }

  const deny = (error) => ({
    statusCode: 403,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error }),
  });
  // A host we list, or a Schoology/Canvas feed path on a host that resolves publicly.
  const hostOk = async (u) => isAllowed(u.hostname) || (u.protocol === 'https:' && await resolvesPublic(u.hostname));
  if (!isAllowed(parsed.hostname) && !feedKind(parsed)) {
    return deny("That isn't a Schoology or Canvas calendar feed link.");
  }
  if (!(await hostOk(parsed))) return deny(`Domain not allowed: ${parsed.hostname}`);

  try {
    // Follow redirects by hand so each hop is checked: an allowed host must
    // not be able to bounce the proxy to a private address.
    let current = parsed;
    let resp;
    for (let hop = 0; ; hop++) {
      resp = await fetch(current.toString(), {
        method: 'GET',
        headers: {
          Accept: 'text/calendar, application/calendar, text/plain, */*',
          // Use a browser-like UA — some school servers block bot-like agents
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        redirect: 'manual',
      });
      const loc = resp.status >= 300 && resp.status < 400 && resp.headers.get('location');
      if (!loc) break;
      if (hop >= 4) return deny('Too many redirects');
      current = new URL(loc, current);
      if (!(await hostOk(current))) return deny(`Redirect to a host that isn't allowed: ${current.hostname}`);
    }

    const body = await resp.text();

    // If upstream returned a non-2xx status, relay it as an error so the
    // client doesn't silently parse an HTML error page as iCal data.
    if (!resp.ok) {
      console.error(
        `CORS proxy: upstream returned ${resp.status} for ${parsed.hostname}`
      );
      return {
        statusCode: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Upstream returned HTTP ${resp.status}`,
          preview: body.substring(0, 300),
        }),
      };
    }

    // Only calendars come back, so the proxy can't be used to read other pages.
    if (!body.includes('BEGIN:VCALENDAR')) {
      return {
        statusCode: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'That link did not return a calendar feed.' }),
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
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Upstream fetch failed: ${err.message}` }),
    };
  }
};
