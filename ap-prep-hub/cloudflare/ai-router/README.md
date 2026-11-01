# apex-ai-router (Cloudflare Worker)

Drop-in replacement for `netlify/functions/ai-proxy` with a shared KV exact
cache and a global `Governor` Durable Object that shares the free Gemini pool
fairly under load (see "AI capacity" in the app README). The React client
already points here when `REACT_APP_AI_PROXY_URL` is set.

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

# 3. optional: turns on GET /stats?token=... (any long random string)
wrangler secret put STATS_TOKEN

# 4. deploy (the first deploy also creates the Governor Durable Object from
#    the v1-governor migration in wrangler.jsonc)
wrangler deploy
```

Then in **Netlify** set `REACT_APP_AI_PROXY_URL` to `https://ai.apex-scholar.com`
and redeploy. Done — the client switches to the Worker with cache; no app code
change.

Verify: DevTools Network on a repeated tutor question — second identical call
returns header `X-Apex-Cache: hit`. Every response also carries `X-Apex-Load`
(0 = quiet, 1 = the hour's budget is fully claimed).

## Tuning

All limits are plain vars in `wrangler.jsonc`, so a change is a redeploy, not a
code edit. `DAILY_CAPACITY` is the one to move: raise it if keys are added or
billing is turned on. The rest (`RPM_CAPACITY`, `HOURLY_MAX`/`HOURLY_MIN`,
`GUEST_HOURLY_MAX`/`GUEST_HOURLY_MIN`, `BURST_PER_MINUTE`, `GROUP_HOURLY_MAX`)
are described in the app README table.

`/stats` returns the Governor's view: calls today, the current hourly cap for
students and guests, load, and how many key/model pairs are cooling down.

## Free-plan limits that matter

- Workers: 100k requests/day, 50 subrequests per request (the walk stops at 12
  Gemini attempts).
- KV: 100k reads and 1k writes/day. Cache writes are best-effort; past the
  limit the Worker still answers, it just stops caching new answers.
- Durable Objects: 100k requests/day. Each uncached call is one admit plus at
  most one report.

The $5 Workers Paid plan lifts all three if launch traffic gets near them.

## What's skipped (ponytail), add when needed
- Semantic cache — exact only; add embeddings (Workers AI `bge-small`) when the
  exact hit-rate is measurably low.
