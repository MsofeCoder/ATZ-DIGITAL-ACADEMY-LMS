# MEMORY.md — ATZ Digital Academy LMS

Running log of features shipped and decisions made. Newest entries at the bottom.

## 2026-08-23
- Shipped: Ticket 0.1 — Next.js 16.3.2 scaffolded (App Router, TypeScript, Tailwind CSS v4), Supabase client installed, folder structure created (src/app/, src/app/student/, src/app/admin/, src/lib/supabase.ts, src/components/)
- Decided: Used /student and /admin as direct path segments instead of (student)/(admin) route groups, since Next.js doesn't allow two route groups both resolving to /. Same routing/role-protection behavior is preserved for Ticket 0.5.
- Shipped: Ticket 0.2 — SQL migration created with 9 tables (profiles, courses, modules, materials, quizzes, quiz_questions, enrollments, quiz_attempts, progress), RLS enabled on all tables, auto-profile trigger on auth.users signup, permissive policies for Phase 0.
- Decided: One quiz per module for v1 (enforced via unique index on quizzes.module_id). Scores stored as numeric(5,2) to support percentage display.
- Shipped: Ticket 0.3 — Environment variables & config. Created `.env.local.example` with required vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). Added `src/lib/supabase-server.ts` exporting `supabaseAdmin` client (service role key, server-side only). `.env.local` already gitignored via existing `.env*` rule.
- Shipped: Ticket 0.4 — Google OAuth via Supabase Auth. Installed `@supabase/ssr` for cookie-based auth. Created 3-file Supabase client split: `supabase-client.ts` (browser), `supabase-server.ts` (cookie-based server), `supabase-admin.ts` (service role, bypasses RLS). Built `/auth/signin` page with "Continue with Google" button, `/auth/callback` route handler (exchanges code for session), `/auth/signout` route handler (clears session). Added `NEXT_PUBLIC_SITE_URL` to `.env.local.example`.
- Decided: OAuth redirect flow — Google Cloud Console gets one redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`. Vercel domain goes in Supabase Dashboard > Auth > URL Configuration > Redirect URLs allowlist (not as a second Google redirect URI). Supabase itself handles the redirect back to the app.
- Decided: Supabase client split — replaced single `supabase.ts` with 3 files: `supabase-client.ts` (browser, `createBrowserClient`), `supabase-server.ts` (server components/route handlers, cookie-based `createServerClient`), `supabase-admin.ts` (service role key, bypasses RLS for admin ops).
- Confirmed: Ticket 0.4 live test passed — signed in with Google, landed on /student with active session, verified across multiple browser sessions. Required a Supabase `search_path` fix during setup.
- Shipped: Ticket 0.5 — Route protection by role. Created `src/middleware.ts` using Supabase SSR middleware client to check session + profile role on every request to `/student/*` and `/admin/*`. Unauthenticated users → redirect to `/auth/signin`. Non-admin users hitting `/admin/*` → `NextResponse.rewrite()` to serve `/unauthorized` page (URL stays `/admin/...`). Created `/unauthorized` page (navy background, gold accents, 403-style). All 3 acceptance criteria verified via automated HTTP tests.
- Decided: Middleware uses service role key (`SUPABASE_SERVICE_ROLE_KEY`) for the `profiles` query to bypass RLS. The anon-key client can't read other users' profiles due to RLS policy "Users can view own profile", but the middleware needs to check any user's role. Service role key bypasses RLS safely in the Edge runtime since it never reaches the client.
- Decided: Middleware approach over layout-level checks — catches requests before rendering, single point of enforcement for all protected routes. Next.js 16.3.2 shows deprecation warning (wants `proxy` convention) but middleware still works fine; flagged for future migration.
- Shipped: Ticket 0.6 — Brand theme. Defined 10 ATZ palette tokens in Tailwind v4 `@theme inline` block (atz-navy, atz-gold, atz-gold-dark, atz-gold-light, atz-slate, atz-muted, atz-bg, atz-bg-alt, atz-success, atz-warn). Updated root layout with navy gradient header and gold CTA button matching 02_Dashboard_dashboard.html. Replaced all hardcoded hex in signin and unauthorized pages with Tailwind theme tokens. Zero hardcoded hex in components.
- Fixed: OAuth redirectTo bug — was using `window.location.origin` instead of `NEXT_PUBLIC_SITE_URL`. Changed signInWithOAuth to use `process.env.NEXT_PUBLIC_SITE_URL`. Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local` (was missing entirely).
- Fixed: Vercel production builds missing env vars — `NEXT_PUBLIC_` vars are baked at build time. Added `scripts/check-env.js` that runs before `next build` and fails loudly if any required env var is missing. Updated `package.json` build script to `node scripts/check-env.js && next build`.
- Fixed: Header always showed "Sign In" regardless of auth state — was a static Server Component. Extracted to `src/components/header.tsx` as an async Server Component that reads session via `createClient()` from supabase-server.ts. Conditionally renders Sign In (logged out) or Dashboard link + email + Sign Out (logged in).
- Fixed: `src/middleware.ts` was accidentally deleted by the middleware-to-proxy codemod run on a scratch branch. Restored from git. Removed orphaned `src/proxy.ts`.
- Decided: Deferred middleware-to-proxy migration — codemod works (renames `middleware` to `proxy`, moves file), but no functional change. Next.js 16.3.2 still supports middleware. Revisit when Next.js drops middleware support.

## 2026-08-24
- Shipped: Ticket 0.7 — deployed to https://atz-digital-academy-lms.vercel.app. Fixed OAuth
  redirect chain (NEXT_PUBLIC_SUPABASE_URL was set to the app's own domain instead of the
  Supabase project URL; NEXT_PUBLIC_SITE_URL was missing/misconfigured; Supabase Auth Site
  URL and Redirect URLs were pointing to localhost/empty). Restored src/middleware.ts, which
  had been silently deleted by an earlier middleware-to-proxy codemod experiment believed
  deferred but had actually reached master. Added session-aware header.tsx Server Component.
  Fixed sign-out: cookie clearing needed explicit maxAge:0 (not just an empty value), and the
  Sign Out control needed to be a plain <a> tag instead of next/link's <Link> to force a full
  page navigation past Next.js's Router Cache, which was serving a stale signed-in header.
- Decided: middleware-to-proxy migration stays deferred. Going forward, verify any "deferred"
  branch work never lands on master via git log before trusting it's inactive. Manually
  promoted atzdigitalacademy@gmail.com to role='admin' in Supabase since no self-serve admin
  path exists yet (per Ticket 0.4's original decision).

## 2026-08-24
- Shipped: Ticket 0.8 — AGENTS.md created at repo root. Includes folder structure, Supabase
  schema (9 tables), ATZ brand Tailwind tokens, auth architecture, role system, environment
  variables, build commands, and a "Known gotchas" section documenting lessons from Ticket 0.7
  (NEXT_PUBLIC_* build-time baking, cookie deletion requiring maxAge:0, plain <a> for auth
  links, verifying "deferred" branch work, Supabase dual redirect config).

Phase 0 is now fully complete (Tickets 0.1-0.8 all shipped and verified). Next: Phase 1.

## 2026-08-24
- Shipped: Ticket 1.1 — Admin course management at /admin/courses (Server Component list +
  Server Actions for create/update/delete, single-page inline forms, brand-token styled).
- Decided: Discovered and fixed infinite RLS recursion bug from Phase 0's original migration
  — the "Admins can view all profiles" policy on the profiles table queried profiles from
  within its own policy, causing Postgres to recurse infinitely whenever any admin-gated
  table (courses, modules, etc.) checked role via profiles. Fixed via new migration
  20260824000000_fix_profiles_recursion.sql: added an is_admin() SECURITY DEFINER function
  (bypasses RLS, breaks the recursion) and replaced all 22 inline profiles subqueries across
  every table's admin policies with is_admin() calls.
- Shipped: Ticket 1.2 — Admin module management at /admin/courses/[id]/modules (nested
  route, up/down reorder via order_index swap, Server Actions).
- Decided: Reorder and edit actions needed explicit router.refresh() after the Server Action
  resolves — revalidatePath() alone marks the server cache stale but doesn't force the
  client's Router Cache to refetch, same root cause as the Ticket 0.7 sign-out bug. Noted a
  minor scroll-position UX quirk after reorder to revisit in Ticket 1.7.

## 2026-08-25
- Shipped: Ticket 1.3 — admin materials management (nested route under module, create/delete Server Actions, file_type badge display)
- Shipped: RLS recursion fix — replaced inline profiles subqueries in admin policies (courses, modules, materials, quizzes, quiz_questions, enrollments, quiz_attempts, progress) with a single is_admin() SECURITY DEFINER function, set search_path = public per the known Supabase gotcha
- Decided: Centralized admin-role RLS checks into is_admin() instead of repeating the subquery pattern per-table, to prevent this recursion bug recurring as new tables get policies in Phase 2

## 2026-08-25
- Shipped: Ticket 1.4 — admin manual enrollment (profiles list, enroll action, enrolled-status indicator per course)
- Decided: unique(user_id, course_id) constraint already existed in initial migration (20260823000000_initial_schema.sql:122), so no new migration needed — the DB-level duplicate guard was already in place from Phase 0

## 2026-08-25
- Fixed: Ticket 1.4 enrollment page showed no users — query selected `email` from `profiles` table which has no `email` column (PostgREST 400 error → null data → empty list). Fixed by removing `email` from profiles select and fetching emails from `auth.users` via `supabaseAdmin.auth.admin.listUsers()`, then merging client-side

## 2026-08-25
- Fixed: Ticket 1.4 enrollment status not updating in UI after successful enroll — replaced `useActionState`-based form handler with plain `async function` handler + `await` + `router.refresh()`, matching the proven Ticket 1.2 modules pattern (`module-card.tsx`). `useActionState`'s internal callback appears to not propagate `revalidatePath` + `router.refresh()` correctly on Vercel's serverless runtime. Added server-side `console.log` of enrollment IDs for debugging
