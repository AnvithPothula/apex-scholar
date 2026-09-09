# Credential exposure — Apex-Scholar-Backup6 suspension

**Date:** 2026-09-09
**Project:** `apex-scholar-backup6`, project number 594811841840
**Trigger:** Google suspended it for "abusive activity consistent with hijacked
resources", citing credentials published in public sources.

## The vector: Netlify deploy permalinks

Every Netlify deploy keeps a **permanent, public URL** of the form
`https://<deploy-id>--apex-scholar.netlify.app`. It needs no authentication, it
is never garbage-collected, and it serves that build's JavaScript forever.

Create React App inlines every `REACT_APP_*` variable into the bundle at build
time. `.env` defines `REACT_APP_GEMINI_API_KEY` through `_11`. So those builds
shipped the keys.

**Verified by fetching the deploys:**

| deploy date | all 11 Gemini keys in `main.js` |
|---|---|
| 2026-06-02 (×2) | **yes** |
| 2026-07-10 | **yes** |
| 2026-07-23 | **yes** |
| 2026-07-27 | **yes** |
| 2026-07-29 | **yes** |
| 2026-08-11 onward | no |
| current production | no |

Something changed around 2026-08-11 that stopped inlining them. It does not
matter: **the older deploy URLs still serve the keys today.**

## Which key is Backup6's

Backup6's key ends `UGZg`. That is **Gemini key #8** in `GEMINI_API_KEYS`.

It is also, per the September probe, **the only one of the eleven with no
HTTP-referrer restriction** — the only one usable directly from a server with no
`Referer` header. Of the eleven exposed keys, it was the easiest to pick up and
use, which is a plausible reason its project was the one suspended.

## What this is NOT

Two earlier hypotheses, both checked and both wrong. Recording them so nobody
re-runs the search.

**Not the git history.** Two `AIza` keys are in the public repo's history and
GitHub flagged both on 2026-06-01 — but neither is Backup6's key. One is a
Gemini key no longer in `.env`; the other is the Firebase **Web** API key, which
is public by design and is not a secret. Both are still worth cleaning up. They
are not this incident.

**Not a service account.** History contains 4 `"type": "service_account"`
strings and 11 PEM `BEGIN PRIVATE KEY` headers. All of them are error messages,
test fixtures and `.env.example` comments. The only service-account identity is
the placeholder `firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com`.
Zero real private key material — a search for base64 runs of 64+ characters
following a PEM header returns nothing.

That distinction matters: an API key **cannot** create VMs, because API keys
carry no IAM permissions. Whatever Google saw, it was done with an API key doing
API-key things — most likely a large volume of Generative Language API calls,
which on a free-tier project is exactly what trips abuse detection.

## Was it caused by our own users?

No. Four independent reasons, and the third is the strongest.

**1. App traffic is negligible.** The app's own AI-usage counters
(`users/{uid}/usage/ai`) show **19 calls total across all users** in the current
rolling week. Top user: 9. Seven users have a usage record at all. Nobody is
near the 60-per-5-hours or 300-per-week cap. This is not traffic that trips an
abuse classifier.

**2. Nobody could have hit the caps anyway.** `aiUsageLimiter` enforces 60 AI
calls per rolling 5 hours, 300 per rolling week, and one practice test per day,
per signed-in user, transactionally in Firestore.

**3. Our key rotation would have spread the damage across all eleven
projects — and only one was suspended.** Both the Cloudflare Worker and the
Netlify proxy pick a *random* starting key and rotate:

```js
const start = Math.floor(Math.random() * API_KEYS.length);
// ...
const keyIdx = (start + i) % API_KEYS.length;
```

So **any** traffic through Apex Scholar's infrastructure — a legitimate user, an
abusive user, or someone who lifted the bundle-public `APP_TOKEN` and hammered
the proxy directly — distributes roughly evenly across all 11 projects.
Sustained abuse by that route would have got several projects suspended, not
one. Google suspended exactly one.

**4. Only key #8 was usable.** Of the eleven keys in those exposed bundles,
ten are restricted: keys 2–7 and 9–11 are locked to an HTTP referrer, and key 1
is blocked from the Generative Language API entirely. **Key #8 is the only one
with no restriction at all** (measured September 2026). An attacker who scrapes
a bundle tries all eleven; only #8 returns 200; only #8's project sees abuse;
only #8's project gets suspended.

That chain is self-consistent and explains the single-project suspension in a
way that app-mediated usage cannot.

### Did our own testing cause it?

Disclosed rather than assumed away, because the answer is "we generated real
volume on exactly this key".

On **2026-08-28**, seeding the question bank wrote **180 bundles**, each one a
successful `generateContent` call: 177 on `gemini-3.1-flash-lite`, 2 on
`gemma-4-31b-it`, 1 on `gemini-3.5-flash-lite`. Because keys 1–7 and 9–11 all
returned 403, **every one of those calls used key #8** — Backup6's key. Add
failed attempts, retries and the model-reliability probes run the same day and
the realistic total is **roughly 200–300 requests in a single day**, all on this
one project.

Why that is not the cause:

- **It was inside the free tier.** `gemini-3.1-flash-lite` allows 500 requests
  per day per project; 180 successful calls is about a third of it. Request rate
  stayed near 2–4/min against a 15/min ceiling, because each generation took
  10–40 seconds.
- **It was the owner, with the owner's own key, from the owner's own machine.**
  That is ordinary use of one's own project.
- **Google's classification does not describe volume.** The notice says
  *"abusive activity consistent with hijacked resources"*, and the appeal page
  says outright: *"We believe that your organization may have inadvertently
  published the affected Service Account credentials or API keys in public
  sources or websites, where a third party harvested them."* That is a
  credential-compromise finding. It is not a quota complaint, and it matches the
  deploy-permalink exposure verified above.
- **The timeline is wrong for it.** The keys were public from at least
  2026-06-02. The seeding was 2026-08-28 — nearly three months later, and 11
  days before the suspension.

What honesty requires: this burst is real, it is probably visible in Google's
logs for the project, and the appeal says so rather than claiming there was no
unusual activity. An appeal that denies something the reviewer can see is worse
than no appeal.

### What could not be checked

- **Sentry** — the connector is not authorised in this session. The
  `REACT_APP_SENTRY_DSN` is a write-only ingest key, not a read token, so
  historical errors could not be queried. Worth checking manually for a spike in
  429/403s around June–July.
- **Netlify function invocation counts** — not exposed by their public API.
- **Cloudflare Worker request analytics** — needs the GraphQL analytics API with
  an account token; `wrangler` does not surface it.

None of those would overturn point 3, which does not depend on volume data.

## Configuration error, separately

Gemini key #1 and the Firebase Web API key are **the same value** (both end
`okMI`). The Firebase web key is listed in `GEMINI_API_KEYS`, which is why it
returns `API_KEY_SERVICE_BLOCKED` when asked to call the Generative Language
API. It has never worked and never could. Remove it from that list.

## Remediation

- [x] Confirmed the suspension is genuine at `console.cloud.google.com` directly.
- [x] Enabled GitHub secret scanning and push protection.
- [x] Added `scripts/hooks/pre-commit` blocking `AIza…`, PEM keys and
      service-account JSON.
- [ ] **Rotate all 11 Gemini keys.** Every one was public for about two months.
      Rotating only #8 leaves ten burned keys in service.
- [ ] **Delete the old Netlify deploys** (2026-08-11 and earlier), which removes
      the permalinks. Netlify → Deploys → each deploy → Options → Delete.
- [ ] **Stop inlining keys.** Anything in `REACT_APP_*` is public the moment it
      builds. All Gemini calls already route through the Cloudflare Worker and
      the Netlify function, which hold keys server-side, so the
      `REACT_APP_GEMINI_API_KEY*` variables should simply be deleted.
- [ ] Remove the Firebase Web key from `GEMINI_API_KEYS`.
- [ ] Blocked until reinstated: reviewing activity, IAM and billing inside
      `apex-scholar-backup6`. The suspension banner blocks the console entirely.

## Post-rotation state (2026-09-09, after Anvith rotated)

Rotation in Google Cloud is done and clean: none of the eleven old suffixes
remain, and the new keys are **not** present in any `REACT_APP_*` variable.
Netlify holds no `REACT_APP_GEMINI_API_KEY*` at all any more, which is why
deploys from 2026-08-11 onward were already clean.

**But production was left broken.** The keys live in three places and `.env` is
the one that does not serve traffic:

| where | serves | state after rotation |
|---|---|---|
| `.env` | local dev, the seeder | rotated |
| Netlify `GEMINI_API_KEYS` | the `ai-proxy` function | **stale — revoked keys** |
| Cloudflare worker secrets | `ai.apex-scholar.com` | **stale — revoked keys** |

Confirmed by calling both live endpoints: each returned
`400 API_KEY_INVALID`. Every AI feature on the site — tutors, practice tests,
solver, flashcards — was failing.

`scripts/sync-ai-keys.mjs` exists so this cannot happen quietly again:
`--check` probes both runtimes end to end and says which is broken; `--apply`
pushes `.env`'s keys to Netlify and to all eleven worker secrets, sending values
over stdin so they never reach argv or shell history.

## The new key format

The rotated keys are **not** `AIza…`. They are 53 characters, start `AQ.`, and
contain dots — Google's newer API-key format.

This broke two things written earlier in the same session:

- The `sync-ai-keys` validator rejected all eleven as malformed.
- **The pre-commit hook would not have caught them.** It matched `AIza` only, so
  a pasted new-format key would have sailed through the exact guard built to
  stop this recurring.

Both now match `AIza[0-9A-Za-z_-]{30,}` **or** `AQ\.[A-Za-z0-9_.-]{40,}`. Worth
confirming GitHub secret scanning recognises the new format too; do not assume
it does.

## The rule to carry forward

`REACT_APP_*` is not configuration, it is **publication**. And a deploy platform
that keeps immutable public snapshots means "we removed it in a later build" is
not a fix — the old build is still being served.
