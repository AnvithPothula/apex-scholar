/**
 * Relay one official AP free-response PDF (questions or scoring guidelines)
 * from AP Central to the Grader.
 *
 * GET /.netlify/functions/past-frq?url=<https://apcentral.collegeboard.org/media/pdf/apYY-(frq|sg)-....pdf>
 *
 * AP Central sends no CORS headers, so the browser can't read these PDFs
 * itself. Nothing is stored here: the PDF is fetched on request and passed
 * through, and the CDN caches it for a week. Only that one URL shape is
 * fetched, redirects are not followed, and only PDFs come back, so this is not
 * an open relay.
 */

const PDF_URL = /^https:\/\/apcentral\.collegeboard\.org\/media\/pdf\/ap\d\d-(?:frq|sg)-[a-z0-9-]+\.pdf$/;
const MAX_BYTES = 4 * 1024 * 1024; // the largest scoring guideline is ~1.9 MB; responses cap at 6 MB once base64'd

const parseCsv = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean);
const ALLOWED_ORIGINS = Array.from(new Set([
  ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
  process.env.URL,
  process.env.DEPLOY_PRIME_URL,
  'http://localhost:3000',
  'http://localhost:8888',
].filter(Boolean)));

const isPastFrqUrl = (url) => PDF_URL.test(String(url || ''));

exports.isPastFrqUrl = isPastFrqUrl;

exports.handler = async (event) => {
  const headersIn = event.headers || {};
  const origin = headersIn.origin || headersIn.Origin;
  // Same-origin GETs often carry no Origin header; a foreign one is refused.
  const allowed = origin ? (ALLOWED_ORIGINS.includes(origin) ? origin : null) : ALLOWED_ORIGINS[0];
  if (!allowed) return { statusCode: 403, body: 'Origin is not allowed' };
  const cors = { 'Access-Control-Allow-Origin': allowed, Vary: 'Origin' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  const url = event.queryStringParameters?.url;
  if (!isPastFrqUrl(url)) return { statusCode: 400, headers: cors, body: 'Only AP Central free-response PDFs can be fetched' };

  let resp;
  try {
    resp = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (Apex Scholar grader)' }, signal: AbortSignal.timeout(20000) });
  } catch (err) {
    return { statusCode: 502, headers: cors, body: `AP Central didn't answer: ${err.message}` };
  }
  if (resp.status === 404) return { statusCode: 404, headers: cors, body: 'College Board has moved or removed this PDF' };
  if (!resp.ok || !/pdf/i.test(resp.headers.get('content-type') || '')) {
    return { statusCode: 502, headers: cors, body: `AP Central returned ${resp.status}` };
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length > MAX_BYTES) return { statusCode: 413, headers: cors, body: 'That PDF is too large to relay' };

  return {
    statusCode: 200,
    headers: {
      ...cors,
      'Content-Type': 'application/pdf',
      'Cache-Control': 'public, max-age=86400',
      'Netlify-CDN-Cache-Control': 'public, max-age=604800, durable',
    },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  };
};
