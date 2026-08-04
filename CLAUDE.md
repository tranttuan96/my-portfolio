# CLAUDE.md

## Project

Personal portfolio of Tran Thanh Tuan (full-stack dev, HCMC).
Vite + TypeScript, no framework. Site copy is English only — no i18n.
Deployed on Vercel (auto-deploy from `main`).

## Commands

```bash
npm run dev        # dev server
npm run build      # check-no-external-assets.sh && tsc --noEmit && vite build
npm run preview    # serve dist/
```

No tests in this repo. `npm run build` is the only verify gate —
run it after every change, not just before commit.

## Rules

- All assets same-origin: put files in `public/`, never hotlink a CDN.
  `scripts/check-no-external-assets.sh` fails the build on `src`/`srcset`/
  `url()`/`@import` pointing at http(s). Outbound `<a href>` links are fine.
- Content lives in `src/data/*` (typed); renderers in `src/sections/*` build
  DOM via innerHTML — static typed data only, never external input.
  Escape with `src/utils/escape-html.ts`.
- Files under 200 lines. kebab-case filenames. Plain CSS only.

## Do not reverse (user-confirmed)

- No React, no framework migration — `dependencies` stays empty.
- Three.js was deliberately removed. Do not reintroduce it.

## Git

- Conventional commits: `feat:` `fix:` `chore:` `refactor:` `style:` `docs:`
- No AI/assistant references in commit messages.
- `plans/`, `progress.md`, `.claude/settings.local.json` are gitignored — keep out of the public repo. `.claude/rules/` is versioned.

## Map

- `DESIGN.md` — full design system. UI rules auto-load from `.claude/rules/design.md`.