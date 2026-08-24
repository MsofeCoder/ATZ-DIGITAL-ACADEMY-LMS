# AGENTS.md — ATZ Digital Academy LMS

Context file for AI coding agents working in this repo. Read this first, then
`CONTEXT.md` for full project scope and decisions.

## Stack

- **Framework:** Next.js 16.3.2 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase Auth (Google OAuth via `@supabase/ssr` v0.12.4)
- **Database:** Supabase (Postgres) with Row Level Security
- **Deployment:** Vercel (hobby/free tier)
- **Zero-budget rule:** every choice must fit inside Vercel + Supabase free tiers

## Folder structure

```
src/
  app/
    layout.tsx          # Root layout — includes Header, Geist fonts, Tailwind
    page.tsx            # Home / landing page (public)
    globals.css         # Tailwind v4 imports + ATZ brand tokens (@theme inline)
    auth/
      signin/page.tsx   # "Continue with Google" button (client component)
      callback/route.ts # OAuth code exchange → session → redirect
      signout/route.ts  # Clears session cookies → redirect to /
    student/
      page.tsx          # Student dashboard (placeholder — Phase 1)
    admin/
      page.tsx          # Admin dashboard (placeholder — Phase 1)
    unauthorized/
      page.tsx          # 403 "Access Denied" page (navy/gold themed)
  components/
    header.tsx          # Session-aware Server Component (async, reads cookies)
  lib/
    supabase-client.ts  # Browser client — createBrowserClient
    supabase-server.ts  # Server components / route handlers — createServerClient (cookie-based)
    supabase-admin.ts   # Service role key — bypasses RLS, server-side only
  middleware.ts         # Route protection: /student/* (auth), /admin/* (auth + role=admin)
supabase/
  migrations/
    20260823000000_initial_schema.sql  # Full schema (9 tables, RLS, policies, triggers)
scripts/
  check-env.js          # Pre-build env var validator (runs before next build)
```

## Supabase schema (9 tables)

| Table | Key columns | Notes |
|---|---|---|
| **profiles** | `id` (fk→auth.users), `full_name`, `role` ('admin'\|'student') | Auto-created on signup via trigger |
| **courses** | `id`, `title`, `description`, `brand_theme` | |
| **modules** | `id`, `course_id` (fk→courses), `title`, `order_index`, `live_session_url`, `recording_url`, `release_date` | Ordered within course |
| **materials** | `id`, `module_id` (fk→modules), `title`, `file_url`, `file_type` ('pdf'\|'pptx'\|'docx'\|'other') | Google Drive links for v1 |
| **quizzes** | `id`, `module_id` (fk→modules), `title` | One quiz per module (unique index) |
| **quiz_questions** | `id`, `quiz_id` (fk→quizzes), `prompt`, `options` (jsonb), `correct_option_index` | |
| **enrollments** | `id`, `user_id` (fk→profiles), `course_id` (fk→courses), `status` ('active'\|'completed') | Unique on (user_id, course_id) |
| **quiz_attempts** | `id`, `user_id` (fk→profiles), `quiz_id` (fk→quizzes), `score` (numeric(5,2)), `completed_at` | |
| **progress** | `id`, `user_id` (fk→profiles), `module_id` (fk→modules), `completed_at` | Unique on (user_id, module_id) |

Full DDL + RLS policies: `supabase/migrations/20260823000000_initial_schema.sql`

## Auth architecture

- **Provider:** Google OAuth via Supabase Auth (not magic links)
- **Flow:** Sign-in page → `signInWithOAuth` → Google → `/auth/callback` (code exchange) → redirect to `/student` or `/admin`
- **Cookie-based sessions:** `@supabase/ssr` `createServerClient` with `getAll`/`setAll` cookie interface
- **Three client split:**
  - `supabase-client.ts` — browser (`createBrowserClient`)
  - `supabase-server.ts` — server components + route handlers (cookie-based `createServerClient`)
  - `supabase-admin.ts` — service role key, bypasses RLS (never exposed to client)
- **Middleware:** `src/middleware.ts` checks session + profile role on `/student/*` and `/admin/*`
  - Uses service role key for the `profiles` query (bypasses RLS)
  - Non-admin → rewrite to `/unauthorized`

## Role system

| Role | Access |
|---|---|
| **admin** | `/admin/*` (full dashboard), `/student/*` |
| **student** | `/student/*` only |

Admin role is manually assigned in Supabase (no self-serve path yet).

## Brand tokens (Tailwind v4 @theme inline)

Use these as Tailwind classes (e.g., `bg-atz-navy`, `text-atz-gold`). Never use raw hex in components.

| Token | Hex | Usage |
|---|---|---|
| `atz-navy` | `#0F1B36` | Primary dark / header background |
| `atz-gold` | `#C9A227` | Accent / CTA buttons |
| `atz-gold-dark` | `#96760D` | CTA hover state |
| `atz-gold-light` | `#E9C862` | Subtle accents / taglines |
| `atz-slate` | `#3E4A63` | Body text |
| `atz-muted` | `#7A869E` | Secondary / metadata text |
| `atz-bg` | `#F0F3F9` | Page background |
| `atz-bg-alt` | `#E2E6EF` | Card / border backgrounds |
| `atz-success` | `#2E7D4F` | Success states |
| `atz-warn` | `#B84444` | Error / warning states |

Defined in `src/app/globals.css` under `@theme inline`.

## Environment variables

Required in `.env.local` (and Vercel project settings):

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL (NOT the app's own domain) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS — never expose to client |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | App's own URL (e.g., `https://atz-digital-academy-lms.vercel.app`) |

`scripts/check-env.js` validates all four before `next build`.

## Build & run

```bash
npm run dev      # Local dev server (port 3000)
npm run build    # Env check + Next.js production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Known gotchas

1. **`NEXT_PUBLIC_*` env vars are baked at BUILD time.** Changing them in Vercel requires a
   redeploy to take effect. Set them scoped to **Production** specifically, not just
   Preview/Development.

2. **Cookie deletion requires `maxAge: 0` (or `expires` in the past).** Setting a cookie's
   value to empty string alone does NOT delete it — the browser keeps it as a live cookie
   with an empty value. Always use `response.cookies.set(name, '', { maxAge: 0, path: '/' })`.

3. **Auth sign-out links must use plain `<a>`, not `next/link` `<Link>`.** `<Link>` triggers
   client-side transitions that can serve stale cached UI from Next.js's Router Cache, even
   when the server correctly clears cookies/session. A plain `<a>` forces a full browser
   navigation, ensuring the fresh server-rendered state is used.

4. **Never trust "deferred" branch work.** If a codemod or experimental change was "deferred"
   but may have reached master, verify via `git log` before assuming it's inactive. The
   middleware-to-proxy codemod was believed deferred but had silently deleted `middleware.ts`
   on master.

5. **Supabase has TWO separate redirect config locations.** Auth > URL Configuration has both
   a "Site URL" (single fallback value) AND "Redirect URLs" (allowlist). Both must be
   correct for OAuth to work — fixing one without the other causes silent failures.

## Source of truth

`CONTEXT.md` is the authoritative project spec — scope, data model, brand system, decisions,
and phase roadmap. This file (`AGENTS.md`) is a quick-start reference; if anything here
contradicts `CONTEXT.md`, `CONTEXT.md` wins.
