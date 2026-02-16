<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    label: string
    onclick: () => void
    children: Snippet
  }

  let { label, onclick, children }: Props = $props()
</script>

<button
  type="button"
  aria-label={label}
  {onclick}
  class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
>
  {@render children()}
</button>
