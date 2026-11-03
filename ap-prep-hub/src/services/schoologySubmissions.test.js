import { assignmentIdOf, isSubmitted, findSubmitted } from './schoologySubmissions';

const noPause = { pause: async () => {} };

test('assignment id comes from the synced Schoology link only', () => {
  expect(assignmentIdOf({ source: 'schoology', description: 'Read ch 4\n- Link: http://school.district196.org/assignment/7863396025' })).toBe('7863396025');
  expect(assignmentIdOf({ source: 'schoology', description: '- Link: http://school.org/event/7863601655/profile' })).toBeNull();
  expect(assignmentIdOf({ source: 'canvas', description: '- Link: https://x.instructure.com/calendar#assignment_456' })).toBeNull();
  expect(assignmentIdOf({ description: '- Link: http://school.org/assignment/1' })).toBeNull();
});

test('a submission counts once any revision is not a draft', () => {
  expect(isSubmitted({ revision: [{ revision_id: 1, draft: 0 }] })).toBe(true);
  expect(isSubmitted({ revision: [{ revision_id: 1, draft: '0' }, { revision_id: 2, draft: 1 }] })).toBe(true);
  expect(isSubmitted({ revision: [{ revision_id: 1, draft: 1 }] })).toBe(false);
  expect(isSubmitted({ revision: [{ revision_id: 1, draft: true }] })).toBe(false);
  expect(isSubmitted({ revision: [] })).toBe(false);
  expect(isSubmitted(null)).toBe(false);
});

test('finds each assignment\'s section, then reads only the student\'s own submission', async () => {
  const api = {
    '/users/me/sections': { section: [{ id: 10 }, { id: 20 }, { id: 30 }] },
    '/sections/10/assignments?limit=200': { assignment: [{ id: 1 }, { id: 2 }] },
    '/sections/20/assignments?limit=200': { assignment: [{ id: 3 }] },
    '/sections/10/submissions/1/me': { revision: [{ draft: 0 }] },
    '/sections/10/submissions/2/me': { revision: [{ draft: 1 }] },
    '/sections/20/submissions/3/me': { revision: [{ draft: 0 }] },
  };
  const calls = [];
  const get = async (p) => { calls.push(p); if (!(p in api)) throw new Error('404'); return api[p]; };
  const done = await findSubmitted(['1', '2', 3], get, noPause);
  expect([...done].sort()).toEqual(['1', '3']);
  // Stops listing sections once every assignment is placed (section 30 untouched).
  expect(calls).not.toContain('/sections/30/assignments?limit=200');
  expect(calls.every((p) => !/submissions\/\d+\/\d+$/.test(p))).toBe(true);
});

test('one failing section is skipped; an expired sign-in stops the check', async () => {
  const get = async (p) => {
    if (p === '/users/me/sections') return { section: [{ id: 10 }, { id: 20 }] };
    if (p === '/sections/10/assignments?limit=200') throw new Error('403');
    if (p === '/sections/20/assignments?limit=200') return { assignment: [{ id: 5 }] };
    return { revision: [{ draft: 0 }] };
  };
  expect([...(await findSubmitted(['5'], get, noPause))]).toEqual(['5']);
  const expired = async () => { const e = new Error('expired'); e.reconnect = true; throw e; };
  await expect(findSubmitted(['5'], expired, noPause)).rejects.toThrow('expired');
  expect((await findSubmitted([], expired, noPause)).size).toBe(0);
});
