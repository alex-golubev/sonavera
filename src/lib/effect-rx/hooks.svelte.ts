/**
 * Core reactive functions for @effect-rx integration with Svelte 5
 * @module
 */

import * as Rx from '@effect-rx/rx/Rx'
import { getRegistry } from './context.js'

/**
 * Subscribe to an Rx value reactively.
 * Returns a getter function that provides the current value.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxValue } from '$lib/effect-rx'
 *   import { countRx } from './stores'
 *
 *   const count = rxValue(countRx)
 * </script>
 *
 * <p>Count: {count()}</p>
 * ```
 */
export function rxValue<A>(rx: Rx.Rx<A>): () => A {
  const registry = getRegistry()

  let value = $state<A>(registry.get(rx))

  $effect(() => {
    value = registry.get(rx)
    return registry.subscribe(rx, (v) => (value = v))
  })

  return () => value
}

/**
 * Get a setter function for a Writable Rx.
 * Does not subscribe to value changes.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxSet } from '$lib/effect-rx'
 *   import { countRx } from './stores'
 *
 *   const setCount = rxSet(countRx)
 * </script>
 *
 * <button onclick={() => setCount(0)}>Reset</button>
 * ```
 */
export function rxSet<R, W>(rx: Rx.Writable<R, W>): (value: W) => void {
  const registry = getRegistry()
  return (value: W) => registry.set(rx, value)
}

/**
 * Subscribe to a Writable Rx and get both value and setter.
 * Returns an object with a value getter and set function.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxBind } from '$lib/effect-rx'
 *   import { countRx } from './stores'
 *
 *   const count = rxBind(countRx)
 * </script>
 *
 * <p>Count: {count.value()}</p>
 * <button onclick={() => count.set(count.value() + 1)}>Increment</button>
 * ```
 */
export function rxBind<R, W>(
  rx: Rx.Writable<R, W>
): {
  readonly value: () => R
  readonly set: (value: W) => void
} {
  return {
    value: rxValue(rx),
    set: rxSet(rx)
  }
}

/**
 * Mount Rx for the component's lifetime.
 * This keeps the Rx alive even if no other subscriptions exist.
 * Useful for Rx values that perform background work.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxMount } from '$lib/effect-rx'
 *   import { websocketConnectionRx } from './stores'
 *
 *   // Keep websocket alive while this component is mounted
 *   rxMount(websocketConnectionRx)
 * </script>
 * ```
 */
export function rxMount(rx: Rx.Rx<unknown>): void {
  const registry = getRegistry()
  $effect(() => registry.mount(rx))
}

/**
 * Get a function to refresh Rx value.
 * Useful for triggering re-fetches of async data.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxRefresh, rxValue } from '$lib/effect-rx'
 *   import { userDataRx } from './stores'
 *
 *   const userData = rxValue(userDataRx)
 *   const refresh = rxRefresh(userDataRx)
 * </script>
 *
 * <button onclick={refresh}>Refresh</button>
 * ```
 */
export function rxRefresh(rx: Rx.Rx<unknown>): () => void {
  const registry = getRegistry()
  return () => registry.refresh(rx)
}

/**
 * Subscribe to Rx value with a selector/transform function.
 * Creates a derived Rx internally using Rx.map.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxSelect } from '$lib/effect-rx'
 *   import { userRx } from './stores'
 *
 *   const userName = rxSelect(userRx, (user) => user.name)
 * </script>
 *
 * <p>Hello, {userName()}</p>
 * ```
 */
export function rxSelect<A, B>(rx: Rx.Rx<A>, selector: (value: A) => B): () => B {
  return rxValue(Rx.map(rx, selector))
}
