# Schoology (PowerSchool Schoology Learning) REST API: what a student-authorized third-party app can read (as of Oct 2026)

Method note: Primary sources are the official developer docs at developers.schoology.com (fetched 2026-10-16; site footer reads "Schoology © 2026") and PowerSchool's Schoology admin docs at uc.powerschool-docs.com (pages last modified 2026-08-11). Most REST reference pages are undated and the example payloads use 2013-2015 timestamps, so they are old content that is still live, not docs written recently. Real-world behavior comes from two open-source student clients: the Schoology Plus browser extension (github.com/aopell/SchoologyPlus, last commit 2024-09-08) and the Raycast "Schoology - Grade Viewer" extension (raycast/extensions/extensions/schoology, last changelog entry 2025-03-31). Neither shows behavior after the June 2025 auth change.

## Auth options, who controls them, and 2023-2026 changes

### Takeaway
The biggest risk for Apex Scholar is the June 25, 2025 policy. A third-party app's consumer key can now read users outside its own school only if Schoology has approved it in the App Center. An unapproved app gets 401s. Personal API keys can no longer read other users' data. OAuth1 access tokens also expire after 90 days. So a generic OAuth 1.0a consumer key from any developer account will not work for arbitrary students in other districts until the app goes through Schoology's App Center review, which can take up to 1 month. Students cannot register developer apps, and since Aug 2022 districts new to Schoology have student personal-key creation turned off by default.

### Cited Findings
- **June 25, 2025 security change:** "This update introduces additional security measures for OAuth/API keys used by 3rd party apps to access data in Schoology from June 25, 2025... This does not affect apps in the Schoology App Center." — [Important OAuth/API Authentication Update](https://developers.schoology.com/api-documentation/important-api-authentication-update/)
- **Personal keys limited to the key owner:** "This will ensure that Personal API keys cannot access other user data. Integrations using Personal API keys will receive a 401 error." — [same page](https://developers.schoology.com/api-documentation/important-api-authentication-update/)
- **Approval needed to reach other schools:** "Apps that are unpublished or available only within the school will continue to access users within the same school without changes." Also: "Moving forward, apps must be approved by Schoology to access data from other schools. Unapproved apps will receive a 401 error when attempting to access user data." — [same page](https://developers.schoology.com/api-documentation/important-api-authentication-update/)
- **90-day token TTL:** "OAuth1 access tokens will have a maximum lifetime of 90 days from issuance." After expiry, requests "will fail with a 401 authentication error until a new valid token is used", and apps "must complete the OAuth1 re-authorization flow." The notice adds that it "does not change endpoint behavior, scopes, or Schoology App Center approval requirements." — [same page](https://developers.schoology.com/api-documentation/important-api-authentication-update/)
- **Three-legged OAuth 1.0a:** the flow is `/oauth/request_token` → redirect the user to `{domain}/oauth/authorize` → `/oauth/access_token`. Users "can revoke access from any third-party application, which invalidates the previously issued token." Signatures are HMAC-SHA1 (recommended) or PLAINTEXT (HTTPS only), with `oauth_version="1.0"` and `realm="Schoology API"`. — [Authentication](https://developers.schoology.com/api-documentation/authentication/)
- **Two-legged OAuth:** for "a simple application that acts only on behalf of you". `oauth_token` must be the empty string. Consumer keys "can be obtained by clicking on the Integration menu item... NOTE: only users with roles that have the Access Schoology API permission can obtain an API consumer key." — [Authentication](https://developers.schoology.com/api-documentation/authentication/)
- **Where personal credentials live:** "To generate your Schoology API credentials, sign in to your account and visit https://www.schoology.com/api." — [Design & Architecture](https://developers.schoology.com/api-documentation/design-architecture/). Student tools tell users to visit `https://[district].schoology.com/api` and copy the key and secret. — [Raycast Schoology extension](https://www.raycast.com/Visual-Studio-Coder/schoology)
- **District control over personal keys:** the "Create New API Keys" role permission works like this: "Enabled: Users are able to generate their own API keys... Disabled: Users cannot generate API keys. District Administrators can manage which users are able to generate their own API keys. This feature is unchecked by default for all user roles in school districts that are new to Schoology as of 8/4/2022." — [PowerSchool: Search, apps, and API permissions](https://uc.powerschool-docs.com/en/schoology/latest/search-apps-and-api-permissions) (page modified 2026-08-11)
- **Admin visibility of keys:** admins can see whether a user has generated a key and when, "but they cannot access the key itself." Users can revoke a key at app.schoology.com/api. — [PowerSchool: API Key management](https://uc.powerschool-docs.com/en/schoology/latest/api-key-management)
- **App-related role permissions:** "Install applications", "Develop apps" and "Access to app center" are described as "only available for faculty roles." "Develop apps" exposes "My Developer Apps" in the App Center. — [PowerSchool: Search, apps, and API permissions](https://uc.powerschool-docs.com/en/schoology/latest/search-apps-and-api-permissions)
- **Becoming a developer:** if you belong to an enterprise org, ask the System Administrator for "Schoology Apps:Develop apps". Otherwise "you must register. Once you are approved, the user you created will be granted permission to create and test your App." Apps are created at `https://app.schoology.com/apps/publisher`. "Options → API Info" gives the client_id "as well as OAuth 1.0 credentials if you will need to call the Schoology API from your App." — [LTI Apps](https://developers.schoology.com/app-platform/lti-apps/)
- **App Center approval process:** "If your App is only for use in your School District, you do not need to go through the approval process." Otherwise you submit a form, and "The review process takes up to 1 month." A reviewer installs the app and verifies it. On success, "your App will be published in the Schoology App Center." Before approval, the app "will not be available in the App Center." — [LTI Apps](https://developers.schoology.com/app-platform/lti-apps/)
- **Two OAuth stacks:** OAuth 2.0/OIDC exists only for LTI 1.3 launches and services. Endpoints: `https://lti-service.svc.schoology.com/lti-service/authorize-redirect` and `.../access-token`. Client-credentials uses JWT only. The REST API v1 is still OAuth 1.0a. — [LTI Apps](https://developers.schoology.com/app-platform/lti-apps/), [Authentication](https://developers.schoology.com/api-documentation/authentication/)
- **Third-party summary (2026):** "Any signed-in user can generate a key under their own account, but it only sees that one person's classes... anything beyond your own personal data needs your district administrator to issue keys." The article also notes the early-2025 PowerSchool data breach "is why districts gate API access." — [Carly blog, 2026-07-15](https://www.usecarly.com/blog/claude-schoology-integration/). This is a secondary source and does not mention the June 2025 App Center rule.

### Inferences
- Apex Scholar's current Netlify three-legged flow can only reach students outside the developer account's own school after the app is App Center-approved. Before that, expect 401s on user data. The approval path is the App Publisher plus the review form, and approval is per app, not per district.
- The 90-day TTL means stored access tokens need a re-auth prompt, either proactively at around day 80 or on a 401.
- Fallback without approval: a student pastes their own personal key and secret (two-legged, PLAINTEXT over HTTPS), which is what Schoology Plus and Raycast do. This works only if (a) the district enables "Create New API Keys" for students (off by default for districts onboarded after 8/4/2022) and (b) personal keys still read the owner's own data after June 2025. The notice implies (b) but no post-June-2025 client confirms it. Storing a student's key and secret server-side is a credential-handling and FERPA liability.
- The docs describe no scope granularity for REST OAuth 1.0a. A user token appears to carry that user's full permissions, including writes, so the app cannot request "read-only" from Schoology. Read-only has to be enforced in our own proxy with a GET-only allowlist.

### Gaps
- The text of the App Center review form and its criteria (privacy/FERPA, data use) were not visible. The developer registration page link target could not be confirmed.
- No PowerSchool announcement of a REST API v1 sunset or an OAuth 2 migration for REST was found for 2023-2026. The June 2025 notice explicitly says OAuth1 flows "remain the same."
- Whether a district admin must also install or allow an approved App Center app before its students can authorize it was not confirmed. The "Access to app center" and per-app "Access app" role permissions suggest districts can block it.
- Whether personal keys still read the owner's own data after June 25, 2025 has no direct confirmation.

## Submission and completion data (auto-marking a study task done)

### Takeaway
Yes, mostly. For dropbox-style assignments, the student's own submission revisions are readable. Each revision carries `created`, `late` and `draft` flags, and "latest revision exists and is not a draft" is the heuristic Schoology Plus uses for its "submitted" checkmark. Graded status and excused/incomplete/missing come from `exception` and `grade` in `/users/{id}/grades`. Tests/quizzes (assessments), discussions, external tools and paper work have no dropbox revisions, so for those "submitted" is only inferable from a grade appearing.

### Cited Findings
- **Submissions endpoints:** `GET /v1/sections/{section_id}/submissions/{grade_item_id}` lists revisions grouped by user, with `with_attachments` and `all_revisions` options. `GET /v1/sections/{section_id}/submissions/{grade_item_id}/{user_id}` returns one user's revisions, newest first. There is also a per-revision view and a submission comments endpoint, `.../{user_id}/comments`. — [Submissions](https://developers.schoology.com/api-documentation/rest-api-v1/submissions/)
- **Revision fields:** `revision_id`, `created` ("The time the revision was submitted"), `late` ("whether or not this revision was turned in late"), `num_items`, and `draft` ("A user can only have one active draft"). — [Submissions](https://developers.schoology.com/api-documentation/rest-api-v1/submissions/)
- **Schoology Plus's "submitted" test:** it calls `dropbox/${assignmentId}/${userId}` (an older alias not listed in the current reference) and treats an item as complete when `revisions && revisions.length && !revisions[revisions.length - 1].draft`. On error it logs that the item is "likely not a normal assignment." Users can also override completion manually. — [SchoologyPlus src/scripts/pages/home.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/home.ts)
- **Dropbox alias in the docs:** the docs mention a `dropbox/assignment_id/create` POST in the `body` field description. — [Submissions](https://developers.schoology.com/api-documentation/rest-api-v1/submissions/)
- **Conflicting description:** the Schoology Plus FAQ says it checks "if Schoology has the assignment marked 'completed'". The code actually checks dropbox revisions. — [Schoology Plus FAQ](https://schoologypl.us/docs/faq/api) vs. [home.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/home.ts)
- **Assignment fields:** list/view responses include `due` (YYYY-MM-DD HH:MM:SS), `allow_dropbox`, `available`, `completed`, `dropbox_locked` and `completion_status`. The last four appear in example payloads but are not described in the field table; `completion_status` is shown as `""`. `type` ∈ {assignment, discussion, assessment}. `dropbox_submissions` and `dropbox_last_submission` are "only available to teachers" (with `?with_dropbox_stats=TRUE`). — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- **Collected-only items:** `collected_only` "Allows teachers to simply mark materials as completed or not; useful for collecting forms or documenting in-class participation." — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- **Grade exceptions (documented):** "Right now the only exceptions that exist are 1 for 'excused' & 2 for 'incomplete'." If exception > 0, grade is NULL. — [Grade](https://developers.schoology.com/api-documentation/rest-api-v1/grade/)
- **Exception 3 = Missing (undocumented):** both open-source clients map `exception == 3` to "Missing". — [SchoologyPlus materials.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/materials.ts); [Raycast showGrades.jsx `getExceptionText`](https://github.com/raycast/extensions/tree/main/extensions/schoology). Schoology Plus also reads `.exception-icon.missing` from the gradebook DOM. — [grades.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/grades.ts)
- **Section completion object:** `GET /v1/sections/{section_id}/completion` (and `/completion/user/{uid}`) returns `total_rules`, `completed_rules`, `percent_complete` and `completed`. This is section-level completion-rules progress, not per-assignment status. — [Completion](https://developers.schoology.com/api-documentation/rest-api-v1/section-completion/)
- **Discussions:** discussion threads carry `graded`, `due`, `available`, `completed`, `collected_only` and `require_initial_post`. — [Discussion Thread](https://developers.schoology.com/api-documentation/rest-api-v1/discussion-thread/)
- **Grade items endpoint:** `GET /sections/{id}/grade_items` lists all grade items, while `/assignments` "only returns grade-items of type assignment." — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)

### Inferences
- **Proposed status rule:**
  1. **Submitted:** the latest revision exists and `draft == 0`.
  2. **Late:** that revision has `late == 1`.
  3. **Graded:** a `/users/{me}/grades` row has a non-null `grade` and `exception == 0`. If the teacher hasn't published grades (`auto_publish_grades = 0`), the row will be null or missing.
  4. **Excused / incomplete / missing:** `exception` 1 / 2 / 3.
  5. **Not submitted, past due:** no revision and `now > due`. That is our own judgment, not a Schoology flag.
- For `type: assessment` (Schoology Tests/Quizzes), discussions, external/LTI tools and collected-only columns, use "grade or exception present" as the completion signal and keep a manual "mark done" fallback, as Schoology Plus does.
- The undocumented `completed` / `completion_status` fields on assignments may reflect completion rules or "mark as done". They are not proven to mean "submitted", so don't rely on them without testing them on a real student account.

### Gaps
- No primary source defines `completion_status` values, or `completed` / `available` on assignments.
- No source confirms whether a student token gets 403 or only its own rows on `GET /sections/{id}/submissions/{grade_item_id}` (the all-users list). The per-user path is the safe choice.
- Whether Schoology Tests/Quizzes expose student attempt status via REST v1 was not found. Only `type: assessment` grade items are documented.

## Grades, categories, weights, and what-if calculation

### Takeaway
`GET /users/{user_id}/grades` returns everything a Bessy/gunn.one-style calculator needs. Per assignment it gives grade, max_points, exception, category_id, scale_id and is_final. Per period it gives a final grade broken down by category, plus category titles. Whether categories are weighted is a section option, and per-category weights and drop-lowest exist on `grading_categories`. However, Schoology Plus pulls category weights from the gradebook DOM rather than the API, and it warns that teachers can hide max points on missing work. Expect gaps, so offer manual weight entry.

### Cited Findings
- **`/users/{user_id}/grades` (list):** "View a list of grades in the active enrollments for the given user." Filters: `section_id`, `grading_period_ids` ("Use 'other' for the 'Other' grading period, and 'final' for final grades"), `timestamp` (only grades updated since), and `include_all_enrollments=1`. The output is paginated by enrollment with `links.next`. — [User Grades](https://developers.schoology.com/api-documentation/rest-api-v1/user-grades/)
- **Response shape:**
  - `section[].period[].assignment[]` items have `enrollment_id`, `assignment_id`, `grade`, `exception`, `max_points`, `is_final`, `timestamp`, `comment`, `comment_status`, `override`, `calculated_grade`, `pending`, `type`, `location`, `scale_id`, `scale_type` and `category_id`.
  - `section[].final_grade[]` has `period_id`, `grade`, `weight`, `comment`, `scale_id` and `grading_category[]` ({category_id, grade}). There is a separate `period_id: "final"` row.
  - `section[].grading_category[]` has {id, title}.
  - `comment_status`: "Only administrators will see this value."
  - Source: [User Grades](https://developers.schoology.com/api-documentation/rest-api-v1/user-grades/)
- **Grading category fields:** `GET/POST/PUT /sections/{section_id}/grading_categories` uses `id`, `title`, `calculation_type` (1 = Percent, 2 = Total pts), `default_max_points`, `default_grading_scale_id`, `drop_lowest` (0-10), `weight` and `delta`. — [Grading Categories](https://developers.schoology.com/api-documentation/rest-api-v1/grading-categories/)
- **Weighted flag:** the section option `options/weighted_grading_categories` means "Whether grading categories for this course are weighted; otherwise, categories will be weighted evenly." — [Course Section](https://developers.schoology.com/api-documentation/rest-api-v1/course-section/)
- **Assignment `factor`:** "The relative weight of this assignment" (default 1.0). `count_in_grade = 0` means the score is "not impacting a students calculated grade". — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- **Grading scales:** `sections/{section_id}/grading_scales` is listed as "allow you to use non-numeric notations within grades (eg A+, etc)". — [REST API index](https://developers.schoology.com/api-documentation/rest-api-v1/)
- **Grading periods:** `/gradingperiods`, `/gradingperiods/{id}`. — [REST API index](https://developers.schoology.com/api-documentation/rest-api-v1/)
- **Section grades list:** `/sections/{section_id}/grades` lists all students and is meant for teachers. It also returns `period[].weight` and `final_grade[]`. — [Grade](https://developers.schoology.com/api-documentation/rest-api-v1/grade/)
- **Grade visibility settings:** `auto_publish_grades`: "Assignment grades will be visible to students and guardians as soon as they are entered." `show_comments`: "Show grade comments to students". `grade_stats` controls statistics visibility. — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- **Schoology Plus what-if source:** its what-if feature gets the grades JSON from `users/{id}/grades?section_id=` but reads category weights from the rendered gradebook (`.percentage-contrib`). If weighted categories don't sum to 100%, it abandons its calculation. — [SchoologyPlus grades.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/grades.ts)
- **Missing max points:** Schoology Plus warns: "You have one or more missing assignments for which the total points are unknown due to restrictions put in place by your teacher." — [grades.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/grades.ts)
- **Raycast calculator:** it computes the weighted average from `grades_response.section[0].grading_category` using `category.weight`, falling back to equal weights. It excludes `exception === 1` and null grades. — [Raycast showGrades.jsx](https://github.com/raycast/extensions/tree/main/extensions/schoology)

### Inferences
- A what-if calculator is feasible:
  - Sum earned/max per `category_id`, applying `drop_lowest` and `calculation_type`.
  - Weight categories by `weight` when `weighted_grading_categories = 1`, otherwise evenly.
  - Exclude excused/incomplete items and `count_in_grade = 0` items. Treat missing (3) as 0.
  - Validate against `final_grade[].grade` for the period.
- Teacher overrides (`override`), ungraded categories, teacher-hidden grades and SIS-calculated finals will make the result diverge, so show "Schoology says X%" next to our computed value.

### Gaps
- Whether a student token can `GET /sections/{id}/grading_categories`, and whether `/users/{id}/grades` includes `weight` on `grading_category[]` for students, is undocumented. The doc example shows only id and title. Raycast reads `weight`, but Schoology Plus's DOM scraping hints it may be absent. Test with a real student token.
- Whether the API hides grades that a teacher has not published was not documented.

## Other readable data

### Takeaway
A student token can plausibly read:
- their sections (`/users/{id}/sections`)
- assignments with due dates
- events with date filters
- updates and announcements (`/recent` and `/sections/{id}/updates`)
- documents, pages and folder trees
- discussions

Attendance and section-wide grade/submission lists are teacher/admin-oriented.

### Cited Findings
- **Enrolled sections:** `users/{id}/sections` returns "Course Sections that a user is enrolled in". `users/{id}/groups` also exists. — [REST API index](https://developers.schoology.com/api-documentation/rest-api-v1/)
- **Assignments:** `sections/{section_id}/assignments` (with `with_attachments`, `with_tags`, `limit`). Results are "first ordered by assignment type (non-final and final), and then by due date", and start/limit apply to each type separately. — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- **Events:** `[realm]/events` for districts, schools, users, sections and groups, filterable by `start_date`/`end_date`. Event `type` ∈ {event, assignment, discussion}, where assignment/discussion are due events. — [Event](https://developers.schoology.com/api-documentation/rest-api-v1/event/)
- **Updates:** `[realm]/updates` for users, sections and groups. "The URL '/recent' is an alias for '/users/%uid/updates'". `with_attachments` returns attachments and polls. — [Updates](https://developers.schoology.com/api-documentation/rest-api-v1/update/)
- **Other content endpoints:**
  - Documents: `[realm]/documents`
  - Pages: `sections/{id}/pages`
  - Course folder: `courses/{section_id}/folder/{folder_id}`, which returns contents in course order, with `type` ∈ {folder, assignment, discussion, media-album} and `location` pointers
  - Discussions and replies
  - Media albums
  - SCORM and web content packages
  - Blog posts
  - Source: [REST API index](https://developers.schoology.com/api-documentation/rest-api-v1/), [Course Folder](https://developers.schoology.com/api-documentation/rest-api-v1/course-folder/)
- **Attendance:** `sections/{section_id}/attendance` returns status 1 present, 2 absent, 3 late, 4 excused, filterable by `start`/`end`/`enrollment_id`. It "will not return records for a status of PRESENT". — [Attendance](https://developers.schoology.com/api-documentation/rest-api-v1/attendance/)
- **Reminders:** reminder types are `ungraded`/`resubmitted` and are "for course section admins" only, so they are not useful to students. — [Reminders](https://developers.schoology.com/api-documentation/rest-api-v1/reminders/)
- **Other:** private messages (`messages/inbox`), grading rubrics (`sections/{id}/grading_rubrics`) and `app-user-info` (checks for a Schoology web session). — [REST API index](https://developers.schoology.com/api-documentation/rest-api-v1/), [Apps Platform](https://developers.schoology.com/app-platform/)
- **CSV export:** "Only school-wide admins have access to this bulk export feature." — [REST API index](https://developers.schoology.com/api-documentation/rest-api-v1/)

### Inferences
- For Apex Scholar, the high-value reads are `/users/me` → uid, `/users/{uid}/sections`, `/sections/{id}/assignments` (titles + `due`), `/users/{uid}/grades?section_id=…&timestamp=…`, the per-user submissions path, and `/recent` for announcements. This beats the iCal feed: it adds stable IDs, `type`, `max_points` and category.
- Attendance probably returns 403 or nothing for students. It is unverified and low value.

### Gaps
- No mastery/standards (learning objectives) REST endpoint appears in the v1 index. I found no source for student-readable mastery data.
- Student-role access to attendance and documents in restricted folders is not documented per role.

## Write access

### Takeaway
Read-only is a choice we enforce, not something Schoology enforces. A student OAuth token can call write endpoints such as creating or deleting their own submission revisions and posting updates or comments. There is no student "mark as done" write for assignments.

### Cited Findings
- **Submission writes:** `POST /sections/{section_id}/submissions/{grade_item_id}/{action}` creates a revision from files or text. If the `draft` flag is unset, "the API will default to submitting this revision". DELETE exists for revisions and submission comments. — [Submissions](https://developers.schoology.com/api-documentation/rest-api-v1/submissions/)
- **Other writes:** the API supports creating events, sending private messages, posting updates and so on: "you can view course information, user profiles, create events, send and receive private messages". — [API Documentation](https://developers.schoology.com/api/)
- **Completion and attendance:** completion objects are list/view only. Grade and attendance updates are documented as teacher operations. — [Completion](https://developers.schoology.com/api-documentation/rest-api-v1/section-completion/), [Grade](https://developers.schoology.com/api-documentation/rest-api-v1/grade/), [Attendance](https://developers.schoology.com/api-documentation/rest-api-v1/attendance/)

### Inferences
- The Netlify proxy should allowlist GET only, plus POST `/multiget`, which is a read batch. This prevents accidental or abusive writes on the student's behalf, especially submission deletes.

### Gaps
- None material.

## Rate limits, pagination, webhooks, freshness

### Takeaway
There is no published official rate-limit doc. Community clients cite 15 requests per 5 s (Schoology Plus) and 50 requests per 5 s (Raycast). Plan for about 2-3 req/s per user token, use `/multiget` (up to 50 URLs per call), and use `timestamp`-filtered grade polling. Webhooks ("Event Triggers") exist but only school admins can configure them, so a student-authorized app must poll.

### Cited Findings
- **Schoology Plus limit:** "real limit is 15/5s but we want to be conservative" — it throttles to 13 per 5000 ms. — [SchoologyPlus src/scripts/utils/api.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/utils/api.ts)
- **Raycast limit:** "schoology imposes a 50 requests per 5 second limit". This conflicts with Schoology Plus; neither cites an official source. — [Raycast Schoology extension](https://www.raycast.com/Visual-Studio-Coder/schoology)
- **Multi-get:** `POST /multiget`. "There is a request limit of 50 URLs." It is enabled for `/users/[id]/sections`, `/sections/[id]/assignments`, `/sections/[id]/grade_items`, `/sections/[id]/grades`, `/[realm]/[id]/updates`, `/events`, `/discussions` and more. — [Multi-get](https://developers.schoology.com/api-documentation/rest-api-v1/multi-get/)
- **Pagination:** lists are paged with `start`/`limit`. Example `links.self` shows `?start=0&limit=20`. `/users/{id}/grades` paginates by enrollment via `links.next`. — [Submissions](https://developers.schoology.com/api-documentation/rest-api-v1/submissions/), [User Grades](https://developers.schoology.com/api-documentation/rest-api-v1/user-grades/)
- **Incremental sync:** `timestamp` filters on `/users/{id}/grades` and `/sections/{id}/grades` return only grades changed since then. — [User Grades](https://developers.schoology.com/api-documentation/rest-api-v1/user-grades/), [Grade](https://developers.schoology.com/api-documentation/rest-api-v1/grade/)
- **Event Triggers:** "School admins can configure targets to listen for events that happen inside of their school." A user "must have access to the Schoology Trigger UI." Endpoints are `/v1/triggers/targets` and `/v1/triggers/subscriptions` (e.g. trigger "grades"). — [Event Triggers](https://developers.schoology.com/api-documentation/rest-api-triggers-v1/)
- **Redirect gotcha:** `v1/users/me` and `v1/users/ext/<id>` respond with 303 redirects. Following a redirect with the same nonce/timestamp gives "401 Duplicate timestamp/nonce combination". Re-sign before following. — [Authentication](https://developers.schoology.com/api-documentation/authentication/)

### Inferences
- **Polling plan:** on app open and every 15-30 min while active, fetch `/users/{uid}/grades?timestamp={lastSync}`. For assignments due soon that are still open, check submissions per user. Batch through `/multiget`. Raycast's notifications poll every 20 min. — [Raycast CHANGELOG](https://github.com/raycast/extensions/tree/main/extensions/schoology)
- Schoology Plus caps at 13/5 s and Raycast cites 50/5 s, so staying under ~13/5 s per token is the safe bound until we measure.

### Gaps
- No official documentation of rate-limit values, whether the limit is per key or per user, or 429 headers (e.g. Retry-After).
- Max allowed `limit` per page is not documented in the pages fetched. 200 is commonly assumed but unverified.

## Practical gotchas

### Takeaway
- Custom domains: the authorize redirect must go to the student's own Schoology domain.
- SSO: the authorize step requires an active Schoology web session, which SSO provides.
- Districts can block personal keys and app access.
- Teachers can hide grades and max points.
- Tokens expire after 90 days.

### Cited Findings
- **Domains:** "schools can also specify their own custom subdomain (schoolname.schoology.com) or custom domain (lms.schoolname.org)." Authorizing on www.schoology.com risks associating tokens "with the wrong user" (e.g. shared lab computers). Use `$authorize_url = 'http://' . $domain . '/oauth/authorize'`, with the domain taken from SAML `domain` or the HTTP referrer. — [Handling Domains](https://developers.schoology.com/app-platform/handling-domains/)
- **SSO login during authorize:** "If they are not yet logged into Schoology when they are forwarded, they will be asked to log in before approving your application." For SSO-only districts this goes through the district IdP. — [Authentication](https://developers.schoology.com/api-documentation/authentication/)
- **Blocked API keys:** when a school blocks API key access, Schoology Plus loses "What-If Grades, Assignment Checkmarks, Quick Access, and Courses In Common". The FAQ advises contacting school or district admins. — [Schoology Plus FAQ](https://schoologypl.us/docs/faq/api) (published 2024-07-14)
- **Hidden max points:** "missing assignments for which the total points are unknown due to restrictions put in place by your teacher." — [SchoologyPlus grades.ts](https://github.com/aopell/SchoologyPlus/blob/master/src/scripts/pages/grades.ts)
- **Grade publishing:** `auto_publish_grades` default 1. When 0, grades are not visible until the teacher publishes them. — [Assignment](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- **Uncategorized items:** "Grading categories are required for grading. Assignments without categories will be ungraded." — [Grading Categories](https://developers.schoology.com/api-documentation/rest-api-v1/grading-categories/)

### Inferences
- Store the student's domain at connect time. Ask the student for their Schoology URL, as Raycast does, and use it for `/oauth/authorize`. Signed REST calls still go to `api.schoology.com`.
- Keep the iCal import as the fallback path for districts that block API keys or apps, or when the app is not yet App Center-approved.

### Gaps
- The exact error a student sees when the district has disabled third-party app authorization, as opposed to personal-key creation, was not found.
- Some districts may front Schoology through Clever/ClassLink. Whether that changes the OAuth 1.0a authorize UX was not researched.
