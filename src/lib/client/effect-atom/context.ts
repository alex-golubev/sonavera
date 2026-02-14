/**
 * Registry context management using Svelte's context API
 * @module
 */

import { getContext, setContext } from 'svelte'
import type { Registry } from '@effect-atom/atom/Registry'
import { Data, Option } from 'effect'

const REGISTRY_KEY = Symbol('effect-atom-registry')

export class RegistryNotFoundError extends Data.TaggedError('RegistryNotFoundError')<{
  readonly message: string
}> {}

export const makeRegistryNotFoundError = () =>
  new RegistryNotFoundError({
    message: 'Registry not found. Wrap your component tree with RegistryProvider.'
  })

export const setRegistry = (registry: Registry): void => {
  setContext(REGISTRY_KEY, registry)
}

export const tryGetRegistry = (): Option.Option<Registry> =>
  Option.fromNullable(getContext<Registry | undefined>(REGISTRY_KEY))

export const getRegistry = (): Registry =>
  tryGetRegistry().pipe(Option.getOrThrowWith(() => makeRegistryNotFoundError()))
