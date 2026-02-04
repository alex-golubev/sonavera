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

Run a single test file: `pnpm vitest run src/path/to/file.spec.ts`

## Architecture

- **Framework**: SvelteKit 2 with Svelte 5 (runes: `$props()`, `$state()`, `$effect()`)
- **Styling**: Tailwind CSS v4 with forms and typography plugins
- **Deployment**: Vercel via `@sveltejs/adapter-vercel`
- **Package Manager**: pnpm (engine-strict mode enabled)
- **State Management**: Custom `@effect-atom` Svelte 5 adapter in `src/lib/effect-atom/`

### @effect-atom Adapter

Bridges Effect ecosystem's atom model with Svelte 5 reactivity. Key design decisions:

- **`fromSubscribable(get, subscribe)`** (`subscribe.svelte.ts`) — single shared primitive that converts any get/subscribe pair into a Svelte 5 reactive getter via `$state` + `$effect`. Used by both atom hooks and AtomRef hooks.
- **Registry Context** (`context.ts`) — provides `Registry` via Svelte context API. `RegistryNotFoundError` is a `Data.TaggedError` from Effect.
- **Hooks** (`hooks.svelte.ts`) — `useAtomValue`, `useAtomSet`, `useAtom`, `useAtomMount`, `useAtomRefresh`. Setter supports async modes (`promise`/`promiseExit`) for Result atoms.
- **Result handling** (`result.svelte.ts`) — `useAtomResult` returns an object with reactive getters (`isLoading()`, `isSuccess()`, `value()`, etc.) for `Atom<Result<A, E>>`.
- **AtomRef** (`ref.svelte.ts`) — `useAtomRef`, `useAtomRefProp` for fine-grained mutable references.

All hooks return **getter functions** (not raw values) — call `count()` not `count` in templates.

## Testing

- **Vitest dual projects**: browser tests (`*.svelte.{test,spec}.ts` in Chromium via `vitest-browser-svelte`) and server tests (`*.{test,spec}.ts` in Node)
- **E2E**: Playwright in `e2e/` directory, runs against production build

## Code Style

- 2-space indentation, single quotes, no semicolons, no trailing commas, 120 char width
- Prettier plugins: svelte, tailwindcss (auto-sorts classes)
- ESLint flat config with TypeScript and Svelte plugins
- FP/declarative style: prefer arrow functions (`const fn = <A>(...) =>`), `pipe`/composition, namespace imports for Effect modules (`* as Result`), tagged errors over plain `Error`
