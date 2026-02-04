<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import * as Registry from '@effect-atom/atom/Registry'
  import { setRegistry } from './context'

  interface Props {
    registry?: Registry.Registry
    children: Snippet
  }

  let { registry, children }: Props = $props()

  const resolvedRegistry = untrack(() => registry ?? Registry.make())
  setRegistry(resolvedRegistry)
</script>

{@render children()}
