<script lang="ts">
  import { languages } from '$lib/features/language/schema'
  import type { Language } from '$lib/features/language/schema'

  interface Props {
    id: string
    label: string
    value: Language
    disabledLanguages?: ReadonlyArray<Language>
  }

  let { id, label, value = $bindable(), disabledLanguages = [] }: Props = $props()
</script>

<div>
  <span id="{id}-label" class="mb-2 block text-sm font-medium text-gray-700">{label}</span>
  <div aria-labelledby="{id}-label" class="grid grid-cols-3 gap-2 sm:grid-cols-4">
    {#each languages as lang (lang.code)}
      {@const selected = value === lang.code}
      {@const disabled = disabledLanguages.includes(lang.code)}
      <button
        type="button"
        {disabled}
        aria-pressed={selected}
        onclick={() => {
          value = lang.code
        }}
        class="flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-center transition-all duration-150
          {disabled ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50' : ''}
          {!disabled && selected
          ? 'border-indigo-500 bg-linear-to-br from-indigo-50 to-fuchsia-50 shadow-sm ring-1 shadow-indigo-100 ring-indigo-400'
          : ''}
          {!disabled && !selected ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50' : ''}"
      >
        <span class="text-sm font-semibold {selected ? 'text-indigo-700' : 'text-gray-800'} leading-tight">
          {lang.nativeName}
        </span>
        <span class="text-[10px] {selected ? 'text-indigo-500' : 'text-gray-400'} leading-tight">
          {lang.name}
        </span>
      </button>
    {/each}
  </div>
</div>
