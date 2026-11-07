import { loadUrl } from './aiLoad';

test('checks in only when AI goes through the router', () => {
  expect(loadUrl('https://ai.apex-scholar.com')).toBe('https://ai.apex-scholar.com/load');
  expect(loadUrl('https://ai.apex-scholar.com/some/path')).toBe('https://ai.apex-scholar.com/load');
  expect(loadUrl('/.netlify/functions/ai-proxy')).toBeNull();
  expect(loadUrl('')).toBeNull();
});
