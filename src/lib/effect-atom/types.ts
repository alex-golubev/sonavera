/**
 * Svelte-specific type helpers for @effect-atom
 * @module
 */
export type AtomTypeValue<T> = T extends import('@effect-atom/atom/Atom').Atom<infer A> ? A : never
export type AtomWriteValue<T> = T extends import('@effect-atom/atom/Atom').Writable<unknown, infer W> ? W : never
export type AtomReadValue<T> = T extends import('@effect-atom/atom/Atom').Writable<infer R, unknown> ? R : never
