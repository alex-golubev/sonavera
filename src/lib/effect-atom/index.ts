/**
 * @effect-atom Svelte 5 adapter
 *
 * Provides reactive state management using Effect ecosystem in Svelte 5.
 *
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 *   import { RegistryProvider } from '$lib/effect-atom'
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
 * <!-- Component.svelte -->
 * <script>
 *   import { useAtomValue, useAtomSet } from '$lib/effect-atom'
 *   import { countAtom } from './stores'
 *
 *   const count = useAtomValue(countAtom)
 *   const setCount = useAtomSet(countAtom)
 * </script>
 *
 * <p>Count: {count()}</p>
 * <button onclick={() => setCount(count() + 1)}>+1</button>
 * ```
 *
 * @module
 */

// Context
export { setRegistry, getRegistry, tryGetRegistry, RegistryNotFoundError } from './context'
export { default as RegistryProvider } from './RegistryProvider.svelte'

// Core hooks
export { useAtomValue, useAtomSet, useAtom, useAtomMount, useAtomRefresh } from './hooks.svelte'

// Result handling
export { useAtomResult, useAtomResultValue, type AtomResultState } from './result.svelte'

// AtomRef hooks
export { useAtomRef, useAtomRefProp } from './ref.svelte'

// Re-export core @effect-atom modules
export * as Atom from '@effect-atom/atom/Atom'
export * as Registry from '@effect-atom/atom/Registry'
export * as Result from '@effect-atom/atom/Result'
export * as AtomRef from '@effect-atom/atom/AtomRef'
export * as AtomRpc from '@effect-atom/atom/AtomRpc'
export * as AtomHttpApi from '@effect-atom/atom/AtomHttpApi'

// Type helpers
export type { AtomTypeValue, AtomWriteValue, AtomReadValue } from './types'
