# Tuan Tran — Portfolio

Personal portfolio of **Tran Thanh Tuan**, full-stack developer in Ho Chi Minh City.
Built with Three.js, caffeine & AI-assisted. 🤖☕

**Live:** _Vercel URL coming soon_

## What's inside

- 🎮 **Interactive 3D hero** — a chibi version of me makes a Doctor Strange-style entrance: flies in surrounded by orbiting work gear (MacBook, keyboard, mouse, coffee), lands, waves hello, then sits down and types. *(in progress — currently a tilt-card avatar)*
- 🌐 **Bilingual** — full English / Vietnamese toggle, persisted across pages
- 📄 **`/cv` page** — skills snapshot, experience timeline, printable, PDF download
- 🧪 **Pet projects** — fun ideas built for joy, zero meetings
- 📱 Graceful fallback for mobile / reduced-motion / weak WebGL

## Stack

Vite · TypeScript · Three.js (vanilla, no framework) · plain CSS

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
```

## Structure

```
index.html / cv.html      # Vite multi-page entries
src/
├── main.ts / cv.ts       # page entry points
├── scene/                # Three.js scenes (bg particles; 3D intro lands here)
├── sections/             # DOM renderers fed by data/
├── data/                 # typed content (work, pet projects)
├── i18n/                 # EN/VI toggle via data-en / data-vi attributes
├── ui/                   # typing effect, cursor blob, avatar tilt
└── styles/               # split CSS modules
public/                   # avatar, cv.pdf, (3D assets later)
```

## Credits

Designed & built by Tuan Tran with an AI-assisted workflow (Claude Code).
3D props (when they land): CC0 low-poly models — credits in `docs/asset-credits.md`.
