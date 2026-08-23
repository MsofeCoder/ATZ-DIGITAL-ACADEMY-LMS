# PHASE_2_TICKETS.md — ATZ Digital Academy LMS
## Phase 2: Quizzes + progress tracking

**Prerequisite:** Phase 1 fully done (see `PHASE_1_TICKETS.md` — Definition of Done).
**Reference:** `CONTEXT.md` Section 2 — quizzes/progress was one of the three features
Adamu explicitly locked in for v1, so this phase completes the original scope. After this,
the MVP is feature-complete per the original spec (payment-gating, certificates, and
community space remain Phase 3+, out of scope until explicitly greenlit).

**One default decision made here** (flag if you want it different): quizzes in v1 are
**learning checks, not gatekeepers** — there's no minimum passing score required to mark a
module complete. Completing a quiz (submitting any answers) marks the module done. If you
later want a pass threshold (e.g. "must score 70% to proceed"), that's a small follow-up
ticket once real quiz data shows whether it's actually needed.

---

## Ticket 2.1 — Admin: Quiz + question management
**Do:**
- Within a module (from Phase 1), admin can create one quiz (v1 = one quiz per module, not
  multiple)
- Add/edit/delete questions: `prompt`, `options` (2–6 choices), `correct_option_index`
- Uses the `quizzes` and `quiz_questions` tables from Phase 0's schema

**Acceptance criteria:**
- [ ] Admin can create a quiz for a module and add multiple-choice questions to it
- [ ] Admin can edit a question's options/correct answer after creation
- [ ] Admin can delete a question or the whole quiz
- [ ] A module with no quiz attached simply shows no quiz to students (not an error)

---

## Ticket 2.2 — Student: Take the quiz
**Do:**
- On an unlocked module's page (from Phase 1's release-date gating), if a quiz exists, show
  a "Take Quiz" button
- Quiz UI: one question at a time or all-on-one-page (your call, all-on-one-page is simpler
  for v1) with radio-button options, a Submit button at the end
- On submit: calculate score, save to `quiz_attempts` (`user_id`, `quiz_id`, `score`,
  `completed_at`)

**Acceptance criteria:**
- [ ] Student can answer all questions and submit
- [ ] Score is calculated correctly (correct answers / total questions)
- [ ] A `quiz_attempts` row is created with the right score
- [ ] Student sees their score immediately after submitting, plus which answers were
      right/wrong (learning value — don't just show a bare number)

---

## Ticket 2.3 — Progress tracking
**Do:**
- On successful quiz submission (Ticket 2.2), also create a `progress` row for that
  `user_id` + `module_id` if one doesn't already exist (per the "completion = attempted"
  default above)
- For modules with no quiz at all, add an admin-only "Mark complete for this student" manual
  override (rare case, but needed — not every module may get a quiz)

**Acceptance criteria:**
- [ ] Completing a quiz creates exactly one `progress` row (retaking doesn't duplicate it)
- [ ] Admin can manually mark a quiz-less module complete for a specific student

---

## Ticket 2.4 — Retakes
**Do:**
- Allow students to retake a quiz (multiple `quiz_attempts` rows are fine — that's what the
  table is for)
- When showing "your score," show the **best** score across attempts, not just the latest
- Retaking does not remove the existing `progress` row (already complete stays complete)

**Acceptance criteria:**
- [ ] Student can retake a quiz they've already completed
- [ ] Best score displays correctly across multiple attempts
- [ ] Progress status doesn't regress on a lower retake score

---

## Ticket 2.5 — Student: Progress view
**Do:**
- On the student's course page (from Phase 1's Ticket 1.5), add a visible progress
  indicator: "X of Y modules complete" (simple text or a progress bar — bar is nicer but text
  is fine for v1)
- Each module in the list shows a small complete/incomplete indicator

**Acceptance criteria:**
- [ ] Progress count is accurate and updates immediately after completing a module
- [ ] Locked (future release_date) modules are visually distinct from unlocked-but-incomplete
      ones — three visual states total: locked / unlocked-incomplete / complete

---

## Ticket 2.6 — Admin: Student progress overview
**Do:**
- Admin page listing enrolled students in a course with their progress
  ("Aron Franco — 3/8 modules complete") and, if useful, their quiz scores per module
- This is the admin's at-a-glance view of who's actually engaging with the course — useful
  for follow-up outreach to students falling behind

**Acceptance criteria:**
- [ ] Admin can see every enrolled student's completion count for the course
- [ ] Admin can drill into a student to see per-module scores

---

## Ticket 2.7 — Empty/error states + QA pass
**Do:**
- Modules with no quiz: no broken "Take Quiz" button, no error
- Quiz with zero questions (admin created it but hasn't added questions yet): student sees
  "quiz coming soon," not a blank/broken form
- Full manual walkthrough: as admin, add a quiz with 3 questions to a module; as a test
  student, take it, get a score, retake it, confirm progress updates correctly on both the
  student view and the admin overview

**Acceptance criteria:**
- [ ] No broken/blank states in any quiz or progress flow
- [ ] Full walkthrough above works with zero manual database edits outside the app UI
- [ ] Deployed Vercel URL behaves identically to local

---

## Definition of done for Phase 2
Admin can build real quizzes per module, students can take them and see their progress, and
admin has visibility into who's engaging with the course. At this point, the original v1
scope from `CONTEXT.md` Section 2 is fully built: video/live links ✅ (Phase 1), downloadable
materials ✅ (Phase 1), quizzes/progress ✅ (Phase 2).

**What's next is a decision point, not a default next phase** — come back and we'll talk
through whether to tackle payment-gating automation, certificates, or a community space next
(Section 6 of `CONTEXT.md`), based on what's actually mattered once real students have used
this through a live cohort.
