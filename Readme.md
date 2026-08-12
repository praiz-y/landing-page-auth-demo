# Var Notes

Var Notes is a notes-and-goals workspace: capture an idea as a note, then
turn it into a trackable goal with one click. It's a real Supabase-backed
app — accounts, row-level-secured data, full-text search, live sync across
tabs, and a guest mode that lets anyone try it with zero signup.

**Live:** https://landingpagedemoz.netlify.app/
**Try it instantly, no account needed:** [Continue as Guest](https://landingpagedemoz.netlify.app/login.html?guest=1)

---

## Features

**Notes & Goals**
- Create, edit, and delete notes; create, complete, and delete goals
- Turn any note into a goal in one click (pre-fills the goal form from the
  note's title)
- Due dates on goals, with overdue goals flagged automatically

**Search & navigation**
- Full-text search over notes and goals, backed by Postgres (`tsvector` +
  GIN indexes) — not a client-side filter
- Command palette (`Ctrl`/`Cmd` + `K`) for jumping between pages, creating
  a note or goal, or logging out without touching the mouse

**Real-time**
- Changes sync live across open tabs and devices for the same account via
  Supabase Realtime — no refresh needed

**Accounts**
- Email/password auth with confirmation email
- **Guest mode**: try the full app instantly via Supabase anonymous auth,
  seeded with a few sample notes and goals — no signup required. A guest
  can upgrade to a permanent account at any time without losing their data
  (same account under the hood, just adds an email/password to it)

**Dashboard**
- Real, computed stats: total notes, goals completed, day streak, active
  goals — no hardcoded numbers
- Weekly notes chart and a recent-activity feed built from actual data

**Built to hold up under real use**
- Row Level Security on every table — a user's data is enforced private at
  the database level, not just hidden in the UI
- Friendly handling of network failures (a dropped connection shows a
  plain-language message instead of a raw error)
- Accessible by default: keyboard-navigable, screen-reader announcements
  for state changes (like arming a delete button), WCAG AA color contrast,
  touch targets sized for mobile
- A scheduled GitHub Action pings the Supabase project regularly, both to
  keep it from auto-pausing on the free tier and as a lightweight uptime
  check

---

## Tech stack

- HTML, CSS, vanilla JavaScript (ES modules) — no UI framework
- [Vite](https://vitejs.dev) for dev server and build (multi-page app)
- [Supabase](https://supabase.com) — Postgres, Auth (including anonymous
  sign-ins), Row Level Security, Realtime
- [Vitest](https://vitest.dev) + jsdom for unit tests

---

## Getting started

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and anon/publishable key (Supabase dashboard → Project Settings →
   API)
3. In the Supabase SQL Editor, run the migrations in `supabase/migrations/`
   **in order** (`0001` → `0002` → `0003`) — they create the `notes` and
   `goals` tables with RLS policies, add full-text search indexes, and
   enable Realtime on both tables
4. In the Supabase dashboard, under Authentication → Sign In / Providers,
   enable **"Allow anonymous sign-ins"** if you want guest mode to work
   (off by default; the rest of the app works without this)
5. `npm run dev` and open the printed local URL

### Other scripts

- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — serve the production build locally
- `npm test` — run the unit test suite
- `npm run check:supabase` — verify the app can reach your Supabase project

---

## How it works

- **Auth**: Supabase Auth handles signup/login/logout and session
  persistence. A guest session uses `supabase.auth.signInAnonymously()`,
  which creates a real (temporary) account — upgrading it later is just
  adding an email and password to that same account.
- **Data**: two tables, `notes` and `goals`, each scoped to `user_id` with
  a single RLS policy (`auth.uid() = user_id`) covering select/insert/
  update/delete. A user can never read or write another user's rows,
  enforced by Postgres regardless of what the client sends.
- **Search**: generated `tsvector` columns on both tables, indexed with
  GIN, queried via Postgres's `websearch` mode (plain natural-language
  input — quotes, `-exclude`, `or` all work).
- **Realtime**: both tables are added to the `supabase_realtime`
  publication; the client subscribes to each user's own rows and merges
  incoming changes into the on-screen list.

---

## Project structure

    index.html, login.html, signup.html   — landing + auth pages
    dashboard.html, notes.html, goals.html — the app itself (auth required)

    css/
      landing.css      shared tokens, landing page, nav
      auth.css         login/signup/guest forms
      dashboard.css     app shell, notes/goals, command palette, search

    src/
      utils.js              shared DOM helpers (alerts, validation, a11y)
      commandPalette.js      Ctrl/Cmd+K palette
      guestBanner.js          guest-mode banner + account upgrade form
      auth-forms.js, dashboard.js, notes.js, goals.js, landing.js
                              — one entry script per page

      lib/
        supabaseClient.js    Supabase client + network-error normalization
        auth.js               sign up/in/out, guest sessions, session guards
        notes.js, goals.js    CRUD + search queries
        search.js             search-term/debounce helpers
        realtime.js            Realtime subscriptions + merge logic
        demoSeed.js             sample content for new guest accounts
        stats.js               dashboard stat calculations

    supabase/migrations/     SQL migrations, applied via the Supabase SQL Editor
    scripts/check-supabase.js — connectivity check used by the keep-alive workflow
    .github/workflows/keep-alive.yml — scheduled Supabase ping / uptime check

---

## Testing

Unit tests cover the app's pure logic — search-term parsing, the realtime
merge reducer, command palette filtering, guest seed content, dashboard
stat calculations — using Vitest with a jsdom environment. Run with
`npm test`.

---

## License

ISC — free to use and modify.
