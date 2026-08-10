# Var Notes

Var Notes is a lightweight note-taking and productivity web app built with HTML, CSS, and JavaScript.  
It allows users to create accounts, log in, and access a simple dashboard for tracking notes and goals — all stored locally for demonstration purposes.

---

## Features

✔ Landing page with animated counters and responsive navigation  
✔ Authentication pages (Login & Signup)  
✔ Dashboard with stats cards, activity list, and mini chart  
✔ Session-based authentication (no backend required)  
✔ Scroll reveal animations  
✔ Mobile-friendly layout  
✔ Alert system for feedback messages

---

## File Structure
    /index.html
    /login.html
    /signup.html
    /dashboard.html

    /css
        landing.css
        auth.css
        dashboard.css

    /public/js
        utils.js
        landing.js
        auth.js
        dashboard.js

    /src/lib
        supabaseClient.js

    /docs        product overview + roadmap
    /.ai         log of changes made, by session

---

## How It Works

- Authentication uses `sessionStorage` to store user data  
- User accounts are stored in `localStorage` (demo purpose)  
- Dashboard requires login; unauthorized users are redirected  
- Utility functions handle alerts, form validation, and UI helpers  
- Mobile menu and scroll effects enhance usability

---

## Setup

The project is being migrated from a no-build static site to a
Supabase-backed app (see `docs/roadmap.md`). Current setup:

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL
   and anon key (Project Settings > API in the Supabase dashboard)
3. `npm run dev` and open the printed local URL
4. Create an account and explore the dashboard

Auth and the dashboard still run on demo data (`localStorage`) until later
roadmap phases land — see `docs/product-overview.md` and `docs/roadmap.md`
for where this is headed, and `.ai/` for a log of what's been done so far.

---

## Tech Stack

- HTML5, CSS3, JavaScript (ES6)
- [Vite](https://vitejs.dev) for the dev server and build
- [Supabase](https://supabase.com) (Postgres + Auth) — being wired in, see `docs/roadmap.md`

---

## Notes

- This project is front-end only  
- No database or backend is required  
- Data resets if browser storage is cleared

---

## License

Free to use and modify.