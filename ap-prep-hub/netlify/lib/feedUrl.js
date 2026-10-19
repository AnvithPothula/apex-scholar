/**
 * Which calendar-feed URLs the cors-proxy may fetch.
 *
 * Districts serve Schoology and Canvas from their own domains (e.g.
 * school.district196.org, canvas.district.org), so a host allow-list blocks
 * real students. Instead, any public HTTPS host is allowed for the two feed
 * PATHS below. Because the host is now user-chosen, the proxy must also refuse
 * hosts that resolve to private addresses and re-check every redirect hop.
 * Keep FEED_PATHS in step with src/services/schoologyCalendar.js (a test checks).
 */
const dns = require('dns').promises;
const net = require('net');

const FEED_PATHS = {
  // /calendar/feed/ical/<userId>/<token>/ical.ics
  schoology: /^\/calendar\/feed\/ical\/\d+\/[A-Za-z0-9]+\/ical\.ics$/,
  // /feeds/calendars/user_<token>.ics (Canvas calendar feed)
  canvas: /^\/feeds\/calendars\/user_[A-Za-z0-9]+\.ics$/,
};

/** 'schoology' | 'canvas' | null for an https URL (string or URL). */
function feedKind(url) {
  let u;
  try { u = typeof url === 'string' ? new URL(url) : url; } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return null;
  if (net.isIP(u.hostname.replace(/^\[|\]$/g, '')) || !/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(u.hostname)) return null;
  for (const [kind, re] of Object.entries(FEED_PATHS)) if (re.test(u.pathname)) return kind;
  return null;
}

/** True for loopback, private, link-local, CGNAT, ULA and unspecified addresses. */
function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

/** Resolve the host and refuse it if ANY address is private. */
async function resolvesPublic(hostname, lookup = dns.lookup) {
  try {
    const addrs = await lookup(hostname, { all: true });
    return addrs.length > 0 && addrs.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

module.exports = { FEED_PATHS, feedKind, isPrivateAddress, resolvesPublic };
