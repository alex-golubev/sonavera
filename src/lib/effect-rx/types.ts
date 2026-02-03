/**
 * Svelte-specific type helpers for @effect-rx
 * @module
 */
export type RxValue<T> = T extends import('@effect-rx/rx/Rx').Rx<infer A> ? A : never
export type RxWriteValue<T> = T extends import('@effect-rx/rx/Rx').Writable<unknown, infer W> ? W : never
export type RxReadValue<T> = T extends import('@effect-rx/rx/Rx').Writable<infer R, unknown> ? R : never
