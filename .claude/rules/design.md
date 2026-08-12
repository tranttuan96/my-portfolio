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

Colors, spacing, radii, borders, motion and type all come from CSS custom
properties in `src/styles/tokens/` (`colors.css`, `spacing.css`, `effects.css`,
`motion.css`, `typography.css`, `fonts.css`). If a value you need does not
exist, add a token there rather than inlining a literal.

Custom properties live in exactly two places, and only the first is a token:

1. **`src/styles/tokens/`** — the global layer, everything above.
2. **Scoped to a selector** — per-element art direction that has no business
   being global: the six `--avatar-*` framing vars on `body` (`base.css`), and
   `--rot` on each `.deco-*` (`hero.css`). Redeclared inside a media query when
   the framing changes by breakpoint. Keep these where they are used.

Anything a scoped property overrides must be declared on an ancestor that
always matches — do not write a `var(--x, fallback)` whose fallback can never
be reached; it reads as optional when it is not.

The rule covers `padding` / `margin` / `gap`, every `font-*`, `letter-spacing`,
`line-height`, `border-radius`, `border-width`, colors, shadows, filters,
durations and easings. Three things stay literal, deliberately:

- **Intrinsic component sizes** — a 72px tech icon, the 200px avatar circle,
  the 124px card image slot, the 44px touch target. These are art direction,
  not rhythm.
- **Breakpoints** (`720px`, `860px`, `1200px`) and grid track minimums. `1200px`
  only reins in the hero prop overhang; layout still changes at 860 and 720.
- **`border-radius: 50%`** and percentage offsets — shapes, not scale values.

## Palette

Warm paper canvas, deep plum ink, clay accents. **The page is light, not dark.**

- Page background `--cream-200` `#f5f1e8`
- Raised surfaces — cards, ghost buttons, social buttons, the connect panel —
  `--cream-50` `#fffdf8` via `--bg-raised` / `--surface-card`. Not pure white.
- Hairline borders `--sand-200` `#e7e0d2` (`--bw-chunky` 2px on cards and
  ghost buttons, `--bw` 1px elsewhere)
- Primary text `--plum-800` `#1f1b2e` — never pure black. Muted text `--plum-400`
- Accents: `--pink-500` (pop), `--green-500` (eyebrows, status badge),
  `--yellow-500` (highlight), `--lilac-500` (gradient mid)
- Translucent fills (`--bg-bar`, `--bg-chip-go`, `--bg-chip-muted`) are literal
  `rgba()` inside the token file because the alpha is load-bearing
- Shadows are plum-tinted, never black

## Type

Three self-hosted faces only, declared in `src/styles/tokens/fonts.css`:

- **Space Grotesk** — display, section titles, hero roles
- **Plus Jakarta Sans** — body
- **JetBrains Mono** — tech labels, project tags, dates, code. Colored from the
  plum ramp — the green is spoken for by eyebrows and the status badge.

Do not add a fourth family. A new font means a new `.woff2` in `public/fonts/`
plus an `@font-face` — a Google Fonts link fails the build (see same-origin rule
in `CLAUDE.md`).

Sizes come from the scale (`--fs-display` … `--fs-2xs`). Sentence case
everywhere except the small uppercase eyebrows and the "Open to work" badge.
Section titles end with a colored period (`<span class="dot">.</span>`).

## Shape and motion

Radii always come from `src/styles/tokens/effects.css` — never write a literal:
`--r-pill` 999px (controls, chips), `--r-lg` 18px (cards), `--r-xl` 22px
(connect panel), `--r-2xl` 32px (hero avatar card), `--r-sm` 8px (logo mark).
`--r-md` 14px is declared but unused — a rung on the ladder, not a value in play.

An undefined custom property fails silently. It does not error; the whole
declaration is dropped and the property falls back to its initial value, so a
mistyped radius collapses to 0 with nothing in the console. This has happened
here: the project cards shipped with an invented radius token until `ee7d3f2`
caught it. Confirm the token exists in `effects.css` before using it, and run
`python3 .claude/skills/audit-docs/check-tokens.py` — it exits non-zero on any
undefined reference.

- Hover: `--ease-snap` at `--dur-fast`; buttons and nav links lift, cards lift +
  rotate (`--lift-card`), tech icons pop (`--lift-pop`)
- Idle: the hero desk props bob on `--bob-cycle` with `--ease-bob`, staggered
- No entrance animations. Content is present on load — adding scroll-in or
  fade-up motion is a design decision, so raise it rather than building it
- Always honor `prefers-reduced-motion`

## Focus

Everything focusable carries a visible ring. `base.css` declares it once against
`a:focus-visible`, `button:focus-visible` and `[tabindex]:focus-visible` — not a
class list. Do not narrow that selector to specific classes; the point is that a
control added later inherits the ring instead of shipping without one.

- The ring is `--shadow-focus` (`effects.css`): a solid `--lilac-600` core plus a
  soft halo. A box-shadow rather than an outline, so it follows each control's
  radius. `--r-sm` is added on `:focus-visible` for the two links with no shape
  of their own, `.logo a` and `.pet-card .plink`.
- Keep the core at `--bw-chunky` or thicker and at 3:1 or better against
  `--cream-200`. The halo alone is 1.6:1 — it is the palette, not the indicator.
- The block sits **after** the hover rules in `base.css` deliberately. Those set
  `box-shadow` on the same elements and win on a specificity tie by source order.
  `.btn-primary:hover` outranks the shared rule outright, so the ring is restated
  at `.btn-primary:hover:focus-visible`: a focused button that happens to sit
  under the pointer must not lose it.
- `:focus-visible`, never `:focus`. The UA outline is replaced by a transparent
  one at `--bw-chunky` — invisible normally, repainted as a real ring in
  forced-colors mode, which drops box-shadows. Never write a bare
  `outline: none` without putting an equivalent indicator back, and never let a
  color or weight change alone stand in for the ring.

## Rendering

Section markup lives in `index.html`; `src/sections/*` builds DOM from typed data
in `src/data/*` via innerHTML. Static typed data only, never external input —
escape with `src/utils/escape-html.ts`.

`vercel.json` sets a strict CSP (`style-src 'self'`, `script-src 'self'`). Two
consequences worth knowing before you touch the renderer: a `style="..."`
attribute parsed out of innerHTML is blocked, so per-item styling is written
through the CSSOM instead (see `render-projects.ts`); and every font, icon and
image must be same-origin.
