/**
 * Registry context management using Svelte's context API
 * @module
 */

import { getContext, setContext } from 'svelte'
import type * as Registry from '@effect-rx/rx/Registry'
import { Option } from 'effect'

const REGISTRY_KEY = Symbol('effect-rx-registry')

/**
 * Set the Registry in a Svelte context.
 * Call this in a parent component to provide Registry to all descendants.
 */
export const setRegistry = (registry: Registry.Registry): void => {
  setContext(REGISTRY_KEY, registry)
}

/**
 * Get the Registry from the Svelte context.
 * Must be called within a component that has a RegistryProvider ancestor.
 * @throws Error if Registry is not found in context
 */
export const getRegistry = (): Registry.Registry =>
  Option.fromNullable(getContext<Registry.Registry | undefined>(REGISTRY_KEY)).pipe(
    Option.getOrThrowWith(() => new Error('Registry not found. Wrap your component tree with RegistryProvider.'))
  )

/**
 * Try to get the Registry from a Svelte context.
 * Returns Option<Registry> for safe access.
 */
export const tryGetRegistry = (): Option.Option<Registry.Registry> =>
  Option.fromNullable(getContext<Registry.Registry | undefined>(REGISTRY_KEY))
