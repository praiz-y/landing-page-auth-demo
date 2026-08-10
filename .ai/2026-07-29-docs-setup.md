# 2026-07-29 — Documentation setup

**Roadmap phase:** none yet — this predates Phase 0

## What changed
- Created `docs/product-overview.md`: what Var Notes is, who it's for, core
  vs. differentiating features, and the target tech direction
- Created `docs/roadmap.md`: phase-by-phase build order from static demo to
  Supabase-backed solo product, plus two unscoped later phases (Team Orbit,
  Galaxy Boards/Mission Analytics)
- Created `.ai/README.md` establishing the convention for this folder

## Why
- Prior session produced a codebase audit (dead 28 MB image asset, a
  case-sensitive-host-breaking logo path bug, plaintext passwords in
  `localStorage`, a fully mocked dashboard) and a three-tier "where this
  could go" sketch
- This session decided to pursue tiers 2 and 3 of that sketch — a real
  Supabase-backed product — starting with documentation before any code
  changes

## Decisions made
- **Auth:** Supabase Auth (not a custom users table on Postgres) — least
  code to maintain, standard path for a first Supabase project
- **Frontend tooling:** introduce Vite + npm now, rather than staying
  no-build — the Supabase client needs proper module imports and env vars
  for keys, and the app is about to grow past what script tags handle well
- **Product scope:** solo-first. Notes/goals are owned by a single
  `user_id`, no sharing/membership tables yet. Team Orbit is explicitly
  deferred to a later phase so the initial data model stays simple

## Files touched
- `docs/product-overview.md` (new)
- `docs/roadmap.md` (new)
- `.ai/README.md` (new)
- `.ai/2026-07-29-docs-setup.md` (new, this file)

## Notes for next time
- No code has changed yet — `images/background.png` and the `logo.png`
  casing bug are still broken, fix planned for Phase 0 alongside the Vite
  migration
- Next actual work is Phase 0: create the Supabase project, scaffold Vite,
  migrate the existing four HTML pages in unchanged
