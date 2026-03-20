# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sonavera — a Next.js 16 application using React 19, TypeScript 5, and Tailwind CSS 4.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # Lint with Biome
pnpm format     # Auto-format with Biome (--write)
```

Package manager is **pnpm**.

## Architecture

- **Next.js App Router** with `src/app/` directory structure
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Tailwind CSS v4** via PostCSS plugin — styles in `globals.css` use CSS variables for light/dark theming
- **Path alias**: `~/*` maps to `./src/*` (configured in tsconfig.json)
- **Fonts**: Geist Sans/Mono loaded via `next/font/google`, exposed as CSS variables