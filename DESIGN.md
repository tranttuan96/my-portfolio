# Tuan.dev Design System & Guidelines

This document outlines the design system for Tran Thanh Tuan's portfolio. All agents and developers modifying the UI must follow these rules.

## Core Identity
- **Voice**: First-person ("I", "you"), warm, playful, cheeky but confident.
- **Vibe**: Warm paper canvas, plum ink, clay-render accents.
- **Key Element**: 3D clay chibi avatar with four soft 3D decorative props.

## Colors
- **Canvas**: Cream `#f5f1e8` (page), `#fffdf8` (raised surfaces, cards). Borders are warm sand `#e7e0d2` (2px on cards).
- **Ink**: Deep plum `#1f1b2e` (primary text, never pure black), muted `#6a6480` (secondary text).
- **Accents**: 
  - Pop: Pink `#ff5d8f`
  - Success/Go: Green `#14b07c` (used for eyebrow labels, stack labels)
  - Highlight/Nodes: Yellow `#ffc23a`
  - Gradient Mid: Lilac `#b06bff`
- **Headline Gradient**: Pink → Lilac → Green, clipped to text.
- **Shadows**: Soft plum-tinted `rgba(31,27,46,...)` / `rgba(120,90,160,...)` (never harsh black).

## Typography
- **Display**: Space Grotesk (700) for hero roles, section titles. Tight tracking (`-1.5px` on big displays).
- **Body**: Plus Jakarta Sans (400/700/800) for running text.
- **Mono**: JetBrains Mono for tech-stack labels, dates, code. Always green when used as a stack line.
- **No script face.** The handwritten signature is an image (`public/signature.png`), not type. Caveat was dropped in `595bb88` when fonts moved to self-hosting; do not reintroduce it. Three families only — every face must be a self-hosted `.woff2` in `public/fonts/` with an `@font-face` in `src/styles/tokens/fonts.css`.
- *Notes*: Use sentence case everywhere except tiny uppercase eyebrow/badge labels. Section titles always end with a colored period (e.g., `About.`).

## Shapes & Elevation
- **Radii**: Always a token from `src/styles/tokens/effects.css`, never a literal — `--r-pill` 999px (controls/chips), `--r-lg` 18px (cards), `--r-xl` 22px (feature panels), `--r-2xl` 32px (hero avatar card), `--r-sm` 8px, `--r-md` 14px.
- **Borders**: 2px sand on cards and ghost buttons; 1px hairlines elsewhere.
- **Elevation**: Cards rest on barely-there shadow. Interactive cards add a hover lift with a tiny −1° rotate, and border tints to an accent.

## Imagery & Iconography
- **No pure flat icons**: Use the 3D clay styling. Tech tiles use Simple Icons rendered on soft clay tiles (rounded square with inner-highlight, colored inner-shadow, drop-shadowed logo).
- **Decoratives**: Use the soft 3D clay props (zigzag, torus, square, triangle).
- **Avatars**: The 3D clay chibi avatar, served from `public/avatar-3d.png` (referenced as `/avatar-3d.png`). Photo avatars use clay-gradient backdrops.
- **Emojis**: Yes, used deliberately and sparingly as punctuation (max 1 per line). Examples: 🚀 💬 👋 ☕ 🤖 👀 🧪 ⚡ 📍.

## Motion
- **Entrances**: Spring easing (`cubic-bezier(.2,.8,.2,1)`), ~1s, slide-up + fade.
- **Hover**: Snappy ~0.16s. Buttons & nav links lift (`translateY(-2/-3px)`). Primary gets shadow, ghost darkens border. Cards lift + rotate.
- **Idle**: Clay props gently bob (6s cycle).
- Always honor `prefers-reduced-motion`.

## Structure
- Single-page scroll: Hero → Tech Stack → Projects → Contact.
- Minimal Nav: Home / Project / Resume.
- Footer signature: "Crafted with caffeine & AI assistance by **Tuan Tran** · © 2026", above it the `signature.png` image.
