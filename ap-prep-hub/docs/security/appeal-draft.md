# Appeal — Apex-Scholar-Backup6 (project number 594811841840)

Paste the section between the rules. Replace [brackets] with what you have
actually done.

---

**Possible trigger of this activity**

I found it. My site is built with Create React App and hosted on Netlify. CRA
inlines every `REACT_APP_*` environment variable into the JavaScript bundle at
build time, and I had the API keys in variables with that prefix. So the built
JavaScript contained them.

Netlify also keeps a permanent public URL for every past deploy, of the form
https://<deploy-id>--apex-scholar.netlify.app. Those URLs need no login and are
never removed. I checked my old deploys today and confirmed the keys are still
readable in them right now, in builds dated 2026-06-02 through 2026-07-29.

This project's key is the one ending UGZg. It was in those bundles, along with
the ten others I use.

A later change stopped the keys being inlined, so my current live site does not
contain them. That did not help, because the old deploy URLs kept serving the
old build.

So the keys were publicly readable for roughly two months. I assume one was
picked up and used against this project. I did not authorise that usage.

**Planned steps to fix the problem**

Done:

- Identified the exact vector and the exposure window by fetching my own old
  deploys and confirming which builds contain the keys.
- Confirmed my current production build no longer contains them.
- Enabled GitHub secret scanning and push protection on my repository.
- Added a pre-commit hook that blocks API keys, private keys and
  service-account JSON.
- [Rotated all 11 API keys, not just this project's — every one of them was
  exposed in the same bundles.]
- [Deleted the old Netlify deploys so the permalinks no longer serve anything.]
- [Removed the REACT_APP_ prefixed key variables entirely. All AI calls already
  go through a Cloudflare Worker and a Netlify function that hold keys
  server-side, so the client never needs them.]

I cannot do the rest. Opening this project shows the suspension notice and
nothing else, so I cannot review activity, inspect IAM, check billing, or delete
unauthorised resources — three of the four steps your instructions ask for.

As soon as I have access: delete every key and service account in the project,
read the audit logs and billing to find what was created, delete it, and rotate
anything that touched the project.

If you can grant read-only access while the suspension stands, I will do that
review now and report what I find. If you would rather I abandon this project
and rebuild on a new one, say so and I will.

**If the behaviour is intentional, explain the business reasons**

It is not. Apex Scholar is a free AP exam study site I built as a high school
student. No ads, no paid tier. This project exists to hold an API key for the
Gemini API, used for tutoring and practice questions.

It has never run a VM, a container, or any compute instance, and an API key
cannot create one — API keys carry no IAM permissions. If there is compute in
this project, I did not create it.

One thing I should declare rather than leave you to find. On 2026-08-28 I ran a
batch job against this project's key to pre-generate practice questions for the
site. It made about 180 successful requests to the Generative Language API that
day, mostly to gemini-3.1-flash-lite, plus some failed retries — realistically
200 to 300 requests in total. That was me, from my own machine, using my own
key, and it stayed inside the free-tier limits for that model. If you see a
spike on 2026-08-28, that is what it was. I mention it because I would rather
tell you than have it look like something I hid.

I checked whether my own users could have caused this, and they could not. My
app's usage records show 19 AI calls in total across all users this week, and
per-user limits of 60 calls per five hours and 300 per week are enforced before
any request goes out. More conclusively: my server picks a random key from the
eleven and rotates through them, so any traffic through my application spreads
across all eleven projects roughly evenly. If the load had come through my app,
you would have suspended several projects. You suspended one — the one whose key
was the only one of the eleven with no restrictions on it, and therefore the only
one that works for somebody who just found it in a file.

**If you believe that the project may have been compromised by a third party**

Yes, and I can name the mechanism rather than guess. The key was readable in
publicly served JavaScript at my own hosting provider's deploy URLs from
2026-06-02 to at least 2026-07-29. That is the "published in public sources"
route your notice describes.

I am not disputing the suspension. The detection is correct and the exposure was
my mistake. I would like the project restored so I can clean it out properly and
keep the site running for the students using it.

[Your name]
[Owner email on the project]

---

## Before you send

- Only include a bracketed line if you have actually done it. They can verify,
  and a false claim in an appeal is worse than an incomplete one.
- Rotate first, then send. An appeal describing finished work is much stronger
  than one describing intentions.
- Say plainly that the console locks you out. It is true, it explains the gaps,
  and it turns a missing step into a question for them.
- Keep it this length. Reviewers want the trigger, the fix, and whether it can
  happen again.
