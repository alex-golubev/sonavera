/**
 * @effect-rx Svelte 5 adapter
 *
 * Provides reactive state management using Effect ecosystem in Svelte 5.
 *
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 *   import { RegistryProvider } from '$lib/effect-rx'
 *   let { children } = $props()
 * </script>
 *
 * <RegistryProvider>
 *   {@render children()}
 * </RegistryProvider>
 * ```
 *
 * @example
 * ```svelte
 * <!-- Component.Svelte -->
 * <script>
 *   import { rxValue, rxSet } from '$lib/effect-rx'
 *   import { countRx } from './stores'
 *
 *   const count = rxValue(countRx)
 *   const setCount = rxSet(countRx)
 * </script>
 *
 * <p>Count: {count()}</p>
 * <button onclick={() => setCount(count() + 1)}>+1</button>
 * ```
 *
 * @module
 */

// Context
export { setRegistry, getRegistry, tryGetRegistry } from './context.js'
export { default as RegistryProvider } from './RegistryProvider.svelte'

// Core reactive functions
export { rxValue, rxSet, rxBind, rxMount, rxRefresh, rxSelect } from './hooks.svelte.js'

// Result handling
export { rxResult, rxResultValue, type RxResultState } from './result.svelte.js'

// Re-export core @effect-rx modules for convenience
// Usage: Rx.Rx<A>, Rx.Writable<R, W>, Result.Result<A, E>, etc.
export * as Rx from '@effect-rx/rx/Rx'
export * as Registry from '@effect-rx/rx/Registry'
export * as Result from '@effect-rx/rx/Result'

// Svelte-specific type helpers
export type { RxValue, RxWriteValue, RxReadValue } from './types.js'
