/**
 * A Firestore read can hang forever when its connection dies (seen in Safari:
 * "Fetch API cannot load .../Listen/channel due to access control checks"), and
 * the page behind it sits on its loading state until a reload. This gives the
 * read a time limit; on a stall or an offline error it resets the connection
 * (`reset`, e.g. disableNetwork + enableNetwork) and tries again.
 */
const timed = (fn, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => {
    const err = new Error('Timed out');
    err.code = 'stalled';
    reject(err);
  }, ms);
  fn().then(
    (value) => { clearTimeout(timer); resolve(value); },
    (err) => { clearTimeout(timer); reject(err); },
  );
});

// Right after a reset Firestore can still answer "client is offline" for a moment.
const OFFLINE_RETRIES = 3;
const OFFLINE_PAUSE_MS = 1500;

export async function withStallRecovery(read, reset, timeoutMs = 8000, pauseMs = OFFLINE_PAUSE_MS) {
  try {
    return await timed(read, timeoutMs);
  } catch (err) {
    if (err?.code !== 'stalled' && err?.code !== 'unavailable') throw err;
  }
  await timed(reset, timeoutMs);
  for (let attempt = 1; ; attempt++) {
    try {
      return await timed(read, timeoutMs);
    } catch (err) {
      if (err?.code !== 'unavailable' || attempt >= OFFLINE_RETRIES) throw err;
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }
}
