# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static multi-page website for Alliance Moinho, a Brazilian Jiu-Jitsu academy in Cuiabá, MT. All content is in Brazilian Portuguese.

## CSS Build

Tailwind CSS v4 is compiled via CLI. To regenerate `output.css` after editing CSS:

```bash
npx tailwindcss -i ./Css/style.css -o ./output.css --watch
```

Or a one-time build:

```bash
npx tailwindcss -i ./Css/style.css -o ./output.css
```

**Never hand-edit `output.css`** — it is generated from source files in `Css/`.

## Architecture

**Tech stack:** Plain HTML5 + Tailwind CSS v4 + Vanilla JavaScript. No JS framework, no bundler, no server-side rendering.

**Pages:** Each page is a standalone `.html` file at the root (`index.html`, `iniciantes.html`, `intermediarios.html`, `avancados.html`, `kids.html`, `nogi.html`, `aulasFemininas.html`, `professores.html`).

**CSS layers:**
- `Css/style.css` — design tokens (CSS custom properties for colors, spacing, typography) and global base styles. This is the Tailwind input file.
- `Css/Pages.css` — page-specific component styles.
- `Css/fonts.css` — Google Fonts imports (Roboto family).
- `output.css` — compiled Tailwind output; linked in every HTML page.

**Design tokens** are defined as CSS variables at `:root` in `style.css`. The brand palette is yellow (`#FEBC11`), black, and white. Always use these variables rather than hardcoded hex values.

**JavaScript** lives entirely in `Js/script.js` (~68 lines, no dependencies). It handles three behaviors:
1. Mobile menu toggle (hamburger open/close, outside-click to dismiss).
2. FAQ accordion — only one `<details>` open at a time.
3. Schedule tab switcher — `data-tab` attribute targets table sections.

**External resources loaded via CDN** (not installed locally):
- Font Awesome 6.5.0 — icons
- Google Fonts — Roboto

## Conventions

- Tailwind utility classes and custom CSS variables are used together — Tailwind handles layout/spacing utilities, while `style.css` variables own the brand tokens and typographic scale.
- HTML uses semantic elements (`<header>`, `<main>`, `<footer>`, `<section>`, `<details>/<summary>`) and ARIA attributes for accessibility.
- JavaScript uses `data-*` attributes to target DOM elements (e.g., `data-tab`); avoid adding logic keyed to CSS class names.
