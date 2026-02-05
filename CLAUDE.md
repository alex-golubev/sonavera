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
- **RPC**: `@effect/rpc` with NDJSON streaming over HTTP (`/api/rpc`)
- **Environment**: Requires `OPENAI_API_KEY` (see `.env.example`); use `$env/dynamic/private` for runtime secrets

### RPC Communication

Client-server communication uses `@effect/rpc` with a single POST endpoint:

- **Client** (`src/lib/rpc/client.ts`): `AppClient` tag built from `AtomRpc.Tag`, provides `.query()` for atoms
- **Protocol** (`src/lib/rpc/protocol.ts`): HTTP protocol via `RpcClient.layerProtocolHttp` + `FetchHttpClient`
- **Server** (`src/routes/api/rpc/+server.ts`): delegates to `RpcServer.toWebHandler`
- **Composition** (`src/lib/server/composition.ts`): merges handler layers via `Layer.mergeAll`

RPC groups defined per feature (e.g. `SttRpc`), then merged into `RootRpc` (`src/lib/rpc/rpc.ts`).

### @effect-atom Adapter

Bridges Effect ecosystem's atom model with Svelte 5 reactivity. Key design decisions:

- **`fromSubscribable(get, subscribe)`** (`subscribe.svelte.ts`) — single shared primitive that converts any get/subscribe pair into a Svelte 5 reactive getter via `$state` + `$effect`. Supports SSR via optional `ssrInitial` parameter.
- **Registry Context** (`context.ts`) — provides `Registry` via Svelte context API. `RegistryNotFoundError` is a `Data.TaggedError` from Effect.
- **Hooks** (`hooks.svelte.ts`) — `useAtomValue`, `useAtomSet`, `useAtom`, `useAtomMount`, `useAtomRefresh`. Setter supports async modes (`promise`/`promiseExit`) for Result atoms.
- **Result handling** (`result.svelte.ts`) — `useAtomResult` returns an object with reactive getters (`isLoading()`, `isSuccess()`, `value()`, etc.) for `Atom<Result<A, E>>`.
- **AtomRef** (`ref.svelte.ts`) — `useAtomRef`, `useAtomRefProp` for fine-grained mutable references.

All hooks return **getter functions** (not raw values) — call `count()` not `count` in templates.

### Streaming RPC (PullResult atoms)

For RPC methods with `stream: true`, the client returns a `Writable<PullResult<A, E>, void>` atom:

1. Create atom via `AppClient.query('Method', payload)`
2. Mount: `registry.mount(atom)` — returns unmount fn
3. Subscribe: `registry.subscribe(atom, cb)` — returns unsubscribe fn
4. Handle results with `Result.matchWithWaiting` (not `matchWithError`) to skip waiting transitions
5. After each success chunk, call `registry.set(atom, undefined)` to pull next — without this, the stream stalls
6. `NoSuchElementException` in error = end of stream, not a real error

### Feature Organization

Features live in `src/lib/features/<name>/` with co-located code:
- `store.ts` — atoms and business logic
- `rpc.ts` — RPC group definition (schemas, methods)
- `schema.ts` — shared types and tagged errors
- `server/` — server-side handlers
- `components/` — Svelte components

## Testing

- **Vitest dual projects**: browser tests (`*.svelte.{test,spec}.ts` in Chromium via `vitest-browser-svelte`) and server tests (`*.{test,spec}.ts` in Node)
- **E2E**: Playwright in `e2e/` directory, runs against production build
- **Assertions required**: `expect.requireAssertions` is enabled globally
- **Atom testing**: atoms without `keepAlive` or subscribers get GC'd via `queueMicrotask`. In tests without Svelte subscriptions, use `Registry.make({ scheduleTask: () => {} })` to disable node removal

## Code Style

- 2-space indentation, single quotes, no semicolons, no trailing commas, 120 char width
- Prettier plugins: svelte, tailwindcss (auto-sorts classes)
- ESLint flat config with TypeScript and Svelte plugins
- FP/declarative style: prefer arrow functions (`const fn = <A>(...) =>`), `pipe`/composition, namespace imports for Effect modules (`* as Result`), tagged errors over plain `Error`
