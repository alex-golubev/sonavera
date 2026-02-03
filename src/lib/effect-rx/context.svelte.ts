/**
 * RegistryProvider component for Svelte 5
 * @module
 */

import type { Snippet } from 'svelte'
import * as Registry from '@effect-rx/rx/Registry'
import { setRegistry } from './context.js'

export interface RegistryProviderProps {
  /**
   * Optional pre-created Registry instance.
   * If not provided, a new Registry will be created.
   */
  registry?: Registry.Registry
  /**
   * Children to render within the Registry context.
   */
  children: Snippet
}

/**
 * Creates and provides a Registry context to all child components.
 *
 * @example
 * ```svelte
 * <script>
 *   import { RegistryProvider } from '$lib/effect-rx'
 *   let { children } = $props()
 * </script>
 *
 * <RegistryProvider>
 *   {@render children()}
 * </RegistryProvider>
 * ```
 */
export function createRegistryProvider(props: RegistryProviderProps): {
  registry: Registry.Registry
  render: () => ReturnType<Snippet>
} {
  const registry = props.registry ?? Registry.make()
  setRegistry(registry)

  return {
    registry,
    render: () => props.children()
  }
}
