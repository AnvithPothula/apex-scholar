/**
 * Single-file FIFO queue for outbound AI calls.
 *
 * Two problems it solves, both of which show up the moment more than a handful
 * of students are on the site at once.
 *
 * 1. **A single user out-runs the rate limit on their own.** Generating one
 *    practice test is ~13 model calls (55 MCQs in batches of 6, plus SAQ, DBQ,
 *    LEQ). Fire those while the tutor and the solver are also calling and one
 *    person can exhaust a key's requests-per-minute without any help.
 *
 * 2. **Nothing remembered a 429.** Each call learned the rate limit
 *    independently, so after the server said "wait 26 seconds" the next twelve
 *    calls went out anyway and collected twelve more 429s. Now the whole tab
 *    holds one cooldown: the first refusal parks everything behind it.
 *
 * FIFO because the alternative is a stampede where the newest request wins and
 * the student who has been waiting longest keeps losing.
 *
 * Deliberately in-tab. Ordering *between* students needs shared server state —
 * a Durable Object — and is not worth building while a single project key
 * supplies the whole site's capacity; see README "AI capacity".
 *
 * No imports, so tests and scripts can load it directly.
 */

/** One in flight at a time. The limit being protected is per-key RPM, not CPU. */
const MAX_CONCURRENT = 1;

/** Longest we will hold a caller before giving up and letting it try. */
export const MAX_QUEUE_WAIT_MS = 5 * 60 * 1000;

function createQueue() {
  return {
    pending: [],        // [{ run, resolve, reject, enqueuedAt }]
    active: 0,
    cooldownUntil: 0,   // epoch ms; nothing runs before this
    listeners: new Set(),
  };
}

let q = createQueue();

/** Test seam. State is module-level so every caller shares one queue. */
export function _reset() {
  q = createQueue();
}

/** Milliseconds until the shared cooldown expires. 0 when clear. */
export function cooldownRemaining(now = Date.now()) {
  return Math.max(0, q.cooldownUntil - now);
}

/** How many callers are waiting, not counting the one running. */
export function queueDepth() {
  return q.pending.length;
}

/**
 * Best estimate of how long a caller joining now would wait, in seconds.
 *
 * The cooldown applies to everyone, so it is counted once; each queued caller
 * ahead adds its own cooldown wait because they are served one at a time.
 */
export function estimatedWaitSeconds(now = Date.now()) {
  const cooldown = cooldownRemaining(now);
  if (!cooldown && !q.pending.length) return 0;
  const ahead = q.pending.length + q.active;
  return Math.ceil((cooldown + Math.max(0, ahead - 1) * cooldown) / 1000);
}

/** Subscribe to wait-time changes. Returns an unsubscribe function. */
export function subscribe(fn) {
  q.listeners.add(fn);
  return () => q.listeners.delete(fn);
}

function notify() {
  const seconds = estimatedWaitSeconds();
  q.listeners.forEach((fn) => {
    try { fn({ seconds, depth: q.pending.length }); } catch { /* a bad listener must not stall the queue */ }
  });
}

/**
 * Park every queued call for `seconds`.
 *
 * Called when the server reports a rate limit. Only ever extends the cooldown —
 * a later, shorter 429 must not release callers early.
 */
export function setCooldown(seconds, now = Date.now()) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return;
  const until = now + Math.min(s, 3600) * 1000;
  if (until > q.cooldownUntil) {
    q.cooldownUntil = until;
    notify();
  }
}

/** Clear the cooldown after a success — the capacity is evidently back. */
export function clearCooldown() {
  if (q.cooldownUntil) {
    q.cooldownUntil = 0;
    notify();
  }
}

function pump() {
  if (q.active >= MAX_CONCURRENT) return;

  const wait = cooldownRemaining();
  if (wait > 0) {
    setTimeout(pump, Math.min(wait, 1000) + 10);
    return;
  }

  const job = q.pending.shift();
  if (!job) return;

  q.active++;
  notify();
  Promise.resolve()
    .then(job.run)
    .then(job.resolve, job.reject)
    .finally(() => {
      q.active--;
      notify();
      pump();
    });
}

/**
 * Run `fn` when it is this caller's turn and the cooldown has expired.
 *
 * Rejections propagate unchanged, so callers keep their existing error handling
 * — including the RateLimitError the retry countdown reads.
 */
export function enqueue(fn) {
  return new Promise((resolve, reject) => {
    const job = { run: fn, resolve, reject, enqueuedAt: Date.now() };
    q.pending.push(job);

    // A caller stuck behind a long cooldown is better off being told than held
    // forever; the page's own error path shows a real message.
    const timer = setTimeout(() => {
      const i = q.pending.indexOf(job);
      if (i !== -1) {
        q.pending.splice(i, 1);
        notify();
        reject(Object.assign(new Error('Timed out waiting for AI capacity'), {
          isRateLimit: true,
          retryAfter: Math.ceil(cooldownRemaining() / 1000) || 60,
        }));
      }
    }, MAX_QUEUE_WAIT_MS);

    const done = () => clearTimeout(timer);
    job.resolve = (v) => { done(); resolve(v); };
    job.reject = (e) => { done(); reject(e); };

    notify();
    pump();
  });
}
