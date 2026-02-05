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

### Strict Functional Programming

This project follows a strict functional programming paradigm. **Every piece of code** must adhere to these rules without exception.

#### Prohibited (NEVER use)

- `async/await` — use `Effect.gen` / `Effect.promise` / `Effect.tryPromise` instead
- `try/catch` — use `Effect.try` / `Effect.catchTag` / `Effect.catchAll` instead
- `if/else` — use `Match.tag`, `Match.when`, `Option.match`, `Result.match*`, ternary expressions, or pattern matching via Effect
- `for/while/do` loops — use `Array.map`, `Array.filter`, `Array.reduce`, `Effect.forEach`, `Stream.map`, recursion
- `throw` — use `Effect.fail` with tagged errors (`Data.TaggedError`)
- `class` (for business logic) — use `Data.TaggedClass`, `Data.Class`, `Schema.Class`, or plain objects
- `let/var` for mutable state — use `Ref`, atoms, or Svelte 5 `$state()` runes (only in .svelte files)
- Plain `Error` / `new Error(...)` — use `Data.TaggedError` subclasses
- Imperative callbacks with side effects — wrap in `Effect.sync` / `Effect.gen`

#### Required (ALWAYS use)

- **Effect for all side effects**: IO, HTTP, timers, randomness, logging → `Effect.gen`, `Effect.map`, `Effect.flatMap`, `Effect.tap`
- **`pipe` and composition**: chain transformations via `pipe(value, fn1, fn2, ...)`, not nested calls
- **Namespace imports**: `import * as Result from '@effect/...result'`, `import * as Option from 'effect/Option'` — never destructure Effect modules
- **Arrow functions**: `const fn = (a: A): B => ...` — no `function` declarations
- **Small, pure functions**: each function does one thing, takes data in, returns data out
- **Data separated from computations**: define schemas/types separately from logic that operates on them
- **Tagged errors**: every error is a `Data.TaggedError` with `_tag` for pattern matching
- **Exhaustive matching**: use `Match.exhaustive` or `Match.orElse` — never leave unhandled cases

#### Encouraged patterns

- **Currying**: `const add = (a: number) => (b: number) => a + b`
- **Recursion** over loops where readability allows
- **Monadic chaining**: `Effect.flatMap`, `Option.flatMap`, `Either.flatMap`
- **`Schema.decode` / `Schema.encode`** for validation and parsing
- **`Layer` for dependency injection**: compose services via `Layer.provide`, `Layer.mergeAll`
- **`Stream`** for async sequences instead of callbacks or event emitters
- **Point-free style** where it improves readability: `pipe(items, Array.map(toDto), Array.filter(isActive))`

#### Svelte-specific exceptions

Inside `.svelte` files, Svelte 5 runes (`$state()`, `$derived()`, `$effect()`, `$props()`) are idiomatic and allowed. Keep logic minimal in components — extract business logic into `store.ts` using Effect and atoms.
