/**
 * `React.lazy` that survives a stale chunk.
 *
 * A code-split route fetches its chunk by hashed filename. After a deploy those
 * hashes change and the old files are gone, so any tab that was already open
 * gets a 404 for the chunk. `React.lazy` rejects, and because the rejection
 * happens inside Suspense with no error boundary between, the fallback stays
 * mounted FOREVER — a permanent skeleton with no error and no retry. React does
 * not retry a failed lazy import; the promise result is cached.
 *
 * This is what "Progress showed the skeleton until I reloaded" was, and the
 * unexplained bare `404 (Not Found)` lines in the console with no path attached
 * are the chunk requests themselves.
 *
 * Strategy: retry once after a short delay (covers a transient network blip),
 * then force ONE full reload to pick up the new asset manifest. The reload is
 * guarded by sessionStorage so a genuinely broken build cannot loop.
 */

const RELOAD_KEY = 'apex:chunk-reload';

/** Chunk-load failures don't share an error type across bundlers; match text. */
export function isChunkLoadError(error) {
  const msg = String(error?.message || error || '');
  return (
    error?.name === 'ChunkLoadError' ||
    /Loading chunk [\w-]+ failed/i.test(msg) ||
    /Loading CSS chunk/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

/**
 * @param {() => Promise<any>} factory the same `() => import('...')` you'd pass to lazy
 * @param {{retryDelayMs?: number, storage?: Storage, reload?: () => void}} [deps] for tests
 */
export function retryingImport(factory, deps = {}) {
  const {
    retryDelayMs = 400,
    storage = typeof sessionStorage !== 'undefined' ? sessionStorage : null,
    reload = () => window.location.reload(),
  } = deps;

  return async () => {
    try {
      return await factory();
    } catch (error) {
      if (!isChunkLoadError(error)) throw error; // a real code error must surface

      // One in-place retry: enough for a dropped request, and it costs nothing
      // when the chunk is genuinely gone.
      try {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        return await factory();
      } catch (second) {
        if (!isChunkLoadError(second)) throw second;
      }

      // Still missing: the deployed manifest changed under us. Reload once.
      let alreadyReloaded = false;
      try {
        alreadyReloaded = storage?.getItem(RELOAD_KEY) === '1';
        storage?.setItem(RELOAD_KEY, '1');
      } catch {
        // Private mode can throw on setItem. Fall through to the throw below
        // rather than risking a reload loop we cannot detect.
        alreadyReloaded = true;
      }
      if (!alreadyReloaded) {
        reload();
        // Never resolves — the page is going away. Resolving with a stub would
        // flash a broken route in the frame before navigation.
        return new Promise(() => {});
      }
      throw error;
    }
  };
}

/** Call once after a successful load so the next stale deploy can reload again. */
export function clearChunkReloadFlag(storage = typeof sessionStorage !== 'undefined' ? sessionStorage : null) {
  try { storage?.removeItem(RELOAD_KEY); } catch { /* ignore */ }
}
