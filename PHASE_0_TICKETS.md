# PHASE_0_TICKETS.md — ATZ Digital Academy LMS
## Phase 0: Supabase schema + Next.js scaffold + auth, deployed empty-but-live

**Reference:** `CONTEXT.md` is the source of truth for scope, data model, and brand system.
Don't add features here — Phase 0 exists to prove the stack end-to-end, not to build course
features yet (that's Phase 1+).

### Decisions made to unblock Phase 0 (the 3 open questions from CONTEXT.md)
These are defaults chosen to keep zero-budget and match your existing workflow — flag in
review if any should change before Phase 1:

- **Materials hosting → Google Drive links.** Simplest, zero-cost, matches how you already
  share slides/PDFs. `materials.file_url` just stores a Drive share link for v1. Revisit
  Supabase Storage later only if Drive becomes a bottleneck.
- **Auth → Google OAuth via Supabase Auth.** Students already have Google accounts (they use
  them for Forms/Meet) — one less password to manage, and no email-deliverability risk that
  magic-links carry.
- **Domain → Vercel's default `*.vercel.app` domain for now.** Move to a subdomain of
  atzacademy.com only once the LMS is stable and you're ready to commit to it publicly.

---

## Ticket 0.1 — Repo & Next.js scaffold
**Do:**
- New repo, Next.js (App Router), TypeScript
- Tailwind CSS installed
- Folder structure:
  ```
  /app
    /(public)        -- landing/marketing pages, no auth required
    /(student)        -- student dashboard, requires auth + role=student
    /(admin)          -- admin dashboard, requires auth + role=admin
  /lib
    /supabase.ts      -- Supabase client setup
  /components
  ```
**Acceptance criteria:**
- [ ] `npm run dev` runs locally with no errors
- [ ] Basic placeholder page at `/` renders

---

## Ticket 0.2 — Supabase project + schema
**Do:**
- Create Supabase project (free tier)
- Write SQL migration implementing the tables from `CONTEXT.md` Section 4:
  `courses`, `modules`, `materials`, `quizzes`, `quiz_questions`, `enrollments`,
  `quiz_attempts`, `progress`
- Enable Row Level Security (RLS) on every table from the start — even if policies are
  permissive for now, don't ship with RLS off
- Add a `profiles` table (Supabase Auth's `auth.users` is not directly extendable) with
  `id (fk to auth.users)`, `full_name`, `role ('admin'|'student')`, defaulting new signups to
  `'student'`

**Acceptance criteria:**
- [ ] Migration runs clean on a fresh Supabase project
- [ ] All 8 tables + `profiles` exist with correct foreign keys
- [ ] RLS enabled on all tables (policies can be minimal/permissive for Phase 0 — tighten in
      Phase 1)

---

## Ticket 0.3 — Environment variables & config
**Do:**
- `.env.local.example` documenting required vars:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=      # server-side only, never exposed to client
  ```
- Confirm `.env.local` is gitignored

**Acceptance criteria:**
- [ ] App reads Supabase URL/keys from env, not hardcoded
- [ ] `.env.local` never committed (check `.gitignore`)

---

## Ticket 0.4 — Google OAuth via Supabase Auth
**Do:**
- Enable Google provider in Supabase Auth settings
- Register OAuth credentials in Google Cloud Console (same Google account used for the
  ATZ Digital Academy workspace, or a dedicated project — your call)
- Implement sign-in page: "Continue with Google" button
- On first sign-in, auto-create a `profiles` row with `role='student'` (admin role assigned
  manually by you in Supabase directly for now — no self-serve admin signup)

**Acceptance criteria:**
- [ ] Clicking "Continue with Google" completes a real OAuth round-trip and lands the user
      back in the app, logged in
- [ ] A `profiles` row exists after first login with correct `id` and default `role='student'`
- [ ] Logging out and back in doesn't duplicate the profile row

---

## Ticket 0.5 — Route protection by role
**Do:**
- Middleware or layout-level check: `/(student)/*` requires logged-in user;
  `/(admin)/*` requires logged-in user AND `role='admin'`
- Unauthenticated users hitting protected routes redirect to sign-in
- Authenticated non-admins hitting `/(admin)/*` get a clear "not authorized" page, not a
  silent failure

**Acceptance criteria:**
- [ ] Logged-out visit to `/student` or `/admin` redirects to sign-in
- [ ] Logged-in student visiting `/admin` sees a clear denial, not a crash or blank page
- [ ] Logged-in admin can reach `/admin`

---

## Ticket 0.6 — Brand theme
**Do:**
- Tailwind config extended with the ATZ palette from `CONTEXT.md` Section 7 as named colors
  (e.g. `atz-navy`, `atz-gold`, `atz-gold-dark`, `atz-gold-light`, `atz-slate`, `atz-muted`,
  `atz-bg`, `atz-success`, `atz-warn`)
- Root layout uses navy header / gold accents, matching the payment dashboard's look

**Acceptance criteria:**
- [ ] Colors are Tailwind theme tokens, not hardcoded hex scattered through components
- [ ] Placeholder pages visually match the ATZ brand (navy header, gold CTA button) —
      side-by-side comparison with `02_Dashboard_dashboard.html` should look like the same family

---

## Ticket 0.7 — Deploy to Vercel
**Do:**
- Connect repo to Vercel, deploy on push to `main`
- Set the same env vars from Ticket 0.3 in Vercel's project settings
- Confirm the deployed `*.vercel.app` URL works exactly like local dev: sign-in, route
  protection, all functioning

**Acceptance criteria:**
- [ ] Live Vercel URL loads
- [ ] Google OAuth sign-in works on the deployed URL (note: OAuth redirect URIs must include
      the Vercel domain, not just localhost — easy to forget)
- [ ] Admin/student route protection behaves identically to local

---

## Ticket 0.8 — AGENTS.md for this repo
**Do:**
- Add an `AGENTS.md` to the repo root, following your existing convention from the course
  content pipeline, so OpenCode has consistent context for future phases without re-reading
  this whole ticket list every session
- Should reference: this repo's folder structure, the Supabase schema, the brand tokens, and
  a pointer back to `CONTEXT.md` for full project scope

**Acceptance criteria:**
- [ ] `AGENTS.md` exists and a fresh OpenCode session can orient itself from it alone

---

## Definition of done for Phase 0
All 8 tickets checked off, deployed live, and you can: open the Vercel URL, sign in with
Google, land on an empty-but-functional student or admin view depending on your role, log out,
log back in — with nothing broken. No course content yet — that's Phase 1.

When this is done, come back and I'll break down Phase 1 (admin creates course/modules/
materials, student sees them) the same way.
