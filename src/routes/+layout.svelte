<script lang="ts">
  import './layout.css'
  import favicon from '$lib/assets/favicon.svg'
  import { RegistryProvider } from '$lib/effect-rx'

  let { children } = $props()
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<RegistryProvider>
  {@render children()}
</RegistryProvider>
