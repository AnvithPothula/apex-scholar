/**
 * Asks the AI router how busy the site is, for the usage meter's per-task costs.
 * The same request tells the router this tab is open: a random id per tab, kept
 * in memory only, with nothing about who the student is. Hidden tabs don't check
 * in, and any failure leaves tasks at their normal price.
 */
import { setLoad } from './aiUsageLimiter';

const POLL_MS = 5 * 60 * 1000;

/** The router's /load URL, or null when AI goes through the Netlify proxy instead. */
export function loadUrl(proxyUrl = process.env.REACT_APP_AI_PROXY_URL || '') {
  try {
    return /^https?:\/\//.test(proxyUrl.trim()) ? new URL('/load', proxyUrl.trim()).toString() : null;
  } catch {
    return null;
  }
}

const newSessionId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)))
  .map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);

/** Starts checking in; returns the function that stops it. */
export function startLoadPolling() {
  const url = loadUrl();
  if (!url) return () => {};
  const sid = newSessionId();
  let lastAt = 0;

  const check = async () => {
    if (document.visibilityState === 'hidden' || Date.now() - lastAt < POLL_MS - 1000) return;
    lastAt = Date.now();
    try {
      const res = await fetch(`${url}?s=${sid}`);
      if (res.ok) setLoad((await res.json()).load);
    } catch { /* normal prices until the next check */ }
  };

  check();
  const id = setInterval(check, POLL_MS);
  document.addEventListener('visibilitychange', check);
  return () => {
    clearInterval(id);
    document.removeEventListener('visibilitychange', check);
  };
}
