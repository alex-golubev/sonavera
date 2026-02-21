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
  class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
>
  {@render children()}
</button>
