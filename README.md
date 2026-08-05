# Tuan Tran — Portfolio

Personal portfolio of **Tran Thanh Tuan**, full-stack developer in Ho Chi Minh City.

**Live:** https://hituan.vercel.app

## What's inside

- 👋 **Hero** — a 3D-rendered clay avatar on a lit card, ringed by four desk props that bob on a loop.
- 🧪 **My projects** — personal side projects, learning experiments, and public-facing work.
- 📱 **Fully responsive** — reflows to a single column at 860px, drops the cursor blob and nav links at 720px.

No framework, no runtime dependencies — `dependencies` in `package.json` is empty
and stays that way. Everything ships as hand-written DOM, plain CSS and one
TypeScript entry point.

## Stack

Vite · HTML · plain CSS · TypeScript

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # same-origin asset check → tsc --noEmit → vite build
npm run preview   # serve the production build
```

There are no tests. `npm run build` is the verify gate: it fails on any external
asset reference before it type-checks, so run it after every change.

## Structure

```
index.html            # Vite single-page entry — all section markup lives here
vercel.json           # strict CSP + immutable cache headers for /fonts, /icons
scripts/
└── check-no-external-assets.sh   # build gate: every asset must be same-origin
src/
├── main.ts           # entry point — imports styles, renders, wires interactions
├── sections/         # DOM renderers fed by data/
├── data/             # typed content (projects)
├── ui/               # cursor blob interaction
├── utils/            # HTML escaping for the innerHTML renderers
└── styles/
    ├── design.css    # import-only entry for the token layer
    ├── tokens/       # colors, spacing, effects, motion, typography, fonts
    └── base|hero|sections.css
public/               # avatar, desk props, tech icons, fonts, CV pdf
```

## Conventions

- All assets same-origin — put files in `public/`, never hotlink a CDN.
- No literal values in CSS: colors, spacing, radii, motion and type come from
  `src/styles/tokens/`.
- Files under 200 lines, kebab-case filenames, plain CSS only.

`DESIGN.md` is the full design system. `CLAUDE.md` carries the working rules for
agents and contributors.

## Credits

Designed & built by Tuan Tran. Desk props from Microsoft Fluent Emoji 3D (MIT);
tech logos from Simple Icons.
