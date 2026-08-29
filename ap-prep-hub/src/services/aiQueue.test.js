import {
  enqueue, setCooldown, clearCooldown, cooldownRemaining,
  estimatedWaitSeconds, queueDepth, subscribe, _reset,
} from './aiQueue';

beforeEach(() => { _reset(); jest.useRealTimers(); });

describe('ordering', () => {
  it('runs one at a time, in the order asked', async () => {
    // Generating a practice test fires ~13 calls. Letting them go at once is how
    // one student exhausts a key's requests-per-minute unaided.
    const order = [];
    let running = 0;
    let maxConcurrent = 0;
    const job = (n) => async () => {
      running++;
      maxConcurrent = Math.max(maxConcurrent, running);
      await new Promise((r) => setTimeout(r, 5));
      order.push(n);
      running--;
      return n;
    };
    await Promise.all([enqueue(job(1)), enqueue(job(2)), enqueue(job(3))]);
    expect(order).toEqual([1, 2, 3]);
    expect(maxConcurrent).toBe(1);
  });

  it('passes the result straight through', async () => {
    await expect(enqueue(async () => 'ok')).resolves.toBe('ok');
  });

  it('propagates a rejection unchanged', async () => {
    // Callers rely on the RateLimitError reaching their own catch block.
    const err = Object.assign(new Error('busy'), { isRateLimit: true, retryAfter: 26 });
    await expect(enqueue(async () => { throw err; })).rejects.toBe(err);
  });

  it('keeps draining after one job fails', async () => {
    const done = [];
    const a = enqueue(async () => { throw new Error('x'); }).catch(() => done.push('a'));
    const b = enqueue(async () => { done.push('b'); }).catch(() => {});
    await Promise.all([a, b]);
    expect(done).toEqual(['a', 'b']);
  });
});

describe('cooldown', () => {
  it('holds work until the server-supplied wait expires', async () => {
    setCooldown(0.05);
    expect(cooldownRemaining()).toBeGreaterThan(0);
    const started = Date.now();
    await enqueue(async () => 'go');
    expect(Date.now() - started).toBeGreaterThanOrEqual(40);
  });

  it('only ever extends, never shortens', () => {
    // A later, shorter 429 must not release callers the first one parked.
    const now = 1_000_000;
    setCooldown(60, now);
    const long = cooldownRemaining(now);
    setCooldown(5, now);
    expect(cooldownRemaining(now)).toBe(long);
  });

  it('ignores junk', () => {
    setCooldown(0);
    setCooldown(-5);
    setCooldown('nonsense');
    expect(cooldownRemaining()).toBe(0);
  });

  it('caps an absurd wait at an hour', () => {
    const now = 1_000_000;
    setCooldown(99999, now);
    expect(cooldownRemaining(now)).toBe(3600 * 1000);
  });

  it('clears on success, because the capacity is evidently back', () => {
    setCooldown(60);
    clearCooldown();
    expect(cooldownRemaining()).toBe(0);
  });
});

describe('reported wait', () => {
  it('is zero when nothing is queued and nothing is cooling', () => {
    expect(estimatedWaitSeconds()).toBe(0);
  });

  it('counts the cooldown once when one caller is waiting', () => {
    const now = 1_000_000;
    setCooldown(30, now);
    expect(estimatedWaitSeconds(now)).toBe(30);
  });

  it('grows with the number of callers ahead', async () => {
    const now = Date.now();
    setCooldown(30, now);
    const jobs = [enqueue(async () => 1), enqueue(async () => 2), enqueue(async () => 3)];
    // Three parked behind a 30s cooldown: the last one waits longer than the first.
    expect(estimatedWaitSeconds(now)).toBeGreaterThan(30);
    clearCooldown();
    await Promise.all(jobs);
  });

  it('tells subscribers when the wait changes', async () => {
    const seen = [];
    const off = subscribe((s) => seen.push(s.seconds));
    setCooldown(30);
    expect(seen.length).toBeGreaterThan(0);
    off();
    clearCooldown();
    await enqueue(async () => 1);
  });

  it('survives a listener that throws', async () => {
    const off = subscribe(() => { throw new Error('bad listener'); });
    await expect(enqueue(async () => 'fine')).resolves.toBe('fine');
    off();
  });
});

describe('queueDepth', () => {
  it('counts only what is still waiting', async () => {
    expect(queueDepth()).toBe(0);
    const p = Promise.all([enqueue(async () => 1), enqueue(async () => 2)]);
    await p;
    expect(queueDepth()).toBe(0);
  });
});
