# Attendance Management System (מערכת נוכחות)

## Overview
A Hebrew RTL (right-to-left) attendance management single-page application (SPA) for תעשיידע. This is a pure static HTML/CSS/JavaScript app with no build step required.

## Project Structure
- `index.html` - Main application (10,000+ lines, all-in-one HTML/CSS/JS)
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline/PWA support
- `icons/` - PWA icons in various sizes
- `logo.png` - Application logo
- `screenshots/` - App screenshots (attendance, dashboard, records, reports)

## Architecture
- **Type**: Static HTML SPA (no backend)
- **Language**: Hebrew (RTL layout)
- **Fonts**: Heebo (Google Fonts)
- **Icons**: Font Awesome 6.4.0
- **Storage**: Browser localStorage (no external database)
- **PWA**: Yes (manifest + service worker)
- **Excel Export**: Via Azure Logic App workflow (external)

## Running the App
The app is served as a static site using `serve`:
```
npx --yes serve -s . -l 5000
```

## Deployment
Configured as a **static** deployment with `publicDir: "."`.
