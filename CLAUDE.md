# CLAUDE.md

## Project

Personal portfolio of Tran Thanh Tuan (full-stack dev, HCMC).
Vite + TypeScript, no framework. Site copy is English only — no i18n.
One landing page, no routes. Deployed on Vercel (auto-deploy from `main`).

## Commands

```bash
npm run dev        # dev server
npm run build      # check-no-external-assets.sh && check-tokens.py --quiet
                   #   && tsc --noEmit && vite build
npm run preview    # serve dist/
```

No tests in this repo. `npm run build` is the only verify gate —
run it after every change, not just before commit. Vercel runs it on every push
to `main`, so both static checks gate the deploy, not just local work.

## Rules

- All assets same-origin: put files in `public/`, never hotlink a CDN.
  `scripts/check-no-external-assets.sh` fails the build on `src`/`srcset`/
  `url()`/`@import` pointing at http(s). Outbound `<a href>` links are fine.
- `vercel.json` sets a strict CSP (`default-src 'self'`, no `unsafe-inline`).
  A `style="..."` attribute parsed out of innerHTML is blocked at runtime —
  write per-element styling through the CSSOM instead.
- Content lives in `src/data/*` (typed); renderers in `src/sections/*` build
  DOM via innerHTML — static typed data only, never external input.
  Escape with `src/utils/escape-html.ts`.
- No literal values in CSS. Colors, spacing, radii, borders, motion and type
  come from `src/styles/tokens/*`; add a token before inlining a value.
  See `.claude/rules/design.md` for the exceptions.
- Never write a color outside `src/styles/tokens/`. No `#hex`, `rgb()` or
  `hsl()` in a stylesheet, in `src/data/*`, or in `index.html` — name it in
  `tokens/colors.css` and reference it with `var()`, which resolves even in a
  gradient string assigned through the CSSOM.
  `check-tokens.py` runs inside `npm run build` and fails it on any of these.
- Files under 200 lines. kebab-case filenames. Plain CSS only.

## Do not reverse (user-confirmed)

- No React, no framework migration — `dependencies` stays empty.
- Three.js was deliberately removed. Do not reintroduce it.

## Git

- Conventional commits: `feat:` `fix:` `chore:` `refactor:` `style:` `docs:`
- No AI/assistant references in commit messages.
- `plans/`, `progress.md`, `.claude/settings.local.json` are gitignored — keep out of the public repo. `.claude/rules/` and `.claude/skills/` are versioned.

## Map

- `DESIGN.md` — full design system. UI rules auto-load from `.claude/rules/design.md`.