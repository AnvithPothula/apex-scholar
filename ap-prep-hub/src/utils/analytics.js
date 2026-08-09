/**
 * Google Analytics 4 — loaded at runtime, never at build time.
 *
 * Deliberately env-gated: with no REACT_APP_GA_MEASUREMENT_ID the tag is never
 * injected at all, so localhost, `netlify dev`, and deploy previews send zero
 * events and can't pollute the numbers.
 *
 * Privacy posture matters here because the audience is mostly minors:
 *   - `anonymize_ip` on.
 *   - `allow_google_signals: false` — no demographics/remarketing on kids.
 *   - `allow_ad_personalization_signals: false`.
 * Google signals must ALSO be off in the GA admin UI; setting it here only
 * covers this property's tag, not the account default.
 */

const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

let loaded = false;

export function initAnalytics() {
  if (loaded || !GA_ID || typeof window === 'undefined') return false;
  // Respect an explicit Do Not Track signal rather than ignoring it.
  if (window.navigator?.doNotTrack === '1' || window.doNotTrack === '1') return false;
  loaded = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // SPA: routes are reported manually by trackPageView.
    send_page_view: false,
  });
  return true;
}

/** Report a client-side route change. No-op when analytics never loaded. */
export function trackPageView(path) {
  if (!loaded || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
}

export const analyticsEnabled = () => Boolean(GA_ID);
