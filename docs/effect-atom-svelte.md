# @effect-atom Svelte 5 Adapter

Reactive state management for Svelte 5 using the Effect ecosystem.

## Installation

```bash
pnpm add @effect-atom/atom effect
```

## Setup

Wrap your app with `RegistryProvider` in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { RegistryProvider } from '$lib/effect-atom'
  let { children } = $props()
</script>

<RegistryProvider>
  {@render children()}
</RegistryProvider>
```

## Creating Atoms

### Simple Writable Atom

```typescript
// src/lib/stores/counter.ts
import { Atom } from '$lib/effect-atom'

export const counterAtom = Atom.make(0)
```

### Derived Atom

```typescript
import { Atom } from '$lib/effect-atom'

export const counterAtom = Atom.make(0)

// Automatically updates when counterAtom changes
export const doubledAtom = Atom.readable((get) => get(counterAtom) * 2)
```

### Async Atom with Effect

```typescript
import { Atom } from '$lib/effect-atom'
import { Effect } from 'effect'

export const userAtom = Atom.make((get) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => fetch('/api/user').then((r) => r.json()))
    return response
  })
)
```

## API

### `useAtomValue(atom)`

Subscribe to an Atom value. Returns a getter function.

```svelte
<script lang="ts">
  import { useAtomValue } from '$lib/effect-atom'
  import { counterAtom } from '$lib/stores/counter'

  const count = useAtomValue(counterAtom)
</script>

<p>Count: {count()}</p>
```

Optionally accepts a selector to transform the value:

```svelte
<script lang="ts">
  import { useAtomValue } from '$lib/effect-atom'
  import { userAtom } from '$lib/stores/user'

  const userName = useAtomValue(userAtom, (user) => user.name)
</script>

<p>Hello, {userName()}</p>
```

### `useAtomSet(atom, options?)`

Get a setter function for a Writable Atom. Mounts the atom for the component's lifetime.

```svelte
<script lang="ts">
  import { useAtomSet } from '$lib/effect-atom'
  import { counterAtom } from '$lib/stores/counter'

  const setCount = useAtomSet(counterAtom)
</script>

<button onclick={() => setCount(0)}>Reset</button>
<button onclick={() => setCount((n) => n + 1)}>+1</button>
```

#### Setter Modes

For async atoms that return `Result<A, E>`, the setter supports promise modes:

```svelte
<script lang="ts">
  import { useAtomSet } from '$lib/effect-atom'
  import { submitAtom } from '$lib/stores/form'

  // Await the result of writing
  const submit = useAtomSet(submitAtom, { mode: 'promise' })

  async function handleSubmit() {
    try {
      const result = await submit({ name: 'Alice' })
      console.log('Success:', result)
    } catch (error) {
      console.error('Failed:', error)
    }
  }
</script>
```

| Mode            | Return Type                   | Description                            |
| --------------- | ----------------------------- | -------------------------------------- |
| (default)       | `(value: W) => void`          | Synchronous set                        |
| `'promise'`     | `(value: W) => Promise<A>`    | Resolves with success, throws on error |
| `'promiseExit'` | `(value: W) => Promise<Exit>` | Resolves with Exit (no throw)          |

### `useAtom(atom, options?)`

Subscribe to a Writable Atom and get both value and setter.

```svelte
<script lang="ts">
  import { useAtom } from '$lib/effect-atom'
  import { counterAtom } from '$lib/stores/counter'

  const counter = useAtom(counterAtom)
</script>

<p>Count: {counter.value()}</p>
<button onclick={() => counter.set(counter.value() + 1)}>+1</button>
```

### `useAtomMount(atom)`

Keep an Atom alive for the component's lifetime. Useful for atoms that perform background work (websockets, polling, etc).

```svelte
<script lang="ts">
  import { useAtomMount } from '$lib/effect-atom'
  import { websocketAtom } from '$lib/stores/websocket'

  // Keep websocket connection alive while component is mounted
  useAtomMount(websocketAtom)
</script>
```

### `useAtomRefresh(atom)`

Get a function to manually refresh an Atom value. Useful for re-fetching data.

```svelte
<script lang="ts">
  import { useAtomValue, useAtomRefresh } from '$lib/effect-atom'
  import { userDataAtom } from '$lib/stores/user'

  const userData = useAtomValue(userDataAtom)
  const refresh = useAtomRefresh(userDataAtom)
</script>

<button onclick={refresh}>Refresh</button>
```

## Result Handling

For async atoms that return `Result<A, E>` (loading/success/error states).

### `useAtomResult(atom)`

Get full control over loading, success, and error states.

```svelte
<script lang="ts">
  import { useAtomResult, useAtomMount } from '$lib/effect-atom'
  import { userDataAtom } from '$lib/stores/user'

  useAtomMount(userDataAtom)
  const user = useAtomResult(userDataAtom)
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

#### AtomResultState API

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

### `useAtomResultValue(atom, fallback)`

Get the value directly with a fallback for loading/error states. Shows previous value while refreshing.

```svelte
<script lang="ts">
  import { useAtomResultValue, useAtomMount } from '$lib/effect-atom'
  import { userListAtom } from '$lib/stores/users'

  useAtomMount(userListAtom)
  const users = useAtomResultValue(userListAtom, [])
</script>

{#each users() as user}
  <UserCard {user} />
{/each}
```

## AtomRef

Fine-grained mutable references with reactive subscriptions.

### `useAtomRef(ref)`

Subscribe to an AtomRef value reactively.

```svelte
<script lang="ts">
  import { useAtomRef, AtomRef } from '$lib/effect-atom'

  const nameRef = AtomRef.make('Alice')
  const name = useAtomRef(nameRef)
</script>

<p>Name: {name()}</p>
<button onclick={() => nameRef.set('Bob')}>Change name</button>
```

### `useAtomRefProp(ref, prop)`

Subscribe to a property of an AtomRef.

```svelte
<script lang="ts">
  import { useAtomRefProp, AtomRef } from '$lib/effect-atom'

  const userRef = AtomRef.make({ name: 'Alice', age: 30 })
  const name = useAtomRefProp(userRef, 'name')
</script>

<p>Name: {name()}</p>
```

## RPC Integration

`AtomRpc` provides built-in integration with `@effect/rpc`.

```typescript
// src/lib/rpc/client.ts
import { AtomRpc } from '$lib/effect-atom'
import { myRpcGroup } from './schema'
import { httpProtocolLayer } from './protocol'

export const MyApi = AtomRpc.Tag<MyApi>()('MyApi', {
  group: myRpcGroup,
  protocol: httpProtocolLayer
})

// Query — returns Atom<Result<A, E>>
export const usersAtom = MyApi.query('getUsers', { limit: 10 })

// Mutation — returns AtomResultFn
export const createUserAtom = MyApi.mutation('createUser')
```

```svelte
<script lang="ts">
  import { useAtomResult, useAtomMount } from '$lib/effect-atom'
  import { usersAtom } from '$lib/rpc/client'

  useAtomMount(usersAtom)
  const users = useAtomResult(usersAtom)
</script>

{#if users.isSuccess()}
  {#each users.value() as user}
    <p>{user.name}</p>
  {/each}
{/if}
```

## Context API

### Custom Registry

You can provide a custom Registry instance:

```svelte
<script lang="ts">
  import { RegistryProvider, Registry } from '$lib/effect-atom'

  const customRegistry = Registry.make({
    defaultIdleTTL: 5000
  })
</script>

<RegistryProvider registry={customRegistry}>
  {@render children()}
</RegistryProvider>
```

### Manual Context Access

```typescript
import { getRegistry, tryGetRegistry, setRegistry, RegistryNotFoundError } from '$lib/effect-atom'

// Get registry (throws RegistryNotFoundError if not found)
const registry = getRegistry()

// Get registry (returns Option<Registry>)
const maybeRegistry = tryGetRegistry()

// Set registry manually
setRegistry(myRegistry)
```

`RegistryNotFoundError` is a tagged error (`Data.TaggedError`) — catchable via `Effect.catchTag('RegistryNotFoundError', ...)`.

## Type Helpers

```typescript
import type { AtomTypeValue, AtomWriteValue, AtomReadValue } from '$lib/effect-atom'
import type { Atom } from '$lib/effect-atom'

// Extract value type from Atom
type CounterValue = AtomTypeValue<typeof counterAtom> // number

// Extract write type from Writable
type WriteType = AtomWriteValue<typeof counterAtom> // number

// Extract read type from Writable
type ReadType = AtomReadValue<typeof counterAtom> // number
```

## File Structure

```
src/lib/effect-atom/
├── index.ts                 # Barrel exports
├── context.ts               # Registry context helpers
├── RegistryProvider.svelte  # Provider component
├── subscribe.svelte.ts      # Shared reactive subscription primitive
├── hooks.svelte.ts          # Core reactive hooks
├── result.svelte.ts         # Result handling hooks
├── ref.svelte.ts            # AtomRef hooks
└── types.ts                 # Type helpers
```

## Best Practices

### 1. Colocate atoms with features

```
src/lib/features/
├── auth/
│   ├── atoms.ts            # Auth-related atoms
│   └── components/
└── conversation/
    ├── atoms.ts            # Conversation atoms
    └── components/
```

### 2. Use `useAtomMount` for side-effect atoms

```svelte
<script lang="ts">
  import { useAtomMount } from '$lib/effect-atom'

  // Always mount atoms that perform background work
  useAtomMount(analyticsAtom)
  useAtomMount(websocketAtom)
</script>
```

### 3. Prefer selectors for nested data

```typescript
// Instead of subscribing to entire user object
const user = useAtomValue(userAtom)
// user().settings.theme

// Subscribe only to what you need
const theme = useAtomValue(userAtom, (u) => u.settings.theme)
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

## Migration from @effect-rx

| Old (`$lib/effect-rx`)      | New (`$lib/effect-atom`)       |
| --------------------------- | ------------------------------ |
| `Rx.make(0)`                | `Atom.make(0)`                 |
| `Rx.readable((get) => ...)` | `Atom.readable((get) => ...)`  |
| `rxValue(atom)`             | `useAtomValue(atom)`           |
| `rxSelect(atom, fn)`        | `useAtomValue(atom, fn)`       |
| `rxSet(atom)`               | `useAtomSet(atom)`             |
| `rxBind(atom)`              | `useAtom(atom)`                |
| `rxMount(atom)`             | `useAtomMount(atom)`           |
| `rxRefresh(atom)`           | `useAtomRefresh(atom)`         |
| `rxResult(atom)`            | `useAtomResult(atom)`          |
| `rxResultValue(atom, fb)`   | `useAtomResultValue(atom, fb)` |

## Troubleshooting

### `RegistryNotFoundError`

Make sure `RegistryProvider` wraps your component tree in `+layout.svelte`.

### Values not updating

1. Check that you're calling the getter function: `count()` not `count`
2. Verify the atom is mounted if it performs async work
3. Check browser devtools for errors

### SSR issues

The adapter is SSR-safe. Registry is created per-request on the server via Svelte context.
