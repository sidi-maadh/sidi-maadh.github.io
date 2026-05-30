# Sidi Maadh — Portfolio

Multi-page personal portfolio with dark/light theme toggle and EN/FR language switch.

## Structure
```
portfolio/
├── index.html          # All 5 pages in one HTML (SPA navigation)
└── assets/
    ├── style.css       # All styles (themes, animations, responsive)
    ├── app.js          # Theme/lang toggles, routing, scroll reveal
    └── i18n.js         # EN/FR translation dictionary
```

## Local preview
Just open `index.html` in your browser. No build step needed.

## Deploy to GitHub Pages
1. Create a new public repo named `sidi-maadh.github.io`
2. Upload all files inside `portfolio/` to the repo root
3. Settings → Pages → Source: `main` branch, root folder → Save
4. Your portfolio is live at `https://sidi-maadh.github.io`

## Update the badge in your GitHub profile README
Once deployed, the Portfolio badge in your profile README will work correctly.

## Customization
- **Content**: edit text directly in `index.html` (each section has `data-i18n` keys)
- **Translations**: edit `assets/i18n.js`
- **Theme colors**: edit CSS variables in `assets/style.css` (top of file)
- **Projects**: edit the project cards in the `<section data-page="projects">` block

## Features
- Multi-page SPA navigation (hash-based routing)
- Light/Dark theme toggle (persisted in memory; for localStorage persistence in real deployment, see comments in app.js)
- EN/FR language toggle
- Smooth scroll reveal animations
- Responsive (mobile-friendly)
- No build step, no dependencies (vanilla HTML/CSS/JS)
