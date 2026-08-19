import { isChunkLoadError, retryingImport, clearChunkReloadFlag } from './lazyWithRetry';

const memStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};
const chunkErr = () => Object.assign(new Error('Loading chunk 3939 failed.'), { name: 'ChunkLoadError' });

describe('isChunkLoadError', () => {
  it('recognises the shapes bundlers actually throw', () => {
    expect(isChunkLoadError(chunkErr())).toBe(true);
    expect(isChunkLoadError(new Error('Loading CSS chunk 12 failed'))).toBe(true);
    expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module: /x.js'))).toBe(true);
  });

  it('does not swallow a real code error', () => {
    // Misclassifying this would turn a genuine bug into a reload loop.
    expect(isChunkLoadError(new TypeError('x is not a function'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe('retryingImport', () => {
  it('passes through on success without touching storage', async () => {
    const storage = memStorage();
    const factory = jest.fn().mockResolvedValue({ default: 'Page' });
    await expect(retryingImport(factory, { storage })()).resolves.toEqual({ default: 'Page' });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(storage.getItem('apex:chunk-reload')).toBeNull();
  });

  it('retries once and succeeds on a transient failure', async () => {
    const factory = jest.fn()
      .mockRejectedValueOnce(chunkErr())
      .mockResolvedValueOnce({ default: 'Page' });
    const reload = jest.fn();
    await expect(retryingImport(factory, { retryDelayMs: 0, storage: memStorage(), reload })())
      .resolves.toEqual({ default: 'Page' });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads once when the chunk is really gone', async () => {
    // This is the bug: React never retries, so Suspense hangs forever.
    const factory = jest.fn().mockRejectedValue(chunkErr());
    const reload = jest.fn();
    const storage = memStorage();
    let settled = false;
    retryingImport(factory, { retryDelayMs: 0, storage, reload })().then(() => { settled = true; });
    await new Promise((r) => setTimeout(r, 10));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false); // must not resolve — the page is navigating away
    expect(storage.getItem('apex:chunk-reload')).toBe('1');
  });

  it('does not loop when the reload did not help', async () => {
    const storage = memStorage();
    storage.setItem('apex:chunk-reload', '1');
    const reload = jest.fn();
    await expect(retryingImport(jest.fn().mockRejectedValue(chunkErr()), { retryDelayMs: 0, storage, reload })())
      .rejects.toThrow(/Loading chunk/);
    expect(reload).not.toHaveBeenCalled();
  });

  it('rethrows a real error immediately, without retrying or reloading', async () => {
    const factory = jest.fn().mockRejectedValue(new TypeError('boom'));
    const reload = jest.fn();
    await expect(retryingImport(factory, { retryDelayMs: 0, storage: memStorage(), reload })())
      .rejects.toThrow('boom');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
  });

  it('never reloads when storage throws (private mode)', async () => {
    const throwing = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    const reload = jest.fn();
    await expect(retryingImport(jest.fn().mockRejectedValue(chunkErr()), { retryDelayMs: 0, storage: throwing, reload })())
      .rejects.toThrow(/Loading chunk/);
    expect(reload).not.toHaveBeenCalled();
  });
});

describe('clearChunkReloadFlag', () => {
  it('lets the NEXT deploy reload again', () => {
    const storage = memStorage();
    storage.setItem('apex:chunk-reload', '1');
    clearChunkReloadFlag(storage);
    expect(storage.getItem('apex:chunk-reload')).toBeNull();
  });

  it('is safe when storage is unavailable', () => {
    expect(() => clearChunkReloadFlag(null)).not.toThrow();
  });
});
