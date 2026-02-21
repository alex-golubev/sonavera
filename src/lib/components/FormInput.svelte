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
    disabled?: boolean
    autofocus?: boolean
    labelAction?: Snippet
  }

  let {
    id,
    type = 'text',
    label,
    value = $bindable(),
    placeholder,
    required,
    minlength,
    disabled = false,
    autofocus = false,
    labelAction
  }: Props = $props()

  const autoFocusAction = (node: HTMLInputElement) => {
    if (autofocus) {
      node.focus()
    }
  }
</script>

<div>
  {#if labelAction}
    <div class="mb-1 flex items-center justify-between">
      <label for={id} class="block text-sm font-medium text-slate-700">{label}</label>
      {@render labelAction()}
    </div>
  {:else}
    <label for={id} class="mb-1 block text-sm font-medium text-slate-700">{label}</label>
  {/if}
  <input
    use:autoFocusAction
    {id}
    {type}
    {required}
    {minlength}
    {disabled}
    bind:value
    {placeholder}
    class="w-full rounded-lg border-0 px-3 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200"
  />
</div>
