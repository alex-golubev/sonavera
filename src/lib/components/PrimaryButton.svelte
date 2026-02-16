<script lang="ts">
  import type { Snippet } from 'svelte'
  import Spinner from './Spinner.svelte'

  interface Props {
    type?: 'submit' | 'button'
    disabled?: boolean
    loading?: boolean
    onclick?: () => void
    children: Snippet
  }

  let { type = 'submit', disabled = false, loading = false, onclick, children }: Props = $props()
</script>

<button
  {type}
  disabled={disabled || loading}
  {onclick}
  class="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-50"
>
  {#if loading}
    <Spinner size="sm" />
  {/if}
  {@render children()}
</button>
