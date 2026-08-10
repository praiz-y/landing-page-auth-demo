# 2026-07-29 — Phase 4: Real dashboard

**Roadmap phase:** [Phase 4 — Real dashboard](../docs/roadmap.md#phase-4--real-dashboard)

## What changed
- **`src/lib/stats.js`** (new) — pure functions, no DOM or network, that
  turn raw `notes`/`goals` rows into everything the dashboard shows:
  `currentStreak`, `longestStreak`, `weeklyNoteCounts`, `notesThisWeek`,
  `notesToday`, `goalsDueToday`, `goalsOverdue`, `buildActivityFeed`
- **`src/dashboard.js`** rewritten to fetch real `notes`/`goals` via
  `listNotes()`/`listGoals()`, run them through `stats.js`, and render:
  - 4 stat cards: Total Notes, Goals Completed, Day Streak, Ideas Launched
    (= total goals — see "scope decisions" below)
  - Weekly chart: real notes-per-day for the last 7 days, today's bar
    highlighted, height scaled to the week's own max (not a fixed scale)
  - Recent Activity: real note-created/note-updated/goal-created events,
    merged and sorted by actual timestamp, with relative time labels
  - Quick Info: Tasks due today, Overdue, Notes today — all real
- **`dashboard.html`** — stat/chart/quick-info markup switched from
  hardcoded values to empty containers dashboard.js fills in; **dropped**
  "Productivity score" and "Active boards" rows entirely (see below)
- `formatRelativeTime` added to `src/utils.js`
- `.info-value.red` added to `css/dashboard.css` (Overdue turns red when
  non-zero — reuses the existing `.info-value.green` pattern)

## Scope decisions (no schema change)
The roadmap says "replace every hardcoded number with a real query," which
ran into two numbers with no honest basis in the Phase 2 schema:

- **"Personal best" streak** — needs a stored high-water-mark or a way to
  compute the longest historical run. Solved without new storage:
  `longestStreak()` scans all activity-day numbers and finds the longest
  consecutive run, not just the current one. `Day Streak`'s sub-label is
  now "Best: Nd", genuinely computed, not a placeholder claim
- **"Goals Completed" as a feed event** — the schema has no
  `completed_at` on goals, only `created_at`. A "Goal completed: X — 3 hr
  ago" feed entry would have to reuse `created_at`, which could show a
  badly wrong time for a goal completed long after it was created.
  Decided **not** to add a `completed_at` column for this (would mean
  another manual SQL-Editor round trip) and instead just don't put goal
  completion in the timestamped feed at all — completion only shows as
  the aggregate "Goals Completed" count and on the Goals page checkbox,
  neither of which needs a timestamp. Goals only ever appear in the feed
  as "Goal set: X" (their real `created_at`)
- **"Productivity score" and "Active boards"** — deleted from the Quick
  Info panel rather than faked. No formula exists for a productivity
  score, and boards (Galaxy Boards) don't exist yet as a feature. Replaced
  with three rows that ARE honestly computable from the current schema:
  Tasks due today, Overdue, Notes today

## Verified
**Unit tests (pure logic, no DB):** wrote a throwaway test script (not
committed) exercising `stats.js` directly with synthetic data — 29 checks,
all passing. Covered: empty-state zeros, streak continuing vs. breaking on
a gap day, `longestStreak` correctly finding a bigger historical run than
the current one, weekly chart bucketing (today vs. 6-days-ago vs. the
8th day correctly falling outside the window), due-today vs. overdue
date-string comparisons, and activity-feed recency ordering + the
edited-vs-created distinction. This mattered because the streak/day-number
math has a known timezone footgun (`new Date("YYYY-MM-DD")` parses as UTC
midnight, while `.getDate()` reads local time) — `stats.js` avoids it by
never round-tripping through a re-parsed date string, only ever computing
a self-consistent local-anchored day number.

**Integration against the real project:** signed in as the Phase 2 `...b`
test account, which had zero notes/goals left over — confirmed the exact
"fresh account = all zeros" state the roadmap's done-criteria asks for
(`currentStreak`, `longestStreak`, `notesThisWeek`, activity feed all
zero/empty on real — not synthetic — empty data). Then inserted 2 real
notes + 1 goal due today, re-fetched, and fed the real rows through the
real `stats.js` functions: counts incremented correctly, the new goal
showed up in `goalsDueToday`, both notes appeared in `notesToday` and the
weekly chart's today-bucket, the activity feed surfaced both new items at
the top, and `currentStreak` became ≥ 1. All 13 checks passed. Test rows
deleted, counts confirmed back to baseline.

**Build:** `npm run build` (65 modules) and `npm run preview` — all 6
pages still return 200.

## Files touched
- `src/lib/stats.js` (new)
- `src/dashboard.js` (rewritten)
- `src/utils.js` (added `formatRelativeTime`)
- `dashboard.html` (stat/chart/quick-info markup)
- `css/dashboard.css` (`.info-value.red`)

## Notes for next time
- Same caveat as Phase 3: the database layer and calculation logic are
  proven, but nobody has looked at the rendered dashboard in a browser yet.
  Worth a manual look — create a few notes/goals via the Phase 3 UI and
  watch the dashboard numbers actually move
- "Day Streak" and "Notes today" use the **browser's local timezone** at
  render time (via `new Date()`), not a fixed timezone. Fine for a
  single-user solo tool; would need revisiting if this ever supports
  multiple timezones meaningfully (e.g. a streak calculated server-side)
- If a real `completed_at` on goals ever becomes worth the schema change
  (e.g. for a "goals completed this week" delta, or a completion event in
  the feed), that's a clean, isolated follow-up migration — `stats.js` and
  `dashboard.js` were written so adding it wouldn't require restructuring
  either
