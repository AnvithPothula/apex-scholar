# apex-ai-router (Cloudflare Worker)

Drop-in replacement for `netlify/functions/ai-proxy` with a shared KV exact
cache. The React client already points here when `REACT_APP_AI_PROXY_URL` is set.

## Manual steps (one-time)

You need a free Cloudflare account. Everything else is CLI:

```bash
npm i -g wrangler
cd cloudflare/ai-router
wrangler login                                   # opens browser once

# 1. KV namespace, then paste the printed id into wrangler.jsonc (id field)
wrangler kv namespace create CACHE

# 2. Gemini keys as secrets (paste each when prompted) — the 10-project set
wrangler secret put GEMINI_API_KEY
wrangler secret put GEMINI_API_KEY_2
# ... through GEMINI_API_KEY_11

# 3. deploy
wrangler deploy
```

Then in **Netlify** set `REACT_APP_AI_PROXY_URL` to the printed
`https://apex-ai-router.<you>.workers.dev` and redeploy. Done — the client
switches to the Worker with cache; no app code change.

Verify: DevTools Network on a repeated tutor question — second identical call
returns header `X-Apex-Cache: hit`.

## What's skipped (ponytail), add when needed
- Firebase token verify + per-user server quota — client limiter + origin lock
  hold for now; add jose/JWKS verify if abuse appears.
- Semantic cache — exact only; add embeddings (Workers AI `bge-small`) when the
  exact hit-rate is measurably low.
