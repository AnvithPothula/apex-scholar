import { collectDiagnostics, formatBugReport } from './bugReport';

describe('bug reports', () => {
  it('never sends the query string or hash of the page', () => {
    const win = {
      location: { origin: 'https://apex-scholar.com', pathname: '/settings', search: '?token=secret', hash: '#x' },
      innerWidth: 375, innerHeight: 812, devicePixelRatio: 3, screen: { width: 375, height: 812 },
      document: { documentElement: { getAttribute: () => 'dark' } },
    };
    const d = collectDiagnostics({ win, nav: { userAgent: 'UA', language: 'en-US', onLine: true }, errors: [] });
    expect(d.page).toBe('https://apex-scholar.com/settings');
    expect(JSON.stringify(d)).not.toMatch(/secret/);
    expect(d.viewport).toBe('375×812 @3x');
  });

  it('formats every answer, labels choices, and lists recent errors', () => {
    const text = formatBugReport(
      { page: '/practice-tests', steps: '1. Start', expected: 'Next question', actual: 'Froze', frequency: 'always', severity: 'blocking' },
      { appVersion: '1.2.3', browser: 'UA', viewport: 'v', screen: 's', theme: 'dark', language: 'en', timezone: 'UTC', online: true, time: 't',
        recentErrors: [{ at: 'a', source: 'window', message: 'boom' }] },
    );
    expect(text).toMatch('Page: /practice-tests');
    expect(text).toMatch('How often: Every time');
    expect(text).toMatch("How bad: It stops me from using the app");
    expect(text).toMatch('What happened instead:\nFroze');
    expect(text).toMatch('(window) boom');
    expect(formatBugReport({ actual: 'x' }, null)).not.toMatch('Technical details');
  });
});
