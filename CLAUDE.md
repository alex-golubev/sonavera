# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm check            # Type check with svelte-check
pnpm lint             # Run Prettier and ESLint checks
pnpm format           # Auto-format code with Prettier
pnpm test:unit        # Run Vitest unit tests
pnpm test:e2e         # Run Playwright e2e tests
pnpm test             # Run both unit and e2e tests
```

## Architecture

- **Framework**: SvelteKit 2 with Svelte 5 (uses runes syntax like `$props()`, `$state()`)
- **Styling**: Tailwind CSS v4 with forms and typography plugins
- **Deployment**: Vercel via `@sveltejs/adapter-vercel`
- **Package Manager**: pnpm (engine-strict mode enabled)

## Testing

- **Unit/Component tests**: Vitest with `vitest-browser-svelte` running in Chromium
  - Co-located with source: `*.spec.ts` or `*.test.ts`
  - Component tests: `*.svelte.spec.ts`
- **E2E tests**: Playwright in `e2e/` directory

## Code Style

- Tabs for indentation, single quotes, no trailing commas, 100 char width
- Prettier plugins: svelte, tailwindcss (auto-sorts classes)
- ESLint with TypeScript and Svelte plugins
