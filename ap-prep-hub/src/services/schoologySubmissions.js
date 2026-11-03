/**
 * Which Schoology tasks has the student already turned in?
 *
 * The calendar feed links each assignment (".../assignment/<id>") but not its
 * section, and Schoology reads submissions per section. So: list the student's
 * sections, find the section that holds each assignment, then read the
 * student's own submission for it. Everything goes through the read-only proxy
 * (`get` is schoologyAPI.makeAPIRequest), paced under Schoology's limit of
 * about 15 requests per 5 seconds per user.
 *
 * Only dropbox-style assignments have submissions; tests, discussions and
 * paper work never show as submitted, so those stay for the student to tick.
 */

/** The Schoology assignment id behind a synced task, or null. */
export function assignmentIdOf(task) {
  if (!task || task.source !== 'schoology') return null;
  const m = /\/assignment\/(\d+)/.exec(task.description || '');
  return m ? m[1] : null;
}

/** True once any revision is a real submission, not a saved draft. */
export function isSubmitted(data) {
  const revisions = data?.revision || data?.revisions || [];
  return Array.isArray(revisions) && revisions.some((r) => r && r.draft !== true && Number(r.draft) !== 1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Of the given assignment ids, the ones the student has submitted (a Set).
 * A sign-in that has expired (err.reconnect) is rethrown; other failures on a
 * single section or assignment only skip that one.
 */
export async function findSubmitted(ids, get, { pause = () => sleep(350) } = {}) {
  const wanted = new Set(ids.map(String));
  const submitted = new Set();
  if (!wanted.size) return submitted;
  const call = async (path) => {
    await pause();
    try {
      return await get(path);
    } catch (e) {
      if (e?.reconnect) throw e;
      return null;
    }
  };

  const sectionOf = new Map();
  const sections = (await call('/users/me/sections'))?.section || [];
  for (const s of sections) {
    if (sectionOf.size === wanted.size) break;
    // ponytail: first 200 assignments per section; page with ?start= if a course ever has more.
    const list = (await call(`/sections/${s.id}/assignments?limit=200`))?.assignment || [];
    for (const a of list) {
      if (wanted.has(String(a.id))) sectionOf.set(String(a.id), s.id);
    }
  }
  for (const [aid, sid] of sectionOf) {
    if (isSubmitted(await call(`/sections/${sid}/submissions/${aid}/me`))) submitted.add(aid);
  }
  return submitted;
}
