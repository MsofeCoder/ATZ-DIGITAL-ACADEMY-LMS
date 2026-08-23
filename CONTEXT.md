# CONTEXT.md — ATZ Digital Academy LMS (Phase 2)

**Project type:** Custom-built Learning Management System
**Stack:** Next.js + Vercel + Supabase
**Builder:** Adamu Mohamed Msofe, using OpenCode (+ DeepSeek) for implementation
**PM role:** Claude — breaks work into phases, reviews OpenCode output against this spec, keeps scope honest
**Status:** Planning / not blocking the current cohort — the 3-Week AI Masterclass starting 31 Aug 2026 runs on Google Meet + the registration/payment system already built (see "Relationship to existing systems" below). This LMS is for the cohort(s) after that, or for mid-course rollout if it's ready in time.

---

## 1. Why this exists

ATZ Digital Academy currently runs on Google Classroom (Phase 1 — already live) plus a
Google Forms + Apps Script registration/payment dashboard (already live, see Section 8).
That stack works but is capped: no real content-gating by payment, no native quiz/progress
engine, no branded student experience. This project is Phase 2 — a self-built LXP that
replaces Google Classroom as the actual course-delivery surface while keeping (or migrating)
the registration/payment layer.

**Design principle inherited from all ATZ work:** zero-budget-first. Every architectural
choice below defaults to what fits inside Vercel's and Supabase's free tiers unless a paid
step is explicitly agreed with Adamu first.

---

## 2. Scope for v1 (MVP) — locked by Adamu's answers

Only these three feature areas are in scope for the first build. Everything else (see
Section 6, "Explicitly out of scope for v1") is deferred, not forgotten.

1. **Video / live session links + recordings**
   - Each course "day" or module has a live session link (Google Meet, same pattern as the
     free training) and, after the fact, a recording link (YouTube unlisted / Google Drive).
2. **Downloadable materials**
   - Slides, PDFs, worksheets attached per module — matches Adamu's existing docx.js /
     python-pptx handout workflow; the LMS just needs a clean place to host/link them
     (Supabase Storage or Google Drive links, TBD in Phase 0 below).
3. **Quizzes / assessments + progress tracking**
   - Per-module quiz (multiple choice at minimum), stored score, and a visible
     "X of Y modules complete" progress indicator per student.

**Explicitly NOT in v1:** payment-gated content unlocking, discussion/community space,
certificate generation. These are real, wanted features — just Phase 3+ (Section 6).

---

## 3. Users & roles

| Role | Can do |
|---|---|
| **Admin** (Adamu) | Create/edit modules, upload materials, set quiz questions, view all student progress |
| **Student** | Log in, see their enrolled course, watch/access video links, download materials, take quizzes, see their own progress |

No public/anonymous access to course content — only registered, logged-in students.
(Marketing pages — the course landing page, registration CTA — can stay public/static.)

---

## 4. Data model (Supabase / Postgres) — v1

This is a starting sketch, not final DDL — refine during Phase 0 with OpenCode.

```
users              (Supabase Auth handles this natively)
  id, email, full_name, role ('admin' | 'student')

courses
  id, title, description, brand_theme (default 'atz-navy-gold')

modules
  id, course_id (fk), title, order_index,
  live_session_url, recording_url,
  release_date  -- so modules can unlock day-by-day, matching the "3-week" cadence

materials
  id, module_id (fk), title, file_url, file_type ('pdf'|'pptx'|'docx'|'other')

quizzes
  id, module_id (fk), title

quiz_questions
  id, quiz_id (fk), prompt, options (jsonb), correct_option_index

enrollments
  id, user_id (fk), course_id (fk), enrolled_at, status ('active'|'completed')

quiz_attempts
  id, user_id (fk), quiz_id (fk), score, completed_at

progress
  id, user_id (fk), module_id (fk), completed_at
  -- derived/simple: module marked complete once quiz_attempt exists OR admin marks manually
```

---

## 5. Relationship to existing systems (don't rebuild these)

Already live and working — the LMS should integrate with or migrate from these, not
duplicate them from scratch:

- **Registration + payment:** Google Form → Google Sheet → Apps Script dashboard
  (`01_Create_Registration_Form.gs`, `02_Dashboard_Code.gs`, `02_Dashboard_dashboard.html`).
  Source of truth for "who registered, who paid, how much" right now.
  **Open decision for Phase 0:** does v1 of the LMS read enrollment/payment status directly
  from this Google Sheet (via Sheets API), or do we migrate registrants into the
  `enrollments` Supabase table once verified paid? Simplest for v1: **manual** — Adamu
  marks someone Verified-Paid in the existing dashboard, then manually invites them
  (Supabase Auth magic-link) into the LMS. Automating that sync is a good Phase 2 task,
  not a v1 blocker.
- **Brand system:** navy `#0F1B36` / gold `#C9A227` (see full palette below) — same as the
  masterclass deck and the payment dashboard. Reuse, don't reinvent.
- **Content source:** existing `lessons per days/DayN/` folder convention and the
  `AGENTS.md` day-by-day generation workflow already produce slides/handouts. The LMS's
  "materials" and "modules" structure should map onto that same DayN convention so content
  Adamu already generates drops in with minimal reformatting.

---

## 6. Explicitly out of scope for v1 (Phase 3+ backlog)

- Payment-gated auto-unlock (content stays manually-gated via invite in v1)
- Discussion / community space
- Certificate generation
- Full Moodle-parity features (gradebook, SCORM, plugin ecosystem) — the "customize Moodle"
  path was considered and explicitly rejected in favor of custom-built, so no Moodle-specific
  features should be assumed or half-built
- Automated Sheets → Supabase sync (manual for v1, see Section 5)

---

## 7. Brand system (reuse exactly, don't reinterpret)

| Role | Hex |
|---|---|
| Navy (primary/dark) | `#0F1B36` |
| Gold (accent/CTA) | `#C9A227` |
| Gold dark | `#96760D` |
| Gold light | `#E9C862` |
| Slate/muted text | `#3E4A63` / `#7A869E` |
| Light bg | `#F0F3F9` / `#E2E6EF` |
| Success | `#2E7D4F` |
| Warning/Error | `#B84444` |

Tagline: "Locally rooted, globally coded." Manifesto: "Empowering Vision. Engineering the Future."

---

## 8. Non-functional requirements

- **Zero budget:** Vercel free tier (hobby plan) + Supabase free tier. Flag explicitly if any
  feature would require a paid tier before building it.
- **Mobile-first:** most students will access via phone browsers on Tanzanian mobile data —
  keep pages light, avoid heavy client bundles, lazy-load video embeds.
- **Low-bandwidth tolerant:** materials should be downloadable, not just streamable; don't
  assume fast/stable connections.

---

## 9. How Adamu + OpenCode + Claude will work together

- Adamu writes/runs code via **OpenCode** (+ DeepSeek as the coding model), following his
  existing `AGENTS.md`-style workflow.
- **Claude's role is PM**, not implementer: breaking this CONTEXT.md into phased tasks,
  reviewing OpenCode's output against the spec above, catching scope creep, and updating this
  document as decisions get made (e.g. once the Sheets-vs-Supabase enrollment question in
  Section 5 is resolved, this file gets updated, not left stale).
- **Suggested phase order** (to be broken into concrete tickets in a follow-up planning pass):
  1. **Phase 0:** Supabase schema + Next.js scaffold + auth (magic link), deployed to Vercel,
     empty but live end-to-end
  2. **Phase 1:** Admin can create a course/modules/materials; student can log in and see them
  3. **Phase 2:** Video/live links + recordings wired in; downloadable materials working
  4. **Phase 3:** Quizzes + progress tracking
  5. **Phase 4 (post-v1):** payment-gating automation, certificates, community space

---

## Open questions to resolve before Phase 0 starts
- [ ] Materials hosting: Supabase Storage vs. linking out to existing Google Drive files?
- [ ] Auth method: Supabase magic-link email, or Google OAuth (matches how students already
      interact with Google Forms/Meet)?
- [ ] Domain: does this live on a subdomain of atzacademy.com, or a separate Vercel domain
      for now?
