/**
 * Bug reports: what the student tells us plus the technical details we'd
 * otherwise have to ask for, as one plain-text message (sent through the same
 * channel as feedback, services/emailService).
 */

export const FREQUENCY = [
  { value: 'always', label: 'Every time' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'once', label: 'Only once so far' },
];

export const SEVERITY = [
  { value: 'blocking', label: "It stops me from using the app" },
  { value: 'major', label: 'Something is wrong, but I can work around it' },
  { value: 'minor', label: 'Small or cosmetic' },
];

/**
 * Technical details from the browser. The page is origin + path only: query
 * strings and hashes can carry tokens (email links, auth redirects).
 */
export function collectDiagnostics({ win = window, nav = navigator, errors = [] } = {}) {
  const theme = win.document?.documentElement?.getAttribute('data-theme') || 'unknown';
  return {
    page: `${win.location.origin}${win.location.pathname}`,
    appVersion: process.env.REACT_APP_VERSION || 'unknown',
    browser: nav.userAgent,
    viewport: `${win.innerWidth}×${win.innerHeight} @${win.devicePixelRatio || 1}x`,
    screen: win.screen ? `${win.screen.width}×${win.screen.height}` : 'unknown',
    language: nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: nav.onLine,
    theme,
    time: new Date().toISOString(),
    recentErrors: errors,
  };
}

const labelOf = (list, value) => list.find((o) => o.value === value)?.label || value || 'Not given';

/** The report as plain text. Exported for tests. */
export function formatBugReport(fields, diag) {
  const lines = [
    `Page: ${fields.page || diag?.page || 'Not given'}`,
    `How often: ${labelOf(FREQUENCY, fields.frequency)}`,
    `How bad: ${labelOf(SEVERITY, fields.severity)}`,
    '',
    'Steps to reproduce:',
    fields.steps?.trim() || 'Not given',
    '',
    'Expected:',
    fields.expected?.trim() || 'Not given',
    '',
    'What happened instead:',
    fields.actual?.trim() || 'Not given',
  ];
  if (diag) {
    lines.push('', '--- Technical details ---',
      `App version: ${diag.appVersion}`,
      `Browser: ${diag.browser}`,
      `Viewport: ${diag.viewport} (screen ${diag.screen})`,
      `Theme: ${diag.theme} · Language: ${diag.language} · Time zone: ${diag.timezone} · Online: ${diag.online}`,
      `Reported at: ${diag.time}`,
      'Recent errors:',
      ...(diag.recentErrors?.length
        ? diag.recentErrors.map((e) => `  [${e.at}] (${e.source}) ${e.message}`)
        : ['  none recorded']));
  }
  return lines.join('\n');
}
