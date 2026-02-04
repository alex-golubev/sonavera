/**
 * Shared reactive subscription primitive for Svelte 5
 * @module
 */

/**
 * Create a reactive getter from a get/subscribe pair.
 * This is the core building block for all atom and ref subscriptions.
 */
export function fromSubscribable<A>(
  get: () => A,
  subscribe: (callback: (value: A) => void) => (() => void) | void
): () => A {
  let value = $state<A>(get())

  $effect(() => {
    value = get()
    return subscribe((v) => (value = v))
  })

  return () => value
}
