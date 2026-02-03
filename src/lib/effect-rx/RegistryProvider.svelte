<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import * as Registry from '@effect-rx/rx/Registry'
  import { setRegistry } from './context.js'

  interface Props {
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

  let { registry, children }: Props = $props()

  // Intentionally capture initial value — Registry should be created once
  const resolvedRegistry = untrack(() => registry ?? Registry.make())
  setRegistry(resolvedRegistry)
</script>

{@render children()}
