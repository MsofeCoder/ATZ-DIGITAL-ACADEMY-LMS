You are implementing the ATZ Digital Academy LMS. Full project context lives in three files
in this repo — read them before writing any code:

1. `CONTEXT.md` — overall scope, data model, brand system, and what's explicitly out of
   scope. This is the source of truth if anything below seems to conflict with it.
2. `PHASE_0_TICKETS.md` — Supabase schema + Next.js scaffold + auth, deployed empty-but-live.
3. `PHASE_1_TICKETS.md` — admin creates course/modules/materials, student sees them.
4. `PHASE_2_TICKETS.md` — quizzes + progress tracking.

(If any of these files aren't in the repo yet, stop and tell me — don't guess their contents.)

## How to work

**Bottom-up, one ticket at a time, in order.** Start at Phase 0, Ticket 0.1. Do not skip
ahead or combine tickets, even if it seems more efficient — each ticket's acceptance
criteria is the checkpoint for whether it's actually done, and I want to review real,
working output at each step, not a big batch at the end.

For each ticket:
1. Tell me which ticket you're starting and a one-line plan before writing code.
2. Implement it.
3. Run through that ticket's acceptance criteria yourself and report which items pass.
4. Stop and wait for my confirmation before moving to the next ticket. Don't proceed
   automatically even if everything looks green — I want to actually check it myself
   (especially anything involving auth, deployment, or the database schema).

If a ticket's acceptance criteria can't be verified without me doing something outside your
control (e.g. "confirm OAuth sign-in works on the deployed URL" — I have to click through
that myself), say so explicitly and tell me exactly what to check.

## Constraints (from CONTEXT.md — don't relitigate these, just follow them)

- **Zero budget.** Everything must run on Vercel's free tier and Supabase's free tier. If a
  ticket seems to need a paid feature, stop and flag it to me before implementing a
  workaround or a paid dependency — don't silently pick one.
- **Mobile-first, low-bandwidth tolerant.** Most students are on phones on Tanzanian mobile
  data. Keep bundles light, avoid unnecessary client-side JS, prefer server components where
  Next.js's App Router makes that easy.
- **Brand system is fixed** — use the exact hex values and tokens from `CONTEXT.md` Section 7
  as Tailwind theme colors, not ad-hoc hex codes in components.
- **Don't build anything marked out-of-scope** in `CONTEXT.md` Section 6, even if it seems
  like a natural addition while you're in that part of the code. Flag it to me as a future
  idea instead of building it now.

## When you're unsure

If a ticket is ambiguous or you're about to make an architectural decision that isn't
specified in the ticket or CONTEXT.md (e.g. exact library choices, folder layout details not
already specified, how to structure a component), make a reasonable choice, state the
assumption clearly in your update to me, and keep moving — don't stall on small decisions.
Only stop and ask if it's something that would be expensive to reverse later (schema
changes, auth provider choice, hosting decisions) — those should be confirmed with me first
if they're not already locked in by the ticket.

## Output style

Keep your progress updates short and concrete: what you did, what passed, what didn't, what
you need from me. No filler, no restating the ticket back to me before doing it — I've
already read it.

---

Start now: read `CONTEXT.md` and `PHASE_0_TICKETS.md`, then begin Ticket 0.1.
