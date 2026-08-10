# 2026-07-29 — Phase 0: Vite + Supabase foundation

**Roadmap phase:** [Phase 0 — Foundation: Vite + Supabase project](../docs/roadmap.md#phase-0--foundation-vite--supabase-project)

## What changed
- Scaffolded `package.json` (manually, not via `npm create vite`, since the
  directory already had project files) with `dev` / `build` / `preview`
  scripts and `"type": "module"`
- Installed `vite` (devDependency) and `@supabase/supabase-js` (dependency)
- Added `vite.config.js` with a multi-page build (`index.html`,
  `login.html`, `signup.html`, `dashboard.html` as separate Rollup entries)
- Added `.gitignore` (`node_modules/`, `dist/`, `.env.local`)
- Added `.env.example` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
  placeholders
- Added `src/lib/supabaseClient.js` — creates the Supabase client from env
  vars, warns (doesn't throw) if they're missing so the app still runs
  before credentials exist
- Added `scripts/check-supabase.js` + `npm run check:supabase` — a
  throwaway connectivity check to run once real credentials are in
  `.env.local`
- Fixed both standing audit bugs: deleted the unused 28 MB
  `images/background.png`, fixed `index.html`'s `logo.png` → `Logo.png`
  casing mismatch
- **Moved `js/*.js` → `public/js/*.js`** and updated all four HTML files'
  `<script src="js/...">` to `<script src="/js/...">` (see "Problem hit"
  below — this wasn't in the original plan)
- Updated `Readme.md`: Setup section now describes `npm install` /
  `.env.local` / `npm run dev`; File Structure reflects `public/js`,
  `src/lib`, `docs/`, `.ai/`; Tech Stack now lists Vite and Supabase

## Why
Roadmap Phase 0 calls for getting the tooling in place — Supabase project
access and a Vite build — before any feature logic changes, plus clearing
the two bugs the audit already flagged while the codebase was open anyway.

## Problem hit: Vite dropped the classic `<script>` files silently
The four JS files (`utils.js`, `auth.js`, `landing.js`, `dashboard.js`) are
classic (non-module) scripts that rely on shared globals — `utils.js`
defines `Auth`, `showAlert`, `logout`, etc. at top level, and the other
files use them as globals. That pattern requires plain `<script src="...">`,
not `type="module"` (module scripts don't leak top-level bindings to other
scripts).

First build attempt: `npm run build` succeeded (exit 0) but silently
**omitted all four JS files from `dist/`** — no runtime functionality
would have worked once deployed, with no error, only a build-time warning
(`can't be bundled without type="module" attribute`). Caught by explicitly
listing `dist/` contents and diffing against what dev serves, rather than
trusting the "build succeeded" exit code alone.

Fix: moved the JS files into Vite's `public/` directory, which is copied
to the build output verbatim without going through the module bundler —
exactly the classic-script behavior the app needs. Re-verified: `dist/js/`
now contains all four files, `npm run preview` serves them at `/js/*.js`,
and both `npm run dev` and the built output were checked to return 200 for
every page, every JS file, and the CSS/logo assets.

This is a one-time relocation, not a design decision to keep forever —
Phase 1 (Supabase Auth) will start converting these to real ES modules,
at which point `public/js` goes away again.

## Files touched
- `package.json`, `package-lock.json` (new)
- `vite.config.js` (new)
- `.gitignore` (new)
- `.env.example` (new)
- `src/lib/supabaseClient.js` (new)
- `scripts/check-supabase.js` (new)
- `public/js/{utils,auth,landing,dashboard}.js` (moved from `js/`)
- `index.html`, `login.html`, `signup.html`, `dashboard.html` (script src
  paths updated; `index.html` logo casing fixed)
- `images/background.png` (deleted)
- `Readme.md` (Setup, File Structure, Tech Stack sections updated)

## Verified
- `npm run dev`: all 4 pages, `/js/*.js`, CSS, and the logo return 200
- `npm run build`: `dist/` contains all 4 HTML files, hashed CSS, hashed
  logo, and `dist/js/*.js` — no warnings on the second build
- `npm run preview`: served the build output and re-checked the same URLs

## Supabase connectivity — confirmed
Project created at `https://uqfpbusconhsxpvwwqjp.supabase.co`. `.env.local`
filled in with the URL and the **Publishable key** (Supabase's current name
for what used to be the `anon` `public` key — safe for the browser,
intended to be paired with RLS policies; not the **Secret key**, which maps
to the old `service_role` and must never ship client-side).

`npm run check:supabase` ran successfully:
```
Connected to Supabase project at https://uqfpbusconhsxpvwwqjp.supabase.co
```

Phase 0 is now fully done — all three "done when" conditions from the
roadmap are met (dev serves the site unchanged, build works, Supabase
connectivity confirmed).

## Notes for next time
- Phase 1 (Supabase Auth) is the next roadmap item. It will replace
  `public/js/auth.js`'s `localStorage` user table with real
  `supabase.auth` calls, and is a natural point to convert `auth.js` (and
  eventually the others) into real ES modules under `src/`, retiring
  `public/js` for anything but truly static scripts
- `dist/` is gitignored and was deleted after verification — not committed
