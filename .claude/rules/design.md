---
paths:
  - "index.html"
  - "src/styles/**"
  - "src/sections/**"
  - "src/ui/**"
---

# UI / design rules

Full spec: `DESIGN.md`. Read it before any non-trivial visual change.
The essentials below are verified against the code and take precedence if
`DESIGN.md` disagrees.

## Never hardcode a value

All colors, spacing, radii, motion and type come from CSS custom properties in
`src/styles/tokens/` (`colors.css`, `spacing.css`, `effects.css`, `motion.css`,
`typography.css`, `fonts.css`). If a value you need does not exist, add a token
there rather than inlining a literal.

## Palette

Warm paper canvas, deep plum ink, clay accents. **The page is light, not dark.**

- Page background `--cream-200` `#f5f1e8`; raised surfaces `--cream-50` `#fffdf8`
- Hairline borders `--sand-200` `#e7e0d2` (2px on cards and ghost buttons)
- Primary text `--plum-800` `#1f1b2e` — never pure black. Muted text `--plum-400`
- Accents: `--pink-500` (pop), `--green-500` (eyebrow / stack labels),
  `--yellow-500` (highlight), `--lilac-500` (gradient mid)
- Shadows are plum-tinted, never black

## Type

Three self-hosted faces only, declared in `src/styles/tokens/fonts.css`:

- **Space Grotesk** — display, section titles, hero roles
- **Plus Jakarta Sans** — body
- **JetBrains Mono** — tech labels, dates, code (green when used as a stack line)

Do not add a fourth family. A new font means a new `.woff2` in `public/fonts/`
plus an `@font-face` — a Google Fonts link fails the build (see same-origin rule
in `CLAUDE.md`).

Sentence case everywhere except small uppercase eyebrow labels. Section titles
end with a colored period (`<span class="dot">.</span>`).

## Shape and motion

Radii always come from `src/styles/tokens/effects.css` — never write a literal:
`--r-pill` 999px (controls, chips), `--r-lg` 18px (cards), `--r-xl` 22px
(feature panels), `--r-2xl` 32px (hero avatar card), `--r-sm` 8px, `--r-md` 14px.

An undefined custom property fails silently: `var(--r-card)` does not error, it
collapses `border-radius` to 0. Confirm a token exists in `effects.css` before
using it.

- Entrances: `--ease-spring` `cubic-bezier(.2,.8,.2,1)`, ~1s, slide-up + fade
- Hover: `--ease-snap`, ~0.16s; buttons and nav links lift, cards lift + rotate
- Always honor `prefers-reduced-motion`

## Rendering

Section markup lives in `index.html`; `src/sections/*` builds DOM from typed data
in `src/data/*` via innerHTML. Static typed data only, never external input —
escape with `src/utils/escape-html.ts`.
