# Security assessment — apex-scholar.com (2026-09-10)

Non-destructive review of the live production surface plus the source. No fuzzing,
no data written, no email sent. Owner-authorised (Anvith's own site).

Strix (github.com/usestrix/strix) needs Docker + an LLM key, and neither is
installed here; it also actively attacks its target, which is the wrong thing to
point at a live site with real users three days after an abuse suspension. It is
best run in **source mode** (`strix --target ./ap-prep-hub`) against a clone —
setup at the end. This review used the code directly, which for a codebase this
size is more thorough than a black-box agent anyway.

## Verdict

One real finding, medium severity, and it is the same class of problem that got
the project suspended. Everything else that was probed is correctly locked down.

## F1 — the AI proxy is an open proxy (MEDIUM) — FIXED 2026-09-13, not yet deployed

**`https://ai.apex-scholar.com` will serve anyone who copies a token out of the
public JavaScript.**

Evidence:

- The only gate is a shared `APP_TOKEN`. It is inlined into the production
  bundle — extracted it from `main.<hash>.js` and it matches the real
  `AI_PROXY_APP_TOKEN` in `.env`.
- A request with a **forged `Origin: https://evil.example.com`** and that token
  returns **HTTP 200** with a real model completion. CORS is origin-locked, but
  CORS only constrains browsers; `curl` ignores it. So origin-locking is not the
  control — the token is, and the token is public.
- The worker has **no per-IP rate limit and no identity check**. Its own comment
  says so: *"no Firebase-token verify / per-user quota here yet … Add jose+JWKS
  verify if abuse shows up."*
- The KV cache blunts repeated identical prompts (a hit costs zero quota), but an
  attacker sends unique prompts, so it does not help here.

Impact: someone can burn the free-tier Gemini quota across all 11 rotated keys —
denying AI to real students — and generate exactly the abuse pattern that led to
the Backup6 suspension. It does **not** expose user data or allow account
takeover.

**The fix is already half-built.** For signed-in users the client *already*
sends `Authorization: Bearer <firebase-id-token>` to the worker
(`geminiService.js:1123`) — the worker just ignores it. The fix:

1. Verify that ID token at the worker with `jose` against Google's JWKS
   (`https://www.googleapis.com/service_accounts/v1/jwk/...`), and reject
   requests without a valid one.
2. Enforce a per-`uid` quota in KV at the edge, so one account cannot flood it
   either.
3. Retire the shared `APP_TOKEN` as the security boundary (keep it only as a
   cheap first filter if you like).

The one decision this needs from you: **guests.** If anonymous visitors can use
the AI, they need Firebase anonymous auth (so they still carry a verifiable
token, on a tighter quota); if AI is sign-in-only, the change is free. Say which
and I will build it.

## What was tested and is solid

| surface | probe | result |
|---|---|---|
| Admin stats function | `GET`/`POST`, no auth | **403** — verifies a Firebase ID token against an admin-UID allowlist server-side |
| Email broadcast function | `POST`, no auth | **403** — same admin gate; not sender-spoofable |
| `cors-proxy` SSRF | `?url=http://169.254.169.254/…`, `example.com`, `file://` | **400 / 403** — HTTPS-only, host allowlist (`*.schoology.com`), origin-checked |
| Firestore data boundary | rule review + compile | every user collection is owner-scoped (`request.auth.uid == userId`); shared collections (`questionBank`, `curriculum`) are world-read / admin-write; public flashcard decks require an explicit `isPublic == true`; catch-all `match /{document=**} { allow read, write: if false }` |
| Stored XSS | grep for `dangerouslySetInnerHTML` / raw HTML | none — the one hit is a comment saying it is deliberately avoided; `MarkdownRenderer` uses `react-markdown` with **no `rehype-raw`**, so AI/user markdown is escaped |
| Secrets in bundle | key-shape scan of all served JS | only the Firebase **Web** API key (public by design) and the `APP_TOKEN` (the F1 weakness). No Gemini or service-account key. |
| Transport headers | `curl -I` | HSTS 1y, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` all present |

## Not covered (and why)

- ~~**No CSP.**~~ Added 2026-09-13 — see the remediation section below.
- **Authenticated fuzzing / business-logic abuse** (e.g. racing the usage
  limiter across tabs) was not attempted against production — it writes data and
  risks real users. This is where a Strix source-mode run adds the most.
- **Dependency CVEs** — not audited here; run `npm audit` and enable Dependabot.

## Running Strix yourself (source mode, safe)

```bash
# needs Docker running + an LLM key
curl -sSL https://strix.ai/install | bash
export STRIX_LLM="anthropic/claude-..."   # or any supported provider
export LLM_API_KEY="..."
strix --target /path/to/apex-scholar/ap-prep-hub
```

Source mode reads the code and reasons about it; it does not hammer the live
origin. Point it at a clone, not at the URL, and never at production while
students are on it.


---

# Remediation, 2026-09-13

Both changes are written and verified locally. **Neither is live until the user
deploys** — `wrangler deploy` for the Worker, `netlify deploy --prod` for the
headers and the function.

## F1 — identity at the edge

The Worker now verifies the Firebase ID token the client has been sending all
along (`geminiService._requestViaProxyNow` attaches it; the Worker just never
read it) and tiers off the result:

| caller | how it is recognised | may run | ceiling |
|---|---|---|---|
| signed in | RS256 signature against Google's JWKS, plus `aud`/`iss`/`exp`/`iat` | every task | 120 calls / 5h per uid |
| guest or attacker | no token, or one that fails any check | `tutorChat` (and a missing task, same chain), text only | 40 calls / h per IP |

`netlify/functions/ai-proxy.js` already verified ID tokens with the Admin SDK,
so it only needed the same guest-task restriction; the two allowlists are kept
in sync by a test.

**Firebase anonymous auth was rejected.** It was the obvious way to give guests
a verifiable token, and it buys nothing: anyone can mint anonymous accounts from
the public web API key, without limit, so the quota is re-rollable and the
"identity" is not one. It would also have set `user` in `AuthContext`, which is
what `GuestGate` keys off — every gated feature would have silently unlocked.

### What is still open, honestly

A stranger with the bundle's `APP_TOKEN` can still get tutor-chat completions at
40/hour/IP. Rotating IPs defeats that ceiling. Closing it properly needs a
Cloudflare Turnstile challenge in front of guest calls; that is the next rung,
not this one. What the fix does buy: the `vision` and `premium` chains (the
expensive pools, and the ones with 20 RPD floors) are now unreachable without a
real Google account, and per-uid abuse is attributable and capped.

### Verified locally (`wrangler dev --local`, dummy key)

| probe | result |
|---|---|
| no `X-App-Token` | 401 |
| guest + `tutorChat` | passes the gate, reaches the model chain |
| guest + no task | passes the gate (same `interactive` chain) |
| guest + `solver` / `practiceTest` / `frqGrade` | 403 |
| guest + `tutorChat` carrying an image | 403 (an image forces the `vision` chain regardless of task) |
| unsigned but well-formed JWT, correct `aud`/`iss` | treated as guest -> 403 on restricted tasks |
| valid-shaped JWT minted for another Firebase project | treated as guest -> 403 |
| 4th guest call with `GUEST_QUOTA=3` | 429 + `retryAfter` (the client already counts this down) |
| allowed guest call | `X-Apex-Tier: guest`, exposed via CORS |

Google's live JWKS was also imported through `crypto.subtle.importKey` to
confirm the key shape is accepted — if it were not, every signed-in student
would silently fall to the guest tier and practice tests would start 403-ing.

## CSP

Added to the `/*` header block in `netlify.toml`. `script-src` keeps
`'unsafe-inline'`: CRA inlines its webpack runtime into `index.html`, a static
build has no server to mint a nonce, and hashes go stale every build. What
survives that concession is the part that matters here — an injected payload
cannot fetch its code from an attacker's host, and `connect-src` caps where
anything can be sent.

Verified by serving the real production build with the real header and walking
`/ai-tutors`, `/practice-tests`, `/ap-score-calculator/ap-calculus-bc` and
`/login`: zero violations. Two were found and fixed this way:

- `wss://api.puter.com` — the Puter SDK opens a socket.io WebSocket, and `wss:`
  is a different scheme from `https:`, so the https entry did not cover it.
- the project's `firebaseapp.com` auth handler, for any host where the
  `/__/*` same-origin proxy in `public/_redirects` is not in play.

A deliberate `evil.example.com` fetch was blocked while `firestore`,
`identitytoolkit`, `googletagmanager` and `unpkg` all connected — that control
is what separates "CSP is correct" from "CSP is inert".
