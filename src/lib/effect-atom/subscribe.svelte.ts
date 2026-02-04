/**
 * Shared reactive subscription primitive for Svelte 5
 * @module
 */

import { browser } from '$app/environment'

/**
 * Create a reactive getter from a get/subscribe pair.
 * This is the core building block for all atom and ref subscriptions.
 *
 * When `ssrInitial` is provided and running on the server, it is used
 * instead of `get()` to avoid triggering side effects (e.g. HTTP requests)
 * during SSR. The real `get()` + `subscribe()` only run inside `$effect`
 * (client-only), following SvelteKit's recommendation.
 */
export function fromSubscribable<A>(
  get: () => A,
  subscribe: (callback: (value: A) => void) => (() => void) | void,
  ssrInitial?: () => A
): () => A {
  let value = $state<A>(!browser && ssrInitial ? ssrInitial() : get())

  $effect(() => {
    value = get()
    return subscribe((v) => (value = v))
  })

  return () => value
}
