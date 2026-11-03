Subject: Cross-school approval for a read-only student app (Apex Scholar)

Hi,

I'm the developer of Apex Scholar (https://apex-scholar.com), a free, open-source AP exam prep site
(MIT, https://github.com/AnvithPothula/apex-scholar). I've created it in the App Publisher as a
Standard App and would like it approved for students outside my own school under the June 25, 2025
OAuth/API update.

What it does with Schoology: a student signs in with three-legged OAuth 1.0a, and the app reads only
that student's own sections, assignments, due dates and submission status, so its study scheduler can
plan AP review around their real coursework. It is read-only (GET requests only, enforced server-side),
never acts for other users, stores tokens server-side in the US, deletes them when the student
disconnects, and re-authorizes after the 90-day token limit. Privacy policy:
https://apex-scholar.com/privacy

Questions:
1. Is App Center review the right path for a standalone web app that uses three-legged OAuth, or is
   there a separate approval for cross-school API access?
2. What does the review check, and what should I provide (test account, data-flow description)?
3. Once approved, do districts also need to allow the app before their students can authorize it?

Thanks,
Anvith Pothula
