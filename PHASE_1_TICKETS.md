# PHASE_1_TICKETS.md — ATZ Digital Academy LMS
## Phase 1: Admin creates course/modules/materials; student sees them

**Prerequisite:** Phase 0 fully done (see `PHASE_0_TICKETS.md` — Definition of Done).
**Reference:** `CONTEXT.md` Section 4 (data model) and Section 5 (relationship to existing
registration/payment system — enrollment is still a **manual** admin action in this phase).

Phase 1 makes the app actually usable for one real course end-to-end, using the schema built
in Phase 0. No quizzes/progress yet (Phase 3), no video *playback* polish beyond a plain link
(that's fine for v1 — Section 2 of `CONTEXT.md` only requires the link to work).

---

## Ticket 1.1 — Admin: Course management
**Do:**
- Admin page listing all courses (likely just one for now: "3-Week AI Masterclass")
- Create/edit course form: `title`, `description`
- Uses the `courses` table from Phase 0's schema

**Acceptance criteria:**
- [ ] Admin can create a course and see it in a list
- [ ] Admin can edit a course's title/description and changes persist
- [ ] Non-admins cannot reach this page (relies on Ticket 0.5 route protection)

---

## Ticket 1.2 — Admin: Module management
**Do:**
- Within a course, admin can add/edit/reorder modules
- Fields: `title`, `order_index`, `live_session_url`, `recording_url`, `release_date`
- Simple up/down reorder controls (drag-and-drop is a nice-to-have, not required for v1)

**Acceptance criteria:**
- [ ] Admin can add a module to a course with all fields
- [ ] Admin can reorder modules and `order_index` updates correctly
- [ ] Admin can edit an existing module (e.g. add the recording link after the live session
      has happened — this is the real workflow: live link goes in before the session,
      recording link gets added after)

---

## Ticket 1.3 — Admin: Materials management
**Do:**
- Within a module, admin can add/edit/delete materials
- Fields: `title`, `file_url` (Google Drive link — per Phase 0's decision), `file_type`
  (dropdown: pdf / pptx / docx / other)
- Simple list view per module, no upload UI needed since v1 links out to Drive

**Acceptance criteria:**
- [ ] Admin can attach a material to a module and it saves correctly
- [ ] Admin can delete a material
- [ ] Materials list shows a clear icon/label per `file_type`

---

## Ticket 1.4 — Admin: Manual enrollment
**Do:**
- Admin page listing all `profiles` (i.e., everyone who has ever signed in via Google OAuth)
- Admin can select a student and enroll them into a course (creates an `enrollments` row,
  `status='active'`)
- This is the manual bridge from "marked Verified-Paid in the existing payment dashboard" to
  "has access in the LMS" — per `CONTEXT.md` Section 5, automating this sync is Phase 2+, not
  now. Document this clearly in the UI itself (e.g. a note: "Enroll students here after
  confirming payment in the registration dashboard").

**Acceptance criteria:**
- [ ] Admin can see a list of all signed-up users (even if not yet enrolled in anything)
- [ ] Admin can enroll a selected user into a selected course
- [ ] Enrolling the same user in the same course twice doesn't create duplicate rows

---

## Ticket 1.5 — Student: Course view
**Do:**
- Student's `/student` dashboard shows their enrolled course(s) — likely just one
- If not enrolled in anything, show a clear "You're not enrolled yet — contact ATZ Digital
  Academy" message with your WhatsApp/email, not a blank/broken page
- Clicking into a course shows its module list

**Acceptance criteria:**
- [ ] Enrolled student sees their course on `/student`
- [ ] Non-enrolled logged-in student sees the clear "not enrolled" message, no errors
- [ ] Module list is ordered by `order_index`

---

## Ticket 1.6 — Student: Module detail + release-date gating
**Do:**
- Clicking a module shows: live session link (if `release_date` has passed or is today),
  recording link (if set), and its list of materials with download/view links
- Modules whose `release_date` is in the future show as locked/greyed out with the unlock
  date shown — this matches the day-by-day cadence of the 3-week course, so students can't
  binge Week 3 content on Day 1

**Acceptance criteria:**
- [ ] A module with a future `release_date` is visibly locked and doesn't expose its content
- [ ] A released module shows live link, recording link (if present), and materials
- [ ] Materials open/download correctly (Drive links working as expected)

---

## Ticket 1.7 — Empty/loading/error states + nav
**Do:**
- Basic top nav for both `/admin` and `/student` sections (matches brand theme from 0.6)
- Loading states while data fetches (skeleton or simple spinner — don't leave blank screens)
- Error states if a Supabase query fails (don't let the app crash silently)

**Acceptance criteria:**
- [ ] No blank/white-screen states anywhere in the flows built in 1.1–1.6
- [ ] Nav lets admin and student move between their relevant pages without using browser back

---

## Ticket 1.8 — End-to-end QA pass
**Do:**
- Full manual run-through as if you were a real student:
  1. Sign in with a test Google account
  2. Confirm "not enrolled" state shows correctly
  3. As admin (different account), create the course, add 2–3 modules with materials,
     enroll the test student
  4. Back as the student: confirm the course, correctly-gated modules, and materials all show

**Acceptance criteria:**
- [ ] The full walkthrough above works with zero manual database edits outside the app UI
- [ ] Deployed Vercel URL behaves identically to local

---

## Definition of done for Phase 1
You (as admin) can build out the real 3-week course structure — modules, live/recording
links, materials — entirely through the app, enroll a real student, and that student sees
exactly what they should, gated correctly by release date. Still no quizzes/progress
(Phase 2) — that's next.

When this is done, come back and I'll break down **Phase 2: Quizzes + progress tracking**
the same way.
