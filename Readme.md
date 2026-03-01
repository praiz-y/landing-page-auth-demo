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

    /js
        utils.js
        landing.js
        auth.js
        dashboard.js


---

## How It Works

- Authentication uses `sessionStorage` to store user data  
- User accounts are stored in `localStorage` (demo purpose)  
- Dashboard requires login; unauthorized users are redirected  
- Utility functions handle alerts, form validation, and UI helpers  
- Mobile menu and scroll effects enhance usability

---

## Setup

1. Open the project folder  
2. Run with a local server (optional but recommended)
3. Open `index.html` in a browser  
4. Create an account and explore the dashboard

---

## Tech Stack

- HTML5  
- CSS3  
- JavaScript (ES6)

---

## Notes

- This project is front-end only  
- No database or backend is required  
- Data resets if browser storage is cleared

---

## License

Free to use and modify.