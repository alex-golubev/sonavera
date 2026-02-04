/**
 * Core reactive hooks for @effect-atom integration with Svelte 5
 * @module
 */

import * as Atom from '@effect-atom/atom/Atom'
import * as Registry from '@effect-atom/atom/Registry'
import type * as Result from '@effect-atom/atom/Result'
import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import { getRegistry } from './context'
import { fromSubscribable } from './subscribe.svelte'

const subscribeToAtom = <A>(atom: Atom.Atom<A>): (() => A) => {
  const registry = getRegistry()
  return fromSubscribable(
    () => registry.get(atom),
    (cb) => registry.subscribe(atom, cb)
  )
}

const flattenExit = <A, E>(exit: Exit.Exit<A, E>): A => {
  if (Exit.isSuccess(exit)) return exit.value
  throw Cause.squash(exit.cause)
}

type SetterOptions<R, Mode extends 'value' | 'promise' | 'promiseExit' = never> = {
  readonly mode?: ([R] extends [Result.Result<unknown, unknown>] ? Mode : 'value') | undefined
}

type SetterFn<R, W, Mode> = 'promise' extends Mode
  ? (value: W) => Promise<Result.Result.Success<R>>
  : 'promiseExit' extends Mode
    ? (value: W) => Promise<Exit.Exit<Result.Result.Success<R>, Result.Result.Failure<R>>>
    : (value: W | ((current: R) => W)) => void

const createAsyncSetter =
  <R, W>(registry: Registry.Registry, atom: Atom.Writable<R, W>, mode: 'promise' | 'promiseExit') =>
  (value: W) => {
    registry.set(atom, value)
    const exit = Effect.runPromiseExit(
      Registry.getResult(registry, atom as Atom.Atom<Result.Result<unknown, unknown>>, {
        suspendOnWaiting: true
      })
    )
    return mode === 'promise' ? exit.then(flattenExit) : exit
  }

const createSyncSetter =
  <R, W>(registry: Registry.Registry, atom: Atom.Writable<R, W>) =>
  (value: W | ((current: R) => W)) =>
    registry.set(atom, typeof value === 'function' ? (value as (current: R) => W)(registry.get(atom)) : value)

const createSetter = <R, W, Mode extends 'value' | 'promise' | 'promiseExit' = never>(
  registry: Registry.Registry,
  atom: Atom.Writable<R, W>,
  options?: SetterOptions<R, Mode>
): SetterFn<R, W, Mode> =>
  (options?.mode === 'promise' || options?.mode === 'promiseExit'
    ? createAsyncSetter(registry, atom, options.mode)
    : createSyncSetter(registry, atom)) as SetterFn<R, W, Mode>

export function useAtomValue<A>(atom: Atom.Atom<A>): () => A
export function useAtomValue<A, B>(atom: Atom.Atom<A>, selector: (value: A) => B): () => B
export function useAtomValue<A, B>(atom: Atom.Atom<A>, selector?: (value: A) => B): () => A | B {
  return selector ? subscribeToAtom(Atom.map(atom, selector)) : subscribeToAtom(atom)
}

export const useAtomMount = (atom: Atom.Atom<unknown>): void => {
  const registry = getRegistry()
  $effect(() => registry.mount(atom))
}

export const useAtomSet = <R, W, Mode extends 'value' | 'promise' | 'promiseExit' = never>(
  atom: Atom.Writable<R, W>,
  options?: SetterOptions<R, Mode>
): SetterFn<R, W, Mode> => {
  useAtomMount(atom)
  return createSetter(getRegistry(), atom, options)
}

export const useAtom = <R, W, Mode extends 'value' | 'promise' | 'promiseExit' = never>(
  atom: Atom.Writable<R, W>,
  options?: SetterOptions<R, Mode>
): {
  readonly value: () => R
  readonly set: SetterFn<R, W, Mode>
} => ({
  value: useAtomValue(atom),
  set: useAtomSet(atom, options)
})

export const useAtomRefresh = (atom: Atom.Atom<unknown>): (() => void) => {
  const registry = getRegistry()
  return () => registry.refresh(atom)
}
