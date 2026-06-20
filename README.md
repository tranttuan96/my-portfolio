# Tuan Tran — Portfolio

Personal portfolio of **Tran Thanh Tuan**, full-stack developer in Ho Chi Minh City.

**Live:** https://hituan.vercel.app

## What's inside

- 🎮 **Interactive 3D hero** — A clean, modern UI with an expressive 3D developer avatar and floating props.
- 🧪 **My projects** — A showcase of personal side projects, learning experiments, and public-facing work.
- 📱 **Fully responsive** — Graceful fallback for mobile and different screen sizes.

## Stack

Vite · HTML · plain CSS · TypeScript

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
```

## Structure

```
index.html            # Vite single-page entry
src/
├── main.ts           # entry point
├── sections/         # DOM renderers fed by data/
├── data/             # typed content (work, pet projects)
├── ui/               # cursor blob interaction
└── styles/           # split CSS modules (base, hero, sections)
public/               # avatar assets, cv pdf, images
```

## Credits

Designed & built by Tuan Tran.
