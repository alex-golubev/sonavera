<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    role: 'assistant' | 'user'
    content?: string
    children?: Snippet
  }

  let { role, content, children }: Props = $props()
</script>

<div
  class="rounded-2xl {role === 'assistant'
    ? 'rounded-tl-none bg-gray-100'
    : 'rounded-tr-none bg-linear-to-r from-indigo-600 to-fuchsia-600'} px-4 py-3"
>
  {#if children}
    {@render children()}
  {:else if content !== undefined}
    <p dir="auto" class="text-sm {role === 'assistant' ? 'text-gray-700' : 'text-white'}">{content}</p>
  {/if}
</div>
