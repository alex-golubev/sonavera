/**
 * AtomRef reactive hooks for Svelte 5
 * @module
 */

import type { AtomRef, ReadonlyRef } from '@effect-atom/atom/AtomRef'
import { fromSubscribable } from './subscribe.svelte'

export const useAtomRef = <A>(ref: ReadonlyRef<A>): (() => A) =>
  fromSubscribable(
    () => ref.value,
    (cb) => ref.subscribe(cb)
  )

export const useAtomRefProp = <A, K extends keyof A>(ref: AtomRef<A>, prop: K): (() => A[K]) =>
  useAtomRef(ref.prop(prop))
