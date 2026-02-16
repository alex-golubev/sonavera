<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    type?: 'text' | 'email' | 'password'
    label: string
    value: string
    placeholder?: string
    required?: boolean
    minlength?: number
    labelAction?: Snippet
  }

  let { id, type = 'text', label, value = $bindable(), placeholder, required, minlength, labelAction }: Props = $props()
</script>

<div>
  {#if labelAction}
    <div class="mb-1 flex items-center justify-between">
      <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
      {@render labelAction()}
    </div>
  {:else}
    <label for={id} class="mb-1 block text-sm font-medium text-gray-700">{label}</label>
  {/if}
  <input
    {id}
    {type}
    {required}
    {minlength}
    bind:value
    {placeholder}
    class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
  />
</div>
