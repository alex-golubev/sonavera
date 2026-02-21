# Sonavera Project Guidelines

## Core Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes)
- **Language**: TypeScript (Strict Engine Mode)
- **Architecture**: Strict Functional Programming
- **Core Libraries**: `effect`, `@effect/schema`, `@effect/rpc`, `@effect/sql-pg`
- **State**: Custom `@effect-atom` Svelte 5 adapter
- **Database**: PostgreSQL (Neon DB / Local via Docker)
- **Auth**: Better Auth (`better-auth-effect` adapter)
- **Deployment**: Vercel

## Architecture & Communication

- **Client-Server**: Direct Effect execution in SvelteKit `+server.ts` POST routes. Responses are streamed via `Stream.toReadableStream()`.
- **Feature Modules**: Code is co-located in `src/lib/features/<name>/` (`store.ts`, `schema.ts`, `server/handler.ts`, `server/openai.ts`).
- **State Management**: Use `useAtomValue`, `useAtomSet`, `useAtom` hooks. **Important:** These hooks return getter functions (e.g., call `count()`, not `count` in templates). Always use `Atom.keepAlive` for internal refs to prevent GC.
- **Dependency Injection**: Use `Context.Tag` and `Layer` for services (e.g., `UserSettings`, `OpenAiClient`, `Session`).

## Strict Functional Programming Rules

This project strictly forbids imperative paradigms outside of specific UI/Browser boundaries.

### 🚫 PROHIBITED (NEVER USE)

- `async/await` -> Use `Effect.gen`, `Effect.promise`, `Effect.tryPromise`.
- `try/catch`, `throw` -> Use `Effect.try`, `Effect.catchAll`, `Effect.fail` with `Data.TaggedError`.
- `if/else`, `switch` -> Use `Match.tag`, `Match.when`, `Option.match`, `Result.match`.
- `for/while/do` loops -> Use `Array.map`, `Array.reduce`, `Effect.forEach`, `Stream.map`.
- `class` (for logic) -> Use `Data.TaggedClass`, `Data.Class`, or plain objects.
- Destructured Effect imports -> ALWAYS use namespace imports (e.g., `import * as Option from 'effect/Option'`).

### ✅ REQUIRED (ALWAYS USE)

- **Effect for side-effects**: Wrap all IO, HTTP, timers, and mutations in `Effect`.
- **Pipelines**: Compose logic using `pipe(value, fn1, fn2)`.
- **Tagged Errors**: Every error must be a `Data.TaggedError` with a `_tag` property.
- **Exhaustive Matching**: Always handle all cases in `Match` blocks.
- **Arrow Functions**: Use `const fn = () => ...` exclusively.

## Exceptions (Boundaries)

- Svelte 5 runes (`$state`, `$effect`) are fully permitted in `.svelte` and `.svelte.ts` files.
- Mutable variables (`let`) are allowed ONLY at external API boundaries (e.g., Web Audio API callbacks) where passing an `Effect` is impossible.
