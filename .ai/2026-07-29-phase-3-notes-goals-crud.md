# 2026-07-29 — Phase 3: Notes & Goals CRUD

**Roadmap phase:** [Phase 3 — Notes & Goals CRUD](../docs/roadmap.md#phase-3--notes--goals-crud)

## What changed
- **`notes.html` + `src/notes.js`** — list, create, edit, delete. A single
  form doubles as create/edit: clicking "Edit" on a card populates the form
  and switches it to update mode (with a Cancel to bail out), matching the
  roadmap's stated scope of "list, create, edit, delete"
- **`goals.html` + `src/goals.js`** — list, create, mark done (checkbox),
  delete. Deliberately no edit-title flow — the roadmap only specified
  "list, create, mark done, delete" for goals, narrower than notes
- **`src/lib/notes.js`, `src/lib/goals.js`** — thin query modules
  (`listNotes`, `createNote`, `updateNote`, `deleteNote` /
  `listGoals`, `createGoal`, `toggleGoalDone`, `deleteGoal`) wrapping
  `supabase.from(...)` calls. Inserts set `user_id` explicitly from the
  session — required by the RLS `with check` policy from Phase 2, which
  rejects any insert where `user_id` doesn't match the caller's `auth.uid()`
- **`escapeHtml`, `setUserChrome`** added to `src/utils.js` — shared across
  dashboard/notes/goals now that three pages render user-supplied content
  and user chrome. `escapeHtml` matters for real security: note titles/body
  are user input rendered via `innerHTML`, so they're escaped before
  interpolation to prevent stored XSS (e.g. a note titled
  `<img src=x onerror=alert(1)>` renders as inert text, not a script)
- **Nav links** (Dashboard / Notes / Goals) added to all three
  authenticated pages, with the current page marked `.active`
- New CSS in `css/dashboard.css`: nav links, `.entry-form` (shared by both
  create forms), `.note-card`, `.goal-item` — reused existing tokens
  (`--card`, `--border`, `--green`, `--radius`, etc.), no new colors or
  fonts introduced
- `vite.config.js` — added `notes` and `goals` as build entries

## Why
This is the first roadmap phase where the product does something beyond
auth — Phase 2's schema existed with no way to use it. Phase 4 (real
dashboard) depends on real notes/goals existing, so this had to come first.

## Verified against the real project
**Build:** `npm run build` — 64 modules, all 6 pages (`index`, `login`,
`signup`, `dashboard`, `notes`, `goals`) produce output with no warnings.
`npm run preview` — all 6 return 200, and `notes.html`'s referenced
JS/CSS assets all resolve.

**Real CRUD, not just code review:** ran a throwaway script (not committed,
deleted after use) that signs in as one of the Phase 2 test accounts —
those were created while email confirmation was briefly off, so they don't
need re-confirmation and are still valid logins — then exercises the exact
queries `src/lib/notes.js` / `src/lib/goals.js` make. All 11 checks passed:

- Create/list/update/delete all work for notes
- The `updated_at` trigger from Phase 2 actually fires on update (confirmed
  the timestamp strictly increased) while `created_at` stays untouched
- A deleted note is confirmed gone on a fresh `select`, not just via the
  delete response
- Create/toggle-done/delete all work for goals, defaulting to `done: false`

RLS itself isn't re-tested here — Phase 2 already proved cross-user
isolation at the policy level, and nothing about the RLS policies changed
in this phase.

**Not verified:** the actual browser UI (form submission, edit-mode
toggling, the `hidden` empty-state swap, escaped rendering visually). The
DB-level round trip is real, but no browser automation was run against the
rendered pages — worth a manual click-through before considering this
fully done.

## Files touched
- `notes.html`, `goals.html` (new)
- `src/notes.js`, `src/goals.js` (new)
- `src/lib/notes.js`, `src/lib/goals.js` (new)
- `src/utils.js` (added `escapeHtml`, `setUserChrome`)
- `src/dashboard.js` (switched to `setUserChrome`, no behavior change)
- `dashboard.html` (added nav links)
- `css/dashboard.css` (nav links, entry form, note card, goal row styles)
- `vite.config.js` (added `notes`/`goals` build entries)

## Notes for next time
- **Please do a manual click-through** of `notes.html` and `goals.html` in
  a real browser before trusting this fully — create a note, edit it,
  delete it; add a goal, check it off, delete it. The DB layer is proven,
  the UI wiring is code-reviewed but not click-tested
- Phase 4 (real dashboard) is next: replace the hardcoded stats/activity
  feed/chart in `dashboard.html`/`src/dashboard.js` with real queries
  against `notes`/`goals` — `src/lib/notes.js` and `src/lib/goals.js` are
  ready to be extended with the aggregate queries that need (counts,
  recent rows, per-day counts for the week)
- The Phase 2 test accounts were reused for verification and are still
  sitting in Authentication > Users with no leftover rows (all test
  notes/goals were deleted by the script) — same cleanup note as before if
  a fully clean user list matters to you
