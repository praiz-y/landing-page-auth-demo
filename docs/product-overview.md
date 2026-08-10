# Var Notes — Product Overview

## What it is

Var Notes is a notes-and-goals workspace for people turning loose ideas into
finished things. Capture a thought, organize it onto a board, turn it into a
goal with a deadline, and track progress — one flow instead of four separate
tools.

Today (as of this doc) it's a front-end-only demo: four static pages with a
working UI and fake data. The product work ahead is making it real — a
Supabase-backed app with actual accounts, actual notes, and a dashboard that
reflects what a user actually did.

**Initial scope is solo-first.** Every account owns its own notes, goals, and
boards. Sharing and teams are a deliberate later phase (see
[roadmap.md](roadmap.md)), not something the data model has to support on
day one.

## Who it's for

Individual creators and builders — the kind of person who has ideas faster
than they have structure for them. Not a team tool, not a project-management
suite. Closer to "a fast inbox that turns into a plan" than to Notion or
Jira.

## Core features

These are the things a solo user needs for the product to be real, not a
mockup:

- **Notes** — create, edit, delete. The basic unit of the app. Everything
  else is built on top of a note existing.
- **Goals** — turn a note into something trackable: a deadline, a priority,
  a done/not-done state.
- **Dashboard** — total notes, goals completed, day streak, ideas launched.
  Pulled from real rows in the database, not fixtures.
- **Recent activity** — a live feed of what the user actually did (created a
  note, completed a goal), not a hardcoded list.
- **Accounts** — signup/login via Supabase Auth, replacing the current
  `localStorage` user table.

## Interesting / differentiating features

These are what the landing page already promises copy-wise but the app
doesn't do yet. They're what would make Var Notes distinctive rather than
"another CRUD notes app" — planned for later phases once the solo core is
solid:

- **Galaxy Boards** — a visual canvas where notes are nodes you can arrange
  and connect to related ideas, instead of a flat list. The most
  differentiated feature in the product; worth building for real rather than
  leaving as landing-page copy.
- **Focus Mode** — a stripped-down single-task view: one note or goal at a
  time, everything else hidden, for deep work sessions.
- **Mission Analytics** — real charts and streaks generated from actual
  usage (the weekly bar chart on the dashboard is currently fake heights in
  the HTML).
- **Team Orbit** — shared boards with teammates, goal assignment, real-time
  progress. Requires multi-user data modeling (ownership → membership), so
  it's explicitly a later phase after the solo product works.

## Tech direction

- **Backend**: Supabase — Postgres for data, Supabase Auth for accounts,
  Row Level Security so each user can only read/write their own rows.
- **Frontend**: moving from plain `<script src>` tags to a Vite-built app,
  so the Supabase client can be imported as a proper module and secrets can
  live in environment variables instead of inline scripts. Existing HTML
  structure and CSS design system carry over — this is a foundation change,
  not a visual rewrite.
- **Deployment**: static hosting (Netlify/Vercel/GitHub Pages) once Vite
  build output replaces the raw HTML files served today.

See [roadmap.md](roadmap.md) for the build order, and `.ai/` for a running
log of what's actually been done.
