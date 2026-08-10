# 2026-07-29 — Keep-alive Action + graceful network error handling

**Roadmap phase:** none — follow-up from the "Failed to fetch" incident

## What changed

**1. `src/lib/supabaseClient.js` — `safeCall` wrapper**, applied to every
network call in `src/lib/auth.js`, `src/lib/notes.js`, `src/lib/goals.js`.

**2. `.github/workflows/keep-alive.yml`** — runs `scripts/check-supabase.js`
twice a week (Mon/Thu) via GitHub Actions. Doubles as monitoring: a failed
scheduled run triggers GitHub's automatic email to the repo owner, so a
real outage gets noticed without any extra alerting setup.

## The safeCall design changed mid-implementation — worth recording why

The original plan (as described to the user before building) was: wrap
each network call in try/catch so a thrown network error can't leave a
submit button frozen with no feedback. Built it, then wrote a throwaway
verification script (deleted after use) that deliberately pointed a
Supabase client at an unreachable host to prove the wrapper actually
catches something.

**The first version's test failed against my own code.** It turned out
`supabase.from(...)` (and, going by the original incident's evidence,
`auth.signUp` too) already catches fetch-level failures internally and
*resolves* with `{ error: { message: "TypeError: fetch failed" } }`
rather than throwing. The try/catch in the first `safeCall` was dead code
— every existing call site was already receiving the error gracefully
(no frozen button, that risk was overstated), but the raw technical
message was passing straight through to the user unchanged, which was the
actual problem worth fixing.

Fixed `safeCall` to also pattern-match the *resolved* error message
(`/fetch failed|failed to fetch|network ?error|ERR_NAME_NOT_RESOLVED/i`)
and replace it with a friendly one, keeping the try/catch only as a
defense-in-depth fallback for any call shape that might behave
differently (can't rule that out across every method/browser). Re-ran the
verification script against the same unreachable host: the raw
`"TypeError: fetch failed"` now correctly becomes
`"Connection problem — check your network and try again."`, and a real
successful call still passes through unchanged.

## Verified
- `npm run build` — clean before and after the `safeCall` fix
- Throwaway script (not committed) proved, against a guaranteed-unreachable
  host: the wrapped call never throws, returns `data: null`, and returns
  the friendly message — not the raw technical one. Also confirmed a real
  successful call to the live project still passes through with no error
- `.github/workflows/keep-alive.yml` YAML validated with a parser (not
  just eyeballed)
- **Not verified:** the Action hasn't actually run yet — it needs repo
  secrets added first (see below), then either wait for the Monday/Thursday
  schedule or trigger it manually

## Files touched
- `src/lib/supabaseClient.js` (added `safeCall`)
- `src/lib/auth.js`, `src/lib/notes.js`, `src/lib/goals.js` (wrapped every
  network call)
- `.github/workflows/keep-alive.yml` (new)

## Setup still needed (user action, not something I can do)
The workflow needs two repo secrets before it can run:
1. GitHub repo → **Settings → Secrets and variables → Actions → New
   repository secret**
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — same values
   already in `.env.local`
3. Once added, can trigger immediately via **Actions tab → Keep Supabase
   Alive → Run workflow** (the `workflow_dispatch` trigger) to confirm it
   works, instead of waiting for Monday/Thursday

## Notes for next time
- This only works once the repo is actually pushed to GitHub with these
  files committed — nothing has been committed this session unless asked
- If the project ever gets paused anyway (e.g. hits the 60-day
  scheduled-workflow-disable, or secrets get removed), `npm run
  check:supabase` locally is still the fastest way to confirm it, same as
  during the incident
