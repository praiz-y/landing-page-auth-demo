# 2026-07-29 — Phase 1: Supabase Auth

**Roadmap phase:** [Phase 1 — Real auth (Supabase Auth)](../docs/roadmap.md#phase-1--real-auth-supabase-auth)

## What changed
- Replaced the `localStorage` user table and `sessionStorage` session with
  real Supabase Auth (`supabase.auth.signUp` / `signInWithPassword` /
  `signOut` / `getSession`)
- Added `src/lib/auth.js` — the new auth service: `signUp`, `signIn`,
  `getSession`, `getUsername` (reads `user_metadata.username`, falls back
  to the email's local part), `guard` (redirects to login if no session),
  `guardRedirect` (bounces logged-in users off login/signup), `logout`
- **Converted the whole JS layer to real ES modules under `src/`**, one
  step ahead of where the Phase 0 report said this would happen:
  - `src/utils.js` — same UI helpers as before (alerts, mobile menu, scroll
    reveal, form-error helpers, password-toggle), now `export`ed instead of
    global; the old `Auth` object and `logout()` moved into `src/lib/auth.js`
  - `src/auth-forms.js` — the login/signup form handlers (renamed from
    `auth.js` to avoid colliding with `src/lib/auth.js`)
  - `src/dashboard.js`, `src/landing.js` — same behavior as before, now
    importing what they need instead of relying on global scripts
  - `public/js/` deleted — no longer needed now that real `type="module"`
    scripts handle bundling
- Updated all four HTML files to a single `<script type="module" src="/src/...">`
  tag each (previously two plain `<script src>` tags per page)

## Why
Classic global-scope scripts can't cleanly express "wait for an async
Supabase session check, then proceed" the way the old synchronous
`sessionStorage` read could — and Phase 0's report already flagged real
ES modules as the natural next step once real async auth logic showed up.
Doing the module conversion now, in the same phase as the auth rewrite,
avoided doing the same refactor twice.

## Verified against the real project
Ran a throwaway round-trip script (not committed, deleted after use) against
`https://uqfpbusconhsxpvwwqjp.supabase.co` using
`peayogbaji+phase1check<timestamp>@gmail.com` (a `+`-alias of the project
owner's own address, so nothing goes to a stranger):

- `signUp` succeeds, `user_metadata.username` round-trips correctly
- **This project requires email confirmation before login** — `signUp`
  returns `data.session: null` until the user clicks the confirmation
  email. Confirmed `auth-forms.js`'s handling of that exact case (shows
  "Check your email to confirm" instead of redirecting to the dashboard)
  is the branch that will actually run for real users
- `signInWithPassword` with a wrong password returns
  `error: "Invalid login credentials"` — confirmed the login form's error
  path triggers correctly

Also verified `npm run dev`, `npm run build`, and `npm run preview`: all
four pages load, the built JS is real bundled/hashed output (58 modules
transformed, Supabase client included), and every asset URL in the built
HTML returns 200.

**Note:** the test signup left one unconfirmed user
(`peayogbaji+phase1check<timestamp>@gmail.com`) in the project's
Authentication > Users table. Harmless, but delete it there if you want a
clean user list.

## Files touched
- `src/lib/auth.js` (new)
- `src/utils.js`, `src/auth-forms.js`, `src/dashboard.js`, `src/landing.js` (new — replace `public/js/*`)
- `public/js/` (deleted)
- `index.html`, `login.html`, `signup.html`, `dashboard.html` (script tags updated to single `type="module"` entries)

## Notes for next time
- **Email confirmation is ON for this project.** Anyone testing signup
  end-to-end needs to actually click the confirmation link before they can
  log in — the UI now says so, but worth knowing going in. If this is
  friction during dev, it can be turned off at Authentication > Sign In /
  Providers > Email > "Confirm email" in the Supabase dashboard; that's a
  product decision, not something to flip without asking
- Phase 2 (notes/goals schema + RLS) is next. `src/lib/auth.js`'s
  `getSession()` gives the `user.id` that every `notes`/`goals` row's
  `user_id` column and RLS policy will key off
- Left the unconfirmed test account in place rather than trying to delete
  it — deleting auth users requires the `service_role` key, which
  deliberately isn't in this project's `.env.local`
