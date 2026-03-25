# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sonavera — a conversational language practice app. Next.js 16, React 19, TypeScript 5, Tailwind CSS 4.

@AGENTS.md

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # Lint with Biome
pnpm format     # Auto-format with Biome (--write)
pnpm typecheck  # Type check with tsc --noEmit
```

Package manager is **pnpm**.

## Environment variables

Required in `.env.local`:

```
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=...
```

These are read via `Config.string()` from Effect — not `process.env`.

## Architecture

### Hexagonal, feature-based

Each feature lives under `src/features/<name>/`:

- `schema.ts` — RPC definitions (`Rpc.make`, `RpcGroup.make`) — shared between client and server
- `handlers.ts` — server-only RPC handler implementations (`group.toLayer(...)`)
- `errors.ts` — typed errors via `Schema.TaggedError`, combined with `Schema.Union`
- `store.ts` — client-side atoms via `AppClient.mutation()` / `AppClient.query()`
- `components/` — React components (consume atoms, never import RPC directly)

Shared infrastructure services live in `src/services/` (e.g., `LiveKit.ts`) — each exports a `Context.Tag` interface and a `Live` layer.

### Effect RPC (not regular API routes)

All server communication uses `@effect/rpc`, not Next.js API routes. Single endpoint at `src/app/api/rpc/route.ts` handles everything.

- **Define RPCs**: `Rpc.make(tag, { payload, success, error })` in feature `schema.ts`
- **Group**: `RpcGroup.make(...)` per feature in `schema.ts`
- **Handle**: `group.toLayer(handlers)` in feature `handlers.ts`
- **Compose**: `RpcServer.toWebHandler(Group, { layer })` in `src/app/api/rpc/route.ts` — layers are assembled here
- **Client**: `AppClient` in `src/rpc/client.ts` — an `AtomRpc.Tag` that exposes `.mutation()` and `.query()`
- **React**: components use `useAtomValue(someAtom)` / `useAtomSet(someAtom)` from `@effect-atom/atom-react`

### Dependency injection

- `Context.Tag` = port (interface) — defined in service files or feature handlers
- `Layer` = adapter (implementation) — `*Live` exports
- Ports are consumed in handlers via `yield*`
- Layers are composed in `src/app/api/rpc/route.ts`

### Key conventions

- **Path alias**: `~/*` → `./src/*`
- **Biome**: single quotes, no semicolons, no trailing commas, 120 char line width, organized imports
- **Next.js 16**: all routes are dynamic by default (no `export const dynamic` needed)
- **Fonts**: Plus Jakarta Sans (sans) + Geist Mono via `next/font/google`
- **Error boundaries**: `ComponentBoundary` wraps UI sections with graceful fallbacks
- **Animations**: framer-motion with `MotionConfig reducedMotion="user"` at provider level
- **CSS utilities**: `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)
