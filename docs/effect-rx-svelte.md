# @effect-rx Svelte 5 Adapter

Reactive state management for Svelte 5 using the Effect ecosystem.

## Installation

```bash
pnpm add @effect-rx/rx effect
```

## Setup

Wrap your app with `RegistryProvider` in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { RegistryProvider } from '$lib/effect-rx'
  let { children } = $props()
</script>

<RegistryProvider>
  {@render children()}
</RegistryProvider>
```

## Creating Stores

### Simple Writable Rx

```typescript
// src/lib/stores/counter.ts
import { Rx } from '$lib/effect-rx'

export const counterRx = Rx.make(0)
```

### Derived Rx

```typescript
import { Rx } from '$lib/effect-rx'

export const counterRx = Rx.make(0)

// Automatically updates when counterRx changes
export const doubledRx = Rx.readable((get) => get(counterRx) * 2)
```

### Async Rx with Effect

```typescript
import { Rx } from '$lib/effect-rx'
import { Effect } from 'effect'

export const userRx = Rx.make((get) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => fetch('/api/user').then((r) => r.json()))
    return response
  })
)
```

## API

### `rxValue(rx)`

Subscribe to an Rx value. Returns a getter function.

```svelte
<script lang="ts">
  import { rxValue } from '$lib/effect-rx'
  import { counterRx } from '$lib/stores/counter'

  const count = rxValue(counterRx)
</script>

<p>Count: {count()}</p>
```

### `rxSet(rx)`

Get a setter function for a Writable Rx. Does not subscribe to changes.

```svelte
<script lang="ts">
  import { rxSet } from '$lib/effect-rx'
  import { counterRx } from '$lib/stores/counter'

  const setCount = rxSet(counterRx)
</script>

<button onclick={() => setCount(0)}>Reset</button>
```

### `rxBind(rx)`

Subscribe to a Writable Rx and get both value and setter.

```svelte
<script lang="ts">
  import { rxBind } from '$lib/effect-rx'
  import { counterRx } from '$lib/stores/counter'

  const counter = rxBind(counterRx)
</script>

<p>Count: {counter.value()}</p>
<button onclick={() => counter.set(counter.value() + 1)}>+1</button>
```

### `rxSelect(rx, selector)`

Subscribe with a transform function. Useful for selecting nested values.

```svelte
<script lang="ts">
  import { rxSelect } from '$lib/effect-rx'
  import { userRx } from '$lib/stores/user'

  const userName = rxSelect(userRx, (user) => user.name)
</script>

<p>Hello, {userName()}</p>
```

### `rxMount(rx)`

Keep an Rx alive for the component's lifetime. Useful for Rx values that perform background work (websockets, polling, etc).

```svelte
<script lang="ts">
  import { rxMount } from '$lib/effect-rx'
  import { websocketRx } from '$lib/stores/websocket'

  // Keep websocket connection alive while component is mounted
  rxMount(websocketRx)
</script>
```

### `rxRefresh(rx)`

Get a function to manually refresh an Rx value. Useful for re-fetching data.

```svelte
<script lang="ts">
  import { rxValue, rxRefresh } from '$lib/effect-rx'
  import { userDataRx } from '$lib/stores/user'

  const userData = rxValue(userDataRx)
  const refresh = rxRefresh(userDataRx)
</script>

<button onclick={refresh}>Refresh</button>
```

## Result Handling

For async Rx that return `Result<A, E>` (loading/success/error states).

### `rxResult(rx)`

Get full control over loading, success, and error states.

```svelte
<script lang="ts">
  import { rxResult, rxMount } from '$lib/effect-rx'
  import { userDataRx } from '$lib/stores/user'

  rxMount(userDataRx)
  const user = rxResult(userDataRx)
</script>

{#if user.isInitial()}
  <p>Not started</p>
{:else if user.isLoading()}
  <LoadingSpinner />
{:else if user.isSuccess()}
  <p>Welcome, {user.value().name}</p>
{:else if user.isFailure()}
  <ErrorMessage error={user.error()} />
{/if}
```

#### RxResultState API

| Method            | Return Type      | Description                                 |
| ----------------- | ---------------- | ------------------------------------------- |
| `isInitial()`     | `boolean`        | True if not yet started                     |
| `isLoading()`     | `boolean`        | True if waiting for response                |
| `isSuccess()`     | `boolean`        | True if completed successfully              |
| `isFailure()`     | `boolean`        | True if failed with error                   |
| `value()`         | `A \| undefined` | Success value                               |
| `error()`         | `E \| undefined` | Error value                                 |
| `result()`        | `Result<A, E>`   | Raw Result object                           |
| `isRefreshing()`  | `boolean`        | Loading with previous value available       |
| `previousValue()` | `A \| undefined` | Previous success value during refresh/error |

### `rxResultValue(rx, fallback)`

Get the value directly with a fallback for loading/error states. Shows previous value while refreshing.

```svelte
<script lang="ts">
  import { rxResultValue, rxMount } from '$lib/effect-rx'
  import { userListRx } from '$lib/stores/users'

  rxMount(userListRx)
  const users = rxResultValue(userListRx, [])
</script>

{#each users() as user}
  <UserCard {user} />
{/each}
```

## Context API

### Custom Registry

You can provide a custom Registry instance:

```svelte
<script lang="ts">
  import { RegistryProvider, Registry } from '$lib/effect-rx'

  const customRegistry = Registry.make({
    // custom options
  })
</script>

<RegistryProvider registry={customRegistry}>
  {@render children()}
</RegistryProvider>
```

### Manual Context Access

```typescript
import { getRegistry, tryGetRegistry, setRegistry } from '$lib/effect-rx'

// Get registry (throws if not found)
const registry = getRegistry()

// Get registry (returns undefined if not found)
const maybeRegistry = tryGetRegistry()

// Set registry manually
setRegistry(myRegistry)
```

## Type Helpers

```typescript
import type { RxValue, RxWriteValue, RxReadValue } from '$lib/effect-rx'
import type { Rx } from '$lib/effect-rx'

// Extract value type from Rx
type CounterValue = RxValue<typeof counterRx> // number

// Extract write type from Writable
type WriteType = RxWriteValue<typeof counterRx> // number

// Extract read type from Writable
type ReadType = RxReadValue<typeof counterRx> // number
```

## File Structure

```
src/lib/effect-rx/
├── index.ts              # Barrel exports
├── context.ts            # Registry context helpers
├── context.svelte.ts     # createRegistryProvider helper
├── RegistryProvider.svelte  # Provider component
├── hooks.svelte.ts       # Core reactive functions
├── result.svelte.ts      # Result handling functions
└── types.ts              # Type helpers
```

## Best Practices

### 1. Colocate stores with features

```
src/lib/features/
├── auth/
│   ├── stores.ts         # Auth-related Rx
│   └── components/
└── conversation/
    ├── stores.ts         # Conversation Rx
    └── components/
```

### 2. Use `rxMount` for side-effect Rx

```svelte
<script lang="ts">
  import { rxMount } from '$lib/effect-rx'

  // Always mount Rx that perform background work
  rxMount(analyticsRx)
  rxMount(websocketRx)
</script>
```

### 3. Prefer `rxSelect` for nested data

```typescript
// Instead of subscribing to entire user object
const user = rxValue(userRx)
// user().settings.theme

// Subscribe only to what you need
const theme = rxSelect(userRx, (u) => u.settings.theme)
// theme()
```

### 4. Handle loading states explicitly

```svelte
{#if data.isLoading()}
  <Skeleton />
{:else if data.isSuccess()}
  <Content value={data.value()} />
{/if}
```

## Troubleshooting

### "Registry not found" error

Make sure `RegistryProvider` wraps your component tree in `+layout.svelte`.

### Values not updating

1. Check that you're calling the getter function: `count()` not `count`
2. Verify the Rx is mounted if it performs async work
3. Check browser devtools for errors

### SSR issues

The adapter is SSR-safe. Registry is created per-request on the server via Svelte context.
