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

## Architecture

### Hexagonal, feature-based

Each feature is a mini-hexagon under `src/features/<name>/`:

- `rpc.ts` — RPC definitions (Schema, RpcGroup) — shared between client and server
- `handlers.ts` — server-only RPC handler implementations
- `ports.ts` — port interfaces (`Context.Tag`)
- `adapters/` — port implementations (`Layer`)
- `atoms.ts` — client-side API via `@effect-atom/atom` (components import only this)
- `components/` — React components

### Effect RPC (not regular API routes)

All server communication uses `@effect/rpc`, not Next.js API routes. Single endpoint at `src/app/api/rpc/route.ts` delegates to Effect RPC handler.

- **Define RPCs**: `Rpc.make(tag, { payload, success, error })` in feature `rpc.ts`
- **Group**: `RpcGroup.make(...)` per feature, merged into `AppRpcGroup` in `src/rpc/group.ts`
- **Handle**: `group.toLayer(handlers)` in feature `handlers.ts`
- **Compose**: `RpcServer.toWebHandler(AppRpcGroup, { layer })` in `src/rpc/server.ts`
- **Client**: `AtomRpc.Tag` in `src/rpc/client.ts` — exposes `.mutation()` and `.query()` for atoms
- **React**: components use `useAtom(someAtom)` from `@effect-atom/atom-react`, never import RPC directly

### Dependency injection

- `Context.Tag` = port (interface)
- `Layer` = adapter (implementation)
- Ports are consumed in handlers via `yield*`
- Adapters are composed in `src/rpc/server.ts`

### Key conventions

- **Path alias**: `~/*` → `./src/*`
- **Biome**: single quotes, no semicolons, no trailing commas, 120 char line width, organized imports
- **Next.js 16**: all routes are dynamic by default (no `export const dynamic` needed)
- **Fonts**: Geist Sans/Mono via `next/font/google`
