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

No tests in this repo. `npm run build` is the verify gate a human runs —
after every change, not just before commit. Vercel runs it on every push to
`main`, so both static checks gate the deploy, not just local work.

Agent sessions are gated twice more by `.claude/settings.json` hooks:
`check-tokens.py` after every Edit/Write (PostToolUse), and
`.claude/hooks/verify.sh` before the turn can end (Stop) — that one runs
check-no-external-assets, `tsc --noEmit` and check-tokens, but deliberately
not `vite build`. Neither hook replaces `npm run build`.

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
- No literal values — not in a stylesheet, not in `index.html`, not in
  `src/data/*`. Colors, spacing, radii, borders, motion and type come from
  `src/styles/tokens/*`; add a token before inlining a value. This includes the
  gradient strings in the data layer: `var()` resolves there too, because the
  value is assigned through the CSSOM. `check-tokens.py` runs inside
  `npm run build` and fails it on a literal color or an undefined token.
  See `.claude/rules/design.md` for the deliberate exceptions.
- Every interactive element must show a visible focus ring. One rule in
  `src/styles/base.css` hangs `--shadow-focus` on `:focus-visible` for every
  link, button and `[tabindex]` — do not narrow it to a class list, drop it
  with `outline: none`, or swap it for a color-only cue.
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