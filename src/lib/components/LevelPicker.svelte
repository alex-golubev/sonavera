<script lang="ts">
  import { levels } from '$lib/features/level/schema'
  import type { Level } from '$lib/features/level/schema'

  interface Props {
    id: string
    label: string
    value: Level
  }

  let { id, label, value = $bindable() }: Props = $props()
</script>

<div>
  <span id="{id}-label" class="mb-2 block text-sm font-medium text-slate-700">{label}</span>
  <div aria-labelledby="{id}-label" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {#each levels as level (level.code)}
      {@const selected = value === level.code}
      <button
        type="button"
        aria-pressed={selected}
        onclick={() => {
          value = level.code
        }}
        class="flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          {selected
          ? 'border-indigo-500 bg-linear-to-br from-indigo-50 to-fuchsia-50 shadow-sm ring-1 shadow-indigo-100 ring-indigo-400'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}"
      >
        <span class="text-sm font-semibold {selected ? 'text-indigo-700' : 'text-slate-900'} leading-tight">
          {level.name}
        </span>
        <span class="text-xs {selected ? 'text-indigo-600/80' : 'text-slate-500'} leading-snug">
          {level.description}
        </span>
      </button>
    {/each}
  </div>
</div>
