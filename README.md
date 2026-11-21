# 📅 Event Tracker

A simple event tracker with live countdown, built with plain HTML, CSS and JS —
no bundlers, no dependencies.

## Features

- Add events with a category and a date
- Live countdown: «today», «in 5 days», «in 2 months», «2 days ago»
- Filters: All / Upcoming / Today / Past
- Sorting by date in both directions
- Stats bar and one-click cleanup of past events
- Dark and light themes (follows the system setting)
- Interface in Russian and English with a language switcher
- Responsive layout: from 320 px to wide desktops, landscape mode,
  safe-area insets for notched phones, `prefers-reduced-motion` support
- Data persistence via localStorage
- Basic accessibility (aria attributes, focus styles)

## Run locally

Open `index.html` in a browser — no build step required.
Or use a local server:

    python -m http.server 8000

Then open http://localhost:8000

## Deployment

The site is published to GitHub Pages automatically via GitHub Actions
(see `.github/workflows/ci.yml`). In the repository settings choose
Settings → Pages → Source: GitHub Actions.

## Project structure

    event-tracker/
    ├── index.html
    ├── css/style.css
    ├── js/app.js
    ├── .github/workflows/ci.yml
    ├── .gitignore
    └── README.md