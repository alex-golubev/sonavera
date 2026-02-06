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
- **HTTP API**: `@effect/platform` HttpApi with per-feature endpoints (`/api/stt`, `/api/llm`, `/api/tts`)
- **RPC**: `@effect/rpc` with MsgPack serialization over HTTP (`/api/rpc`) — available for future features
- **Environment**: Requires `OPENAI_API_KEY` (see `.env.example`); use `$env/dynamic/private` for runtime secrets

### HTTP API Communication

Client-server communication uses `@effect/platform` HttpApi with per-feature POST endpoints:

- **API definition** (`src/lib/features/<name>/api.ts`): `HttpApiEndpoint` + `HttpApiGroup` + `HttpApi` defining typed endpoints with schemas and errors
- **Server handler** (`src/lib/features/<name>/server/handler.ts`): `HttpApiBuilder.group` implementing endpoint handlers, exported as `FeatureLive` layer
- **Composition** (`src/lib/server/composition.ts`): per-feature `HttpApiBuilder.api` + `HttpApiBuilder.toWebHandler` producing named handlers
- **Routes** (`src/routes/api/<name>/+server.ts`): SvelteKit POST handler delegating `request` to the composed handler

Each feature defines its own `HttpApi` and is composed independently. Streaming responses use `HttpServerResponse.stream` with binary (`application/octet-stream`) or text (`text/plain`) content types.

### RPC Communication

RPC infrastructure is available for features that benefit from `@effect/rpc` (e.g. streaming with PullResult atoms):

- **Client** (`src/lib/rpc/client.ts`): `AppClient` tag built from `AtomRpc.Tag`, provides `.query()` for atoms
- **Protocol** (`src/lib/rpc/protocol.ts`): HTTP protocol via `RpcClient.layerProtocolHttp` + `FetchHttpClient`
- **Server** (`src/routes/api/rpc/+server.ts`): delegates to `RpcServer.toWebHandler`
- **Composition** (`src/lib/server/composition.ts`): RPC handler layers merged via `Layer.mergeAll`

RPC groups defined per feature (e.g. `FeatureRpc`), then merged into `RootRpc` (`src/lib/rpc/rpc.ts`).

### @effect-atom Adapter

Bridges Effect ecosystem's atom model with Svelte 5 reactivity. Key design decisions:

- **`fromSubscribable(get, subscribe)`** (`subscribe.svelte.ts`) — single shared primitive that converts any get/subscribe pair into a Svelte 5 reactive getter via `$state` + `$effect`. Supports SSR via optional `ssrInitial` parameter.
- **Registry Context** (`context.ts`) — provides `Registry` via Svelte context API. `RegistryNotFoundError` is a `Data.TaggedError` from Effect.
- **Hooks** (`hooks.svelte.ts`) — `useAtomValue`, `useAtomSet`, `useAtom`, `useAtomMount`, `useAtomRefresh`. Setter supports async modes (`promise`/`promiseExit`) for Result atoms.
- **Result handling** (`result.svelte.ts`) — `useAtomResult` returns an object with reactive getters (`isLoading()`, `isSuccess()`, `value()`, etc.) for `Atom<Result<A, E>>`.
- **AtomRef** (`ref.svelte.ts`) — `useAtomRef`, `useAtomRefProp` for fine-grained mutable references.

All hooks return **getter functions** (not raw values) — call `count()` not `count` in templates.

### Adding a New Feature

Features live in `src/lib/features/<name>/` with co-located code:

- `api.ts` — HttpApi endpoint, group, and API definition (schemas, errors)
- `store.ts` — atoms and business logic (client-side)
- `schema.ts` — shared types, payloads, and tagged errors
- `server/` — server-side handlers and service implementations
- `components/` — Svelte components

To wire up a new feature:

1. Define payload and error schemas in `schema.ts` (use `Schema.TaggedError` with `HttpApiSchema.annotations`)
2. Define `HttpApiEndpoint`, `HttpApiGroup`, and `HttpApi` in `api.ts`
3. Create server handler in `server/handler.ts` using `HttpApiBuilder.group`, export as `FeatureLive` layer
4. Add handler composition in `src/lib/server/composition.ts`: `HttpApiBuilder.api(FeatureApi).pipe(Layer.provide(FeatureLive))` + `HttpApiBuilder.toWebHandler`
5. Create SvelteKit route at `src/routes/api/<name>/+server.ts` delegating to the composed handler

### Store Patterns

Stores follow a consistent pattern across features:

- **State atoms**: exported `Atom.make(...)` for UI-facing state (e.g. `listening`, `playing`, `error`)
- **Internal refs**: `Atom.keepAlive(Atom.make(...))` for values only used via `registry.get()`/`registry.set()` — **must** use `keepAlive` or they get garbage collected silently
- **Fiber-based streaming**: stores hold a `fiberRef` atom with the current `RuntimeFiber`. New streams interrupt the previous fiber before starting. Cleanup functions (`destroy`, `toggleMute`) interrupt via `Fiber.interrupt`
- **HTTP streaming**: client creates `HttpClientRequest`, calls `client.execute(request)`, then pipes `response.stream` through `Stream.mapEffect` / `Stream.runForEach` for chunk processing
- **Public API**: exported functions take `registry: Registry.Registry` as first arg, return `Effect.Effect`

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

This project follows a strict functional programming paradigm with pragmatic exceptions at external API boundaries.

#### Prohibited (NEVER use)

- `async/await` — use `Effect.gen` / `Effect.promise` / `Effect.tryPromise` instead
- `try/catch` — use `Effect.try` / `Effect.catchTag` / `Effect.catchAll` instead
- `if/else` — use `Match.tag`, `Match.when`, `Option.match`, `Result.match*`, ternary expressions, or pattern matching via Effect
- `for/while/do` loops — use `Array.map`, `Array.filter`, `Array.reduce`, `Effect.forEach`, `Stream.map`, recursion
- `throw` — use `Effect.fail` with tagged errors (`Data.TaggedError`)
- `class` (for business logic) — use `Data.TaggedClass`, `Data.Class`, `Schema.Class`, or plain objects
- `let/var` for mutable state — use `Ref`, atoms, or Svelte 5 `$state()` runes (in `.svelte` / `.svelte.ts` files). See "Allowed exceptions" for boundary cases
- Plain `Error` / `new Error(...)` — use `Data.TaggedError` subclasses
- Imperative side effects in Effect pipelines — wrap in `Effect.sync` / `Effect.gen`

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

Inside `.svelte` and `.svelte.ts` files, Svelte 5 runes (`$state()`, `$derived()`, `$effect()`, `$props()`) are idiomatic and allowed. `.svelte.ts` files are compiled by the Svelte compiler and are the standard way to use runes outside components. Keep logic minimal in components — extract business logic into `store.ts` using Effect and atoms.

#### Allowed exceptions

The following patterns are permitted at **external API boundaries** where strict FP would add complexity without benefit:

- **Closure-scoped `let` for browser API wrappers** (e.g. `pcm-player.ts`): Web Audio API callbacks (`source.onended`) are synchronous and cannot return `Effect`. Mutable state scoped to a factory function (like `createPlayer`) is allowed when it manages browser API lifecycle.
- **Closure-scoped `let` for ephemeral stream state**: function-local variables that track consumption within a single stream invocation and are reset on each new stream. Prefer atoms for state that persists across invocations.
- **Direct `registry.set()` in external callbacks**: callbacks passed to third-party libraries (VAD `onSpeechStart`/`onSpeechEnd`), DOM event handlers (`source.onended`), and `registry.subscribe()` expect `() => void` — wrapping in `Effect.sync` + `Effect.runSync` adds noise without composability benefit. Use `Effect.sync` only when the callback is **part of an Effect pipeline** (e.g. inside `Effect.andThen`).
