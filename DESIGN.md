# Tuan.dev Design System & Guidelines

This document outlines the design system for Tran Thanh Tuan's portfolio. All agents and developers modifying the UI must follow these rules.

## Core Identity
- **Voice**: First-person ("I", "you"), warm, playful, cheeky but confident.
- **Vibe**: Warm paper canvas, plum ink, clay-render accents.
- **Key Element**: 3D clay chibi avatar on a lit card, ringed by four floating desk props.

## Where values live
Two places, and only the first is the token layer:

- **`src/styles/tokens/`** — colors, spacing, radii, borders, motion, type. Everything in this document.
- **Scoped to a selector** — art direction that belongs to one element: the six `--avatar-*` framing vars on `body` (`base.css`, re-declared at the 720px breakpoint) that crop and place the two avatar renders, and `--rot` on each `.deco-*` prop. These are deliberately not global; a token layer is for values more than one element can want.

## Colors
Every value below is a token in `src/styles/tokens/colors.css`. Never write the hex.

- **Canvas**: Cream `--cream-200` `#f5f1e8` (page), `--cream-50` `#fffdf8` (raised surfaces, cards, buttons). Borders are warm sand `--sand-200` `#e7e0d2` (2px on cards).
- **Ink**: Deep plum `--plum-800` `#1f1b2e` (primary text, never pure black), muted `--plum-400` `#6a6480` (secondary text).
- **Accents**:
  - Pop: Pink `--pink-500` `#ff5d8f`
  - Success/Go: Green `--green-500` `#14b07c` (eyebrow labels, "Open to work" badge)
  - Highlight: Yellow `--yellow-500` `#ffc23a`
  - Gradient Mid: Lilac `--lilac-500` `#b06bff`
- **Headline Gradient**: `--grad-headline`, pink → lilac → green, clipped to text.
- **Translucent fills**: the sticky bar (`--bg-bar`) and the chips (`--bg-chip-go`, `--bg-chip-muted`) are the palette at low alpha. The alpha is the point — do not swap them for opaque colors.
- **Shadows**: Soft plum-tinted `rgba(31,27,46,...)` / `rgba(120,90,160,...)` (never harsh black).

## Typography
- **Display**: Space Grotesk (700) for hero roles, section titles. Tight tracking (`--ls-display` `-1.5px` on big displays).
- **Body**: Plus Jakarta Sans (400–800 variable) for running text.
- **Mono**: JetBrains Mono for tech labels, project tags, dates, code. Colored from the plum ramp, not the accents — the green is reserved for eyebrows and the status badge, so the mono stays quiet.
- **Sizes** come from the scale in `src/styles/tokens/typography.css` (`--fs-display` … `--fs-2xs`). No literal `font-size`.
- **No script face.** The handwritten signature is an image (`public/signature.png`), not type. Caveat was dropped in `595bb88` when fonts moved to self-hosting; do not reintroduce it. Three families only — every face must be a self-hosted `.woff2` in `public/fonts/` with an `@font-face` in `src/styles/tokens/fonts.css`.
- *Notes*: Use sentence case everywhere except tiny uppercase labels (the eyebrows and the "Open to work" badge). Section titles always end with a colored period (e.g., `About.`).

## Shapes & Elevation
- **Radii**: Always a token from `src/styles/tokens/effects.css`, never a literal — `--r-pill` 999px (controls/chips), `--r-lg` 18px (cards), `--r-xl` 22px (the connect panel), `--r-2xl` 32px (hero avatar card), `--r-sm` 8px (logo mark). `--r-md` 14px is a spare rung, declared but unused. `border-radius: 50%` stays literal: a circle is a shape, not a value off the scale.
- **Borders**: `--bw-chunky` 2px sand on cards, ghost buttons and social buttons; `--bw` 1px hairlines elsewhere.
- **Elevation**: Cards rest on `--shadow-sm`. Interactive cards hover-lift with a tiny −1° rotate (`--lift-card`) and the border tints to an accent. Cut-out PNGs use the `--drop-*` filters, not box-shadows — those follow the alpha channel.

## Imagery & Iconography
- **Tech icons**: Simple Icons, rendered bare on the page background with a soft `--drop-icon` shadow and a mono caption. No tile, no plate, no border. Hover pops the icon (`--lift-pop`).
- **Decoratives**: Four floating desk props — coffee, laptop, headphone, mouse — from Microsoft Fluent Emoji 3D (MIT), self-hosted in `public/decoratives/props/`. Anchored to the corners of the hero stage, each with its own `--rot` tilt.
- **Avatars**: The 3D clay chibi avatar, served from `public/avatar-3d.png` (referenced as `/avatar-3d.png?v=N` — bump `N` when the render changes, the file is cached hard). The hero card sits on `--grad-avatar-card`; the round connect avatar on `--grad-avatar-backdrop`. Both are warm cream radials lit from above.
- **Project cards** show a real screenshot, cropped to fill, over a per-project tint from `src/data/projects.ts`.
- **Emojis**: Yes, used deliberately and sparingly as punctuation (max 1 per line). Examples: 🚀 💬 👋 ☕ 🤖 👀 🧪 ⚡ 📍.

## Motion
- **Hover**: `--ease-snap`, `--dur-fast` (~0.16s). Buttons and nav links lift (`--lift-sm` / `--lift-md`); primary gets a shadow, ghost darkens its border; cards lift + rotate; tech icons pop.
- **Idle**: The desk props bob on a `--bob-cycle` 6s loop with `--ease-bob`, staggered by `animation-delay` so they never move in unison.
- There are **no entrance animations** — content is present on load. Adding scroll-in or fade-up motion is a design change, not a detail; raise it before building it.
- Always honor `prefers-reduced-motion`: `--dur-fast` and `--dur-base` collapse to `0s`, and the prop bob is switched off outright.

## Structure
- Single page, no routes: Hero → Tech Stack → Projects → Connect.
- Minimal Nav: Home / Project / Resume.
- Footer signature: "Crafted with caffeine & AI assistance by **Tuan Tran** · © 2026", above it the `signature.png` image.
