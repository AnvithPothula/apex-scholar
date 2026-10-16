# Canvas LMS integration for a third-party student study app (as of Oct 2026)

Scope: what Apex Scholar (React + Netlify functions + Firebase) can read from Instructure Canvas on a student's behalf, how it gets authorized, and where that breaks. Docs were fetched 2026-10-16 from developerdocs.instructure.com (the canvas.instructure.com/doc/api URLs now redirect there). Base for doc links: `https://developerdocs.instructure.com/services/canvas/...`.

## 1. Auth paths and who must approve each (OAuth2 Developer Key, personal access tokens, LTI 1.3, iCal feed, multi-tenant)

### Takeaway
No auth path works for a multi-district student app without the district's help. OAuth2 needs a Developer Key that the district's Canvas admin creates or turns on. The only exception is an Instructure-issued global key, which each district's admin still has to enable. Asking students to paste personal access tokens is banned outright by Canvas's API policy docs. Since 2025-2026, admins can also disable those tokens, and the ones students can still make expire in 30 days. The iCal feed is the one channel that needs no approval, but it only carries dates. It has no submission status and no grades.

### Cited Findings
**OAuth2 + Developer Keys**
- For Instructure-hosted Canvas, "developer keys are issued by the admin of the institution." The OAuth docs tell LTI providers serving many institutions to "store and look up the correct developer key" for each institution (e.g. by `custom_canvas_api_domain`). — [OAuth2 Overview](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth)
- A key created in a root account works only in that account and its sub-accounts. Global keys, created by Instructure employees, are "functional in any Canvas account where they are enabled." Root admins can switch global keys on or off for their own account. Vendors "may request a global developer key from Instructure." If a key isn't enabled, `/login/oauth2/auth` returns `unauthorized_client` and API calls return 401. — [Developer Keys](https://developerdocs.instructure.com/services/canvas/oauth2/file.developer_keys)
- The admin UI has an Account tab and an Inherited tab. "Inherited keys are keys created and managed at a global level by Canvas." Newly created keys default to off. Developer Keys is a root-account admin permission. (KB last updated Sep 8, 2026.) — [Community: manage developer keys](https://community.instructure.com/en/kb/articles/661518-how-do-i-manage-developer-keys-for-an-account)
- Flow: `GET https://<canvas>/login/oauth2/auth?client_id&response_type=code&state&redirect_uri[&scope]`, then `POST /login/oauth2/token` with `grant_type=authorization_code`. Access tokens last 1 hour (keys issued after Oct 2015). Refresh with `grant_type=refresh_token`. The refresh response contains no new refresh token, so the original one is reused. `DELETE /login/oauth2/token` logs out. `scope=/auth/userinfo` returns identity only (name and id). — [OAuth2 Overview](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth)
- A stored token returning 401 with a `WWW-Authenticate` header can mean the token was issued on a different Canvas domain, so the app has to track tokens per domain. The docs say tokens are "equivalent to storing the user's password": don't put them in web pages or URLs, and secure the store. — [OAuth2 Overview](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth)
- Scopes take the form `url:<VERB>|<path>`, e.g. `url:GET|/api/v1/courses/:course_id/rubrics`. Only a root admin or Instructure can grant them. Requested scopes must be a subset of the key's scopes. An unscoped key reaches everything the user can reach. One token holds about 110 scopes before hitting the 8000-char header limit. Removing a scope invalidates existing tokens. — [Developer Keys](https://developerdocs.instructure.com/services/canvas/oauth2/file.developer_keys); scope list: [API Token Scopes](https://developerdocs.instructure.com/services/canvas/resources/api_token_scopes)
- **Allow Include Parameters:** with a scoped token, Canvas ignores `include`/`includes` unless the admin turned on "Allow Include Parameters" for the key. This matters because `include[]=submission` on assignments and `include[]=total_scores` on courses are how the app gets status and grades. — [Developer Keys](https://developerdocs.instructure.com/services/canvas/oauth2/file.developer_keys)
- Real-world risk: after a May 1, 2026 Canvas incident, Instructure rotated at least one vendor's inherited (global) key. That "invalidated" every user OAuth token issued under it, so users had to re-authorize. — [FeedbackFruits help: May 1st Canvas incident](https://help.feedbackfruits.com/hc/en-us/articles/35311868629138-Follow-up-do-I-need-to-rotate-any-keys-after-the-May-1st-Canvas-incident)

**Personal (user-generated) access tokens**
- The OAuth docs say manual tokens are for testing only: "asking any other user to manually generate a token and enter it into your application is a violation of Canvas' API Policy. Applications in use by multiple users MUST use OAuth." Tokens are made on `/profile` under "Approved Integrations." — [OAuth2 Overview](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth)
- Timeline of Instructure changes (post dated Oct 16, 2025):
  - Sep 10, 2025: admins can stop all non-admins, or all students, from generating tokens (account settings).
  - Oct 8, 2025: every token needs a purpose; student-only users' tokens must expire within 120 days; admins can view and delete a user's tokens.
  - July 30, 2026: instructor tokens also get a mandatory expiry. — [Community: Strengthening Security… User Access Token Management](https://community.instructure.com/en/discussion/660299/strengthening-security-in-canvas-updates-to-user-access-token-management)
- Canvas Deploy Notes (2026-07-01, item added 2026-07-22): expiry is mandatory for all non-admin tokens; "Student token expiration changes from 120 days to 30 days"; "For new access tokens, the maximum expiration is 30 days." — [Canvas Deploy Notes 2026-07-01](https://community.instructure.com/en/discussion/666398/canvas-deploy-notes-2026-07-01)
- **Conflict on instructor token lifetime:** the deploy notes say 30 days. Stanford ("As of 8/12/26… expire 90 days after creation… only student tokens were required to expire (30 days)") and the Instructure community post (90 days) both say 90. Student = 30 days is consistent across all three. — [Stanford gocanvas Summer 2026](https://gocanvas.stanford.edu/news/canvas-update-summer-2026)
- Admin KB (updated Jul 27, 2026): token generation is limited by the "Users – Manage Access Tokens" permission. Without it, "the Add New Access Token button is disabled." "Existing personal tokens are not removed, but unauthorized users are unable to regenerate them." — [Community: manage API access tokens as admin](https://community.instructure.com/en/kb/articles/661608-how-do-i-manage-api-access-tokens-for-a-user-as-an-admin)
- Institutions shutting off student tokens:
  - UW–Madison: students "no longer able to manually generate access tokens" from Nov 14, 2025. — [UW–Madison IT](https://it.wisc.edu/academic-technology/learn-uw-news/change-to-student-access-tokens-in-canvas/)
  - UW (Seattle): "Students are restricted from generating API tokens" (cites FERPA). — [UW Connect KB0034590](https://uwconnect.uw.edu/it?id=kb_article_view&sysparm_article=KB0034590)
  - Cornell: decommissioned manual tokens Apr 2, 2024. — [Cornell](https://learn.canvas.cornell.edu/canvas-api-access-tokens/)
  - St. Edward's: "Students are not allowed to generate tokens." — [St. Edward's](https://support.stedwards.edu/TDClient/96/Portal/KB/Article/6479/Canvas-API-Access-Tokens)
  - Mizzou: no individual tokens. — [UM System](https://tdx.umsystem.edu/TDClient/66/MOOnline/KB/Article/2193/Canvas-user-API-token-policy)
- Token API: `GET /api/v1/users/:user_id/user_generated_tokens`. Token object fields include `expires_at`, `workflow_state`, `purpose`, `scopes`. — [Access Tokens](https://developerdocs.instructure.com/services/canvas/resources/access_tokens)

**LTI 1.3 / LTI Advantage**
- LTI Advantage services (Names and Role Provisioning, Assignment and Grade Services) use a client-credentials grant signed with the tool's RS256 key. They need an LTI developer key and a deployment. "Access tokens only work in the context of where a tool has been deployed. Tools can only access line items that are associated with their tool." Endpoints: `/api/lti/courses/:course_id/names_and_roles`, plus Line Items, Score and Result. — [OAuth2 Overview – LTI Advantage](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth); [Names and Role](https://developerdocs.instructure.com/services/canvas/resources/names_and_role.md), [Line Items](https://developerdocs.instructure.com/services/canvas/resources/line_items.md), [Result](https://developerdocs.instructure.com/services/canvas/resources/result.md)

**iCal feed**
- The feed "contains events and assignments from all of your Canvas calendars": future items up to 366 days ahead, past items from the last 30 days, at most 1,000 items. "To Do items are not included." Google Calendar can take up to 24 h to sync. (KB updated Sep 30, 2026.) — [Community: Calendar feed in Google Calendar](https://community.instructure.com/en/kb/articles/662797-how-do-i-subscribe-to-the-calendar-feed-using-google-calendar)
- A course object exposes `"ics": "https://canvas.instructure.com/feeds/calendars/course_abcdef.ics"`. When you request your own user profile, it includes "the user's calendar feed URL." — [Courses](https://developerdocs.instructure.com/services/canvas/resources/courses.md); [Users](https://developerdocs.instructure.com/services/canvas/resources/users.md)

### Inferences
- Multi-tenant cost: Canvas has no single "Sign in with Canvas." Every district is its own root account on its own domain (e.g. `dpsk12.instructure.com`). Apex Scholar would need, per domain, either a district-created key (stored client_id/secret plus a domain to key lookup) or an Instructure global key that the district's admin has enabled. Without admin action, OAuth fails with `unauthorized_client`.
- The Schoology pattern of students pasting a key/secret has no compliant Canvas equivalent. Building on personal tokens breaks the API policy, can be switched off per district, and now needs re-pasting every 30 days. A PAT-based "bring your own token" import is at best a power-user stopgap, with legal and policy risk.
- LTI 1.3 does not solve the student use case. AGS only shows line items the tool itself created, so not the teacher's real assignments or grades. NRPS gives rosters, not grades. It also needs an admin (or permitted teacher) install. Its value is as a way in: an LTI launch supplies `custom_canvas_api_domain` and identity, and can be paired with a REST developer key.
- The iCal feed is the only zero-approval path. A student pastes their feed URL and the server fetches and parses it (no auth, no CORS problem server-side). It gives assignment titles and due dates with links, but no submission state, grades or weights. The URL is a bearer secret, so treat it like a token.

### Gaps
- Instructure's current process, requirements and timeline for getting a **global/inherited developer key** (e.g. Partner Program membership, security review) were not found in primary docs. The community KB also mentions "Canvas Apps" listings, but I couldn't confirm whether these now replace inherited API keys.
- Whether K-12 districts commonly allow **teachers** (not just admins) to install LTI 1.3 tools was not verified.
- Exact fields in each iCal VEVENT (e.g. whether the assignment URL or course name is always included) were not checked against a live feed.
- How many K-12 districts (as opposed to universities) have turned off student PATs: no data found. The Reddit poll on this (r/canvas 1vxat0u) couldn't be scraped.

## 2. Submission/completion detection (submissions endpoints, workflow_state, late/missing/excused, missing_submissions, reliability by type)

### Takeaway
A student-scoped token can read its own submissions in bulk with `GET /api/v1/courses/:course_id/students/submissions`, which defaults to the calling user. Signals include `workflow_state`, `submitted_at`, `late`, `missing`, `excused`, `late_policy_status` and `posted_at`. `submitted_at != null` (or `workflow_state` in submitted/graded/pending_review) is reliable for online submission types. It is meaningless for `on_paper`/`none` assignments, which never get a student submission.

### Cited Findings
- Bulk endpoint: `GET /api/v1/courses/:course_id/students/submissions` (also `/sections/:section_id/...`). `student_ids[]`: "If this argument is omitted, return submissions for the calling user. Students may only list their own submissions."
  - Params: `assignment_ids[]`, `grouped`, `submitted_since`, `graded_since`, `grading_period_id`, `workflow_state` (`submitted|unsubmitted|graded|pending_review`), `enrollment_state`, `order` (`id|graded_at`).
  - `include[]`: `submission_history, submission_comments, rubric_assessment, assignment, total_scores (needs grouped), visibility, course, user, …, student_entered_score`.
  - Scope: `url:GET|/api/v1/courses/:course_id/students/submissions`. — [Submissions](https://developerdocs.instructure.com/services/canvas/resources/submissions)
- Single submission: `GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id`. The usual `self` user_id convention applies (my inference from Canvas convention; not shown verbatim on this page). Per-assignment list: `GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions`. — [Submissions](https://developerdocs.instructure.com/services/canvas/resources/submissions)
- Submission object fields:
  - `workflow_state` is one of "submitted", "unsubmitted", "graded", "pending_review".
  - `submitted_at`, `submission_type` (`online_text_entry|online_url|online_upload|online_quiz|media_recording|student_annotation`).
  - `late`, `missing`, `excused` ("Excused assignments have no impact on a user's grade"), `late_policy_status` (late, missing, extended, none, null), `points_deducted`, `seconds_late`, `extra_attempts`, `redo_request`.
  - `assignment_visible` (false means the submission no longer counts toward the grade).
  - `grader_id` (negative = autograded by a quiz or LTI tool), `graded_at`, `score`, `grade`, `grade_matches_current_submission`.
  - `posted_at`: "The date this submission was posted to the student, or nil if it has not been posted." — [Submissions](https://developerdocs.instructure.com/services/canvas/resources/submissions)
- Assignment list with embedded submission: `GET /api/v1/courses/:course_id/assignments` (and `GET /api/v1/users/:user_id/courses/:course_id/assignments`).
  - `include[]=submission` gives "The current user's current Submission". Other includes: `all_dates, overrides, observed_users, can_edit, score_statistics, ab_guid`.
  - `bucket` = `past|overdue|undated|ungraded|unsubmitted|upcoming|future`. Also `order_by` = `position|name|due_at`.
  - Assignment fields include `submission_types`, `has_submitted_submissions`, `omit_from_final_grade`, `hide_in_gradebook`, `post_manually`, `is_quiz_assignment`, `quiz_id`. — [Assignments](https://developerdocs.instructure.com/services/canvas/resources/assignments)
- Allowed `submission_types`. Non-online options: "online_quiz", "none", "on_paper", "discussion_topic", "external_tool". Online options: "online_upload", "online_text_entry", "online_url", "media_recording", "student_annotation". — [Assignments](https://developerdocs.instructure.com/services/canvas/resources/assignments)
- Missing list: `GET /api/v1/users/:user_id/missing_submissions` returns "past-due assignments for which the student does not have a submission". The caller must be the student, an admin or a parent observer. Options: `include[]=planner_overrides|course`, `filter[]=submittable|current_grading_period`, `course_ids[]`. Returns Assignment objects. — [Users](https://developerdocs.instructure.com/services/canvas/resources/users.md)
- New Quizzes: "New Quizzes are stored as external_tool assignments, so they cannot be identified by submission type alone" (from the `/users/self/todo` docs). — [Users](https://developerdocs.instructure.com/services/canvas/resources/users.md)
- Classic quizzes: separate Quiz Submissions API (`/api/v1/courses/:course_id/quizzes/:quiz_id/submissions`). — [Quiz Submissions](https://developerdocs.instructure.com/services/canvas/resources/quiz_submissions.md)

### Inferences
- Suggested "done" rule: done if `submission.submitted_at != null`, or `workflow_state ∈ {submitted, graded, pending_review}`, or `excused == true`. Exclude `submission_types` containing `on_paper`/`none`, or treat those as "teacher-graded only, can't auto-detect". A `graded` state with a null `submitted_at` happens for paper work the teacher graded. It means the teacher entered a grade, not that the student turned it in.
- External-tool and New Quizzes assignments only show as submitted after the tool syncs a result back (via AGS), so completion may lag or never appear for tools that don't post back. This is inferred and unverified per tool.
- Discussion-graded assignments (`discussion_topic`) create a submission when the student posts (Canvas behavior per general knowledge; not verified in docs here).
- `redo_request: true` and a `late_policy_status` of `missing` set manually can flip a "done" task back to not done. Re-sync should handle that.
- Efficient sync: one `students/submissions?student_ids[]=self`-style call per course with `submitted_since=<last sync>`, instead of one call per assignment.

### Gaps
- No primary doc gives submission behavior per tool for New Quizzes or third-party `external_tool` assignments (timing of `submitted_at`).
- Not confirmed on this page whether `student_ids[]=all` or other IDs are rejected for a student token. The docs say students "may only list their own".

## 3. Planner API (items, overrides, marked_complete): read and write the student's "mark as done"

### Takeaway
Yes on both. With the student's token the app can read planner items, including each item's `planner_override.marked_complete` and submission status. It can also create or update overrides to mark items done in Canvas. That allows two-way sync between Apex Scholar tasks and the Canvas To Do / planner check-off.

### Cited Findings
- `GET /api/v1/planner/items` (current user). Observers use `GET /api/v1/users/:user_id/planner/items`.
  - Params: `start_date`, `end_date`, `context_codes[]` (e.g. `course_42`), `observed_user_id`.
  - `filter=new_activity|incomplete_items|complete_items`. The "complete" filter "includes items with planner_override.marked_complete = true or submitted assignments".
  - Each item has `plannable_type` (announcement, assignment, discussion_topic, quiz, wiki_page, planner_note, calendar_event, assessment_request, sub_assignment, peer_review_sub_assignment), `planner_override` (or null), and `submissions` (statuses of the user's submissions, or `false` when no assignment exists). — [Planner](https://developerdocs.instructure.com/services/canvas/resources/planner)
- Overrides: `GET /api/v1/planner/overrides`, `GET|PUT|DELETE /api/v1/planner/overrides/:id`, `POST /api/v1/planner/overrides`. `marked_complete` "controls whether or not the associated plannable item is marked complete on the planner". `dismissed` controls whether it shows in the opportunities list. — [Planner](https://developerdocs.instructure.com/services/canvas/resources/planner)
- To Do list: `GET /api/v1/users/self/todo` (capped item count; `ignore`/`ignore_permanently` DELETE URLs), `GET /api/v1/users/self/todo_item_count`, `GET /api/v1/users/self/upcoming_events`, `GET /api/v1/courses/:course_id/todo`. — [Users](https://developerdocs.instructure.com/services/canvas/resources/users.md); [Courses](https://developerdocs.instructure.com/services/canvas/resources/courses.md)

### Inferences
- The planner's `submissions` object plus `marked_complete` is the cheapest single feed for "what's due and is it done" across all courses (one paginated call by date range).
- Writing overrides is a non-GET call. The API policy flags a "disproportionately large number of high-impact (e.g. non-GET) requests", so writes should only follow explicit user actions. Scoped keys also need the PUT/POST override scopes.

### Gaps
- Not verified whether students can always see planner items in courses using the classic dashboard, or whether the student planner must be enabled for the account.

## 4. Grades: is there enough for a grade calculator?

### Takeaway
Mostly yes, and Canvas goes further than Schoology. Course totals come from enrollments (`current_score`/`final_score`, per grading period). Assignment groups give `group_weight` and drop rules, and courses expose `apply_assignment_group_weights`. Per-assignment scores come from submissions. Canvas also has a server-side **What-If Grades API** that recomputes the grade from a hypothetical score. Limits: unposted (hidden) scores and `hide_final_grades` courses hide data from students, and grading standards (letter cutoffs) may need extra calls.

### Cited Findings
- Enrollment grades: `GET /api/v1/users/:user_id/enrollments` and `/courses/:course_id/enrollments`. `grading_period_id` returns grades for that period, otherwise the whole course. `include[]=current_points`.
  - The `grades` object has `current_score`, `final_score`, `current_grade`, `final_grade`, each "Only included if user has permissions to view".
  - `unposted_*` variants are "including muted/unposted assignments", and points need manage-grades permission.
  - Period fields: `current_grading_period_id`, `current_grading_period_title`, `totals_for_all_grading_periods_option`, `current_period_override_score`, `override_score`. — [Enrollments](https://developerdocs.instructure.com/services/canvas/resources/enrollments)
- Courses `include[]=total_scores` adds `computed_current_score/final_score/current_grade/final_grade` to student enrollments. "This argument is ignored if the course is configured to hide final grades." `current_grading_period_scores` adds per-period fields. Course fields: `apply_assignment_group_weights` ("weight final grade based on assignment groups percentages"), `hide_final_grades`, `grading_standard_id`, `grading_periods`. — [Courses](https://developerdocs.instructure.com/services/canvas/resources/courses.md)
- `GET /api/v1/courses/:course_id/assignment_groups`
  - Includes `assignments`, plus `submission`, `all_dates`, `overrides`, `score_statistics`, `discussion_topic` and `assignment_visibility`, which are valid only alongside `assignments`.
  - Params `grading_period_id` and `scope_assignments_to_student` (needs grading periods and a student caller).
  - Group fields: `group_weight` (e.g. 20) and `rules` (`drop_lowest`, `drop_highest`, `never_drop`). — [Assignment Groups](https://developerdocs.instructure.com/services/canvas/resources/assignment_groups)
- Grading periods: `GET /api/v1/courses/:course_id/grading_periods`; each period has a `weight` toward the period set. Grading standards: `GET /api/v1/courses/:course_id/grading_standards[/:id]`. — [Grading Periods](https://developerdocs.instructure.com/services/canvas/resources/grading_periods.md); [Grading Standards](https://developerdocs.instructure.com/services/canvas/resources/grading_standards.md)
- What-If: `PUT /api/v1/submissions/:id/what_if_grades` with `student_entered_score`. It returns recalculated `current`/`final` course grades and per-group `{score, possible, weight, grade, dropped}`. The docs warn "Grade calculation is a costly operation, so this API should be used sparingly." The submission `include[]=student_entered_score` returns the saved what-if score. — [What If Grades](https://developerdocs.instructure.com/services/canvas/resources/what_if_grades.md); [Submissions](https://developerdocs.instructure.com/services/canvas/resources/submissions)
- Hidden grades: a submission's `posted_at` is nil until the score is posted to the student. Assignments carry `post_manually`. — [Submissions](https://developerdocs.instructure.com/services/canvas/resources/submissions); [Assignments](https://developerdocs.instructure.com/services/canvas/resources/assignments)
- `score_statistics` (min/max/mean) "will not be included for students if there are less than 5 graded assignments or if disabled by the instructor." — [Assignments](https://developerdocs.instructure.com/services/canvas/resources/assignments)

### Inferences
- A local calculator can copy Canvas: per group, sum earned over possible after applying drop rules, skipping excused, `omit_from_final_grade` and unposted items. Then weight by `group_weight` if `apply_assignment_group_weights`, and weight grading periods by `weight` when totals span periods. Validate against `current_score` from enrollments to catch mismatches. "Current" ignores ungraded work; "final" counts ungraded as zero.
- Students won't get `unposted_*`, so the calculator matches what the student sees in Canvas, which is the right behavior.
- The What-If API is a correct-by-construction alternative to reimplementing Canvas math. It writes state to Canvas (the saved what-if score) and is expensive, so use it sparingly. Its availability may depend on a Canvas feature (unverified).
- Scoped developer keys must allow includes (`include[]=submission`, `total_scores`), or the calculator gets no data.

### Gaps
- Not verified whether the What-If Grades API is generally available or behind a feature flag or recent release. Also not checked whether `student_entered_score` is per-user persistent in the Grades page UI.
- No post-policy resource page could be fetched (the `post_policy` doc path 404s). Hidden-grade behavior is inferred from `posted_at` and `post_manually`.
- Late-policy deductions (`points_deducted`) are already in `score`; not checked whether `entered_score` (pre-deduction) is visible to students.

## 5. Other readable data (courses, modules, pages, files, announcements, discussions, quizzes, calendar, inbox)

### Takeaway
A student token reaches almost everything the student can see in the Canvas UI: courses, modules, pages, files, announcements, discussions, classic quizzes, New Quizzes metadata, calendar events and conversations. Content import for AI study tools (e.g. generating flashcards from module pages) is technically possible but needs broader scopes, and the API policy's AI-transparency clauses apply.

### Cited Findings
- Courses: `GET /api/v1/courses` (with `include[]=syllabus_body, total_scores, current_grading_period_scores…`). Each course has an `ics` calendar URL. — [Courses](https://developerdocs.instructure.com/services/canvas/resources/courses.md)
- Calendar: `GET /api/v1/calendar_events` with `type=event|assignment|sub_assignment`. `GET /api/v1/users/:user_id/calendar_events` supports `submission_types[]` / `exclude_submission_types[]` when `type=assignment`. — [Calendar Events](https://developerdocs.instructure.com/services/canvas/resources/calendar_events.md)
- Resource APIs exist for [Modules](https://developerdocs.instructure.com/services/canvas/resources/modules.md), [Pages](https://developerdocs.instructure.com/services/canvas/resources/pages.md), [Files](https://developerdocs.instructure.com/services/canvas/resources/files.md), [Announcements](https://developerdocs.instructure.com/services/canvas/resources/announcements.md), [Discussion Topics](https://developerdocs.instructure.com/services/canvas/resources/discussion_topics.md), [Conversations](https://developerdocs.instructure.com/services/canvas/resources/conversations.md), [Quizzes](https://developerdocs.instructure.com/services/canvas/resources/quizzes.md) (classic) and [New Quizzes](https://developerdocs.instructure.com/services/canvas/resources/new_quizzes.md). These are listed in the docs index ([llms.txt](https://developerdocs.instructure.com/llms.txt)); individual student-permission details were not fetched.
- The API policy (effective Aug 12, 2025) requires that apps "Notify Customers and Users about any use of GAI", say whether inputs train models or are stored, and label "reports generated by GAI". — [Instructure API Policy](https://www.instructure.com/policies/canvas-api-policy)

### Inferences
- Useful extras for Apex Scholar: `syllabus_body` (exam dates), module and page text (AI study material), announcements (test reminders). Each widens the scope list a district admin must approve, which works against approval. A minimal scope set (courses, assignments, assignment_groups, submissions, enrollments, planner) is easier to sell.

### Gaps
- Student-visible fields and permissions for New Quizzes results through the New Quizzes API were not confirmed in primary docs.
- Canvas GraphQL (`/api/graphql`) was not researched. It might cut call counts for assignments + submissions + groups.

## 6. Rate limits, pagination, webhooks/Live Events, CORS

### Takeaway
Throttling works per access token as a leaky bucket. Probes showed `X-Rate-Limit-Remaining: 700.0` at rest, and serial requests are rarely throttled. Pagination defaults to 10 items, so follow `Link` headers. Live Events webhooks are admin-configured Canvas Data Services, so there is no student-level push and the app must poll. Canvas returns no CORS headers for third-party origins, so every API call has to go through a server proxy (a Netlify function).

### Cited Findings
- Throttling: each request costs quota (`X-Request-Cost`) and `X-Rate-Limit-Remaining` shows what's left. Exceeding it returns `429 Forbidden (Rate Limit Exceeded)`. Parallel requests take a pre-flight penalty. "Any API client that makes no more than one simultaneous request is unlikely to be throttled." "Each access token has its own quota." — [Throttling](https://developerdocs.instructure.com/services/canvas/basics/file.throttling)
- API policy: "Rate limiting is enforced per user access token". Instructure "may revoke your access tokens" for apps that regularly exceed limits or send heavy non-GET traffic. — [Instructure API Policy](https://www.instructure.com/policies/canvas-api-policy)
- Pagination: default 10 per page, `per_page` has "an unspecified limit". Use `Link` rels `current/next/prev/first/last`, treated as opaque. `last` may be omitted, and the header name is case-insensitive. — [Pagination](https://developerdocs.instructure.com/services/canvas/basics/file.pagination)
- Live Events: customers subscribe through Canvas Data Services, delivered to AWS SQS or an HTTPS webhook (optional JWT signing). They "should not be used for applications that need their data immediately". Setup is done by an admin in Data Services. — [Live Events intro](https://developerdocs.instructure.com/services/canvas/data-services/live-events/overview/file.data_service_introduction.md); [Live Events setup](https://developerdocs.instructure.com/services/canvas/data-services/live-events/overview/file.data_service_setup.md)
- CORS, empirical probe (2026-10-16, Origin `https://apexscholar.example`):
  - `OPTIONS /api/v1/users/self` returned **404 with no `Access-Control-*` headers** on `dpsk12.instructure.com` (a K-12 district), `canvas.uw.edu` and `canvas.harvard.edu`.
  - `GET` returned 401 with `www-authenticate: Bearer realm="canvas-lms"`, `x-rate-limit-remaining: 700.0`, `x-request-cost` and no `Access-Control-Allow-Origin`.
  - `canvas.instructure.com` returned 503 from AWS ELB to curl.
  - The docs portal's own assistant says Canvas docs don't document CORS and recommends a proxy. — probe run by researcher (this session); [Instructure docs Q&A](https://developerdocs.instructure.com/services/canvas/basics/file.pagination.md)

### Inferences
- Architecture: browser → Netlify function → `https://<district>.instructure.com/api/v1/...`, with OAuth tokens encrypted at rest (Firebase/Firestore with server-only access) and never sent to the client. Polling costs per student (sync every 15-60 min plus on app open, with `submitted_since`) fit inside per-token quotas.
- Netlify function timeouts (10 s default; check the plan) mean large first syncs should be chunked per course.

### Gaps
- The exact default bucket size and refill rate aren't published; 700 is observed, not documented.
- The CORS probe only checked an unauthenticated preflight on three hosts. Canvas allows CORS for some first-party/LTI contexts, but behavior with a valid Bearer token from a foreign origin wasn't tested. Even so, a missing preflight response means browsers would block the `Authorization` header.

## 7. Privacy and compliance (FERPA, district DPAs, Instructure API policy)

### Takeaway
Grades, enrollments and submissions are FERPA education records. Instructure's API policy requires treating them as private, bans apps that violate school policies, and (since Aug 2025) bans unapproved access methods such as MCP servers. The developer key a district must create or enable is itself the approval gate, so in practice each district will expect a Student Data Privacy Agreement before turning the key on.

### Cited Findings
- The API policy (effective 12 Aug 2025) covers each "individual's use of the Canvas API". Principles: "Don't impersonate", "Don't surprise Customers or Users", "Be transparent and respect the privacy of any information retrieved". "Any User information—including course enrollments, grades, profile information… should be considered and treated private information and… protected by law". The app "must outline what actions your application will take… as part of the application registration process." — [Instructure API Policy](https://www.instructure.com/policies/canvas-api-policy)
- Prohibited uses include:
  - (h) "using our APIs to distribute software or tools that gather information"
  - (i) access via "model context protocol servers or other technologies not approved by Instructure"
  - (k) use "in a manner that you know or reasonably should know violates the policies… of Instructure's customers (e.g., the academic integrity policy…)"
  - and "Use the APIs on behalf of any third-party". — [Instructure API Policy](https://www.instructure.com/policies/canvas-api-policy)
- Endpoint and field deprecations get ≥90 days' notice. Undocumented fields can change without notice. — [Instructure API Policy](https://www.instructure.com/policies/canvas-api-policy)
- FERPA lets institutions share student records with contractors or others "performing services for the educational institution" in some circumstances (the school-official route). — [studentprivacy.ed.gov](https://studentprivacy.ed.gov/privacy-and-data-sharing)
- Universities cite FERPA as their reason to block student tokens ("the use and sharing of these tokens exposes FERPA-protected student information"). — [UW Connect](https://uwconnect.uw.edu/it?id=kb_article_view&sysparm_article=KB0034590)
- K-12 practice: districts run third-party app approval processes and data privacy agreements, and the Student Data Privacy Consortium (SDPC) supplies common agreement templates. These are secondary sources. — [ManagedMethods](https://managedmethods.com/blog/student-data-privacy-and-3rd-party-apps/); [r/edtech DPA thread](https://www.reddit.com/r/edtech/comments/1j0z07g/seeking_advice_on_student_data_privacy_agreements/); [Wisconsin DPI resources](https://dpi.wi.gov/wise/data-privacy/resources)

### Inferences
- If a student authorizes the app themselves through a district-enabled key, Apex Scholar is likely in the district's vendor/school-official category and will be asked for an SDPC-style DPA, COPPA handling for under-13s (less relevant for AP students), and state laws (e.g. CA SOPIPA, NY Ed Law 2-d). This is general practice, not verified per state here.
- Apex Scholar's AI features trigger the GAI disclosure duties if they touch Canvas-derived data.
- Browser-extension tools (e.g. "Tasks for Canvas") avoid developer keys by running on the student's own Canvas session. That model isn't covered by the OAuth docs and conflicts with the policy's ban on unapproved access technologies. Not recommended without legal review. — [UniFlow on Tasks for Canvas (secondary)](https://www.uniflowstudy.com/blog/best-canvas-chrome-extensions)

### Gaps
- No primary Instructure document states what a vendor must show to get a global developer key (security questionnaire, DPA, 1EdTech/TrustEd Apps certification).
- State-by-state K-12 privacy law obligations for a direct-to-student app were not researched.
- No legal source found on whether a student-initiated (not district-contracted) app counts as a "school official" under FERPA. That depends on the district relationship.
