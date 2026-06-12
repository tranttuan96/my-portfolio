# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal portfolio of Tran Thanh Tuan (full-stack dev, HCMC). Vite + TypeScript + vanilla Three.js (NO React). Bilingual EN/VI. Playful tone. Deployed on Vercel (auto-deploy from `main`).

**Active plan:** `plans/260612-1330-portfolio-revamp-3d-chibi-intro/` (gitignored, local only) — 4 phases:
1. Scaffold + port site ✅ (this codebase)
2. 3D asset pipeline → rigged `public/avatar.glb` (free tooling only: Hunyuan3D HF Space + Mixamo; fallback CC0 chibi)
3. 3D hero intro: fly-in with Doctor Strange ring + orbiting devices → land → wave → sit → type loop
4. Polish, QA, Lighthouse, final deploy

Design decisions live in `plans/reports/brainstorm-260612-portfolio-revamp-3d-chibi-intro.md` — read before re-litigating anything.

## Commands

```bash
npm run dev        # dev server
npm run build      # tsc --noEmit && vite build — MUST pass before commit
npm run preview    # serve dist/
```

## Architecture & Conventions

- **Multi-page Vite**: `index.html` (landing) + `cv.html` (CV). Entries: `src/main.ts`, `src/cv.ts`.
- **i18n**: `data-en` / `data-vi` attributes + `src/i18n/set-language.ts`. Dynamic renderers MUST emit these attributes and run BEFORE `initLanguage()` in entry files. Persisted via localStorage key `portfolio-lang`.
- **Content lives in `src/data/*`** (typed), renderers in `src/sections/*` build DOM via innerHTML — static typed data only, never external input. Escape with `src/utils/escape-html.ts`.
- **Three.js is lazy**: dynamic `import()` after first paint. Keep it that way — landing first paint must not block on 3D.
- Files under 200 lines; kebab-case file names; plain CSS in `src/styles/` (palette: dark purple bg, yellow/pink/green accents — see `:root` in `base.css`).
- CV page stays light: no Three.js, printable (`@media print` in `cv.css`).

## Constraints (user-confirmed, do not reverse)

- FREE tooling only for 3D assets — no paid Meshy/Tripo subscriptions
- No React / no framework migration
- Skills section stays REMOVED from landing (details live on /cv)
- Footer must keep "…caffeine & AI-assisted"
- Mobile / weak WebGL / `prefers-reduced-motion` → tilt-card image fallback, never broken WebGL
- LinkedIn button in Contact is `hidden` until user supplies URL

## Git

- Conventional commits, no AI references in messages
- `plans/`, `progress.md`, `.claude/` are gitignored (internal docs) — keep them out of the public repo
- Run `npm run build` before commit; do not commit with type errors
