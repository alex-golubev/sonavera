/**
 * Result<A, E> handling utilities for async Rx values
 * @module
 */

import type * as Rx from '@effect-rx/rx/Rx'
import * as Result from '@effect-rx/rx/Result'
import * as Cause from 'effect/Cause'
import { rxValue } from './hooks.svelte.js'

/**
 * State object returned by rxResult
 */
export interface RxResultState<A, E> {
  /** True if the result is in the initial state (not yet started) */
  readonly isInitial: () => boolean
  /** True if the result is loading (waiting for response) */
  readonly isLoading: () => boolean
  /** True if the result is a success */
  readonly isSuccess: () => boolean
  /** True if the result is a failure */
  readonly isFailure: () => boolean
  /** The success value, or undefined if not successful */
  readonly value: () => A | undefined
  /** The error, or undefined if not failed */
  readonly error: () => E | undefined
  /** The raw Result object */
  readonly result: () => Result.Result<A, E>
  /** True if waiting but has a previous success value */
  readonly isRefreshing: () => boolean
  /** Previous success value while refreshing/failed, if available */
  readonly previousValue: () => A | undefined
}

/**
 * Subscribe to Rx that returns a Result<A, E>.
 * Provides convenient accessors for loading, success, and error states.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxResult, rxMount } from '$lib/effect-rx'
 *   import { userDataRx } from './stores'
 *
 *   rxMount(userDataRx)
 *   const user = rxResult(userDataRx)
 * </script>
 *
 * {#if user.isLoading()}
 *   <LoadingSpinner />
 * {:else if user.isSuccess()}
 *   <p>Welcome, {user.value().name}</p>
 * {:else if user.isFailure()}
 *   <ErrorMessage error={user.error()} />
 * {/if}
 * ```
 */
export function rxResult<A, E>(rx: Rx.Rx<Result.Result<A, E>>): RxResultState<A, E> {
  const result = rxValue(rx)

  return {
    isInitial: () => Result.isInitial(result()),
    isLoading: () => result().waiting,
    isSuccess: () => Result.isSuccess(result()),
    isFailure: () => Result.isFailure(result()),

    value: () => Result.value(result()).pipe(optionGetOrUndefined),

    error: () =>
      Result.match(result(), {
        onInitial: () => undefined,
        onSuccess: () => undefined,
        onFailure: (r) => Cause.squash(r.cause) as E
      }),

    result,

    isRefreshing: () =>
      Result.match(result(), {
        onInitial: () => false,
        onSuccess: (r) => r.waiting,
        onFailure: (r) => r.waiting && r.previousSuccess._tag === 'Some'
      }),

    previousValue: () =>
      Result.match(result(), {
        onInitial: () => undefined,
        onSuccess: () => undefined,
        onFailure: (r) => (r.previousSuccess._tag === 'Some' ? r.previousSuccess.value.value : undefined)
      })
  }
}

/**
 * Get the value from a Result Rx, or a fallback while loading/error.
 * Useful when you want to show previous data while refreshing.
 *
 * @example
 * ```svelte
 * <script>
 *   import { rxResultValue } from '$lib/effect-rx'
 *   import { userListRx } from '$lib/stores/users'
 *
 *   const users = rxResultValue(userListRx, [])
 * </script>
 *
 * {#each user() as user}
 *   <UserCard {user} />
 * {/each}
 * ```
 */
export function rxResultValue<A, E>(rx: Rx.Rx<Result.Result<A, E>>, fallback: A): () => A {
  const result = rxValue(rx)

  return () => Result.getOrElse(result(), () => fallback)
}

// Helper to convert Option to value | undefined
function optionGetOrUndefined<A>(option: { _tag: 'Some'; value: A } | { _tag: 'None' }): A | undefined {
  return option._tag === 'Some' ? option.value : undefined
}
