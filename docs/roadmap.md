# Roadmap

Build order for turning Var Notes from a static demo into a real,
Supabase-backed product. Phases are sequential — each one assumes the
previous is done. Scope is solo-first throughout; multi-user/Team Orbit is
deliberately last.

Every phase, once actually done, gets a report in `.ai/` describing what
changed. This file describes intent going in, not a log of what happened.

---

## Phase 0 — Foundation: Vite + Supabase project

Get the tooling in place before touching any feature logic.

- Create a Supabase project (Postgres + Auth), note the project URL and anon key
- Scaffold Vite in the repo, migrate the four existing HTML pages into it as
  multi-page entries (`index.html`, `login.html`, `signup.html`,
  `dashboard.html` stay as the actual pages Vite builds)
- Move existing CSS/JS into the Vite structure unchanged — this phase is
  plumbing, not a rewrite
- Add `.env.local` for `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and a
  `.env.example` committed instead
- Install `@supabase/supabase-js`, confirm a basic client can connect
- Fix the two standing bugs from the audit while the codebase is open
  anyway: unused `images/background.png` (delete), `logo.png` casing
  mismatch in `index.html`

**Done when:** `npm run dev` serves the existing site unchanged through
Vite, and a throwaway script can successfully ping the Supabase project.

## Phase 1 — Real auth (Supabase Auth)

Replace the `localStorage` user table with actual accounts.

- Enable email/password auth in Supabase
- Rewrite signup/login forms to call `supabase.auth.signUp` /
  `signInWithPassword` instead of the current `js/auth.js` logic
- Replace `sessionStorage` session handling with Supabase's session
  (`onAuthStateChange`), keeping the existing guard/redirect behavior
  (dashboard requires login, logged-in users bounce off login/signup)
- Logout calls `supabase.auth.signOut()`

**Done when:** a real signup creates a Supabase user, login/logout work
against Supabase sessions, and the old `vn_users` / `vn_user` storage keys
are gone.

## Phase 2 — Data model: notes & goals

Design and ship the actual schema, solo-scoped.

- Tables: `notes` (id, user_id, title, body, created_at, updated_at),
  `goals` (id, user_id, title, done, due_date, created_at)
- Row Level Security on both: a user can only select/insert/update/delete
  rows where `user_id = auth.uid()`
- No sharing/membership tables yet — ownership is a single `user_id` column,
  kept simple deliberately (see Phase 5 for why)

**Done when:** RLS policies are verified (a second test account cannot read
the first account's rows), and basic insert/select works from the Supabase
dashboard.

## Phase 3 — Notes & Goals CRUD

Build the UI surface that's currently missing entirely — there's no
create/edit/delete anywhere in the app today.

- A notes view: list, create, edit, delete
- A goals view: list, create, mark done, delete
- Client-side validation carries over from the existing form patterns
  (inline `.form-error`, same visual language)

**Done when:** a user can create a note or goal, refresh the page, and see
it persisted.

## Phase 4 — Real dashboard

Replace every hardcoded number in `dashboard.html` / `js/dashboard.js` with
a real query.

- Total notes, goals completed, day streak, ideas launched → computed from
  the `notes`/`goals` tables for the logged-in user
- Recent activity feed → most recent note/goal rows, ordered by
  `created_at`/`updated_at`
- Weekly chart → notes created per day over the last 7 days, replacing the
  hardcoded `data-h` pixel values

**Done when:** the dashboard for a fresh account shows all zeros, and the
numbers change as that account creates notes/goals.

## Phase 5 — Polish & deploy

The tier-1 audit items, done once there's a real app worth shipping.

- Favicon, meta description, OG image
- Lighthouse pass (the `--text: #888` on black body copy was flagged as
  borderline contrast in the audit — recheck it)
- Deploy the Vite build to Netlify or Vercel, with the Supabase env vars set
  there too
- Update the root `Readme.md` to describe the real app instead of the
  "no backend needed" demo pitch

**Done when:** the app is live at a real URL, backed by Supabase, and the
README matches reality.

---

## Later phase — Team Orbit / multi-user (not yet scoped)

Deliberately vague until the solo product is done — this is where the data
model changes shape, not just grows:

- Boards become shareable: needs a membership/permissions table, not just a
  `user_id` column
- Goal assignment, shared activity feeds
- Realtime updates (Supabase Realtime) for collaborative boards

## Later phase — Galaxy Boards & Mission Analytics (not yet scoped)

The visual canvas and real usage-driven analytics from the product overview.
Depends on Phase 3's data existing first — there's nothing to visualize or
chart until notes/goals are real.
