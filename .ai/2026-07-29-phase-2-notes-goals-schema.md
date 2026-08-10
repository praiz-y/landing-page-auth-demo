# 2026-07-29 — Phase 2: Notes & goals schema + RLS

**Roadmap phase:** [Phase 2 — Data model: notes & goals](../docs/roadmap.md#phase-2--data-model-notes--goals)

## What changed
- Added `supabase/migrations/0001_notes_and_goals.sql`:
  - `notes (id, user_id, title, body, created_at, updated_at)` — `updated_at`
    kept accurate via a `before update` trigger, not client code
  - `goals (id, user_id, title, done, due_date, created_at)`
  - An index on `user_id` for each table
  - RLS enabled on both, one `for all` policy per table:
    `using (auth.uid() = user_id) with check (auth.uid() = user_id)`.
    A single equality-based policy covers select/insert/update/delete —
    denies anonymous requests (`auth.uid()` is null) and every other
    user's rows identically, not just "the accounts we happened to test"
- No sharing/membership tables — solo scope, as decided when this phase was planned

## Why
Roadmap Phase 2 calls for the real schema notes/goals will live in, scoped
to a single owner per row, before any CRUD UI gets built on top of it
(that's Phase 3).

## How it was applied
No direct database credentials were used — only the Publishable key exists
in `.env.local`, deliberately. The migration SQL was pasted into the
Supabase SQL Editor and run manually by the project owner. Same file lives
in `supabase/migrations/` in the repo as the source of truth, in case a
`supabase` CLI link happens later.

## Verified against the real project
Roadmap's stated bar was a literal two-account test ("a second test account
cannot read the first account's rows"), not just a logical read of the
policy. Since this project requires email confirmation and creating two
confirmed accounts can't be scripted without clicking email links, email
confirmation was **temporarily disabled** (project owner's call, done via
the dashboard, then re-enabled immediately after) so a real two-user test
could run end-to-end.

Ran a throwaway script (not committed, deleted after use) against
`peayogbaji+phase2a<ts>@gmail.com` / `...+phase2b<ts>@gmail.com`. All 10
checks passed:

- A can insert notes/goals owned by themselves
- A **cannot** insert a note with `user_id` set to B's id — RLS rejects the
  spoofed row at insert time (`new row violates row-level security policy`)
- B can insert their own note
- B's `select *` returns only B's own row, never A's
- B querying A's note by id directly gets zero rows
- B's attempted `update` and `delete` on A's note both affect zero rows
  (not an error — RLS just filters the row out of the operation's scope)
- A's note is confirmed unchanged after B's tampering attempts

Test rows were deleted by the script; the two auth users
(`phase2a...@gmail.com`, `phase2b...@gmail.com`) remain in
Authentication > Users — harmless, delete manually if wanted.

Email confirmation is back on as of the end of this session — confirmed by
the project owner.

## Files touched
- `supabase/migrations/0001_notes_and_goals.sql` (new)

## Notes for next time
- Phase 3 (notes/goals CRUD UI) is next. Every insert from the client will
  need to set `user_id` explicitly to the signed-in user's id — the DB
  won't infer it, and the RLS `with check` will reject anything else, which
  is exactly what Phase 2's spoofed-insert test confirmed
- `src/lib/auth.js`'s `getSession()` already gives `session.user.id`, which
  is what Phase 3's insert calls should use for `user_id`
- Consider a `src/lib/db.js` (or similar) in Phase 3 to hold the
  notes/goals query functions, rather than calling `supabase.from(...)`
  directly from UI code — not decided yet, worth revisiting when the CRUD
  screens are actually being built
