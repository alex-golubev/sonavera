/**
 * Result<A, E> handling utilities for async Atom values
 * @module
 */

import type { Atom } from '@effect-atom/atom/Atom'
import * as Result from '@effect-atom/atom/Result'
import { Option, pipe } from 'effect'
import { subscribeToAtom } from './hooks.svelte'

export interface AtomResultState<A, E> {
  readonly isInitial: () => boolean
  readonly isLoading: () => boolean
  readonly isSuccess: () => boolean
  readonly isFailure: () => boolean
  readonly value: () => A | undefined
  readonly error: () => E | undefined
  readonly result: () => Result.Result<A, E>
  readonly isRefreshing: () => boolean
  readonly previousValue: () => A | undefined
}

export const useAtomResult = <A, E>(atom: Atom<Result.Result<A, E>>): AtomResultState<A, E> => {
  const result = subscribeToAtom(atom, () => Result.initial() as Result.Result<A, E>)

  return {
    isInitial: () => Result.isInitial(result()),
    isLoading: () => Result.isWaiting(result()),
    isSuccess: () => Result.isSuccess(result()),
    isFailure: () => Result.isFailure(result()),
    value: () => pipe(result(), Result.value, Option.getOrUndefined),
    error: () => pipe(result(), Result.error, Option.getOrUndefined),
    result,
    isRefreshing: () => Result.isWaiting(result()) && pipe(result(), Result.value, Option.isSome),
    previousValue: () =>
      pipe(
        result(),
        Option.liftPredicate(Result.isFailure),
        Option.flatMap((r) => r.previousSuccess),
        Option.map((s) => s.value),
        Option.getOrUndefined
      )
  }
}

export const useAtomResultValue = <A, E>(atom: Atom<Result.Result<A, E>>, fallback: A): (() => A) => {
  const result = subscribeToAtom(atom, () => Result.initial() as Result.Result<A, E>)
  return () =>
    pipe(
      result(),
      Result.getOrElse(() => fallback)
    )
}
